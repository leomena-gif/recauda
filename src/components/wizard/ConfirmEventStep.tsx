'use client';

import React from 'react';
import type { FoodItem } from './CreateEventWizard';
import styles from './ConfirmEventStep.module.css';

interface EventData {
  type: 'raffle' | 'food_sale';
  name: string;
  numberValue?: string;
  totalNumbers?: string;
  autoAdjust?: boolean;
  startDate: Date | null;
  endDate: Date | null;
  prizes?: string[];
  foodItems?: FoodItem[];
}

interface ConfirmEventStepProps {
  eventData: EventData;
  onCreate: () => void;
  onBack: () => void;
}

const ConfirmEventStep: React.FC<ConfirmEventStepProps> = ({
  eventData,
  onCreate,
  onBack,
}) => {
  const isFoodSale = eventData.type === 'food_sale';

  const formatEventType = (type: 'raffle' | 'food_sale') => {
    return type === 'raffle' ? 'Sorteo' : 'Venta de comida';
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'No especificada';
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: string) => {
    // Si ya tiene símbolo de moneda, devolverlo tal cual
    if (value.includes('$')) return value;
    // Eliminar espacios y extraer solo números
    const numericValue = value.replace(/[^\d]/g, '');
    if (numericValue) {
      return `$ ${parseInt(numericValue).toLocaleString('es-AR')}`;
    }
    return value;
  };

  const formatTotalNumbers = () => {
    if (eventData.autoAdjust) {
      return 'Ajustado según la cantidad de vendedores';
    }
    return eventData.totalNumbers || '';
  };

  const formatPrizes = () => {
    if (!eventData.prizes || eventData.prizes.length === 0) {
      return ['Sin premios definidos'];
    }
    return eventData.prizes.filter(prize => prize.trim() !== '');
  };

  const formatFoodItems = () => {
    if (!eventData.foodItems || eventData.foodItems.length === 0) {
      return [];
    }
    return eventData.foodItems.filter(item => item.name.trim() !== '' || item.price.trim() !== '');
  };

    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Confirmar evento</h1>
        
        <div className={styles.confirmationCard}>
          <div className={styles.detailRow}>
            <span className={styles.label}>Nombre del evento</span>
            <span className={styles.value}>{eventData.name}</span>
          </div>
          
          {/* Raffle-specific fields */}
          {!isFoodSale && eventData.numberValue && (
            <>
              <div className={styles.detailRow}>
                <span className={styles.label}>Valor de la rifa</span>
                <span className={styles.value}>{formatCurrency(eventData.numberValue)}</span>
              </div>
              
              <div className={styles.detailRow}>
                <span className={styles.label}>Cantidad de números totales</span>
                <span className={styles.value}>{formatTotalNumbers()}</span>
              </div>
            </>
          )}
          
          <div className={styles.detailRow}>
            <span className={styles.label}>Fecha de inicio</span>
            <span className={styles.value}>{formatDate(eventData.startDate)}</span>
          </div>
          
          <div className={styles.detailRow}>
            <span className={styles.label}>Fecha de finalización</span>
            <span className={styles.value}>{formatDate(eventData.endDate)}</span>
          </div>
          
          {/* Prizes for raffles */}
          {!isFoodSale && (
            <div className={styles.prizesSection}>
              <h2 className={styles.sectionLabel}>🏆 Premios</h2>
              <div className={styles.prizesList}>
                {formatPrizes().map((prize, index) => (
                  <div key={index} className={styles.prizeItem}>
                    <span className={styles.prizeNumber}>{index + 1}° premio</span>
                    <span className={styles.prizeValue}>{prize}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Food items for food sales */}
          {isFoodSale && (
            <div className={styles.prizesSection}>
              <h2 className={styles.sectionLabel}>🍽️ Menú</h2>
              <div className={styles.prizesList}>
                {formatFoodItems().map((item, index) => (
                  <div key={index} className={styles.prizeItem}>
                    <span className={styles.prizeValue}>{item.name}</span>
                    <span className={styles.prizeNumber}>{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
};

export default ConfirmEventStep;
