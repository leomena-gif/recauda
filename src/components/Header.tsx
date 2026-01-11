'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Header.module.css';

interface HeaderItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

const headerItems: HeaderItem[] = [
  {
    id: 'home',
    label: 'Mis Eventos',
    path: '/',
    icon: 'home'
  },
  {
    id: 'create-event',
    label: 'Crear evento',
    path: '/create-event',
    icon: 'add'
  },
  {
    id: 'sellers-list',
    label: 'Lista de vendedores',
    path: '/sellers-list',
    icon: 'people'
  }
];

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCreateEvent = () => {
    router.push('/create-event');
    setIsMenuOpen(false);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'add':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'people':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.6977C21.7033 16.0413 20.9999 15.5767 20.2 15.3778" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3.37781C16.7999 3.57668 17.5033 4.04129 18.0094 4.6977C18.5155 5.35411 18.8 6.16449 18.8 7C18.8 7.83551 18.5155 8.64589 18.0094 9.3023C17.5033 9.95871 16.7999 10.4233 16 10.6222" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {/* Hamburger Menu */}
          <button 
            className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerOpen : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          {/* Title - Centered */}
          <h1 className={styles.title}>Mis eventos</h1>
          
          {/* Plus Icon */}
          <button
            className={styles.plusButton}
            onClick={handleCreateEvent}
            aria-label="Crear evento"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.menuOverlay} ${isMenuOpen ? styles.menuOverlayOpen : ''}`} onClick={toggleMenu}>
        <nav className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className={styles.menuHeader}>
            <h2 className={styles.menuTitle}>Recauda</h2>
            <button 
              className={styles.closeButton}
              onClick={toggleMenu}
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <ul className={styles.menuList}>
            {headerItems.map((item) => (
              <li key={item.id} className={styles.menuItem}>
                <button
                  className={`${styles.menuButton} ${
                    pathname === item.path ? styles.menuButtonActive : ''
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <span className={styles.menuIcon}>
                    {renderIcon(item.icon)}
                  </span>
                  <span className={styles.menuLabel}>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Header;
