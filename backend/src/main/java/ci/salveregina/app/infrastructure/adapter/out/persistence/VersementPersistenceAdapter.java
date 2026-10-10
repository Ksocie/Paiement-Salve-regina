package ci.salveregina.app.infrastructure.adapter.out.persistence;

import ci.salveregina.app.domain.model.MotifVersement;
import ci.salveregina.app.domain.model.OperateurPaiement;
import ci.salveregina.app.domain.model.Pupitre;
import ci.salveregina.app.domain.model.StatistiquesVersement;
import ci.salveregina.app.domain.model.StatutVersement;
import ci.salveregina.app.domain.model.Versement;
import ci.salveregina.app.domain.port.out.VersementPersistencePort;
import ci.salveregina.app.infrastructure.adapter.out.persistence.entity.VersementEntity;
import ci.salveregina.app.infrastructure.adapter.out.persistence.repository.VersementJpaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Adaptateur de persistance implémentant le port sortant VersementPersistencePort.
 * Isole le modèle de domaine des détails de JPA/Hibernate (Clean Architecture).
 */
@Component
public class VersementPersistenceAdapter implements VersementPersistencePort {

    private final VersementJpaRepository repository;

    public VersementPersistenceAdapter(VersementJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Versement sauvegarder(Versement versement) {
        VersementEntity entity = versEntite(versement);
        VersementEntity sauvegarde = repository.save(entity);
        return versDomaine(sauvegarde);
    }

    @Override
    public Optional<Versement> trouverParReference(String reference) {
        return repository.findByReference(reference).map(this::versDomaine);
    }

    @Override
    public Optional<Versement> trouverParReferencePasserelle(String referencePasserelle) {
        return repository.findByReferencePasserelle(referencePasserelle).map(this::versDomaine);
    }

    @Override
    public List<Versement> rechercher(Pupitre pupitre, MotifVersement motif, StatutVersement statut) {
        return rechercher(pupitre, motif, statut, null, null, null);
    }

    @Override
    public List<Versement> rechercher(Pupitre pupitre, MotifVersement motif, StatutVersement statut, Integer annee, java.time.Instant dateDebut, java.time.Instant dateFin) {
        org.springframework.data.jpa.domain.Specification<VersementEntity> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (pupitre != null) predicates.add(cb.equal(root.get("pupitre"), pupitre));
            if (motif != null) predicates.add(cb.equal(root.get("motif"), motif));
            if (statut != null) predicates.add(cb.equal(root.get("statut"), statut));
            if (annee != null) predicates.add(cb.equal(cb.coalesce(root.get("annee"), 2026), annee));
            if (dateDebut != null) predicates.add(cb.greaterThanOrEqualTo(root.get("dateCreation"), dateDebut));
            if (dateFin != null) predicates.add(cb.lessThanOrEqualTo(root.get("dateCreation"), dateFin));
            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return repository.findAll(spec, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "dateCreation"))
                .stream()
                .map(this::versDomaine)
                .toList();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public int annulerVersementsExpires(java.time.Instant dateLimite) {
        return repository.annulerVersementsExpires(dateLimite);
    }

    @Override
    public StatistiquesVersement calculerStatistiques() {
        BigDecimal totalCollecte = repository.sumMontantValide();
        long totalVersements = repository.count();
        long totalValides = repository.countByStatut(StatutVersement.VALIDE);

        Map<Pupitre, BigDecimal> parPupitre = new EnumMap<>(Pupitre.class);
        for (Pupitre p : Pupitre.values()) {
            parPupitre.put(p, BigDecimal.ZERO);
        }
        for (Object[] row : repository.sumParPupitre()) {
            Pupitre p = (Pupitre) row[0];
            BigDecimal sum = (BigDecimal) row[1];
            if (p != null && sum != null) {
                parPupitre.put(p, sum);
            }
        }

        Map<MotifVersement, BigDecimal> parMotif = new EnumMap<>(MotifVersement.class);
        for (MotifVersement m : MotifVersement.values()) {
            parMotif.put(m, BigDecimal.ZERO);
        }
        for (Object[] row : repository.sumParMotif()) {
            MotifVersement m = (MotifVersement) row[0];
            BigDecimal sum = (BigDecimal) row[1];
            if (m != null && sum != null) {
                parMotif.put(m, sum);
            }
        }

        Map<OperateurPaiement, BigDecimal> parOperateur = new EnumMap<>(OperateurPaiement.class);
        for (OperateurPaiement op : OperateurPaiement.values()) {
            parOperateur.put(op, BigDecimal.ZERO);
        }
        for (Object[] row : repository.sumParOperateur()) {
            OperateurPaiement op = (OperateurPaiement) row[0];
            BigDecimal sum = (BigDecimal) row[1];
            if (op != null && sum != null) {
                parOperateur.put(op, sum);
            }
        }

        List<Versement> derniers = repository.findAllByOrderByDateCreationDesc(PageRequest.of(0, 10))
                .stream()
                .map(this::versDomaine)
                .toList();

        return new StatistiquesVersement(
                totalCollecte != null ? totalCollecte : BigDecimal.ZERO,
                totalVersements,
                totalValides,
                parPupitre,
                parMotif,
                parOperateur,
                derniers
        );
    }

    private VersementEntity versEntite(Versement dom) {
        return VersementEntity.builder()
                .id(dom.getId())
                .reference(dom.getReference())
                .nomDonateur(dom.getNomDonateur())
                .telephone(dom.getTelephone())
                .email(dom.getEmail())
                .pupitre(dom.getPupitre())
                .motif(dom.getMotif())
                .annee(dom.getAnnee() != null ? dom.getAnnee() : 2026)
                .campagne(dom.getCampagne())
                .montant(dom.getMontant())
                .operateur(dom.getOperateur())
                .statut(dom.getStatut())
                .referencePasserelle(dom.getReferencePasserelle())
                .urlPaiement(dom.getUrlPaiement())
                .dateCreation(dom.getDateCreation())
                .dateValidation(dom.getDateValidation())
                .commentaire(dom.getCommentaire())
                .build();
    }

    private Versement versDomaine(VersementEntity entity) {
        return Versement.builder()
                .id(entity.getId())
                .reference(entity.getReference())
                .nomDonateur(entity.getNomDonateur())
                .telephone(entity.getTelephone())
                .email(entity.getEmail())
                .pupitre(entity.getPupitre())
                .motif(entity.getMotif())
                .annee(entity.getAnnee() != null ? entity.getAnnee() : 2026)
                .campagne(entity.getCampagne())
                .montant(entity.getMontant())
                .operateur(entity.getOperateur())
                .statut(entity.getStatut())
                .referencePasserelle(entity.getReferencePasserelle())
                .urlPaiement(entity.getUrlPaiement())
                .dateCreation(entity.getDateCreation())
                .dateValidation(entity.getDateValidation())
                .commentaire(entity.getCommentaire())
                .build();
    }
}
