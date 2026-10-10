import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VersementService } from '../../core/services/versement.service';
import { CampagneMotif, Statistiques, Versement } from '../../core/models/versement.model';
import { ReceiptModalComponent } from '../../shared/components/receipt-modal/receipt-modal.component';

@Component({
  selector: 'app-tresorerie-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReceiptModalComponent],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
      (click)="fermerModal()">
      <div
        class="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-outline-variant/30 flex flex-col max-h-[92vh] overflow-hidden relative"
        (click)="$event.stopPropagation()">

        <!-- Bouton Fermer (Déclenche le verrouillage automatique) -->
        <button
          type="button"
          (click)="fermerModal()"
          class="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-90 transition-transform z-10"
          title="Fermer et verrouiller">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>

        <!-- 1. ÉCRAN DE DÉVERROUILLAGE PAR CODE PIN -->
        <div *ngIf="!connecte" class="flex flex-col items-center text-center gap-3 py-6">
          <div class="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary shadow-sm mb-1">
            <span class="material-symbols-outlined text-[30px]">lock</span>
          </div>

          <h3 class="font-serif-sacred text-2xl font-bold text-on-surface">Espace Trésorerie</h3>
          <p class="text-xs text-on-surface-variant max-w-xs">
            Accès sécurisé réservé au bureau de la chorale. Entrez votre code secret.
          </p>

          <form (submit)="validerPin()" class="w-full max-w-xs flex flex-col gap-3 mt-3">
            <div class="relative flex items-center">
              <input
                [(ngModel)]="codePin"
                name="codePin"
                [type]="afficherCode ? 'text' : 'password'"
                inputmode="numeric"
                maxlength="10"
                autofocus
                placeholder="• • • • • •"
                class="w-full py-3 px-10 text-center tracking-[0.4em] text-xl font-bold bg-surface-container-low rounded-xl border border-outline-variant/40 focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all">
              <button
                type="button"
                (click)="afficherCode = !afficherCode"
                class="absolute right-3 p-1 text-on-surface-variant hover:text-primary transition-colors"
                title="Afficher/Masquer le code">
                <span class="material-symbols-outlined text-[20px]">{{ afficherCode ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>

            <div *ngIf="erreurPin" class="p-2.5 rounded-lg bg-red-50 text-error text-xs font-semibold flex items-center justify-center gap-1.5 border border-red-200">
              <span class="material-symbols-outlined text-[16px] shrink-0">error</span>
              <span>{{ erreurPin }}</span>
            </div>

            <button
              type="submit"
              [disabled]="chargement"
              class="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary-container active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <span *ngIf="chargement" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ chargement ? 'Vérification...' : 'Déverrouiller' }}</span>
            </button>
          </form>
        </div>

        <!-- 2. TABLEAU DE BORD TRÉSORERIE (QUAND CONNECTÉ) -->
        <div *ngIf="connecte" class="flex flex-col gap-3.5 overflow-y-auto pr-1">
          <!-- Header Dashboard -->
          <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30 pr-10">
            <div class="flex items-center gap-2">
              <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <span class="material-symbols-outlined text-[20px]">receipt_long</span>
              </div>
              <div>
                <h3 class="font-serif-sacred text-xl font-bold text-on-surface">Historique des transactions</h3>
                <span class="text-[11px] text-on-surface-variant font-medium">Gestion financière Salve Regina</span>
              </div>
            </div>

            <div class="flex items-center gap-1.5 mr-2">
              <button
                type="button"
                (click)="toggleModeChangerPin()"
                class="px-2.5 py-1 rounded-lg text-xs font-semibold text-primary bg-primary-fixed/40 hover:bg-primary-fixed/70 flex items-center gap-1 transition-colors">
                <span class="material-symbols-outlined text-[15px]">key</span>
                {{ modeChangerPin ? 'Annuler' : 'Changer PIN' }}
              </button>
            </div>
          </div>

          <!-- Formulaire de Changement de Code PIN -->
          <div *ngIf="modeChangerPin" class="p-4 bg-surface-container-low rounded-xl border border-primary/30 flex flex-col gap-3 animate-fadeIn">
            <div class="flex items-center gap-1.5 text-xs font-bold text-primary">
              <span class="material-symbols-outlined text-[18px]">key</span>
              <span>Modifier le code secret PIN</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <label class="text-[10px] text-on-surface-variant font-semibold">Ancien PIN</label>
                <input
                  [(ngModel)]="pinAncien"
                  type="password"
                  maxlength="10"
                  placeholder="Code actuel"
                  class="w-full px-2.5 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 focus:border-primary focus:outline-none">
              </div>
              <div>
                <label class="text-[10px] text-on-surface-variant font-semibold">Nouveau PIN</label>
                <input
                  [(ngModel)]="pinNouveau"
                  type="password"
                  maxlength="10"
                  placeholder="Nouveau code"
                  class="w-full px-2.5 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 focus:border-primary focus:outline-none">
              </div>
              <div>
                <label class="text-[10px] text-on-surface-variant font-semibold">Confirmation</label>
                <input
                  [(ngModel)]="pinConfirmation"
                  type="password"
                  maxlength="10"
                  placeholder="Confirmer"
                  class="w-full px-2.5 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 focus:border-primary focus:outline-none">
              </div>
            </div>

            <div *ngIf="messagePinErreur" class="p-2 rounded-lg bg-red-50 text-error text-xs font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px]">error</span>
              {{ messagePinErreur }}
            </div>

            <div *ngIf="messagePinSucces" class="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px]">check_circle</span>
              {{ messagePinSucces }}
            </div>

            <div class="flex justify-end gap-2 pt-1">
              <button
                type="button"
                (click)="modeChangerPin = false"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container">
                Annuler
              </button>
              <button
                type="button"
                [disabled]="chargementChangementPin"
                (click)="enregistrerNouveauPin()"
                class="px-3.5 py-1.5 rounded-lg text-xs font-bold text-on-primary bg-primary hover:bg-primary-container shadow-sm flex items-center gap-1.5 disabled:opacity-50">
                <span *ngIf="chargementChangementPin" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Enregistrer</span>
              </button>
            </div>
          </div>

          <!-- CONTENU AFFICHÉ UNIQUEMENT QUAND ON NE MODIFIE PAS LE PIN -->
          <ng-container *ngIf="!modeChangerPin">

            <!-- 1. Filtre par Date (Date Début & Date Fin uniquement - Aujourd'hui par défaut) -->
            <div class="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                  <span class="material-symbols-outlined text-[15px] text-primary">calendar_month</span>
                  Période
                </span>
                <button
                  *ngIf="dateDebut || dateFin"
                  type="button"
                  (click)="reinitialiserDates()"
                  class="text-[10px] text-primary hover:underline font-semibold flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-[13px]">close</span>
                  Effacer
                </button>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label class="text-[10px] text-on-surface-variant font-semibold">Date début</label>
                  <input
                    type="date"
                    [(ngModel)]="dateDebut"
                    (change)="onChangementFiltreDate()"
                    class="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 focus:border-primary focus:outline-none text-xs font-medium">
                </div>
                <div>
                  <label class="text-[10px] text-on-surface-variant font-semibold">Date fin</label>
                  <input
                    type="date"
                    [(ngModel)]="dateFin"
                    (change)="onChangementFiltreDate()"
                    class="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 focus:border-primary focus:outline-none text-xs font-medium">
                </div>
              </div>
            </div>

            <!-- Total Metrics Card -->
            <div class="grid grid-cols-2 gap-2">
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
                  <span class="text-[11px] text-on-surface-variant font-medium">Versements Validés</span>
                  <div class="text-xl font-extrabold text-secondary mt-0.5">
                    {{ nbVersementsValidesFiltres }} / {{ versementsFiltres.length }}
                  </div>
                </div>
                <span class="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-[12px]">verified</span>
                  Paiements confirmés
                </span>
              </div>
            </div>

            <!-- Répartition du total collecté par motif (si tous motifs sélectionnés) -->
            <div *ngIf="motifActif === 'TOUS' && totalParMotifFiltres.length > 0" class="flex flex-col gap-1.5 p-2.5 bg-surface-container-low/60 rounded-xl border border-outline-variant/20">
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

            <!-- Filtres combinés: Motif & Pupitre -->
            <div class="flex flex-col gap-2.5 bg-surface-container-low/70 p-3 rounded-xl border border-outline-variant/25">

              <!-- 1. Filtre par Motif -->
              <div class="flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                    <span class="material-symbols-outlined text-[15px] text-primary">sell</span>
                    Filtrer par motif
                  </span>
                  <span
                    *ngIf="motifActif !== 'TOUS'"
                    (click)="filtrerMotif('TOUS')"
                    class="text-[10px] text-primary font-semibold cursor-pointer hover:underline">
                    Tous motifs
                  </span>
                </div>
                <div class="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  <button
                    type="button"
                    (click)="filtrerMotif('TOUS')"
                    [ngClass]="motifActif === 'TOUS' ? 'bg-primary text-on-primary font-bold shadow-sm' : 'bg-surface-container text-on-surface-variant font-medium'"
                    class="px-2.5 py-1 rounded-full text-xs shrink-0 transition-all">
                    Tous les motifs
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
              </div>

              <!-- 3. Filtre par pupitre -->
              <div class="flex flex-col gap-1 pt-1.5 border-t border-outline-variant/15">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                    <span class="material-symbols-outlined text-[15px] text-secondary">group</span>
                    Filtrer par pupitre
                  </span>
                  <span
                    *ngIf="pupitreActif !== 'TOUS'"
                    (click)="filtrerPupitre('TOUS')"
                    class="text-[10px] text-secondary font-semibold cursor-pointer hover:underline">
                    Tous pupitres
                  </span>
                </div>
                <div class="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  <button
                    type="button"
                    (click)="filtrerPupitre('TOUS')"
                    [ngClass]="pupitreActif === 'TOUS' ? 'bg-secondary text-on-secondary font-bold shadow-sm' : 'bg-surface-container text-on-surface-variant font-medium'"
                    class="px-2.5 py-1 rounded-full text-xs shrink-0 transition-all">
                    Tous
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

            </div>

            <!-- List of Versements -->
            <div class="flex flex-col gap-2">
              <div class="flex justify-between items-center text-xs text-on-surface-variant font-bold px-1">
                <span>Choriste, Motif &amp; Année</span>
                <span>Montant &amp; Statut</span>
              </div>

              <div *ngIf="chargementDonnees" class="py-8 text-center text-xs text-on-surface-variant flex flex-col items-center gap-2">
                <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Chargement des données...</span>
              </div>

              <div *ngIf="!chargementDonnees && versementsFiltres.length === 0" class="py-8 text-center text-xs text-on-surface-variant bg-surface-container-low rounded-xl p-4">
                Aucun versement trouvé pour les filtres sélectionnés.
              </div>

              <div
                *ngFor="let v of versementsFiltres"
                (click)="recuSelectionne = v"
                class="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-outline-variant/30 flex items-center justify-between hover:bg-surface-container-low cursor-pointer transition-all active:scale-[0.99]">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-full bg-primary-fixed/50 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {{ v.nomDonateur ? v.nomDonateur.charAt(0).toUpperCase() : 'C' }}
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="font-semibold text-xs text-on-surface truncate">{{ v.nomDonateur }}</span>
                    <div class="flex items-center gap-1.5 text-[10px] text-on-surface-variant flex-wrap">
                      <span class="font-bold text-primary">{{ v.pupitreLibelle || v.pupitre }}</span>
                      <span>•</span>
                      <span class="font-semibold text-secondary">
                        {{ v.campagne || (v.motifLibelle + ' (' + (v.annee || 2026) + ')') }}
                      </span>
                      <span>•</span>
                      <span>{{ v.dateCreation | date:'dd/MM HH:mm' }}</span>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col items-end shrink-0 pl-2">
                  <span class="font-bold text-xs text-primary">{{ v.montant | number }} F</span>
                  <span
                    [ngClass]="v.statut === 'VALIDE' ? 'text-emerald-700 bg-emerald-50' : (v.statut === 'ANNULE' ? 'text-red-700 bg-red-50' : 'text-amber-800 bg-amber-50')"
                    class="text-[9px] font-bold px-1.5 py-0.2 rounded-full mt-0.5">
                    {{ v.statut === 'VALIDE' ? 'VALIDÉ' : (v.statut === 'ANNULE' ? 'ANNULÉ' : 'EN ATTENTE') }}
                  </span>
                </div>
              </div>
            </div>

          </ng-container>
        </div>

        <!-- Reçu modal viewer for trésorier -->
        <app-receipt-modal
          *ngIf="recuSelectionne"
          [versement]="recuSelectionne"
          (fermer)="recuSelectionne = null">
        </app-receipt-modal>

      </div>
    </div>
  `
})
export class TresorerieModalComponent implements OnInit, OnDestroy {
  @Output() fermer = new EventEmitter<void>();

  private readonly versementService = inject(VersementService);

  connecte = false;
  codePin = '';
  erreurPin = '';
  chargement = false;
  chargementDonnees = false;

  afficherCode = false;

  modeChangerPin = false;
  pinAncien = '';
  pinNouveau = '';
  pinConfirmation = '';
  messagePinErreur = '';
  messagePinSucces = '';
  chargementChangementPin = false;

  statistiques: Statistiques | null = null;
  versements: Versement[] = [];
  versementsFiltres: Versement[] = [];
  campagnes: CampagneMotif[] = [];

  // Filtres
  dateDebut = new Date().toISOString().substring(0, 10);
  dateFin = new Date().toISOString().substring(0, 10);
  anneeActive: number | 'TOUTES' = 2026;
  pupitreActif = 'TOUS';
  motifActif = 'TOUS';

  recuSelectionne: Versement | null = null;

  readonly pupitres = ['Soprano', 'Alto', 'Ténor', 'Basse', 'Ami / Bienfaiteur'];

  readonly motifsPredefinis = [
    { code: 'COTISATION', libelle: 'Cotisation' },
    { code: 'DON_LIBRE', libelle: 'Don Libre' },
    { code: 'CONCERT', libelle: 'Concert' },
    { code: 'UNIFORME', libelle: 'Uniforme & Tenue' },
    { code: 'PROJET', libelle: 'Projet Spécial' },
    { code: 'AUTRE', libelle: 'Autre' }
  ];

  get anneesDisponibles(): number[] {
    const annees = new Set<number>([2026, 2025]);
    this.versements.forEach(v => {
      if (v.annee) annees.add(v.annee);
    });
    return Array.from(annees).sort((a, b) => b - a);
  }

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
    this.verrouiller();
  }

  ngOnDestroy(): void {
    this.verrouiller();
  }

  @HostListener('window:beforeunload')
  onPageLeave(): void {
    this.verrouiller();
  }

  fermerModal(): void {
    this.verrouiller();
    this.fermer.emit();
  }

  validerPin(): void {
    const pin = (this.codePin || '').trim();
    if (!pin) {
      this.erreurPin = 'Veuillez saisir votre code secret.';
      return;
    }

    this.chargement = true;
    this.erreurPin = '';

    this.versementService.authentifierPin(pin).subscribe({
      next: (res) => {
        this.chargement = false;
        if (res.valide) {
          this.versementService.enregistrerPin(pin);
          this.connecte = true;
          this.codePin = '';
          this.chargerDonnees();
        } else {
          this.erreurPin = 'Code PIN incorrect. Veuillez réessayer.';
        }
      },
      error: (err) => {
        this.chargement = false;
        console.error('Erreur authentification PIN:', err);
        if (err.status === 401) {
          this.erreurPin = err?.error?.message || 'Code PIN incorrect. Veuillez vérifier les 6 chiffres.';
        } else if (err.status === 0) {
          this.erreurPin = 'Impossible de contacter le serveur (vérifiez que le serveur est allumé).';
        } else {
          this.erreurPin = err?.error?.detail || err?.error?.message || `Erreur serveur (${err.status}).`;
        }
      }
    });
  }

  chargerDonnees(): void {
    this.chargementDonnees = true;

    // Charger les campagnes
    this.versementService.listerCampagnes(true).subscribe({
      next: (c) => this.campagnes = c
    });

    // Charger les versements selon la date par défaut
    this.versementService.listerVersements(
      undefined,
      undefined,
      undefined,
      undefined,
      this.dateDebut || undefined,
      this.dateFin || undefined
    ).subscribe({
      next: (data) => {
        this.versements = data;
        this.appliquerFiltre();
        this.chargementDonnees = false;
      },
      error: () => {
        this.versements = [];
        this.appliquerFiltre();
        this.chargementDonnees = false;
      }
    });
  }

  onChangementFiltreDate(): void {
    this.chargerDonnees();
  }

  reinitialiserDates(): void {
    this.dateDebut = '';
    this.dateFin = '';
    this.chargerDonnees();
  }

  filtrerAnnee(annee: number | 'TOUTES'): void {
    this.anneeActive = annee;
    this.appliquerFiltre();
  }

  filtrerPupitre(p: string): void {
    this.pupitreActif = p;
    this.appliquerFiltre();
  }

  filtrerMotif(m: string): void {
    this.motifActif = m;
    this.appliquerFiltre();
  }

  getLibelleMotifActif(): string {
    const item = this.motifsDisponibles.find(m => m.code === this.motifActif);
    return item ? item.libelle : this.motifActif;
  }

  private appliquerFiltre(): void {
    this.versementsFiltres = this.versements.filter(v => {
      const matchPupitre = this.pupitreActif === 'TOUS' ||
        (v.pupitreLibelle && v.pupitreLibelle.toLowerCase().includes(this.pupitreActif.toLowerCase())) ||
        (v.pupitre && v.pupitre.toLowerCase().includes(this.pupitreActif.toLowerCase()));

      const matchMotif = this.motifActif === 'TOUS' ||
        v.motif === this.motifActif ||
        (v.motifLibelle && v.motifLibelle.toLowerCase().includes(this.motifActif.toLowerCase()));

      return matchPupitre && matchMotif;
    });
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

  verrouiller(): void {
    this.versementService.deconnecterTresorerie();
    this.connecte = false;
    this.modeChangerPin = false;
    this.statistiques = null;
    this.versements = [];
    this.versementsFiltres = [];
    this.pupitreActif = 'TOUS';
    this.motifActif = 'TOUS';
    this.anneeActive = 2026;
  }

  toggleModeChangerPin(): void {
    this.modeChangerPin = !this.modeChangerPin;
    this.messagePinErreur = '';
    this.messagePinSucces = '';
    this.pinAncien = this.versementService.obtenirPin() || '';
    this.pinNouveau = '';
    this.pinConfirmation = '';
  }

  enregistrerNouveauPin(): void {
    const anc = (this.pinAncien || '').trim();
    const nouv = (this.pinNouveau || '').trim();
    const conf = (this.pinConfirmation || '').trim();

    if (!anc || !nouv || !conf) {
      this.messagePinErreur = 'Tous les champs sont obligatoires.';
      return;
    }

    if (nouv.length < 4) {
      this.messagePinErreur = 'Le nouveau code PIN doit comporter au moins 4 chiffres.';
      return;
    }

    if (nouv !== conf) {
      this.messagePinErreur = 'La confirmation ne correspond pas au nouveau code.';
      return;
    }

    this.chargementChangementPin = true;
    this.messagePinErreur = '';
    this.messagePinSucces = '';

    this.versementService.changerPin(anc, nouv).subscribe({
      next: (res) => {
        this.chargementChangementPin = false;
        if (res.succes) {
          this.versementService.enregistrerPin(nouv);
          this.messagePinSucces = 'Code PIN modifié avec succès !';
          setTimeout(() => {
            this.modeChangerPin = false;
            this.messagePinSucces = '';
          }, 2000);
        } else {
          this.messagePinErreur = res.message || 'Impossible de modifier le code.';
        }
      },
      error: (err) => {
        this.chargementChangementPin = false;
        this.messagePinErreur = err?.error?.message || err?.error?.detail || 'Erreur lors de la modification du code PIN.';
      }
    });
  }
}
