<script setup lang="ts">
/**
 * A photo-on-top /blog card: the category, headline and read time under it.
 *
 * - tall: fills two grid rows; the photo takes whatever height the text leaves.
 * - compact (default): a fixed-ratio photo, headline only.
 */
import type { BlogPost } from '~/utils/blog'

withDefaults(defineProps<{
  post: BlogPost
  tall?: boolean
  /** Heading level, so the card fits the page outline it sits in. */
  as?: 'h2' | 'h3'
}>(), {
  tall: false,
  as: 'h2',
})
</script>

<template>
  <NuxtLink :to="`/blog/${post.slug}`" class="card" :class="{ tall }">
    <span class="media">
      <img :src="post.image" alt="" class="img" width="551" height="452" loading="lazy">
    </span>

    <span class="body">
      <span class="cat">{{ post.category }}</span>
      <component :is="as" class="title">{{ post.title }}</component>
      <span v-if="tall" class="meta">{{ post.readMinutes }} min read</span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  background: #fff;
  border: 1px solid #ebe9f5;
  border-radius: 12px;
  transition: box-shadow .25s, transform .25s cubic-bezier(.22, .8, .24, 1);
}

.card:hover {
  box-shadow: 0 18px 36px -24px rgba(76, 61, 190, .45);
  transform: translateY(-2px);
}

.card:focus-visible {
  outline: 2px solid var(--color-brand, #6452e7);
  outline-offset: 2px;
}

.media {
  display: block;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #e9e8f3;
}

/* Tall: the photo grows to fill the two rows, with a sensible floor. */
.tall .media {
  flex: 1 1 auto;
  min-height: 220px;
  max-height: 254px;
  aspect-ratio: auto;
}

.img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.body {
  display: grid;
  gap: 10px;
  padding: 22px 22px 24px;
}

.tall .body {
  gap: 12px;
  padding:px;
}

.cat {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--color-brand, #6452e7);
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--color-ink, #1f2430);
  text-wrap: pretty;
  transition: color .2s;
}

.tall .title {
  font-size: 22px;
  line-height: 1.4;
}

.card:hover .title {
  color: var(--color-brand-dark, #4f46e5);
}

.meta {
  font-size: 14px;
  color: var(--color-muted, #6b7280);
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }

  .card:hover {
    transform: none;
  }
}
</style>
