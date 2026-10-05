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

type RazorpayPaymentResponse = {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  captured?: boolean;
  error?: {
    description?: string;
  };
};

function jsonError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    { error: message },
    { status },
  );
}

function cleanString(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : '';
}

function isValidOrderNumber(
  value: string,
) {
  return /^[a-zA-Z0-9_-]{3,60}$/.test(
    value,
  );
}

function isValidRazorpayOrderId(
  value: string,
) {
  return /^order_[a-zA-Z0-9]{8,40}$/.test(
    value,
  );
}

function isValidRazorpayPaymentId(
  value: string,
) {
  return /^pay_[a-zA-Z0-9]{8,40}$/.test(
    value,
  );
}

function isValidRazorpaySignature(
  value: string,
) {
  return /^[a-fA-F0-9]{64}$/.test(
    value,
  );
}

function safeCompare(
  left: string,
  right: string,
) {
  const leftBuffer =
    Buffer.from(left);

  const rightBuffer =
    Buffer.from(right);

  if (
    leftBuffer.length !==
    rightBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    leftBuffer,
    rightBuffer,
  );
}

function getRazorpayCredentials() {
  const keyId =
    process.env
      .NEXT_PUBLIC_RAZORPAY_KEY_ID;

  const keySecret =
    process.env
      .RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      'Razorpay credentials are missing.',
    );
  }

  return {
    keyId,
    keySecret,
  };
}

async function fetchRazorpayPayment({
  paymentId,
  keyId,
  keySecret,
}: {
  paymentId: string;
  keyId: string;
  keySecret: string;
}) {
  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(
      paymentId,
    )}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${keyId}:${keySecret}`,
        ).toString('base64')}`,
      },
      cache: 'no-store',
    },
  );

  const payment =
    (await response.json()) as RazorpayPaymentResponse;

  if (!response.ok) {
    console.error(
      'Razorpay payment fetch failed:',
      {
        status:
          response.status,

        description:
          payment.error
            ?.description,
      },
    );

    throw new Error(
      'Could not confirm payment with Razorpay.',
    );
  }

  return payment;
}

export async function POST(
  request: Request,
) {
  try {
    const limitResult =
      rateLimit({
        key: `razorpay:verify:${getClientIp(
          request,
        )}`,

        limit: 12,

        windowMs:
          60 * 1000,
      });

    if (!limitResult.ok) {
      return NextResponse.json(
        {
          error:
            'Too many verification attempts. Please wait a minute and try again.',
        },
        {
          status: 429,

          headers: {
            'Retry-After':
              String(
                limitResult
                  .retryAfterSeconds,
              ),
          },
        },
      );
    }

    const body =
      (await request.json()) as VerifyPaymentBody;

    const orderNumber =
      cleanString(
        body.orderNumber,
      );

    const returnedRazorpayOrderId =
      cleanString(
        body.razorpay_order_id,
      );

    const razorpayPaymentId =
      cleanString(
        body.razorpay_payment_id,
      );

    const razorpaySignature =
      cleanString(
        body.razorpay_signature,
      );

    if (
      !orderNumber ||
      !returnedRazorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return jsonError(
        'Missing payment verification details.',
        400,
      );
    }

    if (
      !isValidOrderNumber(
        orderNumber,
      ) ||
      !isValidRazorpayOrderId(
        returnedRazorpayOrderId,
      ) ||
      !isValidRazorpayPaymentId(
        razorpayPaymentId,
      ) ||
      !isValidRazorpaySignature(
        razorpaySignature,
      )
    ) {
      return jsonError(
        'Invalid payment verification details.',
        400,
      );
    }

    const {
      keyId,
      keySecret,
    } =
      getRazorpayCredentials();

    const supabase =
      await createServerSupabaseClient();

    const {
      data: authData,
      error: authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !authData.user
    ) {
      return jsonError(
        'Please login again.',
        401,
      );
    }

    /*
     * Load the trusted Razorpay order ID
     * and expected amount from our own DB.
     */
    const {
      data: order,
      error: orderError,
    } = await supabase
      .from('orders')
      .select(
        `
          id,
          order_number,
          total_inr,
          currency,
          payment_status,
          razorpay_order_id
        `,
      )
      .eq(
        'order_number',
        orderNumber,
      )
      .eq(
        'customer_id',
        authData.user.id,
      )
      .maybeSingle();

    if (
      orderError ||
      !order
    ) {
      console.error(
        'Payment verification order lookup failed:',
        orderError?.message,
      );

      return jsonError(
        'Order not found.',
        404,
      );
    }

    if (
      order.payment_status ===
      'paid'
    ) {
      return NextResponse.json({
        ok: true,
        alreadyPaid: true,
      });
    }

    const storedRazorpayOrderId =
      order.razorpay_order_id;

    if (
      !storedRazorpayOrderId ||
      storedRazorpayOrderId !==
        returnedRazorpayOrderId
    ) {
      console.error(
        'Razorpay order ID mismatch:',
        {
          orderNumber,
          storedRazorpayOrderId,
          returnedRazorpayOrderId,
        },
      );

      return jsonError(
        'Payment order could not be verified.',
        400,
      );
    }

    /*
     * HMAC must use the trusted order ID
     * stored by our backend.
     */
    const expectedSignature =
      crypto
        .createHmac(
          'sha256',
          keySecret,
        )
        .update(
          `${storedRazorpayOrderId}|${razorpayPaymentId}`,
        )
        .digest('hex');

    if (
      !safeCompare(
        expectedSignature,
        razorpaySignature,
      )
    ) {
      console.error(
        'Razorpay signature mismatch:',
        {
          orderNumber,
          storedRazorpayOrderId,
          razorpayPaymentId,
        },
      );

      return jsonError(
        'Payment verification failed.',
        400,
      );
    }

    /*
     * Do not trust only the browser callback.
     * Fetch the payment directly from Razorpay.
     */
    const payment =
      await fetchRazorpayPayment({
        paymentId:
          razorpayPaymentId,

        keyId,

        keySecret,
      });

    if (
      payment.id !==
      razorpayPaymentId
    ) {
      return jsonError(
        'Payment ID could not be verified.',
        400,
      );
    }

    if (
      payment.order_id !==
      storedRazorpayOrderId
    ) {
      console.error(
        'Razorpay payment belongs to another order.',
        {
          orderNumber,

          expected:
            storedRazorpayOrderId,

          received:
            payment.order_id,
        },
      );

      return jsonError(
        'Payment does not match this order.',
        400,
      );
    }

    const expectedAmount =
      Math.round(
        Number(
          order.total_inr,
        ) * 100,
      );

    if (
      Number(
        payment.amount,
      ) !== expectedAmount
    ) {
      console.error(
        'Razorpay payment amount mismatch:',
        {
          orderNumber,

          expected:
            expectedAmount,

          received:
            payment.amount,
        },
      );

      return jsonError(
        'Payment amount does not match the order.',
        400,
      );
    }

    const expectedCurrency =
      String(
        order.currency ||
          'INR',
      ).toUpperCase();

    const paymentCurrency =
      String(
        payment.currency ||
          '',
      ).toUpperCase();

    if (
      paymentCurrency !==
      expectedCurrency
    ) {
      return jsonError(
        'Payment currency does not match the order.',
        400,
      );
    }

    /*
     * Only a captured payment should become PAID.
     */
    if (
      payment.status !==
        'captured' ||
      payment.captured !==
        true
    ) {
      console.error(
        'Payment is not captured:',
        {
          orderNumber,
          status:
            payment.status,
          captured:
            payment.captured,
        },
      );

      return jsonError(
        'Payment is not fully captured yet. Please wait a moment and check your order again.',
        409,
      );
    }

    const {
      data: markedPaid,
      error: markError,
    } =
      await supabase.rpc(
        'mark_razorpay_payment_paid',
        {
          raw_order_number:
            orderNumber,

          raw_razorpay_order_id:
            storedRazorpayOrderId,

          raw_razorpay_payment_id:
            razorpayPaymentId,

          raw_razorpay_signature:
            razorpaySignature,
        },
      );

    if (
      markError ||
      !markedPaid
    ) {
      console.error(
        'Mark Razorpay payment paid failed:',
        markError?.message,
      );

      return jsonError(
        'Payment succeeded but the order could not be updated. Please contact the studio.',
        500,
      );
    }

    try {
      await sendOrderPaymentEmails(
        orderNumber,
      );
    } catch (emailError) {
      console.error(
        'Order email sending failed:',
        emailError,
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (caughtError) {
    console.error(
      'Verify Razorpay payment route failed:',
      caughtError,
    );

    return jsonError(
      'Could not verify payment. If money was deducted, please do not pay again and contact the studio.',
      500,
    );
  }
}