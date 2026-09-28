(function () {
  function chips(current) {
    const box = document.querySelector("[data-chips]");
    if (!box || !window.SHOP) return;
    const cols = Object.entries(SHOP.collections || {}).filter(([, c]) => c.on);
    const items = [["all", { label: "All" }]].concat(cols);
    box.innerHTML = items.map(([key, c]) => {
      const href = key === "all" ? "shop.html" : "shop.html?cat=" + key;
      const on = (key === "all" && !current) || current === key;
      return "<a class=\"chip" + (on ? " on" : "") + "\" href=\"" + href + "\">" + c.label + "</a>";
    }).join("");
  }
  async function paint() {
    if (window.Hub && Hub.ok && Hub.shop) {
      const list = await Hub.products();
      if (list.length) {
        window._CLOUD_PRODUCTS = list;
        if (window.Catalog) {
          const orig = Catalog.allProducts;
          Catalog.allProducts = function () { return window._CLOUD_PRODUCTS || orig(); };
        }
      }
    }
    if (window.applyShopBrand) applyShopBrand();
    const cat = new URLSearchParams(location.search).get("cat");
    chips(cat);
    const home = document.querySelector("[data-home-grid]");
    if (home && window.cardHTML && window.Catalog) {
      home.innerHTML = Catalog.allProducts().filter((p) => p.active !== false).slice(0, 8).map(cardHTML).join("");
    }
    const grid = document.querySelector("[data-grid]");
    if (grid && window.cardHTML && window.Catalog) {
      const col = cat && SHOP.collections && SHOP.collections[cat];
      const title = document.querySelector("[data-title]");
      if (title) title.textContent = col ? col.label : "All pieces";
      document.title = (col ? col.label : "Shop") + (SHOP.name ? " — " + SHOP.name : "");
      const list = Catalog.allProducts().filter((p) => p.active !== false && (!cat || p.cat === cat));
      const empty = document.querySelector("[data-empty]");
      if (empty) empty.hidden = list.length > 0;
      grid.innerHTML = list.map(cardHTML).join("");
    }
    const piece = document.querySelector("[data-piece]");
    if (piece && window.Catalog) {
      const id = new URLSearchParams(location.search).get("id");
      let p = Catalog.allProducts().find((x) => x.id === id);
      if (!p && Hub.ok && id) p = await Hub.product(id);
      if (!p) p = Catalog.allProducts()[0];
      if (p) {
        document.title = p.name + (SHOP.name ? " — " + SHOP.name : "");
        document.querySelector("[data-name]").textContent = p.name;
        document.querySelector("[data-price]").innerHTML = (p.saleOn && p.salePrice < p.price) ? ("<s>" + Catalog.money(p.price) + "</s> " + Catalog.money(p.salePrice)) : Catalog.money(Catalog.livePrice(p));
        document.querySelector("[data-desc]").textContent = p.desc || p.details || "";
        const col = SHOP.collections && SHOP.collections[p.cat];
        document.querySelector("[data-cat]").textContent = col ? col.label : (p.cat || "");
        const add = document.querySelector("[data-add]");
        if (add) {
          add.dataset.id = p.id; add.dataset.name = p.name; add.dataset.price = Catalog.livePrice(p);
          if (p.stock <= 0) { add.disabled = true; add.textContent = "Sold out"; }
        }
        if (p.photo) {
          const shot = document.querySelector("[data-shot]");
          shot.style.backgroundImage = "url(" + p.photo + ")";
          const demo = shot.querySelector(".demo-shot");
          if (demo) demo.remove();
        }
      }
    }
    if (window.Basket) Basket.render();
  }
  document.addEventListener("hub-ready", paint);
  if (!window.Hub) paint();
})();
