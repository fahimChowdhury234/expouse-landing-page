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
 * list, which lists can be imported, the languages beyond English and Arabic,
 * and the branded app (see docs/website-landing-page.md, "Claims to confirm").
 */
export interface Faq {
  q: string
  a: string
}

export interface FaqGroup {
  topic: string
  icon: string
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
    icon: 'lucide:rocket',
    items: [
      LAUNCH,
      IMPORT,
      {
        q: 'Do we need to install anything?',
        a: 'No. Your team runs the event from the browser, exhibitors get their own portal, and attendees use the web app or the EXPOUSE app on iOS and Android. For badge printing you only need Google Chrome and a badge printer.',
      },
      {
        q: 'Can we see EXPOUSE before we decide?',
        a: 'Yes. Book a 30-minute call and we will walk you through how your event would run, from the registration form to the final report.',
      },
    ],
  },
  {
    topic: 'Registration & tickets',
    icon: 'lucide:clipboard-list',
    items: [
      {
        q: 'Can different guest types see different questions?',
        a: 'Yes. Add fields, logic and ticket types without code. Visitors, exhibitors and media each follow their own path through the same form and only see the questions that matter to them.',
      },
      {
        q: 'Can we sell paid tickets?',
        a: 'Yes. Offer free, paid and group tickets with early-bird pricing and promo codes. Invoices and receipts go out automatically.',
      },
      {
        q: 'What do attendees get after they register?',
        a: 'A QR badge by email straight away. They can log in to the attendee app with the same email, so their badge, agenda and account are ready before they arrive.',
      },
    ],
  },
  {
    topic: 'Badges & check-in',
    icon: 'lucide:scan-line',
    items: [
      HARDWARE,
      OFFLINE,
      {
        q: 'Can we design a different badge for each guest type?',
        a: 'Yes. Design badges per guest type with your own layout, colors and logos. Names, companies, role colors and the QR code fill in automatically from registration.',
      },
      {
        q: 'Can we control access to halls and sessions?',
        a: 'Yes. Staff scan badges at hall entrances and session rooms, and the result shows in under a second with clear allow and deny screens.',
      },
    ],
  },
  {
    topic: 'Exhibitors',
    icon: 'lucide:store',
    items: [
      {
        q: 'What can exhibitors do in their portal?',
        a: 'Each exhibitor edits their profile, uploads documents, adds team members and orders badges themselves, without emailing your team.',
      },
      {
        q: 'How do exhibitors capture leads?',
        a: 'Booth staff scan a visitor\'s badge with their phone, rate the lead and add notes or answers to custom questions. All leads land in one list they can export to their CRM the same day.',
      },
    ],
  },
  {
    topic: 'Attendee app & networking',
    icon: 'lucide:smartphone',
    items: [
      {
        q: 'Do attendees need a password?',
        a: 'No. Attendees log in with their email and never need a password. Their agenda, QR badge, exhibitors, networking and live sessions are all in one app.',
      },
      {
        q: 'Can attendees book meetings with each other?',
        a: 'Yes. People get suggestions based on their profile and interests, request a time slot and place, and the other person accepts, declines or suggests a new time. You can set how many meetings each ticket or package can request.',
      },
      {
        q: 'Do sessions have live Q&A and polls?',
        a: 'Yes. Every session has its own chat, Q&A and live polls, with moderation built in. Speakers see the approved questions and poll results on their own screen.',
      },
    ],
  },
  {
    topic: 'Branding & languages',
    icon: 'lucide:globe',
    items: [
      BRANDING,
      {
        q: 'Which languages are supported?',
        a: 'English and Arabic, with Arabic laid out right to left across the website, the app, the emails and the printed badges. Other languages, such as French, Spanish and Bengali, can be switched on for your event, and each attendee picks their own.',
      },
      {
        q: 'Can we have our own branded app?',
        a: 'On the Organizer and Enterprise plans, attendees get the event app in your branding on iOS and Android. Talk to us about what fits your event.',
      },
    ],
  },
  {
    topic: 'Security & data',
    icon: 'lucide:shield-check',
    items: [
      {
        q: 'How is our data kept separate from other organizers?',
        a: 'Each organization\'s data is kept apart at the database level, so no other organizer can ever see your attendees, exhibitors or reports.',
      },
      {
        q: 'Can we limit what each staff member can see?',
        a: 'Yes. With role-based access you choose exactly which pages each staff member can view, edit or export.',
      },
      {
        q: 'Can badges be copied or shared?',
        a: 'Badge QR codes carry encrypted tokens, so copied or shared badges are stopped at the gate.',
      },
    ],
  },
  {
    topic: 'Pricing & support',
    icon: 'lucide:life-buoy',
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
