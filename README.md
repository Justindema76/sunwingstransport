# Sunwings Transport

Custom Next.js rebuild of Sunwings Transport. The site is designed to be managed from the existing Just Innovate Admin using post-style **Services** and **Locations** content.

## Local development

```bash
git clone https://github.com/Justindema76/sunwingstransport.git
cd sunwingstransport
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

The site runs with built-in seed content if Supabase is not configured, so the frontend can be reviewed immediately.

## Content model

- Services are posts: `/services/[slug]`
- Locations are posts: `/locations/[slug]`
- Home, service listing and location listing pages are generated from published content
- SEO title, description, OG image, hero content, body, FAQs/bullets and related service/location data are stored with each post
- Draft records never appear on the public site

## Backend

The public site reads published records from Supabase using the publishable key. Quote submissions are sent to the site's own API route and inserted through Supabase RLS.

Apply:

```
supabase/migrations/20261002_sunwings_content.sql
```

to the same Supabase project used by Just Innovate Admin.

## Vercel

This repository is Vercel-ready. Set:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SITE_URL`

in the Vercel project environment.

No WordPress is used.
