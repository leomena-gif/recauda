'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './EventDetail.module.css';

export default function EventDetail() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'collected' | 'pending'>('collected');
  const [searchQuery, setSearchQuery] = useState('');

  const handleBackToEvents = () => {
    router.push('/');
  };

  const collectedData = [
    { name: 'Jacob Jones', sold: 10, total: 10, amount: 8000, percentage: 100 },
    { name: 'Jerome Bell', sold: 10, total: 10, amount: 8000, percentage: 100 },
    { name: 'Ronald Richards', sold: 10, total: 10, amount: 8000, percentage: 100 },
    { name: 'Savannah Nguyen', sold: 10, total: 10, amount: 8000, percentage: 100 },
    { name: 'Cameron Williamson', sold: 10, total: 10, amount: 8000, percentage: 100 },
    { name: 'Robert Fox', sold: 10, total: 10, amount: 8000, percentage: 100 },
    { name: 'Darrell Steward', sold: 10, total: 10, amount: 8000, percentage: 100 },
  ];

  const pendingData = [
    { name: 'Nombre Apellido', sold: 5, total: 10, amount: 5000, percentage: 50 },
    { name: 'Nombre Apellido', sold: 3, total: 10, amount: 3000, percentage: 30 },
    { name: 'Nombre Apellido', sold: 6, total: 10, amount: 6000, percentage: 60 },
  ];

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
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

            {/* Search Bar */}
            <div className={styles.searchContainer}>
              <div className={styles.searchBar}>
                <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Buscar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Sales List */}
            <div className={styles.salesList}>
              {filteredData.map((item, index) => (
                <div key={index} className={styles.salesItem}>
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
              ))}
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
    </>
  );
}
