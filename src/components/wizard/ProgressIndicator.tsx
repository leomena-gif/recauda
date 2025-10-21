'use client';

import React from 'react';
import styles from './ProgressIndicator.module.css';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className={styles.container}>
      <div className={styles.progressBars}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`${styles.progressBar} ${
              index < currentStep ? styles.active : styles.inactive
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;

