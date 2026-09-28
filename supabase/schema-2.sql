create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists shops_touch on public.shops;
create trigger shops_touch before update on public.shops
for each row execute function public.touch_updated_at();

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
for each row execute function public.touch_updated_at();

create or replace function public.is_shop_owner(p_shop uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.shops s
    where s.id = p_shop and s.owner_id = auth.uid()
  );
$$;

create or replace function public.create_my_shop(
  p_name text,
  p_slug text,
  p_owner_name text default null,
  p_phone text default null,
  p_email text default null
)
returns public.shops
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.shops;
  pages text[][] := array[
    array['her', 'For her'],
    array['him', 'For him'],
    array['summer', 'Summer'],
    array['winter', 'Winter'],
    array['autumn', 'Autumn'],
    array['lehenga', 'Lehenga'],
    array['wedding', 'Wedding'],
    array['abayas', 'Abayas'],
    array['thobes', 'Thobes'],
    array['perfumes', 'Perfumes'],
    array['accessories', 'Accessories']
  ];
  i int;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  if exists (select 1 from public.shops where owner_id = auth.uid()) then
    select * into s from public.shops where owner_id = auth.uid();
    return s;
  end if;
  insert into public.shops (name, slug, owner_name, phone, email, owner_id)
  values (
    p_name,
    lower(regexp_replace(p_slug, '[^a-zA-Z0-9-]+', '-', 'g')),
    p_owner_name,
    p_phone,
    p_email,
    auth.uid()
  )
  returning * into s;
  for i in 1 .. array_length(pages, 1) loop
    insert into public.shop_pages (shop_id, slug, label, sort_order)
    values (s.id, pages[i][1], pages[i][2], i);
  end loop;
  return s;
end $$;

create or replace function public.set_my_stripe_keys(p_pk text, p_sk text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.shops
  set
    stripe_publishable_key = nullif(p_pk, ''),
    stripe_secret_key = case when p_sk is null or p_sk = '' then stripe_secret_key else p_sk end
  where owner_id = auth.uid();
end $$;
