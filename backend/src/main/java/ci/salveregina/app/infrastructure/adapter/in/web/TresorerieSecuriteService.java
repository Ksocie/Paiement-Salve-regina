package ci.salveregina.app.infrastructure.adapter.in.web;

import ci.salveregina.app.infrastructure.adapter.out.persistence.entity.ParametreSecuriteEntity;
import ci.salveregina.app.infrastructure.adapter.out.persistence.repository.ParametreSecuriteJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Service de gestion sécurisée du code PIN de la trésorerie persisté en base de données PostgreSQL.
 */
@Service
public class TresorerieSecuriteService {

    private static final Logger log = LoggerFactory.getLogger(TresorerieSecuriteService.class);
    private static final String CLE_PIN = "TRESORERIE_PIN";

    private final ParametreSecuriteJpaRepository parametreRepo;
    private final String defaultPin;

    public TresorerieSecuriteService(
            ParametreSecuriteJpaRepository parametreRepo,
            @Value("${app.tresorerie.pin:202620}") String defaultPin
    ) {
        this.parametreRepo = parametreRepo;
        this.defaultPin = defaultPin;
    }

    /**
     * Retourne le code PIN actuel depuis PostgreSQL (ou la valeur par défaut si non encore initialisé).
     */
    public String obtenirPinActuel() {
        return parametreRepo.findById(CLE_PIN)
                .map(ParametreSecuriteEntity::getValeur)
                .orElse(defaultPin != null && !defaultPin.isBlank() ? defaultPin.trim() : "202620");
    }

    /**
     * Vérifie si le code PIN fourni correspond au code enregistré en base de données.
     */
    public boolean verifierPin(String pinATester) {
        if (pinATester == null || pinATester.isBlank()) {
            return false;
        }
        return obtenirPinActuel().equals(pinATester.trim());
    }

    /**
     * Met à jour le code PIN dans la base de données PostgreSQL après vérification de l'ancien code.
     */
    @Transactional
    public void modifierPin(String ancienPin, String nouveauPin) {
        if (!verifierPin(ancienPin)) {
            throw new IllegalArgumentException("L'ancien code PIN est incorrect.");
        }
        if (nouveauPin == null || nouveauPin.trim().length() < 4) {
            throw new IllegalArgumentException("Le nouveau code PIN doit comporter au moins 4 chiffres.");
        }

        String pinPropre = nouveauPin.trim();
        ParametreSecuriteEntity entity = ParametreSecuriteEntity.builder()
                .cle(CLE_PIN)
                .valeur(pinPropre)
                .dateModification(Instant.now())
                .build();
        parametreRepo.save(entity);
        log.info("Code PIN Trésorerie mis à jour en base de données avec succès.");
    }
}
