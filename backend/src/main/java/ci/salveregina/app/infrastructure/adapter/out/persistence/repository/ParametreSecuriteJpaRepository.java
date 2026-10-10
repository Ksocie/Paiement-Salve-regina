package ci.salveregina.app.infrastructure.adapter.out.persistence.repository;

import ci.salveregina.app.infrastructure.adapter.out.persistence.entity.ParametreSecuriteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository Spring Data JPA pour les paramètres de sécurité stockés en base.
 */
@Repository
public interface ParametreSecuriteJpaRepository extends JpaRepository<ParametreSecuriteEntity, String> {
}
