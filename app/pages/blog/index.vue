<script setup lang="ts">
/**
 * /blog: guides, playbooks and customer stories (Figma: Blog).
 *
 * A header with the search box, category tabs (NewsFilters), then the bento
 * grid of cards (BlogGrid) - each post picks its own card style in
 * utils/blog.ts. The tab and search combine; both narrow the same grid.
 */
import { BLOG_CATEGORIES, filterBlogPosts, type BlogCategory } from '~/utils/blog'

useSeoMeta({
  title: 'Blog | EXPOUSE',
  ogTitle: 'Blog | EXPOUSE',
  description: 'Guides, playbooks and lessons from event organizers across the region.',
  ogDescription: 'Guides, playbooks and lessons from event organizers across the region.',
})

const active = ref<BlogCategory | 'All'>('All')
const query = ref('')

const posts = computed(() => filterBlogPosts(active.value, query.value))

function reset() {
  active.value = 'All'
  query.value = ''
}
</script>

<template>
  <div class="blog">
    <div class="rail">
      <header class="hero">
        <div class="intro">
          <p class="eyebrow">Blog</p>
          <h1 class="h1">Ideas for running better events</h1>
          <p class="sub">Guides, playbooks and lessons from organizers across the region.</p>
        </div>

        <BlogSearch v-model="query" class="search" />
      </header>

      <NewsFilters v-model="active" :categories="BLOG_CATEGORIES" label="Filter articles by topic" class="filters" />

      <section class="results" aria-label="Articles">
        <div v-if="!posts.length" class="empty" role="status">
          <p class="empty-title">No articles found</p>
          <p class="empty-text">
            Nothing matches<template v-if="query.trim()"> “{{ query.trim() }}”</template><template v-if="active !== 'All'"> in {{ active }}</template>.
          </p>
          <button type="button" class="empty-reset" @click="reset">Show all articles</button>
        </div>
        <BlogGrid v-else :posts="posts" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.blog {
  padding-block: clamp(28px, 4vw, 44px) clamp(56px, 7vw, 88px);
  background: #fff;
}

.rail {
  max-width: 1240px;
  margin-inline: auto;
  padding-inline: clamp(16px, 3vw, 40px);
}

/* ---------- Header ---------- */
.hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px 48px;
}

.intro {
  min-width: 0;
}

.eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--color-brand, #6452e7);
}

.h1 {
  max-width: 13em;
  margin: 8px 0 0;
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.01em;
  color: var(--color-ink, #1f2430);
}

.sub {
  margin: 14px 0 0;
  max-width: 60ch;
  font-size: 18px;
  line-height: 1.6;
  color: var(--color-muted, #6b7280);
}

.search {
  flex: 0 1 340px;
}

.filters {
  margin-top: clamp(24px, 3vw, 32px);
}

/* ---------- Grid ---------- */
.results {
  margin-top: 32px;
}

.empty {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 64px 16px;
  text-align: center;
  background: #f9f9fc;
  border: 1px dashed #e3e1f1;
  border-radius: 12px;
}

.empty-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-ink, #1f2430);
}

.empty-text {
  margin: 0;
  font-size: 16px;
  color: var(--color-muted, #6b7280);
}

.empty-reset {
  margin-top: 10px;
  height: 42px;
  padding: 0 18px;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: var(--color-brand, #6452e7);
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color .2s;
}

.empty-reset:hover {
  background: var(--color-brand-dark, #4f46e5);
}

.empty-reset:focus-visible {
  outline: 2px solid var(--color-brand, #6452e7);
  outline-offset: 2px;
}

@media (max-width: 860px) {
  .hero {
    flex-direction: column;
    align-items: stretch;
  }

  .search {
    flex: none;
  }
}
</style>
