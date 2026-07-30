-- BILLi&BoBA NAILS
-- Milestone 6A: Real commerce database schema

create extension if not exists pgcrypto;

grant usage on schema public to anon, authenticated;

-- Admin helper: checks the current logged-in user's profile role.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role::text = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- Safer updated_at helper.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Protect profile roles from normal customer self-updates.
create or replace function public.prevent_unauthorized_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change profile roles';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;

create trigger protect_profile_role
before update of role on public.profiles
for each row
execute function public.prevent_unauthorized_role_change();

-- Tighten profile permissions/policies.
alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Profiles are viewable by owner" on public.profiles;
drop policy if exists "Profiles are editable by owner" on public.profiles;
drop policy if exists "Profiles readable by owner or admin" on public.profiles;
drop policy if exists "Profiles editable by owner or admin" on public.profiles;

revoke update on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

create policy "Profiles readable by owner or admin"
on public.profiles
for select
to authenticated
using (auth.uid() = id or public.is_admin());

create policy "Profiles editable by owner or admin"
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

-- Enums.
do $$
begin
  create type public.product_status as enum ('draft', 'active', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.order_status as enum (
    'order_confirmed',
    'photos_under_review',
    'photos_needed_again',
    'in_production',
    'quality_check',
    'ready_to_dispatch',
    'dispatched',
    'delivered',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.photo_review_status as enum ('pending', 'approved', 'needs_new_photos');
exception
  when duplicate_object then null;
end $$;

-- Public order/tracking code generator.
create or replace function public.generate_public_code(prefix text)
returns text
language plpgsql
as $$
begin
  return prefix || '-' || to_char(now(), 'YYYY') || '-' || lpad((floor(random() * 1000000))::int::text, 6, '0');
end;
$$;

-- Products uploaded/managed by admin.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  design_code text unique,
  category text not null default 'press-on set',
  description text,
  studio_note text,
  price_inr integer not null default 0 check (price_inr >= 0),
  compare_at_price_inr integer check (compare_at_price_inr is null or compare_at_price_inr >= price_inr),
  shape text,
  finish text,
  length_options text[] not null default array['Short', 'Medium', 'Long']::text[],
  tags text[] not null default '{}'::text[],
  production_time_days integer not null default 7 check (production_time_days between 1 and 60),
  status public.product_status not null default 'draft',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_products_updated_at on public.products;

create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

-- Product image records. Actual files will come in Milestone 7 storage.
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text,
  storage_path text,
  alt_text text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Customer saved addresses.
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_addresses_updated_at on public.addresses;

create trigger set_addresses_updated_at
before update on public.addresses
for each row
execute function public.set_updated_at();

-- Orders.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.generate_public_code('BNB'),
  tracking_code text not null unique default public.generate_public_code('TRK-BNB'),

  customer_id uuid not null references auth.users(id) on delete restrict,
  customer_email text not null,
  customer_name text not null,
  customer_phone text not null,

  shipping_name text not null,
  shipping_phone text not null,
  shipping_address_line1 text not null,
  shipping_address_line2 text,
  shipping_city text not null,
  shipping_state text not null,
  shipping_postal_code text not null,
  shipping_country text not null default 'India',

  status public.order_status not null default 'order_confirmed',
  photo_status public.photo_review_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',

  subtotal_inr integer not null default 0 check (subtotal_inr >= 0),
  shipping_inr integer not null default 0 check (shipping_inr >= 0),
  total_inr integer not null default 0 check (total_inr >= 0),
  currency text not null default 'INR',

  customer_note text,
  internal_note text,

  placed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_orders_updated_at on public.orders;

create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

-- Order item snapshots.
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,

  product_name text not null,
  product_slug text,
  design_code text,
  selected_length text,
  selected_shape text,
  quantity integer not null default 1 check (quantity > 0),
  unit_price_inr integer not null check (unit_price_inr >= 0),
  line_total_inr integer not null check (line_total_inr >= 0),

  created_at timestamptz not null default now()
);

-- Hand-photo records. Actual private file upload comes in Milestone 7.
create table if not exists public.hand_photos (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  uploaded_by uuid not null default auth.uid() references auth.users(id) on delete set null,
  storage_path text,
  image_url text,
  photo_type text not null default 'hand_fit_reference',
  review_status public.photo_review_status not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now()
);

-- Order timeline.
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Indexes.
create index if not exists products_status_idx on public.products(status);
create index if not exists products_featured_idx on public.products(is_featured);
create index if not exists products_slug_idx on public.products(slug);
create index if not exists product_images_product_id_idx on public.product_images(product_id);
create index if not exists addresses_customer_id_idx on public.addresses(customer_id);
create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_order_number_idx on public.orders(order_number);
create index if not exists orders_tracking_code_idx on public.orders(tracking_code);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists hand_photos_order_id_idx on public.hand_photos(order_id);
create index if not exists order_status_history_order_id_idx on public.order_status_history(order_id);

-- Enable RLS.
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.hand_photos enable row level security;
alter table public.order_status_history enable row level security;

-- Table grants.
grant select on public.products, public.product_images to anon, authenticated;

grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.product_images to authenticated;
grant select, insert, update, delete on public.addresses to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
grant select, insert, update, delete on public.hand_photos to authenticated;
grant select, insert, update, delete on public.order_status_history to authenticated;

-- Products policies.
drop policy if exists "Active products are public" on public.products;
drop policy if exists "Admins can manage products" on public.products;

create policy "Active products are public"
on public.products
for select
to anon, authenticated
using (status = 'active');

create policy "Admins can manage products"
on public.products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Product images policies.
drop policy if exists "Active product images are public" on public.product_images;
drop policy if exists "Admins can manage product images" on public.product_images;

create policy "Active product images are public"
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_images.product_id
      and p.status = 'active'
  )
);

create policy "Admins can manage product images"
on public.product_images
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Addresses policies.
drop policy if exists "Customers can manage own addresses" on public.addresses;
drop policy if exists "Admins can manage addresses" on public.addresses;

create policy "Customers can manage own addresses"
on public.addresses
for all
to authenticated
using (auth.uid() = customer_id)
with check (auth.uid() = customer_id);

create policy "Admins can manage addresses"
on public.addresses
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Orders policies.
drop policy if exists "Customers can create own orders" on public.orders;
drop policy if exists "Customers can read own orders" on public.orders;
drop policy if exists "Admins can manage orders" on public.orders;

create policy "Customers can create own orders"
on public.orders
for insert
to authenticated
with check (auth.uid() = customer_id);

create policy "Customers can read own orders"
on public.orders
for select
to authenticated
using (auth.uid() = customer_id);

create policy "Admins can manage orders"
on public.orders
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Order items policies.
drop policy if exists "Customers can create own order items" on public.order_items;
drop policy if exists "Customers can read own order items" on public.order_items;
drop policy if exists "Admins can manage order items" on public.order_items;

create policy "Customers can create own order items"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.customer_id = auth.uid()
  )
);

create policy "Customers can read own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.customer_id = auth.uid()
  )
);

create policy "Admins can manage order items"
on public.order_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Hand photos policies.
drop policy if exists "Customers can add own hand photos" on public.hand_photos;
drop policy if exists "Customers can read own hand photos" on public.hand_photos;
drop policy if exists "Admins can manage hand photos" on public.hand_photos;

create policy "Customers can add own hand photos"
on public.hand_photos
for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and exists (
    select 1
    from public.orders o
    where o.id = hand_photos.order_id
      and o.customer_id = auth.uid()
  )
);

create policy "Customers can read own hand photos"
on public.hand_photos
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = hand_photos.order_id
      and o.customer_id = auth.uid()
  )
);

create policy "Admins can manage hand photos"
on public.hand_photos
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Order status history policies.
drop policy if exists "Customers can read own order history" on public.order_status_history;
drop policy if exists "Admins can manage order history" on public.order_status_history;

create policy "Customers can read own order history"
on public.order_status_history
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_status_history.order_id
      and o.customer_id = auth.uid()
  )
);

create policy "Admins can manage order history"
on public.order_status_history
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());