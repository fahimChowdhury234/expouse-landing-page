<script setup lang="ts">
/** "Keep reading": three article cards on a tinted band, under a /blog article. */
import type { BlogPost } from '~/utils/blog'

defineProps<{
  posts: BlogPost[]
}>()
</script>

<template>
  <section class="more" aria-labelledby="more-title">
    <div class="rail">
      <div class="head">
        <h2 id="more-title" class="title">More from the newsroom</h2>
        <NuxtLink to="/blog" class="all">All articles</NuxtLink>
      </div>

      <div class="grid">
        <BlogCard v-for="p in posts" :key="p.slug" :post="p" as="h3" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.more {
  padding-block: clamp(48px, 6vw, 72px);
  background: #6452E712;
  border-top: 1px solid #e8e6f3;
  margin-bottom: 80px;
}

.rail {
  max-width: 1240px;
  margin-inline: auto;
  padding-inline: clamp(16px, 3vw, 40px);
}

.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.title {
  margin: 0;
  font-size: clamp(26px, 3.4vw, 34px);
  font-weight: 800;
  line-height: 1.2;
  color: var(--color-ink, #1f2430);
}

.all {
  flex: none;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-brand, #6452e7);
  text-decoration: none;
}

.all:hover {
  text-decoration: underline;
}

.all:focus-visible {
  outline: 2px solid var(--color-brand, #6452e7);
  outline-offset: 3px;
  border-radius: 4px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 32px;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
