alter table public.shops enable row level security;
alter table public.shop_pages enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists shops_owner_select on public.shops;
create policy shops_owner_select on public.shops for select to authenticated using (owner_id = auth.uid());
drop policy if exists shops_owner_update on public.shops;
create policy shops_owner_update on public.shops for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

revoke all on public.shops from anon, authenticated;
grant select (
  id, slug, domain, name, owner_name, email, phone,
  address_line, city, postcode, company_number,
  tagline, about, logo_url, cover_url, ink, cream, gold,
  delivery_fee, free_delivery_over, collect_enabled,
  stripe_publishable_key, owner_id, active, created_at, updated_at
) on public.shops to authenticated;
grant update (
  name, owner_name, email, phone, address_line, city, postcode,
  company_number, tagline, about, logo_url, cover_url, ink, cream, gold,
  delivery_fee, free_delivery_over, collect_enabled, domain, slug
) on public.shops to authenticated;

grant select on public.shops_public to anon, authenticated;
grant execute on function public.create_my_shop(text, text, text, text, text) to authenticated;
grant execute on function public.set_my_stripe_keys(text, text) to authenticated;
grant execute on function public.place_order(uuid, text, text, text, text, text, text, text, text, text, jsonb) to anon, authenticated;

drop policy if exists pages_public_read on public.shop_pages;
create policy pages_public_read on public.shop_pages for select to anon, authenticated using (exists (select 1 from public.shops s where s.id = shop_id and s.active));
drop policy if exists pages_owner_all on public.shop_pages;
create policy pages_owner_all on public.shop_pages for all to authenticated using (public.is_shop_owner(shop_id)) with check (public.is_shop_owner(shop_id));

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select to anon, authenticated using (active = true and exists (select 1 from public.shops s where s.id = shop_id and s.active));
drop policy if exists products_owner_read on public.products;
create policy products_owner_read on public.products for select to authenticated using (public.is_shop_owner(shop_id));
drop policy if exists products_owner_write on public.products;
create policy products_owner_write on public.products for all to authenticated using (public.is_shop_owner(shop_id)) with check (public.is_shop_owner(shop_id));

drop policy if exists media_public_read on public.product_media;
create policy media_public_read on public.product_media for select to anon, authenticated using (exists (select 1 from public.shops s where s.id = shop_id and s.active));
drop policy if exists media_owner_write on public.product_media;
create policy media_owner_write on public.product_media for all to authenticated using (public.is_shop_owner(shop_id)) with check (public.is_shop_owner(shop_id));

drop policy if exists customers_self on public.customers;
create policy customers_self on public.customers for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists orders_owner_read on public.orders;
create policy orders_owner_read on public.orders for select to authenticated using (public.is_shop_owner(shop_id) or customer_id = auth.uid());
drop policy if exists orders_owner_update on public.orders;
create policy orders_owner_update on public.orders for update to authenticated using (public.is_shop_owner(shop_id));
drop policy if exists items_owner_read on public.order_items;
create policy items_owner_read on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (public.is_shop_owner(o.shop_id) or o.customer_id = auth.uid())));

insert into storage.buckets (id, name, public) values ('shop-media', 'shop-media', true) on conflict (id) do nothing;
drop policy if exists media_public on storage.objects;
create policy media_public on storage.objects for select to public using (bucket_id = 'shop-media');
drop policy if exists media_owner_write on storage.objects;
create policy media_owner_write on storage.objects for insert to authenticated with check (bucket_id = 'shop-media' and exists (select 1 from public.shops s where s.owner_id = auth.uid() and (storage.foldername(name))[1] = s.id::text));
drop policy if exists media_owner_update on storage.objects;
create policy media_owner_update on storage.objects for delete to authenticated using (bucket_id = 'shop-media' and exists (select 1 from public.shops s where s.owner_id = auth.uid() and (storage.foldername(name))[1] = s.id::text));
