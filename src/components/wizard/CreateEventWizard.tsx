'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressIndicator from './ProgressIndicator';
import ActionButtons from './ActionButtons';
import EventTypeStep, { EventTypeStepRef } from './EventTypeStep';
import EventDataStep, { EventDataStepRef } from './EventDataStep';
import ConfirmEventStep from './ConfirmEventStep';
import EventSuccessScreen from './EventSuccessScreen';
import styles from './CreateEventWizard.module.css';

interface EventData {
  type: 'raffle' | 'food_sale';
  name: string;
  numberValue: string;
  totalNumbers: string;
  autoAdjust: boolean;
  startDate: string;
  endDate: string;
  prizes: string[];
}

const CreateEventWizard: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Refs to trigger step validation
  const eventTypeStepRef = React.useRef<EventTypeStepRef>(null);
  const eventDataStepRef = React.useRef<EventDataStepRef>(null);

  const totalSteps = 3;

  const handleEventTypeNext = (data: Pick<EventData, 'type'>) => {
    setEventData(prev => prev ? ({ ...prev, ...data }) : ({ ...data, name: '', numberValue: '', totalNumbers: '', autoAdjust: false, startDate: '', endDate: '', prizes: [] }));
    setCurrentStep(2);
  };

  const handleEventDataNext = (data: Omit<EventData, 'type'>) => {
    setEventData(prev => prev ? ({ ...prev, ...data }) : ({ type: 'raffle', ...data }));
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleContinue = () => {
    switch (currentStep) {
      case 1:
        eventTypeStepRef.current?.validateAndNext();
        break;
      case 2:
        eventDataStepRef.current?.validateAndNext();
        break;
      default:
        break;
    }
  };

  const handleCreateEvent = async () => {
    setIsCreating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically save the event data to your backend
      console.log('Event created:', eventData);
      
      // Show success screen
      setIsCreating(false);
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Error creating event:', error);
      setIsCreating(false);
    }
  };

  const handleBackToEvents = () => {
    router.push('/');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EventTypeStep
            ref={eventTypeStepRef}
            initialData={eventData || undefined}
            onNext={handleEventTypeNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <EventDataStep
            ref={eventDataStepRef}
            initialData={eventData || undefined}
            onNext={handleEventDataNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ConfirmEventStep
            eventData={eventData!}
            onCreate={handleCreateEvent}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Tipo de evento';
      case 2:
        return 'Datos generales';
      case 3:
        return 'Confirmar evento';
      default:
        return '';
    }
  };

  // Show success screen after creation
  if (showSuccess) {
    return (
      <div className={styles.wizardContainer}>
        <main className={styles.mainContent}>
          <div className={styles.wizardContent}>
            <EventSuccessScreen onBackToEvents={handleBackToEvents} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.wizardContainer}>
      <main className={styles.mainContent}>
        <div className={styles.wizardContent}>
          {/* Navigation - Only show on step 1 */}
          {currentStep === 1 && (
            <div className={styles.navigationContainer}>
              <button className={styles.backButton} onClick={handleBack}>
                <svg className={styles.chevronIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Volver a mis eventos
              </button>
            </div>
          )}
          
          <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
          {renderCurrentStep()}
          <ActionButtons
            onBack={handleBack}
            onContinue={handleContinue}
            onConfirm={handleCreateEvent}
            showBack={currentStep > 1}
            isLastStep={currentStep === totalSteps}
            isLoading={isCreating}
            continueText={currentStep === totalSteps ? 'Crear' : 'Continuar'}
          />
        </div>
      </main>
    </div>
  );
};

export default CreateEventWizard;
