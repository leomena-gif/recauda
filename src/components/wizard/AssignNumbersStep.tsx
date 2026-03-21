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
}

export interface AssignNumbersStepRef {
  validateAndNext: () => void;
}

const AssignNumbersStep = forwardRef<AssignNumbersStepRef, AssignNumbersStepProps>(({ initialData, onNext }, ref) => {
  const [formData, setFormData] = useState<NumberAssignment>(
    initialData || { quantity: 10, autoAssign: true, fromNumber: '', toNumber: '' }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof NumberAssignment, string>>>({});

  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLongPressRef = useRef(false);

  const changeQuantity = (delta: number) => {
    setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity + delta) }));
  };

  const startPress = (delta: number) => {
    isLongPressRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      pressIntervalRef.current = setInterval(() => changeQuantity(delta), 80);
    }, 400);
  };

  const stopPress = () => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    if (pressIntervalRef.current) clearInterval(pressIntervalRef.current);
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === '+') { e.preventDefault(); changeQuantity(1); }
    else if (e.key === 'ArrowDown' || e.key === '-') { e.preventDefault(); changeQuantity(-1); }
  };

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseInt(e.target.value, 10);
    if (e.target.value === '') setFormData(prev => ({ ...prev, quantity: 0 }));
    else if (!isNaN(n) && n >= 1) setFormData(prev => ({ ...prev, quantity: n }));
  };

  const handleRangeChange = (field: 'fromNumber' | 'toNumber') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  useImperativeHandle(ref, () => ({
    validateAndNext: () => {
      const newErrors: Partial<Record<keyof NumberAssignment, string>> = {};
      if (!formData.autoAssign) {
        if (!formData.fromNumber.trim()) newErrors.fromNumber = 'El número inicial es requerido';
        if (!formData.toNumber.trim()) newErrors.toNumber = 'El número final es requerido';
      }
      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) onNext(formData);
    }
  }));

  return (
    <div className={styles.container}>
      <div className={styles.optionsCard}>

        {/* Cantidad */}
        <div className={styles.optionRow}>
          <span className={styles.optionIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </span>
          <span className={styles.optionLabel}>Cantidad</span>
          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.stepperBtn}
              onMouseDown={() => startPress(-1)}
              onMouseUp={stopPress}
              onMouseLeave={stopPress}
              onTouchStart={(e) => { e.preventDefault(); startPress(-1); }}
              onTouchEnd={stopPress}
              onClick={() => { if (!isLongPressRef.current) changeQuantity(-1); }}
              disabled={formData.quantity <= 1}
              aria-label="Reducir cantidad"
            >−</button>
            <input
              type="number"
              className={styles.stepperInput}
              value={formData.quantity || ''}
              onChange={handleQuantityInput}
              onKeyDown={handleQuantityKeyDown}
              onBlur={() => { if (formData.quantity <= 0) setFormData(prev => ({ ...prev, quantity: 1 })); }}
              min="1"
              aria-label="Cantidad"
            />
            <button
              type="button"
              className={styles.stepperBtn}
              onMouseDown={() => startPress(1)}
              onMouseUp={stopPress}
              onMouseLeave={stopPress}
              onTouchStart={(e) => { e.preventDefault(); startPress(1); }}
              onTouchEnd={stopPress}
              onClick={() => { if (!isLongPressRef.current) changeQuantity(1); }}
              aria-label="Aumentar cantidad"
            >+</button>
          </div>
        </div>

        <div className={styles.optionDivider} />

        {/* Asignación */}
        <div className={styles.optionRow}>
          <span className={styles.optionIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </span>
          <span className={styles.optionLabel}>Asignación</span>
          <div className={styles.segmented}>
            <button
              type="button"
              className={`${styles.segmentedBtn} ${formData.autoAssign ? styles.segmentedBtnActive : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, autoAssign: true }))}
            >Automática</button>
            <button
              type="button"
              className={`${styles.segmentedBtn} ${!formData.autoAssign ? styles.segmentedBtnActive : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, autoAssign: false }))}
            >Manual</button>
          </div>
        </div>

      </div>

      {!formData.autoAssign && (
        <div className={styles.rangeRow}>
          <div className={styles.field}>
            <span className={styles.label}>Desde</span>
            <input
              type="text"
              className={`${styles.input} ${errors.fromNumber ? styles.inputError : ''}`}
              value={formData.fromNumber}
              onChange={handleRangeChange('fromNumber')}
              placeholder="Ej: 001"
            />
            {errors.fromNumber && <span className={styles.errorText}>{errors.fromNumber}</span>}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Hasta</span>
            <input
              type="text"
              className={`${styles.input} ${errors.toNumber ? styles.inputError : ''}`}
              value={formData.toNumber}
              onChange={handleRangeChange('toNumber')}
              placeholder="Ej: 010"
            />
            {errors.toNumber && <span className={styles.errorText}>{errors.toNumber}</span>}
          </div>
        </div>
      )}
    </div>
  );
});

AssignNumbersStep.displayName = 'AssignNumbersStep';
export default AssignNumbersStep;
