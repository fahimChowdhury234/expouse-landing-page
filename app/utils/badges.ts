/**
 * Sample badge data and layout for the landing page's badge designer (BadgeDesigner.vue).
 * The badges show placeholders (Full Name, Designation, Company Name, EVENT NAME) where a real
 * badge fills in each attendee's details.
 */

export interface BadgeRole {
  key: string
  label: string
  /** Header gradient start, footer band and swatch colour. */
  color: string
  /** Header gradient end. */
  color2: string
  name: string
  /** Designation, on its own line between the name and the company (speakers). */
  title?: string
  company: string
}

export const BADGE_EVENT = { name: 'EVENT NAME', date: '5 OCT 2026' }

/** Build order of a badge in the designer. Each element appears once `step` reaches its value. */
export const BADGE_STEP = {
  BLANK: 0,
  MARQUEE: 1, // badge area dragged out on the canvas
  OUTLINE: 2, // card edge drawn
  BODY: 3, // card filled
  HEADER: 4, // curved header shape dragged down
  FOOTER: 5, // footer band placed
  COLOR: 6, // brand gradient blooms into the header, colour into the footer
  DROP: 7, // an image is dragged over the badge: the logo slot in the header lights up as a drop zone
  LOGO: 8, // image dropped into the slot
  EVENT: 9, // event name and date
  NAME: 10, // attendee name
  COMPANY: 11, // company
  QR: 12, // QR code
  ROLE: 13, // badge type in the footer
  PUNCH: 14, // punch hole guide
  FINISH: 15, // finishing sweep, outline settles
  DONE: 99,
} as const

/** Parts of the badge the editor can select. */
export type BadgeSelection = 'header' | 'footer' | 'logo' | 'event' | 'name' | 'company' | 'qr' | 'role' | 'punch'

/** Order = left-to-right order of the fanned cards, with VIP in the middle by default. */
export const BADGE_ROLES: BadgeRole[] = [
  { key: 'VISITOR', label: 'Visitor', color: '#6352E7', color2: '#8B7CF6', name: 'Full Name', company: 'Company Name' },
  { key: 'EXHIBITOR', label: 'Exhibitor', color: '#0F766E', color2: '#14B8A6', name: 'Full Name', company: 'Company Name' },
  { key: 'VIP', label: 'VIP', color: '#1F2430', color2: '#B8860B', name: 'Full Name', company: 'Company Name' },
  { key: 'SPEAKER', label: 'Speaker', color: '#BE123C', color2: '#FB7185', name: 'Full Name', title: 'Designation', company: 'Company Name' },
  { key: 'MEDIA', label: 'Media', color: '#C2410C', color2: '#FB923C', name: 'Full Name', company: 'Company Name' },
]

/* ---------------- Layout (badge coordinates, 240 × 360) ---------------- */

export const BADGE_W = 240
export const BADGE_H = 360

/** Name wraps onto a second line past this many characters (21px Cairo bold in a 208px box). */
const NAME_LINE = 16
const NAME_TOP = 151 // first baseline
const NAME_LEAD = 23 // line height
const CHAR_W = 11.2 // average width of a name character, for the selection box

/** Greedy word wrap of the attendee name, at most two lines. */
export function nameLines(name: string): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of name.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (next.length > NAME_LINE && line && lines.length === 0) {
      lines.push(line)
      line = word
    }
    else line = next
  }
  lines.push(line)
  return lines
}

export type Box = [x: number, y: number, w: number, h: number]

export interface BadgeLayout {
  lines: string[]
  /** Baseline of each name line. */
  nameY: number[]
  /** Baseline of the designation, when the role has one. */
  titleY: number | null
  companyY: number
  boxes: Record<BadgeSelection, Box>
}

const layoutCache = new Map<string, BadgeLayout>()

export function badgeLayout(role: BadgeRole): BadgeLayout {
  const hit = layoutCache.get(role.key)
  if (hit) return hit
  const lines = nameLines(role.name)
  const nameY = lines.map((_, i) => NAME_TOP + i * NAME_LEAD)
  const nameEnd = nameY[nameY.length - 1]!
  const titleY = role.title ? nameEnd + 27 : null
  const companyY = titleY ? titleY + 18 : nameEnd + 29
  const widest = Math.max(...lines.map(l => l.length)) * CHAR_W + 18
  const nameW = Math.min(208, Math.round(lines.length > 1 ? 208 : widest))
  const companyW = Math.min(200, Math.round(Math.max(role.company.length, role.title?.length ?? 0) * 6.6 + 16))
  /** The company box also takes in the designation above it. */
  const companyTop = (titleY ?? companyY) - 14
  const layout: BadgeLayout = {
    lines,
    nameY,
    titleY,
    companyY,
    boxes: {
      header: [0, 0, BADGE_W, 113],
      footer: [0, 319, BADGE_W, 41],
      logo: [14, 48, 36, 36],
      event: [51, 51, 156, 30],
      name: [120 - nameW / 2, 125, nameW, 18 + lines.length * NAME_LEAD],
      company: [120 - companyW / 2, companyTop, companyW, companyY + 5 - companyTop],
      qr: [69, 210, 102, 102],
      role: [74, 329, 92, 22],
      punch: [92, 8, 56, 17],
    },
  }
  layoutCache.set(role.key, layout)
  return layout
}

/* ---------------- QR ---------------- */

/**
 * Each badge's QR code: a real, scannable code (version 2, 25 × 25, error correction M)
 * for the text "EXPOUSE DEMO BADGE <role>", one row of modules per string, 1 = dark.
 * Made with the qrcode package; regenerate with qrcode.create(text, { version: 2, errorCorrectionLevel: 'M' }).
 */
const BADGE_QR: Record<string, string[]> = {
  VISITOR: [
    '1111111001001011101111111',
    '1000001000110101001000001',
    '1011101010110011101011101',
    '1011101010011000101011101',
    '1011101010001100001011101',
    '1000001011010111001000001',
    '1111111010101010101111111',
    '0000000010111100000000000',
    '1011111001001010101111100',
    '0010100111110001010101110',
    '0011101101011000110100110',
    '0100000111100011001010001',
    '1010111000110001110100000',
    '1011110101101111100111110',
    '1000011000000110011011011',
    '1011110101001100110111111',
    '1001111100101011111110000',
    '0000000010000001100010000',
    '1111111000011000101011001',
    '1000001011010010100010111',
    '1011101010110000111110010',
    '1011101010101111000111001',
    '1011101010000110100101101',
    '1000001000101101110110000',
    '1111111010101010111100001',
  ],
  EXHIBITOR: [
    '1111111011011110101111111',
    '1000001000000000101000001',
    '1011101001000110101011101',
    '1011101010100000101011101',
    '1011101010001011001011101',
    '1000001010110011101000001',
    '1111111010101010101111111',
    '0000000011010001100000000',
    '1000101110100001111111001',
    '1100000011000110010010110',
    '0010001100100000001100001',
    '1000110110100000010010110',
    '1000001000010110110011000',
    '1100110001001011100000110',
    '0001001110111111000011100',
    '0001100000010101001111000',
    '1111001000101100111111000',
    '0000000010000110100011000',
    '1111111010100001101011110',
    '1000001000001010100010011',
    '1011101011010111111111010',
    '1011101001101000000000001',
    '1011101001011110011101010',
    '1000001000010101001110111',
    '1111111010001101111011001',
  ],
  VIP: [
    '1111111000000010001111111',
    '1000001011100100001000001',
    '1011101000100001001011101',
    '1011101001101100001011101',
    '1011101011011100101011101',
    '1000001001100011001000001',
    '1111111010101010101111111',
    '0000000000100001000000000',
    '1010101001001000100010010',
    '1101100101001101101001101',
    '1010101001001011110111010',
    '1101010011000111010110010',
    '1000011010110010010111100',
    '0100000101010011111011101',
    '1000101011000101111000111',
    '0100000110110000101011100',
    '1001111111001000111111100',
    '0000000011011101100010011',
    '1111111001111011101010101',
    '1000001000001110100010101',
    '1011101010110011111111100',
    '1011101000110011011011010',
    '1011101011000101000110001',
    '1000001001010001101010011',
    '1111111010101001011111101',
  ],
  SPEAKER: [
    '1111111001011000101111111',
    '1000001000001000101000001',
    '1011101001111011101011101',
    '1011101001000101101011101',
    '1011101001001011001011101',
    '1000001010010000001000001',
    '1111111010101010101111111',
    '0000000000111100000000000',
    '1001011010010011110100000',
    '0010000110011101101001101',
    '0110111010010111010011110',
    '1110100001111101100100000',
    '1110111011100011010111100',
    '0010100001010111111111001',
    '1010101111010110001010101',
    '0110000001110001001011100',
    '1110111110101100111111000',
    '0000000011001111100010001',
    '1111111001111011101010101',
    '1000001010001010100010000',
    '1011101001000001111111100',
    '1011101011010011011011010',
    '1011101000100001100010101',
    '1000001001000011111000001',
    '1111111010101001011111101',
  ],
  MEDIA: [
    '1111111011100010001111111',
    '1000001001100000001000001',
    '1011101001000101101011101',
    '1011101011010011101011101',
    '1011101010110111001011101',
    '1000001011011111101000001',
    '1111111010101010101111111',
    '0000000010110011100000000',
    '1000101111011111111111001',
    '0100110000111000110010110',
    '1010001111001110101100001',
    '1101110110010101110010110',
    '0111011010011100010011000',
    '1010010111100111000000110',
    '0001011001100000100011100',
    '0011100001001011001111000',
    '1100101110110110111111000',
    '0000000010101001100011000',
    '1111111010111111101011110',
    '1000001000010100100010010',
    '1011101010001101111111010',
    '1011101000000110000000001',
    '1011101001100000011101010',
    '1000001001001011001110111',
    '1111111011110111111011001',
  ],
}

export const QR_SIZE = 25
export const QR_FINDERS: [number, number][] = [[0, 0], [QR_SIZE - 7, 0], [0, QR_SIZE - 7]]

const qrCache = new Map<number, [number, number][]>()

const badgeQrCache = new Map<string, [number, number][]>()

/** Dark modules of a badge's real QR code, without the three finder squares (BadgeCard draws those itself). */
export function badgeQrCells(roleKey: string): [number, number][] {
  const hit = badgeQrCache.get(roleKey)
  if (hit) return hit
  const inFinder = (x: number, y: number) => QR_FINDERS.some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7)
  const cells: [number, number][] = []
  BADGE_QR[roleKey]!.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '1' && !inFinder(x, y)) cells.push([x, y])
    }
  })
  badgeQrCache.set(roleKey, cells)
  return cells
}

/** Decorative QR modules, for the QR codes outside the badges. Seeded, so the server render and the browser always match. */
export function qrCells(seed: number): [number, number][] {
  const hit = qrCache.get(seed)
  if (hit) return hit
  let s = seed
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  const inFinder = (x: number, y: number) =>
    QR_FINDERS.some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7)
  const cells: [number, number][] = []
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      if (!inFinder(x, y) && rnd() > 0.5) cells.push([x, y])
    }
  }
  qrCache.set(seed, cells)
  return cells
}
