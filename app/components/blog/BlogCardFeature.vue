<script setup lang="ts">
/** The lead /blog card: a full-bleed photo with the category, headline, author and read time over it. */
import type { BlogPost } from '~/utils/blog'

defineProps<{
  post: BlogPost
}>()
</script>

<template>
  <NuxtLink :to="`/blog/${post.slug}`" class="card">
    <img :src="post.image" alt="" class="img" width="551" height="452" fetchpriority="high">
    <span class="shade" aria-hidden="true" />

    <span class="body">
      <span class="cat">{{ post.category }}</span>
      <h2 class="title">{{ post.title }}</h2>
      <span class="meta">{{ post.author.name }} · {{ post.readMinutes }} min read</span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.card {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: flex-end;
  min-height: 460px;
  overflow: hidden;
  color: #fff;
  text-decoration: none;
  background: #1f2430;
  border-radius: 12px;
}

.img {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .6s cubic-bezier(.22, .8, .24, 1);
}

.card:hover .img {
  transform: scale(1.03);
}

/* Navy fade from the bottom: keeps the white headline readable on any photo. */
.shade {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(180deg, rgba(33, 37, 41, 0) 30%, rgba(33, 37, 41, 0.85) 100%);
}

.body {
  display: grid;
  justify-items: start;
  gap: 10px;
  padding: clamp(24px, 3vw, 28px);
}

.cat {
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 700;
  line-height: 22px;
  color: #fff;
  background: var(--color-brand, #6452e7);
  border-radius: 6px;
}

.title {
  max-width: 19em;
  margin: 0;
  font-size: clamp(26px, 2.6vw, 30px);
  font-weight: 800;
  line-height: 1.25;
  text-wrap: balance;
}

.meta {
  font-size: 15px;
  color: rgba(255, 255, 255, .82);
}

.card:focus-visible {
  outline: 2px solid var(--color-brand, #6452e7);
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .card {
    min-height: 400px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .img {
    transition: none;
  }

  .card:hover .img {
    transform: none;
  }
}
</style>
