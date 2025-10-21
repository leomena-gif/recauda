'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './CompletedEventCard.module.css';

const CompletedEventCard: React.FC = () => {
  const router = useRouter();
  
  const handleGoToDetail = () => {
    router.push('/event-detail');
  };

  return (
    <div className={styles.card}>
      {/* Status Tag */}
      <div className={styles.statusContainer}>
        <span className={styles.tagGray}>FINALIZADO</span>
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
            <span className={styles.progressText}>100%</span>
          </div>
        </div>
      </div>

      {/* Second Row Details */}
      <div className={styles.detailsRow}>
        <div className={styles.detailItem}>
          <span className={styles.value}>0</span>
          <span className={styles.label}>Días restantes</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.value}>$80.000 de $80.000</span>
          <span className={styles.label}>Total vendido</span>
        </div>
      </div>

      {/* Action Button */}
      <button className="btn btn-tertiary btn-full" onClick={handleGoToDetail}>
        Ir al detalle
      </button>
    </div>
  );
};

export default CompletedEventCard;
