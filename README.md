# EXPOUSE website (expouse.com)

The public marketing website. Nuxt 4 + Tailwind CSS 4, same stack and brand as the other EXPOUSE apps. It has no login and calls no API, so it can be pre-rendered and served as static files.

Design and content notes: [docs/website-landing-page.md](../docs/website-landing-page.md). The full page design lives in [docs/assets/expouse-landing.html](../docs/assets/expouse-landing.html).

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

## Build

```bash
npm run generate     # static site in .output/public - upload to any static host / CDN
npm run build        # or a Node server in .output/server
```

## Settings

| Variable | Default | Used for |
|---|---|---|
| `NUXT_PUBLIC_SITE_URL` | `https://expouse.com` | Canonical links and meta tags |
| `NUXT_PUBLIC_APP_URL` | `https://dashboard.expouse.com` | "Sign in" button (organizer console) |
| `NUXT_PUBLIC_CONTACT_EMAIL` | `hello@expouse.com` | Demo and contact links |

## Layout

```
app/
  app.vue              layout + page
  layouts/default.vue  header (nav, Sign in, Book a demo), footer
  pages/index.vue      homepage
  components/          AppLogo + page sections
  assets/css/main.css  Tailwind + brand tokens (indigo #6452E7 , Cairo)
public/                favicon, robots.txt
```

## Maintenance mode

While `public/.maintenance` exists, expouse.com shows `public/maintenance.html` to the public (HTTP 503, so search engines wait rather than drop the site). Only expouse.com is affected; the rules live in `public/.htaccess`.

- **Publish the site:** delete `public/.maintenance` and push to `production`.
- **Turn maintenance back on:** add the file again and push.
- **Team preview while it is on:** open `https://expouse.com/?preview=<token>` once (token in the "Maintenance mode" block of `public/.htaccess`). That browser sees the real site for 7 days; `/?preview=off` ends it.
