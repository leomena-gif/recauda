'use client';

import React from 'react';
import styles from './ConfirmSellerStep.module.css';

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

interface ConfirmSellerStepProps {
  sellerData: SellerData;
  numberAssignment: NumberAssignment;
  onConfirm: () => void;
  onBack: () => void;
}

const ConfirmSellerStep: React.FC<ConfirmSellerStepProps> = ({
  sellerData,
  numberAssignment,
  onConfirm,
  onBack,
}) => {
  // Calculate the range if auto-assign is enabled
  const getNumberRange = () => {
    if (numberAssignment.autoAssign) {
      // For auto-assign, we'll show a sample range
      const startNum = '030';
      const endNum = String(parseInt(startNum) + numberAssignment.quantity - 1).padStart(3, '0');
      return { from: startNum, to: endNum };
    }
    return {
      from: numberAssignment.fromNumber,
      to: numberAssignment.toNumber,
    };
  };

  const numberRange = getNumberRange();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Confirmar vendedor</h1>
      
      <div className={styles.confirmationCard}>
        <div className={styles.detailRow}>
          <span className={styles.label}>Nombre:</span>
          <span className={styles.value}>{sellerData.firstName}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Apellido:</span>
          <span className={styles.value}>{sellerData.lastName}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Teléfono:</span>
          <span className={styles.value}>{sellerData.phone}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Cantidad de números asignados:</span>
          <span className={styles.value}>{numberAssignment.quantity}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Desde:</span>
          <span className={styles.value}>{numberRange.from}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Hasta:</span>
          <span className={styles.value}>{numberRange.to}</span>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSellerStep;

