import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
};

function getRazorpayCredentials() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Missing Razorpay test keys in .env.local.');
  }

  return { keyId, keySecret };
}

export async function POST(request: Request) {
  try {
    const { orderNumber } = (await request.json()) as { orderNumber?: string };

    if (!orderNumber?.trim()) {
      return NextResponse.json({ error: 'Missing order number.' }, { status: 400 });
    }

    const { keyId, keySecret } = getRazorpayCredentials();
    const supabase = await createServerSupabaseClient();

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return NextResponse.json({ error: 'Please login again.' }, { status: 401 });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, total_inr, currency, payment_status')
      .eq('order_number', orderNumber)
      .eq('customer_id', authData.user.id)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ error: 'This order is already paid.' }, { status: 400 });
    }

    const amountInPaise = Math.round(Number(order.total_inr) * 100);

    if (!amountInPaise || amountInPaise < 100) {
      return NextResponse.json({ error: 'Invalid order amount.' }, { status: 400 });
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
      return NextResponse.json(
        { error: razorpayOrder.error?.description ?? 'Could not create Razorpay order.' },
        { status: 400 },
      );
    }

    const { data: attached, error: attachError } = await supabase.rpc('attach_razorpay_order', {
      raw_order_number: order.order_number,
      raw_razorpay_order_id: razorpayOrder.id,
    });

    if (attachError || !attached) {
      return NextResponse.json(
        { error: attachError?.message ?? 'Could not attach Razorpay order.' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      keyId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderNumber: order.order_number,
    });
  } catch (caughtError) {
    const message = caughtError instanceof Error ? caughtError.message : 'Could not create payment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}