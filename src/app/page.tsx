import React from 'react';
import Header from '@/components/Header';
import BlockedEventCard from '@/components/BlockedEventCard';
import ActiveEventCard from '@/components/ActiveEventCard';
import CompletedEventCard from '@/components/CompletedEventCard';
import CardEmptyState from '@/components/CardEmptyState';
import './globals.css';

export const metadata = {
  title: 'Recauda - Mis Eventos',
  description: 'Gestiona tus eventos de recaudación',
};

export default function Home() {
  return (
    <>
      <Header />
      <main className="mainContent">
        <div className="pageContainer">
          <h1 className="pageTitle">Mis eventos</h1>
          <div className="cardsContainer">
            <ActiveEventCard />
            <BlockedEventCard />
            <CompletedEventCard />
            <CardEmptyState />
          </div>
        </div>
      </main>
    </>
  );
}
