(function () {
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function shot(p) {
    if (p.photo) return `<img src="${p.photo}" alt="${esc(p.name)}" />`;
    return `<div class="demo-shot"><strong>Image shown here</strong><span>Not actual images</span></div>`;
  }
  window.cardHTML = function (p) {
    if (p.active === false) return "";
    const unit = Catalog.livePrice(p);
    const sale = p.saleOn && p.salePrice > 0 && p.salePrice < p.price;
    const out = p.stock <= 0;
    const tag = out ? "Sold out" : (sale ? "Sale" : p.tag);
    const price = sale ? `<span><s>${Catalog.money(p.price)}</s> ${Catalog.money(unit)}</span>` : `<span>${Catalog.money(unit)}</span>`;
    const add = out ? `<button class="add" type="button" disabled>Sold out</button>` : `<button class="add" type="button" data-add data-id="${esc(p.id)}" data-name="${esc(p.name)}" data-price="${unit}">Add</button>`;
    return `<article class="card"><a href="product.html?id=${encodeURIComponent(p.id)}"><div class="swatch">${shot(p)}</div></a><div class="info">${tag ? `<span class="pill">${esc(tag)}</span>` : ""}<h3><a href="product.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3>${p.desc ? `<p class="desc">${esc(p.desc)}</p>` : ""}<div class="meta">${price}${add}</div></div></article>`;
  };
})();
