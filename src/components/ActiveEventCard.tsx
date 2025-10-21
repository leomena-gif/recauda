'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './ActiveEventCard.module.css';

const ActiveEventCard: React.FC = () => {
  const router = useRouter();
  
  const handleGoToDetail = () => {
    router.push('/event-detail');
  };

  const handleAddSellers = () => {
    router.push('/add-seller');
  };
  return (
    <div className={styles.card}>
      {/* Status Tag */}
      <div className={styles.statusContainer}>
        <span className={styles.tagGreen}>ACTIVO</span>
      </div>

      {/* Event Title */}
      <h2 className={styles.eventTitle}>Rifa día del niño del G.S. General Deheza</h2>

      {/* First Row Details */}
      <div className={styles.detailsRow}>
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

      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div className={styles.progressIndicator}>
            <span className={styles.progressText}>80%</span>
          </div>
        </div>
      </div>

      {/* Second Row Details */}
      <div className={styles.detailsRow}>
        <div className={styles.detailItem}>
          <span className={styles.value}>15</span>
          <span className={styles.label}>Días restantes</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.value}>$64.000 de $80.000</span>
          <span className={styles.label}>Total vendido</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.buttonContainer}>
        <button className={styles.detailButton} onClick={handleGoToDetail}>
          Ir al detalle
        </button>
        <button className={styles.addSellersButton} onClick={handleAddSellers}>
          Agregar vendedores
        </button>
      </div>
    </div>
  );
};

export default ActiveEventCard;
