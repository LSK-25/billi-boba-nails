import { validateCheckoutFields, validateImageFile } from '@/lib/checkout-validation';
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
  orderUuid: string;
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
  id: string;
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
  id,
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

function normalizeCreatedCheckoutOrder(value: unknown): CreatedCheckoutOrder {
  const order = value as Partial<CreatedCheckoutOrder> | null;

  if (!order?.orderUuid || !order.orderId || !order.trackingId || !order.createdAt) {
    throw new Error('Could not create order.');
  }

  return {
    orderUuid: order.orderUuid,
    orderId: order.orderId,
    trackingId: order.trackingId,
    createdAt: order.createdAt,
    status: getStatusLabel(order.status),
    subtotal: Number(order.subtotal ?? 0),
    total: Number(order.total ?? 0),
  };
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
    databaseOrderId: order.id,
    orderId: order.order_number,
    trackingId: order.tracking_code,
    createdAt: order.created_at,
    status: getStatusLabel(order.status),
    canReuploadPhotos: order.status === 'photos_needed_again',
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
  orderUuid,
  photoType,
  fileName,
}: {
  userId: string;
  orderUuid: string;
  photoType: CheckoutPhotoInput['photoType'];
  fileName: string;
}) {
  const randomPart = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : String(Date.now());

  return `${userId}/${orderUuid}/${photoType}-${randomPart}-${cleanFileName(fileName)}`;
}

async function uploadHandPhotos({
  userId,
  orderUuid,
  photos,
}: {
  userId: string;
  orderUuid: string;
  photos: CheckoutPhotoInput[];
}) {
  if (photos.length === 0) return;

  const supabase = createClient();
  const photoRows = [];

  for (const photo of photos) {
    const validationError = validateImageFile(photo.file, photo.photoType.replaceAll('_', ' '));

    if (validationError) {
      throw new Error(validationError);
    }

    const storagePath = makePhotoPath({
      userId,
      orderUuid,
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
      throw new Error('Could not upload hand photos. Please try again.');
    }

    photoRows.push({
      order_id: orderUuid,
      uploaded_by: userId,
      storage_path: storagePath,
      image_url: null,
      photo_type: photo.photoType,
    });
  }

  const { error: photoInsertError } = await supabase.from('hand_photos').insert(photoRows);

  if (photoInsertError) {
    throw new Error('Could not save hand photos. Please try again.');
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

  if (lines.length > 5) {
    throw new Error('Please checkout with 5 or fewer set types at once.');
  }

  const validationError = validateCheckoutFields({
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    addressLine1: address.line1,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    customerNote: note,
  });

  if (validationError) {
    throw new Error(validationError);
  }

  for (const line of lines) {
    if (!line.set.id || line.quantity < 1 || line.quantity > 5) {
      throw new Error('One item in your cart is invalid.');
    }
  }

  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error('Please login again before checkout.');
  }

  const { data, error } = await supabase.rpc('create_checkout_order', {
    payload: {
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
      },
      address: {
        line1: address.line1.trim(),
        line2: address.line2.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        postalCode: address.postalCode.trim(),
        country: address.country.trim() || 'India',
      },
      note: note?.trim() || null,
      items: lines.map((item) => ({
        productSlug: item.set.id,
        length: item.length,
        quantity: item.quantity,
      })),
    },
  });

  if (error) {
    throw new Error(error.message || 'Could not create order.');
  }

  const createdOrder = normalizeCreatedCheckoutOrder(data);

  await uploadHandPhotos({
    userId: authData.user.id,
    orderUuid: createdOrder.orderUuid,
    photos,
  });

  return createdOrder;
}

export async function reuploadHandPhotosForOrder({
  orderDatabaseId,
  photos,
}: {
  orderDatabaseId: string;
  photos: CheckoutPhotoInput[];
}) {
  if (!orderDatabaseId) {
    throw new Error('Missing order ID.');
  }

  if (photos.length < 2 || photos.length > 3) {
    throw new Error('Please upload the required hand photos.');
  }

  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error('Please login again before uploading photos.');
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderDatabaseId)
    .eq('customer_id', authData.user.id)
    .maybeSingle();

  if (orderError || !order) {
    throw new Error('Order not found.');
  }

  if (order.status !== 'photos_needed_again') {
    throw new Error('New photos have not been requested for this order.');
  }

  await uploadHandPhotos({
    userId: authData.user.id,
    orderUuid: order.id,
    photos,
  });

  const { data: markedReuploaded, error: updateError } = await supabase.rpc(
  'mark_order_photos_reuploaded',
  {
    raw_order_id: order.id,
  },
);

if (updateError || !markedReuploaded) {
  throw new Error('Photos uploaded, but order status could not be updated. Please contact the studio.');
}
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
    throw new Error('Could not track this order. Please check the details and try again.');
  }

  return normalizeTrackedOrder(data);
}