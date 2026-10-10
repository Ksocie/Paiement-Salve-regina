package ci.salveregina.app.domain.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Modèle de statistiques financières pour l'écran de Transparence et de Suivi.
 */
public record StatistiquesVersement(
        BigDecimal totalCollecte,
        long nombreTotalVersements,
        long nombreVersementsValides,
        Map<Pupitre, BigDecimal> totalParPupitre,
        Map<MotifVersement, BigDecimal> totalParMotif,
        Map<OperateurPaiement, BigDecimal> totalParOperateur,
        List<Versement> derniersVersements
) {
}
