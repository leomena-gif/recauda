import { Suspense } from 'react';
import RegisterSaleForm from '@/components/wizard/RegisterSaleForm';
import { MOCK_HOME_EVENTS } from '@/mocks/data';

export const metadata = {
  title: 'Recauda - Registrar venta',
  description: 'Registrar una nueva venta',
};

export default function RegisterSalePage() {
  return (
    <Suspense fallback={null}>
      <RegisterSaleForm events={MOCK_HOME_EVENTS} />
    </Suspense>
  );
}
