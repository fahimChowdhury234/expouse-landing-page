<script setup lang="ts">
/**
 * One event badge, drawn as SVG (240 × 360 = a 2:3 badge).
 *
 * Layout: curved gradient header with the event logo (an image slot) and the event
 * name and date, the attendee's name (wraps onto two lines), company, QR code and
 * a footer band with the badge type. A punch-hole guide sits at the top.
 *
 * - Static: pass no `step` and it renders the finished card (used by the fanned cards).
 * - Built: the badge designer raises `step` through BADGE_STEP and each element
 *   draws, sweeps or types itself in.
 */
import { BADGE_EVENT, BADGE_H, BADGE_STEP, BADGE_W, QR_FINDERS, badgeLayout, badgeQrCells, type BadgeRole } from '~/utils/badges'

const props = withDefaults(defineProps<{
  role: BadgeRole
  /** Build progress, see BADGE_STEP. Defaults to finished. */
  step?: number
  /** How many characters of the name are typed so far (defaults to all of it). */
  typed?: number
  /** Show a blinking caret after the name while it is being typed. */
  typing?: boolean
  /** Turn transitions on (the editor) or off (static cards, resets). */
  animated?: boolean
}>(), { step: BADGE_STEP.DONE, animated: false })

const uid = useId()
const W = BADGE_W
const H = BADGE_H
const R = 14
const FOOTER_Y = 319

const at = (s: number) => props.step >= s
const layout = computed(() => badgeLayout(props.role))
const cells = computed(() => badgeQrCells(props.role.key))

/** The name, line by line, cut to the characters typed so far (the space at a wrap counts as one). */
const nameShown = computed(() => {
  let left = props.typed ?? Infinity
  return layout.value.lines.map((line) => {
    const part = line.slice(0, Math.max(0, left))
    left -= line.length + 1
    return part
  })
})
/** Line the caret sits on: the last one with any text. */
const caretLine = computed(() => {
  let i = nameShown.value.length - 1
  while (i > 0 && !nameShown.value[i]) i--
  return i
})

const CARD = `M${R} 0H${W - R}A${R} ${R} 0 0 1 ${W} ${R}V${H - R}A${R} ${R} 0 0 1 ${W - R} ${H}H${R}A${R} ${R} 0 0 1 0 ${H - R}V${R}A${R} ${R} 0 0 1 ${R} 0Z`
/** Same card, inset half a pixel so the outline stroke stays crisp. */
const EDGE = `M${R} .5H${W - R}A${R - 0.5} ${R - 0.5} 0 0 1 ${W - 0.5} ${R}V${H - R}A${R - 0.5} ${R - 0.5} 0 0 1 ${W - R} ${H - 0.5}H${R}A${R - 0.5} ${R - 0.5} 0 0 1 .5 ${H - R}V${R}A${R - 0.5} ${R - 0.5} 0 0 1 ${R} .5Z`
/** Header: the bottom edge is part of an ellipse centred at (72, 0), so it sweeps up to the right. */
const HEADER = `M0 0H${W}V79.8A228 118 0 0 1 0 112Z`

/** Square QR finder ring (the 7 × 7 eye's outer ring), drawn as one path so it can be stroked in. */
function finderRing(fx: number, fy: number) {
  return `M${fx + 0.5} ${fy + 0.5}h6v6h-6z`
}
</script>

<template>
  <svg
    class="badge"
    :class="{ anim: animated }"
    :viewBox="`0 0 ${W} ${H}`"
    :style="{ '--c': role.color }"
    aria-hidden="true"
  >
    <defs>
      <clipPath :id="`${uid}-card`"><path :d="CARD" /></clipPath>
      <!-- the brand gradient blooms out from the top-left corner -->
      <clipPath :id="`${uid}-bloom`"><circle class="bloom" :class="{ on: at(BADGE_STEP.COLOR) }" cx="0" cy="0" r="280" /></clipPath>
      <clipPath :id="`${uid}-wipe`"><rect class="sweep wipe" :class="{ on: at(BADGE_STEP.EVENT) }" x="52" y="50" width="188" height="20" /></clipPath>
      <linearGradient :id="`${uid}-grad`" x1="0" y1=".1" x2="1" y2=".9">
        <stop offset="0" :stop-color="role.color" />
        <stop offset="1" :stop-color="role.color2" />
      </linearGradient>
      <linearGradient :id="`${uid}-sheen`" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0" />
        <stop offset=".5" stop-color="#fff" stop-opacity=".6" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
    </defs>

    <!-- 1 · Marquee: the badge area being dragged out on the canvas -->
    <rect
      class="marquee" :class="{ on: at(BADGE_STEP.MARQUEE), gone: at(BADGE_STEP.BODY) }"
      x=".5" y=".5" :width="W - 1" :height="H - 1" :rx="R"
    />

    <!-- 2 · Card body -->
    <path class="body" :class="{ on: at(BADGE_STEP.BODY) }" :d="CARD" />

    <g :clip-path="`url(#${uid}-card)`">
      <!-- 3 · Header: grey shape dragged down, then the brand gradient blooms in -->
      <path class="grow-down" :class="{ on: at(BADGE_STEP.HEADER) }" :d="HEADER" fill="#E4E6EC" />
      <path :d="HEADER" :fill="`url(#${uid}-grad)`" :clip-path="`url(#${uid}-bloom)`" />

      <!-- Footer band: grey placeholder, then the role colour -->
      <rect class="sweep from-right" :class="{ on: at(BADGE_STEP.FOOTER) }" x="0" :y="FOOTER_Y" :width="W" :height="H - FOOTER_Y" fill="#E4E6EC" />
      <rect class="sweep from-right late" :class="{ on: at(BADGE_STEP.COLOR) }" x="0" :y="FOOTER_Y" :width="W" :height="H - FOOTER_Y" fill="var(--c)" />

      <!-- 4 · Event logo: the slot lights up as a drop zone while an image is dragged in, then the image lands -->
      <g class="slot-ph" :class="{ on: at(BADGE_STEP.DROP), gone: at(BADGE_STEP.LOGO) }">
        <rect class="halo" x="17.5" y="51.5" width="29" height="29" rx="8" />
        <rect class="slot-frame" x="17.5" y="51.5" width="29" height="29" rx="8" />
        <g fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity=".9">
          <rect x="25" y="60" width="14" height="11" rx="2" />
          <path d="M27 69l3.2-3.2 2.4 2.4 1.6-1.6 2.6 2.6" />
          <circle cx="35.4" cy="63.4" r="1" />
        </g>
      </g>
      <g class="settle" :class="{ on: at(BADGE_STEP.LOGO) }">
        <BadgeDummyImage x="18" y="52" width="28" height="28" :radius="11" />
        <rect class="logo-ring" x="18.5" y="52.5" width="27" height="27" rx="7.5" />
      </g>

      <!-- 5 · Event name (wiped in) and date -->
      <text class="event" :clip-path="`url(#${uid}-wipe)`" x="54" y="64">{{ BADGE_EVENT.name }}</text>
      <text class="date fade-up late" :class="{ on: at(BADGE_STEP.EVENT) }" x="54" y="77">{{ BADGE_EVENT.date }}</text>

      <!-- 6 · Attendee name (typed, wraps) , designation (speakers) and company -->
      <text class="name" :class="{ on: at(BADGE_STEP.NAME) }" text-anchor="middle">
        <tspan v-for="(line, i) in nameShown" :key="i" x="120" :y="layout.nameY[i]">{{ line }}<tspan v-if="typing && i === caretLine" class="caret">|</tspan></tspan>
      </text>
      <text v-if="role.title" class="title fade-up" :class="{ on: at(BADGE_STEP.COMPANY) }" x="120" :y="layout.titleY!" text-anchor="middle" :fill="role.color">{{ role.title }}</text>
      <text class="company fade-up" :class="{ on: at(BADGE_STEP.COMPANY) }" x="120" :y="layout.companyY" text-anchor="middle">{{ role.company }}</text>

      <!-- 7 · QR code (real, scannable): finder rings drawn, then the modules ripple in -->
      <g transform="translate(74 215) scale(3.68)">
        <g fill="#1A1A2E">
          <rect
            v-for="([x, y], i) in cells" :key="i"
            class="cell" :class="{ on: at(BADGE_STEP.QR) }" :style="{ '--d': x + y }"
            :x="x" :y="y" width="1.04" height="1.04"
          />
        </g>
        <g v-for="([fx, fy], i) in QR_FINDERS" :key="`f${i}`">
          <path class="draw finder" :class="{ on: at(BADGE_STEP.QR) }" :d="finderRing(fx, fy)" pathLength="100" />
          <rect class="pop finder-dot" :class="{ on: at(BADGE_STEP.QR) }" :x="fx + 2" :y="fy + 2" width="3" height="3" fill="#1A1A2E" />
        </g>
      </g>

      <!-- 8 · Badge type in the footer band -->
      <text class="role" :class="{ on: at(BADGE_STEP.ROLE) }" x="120" y="344.5" text-anchor="middle">{{ role.key }}</text>

      <!-- 9 · Finish: one light sweep across the card -->
      <rect class="sheen" :class="{ on: at(BADGE_STEP.FINISH) && animated }" x="-120" y="-40" width="90" :height="H + 80" :fill="`url(#${uid}-sheen)`" />
    </g>

    <!-- Punch-hole guide -->
    <rect class="pop punch" :class="{ on: at(BADGE_STEP.PUNCH) }" x="97" y="12" width="46" height="9" rx="4.5" />

    <!-- Card outline, drawn around the edge -->
    <path class="draw edge" :class="{ on: at(BADGE_STEP.OUTLINE), settled: at(BADGE_STEP.FINISH) }" :d="EDGE" pathLength="100" />
  </svg>
</template>

<style scoped>
.badge {
  --ease: cubic-bezier(.22, .8, .24, 1);
  --swift: cubic-bezier(.65, 0, .35, 1);
  --spring: cubic-bezier(.34, 1.36, .64, 1);
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  font-family: var(--font-sans, "Cairo", system-ui, sans-serif);
}

/* Animated parts transform around their own box (not the whole SVG). */
.marquee, .grow-down, .bloom, .sweep, .pop, .fade-up, .cell, .sheen { transform-box: fill-box; }

.marquee { fill: rgba(99, 82, 231, .05); stroke: #6352e7; stroke-width: 1.2; stroke-dasharray: 5 4; transform: scale(0); transform-origin: 0 0; opacity: 0; }
.marquee.on { transform: scale(1); opacity: 1; }
.marquee.gone { opacity: 0; }

.body { fill: #fff; opacity: 0; }
.body.on { opacity: 1; }

.edge { fill: none; stroke: #c3c7d1; stroke-width: 1; }
.edge.settled { stroke: rgba(20, 23, 40, .07); }

/* pathLength 100 with a dash slightly longer than the path: fully hidden at 101, fully drawn at 0 */
.draw { stroke-dasharray: 100 102; stroke-dashoffset: 101; }
.draw.on { stroke-dashoffset: 0; }

.grow-down { transform: scaleY(0); transform-origin: 50% 0; }
.grow-down.on { transform: none; }

.bloom { transform: scale(0); transform-origin: 0 0; }
.bloom.on { transform: none; }

.sweep { transform: scaleX(0); transform-origin: 0 50%; }
.sweep.from-right { transform-origin: 100% 50%; }
.sweep.on { transform: scaleX(1); }

.pop { opacity: 0; transform: scale(.6); transform-origin: 50% 50%; }
.pop.on { opacity: 1; transform: none; }
/* the empty image slot only shows in the editor, while an image is dragged over it */
.slot-ph { opacity: 0; transform-box: fill-box; transform-origin: 50% 50%; transform: scale(.7); }
.slot-ph.on { opacity: 1; transform: none; }
.slot-ph.gone { opacity: 0; transform: scale(1.15); }
.settle { opacity: 0; transform: scale(1.25); transform-box: fill-box; transform-origin: 50% 50%; }
.settle.on { opacity: 1; transform: none; }
.halo { fill: none; stroke: #fff; stroke-width: 1.5; opacity: 0; transform-box: fill-box; transform-origin: 50% 50%; }
.logo-ring { fill: none; stroke: #fff; stroke-opacity: .55; stroke-width: 1; }
.slot-frame { fill: #fff; fill-opacity: .14; stroke: #fff; stroke-opacity: .9; stroke-width: 1.2; stroke-dasharray: 2.6 2; }

.event { fill: #fff; font-size: 10.5px; font-weight: 800; letter-spacing: .63px; }
.date { fill: #fff; fill-opacity: .85; font-size: 9px; font-weight: 600; letter-spacing: .55px; }

.name { fill: #1a1a2e; font-size: 21px; font-weight: 800; opacity: 0; }
.name.on { opacity: 1; }
.caret { fill: #6352e7; font-weight: 300; animation: blink .9s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }

.title { font-size: 12.5px; font-weight: 700; letter-spacing: .01em; }
.company { fill: #6b7280; font-size: 12.5px; font-weight: 500; }
.fade-up { opacity: 0; transform: translateY(6px); }
.fade-up.on { opacity: 1; transform: none; }

.cell { opacity: 0; transform: scale(.2); transform-origin: 50% 50%; }
.cell.on { opacity: 1; transform: none; }
/* hidden until drawn: a dashed-out path can still leave a speck at its start point */
.finder { fill: none; stroke: #1a1a2e; stroke-width: 1; opacity: 0; }
.finder.on { opacity: 1; }

.role { fill: #fff; font-size: 13px; font-weight: 800; letter-spacing: 2.6px; opacity: 0; }
.role.on { opacity: 1; }

.punch { fill: #f5f6f8; stroke: #c9ccd6; stroke-width: 1; stroke-dasharray: 2.4 1.8; }

.sheen { opacity: 0; transform: skewX(-18deg); }

/* ---- Timing (editor only). Static cards render their final state with no motion. ---- */
.anim .marquee { transition: transform var(--drag, .7s) var(--swift), opacity .35s ease; }
.anim .body { transition: opacity .5s ease; }
.anim .edge { transition: stroke-dashoffset .9s var(--swift), stroke .6s ease; }
.anim .grow-down { transition: transform var(--drag, .6s) var(--swift); }
.anim .bloom { transition: transform .95s cubic-bezier(.5, 0, .2, 1); }
.anim .sweep { transition: transform .6s var(--ease); }
.anim .sweep.late { transition-delay: .2s; }
.anim .sweep.wipe { transition: transform .75s var(--swift); }
.anim .pop { transition: opacity .3s ease, transform .5s var(--spring); }
.anim .slot-ph { transition: opacity .35s ease, transform .5s var(--spring); }
.anim .slot-ph.on:not(.gone) .slot-frame { animation: breathe 1.1s ease-in-out infinite; }
@keyframes breathe { 50% { stroke-opacity: .35; fill-opacity: .3; } }
.anim .slot-ph.on:not(.gone) .halo { animation: halo 1.2s ease-out infinite; }
@keyframes halo { from { opacity: .9; transform: scale(1); } to { opacity: 0; transform: scale(1.9); } }
.anim .settle { transition: opacity .3s ease, transform .55s var(--spring); }
.anim .name { transition: opacity .2s ease; }
.anim .fade-up { transition: opacity .5s ease, transform .5s var(--ease); }
.anim .fade-up.late { transition-delay: .35s; }
.anim .finder { transition: stroke-dashoffset .45s var(--swift), opacity .1s; }
.anim .finder-dot { transition-delay: .3s; }
.anim .cell { transition: opacity .25s ease, transform .35s var(--ease); transition-delay: calc(.32s + var(--d) * 11ms); }
.anim .role { transition: opacity .45s ease, letter-spacing .8s var(--ease); letter-spacing: 9px; }
.anim .role.on { letter-spacing: 2.6px; }
.anim .sheen.on { animation: sheen 1.15s cubic-bezier(.45, 0, .2, 1) .1s 1 both; }
@keyframes sheen {
  0% { opacity: 0; transform: skewX(-18deg) translateX(0); }
  15% { opacity: 1; }
  100% { opacity: 0; transform: skewX(-18deg) translateX(420px); }
}

@media (prefers-reduced-motion: reduce) {
  .anim * { transition: none !important; animation: none !important; }
}
</style>
