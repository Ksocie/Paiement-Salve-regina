import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { QrModalComponent } from './shared/components/qr-modal/qr-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, QrModalComponent],
  template: `
    <div class="flex flex-col min-h-screen bg-surface font-body-md text-on-surface">
      <app-header></app-header>
      <main class="flex-1 relative w-full pt-16 pb-8 bg-surface">
        <router-outlet></router-outlet>
      </main>
      <app-qr-modal></app-qr-modal>
    </div>
  `
})
export class AppComponent {
  title = 'Chorale Salve Regina';
}
