/**
 * Zod validation schema for the "Registrar Venta" wizard.
 * Single source of truth for all form validation rules —
 * shared by both the mobile sheet and desktop modal.
 */

import { z } from 'zod';
import { VALIDATION_RULES } from '@/constants';

export const registerSaleSchema = z.object({
    eventId: z.string().min(1, 'Debes seleccionar un evento'),
    buyerName: z
        .string()
        .min(1, 'Este campo es requerido')
        .min(VALIDATION_RULES.NAME_MIN_LENGTH, `Debe tener al menos ${VALIDATION_RULES.NAME_MIN_LENGTH} caracteres`),
    phone: z
        .string()
        .min(1, 'Este campo es requerido')
        .refine(
            (val) => val.replace(/\D/g, '').length >= VALIDATION_RULES.PHONE_MIN_LENGTH,
            { message: `Debe tener al menos ${VALIDATION_RULES.PHONE_MIN_LENGTH} dígitos` }
        ),
    quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
    dishes: z.record(z.string(), z.number().int().min(0)).optional(),
});

export type RegisterSaleFormData = z.infer<typeof registerSaleSchema>;

/** Validates only the event selection step (Step 1). */
export const validateEventStep = (eventId: string): string | undefined => {
    const result = registerSaleSchema.shape.eventId.safeParse(eventId);
    return result.success ? undefined : result.error.issues[0].message;
};

/** Validates the sale details step (Step 2), given the event type. */
export interface SaleDetailsErrors {
    buyerName?: string;
    phone?: string;
    dishes?: string;
}

export const validateSaleDetails = (
    buyerName: string,
    phone: string,
    isFoodSale: boolean,
    dishes: Record<string, number>
): SaleDetailsErrors => {
    const errors: SaleDetailsErrors = {};

    const nameResult = registerSaleSchema.shape.buyerName.safeParse(buyerName);
    if (!nameResult.success) {
        errors.buyerName = nameResult.error.issues[0].message;
    }

    const phoneResult = registerSaleSchema.shape.phone.safeParse(phone);
    if (!phoneResult.success) {
        errors.phone = phoneResult.error.issues[0].message;
    }

    if (isFoodSale) {
        const totalDishes = Object.values(dishes).reduce((sum, qty) => sum + qty, 0);
        if (totalDishes === 0) {
            errors.dishes = 'Debes seleccionar al menos un plato';
        }
    }

    return errors;
};
