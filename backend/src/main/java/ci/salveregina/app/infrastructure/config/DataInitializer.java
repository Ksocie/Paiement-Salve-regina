package ci.salveregina.app.infrastructure.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE versements ADD COLUMN IF NOT EXISTS annee integer DEFAULT 2026");
            jdbcTemplate.execute("ALTER TABLE versements ADD COLUMN IF NOT EXISTS campagne varchar(120)");
            jdbcTemplate.execute("UPDATE versements SET annee = 2026 WHERE annee IS NULL");
            // Nettoyage immédiat des anciennes transactions de test
            int supprimes = jdbcTemplate.update("DELETE FROM versements WHERE telephone = '0700000000' OR nom_donateur ILIKE '%test%' OR date_creation < '2026-10-10 06:15:00'");
            if (supprimes > 0) {
                log.info("Période de test terminée: {} versement(s) de test supprimé(s).", supprimes);
            }
            log.info("Migration des colonnes versements vérifiée avec succès.");
        } catch (Exception e) {
            log.warn("Note sur l'initialisation des données: {}", e.getMessage());
        }
        log.info("Démarrage du système sans injection de données statiques. Prêt pour les transactions réelles.");
    }
}
