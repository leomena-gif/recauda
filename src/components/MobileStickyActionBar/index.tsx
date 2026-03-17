import React from 'react';
import styles from '@/styles/list.module.css';

interface MobileStickyActionBarProps {
  visible: boolean;
  onCancel: () => void;
  /** One or more action buttons (use assignStickyPrimary from list.module.css) */
  children: React.ReactNode;
}

export default function MobileStickyActionBar({
  visible,
  onCancel,
  children,
}: MobileStickyActionBarProps) {
  if (!visible) return null;

  return (
    <div className={styles.assignStickyBar}>
      <button type="button" className={styles.assignStickyCancel} onClick={onCancel}>
        Cancelar
      </button>
      {children}
    </div>
  );
}
