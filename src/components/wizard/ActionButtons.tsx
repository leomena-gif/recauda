'use client';

import React from 'react';
import styles from './ActionButtons.module.css';

interface ActionButtonsProps {
  onBack?: () => void;
  onContinue?: () => void;
  onConfirm?: () => void;
  continueText?: string;
  showBack?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onBack,
  onContinue,
  onConfirm,
  continueText = 'Continuar',
  showBack = true,
  isLastStep = false,
  isLoading = false,
}) => {
  const handleContinue = () => {
    if (isLastStep && onConfirm) {
      onConfirm();
    } else if (onContinue) {
      onContinue();
    }
  };

  return (
    <div className={styles.container}>
      {showBack && (
        <button 
          className={styles.backButton} 
          onClick={onBack}
          disabled={isLoading}
        >
          Volver
        </button>
      )}
      <button 
        className={`${styles.continueButton} ${isLoading ? styles.loading : ''}`} 
        onClick={handleContinue}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className={styles.loadingContent}>
            <span className={styles.spinner}></span>
            Guardando...
          </span>
        ) : (
          isLastStep ? 'Confirmar' : continueText
        )}
      </button>
    </div>
  );
};

export default ActionButtons;

