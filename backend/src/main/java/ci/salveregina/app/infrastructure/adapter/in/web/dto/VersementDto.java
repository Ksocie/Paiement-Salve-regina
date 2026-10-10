package ci.salveregina.app.infrastructure.adapter.in.web.dto;

import ci.salveregina.app.domain.model.Versement;

import java.math.BigDecimal;
import java.time.Instant;

public record VersementDto(
        Long id,
        String reference,
        String nomDonateur,
        String telephone,
        String email,
        String pupitre,
        String pupitreLibelle,
        String motif,
        String motifLibelle,
        BigDecimal montant,
        String operateur,
        String operateurLibelle,
        String statut,
        String statutLibelle,
        String referencePasserelle,
        String urlPaiement,
        Instant dateCreation,
        Instant dateValidation,
        String commentaire
) {
    public static VersementDto depuisDomaine(Versement dom) {
        return new VersementDto(
                dom.getId(),
                dom.getReference(),
                dom.getNomDonateur(),
                dom.getTelephone(),
                dom.getEmail(),
                dom.getPupitre().name(),
                dom.getPupitre().getLibelle(),
                dom.getMotif().name(),
                dom.getMotif().getLibelle(),
                dom.getMontant(),
                dom.getOperateur().name(),
                dom.getOperateur().getNomAffiche(),
                dom.getStatut().name(),
                dom.getStatut().getLibelle(),
                dom.getReferencePasserelle(),
                dom.getUrlPaiement(),
                dom.getDateCreation(),
                dom.getDateValidation(),
                dom.getCommentaire()
        );
    }
}
