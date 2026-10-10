package ci.salveregina.app.application.service;

import ci.salveregina.app.domain.model.MotifVersement;
import ci.salveregina.app.infrastructure.adapter.in.web.dto.CampagneMotifDto;
import ci.salveregina.app.infrastructure.adapter.out.persistence.entity.CampagneMotifEntity;
import ci.salveregina.app.infrastructure.adapter.out.persistence.repository.CampagneMotifJpaRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class CampagneMotifService {

    private static final Logger log = LoggerFactory.getLogger(CampagneMotifService.class);

    private final CampagneMotifJpaRepository repository;

    public CampagneMotifService(CampagneMotifJpaRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    @Transactional
    public void initialiserCampagnesParDefaut() {
        if (repository.count() == 0) {
            log.info("Initialisation des campagnes et motifs avec type et année...");
            List<CampagneMotifEntity> defauts = List.of(
                    CampagneMotifEntity.builder()
                            .code("COTISATION_2026")
                            .typeMotif(MotifVersement.COTISATION)
                            .libelle("Cotisation 2026")
                            .annee(2026)
                            .actif(true)
                            .ordre(1)
                            .dateCreation(Instant.now())
                            .build(),
                    CampagneMotifEntity.builder()
                            .code("UNIFORME_2026")
                            .typeMotif(MotifVersement.UNIFORME)
                            .libelle("Uniforme 2026")
                            .annee(2026)
                            .actif(true)
                            .ordre(2)
                            .dateCreation(Instant.now())
                            .build(),
                    CampagneMotifEntity.builder()
                            .code("UNIFORME_2025")
                            .typeMotif(MotifVersement.UNIFORME)
                            .libelle("Uniforme 2025 (Clôturé)")
                            .annee(2025)
                            .actif(false)
                            .ordre(3)
                            .dateCreation(Instant.now())
                            .build(),
                    CampagneMotifEntity.builder()
                            .code("CONCERT_2026")
                            .typeMotif(MotifVersement.CONCERT)
                            .libelle("Concert 2026")
                            .annee(2026)
                            .actif(true)
                            .ordre(4)
                            .dateCreation(Instant.now())
                            .build(),
                    CampagneMotifEntity.builder()
                            .code("DON_LIBRE_2026")
                            .typeMotif(MotifVersement.DON_LIBRE)
                            .libelle("Don Libre")
                            .annee(2026)
                            .actif(true)
                            .ordre(5)
                            .dateCreation(Instant.now())
                            .build(),
                    CampagneMotifEntity.builder()
                            .code("PROJET_2026")
                            .typeMotif(MotifVersement.PROJET)
                            .libelle("Projet Spécial 2026")
                            .annee(2026)
                            .actif(true)
                            .ordre(6)
                            .dateCreation(Instant.now())
                            .build(),
                    CampagneMotifEntity.builder()
                            .code("AUTRE_2026")
                            .typeMotif(MotifVersement.AUTRE)
                            .libelle("Autre")
                            .annee(2026)
                            .actif(true)
                            .ordre(7)
                            .dateCreation(Instant.now())
                            .build()
            );
            repository.saveAll(defauts);
            log.info("7 campagnes et motifs initialisés avec succès.");
        }
    }

    @Transactional(readOnly = true)
    public List<CampagneMotifDto> listerCampagnesActives() {
        return repository.findByActifTrueOrderByOrdreAscAnneeDesc()
                .stream()
                .map(CampagneMotifDto::depuisEntite)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CampagneMotifDto> listerToutesLesCampagnes() {
        return repository.findAllByOrderByOrdreAscAnneeDesc()
                .stream()
                .map(CampagneMotifDto::depuisEntite)
                .toList();
    }
}
