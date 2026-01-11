/**
 * Core data models for the application
 */

export interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: SellerStatus;
  eventsAssigned: number;
  assignedEvents: string[]; // Array of event IDs
  totalSold: number;
  lastActivity: string;
}

export interface Event {
  id: string;
  name: string;
  type: EventType;
  status: EventStatus;
  endDate: string;
  totalNumbers: number;
  soldNumbers: number;
}

export type SellerStatus = 'active' | 'inactive';
export type EventType = 'raffle' | 'food_sale';
export type EventStatus = 'active' | 'inactive' | 'completed';
export type StatusFilter = 'all' | 'active' | 'inactive';
export type EventStatusFilter = 'all' | 'active' | 'completed' | 'cancelled';

