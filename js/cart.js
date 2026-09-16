(function () {
  const KEY = "noor-basket";

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
  }
  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    render();
  }
  function count() {
    return load().reduce((n, i) => n + i.qty, 0);
  }

  function add(item) {
    const items = load();
    const found = items.find((x) => x.name === item.name);
    if (found) found.qty += 1;
    else items.push({ name: item.name, price: item.price, qty: 1 });
    save(items);
    pulse();
  }

  function change(name, delta) {
    let items = load();
    items = items.map((x) => x.name === name ? { ...x, qty: x.qty + delta } : x).filter((x) => x.qty > 0);
    save(items);
  }

  function pulse() {
    const btn = document.querySelector("[data-basket-btn]");
    if (!btn) return;
    btn.classList.remove("pop");
    void btn.offsetWidth;
    btn.classList.add("pop");
  }

  function mountChrome() {
    const nav = document.querySelector(".nav");
    if (!nav || document.querySelector("[data-basket-btn]")) return;
    const wrap = document.createElement("div");
    wrap.className = "basket-wrap";
    wrap.innerHTML = `
      <button class="basket-btn" data-basket-btn type="button" aria-label="Basket">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M6 7h12l-1 13H7L6 7z"/>
          <path d="M9 7V5a3 3 0 0 1 6 0v2"/>
        </svg>
        <span class="badge" data-basket-count hidden>0</span>
      </button>
      <div class="drawer-bg" data-drawer-bg></div>
      <aside class="drawer" data-drawer>
        <div class="drawer-head">
          <h2>Basket</h2>
          <button type="button" class="icon-x" data-drawer-close aria-label="Close">×</button>
        </div>
        <div class="drawer-list" data-drawer-list></div>
        <div class="drawer-foot">
          <p class="drawer-total">Total <strong data-drawer-total>£0</strong></p>
          <a class="btn solid" data-wa href="#">Checkout on WhatsApp</a>
        </div>
      </aside>`;
    nav.appendChild(wrap);

    wrap.querySelector("[data-basket-btn]").addEventListener("click", open);
    wrap.querySelector("[data-drawer-close]").addEventListener("click", close);
    wrap.querySelector("[data-drawer-bg]").addEventListener("click", close);
  }

  function money(items) {
    const n = items.reduce((s, i) => {
      const p = Number(String(i.price).replace(/[^0-9.]/g, "")) || 0;
      return s + p * i.qty;
    }, 0);
    return "£" + n;
  }

  function render() {
    const items = load();
    const n = count();
    const badge = document.querySelector("[data-basket-count]");
    if (badge) {
      badge.textContent = n;
      badge.hidden = n === 0;
    }
    const list = document.querySelector("[data-drawer-list]");
    const total = document.querySelector("[data-drawer-total]");
    if (list) {
      list.innerHTML = items.length
        ? items.map((i) => `
          <div class="row">
            <div>
              <strong>${i.name}</strong>
              <span>${i.price} × ${i.qty}</span>
            </div>
            <div class="qty">
              <button type="button" data-minus="${i.name}">−</button>
              <button type="button" data-plus="${i.name}">+</button>
            </div>
          </div>`).join("")
        : `<p class="empty-cart">Nothing in here yet.</p>`;
      list.querySelectorAll("[data-minus]").forEach((b) => b.onclick = () => change(b.dataset.minus, -1));
      list.querySelectorAll("[data-plus]").forEach((b) => b.onclick = () => change(b.dataset.plus, 1));
    }
    if (total) total.textContent = money(items);
    const wa = document.querySelector(".drawer [data-wa]");
    if (wa && window.SHOP) {
      const text = items.map((i) => `${i.qty}x ${i.name} (${i.price})`).join("%0A");
      wa.href = window.SHOP.whatsapp + (window.SHOP.whatsapp.includes("?") ? "&" : "?") + "text=" + encodeURIComponent("Order:%0A" + decodeURIComponent(text));
    }
  }

  function open() {
    document.body.classList.add("cart-open");
  }
  function close() {
    document.body.classList.remove("cart-open");
  }

  window.Basket = { add, render };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    e.preventDefault();
    add({ name: btn.dataset.name, price: btn.dataset.price });
    open();
  });

  mountChrome();
  render();
})();
