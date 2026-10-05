import crypto from 'crypto';
import { NextResponse } from 'next/server';

import { sendOrderPaymentEmails } from '@/lib/order-emails';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

type RazorpayPaymentEntity = {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  captured?: boolean;
};

type RazorpayWebhookPayload = {
  event?: string;

  payload?: {
    payment?: {
      entity?: RazorpayPaymentEntity;
    };
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

function verifyWebhookSignature({
  body,
  signature,
  secret,
}: {
  body: string;
  signature: string;
  secret: string;
}) {
  const expectedSignature =
    crypto
      .createHmac(
        'sha256',
        secret,
      )
      .update(body)
      .digest('hex');

  return safeCompare(
    expectedSignature,
    signature,
  );
}

export async function POST(
  request: Request,
) {
  /*
   * IMPORTANT:
   * Razorpay signature verification must use
   * the exact raw request body.
   *
   * Do not call request.json() before this.
   */
  const rawBody =
    await request.text();

  const signature =
    request.headers.get(
      'x-razorpay-signature',
    )?.trim() ?? '';

  const webhookSecret =
    process.env
      .RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error(
      'Missing RAZORPAY_WEBHOOK_SECRET.',
    );

    return jsonError(
      'Webhook is not configured.',
      500,
    );
  }

  if (!signature) {
    return jsonError(
      'Missing webhook signature.',
      400,
    );
  }

  if (
    !verifyWebhookSignature({
      body: rawBody,
      signature,
      secret:
        webhookSecret,
    })
  ) {
    console.error(
      'Invalid Razorpay webhook signature.',
    );

    return jsonError(
      'Invalid webhook signature.',
      400,
    );
  }

  let payload: RazorpayWebhookPayload;

  try {
    payload =
      JSON.parse(
        rawBody,
      ) as RazorpayWebhookPayload;
  } catch {
    return jsonError(
      'Invalid webhook payload.',
      400,
    );
  }

  /*
   * We deliberately process only
   * payment.captured for now.
   *
   * Razorpay can send several payment events,
   * and processing multiple success events
   * can create duplicate side effects.
   */
  if (
    payload.event !==
    'payment.captured'
  ) {
    return NextResponse.json({
      ok: true,
      ignored: true,
      event:
        payload.event ??
        'unknown',
    });
  }

  const payment =
    payload.payload?.payment
      ?.entity;

  if (!payment) {
    return jsonError(
      'Missing payment entity.',
      400,
    );
  }

  const paymentId =
    payment.id?.trim() ?? '';

  const razorpayOrderId =
    payment.order_id?.trim() ??
    '';

  if (
    !paymentId ||
    !razorpayOrderId
  ) {
    return jsonError(
      'Missing Razorpay payment identifiers.',
      400,
    );
  }

  /*
   * Never mark an authorized-only
   * transaction as paid.
   */
  if (
    payment.status !==
      'captured' ||
    payment.captured !== true
  ) {
    console.error(
      'Received payment.captured event with unexpected payment state:',
      {
        paymentId,
        status:
          payment.status,
        captured:
          payment.captured,
      },
    );

    return jsonError(
      'Payment is not captured.',
      400,
    );
  }

  try {
    const supabase =
      createAdminSupabaseClient();

    /*
     * Match the webhook against the Razorpay
     * order ID we previously attached to our
     * own Supabase order.
     */
    const {
      data: order,
      error: orderError,
    } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        razorpay_order_id,
        razorpay_payment_id,
        payment_status,
        status,
        total_inr,
        currency
      `)
      .eq(
        'razorpay_order_id',
        razorpayOrderId,
      )
      .maybeSingle();

    if (
      orderError ||
      !order
    ) {
      console.error(
        'Webhook order lookup failed:',
        {
          razorpayOrderId,
          error:
            orderError?.message,
        },
      );

      return jsonError(
        'Order not found.',
        404,
      );
    }

    /*
     * Idempotency:
     *
     * Razorpay may retry a webhook.
     * If this order has already been marked paid,
     * simply acknowledge the event again.
     */
    if (
      order.payment_status ===
      'paid'
    ) {
      if (
        order.razorpay_payment_id &&
        order.razorpay_payment_id !==
          paymentId
      ) {
        console.error(
          'Paid order received a different payment ID:',
          {
            orderNumber:
              order.order_number,

            storedPaymentId:
              order.razorpay_payment_id,

            receivedPaymentId:
              paymentId,
          },
        );

        return jsonError(
          'Payment does not match the existing paid order.',
          409,
        );
      }

      return NextResponse.json({
        ok: true,
        alreadyProcessed:
          true,
      });
    }

    /*
     * Verify amount using OUR database,
     * not browser data.
     *
     * Razorpay amount is in paise.
     */
    const expectedAmount =
      Math.round(
        Number(
          order.total_inr,
        ) * 100,
      );

    const receivedAmount =
      Number(
        payment.amount,
      );

    if (
      !Number.isFinite(
        expectedAmount,
      ) ||
      !Number.isFinite(
        receivedAmount,
      ) ||
      expectedAmount !==
        receivedAmount
    ) {
      console.error(
        'Webhook payment amount mismatch:',
        {
          orderNumber:
            order.order_number,

          expected:
            expectedAmount,

          received:
            receivedAmount,
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

    const receivedCurrency =
      String(
        payment.currency ||
          '',
      ).toUpperCase();

    if (
      expectedCurrency !==
      receivedCurrency
    ) {
      console.error(
        'Webhook currency mismatch:',
        {
          orderNumber:
            order.order_number,

          expected:
            expectedCurrency,

          received:
            receivedCurrency,
        },
      );

      return jsonError(
        'Payment currency does not match the order.',
        400,
      );
    }

    /*
     * Update only orders that are not already paid.
     * This gives us another layer of idempotency.
     */
    const {
      data: updatedOrder,
      error: updateError,
    } = await supabase
      .from('orders')
      .update({
        razorpay_payment_id:
          paymentId,

        payment_status:
          'paid',

        status:
          'photos_under_review',

        paid_at:
          new Date().toISOString(),
      })
      .eq(
        'id',
        order.id,
      )
      .neq(
        'payment_status',
        'paid',
      )
      .select(
        'id, order_number',
      )
      .maybeSingle();

    if (updateError) {
      console.error(
        'Webhook order update failed:',
        updateError.message,
      );

      return jsonError(
        'Could not update order.',
        500,
      );
    }

    /*
     * Another request may have processed the
     * same webhook milliseconds earlier.
     */
    if (!updatedOrder) {
      return NextResponse.json({
        ok: true,
        alreadyProcessed:
          true,
      });
    }

    const {
      error: historyError,
    } = await supabase
      .from(
        'order_status_history',
      )
      .insert({
        order_id:
          order.id,

        status:
          'photos_under_review',

        note:
          'Payment confirmed by Razorpay webhook. Photos are ready for studio review.',

        changed_by:
          null,
      });

    if (historyError) {
      /*
       * Do not fail the webhook after payment has
       * already been correctly marked paid.
       */
      console.error(
        'Webhook status history insert failed:',
        historyError.message,
      );
    }

    /*
     * Send confirmation email when webhook was
     * the path that finalized this order.
     */
    try {
      await sendOrderPaymentEmails(
        order.order_number,
      );
    } catch (emailError) {
      /*
       * Email failure must never undo a payment.
       */
      console.error(
        'Webhook confirmation email failed:',
        emailError,
      );
    }

    return NextResponse.json({
      ok: true,

      orderNumber:
        order.order_number,
    });
  } catch (caughtError) {
    console.error(
      'Razorpay webhook processing failed:',
      caughtError,
    );

    return jsonError(
      'Webhook processing failed.',
      500,
    );
  }
}