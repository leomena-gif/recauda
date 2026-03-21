'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EventStatusFilter } from '@/types/models';
import { EVENT_FILTER_OPTIONS, ROUTES } from '@/constants';
import { MOCK_HOME_EVENTS } from '@/mocks/data';
import EventCard from '@/components/EventCard';
import CardEmptyState from '@/components/CardEmptyState';
import EventsEmptyState from '@/components/EventsEmptyState';
import SegmentedControl from '@/components/SegmentedControl';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<EventStatusFilter>('active');

  const filteredEvents = useMemo(() => {
    if (selectedFilter === 'past') {
      return MOCK_HOME_EVENTS.filter((event) => event.status === 'completed' || event.status === 'cancelled');
    }
    return MOCK_HOME_EVENTS.filter((event) => event.status === selectedFilter);
  }, [selectedFilter]);

  const hasEvents = MOCK_HOME_EVENTS.length > 0;
  const hasFilteredEvents = filteredEvents.length > 0;

  const handleCreateEvent = () => router.push(ROUTES.CREATE_EVENT);

  return (
    <>
      <div className="pageContainer">
        {/* Header - Desktop Only */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={`pageTitle ${styles.pageTitle}`}>Mis eventos</h1>
          </div>
          <div className={styles.headerActions}>
            <button className="btn btn-primary" onClick={handleCreateEvent}>
              Crear evento
            </button>
          </div>
        </div>

        {/* Filter */}
        {hasEvents && (
          <SegmentedControl
            options={EVENT_FILTER_OPTIONS}
            value={selectedFilter}
            onChange={(value) => setSelectedFilter(value as EventStatusFilter)}
          />
        )}

        {/* Events Grid */}
        {!hasEvents ? (
          <CardEmptyState onCreateEvent={handleCreateEvent} />
        ) : !hasFilteredEvents ? (
          <EventsEmptyState filterType={selectedFilter} />
        ) : (
          <div className="cardsContainer">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                name={event.name}
                status={event.status as 'active' | 'completed' | 'cancelled'}
                type={event.type as 'raffle' | 'food_sale'}
                collected={event.collected}
                goal={event.goal}
                soldUnits={event.soldUnits}
                totalUnits={event.totalUnits}
                dishes={event.dishes}
              />
            ))}
          </div>
        )}
      </div>

    </>
  );
}
