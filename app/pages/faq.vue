<script setup lang="ts">
/**
 * /faq: every question, grouped by topic.
 *
 * Laid out like /blog: a header with the search box, topic tabs (NewsFilters),
 * then the questions, one accordion per topic (components/faq/FaqAccordion),
 * with a sticky "Still have a question?" card beside them that goes to the
 * demo page. The tab and search combine; both narrow the same list. The
 * homepage FAQ's "See all questions" links here.
 *
 * The questions live in utils/faqs.ts and are published as FAQPage structured
 * data below, so the visible text and the structured data never drift apart.
 */
import { FAQ_GROUPS, filterFaqGroups } from '~/utils/faqs'

const config = useRuntimeConfig().public
const site = config.siteUrl.replace(/\/+$/, '')
const DESCRIPTION = 'Answers about EXPOUSE: launching an event, registration and tickets, badges and check-in, exhibitors, the attendee app, languages, security and pricing.'

useSeoMeta({
  title: 'FAQ | EXPOUSE',
  ogTitle: 'FAQ | EXPOUSE',
  description: DESCRIPTION,
  ogDescription: DESCRIPTION,
})

useHead({
  script: [{
    key: 'ld-faq',
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${site}/faq#faq`,
      'mainEntity': FAQ_GROUPS.flatMap(g => g.items).map(f => ({
        '@type': 'Question',
        'name': f.q,
        'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
      })),
    }),
  }],
})

const TOPICS = FAQ_GROUPS.map(g => g.topic)
const TOTAL = FAQ_GROUPS.reduce((n, g) => n + g.items.length, 0)

const active = ref<string>('All')
const query = ref('')

const groups = computed(() => filterFaqGroups(active.value, query.value))

const slug = (topic: string) => topic.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')

function reset() {
  active.value = 'All'
  query.value = ''
}
</script>

<template>
  <div class="faq">
    <div class="rail">
      <header class="hero">
        <div class="intro">
          <p class="eyebrow">FAQ</p>
          <h1 class="h1">Questions, answered</h1>
          <p class="sub">{{ TOTAL }} answers about running your event on EXPOUSE, from the first registration to the final report.</p>
        </div>

        <BlogSearch v-model="query" label="Search questions" class="search" />
      </header>

      <NewsFilters v-model="active" :categories="TOPICS" label="Filter questions by topic" class="filters" />

      <div class="body">
        <div class="results">
          <div v-if="!groups.length" class="empty" role="status">
            <p class="empty-title">No questions found</p>
            <p class="empty-text">
              Nothing matches<template v-if="query.trim()"> “{{ query.trim() }}”</template><template v-if="active !== 'All'"> in {{ active }}</template>.
            </p>
            <button type="button" class="empty-reset" @click="reset">Show all questions</button>
          </div>

          <section
            v-for="(g, gi) in groups"
            :key="g.topic"
            class="group"
            :aria-labelledby="`faq-${slug(g.topic)}`"
          >
            <header class="group-head">
              <span class="gtile" aria-hidden="true"><Icon :name="g.icon" class="ico" /></span>
              <h2 :id="`faq-${slug(g.topic)}`" class="group-title">{{ g.topic }}</h2>
              <span class="count">{{ g.items.length }} {{ g.items.length === 1 ? 'question' : 'questions' }}</span>
            </header>

            <!-- Keyed by the search, so a new search starts with the answers shut (bar the first). -->
            <FaqAccordion
              :key="`${g.topic}|${query.trim()}`"
              :items="g.items"
              :id-prefix="`faq-${slug(g.topic)}`"
              :initial-open="gi === 0 ? 0 : null"
            />
          </section>
        </div>

        <aside class="side" aria-labelledby="faq-help">
          <div class="help">
            <i class="glow" aria-hidden="true" />
            <span class="help-tile" aria-hidden="true"><Icon name="lucide:message-circle-question" class="ico" /></span>
            <h2 id="faq-help" class="help-title">Still have a question?</h2>
            <p class="help-text">Book a 30-minute call and we'll answer it, and show you how your event would run on EXPOUSE.</p>
            <NuxtLink to="/contact-us" class="help-btn">
              Book a demo
              <Icon name="lucide:arrow-right" class="ico" />
            </NuxtLink>
            <p class="help-mail">Or email <a :href="`mailto:${config.contactEmail}`">{{ config.contactEmail }}</a></p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.faq {
  --faq-brand: var(--color-brand, #6452e7);
  --faq-ink: var(--color-ink, #1f2430);
  --faq-muted: var(--color-muted, #6b7280);
  --faq-tint: #f4f2fd;
  padding-block: clamp(28px, 4vw, 44px) clamp(56px, 7vw, 88px);
  background: #fff;
}

.rail {
  max-width: 1240px;
  margin-inline: auto;
  padding-inline: clamp(16px, 3vw, 40px);
}

/* ---------- Header (same as /blog) ---------- */
.hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px 48px;
}

.intro {
  min-width: 0;
}

.eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--faq-brand);
}

.h1 {
  max-width: 13em;
  margin: 8px 0 0;
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.01em;
  color: var(--faq-ink);
}

.sub {
  margin: 14px 0 0;
  max-width: 60ch;
  font-size: 18px;
  line-height: 1.6;
  color: var(--faq-muted);
}

.search {
  flex: 0 1 340px;
}

.filters {
  margin-top: clamp(24px, 3vw, 32px);
}

/* ---------- Questions beside the help card ---------- */
.body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  align-items: start;
  gap: 48px;
  margin-top: 36px;
}

.results {
  display: grid;
  gap: clamp(36px, 4.5vw, 52px);
  min-width: 0;
}

.group-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.gtile {
  flex: none;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: var(--faq-brand);
  background: var(--faq-tint);
}

.gtile .ico {
  width: 19px;
  height: 19px;
}

.group-title {
  margin: 0;
  font-size: clamp(20px, 2vw, 24px);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -.01em;
  color: var(--faq-ink);
}

.count {
  margin-left: auto;
  font-size: 14px;
  font-weight: 500;
  color: var(--faq-muted);
  white-space: nowrap;
}

/* ---------- Empty state (same as /blog) ---------- */
.empty {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 64px 16px;
  text-align: center;
  background: #f9f9fc;
  border: 1px dashed #e3e1f1;
  border-radius: 12px;
}

.empty-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--faq-ink);
}

.empty-text {
  margin: 0;
  font-size: 16px;
  color: var(--faq-muted);
}

.empty-reset {
  margin-top: 10px;
  height: 42px;
  padding: 0 18px;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: var(--faq-brand);
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color .2s;
}

.empty-reset:hover {
  background: var(--color-brand-dark, #4f46e5);
}

.empty-reset:focus-visible {
  outline: 2px solid var(--faq-brand);
  outline-offset: 2px;
}

/* ---------- Help card: brand panel, sticky beside the questions ---------- */
.side {
  position: sticky;
  top: 104px;
}

.help {
  position: relative;
  overflow: hidden;
  padding: 30px 28px 28px;
  color: #fff;
  background: var(--faq-brand);
  border-radius: 16px;
  box-shadow: 0 30px 60px -36px rgba(100, 82, 231, .8);
}

/* A soft light in the corner and a ring, so the panel isn't flat. */
.glow {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .14);
  box-shadow: 0 0 0 28px rgba(255, 255, 255, .06);
  pointer-events: none;
}

.help-tile {
  position: relative;
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, .16);
}

.help-tile .ico {
  width: 23px;
  height: 23px;
}

.help-title {
  position: relative;
  margin: 20px 0 0;
  font-size: 23px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -.01em;
}

.help-text {
  position: relative;
  margin: 10px 0 0;
  font-size: 15.5px;
  line-height: 1.6;
  color: rgba(255, 255, 255, .85);
}

.help-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 48px;
  margin-top: 22px;
  font-size: 15.5px;
  font-weight: 700;
  color: var(--faq-brand);
  text-decoration: none;
  background: #fff;
  border-radius: 10px;
  transition: box-shadow .25s, transform .25s cubic-bezier(.22, .8, .24, 1);
}

.help-btn:hover {
  box-shadow: 0 14px 28px -14px rgba(20, 16, 70, .55);
  transform: translateY(-1px);
}

.help-btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

.help-btn .ico {
  width: 18px;
  height: 18px;
}

.help-mail {
  position: relative;
  margin: 16px 0 0;
  font-size: 14px;
  text-align: center;
  color: rgba(255, 255, 255, .8);
}

.help-mail a {
  color: #fff;
  font-weight: 600;
  text-underline-offset: 3px;
}

/* Tablets and phones: the header stacks; the help card follows the questions. */
@media (max-width: 960px) {
  .body {
    grid-template-columns: minmax(0, 1fr);
  }

  .side {
    position: static;
  }
}

@media (max-width: 860px) {
  .hero {
    flex-direction: column;
    align-items: stretch;
  }

  .search {
    flex: none;
  }
}

@media (max-width: 480px) {
  .count {
    display: none;
  }

  .help {
    padding: 26px 20px 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .help-btn,
  .empty-reset {
    transition: none;
  }
}
</style>
