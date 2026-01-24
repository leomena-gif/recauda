'use client';

import React from 'react';
import styles from './CardEmptyState.module.css';

interface CardEmptyStateProps {
  onCreateEvent?: () => void;
}

const CardEmptyState: React.FC<CardEmptyStateProps> = ({ onCreateEvent }) => {
  const handleCreateEvent = () => {
    onCreateEvent?.();
  };

  return (
    <div className={styles.container}>
      <div className={styles.emptyState}>
        <div className={styles.flagIcon}>🏁</div>
        <p className={styles.message}>Comencemos creando tu primer evento</p>
        <button className={styles.createButton} onClick={handleCreateEvent} type="button">
          Crear evento
        </button>
      </div>
    </div>
  );
};

export default CardEmptyState;
