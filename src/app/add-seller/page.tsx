import React from 'react';
import AddSellerWizard from '@/components/wizard/AddSellerWizard';

export const metadata = {
  title: 'Recauda - Agregar vendedor',
  description: 'Agregar un nuevo vendedor al evento',
};

export default function AddSellerPage() {
  return <AddSellerWizard />;
}

