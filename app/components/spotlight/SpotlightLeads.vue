<script setup lang="ts">
/**
 * The Exhibitors row's picture (Figma: Leads that come with context): booth
 * B-214's leads for today, each with a Hot / Warm / Cold rating and a score.
 *
 * While it is on screen new scans keep arriving: a lead slides in at the top
 * (the list moves down, the oldest drops off the bottom), waits a beat while
 * it is rated, then its rating pops in and its score counts up. Off screen,
 * with reduced motion or without JS it is the Figma frame.
 *
 * Every person and company here is fictional sample data.
 */
type Rating = 'hot' | 'warm' | 'cold'
interface Lead { initials: string, name: string, sub: string, rating: Rating, score: number }
interface Row extends Lead { id: number, shown: number, rated: boolean, fresh: boolean }

const START: Lead[] = [
  { initials: 'OS', name: 'Omar Saleh', sub: 'Procurement Lead · Aramex', rating: 'hot', score: 92 },
  { initials: 'SA', name: 'Sara Ali', sub: 'CTO · Fleetly', rating: 'hot', score: 88 },
  { initials: 'JP', name: 'James Park', sub: 'Operations · Maersk', rating: 'warm', score: 71 },
  { initials: 'NK', name: 'Noura Khalid', sub: 'Founder · Shipwise', rating: 'warm', score: 64 },
  { initials: 'RM', name: 'Ravi Menon', sub: 'Student · AUS', rating: 'cold', score: 22 },
]
/** Who scans in next, in turn (then the first five come round again). */
const NEXT: Lead[] = [
  { initials: 'MA', name: 'Mariam Al Balushi', sub: 'Interior Designer · Al Noor Interiors', rating: 'hot', score: 90 },
  { initials: 'KR', name: 'Khalid Al Rawahi', sub: 'Editor · Times of Oman', rating: 'warm', score: 67 },
  { initials: 'TH', name: 'Tariq Hamdan', sub: 'Student · SQU', rating: 'cold', score: 19 },
  { initials: 'YA', name: 'Yousef Amin', sub: 'Buyer · BuildMart', rating: 'hot', score: 85 },
  { initials: 'LM', name: 'Lina Mansour', sub: 'Architect · Studio Lina', rating: 'warm', score: 74 },
  ...START,
]
const LABEL: Record<Rating, string> = { hot: 'Hot', warm: 'Warm', cold: 'Cold' }

let uid = 0
const done = (l: Lead): Row => ({ ...l, id: uid++, shown: l.score, rated: true, fresh: false })
const rows = ref<Row[]>(START.map(done))
let next = 0

const tl = useTimeline()

function loop() {
  tl.run(async (wait) => {
    // Coming back into view mid-scan: finish the newest lead first.
    for (const r of rows.value) Object.assign(r, { shown: r.score, rated: true, fresh: false })
    await wait(2200)

    while (true) {
      const lead = NEXT[next]!
      next = (next + 1) % NEXT.length
      rows.value = [{ ...lead, id: uid++, shown: 0, rated: false, fresh: true }, ...rows.value.slice(0, -1)]
      const row = rows.value[0]!
      await wait(1000)

      // Rated: the chip pops in and the score counts up.
      row.rated = true
      const STEPS = 24
      for (let i = 1; i <= STEPS; i++) {
        row.shown = Math.round(row.score * (1 - (1 - i / STEPS) ** 3))
        await wait(28)
      }
      await wait(1300)
      row.fresh = false
      await wait(1900)
    }
  })
}

const root = ref<HTMLElement | null>(null)
usePlayInView(root, { play: loop, pause: tl.cancel })
</script>

<template>
  <div ref="root" class="card" role="img" aria-label="Sample: booth B-214's leads for today, each rated Hot, Warm or Cold with a score">
    <div class="head" aria-hidden="true">
      <b>Today's leads</b>
      <small>Booth B-214</small>
    </div>
    <TransitionGroup tag="ul" name="sl" class="list" aria-hidden="true">
      <li v-for="r in rows" :key="r.id" class="row" :class="{ fresh: r.fresh }">
        <span class="av">{{ r.initials }}</span>
        <span class="who"><b>{{ r.name }}</b><small>{{ r.sub }}</small></span>
        <Transition name="sl-chip" mode="out-in">
          <span v-if="r.rated" key="r" class="tag" :class="r.rating">{{ LABEL[r.rating] }}</span>
          <span v-else key="p" class="tag wait"><i /><i /><i /></span>
        </Transition>
        <b class="score">{{ r.shown }}</b>
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.card {
  --ease: cubic-bezier(.22, .8, .24, 1);
  width: min(434px, 100%);
  padding: 20px 18px 6px;
  color: var(--color-ink, #1f2430);
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(31, 36, 48, .04), 0 34px 60px -30px rgba(76, 61, 190, .35);
}

.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 16px;
}

.head b {
  font-size: 15px;
  font-weight: 700;
}

.head small {
  font-size: 13px;
  color: var(--color-muted, #6b7280);
}

/* Five rows tall, always: the leaving row is lifted out while the rest move down. */
.list {
  position: relative;
  /* Keeps the rows' glow (below) above the card. */
  isolation: isolate;
  height: calc(5 * 55px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  position: relative;
  height: 55px;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) auto 30px;
  align-items: center;
  column-gap: 12px;
  border-top: 1px solid #ecebf3;
}

/* The newest scan glows for a moment. */
.row::before {
  content: "";
  position: absolute;
  inset: 4px -8px;
  z-index: -1;
  border-radius: 10px;
  background: #f4f2fe;
  opacity: 0;
  transition: opacity 1.2s var(--ease);
}

.row.fresh::before {
  opacity: 1;
  transition-duration: .3s;
}

.av {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-brand, #6366f1);
  background: #efedfc;
  border-radius: 50%;
}

.who {
  display: grid;
  min-width: 0;
  line-height: 1.35;
}

.who b,
.who small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.who b {
  font-size: 14.5px;
  font-weight: 500;
}

.who small {
  font-size: 12.5px;
  color: var(--color-muted, #6b7280);
}

.tag {
  min-width: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 26px;
  padding: 0 10px;
  font-size: 13px;
  border-radius: 6px;
}

.tag.hot { color: #dc2626; background: #fdecec; }
.tag.warm { color: #c2410c; background: #fdf2e4; }
.tag.cold { color: #6b7280; background: #f1f2f6; }

/* Being rated: three dots. */
.tag.wait { background: #f1f2f6; }
.tag.wait i { width: 4px; height: 4px; border-radius: 50%; background: #a3a8b5; animation: sl-dot 1s ease-in-out infinite; }
.tag.wait i:nth-child(2) { animation-delay: .15s; }
.tag.wait i:nth-child(3) { animation-delay: .3s; }

.score {
  font-size: 15px;
  font-weight: 700;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ---------- Motion ---------- */
.sl-move,
.sl-enter-active {
  transition: transform .6s var(--ease), opacity .5s var(--ease);
}

.sl-leave-active {
  position: absolute;
  left: 0;
  right: 0;
  transition: opacity .35s var(--ease), transform .45s var(--ease);
}

.sl-enter-from {
  opacity: 0;
  transform: translateY(-18px);
}

.sl-leave-to {
  opacity: 0;
  transform: translateY(14px);
}

.sl-chip-enter-active {
  animation: sl-pop .45s var(--ease) both;
}

.sl-chip-leave-active {
  transition: opacity .12s;
}

.sl-chip-leave-to {
  opacity: 0;
}

@keyframes sl-pop {
  from { opacity: 0; transform: scale(.7); }
  60% { transform: scale(1.08); }
  to { opacity: 1; transform: none; }
}

@keyframes sl-dot {
  0%, 100% { opacity: .35; transform: none; }
  50% { opacity: 1; transform: translateY(-2px); }
}

@media (max-width: 480px) {
  .card { padding-inline: 14px; }
  .row { column-gap: 10px; }
  .who b { font-size: 14px; }
}
</style>
