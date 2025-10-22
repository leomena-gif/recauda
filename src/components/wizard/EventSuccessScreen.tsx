'use client';

import React from 'react';
import styles from './EventSuccessScreen.module.css';

interface EventSuccessScreenProps {
  onBackToEvents: () => void;
}

const EventSuccessScreen: React.FC<EventSuccessScreenProps> = ({
  onBackToEvents,
}) => {
  // Generar partículas de confetti
  const confettiParticles = Array.from({ length: 12 }, (_, i) => (
    <div
      key={i}
      className={styles.confetti}
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 0.5}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      }}
    />
  ));

  return (
    <div className={styles.container}>
      {/* Confetti de fondo */}
      <div className={styles.confettiContainer}>
        {confettiParticles}
      </div>

      <div className={styles.iconContainer}>
        <div className={styles.successIcon}>🎉</div>
      </div>
      
      <h1 className={styles.title}>¡Evento creado exitosamente!</h1>
      
      <p className={styles.description}>
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
