'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import styles from './Sidebar.module.css';

interface SidebarItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'home',
    label: 'Mis Eventos',
    path: '/',
    icon: 'home'
  },
  {
    id: 'sellers-list',
    label: 'Lista de vendedores',
    path: '/sellers-list',
    icon: 'people'
  },
  {
    id: 'buyers-list',
    label: 'Lista de compradores',
    path: '/buyers-list',
    icon: 'shopping'
  }
];

const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isWideScreen, setIsWideScreen] = React.useState(false);

  React.useEffect(() => {
    const checkScreenWidth = () => {
      setIsWideScreen(window.innerWidth > 1600);
    };

    // Check initial width
    checkScreenWidth();

    // Add resize listener
    window.addEventListener('resize', checkScreenWidth);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenWidth);
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const shouldExpand = isWideScreen || isHovered;

  return (
    <>
      {/* Overlay - appears when sidebar is expanded (but not on wide screens) */}
      <div
        className={`${styles.sidebarOverlay} ${isHovered && !isWideScreen ? styles.sidebarOverlayVisible : ''}`}
        onClick={() => setIsHovered(false)}
      />

      <aside
        className={`${styles.sidebar} ${isWideScreen ? styles.sidebarExpanded : ''}`}
        onMouseEnter={() => !isWideScreen && setIsHovered(true)}
        onMouseLeave={() => !isWideScreen && setIsHovered(false)}
      >
        <div className={styles.sidebarHeader}>
          <Image
            src="/images/logo-short.png"
            alt="Recauda Logo"
            width={40}
            height={40}
            className={styles.logoShort}
            priority
          />
          <Image
            src="/images/logo-long.png"
            alt="Recauda"
            width={180}
            height={40}
            className={styles.logoLong}
            priority
          />
        </div>

        <nav className={styles.sidebarNav}>
          <ul className={styles.sidebarList}>
            {sidebarItems.map((item) => (
              <li key={item.id} className={styles.sidebarItem}>
                <button
                  className={`${styles.sidebarButton} ${pathname === item.path ? styles.sidebarButtonActive : ''
                    }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <span className={styles.sidebarIcon}>
                    {item.icon === 'home' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {item.icon === 'people' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.6977C21.7033 16.0413 20.9999 15.5767 20.2 15.3778" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 3.37781C16.7999 3.57668 17.5033 4.04129 18.0094 4.6977C18.5155 5.35411 18.8 6.16449 18.8 7C18.8 7.83551 18.5155 8.64589 18.0094 9.3023C17.5033 9.95871 16.7999 10.4233 16 10.6222" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {item.icon === 'shopping' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className={styles.sidebarLabel}>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
