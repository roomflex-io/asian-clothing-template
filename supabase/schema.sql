-- Atelier Hub / Noor Atelier platform
-- Paste this entire file into Supabase SQL Editor and Run

create extension if not exists "pgcrypto";

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  domain text unique,
  name text not null,
  owner_name text,
  email text,
  phone text,
  address_line text,
  city text,
  postcode text,
  company_number text,
  tagline text,
  about text,
  logo_url text,
  cover_url text,
  ink text default '#1a1410',
  cream text default '#f6f1ea',
  gold text default '#c4a574',
  delivery_fee numeric(10,2) default 0,
  free_delivery_over numeric(10,2) default 0,
  collect_enabled boolean not null default true,
  stripe_publishable_key text,
  stripe_secret_key text,
  owner_id uuid unique references auth.users (id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_pages (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  slug text not null,
  label text not null,
  sort_order int not null default 0,
  enabled boolean not null default true,
  unique (shop_id, slug)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  page_slug text not null default 'her',
  title text not null,
  sku text,
  description text,
  details text,
  price numeric(10,2) not null default 0,
  sale_on boolean not null default false,
  sale_price numeric(10,2),
  stock int not null default 0 check (stock >= 0),
  sizes text[] not null default '{}',
  colours text[] not null default '{}',
  fabric text,
  care text,
  notes_internal text,
  video_url text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_shop_idx on public.products (shop_id);
create index if not exists products_page_idx on public.products (shop_id, page_slug);

create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  kind text not null default 'photo' check (kind in ('photo', 'video')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  guest boolean not null default true,
  name text not null,
  email text not null,
  phone text,
  fulfillment text not null default 'collect' check (fulfillment in ('collect', 'deliver')),
  address_line text,
  city text,
  postcode text,
  note text,
  subtotal numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment text not null default 'stripe' check (payment in ('stripe', 'collect')),
  pay_status text not null default 'unpaid' check (pay_status in ('unpaid', 'paid', 'refunded', 'failed')),
  status text not null default 'new' check (status in ('new', 'packing', 'ready', 'done', 'cancelled')),
  stripe_payment_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  title text not null,
  size text,
  qty int not null check (qty > 0),
  unit_price numeric(10,2) not null
);
