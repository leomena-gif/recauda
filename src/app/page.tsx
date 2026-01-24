'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EventStatusFilter } from '@/types/models';
import { EVENT_FILTER_OPTIONS } from '@/constants';
import { validateName, validatePhone } from '@/utils/validation';
import CancelledEventCard from '@/components/CancelledEventCard';
import ActiveEventCard from '@/components/ActiveEventCard';
import CompletedEventCard from '@/components/CompletedEventCard';
import CardEmptyState from '@/components/CardEmptyState';
import EventsEmptyState from '@/components/EventsEmptyState';
import styles from './page.module.css';

// Mock events data - TODO: Replace with API
const MOCK_EVENTS = [
  { id: '1', status: 'active', component: ActiveEventCard },
  { id: '2', status: 'active', component: ActiveEventCard },
  { id: '3', status: 'cancelled', component: CancelledEventCard },
  { id: '4', status: 'completed', component: CompletedEventCard },
  { id: '5', status: 'completed', component: CompletedEventCard },
];

export default function Home() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<EventStatusFilter>('all');

  // Filter events based on selected pill
  const filteredEvents = useMemo(() => {
    if (selectedFilter === 'all') {
      return MOCK_EVENTS;
    }
    return MOCK_EVENTS.filter(event => event.status === selectedFilter);
  }, [selectedFilter]);

  const hasEvents = MOCK_EVENTS.length > 0;
  const hasFilteredEvents = filteredEvents.length > 0;

  const [registerSaleSheetOpen, setRegisterSaleSheetOpen] = useState(false);
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [saleBuyerName, setSaleBuyerName] = useState('');
  const [salePhone, setSalePhone] = useState('');
  const [saleFormErrors, setSaleFormErrors] = useState<{ buyerName?: string; phone?: string }>({});

  const openRegisterSaleSheet = () => setRegisterSaleSheetOpen(true);
  const closeRegisterSaleSheet = () => {
    setRegisterSaleSheetOpen(false);
    setSaleQuantity(1);
    setSaleBuyerName('');
    setSalePhone('');
    setSaleFormErrors({});
  };

  const handleRegisterSale = () => {
    openRegisterSaleSheet();
  };

  const handleSubmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    const err: { buyerName?: string; phone?: string } = {};
    const nameErr = validateName(saleBuyerName);
    if (nameErr) err.buyerName = nameErr;
    const phoneErr = validatePhone(salePhone);
    if (phoneErr) err.phone = phoneErr;
    setSaleFormErrors(err);
    if (Object.keys(err).length > 0) return;
    closeRegisterSaleSheet();
  };

  const handleCreateEvent = () => {
    router.push('/create-event');
  };

  return (
    <>
      <div className="pageContainer">
        {/* Header - Desktop Only */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={`pageTitle ${styles.pageTitle}`}>Mis Eventos</h1>
          </div>
          <div className={styles.headerActions}>
            <button
              className="btn btn-secondary"
              onClick={handleRegisterSale}
            >
              Registrar venta
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreateEvent}
            >
              Crear evento
            </button>
          </div>
        </div>
        
        {/* Filter Pills */}
        {hasEvents && (
          <div className={styles.filtersContainer}>
            <div className={styles.pillsGroup}>
              {EVENT_FILTER_OPTIONS.map((option) => {
                return (
                  <button
                    key={option.value}
                    className={`${styles.pill} ${
                      selectedFilter === option.value ? styles.pillActive : ''
                    }`}
                    onClick={() => setSelectedFilter(option.value as EventStatusFilter)}
                  >
                    <span className={styles.pillText}>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Events Grid */}
        {!hasEvents ? (
          <CardEmptyState onCreateEvent={handleCreateEvent} />
        ) : !hasFilteredEvents ? (
          <EventsEmptyState filterType={selectedFilter} />
        ) : (
          <div className="cardsContainer">
            {filteredEvents.map((event) => {
              const EventComponent = event.component;
              return <EventComponent key={event.id} />;
            })}
          </div>
        )}
      </div>

      {/* Register Sale Button - Fixed at bottom */}
      <div className={styles.bottomButtonContainer}>
        <button
          className={`${styles.registerSaleButton} btn btn-full`}
          onClick={handleRegisterSale}
        >
          Registrar venta
        </button>
      </div>

      {/* Sheet: Registrar venta — SOLO MOBILE */}
      {registerSaleSheetOpen && (
        <>
          <div className={styles.registerSaleSheetOverlay} onClick={closeRegisterSaleSheet} aria-hidden="true" />
          <div className={styles.registerSaleSheetPanel} role="dialog" aria-label="Registrar venta" onClick={(e) => e.stopPropagation()}>
            <div className={styles.registerSaleSheetHandle} aria-hidden="true" />
            <div className={styles.registerSaleSheetHeader}>
              <h2 className={styles.registerSaleSheetTitle}>
                Rifa día del niño del Grupo Scout General Deheza
              </h2>
              <button
                type="button"
                className={styles.registerSaleSheetClose}
                onClick={closeRegisterSaleSheet}
                aria-label="Cerrar"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmitReceipt} className={styles.registerSaleForm}>
              <div className={styles.registerSaleField}>
                <label className={styles.registerSaleLabel} htmlFor="sale-quantity-sheet">Cantidad de números</label>
                <input
                  id="sale-quantity-sheet"
                  type="number"
                  min={1}
                  value={saleQuantity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setSaleQuantity(Number.isNaN(v) || v < 1 ? 1 : v);
                  }}
                  className={styles.registerSaleInput}
                />
              </div>
              <div className={`${styles.registerSaleField} ${saleFormErrors.buyerName ? styles.registerSaleFieldError : ''}`}>
                <label className={styles.registerSaleLabel} htmlFor="sale-buyer-sheet">Nombre del comprador</label>
                <input
                  id="sale-buyer-sheet"
                  type="text"
                  value={saleBuyerName}
                  onChange={(e) => {
                    setSaleBuyerName(e.target.value);
                    if (saleFormErrors.buyerName) setSaleFormErrors((prev) => ({ ...prev, buyerName: undefined }));
                  }}
                  placeholder="Ej: María González"
                  className={styles.registerSaleInput}
                />
                {saleFormErrors.buyerName && (
                  <span className={styles.registerSaleError}>{saleFormErrors.buyerName}</span>
                )}
              </div>
              <div className={`${styles.registerSaleField} ${saleFormErrors.phone ? styles.registerSaleFieldError : ''}`}>
                <label className={styles.registerSaleLabel} htmlFor="sale-phone-sheet">Teléfono</label>
                <input
                  id="sale-phone-sheet"
                  type="tel"
                  value={salePhone}
                  onChange={(e) => {
                    setSalePhone(e.target.value);
                    if (saleFormErrors.phone) setSaleFormErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="Ej: 3584129488"
                  className={styles.registerSaleInput}
                />
                <span className={styles.registerSaleHelper}>Escribe el número sin 0 y sin 15</span>
                {saleFormErrors.phone && (
                  <span className={styles.registerSaleError}>{saleFormErrors.phone}</span>
                )}
              </div>
              <button type="submit" className={styles.registerSaleSubmit}>
                Enviar comprobante
              </button>
            </form>
          </div>
        </>
      )}

      {/* Modal: Registrar venta — SOLO DESKTOP (como edición de vendedor) */}
      {registerSaleSheetOpen && (
        <div className={styles.registerSaleModalOverlay} onClick={closeRegisterSaleSheet}>
          <div className={styles.registerSaleModal} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Registrar venta">
            <div className={styles.registerSaleModalHeader}>
              <h2 className={styles.registerSaleModalTitle}>
                Rifa día del niño del Grupo Scout General Deheza
              </h2>
              <button
                type="button"
                className={styles.registerSaleModalClose}
                onClick={closeRegisterSaleSheet}
                aria-label="Cerrar"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className={styles.registerSaleModalContent}>
              <form onSubmit={handleSubmitReceipt} className={styles.registerSaleModalForm}>
                <div className={styles.registerSaleFormCard}>
                  <div className={styles.registerSaleFieldGroup}>
                    <label className={styles.registerSaleModalLabel} htmlFor="sale-quantity-modal">Cantidad de números</label>
                    <input
                      id="sale-quantity-modal"
                      type="number"
                      min={1}
                      value={saleQuantity}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setSaleQuantity(Number.isNaN(v) || v < 1 ? 1 : v);
                      }}
                      className={styles.registerSaleModalInput}
                    />
                  </div>
                  <div className={`${styles.registerSaleFieldGroup} ${saleFormErrors.buyerName ? styles.registerSaleModalFieldError : ''}`}>
                    <label className={styles.registerSaleModalLabel} htmlFor="sale-buyer-modal">Nombre del comprador</label>
                    <input
                      id="sale-buyer-modal"
                      type="text"
                      value={saleBuyerName}
                      onChange={(e) => {
                        setSaleBuyerName(e.target.value);
                        if (saleFormErrors.buyerName) setSaleFormErrors((prev) => ({ ...prev, buyerName: undefined }));
                      }}
                      placeholder="Ej: María González"
                      className={styles.registerSaleModalInput}
                    />
                    {saleFormErrors.buyerName && (
                      <p className={styles.registerSaleModalError}>{saleFormErrors.buyerName}</p>
                    )}
                  </div>
                  <div className={`${styles.registerSaleFieldGroup} ${saleFormErrors.phone ? styles.registerSaleModalFieldError : ''}`}>
                    <label className={styles.registerSaleModalLabel} htmlFor="sale-phone-modal">Teléfono</label>
                    <input
                      id="sale-phone-modal"
                      type="tel"
                      value={salePhone}
                      onChange={(e) => {
                        setSalePhone(e.target.value);
                        if (saleFormErrors.phone) setSaleFormErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      placeholder="Ej: 3584129488"
                      className={styles.registerSaleModalInput}
                    />
                    <p className={styles.registerSaleModalInstruction}>Escribe el número sin 0 y sin 15</p>
                    {saleFormErrors.phone && (
                      <p className={styles.registerSaleModalError}>{saleFormErrors.phone}</p>
                    )}
                  </div>
                </div>
                <div className={styles.registerSaleModalActions}>
                  <button type="button" className={styles.registerSaleModalCancel} onClick={closeRegisterSaleSheet}>
                    Cancelar
                  </button>
                  <button type="submit" className={styles.registerSaleModalSubmit}>
                    Enviar comprobante
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
