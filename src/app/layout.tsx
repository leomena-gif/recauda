import type { Metadata } from 'next';
import ConditionalLayout from '@/components/ConditionalLayout';
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
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
