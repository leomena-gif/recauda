import React from 'react';
import Header from '@/components/Header';
import AccountForm from '@/components/AccountForm';
import './globals.css';

export default function Home() {
  return (
    <>
      <Header />
      <main className="mainContent">
        <AccountForm />
      </main>
    </>
  );
}
