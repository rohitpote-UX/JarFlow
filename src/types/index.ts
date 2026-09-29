export type JarStatus = 'available' | 'with_customer' | 'damaged' | 'lost';

export type PaymentMode = 'CASH' | 'UPI' | 'BANK' | 'SPLIT' | 'UDHARI' | 'NONE';

export interface Business {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  area?: string;
  address?: string;
  upiId?: string;
  defaultJarRate: number; // default ₹35
  totalGodownJars: number; // starts at 0 for fresh business!
  lowStockThreshold: number;
  language: 'mr' | 'en';
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'STAFF' | 'DELIVERY';
  businessId: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  mobile: string;
  address: string;
  area: string;
  active: boolean;
  currentJars: number; // starts at 0
  pendingAmount: number; // starts at 0
  defaultRate?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Jar {
  id: string;
  businessId: string;
  serialNumber: string;
  qrCode?: string;
  status: JarStatus;
  currentCustomerId?: string;
  currentCustomerName?: string;
  dateGiven?: string;
  dateReturned?: string;
  notes?: string;
}

export interface JarTransaction {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerMobile?: string;
  date: string; // ISO date string
  jarsGiven: number;
  jarsReturned: number;
  netJarsChange: number; // jarsGiven - jarsReturned
  ratePerJar: number;
  billAmount: number; // jarsGiven * ratePerJar
  cashPaid: number;
  upiPaid: number;
  totalPaid: number;
  udhariAmount: number; // billAmount - totalPaid
  paymentMode: PaymentMode;
  notes?: string;
  synced: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  paymentMode: 'CASH' | 'UPI' | 'BANK';
  referenceNo?: string;
  previousPending: number;
  remainingBalance: number;
  notes?: string;
  synced: boolean;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  businessId: string;
  customerId: string;
  date: string;
  type: 'TRANSACTION' | 'PAYMENT';
  description: string;
  given: number;
  returned: number;
  net: number;
  rate?: number;
  billAmount: number;
  paidAmount: number;
  udhariAdded: number;
  runningBalance: number;
  paymentMode?: PaymentMode;
}

export interface BusinessSettings {
  businessName: string;
  ownerName: string;
  phone: string;
  upiId: string;
  address: string;
  defaultJarRate: number;
  totalGodownJars: number;
  lowStockThreshold: number;
  language: 'en' | 'mr';
}

export type TimeFilter = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

export type AppTab = 'dashboard' | 'customers' | 'entry' | 'payments' | 'reports';

export interface AppNotification {
  id: string;
  businessId: string;
  title: string;
  titleMr: string;
  message: string;
  messageMr: string;
  type: 'PAYMENT' | 'STOCK' | 'RETURN' | 'DAILY' | 'WELCOME';
  time: string;
  read: boolean;
}
