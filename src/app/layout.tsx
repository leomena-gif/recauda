import type { Metadata } from 'next';
import Sidebar from '@/components/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Recauda - Gestiona tus eventos',
  description: 'Gestiona tus eventos de recaudación',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <div className="appLayout">
          <Sidebar />
          <div className="mainContent">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
