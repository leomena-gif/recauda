'use client';

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import styles from './AssignNumbersStep.module.css';

interface NumberAssignment {
  quantity: number;
  autoAssign: boolean;
  fromNumber: string;
  toNumber: string;
}

interface AssignNumbersStepProps {
  initialData?: NumberAssignment;
  onNext: (data: NumberAssignment) => void;
  onBack: () => void;
}

export interface AssignNumbersStepRef {
  validateAndNext: () => void;
}

const AssignNumbersStep = forwardRef<AssignNumbersStepRef, AssignNumbersStepProps>(({ initialData, onNext, onBack }, ref) => {
  const [formData, setFormData] = useState<NumberAssignment>(
    initialData || {
      quantity: 10,
      autoAssign: true,
      fromNumber: '',
      toNumber: '',
    }
  );

  const [errors, setErrors] = useState<Partial<NumberAssignment>>({});

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, formData.quantity + delta);
    setFormData(prev => ({ ...prev, quantity: newQuantity }));
  };

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Permitir campo vacío temporalmente mientras el usuario escribe
    if (value === '') {
      setFormData(prev => ({ ...prev, quantity: 0 }));
      return;
    }
    
    const numValue = parseInt(value, 10);
    
    // Solo actualizar si es un número válido y mayor a 0
    if (!isNaN(numValue) && numValue >= 1) {
      setFormData(prev => ({ ...prev, quantity: numValue }));
    }
  };

  const handleQuantityBlur = () => {
    // Si el campo está vacío o es 0, establecer el mínimo valor (1)
    if (formData.quantity <= 0) {
      setFormData(prev => ({ ...prev, quantity: 1 }));
    }
  };

  const handleInputChange = (field: keyof NumberAssignment) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleToggleChange = () => {
    setFormData(prev => ({ ...prev, autoAssign: !prev.autoAssign }));
  };

  const handleNext = () => {
    const newErrors: Partial<NumberAssignment> = {};

    if (!formData.autoAssign) {
      if (!formData.fromNumber.trim()) {
        newErrors.fromNumber = 'El número inicial es requerido';
      }
      if (!formData.toNumber.trim()) {
        newErrors.toNumber = 'El número final es requerido';
      }
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
      <h1 className={styles.title}>Asignar números</h1>
      
      <div className={styles.formCard}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Cantidad</label>
          <div className={styles.quantitySelector}>
            <button 
              className={styles.quantityButton}
              onClick={() => handleQuantityChange(-1)}
              disabled={formData.quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              className={styles.quantityInput}
              value={formData.quantity || ''}
              onChange={handleQuantityInputChange}
              onBlur={handleQuantityBlur}
              min="1"
              placeholder="1"
            />
            <button 
              className={styles.quantityButton}
              onClick={() => handleQuantityChange(1)}
            >
              +
            </button>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.toggleContainer}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={formData.autoAssign}
                onChange={handleToggleChange}
                className={styles.toggleInput}
              />
              <span className={styles.toggleSlider}></span>
            </label>
            <span className={styles.toggleLabel}>Asignar automáticamente</span>
          </div>
        </div>

        {!formData.autoAssign && (
          <div className={styles.rangeFields}>
            <div className={`${styles.fieldGroup} ${errors.fromNumber ? styles.error : ''}`}>
              <label className={styles.label}>Desde</label>
              <input
                type="text"
                className={styles.input}
                value={formData.fromNumber}
                onChange={handleInputChange('fromNumber')}
                placeholder="Ej.: 001"
              />
            </div>

            <div className={`${styles.fieldGroup} ${errors.toNumber ? styles.error : ''}`}>
              <label className={styles.label}>Hasta</label>
              <input
                type="text"
                className={styles.input}
                value={formData.toNumber}
                onChange={handleInputChange('toNumber')}
                placeholder="Ej.:010"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

AssignNumbersStep.displayName = 'AssignNumbersStep';

export default AssignNumbersStep;
