import { Resend } from 'resend';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type OrderItemRow = {
  product_name: string;
  design_code: string | null;
  selected_length: string | null;
  quantity: number;
};

type PhotoRequestOrderRow = {
  order_number: string;
  tracking_code: string;
  customer_name: string;
  customer_email: string;
  order_items: OrderItemRow[] | null;
};

type SendPhotoRequestInput = {
  orderId: string;
  note?: string;
};

type SendPhotoRequestResult = {
  sent: boolean;
  message: string;
};

const PHOTO_REQUEST_ORDER_SELECT = `
  order_number,
  tracking_code,
  customer_name,
  customer_email,
  order_items (
    product_name,
    design_code,
    selected_length,
    quantity
  )
`;

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getItemsHtml(order: PhotoRequestOrderRow) {
  const items = order.order_items ?? [];

  if (items.length === 0) {
    return '<p style="margin:0;color:#756778;">Your nail set order is waiting for updated photos.</p>';
  }

  return items
    .map((item) => {
      const code = escapeHtml(item.design_code ?? 'BNB');
      const name = escapeHtml(item.product_name);
      const length = escapeHtml(item.selected_length ?? 'Same as shown');
      const quantity = escapeHtml(item.quantity);

      return `
        <div style="padding:14px 0;border-bottom:1px solid #f0dce8;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:800;letter-spacing:.12em;color:#8c6fe8;text-transform:uppercase;">${code}</p>
          <p style="margin:0;font-size:16px;font-weight:800;color:#261d2b;">${name}</p>
          <p style="margin:6px 0 0;font-size:13px;color:#756778;">${length} • Qty ${quantity}</p>
        </div>
      `;
    })
    .join('');
}

function photoRequestEmail(order: PhotoRequestOrderRow, note?: string) {
  const safeNote = note?.trim() || 'Please upload clearer hand photos with the coin reference.';

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>New photos requested</title>
      </head>

      <body style="margin:0;background:#fff8fc;font-family:Arial,Helvetica,sans-serif;color:#261d2b;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#fff8fc,#f5efff);padding:28px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #f0dce8;border-radius:28px;overflow:hidden;box-shadow:0 24px 70px rgba(126,91,183,.14);">
                <tr>
                  <td style="padding:28px;background:linear-gradient(135deg,#fff0f6,#efe8ff);">
                    <p style="margin:0;font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#8c6fe8;">BILLi&amp;BoBA NAILS</p>
                    <h1 style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:40px;line-height:.95;letter-spacing:-.06em;color:#261d2b;">New photos requested</h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px;">
                    <p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#756778;">
                      Hi ${escapeHtml(order.customer_name)}, the studio needs clearer hand photos before production can continue.
                    </p>

                    <div style="margin:22px 0;padding:18px;border-radius:20px;background:#fff8fc;border:1px solid #f0dce8;">
                      <p style="margin:0;font-size:13px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#8c6fe8;">Order number</p>
                      <p style="margin:8px 0 0;font-size:24px;font-weight:900;color:#261d2b;">${escapeHtml(order.order_number)}</p>
                      <p style="margin:8px 0 0;font-size:14px;color:#756778;">Tracking ID: ${escapeHtml(order.tracking_code)}</p>
                    </div>

                    <div style="margin:22px 0;padding:18px;border-radius:20px;background:#fbf7ff;border:1px solid #e3d8ff;">
                      <p style="margin:0;font-size:14px;font-weight:900;color:#261d2b;">Studio note</p>
                      <p style="margin:8px 0 0;font-size:14px;line-height:1.8;color:#756778;">${escapeHtml(safeNote)}</p>
                    </div>

                    ${getItemsHtml(order)}

                    <p style="margin:24px 0 0;font-size:14px;line-height:1.8;color:#756778;">
                      Please login to your BILLi&amp;BoBA account, open <strong>My Orders</strong>, and upload the new left hand, right hand, and length reference photos.
                    </p>

                    <p style="margin:20px 0 0;font-size:14px;line-height:1.8;color:#756778;">
                      Tip: use bright lighting, keep the full hand visible, and place the coin reference clearly beside the nails.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 28px;background:#2a1d31;color:#ffffff;">
                    <p style="margin:0;font-size:13px;line-height:1.7;color:rgba(255,255,255,.76);">
                      Handmade press-on nail sets, fitted using guided hand photos.
                    </p>
                    <p style="margin:10px 0 0;font-size:12px;color:rgba(255,255,255,.55);">
                      © BILLi&amp;BoBA NAILS
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendPhotoReuploadRequestEmail({
  orderId,
  note,
}: SendPhotoRequestInput): Promise<SendPhotoRequestResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!resendApiKey || !from) {
    return {
      sent: false,
      message: 'Missing RESEND_API_KEY or RESEND_FROM.',
    };
  }

  const supabase = await createServerSupabaseClient();

  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    throw new Error('Admin login required.');
  }

  const { data, error } = await supabase
    .from('orders')
    .select(PHOTO_REQUEST_ORDER_SELECT)
    .eq('id', orderId)
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? 'Order not found.');
  }

  const order = data as PhotoRequestOrderRow;
  const resend = new Resend(resendApiKey);

  const result = (await resend.emails.send({
    from,
    to: order.customer_email,
    subject: `New photos requested for ${order.order_number}`,
    html: photoRequestEmail(order, note),
  })) as {
    data?: unknown;
    error?: {
      message?: string;
      name?: string;
    } | null;
  };

  if (result.error) {
    return {
      sent: false,
      message: result.error.message ?? result.error.name ?? 'Resend rejected the email.',
    };
  }

  return {
    sent: true,
    message: 'Photo request email sent.',
  };
}