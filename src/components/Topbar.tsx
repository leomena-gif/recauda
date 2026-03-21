'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, Users, Plus, X, LogOut, ChevronDown } from 'lucide-react';
import { ROUTES } from '@/constants';
import styles from './Topbar.module.css';

const navItems = [
  { id: 'home', label: 'Mis eventos', path: ROUTES.HOME, icon: <Home size={20} /> },
  { id: 'sellers-list', label: 'Lista de vendedores', path: ROUTES.SELLERS_LIST, icon: <Users size={20} /> },
];

const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.HOME]: 'Mis Eventos',
  [ROUTES.CREATE_EVENT]: 'Crear evento',
  [ROUTES.SELLERS_LIST]: 'Lista de vendedores',
  [ROUTES.ADD_SELLER]: 'Agregar vendedor',
  [ROUTES.EVENT_DETAIL]: 'Detalle del evento',
};

// TODO: Replace with real auth context
const mockUser = {
  name: 'Leonardo García',
  institution: 'Club Deportivo San Martín',
};

const getInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

const Topbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const headerTitle = ROUTE_TITLES[pathname] ?? 'Recauda';

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const handlePlusAction = () => {
    const destination =
      pathname === ROUTES.SELLERS_LIST ? ROUTES.ADD_SELLER : ROUTES.CREATE_EVENT;
    router.push(destination);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    router.push(ROUTES.LOGIN);
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <header className={styles.topbar}>
        {/* ── Mobile layout ── */}
        <div className={styles.mobileContent}>
          <button
            className={`${styles.hamburger} ${isMobileMenuOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMobileMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <h1 className={styles.mobileTitle}>{headerTitle}</h1>

          <button
            className={styles.plusButton}
            onClick={handlePlusAction}
            aria-label={pathname === ROUTES.SELLERS_LIST ? 'Agregar vendedor' : 'Crear evento'}
          >
            <Plus size={24} />
          </button>
        </div>

        {/* ── Desktop layout ── */}
        <div className={styles.desktopContent}>
          <button className={styles.logoButton} onClick={() => router.push(ROUTES.HOME)}>
            <Image
              src="/images/logo-long.png"
              alt="Recauda"
              width={140}
              height={32}
              priority
              style={{ objectFit: 'contain' }}
            />
          </button>

          <nav className={styles.desktopNav}>
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`${styles.navTab} ${pathname === item.path ? styles.navTabActive : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className={styles.userMenuWrapper}>
            <button
              className={styles.userButton}
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              aria-expanded={isUserMenuOpen}
            >
              <div className={styles.userAvatar}>
                {getInitials(mockUser.name)}
              </div>
              <span className={styles.userName}>{mockUser.name}</span>
              <ChevronDown
                size={13}
                className={`${styles.chevron} ${isUserMenuOpen ? styles.chevronOpen : ''}`}
              />
            </button>

            {isUserMenuOpen && (
              <>
                <div
                  className={styles.userMenuOverlay}
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className={styles.userDropdown}>
                  <div className={styles.dropdownUserInfo}>
                    <div className={styles.dropdownAvatar}>
                      {getInitials(mockUser.name)}
                    </div>
                    <div className={styles.dropdownUserText}>
                      <span className={styles.dropdownUserName}>{mockUser.name}</span>
                      <span className={styles.dropdownUserInstitution}>{mockUser.institution}</span>
                    </div>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <button className={styles.logoutItem} onClick={handleLogout}>
                    <LogOut size={15} />
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile slide-in menu */}
      <div
        className={`${styles.mobileOverlay} ${isMobileMenuOpen ? styles.mobileOverlayOpen : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <nav
          className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.mobileMenuHeader}>
            <h2 className={styles.mobileMenuTitle}>Recauda</h2>
            <button
              className={styles.closeButton}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={24} />
            </button>
          </div>

          <ul className={styles.mobileMenuList}>
            {navItems.map((item) => (
              <li key={item.id} className={styles.mobileMenuItem}>
                <button
                  className={`${styles.mobileMenuButton} ${
                    pathname === item.path ? styles.mobileMenuButtonActive : ''
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <span className={styles.mobileMenuIcon}>{item.icon}</span>
                  <span className={styles.mobileMenuLabel}>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Topbar;
