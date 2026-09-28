(function () {
  const Hub = { ready: false, ok: false, url: "", anon: "", client: null, shop: null, pages: [], session: null };
  function slugFromLocation() {
    const q = new URLSearchParams(location.search);
    if (q.get("shop")) return q.get("shop").toLowerCase();
    const host = location.hostname.replace(/^www\./, "");
    if (host.endsWith(".vercel.app") || host === "localhost") return (window.SHOP && SHOP.slug) || "noor";
    return host;
  }
  Hub.boot = async function () {
    try {
      const res = await fetch("/api/config");
      const cfg = await res.json();
      if (!cfg.ok) throw new Error(cfg.error || "no config");
      Hub.url = cfg.url; Hub.anon = cfg.anon;
      if (!window.supabase) throw new Error("supabase js missing");
      Hub.client = window.supabase.createClient(cfg.url, cfg.anon);
      const { data: { session } } = await Hub.client.auth.getSession();
      Hub.session = session;
      const key = slugFromLocation();
      let shop = null;
      const bySlug = await Hub.client.from("shops_public").select("*").eq("slug", key).maybeSingle();
      if (bySlug.data) shop = bySlug.data;
      if (!shop) {
        const byDomain = await Hub.client.from("shops_public").select("*").eq("domain", key).maybeSingle();
        if (byDomain.data) shop = byDomain.data;
      }
      Hub.shop = shop;
      if (shop && window.SHOP) {
        SHOP.name = shop.name || SHOP.name;
        SHOP.tagline = shop.tagline || SHOP.tagline;
        SHOP.phone = shop.phone || SHOP.phone;
        SHOP.email = shop.email || SHOP.email;
      }
      Hub.ok = true;
    } catch (err) {
      Hub.ok = false;
      Hub.error = err.message;
    }
    Hub.ready = true;
    document.dispatchEvent(new CustomEvent("hub-ready", { detail: Hub }));
    return Hub;
  };
  window.Hub = Hub;
})();
