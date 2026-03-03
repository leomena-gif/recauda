'use client';

/**
 * RegisterSaleModal (Desktop)
 *
 * Dialog modal presentation of the "Registrar Venta" wizard.
 * Receives all state and callbacks from RegisterSaleWizard.
 * Hidden on mobile via CSS.
 */

import React from 'react';
import { Check, CheckCircle, X } from 'lucide-react';
import type { SaleEvent } from './RegisterSaleWizard';
import type { SaleDetailsErrors } from '@/utils/registerSaleSchema';
import QuantityStepper from './QuantityStepper';
import styles from './RegisterSaleModal.module.css';

interface Props {
    step: 1 | 2;
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
                    <>
                        <div className={styles.header}>
                            <h2 className={styles.title}>Venta registrada</h2>
                            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                                <X size={24} />
                            </button>
                        </div>
                        <div className={styles.content}>
                            <div className={styles.successScreen}>
                                <div className={styles.successIcon}>
                                    <CheckCircle size={52} strokeWidth={1.5} />
                                </div>
                                <h2 className={styles.successTitle}>¡Todo listo!</h2>
                                <p className={styles.successDesc}>
                                    La venta de <strong>{buyerName}</strong> fue registrada correctamente en{' '}
                                    <strong>{currentEvent?.name}</strong>.
                                </p>
                                <button type="button" className={styles.primaryBtn} onClick={onClose}>
                                    Listo
                                </button>
                            </div>
                        </div>
                    </>
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

                        <div className={styles.content}>
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

                            <div className={styles.actions}>
                                <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                                <button
                                    type="button"
                                    className={styles.primaryBtn}
                                    onClick={onContinue}
                                    disabled={!selectedEventId}
                                >
                                    Continuar
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* ── Step 2: Sale Details ──────────────────────────────────── */}
                {!isSuccess && step === 2 && (
                    <>
                        <div className={styles.header}>
                            <h2 className={styles.title}>{currentEvent?.name}</h2>
                            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.content}>
                            <form onSubmit={onSubmit} className={styles.form} noValidate>
                                <div className={styles.formCard}>
                                    {isFoodSale && currentEvent?.dishes ? (
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.label}>Seleccionar platos</label>
                                            {currentEvent.dishes.map((dish) => (
                                                <div key={dish.name} className={styles.dishSelector}>
                                                    <div className={styles.dishHeader}>
                                                        <span className={styles.dishName}>{dish.name}</span>
                                                        <span className={styles.dishPrice}>${dish.price.toLocaleString()}</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={selectedDishes[dish.name] ?? 0}
                                                        onChange={(e) => onDishChange(dish.name, parseInt(e.target.value, 10) || 0)}
                                                        className={styles.input}
                                                        placeholder="Cantidad"
                                                    />
                                                </div>
                                            ))}
                                            {detailErrors.dishes && <p className={styles.error}>{detailErrors.dishes}</p>}
                                        </div>
                                    ) : (
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.label}>Cantidad de números</label>
                                            <QuantityStepper
                                                value={saleQuantity}
                                                onChange={onQuantityChange}
                                                min={1}
                                            />
                                        </div>
                                    )}

                                    <div className={`${styles.fieldGroup} ${detailErrors.buyerName ? styles.fieldGroupError : ''}`}>
                                        <label className={styles.label} htmlFor="modal-buyer">Nombre del comprador</label>
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

                                    <div className={`${styles.fieldGroup} ${detailErrors.phone ? styles.fieldGroupError : ''}`}>
                                        <label className={styles.label} htmlFor="modal-phone">Teléfono</label>
                                        <input
                                            id="modal-phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => onPhoneChange(e.target.value)}
                                            placeholder="Ej: 3584129488"
                                            className={styles.input}
                                        />
                                        <p className={styles.hint}>Escribe el número sin 0 y sin 15</p>
                                        {detailErrors.phone && <p className={styles.error}>{detailErrors.phone}</p>}
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <button type="button" className={styles.cancelBtn} onClick={onBack}>Atrás</button>
                                    <button type="submit" className={styles.primaryBtn}>Enviar comprobante</button>
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
