<script setup lang="ts">
/**
 * Site-wide SEO, shared by every page:
 *  - one canonical URL per page (no query string, no trailing slash - the
 *    .htaccess redirects /page/ and /page.html to /page) and og:url to match;
 *  - the share card (og:image, Twitter/X card) - pages set title/description;
 *  - Organization + WebSite structured data.
 */
const config = useRuntimeConfig().public
const route = useRoute()

const site = config.siteUrl.replace(/\/+$/, '')
const canonical = computed(() => site + (route.path === '/' ? '/' : route.path.replace(/\/+$/, '')))

useSeoMeta({
  ogUrl: canonical,
  ogImage: `${site}/og-image.jpg`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'EXPOUSE: big events, no chaos at the door',
  ogLocale: 'en_US',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: canonical }],
  script: [{
    key: 'ld-site',
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${site}/#organization`,
          'name': 'EXPOUSE',
          'url': `${site}/`,
          'logo': { '@type': 'ImageObject', 'url': `${site}/icon-512.png`, 'width': 512, 'height': 512 },
          'email': config.contactEmail,
        },
        {
          '@type': 'WebSite',
          '@id': `${site}/#website`,
          'name': 'EXPOUSE',
          'url': `${site}/`,
          'inLanguage': 'en',
          'publisher': { '@id': `${site}/#organization` },
        },
      ],
    }),
  }],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
