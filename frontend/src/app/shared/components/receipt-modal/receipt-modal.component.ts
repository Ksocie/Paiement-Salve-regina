import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { Versement } from '../../../core/models/versement.model';
import { VersementService } from '../../../core/services/versement.service';

@Component({
  selector: 'app-receipt-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="versement" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-primary-fixed flex flex-col gap-4 relative animate-scaleUp">

        <!-- Close button -->
        <button
          type="button"
          (click)="fermerModal()"
          class="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>

        <!-- Header -->
        <div class="flex flex-col items-center text-center gap-1 pt-2">
          <div class="w-12 h-12 rounded-full flex items-center justify-center mb-1"
               [ngClass]="versement.statut === 'VALIDE' ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-fixed text-primary'">
            <span class="material-symbols-outlined text-[28px]">{{ versement.statut === 'VALIDE' ? 'verified' : 'hourglass_top' }}</span>
          </div>
          <span class="text-xs uppercase font-bold tracking-widest"
                [ngClass]="versement.statut === 'VALIDE' ? 'text-emerald-700' : 'text-primary'">
            {{ versement.statut === 'VALIDE' ? 'Reçu Numérique Officiel' : (estExpire() ? 'Paiement Expiré' : 'Paiement en Cours') }}
          </span>
          <h3 class="font-serif-sacred text-2xl font-bold text-on-surface">Chorale Salve Regina</h3>
          <p class="text-xs text-on-surface-variant italic">« Qui bene cantat, bis orat »</p>
        </div>

        <!-- Receipt Card -->
        <div class="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 flex flex-col gap-2.5 text-sm">
          <div class="flex justify-between items-center pb-2 border-b border-outline-variant/30">
            <span class="text-on-surface-variant text-xs">Réf. Versement</span>
            <span class="font-mono font-bold text-primary">{{ versement.reference }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-on-surface-variant text-xs">Donateur / Choriste</span>
            <span class="font-semibold text-on-surface text-right">{{ versement.nomDonateur }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-on-surface-variant text-xs">Pupitre</span>
            <span class="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">{{ versement.pupitreLibelle || versement.pupitre }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-on-surface-variant text-xs">Motif</span>
            <span class="font-medium text-on-surface text-right">
              {{ versement.motifLibelle || versement.motif }}
            </span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-on-surface-variant text-xs">Moyen de paiement</span>
            <span class="font-bold text-secondary">{{ versement.operateurLibelle || versement.operateur }}</span>
          </div>

          <div class="flex justify-between items-center pt-2 border-t border-outline-variant/30">
            <span class="font-bold text-on-surface">Montant Réglé</span>
            <span class="text-lg font-bold text-primary">{{ versement.montant | number }} FCFA</span>
          </div>

          <div class="flex justify-between items-center text-xs text-on-surface-variant">
            <span>Date &amp; Heure</span>
            <span>{{ versement.dateCreation | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>

          <div class="flex justify-between items-center text-xs font-bold p-2 rounded-lg"
               [ngClass]="versement.statut === 'VALIDE' ? 'text-emerald-700 bg-emerald-50' : (versement.statut === 'ANNULE' || estExpire() ? 'text-red-700 bg-red-50' : 'text-amber-800 bg-amber-50')">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">
                {{ versement.statut === 'VALIDE' ? 'check_circle' : (versement.statut === 'ANNULE' || estExpire() ? 'cancel' : 'hourglass_top') }}
              </span>
              Statut
            </span>
            <span>{{ versement.statut === 'VALIDE' ? 'VALIDÉ' : (versement.statut === 'ANNULE' || estExpire() ? 'ANNULÉ' : 'EN ATTENTE') }}</span>
          </div>
        </div>

        <!-- 1. CAS VALIDÉ : Succès et AUCUN bouton de paiement -->
        <div *ngIf="versement.statut === 'VALIDE'" class="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-center gap-2 text-emerald-800 text-xs font-bold shadow-sm">
          <span class="material-symbols-outlined text-[20px] text-emerald-600">verified</span>
          <span>Paiement validé avec succès ! Reçu officiel enregistré.</span>
        </div>

        <!-- 2. CAS EN ATTENTE (Moins de 5 min) : Lien vers Wave/GeniusPay + Polling automatique -->
        <div *ngIf="versement.statut === 'EN_ATTENTE' && !estExpire()" class="flex flex-col gap-2">
          <a
            *ngIf="versement.urlPaiement"
            [href]="versement.urlPaiement"
            target="_blank"
            class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-secondary to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-95 transition-all text-center">
            <span class="material-symbols-outlined text-[18px]">open_in_new</span>
            Payer directement sur Mobile Money (Wave / GeniusPay)
          </a>

          <div class="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
            <span class="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
            <span>Vérification automatique du paiement Wave en cours...</span>
          </div>
        </div>

        <!-- 3. CAS EXPIRÉ / ANNULÉ après 5 minutes -->
        <div *ngIf="versement.statut === 'ANNULE' || (versement.statut === 'EN_ATTENTE' && estExpire())" class="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center gap-2 text-red-800 text-xs font-semibold">
          <span class="material-symbols-outlined text-[20px] text-red-600">cancel</span>
          <span>Paiement annulé (délai de 5 minutes dépassé sans validation).</span>
        </div>

        <!-- Action buttons (Print / Share) -->
        <div class="flex gap-2">
          <button
            type="button"
            (click)="imprimer()"
            class="flex-1 py-2.5 px-3 rounded-xl bg-surface-container text-on-surface font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-surface-variant transition-colors">
            <span class="material-symbols-outlined text-[16px]">print</span>
            Imprimer / PDF
          </button>
          <button
            type="button"
            (click)="partager()"
            class="flex-1 py-2.5 px-3 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-primary-container transition-colors">
            <span class="material-symbols-outlined text-[16px]">share</span>
            Partager
          </button>
        </div>
      </div>
    </div>
  `
})
export class ReceiptModalComponent implements OnInit, OnDestroy {
  @Input() versement: Versement | null = null;
  @Output() fermer = new EventEmitter<void>();

  private readonly versementService = inject(VersementService);
  private pollSub?: Subscription;

  ngOnInit(): void {
    this.demarrerPollingSiEnAttente();
  }

  ngOnDestroy(): void {
    this.arreterPolling();
  }

  @HostListener('window:focus')
  onWindowFocus(): void {
    // Dès que l'utilisateur revient de l'app Wave ou de la page GeniusPay
    if (this.versement && this.versement.statut === 'EN_ATTENTE') {
      this.verifierPaiement();
    }
  }

  fermerModal(): void {
    this.arreterPolling();
    this.fermer.emit();
  }

  estExpire(): boolean {
    if (!this.versement || !this.versement.dateCreation) return false;
    const created = new Date(this.versement.dateCreation).getTime();
    const now = Date.now();
    return (now - created) > (5 * 60 * 1000);
  }

  private demarrerPollingSiEnAttente(): void {
    if (this.versement && this.versement.statut === 'EN_ATTENTE' && !this.estExpire()) {
      this.arreterPolling();
      // Vérification toutes les 2.5 secondes
      this.pollSub = interval(2500).subscribe(() => {
        if (!this.versement || this.versement.statut !== 'EN_ATTENTE' || this.estExpire()) {
          this.arreterPolling();
          return;
        }
        this.verifierPaiement();
      });
    }
  }

  private arreterPolling(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = undefined;
    }
  }

  verifierPaiement(): void {
    if (!this.versement) return;
    this.versementService.verifierPaiement(this.versement.reference).subscribe({
      next: (res) => {
        if (res) {
          this.versement = res;
          if (res.statut === 'VALIDE' || res.statut === 'ANNULE') {
            this.arreterPolling();
          }
        }
      },
      error: () => {}
    });
  }

  imprimer(): void {
    window.print();
  }

  partager(): void {
    if (this.versement && navigator.share) {
      navigator.share({
        title: 'Reçu Salve Regina - ' + this.versement.reference,
        text: `Reçu de cotisation/don Salve Regina de ${this.versement.montant} FCFA pour ${this.versement.nomDonateur}. Réf: ${this.versement.reference}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      alert('Reçu copié ! Référence : ' + (this.versement?.reference || ''));
    }
  }
}
