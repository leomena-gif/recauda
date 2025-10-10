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
  const noHeaderPages = ['/add-seller'];
  
  const shouldShowHeader = !noHeaderPages.includes(pathname);
  const shouldShowSidebar = !noHeaderPages.includes(pathname);
  
  // Debug log
  console.log('ConditionalLayout - pathname:', pathname, 'shouldShowHeader:', shouldShowHeader, 'shouldShowSidebar:', shouldShowSidebar);
  
  // If this is a page that doesn't need header/sidebar, just render children
  if (!shouldShowHeader && !shouldShowSidebar) {
    console.log('Rendering without header/sidebar for pathname:', pathname);
    return <>{children}</>;
  }
  
  // For other pages, show the normal layout with header and sidebar
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
