'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';
import { makeOrderId, makeTrackingId, savePreviewOrder } from '@/lib/preview-orders';
import type { StoredOrder } from '@/lib/preview-orders';
import { formatPrice } from '@/lib/utils';
import type { CartLine } from '@/types';

type PhotoPreview = {
  fileName: string;
  dataUrl: string;
};


function readPhoto(event: ChangeEvent<HTMLInputElement>, onReady: (preview: PhotoPreview | null) => void) {
  const file = event.target.files?.[0];

  if (!file) {
    onReady(null);
    return;
  }

  if (!file.type.startsWith('image/')) {
    onReady(null);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    onReady({ fileName: file.name, dataUrl: String(reader.result) });
  };
  reader.readAsDataURL(file);
}

function PhotoUploadBox({
  label,
  preview,
  onChange,
  required,
}: {
  label: string;
  preview: PhotoPreview | null;
  onChange: (preview: PhotoPreview | null) => void;
  required?: boolean;
}) {
  return (
    <label className="group relative min-h-[190px] cursor-pointer overflow-hidden rounded-[1.55rem] border border-dashed border-[#bdaaff]/75 bg-white/42 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/62 hover:shadow-[0_18px_46px_rgba(126,91,183,.13)]">
      <input type="file" accept="image/*" className="hidden" required={required} onChange={(event) => readPhoto(event, onChange)} />
      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview.dataUrl} alt={`${label} preview`} className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-x-3 bottom-3 rounded-[1rem] border border-white/70 bg-white/70 px-3 py-2 text-xs font-black text-[#5f5263] backdrop-blur-xl">
            {preview.fileName}
          </span>
        </>
      ) : (
        <div className="grid h-full min-h-[158px] place-items-center text-center">
          <div>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f0e9ff] text-xl text-[#6d3fb1] transition group-hover:scale-105">＋</span>
            <p className="mt-3 text-sm font-black text-[#3b3040]">{label}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-[#8a7a8e]">Tap to upload image</p>
          </div>
        </div>
      )}
    </label>
  );
}

export default function CheckoutClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { lines, subtotal, clearCart } = useCart();
  const [leftHand, setLeftHand] = useState<PhotoPreview | null>(null);
  const [rightHand, setRightHand] = useState<PhotoPreview | null>(null);
  const [lengthReference, setLengthReference] = useState<PhotoPreview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSnapshot, setCheckoutSnapshot] = useState<CartLine[] | null>(null);

  const displayLines = checkoutSnapshot ?? lines;
  const displaySubtotal = checkoutSnapshot
    ? checkoutSnapshot.reduce((total, item) => total + item.set.price * item.quantity, 0)
    : subtotal;

  const itemCount = useMemo(() => displayLines.reduce((sum, item) => sum + item.quantity, 0), [displayLines]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (displayLines.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setCheckoutSnapshot(lines);

    const formData = new FormData(event.currentTarget);
    const customerName = String(formData.get('name') ?? '').trim();
    const customerPhone = String(formData.get('phone') ?? '').trim();
    const customerEmail = String(formData.get('email') ?? '').trim();
    const customerAddress = String(formData.get('address') ?? '').trim();

    const orderId = makeOrderId();
    const trackingId = makeTrackingId();
    const previewOrder: StoredOrder = {
      orderId,
      trackingId,
      createdAt: new Date().toISOString(),
      status: 'Order confirmed',
      accountEmail: user?.email?.trim().toLowerCase() || customerEmail.toLowerCase(),
      itemCount,
      subtotal: displaySubtotal,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
      },
      items: displayLines.map((item) => ({
        cartId: item.cartId,
        code: item.set.code,
        name: item.set.name,
        length: item.length,
        quantity: item.quantity,
        price: item.set.price,
      })),
    };

    savePreviewOrder(previewOrder);
    router.push(`/order-confirmed?order=${encodeURIComponent(orderId)}`);

    window.setTimeout(() => {
      clearCart();
    }, 250);
  };

  if (!isSubmitting && lines.length === 0) {
    return (
      <section className="page-shell py-14">
        <span className="pill">Checkout</span>
        <div className="mt-8 liquid-glass grid gap-5 rounded-[2rem] p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h1 className="font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">Nothing to checkout.</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#756778]">
              Add a nail set to your cart first, then come back here for address, hand photos and payment.
            </p>
          </div>
          <Link href="/shop" className="btn-primary w-fit">Browse sets</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell py-14">
      <span className="pill">Checkout</span>
      <h1 className="mt-5 font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">Confirm your set</h1>
      <p className="mt-4 max-w-2xl text-base leading-8 text-[#756778]">
        Address, hand photos and final review stay in one calm flow before the payment step connects later.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <form onSubmit={handleSubmit} className="liquid-glass grid gap-6 rounded-[2rem] p-6 md:p-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Contact</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input name="name" className="input-field" placeholder="Full name" autoComplete="name" defaultValue={user?.name ?? ''} required />
              <input name="phone" className="input-field" placeholder="Phone number" autoComplete="tel" required />
            </div>
            <input name="email" className="input-field mt-4" placeholder="Email address" type="email" autoComplete="email" defaultValue={user?.email ?? ''} required />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Delivery</p>
            <textarea name="address" className="input-field mt-4 min-h-28" placeholder="Full delivery address" autoComplete="street-address" required />
          </div>

          <div className="rounded-[1.8rem] border border-[#4a314e1c] bg-white/42 p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Hand photos</p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756778]">
                  Before uploading, open the photo guide once. Use a clear top-view photo and place a ₹10 coin beside your nails as the size reference.
                </p>
              </div>
              <Link href="/photo-guide" className="btn-primary px-4 py-2 text-xs">View photo guide</Link>
            </div>
            <div className="mt-5 rounded-[1.35rem] border border-[#d8ccff66] bg-[linear-gradient(135deg,rgba(255,232,245,.62),rgba(238,230,255,.72))] p-4 text-sm font-semibold leading-6 text-[#66566c] backdrop-blur-2xl">
              Photo checklist: full hand visible, taken directly from above, good lighting, no blur, and one ₹10 coin placed beside the nails.
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <PhotoUploadBox label="Left hand photo with coin" preview={leftHand} onChange={setLeftHand} required />
              <PhotoUploadBox label="Right hand photo with coin" preview={rightHand} onChange={setRightHand} required />
            </div>
            <div className="mt-4">
              <PhotoUploadBox label="Optional length reference" preview={lengthReference} onChange={setLengthReference} />
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm font-semibold leading-6 text-[#6f6372]">
            <input className="mt-1" type="checkbox" required />
            I confirm my hand photos are clear, both hands are visible and the photos follow the coin-reference guide.
          </label>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Confirming order...' : 'Continue to payment'}
          </button>
        </form>

        <aside className="liquid-glass h-fit rounded-[2rem] p-6 md:p-7 lg:sticky lg:top-28">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Order summary</h2>
          <div className="mt-5 grid gap-3">
            {displayLines.map((item) => (
              <div key={item.cartId} className="rounded-[1.5rem] border border-white/60 p-4" style={{ background: `linear-gradient(135deg, ${item.set.tone}, #fff, ${item.set.accentTone})` }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6e5971]">{item.set.code}</p>
                    <h3 className="mt-2 font-display text-2xl font-black tracking-[-0.06em]">{item.set.name}</h3>
                    <p className="mt-2 text-sm font-bold text-[#6d5871]">{item.length} • Qty {item.quantity}</p>
                  </div>
                  <p className="font-black">{formatPrice(item.set.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 text-sm font-bold text-[#6d5871]">
            <div className="flex justify-between"><span>Items</span><span>{itemCount}</span></div>
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(displaySubtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>Calculated next</span></div>
            <div className="flex justify-between border-t border-[#4a314e1c] pt-3 text-[#241a29]"><span>Total preview</span><span>{formatPrice(displaySubtotal)}</span></div>
          </div>
          <p className="mt-5 rounded-[1.4rem] border border-[#4a314e1c] bg-white/45 p-4 text-xs font-semibold leading-5 text-[#8a7a8e]">
            Razorpay will connect in the backend milestone. For now, this confirms the frontend flow only.
          </p>
        </aside>
      </div>
    </section>
  );
}
