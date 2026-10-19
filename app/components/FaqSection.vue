<script setup lang="ts">
/**
 * 12 · FAQ.
 *
 * Five common questions as an accordion (Figma: FAQ): one answer open at a
 * time, the first one open to start with. The answers slide open and shut
 * (a grid row from 0fr to 1fr, so no heights are measured) and the chevron
 * turns. Each question is a real button wired to its answer (aria-expanded,
 * aria-controls), and every answer is in the page for search engines and
 * readers without JS. When the list scrolls into view the questions rise in
 * one after another; without JS, with reduced motion, or when they are already
 * on screen at load, they are simply shown.
 *
 * The questions live in utils/faqs.ts, shared with the page's FAQPage
 * structured data (pages/index.vue), so the two never drift apart.
 *
 * This is the page's #faq section (the nav's "FAQ" link lands here).
 */
const open = ref<number | null>(0)

function toggle(i: number) {
  open.value = open.value === i ? null : i
}

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

      <ul ref="list" class="list" :class="{ 'fq--animate': animate, in: revealed }">
        <li v-for="(f, i) in FAQS" :key="f.q" class="item" :class="{ open: open === i }" :style="{ '--i': i }">
          <h3 class="q">
            <button
              :id="`fq-q${i}`"
              type="button"
              class="q-btn"
              :aria-expanded="open === i"
              :aria-controls="`fq-a${i}`"
              @click="toggle(i)"
            >
              <span>{{ f.q }}</span>
              <Icon name="lucide:chevron-down" class="chev" />
            </button>
          </h3>
          <div :id="`fq-a${i}`" class="a" role="region" :aria-labelledby="`fq-q${i}`" :aria-hidden="open !== i">
            <div class="a-in">
              <p>{{ f.a }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.fq {
  --fq-brand: var(--color-brand, #6366f1);
  --fq-ink: var(--color-ink, #1f2430);
  --fq-muted: var(--color-muted, #6b7280);
  --fq-line: #e6e4f2;
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
.list {
  display: grid;
  gap: 14px;
  max-width: 848px;
  margin: 0 auto;
  padding: 0;
  list-style: none;
}

.item {
  background: #fff;
  border: 1px solid var(--fq-line);
  border-radius: 10px;
  transition: border-color .25s, box-shadow .3s;
}

.item:hover,
.item.open {
  border-color: #dad7f3;
}

.item.open {
  box-shadow: 0 18px 40px -32px rgba(99, 102, 241, .45);
}

.q {
  margin: 0;
}

.q-btn {
  width: 100%;
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 26px 18px 24px;
  font: inherit;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
  text-align: start;
  color: var(--fq-ink);
  background: none;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  transition: color .2s;
}

.q-btn:hover {
  color: var(--fq-brand);
}

.q-btn:focus-visible {
  outline: 2px solid var(--fq-brand);
  outline-offset: 2px;
}

.chev {
  width: 21px;
  height: 21px;
  flex: none;
  color: #4b5160;
  transition: transform .35s var(--fq-ease), color .2s;
}

.q-btn:hover .chev {
  color: var(--fq-brand);
}

.open .chev {
  transform: rotate(180deg);
}

/* The answer slides open: its row grows from nothing to its own height. */
.a {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows .4s var(--fq-ease);
}

.open .a {
  grid-template-rows: 1fr;
}

.a-in {
  min-height: 0;
  overflow: hidden;
}

.a p {
  margin: 0;
  padding: 0 64px 24px 24px;
  font-size: 15.5px;
  line-height: 1.75;
  color: var(--fq-muted);
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity .25s ease, transform .35s var(--fq-ease);
}

.open .a p {
  margin-top: -6px;
  opacity: 1;
  transform: none;
  transition-delay: .08s;
}

/* ---------- Reveal: questions rise in one after another ---------- */
.fq--animate .item {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity .7s var(--fq-ease), transform .7s var(--fq-ease), border-color .25s, box-shadow .3s;
  transition-delay: calc(var(--i, 0) * 70ms), calc(var(--i, 0) * 70ms), 0s, 0s;
}

.fq--animate.in .item {
  opacity: 1;
  transform: none;
}

@media (max-width: 560px) {
  .q-btn {
    min-height: 62px;
    padding: 16px 18px;
    font-size: 16px;
  }

  .a p {
    padding: 0 18px 20px;
    font-size: 15px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .a,
  .a p,
  .chev {
    transition: none;
  }
}
</style>
