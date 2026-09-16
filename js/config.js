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
  heroImg: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80",
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

const img = (id, w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w || 900}&q=80`;

window.PRODUCTS = [
  { cat: "her", name: "Embroidered lawn suit", price: "£45", tag: "New", img: img("photo-1610030469983-98e550d6193c") },
  { cat: "her", name: "Silk kurti", price: "£38", tag: "", img: img("photo-1594633313593-bab3825d0caf") },
  { cat: "him", name: "Cotton kurta", price: "£32", tag: "", img: img("photo-1506794778202-cad84cf45f1d") },
  { cat: "him", name: "Waistcoat set", price: "£65", tag: "", img: img("photo-1507003211169-0a1dd7228f2d") },
  { cat: "summer", name: "Light chiffon set", price: "£42", tag: "Summer", img: img("photo-1515886657613-9f3515b0c78f") },
  { cat: "summer", name: "Printed lawn 3-piece", price: "£49", tag: "Summer", img: img("photo-1490481651871-ab68de25d43d") },
  { cat: "winter", name: "Velvet shawl", price: "£55", tag: "Winter", img: img("photo-1434389677669-e08b4cac3105") },
  { cat: "winter", name: "Pashmina wrap", price: "£70", tag: "Winter", img: img("photo-1520903920243-00d872a2d1c9") },
  { cat: "autumn", name: "Warm linen mix", price: "£40", tag: "Autumn", img: img("photo-1485968579580-b6d095142e6e") },
  { cat: "lehenga", name: "Bridal lehenga", price: "£320", tag: "Bridal", img: img("photo-1595475038784-bbe439ff41e6") },
  { cat: "lehenga", name: "Reception lehenga", price: "£210", tag: "", img: img("photo-1583391733956-6c78276477e2") },
  { cat: "wedding", name: "Groom sherwani", price: "£280", tag: "Wedding", img: img("photo-1617137968427-85924c800a22") },
  { cat: "wedding", name: "Guest formal", price: "£95", tag: "Wedding", img: img("photo-1606800052052-a08af7148866") },
  { cat: "abayas", name: "Everyday abaya", price: "£48", tag: "", img: img("photo-1592878904946-b3cd8ae243d0") },
  { cat: "abayas", name: "Open abaya + belt", price: "£62", tag: "New", img: img("photo-1576566588028-4147f3842f27") },
  { cat: "thobes", name: "Classic white thobe", price: "£36", tag: "", img: img("photo-1500648767791-00dcc994a43e") },
  { cat: "thobes", name: "Embroidered collar thobe", price: "£52", tag: "", img: img("photo-1472099645785-5658abf4ff4e") },
  { cat: "perfumes", name: "Oud attar", price: "£28", tag: "", img: img("photo-1541643600914-78b084683601") },
  { cat: "perfumes", name: "Musk & rose", price: "£24", tag: "", img: img("photo-1594035910387-fea477942961") },
  { cat: "accessories", name: "Jhumka earrings", price: "£18", tag: "", img: img("photo-1515562141207-7a88fb7ce338") },
  { cat: "accessories", name: "Clutch bag", price: "£22", tag: "", img: img("photo-1566150905458-1bf1fc113f0d") },
  { cat: "accessories", name: "Hijab pack", price: "£16", tag: "", img: img("photo-1603252109303-2751441dd157") }
];
