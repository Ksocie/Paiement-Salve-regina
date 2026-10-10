package ci.salveregina.app.domain.port.in;

import ci.salveregina.app.domain.model.MotifVersement;
import ci.salveregina.app.domain.model.Pupitre;
import ci.salveregina.app.domain.model.StatistiquesVersement;
import ci.salveregina.app.domain.model.StatutVersement;
import ci.salveregina.app.domain.model.Versement;

import java.util.List;

/**
 * Port d'entrée pour la consultation des versements et des statistiques de transparence.
 * Respecte le principe ISP.
 */
public interface ConsulterVersementUseCase {

    Versement obtenirParReference(String reference);

    List<Versement> listerVersements(Pupitre pupitre, MotifVersement motif, StatutVersement statut);

    StatistiquesVersement obtenirStatistiques();
}
