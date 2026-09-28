# Noor Atelier shop

Static site for the clothing shop, with a proper checkout and an owner inventory desk.

## Customer

- Browse shop and product pages
- Add to bag (blocked when sold out; capped at stock)
- Checkout at `/checkout.html`
- Order confirmation at `/confirm.html`
- Stock is reduced when the order is placed

Card payments (Stripe) are not wired yet. Collection and bank transfer work now.

## Owner desk

Open `/studio.html` and enter `adminPin` from `js/config.js`.
