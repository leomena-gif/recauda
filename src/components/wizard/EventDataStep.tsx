'use client';

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import DatePicker from '@/components/DatePicker';
import type { FoodItem } from './CreateEventWizard';
import styles from './EventDataStep.module.css';

export interface EventDataStepRef {
  validateAndNext: () => void;
}

interface EventDataStepProps {
  initialData?: {
    type?: 'raffle' | 'food_sale';
    name?: string;
    numberValue?: string;
    totalNumbers?: string;
    autoAdjust?: boolean;
    startDate?: string | Date | null;
    endDate?: string | Date | null;
    prizes?: string[];
    foodItems?: FoodItem[];
  };
  onNext: (data: {
    name: string;
    numberValue?: string;
    totalNumbers?: string;
    autoAdjust?: boolean;
    startDate: Date | null;
    endDate: Date | null;
    prizes?: string[];
    foodItems?: FoodItem[];
  }) => void;
  onBack: () => void;
}

const EventDataStep = forwardRef<EventDataStepRef, EventDataStepProps>(
  ({ initialData, onNext, onBack }, ref) => {
    const eventType = initialData?.type || 'raffle';
    const isFoodSale = eventType === 'food_sale';
    
    const [formData, setFormData] = useState({
      name: initialData?.name || '',
      numberValue: initialData?.numberValue || '',
      totalNumbers: initialData?.totalNumbers || '',
      autoAdjust: initialData?.autoAdjust ?? true,
      startDate: (initialData?.startDate instanceof Date ? initialData.startDate : null),
      endDate: (initialData?.endDate instanceof Date ? initialData.endDate : null),
      prizes: initialData?.prizes && initialData.prizes.length > 0 ? initialData.prizes : [''],
      foodItems: initialData?.foodItems && initialData.foodItems.length > 0 ? initialData.foodItems : [{ name: '', price: '' }],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useImperativeHandle(ref, () => ({
      validateAndNext: () => {
        const newErrors: Record<string, string> = {};

        // Common validation
        if (!formData.name.trim()) {
          newErrors.name = 'El nombre del evento es requerido';
        }

        if (!formData.startDate) {
          newErrors.startDate = 'La fecha de inicio es requerida';
        }

        if (!formData.endDate) {
          newErrors.endDate = 'La fecha de finalización es requerida';
        }

        // Type-specific validation
        if (isFoodSale) {
          // Validate food items
          formData.foodItems.forEach((item, index) => {
            if (!item.name.trim()) {
              newErrors[`foodItem_${index}_name`] = 'El nombre del plato es requerido';
            }
            if (!item.price.trim()) {
              newErrors[`foodItem_${index}_price`] = 'El precio es requerido';
            }
          });
        } else {
          // Raffle-specific validation
          if (!formData.numberValue.trim()) {
            newErrors.numberValue = 'El valor del número es requerido';
          }

          if (!formData.autoAdjust && !formData.totalNumbers.trim()) {
            newErrors.totalNumbers = 'La cantidad total de números es requerida';
          }
        }

        if (Object.keys(newErrors).length === 0) {
          // Return only relevant fields based on type
          if (isFoodSale) {
            onNext({
              name: formData.name,
              startDate: formData.startDate,
              endDate: formData.endDate,
              foodItems: formData.foodItems,
            });
          } else {
            onNext({
              name: formData.name,
              numberValue: formData.numberValue,
              totalNumbers: formData.totalNumbers,
              autoAdjust: formData.autoAdjust,
              startDate: formData.startDate,
              endDate: formData.endDate,
              prizes: formData.prizes,
            });
          }
        } else {
          setErrors(newErrors);
        }
      },
    }));

    const handleInputChange = (field: string, value: string | boolean | Date | null) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

    const handleAddPrize = () => {
      if (formData.prizes.length < 10) {
        setFormData(prev => ({
          ...prev,
          prizes: [...prev.prizes, '']
        }));
      }
    };
    
    const getPrizeLabel = (index: number): string => {
      const labels = [
        'Primer premio',
        'Segundo premio',
        'Tercer premio',
        'Cuarto premio',
        'Quinto premio',
        'Sexto premio',
        'Séptimo premio',
        'Octavo premio',
        'Noveno premio',
        'Décimo premio'
      ];
      return labels[index] || `Premio ${index + 1}`;
    };

    const handlePrizeChange = (index: number, value: string) => {
      setFormData(prev => ({
        ...prev,
        prizes: prev.prizes.map((prize, i) => i === index ? value : prize)
      }));
    };

    const handleRemovePrize = (index: number) => {
      setFormData(prev => ({
        ...prev,
        prizes: prev.prizes.filter((_, i) => i !== index)
      }));
    };

    // Food items handlers
    const handleAddFoodItem = () => {
      if (formData.foodItems.length < 20) {
        setFormData(prev => ({
          ...prev,
          foodItems: [...prev.foodItems, { name: '', price: '' }]
        }));
      }
    };

    const handleFoodItemChange = (index: number, field: 'name' | 'price', value: string) => {
      setFormData(prev => ({
        ...prev,
        foodItems: prev.foodItems.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }));
      // Clear errors for this specific field
      const errorKey = `foodItem_${index}_${field}`;
      if (errors[errorKey]) {
        setErrors(prev => ({ ...prev, [errorKey]: '' }));
      }
    };

    const handleRemoveFoodItem = (index: number) => {
      if (formData.foodItems.length > 1) {
        setFormData(prev => ({
          ...prev,
          foodItems: prev.foodItems.filter((_, i) => i !== index)
        }));
      }
    };

    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Datos Generales</h1>
        
        <div className={styles.formCard}>
            {/* Event Name - Always visible */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Nombre del evento</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                placeholder={isFoodSale ? "Ej: Venta de pollo asado" : "Ej: Rifa Aniversario del Club"}
              />
              {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>

            {/* Raffle-specific fields */}
            {!isFoodSale && (
              <>
                <div className={styles.twoColumnRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Valor del número</label>
                    <input
                      type="text"
                      value={formData.numberValue}
                      onChange={(e) => handleInputChange('numberValue', e.target.value)}
                      className={`${styles.input} ${errors.numberValue ? styles.inputError : ''}`}
                      placeholder="Ej: $500"
                    />
                    {errors.numberValue && <span className={styles.errorText}>{errors.numberValue}</span>}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Cantidad de números totales (opcional)</label>
                    <input
                      type="text"
                      value={formData.totalNumbers}
                      onChange={(e) => handleInputChange('totalNumbers', e.target.value)}
                      className={`${styles.input} ${errors.totalNumbers ? styles.inputError : ''}`}
                      placeholder="Ej: 1000"
                      disabled={formData.autoAdjust}
                    />
                    {errors.totalNumbers && <span className={styles.errorText}>{errors.totalNumbers}</span>}
                  </div>
                </div>

                <div className={`${styles.fieldGroup} ${styles.toggleFieldGroup}`}>
                  <div className={styles.toggleContainer}>
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={formData.autoAdjust}
                        onChange={(e) => handleInputChange('autoAdjust', e.target.checked)}
                        className={styles.toggleInput}
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                    <span className={styles.toggleLabel}>
                      Calcular cantidad total automáticamente
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className={styles.dateRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Fecha de inicio</label>
                <DatePicker
                  selected={formData.startDate}
                  onChange={(date) => handleInputChange('startDate', date)}
                  placeholder="DD/MM/AA"
                  error={!!errors.startDate}
                />
                {errors.startDate && <span className={styles.errorText}>{errors.startDate}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Fecha de finalización</label>
                <DatePicker
                  selected={formData.endDate}
                  onChange={(date) => handleInputChange('endDate', date)}
                  placeholder="DD/MM/AA"
                  error={!!errors.endDate}
                />
                {errors.endDate && <span className={styles.errorText}>{errors.endDate}</span>}
              </div>
            </div>

            {/* Prizes section for raffles */}
            {!isFoodSale && (
              <div className={styles.prizesSection}>
                <h2 className={styles.sectionLabel}>🏆 Premios</h2>
                
                {formData.prizes.map((prize, index) => (
                  <div key={index} className={styles.prizeItemWrapper}>
                    <label className={styles.label}>
                      {getPrizeLabel(index)}
                    </label>
                    <div className={styles.prizeItem}>
                      <input
                        type="text"
                        value={prize}
                        onChange={(e) => handlePrizeChange(index, e.target.value)}
                        className={styles.input}
                        placeholder={index === 0 ? "Ej: Bicicleta rodado 29" : index === 1 ? "Ej: Smart TV 50 pulgadas" : "Ej: Vale de compra $10.000"}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePrize(index)}
                        className={styles.removePrizeButton}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddPrize}
                  className={`btn btn-tertiary btn-full ${styles.addPrizeButton}`}
                  disabled={formData.prizes.length >= 10}
                >
                  Agregar premio {formData.prizes.length >= 10 ? '(máximo 10)' : ''}
                </button>
              </div>
            )}

            {/* Food items section for food sales */}
            {isFoodSale && (
              <div className={styles.prizesSection}>
                <h2 className={styles.sectionLabel}>🍽️ Menú</h2>
                
                {formData.foodItems.map((item, index) => (
                  <div key={index} className={styles.foodItemWrapper}>
                    <label className={styles.label}>
                      Plato {index + 1}
                    </label>
                    <div className={styles.foodItemRow}>
                      <div className={styles.foodItemName}>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleFoodItemChange(index, 'name', e.target.value)}
                          className={`${styles.input} ${errors[`foodItem_${index}_name`] ? styles.inputError : ''}`}
                          placeholder={index === 0 ? "Ej: Pollo asado con papas" : index === 1 ? "Ej: Empanadas de carne" : "Ej: Locro"}
                        />
                        {errors[`foodItem_${index}_name`] && <span className={styles.errorText}>{errors[`foodItem_${index}_name`]}</span>}
                      </div>
                      <div className={styles.foodItemPrice}>
                        <input
                          type="text"
                          value={item.price}
                          onChange={(e) => handleFoodItemChange(index, 'price', e.target.value)}
                          className={`${styles.input} ${errors[`foodItem_${index}_price`] ? styles.inputError : ''}`}
                          placeholder="Ej: $3500"
                        />
                        {errors[`foodItem_${index}_price`] && <span className={styles.errorText}>{errors[`foodItem_${index}_price`]}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFoodItem(index)}
                        className={styles.removePrizeButton}
                        disabled={formData.foodItems.length === 1}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddFoodItem}
                  className={`btn btn-tertiary btn-full ${styles.addPrizeButton}`}
                  disabled={formData.foodItems.length >= 20}
                >
                  Agregar plato {formData.foodItems.length >= 20 ? '(máximo 20)' : ''}
                </button>
              </div>
            )}
        </div>
      </div>
    );
  }
);

EventDataStep.displayName = 'EventDataStep';

export default EventDataStep;
