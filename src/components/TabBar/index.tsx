import React from 'react';
import styles from './TabBar.module.css';

export interface TabOption<T extends string = string> {
  value: T;
  label: string;
}

interface TabBarProps<T extends string = string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onChange: (value: T) => void;
}

export default function TabBar<T extends string = string>({
  tabs,
  activeTab,
  onChange,
}: TabBarProps<T>) {
  return (
    <div className={styles.tabsContainer}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`${styles.tab} ${activeTab === tab.value ? styles.tabActive : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
