// All photos are Unsplash photo ids (free under the Unsplash License); see utils/format.js#photo.
export const PHOTOS = {
  hero: '1631679893114-7957e44879db',
  fridge: '1588854337115-1c67d9247e4d',
  fridge2: '1721613877687-c9099b698faa',
  washer: '1626806787461-102c1bfaaea1',
  washer2: '1622473590925-e3616c0a41bf',
  ac: '1762341123870-d706f257a12e',
  tv: '1646861039459-fd9e3aabf3fb',
  mixer: '1654064754916-e3edeb09c042',
  microwave: '1585659722983-3a675dabf23d',
  microwave2: '1690731849383-514935755156',
  vacuum: '1765970101654-337b573142fb',
  fan: '1609519479841-5fd3b2884e17',
  fan2: '1601084195907-44baaa49dabd',
  heater: '1575299737366-39c143459bc5',
  heater2: '1722604831786-656f0bac1502',
  kettle: '1594213114663-d94db9b17125',
  store: '1783700776216-cf661c778151',
  living: '1628744876497-eb30460be9f6',
  living2: '1628592102751-ba83b0314276',
};

export const site = {
  name: 'Nexaa',
  tagline: 'Better Homes. Happier Lives.',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'support@nexaa.in',
  address: '123, Anna Salai, Coimbatore - 641001, Tamil Nadu',
  hours: 'Mon - Sun: 9:00 AM - 9:00 PM',
};

export const categories = [
  { id: 'refrigerators', name: 'Refrigerators', photo: 'fridge', icon: 'fridge', tint: 'cream' },
  { id: 'washing-machines', name: 'Washing Machines', photo: 'washer', icon: 'washer', tint: 'sky' },
  { id: 'air-conditioners', name: 'Air Conditioners', photo: 'ac', icon: 'ac', tint: 'mint' },
  { id: 'televisions', name: 'Televisions', photo: 'tv', icon: 'tv', tint: 'lavender' },
  { id: 'kitchen-appliances', name: 'Kitchen Appliances', photo: 'mixer', icon: 'mixer', tint: 'blush' },
  { id: 'microwaves', name: 'Microwaves & Ovens', photo: 'microwave', icon: 'mixer', tint: 'cream' },
  { id: 'small-appliances', name: 'Small Appliances', photo: 'vacuum', icon: 'kettle', tint: 'lavender' },
  { id: 'fans', name: 'Fans & Coolers', photo: 'fan2', icon: 'fan', tint: 'sky' },
  { id: 'water-heaters', name: 'Water Heaters', photo: 'heater', icon: 'heater', tint: 'mint' },
];

export const brands = [
  'SAMSUNG', 'LG', 'Whirlpool', 'IFB', 'Panasonic', 'Haier', 'Godrej', 'BOSCH', 'HITACHI', 'VOLTAS',
].map((name) => ({ name, id: name.toLowerCase() }));

export const seedProducts = [
  { id: 'p1', name: 'Samsung 253L Refrigerator', brand: 'Samsung', category: 'refrigerators', photo: 'fridge', price: 34990, stock: 5, rating: 4.6, specs: { Capacity: '253 Litres', Technology: 'Digital Inverter', 'Energy Rating': '2 Star', Warranty: '1 Year (Compressor 10 Years)' }, description: 'Efficient cooling, spacious storage and a modern design. Perfect for small to medium families.' },
  { id: 'p2', name: 'LG 7kg Front Load Washing Machine', brand: 'LG', category: 'washing-machines', photo: 'washer', price: 32490, stock: 3, rating: 4.5, specs: { Capacity: '7 kg', Type: 'Front Load', Motor: 'Inverter Direct Drive', Warranty: '2 Years' }, description: 'Gentle on clothes, tough on stains, with steam wash and a quiet inverter motor.' },
  { id: 'p3', name: 'Sony 55" 4K UHD Smart TV', brand: 'Sony', category: 'televisions', photo: 'tv', price: 54990, stock: 4, rating: 4.7, specs: { Screen: '55 inch', Resolution: '4K UHD', Smart: 'Google TV', Warranty: '1 Year' }, description: 'Vivid 4K picture with smart streaming built in.' },
  { id: 'p4', name: 'Daikin 1.5 Ton Inverter AC', brand: 'Daikin', category: 'air-conditioners', photo: 'ac', price: 42990, stock: 2, rating: 4.6, specs: { Capacity: '1.5 Ton', Type: 'Split Inverter', 'Energy Rating': '3 Star', Warranty: '1 Year (Compressor 5 Years)' }, description: 'Fast cooling with low power consumption and a quiet indoor unit.' },
  { id: 'p5', name: 'Preethi Mixer Grinder', brand: 'Preethi', category: 'kitchen-appliances', photo: 'mixer', price: 6990, stock: 12, rating: 4.4, specs: { Power: '750 W', Jars: '4', Warranty: '2 Years' }, description: 'Powerful grinding for Indian kitchens with four durable jars.' },
  { id: 'p6', name: 'Bajaj Table Fan 400mm', brand: 'Bajaj', category: 'fans', photo: 'fan2', price: 2490, stock: 18, rating: 4.3, specs: { Sweep: '400 mm', Speed: '3 speeds', Warranty: '2 Years' }, description: 'Strong, quiet airflow for bedrooms and offices, with a sturdy metal guard.' },
  { id: 'p7', name: 'Haier 5 Star Double Door Refrigerator', brand: 'Haier', category: 'refrigerators', photo: 'fridge2', price: 28990, stock: 6, rating: 4.2, specs: { Capacity: '258 Litres', 'Energy Rating': '5 Star', Warranty: '1 Year' }, description: 'Energy saving double door with quick-freeze technology.' },
  { id: 'p8', name: 'Godrej 6.5kg Top Load Washer', brand: 'Godrej', category: 'washing-machines', photo: 'washer2', price: 18990, stock: 7, rating: 4.1, specs: { Capacity: '6.5 kg', Type: 'Top Load', Warranty: '2 Years' }, description: 'Dependable everyday washing at a friendly price.' },
  { id: 'p9', name: 'Crompton Ceiling Fan 1200mm', brand: 'Crompton', category: 'fans', photo: 'fan', price: 3190, stock: 20, rating: 4.4, specs: { Sweep: '1200 mm', Speed: '350 RPM', Warranty: '2 Years' }, description: 'High-speed, energy efficient ceiling fan.' },
  { id: 'p10', name: 'Havells 25L Storage Water Heater', brand: 'Havells', category: 'water-heaters', photo: 'heater', price: 8490, stock: 9, rating: 4.3, specs: { Capacity: '25 L', Rating: '5 Star', Warranty: '2 Years' }, description: 'Rust-proof tank with fast heating and a safety valve.' },
  { id: 'p11', name: 'Philips Electric Kettle 1.5L', brand: 'Philips', category: 'small-appliances', photo: 'kettle', price: 1890, stock: 15, rating: 4.5, specs: { Capacity: '1.5 L', Power: '1800 W', Warranty: '2 Years' }, description: 'Stainless steel kettle with auto shut-off.' },
  { id: 'p12', name: 'Voltas 1 Ton Window AC', brand: 'Voltas', category: 'air-conditioners', photo: 'ac', price: 27990, stock: 1, rating: 4.0, specs: { Capacity: '1 Ton', Type: 'Window', 'Energy Rating': '3 Star', Warranty: '1 Year' }, description: 'Compact window AC for small rooms.' },
  { id: 'p13', name: 'IFB 25L Convection Microwave', brand: 'IFB', category: 'microwaves', photo: 'microwave', price: 12490, stock: 8, rating: 4.4, specs: { Capacity: '25 L', Type: 'Convection', Power: '900 W', Warranty: '1 Year' }, description: 'Bake, grill and reheat with auto-cook menus for everyday Indian cooking.' },
  { id: 'p14', name: 'Philips Cordless Vacuum Cleaner', brand: 'Philips', category: 'small-appliances', photo: 'vacuum', price: 14990, stock: 6, rating: 4.4, specs: { Type: 'Cordless', Runtime: '45 min', Warranty: '2 Years' }, description: 'Lightweight cordless cleaning for floors, sofas and stairs.' },
  { id: 'p15', name: 'Samsung 23L Solo Microwave', brand: 'Samsung', category: 'microwaves', photo: 'microwave2', price: 7490, stock: 10, rating: 4.2, specs: { Capacity: '23 L', Type: 'Solo', Power: '800 W', Warranty: '1 Year' }, description: 'Simple, reliable reheating and defrosting in a compact body.' },
  { id: 'p16', name: 'Racold 15L Instant Water Heater', brand: 'Racold', category: 'water-heaters', photo: 'heater2', price: 6490, stock: 3, rating: 4.1, specs: { Capacity: '15 L', Type: 'Storage', Warranty: '2 Years' }, description: 'Compact geyser with quick heating for small bathrooms and kitchens.' },
];

export const popularIds = ['p1', 'p2', 'p3', 'p4', 'p13', 'p14'];

export const offers = [
  { id: 'festival', title: 'Festival Special Offers', text: 'Big savings on your favourite appliances.', cta: 'Grab Offers', tone: 'navy', photo: 'fridge', badge: 'Up to 20% off' },
  { id: 'exchange', title: 'Exchange Offer', text: 'Upgrade your old appliances with exciting exchange offers.', cta: 'Learn More', tone: 'mint', photo: 'washer', badge: 'Upgrade & Save' },
  { id: 'bank', title: 'Bank Offers', text: 'Get up to 15% instant discount with leading bank cards.', cta: 'View Offers', tone: 'blush', photo: 'tv', badge: '15% OFF' },
];

export const services = [
  { id: 'delivery', icon: 'truck', title: 'Home Delivery', text: 'Safe & timely delivery to your doorstep.' },
  { id: 'installation', icon: 'wrench', title: 'Installation', text: 'Professional setup by trained technicians.' },
  { id: 'warranty', icon: 'shield', title: 'Warranty Support', text: 'Authorized brand service and claims.' },
  { id: 'repair', icon: 'tool', title: 'Repair Service', text: 'Quick and reliable repairs.' },
  { id: 'exchange', icon: 'refresh', title: 'Exchange Service', text: 'Upgrade your old appliance easily.' },
  { id: 'emi', icon: 'wallet', title: 'EMI / Finance', text: 'Easy monthly payment plans.' },
];

// Sample testimonials: replace with real customer reviews before launch.
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

export const steps = [
  { icon: 'search', title: 'Browse & compare', text: 'Explore appliances by category, brand and budget, online or in store.' },
  { icon: 'whatsapp', title: 'Enquire in seconds', text: 'Message us on WhatsApp or call. We confirm price, stock and offers.' },
  { icon: 'truck', title: 'Delivery & installation', text: 'Your appliance is delivered and set up by trained technicians.' },
  { icon: 'shield', title: 'Warranty & support', text: 'Brand warranty, repairs and service help whenever you need it.' },
];

export const faqs = [
  { q: 'Are all products genuine with brand warranty?', a: 'Yes. Every appliance is sourced from authorised brand channels and comes with the manufacturer warranty.' },
  { q: 'Do you provide delivery and installation?', a: 'We deliver to your doorstep and arrange installation by trained technicians for ACs, washing machines, TVs and more.' },
  { q: 'Can I pay in EMI?', a: 'EMI and finance options are available on most products. Ask us on WhatsApp or in store for the plans that suit you.' },
  { q: 'Can I exchange my old appliance?', a: 'Yes. Bring or describe your old appliance and we will share an exchange value against your new purchase.' },
  { q: 'How do I place an order?', a: 'Pick a product, tap Enquire on WhatsApp or call us. We confirm availability and price, then arrange payment and delivery.' },
];

// Header navigation: items with `menu` render a dropdown.
export const nav = [
  { icon: 'home', label: 'Home', href: 'index.html' },
  { icon: 'users', label: 'About Us', href: 'about.html', menu: 'about' },
  { icon: 'box', label: 'Products', href: 'products.html', menu: 'products' },
  { icon: 'star', label: 'Brands', href: 'brands.html' },
  { icon: 'tag', label: 'Offers', href: 'offers.html' },
  { icon: 'tool', label: 'Services', href: 'services.html', menu: 'services' },
  { icon: 'phone', label: 'Contact', href: 'contact.html' },
];

export const aboutMenu = [
  { icon: 'home', title: 'Our story', text: 'Who we are and what we stand for', href: 'about.html#story' },
  { icon: 'shield', title: 'Why Nexaa', text: 'Genuine products, honest service', href: 'about.html#values' },
  { icon: 'search', title: 'How it works', text: 'From enquiry to installation', href: 'about.html#how' },
  { icon: 'headset', title: 'FAQs', text: 'Answers to common questions', href: 'about.html#faq' },
];

export const art = { brand: (id) => `/img/brand/${id}.svg` };
