package ci.salveregina.app.domain.port.out;

import ci.salveregina.app.domain.model.SessionPaiement;
import ci.salveregina.app.domain.model.Versement;

import java.util.Optional;

/**
 * Port sortant définissant l'interaction avec la passerelle de paiement (GeniusPay).
 * Respecte le principe ouvert/fermé (OCP) et l'inversion des dépendances (DIP).
 */
public interface PasserellePaiementPort {

    SessionPaiement initierPaiement(Versement versement);

    Optional<String> verifierStatutPaiement(String referencePasserelle);

    boolean verifierSignatureWebhook(String signature, String rawPayload);
}
