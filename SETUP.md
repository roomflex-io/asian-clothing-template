# Go live — Supabase schema + owner login

## 1. Run the schema

1. Open your **Noor Atelier** project on supabase.com
2. Left sidebar → **SQL Editor** → New query
3. Paste everything in `supabase/schema.sql`
4. Click **Run**
5. Confirm it finished without errors

## 2. Keys (already on Vercel Production)

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Add the same three to **Preview** if you want preview links to work.

## 3. First shop owner

1. Deploy this repo (push to `main`)
2. Open `/studio.html` on the live site
3. Create owner account (email + password)
4. Create the shop (name + slug, e.g. `noor`)
5. Fill profile and products
6. Payments → paste that shop’s Stripe `pk_` and `sk_`
   You never add those in Vercel.
