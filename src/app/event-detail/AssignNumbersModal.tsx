'use client';

import React from 'react';
import AssignNumbersStep, { AssignNumbersStepRef } from '@/components/wizard/AssignNumbersStep';
import BottomSheet from '@/components/BottomSheet';
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

    const handleNext = (data: NumberAssignment) => {
        onConfirm(data);
    };

    const handleConfirm = () => {
        assignNumbersStepRef.current?.validateAndNext();
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            label="Asignar más números"
            title="Asignar más números"
            showCloseButton
            subtitle={
                vendorNames.length === 1
                    ? `Vendedor: ${vendorNames[0]}`
                    : `${vendorNames.length} vendedores seleccionados`
            }
            footer={
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleConfirm}>
                    Confirmar
                </button>
            }
        >
            <div className={styles.stepWrapper}>
                <AssignNumbersStep
                    ref={assignNumbersStepRef}
                    onNext={handleNext}
                    onBack={onClose}
                />
            </div>
        </BottomSheet>
    );
};

export default AssignNumbersModal;
