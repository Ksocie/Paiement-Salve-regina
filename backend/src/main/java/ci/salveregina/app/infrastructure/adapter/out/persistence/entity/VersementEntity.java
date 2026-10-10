package ci.salveregina.app.infrastructure.adapter.out.persistence.entity;

import ci.salveregina.app.domain.model.MotifVersement;
import ci.salveregina.app.domain.model.OperateurPaiement;
import ci.salveregina.app.domain.model.Pupitre;
import ci.salveregina.app.domain.model.StatutVersement;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Entité JPA pour la persistance des versements.
 */
@Entity
@Table(
        name = "versements",
        indexes = {
                @Index(name = "idx_versement_ref", columnList = "reference", unique = true),
                @Index(name = "idx_versement_ref_passerelle", columnList = "reference_passerelle"),
                @Index(name = "idx_versement_pupitre", columnList = "pupitre"),
                @Index(name = "idx_versement_statut", columnList = "statut"),
                @Index(name = "idx_versement_date_creation", columnList = "date_creation")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VersementEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String reference;

    @Column(name = "nom_donateur", nullable = false, length = 120)
    private String nomDonateur;

    @Column(nullable = false, length = 20)
    private String telephone;

    @Column(length = 120)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Pupitre pupitre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MotifVersement motif;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OperateurPaiement operateur;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutVersement statut;

    @Column(name = "reference_passerelle", length = 64)
    private String referencePasserelle;

    @Column(name = "url_paiement", length = 512)
    private String urlPaiement;

    @Column(name = "date_creation", nullable = false)
    private Instant dateCreation;

    @Column(name = "date_validation")
    private Instant dateValidation;

    @Column(length = 500)
    private String commentaire;
}
