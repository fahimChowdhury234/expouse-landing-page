<script setup lang="ts">
/**
 * A sample "photo" (sky, sun and hills) used as the event logo image in the badge designer.
 * Plain SVG, so it works both in HTML (panel thumbnail, dragged copy) and nested inside the badge SVG.
 */
const props = withDefaults(defineProps<{
  /** Colour scheme: 0 = dusk (the one dragged onto the badge), 1 = day, 2 = night. */
  variant?: number
  /** Corner radius in the 40 × 40 viewBox. */
  radius?: number
}>(), { variant: 0, radius: 10 })

const uid = useId()
const SCHEMES = [
  { sky: ['#A5B4FC', '#FBCFE8'], sun: '#FDE047', back: '#818CF8', front: '#4338CA' },
  { sky: ['#7DD3FC', '#E0F2FE'], sun: '#FACC15', back: '#34D399', front: '#047857' },
  { sky: ['#1E1B4B', '#6D28D9'], sun: '#F5F3FF', back: '#7C3AED', front: '#2E1065' },
]
const c = computed(() => SCHEMES[props.variant % SCHEMES.length]!)
</script>

<template>
  <svg viewBox="0 0 40 40" aria-hidden="true">
    <defs>
      <clipPath :id="`${uid}-c`"><rect width="40" height="40" :rx="radius" /></clipPath>
      <linearGradient :id="`${uid}-sky`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="c.sky[0]" />
        <stop offset="1" :stop-color="c.sky[1]" />
      </linearGradient>
    </defs>
    <g :clip-path="`url(#${uid}-c)`">
      <rect width="40" height="40" :fill="`url(#${uid}-sky)`" />
      <circle cx="28" cy="13" r="5.5" :fill="c.sun" />
      <path d="M-2 31L11 17l8 8 7-6 16 13v10H-2z" :fill="c.back" />
      <path d="M-2 35c9-7 17-7 24-2s13 3 20-1v10H-2z" :fill="c.front" />
    </g>
  </svg>
</template>
