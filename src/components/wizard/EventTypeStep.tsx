'use client';

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import styles from './EventTypeStep.module.css';

export interface EventTypeStepRef {
  validateAndNext: () => void;
}

interface EventTypeStepProps {
  initialData?: {
    type?: 'raffle' | 'food_sale';
  };
  onNext: (data: { type: 'raffle' | 'food_sale' }) => void;
  onBack: () => void;
}

const EventTypeStep = forwardRef<EventTypeStepRef, EventTypeStepProps>(
  ({ initialData, onNext, onBack }, ref) => {
    const [selectedType, setSelectedType] = useState<'raffle' | 'food_sale'>(
      initialData?.type || 'raffle'
    );

    useImperativeHandle(ref, () => ({
      validateAndNext: () => {
        if (selectedType) {
          onNext({ type: selectedType });
        }
      },
    }));

    const handleTypeChange = (type: 'raffle' | 'food_sale') => {
      setSelectedType(type);
    };

    return (
      <div className={styles.container}>
        <h1 className={styles.title}>
          ¿Qué tipo de evento querés crear?
        </h1>
        
        <div className={styles.optionsGrid}>
          <div 
            className={`${styles.optionBox} ${selectedType === 'food_sale' ? styles.selected : ''}`}
            onClick={() => handleTypeChange('food_sale')}
          >
            <div className={styles.iconContainer}>
              <div className={styles.emojiIcon}>🍲</div>
            </div>
            <span className={styles.optionText}>Venta de comida</span>
          </div>
          
          <div 
            className={`${styles.optionBox} ${selectedType === 'raffle' ? styles.selected : ''}`}
            onClick={() => handleTypeChange('raffle')}
          >
            <div className={styles.iconContainer}>
              <div className={styles.emojiIcon}>🎁</div>
            </div>
            <span className={styles.optionText}>Sorteo</span>
          </div>
        </div>
      </div>
    );
  }
);

EventTypeStep.displayName = 'EventTypeStep';

export default EventTypeStep;
