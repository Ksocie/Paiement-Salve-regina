import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-concerts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex flex-col w-full max-w-xl mx-auto px-margin pb-12 pt-2">
      <!-- Title Header -->
      <div class="mb-4">
        <h1 class="font-serif-sacred text-2xl font-bold text-on-surface">Concerts &amp; Événements</h1>
        <p class="text-xs text-on-surface-variant">Soutenez les grands projets artistiques et sacrés de la chorale</p>
      </div>

      <!-- Featured Concert Card: 20 Ans de Grâce -->
      <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-md border border-primary-fixed mb-4">
        <div class="relative h-48 w-full bg-surface-dim">
          <img
            src="images/chorale-salve-regina.jpg"
            alt="Concert 20 Ans de Grâce"
            class="w-full h-full object-cover object-center filter contrast-105">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          <div class="absolute top-3 left-3 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            Grand Jubilé
          </div>

          <div class="absolute bottom-3 left-3 right-3 text-white">
            <h2 class="font-serif-sacred text-2xl font-bold leading-tight text-primary-fixed">Concert des 20 Ans de Grâce</h2>
            <p class="text-xs text-white/90 font-medium">« Alleluia ! 20 Ans de louange et de liturgie »</p>
          </div>
        </div>

        <div class="p-4 flex flex-col gap-3">
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="flex items-center gap-2 p-2 rounded-xl bg-surface-container-low">
              <span class="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
              <div class="flex flex-col">
                <span class="text-[10px] text-on-surface-variant font-semibold">Date</span>
                <span class="font-bold text-on-surface">Dimanche 22 Nov.</span>
              </div>
            </div>

            <div class="flex items-center gap-2 p-2 rounded-xl bg-surface-container-low">
              <span class="material-symbols-outlined text-secondary text-[18px]">location_on</span>
              <div class="flex flex-col">
                <span class="text-[10px] text-on-surface-variant font-semibold">Lieu</span>
                <span class="font-bold text-on-surface">Paroisse St-Jean</span>
              </div>
            </div>
          </div>

          <!-- Progress goal -->
          <div class="flex flex-col gap-1.5 pt-1">
            <div class="flex justify-between items-center text-xs">
              <span class="text-on-surface-variant font-medium">Collecte de soutien au Concert</span>
              <span class="font-bold text-primary">750 000 / 1 500 000 F (50%)</span>
            </div>
            <div class="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full transition-all" style="width: 50%"></div>
            </div>
          </div>

          <!-- Action Button -->
          <a
            routerLink="/accueil"
            class="mt-1 w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-primary-container active:scale-95 transition-all">
            <span class="material-symbols-outlined text-[18px]">volunteer_activism</span>
            Soutenir ce concert &amp; Réserver ma place
          </a>
        </div>
      </div>

      <!-- Second Project Card -->
      <div class="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30 flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-secondary-fixed/50 flex items-center justify-center text-secondary">
            <span class="material-symbols-outlined text-[20px]">library_music</span>
          </div>
          <div class="flex flex-col">
            <h3 class="font-bold text-sm text-on-surface">Enregistrement de l'Album Jubilé</h3>
            <span class="text-[11px] text-on-surface-variant">Projet studio &amp; partitions polyphoniques</span>
          </div>
        </div>

        <p class="text-xs text-on-surface-variant">
          Participez à la production du premier album officiel commémorant les 20 ans d'existence de la chorale.
        </p>

        <a
          routerLink="/accueil"
          class="w-full py-2.5 px-3 rounded-xl bg-surface-container text-on-surface font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-surface-variant transition-colors">
          <span class="material-symbols-outlined text-[16px]">favorite</span>
          Faire un don dédié au studio
        </a>
      </div>
    </div>
  `
})
export class ConcertsComponent {}
