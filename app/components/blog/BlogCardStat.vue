<script setup lang="ts">
/** A /blog card for a research piece: one big number and a sentence on what it means. */
import type { BlogPost } from '~/utils/blog'

defineProps<{
  post: BlogPost
  value: string
  text: string
}>()
</script>

<template>
  <NuxtLink :to="`/blog/${post.slug}`" class="card" :aria-label="post.title">
    <i class="orb" aria-hidden="true" />

    <span class="cat">{{ post.category }}</span>
    <span class="value">{{ value }}</span>
    <span class="text">{{ text }}</span>
  </NuxtLink>
</template>

<style scoped>
.card {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 200px;
  padding: 24px 26px;
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  background: #f4f3fd;
  border: 1px solid #e7e4f8;
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

/* A soft circle off the bottom-right corner. */
.orb {
  position: absolute;
  right: -70px;
  bottom: -80px;
  z-index: -1;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgba(100, 82, 231, .06);
  pointer-events: none;
}

.cat {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-brand, #6452e7);
}

.value {
  margin-top: 8px;
  font-size: clamp(44px, 4vw, 48px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -.02em;
  color: var(--color-brand, #6452e7);
}

.text {
  margin-top: 10px;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.45;
  color: var(--color-ink, #1f2430);
  text-wrap: pretty;
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
