'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ProgressIndicator from './ProgressIndicator';
import ActionButtons from './ActionButtons';
import SellerDataStep, { SellerDataStepRef } from './SellerDataStep';
import AssignNumbersStep, { AssignNumbersStepRef } from './AssignNumbersStep';
import ConfirmSellerStep from './ConfirmSellerStep';
import SuccessScreen from './SuccessScreen';
import styles from './AddSellerWizard.module.css';

interface SellerData {
  firstName: string;
  lastName: string;
  phone: string;
}

interface NumberAssignment {
  quantity: number;
  autoAssign: boolean;
  fromNumber: string;
  toNumber: string;
}

const AddSellerWizard: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [numberAssignment, setNumberAssignment] = useState<NumberAssignment | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Refs to trigger step validation
  const sellerDataStepRef = React.useRef<SellerDataStepRef>(null);
  const assignNumbersStepRef = React.useRef<AssignNumbersStepRef>(null);

  const totalSteps = 3;

  const handleSellerDataNext = (data: SellerData) => {
    setSellerData(data);
    setCurrentStep(2);
  };

  const handleNumberAssignmentNext = (data: NumberAssignment) => {
    setNumberAssignment(data);
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
        sellerDataStepRef.current?.validateAndNext();
        break;
      case 2:
        assignNumbersStepRef.current?.validateAndNext();
        break;
      default:
        break;
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically save the seller data to your backend
      console.log('Seller created:', { sellerData, numberAssignment });
      
      // Show success screen
      setIsConfirming(false);
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Error creating seller:', error);
      setIsConfirming(false);
    }
  };

  const handleAddAnother = () => {
    // Reset wizard to step 1
    setCurrentStep(1);
    setSellerData(null);
    setNumberAssignment(null);
    setShowSuccess(false);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SellerDataStep
            ref={sellerDataStepRef}
            initialData={sellerData || undefined}
            onNext={handleSellerDataNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <AssignNumbersStep
            ref={assignNumbersStepRef}
            initialData={numberAssignment || undefined}
            onNext={handleNumberAssignmentNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ConfirmSellerStep
            sellerData={sellerData!}
            numberAssignment={numberAssignment!}
            onConfirm={handleConfirm}
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
        return 'Datos del vendedor';
      case 2:
        return 'Asignar números';
      case 3:
        return 'Confirmar vendedor';
      default:
        return '';
    }
  };

  // Show success screen after confirmation
  if (showSuccess) {
    return (
      <div className={styles.wizardContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div className={styles.wizardContent}>
            <SuccessScreen onAddAnother={handleAddAnother} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.wizardContainer}>
      <Sidebar />
      <main className={styles.mainContent}>
        <div className={styles.wizardContent}>
          <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
          {renderCurrentStep()}
          <ActionButtons
            onBack={handleBack}
            onContinue={handleContinue}
            onConfirm={handleConfirm}
            showBack={true}
            isLastStep={currentStep === totalSteps}
            isLoading={isConfirming}
          />
        </div>
      </main>
    </div>
  );
};

export default AddSellerWizard;
