<script setup lang="ts">
/** A story card for "More from the newsroom": photo, category and date, title. */
import { longDate, type NewsPost } from '~/utils/news'

defineProps<{
  post: NewsPost
}>()
</script>

<template>
  <NuxtLink :to="`/news/${post.slug}`" class="card">
    <img :src="post.image" alt="" class="img" width="374" height="175" loading="lazy">
    <span class="body">
      <span class="meta">{{ post.category }} · {{ longDate(post.date) }}</span>
      <span class="title">{{ post.title }}</span>
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
  border-radius: 10px;
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

.img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 15 / 7;
  object-fit: cover;
}

.body {
  display: grid;
  gap: 8px;
  padding: 20px 18px 18px;
}

.meta {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-brand, #6452e7);
}

.title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-ink, #1f2430);
  text-wrap: pretty;
}

.card:hover .title {
  color: var(--color-brand-dark, #4f46e5);
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
