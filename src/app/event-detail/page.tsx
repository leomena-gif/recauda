'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './EventDetail.module.css';
import AssignNumbersModal from './AssignNumbersModal';
import BottomSheet from '@/components/BottomSheet';
import { MOCK_BUYERS, MOCK_EVENTS, MOCK_SELLERS, MOCK_HOME_EVENTS } from '@/mocks/data';
import { Buyer, StatusFilter } from '@/types/models';
import { STATUS_OPTIONS, SNACKBAR_DURATION } from '@/constants';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import CustomDropdown from '@/components/CustomDropdown';
import MobileListRow from '@/components/MobileListRow';
import MobileFilterSheet from '@/components/MobileFilterSheet';
import MobileStickyActionBar from '@/components/MobileStickyActionBar';
import EmptyState from '@/components/EmptyState';
import listStyles from '@/styles/list.module.css';
import buyerStyles from '../buyers-list/BuyersList.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type TopTab = 'vendedores' | 'compradores' | 'configuracion';
type VendorTab = 'collected' | 'pending';

// ─── Mock Event Data ──────────────────────────────────────────────────────────
const EVENT_DETAIL = {
  id: '1',
  name: 'Rifa día del niño del Grupo Scout General Deheza',
  status: 'active' as const,
  endDate: '2026-04-15',
  totalNumbers: 300,
  soldNumbers: 240,
  ticketPrice: 1000,
  prizeDescription: 'Bicicleta BMX + consola de videojuegos',
  goal: 300000,
  collected: 240000,
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

// ─── Circular Progress Ring ───────────────────────────────────────────────────
function CircularProgress({ percentage }: { percentage: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="140" height="140" viewBox="0 0 120 120" className={styles.progressRing}>
      <circle
        cx="60" cy="60" r={radius}
        fill="none" stroke="var(--color-bg-tertiary)" strokeWidth="9"
      />
      <circle
        cx="60" cy="60" r={radius}
        fill="none" stroke="var(--color-primary)" strokeWidth="9"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text
        x="60" y="53"
        textAnchor="middle"
        fill="var(--color-text-primary)"
        fontSize="20" fontWeight="700"
        fontFamily="inherit"
      >
        {percentage}%
      </text>
      <text
        x="60" y="71"
        textAnchor="middle"
        fill="var(--color-text-tertiary)"
        fontSize="10"
        fontFamily="inherit"
      >
        vendido
      </text>
    </svg>
  );
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
  const [editForm, setEditForm] = useState({
    name: eventData.name,
    endDate: eventData.endDate,
    ticketPrice: String(eventData.ticketPrice),
    prizeDescription: eventData.prizeDescription,
  });

  // Close event confirmation
  const [isCloseEventOpen, setIsCloseEventOpen] = useState(false);

  // ── Buyers tab state ──────────────────────────────────────────────────────
  const [buyers, setBuyers] = useState<Buyer[]>(MOCK_BUYERS);
  const [buyerSearchTerm, setBuyerSearchTerm] = useState('');
  const [buyerStatusFilter, setBuyerStatusFilter] = useState<StatusFilter>('all');
  const [printFilter, setPrintFilter] = useState<'all' | 'printed' | 'pending'>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'delivered' | 'pending'>('all');
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([]);
  const [buyerMobileMenuOpen, setBuyerMobileMenuOpen] = useState<string | null>(null);
  const [buyerDesktopMenuOpen, setBuyerDesktopMenuOpen] = useState<string | null>(null);
  const [buyerFiltersSheetOpen, setBuyerFiltersSheetOpen] = useState(false);
  const [purchaseDetailBuyer, setPurchaseDetailBuyer] = useState<Buyer | null>(null);
  const [raffleDetailBuyer, setRaffleDetailBuyer] = useState<Buyer | null>(null);

  // ── Computed ─────────────────────────────────────────────────────────────
  const daysRemaining = getDaysRemaining(eventData.endDate);

  // ── Buyers computed ───────────────────────────────────────────────────────
  const eventType = useMemo(
    () => MOCK_EVENTS.find(e => e.id === eventId)?.type ?? 'raffle',
    [eventId]
  );
  const showDeliveryFilter = eventType === 'food_sale';
  const showPrintFilter = eventType === 'raffle';

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
      const matchesStatus = buyerStatusFilter === 'all' || buyer.status === buyerStatusFilter;
      const matchesDelivery =
        !showDeliveryFilter || deliveryFilter === 'all'
          ? true
          : deliveryFilter === 'delivered' ? buyer.isDelivered === true : buyer.isDelivered !== true;
      const matchesPrint =
        !showPrintFilter || printFilter === 'all'
          ? true
          : printFilter === 'printed' ? buyer.isPrinted === true : buyer.isPrinted !== true;
      return matchesSearch && matchesStatus && matchesDelivery && matchesPrint;
    });
  }, [eventBuyers, buyerSearchTerm, buyerStatusFilter, deliveryFilter, showDeliveryFilter, printFilter, showPrintFilter]);

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

          {/* Back Navigation */}
          <div className={styles.navigationContainer}>
            <button className={styles.backButton} onClick={() => router.push('/')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Volver a Mis eventos
            </button>
          </div>

          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.metaRow}>
              <div className={`${styles.statusBadge} ${statusBadgeClass}`}>
                <span className={styles.statusDot} />
                <span className={styles.statusText}>{statusLabel}</span>
              </div>
            </div>
            <h1 className={styles.eventTitle}>{eventData.name}</h1>
          </div>

          {/* Metrics card — always visible, above tabs */}
          <div className={styles.progressDashboard}>
            <CircularProgress percentage={percentage} />
            <div className={styles.dashboardStats}>
              <div className={styles.dashboardStat}>
                <span className={styles.dashboardStatValue}>
                  ${(eventType === 'food_sale' ? foodSaleTotal : eventData.collected).toLocaleString('es-AR')}
                </span>
                <span className={styles.dashboardStatLabel}>Recaudado</span>
              </div>
              {eventType === 'food_sale' ? (
                <>
                  <div className={styles.dashboardStat}>
                    <span className={styles.dashboardStatValue}>${foodSaleGoal.toLocaleString('es-AR')}</span>
                    <span className={styles.dashboardStatLabel}>Objetivo</span>
                  </div>
                  <div className={styles.dashboardStat}>
                    <span className={styles.dashboardStatValue}>{eventBuyers.length}</span>
                    <span className={styles.dashboardStatLabel}>Compradores</span>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.dashboardStat}>
                    <span className={styles.dashboardStatValue}>${eventData.goal.toLocaleString('es-AR')}</span>
                    <span className={styles.dashboardStatLabel}>Objetivo</span>
                  </div>
                  <div className={styles.dashboardStat}>
                    <span className={styles.dashboardStatValue}>${eventData.ticketPrice.toLocaleString('es-AR')}</span>
                    <span className={styles.dashboardStatLabel}>Por número</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Top-level Tabs */}
          <div className={styles.topTabsContainer}>
            {([
              { id: 'vendedores', label: 'Vendedores' },
              { id: 'compradores', label: 'Compradores' },
              { id: 'configuracion', label: 'Configuración' },
            ] as { id: TopTab; label: string }[]).map(tab => (
              <button
                key={tab.id}
                className={`${styles.topTab} ${activeTopTab === tab.id ? styles.topTabActive : ''}`}
                onClick={() => setActiveTopTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

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

              {/* Stats summary */}
              <div className={styles.compradoresStats}>
                <div className={styles.compradorStat}>
                  <span className={styles.compradorStatValue}>{eventBuyers.length}</span>
                  <span className={styles.compradorStatLabel}>Compradores</span>
                </div>
                <div className={styles.compradorStatDivider} />
                {eventType === 'food_sale' ? (
                  <>
                    <div className={styles.compradorStat}>
                      <span className={styles.compradorStatValue}>${foodSaleTotal.toLocaleString('es-AR')}</span>
                      <span className={styles.compradorStatLabel}>Total recaudado</span>
                    </div>
                    <div className={styles.compradorStatDivider} />
                    <div className={styles.compradorStat}>
                      <span className={styles.compradorStatValue}>
                        {eventBuyers.length > 0
                          ? `$${Math.round(foodSaleTotal / eventBuyers.length).toLocaleString('es-AR')}`
                          : '—'}
                      </span>
                      <span className={styles.compradorStatLabel}>Promedio x comprador</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.compradorStat}>
                      <span className={styles.compradorStatValue}>{eventData.soldNumbers}</span>
                      <span className={styles.compradorStatLabel}>Números vendidos</span>
                    </div>
                    <div className={styles.compradorStatDivider} />
                    <div className={styles.compradorStat}>
                      <span className={styles.compradorStatValue}>
                        {eventBuyers.length > 0
                          ? (eventData.soldNumbers / eventBuyers.length).toFixed(1)
                          : '—'}
                      </span>
                      <span className={styles.compradorStatLabel}>Núm. promedio</span>
                    </div>
                  </>
                )}
              </div>

              {/* Search + filters */}
              <div className={listStyles.actionBar}>
                <div className={listStyles.leftSection}>
                  <div className={listStyles.searchContainer}>
                    <svg className={listStyles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Buscar por nombre, teléfono o vendedor"
                      value={buyerSearchTerm}
                      onChange={e => setBuyerSearchTerm(e.target.value)}
                      className={listStyles.searchInput}
                    />
                  </div>

                  {/* Desktop filters */}
                  <div className={listStyles.filtersGroupDesktop}>
                    <div className={listStyles.statusFilter}>
                      <CustomDropdown
                        options={STATUS_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                        value={buyerStatusFilter}
                        onChange={value => setBuyerStatusFilter(value as StatusFilter)}
                        placeholder="Filtrar por estado"
                      />
                    </div>
                    {showPrintFilter && (
                      <div className={listStyles.eventFilter}>
                        <CustomDropdown
                          options={[
                            { value: 'all', label: 'Toda impresión' },
                            { value: 'printed', label: 'Impreso' },
                            { value: 'pending', label: 'Sin imprimir' },
                          ]}
                          value={printFilter}
                          onChange={value => setPrintFilter(value as 'all' | 'printed' | 'pending')}
                          placeholder="Filtrar por impresión"
                          alignRight={true}
                        />
                      </div>
                    )}
                    {showDeliveryFilter && (
                      <div className={listStyles.eventFilter}>
                        <CustomDropdown
                          options={[
                            { value: 'all', label: 'Toda entrega' },
                            { value: 'delivered', label: 'Entregado' },
                            { value: 'pending', label: 'Por entregar' },
                          ]}
                          value={deliveryFilter}
                          onChange={value => setDeliveryFilter(value as 'all' | 'delivered' | 'pending')}
                          placeholder="Filtrar por entrega"
                          alignRight={true}
                        />
                      </div>
                    )}
                  </div>

                  {/* Mobile filter button */}
                  {!isDesktop && (
                    <button
                      type="button"
                      className={listStyles.filtersTriggerMobile}
                      onClick={() => setBuyerFiltersSheetOpen(true)}
                      aria-label="Abrir filtros"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4 6h16M4 12h16M4 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Filtros</span>
                    </button>
                  )}
                </div>

                {/* Desktop bulk actions */}
                {isDesktop && selectedBuyers.length > 0 && selectionType === 'raffle' && (
                  <button onClick={() => handlePrintReceipts(!areAllSelectedPrinted)} className="btn btn-sm btn-primary">
                    {areAllSelectedPrinted ? 'Desmarcar impreso' : 'Imprimir comprobantes'} ({selectedBuyers.length})
                  </button>
                )}
                {isDesktop && selectedBuyers.length > 0 && selectionType === 'food_sale' && (
                  <button onClick={() => handleSetDeliveredStatus(!areAllSelectedDelivered)} className="btn btn-sm btn-primary">
                    {areAllSelectedDelivered ? 'Desmarcar' : 'Entregado'} ({selectedBuyers.length})
                  </button>
                )}
              </div>

              {/* Desktop table */}
              <div className={listStyles.tableContainer}>
                <table className={listStyles.table}>
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
                      {eventType === 'food_sale' && <th>Estado</th>}
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
                                {buyer.isDelivered && (
                                  <span className={buyerStyles.deliveredPill}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-label="Entregado">
                                      <path d="M20 6L9 17L4 12" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </span>
                                )}
                                {buyer.isPrinted && (
                                  <span className={buyerStyles.printedPill} aria-label="Comprobante impreso">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                      <path d="M6 9V2H18V9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M6 14H18V22H6V14Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </span>
                                )}
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
                          {eventType === 'food_sale' && (
                            <td>
                              <span className={`${buyerStyles.detailStatusBadge} ${buyer.isDelivered ? buyerStyles.detailStatusDelivered : buyerStyles.detailStatusPending}`}>
                                <span className={buyerStyles.detailStatusDot} />
                                {buyer.isDelivered ? 'Entregado' : 'Por entregar'}
                              </span>
                            </td>
                          )}
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
                </table>
              </div>

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
                            {buyer.isDelivered && (
                              <span className={buyerStyles.deliveredPill}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-label="Entregado">
                                  <path d="M20 6L9 17L4 12" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            )}
                            {buyer.isPrinted && (
                              <span className={buyerStyles.printedPill} aria-label="Comprobante impreso">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                  <path d="M6 9V2H18V9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M6 14H18V22H6V14Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            )}
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

            </div>
          )}

          {/* ── CONFIGURACIÓN ────────────────────────────────────────────── */}
          {activeTopTab === 'configuracion' && (
            <div className={styles.configTab}>
              <div className={styles.configFormHeader}>
                <h3 className={styles.configSectionTitle}>Datos del evento</h3>
                {!isConfigEditing ? (
                  <button className={styles.editHeaderBtn} onClick={() => setIsConfigEditing(true)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Editar
                  </button>
                ) : (
                  <button className={styles.configSaveBtnInline} onClick={() => setIsConfigEditing(false)}>
                    Guardar
                  </button>
                )}
              </div>
              <div className={styles.configForm}>
                <div className={styles.configFormGroup}>
                  <label className={styles.configLabel}>Nombre del evento</label>
                  <input
                    className={`${styles.configInput} ${!isConfigEditing ? styles.configInputReadonly : ''}`}
                    value={editForm.name}
                    readOnly={!isConfigEditing}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className={styles.configFormGroup}>
                  <label className={styles.configLabel}>Fecha de cierre</label>
                  <input
                    type={isConfigEditing ? 'date' : 'text'}
                    className={`${styles.configInput} ${!isConfigEditing ? styles.configInputReadonly : ''}`}
                    value={editForm.endDate}
                    readOnly={!isConfigEditing}
                    onChange={e => setEditForm(f => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
                <div className={styles.configFormGroup}>
                  <label className={styles.configLabel}>Precio por número</label>
                  <input
                    type={isConfigEditing ? 'number' : 'text'}
                    className={`${styles.configInput} ${!isConfigEditing ? styles.configInputReadonly : ''}`}
                    value={editForm.ticketPrice}
                    readOnly={!isConfigEditing}
                    onChange={e => setEditForm(f => ({ ...f, ticketPrice: e.target.value }))}
                  />
                </div>
                <div className={styles.configFormGroup}>
                  <label className={styles.configLabel}>Premio</label>
                  <input
                    className={`${styles.configInput} ${!isConfigEditing ? styles.configInputReadonly : ''}`}
                    value={editForm.prizeDescription}
                    readOnly={!isConfigEditing}
                    onChange={e => setEditForm(f => ({ ...f, prizeDescription: e.target.value }))}
                  />
                </div>
              </div>

              <div className={styles.dangerZone}>
                <h3 className={styles.dangerZoneTitle}>Zona de peligro</h3>
                <p className={styles.dangerZoneDesc}>
                  Cerrar el evento finaliza la recaudación. Esta acción no se puede deshacer.
                </p>
                <button className={styles.dangerBtn} onClick={() => setIsCloseEventOpen(true)}>
                  Cerrar evento
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

      {/* Compradores: Mobile filters sheet */}
      <MobileFilterSheet isOpen={!isDesktop && buyerFiltersSheetOpen} onClose={() => setBuyerFiltersSheetOpen(false)}>
        <div className={listStyles.sheetFilterGroup}>
          <span className={listStyles.sheetFilterLabel}>Estado</span>
          <div className={listStyles.sheetFilterOptions}>
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={buyerStatusFilter === opt.value ? listStyles.sheetFilterOptionActive : listStyles.sheetFilterOption}
                onClick={() => setBuyerStatusFilter(opt.value as StatusFilter)}
              >
                {opt.label}
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
              ] as const).map(opt => (
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
              ] as const).map(opt => (
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
