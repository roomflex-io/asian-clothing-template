create or replace function public.place_order(
  p_shop uuid,
  p_name text,
  p_email text,
  p_phone text,
  p_fulfillment text,
  p_address text,
  p_city text,
  p_postcode text,
  p_note text,
  p_payment text,
  p_items jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders;
  it jsonb;
  prod public.products;
  qty int;
  unit numeric;
  sub numeric := 0;
  ship numeric := 0;
  shop public.shops;
begin
  select * into shop from public.shops where id = p_shop and active = true;
  if shop.id is null then raise exception 'Shop not found'; end if;
  for it in select * from jsonb_array_elements(p_items)
  loop
    qty := (it->>'qty')::int;
    select * into prod from public.products
      where id = (it->>'product_id')::uuid and shop_id = p_shop and active = true;
    if prod.id is null then raise exception 'Product missing'; end if;
    if prod.stock < qty then raise exception 'Not enough stock for %', prod.title; end if;
    unit := case when prod.sale_on and prod.sale_price is not null and prod.sale_price < prod.price then prod.sale_price else prod.price end;
    sub := sub + unit * qty;
  end loop;
  if p_fulfillment = 'deliver' then
    if shop.free_delivery_over > 0 and sub >= shop.free_delivery_over then ship := 0;
    else ship := coalesce(shop.delivery_fee, 0); end if;
  end if;
  insert into public.orders (
    shop_id, customer_id, guest, name, email, phone,
    fulfillment, address_line, city, postcode, note,
    subtotal, delivery_fee, total, payment, pay_status, status
  ) values (
    p_shop, auth.uid(), auth.uid() is null,
    p_name, p_email, p_phone,
    coalesce(p_fulfillment, 'collect'),
    p_address, p_city, p_postcode, p_note,
    sub, ship, sub + ship, coalesce(p_payment, 'collect'), 'unpaid', 'new'
  ) returning * into o;
  for it in select * from jsonb_array_elements(p_items)
  loop
    qty := (it->>'qty')::int;
    select * into prod from public.products where id = (it->>'product_id')::uuid;
    unit := case when prod.sale_on and prod.sale_price is not null and prod.sale_price < prod.price then prod.sale_price else prod.price end;
    insert into public.order_items (order_id, product_id, title, size, qty, unit_price)
    values (o.id, prod.id, prod.title, it->>'size', qty, unit);
    update public.products set stock = stock - qty where id = prod.id;
  end loop;
  return o;
end $$;

create or replace view public.shops_public as
select
  id, slug, domain, name, owner_name, email, phone,
  address_line, city, postcode, company_number,
  tagline, about, logo_url, cover_url, ink, cream, gold,
  delivery_fee, free_delivery_over, collect_enabled,
  stripe_publishable_key,
  (stripe_secret_key is not null and stripe_secret_key <> '') as stripe_ready,
  active
from public.shops;
