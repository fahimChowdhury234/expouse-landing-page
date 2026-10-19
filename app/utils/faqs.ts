/**
 * The homepage FAQ: rendered by FaqSection.vue and published as FAQPage
 * structured data by pages/index.vue - Google requires the structured data to
 * match the visible text, so both read this one list.
 *
 * Answers follow expouse-landing/index.html's FAQ. CONFIRM before launch: the
 * launch time (1), the hardware list (4) and which lists can be imported (5).
 */
export const FAQS = [
  {
    q: 'How quickly can we launch an event?',
    a: 'Most events with registration, badges and check-in go live within a few days. We help you import your attendee list, set up the badges and train your gate staff.',
  },
  {
    q: 'Can we use our own domain and branding?',
    a: 'Yes. Every event gets its own website, either on an expouse.com address or on your own domain, with your logo, colors and login page. Inside the EXPOUSE app, attendees see your branding too.',
  },
  {
    q: 'What if the venue internet goes down?',
    a: 'The scanner app keeps checking people in offline and sends every scan once the connection is back, so nothing is lost. Badge printing does need a connection, so give your kiosks and print desks a stable line.',
  },
  {
    q: 'Which printers and scanners are supported?',
    a: 'All you need is a badge printer and Google Chrome. A self-service kiosk is just a touch-screen PC with a USB QR scanner and a printer. Gates, tablets and other desks can send badges to a print station nearby.',
  },
  {
    q: 'Can we import our existing attendee list?',
    a: 'Yes. You can import attendees, exhibitors, speakers, sessions and guest lists from Excel or CSV.',
  },
]
