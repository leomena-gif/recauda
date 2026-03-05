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
  
  // Verificar si hay listas existentes (por ahora siempre true)
  const hasExistingLists = true;
  
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

  const handleManualAdd = () => {
    router.push('/add-seller');
  };

  const handleUseExistingList = () => {
    router.push('/sellers-list');
  };


  return (
    <div className={styles.screenWrapper}>
      {/* Botón de volver en la esquina superior izquierda */}
      <button
        onClick={onBackToEvents}
        className={styles.backButtonStyle}
        aria-label="Volver a Mis eventos"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none"
        >
          <path 
            d="M19 12H5M12 19L5 12L12 5" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>

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
          className="btn btn-secondary"
          onClick={handleManualAdd}
        >
          Agregar manualmente
        </button>
        
        <button
          className={`btn btn-secondary ${!hasExistingLists ? 'disabled' : ''}`}
          onClick={hasExistingLists ? handleUseExistingList : undefined}
          disabled={!hasExistingLists}
        >
          Usar lista existente
          {!hasExistingLists && (
            <span className={styles.disabledText}>
              No tenés listas creadas
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default EventSuccessScreen;
