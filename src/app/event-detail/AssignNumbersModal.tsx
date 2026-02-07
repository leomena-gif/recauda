'use client';

import React from 'react';
import AssignNumbersStep, { AssignNumbersStepRef } from '@/components/wizard/AssignNumbersStep';
import styles from './AssignNumbersModal.module.css';

interface NumberAssignment {
    quantity: number;
    autoAssign: boolean;
    fromNumber: string;
    toNumber: string;
}

interface AssignNumbersModalProps {
    isOpen: boolean;
    vendorNames: string[];
    onClose: () => void;
    onConfirm: (data: NumberAssignment) => void;
}

const AssignNumbersModal: React.FC<AssignNumbersModalProps> = ({
    isOpen,
    vendorNames,
    onClose,
    onConfirm,
}) => {
    const assignNumbersStepRef = React.useRef<AssignNumbersStepRef>(null);

    if (!isOpen) return null;

    const handleNext = (data: NumberAssignment) => {
        onConfirm(data);
    };

    const handleConfirm = () => {
        assignNumbersStepRef.current?.validateAndNext();
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Asignar más números</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <div className={styles.vendorInfo}>
                    <p className={styles.vendorLabel}>
                        {vendorNames.length === 1
                            ? `Vendedor: ${vendorNames[0]}`
                            : `${vendorNames.length} vendedores seleccionados`
                        }
                    </p>
                </div>

                <div className={styles.modalBody}>
                    <AssignNumbersStep
                        ref={assignNumbersStepRef}
                        onNext={handleNext}
                        onBack={onClose}
                    />
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancelar
                    </button>
                    <button className={styles.confirmButton} onClick={handleConfirm}>
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignNumbersModal;
