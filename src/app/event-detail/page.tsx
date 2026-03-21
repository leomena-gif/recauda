'use client';

import React, { useState, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './EventDetail.module.css';
import AssignNumbersModal from './AssignNumbersModal';
import BottomSheet from '@/components/BottomSheet';
import { MOCK_BUYERS, MOCK_EVENTS, MOCK_SELLERS, MOCK_HOME_EVENTS } from '@/mocks/data';
import { Buyer } from '@/types/models';
import { SNACKBAR_DURATION } from '@/constants';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileListRow from '@/components/MobileListRow';
import MobileStickyActionBar from '@/components/MobileStickyActionBar';
import EmptyState from '@/components/EmptyState';
import TabBar from '@/components/TabBar';
import RegisterSaleWizard from '@/components/wizard/RegisterSaleWizard';
import EventDataStep, { EventDataStepRef } from '@/components/wizard/EventDataStep';
import listStyles from '@/styles/list.module.css';
import buyerStyles from './BuyerDetail.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type TopTab = 'vendedores' | 'compradores' | 'configuracion';
type VendorTab = 'collected' | 'pending';
type BuyerTab = 'tab1' | 'tab2';

// ─── Mock Event Data ──────────────────────────────────────────────────────────
const EVENT_DETAIL = {
  id: '1',
  name: 'Rifa día del niño del Grupo Scout General Deheza',
  status: 'active' as const,
  endDate: '2026-04-15',
  totalNumbers: 800,
  soldNumbers: 640,
  ticketPrice: 1000,
  prizeDescription: 'Auto 0km Toyota Etios',
  goal: 800000,
  collected: 640000,
};

// ─── Mock Vendor Data (Vendedores Tab) ────────────────────────────────────────
const INITIAL_COLLECTED = [
  { id: 101, name: 'Jacob Jones', sold: 10, total: 10, amount: 8000, percentage: 100 },
  { id: 102, name: 'Jerome Bell', sold: 10, total: 10, amount: 8000, percentage: 100 },
  { id: 103, name: 'Ronald Richards', sold: 10, total: 10, amount: 8000, percentage: 100 },
  { id: 104, name: 'Savannah Nguyen', sold: 10, total: 10, amount: 8000, percentage: 100 },
  { id: 105, name: 'Cameron Williamson', sold: 10, total: 10, amount: 8000, percentage: 100 },
  { id: 106, name: 'Robert Fox', sold: 10, total: 10, amount: 8000, percentage: 100 },
  { id: 107, name: 'Darrell Steward', sold: 10, total: 10, amount: 8000, percentage: 100 },
];

const INITIAL_PENDING = [
  { id: 1, name: 'Nombre Apellido', sold: 5, total: 10, amount: 5000, percentage: 50 },
  { id: 2, name: 'Nombre Apellido', sold: 3, total: 10, amount: 3000, percentage: 30 },
  { id: 3, name: 'Nombre Apellido', sold: 6, total: 10, amount: 6000, percentage: 60 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}


// ─── Main Component ───────────────────────────────────────────────────────────
export default function EventDetail() {
  return (
    <Suspense>
      <EventDetailContent />
    </Suspense>
  );
}

function EventDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams?.get('id') ?? EVENT_DETAIL.id;

  // ── Event data dinámico basado en eventId ─────────────────────────────────
  const eventData = useMemo(() => {
    const base = MOCK_EVENTS.find(e => e.id === eventId);
    const home = MOCK_HOME_EVENTS.find(e => e.id === eventId);
    return {
      id: eventId,
      name: home?.name ?? base?.name ?? EVENT_DETAIL.name,
      status: (base?.status ?? EVENT_DETAIL.status) as 'active',
      endDate: base?.endDate ?? EVENT_DETAIL.endDate,
      totalNumbers: base?.totalNumbers ?? EVENT_DETAIL.totalNumbers,
      soldNumbers: base?.soldNumbers ?? EVENT_DETAIL.soldNumbers,
      ticketPrice: home?.ticketPrice ?? EVENT_DETAIL.ticketPrice,
      prizeDescription: EVENT_DETAIL.prizeDescription,
      goal: home?.goal ?? EVENT_DETAIL.goal,
      collected: home?.collected ?? EVENT_DETAIL.collected,
      prizes: base?.prizes ?? [],
      dishes: home?.dishes ?? base?.dishes ?? [],
    };
  }, [eventId]);

  // Top-level tab
  const [activeTopTab, setActiveTopTab] = useState<TopTab>('vendedores');

  // Vendors tab state
  const [activeVendorTab, setActiveVendorTab] = useState<VendorTab>('collected');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [selectedCollectedVendors, setSelectedCollectedVendors] = useState<number[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [collectedData, setCollectedData] = useState(INITIAL_COLLECTED);
  const [pendingData, setPendingData] = useState(INITIAL_PENDING);

  // Edit event state
  const [isConfigEditing, setIsConfigEditing] = useState(false);
  const eventDataStepRef = useRef<EventDataStepRef>(null);

  // Closed dishes (food_sale events)
  const [closedDishIndices, setClosedDishIndices] = useState<Set<number>>(new Set());

  const handleDishCloseToggle = (index: number, closed: boolean) => {
    setClosedDishIndices(prev => {
      const next = new Set(prev);
      closed ? next.add(index) : next.delete(index);
      return next;
    });
  };

  // Close event confirmation
  const [isCloseEventOpen, setIsCloseEventOpen] = useState(false);

  // Register sale wizard
  const [isSaleWizardOpen, setIsSaleWizardOpen] = useState(false);

  // ── Buyers tab state ──────────────────────────────────────────────────────
  const [buyers, setBuyers] = useState<Buyer[]>(MOCK_BUYERS);
  const [buyerSearchTerm, setBuyerSearchTerm] = useState('');
  const [activeBuyerTab, setActiveBuyerTab] = useState<BuyerTab>('tab1');
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([]);
  const [buyerMobileMenuOpen, setBuyerMobileMenuOpen] = useState<string | null>(null);
  const [buyerDesktopMenuOpen, setBuyerDesktopMenuOpen] = useState<string | null>(null);
  const [purchaseDetailBuyer, setPurchaseDetailBuyer] = useState<Buyer | null>(null);
  const [raffleDetailBuyer, setRaffleDetailBuyer] = useState<Buyer | null>(null);

  // ── Computed ─────────────────────────────────────────────────────────────
  const daysRemaining = getDaysRemaining(eventData.endDate);

  // ── Buyers computed ───────────────────────────────────────────────────────
  const eventType = useMemo(
    () => MOCK_EVENTS.find(e => e.id === eventId)?.type ?? 'raffle',
    [eventId]
  );
  const eventBuyers = useMemo(
    () => buyers.filter(b => b.assignedEvents.includes(eventId)),
    [buyers, eventId]
  );

  const foodSaleTotal = useMemo(
    () => eventBuyers.reduce((sum, b) => sum + (b.foodPurchase ?? []).reduce((s, i) => s + i.quantity * i.unitPrice, 0), 0),
    [eventBuyers]
  );

  const foodSaleGoal = useMemo(() => {
    const home = MOCK_HOME_EVENTS.find(e => e.id === eventId);
    return home?.dishes?.reduce((s, d) => s + (d.total ?? 0) * d.price, 0) ?? 0;
  }, [eventId]);

  const percentage = eventType === 'food_sale' && foodSaleGoal > 0
    ? Math.round((foodSaleTotal / foodSaleGoal) * 100)
    : Math.round((eventData.soldNumbers / (eventData.totalNumbers || 1)) * 100);

  const filteredBuyers = useMemo(() => {
    return eventBuyers.filter(buyer => {
      const matchesSearch =
        buyer.firstName.toLowerCase().includes(buyerSearchTerm.toLowerCase()) ||
        buyer.lastName.toLowerCase().includes(buyerSearchTerm.toLowerCase()) ||
        buyer.phone.includes(buyerSearchTerm) ||
        buyer.email.toLowerCase().includes(buyerSearchTerm.toLowerCase()) ||
        (() => {
          const seller = MOCK_SELLERS.find(s => s.id === buyer.sellerId);
          return seller && (
            seller.firstName.toLowerCase().includes(buyerSearchTerm.toLowerCase()) ||
            seller.lastName.toLowerCase().includes(buyerSearchTerm.toLowerCase())
          );
        })();
      const matchesTab = eventType === 'food_sale'
        ? activeBuyerTab === 'tab1' ? buyer.isDelivered === true : buyer.isDelivered !== true
        : activeBuyerTab === 'tab1' ? buyer.isPrinted === true : buyer.isPrinted !== true;
      return matchesSearch && matchesTab;
    });
  }, [eventBuyers, buyerSearchTerm, activeBuyerTab, eventType]);

  const selectionType = useMemo(() => {
    if (selectedBuyers.length === 0) return null;
    return eventType;
  }, [selectedBuyers, eventType]);

  const areAllSelectedDelivered = useMemo(
    () => selectedBuyers.length > 0 && selectedBuyers.every(id => buyers.find(b => b.id === id)?.isDelivered),
    [selectedBuyers, buyers]
  );

  const areAllSelectedPrinted = useMemo(
    () => selectedBuyers.length > 0 && selectedBuyers.every(id => buyers.find(b => b.id === id)?.isPrinted),
    [selectedBuyers, buyers]
  );

  // ── Business rules ────────────────────────────────────────────────────────
  const prizesLocked = eventType === 'raffle' && eventData.soldNumbers > 0;

  const eventsForWizard = useMemo(() => MOCK_HOME_EVENTS.map(e => {
    if (e.id !== eventId || closedDishIndices.size === 0) return e;
    return { ...e, dishes: e.dishes?.filter((_, i) => !closedDishIndices.has(i)) };
  }), [eventId, closedDishIndices]);

  const currentVendorData = activeVendorTab === 'collected' ? collectedData : pendingData;
  const filteredVendorData = currentVendorData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSold = filteredVendorData.reduce((s, i) => s + i.sold, 0);
  const totalNumbers = filteredVendorData.reduce((s, i) => s + i.total, 0);
  const totalAmount = filteredVendorData.reduce((s, i) => s + i.amount, 0);
  const totalPercentage = totalNumbers > 0 ? Math.round((totalSold / totalNumbers) * 100) : 0;

  // ── Status ───────────────────────────────────────────────────────────────
  const statusLabel =
    daysRemaining <= 0 ? 'FINALIZADO' :
    daysRemaining === 1 ? 'ACTIVO — Finaliza mañana' :
    daysRemaining <= 5 ? `ACTIVO — ${daysRemaining} días restantes` :
    `ACTIVO — ${daysRemaining} días restantes`;

  const statusBadgeClass =
    daysRemaining <= 0 ? styles.statusBadgeCompleted :
    daysRemaining <= 5 ? styles.statusBadgeWarning :
    styles.statusBadgeActive;

  // ── Vendor actions ───────────────────────────────────────────────────────
  const handleMarkAsPaid = () => {
    if (!selectedVendors.length) return;
    const toMove = pendingData.filter(v => selectedVendors.includes(v.id));
    setCollectedData(p => [...p, ...toMove]);
    setPendingData(p => p.filter(v => !selectedVendors.includes(v.id)));
    setSelectedVendors([]);
  };

  const handleAssignMoreNumbers = () => {
    if (selectedCollectedVendors.length > 0) setIsAssignModalOpen(true);
  };

  const handleModalConfirm = (data: { quantity: number; autoAssign: boolean; fromNumber: string; toNumber: string }) => {
    const toMove = collectedData.filter(v => selectedCollectedVendors.includes(v.id));
    const updated = toMove.map(v => ({
      ...v, total: v.total + data.quantity, sold: 0, amount: 0, percentage: 0,
    }));
    setCollectedData(p => p.filter(v => !selectedCollectedVendors.includes(v.id)));
    setPendingData(p => [...p, ...updated]);
    setIsAssignModalOpen(false);
    setSelectedCollectedVendors([]);
    setActiveVendorTab('pending');
  };

  const toggleVendorSelect = (id: number, tab: VendorTab) => {
    if (tab === 'pending') {
      setSelectedVendors(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    } else {
      setSelectedCollectedVendors(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    }
  };

  // ── Buyer hooks & side effects ────────────────────────────────────────────
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const deliverySnackbar = useSnackbar(SNACKBAR_DURATION.SUCCESS);
  const raffleSnackbar = useSnackbar(SNACKBAR_DURATION.SUCCESS);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buyerMobileMenuOpen && !(event.target as Element).closest(`.${listStyles.mobileMenuContainer}`)) {
        setBuyerMobileMenuOpen(null);
      }
      if (buyerDesktopMenuOpen && !(event.target as Element).closest(`.${listStyles.desktopMenuContainer}`)) {
        setBuyerDesktopMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [buyerMobileMenuOpen, buyerDesktopMenuOpen]);

  // ── Buyer handlers ────────────────────────────────────────────────────────
  const handleToggleBuyerStatus = (buyerId: string) => {
    setBuyers(prev => prev.map(b =>
      b.id === buyerId ? { ...b, status: b.status === 'active' ? 'inactive' : 'active' } : b
    ));
  };

  const handleSelectBuyer = (buyerId: string) => {
    setSelectedBuyers(prev =>
      prev.includes(buyerId) ? prev.filter(id => id !== buyerId) : [...prev, buyerId]
    );
  };

  const handleSelectAllBuyers = () => {
    const selectable = filteredBuyers.filter(b => b.status === 'active');
    if (selectedBuyers.length === selectable.length && selectable.length > 0) {
      setSelectedBuyers([]);
    } else {
      setSelectedBuyers(selectable.map(b => b.id));
    }
  };

  const handlePrintReceipts = (printed: boolean) => {
    setBuyers(prev => prev.map(b =>
      selectedBuyers.includes(b.id) ? { ...b, isPrinted: printed } : b
    ));
    setSelectedBuyers([]);
    raffleSnackbar.showSnackbar();
  };

  const handleSetDeliveredStatus = (status: boolean) => {
    setBuyers(prev => prev.map(b =>
      selectedBuyers.includes(b.id) ? { ...b, isDelivered: status } : b
    ));
    setSelectedBuyers([]);
    deliverySnackbar.showSnackbar();
  };

  // SVG icons for buyer context menus
  const IconDotsVertical = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="6" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
  const IconDisable = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconEnable = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconDetail = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className={`pageContainer ${styles.eventDetailContainer}`}>
        <div className={`contentContainer ${styles.eventDetailContent}`}>

          {/* Page Header */}
          <div className={styles.pageHeader}>
            <button className={styles.breadcrumb} onClick={() => router.push('/')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Mis eventos
            </button>
            <div className={styles.titleRow}>
              <div className={styles.titleGroup}>
                <h1 className={styles.eventTitle}>{eventData.name}</h1>
              </div>
              <button className="btn btn-primary" onClick={() => setIsSaleWizardOpen(true)}>
                Registrar venta
              </button>
            </div>
          </div>

          {/* Metrics panel */}
          <div className={styles.metricPanel}>

            {/* Status badge */}
            <div className={`${styles.statusBadge} ${statusBadgeClass} ${styles.statusBadgeInCard}`}>
              <span className={styles.statusDot} />
              <span className={styles.statusText}>{statusLabel}</span>
            </div>

            {/* Progress bar */}
            <div className={styles.metricProgressBlock}>
              <div className={styles.metricProgressHeader}>
                <span className={styles.metricProgressValue}>{percentage}%</span>
                <span className={styles.metricProgressSub}>vendido</span>
              </div>
              <div className={styles.metricTrack}>
                <div className={styles.metricFill} style={{ width: `${Math.min(percentage, 100)}%` }} />
              </div>
            </div>

            {/* KPIs */}
            <div className={styles.metricKpis}>
              <div className={styles.metricKpi}>
                <span className={styles.metricKpiValue}>
                  ${(eventType === 'food_sale' ? foodSaleTotal : eventData.collected).toLocaleString('es-AR')}
                </span>
                <span className={styles.metricKpiLabel}>Recaudado</span>
              </div>
              <div className={styles.metricKpi}>
                <span className={styles.metricKpiValue}>
                  ${(eventType === 'food_sale' ? foodSaleGoal : eventData.goal).toLocaleString('es-AR')}
                </span>
                <span className={styles.metricKpiLabel}>Objetivo</span>
              </div>
              {eventType === 'food_sale' ? (
                <div className={styles.metricKpi}>
                  <span className={styles.metricKpiValue}>{eventBuyers.length}</span>
                  <span className={styles.metricKpiLabel}>Compradores</span>
                </div>
              ) : (
                <>
                  <div className={styles.metricKpi}>
                    <span className={styles.metricKpiValue}>{eventData.soldNumbers}/{eventData.totalNumbers}</span>
                    <span className={styles.metricKpiLabel}>Vendidos</span>
                  </div>
                  <div className={styles.metricKpi}>
                    <span className={styles.metricKpiValue}>${eventData.ticketPrice.toLocaleString('es-AR')}</span>
                    <span className={styles.metricKpiLabel}>Por número</span>
                  </div>
                </>
              )}
            </div>

            {/* Dish breakdown — food_sale only */}
            {eventType === 'food_sale' && eventData.dishes && eventData.dishes.length > 0 && (
              <div className={styles.dishBreakdown}>
                <p className={styles.dishBreakdownTitle}>Platos</p>
                {eventData.dishes.map((dish, i) => {
                  const sold = dish.sold ?? 0;
                  const total = dish.total ?? 0;
                  const pct = total > 0 ? Math.min(Math.round((sold / total) * 100), 100) : 0;
                  return (
                    <div key={i} className={styles.dishRow}>
                      <span className={styles.dishName}>{dish.name}</span>
                      <div className={styles.dishTrack}>
                        <div className={styles.dishFill} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={styles.dishStats}>{sold}/{total}</span>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Top-level Tabs */}
          <TabBar
            tabs={[
              { value: 'vendedores', label: 'Vendedores' },
              { value: 'compradores', label: 'Compradores' },
              { value: 'configuracion', label: 'Detalle' },
            ]}
            activeTab={activeTopTab}
            onChange={(value) => setActiveTopTab(value as TopTab)}
          />

          {/* ── VENDEDORES ───────────────────────────────────────────────── */}
          {activeTopTab === 'vendedores' && (
            <div className={styles.tableContainer}>
              {/* Sub-tabs */}
              <div className={styles.tabsContainer}>
                <button
                  className={`${styles.tab} ${activeVendorTab === 'collected' ? styles.activeTab : ''}`}
                  onClick={() => setActiveVendorTab('collected')}
                >
                  Dinero cobrado
                </button>
                <button
                  className={`${styles.tab} ${activeVendorTab === 'pending' ? styles.activeTab : ''}`}
                  onClick={() => setActiveVendorTab('pending')}
                >
                  Dinero por cobrar
                </button>
              </div>

              {/* Search + inline action */}
              <div className={styles.searchContainer}>
                <div className={styles.searchBar}>
                  <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Buscar"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                {activeVendorTab === 'pending' && selectedVendors.length > 0 && (
                  <button className={styles.markAsPaidButton} onClick={handleMarkAsPaid}>Cobrado</button>
                )}
                {activeVendorTab === 'collected' && selectedCollectedVendors.length > 0 && (
                  <button className={styles.markAsPaidButton} onClick={handleAssignMoreNumbers}>Asignar más números</button>
                )}
              </div>

              {/* Desktop table view */}
              <div className={styles.tableView}>
                {filteredVendorData.map((item, index) => {
                  const isSelected = activeVendorTab === 'pending'
                    ? selectedVendors.includes(item.id)
                    : selectedCollectedVendors.includes(item.id);
                  return (
                    <div key={item.id ?? index} className={`${styles.salesItem} ${styles.tableRow}`}>
                      <div className={styles.checkboxWrapper}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleVendorSelect(item.id, activeVendorTab)}
                          className={styles.checkbox}
                        />
                      </div>
                      <div className={styles.salesItemLeft}>
                        <div className={styles.sellerName}>{item.name}</div>
                        <div className={styles.sellerStats}>{item.sold} de {item.total} vendidos</div>
                      </div>
                      <div className={styles.salesItemRight}>
                        <div className={styles.salesAmount}>${item.amount.toLocaleString()}</div>
                        <div className={styles.salesPercentage}>{item.percentage}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile list view */}
              <div className={styles.salesList}>
                {filteredVendorData.map((item, index) => {
                  const isSelected = activeVendorTab === 'pending'
                    ? selectedVendors.includes(item.id)
                    : selectedCollectedVendors.includes(item.id);
                  return (
                    <div key={item.id ?? index} className={styles.salesItem}>
                      <div className={styles.checkboxWrapper}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleVendorSelect(item.id, activeVendorTab)}
                          className={styles.checkbox}
                          aria-label={`Seleccionar ${item.name}`}
                        />
                      </div>
                      <div className={styles.salesItemLeft}>
                        <div className={styles.sellerName}>{item.name}</div>
                        <div className={styles.sellerStats}>{item.sold} de {item.total} vendidos</div>
                      </div>
                      <div className={styles.salesItemRight}>
                        <div className={styles.salesAmount}>${item.amount.toLocaleString()}</div>
                        <div className={styles.salesPercentage}>{item.percentage}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer totals */}
              <div className={styles.footerContainer}>
                <div className={styles.footerContent}>
                  <div className={styles.footerLeft}>
                    <div className={styles.footerLabel}>
                      {activeVendorTab === 'collected' ? 'TOTAL COBRADO' : 'TOTAL POR COBRAR'}
                    </div>
                    <div className={styles.footerCount}>{totalSold} de {totalNumbers} totales</div>
                  </div>
                  <div className={styles.footerRight}>
                    <div className={styles.footerAmount}>${totalAmount.toLocaleString()}</div>
                    <div className={styles.footerPercentage}>{totalPercentage}%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── COMPRADORES ──────────────────────────────────────────────── */}
          {activeTopTab === 'compradores' && (
            <div className={styles.compradoresTab}>

              {/* Card: tabs + buscador + lista */}
              <div className={styles.tableContainer}>

              {/* Sub-tabs */}
              <div className={styles.tabsContainer}>
                <button
                  className={`${styles.tab} ${activeBuyerTab === 'tab1' ? styles.activeTab : ''}`}
                  onClick={() => setActiveBuyerTab('tab1')}
                >
                  {eventType === 'food_sale' ? 'Entregado' : 'Impresos'}
                </button>
                <button
                  className={`${styles.tab} ${activeBuyerTab === 'tab2' ? styles.activeTab : ''}`}
                  onClick={() => setActiveBuyerTab('tab2')}
                >
                  {eventType === 'food_sale' ? 'Por entregar' : 'Sin imprimir'}
                </button>
              </div>

              {/* Search + bulk actions */}
              <div className={styles.searchContainer}>
                <div className={styles.searchBar}>
                  <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, teléfono o vendedor"
                    value={buyerSearchTerm}
                    onChange={e => setBuyerSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
                {isDesktop && selectedBuyers.length > 0 && selectionType === 'raffle' && (
                  <button onClick={() => handlePrintReceipts(!areAllSelectedPrinted)} className={styles.markAsPaidButton}>
                    {areAllSelectedPrinted ? 'Desmarcar impreso' : 'Imprimir comprobantes'} ({selectedBuyers.length})
                  </button>
                )}
                {isDesktop && selectedBuyers.length > 0 && selectionType === 'food_sale' && (
                  <button onClick={() => handleSetDeliveredStatus(!areAllSelectedDelivered)} className={styles.markAsPaidButton}>
                    {areAllSelectedDelivered ? 'Desmarcar' : 'Entregado'} ({selectedBuyers.length})
                  </button>
                )}
              </div>

              {/* Desktop table */}
              {isDesktop && <table className={listStyles.table}>
                  <thead>
                    <tr>
                      <th className={listStyles.checkboxColumn}>
                        <div className={listStyles.checkboxWrapper}>
                          <input
                            type="checkbox"
                            checked={
                              filteredBuyers.filter(b => b.status === 'active').length > 0 &&
                              selectedBuyers.length === filteredBuyers.filter(b => b.status === 'active').length
                            }
                            onChange={handleSelectAllBuyers}
                            className={listStyles.checkbox}
                            aria-label="Seleccionar todos"
                          />
                        </div>
                      </th>
                      <th>
                        <div className={listStyles.headerWithCounter}>
                          <span>Comprador</span>
                          <span className={listStyles.headerCounter}>{filteredBuyers.length}</span>
                        </div>
                      </th>
                      <th>Vendedor</th>
                      <th className={listStyles.actionsColumn}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBuyers.map(buyer => {
                      const seller = MOCK_SELLERS.find(s => s.id === buyer.sellerId);
                      return (
                        <tr
                          key={buyer.id}
                          className={`${listStyles.tableRow} ${buyer.status === 'inactive' ? listStyles.tableRowInactive : ''}`}
                        >
                          <td className={listStyles.checkboxColumn}>
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
                          </td>
                          <td>
                            <div className={buyerStyles.buyerInfo}>
                              <div
                                className={buyerStyles.buyerName}
                                onClick={() => eventType === 'raffle' ? setRaffleDetailBuyer(buyer) : setPurchaseDetailBuyer(buyer)}
                                style={{ cursor: 'pointer' }}
                              >
                                {buyer.firstName} {buyer.lastName}
                              </div>
                              <div className={buyerStyles.buyerPhone}>{buyer.phone}</div>
                            </div>
                          </td>
                          <td>
                            {seller ? (
                              <div className={listStyles.cellTruncate}>{seller.firstName} {seller.lastName}</div>
                            ) : (
                              <div className={listStyles.noEvent}>—</div>
                            )}
                          </td>
                          <td className={listStyles.actionsColumn}>
                            <div className={listStyles.desktopMenuContainer}>
                              <button
                                className={listStyles.desktopMenuButton}
                                onClick={() => setBuyerDesktopMenuOpen(buyerDesktopMenuOpen === buyer.id ? null : buyer.id)}
                                aria-label="Menú de opciones"
                                aria-expanded={buyerDesktopMenuOpen === buyer.id}
                                aria-haspopup="true"
                              >
                                <IconDotsVertical />
                              </button>
                              {buyerDesktopMenuOpen === buyer.id && (
                                <div className={listStyles.desktopMenuDropdown} role="menu">
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className={listStyles.desktopMenuItem}
                                    onClick={() => { eventType === 'raffle' ? setRaffleDetailBuyer(buyer) : setPurchaseDetailBuyer(buyer); setBuyerDesktopMenuOpen(null); }}
                                  >
                                    <IconDetail /> Detalle
                                  </button>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className={listStyles.desktopMenuItem}
                                    onClick={() => { handleToggleBuyerStatus(buyer.id); setBuyerDesktopMenuOpen(null); }}
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
                </table>}

              {/* Mobile list */}
              {!isDesktop && (
                <div
                  className={`${listStyles.mobileListContainer} ${selectedBuyers.length > 0 ? listStyles.hasStickyBar : ''}`}
                  role="list"
                >
                  {filteredBuyers.map(buyer => {
                    const seller = MOCK_SELLERS.find(s => s.id === buyer.sellerId);
                    return (
                      <MobileListRow
                        key={buyer.id}
                        id={buyer.id}
                        isInactive={buyer.status === 'inactive'}
                        isSelected={selectedBuyers.includes(buyer.id)}
                        checkboxSlot={
                          <input
                            type="checkbox"
                            id={`buyer-${buyer.id}`}
                            checked={selectedBuyers.includes(buyer.id)}
                            onChange={() => handleSelectBuyer(buyer.id)}
                            disabled={buyer.status === 'inactive'}
                            className={listStyles.mobileCheckbox}
                            aria-label={`Seleccionar ${buyer.firstName} ${buyer.lastName}`}
                          />
                        }
                        name={
                          <span
                            onClick={() => eventType === 'raffle' ? setRaffleDetailBuyer(buyer) : setPurchaseDetailBuyer(buyer)}
                            style={{ cursor: 'pointer' }}
                          >
                            {buyer.firstName} {buyer.lastName}
                          </span>
                        }
                        phone={buyer.phone}
                        eventLine={
                          eventType === 'food_sale'
                            ? (buyer.foodPurchase ?? []).map(i => `${i.dishName} ×${i.quantity}`).join(' · ') || 'Sin pedido'
                            : eventData.name
                        }
                        sellerLine={seller ? `${seller.firstName} ${seller.lastName}` : undefined}
                        menuSlot={
                          <div className={listStyles.mobileMenuContainer}>
                            <button
                              type="button"
                              className={listStyles.mobileMenuButton}
                              onClick={() => setBuyerMobileMenuOpen(buyerMobileMenuOpen === buyer.id ? null : buyer.id)}
                              aria-label="Menú de opciones"
                              aria-expanded={buyerMobileMenuOpen === buyer.id}
                              aria-haspopup="true"
                            >
                              <IconDotsVertical />
                            </button>
                            {buyerMobileMenuOpen === buyer.id && (
                              <div className={listStyles.mobileMenuDropdown} role="menu">
                                <button
                                  type="button"
                                  role="menuitem"
                                  className={listStyles.mobileMenuItem}
                                  onClick={() => { eventType === 'raffle' ? setRaffleDetailBuyer(buyer) : setPurchaseDetailBuyer(buyer); setBuyerMobileMenuOpen(null); }}
                                >
                                  <IconDetail /> Detalle
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  className={listStyles.mobileMenuItem}
                                  onClick={() => { handleToggleBuyerStatus(buyer.id); setBuyerMobileMenuOpen(null); }}
                                >
                                  {buyer.status === 'active' ? <><IconDisable /> Deshabilitar</> : <><IconEnable /> Habilitar</>}
                                </button>
                              </div>
                            )}
                          </div>
                        }
                      />
                    );
                  })}
                </div>
              )}

              {filteredBuyers.length === 0 && (
                <EmptyState
                  icon={
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="9" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2" />
                      <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.6977C21.7033 16.0413 20.9999 15.5767 20.2 15.3778" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16 3.37781C16.7999 3.57668 17.5033 4.04129 18.0094 4.6977C18.5155 5.35411 18.8 6.16449 18.8 7C18.8 7.83551 18.5155 8.64589 18.0094 9.3023C17.5033 9.95871 16.7999 10.4233 16 10.6222" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                  title="No se encontraron compradores"
                  description="Intenta ajustar los filtros de búsqueda"
                />
              )}

              </div>{/* end tableContainer */}
            </div>
          )}

          {/* ── CONFIGURACIÓN ────────────────────────────────────────────── */}
          {activeTopTab === 'configuracion' && (
            <div className={styles.configTab}>
              <div className={styles.configSection}>
                <EventDataStep
                  key={eventData.id}
                  ref={eventDataStepRef}
                  readOnly={!isConfigEditing}
                  prizesLocked={prizesLocked}
                  allowDishClose={eventType === 'food_sale'}
                  onDishCloseToggle={handleDishCloseToggle}
                  initialData={{
                    type: eventType,
                    name: eventData.name,
                    endDate: new Date(eventData.endDate),
                    numberValue: String(eventData.ticketPrice),
                    totalNumbers: String(eventData.totalNumbers),
                    autoAdjust: false,
                    prizes: [...(eventData.prizes ?? [])].sort((a, b) => a.position - b.position).map(p => p.description),
                    foodItems: (eventData.dishes ?? []).map(d => ({ name: d.name, price: String(d.price), sold: d.sold, total: d.total })),
                  }}
                  onNext={() => setIsConfigEditing(false)}
                  onBack={() => {}}
                />
              </div>

              <div className={styles.configActions}>
                {!isConfigEditing ? (
                  <button className="btn btn-secondary btn-sm" onClick={() => setIsConfigEditing(true)}>
                    Editar datos
                  </button>
                ) : (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => eventDataStepRef.current?.validateAndNext()}>
                      Guardar cambios
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setIsConfigEditing(false)}>
                      Cancelar
                    </button>
                  </>
                )}
              </div>

              <div className={styles.dangerZone}>
                <div className={styles.dangerZoneText}>
                  <h3 className={styles.dangerZoneTitle}>Cancelar evento</h3>
                  <p className={styles.dangerZoneDesc}>
                    Cancelá el evento si no puede llevarse a cabo. Se registrará como cancelado y no se podrán agregar nuevas ventas.
                  </p>
                </div>
                <button className={styles.dangerBtn} onClick={() => setIsCloseEventOpen(true)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Compradores: Mobile sticky action bar */}
      <MobileStickyActionBar
        visible={!isDesktop && activeTopTab === 'compradores' && selectedBuyers.length > 0}
        onCancel={() => setSelectedBuyers([])}
      >
        {selectionType === 'raffle' && (
          <button type="button" className={listStyles.assignStickyPrimary} onClick={() => handlePrintReceipts(!areAllSelectedPrinted)}>
            {areAllSelectedPrinted ? `Desmarcar impreso (${selectedBuyers.length})` : `Imprimir comprobantes (${selectedBuyers.length})`}
          </button>
        )}
        {selectionType === 'food_sale' && (
          <button type="button" className={listStyles.assignStickyPrimary} onClick={() => handleSetDeliveredStatus(!areAllSelectedDelivered)}>
            {areAllSelectedDelivered ? `Desmarcar (${selectedBuyers.length})` : `Entregado (${selectedBuyers.length})`}
          </button>
        )}
      </MobileStickyActionBar>


      {/* Compradores: Modal detalle de números — rifa (desktop) */}
      {isDesktop && raffleDetailBuyer && (
        <div className={buyerStyles.modalOverlay} onClick={() => setRaffleDetailBuyer(null)}>
          <div className={buyerStyles.purchaseDetailModal} onClick={e => e.stopPropagation()}>
            <div className={buyerStyles.purchaseDetailHeader}>
              <div>
                <h2 className={buyerStyles.purchaseDetailTitle}>Números asignados</h2>
                <p className={buyerStyles.purchaseDetailBuyerName}>{raffleDetailBuyer.firstName} {raffleDetailBuyer.lastName}</p>
              </div>
              <button className={buyerStyles.closeButton} onClick={() => setRaffleDetailBuyer(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div className={buyerStyles.purchaseDetailContent}>
              <p className={buyerStyles.raffleNumbersCount}>{raffleDetailBuyer.assignedNumbers?.length ?? 0} número{(raffleDetailBuyer.assignedNumbers?.length ?? 0) !== 1 ? 's' : ''} · Vendedor: {raffleDetailBuyer.sellerName}</p>
              <div className={buyerStyles.raffleNumbersGrid}>{(raffleDetailBuyer.assignedNumbers ?? []).map(num => <span key={num} className={buyerStyles.raffleNumberChip}>{num}</span>)}</div>
            </div>
            <div className={buyerStyles.purchaseDetailFooter}>
              <button className="btn btn-primary" onClick={() => { setBuyers(prev => prev.map(b => b.id === raffleDetailBuyer.id ? { ...b, isPrinted: !raffleDetailBuyer.isPrinted } : b)); setRaffleDetailBuyer(null); raffleSnackbar.showSnackbar(); }}>
                {raffleDetailBuyer.isPrinted ? 'Desmarcar impreso' : 'Imprimir comprobante'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compradores: Bottom sheet detalle de números — rifa (mobile) */}
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
        <p className={buyerStyles.raffleNumbersCount}>{raffleDetailBuyer?.assignedNumbers?.length ?? 0} número{(raffleDetailBuyer?.assignedNumbers?.length ?? 0) !== 1 ? 's' : ''} · Vendedor: {raffleDetailBuyer?.sellerName}</p>
        <div className={buyerStyles.raffleNumbersGrid}>{(raffleDetailBuyer?.assignedNumbers ?? []).map(num => <span key={num} className={buyerStyles.raffleNumberChip}>{num}</span>)}</div>
      </BottomSheet>

      {/* Compradores: Modal detalle de compra — food sale (desktop) */}
      {isDesktop && purchaseDetailBuyer && (() => {
        const seller = MOCK_SELLERS.find(s => s.id === purchaseDetailBuyer.sellerId);
        const total = (purchaseDetailBuyer.foodPurchase ?? []).reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
        return (
          <div className={buyerStyles.modalOverlay} onClick={() => setPurchaseDetailBuyer(null)}>
            <div className={buyerStyles.purchaseDetailModal} onClick={e => e.stopPropagation()}>

              {/* Header: nombre + meta */}
              <div className={buyerStyles.purchaseDetailHeader}>
                <div>
                  <h2 className={buyerStyles.purchaseDetailTitle}>
                    {purchaseDetailBuyer.firstName} {purchaseDetailBuyer.lastName}
                  </h2>
                  <div className={buyerStyles.detailBuyerMeta}>
                    <span>{purchaseDetailBuyer.phone}</span>
                    {seller && (
                      <>
                        <span className={buyerStyles.detailMetaDot}>·</span>
                        <span>{seller.firstName} {seller.lastName}</span>
                      </>
                    )}
                  </div>
                </div>
                <button className={buyerStyles.closeButton} onClick={() => setPurchaseDetailBuyer(null)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Estado */}
              <div className={buyerStyles.detailStatusRow}>
                <span className={`${buyerStyles.detailStatusBadge} ${purchaseDetailBuyer.isDelivered ? buyerStyles.detailStatusDelivered : buyerStyles.detailStatusPending}`}>
                  <span className={buyerStyles.detailStatusDot} />
                  {purchaseDetailBuyer.isDelivered ? 'Entregado' : 'Por entregar'}
                </span>
              </div>

              <div className={buyerStyles.detailDivider} />

              {/* Items */}
              <div className={buyerStyles.detailItemList}>
                {(purchaseDetailBuyer.foodPurchase ?? []).map((item, idx) => (
                  <div key={idx} className={buyerStyles.detailItemRow}>
                    <span className={buyerStyles.detailItemName}>{item.dishName}</span>
                    <span className={buyerStyles.detailItemQty}>×{item.quantity}</span>
                    <span className={buyerStyles.detailItemSubtotal}>${(item.quantity * item.unitPrice).toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>

              <div className={buyerStyles.detailDivider} />

              {/* Total */}
              <div className={buyerStyles.detailTotalRow}>
                <span className={buyerStyles.detailTotalLabel}>Total</span>
                <span className={buyerStyles.detailTotalValue}>${total.toLocaleString('es-AR')}</span>
              </div>

              {/* Acción */}
              <div className={buyerStyles.purchaseDetailFooter}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setBuyers(prev => prev.map(b => b.id === purchaseDetailBuyer.id ? { ...b, isDelivered: !b.isDelivered } : b));
                    setPurchaseDetailBuyer(null);
                    deliverySnackbar.showSnackbar();
                  }}
                >
                  {purchaseDetailBuyer.isDelivered ? 'Desmarcar entregado' : 'Marcar como entregado'}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Compradores: Bottom sheet detalle de compra — food sale (mobile) */}
      {(() => {
        const seller = MOCK_SELLERS.find(s => s.id === purchaseDetailBuyer?.sellerId);
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
                onClick={() => {
                  setBuyers(prev => prev.map(b => b.id === purchaseDetailBuyer!.id ? { ...b, isDelivered: !b.isDelivered } : b));
                  setPurchaseDetailBuyer(null);
                  deliverySnackbar.showSnackbar();
                }}
              >
                {purchaseDetailBuyer?.isDelivered ? 'Desmarcar entregado' : 'Marcar como entregado'}
              </button>
            }
          >
            {/* Estado */}
            <div style={{ paddingBottom: 'var(--space-md)' }}>
              <span className={`${buyerStyles.detailStatusBadge} ${purchaseDetailBuyer?.isDelivered ? buyerStyles.detailStatusDelivered : buyerStyles.detailStatusPending}`}>
                <span className={buyerStyles.detailStatusDot} />
                {purchaseDetailBuyer?.isDelivered ? 'Entregado' : 'Por entregar'}
              </span>
            </div>

            <div className={buyerStyles.detailDivider} style={{ margin: `0 calc(-1 * ${sp})` }} />

            {/* Items */}
            <div style={{ padding: '4px 0 8px' }}>
              {(purchaseDetailBuyer?.foodPurchase ?? []).map((item, idx) => (
                <div key={idx} className={buyerStyles.detailItemRow}>
                  <span className={buyerStyles.detailItemName}>{item.dishName}</span>
                  <span className={buyerStyles.detailItemQty}>×{item.quantity}</span>
                  <span className={buyerStyles.detailItemSubtotal}>${(item.quantity * item.unitPrice).toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>

            <div className={buyerStyles.detailDivider} style={{ margin: `0 calc(-1 * ${sp})` }} />

            {/* Total */}
            <div className={buyerStyles.detailTotalRow} style={{ padding: 'var(--space-md) 0 0' }}>
              <span className={buyerStyles.detailTotalLabel}>Total</span>
              <span className={buyerStyles.detailTotalValue}>${total.toLocaleString('es-AR')}</span>
            </div>
          </BottomSheet>
        );
      })()}

      {/* Compradores: Snackbars */}
      {raffleSnackbar.isVisible && (
        <div className={`${buyerStyles.snackbar} ${raffleSnackbar.isClosing ? buyerStyles.snackbarClosing : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Comprobante enviado a imprimir
        </div>
      )}
      {deliverySnackbar.isVisible && (
        <div className={`${buyerStyles.snackbar} ${deliverySnackbar.isClosing ? buyerStyles.snackbarClosing : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Estado de entrega actualizado
        </div>
      )}

      {/* Vendedores: Mobile sticky bars */}
      {activeTopTab === 'vendedores' && activeVendorTab === 'pending' && selectedVendors.length > 0 && (
        <div className={styles.assignStickyBar}>
          <button className={styles.assignStickyCancel} onClick={() => setSelectedVendors([])}>Cancelar</button>
          <button className={styles.assignStickyPrimary} onClick={handleMarkAsPaid}>Cobrado</button>
        </div>
      )}
      {activeTopTab === 'vendedores' && activeVendorTab === 'collected' && selectedCollectedVendors.length > 0 && (
        <div className={styles.assignStickyBar}>
          <button className={styles.assignStickyPrimary} onClick={handleAssignMoreNumbers}>Asignar más números</button>
        </div>
      )}

      {/* Assign Numbers Modal */}
      <AssignNumbersModal
        isOpen={isAssignModalOpen}
        vendorNames={collectedData.filter(v => selectedCollectedVendors.includes(v.id)).map(v => v.name)}
        onClose={() => setIsAssignModalOpen(false)}
        onConfirm={handleModalConfirm}
      />

      {/* Register Sale — mobile bottom button */}
      <div className={styles.registerSaleBottomBar}>
        <button className="btn btn-primary btn-full" onClick={() => setIsSaleWizardOpen(true)}>
          Registrar venta
        </button>
      </div>

      {/* Register Sale Wizard */}
      <RegisterSaleWizard
        isOpen={isSaleWizardOpen}
        onClose={() => setIsSaleWizardOpen(false)}
        events={eventsForWizard}
        preselectedEventId={eventId}
      />

      {/* Close Event Confirmation Sheet */}
      <BottomSheet
        isOpen={isCloseEventOpen}
        onClose={() => setIsCloseEventOpen(false)}
        label="Cerrar evento"
        title="¿Cerrar este evento?"
        showCloseButton
        footer={
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => setIsCloseEventOpen(false)}
            >
              Cancelar
            </button>
            <button className={styles.dangerBtnSheet} onClick={() => setIsCloseEventOpen(false)}>
              Sí, cerrar evento
            </button>
          </div>
        }
      >
        <div className={styles.closeEventContent}>
          <p className={styles.closeEventDesc}>
            Al cerrar el evento se finaliza la recaudación. Ya no se podrán registrar más ventas ni cobros.
          </p>
          <div className={styles.closeEventSummary}>
            <div className={styles.closeEventStat}>
              <span className={styles.closeEventStatValue}>
                ${(eventType === 'food_sale' ? foodSaleTotal : eventData.collected).toLocaleString('es-AR')}
              </span>
              <span className={styles.closeEventStatLabel}>Recaudado total</span>
            </div>
            {eventType === 'food_sale' ? (
              <div className={styles.closeEventStat}>
                <span className={styles.closeEventStatValue}>{eventBuyers.length}</span>
                <span className={styles.closeEventStatLabel}>Compradores</span>
              </div>
            ) : (
              <div className={styles.closeEventStat}>
                <span className={styles.closeEventStatValue}>{eventData.soldNumbers} / {eventData.totalNumbers}</span>
                <span className={styles.closeEventStatLabel}>Números vendidos</span>
              </div>
            )}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
