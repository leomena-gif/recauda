import React from 'react';
import LoginForm from '@/components/LoginForm';
import styles from './page.module.css';

export const metadata = {
  title: 'Recauda - Iniciar Sesión',
  description: 'Inicia sesión en tu cuenta de Recauda',
};

export default function LoginPage() {
  return (
    <div className={styles.pageWrapper}>
      <LoginForm />
    </div>
  );
}
