alter table public.orders
add column if not exists razorpay_order_id text,
add column if not exists razorpay_payment_id text,
add column if not exists razorpay_signature text,
add column if not exists paid_at timestamptz;

create index if not exists orders_razorpay_order_id_idx
on public.orders(razorpay_order_id);

create or replace function public.attach_razorpay_order(
  raw_order_number text,
  raw_razorpay_order_id text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders
  set
    razorpay_order_id = raw_razorpay_order_id,
    payment_status = 'pending'
  where order_number = raw_order_number
    and customer_id = auth.uid();

  return found;
end;
$$;

create or replace function public.mark_razorpay_payment_paid(
  raw_order_number text,
  raw_razorpay_order_id text,
  raw_razorpay_payment_id text,
  raw_razorpay_signature text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_order_id uuid;
begin
  update public.orders
  set
    razorpay_order_id = raw_razorpay_order_id,
    razorpay_payment_id = raw_razorpay_payment_id,
    razorpay_signature = raw_razorpay_signature,
    payment_status = 'paid',
    status = 'photos_under_review',
    paid_at = now()
  where order_number = raw_order_number
    and razorpay_order_id = raw_razorpay_order_id
    and customer_id = auth.uid()
  returning id into updated_order_id;

  if updated_order_id is null then
    return false;
  end if;

  insert into public.order_status_history (
    order_id,
    status,
    note,
    changed_by
  )
  values (
    updated_order_id,
    'photos_under_review',
    'Payment verified through Razorpay. Photos are ready for admin review.',
    auth.uid()
  );

  return true;
end;
$$;

revoke all on function public.attach_razorpay_order(text, text) from public;
revoke all on function public.mark_razorpay_payment_paid(text, text, text, text) from public;

grant execute on function public.attach_razorpay_order(text, text) to authenticated;
grant execute on function public.mark_razorpay_payment_paid(text, text, text, text) to authenticated;