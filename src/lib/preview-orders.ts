export type StoredOrder = {
  orderId: string;
  trackingId: string;
  createdAt: string;
  status: string;
  itemCount: number;
  subtotal: number;
  customer?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    cartId: string;
    code: string;
    name: string;
    length: string;
    quantity: number;
    price: number;
  }>;
};

export const LATEST_ORDER_STORAGE_KEY = 'billi-boba-latest-order-v1';
export const ORDER_HISTORY_STORAGE_KEY = 'billi-boba-order-history-v1';

export function makeOrderId() {
  const year = new Date().getFullYear();
  const number = Math.floor(100000 + Math.random() * 900000);
  return `BNB-${year}-${number}`;
}

export function makeTrackingId() {
  const number = Math.floor(1000000 + Math.random() * 9000000);
  return `TRK-BNB-${number}`;
}

function canUseBrowserStorage() {
  return typeof window !== 'undefined';
}

function safeParseOrders(value: string | null): StoredOrder[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as StoredOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readOrders(): StoredOrder[] {
  if (!canUseBrowserStorage()) return [];
  return safeParseOrders(window.localStorage.getItem(ORDER_HISTORY_STORAGE_KEY));
}

export function readLatestOrder(): StoredOrder | null {
  if (!canUseBrowserStorage()) return null;

  try {
    const latest = window.sessionStorage.getItem(LATEST_ORDER_STORAGE_KEY);
    return latest ? (JSON.parse(latest) as StoredOrder) : null;
  } catch {
    return null;
  }
}

export function savePreviewOrder(order: StoredOrder) {
  if (!canUseBrowserStorage()) return;

  window.sessionStorage.setItem(LATEST_ORDER_STORAGE_KEY, JSON.stringify(order));

  const history = readOrders();
  const withoutDuplicate = history.filter((item) => item.orderId !== order.orderId);
  const nextHistory = [order, ...withoutDuplicate].slice(0, 10);
  window.localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

function identifierMatches(order: StoredOrder, rawIdentifier: string) {
  const identifier = normalizeText(rawIdentifier);
  return normalizeText(order.orderId) === identifier || normalizeText(order.trackingId) === identifier;
}

function contactMatches(order: StoredOrder, rawContact: string) {
  const contact = normalizeText(rawContact);
  const contactPhone = normalizePhone(rawContact);

  // Old preview orders created before this patch did not store contact info.
  // Accept an identifier-only match for those local test orders so the preview remains usable.
  if (!order.customer?.email && !order.customer?.phone) return true;

  const emailMatches = normalizeText(order.customer?.email ?? '') === contact;
  const phoneMatches = Boolean(contactPhone) && normalizePhone(order.customer?.phone ?? '') === contactPhone;

  return emailMatches || phoneMatches;
}

export function findPreviewOrder(rawIdentifier: string, rawContact = '') {
  if (!rawIdentifier.trim()) return null;

  const order = readOrders().find((item) => identifierMatches(item, rawIdentifier));
  if (!order) return null;

  if (!rawContact.trim()) return order;
  return contactMatches(order, rawContact) ? order : null;
}

export function formatPreviewDate(value?: string) {
  if (!value) return 'Just now';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
