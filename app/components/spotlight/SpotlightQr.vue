<script setup lang="ts">
/**
 * A decorative QR code in the Figma style: round modules and rounded finder
 * squares. Seeded (utils/badges qrCells), so the server render and the browser match.
 */
import { QR_FINDERS, QR_SIZE, qrCells } from '~/utils/badges'

const props = defineProps<{ seed: number }>()
const cells = computed(() => qrCells(props.seed))
</script>

<template>
  <svg :viewBox="`0 0 ${QR_SIZE} ${QR_SIZE}`" class="qr-svg" aria-hidden="true">
    <circle v-for="([x, y], i) in cells" :key="i" :cx="x + .5" :cy="y + .5" r=".42" />
    <g v-for="([fx, fy], i) in QR_FINDERS" :key="`f${i}`">
      <rect :x="fx + .5" :y="fy + .5" width="6" height="6" rx="1.7" class="ring" />
      <rect :x="fx + 2" :y="fy + 2" width="3" height="3" rx=".9" />
    </g>
  </svg>
</template>

<style scoped>
.qr-svg { display: block; width: 100%; height: 100%; fill: #1a1a2e; }
.ring { fill: none; stroke: #1a1a2e; stroke-width: 1; }
</style>
