<script setup lang="ts">
/**
 * /news: the Newsroom (Figma: News from EXPOUSE).
 *
 * The lead story (NewsFeatured) sits above a filterable list (NewsFilters +
 * NewsListItem) with a sidebar for the email signup and press contact
 * (NewsSidebar). Posts and categories live in utils/news.ts.
 */
import { FEATURED_POST, NEWS_CATEGORIES, NEWS_POSTS, type NewsCategory } from '~/utils/news'

useSeoMeta({
  title: 'Newsroom | EXPOUSE',
  ogTitle: 'Newsroom | EXPOUSE',
  description: 'Product releases, partnerships and announcements from the EXPOUSE team.',
  ogDescription: 'Product releases, partnerships and announcements from the EXPOUSE team.',
})

const active = ref<NewsCategory | 'All'>('All')

const posts = computed(() => active.value === 'All' ? NEWS_POSTS : NEWS_POSTS.filter(p => p.category === active.value))
</script>

<template>
  <div class="news">
    <header class="hero">
      <div class="rail">
        <p class="eyebrow">Newsroom</p>
        <h1 class="h1">News from EXPOUSE</h1>
        <p class="sub">Product releases, partnerships and announcements from the team.</p>

        <NewsFeatured :post="FEATURED_POST" class="hero-feat" />
      </div>
    </header>

    <section class="body" aria-label="All news">
      <div class="rail layout">
        <div class="main">
          <NewsFilters v-model="active" :categories="NEWS_CATEGORIES" />

          <p v-if="!posts.length" class="empty">No stories in this category yet.</p>
          <div v-else class="list">
            <NewsListItem v-for="p in posts" :key="p.slug" :post="p" />
          </div>
        </div>

        <aside aria-label="Subscribe and media contact">
          <NewsSidebar />
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.news {
  background: #fff;
}

.rail {
  max-width: 1240px;
  margin-inline: auto;
  padding-inline: clamp(16px, 3vw, 40px);
}

/* ---------- Hero ---------- */
.hero {
  padding-top: clamp(28px, 4vw, 44px);
}

.eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--color-brand, #6452e7);
}

.h1 {
  margin: 8px 0 0;
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 800;
  line-height: 1.1;
  color: var(--color-ink, #1f2430);
}

.sub {
  margin: 10px 0 0;
  max-width: 60ch;
  font-size: 18px;
  line-height: 1.6;
  color: var(--color-muted, #6b7280);
}

.hero-feat {
  margin-top: clamp(28px, 4vw, 38px);
}

/* ---------- Body ---------- */
.body {
  padding-block: clamp(40px, 6vw, 50px) clamp(56px, 7vw, 75px);
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  align-items: start;
  gap: 40px;
}

.main {
  min-width: 0;
}

.empty {
  padding: 32px 0;
  font-size: 15px;
  color: var(--color-muted, #6b7280);
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
