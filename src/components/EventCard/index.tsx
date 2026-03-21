'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import styles from './EventCard.module.css';

type EventStatus = 'active' | 'completed' | 'cancelled';
type EventType = 'raffle' | 'food_sale';

const RaffleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V22H4V12"/>
    <path d="M22 7H2v5h20V7z"/>
    <path d="M12 22V7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);

const FoodIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
  </svg>
);

const TYPE_ICON_COMPONENT: Record<EventType, React.FC> = {
  raffle: RaffleIcon,
  food_sale: FoodIcon,
};

interface EventCardProps {
  id: string;
  name: string;
  status: EventStatus;
  type: EventType;
  endDate?: string;
  collected?: number;
  goal?: number;
  soldUnits?: number;
  totalUnits?: number;
  dishes?: { name: string; price: number; sold?: number; total?: number }[];
}


const fmt = (n: number) =>
  `$${new Intl.NumberFormat('es-AR').format(Math.round(n))}`;

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function EventCard({
  id,
  name,
  status,
  type,
  endDate,
  collected: collectedProp = 0,
  goal: goalProp = 0,
  soldUnits = 0,
  totalUnits = 0,
  dishes,
}: EventCardProps) {
  const router = useRouter();

  // Compute totals — food_sale derives from dishes
  const collected =
    type === 'food_sale' && dishes
      ? dishes.reduce((s, d) => s + (d.sold ?? 0) * d.price, 0)
      : collectedProp;

  const goal =
    type === 'food_sale' && dishes
      ? dishes.reduce((s, d) => s + (d.total ?? 0) * d.price, 0)
      : goalProp;

  const progress = goal > 0 ? Math.min((collected / goal) * 100, 100) : 0;
  const goalReached = collected >= goal && goal > 0;

  // Date label by status
  const dateLabel = endDate
    ? status === 'active'
      ? `Finaliza el ${formatDate(endDate)}`
      : status === 'completed'
      ? `Finalizó el ${formatDate(endDate)}`
      : `Cancelado el ${formatDate(endDate)}`
    : '';

  // Progress bar variant
  const progressBarClass =
    status === 'active'
      ? styles.progressActive
      : status === 'completed' && goalReached
      ? styles.progressSuccess
      : status === 'completed'
      ? styles.progressMuted
      : styles.progressCancelled;

  return (
    <Card
      interactive={status !== 'cancelled'}
      onClick={() => router.push(`/event-detail?id=${id}`)}
      className={status === 'cancelled' ? styles.cardCancelled : undefined}
    >
      <div className={styles.content}>

        {/* Type icon + Status badge */}
        <div className={styles.header}>
          <div className={styles.typeIcon}>
            {React.createElement(TYPE_ICON_COMPONENT[type])}
          </div>
          <div className={`${styles.badge} ${styles[`badge_${status}`]}`}>
            {status !== 'cancelled' && <span className={styles.badgeDot} />}
            <span className={styles.badgeText}>
              {status === 'active' ? 'ACTIVO' : status === 'completed' ? 'FINALIZADO' : 'CANCELADO'}
            </span>
          </div>
        </div>

        {/* Date */}
        {dateLabel && <p className={styles.date}>{dateLabel}</p>}

        {/* Title */}
        <h2 className={styles.title}>{name}</h2>

        {/* Progress — hidden for cancelled */}
        {status !== 'cancelled' && (
          <div className={styles.progressBlock}>
            <div className={styles.progressTrack}>
              <div
                className={`${styles.progressFill} ${progressBarClass}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className={styles.progressMeta}>
              {type === 'raffle' ? (
                <span>{soldUnits}/{totalUnits} vendidos</span>
              ) : (
                <span>{Math.round(progress)}% vendido</span>
              )}
              {status === 'completed' && goalReached && (
                <span className={styles.goalReached}>Meta alcanzada ✓</span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={`${styles.footer} ${status === 'cancelled' ? styles.footerCancelled : ''}`}>
          <span className={styles.footerLeft}>Recaudado {fmt(collected)}</span>
          {status === 'cancelled' ? (
            <span className={styles.footerRight}>Meta {fmt(goal)}</span>
          ) : status === 'completed' && goalReached ? (
            <span className={`${styles.footerRight} ${styles.footerSuccess}`}>Objetivo cumplido</span>
          ) : (
            <span className={styles.footerRight}>Objetivo {fmt(goal)}</span>
          )}
        </div>

      </div>
    </Card>
  );
}
