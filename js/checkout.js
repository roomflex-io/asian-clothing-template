(function () {
  const form = document.querySelector("[data-check]");
  if (!form) return;
  function items() {
    return (window.Basket ? Basket.load() : []).map((i) => {
      const p = window.Catalog && Catalog.allProducts().find((x) => x.id === i.id);
      const unit = p ? Catalog.livePrice(p) : Number(String(i.price).replace(/[^0-9.]/g, "")) || 0;
      return { product_id: i.id, title: i.name, qty: i.qty, size: i.size || "", unit: unit };
    });
  }
  function drawSum() {
    const list = items();
    const sub = list.reduce((n, i) => n + i.unit * i.qty, 0);
    const el = document.querySelector("[data-sum]");
    if (el) el.textContent = list.length ? ("Bag total £" + sub.toFixed(2)) : "Your bag is empty.";
  }
  drawSum();
  document.addEventListener("hub-ready", drawSum);
  document.querySelector("[data-acc-login]").onclick = async () => {
    const { error } = await Hub.client.auth.signInWithPassword({ email: document.querySelector("[data-acc-email]").value.trim(), password: document.querySelector("[data-acc-pass]").value });
    document.querySelector("[data-acc-msg]").textContent = error ? error.message : "Logged in.";
  };
  document.querySelector("[data-acc-signup]").onclick = async () => {
    const { error } = await Hub.client.auth.signUp({ email: document.querySelector("[data-acc-email]").value.trim(), password: document.querySelector("[data-acc-pass]").value });
    document.querySelector("[data-acc-msg]").textContent = error ? error.message : "Account created. You can place the order as a guest if confirm-email is on.";
  };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = document.querySelector("[data-err]");
    err.textContent = "";
    const bag = items();
    if (!bag.length) { err.textContent = "Bag is empty."; return; }
    if (!Hub.ok || !Hub.shop) { err.textContent = "Shop database is not connected yet."; return; }
    const f = form;
    try {
      const order = await Hub.placeOrder({
        p_shop: Hub.shop.id,
        p_name: f.name.value.trim(),
        p_email: f.email.value.trim(),
        p_phone: f.phone.value.trim(),
        p_fulfillment: f.fulfillment.value,
        p_address: f.address.value.trim(),
        p_city: f.city.value.trim(),
        p_postcode: f.postcode.value.trim(),
        p_note: f.note.value.trim(),
        p_payment: f.payment.value,
        p_items: bag.map((i) => ({ product_id: i.product_id, qty: i.qty, size: i.size }))
      });
      if (f.payment.value === "stripe") {
        const pay = await Hub.payStripe(order, bag, { delivery_fee: order.delivery_fee });
        location.href = pay.url;
        return;
      }
      if (window.Basket) Basket.clear();
      location.href = "confirm.html?id=" + encodeURIComponent(order.id);
    } catch (ex) {
      err.textContent = ex.message || "Could not place order.";
    }
  });
})();
