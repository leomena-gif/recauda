import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ConditionalLayout from '@/components/ConditionalLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';
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
      <head>
        {/* Anti-flash: apply stored dark theme before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('recauda-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();` }} />
      </head>
      <body>
        <ThemeProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
