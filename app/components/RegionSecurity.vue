<script setup lang="ts">
/**
 * 09 · Built for the region, secure and ready for scale.
 *
 * One section, two cards side by side (Figma: Region + Security):
 *
 * - Region: multi-language support. A row of language chips (the locales the
 *   platform seeds, plus "more" since staff can add their own) above one app
 *   preview showing the same welcome screen in the chosen language; Arabic lays
 *   out right to left with Arabic numerals. While the card is on screen the
 *   preview takes turns through the languages, pausing while the pointer is over
 *   it; picking a chip stops the turns and holds that language. At rest, with
 *   reduced motion or without JS it shows English.
 * - Security: four short promises about data and access, in a 2 × 2 grid.
 *
 * When the cards scroll into view they rise in one after the other; without JS,
 * with reduced motion, or when they are already on screen at load, they are
 * simply shown. The sample event is Gulf Logistics Expo from utils/events.ts.
 *
 * PLACEHOLDER STAT: "more than 50,000 attendees" - confirm before launch.
 */
const LANGS = [
  {
    key: 'en', label: 'English', name: 'English', dir: 'ltr',
    title: 'Welcome to Gulf Logistics Expo 2026',
    text: '12 – 14 November 2026 · Dubai World Trade Centre',
    cta: 'Show my badge',
  },
  {
    key: 'ar', label: 'العربية', name: 'Arabic', dir: 'rtl',
    title: 'مرحباً بكم في معرض الخليج للخدمات اللوجستية ٢٠٢٦',
    text: '١٢ – ١٤ نوفمبر ٢٠٢٦ · مركز دبي التجاري العالمي',
    cta: 'أظهر بطاقتي',
  },
  {
    key: 'fr', label: 'Français', name: 'French', dir: 'ltr',
    title: 'Bienvenue au Gulf Logistics Expo 2026',
    text: '12 – 14 novembre 2026 · Dubai World Trade Centre',
    cta: 'Afficher mon badge',
  },
  {
    key: 'es', label: 'Español', name: 'Spanish', dir: 'ltr',
    title: 'Bienvenido a Gulf Logistics Expo 2026',
    text: '12 – 14 de noviembre de 2026 · Dubai World Trade Centre',
    cta: 'Mostrar mi acreditación',
  },
  {
    key: 'bn', label: 'বাংলা', name: 'Bengali', dir: 'ltr',
    title: 'গাল্ফ লজিস্টিকস এক্সপো ২০২৬-এ স্বাগতম',
    text: '১২ – ১৪ নভেম্বর ২০২৬ · দুবাই ওয়ার্ল্ড ট্রেড সেন্টার',
    cta: 'আমার ব্যাজ দেখান',
  },
] as const

const POINTS = [
  { icon: 'lucide:shield-check', title: 'Isolated data', text: 'Each organization\'s data is kept apart at the database level.' },
  { icon: 'lucide:lock', title: 'Secure badges', text: 'Encrypted QR tokens stop copied or shared badges at the gate.' },
  { icon: 'lucide:key-round', title: 'Role-based access', text: 'Choose exactly which pages each staff member can view, edit or export.' },
  { icon: 'lucide:server', title: 'Tested at scale', text: 'Already running single events with more than 50,000 attendees.' },
]

/* ---------- The preview takes turns through the languages while on screen ---------- */
const current = ref(0)
const lang = computed(() => LANGS[current.value]!)
const hovered = ref(false)
/** Once someone picks a language, it stays put. */
const picked = ref(false)
const tl = useTimeline()

function turns() {
  if (picked.value) return
  tl.run(async (wait) => {
    while (true) {
      await wait(3200)
      // Hold still while someone is reading it.
      while (hovered.value) await wait(400)
      current.value = (current.value + 1) % LANGS.length
    }
  })
}

function pick(i: number) {
  picked.value = true
  tl.cancel()
  current.value = i
}

const langs = ref<HTMLElement | null>(null)
usePlayInView(langs, { play: turns, pause: tl.cancel })

/* ---------- Reveal ---------- */
const grid = ref<HTMLElement | null>(null)
const animate = ref(false)
const revealed = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const el = grid.value
  if (!el || !('IntersectionObserver' in window)) return
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
})
</script>

<template>
  <section id="region" class="rs" aria-label="Built for the region, secure and ready for scale">
    <div class="rs-rail">
      <div ref="grid" class="rs-grid" :class="{ 'rs--animate': animate, in: revealed }">
        <!-- Region -->
        <article class="card" style="--i: 0" aria-labelledby="rs-region">
          <i class="ring" aria-hidden="true" />
          <header class="head">
            <span class="tile"><Icon name="lucide:globe" class="ico" /></span>
            <div>
              <p class="eyebrow">Built for the region</p>
              <h2 id="rs-region" class="title">Every language your attendees speak</h2>
            </div>
          </header>
          <p class="desc">Run one event in English, Arabic, French, Spanish, Bengali and more. Each attendee picks their language, and right-to-left scripts like Arabic lay out properly: the website, the app, the emails and the printed badges.</p>

          <div
            ref="langs"
            class="langs"
            @mouseenter="hovered = true"
            @mouseleave="hovered = false"
          >
            <div class="chips" role="group" aria-label="Preview a language">
              <button
                v-for="(l, i) in LANGS"
                :key="l.key"
                type="button"
                class="chip"
                :class="{ on: i === current }"
                :lang="l.key"
                :aria-pressed="i === current"
                @click="pick(i)"
              >
                {{ l.label }}
              </button>
              <span class="chip chip-more"><Icon name="lucide:plus" class="ico" />More</span>
            </div>

            <div class="preview">
              <div class="preview-bar">
                <span><Icon name="lucide:smartphone" class="ico" />Attendee app</span>
                <span class="tag">{{ lang.name }} · {{ lang.dir === 'rtl' ? 'Right to left' : 'Left to right' }}</span>
              </div>
              <Transition name="rs-swap" mode="out-in">
                <div :key="lang.key" class="lang-copy" :lang="lang.key" :dir="lang.dir">
                  <b>{{ lang.title }}</b>
                  <p>{{ lang.text }}</p>
                  <span class="cta">{{ lang.cta }}</span>
                </div>
              </Transition>
            </div>
          </div>
        </article>

        <!-- Security -->
        <article id="security" class="card" style="--i: 1" aria-labelledby="rs-security">
          <i class="ring" aria-hidden="true" />
          <header class="head">
            <span class="tile"><Icon name="lucide:shield-check" class="ico" /></span>
            <div>
              <p class="eyebrow">Security</p>
              <h2 id="rs-security" class="title">Ready for government and enterprise IT reviews</h2>
            </div>
          </header>
          <p class="desc">Large events carry a lot of personal data. This is how we look after it.</p>

          <ul class="points">
            <li v-for="p in POINTS" :key="p.title" class="point">
              <span class="ptile"><Icon :name="p.icon" class="ico" /></span>
              <div>
                <h3>{{ p.title }}</h3>
                <p>{{ p.text }}</p>
              </div>
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.rs {
  --rs-brand: var(--color-brand, #6366f1);
  --rs-brand-200: #c7d2fe;
  --rs-ink: var(--color-ink, #1f2430);
  --rs-muted: var(--color-muted, #6b7280);
  --rs-line: #ebe9f5;
  --rs-tint: #f4f2fd;
  --rs-ease: cubic-bezier(.22, .8, .24, 1);
  color: var(--rs-ink);
  background: #fff;
}

.rs-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(56px, 7vw, 88px) clamp(12px, 3vw, 40px);
}

.rs-grid {
  display: grid;
  grid-template-columns: minmax(0, 969fr) minmax(0, 875fr);
  gap: 22px;
}

/* ---------- Card ---------- */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 28px;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--rs-line);
  border-radius: 12px;
}

/* A soft disc in a ring, behind the top right corner. */
.ring {
  position: absolute;
  right: -78px;
  top: -40px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: var(--rs-tint);
  box-shadow: 0 0 0 26px #faf9fe;
  pointer-events: none;
}

.head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 15px;
}

.tile {
  width: 52px;
  height: 52px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: #fff;
  background: var(--rs-brand);
  box-shadow: 0 12px 22px -12px rgba(99, 102, 241, .65);
}

.tile .ico {
  width: 24px;
  height: 24px;
}

.eyebrow {
  margin: 0;
  font-size: 15.5px;
  font-weight: 500;
  color: var(--rs-brand);
}

.title {
  margin: 2px 0 0;
  font-size: clamp(21px, 2vw, 25px);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -.02em;
}

.desc {
  position: relative;
  margin: 22px 0 0;
  max-width: 500px;
  font-size: 16.5px;
  line-height: 1.6;
  color: var(--rs-muted);
}

/* ---------- Region: language chips over one app preview ---------- */
.langs {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: auto;
  padding-top: 32px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 13px;
  font: inherit;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--rs-ink);
  background: #fff;
  border: 1px solid var(--rs-line);
  border-radius: 999px;
  cursor: pointer;
  transition: color .25s, background-color .25s, border-color .25s;
}

.chip:hover {
  border-color: var(--rs-brand-200);
}

.chip:focus-visible {
  outline: 2px solid var(--rs-brand);
  outline-offset: 2px;
}

.chip.on {
  color: #fff;
  background: var(--rs-brand);
  border-color: var(--rs-brand);
}

.chip-more {
  color: var(--rs-muted);
  border-style: dashed;
  cursor: default;
}

.chip-more:hover {
  border-color: var(--rs-line);
}

.chip-more .ico {
  width: 14px;
  height: 14px;
}

.preview {
  min-width: 0;
  min-height: 196px;
  padding: 14px 18px 18px;
  background: var(--rs-tint);
  border: 1px solid #e8e5f6;
  border-radius: 11px;
}

.preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e5f6;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rs-muted);
}

.preview-bar > span:first-child {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.preview-bar .ico {
  width: 14px;
  height: 14px;
}

.tag {
  padding: 2px 8px;
  color: var(--rs-brand);
  background: #fff;
  border-radius: 6px;
  white-space: nowrap;
}

.lang-copy {
  margin-top: 14px;
}

.lang-copy b {
  display: block;
  font-size: 16.5px;
  font-weight: 700;
  line-height: 1.4;
}

.lang-copy p {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--rs-muted);
}

.cta {
  display: inline-block;
  margin-top: 14px;
  padding: 7px 13px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: var(--rs-brand);
  border-radius: 8px;
}

/* Arabic reads a touch larger at the same size. */
.lang-copy[dir="rtl"] b {
  font-size: 17px;
}

/* Each language rises in as the last one fades out. */
.rs-swap-enter-active {
  transition: opacity .45s var(--rs-ease), transform .5s var(--rs-ease);
}

.rs-swap-leave-active {
  transition: opacity .2s ease, transform .25s ease;
}

.rs-swap-enter-from { opacity: 0; transform: translateY(8px); }
.rs-swap-leave-to { opacity: 0; transform: translateY(-6px); }

/* ---------- Security: four promises, 2 × 2 ---------- */
.points {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.point {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
  padding: 10px;
  background: #fff;
  border: 1px solid var(--rs-line);
  border-radius: 11px;
  transition: border-color .25s, box-shadow .3s;
}

.point:hover {
  border-color: var(--rs-brand-200);
  box-shadow: 0 18px 36px -26px rgba(99, 102, 241, .45);
}

.ptile {
  width: 35px;
  height: 35px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: var(--rs-brand);
  background: var(--rs-tint);
  transition: color .25s, background-color .25s;
}

.point:hover .ptile {
  color: #fff;
  background: var(--rs-brand);
}

.ptile .ico {
  width: 16px;
  height: 16px;
}

.point h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
}

.point p {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--rs-muted);
}

/* ---------- Reveal: the cards rise in one after the other ---------- */
.rs--animate .card {
  opacity: 0;
  transform: translateY(26px);
  filter: blur(4px);
  transition: opacity .8s var(--rs-ease), transform .8s var(--rs-ease), filter .8s var(--rs-ease);
  transition-delay: calc(var(--i, 0) * 120ms);
}

.rs--animate.in .card {
  opacity: 1;
  transform: none;
  filter: none;
}

/* Tablets and phones: the cards stack. */
@media (max-width: 1023px) {
  .rs-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .langs {
    margin-top: 0;
  }
}

@media (max-width: 600px) {
  .card {
    padding: 24px 18px 20px;
  }

  .tile {
    width: 46px;
    height: 46px;
  }

  .tile .ico {
    width: 21px;
    height: 21px;
  }

  .points {
    grid-template-columns: minmax(0, 1fr);
  }

  .preview {
    min-height: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rs-swap-enter-active,
  .rs-swap-leave-active,
  .chip,
  .point,
  .ptile {
    transition: none;
  }
}
</style>
