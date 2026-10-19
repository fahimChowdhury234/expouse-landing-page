/**
 * Sample leads for the scanner app demo (MobileApps.vue → phone/ScannerScreen.vue).
 * Every person and company here is fictional sample data.
 */
export type LeadRating = 'Hot' | 'Warm' | 'Cold'

export interface ScanLead {
  name: string
  company: string
  rating: LeadRating
  /** PhoneAvatar colour scheme. */
  tone: number
  /** Answers to SCAN_QUESTIONS, in order. */
  answers: string[]
}

/** The booth's qualifying questions; the first is required. */
export const SCAN_QUESTIONS = [
  'What is your company segment?',
  'How big is the company?',
  'Do you have an existing vendor?',
  'What was the agreed next step?',
]

/** Scanned in turn by the demo, round and round; the first is the lead on screen before any scan. */
export const SCAN_LEADS: ScanLead[] = [
  { name: 'Omar Saleh', company: 'Northwind Group', rating: 'Hot', tone: 0, answers: ['$10K – $50K', 'Enterprise', 'Yes', 'Demo booked'] },
  { name: 'Sara Ali', company: 'Fleetly', rating: 'Warm', tone: 1, answers: ['$5K – $10K', 'Mid-size', 'No', 'Send a proposal'] },
  { name: 'Daniel Carter', company: 'Crestline Homes', rating: 'Hot', tone: 2, answers: ['$50K +', 'Enterprise', 'Yes', 'Meeting next week'] },
  { name: 'Nadia Rahman', company: 'Meridian Studio', rating: 'Cold', tone: 3, answers: ['Under $5K', 'Small', 'No', 'Add to newsletter'] },
]

/** Recent scans on the home screen before the demo scans anyone. */
export const INITIAL_RECENT: ScanLead[] = [
  { name: 'Emily Clarke', company: 'Vertex Solutions', rating: 'Warm', tone: 2, answers: [] },
  { name: 'James Park', company: 'Halcyon Institute', rating: 'Cold', tone: 1, answers: [] },
]
