package ci.salveregina.app.infrastructure.adapter.in.web.dto;

import ci.salveregina.app.domain.model.MotifVersement;
import ci.salveregina.app.infrastructure.adapter.out.persistence.entity.CampagneMotifEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampagneMotifDto {
    private Long id;
    private String code;
    private MotifVersement typeMotif;
    private String libelle;
    private Integer annee;
    private Boolean actif;
    private Integer ordre;

    public static CampagneMotifDto depuisEntite(CampagneMotifEntity entity) {
        if (entity == null) return null;
        return CampagneMotifDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .typeMotif(entity.getTypeMotif())
                .libelle(entity.getLibelle())
                .annee(entity.getAnnee())
                .actif(entity.getActif())
                .ordre(entity.getOrdre())
                .build();
    }
}
