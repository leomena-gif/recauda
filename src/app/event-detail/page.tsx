'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './EventDetail.module.css';
import AssignNumbersModal from './AssignNumbersModal';

export default function EventDetail() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'collected' | 'pending'>('collected');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [selectedCollectedVendors, setSelectedCollectedVendors] = useState<number[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dynamic data management
  const [collectedData, setCollectedData] = useState([
    { id: 101, name: 'Jacob Jones', sold: 10, total: 10, amount: 8000, percentage: 100 },
    { id: 102, name: 'Jerome Bell', sold: 10, total: 10, amount: 8000, percentage: 100 },
    { id: 103, name: 'Ronald Richards', sold: 10, total: 10, amount: 8000, percentage: 100 },
    { id: 104, name: 'Savannah Nguyen', sold: 10, total: 10, amount: 8000, percentage: 100 },
    { id: 105, name: 'Cameron Williamson', sold: 10, total: 10, amount: 8000, percentage: 100 },
    { id: 106, name: 'Robert Fox', sold: 10, total: 10, amount: 8000, percentage: 100 },
    { id: 107, name: 'Darrell Steward', sold: 10, total: 10, amount: 8000, percentage: 100 },
  ]);

  const [pendingData, setPendingData] = useState([
    { id: 1, name: 'Nombre Apellido', sold: 5, total: 10, amount: 5000, percentage: 50 },
    { id: 2, name: 'Nombre Apellido', sold: 3, total: 10, amount: 3000, percentage: 30 },
    { id: 3, name: 'Nombre Apellido', sold: 6, total: 10, amount: 6000, percentage: 60 },
  ]);

  const handleBackToEvents = () => {
    router.push('/');
  };

  const handleSelectVendor = (vendorId: number) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSelectCollectedVendor = (vendorId: number) => {
    setSelectedCollectedVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleMarkAsPaid = () => {
    if (selectedVendors.length > 0) {
      // Find vendors to move
      const vendorsToMove = pendingData.filter(vendor => selectedVendors.includes(vendor.id));

      // Add to collected data
      setCollectedData(prev => [...prev, ...vendorsToMove]);

      // Remove from pending data
      setPendingData(prev => prev.filter(vendor => !selectedVendors.includes(vendor.id)));

      // Clear selection
      setSelectedVendors([]);
    }
  };

  const toggleMenu = (vendorId: number) => {
    setOpenMenuId(openMenuId === vendorId ? null : vendorId);
  };

  const handleAssignMoreNumbers = () => {
    if (selectedCollectedVendors.length > 0) {
      setIsModalOpen(true);
    }
  };

  const handleModalConfirm = (data: any) => {
    console.log('Assigning numbers to vendors:', selectedCollectedVendors, data);

    // Find vendors to move
    const vendorsToMove = collectedData.filter(v => selectedCollectedVendors.includes(v.id));

    // Update vendors with new number assignment
    const updatedVendors = vendorsToMove.map(vendor => ({
      ...vendor,
      total: vendor.total + data.quantity, // Add new numbers to total
      sold: 0, // Reset sold count for new numbers
      amount: 0, // Reset amount for new numbers
      percentage: 0 // Reset percentage
    }));

    // Remove from collected data
    setCollectedData(prev => prev.filter(v => !selectedCollectedVendors.includes(v.id)));

    // Add to pending data
    setPendingData(prev => [...prev, ...updatedVendors]);

    // Close modal and clear selection
    setIsModalOpen(false);
    setSelectedCollectedVendors([]);

    // Switch to pending tab to show the moved vendors
    setActiveTab('pending');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };



  const currentData = activeTab === 'collected' ? collectedData : pendingData;
  const filteredData = currentData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate totals
  const totalSold = filteredData.reduce((sum, item) => sum + item.sold, 0);
  const totalNumbers = filteredData.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);
  const totalPercentage = totalNumbers > 0 ? Math.round((totalSold / totalNumbers) * 100) : 0;

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
                <span className={styles.statusText}>ACTIVO</span>
              </div>
              <div className={styles.dateInfo}>
                Finaliza el 20 de diciembre de 2025
              </div>
            </div>

            <h2 className={styles.eventTitle}>
              Rifa día del niño del Grupo Scout General Deheza
            </h2>

            {/* Progress Bar */}
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '80%' }}>
                  <span className={styles.progressText}>80%</span>
                </div>
              </div>
            </div>

            {/* Bottom Details */}
            <div className={styles.eventDetailsRow}>
              <span className={styles.detailLeft}>Objetivo $300.000</span>
              <span className={styles.detailRight}>300 números de $1.000</span>
            </div>
          </div>

          {/* Table Container - Contains tabs, search, sales list and footer */}
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

            {/* Search Bar and Mark as Paid Button */}
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
              {/* Desktop: Mark as Paid Button - Only for pending tab */}
              {activeTab === 'pending' && selectedVendors.length > 0 && (
                <button
                  className={styles.markAsPaidButton}
                  onClick={handleMarkAsPaid}
                >
                  Cobrado
                </button>
              )}
              {/* Desktop: Assign More Numbers Button - Only for collected tab */}
              {activeTab === 'collected' && selectedCollectedVendors.length > 0 && (
                <button
                  className={styles.markAsPaidButton}
                  onClick={() => handleAssignMoreNumbers()}
                >
                  Asignar más números
                </button>
              )}
            </div>

            {/* Desktop: Table View with checkboxes (pending only) */}
            <div className={styles.tableView}>
              {filteredData.map((item: any, index) => {
                const isSelected = item.id && (activeTab === 'pending'
                  ? selectedVendors.includes(item.id)
                  : selectedCollectedVendors.includes(item.id));
                return (
                  <div
                    key={item.id || index}
                    className={`${styles.salesItem} ${styles.tableRow}`}
                  >
                    {/* Checkbox for both tabs */}
                    <div className={styles.checkboxWrapper}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (activeTab === 'pending' && item.id) {
                            handleSelectVendor(item.id);
                          } else if (activeTab === 'collected' && item.id) {
                            handleSelectCollectedVendor(item.id);
                          }
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
                      <div className={styles.salesAmount}>${item.amount.toLocaleString()}</div>
                      <div className={styles.salesPercentage}>{item.percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile: List View with checkboxes */}
            <div className={styles.salesList}>
              {filteredData.map((item: any, index) => {
                const isSelected = item.id && (activeTab === 'pending'
                  ? selectedVendors.includes(item.id)
                  : selectedCollectedVendors.includes(item.id));
                return (
                  <div key={item.id || index} className={styles.salesItem}>
                    {/* Checkbox for mobile */}
                    <div className={styles.checkboxWrapper}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (activeTab === 'pending' && item.id) {
                            handleSelectVendor(item.id);
                          } else if (activeTab === 'collected' && item.id) {
                            handleSelectCollectedVendor(item.id);
                          }
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
                      <div className={styles.salesAmount}>${item.amount.toLocaleString()}</div>
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
                  <div className={styles.footerAmount}>${totalAmount.toLocaleString()}</div>
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
          >
            Cobrado
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
