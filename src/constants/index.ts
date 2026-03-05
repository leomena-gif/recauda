/**
 * Application-wide constants
 */

// ─── Snackbar Durations ─────────────────────────────────────────────────────

export const SNACKBAR_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  CLOSE_ANIMATION: 300,
} as const;

// ─── Navigation Routes ──────────────────────────────────────────────────────

export const ROUTES = {
  HOME: '/',
  CREATE_EVENT: '/create-event',
  SELLERS_LIST: '/sellers-list',
  BUYERS_LIST: '/buyers-list',
  ADD_SELLER: '/add-seller',
  EVENT_DETAIL: '/event-detail',
  LOGIN: '/login',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];

// ─── Filter Options ─────────────────────────────────────────────────────────

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'HABILITADO' },
  { value: 'inactive', label: 'DESHABILITADO' },
] as const;

export const EVENT_FILTER_OPTIONS = [
  { value: 'active', label: 'ACTIVOS' },
  { value: 'completed', label: 'FINALIZADOS' },
  { value: 'cancelled', label: 'CANCELADOS' },
  { value: 'all', label: 'TODOS' },
] as const;

// ─── Validation ─────────────────────────────────────────────────────────────

export const VALIDATION_RULES = {
  PHONE_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
} as const;
