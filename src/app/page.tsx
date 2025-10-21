'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EventStatusFilter } from '@/types/models';
import { EVENT_FILTER_OPTIONS } from '@/constants';
import BlockedEventCard from '@/components/BlockedEventCard';
import ActiveEventCard from '@/components/ActiveEventCard';
import CompletedEventCard from '@/components/CompletedEventCard';
import CardEmptyState from '@/components/CardEmptyState';
import EventsEmptyState from '@/components/EventsEmptyState';
import styles from './page.module.css';

// Mock events data - TODO: Replace with API
const MOCK_EVENTS = [
  { id: '1', status: 'active', component: ActiveEventCard },
  { id: '2', status: 'active', component: ActiveEventCard },
  { id: '3', status: 'blocked', component: BlockedEventCard },
  { id: '4', status: 'completed', component: CompletedEventCard },
  { id: '5', status: 'completed', component: CompletedEventCard },
];

export default function Home() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<EventStatusFilter>('all');

  const handleCreateEvent = () => {
    router.push('/create-event');
  };

  // Filter events based on selected pill
  const filteredEvents = useMemo(() => {
    if (selectedFilter === 'all') {
      return MOCK_EVENTS;
    }
    return MOCK_EVENTS.filter(event => event.status === selectedFilter);
  }, [selectedFilter]);

  // Count events by status for pill badges (optional future enhancement)
  const eventCounts = useMemo(() => {
    return {
      all: MOCK_EVENTS.length,
      active: MOCK_EVENTS.filter(e => e.status === 'active').length,
      completed: MOCK_EVENTS.filter(e => e.status === 'completed').length,
      blocked: MOCK_EVENTS.filter(e => e.status === 'blocked').length,
    };
  }, []);

  const hasEvents = MOCK_EVENTS.length > 0;
  const hasFilteredEvents = filteredEvents.length > 0;

  return (
    <div className="pageContainer">
      <div className={styles.headerContainer}>
        <div className={styles.titleSection}>
          <h1 className="pageTitle">Mis eventos</h1>
        </div>
        <div className={styles.headerActions}>
          <button
            className="btn btn-primary"
            onClick={handleCreateEvent}
          >
            Crear evento
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      {hasEvents && (
        <div className={styles.filtersContainer}>
          <div className={styles.pillsGroup}>
            {EVENT_FILTER_OPTIONS.map((option) => {
              const count = eventCounts[option.value as keyof typeof eventCounts];
              return (
                <button
                  key={option.value}
                  className={`${styles.pill} ${
                    selectedFilter === option.value ? styles.pillActive : ''
                  }`}
                  onClick={() => setSelectedFilter(option.value as EventStatusFilter)}
                >
                  <span className={styles.pillText}>{option.label}</span>
                  <span className={styles.pillBadge}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Events Grid */}
      {!hasEvents ? (
        <CardEmptyState />
      ) : !hasFilteredEvents ? (
        <EventsEmptyState filterType={selectedFilter} />
      ) : (
        <div className="cardsContainer">
          {filteredEvents.map((event) => {
            const EventComponent = event.component;
            return <EventComponent key={event.id} />;
          })}
        </div>
      )}
    </div>
  );
}
