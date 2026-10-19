<script setup lang="ts">
/**
 * The attendee app's venue map, in a phone frame: indoor directions from the
 * entrance to a booth. The floor plan is an exhibition centre (lobby, Hall 1
 * with its booth rows, Halls 2 and 3); the route to Hall 1 · B330 draws itself,
 * a walking dot follows it, and the step list below lights each turn as the dot
 * reaches it, ending on "You've arrived". `play` restarts the walk (the parent
 * bumps it each time the map opens); Replay does the same from inside.
 *
 * Colours follow --color-brand, so the map takes the event's brand.
 * The venue, booth and exhibitor are fictional sample data.
 */
const props = withDefaults(defineProps<{
  time?: string
  /** Event's app name, in the header. */
  app?: string
  play?: number
}>(), { time: '9:41', app: 'Event app', play: 0 })

/** Walk: from Gate A up into the lobby, left to Hall 1's door, up aisle B, left to B330. */
const ROUTE = 'M119 292 V246 H66 V176 H52'
/** Seconds the dot takes to walk the route. */
const WALK = 4.2
/** When (in seconds of the walk) each step becomes the current one; the last is arrival. */
const STEPS = [
  { at: 0, icon: 'lucide:door-open', text: 'Enter through Gate A' },
  { at: 1.1, icon: 'lucide:corner-up-left', text: 'Turn left into Hall 1' },
  { at: 2.2, icon: 'lucide:arrow-up', text: 'Walk down aisle B' },
  { at: 3.6, icon: 'lucide:map-pin', text: 'B330 is on your left' },
]

/** Hall 1 booth blocks: three aisles of stands (A, B, C), two rows each side. */
const BOOTHS = [
  ...[30, 60, 90, 120, 150].map(y => ({ x: 22, y, row: 'A' })),
  ...[30, 60, 90, 120, 150].map(y => ({ x: 74, y, row: 'C' })),
]
const TARGET = { x: 22, y: 168 }

const run = ref(0)
const walking = ref(false)
const step = ref(0)
const arrived = ref(false)
let timers: ReturnType<typeof setTimeout>[] = []

function clear() {
  timers.forEach(clearTimeout)
  timers = []
}

function start() {
  clear()
  run.value++
  arrived.value = false
  step.value = 0
  walking.value = true
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const lead = reduced ? 0 : 900 // the route draws first
  STEPS.forEach((s, i) => timers.push(setTimeout(() => { step.value = i }, reduced ? 0 : lead + s.at * 1000)))
  timers.push(setTimeout(() => {
    arrived.value = true
    walking.value = false
  }, reduced ? 0 : lead + WALK * 1000 + 200))
}

watch(() => props.play, p => p && start())
onMounted(() => {
  if (props.play) start()
})
onBeforeUnmount(clear)
</script>

<template>
  <PhoneFrame :time="time" interactive>
    <header class="mh">
      <Icon name="lucide:arrow-left" class="ico" />
      <b>Venue map</b>
      <span class="app">{{ app }}</span>
    </header>

    <div class="search">
      <Icon name="lucide:search" class="ico" />
      <span>Hall 1 · Booth B330</span>
      <Icon name="lucide:x" class="ico x" />
    </div>

    <div class="map">
      <!-- Keyed per walk: an inline SVG's animation clock starts when it is inserted. -->
      <svg :key="run" viewBox="0 0 238 300" aria-hidden="true">
        <!-- Building, halls and lobby -->
        <rect x="6" y="6" width="226" height="288" rx="12" class="bldg" />
        <rect x="14" y="14" width="106" height="210" rx="7" class="hall h1" />
        <rect x="126" y="14" width="98" height="120" rx="7" class="hall" />
        <rect x="126" y="140" width="98" height="84" rx="7" class="hall" />
        <rect x="14" y="232" width="210" height="50" rx="7" class="lobby" />
        <text x="67" y="27" class="lbl">HALL 1</text>
        <text x="175" y="76" class="lbl">HALL 2</text>
        <text x="175" y="184" class="lbl">HALL 3</text>
        <text x="175" y="262" class="lbl soft">LOBBY</text>
        <!-- Hall 2 / 3 stands, faint -->
        <g class="stand faint">
          <rect v-for="i in 6" :key="`h2${i}`" :x="136 + ((i - 1) % 3) * 28" :y="88 + Math.floor((i - 1) / 3) * 20" width="22" height="14" rx="2" />
          <rect v-for="i in 3" :key="`h3${i}`" :x="136 + (i - 1) * 28" :y="194" width="22" height="14" rx="2" />
        </g>
        <!-- Hall 1 stands, aisles A–C -->
        <g class="stand">
          <rect v-for="(b, i) in BOOTHS" :key="i" :x="b.x" :y="b.y + 6" width="26" height="20" rx="2" />
        </g>
        <text x="58" y="44" class="aisle">B</text>
        <!-- Destination stand -->
        <rect :x="TARGET.x" :y="TARGET.y" width="26" height="20" rx="2" class="target" :class="{ on: arrived }" />
        <text :x="TARGET.x + 13" :y="TARGET.y + 13" class="tlbl">B330</text>
        <!-- Gate A -->
        <rect x="104" y="290" width="30" height="8" rx="2" class="gate" />
        <text x="119" y="287" class="lbl soft">GATE A</text>

        <!-- The route: drawn in, then walked -->
        <path :d="ROUTE" class="route-bg" />
        <path :d="ROUTE" class="route" :class="{ go: run }" pathLength="100" />
        <!-- Destination pin -->
        <g class="pin" :class="{ go: run }" :transform="`translate(${TARGET.x + 13} ${TARGET.y - 3})`">
          <path d="M0 0c-5-6-8-9.5-8-13a8 8 0 0 1 16 0c0 3.5-3 7-8 13z" />
          <circle cy="-13" r="3" fill="#fff" />
        </g>
        <!-- You are here: waits at Gate A, then walks the route -->
        <g v-if="run">
          <circle r="9" class="halo" />
          <circle r="4.5" class="me" />
          <!-- Holds at the gate while the route draws (first 0.9 s), then walks it -->
          <animateMotion :dur="`${WALK + 0.9}s`" fill="freeze" :path="ROUTE" keyPoints="0;0;1" :keyTimes="`0;${(0.9 / (WALK + 0.9)).toFixed(4)};1`" calcMode="spline" keySplines="0 0 1 1;.4 0 .4 1" />
        </g>
        <g v-else transform="translate(119 292)">
          <circle r="9" class="halo" />
          <circle r="4.5" class="me" />
        </g>
      </svg>
    </div>

    <div class="sheet">
      <div class="dest">
        <span class="dest-ic"><Icon name="lucide:map-pin" class="ico" /></span>
        <p><b>Booth B330</b><small>Northwind Group · Hall 1</small></p>
        <span class="eta"><b>{{ arrived ? 'Here' : '4 min' }}</b><small>{{ arrived ? 'arrived' : '230 m' }}</small></span>
      </div>
      <ol class="steps">
        <li v-for="(s, i) in STEPS" :key="s.text" :class="{ done: arrived || i < step, now: !arrived && i === step && run }">
          <Icon :name="s.icon" class="ico" />{{ s.text }}
        </li>
      </ol>
      <button type="button" class="go-btn" :class="{ ok: arrived }" @click="start">
        <Icon :name="arrived ? 'lucide:circle-check' : 'lucide:navigation'" class="ico" />{{ arrived ? 'You\'ve arrived · Replay' : walking ? 'Navigating…' : 'Start' }}
      </button>
    </div>
  </PhoneFrame>
</template>

<style scoped>
.mh {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 12px;
  background: var(--color-brand, #6452E7);
  color: #fff;
}

.mh .ico {
  width: 14px;
  height: 14px;
}

.mh b {
  font-size: 11px;
}

.mh .app {
  margin-left: auto;
  font-size: 8px;
  opacity: .8;
}

.search {
  flex: none;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 10px 0;
  height: 26px;
  padding: 0 9px;
  border: 1px solid #e6e6ef;
  border-radius: 8px;
  background: #fff;
  font-size: 9px;
  font-weight: 600;
}

.search .ico {
  width: 11px;
  height: 11px;
  color: #9aa1ad;
}

.search .x {
  margin-left: auto;
}

/* ---------- Map ---------- */
.map {
  flex: 1;
  min-height: 0;
  padding: 6px 10px 0;
}

.map svg {
  display: block;
  width: 100%;
  height: 100%;
}

.bldg {
  fill: #fff;
  stroke: #dcdcea;
  stroke-width: 1.5;
}

.hall {
  fill: #f4f4f9;
  stroke: #e3e3ee;
}

.hall.h1 {
  fill: color-mix(in srgb, var(--color-brand, #6452E7) 6%, #f6f6fb);
}

.lobby {
  fill: #fafafd;
  stroke: #ececf3;
  stroke-dasharray: 3 3;
}

.lbl {
  font-size: 7px;
  font-weight: 800;
  letter-spacing: .08em;
  fill: #6b7280;
  text-anchor: middle;
}

.lbl.soft {
  fill: #a3a8b4;
  font-size: 6px;
}

.aisle {
  font-size: 7px;
  font-weight: 800;
  fill: var(--color-brand, #6452E7);
  text-anchor: middle;
}

.stand rect {
  fill: #e6e6ef;
}

.stand.faint rect {
  fill: #ececf3;
}

.target {
  fill: color-mix(in srgb, var(--color-brand, #6452E7) 35%, #fff);
  transition: fill .4s ease;
}

.target.on {
  fill: var(--color-brand, #6452E7);
}

.tlbl {
  font-size: 6.5px;
  font-weight: 800;
  fill: #fff;
  text-anchor: middle;
}

.gate {
  fill: var(--color-brand, #6452E7);
}

.route-bg {
  fill: none;
  stroke: color-mix(in srgb, var(--color-brand, #6452E7) 18%, transparent);
  stroke-width: 7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.route {
  fill: none;
  stroke: var(--color-brand, #6452E7);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 100;
}

.route.go {
  animation: draw .9s ease-out both;
}

@keyframes draw {
  from { stroke-dashoffset: 100; }
}

.pin {
  fill: var(--color-brand, #6452E7);
}

.pin.go {
  animation: drop .5s cubic-bezier(.34, 1.56, .64, 1) .6s both;
}

@keyframes drop {
  from { opacity: 0; translate: 0 -10px; }
}

.me {
  fill: #2563eb;
  stroke: #fff;
  stroke-width: 2;
}

.halo {
  fill: rgba(37, 99, 235, .2);
  animation: halo 1.4s ease-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes halo {
  from { transform: scale(.5); opacity: 1; }
  to { transform: scale(1.4); opacity: 0; }
}

/* ---------- Directions ---------- */
.sheet {
  flex: none;
  display: grid;
  gap: 6px;
  padding: 9px 10px 10px;
  border-radius: 14px 14px 0 0;
  background: #fff;
  box-shadow: 0 -6px 16px -10px rgba(20, 23, 40, .25);
}

.dest {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dest-ic {
  flex: none;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: color-mix(in srgb, var(--color-brand, #6452E7) 12%, #fff);
  color: var(--color-brand, #6452E7);
}

.dest-ic .ico {
  width: 13px;
  height: 13px;
}

.dest p {
  flex: 1;
  min-width: 0;
  margin: 0;
}

.dest p b {
  display: block;
  font-size: 10.5px;
}

.dest p small,
.eta small {
  font-size: 7.5px;
  color: #6b7280;
}

.eta {
  display: grid;
  justify-items: end;
  line-height: 1.15;
}

.eta b {
  font-size: 11px;
  color: #16a34a;
}

.steps {
  display: grid;
  gap: 3px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.steps li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 8.5px;
  color: #9aa1ad;
  transition: background .3s ease, color .3s ease;
}

.steps .ico {
  width: 10px;
  height: 10px;
}

.steps li.done {
  color: #4b5160;
}

.steps li.now {
  background: color-mix(in srgb, var(--color-brand, #6452E7) 12%, #fff);
  color: var(--color-brand, #6452E7);
  font-weight: 700;
}

.go-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: var(--color-brand, #6452E7);
  font: inherit;
  font-size: 9.5px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  transition: background .3s ease;
}

.go-btn.ok {
  background: #16a34a;
}

.go-btn .ico {
  width: 11px;
  height: 11px;
}

@media (prefers-reduced-motion: reduce) {
  .route.go, .pin.go, .halo { animation: none; }
}
</style>
