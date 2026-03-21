'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Topbar from '@/components/Topbar';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  // Pages that should not show the global topbar
  const noTopbarPages: string[] = [];

  const shouldShowTopbar = !noTopbarPages.includes(pathname);

  if (!shouldShowTopbar) {
    return <>{children}</>;
  }

  return (
    <>
      <Topbar />
      <div className="appLayout">
        <div className="mainContent">
          {children}
        </div>
      </div>
    </>
  );
};

export default ConditionalLayout;
