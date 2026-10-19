<script setup lang="ts">
/**
 * An event's photo mosaic: tiles of 2 × 2 (lg), 2 × 1 (wide) and 1 × 1 (sm) on
 * a four-column grid, sized by the event's layout (utils/gallery.ts MOSAICS).
 *
 * Rows are sized from the column width (container query units), so every
 * tile keeps the design's proportions at any width. `dense` flow places the
 * tiles in listed order into the design's patterns. Two columns below 640px.
 * Clicking a photo emits `open` with its index, for the lightbox.
 */
import { MOSAICS, type GalleryPhoto, type MosaicLayout } from '~/utils/gallery'

const props = defineProps<{
  photos: GalleryPhoto[]
  layout: MosaicLayout
  /** For the buttons' labels: "View photo 3 of Gulf Home & Build Expo". */
  label: string
}>()

defineEmits<{
  open: [index: number, opener: HTMLElement]
}>()

const tiles = computed(() => props.photos.slice(0, MOSAICS[props.layout].length).map((p, i) => ({ ...p, size: MOSAICS[props.layout][i]! })))
</script>

<template>
  <div class="wrap">
    <ul class="mosaic">
      <li v-for="(t, i) in tiles" :key="i" class="tile" :class="t.size">
        <button
          type="button"
          class="shot"
          :aria-label="`View photo ${i + 1} of ${label}: ${t.alt}`"
          @click="$emit('open', i, $event.currentTarget as HTMLElement)"
        >
          <img :src="t.src" alt="" class="img" loading="lazy" decoding="async">
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* The container the row height is measured against. */
.wrap {
  container-type: inline-size;
}

.mosaic {
  --gap: 14px;
  /* Small tiles are 1.37 : 1, as in the design. */
  --row: calc((100cqi - 3 * var(--gap)) / 4 / 1.37);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: var(--row);
  grid-auto-flow: dense;
  gap: var(--gap);
  margin: 0;
  padding: 0;
  list-style: none;
}

.tile {
  position: relative;
  min-width: 0;
  overflow: hidden;
  background: #e9e8f3;
  border-radius: 10px;
}

.lg {
  grid-column: span 2;
  grid-row: span 2;
}

.wide {
  grid-column: span 2;
}

.shot {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  padding: 0;
  background: none;
  border: 0;
  cursor: zoom-in;
}

.img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .9s cubic-bezier(.22, .8, .24, 1);
}

.tile:hover .img {
  transform: scale(1.04);
}

/* A hairline inside the rounded corners keeps light photos off the white page. */
.tile::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(26, 26, 46, .08);
  pointer-events: none;
}

.shot:focus-visible {
  outline: 3px solid var(--color-brand, #6452e7);
  outline-offset: -3px;
  border-radius: 10px;
}

@media (max-width: 640px) {
  .mosaic {
    --gap: 10px;
    --row: calc((100cqi - var(--gap)) / 2 / 1.37);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .img {
    transition: none;
  }

  .tile:hover .img {
    transform: none;
  }
}
</style>
