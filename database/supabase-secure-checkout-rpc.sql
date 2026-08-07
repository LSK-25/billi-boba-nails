create or replace function public.create_checkout_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();

  customer_name text := trim(coalesce(payload #>> '{customer,name}', ''));
  customer_email text := lower(trim(coalesce(payload #>> '{customer,email}', '')));
  customer_phone text := trim(coalesce(payload #>> '{customer,phone}', ''));

  address_line1 text := trim(coalesce(payload #>> '{address,line1}', ''));
  address_line2 text := trim(coalesce(payload #>> '{address,line2}', ''));
  address_city text := trim(coalesce(payload #>> '{address,city}', ''));
  address_state text := trim(coalesce(payload #>> '{address,state}', ''));
  address_postal_code text := trim(coalesce(payload #>> '{address,postalCode}', ''));
  address_country text := trim(coalesce(payload #>> '{address,country}', 'India'));

  customer_note text := nullif(trim(coalesce(payload ->> 'note', '')), '');
  cart_items jsonb := payload -> 'items';
  cart_item jsonb;
  safe_items jsonb := '[]'::jsonb;

  product_record public.products%rowtype;
  product_slug text;
  selected_length text;
  selected_quantity int;
  line_total int;
  subtotal int := 0;

  new_order record;
begin
  if current_user_id is null then
    raise exception 'Please login before checkout.';
  end if;

  if length(customer_name) < 2 or length(customer_name) > 80 then
    raise exception 'Please enter a valid customer name.';
  end if;

  if customer_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Please enter a valid email address.';
  end if;

  if regexp_replace(customer_phone, '\D', '', 'g') !~ '^[0-9]{10,15}$' then
    raise exception 'Please enter a valid phone number.';
  end if;

  if length(address_line1) < 6 or length(address_line1) > 180 then
    raise exception 'Please enter a valid delivery address.';
  end if;

  if length(address_city) < 2 or length(address_city) > 80 then
    raise exception 'Please enter a valid city.';
  end if;

  if length(address_state) < 2 or length(address_state) > 80 then
    raise exception 'Please enter a valid state.';
  end if;

  if address_postal_code !~ '^[0-9]{6}$' then
    raise exception 'Please enter a valid 6-digit PIN code.';
  end if;

  if customer_note is not null and length(customer_note) > 500 then
    raise exception 'Order note must be under 500 characters.';
  end if;

  if jsonb_typeof(cart_items) <> 'array' or jsonb_array_length(cart_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;

  if jsonb_array_length(cart_items) > 5 then
    raise exception 'Please checkout with 5 or fewer set types at once.';
  end if;

  for cart_item in select * from jsonb_array_elements(cart_items)
  loop
    product_slug := trim(coalesce(cart_item ->> 'productSlug', ''));
    selected_length := trim(coalesce(cart_item ->> 'length', 'Same as shown'));
    selected_quantity := coalesce(nullif(cart_item ->> 'quantity', '')::int, 1);

    if product_slug = '' then
      raise exception 'A product in your cart is invalid.';
    end if;

    if selected_quantity < 1 or selected_quantity > 5 then
      raise exception 'Quantity must be between 1 and 5.';
    end if;

    if selected_length not in ('Short', 'Medium', 'Long', 'Same as shown') then
      raise exception 'Please choose a valid nail length.';
    end if;

    select *
    into product_record
    from public.products
    where slug = product_slug
      and status = 'active'
    limit 1;

    if not found then
      raise exception 'One product in your cart is no longer available.';
    end if;

    if product_record.price_inr is null or product_record.price_inr < 1 then
      raise exception 'One product has an invalid price.';
    end if;

    if product_record.length_options is not null
      and array_length(product_record.length_options, 1) > 0
      and not selected_length = any(product_record.length_options)
    then
      raise exception 'Selected length is not available for one product.';
    end if;

    line_total := product_record.price_inr * selected_quantity;
    subtotal := subtotal + line_total;

    safe_items := safe_items || jsonb_build_array(
      jsonb_build_object(
        'product_name', product_record.name,
        'product_slug', product_record.slug,
        'design_code', product_record.design_code,
        'selected_length', selected_length,
        'selected_shape', product_record.shape,
        'quantity', selected_quantity,
        'unit_price_inr', product_record.price_inr,
        'line_total_inr', line_total
      )
    );
  end loop;

  insert into public.orders (
    customer_id,
    customer_email,
    customer_name,
    customer_phone,

    shipping_name,
    shipping_phone,
    shipping_address_line1,
    shipping_address_line2,
    shipping_city,
    shipping_state,
    shipping_postal_code,
    shipping_country,

    subtotal_inr,
    shipping_inr,
    total_inr,
    currency,
    customer_note
  )
  values (
    current_user_id,
    customer_email,
    customer_name,
    customer_phone,

    customer_name,
    customer_phone,
    address_line1,
    nullif(address_line2, ''),
    address_city,
    address_state,
    address_postal_code,
    address_country,

    subtotal,
    0,
    subtotal,
    'INR',
    customer_note
  )
  returning id, order_number, tracking_code, created_at, status, subtotal_inr, total_inr
  into new_order;

  for cart_item in select * from jsonb_array_elements(safe_items)
  loop
    insert into public.order_items (
      order_id,
      product_name,
      product_slug,
      design_code,
      selected_length,
      selected_shape,
      quantity,
      unit_price_inr,
      line_total_inr
    )
    values (
      new_order.id,
      cart_item ->> 'product_name',
      cart_item ->> 'product_slug',
      cart_item ->> 'design_code',
      cart_item ->> 'selected_length',
      cart_item ->> 'selected_shape',
      (cart_item ->> 'quantity')::int,
      (cart_item ->> 'unit_price_inr')::int,
      (cart_item ->> 'line_total_inr')::int
    );
  end loop;

  return jsonb_build_object(
    'orderUuid', new_order.id,
    'orderId', new_order.order_number,
    'trackingId', new_order.tracking_code,
    'createdAt', new_order.created_at,
    'status', new_order.status,
    'subtotal', new_order.subtotal_inr,
    'total', new_order.total_inr
  );
end;
$$;

revoke all on function public.create_checkout_order(jsonb) from public;
grant execute on function public.create_checkout_order(jsonb) to authenticated;