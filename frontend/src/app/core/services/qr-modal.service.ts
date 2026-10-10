import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QrModalService {
  readonly isOpen = signal<boolean>(false);
  readonly shareUrl = 'https://salve-regina-pwa.onrender.com/accueil';

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
