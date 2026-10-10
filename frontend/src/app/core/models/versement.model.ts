export type Pupitre = 'SOPRANO' | 'ALTO' | 'TENOR' | 'BASSE' | 'BIENFAITEUR' | 'AUTRE';

export type MotifVersement = 'COTISATION' | 'CONCERT' | 'DON_LIBRE' | 'UNIFORME' | 'PROJET' | 'EVENEMENT' | 'AUTRE' | string;

export type OperateurPaiement = 'WAVE' | 'ORANGE_MONEY' | 'MTN_MOMO' | 'MOOV_MONEY';

export type StatutVersement = 'EN_ATTENTE' | 'VALIDE' | 'ECHOUE' | 'ANNULE';

export interface CampagneMotif {
  id: number;
  code: string;
  typeMotif: MotifVersement;
  libelle: string;
  annee: number;
  actif: boolean;
  ordre: number;
}

export interface Versement {
  id: number;
  reference: string;
  nomDonateur: string;
  telephone: string;
  email?: string;
  pupitre: Pupitre;
  pupitreLibelle: string;
  motif: MotifVersement;
  motifLibelle: string;
  annee: number;
  campagne?: string;
  montant: number;
  operateur: OperateurPaiement;
  operateurLibelle: string;
  statut: StatutVersement;
  statutLibelle: string;
  referencePasserelle?: string;
  urlPaiement?: string;
  dateCreation: string;
  dateValidation?: string;
  commentaire?: string;
}

export interface CreerVersementDto {
  nomDonateur: string;
  telephone: string;
  email?: string;
  pupitre: Pupitre;
  motif: MotifVersement;
  annee?: number;
  campagne?: string;
  montant: number;
  operateur: OperateurPaiement;
  commentaire?: string;
}

export interface Statistiques {
  totalCollecte: number;
  nombreTotalVersements: number;
  nombreVersementsValides: number;
  totalParPupitre: { [key: string]: number };
  totalParMotif: { [key: string]: number };
  totalParOperateur: { [key: string]: number };
  derniersVersements: Versement[];
}
