'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Home, Users, Plus, LogOut, ChevronDown, X, Menu, Sun, Moon } from 'lucide-react';
import { ROUTES } from '@/constants';
import RecaudaLogo from './RecaudaLogo';
import styles from './Topbar.module.css';
import { useTheme } from '@/contexts/ThemeContext';

const navItems = [
  { id: 'home', label: 'Mis eventos', path: ROUTES.HOME, icon: <Home size={20} /> },
  { id: 'sellers-list', label: 'Lista de vendedores', path: ROUTES.SELLERS_LIST, icon: <Users size={20} /> },
  { id: 'create-event', label: 'Crear evento', path: ROUTES.CREATE_EVENT, icon: <Plus size={20} /> },
];

const desktopNavItems = navItems.filter(item => item.id !== 'create-event');

// TODO: Replace with real auth context
const mockUser = {
  name: 'Leonardo García',
  institution: 'Club Deportivo San Martín',
};



const Topbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handlePlusAction = () => {
    if (pathname.startsWith(ROUTES.EVENT_DETAIL)) {
      const eventId = searchParams.get('id') ?? '';
      router.push(`${ROUTES.REGISTER_SALE}?eventId=${eventId}`);
      return;
    }
    const destination =
      pathname === ROUTES.SELLERS_LIST ? ROUTES.ADD_SELLER : ROUTES.CREATE_EVENT;
    router.push(destination);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    router.push(ROUTES.LOGIN);
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <header className={styles.topbar}>
        <div className={styles.topbarContent}>

          {/* Hamburger — mobile only, left of logo */}
          <button
            className={`${styles.hamburger} ${styles.mobileOnly}`}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Abrir menú"
          >
            <Menu size={26} />
          </button>

          {/* Logo */}
          <button className={styles.logoButton} onClick={() => router.push(ROUTES.HOME)}>
            <RecaudaLogo height={18} />
          </button>

          {/* Nav — desktop only */}
          <nav className={styles.nav}>
            {desktopNavItems.map((item) => (
              <button
                key={item.id}
                className={`${styles.navItem} ${pathname === item.path ? styles.navItemActive : ''}`}
                onClick={() => router.push(item.path)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className={styles.rightActions}>
            {pathname.startsWith(ROUTES.EVENT_DETAIL) ? (
              <button className={`${styles.plusButtonMobile} ${styles.mobileOnly}`} onClick={handlePlusAction} aria-label="Registrar venta">
                <Plus size={24} />
              </button>
            ) : pathname === ROUTES.SELLERS_LIST ? (
              <button className={`${styles.plusButtonMobile} ${styles.mobileOnly}`} onClick={handlePlusAction} aria-label="Agregar vendedor">
                <Plus size={24} />
              </button>
            ) : pathname !== ROUTES.HOME &&
                pathname !== ROUTES.CREATE_EVENT &&
                pathname !== ROUTES.ADD_SELLER &&
                pathname !== ROUTES.REGISTER_SALE && (
              <button className={styles.plusButton} onClick={handlePlusAction} aria-label="Crear evento">
                <Plus size={26} />
              </button>
            )}            {/* Theme toggle - Desktop Only */}
            <button
              className={`${styles.themeToggle} ${styles.desktopOnly}`}
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {/* User menu — desktop only */}
            <div className={`${styles.userMenuWrapper} ${styles.desktopOnly}`}>
              <button
                className={styles.userButton}
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                aria-expanded={isUserMenuOpen}
              >
                <span className={styles.userName}>{mockUser.name}</span>
                <ChevronDown
                  size={13}
                  className={`${styles.chevron} ${isUserMenuOpen ? styles.chevronOpen : ''}`}
                />
              </button>

              {isUserMenuOpen && (
                <>
                  <div className={styles.userMenuOverlay} onClick={() => setIsUserMenuOpen(false)} />
                  <div className={styles.userDropdown}>
                    <div className={styles.dropdownUserInfo}>
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

        </div>
      </header>

      {/* Mobile drawer menu */}
      <div className={`${styles.fullMenu} ${isMenuOpen ? styles.fullMenuOpen : ''}`}>
        <div className={styles.fullMenuScrim} onClick={() => setIsMenuOpen(false)} aria-hidden="true" />

        <div className={styles.fullMenuPanel}>

          {/* Header */}
          <div className={styles.fullMenuTop}>
            <RecaudaLogo height={16} />
            <button className={styles.fullMenuClose} onClick={() => setIsMenuOpen(false)} aria-label="Cerrar menú">
              <X size={20} />
            </button>
          </div>
          {/* Nav items */}
          <nav className={styles.fullMenuNav}>
            <div className={styles.fullMenuSectionHeader}>Explorar</div>
            {navItems.filter(item => item.id !== 'create-event').map((item, index) => (
              <button
                key={item.id}
                className={`${styles.fullMenuNavItem} ${pathname === item.path ? styles.fullMenuNavItemActive : ''}`}
                onClick={() => handleNavigation(item.path)}
                style={{ transitionDelay: `${0.1 + index * 0.05}s` }}
              >
                <span className={styles.fullMenuNavIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}

            <div className={styles.fullMenuSectionHeader}>Gestionar</div>
            {navItems.filter(item => item.id === 'create-event').map((item, index) => (
              <button
                key={item.id}
                className={`${styles.fullMenuNavItem} ${pathname === item.path ? styles.fullMenuNavItemActive : ''}`}
                onClick={() => handleNavigation(item.path)}
                style={{ transitionDelay: `${0.2 + index * 0.05}s` }}
              >
                <span className={styles.fullMenuNavIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User profile - Repositioned to bottom */}
          <div className={styles.fullMenuProfile} style={{ transitionDelay: '0.35s' }}>
            <div className={styles.fullMenuProfileInfo}>
              <span className={styles.fullMenuProfileName}>{mockUser.name}</span>
              <span className={styles.fullMenuProfileInstitution}>{mockUser.institution}</span>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.fullMenuFooter} style={{ transitionDelay: '0.45s' }}>
            <div className={styles.fullMenuThemeRow}>
              <span className={styles.fullMenuThemeLabel}>
                {theme === 'dark' ? 'Modo oscuro' : 'Modo claro'}
              </span>
              <button
                className={styles.fullMenuThemeToggle}
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                <span className={`${styles.fullMenuThemeTrack} ${theme === 'dark' ? styles.fullMenuThemeTrackActive : ''}`}>
                  <span className={styles.fullMenuThemeThumb}>
                    {theme === 'dark' ? <Moon size={10} /> : <Sun size={10} />}
                  </span>
                </span>
              </button>
            </div>
            <button className={styles.fullMenuLogout} onClick={handleLogout}>
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default Topbar;
