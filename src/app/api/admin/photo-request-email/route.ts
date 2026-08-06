import { NextResponse } from 'next/server';
import { sendPhotoReuploadRequestEmail } from '@/lib/photo-request-email';

export const runtime = 'nodejs';

type PhotoRequestEmailBody = {
  orderId?: string;
  note?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PhotoRequestEmailBody;
    const orderId = body.orderId?.trim();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID.' }, { status: 400 });
    }

    const result = await sendPhotoReuploadRequestEmail({
      orderId,
      note: body.note,
    });

    return NextResponse.json({
      ok: true,
      sent: result.sent,
      message: result.message,
    });
  } catch (caughtError) {
    const message =
      caughtError instanceof Error
        ? caughtError.message
        : 'Could not send photo request email.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}