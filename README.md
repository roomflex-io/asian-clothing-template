# Asian clothing shop template

Static site for independent Asian and modest wear shops.

## Edit per client

Open `js/config.js`:
- shop name, phone, WhatsApp, Instagram, address
- `adminPin` for the Studio desk
- turn collections on/off (`on: true` / `false`)
- starter product names and prices

Always-on pages: Home, Contact, Privacy.

## Studio (shop desk)

Open `/studio.html` and enter the pin (default `2468`).

The shop can add:
- photo of the piece
- title, price, description
- category (him / her / lehenga / wedding / …)

Reservations: the customer bag sends a WhatsApp to the shop number. That is the live inbox. A copy also appears under Studio → Reservations when sent from that browser.

Photos added in Studio stay in that browser. Use Backup to download / import on another device.

## Deploy

Connected to Vercel. Push to `main` to publish.
