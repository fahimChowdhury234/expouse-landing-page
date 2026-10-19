<script setup lang="ts">
/** The author (initials avatar, name, role) and share buttons, between two rules. */
import { initials, type NewsPost } from '~/utils/news'

defineProps<{
  author: NewsPost['author']
  url: string
  title: string
}>()
</script>

<template>
  <div class="byline">
    <div class="author">
      <span class="avatar" aria-hidden="true">{{ initials(author.name) }}</span>
      <span class="who">
        <b class="name">{{ author.name }}</b>
        <span class="role">{{ author.role }}</span>
      </span>
    </div>

    <ArticleShare :url="url" :title="title" />
  </div>
</template>

<style scoped>
.byline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px 24px;
  padding: 22px 0;
  border-block: 1px solid var(--color-line, #e8e9ee);
}

.author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 45px;
  height: 45px;
  flex: none;
  display: grid;
  place-items: center;
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  background: var(--color-brand, #6452e7);
  border-radius: 50%;
}

.who {
  display: grid;
  gap: 8px;
  line-height: 1.45;
}

.name {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-ink, #1f2430);
}

.role {
  font-size: 15px;
  color: var(--color-muted, #6b7280);
}
</style>
