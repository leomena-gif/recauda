'use client';

/**
 * RegisterSaleModal (Desktop)
 *
 * Dialog modal presentation of the "Registrar Venta" wizard.
 * Receives all state and callbacks from RegisterSaleWizard.
 * Hidden on mobile via CSS.
 *
 * Flow:
 *  Non-food: step 1 (event) → step 2 (quantity + buyer data)
 *  Food:     step 1 (event) → step 2 (dishes) → step 3 (buyer data)
 */

import React from 'react';
import { X } from 'lucide-react';
import type { SaleEvent } from './RegisterSaleWizard';
import type { SaleDetailsErrors } from '@/utils/registerSaleSchema';
import QuantityStepper from './QuantityStepper';
import styles from './RegisterSaleModal.module.css';

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

const RegisterSaleModal: React.FC<Props> = ({
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
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Registrar venta"
            >
                {/* ── Success Screen ────────────────────────────────────────── */}
                {isSuccess && (
                    <div className={styles.content}>
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
                                <button type="button" className="btn btn-primary" onClick={onClose}>
                                    Registrar otra
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={onClose}>
                                    Listo
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Step 1: Event Selection ───────────────────────────────── */}
                {!isSuccess && step === 1 && (
                    <>
                        <div className={styles.header}>
                            <h2 className={styles.title}>Registrar venta</h2>
                            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.content}>
                            <div className={styles.section}>
                                <p className={styles.sectionLabel}>Evento</p>
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

                            <div className={styles.actions}>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={onContinue}
                                    disabled={!selectedEventId}
                                >
                                    Continuar
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* ── Step 2 (food): Dish Selection ────────────────────────── */}
                {!isSuccess && step === 2 && isFoodSale && (
                    <>
                        <div className={styles.header}>
                            <div className={styles.headerText}>
                                <h2 className={styles.title}>Registrar venta</h2>
                                <p className={styles.subtitle}>{currentEvent?.name}</p>
                            </div>
                            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.content}>
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
                                                    onChange={(qty) => onDishChange(dish.name, qty)}
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

                            <div className={styles.actions}>
                                <button type="button" className="btn btn-secondary" onClick={onBack}>Atrás</button>
                                <button type="button" className="btn btn-primary" onClick={onContinueDishes}>
                                    Continuar
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* ── Step 2 (non-food): Quantity + Buyer Data ─────────────── */}
                {!isSuccess && step === 2 && !isFoodSale && (
                    <>
                        <div className={styles.header}>
                            <div className={styles.headerText}>
                                <h2 className={styles.title}>Registrar venta</h2>
                                <p className={styles.subtitle}>{currentEvent?.name}</p>
                            </div>
                            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.content}>
                            <form onSubmit={onSubmit} className={styles.form} noValidate>
                                <div className={styles.section}>
                                    <p className={styles.sectionLabel}>Números</p>
                                    <div className={styles.optionsCard}>
                                    <div className={styles.optionRow}>
                                        <span className={styles.optionLabel}>Cantidad</span>
                                        <QuantityStepper
                                            value={saleQuantity}
                                            onChange={onQuantityChange}
                                            min={1}
                                        />
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

                                <div className={styles.fields}>
                                        <div className={`${styles.field} ${detailErrors.buyerName ? styles.fieldError : ''}`}>
                                            <span className={styles.fieldLabel}>Nombre</span>
                                            <input
                                                id="modal-buyer"
                                                type="text"
                                                value={buyerName}
                                                onChange={(e) => onBuyerNameChange(e.target.value)}
                                                placeholder="Ej: María González"
                                                className={styles.input}
                                            />
                                            {detailErrors.buyerName && <p className={styles.error}>{detailErrors.buyerName}</p>}
                                        </div>

                                        <div className={`${styles.field} ${detailErrors.phone ? styles.fieldError : ''}`}>
                                            <span className={styles.fieldLabel}>Teléfono</span>
                                            <input
                                                id="modal-phone"
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => onPhoneChange(e.target.value)}
                                                placeholder="Ej: 3584129488"
                                                className={styles.input}
                                            />
                                            <p className={styles.hint}>Sin 0 y sin 15</p>
                                            {detailErrors.phone && <p className={styles.error}>{detailErrors.phone}</p>}
                                        </div>
                                    </div>

                                <div className={styles.actions}>
                                    <button type="button" className="btn btn-secondary" onClick={onBack}>Atrás</button>
                                    <button type="submit" className="btn btn-primary">Enviar comprobante</button>
                                </div>
                            </form>
                        </div>
                    </>
                )}

                {/* ── Step 3 (food): Buyer Data ─────────────────────────────── */}
                {!isSuccess && step === 3 && (
                    <>
                        <div className={styles.header}>
                            <div className={styles.headerText}>
                                <h2 className={styles.title}>Registrar venta</h2>
                                <p className={styles.subtitle}>{currentEvent?.name}</p>
                            </div>
                            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.content}>
                            <form onSubmit={onSubmit} className={styles.form} noValidate>
                                <div className={styles.fields}>
                                        <div className={`${styles.field} ${detailErrors.buyerName ? styles.fieldError : ''}`}>
                                            <span className={styles.fieldLabel}>Nombre</span>
                                            <input
                                                id="modal-buyer-food"
                                                type="text"
                                                value={buyerName}
                                                onChange={(e) => onBuyerNameChange(e.target.value)}
                                                placeholder="Ej: María González"
                                                className={styles.input}
                                            />
                                            {detailErrors.buyerName && <p className={styles.error}>{detailErrors.buyerName}</p>}
                                        </div>

                                        <div className={`${styles.field} ${detailErrors.phone ? styles.fieldError : ''}`}>
                                            <span className={styles.fieldLabel}>Teléfono</span>
                                            <input
                                                id="modal-phone-food"
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => onPhoneChange(e.target.value)}
                                                placeholder="Ej: 3584129488"
                                                className={styles.input}
                                            />
                                            <p className={styles.hint}>Sin 0 y sin 15</p>
                                            {detailErrors.phone && <p className={styles.error}>{detailErrors.phone}</p>}
                                        </div>
                                    </div>

                                <div className={styles.actions}>
                                    <button type="button" className="btn btn-secondary" onClick={onBack}>Atrás</button>
                                    <button type="submit" className="btn btn-primary">Enviar comprobante</button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RegisterSaleModal;
