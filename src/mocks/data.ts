/**
 * Mock data for development
 * TODO: Replace with API calls in production
 */

import { Seller, Event, Buyer } from '@/types/models';

export const MOCK_SELLERS: Seller[] = [
  {
    id: '1',
    firstName: 'María',
    lastName: 'González',
    phone: '3584123456',
    email: 'maria.gonzalez@email.com',
    status: 'active',
    eventsAssigned: 3,
    assignedEvents: ['1', '2', '3'],
    totalSold: 45,
    lastActivity: '2024-01-15'
  },
  {
    id: '2',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    phone: '3584987654',
    email: 'carlos.rodriguez@email.com',
    status: 'active',
    eventsAssigned: 2,
    assignedEvents: ['1', '2'],
    totalSold: 32,
    lastActivity: '2024-01-14'
  },
  {
    id: '3',
    firstName: 'Ana',
    lastName: 'Martínez',
    phone: '3584555666',
    email: 'ana.martinez@email.com',
    status: 'inactive',
    eventsAssigned: 1,
    assignedEvents: ['3'],
    totalSold: 18,
    lastActivity: '2024-01-10'
  },
  {
    id: '4',
    firstName: 'Luis',
    lastName: 'Fernández',
    phone: '3584777888',
    email: 'luis.fernandez@email.com',
    status: 'active',
    eventsAssigned: 4,
    assignedEvents: ['1', '2', '3', '4'],
    totalSold: 67,
    lastActivity: '2024-01-16'
  },
  {
    id: '5',
    firstName: 'Sofía',
    lastName: 'López',
    phone: '3584999000',
    email: 'sofia.lopez@email.com',
    status: 'active',
    eventsAssigned: 2,
    assignedEvents: ['1', '4'],
    totalSold: 29,
    lastActivity: '2024-01-13'
  },
  {
    id: '6',
    firstName: 'Roberto',
    lastName: 'Sánchez',
    phone: '3584111222',
    email: 'roberto.sanchez@email.com',
    status: 'active',
    eventsAssigned: 0,
    assignedEvents: [],
    totalSold: 0,
    lastActivity: '2024-01-12'
  }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    name: 'Rifa día del niño del G.S. General Deheza',
    type: 'raffle',
    status: 'active',
    endDate: '2024-12-25',
    totalNumbers: 800,
    soldNumbers: 640
  },
  {
    id: '2',
    name: 'Venta de comida - Fiesta de fin de año',
    type: 'food_sale',
    status: 'active',
    endDate: '2024-12-31',
    totalNumbers: 500,
    soldNumbers: 320
  },
  {
    id: '3',
    name: 'Sorteo especial - Día de la madre',
    type: 'raffle',
    status: 'completed',
    endDate: '2024-05-12',
    totalNumbers: 600,
    soldNumbers: 600
  },
  {
    id: '4',
    name: 'Bingo benéfico',
    type: 'raffle',
    status: 'inactive',
    endDate: '2024-11-30',
    totalNumbers: 300,
    soldNumbers: 120
  }
];

// Generar compradores mock
const generateBuyers = (): Buyer[] => {
  const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Sofía', 'Diego', 'Carmen', 
    'Roberto', 'Elena', 'Miguel', 'Patricia', 'José', 'Isabel', 'Francisco', 'Rosa', 'Antonio', 'Teresa',
    'Manuel', 'Raquel', 'Javier', 'Beatriz', 'Fernando', 'Lucía', 'Alejandro', 'Marta', 'Ricardo', 'Julia',
    'Sergio', 'Cristina', 'Pablo', 'Silvia', 'Andrés', 'Gloria', 'Daniel', 'Pilar', 'Gabriel', 'Mercedes',
    'Óscar', 'Dolores', 'Rafael', 'Amparo', 'Jorge', 'Montserrat', 'Rubén', 'Concepción', 'Álvaro', 'Josefa'];
  
  const lastNames = ['Pérez', 'García', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'González', 'Fernández',
    'Díaz', 'Torres', 'Ramírez', 'Flores', 'Rivera', 'Gómez', 'Morales', 'Jiménez', 'Herrera', 'Ruiz',
    'Álvarez', 'Castillo', 'Romero', 'Vázquez', 'Núñez', 'Mendoza', 'Cruz', 'Ortiz', 'Gutiérrez', 'Chávez',
    'Vargas', 'Reyes', 'Ramos', 'Castro', 'Rojas', 'Silva', 'Campos', 'Medina', 'Domínguez', 'Aguilar'];

  const buyers: Buyer[] = [];
  let buyerId = 1;

  const pickSellerForEvent = (eventId: string): { id: string; name: string } => {
    const eligibleSellers = MOCK_SELLERS.filter(seller => seller.assignedEvents.includes(eventId));
    const fallbackSellers = eligibleSellers.length > 0 ? eligibleSellers : MOCK_SELLERS;
    const selectedSeller = fallbackSellers[Math.floor(Math.random() * fallbackSellers.length)];
    return {
      id: selectedSeller.id,
      name: `${selectedSeller.firstName} ${selectedSeller.lastName}`
    };
  };

  // 100 compradores para RIFA (evento 1)
  for (let i = 0; i < 100; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const phone = `3584${String(100000 + buyerId).padStart(6, '0')}`;
    const isActive = Math.random() > 0.1; // 90% activos
    
    const seller = pickSellerForEvent('1');
    buyers.push({
      id: String(buyerId),
      firstName,
      lastName,
      sellerId: seller.id,
      sellerName: seller.name,
      phone,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${buyerId}@email.com`,
      status: isActive ? 'active' : 'inactive',
      eventsAssigned: 1,
      assignedEvents: ['1'], // Rifa
      totalBought: Math.floor(Math.random() * 30) + 1,
      lastActivity: `2024-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
    });
    buyerId++;
  }

  // 320 compradores para VENTA DE COMIDA (evento 2)
  for (let i = 0; i < 320; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const phone = `3584${String(100000 + buyerId).padStart(6, '0')}`;
    const isActive = Math.random() > 0.1; // 90% activos
    
    const seller = pickSellerForEvent('2');
    buyers.push({
      id: String(buyerId),
      firstName,
      lastName,
      sellerId: seller.id,
      sellerName: seller.name,
      phone,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${buyerId}@email.com`,
      status: isActive ? 'active' : 'inactive',
      eventsAssigned: 1,
      assignedEvents: ['2'], // Venta de comida
      totalBought: Math.floor(Math.random() * 50) + 1,
      lastActivity: `2024-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
    });
    buyerId++;
  }

  return buyers;
};

export const MOCK_BUYERS: Buyer[] = generateBuyers();

