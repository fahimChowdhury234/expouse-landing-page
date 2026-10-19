<script setup lang="ts">
/**
 * 09 · Built for the region, secure and ready for scale.
 *
 * One section, two cards side by side (Figma: Region + Security):
 *
 * - Region: English and Arabic support, with the same screen in both languages
 *   in two small cards, the Arabic one right to left with Arabic numerals. While
 *   the card is on screen the pair takes turns through the places attendees meet
 *   the language (the app, the event website, emails, the printed badge),
 *   pausing while the pointer is over it. At rest, with reduced motion or
 *   without JS it shows the app's welcome, as in the Figma frame.
 * - Security: four short promises about data and access, in a 2 × 2 grid.
 *
 * When the cards scroll into view they rise in one after the other; without JS,
 * with reduced motion, or when they are already on screen at load, they are
 * simply shown. The sample event is Gulf Logistics Expo from utils/events.ts.
 *
 * PLACEHOLDER STAT: "more than 50,000 attendees" - confirm before launch.
 */
type Copy = { title: string, text: string }

const SURFACES: { en: Copy, ar: Copy }[] = [
  {
    en: { title: 'Welcome to Gulf Logistics Expo 2026', text: 'Your badge is ready. Show this QR code at any gate.' },
    ar: { title: 'مرحباً بكم في معرض الخليج للخدمات اللوجستية ٢٠٢٦', text: 'بطاقتك جاهزة. أظهر رمز QR عند أي بوابة.' },
  },
  {
    en: { title: 'Register for Gulf Logistics Expo 2026', text: '12 – 14 November 2026 · Dubai World Trade Centre' },
    ar: { title: 'سجّل في معرض الخليج للخدمات اللوجستية ٢٠٢٦', text: '١٢ – ١٤ نوفمبر ٢٠٢٦ · مركز دبي التجاري العالمي' },
  },
  {
    en: { title: 'Your registration is confirmed', text: 'See you on 12 November. Your QR badge is attached.' },
    ar: { title: 'تم تأكيد تسجيلك', text: 'نراك في ١٢ نوفمبر. بطاقة QR الخاصة بك مرفقة.' },
  },
  {
    en: { title: 'Sara Ali', text: 'Visitor · Fleetly. Printed at Kiosk 3 in 4 seconds.' },
    ar: { title: 'سارة علي', text: 'زائر · فليتلي. طُبعت في الكشك ٣ خلال ٤ ثوانٍ.' },
  },
]

const LANGS = [
  { key: 'en', label: 'English', dir: 'ltr' },
  { key: 'ar', label: 'العربية', dir: 'rtl' },
] as const

const POINTS = [
  { icon: 'lucide:shield-check', title: 'Isolated data', text: 'Each organization\'s data is kept apart at the database level.' },
  { icon: 'lucide:lock', title: 'Secure badges', text: 'Encrypted QR tokens stop copied or shared badges at the gate.' },
  { icon: 'lucide:key-round', title: 'Role-based access', text: 'Choose exactly which pages each staff member can view, edit or export.' },
  { icon: 'lucide:server', title: 'Tested at scale', text: 'Already running single events with more than 50,000 attendees.' },
]

/* ---------- The language pair takes turns while on screen ---------- */
const current = ref(0)
const surface = computed(() => SURFACES[current.value]!)
const hovered = ref(false)
const tl = useTimeline()

function turns() {
  tl.run(async (wait) => {
    while (true) {
      await wait(4200)
      // Hold still while someone is reading it.
      while (hovered.value) await wait(400)
      current.value = (current.value + 1) % SURFACES.length
    }
  })
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
              <h2 id="rs-region" class="title">Arabic and English, done properly</h2>
            </div>
          </header>
          <p class="desc">Switch everything to Arabic and it lays out right to left: the website, the app, the emails and the printed badges.</p>

          <div
            ref="langs"
            class="langs"
            @mouseenter="hovered = true"
            @mouseleave="hovered = false"
          >
            <div v-for="l in LANGS" :key="l.key" class="lang" :lang="l.key" :dir="l.dir">
              <span class="pill">{{ l.label }}</span>
              <Transition :name="`rs-swap-${l.dir}`" mode="out-in">
                <div :key="current" class="lang-copy">
                  <b>{{ surface[l.key].title }}</b>
                  <p>{{ surface[l.key].text }}</p>
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

/* ---------- Region: the same screen in English and Arabic ---------- */
.langs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: auto;
  padding-top: 32px;
}

.lang {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  min-height: 158px;
  padding: 17px 17px 18px;
  background: var(--rs-tint);
  border: 1px solid #e8e5f6;
  border-radius: 11px;
}

.pill {
  padding: 3px 8px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: #fff;
  background: var(--rs-brand);
  border-radius: 6px;
}

.lang-copy {
  margin-top: 12px;
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

/* Arabic reads a touch larger at the same size. */
.lang[dir="rtl"] .lang-copy b {
  font-size: 17px;
}

/* A new screen slides in from where its language reads from. */
.rs-swap-ltr-enter-active,
.rs-swap-rtl-enter-active {
  transition: opacity .45s var(--rs-ease), transform .5s var(--rs-ease);
}

.rs-swap-ltr-leave-active,
.rs-swap-rtl-leave-active {
  transition: opacity .2s ease, transform .25s ease;
}

.rs-swap-ltr-enter-from { opacity: 0; transform: translateX(-12px); }
.rs-swap-ltr-leave-to { opacity: 0; transform: translateX(8px); }
.rs-swap-rtl-enter-from { opacity: 0; transform: translateX(12px); }
.rs-swap-rtl-leave-to { opacity: 0; transform: translateX(-8px); }

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

  .langs,
  .points {
    grid-template-columns: minmax(0, 1fr);
  }

  .lang {
    min-height: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rs-swap-ltr-enter-active,
  .rs-swap-rtl-enter-active,
  .rs-swap-ltr-leave-active,
  .rs-swap-rtl-leave-active,
  .point,
  .ptile {
    transition: none;
  }
}
</style>
