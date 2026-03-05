'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EventStatusFilter } from '@/types/models';
import { EVENT_FILTER_OPTIONS, ROUTES } from '@/constants';
import { MOCK_HOME_EVENTS } from '@/mocks/data';
import CancelledEventCard from '@/components/CancelledEventCard';
import ActiveEventCard from '@/components/ActiveEventCard';
import FoodEventCard from '@/components/FoodEventCard';
import CompletedEventCard from '@/components/CompletedEventCard';
import CardEmptyState from '@/components/CardEmptyState';
import EventsEmptyState from '@/components/EventsEmptyState';
import RegisterSaleWizard from '@/components/wizard/RegisterSaleWizard';
import styles from './page.module.css';

// Map event status to the correct card component
const EVENT_CARD_MAP: Record<string, React.ComponentType<{ id?: string; title?: string; dishes?: { name: string; price: number }[]; collected?: number; goal?: number; soldUnits?: number; totalUnits?: number }>> = {
  active_raffle: ActiveEventCard,
  active_food_sale: FoodEventCard,
  cancelled: CancelledEventCard,
  completed: CompletedEventCard,
};

const getEventCardKey = (status: string, type: string): string => {
  if (status === 'active') return `active_${type}`;
  return status;
};

export default function Home() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<EventStatusFilter>('active');
  const [isSaleWizardOpen, setIsSaleWizardOpen] = useState(false);

  const filteredEvents = useMemo(() => {
    if (selectedFilter === 'all') return MOCK_HOME_EVENTS;
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
            <button className="btn btn-secondary" onClick={() => setIsSaleWizardOpen(true)}>
              Registrar venta
            </button>
            <button className="btn btn-primary" onClick={handleCreateEvent}>
              Crear evento
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        {hasEvents && (
          <div className={styles.filtersContainer}>
            <div className={styles.pillsGroup}>
              {EVENT_FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`${styles.pill} ${selectedFilter === option.value ? styles.pillActive : ''}`}
                  onClick={() => setSelectedFilter(option.value as EventStatusFilter)}
                >
                  <span className={styles.pillText}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Events Grid */}
        {!hasEvents ? (
          <CardEmptyState onCreateEvent={handleCreateEvent} />
        ) : !hasFilteredEvents ? (
          <EventsEmptyState filterType={selectedFilter} />
        ) : (
          <div className="cardsContainer">
            {filteredEvents.map((event) => {
              const cardKey = getEventCardKey(event.status, event.type);
              const EventCard = EVENT_CARD_MAP[cardKey];
              if (!EventCard) return null;

              if (event.type === 'food_sale' && event.dishes) {
                return <EventCard key={event.id} id={event.id} title={event.name} dishes={event.dishes} />;
              }
              return <EventCard key={event.id} collected={event.collected} goal={event.goal} soldUnits={event.soldUnits} totalUnits={event.totalUnits} />;
            })}
          </div>
        )}
      </div>

      {/* Register Sale Button - Fixed at bottom (mobile only) */}
      <div className={styles.bottomButtonContainer}>
        <button
          className={`${styles.registerSaleButton} btn btn-full`}
          onClick={() => setIsSaleWizardOpen(true)}
        >
          Registrar venta
        </button>
      </div>

      {/* Register Sale Wizard — responsive (Sheet on mobile, Modal on desktop) */}
      <RegisterSaleWizard
        isOpen={isSaleWizardOpen}
        onClose={() => setIsSaleWizardOpen(false)}
        events={MOCK_HOME_EVENTS}
      />
    </>
  );
}
