<script setup lang="ts">
/**
 * One screen of the scanner app (staff at gates and booths), in a phone frame
 * (Figma: Mobile apps).
 *
 * - home: today's numbers, a follow-up reminder, the scan button and recent scans
 * - lead: a lead just captured, with the booth's qualifying answers
 *
 * The parent drives the demo (MobileApps.vue); this screen only draws its state:
 * - `camera` on home: 'scan' opens the camera (a badge drifts into the viewfinder
 *   under the laser), 'found' locks on (green corners, flash, "detected"), 'off' is home
 * - `count` / `hot` / `recent`: the numbers tick and a new scan slides into the list
 * - `lead` + `play` on lead: each new `play` replays the capture for that lead
 *   (tick pops, answers fill in one by one); 0 leaves it still
 * - `interactive`: Open scanner, the Scan tab and Scan next lead are buttons
 *   that emit `scan`; the scan button's beam sweeps
 *
 * Every person and event here is fictional sample data (utils/scannerDemo).
 */
import { INITIAL_RECENT, SCAN_LEADS, SCAN_QUESTIONS, type ScanLead } from '~/utils/scannerDemo'
import { BADGE_ROLES } from '~/utils/badges'

const props = withDefaults(defineProps<{
  screen: 'home' | 'lead'
  time?: string
  play?: number
  interactive?: boolean
  camera?: 'off' | 'scan' | 'found'
  count?: number
  hot?: number
  recent?: ScanLead[]
  lead?: ScanLead
}>(), {
  time: '12:30',
  play: 0,
  interactive: false,
  camera: 'off',
  count: 23,
  hot: 8,
  recent: () => INITIAL_RECENT,
  lead: () => SCAN_LEADS[0]!,
})

const emit = defineEmits<{ scan: [] }>()

const NAV = [
  { icon: 'lucide:house', label: 'Home' },
  { icon: 'lucide:users-round', label: 'Leads' },
  { icon: 'lucide:scan', label: 'Scan' },
  { icon: 'lucide:activity', label: 'Activity' },
  { icon: 'lucide:circle-user-round', label: 'Profile' },
]

/** The badge in front of the camera: the visitor badge from the badge designer. */
const visitor = BADGE_ROLES[0]!

function onTab(i: number) {
  if (i === 2) emit('scan')
}
</script>

<template>
  <PhoneFrame :time="time" :nav="NAV" :active="screen === 'home' ? (camera === 'off' ? 0 : 2) : 1" :interactive="interactive" @tab="onTab">
    <!-- Home -->
    <template v-if="screen === 'home'">
      <header class="sh">
        <AppLogo light class="logo" />
        <PhoneAvatar :tone="3" round class="me" />
      </header>

      <div class="who">
        <PhoneAvatar :tone="3" round class="who-av" />
        <div>
          <b>Scanner</b>
          <small>Event name · Booth B-214</small>
        </div>
      </div>

      <div class="body">
        <div class="stats">
          <div>
            <small>My leads today</small>
            <b :key="count" class="num">{{ count }}</b>
          </div>
          <div>
            <small>Hot leads</small>
            <b :key="hot" class="num">{{ hot }}</b>
          </div>
        </div>

        <div class="notice">
          <Icon name="lucide:bell" class="ico" />
          <span>Emily Clarke needs follow-up, assigned to you.</span>
        </div>

        <div class="scanbox">
          <span class="qr"><Icon name="lucide:scan-qr-code" class="ico" /><i v-if="interactive" class="beam" /></span>
          <b>Scan attendee badge</b>
          <small>Point the camera at a badge QR code to capture a lead instantly</small>
          <component :is="interactive ? 'button' : 'span'" :type="interactive ? 'button' : undefined" class="open" @click="interactive && emit('scan')">
            <Icon name="lucide:scan" class="ico" />Open scanner
          </component>
        </div>

        <b class="recent-h">Recent scans</b>
        <TransitionGroup name="row" tag="div" class="recent-list">
          <div v-for="r in recent.slice(0, 2)" :key="r.name" class="recent">
            <PhoneAvatar :tone="r.tone" round class="r-av" />
            <p><b>{{ r.name }}</b><small>{{ r.company }}</small></p>
            <span class="tag" :class="r.rating.toLowerCase()">{{ r.rating }}</span>
            <Icon name="lucide:chevron-right" class="ico chev" />
          </div>
        </TransitionGroup>
      </div>

      <!-- Camera: the badge drifts in under the laser, then the QR locks -->
      <Transition name="cam">
        <div v-if="camera !== 'off'" class="cam" :class="camera">
          <div class="cam-top">
            <Icon name="lucide:x" class="ico" />
            <b>Scan badge</b>
            <Icon name="lucide:flashlight" class="ico" />
          </div>
          <div class="cam-badge">
            <BadgeCard :role="visitor" class="cam-card" />
          </div>
          <div class="vf">
            <i class="c tl" /><i class="c tr" /><i class="c bl" /><i class="c br" />
            <i v-if="camera === 'scan'" class="laser" />
          </div>
          <i v-if="camera === 'found'" class="flash" />
          <span class="cam-pill" :class="{ locked: camera === 'found' }">
            <template v-if="camera === 'found'"><Icon name="lucide:circle-check" class="ico" />Visitor detected · {{ lead.name }}</template>
            <template v-else>Point the camera at the badge QR code</template>
          </span>
        </div>
      </Transition>
    </template>

    <!-- Lead captured -->
    <template v-else>
      <header class="sh">
        <span class="back"><Icon name="lucide:arrow-left" class="ico" />Lead captured</span>
      </header>

      <div :key="play" class="body lead" :class="{ play: play > 0 }">
        <div class="saved">
          <span class="ok"><Icon name="lucide:check" class="ico" /></span>
          <b>Lead saved!</b>
          <div class="person">
            <PhoneAvatar :tone="lead.tone" round class="p-av" />
            <p><b>{{ lead.name }}</b><small>{{ lead.company }}</small></p>
            <span class="tag" :class="lead.rating.toLowerCase()">{{ lead.rating }}</span>
          </div>
          <small>Added to your leads with all qualifier answers.</small>
        </div>

        <div class="answers">
          <div v-for="(q, i) in SCAN_QUESTIONS" :key="q" :style="{ '--i': i }">
            <span class="q">{{ q }}<i v-if="i === 0">*</i></span>
            <span class="a">{{ lead.answers[i] }}</span>
          </div>
        </div>

        <component :is="interactive ? 'button' : 'span'" :type="interactive ? 'button' : undefined" class="next" @click="interactive && emit('scan')">
          <Icon name="lucide:scan" class="ico" />Scan next lead
        </component>
      </div>
    </template>
  </PhoneFrame>
</template>

<style scoped>
/* ---------- Header ---------- */
.sh {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 12px;
  background: var(--color-brand, #6452E7 );
  color: #fff;
}

.logo {
  height: 14px;
  width: auto;
}

.me {
  width: 24px;
  height: 24px;
  box-shadow: 0 0 0 1.5px rgba(255, 255, 255, .85);
}

.back {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 600;
}

.back .ico {
  width: 14px;
  height: 14px;
}

.who {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f1f0fd;
}

.who-av {
  flex: none;
  width: 28px;
  height: 28px;
}

.who b {
  display: block;
  font-size: 11px;
  line-height: 1.2;
}

.who small {
  font-size: 8px;
  color: #6b7280;
}

.body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
}

/* ---------- Home ---------- */
.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.stats div {
  padding: 7px 10px;
  border-radius: 9px;
  background: #fff;
}

.stats small {
  display: block;
  font-size: 8.5px;
  color: #6b7280;
}

.stats b {
  font-size: 15px;
  line-height: 1.3;
}

.notice {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  border-radius: 9px;
  background: var(--color-brand-soft, #eef2ff);
  font-size: 8.5px;
}

.notice .ico {
  flex: none;
  width: 12px;
  height: 12px;
  color: var(--color-brand, #6452E7 );
}

.scanbox {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 12px 14px;
  border: 1.5px dashed #c9cbe0;
  border-radius: 10px;
  background: #fafafd;
  text-align: center;
}

.qr {
  position: relative;
  overflow: hidden;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  margin-bottom: 3px;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(20, 23, 40, .08);
  color: #4b5160;
}

.qr .ico {
  width: 17px;
  height: 17px;
}

/* Scan beam: a brand line sweeping down the icon, over and over. */
.beam {
  position: absolute;
  left: 4px;
  right: 4px;
  top: 4px;
  height: 2px;
  border-radius: 2px;
  background: var(--color-brand, #6452E7);
  box-shadow: 0 0 6px 1px rgba(100, 82, 231, .55);
  animation: beam 1.8s ease-in-out infinite alternate;
}

@keyframes beam {
  to { top: 28px; }
}

.scanbox b {
  font-size: 10px;
}

.scanbox small {
  max-width: 170px;
  font-size: 8px;
  color: #6b7280;
}

.open {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  padding: 5px 12px;
  border-radius: 7px;
  background: var(--color-brand-soft, #eef2ff);
  color: var(--color-brand, #6452E7 );
  font-size: 9.5px;
  font-weight: 700;
}

.open .ico {
  width: 11px;
  height: 11px;
}

button.open,
button.next {
  border: 0;
  font: inherit;
  cursor: pointer;
  transition: transform .15s ease, filter .2s ease;
}

button.open {
  font-size: 9.5px;
  font-weight: 700;
}

button.next {
  width: 100%;
  font-size: 10.5px;
  font-weight: 700;
}

button.open:hover,
button.next:hover {
  filter: brightness(1.06);
}

button.open:active,
button.next:active {
  transform: scale(.96);
}

/* Numbers tick: each new value pops in. */
.num {
  display: inline-block;
  animation: tick .45s cubic-bezier(.34, 1.56, .64, 1);
}

@keyframes tick {
  from { transform: translateY(-40%) scale(1.25); color: var(--color-brand, #6452E7); }
}

.recent-list {
  position: relative;
  display: grid;
  gap: 8px;
}

/* A new scan slides in at the top; the oldest drops out. */
.row-enter-active {
  transition: opacity .45s ease, transform .45s cubic-bezier(.22, .8, .24, 1);
}

.row-leave-active {
  position: absolute;
  left: 0;
  right: 0;
  transition: opacity .3s ease;
}

.row-move {
  transition: transform .45s cubic-bezier(.22, .8, .24, 1);
}

.row-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}

.row-leave-to {
  opacity: 0;
}

.recent-h {
  margin-top: 2px;
  font-size: 10.5px;
}

.recent {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 9px;
  background: #fff;
}

.r-av {
  flex: none;
  width: 26px;
  height: 26px;
}

.recent p {
  flex: 1;
  min-width: 0;
  margin: 0;
}

.recent p b {
  display: block;
  font-size: 9.5px;
}

.recent p small {
  font-size: 8px;
  color: #6b7280;
}

.tag {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 8px;
  font-weight: 700;
}

.tag.hot {
  background: #fee2e2;
  color: #b91c1c;
}

.tag.cold {
  background: #dbeafe;
  color: #1d4ed8;
}

.tag.warm {
  background: #fef3c7;
  color: #b45309;
}

.chev {
  flex: none;
  width: 11px;
  height: 11px;
  color: #9aa1ad;
}

/* ---------- Lead captured ---------- */
.saved {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #fff;
  text-align: center;
}

.ok {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  margin-bottom: 4px;
  border-radius: 50%;
  background: #dcfce7;
  color: #16a34a;
}

.ok .ico {
  width: 16px;
  height: 16px;
}

.saved > b {
  font-size: 12px;
}

.saved > small {
  font-size: 8px;
  color: #6b7280;
}

/* Who was captured, with their rating */
.person {
  align-self: stretch;
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 5px 0 3px;
  padding: 6px 8px;
  border-radius: 9px;
  background: #f6f6fb;
  text-align: left;
}

.p-av {
  flex: none;
  width: 24px;
  height: 24px;
}

.person p {
  flex: 1;
  min-width: 0;
  margin: 0;
}

.person p b {
  display: block;
  font-size: 9.5px;
}

.person p small {
  font-size: 8px;
  color: #6b7280;
}

.answers {
  display: grid;
  gap: 8px;
  padding: 4px 2px 0;
}

.answers div {
  display: grid;
  justify-items: start;
  gap: 4px;
}

.q {
  font-size: 9px;
  font-weight: 600;
}

.q i {
  margin-left: 2px;
  font-style: normal;
  color: #ef4444;
}

.a {
  padding: 3px 8px;
  border-radius: 6px;
  background: #ececf3;
  font-size: 8.5px;
}

/* Replay of the capture: the tick pops, the text follows, then the answers fill in one by one. */
.play .ok {
  animation: pop .5s cubic-bezier(.34, 1.56, .64, 1) both;
}

.play .saved > b,
.play .person,
.play .saved > small,
.play .answers div,
.play .next {
  animation: rise .45s cubic-bezier(.22, .8, .24, 1) both;
}

.play .saved > b { animation-delay: .2s; }
.play .person { animation-delay: .28s; }
.play .saved > small { animation-delay: .36s; }
.play .answers div { animation-delay: calc(.5s + var(--i) * .16s); }
.play .next { animation-delay: 1.2s; }

@keyframes pop {
  from { opacity: 0; transform: scale(.3); }
}

@keyframes rise {
  from { opacity: 0; transform: translateY(6px); }
}

@media (prefers-reduced-motion: reduce) {
  .beam { display: none; }
  .play .ok, .play .saved > b, .play .person, .play .saved > small, .play .answers div, .play .next,
  .num, .cam-badge, .laser, .flash { animation: none; }
  .row-enter-active, .row-move, .cam-enter-active, .cam-leave-active { transition: none; }
}

/* Sits at the bottom of the screen, above the tab bar. */
.next {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: auto;
  height: 32px;
  border-radius: 8px;
  background: var(--color-brand, #6452E7 );
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
}

.next .ico {
  width: 12px;
  height: 12px;
}

/* ---------- Camera ---------- */
/* Covers the screen below the status bar, tab bar included, as the real scanner does. */
.cam {
  position: absolute;
  inset: 26px 0 0;
  z-index: 5;
  overflow: hidden;
  background: radial-gradient(120% 80% at 50% 40%, #3a3550, #12101c 70%);
  color: #fff;
}

.cam-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 38px;
  padding: 0 12px;
  font-size: 10.5px;
}

.cam-top .ico {
  width: 14px;
  height: 14px;
}

/* The badge held up to the camera: it drifts in, wobbles like a hand, then holds. */
.cam-badge {
  position: absolute;
  left: 39px;
  top: 36px;
  width: 160px;
  transform-origin: 50% 70%;
}

.cam-card {
  display: block;
  width: 100%;
  filter: drop-shadow(0 16px 24px rgba(0, 0, 0, .5));
}

.cam.scan .cam-badge {
  animation: hold-in 1.5s cubic-bezier(.22, .8, .24, 1) both, wobble 1.6s ease-in-out 1.5s infinite alternate;
}

.cam.found .cam-badge {
  transform: rotate(-1.5deg);
}

@keyframes hold-in {
  from { opacity: 0; transform: translate(26px, 90px) rotate(14deg) scale(.85); }
  60% { opacity: 1; }
  to { transform: rotate(-1.5deg); }
}

@keyframes wobble {
  from { transform: rotate(-1.5deg); }
  to { transform: translate(1.5px, -1px) rotate(-.5deg); }
}

/* Viewfinder: everything outside it dimmed, corner brackets, a laser across it. */
.vf {
  position: absolute;
  left: 69px;
  top: 160px;
  width: 100px;
  height: 100px;
  border-radius: 10px;
  box-shadow: 0 0 0 999px rgba(10, 8, 20, .55);
}

.c {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 0 solid #fff;
  transition: border-color .2s ease, transform .3s cubic-bezier(.34, 1.56, .64, 1);
}

.c.tl { left: -2px; top: -2px; border-width: 3px 0 0 3px; border-top-left-radius: 10px; }
.c.tr { right: -2px; top: -2px; border-width: 3px 3px 0 0; border-top-right-radius: 10px; }
.c.bl { left: -2px; bottom: -2px; border-width: 0 0 3px 3px; border-bottom-left-radius: 10px; }
.c.br { right: -2px; bottom: -2px; border-width: 0 3px 3px 0; border-bottom-right-radius: 10px; }

/* Lock-on: the corners snap in and go green. */
.cam.found .c { border-color: #22c55e; }
.cam.found .c.tl { transform: translate(5px, 5px); }
.cam.found .c.tr { transform: translate(-5px, 5px); }
.cam.found .c.bl { transform: translate(5px, -5px); }
.cam.found .c.br { transform: translate(-5px, -5px); }

.laser {
  position: absolute;
  left: 8px;
  right: 8px;
  top: 8px;
  height: 2px;
  border-radius: 2px;
  background: #ef4444;
  box-shadow: 0 0 10px 2px rgba(239, 68, 68, .6);
  animation: laser 1.1s ease-in-out infinite alternate;
}

@keyframes laser {
  to { top: 90px; }
}

.flash {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: #fff;
  pointer-events: none;
  animation: flash .5s ease-out forwards;
}

@keyframes flash {
  from { opacity: .7; }
  to { opacity: 0; }
}

.cam-pill {
  position: absolute;
  left: 50%;
  top: 284px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, .14);
  font-size: 8.5px;
  font-weight: 600;
  white-space: nowrap;
  translate: -50% 0;
  transition: background .25s ease;
}

.cam-pill.locked {
  background: #16a34a;
}

.cam-pill .ico {
  width: 11px;
  height: 11px;
}

.cam-enter-active,
.cam-leave-active {
  transition: opacity .3s ease, transform .35s cubic-bezier(.22, .8, .24, 1);
}

.cam-enter-from {
  opacity: 0;
  transform: scale(1.06);
}

.cam-leave-to {
  opacity: 0;
}
</style>
