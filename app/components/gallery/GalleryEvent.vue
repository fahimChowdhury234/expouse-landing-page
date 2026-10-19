<script setup lang="ts">
/** One event on /gallery: date badge, name, place, dates and visitors, photo count, then its mosaic. */
import { badgeDate, dateRange, type GalleryEvent } from '~/utils/gallery'

const props = defineProps<{
  event: GalleryEvent
}>()

defineEmits<{
  open: [index: number, opener: HTMLElement]
}>()

const badge = computed(() => badgeDate(props.event.start))
</script>

<template>
  <section class="ev" :aria-labelledby="`ev-${event.slug}`">
    <header class="head">
      <time class="badge" :datetime="event.start">
        <span class="month">{{ badge.month }}</span>
        <span class="year">{{ badge.year }}</span>
      </time>

      <div class="info">
        <h2 :id="`ev-${event.slug}`" class="name">{{ event.name }}</h2>
        <ul class="meta">
          <li><Icon name="lucide:map-pin" class="ico" />{{ event.city }}, {{ event.country }}</li>
          <li><Icon name="lucide:calendar" class="ico" />{{ dateRange(event.start, event.end) }}</li>
          <li><Icon name="lucide:users" class="ico" />{{ event.visitors.toLocaleString('en-US') }} visitors</li>
        </ul>
      </div>

      <span class="count">{{ event.photoCount }} photos</span>
    </header>

    <GalleryMosaic :photos="event.photos" :layout="event.layout" :label="event.name" @open="(i, el) => $emit('open', i, el)" />
  </section>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.badge {
  flex: none;
  display: grid;
  place-content: center;
  justify-items: center;
  width: 60px;
  height: 60px;
  color: #fff;
  background: var(--color-brand, #6452e7);
  border-radius: 10px;
}

.month {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: .06em;
}

.year {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.1;
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  margin: 0;
  font-size: clamp(20px, 2.2vw, 26px);
  font-weight: 800;
  line-height: 1.25;
  color: var(--color-ink, #1f2430);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 18px;
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
  font-size: 15px;
  color: var(--color-muted, #6b7280);
}

.meta li {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.meta .ico {
  flex: none;
  width: 16px;
  height: 16px;
  color: var(--color-brand, #6452e7);
}

.count {
  flex: none;
  align-self: flex-end;
  padding: 7px 14px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-brand, #6452e7);
  background: #f1effd;
  border-radius: 8px;
}

@media (max-width: 640px) {
  .head {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .info {
    flex-basis: calc(100% - 76px);
  }

  .count {
    align-self: auto;
    margin-left: 76px;
  }
}
</style>
