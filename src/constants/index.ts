/**
 * Application-wide constants
 */

export const SNACKBAR_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  CLOSE_ANIMATION: 300,
} as const;

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'HABILITADO' },
  { value: 'inactive', label: 'DESHABILITADO' },
] as const;

export const EVENT_FILTER_OPTIONS = [
  { value: 'all', label: 'TODOS' },
  { value: 'active', label: 'ACTIVOS' },
  { value: 'completed', label: 'FINALIZADOS' },
  { value: 'cancelled', label: 'CANCELADOS' },
] as const;

export const VALIDATION_RULES = {
  PHONE_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
} as const;

