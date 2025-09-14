import React from 'react';
import Header from '@/components/Header';
import EventsEmptyState from '@/components/EventsEmptyState';
import './globals.css';

export default function Home() {
  return (
    <>
      <Header />
      <main className="mainContent">
        <div className="pageContainer">
          <h1 className="pageTitle">Mis eventos</h1>
          <EventsEmptyState />
        </div>
      </main>
    </>
  );
}
