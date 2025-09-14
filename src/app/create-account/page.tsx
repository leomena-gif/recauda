import React from 'react';
import Header from '@/components/Header';
import AccountForm from '@/components/AccountForm';
import '../globals.css';

export const metadata = {
  title: 'Recauda - Crear Cuenta',
  description: 'Completa los siguientes datos para crear tu cuenta',
};

export default function CreateAccountPage() {
  return (
    <>
      <Header />
      <main className="mainContent">
        <AccountForm />
      </main>
    </>
  );
}
