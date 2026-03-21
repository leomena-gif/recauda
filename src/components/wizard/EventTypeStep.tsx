'use client';

import React from 'react';
import styles from './EventTypeStep.module.css';

interface EventTypeStepProps {
  selectedType: 'raffle' | 'food_sale';
  onChange: (type: 'raffle' | 'food_sale') => void;
}

const RaffleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V22H4V12"/>
    <path d="M22 7H2v5h20V7z"/>
    <path d="M12 22V7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);

const FoodIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const EventTypeStep: React.FC<EventTypeStepProps> = ({ selectedType, onChange }) => {
  return (
    <div className={styles.container}>
      <p className={styles.sectionLabel}>Tipo de evento</p>

      <div className={styles.optionsGrid}>
        {([
          { type: 'raffle', label: 'Sorteo', Icon: RaffleIcon },
          { type: 'food_sale', label: 'Venta de comida', Icon: FoodIcon },
        ] as const).map(({ type, label, Icon }) => {
          const isSelected = selectedType === type;
          return (
            <div
              key={type}
              className={`${styles.optionBox} ${isSelected ? styles.selected : ''}`}
              onClick={() => onChange(type)}
            >
              <div className={`${styles.iconWrap} ${isSelected ? styles.iconWrapSelected : ''}`}>
                <Icon />
              </div>
              <span className={styles.optionText}>{label}</span>
              <div className={`${styles.radio} ${isSelected ? styles.radioSelected : ''}`}>
                {isSelected && <CheckIcon />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventTypeStep;
