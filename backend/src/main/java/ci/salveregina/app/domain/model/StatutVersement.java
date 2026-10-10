package ci.salveregina.app.domain.model;

/**
 * Statuts possibles d'un versement ou cotisation.
 */
public enum StatutVersement {
    EN_ATTENTE("En attente"),
    VALIDE("Validé"),
    ECHOUE("Échoué"),
    ANNULE("Annulé");

    private final String libelle;

    StatutVersement(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}
