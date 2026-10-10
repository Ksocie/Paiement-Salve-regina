package ci.salveregina.app.infrastructure.adapter.in.web.dto;

import ci.salveregina.app.domain.model.MotifVersement;
import ci.salveregina.app.domain.model.OperateurPaiement;
import ci.salveregina.app.domain.model.Pupitre;
import ci.salveregina.app.domain.port.in.EnregistrerVersementUseCase.CommandeNouveauVersement;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreerVersementDto(
        @NotBlank(message = "Le nom du donateur ou choriste est obligatoire")
        @Size(min = 2, max = 120, message = "Le nom doit contenir entre 2 et 120 caractères")
        String nomDonateur,

        @NotBlank(message = "Le numéro Mobile Money ou WhatsApp est obligatoire")
        @Size(min = 8, max = 20, message = "Numéro de téléphone invalide")
        String telephone,

        String email,

        Pupitre pupitre,

        MotifVersement motif,

        Integer annee,

        String campagne,

        @NotNull(message = "Le montant est obligatoire")
        @DecimalMin(value = "200", message = "Le montant minimum est de 200 FCFA pour Mobile Money")
        BigDecimal montant,

        OperateurPaiement operateur,

        String commentaire
) {
    public CommandeNouveauVersement versCommande() {
        return new CommandeNouveauVersement(
                nomDonateur,
                telephone,
                email,
                pupitre != null ? pupitre : Pupitre.AUTRE,
                motif != null ? motif : MotifVersement.COTISATION,
                annee != null ? annee : 2026,
                campagne,
                montant,
                operateur != null ? operateur : OperateurPaiement.WAVE,
                commentaire
        );
    }
}
