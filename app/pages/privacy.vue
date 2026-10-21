<script setup lang="ts">
type Section = { title: string; text: string[]; list?: string[] }

const config = useRuntimeConfig().public
const UPDATED = '20 October 2026'
const SECTIONS: Section[] = [
  { title: 'Who we are', text: ['EXPOUSE provides event software for registration, check-in, badges, mobile apps, meetings and analytics. For attendee data collected for an event, the event organizer is the data controller and EXPOUSE processes the data on their behalf.'] },
  { title: 'Information we collect', text: ['We collect only what is needed to run the event and the platform:'], list: ['Registration details such as name, email, phone, company and job title', 'Badge and check-in records, including scan times and access zones', 'App activity such as saved sessions, meetings, chat and lead scans', 'Technical data such as device type, browser and log files'] },
  { title: 'How we use information', text: ['Information is used to deliver the services the organizer has set up:'], list: ['Creating badges, app accounts and event communications', 'Checking attendees in and controlling access to halls and sessions', 'Enabling networking, meetings and exhibitor lead capture', 'Producing reports and improving the platform'] },
  { title: 'Sharing information', text: ['We do not sell personal information. Data is shared with the event organizer, with exhibitors only when an attendee allows their badge to be scanned or accepts a meeting, and with service providers who help us host and operate the platform under written agreements.'] },
  { title: 'Data storage & security', text: ['Data is stored on secure cloud infrastructure with encryption in transit and at rest. Access is limited by role, and every event’s data is kept separate from other events.'] },
  { title: 'Retention', text: ['We keep event data for as long as the organizer’s agreement requires, and then delete or anonymise it. Organizers can export or delete their data at any time.'] },
  { title: 'Your rights', text: ['Depending on where you live, you may have the right to:'], list: ['Access the personal information we hold about you', 'Ask us to correct or delete it', 'Object to or restrict certain processing', 'Withdraw consent for marketing at any time'] },
  { title: 'Cookies', text: ['We use essential cookies to keep you signed in and remember your language. Optional analytics cookies are used only with your consent.'] },
  { title: 'Changes to this policy', text: ['We may update this policy from time to time. When we make significant changes, we will update the date at the top of this page and notify organizers.'] },
]

const slug = (title: string) => title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const sections = SECTIONS.map((section, index) => ({ ...section, id: slug(section.title), number: String(index + 1).padStart(2, '0') }))

useSeoMeta({
  title: 'Privacy policy | EXPOUSE',
  ogTitle: 'Privacy policy | EXPOUSE',
  description: 'How EXPOUSE collects, uses and protects personal information when organizers, exhibitors and attendees use our platform.',
  ogDescription: 'How EXPOUSE collects, uses and protects personal information when organizers, exhibitors and attendees use our platform.',
})
</script>

<template>
  <div class="privacy">
    <header class="legal-hero">
      <i class="orb" aria-hidden="true" />
      <div class="hero-rail">
        <nav class="crumb" aria-label="Breadcrumb"><NuxtLink to="/">Home</NuxtLink><span>/</span><span>Legal</span></nav>
        <h1>Privacy policy</h1>
        <p>How EXPOUSE collects, uses and protects personal information when organizers, exhibitors and attendees use our platform.</p>
        <div class="meta"><span>Last updated {{ UPDATED }}</span><NuxtLink to="/terms">Terms &amp; conditions <Icon name="lucide:arrow-right" /></NuxtLink></div>
      </div>
    </header>

    <div class="legal-rail">
      <aside class="toc"><b>ON THIS PAGE</b><a v-for="section in sections" :key="section.id" :href="`#${section.id}`"><span>{{ section.number }}</span>{{ section.title }}</a></aside>
      <main class="content">
        <section v-for="section in sections" :id="section.id" :key="section.id">
          <h2><span>{{ section.number }}</span>{{ section.title }}</h2>
          <p v-for="paragraph in section.text" :key="paragraph">{{ paragraph }}</p>
          <ul v-if="section.list"><li v-for="item in section.list" :key="item">{{ item }}</li></ul>
        </section>
        <div class="contact-card"><i aria-hidden="true" /><div><b>Questions about this document?</b><span>Our team replies within one business day.</span></div><a :href="`mailto:${config.contactEmail}`">{{ config.contactEmail }}</a></div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.privacy { background: #fff; color: var(--color-ink, #1f2430); }
.legal-hero { position: relative; overflow: hidden; background: linear-gradient(135deg, #7564ec, #6452e7 45%, #4e3dd8); color: #fff; }
.orb { position: absolute; right: -140px; top: -200px; width: 420px; height: 420px; border-radius: 50%; background: rgb(255 255 255 / .08); box-shadow: 0 0 0 48px rgb(255 255 255 / .035); }
.hero-rail, .legal-rail { width: 100%; max-width: 1240px; margin-inline: auto; padding-inline: clamp(12px, 3vw, 40px); }
.hero-rail { position: relative; display: flex; flex-direction: column; gap: 14px; padding-top: 64px; padding-bottom: 56px; }
.crumb { display: flex; gap: 8px; align-items: center; font-size: 14.5px; font-weight: 600; }.crumb a { color: #fff; opacity: .85; text-decoration: none; }.crumb a:hover { opacity: 1; }.crumb span:nth-child(2) { opacity: .6; }
h1 { margin: 0; font-size: clamp(34px, 4.6vw, 54px); line-height: 1.1; letter-spacing: -.02em; font-weight: 800; }.hero-rail > p { max-width: 60ch; margin: 0; font-size: 17.5px; line-height: 1.6; opacity: .9; }
.meta { display: flex; align-items: center; flex-wrap: wrap; gap: 10px 18px; margin-top: 6px; font-size: 14px; font-weight: 600; }.meta a { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid rgb(255 255 255 / .5); border-radius: 6px; color: #fff; text-decoration: none; font-weight: 700; }.meta a:hover { border-color: #fff; }.meta :deep(svg) { width: 14px; height: 14px; }
.legal-rail { display: grid; grid-template-columns: 260px minmax(0, 1fr); align-items: start; gap: 48px; padding-top: 56px; padding-bottom: 88px; }
.toc { position: sticky; top: 96px; display: flex; flex-direction: column; gap: 2px; max-width: 260px; padding: 16px; border: 1px solid #e6e5f2; border-radius: 12px; background: #fff; }.toc b { padding: 4px 10px 8px; color: var(--color-brand, #6452e7); font-size: 12px; letter-spacing: .12em; }.toc a { display: flex; gap: 10px; padding: 8px 10px; border-radius: 8px; color: inherit; font-size: 14.5px; font-weight: 600; line-height: 1.35; text-decoration: none; }.toc a span { min-width: 20px; color: var(--color-brand, #6452e7); }.toc a:hover { color: var(--color-brand, #6452e7); background: rgb(100 82 231 / .07); }
.content { display: flex; flex-direction: column; gap: 40px; max-width: 760px; }.content section { display: flex; flex-direction: column; gap: 12px; padding-bottom: 40px; border-bottom: 1px solid #e6e5f2; scroll-margin-top: 96px; }.content h2 { display: flex; align-items: baseline; gap: 12px; margin: 0; font-size: 24px; line-height: 1.3; font-weight: 800; }.content h2 span { color: var(--color-brand, #6452e7); }.content p { margin: 0; color: #64676a; font-size: 16.5px; line-height: 1.75; }.content ul { display: flex; flex-direction: column; gap: 10px; margin: 0; padding: 0; list-style: none; }.content li { display: flex; gap: 12px; color: #212529; font-size: 16px; line-height: 1.65; }.content li::before { width: 6px; height: 6px; flex: none; margin-top: .67em; border-radius: 50%; background: var(--color-brand, #6452e7); content: ''; }
.contact-card { position: relative; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; overflow: hidden; padding: 28px; border: 1px solid #e6e5f2; border-radius: 12px; background: rgb(100 82 231 / .07); }.contact-card > i { position: absolute; top: -70px; right: -60px; width: 160px; height: 160px; border-radius: 50%; background: rgb(100 82 231 / .07); }.contact-card div, .contact-card a { position: relative; }.contact-card div { display: grid; gap: 4px; }.contact-card b { font-size: 18px; }.contact-card span { color: #64676a; font-size: 15px; }.contact-card a { padding: 12px 20px; border-radius: 8px; background: var(--color-brand, #6452e7); color: #fff; font-size: 15px; font-weight: 700; text-decoration: none; }.contact-card a:hover { background: var(--color-brand-dark, #4f46e5); }
@media (max-width: 900px) { .legal-rail { grid-template-columns: 1fr; gap: 28px; }.toc { position: static; max-width: none; }.toc a { display: none; } }
@media (max-width: 540px) { .hero-rail { padding-top: 46px; padding-bottom: 44px; }.legal-rail { padding-top: 36px; padding-bottom: 60px; }.content { gap: 28px; }.content section { padding-bottom: 28px; }.content h2 { font-size: 21px; }.content p, .content li { font-size: 15px; }.contact-card { padding: 22px; } }
</style>
