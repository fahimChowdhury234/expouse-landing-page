/**
 * The product feature pages, /features/[slug] (Figma: Registration & ticketing).
 *
 * Every page has the same design - hero, three feature rows, FAQ, "Explore
 * other features" and a demo banner - so a page is just one entry here. The
 * header's Platform menu and each page's "Explore other features" read this
 * same list, in this order.
 *
 * Pictures live in public/images/features/<slug>/: sample product screens
 * drawn as SVG, to swap for real screenshots (any format, 16:10) when there
 * are some.
 *
 * Registration & ticketing follows the design. The other pages are written
 * from the claims already on the homepage (docs/website-landing-page.md §4) -
 * CONFIRM their copy and FAQ answers before launch.
 */

export interface FeatureImage {
  src: string
  /** Says what the picture shows, for screen readers and search engines. */
  alt: string
}

export interface FeatureRow {
  /** The row's anchor on the page (#form-builder). */
  id: string
  eyebrow: string
  title: string
  text: string
  /** Three short lines, each with a check. */
  points: string[]
  image: FeatureImage
}

export interface FeaturePage {
  slug: string
  /** The feature's name, as the hero's trail and the "Explore other features" cards show it. */
  name: string
  /** A shorter name for the header's Platform menu, when the full one is long. */
  menuName?: string
  /** The name inside the demo banner's sentence: "See … with your own event". (The FAQ heading uses `name`.) */
  subject: string
  icon: string
  /** One short line under the name in the header's Platform menu. */
  menuText: string
  seo: { title: string, description: string }
  hero: {
    title: string
    text: string
    /** Short facts in a row under the buttons. */
    highlights: string[]
    /** Shown in the address bar of the browser frame around the picture: a URL, or a short label. */
    url: string
    image: FeatureImage
  }
  rows: FeatureRow[]
  faqs: { q: string, a: string }[]
  /** The demo banner's line under its headline. */
  ctaText: string
}

const img = (slug: string, name: string, alt: string): FeatureImage => ({ src: `/images/features/${slug}/${name}.svg`, alt })

const DEMO = 'A 30-minute walkthrough, set up with your event\'s details.'

export const FEATURE_PAGES: FeaturePage[] = [
  {
    slug: 'registration',
    name: 'Registration & ticketing',
    subject: 'registration & ticketing',
    icon: 'lucide:file-text',
    menuText: 'Forms, tickets and guest types',
    seo: {
      title: 'Event registration & ticketing software | EXPOUSE',
      description: 'Branded registration forms and tickets for every guest type: conditional questions, paid tickets and promo codes, with a QR badge sent the moment they register.',
    },
    hero: {
      title: 'Registration forms that fit every type of guest',
      text: 'Build branded registration and ticketing in minutes. Each visitor type sees only the questions that matter to them, and their badge and app account are ready the moment they finish.',
      highlights: ['Visitors, exhibitors, media, VIP', 'Free and paid tickets', 'English & Arabic'],
      url: 'app.expouse.com/org/registration',
      image: img('registration', 'hero', 'The registration dashboard: guest types with their registration counts beside a live preview of the form'),
    },
    rows: [
      {
        id: 'form-builder',
        eyebrow: 'Form builder',
        title: 'One form, different paths for each guest',
        text: 'Add fields, logic and ticket types without code. Visitors, exhibitors and media each follow their own path through the same form.',
        points: ['Conditional questions by guest type', 'Approval rules for VIP and media', 'Custom fields and file uploads'],
        image: img('registration', 'form-builder', 'The form builder: a field shown only to media guests, with its show-if rule and an approval step'),
      },
      {
        id: 'ticketing',
        eyebrow: 'Ticketing & payments',
        title: 'Sell tickets and packages online',
        text: 'Offer free, paid and group tickets with early-bird pricing and promo codes. Invoices and receipts go out automatically.',
        points: ['Early-bird, group and promo codes', 'Online card payments and invoices', 'Capacity limits per ticket type'],
        image: img('registration', 'ticketing', 'Ticket types with prices and seats left, a promo code applied at checkout and a card payment confirmed'),
      },
      {
        id: 'badge-access',
        eyebrow: 'Instant badge & app access',
        title: 'Registered once, ready everywhere',
        text: 'As soon as someone registers, they get a QR badge by email and can log in to the attendee app with the same email.',
        points: ['QR badge email in seconds', 'App login with no password', 'Reminders before the event'],
        image: img('registration', 'badge-access', 'The confirmation email with a QR badge, next to the attendee app signed in with the same email'),
      },
    ],
    faqs: [
      { q: 'Can each guest type see different questions?', a: 'Yes. Questions can be shown or hidden based on the guest type or any earlier answer.' },
      { q: 'Do you support paid tickets?', a: 'Yes. Sell free, paid and group tickets with early-bird prices and promo codes. Guests pay online by card, and invoices and receipts are sent automatically.' },
      { q: 'Can we import registrations from another system?', a: 'Yes. You can import attendees, exhibitors, speakers and guest lists from Excel or CSV, and everyone imported gets their badge like any other guest.' },
      { q: 'Is the form available in Arabic?', a: 'Yes. Every form can be shown in English and Arabic, with a full right-to-left layout for Arabic.' },
    ],
    ctaText: DEMO,
  },

  {
    slug: 'check-in',
    name: 'Check-in & badge printing',
    subject: 'check-in & badge printing',
    icon: 'lucide:printer',
    menuText: 'Kiosks, badges and gates',
    seo: {
      title: 'Event check-in & badge printing | EXPOUSE',
      description: 'Self-service kiosks that print a badge in seconds, a badge design for every role, and access control at every hall and session that works without internet.',
    },
    hero: {
      title: 'Self check-in that keeps every entrance moving',
      text: 'Attendees scan their QR code at a kiosk and walk away with a printed badge in seconds. Staff scanners and gates handle the rest, even without internet.',
      highlights: ['Self-service kiosks', 'Badge printing on arrival', 'Works offline'],
      url: 'app.expouse.com/org/onsite/kiosks',
      image: img('check-in', 'hero', 'The check-in dashboard: arrivals per gate, the latest scans and the print queue'),
    },
    rows: [
      {
        id: 'kiosks',
        eyebrow: 'Self-service kiosks',
        title: 'Scan, print and walk in',
        text: 'Kiosks guide each attendee through check-in in a few taps. The badge prints with their name, company, role color and QR code.',
        points: ['QR, email or name lookup', 'On-screen instructions in two languages', 'Walk-up registration at the kiosk'],
        image: img('check-in', 'kiosks', 'A self-service kiosk screen asking to scan the QR code, with a badge printing'),
      },
      {
        id: 'badge-designer',
        eyebrow: 'Badge designer',
        title: 'A badge design for every role',
        text: 'Design badges per guest type with your own layout, colors and logos. Data fills in automatically from registration.',
        points: ['Role colors for visitor, exhibitor, VIP, media', 'Photo, QR and custom fields', 'Print on cards, paper or labels'],
        image: img('check-in', 'badge-designer', 'The badge editor: a visitor badge with name, company and QR code, and its layers panel'),
      },
      {
        id: 'gates',
        eyebrow: 'Gates & staff scanners',
        title: 'Access control for halls and sessions',
        text: 'Staff scan badges at hall entrances and session rooms. Results show in under a second, with clear allow and deny screens.',
        points: ['Zone and session access rules', 'Offline mode that syncs later', 'Live entry counts per gate'],
        image: img('check-in', 'gates', 'The scanner app showing a green check-in result and a "not valid for this gate" result, with scans waiting to sync offline'),
      },
    ],
    faqs: [
      { q: 'What hardware do we need?', a: 'A tablet or touch screen and a supported badge printer for each kiosk. We help you choose and set them up.' },
      { q: 'What happens if the internet goes down?', a: 'The scanner app keeps checking people in offline and sends every scan once the connection is back, so nothing is lost. Badge printing does need a connection, so give your kiosks and print desks a stable line.' },
      { q: 'Can attendees register on the spot?', a: 'Yes. Walk-up visitors can register at the kiosk, and their badge prints as soon as they finish.' },
      { q: 'Can we print badges at the help desk too?', a: 'Yes. Help desk staff can find any attendee by QR code, email or name and print their badge there. Gates and other desks can also send badges to a print station nearby.' },
    ],
    ctaText: DEMO,
  },

  {
    slug: 'mobile-app',
    name: 'Attendee mobile app',
    subject: 'the attendee app',
    icon: 'lucide:smartphone',
    menuText: 'Agenda, badge and networking',
    seo: {
      title: 'Event app for attendees | EXPOUSE',
      description: 'One branded event app for iOS, Android and the web: agenda, QR badge, exhibitors, networking, live sessions and an event feed, in English and Arabic.',
    },
    hero: {
      title: 'One app for the whole event day',
      text: 'Agenda, badge, exhibitors, networking and live sessions in one branded app. Attendees log in with their email and never need a password.',
      highlights: ['iOS, Android & web', 'Your event branding', 'English & Arabic'],
      url: 'Attendee app · iOS & Android',
      image: img('mobile-app', 'hero', 'The app settings page with the attendee app\'s home screen previewed on a phone'),
    },
    rows: [
      {
        id: 'agenda',
        eyebrow: 'Personal agenda',
        title: 'Plan the day in a few taps',
        text: 'Attendees browse sessions by day, track and tag, save the ones they like and get reminders before they start.',
        points: ['Filter by day, track and tag', 'Saved sessions and reminders', 'Speaker profiles and session details'],
        image: img('mobile-app', 'agenda', 'The app\'s agenda: today\'s sessions with times, rooms and a saved session'),
      },
      {
        id: 'badge-exhibitors',
        eyebrow: 'Badge & exhibitors',
        title: 'QR badge and exhibitor directory',
        text: 'The QR badge is always one tap away. Attendees can search exhibitors, see booth numbers and save the ones to visit.',
        points: ['QR badge for entry and scanning', 'Exhibitor directory with booth numbers', 'Bookmarks and notes'],
        image: img('mobile-app', 'badge-exhibitors', 'The digital QR badge in the app, beside the exhibitor list with booth numbers and bookmarked booths'),
      },
      {
        id: 'feed',
        eyebrow: 'Event feed',
        title: 'Updates people actually see',
        text: 'Share announcements, photos and sponsor posts in a live feed, with push notifications for what matters.',
        points: ['Live feed and announcements', 'Push notifications', 'Sponsor placements'],
        image: img('mobile-app', 'feed', 'The app\'s event feed with an organizer announcement, a photo post and a sponsored post, beside a push notification'),
      },
    ],
    faqs: [
      { q: 'Can the app carry our own brand?', a: 'Yes. Use the EXPOUSE app with your event branding, or publish your own branded app.' },
      { q: 'Do attendees need a password?', a: 'No. They sign in with the email they registered with, and their badge and agenda are already there.' },
      { q: 'Does it work on the web too?', a: 'Yes. Attendees can use the app on iPhone, Android or in their browser, with the same login, agenda and badge everywhere.' },
      { q: 'Is the app available in Arabic?', a: 'Yes. The whole app is available in English and Arabic, with a full right-to-left layout for Arabic.' },
    ],
    ctaText: DEMO,
  },

  {
    slug: 'exhibitors',
    name: 'Exhibitor portal & lead capture',
    menuName: 'Exhibitor portal & leads',
    subject: 'exhibitor leads',
    icon: 'lucide:store',
    menuText: 'Scan, rate and export leads',
    seo: {
      title: 'Exhibitor portal & lead capture | EXPOUSE',
      description: 'An exhibitor portal for profile, team and badges, plus badge scanning with lead rating, notes and custom questions, and leads exported to CSV or the CRM.',
    },
    hero: {
      title: 'Turn booth visits into qualified leads',
      text: 'Exhibitors manage their profile and team, scan visitor badges, rate and note each lead, and export everything after the show.',
      highlights: ['Badge scanning', 'Lead rating & notes', 'Team management'],
      url: 'app.expouse.com/exhibitor/leads',
      image: img('exhibitors', 'hero', 'The exhibitor portal: a booth\'s leads with their scores, the rep who scanned them and the day\'s totals'),
    },
    rows: [
      {
        id: 'portal',
        eyebrow: 'Exhibitor portal',
        title: 'Exhibitors set up their own presence',
        text: 'Each exhibitor edits their profile, uploads documents, adds team members and orders badges, without emailing your team.',
        points: ['Company profile, booth and products', 'Team members and badge requests', 'Documents and brochures'],
        image: img('exhibitors', 'portal', 'The exhibitor portal: Atlasco\'s company profile with booth and products, team members with their badge requests, and uploaded brochures'),
      },
      {
        id: 'lead-capture',
        eyebrow: 'Lead capture',
        title: 'Scan, rate and note in seconds',
        text: 'Booth staff scan a badge with their phone, rate the lead and add notes or answers to custom questions.',
        points: ['Hot, warm and cold rating', 'Custom qualification questions', 'Works offline at busy booths'],
        image: img('exhibitors', 'lead-capture', 'A lead just scanned in the scanner app, with qualifying answers, a note and a Hot rating'),
      },
      {
        id: 'follow-up',
        eyebrow: 'Follow-up',
        title: 'Leads ready for the sales team',
        text: 'Exhibitors see all leads in one list and export them to their CRM the same day.',
        points: ['Shared lead list for the team', 'Export to CSV or CRM', 'Booth visit and scan reports'],
        image: img('exhibitors', 'reports', 'The exhibitor\'s follow-up view: booth visits and scans by day, leads by score, and an export to CSV or straight to the CRM'),
      },
    ],
    faqs: [
      { q: 'Do exhibitors need special devices?', a: 'No. Booth staff use the EXPOUSE scanner app on their own phones.' },
      { q: 'Can several staff share one booth account?', a: 'Yes. Everyone on the booth team signs in with their own login under the same booth, so all their leads land in one shared list and each scan stays credited to whoever made it.' },
      { q: 'Can exhibitors add their own questions?', a: 'Yes. Each booth sets its own qualification questions, and staff answer them when they scan a badge, along with a hot, warm or cold rating.' },
      { q: 'How do exhibitors get their leads?', a: 'Leads appear straight away in the booth\'s shared list in the exhibitor portal. Exhibitors export them to CSV or send them to their CRM, the same day.' },
    ],
    ctaText: DEMO,
  },

  {
    slug: 'meetings',
    name: 'Meetings & matchmaking',
    subject: 'meetings & matchmaking',
    icon: 'lucide:calendar-days',
    menuText: 'Matchmaking and scheduling',
    seo: {
      title: 'Event matchmaking & meeting scheduling | EXPOUSE',
      description: 'Meeting suggestions from real interests, requests with a time slot and place, rescheduling, and fair meeting limits for every ticket and exhibitor package.',
    },
    hero: {
      title: 'Meetings that get booked, and actually happen',
      text: 'Attendees and exhibitors find the right people, request meetings and agree on a time and place. Meeting balances keep the schedule fair for everyone.',
      highlights: ['Smart suggestions', 'Meeting balances', 'Booth and lounge slots'],
      url: 'app.expouse.com/attendee/meetings',
      image: img('meetings', 'hero', 'The meetings dashboard: meetings booked per day, requests waiting and a schedule of today\'s meetings'),
    },
    rows: [
      {
        id: 'matchmaking',
        eyebrow: 'Matchmaking',
        title: 'Suggestions based on real interests',
        text: 'Profiles, interests and registration answers are used to suggest who each person should meet.',
        points: ['Suggestions by interest and role', 'Search and filters', 'Save people for later'],
        image: img('meetings', 'matchmaking', 'Suggested people to meet in the app, each with their role, a match percentage, shared interests and a save button'),
      },
      {
        id: 'scheduling',
        eyebrow: 'Scheduling',
        title: 'Request, accept and reschedule',
        text: 'Users pick a time slot and location. The other person accepts, declines or suggests a new time, and both calendars update.',
        points: ['Time slots by day', 'Booth, lounge or online meetings', 'Reminders before each meeting'],
        image: img('meetings', 'scheduling', 'A meeting request with a time slot and location, answered with accept, decline or suggest a new time, and the meeting added to both agendas'),
      },
      {
        id: 'balance',
        eyebrow: 'Meeting balance',
        title: 'Fair limits for every guest type',
        text: 'Set how many meetings each ticket or exhibitor package can request. Cancelled requests return to the balance automatically.',
        points: ['Limits per ticket or package', 'Balance shown before booking', 'Cancelled meetings are refunded'],
        image: img('meetings', 'balance', 'Meeting limits per ticket and exhibitor package, the attendee\'s remaining balance before booking, and a cancelled meeting returned to the balance'),
      },
    ],
    faqs: [
      { q: 'What is a meeting balance?', a: 'It is the number of meetings a person can request, set per ticket type or exhibitor package.' },
      { q: 'What happens if a meeting is cancelled?', a: 'It comes off both agendas and goes back to the person\'s balance automatically, so they can request another one.' },
      { q: 'Can meetings be online?', a: 'Yes. When they request a meeting, people choose a booth, the lounge or online. Online meetings happen in the app\'s video rooms.' },
      { q: 'Can organizers see meeting activity?', a: 'Yes. The meetings dashboard shows meetings booked per day, requests still waiting and how many were accepted, with a live schedule of today\'s meetings.' },
    ],
    ctaText: DEMO,
  },

  {
    slug: 'engagement',
    name: 'Live engagement',
    subject: 'live engagement',
    icon: 'lucide:message-circle',
    menuText: 'Chat, Q&A and polls',
    seo: {
      title: 'Session chat, live Q&A & polls | EXPOUSE',
      description: 'Chat, moderated Q&A and live polls inside every session, with upvoting, results on the stage screen and moderation built in.',
    },
    hero: {
      title: 'Make every session a conversation',
      text: 'Chat, Q&A and live polls inside every session, with moderation built in. Speakers see the best questions and results on screen.',
      highlights: ['Session chat', 'Moderated Q&A', 'Live polls'],
      url: 'app.expouse.com/session/live',
      image: img('engagement', 'hero', 'The engagement dashboard: a live poll\'s results, incoming questions and the event leaderboard'),
    },
    rows: [
      {
        id: 'qa',
        eyebrow: 'Q&A',
        title: 'The best questions rise to the top',
        text: 'Attendees ask and upvote questions. Moderators approve them, and speakers see the queue on their own screen.',
        points: ['Upvoting and sorting', 'Moderation before publishing', 'Anonymous questions if allowed'],
        image: img('engagement', 'qa', 'The session Q&A sorted by votes, a moderator approving a new question before it\'s published, and an anonymous question'),
      },
      {
        id: 'polls',
        eyebrow: 'Polls',
        title: 'Live polls with instant results',
        text: 'Launch single, multiple-choice or rating polls during a session and show results on the big screen.',
        points: ['Multiple poll types', 'Results on stage screens', 'Export results after the session'],
        image: img('engagement', 'polls', 'A poll\'s results on the stage screen, the poll type picker with single choice, multiple choice and rating, and an export of the results'),
      },
      {
        id: 'chat',
        eyebrow: 'Chat',
        title: 'Conversation that stays on topic',
        text: 'Each session has its own chat. Moderators can pin, hide or remove messages at any time.',
        points: ['Per-session chat rooms', 'Pin and hide messages', 'Profanity filtering'],
        image: img('engagement', 'chat', 'A session\'s chat with a pinned message, a moderator menu to pin, hide or remove a message, and a message held by the profanity filter'),
      },
    ],
    faqs: [
      { q: 'Can questions be moderated?', a: 'Yes. Moderators can approve questions before they appear to everyone.' },
      { q: 'Can poll results be shown on stage?', a: 'Yes. Results fill in on the stage screen as the votes come in, and you can export them after the session.' },
      { q: 'Can attendees ask anonymously?', a: 'Yes, if you allow it. Turn on anonymous questions for a session and attendees can ask without showing their name.' },
      { q: 'Do speakers need the app?', a: 'No. Speakers follow the approved questions, sorted by votes, on their own screen at the stage, without installing anything.' },
    ],
    ctaText: DEMO,
  },

  {
    slug: 'analytics',
    name: 'Analytics & reports',
    subject: 'analytics & reports',
    icon: 'lucide:chart-column',
    menuText: 'Live dashboards and reports',
    seo: {
      title: 'Event analytics & reports | EXPOUSE',
      description: 'Live dashboards for registrations, check-ins, sessions, exhibitors and meetings, filters by any guest type, and exhibitor and sponsor reports.',
    },
    hero: {
      title: 'Know what is happening at your event, as it happens',
      text: 'Live dashboards for registrations, check-ins, sessions, exhibitors and meetings. Filter by any guest type and share reports with your team and sponsors.',
      highlights: ['Live dashboards', 'Filters by guest type', 'Sponsor reports'],
      url: 'app.expouse.com/org/insights',
      image: img('analytics', 'hero', 'The analytics dashboard: registrations over time, check-ins today and the busiest gates'),
    },
    rows: [
      {
        id: 'live',
        eyebrow: 'Live overview',
        title: 'Your whole event on one screen',
        text: 'Registrations, check-ins and app activity update in real time, so you can act during the event, not after it.',
        points: ['Registrations and check-ins by day', 'Arrivals by gate and hour', 'App and session activity'],
        image: img('analytics', 'live', 'A live overview: registrations and check-ins by day, arrivals by gate and hour, and app and session activity'),
      },
      {
        id: 'filters',
        eyebrow: 'Deep filters',
        title: 'Answer any question about your audience',
        text: 'Filter by guest type, ticket, country, company or any registration answer, and compare days side by side.',
        points: ['Filter by any field', 'Compare days and events', 'Save views for your team'],
        image: img('analytics', 'filters', 'An audience report filtered by guest type, country and a registration answer, comparing two days side by side, with a saved view shared with the team'),
      },
      {
        id: 'reports',
        eyebrow: 'Reports',
        title: 'Reports ready for sponsors and exhibitors',
        text: 'Generate exhibitor and sponsor reports with leads, visits and engagement, and send them straight after the show.',
        points: ['Exhibitor and sponsor reports', 'Scheduled email reports', 'Export to PDF or CSV'],
        image: img('analytics', 'exhibitor-reports', 'An exhibitor report with leads, visits and engagement, an Exhibitor / Sponsor switch, a scheduled email of the reports, and export to PDF or CSV'),
      },
    ],
    faqs: [
      { q: 'Is the data really live?', a: 'Yes. Dashboards update in real time as people register, check in and use the app.' },
      { q: 'Can we share reports with sponsors?', a: 'Yes. Generate a report for each sponsor with their leads, visits and engagement, and email it straight after the show or on a schedule. Reports also export to PDF or CSV.' },
      { q: 'Can we compare with past events?', a: 'Yes. Put days or whole events side by side with the same filters, to see how this edition compares with the last one.' },
      { q: 'Who can see the data?', a: 'Only the people you choose. Each staff member gets view, edit or export rights page by page, and sponsors and exhibitors see only the reports you send them.' },
    ],
    ctaText: DEMO,
  },
]

export const findFeature = (slug: string) => FEATURE_PAGES.find(f => f.slug === slug)

/** "Explore other features": every page but this one, in menu order. */
export const otherFeatures = (page: FeaturePage) => FEATURE_PAGES.filter(f => f.slug !== page.slug)
