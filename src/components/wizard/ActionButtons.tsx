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
          <svg className={styles.chevronIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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

