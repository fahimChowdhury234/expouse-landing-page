/**
 * Events and photos for /gallery. Like utils/news.ts, the events are fictional
 * sample content and the photos are the seven in public/images/gallery, reused,
 * until real albums are added.
 *
 * Each event names a mosaic `layout`; the layout says how big each of its
 * photos is, in order (components/gallery/GalleryMosaic.vue places them).
 */

export interface GalleryPhoto {
  src: string
  alt: string
}

/** A tile's footprint on the four-column mosaic: 2 × 2, 2 × 1 or 1 × 1. */
export type TileSize = 'lg' | 'wide' | 'sm'

/**
 * The mosaics from the design, as tile sizes in order:
 * - feature: a large photo, two small and a wide one beside it, then two small and a wide one
 * - rows: a wide photo and two small, then two small and a wide one
 * - quad: a large photo with four small ones beside it
 */
export const MOSAICS = {
  feature: ['lg', 'sm', 'sm', 'wide', 'sm', 'sm', 'wide'],
  rows: ['wide', 'sm', 'sm', 'sm', 'sm', 'wide'],
  quad: ['lg', 'sm', 'sm', 'sm', 'sm'],
} as const satisfies Record<string, readonly TileSize[]>

export type MosaicLayout = keyof typeof MOSAICS

export interface GalleryEvent {
  slug: string
  name: string
  city: string
  country: string
  /** ISO dates (yyyy-mm-dd). */
  start: string
  end: string
  visitors: number
  /** Photos in the full album; the mosaic shows a few of them. */
  photoCount: number
  layout: MosaicLayout
  /** One per tile in the layout. Use the sharpest photos for 'lg' and 'wide' tiles. */
  photos: GalleryPhoto[]
}

const P = {
  kiosks: { src: '/images/news/self-check-in-kiosks.webp', alt: 'Guests in the front rows of a packed opening ceremony' },
  desert: { src: '/images/gallery/event-1.webp', alt: 'Performers on stage in front of a giant LED screen showing a desert village' },
  city: { src: '/images/gallery/event-2.webp', alt: 'Speakers on a stage in front of a panoramic LED wall of a city' },
  choir: { src: '/images/gallery/event-3.webp', alt: 'A choir performing in front of an LED screen' },
  session: { src: '/images/gallery/event-4.webp', alt: 'Guests seated at a conference session' },
  audience: { src: '/images/gallery/event-5.webp', alt: 'A packed audience in an exhibition hall' },
  spotlight: { src: '/images/gallery/event-6.webp', alt: 'A speaker on stage before a large audience under bright lights' },
  hall: { src: '/images/gallery/event-7.webp', alt: 'An exhibition hall with a curved LED wall' },
} satisfies Record<string, GalleryPhoto>

export const GALLERY_STATS = [
  { value: '120+', label: 'events' },
  { value: '9', label: 'countries' },
  { value: '2.4M', label: 'attendees' },
]

/** Newest first. */
export const GALLERY_EVENTS: GalleryEvent[] = [
  {
    slug: 'gulf-home-build-expo-2026',
    name: 'Gulf Home & Build Expo',
    city: 'Muscat',
    country: 'Oman',
    start: '2026-10-05',
    end: '2026-10-08',
    visitors: 18204,
    photoCount: 84,
    layout: 'feature',
    photos: [P.kiosks, P.spotlight, P.hall, P.city, P.choir, P.desert, P.session],
  },
  {
    slug: 'gulf-logistics-expo-2026',
    name: 'Gulf Logistics Expo',
    city: 'Dubai',
    country: 'UAE',
    start: '2026-03-10',
    end: '2026-03-12',
    visitors: 12900,
    photoCount: 72,
    layout: 'rows',
    photos: [P.session, P.choir, P.desert, P.hall, P.audience, P.spotlight],
  },
  {
    slug: 'riyadh-food-hospitality-show-2025',
    name: 'Riyadh Food & Hospitality Show',
    city: 'Riyadh',
    country: 'KSA',
    start: '2025-11-18',
    end: '2025-11-20',
    visitors: 22450,
    photoCount: 84,
    layout: 'feature',
    photos: [P.desert, P.audience, P.spotlight, P.hall, P.city, P.choir, P.session],
  },
  {
    slug: 'doha-tech-summit-2025',
    name: 'Doha Tech Summit',
    city: 'Doha',
    country: 'Qatar',
    start: '2025-05-06',
    end: '2025-05-07',
    visitors: 6300,
    photoCount: 60,
    layout: 'quad',
    photos: [P.kiosks, P.city, P.choir, P.desert, P.hall],
  },
  {
    slug: 'oman-energy-forum-2024',
    name: 'Oman Energy Forum',
    city: 'Muscat',
    country: 'Oman',
    start: '2024-09-23',
    end: '2024-09-25',
    visitors: 9780,
    photoCount: 72,
    layout: 'rows',
    photos: [P.hall, P.choir, P.audience, P.spotlight, P.desert, P.session],
  },
]

/** Years that have events, newest first, for the year tabs. */
export const GALLERY_YEARS = [...new Set(GALLERY_EVENTS.map(e => eventYear(e)))].sort((a, b) => b - a)

export function eventYear(e: GalleryEvent) {
  return Number(e.start.slice(0, 4))
}

const day = (iso: string) => new Date(`${iso}T00:00:00`)

/** { month: "OCT", year: "26" }, for the date badge. */
export function badgeDate(iso: string) {
  const d = day(iso)
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    year: d.toLocaleDateString('en-US', { year: '2-digit' }),
  }
}

/** "Oct 5–8, 2026", or "Sep 28 – Oct 2, 2026" across months, or "Dec 30, 2026 – Jan 2, 2027" across years. */
export function dateRange(start: string, end: string) {
  const a = day(start)
  const b = day(end)
  const month = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' })
  if (start === end) return `${month(a)} ${a.getDate()}, ${a.getFullYear()}`
  if (a.getFullYear() !== b.getFullYear()) {
    return `${month(a)} ${a.getDate()}, ${a.getFullYear()} – ${month(b)} ${b.getDate()}, ${b.getFullYear()}`
  }
  if (a.getMonth() !== b.getMonth()) return `${month(a)} ${a.getDate()} – ${month(b)} ${b.getDate()}, ${b.getFullYear()}`
  return `${month(a)} ${a.getDate()}–${b.getDate()}, ${b.getFullYear()}`
}
