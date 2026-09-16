(function () {
  const PIN = (window.SHOP && SHOP.adminPin) || "2468";
  const gate = document.querySelector("[data-gate]");
  const app = document.querySelector("[data-app]");
  const pinInput = document.querySelector("[data-pin]");
  const pinErr = document.querySelector("[data-pin-err]");

  function unlocked() {
    return sessionStorage.getItem("noor-studio") === "1";
  }
  function unlock() {
    sessionStorage.setItem("noor-studio", "1");
    gate.hidden = true;
    app.hidden = false;
    drawProducts();
    drawOrders();
  }

  document.querySelector("[data-unlock]").addEventListener("click", () => {
    if ((pinInput.value || "").trim() === String(PIN)) unlock();
    else pinErr.hidden = false;
  });
  pinInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.querySelector("[data-unlock]").click();
  });
  if (unlocked()) unlock();

  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach((b) => b.classList.remove("on"));
      document.querySelectorAll("[data-panel]").forEach((p) => p.hidden = true);
      btn.classList.add("on");
      document.querySelector("[data-panel='" + btn.dataset.tab + "']").hidden = false;
    });
  });

  const form = document.querySelector("[data-product-form]");
  const preview = document.querySelector("[data-preview]");
  const file = document.querySelector("[data-file]");

  file.addEventListener("change", () => {
    const f = file.files && file.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => shrink(reader.result).then((data) => {
      form.photo.value = data;
      preview.style.backgroundImage = "url(" + data + ")";
      preview.classList.add("has-pic");
    });
    reader.readAsDataURL(f);
  });

  function shrink(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const max = 900;
        let w = img.width, h = img.height;
        if (w > max) { h = Math.round(h * max / w); w = max; }
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", 0.78));
      };
      img.src = dataUrl;
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const item = {
      id: form.id.value || undefined,
      name: form.name.value.trim(),
      price: form.price.value.trim().startsWith("£") ? form.price.value.trim() : "£" + form.price.value.trim(),
      cat: form.cat.value,
      tag: form.tag.value.trim(),
      desc: form.desc.value.trim(),
      photo: form.photo.value
    };
    if (!item.name || !item.price) return;
    Catalog.saveProduct(item);
    form.reset();
    form.id.value = "";
    form.photo.value = "";
    preview.style.backgroundImage = "";
    preview.classList.remove("has-pic");
    drawProducts();
  });

  document.querySelector("[data-reset]").addEventListener("click", () => {
    form.reset();
    form.id.value = "";
    form.photo.value = "";
    preview.style.backgroundImage = "";
    preview.classList.remove("has-pic");
  });

  function drawProducts() {
    const box = document.querySelector("[data-stock]");
    const list = Catalog.allProducts();
    box.innerHTML = list.map((p) => `
      <article class="stock-row">
        <div class="stock-pic" style="${p.photo ? "background-image:url(" + p.photo + ")" : ""}"></div>
        <div>
          <strong>${esc(p.name)}</strong>
          <p>${esc(p.price)} · ${esc(p.cat)}${p.tag ? " · " + esc(p.tag) : ""}${p.builtIn ? " · sample" : ""}</p>
          ${p.desc ? "<p class='muted'>" + esc(p.desc) + "</p>" : ""}
        </div>
        <div class="stock-acts">
          ${p.builtIn ? "" : `<button type="button" data-edit="${p.id}">Edit</button>`}
          <button type="button" data-del="${p.id}">Remove</button>
        </div>
      </article>
    `).join("") || "<p class='muted'>No pieces yet.</p>";

    box.querySelectorAll("[data-edit]").forEach((b) => b.onclick = () => {
      const p = Catalog.allProducts().find((x) => x.id === b.dataset.edit);
      if (!p) return;
      form.id.value = p.id;
      form.name.value = p.name;
      form.price.value = p.price;
      form.cat.value = p.cat;
      form.tag.value = p.tag || "";
      form.desc.value = p.desc || "";
      form.photo.value = p.photo || "";
      if (p.photo) {
        preview.style.backgroundImage = "url(" + p.photo + ")";
        preview.classList.add("has-pic");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    box.querySelectorAll("[data-del]").forEach((b) => b.onclick = () => {
      if (!confirm("Remove this piece from the shop?")) return;
      Catalog.deleteProduct(b.dataset.del);
      drawProducts();
    });
  }

  function drawOrders() {
    const box = document.querySelector("[data-orders]");
    const list = Catalog.orders();
    box.innerHTML = list.map((o) => `
      <article class="order-card">
        <header>
          <strong>${esc(o.name || "Guest")}</strong>
          <span>${new Date(o.at).toLocaleString("en-GB")}</span>
        </header>
        <p>${esc(o.phone || "")} ${o.note ? " · " + esc(o.note) : ""}</p>
        <ul>${(o.items || []).map((i) => `<li>${i.qty} × ${esc(i.name)} (${esc(i.price)})</li>`).join("")}</ul>
        <p class="sum">${esc(o.total || "")}</p>
        <div class="stock-acts">
          <span class="pill">${esc(o.status)}</span>
          <button type="button" data-st="${o.id}" data-val="held">Mark held</button>
          <button type="button" data-st="${o.id}" data-val="done">Done</button>
        </div>
      </article>
    `).join("") || "<p class='muted'>No reservations yet. When a customer requests pieces, WhatsApp opens with the list — and a copy lands here if they used this browser. The live inbox is your WhatsApp.</p>";

    box.querySelectorAll("[data-st]").forEach((b) => b.onclick = () => {
      Catalog.setOrderStatus(b.dataset.st, b.dataset.val);
      drawOrders();
    });
  }

  document.querySelector("[data-export]").addEventListener("click", () => {
    const blob = new Blob([Catalog.exportAll()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "noor-shop-backup.json";
    a.click();
  });
  document.querySelector("[data-import]").addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try { Catalog.importAll(r.result); drawProducts(); drawOrders(); }
      catch { alert("Could not read that file."); }
    };
    r.readAsText(f);
  });

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
})();
