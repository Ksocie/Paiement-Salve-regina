package ci.salveregina.app.domain.model;

import java.math.BigDecimal;

/**
 * Informations de session retournées lors de l'initiation d'un paiement en ligne.
 */
public record SessionPaiement(
        String referencePasserelle,
        String urlPaiement,
        String idTransaction,
        BigDecimal frais,
        String fournisseur,
        String statutInitial
) {
}
