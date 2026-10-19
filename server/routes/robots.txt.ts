/**
 * /robots.txt - lets every crawler in and names the sitemap. Pre-rendered like
 * sitemap.xml, so the sitemap URL follows NUXT_PUBLIC_SITE_URL.
 */
export default defineEventHandler((event) => {
  const site = String(useRuntimeConfig(event).public.siteUrl).replace(/\/+$/, '')

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`
})
