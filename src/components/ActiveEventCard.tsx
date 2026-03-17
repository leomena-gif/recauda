'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './ActiveEventCard.module.css';
import Card from './Card';

interface Props {
  collected?: number;
  goal?: number;
  soldUnits?: number;
  totalUnits?: number;
}

const fmt = (n: number) => `$${new Intl.NumberFormat('es-AR').format(n)}`;

const ActiveEventCard: React.FC<Props> = ({ collected = 0, goal = 0, soldUnits = 0, totalUnits = 0 }) => {
  const router = useRouter();
  const progress = goal > 0 ? Math.min((collected / goal) * 100, 100) : 0;

  const handleCardClick = () => {
    router.push('/event-detail');
  };

  return (
    <Card interactive onClick={handleCardClick}>
      <div className={styles.content}>
        {/* Status Badge with Dot */}
        <div className={styles.statusContainer}>
          <span className={styles.statusDot}></span>
          <span className={styles.statusText}>ACTIVO</span>
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
            <div className={styles.progressFill} style={{ width: `${progress}%` }}>
              <span className={styles.progressText}>{Math.round(progress)}%</span>
            </div>
          </div>
          <span className={styles.unitStats}>{soldUnits}/{totalUnits} vendidos</span>
        </div>

        {/* Bottom Details Row */}
        <div className={styles.detailsRow}>
          <span className={styles.detailLeft}>Recaudado {fmt(collected)}</span>
          <span className={styles.detailRight}>Objetivo {fmt(goal)}</span>
        </div>
      </div>
    </Card>
  );
};

export default ActiveEventCard;
