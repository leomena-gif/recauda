import React from 'react';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.leftSection}>
          <button className={styles.menuButton}>
            <span className={styles.hamburgerIcon}>☰</span>
          </button>
          <div className={styles.appTitle}>Recauda</div>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.userInfo}>
            <div className={styles.greeting}>Hola, Usuario</div>
            <div className={styles.role}>Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
