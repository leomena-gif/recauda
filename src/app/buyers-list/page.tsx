'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Buyer, Event, StatusFilter } from '@/types/models';
import { STATUS_OPTIONS } from '@/constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import CustomDropdown from '@/components/CustomDropdown';
import { listCampaigns, type CampaignWithStats } from '@/actions/campaigns';
import { listSalesByCampaign, markCollected, type SaleWithBuyer } from '@/actions/sales';
import styles from './BuyersList.module.css';

type BuyerWithItemIds = Buyer & { item_ids: string[] };

function saleToBuyer(sale: SaleWithBuyer, campaignId: string): BuyerWithItemIds {
  const parts = (sale.buyer_name ?? '').split(' ');
  return {
    id: sale.id,
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' ') || '',
    sellerId: sale.seller_id ?? '',
    sellerName: sale.seller_name ?? '',
    phone: sale.buyer_phone ?? '',
    email: sale.buyer_email ?? '',
    status: 'active',
    eventsAssigned: 1,
    assignedEvents: [campaignId],
    totalBought: sale.item_labels.length,
    lastActivity: sale.created_at,
    isDelivered: sale.is_collected,
    item_ids: sale.item_ids,
  };
}

function campaignToEvent(c: CampaignWithStats): Event {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    status: c.status === 'cancelled' ? 'inactive' : (c.status as Event['status']),
    endDate: c.end_date ?? '',
    totalNumbers: c.total_numbers ?? 0,
    soldNumbers: c.sold_numbers,
  };
}

export default function BuyersList() {
  const [buyers, setBuyers] = useState<BuyerWithItemIds[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSales, setLoadingSales] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [eventFilter, setEventFilter] = useState<string>('');
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState<string | null>(null);
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);

  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Load campaigns once on mount
  useEffect(() => {
    listCampaigns().then(result => {
      if (result.data) {
        const evts = result.data.map(campaignToEvent);
        setEvents(evts);
        const firstActive = evts.find(e => e.status === 'active');
        if (firstActive) setEventFilter(firstActive.id);
      }
      setLoading(false);
    });
  }, []);

  // Load sales when event filter changes
  const loadSales = useCallback((campaignId: string) => {
    if (!campaignId) return;
    setLoadingSales(true);
    listSalesByCampaign(campaignId).then(result => {
      if (result.data) {
        setBuyers(result.data.map(sale => saleToBuyer(sale, campaignId)));
      }
      setLoadingSales(false);
    });
  }, []);

  useEffect(() => {
    if (eventFilter) loadSales(eventFilter);
  }, [eventFilter, loadSales]);

  const activeEvents = useMemo(
    () => events.filter(event => event.status === 'active'),
    [events]
  );

  const filteredBuyers = useMemo(() => {
    return buyers.filter(buyer => {
      const matchesSearch =
        buyer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.phone.includes(searchTerm) ||
        buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.sellerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || buyer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [buyers, searchTerm, statusFilter]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && !(event.target as Element).closest(`.${styles.mobileMenuContainer}`)) {
        setMobileMenuOpen(null);
      }
      if (desktopMenuOpen && !(event.target as Element).closest(`.${styles.desktopMenuContainer}`)) {
        setDesktopMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen, desktopMenuOpen]);

  const shouldShowCheckbox = (): boolean => {
    const event = events.find(e => e.id === eventFilter);
    return !!event && event.status === 'active';
  };

  const selectionType = useMemo(() => {
    const event = events.find(e => e.id === eventFilter);
    return event?.type ?? null;
  }, [events, eventFilter]);

  const areAllSelectedDelivered = useMemo(() => {
    if (selectedBuyers.length === 0) return false;
    return selectedBuyers.every(id => buyers.find(b => b.id === id)?.isDelivered);
  }, [selectedBuyers, buyers]);

  const handleDesktopMenuToggle = (buyerId: string) => {
    setDesktopMenuOpen(desktopMenuOpen === buyerId ? null : buyerId);
  };

  const handleMobileMenuToggle = (buyerId: string) => {
    setMobileMenuOpen(mobileMenuOpen === buyerId ? null : buyerId);
  };

  const openFiltersSheet = () => setFiltersSheetOpen(true);
  const closeFiltersSheet = () => setFiltersSheetOpen(false);

  const handleSelectBuyer = (buyerId: string) => {
    setSelectedBuyers(prev =>
      prev.includes(buyerId) ? prev.filter(id => id !== buyerId) : [...prev, buyerId]
    );
  };

  const handleSelectAll = () => {
    const selectable = filteredBuyers.filter(b => b.status === 'active' && shouldShowCheckbox());
    if (selectedBuyers.length === selectable.length && selectable.length > 0) {
      setSelectedBuyers([]);
    } else {
      setSelectedBuyers(selectable.map(b => b.id));
    }
  };

  const handlePrintReceipts = () => {
    console.log('Imprimir comprobantes para:', selectedBuyers);
    alert(`Imprimiendo ${selectedBuyers.length} comprobantes`);
  };

  const handleSetDeliveredStatus = async (status: boolean) => {
    if (status) {
      const itemIds = selectedBuyers.flatMap(id => buyers.find(b => b.id === id)?.item_ids ?? []);
      if (itemIds.length > 0) {
        await markCollected(itemIds);
      }
      // Refresh sales list
      if (eventFilter) loadSales(eventFilter);
    }
    setSelectedBuyers([]);
  };

  if (loading) {
    return (
      <div className="pageContainer">
        <div className={styles.stickyHeader}>
          <div className={styles.header}>
            <h1 className="pageTitle">Lista de Compradores</h1>
          </div>
        </div>
        <div className={styles.emptyState}>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

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
                  options={activeEvents.map(event => ({ value: event.id, label: event.name }))}
                  value={eventFilter}
                  onChange={(value) => { setEventFilter(value); setSelectedBuyers([]); }}
                  placeholder="Filtrar por evento"
                  alignRight={true}
                />
              </div>
            </div>

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

          {isDesktop && selectedBuyers.length > 0 && selectionType === 'raffle' && (
            <button onClick={handlePrintReceipts} className="btn btn-primary" style={{ gap: '8px' }}>
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

      {/* Mobile sticky bar */}
      {!isDesktop && selectedBuyers.length > 0 && (
        <div className={styles.assignStickyBar}>
          <button type="button" className={styles.assignStickyCancel} onClick={() => setSelectedBuyers([])}>
            Cancelar
          </button>
          {selectionType === 'raffle' && (
            <button type="button" className={styles.assignStickyPrimary} onClick={handlePrintReceipts}>
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

      {/* Mobile filters sheet */}
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
                    onClick={() => { setEventFilter(event.id); setSelectedBuyers([]); }}
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

      {/* Desktop Table */}
      <div className={styles.tableContainer}>
        {loadingSales ? (
          <div className={styles.emptyState}><p>Cargando compradores...</p></div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxColumn}>
                  <div className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      checked={
                        filteredBuyers.filter(b => b.status === 'active' && shouldShowCheckbox()).length > 0 &&
                        selectedBuyers.length === filteredBuyers.filter(b => b.status === 'active' && shouldShowCheckbox()).length
                      }
                      onChange={handleSelectAll}
                      className={styles.checkbox}
                      disabled={filteredBuyers.filter(b => shouldShowCheckbox()).length === 0}
                      aria-label="Seleccionar todos"
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
                const showCheckbox = shouldShowCheckbox();
                const displayEvent = events.find(e => e.id === eventFilter);
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
                        {displayEvent ? (
                          <div className={styles.eventName}>{displayEvent.name}</div>
                        ) : (
                          <div className={styles.noEvent}>Sin evento activo</div>
                        )}
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
                          <div className={styles.desktopMenuDropdown} role="menu">
                            <button
                              type="button"
                              role="menuitem"
                              className={styles.desktopMenuItem}
                              onClick={() => {
                                handleSetDeliveredStatus(!buyer.isDelivered);
                                setDesktopMenuOpen(null);
                              }}
                            >
                              {buyer.isDelivered ? (
                                <>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  Desmarcar
                                </>
                              ) : (
                                <>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  Marcar entregado
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
        )}
      </div>

      {/* Mobile List */}
      {!isDesktop && !loadingSales && (
        <div
          className={`${styles.mobileListContainer} ${selectedBuyers.length > 0 ? styles.hasStickyBar : ''}`}
          role="list"
        >
          {filteredBuyers.map((buyer) => {
            const displayEvent = events.find(e => e.id === eventFilter);
            return (
              <article
                key={buyer.id}
                role="listitem"
                className={`${styles.mobileListRow} ${buyer.status === 'inactive' ? styles.mobileRowInactive : ''} ${selectedBuyers.includes(buyer.id) ? styles.mobileRowSelected : ''}`}
              >
                <div className={styles.mobileRowCheckbox}>
                  {shouldShowCheckbox() ? (
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
                            onClick={() => {
                              setSelectedBuyers([buyer.id]);
                              handleSetDeliveredStatus(!buyer.isDelivered);
                              setMobileMenuOpen(null);
                            }}
                          >
                            {buyer.isDelivered ? (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Desmarcar
                              </>
                            ) : (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Marcar entregado
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className={styles.mobileRowPhone}>{buyer.phone}</p>
                  <p className={styles.mobileRowEventLine}>
                    {displayEvent ? displayEvent.name : 'Sin evento activo'}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {filteredBuyers.length === 0 && !loadingSales && (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.6977C21.7033 16.0413 20.9999 15.5767 20.2 15.3778" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 3.37781C16.7999 3.57668 17.5033 4.04129 18.0094 4.6977C18.5155 5.35411 18.8 6.16449 18.8 7C18.8 7.83551 18.5155 8.64589 18.0094 9.3023C17.5033 9.95871 16.7999 10.4233 16 10.6222" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3>No se encontraron compradores</h3>
          <p>{eventFilter ? 'Aún no hay ventas registradas para este evento' : 'Seleccioná un evento para ver los compradores'}</p>
        </div>
      )}
    </div>
  );
}
