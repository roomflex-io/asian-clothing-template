window.SHOP = {
  name: "Noor Atelier",
  tagline: "Asian & modest wear",
  city: "Your city",
  phone: "07xxx xxx xxx",
  email: "hello@yourshop.co.uk",
  instagram: "https://instagram.com/",
  whatsapp: "https://wa.me/44",
  address: "High Street, Your City",
  adminPin: "2468",
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
  { cat: "her", name: "Embroidered lawn suit", price: "£45", tag: "New", desc: "Light lawn three-piece. Ask for remaining sizes.", img: "summer" },
  { cat: "her", name: "Silk kurti", price: "£38", tag: "", desc: "Everyday silk mix. Machine wash cold.", img: "summer" },
  { cat: "him", name: "Cotton kurta", price: "£32", tag: "", desc: "Breathable cotton, straight cut.", img: "thobe" },
  { cat: "him", name: "Waistcoat set", price: "£65", tag: "", desc: "Kurta with matching waistcoat.", img: "sherwani" },
  { cat: "summer", name: "Light chiffon set", price: "£42", tag: "Summer", desc: "Airy chiffon for warm days.", img: "summer" },
  { cat: "summer", name: "Printed lawn 3-piece", price: "£49", tag: "Summer", desc: "Printed lawn with dupatta.", img: "summer" },
  { cat: "winter", name: "Velvet shawl", price: "£55", tag: "Winter", desc: "Heavy velvet wrap.", img: "winter" },
  { cat: "winter", name: "Pashmina wrap", price: "£70", tag: "Winter", desc: "Soft pashmina-style wrap.", img: "winter" },
  { cat: "autumn", name: "Warm linen mix", price: "£40", tag: "Autumn", desc: "Mid-weight linen mix.", img: "winter" },
  { cat: "lehenga", name: "Bridal lehenga", price: "£320", tag: "Bridal", desc: "Full bridal set. Fitting by appointment.", img: "lehenga" },
  { cat: "lehenga", name: "Reception lehenga", price: "£210", tag: "", desc: "Reception weight with lighter skirt.", img: "lehenga" },
  { cat: "wedding", name: "Groom sherwani", price: "£280", tag: "Wedding", desc: "Groom sherwani. Made-to-measure options.", img: "sherwani" },
  { cat: "wedding", name: "Guest formal", price: "£95", tag: "Wedding", desc: "Guest formal, ready to wear.", img: "sherwani" },
  { cat: "abayas", name: "Everyday abaya", price: "£48", tag: "", desc: "Nida everyday abaya.", img: "abaya" },
  { cat: "abayas", name: "Open abaya + belt", price: "£62", tag: "New", desc: "Open front with belt.", img: "abaya" },
  { cat: "thobes", name: "Classic white thobe", price: "£36", tag: "", desc: "Classic white, regular and long.", img: "thobe" },
  { cat: "thobes", name: "Embroidered collar thobe", price: "£52", tag: "", desc: "Collar embroidery.", img: "thobe" },
  { cat: "perfumes", name: "Oud attar", price: "£28", tag: "", desc: "Oil attar. Small bottle.", img: "perfume" },
  { cat: "perfumes", name: "Musk & rose", price: "£24", tag: "", desc: "Soft musk and rose.", img: "perfume" },
  { cat: "accessories", name: "Jhumka earrings", price: "£18", tag: "", desc: "Classic jhumka pair.", img: "accessories" },
  { cat: "accessories", name: "Clutch bag", price: "£22", tag: "", desc: "Evening clutch.", img: "accessories" },
  { cat: "accessories", name: "Hijab pack", price: "£16", tag: "", desc: "Pack of two chiffon hijabs.", img: "abaya" }
];
