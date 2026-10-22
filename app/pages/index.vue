<script setup lang="ts">
/**
 * Homepage. Starter content only - the full page (sections 2-15 of
 * docs/website-landing-page.md, designed in docs/assets/expouse-landing.html)
 * is built here next, one section component at a time.
 */
const config = useRuntimeConfig().public

const site = config.siteUrl.replace(/\/+$/, '')
const DESCRIPTION = 'Event software for exhibitions and conferences: online registration, badge printing, QR check-in, exhibitor leads and an attendee app, in English and Arabic.'

// The search title leads with what people search for; the share card keeps the tagline.
useSeoMeta({
  title: 'Event Registration, Badge Printing & Check-in Software | EXPOUSE',
  ogTitle: 'Big events. No chaos at the door. | EXPOUSE',
  description: DESCRIPTION,
  ogDescription: DESCRIPTION,
})

// Structured data: the product, and the FAQ exactly as the page shows it.
useHead({
  script: [{
    key: 'ld-home',
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SoftwareApplication',
          '@id': `${site}/#software`,
          'name': 'EXPOUSE',
          'url': `${site}/`,
          'description': DESCRIPTION,
          'applicationCategory': 'BusinessApplication',
          'operatingSystem': 'Web, iOS, Android',
          'image': `${site}/og-image.jpg`,
          'featureList': [
            'Online event registration',
            'Badge design and printing',
            'QR code check-in, online and offline',
            'Exhibitor lead capture',
            'Attendee networking and chat',
            'Event analytics and reports',
            'English and Arabic',
          ],
          'publisher': { '@id': `${site}/#organization` },
        },
        {
          '@type': 'FAQPage',
          '@id': `${site}/#faq`,
          'mainEntity': FAQS.map(f => ({
            '@type': 'Question',
            'name': f.q,
            'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
          })),
        },
      ],
    }),
  }],
})

const HIGHLIGHTS = [
  { icon: 'lucide:clipboard-list', title: 'Registration', text: 'Forms, tickets and imports for every kind of guest.' },
  { icon: 'lucide:printer', title: 'Badge printing', text: 'Design badges and print them at the desk, kiosk or gate.' },
  { icon: 'lucide:scan-line', title: 'Check-in', text: 'Fast QR scanning at every gate, even offline.' },
  { icon: 'lucide:store', title: 'Exhibitors', text: 'Booths, lead capture and reports for every exhibitor.' },
]
</script>

<template>
  <HeroSection />
  <HeroStage />
  <StatsBar />
  <ExhibitorLogos />
  <PlatformAudiences />
  <FeatureSlider />
  <FeatureSpotlights />
  <BadgeDesigner />
  <FloorDesigner />
  <MobileApps />
  <BrandedApp />
  <RegionSecurity />
  <TestimonialsSection />
  <!-- Media gallery is hidden for now; the blog takes its place. -->
  <!-- <MediaGallery /> -->
  <BlogHighlights />
  <PricingPlans />
  <DemoCta />
  <FaqSection />

  <!-- <section id="demo" class="bg-brand">
    <div class="container-x py-14 text-center text-white">
      <h2 class="m-0 text-2xl font-extrabold sm:text-3xl">See EXPOUSE on your next event</h2>
      <p class="mx-auto mt-3 max-w-xl text-white/80">Tell us about your event and we will show you around.</p>
      <a :href="`mailto:${config.contactEmail}?subject=EXPOUSE demo`" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand no-underline">
        <Icon name="lucide:mail" class="w-4 h-4" />
        {{ config.contactEmail }}
      </a>
    </div>
  </section> -->
</template>
