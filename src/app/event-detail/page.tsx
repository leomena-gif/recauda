'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './EventDetail.module.css';
import AssignNumbersModal from './AssignNumbersModal';
import { getSellerStatsForCampaign, type SellerStat, type CampaignWithStats } from '@/actions/campaigns';
import { markCollected } from '@/actions/sales';

type VendorRow = {
  id: string;
  name: string;
  sold: number;
  total: number;
  amount: number;
  percentage: number;
  item_ids: string[];
};

const STATUS_LABELS: Record<string, string> = {
  active: 'ACTIVO',
  completed: 'FINALIZADO',
  cancelled: 'CANCELADO',
  draft: 'BORRADOR',
};

function toCollectedRow(stat: SellerStat): VendorRow {
  return {
    id: stat.seller_id,
    name: stat.seller_name,
    sold: stat.collected,
    total: stat.assigned,
    amount: stat.amount_collected,
    percentage: stat.assigned > 0 ? Math.round((stat.collected / stat.assigned) * 100) : 0,
    item_ids: [],
  };
}

function toPendingRow(stat: SellerStat): VendorRow {
  return {
    id: stat.seller_id,
    name: stat.seller_name,
    sold: stat.sold,
    total: stat.assigned,
    amount: stat.amount_pending,
    percentage: stat.assigned > 0 ? Math.round((stat.sold / stat.assigned) * 100) : 0,
    item_ids: stat.pending_item_ids,
  };
}

function EventDetailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');

  const [activeTab, setActiveTab] = useState<'collected' | 'pending'>('collected');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedCollectedVendors, setSelectedCollectedVendors] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const [campaign, setCampaign] = useState<CampaignWithStats | null>(null);
  const [collectedData, setCollectedData] = useState<VendorRow[]>([]);
  const [pendingData, setPendingData] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!campaignId) {
      setError('No se especificó un evento');
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await getSellerStatsForCampaign(campaignId);
    if (result.error || !result.data) {
      setError(result.error ?? 'Error al cargar el evento');
      setLoading(false);
      return;
    }
    const { campaign: c, sellerStats } = result.data;
    setCampaign(c);
    setCollectedData(sellerStats.filter(s => s.collected > 0).map(toCollectedRow));
    setPendingData(sellerStats.filter(s => s.sold > 0).map(toPendingRow));
    setLoading(false);
  }, [campaignId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBackToEvents = () => {
    router.push('/');
  };

  const handleSelectVendor = (vendorId: string) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId) ? prev.filter(id => id !== vendorId) : [...prev, vendorId]
    );
  };

  const handleSelectCollectedVendor = (vendorId: string) => {
    setSelectedCollectedVendors(prev =>
      prev.includes(vendorId) ? prev.filter(id => id !== vendorId) : [...prev, vendorId]
    );
  };

  const handleMarkAsPaid = async () => {
    if (selectedVendors.length === 0) return;

    const itemIds = pendingData
      .filter(v => selectedVendors.includes(v.id))
      .flatMap(v => v.item_ids);

    if (itemIds.length === 0) return;

    setIsMarkingPaid(true);
    const result = await markCollected(itemIds);
    setIsMarkingPaid(false);

    if (result.error) {
      console.error('Error al marcar como cobrado:', result.error);
      return;
    }

    setSelectedVendors([]);
    await loadData();
  };

  const handleAssignMoreNumbers = () => {
    if (selectedCollectedVendors.length > 0) {
      setIsModalOpen(true);
    }
  };

  const handleModalConfirm = async () => {
    setIsModalOpen(false);
    setSelectedCollectedVendors([]);
    await loadData();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const currentData = activeTab === 'collected' ? collectedData : pendingData;
  const filteredData = currentData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSold = filteredData.reduce((sum, item) => sum + item.sold, 0);
  const totalNumbers = filteredData.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);
  const totalPercentage = totalNumbers > 0 ? Math.round((totalSold / totalNumbers) * 100) : 0;

  // Campaign card derived values
  const progress = campaign && campaign.total_numbers && campaign.total_numbers > 0
    ? Math.round((campaign.sold_numbers / campaign.total_numbers) * 100)
    : 0;
  const goal = campaign && campaign.total_numbers && campaign.number_value
    ? (campaign.total_numbers * campaign.number_value).toLocaleString('es-AR')
    : null;
  const formattedDate = campaign?.end_date
    ? new Date(campaign.end_date + 'T12:00:00').toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;
  const statusLabel = campaign ? (STATUS_LABELS[campaign.status] ?? campaign.status.toUpperCase()) : '';

  if (loading) {
    return (
      <div className={`pageContainer ${styles.eventDetailContainer}`}>
        <div className={`contentContainer ${styles.eventDetailContent}`}>
          <p style={{ padding: 'var(--space-lg)', color: 'var(--text-secondary)' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`pageContainer ${styles.eventDetailContainer}`}>
        <div className={`contentContainer ${styles.eventDetailContent}`}>
          <p style={{ padding: 'var(--space-lg)', color: 'var(--color-error)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`pageContainer ${styles.eventDetailContainer}`}>
        <div className={`contentContainer ${styles.eventDetailContent}`}>
          {/* Navigation */}
          <div className={styles.navigationContainer}>
            <button className={styles.backButton} onClick={handleBackToEvents}>
              <svg className={styles.chevronIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Volver a Mis eventos
            </button>
          </div>

          {/* Event Card */}
          <div className={styles.eventCard}>
            <div className={styles.eventCardHeader}>
              <div className={styles.statusContainer}>
                <span className={styles.statusDot}></span>
                <span className={styles.statusText}>{statusLabel}</span>
              </div>
              {formattedDate && (
                <div className={styles.dateInfo}>
                  Finaliza el {formattedDate}
                </div>
              )}
            </div>

            <h2 className={styles.eventTitle}>{campaign?.name}</h2>

            {/* Progress Bar */}
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }}>
                  <span className={styles.progressText}>{progress}%</span>
                </div>
              </div>
            </div>

            {/* Bottom Details */}
            <div className={styles.eventDetailsRow}>
              {goal && <span className={styles.detailLeft}>Objetivo ${goal}</span>}
              {campaign?.total_numbers && campaign?.number_value && (
                <span className={styles.detailRight}>
                  {campaign.total_numbers} números de ${campaign.number_value.toLocaleString('es-AR')}
                </span>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className={styles.tableContainer}>
            {/* Tabs */}
            <div className={styles.tabsContainer}>
              <button
                className={`${styles.tab} ${activeTab === 'collected' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('collected')}
              >
                Dinero cobrado
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Dinero por cobrar
              </button>
            </div>

            {/* Search Bar and Action Button */}
            <div className={styles.searchContainer}>
              <div className={styles.searchBar}>
                <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Buscar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {activeTab === 'pending' && selectedVendors.length > 0 && (
                <button
                  className={styles.markAsPaidButton}
                  onClick={handleMarkAsPaid}
                  disabled={isMarkingPaid}
                >
                  {isMarkingPaid ? 'Guardando...' : 'Cobrado'}
                </button>
              )}
              {activeTab === 'collected' && selectedCollectedVendors.length > 0 && (
                <button
                  className={styles.markAsPaidButton}
                  onClick={handleAssignMoreNumbers}
                >
                  Asignar más números
                </button>
              )}
            </div>

            {/* Desktop: Table View */}
            <div className={styles.tableView}>
              {filteredData.map((item, index) => {
                const isSelected = activeTab === 'pending'
                  ? selectedVendors.includes(item.id)
                  : selectedCollectedVendors.includes(item.id);
                return (
                  <div key={item.id || index} className={`${styles.salesItem} ${styles.tableRow}`}>
                    <div className={styles.checkboxWrapper}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (activeTab === 'pending') handleSelectVendor(item.id);
                          else handleSelectCollectedVendor(item.id);
                        }}
                        className={styles.checkbox}
                      />
                    </div>
                    <div className={styles.salesItemLeft}>
                      <div className={styles.sellerName}>{item.name}</div>
                      <div className={styles.sellerStats}>
                        {item.sold} de {item.total} vendidos
                      </div>
                    </div>
                    <div className={styles.salesItemRight}>
                      <div className={styles.salesAmount}>${item.amount.toLocaleString('es-AR')}</div>
                      <div className={styles.salesPercentage}>{item.percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile: List View */}
            <div className={styles.salesList}>
              {filteredData.map((item, index) => {
                const isSelected = activeTab === 'pending'
                  ? selectedVendors.includes(item.id)
                  : selectedCollectedVendors.includes(item.id);
                return (
                  <div key={item.id || index} className={styles.salesItem}>
                    <div className={styles.checkboxWrapper}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (activeTab === 'pending') handleSelectVendor(item.id);
                          else handleSelectCollectedVendor(item.id);
                        }}
                        className={styles.checkbox}
                        aria-label={`Seleccionar ${item.name}`}
                      />
                    </div>
                    <div className={styles.salesItemLeft}>
                      <div className={styles.sellerName}>{item.name}</div>
                      <div className={styles.sellerStats}>
                        {item.sold} de {item.total} vendidos
                      </div>
                    </div>
                    <div className={styles.salesItemRight}>
                      <div className={styles.salesAmount}>${item.amount.toLocaleString('es-AR')}</div>
                      <div className={styles.salesPercentage}>{item.percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Table Footer */}
            <div className={styles.footerContainer}>
              <div className={styles.footerContent}>
                <div className={styles.footerLeft}>
                  <div className={styles.footerLabel}>
                    {activeTab === 'collected' ? 'TOTAL COBRADO' : 'TOTAL POR COBRAR'}
                  </div>
                  <div className={styles.footerCount}>
                    {totalSold} de {totalNumbers} totales
                  </div>
                </div>
                <div className={styles.footerRight}>
                  <div className={styles.footerAmount}>${totalAmount.toLocaleString('es-AR')}</div>
                  <div className={styles.footerPercentage}>{totalPercentage}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Sticky Bottom Bar for Pending Tab */}
      {activeTab === 'pending' && selectedVendors.length > 0 && (
        <div className={styles.assignStickyBar}>
          <button
            type="button"
            className={styles.assignStickyCancel}
            onClick={() => setSelectedVendors([])}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.assignStickyPrimary}
            onClick={handleMarkAsPaid}
            disabled={isMarkingPaid}
          >
            {isMarkingPaid ? 'Guardando...' : 'Cobrado'}
          </button>
        </div>
      )}

      {/* Mobile: Sticky Bottom Bar for Collected Tab */}
      {activeTab === 'collected' && selectedCollectedVendors.length > 0 && (
        <div className={styles.assignStickyBar}>
          <button
            type="button"
            className={styles.assignStickyCancel}
            onClick={() => setSelectedCollectedVendors([])}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.assignStickyPrimary}
            onClick={handleAssignMoreNumbers}
          >
            Asignar más números
          </button>
        </div>
      )}

      {/* Assign Numbers Modal */}
      <AssignNumbersModal
        isOpen={isModalOpen}
        vendorNames={collectedData
          .filter(v => selectedCollectedVendors.includes(v.id))
          .map(v => v.name)
        }
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
    </>
  );
}

export default function EventDetail() {
  return (
    <Suspense fallback={null}>
      <EventDetailInner />
    </Suspense>
  );
}
