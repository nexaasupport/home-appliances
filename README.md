# Nexaa

Public website and inventory admin for a home-appliance shop. Built with **Vite, vanilla JS and SCSS** (multi-page, no framework, no backend).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
npm run preview
```

## What's in it
- **Public site**: Home, Products (search, category/brand filters, sort, URL-shareable), Product detail (gallery, tabs, WhatsApp/Call enquiry), Offers, Brands, Services, Contact (validated form that opens WhatsApp).
- **Admin** (`/admin/login.html`): Dashboard, Products (add/edit/delete), Stock in/out with low-stock alerts, Reports (date range, KPIs, animated SVG chart with a data-table alternative).
- **Motion**: staggered hero, scroll reveals, parallax, count-ups, hover lifts, sticky header, drawer, cross-page View Transitions. Everything respects `prefers-reduced-motion`.

## Admin demo login
`admin@homeappliances.in` / `admin123`

This is a front-end prototype. The login is a `sessionStorage` flag and all data lives in `localStorage` (`ha.db.v1`), so it is per-browser and **not secure**. Replace `src/js/store.js` and the gate in `src/js/admin/app.js` with a real API and server-side session before production.

## Structure
```
*.html, admin/*.html      one HTML shell per page (registered in vite.config.js)
src/data/catalog.js       site info, categories, seed products, offers, photo ids
src/js/store.js           shared data layer (products, purchases, sales)
src/js/pages/*            public page renderers
src/js/admin/app.js       admin screens
src/scss/                 tokens -> base -> components -> pages
docs/                     reference mockups
```

## Content notes
- Photos are hot-linked from [Unsplash](https://unsplash.com) (Unsplash License). Swap in your own product photos in `PHOTOS` (`src/data/catalog.js`) for production. Air coolers and water heaters have no photo yet and show an SVG icon tile.
- Brand names are shown as text wordmarks. Add official logos only with the brands' permission.
- Store name, phone, address, prices and reviews are placeholders.
