<script setup lang="ts">
/**
 * 10 · Security.
 *
 * Four short promises about data and access, one card each (Figma: Security;
 * content from expouse-landing/index.html, 07 Region + security). Same card
 * style as the One platform section. When the cards scroll into view they rise
 * in one after another; without JS, with reduced motion, or when they are
 * already on screen at load, they are simply shown.
 *
 * PLACEHOLDER STAT: "more than 50,000 attendees" - confirm before launch.
 */
const POINTS = [
  { icon: 'lucide:shield-check', title: 'Isolated data', text: 'Each organization\'s data is kept apart at the database level.' },
  { icon: 'lucide:lock', title: 'Secure badges', text: 'Encrypted QR tokens stop copied or shared badges at the gate.' },
  { icon: 'lucide:key-round', title: 'Role-based access', text: 'Choose exactly which pages each staff member can view, edit or export.' },
  { icon: 'lucide:server', title: 'Tested at scale', text: 'Already running single events with more than 50,000 attendees.' },
]

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
  <section id="security" class="se" aria-labelledby="se-title">
    <div class="se-rail">
      <header class="se-head">
        <p class="se-eyebrow">Security</p>
        <h2 id="se-title" class="se-title">Ready for government and enterprise IT reviews</h2>
        <p class="se-sub">Large events carry a lot of personal data. This is how we look after it.</p>
      </header>

      <ul ref="grid" class="se-grid" :class="{ 'se--animate': animate, in: revealed }">
        <li v-for="(p, i) in POINTS" :key="p.title" class="card" :style="{ '--i': i }">
          <span class="tile">
            <Icon :name="p.icon" class="ico" />
          </span>
          <h3>{{ p.title }}</h3>
          <p>{{ p.text }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.se {
  --se-brand: var(--color-brand, #6452E7 );
  --se-brand-soft: var(--color-brand-soft, #eef2ff);
  --se-brand-200: #c7d2fe;
  --se-ink: var(--color-ink, #1f2430);
  --se-muted: var(--color-muted, #6b7280);
  --se-line: var(--color-line, #e8e9ee);
  --se-ease: cubic-bezier(.22, .8, .24, 1);
  color: var(--se-ink);
}

.se-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(56px, 7vw, 88px) clamp(12px, 3vw, 40px);
}

/* ---------- Heading ---------- */
.se-head {
  max-width: 720px;
  margin: 0 auto clamp(32px, 4.5vw, 56px);
  text-align: center;
}

.se-eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--se-brand);
}

.se-title {
  margin: 8px 0 0;
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.03em;
  text-wrap: balance;
}

.se-sub {
  margin: 12px auto 0;
  max-width: 640px;
  font-size: 17px;
  line-height: 1.6;
  color: var(--se-muted);
}

/* ---------- Cards ---------- */
.se-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.card {
  min-width: 0;
  padding: 28px 26px 30px;
  background: #fff;
  border: 1px solid var(--se-line);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(20, 23, 40, .04);
  transition: border-color .25s, box-shadow .3s;
}

.card:hover {
  border-color: var(--se-brand-200);
  box-shadow: 0 1px 2px rgba(20, 23, 40, .04), 0 24px 48px -28px rgba(99, 102, 241, .4);
}

.tile {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: var(--se-brand-soft);
  color: var(--se-brand);
  transition: background .25s, color .25s;
}

/* On hover the tile takes the solid brand fill, like the One platform cards. */
.card:hover .tile {
  background: var(--se-brand);
  color: #fff;
}

.tile .ico {
  width: 22px;
  height: 22px;
}

.card h3 {
  margin: 22px 0 0;
  font-size: 19px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -.01em;
}

.card p {
  margin: 10px 0 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--se-muted);
}

/* ---------- Reveal: cards rise in one after another ---------- */
.se--animate .card {
  opacity: 0;
  transform: translateY(26px);
  filter: blur(4px);
  transition: opacity .8s var(--se-ease), transform .8s var(--se-ease), filter .8s var(--se-ease), border-color .25s, box-shadow .3s;
  transition-delay: calc(var(--i, 0) * 90ms), calc(var(--i, 0) * 90ms), calc(var(--i, 0) * 90ms), 0s, 0s;
}

.se--animate.in .card {
  opacity: 1;
  transform: none;
  filter: none;
}

@media (max-width: 1024px) {
  .se-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .se-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tile {
    transition: none;
  }
}
</style>
