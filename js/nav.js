(function () {
  function brand() {
    const shop = window.SHOP || {};
    if (shop.gold) document.documentElement.style.setProperty("--gold", shop.gold);
    if (shop.ink) document.documentElement.style.setProperty("--ink", shop.ink);
    if (shop.cream) document.documentElement.style.setProperty("--cream", shop.cream);
    document.querySelectorAll("[data-shop-name]").forEach((el) => {
      const tag = el.querySelector("[data-tagline], span");
      const tagText = (shop.tagline || (tag && tag.textContent) || "").trim();
      el.textContent = "";
      el.append(document.createTextNode(shop.name || ""));
      if (tag || tagText) {
        const span = document.createElement("span");
        if (tag && tag.getAttribute("data-tagline") !== null) span.setAttribute("data-tagline", "");
        span.textContent = tagText;
        el.appendChild(span);
      }
    });
    document.querySelectorAll("[data-tagline]").forEach((el) => { if (shop.tagline) el.textContent = shop.tagline; });
    document.querySelectorAll("[data-email]").forEach((el) => {
      if (!shop.email) return;
      if (el.tagName === "A") { el.href = "mailto:" + shop.email; el.textContent = shop.email; }
      else el.textContent = shop.email;
    });
    document.querySelectorAll("[data-phone]").forEach((el) => { if (shop.phone) el.textContent = shop.phone; });
    document.querySelectorAll("[data-address]").forEach((el) => { if (shop.address) el.textContent = shop.address; });
    document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
    const wa = shop.whatsapp || (shop.phone ? ("https://wa.me/" + String(shop.phone).replace(/[^0-9]/g, "")) : "");
    document.querySelectorAll("[data-wa]").forEach((a) => { if (wa) a.href = wa; });
    document.querySelectorAll("[data-ig]").forEach((a) => { if (shop.instagram) a.href = shop.instagram; });
    const page = document.body.dataset.page || "";
    if (shop.name && page === "contact") document.title = "Visit — " + shop.name;
    if (shop.name && page === "home") document.title = shop.name;
    if (shop.name && page === "privacy") document.title = "Privacy — " + shop.name;
  }
  function links() {
    const nav = document.querySelector("[data-nav]");
    if (!nav) return;
    const page = document.body.dataset.page || "";
    const all = [
      { href: "index.html", label: "Home", key: "home" },
      { href: "shop.html", label: "Shop", key: "shop" },
      { href: "contact.html", label: "Visit", key: "contact" }
    ];
    nav.innerHTML = all.map((l) => {
      const active = page === l.key || (page === "home" && l.key === "home") || (document.body.dataset.shopPage && l.key === "shop");
      return "<a href=\"" + l.href + "\" class=\"" + (active ? "active" : "") + "\">" + l.label + "</a>";
    }).join("");
    const burger = document.querySelector("[data-burger]");
    if (burger && !burger.dataset.bound) {
      burger.dataset.bound = "1";
      burger.addEventListener("click", () => nav.classList.toggle("open"));
    }
  }
  brand();
  links();
  document.addEventListener("hub-ready", () => { brand(); links(); });
})();
