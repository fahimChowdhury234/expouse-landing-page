<script setup lang="ts">
/** One row of the /news list: date, category, title, excerpt and a thumbnail. */
import { listDate, type NewsPost } from '~/utils/news'

const props = defineProps<{
  post: NewsPost
}>()

const when = computed(() => listDate(props.post.date))
</script>

<template>
  <article class="row">
    <div class="when">
      <span class="day">{{ when.day }}</span>
      <span class="month">{{ when.month }}</span>
    </div>

    <div class="body">
      <span class="cat">{{ post.category }}</span>
      <h3 class="title">
        <NuxtLink :to="`/news/${post.slug}`" class="link">{{ post.title }}</NuxtLink>
      </h3>
      <p class="excerpt">{{ post.excerpt }}</p>
    </div>

    <img :src="post.image" alt="" class="thumb" width="146" height="100" loading="lazy">
  </article>
</template>

<style scoped>
.row {
  --row-brand: var(--color-brand, #6452e7);
  position: relative;
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) 146px;
  align-items: center;
  column-gap: 24px;
  padding: 25px 0;
  border-bottom: 1px solid var(--color-line, #e8e9ee);
}

.when {
  display: grid;
}

.day {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  color: var(--color-ink, #1f2430);
}

.month {
  font-size: 14px;
  font-weight:600;
  line-height: 1.4;
  color: var(--color-muted, #6b7280);
}

.body {
  min-width: 0;
}

.cat {
  display: block;
  margin-bottom: 7px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--row-brand);
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-ink, #1f2430);
  text-wrap: pretty;
}

/* The title's link covers the whole row, so the date and photo are clickable too. */
.link {
  color: inherit;
  text-decoration: none;
  transition: color .2s;
}

.link::after {
  content: "";
  position: absolute;
  inset: 0;
}

.row:hover .link {
  color: var(--row-brand);
}

.link:focus-visible {
  outline: none;
}

.link:focus-visible::after {
  outline: 2px solid var(--row-brand);
  outline-offset: 4px;
  border-radius: 8px;
}

.excerpt {
  margin: 6px 0 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--color-muted, #6b7280);
  text-wrap: pretty;
}

.thumb {
  display: block;
  width: 140px;
  height: 96px;
  object-fit: cover;
  border-radius: 10px; 
  box-shadow: 0 0 0 1px rgba(26, 26, 46, .08);
}

@media (max-width: 720px) {
  .row {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 12px;
  }

  .when {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .day {
    font-size: 22px;
  }

  .title {
    font-size: 20px;
  }

  .thumb {
    order: -1;
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
  }
}
</style>
