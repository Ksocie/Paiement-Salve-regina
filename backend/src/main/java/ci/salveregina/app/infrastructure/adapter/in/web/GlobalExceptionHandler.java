package ci.salveregina.app.infrastructure.adapter.in.web;

import ci.salveregina.app.domain.exception.MetierException;
import ci.salveregina.app.domain.exception.RessourceIntrouvableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(RessourceIntrouvableException.class)
    public ResponseEntity<ProblemDetail> handleRessourceIntrouvable(RessourceIntrouvableException ex) {
        log.warn("Ressource introuvable: {}", ex.getMessage());
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Ressource Introuvable");
        problem.setType(URI.create("urn:problem:not-found"));
        problem.setProperty("timestamp", Instant.now());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }

    @ExceptionHandler(MetierException.class)
    public ResponseEntity<ProblemDetail> handleMetierException(MetierException ex) {
        log.warn("Erreur métier: {}", ex.getMessage());
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problem.setTitle("Erreur Métier");
        problem.setType(URI.create("urn:problem:business-rule-violation"));
        problem.setProperty("timestamp", Instant.now());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Données de formulaire invalides");
        problem.setTitle("Erreur de Validation");
        problem.setType(URI.create("urn:problem:validation-error"));

        Map<String, String> erreurs = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            erreurs.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        problem.setProperty("champsInvalides", erreurs);
        problem.setProperty("timestamp", Instant.now());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGeneralException(Exception ex) {
        log.error("Erreur serveur imprévue: {}", ex.getMessage(), ex);
        String detailMessage = ex.getMessage() != null ? ex.getMessage() : "Une erreur inattendue est survenue.";
        if (ex.getCause() != null && ex.getCause().getMessage() != null) {
            detailMessage += " (Cause: " + ex.getCause().getMessage() + ")";
        }
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, detailMessage);
        problem.setTitle("Erreur Interne");
        problem.setType(URI.create("urn:problem:internal-server-error"));
        problem.setProperty("exceptionClass", ex.getClass().getName());
        problem.setProperty("timestamp", Instant.now());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problem);
    }
}
