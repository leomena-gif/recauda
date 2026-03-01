'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './CompletedEventCard.module.css';

interface CompletedEventCardProps {
  id: string;
  name: string;
  endDate?: string | null;
  totalNumbers?: number | null;
  soldNumbers?: number;
  numberValue?: number | null;
}

const CompletedEventCard: React.FC<CompletedEventCardProps> = ({
  id,
  name,
  endDate,
  totalNumbers,
  soldNumbers = 0,
  numberValue,
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/event-detail?id=${id}`);
  };

  const progress = totalNumbers && totalNumbers > 0
    ? Math.round((soldNumbers / totalNumbers) * 100)
    : 100;

  const goal = totalNumbers && numberValue
    ? (totalNumbers * numberValue).toLocaleString('es-AR')
    : null;

  const formattedDate = endDate
    ? new Date(endDate + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.statusContainer}>
        <span className={styles.statusDot}></span>
        <span className={styles.statusText}>FINALIZADO</span>
      </div>

      {formattedDate && (
        <div className={styles.dateInfo}>{formattedDate}</div>
      )}

      <h2 className={styles.eventTitle}>{name}</h2>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }}>
            <span className={styles.progressText}>{progress}%</span>
          </div>
        </div>
      </div>

      <div className={styles.detailsRow}>
        {goal && <span className={styles.detailLeft}>Objetivo ${goal}</span>}
        {totalNumbers && numberValue && (
          <span className={styles.detailRight}>
            {totalNumbers} números de ${numberValue.toLocaleString('es-AR')}
          </span>
        )}
      </div>
    </div>
  );
};

export default CompletedEventCard;
