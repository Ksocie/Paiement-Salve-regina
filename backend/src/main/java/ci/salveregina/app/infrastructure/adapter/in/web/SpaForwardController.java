package ci.salveregina.app.infrastructure.adapter.in.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Redirection des routes Angular (SPA) vers index.html pour permettre le rechargement direct dans le navigateur.
 */
@Controller
public class SpaForwardController {

    @GetMapping(value = {
            "/accueil",
            "/cotisations",
            "/concerts",
            "/transparence"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
