'use client';

import React, { useState, useImperativeHandle, forwardRef, useRef } from 'react';
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

  // Refs for long-press continuous increment/decrement
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLongPressRef = useRef(false);

  // Functional update avoids stale closure inside setInterval
  const handleQuantityChange = (delta: number) => {
    setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity + delta) }));
  };

  // Start long-press: after 400ms hold, fire every 80ms
  const startPress = (delta: number) => {
    isLongPressRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      pressIntervalRef.current = setInterval(() => handleQuantityChange(delta), 80);
    }, 400);
  };

  const stopPress = () => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    if (pressIntervalRef.current) clearInterval(pressIntervalRef.current);
  };

  // Keyboard: ↑/+ increment, ↓/- decrement
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === '+') {
      e.preventDefault();
      handleQuantityChange(1);
    } else if (e.key === 'ArrowDown' || e.key === '-') {
      e.preventDefault();
      handleQuantityChange(-1);
    }
  };

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setFormData(prev => ({ ...prev, quantity: 0 }));
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1) {
      setFormData(prev => ({ ...prev, quantity: numValue }));
    }
  };

  const handleQuantityBlur = () => {
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
              onMouseDown={() => startPress(-1)}
              onMouseUp={stopPress}
              onMouseLeave={stopPress}
              onTouchStart={(e) => { e.preventDefault(); startPress(-1); }}
              onTouchEnd={stopPress}
              onClick={() => { if (!isLongPressRef.current) handleQuantityChange(-1); }}
              disabled={formData.quantity <= 1}
              aria-label="Reducir cantidad"
            >
              −
            </button>
            <input
              type="number"
              className={styles.quantityInput}
              value={formData.quantity || ''}
              onChange={handleQuantityInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleQuantityBlur}
              min="1"
              placeholder="1"
              aria-label="Cantidad"
            />
            <button
              className={styles.quantityButton}
              onMouseDown={() => startPress(1)}
              onMouseUp={stopPress}
              onMouseLeave={stopPress}
              onTouchStart={(e) => { e.preventDefault(); startPress(1); }}
              onTouchEnd={stopPress}
              onClick={() => { if (!isLongPressRef.current) handleQuantityChange(1); }}
              aria-label="Aumentar cantidad"
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
