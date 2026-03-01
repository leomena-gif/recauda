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
  
  // Pages and path prefixes that should not show the global header and sidebar
  const noHeaderPages = ['/login', '/create-account'];
  const noHeaderPrefixes = ['/seller/', '/auth/'];

  const isNoHeaderPage =
    noHeaderPages.includes(pathname) ||
    noHeaderPrefixes.some(prefix => pathname.startsWith(prefix));

  const shouldShowHeader = !isNoHeaderPage;
  const shouldShowSidebar = !isNoHeaderPage;

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
