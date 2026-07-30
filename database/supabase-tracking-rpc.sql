create or replace function public.track_order_public(raw_identifier text, raw_contact text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  found_order public.orders%rowtype;
  normalized_identifier text := lower(trim(raw_identifier));
  normalized_contact text := lower(trim(raw_contact));
  normalized_phone text := regexp_replace(coalesce(raw_contact, ''), '\D', '', 'g');
begin
  if normalized_identifier = '' or normalized_contact = '' then
    return null;
  end if;

  select *
  into found_order
  from public.orders o
  where (
    lower(o.order_number) = normalized_identifier
    or lower(o.tracking_code) = normalized_identifier
  )
  and (
    lower(o.customer_email) = normalized_contact
    or regexp_replace(coalesce(o.customer_phone, ''), '\D', '', 'g') = normalized_phone
    or regexp_replace(coalesce(o.shipping_phone, ''), '\D', '', 'g') = normalized_phone
  )
  limit 1;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'orderId', found_order.order_number,
    'trackingId', found_order.tracking_code,
    'createdAt', found_order.created_at,
    'status',
      case found_order.status::text
        when 'order_confirmed' then 'Order confirmed'
        when 'photos_under_review' then 'Photos under review'
        when 'photos_needed_again' then 'Photos needed again'
        when 'in_production' then 'In production'
        when 'quality_check' then 'Quality check'
        when 'ready_to_dispatch' then 'Ready to dispatch'
        when 'dispatched' then 'Dispatched'
        when 'delivered' then 'Delivered'
        when 'cancelled' then 'Cancelled'
        else 'Order confirmed'
      end,
    'accountEmail', found_order.customer_email,
    'itemCount', coalesce((
      select sum(oi.quantity)::int
      from public.order_items oi
      where oi.order_id = found_order.id
    ), 0),
    'subtotal', found_order.subtotal_inr,
    'customer', jsonb_build_object(
      'name', found_order.customer_name,
      'email', found_order.customer_email,
      'phone', found_order.customer_phone,
      'address', concat_ws(', ',
        found_order.shipping_address_line1,
        found_order.shipping_address_line2,
        found_order.shipping_city,
        found_order.shipping_state,
        found_order.shipping_postal_code,
        found_order.shipping_country
      )
    ),
    'items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'cartId', oi.id::text,
          'code', coalesce(oi.design_code, 'BNB'),
          'name', oi.product_name,
          'length', coalesce(oi.selected_length, 'Same as shown'),
          'quantity', oi.quantity,
          'price', oi.unit_price_inr
        )
        order by oi.created_at
      )
      from public.order_items oi
      where oi.order_id = found_order.id
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.track_order_public(text, text) from public;
grant execute on function public.track_order_public(text, text) to anon, authenticated;