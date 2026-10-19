<script setup lang="ts">
/**
 * 08 · Branded app.
 *
 * The attendee app as the organizer's own app (Figma: Branded app; the brand
 * picker comes from expouse-landing/index.html, the brand band). On the left,
 * what can be branded and a "Try a brand" picker; on the right, a phone home
 * screen with the event's app icon next to the app itself, white-labelled with
 * the event's logo, name and colours.
 *
 * Picking a brand plays the switch the way an attendee would see it: the app
 * icon fills with the new colour, the event's splash screen pours across the
 * phone, and it lifts to show the app re-themed. While the section is on screen
 * the brands take turns by themselves (a ring fills around the current swatch);
 * once the visitor picks one, it stays. With reduced motion there is no
 * autoplay and a pick switches straight away.
 *
 * The home-screen icons open too, each in the event's brand: Mail shows the
 * event's registration email with the badge (phone/BrandedMail), Maps the venue
 * map walking from the gate to a booth (phone/VenueMap), and the event's icon
 * goes back to the app. Mail and Maps pulse gently until one is opened.
 */
import { SAMPLE_EVENTS } from '~/utils/events'

const BRANDS = SAMPLE_EVENTS

const FEATURES = [
  'Your app name, icon and splash screen',
  'Your brand colors on every screen',
  'Choose which tabs show and in what order',
  'Your own help screens and in-app banner',
  'Your own App Store and Google Play links',
]

/** Time each brand is shown while the brands take turns (also the swatch ring's fill time). */
const AUTO_MS = 3800
/** The switch: splash pours in, holds, then lifts. */
const SPLASH_IN = 650
const SPLASH_HOLD = 700
const SPLASH_OUT = 420
/** Design size of the preview (components/phone draws the phone at 250 × 530). */
const STAGE_W = 560
const STAGE_H = 620

/** Brand the app is drawn in. */
const active = ref(0)
/** Brand on the splash screen while a switch plays, else null. */
const splash = ref<number | null>(null)
const splashOut = ref(false)
/** Restarts the splash and icon-fill animations when switches overlap. */
const switchKey = ref(0)
/** The brands are taking turns by themselves (shows the swatch ring). */
const autoplay = ref(false)
/** Restarts the ring for each turn. */
const turnKey = ref(0)
const announce = ref('')

const brand = computed(() => BRANDS[active.value]!)

/** Which app the phone shows: the event's app, Mail or Maps. */
type View = 'app' | 'mail' | 'maps'
const view = ref<View>('app')
/** Bumped on every open, so Mail and Maps replay their story. */
const openKey = ref(0)
/** Mail and Maps pulse until the visitor opens one. */
const opened = ref(false)

/** An icon on the home screen was tapped: open that app, and stop the brands taking turns. */
function openApp(v: View) {
  touched = true
  stopTurns()
  if (v !== 'app') opened.value = true
  view.value = v
  openKey.value++
}
/** The swatch to mark as chosen: the one being switched to, as soon as the switch starts. */
const chosen = computed(() => splash.value ?? active.value)
const incoming = computed(() => (splash.value === null ? null : BRANDS[splash.value]!))

const tl = useTimeline()
let reduced = false
let touched = false
let timer: ReturnType<typeof setTimeout> | null = null
let observer: IntersectionObserver | null = null

function switchTo(i: number) {
  if (i === chosen.value) return
  if (reduced) {
    active.value = i
    return
  }
  tl.run(async (wait) => {
    switchKey.value++
    splashOut.value = false
    splash.value = i
    await wait(SPLASH_IN)
    active.value = i
    await wait(SPLASH_HOLD)
    splashOut.value = true
    await wait(SPLASH_OUT)
    splash.value = null
    splashOut.value = false
  })
}

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
    switchTo((chosen.value + 1) % BRANDS.length)
    nextTurn()
  }, AUTO_MS)
}

/** The visitor picked a brand: show it and stop taking turns. */
function choose(i: number) {
  touched = true
  stopTurns()
  switchTo(i)
  announce.value = `Showing the app for ${BRANDS[i]!.name}, in ${BRANDS[i]!.colorName.toLowerCase()}.`
}

const root = ref<HTMLElement | null>(null)

onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || !('IntersectionObserver' in window) || !root.value) return
  // Take turns only while the preview is on screen.
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
  <section id="branded" ref="root" class="ba" aria-labelledby="ba-title">
    <div class="ba-rail">
      <div class="ba-grid">
        <div class="txt">
          <p class="ba-eyebrow">Branded app</p>
          <h2 id="ba-title" class="ba-title">Put your own name on the app</h2>
          <p class="ba-text">
            Publish the attendee app under your name, with your logo, colors and splash screen.
            If you'd rather skip the app stores, use the EXPOUSE app and it still shows your event's branding.
          </p>

          <ul class="list">
            <li v-for="f in FEATURES" :key="f">
              <span class="chk">
                <Icon name="lucide:check" class="ico" />
              </span>
              {{ f }}
            </li>
          </ul>

          <div class="picker" role="group" aria-label="Try a brand">
            <span>Try a brand:</span>
            <button
              v-for="(b, i) in BRANDS"
              :key="b.color"
              type="button"
              class="sw"
              :style="{ '--c': b.color }"
              :aria-pressed="i === chosen"
              :aria-label="`${b.colorName}: ${b.name}`"
              @click="choose(i)"
            >
              <span v-if="autoplay && i === chosen" :key="turnKey" class="ring" :style="{ '--dur': `${AUTO_MS}ms` }" />
            </button>
          </div>
          <p class="try"><Icon name="lucide:pointer" class="ico" /><span>Tap <b>Mail</b> or <b>Maps</b> on the phone to see them in your brand.</span></p>
          <p class="sr-only" aria-live="polite">{{ announce }}</p>
        </div>

        <div
          class="vis"
          :style="{ '--ba-brand': brand.color }"
          role="group"
          :aria-label="`Sample white-label attendee app for ${brand.name}: its own app icon on a phone's home screen, and the app in the event's ${brand.colorName.toLowerCase()} brand`"
        >
          <PhoneStage :width="STAGE_W" :height="STAGE_H">
            <div class="panel" />

            <!-- The phone's home screen: the event's own app icon among the usual ones; each opens -->
            <div class="apps">
              <button type="button" class="app" :class="{ tapped: splash !== null, on: view === 'app' }" :aria-pressed="view === 'app'" :aria-label="`Open the ${brand.app} app`" @click="openApp('app')">
                <span class="icon brand-icon">
                  <i v-if="incoming" :key="switchKey" class="fill" :style="{ background: incoming.color }" />
                  <b>{{ incoming?.initial ?? brand.initial }}</b>
                </span>
                <small>{{ incoming?.app ?? brand.app }}</small>
              </button>
              <button type="button" class="app" :class="{ on: view === 'mail', hint: !opened }" :aria-pressed="view === 'mail'" aria-label="Open Mail: the event's registration email" @click="openApp('mail')">
                <span class="icon"><Icon name="lucide:mail" class="ico" /></span>
                <small>Mail</small>
              </button>
              <button type="button" class="app" :class="{ on: view === 'maps', hint: !opened }" :aria-pressed="view === 'maps'" aria-label="Open Maps: directions to a booth" @click="openApp('maps')">
                <span class="icon"><Icon name="lucide:map" class="ico" /></span>
                <small>Maps</small>
              </button>
            </div>

            <!-- The app itself, in the event's brand; the splash pours over it during a switch -->
            <div class="ph">
              <Transition name="open" mode="out-in">
                <PhoneAttendeeScreen v-if="view === 'app'" key="app" screen="home" :event="brand" branded />
                <PhoneBrandedMail v-else-if="view === 'mail'" key="mail" :event="brand" :play="openKey" />
                <PhoneVenueMap v-else key="maps" :app="brand.app" :play="openKey" />
              </Transition>
              <div
                v-if="incoming"
                :key="switchKey"
                class="splash"
                :class="{ out: splashOut }"
                :style="{ '--sp': incoming.color }"
              >
                <span class="sp-tile">{{ incoming.initial }}</span>
                <b>{{ incoming.app }}</b>
                <small>Powered by EXPOUSE</small>
              </div>
            </div>
          </PhoneStage>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* The preview's brand colour, registered so it can animate: the panel, icon and app all ease to a new brand. */
@property --ba-brand {
  syntax: "<color>";
  inherits: true;
  initial-value: #6452E7 ;
}

/* Swatch ring progress, 0 to 1. */
@property --ba-p {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}

/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.ba {
  --ba-ink: var(--color-ink, #1f2430);
  --ba-muted: var(--color-muted, #6b7280);
  --ba-line: var(--color-line, #e8e9ee);
  --ba-ease: cubic-bezier(.22, .8, .24, 1);
  --ba-swift: cubic-bezier(.65, 0, .35, 1);
  color: var(--ba-ink);
  background: #fff;
}

/* Same rail and gutter as the sections above. */
.ba-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(12px, 3vw, 40px) clamp(56px, 7vw, 88px) 0;
}

.ba-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  align-items: center;
  gap: clamp(32px, 5vw, 72px);
}

/* ---------- Text ---------- */
.ba-eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-brand, #6452E7 );
}

.ba-title {
  margin: 10px 0 0;
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.03em;
  text-wrap: balance;
}

.ba-text {
  max-width: 54ch;
  margin: 16px 0 0;
  font-size: 17px;
  line-height: 1.65;
  color: var(--ba-muted);
}

.list {
  display: grid;
  gap: 14px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 16px;
  line-height: 24px;
}

.chk {
  flex: none;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--color-brand-soft, #eef2ff);
  color: var(--color-brand, #6452E7 );
}

.chk .ico {
  width: 14px;
  height: 14px;
}

/* ---------- Brand picker ---------- */
.picker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  font-size: 16px;
  color: var(--ba-muted);
}

.sw {
  position: relative;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 3px solid #fff;
  border-radius: 50%;
  background: var(--c);
  box-shadow: 0 0 0 1px var(--ba-line);
  cursor: pointer;
  transition: transform .2s var(--ba-ease), box-shadow .2s;
}

.sw:hover {
  transform: scale(1.08);
}

.sw[aria-pressed="true"] {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--c) 35%, #fff);
}

.sw:focus-visible {
  outline: 2px solid var(--c);
  outline-offset: 4px;
}

/* While the brands take turns, a ring fills around the current one until the next takes over. */
.ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: conic-gradient(var(--c) calc(var(--ba-p) * 1turn), transparent 0);
  mask: radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px));
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px));
  animation: ba-ring var(--dur, 3800ms) linear forwards;
  pointer-events: none;
}

@keyframes ba-ring {
  to {
    --ba-p: 1;
  }
}

/* ---------- Preview (560 × 620 design px, scaled by PhoneStage) ---------- */
.vis {
  min-width: 0;
  transition: --ba-brand .6s ease;
}

.panel {
  position: absolute;
  left: 0;
  top: 100px;
  width: 560px;
  height: 420px;
  border-radius: 20px;
  background: linear-gradient(160deg, color-mix(in srgb, var(--ba-brand) 16%, #fff), color-mix(in srgb, var(--ba-brand) 6%, #fff));
}

.apps {
  position: absolute;
  left: 104px;
  top: 150px;
  display: grid;
  gap: 30px;
  justify-items: center;
  width: 92px;
}

.app {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.app .icon {
  transition: transform .25s var(--ba-ease), box-shadow .25s ease;
}

.app:hover .icon {
  transform: translateY(-3px);
}

.app:active .icon {
  transform: scale(.92);
}

.app:focus-visible {
  outline: none;
}

.app:focus-visible .icon {
  outline: 3px solid var(--ba-brand);
  outline-offset: 3px;
}

/* The open app gets a dot under its name, as a dock does. */
.app.on::after {
  content: "";
  position: absolute;
  bottom: -9px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ba-brand);
}

/* Until one is opened, Mail and Maps pulse to say they can be. */
.app.hint::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  width: 68px;
  height: 68px;
  margin-left: -34px;
  border-radius: 18px;
  pointer-events: none;
  animation: ba-hint 2.4s ease-out infinite;
}

.app.hint + .app.hint::before {
  animation-delay: 1.2s;
}

@keyframes ba-hint {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--ba-brand) 45%, transparent); }
  70%, 100% { box-shadow: 0 0 0 12px transparent; }
}

.app.on .icon:not(.brand-icon) {
  color: var(--ba-brand);
}

.app small {
  max-width: 92px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #4b5160;
}

.icon {
  position: relative;
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(20, 23, 40, .06), 0 10px 22px -14px rgba(20, 23, 40, .25);
  color: #b4b8c5;
}

.icon .ico {
  width: 26px;
  height: 26px;
}

.brand-icon {
  background: var(--ba-brand);
  box-shadow: 0 14px 26px -12px color-mix(in srgb, var(--ba-brand) 75%, transparent);
  color: #fff;
}

.brand-icon b {
  position: relative;
  z-index: 1;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -.02em;
}

.brand-icon + small {
  font-weight: 700;
  color: var(--ba-ink);
}

/* The new colour rises up the icon like liquid; its rounded top reads as the surface. */
.fill {
  position: absolute;
  left: -30%;
  right: -30%;
  top: -20%;
  height: 160%;
  border-radius: 42%;
  animation: ba-fill .55s var(--ba-swift) both;
}

@keyframes ba-fill {
  from {
    transform: translateY(100%) rotate(0deg);
  }

  to {
    transform: translateY(0) rotate(60deg);
  }
}

/* A light tap on the icon as the switch starts. */
.app.tapped .icon {
  animation: ba-tap .45s var(--ba-ease);
}

@keyframes ba-tap {
  40% {
    transform: scale(.9);
  }
}

.ph {
  position: absolute;
  left: 278px;
  top: 45px;
  /* The phone follows the preview's brand. */
  --color-brand: var(--ba-brand);
  --color-brand-soft: color-mix(in srgb, var(--ba-brand) 10%, #fff);
}

/* The event's splash screen pours in from the icon's side, then lifts. Sits on the phone's screen, inside the bezel. */
.splash {
  position: absolute;
  inset: 6px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 30px;
  background: var(--sp);
  color: #fff;
  clip-path: circle(0% at 0% 42%);
  animation: ba-pour .65s var(--ba-swift) forwards;
  transition: opacity .42s ease;
}

.splash.out {
  opacity: 0;
}

.sp-tile {
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  background: #fff;
  color: var(--sp);
  font-size: 34px;
  font-weight: 800;
  box-shadow: 0 16px 30px -14px rgba(0, 0, 0, .45);
  animation: ba-pop .55s .3s cubic-bezier(.34, 1.36, .64, 1) both;
}

.splash b {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -.01em;
  animation: ba-up .5s .4s var(--ba-ease) both;
}

.splash small {
  position: absolute;
  bottom: 26px;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: .04em;
  opacity: .75;
}

@keyframes ba-pour {
  to {
    clip-path: circle(150% at 0% 42%);
  }
}

@keyframes ba-pop {
  from {
    opacity: 0;
    transform: scale(.6);
  }
}

@keyframes ba-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

/* Opening an app: it grows out from the home-screen side. */
.open-enter-active,
.open-leave-active {
  transition: opacity .22s ease, transform .3s var(--ba-ease);
  transform-origin: 0% 45%;
}

.open-enter-from {
  opacity: 0;
  transform: scale(.88);
}

.open-leave-to {
  opacity: 0;
  transform: scale(.96);
}

.try {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 14px 0 0;
  font-size: 14.5px;
  color: var(--ba-muted);
}

.try .ico {
  flex: none;
  width: 16px;
  height: 16px;
  color: var(--color-brand, #6452E7);
}

.try b {
  color: var(--ba-ink);
}

/* Tablets and phones: text first, preview below. */
@media (max-width: 1024px) {
  .ba-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .vis {
    width: 100%;
    max-width: 620px;
    margin-inline: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vis,
  .sw,
  .open-enter-active,
  .open-leave-active {
    transition: none;
  }

  .app.hint::before {
    animation: none;
  }
}
</style>
