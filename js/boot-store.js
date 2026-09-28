(async function () {
  if (!window.Hub) return;
  await Hub.boot();
  if (!Hub.ok || !Hub.shop) return;
  const products = await Hub.products();
  if (!products.length) return;
  const grid = document.querySelector("[data-home-grid], [data-shop-grid]");
  if (grid && window.cardHTML) {
    const page = new URLSearchParams(location.search).get("cat");
    const list = page ? products.filter((p) => p.cat === page) : products;
    grid.innerHTML = list.map(cardHTML).join("");
  }
})();
