/**
 * /sitemap.xml - every public page, for search engines (robots.txt points
 * here). Pre-rendered by `nuxt generate` (nuxt.config nitro.prerender.routes),
 * so it ships as a plain file. Add a page here when you add one under
 * app/pages. URLs match each page's canonical: no trailing slash.
 * Newsroom stories come from app/utils/news.ts, blog articles from app/utils/blog.ts,
 * feature pages from app/utils/features.ts.
 */
import { BLOG_POSTS } from '../../app/utils/blog'
import { FEATURE_PAGES } from '../../app/utils/features'
import { ALL_POSTS } from '../../app/utils/news'

const PAGES = [
  '/', '/contact-us', '/faq', '/gallery',
  ...FEATURE_PAGES.map(f => `/features/${f.slug}`),
  '/news', ...ALL_POSTS.map(p => `/news/${p.slug}`),
  '/blog', ...BLOG_POSTS.map(p => `/blog/${p.slug}`),
]

export default defineEventHandler((event) => {
  const site = String(useRuntimeConfig(event).public.siteUrl).replace(/\/+$/, '')
  // The build date: every deploy is a fresh build of every page.
  const lastmod = new Date().toISOString().slice(0, 10)

  const urls = PAGES.map(path => `  <url>\n    <loc>${site}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
})
