import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { VersementService } from '../../core/services/versement.service';
import { Pupitre, Versement } from '../../core/models/versement.model';
import { ReceiptModalComponent } from '../../shared/components/receipt-modal/receipt-modal.component';

@Component({
  selector: 'app-cotisations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReceiptModalComponent],
  template: `
    <div class="flex flex-col w-full max-w-xl mx-auto px-margin pb-12 pt-2">
      <!-- Title Header -->
      <div class="flex justify-between items-center mb-4">
        <div>
          <h1 class="font-serif-sacred text-2xl font-bold text-on-surface">Cotisations &amp; Dépôts</h1>
          <p class="text-xs text-on-surface-variant">Registre des cotisations des choristes Salve Regina</p>
        </div>
        <a
          routerLink="/accueil"
          class="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm flex items-center gap-1 active:scale-95 transition-transform">
          <span class="material-symbols-outlined text-[16px]">add</span>
          Verser
        </a>
      </div>

      <!-- Filtre Période -->
      <div class="bg-surface-container-low/80 p-3 rounded-2xl border border-outline-variant/30 flex flex-col gap-2 mb-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
            Période
          </span>
          <button
            *ngIf="dateDebut || dateFin"
            type="button"
            (click)="effacerPeriode()"
            class="text-[11px] text-primary hover:underline font-semibold flex items-center gap-0.5">
            <span class="material-symbols-outlined text-[14px]">close</span>
            Effacer
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="text-[10px] text-on-surface-variant font-semibold block mb-0.5">Date début</label>
            <input
              type="date"
              [(ngModel)]="dateDebut"
              [max]="dateFin || null"
              (change)="onChangementDateDebut()"
              class="w-full px-2.5 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 focus:border-primary focus:outline-none text-xs text-on-surface font-medium">
          </div>
          <div>
            <label class="text-[10px] text-on-surface-variant font-semibold block mb-0.5">Date fin</label>
            <input
              type="date"
              [(ngModel)]="dateFin"
              [min]="dateDebut || null"
              (change)="onChangementDateFin()"
              class="w-full px-2.5 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 focus:border-primary focus:outline-none text-xs text-on-surface font-medium">
          </div>
        </div>
      </div>

      <!-- Total Metrics Card -->
      <div class="grid grid-cols-2 gap-2 mb-3">
        <div class="bg-surface-container-low rounded-xl p-3 border border-outline-variant/20 flex flex-col justify-between">
          <div>
            <span class="text-[11px] text-on-surface-variant font-medium">
              Total Collecté {{ motifActif !== 'TOUS' ? '(' + getLibelleMotifActif() + ')' : '' }}
            </span>
            <div class="text-xl font-extrabold text-primary mt-0.5">
              {{ totalCollecteFiltre | number }} F
            </div>
          </div>
          <span class="text-[10px] text-on-surface-variant/70 mt-1">
            {{ (dateDebut || dateFin) ? 'Sur la période' : 'Historique complet' }}
          </span>
        </div>

        <div class="bg-surface-container-low rounded-xl p-3 border border-outline-variant/20 flex flex-col justify-between">
          <div>
            <span class="text-[11px] text-on-surface-variant font-medium">Versements Encaissés</span>
            <div class="text-xl font-extrabold text-secondary mt-0.5">
              {{ versementsFiltres.length }}
            </div>
          </div>
          <span class="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-0.5">
            <span class="material-symbols-outlined text-[12px]">verified</span>
            Paiements confirmés
          </span>
        </div>
      </div>

      <!-- Répartition du total collecté par motif -->
      <div *ngIf="motifActif === 'TOUS' && totalParMotifFiltres.length > 0" class="flex flex-col gap-1.5 p-2.5 mb-3 bg-surface-container-low/60 rounded-xl border border-outline-variant/20">
        <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
          Total collecté par motif :
        </span>
        <div class="flex flex-wrap gap-1.5">
          <div
            *ngFor="let item of totalParMotifFiltres"
            class="px-2 py-1 rounded-lg bg-surface-container text-xs flex items-center gap-1.5 border border-outline-variant/20">
            <span class="font-medium text-on-surface-variant text-[11px]">{{ item.libelle }}:</span>
            <span class="font-bold text-primary text-[11px]">{{ item.total | number }} F</span>
          </div>
        </div>
      </div>

      <!-- Filtres Combinés: Motif & Pupitre -->
      <div class="flex flex-col gap-2 mb-3 bg-surface-container-low/60 p-2.5 rounded-xl border border-outline-variant/20">
        <!-- 1. Filtre par motif -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            type="button"
            (click)="filtrerMotif('TOUS')"
            [ngClass]="motifActif === 'TOUS' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'bg-surface-container text-on-surface-variant font-medium'"
            class="px-2.5 py-1 rounded-full text-xs shrink-0 transition-all">
            Tous motifs
          </button>
          <button
            *ngFor="let m of motifsDisponibles"
            type="button"
            (click)="filtrerMotif(m.code)"
            [ngClass]="motifActif === m.code ? 'bg-primary text-on-primary font-bold shadow-sm' : 'bg-surface-container text-on-surface-variant font-medium'"
            class="px-2.5 py-1 rounded-full text-xs shrink-0 transition-all">
            {{ m.libelle }}
          </button>
        </div>

        <!-- 2. Filtre par pupitre -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none pt-1.5 border-t border-outline-variant/15">
          <button
            type="button"
            (click)="filtrerPupitre('TOUS')"
            [ngClass]="pupitreActif === 'TOUS' ? 'bg-secondary text-on-secondary font-bold shadow-sm' : 'bg-surface-container text-on-surface-variant font-medium'"
            class="px-2.5 py-1 rounded-full text-xs shrink-0 transition-all">
            Tous pupitres
          </button>
          <button
            *ngFor="let p of pupitres"
            type="button"
            (click)="filtrerPupitre(p)"
            [ngClass]="pupitreActif === p ? 'bg-secondary text-on-secondary font-bold shadow-sm' : 'bg-surface-container text-on-surface-variant font-medium'"
            class="px-2.5 py-1 rounded-full text-xs shrink-0 transition-all">
            {{ p }}
          </button>
        </div>
      </div>

      <!-- Loading skeleton / Empty state / List -->
      <div *ngIf="chargement" class="flex flex-col gap-3 py-6 items-center">
        <div class="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span class="text-xs text-on-surface-variant">Chargement des versements...</span>
      </div>

      <div *ngIf="!chargement && versementsFiltres.length === 0" class="bg-surface-container-low rounded-2xl p-8 text-center flex flex-col items-center gap-2">
        <span class="material-symbols-outlined text-4xl text-outline">receipt_long</span>
        <p class="text-sm font-semibold text-on-surface">Aucune cotisation trouvée pour ces critères</p>
        <p class="text-xs text-on-surface-variant">Modifiez la période ou effectuez un versement express.</p>
        <button
          *ngIf="dateDebut || dateFin"
          type="button"
          (click)="effacerPeriode()"
          class="mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all">
          Voir tout l'historique
        </button>
      </div>

      <div *ngIf="!chargement && versementsFiltres.length > 0" class="flex flex-col gap-2.5">
        <div
          *ngFor="let v of versementsFiltres"
          (click)="afficherRecu(v)"
          class="bg-surface-container-lowest rounded-xl p-3.5 shadow-sm border border-outline-variant/30 flex items-center justify-between hover:bg-surface-container-low cursor-pointer active:scale-[0.99] transition-all">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-full bg-primary-fixed/60 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {{ v.nomDonateur ? v.nomDonateur.charAt(0).toUpperCase() : 'C' }}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-semibold text-sm text-on-surface truncate">{{ v.nomDonateur }}</span>
              <div class="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span class="px-1.5 py-0.2 rounded bg-surface-container text-[10px] font-bold">{{ v.pupitreLibelle || v.pupitre }}</span>
                <span>•</span>
                <span class="text-[11px] font-semibold text-secondary truncate">{{ v.motifLibelle || v.motif }}</span>
                <span *ngIf="v.dateCreation" class="text-[10px] text-outline">• {{ v.dateCreation | date:'dd/MM' }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-end shrink-0 pl-2">
            <span class="font-bold text-sm text-primary">{{ v.montant | number }} F</span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 text-emerald-700 bg-emerald-50 flex items-center gap-0.5">
              <span class="material-symbols-outlined text-[12px]">verified</span>
              VALIDÉ
            </span>
          </div>
        </div>
      </div>

      <!-- Receipt modal -->
      <app-receipt-modal
        *ngIf="recuSelectionne"
        [versement]="recuSelectionne"
        (fermer)="fermerRecu()">
      </app-receipt-modal>
    </div>
  `
})
export class CotisationsComponent implements OnInit {
  private readonly versementService = inject(VersementService);
  private readonly route = inject(ActivatedRoute);

  versements: Versement[] = [];
  versementsFiltres: Versement[] = [];
  chargement = true;
  pupitreActif: string = 'TOUS';
  motifActif: string = 'TOUS';
  recuSelectionne: Versement | null = null;

  dateDebut: string = '';
  dateFin: string = '';

  readonly pupitres = ['Soprano', 'Alto', 'Ténor', 'Basse', 'Ami / Bienfaiteur'];

  readonly motifsPredefinis = [
    { code: 'COTISATION', libelle: 'Cotisation' },
    { code: 'DON_LIBRE', libelle: 'Don Libre' },
    { code: 'CONCERT', libelle: 'Concert' },
    { code: 'UNIFORME', libelle: 'Uniforme & Tenue' },
    { code: 'PROJET', libelle: 'Projet Spécial' },
    { code: 'AUTRE', libelle: 'Autre' }
  ];

  get motifsDisponibles(): { code: string; libelle: string }[] {
    const map = new Map<string, string>();
    this.motifsPredefinis.forEach(m => map.set(m.code, m.libelle));
    this.versements.forEach(v => {
      if (v.motif && !map.has(v.motif)) {
        map.set(v.motif, v.motifLibelle || v.motif);
      }
    });
    return Array.from(map.entries()).map(([code, libelle]) => ({ code, libelle }));
  }

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParams;
    const ref = qp['reference'] || qp['ref'] || qp['order_id'] || qp['versementRef'] || qp['simulated_ref'];
    if (ref) {
      this.versementService.obtenirParReference(ref).subscribe({
        next: (v) => {
          if (v) this.recuSelectionne = v;
        }
      });
    }
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.chargement = true;
    this.versementService.listerVersements(undefined, undefined, 'VALIDE').subscribe({
      next: (data) => {
        this.versements = (data || []).filter(v => v.statut === 'VALIDE');
        this.appliquerFiltre();
        this.chargement = false;
      },
      error: () => {
        this.versements = [];
        this.appliquerFiltre();
        this.chargement = false;
      }
    });
  }

  filtrerPupitre(pupitre: string): void {
    this.pupitreActif = pupitre;
    this.appliquerFiltre();
  }

  filtrerMotif(motif: string): void {
    this.motifActif = motif;
    this.appliquerFiltre();
  }

  onChangementDateDebut(): void {
    if (this.dateDebut && this.dateFin && this.dateDebut > this.dateFin) {
      this.dateFin = this.dateDebut;
    }
    this.appliquerFiltre();
  }

  onChangementDateFin(): void {
    if (this.dateDebut && this.dateFin && this.dateFin < this.dateDebut) {
      this.dateDebut = this.dateFin;
    }
    this.appliquerFiltre();
  }

  effacerPeriode(): void {
    this.dateDebut = '';
    this.dateFin = '';
    this.appliquerFiltre();
  }

  getLibelleMotifActif(): string {
    const item = this.motifsDisponibles.find(m => m.code === this.motifActif);
    return item ? item.libelle : this.motifActif;
  }

  get totalCollecteFiltre(): number {
    return this.versementsFiltres
      .filter(v => v.statut === 'VALIDE')
      .reduce((sum, v) => sum + (v.montant || 0), 0);
  }

  get nbVersementsValidesFiltres(): number {
    return this.versementsFiltres.filter(v => v.statut === 'VALIDE').length;
  }

  get totalParMotifFiltres(): { code: string; libelle: string; total: number }[] {
    const totals = new Map<string, number>();
    this.versementsFiltres
      .filter(v => v.statut === 'VALIDE')
      .forEach(v => {
        const key = v.motif || 'AUTRE';
        totals.set(key, (totals.get(key) || 0) + (v.montant || 0));
      });

    return Array.from(totals.entries()).map(([code, total]) => {
      const info = this.motifsDisponibles.find(m => m.code === code);
      return {
        code,
        libelle: info ? info.libelle : code,
        total
      };
    }).sort((a, b) => b.total - a.total);
  }

  appliquerFiltre(): void {
    this.versementsFiltres = this.versements.filter(v => {
      const matchPupitre = this.pupitreActif === 'TOUS' ||
        (v.pupitreLibelle && v.pupitreLibelle.toLowerCase().includes(this.pupitreActif.toLowerCase())) ||
        (v.pupitre && v.pupitre.toLowerCase().includes(this.pupitreActif.toLowerCase())) ||
        (v.nomDonateur && v.nomDonateur.toLowerCase().includes(this.pupitreActif.toLowerCase()));

      const matchMotif = this.motifActif === 'TOUS' ||
        v.motif === this.motifActif ||
        (v.motifLibelle && v.motifLibelle.toLowerCase().includes(this.motifActif.toLowerCase()));

      let matchDate = true;
      if (this.dateDebut && v.dateCreation) {
        if (v.dateCreation.substring(0, 10) < this.dateDebut) matchDate = false;
      }
      if (this.dateFin && v.dateCreation) {
        if (v.dateCreation.substring(0, 10) > this.dateFin) matchDate = false;
      }

      return matchPupitre && matchMotif && matchDate;
    });
  }

  afficherRecu(v: Versement): void {
    this.recuSelectionne = v;
  }

  fermerRecu(): void {
    this.recuSelectionne = null;
    this.chargerDonnees();
  }
}
