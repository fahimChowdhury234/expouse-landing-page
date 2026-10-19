<script setup lang="ts">
/**
 * 09 · Built for the region.
 *
 * English and Arabic side by side (Figma: Built for the region; the language
 * preview comes from expouse-landing/index.html, 07 Region): the same screen in
 * both languages, the Arabic one laid out right to left with Arabic numerals.
 * Tabs switch both cards between the places attendees meet the language - the
 * app, the event website, emails and the printed badge. While the section is on
 * screen the tabs take turns by themselves (a bar fills under the current one);
 * once the visitor picks a tab, it stays. With reduced motion there is no
 * autoplay. The sample event is Gulf Logistics Expo from utils/events.ts.
 */
import { QR_FINDERS, QR_SIZE, qrCells } from '~/utils/badges'

type Copy = { kicker: string, title: string, text: string, primary?: string, secondary?: string }

const SURFACES: { key: string, icon: string, label: string, qr?: boolean, en: Copy, ar: Copy }[] = [
  {
    key: 'app',
    icon: 'lucide:smartphone',
    label: 'App',
    qr: true,
    en: { kicker: 'WELCOME', title: 'Welcome to Gulf Logistics Expo 2026', text: 'Your badge is ready. Show this QR code at any gate.', primary: 'View badge', secondary: 'Agenda' },
    ar: { kicker: 'أهلاً بك', title: 'مرحباً بكم في معرض الخليج للخدمات اللوجستية ٢٠٢٦', text: 'بطاقتك جاهزة. أظهر رمز QR عند أي بوابة.', primary: 'عرض البطاقة', secondary: 'جدول الأعمال' },
  },
  {
    key: 'website',
    icon: 'lucide:globe',
    label: 'Website',
    en: { kicker: 'REGISTRATION', title: 'Register for Gulf Logistics Expo 2026', text: '12 – 14 November 2026 · Dubai World Trade Centre', primary: 'Register now', secondary: 'Agenda' },
    ar: { kicker: 'التسجيل', title: 'سجّل في معرض الخليج للخدمات اللوجستية ٢٠٢٦', text: '١٢ – ١٤ نوفمبر ٢٠٢٦ · مركز دبي التجاري العالمي', primary: 'سجّل الآن', secondary: 'جدول الأعمال' },
  },
  {
    key: 'email',
    icon: 'lucide:mail',
    label: 'Email',
    en: { kicker: 'CONFIRMATION', title: 'Your registration is confirmed', text: 'See you on 12 November at Dubai World Trade Centre. Your QR badge is attached.', primary: 'Add to calendar', secondary: 'Open the app' },
    ar: { kicker: 'تأكيد', title: 'تم تأكيد تسجيلك', text: 'نراك في ١٢ نوفمبر في مركز دبي التجاري العالمي. بطاقة QR الخاصة بك مرفقة.', primary: 'أضف إلى التقويم', secondary: 'افتح التطبيق' },
  },
  {
    key: 'badge',
    icon: 'lucide:id-card',
    label: 'Badge',
    qr: true,
    en: { kicker: 'VISITOR', title: 'Sara Ali', text: 'Fleetly · Gulf Logistics Expo 2026', primary: 'Print badge', secondary: 'Download' },
    ar: { kicker: 'زائر', title: 'سارة علي', text: 'فليتلي · معرض الخليج للخدمات اللوجستية ٢٠٢٦', primary: 'اطبع البطاقة', secondary: 'تنزيل' },
  },
]

const LANGS = [
  { key: 'en', label: 'English', dir: 'ltr' },
  { key: 'ar', label: 'العربية', dir: 'rtl' },
] as const

/** Time each surface is shown while the tabs take turns (also the tab bar's fill time). */
const AUTO_MS = 4200

const cells = qrCells(523)

const current = ref(0)
const surface = computed(() => SURFACES[current.value]!)
const autoplay = ref(false)
const turnKey = ref(0)

let reduced = false
let touched = false
let timer: ReturnType<typeof setTimeout> | null = null
let observer: IntersectionObserver | null = null

function stopTurns() {
  if (timer) clearTimeout(timer)
  timer = null
  autoplay.value = false
}

function nextTurn() {
  stopTurns()
  if (touched || reduced) return
  autoplay.value = true
  turnKey.value++
  timer = setTimeout(() => {
    current.value = (current.value + 1) % SURFACES.length
    nextTurn()
  }, AUTO_MS)
}

function choose(i: number) {
  touched = true
  stopTurns()
  current.value = i
}

const root = ref<HTMLElement | null>(null)

onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || !('IntersectionObserver' in window) || !root.value) return
  observer = new IntersectionObserver(([e]) => {
    if (e?.isIntersecting) nextTurn()
    else stopTurns()
  }, { threshold: 0.35 })
  observer.observe(root.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  stopTurns()
})
</script>

<template>
  <section id="region" ref="root" class="ls" aria-labelledby="ls-title">
    <div class="ls-rail">
      <header class="ls-head">
        <p class="ls-eyebrow">Built for the region</p>
        <h2 id="ls-title" class="ls-title">Arabic and English, done properly</h2>
        <p class="ls-sub">Switch everything to Arabic and it lays out right to left: the website, the app, the emails and the printed badges.</p>
      </header>

      <div class="tabs" role="group" aria-label="Preview">
        <button
          v-for="(s, i) in SURFACES"
          :key="s.key"
          type="button"
          class="tab"
          :aria-pressed="i === current"
          @click="choose(i)"
        >
          <Icon :name="s.icon" class="ico" />
          {{ s.label }}
          <span v-if="autoplay && i === current" :key="turnKey" class="bar" :style="{ '--dur': `${AUTO_MS}ms` }" />
        </button>
      </div>

      <div class="pair">
        <article v-for="l in LANGS" :key="l.key" class="lc" :lang="l.key" :dir="l.dir">
          <div class="lc-top">
            <span class="lang">{{ l.label }}</span>
            <span class="where"><Icon :name="surface.icon" class="ico" /></span>
          </div>

          <Transition name="lc-swap" mode="out-in">
            <div :key="surface.key" class="lc-body" :class="{ 'has-qr': surface.qr }">
              <div class="lc-copy">
                <small>{{ surface[l.key].kicker }}</small>
                <h3>{{ surface[l.key].title }}</h3>
                <p>{{ surface[l.key].text }}</p>
                <div v-if="surface[l.key].primary" class="lc-btns">
                  <span>{{ surface[l.key].primary }}</span>
                  <span class="alt">{{ surface[l.key].secondary }}</span>
                </div>
              </div>
              <svg v-if="surface.qr" class="qr" :viewBox="`0 0 ${QR_SIZE} ${QR_SIZE}`" aria-hidden="true">
                <rect v-for="([x, y], i) in cells" :key="i" :x="x + .08" :y="y + .08" width=".84" height=".84" rx=".2" />
                <g v-for="([fx, fy], i) in QR_FINDERS" :key="`f${i}`">
                  <rect :x="fx + .5" :y="fy + .5" width="6" height="6" rx="1.6" fill="none" stroke="currentColor" />
                  <rect :x="fx + 2" :y="fy + 2" width="3" height="3" rx=".8" />
                </g>
              </svg>
            </div>
          </Transition>
        </article>

        <span class="link-dot" aria-hidden="true"><Icon name="lucide:arrow-left-right" class="ico" /></span>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.ls {
  --ls-brand: var(--color-brand, #6452E7 );
  --ls-brand-soft: var(--color-brand-soft, #eef2ff);
  --ls-ink: var(--color-ink, #1f2430);
  --ls-muted: var(--color-muted, #6b7280);
  --ls-line: var(--color-line, #e8e9ee);
  --ls-ease: cubic-bezier(.22, .8, .24, 1);
  /* A full-width soft brand band, as in the Figma frame. */
  background: color-mix(in srgb, var(--ls-brand) 6%, #fff);
  border-block: 1px solid color-mix(in srgb, var(--ls-brand) 10%, #fff);
  color: var(--ls-ink);
}

.ls-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(56px, 7vw, 88px) clamp(12px, 3vw, 40px);
}

/* ---------- Heading ---------- */
.ls-head {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
}

.ls-eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ls-brand);
}

.ls-title {
  margin: 8px 0 0;
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.03em;
  text-wrap: balance;
}

.ls-sub {
  margin: 12px auto 0;
  max-width: 640px;
  font-size: 17px;
  line-height: 1.6;
  color: var(--ls-muted);
}

/* ---------- Surface tabs ---------- */
.tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  width: fit-content;
  max-width: 100%;
  margin: clamp(28px, 4vw, 40px) auto clamp(24px, 3vw, 32px);
  padding: 4px;
  background: #fff;
  border: 1px solid var(--ls-line);
  border-radius: 12px;
}

.tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  overflow: hidden;
  padding: 8px 16px;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  color: var(--ls-muted);
  background: none;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: background .2s, color .2s;
}

.tab .ico {
  width: 16px;
  height: 16px;
}

.tab:hover {
  color: var(--ls-ink);
}

.tab[aria-pressed="true"] {
  background: var(--ls-brand-soft);
  color: var(--ls-brand);
}

.tab:focus-visible {
  outline: 2px solid var(--ls-brand);
  outline-offset: 2px;
}

/* While the tabs take turns, a bar fills along the bottom of the current one. */
.bar {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 3px;
  height: 2px;
  border-radius: 2px;
  background: var(--ls-brand);
  transform-origin: 0 50%;
  animation: ls-bar var(--dur, 4200ms) linear forwards;
}

@keyframes ls-bar {
  from {
    transform: scaleX(0);
  }
}

/* ---------- The two cards ---------- */
.pair {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}

.lc {
  min-width: 0;
  padding: 28px 32px 32px;
  background: #fff;
  border: 1px solid var(--ls-line);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(20, 23, 40, .04), 0 24px 48px -32px rgba(99, 102, 241, .35);
}

.lc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lang {
  font-size: 15px;
  font-weight: 600;
  color: var(--ls-brand);
}

.where {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--ls-brand-soft);
  color: var(--ls-brand);
}

.where .ico {
  width: 15px;
  height: 15px;
}

/* Tall enough for the longest copy, so the cards don't jump as the tabs change. */
.lc-body {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  min-height: 196px;
  margin-top: 18px;
}

.lc-copy {
  flex: 1;
  min-width: 0;
}

.lc small {
  display: block;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .08em;
  color: var(--ls-brand);
}

.lc[lang="ar"] small {
  font-size: 13.5px;
  letter-spacing: 0;
}

.lc h3 {
  margin: 8px 0 0;
  font-size: clamp(22px, 2.3vw, 28px);
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -.01em;
  text-wrap: balance;
}

.lc[lang="ar"] h3 {
  line-height: 1.5;
  letter-spacing: 0;
}

.lc p {
  margin: 10px 0 0;
  font-size: 16px;
  line-height: 1.6;
  color: var(--ls-muted);
}

.lc-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.lc-btns span {
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--ls-brand);
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
}

.lc-btns span.alt {
  background: #fff;
  color: var(--ls-ink);
  border: 1px solid var(--ls-line);
}

.qr {
  flex: none;
  width: 104px;
  height: 104px;
  padding: 8px;
  border: 1px solid var(--ls-line);
  border-radius: 12px;
  fill: var(--ls-ink);
  color: var(--ls-ink);
  stroke-width: 1;
}

/* EN ⇄ AR: the same screen, joined in the middle. */
.link-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #fff;
  border: 1px solid var(--ls-line);
  color: var(--ls-brand);
  box-shadow: 0 8px 20px -10px rgba(99, 102, 241, .5);
  transform: translate(-50%, -50%);
}

.link-dot .ico {
  width: 18px;
  height: 18px;
}

/* Content swap between surfaces. */
.lc-swap-enter-active,
.lc-swap-leave-active {
  transition: opacity .22s ease, transform .3s var(--ls-ease);
}

.lc-swap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.lc-swap-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Tablets and phones: one card above the other. */
@media (max-width: 860px) {
  .pair {
    grid-template-columns: minmax(0, 1fr);
  }

  .link-dot {
    transform: translate(-50%, -50%) rotate(90deg);
  }
}

@media (max-width: 520px) {
  .lc {
    padding: 22px 20px 24px;
  }

  .lc-body {
    flex-direction: column;
    min-height: 0;
  }

  .qr {
    width: 88px;
    height: 88px;
  }

  .tab {
    padding: 8px 11px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lc-swap-enter-active,
  .lc-swap-leave-active {
    transition: none;
  }
}
</style>
