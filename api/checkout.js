const { Buffer } = require("buffer");
async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}
async function sb(path, opts = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(url + "/rest/v1/" + path, {
    ...opts,
    headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", Prefer: "return=representation", ...(opts.headers || {}) }
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error((data && data.message) || text || res.statusText);
  return data;
}
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const body = await readBody(req);
    const shopId = body.shop_id;
    if (!shopId) return res.status(400).json({ error: "Missing shop" });
    const shops = await sb("shops?id=eq." + shopId + "&select=id,name,stripe_secret_key,stripe_publishable_key");
    const shop = shops && shops[0];
    if (!shop) return res.status(404).json({ error: "Shop not found" });
    if (!shop.stripe_secret_key) return res.status(400).json({ error: "This shop has not added Stripe keys yet." });
    const origin = req.headers.origin || "https://asian-clothing-template.vercel.app";
    const base = String(origin).replace(/\/$/, "");
    const lineItems = (body.items || []).map((i) => ({
      quantity: Number(i.qty || 1),
      price_data: { currency: "gbp", unit_amount: Math.round(Number(i.unit || i.price || 0) * 100), product_data: { name: i.title || i.name || "Item" } }
    }));
    if (!lineItems.length) return res.status(400).json({ error: "Empty bag" });
    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", (body.success_url || base + "/confirm.html") + "?session_id={CHECKOUT_SESSION_ID}&id=" + encodeURIComponent(body.order_id || ""));
    params.set("cancel_url", body.cancel_url || base + "/checkout.html");
    if (body.email) params.set("customer_email", body.email);
    lineItems.forEach((item, idx) => {
      params.set("line_items[" + idx + "][quantity]", String(item.quantity));
      params.set("line_items[" + idx + "][price_data][currency]", item.price_data.currency);
      params.set("line_items[" + idx + "][price_data][unit_amount]", String(item.price_data.unit_amount));
      params.set("line_items[" + idx + "][price_data][product_data][name]", item.price_data.product_data.name);
    });
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: "Bearer " + shop.stripe_secret_key, "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });
    const session = await stripeRes.json();
    if (!stripeRes.ok) return res.status(400).json({ error: (session.error && session.error.message) || "Stripe error" });
    if (body.order_id) await sb("orders?id=eq." + body.order_id, { method: "PATCH", body: JSON.stringify({ stripe_payment_id: session.id }) });
    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Checkout failed" });
  }
};
