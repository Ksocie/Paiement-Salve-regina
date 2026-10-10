import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrModalService } from '../../../core/services/qr-modal.service';

@Component({
  selector: 'app-qr-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="qrService.isOpen()"
      (click)="fermer()"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      
      <!-- Modal container -->
      <div
        (click)="$event.stopPropagation()"
        class="bg-surface-container-lowest rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-secondary-fixed/50 flex flex-col gap-4 relative animate-scaleUp">

        <!-- Bouton fermer -->
        <button
          type="button"
          (click)="fermer()"
          aria-label="Fermer"
          class="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>

        <!-- En-tête -->
        <div class="flex flex-col items-center text-center gap-1.5 pt-2">
          <div class="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary mb-1 shadow-sm">
            <span class="material-symbols-outlined text-[26px]">qr_code_2</span>
          </div>
          <span class="text-[11px] uppercase font-bold tracking-widest text-secondary">
            Chorale Salve Regina
          </span>
          <h3 class="font-serif-sacred text-2xl font-bold text-on-surface leading-tight">
            Scanner &amp; Partager
          </h3>
          <p class="text-xs text-on-surface-variant">
            Faites scanner ce code pour accéder directement à la page des cotisations et offrandes.
          </p>
        </div>

        <!-- Carte avec le QR Code -->
        <div class="bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-inner flex flex-col items-center justify-center gap-2">
          <img
            src="images/qrcode-salve-regina.png"
            alt="QR Code Salve Regina"
            class="w-52 h-52 object-contain rounded-lg">
          <span class="text-[10px] text-zinc-500 font-medium">
            https://salve-regina-pwa.onrender.com/accueil
          </span>
        </div>

        <!-- Barre de lien & Copie rapide -->
        <div class="flex items-center gap-2 bg-surface-container-low rounded-xl p-1.5 pl-3 border border-outline-variant/30">
          <span class="text-xs text-on-surface-variant truncate flex-1 font-mono">
            {{ qrService.shareUrl }}
          </span>
          <button
            type="button"
            (click)="copierLien()"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1"
            [ngClass]="lienCopie() ? 'bg-green-600 text-white' : 'bg-secondary text-on-secondary hover:bg-secondary/90'">
            <span class="material-symbols-outlined text-[16px]">
              {{ lienCopie() ? 'check' : 'content_copy' }}
            </span>
            <span>{{ lienCopie() ? 'Copié !' : 'Copier' }}</span>
          </button>
        </div>

        <!-- Actions principales (Partager + Télécharger) -->
        <div class="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            (click)="partager()"
            class="py-2.5 px-3 rounded-xl bg-primary text-on-primary text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all hover:bg-primary/95">
            <span class="material-symbols-outlined text-[18px]">share</span>
            <span>Partager</span>
          </button>

          <a
            href="images/qrcode-salve-regina.png"
            download="qrcode-salve-regina.png"
            class="py-2.5 px-3 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all text-center">
            <span class="material-symbols-outlined text-[18px]">download</span>
            <span>Télécharger</span>
          </a>
        </div>

      </div>
    </div>
  `
})
export class QrModalComponent {
  readonly qrService = inject(QrModalService);
  readonly lienCopie = signal<boolean>(false);

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.qrService.isOpen()) {
      this.fermer();
    }
  }

  fermer(): void {
    this.qrService.close();
  }

  async copierLien(): Promise<void> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.qrService.shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = this.qrService.shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      this.lienCopie.set(true);
      setTimeout(() => this.lienCopie.set(false), 2500);
    } catch {
      alert("Lien : " + this.qrService.shareUrl);
    }
  }

  async partager(): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Chorale Salve Regina',
          text: 'Soutenez la Chorale Salve Regina (Cotisations & Dons en ligne) :',
          url: this.qrService.shareUrl
        });
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          this.copierLien();
        }
      }
    } else {
      this.copierLien();
    }
  }
}
