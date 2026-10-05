import { createClient } from '@/lib/supabase/client';

export type AdminOrderItem = {
  id: string;
  code: string;
  name: string;
  slug: string | null;
  length: string;
  shape: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type AdminHandPhoto = {
  id: string;
  photoType: string;
  photoTypeLabel: string;
  reviewStatus: string;
  reviewStatusLabel: string;
  storagePath: string | null;
  imageUrl: string | null;
  signedUrl: string | null;
  adminNote: string | null;
  createdAt: string;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  trackingCode: string;
  createdAt: string;
  placedAt: string;
  status: string;
  statusLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  photoStatusLabel: string;

  customer: {
    name: string;
    email: string;
    phone: string;
  };

  shipping: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  totals: {
    subtotal: number;
    shipping: number;
    total: number;
  };

  note: string | null;
  items: AdminOrderItem[];
  photos: AdminHandPhoto[];
};

type OrderItemRow = {
  id: string;
  design_code: string | null;
  product_name: string;
  product_slug: string | null;
  selected_length: string | null;
  selected_shape: string | null;
  quantity: number;
  unit_price_inr: number;
  line_total_inr: number;
};

type HandPhotoRow = {
  id: string;
  storage_path: string | null;
  image_url: string | null;
  photo_type: string;
  review_status: string;
  admin_note: string | null;
  created_at: string;
};

type AdminOrderRow = {
  id: string;
  order_number: string;
  tracking_code: string;
  created_at: string;
  status: string | null;
  payment_status: string | null;

  customer_name: string;
  customer_email: string;
  customer_phone: string;

  shipping_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;

  subtotal_inr: number;
  shipping_inr: number;
  total_inr: number;

  customer_note: string | null;

  order_items:
    | OrderItemRow[]
    | null;

  hand_photos:
    | HandPhotoRow[]
    | null;
};

export const adminOrderStatusOptions = [
  {
    value: 'order_confirmed',
    label: 'Order confirmed',
  },
  {
    value: 'photos_under_review',
    label: 'Photos under review',
  },
  {
    value: 'photos_needed_again',
    label: 'Photos needed again',
  },
  {
    value: 'in_production',
    label: 'In production',
  },
  {
    value: 'quality_check',
    label: 'Quality check',
  },
  {
    value: 'ready_to_dispatch',
    label: 'Ready to dispatch',
  },
  {
    value: 'dispatched',
    label: 'Dispatched',
  },
  {
    value: 'delivered',
    label: 'Delivered',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
  },
];

const ADMIN_ORDER_SELECT = `
  id,
  order_number,
  tracking_code,
  created_at,
  status,
  payment_status,
  customer_name,
  customer_email,
  customer_phone,
  shipping_name,
  shipping_phone,
  shipping_address_line1,
  shipping_address_line2,
  shipping_city,
  shipping_state,
  shipping_postal_code,
  shipping_country,
  subtotal_inr,
  shipping_inr,
  total_inr,
  customer_note,
  order_items (
    id,
    design_code,
    product_name,
    product_slug,
    selected_length,
    selected_shape,
    quantity,
    unit_price_inr,
    line_total_inr
  ),
  hand_photos (
    id,
    storage_path,
    image_url,
    photo_type,
    review_status,
    admin_note,
    created_at
  )
`;

function labelFromSnake(
  value?: string | null,
) {
  if (!value) {
    return 'Pending';
  }

  return value
    .replace(/_/g, ' ')
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function getStatusLabel(
  status?: string | null,
) {
  return (
    adminOrderStatusOptions.find(
      (option) =>
        option.value === status,
    )?.label ??
    labelFromSnake(status)
  );
}

function getPhotoTypeLabel(
  photoType: string,
) {
  switch (photoType) {
    case 'left_hand':
      return 'Left hand with coin';

    case 'right_hand':
      return 'Right hand with coin';

    case 'length_reference':
      return 'Length reference';

    default:
      return labelFromSnake(
        photoType,
      );
  }
}

function getReviewStatusLabel(
  status: string,
) {
  return labelFromSnake(status);
}

function formatAdminDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(new Date(value));
}

function formatAddress(
  order: AdminOrderRow,
) {
  return [
    order.shipping_address_line1,
    order.shipping_address_line2,
    order.shipping_city,
    order.shipping_state,
    order.shipping_postal_code,
    order.shipping_country,
  ]
    .filter(Boolean)
    .join(', ');
}

function getOverallPhotoStatus(
  photos: AdminHandPhoto[],
) {
  if (photos.length === 0) {
    return 'No photos';
  }

  const statuses =
    photos.map(
      (photo) =>
        photo.reviewStatus,
    );

  if (
    statuses.every(
      (status) =>
        status === 'approved',
    )
  ) {
    return 'Approved';
  }

  const needsNewPhotos =
    statuses.some((status) =>
      [
        'rejected',
        'needs_reupload',
        'photos_needed_again',
        'needs_new_photos',
      ].includes(status),
    );

  if (needsNewPhotos) {
    return 'Needs new photos';
  }

  return 'Pending review';
}

async function getSignedPhotoUrl(
  storagePath: string | null,
) {
  if (!storagePath) {
    return null;
  }

  const supabase =
    createClient();

  const { data, error } =
    await supabase.storage
      .from('hand-photos')
      .createSignedUrl(
        storagePath,
        60 * 30,
      );

  if (
    error ||
    !data?.signedUrl
  ) {
    return null;
  }

  return data.signedUrl;
}

async function mapAdminOrder(
  order: AdminOrderRow,
  includeSignedPhotos = false,
): Promise<AdminOrder> {
  const items =
    order.order_items ?? [];

  const rawPhotos =
    order.hand_photos ?? [];

  const photos: AdminHandPhoto[] =
    await Promise.all(
      rawPhotos.map(
        async (photo) => ({
          id: photo.id,

          photoType:
            photo.photo_type,

          photoTypeLabel:
            getPhotoTypeLabel(
              photo.photo_type,
            ),

          reviewStatus:
            photo.review_status,

          reviewStatusLabel:
            getReviewStatusLabel(
              photo.review_status,
            ),

          storagePath:
            photo.storage_path,

          imageUrl:
            photo.image_url,

          signedUrl:
            includeSignedPhotos
              ? await getSignedPhotoUrl(
                  photo.storage_path,
                )
              : null,

          adminNote:
            photo.admin_note,

          createdAt:
            photo.created_at,
        }),
      ),
    );

  return {
    id: order.id,

    orderNumber:
      order.order_number,

    trackingCode:
      order.tracking_code,

    createdAt:
      order.created_at,

    placedAt:
      formatAdminDate(
        order.created_at,
      ),

    status:
      order.status ??
      'order_confirmed',

    statusLabel:
      getStatusLabel(
        order.status,
      ),

    paymentStatus:
      order.payment_status ??
      'pending',

    paymentStatusLabel:
      labelFromSnake(
        order.payment_status ??
          'pending',
      ),

    photoStatusLabel:
      getOverallPhotoStatus(
        photos,
      ),

    customer: {
      name:
        order.customer_name,

      email:
        order.customer_email,

      phone:
        order.customer_phone,
    },

    shipping: {
      name:
        order.shipping_name,

      phone:
        order.shipping_phone,

      address:
        formatAddress(order),

      city:
        order.shipping_city,

      state:
        order.shipping_state,

      postalCode:
        order.shipping_postal_code,

      country:
        order.shipping_country,
    },

    totals: {
      subtotal:
        order.subtotal_inr,

      shipping:
        order.shipping_inr,

      total:
        order.total_inr,
    },

    note:
      order.customer_note,

    items: items.map(
      (item) => ({
        id: item.id,

        code:
          item.design_code ??
          'BNB',

        name:
          item.product_name,

        slug:
          item.product_slug,

        length:
          item.selected_length ??
          'Same as shown',

        shape:
          item.selected_shape,

        quantity:
          item.quantity,

        unitPrice:
          item.unit_price_inr,

        lineTotal:
          item.line_total_inr,
      }),
    ),

    photos,
  };
}

export async function getAdminOrders(): Promise<
  AdminOrder[]
> {
  const supabase =
    createClient();

  const { data, error } =
    await supabase
      .from('orders')
      .select(
        ADMIN_ORDER_SELECT,
      )
      .order('created_at', {
        ascending: false,
      })
      .limit(100);

  if (error) {
    console.error(
      'Failed to load admin orders:',
      error.message,
    );

    return [];
  }

  if (!data) {
    return [];
  }

  return Promise.all(
    (
      data as AdminOrderRow[]
    ).map((order) =>
      mapAdminOrder(order),
    ),
  );
}

export async function getAdminOrder(
  identifier: string,
): Promise<AdminOrder | null> {
  const cleanIdentifier =
    decodeURIComponent(
      identifier,
    ).trim();

  if (!cleanIdentifier) {
    return null;
  }

  const supabase =
    createClient();

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      cleanIdentifier,
    );

  const lookupColumns =
    isUuid
      ? [
          'id',
          'order_number',
          'tracking_code',
        ]
      : [
          'order_number',
          'tracking_code',
        ];

  for (
    const column of
    lookupColumns
  ) {
    const {
      data,
      error,
    } = await supabase
      .from('orders')
      .select(
        ADMIN_ORDER_SELECT,
      )
      .eq(
        column,
        cleanIdentifier,
      )
      .maybeSingle();

    if (data) {
      return mapAdminOrder(
        data as AdminOrderRow,
        true,
      );
    }

    if (error) {
      console.error(
        `Admin order lookup failed for ${column}:`,
        error.message,
      );
    }
  }

  return null;
}

export async function updateAdminOrderStatus({
  orderId,
  status,
  note,
}: {
  orderId: string;
  status: string;
  note?: string;
}) {
  const supabase =
    createClient();

  const { data: authData } =
    await supabase.auth.getUser();

  const { error: updateError } =
    await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

  if (updateError) {
    throw new Error(
      updateError.message,
    );
  }

  const {
    error: historyError,
  } = await supabase
    .from(
      'order_status_history',
    )
    .insert({
      order_id: orderId,
      status,
      note:
        note?.trim() ||
        null,
      changed_by:
        authData.user?.id ??
        null,
    });

  if (historyError) {
    throw new Error(
      historyError.message,
    );
  }
}

export async function updateAdminPhotoReview({
  orderId,
  reviewStatus,
  note,
}: {
  orderId: string;
  reviewStatus:
    | 'approved'
    | 'request_reupload';
  note?: string;
}) {
  const supabase =
    createClient();

  const cleanNote =
    note?.trim() || null;

  if (
    reviewStatus ===
    'approved'
  ) {
    const {
      error: photoError,
    } = await supabase
      .from('hand_photos')
      .update({
        review_status:
          'approved',

        admin_note:
          cleanNote,
      })
      .eq(
        'order_id',
        orderId,
      );

    if (photoError) {
      throw new Error(
        photoError.message,
      );
    }

    return;
  }

  const {
    error: photoError,
  } = await supabase
    .from('hand_photos')
    .update({
      review_status:
        'needs_new_photos',

      admin_note:
        cleanNote,
    })
    .eq(
      'order_id',
      orderId,
    );

  if (photoError) {
    throw new Error(
      photoError.message,
    );
  }

  await updateAdminOrderStatus({
    orderId,

    status:
      'photos_needed_again',

    note:
      cleanNote ||
      'Requested new hand photos from customer.',
  });
}

type ResetOrderRow = {
  id: string;

  hand_photos:
    | {
        storage_path:
          | string
          | null;
      }[]
    | null;
};

export async function resetAdminTestOrders(): Promise<number> {
  const supabase =
    createClient();

  const { data, error } =
    await supabase
      .from('orders')
      .select(`
        id,
        hand_photos (
          storage_path
        )
      `);

  if (error) {
    throw new Error(
      error.message,
    );
  }

  const rows =
    (data ??
      []) as ResetOrderRow[];

  if (rows.length === 0) {
    return 0;
  }

  const orderIds =
    rows.map(
      (order) =>
        order.id,
    );

  const storagePaths =
    rows
      .flatMap(
        (order) =>
          order.hand_photos ??
          [],
      )
      .map(
        (photo) =>
          photo.storage_path,
      )
      .filter(
        (
          path,
        ): path is string =>
          Boolean(path),
      );

  if (
    storagePaths.length >
    0
  ) {
    const {
      error: storageError,
    } = await supabase.storage
      .from('hand-photos')
      .remove(storagePaths);

    if (storageError) {
      throw new Error(
        storageError.message,
      );
    }
  }

  const {
    error: deleteError,
  } = await supabase
    .from('orders')
    .delete()
    .in(
      'id',
      orderIds,
    );

  if (deleteError) {
    throw new Error(
      deleteError.message,
    );
  }

  return orderIds.length;
}