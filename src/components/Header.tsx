import React from 'react';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.appTitle}>Recauda</div>
      </div>
    </header>
  );
};

export default Header;
