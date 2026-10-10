import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PwaService } from '../../core/services/pwa.service';
import { VersementService } from '../../core/services/versement.service';
import { CreerVersementDto, MotifVersement, OperateurPaiement, Pupitre, Versement } from '../../core/models/versement.model';
import { QrModalService } from '../../core/services/qr-modal.service';
import { ReceiptModalComponent } from '../../shared/components/receipt-modal/receipt-modal.component';
import { TresorerieModalComponent } from '../tresorerie/tresorerie-modal.component';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReceiptModalComponent, TresorerieModalComponent],
  template: `
    <div class="flex flex-col w-full max-w-xl mx-auto pb-10">
      <!-- PWA Install Notice Bar -->
      <aside
        *ngIf="showPwaBanner && !pwaService.isInstalled()"
        id="pwa-banner"
        class="mx-margin mt-space-sm mb-space-sm bg-secondary-fixed/70 text-on-secondary-fixed rounded-xl p-space-sm flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-space-sm min-w-0">
          <div class="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[18px]">touch_app</span>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="font-semibold text-xs truncate">Installer l'App Salve Regina</span>
            <span class="text-[11px] text-on-secondary-fixed-variant truncate">Accès direct 1-clic &amp; sans mot de passe</span>
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button
            type="button"
            (click)="installerPwa()"
            class="px-2.5 py-1 rounded-full bg-secondary text-on-secondary text-xs font-semibold shadow-sm active:scale-95 transition-transform">
            Installer
          </button>
          <button
            type="button"
            aria-label="Fermer"
            (click)="showPwaBanner = false"
            class="w-7 h-7 flex items-center justify-center text-on-secondary-fixed-variant hover:text-on-secondary-fixed">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </aside>

      <!-- Editorial Sacred Photo Card (20 Ans de Grâce) -->
      <section class="mx-margin mb-space-md rounded-2xl overflow-hidden shadow-lg border border-outline-variant/30 bg-surface-container-lowest">
        <div class="relative w-full aspect-[16/9] overflow-hidden bg-black/5">
          <img
            alt="La Chorale Salve Regina célébrant ses 20 Ans de Grâce"
            class="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-102"
            src="images/chorale-salve-regina.jpg"
            (error)="onImageError($event)">
        </div>

        <!-- Sacred Quote Caption Below the Photo -->
        <div class="p-3 bg-surface-container-low/70 flex flex-col items-center text-center border-t border-outline-variant/20">
          <p class="font-serif-sacred text-base text-primary font-bold italic leading-snug">
            « Qui bene cantat, bis orat »
          </p>
          <span class="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5 font-medium">
            Celui qui chante bien prie deux fois • St Augustin
          </span>
        </div>
      </section>

      <!-- Bannière Partager & QR Code -->
      <section class="mx-margin mb-space-md p-3.5 rounded-2xl bg-gradient-to-r from-secondary-fixed/50 to-primary-fixed/30 border border-secondary/20 shadow-sm flex items-center justify-between gap-2">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-sm">
            <span class="material-symbols-outlined text-[22px]">qr_code_2</span>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-xs font-bold text-on-secondary-fixed truncate">Faire scanner ou partager l'application</span>
            <span class="text-[11px] text-on-secondary-fixed-variant truncate">QR Code direct pour les cotisations &amp; dons</span>
          </div>
        </div>
        <button
          type="button"
          (click)="ouvrirQrModal()"
          class="px-3 py-1.5 rounded-xl bg-secondary text-on-secondary hover:bg-secondary/90 text-xs font-semibold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 shrink-0">
          <span class="material-symbols-outlined text-[16px]">qr_code</span>
          <span>Afficher</span>
        </button>
      </section>

      <!-- Guichet de Cotisation & Offrande -->
      <section class="mx-margin mb-space-lg bg-surface-container-lowest rounded-2xl p-space-md shadow-md border border-outline-variant/20 flex flex-col gap-space-md">
        <!-- Header of the module -->
        <div class="flex items-center gap-space-xs">
          <div class="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
            <span class="material-symbols-outlined text-[19px]">volunteer_activism</span>
          </div>
          <h2 class="font-serif-sacred text-2xl font-bold text-on-surface">Cotisation &amp; Offrande</h2>
        </div>

        <!-- Category Chips Selector -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Motif du versement</label>
          <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              *ngFor="let m of motifs"
              type="button"
              (click)="selectionnerMotif(m.valeur)"
              [ngClass]="motifSelectionne === m.valeur ? 'bg-secondary text-on-secondary shadow-sm font-bold' : 'bg-surface-container text-on-surface-variant font-medium hover:bg-surface-container-high'"
              class="py-2 px-3 rounded-full text-xs text-center transition-all shrink-0 active:scale-95 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">{{ m.icon }}</span>
              <span>{{ m.libelle }}</span>
            </button>
          </div>
        </div>

        <!-- Identity & Voice Section -->
        <div class="flex flex-col gap-space-sm">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-on-surface" for="donor-name">Nom &amp; Prénoms</label>
            <input
              id="donor-name"
              [(ngModel)]="nomDonateur"
              placeholder="Votre nom complet"
              type="text"
              class="w-full px-3 py-2.5 bg-surface-container-low rounded-xl text-sm text-on-surface placeholder:text-outline border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all">
          </div>

          <!-- Quick Section / Pupitre Tag Chips -->
          <div class="flex flex-col gap-1.5">
            <span class="text-[11px] font-semibold text-on-surface-variant">Pupitre</span>
            <div class="flex gap-1.5 overflow-x-auto pb-1">
              <button
                *ngFor="let p of pupitres"
                type="button"
                (click)="selectionnerPupitre(p.valeur)"
                [ngClass]="pupitreSelectionne === p.valeur ? 'bg-primary text-on-primary font-bold shadow-sm' : 'bg-surface-container text-on-surface-variant font-medium hover:bg-surface-container-high'"
                class="px-3 py-1 rounded-full text-xs shrink-0 active:scale-95 transition-all">
                {{ p.libelle }}
              </button>
            </div>
          </div>
        </div>

        <!-- Phone Number Mobile Money Input -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-on-surface" for="donor-phone">Numéro Mobile Money</label>
          <div class="flex items-center gap-2 bg-surface-container-low rounded-xl px-3 py-2 border transition-all"
               [ngClass]="numeroInvalide ? 'border-rose-500 bg-rose-50/30' : 'border-transparent focus-within:border-primary focus-within:bg-surface-container-lowest'">
            <span class="text-xs font-bold text-on-surface-variant shrink-0">+225</span>
            <input
              id="donor-phone"
              [(ngModel)]="telephone"
              (input)="numeroInvalide = false"
              inputmode="numeric"
              placeholder="Ex: 07 00 00 00 00"
              type="tel"
              required
              class="w-full bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none min-w-0">
          </div>
          <span *ngIf="numeroInvalide" class="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">error</span>
            Le numéro de téléphone est obligatoire pour valider votre versement.
          </span>
        </div>

        <!-- Amount Selection Pills -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Montant (FCFA)</label>
            <span class="text-xs text-primary font-bold">Sélectionné: {{ afficherMontant() }}</span>
          </div>
          <div class="grid grid-cols-4 gap-1.5">
            <button
              *ngFor="let amt of montantsPredifinis"
              type="button"
              (click)="selectionnerMontant(amt)"
              [ngClass]="!montantPersonnalise && montant === amt ? 'bg-secondary text-on-secondary font-bold shadow-sm' : 'bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high'"
              class="py-2.5 rounded-xl text-xs text-center transition-all">
              {{ amt | number }}
            </button>
            <button
              type="button"
              (click)="activerMontantPersonnalise()"
              [ngClass]="montantPersonnalise ? 'bg-secondary text-on-secondary font-bold shadow-sm' : 'bg-surface-container text-on-surface-variant font-medium hover:bg-surface-container-high'"
              class="py-2.5 rounded-xl text-xs text-center transition-all">
              Autre
            </button>
          </div>
          <div *ngIf="montantPersonnalise" class="mt-1">
            <input
              [(ngModel)]="montantLibre"
              (ngModelChange)="onMontantLibreChange($event)"
              placeholder="Entrez le montant en FCFA (ex: 15000)"
              type="number"
              min="200"
              class="w-full px-3 py-2 bg-surface-container-low rounded-xl text-sm text-on-surface border border-primary focus:outline-none focus:bg-surface-container-lowest">
          </div>
        </div>

        <!-- Mobile Money Operators Multi-Selection -->
        <div class="flex flex-col gap-1.5">
          <span class="text-[11px] font-semibold text-on-surface-variant">Réseau de paiement</span>
          <div class="grid grid-cols-4 gap-2">
            <div
              (click)="selectionnerOperateur('WAVE')"
              [ngClass]="operateurSelectionne === 'WAVE' ? 'border-2 border-secondary bg-secondary-fixed/30 shadow-sm' : 'bg-surface-container-low border border-transparent'"
              class="flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer hover:bg-secondary-fixed/20 transition-all text-center">
              <span class="text-xs font-extrabold text-secondary">Wave</span>
              <span class="text-[9px] text-outline font-medium">0% frais</span>
            </div>

            <div
              (click)="selectionnerOperateur('ORANGE_MONEY')"
              [ngClass]="operateurSelectionne === 'ORANGE_MONEY' ? 'border-2 border-primary bg-primary-fixed/30 shadow-sm' : 'bg-surface-container-low border border-transparent'"
              class="flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer hover:bg-primary-fixed/20 transition-all text-center">
              <span class="text-xs font-extrabold text-orange-600">Orange</span>
              <span class="text-[9px] text-outline font-medium">Money</span>
            </div>

            <div
              (click)="selectionnerOperateur('MTN_MOMO')"
              [ngClass]="operateurSelectionne === 'MTN_MOMO' ? 'border-2 border-yellow-600 bg-yellow-50 shadow-sm' : 'bg-surface-container-low border border-transparent'"
              class="flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer hover:bg-yellow-50 transition-all text-center">
              <span class="text-xs font-extrabold text-yellow-700">MTN</span>
              <span class="text-[9px] text-outline font-medium">MoMo</span>
            </div>

            <div
              (click)="selectionnerOperateur('MOOV_MONEY')"
              [ngClass]="operateurSelectionne === 'MOOV_MONEY' ? 'border-2 border-blue-600 bg-blue-50 shadow-sm' : 'bg-surface-container-low border border-transparent'"
              class="flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer hover:bg-blue-50 transition-all text-center">
              <span class="text-xs font-extrabold text-blue-700">Moov</span>
              <span class="text-[9px] text-outline font-medium">Money</span>
            </div>
          </div>
        </div>

        <!-- Big Tactile Action Button -->
        <button
          type="button"
          [disabled]="enCours"
          (click)="validerOffrande()"
          class="w-full py-3.5 px-space-md rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-semibold text-sm shadow-[0_4px_16px_rgba(120,86,0,0.24)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50">
          <span *ngIf="!enCours" class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">lock</span>
          <span *ngIf="enCours" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ enCours ? 'Initiation du versement...' : 'Valider le versement' }}</span>
        </button>

        <p class="text-[11px] text-center text-on-surface-variant flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-[14px] text-emerald-600">verified_user</span>
          Paiement sécurisé • Mobile Money (Wave, Orange, MTN, Moov)
        </p>
      </section>

      <!-- Footer discret avec accès sécurisé Trésorerie -->
      <footer class="mt-2 pb-6 flex flex-col items-center justify-center gap-1.5 text-center text-on-surface-variant">
        <button
          type="button"
          (click)="afficherTresorerieModal = true"
          class="text-xs text-on-surface-variant/80 hover:text-primary flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-surface-container transition-all">
          <span class="material-symbols-outlined text-[15px]">lock</span>
          <span>Espace Trésorier &amp; Bureau</span>
        </button>
        <span class="text-[10px] text-outline">Chorale Salve Regina • 20 Ans de Grâce</span>
      </footer>

      <!-- Digital Receipt Modal -->
      <app-receipt-modal
        *ngIf="recuAffiche"
        [versement]="recuAffiche"
        (fermer)="recuAffiche = null">
      </app-receipt-modal>

      <!-- Espace Trésorerie Modal -->
      <app-tresorerie-modal
        *ngIf="afficherTresorerieModal"
        (fermer)="afficherTresorerieModal = false">
      </app-tresorerie-modal>
    </div>
  `
})
export class AccueilComponent implements OnInit {
  readonly pwaService = inject(PwaService);
  private readonly versementService = inject(VersementService);
  private readonly qrModalService = inject(QrModalService);
  private readonly route = inject(ActivatedRoute);

  showPwaBanner = true;
  enCours = false;
  afficherTresorerieModal = false;
  recuAffiche: Versement | null = null;
  numeroInvalide = false;

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParams;
    const ref = qp['reference'] || qp['ref'] || qp['order_id'] || qp['versementRef'] || qp['simulated_ref'];
    if (ref) {
      this.versementService.obtenirParReference(ref).subscribe({
        next: (v) => {
          if (v) this.recuAffiche = v;
        }
      });
    }
  }

  ouvrirQrModal(): void {
    this.qrModalService.open();
  }

  motifSelectionne: MotifVersement = 'COTISATION';
  pupitreSelectionne: Pupitre = 'SOPRANO';
  nomDonateur = '';
  telephone = '';
  montant = 5000;
  montantPersonnalise = false;
  montantLibre = 15000;
  operateurSelectionne: OperateurPaiement = 'WAVE';

  readonly motifs: { valeur: MotifVersement; libelle: string; icon: string }[] = [
    { valeur: 'COTISATION', libelle: 'Cotisation', icon: 'payments' },
    { valeur: 'DON_LIBRE', libelle: 'Don Libre', icon: 'volunteer_activism' },
    { valeur: 'CONCERT', libelle: 'Concert', icon: 'music_note' },
    { valeur: 'UNIFORME', libelle: 'Uniforme & Tenue', icon: 'checkroom' },
    { valeur: 'PROJET', libelle: 'Projet Spécial', icon: 'campaign' },
    { valeur: 'AUTRE', libelle: 'Autre', icon: 'more_horiz' }
  ];

  readonly pupitres: { valeur: Pupitre; libelle: string }[] = [
    { valeur: 'SOPRANO', libelle: 'Soprano' },
    { valeur: 'ALTO', libelle: 'Alto' },
    { valeur: 'TENOR', libelle: 'Ténor' },
    { valeur: 'BASSE', libelle: 'Basse' },
    { valeur: 'BIENFAITEUR', libelle: 'Bienfaiteur' }
  ];

  readonly montantsPredifinis = [2500, 5000, 10000];

  selectionnerMotif(motif: MotifVersement): void {
    this.motifSelectionne = motif;
  }

  selectionnerPupitre(pupitre: Pupitre): void {
    this.pupitreSelectionne = pupitre;
  }

  selectionnerMontant(valeur: number): void {
    this.montantPersonnalise = false;
    this.montant = valeur;
  }

  activerMontantPersonnalise(): void {
    this.montantPersonnalise = true;
    this.montant = this.montantLibre || 1000;
  }

  onMontantLibreChange(val: number): void {
    this.montant = val || 0;
  }

  selectionnerOperateur(op: OperateurPaiement): void {
    this.operateurSelectionne = op;
  }

  afficherMontant(): string {
    const val = this.montantPersonnalise ? this.montantLibre : this.montant;
    return (val || 0).toLocaleString('fr-FR') + ' F';
  }

  installerPwa(): void {
    this.pwaService.installApp();
    this.showPwaBanner = false;
  }

  onImageError(e: any): void {
    // Fallback if image path differs
    e.target.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBllCo0wndYRCvqm71yn95p4fqMQgCsNc9pLRRjxabuN14rWvPfJ-VwBJYLWd6moRMjTstMJ-vkRsLF-v8J8agLcTqQLHMIRsrrSA4mnjDrMWVcLQ3UEMB6fWB99rOFXi-AXJZsHgV2FQyOWe6QyvJWY2gwaF1VO4bx6WuSqvUcfJCCfrnug-qsOs0q2BNzSPvjaP5JJUMoiI84igWuWktpWHv_rtEjvXx7Pzl-ymEY_5lwfcZEY6wylSFtOeHZNPtoXQ';
  }

  validerOffrande(): void {
    const nom = this.nomDonateur.trim() || 'Bienfaiteur Anonyme';
    const tel = (this.telephone || '').trim().replace(/\s+/g, '');

    if (!tel || tel.length < 8) {
      this.numeroInvalide = true;
      alert('Le numéro de téléphone Mobile Money est obligatoire pour effectuer le versement.');
      return;
    }
    this.numeroInvalide = false;

    const montantFinal = this.montantPersonnalise ? (this.montantLibre || 1000) : this.montant;

    if (montantFinal < 200) {
      alert('Le montant minimum pour un versement Mobile Money (Wave, Orange, MTN) est de 200 FCFA.');
      return;
    }

    const libelleMotif = this.motifs.find(m => m.valeur === this.motifSelectionne)?.libelle || this.motifSelectionne;

    const payload: CreerVersementDto = {
      nomDonateur: nom,
      telephone: tel,
      pupitre: this.pupitreSelectionne,
      motif: this.motifSelectionne,
      campagne: libelleMotif,
      montant: montantFinal,
      operateur: this.operateurSelectionne,
      commentaire: `Versement ${libelleMotif} via PWA mobile pour la Chorale Salve Regina`
    };

    this.enCours = true;
    this.versementService.creerVersement(payload).subscribe({
      next: (res: Versement) => {
        this.enCours = false;
        this.recuAffiche = res;

        // Si une URL de paiement externe réelle est fournie (ex: Wave direct ou GeniusPay)
        if (res.urlPaiement && res.urlPaiement.startsWith('http')) {
          console.log('Session de paiement réelle GeniusPay initialisée:', res.urlPaiement);
          window.open(res.urlPaiement, '_blank');
        }
      },
      error: (err) => {
        this.enCours = false;
        const msg = err?.error?.detail || err?.error?.message || "Impossible d'initier le paiement. Veuillez vérifier le montant (minimum 200 FCFA) et votre numéro.";
        alert(msg);
      }
    });
  }
}
