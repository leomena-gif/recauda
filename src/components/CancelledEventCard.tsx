'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './CancelledEventCard.module.css';

const CancelledEventCard: React.FC = () => {
  const router = useRouter();
  
  const handleCardClick = () => {
    router.push('/event-detail');
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      {/* Status Badge with Dot */}
      <div className={styles.statusContainer}>
        <span className={styles.statusDot}></span>
        <span className={styles.statusText}>CANCELADO</span>
      </div>

      {/* Date Info */}
      <div className={styles.dateInfo}>
        Finaliza el 20 de diciembre de 2025
      </div>

      {/* Event Title */}
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

      {/* Bottom Details Row */}
      <div className={styles.detailsRow}>
        <span className={styles.detailLeft}>Objetivo $300.000</span>
        <span className={styles.detailRight}>300 números de $1.000</span>
      </div>
    </div>
  );
};

export default CancelledEventCard;
