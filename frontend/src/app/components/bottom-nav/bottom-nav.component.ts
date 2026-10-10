import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-2px_12px_rgba(120,86,0,0.06)]">
      <div class="flex justify-around items-center h-16 px-space-xs max-w-xl mx-auto">
        <a
          routerLink="/accueil"
          routerLinkActive="text-primary font-bold scale-105"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-space-xs transition-all gap-0.5 text-on-surface-variant hover:text-primary">
          <span class="material-symbols-outlined text-[23px]">volunteer_activism</span>
          <span class="text-[11px] font-medium tracking-tight">Accueil</span>
        </a>

        <a
          routerLink="/cotisations"
          routerLinkActive="text-primary font-bold scale-105"
          class="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-space-xs transition-all gap-0.5 text-on-surface-variant hover:text-primary">
          <span class="material-symbols-outlined text-[23px]">event_available</span>
          <span class="text-[11px] font-medium tracking-tight">Cotisations</span>
        </a>

        <a
          routerLink="/concerts"
          routerLinkActive="text-primary font-bold scale-105"
          class="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-space-xs transition-all gap-0.5 text-on-surface-variant hover:text-primary">
          <span class="material-symbols-outlined text-[23px]">theater_comedy</span>
          <span class="text-[11px] font-medium tracking-tight">Concerts</span>
        </a>

        <a
          routerLink="/transparence"
          routerLinkActive="text-primary font-bold scale-105"
          class="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-space-xs transition-all gap-0.5 text-on-surface-variant hover:text-primary">
          <span class="material-symbols-outlined text-[23px]">receipt_long</span>
          <span class="text-[11px] font-medium tracking-tight">Transparence</span>
        </a>
      </div>
    </nav>
  `
})
export class BottomNavComponent {}
