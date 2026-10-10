import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Versement } from '../../../core/models/versement.model';
import { VersementService } from '../../../core/services/versement.service';

@Component({
  selector: 'app-receipt-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="versement" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-primary-fixed flex flex-col gap-4 relative">

        <!-- Close button -->
        <button
          type="button"
          (click)="fermer.emit()"
          class="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>

        <!-- Header -->
        <div class="flex flex-col items-center text-center gap-1 pt-2">
          <div class="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-1">
            <span class="material-symbols-outlined text-[28px]">{{ versement.statut === 'VALIDE' ? 'verified' : 'pending' }}</span>
          </div>
          <span class="text-xs uppercase font-bold tracking-widest text-primary">
            {{ versement.statut === 'VALIDE' ? 'Reçu Numérique Officiel' : 'Paiement en Cours' }}
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
            <span class="font-medium text-on-surface">{{ versement.motifLibelle || versement.motif }}</span>
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
               [ngClass]="versement.statut === 'VALIDE' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-800 bg-amber-50'">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">{{ versement.statut === 'VALIDE' ? 'check_circle' : 'hourglass_top' }}</span>
              Statut
            </span>
            <span>{{ versement.statutLibelle || versement.statut }}</span>
          </div>
        </div>

        <!-- Direct Real Payment Action Button if pending -->
        <div *ngIf="versement.urlPaiement" class="flex flex-col gap-2">
          <a
            [href]="versement.urlPaiement"
            target="_blank"
            class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-secondary to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-95 transition-all text-center">
            <span class="material-symbols-outlined text-[18px]">open_in_new</span>
            Payer directement sur Mobile Money (GeniusPay)
          </a>
          <button
            type="button"
            (click)="verifierPaiement()"
            [disabled]="verifiant"
            class="w-full py-2 px-3 rounded-lg bg-surface-container text-on-surface font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-surface-variant transition-colors disabled:opacity-50">
            <span *ngIf="verifiant" class="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span *ngIf="!verifiant" class="material-symbols-outlined text-[16px]">sync</span>
            <span>{{ verifiant ? 'Vérification...' : 'Actualiser le statut du paiement' }}</span>
          </button>
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
export class ReceiptModalComponent {
  @Input() versement: Versement | null = null;
  @Output() fermer = new EventEmitter<void>();

  private readonly versementService = inject(VersementService);
  verifiant = false;

  verifierPaiement(): void {
    if (!this.versement) return;
    this.verifiant = true;
    this.versementService.verifierPaiement(this.versement.reference).subscribe({
      next: (res) => {
        this.verifiant = false;
        this.versement = res;
      },
      error: () => {
        this.verifiant = false;
      }
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
