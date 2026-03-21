'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { EventStatusFilter } from '@/types/models';
import { ROUTES } from '@/constants';
import styles from './EventsEmptyState.module.css';
import Card from './Card';
import Button from './Button';

interface EventsEmptyStateProps {
  filterType?: EventStatusFilter;
}

const EMPTY_STATE_CONFIG = {
  active: {
    emoji: '✅',
    message: 'No tienes eventos activos',
    showButton: true,
  },
  past: {
    emoji: '🏁',
    message: 'No tienes eventos pasados',
    showButton: false,
  },
};

const EventsEmptyState: React.FC<EventsEmptyStateProps> = ({ filterType = 'all' }) => {
  const router = useRouter();
  const config = EMPTY_STATE_CONFIG[filterType as keyof typeof EMPTY_STATE_CONFIG] ?? EMPTY_STATE_CONFIG.all;

  const handleCreateEvent = () => {
    router.push(ROUTES.CREATE_EVENT);
  };

  return (
    <Card
      fullWidth
      style={{ minHeight: '300px', alignItems: 'center', justifyContent: 'center' }}
    >
      <div className={styles.emptyState}>
        <div className={styles.flagIcon}>{config.emoji}</div>
        <p className={styles.message}>{config.message}</p>
        {config.showButton && (
          <Button variant="primary" size="md" type="button" onClick={handleCreateEvent}>
            Crear evento
          </Button>
        )}
      </div>
    </Card>
  );
};

export default EventsEmptyState;
