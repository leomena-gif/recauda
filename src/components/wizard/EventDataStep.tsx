'use client';

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Trash2 } from 'lucide-react';
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

const getPrizeLabel = (index: number): string => {
  const labels = [
    'Primer premio', 'Segundo premio', 'Tercer premio', 'Cuarto premio',
    'Quinto premio', 'Sexto premio', 'Séptimo premio', 'Octavo premio',
    'Noveno premio', 'Décimo premio',
  ];
  return labels[index] || `Premio ${index + 1}`;
};

const getPrizePlaceholder = (index: number): string => {
  const ph = ['Ej: Bicicleta rodado 29', 'Ej: Smart TV 50"', 'Ej: Vale de compra $10.000'];
  return ph[index] ?? 'Descripción del premio';
};

const EventDataStep = forwardRef<EventDataStepRef, EventDataStepProps>(
  ({ initialData, onNext }, ref) => {
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

        if (!formData.name.trim()) newErrors.name = 'El nombre del evento es requerido';
        if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es requerida';
        if (!formData.endDate) newErrors.endDate = 'La fecha de finalización es requerida';

        if (isFoodSale) {
          if (formData.foodItems.length > 0) {
            const first = formData.foodItems[0];
            if (!first.name.trim()) newErrors['foodItem_0_name'] = 'El nombre del plato es requerido';
            if (!first.price.trim()) newErrors['foodItem_0_price'] = 'El precio es requerido';
          }
          formData.foodItems.forEach((item, i) => {
            if (i > 0 && (item.name.trim() || item.price.trim())) {
              if (!item.name.trim()) newErrors[`foodItem_${i}_name`] = 'Nombre requerido';
              if (!item.price.trim()) newErrors[`foodItem_${i}_price`] = 'Precio requerido';
            }
          });
        } else {
          if (!formData.numberValue.trim()) newErrors.numberValue = 'El valor del número es requerido';
          if (!formData.autoAdjust && !formData.totalNumbers.trim()) newErrors.totalNumbers = 'La cantidad total es requerida';
          if (!formData.prizes[0]?.trim()) newErrors['prize_0'] = 'El primer premio es requerido';
          formData.prizes.forEach((prize, i) => {
            if (i > 0 && !prize.trim()) newErrors[`prize_${i}`] = 'Completá este premio o eliminá la fila';
          });
        }

        if (Object.keys(newErrors).length === 0) {
          if (isFoodSale) {
            onNext({ name: formData.name, startDate: formData.startDate, endDate: formData.endDate, foodItems: formData.foodItems });
          } else {
            onNext({ name: formData.name, numberValue: formData.numberValue, totalNumbers: formData.totalNumbers, autoAdjust: formData.autoAdjust, startDate: formData.startDate, endDate: formData.endDate, prizes: formData.prizes });
          }
        } else {
          setErrors(newErrors);
        }
      },
    }));

    const handleInputChange = (field: string, value: string | boolean | Date | null) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleAddPrize = () => {
      if (formData.prizes.length < 10) setFormData(prev => ({ ...prev, prizes: [...prev.prizes, ''] }));
    };

    const handlePrizeChange = (index: number, value: string) => {
      setFormData(prev => ({ ...prev, prizes: prev.prizes.map((p, i) => i === index ? value : p) }));
      const key = `prize_${index}`;
      if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const handleRemovePrize = (index: number) => {
      if (index === 0) return;
      setFormData(prev => ({ ...prev, prizes: prev.prizes.filter((_, i) => i !== index) }));
      setErrors(prev => {
        const updated: Record<string, string> = {};
        Object.entries(prev).forEach(([key, val]) => {
          if (!key.startsWith('prize_')) { updated[key] = val; return; }
          const idx = Number(key.split('_')[1]);
          if (isNaN(idx) || idx === index) return;
          updated[`prize_${idx > index ? idx - 1 : idx}`] = val;
        });
        return updated;
      });
    };

    const handleAddFoodItem = () => {
      if (formData.foodItems.length < 20) setFormData(prev => ({ ...prev, foodItems: [...prev.foodItems, { name: '', price: '' }] }));
    };

    const handleFoodItemChange = (index: number, field: 'name' | 'price', value: string) => {
      setFormData(prev => ({ ...prev, foodItems: prev.foodItems.map((item, i) => i === index ? { ...item, [field]: value } : item) }));
      const key = `foodItem_${index}_${field}`;
      if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const handleRemoveFoodItem = (index: number) => {
      if (formData.foodItems.length > 1) setFormData(prev => ({ ...prev, foodItems: prev.foodItems.filter((_, i) => i !== index) }));
    };

    return (
      <div className={styles.container}>

        {/* Event Name — heading input */}
        <div className={styles.nameSection}>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`${styles.nameInput} ${errors.name ? styles.nameInputError : ''}`}
            placeholder={isFoodSale ? 'Nombre de la venta' : 'Nombre del evento'}
          />
          {errors.name && <span className={styles.nameError}>{errors.name}</span>}
        </div>

        {/* Dates — two-column compact card */}
        <div className={styles.datesCard}>
          <div className={styles.dateCol}>
            <span className={styles.dateLabel}>Fecha de inicio</span>
            <DatePicker
              selected={formData.startDate}
              onChange={(date) => handleInputChange('startDate', date)}
              placeholder="dd/mm/aa"
              error={!!errors.startDate}
            />
            {errors.startDate && <span className={styles.errorText}>{errors.startDate}</span>}
          </div>
          <div className={styles.dateSeparator} />
          <div className={styles.dateCol}>
            <span className={styles.dateLabel}>Fecha de fin</span>
            <DatePicker
              selected={formData.endDate}
              onChange={(date) => handleInputChange('endDate', date)}
              placeholder="dd/mm/aa"
              error={!!errors.endDate}
            />
            {errors.endDate && <span className={styles.errorText}>{errors.endDate}</span>}
          </div>
        </div>

        {/* Raffle options — Luma event options style */}
        {!isFoodSale && (
          <div className={styles.optionsCard}>
            <div className={styles.optionRow}>
              <span className={styles.optionIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/></svg>
              </span>
              <span className={styles.optionLabel}>Valor del número</span>
              <div className={styles.optionControl}>
                <input
                  type="text"
                  value={formData.numberValue}
                  onChange={(e) => handleInputChange('numberValue', e.target.value)}
                  className={`${styles.inlineInput} ${errors.numberValue ? styles.inlineInputError : ''}`}
                  placeholder="Ej: $500"
                />
                {errors.numberValue && <span className={styles.inlineError}>{errors.numberValue}</span>}
              </div>
            </div>

            <div className={styles.optionDivider} />

            <div className={styles.optionRow}>
              <span className={styles.optionIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" fill="currentColor"/></svg>
              </span>
              <span className={styles.optionLabel}>Total de números</span>
              <div className={styles.optionControl}>
                <div className={styles.segmented}>
                  <button
                    type="button"
                    className={`${styles.segmentedBtn} ${formData.autoAdjust ? styles.segmentedBtnActive : ''}`}
                    onClick={() => handleInputChange('autoAdjust', true)}
                  >
                    Automático
                  </button>
                  <button
                    type="button"
                    className={`${styles.segmentedBtn} ${!formData.autoAdjust ? styles.segmentedBtnActive : ''}`}
                    onClick={() => handleInputChange('autoAdjust', false)}
                  >
                    Manual
                  </button>
                </div>
                {!formData.autoAdjust && (
                  <input
                    type="text"
                    value={formData.totalNumbers}
                    onChange={(e) => handleInputChange('totalNumbers', e.target.value)}
                    className={`${styles.inlineInput} ${errors.totalNumbers ? styles.inlineInputError : ''}`}
                    placeholder="Ej: 1000"
                    autoFocus
                  />
                )}
                {errors.totalNumbers && <span className={styles.inlineError}>{errors.totalNumbers}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Prizes */}
        {!isFoodSale && (
          <div className={styles.listSection}>
            <h3 className={styles.listTitle}>Premios</h3>
            {formData.prizes.map((prize, index) => (
              <div key={index} className={styles.listItem}>
                <span className={styles.listRank}>{index + 1}</span>
                <div className={styles.listItemInput}>
                  <input
                    type="text"
                    value={prize}
                    onChange={(e) => handlePrizeChange(index, e.target.value)}
                    className={`${styles.input} ${errors[`prize_${index}`] ? styles.inputError : ''}`}
                    placeholder={getPrizePlaceholder(index)}
                    aria-label={getPrizeLabel(index)}
                  />
                  {errors[`prize_${index}`] && <span className={styles.errorText}>{errors[`prize_${index}`]}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePrize(index)}
                  className={styles.removeBtn}
                  disabled={index === 0}
                  aria-label="Eliminar premio"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddPrize}
              className={styles.addBtn}
              disabled={formData.prizes.length >= 10}
            >
              + Agregar premio
            </button>
          </div>
        )}

        {/* Food items */}
        {isFoodSale && (
          <div className={styles.listSection}>
            <h3 className={styles.listTitle}>Menú</h3>
            {formData.foodItems.map((item, index) => (
              <div key={index} className={styles.foodRow}>
                <div className={styles.foodRowFields}>
                  <div className={styles.foodNameField}>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleFoodItemChange(index, 'name', e.target.value)}
                      className={`${styles.input} ${errors[`foodItem_${index}_name`] ? styles.inputError : ''}`}
                      placeholder={index === 0 ? 'Ej: Pollo asado con papas' : 'Nombre del plato'}
                    />
                    {errors[`foodItem_${index}_name`] && <span className={styles.errorText}>{errors[`foodItem_${index}_name`]}</span>}
                  </div>
                  <div className={styles.foodPriceField}>
                    <input
                      type="text"
                      value={item.price}
                      onChange={(e) => handleFoodItemChange(index, 'price', e.target.value)}
                      className={`${styles.input} ${errors[`foodItem_${index}_price`] ? styles.inputError : ''}`}
                      placeholder="$0"
                    />
                    {errors[`foodItem_${index}_price`] && <span className={styles.errorText}>{errors[`foodItem_${index}_price`]}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFoodItem(index)}
                  className={styles.removeBtn}
                  disabled={formData.foodItems.length === 1}
                  aria-label="Eliminar plato"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddFoodItem}
              className={styles.addBtn}
              disabled={formData.foodItems.length >= 20}
            >
              + Agregar plato
            </button>
          </div>
        )}

      </div>
    );
  }
);

EventDataStep.displayName = 'EventDataStep';
export default EventDataStep;
