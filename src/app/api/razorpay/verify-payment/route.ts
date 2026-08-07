import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { sendOrderPaymentEmails } from '@/lib/order-emails';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

type VerifyPaymentBody = {
  orderNumber?: unknown;
  razorpay_order_id?: unknown;
  razorpay_payment_id?: unknown;
  razorpay_signature?: unknown;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidOrderNumber(value: string) {
  return /^[a-zA-Z0-9_-]{3,60}$/.test(value);
}

function isValidRazorpayOrderId(value: string) {
  return /^order_[a-zA-Z0-9]{8,40}$/.test(value);
}

function isValidRazorpayPaymentId(value: string) {
  return /^pay_[a-zA-Z0-9]{8,40}$/.test(value);
}

function isValidRazorpaySignature(value: string) {
  return /^[a-fA-F0-9]{64}$/.test(value);
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: Request) {
  try {
        const limitResult = rateLimit({
      key: `razorpay:verify:${getClientIp(request)}`,
      limit: 12,
      windowMs: 60 * 1000,
    });

    if (!limitResult.ok) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please wait a minute and try again.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limitResult.retryAfterSeconds),
          },
        },
      );
    }
    const body = (await request.json()) as VerifyPaymentBody;

    const orderNumber = cleanString(body.orderNumber);
    const razorpayOrderId = cleanString(body.razorpay_order_id);
    const razorpayPaymentId = cleanString(body.razorpay_payment_id);
    const razorpaySignature = cleanString(body.razorpay_signature);
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!orderNumber || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return jsonError('Missing payment verification details.', 400);
    }

    if (
      !isValidOrderNumber(orderNumber) ||
      !isValidRazorpayOrderId(razorpayOrderId) ||
      !isValidRazorpayPaymentId(razorpayPaymentId) ||
      !isValidRazorpaySignature(razorpaySignature)
    ) {
      return jsonError('Invalid payment verification details.', 400);
    }

    if (!keySecret) {
      console.error('Missing RAZORPAY_KEY_SECRET.');
      return jsonError('Payment verification is not configured.', 500);
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (!safeCompare(expectedSignature, razorpaySignature)) {
      console.error('Razorpay signature mismatch:', {
        orderNumber,
        razorpayOrderId,
        razorpayPaymentId,
      });

      return jsonError('Payment verification failed.', 400);
    }

    const supabase = await createServerSupabaseClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return jsonError('Please login again.', 401);
    }

    const { data: markedPaid, error } = await supabase.rpc('mark_razorpay_payment_paid', {
      raw_order_number: orderNumber,
      raw_razorpay_order_id: razorpayOrderId,
      raw_razorpay_payment_id: razorpayPaymentId,
      raw_razorpay_signature: razorpaySignature,
    });

    if (error || !markedPaid) {
      console.error('Mark Razorpay payment paid failed:', error?.message);
      return jsonError('Could not confirm this payment. Please contact the studio.', 400);
    }

    try {
      await sendOrderPaymentEmails(orderNumber);
    } catch (emailError) {
      console.error('Order email sending failed:', emailError);
    }

    return NextResponse.json({ ok: true });
  } catch (caughtError) {
    console.error('Verify Razorpay payment route failed:', caughtError);
    return jsonError('Could not verify payment. Please contact the studio if money was deducted.', 500);
  }
}