'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import BlockedEventCard from '@/components/BlockedEventCard';
import ActiveEventCard from '@/components/ActiveEventCard';
import CompletedEventCard from '@/components/CompletedEventCard';
import CardEmptyState from '@/components/CardEmptyState';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  const handleCreateEvent = () => {
    router.push('/create-event');
  };

  return (
    <div className="pageContainer">
      <div className={styles.headerContainer}>
        <div className={styles.titleSection}>
          <h1 className="pageTitle">Mis eventos</h1>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.createEventButton}
            onClick={handleCreateEvent}
          >
            <span>Crear evento</span>
          </button>
        </div>
      </div>
      <div className="cardsContainer">
        <ActiveEventCard />
        <BlockedEventCard />
        <CompletedEventCard />
        <CardEmptyState />
      </div>
    </div>
  );
}
