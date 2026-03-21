'use client';

import React, { useState, useMemo } from 'react';
import { Buyer, Event, Seller, StatusFilter } from '@/types/models';
import { STATUS_OPTIONS, SNACKBAR_DURATION } from '@/constants';
import { useSnackbar } from '@/hooks/useSnackbar';
import { MOCK_BUYERS, MOCK_EVENTS, MOCK_SELLERS } from '@/mocks/data';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import CustomDropdown from '@/components/CustomDropdown';
import MobileListRow from '@/components/MobileListRow';
import MobileFilterSheet from '@/components/MobileFilterSheet';
import BottomSheet from '@/components/BottomSheet';
import MobileStickyActionBar from '@/components/MobileStickyActionBar';
import EmptyState from '@/components/EmptyState';
import listStyles from '@/styles/list.module.css';
import styles from './BuyersList.module.css';

export default function BuyersList() {
  // State
  const [buyers, setBuyers] = useState<Buyer[]>(MOCK_BUYERS);
  const [events] = useState<Event[]>(MOCK_EVENTS);
  const [sellers] = useState<Seller[]>(MOCK_SELLERS);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [eventFilter, setEventFilter] = useState<string>(() => {
    const active = MOCK_EVENTS.filter(e => e.status === 'active');
    return active.length > 0 ? active[0].id : '';
  });
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([]);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null);
  // Desktop context menu state
  const [desktopMenuOpen, setDesktopMenuOpen] = useState<string | null>(null);
  // Mobile-only: Filtros sheet
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
  // Filtro de entrega (solo food_sale)
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'delivered' | 'pending'>('all');
  // Filtro de impresión (solo raffle)
  const [printFilter, setPrintFilter] = useState<'all' | 'printed' | 'pending'>('all');
  // Detalle de compra modal (food sale)
  const [purchaseDetailBuyer, setPurchaseDetailBuyer] = useState<Buyer | null>(null);
  // Detalle de números modal (rifa)
  const [raffleDetailBuyer, setRaffleDetailBuyer] = useState<Buyer | null>(null);

  // Custom hooks
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const deliverySnackbar = useSnackbar(SNACKBAR_DURATION.SUCCESS);
  const raffleSnackbar = useSnackbar(SNACKBAR_DURATION.SUCCESS);

  // Computed values
  const activeEvents = useMemo(
    () => events.filter(event => event.status === 'active'),
    [events]
  );

  // Mostrar filtro de entrega solo cuando el evento seleccionado es food_sale
  const showDeliveryFilter = useMemo(() => {
    const event = events.find(e => e.id === eventFilter);
    return event?.type === 'food_sale';
  }, [eventFilter, events]);

  // Mostrar filtro de impresión solo cuando el evento seleccionado es raffle
  const showPrintFilter = useMemo(() => {
    const event = events.find(e => e.id === eventFilter);
    return event?.type === 'raffle';
  }, [eventFilter, events]);

  // Enforce single event selection
  React.useEffect(() => {
    if (activeEvents.length > 0 && (!eventFilter || eventFilter === 'all' || !activeEvents.find(e => e.id === eventFilter))) {
      setEventFilter(activeEvents[0].id);
    }
  }, [activeEvents, eventFilter]);

  // Filtered buyers - solo compradores de eventos activos
  const filteredBuyers = useMemo(() => {
    return buyers.filter(buyer => {
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
        (() => {
          const seller = sellers.find(s => s.id === buyer.sellerId);
          return seller && (
            seller.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seller.lastName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        })() ||
        (buyer.assignedEvents.length > 0 && events.find(e =>
          e.id === buyer.assignedEvents[0] &&
          e.status === 'active' &&
          e.name.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      const matchesStatus = statusFilter === 'all' || buyer.status === statusFilter;
      const matchesEvent =
        eventFilter === 'all'
          ? false
          : buyer.assignedEvents.some(eventId => {
            const event = events.find(e => e.id === eventId);
            return event?.status === 'active' && event.id === eventFilter;
          });
      const matchesDelivery =
        !showDeliveryFilter || deliveryFilter === 'all'
          ? true
          : deliveryFilter === 'delivered'
          ? buyer.isDelivered === true
          : buyer.isDelivered !== true;

      const matchesPrint =
        !showPrintFilter || printFilter === 'all'
          ? true
          : printFilter === 'printed'
          ? buyer.isPrinted === true
          : buyer.isPrinted !== true;

      return matchesSearch && matchesStatus && matchesEvent && matchesDelivery && matchesPrint;
    });
  }, [buyers, searchTerm, statusFilter, events, eventFilter, sellers, deliveryFilter, showDeliveryFilter, printFilter, showPrintFilter]);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && !(event.target as Element).closest(`.${listStyles.mobileMenuContainer}`)) {
        handleMobileMenuClose();
      }
      if (desktopMenuOpen && !(event.target as Element).closest(`.${listStyles.desktopMenuContainer}`)) {
        setDesktopMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen, desktopMenuOpen]);

  // Check if buyer is from a food_sale event
  const isFoodSaleBuyer = (buyer: Buyer): boolean =>
    buyer.assignedEvents.some(eventId => events.find(e => e.id === eventId)?.type === 'food_sale');

  // Check if buyer is from a raffle event
  const isRaffleBuyer = (buyer: Buyer): boolean =>
    buyer.assignedEvents.some(eventId => events.find(e => e.id === eventId)?.type === 'raffle');

  // Check if buyer should show checkbox based on current filter
  const shouldShowCheckbox = (buyer: Buyer): boolean => {
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

    const firstBuyer = buyers.find(b => b.id === selectedBuyers[0]);
    if (!firstBuyer || firstBuyer.assignedEvents.length === 0) return null;

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

  // Check if all selected buyers are already printed
  const areAllSelectedPrinted = useMemo(() => {
    if (selectedBuyers.length === 0) return false;
    return selectedBuyers.every(id => {
      const buyer = buyers.find(b => b.id === id);
      return buyer?.isPrinted;
    });
  }, [selectedBuyers, buyers]);

  const handleToggleBuyerStatus = (buyerId: string) => {
    setBuyers(prevBuyers =>
      prevBuyers.map(buyer => {
        if (buyer.id === buyerId) {
          return { ...buyer, status: buyer.status === 'active' ? 'inactive' : 'active' };
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
    const selectable = filteredBuyers.filter(buyer =>
      buyer.status === 'active' && shouldShowCheckbox(buyer)
    );

    if (selectedBuyers.length === selectable.length && selectable.length > 0) {
      setSelectedBuyers([]);
    } else {
      setSelectedBuyers(selectable.map(buyer => buyer.id));
    }
  };

  const handlePrintReceipts = (printed: boolean) => {
    setBuyers(prev => prev.map(b =>
      selectedBuyers.includes(b.id) ? { ...b, isPrinted: printed } : b
    ));
    setSelectedBuyers([]);
  };

  const handleSetDeliveredStatus = (status: boolean) => {
    setBuyers(prevBuyers =>
      prevBuyers.map(buyer =>
        selectedBuyers.includes(buyer.id) ? { ...buyer, isDelivered: status } : buyer
      )
    );
    setSelectedBuyers([]);
  };

  // Helper: display event for a buyer given current filter
  const getDisplayEventName = (buyer: Buyer): string => {
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
  };

  // SVG icons
  const IconDotsVertical = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="6" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
  const IconDisable = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconEnable = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconDetail = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="pageContainer">
      <div className={listStyles.stickyHeader}>
        <div className={listStyles.header}>
          <div className={listStyles.titleSection}>
            <h1 className="pageTitle">Lista de compradores</h1>
          </div>
        </div>

        {/* Action Bar */}
        <div className={listStyles.actionBar}>
          <div className={listStyles.leftSection}>
            <div className={listStyles.searchContainer}>
              <svg className={listStyles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                placeholder={isDesktop ? "Buscar por nombre, teléfono, vendedor o evento" : "Buscar por nombre o teléfono"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={listStyles.searchInput}
              />
            </div>

            {/* Desktop: dos filtros en línea */}
            <div className={listStyles.filtersGroupDesktop}>
              <div className={listStyles.statusFilter}>
                <CustomDropdown
                  options={STATUS_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value as StatusFilter)}
                  placeholder="Filtrar por estado"
                />
              </div>
              <div className={listStyles.eventFilter}>
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
              {showDeliveryFilter && (
                <div className={listStyles.eventFilter}>
                  <CustomDropdown
                    options={[
                      { value: 'all', label: 'Toda entrega' },
                      { value: 'delivered', label: 'Entregado' },
                      { value: 'pending', label: 'Por entregar' },
                    ]}
                    value={deliveryFilter}
                    onChange={(value) => setDeliveryFilter(value as 'all' | 'delivered' | 'pending')}
                    placeholder="Filtrar por entrega"
                    alignRight={true}
                  />
                </div>
              )}
              {showPrintFilter && (
                <div className={listStyles.eventFilter}>
                  <CustomDropdown
                    options={[
                      { value: 'all', label: 'Toda impresión' },
                      { value: 'printed', label: 'Impreso' },
                      { value: 'pending', label: 'Sin imprimir' },
                    ]}
                    value={printFilter}
                    onChange={(value) => setPrintFilter(value as 'all' | 'printed' | 'pending')}
                    placeholder="Filtrar por impresión"
                    alignRight={true}
                  />
                </div>
              )}
            </div>

            {/* Mobile: botón Filtros abre sheet */}
            {!isDesktop && (
              <button
                type="button"
                className={listStyles.filtersTriggerMobile}
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

          {/* Dynamic Action Button (Desktop) */}
          {isDesktop && selectedBuyers.length > 0 && selectionType === 'raffle' && (
            <button onClick={() => handlePrintReceipts(!areAllSelectedPrinted)} className="btn btn-sm btn-primary">
              {areAllSelectedPrinted ? 'Desmarcar impreso' : 'Imprimir comprobantes'} ({selectedBuyers.length})
            </button>
          )}
          {isDesktop && selectedBuyers.length > 0 && selectionType === 'food_sale' && (
            <button
              onClick={() => handleSetDeliveredStatus(!areAllSelectedDelivered)}
              className="btn btn-sm btn-primary"
            >
              {areAllSelectedDelivered ? 'Desmarcar' : 'Entregado'} ({selectedBuyers.length})
            </button>
          )}
        </div>
      </div>

      {/* Mobile: sticky bottom bar para acciones */}
      <MobileStickyActionBar
        visible={!isDesktop && selectedBuyers.length > 0}
        onCancel={handleMobileAssignCancel}
      >
        {selectionType === 'raffle' && (
          <button
            type="button"
            className={listStyles.assignStickyPrimary}
            onClick={() => handlePrintReceipts(!areAllSelectedPrinted)}
          >
            {areAllSelectedPrinted ? `Desmarcar impreso (${selectedBuyers.length})` : `Imprimir comprobantes (${selectedBuyers.length})`}
          </button>
        )}
        {selectionType === 'food_sale' && (
          <button
            type="button"
            className={listStyles.assignStickyPrimary}
            onClick={() => handleSetDeliveredStatus(!areAllSelectedDelivered)}
          >
            {areAllSelectedDelivered ? `Desmarcar (${selectedBuyers.length})` : `Entregado (${selectedBuyers.length})`}
          </button>
        )}
      </MobileStickyActionBar>

      {/* Mobile: bottom sheet Filtros */}
      <MobileFilterSheet isOpen={!isDesktop && filtersSheetOpen} onClose={closeFiltersSheet}>
        <div className={listStyles.sheetFilterGroup}>
          <span className={listStyles.sheetFilterLabel}>Estado</span>
          <div className={listStyles.sheetFilterOptions}>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={statusFilter === opt.value ? listStyles.sheetFilterOptionActive : listStyles.sheetFilterOption}
                onClick={() => setStatusFilter(opt.value as StatusFilter)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className={listStyles.sheetFilterGroup}>
          <span className={listStyles.sheetFilterLabel}>Evento</span>
          <div className={listStyles.sheetFilterOptions}>
            {activeEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                className={eventFilter === event.id ? listStyles.sheetFilterOptionActive : listStyles.sheetFilterOption}
                onClick={() => setEventFilter(event.id)}
              >
                {event.name}
              </button>
            ))}
          </div>
        </div>
        {showPrintFilter && (
          <div className={listStyles.sheetFilterGroup}>
            <span className={listStyles.sheetFilterLabel}>Impresión</span>
            <div className={listStyles.sheetFilterOptions}>
              {([
                { value: 'all', label: 'Toda impresión' },
                { value: 'printed', label: 'Impreso' },
                { value: 'pending', label: 'Sin imprimir' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={printFilter === opt.value ? listStyles.sheetFilterOptionActive : listStyles.sheetFilterOption}
                  onClick={() => setPrintFilter(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {showDeliveryFilter && (
          <div className={listStyles.sheetFilterGroup}>
            <span className={listStyles.sheetFilterLabel}>Entrega</span>
            <div className={listStyles.sheetFilterOptions}>
              {([
                { value: 'all', label: 'Toda entrega' },
                { value: 'delivered', label: 'Entregado' },
                { value: 'pending', label: 'Por entregar' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={deliveryFilter === opt.value ? listStyles.sheetFilterOptionActive : listStyles.sheetFilterOption}
                  onClick={() => setDeliveryFilter(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </MobileFilterSheet>

      {/* Desktop Table View */}
      <div className={listStyles.tableContainer}>
        <table className={listStyles.table}>
          <thead>
            <tr>
              <th className={listStyles.checkboxColumn}>
                <div className={listStyles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    checked={
                      filteredBuyers.filter(b => b.status === 'active' && shouldShowCheckbox(b)).length > 0 &&
                      selectedBuyers.length === filteredBuyers.filter(b => b.status === 'active' && shouldShowCheckbox(b)).length
                    }
                    onChange={handleSelectAll}
                    className={listStyles.checkbox}
                    disabled={filteredBuyers.filter(b => b.status === 'active' && shouldShowCheckbox(b)).length === 0}
                    title={filteredBuyers.filter(b => b.status === 'active' && shouldShowCheckbox(b)).length === 0 ? 'No hay compradores de rifas activos para seleccionar' : 'Seleccionar todos los compradores de rifas activos'}
                    aria-label="Seleccionar todos los compradores de rifas"
                  />
                </div>
              </th>
              <th>
                <div className={listStyles.headerWithCounter}>
                  <span>Comprador</span>
                  <span className={listStyles.headerCounter}>{filteredBuyers.length}</span>
                </div>
              </th>
              <th>Evento Asignado</th>
              <th>Vendedor</th>
              <th className={listStyles.actionsColumn}></th>
            </tr>
          </thead>
          <tbody>
            {filteredBuyers.map((buyer) => {
              const showCheckbox = shouldShowCheckbox(buyer);
              return (
                <tr
                  key={buyer.id}
                  className={`${listStyles.tableRow} ${buyer.status === 'inactive' ? listStyles.tableRowInactive : ''}`}
                >
                  <td className={listStyles.checkboxColumn}>
                    {showCheckbox ? (
                      <div className={listStyles.checkboxWrapper}>
                        <input
                          type="checkbox"
                          checked={selectedBuyers.includes(buyer.id)}
                          onChange={() => handleSelectBuyer(buyer.id)}
                          className={listStyles.checkbox}
                          disabled={buyer.status === 'inactive'}
                          aria-label={`Seleccionar ${buyer.firstName} ${buyer.lastName}`}
                        />
                      </div>
                    ) : (
                      <div className={listStyles.checkboxPlaceholder}></div>
                    )}
                  </td>
                  <td>
                    <div className={styles.buyerInfo}>
                      <div
                        className={styles.buyerName}
                        onClick={
                          isFoodSaleBuyer(buyer) ? () => setPurchaseDetailBuyer(buyer) :
                          isRaffleBuyer(buyer) ? () => setRaffleDetailBuyer(buyer) :
                          undefined
                        }
                        style={(isFoodSaleBuyer(buyer) || isRaffleBuyer(buyer)) ? { cursor: 'pointer' } : undefined}
                      >
                        {buyer.firstName} {buyer.lastName}
                        {buyer.isDelivered && (
                          <span className={styles.deliveredPill}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Entregado">
                              <path d="M20 6L9 17L4 12" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                        {buyer.isPrinted && (
                          <span className={styles.printedPill} aria-label="Comprobante impreso">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 9V2H18V9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M6 14H18V22H6V14Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div className={styles.buyerPhone}>{buyer.phone}</div>
                    </div>
                  </td>
                  <td>
                    <div className={listStyles.eventInfo}>
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
                        return displayEvent ? (
                          <div className={listStyles.eventName}>{displayEvent.name}</div>
                        ) : (
                          <div className={listStyles.noEvent}>Sin evento activo</div>
                        );
                      })()}
                    </div>
                  </td>
                  <td>
                    {(() => {
                      const seller = sellers.find(s => s.id === buyer.sellerId);
                      return seller ? (
                        <div className={listStyles.cellTruncate}>{seller.firstName} {seller.lastName}</div>
                      ) : (
                        <div className={listStyles.noEvent}>—</div>
                      );
                    })()}
                  </td>
                  <td className={listStyles.actionsColumn}>
                    <div className={listStyles.desktopMenuContainer}>
                      <button
                        className={listStyles.desktopMenuButton}
                        onClick={() => handleDesktopMenuToggle(buyer.id)}
                        title="Más opciones"
                        aria-label="Menú de opciones"
                        aria-expanded={desktopMenuOpen === buyer.id}
                        aria-haspopup="true"
                      >
                        <IconDotsVertical />
                      </button>
                      {desktopMenuOpen === buyer.id && (
                        <div className={listStyles.desktopMenuDropdown} role="menu">
                          {isFoodSaleBuyer(buyer) && (
                            <button
                              type="button"
                              role="menuitem"
                              className={listStyles.desktopMenuItem}
                              onClick={() => { setPurchaseDetailBuyer(buyer); setDesktopMenuOpen(null); }}
                            >
                              <IconDetail />
                              Detalle
                            </button>
                          )}
                          {isRaffleBuyer(buyer) && (
                            <button
                              type="button"
                              role="menuitem"
                              className={listStyles.desktopMenuItem}
                              onClick={() => { setRaffleDetailBuyer(buyer); setDesktopMenuOpen(null); }}
                            >
                              <IconDetail />
                              Detalle
                            </button>
                          )}
                          <button
                            type="button"
                            role="menuitem"
                            className={listStyles.desktopMenuItem}
                            onClick={() => handleDesktopToggleStatus(buyer.id)}
                          >
                            {buyer.status === 'active' ? <><IconDisable /> Deshabilitar</> : <><IconEnable /> Habilitar</>}
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

      {/* Mobile List View */}
      {!isDesktop && (
        <div
          className={`${listStyles.mobileListContainer} ${selectedBuyers.length > 0 ? listStyles.hasStickyBar : ''}`}
          role="list"
        >
          {filteredBuyers.map((buyer) => (
            <MobileListRow
              key={buyer.id}
              id={buyer.id}
              isInactive={buyer.status === 'inactive'}
              isSelected={selectedBuyers.includes(buyer.id)}
              checkboxSlot={
                shouldShowCheckbox(buyer) ? (
                  <input
                    type="checkbox"
                    id={`buyer-${buyer.id}`}
                    checked={selectedBuyers.includes(buyer.id)}
                    onChange={() => handleSelectBuyer(buyer.id)}
                    disabled={buyer.status === 'inactive'}
                    className={listStyles.mobileCheckbox}
                    aria-label={`Seleccionar ${buyer.firstName} ${buyer.lastName}`}
                  />
                ) : (
                  <div className={listStyles.checkboxPlaceholder}></div>
                )
              }
              name={
                <span
                  onClick={
                    isFoodSaleBuyer(buyer) ? () => setPurchaseDetailBuyer(buyer) :
                    isRaffleBuyer(buyer) ? () => setRaffleDetailBuyer(buyer) :
                    undefined
                  }
                  style={(isFoodSaleBuyer(buyer) || isRaffleBuyer(buyer)) ? { cursor: 'pointer' } : undefined}
                >
                  {buyer.firstName} {buyer.lastName}
                  {buyer.isDelivered && (
                    <span className={styles.deliveredPill}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Entregado">
                        <path d="M20 6L9 17L4 12" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                  {buyer.isPrinted && (
                    <span className={styles.printedPill} aria-label="Comprobante impreso">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9V2H18V9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 14H18V22H6V14Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </span>
              }
              phone={buyer.phone}
              eventLine={getDisplayEventName(buyer)}
              sellerLine={(() => { const s = sellers.find(s => s.id === buyer.sellerId); return s ? `${s.firstName} ${s.lastName}` : undefined; })()}
              menuSlot={
                <div className={listStyles.mobileMenuContainer}>
                  <button
                    type="button"
                    className={listStyles.mobileMenuButton}
                    onClick={() => handleMobileMenuToggle(buyer.id)}
                    title="Más opciones"
                    aria-label="Menú de opciones"
                    aria-expanded={mobileMenuOpen === buyer.id}
                    aria-haspopup="true"
                  >
                    <IconDotsVertical />
                  </button>
                  {mobileMenuOpen === buyer.id && (
                    <div className={listStyles.mobileMenuDropdown} role="menu">
                      {isFoodSaleBuyer(buyer) && (
                        <button
                          type="button"
                          role="menuitem"
                          className={listStyles.mobileMenuItem}
                          onClick={() => { setPurchaseDetailBuyer(buyer); handleMobileMenuClose(); }}
                        >
                          <IconDetail />
                          Detalle
                        </button>
                      )}
                      {isRaffleBuyer(buyer) && (
                        <button
                          type="button"
                          role="menuitem"
                          className={listStyles.mobileMenuItem}
                          onClick={() => { setRaffleDetailBuyer(buyer); handleMobileMenuClose(); }}
                        >
                          <IconDetail />
                          Detalle
                        </button>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        className={listStyles.mobileMenuItem}
                        onClick={() => handleMobileToggleStatus(buyer.id)}
                      >
                        {buyer.status === 'active' ? <><IconDisable /> Deshabilitar</> : <><IconEnable /> Habilitar</>}
                      </button>
                    </div>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}

      {filteredBuyers.length === 0 && (
        <EmptyState
          icon={
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.6977C21.7033 16.0413 20.9999 15.5767 20.2 15.3778" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 3.37781C16.7999 3.57668 17.5033 4.04129 18.0094 4.6977C18.5155 5.35411 18.8 6.16449 18.8 7C18.8 7.83551 18.5155 8.64589 18.0094 9.3023C17.5033 9.95871 16.7999 10.4233 16 10.6222" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          title="No se encontraron compradores"
          description="Intenta ajustar los filtros de búsqueda"
        />
      )}

      {/* Modal Detalle de compra — desktop */}
      {isDesktop && purchaseDetailBuyer && (() => {
        const seller = sellers.find(s => s.id === purchaseDetailBuyer.sellerId);
        const total = (purchaseDetailBuyer.foodPurchase ?? []).reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
        return (
          <div className={styles.modalOverlay} onClick={() => setPurchaseDetailBuyer(null)}>
            <div className={styles.purchaseDetailModal} onClick={(e) => e.stopPropagation()}>

              {/* Header: nombre + meta */}
              <div className={styles.purchaseDetailHeader}>
                <div>
                  <h2 className={styles.purchaseDetailTitle}>
                    {purchaseDetailBuyer.firstName} {purchaseDetailBuyer.lastName}
                  </h2>
                  <div className={styles.detailBuyerMeta}>
                    <span>{purchaseDetailBuyer.phone}</span>
                    {seller && (
                      <>
                        <span className={styles.detailMetaDot}>·</span>
                        <span>{seller.firstName} {seller.lastName}</span>
                      </>
                    )}
                  </div>
                </div>
                <button className={styles.closeButton} onClick={() => setPurchaseDetailBuyer(null)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Estado */}
              <div className={styles.detailStatusRow}>
                <span className={`${styles.detailStatusBadge} ${purchaseDetailBuyer.isDelivered ? styles.detailStatusDelivered : styles.detailStatusPending}`}>
                  <span className={styles.detailStatusDot} />
                  {purchaseDetailBuyer.isDelivered ? 'Entregado' : 'Por entregar'}
                </span>
              </div>

              <div className={styles.detailDivider} />

              {/* Items */}
              <div className={styles.detailItemList}>
                {(purchaseDetailBuyer.foodPurchase ?? []).map((item, idx) => (
                  <div key={idx} className={styles.detailItemRow}>
                    <span className={styles.detailItemName}>{item.dishName}</span>
                    <span className={styles.detailItemQty}>×{item.quantity}</span>
                    <span className={styles.detailItemSubtotal}>${(item.quantity * item.unitPrice).toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>

              <div className={styles.detailDivider} />

              {/* Total */}
              <div className={styles.detailTotalRow}>
                <span className={styles.detailTotalLabel}>Total</span>
                <span className={styles.detailTotalValue}>${total.toLocaleString('es-AR')}</span>
              </div>

              {/* Acción */}
              <div className={styles.purchaseDetailFooter}>
                <button
                  className="btn btn-primary"
                  onClick={() => { setBuyers(prev => prev.map(b => b.id === purchaseDetailBuyer.id ? { ...b, isDelivered: !b.isDelivered } : b)); setPurchaseDetailBuyer(null); deliverySnackbar.showSnackbar(); }}
                >
                  {purchaseDetailBuyer.isDelivered ? 'Desmarcar entregado' : 'Marcar como entregado'}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Bottom Sheet Detalle de compra — mobile */}
      {(() => {
        const seller = sellers.find(s => s.id === purchaseDetailBuyer?.sellerId);
        const total = (purchaseDetailBuyer?.foodPurchase ?? []).reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
        const sp = 'var(--space-lg)';
        return (
          <BottomSheet
            isOpen={!isDesktop && !!purchaseDetailBuyer}
            onClose={() => setPurchaseDetailBuyer(null)}
            label="Detalle de compra"
            title={purchaseDetailBuyer ? `${purchaseDetailBuyer.firstName} ${purchaseDetailBuyer.lastName}` : ''}
            subtitle={[purchaseDetailBuyer?.phone, seller ? `${seller.firstName} ${seller.lastName}` : null].filter(Boolean).join(' · ')}
            showCloseButton
            footer={
              <button
                className="btn btn-primary btn-full"
                onClick={() => { setBuyers(prev => prev.map(b => b.id === purchaseDetailBuyer!.id ? { ...b, isDelivered: !b.isDelivered } : b)); setPurchaseDetailBuyer(null); deliverySnackbar.showSnackbar(); }}
              >
                {purchaseDetailBuyer?.isDelivered ? 'Desmarcar entregado' : 'Marcar como entregado'}
              </button>
            }
          >
            {/* Estado */}
            <div style={{ paddingBottom: 'var(--space-md)' }}>
              <span className={`${styles.detailStatusBadge} ${purchaseDetailBuyer?.isDelivered ? styles.detailStatusDelivered : styles.detailStatusPending}`}>
                <span className={styles.detailStatusDot} />
                {purchaseDetailBuyer?.isDelivered ? 'Entregado' : 'Por entregar'}
              </span>
            </div>

            <div className={styles.detailDivider} style={{ margin: `0 calc(-1 * ${sp})` }} />

            {/* Items */}
            <div style={{ padding: '4px 0 8px' }}>
              {(purchaseDetailBuyer?.foodPurchase ?? []).map((item, idx) => (
                <div key={idx} className={styles.detailItemRow}>
                  <span className={styles.detailItemName}>{item.dishName}</span>
                  <span className={styles.detailItemQty}>×{item.quantity}</span>
                  <span className={styles.detailItemSubtotal}>${(item.quantity * item.unitPrice).toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>

            <div className={styles.detailDivider} style={{ margin: `0 calc(-1 * ${sp})` }} />

            {/* Total */}
            <div className={styles.detailTotalRow} style={{ padding: 'var(--space-md) 0 0' }}>
              <span className={styles.detailTotalLabel}>Total</span>
              <span className={styles.detailTotalValue}>${total.toLocaleString('es-AR')}</span>
            </div>
          </BottomSheet>
        );
      })()}
      {/* Modal Detalle de números — rifa (desktop) */}
      {isDesktop && raffleDetailBuyer && (
        <div className={styles.modalOverlay} onClick={() => setRaffleDetailBuyer(null)}>
          <div className={styles.purchaseDetailModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.purchaseDetailHeader}>
              <div>
                <h2 className={styles.purchaseDetailTitle}>Números asignados</h2>
                <p className={styles.purchaseDetailBuyerName}>{raffleDetailBuyer.firstName} {raffleDetailBuyer.lastName}</p>
              </div>
              <button className={styles.closeButton} onClick={() => setRaffleDetailBuyer(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div className={styles.purchaseDetailContent}>
              <p className={styles.raffleNumbersCount}>{raffleDetailBuyer.assignedNumbers?.length ?? 0} número{(raffleDetailBuyer.assignedNumbers?.length ?? 0) !== 1 ? 's' : ''} · Vendedor: {raffleDetailBuyer.sellerName}</p>
              <div className={styles.raffleNumbersGrid}>{(raffleDetailBuyer.assignedNumbers ?? []).map((num) => <span key={num} className={styles.raffleNumberChip}>{num}</span>)}</div>
            </div>
            <div className={styles.purchaseDetailFooter}>
              <button className="btn btn-primary" onClick={() => { setBuyers(prev => prev.map(b => b.id === raffleDetailBuyer.id ? { ...b, isPrinted: !raffleDetailBuyer.isPrinted } : b)); setRaffleDetailBuyer(null); raffleSnackbar.showSnackbar(); }}>
                {raffleDetailBuyer.isPrinted ? 'Desmarcar impreso' : 'Imprimir comprobante'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet Detalle de números — rifa (mobile) */}
      <BottomSheet
        isOpen={!isDesktop && !!raffleDetailBuyer}
        onClose={() => setRaffleDetailBuyer(null)}
        label="Números asignados"
        title="Números asignados"
        subtitle={raffleDetailBuyer ? `${raffleDetailBuyer.firstName} ${raffleDetailBuyer.lastName}` : ''}
        showCloseButton
        footer={
          <button className="btn btn-primary btn-full" onClick={() => { setBuyers(prev => prev.map(b => b.id === raffleDetailBuyer!.id ? { ...b, isPrinted: !raffleDetailBuyer!.isPrinted } : b)); setRaffleDetailBuyer(null); raffleSnackbar.showSnackbar(); }}>
            {raffleDetailBuyer?.isPrinted ? 'Desmarcar impreso' : 'Imprimir comprobante'}
          </button>
        }
      >
        <p className={styles.raffleNumbersCount}>{raffleDetailBuyer?.assignedNumbers?.length ?? 0} número{(raffleDetailBuyer?.assignedNumbers?.length ?? 0) !== 1 ? 's' : ''} · Vendedor: {raffleDetailBuyer?.sellerName}</p>
        <div className={styles.raffleNumbersGrid}>{(raffleDetailBuyer?.assignedNumbers ?? []).map((num) => <span key={num} className={styles.raffleNumberChip}>{num}</span>)}</div>
      </BottomSheet>

      {/* Snackbar de rifa */}
      {raffleSnackbar.isVisible && (
        <div className={`${styles.snackbar} ${raffleSnackbar.isClosing ? styles.snackbarClosing : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Comprobante enviado a imprimir
        </div>
      )}

      {/* Snackbar de entrega */}
      {deliverySnackbar.isVisible && (
        <div className={`${styles.snackbar} ${deliverySnackbar.isClosing ? styles.snackbarClosing : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Estado de entrega actualizado
        </div>
      )}
    </div>
  );
}
