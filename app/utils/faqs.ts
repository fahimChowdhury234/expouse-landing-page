/**
 * Every FAQ on the site, grouped by topic for /faq (pages/faq.vue).
 *
 * FAQS is the homepage's short list: rendered by FaqSection.vue and published
 * as FAQPage structured data by pages/index.vue - Google requires the
 * structured data to match the visible text, so both read this one list. The
 * /faq page does the same with FAQ_GROUPS.
 *
 * Answers follow expouse-landing/index.html's FAQ and the feature pages
 * (utils/features.ts). CONFIRM before launch: the launch time, the hardware
 * list, which lists can be imported and the languages beyond English and Arabic
 * (see docs/website-landing-page.md, "Claims to confirm").
 */
export interface Faq {
  q: string
  a: string
}

export interface FaqGroup {
  topic: string
  items: Faq[]
}

const LAUNCH: Faq = {
  q: 'How quickly can we launch an event?',
  a: 'Most events with registration, badges and check-in go live within a few days. We help you import your attendee list, set up the badges and train your gate staff.',
}

const BRANDING: Faq = {
  q: 'Can we use our own domain and branding?',
  a: 'Yes. Every event gets its own website, either on an expouse.com address or on your own domain, with your logo, colors and login page. Inside the EXPOUSE app, attendees see your branding too.',
}

const OFFLINE: Faq = {
  q: 'What if the venue internet goes down?',
  a: 'The scanner app keeps checking people in offline and sends every scan once the connection is back, so nothing is lost. Badge printing does need a connection, so give your kiosks and print desks a stable line.',
}

const HARDWARE: Faq = {
  q: 'Which printers and scanners are supported?',
  a: 'All you need is a badge printer and Google Chrome. A self-service kiosk is just a touch-screen PC with a USB QR scanner and a printer. Gates, tablets and other desks can send badges to a print station nearby.',
}

const IMPORT: Faq = {
  q: 'Can we import our existing attendee list?',
  a: 'Yes. You can import attendees, exhibitors, speakers, sessions and guest lists from Excel or CSV.',
}

/** The homepage's five. */
export const FAQS: Faq[] = [LAUNCH, BRANDING, OFFLINE, HARDWARE, IMPORT]

export const FAQ_GROUPS: FaqGroup[] = [
  {
    topic: 'Getting started',
    items: [
      LAUNCH,
      BRANDING,
      IMPORT,
      {
        q: 'Do you help us set up the first event?',
        a: 'Yes. We help you import your lists, set up registration and badges, and train your gate staff before the doors open. Nothing to install: your team works in the browser and attendees use the web app or the EXPOUSE app on iOS and Android.',
      },
    ],
  },
  {
    topic: 'Check-in & badges',
    items: [
      OFFLINE,
      HARDWARE,
      {
        q: 'Can attendees print their own badge?',
        a: 'Yes. At a self-service kiosk attendees scan the QR code from their confirmation email and walk away with a printed badge in seconds, with their name, company, role color and QR code.',
      },
      {
        q: 'Can we design a different badge for each role?',
        a: 'Yes. Design a badge per guest type with your own layout, colors and logos. The details fill in automatically from registration, and staff at hall and session doors see a clear allow or deny screen in under a second.',
      },
    ],
  },
  {
    topic: 'Apps & engagement',
    items: [
      {
        q: 'Do attendees need a password for the app?',
        a: 'No. Attendees log in with the email they registered with and never need a password. Their agenda, QR badge, exhibitors, networking and live sessions are all in one app.',
      },
      {
        q: 'Do sessions have live Q&A and polls?',
        a: 'Yes. Every session has its own chat, Q&A and live polls, with moderation built in. Speakers see the approved questions and poll results on their own screen.',
      },
      {
        q: 'Can we send announcements during the event?',
        a: 'Yes. Share announcements, photos and sponsor posts in the app\'s live feed, with push notifications for what matters, like a room change or a session about to start.',
      },
    ],
  },
  {
    topic: 'Exhibitors & meetings',
    items: [
      {
        q: 'What can exhibitors do in their portal?',
        a: 'Each exhibitor edits their profile, uploads documents, adds team members and orders badges themselves, without emailing your team.',
      },
      {
        q: 'How do exhibitors capture leads?',
        a: 'Booth staff scan a visitor\'s badge with their phone, rate the lead and add notes or answers to custom questions. All leads land in one list they can export to their CRM the same day.',
      },
      {
        q: 'Can attendees book meetings with exhibitors?',
        a: 'Yes. People get suggestions based on their profile and interests, request a time slot and place, and the other side accepts, declines or suggests a new time. You set how many meetings each ticket or exhibitor package can request.',
      },
    ],
  },
  {
    topic: 'Languages & region',
    items: [
      {
        q: 'Which languages are supported?',
        a: 'English and Arabic, with Arabic laid out right to left across the website, the app, the emails and the printed badges. Other languages, such as French, Spanish and Bengali, can be switched on for your event, and each attendee picks their own.',
      },
      {
        q: 'Can visitors register in Arabic?',
        a: 'Yes. Registration forms offer each visitor their language, and an Arabic form switches to a right-to-left layout automatically. Their badge, emails and app follow the language they chose.',
      },
    ],
  },
  {
    topic: 'Data & security',
    items: [
      {
        q: 'How is our data kept separate from other organizers?',
        a: 'Each organization\'s data is kept apart at the database level, so no other organizer can see your attendees, exhibitors or reports. Badge QR codes carry encrypted tokens, so copied or shared badges are stopped at the gate.',
      },
      {
        q: 'Can we limit what each staff member can see?',
        a: 'Yes. With role-based access you choose exactly which pages each staff member can view, edit or export.',
      },
    ],
  },
  {
    topic: 'Pricing & plans',
    items: [
      {
        q: 'How much does EXPOUSE cost?',
        a: 'Every event is quoted on what it needs. There are three plans: Event for a single conference or expo, Organizer for teams running several events a year, and Enterprise for large shows and multi-hall venues. Book a call and we will send you a quote.',
      },
      {
        q: 'Do you offer support at the venue?',
        a: 'Yes. The Enterprise plan includes onsite hardware and support and a dedicated success manager. On every plan we help you set up and train your gate staff before the event.',
      },
    ],
  },
]

/** Groups narrowed to `topic` (or all) and to questions whose question or answer contains `query`. */
export function filterFaqGroups(topic: string, query: string) {
  const q = query.trim().toLowerCase()
  return FAQ_GROUPS
    .filter(g => topic === 'All' || g.topic === topic)
    .map(g => ({ ...g, items: q ? g.items.filter(f => `${f.q} ${f.a}`.toLowerCase().includes(q)) : g.items }))
    .filter(g => g.items.length)
}
