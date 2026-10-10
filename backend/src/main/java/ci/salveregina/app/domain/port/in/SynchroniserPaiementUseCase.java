package ci.salveregina.app.domain.port.in;

import ci.salveregina.app.domain.model.Versement;

/**
 * Port d'entrée pour la synchronisation des statuts de paiement (polling ou webhook).
 */
public interface SynchroniserPaiementUseCase {

    Versement verifierEtMettreAJour(String reference);

    void traiterWebhookGeniusPay(String signature, String payloadBrut);
}
