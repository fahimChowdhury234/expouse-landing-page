<script setup lang="ts">
/**
 * 11 · Pricing.
 *
 * Three plans side by side (Figma: Pricing): Event, Organizer and Enterprise.
 * Each card has a tinted head with the plan and who it is for, the price, a
 * button and what is included. Organizer is the featured one: brand-filled,
 * raised a little above the others, with a "Most popular" tag. Prices are
 * quoted, so every plan reads "Custom"; the buttons go to the contact page
 * (/contact-us) with the plan picked (?plan=). When the cards scroll into
 * view they rise in one after another; without JS, with reduced motion, or
 * when they are already on screen at load, they are simply shown.
 *
 * This is the page's #pricing section (the nav's "Pricing" link lands here).
 */
const PLANS = [
  {
    key: 'event',
    name: 'Event',
    text: 'For a single conference or expo.',
    per: 'per event',
    cta: 'Get a quote',
    features: ['Branded event website', 'Registration & badges', 'Check-in app', 'Attendee web app'],
  },
  {
    key: 'organizer',
    name: 'Organizer',
    text: 'For teams running several events a year.',
    per: 'per year',
    cta: 'Get a quote',
    featured: true,
    features: ['Everything in Event', 'Exhibitor portal & leads', 'Branded iOS & Android app', 'Print kiosks & live sessions', 'Staff roles & permissions'],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    text: 'For large shows and multi-hall venues.',
    cta: 'Talk to sales',
    features: ['Everything in Organizer', 'Face-matched event photos', 'Onsite hardware & support', 'Custom domain & white label', 'Dedicated success manager'],
  },
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
  <section id="pricing" class="pp" aria-labelledby="pp-title">
    <div class="pp-rail">
      <header class="pp-head">
        <p class="pp-eyebrow">Pricing</p>
        <h2 id="pp-title" class="pp-title">Pricing that fits one expo or fifty</h2>
        <p class="pp-sub">Every plan includes registration, badges and check-in. Tell us about your event and we'll send a quote within a working day.</p>
      </header>

      <div ref="grid" class="pp-grid" :class="{ 'pp--animate': animate, in: revealed }">
        <article
          v-for="(p, i) in PLANS"
          :key="p.key"
          class="plan"
          :class="{ featured: p.featured }"
          :style="{ '--i': i }"
          :aria-labelledby="`pp-${p.key}`"
        >
          <i class="ring" aria-hidden="true" />

          <div class="plan-head">
            <div class="name-row">
              <h3 :id="`pp-${p.key}`">{{ p.name }}</h3>
              <span v-if="p.featured" class="popular">Most popular</span>
            </div>
            <p>{{ p.text }}</p>
          </div>

          <div class="plan-body">
            <p class="price">
              <b>Custom</b>
              <span v-if="p.per">/ {{ p.per }}</span>
            </p>

            <NuxtLink :to="`/contact-us?plan=${p.key}`" class="cta">{{ p.cta }}</NuxtLink>

            <ul class="list">
              <li v-for="f in p.features" :key="f">
                <span class="chk"><Icon name="lucide:check" class="ico" /></span>
                {{ f }}
              </li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.pp {
  --pp-brand: var(--color-brand, #6366f1);
  --pp-brand-dark: var(--color-brand-dark, #4f46e5);
  --pp-ink: var(--color-ink, #1f2430);
  --pp-muted: var(--color-muted, #6b7280);
  --pp-line: #e8e6f2;
  --pp-ease: cubic-bezier(.22, .8, .24, 1);
  /* How far the featured plan sits above the others. */
  --lift: 15px;
  color: var(--pp-ink);
  background: #f3f2fc;
}

.pp-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(56px, 7vw, 88px) clamp(12px, 3vw, 40px);
}

/* ---------- Heading (same as the sections above) ---------- */
.pp-head {
  max-width: 760px;
  margin: 0 auto clamp(32px, 4.5vw, 56px);
  text-align: center;
}

.pp-eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--pp-brand);
}

.pp-title {
  margin: 8px 0 0;
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.03em;
  text-wrap: balance;
}

.pp-sub {
  margin: 12px auto 0;
  max-width: 720px;
  font-size: 17px;
  line-height: 1.6;
  color: var(--pp-muted);
}

/* ---------- Plans ---------- */
.pp-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 21px;
  align-items: stretch;
}

.plan {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-top: var(--lift);
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--pp-line);
  border-radius: 14px;
  transition: border-color .25s, box-shadow .3s;
}

.plan:hover {
  border-color: #cfd2fb;
  box-shadow: 0 28px 52px -34px rgba(99, 102, 241, .45);
}

/* The featured plan: raised, filled with the brand, with a soft glow under it. */
.plan.featured {
  margin: 0 0 var(--lift);
  color: #fff;
  background: var(--pp-brand);
  border-color: var(--pp-brand);
  box-shadow: 0 46px 70px -34px rgba(99, 82, 231, .6);
}

/* A soft disc in a ring at the top right, across the head and the price. */
.ring {
  position: absolute;
  z-index: 1;
  right: -110px;
  top: -40px;
  width: 210px;
  height: 210px;
  border-radius: 50%;
  background: rgba(99, 102, 241, .045);
  box-shadow: 0 0 0 26px rgba(99, 102, 241, .02);
  pointer-events: none;
}

.featured .ring {
  background: rgba(255, 255, 255, .08);
  box-shadow: 0 0 0 26px rgba(255, 255, 255, .05);
}

/* ---------- Head: plan name and who it is for ---------- */
.plan-head {
  position: relative;
  min-height: 110px;
  padding: 30px 32px 24px;
  background: #efeefb;
  border-bottom: 1px solid var(--pp-line);
}

.featured .plan-head {
  background: rgba(255, 255, 255, .1);
  border-bottom-color: rgba(255, 255, 255, .2);
}

.name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.plan-head h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -.01em;
}

.popular {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--pp-brand);
  white-space: nowrap;
  background: #fff;
  border-radius: 8px;
}

.plan-head p {
  margin: 4px 0 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--pp-muted);
}

.featured .plan-head p {
  color: rgba(255, 255, 255, .86);
}

/* ---------- Body: price, button, what's included ---------- */
.plan-body {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 40px 32px 40px;
}

.price {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
}

.price b {
  font-size: 40px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -.03em;
}

.price span {
  font-size: 15px;
  color: var(--pp-muted);
}

.featured .price span {
  color: rgba(255, 255, 255, .82);
}

.cta {
  position: relative;
  z-index: 2;
  height: 46px;
  display: grid;
  place-items: center;
  margin-top: 34px;
  font-size: 15px;
  font-weight: 500;
  color: var(--pp-ink);
  text-decoration: none;
  background: #fff;
  border: 1px solid #dcdbe6;
  border-radius: 10px;
  transition: color .2s, border-color .2s, background-color .2s, box-shadow .2s;
}

.cta:hover {
  color: var(--pp-brand);
  border-color: var(--pp-brand);
}

.featured .cta {
  color: var(--pp-brand);
  border-color: #fff;
}

.featured .cta:hover {
  color: var(--pp-brand-dark);
  box-shadow: 0 12px 24px -12px rgba(20, 16, 70, .45);
}

.cta:focus-visible {
  outline: 2px solid var(--pp-brand);
  outline-offset: 3px;
}

.featured .cta:focus-visible {
  outline-color: #fff;
}

.list {
  display: grid;
  gap: 13px;
  margin: 26px 0 0;
  padding: 26px 0 0;
  list-style: none;
  border-top: 1px solid var(--pp-line);
}

.featured .list {
  border-top-color: rgba(255, 255, 255, .2);
}

/* Top-aligned, so a line that wraps keeps its check beside the first line. */
.list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 15.5px;
  line-height: 22px;
}

.chk {
  flex: none;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: var(--pp-brand);
  background: #efedfc;
}

.featured .chk {
  background: #fff;
}

.chk .ico {
  width: 13px;
  height: 13px;
}

/* ---------- Reveal: cards rise in one after another ---------- */
.pp--animate .plan {
  opacity: 0;
  transform: translateY(26px);
  filter: blur(4px);
  transition: opacity .8s var(--pp-ease), transform .8s var(--pp-ease), filter .8s var(--pp-ease), border-color .25s, box-shadow .3s;
  transition-delay: calc(var(--i, 0) * 90ms), calc(var(--i, 0) * 90ms), calc(var(--i, 0) * 90ms), 0s, 0s;
}

.pp--animate.in .plan {
  opacity: 1;
  transform: none;
  filter: none;
}

/* Tablets and phones: one plan under another, the featured one first. */
@media (max-width: 960px) {
  .pp-grid {
    grid-template-columns: minmax(0, 1fr);
    max-width: 520px;
    margin-inline: auto;
    gap: 18px;
  }

  .plan,
  .plan.featured {
    margin: 0;
  }

  .plan.featured {
    order: -1;
  }
}

@media (max-width: 480px) {
  .plan-head {
    min-height: 0;
    padding: 24px 22px 20px;
  }

  .plan-body {
    padding: 30px 22px 30px;
  }

  .price b {
    font-size: 34px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cta {
    transition: none;
  }
}
</style>
