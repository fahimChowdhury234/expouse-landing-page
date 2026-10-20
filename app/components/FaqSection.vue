<script setup lang="ts">
/**
 * 12 · FAQ.
 *
 * Five common questions as an accordion (Figma: FAQ, components/faq/FaqAccordion):
 * one answer open at a time, the first one open to start with. When the list
 * scrolls into view the questions rise in one after another; without JS, with
 * reduced motion, or when they are already on screen at load, they are simply
 * shown. Under the list, "See all questions" goes to /faq for the full list.
 *
 * The questions live in utils/faqs.ts, shared with the page's FAQPage
 * structured data (pages/index.vue), so the two never drift apart.
 *
 * This is the page's #faq section (the nav's "FAQ" link lands here).
 */
const list = ref<HTMLElement | null>(null)
const animate = ref(false)
const revealed = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const el = list.value
  if (!el || !('IntersectionObserver' in window)) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // Already on screen (a tall window, a restored scroll): leave the questions be rather than hide them.
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
  <section id="faq" class="fq" aria-labelledby="fq-title">
    <div class="fq-rail">
      <header class="fq-head">
        <p class="fq-eyebrow">FAQ</p>
        <h2 id="fq-title" class="fq-title">Frequently asked questions</h2>
      </header>

      <div ref="list" class="fq-list">
        <FaqAccordion :items="FAQS" id-prefix="fq" :animate="animate" :revealed="revealed" />
      </div>

      <div class="more">
        <NuxtLink to="/faq" class="btn-more">
          See all questions
          <Icon name="lucide:arrow-right" class="ico" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.fq {
  --fq-brand: var(--color-brand, #6366f1);
  --fq-ink: var(--color-ink, #1f2430);
  --fq-muted: var(--color-muted, #6b7280);
  --fq-ease: cubic-bezier(.22, .8, .24, 1);
  color: var(--fq-ink);
  background: #fff;
}

.fq-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(56px, 7vw, 88px) clamp(12px, 3vw, 40px);
}

/* ---------- Heading (same as the sections above) ---------- */
.fq-head {
  max-width: 720px;
  margin: 0 auto clamp(32px, 4.5vw, 56px);
  text-align: center;
}

.fq-eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--fq-brand);
}

.fq-title {
  margin: 8px 0 0;
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.03em;
  text-wrap: balance;
}

/* ---------- Questions ---------- */
.fq-list {
  max-width: 848px;
  margin: 0 auto;
}

/* ---------- See all questions ---------- */
.more {
  display: flex;
  justify-content: center;
  margin-top: clamp(28px, 4vw, 40px);
}

.btn-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  border: 1px solid var(--color-line, #e8e9ee);
  border-radius: 10px;
  background: #fff;
  color: var(--fq-ink);
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 1px 2px rgba(20, 23, 40, .05);
  transition: border-color .2s, color .2s;
}

.btn-more:hover {
  border-color: color-mix(in srgb, var(--fq-brand) 35%, #fff);
  color: var(--fq-brand);
}

.btn-more:focus-visible {
  outline: 2px solid var(--fq-brand);
  outline-offset: 3px;
}

.btn-more .ico {
  width: 18px;
  height: 18px;
  transition: transform .25s var(--fq-ease);
}

.btn-more:hover .ico {
  transform: translateX(3px);
}

@media (prefers-reduced-motion: reduce) {
  .btn-more,
  .btn-more .ico {
    transition: none;
  }
}
</style>
