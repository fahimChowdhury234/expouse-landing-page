<script setup lang="ts">
/**
 * 03 · Numbers.
 *
 * Five headline figures in one card, right under the hero stage: an icon tile,
 * the figure in brand colour and what it stands for. Laid out from the Figma
 * frame; the motion comes from expouse-landing/index.html (`.stats`): when the
 * card scrolls into view the cells rise in one after another and the numeric
 * figures count up from zero (text figures like 24/7 and ∞ just rise in). The
 * server renders the final figures, so without JS, with reduced motion, or
 * when the card is already on screen at load, they are simply shown.
 */
type Stat = { icon: string, label: string, value?: number, suffix?: string, text?: string }

const STATS: Stat[] = [
  { icon: 'lucide:rotate-3d', value: 360, suffix: '°', label: 'Event Management' },
  { icon: 'lucide:clock', text: '24/7', label: 'Connected Experience' },
  { icon: 'lucide:layers', value: 1, label: 'Unified Ecosystem' },
  { icon: 'lucide:smartphone', value: 100, suffix: '%', label: 'Digital Journey' },
  { icon: 'lucide:trending-up', text: '∞', label: 'Built to Scale' },
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
          <span class="tile">
            <Icon :name="s.icon" class="ico" />
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
  --st-brand: var(--color-brand, #6452E7 );
  --st-brand-soft: var(--color-brand-soft, #6452E712); 
  --st-line: var(--color-line, #e8e9ee);
  --st-muted: var(--color-muted, #6b7280);
  --st-ease: cubic-bezier(.22, .8, .24, 1);
}

/* Same rail and gutter as the hero stage, so the card lines up with the window above it. */
.st-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: 0 clamp(12px, 3vw, 40px) clamp(56px, 7vw, 88px);
}

.st-card {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  background: #fff;
  border: 1px solid var(--st-line);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(20, 23, 40, .04), 0 30px 60px -30px rgba(99, 102, 241, .38);
}

.stat {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 28px 16px 28px 22px;
}

.stat+.stat {
  border-left: 1px solid var(--st-line);
}

.tile {
  flex: none;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--st-brand-soft);
  color: var(--st-brand);
}

.tile .ico {
  width: 22px;
  height: 22px;
}

.txt {
  min-width: 0;
}

.txt b {
  display: block;
  font-size: clamp(28px, 2.8vw, 36px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -.03em;
  color: var(--st-brand);
  font-variant-numeric: tabular-nums;
}

.txt span {
  display: block;
  margin-top: 4px;
  font-size: 15px;
  line-height: 1.35;
  color: var(--st-muted);
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

/* Five across gets cramped: 3 + 2 on a six-track grid. */
@media (max-width: 1080px) {
  .st-card {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .stat {
    grid-column: span 2;
    padding: 30px 20px 30px 28px;
  }

  .stat:nth-child(n+4) {
    grid-column: span 3;
    border-top: 1px solid var(--st-line);
  }

  .stat:nth-child(4) {
    border-left: 0;
  }
}

/* Phones: 2 + 2 + 1, with the tile above the figure; the last cell spans the row. */
@media (max-width: 520px) {
  .st-card {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stat {
    grid-column: auto;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 22px 18px;
  }

  .stat:nth-child(n+3) {
    border-top: 1px solid var(--st-line);
  }

  .stat:nth-child(4) {
    grid-column: auto;
    border-left: 1px solid var(--st-line);
  }

  .stat:nth-child(3),
  .stat:nth-child(5) {
    border-left: 0;
  }

  .stat:nth-child(5) {
    grid-column: span 2;
  }

  .tile {
    width: 44px;
    height: 44px;
    border-radius: 11px;
  }

  .tile .ico {
    width: 20px;
    height: 20px;
  }

  .txt span {
    font-size: 14px;
  }
}
</style>
