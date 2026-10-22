/**
 * Sample hall for the landing page's floor plan section (FloorDesigner.vue).
 * One hall in plan units (600 × 360, 12 units = 1 m, so 50 × 30 m). The booth
 * types, statuses and rate card mirror the real floor editor
 * (eventos-admin/modules/floor.expouse: boothStatus.ts, boothPricing.ts).
 */

export const PLAN_W = 600
export const PLAN_H = 360
/** Plan units per metre. */
export const UNIT = 12

export type BoothType = 'standard' | 'corner' | 'peninsula' | 'island'
export type BoothStatus = 'draft' | 'available' | 'reserved' | 'sold'

export interface FloorBoothType {
  key: BoothType
  label: string
  /** Open sides, as the editor works the type out from them. */
  sides: number
  /** Rate-card premium on top of the price per m². */
  premium: number
  /** Chip dot and highlight colour. */
  color: string
  /** The booth the designer draws by hand and the visitor route leads to. */
  feature: string
}

export const BOOTH_TYPES: FloorBoothType[] = [
  { key: 'standard', label: 'Inline', sides: 1, premium: 0, color: '#6352E7', feature: 'B3' },
  { key: 'corner', label: 'Corner', sides: 2, premium: 0.1, color: '#0F766E', feature: 'A11' },
  { key: 'peninsula', label: 'Peninsula', sides: 3, premium: 0.15, color: '#C2410C', feature: 'A1' },
  { key: 'island', label: 'Island', sides: 4, premium: 0.25, color: '#BE123C', feature: 'I2' },
]

/** Build order of the plan in the designer. Each part appears once `step` reaches its value. */
export const FLOOR_STEP = {
  BLANK: 0,
  MARQUEE: 1, // hall area dragged out on the canvas
  WALLS: 2, // walls drawn, dimensions shown
  DOOR: 3, // entrance placed in the front wall
  FEATURE: 4, // one booth drawn by hand
  FILL: 5, // auto-fill: the rest of the booths pop in
  STAGE: 6, // stage area dragged out
  CAFE: 7, // catering area
  EXITS: 8, // emergency exits
  PRICED: 9, // rate card set: every booth goes on sale
  SOLD: 10, // exhibitors book: booths turn sold / reserved
  PUBLISHED: 11, // plan published
  DONE: 99,
} as const

export interface FloorBooth {
  id: string
  x: number
  y: number
  w: number
  h: number
  type: BoothType
  /** Status once the exhibitors have booked. */
  status: Exclude<BoothStatus, 'draft'>
  /** Order of the auto-fill / booking wave. */
  order: number
}

export interface FloorRect { x: number, y: number, w: number, h: number }

const B = 36 // 3 m booth

/** Two back-to-back rows of booths; the end columns open on two sides (corner). */
function block(prefix: string, x0: number, cols: number, firstNo: number, cornerLeft: boolean): Omit<FloorBooth, 'status' | 'order'>[] {
  const out: Omit<FloorBooth, 'status' | 'order'>[] = []
  for (const [row, y] of [[0, 132], [1, 168]] as const) {
    for (let c = 0; c < cols; c++) {
      const corner = c === cols - 1 || (cornerLeft && c === 0)
      out.push({ id: `${prefix}${firstNo + row * cols + c}`, x: x0 + c * B, y, w: B, h: B, type: corner ? 'corner' : 'standard' })
    }
  }
  return out
}

const RAW = [
  { id: 'A1', x: 36, y: 132, w: 72, h: 72, type: 'peninsula' as const },
  ...block('A', 108, 5, 2, false),
  ...block('B', 348, 6, 1, true),
  { id: 'I1', x: 120, y: 252, w: 84, h: 60, type: 'island' as const },
  { id: 'I2', x: 432, y: 252, w: 84, h: 60, type: 'island' as const },
]

/** Booths still open (available) or on hold (reserved) after the booking wave; the rest sell. */
const AVAILABLE = new Set(['A4', 'B6', 'B10', 'I1'])
const RESERVED = new Set(['A9', 'B2', 'B12'])

/** Auto-fill and booking run as a wave from left to right. */
export const FLOOR_BOOTHS: FloorBooth[] = RAW
  .map(b => ({ ...b, status: AVAILABLE.has(b.id) ? 'available' as const : RESERVED.has(b.id) ? 'reserved' as const : 'sold' as const }))
  .sort((a, b) => a.x - b.x || a.y - b.y)
  .map((b, order) => ({ ...b, order }))

export const FLOOR_AREAS = {
  hall: { x: 0, y: 0, w: PLAN_W, h: PLAN_H },
  door: { x: 288, y: 348, w: 60, h: 12 },
  stage: { x: 24, y: 24, w: 156, h: 72 },
  cafe: { x: 444, y: 24, w: 132, h: 72 },
} satisfies Record<string, FloorRect>

/** Emergency exits on the walls: [x, y, wall]. */
export const FLOOR_EXITS: [number, number, 'n' | 'w' | 'e'][] = [[318, 0, 'n'], [0, 228, 'w'], [600, 228, 'e']]

/** Where the visitor stands: just inside the entrance. */
export const ENTRANCE = { x: 318, y: 340 }

/** Directions from the entrance to each type's feature booth, along the aisles. */
export const ROUTES: Record<BoothType, [number, number][]> = {
  standard: [[318, 340], [318, 114], [438, 114], [438, 132]],
  corner: [[318, 340], [318, 186], [288, 186]],
  peninsula: [[318, 340], [318, 228], [72, 228], [72, 204]],
  island: [[318, 340], [318, 282], [432, 282]],
}

/** Route length in metres, for the visitor card. */
export function routeMetres(type: BoothType) {
  const pts = ROUTES[type]
  let d = 0
  for (let i = 1; i < pts.length; i++) d += Math.abs(pts[i]![0] - pts[i - 1]![0]) + Math.abs(pts[i]![1] - pts[i - 1]![1])
  return Math.round(d / UNIT)
}

export const RATE = 320 // $ per m²

export function boothMetres(b: FloorRect) {
  return { w: b.w / UNIT, h: b.h / UNIT, area: (b.w * b.h) / (UNIT * UNIT) }
}

export function boothPrice(b: FloorBooth) {
  const premium = BOOTH_TYPES.find(t => t.key === b.type)!.premium
  return Math.round(boothMetres(b).area * RATE * (1 + premium))
}

export const findBooth = (id: string) => FLOOR_BOOTHS.find(b => b.id === id)!

/** A plan rectangle as % of the hall, for absolutely positioned elements. */
export const pct = (r: FloorRect) => ({
  left: `${(r.x / PLAN_W) * 100}%`,
  top: `${(r.y / PLAN_H) * 100}%`,
  width: `${(r.w / PLAN_W) * 100}%`,
  height: `${(r.h / PLAN_H) * 100}%`,
})
