import { Routes } from '@angular/router';
import { AccueilComponent } from './features/accueil/accueil.component';
import { CotisationsComponent } from './features/cotisations/cotisations.component';

export const routes: Routes = [
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },
  { path: 'accueil', component: AccueilComponent },
  { path: 'cotisations', component: CotisationsComponent },
  { path: '**', redirectTo: 'accueil' }
];
