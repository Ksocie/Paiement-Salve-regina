import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VersementService } from '../../core/services/versement.service';
import { Statistiques } from '../../core/models/versement.model';

@Component({
  selector: 'app-transparence',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col w-full max-w-xl mx-auto px-margin pb-12 pt-2">
      <!-- Title Header -->
      <div class="mb-4">
        <div class="flex items-center gap-1.5 text-primary mb-0.5">
          <span class="material-symbols-outlined text-[18px]">verified_user</span>
          <span class="text-[11px] font-bold uppercase tracking-wider">Gouvernance Sacrée</span>
        </div>
        <h1 class="font-serif-sacred text-2xl font-bold text-on-surface">Transparence Financière</h1>
        <p class="text-xs text-on-surface-variant">Visibilité en temps réel sur les fonds collectés et leur usage</p>
      </div>

      <!-- Main KPI Card -->
      <div class="bg-gradient-to-br from-primary to-primary-container text-on-primary-container rounded-2xl p-5 shadow-lg mb-4 flex flex-col gap-3">
        <span class="text-xs uppercase font-bold tracking-widest text-primary-fixed">Total des Fonds Collectés</span>
        <div class="flex items-baseline gap-2">
          <span class="font-serif-sacred text-4xl font-extrabold text-white">
            {{ (stats?.totalCollecte || 0) | number }}
          </span>
          <span class="text-base font-bold text-primary-fixed">FCFA</span>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/20">
          <div class="flex flex-col">
            <span class="text-[10px] text-white/80 font-medium">Versements Validés</span>
            <span class="text-lg font-bold text-white">{{ stats?.nombreVersementsValides || 0 }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] text-white/80 font-medium">Taux d'Aboutissement</span>
            <span class="text-lg font-bold text-emerald-300">
              {{ (stats && stats.nombreTotalVersements) ? ((stats.nombreVersementsValides / stats.nombreTotalVersements) * 100 | number:'1.0-0') : 100 }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Répartition par Pupitres -->
      <section class="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30 mb-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <h2 class="font-bold text-sm text-on-surface flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-[18px]">group</span>
            Contribution par Pupitre
          </h2>
          <span class="text-[10px] text-on-surface-variant font-medium">Temps réel</span>
        </div>

        <div class="flex flex-col gap-2.5">
          <div *ngFor="let item of pupitreStats" class="flex flex-col gap-1">
            <div class="flex justify-between items-center text-xs">
              <span class="font-medium text-on-surface">{{ item.nom }}</span>
              <span class="font-bold text-primary">{{ item.montant | number }} F</span>
            </div>
            <div class="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                class="h-full bg-primary rounded-full transition-all duration-500"
                [style.width.%]="item.pourcentage">
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Répartition par Motif & Opérateur -->
      <section class="grid grid-cols-2 gap-3 mb-4">
        <!-- Par motif -->
        <div class="bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm border border-outline-variant/30 flex flex-col gap-2">
          <h3 class="font-bold text-xs text-on-surface flex items-center gap-1">
            <span class="material-symbols-outlined text-secondary text-[16px]">pie_chart</span>
            Par Motif
          </h3>
          <div class="flex flex-col gap-1.5 text-[11px]">
            <div *ngFor="let m of motifStats" class="flex justify-between items-center">
              <span class="text-on-surface-variant truncate">{{ m.nom }}</span>
              <span class="font-bold text-on-surface">{{ m.montant | number }} F</span>
            </div>
          </div>
        </div>

        <!-- Par Opérateur -->
        <div class="bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm border border-outline-variant/30 flex flex-col gap-2">
          <h3 class="font-bold text-xs text-on-surface flex items-center gap-1">
            <span class="material-symbols-outlined text-tertiary text-[16px]">credit_card</span>
            Par Réseau
          </h3>
          <div class="flex flex-col gap-1.5 text-[11px]">
            <div *ngFor="let op of operateurStats" class="flex justify-between items-center">
              <span class="text-on-surface-variant truncate">{{ op.nom }}</span>
              <span class="font-bold text-on-surface">{{ op.montant | number }} F</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Transparency & Assurance Shield -->
      <div class="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/20 flex items-start gap-3">
        <span class="material-symbols-outlined text-primary text-[24px] shrink-0 mt-0.5">security</span>
        <div class="flex flex-col gap-1">
          <span class="font-bold text-xs text-on-surface">Audit &amp; Traçabilité 100% Intègre</span>
          <p class="text-[11px] text-on-surface-variant leading-relaxed">
            Chaque don ou cotisation est scellé par une référence unique horodatée et transmise instantanément au comité de gestion de la chorale.
          </p>
        </div>
      </div>
    </div>
  `
})
export class TransparenceComponent implements OnInit {
  private readonly versementService = inject(VersementService);

  stats: Statistiques | null = null;
  pupitreStats: { nom: string; montant: number; pourcentage: number }[] = [];
  motifStats: { nom: string; montant: number }[] = [];
  operateurStats: { nom: string; montant: number }[] = [];

  ngOnInit(): void {
    this.versementService.obtenirStatistiques().subscribe({
      next: (s) => {
        this.stats = s;
        this.calculerGraphiques(s);
      }
    });
  }

  private calculerGraphiques(s: Statistiques): void {
    const total = s.totalCollecte || 0;

    this.pupitreStats = Object.entries(s.totalParPupitre || {})
      .filter(([_, montant]) => montant > 0)
      .map(([nom, montant]) => ({
        nom,
        montant,
        pourcentage: total > 0 ? Math.min(100, Math.round((montant / total) * 100)) : 0
      }));

    this.motifStats = Object.entries(s.totalParMotif || {})
      .filter(([_, montant]) => montant > 0)
      .map(([nom, montant]) => ({
        nom,
        montant
      }));

    this.operateurStats = Object.entries(s.totalParOperateur || {})
      .filter(([_, montant]) => montant > 0)
      .map(([nom, montant]) => ({
        nom,
        montant
      }));
  }
}
