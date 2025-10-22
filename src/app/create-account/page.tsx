import React from 'react';
import AccountForm from '@/components/AccountForm';
import styles from './page.module.css';

export const metadata = {
  title: 'Recauda - Crear Cuenta',
  description: 'Completa los siguientes datos para crear tu cuenta',
};

export default function CreateAccountPage() {
  return (
    <div className={styles.pageWrapper}>
      <AccountForm />
    </div>
  );
}
