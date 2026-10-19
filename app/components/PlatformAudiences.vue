<script setup lang="ts">
/**
 * 05 · One platform, made for everyone.
 *
 * Laid out from the Figma frame: the four audiences (organizers, exhibitors,
 * speakers, attendees) as a list of tabs on the left, and on the right a panel
 * for the chosen one: their screen in the product on top, then what they get,
 * a link and four things it does.
 *
 * The screens are the real ones, like the hero's (components/audience): the
 * admin's Analytics overview for organizers, the exhibitor portal's Leads page,
 * a live session's Q&A as its speaker hosts it, and the attendee web app's
 * Reception. Each is drawn at its design size (1280 × 526) and scaled to the
 * panel; on phones it reflows into the narrow version of the same page
 * (600 × 620) instead of shrinking to a thumbnail.
 *
 * When the section scrolls into view the tabs rise in one after another and
 * the panel follows (expouse-landing/index.html, 03 Audiences); without JS,
 * with reduced motion, or when it is already on screen at load, it is simply
 * shown.
 *
 * This is the page's #platform section (the hero's "Explore the platform" and
 * the nav's "Platform" link land here).
 */
/** The screens' design widths: desktop, and phones (max-width: 640px). */
const SCREEN_W = 1280
const SCREEN_W_PHONE = 600

const AUDIENCES = [
  {
    key: 'organizers',
    icon: 'lucide:layout-grid',
    title: 'Organizers',
    text: 'Build the event, manage registrations and keep an eye on the floor on the day.',
    lead: 'For organizers',
    features: ['Registration, badges & check-in', 'Agenda, speakers & sponsors', 'Staff roles & permissions', 'Live analytics & reports'],
    link: 'Explore organizer tools',
    to: '/#features',
  },
  {
    key: 'exhibitors',
    icon: 'lucide:store',
    title: 'Exhibitors',
    text: 'Every booth gets its own login to scan visitors, score them and follow up after the show.',
    lead: 'For exhibitors',
    features: ['Badge scanning for leads', 'Custom qualifying questions', 'Booth page, chat & meetings', 'Engagement reports'],
    link: 'See the exhibitor portal',
    to: '/#book-demo',
  },
  {
    key: 'speakers',
    icon: 'lucide:video',
    title: 'Speakers',
    text: 'Speakers keep their profile up to date, run their sessions and answer questions from the audience.',
    lead: 'For speakers',
    features: ['Speaker profile & bio', 'Host live sessions', 'Live Q&A, polls & chat', 'Ratings & feedback'],
    link: 'See the speaker tools',
    to: '/#book-demo',
  },
  {
    key: 'attendees',
    icon: 'lucide:smartphone',
    title: 'Attendees',
    text: 'Your event on their phone: the agenda, their badge and the people worth meeting.',
    lead: 'For attendees',
    features: ['Personal agenda & digital badge', 'Networking, chat & meetings', 'Live sessions & lounge', 'Feed, polls & leaderboard'],
    link: 'See the attendee app',
    to: '/#apps',
  },
]

const active = ref(0)
const current = computed(() => AUDIENCES[active.value]!)

const tabEls = ref<HTMLButtonElement[]>([])

/** Arrow keys move between the tabs (roving focus), Home and End jump to the ends. */
function onKey(e: KeyboardEvent, i: number) {
  const n = AUDIENCES.length
  const next = {
    ArrowDown: (i + 1) % n,
    ArrowRight: (i + 1) % n,
    ArrowUp: (i - 1 + n) % n,
    ArrowLeft: (i - 1 + n) % n,
    Home: 0,
    End: n - 1,
  }[e.key]
  if (next === undefined) return
  e.preventDefault()
  active.value = next
  tabEls.value[next]?.focus()
}

/* The screen is scaled to the panel's width (--s); a desktop panel starts at its usual 737px. */
const panel = ref<HTMLElement | null>(null)
const scale = ref(737 / SCREEN_W)
let resizeObserver: ResizeObserver | null = null

function fit() {
  const cw = panel.value?.clientWidth
  if (cw) scale.value = cw / (window.matchMedia('(max-width: 640px)').matches ? SCREEN_W_PHONE : SCREEN_W)
}

const stage = ref<HTMLElement | null>(null)
const animate = ref(false)
const revealed = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  fit()
  if ('ResizeObserver' in window && panel.value) {
    resizeObserver = new ResizeObserver(fit)
    resizeObserver.observe(panel.value)
  }
  else {
    window.addEventListener('resize', fit)
  }

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
  resizeObserver?.disconnect()
  window.removeEventListener('resize', fit)
})
</script>

<template>
  <section id="platform" class="pa" aria-labelledby="pa-title">
    <div class="pa-rail">
      <header class="pa-head">
        <p class="pa-eyebrow">Who it's for</p>
        <h2 id="pa-title" class="pa-title">Everyone at your event gets their own view</h2>
        <p class="pa-sub">Organizers, exhibitors, speakers and attendees each log in to their own space. Change something once and everyone sees it.</p>
      </header>

      <div ref="stage" class="pa-stage" :class="{ 'pa--animate': animate, in: revealed }">
        <!-- Audiences -->
        <div class="tabs" role="tablist" aria-label="Who it is for" aria-orientation="vertical">
          <button
            v-for="(a, i) in AUDIENCES"
            :id="`pa-tab-${a.key}`"
            :key="a.key"
            ref="tabEls"
            type="button"
            role="tab"
            class="tab"
            :class="{ on: i === active }"
            :style="{ '--i': i }"
            :aria-selected="i === active"
            aria-controls="pa-panel"
            :tabindex="i === active ? 0 : -1"
            @click="active = i"
            @keydown="onKey($event, i)"
          >
            <span class="tile">
              <Icon :name="a.icon" class="ico" />
            </span>
            <span class="tab-body">
              <span class="tab-title">{{ a.title }}</span>
              <span class="tab-text">{{ a.text }}</span>
            </span>
            <Icon name="lucide:arrow-right" class="tab-arrow" />
          </button>
        </div>

        <!-- The chosen audience -->
        <div id="pa-panel" ref="panel" class="panel" role="tabpanel" :aria-labelledby="`pa-tab-${current.key}`" :style="{ '--s': scale }">
          <Transition name="pa-swap" mode="out-in">
            <div :key="current.key" class="panel-in">
              <!-- Their screen in the product: a picture, the copy below says the same. -->
              <div class="screen" aria-hidden="true">
                <div class="scr">
                  <AudienceOrganizer v-if="current.key === 'organizers'" />
                  <AudienceExhibitor v-else-if="current.key === 'exhibitors'" />
                  <AudienceSpeaker v-else-if="current.key === 'speakers'" />
                  <AudienceAttendee v-else />
                </div>
              </div>

              <div class="sum">
                <div class="sum-copy">
                  <p class="lead">{{ current.lead }}</p>
                  <h3 class="sum-title">{{ current.text }}</h3>
                  <NuxtLink :to="current.to" class="link">
                    {{ current.link }}
                    <span class="link-btn">
                      <Icon name="lucide:arrow-right" class="ico" />
                    </span>
                  </NuxtLink>
                </div>

                <ul class="list">
                  <li v-for="f in current.features" :key="f">
                    <span class="chk">
                      <Icon name="lucide:check" class="ico" />
                    </span>
                    {{ f }}
                  </li>
                </ul>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.pa {
  --pa-brand: var(--color-brand, #6452E7 );
  --pa-brand-dark: var(--color-brand-dark, #4f46e5);
  --pa-brand-soft: var(--color-brand-soft, #eef2ff);
  --pa-brand-200: #c7d2fe;
  --pa-tint: #f4f3fe;
  --pa-lilac: #e6e3fc;
  --pa-ink: var(--color-ink, #1f2430);
  --pa-muted: var(--color-muted, #6b7280);
  --pa-faint: var(--color-faint, #9aa1ad);
  --pa-line: var(--color-line, #e8e9ee);
  --pa-ease: cubic-bezier(.22, .8, .24, 1);
  color: var(--pa-ink);
}

/* Same rail and gutter as the sections above. */
.pa-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: 0 clamp(12px, 3vw, 40px) clamp(56px, 7vw, 88px);
}

/* ---------- Heading ---------- */
.pa-head {
  max-width: 720px;
  margin: 0 auto clamp(32px, 4.5vw, 56px);
  text-align: center;
}

.pa-eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--pa-brand);
}

.pa-title {
  margin: 8px 0 0;
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.03em;
  text-wrap: balance;
}

.pa-sub {
  margin: 12px auto 0;
  max-width: 640px;
  font-size: 17px;
  line-height: 1.6;
  color: var(--pa-muted);
}

/* ---------- Layout: tabs | panel ---------- */
.pa-stage {
  display: grid;
  grid-template-columns: minmax(0, 393fr) minmax(0, 737fr);
  gap: 30px;
}

/* The four tabs share the panel's height evenly. */
.tabs {
  display: grid;
  grid-auto-rows: 1fr;
  gap: 12px;
  min-width: 0;
}

.tab {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
  padding: 22px 18px 20px 20px;
  font: inherit;
  text-align: start;
  color: inherit;
  background: #fff;
  border: 1px solid var(--pa-line);
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color .25s, background-color .25s, box-shadow .3s;
}

/* The bar down the left edge of the chosen tab. */
.tab::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--pa-brand);
  transform: scaleY(0);
  transition: transform .35s var(--pa-ease);
}

.tab:hover {
  border-color: var(--pa-brand-200);
}

.tab.on {
  background: var(--pa-tint);
  border-color: var(--pa-brand);
  box-shadow: 0 18px 30px -22px rgba(99, 102, 241, .55);
}

.tab.on::before {
  transform: none;
}

.tab:focus-visible {
  outline: 2px solid var(--pa-brand);
  outline-offset: 3px;
}

.tile {
  flex: none;
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: var(--pa-tint);
  color: var(--pa-brand);
  transition: background-color .25s, color .25s, box-shadow .3s;
}

.tab.on .tile {
  background: var(--pa-brand);
  color: #fff;
  box-shadow: 0 10px 20px -10px rgba(99, 102, 241, .75);
}

.tile .ico {
  width: 22px;
  height: 22px;
}

.tab-body {
  flex: 1;
  display: grid;
  gap: 2px;
  min-width: 0;
}

.tab-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -.01em;
}

.tab-text {
  font-size: 14px;
  line-height: 20px;
  color: var(--pa-muted);
}

.tab-arrow {
  flex: none;
  align-self: center;
  width: 18px;
  height: 18px;
  margin-left: -4px;
  color: var(--pa-brand);
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity .25s, transform .3s var(--pa-ease);
}

.tab.on .tab-arrow {
  opacity: 1;
  transform: none;
}

/* ---------- Panel ---------- */
.panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--pa-line);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(20, 23, 40, .04);
}

.panel-in {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pa-swap-enter-active,
.pa-swap-leave-active {
  transition: opacity .22s ease, transform .3s var(--pa-ease);
}

.pa-swap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.pa-swap-leave-to {
  opacity: 0;
}

/* ---------- Screen ----------
 * Drawn at its design size (--sw × --sh) and scaled to the panel (--s, from the
 * script). The screens are crops of the product, so the page runs on past the
 * bottom edge, where it fades out. */
.screen {
  --sw: 1280px;
  --sh: 526px;
  position: relative;
  height: calc(var(--sh) * var(--s, .576));
  overflow: hidden;
  border-bottom: 1px solid var(--pa-line);
}

.scr {
  position: absolute;
  left: 0;
  top: 0;
  width: var(--sw);
  height: var(--sh);
  transform: scale(var(--s, .576));
  transform-origin: 0 0;
}

.screen::after {
  content: "";
  position: absolute;
  z-index: 1;
  left: 0;
  right: 0;
  bottom: 0;
  height: 28px;
  background: linear-gradient(rgba(246, 246, 249, 0), #f6f6f9);
  pointer-events: none;
}

/* ---------- Summary under the screen ---------- */
.sum {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  align-content: center;
  gap: 24px 32px;
  padding: 26px 28px 28px;
}

.lead {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--pa-brand);
}

.sum-title {
  margin: 6px 0 0;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -.01em;
  text-wrap: balance;
}

.link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  font-size: 16px;
  font-weight: 700;
  color: var(--pa-brand);
  text-decoration: none;
  transition: color .2s;
}

.link-btn {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  color: #fff;
  background: var(--pa-brand);
  border-radius: 8px;
  transition: background-color .2s;
}

.link-btn .ico {
  width: 16px;
  height: 16px;
  transition: transform .25s var(--pa-ease);
}

.link:hover {
  color: var(--pa-brand-dark);
}

.link:hover .link-btn {
  background: var(--pa-brand-dark);
}

.link:hover .link-btn .ico {
  transform: translateX(2px);
}

.link:focus-visible {
  outline: 2px solid var(--pa-brand);
  outline-offset: 3px;
  border-radius: 6px;
}

.list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Top-aligned, so a line that wraps keeps its check beside the first line. */
.list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 16px;
  line-height: 22px;
}

.chk {
  flex: none;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--pa-brand);
  color: #fff;
}

.chk .ico {
  width: 13px;
  height: 13px;
}

/* ---------- Reveal: tabs rise in one after another, then the panel ---------- */
.pa--animate .tab,
.pa--animate .panel {
  opacity: 0;
  transform: translateY(26px);
  filter: blur(4px);
}

.pa--animate .tab {
  transition: opacity .8s var(--pa-ease), transform .8s var(--pa-ease), filter .8s var(--pa-ease), border-color .25s, background-color .25s, box-shadow .3s;
  transition-delay: calc(var(--i, 0) * 90ms), calc(var(--i, 0) * 90ms), calc(var(--i, 0) * 90ms), 0s, 0s, 0s;
}

.pa--animate .panel {
  transition: opacity .9s var(--pa-ease) .18s, transform .9s var(--pa-ease) .18s, filter .9s var(--pa-ease) .18s;
}

.pa--animate.in .tab,
.pa--animate.in .panel {
  opacity: 1;
  transform: none;
  filter: none;
}

/* Tablets: the tabs go two by two above the panel. */
@media (max-width: 1023px) {
  .pa-stage {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }

  .tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tab {
    padding: 20px 18px;
  }

  .tab-arrow {
    display: none;
  }
}

/* Phones: compact tabs (icon and name), the screen's narrow version, and the summary stacks. */
@media (max-width: 640px) {
  .tabs {
    gap: 10px;
  }

  .screen {
    --sw: 600px;
    --sh: 620px;
  }

  .tab {
    align-items: center;
    gap: 12px;
    padding: 14px;
  }

  .tile {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .tile .ico {
    width: 19px;
    height: 19px;
  }

  .tab-title {
    font-size: 16px;
  }

  .tab-text {
    display: none;
  }

  .sum {
    grid-template-columns: minmax(0, 1fr);
    padding: 22px 20px 24px;
  }

  .list li {
    font-size: 15px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tab::before,
  .tab-arrow,
  .link-btn .ico {
    transition: none;
  }

  .pa-swap-enter-active,
  .pa-swap-leave-active {
    transition: none;
  }
}
</style>
