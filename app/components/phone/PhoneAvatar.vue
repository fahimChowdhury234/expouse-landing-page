<script setup lang="ts">
/**
 * A placeholder profile photo: a head-and-shoulders silhouette on a soft
 * colour. Size it from the parent (width and height); `round` for avatars,
 * square corners for profile cards.
 */
const props = withDefaults(defineProps<{
  /** Colour scheme, 0 to 3. */
  tone?: number
  round?: boolean
}>(), { tone: 0, round: false })

const TONES = [
  { bg: 'linear-gradient(160deg, #e0e7ff, #c7d2fe)', fg: '#818cf8' },
  { bg: 'linear-gradient(160deg, #fce7f3, #fbcfe8)', fg: '#f472b6' },
  { bg: 'linear-gradient(160deg, #d1fae5, #a7f3d0)', fg: '#34d399' },
  { bg: 'linear-gradient(160deg, #fef3c7, #fde68a)', fg: '#f59e0b' },
]
const t = computed(() => TONES[props.tone % TONES.length]!)
</script>

<template>
  <span class="av" :class="{ round }" :style="{ background: t.bg, color: t.fg }" aria-hidden="true">
    <svg viewBox="0 0 40 40" preserveAspectRatio="xMidYMax slice">
      <circle cx="20" cy="16" r="7" fill="currentColor" />
      <path d="M5 42c1.6-9 7.6-14 15-14s13.4 5 15 14z" fill="currentColor" />
    </svg>
  </span>
</template>

<style scoped>
.av {
  display: block;
  overflow: hidden;
  border-radius: 8px;
}

.av.round {
  border-radius: 50%;
}

.av svg {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
