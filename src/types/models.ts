/**
 * Core data models for the application
 */

// ─── Const Objects (Single Source of Truth) ────────────────────────────────

export const SELLER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const BUYER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const EVENT_TYPE = {
  RAFFLE: 'raffle',
  FOOD_SALE: 'food_sale',
} as const;

export const EVENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// ─── Derived Types ──────────────────────────────────────────────────────────

export type SellerStatus = typeof SELLER_STATUS[keyof typeof SELLER_STATUS];
export type BuyerStatus = typeof BUYER_STATUS[keyof typeof BUYER_STATUS];
export type EventType = typeof EVENT_TYPE[keyof typeof EVENT_TYPE];
export type EventStatus = typeof EVENT_STATUS[keyof typeof EVENT_STATUS];
export type StatusFilter = 'all' | SellerStatus;
export type EventStatusFilter = 'active' | 'past';

// ─── Interfaces ─────────────────────────────────────────────────────────────

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

export interface FoodPurchaseItem {
  dishName: string;
  quantity: number;
  unitPrice: number;
}

export interface Buyer {
  id: string;
  firstName: string;
  lastName: string;
  sellerId: string;
  sellerName: string;
  phone: string;
  email: string;
  status: BuyerStatus;
  eventsAssigned: number;
  assignedEvents: string[]; // Array of event IDs
  totalBought: number;
  lastActivity: string;
  isDelivered?: boolean;
  isPrinted?: boolean;
  foodPurchase?: FoodPurchaseItem[];
  assignedNumbers?: number[];
}

export interface Prize {
  position: number;
  description: string;
  value?: number;
}

export interface EventDish {
  name: string;
  price: number;
  sold?: number;
  total?: number;
  closed?: boolean;
}

export interface Event {
  id: string;
  name: string;
  type: EventType;
  status: EventStatus;
  endDate: string;
  totalNumbers: number;
  soldNumbers: number;
  prizes?: Prize[];
  dishes?: EventDish[];
}
