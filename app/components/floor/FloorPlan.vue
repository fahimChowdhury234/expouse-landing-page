<script setup lang="ts">
/**
 * The sample hall, drawn up to `step` (FLOOR_STEP). Used twice by FloorDesigner.vue:
 * flat on the editor canvas while it is being built, and as the 3D hall in the
 * showcase, where booths rise (`extruded`) and a visitor route is drawn (`routed`).
 *
 * In 3D mode every booth is a small box: a top face lifted by --h and a south and
 * east wall (the two faces the tilted camera sees). The parent sets the tilt
 * (--rx / --rz), so labels and pins can turn back to face the viewer.
 */
import {
  BOOTH_TYPES, ENTRANCE, FLOOR_AREAS, FLOOR_BOOTHS, FLOOR_EXITS, FLOOR_STEP, PLAN_H, PLAN_W, ROUTES,
  boothMetres, findBooth, pct, routeMetres, type BoothStatus, type BoothType, type FloorBooth,
} from '~/utils/floor'

const props = withDefaults(defineProps<{
  step?: number
  mode?: '2d' | '3d'
  /** Transitions on (off while resetting, so nothing animates backwards). */
  animated?: boolean
  /** The hand-drawn booth. */
  feature?: string
  /** 3D: booths of this type lift and glow. */
  highlight?: BoothType | null
  extruded?: boolean
  routed?: boolean
}>(), { step: FLOOR_STEP.DONE, mode: '2d', animated: false, feature: 'B3', highlight: null, extruded: true, routed: true })

const S = FLOOR_STEP
const is3d = computed(() => props.mode === '3d')

function statusOf(b: FloorBooth): BoothStatus {
  if (props.step < S.PRICED) return 'draft'
  if (props.step < S.SOLD) return 'available'
  return b.id === props.feature ? 'sold' : b.status
}
const shown = (b: FloorBooth) => (b.id === props.feature ? props.step >= S.FEATURE : props.step >= S.FILL)

/** Wall height in px: islands are double-deck stands, peninsulas a little taller than shell scheme. */
const HEIGHT: Record<BoothType, number> = { standard: 15, corner: 15, peninsula: 21, island: 28 }

function boothStyle(b: FloorBooth) {
  // highlighted booths stand a little taller than the rest
  const lift = is3d.value && props.extruded ? HEIGHT[b.type] + (props.highlight === b.type ? 9 : 0) : 0
  return {
    ...pct(b),
    '--h': `${lift}px`,
    '--tc': BOOTH_TYPES.find(t => t.key === b.type)!.color,
    '--pop': `${b.order * 40}ms`,
    '--wave': `${b.order * 45}ms`,
    '--rise': `${b.order * 28}ms`,
  }
}

/* ---------- Visitor route (3D) ---------- */
const routeType = computed<BoothType>(() => props.highlight ?? BOOTH_TYPES.find(t => t.feature === props.feature)?.key ?? 'standard')
const routeD = computed(() => ROUTES[routeType.value].map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' '))
const target = computed(() => findBooth(BOOTH_TYPES.find(t => t.key === routeType.value)!.feature))
const targetType = computed(() => BOOTH_TYPES.find(t => t.key === routeType.value)!)
const at = (x: number, y: number) => ({ left: `${(x / PLAN_W) * 100}%`, top: `${(y / PLAN_H) * 100}%` })
const cardAt = computed(() => {
  const b = target.value
  return { ...at(b.x + b.w / 2, b.y + b.h / 2), '--z': `${(props.extruded ? HEIGHT[b.type] + 9 : 0) + 4}px` }
})
</script>

<template>
  <div class="fp" :class="[`is-${mode}`, { anim: animated }]">
    <!-- 3D: floor slab edge and the two back walls -->
    <template v-if="is3d">
      <i class="slab s" /><i class="slab e" />
      <i class="wall n" /><i class="wall w" />
    </template>

    <!-- Hall: dragged out as a marquee, then walled -->
    <div class="hall" :class="{ on: step >= S.MARQUEE, walled: step >= S.WALLS }" :style="pct(FLOOR_AREAS.hall)" />

    <!-- Dimensions (editor only) -->
    <template v-if="!is3d">
      <span class="dim dim-top" :class="{ on: step >= S.WALLS }"><b>50 m</b></span>
      <span class="dim dim-left" :class="{ on: step >= S.WALLS }"><b>30 m</b></span>
    </template>

    <!-- Entrance -->
    <div class="door" :class="{ on: step >= S.DOOR }" :style="pct(FLOOR_AREAS.door)">
      <span v-if="!is3d">Entrance</span>
    </div>

    <!-- Areas: stage (raised platform in 3D) and café -->
    <div class="area a-stage" :class="{ on: step >= S.STAGE }" :style="{ ...pct(FLOOR_AREAS.stage), '--h': is3d && extruded ? '7px' : '0px' }">
      <template v-if="is3d"><i class="face s" /><i class="face e" /></template>
      <div class="top"><Icon name="lucide:mic" class="ico" /><span>Main stage</span></div>
    </div>
    <div class="area a-cafe" :class="{ on: step >= S.CAFE }" :style="pct(FLOOR_AREAS.cafe)">
      <div class="top"><Icon name="lucide:coffee" class="ico" /><span>Café</span></div>
    </div>
    <span
      v-for="([x, y, wall], i) in FLOOR_EXITS" :key="i" class="exit" :class="[wall, { on: step >= S.EXITS }]"
      :style="{ ...at(x, y), '--d': `${i * 120}ms` }"
    ><Icon name="lucide:door-open" class="ico" /></span>

    <!-- Booths -->
    <div
      v-for="b in FLOOR_BOOTHS" :key="b.id" class="booth"
      :class="[b.type, statusOf(b), { shown: shown(b), feat: b.id === feature, grow: b.id === feature && !is3d, hl: is3d && highlight === b.type }]"
      :style="boothStyle(b)"
    >
      <template v-if="is3d"><i class="face s" /><i class="face e" /></template>
      <div class="top"><span>{{ b.id }}</span></div>
    </div>

    <!-- 3D: visitor route, "you are here" pin and the booth card, turned to face the viewer -->
    <template v-if="is3d">
      <svg class="route" :class="{ on: routed }" :viewBox="`0 0 ${PLAN_W} ${PLAN_H}`" preserveAspectRatio="none" aria-hidden="true">
        <g :key="routeType">
          <path class="halo" :d="routeD" pathLength="1" />
          <path class="line" :d="routeD" pathLength="1" />
          <path class="ants" :d="routeD" />
        </g>
      </svg>
      <div class="bb pin" :class="{ on: routed }" :style="at(ENTRANCE.x, ENTRANCE.y)">
        <div class="bb-in">
          <span class="you"><i />You are here</span>
          <span class="stem" />
        </div>
      </div>
      <div :key="routeType" class="bb bb-card" :class="{ on: routed }" :style="cardAt">
        <div class="bb-in">
          <div class="tag">
            <span class="logo"><BadgeDummyImage :radius="6" /></span>
            <span class="txt">
              <b>Company Name</b>
              <small>Booth {{ target.id }} · {{ targetType.label }} · {{ boothMetres(target).area }} m²</small>
              <small class="walk"><Icon name="lucide:footprints" class="ico" />{{ routeMetres(routeType) }} m from the entrance</small>
            </span>
          </div>
          <span class="stem" />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.fp {
  --ink: #1f2430;
  --brand: #6452E7;
  --ease: cubic-bezier(.22, .8, .24, 1);
  --drag-ease: cubic-bezier(.65, 0, .35, 1);
  position: relative; width: 100%; aspect-ratio: 600 / 360;
}
.fp > * { position: absolute; }
.fp:not(.anim), .fp:not(.anim) * { transition: none !important; }

/* ---------- Hall ---------- */
.hall {
  border: 1.5px dashed transparent; border-radius: 3px; box-sizing: border-box;
  clip-path: inset(0 100% 100% 0);
  transition: clip-path var(--drag, 900ms) var(--drag-ease), border-color .3s, background-color .5s, border-width .3s;
}
.hall.on { clip-path: inset(0 0 0 0); border-color: var(--brand); background-color: rgba(100, 82, 231, .04); }
.hall.walled {
  border: 3px solid var(--ink); background-color: #fff;
  background-image: linear-gradient(rgba(31, 36, 48, .045) 1px, transparent 1px), linear-gradient(90deg, rgba(31, 36, 48, .045) 1px, transparent 1px);
  background-size: 6% 10%;
}

.dim { display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 10.5px; font-weight: 700; opacity: 0; transition: opacity .4s .2s; }
.dim.on { opacity: 1; }
.dim b { background: #f8f9fb; padding: 0 6px; position: relative; }
.dim-top { left: 0; right: 0; top: -20px; height: 12px; border-inline: 1.5px solid #c3c7d0; }
.dim-top::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; border-top: 1.5px solid #c3c7d0; }
.dim-left { top: 0; bottom: 0; left: -22px; width: 12px; border-block: 1.5px solid #c3c7d0; }
.dim-left::before { content: ""; position: absolute; top: 0; bottom: 0; left: 50%; border-left: 1.5px solid #c3c7d0; }
.dim-left b { transform: rotate(-90deg); white-space: nowrap; }

.door { opacity: 0; transform: scaleX(.2); transition: opacity .3s, transform .45s var(--ease); }
.door.on { opacity: 1; transform: none; }
.door::before { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: #fff; }
.door::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: repeating-linear-gradient(90deg, var(--brand) 0 6px, transparent 6px 9px); }
.door span { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 5px; font-size: 10px; font-weight: 800; color: var(--brand); white-space: nowrap; letter-spacing: .02em; }

/* ---------- Areas ---------- */
.area { opacity: 0; transition: opacity .3s; }
.area.on { opacity: 1; }
.area .top {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 5px;
  border-radius: 3px; font-size: clamp(7px, 1.5cqw, 10.5px); font-weight: 800; white-space: nowrap; overflow: hidden;
}
.area .ico { width: 1.3em; height: 1.3em; flex: none; }
.area.a-stage { clip-path: inset(0 100% 100% 0); transition: clip-path var(--drag, 700ms) var(--drag-ease), opacity .2s; }
.area.a-stage.on { clip-path: inset(0); }
.a-stage .top { background: #2e2391; color: #fff; }
.a-cafe { transform: scale(.85); transition: opacity .3s, transform .45s cubic-bezier(.34, 1.4, .64, 1); }
.a-cafe.on { transform: none; }
.a-cafe .top { background: repeating-linear-gradient(45deg, #fff7ed 0 6px, #ffedd5 6px 12px); color: #c2410c; box-shadow: inset 0 0 0 1.5px #fdba74; }

.exit {
  width: 18px; height: 18px; margin: -9px 0 0 -9px; border-radius: 5px; display: grid; place-items: center;
  background: #16a34a; color: #fff; box-shadow: 0 0 0 2px #fff; opacity: 0; transform: scale(.4);
  transition: opacity .25s var(--d), transform .4s cubic-bezier(.34, 1.5, .64, 1) var(--d);
}
.exit .ico { width: 11px; height: 11px; }
.exit.on { opacity: 1; transform: none; }

/* ---------- Booths ---------- */
.booth {
  --fill: #fff; --line: #c9cdd6; --text: #9aa1ad; --side-s: #e2e4ea; --side-e: #d0d3db;
  opacity: 0; transform: scale(.55);
  transition:
    opacity .28s ease var(--pop), transform .45s cubic-bezier(.34, 1.45, .64, 1) var(--pop);
}
.booth.shown { opacity: 1; transform: none; }
.booth .top {
  position: absolute; inset: 0; display: grid; place-items: center; border-radius: 2px;
  background: var(--fill); box-shadow: inset 0 0 0 1.5px var(--line); color: var(--text);
  font-size: clamp(6.5px, 1.45cqw, 10px); font-weight: 800; letter-spacing: .01em;
  transition: background-color .45s ease var(--wave), box-shadow .45s ease var(--wave), color .45s ease var(--wave);
}
.booth.available { --fill: #effaf4; --line: #1e8a55; --text: #1e8a55; --side-s: #cfe9da; --side-e: #b5dcc6; }
.booth.reserved { --fill: #fff4e6; --line: #b45309; --text: #b45309; --side-s: #f3d6b4; --side-e: #e6be92; }
.booth.sold { --fill: var(--brand); --line: var(--brand); --text: #fff; --side-s: #4e3fd4; --side-e: #3b2fae; }

/* The hand-drawn booth grows with the cursor, like the hall marquee */
.booth.grow { transform: none; clip-path: inset(0 100% 100% 0); transition: opacity .1s, clip-path var(--drag, 650ms) var(--drag-ease); }
.booth.grow.shown { clip-path: inset(0); }
.is-2d .booth.feat .top { box-shadow: inset 0 0 0 1.5px var(--line), 0 0 0 0 transparent; }

/* ---------- 3D ---------- */
.is-3d, .is-3d .booth, .is-3d .area { transform-style: preserve-3d; }
.is-3d .hall.walled { border: 0; background-color: #fbfbfe; box-shadow: inset 0 0 0 2px rgba(31, 36, 48, .12); }
.is-3d .booth { transition: opacity .28s ease var(--pop), transform .5s var(--ease); }
.is-3d .booth .top { transform: translateZ(var(--h)); transition: transform .7s cubic-bezier(.2, .9, .25, 1.15) var(--rise), background-color .45s, box-shadow .3s, color .45s; }
.is-3d .face { position: absolute; display: block; transition: height .7s cubic-bezier(.2, .9, .25, 1.15) var(--rise), width .7s cubic-bezier(.2, .9, .25, 1.15) var(--rise); }
.is-3d .face.s { left: 0; right: 0; bottom: 0; height: var(--h); transform-origin: 50% 100%; transform: rotateX(-90deg); background: var(--side-s); }
.is-3d .face.e { top: 0; bottom: 0; right: 0; width: var(--h); transform-origin: 100% 50%; transform: rotateY(90deg); background: var(--side-e); }
/* Highlight drawn inside the top face: outside it, the booth's own walls would cover it */
.is-3d .booth.hl .top { box-shadow: inset 0 0 0 2.5px #fff, inset 0 0 0 5px var(--tc); }
.is-3d .area.a-stage { clip-path: none; }
.is-3d .area.a-stage .top { transform: translateZ(var(--h)); transition: transform .7s cubic-bezier(.2, .9, .25, 1.15); }
.is-3d .area.a-stage .face.s { --side-s: #221a72; }
.is-3d .area.a-stage .face.e { --side-e: #1a1459; }
.is-3d .door::before { display: none; }
.is-3d .door::after { height: 100%; opacity: .9; }
.is-3d .exit { box-shadow: 0 0 0 2px #fff, 0 6px 10px -4px rgba(0, 0, 0, .4); }

.slab { display: block; background: #cfd0e6; }
.slab.s { left: 0; right: 0; bottom: 0; height: 12px; transform-origin: 50% 100%; transform: rotateX(90deg); background: #b9b8dc; }
.slab.e { top: 0; bottom: 0; right: 0; width: 12px; transform-origin: 100% 50%; transform: rotateY(-90deg); background: #a19fcf; }
.wall { display: block; background: linear-gradient(to top, rgba(255, 255, 255, .92), rgba(255, 255, 255, .55)); }
.wall.n { left: 0; right: 0; top: 0; height: 34px; transform-origin: 50% 0; transform: rotateX(90deg); }
.wall.w { top: 0; bottom: 0; left: 0; width: 34px; transform-origin: 0 50%; transform: rotateY(-90deg); background: linear-gradient(to left, rgba(255, 255, 255, .8), rgba(255, 255, 255, .45)); }

/* Route: a soft halo, the drawn line, then marching dots once it's there */
.route { inset: 0; width: 100%; height: 100%; overflow: visible; transform: translateZ(1px); pointer-events: none; }
.route path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.route .halo { stroke: rgba(255, 196, 0, .35); stroke-width: 14; stroke-dasharray: 1; stroke-dashoffset: 1; }
.route .line { stroke: #ffb800; stroke-width: 4.5; stroke-dasharray: 1; stroke-dashoffset: 1; }
.route .ants { stroke: #fff; stroke-width: 2; stroke-dasharray: 2 10; opacity: 0; }
.route.on .halo, .route.on .line { stroke-dashoffset: 0; transition: stroke-dashoffset 1.1s cubic-bezier(.45, 0, .2, 1); }
.route.on .ants { opacity: 1; transition: opacity .3s 1s; animation: march 1s linear infinite; }
@keyframes march { to { stroke-dashoffset: -12; } }

/* Billboards: a zero-size anchor on the floor, turned back to face the viewer */
.bb {
  width: 0; height: 0; transform-style: preserve-3d;
  transform: translateZ(var(--z, 3px)) rotateZ(calc(-1 * var(--rz, 0deg))) rotateX(calc(-1 * var(--rx, 0deg)));
}
.bb-in {
  position: absolute; left: 0; bottom: 0; display: grid; justify-items: center; transform: translateX(-50%);
  transform-origin: 0 100%; scale: var(--bbs, 1);
  opacity: 0; translate: 0 10px; transition: opacity .35s ease, translate .5s cubic-bezier(.34, 1.4, .64, 1);
}
.bb.on .bb-in { opacity: 1; translate: 0 0; }
.pin .bb-in { transition-delay: .1s; }
.bb-card .bb-in { transition-delay: 1s; }
.stem { width: 2px; height: 30px; background: linear-gradient(#fff, rgba(255, 255, 255, .2)); }
.bb-card .stem { height: 46px; }
.you {
  display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px 5px 8px; border-radius: 999px; white-space: nowrap;
  background: var(--ink); color: #fff; font-size: 11.5px; font-weight: 800; box-shadow: 0 8px 18px -6px rgba(0, 0, 0, .5);
}
.you i { width: 8px; height: 8px; border-radius: 50%; background: #ffb800; box-shadow: 0 0 0 3px rgba(255, 184, 0, .3); animation: ping 1.6s ease-out infinite; }
@keyframes ping { 50% { box-shadow: 0 0 0 6px rgba(255, 184, 0, 0); } }
.tag {
  display: flex; align-items: center; gap: 9px; padding: 8px 12px 8px 8px; border-radius: 12px; background: #fff; white-space: nowrap;
  box-shadow: 0 14px 30px -10px rgba(0, 0, 0, .55);
}
.tag .logo { width: 34px; height: 34px; border-radius: 8px; overflow: hidden; flex: none; }
.tag .logo :deep(svg) { display: block; width: 100%; height: 100%; }
.tag .txt { display: grid; line-height: 1.3; text-align: left; }
.tag b { font-size: 12.5px; color: var(--ink); }
.tag small { font-size: 10.5px; color: #6b7280; font-weight: 600; }
.tag .walk { display: inline-flex; align-items: center; gap: 4px; color: #b45309; font-weight: 800; }
.tag .walk .ico { width: 11px; height: 11px; }

@media (prefers-reduced-motion: reduce) {
  .fp *, .route .ants { transition: none !important; animation: none !important; }
}
</style>
