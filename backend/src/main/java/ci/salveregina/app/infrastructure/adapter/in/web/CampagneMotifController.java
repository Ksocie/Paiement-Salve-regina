package ci.salveregina.app.infrastructure.adapter.in.web;

import ci.salveregina.app.application.service.CampagneMotifService;
import ci.salveregina.app.infrastructure.adapter.in.web.dto.CampagneMotifDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Campagnes & Motifs", description = "Gestion des types de motifs et années (ex: Uniforme 2025 vs Uniforme 2026)")
@RestController
@RequestMapping("/api/campagnes")
public class CampagneMotifController {

    private final CampagneMotifService campagneMotifService;

    public CampagneMotifController(CampagneMotifService campagneMotifService) {
        this.campagneMotifService = campagneMotifService;
    }

    @Operation(summary = "Lister les campagnes et motifs", description = "Retourne la liste des motifs configurés avec leur type et leur année.")
    @GetMapping
    public ResponseEntity<List<CampagneMotifDto>> listerCampagnes(@RequestParam(defaultValue = "false") boolean tous) {
        if (tous) {
            return ResponseEntity.ok(campagneMotifService.listerToutesLesCampagnes());
        }
        return ResponseEntity.ok(campagneMotifService.listerCampagnesActives());
    }
}
