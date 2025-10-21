'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './EventDetail.module.css';

export default function EventDetail() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'collected' | 'pending'>('collected');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleBackToEvents = () => {
    router.push('/');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleEditPrice = () => {
    console.log('Editar precio');
    setIsDropdownOpen(false);
  };

  const handleEditDate = () => {
    console.log('Editar fecha');
    setIsDropdownOpen(false);
  };

  const handleAddSellers = () => {
    router.push('/add-seller');
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const collectedData = [
    { name: 'Nombre Apellido', sold: 10, total: 10, amount: 1000, percentage: 100 },
    { name: 'Nombre Apellido', sold: 8, total: 10, amount: 800, percentage: 80 },
    { name: 'Nombre Apellido', sold: 7, total: 10, amount: 700, percentage: 70 },
    { name: 'Nombre Apellido', sold: 10, total: 10, amount: 1000, percentage: 100 },
    { name: 'Nombre Apellido', sold: 10, total: 10, amount: 1000, percentage: 100 },
  ];

  const pendingData = [
    { name: 'Nombre Apellido', sold: 5, total: 10, amount: 500, percentage: 50 },
    { name: 'Nombre Apellido', sold: 3, total: 10, amount: 300, percentage: 30 },
    { name: 'Nombre Apellido', sold: 6, total: 10, amount: 600, percentage: 60 },
  ];

  return (
    <div className="pageContainer">
          {/* Navigation */}
          <div className={styles.navigationContainer}>
            <button className={styles.backButton} onClick={handleBackToEvents}>
              <svg className={styles.chevronIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Volver a mis eventos
            </button>
          </div>

          {/* Status Tag */}
          <div className={styles.statusContainer}>
            <span className={styles.statusTag}>ACTIVO</span>
          </div>

          {/* Event Title */}
          <h1 className={styles.eventTitle}>
            Rifa día del niño del G.S. General Deheza
          </h1>

          {/* Event Details with Progress */}
          <div className={styles.eventDetails}>
            <div className={styles.detailsHeader}>
              <h3 className={styles.detailsTitle}>Detalle del evento</h3>
              <div className={styles.dropdownContainer} ref={dropdownRef}>
                <button className={styles.editButton} onClick={toggleDropdown}>
                  <svg className={styles.editIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#374151"/>
                  </svg>
                  Editar evento
                  <svg className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.dropdownArrowOpen : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <button className={styles.dropdownItem} onClick={handleEditPrice}>
                      Editar precio
                    </button>
                    <button className={styles.dropdownItem} onClick={handleEditDate}>
                      Editar fecha
                    </button>
                    <button className={styles.dropdownItem} onClick={handleAddSellers}>
                      Agregar vendedores
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.detailsContent}>
              <div className={styles.progressItem}>
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressIndicator}>
                      <span className={styles.progressText}>80%</span>
                    </div>
                  </div>
                  <div className={styles.progressDetails}>
                    <div className={styles.daysRemaining}>
                      <span className={styles.daysValue}>15</span>
                      <span className={styles.daysLabel}>Días restantes</span>
                    </div>
                    <div className={styles.totalSold}>
                      <span className={styles.soldValue}>$64.000 de $80.000</span>
                      <span className={styles.soldLabel}>Total vendido</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.detailsGroup}>
                <div className={styles.detailsItems}>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Finaliza</span>
                    <span className={styles.value}>12/08/25</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Total de números</span>
                    <span className={styles.value}>800</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Precio</span>
                    <span className={styles.value}>$100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

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

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'collected' ? (
              <div className={styles.tableSection}>
                <div className={styles.tableHeader}>
                  <div className={styles.headerCell}>Vendedor</div>
                  <div className={styles.headerCell}>Vendidos</div>
                  <div className={styles.headerCell}>Porcentaje</div>
                  <div className={styles.headerCell}>Monto</div>
                </div>
                <div className={styles.tableBody}>
                  {collectedData.map((item, index) => (
                    <div key={index} className={styles.tableRow}>
                      <div className={styles.tableCell} data-label="Vendedor">
                        <div className={styles.sellerName}>{item.name}</div>
                      </div>
                      <div className={styles.tableCell} data-label="Vendidos">
                        <div className={styles.sellerStats}>
                          {item.sold}/{item.total}
                        </div>
                      </div>
                      <div className={styles.tableCell} data-label="Porcentaje">
                        <div className={styles.percentage}>{item.percentage}%</div>
                      </div>
                      <div className={styles.tableCell} data-label="Monto">
                        <div className={styles.amount}>${item.amount.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.tableSection}>
                <div className={styles.tableHeader}>
                  <div className={styles.headerCell}>Vendedor</div>
                  <div className={styles.headerCell}>Vendidos</div>
                  <div className={styles.headerCell}>Porcentaje</div>
                  <div className={styles.headerCell}>Monto</div>
                </div>
                <div className={styles.tableBody}>
                  {pendingData.map((item, index) => (
                    <div key={index} className={styles.tableRow}>
                      <div className={styles.tableCell} data-label="Vendedor">
                        <div className={styles.sellerName}>{item.name}</div>
                      </div>
                      <div className={styles.tableCell} data-label="Vendidos">
                        <div className={styles.sellerStats}>
                          {item.sold}/{item.total}
                        </div>
                      </div>
                      <div className={styles.tableCell} data-label="Porcentaje">
                        <div className={styles.percentage}>{item.percentage}%</div>
                      </div>
                      <div className={styles.tableCell} data-label="Monto">
                        <div className={styles.amount}>${item.amount.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Summary Section - Total row with all columns */}
            <div className={styles.summaryRow}>
              <div className={styles.summaryCell}>Total cobrado</div>
              <div className={styles.summaryCell}>45/50</div>
              <div className={styles.summaryCell}>90%</div>
              <div className={styles.summaryCell}>$5.000 de $64.000</div>
            </div>
          </div>
    </div>
  );
}
