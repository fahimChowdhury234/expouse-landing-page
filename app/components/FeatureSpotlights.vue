<script setup lang="ts">
/**
 * 07 · Onsite and exhibitors, up close.
 *
 * Two rows from the Figma frame, text beside a picture, the second one mirrored:
 * check-in at the venue (a badge that prints and gets scanned at the gate) and
 * exhibitor leads (a booth's leads arriving, rated as they come in). The
 * pictures play their loops while they are on screen (components/spotlight).
 * When a row scrolls into view its text and picture rise in; without JS, with
 * reduced motion, or when it is already on screen at load, it is simply shown.
 *
 * This is the page's #onsite section (the nav's "Onsite" link lands here).
 */
const ROWS = [
  {
    key: 'checkin',
    eyebrow: 'Onsite',
    title: 'From the door to the hall in seconds',
    text: 'Attendees get a link to their badge by email before they arrive. On the day, a badge prints in a few seconds and your gate staff keep scanning even when the venue Wi-Fi gives up.',
    points: ['Self-service kiosks where visitors print their own badge', 'QR codes that can\'t be faked or copied', 'Offline scanning that catches up once the connection is back', 'A live count at every gate'],
  },
  {
    key: 'leads',
    eyebrow: 'Exhibitors',
    title: 'Exhibitors who get leads book again next year',
    text: 'An exhibitor scans a visitor\'s badge, answers the few questions they wrote for their booth, and EXPOUSE scores the lead. After the show they have names, notes and a ranking to work through.',
    points: ['Their own questions, with a Hot / Warm / Cold score', 'Suggested leads from booth visits and interests', 'A login for every sales rep, with their own results', 'An engagement report for every exhibitor after the show'],
  },
]

const rowEls = ref<HTMLElement[]>([])
const animate = ref(false)
const shown = ref<boolean[]>(ROWS.map(() => false))
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!('IntersectionObserver' in window)) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // Rows already on screen (a tall window, a restored scroll) are left be rather than hidden.
  const below = rowEls.value.map(el => el.getBoundingClientRect().top >= window.innerHeight)
  if (!below.some(Boolean)) return
  shown.value = below.map(b => !b)
  animate.value = true

  observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      const i = rowEls.value.indexOf(e.target as HTMLElement)
      if (i >= 0) shown.value[i] = true
      observer?.unobserve(e.target)
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 })
  rowEls.value.forEach((el, i) => below[i] && observer?.observe(el))
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <section id="onsite" class="sp" aria-label="Onsite check-in and exhibitor leads">
    <div class="sp-rail">
      <article
        v-for="(r, i) in ROWS"
        :key="r.key"
        ref="rowEls"
        class="row"
        :class="{ flip: i % 2 === 1, 'sp--animate': animate, in: shown[i] }"
        :aria-labelledby="`sp-${r.key}`"
      >
        <div class="copy">
          <p class="eyebrow">{{ r.eyebrow }}</p>
          <h2 :id="`sp-${r.key}`" class="title">{{ r.title }}</h2>
          <p class="text">{{ r.text }}</p>
          <ul class="points">
            <li v-for="p in r.points" :key="p">
              <span class="chk"><Icon name="lucide:check" class="ico" /></span>
              {{ p }}
            </li>
          </ul>
        </div>

        <div class="pic" :class="{ bare: r.key === 'checkin' }">
          <SpotlightCheckin v-if="r.key === 'checkin'" />
          <SpotlightLeads v-else />
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.sp {
  --sp-brand: var(--color-brand, #6366f1);
  --sp-ink: var(--color-ink, #1f2430);
  --sp-muted: var(--color-muted, #6b7280);
  --sp-panel: #f4f2fd;
  --sp-ease: cubic-bezier(.22, .8, .24, 1);
  color: var(--sp-ink);
  background: #fff;
}

.sp-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(56px, 7vw, 88px) clamp(12px, 3vw, 40px);
  display: grid;
  gap: clamp(64px, 8vw, 100px);
}

/* ---------- Row: text | picture, mirrored on the second ---------- */
.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
}

.copy {
  padding-right: clamp(24px, 4.5vw, 64px);
}

.flip .copy {
  order: 2;
  padding: 0 0 0 clamp(24px, 4.5vw, 64px);
}

.eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--sp-brand);
}

.title {
  margin: 12px 0 0;
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.03em;
  text-wrap: balance;
}

.text {
  margin: 18px 0 0;
  max-width: 520px;
  font-size: 17px;
  line-height: 1.7;
  color: var(--sp-muted);
}

.points {
  display: grid;
  gap: 16px;
  margin: 26px 0 0;
  padding: 0;
  list-style: none;
}

/* Top-aligned, so a line that wraps keeps its check beside the first line. */
.points li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 16px;
  line-height: 22px;
}

.chk {
  flex: none;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: var(--sp-brand);
  background: #efedfc;
}

.chk .ico {
  width: 13px;
  height: 13px;
}

/* The lilac panel each picture sits on. */
.pic {
  min-height: 415px;
  display: grid;
  /* One column no wider than the panel, so the leads card can shrink on phones. */
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  padding: 40px 24px;
  overflow: hidden;
  background: var(--sp-panel);
  border-radius: 12px;
}

.flip .pic {
  min-height: 436px;
}

/* SpotlightCheckin lays its cards out across the whole panel. */
.pic.bare {
  padding: 0;
  place-items: stretch;
}

/* ---------- Reveal: text rises in, then the picture ---------- */
.sp--animate .copy,
.sp--animate .pic {
  opacity: 0;
  transform: translateY(26px);
  filter: blur(4px);
  transition: opacity .8s var(--sp-ease), transform .8s var(--sp-ease), filter .8s var(--sp-ease);
}

.sp--animate .pic {
  transition-delay: .12s;
}

.sp--animate.in .copy,
.sp--animate.in .pic {
  opacity: 1;
  transform: none;
  filter: none;
}

/* Tablets and phones: the text above its picture, on both rows. */
@media (max-width: 960px) {
  .row {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }

  .copy,
  .flip .copy {
    order: 0;
    padding: 0;
  }

  .text {
    max-width: 640px;
  }
}

@media (max-width: 560px) {
  .pic {
    padding: 32px 14px;
  }

  .pic.bare {
    padding: 0;
  }

  .text {
    font-size: 16px;
  }

  .points li {
    font-size: 15px;
  }
}
</style>
