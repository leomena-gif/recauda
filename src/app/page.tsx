'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EventStatusFilter } from '@/types/models';
import { EVENT_FILTER_OPTIONS } from '@/constants';
import { validateName, validatePhone } from '@/utils/validation';
import CancelledEventCard from '@/components/CancelledEventCard';
import ActiveEventCard from '@/components/ActiveEventCard';
import FoodEventCard from '@/components/FoodEventCard';
import CompletedEventCard from '@/components/CompletedEventCard';
import CardEmptyState from '@/components/CardEmptyState';
import EventsEmptyState from '@/components/EventsEmptyState';
import styles from './page.module.css';

// Mock events data - TODO: Replace with API
const MOCK_EVENTS = [
  {
    id: '1',
    status: 'active',
    type: 'raffle',
    name: 'Rifa día del niño del Grupo Scout General Deheza',
    component: ActiveEventCard
  },
  {
    id: '2',
    status: 'active',
    type: 'food_sale',
    name: 'Venta de comida - Platos especiales',
    component: FoodEventCard,
    dishes: [
      { name: 'Milanesa con papas', price: 2500, sold: 45, total: 100 },
      { name: 'Empanadas (docena)', price: 3000, sold: 30, total: 80 },
    ]
  },
  { id: '3', status: 'cancelled', type: 'raffle', name: 'Rifa cancelada', component: CancelledEventCard },
  { id: '4', status: 'completed', type: 'raffle', name: 'Rifa completada', component: CompletedEventCard },
  { id: '5', status: 'completed', type: 'raffle', name: 'Rifa completada 2', component: CompletedEventCard },
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
  const [selectedEvent, setSelectedEvent] = useState<string>(''); // Event ID
  const [mobileSheetStep, setMobileSheetStep] = useState<1 | 2>(1); // Mobile wizard step
  const [desktopModalStep, setDesktopModalStep] = useState<1 | 2>(1); // Desktop wizard step
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [saleBuyerName, setSaleBuyerName] = useState('');
  const [salePhone, setSalePhone] = useState('');
  const [saleFormErrors, setSaleFormErrors] = useState<{ buyerName?: string; phone?: string; event?: string; dishes?: string }>({});

  // Food sale states
  const [selectedDishes, setSelectedDishes] = useState<Record<string, number>>({}); // { dishName: quantity }

  const openRegisterSaleSheet = () => setRegisterSaleSheetOpen(true);
  const closeRegisterSaleSheet = () => {
    setRegisterSaleSheetOpen(false);
    setSelectedEvent('');
    setMobileSheetStep(1);
    setDesktopModalStep(1);
    setSaleQuantity(1);
    setSaleBuyerName('');
    setSalePhone('');
    setSaleFormErrors({});
    setSelectedDishes({});
  };

  const handleRegisterSale = () => {
    openRegisterSaleSheet();
  };

  const handleSubmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    const err: { buyerName?: string; phone?: string; event?: string; dishes?: string } = {};

    // Validate event selection
    if (!selectedEvent) {
      err.event = 'Debes seleccionar un evento';
    }

    // Validate dishes for food sale events
    const currentEvent = MOCK_EVENTS.find(e => e.id === selectedEvent);
    if (currentEvent?.type === 'food_sale') {
      const totalDishes = Object.values(selectedDishes).reduce((sum, qty) => sum + qty, 0);
      if (totalDishes === 0) {
        err.dishes = 'Debes seleccionar al menos un plato';
      }
    }

    const nameErr = validateName(saleBuyerName);
    if (nameErr) err.buyerName = nameErr;
    const phoneErr = validatePhone(salePhone);
    if (phoneErr) err.phone = phoneErr;
    setSaleFormErrors(err);
    if (Object.keys(err).length > 0) return;

    // TODO: Submit with selectedEvent, selectedDishes (for food), saleQuantity (for raffle), saleBuyerName, salePhone
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
                    className={`${styles.pill} ${selectedFilter === option.value ? styles.pillActive : ''
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
              // Pass specific props for FoodEventCard
              if (event.type === 'food_sale' && event.dishes) {
                return (
                  <EventComponent
                    key={event.id}
                    id={event.id}
                    title={event.name}
                    dishes={event.dishes}
                  />
                );
              }
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

      {/* Sheet: Registrar venta — SOLO MOBILE - Multi-step Wizard */}
      {registerSaleSheetOpen && (
        <>
          <div className={styles.registerSaleSheetOverlay} onClick={closeRegisterSaleSheet} aria-hidden="true" />
          <div className={styles.registerSaleSheetPanel} role="dialog" aria-label="Registrar venta" onClick={(e) => e.stopPropagation()}>
            <div className={styles.registerSaleSheetHandle} aria-hidden="true" />

            {/* Step 1: Event Selection */}
            {mobileSheetStep === 1 && (
              <>
                <div className={styles.registerSaleSheetHeader}>
                  <h2 className={styles.registerSaleSheetTitle}>
                    Seleccionar evento
                  </h2>
                  <button
                    type="button"
                    className={styles.registerSaleSheetClose}
                    onClick={closeRegisterSaleSheet}
                    aria-label="Cerrar"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <div className={styles.registerSaleEventList}>
                  {MOCK_EVENTS.filter(e => e.status === 'active').map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      className={`${styles.registerSaleEventCard} ${selectedEvent === event.id ? styles.registerSaleEventCardSelected : ''}`}
                      onClick={() => {
                        setSelectedEvent(event.id);
                        if (saleFormErrors.event) setSaleFormErrors((prev) => ({ ...prev, event: undefined }));
                      }}
                    >
                      <div className={styles.registerSaleEventCardContent}>
                        <div className={styles.registerSaleEventCardStatus}>
                          <span className={styles.registerSaleEventStatusDot}></span>
                          <span>ACTIVO</span>
                        </div>
                        <div className={styles.registerSaleEventCardTitle}>
                          {event.name || 'Rifa día del niño del Grupo Scout General Deheza'}
                        </div>
                      </div>
                      {selectedEvent === event.id && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                {saleFormErrors.event && (
                  <p className={styles.registerSaleError}>{saleFormErrors.event}</p>
                )}
                <button
                  type="button"
                  className={styles.registerSaleSubmit}
                  onClick={() => {
                    if (!selectedEvent) {
                      setSaleFormErrors({ event: 'Debes seleccionar un evento' });
                      return;
                    }
                    setMobileSheetStep(2);
                  }}
                  disabled={!selectedEvent}
                >
                  Continuar
                </button>
              </>
            )}

            {/* Step 2: Sale Details */}
            {mobileSheetStep === 2 && (() => {
              const currentEvent = MOCK_EVENTS.find(e => e.id === selectedEvent);
              const isFoodSale = currentEvent?.type === 'food_sale';

              return (
                <>
                  <div className={styles.registerSaleSheetHeader}>
                    <h2 className={styles.registerSaleSheetTitle}>
                      {currentEvent?.name || 'Rifa día del niño del Grupo Scout General Deheza'}
                    </h2>
                    <button
                      type="button"
                      className={styles.registerSaleSheetClose}
                      onClick={closeRegisterSaleSheet}
                      aria-label="Cerrar"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleSubmitReceipt} className={styles.registerSaleForm}>
                    {isFoodSale && currentEvent?.dishes ? (
                      // Food sale: Show dish selection
                      <>
                        <div className={styles.registerSaleField}>
                          <label className={styles.registerSaleLabel}>Seleccionar platos</label>
                          {currentEvent.dishes.map((dish, index) => (
                            <div key={index} className={styles.dishSelector}>
                              <div className={styles.dishSelectorHeader}>
                                <span className={styles.dishSelectorName}>{dish.name}</span>
                                <span className={styles.dishSelectorPrice}>${dish.price.toLocaleString()}</span>
                              </div>
                              <input
                                type="number"
                                min={0}
                                value={selectedDishes[dish.name] || 0}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value, 10) || 0;
                                  setSelectedDishes(prev => ({
                                    ...prev,
                                    [dish.name]: value
                                  }));
                                  if (saleFormErrors.dishes) {
                                    setSaleFormErrors(prev => ({ ...prev, dishes: undefined }));
                                  }
                                }}
                                className={styles.registerSaleInput}
                                placeholder="Cantidad"
                              />
                            </div>
                          ))}
                          {saleFormErrors.dishes && (
                            <span className={styles.registerSaleError}>{saleFormErrors.dishes}</span>
                          )}
                        </div>
                      </>
                    ) : (
                      // Raffle: Show quantity input
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
                    )}
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
                    <div className={styles.registerSaleWizardNav}>
                      <button
                        type="button"
                        className={styles.registerSaleBackButton}
                        onClick={() => setMobileSheetStep(1)}
                      >
                        Atrás
                      </button>
                      <button type="submit" className={styles.registerSaleSubmit}>
                        Enviar comprobante
                      </button>
                    </div>
                  </form >
                </>
              );
            })()}
          </div>
        </>
      )}

      {/* Modal: Registrar venta — SOLO DESKTOP - Wizard */}
      {
        registerSaleSheetOpen && (
          <div className={styles.registerSaleModalOverlay} onClick={closeRegisterSaleSheet}>
            <div className={styles.registerSaleModal} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Registrar venta">

              {/* Step 1: Event Selection */}
              {desktopModalStep === 1 && (
                <>
                  <div className={styles.registerSaleModalHeader}>
                    <h2 className={styles.registerSaleModalTitle}>
                      Seleccionar evento
                    </h2>
                    <button
                      type="button"
                      className={styles.registerSaleModalClose}
                      onClick={closeRegisterSaleSheet}
                      aria-label="Cerrar"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  <div className={styles.registerSaleModalContent}>
                    <div className={styles.registerSaleDesktopEventList}>
                      {MOCK_EVENTS.filter(e => e.status === 'active').map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          className={`${styles.registerSaleDesktopEventCard} ${selectedEvent === event.id ? styles.registerSaleDesktopEventCardSelected : ''}`}
                          onClick={() => {
                            setSelectedEvent(event.id);
                            if (saleFormErrors.event) setSaleFormErrors((prev) => ({ ...prev, event: undefined }));
                          }}
                        >
                          <div className={styles.registerSaleEventCardContent}>
                            <div className={styles.registerSaleEventCardStatus}>
                              <span className={styles.registerSaleEventStatusDot}></span>
                              <span>ACTIVO</span>
                            </div>
                            <div className={styles.registerSaleEventCardTitle}>
                              {event.name || 'Rifa día del niño del Grupo Scout General Deheza'}
                            </div>
                          </div>
                          {selectedEvent === event.id && (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                    {saleFormErrors.event && (
                      <p className={styles.registerSaleModalError}>{saleFormErrors.event}</p>
                    )}
                    <div className={styles.registerSaleModalActions}>
                      <button type="button" className={styles.registerSaleModalCancel} onClick={closeRegisterSaleSheet}>
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className={styles.registerSaleModalSubmit}
                        onClick={() => {
                          if (!selectedEvent) {
                            setSaleFormErrors({ event: 'Debes seleccionar un evento' });
                            return;
                          }
                          setDesktopModalStep(2);
                        }}
                        disabled={!selectedEvent}
                      >
                        Continuar
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Sale Form */}
              {desktopModalStep === 2 && (() => {
                const currentEvent = MOCK_EVENTS.find(e => e.id === selectedEvent);
                const isFoodSale = currentEvent?.type === 'food_sale';

                return (
                  <>
                    <div className={styles.registerSaleModalHeader}>
                      <h2 className={styles.registerSaleModalTitle}>
                        {currentEvent?.name || 'Rifa día del niño del Grupo Scout General Deheza'}
                      </h2>
                      <button
                        type="button"
                        className={styles.registerSaleModalClose}
                        onClick={closeRegisterSaleSheet}
                        aria-label="Cerrar"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                    <div className={styles.registerSaleModalContent}>
                      <form onSubmit={handleSubmitReceipt} className={styles.registerSaleModalForm}>
                        <div className={styles.registerSaleFormCard}>
                          {isFoodSale && currentEvent?.dishes ? (
                            // Food sale: Show dish selection
                            <div className={styles.registerSaleFieldGroup}>
                              <label className={styles.registerSaleModalLabel}>Seleccionar platos</label>
                              {currentEvent.dishes.map((dish, index) => (
                                <div key={index} className={styles.dishSelector}>
                                  <div className={styles.dishSelectorHeader}>
                                    <span className={styles.dishSelectorName}>{dish.name}</span>
                                    <span className={styles.dishSelectorPrice}>${dish.price.toLocaleString()}</span>
                                  </div>
                                  <input
                                    type="number"
                                    min={0}
                                    value={selectedDishes[dish.name] || 0}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value, 10) || 0;
                                      setSelectedDishes(prev => ({
                                        ...prev,
                                        [dish.name]: value
                                      }));
                                      if (saleFormErrors.dishes) {
                                        setSaleFormErrors(prev => ({ ...prev, dishes: undefined }));
                                      }
                                    }}
                                    className={styles.registerSaleModalInput}
                                    placeholder="Cantidad"
                                  />
                                </div>
                              ))}
                              {saleFormErrors.dishes && (
                                <p className={styles.registerSaleModalError}>{saleFormErrors.dishes}</p>
                              )}
                            </div>
                          ) : (
                            // Raffle: Show quantity input
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
                          )}
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
                          <button
                            type="button"
                            className={styles.registerSaleModalCancel}
                            onClick={() => setDesktopModalStep(1)}
                          >
                            Atrás
                          </button>
                          <button type="submit" className={styles.registerSaleModalSubmit}>
                            Enviar comprobante
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )
      }
    </>
  );
}
