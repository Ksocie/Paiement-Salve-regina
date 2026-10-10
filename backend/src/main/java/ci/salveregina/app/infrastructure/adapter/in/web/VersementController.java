package ci.salveregina.app.infrastructure.adapter.in.web;

import ci.salveregina.app.domain.model.MotifVersement;
import ci.salveregina.app.domain.model.Pupitre;
import ci.salveregina.app.domain.model.StatutVersement;
import ci.salveregina.app.domain.model.Versement;
import ci.salveregina.app.domain.port.in.ConsulterVersementUseCase;
import ci.salveregina.app.domain.port.in.EnregistrerVersementUseCase;
import ci.salveregina.app.domain.port.in.SynchroniserPaiementUseCase;
import ci.salveregina.app.infrastructure.adapter.in.web.dto.CreerVersementDto;
import ci.salveregina.app.infrastructure.adapter.in.web.dto.StatistiquesDto;
import ci.salveregina.app.infrastructure.adapter.in.web.dto.VersementDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST principal pour la gestion des versements, cotisations et dons de la Chorale Salve Regina.
 */
@Tag(name = "Versements & Cotisations", description = "Endpoints d'initiation, suivi et transparence financière")
@RestController
@RequestMapping("/api/versements")
public class VersementController {

    private final EnregistrerVersementUseCase enregistrerUseCase;
    private final ConsulterVersementUseCase consulterUseCase;
    private final SynchroniserPaiementUseCase synchroniserUseCase;
    private final TresorerieSecuriteService tresorerieSecuriteService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public VersementController(
            EnregistrerVersementUseCase enregistrerUseCase,
            ConsulterVersementUseCase consulterUseCase,
            SynchroniserPaiementUseCase synchroniserUseCase,
            TresorerieSecuriteService tresorerieSecuriteService,
            org.springframework.jdbc.core.JdbcTemplate jdbcTemplate
    ) {
        this.enregistrerUseCase = enregistrerUseCase;
        this.consulterUseCase = consulterUseCase;
        this.synchroniserUseCase = synchroniserUseCase;
        this.tresorerieSecuriteService = tresorerieSecuriteService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Operation(summary = "Purger les transactions de test (Réservé au Bureau avec code PIN)")
    @PostMapping("/tresorerie/purger-tests")
    public ResponseEntity<Map<String, Object>> purgerVersementsTests(
            @RequestHeader(value = "X-Tresorerie-PIN", required = false) String pin
    ) {
        if (!estPinValide(pin)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erreur", "Accès refusé", "message", "Code PIN de trésorerie requis"));
        }
        int supprimes = jdbcTemplate.update("DELETE FROM versements WHERE telephone = '0700000000' OR nom_donateur ILIKE '%test%' OR date_creation < '2026-10-10 06:15:00'");
        return ResponseEntity.ok(Map.of("succes", true, "message", supprimes + " versements de test purgés avec succès."));
    }

    @Operation(summary = "Vérifier le code PIN de l'espace Trésorerie", description = "Valide le code PIN secret (stocké en base de données) pour accéder aux listes financières.")
    @PostMapping("/tresorerie/authentifier")
    public ResponseEntity<Map<String, Object>> authentifierTresorerie(@RequestBody Map<String, String> body) {
        String pin = body != null ? body.get("pin") : null;
        if (tresorerieSecuriteService.verifierPin(pin)) {
            return ResponseEntity.ok(Map.of("valide", true, "message", "Accès Trésorerie autorisé"));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valide", false, "message", "Code PIN incorrect"));
    }

    @Operation(summary = "Modifier le code PIN de la trésorerie en base de données")
    @PostMapping("/tresorerie/changer-pin")
    public ResponseEntity<Map<String, Object>> changerPin(@RequestBody Map<String, String> body) {
        String ancienPin = body != null ? body.get("ancienPin") : null;
        String nouveauPin = body != null ? body.get("nouveauPin") : null;
        try {
            tresorerieSecuriteService.modifierPin(ancienPin, nouveauPin);
            return ResponseEntity.ok(Map.of("succes", true, "message", "Code PIN modifié avec succès"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("succes", false, "message", e.getMessage()));
        }
    }

    @Operation(summary = "Initier une offrande ou cotisation", description = "Crée un versement et génère l'URL de paiement instantané Mobile Money.")
    @PostMapping
    public ResponseEntity<VersementDto> creerVersement(@Valid @RequestBody CreerVersementDto dto) {
        Versement versement = enregistrerUseCase.enregistrerEtInitierPaiement(dto.versCommande());
        return ResponseEntity.status(HttpStatus.CREATED).body(VersementDto.depuisDomaine(versement));
    }

    @Operation(summary = "Consulter un versement par référence", description = "Retourne le détail d'un versement avec son état et son reçu.")
    @GetMapping("/{reference}")
    public ResponseEntity<VersementDto> obtenirParReference(@PathVariable String reference) {
        Versement versement = consulterUseCase.obtenirParReference(reference);
        return ResponseEntity.ok(VersementDto.depuisDomaine(versement));
    }

    @Operation(summary = "Lister les versements (Registre public des cotisations et dons)")
    @GetMapping
    public ResponseEntity<?> listerVersements(
            @RequestParam(required = false) Pupitre pupitre,
            @RequestParam(required = false) MotifVersement motif,
            @RequestParam(required = false) StatutVersement statut,
            @RequestParam(required = false) Integer annee,
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin
    ) {
        java.time.Instant debutInstant = null;
        java.time.Instant finInstant = null;
        if (dateDebut != null && !dateDebut.isBlank()) {
            try {
                debutInstant = java.time.LocalDate.parse(dateDebut.trim())
                        .atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();
            } catch (Exception ignored) {}
        }
        if (dateFin != null && !dateFin.isBlank()) {
            try {
                finInstant = java.time.LocalDate.parse(dateFin.trim())
                        .atTime(23, 59, 59, 999_999_999)
                        .atZone(java.time.ZoneId.systemDefault()).toInstant();
            } catch (Exception ignored) {}
        }

        List<VersementDto> list = consulterUseCase.listerVersements(pupitre, motif, statut, annee, debutInstant, finInstant)
                .stream()
                .map(VersementDto::depuisDomaine)
                .toList();
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "Obtenir les statistiques financières (Réservé au Bureau avec code PIN)")
    @GetMapping("/transparence")
    public ResponseEntity<?> obtenirStatistiques(
            @RequestHeader(value = "X-Tresorerie-PIN", required = false) String pin
    ) {
        if (!estPinValide(pin)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erreur", "Accès refusé", "message", "Code PIN de trésorerie requis"));
        }
        return ResponseEntity.ok(StatistiquesDto.depuisDomaine(consulterUseCase.obtenirStatistiques()));
    }

    private boolean estPinValide(String pin) {
        return this.tresorerieSecuriteService.verifierPin(pin);
    }

    @Operation(summary = "Vérifier le statut du paiement auprès de la passerelle")
    @PostMapping("/{reference}/verifier")
    public ResponseEntity<VersementDto> verifierStatut(@PathVariable String reference) {
        Versement versement = synchroniserUseCase.verifierEtMettreAJour(reference);
        return ResponseEntity.ok(VersementDto.depuisDomaine(versement));
    }

    @Operation(summary = "Webhook de notification instantanée GeniusPay")
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> webhookGeniusPay(
            @RequestHeader(value = "X-GeniusPay-Signature", required = false) String signature,
            @RequestBody String rawPayload
    ) {
        synchroniserUseCase.traiterWebhookGeniusPay(signature, rawPayload);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Webhook traité avec succès"));
    }
}
