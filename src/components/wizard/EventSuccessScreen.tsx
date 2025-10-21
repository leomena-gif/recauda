'use client';

import React from 'react';
import styles from './EventSuccessScreen.module.css';

interface EventSuccessScreenProps {
  onBackToEvents: () => void;
}

const EventSuccessScreen: React.FC<EventSuccessScreenProps> = ({
  onBackToEvents,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <div className={styles.successIcon}>🎉</div>
      </div>
      
      <h1 className={styles.title}>¡Evento creado exitosamente!</h1>
      
      <p className={styles.description}>
        Tu evento ha sido creado y está listo para comenzar. 
        Ahora podés agregar vendedores y comenzar a recaudar.
      </p>
      
      <div className={styles.actions}>
        <button
          className="btn btn-primary"
          onClick={onBackToEvents}
        >
          Agregar vendedores
        </button>
        
        <button
          className="btn btn-secondary"
          onClick={onBackToEvents}
        >
          Volver a Mis eventos
        </button>
      </div>
    </div>
  );
};

export default EventSuccessScreen;
