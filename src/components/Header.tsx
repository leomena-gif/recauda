'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Plus, Users, X, Menu } from 'lucide-react';
import { ROUTES } from '@/constants';
import styles from './Header.module.css';

interface HeaderItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

const headerItems: HeaderItem[] = [
  { id: 'home', label: 'Mis Eventos', path: ROUTES.HOME, icon: <Home size={20} /> },
  { id: 'create-event', label: 'Crear evento', path: ROUTES.CREATE_EVENT, icon: <Plus size={20} /> },
  { id: 'sellers-list', label: 'Lista de vendedores', path: ROUTES.SELLERS_LIST, icon: <Users size={20} /> },
];

const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.HOME]: 'Mis Eventos',
  [ROUTES.CREATE_EVENT]: 'Crear evento',
  [ROUTES.SELLERS_LIST]: 'Lista de vendedores',
  [ROUTES.ADD_SELLER]: 'Agregar vendedor',
  [ROUTES.EVENT_DETAIL]: 'Detalle del evento',
};

const getHeaderTitle = (pathname: string): string =>
  ROUTE_TITLES[pathname] ?? 'Recauda';

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerTitle = getHeaderTitle(pathname);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handlePlusAction = () => {
    const destination =
      pathname === ROUTES.SELLERS_LIST ? ROUTES.ADD_SELLER : ROUTES.CREATE_EVENT;
    router.push(destination);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {/* Hamburger Menu */}
          <button
            className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerOpen : ''}`}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Title - Centered (por sección) */}
          <h1 className={styles.title}>{headerTitle}</h1>

          {/* Plus Icon: Agregar vendedor en Lista de vendedores, Crear evento en el resto */}
          <button
            className={styles.plusButton}
            onClick={handlePlusAction}
            aria-label={pathname === ROUTES.SELLERS_LIST ? 'Agregar vendedor' : 'Crear evento'}
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`${styles.menuOverlay} ${isMenuOpen ? styles.menuOverlayOpen : ''}`}
        onClick={toggleMenu}
      >
        <nav
          className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.menuHeader}>
            <h2 className={styles.menuTitle}>Recauda</h2>
            <button
              className={styles.closeButton}
              onClick={toggleMenu}
              aria-label="Cerrar menú"
            >
              <X size={24} />
            </button>
          </div>

          <ul className={styles.menuList}>
            {headerItems
              .filter((item) => item.id !== 'create-event')
              .map((item) => (
                <li key={item.id} className={styles.menuItem}>
                  <button
                    className={`${styles.menuButton} ${pathname === item.path ? styles.menuButtonActive : ''
                      }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <span className={styles.menuIcon}>{item.icon}</span>
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
