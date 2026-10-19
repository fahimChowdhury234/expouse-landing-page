<script setup lang="ts">
/**
 * 05 · Badge designer.
 *
 * A short, scripted product animation of the console's badge editor
 * (eventos-admin/modules/badge.expouse):
 *   1 Canvas  - the badge area is dragged out on a blank canvas
 *   2 Shape   - card edge drawn, curved header dragged down, footer band placed
 *   3 Brand   - the role colour blooms in, an image is dragged from the Images panel and
 *               dropped into the header's logo slot, event name added
 *   4 Details - name (typed), company, QR code, badge type
 *   5 Finish  - punch hole set, template saved, a light sweep, "ready to print"
 * Then the finished badge flies out and the other badge types are dealt
 * around it as a fan of cards.
 *
 * The cursor works the real editor UI: tools from the Elements panel, colours
 * and print options from the inspector, and the inspector follows the selected
 * element. Without JS, and with reduced motion, the finished fan is shown straight away.
 */
import { BADGE_ROLES, BADGE_STEP, badgeLayout, type BadgeRole, type BadgeSelection } from '~/utils/badges'

type Phase = 'design' | 'reveal' | 'done'
type Tool = 'text' | 'image' | 'qr' | 'shape'
type InspectorKey = 'canvas' | 'body' | BadgeSelection | 'template'
type Point = { x: number, y: number } | null

const STAGES = ['Canvas', 'Shape', 'Branding', 'Attendee details', 'Finish']
const TOOLS: { key: Tool, label: string, icon?: string }[] = [
  { key: 'text', label: 'Text' },
  { key: 'image', label: 'Image', icon: 'lucide:camera' },
  { key: 'qr', label: 'QR code', icon: 'lucide:scan-line' },
  { key: 'shape', label: 'Shape' },
]
const FIELDS = ['First name', 'Last name', 'Company', 'Job title', 'Event logo', 'Event date']
/** Inspector swatches: the role colours, ink first (it's also the name colour). */
const SWATCHES = ['#1F2430', '#6352E7', '#0F766E', '#BE123C', '#C2410C']
const POINTS = [
  { title: 'Drag & drop editor', text: 'Text, images, shapes, QR codes, backgrounds and Google Fonts.' },
  { title: 'Live attendee data', text: 'Names, company and role fill in for every person automatically.' },
  { title: 'A design per role', text: 'Visitors, exhibitors, VIPs, speakers, media and guests each get their own look.' },
  { title: 'Ready to print', text: 'Punch-hole guides, desk printing and self-service kiosks.' },
]

/* Fan layout, left to right: rotation and stacking (matches the reference). */
const FAN_ROT = [-30, -15, 0, 15, 30]
/** Twinkles on the showcase stage: left %, top %, delay s, size px. */
const SPARKS = [[9, 22, 0, 3], [18, 54, 1.4, 2], [27, 12, 2.6, 2], [74, 16, 0.7, 3], [84, 46, 2.1, 2], [92, 20, 3.3, 2], [63, 9, 1.9, 2], [38, 30, 3, 2], [6, 70, 2.4, 2]]
const FAN_Z = [1, 2, 5, 3, 4]
const CENTER = 2
/** Overall speed of the design script: lower is faster. Tune here, not step by step. */
const TEMPO = 0.9

/* ---------------- State ---------------- */
// The server renders the finished fan; the client resets to a blank canvas on mount.
const phase = ref<Phase>('done')
const roleKey = ref('VIP')
const role = computed<BadgeRole>(() => BADGE_ROLES.find(r => r.key === roleKey.value)!)
const layout = computed(() => badgeLayout(role.value))

const build = reactive({
  step: BADGE_STEP.DONE as number,
  animated: false,
  typed: undefined as number | undefined,
  typing: false,
  selected: null as BadgeSelection | null,
  /** Last selection, so the box fades out where it was instead of jumping. */
  lastSel: 'header' as BadgeSelection,
  /** Duration of the current drag, shared by the cursor and the shape it pulls. */
  dragMs: 700,
  hidden: false, // canvas badge hidden once the fan card takes over
})
const editor = reactive({
  stage: STAGES.length, // current stage index; = length when finished
  tool: null as Tool | null,
  pressed: null as Tool | null,
  fields: [] as string[],
  inspector: 'template' as InspectorKey,
  swatch: '#1F2430',
  layers: 10,
  nameSize: 24,
  nameWeight: 'Bold',
  punch: true,
  saved: true,
})
const cursor = reactive({ x: 0, y: 0, shown: false, ms: 0, clicks: 0, down: false, drag: false })
/** The image being dragged: it rides on the cursor, lifts on pick-up and shrinks into its slot on drop. */
const carry = reactive({ on: false, lifted: false, over: false, dropped: false, scale: 0.54 })
const fan = reactive({
  handoff: true,
  dealt: true,
  instant: false,
  flip: null as null | { x: number, y: number, s: number },
})

const reduced = ref(false)
const started = ref(false)
const tl = useTimeline()
const sound = useCardSound()

/** Where each role sits in the fan: the chosen role swaps places with the middle card. */
const slotOf = computed(() => {
  const order = BADGE_ROLES.map(r => r.key)
  const i = order.indexOf(roleKey.value)
  ;[order[i], order[CENTER]] = [order[CENTER]!, order[i]!]
  const slots: Record<string, number> = {}
  order.forEach((k, s) => { slots[k] = s })
  return slots
})

/* ---------------- Inspector (right panel) ---------------- */
interface Row { label: string, value: string | number }
interface Inspector { title: string, rows: (Row | [Row, Row])[] }

const inspector = computed<Inspector>(() => {
  switch (editor.inspector) {
    case 'canvas': return { title: 'Canvas · Badge', rows: [{ label: 'Size', value: '86 × 128 mm' }, { label: 'Orientation', value: 'Portrait' }, { label: 'Bleed', value: '3 mm' }] }
    case 'body': return { title: 'Shape · Card', rows: [{ label: 'Fill', value: 'White' }, [{ label: 'Corners', value: 14 }, { label: 'Border', value: 1 }]] }
    case 'header': return { title: 'Shape · Header wave', rows: [{ label: 'Fill', value: build.step >= BADGE_STEP.COLOR ? 'Gradient' : 'Grey' }, [{ label: 'Width', value: 'Full' }, { label: 'Height', value: 112 }], { label: 'Curve', value: 'Wave' }] }
    case 'footer': return { title: 'Shape · Footer band', rows: [{ label: 'Fill', value: build.step >= BADGE_STEP.COLOR ? 'Role colour' : 'Grey' }, [{ label: 'Width', value: 'Full' }, { label: 'Height', value: 41 }]] }
    case 'logo': return { title: 'Image · Event logo', rows: [{ label: 'File', value: 'expo-logo.jpg' }, [{ label: 'Size', value: 28 }, { label: 'Radius', value: 8 }], { label: 'Fit', value: 'Cover' }] }
    case 'event': return { title: 'Text · Event name & date', rows: [{ label: 'Font', value: 'Cairo' }, [{ label: 'Size', value: 10.5 }, { label: 'Weight', value: 'Bold' }], { label: 'Color', value: 'White' }] }
    case 'name': return { title: 'Text · First & last name', rows: [{ label: 'Font', value: 'Cairo' }, [{ label: 'Size', value: editor.nameSize }, { label: 'Weight', value: editor.nameWeight }], { label: 'Align', value: 'Center' }] }
    case 'company': return { title: 'Text · Company', rows: [{ label: 'Font', value: 'Cairo' }, [{ label: 'Size', value: 12.5 }, { label: 'Weight', value: 'Medium' }], { label: 'Color', value: 'Muted' }] }
    case 'qr': return { title: 'QR code · Badge token', rows: [{ label: 'Data', value: 'Secure token' }, [{ label: 'Size', value: 92 }, { label: 'Style', value: 'Square' }]] }
    case 'role': return { title: 'Text · Badge type', rows: [{ label: 'Font', value: 'Cairo' }, [{ label: 'Size', value: 13 }, { label: 'Weight', value: 'Bold' }], { label: 'Spacing', value: '0.2 em' }] }
    case 'punch': return { title: 'Print · Punch hole', rows: [{ label: 'Position', value: 'Top' }, [{ label: 'Width', value: 46 }, { label: 'Height', value: 9 }]] }
    default: return { title: `Template · ${role.value.label} badge`, rows: [{ label: 'Status', value: 'Ready to print' }, { label: 'Fields', value: 'Live' }, { label: 'Format', value: '86 × 128 mm' }] }
  }
})

/** The editor's selection box, in % of the badge so it scales with it. It glides between elements. */
const selStyle = computed(() => {
  const [x, y, w, h] = layout.value.boxes[build.selected ?? build.lastSel]
  return { left: `${(x / 240) * 100}%`, top: `${(y / 360) * 100}%`, width: `${(w / 240) * 100}%`, height: `${(h / 360) * 100}%` }
})

/* ---------------- Cursor ---------------- */
const scenesEl = ref<HTMLElement | null>(null)
const badgeEl = ref<HTMLElement | null>(null)
const saveEl = ref<HTMLElement | null>(null)
const punchEl = ref<HTMLElement | null>(null)
const thumbEl = ref<HTMLElement | null>(null)
const toolEls: Partial<Record<Tool, HTMLElement>> = {}
const swatchEls: Record<string, HTMLElement> = {}
const slotEls: Record<string, HTMLElement> = {}
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
/** A point on the badge, in badge coordinates (240 × 360). */
const onBadge = (x: number, y: number) => pointOn(badgeEl.value, x / 240, y / 360)

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
function select(s: BadgeSelection | null) {
  build.selected = s
  if (s) build.lastSel = s
}

function resetToBlank() {
  tl.cancel()
  Object.assign(build, { step: BADGE_STEP.BLANK, animated: false, typed: 0, typing: false, selected: null, lastSel: 'header', hidden: false })
  Object.assign(editor, { stage: 0, tool: null, pressed: null, fields: [], inspector: 'canvas', swatch: '#1F2430', layers: 0, nameSize: 12, nameWeight: 'Regular', punch: false, saved: false })
  Object.assign(fan, { handoff: false, dealt: false, instant: true, flip: null })
  Object.assign(cursor, { shown: false, down: false, drag: false })
  Object.assign(carry, { on: false, lifted: false, over: false, dropped: false })
  phase.value = 'design'
  // turn transitions back on once the blank state has painted, so nothing animates backwards
  requestAnimationFrame(() => requestAnimationFrame(() => { build.animated = true }))
}

function play() {
  resetToBlank()
  started.value = true
  tl.run(async (wait) => {
    await wait(120)
    await designBadge(ms => wait(Math.round(ms * TEMPO)))
    await revealCards(wait)
  })
}

async function designBadge(wait: (ms: number) => Promise<void>) {
  const r = role.value
  const L = layout.value
  const step = (s: number, sel: BadgeSelection | null = build.selected, insp?: InspectorKey) => {
    build.step = s
    select(sel)
    if (insp) editor.inspector = insp
  }

  // 1 · Canvas: pick the Shape tool and drag out the badge area
  editor.stage = 0
  await wait(250)
  const start = onBadge(150, 200)
  if (start) Object.assign(cursor, { x: start.x + 50, y: start.y + 30, ms: 0 })
  cursor.shown = true
  await wait(220)
  await useTool('shape')
  await drag(onBadge(3, 3), onBadge(237, 357), 900, () => step(BADGE_STEP.MARQUEE))
  await wait(100)

  // 2 · Shape: outline, card, curved header, footer band
  editor.stage = 1
  step(BADGE_STEP.OUTLINE, null, 'body')
  editor.layers = 1
  await wait(420)
  step(BADGE_STEP.BODY)
  await drag(onBadge(24, 6), onBadge(24, 108), 650, () => {
    step(BADGE_STEP.HEADER, null, 'header')
    editor.layers = 2
  })
  select('header') // selected once it's in place, so the box doesn't sit ahead of the shape
  await wait(220)
  await moveTo(onBadge(214, 338), 480)
  await click()
  step(BADGE_STEP.FOOTER, 'footer', 'footer')
  editor.layers = 3
  await wait(460)

  // 3 · Branding: pick the role colour, then the event logo and name
  editor.stage = 2
  select('header')
  editor.inspector = 'header'
  await moveTo(pointOn(swatchEls[r.color]) ?? onBadge(70, 40), 520)
  await click()
  editor.swatch = r.color
  step(BADGE_STEP.COLOR)
  await wait(820)

  await useTool('image')
  editor.fields = ['Event logo']
  await dragImage(wait)
  editor.layers = 4
  await wait(900)

  await useTool('text')
  editor.fields = ['Event date']
  await moveTo(onBadge(128, 66), 420)
  await click()
  step(BADGE_STEP.EVENT, 'event', 'event')
  editor.layers = 5
  await wait(780)

  // 4 · Attendee details: name (typed), company, QR code, badge type
  editor.stage = 3
  editor.fields = ['First name', 'Last name']
  await moveTo(onBadge(120, L.nameY[0]! - 6), 460)
  await click()
  editor.swatch = '#1F2430'
  build.typing = true
  step(BADGE_STEP.NAME, 'name', 'name')
  editor.layers = 6
  for (let i = 1; i <= r.name.length; i++) {
    build.typed = i
    editor.nameSize = Math.round(12 + (12 * i) / r.name.length)
    if (i === Math.ceil(r.name.length / 2)) editor.nameWeight = 'SemiBold'
    await wait(46)
  }
  editor.nameWeight = 'Bold'
  build.typing = false
  await wait(380)

  editor.fields = ['Company']
  await moveTo(onBadge(120, L.companyY - 4), 380)
  await click()
  step(BADGE_STEP.COMPANY, 'company', 'company')
  editor.layers = 7
  await wait(600)

  await useTool('qr')
  editor.fields = []
  await moveTo(onBadge(120, 261), 480)
  await click()
  step(BADGE_STEP.QR, 'qr', 'qr')
  editor.layers = 8
  await wait(1000)

  await moveTo(onBadge(120, 340), 420)
  await click()
  step(BADGE_STEP.ROLE, 'role', 'role')
  editor.layers = 9
  await wait(720)

  // 5 · Finish: punch hole, save the template, final sweep
  editor.stage = 4
  select(null)
  editor.tool = null
  editor.inspector = 'punch'
  await moveTo(pointOn(punchEl.value) ?? onBadge(120, 16), 540)
  await click()
  editor.punch = true
  step(BADGE_STEP.PUNCH, 'punch')
  editor.layers = 10
  await wait(640)

  select(null)
  editor.inspector = 'template'
  await moveTo(pointOn(saveEl.value), 560)
  await click()
  editor.saved = true
  sound.chime()
  step(BADGE_STEP.FINISH)
  await wait(520)
  cursor.shown = false
  await wait(1050) // let the finished badge sit for a moment
}

/** Drag the sample image from the Images panel and drop it into the header's logo slot. */
async function dragImage(wait: (ms: number) => Promise<void>) {
  const target = onBadge(32, 66)
  const from = pointOn(thumbEl.value)
  if (!from) {
    // panel hidden (small screens): the slot lights up and the image drops straight in
    await moveTo(target, 460)
    build.step = BADGE_STEP.DROP
    await wait(420)
    await click()
    sound.drop()
    build.step = BADGE_STEP.LOGO
    select('logo')
    editor.inspector = 'logo'
    return
  }

  await moveTo(from, 620)
  await wait(160)
  // pick up: the image lifts off the thumbnail
  cursor.down = true
  cursor.clicks++
  carry.on = true
  select(null)
  sound.tick()
  await tl.frame()
  carry.lifted = true
  await wait(380)

  // carry it across in a slow arc; the slot lights up once the image is over the badge
  const travel = moveTo(target, 1500)
  await wait(900)
  build.step = BADGE_STEP.DROP
  carry.over = true // shrinks a little so the drop zone shows around it
  await travel
  await wait(320) // hover over the drop zone for a beat

  // drop: the carried image shrinks to the slot's size and the badge image settles in under it
  const badge = badgeEl.value?.getBoundingClientRect()
  carry.scale = badge ? (28 * (badge.width / 240)) / 52 : 0.54
  cursor.down = false
  carry.dropped = true
  build.step = BADGE_STEP.LOGO
  sound.drop(0.05)
  await wait(140)
  select('logo')
  editor.inspector = 'logo'
  await wait(300)
  Object.assign(carry, { on: false, lifted: false, over: false, dropped: false })
}

async function revealCards(wait: (ms: number) => Promise<void>) {
  editor.stage = STAGES.length
  phase.value = 'reveal' // editor chrome fades away around the badge
  await wait(440)

  // Hand-off: the centre card starts exactly where the canvas badge is, then flies to its place.
  const center = slotEls[roleKey.value]
  const from = badgeEl.value?.getBoundingClientRect()
  const to = center?.getBoundingClientRect()
  if (from && to && to.width) {
    const scale = to.width / 240 // fan scale on this screen
    fan.flip = { x: (from.left - to.left) / scale, y: (from.top - to.top) / scale, s: from.width / to.width }
  }
  fan.instant = true
  fan.handoff = true
  build.hidden = true
  await tl.frame()
  await tl.frame()
  fan.instant = false
  fan.flip = null
  sound.whoosh()
  sound.deal(0.62, 0.8) // lands
  await wait(380)

  // Deal the other badge types out from behind it (inner pair, then the outer pair 110 ms later)
  fan.dealt = true
  sound.deal(0.34, 1.05)
  sound.deal(0.41, 0.95)
  sound.deal(0.47, 1.15)
  sound.deal(0.53, 0.9)
  await wait(1150)
  phase.value = 'done'
}

/** Jump straight to the cards (from anywhere in the script). */
function skip() {
  tl.cancel()
  Object.assign(build, { animated: false, step: BADGE_STEP.DONE, typed: undefined, typing: false, selected: null })
  Object.assign(cursor, { shown: false, down: false, drag: false })
  Object.assign(carry, { on: false, lifted: false, over: false, dropped: false })
  tl.run(async wait => revealCards(wait))
}

function pickRole(r: BadgeRole) {
  if (phase.value === 'reveal') return
  roleKey.value = r.key
  // While designing, start over with the new role. Once done, the fan reshuffles around it.
  if (phase.value === 'design' && !reduced.value) play()
}

/* ---------------- Mount: blank canvas, start when it scrolls into view ---------------- */
const root = ref<HTMLElement | null>(null)
const stageEl = ref<HTMLElement | null>(null)
const animate = ref(false)
let revealObserver: IntersectionObserver | null = null
let startObserver: IntersectionObserver | null = null

onMounted(() => {
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced.value || !('IntersectionObserver' in window)) return

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
})

/* ---------------- Template helpers ---------------- */
const slotStyle = (r: BadgeRole) => {
  const s = slotOf.value[r.key]!
  return {
    zIndex: FAN_Z[s],
    transform: fan.flip ? `translate(${fan.flip.x}px, ${fan.flip.y}px) scale(${fan.flip.s})` : undefined,
    transition: fan.instant ? 'none' : undefined,
  }
}
const cardStyle = (r: BadgeRole) => {
  const s = slotOf.value[r.key]!
  const out = s === CENTER || fan.dealt
  return {
    '--rot': `${out ? FAN_ROT[s] : 0}deg`,
    '--delay': `${Math.abs(s - CENTER) === 2 ? 110 : 0}ms`,
    transition: fan.instant ? 'none' : undefined,
  }
}
const isRow = (row: Row | [Row, Row]): row is Row => !Array.isArray(row)
</script>

<template>
  <section id="badges" ref="root" class="bd" :class="{ 'bd--animate': animate }">
    <div class="bd-rail">
      <div class="bd-body">
        <h2 class="bd-h2 rv">Your badges,<br><em>made in-house.</em></h2>
        <p class="bd-lede rv" style="--i: 1">
          No designer, no print shop. Drag names, logos and a QR code onto the badge, give each role its own design,
          and every attendee's details fill in by themselves.
        </p>

        <div class="roles" role="group" aria-label="Badge role">
          <button
            v-for="r in BADGE_ROLES" :key="r.key" type="button" class="role-btn"
            :aria-pressed="roleKey === r.key" @click="pickRole(r)"
          >
            <i :style="{ background: `linear-gradient(135deg, ${r.color}, ${r.color2})` }" />{{ r.label }}
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
                  :aria-label="sound.enabled.value ? 'Turn card sound off' : 'Turn card sound on'" @click="sound.toggle()"
                >
                  <Icon :name="sound.enabled.value ? 'lucide:volume-2' : 'lucide:volume-x'" class="ico" />
                </button>
                <button v-if="phase === 'design' && started" type="button" class="ctl" @click="skip">
                  Skip to cards<Icon name="lucide:chevrons-right" class="ico" />
                </button>
                <button v-else-if="phase === 'done' && !reduced" type="button" class="ctl" @click="play">
                  <Icon name="lucide:rotate-ccw" class="ico" />Replay design
                </button>
              </div>
            </div>

            <div ref="scenesEl" class="scenes">
              <!-- Scene 1: the editor -->
              <div class="editor" role="img" :aria-label="`EXPOUSE badge designer building a ${role.label} badge step by step`">
                <div class="ed-top">
                  <span class="ed-title"><b>Badge templates</b><small>{{ role.label }} badge</small></span>
                  <span class="ed-tools"><i>↶</i><i>↷</i><i>100%</i></span>
                  <span ref="saveEl" class="ed-save" :class="{ saved: editor.saved }">
                    <Icon v-if="editor.saved" name="lucide:check" class="ico" />{{ editor.saved ? 'Saved' : 'Save template' }}
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
                        <Icon v-if="t.icon" :name="t.icon" class="ico" />
                        <b v-else-if="t.key === 'text'">T</b>
                        <i v-else class="sq" />
                        {{ t.label }}
                      </span>
                    </div>
                    <small>Attendee fields</small>
                    <div class="fields">
                      <span v-for="f in FIELDS" :key="f" :class="{ on: editor.fields.includes(f) }">{{ f }}</span>
                    </div>
                    <small>Images</small>
                    <div class="thumbs" :class="{ on: editor.tool === 'image' }">
                      <span ref="thumbEl" class="thumb" :class="{ taken: carry.on }"><BadgeDummyImage :radius="7" /></span>
                      <span class="thumb"><BadgeDummyImage :variant="1" :radius="7" /></span>
                      <span class="thumb"><BadgeDummyImage :variant="2" :radius="7" /></span>
                    </div>
                  </aside>

                  <div class="ed-canvas">
                    <span class="artboard" :class="{ on: build.step >= BADGE_STEP.MARQUEE }">Badge · 86 × 128 mm</span>
                    <div
                      ref="badgeEl" class="canvas-badge"
                      :class="{ solid: build.step >= BADGE_STEP.BODY, handed: build.hidden }"
                      :style="{ '--drag': `${build.dragMs}ms` }"
                    >
                      <BadgeCard
                        :role="role" :step="build.step" :typed="build.typed" :typing="build.typing"
                        :animated="build.animated"
                      />
                      <!-- Selection box: one box that glides from element to element -->
                      <div v-if="build.animated" class="sel" :class="{ on: build.selected }" :style="selStyle" aria-hidden="true">
                        <i /><i /><i /><i />
                      </div>
                    </div>
                    <span class="ready" :class="{ on: build.step >= BADGE_STEP.FINISH && build.step < BADGE_STEP.DONE }">
                      <Icon name="lucide:check" class="ico" />Ready to print
                    </span>
                  </div>

                  <aside class="ed-props">
                    <Transition name="insp" mode="out-in">
                      <div :key="editor.inspector" class="insp">
                        <small>{{ inspector.title }}</small>
                        <div v-for="(row, i) in inspector.rows" :key="i" :class="isRow(row) ? 'prop' : 'prop2'">
                          <template v-if="isRow(row)"><span>{{ row.label }}</span><b>{{ row.value }}</b></template>
                          <template v-else>
                            <div v-for="c in row" :key="c.label" class="prop"><span>{{ c.label }}</span><b>{{ c.value }}</b></div>
                          </template>
                        </div>
                      </div>
                    </Transition>
                    <small>Color</small>
                    <div class="colors">
                      <i
                        v-for="c in SWATCHES" :key="c" :ref="keep(swatchEls, c)"
                        :class="{ on: editor.swatch === c }" :style="{ background: c }"
                      />
                    </div>
                    <small>Print</small>
                    <div ref="punchEl" class="prop" :class="{ lit: editor.inspector === 'punch' }">
                      <span>Punch hole</span><b>{{ editor.punch ? 'Top' : 'Off' }}</b>
                    </div>
                    <div class="prop"><span>Layers</span><b :key="editor.layers" class="bump">{{ editor.layers }}</b></div>
                  </aside>
                </div>
              </div>

              <!-- Scene 2: the finished badges, fanned out -->
              <div
                class="showcase" :class="{ lit: fan.handoff }" :style="{ '--glow': role.color, '--glow2': role.color2 }"
                role="img" :aria-label="`Finished ${role.label} badge in front of the other badge types: ${BADGE_ROLES.map(r => r.label).join(', ')}`"
              >
                <!-- Stage: brand-colour gradient, light rays from the fan's pivot, a glow in the role's colours -->
                <div class="show-bg" aria-hidden="true">
                  <i class="blob b1" /><i class="blob b2" />
                  <i class="rays" />
                  <i class="grid" />
                  <i class="glow" />
                  <i
                    v-for="([x, y, d, size], i) in SPARKS" :key="i" class="spark"
                    :style="{ left: `${x}%`, top: `${y}%`, width: `${size}px`, height: `${size}px`, animationDelay: `${d}s` }"
                  />
                  <i class="floor" />
                </div>
                <div class="show-note">
                  <span class="pill"><Icon name="lucide:check" class="ico" />{{ role.label }} badge designed</span>
                  <span class="sub">One template, a different look for each role</span>
                </div>
                <div class="fan" :class="{ handoff: fan.handoff, dealt: fan.dealt }">
                  <div
                    v-for="r in BADGE_ROLES" :key="r.key" :ref="keep(slotEls, r.key)"
                    class="slot" :class="{ center: slotOf[r.key] === CENTER }" :style="slotStyle(r)"
                  >
                    <div class="card" :style="cardStyle(r)">
                      <BadgeCard :role="r" />
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
                  <div
                    v-if="carry.on" class="ghost" :class="{ lifted: carry.lifted, over: carry.over, dropped: carry.dropped }"
                    :style="{ '--drop': carry.scale }"
                  >
                    <BadgeDummyImage :radius="7" />
                  </div>
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
.bd {
  --bd-brand: var(--color-brand, #6452E7 );
  --bd-brand-soft: var(--color-brand-soft, #eef2ff);
  --bd-ink: var(--color-ink, #1f2430);
  --bd-muted: var(--color-muted, #6b7280);
  --bd-faint: var(--color-faint, #9aa1ad);
  --bd-line: var(--color-line, #e8e9ee);
  --bd-sunk: #f5f6f8;
  --bd-sunk-2: #f8f9fb;
  --bd-shadow-lg: 0 2px 6px rgba(20, 23, 40, .04), 0 40px 80px -32px rgba(49, 40, 140, .32);
  --bd-ease: cubic-bezier(.22, .8, .24, 1);
  color: var(--bd-ink);
}

.bd-rail { max-width: 1240px; margin-inline: auto; }
.bd-body { padding: clamp(20px, 4vw, 56px) clamp(56px, 8vw, 104px); text-align: center; }
.bd-h2 { margin: 0; font-size: clamp(34px, 5vw, 60px); font-weight: 800; letter-spacing: -.035em; line-height: 1.04; text-wrap: balance; }
.bd-h2 em { font-style: normal; color: var(--bd-brand); }
.bd-lede { margin: 18px auto 0; max-width: 60ch; font-size: clamp(17px, 1.6vw, 19px); line-height: 1.6; color: var(--bd-muted); }

/* ---------- Role picker ---------- */
.roles { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin: 40px 0 24px; }
.role-btn {
  display: inline-flex; align-items: center; gap: 8px;
  font: inherit; font-weight: 700; font-size: 14px; padding: 9px 18px 9px 14px; border-radius: 999px;
  border: 1px solid var(--bd-line); background: #fff; color: var(--bd-muted); cursor: pointer; transition: all .2s;
}
.role-btn i { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 0 2px #fff, 0 0 0 3px var(--bd-line); }
.role-btn:hover { color: var(--bd-ink); border-color: #d7dae1; }
.role-btn[aria-pressed="true"] { background: var(--bd-ink); border-color: var(--bd-ink); color: #fff; }
.role-btn[aria-pressed="true"] i { box-shadow: 0 0 0 2px var(--bd-ink), 0 0 0 3px rgba(255, 255, 255, .5); }
.role-btn:focus-visible, .ctl:focus-visible { outline: 2px solid var(--bd-brand); outline-offset: 3px; }

/* ---------- Stage: stepper on top, two scenes stacked in one grid cell ---------- */
.stage { max-width: 1040px; margin-inline: auto; text-align: left; }

.stepper { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.stepper ol { list-style: none; margin: 0; padding: 0; display: flex; align-items: center; gap: 6px; min-width: 0; }
.stepper li { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: var(--bd-faint); transition: color .3s; }
.stepper li + li::before { content: ""; width: 22px; height: 2px; border-radius: 2px; background: var(--bd-line); margin-right: 2px; transition: background .4s; }
.stepper li.done + li::before, .stepper li.done::before { background: var(--bd-brand); }
.stepper .dot { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; background: #fff; border: 1px solid var(--bd-line); transition: all .3s; flex: none; }
.stepper .dot .ico { width: 13px; height: 13px; }
.stepper li.now { color: var(--bd-ink); }
.stepper li.now .dot { background: var(--bd-brand); border-color: var(--bd-brand); color: #fff; box-shadow: 0 0 0 4px var(--bd-brand-soft); }
.stepper li.done { color: var(--bd-muted); }
.stepper li.done .dot { background: var(--bd-brand-soft); border-color: transparent; color: var(--bd-brand); }
.controls { display: flex; align-items: center; gap: 6px; flex: none; }
.ctl {
  display: inline-flex; align-items: center; gap: 6px; font: inherit; font-size: 13px; font-weight: 700;
  color: var(--bd-ink); background: #fff; border: 1px solid var(--bd-line); border-radius: 999px; padding: 6px 12px; cursor: pointer;
  transition: border-color .2s, color .2s;
}
.ctl:hover { border-color: #cfd2db; color: var(--bd-brand); }
.ctl.icon { width: 32px; height: 32px; padding: 0; justify-content: center; }
.ctl .ico { width: 15px; height: 15px; }

.scenes { position: relative; display: grid; }
.scenes > .editor, .scenes > .showcase { grid-area: 1 / 1; }

/* ---------- Scene 1: editor ---------- */
.editor {
  background: #fff; border: 1px solid var(--bd-line); border-radius: 18px; box-shadow: var(--bd-shadow-lg); overflow: hidden;
  transition: background .4s, border-color .4s, box-shadow .4s;
}
.ed-top { display: flex; align-items: center; gap: 16px; padding: 12px 18px; border-bottom: 1px solid var(--bd-line); }
.ed-title { display: grid; line-height: 1.25; min-width: 0; }
.ed-title b { font-size: 14.5px; }
.ed-title small { font-size: 12px; color: var(--bd-faint); }
.ed-tools { margin-left: auto; display: flex; gap: 6px; }
.ed-tools i { font-style: normal; font-size: 12.5px; font-weight: 700; color: var(--bd-muted); background: var(--bd-sunk); border-radius: 7px; padding: 4px 9px; }
.ed-save {
  display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; background: var(--bd-brand); color: #fff;
  border-radius: 9px; padding: 8px 14px; white-space: nowrap; transition: background .3s, transform .15s;
}
.ed-save .ico { width: 14px; height: 14px; }
.ed-save.saved { background: #15803d; }

.ed-body { display: grid; grid-template-columns: 210px 1fr 220px; min-height: 460px; }
.ed-lib, .ed-props { padding: 16px; display: grid; gap: 10px; align-content: start; font-size: 12.5px; }
.ed-lib { border-right: 1px solid var(--bd-line); }
.ed-props { border-left: 1px solid var(--bd-line); }
.ed-lib small, .ed-props small { font-size: 11px; font-weight: 800; color: var(--bd-faint); text-transform: uppercase; letter-spacing: .06em; margin-top: 4px; }

.lib-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.lib-grid span {
  display: grid; justify-items: center; gap: 4px; padding: 10px 4px; border: 1px solid var(--bd-line); border-radius: 10px;
  font-weight: 600; color: var(--bd-muted); transition: border-color .2s, background .2s, color .2s, transform .15s;
}
.lib-grid span.on { border-color: var(--bd-brand); background: var(--bd-brand-soft); color: var(--bd-ink); }
.lib-grid span.press { transform: scale(.93); }
.lib-grid b { font-size: 17px; line-height: 18px; color: var(--bd-brand); }
.lib-grid .ico { width: 18px; height: 18px; color: var(--bd-brand); }
.lib-grid .sq { width: 16px; height: 16px; border-radius: 4px; border: 2px solid var(--bd-brand); display: block; }
.fields { display: flex; flex-wrap: wrap; gap: 5px; }
.fields span {
  background: var(--bd-brand-soft); color: var(--bd-brand); font-weight: 700; font-size: 11.5px; padding: 4px 9px; border-radius: 7px;
  box-shadow: 0 0 0 0 transparent; transition: background .25s, color .25s, box-shadow .25s;
}
.fields span.on { background: var(--bd-brand); color: #fff; box-shadow: 0 4px 10px -4px var(--bd-brand); }
.thumbs { display: flex; gap: 6px; padding: 4px; margin: -4px; border-radius: 12px; transition: background .3s; }
.thumbs.on { background: var(--bd-brand-soft); }
.thumb { width: 52px; height: 52px; border-radius: 10px; padding: 0; box-shadow: 0 0 0 1px var(--bd-line); background: var(--bd-sunk); transition: opacity .3s, box-shadow .3s; }
.thumb svg { display: block; width: 100%; height: 100%; }
.thumb.taken { opacity: .3; box-shadow: 0 0 0 1.5px var(--bd-brand); }

.ed-canvas {
  position: relative; background: var(--bd-sunk-2); background-image: radial-gradient(#dadde5 1px, transparent 1px); background-size: 16px 16px;
  display: grid; place-items: center; align-content: center; gap: 12px; padding: 40px 16px 28px; min-width: 0; transition: background-color .4s;
}
.artboard { font-size: 11.5px; font-weight: 700; color: var(--bd-faint); opacity: 0; transition: opacity .4s; }
.artboard.on { opacity: 1; }
.canvas-badge { position: relative; width: 240px; max-width: 100%; border-radius: 14px; transition: box-shadow .6s ease; }
.canvas-badge.solid { box-shadow: 0 18px 40px -18px rgba(20, 23, 40, .35); }

/* Selection box: glides between elements and resizes to each one */
.sel {
  position: absolute; pointer-events: none; opacity: 0; border-radius: 3px;
  border: 1.5px dashed var(--bd-brand); background: rgba(99, 102, 241, .04);
  transition: left .5s var(--bd-ease), top .5s var(--bd-ease), width .5s var(--bd-ease), height .5s var(--bd-ease), opacity .22s ease;
}
.sel.on { opacity: 1; }
.sel i { position: absolute; width: 8px; height: 8px; background: #fff; border: 1.5px solid var(--bd-brand); border-radius: 2px; }
.sel i:nth-child(1) { left: -5px; top: -5px; }
.sel i:nth-child(2) { right: -5px; top: -5px; }
.sel i:nth-child(3) { left: -5px; bottom: -5px; }
.sel i:nth-child(4) { right: -5px; bottom: -5px; }
.canvas-badge.handed { visibility: hidden; }
.ready {
  display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 800; color: #15803d; background: #dcfce7;
  padding: 5px 12px; border-radius: 999px; opacity: 0; transform: translateY(6px); transition: opacity .4s, transform .4s var(--bd-ease);
}
.ready .ico { width: 14px; height: 14px; }
.ready.on { opacity: 1; transform: none; }

.insp { display: grid; gap: 10px; }
.insp-enter-active { transition: opacity .22s ease, transform .3s var(--bd-ease), filter .22s ease; }
.insp-leave-active { transition: opacity .14s ease, transform .14s ease, filter .14s ease; }
.insp-enter-from { opacity: 0; transform: translateY(6px); filter: blur(2px); }
.insp-leave-to { opacity: 0; transform: translateY(-3px); filter: blur(2px); }
.prop { display: flex; justify-content: space-between; align-items: center; gap: 8px; background: var(--bd-sunk); border-radius: 8px; padding: 7px 10px; color: var(--bd-muted); }
.prop { transition: background .3s, box-shadow .3s; }
.prop.lit { background: var(--bd-brand-soft); box-shadow: inset 0 0 0 1px rgba(99, 102, 241, .35); }
.prop b { color: var(--bd-ink); font-weight: 700; font-variant-numeric: tabular-nums; }
.bump { display: inline-block; animation: bump .35s var(--bd-ease); }
@keyframes bump { from { transform: translateY(-5px); opacity: 0; } }
.prop2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.colors { display: flex; gap: 6px; }
.colors i { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1px var(--bd-line); transition: box-shadow .25s; }
.colors i.on { box-shadow: 0 0 0 2px var(--bd-brand); }

/* Editor leaves: chrome fades, only the badge remains for the hand-off */
.ed-top, .ed-lib, .ed-props, .stepper ol { transition: opacity .38s ease, filter .38s ease; }
.is-reveal .editor, .is-done .editor { background: transparent; border-color: transparent; box-shadow: none; }
.is-reveal .ed-top, .is-reveal .ed-lib, .is-reveal .ed-props, .is-reveal .artboard, .is-reveal .ready { opacity: 0; filter: blur(3px); }
.is-reveal .ed-canvas { background-color: transparent; background-image: none; }
.is-done .editor { visibility: hidden; }

/* ---------- Scene 2: the fan ---------- */
.showcase { position: relative; min-height: 520px; border-radius: 18px; overflow: hidden; visibility: hidden; isolation: isolate; }
.is-reveal .showcase, .is-done .showcase { visibility: visible; }

/* The stage: brand-colour gradient (#6452E7 into a deeper shade of it), drifting colour, light rays from the fan's pivot, a glow in the role's colour */
.show-bg {
  position: absolute; inset: 0; z-index: -1; overflow: hidden; opacity: 0; transition: opacity .8s ease;
  background:
    radial-gradient(110% 75% at 50% 0%, rgba(139, 124, 246, .55) 0%, rgba(139, 124, 246, 0) 62%),
    linear-gradient(160deg, var(--bd-brand) 0%, #4e3fd4 45%, #2e2391 100%);
}
.showcase.lit .show-bg { opacity: 1; }
.show-bg i { position: absolute; display: block; pointer-events: none; }
.blob { width: 46%; aspect-ratio: 1; border-radius: 50%; filter: blur(70px); }
.b1 { left: -12%; top: -24%; background: #8b7cf6; opacity: .45; animation: drift 14s ease-in-out infinite alternate; }
.b2 { right: -14%; top: 4%; background: #a99cff; opacity: .3; animation: drift 18s ease-in-out infinite alternate-reverse; }
@keyframes drift { to { transform: translate(9%, 12%) scale(1.12); } }
/* rays centred on the fan's pivot (220px below the cards, see .card transform-origin) */
.rays {
  left: 50%; top: calc(100% + 220px); width: 1500px; height: 1500px; margin: -750px 0 0 -750px; border-radius: 50%;
  background: repeating-conic-gradient(rgba(255, 255, 255, .055) 0 2.5deg, transparent 2.5deg 9deg);
  -webkit-mask: radial-gradient(closest-side, #000 30%, transparent 92%);
  mask: radial-gradient(closest-side, #000 30%, transparent 92%);
  animation: spin 140s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.grid {
  inset: 0; background: radial-gradient(rgba(255, 255, 255, .14) 1px, transparent 1.2px) 0 0 / 22px 22px;
  -webkit-mask: radial-gradient(70% 60% at 50% 45%, #000, transparent);
  mask: radial-gradient(70% 60% at 50% 45%, #000, transparent);
}
.glow {
  left: 50%; bottom: 30px; width: 560px; height: 360px; margin-left: -280px; border-radius: 50%;
  background-color: var(--glow2); opacity: .42; filter: blur(80px); transition: background-color .7s ease;
}
.spark { border-radius: 50%; background: #fff; box-shadow: 0 0 8px 2px rgba(255, 255, 255, .55); opacity: 0; animation: twinkle 4.2s ease-in-out infinite; }
@keyframes twinkle { 0%, 100% { opacity: 0; transform: scale(.4); } 45% { opacity: .9; transform: none; } }
.floor { left: 0; right: 0; bottom: 0; height: 28%; background: linear-gradient(to top, rgba(30, 22, 100, .55), transparent); }

.show-note { position: absolute; top: 34px; left: 0; right: 0; z-index: 6; display: grid; justify-items: center; gap: 8px; text-align: center; opacity: 0; transform: translateY(8px); transition: opacity .5s ease .2s, transform .5s var(--bd-ease) .2s; }
.is-done .show-note { opacity: 1; transform: none; }
.show-note .pill { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 800; color: var(--bd-ink); background: #fff; padding: 6px 14px; border-radius: 999px; box-shadow: 0 8px 24px -8px rgba(0, 0, 0, .45); }
.show-note .pill .ico { width: 14px; height: 14px; color: #15803d; }
.show-note .sub { font-size: 14px; color: rgba(255, 255, 255, .72); font-weight: 600; }

.fan {
  --fs: 1; --spread: 1;
  position: absolute; left: 0; right: 0; bottom: 0; height: 100%;
  transform: scale(var(--fs)); transform-origin: 50% 100%; perspective: 1400px;
}
.slot {
  position: absolute; left: 50%; bottom: 14px; width: 240px; margin-left: -120px;
  transform-origin: 0 0; opacity: 0;
  transition: transform .95s cubic-bezier(.2, .85, .25, 1), opacity .25s ease;
}
.fan.handoff .slot.center, .fan.dealt .slot { opacity: 1; }
.card {
  border-radius: 14px; background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .08), 0 34px 60px -22px rgba(4, 2, 20, .7);
  transform-origin: 50% 165%;
  transform: rotate(calc(var(--rot) * var(--spread)));
  transition: transform .85s cubic-bezier(.2, .9, .25, 1) var(--delay);
}
.fan:not(.dealt) .slot:not(.center) .card { transform: translateY(14px) scale(.97); }
.is-done .card { transition: transform .6s cubic-bezier(.2, .9, .25, 1); }
.is-done .card:hover { transform: rotate(calc(var(--rot) * var(--spread))) translateY(-14px); }

/* ---------- Cursor ---------- */
/* x and y ease on different curves, so straight moves become soft arcs. Drags use one curve
   for both, matching the shape being pulled (BadgeCard uses the same easing and --drag). */
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

/* The image being dragged. Centred on the cursor tip (the cursor box is offset by its margin). */
.ghost {
  position: absolute; left: -22px; top: -23px; width: 52px; height: 52px; border-radius: 10px;
  box-shadow: 0 2px 6px rgba(20, 23, 40, .15);
  transition: transform .4s cubic-bezier(.34, 1.36, .64, 1), box-shadow .4s ease, opacity .3s ease;
}
.ghost svg { display: block; width: 100%; height: 100%; }
.ghost.lifted { transform: scale(1.08) rotate(-5deg); box-shadow: 0 18px 30px -10px rgba(20, 23, 40, .45), 0 0 0 2px #fff; }
.ghost.lifted.over { transform: scale(.74) rotate(-2deg); opacity: .88; }
.ghost.dropped { transform: scale(var(--drop)); opacity: 0; box-shadow: none; transition: transform .35s cubic-bezier(.4, 0, .2, 1), opacity .3s ease .08s, box-shadow .2s; }
.tap { position: absolute; left: 0; top: 0; width: 26px; height: 26px; margin: -10px 0 0 -9px; border-radius: 50%; background: rgba(99, 82, 231, .35); transform: scale(0); opacity: 0; animation: tap .45s ease-out; }
@keyframes tap { from { transform: scale(.2); opacity: 1; } to { transform: scale(1.4); opacity: 0; } }

/* ---------- Feature points ---------- */
.bpoints { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; max-width: 1040px; margin: 40px auto 0; text-align: left; }
.bpoints div { display: grid; gap: 4px; align-content: start; border-top: 2px solid var(--bd-ink); padding-top: 14px; }
.bpoints b { font-size: 16px; }
.bpoints span { font-size: 14px; color: var(--bd-muted); }

/* ---------- Scroll reveal (only once mounted) ---------- */
.bd--animate .rv { opacity: 0; transform: translateY(26px); filter: blur(4px); transition: opacity .8s var(--bd-ease), transform .8s var(--bd-ease), filter .8s var(--bd-ease); transition-delay: calc(var(--i, 0) * 90ms); }
.bd--animate .rv.in { opacity: 1; transform: none; filter: none; }

/* ---------- Responsive ---------- */
@media (max-width: 960px) {
  .ed-body { grid-template-columns: 1fr; min-height: 0; }
  .ed-lib, .ed-props, .ed-tools { display: none; }
  .bpoints { grid-template-columns: 1fr 1fr; }
  .stepper li:not(.now) .lbl { display: none; }
}
@media (max-width: 640px) {
  .fan { --fs: .78; --spread: .82; }
  .rays { top: calc(100% + 172px); }
  .glow { width: 360px; margin-left: -180px; }
  .showcase { min-height: 470px; }
  .show-note { top: 22px; }
  .show-note .sub { display: none; }
  .stepper li + li::before { width: 10px; }
  .ctl:not(.icon) { font-size: 12px; padding: 6px 10px; }
}
@media (max-width: 480px) {
  .bpoints { grid-template-columns: 1fr; }
  .stepper .lbl { display: none; }
}

/* ---------- Reduced motion: the finished fan, no movement ---------- */
@media (prefers-reduced-motion: reduce) {
  .slot, .card, .show-bg, .show-bg i, .show-note, .cursor, .cursor-y, .cursor-tip, .ghost, .sel, .bump, .thumb, .role-btn, .ed-save, .insp-enter-active, .insp-leave-active { transition: none !important; animation: none !important; }
  .spark { opacity: .6; }
  .is-done .card:hover { transform: rotate(calc(var(--rot) * var(--spread))); }
}
</style>
