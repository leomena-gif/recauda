import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ConditionalLayout from '@/components/ConditionalLayout';
import './globals.css';
import '@/styles/utilities.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

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
    <html lang="es" className={inter.variable}>
      <body>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
