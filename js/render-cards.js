(function () {
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
  function shot(p) {
    if (p.photo) return `<img src="${p.photo}" alt="${esc(p.name)}" />`;
    return `<div class="demo-shot"><strong>Image shown here</strong><span>Not actual images</span></div>`;
  }
  window.cardHTML = function (p) {
    return `
      <article class="card">
        <a href="product.html?id=${encodeURIComponent(p.id)}">
          <div class="swatch">${shot(p)}</div>
        </a>
        <div class="info">
          ${p.tag ? `<span class="pill">${esc(p.tag)}</span>` : ""}
          <h3><a href="product.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3>
          ${p.desc ? `<p class="desc">${esc(p.desc)}</p>` : ""}
          <div class="meta">
            <span>${esc(p.price)}</span>
            <button class="add" type="button" data-add data-name="${esc(p.name)}" data-price="${esc(p.price)}">Add</button>
          </div>
        </div>
      </article>`;
  };
})();
