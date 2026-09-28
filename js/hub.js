(function () {
  const Hub = { ready: false, ok: false, url: "", anon: "", client: null, shop: null, pages: [], session: null };
  function slugFromLocation() {
    const q = new URLSearchParams(location.search);
    if (q.get("shop")) return q.get("shop").toLowerCase();
    const host = location.hostname.replace(/^www\./, "");
    if (host.endsWith(".vercel.app") || host === "localhost") return (window.SHOP && (SHOP.slug || "noor")) || "noor";
    return host;
  }
  function norm(p) {
    const media = (p.product_media || []).sort((a, b) => a.sort_order - b.sort_order);
    const photo = ((media.find((m) => m.kind === "photo") || {}).url) || "";
    return {
      id: p.id, shop_id: p.shop_id, name: p.title, title: p.title, sku: p.sku || "",
      cat: p.page_slug, page_slug: p.page_slug, desc: p.description || "", details: p.details || "",
      price: Number(p.price), saleOn: !!p.sale_on, salePrice: p.sale_price != null ? Number(p.sale_price) : 0,
      stock: Number(p.stock || 0), sizes: Array.isArray(p.sizes) ? p.sizes.join(" / ") : (p.sizes || ""),
      colour: Array.isArray(p.colours) ? p.colours.join(", ") : "", fabric: p.fabric || "", care: p.care || "",
      video: p.video_url || "", photo, media, tag: p.sale_on ? "Sale" : "", active: p.active !== false
    };
  }
  Hub.boot = async function () {
    try {
      const res = await fetch("/api/config");
      const cfg = await res.json();
      if (!cfg.ok) throw new Error(cfg.error || "no config");
      if (!window.supabase) throw new Error("supabase js missing");
      Hub.url = cfg.url; Hub.anon = cfg.anon;
      Hub.client = window.supabase.createClient(cfg.url, cfg.anon);
      const { data: { session } } = await Hub.client.auth.getSession();
      Hub.session = session;
      const key = slugFromLocation();
      let shop = (await Hub.client.from("shops_public").select("*").eq("slug", key).maybeSingle()).data;
      if (!shop) shop = (await Hub.client.from("shops_public").select("*").eq("domain", key).maybeSingle()).data;
      Hub.shop = shop;
      if (shop && window.SHOP) {
        SHOP.name = shop.name || SHOP.name;
        SHOP.tagline = shop.tagline || SHOP.tagline;
        SHOP.phone = shop.phone || SHOP.phone;
        SHOP.email = shop.email || SHOP.email;
        SHOP.address = [shop.address_line, shop.city, shop.postcode].filter(Boolean).join(", ") || SHOP.address;
        SHOP.deliveryFee = Number(shop.delivery_fee || 0);
        SHOP.freeDeliveryOver = Number(shop.free_delivery_over || 0);
        SHOP.stripeReady = !!shop.stripe_ready;
        SHOP.collectEnabled = shop.collect_enabled !== false;
      }
      Hub.ok = true;
    } catch (err) {
      Hub.ok = false; Hub.error = err.message;
    }
    Hub.ready = true;
    document.dispatchEvent(new CustomEvent("hub-ready", { detail: Hub }));
    return Hub;
  };
  Hub.products = async function (page) {
    if (!Hub.ok || !Hub.shop) return [];
    let q = Hub.client.from("products").select("*, product_media(*)").eq("shop_id", Hub.shop.id).eq("active", true).order("sort_order");
    if (page) q = q.eq("page_slug", page);
    const { data } = await q;
    return (data || []).map(norm);
  };
  Hub.product = async function (id) {
    if (!Hub.ok) return null;
    const { data } = await Hub.client.from("products").select("*, product_media(*)").eq("id", id).maybeSingle();
    return data ? norm(data) : null;
  };
  Hub.placeOrder = async function (args) {
    const { data, error } = await Hub.client.rpc("place_order", args);
    if (error) throw error;
    return data;
  };
  Hub.payStripe = async function (order, items, extras) {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop_id: Hub.shop.id, order_id: order.id, email: order.email, items, delivery_fee: extras && extras.delivery_fee || 0 })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Payment failed");
    return json;
  };
  window.Hub = Hub;
})();
