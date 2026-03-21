'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './EventSuccessScreen.module.css';

interface EventSuccessScreenProps {
  onBackToEvents: () => void;
}

const EventSuccessScreen: React.FC<EventSuccessScreenProps> = ({
  onBackToEvents,
}) => {
  const router = useRouter();

  const handleAddSeller = () => {
    router.push('/add-seller');
  };

  return (
    <div className={styles.container}>
      <div className={styles.iconWrap}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h1 className={styles.title}>Evento creado</h1>
      <p className={styles.description}>Ya podés empezar a agregar vendedores y recaudar.</p>

      <div className={styles.actions}>
        <button className="btn btn-primary" onClick={handleAddSeller}>
          Agregar vendedor
        </button>
        <button className="btn btn-secondary" onClick={onBackToEvents}>
          Volver a mis eventos
        </button>
      </div>
    </div>
  );
};

export default EventSuccessScreen;
