import { createClient } from '@/lib/supabase/client';
import type { StoredOrder } from '@/lib/preview-orders';
import type { CartLine } from '@/types';

type CheckoutCustomer = {
  name: string;
  email: string;
  phone: string;
};

type CheckoutAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type CheckoutPhotoInput = {
  photoType: 'left_hand' | 'right_hand' | 'length_reference';
  file: File;
};

export type CreatedCheckoutOrder = {
  orderId: string;
  trackingId: string;
  createdAt: string;
  status: string;
  subtotal: number;
  total: number;
};

type OrderItemRow = {
  id: string;
  design_code: string | null;
  product_name: string;
  selected_length: string | null;
  quantity: number;
  unit_price_inr: number;
};

type OrderRow = {
  order_number: string;
  tracking_code: string;
  created_at: string;
  status: string | null;
  subtotal_inr: number;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  order_items: OrderItemRow[] | null;
};

const ORDER_SELECT = `
  order_number,
  tracking_code,
  created_at,
  status,
  subtotal_inr,
  customer_email,
  customer_name,
  customer_phone,
  shipping_address_line1,
  shipping_address_line2,
  shipping_city,
  shipping_state,
  shipping_postal_code,
  shipping_country,
  order_items (
    id,
    design_code,
    product_name,
    selected_length,
    quantity,
    unit_price_inr
  )
`;

function getStatusLabel(status?: string | null) {
  switch (status) {
    case 'order_confirmed':
      return 'Order confirmed';
    case 'photos_under_review':
      return 'Photos under review';
    case 'photos_needed_again':
      return 'Photos needed again';
    case 'in_production':
      return 'In production';
    case 'quality_check':
      return 'Quality check';
    case 'ready_to_dispatch':
      return 'Ready to dispatch';
    case 'dispatched':
      return 'Dispatched';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status?.includes(' ') ? status : 'Order confirmed';
  }
}

function mapOrderRow(order: OrderRow): StoredOrder {
  const items = order.order_items ?? [];
  const address = [
    order.shipping_address_line1,
    order.shipping_address_line2,
    order.shipping_city,
    order.shipping_state,
    order.shipping_postal_code,
    order.shipping_country,
  ]
    .filter(Boolean)
    .join(', ');

  return {
    orderId: order.order_number,
    trackingId: order.tracking_code,
    createdAt: order.created_at,
    status: getStatusLabel(order.status),
    accountEmail: order.customer_email,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: order.subtotal_inr,
    customer: {
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      address,
    },
    items: items.map((item) => ({
      cartId: item.id,
      code: item.design_code ?? 'BNB',
      name: item.product_name,
      length: item.selected_length ?? 'Same as shown',
      quantity: item.quantity,
      price: item.unit_price_inr,
    })),
  };
}

function normalizeTrackedOrder(value: unknown): StoredOrder | null {
  const order = value as StoredOrder | null;

  if (!order?.orderId || !order?.trackingId) return null;

  return {
    ...order,
    itemCount: Number(order.itemCount ?? 0),
    subtotal: Number(order.subtotal ?? 0),
    items: Array.isArray(order.items) ? order.items : [],
  };
}

function cleanFileName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'hand-photo.jpg';
}

function makePhotoPath({
  userId,
  orderId,
  photoType,
  fileName,
}: {
  userId: string;
  orderId: string;
  photoType: CheckoutPhotoInput['photoType'];
  fileName: string;
}) {
  const randomPart = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : String(Date.now());

  return `${userId}/${orderId}/${photoType}-${randomPart}-${cleanFileName(fileName)}`;
}

async function uploadHandPhotos({
  userId,
  orderId,
  photos,
}: {
  userId: string;
  orderId: string;
  photos: CheckoutPhotoInput[];
}) {
  if (photos.length === 0) return;

  const supabase = createClient();
  const photoRows = [];

  for (const photo of photos) {
    const storagePath = makePhotoPath({
      userId,
      orderId,
      photoType: photo.photoType,
      fileName: photo.file.name,
    });

    const { error: uploadError } = await supabase.storage
      .from('hand-photos')
      .upload(storagePath, photo.file, {
        cacheControl: '3600',
        upsert: false,
        contentType: photo.file.type || 'image/jpeg',
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    photoRows.push({
      order_id: orderId,
      uploaded_by: userId,
      storage_path: storagePath,
      image_url: null,
      photo_type: photo.photoType,
    });
  }

  const { error: photoInsertError } = await supabase.from('hand_photos').insert(photoRows);

  if (photoInsertError) {
    throw new Error(photoInsertError.message);
  }
}

export async function createCheckoutOrder({
  lines,
  customer,
  address,
  note,
  photos = [],
}: {
  lines: CartLine[];
  customer: CheckoutCustomer;
  address: CheckoutAddress;
  note?: string;
  photos?: CheckoutPhotoInput[];
}): Promise<CreatedCheckoutOrder> {
  if (lines.length === 0) {
    throw new Error('Your cart is empty.');
  }

  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error('Please login again before checkout.');
  }

  const subtotal = lines.reduce((total, item) => total + item.set.price * item.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: authData.user.id,
      customer_email: customer.email,
      customer_name: customer.name,
      customer_phone: customer.phone,

      shipping_name: customer.name,
      shipping_phone: customer.phone,
      shipping_address_line1: address.line1,
      shipping_address_line2: address.line2 || null,
      shipping_city: address.city,
      shipping_state: address.state,
      shipping_postal_code: address.postalCode,
      shipping_country: address.country,

      subtotal_inr: subtotal,
      shipping_inr: 0,
      total_inr: subtotal,
      currency: 'INR',
      customer_note: note || null,
    })
    .select('id, order_number, tracking_code, created_at, status, subtotal_inr, total_inr')
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? 'Could not create order.');
  }

  const orderItems = lines.map((item) => ({
    order_id: order.id,
    product_name: item.set.name,
    product_slug: item.set.id,
    design_code: item.set.code,
    selected_length: item.length,
    selected_shape: item.set.shape,
    quantity: item.quantity,
    unit_price_inr: item.set.price,
    line_total_inr: item.set.price * item.quantity,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  await uploadHandPhotos({
    userId: authData.user.id,
    orderId: order.id,
    photos,
  });

  return {
    orderId: order.order_number,
    trackingId: order.tracking_code,
    createdAt: order.created_at,
    status: getStatusLabel(order.status),
    subtotal: order.subtotal_inr,
    total: order.total_inr,
  };
}

export async function getCustomerOrders(): Promise<StoredOrder[]> {
  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('customer_id', authData.user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return (data as OrderRow[]).map(mapOrderRow);
}

export async function getOrderByNumberForCurrentUser(identifier: string): Promise<StoredOrder | null> {
  const cleanIdentifier = identifier.trim();

  if (!cleanIdentifier) return null;

  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .or(`order_number.eq.${cleanIdentifier},tracking_code.eq.${cleanIdentifier}`)
    .maybeSingle();

  if (error || !data) return null;

  return mapOrderRow(data as OrderRow);
}

export async function findTrackedOrder(identifier: string, contact: string): Promise<StoredOrder | null> {
  const cleanIdentifier = identifier.trim();
  const cleanContact = contact.trim();

  if (!cleanIdentifier || !cleanContact) return null;

  const supabase = createClient();

  const { data, error } = await supabase.rpc('track_order_public', {
    raw_identifier: cleanIdentifier,
    raw_contact: cleanContact,
  });

  if (error) {
    throw new Error(error.message);
  }

  return normalizeTrackedOrder(data);
}