'use client';

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import styles from './SellerDataStep.module.css';

interface SellerData {
  firstName: string;
  lastName: string;
  phone: string;
}

interface SellerDataStepProps {
  initialData?: SellerData;
  onNext: (data: SellerData) => void;
  onBack: () => void;
}

export interface SellerDataStepRef {
  validateAndNext: () => void;
}

const SellerDataStep = forwardRef<SellerDataStepRef, SellerDataStepProps>(({ initialData, onNext, onBack }, ref) => {
  const [formData, setFormData] = useState<SellerData>(
    initialData || {
      firstName: '',
      lastName: '',
      phone: '',
    }
  );

  const [errors, setErrors] = useState<Partial<SellerData>>({});

  const handleInputChange = (field: keyof SellerData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = () => {
    const newErrors: Partial<SellerData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext(formData);
    }
  };

  useImperativeHandle(ref, () => ({
    validateAndNext: handleNext
  }));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Datos del vendedor</h1>
      
      <div className={styles.formCard}>
        <div className={`${styles.fieldGroup} ${errors.firstName ? styles.error : ''}`}>
          <label className={styles.label}>Nombre</label>
          <input
            type="text"
            className={styles.input}
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            placeholder="Ej: Leonardo"
          />
        </div>

        <div className={`${styles.fieldGroup} ${errors.lastName ? styles.error : ''}`}>
          <label className={styles.label}>Apellido</label>
          <input
            type="text"
            className={styles.input}
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            placeholder="Ej: Mena"
          />
        </div>

        <div className={`${styles.fieldGroup} ${errors.phone ? styles.error : ''}`}>
          <label className={styles.label}>Teléfono</label>
          <input
            type="tel"
            className={styles.input}
            value={formData.phone}
            onChange={handleInputChange('phone')}
            placeholder="Ej: 3584129488"
          />
          <p className={styles.instruction}>
            Escribe el número sin 0 y sin 15
          </p>
        </div>
      </div>
    </div>
  );
});

SellerDataStep.displayName = 'SellerDataStep';

export default SellerDataStep;
