'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './SuccessScreen.module.css';

interface SuccessScreenProps {
  onAddAnother: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ onAddAnother }) => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.iconWrap}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h1 className={styles.title}>Vendedor creado</h1>
      <p className={styles.description}>Los números fueron asignados correctamente.</p>

      <div className={styles.actions}>
        <button className="btn btn-primary" onClick={onAddAnother}>
          Agregar otro vendedor
        </button>
        <button className="btn btn-secondary" onClick={() => router.push('/sellers-list')}>
          Volver a la lista
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
