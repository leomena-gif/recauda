/**
 * Mock data for development
 * TODO: Replace with API calls in production
 */

import { Seller, Event } from '@/types/models';

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

