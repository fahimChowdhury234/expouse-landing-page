<script setup lang="ts">
/**
 * /faq: every question, grouped by topic.
 *
 * A centred header on a soft tinted band with the search box, then two
 * columns: a sticky topic list on the left ("All questions" plus one per
 * topic, each with its count) and the questions on the right, one accordion
 * per topic under its heading (components/faq/FaqAccordion). Below the topics,
 * a "Still have a question?" card goes to the demo page.
 *
 * The search and the topic combine: the counts follow the search, the topic
 * narrows what's shown, and matches are highlighted in the questions and
 * answers (a search opens the first match). On tablets and phones the topics
 * become a row of chips above the questions and the help card moves under
 * them. The homepage FAQ's "See all questions" links here.
 *
 * The questions live in utils/faqs.ts and are published as FAQPage structured
 * data below, so the visible text and the structured data never drift apart.
 */
import { FAQ_GROUPS, filterFaqGroups } from '~/utils/faqs'

const config = useRuntimeConfig().public
const site = config.siteUrl.replace(/\/+$/, '')
const DESCRIPTION = 'Answers about EXPOUSE: setup, check-in and badges, the attendee app, exhibitors and meetings, languages, data security and pricing.'

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

const ALL = 'All questions'
const active = ref(ALL)
const query = ref('')
const term = computed(() => query.value.trim())

/** Every topic with the questions that match the search (all of them with no search). */
const matches = computed(() => filterFaqGroups('All', query.value))
const groups = computed(() => (active.value === ALL ? matches.value : matches.value.filter(g => g.topic === active.value)))

const total = computed(() => matches.value.reduce((n, g) => n + g.items.length, 0))
const TOPICS = computed(() => [
  { topic: ALL, count: total.value },
  ...FAQ_GROUPS.map(g => ({ topic: g.topic, count: matches.value.find(m => m.topic === g.topic)?.items.length ?? 0 })),
])

const slug = (topic: string) => topic.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')

/* Picking a topic far down the page brings the list's top back into view. */
const body = ref<HTMLElement | null>(null)

function pick(topic: string) {
  active.value = topic
  const el = body.value
  if (el && el.getBoundingClientRect().top < 0) {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
  }
}

function reset() {
  active.value = ALL
  query.value = ''
}
</script>

<template>
  <div class="faq">
    <!-- ---------- Header ---------- -->
    <header class="hero">
      <div class="rail hero-in">
        <p class="eyebrow">FAQ</p>
        <h1 class="h1">Frequently asked questions</h1>
        <p class="sub">Answers about setup, check-in, apps, exhibitors, data and pricing. Can't find yours? Our team replies within one business day.</p>
        <BlogSearch v-model="query" label="Search questions" class="search" />
      </div>
    </header>

    <!-- ---------- Topics beside the questions ---------- -->
    <div ref="body" class="rail body">
      <aside class="side">
        <nav class="topics" aria-label="Question topics">
          <button
            v-for="t in TOPICS"
            :key="t.topic"
            type="button"
            class="topic"
            :class="{ on: active === t.topic, none: !t.count }"
            :aria-pressed="active === t.topic"
            @click="pick(t.topic)"
          >
            <span>{{ t.topic }}</span>
            <span class="count">{{ t.count }}</span>
          </button>
        </nav>

        <div class="help">
          <span class="help-tile" aria-hidden="true"><Icon name="lucide:message-circle-question" class="ico" /></span>
          <h2 class="help-title">Still have a question?</h2>
          <p class="help-text">Our team replies within one business day, or book a call and see EXPOUSE on your event.</p>
          <NuxtLink to="/contact-us" class="help-btn">
            Book a demo
            <Icon name="lucide:arrow-right" class="ico" />
          </NuxtLink>
          <a :href="`mailto:${config.contactEmail}`" class="help-mail">{{ config.contactEmail }}</a>
        </div>
      </aside>

      <div class="results">
        <p v-if="term && groups.length" class="found" role="status">
          {{ groups.reduce((n, g) => n + g.items.length, 0) }} {{ groups.reduce((n, g) => n + g.items.length, 0) === 1 ? 'answer' : 'answers' }} for “{{ term }}”
        </p>

        <div v-if="!groups.length" class="empty" role="status">
          <span class="empty-tile" aria-hidden="true"><Icon name="lucide:search-x" class="ico" /></span>
          <p class="empty-title">No questions found</p>
          <p class="empty-text">
            Nothing matches<template v-if="term"> “{{ term }}”</template><template v-if="active !== ALL"> in {{ active }}</template>. Try another word, or ask us directly.
          </p>
          <div class="empty-actions">
            <button type="button" class="empty-reset" @click="reset">Show all questions</button>
            <NuxtLink to="/contact-us" class="empty-ask">Ask our team</NuxtLink>
          </div>
        </div>

        <section
          v-for="(g, gi) in groups"
          :key="g.topic"
          class="group"
          :aria-labelledby="`faq-${slug(g.topic)}`"
        >
          <h2 :id="`faq-${slug(g.topic)}`" class="group-title">{{ g.topic }}</h2>

          <!-- Keyed by the search, so each search starts fresh: its first match open, the rest shut. -->
          <FaqAccordion
            :key="`${g.topic}|${term}`"
            :items="g.items"
            :id-prefix="`faq-${slug(g.topic)}`"
            :initial-open="term && gi === 0 ? 0 : null"
            :highlight="term"
          />
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.faq {
  --faq-brand: var(--color-brand, #6452e7);
  --faq-ink: var(--color-ink, #1f2430);
  --faq-muted: var(--color-muted, #6b7280);
  --faq-line: #eceaf6;
  --faq-tint: #f4f2fd;
  --faq-ease: cubic-bezier(.22, .8, .24, 1);
  color: var(--faq-ink);
  background: #fff;
}

.rail {
  max-width: 1240px;
  margin-inline: auto;
  padding-inline: clamp(16px, 3vw, 40px);
}

/* ---------- Header: centred on a soft band that fades to white ---------- */
.hero {
  background:
    radial-gradient(60% 80% at 50% 0%, rgba(100, 82, 231, .07), transparent 70%),
    linear-gradient(180deg, #f5f3fe, #fff);
  border-top: 1px solid var(--faq-line);
  border-bottom: 1px solid var(--faq-line);
}

.hero-in {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-block: clamp(40px, 5.5vw, 64px) clamp(36px, 4.5vw, 52px);
  text-align: center;
}

.eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--faq-brand);
}

.h1 {
  margin: 10px 0 0;
  font-size: clamp(34px, 4.6vw, 52px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.02em;
  text-wrap: balance;
}

.sub {
  max-width: 38em;
  margin: 16px 0 0;
  font-size: 17.5px;
  line-height: 1.65;
  color: var(--faq-muted);
  text-wrap: balance;
}

.search {
  width: min(100%, 660px);
  margin-top: 28px;
}

/* A bigger box than /blog's, as the header's one control. */
.search :deep(.input) {
  height: 56px;
  font-size: 16px;
  border-color: #e3e1ef;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(20, 23, 40, .04), 0 16px 32px -24px rgba(100, 82, 231, .35);
}

/* ---------- Two columns: sticky topics, then the questions ---------- */
.body {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  align-items: start;
  gap: clamp(32px, 4.5vw, 64px);
  padding-block: clamp(28px, 3.5vw, 44px) clamp(56px, 7vw, 96px);
}

.side {
  position: sticky;
  top: 100px;
  display: grid;
  gap: 24px;
}

.topics {
  display: grid;
  gap: 4px;
}

.topic {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 52px;
  padding: 0 14px 0 18px;
  font: inherit;
  font-size: 16px;
  font-weight: 500;
  text-align: start;
  color: var(--faq-ink);
  background: none;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  transition: color .2s, background-color .2s;
}

.topic:hover {
  color: var(--faq-brand);
  background: #faf9fe;
}

.topic:focus-visible {
  outline: 2px solid var(--faq-brand);
  outline-offset: 2px;
}

.topic.on {
  font-weight: 700;
  color: var(--faq-brand);
  background: var(--faq-tint);
}

/* A topic the search empties stays in the list, dimmed. */
.topic.none:not(.on) {
  color: #a3a8b3;
}

.count {
  flex: none;
  min-width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  padding: 0 7px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--faq-brand);
  background: var(--faq-tint);
  border-radius: 6px;
  font-variant-numeric: tabular-nums;
  transition: color .2s, background-color .2s;
}

.topic.on .count {
  color: #fff;
  background: var(--faq-brand);
}

.topic.none:not(.on) .count {
  color: #a3a8b3;
  background: #f4f5f7;
}

/* ---------- Help card ---------- */
.help {
  position: relative;
  overflow: hidden;
  padding: 24px 22px 22px;
  background: #fff;
  border: 1px solid var(--faq-line);
  border-radius: 14px;
}

/* A soft disc in a ring, behind the top right corner. */
.help::before {
  content: "";
  position: absolute;
  top: -56px;
  right: -56px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: var(--faq-tint);
  box-shadow: 0 0 0 18px #faf9fe;
  pointer-events: none;
}

.help-tile {
  position: relative;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  color: #fff;
  background: var(--faq-brand);
  box-shadow: 0 12px 22px -12px rgba(100, 82, 231, .7);
}

.help-tile .ico {
  width: 20px;
  height: 20px;
}

.help-title {
  position: relative;
  margin: 16px 0 0;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
}

.help-text {
  position: relative;
  margin: 6px 0 0;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--faq-muted);
}

.help-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  margin-top: 18px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  background: var(--faq-brand);
  border-radius: 10px;
  transition: background-color .2s, box-shadow .25s;
}

.help-btn:hover {
  background: var(--color-brand-dark, #4f46e5);
  box-shadow: 0 14px 26px -16px rgba(100, 82, 231, .8);
}

.help-btn:focus-visible {
  outline: 2px solid var(--faq-brand);
  outline-offset: 3px;
}

.help-btn .ico {
  width: 17px;
  height: 17px;
  transition: transform .25s var(--faq-ease);
}

.help-btn:hover .ico {
  transform: translateX(3px);
}

.help-mail {
  display: block;
  margin-top: 12px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: var(--faq-brand);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.help-mail:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ---------- Questions ---------- */
.results {
  display: grid;
  gap: clamp(36px, 4.5vw, 52px);
  min-width: 0;
}

.found {
  margin: 0 0 calc(clamp(36px, 4.5vw, 52px) * -1 + 8px);
  font-size: 15px;
  font-weight: 500;
  color: var(--faq-muted);
}

.group-title {
  margin: 0 0 20px;
  font-size: clamp(22px, 2.2vw, 28px);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -.01em;
}

/* Clear of the sticky header when a topic heading is scrolled to. */
.group {
  scroll-margin-top: 100px;
}

/* ---------- Empty state ---------- */
.empty {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 56px 20px;
  text-align: center;
  background: #fafafe;
  border: 1px dashed #e3e1f1;
  border-radius: 14px;
}

.empty-tile {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  margin-bottom: 6px;
  border-radius: 12px;
  color: var(--faq-brand);
  background: var(--faq-tint);
}

.empty-tile .ico {
  width: 22px;
  height: 22px;
}

.empty-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.empty-text {
  max-width: 440px;
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: var(--faq-muted);
}

.empty-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
}

.empty-reset,
.empty-ask {
  display: inline-flex;
  align-items: center;
  height: 42px;
  padding: 0 18px;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color .2s, border-color .2s, color .2s;
}

.empty-reset {
  color: #fff;
  background: var(--faq-brand);
  border: 0;
}

.empty-reset:hover {
  background: var(--color-brand-dark, #4f46e5);
}

.empty-ask {
  color: var(--faq-ink);
  background: #fff;
  border: 1px solid #e3e5ea;
}

.empty-ask:hover {
  color: var(--faq-brand);
  border-color: color-mix(in srgb, var(--faq-brand) 35%, #fff);
}

.empty-reset:focus-visible,
.empty-ask:focus-visible {
  outline: 2px solid var(--faq-brand);
  outline-offset: 2px;
}

/* Tablets and phones: topics become a row of chips above the questions; the help card follows them. */
@media (max-width: 960px) {
  .body {
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
  }

  .side {
    display: contents;
  }

  .topics {
    order: 0;
    display: flex;
    gap: 8px;
    margin-inline: calc(clamp(16px, 3vw, 40px) * -1);
    padding: 2px clamp(16px, 3vw, 40px) 6px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .topics::-webkit-scrollbar {
    display: none;
  }

  .topic {
    flex: none;
    min-height: 42px;
    padding: 0 8px 0 14px;
    font-size: 14.5px;
    border: 1px solid var(--faq-line);
    border-radius: 999px;
  }

  .topic.on {
    border-color: color-mix(in srgb, var(--faq-brand) 30%, #fff);
  }

  .count {
    min-width: 24px;
    height: 24px;
    border-radius: 999px;
  }

  .results {
    order: 1;
  }

  .help {
    order: 2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .topic,
  .count,
  .help-btn,
  .help-btn .ico,
  .empty-reset,
  .empty-ask {
    transition: none;
  }
}
</style>
