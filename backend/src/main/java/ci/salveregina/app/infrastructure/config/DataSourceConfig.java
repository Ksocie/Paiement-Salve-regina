package ci.salveregina.app.infrastructure.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url}")
    private String rawUrl;

    @Value("${spring.datasource.username:}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        String finalJdbcUrl = rawUrl != null ? rawUrl.trim() : "";
        String finalUsername = username != null ? username.trim() : "";
        String finalPassword = password != null ? password.trim() : "";

        // Support direct pour les formats d'URL cloud (Render, Heroku, Neon, Supabase)
        // Format injecté par le cloud: postgresql://user:password@host:port/database
        // ou format jdbc avec credentials: jdbc:postgresql://user:password@host:port/database
        // Format attendu par le driver JDBC Java: jdbc:postgresql://host:port/database
        boolean isCloudUrl = finalJdbcUrl.startsWith("postgresql://") || finalJdbcUrl.startsWith("postgres://");
        boolean isJdbcWithCredentials = finalJdbcUrl.startsWith("jdbc:postgresql://") && finalJdbcUrl.contains("@");

        if (isCloudUrl || isJdbcWithCredentials) {
            try {
                String urlToParse = isJdbcWithCredentials ? finalJdbcUrl.substring(5) : finalJdbcUrl;
                URI uri = new URI(urlToParse);
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                String dbName = (path != null && path.length() > 1) ? path.substring(1) : "";
                String query = (uri.getQuery() != null && !uri.getQuery().isBlank()) ? "?" + uri.getQuery() : "";

                finalJdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbName + query;

                if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                    String[] userParts = uri.getUserInfo().split(":", 2);
                    if (userParts.length > 0 && !userParts[0].isBlank()) {
                        finalUsername = java.net.URLDecoder.decode(userParts[0], java.nio.charset.StandardCharsets.UTF_8);
                    }
                    if (userParts.length > 1 && !userParts[1].isBlank()) {
                        finalPassword = java.net.URLDecoder.decode(userParts[1], java.nio.charset.StandardCharsets.UTF_8);
                    }
                }
                log.info("URL Cloud détectée et convertie en JDBC: {} (utilisateur: {})", finalJdbcUrl, finalUsername);
            } catch (Exception e) {
                log.warn("Conversion URL cloud échouée ({}), ajout du préfixe jdbc:", e.getMessage());
                if (!finalJdbcUrl.startsWith("jdbc:")) {
                    finalJdbcUrl = "jdbc:" + finalJdbcUrl;
                }
            }
        }

        config.setJdbcUrl(finalJdbcUrl);
        if (!finalUsername.isBlank()) {
            config.setUsername(finalUsername);
        }
        if (!finalPassword.isBlank()) {
            config.setPassword(finalPassword);
        }
        config.setDriverClassName(driverClassName);

        return new HikariDataSource(config);
    }
}
