'use client';

import React from 'react';
import styles from './CardEmptyState.module.css';
import Card from './Card';
import Button from './Button';

interface CardEmptyStateProps {
  onCreateEvent?: () => void;
}

const CardEmptyState: React.FC<CardEmptyStateProps> = ({ onCreateEvent }) => {
  return (
    <Card
      fullWidth
      style={{ minHeight: '300px', alignItems: 'center', justifyContent: 'center' }}
    >
      <div className={styles.emptyState}>
        <div className={styles.flagIcon}>🏁</div>
        <p className={styles.message}>Comencemos creando tu primer evento</p>
        <Button variant="primary" size="md" type="button" onClick={onCreateEvent}>
          Crear evento
        </Button>
      </div>
    </Card>
  );
};

export default CardEmptyState;
