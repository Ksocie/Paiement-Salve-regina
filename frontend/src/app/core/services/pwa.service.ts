import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private deferredPrompt: any = null;
  readonly canInstall = signal<boolean>(false);
  readonly isInstalled = signal<boolean>(false);
  readonly isOnline = signal<boolean>(navigator.onLine);

  constructor() {
    this.initPwaListeners();
  }

  private initPwaListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e: Event) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.canInstall.set(true);
      });

      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        this.canInstall.set(false);
        this.isInstalled.set(true);
      });

      window.addEventListener('online', () => this.isOnline.set(true));
      window.addEventListener('offline', () => this.isOnline.set(false));

      // Check if already in standalone display mode
      if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
        this.isInstalled.set(true);
      }
    }
  }

  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      // In iOS or non-prompt browsers, show helpful instruction
      alert("Pour installer sur votre appareil : appuyez sur le bouton Partager puis 'Sur l'écran d'accueil'.");
      return false;
    }
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.canInstall.set(false);
    return outcome === 'accepted';
  }
}
