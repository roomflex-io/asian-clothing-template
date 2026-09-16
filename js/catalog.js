(function () {
  const KEY = "noor-catalog";
  const ORD = "noor-orders";

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  function extras() { return read(KEY, []); }
  function orders() { return read(ORD, []); }

  function uid() {
    return "p" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }

  function allProducts() {
    const base = (window.PRODUCTS || []).map((p, i) => ({
      id: p.id || "base-" + i,
      name: p.name,
      price: p.price,
      cat: p.cat,
      tag: p.tag || "",
      desc: p.desc || "",
      photo: p.photo || "",
      builtIn: true
    }));
    const extra = extras().filter((p) => p && p.name);
    const hidden = new Set(extra.filter((p) => p.hideBuiltIn).map((p) => p.hideBuiltIn));
    const kept = base.filter((p) => !hidden.has(p.id) && !hidden.has(p.name));
    return kept.concat(extra.filter((p) => !p.hideBuiltIn && !p.deleted));
  }

  function saveProduct(item) {
    const list = extras();
    if (!item.id) item.id = uid();
    const i = list.findIndex((x) => x.id === item.id);
    if (i >= 0) list[i] = item;
    else list.push(item);
    write(KEY, list);
    return item;
  }

  function deleteProduct(id) {
    const list = extras();
    const found = list.find((x) => x.id === id);
    if (found) {
      write(KEY, list.filter((x) => x.id !== id));
      return;
    }
    list.push({ id: uid(), hideBuiltIn: id, deleted: true });
    write(KEY, list);
  }

  function addOrder(order) {
    const list = orders();
    list.unshift({
      id: uid(),
      at: new Date().toISOString(),
      status: "new",
      ...order
    });
    write(ORD, list);
  }

  function setOrderStatus(id, status) {
    write(ORD, orders().map((o) => o.id === id ? { ...o, status } : o));
  }

  window.Catalog = {
    allProducts,
    extras,
    saveProduct,
    deleteProduct,
    orders,
    addOrder,
    setOrderStatus,
    exportAll() {
      return JSON.stringify({ products: extras(), orders: orders() }, null, 2);
    },
    importAll(text) {
      const data = JSON.parse(text);
      if (data.products) write(KEY, data.products);
      if (data.orders) write(ORD, data.orders);
    }
  };
})();
