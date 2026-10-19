<script setup lang="ts">
/**
 * /gallery: photos from events run on EXPOUSE (Figma: Media gallery).
 *
 * A brand banner with headline numbers (GalleryHero), a year switch with the
 * event count (GalleryYearTabs), then one section per event: its details and
 * a photo mosaic (GalleryEvent). Clicking a photo opens that event's photos in
 * one shared lightbox (GalleryLightbox). Events live in utils/gallery.ts.
 */
import { dateRange, eventYear, GALLERY_EVENTS, GALLERY_STATS, GALLERY_YEARS, type GalleryEvent } from '~/utils/gallery'

useSeoMeta({
  title: 'Media gallery | EXPOUSE',
  ogTitle: 'Media gallery | EXPOUSE',
  description: 'Photos from the expos, conferences and summits run on EXPOUSE, sorted by event.',
  ogDescription: 'Photos from the expos, conferences and summits run on EXPOUSE, sorted by event.',
})

const year = ref<number | 'All'>('All')

const events = computed(() => year.value === 'All' ? GALLERY_EVENTS : GALLERY_EVENTS.filter(e => eventYear(e) === year.value))

/* ---------- Lightbox: one for the page, showing whichever event was clicked ---------- */
const lightbox = ref<{ show: (i: number, from?: HTMLElement) => void } | null>(null)
const viewing = ref<GalleryEvent>(GALLERY_EVENTS[0]!)

async function open(event: GalleryEvent, i: number, from: HTMLElement) {
  viewing.value = event
  await nextTick()
  lightbox.value?.show(i, from)
}
</script>

<template>
  <div class="gallery">
    <GalleryHero :stats="GALLERY_STATS" />

    <div class="rail">
      <div class="bar">
        <GalleryYearTabs v-model="year" :years="GALLERY_YEARS" />
        <p class="total" aria-live="polite">{{ events.length }} {{ events.length === 1 ? 'event' : 'events' }}</p>
      </div>

      <div class="events">
        <GalleryEvent v-for="e in events" :key="e.slug" :event="e" @open="(i, el) => open(e, i, el)" />
      </div>
    </div>

    <GalleryLightbox
      ref="lightbox"
      :photos="viewing.photos"
      :title="viewing.name"
      :meta="`${viewing.city}, ${viewing.country} · ${dateRange(viewing.start, viewing.end)}`"
    />
  </div>
</template>

<style scoped>
.gallery {
  padding-bottom: clamp(56px, 7vw, 96px);
  background: #fff;
}

.rail {
  max-width: 1240px;
  margin-inline: auto;
  padding-inline: clamp(16px, 3vw, 40px);
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px 24px;
  padding-block: clamp(28px, 3.5vw, 40px) 22px;
  border-bottom: 1px solid var(--color-line, #e8e9ee);
}

.total {
  margin: 0;
  font-size: 16px;
  color: var(--color-muted, #6b7280);
}

.events {
  display: grid;
  gap: clamp(48px, 6vw, 72px);
  margin-top: clamp(32px, 4vw, 44px);
}
</style>
