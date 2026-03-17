import React from 'react';
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
  if (!isOpen) return null;

  return (
    <>
      <div className={styles.sheetOverlay} onClick={onClose} aria-hidden="true" />
      <div
        className={styles.sheetPanel}
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.sheetHandle} aria-hidden="true" />
        <h2 className={styles.sheetTitle}>{title}</h2>
        <div className={styles.sheetFilters}>{children}</div>
        <button type="button" className={styles.sheetApply} onClick={onClose}>
          Aplicar
        </button>
      </div>
    </>
  );
}
