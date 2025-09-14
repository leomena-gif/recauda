'use client';

import React from 'react';
import styles from './EventsEmptyState.module.css';

const EventsEmptyState: React.FC = () => {
  const handleCreateEvent = () => {
    // Aquí se puede agregar la lógica para crear un evento
    console.log('Crear evento clicked');
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
