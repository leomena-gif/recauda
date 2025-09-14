import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Recauda - Crear Cuenta',
  description: 'Completa los siguientes datos para crear tu cuenta',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
