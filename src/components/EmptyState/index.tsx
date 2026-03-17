import React from 'react';
import styles from '@/styles/list.module.css';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      {icon}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
