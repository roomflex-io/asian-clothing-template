(function () {
  const $ = (s) => document.querySelector(s);
  function show(id) {
    document.querySelectorAll("[data-screen]").forEach((el) => { el.hidden = el.dataset.screen !== id; });
  }
  async function afterHub() {
    if (!window.Hub || !Hub.ok) { show("offline"); return; }
    const { data: { session } } = await Hub.client.auth.getSession();
    if (!session) { show("auth"); return; }
    const { data: shop } = await Hub.client.from("shops").select("id,name,slug,owner_name,email,phone,address_line,city,postcode,company_number,tagline,logo_url,delivery_fee,free_delivery_over,stripe_publishable_key").eq("owner_id", session.user.id).maybeSingle();
    if (!shop) { show("create"); return; }
    Hub.shop = Object.assign(Hub.shop || {}, shop);
    show("app");
    fillShop(shop);
    await drawProducts();
    await drawOrders();
  }
  document.addEventListener("hub-ready", afterHub);
  document.addEventListener("click", async (e) => {
    if (e.target.matches("[data-signup]")) {
      const { error } = await Hub.client.auth.signUp({ email: $("[data-email]").value.trim(), password: $("[data-password]").value });
      $("[data-auth-msg]").textContent = error ? error.message : "Account created. Confirm email if asked, then log in.";
    }
    if (e.target.matches("[data-login]")) {
      const { error } = await Hub.client.auth.signInWithPassword({ email: $("[data-email]").value.trim(), password: $("[data-password]").value });
      $("[data-auth-msg]").textContent = error ? error.message : "";
      if (!error) afterHub();
    }
    if (e.target.matches("[data-logout]")) { await Hub.client.auth.signOut(); location.reload(); }
    if (e.target.matches("[data-create-shop]")) {
      const { error } = await Hub.client.rpc("create_my_shop", {
        p_name: $("[data-new-name]").value.trim(),
        p_slug: $("[data-new-slug]").value.trim(),
        p_owner_name: $("[data-new-owner]").value.trim(),
        p_phone: null,
        p_email: null
      });
      $("[data-create-msg]").textContent = error ? error.message : "";
      if (!error) afterHub();
    }
  });
  function fillShop(s) {
    const f = $("[data-shop-form]");
    if (!f || !s) return;
    ["name","owner_name","phone","email","address_line","city","postcode","company_number","tagline","logo_url"].forEach((k) => { if (f[k]) f[k].value = s[k] || ""; });
    f.delivery_fee.value = s.delivery_fee || 0;
    f.free_delivery_over.value = s.free_delivery_over || 0;
    f.stripe_pk.value = s.stripe_publishable_key || "";
    f.stripe_sk.value = "";
  }
  const shopForm = document.querySelector("[data-shop-form]");
  if (shopForm) shopForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const { error } = await Hub.client.from("shops").update({
      name: f.name.value.trim(), owner_name: f.owner_name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(),
      address_line: f.address_line.value.trim(), city: f.city.value.trim(), postcode: f.postcode.value.trim(),
      company_number: f.company_number.value.trim(), tagline: f.tagline.value.trim(), logo_url: f.logo_url.value.trim(),
      delivery_fee: Number(f.delivery_fee.value || 0), free_delivery_over: Number(f.free_delivery_over.value || 0)
    }).eq("id", Hub.shop.id);
    if (f.stripe_pk.value || f.stripe_sk.value) {
      await Hub.client.rpc("set_my_stripe_keys", { p_pk: f.stripe_pk.value.trim(), p_sk: f.stripe_sk.value.trim() });
    }
    $("[data-shop-msg]").textContent = error ? error.message : "Saved.";
  });
  const form = document.querySelector("[data-product-form]");
  if (form) form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const row = {
      shop_id: Hub.shop.id, title: form.title.value.trim(), sku: form.sku.value.trim(), page_slug: form.page_slug.value,
      description: form.description.value.trim(), details: form.details.value.trim(), price: Number(form.price.value || 0),
      sale_on: form.sale_on.checked, sale_price: form.sale_price.value ? Number(form.sale_price.value) : null,
      stock: Number(form.stock.value || 0),
      sizes: form.sizes.value.split(/[,/]/).map((s) => s.trim()).filter(Boolean),
      colours: form.colours.value.split(/[,/]/).map((s) => s.trim()).filter(Boolean),
      fabric: form.fabric.value.trim(), care: form.care.value.trim(), notes_internal: form.notes_internal.value.trim(),
      video_url: form.video_url.value.trim(), active: form.active.checked
    };
    let productId = form.id.value;
    if (productId) {
      const { error } = await Hub.client.from("products").update(row).eq("id", productId);
      if (error) return alert(error.message);
    } else {
      const { data, error } = await Hub.client.from("products").insert(row).select("id").single();
      if (error) return alert(error.message);
      productId = data.id;
    }
    const file = form.photo.files && form.photo.files[0];
    if (file) {
      const path = Hub.shop.id + "/products/" + productId + "/" + Date.now() + "-" + file.name.replace(/\s+/g, "-");
      const up = await Hub.client.storage.from("shop-media").upload(path, file, { upsert: true });
      if (!up.error) {
        const { data } = Hub.client.storage.from("shop-media").getPublicUrl(path);
        await Hub.client.from("product_media").insert({ shop_id: Hub.shop.id, product_id: productId, url: data.publicUrl, kind: file.type.startsWith("video") ? "video" : "photo" });
      } else alert(up.error.message);
    }
    form.reset(); form.id.value = ""; form.active.checked = true;
    drawProducts();
  });
  async function drawProducts() {
    const { data } = await Hub.client.from("products").select("*, product_media(*)").eq("shop_id", Hub.shop.id).order("created_at", { ascending: false });
    const box = $("[data-stock]");
    box.innerHTML = (data || []).map((p) => "<article class='stock-row'><div><strong>" + esc(p.title) + "</strong><p>£" + p.price + (p.sale_on ? " → £" + p.sale_price : "") + " · " + esc(p.page_slug) + " · " + p.stock + " in stock</p></div><div class='stock-acts'><button type='button' data-edit='" + p.id + "'>Edit</button><button type='button' data-del='" + p.id + "'>Remove</button></div></article>").join("") || "<p class='muted'>No products yet.</p>";
    box.querySelectorAll("[data-edit]").forEach((b) => b.onclick = () => {
      const p = data.find((x) => x.id === b.dataset.edit);
      form.id.value = p.id; form.title.value = p.title; form.sku.value = p.sku || ""; form.page_slug.value = p.page_slug;
      form.description.value = p.description || ""; form.details.value = p.details || ""; form.price.value = p.price;
      form.sale_on.checked = p.sale_on; form.sale_price.value = p.sale_price || ""; form.stock.value = p.stock;
      form.sizes.value = (p.sizes || []).join(" / "); form.colours.value = (p.colours || []).join(" / ");
      form.fabric.value = p.fabric || ""; form.care.value = p.care || ""; form.notes_internal.value = p.notes_internal || "";
      form.video_url.value = p.video_url || ""; form.active.checked = p.active;
    });
    box.querySelectorAll("[data-del]").forEach((b) => b.onclick = async () => {
      if (!confirm("Remove this product?")) return;
      await Hub.client.from("products").delete().eq("id", b.dataset.del);
      drawProducts();
    });
  }
  async function drawOrders() {
    const { data } = await Hub.client.from("orders").select("*, order_items(*)").eq("shop_id", Hub.shop.id).order("created_at", { ascending: false });
    $("[data-orders]").innerHTML = (data || []).map((o) => "<article class='order-card'><strong>" + esc(o.name) + "</strong><p>" + esc(o.email) + " · £" + o.total + " · " + esc(o.pay_status) + "</p></article>").join("") || "<p class='muted'>No orders yet.</p>";
  }
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach((b) => b.classList.remove("on"));
      document.querySelectorAll("[data-panel]").forEach((p) => { p.hidden = true; });
      btn.classList.add("on");
      document.querySelector("[data-panel='" + btn.dataset.tab + "']").hidden = false;
    });
  });
  function esc(s) { return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
})();
