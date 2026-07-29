import { nailSets } from '@/lib/mock-data';
import type { OrderStatus } from '@/types';

export type AdminOrder = {
  id: string;
  trackingId: string;
  customer: string;
  email: string;
  phone: string;
  city: string;
  setId: string;
  preferredLength: string;
  quantity: number;
  total: number;
  paymentStatus: 'Paid' | 'Payment pending' | 'Refund review';
  photoStatus: 'Needs review' | 'Approved' | 'New photos requested';
  status: OrderStatus;
  placedAt: string;
  deliveryEstimate: string;
  notes: string;
};

export const adminMetrics = [
  {
    label: 'Total orders',
    value: '24',
    note: 'Across this demo workspace',
  },
  {
    label: 'Photo review',
    value: '05',
    note: 'Sizing photos waiting for check',
  },
  {
    label: 'In production',
    value: '08',
    note: 'Sets currently being made',
  },
  {
    label: 'Revenue',
    value: '₹42.8k',
    note: 'Frontend preview total',
  },
];

export const adminOrders: AdminOrder[] = [
  {
    id: 'BNB-2026-482913',
    trackingId: 'TRK-BNB-7284910',
    customer: 'Aarohi M.',
    email: 'aarohi@example.com',
    phone: '+91 98765 43210',
    city: 'Mumbai',
    setId: 'blush-boba-french',
    preferredLength: 'Medium',
    quantity: 1,
    total: 899,
    paymentStatus: 'Paid',
    photoStatus: 'Needs review',
    status: 'Photos under review',
    placedAt: '29 Jul 2026, 7:10 PM',
    deliveryEstimate: '4–6 working days',
    notes: 'Customer wants the same length as displayed.',
  },
  {
    id: 'BNB-2026-517804',
    trackingId: 'TRK-BNB-6402219',
    customer: 'Kavya S.',
    email: 'kavya@example.com',
    phone: '+91 91234 56780',
    city: 'Pune',
    setId: 'ivory-pearl-veil',
    preferredLength: 'Short',
    quantity: 1,
    total: 1499,
    paymentStatus: 'Paid',
    photoStatus: 'Approved',
    status: 'In production',
    placedAt: '29 Jul 2026, 4:45 PM',
    deliveryEstimate: '6–8 working days',
    notes: 'Bridal-style set. Keep finish soft and pearl-heavy.',
  },
  {
    id: 'BNB-2026-650118',
    trackingId: 'TRK-BNB-9943026',
    customer: 'Rhea P.',
    email: 'rhea@example.com',
    phone: '+91 99887 76655',
    city: 'Bengaluru',
    setId: 'cat-eye-mocha',
    preferredLength: 'Long',
    quantity: 1,
    total: 1299,
    paymentStatus: 'Paid',
    photoStatus: 'Approved',
    status: 'Quality check',
    placedAt: '28 Jul 2026, 9:18 PM',
    deliveryEstimate: '5–7 working days',
    notes: 'Customer asked for high cat-eye reflection under light.',
  },
  {
    id: 'BNB-2026-740492',
    trackingId: 'TRK-BNB-3517822',
    customer: 'Mira D.',
    email: 'mira@example.com',
    phone: '+91 90000 12345',
    city: 'Delhi',
    setId: 'lavender-milk-glaze',
    preferredLength: 'Short',
    quantity: 2,
    total: 1598,
    paymentStatus: 'Paid',
    photoStatus: 'New photos requested',
    status: 'Photos under review',
    placedAt: '28 Jul 2026, 12:40 PM',
    deliveryEstimate: '3–5 working days',
    notes: 'Left hand photo was angled. Need a direct top-view photo with coin reference.',
  },
];

export const adminStatusOptions: OrderStatus[] = [
  'Order confirmed',
  'Photos under review',
  'In production',
  'Quality check',
  'Ready to dispatch',
  'Dispatched',
  'Delivered',
];

export function getAdminOrder(orderId: string) {
  return adminOrders.find((order) => order.id === orderId);
}

export function getAdminOrderSet(order: AdminOrder) {
  return nailSets.find((set) => set.id === order.setId);
}

export const productSummary = nailSets.map((set, index) => ({
  ...set,
  status: set.archived ? 'Archived' : index % 3 === 0 ? 'Featured' : 'Active',
  stockMode: 'Made to order',
  orders: 8 + index * 3,
}));
