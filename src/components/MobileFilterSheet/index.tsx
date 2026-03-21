import React from 'react';
import BottomSheet from '@/components/BottomSheet';
import styles from '@/styles/list.module.css';

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  /** Filter group content — wrap each group in sheetFilterGroup / sheetFilterLabel / sheetFilterOptions from list.module.css */
  children: React.ReactNode;
}

export default function MobileFilterSheet({
  isOpen,
  onClose,
  title = 'Filtros',
  children,
}: MobileFilterSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      label={title}
      title={title}
      footer={
        <button type="button" className={styles.sheetApply} onClick={onClose}>
          Aplicar
        </button>
      }
    >
      <div className={styles.sheetFilters}>{children}</div>
    </BottomSheet>
  );
}
