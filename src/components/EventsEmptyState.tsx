'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './EventsEmptyState.module.css';

const EventsEmptyState: React.FC = () => {
  const router = useRouter();
  
  const handleCreateEvent = () => {
    router.push('/add-seller');
  };

  return (
    <div className={styles.container}>
      <div className={styles.emptyState}>
        <div className={styles.flagIcon}>🏁</div>
        <p className={styles.message}>Comencemos creando tu primer evento</p>
        <button className={styles.createButton} onClick={handleCreateEvent}>
          Crear evento
        </button>
      </div>
    </div>
  );
};

export default EventsEmptyState;
