'use client';

import React, { useState, useMemo } from 'react';
import { Buyer, Event, Seller, StatusFilter } from '@/types/models';
import { STATUS_OPTIONS } from '@/constants';
import { MOCK_BUYERS, MOCK_EVENTS, MOCK_SELLERS } from '@/mocks/data';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import CustomDropdown from '@/components/CustomDropdown';
import styles from './BuyersList.module.css';

export default function BuyersList() {
  // State
  const [buyers, setBuyers] = useState<Buyer[]>(MOCK_BUYERS);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [sellers] = useState<Seller[]>(MOCK_SELLERS);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  // Initialize with the first active event if available
  const [eventFilter, setEventFilter] = useState<string>(() => {
    const active = MOCK_EVENTS.filter(e => e.status === 'active');
    return active.length > 0 ? active[0].id : '';
  });
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([]);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null);
  // Desktop context menu state
  const [desktopMenuOpen, setDesktopMenuOpen] = useState<string | null>(null);
  // Mobile-only: Filtros sheet, Assign sticky + sheet
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);

  // Custom hooks
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Computed values
  const activeEvents = useMemo(
    () => events.filter(event => event.status === 'active'),
    [events]
  );

  // Enforce single event selection
  React.useEffect(() => {
    if (activeEvents.length > 0 && (!eventFilter || eventFilter === 'all' || !activeEvents.find(e => e.id === eventFilter))) {
      setEventFilter(activeEvents[0].id);
    }
  }, [activeEvents, eventFilter]);

  // Filtered buyers - solo compradores de eventos activos
  const filteredBuyers = useMemo(() => {
    return buyers.filter(buyer => {
      // Solo mostrar compradores que tienen al menos un evento activo asignado
      const hasActiveEvent = buyer.assignedEvents.some(eventId => {
        const event = events.find(e => e.id === eventId);
        return event?.status === 'active';
      });

      if (!hasActiveEvent) return false;

      const matchesSearch =
        buyer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.phone.includes(searchTerm) ||
        buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // Buscar por nombre de vendedor
        (() => {
          const seller = sellers.find(s => s.id === buyer.sellerId);
          return seller && (
            seller.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seller.lastName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        })() ||
        // Buscar por nombre de evento asignado
        (buyer.assignedEvents.length > 0 && events.find(e =>
          e.id === buyer.assignedEvents[0] &&
          e.status === 'active' &&
          e.name.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      const matchesStatus = statusFilter === 'all' || buyer.status === statusFilter;
      const matchesEvent =
        eventFilter === 'all'
          ? false // Should not happen with enforcement, but safe fallback
          : buyer.assignedEvents.some(eventId => {
            const event = events.find(e => e.id === eventId);
            return event?.status === 'active' && event.id === eventFilter;
          });

      return matchesSearch && matchesStatus && matchesEvent;
    });
  }, [buyers, searchTerm, statusFilter, events, eventFilter, sellers]);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && !(event.target as Element).closest(`.${styles.mobileMenuContainer}`)) {
        handleMobileMenuClose();
      }
      if (desktopMenuOpen && !(event.target as Element).closest(`.${styles.desktopMenuContainer}`)) {
        setDesktopMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen, desktopMenuOpen]);

  // Helper function: Check if buyer should show checkbox based on current filter
  // Helper function: Check if buyer should show checkbox based on current filter
  const shouldShowCheckbox = (buyer: Buyer): boolean => {
    // Show checkbox if buyer has any active event (raffle or food_sale)
    if (eventFilter !== 'all') {
      const filteredEvent = events.find(e => e.id === eventFilter);
      return !!filteredEvent && filteredEvent.status === 'active';
    } else {
      return buyer.assignedEvents.some(eventId => {
        const event = events.find(e => e.id === eventId);
        return event?.status === 'active';
      });
    }
  };

  // Determine selection type (raffle or food_sale)
  const selectionType = useMemo(() => {
    if (selectedBuyers.length === 0) return null;

    // Check the first selected buyer's event type to determine the action
    const firstBuyer = buyers.find(b => b.id === selectedBuyers[0]);
    if (!firstBuyer || firstBuyer.assignedEvents.length === 0) return null;

    // Find the relevant active event for this buyer
    const activeEventId = firstBuyer.assignedEvents.find(eventId => {
      const event = events.find(e => e.id === eventId);
      return event?.status === 'active' && (eventFilter === 'all' || event.id === eventFilter);
    });

    const event = events.find(e => e.id === activeEventId);
    return event?.type || null;
  }, [selectedBuyers, buyers, events, eventFilter]);

  // Check if all selected buyers are already delivered
  const areAllSelectedDelivered = useMemo(() => {
    if (selectedBuyers.length === 0) return false;
    return selectedBuyers.every(id => {
      const buyer = buyers.find(b => b.id === id);
      return buyer?.isDelivered;
    });
  }, [selectedBuyers, buyers]);

  const handleToggleBuyerStatus = (buyerId: string) => {
    setBuyers(prevBuyers =>
      prevBuyers.map(buyer => {
        if (buyer.id === buyerId) {
          const newStatus = buyer.status === 'active' ? 'inactive' : 'active';
          return { ...buyer, status: newStatus };
        }
        return buyer;
      })
    );
  };

  // Desktop context menu handlers
  const handleDesktopMenuToggle = (buyerId: string) => {
    setDesktopMenuOpen(desktopMenuOpen === buyerId ? null : buyerId);
  };

  const handleDesktopToggleStatus = (buyerId: string) => {
    handleToggleBuyerStatus(buyerId);
    setDesktopMenuOpen(null);
  };

  // Mobile menu handlers
  const handleMobileMenuToggle = (buyerId: string) => {
    setMobileMenuOpen(mobileMenuOpen === buyerId ? null : buyerId);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(null);
  };

  const openFiltersSheet = () => setFiltersSheetOpen(true);
  const closeFiltersSheet = () => setFiltersSheetOpen(false);

  const handleMobileToggleStatus = (buyerId: string) => {
    handleToggleBuyerStatus(buyerId);
    handleMobileMenuClose();
  };

  const handleMobileAssignCancel = () => {
    setSelectedBuyers([]);
  };

  const handleSelectBuyer = (buyerId: string) => {
    setSelectedBuyers(prev =>
      prev.includes(buyerId)
        ? prev.filter(id => id !== buyerId)
        : [...prev, buyerId]
    );
  };

  const handleSelectAll = () => {
    const raffleBuyers = filteredBuyers.filter(buyer =>
      buyer.status === 'active' && shouldShowCheckbox(buyer)
    );

    if (selectedBuyers.length === raffleBuyers.length && raffleBuyers.length > 0) {
      setSelectedBuyers([]);
    } else {
      setSelectedBuyers(raffleBuyers.map(buyer => buyer.id));
    }
  };

  const handlePrintReceipts = () => {
    // TODO: Implementar lógica de impresión
    console.log('Imprimir comprobantes para:', selectedBuyers);
    alert(`Imprimiendo ${selectedBuyers.length} comprobantes`);
  };

  const handleSetDeliveredStatus = (status: boolean) => {
    setBuyers(prevBuyers =>
      prevBuyers.map(buyer => {
        if (selectedBuyers.includes(buyer.id)) {
          return { ...buyer, isDelivered: status };
        }
        return buyer;
      })
    );

    // Clear selection after action
    setSelectedBuyers([]);
  };

  return (
    <div className="pageContainer">
      <div className={styles.stickyHeader}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className="pageTitle">Lista de Compradores</h1>
          </div>
        </div>

        {/* Action Bar */}
        <div className={styles.actionBar}>
          <div className={styles.leftSection}>
            <div className={styles.searchContainer}>
              <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                placeholder="Buscar compradores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Desktop: dos filtros en línea */}
            <div className={styles.filtersGroupDesktop}>
              <div className={styles.statusFilter}>
                <CustomDropdown
                  options={STATUS_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value as StatusFilter)}
                  placeholder="Filtrar por estado"
                />
              </div>
              <div className={styles.eventFilter}>
                <CustomDropdown
                  options={[
                    { value: 'all', label: 'Todos los eventos activos' },
                    ...activeEvents.map(event => ({ value: event.id, label: event.name }))
                  ]}
                  value={eventFilter}
                  onChange={(value) => setEventFilter(value as string)}
                  placeholder="Filtrar por evento"
                  alignRight={true}
                />
              </div>
            </div>

            {/* Mobile: botón Filtros abre sheet */}
            {!isDesktop && (
              <button
                type="button"
                className={styles.filtersTriggerMobile}
                onClick={openFiltersSheet}
                aria-label="Abrir filtros"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Filtros</span>
              </button>
            )}
          </div>

          {/* Dynamic Action Button based on selection type (Desktop) */}
          {isDesktop && selectedBuyers.length > 0 && selectionType === 'raffle' && (
            <button
              onClick={handlePrintReceipts}
              className="btn btn-primary"
              title="Imprimir comprobantes"
              style={{ gap: '8px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9V2H18V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="6" y="14" width="12" height="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Imprimir comprobantes</span>
            </button>
          )}

          {isDesktop && selectedBuyers.length > 0 && selectionType === 'food_sale' && (
            <button
              onClick={() => handleSetDeliveredStatus(!areAllSelectedDelivered)}
              className="btn btn-primary"
              title={areAllSelectedDelivered ? "Desmarcar como entregado" : "Marcar como entregado"}
              style={{
                gap: '8px',
                backgroundColor: areAllSelectedDelivered ? 'var(--color-error)' : 'var(--color-success)',
                borderColor: areAllSelectedDelivered ? 'var(--color-error)' : 'var(--color-success)'
              }}
            >
              {areAllSelectedDelivered ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Desmarcar</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Entregado</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile: sticky bottom bar para acciones (solo cuando hay selección) */}
      {!isDesktop && selectedBuyers.length > 0 && (
        <div className={styles.assignStickyBar}>
          <button type="button" className={styles.assignStickyCancel} onClick={handleMobileAssignCancel}>
            Cancelar
          </button>
          {selectionType === 'raffle' && (
            <button
              type="button"
              className={styles.assignStickyPrimary}
              onClick={handlePrintReceipts}
            >
              Imprimir {selectedBuyers.length} comprobante{selectedBuyers.length > 1 ? 's' : ''}
            </button>
          )}
          {selectionType === 'food_sale' && (
            <button
              type="button"
              className={styles.assignStickyPrimary}
              onClick={() => handleSetDeliveredStatus(!areAllSelectedDelivered)}
              style={{
                backgroundColor: areAllSelectedDelivered ? 'var(--color-error)' : 'var(--color-success)',
                color: 'white'
              }}
            >
              {areAllSelectedDelivered ? 'Desmarcar' : 'Entregado'} ({selectedBuyers.length})
            </button>
          )}
        </div>
      )}

      {/* Mobile: bottom sheet Filtros */}
      {!isDesktop && filtersSheetOpen && (
        <div className={styles.sheetOverlay} onClick={closeFiltersSheet} aria-hidden="true" />
      )}
      {!isDesktop && filtersSheetOpen && (
        <div className={styles.sheetPanel} role="dialog" aria-label="Filtros" onClick={(e) => e.stopPropagation()}>
          <div className={styles.sheetHandle} aria-hidden="true" />
          <h2 className={styles.sheetTitle}>Filtros</h2>
          <div className={styles.sheetFilters}>
            <div className={styles.sheetFilterGroup}>
              <span className={styles.sheetFilterLabel}>Estado</span>
              <div className={styles.sheetFilterOptions}>
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={statusFilter === opt.value ? styles.sheetFilterOptionActive : styles.sheetFilterOption}
                    onClick={() => setStatusFilter(opt.value as StatusFilter)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.sheetFilterGroup}>
              <span className={styles.sheetFilterLabel}>Evento</span>
              <div className={styles.sheetFilterOptions}>
                {activeEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className={eventFilter === event.id ? styles.sheetFilterOptionActive : styles.sheetFilterOption}
                    onClick={() => setEventFilter(event.id)}
                  >
                    {event.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button type="button" className={styles.sheetApply} onClick={closeFiltersSheet}>
            Aplicar
          </button>
        </div>
      )}

      {/* Desktop Table View - Solo visible en desktop */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxColumn}>
                <div className={styles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    checked={
                      filteredBuyers.filter(b => b.status === 'active' && shouldShowCheckbox(b)).length > 0 &&
                      selectedBuyers.length === filteredBuyers.filter(b => b.status === 'active' && shouldShowCheckbox(b)).length
                    }
                    onChange={handleSelectAll}
                    className={styles.checkbox}
                    disabled={filteredBuyers.filter(b => b.status === 'active' && shouldShowCheckbox(b)).length === 0}
                    title={filteredBuyers.filter(b => b.status === 'active' && shouldShowCheckbox(b)).length === 0 ? 'No hay compradores de rifas activos para seleccionar' : 'Seleccionar todos los compradores de rifas activos'}
                    aria-label="Seleccionar todos los compradores de rifas"
                  />
                </div>
              </th>
              <th>
                <div className={styles.headerWithCounter}>
                  <span>Comprador</span>
                  <span className={styles.headerCounter}>{filteredBuyers.length}</span>
                </div>
              </th>
              <th>Evento Asignado</th>
              <th className={styles.actionsColumn}></th>
            </tr>
          </thead>
          <tbody>
            {filteredBuyers.map((buyer) => {
              const showCheckbox = shouldShowCheckbox(buyer);
              return (
                <tr
                  key={buyer.id}
                  className={`${styles.tableRow} ${buyer.status === 'inactive' ? styles.tableRowInactive : ''}`}
                >
                  <td className={styles.checkboxColumn}>
                    {showCheckbox ? (
                      <div className={styles.checkboxWrapper}>
                        <input
                          type="checkbox"
                          checked={selectedBuyers.includes(buyer.id)}
                          onChange={() => handleSelectBuyer(buyer.id)}
                          className={styles.checkbox}
                          disabled={buyer.status === 'inactive'}
                          aria-label={`Seleccionar ${buyer.firstName} ${buyer.lastName}`}
                        />
                      </div>
                    ) : (
                      <div className={styles.checkboxPlaceholder}></div>
                    )}
                  </td>
                  <td>
                    <div className={styles.buyerInfo}>
                      <div className={styles.buyerName}>
                        {buyer.firstName} {buyer.lastName}
                        {buyer.isDelivered && (
                          <span title="Entregado" style={{ marginLeft: '8px', display: 'inline-flex', alignItems: 'center', color: 'var(--color-success)' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div className={styles.buyerPhone}>{buyer.phone}</div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.eventInfo}>
                      {(() => {
                        // Si hay filtro de evento, mostrar ese evento; sino mostrar el primer evento activo
                        let displayEvent = null;

                        if (eventFilter !== 'all') {
                          // Mostrar el evento filtrado si el comprador lo tiene
                          displayEvent = events.find(e => e.id === eventFilter && e.status === 'active');
                        } else {
                          // Mostrar el primer evento activo asignado
                          const activeEventId = buyer.assignedEvents.find(eventId => {
                            const event = events.find(e => e.id === eventId);
                            return event?.status === 'active';
                          });
                          displayEvent = activeEventId ? events.find(e => e.id === activeEventId) : null;
                        }

                        return displayEvent ? (
                          <div className={styles.eventName}>{displayEvent.name}</div>
                        ) : (
                          <div className={styles.noEvent}>Sin evento activo</div>
                        );
                      })()}
                    </div>
                  </td>
                  <td className={styles.actionsColumn}>
                    <div className={styles.desktopMenuContainer}>
                      <button
                        className={styles.desktopMenuButton}
                        onClick={() => handleDesktopMenuToggle(buyer.id)}
                        title="Más opciones"
                        aria-label="Menú de opciones"
                        aria-expanded={desktopMenuOpen === buyer.id}
                        aria-haspopup="true"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <circle cx="12" cy="6" r="1.5" fill="currentColor" />
                          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                          <circle cx="12" cy="18" r="1.5" fill="currentColor" />
                        </svg>
                      </button>
                      {desktopMenuOpen === buyer.id && (
                        <div
                          className={styles.desktopMenuDropdown}
                          role="menu"
                        >
                          <button
                            type="button"
                            role="menuitem"
                            className={styles.desktopMenuItem}
                            onClick={() => handleDesktopToggleStatus(buyer.id)}
                          >
                            {buyer.status === 'active' ? (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Deshabilitar
                              </>
                            ) : (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Habilitar
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile List View — lista de filas, sin tabla; UX optimizada */}
      {!isDesktop && (
        <div
          className={`${styles.mobileListContainer} ${selectedBuyers.length > 0 ? styles.hasStickyBar : ''}`}
          role="list"
        >
          {filteredBuyers.map((buyer) => (
            <article
              key={buyer.id}
              role="listitem"
              className={`${styles.mobileListRow} ${buyer.status === 'inactive' ? styles.mobileRowInactive : ''} ${selectedBuyers.includes(buyer.id) ? styles.mobileRowSelected : ''}`}
            >
              <div className={styles.mobileRowCheckbox}>
                {shouldShowCheckbox(buyer) ? (
                  <input
                    type="checkbox"
                    id={`buyer-${buyer.id}`}
                    checked={selectedBuyers.includes(buyer.id)}
                    onChange={() => handleSelectBuyer(buyer.id)}
                    disabled={buyer.status === 'inactive'}
                    className={styles.mobileCheckbox}
                    aria-label={`Seleccionar ${buyer.firstName} ${buyer.lastName}`}
                  />
                ) : (
                  <div style={{ width: '24px' }}></div>
                )}
              </div>
              <div className={styles.mobileRowMain}>
                <div className={styles.mobileRowTop}>
                  <h3 className={styles.mobileRowName}>
                    {buyer.firstName} {buyer.lastName}
                    {buyer.isDelivered && (
                      <span title="Entregado" style={{ marginLeft: '8px', display: 'inline-flex', alignItems: 'center', color: 'var(--color-success)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </h3>
                  <div className={styles.mobileMenuContainer}>
                    <button
                      type="button"
                      className={styles.mobileMenuButton}
                      onClick={() => handleMobileMenuToggle(buyer.id)}
                      title="Más opciones"
                      aria-label="Menú de opciones"
                      aria-expanded={mobileMenuOpen === buyer.id}
                      aria-haspopup="true"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <circle cx="12" cy="6" r="1.5" fill="currentColor" />
                        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                        <circle cx="12" cy="18" r="1.5" fill="currentColor" />
                      </svg>
                    </button>
                    {mobileMenuOpen === buyer.id && (
                      <div className={styles.mobileMenuDropdown} role="menu">
                        <button
                          type="button"
                          role="menuitem"
                          className={styles.mobileMenuItem}
                          onClick={() => handleMobileToggleStatus(buyer.id)}
                        >
                          {buyer.status === 'active' ? (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Deshabilitar
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12 C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Habilitar
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className={styles.mobileRowPhone}>{buyer.phone}</p>
                <p className={styles.mobileRowEventLine}>
                  {(() => {
                    let displayEvent = null;
                    if (eventFilter !== 'all') {
                      displayEvent = events.find(e => e.id === eventFilter && e.status === 'active');
                    } else {
                      const activeEventId = buyer.assignedEvents.find(eventId => {
                        const event = events.find(e => e.id === eventId);
                        return event?.status === 'active';
                      });
                      displayEvent = activeEventId ? events.find(e => e.id === activeEventId) : null;
                    }
                    return displayEvent ? displayEvent.name : 'Sin evento activo';
                  })()}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {filteredBuyers.length === 0 && (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.6977C21.7033 16.0413 20.9999 15.5767 20.2 15.3778" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 3.37781C16.7999 3.57668 17.5033 4.04129 18.0094 4.6977C18.5155 5.35411 18.8 6.16449 18.8 7C18.8 7.83551 18.5155 8.64589 18.0094 9.3023C17.5033 9.95871 16.7999 10.4233 16 10.6222" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3>No se encontraron compradores</h3>
          <p>Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
}
