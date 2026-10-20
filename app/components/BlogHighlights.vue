<script setup lang="ts">
/**
 * 11 · From the blog.
 *
 * The first four posts from utils/blog.ts in the /blog bento (BlogGrid): the
 * lead story large, a tall photo card, then a guide and a research stat
 * stacked. The heading sits left with "View all articles" on the right. The
 * grid rises in when it scrolls into view; without JS, with reduced motion,
 * or when it is already on screen at load, it is simply shown.
 */
import { BLOG_POSTS } from '~/utils/blog'

/** The /blog grid's opening four: feature, tall, promo and stat fill one row of the bento. */
const POSTS = BLOG_POSTS.slice(0, 4)

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
        <div class="bh-intro">
          <p class="bh-eyebrow">From the blog</p>
          <h2 id="bh-title" class="bh-title">Ideas for running better events</h2>
          <p class="bh-sub">Playbooks, research and guides from the EXPOUSE team.</p>
        </div>

        <NuxtLink to="/blog" class="btn-all">
          View all articles
          <Icon name="lucide:arrow-right" class="ico" />
        </NuxtLink>
      </header>

      <div ref="grid" class="bh-grid" :class="{ 'bh--animate': animate, in: revealed }">
        <BlogGrid :posts="POSTS" lazy />
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

/* ---------- Heading: left, with the link to /blog on the right ---------- */
.bh-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px 40px;
  margin-bottom: clamp(28px, 3.6vw, 40px);
}

.bh-intro {
  min-width: 0;
}

.bh-eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--bh-brand);
}

.bh-title {
  margin: 6px 0 0;
  font-size: clamp(30px, 3.6vw, 44px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.02em;
  text-wrap: balance;
}

.bh-sub {
  margin: 10px 0 0;
  font-size: 17px;
  line-height: 1.6;
  color: var(--bh-muted);
}

.btn-all {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
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

.btn-all:hover {
  border-color: color-mix(in srgb, var(--bh-brand) 35%, #fff);
  color: var(--bh-brand);
}

.btn-all:focus-visible {
  outline: 2px solid var(--bh-brand);
  outline-offset: 3px;
}

.btn-all .ico {
  width: 18px;
  height: 18px;
  transition: transform .25s var(--bh-ease);
}

.btn-all:hover .ico {
  transform: translateX(3px);
}

/* ---------- Reveal: the grid rises in ---------- */
.bh--animate {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity .8s var(--bh-ease), transform .8s var(--bh-ease);
}

.bh--animate.in {
  opacity: 1;
  transform: none;
}

/* Phones: the link drops under the heading. */
@media (max-width: 720px) {
  .bh-head {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn-all,
  .btn-all .ico {
    transition: none;
  }
}
</style>
