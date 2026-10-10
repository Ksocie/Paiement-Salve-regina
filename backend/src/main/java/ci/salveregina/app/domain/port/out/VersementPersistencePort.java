package ci.salveregina.app.domain.port.out;

import ci.salveregina.app.domain.model.MotifVersement;
import ci.salveregina.app.domain.model.Pupitre;
import ci.salveregina.app.domain.model.StatistiquesVersement;
import ci.salveregina.app.domain.model.StatutVersement;
import ci.salveregina.app.domain.model.Versement;

import java.util.List;
import java.util.Optional;

/**
 * Port sortant pour la persistance des versements.
 * Respecte le principe d'inversion des dépendances (DIP).
 */
public interface VersementPersistencePort {

    Versement sauvegarder(Versement versement);

    Optional<Versement> trouverParReference(String reference);

    Optional<Versement> trouverParReferencePasserelle(String referencePasserelle);

    List<Versement> rechercher(Pupitre pupitre, MotifVersement motif, StatutVersement statut);

    List<Versement> rechercher(Pupitre pupitre, MotifVersement motif, StatutVersement statut, Integer annee, java.time.Instant dateDebut, java.time.Instant dateFin);

    int annulerVersementsExpires(java.time.Instant dateLimite);

    StatistiquesVersement calculerStatistiques();
}
