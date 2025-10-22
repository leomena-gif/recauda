'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './SuccessScreen.module.css';

interface SuccessScreenProps {
  onAddAnother: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ onAddAnother }) => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

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
        <div className={styles.celebrationIcon}>🎉</div>
      </div>
      
      <h1 className={styles.title}>¡Vendedor creado con éxito!</h1>
      
      <p className={styles.description}>
        Ahora podés agregar otro vendedor o continuar más tarde.
      </p>
      
      <div className={styles.actions}>
        <button 
          className="btn btn-primary"
          onClick={onAddAnother}
        >
          Agregar otro vendedor
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={handleGoHome}
        >
          Continuar luego
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
