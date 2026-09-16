window.SHOP = {
  name: "Noor Atelier",
  tagline: "Asian & modest wear",
  city: "Your city",
  phone: "07xxx xxx xxx",
  email: "hello@yourshop.co.uk",
  instagram: "https://instagram.com/",
  whatsapp: "https://wa.me/44",
  address: "High Street, Your City",
  gold: "#c4a574",
  ink: "#1a1410",
  cream: "#f6f1ea",
  heroImg: null,
  collections: {
    him:      { on: true,  label: "For him",     href: "shop.html?cat=him" },
    her:      { on: true,  label: "For her",     href: "shop.html?cat=her" },
    summer:   { on: true,  label: "Summer",      href: "shop.html?cat=summer" },
    winter:   { on: true,  label: "Winter",      href: "shop.html?cat=winter" },
    autumn:   { on: true,  label: "Autumn",      href: "shop.html?cat=autumn" },
    lehenga:  { on: true,  label: "Lehenga",     href: "shop.html?cat=lehenga" },
    wedding:  { on: true,  label: "Wedding",     href: "shop.html?cat=wedding" },
    abayas:   { on: true,  label: "Abayas",      href: "shop.html?cat=abayas" },
    thobes:   { on: true,  label: "Thobes",      href: "shop.html?cat=thobes" },
    perfumes: { on: true,  label: "Perfumes",    href: "shop.html?cat=perfumes" },
    accessories: { on: true, label: "Accessories", href: "shop.html?cat=accessories" }
  }
};

window.pic = (key) => (window.PHOTOS && PHOTOS[key]) || "";

window.PRODUCTS = [
  { cat: "her", name: "Embroidered lawn suit", price: "£45", tag: "New", img: "summer" },
  { cat: "her", name: "Silk kurti", price: "£38", tag: "", img: "summer" },
  { cat: "him", name: "Cotton kurta", price: "£32", tag: "", img: "thobe" },
  { cat: "him", name: "Waistcoat set", price: "£65", tag: "", img: "sherwani" },
  { cat: "summer", name: "Light chiffon set", price: "£42", tag: "Summer", img: "summer" },
  { cat: "summer", name: "Printed lawn 3-piece", price: "£49", tag: "Summer", img: "summer" },
  { cat: "winter", name: "Velvet shawl", price: "£55", tag: "Winter", img: "winter" },
  { cat: "winter", name: "Pashmina wrap", price: "£70", tag: "Winter", img: "winter" },
  { cat: "autumn", name: "Warm linen mix", price: "£40", tag: "Autumn", img: "winter" },
  { cat: "lehenga", name: "Bridal lehenga", price: "£320", tag: "Bridal", img: "lehenga" },
  { cat: "lehenga", name: "Reception lehenga", price: "£210", tag: "", img: "lehenga" },
  { cat: "wedding", name: "Groom sherwani", price: "£280", tag: "Wedding", img: "sherwani" },
  { cat: "wedding", name: "Guest formal", price: "£95", tag: "Wedding", img: "sherwani" },
  { cat: "abayas", name: "Everyday abaya", price: "£48", tag: "", img: "abaya" },
  { cat: "abayas", name: "Open abaya + belt", price: "£62", tag: "New", img: "abaya" },
  { cat: "thobes", name: "Classic white thobe", price: "£36", tag: "", img: "thobe" },
  { cat: "thobes", name: "Embroidered collar thobe", price: "£52", tag: "", img: "thobe" },
  { cat: "perfumes", name: "Oud attar", price: "£28", tag: "", img: "perfume" },
  { cat: "perfumes", name: "Musk & rose", price: "£24", tag: "", img: "perfume" },
  { cat: "accessories", name: "Jhumka earrings", price: "£18", tag: "", img: "accessories" },
  { cat: "accessories", name: "Clutch bag", price: "£22", tag: "", img: "accessories" },
  { cat: "accessories", name: "Hijab pack", price: "£16", tag: "", img: "abaya" }
];
