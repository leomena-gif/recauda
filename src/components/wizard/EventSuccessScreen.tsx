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
    <div style={{ 
      width: '100%', 
      margin: '0 auto', 
      padding: '40px 20px', 
      textAlign: 'center',
      position: 'relative',
      overflow: 'visible',
      minHeight: '100vh'
    }}>
      {/* Botón de volver en la esquina superior izquierda */}
      <button
        onClick={onBackToEvents}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 122, 255, 0.12)',
          color: '#007AFF',
          border: 'none',
          borderRadius: '8px',
          padding: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 122, 255, 0.18)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 122, 255, 0.12)';
        }}
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
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        gap: '16px', 
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '32px'
      }}>
        <button
          className="btn btn-secondary"
          onClick={handleManualAdd}
          style={{ minWidth: '220px' }}
        >
          Agregar manualmente
        </button>
        
        <button
          className={`btn btn-secondary ${!hasExistingLists ? 'disabled' : ''}`}
          onClick={hasExistingLists ? handleUseExistingList : undefined}
          disabled={!hasExistingLists}
          style={{ 
            minWidth: '220px',
            opacity: hasExistingLists ? 1 : 0.6,
            cursor: hasExistingLists ? 'pointer' : 'not-allowed'
          }}
        >
          Usar lista existente
          {!hasExistingLists && (
            <span style={{ fontSize: '12px', color: '#ef4444', marginLeft: 'auto' }}>
              No tenés listas creadas
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default EventSuccessScreen;
