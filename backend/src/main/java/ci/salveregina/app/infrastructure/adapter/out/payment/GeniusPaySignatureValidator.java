package ci.salveregina.app.infrastructure.adapter.out.payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Validateur de signature HMAC-SHA256 pour les webhooks GeniusPay.
 */
@Component
public class GeniusPaySignatureValidator {

    private static final Logger log = LoggerFactory.getLogger(GeniusPaySignatureValidator.class);
    private static final String HMAC_SHA256 = "HmacSHA256";

    public boolean verifierSignature(String signatureFournie, String rawPayload, String secret) {
        if (secret == null || secret.isBlank()) {
            log.warn("Secret webhook non configuré. Validation de signature acceptée par défaut en mode dev.");
            return true;
        }
        if (signatureFournie == null || signatureFournie.isBlank()) {
            return false;
        }

        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            mac.init(secretKey);

            byte[] hmacBytes = mac.doFinal(rawPayload.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hmacBytes) {
                sb.append(String.format("%02x", b));
            }
            String signatureCalculee = sb.toString();

            return MessageDigest.isEqual(
                    signatureCalculee.getBytes(StandardCharsets.UTF_8),
                    signatureFournie.trim().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Erreur calcul signature HMAC GeniusPay: {}", e.getMessage());
            return false;
        }
    }
}
