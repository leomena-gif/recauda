'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { EventStatusFilter } from '@/types/models';
import { ROUTES } from '@/constants';
import styles from './EventsEmptyState.module.css';

interface EventsEmptyStateProps {
  filterType?: EventStatusFilter;
}

const EMPTY_STATE_CONFIG = {
  all: {
    emoji: '🏁',
    message: 'Comencemos creando tu primer evento',
    showButton: true,
  },
  active: {
    emoji: '✅',
    message: 'No tienes eventos en estado ACTIVO',
    showButton: true,
  },
  completed: {
    emoji: '🏁',
    message: 'No tienes eventos en estado FINALIZADO',
    showButton: false,
  },
  cancelled: {
    emoji: '🚫',
    message: 'No tienes eventos en estado CANCELADO',
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
    <div className={styles.container}>
      <div className={styles.emptyState}>
        <div className={styles.flagIcon}>{config.emoji}</div>
        <p className={styles.message}>{config.message}</p>
        {config.showButton && (
          <button className={styles.createButton} onClick={handleCreateEvent}>
            Crear evento
          </button>
        )}
      </div>
    </div>
  );
};

export default EventsEmptyState;
