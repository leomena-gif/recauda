'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  
  // Pages that should not show the global header and sidebar
  const noHeaderPages: string[] = [];
  
  const shouldShowHeader = !noHeaderPages.includes(pathname);
  const shouldShowSidebar = !noHeaderPages.includes(pathname);

  if (!shouldShowHeader && !shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <>
      {shouldShowHeader && <Header />}
      <div className="appLayout">
        {shouldShowSidebar && <Sidebar />}
        <div className="mainContent">
          {children}
        </div>
      </div>
    </>
  );
};

export default ConditionalLayout;
