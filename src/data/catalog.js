// Photo ids are Unsplash photo slugs (free under the Unsplash License), see utils/format.js#photo.
export const PHOTOS = {
  fridge: '1588854337115-1c67d9247e4d',
  washer: '1626806787461-102c1bfaaea1',
  washer2: '1622473590925-e3616c0a41bf',
  ac: '1762341123870-d706f257a12e',
  tv: '1646861039459-fd9e3aabf3fb',
  mixer: '1654064754916-e3edeb09c042',
  fan: '1609519479841-5fd3b2884e17',
  kettle: '1594213114663-d94db9b17125',
  store: '1783700776216-cf661c778151',
  living: '1628744876497-eb30460be9f6',
};

export const site = {
  name: 'Nexaa',
  tagline: 'Better Homes. Happier Lives.',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'support@nexaa.in',
  address: '123, Anna Salai, Coimbatore - 641001, Tamil Nadu',
  hours: 'Mon - Sun: 9:00 AM - 9:00 PM',
  nav: [
    ['Home', 'index.html'],
    ['About Us', 'index.html#about'],
    ['Products', 'products.html'],
    ['Brands', 'brands.html'],
    ['Offers', 'offers.html'],
    ['Services', 'services.html'],
    ['Contact', 'contact.html'],
  ],
};

export const categories = [
  { id: 'refrigerators', name: 'Refrigerators', photo: 'fridge', icon: 'fridge', tint: 'cream' },
  { id: 'washing-machines', name: 'Washing Machines', photo: 'washer', icon: 'washer', tint: 'sky' },
  { id: 'air-conditioners', name: 'Air Conditioners', photo: 'ac', icon: 'ac', tint: 'mint' },
  { id: 'televisions', name: 'Televisions', photo: 'tv', icon: 'tv', tint: 'lavender' },
  { id: 'kitchen-appliances', name: 'Kitchen Appliances', photo: 'mixer', icon: 'mixer', tint: 'blush' },
  { id: 'small-appliances', name: 'Small Appliances', photo: 'kettle', icon: 'kettle', tint: 'lavender' },
  { id: 'air-coolers', name: 'Air Coolers', photo: null, icon: 'cooler', tint: 'sky' },
  { id: 'fans', name: 'Fans', photo: 'fan', icon: 'fan', tint: 'cream' },
  { id: 'water-heaters', name: 'Water Heaters', photo: null, icon: 'heater', tint: 'mint' },
];

export const brands = [
  'SAMSUNG', 'LG', 'Whirlpool', 'IFB', 'Panasonic', 'Haier', 'Godrej', 'BOSCH', 'HITACHI', 'VOLTAS',
].map((name) => ({ name, id: name.toLowerCase() }));

export const seedProducts = [
  { id: 'p1', cut: 'fridge', name: 'Samsung 253L Refrigerator', brand: 'Samsung', category: 'refrigerators', photo: 'fridge', price: 34990, stock: 5, rating: 4.6, specs: { Capacity: '253 Litres', Technology: 'Digital Inverter', 'Energy Rating': '2 Star', Warranty: '1 Year (Compressor 10 Years)' }, description: 'Efficient cooling, spacious storage and a modern design. Perfect for small to medium families.' },
  { id: 'p2', cut: 'washer', name: 'LG 7kg Front Load Washing Machine', brand: 'LG', category: 'washing-machines', photo: 'washer', price: 32490, stock: 3, rating: 4.5, specs: { Capacity: '7 kg', Type: 'Front Load', Motor: 'Inverter Direct Drive', Warranty: '2 Years' }, description: 'Gentle on clothes, tough on stains, with steam wash and a quiet inverter motor.' },
  { id: 'p3', cut: 'tv', name: 'Sony 55" 4K UHD Smart TV', brand: 'Sony', category: 'televisions', photo: 'tv', price: 54990, stock: 4, rating: 4.7, specs: { Screen: '55 inch', Resolution: '4K UHD', Smart: 'Google TV', Warranty: '1 Year' }, description: 'Vivid 4K picture with smart streaming built in.' },
  { id: 'p4', cut: 'ac', name: 'Daikin 1.5 Ton Inverter AC', brand: 'Daikin', category: 'air-conditioners', photo: 'ac', price: 42990, stock: 2, rating: 4.6, specs: { Capacity: '1.5 Ton', Type: 'Split Inverter', 'Energy Rating': '3 Star', Warranty: '1 Year (Compressor 5 Years)' }, description: 'Fast cooling with low power consumption and a quiet indoor unit.' },
  { id: 'p5', cut: 'mixer', name: 'Preethi Mixer Grinder', brand: 'Preethi', category: 'kitchen-appliances', photo: 'mixer', price: 6990, stock: 12, rating: 4.4, specs: { Power: '750 W', Jars: '4', Warranty: '2 Years' }, description: 'Powerful grinding for Indian kitchens with four durable jars.' },
  { id: 'p6', cut: 'cooler', name: 'Symphony Air Cooler', brand: 'Symphony', category: 'air-coolers', photo: null, price: 12990, stock: 8, rating: 4.3, specs: { Capacity: '50 L', Type: 'Tower', Warranty: '1 Year' }, description: 'Strong airflow with honeycomb pads for efficient cooling.' },
  { id: 'p7', name: 'Haier 5 Star Double Door Refrigerator', brand: 'Haier', category: 'refrigerators', photo: 'fridge', price: 28990, stock: 6, rating: 4.2, specs: { Capacity: '258 Litres', 'Energy Rating': '5 Star', Warranty: '1 Year' }, description: 'Energy saving double door with quick-freeze technology.' },
  { id: 'p8', name: 'Godrej 6.5kg Top Load Washer', brand: 'Godrej', category: 'washing-machines', photo: 'washer2', price: 18990, stock: 7, rating: 4.1, specs: { Capacity: '6.5 kg', Type: 'Top Load', Warranty: '2 Years' }, description: 'Dependable everyday washing at a friendly price.' },
  { id: 'p9', name: 'Crompton Ceiling Fan 1200mm', brand: 'Crompton', category: 'fans', photo: 'fan', price: 3190, stock: 20, rating: 4.4, specs: { Sweep: '1200 mm', Speed: '350 RPM', Warranty: '2 Years' }, description: 'High-speed, energy efficient ceiling fan.' },
  { id: 'p10', name: 'Bajaj 15L Storage Water Heater', brand: 'Bajaj', category: 'water-heaters', photo: null, price: 7490, stock: 9, rating: 4.3, specs: { Capacity: '15 L', Rating: '5 Star', Warranty: '2 Years' }, description: 'Rust-proof tank with fast heating and a safety valve.' },
  { id: 'p11', name: 'Philips Electric Kettle 1.5L', brand: 'Philips', category: 'small-appliances', photo: 'kettle', price: 1890, stock: 15, rating: 4.5, specs: { Capacity: '1.5 L', Power: '1800 W', Warranty: '2 Years' }, description: 'Stainless steel kettle with auto shut-off.' },
  { id: 'p12', name: 'Voltas 1 Ton Window AC', brand: 'Voltas', category: 'air-conditioners', photo: 'ac', price: 27990, stock: 1, rating: 4.0, specs: { Capacity: '1 Ton', Type: 'Window', 'Energy Rating': '3 Star', Warranty: '1 Year' }, description: 'Compact window AC for small rooms.' },
];

export const popularIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];

export const offers = [
  { id: 'festival', title: 'Festival Special Offers', text: 'Big savings on your favourite appliances.', cta: 'Grab Offers', tone: 'navy', photo: 'fridge', badge: 'Up to 20% off' },
  { id: 'exchange', title: 'Exchange Offer', text: 'Upgrade your old appliances with exciting exchange offers.', cta: 'Learn More', tone: 'mint', photo: 'washer', badge: 'Upgrade & Save' },
  { id: 'bank', title: 'Bank Offers', text: 'Get up to 15% instant discount with leading bank cards.', cta: 'View Offers', tone: 'blush', photo: 'tv', badge: '15% OFF' },
];

export const services = [
  { icon: 'truck', title: 'Home Delivery', text: 'Safe & timely delivery to your doorstep.' },
  { icon: 'wrench', title: 'Installation', text: 'Professional setup by trained technicians.' },
  { icon: 'shield', title: 'Warranty Support', text: 'Authorized brand service and claims.' },
  { icon: 'tool', title: 'Repair Service', text: 'Quick and reliable repairs.' },
  { icon: 'refresh', title: 'Exchange Service', text: 'Upgrade your old appliance easily.' },
  { icon: 'wallet', title: 'EMI / Finance', text: 'Easy monthly payment plans.' },
];

export const reviews = [
  { name: 'Ramesh Kumar', city: 'Chennai', stars: 5, text: 'Great service and wide variety of products. The staff is very helpful and knowledgeable.' },
  { name: 'Priya S.', city: 'Tirunelveli', stars: 5, text: 'I bought a refrigerator from here. The delivery and installation were on time. Highly recommended!' },
  { name: 'Sathish M.', city: 'Madurai', stars: 5, text: 'Best appliance shop in town. Genuine products and excellent customer service.' },
];

export const whyUs = [
  { icon: 'shield', title: 'Trusted Brands', text: '100% genuine products' },
  { icon: 'headset', title: 'Expert Support', text: 'Guidance before & after purchase' },
  { icon: 'tag', title: 'Best Prices', text: 'Competitive rates & special offers' },
  { icon: 'tool', title: 'After-Sales Service', text: 'Installation, repair & warranty support' },
];

// Mockup-sliced artwork (see scripts/slice-assets.mjs)
export const art = {
  cat: (id) => `/img/cat/${id}.webp`,
  brand: (id) => `/img/brand/${id}.webp`,
  offer: (id) => `/img/offer/${id}.webp`,
  prod: (key) => `/img/prod/${key}.webp`,
  avatar: (i) => `/img/people/${i + 1}.webp`,
};
