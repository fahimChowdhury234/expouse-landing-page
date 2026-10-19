/**
 * Articles for /blog and /blog/[slug]. Like utils/news.ts, every post here is
 * fictional sample content until there's a CMS or real articles to replace it.
 *
 * Each post says how it shows in the /blog grid (`card`); the grid places the
 * cards in the order listed here (components/blog/BlogGrid.vue).
 */
import type { ArticleBlock } from '~/utils/news'

export type BlogCategory = 'Playbook' | 'Guide' | 'Exhibitors' | 'Technology' | 'Research' | 'Design' | 'Customer stories'

/**
 * How a post shows in the /blog grid:
 * - feature: big photo with the headline over it (2 × 2 cells)
 * - tall: photo above the headline (1 × 2)
 * - wide: photo beside the headline and excerpt (2 × 1)
 * - promo: brand-purple panel with a call to action, no photo (1 × 1)
 * - stat: one big number and what it means, no photo (1 × 1)
 * - quote: a customer quote on a dark panel (2 × 1)
 * - compact: small photo above the headline (1 × 1)
 */
export type BlogCardStyle =
  | { kind: 'feature' | 'tall' | 'wide' | 'compact' }
  | { kind: 'promo', cta: string }
  | { kind: 'stat', value: string, text: string }
  | { kind: 'quote', text: string, name: string, role: string }

export interface BlogPost {
  slug: string
  category: BlogCategory
  /** ISO date (yyyy-mm-dd). */
  date: string
  readMinutes: number
  title: string
  excerpt: string
  /** The card photo. */
  image: string
  /** Wide photo under the byline. Leave it out when there's no sharp, wide image for the article. */
  cover?: { src: string, caption: string }
  author: { name: string, role: string }
  tags: string[]
  card: BlogCardStyle
  body: ArticleBlock[]
}

export const BLOG_CATEGORIES: BlogCategory[] = ['Playbook', 'Guide', 'Exhibitors', 'Technology', 'Research', 'Design', 'Customer stories']

const SARA = { name: 'Sara Ali', role: 'Product Marketing, EXPOUSE' }
const OMAR = { name: 'Omar Haddad', role: 'Partnerships, EXPOUSE' }
const LINA = { name: 'Lina Farouk', role: 'Communications, EXPOUSE' }
const YOUSEF = { name: 'Yousef Al Balushi', role: 'Onsite Operations, EXPOUSE' }

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'cut-entry-queues-20000-visitor-expo',
    category: 'Playbook',
    date: '2026-10-14',
    readMinutes: 8,
    title: 'How to cut entry queues to under two minutes at a 20,000-visitor expo',
    excerpt: 'Where queues really come from on opening morning, and the gate plan that keeps them moving.',
    image: '/images/gallery/event-1.webp',
    cover: { src: '/images/news/self-check-in-kiosks.webp', caption: 'Opening ceremony, Gulf Home & Build Expo 2026, Muscat.' },
    author: SARA,
    tags: ['Check-in', 'Onsite', 'Kiosks'],
    card: { kind: 'feature' },
    body: [
      { type: 'p', text: 'Long entry queues are rarely about slow staff. They come from too few check-in points at the busiest hour, badges that print one at a time, and visitors who arrive without their QR code ready.' },
      { type: 'h2', text: 'Plan for the first two hours' },
      { type: 'p', text: 'Most visitors arrive soon after the doors open. Size your gates for that peak, not for the daily average, and move staff to other jobs once it passes.' },
      { type: 'stats', items: [
        { value: '< 2 min', label: 'average wait at peak' },
        { value: '8 sec', label: 'from scan to printed badge' },
        { value: '24', label: 'check-in points at the main gate' },
      ] },
      { type: 'h2', text: 'Spread the load across many points' },
      { type: 'p', text: 'Self check-in kiosks let one staff member look after several lanes. Keep two staffed desks for walk-ins, VIPs and anyone who needs help.' },
      { type: 'h2', text: 'Get the QR code ready before the gate' },
      { type: 'steps', items: [
        'Send the QR code by email the day before, and again on the morning of the show.',
        'Put signs in the queue reminding visitors to open their code.',
        'Let visitors without a code find their registration by name or phone number at a kiosk.',
      ] },
      { type: 'quote', text: 'On opening morning we had 6,000 people through the doors before 11am, and nobody waited more than two minutes.', cite: 'Khalid Nasser, Event Director' },
      { type: 'h2', text: 'Watch the gates live' },
      { type: 'p', text: 'Every scan shows up in the dashboard as it happens. When one gate gets busy, move a staff member or open another lane before the queue builds.' },
    ],
  },
  {
    slug: 'exhibitors-booth-scans-into-meetings',
    category: 'Exhibitors',
    date: '2026-10-09',
    readMinutes: 5,
    title: '7 ways exhibitors can turn booth scans into real meetings',
    excerpt: 'A scanned badge is a name, not a lead. Here is how stands turn scans into conversations after the show.',
    image: '/images/gallery/event-7.webp',
    author: OMAR,
    tags: ['Exhibitors', 'Leads', 'Meetings'],
    card: { kind: 'tall' },
    body: [
      { type: 'p', text: 'Exhibitors scan hundreds of badges over a show. The ones who get meetings out of those scans do a few simple things on the stand and in the week after.' },
      { type: 'h2', text: 'On the stand' },
      { type: 'steps', items: [
        'Rate every lead as you scan it, while the conversation is still fresh.',
        'Add one line of notes: what they asked about and what they need next.',
        'Book the follow-up meeting there and then, in the attendee app.',
        'Share one scanning login per staff member, so you know who spoke to whom.',
      ] },
      { type: 'h2', text: 'After the show' },
      { type: 'steps', items: [
        'Download your leads the same evening and send hot leads a note within 24 hours.',
        'Group the rest by interest and send each group one useful follow-up.',
        'Compare leads with meetings booked to see which staff and which hours worked best.',
      ] },
      { type: 'p', text: 'None of this needs extra hardware. Every step works from the EXPOUSE exhibitor app on a phone.' },
    ],
  },
  {
    slug: 'organizers-checklist-show-day',
    category: 'Guide',
    date: '2026-10-06',
    readMinutes: 4,
    title: 'The organizer\'s checklist for show day',
    excerpt: 'Everything to check before the doors open, from badge printers to the dashboard.',
    image: '/images/gallery/event-5.webp',
    author: YOUSEF,
    tags: ['Onsite', 'Checklist'],
    card: { kind: 'promo', cta: 'Read guide' },
    body: [
      { type: 'p', text: 'Show day goes smoothly when the last checks happen the evening before, not at 8am with the doors about to open.' },
      { type: 'h2', text: 'The evening before' },
      { type: 'steps', items: [
        'Print a test badge from every printer, for every role.',
        'Pair each kiosk with its printer and scan a test QR code.',
        'Load spare paper and ribbons at every gate.',
        'Check that staff can sign in to the scanning app.',
      ] },
      { type: 'h2', text: 'One hour before doors' },
      { type: 'steps', items: [
        'Open the live dashboard on a screen in the operations room.',
        'Confirm the venue Wi-Fi, and have a mobile hotspot ready at each gate.',
        'Brief gate staff on walk-ins, VIPs and lost QR codes.',
      ] },
      { type: 'h2', text: 'During the show' },
      { type: 'p', text: 'Watch the busiest gate in the dashboard and move staff when the line grows. Keep one person free to fix printers and kiosks.' },
    ],
  },
  {
    slug: 'attendee-arrival-patterns',
    category: 'Research',
    date: '2026-10-01',
    readMinutes: 5,
    title: '68% of attendees check in within the first two hours',
    excerpt: 'What check-in data from a season of shows says about when visitors arrive, and how to plan for it.',
    image: '/images/gallery/event-4.webp',
    author: LINA,
    tags: ['Research', 'Check-in'],
    card: { kind: 'stat', value: '68%', text: 'of attendees check in within the first two hours. Here\'s how to plan for it.' },
    body: [
      { type: 'p', text: 'We looked at check-in times across a season of trade shows and conferences. The pattern was the same at almost every event: a sharp peak right after the doors open, then a long, quiet tail.' },
      { type: 'stats', items: [
        { value: '68%', label: 'check in within two hours' },
        { value: '41%', label: 'arrive in the first hour' },
        { value: '3×', label: 'busier than the daily average at peak' },
      ] },
      { type: 'h2', text: 'What it means for staffing' },
      { type: 'p', text: 'Put most of your gate staff on the first two hours, then move them to the floor, the info desk or exhibitor support.' },
      { type: 'h2', text: 'What it means for kiosks' },
      { type: 'p', text: 'Plan the number of kiosks for the peak. A kiosk that sits idle in the afternoon has still done its job if it kept the morning queue short.' },
    ],
  },
  {
    slug: 'offline-check-in-venue-wifi',
    category: 'Technology',
    date: '2026-09-26',
    readMinutes: 6,
    title: 'Running check-in offline when the venue Wi-Fi fails',
    excerpt: 'What to prepare, and how scans sync once the connection is back.',
    image: '/images/gallery/event-6.webp',
    author: YOUSEF,
    tags: ['Technology', 'Check-in', 'Onsite'],
    card: { kind: 'wide' },
    body: [
      { type: 'p', text: 'Venue Wi-Fi often struggles when thousands of visitors arrive at once. Plan for it, and the gates keep moving even when the connection drops.' },
      { type: 'h2', text: 'Before the show' },
      { type: 'steps', items: [
        'Download the attendee list to every scanning device the evening before.',
        'Give each gate a mobile hotspot as a backup connection.',
        'Test a scan with Wi-Fi turned off on every device.',
      ] },
      { type: 'h2', text: 'When the connection drops' },
      { type: 'p', text: 'Devices keep scanning against the list they already have. Each scan is saved on the device with its time, so nothing is lost.' },
      { type: 'h2', text: 'When it comes back' },
      { type: 'p', text: 'Saved scans sync to the dashboard automatically. Attendance numbers catch up within a minute, in the right order.' },
    ],
  },
  {
    slug: 'one-platform-registration-badges-app',
    category: 'Customer stories',
    date: '2026-09-18',
    readMinutes: 5,
    title: 'How one organizer stopped exporting spreadsheets between tools',
    excerpt: 'Registration, badges and the attendee app on one platform, and what changed for the team.',
    image: '/images/news/self-check-in-kiosks.webp',
    author: LINA,
    tags: ['Customer story', 'Registration', 'Badges'],
    card: {
      kind: 'quote',
      text: 'We moved registration, badges and the app onto one platform. Our team finally stopped exporting spreadsheets between tools.',
      name: 'Khalid Nasser',
      role: 'Event Director',
    },
    body: [
      { type: 'p', text: 'Khalid Nasser\'s team used to run registration, badge printing and the attendee app on three separate tools. Before every show, attendee records were exported and re-imported several times.' },
      { type: 'quote', text: 'We moved registration, badges and the app onto one platform. Our team finally stopped exporting spreadsheets between tools.', cite: 'Khalid Nasser, Event Director' },
      { type: 'h2', text: 'What changed' },
      { type: 'p', text: 'A change made at registration now shows up at the gate and in the app straight away. Badges print from the same record the attendee filled in.' },
      { type: 'h2', text: 'The result' },
      { type: 'stats', items: [
        { value: '0', label: 'spreadsheet exports before the show' },
        { value: '18,204', label: 'visitors checked in' },
        { value: '1', label: 'system for the whole team to learn' },
      ] },
    ],
  },
  {
    slug: 'badge-design-rules',
    category: 'Design',
    date: '2026-09-10',
    readMinutes: 4,
    title: 'Badge design rules that work for every role',
    excerpt: 'Readable names, clear role colours and a QR code that scans first time.',
    image: '/images/gallery/event-2.webp',
    author: SARA,
    tags: ['Badges', 'Design'],
    card: { kind: 'compact' },
    body: [
      { type: 'p', text: 'A badge has one job: tell people who you are and what you\'re there for, from a couple of metres away.' },
      { type: 'h2', text: 'Rules that hold up on the floor' },
      { type: 'steps', items: [
        'Make the first name the biggest thing on the badge.',
        'Give each role its own colour band: visitor, exhibitor, speaker, VIP, staff.',
        'Keep the QR code away from the lanyard hole and the fold.',
        'Print names in both Arabic and English for bilingual events.',
      ] },
      { type: 'h2', text: 'Test before you print thousands' },
      { type: 'p', text: 'Print one badge per role and hold it at arm\'s length. If you can\'t read the name and the role at a glance, nobody on the floor will.' },
    ],
  },
  {
    slug: 'registration-forms-people-finish',
    category: 'Guide',
    date: '2026-09-02',
    readMinutes: 4,
    title: 'Writing registration forms people actually finish',
    excerpt: 'Fewer fields, clear labels, and questions asked at the right time.',
    image: '/images/gallery/event-3.webp',
    author: SARA,
    tags: ['Registration', 'Forms'],
    card: { kind: 'compact' },
    body: [
      { type: 'p', text: 'Every extra field on a registration form loses some visitors. Ask only for what you need to print a badge and run the event.' },
      { type: 'h2', text: 'Keep the first step short' },
      { type: 'p', text: 'Name, email, company and role are enough to register. Ask about interests and dietary needs later, in a follow-up email or in the app.' },
      { type: 'h2', text: 'Write labels people understand' },
      { type: 'steps', items: [
        'Use plain words: "Company", not "Organization affiliation".',
        'Show an example inside fields with a format, like phone numbers.',
        'Explain errors next to the field, in one short sentence.',
      ] },
      { type: 'h2', text: 'Offer both languages' },
      { type: 'p', text: 'Let visitors register in Arabic or English. Forms switch to right-to-left layouts automatically.' },
    ],
  },
]

export function findBlogPost(slug: string) {
  return BLOG_POSTS.find(p => p.slug === slug)
}

/** Posts in `category` (or all) whose title, excerpt, category or tags contain `query`. */
export function filterBlogPosts(category: BlogCategory | 'All', query: string) {
  const q = query.trim().toLowerCase()
  return BLOG_POSTS.filter((p) => {
    if (category !== 'All' && p.category !== category) return false
    if (!q) return true
    return [p.title, p.excerpt, p.category, ...p.tags].some(s => s.toLowerCase().includes(q))
  })
}

/** Other posts to read after `post`: the same category first, then the latest. */
export function moreBlogPosts(post: BlogPost, count = 3) {
  const others = BLOG_POSTS.filter(p => p.slug !== post.slug)
  const same = others.filter(p => p.category === post.category)
  const rest = others.filter(p => p.category !== post.category).sort((a, b) => b.date.localeCompare(a.date))
  return [...same, ...rest].slice(0, count)
}
