/**
 * The demo request form (pages/contact-us.vue): its fields, choices and how a
 * request is sent.
 *
 * A request goes to NUXT_PUBLIC_CONTACT_ENDPOINT as JSON when that is set (a
 * CRM / form service / API route that answers 2xx). Without one, the site is
 * static, so the visitor's email app opens with the request written out to
 * the contact address instead (as expouse-landing/index.html's form did) - no
 * request is ever lost silently.
 */

export interface DemoRequest {
  email: string
  firstName: string
  lastName: string
  company: string
  location: string
  orgType: string
  attendees: string
  eventType: string
  heardFrom: string
  details: string
  /** The plan they came from on the pricing section, if any (?plan=). */
  plan?: string
}

export type DemoField = Exclude<keyof DemoRequest, 'plan'>

export const LOCATIONS = [
  'Oman',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Egypt',
  'Jordan',
  'Other Middle East & Africa',
  'Europe',
  'Asia Pacific',
  'Americas',
]

export const ORG_TYPES = [
  'Event organizer or agency',
  'Exhibition centre or venue',
  'Association or non-profit',
  'Corporate',
  'Government',
  'Education',
  'Other',
]

export const ATTENDEE_RANGES = [
  'Under 500',
  '500 – 2,000',
  '2,000 – 10,000',
  '10,000 – 50,000',
  'More than 50,000',
]

export const EVENT_TYPES = [
  'Exhibition or trade show',
  'Conference or summit',
  'Corporate event',
  'Festival or public event',
  'Hybrid or virtual event',
  'Several events a year',
  'Other',
]

/** Plans from the pricing section, by their ?plan= key. */
export const PLAN_NAMES: Record<string, string> = {
  event: 'Event',
  organizer: 'Organizer',
  enterprise: 'Enterprise',
}

export const REQUIRED: DemoField[] = ['email', 'firstName', 'lastName', 'company', 'location', 'orgType', 'attendees', 'eventType', 'heardFrom']

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** One message per field that needs fixing (empty when the form is good to send). */
export function validateDemo(r: DemoRequest): Partial<Record<DemoField, string>> {
  const errors: Partial<Record<DemoField, string>> = {}
  for (const f of REQUIRED) {
    if (!r[f].trim()) errors[f] = 'This field is required.'
  }
  if (r.email.trim() && !EMAIL.test(r.email.trim())) errors.email = 'Enter a valid email, like you@company.com.'
  return errors
}

/** The request as an email, for the mailto fallback. */
export function demoMailto(to: string, r: DemoRequest) {
  const lines = [
    'Hi EXPOUSE team,',
    '',
    'I\'d like to book a demo.',
    '',
    `Name: ${r.firstName} ${r.lastName}`.trim(),
    `Business email: ${r.email}`,
    `Company: ${r.company}`,
    `Location: ${r.location}`,
    `Organization type: ${r.orgType}`,
    `Expected attendees: ${r.attendees}`,
    `Event type: ${r.eventType}`,
    ...(r.plan ? [`Interested in: ${r.plan} plan`] : []),
    `How we heard about you: ${r.heardFrom}`,
    '',
    r.details ? `About our event:\n${r.details}` : '',
  ]
  const subject = `EXPOUSE demo request - ${r.company || `${r.firstName} ${r.lastName}`}`
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n').trim())}`
}
