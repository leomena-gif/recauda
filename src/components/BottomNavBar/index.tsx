'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Users, PlusCircle } from 'lucide-react';
import styles from './BottomNavBar.module.css';

const BottomNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: 'Eventos', path: '/', icon: Home },
    { label: 'Vendedores', path: '/sellers-list', icon: Users },
  ];

  return (
    <nav className={styles.bottomNavContainer}>
      <div className={styles.bottomNavContent}>
        
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <button 
              key={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => router.push(item.path)}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          );
        })}

        {/* Center Floating Action Button (FAB) replacement */}
        <button 
          className={styles.fabItem}
          onClick={() => router.push('/create-event')}
        >
          <div className={styles.fabBackground}>
            <PlusCircle size={32} strokeWidth={2} />
          </div>
          <span className={styles.navLabel}>Nuevo</span>
        </button>

      </div>
    </nav>
  );
};

export default BottomNavBar;
