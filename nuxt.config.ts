import tailwindcss from '@tailwindcss/vite'

/**
 * expouse.com - the public marketing website for EXPOUSE.
 *
 * A separate app from the organizer console (eventos-admin) and the attendee
 * event app (eventos-event): no login, no API calls needed to render a page,
 * so it can be pre-rendered (`npm run generate`) and served as static files.
 * Design notes: docs/website-landing-page.md.
 */
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  modules: ['@nuxt/icon'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    public: {
      /** Canonical site origin, for links and meta tags. */
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://expouse.com',
      /** Where "Sign in" goes - the organizer console. */
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'https://dashboard.expouse.com',
      contactEmail: process.env.NUXT_PUBLIC_CONTACT_EMAIL || 'hello@expouse.com',
      /** Media contact shown on /news. */
      pressEmail: process.env.NUXT_PUBLIC_PRESS_EMAIL || 'press@expouse.com',
      /**
       * Where the demo form (/contact-us) POSTs its JSON. Empty: the site stays
       * fully static and the form opens an email to contactEmail instead.
       */
      contactEndpoint: process.env.NUXT_PUBLIC_CONTACT_ENDPOINT || '',
      /** Where /news's "Get news by email" form POSTs the address. Empty: it just confirms locally. */
      newsletterEndpoint: process.env.NUXT_PUBLIC_NEWSLETTER_ENDPOINT || '',
      /**
       * Footer destinations without a page on this site yet. Each one shows as
       * designed and links to "#" until its env var is set - fill them all
       * before launch. The privacy policy is also linked from the demo form
       * (plain text there while empty).
       */
      privacyUrl: process.env.NUXT_PUBLIC_PRIVACY_URL || '',
      termsUrl: process.env.NUXT_PUBLIC_TERMS_URL || '',
      aboutUrl: process.env.NUXT_PUBLIC_ABOUT_URL || '',
      /** The Arabic version of the site, for the footer's language switch. */
      arabicUrl: process.env.NUXT_PUBLIC_ARABIC_URL || '',
      stores: {
        appStore: process.env.NUXT_PUBLIC_STORES_APP_STORE || 'https://apps.apple.com/us/app/urban-october/id6806837918',
        googlePlay: process.env.NUXT_PUBLIC_STORES_GOOGLE_PLAY || 'https://play.google.com/store/apps/details?id=com.urbanoctober.com',
      },
      social: {
        linkedin: process.env.NUXT_PUBLIC_SOCIAL_LINKEDIN || '',
        x: process.env.NUXT_PUBLIC_SOCIAL_X || '',
        instagram: process.env.NUXT_PUBLIC_SOCIAL_INSTAGRAM || '',
      },
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      // Fallbacks only - every page sets its own title and description (pages/*.vue);
      // app.vue adds the canonical URL, share card and structured data.
      title: 'EXPOUSE | Event management software',
      meta: [
        { name: 'description', content: 'Event software for exhibitions and conferences: registration, badges, check-in, exhibitor leads and an attendee app.' },
        { name: 'theme-color', content: '#6452E7' },
        { property: 'og:site_name', content: 'EXPOUSE' },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        // Cairo is self-hosted (assets/css/main.css); fetch the Latin file with the HTML, not after the CSS.
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/cairo-latin.woff2', crossorigin: '' },
      ],
    },
  },

  icon: {
    // Icons ship inside the bundle - no runtime calls to the Iconify API.
    serverBundle: 'local',
    clientBundle: { scan: true },
  },

  experimental: {
    // No page loads data, so there is nothing to put in a _payload.json - and
    // without it a page is one file (contact-us.html), not a folder.
    payloadExtraction: false,
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/contact-us', '/news', '/blog', '/gallery', '/sitemap.xml', '/robots.txt'],
      // /contact-us -> contact-us.html (not contact-us/index.html), so the URL
      // needs no trailing slash; .htaccess maps the clean URL to the file.
      autoSubfolderIndex: false,
    },
  },
})
