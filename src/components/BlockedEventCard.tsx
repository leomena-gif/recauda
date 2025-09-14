'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './BlockedEventCard.module.css';

const BlockedEventCard: React.FC = () => {
  const router = useRouter();
  
  const handleAddSellers = () => {
    router.push('/add-seller');
  };

  return (
    <div className={styles.card}>
      {/* Status Tags */}
      <div className={styles.statusTags}>
        <span className={styles.tagOrange}>Sin vendedores asignados</span>
        <span className={styles.tagRed}>Bloqueado</span>
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
          <span className={styles.value}>-</span>
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
            <span className={styles.progressText}>0%</span>
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
          <span className={styles.value}>$0 de $0</span>
          <span className={styles.label}>Total vendido</span>
        </div>
      </div>

      {/* Action Button */}
      <button className={styles.actionButton} onClick={handleAddSellers}>
        Agregar vendedores
      </button>
    </div>
  );
};

export default BlockedEventCard;
