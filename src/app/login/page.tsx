import React from 'react';
import Header from '@/components/Header';
import LoginForm from '@/components/LoginForm';
import '../globals.css';

export const metadata = {
  title: 'Recauda - Iniciar Sesión',
  description: 'Inicia sesión en tu cuenta de Recauda',
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="mainContent">
        <LoginForm />
      </main>
    </>
  );
}
