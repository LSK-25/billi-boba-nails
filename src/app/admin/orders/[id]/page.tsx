'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminShell from '@/components/AdminShell';
import {
  adminOrderStatusOptions,
  getAdminOrder,
  updateAdminOrderStatus,
  updateAdminPhotoReview,
  type AdminHandPhoto,
  type AdminOrder,
} from '@/lib/admin-orders';
import { formatPrice } from '@/lib/utils';

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusValue, setStatusValue] = useState('order_confirmed');
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<AdminHandPhoto | null>(null);

  async function loadOrder() {
    setLoading(true);
    const nextOrder = await getAdminOrder(decodeURIComponent(orderId));
    setOrder(nextOrder);
    setStatusValue(nextOrder?.status ?? 'order_confirmed');
    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    getAdminOrder(decodeURIComponent(orderId)).then((nextOrder) => {
      if (!active) return;
      setOrder(nextOrder);
      setStatusValue(nextOrder?.status ?? 'order_confirmed');
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [orderId]);

  async function handleApprovePhotos() {
    if (!order || saving) return;

    setSaving(true);
    setMessage('');

    try {
      await updateAdminPhotoReview({
        orderId: order.id,
        reviewStatus: 'approved',
        note: adminNote,
      });

      setMessage('Photos approved.');
      await loadOrder();
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : 'Could not approve photos.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRequestNewPhotos() {
  if (!order || saving) return;

  setSaving(true);
  setMessage('');

  const requestNote = adminNote || 'Please upload clearer hand photos with the coin reference.';

  try {
    await updateAdminPhotoReview({
      orderId: order.id,
      reviewStatus: 'request_reupload',
      note: requestNote,
    });

    const emailResponse = await fetch('/api/admin/photo-request-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: order.id,
        note: requestNote,
      }),
    });

    const emailPayload = (await emailResponse.json().catch(() => null)) as {
      sent?: boolean;
      message?: string;
      error?: string;
    } | null;

    if (emailResponse.ok && emailPayload?.sent) {
      setMessage('New photos requested. Customer email sent.');
    } else {
      setMessage(
        `New photos requested. Email not sent: ${
          emailPayload?.message || emailPayload?.error || 'Check Resend settings.'
        }`,
      );
    }

    await loadOrder();
  } catch (caughtError) {
    setMessage(caughtError instanceof Error ? caughtError.message : 'Could not request new photos.');
  } finally {
    setSaving(false);
  }
}

  async function handleSaveStatus() {
    if (!order || saving) return;

    setSaving(true);
    setMessage('');

    try {
      await updateAdminOrderStatus({
        orderId: order.id,
        status: statusValue,
        note: adminNote,
      });

      setMessage('Order status updated.');
      await loadOrder();
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : 'Could not update order status.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell
        eyebrow="Order detail"
        title="Loading order..."
        description="Fetching the real Supabase order and private hand photo previews."
        action={<Link href="/admin/orders" className="btn-secondary w-fit">Back to orders</Link>}
      >
        <div className="liquid-glass rounded-[2rem] p-8">
          <p className="font-black text-[#34263c]">Loading order details...</p>
        </div>
      </AdminShell>
    );
  }

  if (!order) {
    return (
      <AdminShell
        eyebrow="Order detail"
        title="Order not found"
        description="This order was not found in Supabase, or this admin account does not have access."
        action={<Link href="/admin/orders" className="btn-secondary w-fit">Back to orders</Link>}
      >
        <div className="liquid-glass rounded-[2rem] p-8">
          <p className="font-black text-[#34263c]">No matching order found.</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <>
      <AdminShell
        eyebrow="Order detail"
        title={order.orderNumber}
        description="Review customer details, ordered products, uploaded hand photos and production progress from Supabase."
        action={<Link href="/admin/orders" className="btn-secondary w-fit">Back to orders</Link>}
      >
        <div className="grid gap-6 xl:grid-cols-[1fr_.85fr]">
          <div className="grid gap-6">
            <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9a7d9c]">Ordered products</p>
                  <h2 className="mt-2 font-display text-4xl font-black tracking-[-0.06em]">
                    {order.items[0]?.name ?? 'Nail set'}
                  </h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#756778]">
                    Tracking ID: <span className="font-black text-[#3b3040]">{order.trackingCode}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="w-fit rounded-full bg-[#f4eaff] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#6d3fb1]">
                    {order.statusLabel}
                  </span>
                  <span className="w-fit rounded-full bg-[#fff0f7] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#b04e79]">
                    {order.paymentStatusLabel}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-[1.35rem] border border-white/55 bg-white/38 p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8d738f]">{item.code}</p>
                        <p className="mt-1 font-display text-2xl font-black tracking-[-0.05em] text-[#34263c]">{item.name}</p>
                        <p className="mt-1 text-sm font-semibold text-[#756778]">
                          {item.length} • {item.shape ?? 'Custom shape'} • Qty {item.quantity}
                        </p>
                      </div>
                      <p className="font-black text-[#34263c]">{formatPrice(item.lineTotal)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['Tracking ID', order.trackingCode],
                  ['Photo status', order.photoStatusLabel],
                  ['Items', String(order.items.reduce((sum, item) => sum + item.quantity, 0))],
                  ['Total', formatPrice(order.totals.total)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.35rem] border border-white/55 bg-white/38 p-4">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8d738f]">{label}</p>
                    <p className="mt-2 font-black text-[#34263c]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
              <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Hand photo review</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#756778]">
                Tap a photo to zoom. Use Open or Download to save the full private signed photo.
              </p>

              {order.photos.length === 0 ? (
                <div className="mt-5 grid min-h-52 place-items-center rounded-[1.6rem] border border-dashed border-[#cbb8ff] bg-white/35 p-4 text-center">
                  <div>
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[linear-gradient(135deg,#ffe1ed,#e8dcff)] text-2xl">○</div>
                    <p className="mt-3 text-sm font-black text-[#3b3040]">No hand photos found</p>
                    <p className="mt-1 text-xs font-semibold text-[#756778]">Ask customer to upload again later.</p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {order.photos.map((photo) => {
                    const photoUrl = photo.signedUrl ?? photo.imageUrl ?? '';

                    return (
                      <div key={photo.id} className="overflow-hidden rounded-[1.6rem] border border-white/60 bg-white/38">
                        <button
                          type="button"
                          onClick={() => setSelectedPhoto(photo)}
                          className="relative block h-72 w-full bg-[linear-gradient(135deg,#ffe1ed,#e8dcff)]"
                        >
                          {photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={photoUrl}
                              alt={photo.photoTypeLabel}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="grid h-full place-items-center text-center">
                              <div>
                                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/55 text-2xl">○</div>
                                <p className="mt-3 text-sm font-black text-[#3b3040]">Preview unavailable</p>
                              </div>
                            </div>
                          )}
                        </button>

                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-black text-[#3b3040]">{photo.photoTypeLabel}</p>
                              <p className="mt-1 text-xs font-bold text-[#8a728d]">{photo.reviewStatusLabel}</p>
                            </div>
                            <span className="rounded-full bg-[#fff0f7] px-3 py-1 text-xs font-black text-[#b04e79]">
                              {photo.reviewStatusLabel}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button type="button" onClick={() => setSelectedPhoto(photo)} className="btn-secondary px-4 py-2 text-xs">
                              Zoom
                            </button>
                            {photoUrl && (
                              <>
                                <a href={photoUrl} target="_blank" rel="noreferrer" className="btn-secondary px-4 py-2 text-xs">
                                  Open full
                                </a>
                                <a href={photoUrl} download className="btn-primary px-4 py-2 text-xs">
                                  Download
                                </a>
                              </>
                            )}
                          </div>

                          {photo.storagePath && (
                            <p className="mt-3 break-all text-[0.7rem] font-semibold leading-5 text-[#9a7d9c]">
                              {photo.storagePath}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={handleApprovePhotos} disabled={saving} className="btn-secondary">
                  {saving ? 'Saving...' : 'Approve photos'}
                </button>
                <button type="button" onClick={handleRequestNewPhotos} disabled={saving} className="btn-secondary">
                  {saving ? 'Saving...' : 'Request new photos'}
                </button>
                <Link href={`mailto:${order.customer.email}`} className="btn-primary text-center">
                  Message customer
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
              <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Customer</h2>
              <div className="mt-5 grid gap-3">
                {[
                  ['Name', order.customer.name],
                  ['Email', order.customer.email],
                  ['Phone', order.customer.phone],
                  ['City', order.shipping.city],
                  ['Address', order.shipping.address],
                  ['Placed', order.placedAt],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.3rem] border border-white/55 bg-white/38 p-4">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#8d738f]">{label}</p>
                    <p className="mt-2 font-bold text-[#34263c]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
              <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Update status</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#756778]">
                Change the production status and save a timeline note.
              </p>

              <label className="mt-5 grid gap-2 text-sm font-black text-[#4b3e51]">
                Production status
                <select className="input-field" value={statusValue} onChange={(event) => setStatusValue(event.target.value)}>
                  {adminOrderStatusOptions.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </label>

              <label className="mt-4 grid gap-2 text-sm font-black text-[#4b3e51]">
                Internal note
                <textarea
                  className="input-field min-h-28 resize-y"
                  value={adminNote}
                  onChange={(event) => setAdminNote(event.target.value)}
                  placeholder="Example: Photos approved, starting production today."
                />
              </label>

              {message && (
                <div className="mt-4 rounded-[1.35rem] border border-white/60 bg-white/55 p-4 text-sm font-bold leading-6 text-[#6d5871]">
                  {message}
                </div>
              )}

              <button type="button" onClick={handleSaveStatus} disabled={saving} className="btn-primary mt-5 w-full">
                {saving ? 'Saving status...' : 'Save status update'}
              </button>
            </div>
          </div>
        </div>
      </AdminShell>

      {selectedPhoto && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1e1624]/80 p-4 backdrop-blur-md">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/25 bg-white shadow-[0_30px_90px_rgba(0,0,0,.35)]">
            <div className="flex flex-col justify-between gap-3 border-b border-[#4a314e1c] p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-black text-[#2c2131]">{selectedPhoto.photoTypeLabel}</p>
                <p className="text-xs font-bold text-[#8a728d]">{selectedPhoto.reviewStatusLabel}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(selectedPhoto.signedUrl || selectedPhoto.imageUrl) && (
                  <>
                    <a href={selectedPhoto.signedUrl ?? selectedPhoto.imageUrl ?? ''} target="_blank" rel="noreferrer" className="btn-secondary px-4 py-2 text-xs">
                      Open full
                    </a>
                    <a href={selectedPhoto.signedUrl ?? selectedPhoto.imageUrl ?? ''} download className="btn-primary px-4 py-2 text-xs">
                      Download
                    </a>
                  </>
                )}
                <button type="button" onClick={() => setSelectedPhoto(null)} className="btn-secondary px-4 py-2 text-xs">
                  Close
                </button>
              </div>
            </div>

            <div className="grid max-h-[78vh] place-items-center overflow-auto bg-[#f8f1f6] p-4">
              {selectedPhoto.signedUrl || selectedPhoto.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedPhoto.signedUrl ?? selectedPhoto.imageUrl ?? ''}
                  alt={selectedPhoto.photoTypeLabel}
                  className="max-h-[72vh] w-auto max-w-full rounded-[1rem] object-contain"
                />
              ) : (
                <p className="p-10 font-black text-[#34263c]">Photo preview unavailable.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}