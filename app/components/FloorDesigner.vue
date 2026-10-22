<script setup lang="ts">
/**
 * 06 · Floor plan designer.
 *
 * A short, scripted product animation of the console's floor editor
 * (eventos-admin/modules/floor.expouse), built like the badge designer:
 *   1 Hall    - the hall is dragged out at real scale, walls and an entrance added
 *   2 Booths  - one booth is drawn by hand (its type follows from its open sides),
 *               then Auto-fill lays out the rest of the rows
 *   3 Areas   - a stage is dragged out, a café dropped in, emergency exits placed
 *   4 Pricing - a price per m² is typed into the rate card: every booth goes on sale
 *   5 Publish - exhibitors book (booths turn sold / reserved), the plan is published
 * Then the plan lifts off the canvas and tilts into a 3D hall: booths rise, and a
 * visitor route is drawn from the entrance to a booth of the chosen type.
 *
 * Without JS, and with reduced motion, the finished 3D hall is shown straight away.
 */
import { BOOTH_TYPES, FLOOR_AREAS, FLOOR_BOOTHS, FLOOR_STEP, RATE, boothMetres, boothPrice, findBooth, type BoothType, type FloorBoothType, type FloorRect } from '~/utils/floor'

type Phase = 'design' | 'reveal' | 'done'
type Tool = 'hall' | 'booth' | 'area' | 'fill'
type Selection = 'hall' | 'door' | 'feature' | 'stage' | 'cafe'
type InspectorKey = Selection | 'fill' | 'exits' | 'pricing' | 'plan'
type Point = { x: number, y: number } | null
type Counts = { available: number, reserved: number, sold: number }

const S = FLOOR_STEP
const STAGES = ['Hall', 'Booths', 'Areas', 'Pricing', 'Publish']
const TOOLS: { key: Tool, label: string, icon: string }[] = [
  { key: 'hall', label: 'Hall', icon: 'lucide:square' },
  { key: 'booth', label: 'Booth', icon: 'lucide:square-dashed' },
  { key: 'area', label: 'Area', icon: 'lucide:shapes' },
  { key: 'fill', label: 'Auto-fill', icon: 'lucide:wand-sparkles' },
]
const AREA_USES = ['Stage', 'Catering', 'Emergency exit', 'No-build']
const LEGEND: { key: keyof Counts, label: string, color: string }[] = [
  { key: 'available', label: 'Available', color: '#1E8A55' },
  { key: 'reserved', label: 'Reserved', color: '#B45309' },
  { key: 'sold', label: 'Sold', color: '#6452E7' },
]
const POINTS = [
  { title: 'Real-scale plans', text: 'Draw the hall in metres, or import the venue\'s DWG, DXF or PDF drawing.' },
  { title: 'Any booth type', text: 'Inline, corner, peninsula and island booths, in L, U and T shapes too.' },
  { title: 'Prices per m²', text: 'Set one rate card. Corner and island premiums are added for you.' },
  { title: 'A map for visitors', text: 'Search exhibitors and get directions on the website and in the app.' },
]
/** Twinkles on the showcase stage: left %, top %, delay s, size px. */
const SPARKS = [[9, 22, 0, 3], [18, 54, 1.4, 2], [27, 12, 2.6, 2], [74, 16, 0.7, 3], [84, 46, 2.1, 2], [92, 20, 3.3, 2], [63, 9, 1.9, 2], [38, 30, 3, 2], [6, 70, 2.4, 2]]
/** Overall speed of the design script: lower is faster. Tune here, not step by step. */
const TEMPO = 0.9
const money = (n: number) => `$${n.toLocaleString('en-US')}`

/* ---------------- State ---------------- */
// The server renders the finished 3D hall; the client resets to a blank canvas on mount.
const phase = ref<Phase>('done')
const typeKey = ref<BoothType>('island')
const type = computed<FloorBoothType>(() => BOOTH_TYPES.find(t => t.key === typeKey.value)!)
const feature = computed(() => findBooth(type.value.feature))

/** Booth counts once every booth is booked (the hand-drawn booth always sells). */
function finalCounts(): Counts {
  const c: Counts = { available: 0, reserved: 0, sold: 0 }
  for (const b of FLOOR_BOOTHS) c[b.id === feature.value.id ? 'sold' : b.status]++
  return c
}

const build = reactive({
  step: S.DONE as number,
  animated: false,
  selected: null as Selection | null,
  /** Last selection, so the box fades out where it was instead of jumping. */
  lastSel: 'hall' as Selection,
  /** Duration of the current drag, shared by the cursor and the shape it pulls. */
  dragMs: 700,
  hidden: false, // canvas plan hidden once the 3D hall takes over
})
const editor = reactive({
  stage: STAGES.length, // current stage index; = length when finished
  tool: null as Tool | null,
  pressed: null as Tool | null,
  types: BOOTH_TYPES.map(t => t.key) as BoothType[],
  uses: AREA_USES.slice(0, 3),
  inspector: 'plan' as InspectorKey,
  rate: String(RATE),
  typing: false,
  booths: FLOOR_BOOTHS.length,
  counts: finalCounts(),
  published: true,
})
const cursor = reactive({ x: 0, y: 0, shown: false, ms: 0, clicks: 0, down: false, drag: false })
const show = reactive({
  handoff: true,
  tilted: true,
  extruded: true,
  routed: true,
  instant: false,
  flip: null as null | { x: number, y: number, s: number },
})

const reduced = ref(false)
const started = ref(false)
const mounted = ref(false)
const tl = useTimeline()
const sound = useCardSound()

/* ---------------- Inspector (right panel) ---------------- */
interface Row { label: string, value: string | number }
interface Inspector { title: string, rows: (Row | [Row, Row])[] }

const inspector = computed<Inspector>(() => {
  const f = feature.value
  const m = boothMetres(f)
  switch (editor.inspector) {
    case 'hall': return { title: 'Hall · Hall A', rows: [{ label: 'Size', value: '50 × 30 m' }, { label: 'Area', value: '1,500 m²' }, { label: 'Units', value: 'Metres' }] }
    case 'door': return { title: 'Door · Main entrance', rows: [[{ label: 'Width', value: '5 m' }, { label: 'Type', value: 'Entrance' }], { label: 'Visitor start', value: 'Yes' }] }
    case 'feature': return { title: `Booth · ${f.id}`, rows: [{ label: 'Type', value: type.value.label }, { label: 'Size', value: `${m.w} × ${m.h} m` }, { label: 'Area', value: `${m.area} m²` }, { label: 'Open sides', value: type.value.sides }] }
    case 'fill': return { title: 'Auto-fill · Booth rows', rows: [{ label: 'Booth size', value: '3 × 3 m' }, [{ label: 'Aisle', value: '3 m' }, { label: 'Rows', value: 4 }]] }
    case 'stage': return { title: 'Area · Main stage', rows: [{ label: 'Use', value: 'Stage' }, { label: 'Size', value: '13 × 6 m' }, { label: 'Blocks booths', value: 'Yes' }] }
    case 'cafe': return { title: 'Area · Café', rows: [{ label: 'Use', value: 'Catering' }, { label: 'Size', value: '11 × 6 m' }, { label: 'Seats', value: 40 }] }
    case 'exits': return { title: 'Area · Emergency exits', rows: [{ label: 'Exits', value: 3 }, { label: 'Clear width', value: '1.5 m' }, { label: 'Keep clear', value: 'On' }] }
    case 'pricing': return { title: 'Rate card · Hall A', rows: [[{ label: 'Corner', value: '+10%' }, { label: 'Island', value: '+25%' }], { label: 'Peninsula', value: '+15%' }] }
    default: return { title: 'Floor plan · Hall A', rows: [{ label: 'Status', value: editor.published ? 'Published' : 'Draft' }, { label: 'Visitor map', value: editor.published ? 'Live' : 'Off' }, { label: 'Booths', value: FLOOR_BOOTHS.length }] }
  }
})

/** The editor's selection box, in % of the plan so it scales with it. It glides between elements. */
const SEL_RECTS = computed<Record<Selection, FloorRect>>(() => ({
  hall: FLOOR_AREAS.hall,
  door: FLOOR_AREAS.door,
  feature: feature.value,
  stage: FLOOR_AREAS.stage,
  cafe: FLOOR_AREAS.cafe,
}))
const selStyle = computed(() => {
  const r = SEL_RECTS.value[build.selected ?? build.lastSel]
  const pad = 4
  return {
    left: `calc(${(r.x / 600) * 100}% - ${pad}px)`,
    top: `calc(${(r.y / 360) * 100}% - ${pad}px)`,
    width: `calc(${(r.w / 600) * 100}% + ${pad * 2}px)`,
    height: `calc(${(r.h / 360) * 100}% + ${pad * 2}px)`,
  }
})

/* ---------------- Cursor ---------------- */
const scenesEl = ref<HTMLElement | null>(null)
const planEl = ref<HTMLElement | null>(null)
const publishEl = ref<HTMLElement | null>(null)
const rateEl = ref<HTMLElement | null>(null)
const planePosEl = ref<HTMLElement | null>(null)
const toolEls: Partial<Record<Tool, HTMLElement>> = {}
/** Function refs for elements rendered in v-for loops. */
const keep = <K extends string>(map: Partial<Record<K, HTMLElement>>, key: K) => (el: unknown) => {
  if (el instanceof HTMLElement) map[key] = el
}

/** A point on an element, relative to the scene (null when the element isn't visible, e.g. panels on mobile). */
function pointOn(el: HTMLElement | null | undefined, fx = 0.5, fy = 0.5): Point {
  if (!el || !scenesEl.value) return null
  const r = el.getBoundingClientRect()
  if (!r.width || !r.height) return null
  const s = scenesEl.value.getBoundingClientRect()
  return { x: r.left - s.left + r.width * fx, y: r.top - s.top + r.height * fy }
}
/** A point on the plan, in plan units (600 × 360). */
const onPlan = (x: number, y: number) => pointOn(planEl.value, x / 600, y / 360)

/** Glide the cursor to a point; skipped (no wait) when the target isn't on screen. */
async function moveTo(p: Point, ms: number) {
  if (!p) return
  cursor.ms = Math.round(ms * TEMPO)
  cursor.x = p.x
  cursor.y = p.y
  await tl.wait(cursor.ms)
}
/** Press and release, with a ripple. */
async function click() {
  cursor.down = true
  cursor.clicks++
  await tl.wait(120)
  cursor.down = false
}
async function useTool(t: Tool) {
  const p = pointOn(toolEls[t])
  if (p) {
    await moveTo(p, 480)
    editor.pressed = t
    await click()
    editor.pressed = null
  }
  editor.tool = t
}
/** Press at `from`, pull to `to`. `onPress` starts the shape, which grows in step with the cursor. */
async function drag(from: Point, to: Point, ms: number, onPress: () => void) {
  await moveTo(from, 440)
  cursor.down = true
  cursor.clicks++
  build.dragMs = Math.round(ms * TEMPO)
  cursor.drag = true
  onPress()
  await moveTo(to, ms)
  if (!to) await tl.wait(build.dragMs) // no cursor (off screen): still let the shape finish
  cursor.drag = false
  cursor.down = false
}

/* ---------------- The script ---------------- */
function select(s: Selection | null) {
  build.selected = s
  if (s) build.lastSel = s
}

function resetToBlank() {
  tl.cancel()
  Object.assign(build, { step: S.BLANK, animated: false, selected: null, lastSel: 'hall', hidden: false })
  Object.assign(editor, {
    stage: 0, tool: null, pressed: null, types: [], uses: [], inspector: 'plan', rate: '', typing: false,
    booths: 0, counts: { available: 0, reserved: 0, sold: 0 }, published: false,
  })
  Object.assign(show, { handoff: false, tilted: false, extruded: false, routed: false, instant: true, flip: null })
  Object.assign(cursor, { shown: false, down: false, drag: false })
  phase.value = 'design'
  // turn transitions back on once the blank state has painted, so nothing animates backwards
  requestAnimationFrame(() => requestAnimationFrame(() => { build.animated = true }))
}

function play() {
  resetToBlank()
  started.value = true
  tl.run(async (wait) => {
    await wait(120)
    await designPlan(ms => wait(Math.round(ms * TEMPO)))
    await revealHall(wait)
  })
}

async function designPlan(wait: (ms: number) => Promise<void>) {
  const f = feature.value
  const step = (s: number, sel: Selection | null = build.selected, insp?: InspectorKey) => {
    build.step = s
    select(sel)
    if (insp) editor.inspector = insp
  }

  // 1 · Hall: drag out the hall at real scale, then put the entrance in the front wall
  editor.stage = 0
  await wait(250)
  const start = onPlan(420, 240)
  if (start) Object.assign(cursor, { x: start.x + 60, y: start.y + 40, ms: 0 })
  cursor.shown = true
  await wait(220)
  await useTool('hall')
  await drag(onPlan(0, 0), onPlan(600, 360), 1000, () => step(S.MARQUEE, null, 'hall'))
  step(S.WALLS, 'hall', 'hall')
  await wait(700)
  await moveTo(onPlan(318, 352), 520)
  await click()
  step(S.DOOR, 'door', 'door')
  sound.tick()
  await wait(700)

  // 2 · Booths: draw one booth by hand, then Auto-fill the rows
  editor.stage = 1
  select(null)
  await useTool('booth')
  await drag(onPlan(f.x, f.y), onPlan(f.x + f.w, f.y + f.h), 700, () => step(S.FEATURE, null, 'feature'))
  select('feature')
  editor.types = [f.type]
  editor.booths = 1
  sound.drop()
  await wait(1000)

  await useTool('fill')
  select(null)
  step(S.FILL, null, 'fill')
  editor.types = BOOTH_TYPES.map(t => t.key)
  for (let i = 2; i <= FLOOR_BOOTHS.length; i++) {
    editor.booths = i
    if (i % 4 === 0) sound.tick()
    await tl.wait(40)
  }
  await wait(600)

  // 3 · Areas: a stage dragged out, a café dropped in, emergency exits on the walls
  editor.stage = 2
  await useTool('area')
  const st = FLOOR_AREAS.stage
  await drag(onPlan(st.x, st.y), onPlan(st.x + st.w, st.y + st.h), 650, () => step(S.STAGE, null, 'stage'))
  select('stage')
  editor.uses = ['Stage']
  await wait(650)
  const c = FLOOR_AREAS.cafe
  await moveTo(onPlan(c.x + c.w / 2, c.y + c.h / 2), 620)
  await click()
  step(S.CAFE, 'cafe', 'cafe')
  editor.uses = ['Stage', 'Catering']
  sound.drop(0.02)
  await wait(700)
  step(S.EXITS, null, 'exits')
  editor.uses = ['Stage', 'Catering', 'Emergency exit']
  await wait(900)

  // 4 · Pricing: type a price per m² into the rate card; every booth goes on sale
  editor.stage = 3
  editor.tool = null
  editor.inspector = 'pricing'
  await wait(450) // inspector swap
  await moveTo(pointOn(rateEl.value), 520)
  await click()
  editor.typing = true
  for (const ch of String(RATE)) {
    editor.rate += ch
    await wait(130)
  }
  editor.typing = false
  await wait(200)
  step(S.PRICED)
  editor.counts = { available: FLOOR_BOOTHS.length, reserved: 0, sold: 0 }
  await wait(1400)

  // 5 · Publish: exhibitors book (the counts follow the booking wave), then publish
  editor.stage = 4
  step(S.SOLD)
  for (const b of FLOOR_BOOTHS) {
    const s = b.id === f.id ? 'sold' : b.status
    if (s !== 'available') {
      editor.counts.available--
      editor.counts[s]++
    }
    await tl.wait(45)
  }
  await wait(500)
  editor.inspector = 'plan'
  await moveTo(pointOn(publishEl.value), 600)
  await click()
  editor.published = true
  sound.chime()
  step(S.PUBLISHED)
  await wait(520)
  cursor.shown = false
  await wait(1000) // let the finished plan sit for a moment
}

async function revealHall(wait: (ms: number) => Promise<void>) {
  editor.stage = STAGES.length
  select(null)
  phase.value = 'reveal' // editor chrome fades away around the plan
  await wait(440)

  // Hand-off: the 3D plan starts exactly where the canvas plan is, flat, then tilts into place.
  const from = planEl.value?.getBoundingClientRect()
  const pos = planePosEl.value
  const to = pos?.getBoundingClientRect()
  if (from && pos && to && to.width) {
    const scale = to.width / pos.offsetWidth // showcase scale on this screen
    show.flip = {
      x: (from.left + from.width / 2 - (to.left + to.width / 2)) / scale,
      y: (from.top + from.height / 2 - (to.top + to.height / 2)) / scale,
      s: from.width / to.width,
    }
  }
  show.instant = true
  show.handoff = true
  build.hidden = true
  await tl.frame()
  await tl.frame()
  show.instant = false
  show.flip = null
  show.tilted = true
  sound.whoosh()
  await wait(1000)

  // Booths rise in a wave, then the visitor route is drawn
  show.extruded = true
  sound.deal(0.05, 1.05)
  sound.deal(0.2, 0.95)
  sound.deal(0.35, 1.1)
  sound.deal(0.5, 0.9)
  await wait(1100)
  show.routed = true
  sound.drop(0.9)
  await wait(1200)
  phase.value = 'done'
}

/** Jump straight to the 3D hall (from anywhere in the script). */
function skip() {
  tl.cancel()
  Object.assign(build, { animated: false, step: S.DONE, selected: null })
  Object.assign(editor, { types: BOOTH_TYPES.map(t => t.key), uses: AREA_USES.slice(0, 3), rate: String(RATE), typing: false, booths: FLOOR_BOOTHS.length, counts: finalCounts(), published: true })
  Object.assign(cursor, { shown: false, down: false, drag: false })
  tl.run(async wait => revealHall(wait))
}

function pickType(t: FloorBoothType) {
  if (phase.value === 'reveal') return
  typeKey.value = t.key
  // While designing, start over with the new type. Once done, the route re-draws to it.
  if (phase.value === 'design' && !reduced.value) play()
  else editor.counts = finalCounts()
}

/* ---------------- Mount: blank canvas, start when it scrolls into view ---------------- */
const root = ref<HTMLElement | null>(null)
const stageEl = ref<HTMLElement | null>(null)
const animate = ref(false)
const showEl = ref<HTMLElement | null>(null)
/** Showcase scale: the 3D hall is laid out at 600px and scaled down to fit narrow screens. */
const fs = ref(1)
let revealObserver: IntersectionObserver | null = null
let startObserver: IntersectionObserver | null = null
let fitObserver: ResizeObserver | null = null

onMounted(() => {
  if ('ResizeObserver' in window) {
    fitObserver = new ResizeObserver(([e]) => {
      if (e) fs.value = Math.min(1, (e.contentRect.width - 24) / 720)
    })
    if (showEl.value) fitObserver.observe(showEl.value)
  }
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced.value || !('IntersectionObserver' in window)) return

  mounted.value = true
  animate.value = true
  revealObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      e.target.classList.add('in')
      revealObserver?.unobserve(e.target)
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 })
  root.value?.querySelectorAll('.rv').forEach(el => revealObserver!.observe(el))

  resetToBlank()
  startObserver = new IntersectionObserver(([e]) => {
    if (e?.isIntersecting && !started.value) play()
  }, { threshold: 0.45 })
  if (stageEl.value) startObserver.observe(stageEl.value)
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
  startObserver?.disconnect()
  fitObserver?.disconnect()
})

/* ---------------- Template helpers ---------------- */
const planeStyle = computed(() => {
  const f = show.flip
  const transform = f
    ? `perspective(2400px) translate(${f.x}px, ${f.y}px) scale(${f.s}) rotateX(0deg) rotateZ(0deg)`
    : show.tilted
      ? 'perspective(2400px) translate(0px, 0px) scale(1) rotateX(var(--rx)) rotateZ(var(--rz))'
      : 'perspective(2400px) translate(0px, 0px) scale(1) rotateX(0deg) rotateZ(0deg)'
  return { transform, transition: show.instant ? 'none' : undefined }
})
/** Pin and booth card scale back up on small screens, so they stay readable. */
const showStyle = computed(() => ({ '--fs': fs.value, '--bbs': fs.value < 1 ? Math.min(1.8, 0.85 / fs.value) : 1 }))
const isRow = (row: Row | [Row, Row]): row is Row => !Array.isArray(row)
</script>

<template>
  <section id="floor-plans" ref="root" class="fd" :class="{ 'fd--animate': animate }">
    <div class="fd-rail">
      <div class="fd-body">
        <h2 class="fd-h2 rv">Your floor plan,<br><em>sold booth by booth.</em></h2>
        <p class="fd-lede rv" style="--i: 1">
          Draw the hall, fill it with booths in one click and price them per square metre.
          As exhibitors book, the plan fills in, and visitors get the same map with directions to every booth.
        </p>

        <div class="types" role="group" aria-label="Booth type">
          <button
            v-for="t in BOOTH_TYPES" :key="t.key" type="button" class="type-btn"
            :aria-pressed="typeKey === t.key" @click="pickType(t)"
          >
            <i :style="{ background: t.color }" />{{ t.label }}
          </button>
        </div>

        <!-- the scroll reveal sits on a wrapper: Vue owns the stage's class list -->
        <div class="rv">
          <div ref="stageEl" class="stage" :class="`is-${phase}`">
            <!-- Progress through the five design stages -->
            <div class="stepper">
              <ol>
                <li
                  v-for="(label, i) in STAGES" :key="label"
                  :class="{ now: i === editor.stage && phase === 'design', done: i < editor.stage }"
                >
                  <span class="dot">
                    <Icon v-if="i < editor.stage" name="lucide:check" class="ico" />
                    <template v-else>{{ i + 1 }}</template>
                  </span>
                  <span class="lbl">{{ label }}</span>
                </li>
              </ol>
              <div class="controls">
                <button
                  v-if="!reduced" type="button" class="ctl icon" :aria-pressed="sound.enabled.value"
                  :aria-label="sound.enabled.value ? 'Turn sound off' : 'Turn sound on'" @click="sound.toggle()"
                >
                  <Icon :name="sound.enabled.value ? 'lucide:volume-2' : 'lucide:volume-x'" class="ico" />
                </button>
                <button v-if="phase === 'design' && started" type="button" class="ctl" @click="skip">
                  Skip to 3D<Icon name="lucide:chevrons-right" class="ico" />
                </button>
                <button v-else-if="phase === 'done' && !reduced" type="button" class="ctl" @click="play">
                  <Icon name="lucide:rotate-ccw" class="ico" />Replay design
                </button>
              </div>
            </div>

            <div ref="scenesEl" class="scenes">
              <!-- Scene 1: the editor -->
              <div class="editor" role="img" :aria-label="`EXPOUSE floor plan editor laying out a hall step by step, starting with a ${type.label.toLowerCase()} booth`">
                <div class="ed-top">
                  <span class="ed-title"><b>Floor plans</b><small>Hall A · 50 × 30 m</small></span>
                  <span class="ed-tools"><i>↶</i><i>↷</i><i>100%</i></span>
                  <span ref="publishEl" class="ed-save" :class="{ saved: editor.published }">
                    <Icon :name="editor.published ? 'lucide:check' : 'lucide:send'" class="ico" />{{ editor.published ? 'Published' : 'Publish' }}
                  </span>
                </div>

                <div class="ed-body">
                  <aside class="ed-lib">
                    <small>Elements</small>
                    <div class="lib-grid">
                      <span
                        v-for="t in TOOLS" :key="t.key" :ref="keep(toolEls, t.key)"
                        :class="{ on: editor.tool === t.key, press: editor.pressed === t.key }"
                      >
                        <Icon :name="t.icon" class="ico" />
                        {{ t.label }}
                      </span>
                    </div>
                    <small>Booth types</small>
                    <div class="fields">
                      <span v-for="t in BOOTH_TYPES" :key="t.key" :class="{ on: editor.types.includes(t.key) }">{{ t.label }}</span>
                    </div>
                    <small>Area uses</small>
                    <div class="fields">
                      <span v-for="u in AREA_USES" :key="u" :class="{ on: editor.uses.includes(u) }">{{ u }}</span>
                    </div>
                  </aside>

                  <div class="ed-canvas">
                    <div
                      ref="planEl" class="canvas-plan" :class="{ handed: build.hidden }"
                      :style="{ '--drag': `${build.dragMs}ms` }"
                    >
                      <FloorPlan :step="build.step" :animated="build.animated" :feature="feature.id" />
                      <!-- Selection box: one box that glides from element to element -->
                      <div v-if="build.animated" class="sel" :class="{ on: build.selected }" :style="selStyle" aria-hidden="true">
                        <i /><i /><i /><i />
                      </div>
                    </div>
                    <span class="ready" :class="{ on: build.step >= S.PUBLISHED && build.step < S.DONE }">
                      <Icon name="lucide:check" class="ico" />Live on the event website and app
                    </span>
                  </div>

                  <aside class="ed-props">
                    <Transition name="insp" mode="out-in">
                      <div :key="editor.inspector" class="insp">
                        <small>{{ inspector.title }}</small>
                        <div
                          v-if="editor.inspector === 'pricing'" ref="rateEl" class="prop lit"
                        >
                          <span>Price per m²</span><b :class="{ caret: editor.typing }">{{ editor.rate ? `$${editor.rate}` : '$' }}</b>
                        </div>
                        <div v-for="(row, i) in inspector.rows" :key="i" :class="isRow(row) ? 'prop' : 'prop2'">
                          <template v-if="isRow(row)"><span>{{ row.label }}</span><b>{{ row.value }}</b></template>
                          <template v-else>
                            <div v-for="c in row" :key="c.label" class="prop"><span>{{ c.label }}</span><b>{{ c.value }}</b></div>
                          </template>
                        </div>
                      </div>
                    </Transition>
                    <small>Booth status</small>
                    <div class="legend">
                      <div v-for="l in LEGEND" :key="l.key" class="prop">
                        <span><i :style="{ background: l.color }" />{{ l.label }}</span>
                        <b :key="editor.counts[l.key]" class="bump">{{ editor.counts[l.key] }}</b>
                      </div>
                    </div>
                    <div class="prop" :class="{ lit: build.step >= S.PRICED && build.step < S.SOLD }">
                      <span>Booth {{ feature.id }}</span><b>{{ build.step >= S.PRICED ? money(boothPrice(feature)) : '–' }}</b>
                    </div>
                    <div class="prop"><span>Booths</span><b :key="editor.booths" class="bump">{{ editor.booths }}</b></div>
                  </aside>
                </div>
              </div>

              <!-- Scene 2: the published hall in 3D -->
              <div
                ref="showEl" class="showcase" :class="{ lit: show.handoff }" :style="showStyle"
                role="img" :aria-label="`The published floor plan in 3D, with a visitor route from the entrance to a ${type.label.toLowerCase()} booth`"
              >
                <div class="show-bg" aria-hidden="true">
                  <i class="blob b1" /><i class="blob b2" />
                  <i class="grid" />
                  <i class="glow" />
                  <i
                    v-for="([x, y, d, size], i) in SPARKS" :key="i" class="spark"
                    :style="{ left: `${x}%`, top: `${y}%`, width: `${size}px`, height: `${size}px`, animationDelay: `${d}s` }"
                  />
                  <i class="floor" />
                </div>
                <div class="show-note">
                  <span class="pill"><Icon name="lucide:check" class="ico" />Floor plan published</span>
                  <span class="sub">Visitors find every booth, on the web and in the app</span>
                </div>
                <div class="hall3d">
                  <div class="hall3d-scale">
                    <div ref="planePosEl" class="plane-pos">
                      <div class="plane" :style="planeStyle">
                        <FloorPlan
                          mode="3d" :animated="mounted" :feature="feature.id"
                          :highlight="show.routed ? typeKey : null" :extruded="show.extruded" :routed="show.routed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- The designer's cursor: x and y glide on different curves, so it moves in a gentle arc -->
              <div
                class="cursor" :class="{ on: cursor.shown, drag: cursor.drag }" aria-hidden="true"
                :style="{ transform: `translateX(${cursor.x}px)`, transitionDuration: `${cursor.ms}ms, 250ms` }"
              >
                <div class="cursor-y" :style="{ transform: `translateY(${cursor.y}px)`, transitionDuration: `${cursor.ms}ms` }">
                  <div class="cursor-tip" :class="{ down: cursor.down }">
                    <span :key="cursor.clicks" class="tap" />
                    <svg viewBox="0 0 24 24" width="22" height="22">
                      <path d="M5 3.2l13.4 7.3-5.9 1.6-2.6 5.6z" fill="#1A1A2E" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bpoints">
          <div v-for="(p, i) in POINTS" :key="p.title" class="rv" :style="{ '--i': i }">
            <b>{{ p.title }}</b>
            <span>{{ p.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.fd {
  --fd-brand: var(--color-brand, #6452E7);
  --fd-brand-soft: var(--color-brand-soft, #eef2ff);
  --fd-ink: var(--color-ink, #1f2430);
  --fd-muted: var(--color-muted, #6b7280);
  --fd-faint: var(--color-faint, #9aa1ad);
  --fd-line: var(--color-line, #e8e9ee);
  --fd-sunk: #f5f6f8;
  --fd-sunk-2: #f8f9fb;
  --fd-shadow-lg: 0 2px 6px rgba(20, 23, 40, .04), 0 40px 80px -32px rgba(49, 40, 140, .32);
  --fd-ease: cubic-bezier(.22, .8, .24, 1);
  color: var(--fd-ink);
}

.fd-rail { max-width: 1240px; margin-inline: auto; }
.fd-body { padding: clamp(20px, 4vw, 56px) clamp(56px, 8vw, 104px); text-align: center; }
.fd-h2 { margin: 0; font-size: clamp(34px, 5vw, 60px); font-weight: 800; letter-spacing: -.035em; line-height: 1.04; text-wrap: balance; }
.fd-h2 em { font-style: normal; color: var(--fd-brand); }
.fd-lede { margin: 18px auto 0; max-width: 60ch; font-size: clamp(17px, 1.6vw, 19px); line-height: 1.6; color: var(--fd-muted); }

/* ---------- Booth type picker ---------- */
.types { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin: 40px 0 24px; }
.type-btn {
  display: inline-flex; align-items: center; gap: 8px;
  font: inherit; font-weight: 700; font-size: 14px; padding: 9px 18px 9px 14px; border-radius: 999px;
  border: 1px solid var(--fd-line); background: #fff; color: var(--fd-muted); cursor: pointer; transition: all .2s;
}
.type-btn i { width: 10px; height: 10px; border-radius: 3px; box-shadow: 0 0 0 2px #fff, 0 0 0 3px var(--fd-line); }
.type-btn:hover { color: var(--fd-ink); border-color: #d7dae1; }
.type-btn[aria-pressed="true"] { background: var(--fd-ink); border-color: var(--fd-ink); color: #fff; }
.type-btn[aria-pressed="true"] i { box-shadow: 0 0 0 2px var(--fd-ink), 0 0 0 3px rgba(255, 255, 255, .5); }
.type-btn:focus-visible, .ctl:focus-visible { outline: 2px solid var(--fd-brand); outline-offset: 3px; }

/* ---------- Stage: stepper on top, two scenes stacked in one grid cell ---------- */
.stage { max-width: 1040px; margin-inline: auto; text-align: left; }

.stepper { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.stepper ol { list-style: none; margin: 0; padding: 0; display: flex; align-items: center; gap: 6px; min-width: 0; }
.stepper li { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: var(--fd-faint); transition: color .3s; }
.stepper li + li::before { content: ""; width: 22px; height: 2px; border-radius: 2px; background: var(--fd-line); margin-right: 2px; transition: background .4s; }
.stepper li.done + li::before, .stepper li.done::before { background: var(--fd-brand); }
.stepper .dot { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; background: #fff; border: 1px solid var(--fd-line); transition: all .3s; flex: none; }
.stepper .dot .ico { width: 13px; height: 13px; }
.stepper li.now { color: var(--fd-ink); }
.stepper li.now .dot { background: var(--fd-brand); border-color: var(--fd-brand); color: #fff; box-shadow: 0 0 0 4px var(--fd-brand-soft); }
.stepper li.done { color: var(--fd-muted); }
.stepper li.done .dot { background: var(--fd-brand-soft); border-color: transparent; color: var(--fd-brand); }
.controls { display: flex; align-items: center; gap: 6px; flex: none; }
.ctl {
  display: inline-flex; align-items: center; gap: 6px; font: inherit; font-size: 13px; font-weight: 700;
  color: var(--fd-ink); background: #fff; border: 1px solid var(--fd-line); border-radius: 999px; padding: 6px 12px; cursor: pointer;
  transition: border-color .2s, color .2s;
}
.ctl:hover { border-color: #cfd2db; color: var(--fd-brand); }
.ctl.icon { width: 32px; height: 32px; padding: 0; justify-content: center; }
.ctl .ico { width: 15px; height: 15px; }

.scenes { position: relative; display: grid; }
.scenes > .editor, .scenes > .showcase { grid-area: 1 / 1; }

/* ---------- Scene 1: editor ---------- */
.editor {
  background: #fff; border: 1px solid var(--fd-line); border-radius: 18px; box-shadow: var(--fd-shadow-lg); overflow: hidden;
  transition: background .4s, border-color .4s, box-shadow .4s;
}
.ed-top { display: flex; align-items: center; gap: 16px; padding: 12px 18px; border-bottom: 1px solid var(--fd-line); }
.ed-title { display: grid; line-height: 1.25; min-width: 0; }
.ed-title b { font-size: 14.5px; }
.ed-title small { font-size: 12px; color: var(--fd-faint); }
.ed-tools { margin-left: auto; display: flex; gap: 6px; }
.ed-tools i { font-style: normal; font-size: 12.5px; font-weight: 700; color: var(--fd-muted); background: var(--fd-sunk); border-radius: 7px; padding: 4px 9px; }
.ed-save {
  display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; background: var(--fd-brand); color: #fff;
  border-radius: 9px; padding: 8px 14px; white-space: nowrap; transition: background .3s, transform .15s;
}
.ed-save .ico { width: 14px; height: 14px; }
.ed-save.saved { background: #15803d; }

.ed-body { display: grid; grid-template-columns: 200px 1fr 220px; min-height: 460px; }
.ed-lib, .ed-props { padding: 16px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; align-content: start; font-size: 12.5px; min-width: 0; }
.ed-lib { border-right: 1px solid var(--fd-line); }
.ed-props { border-left: 1px solid var(--fd-line); }
.ed-lib small, .ed-props small { font-size: 11px; font-weight: 800; color: var(--fd-faint); text-transform: uppercase; letter-spacing: .06em; margin-top: 4px; }

.lib-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.lib-grid span {
  display: grid; justify-items: center; gap: 4px; padding: 10px 4px; border: 1px solid var(--fd-line); border-radius: 10px;
  font-weight: 600; color: var(--fd-muted); transition: border-color .2s, background .2s, color .2s, transform .15s;
}
.lib-grid span.on { border-color: var(--fd-brand); background: var(--fd-brand-soft); color: var(--fd-ink); }
.lib-grid span.press { transform: scale(.93); }
.lib-grid .ico { width: 18px; height: 18px; color: var(--fd-brand); }
.fields { display: flex; flex-wrap: wrap; gap: 5px; }
.fields span {
  background: var(--fd-brand-soft); color: var(--fd-brand); font-weight: 700; font-size: 11.5px; padding: 4px 9px; border-radius: 7px;
  box-shadow: 0 0 0 0 transparent; transition: background .25s, color .25s, box-shadow .25s;
}
.fields span.on { background: var(--fd-brand); color: #fff; box-shadow: 0 4px 10px -4px var(--fd-brand); }

.ed-canvas {
  position: relative; background: var(--fd-sunk-2); background-image: radial-gradient(#dadde5 1px, transparent 1px); background-size: 16px 16px;
  display: grid; place-items: center; align-content: center; gap: 14px; padding: 44px 24px 26px 44px; min-width: 0; transition: background-color .4s;
  container-type: inline-size;
}
.canvas-plan { position: relative; width: 100%; max-width: 560px; }
.canvas-plan.handed { visibility: hidden; }

/* Selection box: glides between elements and resizes to each one */
.sel {
  position: absolute; pointer-events: none; opacity: 0; border-radius: 3px;
  border: 1.5px dashed var(--fd-brand); background: rgba(99, 102, 241, .04);
  transition: left .5s var(--fd-ease), top .5s var(--fd-ease), width .5s var(--fd-ease), height .5s var(--fd-ease), opacity .22s ease;
}
.sel.on { opacity: 1; }
.sel i { position: absolute; width: 8px; height: 8px; background: #fff; border: 1.5px solid var(--fd-brand); border-radius: 2px; }
.sel i:nth-child(1) { left: -5px; top: -5px; }
.sel i:nth-child(2) { right: -5px; top: -5px; }
.sel i:nth-child(3) { left: -5px; bottom: -5px; }
.sel i:nth-child(4) { right: -5px; bottom: -5px; }
.ready {
  display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 800; color: #15803d; background: #dcfce7;
  padding: 5px 12px; border-radius: 999px; opacity: 0; transform: translateY(6px); transition: opacity .4s, transform .4s var(--fd-ease);
}
.ready .ico { width: 14px; height: 14px; }
.ready.on { opacity: 1; transform: none; }

.insp { display: grid; gap: 10px; }
.insp-enter-active { transition: opacity .22s ease, transform .3s var(--fd-ease), filter .22s ease; }
.insp-leave-active { transition: opacity .14s ease, transform .14s ease, filter .14s ease; }
.insp-enter-from { opacity: 0; transform: translateY(6px); filter: blur(2px); }
.insp-leave-to { opacity: 0; transform: translateY(-3px); filter: blur(2px); }
.prop { display: flex; justify-content: space-between; align-items: center; gap: 8px; background: var(--fd-sunk); border-radius: 8px; padding: 7px 10px; color: var(--fd-muted); }
.prop { transition: background .3s, box-shadow .3s; }
.prop.lit { background: var(--fd-brand-soft); box-shadow: inset 0 0 0 1px rgba(99, 102, 241, .35); }
.prop b { color: var(--fd-ink); font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
.prop b.caret::after { content: ""; display: inline-block; width: 1.5px; height: 1em; margin-left: 2px; vertical-align: -2px; background: var(--fd-brand); animation: blink .8s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
.bump { display: inline-block; animation: bump .35s var(--fd-ease); }
@keyframes bump { from { transform: translateY(-5px); opacity: 0; } }
.prop2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.legend { display: grid; gap: 6px; }
.legend span { display: inline-flex; align-items: center; gap: 7px; }
.legend span i { width: 9px; height: 9px; border-radius: 3px; }

/* Editor leaves: chrome fades, only the plan remains for the hand-off */
.ed-top, .ed-lib, .ed-props, .stepper ol { transition: opacity .38s ease, filter .38s ease; }
.is-reveal .editor, .is-done .editor { background: transparent; border-color: transparent; box-shadow: none; }
.is-reveal .ed-top, .is-reveal .ed-lib, .is-reveal .ed-props, .is-reveal .ready { opacity: 0; filter: blur(3px); }
.is-reveal .ed-canvas { background-color: transparent; background-image: none; }
.is-done .editor { visibility: hidden; }

/* ---------- Scene 2: the 3D hall ---------- */
.showcase {
  --rx: 54deg; --rz: 34deg; --pw: 600px; --fs: 1;
  position: relative; min-height: calc(130px + 430px * var(--fs)); border-radius: 18px; overflow: hidden; visibility: hidden; isolation: isolate;
}
.is-reveal .showcase, .is-done .showcase { visibility: visible; }

/* The stage: the badge section's brand gradient, drifting colour and a glow under the hall */
.show-bg {
  position: absolute; inset: 0; z-index: -1; overflow: hidden; opacity: 0; transition: opacity .8s ease;
  background:
    radial-gradient(110% 75% at 50% 0%, rgba(139, 124, 246, .55) 0%, rgba(139, 124, 246, 0) 62%),
    linear-gradient(160deg, var(--fd-brand) 0%, #4e3fd4 45%, #2e2391 100%);
}
.showcase.lit .show-bg { opacity: 1; }
.show-bg i { position: absolute; display: block; pointer-events: none; }
.blob { width: 46%; aspect-ratio: 1; border-radius: 50%; filter: blur(70px); }
.b1 { left: -12%; top: -24%; background: #8b7cf6; opacity: .45; animation: drift 14s ease-in-out infinite alternate; }
.b2 { right: -14%; top: 4%; background: #a99cff; opacity: .3; animation: drift 18s ease-in-out infinite alternate-reverse; }
@keyframes drift { to { transform: translate(9%, 12%) scale(1.12); } }
.grid {
  inset: 0; background: radial-gradient(rgba(255, 255, 255, .14) 1px, transparent 1.2px) 0 0 / 22px 22px;
  -webkit-mask: radial-gradient(70% 60% at 50% 45%, #000, transparent);
  mask: radial-gradient(70% 60% at 50% 45%, #000, transparent);
}
.glow { left: 50%; top: 58%; width: 640px; height: 300px; margin: -150px 0 0 -320px; border-radius: 50%; background: #1a1366; opacity: .55; filter: blur(60px); }
.spark { border-radius: 50%; background: #fff; box-shadow: 0 0 8px 2px rgba(255, 255, 255, .55); opacity: 0; animation: twinkle 4.2s ease-in-out infinite; }
@keyframes twinkle { 0%, 100% { opacity: 0; transform: scale(.4); } 45% { opacity: .9; transform: none; } }
.floor { left: 0; right: 0; bottom: 0; height: 28%; background: linear-gradient(to top, rgba(30, 22, 100, .55), transparent); }

.show-note { position: absolute; top: 34px; left: 0; right: 0; z-index: 6; display: grid; justify-items: center; gap: 8px; text-align: center; opacity: 0; transform: translateY(8px); transition: opacity .5s ease .2s, transform .5s var(--fd-ease) .2s; }
.is-done .show-note { opacity: 1; transform: none; }
.show-note .pill { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 800; color: var(--fd-ink); background: #fff; padding: 6px 14px; border-radius: 999px; box-shadow: 0 8px 24px -8px rgba(0, 0, 0, .45); }
.show-note .pill .ico { width: 14px; height: 14px; color: #15803d; }
.show-note .sub { font-size: 14px; color: rgba(255, 255, 255, .72); font-weight: 600; }

.hall3d { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding-top: calc(28px + 36px * var(--fs)); }
.hall3d-scale { flex: none; transform: scale(var(--fs)); }
.plane-pos { width: var(--pw); }
.plane { transform-style: preserve-3d; transform-origin: 50% 50%; transition: transform 1.25s cubic-bezier(.2, .85, .25, 1); }

/* ---------- Cursor ---------- */
/* x and y ease on different curves, so straight moves become soft arcs. Drags use one curve
   for both, matching the shape being pulled (FloorPlan uses the same easing and --drag). */
.cursor {
  position: absolute; left: 0; top: 0; z-index: 20; width: 22px; height: 22px; margin: -3px 0 0 -4px; pointer-events: none;
  opacity: 0; transition-property: transform, opacity; transition-timing-function: cubic-bezier(.5, .05, .2, 1), ease;
  filter: drop-shadow(0 3px 4px rgba(20, 23, 40, .3));
}
.cursor-y { transition-property: transform; transition-timing-function: cubic-bezier(.25, .1, .15, 1); }
.cursor.drag, .cursor.drag .cursor-y { transition-timing-function: cubic-bezier(.65, 0, .35, 1), ease; }
.cursor.on { opacity: 1; }
.cursor-tip { position: relative; transform-origin: 4px 3px; transition: transform .12s ease; }
.cursor-tip.down { transform: scale(.86); }
.cursor-tip > svg { position: relative; display: block; }
.tap { position: absolute; left: 0; top: 0; width: 26px; height: 26px; margin: -10px 0 0 -9px; border-radius: 50%; background: rgba(99, 82, 231, .35); transform: scale(0); opacity: 0; animation: tap .45s ease-out; }
@keyframes tap { from { transform: scale(.2); opacity: 1; } to { transform: scale(1.4); opacity: 0; } }

/* ---------- Feature points ---------- */
.bpoints { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; max-width: 1040px; margin: 40px auto 0; text-align: left; }
.bpoints div { display: grid; gap: 4px; align-content: start; border-top: 2px solid var(--fd-ink); padding-top: 14px; }
.bpoints b { font-size: 16px; }
.bpoints span { font-size: 14px; color: var(--fd-muted); }

/* ---------- Scroll reveal (only once mounted) ---------- */
.fd--animate .rv { opacity: 0; transform: translateY(26px); filter: blur(4px); transition: opacity .8s var(--fd-ease), transform .8s var(--fd-ease), filter .8s var(--fd-ease); transition-delay: calc(var(--i, 0) * 90ms); }
.fd--animate .rv.in { opacity: 1; transform: none; filter: none; }

/* ---------- Responsive ---------- */
@media (max-width: 960px) {
  .ed-body { grid-template-columns: 1fr; min-height: 0; }
  .ed-lib, .ed-props, .ed-tools { display: none; }
  .bpoints { grid-template-columns: 1fr 1fr; }
  .stepper li:not(.now) .lbl { display: none; }
}
@media (max-width: 640px) {
  .show-note { top: 22px; }
  .show-note .sub { display: none; }
  .ed-canvas { padding: 34px 14px 20px 32px; }
  .stepper li + li::before { width: 10px; }
  .ctl:not(.icon) { font-size: 12px; padding: 6px 10px; }
}
@media (max-width: 480px) {
  .bpoints { grid-template-columns: 1fr; }
  .stepper .lbl { display: none; }
}

/* ---------- Reduced motion: the finished 3D hall, no movement ---------- */
@media (prefers-reduced-motion: reduce) {
  .plane, .show-bg, .show-bg i, .show-note, .cursor, .cursor-y, .cursor-tip, .sel, .bump, .type-btn, .ed-save, .insp-enter-active, .insp-leave-active { transition: none !important; animation: none !important; }
  .spark { opacity: .6; }
}
</style>
