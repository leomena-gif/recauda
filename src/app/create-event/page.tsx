import React from 'react';
import CreateEventForm from '@/components/wizard/CreateEventForm';

export const metadata = {
  title: 'Recauda - Crear evento',
  description: 'Crear un nuevo evento de recaudación',
};

export default function CreateEventPage() {
  return <CreateEventForm />;
}
