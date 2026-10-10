package ci.salveregina.app.domain.model;

/**
 * Pupitres et rôles des membres au sein de la chorale Salve Regina.
 */
public enum Pupitre {
    SOPRANO("Soprano"),
    ALTO("Alto"),
    TENOR("Ténor"),
    BASSE("Basse"),
    BIENFAITEUR("Ami / Bienfaiteur"),
    AUTRE("Autre");

    private final String libelle;

    Pupitre(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }

    public static Pupitre fromString(String texte) {
        if (texte == null || texte.isBlank()) return AUTRE;
        String val = texte.trim().toUpperCase();
        for (Pupitre p : values()) {
            if (p.name().equalsIgnoreCase(val) || p.libelle.equalsIgnoreCase(texte.trim())) {
                return p;
            }
        }
        if (val.contains("SOPRANO")) return SOPRANO;
        if (val.contains("ALTO")) return ALTO;
        if (val.contains("TENOR") || val.contains("TÉNOR")) return TENOR;
        if (val.contains("BASSE")) return BASSE;
        if (val.contains("BIENFAITEUR") || val.contains("AMI")) return BIENFAITEUR;
        return AUTRE;
    }
}
