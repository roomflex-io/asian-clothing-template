(function () {
  const shop = window.SHOP;
  document.documentElement.style.setProperty("--gold", shop.gold);
  document.documentElement.style.setProperty("--ink", shop.ink);
  document.documentElement.style.setProperty("--cream", shop.cream);

  document.querySelectorAll("[data-shop-name]").forEach((el) => {
    el.textContent = shop.name;
  });
  document.querySelectorAll("[data-tagline]").forEach((el) => {
    el.textContent = shop.tagline;
  });

  const links = document.querySelector("[data-nav]");
  if (!links) return;

  const page = document.body.dataset.page || "";
  const always = [
    { href: "index.html", label: "Home", key: "home" },
  ];

  const cols = Object.entries(shop.collections)
    .filter(([, c]) => c.on)
    .map(([key, c]) => ({ href: c.href, label: c.label, key }));

  const after = [
    { href: "contact.html", label: "Contact", key: "contact" },
    { href: "privacy.html", label: "Privacy", key: "privacy" }
  ];

  const all = [...always, ...cols, ...after];
  links.innerHTML = all
    .map((l) => {
      const active =
        (page === "home" && l.key === "home") ||
        (page === "contact" && l.key === "contact") ||
        (page === "privacy" && l.key === "privacy") ||
        (page === l.key);
      return `<a href="${l.href}" class="${active ? "active" : ""}">${l.label}</a>`;
    })
    .join("");

  const burger = document.querySelector("[data-burger]");
  if (burger) {
    burger.addEventListener("click", () => links.classList.toggle("open"));
  }

  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = shop.whatsapp;
  });
  document.querySelectorAll("[data-ig]").forEach((a) => {
    a.href = shop.instagram;
  });
  document.querySelectorAll("[data-email]").forEach((el) => {
    if (el.tagName === "A") el.href = "mailto:" + shop.email;
    else el.textContent = shop.email;
  });
  document.querySelectorAll("[data-phone]").forEach((el) => {
    el.textContent = shop.phone;
  });
  document.querySelectorAll("[data-address]").forEach((el) => {
    el.textContent = shop.address;
  });
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
