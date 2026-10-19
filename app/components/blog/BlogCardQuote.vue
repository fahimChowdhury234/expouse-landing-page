<script setup lang="ts">
/** A customer story on /blog: the customer's quote on a dark panel, with their initials, name and role. */
import type { BlogPost } from '~/utils/blog'
import { initials } from '~/utils/news'

defineProps<{
  post: BlogPost
  text: string
  name: string
  role: string
}>()
</script>

<template>
  <NuxtLink :to="`/blog/${post.slug}`" class="card" :aria-label="`${post.title} (${post.category})`">
    <svg class="mark" xmlns="http://www.w3.org/2000/svg" width="34" height="24" viewBox="0 0 34 24" fill="currentColor" aria-hidden="true">
      <path d="M0 24V13.4C0 5.9 4 1.4 12.1 0l1.5 3.4C9.4 4.6 7.4 7.2 7.2 11H13v13H0Zm20.4 0V13.4c0-7.5 4-12 12.1-13.4L34 3.4c-4.2 1.2-6.2 3.8-6.4 7.6h5.8v13h-13Z" />
    </svg>

    <blockquote class="quote">“{{ text }}”</blockquote>

    <span class="who">
      <span class="avatar" aria-hidden="true">{{ initials(name) }}</span>
      <span class="id">
        <b class="name">{{ name }}</b>
        <span class="role">{{ role }} · Customer story</span>
      </span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 26px;
  padding: clamp(28px, 3vw, 40px);
  color: #fff;
  text-decoration: none;
  background: #212529;
  border-radius: 12px;
  transition: box-shadow .25s, transform .25s cubic-bezier(.22, .8, .24, 1);
}

.card:hover {
  box-shadow: 0 18px 36px -20px rgba(17, 24, 52, .6);
  transform: translateY(-2px);
}

.card:focus-visible {
  outline: 2px solid var(--color-brand, #6452e7);
  outline-offset: 3px;
}

.mark {
  width: 32px;
  height: auto;
  color: #7c6cf0;
}

.quote {
  margin: 0;
  font-size: clamp(18px, 1.9vw, 22px);
  font-weight: 600;
  line-height: 1.55;
  text-wrap: pretty;
}

.who {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar {
  width: 44px;
  height: 44px;
  flex: none;
  display: grid;
  place-items: center;
  font-size: 15px;
  font-weight: 700;
  background: var(--color-brand, #6452e7);
  border-radius: 50%;
}

.id {
  display: grid;
  gap: 4px;
  line-height: 1.4;
}

.name {
  font-size: 15px;
  font-weight: 700;
}

.role {
  font-size: 13.5px;
  color: rgba(255, 255, 255, .72);
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
