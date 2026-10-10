package ci.salveregina.app.infrastructure.adapter.in.web.dto;

import ci.salveregina.app.domain.model.StatistiquesVersement;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public record StatistiquesDto(
        BigDecimal totalCollecte,
        long nombreTotalVersements,
        long nombreVersementsValides,
        Map<String, BigDecimal> totalParPupitre,
        Map<String, BigDecimal> totalParMotif,
        Map<String, BigDecimal> totalParOperateur,
        List<VersementDto> derniersVersements
) {
    public static StatistiquesDto depuisDomaine(StatistiquesVersement stats) {
        Map<String, BigDecimal> parPupitre = new LinkedHashMap<>();
        stats.totalParPupitre().forEach((p, val) -> parPupitre.put(p.getLibelle(), val));

        Map<String, BigDecimal> parMotif = new LinkedHashMap<>();
        stats.totalParMotif().forEach((m, val) -> parMotif.put(m.getLibelle(), val));

        Map<String, BigDecimal> parOperateur = new LinkedHashMap<>();
        stats.totalParOperateur().forEach((op, val) -> parOperateur.put(op.getNomAffiche(), val));

        List<VersementDto> derniers = stats.derniersVersements().stream()
                .map(VersementDto::depuisDomaine)
                .toList();

        return new StatistiquesDto(
                stats.totalCollecte(),
                stats.nombreTotalVersements(),
                stats.nombreVersementsValides(),
                parPupitre,
                parMotif,
                parOperateur,
                derniers
        );
    }
}
