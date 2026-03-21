'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SuccessScreen from './SuccessScreen';
import styles from './AddSellerWizard.module.css';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  quantity: number;
  autoAssign: boolean;
  fromNumber: string;
  toNumber: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const AddSellerWizard: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    quantity: 10,
    autoAssign: true,
    fromNumber: '',
    toNumber: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Long-press refs for quantity stepper
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLongPressRef = useRef(false);

  const set = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const changeQuantity = (delta: number) =>
    setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity + delta) }));

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

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseInt(e.target.value, 10);
    if (e.target.value === '') setFormData(prev => ({ ...prev, quantity: 0 }));
    else if (!isNaN(n) && n >= 1) setFormData(prev => ({ ...prev, quantity: n }));
  };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
    if (!formData.autoAssign) {
      if (!formData.fromNumber.trim()) newErrors.fromNumber = 'El número inicial es requerido';
      if (!formData.toNumber.trim()) newErrors.toNumber = 'El número final es requerido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsCreating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // TODO: Replace with API call
      void formData;
      setIsCreating(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating seller:', error);
      setIsCreating(false);
    }
  };

  const handleAddAnother = () => {
    setFormData({ firstName: '', lastName: '', phone: '', quantity: 10, autoAssign: true, fromNumber: '', toNumber: '' });
    setErrors({});
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <div className="pageContainer">
        <SuccessScreen onAddAnother={handleAddAnother} />
      </div>
    );
  }

  return (
    <div className="pageContainer">

      <div className={styles.navigationContainer}>
        <button className={styles.backButton} onClick={() => router.push('/sellers-list')}>
          <svg className={styles.chevronIcon} width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver a vendedores
        </button>
      </div>

      <h1 className={styles.pageTitle}>Agregar vendedor</h1>

      <div className={styles.formContainer}>

        <div className={styles.dataSection}>
          <div className={styles.dataRow}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Nombre</span>
              <input
                type="text"
                className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                value={formData.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                placeholder="Ej: Leonardo"
              />
              {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Apellido</span>
              <input
                type="text"
                className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                value={formData.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                placeholder="Ej: Mena"
              />
              {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Teléfono</span>
              <input
                type="tel"
                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                value={formData.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="Ej: 3584129488"
              />
              {errors.phone
                ? <span className={styles.errorText}>{errors.phone}</span>
                : <span className={styles.hint}>Sin 0 y sin 15</span>
              }
            </div>
          </div>
        </div>

        <div className={styles.numbersSection}>
          <p className={styles.sectionLabel}>Asignación de números</p>

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
                  aria-label="Reducir"
                >−</button>
                <input
                  type="number"
                  className={styles.stepperInput}
                  value={formData.quantity || ''}
                  onChange={handleQuantityInput}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp' || e.key === '+') { e.preventDefault(); changeQuantity(1); }
                    else if (e.key === 'ArrowDown' || e.key === '-') { e.preventDefault(); changeQuantity(-1); }
                  }}
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
                  aria-label="Aumentar"
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
              <div className={styles.optionControl}>
                <div className={styles.segmented}>
                  <button
                    type="button"
                    className={`${styles.segmentedBtn} ${formData.autoAssign ? styles.segmentedBtnActive : ''}`}
                    onClick={() => set('autoAssign', true)}
                  >Automática</button>
                  <button
                    type="button"
                    className={`${styles.segmentedBtn} ${!formData.autoAssign ? styles.segmentedBtnActive : ''}`}
                    onClick={() => set('autoAssign', false)}
                  >Manual</button>
                </div>
                {!formData.autoAssign && (
                  <div className={styles.rangeRow}>
                    <div className={styles.rangeField}>
                      <span className={styles.fieldLabel}>Desde</span>
                      <input
                        type="text"
                        className={`${styles.inlineInput} ${errors.fromNumber ? styles.inlineInputError : ''}`}
                        value={formData.fromNumber}
                        onChange={(e) => set('fromNumber', e.target.value)}
                        placeholder="001"
                        autoFocus
                      />
                      {errors.fromNumber && <span className={styles.inlineError}>{errors.fromNumber}</span>}
                    </div>
                    <div className={styles.rangeField}>
                      <span className={styles.fieldLabel}>Hasta</span>
                      <input
                        type="text"
                        className={`${styles.inlineInput} ${errors.toNumber ? styles.inlineInputError : ''}`}
                        value={formData.toNumber}
                        onChange={(e) => set('toNumber', e.target.value)}
                        placeholder="010"
                      />
                      {errors.toNumber && <span className={styles.inlineError}>{errors.toNumber}</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

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
              'Agregar vendedor'
            )}
          </button>
        </div>

      </div>

    </div>
  );
};

export default AddSellerWizard;
