'use client';

/**
 * RegisterSaleSheet (Mobile)
 *
 * Bottom-sheet presentation of the "Registrar Venta" wizard.
 * Receives all state and callbacks from RegisterSaleWizard.
 * Hidden on desktop via CSS.
 *
 * Flow:
 *  Non-food: step 1 (event) → step 2 (quantity + buyer data)
 *  Food:     step 1 (event) → step 2 (dishes) → step 3 (buyer data)
 */

import React from 'react';
import { Check, CheckCircle, X } from 'lucide-react';
import type { SaleEvent } from './RegisterSaleWizard';
import type { SaleDetailsErrors } from '@/utils/registerSaleSchema';
import QuantityStepper from './QuantityStepper';
import styles from './RegisterSaleSheet.module.css';

interface Props {
    step: 1 | 2 | 3;
    isSuccess: boolean;
    activeEvents: SaleEvent[];
    currentEvent?: SaleEvent;
    isFoodSale: boolean;
    selectedEventId: string;
    eventError?: string;
    detailErrors: SaleDetailsErrors;
    saleQuantity: number;
    buyerName: string;
    phone: string;
    selectedDishes: Record<string, number>;
    onClose: () => void;
    onSelectEvent: (id: string) => void;
    onContinue: () => void;
    onContinueDishes: () => void;
    onBack: () => void;
    onQuantityChange: (qty: number) => void;
    onBuyerNameChange: (val: string) => void;
    onPhoneChange: (val: string) => void;
    onDishChange: (dishName: string, qty: number) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const RegisterSaleSheet: React.FC<Props> = ({
    step,
    isSuccess,
    activeEvents,
    currentEvent,
    isFoodSale,
    selectedEventId,
    eventError,
    detailErrors,
    saleQuantity,
    buyerName,
    phone,
    selectedDishes,
    onClose,
    onSelectEvent,
    onContinue,
    onContinueDishes,
    onBack,
    onQuantityChange,
    onBuyerNameChange,
    onPhoneChange,
    onDishChange,
    onSubmit,
}) => {
    return (
        <>
            <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
            <div
                className={styles.panel}
                role="dialog"
                aria-modal="true"
                aria-label="Registrar venta"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.handle} aria-hidden="true" />

                {/* ── Success Screen ────────────────────────────────────────── */}
                {isSuccess && (
                    <div className={styles.successScreen}>
                        <div className={styles.successIcon}>
                            <CheckCircle size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className={styles.successTitle}>¡Venta registrada!</h2>
                        <p className={styles.successDesc}>
                            La venta de <strong>{buyerName}</strong> fue registrada correctamente en{' '}
                            <strong>{currentEvent?.name}</strong>.
                        </p>
                        <button type="button" className="btn btn-primary btn-full" onClick={onClose}>
                            Listo
                        </button>
                    </div>
                )}

                {/* ── Step 1: Event Selection ───────────────────────────────── */}
                {!isSuccess && step === 1 && (
                    <>
                        <div className={styles.header}>
                            <h2 className={styles.title}>Seleccionar evento</h2>
                            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.eventList}>
                            {activeEvents.map((event) => (
                                <button
                                    key={event.id}
                                    type="button"
                                    className={`${styles.eventCard} ${selectedEventId === event.id ? styles.eventCardSelected : ''}`}
                                    onClick={() => onSelectEvent(event.id)}
                                >
                                    <div className={styles.eventCardContent}>
                                        <div className={styles.eventStatus}>
                                            <span className={styles.statusDot} />
                                            <span>ACTIVO</span>
                                        </div>
                                        <div className={styles.eventTitle}>{event.name}</div>
                                    </div>
                                    {selectedEventId === event.id && <Check size={24} className={styles.checkIcon} />}
                                </button>
                            ))}
                        </div>

                        {eventError && <p className={styles.error}>{eventError}</p>}

                        <button
                            type="button"
                            className="btn btn-primary btn-full"
                            onClick={onContinue}
                            disabled={!selectedEventId}
                        >
                            Continuar
                        </button>
                    </>
                )}

                {/* ── Step 2 (food): Dish Selection ────────────────────────── */}
                {!isSuccess && step === 2 && isFoodSale && (
                    <>
                        <div className={styles.header}>
                            <h2 className={styles.title}>{currentEvent?.name}</h2>
                            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                                <X size={24} />
                            </button>
                        </div>

                        <form className={styles.form} noValidate>
                            <div className={styles.field}>
                                <label className={styles.label}>Seleccionar platos</label>
                                {currentEvent?.dishes?.map((dish) => (
                                    <div key={dish.name} className={styles.dishSelector}>
                                        <div className={styles.dishHeader}>
                                            <span className={styles.dishName}>{dish.name}</span>
                                            <span className={styles.dishPrice}>${dish.price.toLocaleString()}</span>
                                        </div>
                                        <QuantityStepper
                                            value={selectedDishes[dish.name] ?? 0}
                                            onChange={(qty) => onDishChange(dish.name, qty)}
                                            min={0}
                                        />
                                    </div>
                                ))}
                                {detailErrors.dishes && <span className={styles.error}>{detailErrors.dishes}</span>}
                            </div>

                            {(() => {
                                const total = currentEvent?.dishes?.reduce(
                                    (acc, dish) => acc + dish.price * (selectedDishes[dish.name] ?? 0), 0
                                ) ?? 0;
                                return total > 0 ? (
                                    <div className={styles.totalRow}>
                                        <span className={styles.totalLabel}>Total a cobrar</span>
                                        <span className={styles.totalAmount}>${total.toLocaleString()}</span>
                                    </div>
                                ) : null;
                            })()}

                            <div className={styles.wizardNav}>
                                <button type="button" className="btn btn-secondary" onClick={onBack}>Atrás</button>
                                <button type="button" className="btn btn-primary" onClick={onContinueDishes}>
                                    Continuar
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {/* ── Step 2 (non-food): Quantity + Buyer Data ─────────────── */}
                {!isSuccess && step === 2 && !isFoodSale && (
                    <>
                        <div className={styles.header}>
                            <h2 className={styles.title}>{currentEvent?.name}</h2>
                            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={onSubmit} className={styles.form} noValidate>
                            <div className={styles.field}>
                                <label className={styles.label}>Cantidad de números</label>
                                <QuantityStepper
                                    value={saleQuantity}
                                    onChange={onQuantityChange}
                                    min={1}
                                />
                            </div>

                            {currentEvent?.ticketPrice && (
                                <div className={styles.totalRow}>
                                    <span className={styles.totalLabel}>Total a cobrar</span>
                                    <span className={styles.totalAmount}>${(saleQuantity * currentEvent.ticketPrice).toLocaleString()}</span>
                                </div>
                            )}

                            <div className={`${styles.field} ${detailErrors.buyerName ? styles.fieldError : ''}`}>
                                <label className={styles.label} htmlFor="sheet-buyer">Nombre del comprador</label>
                                <input
                                    id="sheet-buyer"
                                    type="text"
                                    value={buyerName}
                                    onChange={(e) => onBuyerNameChange(e.target.value)}
                                    placeholder="Ej: María González"
                                    className={styles.input}
                                />
                                {detailErrors.buyerName && <span className={styles.error}>{detailErrors.buyerName}</span>}
                            </div>

                            <div className={`${styles.field} ${detailErrors.phone ? styles.fieldError : ''}`}>
                                <label className={styles.label} htmlFor="sheet-phone">Teléfono</label>
                                <input
                                    id="sheet-phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => onPhoneChange(e.target.value)}
                                    placeholder="Ej: 3584129488"
                                    className={styles.input}
                                />
                                <span className={styles.hint}>Escribe el número sin 0 y sin 15</span>
                                {detailErrors.phone && <span className={styles.error}>{detailErrors.phone}</span>}
                            </div>

                            <div className={styles.wizardNav}>
                                <button type="button" className="btn btn-secondary" onClick={onBack}>Atrás</button>
                                <button type="submit" className="btn btn-primary">Enviar comprobante</button>
                            </div>
                        </form>
                    </>
                )}

                {/* ── Step 3 (food): Buyer Data ─────────────────────────────── */}
                {!isSuccess && step === 3 && (
                    <>
                        <div className={styles.header}>
                            <h2 className={styles.title}>{currentEvent?.name}</h2>
                            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={onSubmit} className={styles.form} noValidate>
                            <div className={`${styles.field} ${detailErrors.buyerName ? styles.fieldError : ''}`}>
                                <label className={styles.label} htmlFor="sheet-buyer-food">Nombre del comprador</label>
                                <input
                                    id="sheet-buyer-food"
                                    type="text"
                                    value={buyerName}
                                    onChange={(e) => onBuyerNameChange(e.target.value)}
                                    placeholder="Ej: María González"
                                    className={styles.input}
                                />
                                {detailErrors.buyerName && <span className={styles.error}>{detailErrors.buyerName}</span>}
                            </div>

                            <div className={`${styles.field} ${detailErrors.phone ? styles.fieldError : ''}`}>
                                <label className={styles.label} htmlFor="sheet-phone-food">Teléfono</label>
                                <input
                                    id="sheet-phone-food"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => onPhoneChange(e.target.value)}
                                    placeholder="Ej: 3584129488"
                                    className={styles.input}
                                />
                                <span className={styles.hint}>Escribe el número sin 0 y sin 15</span>
                                {detailErrors.phone && <span className={styles.error}>{detailErrors.phone}</span>}
                            </div>

                            <div className={styles.wizardNav}>
                                <button type="button" className="btn btn-secondary" onClick={onBack}>Atrás</button>
                                <button type="submit" className="btn btn-primary">Enviar comprobante</button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </>
    );
};

export default RegisterSaleSheet;
