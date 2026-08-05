'use client';

import Link from 'next/link';
import { type ChangeEvent, useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import { useAuth } from '@/components/AuthProvider';
import { getCustomerOrders, reuploadHandPhotosForOrder } from '@/lib/commerce-orders';
import { formatPreviewDate, type StoredOrder } from '@/lib/preview-orders';
import { formatPrice } from '@/lib/utils';

type PhotoType = 'left_hand' | 'right_hand' | 'length_reference';

type OrderPhotoFiles = Partial<Record<PhotoType, File>>;

const requiredPhotoTypes: Array<{
  type: PhotoType;
  label: string;
  help: string;
}> = [
  {
    type: 'left_hand',
    label: 'Left hand photo',
    help: 'Clear photo of your left hand in natural light.',
  },
  {
    type: 'right_hand',
    label: 'Right hand photo',
    help: 'Clear photo of your right hand in natural light.',
  },
  {
    type: 'length_reference',
    label: 'Length reference photo',
    help: 'Use coin reference or the guide shown in Photo Guide.',
  },
];

function OrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filesByOrder, setFilesByOrder] = useState<Record<string, OrderPhotoFiles>>({});
  const [uploadingOrderId, setUploadingOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
  let active = true;

  getCustomerOrders()
    .then((nextOrders) => {
      if (!active) return;

      setOrders(nextOrders);
      setLoading(false);
    })
    .catch((caughtError) => {
      if (!active) return;

      setOrders([]);
      setLoading(false);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not load your orders.',
      );
    });

  return () => {
    active = false;
  };
}, [user?.id, refreshKey]);

  function handlePhotoChange(orderId: string, photoType: PhotoType, event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;

    setFilesByOrder((current) => ({
      ...current,
      [orderId]: {
        ...(current[orderId] ?? {}),
        [photoType]: file ?? undefined,
      },
    }));

    setMessage('');
    setError('');
  }

  async function handleReupload(order: StoredOrder) {
    setMessage('');
    setError('');

    if (!order.databaseOrderId) {
      setError('Missing internal order ID. Refresh the page and try again.');
      return;
    }

    const selectedFiles = filesByOrder[order.orderId] ?? {};
    const missingPhotos = requiredPhotoTypes.filter((photo) => !selectedFiles[photo.type]);

    if (missingPhotos.length > 0) {
      setError('Please upload left hand, right hand, and length reference photos.');
      return;
    }

    setUploadingOrderId(order.orderId);

    try {
      await reuploadHandPhotosForOrder({
        orderDatabaseId: order.databaseOrderId,
        photos: requiredPhotoTypes.map((photo) => ({
          photoType: photo.type,
          file: selectedFiles[photo.type] as File,
        })),
      });

      setFilesByOrder((current) => {
        const next = { ...current };
        delete next[order.orderId];
        return next;
      });

      setMessage(`${order.orderId} photos uploaded. The studio can review them again now.`);
      setRefreshKey((value) => value + 1);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not upload new photos.',
      );
    } finally {
      setUploadingOrderId('');
    }
  }

  return (
    <section className="page-shell py-14">
      <span className="pill">My orders</span>

      <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">
            Your order studio.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#756778]">
            Your confirmed BILLi&amp;BoBA orders are now loaded from your Supabase customer account.
          </p>
        </div>

        <Link href="/shop" className="btn-primary w-fit">
          Browse sets
        </Link>
      </div>

      {message && (
        <div className="mt-6 rounded-[1.35rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold leading-6 text-emerald-800">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-[1.35rem] border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold leading-6 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 liquid-glass rounded-[2rem] p-8">
          <h2 className="font-display text-4xl font-black tracking-[-0.06em]">
            Loading orders...
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#756778]">
            Checking your customer order history.
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 liquid-glass rounded-[2rem] p-8">
          <h2 className="font-display text-4xl font-black tracking-[-0.06em]">
            No orders yet.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#756778]">
            Add a nail set to cart and complete checkout. Your confirmed order will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5">
          {orders.map((order) => {
            const isUploading = uploadingOrderId === order.orderId;
            const selectedFiles = filesByOrder[order.orderId] ?? {};

            return (
              <article key={order.orderId} className="liquid-glass overflow-hidden rounded-[2rem] p-6 md:p-7">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/65 bg-white/48 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#8d738f]">
                        {order.status}
                      </span>
                      <span className="rounded-full border border-white/65 bg-white/48 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#8d738f]">
                        {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
                      </span>
                    </div>

                    <h2 className="mt-4 font-display text-4xl font-black tracking-[-0.06em]">
                      {order.orderId}
                    </h2>
                    <p className="mt-2 text-sm font-bold text-[#6f6372]">
                      Tracking ID: {order.trackingId}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#8a7a8e]">
                      Placed on {formatPreviewDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-[1.4rem] border border-white/65 bg-white/48 px-5 py-4 text-right backdrop-blur-xl">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">
                      Total
                    </p>
                    <p className="mt-1 text-2xl font-black text-[#2b2130]">
                      {formatPrice(order.subtotal)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {order.items.map((item) => (
                    <div
                      key={item.cartId}
                      className="flex flex-col justify-between gap-2 rounded-[1.4rem] border border-[#4a314e1c] bg-white/42 p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8d738f]">
                          {item.code}
                        </p>
                        <p className="mt-1 font-black text-[#2c2131]">
                          {item.name}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#8a7a8e]">
                          {item.length} • Qty {item.quantity}
                        </p>
                      </div>

                      <p className="font-black text-[#2c2131]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {order.canReuploadPhotos && (
                  <div className="mt-6 rounded-[1.7rem] border border-[#f0b4cc] bg-[linear-gradient(135deg,rgba(255,240,247,.82),rgba(244,236,255,.78))] p-5">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45d88]">
                          Action needed
                        </p>
                        <h3 className="mt-2 font-display text-3xl font-black tracking-[-0.06em] text-[#2b2130]">
                          New hand photos requested.
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-[#756778]">
                          The studio needs clearer photos before production. Upload all three again so the order can move back to review.
                        </p>
                      </div>

                      <Link href="/photo-guide" className="btn-secondary w-fit">
                        Photo guide
                      </Link>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      {requiredPhotoTypes.map((photo) => (
                        <label
                          key={photo.type}
                          className="rounded-[1.35rem] border border-white/70 bg-white/56 p-4 shadow-[0_12px_34px_rgba(126,91,183,.09)]"
                        >
                          <span className="text-sm font-black text-[#2b2130]">
                            {photo.label}
                          </span>
                          <span className="mt-1 block text-xs font-semibold leading-5 text-[#8a7a8e]">
                            {photo.help}
                          </span>

                          <input
                            type="file"
                            accept="image/*"
                            className="mt-4 block w-full text-xs font-bold text-[#756778] file:mr-3 file:rounded-full file:border-0 file:bg-[#8c6fe8] file:px-4 file:py-2 file:text-xs file:font-black file:text-white"
                            onChange={(event) => handlePhotoChange(order.orderId, photo.type, event)}
                            disabled={isUploading}
                          />

                          {selectedFiles[photo.type] && (
                            <span className="mt-3 block truncate text-xs font-bold text-[#6f6372]">
                              Selected: {selectedFiles[photo.type]?.name}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReupload(order)}
                      disabled={isUploading}
                      className="btn-primary mt-5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUploading ? 'Uploading new photos...' : 'Submit new photos'}
                    </button>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href={`/track-order?order=${encodeURIComponent(order.orderId)}`} className="btn-secondary">
                    Track order
                  </Link>
                  <Link href="/photo-guide" className="btn-secondary">
                    Photo guide
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function MyOrdersPage() {
  return (
    <AuthGate
      requiredRole="customer"
      title="Login to see your orders."
      description="Your BILLi&BoBA orders are connected to your customer account."
    >
      <OrdersContent />
    </AuthGate>
  );
}