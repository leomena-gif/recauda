'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import styles from './EventCard.module.css';

type EventStatus = 'active' | 'completed' | 'cancelled';
type EventType = 'raffle' | 'food_sale';

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

        {/* Status badge */}
        <div className={`${styles.badge} ${styles[`badge_${status}`]}`}>
          {status !== 'cancelled' && <span className={styles.badgeDot} />}
          <span className={styles.badgeText}>
            {status === 'active' ? 'ACTIVO' : status === 'completed' ? 'FINALIZADO' : 'CANCELADO'}
          </span>
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
