'use client';

import React from 'react';
import styles from './BottomSheet.module.css';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Accessible label for the dialog */
  label: string;
  title?: string;
  subtitle?: string;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export default function BottomSheet({
  isOpen,
  onClose,
  label,
  title,
  subtitle,
  showCloseButton,
  footer,
  children,
}: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden="true" />
        {(title || showCloseButton) && (
          <div className={styles.header}>
            <div className={styles.headerText}>
              {title && <h2 className={styles.title}>{title}</h2>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </>
  );
}
