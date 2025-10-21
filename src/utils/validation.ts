/**
 * Validation utilities
 */

import { VALIDATION_RULES } from '@/constants';

export const validateName = (name: string): string | undefined => {
  if (!name.trim()) {
    return 'Este campo es requerido';
  }
  if (name.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    return `Debe tener al menos ${VALIDATION_RULES.NAME_MIN_LENGTH} caracteres`;
  }
  return undefined;
};

export const validatePhone = (phone: string): string | undefined => {
  if (!phone.trim()) {
    return 'Este campo es requerido';
  }
  if (phone.replace(/\D/g, '').length < VALIDATION_RULES.PHONE_MIN_LENGTH) {
    return `Debe tener al menos ${VALIDATION_RULES.PHONE_MIN_LENGTH} dígitos`;
  }
  return undefined;
};

export const formatPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

