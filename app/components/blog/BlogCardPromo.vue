<script setup lang="ts">
/** A brand-purple /blog card for a guide: category, headline and a call to action, no photo. */
import type { BlogPost } from '~/utils/blog'

defineProps<{
  post: BlogPost
  cta: string
}>()
</script>

<template>
  <NuxtLink :to="`/blog/${post.slug}`" class="card">
    <i class="orb" aria-hidden="true" />

    <span class="cat">{{ post.category }}</span>
    <h2 class="title">{{ post.title }}</h2>
    <span class="cta">
      {{ cta }}
      <Icon name="lucide:arrow-right" class="ico" />
    </span>
  </NuxtLink>
</template>

<style scoped>
.card {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 10px;
  min-height: 200px;
  padding: 24px;
  overflow: hidden;
  color: #fff;
  text-decoration: none;
  background: linear-gradient(135deg, #7564EC 14.64%, #6452E7 46.46%, #4E3DD8 85.36%);
  border-radius: 12px;
  transition: box-shadow .25s, transform .25s cubic-bezier(.22, .8, .24, 1);
}

.card:hover {
  box-shadow: 0 18px 36px -20px rgba(76, 61, 190, .7);
  transform: translateY(-2px);
}

.card:focus-visible {
  outline: 2px solid var(--color-brand, #6452e7);
  outline-offset: 3px;
}

/* A soft circle off the top-right corner. (Not ".ring" - that's a Tailwind utility.) */
.orb {
  position: absolute;
  right: -90px;
  top: -70px;
  z-index: -1;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .07);
  pointer-events: none;
}

.cat {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, .85);
}

.title {
  margin: 0;
  font-size: clamp(20px, 1.7vw, 22px);
  font-weight: 800;
  line-height: 1.25;
  text-wrap: balance;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  font-size: 15px;
  font-weight: 700;
}

.cta .ico {
  width: 16px;
  height: 16px;
  transition: transform .25s cubic-bezier(.22, .8, .24, 1);
}

.card:hover .cta .ico {
  transform: translateX(4px);
}

@media (prefers-reduced-motion: reduce) {
  .card,
  .cta .ico {
    transition: none;
  }

  .card:hover,
  .card:hover .cta .ico {
    transform: none;
  }
}
</style>
