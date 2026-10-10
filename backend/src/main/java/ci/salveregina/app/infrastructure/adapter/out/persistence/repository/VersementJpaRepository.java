package ci.salveregina.app.infrastructure.adapter.out.persistence.repository;

import ci.salveregina.app.domain.model.MotifVersement;
import ci.salveregina.app.domain.model.Pupitre;
import ci.salveregina.app.domain.model.StatutVersement;
import ci.salveregina.app.infrastructure.adapter.out.persistence.entity.VersementEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface VersementJpaRepository extends JpaRepository<VersementEntity, Long> {

    Optional<VersementEntity> findByReference(String reference);

    Optional<VersementEntity> findByReferencePasserelle(String referencePasserelle);

    @Query("""
        SELECT v FROM VersementEntity v
        WHERE (:pupitre IS NULL OR v.pupitre = :pupitre)
          AND (:motif IS NULL OR v.motif = :motif)
          AND (:statut IS NULL OR v.statut = :statut)
        ORDER BY v.dateCreation DESC
    """)
    List<VersementEntity> rechercher(
            @Param("pupitre") Pupitre pupitre,
            @Param("motif") MotifVersement motif,
            @Param("statut") StatutVersement statut
    );

    List<VersementEntity> findAllByOrderByDateCreationDesc(Pageable pageable);

    @Query("SELECT COALESCE(SUM(v.montant), 0) FROM VersementEntity v WHERE v.statut = ci.salveregina.app.domain.model.StatutVersement.VALIDE")
    BigDecimal sumMontantValide();

    long countByStatut(StatutVersement statut);

    @Query("""
        SELECT v.pupitre, SUM(v.montant)
        FROM VersementEntity v
        WHERE v.statut = ci.salveregina.app.domain.model.StatutVersement.VALIDE
        GROUP BY v.pupitre
    """)
    List<Object[]> sumParPupitre();

    @Query("""
        SELECT v.motif, SUM(v.montant)
        FROM VersementEntity v
        WHERE v.statut = ci.salveregina.app.domain.model.StatutVersement.VALIDE
        GROUP BY v.motif
    """)
    List<Object[]> sumParMotif();

    @Query("""
        SELECT v.operateur, SUM(v.montant)
        FROM VersementEntity v
        WHERE v.statut = ci.salveregina.app.domain.model.StatutVersement.VALIDE
        GROUP BY v.operateur
    """)
    List<Object[]> sumParOperateur();
}
