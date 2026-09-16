(function () {
  const KEY = "noor-basket";
  const tones = ["#3a2e26", "#3d4f46", "#6a3a48", "#8a6a40"];

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
  function pence(price) {
    return Number(String(price).replace(/[^0-9.]/g, "")) || 0;
  }
  function money(n) {
    return "£" + n.toLocaleString("en-GB");
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
    save(load().map((x) => x.name === name ? { ...x, qty: x.qty + delta } : x).filter((x) => x.qty > 0));
  }
  function remove(name) {
    save(load().filter((x) => x.name !== name));
  }
  function pulse() {
    const btn = document.querySelector("[data-basket-btn]");
    if (!btn) return;
    btn.classList.remove("pop");
    void btn.offsetWidth;
    btn.classList.add("pop");
  }

  function mountChrome() {
    if (document.querySelector("[data-basket-btn]")) return;
    const slot = document.querySelector("[data-basket-slot]") || document.querySelector(".nav");
    if (!slot) return;
    const wrap = document.createElement("div");
    wrap.className = "basket-wrap";
    wrap.innerHTML = `
      <button class="basket-btn" data-basket-btn type="button" aria-label="Bag">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round">
          <path d="M7 7.2h10l-.72 12.2H7.72L7 7.2z"/>
          <path d="M9.2 7.2V5.8a2.8 2.8 0 0 1 5.6 0v1.4"/>
        </svg>
        <span class="badge" data-basket-count hidden>0</span>
      </button>
      <div class="drawer-bg" data-drawer-bg></div>
      <aside class="drawer" data-drawer role="dialog" aria-label="Your bag">
        <header class="bag-head">
          <div>
            <p class="bag-kicker">Your bag</p>
            <h2 data-bag-title>0 pieces</h2>
          </div>
          <button type="button" class="bag-close" data-drawer-close aria-label="Close">Close</button>
        </header>
        <div class="drawer-list" data-drawer-list></div>
        <footer class="bag-foot" data-bag-foot hidden>
          <div class="bag-sum">
            <span>Subtotal</span>
            <strong data-drawer-total>£0</strong>
          </div>
          <p class="bag-note">Reserve on WhatsApp. Pay in store or when we confirm stock.</p>
          <a class="btn solid bag-cta" data-wa href="#">Request these pieces</a>
        </footer>
      </aside>`;
    slot.appendChild(wrap);
    wrap.querySelector("[data-basket-btn]").addEventListener("click", open);
    wrap.querySelector("[data-drawer-close]").addEventListener("click", close);
    wrap.querySelector("[data-drawer-bg]").addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  function render() {
    const items = load();
    const n = count();
    const badge = document.querySelector("[data-basket-count]");
    if (badge) {
      badge.textContent = n;
      badge.hidden = n === 0;
    }
    const title = document.querySelector("[data-bag-title]");
    if (title) title.textContent = n === 1 ? "1 piece" : n + " pieces";
    const foot = document.querySelector("[data-bag-foot]");
    if (foot) foot.hidden = items.length === 0;
    const total = document.querySelector("[data-drawer-total]");
    const sum = items.reduce((s, i) => s + pence(i.price) * i.qty, 0);
    if (total) total.textContent = money(sum);

    const list = document.querySelector("[data-drawer-list]");
    if (list) {
      if (!items.length) {
        list.innerHTML = `<div class="bag-empty"><p>Your bag is empty</p><span>Add a piece from the shop — we’ll hold it when you message.</span></div>`;
      } else {
        list.innerHTML = items.map((i, idx) => `
          <article class="bag-row">
            <div class="bag-thumb" style="background:${tones[idx % tones.length]}"></div>
            <div class="bag-copy">
              <h3>${i.name}</h3>
              <p>${i.price}</p>
              <div class="bag-actions">
                <div class="stepper">
                  <button type="button" data-minus="${i.name}" aria-label="Fewer">−</button>
                  <em>${i.qty}</em>
                  <button type="button" data-plus="${i.name}" aria-label="More">+</button>
                </div>
                <button type="button" class="text-btn" data-remove="${i.name}">Remove</button>
              </div>
            </div>
            <div class="bag-line">${money(pence(i.price) * i.qty)}</div>
          </article>`).join("");
        list.querySelectorAll("[data-minus]").forEach((b) => b.onclick = () => change(b.dataset.minus, -1));
        list.querySelectorAll("[data-plus]").forEach((b) => b.onclick = () => change(b.dataset.plus, 1));
        list.querySelectorAll("[data-remove]").forEach((b) => b.onclick = () => remove(b.dataset.remove));
      }
    }

    const wa = document.querySelector(".drawer [data-wa]");
    if (wa && window.SHOP) {
      const lines = items.map((i) => `${i.qty} × ${i.name} (${i.price})`).join("\n");
      const msg = "Hello, I’d like to request:\n" + lines + "\n\nSubtotal " + money(sum);
      const base = window.SHOP.whatsapp || "https://wa.me/44";
      wa.href = base + (base.includes("?") ? "&" : "?") + "text=" + encodeURIComponent(msg);
    }
  }

  function open() { document.body.classList.add("cart-open"); }
  function close() { document.body.classList.remove("cart-open"); }

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
