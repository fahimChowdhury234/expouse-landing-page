<script setup lang="ts">
/**
 * 07 · Mobile apps.
 *
 * The two EXPOUSE apps, one row each (Figma: Mobile apps; content from
 * expouse-landing/index.html, 06 Apps): what the app is for and six things it
 * does, next to a panel of its real screens. The attendee app shows the
 * delegates, home and badge screens fanned out; the scanner app shows its home
 * and a captured lead. The rows alternate sides, and stack (text first) on
 * tablets and phones.
 *
 * The screens are drawn in HTML at a fixed design size (components/phone) and
 * scaled to the panel, so they stay sharp and true at every width. Each row
 * rises in when it scrolls into view; without JS, with reduced motion, or when
 * a row is already on screen at load, it is simply shown.
 *
 * Both panels are interactive. Attendee: the front phone is a live screen (it
 * scrolls, its tabs switch screens, its buttons respond; see AttendeeScreen);
 * click a side phone (or a chip under the phones) to bring that screen to the
 * front. While nobody has touched it and it is on screen, it turns to the next
 * screen every few seconds (pausing under the pointer), and Home and Delegates
 * glide down and back up to show they scroll. Scanner: a whole scan plays out
 * (camera, lock-on, numbers tick, the lead captured; see runScan), over and
 * over while on screen; its buttons and the chip scan by hand. With reduced
 * motion nothing turns or plays by itself.
 *
 * This is the page's #apps section (the nav's "Apps" link and the attendee
 * card's "See the attendee app" land here).
 */
import { INITIAL_RECENT, SCAN_LEADS, type ScanLead } from '~/utils/scannerDemo'

type AppKey = 'attendee' | 'scanner'

const APPS: {
  key: AppKey
  icon: string
  tagline: string
  title: string
  text: string
  /** Describes the screens panel for screen readers. */
  label: string
  features: { icon: string, title: string, text: string }[]
}[] = [
  {
    key: 'attendee',
    icon: 'lucide:smartphone',
    tagline: 'Attendee app',
    title: 'The whole event on their phone',
    text: 'Attendees sign in once and carry their agenda, badge, chats and live sessions with them, in English or Arabic.',
    label: 'Sample attendee app screens: the delegates list, the event home and a digital badge',
    features: [
      { icon: 'lucide:calendar', title: 'Agenda & speakers', text: 'Save sessions and get reminders' },
      { icon: 'lucide:users', title: 'Networking', text: 'See who\'s online, chat and book meetings' },
      { icon: 'lucide:video', title: 'Lounge & rooms', text: 'Join live video tables and breakouts' },
      { icon: 'lucide:store', title: 'Exhibitors', text: 'Browse booths, chat and bookmark' },
      { icon: 'lucide:trophy', title: 'Leaderboard & contests', text: 'Earn points for taking part' },
      { icon: 'lucide:scan-line', title: 'Digital badge', text: 'QR badge ready at every gate' },
    ],
  },
  {
    key: 'scanner',
    icon: 'lucide:scan-line',
    tagline: 'Scanner app',
    title: 'One staff app for gates and booths',
    text: 'Gate staff use it to check people in and exhibitors use it to collect leads. Nobody needs an account: staff sign in with a username and the event access code.',
    label: 'Sample scanner app screens: the scanner home with today\'s leads, and a lead just captured with its qualifying answers',
    features: [
      { icon: 'lucide:check', title: 'Instant check-in', text: 'Green, yellow or red result in a second' },
      { icon: 'lucide:store', title: 'Lead capture', text: 'Rate leads, add notes and answer questions' },
      { icon: 'lucide:server', title: 'Works offline', text: 'Scans queue up and sync automatically' },
      { icon: 'lucide:printer', title: 'Print on arrival', text: 'Print the badge right after check-in' },
      { icon: 'lucide:users', title: 'Team join', text: 'Staff join with their name and the event code' },
      { icon: 'lucide:chart-column', title: 'Live stats', text: 'Scans per gate and staff leaderboard' },
    ],
  },
]

/* ---------------- Attendee: three screens, one in front ---------------- */
type AttScreen = 'delegates' | 'home' | 'badge'
/** Clockwise order around the fan: the one after the front sits on the right. */
const ATT: AttScreen[] = ['delegates', 'home', 'badge']
const ATT_LABEL: Record<AttScreen, string> = { delegates: 'Delegates', home: 'Home', badge: 'My badge' }
/** Time on each screen before the next turn: long enough for Home / Delegates to glide down and back up. */
const ROTATE_MS: Record<AttScreen, number> = { home: 9500, delegates: 9500, badge: 4500 }

const front = ref<AttScreen>('home')
function slotOf(s: AttScreen): 'front' | 'left' | 'right' {
  const f = ATT.indexOf(front.value)
  if (s === front.value) return 'front'
  return ATT[(f + 1) % 3] === s ? 'right' : 'left'
}

/** Auto-turn runs while the panel is on screen, not hovered, and nobody has picked a screen yet. */
const touched = ref(false)
const hovering = ref(false)
const attOnScreen = ref(false)
let reduced = false
let timer: ReturnType<typeof setTimeout> | null = null

function pick(s: AttScreen) {
  touched.value = true
  front.value = s
}

/**
 * A click on a side phone brings it forward. A side phone's screen ignores the pointer, so its
 * clicks land on the phone itself; a click from a control inside the live phone (say a tab that
 * just changed `front`, and the slots with it) has a target inside the screen and is left alone.
 */
function onPhoneClick(e: MouseEvent, s: AttScreen) {
  if (e.target === e.currentTarget) pick(s)
}

/** Enter / Space on a side phone (not on a control inside the live one) brings it forward. */
function onPhoneKey(e: KeyboardEvent, s: AttScreen) {
  if (e.target !== e.currentTarget || slotOf(s) === 'front') return
  if (e.key !== 'Enter' && e.key !== ' ') return
  e.preventDefault()
  pick(s)
}

/** One turn at a time: each new front (or pause / resume) restarts the wait for that screen. */
watchEffect(() => {
  if (timer) clearTimeout(timer)
  timer = null
  const run = attOnScreen.value && !hovering.value && !touched.value && !reduced
  if (!run) return
  const now = front.value
  timer = setTimeout(() => {
    front.value = ATT[(ATT.indexOf(now) + 1) % 3]!
  }, ROTATE_MS[now])
})

/* ---------------- Scanner: a scan, start to finish ---------------- */
/**
 * One scan: the home phone opens the camera on the next sample lead's badge, locks on,
 * and closes; then the numbers tick, the lead joins Recent scans, and the lead phone
 * replays its capture for them. While on screen and untouched it repeats every few
 * seconds; Open scanner, the Scan tab, Scan next lead and the chip run one by hand.
 */
const scan = reactive({
  camera: 'off' as 'off' | 'scan' | 'found',
  count: 23,
  hot: 8,
  recent: [...INITIAL_RECENT] as ScanLead[],
  /** On the lead phone. */
  lead: SCAN_LEADS[0]!,
  /** In front of the camera. */
  target: SCAN_LEADS[1]!,
  /** Bumped to replay the lead phone's capture; 0 = still (no JS yet). */
  play: 0,
})
let nextLead = 1
let scanning = false
/** The scanner phones respond (buttons, beam) once the page is running. */
const scanLive = ref(false)
const scanOnScreen = ref(false)
const scanTouched = ref(false)
let scanTimer: ReturnType<typeof setTimeout> | null = null

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

async function runScan() {
  if (scanning) return
  scanning = true
  const who = SCAN_LEADS[nextLead++ % SCAN_LEADS.length]!
  scan.target = who
  scan.camera = 'scan'
  await wait(reduced ? 500 : 1900)
  scan.camera = 'found'
  await wait(reduced ? 300 : 800)
  scan.camera = 'off'
  scan.lead = who
  scan.play++
  scan.count++
  if (who.rating === 'Hot') scan.hot++
  scan.recent = [who, ...scan.recent.filter(r => r.name !== who.name)].slice(0, 3)
  scanning = false
}

const autoScan = () => scanOnScreen.value && !scanTouched.value && !reduced

function scheduleScan(ms: number) {
  if (scanTimer) clearTimeout(scanTimer)
  scanTimer = setTimeout(async () => {
    await runScan()
    if (autoScan()) scheduleScan(6500)
  }, ms)
}

watch([scanOnScreen, scanTouched], () => {
  if (autoScan()) scheduleScan(700)
  else if (scanTimer) clearTimeout(scanTimer)
})

/** A scan asked for by hand: from then on the demo waits for the visitor. */
function scanNow() {
  scanTouched.value = true
  runScan()
}

/** Design size of each screens panel; the phones inside are 250 × 530. */
const STAGE_W = 560
const STAGE_H = 556

/* ---------------- Reveal, per row ---------------- */
type Reveal = 'static' | 'hidden' | 'in'
const reveal = ref<Reveal[]>(APPS.map(() => 'static'))
const rowEls: HTMLElement[] = []
const setRow = (i: number) => (el: unknown) => {
  if (el) rowEls[i] = el as HTMLElement
}
let observer: IntersectionObserver | null = null
let visObserver: IntersectionObserver | null = null
const attVis = ref<HTMLElement | null>(null)
const setAttVis = (el: unknown) => {
  attVis.value = (el as HTMLElement | null) ?? null
}
const scanVis = ref<HTMLElement | null>(null)
const setScanVis = (el: unknown) => {
  scanVis.value = (el as HTMLElement | null) ?? null
}

onMounted(() => {
  scanLive.value = true
  if (!('IntersectionObserver' in window)) return
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // The demos run only while their phones are on screen.
  visObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.target === attVis.value) attOnScreen.value = e.isIntersecting
      else if (e.target === scanVis.value) scanOnScreen.value = e.isIntersecting
    }
  }, { threshold: 0.4 })
  if (attVis.value) visObserver.observe(attVis.value)
  if (scanVis.value) visObserver.observe(scanVis.value)

  if (reduced) return

  observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      reveal.value[rowEls.indexOf(e.target as HTMLElement)] = 'in'
      observer?.unobserve(e.target)
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 })

  rowEls.forEach((el, i) => {
    // Already on screen (a tall window, a restored scroll): leave it be rather than hide it.
    if (el.getBoundingClientRect().top < window.innerHeight) return
    reveal.value[i] = 'hidden'
    observer!.observe(el)
  })
})

onBeforeUnmount(() => {
  observer?.disconnect()
  visObserver?.disconnect()
  if (timer) clearTimeout(timer)
  if (scanTimer) clearTimeout(scanTimer)
})
</script>

<template>
  <section id="apps" class="ma" aria-labelledby="ma-title">
    <div class="ma-rail">
      <header class="ma-head">
        <p class="ma-eyebrow">Mobile apps</p>
        <h2 id="ma-title" class="ma-title">Two apps for the day itself</h2>
        <p class="ma-sub">One app for your attendees, one for your gate staff and exhibitors. Both on iOS and Android, both connected to the same event.</p>
      </header>

      <div class="ma-rows">
        <article
          v-for="(app, i) in APPS"
          :key="app.key"
          :ref="setRow(i)"
          class="row"
          :class="[reveal[i], { flip: i % 2 === 1 }]"
          :aria-labelledby="`ma-${app.key}`"
        >
          <div class="txt">
            <p class="tagline">
              <Icon :name="app.icon" class="ico" />
              {{ app.tagline }}
            </p>
            <h3 :id="`ma-${app.key}`" class="app-title">{{ app.title }}</h3>
            <p class="app-text">{{ app.text }}</p>

            <ul class="feats">
              <li v-for="f in app.features" :key="f.title">
                <span class="tile">
                  <Icon :name="f.icon" class="ico" />
                </span>
                <div>
                  <b>{{ f.title }}</b>
                  <span>{{ f.text }}</span>
                </div>
              </li>
            </ul>
          </div>

          <div
            v-if="app.key === 'attendee'"
            :ref="setAttVis"
            class="vis"
            role="group"
            :aria-label="app.label"
            @mouseenter="hovering = true"
            @mouseleave="hovering = false"
            @pointerdown="touched = true"
            @focusin="touched = true"
          >
            <PhoneStage :width="STAGE_W" :height="STAGE_H">
              <!-- Side phones are buttons (their screens inert); the front one is the live screen. -->
              <div
                v-for="s in ATT"
                :key="s"
                class="ph att"
                :class="slotOf(s)"
                :role="slotOf(s) === 'front' ? undefined : 'button'"
                :tabindex="slotOf(s) === 'front' ? undefined : 0"
                :aria-label="slotOf(s) === 'front' ? undefined : `Show the ${ATT_LABEL[s]} screen`"
                @click="onPhoneClick($event, s)"
                @keydown="onPhoneKey($event, s)"
              >
                <span class="ph-in" :inert="slotOf(s) === 'front' ? undefined : ''">
                  <PhoneAttendeeScreen
                    :screen="s"
                    :time="slotOf(s) === 'front' ? '12:30' : '9:41'"
                    :interactive="slotOf(s) === 'front'"
                    :auto-scroll="slotOf(s) === 'front' && attOnScreen && !touched"
                    @navigate="pick"
                  />
                </span>
              </div>
            </PhoneStage>
            <div class="chips">
              <button
                v-for="s in ATT"
                :key="s"
                type="button"
                class="chip"
                :class="{ on: front === s }"
                :aria-pressed="front === s"
                @click="pick(s)"
              >
                {{ ATT_LABEL[s] }}
              </button>
            </div>
          </div>

          <div v-else :ref="setScanVis" class="vis" role="group" :aria-label="app.label" @pointerdown="scanTouched = true">
            <PhoneStage :width="STAGE_W" :height="STAGE_H">
              <div class="ph pair first">
                <span class="ph-in">
                  <PhoneScannerScreen
                    screen="home"
                    :interactive="scanLive"
                    :camera="scan.camera"
                    :count="scan.count"
                    :hot="scan.hot"
                    :recent="scan.recent"
                    :lead="scan.target"
                    @scan="scanNow"
                  />
                </span>
              </div>
              <div class="ph pair second">
                <span class="ph-in">
                  <PhoneScannerScreen screen="lead" :interactive="scanLive" :lead="scan.lead" :play="scan.play" @scan="scanNow" />
                </span>
              </div>
            </PhoneStage>
            <div class="chips">
              <button type="button" class="chip on" @click="scanNow">
                <Icon name="lucide:scan-line" class="ico" />Scan a badge
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.ma {
  --ma-brand: var(--color-brand, #6452E7 );
  --ma-brand-soft: var(--color-brand-soft, #eef2ff);
  --ma-ink: var(--color-ink, #1f2430);
  --ma-muted: var(--color-muted, #6b7280);
  --ma-line: var(--color-line, #e8e9ee);
  --ma-ease: cubic-bezier(.22, .8, .24, 1);
  color: var(--ma-ink);
  border-top: 1px solid #E6E5F2
}

/* Same rail and gutter as the sections above. */
.ma-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(56px, 7vw, 88px) clamp(12px, 3vw, 40px);
}

/* ---------- Heading ---------- */
.ma-head {
  max-width: 720px;
  margin: 0 auto clamp(40px, 6vw, 80px);
  text-align: center;
}

.ma-eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ma-brand);
}

.ma-title {
  margin: 8px 0 0;
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.03em;
  text-wrap: balance;
}

.ma-sub {
  margin: 12px auto 0;
  max-width: 680px;
  font-size: 17px;
  line-height: 1.6;
  color: var(--ma-muted);
}

/* ---------- Rows: text beside the screens, alternating sides ---------- */
.ma-rows {
  display: grid;
  gap: clamp(64px, 9vw, 112px);
}

.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  align-items: center;
  gap: clamp(32px, 5vw, 72px);
}

/* Mirrored row: the screens take the left (and wider) column. */
.row.flip {
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
}

.row.flip .txt {
  order: 2;
}

.tagline {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ma-brand);
}

.tagline .ico {
  width: 20px;
  height: 20px;
}

.app-title {
  max-width: 16ch;
  margin: 14px 0 0;
  font-size: clamp(28px, 3vw, 38px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.03em;
  text-wrap: balance;
}

.app-text {
  max-width: 52ch;
  margin: 16px 0 0;
  font-size: 17px;
  line-height: 1.65;
  color: var(--ma-muted);
}

.feats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px 28px;
  margin: 32px 0 0;
  padding: 0;
  list-style: none;
}

.feats li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.tile {
  flex: none;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: var(--ma-brand-soft);
  color: var(--ma-brand);
}

.tile .ico {
  width: 20px;
  height: 20px;
}

.feats b {
  display: block;
  font-size: 16.5px;
  line-height: 1.3;
}

.feats li span:not(.tile) {
  display: block;
  margin-top: 3px;
  font-size: 15px;
  line-height: 1.45;
  color: var(--ma-muted);
}

/* ---------- Screens panel ---------- */
.vis {
  min-width: 0;
  padding: clamp(16px, 2.4vw, 28px);
  border-radius: 12px;
  background:
    radial-gradient(60% 55% at 50% 40%, rgba(255, 255, 255, .7), transparent 75%),
    var(--ma-brand-soft);
}

/* Phone slots on the 560 × 556 stage. The slot (position, size) is on .ph, the reveal on .ph-in. */
.ph {
  position: absolute;
  top: 13px;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: inherit;
  cursor: pointer;
  border-radius: 36px;
}

.ph:focus-visible {
  outline: 3px solid var(--ma-brand);
  outline-offset: 4px;
}

.ph-in {
  display: block;
  transition: transform .35s var(--ma-ease);
}

/* Attendee: the phones swap slots, gliding between them; the front one sits on top. */
.ph.att {
  transition: left .7s var(--ma-ease), top .7s var(--ma-ease), scale .7s var(--ma-ease), filter .7s ease;
}

.ph.left,
.ph.right {
  top: 40px;
  scale: .9;
  z-index: 1;
  filter: saturate(.9) brightness(.98);
}

.ph.left {
  left: 10px;
}

.ph.right {
  left: 300px;
}

.ph.front {
  left: 155px;
  top: 8px;
  z-index: 2;
  cursor: default;
}

/* Side phones take the click themselves; their screens are only a picture. */
.ph.left .ph-in,
.ph.right .ph-in {
  pointer-events: none;
}

/* A side phone lifts toward you under the pointer. */
.ph.left:hover .ph-in,
.ph.right:hover .ph-in,
.ph.pair:hover .ph-in {
  transform: translateY(-8px);
}

/* Chips under the phones: which screen is in front, or scan again. */
.chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid rgba(100, 82, 231, .18);
  border-radius: 999px;
  background: #fff;
  font: inherit;
  font-size: 13.5px;
  font-weight: 650;
  color: var(--ma-muted);
  cursor: pointer;
  transition: background .25s ease, color .25s ease, border-color .25s ease;
}

.chip:hover {
  color: var(--ma-brand);
  border-color: rgba(100, 82, 231, .4);
}

.chip.on {
  background: var(--ma-brand);
  border-color: var(--ma-brand);
  color: #fff;
}

.chip .ico {
  width: 15px;
  height: 15px;
}

.chip:focus-visible {
  outline: 3px solid var(--ma-brand);
  outline-offset: 2px;
}

.ph.pair {
  cursor: default;
}

.ph.first {
  left: 22px;
}

.ph.second {
  left: 288px;
}

/* ---------- Reveal: the text rises in, the phones follow ---------- */
.row.hidden .txt,
.row.hidden .ph-in {
  opacity: 0;
}

.row.hidden .txt {
  translate: 0 24px;
  filter: blur(4px);
}

.row.hidden .ph-in {
  translate: 0 40px;
}

.row.in .txt {
  transition: opacity .8s var(--ma-ease), translate .8s var(--ma-ease), filter .8s var(--ma-ease);
}

.row.in .ph-in {
  transition: opacity .8s var(--ma-ease), translate .9s var(--ma-ease), transform .35s var(--ma-ease);
  transition-delay: .15s, .15s, 0s;
}

.row.in .ph.front .ph-in,
.row.in .ph.second .ph-in {
  transition-delay: .3s, .3s, 0s;
}

@media (prefers-reduced-motion: reduce) {
  .ph.att,
  .ph-in {
    transition: none;
  }
}

/* Tablets and phones: text first, screens below. */
@media (max-width: 1024px) {
  .row,
  .row.flip {
    grid-template-columns: minmax(0, 1fr);
  }

  .row.flip .txt {
    order: 0;
  }

  .app-title {
    max-width: none;
  }

  .vis {
    width: 100%;
    max-width: 620px;
    margin-inline: auto;
  }
}

@media (max-width: 560px) {
  .feats {
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;
  }
}
</style>
