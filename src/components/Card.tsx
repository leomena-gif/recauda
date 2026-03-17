'use client';

import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  variant?: 'surface' | 'elevated' | 'inset';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'surface',
  padding = 'lg',
  interactive = false,
  fullWidth = false,
  className = '',
  style,
  onClick,
  children,
}) => {
  const classes = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    interactive ? styles.interactive : '',
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
