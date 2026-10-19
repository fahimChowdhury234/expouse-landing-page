/**
 * Sample events for the landing page's phone screens (components/phone) and the
 * branded-app preview (BrandedApp.vue). Every event here is fictional sample data;
 * the first one is the page's running example, in the site's own brand colour.
 */

export interface SampleEvent {
  /** Full event name, as the app's home screen shows it. */
  name: string
  /** Short name under the app icon and on the splash screen. */
  app: string
  /** Letter on the event's logo tile and app icon. */
  initial: string
  /** The event's brand colour. */
  color: string
  /** Colour name, for the brand picker. */
  colorName: string
  dates: string
  place: string
  /** Home banner: a small line above the headline. */
  kicker: string
  headline: string
  about: string
}

export const SAMPLE_EVENTS: SampleEvent[] = [
  {
    name: 'Event name',
    app: 'Gulf Build',
    initial: 'E',
    color: '#6452E7 ',
    colorName: 'Indigo',
    dates: '5 – 7 Oct 2026 · 10:00 AM – 6:00 PM',
    place: 'Oman Convention & Exhibition Centre, Muscat',
    kicker: '5 – 7 OCT · MUSCAT',
    headline: 'Build the future of Gulf homes',
    about: 'The Gulf\'s biggest home and building show: three days of exhibitors, talks and meetings for everyone who designs, builds and furnishes homes in the region.',
  },
  {
    name: 'Gulf Logistics Expo 2026',
    app: 'Logistics Expo',
    initial: 'L',
    color: '#0f766e',
    colorName: 'Teal',
    dates: '12 – 14 Nov 2026 · 9:00 AM – 5:00 PM',
    place: 'Dubai World Trade Centre, Dubai',
    kicker: '12 – 14 NOV · DUBAI',
    headline: 'Move the region forward',
    about: 'Ports, freight and supply-chain technology: three days with the region\'s carriers, forwarders and buyers in one hall.',
  },
  {
    name: 'Muscat Build Week 2026',
    app: 'Build Week',
    initial: 'M',
    color: '#be123c',
    colorName: 'Crimson',
    dates: '1 – 3 Dec 2026 · 10:00 AM – 7:00 PM',
    place: 'Al Bustan Hall, Muscat',
    kicker: '1 – 3 DEC · MUSCAT',
    headline: 'Design, build and renovate',
    about: 'A week of talks, showcases and site tours for architects, contractors and homeowners, with the city\'s best builders on the floor.',
  },
  {
    name: 'Oman Food Festival 2027',
    app: 'Food Fest',
    initial: 'F',
    color: '#c2410c',
    colorName: 'Orange',
    dates: '20 – 22 Jan 2027 · 4:00 PM – 11:00 PM',
    place: 'Muscat Waterfront, Muscat',
    kicker: '20 – 22 JAN · MUSCAT',
    headline: 'Taste the best of Oman',
    about: 'Chefs, food trucks and live cooking stages: three evenings of the country\'s favourite flavours, from street food to fine dining.',
  },
]
