<script setup lang="ts">
/**
 * 11 · Testimonials.
 *
 * One customer story at a time on a large card: stars, the quote and who said
 * it on the left; on the right a brand panel with the result they got and the
 * event it was at. Under the card, a row of people (tabs) to switch stories,
 * with previous / next arrows.
 *
 * While the card is on screen the stories advance on their own: the active
 * tab's bar fills and, when it's full, the next story comes in. Hovering or
 * focusing the card pauses the bar exactly where it is. With reduced motion or
 * without JS nothing advances and the first story is shown.
 *
 * The first story is the approved Urban October testimonial. The remaining
 * sample stories should be replaced with approved customer testimonials before launch.
 */
import { initials } from '~/utils/news'

type Story = {
  name: string
  role: string
  company: string
  side: 'Organizer' | 'Exhibitor' | 'Partner'
  quote: string
  result: { value: string, label: string }
  event: { name: string, initial: string, color: string }
  /** Avatar gradient. */
  tone: [string, string]
}

const LOGISTICS = { name: 'Gulf Logistics Expo 2026', initial: 'L', color: '#0f766e' }
const BUILD = { name: 'Muscat Build Week 2026', initial: 'M', color: '#be123c' }
const FOOD = { name: 'Oman Food Festival 2027', initial: 'F', color: '#c2410c' }
const URBAN_OCTOBER = { name: 'Urban October', initial: 'U', color: '#6452e7' }

const STORIES: Story[] = [
  {
    name: 'Paul Kallee-Grover MBE',
    role: 'Founder and Managing Director',
    company: 'Ki Partnerships Ltd',
    side: 'Partner',
    quote: 'EXPOUSE delivered a intuitive app that made Urban October easier to engage with at every stage. Before travelling, I could explore the programme and tailor the app to my interests from Moldova. In Oman, it gave me a clear, reliable source of up-to-date information throughout the event; afterwards, I could continue using it from the UK to follow up actions. The experience felt seamless, with everything easy to find and simple to manage. Most valuable was the way personalising my programme helped me focus on the people and discussions most relevant to my work, creating opportunities for more meaningful conversations. It is an excellent example of how well-designed technology can strengthen an event experience from preparation through to follow-up.',
    result: { value: '3 countries', label: 'one connected experience before, during and after the event' },
    event: URBAN_OCTOBER,
    tone: ['#8b7cf6', '#6452e7'],
  },
  {
    name: 'Hassan Qureshi',
    role: 'Head of Sales',
    company: 'Northbay Freight',
    side: 'Exhibitor',
    quote: 'Our booth team scanned every visitor, rated the lead and added notes on the spot. By the evening the show closed, sales had a scored list ready to call.',
    result: { value: '640', label: 'leads scanned and scored in three days' },
    event: LOGISTICS,
    tone: ['#2dd4bf', '#0f766e'],
  },
  {
    name: 'Layla Mansour',
    role: 'Operations Lead',
    company: 'Bayt Events',
    side: 'Organizer',
    quote: 'We ran the whole show in Arabic and English. The website, the emails and every printed badge switched properly, right to left included, without a second set of files.',
    result: { value: '12,000', label: 'badges printed on site, in two languages' },
    event: BUILD,
    tone: ['#fb7185', '#be123c'],
  },
  {
    name: 'Daniel Okoro',
    role: 'Programme Manager',
    company: 'Saffron Events',
    side: 'Organizer',
    quote: 'We changed the agenda twice on day one. Attendees saw every update in the app within seconds, and nobody queued at the info desk asking where to go.',
    result: { value: '45', label: 'sessions updated live, with nothing reprinted' },
    event: FOOD,
    tone: ['#fdba74', '#c2410c'],
  },
  {
    name: 'Aisha Karim',
    role: 'Marketing Manager',
    company: 'Coastline Interiors',
    side: 'Exhibitor',
    quote: 'Our booth page brought visitors to us before the doors even opened. We booked meetings in the app and walked into the hall with a full calendar.',
    result: { value: '120', label: 'meetings booked before and during the show' },
    event: BUILD,
    tone: ['#60a5fa', '#1d4ed8'],
  },
]

/** How long each story stays before the next one comes in. */
const STORY_MS = 7000

const current = ref(0)
const story = computed(() => STORIES[current.value]!)

/* ---------- Auto-advance while on screen; hover or focus pauses ---------- */
const stage = ref<HTMLElement | null>(null)
const autoplay = ref(false)
const held = ref(false)
usePlayInView(stage, { play: () => (autoplay.value = true), pause: () => (autoplay.value = false) })

function go(i: number) {
  current.value = (i + STORIES.length) % STORIES.length
}

/* ---------- Tabs: arrow keys, Home and End move between people ---------- */
const tabEls: HTMLButtonElement[] = []
const setTab = (i: number) => (el: unknown) => {
  if (el) tabEls[i] = el as HTMLButtonElement
}

function onKey(e: KeyboardEvent) {
  const to = {
    ArrowRight: current.value + 1,
    ArrowLeft: current.value - 1,
    Home: 0,
    End: STORIES.length - 1,
  }[e.key]
  if (to === undefined) return
  e.preventDefault()
  go(to)
  tabEls[current.value]?.focus()
}

/* ---------- Reveal ---------- */
const animate = ref(false)
const revealed = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const el = stage.value
  if (!el || !('IntersectionObserver' in window)) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // Already on screen (a tall window, a restored scroll): leave it be rather than hide it.
  if (el.getBoundingClientRect().top < window.innerHeight) return

  animate.value = true
  observer = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting) return
    observer?.disconnect()
    revealed.value = true
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 })
  observer.observe(el)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <section id="testimonials" class="tm" aria-labelledby="tm-title">
    <div class="tm-rail">
      <header class="tm-head">
        <p class="tm-eyebrow">Testimonials</p>
        <h2 id="tm-title" class="tm-title">Loved by the teams <br>behind big events</h2>
        <p class="tm-sub">Organizers and exhibitors on what changed once their event ran on EXPOUSE.</p>
      </header>

      <div
        ref="stage"
        class="stage"
        :class="{ 'tm--animate': animate, in: revealed, playing: autoplay, held }"
        :style="{ '--story-ms': `${STORY_MS}ms` }"
        @mouseenter="held = true"
        @mouseleave="held = false"
        @focusin="held = true"
        @focusout="held = false"
      >
        <div id="tm-panel" class="card" role="tabpanel" :aria-labelledby="`tm-tab-${current}`">
          <Transition name="tm-swap" mode="out-in">
            <div :key="current" class="slide">
              <figure class="story">
                <div class="stars" role="img" aria-label="Rated 5 out of 5">
                  <svg v-for="n in 5" :key="n" class="star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8L12 2.5z" />
                  </svg>
                </div>
                <blockquote class="quote">“{{ story.quote }}”</blockquote>
                <figcaption class="who">
                  <span class="avatar" :style="{ background: `linear-gradient(135deg, ${story.tone[0]}, ${story.tone[1]})` }" aria-hidden="true">{{ initials(story.name) }}</span>
                  <span class="id">
                    <b>{{ story.name }}</b>
                    <small>{{ story.role }}, {{ story.company }}</small>
                  </span>
                  <span class="side">{{ story.side }}</span>
                </figcaption>
              </figure>

              <aside class="result" aria-label="Result">
                <span class="result-kicker"><Icon name="lucide:trending-up" class="ico" />The result</span>
                <b class="result-value">{{ story.result.value }}</b>
                <p class="result-label">{{ story.result.label }}</p>
                <span class="event">
                  <i :style="{ background: story.event.color }" aria-hidden="true">{{ story.event.initial }}</i>
                  {{ story.event.name }}
                </span>
              </aside>
            </div>
          </Transition>
        </div>

        <div class="controls">
          <div class="tabs" role="tablist" aria-label="Customer stories" @keydown="onKey">
            <button
              v-for="(s, i) in STORIES"
              :id="`tm-tab-${i}`"
              :key="s.name"
              :ref="setTab(i)"
              type="button"
              role="tab"
              class="tab"
              :class="{ on: i === current }"
              :aria-selected="i === current"
              :tabindex="i === current ? 0 : -1"
              aria-controls="tm-panel"
              @click="go(i)"
            >
              <span class="tab-avatar" :style="{ background: `linear-gradient(135deg, ${s.tone[0]}, ${s.tone[1]})` }" aria-hidden="true">{{ initials(s.name) }}</span>
              <span class="tab-id">
                <b>{{ s.name }}</b>
                <small>{{ s.company }}</small>
              </span>
              <i v-if="i === current" :key="current" class="bar" aria-hidden="true" @animationend="go(current + 1)" />
            </button>
          </div>

          <div class="arrows">
            <button type="button" class="arrow" aria-label="Previous story" @click="go(current - 1)">
              <Icon name="lucide:arrow-left" class="ico" />
            </button>
            <button type="button" class="arrow" aria-label="Next story" @click="go(current + 1)">
              <Icon name="lucide:arrow-right" class="ico" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.tm {
  --tm-brand: var(--color-brand, #6452E7);
  --tm-ink: var(--color-ink, #1f2430);
  --tm-muted: var(--color-muted, #6b7280);
  --tm-line: #e8e6f3;
  --tm-tint: #f4f2fd;
  --tm-ease: cubic-bezier(.22, .8, .24, 1);
  color: var(--tm-ink);
  /* A soft tinted band, so the section stands apart from the white ones around it. */
  background:
    radial-gradient(50% 60% at 0% 0%, rgba(100, 82, 231, .08), transparent 70%),
    radial-gradient(45% 55% at 100% 100%, rgba(100, 82, 231, .07), transparent 70%),
    #faf9ff;
  border-block: 1px solid #efedf8;
}

.tm-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(56px, 7vw, 96px) clamp(12px, 3vw, 40px);
}

/* ---------- Heading (same as the sections around it) ---------- */
.tm-head {
  max-width: 720px;
  margin: 0 auto clamp(32px, 4.5vw, 56px);
  text-align: center;
}

.tm-eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--tm-brand);
}

.tm-title {
  margin: 8px 0 0;
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.03em;
  text-wrap: balance;
}

.tm-sub {
  margin: 12px auto 0;
  max-width: 640px;
  font-size: 17px;
  line-height: 1.6;
  color: var(--tm-muted);
}

/* ---------- The story card ---------- */
.card {
  padding: 10px;
  background: #fff;
  border: 1px solid var(--tm-line);
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(20, 23, 40, .04), 0 40px 80px -48px rgba(100, 82, 231, .45);
}

.slide {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 10px;
  min-height: 360px;
}

.story {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: clamp(24px, 3.4vw, 44px) clamp(20px, 3.4vw, 44px) clamp(22px, 3vw, 36px);
}

.stars {
  display: flex;
  gap: 3px;
  color: #f5a524;
}

.star {
  width: 18px;
  height: 18px;
}

.quote {
  margin: 20px 0 0;
  font-size: clamp(20px, 2vw, 25px);
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: -.012em;
  color: var(--tm-ink);
  text-wrap: pretty;
}

.who {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: auto;
  padding-top: 28px;
}

.avatar {
  flex: none;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 0 0 4px #fff, 0 0 0 5px var(--tm-line);
}

.id {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.id b {
  font-size: 16.5px;
  font-weight: 700;
  line-height: 1.3;
}

.id small {
  font-size: 14px;
  line-height: 1.4;
  color: var(--tm-muted);
}

.side {
  flex: none;
  margin-left: auto;
  padding: 4px 10px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--tm-brand);
  background: var(--tm-tint);
  border-radius: 999px;
}

/* The result: brand panel with rings in the corner. */
.result {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  padding: clamp(24px, 3vw, 36px);
  color: #fff;
  background:
    radial-gradient(90% 70% at 100% 0%, rgba(255, 255, 255, .18), transparent 60%),
    linear-gradient(160deg, #7565f0, var(--tm-brand) 55%, #4f3fd1);
  border-radius: 14px;
}

.result::before,
.result::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.result::before {
  right: -70px;
  bottom: -70px;
  width: 220px;
  height: 220px;
  border: 28px solid rgba(255, 255, 255, .08);
}

.result::after {
  right: 40px;
  bottom: 60px;
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, .35);
}

.result-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 11px;
  font-size: 13px;
  font-weight: 600;
  background: rgba(255, 255, 255, .14);
  border-radius: 999px;
}

.result-kicker .ico {
  width: 15px;
  height: 15px;
}

.result-value {
  margin-top: auto;
  padding-top: 28px;
  font-size: clamp(48px, 5.4vw, 68px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -.04em;
  font-variant-numeric: tabular-nums;
}

.result-label {
  max-width: 260px;
  margin: 10px 0 0;
  font-size: 16px;
  line-height: 1.5;
  color: rgba(255, 255, 255, .85);
}

.event {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-top: 26px;
  padding: 6px 12px 6px 6px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--tm-ink);
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 24px -14px rgba(20, 23, 40, .5);
}

.event i {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 800;
  color: #fff;
  border-radius: 6px;
}

/* A new story rises in as the last one fades. */
.tm-swap-enter-active {
  transition: opacity .5s var(--tm-ease), transform .55s var(--tm-ease);
}

.tm-swap-leave-active {
  transition: opacity .22s ease, transform .25s ease;
}

.tm-swap-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.tm-swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ---------- People and arrows ---------- */
.controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 18px;
}

.tabs {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  min-width: 0;
}

.tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 10px 12px;
  overflow: hidden;
  font: inherit;
  text-align: left;
  color: var(--tm-ink);
  background: rgba(255, 255, 255, .6);
  border: 1px solid var(--tm-line);
  border-radius: 12px;
  cursor: pointer;
  transition: background-color .25s, border-color .25s, box-shadow .3s;
}

.tab:hover {
  background: #fff;
  border-color: color-mix(in srgb, var(--tm-brand) 28%, #fff);
}

.tab:focus-visible {
  outline: 2px solid var(--tm-brand);
  outline-offset: 2px;
}

.tab.on {
  background: #fff;
  border-color: color-mix(in srgb, var(--tm-brand) 45%, #fff);
  box-shadow: 0 14px 30px -22px rgba(100, 82, 231, .6);
}

.tab-avatar {
  flex: none;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
  opacity: .55;
  filter: saturate(.6);
  transition: opacity .25s, filter .25s;
}

.tab:hover .tab-avatar,
.tab.on .tab-avatar {
  opacity: 1;
  filter: none;
}

.tab-id {
  display: grid;
  min-width: 0;
}

.tab-id b,
.tab-id small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-id b {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
}

.tab-id small {
  font-size: 12.5px;
  color: var(--tm-muted);
}

/* The active tab's bar: fills over one story, then the next comes in (animationend). */
.bar {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: 100%;
  background: var(--tm-brand);
  transform: scaleX(0);
  transform-origin: left;
}

.playing .bar {
  animation: tm-fill var(--story-ms, 7s) linear forwards;
}

.playing.held .bar {
  animation-play-state: paused;
}

@keyframes tm-fill {
  to {
    transform: scaleX(1);
  }
}

.arrows {
  flex: none;
  display: flex;
  gap: 8px;
}

.arrow {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  padding: 0;
  color: var(--tm-ink);
  background: #fff;
  border: 1px solid var(--tm-line);
  border-radius: 50%;
  cursor: pointer;
  transition: color .2s, background-color .2s, border-color .2s, transform .2s var(--tm-ease);
}

.arrow:hover {
  color: #fff;
  background: var(--tm-brand);
  border-color: var(--tm-brand);
}

.arrow:active {
  transform: scale(.95);
}

.arrow:focus-visible {
  outline: 2px solid var(--tm-brand);
  outline-offset: 2px;
}

.arrow .ico {
  width: 18px;
  height: 18px;
}

/* ---------- Reveal: the card, then the people, rise in ---------- */
.tm--animate .card,
.tm--animate .controls {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity .8s var(--tm-ease), transform .8s var(--tm-ease);
}

.tm--animate .controls {
  transition-delay: .12s;
}

.tm--animate.in .card,
.tm--animate.in .controls {
  opacity: 1;
  transform: none;
}

/* Tablets: the result sits under the quote; people show as avatars with names. */
@media (max-width: 1023px) {
  .slide {
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;
  }

  .result {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: end;
    column-gap: 20px;
  }

  .result-kicker {
    grid-column: 1 / -1;
    justify-self: start;
  }

  .result-value {
    padding-top: 22px;
  }

  .result-label {
    margin: 0 0 4px;
  }

  .event {
    grid-column: 1 / -1;
    justify-self: start;
    margin-top: 20px;
  }

  .tab-id small {
    display: none;
  }
}

/* Phones: avatars only, the arrows beside them. */
@media (max-width: 680px) {
  .card {
    padding: 8px;
    border-radius: 16px;
  }

  .story {
    padding: 20px 14px 18px;
  }

  .quote {
    font-size: 18px;
  }

  /* The tag moves under the name so the name keeps its room. */
  .who {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: 12px;
    row-gap: 8px;
  }

  .avatar {
    width: 44px;
    height: 44px;
    font-size: 15px;
  }

  .side {
    grid-column: 2;
    justify-self: start;
    margin-left: 0;
  }

  .result {
    grid-template-columns: minmax(0, 1fr);
  }

  .result-label {
    margin-top: 8px;
  }

  .tabs {
    display: flex;
    gap: 8px;
  }

  .tab {
    flex: none;
    padding: 6px;
    border-radius: 50%;
  }

  .tab-id {
    display: none;
  }

  .arrows {
    margin-left: auto;
  }

  .arrow {
    width: 42px;
    height: 42px;
  }
}

@media (max-width: 380px) {
  .tab {
    padding: 4px;
  }

  .tab-avatar {
    width: 30px;
    height: 30px;
    font-size: 11.5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tm-swap-enter-active,
  .tm-swap-leave-active,
  .tab,
  .tab-avatar,
  .arrow {
    transition: none;
  }
}
</style>
