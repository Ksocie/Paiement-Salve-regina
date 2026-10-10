package ci.salveregina.app;

import ci.salveregina.app.application.service.VersementService;
import ci.salveregina.app.domain.model.MotifVersement;
import ci.salveregina.app.domain.model.OperateurPaiement;
import ci.salveregina.app.domain.model.Pupitre;
import ci.salveregina.app.domain.model.SessionPaiement;
import ci.salveregina.app.domain.model.StatutVersement;
import ci.salveregina.app.domain.model.Versement;
import ci.salveregina.app.domain.port.in.EnregistrerVersementUseCase.CommandeNouveauVersement;
import ci.salveregina.app.domain.port.out.PasserellePaiementPort;
import ci.salveregina.app.domain.port.out.VersementPersistencePort;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VersementServiceTest {

    @Mock
    private VersementPersistencePort persistencePort;

    @Mock
    private PasserellePaiementPort passerellePaiementPort;

    private VersementService versementService;

    @BeforeEach
    void setUp() {
        versementService = new VersementService(persistencePort, passerellePaiementPort, new ObjectMapper());
    }

    @Test
    @DisplayName("Doit enregistrer une cotisation et initier la session de paiement avec succès")
    void doitEnregistrerEtInitierPaiement() {
        CommandeNouveauVersement commande = new CommandeNouveauVersement(
                "Marie-Ange Kouadio",
                "+2250701020304",
                "marie@test.ci",
                Pupitre.SOPRANO,
                MotifVersement.COTISATION,
                BigDecimal.valueOf(5000),
                OperateurPaiement.WAVE,
                "Cotisation mensuelle"
        );

        when(persistencePort.sauvegarder(any(Versement.class))).thenAnswer(inv -> inv.getArgument(0));
        when(passerellePaiementPort.initierPaiement(any(Versement.class)))
                .thenReturn(new SessionPaiement("MTX-12345", "https://checkout.geniuspay.ci/pay?ref=MTX-12345", "TXN-1", BigDecimal.valueOf(100), "Wave", "PENDING"));

        Versement resultat = versementService.enregistrerEtInitierPaiement(commande);

        assertThat(resultat).isNotNull();
        assertThat(resultat.getNomDonateur()).isEqualTo("Marie-Ange Kouadio");
        assertThat(resultat.getPupitre()).isEqualTo(Pupitre.SOPRANO);
        assertThat(resultat.getStatut()).isEqualTo(StatutVersement.EN_ATTENTE);
        assertThat(resultat.getReferencePasserelle()).isEqualTo("MTX-12345");
        assertThat(resultat.getUrlPaiement()).contains("checkout.geniuspay.ci");

        verify(persistencePort, org.mockito.Mockito.times(2)).sauvegarder(any(Versement.class));
        verify(passerellePaiementPort).initierPaiement(any(Versement.class));
    }

    @Test
    @DisplayName("Doit valider le statut lorsque la passerelle retourne complété")
    void doitMettreAJourStatutQuandPaiementReussi() {
        Versement initial = Versement.builder()
                .reference("CSR-2026-999999")
                .nomDonateur("Jean-Luc Yao")
                .telephone("+2250505050505")
                .pupitre(Pupitre.TENOR)
                .motif(MotifVersement.COTISATION)
                .montant(BigDecimal.valueOf(5000))
                .operateur(OperateurPaiement.ORANGE_MONEY)
                .statut(StatutVersement.EN_ATTENTE)
                .referencePasserelle("MTX-CONFIRMED")
                .build();

        when(persistencePort.trouverParReference("CSR-2026-999999")).thenReturn(Optional.of(initial));
        when(passerellePaiementPort.verifierStatutPaiement("MTX-CONFIRMED")).thenReturn(Optional.of("completed"));
        when(persistencePort.sauvegarder(any(Versement.class))).thenAnswer(inv -> inv.getArgument(0));

        Versement misAJour = versementService.verifierEtMettreAJour("CSR-2026-999999");

        assertThat(misAJour.getStatut()).isEqualTo(StatutVersement.VALIDE);
        assertThat(misAJour.getDateValidation()).isNotNull();
    }
}
