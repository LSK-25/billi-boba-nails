'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEventHandler } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';
import { createCheckoutOrder } from '@/lib/commerce-orders';
import { validateImageFile } from '@/lib/checkout-validation';
import { savePreviewOrder } from '@/lib/preview-orders';
import type { StoredOrder } from '@/lib/preview-orders';
import { formatPrice } from '@/lib/utils';
import type { CartLine } from '@/types';

type PhotoPreview = {
  fileName: string;
  dataUrl: string;
  file: File;
};

type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailedResponse = {
  error?: {
    description?: string;
  };
};

type RazorpayPaymentPayload = {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
  handler: (response: RazorpayCheckoutResponse) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: 'payment.failed', callback: (response: RazorpayFailedResponse) => void) => void;
    };
  }
}

function readPhoto(
  event: ChangeEvent<HTMLInputElement>,
  label: string,
  onReady: (preview: PhotoPreview | null) => void,
  onError: (message: string) => void,
) {
  const file = event.target.files?.[0];

  if (!file) {
    onReady(null);
    return;
  }

  const validationError = validateImageFile(file, label);

  if (validationError) {
    event.target.value = '';
    onReady(null);
    onError(validationError);
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    onReady({
      fileName: file.name,
      dataUrl: String(reader.result),
      file,
    });
  };

  reader.readAsDataURL(file);
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function createRazorpayPayment(orderNumber: string): Promise<RazorpayPaymentPayload> {
  const response = await fetch('/api/razorpay/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderNumber }),
  });

  const payload = (await response.json()) as {
    keyId?: string;
    razorpayOrderId?: string;
    amount?: number;
    currency?: string;
    error?: string;
  };

  if (!response.ok || !payload.keyId || !payload.razorpayOrderId || !payload.amount || !payload.currency) {
    throw new Error(payload.error ?? 'Could not start Razorpay payment.');
  }

  return {
    keyId: payload.keyId,
    razorpayOrderId: payload.razorpayOrderId,
    amount: payload.amount,
    currency: payload.currency,
  };
}

async function verifyRazorpayPayment(orderNumber: string, response: RazorpayCheckoutResponse) {
  const verifyResponse = await fetch('/api/razorpay/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderNumber,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    }),
  });

  const payload = (await verifyResponse.json()) as {
    ok?: boolean;
    error?: string;
  };

  if (!verifyResponse.ok || !payload.ok) {
    throw new Error(payload.error ?? 'Payment verification failed.');
  }
}

function PhotoUploadBox({
  label,
  preview,
  onChange,
  onError,
  required,
}: {
  label: string;
  preview: PhotoPreview | null;
  onChange: (preview: PhotoPreview | null) => void;
  onError: (message: string) => void;
  required?: boolean;
}) {
  return (
    <label className="group relative min-h-[190px] cursor-pointer overflow-hidden rounded-[1.55rem] border border-dashed border-[#bdaaff]/75 bg-white/42 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/62 hover:shadow-[0_18px_46px_rgba(126,91,183,.13)]">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        required={required}
        onChange={(event) => readPhoto(event, label, onChange, onError)}
      />

      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.dataUrl}
            alt={`${label} preview`}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <span className="absolute inset-x-3 bottom-3 rounded-[1rem] border border-white/70 bg-white/70 px-3 py-2 text-xs font-black text-[#5f5263] backdrop-blur-xl">
            {preview.fileName}
          </span>
        </>
      ) : (
        <div className="grid h-full min-h-[158px] place-items-center text-center">
          <div>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f0e9ff] text-xl text-[#6d3fb1] transition group-hover:scale-105">
              +
            </span>
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
  const [submitError, setSubmitError] = useState('');
  const [checkoutSnapshot, setCheckoutSnapshot] = useState<CartLine[] | null>(null);

  const displayLines = checkoutSnapshot ?? lines;

  const displaySubtotal = checkoutSnapshot
    ? checkoutSnapshot.reduce((total, item) => total + item.set.price * item.quantity, 0)
    : subtotal;

  const itemCount = useMemo(() => {
    return displayLines.reduce((sum, item) => sum + item.quantity, 0);
  }, [displayLines]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (displayLines.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');
    setCheckoutSnapshot(lines);

    const formData = new FormData(event.currentTarget);

    const customerName = String(formData.get('name') ?? '').trim();
    const customerPhone = String(formData.get('phone') ?? '').trim();
    const customerEmail = String(formData.get('email') ?? '').trim();

    const addressLine1 = String(formData.get('addressLine1') ?? '').trim();
    const addressLine2 = String(formData.get('addressLine2') ?? '').trim();
    const city = String(formData.get('city') ?? '').trim();
    const state = String(formData.get('state') ?? '').trim();
    const postalCode = String(formData.get('postalCode') ?? '').trim();
    const customerNote = String(formData.get('customerNote') ?? '').trim();

    if (!leftHand?.file || !rightHand?.file) {
      setSubmitError('Please upload both left and right hand photos.');
      setIsSubmitting(false);
      return;
    }

    const photos = [
      {
        photoType: 'left_hand' as const,
        file: leftHand.file,
      },
      {
        photoType: 'right_hand' as const,
        file: rightHand.file,
      },
      ...(lengthReference?.file
        ? [
            {
              photoType: 'length_reference' as const,
              file: lengthReference.file,
            },
          ]
        : []),
    ];

    try {
      const createdOrder = await createCheckoutOrder({
        lines: displayLines,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        address: {
          line1: addressLine1,
          line2: addressLine2,
          city,
          state,
          postalCode,
          country: 'India',
        },
        note: customerNote,
        photos,
      });

      const previewOrder: StoredOrder = {
        orderId: createdOrder.orderId,
        trackingId: createdOrder.trackingId,
        createdAt: createdOrder.createdAt,
        status: 'Photos under review',
        accountEmail: user?.email?.trim().toLowerCase() || customerEmail.toLowerCase(),
        itemCount,
        subtotal: createdOrder.subtotal,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: [addressLine1, addressLine2, city, state, postalCode, 'India'].filter(Boolean).join(', '),
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

      const razorpayPayment = await createRazorpayPayment(createdOrder.orderId);
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Could not load Razorpay Checkout. Check your internet connection.');
      }

      const razorpay = new window.Razorpay({
        key: razorpayPayment.keyId,
        amount: razorpayPayment.amount,
        currency: razorpayPayment.currency,
        name: 'BILLi BoBA NAILS',
        description: `Order ${createdOrder.orderId}`,
        order_id: razorpayPayment.razorpayOrderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: '#8c6fe8',
        },
        modal: {
          ondismiss: () => {
            setSubmitError('Payment was not completed. Your order is saved as payment pending.');
            setIsSubmitting(false);
          },
        },
        handler: async (paymentResponse) => {
          try {
            await verifyRazorpayPayment(createdOrder.orderId, paymentResponse);
            savePreviewOrder(previewOrder);
            clearCart();
            router.push(`/order-confirmed?order=${encodeURIComponent(createdOrder.orderId)}`);
          } catch (caughtError) {
            const message = caughtError instanceof Error ? caughtError.message : 'Payment verification failed.';
            setSubmitError(message);
            setIsSubmitting(false);
          }
        },
      });

      razorpay.on('payment.failed', (failedResponse) => {
        setSubmitError(failedResponse.error?.description ?? 'Payment failed. Please try again.');
        setIsSubmitting(false);
      });

      razorpay.open();
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Could not confirm your order. Please try again.';
      setSubmitError(message);
      setIsSubmitting(false);
    }
  };

  if (!isSubmitting && lines.length === 0) {
    return (
      <section className="page-shell py-14">
        <span className="pill">Checkout</span>

        <div className="mt-8 liquid-glass grid gap-5 rounded-[2rem] p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h1 className="font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">
              Nothing to checkout.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-[#756778]">
              Add a nail set to your cart first, then come back here for address, hand photos and payment.
            </p>
          </div>

          <Link href="/shop" className="btn-primary w-fit">
            Browse sets
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell py-14">
      <span className="pill">Checkout</span>

      <h1 className="mt-5 font-display text-5xl font-black tracking-[-0.07em] md:text-7xl">
        Confirm your set
      </h1>

      <p className="mt-4 max-w-2xl text-base leading-8 text-[#756778]">
        Your order will be saved first, then Razorpay will open for secure payment.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <form onSubmit={handleSubmit} className="liquid-glass grid gap-6 rounded-[2rem] p-6 md:p-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Contact</p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                name="name"
                className="input-field"
                placeholder="Full name"
                autoComplete="name"
                defaultValue={user?.name ?? ''}
                required
              />

              <input
                name="phone"
                className="input-field"
                placeholder="Phone number"
                autoComplete="tel"
                required
              />
            </div>

            <input
              name="email"
              className="input-field mt-4"
              placeholder="Email address"
              type="email"
              autoComplete="email"
              defaultValue={user?.email ?? ''}
              required
            />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Delivery</p>

            <div className="mt-4 grid gap-4">
              <input
                name="addressLine1"
                className="input-field"
                placeholder="House / flat / building / street"
                autoComplete="address-line1"
                required
              />

              <input
                name="addressLine2"
                className="input-field"
                placeholder="Area / landmark / optional"
                autoComplete="address-line2"
              />

              <div className="grid gap-4 md:grid-cols-3">
                <input
                  name="city"
                  className="input-field"
                  placeholder="City"
                  autoComplete="address-level2"
                  required
                />

                <input
                  name="state"
                  className="input-field"
                  placeholder="State"
                  autoComplete="address-level1"
                  required
                />

                <input
                  name="postalCode"
                  className="input-field"
                  placeholder="PIN code"
                  autoComplete="postal-code"
                  required
                />
              </div>

              <textarea
                name="customerNote"
                className="input-field min-h-24"
                placeholder="Order note, preferred details, or timing request optional"
              />
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-[#4a314e1c] bg-white/42 p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d738f]">Hand photos</p>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756778]">
                  Before uploading, open the photo guide once. Use a clear top-view photo and place a Rs.10 coin beside
                  your nails as the size reference.
                </p>
              </div>

              <Link href="/photo-guide" className="btn-primary px-4 py-2 text-xs">
                View photo guide
              </Link>
            </div>

            <div className="mt-5 rounded-[1.35rem] border border-[#d8ccff66] bg-[linear-gradient(135deg,rgba(255,232,245,.62),rgba(238,230,255,.72))] p-4 text-sm font-semibold leading-6 text-[#66566c] backdrop-blur-2xl">
              Photo checklist: full hand visible, taken directly from above, good lighting, no blur, and one Rs.10 coin
              placed beside the nails.
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
             <PhotoUploadBox label="Left hand photo with coin" preview={leftHand} onChange={setLeftHand} onError={setSubmitError} required />
<PhotoUploadBox label="Right hand photo with coin" preview={rightHand} onChange={setRightHand} onError={setSubmitError} required />
            </div>

            <div className="mt-4">
              <PhotoUploadBox label="Optional length reference" preview={lengthReference} onChange={setLengthReference} onError={setSubmitError} />
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm font-semibold leading-6 text-[#6f6372]">
            <input className="mt-1" type="checkbox" required />
            I confirm my hand photos are clear, both hands are visible and the photos follow the coin-reference guide.
          </label>

          {submitError && (
            <div className="rounded-[1.4rem] border border-[#ee77a640] bg-white/62 p-4 text-sm font-bold leading-6 text-[#8d3d63]">
              {submitError}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Opening Razorpay...' : 'Pay with Razorpay'}
          </button>
        </form>

        <aside className="liquid-glass h-fit rounded-[2rem] p-6 md:p-7 lg:sticky lg:top-28">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Order summary</h2>

          <div className="mt-5 grid gap-3">
            {displayLines.map((item) => (
              <div key={item.cartId} className="overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/45">
                {item.set.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.set.imageUrl} alt={item.set.name} className="h-36 w-full object-cover" />
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6e5971]">{item.set.code}</p>

                      <h3 className="mt-2 font-display text-2xl font-black tracking-[-0.06em]">
                        {item.set.name}
                      </h3>

                      <p className="mt-2 text-sm font-bold text-[#6d5871]">
                        {item.length} • Qty {item.quantity}
                      </p>
                    </div>

                    <p className="font-black">{formatPrice(item.set.price * item.quantity)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 text-sm font-bold text-[#6d5871]">
            <div className="flex justify-between">
              <span>Items</span>
              <span>{itemCount}</span>
            </div>

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(displaySubtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Rs.0 for now</span>
            </div>

            <div className="flex justify-between border-t border-[#4a314e1c] pt-3 text-[#241a29]">
              <span>Total</span>
              <span>{formatPrice(displaySubtotal)}</span>
            </div>
          </div>

          <p className="mt-5 rounded-[1.4rem] border border-[#4a314e1c] bg-white/45 p-4 text-xs font-semibold leading-5 text-[#8a7a8e]">
            Payment opens through Razorpay Checkout. Payment is marked paid only after server signature
            verification.
          </p>
        </aside>
      </div>
    </section>
  );
}

