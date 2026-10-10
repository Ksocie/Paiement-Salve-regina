package ci.salveregina.app.infrastructure.adapter.out.persistence.entity;

import ci.salveregina.app.domain.model.MotifVersement;
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

import java.time.Instant;

/**
 * Entité représentant une campagne ou un motif avec type et année.
 * Permet de distinguer par exemple Uniforme 2025 d'Uniforme 2026.
 */
@Entity
@Table(
        name = "campagnes_motifs",
        indexes = {
                @Index(name = "idx_campagne_code", columnList = "code", unique = true),
                @Index(name = "idx_campagne_type", columnList = "type_motif"),
                @Index(name = "idx_campagne_annee", columnList = "annee"),
                @Index(name = "idx_campagne_actif", columnList = "actif")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampagneMotifEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_motif", nullable = false, length = 30)
    private MotifVersement typeMotif;

    @Column(nullable = false, length = 120)
    private String libelle;

    @Column(nullable = false)
    private Integer annee;

    @Column(nullable = false)
    @Builder.Default
    private Boolean actif = true;

    @Column(nullable = false)
    @Builder.Default
    private Integer ordre = 0;

    @Column(name = "date_creation", nullable = false)
    @Builder.Default
    private Instant dateCreation = Instant.now();
}
