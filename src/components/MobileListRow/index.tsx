import React from 'react';
import styles from '@/styles/list.module.css';

interface MobileListRowProps {
  id: string;
  isInactive?: boolean;
  isSelected?: boolean;
  checkboxSlot?: React.ReactNode;
  /** Content rendered inside the <h3> name element */
  name: React.ReactNode;
  phone: string;
  eventLine: string;
  sellerLine?: string;
  /** Full menu: button + dropdown (use mobileMenuContainer/mobileMenuButton/mobileMenuDropdown/mobileMenuItem from list.module.css) */
  menuSlot: React.ReactNode;
  onClick?: () => void;
}

export default function MobileListRow({
  id,
  isInactive,
  isSelected,
  checkboxSlot,
  name,
  phone,
  eventLine,
  sellerLine,
  menuSlot,
  onClick,
}: MobileListRowProps) {
  return (
    <article
      role="listitem"
      className={[
        styles.mobileListRow,
        isInactive ? styles.mobileRowInactive : '',
        isSelected ? styles.mobileRowSelected : '',
        onClick ? styles.mobileRowClickable : '',
      ].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      {checkboxSlot && <div className={styles.mobileRowCheckbox}>{checkboxSlot}</div>}
      <div className={styles.mobileRowMain}>
        <div className={styles.mobileRowTop}>
          <h3 className={styles.mobileRowName}>{name}</h3>
          {menuSlot}
        </div>
        <p className={styles.mobileRowPhone}>{phone}</p>
        {sellerLine && <p className={styles.mobileRowEventLine}>{sellerLine}</p>}
        <p className={styles.mobileRowEventLine}>{eventLine}</p>
      </div>
    </article>
  );
}
