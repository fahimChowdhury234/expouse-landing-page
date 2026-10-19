/**
 * Posts for /news (Newsroom) and /news/[slug]. Every post here is fictional
 * sample content, in the same spirit as utils/events.ts - the pages ship with
 * example stories until there's a CMS or real announcements to replace them.
 */

export type NewsCategory = 'Product' | 'Company' | 'Events' | 'Partnership' | 'Press'

/** One piece of an article, in reading order. Every "h2" becomes a table-of-contents entry. */
export type ArticleBlock =
  | { type: 'p', text: string }
  | { type: 'h2', text: string }
  | { type: 'stats', items: { value: string, label: string }[] }
  | { type: 'quote', text: string, cite: string }
  | { type: 'figure', src: string, caption: string }
  | { type: 'steps', items: string[] }

export interface NewsPost {
  slug: string
  category: NewsCategory
  /** ISO date (yyyy-mm-dd). */
  date: string
  readMinutes: number
  title: string
  excerpt: string
  /** Thumbnail for the list and the "More from the newsroom" cards. */
  image: string
  /** Wide photo under the byline. Leave it out when there's no sharp, wide image for the story. */
  cover?: { src: string, caption: string }
  author: { name: string, role: string }
  tags: string[]
  body: ArticleBlock[]
  /** Slugs for "More from the newsroom"; the latest other posts when left out. */
  related?: string[]
}

export const NEWS_CATEGORIES: NewsCategory[] = ['Product', 'Company', 'Events', 'Partnership', 'Press']

const SARA = { name: 'Sara Ali', role: 'Product Marketing, EXPOUSE' }
const OMAR = { name: 'Omar Haddad', role: 'Partnerships, EXPOUSE' }
const LINA = { name: 'Lina Farouk', role: 'Communications, EXPOUSE' }

/** The lead story, shown above the filtered list - not repeated in it. */
export const FEATURED_POST: NewsPost = {
  slug: 'self-check-in-kiosks-2026-27',
  category: 'Product',
  date: '2026-10-02',
  readMinutes: 4,
  title: 'EXPOUSE launches self check-in kiosks for the 2026–27 season',
  excerpt: 'Attendees scan a QR code and get a printed badge in seconds. Organizers report entry queues under two minutes at peak.',
  image: '/images/news/self-check-in-kiosks.png',
  cover: { src: '/images/news/self-check-in-kiosks.png', caption: 'Opening ceremony, Gulf Home & Build Expo 2026, Muscat.' },
  author: SARA,
  tags: ['Check-in', 'Badges', 'Onsite'],
  related: ['gulf-logistics-expo-official-platform', 'meeting-balance-cancellation-rules', 'gulf-home-build-expo-recap'],
  body: [
    { type: 'p', text: 'Starting this season, every EXPOUSE event can run self check-in kiosks at the entrance. Attendees walk up, scan the QR code on their phone, and collect a printed badge without waiting for staff.' },
    { type: 'p', text: 'The kiosks run on standard tablets and supported badge printers. They use the same attendee record as registration and the app, so nothing needs to be exported or re-entered on show day.' },
    { type: 'h2', text: 'What changes for attendees' },
    { type: 'p', text: 'Most visitors arrive in the first two hours. Kiosks spread that load across many points instead of one desk, so the line keeps moving even at peak.' },
    { type: 'stats', items: [
      { value: '< 2 min', label: 'average wait at peak' },
      { value: '8 sec', label: 'from scan to printed badge' },
      { value: '6,000', label: 'check-ins before 11am' },
    ] },
    { type: 'h2', text: 'What organizers get' },
    { type: 'p', text: 'Every scan shows up live in the dashboard. You can see how many people are inside, which gate is busiest and when to move staff.' },
    { type: 'quote', text: 'On opening morning we had 6,000 people through the doors before 11am, and nobody waited more than two minutes.', cite: 'Khalid Nasser, Event Director' },
    { type: 'figure', src: '/images/gallery/event-1.webp', caption: 'Visitors seated for the opening session after kiosk check-in.' },
    { type: 'h2', text: 'How to set it up' },
    { type: 'steps', items: [
      'Add kiosks under Onsite → Check-in and choose a badge layout for each role.',
      'Pair each tablet with a printer using the access code shown in the dashboard.',
      'Open the gates. Scans appear live in the dashboard.',
    ] },
    { type: 'h2', text: 'Availability' },
    { type: 'p', text: 'Self check-in is available today on Event and Organizer plans. Talk to your success manager to add kiosks to an upcoming event.' },
  ],
}

export const NEWS_POSTS: NewsPost[] = [
  {
    slug: 'gulf-logistics-expo-official-platform',
    category: 'Partnership',
    date: '2026-09-24',
    readMinutes: 3,
    title: 'EXPOUSE becomes the official platform for Gulf Logistics Expo through 2028',
    excerpt: 'A three-year agreement covering registration, badges and the attendee app.',
    image: '/images/gallery/event-6.webp',
    author: OMAR,
    tags: ['Partnership', 'Registration', 'Attendee app'],
    body: [
      { type: 'p', text: 'Gulf Logistics Expo has chosen EXPOUSE as its official event platform for the 2026, 2027 and 2028 editions. The agreement covers online registration, badge printing at the venue and the attendee app.' },
      { type: 'p', text: 'The show brings together ports, freight forwarders and supply-chain technology companies at Dubai World Trade Centre each November.' },
      { type: 'h2', text: 'What\'s included' },
      { type: 'p', text: 'Visitors and exhibitors register through one branded form. Badges print on arrival, and the attendee app carries the floor plan, the agenda and meeting requests.' },
      { type: 'h2', text: 'Why one platform' },
      { type: 'p', text: 'Running registration, check-in and the app on separate tools meant attendee records were exported and re-imported several times before each show. With one platform, a change made at registration shows up at the gate and in the app straight away.' },
      { type: 'quote', text: 'We wanted one system our team could learn once and use for three editions.', cite: 'Rania Saleh, Show Director, Gulf Logistics Expo' },
      { type: 'h2', text: 'What\'s next' },
      { type: 'p', text: 'Setup for the 2026 edition is under way. Exhibitor registration opens first, with visitor registration following shortly after.' },
    ],
  },
  {
    slug: 'meeting-balance-cancellation-rules',
    category: 'Product',
    date: '2026-09-11',
    readMinutes: 3,
    title: 'Meeting balance and cancellation rules now in the attendee app',
    excerpt: 'Organizers can set how many meetings each attendee can book, with clear rules when one is cancelled.',
    image: '/images/gallery/event-7.webp',
    author: SARA,
    tags: ['Meetings', 'Attendee app'],
    body: [
      { type: 'p', text: 'Organizers can now set a meeting balance: the number of meetings each attendee can book during an event. The balance shows in the attendee app, so people always know how many requests they have left.' },
      { type: 'h2', text: 'How the balance works' },
      { type: 'p', text: 'Set a default balance for everyone, or a different one for each ticket type. VIP buyers might get ten meetings while general visitors get three.' },
      { type: 'steps', items: [
        'Open Meetings → Settings and turn on meeting balance.',
        'Set a default number, then adjust it for each ticket type if you need to.',
        'Choose what happens when a meeting is cancelled.',
      ] },
      { type: 'h2', text: 'Clear cancellation rules' },
      { type: 'p', text: 'When a meeting is cancelled, you decide whether the slot goes back to the attendee\'s balance. Return it every time, return it only when the other person cancelled, or keep it used.' },
      { type: 'h2', text: 'Availability' },
      { type: 'p', text: 'Meeting balance is available now for every event with meetings turned on.' },
    ],
  },
  {
    slug: 'new-office-riyadh',
    category: 'Company',
    date: '2026-08-28',
    readMinutes: 2,
    title: 'EXPOUSE opens a new office in Riyadh',
    excerpt: 'A local team for onsite support across Saudi Arabia.',
    image: '/images/gallery/event-2.webp',
    author: LINA,
    tags: ['Company', 'Saudi Arabia', 'Onsite'],
    body: [
      { type: 'p', text: 'EXPOUSE has opened an office in Riyadh. The new team gives organizers in Saudi Arabia onsite support in their own time zone, from setup week to the last day of the show.' },
      { type: 'h2', text: 'What the Riyadh team does' },
      { type: 'p', text: 'The team helps with badge printer setup, kiosk installation and staff training before the doors open. During the event they\'re on the floor to handle check-in questions and hardware issues.' },
      { type: 'h2', text: 'Events across the Kingdom' },
      { type: 'p', text: 'From Riyadh the team can reach events in Jeddah, Dammam and Al Khobar at short notice. Organizers can book onsite support when they plan their event, or add it later.' },
    ],
  },
  {
    slug: 'gulf-home-build-expo-recap',
    category: 'Events',
    date: '2026-08-06',
    readMinutes: 3,
    title: '18,204 visitors at Gulf Home & Build Expo, run end to end on EXPOUSE',
    excerpt: 'Four days, three halls and 214 exhibitors on a single platform.',
    image: '/images/gallery/event-3.webp',
    author: LINA,
    tags: ['Events', 'Check-in', 'Exhibitors'],
    body: [
      { type: 'p', text: 'Gulf Home & Build Expo welcomed 18,204 visitors over four days at Oman Convention & Exhibition Centre in Muscat. Every part of the show ran on EXPOUSE, from the first registration to the final report.' },
      { type: 'stats', items: [
        { value: '18,204', label: 'visitors over four days' },
        { value: '214', label: 'exhibitors in three halls' },
        { value: '9,600', label: 'leads scanned by exhibitors' },
      ] },
      { type: 'h2', text: 'Registration and check-in' },
      { type: 'p', text: 'Visitors registered online in English or Arabic and got their QR code by email. At the venue, kiosks and staffed desks printed badges as people arrived.' },
      { type: 'h2', text: 'Exhibitors and leads' },
      { type: 'p', text: 'Exhibitors scanned visitor badges with the EXPOUSE app and rated each lead on the spot. After the show, every exhibitor downloaded their leads as a spreadsheet.' },
      { type: 'quote', text: 'It was the first year we had live numbers for every hall, every hour.', cite: 'Yousef Al Balushi, Operations Manager' },
    ],
  },
  {
    slug: 'full-arabic-support-rtl',
    category: 'Product',
    date: '2026-07-15',
    readMinutes: 3,
    title: 'Full Arabic support with right-to-left layouts',
    excerpt: 'Website, app, emails and printed badges now switch to Arabic in one click.',
    image: '/images/gallery/event-1.webp',
    author: SARA,
    tags: ['Arabic', 'Product'],
    body: [
      { type: 'p', text: 'Every part of EXPOUSE now works fully in Arabic, with right-to-left layouts. Organizers can switch an event to Arabic in one click, or offer both languages and let each attendee choose.' },
      { type: 'h2', text: 'What switches to Arabic' },
      { type: 'p', text: 'The event website, registration forms, the attendee app, confirmation emails and printed badges. Layouts flip to right-to-left, and names print in Arabic script.' },
      { type: 'h2', text: 'Two languages, one event' },
      { type: 'p', text: 'For bilingual events, write your content in both languages once. Attendees see their own language everywhere, and badges can show names in both scripts.' },
      { type: 'h2', text: 'Availability' },
      { type: 'p', text: 'Arabic support is included on every plan at no extra cost.' },
    ],
  },
  {
    slug: 'top-event-tech-startups',
    category: 'Press',
    date: '2026-07-02',
    readMinutes: 2,
    title: 'EXPOUSE featured among the region\'s top event-tech startups',
    excerpt: 'Recognised for onsite check-in speed and exhibitor lead tools.',
    image: '/images/gallery/event-5.webp',
    author: LINA,
    tags: ['Press'],
    body: [
      { type: 'p', text: 'EXPOUSE has been named among the region\'s most promising event-technology startups. The judges pointed to fast onsite check-in and the tools exhibitors use to capture leads.' },
      { type: 'h2', text: 'What the judges noted' },
      { type: 'p', text: 'Check-in speed at large shows, with badges printed in seconds, and an exhibitor app that lets stands scan, rate and follow up on leads without extra hardware.' },
      { type: 'h2', text: 'What\'s next' },
      { type: 'p', text: 'We\'ll keep building for the region\'s largest shows, starting with self check-in kiosks for the 2026–27 season.' },
    ],
  },
]

export const ALL_POSTS: NewsPost[] = [FEATURED_POST, ...NEWS_POSTS]

export function findPost(slug: string) {
  return ALL_POSTS.find(p => p.slug === slug)
}

/** The post's chosen related stories, or else the latest other posts. */
export function morePosts(post: NewsPost, count = 3) {
  const picked = (post.related ?? []).map(findPost).filter((p): p is NewsPost => !!p)
  const latest = ALL_POSTS
    .filter(p => p.slug !== post.slug && !picked.includes(p))
    .sort((a, b) => b.date.localeCompare(a.date))
  return [...picked, ...latest].slice(0, count)
}

/** "What changes for attendees" -> "what-changes-for-attendees", for heading anchors. */
export function headingId(text: string) {
  return text.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/** "Sara Ali" -> "SA". */
export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('')
}

/** "24" / "Sep 2026", for the list's date column. */
export function listDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`)
  return {
    day: d.toLocaleDateString('en-US', { day: '2-digit' }),
    month: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  }
}

/** "Oct 2, 2026", for the featured card and articles. */
export function longDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
