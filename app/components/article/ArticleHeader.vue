<script setup lang="ts">
/** Top of a /news/[slug] or /blog/[slug] article: breadcrumb, category and date, headline and lead. */
import { longDate, type NewsPost } from '~/utils/news'

withDefaults(defineProps<{
  post: Pick<NewsPost, 'date' | 'readMinutes' | 'title' | 'excerpt'> & { category: string }
  /** Where the breadcrumb's back link goes. */
  backTo?: string
  backLabel?: string
}>(), {
  backTo: '/news',
  backLabel: 'Newsroom',
})
</script>

<template>
  <header class="ah">
    <nav class="crumbs" aria-label="Breadcrumb">
      <NuxtLink :to="backTo" class="back">
        <Icon name="lucide:arrow-left" class="ico" />
        {{ backLabel }}
      </NuxtLink>
      <span class="sep" aria-hidden="true">/</span>
      <span class="here">{{ post.category }}</span>
    </nav>

    <div class="meta">
      <span class="cat">{{ post.category }}</span>
      <span class="when"><time :datetime="post.date">{{ longDate(post.date) }}</time> · {{ post.readMinutes }} min read</span>
    </div>

    <h1 class="title">{{ post.title }}</h1>
    <p class="lead">{{ post.excerpt }}</p>
  </header>
</template>

<style scoped>
.ah {
  --ah-brand: var(--color-brand, #6452e7);
}

.crumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 15px;
  line-height: 1.5;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--ah-brand);
  text-decoration: none;
}

.back .ico {
  width: 16px;
  height: 16px;
  transition: transform .25s cubic-bezier(.22, .8, .24, 1);
}

.back:hover .ico {
  transform: translateX(-3px);
}

.back:focus-visible {
  outline: 2px solid var(--ah-brand);
  outline-offset: 3px;
  border-radius: 4px;
}

.sep {
  color: #9aa1ad;
}

.here {
  color: var(--color-muted, #6b7280);
}

.meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.cat {
  padding: 5px 10px;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  color: #fff;
  background: var(--ah-brand);
  border-radius: 5px;
}

.when {
  font-size: 15px;
  color: var(--color-muted, #6b7280);
}

.title {
  max-width: 760px;
  margin: 18px 0 0;
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -.02em;
  color: var(--color-ink, #1f2430);
}

.lead {
  max-width: 760px;
  margin: 18px 0 0;
  font-size: clamp(17px, 2vw, 20px);
  line-height: 1.6;
  color: var(--color-muted, #6b7280);
}

@media (prefers-reduced-motion: reduce) {
  .back .ico {
    transition: none;
  }
}
</style>
