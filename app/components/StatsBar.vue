<script setup lang="ts">
/**
 * 03 · Numbers.
 *
 * Five headline figures in one card, right under the hero stage: an icon tile,
 * the figure in brand colour and what it stands for. Built from the design's
 * `.stats` block (EXPOUSE Website, single-file export): its icons, sizes and
 * hover (the cell tints and a brand bar slides in along its top), five across,
 * three then two on narrow laptops, two by two (the last cell full width) on
 * tablets and phones.
 *
 * When the card scrolls into view the cells rise in one after another and the
 * numeric figures count up from zero (24/7 and ∞ just rise in). The server
 * renders the final figures, so without JS, with reduced motion, or when the
 * card is already on screen at load, they are simply shown.
 */
type Stat = {
  /** The design's 24 × 24 line icon (drawn in the template). */
  icon: 'rotate' | 'nodes' | 'grid' | 'phone' | 'bars'
  label: string
  value?: number
  suffix?: string
  text?: string
}

const STATS: Stat[] = [
  { icon: 'rotate', value: 360, suffix: '°', label: 'Event Management' },
  { icon: 'nodes', text: '24/7', label: 'Connected Experience' },
  { icon: 'grid', value: 1, label: 'Unified Ecosystem' },
  { icon: 'phone', value: 100, suffix: '%', label: 'Digital Journey' },
  { icon: 'bars', text: '∞', label: 'Built to Scale' },
]
/** Length of the count-up. */
const COUNT_MS = 1400

const card = ref<HTMLElement | null>(null)
const animate = ref(false)
const revealed = ref(false)
const shown = ref(STATS.map(s => s.value ?? 0))
let observer: IntersectionObserver | null = null
let frame = 0

function countUp() {
  const t0 = performance.now()
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / COUNT_MS)
    const eased = 1 - Math.pow(1 - p, 3)
    shown.value = STATS.map(s => Math.round((s.value ?? 0) * eased))
    if (p < 1) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
}

onMounted(() => {
  const el = card.value
  if (!el || !('IntersectionObserver' in window)) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // Already on screen (a tall window, a restored scroll): leave the figures be rather than blank them.
  if (el.getBoundingClientRect().top < window.innerHeight) return

  animate.value = true
  shown.value = STATS.map(() => 0)
  observer = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting) return
    observer?.disconnect()
    revealed.value = true
    countUp()
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 })
  observer.observe(el)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
</script>

<template>
  <section class="st" aria-label="EXPOUSE in numbers">
    <div class="st-rail">
      <div ref="card" class="st-card" :class="{ 'st--animate': animate, in: revealed }">
        <div v-for="(s, i) in STATS" :key="s.label" class="stat" :style="{ '--i': i }">
          <span class="tile" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <template v-if="s.icon === 'rotate'">
                <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
                <path d="M20.5 4v4.5H16" />
                <circle cx="12" cy="12" r="2.5" />
              </template>
              <template v-else-if="s.icon === 'nodes'">
                <circle cx="12" cy="5" r="2.5" />
                <circle cx="5" cy="18" r="2.5" />
                <circle cx="19" cy="18" r="2.5" />
                <path d="M10.8 7.2L6.2 15.8M13.2 7.2l4.6 8.6M7.5 18h9" />
              </template>
              <template v-else-if="s.icon === 'grid'">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </template>
              <template v-else-if="s.icon === 'phone'">
                <rect x="7" y="2" width="10" height="20" rx="2.5" />
                <path d="M11 18h2" />
              </template>
              <path v-else d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
            </svg>
          </span>
          <div class="txt">
            <b>{{ s.value === undefined ? s.text : `${shown[i]}${s.suffix ?? ''}` }}</b>
            <span>{{ s.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.st {
  --st-brand: var(--color-brand, #6452E7);
  --st-tint: rgba(100, 82, 231, .07);
  --st-line: #E6E5F2;
  --st-label: #64676A;
  --st-ease: cubic-bezier(.22, .8, .24, 1);
  /* background: #fff; */
}

/* Same rail and gutter as the hero stage, so the card lines up with the window above it. */
.st-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: 0 clamp(12px, 3vw, 40px) 56px;
}

.st-card {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--st-line);
  border-radius: 12px;
  box-shadow: 0 24px 50px -32px rgba(100, 82, 231, .4);
}

.stat {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 24px 16px;
  border-right: 1px solid var(--st-line);
  transition: background-color .25s;
}

.stat:last-child {
  border-right: 0;
}

/* Hover: the cell tints and a brand bar slides in along its top. */
.stat::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 3px;
  background: var(--st-brand);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform .35s;
}

.stat:hover {
  background: var(--st-tint);
}

.stat:hover::before {
  transform: scaleX(1);
}

.tile {
  flex: none;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: var(--st-brand);
  background: var(--st-tint);
}

.tile svg {
  display: block;
  width: 22px;
  height: 22px;
}

.txt {
  min-width: 0;
}

.txt b {
  display: block;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -.02em;
  color: var(--st-brand);
  font-variant-numeric: tabular-nums;
}

.txt span {
  display: block;
  font-size: 14.5px;
  line-height: 1.4;
  color: var(--st-label);
  white-space: nowrap;
}

/* Reveal: the card frame stays put and each cell's contents rise in, one after another. */
.st--animate .stat>* {
  opacity: 0;
  transform: translateY(26px);
  filter: blur(4px);
  transition: opacity .8s var(--st-ease), transform .8s var(--st-ease), filter .8s var(--st-ease);
  transition-delay: calc(var(--i, 0) * 90ms);
}

.st--animate.in .stat>* {
  opacity: 1;
  transform: none;
  filter: none;
}

/* Narrower: tighter cells, smaller figures. */
@media (max-width: 1240px) {
  .stat {
    gap: 10px;
    padding: 22px 14px;
  }

  .tile {
    width: 40px;
    height: 40px;
  }

  .tile svg {
    width: 20px;
    height: 20px;
  }

  .txt b {
    font-size: 28px;
  }

  .txt span {
    font-size: 13.5px;
  }
}

/* Narrow laptops: three, then two. */
@media (max-width: 1200px) and (min-width: 901px) {
  .st-card {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .stat {
    border-bottom: 1px solid var(--st-line);
  }

  .stat:nth-child(3) {
    border-right: 0;
  }

  .stat:nth-child(n+4) {
    border-bottom: 0;
  }
}

/* Tablets and phones: two by two, the last cell across the row. */
@media (max-width: 900px) {
  .st-card {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stat {
    border-right: 0;
    border-bottom: 1px solid var(--st-line);
  }

  .stat:nth-child(odd) {
    border-right: 1px solid var(--st-line);
  }

  .stat:last-child {
    grid-column: 1 / -1;
    border-right: 0;
    border-bottom: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stat,
  .stat::before {
    transition: none;
  }
}
</style>
