package ci.salveregina.app.domain.port.in;

import ci.salveregina.app.domain.model.MotifVersement;
import ci.salveregina.app.domain.model.OperateurPaiement;
import ci.salveregina.app.domain.model.Pupitre;
import ci.salveregina.app.domain.model.Versement;

import java.math.BigDecimal;

/**
 * Port d'entrée pour la création et l'initiation de versements / cotisations.
 * Respecte le principe de ségrégation des interfaces (ISP).
 */
public interface EnregistrerVersementUseCase {

    record CommandeNouveauVersement(
            String nomDonateur,
            String telephone,
            String email,
            Pupitre pupitre,
            MotifVersement motif,
            Integer annee,
            String campagne,
            BigDecimal montant,
            OperateurPaiement operateur,
            String commentaire
    ) {
        public CommandeNouveauVersement(
                String nomDonateur,
                String telephone,
                String email,
                Pupitre pupitre,
                MotifVersement motif,
                BigDecimal montant,
                OperateurPaiement operateur,
                String commentaire
        ) {
            this(nomDonateur, telephone, email, pupitre, motif, 2026, null, montant, operateur, commentaire);
        }
    }

    Versement enregistrerEtInitierPaiement(CommandeNouveauVersement commande);
}
