'use client';

/**
 * RegisterSaleWizard
 *
 * Orchestrates the multi-step "Registrar Venta" flow.
 * Owns all shared state and passes it down to the responsive
 * presentational components: RegisterSaleSheet (mobile) and
 * RegisterSaleModal (desktop).
 *
 * Flow:
 *  Non-food: step 1 (event) → step 2 (quantity + buyer data)
 *  Food:     step 1 (event) → step 2 (dishes) → step 3 (buyer data)
 */

import React, { useState, useCallback } from 'react';
import { validateEventStep, validateSaleDetails, SaleDetailsErrors } from '@/utils/registerSaleSchema';
import RegisterSaleSheet from './RegisterSaleSheet';
import RegisterSaleModal from './RegisterSaleModal';

export interface Dish {
    name: string;
    price: number;
    sold?: number;
    total?: number;
}

export interface SaleEvent {
    id: string;
    name: string;
    status: string;
    type: string;
    collected?: number;
    goal?: number;
    soldUnits?: number;
    totalUnits?: number;
    ticketPrice?: number;
    dishes?: Dish[];
}

interface RegisterSaleWizardProps {
    isOpen: boolean;
    onClose: () => void;
    events: SaleEvent[];
}

const RegisterSaleWizard: React.FC<RegisterSaleWizardProps> = ({ isOpen, onClose, events }) => {
    // ─── Wizard Step State ────────────────────────────────────────────────
    const [mobileStep, setMobileStep] = useState<1 | 2 | 3>(1);
    const [desktopStep, setDesktopStep] = useState<1 | 2 | 3>(1);
    const [isSuccess, setIsSuccess] = useState(false);

    // ─── Form State ───────────────────────────────────────────────────────
    const [selectedEventId, setSelectedEventId] = useState('');
    const [saleQuantity, setSaleQuantity] = useState(1);
    const [buyerName, setBuyerName] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedDishes, setSelectedDishes] = useState<Record<string, number>>({});

    // ─── Error State ──────────────────────────────────────────────────────
    const [eventError, setEventError] = useState<string | undefined>();
    const [detailErrors, setDetailErrors] = useState<SaleDetailsErrors>({});

    // ─── Derived State ────────────────────────────────────────────────────
    const activeEvents = events.filter((e) => e.status === 'active');
    const currentEvent = events.find((e) => e.id === selectedEventId);
    const isFoodSale = currentEvent?.type === 'food_sale';

    // ─── Handlers ─────────────────────────────────────────────────────────

    const resetState = useCallback(() => {
        setMobileStep(1);
        setDesktopStep(1);
        setSelectedEventId('');
        setSaleQuantity(1);
        setBuyerName('');
        setPhone('');
        setSelectedDishes({});
        setEventError(undefined);
        setDetailErrors({});
        setIsSuccess(false);
    }, []);

    const handleClose = useCallback(() => {
        resetState();
        onClose();
    }, [resetState, onClose]);

    const handleSelectEvent = useCallback((id: string) => {
        setSelectedEventId(id);
        setEventError(undefined);
    }, []);

    // Step 1 → Step 2
    const handleContinue = useCallback(() => {
        const error = validateEventStep(selectedEventId);
        if (error) {
            setEventError(error);
            return;
        }
        setMobileStep(2);
        setDesktopStep(2);
    }, [selectedEventId]);

    // Step 2 → Step 3 (food only: validates at least one dish selected)
    const handleContinueDishes = useCallback(() => {
        const hasDishes = Object.values(selectedDishes).some((qty) => qty > 0);
        if (!hasDishes) {
            setDetailErrors({ dishes: 'Seleccioná al menos un plato' });
            return;
        }
        setDetailErrors({});
        setMobileStep(3);
        setDesktopStep(3);
    }, [selectedDishes]);

    const handleBack = useCallback(() => {
        if (mobileStep === 3) {
            setMobileStep(2);
            setDesktopStep(2);
        } else {
            setMobileStep(1);
            setDesktopStep(1);
        }
        setDetailErrors({});
    }, [mobileStep]);

    const handleDishChange = useCallback((dishName: string, quantity: number) => {
        setSelectedDishes((prev) => ({ ...prev, [dishName]: quantity }));
        if (detailErrors.dishes) {
            setDetailErrors((prev) => ({ ...prev, dishes: undefined }));
        }
    }, [detailErrors.dishes]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        const errors = validateSaleDetails(buyerName, phone, isFoodSale, selectedDishes);
        if (Object.keys(errors).length > 0) {
            setDetailErrors(errors);
            return;
        }

        // TODO: Replace with API call — POST /api/sales
        // Payload: { eventId: selectedEventId, buyerName, phone, quantity: saleQuantity, dishes: selectedDishes }
        setIsSuccess(true);
    }, [buyerName, phone, isFoodSale, selectedDishes]);

    const clearDetailError = useCallback((field: keyof SaleDetailsErrors) => {
        setDetailErrors((prev) => ({ ...prev, [field]: undefined }));
    }, []);

    if (!isOpen) return null;

    const sharedProps = {
        activeEvents,
        currentEvent,
        isFoodSale,
        isSuccess,
        // Step
        selectedEventId,
        eventError,
        detailErrors,
        // Form values
        saleQuantity,
        buyerName,
        phone,
        selectedDishes,
        // Handlers
        onClose: handleClose,
        onSelectEvent: handleSelectEvent,
        onContinue: handleContinue,
        onContinueDishes: handleContinueDishes,
        onBack: handleBack,
        onQuantityChange: setSaleQuantity,
        onBuyerNameChange: (val: string) => { setBuyerName(val); clearDetailError('buyerName'); },
        onPhoneChange: (val: string) => { setPhone(val); clearDetailError('phone'); },
        onDishChange: handleDishChange,
        onSubmit: handleSubmit,
    };

    return (
        <>
            {/* Mobile: Bottom Sheet (hidden on desktop via CSS) */}
            <RegisterSaleSheet {...sharedProps} step={mobileStep} />

            {/* Desktop: Modal (hidden on mobile via CSS) */}
            <RegisterSaleModal {...sharedProps} step={desktopStep} />
        </>
    );
};

export default RegisterSaleWizard;
