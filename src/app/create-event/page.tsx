import React from 'react';
import CreateEventWizard from '@/components/wizard/CreateEventWizard';

export const metadata = {
  title: 'Recauda - Crear evento',
  description: 'Crear un nuevo evento de recaudación',
};

export default function CreateEventPage() {
  return <CreateEventWizard />;
}
