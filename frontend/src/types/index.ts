// ========================================
// INTERFACES UTILISATEUR
// ========================================

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  active: boolean;
}

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
}

// ========================================
// INTERFACES TERRAIN
// ========================================

export interface Terrain {
  id: number;
  nom: string;
  description?: string;
  localisation: string;
  prix_heure: number;
  is_active: boolean;
  created_at: string;
}

export interface TerrainCreateUpdate {
  nom: string;
  description?: string;
  localisation: string;
  prix_heure: number;
  is_active?: boolean;
}

// ========================================
// INTERFACES RÉSERVATION
// ========================================

export enum ReservationStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export interface Reservation {
  id: number;
  terrain_id: number;
  user_id: number;
  start: string;  // ISO format: "2026-01-15T10:00:00"
  end: string;    // ISO format: "2026-01-15T11:00:00"
  notes?: string;
  status: string;

  // Relations (optionnelles selon les endpoints)
  terrain?: Terrain;
  user?: User;
}

export interface ReservationCreate {
  terrain_id: number;
  start: string; // ISO format
  end: string;   // ISO format
  notes?: string;
}

export interface ReservationUpdate {
  date_debut?: string;
  date_fin?: string;
  status?: ReservationStatus;
}

// ========================================
// INTERFACES DISPONIBILITÉ
// ========================================

export interface AvailabilitySlot {
  terrain_id: number;
  date: string;        // Format: "2026-01-15"
  heure_debut: string; // Format: "10:00"
  heure_fin: string;   // Format: "11:00"
  is_available: boolean;
  prix: number;
  
  // Info optionnelle si slot occupé
  reservation_id?: number;
  user_username?: string;
}

export interface AvailabilityQuery {
  terrain_id?: number;
  date?: string; // Format: "2026-01-15"
  date_debut?: string; // Format: "2026-01-15"
  date_fin?: string;   // Format: "2026-01-20"
}

// ========================================
// INTERFACES API RÉPONSES
// ========================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ErrorResponse {
  detail: string | { [key: string]: any };
  status_code: number;
}

// ========================================
// TYPES UTILITAIRES
// ========================================

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortOrder;
}

export interface FilterConfig {
  [key: string]: any;
}

// Pour les formulaires
export interface FormErrors {
  [key: string]: string;
}

// Pour les états de chargement
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// ========================================
// TYPES COMPOSANTS
// ========================================

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

// ========================================
// TYPES DATE/HEURE
// ========================================

export interface TimeSlot {
  start: string; // Format: "HH:mm"
  end: string;   // Format: "HH:mm"
  label?: string;
}

export interface DateRange {
  start: string; // Format: "YYYY-MM-DD"
  end: string;   // Format: "YYYY-MM-DD"
}

// ========================================
// EXPORTS
// ========================================

// Export de tous les types pour faciliter l'importation
export type {
  // Déjà définis ci-dessus
};

// Constantes utiles
export const TIME_SLOTS: TimeSlot[] = [
  { start: '09:00', end: '10:00', label: '9h - 10h' },
  { start: '10:00', end: '11:00', label: '10h - 11h' },
  { start: '11:00', end: '12:00', label: '11h - 12h' },
  { start: '14:00', end: '15:00', label: '14h - 15h' },
  { start: '15:00', end: '16:00', label: '15h - 16h' },
  { start: '16:00', end: '17:00', label: '16h - 17h' },
  { start: '17:00', end: '18:00', label: '17h - 18h' },
  { start: '18:00', end: '19:00', label: '18h - 19h' },
  { start: '19:00', end: '20:00', label: '19h - 20h' },
  { start: '20:00', end: '21:00', label: '20h - 21h' },
];

export const RESERVATION_STATUS_LABELS = {
  [ReservationStatus.ACTIVE]: 'Actif',
  [ReservationStatus.CANCELLED]: 'Annulé',
  [ReservationStatus.COMPLETED]: 'Terminé',
};