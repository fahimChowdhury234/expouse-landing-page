/**
 * The product's letter avatars: what a person card shows when there is no photo.
 * Same graphics (public/img/letters/A–Z.svg, copied from eventos-event) and the
 * same rule as the event app's getUserAvatarByName (eventos-event/app/utils/avatar.ts):
 * the first Latin or Arabic letter of the name, Arabic transliterated to A–Z.
 */
const ARABIC_TO_LATIN: Record<string, string> = {
  'ا': 'A', 'أ': 'A', 'إ': 'E', 'آ': 'A', 'ٱ': 'A',
  'ب': 'B',
  'ت': 'T', 'ة': 'T',
  'ث': 'T',
  'ج': 'J',
  'ح': 'H',
  'خ': 'K',
  'د': 'D', 'ذ': 'D',
  'ر': 'R', 'ز': 'Z',
  'س': 'S', 'ش': 'X',
  'ص': 'S', 'ض': 'D',
  'ط': 'T', 'ظ': 'Z',
  'ع': 'A', 'غ': 'G',
  'ف': 'F', 'ق': 'Q',
  'ك': 'K', 'ل': 'L',
  'م': 'M', 'ن': 'N',
  'ه': 'H', 'و': 'W',
  'ي': 'Y', 'ى': 'Y',
  'ؤ': 'W', 'ئ': 'Y', 'ء': 'A',
}

/** `/img/letters/M.svg` for "Mariam" or "مريم"; null when the name has no usable letter. */
export function letterAvatar(name?: string | null): string | null {
  if (!name) return null
  for (const ch of name) {
    if (/[a-z]/i.test(ch)) return `/img/letters/${ch.toUpperCase()}.svg`
    const latin = ARABIC_TO_LATIN[ch]
    if (latin) return `/img/letters/${latin}.svg`
  }
  return null
}
