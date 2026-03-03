'use client';

import React from 'react';
import styles from './ProgressIndicator.module.css';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels = ['Tipo', 'Datos', 'Confirmar'],
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.stepsRow}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <React.Fragment key={index}>
              <div className={styles.step}>
                <div
                  className={`${styles.stepCircle} ${
                    isCompleted ? styles.completed : isActive ? styles.active : styles.pending
                  }`}
                >
                  {isCompleted ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                <span
                  className={`${styles.stepLabel} ${
                    isActive || isCompleted ? styles.stepLabelActive : ''
                  }`}
                >
                  {stepLabels[index] ?? `Paso ${stepNumber}`}
                </span>
              </div>

              {index < totalSteps - 1 && (
                <div
                  className={`${styles.connector} ${
                    stepNumber < currentStep ? styles.connectorCompleted : ''
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
