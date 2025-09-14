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

  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <div className={styles.celebrationIcon}>🎉</div>
      </div>
      
      <h1 className={styles.title}>¡Vendedor creado con éxito!</h1>
      
      <div className={styles.actions}>
        <button 
          className={styles.secondaryButton}
          onClick={handleGoHome}
        >
          Continuar luego
        </button>
        
        <button 
          className={styles.primaryButton}
          onClick={onAddAnother}
        >
          Agregar otro vendedor
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
