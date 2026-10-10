package ci.salveregina.app.application.service;

import ci.salveregina.app.domain.exception.MetierException;
import ci.salveregina.app.domain.exception.RessourceIntrouvableException;
import ci.salveregina.app.domain.model.MotifVersement;
import ci.salveregina.app.domain.model.Pupitre;
import ci.salveregina.app.domain.model.SessionPaiement;
import ci.salveregina.app.domain.model.StatistiquesVersement;
import ci.salveregina.app.domain.model.StatutVersement;
import ci.salveregina.app.domain.model.Versement;
import ci.salveregina.app.domain.port.in.ConsulterVersementUseCase;
import ci.salveregina.app.domain.port.in.EnregistrerVersementUseCase;
import ci.salveregina.app.domain.port.in.SynchroniserPaiementUseCase;
import ci.salveregina.app.domain.port.out.PasserellePaiementPort;
import ci.salveregina.app.domain.port.out.VersementPersistencePort;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.Year;
import java.util.List;
import java.util.Optional;

/**
 * Service applicatif orchestrant les cas d'utilisation liés aux versements.
 * Conforme aux principes SOLID (SRP, DIP).
 */
@Service
@Transactional
public class VersementService implements
        EnregistrerVersementUseCase,
        ConsulterVersementUseCase,
        SynchroniserPaiementUseCase {

    private static final Logger log = LoggerFactory.getLogger(VersementService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final VersementPersistencePort persistencePort;
    private final PasserellePaiementPort passerellePaiementPort;
    private final ObjectMapper objectMapper;

    public VersementService(
            VersementPersistencePort persistencePort,
            PasserellePaiementPort passerellePaiementPort,
            ObjectMapper objectMapper
    ) {
        this.persistencePort = persistencePort;
        this.passerellePaiementPort = passerellePaiementPort;
        this.objectMapper = objectMapper;
    }

    @Override
    public Versement enregistrerEtInitierPaiement(CommandeNouveauVersement commande) {
        log.info("Réception demande versement pour {} - Montant: {} FCFA ({})",
                commande.nomDonateur(), commande.montant(), commande.motif());

        String reference = genererReferenceUnique();

        Versement versement = Versement.builder()
                .reference(reference)
                .nomDonateur(commande.nomDonateur())
                .telephone(nettoyerTelephone(commande.telephone()))
                .email(commande.email())
                .pupitre(commande.pupitre())
                .motif(commande.motif())
                .montant(commande.montant())
                .operateur(commande.operateur())
                .statut(StatutVersement.EN_ATTENTE)
                .dateCreation(Instant.now())
                .commentaire(commande.commentaire())
                .build();

        // 1. Sauvegarder d'abord l'entité en base (statut EN_ATTENTE)
        versement = persistencePort.sauvegarder(versement);

        // 2. Initier la transaction auprès de la passerelle de paiement (GeniusPay)
        try {
            SessionPaiement session = passerellePaiementPort.initierPaiement(versement);
            versement.lierSessionPaiement(session.referencePasserelle(), session.urlPaiement());
            versement = persistencePort.sauvegarder(versement);
            log.info("Paiement initié avec succès: ref={}, urlPaiement={}",
                    versement.getReference(), versement.getUrlPaiement());
        } catch (ci.salveregina.app.domain.exception.PaiementException pe) {
            log.error("Échec de la passerelle de paiement: {}", pe.getMessage());
            versement.marquerCommeEchoue();
            persistencePort.sauvegarder(versement);
            throw pe;
        } catch (Exception e) {
            log.error("Échec inattendu lors de l'appel à la passerelle de paiement: {}", e.getMessage(), e);
            versement.marquerCommeEchoue();
            persistencePort.sauvegarder(versement);
            throw new ci.salveregina.app.domain.exception.PaiementException(e.getMessage());
        }

        return versement;
    }

    @Override
    @Transactional(readOnly = true)
    public Versement obtenirParReference(String reference) {
        return persistencePort.trouverParReference(reference)
                .orElseThrow(() -> new RessourceIntrouvableException("Versement introuvable avec la référence: " + reference));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Versement> listerVersements(Pupitre pupitre, MotifVersement motif, StatutVersement statut) {
        return persistencePort.rechercher(pupitre, motif, statut);
    }

    @Override
    @Transactional(readOnly = true)
    public StatistiquesVersement obtenirStatistiques() {
        return persistencePort.calculerStatistiques();
    }

    @Override
    public Versement verifierEtMettreAJour(String reference) {
        Versement versement = obtenirParReference(reference);
        if (versement.estPaye()) {
            return versement;
        }

        if (versement.getReferencePasserelle() != null) {
            Optional<String> statutPasserelle = passerellePaiementPort.verifierStatutPaiement(versement.getReferencePasserelle());
            if (statutPasserelle.isPresent()) {
                appliquerMiseAJourStatut(versement, statutPasserelle.get());
                versement = persistencePort.sauvegarder(versement);
            }
        }
        return versement;
    }

    @Override
    public void traiterWebhookGeniusPay(String signature, String payloadBrut) {
        log.info("Réception webhook GeniusPay");
        if (!passerellePaiementPort.verifierSignatureWebhook(signature, payloadBrut)) {
            log.warn("Rejet du webhook: signature invalide.");
            throw new MetierException("Signature webhook invalide");
        }

        try {
            JsonNode root = objectMapper.readTree(payloadBrut);
            String event = root.path("event").asText("");
            JsonNode data = root.path("data");
            String referencePasserelle = data.path("reference").asText("");
            String statutGenius = data.path("status").asText("");

            if (referencePasserelle.isBlank()) {
                referencePasserelle = root.path("reference").asText("");
            }

            log.info("Webhook décodé - Event: {}, Ref: {}, Status: {}", event, referencePasserelle, statutGenius);

            Optional<Versement> optVersement = persistencePort.trouverParReferencePasserelle(referencePasserelle);
            if (optVersement.isPresent()) {
                Versement versement = optVersement.get();
                appliquerMiseAJourStatut(versement, statutGenius);
                persistencePort.sauvegarder(versement);
                log.info("Versement {} mis à jour suite au webhook GeniusPay: statut={}",
                        versement.getReference(), versement.getStatut());
            } else {
                log.warn("Aucun versement trouvé pour la référence passerelle: {}", referencePasserelle);
            }
        } catch (Exception e) {
            log.error("Erreur lors du traitement du webhook: {}", e.getMessage(), e);
            throw new MetierException("Erreur de traitement webhook: " + e.getMessage(), e);
        }
    }

    private void appliquerMiseAJourStatut(Versement versement, String statutPasserelle) {
        String s = statutPasserelle.toLowerCase().trim();
        if (s.contains("success") || s.contains("completed") || s.contains("paid") || s.contains("valide")) {
            versement.marquerCommePaye();
        } else if (s.contains("fail") || s.contains("declined") || s.contains("echoue")) {
            versement.marquerCommeEchoue();
        } else if (s.contains("cancel") || s.contains("annule")) {
            versement.marquerCommeAnnule();
        }
    }

    private String genererReferenceUnique() {
        int annee = Year.now().getValue();
        int nombreAleatoire = 100000 + RANDOM.nextInt(900000);
        return String.format("CSR-%d-%d", annee, nombreAleatoire);
    }

    private String nettoyerTelephone(String telephone) {
        if (telephone == null) return "";
        return telephone.replaceAll("\\s+", "").trim();
    }
}
