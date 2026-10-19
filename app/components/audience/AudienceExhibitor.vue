<script setup lang="ts">
/**
 * The exhibitor's screen for the One platform section: the exhibitor portal's
 * Leads page (eventos-admin exhibitor/pages/exhibitor/leads/index.vue) for a
 * booth at the sample event. The portal's sidebar is left out, so the full menu
 * isn't on show. Omar Saleh is the hot lead from the hero's card.
 *
 * Every person and company here is fictional sample data.
 */
import type { AdminNavItem } from './AudienceAdminShell.vue'

const NAV: AdminNavItem[] = [
  { icon: 'lucide:store', label: 'Company Profile' },
  { icon: 'lucide:users', label: 'Team Members' },
  { icon: 'lucide:box', label: 'Products' },
  { icon: 'lucide:clipboard-list', label: 'Documents' },
  { icon: 'lucide:layers', label: 'Projects' },
  {
    icon: 'lucide:target',
    label: 'Leads',
    children: [{ label: 'All Leads', on: true }, { label: 'Team Connections' }, { label: 'Recommended Leads' }, { label: 'Lead Qualification' }],
  },
]

const STATS = [
  { label: 'Total', icon: 'lucide:users', n: 312, sub: 'All leads' },
  { label: 'Hot', dot: '#ef4444', n: 86, sub: '28% of total' },
  { label: 'Warm', dot: '#f59e0b', n: 142, sub: '46% of total' },
  { label: 'Cold', dot: '#3b82f6', n: 84, sub: '27% of total' },
  { label: 'Contacted', icon: 'lucide:award', n: 118, sub: '38% follow-up' },
  { label: 'Recently Exported', icon: 'lucide:download', n: 64, sub: 'in last 7 days' },
]

const COLUMNS = ['Leads', 'Company', 'Rating', 'Stars', 'Engagement', 'Status', 'Scanned by']

const LEADS = [
  { name: 'Omar Saleh', initials: 'OS', email: 'omar.saleh@buildmart.om', source: 'scan', company: 'BuildMart Oman', rating: 'hot', stars: 4, score: 92, status: 'Connected', by: 'Layla Haddad', time: '11:42 AM' },
  { name: 'Mariam Al Balushi', initials: 'MA', email: 'mariam@alnoorinteriors.om', source: 'connect', company: 'Al Noor Interiors', rating: 'warm', stars: 3, score: 74, status: 'Pending', by: 'Layla Haddad', time: '11:15 AM' },
  { name: 'Khalid Al Rawahi', initials: 'KA', email: 'khalid@timesofoman.com', source: 'scan', company: 'Times of Oman', rating: 'cold', stars: 2, score: 41, status: 'Pending', by: 'Yousef Amin', time: '10:58 AM' },
  { name: 'Sara Ali', initials: 'SA', email: 'sara.ali@fleetly.io', source: 'scan', company: 'Fleetly', rating: 'warm', stars: 3, score: 68, status: 'Connected', by: 'Yousef Amin', time: '10:31 AM' },
]

const SOURCE: Record<string, string> = { scan: 'Badge Scan', connect: 'Shared Details' }
const RATING: Record<string, string> = { hot: 'Hot', warm: 'Warm', cold: 'Cold' }
</script>

<template>
  <AudienceAdminShell
    :nav="NAV"
    :event="{ initial: 'E', name: 'Event name' }"
    title="Leads"
    subtitle="View and manage your leads."
    lang
    no-sidebar
    :user="{ initials: 'LH', name: 'Layla Haddad' }"
  >
    <div class="stats">
      <div v-for="s in STATS" :key="s.label" class="stat-card">
        <div class="stat-l">
          <Icon v-if="s.icon" :name="s.icon" class="ico" />
          <span v-else class="dot" :style="{ background: s.dot }" />
          <span>{{ s.label }}</span>
        </div>
        <div class="stat-n">{{ s.n }}</div>
        <div class="stat-sub">{{ s.sub }}</div>
      </div>
    </div>

    <div class="card">
      <div class="toolbar">
        <span class="search"><Icon name="lucide:search" class="ico" />Search leads</span>
        <span class="grow" />
        <span class="fpill"><span>Rating:</span> All<Icon name="lucide:chevron-down" class="ico" /></span>
        <span class="fpill"><span>Status:</span> All<Icon name="lucide:chevron-down" class="ico" /></span>
        <span class="fpill"><span>Rep:</span> All<Icon name="lucide:chevron-down" class="ico" /></span>
        <span class="btn"><Icon name="lucide:download" class="ico" />Export</span>
      </div>

      <div class="dt">
        <div class="tr th">
          <span><i class="cbx" /></span>
          <span v-for="c in COLUMNS" :key="c">{{ c }}</span>
        </div>
        <div v-for="l in LEADS" :key="l.name" class="tr">
          <span><i class="cbx" /></span>
          <span class="who">
            <span class="avatar">{{ l.initials }}</span>
            <span class="who-t">
              <b>{{ l.name }}</b>
              <small>{{ l.email }}</small>
              <em class="source" :class="`source-${l.source}`">{{ SOURCE[l.source] }}</em>
            </span>
          </span>
          <span class="co">{{ l.company }}</span>
          <span><span class="pill" :class="`pill-${l.rating}`">{{ RATING[l.rating] }}<Icon name="lucide:chevron-down" class="ico" /></span></span>
          <span class="stars"><i v-for="n in 5" :key="n" :class="{ on: l.stars >= n }">★</i></span>
          <span class="score"><b>{{ l.score }}</b><small>{{ l.rating }}</small></span>
          <span><span class="pill" :class="l.status === 'Pending' ? 'pill-pending' : 'pill-connected'">{{ l.status }}<Icon name="lucide:chevron-down" class="ico" /></span></span>
          <span class="by"><b>{{ l.by }}</b><small>Oct 5, 2026</small><small>{{ l.time }}</small></span>
        </div>
      </div>
    </div>
  </AudienceAdminShell>
</template>

<style scoped>
/* Sizes and colours from the page (leads/index.vue) and the console's main.css. */
.ico { flex: none; }

.stats { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }
.stat-card { min-width: 0; padding: 14px 16px; background: #fff; border: 1px solid var(--color-line, #e8e9ee); border-radius: 12px; }
.stat-l { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--color-muted, #6b7280); white-space: nowrap; }
.stat-l span:last-child { overflow: hidden; text-overflow: ellipsis; }
.stat-l .ico { width: 14px; height: 14px; }
.dot { width: 8px; height: 8px; flex: none; border-radius: 50%; }
.stat-n { margin-top: 8px; font-size: 24px; font-weight: 800; line-height: 1; }
.stat-sub { margin-top: 4px; font-size: 12px; color: var(--color-muted, #6b7280); white-space: nowrap; }

.card { padding: 20px; background: #fff; border: 1px solid var(--color-line, #e8e9ee); border-radius: 12px; }

.toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.search { width: 280px; height: 40px; display: flex; align-items: center; gap: 8px; padding: 0 12px; font-size: 14px; color: var(--color-faint, #9aa1ad); border: 1px solid var(--color-line, #e8e9ee); border-radius: 8px; }
.search .ico { width: 16px; height: 16px; }
.grow { flex: 1; }
.fpill { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; font-size: 13.6px; font-weight: 550; background: #fff; border: 1px solid var(--color-line, #e8e9ee); border-radius: 8px; white-space: nowrap; }
.fpill span { color: var(--color-muted, #6b7280); }
.fpill .ico { width: 12px; height: 12px; }
.btn { display: inline-flex; align-items: center; gap: 7px; padding: 10px 16px; font-size: 14.7px; font-weight: 650; line-height: 1; color: #fff; background: var(--color-brand, #6452E7 ); border-radius: 8px; }
.btn .ico { width: 14px; height: 14px; }

/* DataTable: header on #f7f8fa, rows split by hairlines. */
.dt { overflow: hidden; border: 1px solid #d1d2de; border-radius: 8px; }
.tr { display: grid; grid-template-columns: 36px minmax(0, 1.9fr) minmax(0, 1.1fr) minmax(0, .8fr) minmax(0, .85fr) minmax(0, .8fr) minmax(0, 1fr) minmax(0, 1fr); align-items: center; column-gap: 12px; padding: 8px 20px; }
.tr + .tr { border-top: 1px solid var(--color-line, #e8e9ee); }
.th { padding-block: 12px; font-size: 11.2px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--color-muted, #6b7280); background: #f7f8fa; }
.cbx { display: block; width: 16px; height: 16px; border: 1.5px solid #c9cdd6; border-radius: 4px; }

.who { display: flex; align-items: center; gap: 10px; min-width: 0; }
.avatar { width: 32px; height: 32px; flex: none; display: grid; place-items: center; font-size: 11.5px; font-weight: 700; color: var(--color-brand-dark, #4f46e5); background: #eef2ff; border-radius: 50%; }
.who-t { display: grid; justify-items: start; min-width: 0; }
.who-t b { max-width: 100%; overflow: hidden; font-size: 14.4px; font-weight: 600; line-height: 1.4; text-overflow: ellipsis; white-space: nowrap; }
.who-t small { max-width: 100%; overflow: hidden; font-size: 12.5px; line-height: 1.4; color: var(--color-muted, #6b7280); text-overflow: ellipsis; white-space: nowrap; }
.source { margin-top: 3px; padding: 1px 7px; font-size: 10.6px; font-style: normal; font-weight: 700; letter-spacing: .02em; border-radius: 999px; }
.source-scan { color: #0369a1; background: #e0f2fe; }
.source-connect { color: #6d28d9; background: #ede9fe; }
.co { font-size: 14px; }

.pill { position: relative; display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; font-size: 12.5px; font-weight: 600; white-space: nowrap; border-radius: 999px; }
.pill .ico { width: 11px; height: 11px; opacity: .7; }
.pill-hot { color: #b91c1c; background: #fee2e2; }
.pill-warm { color: #b45309; background: #fef3c7; }
.pill-cold { color: #1d4ed8; background: #dbeafe; }
.pill-connected { color: #15803d; background: #dcfce7; }
.pill-pending { color: #4b5563; background: #f3f4f6; }

.stars { display: inline-flex; gap: 1px; }
.stars i { font-size: 16px; font-style: normal; line-height: 1; color: #d1d5db; }
.stars i.on { color: #2563eb; }
.score { display: grid; }
.score b { font-size: 14px; font-weight: 600; }
.score small { font-size: 11.5px; color: var(--color-muted, #6b7280); text-transform: uppercase; }
.by { display: grid; line-height: 1.35; }
.by b { font-size: 13.4px; font-weight: 400; }
.by small { font-size: 12.2px; color: var(--color-muted, #6b7280); }

@media (max-width: 640px) {
  .stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .fpill, .grow { display: none; }
  .search { flex: 1; width: auto; }
  .tr { grid-template-columns: 24px minmax(0, 1fr) auto auto; padding-inline: 14px; }
  .tr > :nth-child(3), .tr > :nth-child(5), .tr > :nth-child(6), .tr > :nth-child(8) { display: none; }
}
</style>
