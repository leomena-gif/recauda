/**
 * Mock data for development
 * TODO: Replace with API calls in production
 */

import { Seller, Event, Buyer, Prize, EventDish } from '@/types/models';
import type { SaleEvent } from '@/components/wizard/RegisterSaleWizard';


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
    endDate: '2026-04-15',
    totalNumbers: 800,
    soldNumbers: 640,
    prizes: [
      { position: 1, description: 'Auto 0km Toyota Etios', value: 8000000 },
      { position: 2, description: 'Moto Zanella ZB 110cc', value: 1200000 },
      { position: 3, description: 'Heladera Drean con freezer', value: 450000 },
      { position: 4, description: 'Smart TV 50" Samsung 4K', value: 380000 },
      { position: 5, description: 'Tablet Samsung + auriculares Bluetooth', value: 180000 },
      { position: 6, description: 'Bicicleta rodado 26 montaña', value: 120000 },
    ],
  },
  {
    id: '2',
    name: 'Venta de comida - Fiesta de fin de año',
    type: 'food_sale',
    status: 'active',
    endDate: '2026-12-31',
    totalNumbers: 500,
    soldNumbers: 320,
    dishes: [
      { name: 'Milanesa napolitana con papas fritas', price: 2500, sold: 45, total: 100 },
      { name: 'Empanadas (docena)', price: 3000, sold: 30, total: 80 },
      { name: 'Asado con ensalada mixta', price: 4500, sold: 18, total: 50 },
      { name: 'Pollo al horno con guarnición', price: 3200, sold: 22, total: 60 },
      { name: 'Choripán completo', price: 1500, sold: 55, total: 120 },
      { name: 'Torta casera (porción)', price: 800, sold: 40, total: 80 },
    ],
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
  const usedNumbers = new Set<number>();
  for (let i = 0; i < 100; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const phone = `3584${String(100000 + buyerId).padStart(6, '0')}`;
    const isActive = Math.random() > 0.1; // 90% activos
    const ticketCount = Math.floor(Math.random() * 5) + 1;
    const assignedNumbers: number[] = [];
    while (assignedNumbers.length < ticketCount) {
      const n = Math.floor(Math.random() * 1000) + 1;
      if (!usedNumbers.has(n)) { usedNumbers.add(n); assignedNumbers.push(n); }
    }
    assignedNumbers.sort((a, b) => a - b);

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
      totalBought: ticketCount,
      lastActivity: `2024-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      assignedNumbers,
    });
    buyerId++;
  }

  // 185 compradores para VENTA DE COMIDA (evento 2)
  // Distribución determinista alineada con los sold de cada plato:
  // Milanesa: 45 | Empanadas: 30 | Asado: 18 | Pollo: 22 | Choripán: 55 | Torta: 40
  const MI = { dishName: 'Milanesa napolitana con papas fritas', unitPrice: 2500 };
  const EM = { dishName: 'Empanadas (docena)',                   unitPrice: 3000 };
  const AS = { dishName: 'Asado con ensalada mixta',             unitPrice: 4500 };
  const PO = { dishName: 'Pollo al horno con guarnición',        unitPrice: 3200 };
  const CH = { dishName: 'Choripán completo',                    unitPrice: 1500 };
  const TO = { dishName: 'Torta casera (porción)',               unitPrice:  800 };

  // Plan de compras por comprador (cada ítem = qty 1)
  // Milanesa: 40 + 5 = 45 | Torta: 5 + 20 + 15 = 40 | Choripán: 35 + 20 = 55
  const purchasePlan: Array<typeof MI[]> = [
    ...Array(40).fill([MI]),        // 40 → solo milanesa
    ...Array(5).fill([MI, TO]),     //  5 → milanesa + torta
    ...Array(30).fill([EM]),        // 30 → solo empanadas
    ...Array(18).fill([AS]),        // 18 → solo asado
    ...Array(22).fill([PO]),        // 22 → solo pollo
    ...Array(35).fill([CH]),        // 35 → solo choripán
    ...Array(20).fill([CH, TO]),    // 20 → choripán + torta
    ...Array(15).fill([TO]),        // 15 → solo torta
  ]; // total: 185 compradores

  for (let i = 0; i < purchasePlan.length; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const phone = `3584${String(100000 + buyerId).padStart(6, '0')}`;
    const isActive = Math.random() > 0.1; // 90% activos

    const finalPurchase = purchasePlan[i].map(d => ({ ...d, quantity: 1 }));

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
      totalBought: finalPurchase.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
      lastActivity: `2024-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      foodPurchase: finalPurchase,
    });
    buyerId++;
  }

  return buyers;
};

export const MOCK_BUYERS: Buyer[] = generateBuyers();

// ─── Home Page Events (extended with UI-specific data) ──────────────────────
// TODO: Replace with API call. This shape combines Event data with UI props.

export const MOCK_HOME_EVENTS: SaleEvent[] = [
  {
    id: '1',
    status: 'active',
    type: 'raffle',
    name: 'Rifa día del niño del Grupo Scout General Deheza',
    collected: 640000,
    goal: 800000,
    soldUnits: 640,
    totalUnits: 800,
    ticketPrice: 1000,
  },
  {
    id: '2',
    status: 'active',
    type: 'food_sale',
    name: 'Venta de comida - Fiesta de fin de año',
    dishes: [
      { name: 'Milanesa napolitana con papas fritas', price: 2500, sold: 45, total: 100 },
      { name: 'Empanadas (docena)', price: 3000, sold: 30, total: 80 },
      { name: 'Asado con ensalada mixta', price: 4500, sold: 18, total: 50 },
      { name: 'Pollo al horno con guarnición', price: 3200, sold: 22, total: 60 },
      { name: 'Choripán completo', price: 1500, sold: 55, total: 120 },
      { name: 'Torta casera (porción)', price: 800, sold: 40, total: 80 },
    ],
  },
  { id: '3', status: 'cancelled', type: 'raffle', name: 'Rifa cancelada', collected: 80000, goal: 300000, soldUnits: 80, totalUnits: 300 },
  { id: '4', status: 'completed', type: 'raffle', name: 'Rifa completada', collected: 600000, goal: 600000, soldUnits: 600, totalUnits: 600 },
  { id: '5', status: 'completed', type: 'raffle', name: 'Rifa completada 2', collected: 150000, goal: 200000, soldUnits: 150, totalUnits: 200 },
];

