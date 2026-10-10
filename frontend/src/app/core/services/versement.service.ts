import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { CreerVersementDto, Statistiques, Versement } from '../models/versement.model';

@Injectable({
  providedIn: 'root'
})
export class VersementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = (typeof window !== 'undefined' && window.location.port === '4200')
    ? 'http://localhost:8082/api/versements'
    : '/api/versements';

  private readonly CLE_PIN_SESSION = 'salve_regina_tresorerie_pin';
  private pinEnMemoire: string | null = null;

  obtenirPin(): string | null {
    return this.pinEnMemoire;
  }

  enregistrerPin(pin: string): void {
    this.pinEnMemoire = pin.trim();
  }

  deconnecterTresorerie(): void {
    this.pinEnMemoire = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.CLE_PIN_SESSION);
    }
  }

  estTresorierConnecte(): boolean {
    return !!this.pinEnMemoire;
  }

  authentifierPin(pin: string): Observable<{ valide: boolean; message?: string }> {
    return this.http.post<{ valide: boolean; message?: string }>(
      `${this.apiUrl}/tresorerie/authentifier`,
      { pin }
    );
  }

  changerPin(ancienPin: string, nouveauPin: string): Observable<{ succes: boolean; message?: string }> {
    return this.http.post<{ succes: boolean; message?: string }>(
      `${this.apiUrl}/tresorerie/changer-pin`,
      { ancienPin, nouveauPin }
    );
  }

  creerVersement(dto: CreerVersementDto): Observable<Versement> {
    return this.http.post<Versement>(this.apiUrl, dto);
  }

  obtenirParReference(reference: string): Observable<Versement> {
    return this.http.get<Versement>(`${this.apiUrl}/${reference}`);
  }

  private readonly campagnesApiUrl = (typeof window !== 'undefined' && window.location.port === '4200')
    ? 'http://localhost:8082/api/campagnes'
    : '/api/campagnes';

  listerCampagnes(tous = false): Observable<import('../models/versement.model').CampagneMotif[]> {
    const params = new HttpParams().set('tous', tous);
    return this.http.get<import('../models/versement.model').CampagneMotif[]>(this.campagnesApiUrl, { params }).pipe(
      catchError(() => of([]))
    );
  }

  listerVersements(
    pupitre?: string,
    motif?: string,
    statut?: string,
    annee?: number,
    dateDebut?: string,
    dateFin?: string
  ): Observable<Versement[]> {
    let params = new HttpParams();
    if (pupitre && pupitre !== 'TOUS') params = params.set('pupitre', pupitre);
    if (motif && motif !== 'TOUS') params = params.set('motif', motif);
    if (statut && statut !== 'TOUS') params = params.set('statut', statut);
    if (annee) params = params.set('annee', annee.toString());
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);

    const headers = new HttpHeaders({
      'X-Tresorerie-PIN': this.obtenirPin() || ''
    });

    return this.http.get<Versement[]>(this.apiUrl, { params, headers }).pipe(
      catchError(error => {
        console.warn('Erreur lors de la récupération des versements:', error);
        return of([]);
      })
    );
  }

  obtenirStatistiques(): Observable<Statistiques> {
    const headers = new HttpHeaders({
      'X-Tresorerie-PIN': this.obtenirPin() || ''
    });

    return this.http.get<Statistiques>(`${this.apiUrl}/transparence`, { headers }).pipe(
      catchError(error => {
        console.warn('Erreur récupération statistiques:', error);
        return of({
          totalCollecte: 0,
          nombreTotalVersements: 0,
          nombreVersementsValides: 0,
          totalParPupitre: {},
          totalParMotif: {},
          totalParOperateur: {},
          derniersVersements: []
        });
      })
    );
  }

  verifierPaiement(reference: string): Observable<Versement> {
    return this.http.post<Versement>(`${this.apiUrl}/${reference}/verifier`, {});
  }
}
