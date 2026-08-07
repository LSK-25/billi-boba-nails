import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isValidOrderNumber(value: string) {
  return /^[a-zA-Z0-9_-]{3,60}$/.test(value);
}

function getRazorpayCredentials() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are missing.');
  }

  return { keyId, keySecret };
}

export async function POST(request: Request) {
  try {
        const limitResult = rateLimit({
      key: `razorpay:create:${getClientIp(request)}`,
      limit: 8,
      windowMs: 60 * 1000,
    });

    if (!limitResult.ok) {
      return NextResponse.json(
        { error: 'Too many payment attempts. Please wait a minute and try again.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limitResult.retryAfterSeconds),
          },
        },
      );
    }
    const body = (await request.json()) as { orderNumber?: unknown };
    const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim() : '';

    if (!orderNumber) {
      return jsonError('Missing order number.', 400);
    }

    if (!isValidOrderNumber(orderNumber)) {
      return jsonError('Invalid order number.', 400);
    }

    const { keyId, keySecret } = getRazorpayCredentials();
    const supabase = await createServerSupabaseClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return jsonError('Please login again.', 401);
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, total_inr, currency, payment_status')
      .eq('order_number', orderNumber)
      .eq('customer_id', authData.user.id)
      .maybeSingle();

    if (orderError) {
      console.error('Create Razorpay order lookup failed:', orderError.message);
      return jsonError('Could not find this order.', 404);
    }

    if (!order) {
      return jsonError('Order not found.', 404);
    }

    if (order.payment_status === 'paid') {
      return jsonError('This order is already paid.', 400);
    }

    const amountInPaise = Math.round(Number(order.total_inr) * 100);

    if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
      console.error('Invalid payment amount for order:', order.order_number, order.total_inr);
      return jsonError('Invalid order amount.', 400);
    }

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: order.currency || 'INR',
        receipt: order.order_number,
        notes: {
          billiboba_order_number: order.order_number,
        },
      }),
    });

    const razorpayOrder = (await razorpayResponse.json()) as Partial<RazorpayOrderResponse> & {
      error?: { description?: string };
    };

    if (!razorpayResponse.ok || !razorpayOrder.id) {
      console.error('Razorpay order creation failed:', {
        status: razorpayResponse.status,
        description: razorpayOrder.error?.description,
      });

      return jsonError('Could not start payment. Please try again.', 400);
    }

    if (!Number.isFinite(razorpayOrder.amount) || razorpayOrder.amount !== amountInPaise) {
      console.error('Razorpay amount mismatch:', {
        orderNumber: order.order_number,
        expected: amountInPaise,
        received: razorpayOrder.amount,
      });

      return jsonError('Payment amount could not be verified.', 400);
    }

    const { data: attached, error: attachError } = await supabase.rpc('attach_razorpay_order', {
      raw_order_number: order.order_number,
      raw_razorpay_order_id: razorpayOrder.id,
    });

    if (attachError || !attached) {
      console.error('Attach Razorpay order failed:', attachError?.message);
      return jsonError('Could not prepare this payment. Please try again.', 400);
    }

    return NextResponse.json({
      keyId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || 'INR',
      orderNumber: order.order_number,
    });
  } catch (caughtError) {
    console.error('Create Razorpay order route failed:', caughtError);
    return jsonError('Could not create payment. Please try again.', 500);
  }
}