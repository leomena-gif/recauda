'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import EventTypeStep from './EventTypeStep';
import EventDataStep, { EventDataStepRef } from './EventDataStep';
import EventSuccessScreen from './EventSuccessScreen';
import styles from './CreateEventForm.module.css';

export interface FoodItem {
  name: string;
  price: string;
  closed?: boolean;
  sold?: number;
  total?: number;
}

interface EventData {
  type: 'raffle' | 'food_sale';
  name: string;
  numberValue?: string;
  totalNumbers?: string;
  autoAdjust?: boolean;
  prizes?: string[];
  foodItems?: FoodItem[];
  startDate: Date | null;
  endDate: Date | null;
}

const CreateEventForm: React.FC = () => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'raffle' | 'food_sale'>('raffle');
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const eventDataStepRef = React.useRef<EventDataStepRef>(null);

  const handleTypeChange = (type: 'raffle' | 'food_sale') => {
    setSelectedType(type);
  };

  const handleEventDataNext = (data: Omit<EventData, 'type'>) => {
    const fullData: EventData = { ...data, type: selectedType };
    void handleCreateEvent(fullData);
  };

  const handleCreateEvent = async (data: EventData) => {
    setIsCreating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // TODO: Replace with API call to save event data
      void data;
      setIsCreating(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating event:', error);
      setIsCreating(false);
    }
  };

  const handleSubmit = () => {
    eventDataStepRef.current?.validateAndNext();
  };

  const handleBackToEvents = () => {
    router.push('/');
  };

  if (showSuccess) {
    return (
      <div className="pageContainer">
        <EventSuccessScreen onBackToEvents={handleBackToEvents} />
      </div>
    );
  }

  return (
    <div className="pageContainer">

      <div className={styles.navigationContainer}>
        <button className={styles.backButton} onClick={handleBackToEvents}>
          <svg className={styles.chevronIcon} width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Mis eventos
        </button>
      </div>

      <h1 className={styles.pageTitle}>Crear evento</h1>

      <div className={styles.twoColumnLayout}>
        <div className={styles.leftColumn}>
          <EventTypeStep
            selectedType={selectedType}
            onChange={handleTypeChange}
          />
        </div>

        <div className={styles.rightColumn}>
          <EventDataStep
            key={selectedType}
            ref={eventDataStepRef}
            initialData={{ type: selectedType }}
            onNext={handleEventDataNext}
            onBack={handleBackToEvents}
          />

          <div className={styles.submitArea}>
            <button
              className={`btn btn-primary ${isCreating ? styles.loading : ''}`}
              onClick={handleSubmit}
              disabled={isCreating}
            >
              {isCreating ? (
                <span className={styles.loadingContent}>
                  <span className={styles.spinner} />
                  Guardando...
                </span>
              ) : (
                'Crear evento'
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CreateEventForm;
