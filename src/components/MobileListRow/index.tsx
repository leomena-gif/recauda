import React from 'react';
import { Phone, LayoutGrid } from 'lucide-react';
import styles from '@/styles/list.module.css';

interface MobileListRowProps {
  id: string;
  isInactive?: boolean;
  isSelected?: boolean;
  checkboxSlot?: React.ReactNode;
  /** Content rendered inside the <h3> name element */
  name: string;
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
  const hasEvent = eventLine && eventLine !== 'Sin evento asignado' && eventLine !== 'Sin evento';

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
          <h3 className={`${styles.mobileRowName} ${isInactive ? styles.mobileRowNameInactive : ''}`}>{name}</h3>
          {menuSlot}
        </div>
        
        <div className={styles.mobileRowMetadata}>
          <div className={styles.metadataItem}>
            <Phone size={12} className={styles.metadataIcon} />
            <span className={styles.mobileRowPhone}>{phone}</span>
          </div>
          
          <div className={`${styles.eventChip} ${hasEvent ? styles.eventChipActive : styles.eventChipEmpty}`}>
            <span>{eventLine}</span>
          </div>
        </div>
        
        {sellerLine && <p className={styles.mobileRowSellerLine}>{sellerLine}</p>}
      </div>
    </article>
  );
}


