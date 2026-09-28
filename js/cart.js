(function () {
  const KEY = "noor-basket-v2";
  const tones = ["#3a2e26", "#3d4f46", "#6a3a48", "#8a6a40"];
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
  function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); render(); }
  function count() { return load().reduce((n, i) => n + i.qty, 0); }
  function product(id) { return window.Catalog ? Catalog.allProducts().find((p) => p.id === id) : null; }
  function linePrice(item) {
    const p = product(item.id);
    if (p) return Catalog.livePrice(p);
    return Catalog ? Catalog.pence(item.price) : Number(item.price) || 0;
  }
  function add(item) {
    const p = item.id ? product(item.id) : null;
    if (p && p.stock <= 0) { alert("That piece is out of stock."); return; }
    const items = load();
    const found = items.find((x) => x.id === item.id || (!item.id && x.name === item.name));
    const nextQty = found ? found.qty + 1 : 1;
    if (p && nextQty > p.stock) { alert("Only " + p.stock + " left of this piece."); return; }
    if (found) found.qty += 1;
    else items.push({ id: item.id || "", name: item.name, price: item.price, qty: 1 });
    save(items); pulse();
  }
  function change(idOrName, delta) {
    save(load().map((x) => {
      const match = x.id === idOrName || x.name === idOrName;
      if (!match) return x;
      const p = product(x.id);
      let qty = x.qty + delta;
      if (p && qty > p.stock) qty = p.stock;
      return Object.assign({}, x, { qty });
    }).filter((x) => x.qty > 0));
  }
  function remove(idOrName) { save(load().filter((x) => x.id !== idOrName && x.name !== idOrName)); }
  function clear() { save([]); }
  function pulse() {
    const btn = document.querySelector("[data-basket-btn]");
    if (!btn) return;
    btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
  }
  function mountChrome() {
    if (document.querySelector("[data-basket-btn]")) return;
    const slot = document.querySelector("[data-basket-slot]") || document.querySelector(".nav");
    if (!slot) return;
    const wrap = document.createElement("div");
    wrap.className = "basket-wrap";
    wrap.innerHTML = '<button class="basket-btn" data-basket-btn type="button" aria-label="Bag"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M7 7.2h10l-.72 12.2H7.72L7 7.2z"/><path d="M9.2 7.2V5.8a2.8 2.8 0 0 1 5.6 0v1.4"/></svg><span class="badge" data-basket-count hidden>0</span></button><div class="drawer-bg" data-drawer-bg></div><aside class="drawer" data-drawer role="dialog" aria-label="Your bag"><header class="bag-head"><div><p class="bag-kicker">Your bag</p><h2 data-bag-title>0 pieces</h2></div><button type="button" class="bag-close" data-drawer-close>Close</button></header><div class="drawer-list" data-drawer-list></div><footer class="bag-foot" data-bag-foot hidden><div class="bag-sum"><span>Subtotal</span><strong data-drawer-total>£0</strong></div><p class="bag-note">Pay at checkout. Collect in store or pay by card if the shop has it set up.</p><a class="btn solid bag-cta" href="checkout.html">Go to checkout</a></footer></aside>';
    slot.appendChild(wrap);
    wrap.querySelector("[data-basket-btn]").addEventListener("click", open);
    wrap.querySelector("[data-drawer-close]").addEventListener("click", close);
    wrap.querySelector("[data-drawer-bg]").addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }
  function render() {
    const items = load(); const n = count();
    const badge = document.querySelector("[data-basket-count]");
    if (badge) { badge.textContent = n; badge.hidden = n === 0; }
    const title = document.querySelector("[data-bag-title]");
    if (title) title.textContent = n === 1 ? "1 piece" : n + " pieces";
    const foot = document.querySelector("[data-bag-foot]");
    if (foot) foot.hidden = items.length === 0;
    const sum = items.reduce((s, i) => s + linePrice(i) * i.qty, 0);
    const total = document.querySelector("[data-drawer-total]");
    if (total && window.Catalog) total.textContent = Catalog.money(sum);
    const list = document.querySelector("[data-drawer-list]");
    if (list) {
      if (!items.length) list.innerHTML = '<div class="bag-empty"><p>Your bag is empty</p><span>Add a piece, then check out.</span></div>';
      else {
        list.innerHTML = items.map((i, idx) => {
          const p = product(i.id); const unit = linePrice(i);
          const sale = p && p.saleOn && p.salePrice > 0;
          return '<article class="bag-row"><div class="bag-thumb" style="' + (p && p.photo ? "background-image:url(" + p.photo + ");background-size:cover" : "background:" + tones[idx % tones.length]) + '"></div><div class="bag-copy"><h3>' + i.name + '</h3><p>' + (sale ? "<s>£" + p.price + "</s> " : "") + (window.Catalog ? Catalog.money(unit) : i.price) + '</p><div class="bag-actions"><div class="stepper"><button type="button" data-minus="' + (i.id || i.name) + '">−</button><em>' + i.qty + '</em><button type="button" data-plus="' + (i.id || i.name) + '">+</button></div><button type="button" class="text-btn" data-remove="' + (i.id || i.name) + '">Remove</button></div></div><div class="bag-line">' + (window.Catalog ? Catalog.money(unit * i.qty) : "") + '</div></article>';
        }).join("");
        list.querySelectorAll("[data-minus]").forEach((b) => b.onclick = () => change(b.dataset.minus, -1));
        list.querySelectorAll("[data-plus]").forEach((b) => b.onclick = () => change(b.dataset.plus, 1));
        list.querySelectorAll("[data-remove]").forEach((b) => b.onclick = () => remove(b.dataset.remove));
      }
    }
  }
  function open() { document.body.classList.add("cart-open"); }
  function close() { document.body.classList.remove("cart-open"); }
  window.Basket = { add, render, load, clear, change, remove, linePrice, count };
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    e.preventDefault();
    add({ id: btn.dataset.id, name: btn.dataset.name, price: btn.dataset.price });
    open();
  });
  mountChrome(); render();
})();
