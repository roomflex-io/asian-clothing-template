(function () {
  const KEY = "noor-catalog-v2";
  const ORD = "noor-orders-v2";
  const SET = "noor-settings-v2";
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  function uid(prefix) {
    return (prefix || "p") + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }
  function pence(price) {
    if (typeof price === "number") return Math.round(price * 100) / 100;
    return Number(String(price).replace(/[^0-9.]/g, "")) || 0;
  }
  function money(n) {
    return "£" + Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  function seedFromConfig(p, i) {
    const price = pence(p.price);
    const saleOn = !!(p.saleOn || (p.tag && /sale/i.test(p.tag)));
    const salePrice = p.salePrice != null ? pence(p.salePrice) : (saleOn ? Math.round(price * 0.8 * 100) / 100 : 0);
    return {
      id: p.id || "base-" + i,
      sku: p.sku || ("NA-" + String(i + 1).padStart(3, "0")),
      name: p.name, price, saleOn, salePrice,
      stock: p.stock != null ? Number(p.stock) : 8,
      cat: p.cat, tag: p.tag || "", desc: p.desc || "", photo: p.photo || "",
      sizes: p.sizes || "S / M / L / XL", colour: p.colour || "", fabric: p.fabric || "",
      care: p.care || "", notes: p.notes || "", active: p.active !== false, builtIn: true
    };
  }
  function extras() { return read(KEY, []); }
  function orders() { return read(ORD, []); }
  function settings() {
    const shop = window.SHOP || {};
    return Object.assign({
      bankName: shop.bankName || "", bankSort: shop.bankSort || "", bankAccount: shop.bankAccount || "",
      deliveryFee: shop.deliveryFee != null ? Number(shop.deliveryFee) : 4.95,
      freeDeliveryOver: shop.freeDeliveryOver != null ? Number(shop.freeDeliveryOver) : 80,
      collectAddress: shop.address || ""
    }, read(SET, {}));
  }
  function saveSettings(next) { write(SET, Object.assign(settings(), next || {})); }
  function overlayMap() {
    const map = {}; extras().forEach((p) => { if (p && p.id) map[p.id] = p; }); return map;
  }
  function normalize(p) {
    return {
      id: p.id, sku: p.sku || "", name: p.name || "", price: pence(p.price),
      saleOn: !!p.saleOn, salePrice: pence(p.salePrice),
      stock: Number(p.stock != null ? p.stock : 0), cat: p.cat || "her", tag: p.tag || "",
      desc: p.desc || "", photo: p.photo || "", sizes: p.sizes || "", colour: p.colour || "",
      fabric: p.fabric || "", care: p.care || "", notes: p.notes || "",
      active: p.active !== false, builtIn: !!p.builtIn
    };
  }
  function allProducts() {
    const overlay = overlayMap();
    const base = (window.PRODUCTS || []).map((p, i) => {
      const seeded = seedFromConfig(p, i);
      const extra = overlay[seeded.id];
      if (!extra) return seeded;
      if (extra.deleted) return null;
      return Object.assign({}, seeded, extra, { builtIn: true, id: seeded.id });
    }).filter(Boolean);
    const used = new Set(base.map((p) => p.id));
    extras().forEach((p) => {
      if (!p || p.deleted || p.builtIn || used.has(p.id) || !p.id) return;
      used.add(p.id); base.push(normalize(p));
    });
    return base;
  }
  function livePrice(p) {
    if (p.saleOn && p.salePrice > 0 && p.salePrice < p.price) return p.salePrice;
    return p.price;
  }
  function saveProduct(item) {
    const list = extras();
    const next = normalize(Object.assign({ id: item.id || uid("p") }, item));
    const i = list.findIndex((x) => x.id === next.id);
    if (i >= 0) list[i] = next; else list.push(next);
    write(KEY, list); return next;
  }
  function setStock(id, stock) {
    const p = allProducts().find((x) => x.id === id);
    if (!p) return;
    saveProduct(Object.assign({}, p, { stock: Math.max(0, Number(stock) || 0) }));
  }
  function adjustStock(id, delta) {
    const p = allProducts().find((x) => x.id === id);
    if (!p) return; setStock(id, p.stock + delta);
  }
  function deleteProduct(id) {
    const list = extras();
    const found = list.find((x) => x.id === id);
    if (found && !found.builtIn && !(window.PRODUCTS || []).some((p, i) => (p.id || "base-" + i) === id)) {
      write(KEY, list.filter((x) => x.id !== id)); return;
    }
    const i = list.findIndex((x) => x.id === id);
    const row = Object.assign({}, found || { id }, { id, deleted: true });
    if (i >= 0) list[i] = row; else list.push(row);
    write(KEY, list);
  }
  function addOrder(order) {
    const list = orders();
    const packed = Object.assign({
      id: uid("o"), at: new Date().toISOString(), status: "new",
      payStatus: order.payment === "bank" ? "awaiting_transfer" : "pay_on_collection"
    }, order);
    list.unshift(packed); write(ORD, list);
    (packed.items || []).forEach((i) => { if (i.id) adjustStock(i.id, -Number(i.qty || 0)); });
    return packed;
  }
  function setOrderStatus(id, status) {
    write(ORD, orders().map((o) => o.id === id ? Object.assign({}, o, { status }) : o));
  }
  function setPayStatus(id, payStatus) {
    write(ORD, orders().map((o) => o.id === id ? Object.assign({}, o, { payStatus }) : o));
  }
  function inventoryStats() {
    const list = allProducts().filter((p) => p.active);
    const units = list.reduce((n, p) => n + Number(p.stock || 0), 0);
    const value = list.reduce((n, p) => n + livePrice(p) * Number(p.stock || 0), 0);
    const low = list.filter((p) => p.stock > 0 && p.stock <= 3).length;
    const out = list.filter((p) => p.stock <= 0).length;
    return { skus: list.length, units, value, low, out, openOrders: orders().filter((o) => o.status === "new" || o.status === "packing").length };
  }
  window.Catalog = {
    pence, money, livePrice, allProducts, extras, saveProduct, deleteProduct, setStock, adjustStock,
    orders, addOrder, setOrderStatus, setPayStatus, settings, saveSettings, inventoryStats,
    exportAll() { return JSON.stringify({ products: extras(), orders: orders(), settings: settings() }, null, 2); },
    importAll(text) {
      const data = JSON.parse(text);
      if (data.products) write(KEY, data.products);
      if (data.orders) write(ORD, data.orders);
      if (data.settings) write(SET, data.settings);
    }
  };
})();
