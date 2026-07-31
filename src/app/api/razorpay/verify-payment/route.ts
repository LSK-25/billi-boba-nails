import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

type VerifyPaymentBody = {
  orderNumber?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyPaymentBody;

    const orderNumber = body.orderNumber?.trim();
    const razorpayOrderId = body.razorpay_order_id?.trim();
    const razorpayPaymentId = body.razorpay_payment_id?.trim();
    const razorpaySignature = body.razorpay_signature?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!orderNumber || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing payment verification details.' }, { status: 400 });
    }

    if (!keySecret) {
      return NextResponse.json({ error: 'Missing Razorpay secret key.' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (!safeCompare(expectedSignature, razorpaySignature)) {
      return NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return NextResponse.json({ error: 'Please login again.' }, { status: 401 });
    }

    const { data: markedPaid, error } = await supabase.rpc('mark_razorpay_payment_paid', {
      raw_order_number: orderNumber,
      raw_razorpay_order_id: razorpayOrderId,
      raw_razorpay_payment_id: razorpayPaymentId,
      raw_razorpay_signature: razorpaySignature,
    });

    if (error || !markedPaid) {
      return NextResponse.json(
        { error: error?.message ?? 'Could not mark payment as paid.' },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (caughtError) {
    const message = caughtError instanceof Error ? caughtError.message : 'Could not verify payment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}