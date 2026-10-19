<script setup lang="ts">
/**
 * /features/[slug]: one product feature page (Figma: Registration & ticketing).
 *
 * Every feature has the same page: the brand hero with its product screen
 * (FeatureHero), three feature rows that alternate sides (FeatureRow), its
 * questions (FeatureFaq), cards for the other features (FeatureMore) and a
 * demo banner (FeatureCta). The content lives in utils/features.ts - adding
 * a page there adds it here, to the header's Platform menu and to the
 * sitemap. An unknown slug is a 404.
 */
import { findFeature, otherFeatures } from '~/utils/features'

const route = useRoute()
const config = useRuntimeConfig().public

const found = findFeature(String(route.params.slug))
if (!found) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
const page = found

const site = config.siteUrl.replace(/\/+$/, '')

useSeoMeta({
  title: page.seo.title,
  ogTitle: page.seo.title,
  description: page.seo.description,
  ogDescription: page.seo.description,
})

// The questions exactly as the page shows them (Google requires the two to match).
useHead({
  script: [{
    key: 'ld-feature',
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${site}/features/${page.slug}#faq`,
      'mainEntity': page.faqs.map(f => ({
        '@type': 'Question',
        'name': f.q,
        'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
      })),
    }),
  }],
})
</script>

<template>
  <div class="feature">
    <FeatureHero :page="page" />

    <div class="rows">
      <FeatureRow v-for="(r, i) in page.rows" :key="r.id" :row="r" :flip="i % 2 === 1" />
    </div>

    <FeatureFaq :title="`Questions about ${page.name.toLowerCase()}`" :faqs="page.faqs" />
    <FeatureMore :features="otherFeatures(page)" />
    <FeatureCta :title="`See ${page.subject} with your own event`" :text="page.ctaText" />
  </div>
</template>

<style scoped>
.feature {
  color: var(--color-ink, #1f2430);
  background: #fff;
}

.rows {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(64px, 8vw, 120px) clamp(16px, 3vw, 40px) clamp(24px, 4vw, 48px);
  display: grid;
  gap: clamp(72px, 9vw, 130px);
}
</style>
