<script setup lang="ts">
/**
 * The organizer's screen for the One platform section: the event's
 * Analytics › Overview page in the admin console (eventos-admin
 * event/pages/org/events/[id]/analytics/overview.vue), on its 30-day range.
 * The sidebar is left out, so the full menu isn't on show.
 *
 * Sample numbers, shared with the hero: 18,204 registered in total, of whom
 * 4,812 in the last 30 days (the bars add up to it, by role too).
 */
import type { AdminNavItem } from './AudienceAdminShell.vue'

const NAV: AdminNavItem[] = [
  { icon: 'lucide:users', label: 'Users', sub: true },
  { icon: 'lucide:scan-line', label: 'ExpoLens', sub: true },
  { icon: 'lucide:book-open', label: 'Website', sub: true },
  { icon: 'lucide:map', label: 'Floor Plan' },
  {
    icon: 'lucide:chart-pie',
    label: 'Analytics',
    children: [{ label: 'Overview', on: true }, { label: 'Engagement' }, { label: 'Sessions & Lounges' }, { label: 'Lead Scoring' }, { label: 'Website' }],
  },
  { icon: 'lucide:smartphone', label: 'Mobile App', sub: true },
]

const RANGES = ['Today', '7 days', '30 days', '90 days']

const KPIS = [
  { label: 'Registrations', n: '4,812', sub: '18,204 registered in total' },
  { label: 'Checked in', n: '3,206', sub: '67% of registered attendees' },
  { label: 'Active users', n: '2,941', sub: '61% of registrations' },
  { label: 'Exhibitors', n: '148', sub: '1,284 leads in the last 30 days' },
  { label: 'Meetings', n: '926', sub: '3,410 connections' },
]

/** New registrations per day, 6 Sep – 5 Oct (4,812 in all). */
const TREND = [46, 60, 55, 69, 66, 80, 74, 88, 103, 96, 112, 105, 126, 134, 120, 148, 159, 146, 172, 188, 180, 204, 222, 213, 246, 270, 257, 304, 349, 420]
const PEAK = Math.max(...TREND)

const ROLES = [
  { label: 'Visitor', count: '3,104', share: 65 },
  { label: 'Exhibitor', count: '842', share: 17 },
  { label: 'VIP', count: '388', share: 8 },
  { label: 'Media', count: '291', share: 6 },
  { label: 'Speaker', count: '187', share: 4 },
]
</script>

<template>
  <AudienceAdminShell
    :nav="NAV"
    cover="E"
    title="Event name"
    subtitle="Mon, Oct 5, 2026"
    no-sidebar
    :user="{ initials: 'SA', name: 'Sara Ahmed' }"
  >
    <div class="head">
      <div class="head-l">
        <h2>Event Overview</h2>
        <p>Everything happening across your event, at a glance.</p>
      </div>
      <div class="ranges">
        <span v-for="r in RANGES" :key="r" class="range" :class="{ on: r === '30 days' }">{{ r }}</span>
        <small>Updated just now</small>
        <span class="range">Refresh</span>
      </div>
    </div>

    <div class="kpis">
      <div v-for="k in KPIS" :key="k.label" class="card stat">
        <div class="stat-label">{{ k.label }}</div>
        <div class="stat-n">{{ k.n }}</div>
        <div class="stat-sub">{{ k.sub }}</div>
      </div>
    </div>

    <div class="row">
      <div class="card trend">
        <div class="card-t">New registrations</div>
        <div class="card-s">4,812 attendees in the last 30 days</div>
        <div class="bars">
          <div v-for="(v, i) in TREND" :key="i" class="bar-col">
            <div class="bar" :style="{ height: `${Math.round(v / PEAK * 100)}%`, '--i': i }" />
          </div>
        </div>
        <div class="foot"><span>Sep 6</span><span>Peak {{ PEAK }} / day</span><span>Oct 5</span></div>
      </div>

      <div class="card aud">
        <div class="aud-h"><span class="card-t">Audience</span><span class="chip">30 days</span></div>
        <div class="card-s">4,812 people registered in the last 30 days, all roles</div>
        <div v-for="r in ROLES" :key="r.label" class="role">
          <div class="role-h"><b>{{ r.label }}</b><span>{{ r.count }} · {{ r.share }}%</span></div>
          <div class="track"><div class="fill" :style="{ width: `${r.share}%` }" /></div>
        </div>
      </div>
    </div>
  </AudienceAdminShell>
</template>

<style scoped>
/* Sizes and colours from the page (overview.vue) and the console's main.css. */
.head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.head h2 { margin: 0; font-size: 18.4px; font-weight: 700; line-height: 1.3; }
.head p { margin: 2px 0 0; font-size: 13.8px; color: var(--color-muted, #6b7280); }
.ranges { display: flex; align-items: center; gap: 6px; }
.ranges small { margin: 0 2px 0 8px; font-size: 12.5px; color: var(--color-muted, #6b7280); white-space: nowrap; }
.range { padding: 6px 12px; font-size: 13px; color: var(--color-muted, #6b7280); background: #fff; border: 1px solid #e5e7ef; border-radius: 8px; white-space: nowrap; }
.range.on { font-weight: 600; color: #6352e7; border-color: #6352e7; }

.card { min-width: 0; padding: 16px; background: #fff; border: 1px solid var(--color-line, #e8e9ee); border-radius: 12px; }

.kpis { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
.stat-label { font-size: 12.5px; font-weight: 500; letter-spacing: .04em; text-transform: uppercase; color: var(--color-muted, #6b7280); }
.stat-n { margin-top: 4px; font-size: 25.6px; font-weight: 700; line-height: 1; }
.stat-sub { margin-top: 6px; font-size: 12.5px; line-height: 1.35; color: var(--color-muted, #6b7280); }

.row { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.card-t { font-size: 15.7px; font-weight: 700; }
.card-s { margin-bottom: 12px; font-size: 12.5px; color: var(--color-muted, #6b7280); }

.bars { display: flex; align-items: flex-end; gap: 2px; height: 150px; }
.bar-col { flex: 1; min-width: 0; height: 100%; display: flex; align-items: flex-end; justify-content: center; }
.bar { width: 100%; max-width: 18px; min-height: 2px; background: #6352e7; border-radius: 4px 4px 0 0; }
.foot { display: flex; justify-content: space-between; margin-top: 8px; font-size: 11.5px; color: var(--color-muted, #6b7280); }

.aud-h { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
.chip { padding: 1px 7px; font-size: 10.9px; font-weight: 600; color: #6352e7; background: #f1f0fd; border-radius: 999px; }
.role { margin-bottom: 10px; }
.role-h { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13.8px; }
.role-h b { font-weight: 600; }
.role-h span { color: var(--color-muted, #6b7280); }
.track { height: 8px; overflow: hidden; background: #f1f1f5; border-radius: 999px; }
.fill { height: 100%; background: #6352e7; border-radius: 999px; }

/* The bars grow in when the screen comes in. */
.bar { transform-origin: 50% 100%; animation: au-grow .8s cubic-bezier(.22, .8, .24, 1) both; animation-delay: calc(.1s + var(--i, 0) * 18ms); }
@keyframes au-grow { from { transform: scaleY(0); } }

@media (max-width: 640px) {
  .head { flex-direction: column; }
  .ranges small, .ranges .range:last-child { display: none; }
  .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .stat:nth-child(n + 5) { display: none; }
  .row { grid-template-columns: minmax(0, 1fr); }
  .aud { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .bar { animation: none; }
}
</style>
