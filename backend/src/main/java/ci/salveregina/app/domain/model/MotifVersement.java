package ci.salveregina.app.domain.model;

/**
 * Motifs de versement acceptés par la plateforme Salve Regina.
 * Extensible pour supporter de nouveaux motifs futurs.
 */
public enum MotifVersement {
    COTISATION("Cotisation"),
    CONCERT("Concert"),
    DON_LIBRE("Don Libre"),
    UNIFORME("Uniforme & Tenue"),
    PROJET("Projet Spécial"),
    EVENEMENT("Événement"),
    AUTRE("Autre");

    private final String libelle;

    MotifVersement(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }

    public static MotifVersement fromString(String texte) {
        if (texte == null || texte.isBlank()) return COTISATION;
        String val = texte.trim().toUpperCase();
        for (MotifVersement m : values()) {
            if (m.name().equalsIgnoreCase(val) || m.libelle.equalsIgnoreCase(texte.trim())) {
                return m;
            }
        }
        if (val.contains("CONCERT")) return CONCERT;
        if (val.contains("DON")) return DON_LIBRE;
        if (val.contains("UNIFORME") || val.contains("TENUE") || val.contains("TISSU")) return UNIFORME;
        if (val.contains("PROJET")) return PROJET;
        if (val.contains("EVEN") || val.contains("FÊTE")) return EVENEMENT;
        return AUTRE;
    }
}
