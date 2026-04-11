'use client';

import React from 'react';
import styles from './Badge.module.css';

export type BadgeVariant = 'success' | 'warning' | 'active' | 'neutral' | 'error';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  showDot?: boolean;
  children: React.ReactNode;
  className?: string; // allow overrides for placement adjustments
}

export default function Badge({ 
  variant = 'neutral', 
  size = 'md', 
  showDot = false, 
  children,
  className = '' 
}: BadgeProps) {
  const rootClass = `${styles.badge} ${styles[`badge_${variant}`]} ${styles[`badge_size_${size}`]} ${className}`;

  return (
    <span className={rootClass}>
      {showDot && <span className={styles.dot} />}
      <span className={styles.text}>{children}</span>
    </span>
  );
}
