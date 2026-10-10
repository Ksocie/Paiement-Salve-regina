package ci.salveregina.app.domain.model;

/**
 * Opérateurs de paiement Mobile Money supportés en Côte d'Ivoire.
 */
public enum OperateurPaiement {
    WAVE("Wave", "wave"),
    ORANGE_MONEY("Orange Money", "ORANGE_CIV"),
    MTN_MOMO("MTN MoMo", "MTN_MOMO_CIV"),
    MOOV_MONEY("Moov Money", "MOOV_CIV");

    private final String nomAffiche;
    private final String codePasserelle;

    OperateurPaiement(String nomAffiche, String codePasserelle) {
        this.nomAffiche = nomAffiche;
        this.codePasserelle = codePasserelle;
    }

    public String getNomAffiche() {
        return nomAffiche;
    }

    public String getCodePasserelle() {
        return codePasserelle;
    }

    public static OperateurPaiement fromString(String texte) {
        if (texte == null || texte.isBlank()) return WAVE;
        String val = texte.trim().toUpperCase();
        for (OperateurPaiement op : values()) {
            if (op.name().equalsIgnoreCase(val) || op.nomAffiche.equalsIgnoreCase(texte.trim()) || op.codePasserelle.equalsIgnoreCase(texte.trim())) {
                return op;
            }
        }
        if (val.contains("WAVE")) return WAVE;
        if (val.contains("ORANGE")) return ORANGE_MONEY;
        if (val.contains("MTN")) return MTN_MOMO;
        if (val.contains("MOOV")) return MOOV_MONEY;
        return WAVE;
    }
}
