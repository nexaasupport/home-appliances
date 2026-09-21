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
- **Admin** (`/admin/login.html`): a single-page admin (hash routes) covering the whole shop flow. Website enquiries and contact-form messages land in **Enquiries**, convert into **Orders** (quote, confirmed, delivered, completed) with printable invoices (`NX-YYYY-####`), and feed **Customers** (merged by phone), **Service requests**, **Inventory** (stock ledger, suppliers, purchases), **Products** (photo upload, specs, hide from website), **Reports** (CSV export), **Settings** (store profile, invoices, users, backup) and an **Activity log**. Ctrl/Cmd + K opens global search.
- **Motion**: staggered hero, scroll reveals, parallax, count-ups, hover lifts, sticky header, drawer, cross-page View Transitions. Everything respects `prefers-reduced-motion`.

## Admin demo login
Owner: `admin@nexaa.in` / `admin123`  
Staff: `staff@nexaa.in` / `staff123` (no reports, settings, activity log, deletes or profit figures). Five wrong sign-ins lock the form for 60 seconds.

This is a front-end prototype. All data lives in `localStorage` (`ha.db.v3`), so it is per-browser, and sign-in is demo-grade (salted SHA-256 checked in the browser), so it is **not secure**. The public site and admin share the same browser storage, which is what lets a website enquiry appear in the admin during a demo. Export a backup from Settings before clearing browser data. For production, replace `src/js/store.js` and `src/js/admin/auth.js` with a real API and server-side sessions.

## Structure
```
*.html, admin/*.html      one HTML shell per page (registered in vite.config.js)
src/data/catalog.js       site info, categories, seed products, offers, photo ids
src/js/store.js           shared data layer (products, purchases, sales)
src/js/pages/*            public page renderers
src/js/admin/             app.js (router), shell.js, ui.js (kit), auth.js, login.js, views/*
src/scss/                 tokens -> base -> components -> pages
docs/                     reference mockups
```

## Content notes
- Photos are hot-linked from [Unsplash](https://unsplash.com) (Unsplash License). Swap in your own product photos in `PHOTOS` (`src/data/catalog.js`) for production. Air coolers and water heaters have no photo yet and show an SVG icon tile.
- Brand names are shown as text wordmarks. Add official logos only with the brands' permission.
- Store name, phone, address, prices and reviews are placeholders.
