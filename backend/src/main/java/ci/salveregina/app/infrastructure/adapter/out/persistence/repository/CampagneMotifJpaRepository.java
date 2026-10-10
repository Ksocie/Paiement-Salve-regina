package ci.salveregina.app.infrastructure.adapter.out.persistence.repository;

import ci.salveregina.app.infrastructure.adapter.out.persistence.entity.CampagneMotifEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampagneMotifJpaRepository extends JpaRepository<CampagneMotifEntity, Long> {

    List<CampagneMotifEntity> findByActifTrueOrderByOrdreAscAnneeDesc();

    List<CampagneMotifEntity> findAllByOrderByOrdreAscAnneeDesc();

    Optional<CampagneMotifEntity> findByCode(String code);

    boolean existsByCode(String code);
}
