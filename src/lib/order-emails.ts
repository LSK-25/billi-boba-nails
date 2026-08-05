import { Resend } from 'resend';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type OrderItemRow = {
  product_name: string;
  design_code: string | null;
  selected_length: string | null;
  quantity: number;
  unit_price_inr: number;
  line_total_inr: number;
};

type EmailOrderRow = {
  order_number: string;
  tracking_code: string;
  created_at: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  subtotal_inr: number;
  shipping_inr: number;
  total_inr: number;
  order_items: OrderItemRow[] | null;
};

const EMAIL_ORDER_SELECT = `
  order_number,
  tracking_code,
  created_at,
  customer_email,
  customer_name,
  customer_phone,
  shipping_address_line1,
  shipping_address_line2,
  shipping_city,
  shipping_state,
  shipping_postal_code,
  shipping_country,
  subtotal_inr,
  shipping_inr,
  total_inr,
  order_items (
    product_name,
    design_code,
    selected_length,
    quantity,
    unit_price_inr,
    line_total_inr
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

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getAddress(order: EmailOrderRow) {
  return [
    order.shipping_address_line1,
    order.shipping_address_line2,
    order.shipping_city,
    order.shipping_state,
    order.shipping_postal_code,
    order.shipping_country,
  ]
    .filter(Boolean)
    .join(', ');
}

function getItemsHtml(order: EmailOrderRow) {
  const items = order.order_items ?? [];

  if (items.length === 0) {
    return '<p style="margin:0;color:#756778;">No item details found.</p>';
  }

  return items
    .map((item) => {
      const title = escapeHtml(item.product_name);
      const code = escapeHtml(item.design_code ?? 'BNB');
      const length = escapeHtml(item.selected_length ?? 'Same as shown');
      const quantity = escapeHtml(item.quantity);
      const lineTotal = escapeHtml(formatPrice(item.line_total_inr));

      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #f0dce8;">
            <p style="margin:0 0 4px;font-size:12px;font-weight:800;letter-spacing:.12em;color:#8c6fe8;text-transform:uppercase;">${code}</p>
            <p style="margin:0;font-size:16px;font-weight:800;color:#261d2b;">${title}</p>
            <p style="margin:6px 0 0;font-size:13px;color:#756778;">${length} • Qty ${quantity}</p>
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #f0dce8;text-align:right;font-size:15px;font-weight:800;color:#261d2b;">
            ${lineTotal}
          </td>
        </tr>
      `;
    })
    .join('');
}

function baseEmailLayout({
  title,
  preview,
  body,
}: {
  title: string;
  preview: string;
  body: string;
}) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin:0;background:#fff8fc;font-family:Arial,Helvetica,sans-serif;color:#261d2b;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
          ${escapeHtml(preview)}
        </div>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#fff8fc,#f5efff);padding:28px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #f0dce8;border-radius:28px;overflow:hidden;box-shadow:0 24px 70px rgba(126,91,183,.14);">
                <tr>
                  <td style="padding:28px;background:linear-gradient(135deg,#fff0f6,#efe8ff);">
                    <p style="margin:0;font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#8c6fe8;">BILLi&amp;BoBA NAILS</p>
                    <h1 style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:40px;line-height:.95;letter-spacing:-.06em;color:#261d2b;">${escapeHtml(title)}</h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px;">
                    ${body}
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

function customerOrderEmail(order: EmailOrderRow) {
  const body = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#756778;">
      Hi ${escapeHtml(order.customer_name)}, your payment is confirmed and your order is now with the studio for photo review.
    </p>

    <div style="margin:22px 0;padding:18px;border-radius:20px;background:#fff8fc;border:1px solid #f0dce8;">
      <p style="margin:0;font-size:13px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#8c6fe8;">Order number</p>
      <p style="margin:8px 0 0;font-size:24px;font-weight:900;color:#261d2b;">${escapeHtml(order.order_number)}</p>
      <p style="margin:8px 0 0;font-size:14px;color:#756778;">Tracking ID: ${escapeHtml(order.tracking_code)}</p>
      <p style="margin:6px 0 0;font-size:14px;color:#756778;">Placed: ${escapeHtml(formatDate(order.created_at))}</p>
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${getItemsHtml(order)}
    </table>

    <div style="margin-top:22px;padding:18px;border-radius:20px;background:#fbf7ff;border:1px solid #e3d8ff;">
      <p style="margin:0;font-size:14px;font-weight:900;color:#261d2b;">Delivery address</p>
      <p style="margin:8px 0 0;font-size:14px;line-height:1.7;color:#756778;">${escapeHtml(getAddress(order))}</p>
    </div>

    <div style="margin-top:22px;text-align:right;">
      <p style="margin:0;font-size:14px;color:#756778;">Total paid</p>
      <p style="margin:6px 0 0;font-size:26px;font-weight:900;color:#261d2b;">${escapeHtml(formatPrice(order.total_inr))}</p>
    </div>

    <p style="margin:24px 0 0;font-size:14px;line-height:1.8;color:#756778;">
      We’ll review your hand photos before production. If clearer photos are needed, you’ll see the request in your account.
    </p>
  `;

  return baseEmailLayout({
    title: 'Order confirmed',
    preview: `Your BILLi&BoBA order ${order.order_number} is confirmed.`,
    body,
  });
}

function studioOrderEmail(order: EmailOrderRow) {
  const body = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#756778;">
      A new paid order is ready for studio review.
    </p>

    <div style="margin:22px 0;padding:18px;border-radius:20px;background:#fff8fc;border:1px solid #f0dce8;">
      <p style="margin:0;font-size:13px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#8c6fe8;">Order</p>
      <p style="margin:8px 0 0;font-size:24px;font-weight:900;color:#261d2b;">${escapeHtml(order.order_number)}</p>
      <p style="margin:8px 0 0;font-size:14px;color:#756778;">Tracking ID: ${escapeHtml(order.tracking_code)}</p>
      <p style="margin:6px 0 0;font-size:14px;color:#756778;">Customer: ${escapeHtml(order.customer_name)} • ${escapeHtml(order.customer_phone)}</p>
      <p style="margin:6px 0 0;font-size:14px;color:#756778;">Email: ${escapeHtml(order.customer_email)}</p>
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${getItemsHtml(order)}
    </table>

    <div style="margin-top:22px;text-align:right;">
      <p style="margin:0;font-size:14px;color:#756778;">Paid total</p>
      <p style="margin:6px 0 0;font-size:26px;font-weight:900;color:#261d2b;">${escapeHtml(formatPrice(order.total_inr))}</p>
    </div>

    <p style="margin:24px 0 0;font-size:14px;line-height:1.8;color:#756778;">
      Open the admin dashboard and review hand photos before production.
    </p>
  `;

  return baseEmailLayout({
    title: 'New paid order',
    preview: `New paid order ${order.order_number} is ready for review.`,
    body,
  });
}

export async function sendOrderPaymentEmails(orderNumber: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const studioEmail = process.env.STUDIO_EMAIL;

  if (!resendApiKey || !from || !studioEmail) {
    console.warn('Skipping order emails: missing RESEND_API_KEY, RESEND_FROM, or STUDIO_EMAIL.');
    return;
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('orders')
    .select(EMAIL_ORDER_SELECT)
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not load order for email.');
  }

  const order = data as EmailOrderRow;
  const resend = new Resend(resendApiKey);

  const results = await Promise.allSettled([
    resend.emails.send({
      from,
      to: order.customer_email,
      subject: `Your BILLi&BoBA order ${order.order_number} is confirmed`,
      html: customerOrderEmail(order),
    }),
    resend.emails.send({
      from,
      to: studioEmail,
      subject: `New paid order: ${order.order_number}`,
      html: studioOrderEmail(order),
    }),
  ]);

  const failed = results.filter((result) => result.status === 'rejected');

  if (failed.length > 0) {
    console.error('Some order emails failed:', failed);
  }
}