<script setup lang="ts">
/**
 * 06 · Features.
 *
 * Eight things the platform does, as a row of cards that slides sideways
 * (Figma: Features). Four cards show at a time on wide screens; a stack of card
 * edges at the right says there are more. Under the row, a bar shows how far
 * along you are, beside the previous / next buttons. The row is a native scroll
 * area (snap per card), so touch, trackpad and arrow keys all work; the buttons
 * move it one card at a time. When the cards scroll into view they rise in one
 * after another; without JS, with reduced motion, or when they are already on
 * screen at load, they are simply shown.
 *
 * This is the page's #features section (the nav's "Features" link lands here).
 */
const FEATURES = [
  { icon: 'lucide:file-text', tag: 'Registration', title: 'Registration forms', text: 'A different form for visitors, exhibitors and VIPs, with questions that only show up when they apply.' },
  { icon: 'lucide:printer', tag: 'Onsite', title: 'Badge printing', text: 'Design a badge for each role and print it at the desk or on a self-service kiosk.' },
  { icon: 'lucide:scan-line', tag: 'Onsite', title: 'Check-in', text: 'Scan with a phone or a handheld scanner. If the Wi-Fi drops, scanning carries on.' },
  { icon: 'lucide:funnel', tag: 'Exhibitors', title: 'Exhibitor leads', text: 'Exhibitors scan a badge, answer their own questions and see the lead score straight away.' },
  { icon: 'lucide:message-square', tag: 'Engagement', title: 'Networking', text: 'Attendees find each other in the directory, chat and book one-to-one meetings.' },
  { icon: 'lucide:video', tag: 'Engagement', title: 'Live sessions', text: 'Video rooms and a networking lounge inside the app, so nobody gets sent off to another tool.' },
  { icon: 'lucide:mail', tag: 'Communication', title: 'Email & notifications', text: 'Send emails, push notifications and surveys to exactly the group you pick.' },
  { icon: 'lucide:chart-column', tag: 'Insights', title: 'Analytics', text: 'Watch registrations, check-ins and booth traffic as they happen.' },
]

const track = ref<HTMLElement | null>(null)
/** The visible part of the row, as a share of the whole (the progress bar's fill). */
const progress = reactive({ start: 0, size: 4 / FEATURES.length })
const canPrev = ref(false)
const canNext = ref(true)

function measure() {
  const el = track.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  progress.size = el.clientWidth / el.scrollWidth
  progress.start = el.scrollLeft / el.scrollWidth
  // A pixel of slack: scroll positions land on fractions.
  canPrev.value = el.scrollLeft > 1
  canNext.value = el.scrollLeft < max - 1
}

/** One card (and its gap) per press. */
function go(dir: 1 | -1) {
  const el = track.value
  const card = el?.querySelector('li')
  if (!el || !card) return
  const gap = parseFloat(getComputedStyle(el).columnGap) || 0
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollBy({ left: dir * (card.getBoundingClientRect().width + gap), behavior: smooth ? 'smooth' : 'auto' })
}

const animate = ref(false)
const revealed = ref(false)
let observer: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  const el = track.value
  if (!el) return
  measure()
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(el)
  }
  else {
    window.addEventListener('resize', measure)
  }

  if (!('IntersectionObserver' in window)) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // Already on screen (a tall window, a restored scroll): leave the cards be rather than hide them.
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
  resizeObserver?.disconnect()
  window.removeEventListener('resize', measure)
})
</script>

<template>
  <section id="features" class="fs" aria-labelledby="fs-title">
    <div class="fs-rail">
      <header class="fs-head">
        <p class="fs-eyebrow">Features</p>
        <h2 id="fs-title" class="fs-title">One login replaces five tools</h2>
        <p class="fs-sub">A form builder, a badge tool, a scanning app, an attendee app and a pile of spreadsheets. Most events pay for all five and copy data between them. On EXPOUSE it is one system with one set of data.</p>
      </header>

      <div class="deck" :class="{ more: canNext }">
        <ul
          ref="track"
          class="track"
          :class="{ 'fs--animate': animate, in: revealed }"
          tabindex="0"
          aria-label="Features"
          @scroll.passive="measure"
        >
          <li v-for="(f, i) in FEATURES" :key="f.title" class="card" :style="{ '--i': i }">
            <i class="ring" aria-hidden="true" />
            <i class="bead" aria-hidden="true" />
            <span class="tile">
              <Icon :name="f.icon" class="ico" />
            </span>
            <div class="body">
              <span class="tag">{{ f.tag }}</span>
              <h3>{{ f.title }}</h3>
              <p>{{ f.text }}</p>
            </div>
          </li>
        </ul>
      </div>

      <div class="ctrl">
        <div class="bar" aria-hidden="true">
          <i :style="{ left: `${progress.start * 100}%`, width: `${progress.size * 100}%` }" />
        </div>
        <button type="button" class="nav" :disabled="!canPrev" aria-label="Previous features" @click="go(-1)">
          <Icon name="lucide:arrow-left" class="ico" />
        </button>
        <button type="button" class="nav" :disabled="!canNext" aria-label="Next features" @click="go(1)">
          <Icon name="lucide:arrow-right" class="ico" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.fs {
  --fs-brand: var(--color-brand, #6452E7 );
  --fs-brand-200: #c7d2fe;
  --fs-tint: #6452E712;
  --fs-ink: var(--color-ink, #1f2430);
  --fs-muted: var(--color-muted, #6b7280);
  --fs-line: #ebe9f5;
  --fs-ease: cubic-bezier(.22, .8, .24, 1);
  /* Cards across: four on wide screens. */
  --per: 4;
  --gap: 20px;
  /* The stack of card edges reaches past the rail's edge; never let it widen the page. */
  overflow-x: clip;
  color: var(--fs-ink);
  background: #f3f2fc;
}

.fs-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(56px, 7vw, 88px) clamp(12px, 3vw, 40px);
}

/* ---------- Heading (same as the sections above) ---------- */
.fs-head {
  max-width: 720px;
  margin: 0 auto clamp(32px, 4.5vw, 56px);
  text-align: center;
}

.fs-eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--fs-brand);
}

.fs-title {
  margin: 8px 0 0;
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.03em;
  text-wrap: balance;
}

.fs-sub {
  margin: 12px auto 0;
  max-width: 640px;
  font-size: 17px;
  line-height: 1.6;
  color: var(--fs-muted);
}

/* ---------- The row ---------- */
.deck {
  position: relative;
  /* Keeps the stacked cards' layers (below) inside the row. */
  isolation: isolate;
}

/* The next cards, stacked behind the last card while there are more to see: a white
   card just behind it (a little shorter, peeking out 10px), and a lilac one behind
   that (shorter again, 16px out). Card-shaped, so their right corners round like a card's. */
.deck::before,
.deck::after {
  content: "";
  position: absolute;
  z-index: 1;
  right: -10px;
  top: 10px;
  bottom: 11px;
  width: 80px;
  background: #fff;
  border: 1px solid var(--fs-line);
  border-radius: 14px;
  opacity: 0;
  transition: opacity .3s;
}

.deck::after {
  z-index: 0;
  right: -16px;
  top: 23px;
  bottom: 24px;
  background: #ebe9f8;
  border-color: transparent;
}

.deck.more::before,
.deck.more::after {
  opacity: 1;
}

.track {
  position: relative;
  z-index: 2;
  display: flex;
  gap: var(--gap);
  margin: -6px 0;
  padding: 6px 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  list-style: none;
}

.track::-webkit-scrollbar {
  display: none;
}

.track:focus-visible {
  outline: 2px solid var(--fs-brand);
  outline-offset: 4px;
  border-radius: 14px;
}

/* ---------- Card ---------- */
.card {
  position: relative;
  flex: none;
  width: calc((100% - (var(--per) - 1) * var(--gap)) / var(--per));
  min-height: 340px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 28px;
  padding: 28px 24px 30px;
  overflow: hidden;
  scroll-snap-align: start;
  background: #fff;
  border: 1px solid var(--fs-line);
  border-radius: 12px;
  transition: border-color .25s, box-shadow .3s;
}

.card:hover {
  border-color: var(--fs-brand-200);
  box-shadow: 0 24px 48px -30px rgba(99, 102, 241, .45);
}

/* Soft circles behind the top right corner: a ring round a disc, and a small bead below. */
.ring {
  position: absolute;
  right: -73px;
  top: -74px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: #6452E712;
  box-shadow: 0px 0px 0px 26px #6452E70A;
  pointer-events: none;
}

.bead {
  position: absolute;
  right: 100px;
  top: 130px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f6f5fd, rgba(246, 245, 253, 0));
  pointer-events: none;
}

.tile {
  position: relative;
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: var(--fs-brand);
  color: #fff;
  box-shadow: 0 16px 24px -12px rgba(99, 102, 241, .6);
  transition: transform .3s var(--fs-ease);
}

.card:hover .tile {
  transform: translateY(-2px);
}

.tile .ico {
  width: 26px;
  height: 26px;
}

.body {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.tag {
  padding: 3px 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--fs-brand);
  background: var(--fs-tint);
  border-radius: 6px;
}

.body h3 {
  margin: 12px 0 0;
  font-size: 21px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -.01em;
}

.body p {
  margin: 10px 0 0;
  font-size: 15.5px;
  line-height: 1.6;
  color: var(--fs-muted);
}

/* ---------- Progress and buttons ---------- */
.ctrl {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 34px;
}

.bar {
  position: relative;
  flex: 1;
  height: 3px;
  margin-right: 14px;
  overflow: hidden;
  background: #e5e3f3;
  border-radius: 3px;
}

.bar i {
  position: absolute;
  top: 0;
  bottom: 0;
  background: var(--fs-brand);
  border-radius: 3px;
  transition: left .2s linear, width .2s linear;
}

.nav {
  width: 46px;
  height: 46px;
  flex: none;
  display: grid;
  place-items: center;
  padding: 0;
  color: var(--fs-ink);
  background: #fff;
  border: 1px solid var(--fs-line);
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 6px 16px -10px rgba(31, 36, 48, .25);
  transition: color .2s, background-color .2s, border-color .2s, box-shadow .2s;
}

.nav .ico {
  width: 18px;
  height: 18px;
}

.nav:hover:not(:disabled) {
  color: var(--fs-brand);
  border-color: var(--fs-brand-200);
}

.nav:disabled {
  color: #a3a6b4;
  background: #f0eff9;
  border-color: transparent;
  box-shadow: none;
  cursor: default;
}

.nav:focus-visible {
  outline: 2px solid var(--fs-brand);
  outline-offset: 3px;
}

/* ---------- Reveal: cards rise in one after another ---------- */
.fs--animate .card {
  opacity: 0;
  transform: translateY(26px);
  filter: blur(4px);
  transition: opacity .8s var(--fs-ease), transform .8s var(--fs-ease), filter .8s var(--fs-ease), border-color .25s, box-shadow .3s;
  transition-delay: calc(var(--i, 0) * 90ms), calc(var(--i, 0) * 90ms), calc(var(--i, 0) * 90ms), 0s, 0s;
}

.fs--animate.in .card {
  opacity: 1;
  transform: none;
  filter: none;
}

/* Tablets: three across, then two. */
@media (max-width: 1100px) {
  .fs {
    --per: 3;
  }
}

@media (max-width: 820px) {
  .fs {
    --per: 2;
  }
}

/* Phones: one card and a peek of the next, which says there are more on its own. */
@media (max-width: 560px) {
  .fs {
    --per: 1.18;
    --gap: 14px;
  }

  .deck::before,
  .deck::after {
    display: none;
  }

  .card {
    min-height: 310px;
    padding: 24px 22px 26px;
  }

  .nav {
    width: 42px;
    height: 42px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tile,
  .bar i {
    transition: none;
  }

  .card:hover .tile {
    transform: none;
  }
}
</style>
