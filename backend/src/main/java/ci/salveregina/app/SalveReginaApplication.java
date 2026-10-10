package ci.salveregina.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SalveReginaApplication {

    public static void main(String[] args) {
        SpringApplication.run(SalveReginaApplication.class, args);
    }
}
