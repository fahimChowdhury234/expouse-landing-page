<script setup lang="ts">
/**
 * 11 · From the blog.
 *
 * The three latest posts from utils/blog.ts as photo cards (BlogCard), under a
 * centred heading like the other home sections, with a button to /blog. The
 * cards rise in one after another when they scroll into view; without JS, with
 * reduced motion, or when they are already on screen at load, they are simply
 * shown.
 */
import { BLOG_POSTS } from '~/utils/blog'

const POSTS = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)

/* ---------------- Reveal ---------------- */
const grid = ref<HTMLElement | null>(null)
const animate = ref(false)
const revealed = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const el = grid.value
  if (!el || !('IntersectionObserver' in window)) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // Already on screen (a tall window, a restored scroll): leave the cards be rather than hide them.
  if (el.getBoundingClientRect().top < window.innerHeight) return

  animate.value = true
  observer = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting) return
    observer?.disconnect()
    revealed.value = true
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 })
  observer.observe(el)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <section id="blog" class="bh" aria-labelledby="bh-title">
    <div class="bh-rail">
      <header class="bh-head">
        <p class="bh-eyebrow">Blog</p>
        <h2 id="bh-title" class="bh-title">Ideas for running <br>better events</h2>
        <p class="bh-sub">Guides, playbooks and lessons from organizers across the region.</p>
      </header>

      <ul ref="grid" class="grid" :class="{ 'bh--animate': animate, in: revealed }">
        <li v-for="(p, i) in POSTS" :key="p.slug" class="item" :style="{ '--i': i }">
          <BlogCard :post="p" as="h3" />
        </li>
      </ul>

      <div class="more">
        <NuxtLink to="/blog" class="btn-more">Read all articles</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.bh {
  --bh-brand: var(--color-brand, #6452E7);
  --bh-ink: var(--color-ink, #1f2430);
  --bh-muted: var(--color-muted, #6b7280);
  --bh-line: var(--color-line, #e8e9ee);
  --bh-ease: cubic-bezier(.22, .8, .24, 1);
  color: var(--bh-ink);
  background: #fff;
}

.bh-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(56px, 7vw, 88px) clamp(12px, 3vw, 40px);
}

/* ---------- Heading ---------- */
.bh-head {
  max-width: 720px;
  margin: 0 auto clamp(32px, 4.5vw, 56px);
  text-align: center;
}

.bh-eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--bh-brand);
}

.bh-title {
  margin: 8px 0 0;
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.03em;
  text-wrap: balance;
}

.bh-sub {
  margin: 12px auto 0;
  max-width: 640px;
  font-size: 17px;
  line-height: 1.6;
  color: var(--bh-muted);
}

/* ---------- Cards ---------- */
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  display: flex;
  min-width: 0;
}

.item > * {
  flex: 1;
}

.more {
  display: flex;
  justify-content: center;
  margin-top: clamp(28px, 4vw, 40px);
}

.btn-more {
  display: inline-flex;
  align-items: center;
  padding: 13px 32px;
  border: 1px solid var(--bh-line);
  border-radius: 10px;
  background: #fff;
  color: var(--bh-ink);
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 1px 2px rgba(20, 23, 40, .05);
  transition: border-color .2s, color .2s;
}

.btn-more:hover {
  border-color: color-mix(in srgb, var(--bh-brand) 35%, #fff);
  color: var(--bh-brand);
}

.btn-more:focus-visible {
  outline: 2px solid var(--bh-brand);
  outline-offset: 3px;
}

/* ---------- Reveal: cards rise in one after another ---------- */
.bh--animate .item {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity .8s var(--bh-ease), transform .8s var(--bh-ease);
  transition-delay: calc(var(--i, 0) * 90ms);
}

.bh--animate.in .item {
  opacity: 1;
  transform: none;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  /* Two across: the third card would sit alone, so it waits for /blog. */
  .item:nth-child(3) {
    display: none;
  }
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .item:nth-child(3) {
    display: flex;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn-more {
    transition: none;
  }
}
</style>
