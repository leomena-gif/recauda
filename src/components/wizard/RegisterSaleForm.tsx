'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateEventStep, validateSaleDetails, SaleDetailsErrors } from '@/utils/registerSaleSchema';
import { ROUTES } from '@/constants';
import QuantityStepper from './QuantityStepper';
import type { SaleEvent } from './RegisterSaleWizard';
import styles from './RegisterSaleForm.module.css';

interface Props {
    events: SaleEvent[];
}

const RegisterSaleForm: React.FC<Props> = ({ events }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedEventId = searchParams.get('eventId') ?? undefined;

    const initialStep: 1 | 2 = preselectedEventId ? 2 : 1;

    const [step, setStep] = useState<1 | 2>(initialStep);
    const [isSuccess, setIsSuccess] = useState(false);

    const [selectedEventId, setSelectedEventId] = useState(preselectedEventId ?? '');
    const [saleQuantity, setSaleQuantity] = useState(1);
    const [buyerName, setBuyerName] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedDishes, setSelectedDishes] = useState<Record<string, number>>({});

    const [eventError, setEventError] = useState<string | undefined>();
    const [detailErrors, setDetailErrors] = useState<SaleDetailsErrors>({});

    const activeEvents = events.filter((e) => e.status === 'active');
    const currentEvent = events.find((e) => e.id === selectedEventId);
    const isFoodSale = currentEvent?.type === 'food_sale';

    const goBack = useCallback(() => {
        if (preselectedEventId) {
            router.push(`${ROUTES.EVENT_DETAIL}?id=${preselectedEventId}`);
        } else {
            router.push(ROUTES.HOME);
        }
    }, [router, preselectedEventId]);

    const handleSelectEvent = useCallback((id: string) => {
        setSelectedEventId(id);
        setEventError(undefined);
    }, []);

    const handleContinue = useCallback(() => {
        const error = validateEventStep(selectedEventId);
        if (error) { setEventError(error); return; }
        setStep(2);
    }, [selectedEventId]);

    const handleBack = useCallback(() => {
        setDetailErrors({});
        if (step === 2 && !preselectedEventId) { setStep(1); return; }
        goBack();
    }, [step, preselectedEventId, goBack]);

    const handleDishChange = useCallback((dishName: string, quantity: number) => {
        setSelectedDishes((prev) => ({ ...prev, [dishName]: quantity }));
        if (detailErrors.dishes) setDetailErrors((prev) => ({ ...prev, dishes: undefined }));
    }, [detailErrors.dishes]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateSaleDetails(buyerName, phone, isFoodSale, selectedDishes);
        if (Object.keys(errors).length > 0) { setDetailErrors(errors); return; }
        // TODO: Replace with API call — POST /api/sales
        setIsSuccess(true);
    }, [buyerName, phone, isFoodSale, selectedDishes]);

    const clearDetailError = useCallback((field: keyof SaleDetailsErrors) => {
        setDetailErrors((prev) => ({ ...prev, [field]: undefined }));
    }, []);

    const handleRegistrarOtra = useCallback(() => {
        setStep(preselectedEventId ? 2 : 1 as 1 | 2);
        setSelectedEventId(preselectedEventId ?? '');
        setSaleQuantity(1);
        setBuyerName('');
        setPhone('');
        setSelectedDishes({});
        setEventError(undefined);
        setDetailErrors({});
        setIsSuccess(false);
    }, [preselectedEventId]);

    const backArrowSvg = (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    if (isSuccess) {
        return (
            <div className="pageContainer">
                <div className={styles.pageHeaderRow}>
                    <button className={styles.backArrow} onClick={goBack} aria-label="Volver">
                        {backArrowSvg}
                    </button>
                    <h1 className={styles.pageTitle}>Registrar venta</h1>
                </div>
                <div className={styles.successScreen}>
                    <div className={styles.successIconWrap}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <h2 className={styles.successTitle}>Venta registrada</h2>
                    <p className={styles.successDesc}>
                        La venta de <strong>{buyerName}</strong> fue registrada en{' '}
                        <strong>{currentEvent?.name}</strong>.
                    </p>
                    <div className={styles.successActions}>
                        <button type="button" className="btn btn-primary" onClick={handleRegistrarOtra}>
                            Registrar otra
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={goBack}>
                            Listo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pageContainer">
            <div className={styles.pageHeaderRow}>
                <button className={styles.backArrow} onClick={handleBack} aria-label="Volver">
                    {backArrowSvg}
                </button>
                <h1 className={styles.pageTitle}>Registrar venta</h1>
            </div>

            {/* Step 1: Event Selection */}
            {step === 1 && (
                <div className={styles.formContainer}>
                    <div className={styles.section}>
                        <p className={styles.sectionLabel}>Evento</p>
                        <div className={styles.eventList}>
                            {activeEvents.map((event) => (
                                <button
                                    key={event.id}
                                    type="button"
                                    className={`${styles.eventCard} ${selectedEventId === event.id ? styles.eventCardSelected : ''}`}
                                    onClick={() => handleSelectEvent(event.id)}
                                >
                                    <div className={styles.eventCardContent}>
                                        <div className={styles.eventStatus}>
                                            <span className={styles.statusDot} />
                                            <span>ACTIVO</span>
                                        </div>
                                        <div className={styles.eventName}>{event.name}</div>
                                    </div>
                                    <div className={`${styles.radio} ${selectedEventId === event.id ? styles.radioSelected : ''}`}>
                                        {selectedEventId === event.id && (
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        {eventError && <p className={styles.error}>{eventError}</p>}
                    </div>
                    <div className={styles.submitArea}>
                        <button type="button" className="btn btn-primary" onClick={handleContinue} disabled={!selectedEventId}>
                            Continuar
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2 (food): Dishes + Buyer Data — single page */}
            {step === 2 && isFoodSale && (
                <form onSubmit={handleSubmit} className={styles.formContainer} noValidate>
                    {currentEvent && <p className={styles.eventSubtitle}>{currentEvent.name}</p>}
                    <div className={styles.section}>
                        <p className={styles.sectionLabel}>Platos</p>
                        <div className={styles.optionsCard}>
                            {currentEvent?.dishes?.map((dish, i) => (
                                <React.Fragment key={dish.name}>
                                    {i > 0 && <div className={styles.optionDivider} />}
                                    <div className={styles.dishRow}>
                                        <div className={styles.dishInfo}>
                                            <span className={styles.dishName}>{dish.name}</span>
                                            <span className={styles.dishPrice}>${dish.price.toLocaleString()}</span>
                                        </div>
                                        <QuantityStepper
                                            value={selectedDishes[dish.name] ?? 0}
                                            onChange={(qty) => handleDishChange(dish.name, qty)}
                                            min={0}
                                        />
                                    </div>
                                </React.Fragment>
                            ))}
                            {(() => {
                                const total = currentEvent?.dishes?.reduce(
                                    (acc, dish) => acc + dish.price * (selectedDishes[dish.name] ?? 0), 0
                                ) ?? 0;
                                return total > 0 ? (
                                    <>
                                        <div className={styles.optionDivider} />
                                        <div className={styles.totalRow}>
                                            <span className={styles.totalLabel}>Total a cobrar</span>
                                            <span className={styles.totalAmount}>${total.toLocaleString()}</span>
                                        </div>
                                    </>
                                ) : null;
                            })()}
                        </div>
                        {detailErrors.dishes && <p className={styles.error}>{detailErrors.dishes}</p>}
                    </div>
                    <div className={styles.section}>
                        <p className={styles.sectionLabel}>Comprador</p>
                        <div className={styles.fields}>
                            <div className={`${styles.field} ${detailErrors.buyerName ? styles.fieldError : ''}`}>
                                <span className={styles.fieldLabel}>Nombre</span>
                                <input
                                    type="text"
                                    value={buyerName}
                                    onChange={(e) => { setBuyerName(e.target.value); clearDetailError('buyerName'); }}
                                    placeholder="Ej: María González"
                                    className={styles.input}
                                />
                                {detailErrors.buyerName && <p className={styles.error}>{detailErrors.buyerName}</p>}
                            </div>
                            <div className={`${styles.field} ${detailErrors.phone ? styles.fieldError : ''}`}>
                                <span className={styles.fieldLabel}>Teléfono</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => { setPhone(e.target.value); clearDetailError('phone'); }}
                                    placeholder="Ej: 3584129488"
                                    className={styles.input}
                                />
                                <p className={styles.hint}>Sin 0 y sin 15</p>
                                {detailErrors.phone && <p className={styles.error}>{detailErrors.phone}</p>}
                            </div>
                        </div>
                    </div>
                    <div className={styles.submitArea}>
                        <button type="submit" className="btn btn-primary">Enviar comprobante</button>
                    </div>
                </form>
            )}

            {/* Step 2 (non-food): Quantity + Buyer Data */}
            {step === 2 && !isFoodSale && (
                <form onSubmit={handleSubmit} className={styles.formContainer} noValidate>
                    {currentEvent && <p className={styles.eventSubtitle}>{currentEvent.name}</p>}
                    <div className={styles.section}>
                        <p className={styles.sectionLabel}>Cantidad</p>
                        <div className={styles.optionsCard}>
                            <div className={styles.optionRow}>
                                <span className={styles.optionLabel}>Cantidad</span>
                                <QuantityStepper value={saleQuantity} onChange={setSaleQuantity} min={1} />
                            </div>
                            {currentEvent?.ticketPrice && (
                                <>
                                    <div className={styles.optionDivider} />
                                    <div className={styles.totalRow}>
                                        <span className={styles.totalLabel}>Total a cobrar</span>
                                        <span className={styles.totalAmount}>${(saleQuantity * currentEvent.ticketPrice).toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className={styles.section}>
                        <p className={styles.sectionLabel}>Comprador</p>
                        <div className={styles.fields}>
                            <div className={`${styles.field} ${detailErrors.buyerName ? styles.fieldError : ''}`}>
                                <span className={styles.fieldLabel}>Nombre</span>
                                <input
                                    type="text"
                                    value={buyerName}
                                    onChange={(e) => { setBuyerName(e.target.value); clearDetailError('buyerName'); }}
                                    placeholder="Ej: María González"
                                    className={styles.input}
                                />
                                {detailErrors.buyerName && <p className={styles.error}>{detailErrors.buyerName}</p>}
                            </div>
                            <div className={`${styles.field} ${detailErrors.phone ? styles.fieldError : ''}`}>
                                <span className={styles.fieldLabel}>Teléfono</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => { setPhone(e.target.value); clearDetailError('phone'); }}
                                    placeholder="Ej: 3584129488"
                                    className={styles.input}
                                />
                                <p className={styles.hint}>Sin 0 y sin 15</p>
                                {detailErrors.phone && <p className={styles.error}>{detailErrors.phone}</p>}
                            </div>
                        </div>
                    </div>
                    <div className={styles.submitArea}>
                        <button type="submit" className="btn btn-primary">Enviar comprobante</button>
                    </div>
                </form>
            )}

        </div>
    );
};

export default RegisterSaleForm;
