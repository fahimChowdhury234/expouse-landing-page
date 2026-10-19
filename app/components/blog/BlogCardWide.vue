<script setup lang="ts">
/** A two-column /blog card: the photo on one side, category, headline, excerpt and read time on the other. */
import type { BlogPost } from '~/utils/blog'

defineProps<{
  post: BlogPost
}>()
</script>

<template>
  <NuxtLink :to="`/blog/${post.slug}`" class="card">
    <span class="media">
      <img :src="post.image" alt="" class="img" width="551" height="452" loading="lazy">
    </span>

    <span class="body">
      <span class="cat">{{ post.category }}</span>
      <h2 class="title">{{ post.title }}</h2>
      <span class="excerpt">{{ post.excerpt }}</span>
      <span class="meta">{{ post.readMinutes }} min read</span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
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

/* The photo is absolutely placed so it always fills the row, however tall the text gets. */
.media {
  position: relative;
  min-height: 260px;
  background: #e9e8f3;
}

.img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 24px;
}

.cat {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--color-brand, #6452e7);
}

.title {
  margin: 0;
  font-size: clamp(22px, 2vw, 22px);
  font-weight: 700;
  line-height: 1.35;
  color: var(--color-ink, #1f2430);
  text-wrap: pretty;
  transition: color .2s;
}

.card:hover .title {
  color: var(--color-brand-dark, #4f46e5);
}

.excerpt {
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-muted, #6b7280);
  text-wrap: pretty;
}

.meta {
  margin-top: 4px;
  font-size: 14px;
  color: var(--color-muted, #6b7280);
}

@media (max-width: 640px) {
  .card {
    grid-template-columns: minmax(0, 1fr);
  }

  .media {
    min-height: 0;
    aspect-ratio: 16 / 9;
  }
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
