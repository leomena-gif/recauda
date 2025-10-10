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
        
        <div className={styles.optionsCard}>
          <div className={styles.optionItem}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="eventType"
                value="food_sale"
                checked={selectedType === 'food_sale'}
                onChange={() => handleTypeChange('food_sale')}
                className={styles.radioInput}
              />
              <span className={styles.radioCustom}></span>
              <span className={styles.optionText}>Venta de comida</span>
            </label>
          </div>
          
          <div className={styles.optionItem}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="eventType"
                value="raffle"
                checked={selectedType === 'raffle'}
                onChange={() => handleTypeChange('raffle')}
                className={styles.radioInput}
              />
              <span className={styles.radioCustom}></span>
              <span className={styles.optionText}>Sorteo</span>
            </label>
          </div>
        </div>
      </div>
    );
  }
);

EventTypeStep.displayName = 'EventTypeStep';

export default EventTypeStep;
