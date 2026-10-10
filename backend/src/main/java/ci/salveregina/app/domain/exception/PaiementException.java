package ci.salveregina.app.domain.exception;

public class PaiementException extends MetierException {
    public PaiementException(String message) {
        super(message);
    }

    public PaiementException(String message, Throwable cause) {
        super(message, cause);
    }
}
