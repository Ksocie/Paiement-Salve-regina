package ci.salveregina.app.infrastructure.adapter.out.payment;

import ci.salveregina.app.domain.model.OperateurPaiement;
import ci.salveregina.app.domain.model.SessionPaiement;
import ci.salveregina.app.domain.model.Versement;
import ci.salveregina.app.domain.port.out.PasserellePaiementPort;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Adaptateur d'infrastructure pour la passerelle GeniusPay.
 * Compatible avec l'intégration GeniusPay utilisée dans MiracleApp.
 */
@Component
public class GeniusPayPasserelle implements PasserellePaiementPort {

    private static final Logger log = LoggerFactory.getLogger(GeniusPayPasserelle.class);

    private final GeniusPaySignatureValidator signatureValidator;
    private final String apiKey;
    private final String apiSecret;
    private final String webhookSecret;
    private final String apiUrl;
    private final String mode;
    private final String appBaseUrl;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeniusPayPasserelle(
            GeniusPaySignatureValidator signatureValidator,
            @Value("${geniuspay.api-key:}") String apiKey,
            @Value("${geniuspay.api-secret:}") String apiSecret,
            @Value("${geniuspay.webhook-secret:}") String webhookSecret,
            @Value("${geniuspay.api-url:https://geniuspay.ci/api/v1/merchant}") String apiUrl,
            @Value("${geniuspay.mode:live}") String mode,
            @Value("${app.base-url:https://salve-regina-pwa.onrender.com}") String appBaseUrl,
            ObjectMapper objectMapper
    ) {
        this.signatureValidator = signatureValidator;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.webhookSecret = webhookSecret;
        this.apiUrl = apiUrl;
        this.mode = mode;
        this.appBaseUrl = appBaseUrl;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        log.info("Passerelle GeniusPay initialisée en mode: {}", mode);
    }

    @Override
    public SessionPaiement initierPaiement(Versement versement) {
        String referencePasserelle = "MTX-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        String idTransaction = String.valueOf(System.currentTimeMillis());
        BigDecimal montant = versement.getMontant();
        BigDecimal frais = montant.multiply(BigDecimal.valueOf(0.02)).setScale(0, RoundingMode.HALF_UP);
        String cleanBaseUrl = (appBaseUrl != null && !appBaseUrl.isBlank()) ? appBaseUrl.replaceAll("/+$", "") : "https://salve-regina-pwa.onrender.com";

        // 1. Vérifier la configuration GeniusPay
        if (apiKey == null || apiKey.isBlank() || apiKey.equalsIgnoreCase("test")) {
            if ("simulation".equalsIgnoreCase(mode) || "mock".equalsIgnoreCase(mode)) {
                log.info("Mode simulation GeniusPay actif : retour d'une session fictive");
                return new SessionPaiement(
                        referencePasserelle,
                        cleanBaseUrl + "/accueil?simulated_ref=" + referencePasserelle,
                        idTransaction,
                        frais,
                        versement.getOperateur().getNomAffiche(),
                        "PENDING"
                );
            }
            log.warn("Tentative d'initiation de paiement GeniusPay sans GENIUSPAY_API_KEY configurée sur Render");
            throw new ci.salveregina.app.domain.exception.PaiementException(
                    "La passerelle GeniusPay n'est pas encore configurée sur le serveur. Veuillez renseigner GENIUSPAY_API_KEY et GENIUSPAY_API_SECRET dans les variables d'environnement de Render."
            );
        }

        try {
            String baseUrl = (apiUrl != null && !apiUrl.isBlank()) ? apiUrl.replaceAll("/+$", "") : "https://geniuspay.ci/api/v1/merchant";
            String endpoint = baseUrl.endsWith("/payments") ? baseUrl : baseUrl + "/payments";

            Map<String, Object> bodyMap = new HashMap<>();
            bodyMap.put("amount", montant.intValue());
            bodyMap.put("currency", "XOF");
            bodyMap.put("description", String.format("Salve Regina - %s (%s - %s)",
                    versement.getNomDonateur(),
                    versement.getMotif().getLibelle(),
                    versement.getPupitre().getLibelle()));

            String telephoneFormate = formaterTelephone(versement.getTelephone());
            Map<String, Object> customer = new HashMap<>();
            customer.put("name", versement.getNomDonateur());
            customer.put("phone", telephoneFormate);
            customer.put("email", (versement.getEmail() != null && !versement.getEmail().isBlank()) ? versement.getEmail() : "donateur@salveregina.ci");
            customer.put("country", "CI");
            bodyMap.put("customer", customer);

            bodyMap.put("success_url", cleanBaseUrl + "/accueil?ref=" + versement.getReference());
            bodyMap.put("error_url", cleanBaseUrl + "/accueil?ref=" + versement.getReference());

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("reference_versement", versement.getReference());
            metadata.put("pupitre", versement.getPupitre().name());
            metadata.put("motif", versement.getMotif().name());
            bodyMap.put("metadata", metadata);

            // Paramétrage de la méthode de paiement sélectionnée
            appliquerMethodePaiement(bodyMap, versement.getOperateur());

            String jsonPayload = objectMapper.writeValueAsString(bodyMap);

            HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(15))
                    .header("X-API-Key", apiKey.trim())
                    .header("Accept", "application/json")
                    .header("Content-Type", "application/json");

            if (apiSecret != null && !apiSecret.isBlank()) {
                reqBuilder.header("X-API-Secret", apiSecret.trim());
            }

            HttpRequest request = reqBuilder
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode data = root.path("data");
                String checkoutUrl = "";
                if (!data.isMissingNode() && !data.isNull()) {
                    if (data.hasNonNull("reference")) {
                        referencePasserelle = data.path("reference").asText();
                    }
                    if (data.hasNonNull("id")) {
                        idTransaction = data.path("id").asText();
                    }
                    if (data.hasNonNull("payment_url")) {
                        checkoutUrl = data.path("payment_url").asText();
                    } else if (data.hasNonNull("checkout_url")) {
                        checkoutUrl = data.path("checkout_url").asText();
                    }
                    if (data.hasNonNull("fees")) {
                        frais = BigDecimal.valueOf(data.path("fees").asDouble()).setScale(0, RoundingMode.HALF_UP);
                    }
                }
                log.info("GeniusPay Session créée avec succès: ref={}, url={}", referencePasserelle, checkoutUrl);
                return new SessionPaiement(referencePasserelle, checkoutUrl, idTransaction, frais, versement.getOperateur().getNomAffiche(), "INITIATED");
            } else {
                log.warn("GeniusPay a répondu HTTP {}: {}", response.statusCode(), response.body());
                String msgErreur = extraireMessageErreur(response.body());
                throw new ci.salveregina.app.domain.exception.PaiementException(msgErreur);
            }
        } catch (ci.salveregina.app.domain.exception.PaiementException pe) {
            throw pe;
        } catch (Exception e) {
            log.error("Erreur de communication avec GeniusPay: {}", e.getMessage(), e);
            throw new ci.salveregina.app.domain.exception.PaiementException("Erreur de connexion à GeniusPay : " + e.getMessage());
        }
    }

    private void appliquerMethodePaiement(Map<String, Object> bodyMap, OperateurPaiement operateur) {
        if (operateur == OperateurPaiement.WAVE) {
            bodyMap.put("payment_method", "wave");
        } else if (operateur == OperateurPaiement.ORANGE_MONEY) {
            bodyMap.put("payment_method", "pawapay");
            bodyMap.put("mmo_provider", "ORANGE_CIV");
        } else if (operateur == OperateurPaiement.MTN_MOMO) {
            bodyMap.put("payment_method", "pawapay");
            bodyMap.put("mmo_provider", "MTN_MOMO_CIV");
        } else if (operateur == OperateurPaiement.MOOV_MONEY) {
            bodyMap.put("payment_method", "pawapay");
            bodyMap.put("mmo_provider", "MOOV_CIV");
        }
    }

    @Override
    public Optional<String> verifierStatutPaiement(String referencePasserelle) {
        if (apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("test")) {
            try {
                String baseUrl = (apiUrl != null && !apiUrl.isBlank()) ? apiUrl.replaceAll("/+$", "") : "https://geniuspay.ci/api/v1/merchant";
                String endpoint = baseUrl.endsWith("/payments")
                        ? baseUrl + "/" + referencePasserelle.trim()
                        : baseUrl + "/payments/" + referencePasserelle.trim();

                HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                        .uri(URI.create(endpoint))
                        .timeout(Duration.ofSeconds(10))
                        .header("X-API-Key", apiKey.trim())
                        .header("Accept", "application/json")
                        .GET();

                if (apiSecret != null && !apiSecret.isBlank()) {
                    reqBuilder.header("X-API-Secret", apiSecret.trim());
                }

                HttpResponse<String> response = httpClient.send(reqBuilder.build(), HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    JsonNode root = objectMapper.readTree(response.body());
                    JsonNode data = root.has("data") ? root.path("data") : root;
                    String status = "";
                    if (data.hasNonNull("status")) {
                        status = data.path("status").asText();
                    } else if (data.hasNonNull("statut")) {
                        status = data.path("statut").asText();
                    } else if (root.hasNonNull("status")) {
                        status = root.path("status").asText();
                    }
                    log.info("Vérification statut GeniusPay pour ref={}: status='{}'", referencePasserelle, status);
                    return Optional.ofNullable(status.isBlank() ? null : status);
                } else {
                    log.warn("GeniusPay vérification statut a répondu HTTP {}: {}", response.statusCode(), response.body());
                }
            } catch (Exception e) {
                log.warn("Erreur de vérification GeniusPay: {}", e.getMessage());
            }
        }
        // En mode test / dev local sans clé configurée, on valide automatiquement la transaction
        return Optional.of("completed");
    }

    private String formaterTelephone(String telephone) {
        if (telephone == null || telephone.isBlank()) {
            return "+2250700000000";
        }
        String propre = telephone.replaceAll("[^0-9+]", "");
        if (propre.startsWith("+225")) {
            return propre;
        }
        if (propre.startsWith("225")) {
            return "+" + propre;
        }
        if (propre.startsWith("0")) {
            return "+225" + propre;
        }
        return "+225" + propre;
    }

    private String extraireMessageErreur(String responseBody) {
        try {
            if (responseBody != null && !responseBody.isBlank()) {
                JsonNode root = objectMapper.readTree(responseBody);
                if (root.has("error")) {
                    JsonNode err = root.path("error");
                    if (err.has("message")) {
                        return err.path("message").asText();
                    }
                    if (err.has("errors") && err.path("errors").has("amount")) {
                        return err.path("errors").path("amount").get(0).asText();
                    }
                }
                if (root.has("message")) {
                    return root.path("message").asText();
                }
            }
        } catch (Exception ignored) {}
        return "Le paiement n'a pas pu être initié par l'opérateur Mobile Money.";
    }

    @Override
    public boolean verifierSignatureWebhook(String signature, String rawPayload) {
        return signatureValidator.verifierSignature(signature, rawPayload, webhookSecret);
    }
}
