package ci.salveregina.app.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Paramètres de sécurité et de configuration persistés en base de données (ex: Code PIN trésorerie).
 */
@Entity
@Table(name = "parametres_securite")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParametreSecuriteEntity {

    @Id
    @Column(name = "cle", length = 64, nullable = false)
    private String cle;

    @Column(name = "valeur", length = 255, nullable = false)
    private String valeur;

    @Column(name = "date_modification")
    private Instant dateModification;
}
