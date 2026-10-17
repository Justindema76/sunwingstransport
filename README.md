# Sunwings Transport: Website Rebuild

A custom **Next.js** rebuild of the website for **Sunwings Transport**, a moving, delivery and junk removal company serving Toronto, the GTA, Hamilton and Niagara. It's client work; the current live site is on WordPress.

The new site is fast and SEO-focused, and it's built so the client can manage it themselves, **without WordPress**. All content is managed from my **[Website Admin](https://github.com/Justindema76/JustConsignIn-Website-Admin)**, where Sunwings has its own section and its own team logins.

---

## What the site does

- **Service pages** (`/services/[slug]`): residential moving, commercial transport, furniture delivery, packing and protection, warehouse / container unloading, junk removal
- **Location pages** (`/locations/[slug]`): one page per service area (Toronto, Scarborough, North York, Etobicoke, Mississauga, Brampton, Vaughan, Markham, Richmond Hill, Oakville, Burlington, Milton, Hamilton, Stoney Creek and more), each linking to the services offered there
- **Quote requests:** a quote form (on its own and as a slide-out drawer) plus a contact form. Submissions go to the admin's Quote Requests inbox.
- **Blog, pricing, contact and privacy** pages
- **Homepage built from blocks:** hero, trust strip, service cards, how it works, service-area grid, reviews and blog cards
- **Global header, footer, logo, phone number, favicon and fonts** all come from the admin's settings, so one change updates the whole site
- **Google Analytics 4 and Meta Pixel** tracking, with the IDs set from the admin
- **SEO:** per-post SEO title, description and Open Graph image; breadcrumb schema; generated `sitemap.xml`, `robots.txt` and web manifest

## Content model

| Content | URL | Managed in the admin as |
|---|---|---|
| Services | `/services/[slug]` | **Service Posts**: SEO, hero, body, FAQs, bullet points, and a "where we offer this" locations checklist |
| Locations | `/locations/[slug]` | **Location Posts**: area details and related services |
| Home, services list, locations list | `/`, `/services`, `/locations` | Generated from the published posts |
| Site settings | (every page) | Header, footer, phone, logo, Global Styles |

Drafts never appear on the public site. If Supabase isn't configured, the site falls back to built-in seed content (`lib/seed.js`), so the front end can be reviewed straight away.

## Tech stack

- **Next.js 15** (App Router), React 19, Lucide icons
- **Supabase:** reads published content with the publishable key; quote submissions are inserted through row-level security
- **Vercel:** hosting
- **GitHub Actions:** build check on every push

## Project structure

```text
app/
├── page.js                     Homepage
├── services/, locations/       Listing + [slug] pages
├── blog/, pricing/, contact/, privacy/
├── api/quote/route.js          Quote / contact form submissions
├── api/content/                Services, locations and site settings
├── sitemap.js, robots.js, manifest.js
components/                     Header, Footer, HomeHero, ServiceCards, LocationCards, QuoteForm, ReviewsBlock, ...
lib/content.js                  Reads published content from Supabase
lib/seed.js                     Built-in fallback content
supabase/migrations/            Tables and security policies (apply to the shared Website Admin project)
```

## Run locally

```bash
npm install
cp .env.example .env.local      # SUPABASE_URL, SUPABASE_ANON_KEY, SITE_URL
npm run dev                     # http://localhost:3000
```

## Deploy (Vercel)

Set `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SITE_URL` in the Vercel project's environment variables, then apply the migrations in `supabase/migrations/` to the same Supabase project the Website Admin uses.

---

**Developer:** Justin DeMatteis ([justindematteis.com](https://www.justindematteis.com))
