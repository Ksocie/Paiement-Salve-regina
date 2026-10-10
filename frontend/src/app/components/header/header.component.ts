import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../core/services/pwa.service';
import { QrModalService } from '../../core/services/qr-modal.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.03)] border-b border-outline-variant/20">
      <div class="h-16 px-gutter flex items-center justify-between max-w-xl mx-auto">
        <div class="flex items-center gap-space-sm min-w-0">
          <div class="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(120,86,0,0.12)]">
            <span class="material-symbols-outlined text-primary text-[22px]">music_note</span>
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-space-xs">
              <span class="font-serif-sacred font-bold text-[22px] text-primary truncate leading-none">Salve Regina</span>
            </div>
            <span class="text-[11px] font-semibold text-on-surface-variant truncate tracking-wide">Cotisations &amp; Dons Directs</span>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            aria-label="Afficher le QR code pour partager"
            (click)="ouvrirQrModal()"
            class="min-h-[38px] px-2.5 sm:px-3 flex items-center gap-1.5 rounded-full text-secondary hover:bg-surface-container active:scale-95 transition-all bg-secondary-fixed/40 border border-secondary/20 text-xs font-semibold"
            title="Afficher et faire scanner le QR code">
            <span class="material-symbols-outlined text-[20px]">qr_code_2</span>
            <span>QR Code</span>
          </button>

          <button
            type="button"
            aria-label="Installer l'application PWA"
            (click)="installerPwa()"
            class="min-h-[38px] px-2.5 sm:px-3 flex items-center gap-1.5 rounded-full text-primary hover:bg-surface-container active:scale-95 transition-all bg-primary-fixed/30 border border-primary/20 text-xs font-semibold"
            title="Installer sur mon smartphone ou bureau">
            <span class="material-symbols-outlined text-[20px]">install_mobile</span>
            <span class="hidden sm:inline">Installer l'App</span>
            <span class="sm:hidden">Installer</span>
          </button>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  private readonly pwaService = inject(PwaService);
  private readonly qrModalService = inject(QrModalService);

  ouvrirQrModal(): void {
    this.qrModalService.open();
  }

  installerPwa(): void {
    this.pwaService.installApp();
  }
}
