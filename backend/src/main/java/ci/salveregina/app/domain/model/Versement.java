package ci.salveregina.app.domain.model;

import ci.salveregina.app.domain.exception.MetierException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * Agrégat racine représentant un versement (cotisation, offrande, don ou concert).
 * Conçu selon les principes DDD et SOLID.
 */
public class Versement {

    private final Long id;
    private final String reference;
    private final String nomDonateur;
    private final String telephone;
    private final String email;
    private final Pupitre pupitre;
    private final MotifVersement motif;
    private final BigDecimal montant;
    private final OperateurPaiement operateur;
    private StatutVersement statut;
    private String referencePasserelle;
    private String urlPaiement;
    private final Instant dateCreation;
    private Instant dateValidation;
    private final String commentaire;

    private Versement(Builder builder) {
        this.id = builder.id;
        this.reference = Objects.requireNonNull(builder.reference, "La référence est obligatoire");
        this.nomDonateur = Objects.requireNonNull(builder.nomDonateur, "Le nom du donateur est obligatoire");
        this.telephone = Objects.requireNonNull(builder.telephone, "Le téléphone est obligatoire");
        this.email = builder.email;
        this.pupitre = builder.pupitre != null ? builder.pupitre : Pupitre.AUTRE;
        this.motif = builder.motif != null ? builder.motif : MotifVersement.COTISATION;
        this.montant = Objects.requireNonNull(builder.montant, "Le montant est obligatoire");
        this.operateur = builder.operateur != null ? builder.operateur : OperateurPaiement.WAVE;
        this.statut = builder.statut != null ? builder.statut : StatutVersement.EN_ATTENTE;
        this.referencePasserelle = builder.referencePasserelle;
        this.urlPaiement = builder.urlPaiement;
        this.dateCreation = builder.dateCreation != null ? builder.dateCreation : Instant.now();
        this.dateValidation = builder.dateValidation;
        this.commentaire = builder.commentaire;

        validerInvariants();
    }

    private void validerInvariants() {
        if (montant.compareTo(BigDecimal.valueOf(200)) < 0) {
            throw new MetierException("Le montant minimum d'un versement Mobile Money est de 200 FCFA.");
        }
        if (nomDonateur.trim().length() < 2) {
            throw new MetierException("Le nom du donateur doit comporter au moins 2 caractères.");
        }
    }

    public void lierSessionPaiement(String refPasserelle, String url) {
        this.referencePasserelle = refPasserelle;
        this.urlPaiement = url;
    }

    public void marquerCommePaye() {
        if (this.statut == StatutVersement.VALIDE) {
            return; // Idempotent
        }
        this.statut = StatutVersement.VALIDE;
        this.dateValidation = Instant.now();
    }

    public void marquerCommeEchoue() {
        if (this.statut != StatutVersement.VALIDE) {
            this.statut = StatutVersement.ECHOUE;
        }
    }

    public void marquerCommeAnnule() {
        if (this.statut == StatutVersement.EN_ATTENTE) {
            this.statut = StatutVersement.ANNULE;
        }
    }

    public boolean estPaye() {
        return this.statut == StatutVersement.VALIDE;
    }

    // Getters
    public Long getId() { return id; }
    public String getReference() { return reference; }
    public String getNomDonateur() { return nomDonateur; }
    public String getTelephone() { return telephone; }
    public String getEmail() { return email; }
    public Pupitre getPupitre() { return pupitre; }
    public MotifVersement getMotif() { return motif; }
    public BigDecimal getMontant() { return montant; }
    public OperateurPaiement getOperateur() { return operateur; }
    public StatutVersement getStatut() { return statut; }
    public String getReferencePasserelle() { return referencePasserelle; }
    public String getUrlPaiement() { return urlPaiement; }
    public Instant getDateCreation() { return dateCreation; }
    public Instant getDateValidation() { return dateValidation; }
    public String getCommentaire() { return commentaire; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String reference;
        private String nomDonateur;
        private String telephone;
        private String email;
        private Pupitre pupitre;
        private MotifVersement motif;
        private BigDecimal montant;
        private OperateurPaiement operateur;
        private StatutVersement statut;
        private String referencePasserelle;
        private String urlPaiement;
        private Instant dateCreation;
        private Instant dateValidation;
        private String commentaire;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder reference(String reference) { this.reference = reference; return this; }
        public Builder nomDonateur(String nomDonateur) { this.nomDonateur = nomDonateur; return this; }
        public Builder telephone(String telephone) { this.telephone = telephone; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder pupitre(Pupitre pupitre) { this.pupitre = pupitre; return this; }
        public Builder motif(MotifVersement motif) { this.motif = motif; return this; }
        public Builder montant(BigDecimal montant) { this.montant = montant; return this; }
        public Builder operateur(OperateurPaiement operateur) { this.operateur = operateur; return this; }
        public Builder statut(StatutVersement statut) { this.statut = statut; return this; }
        public Builder referencePasserelle(String referencePasserelle) { this.referencePasserelle = referencePasserelle; return this; }
        public Builder urlPaiement(String urlPaiement) { this.urlPaiement = urlPaiement; return this; }
        public Builder dateCreation(Instant dateCreation) { this.dateCreation = dateCreation; return this; }
        public Builder dateValidation(Instant dateValidation) { this.dateValidation = dateValidation; return this; }
        public Builder commentaire(String commentaire) { this.commentaire = commentaire; return this; }

        public Versement build() {
            return new Versement(this);
        }
    }
}
