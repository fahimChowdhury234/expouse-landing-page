<script setup lang="ts">
/**
 * The attendee web app's top bar (eventos-event components/event/EventHeader.vue)
 * for the sample event: logo and name, the event's tabs with an icon over each
 * label, and the alerts, bookmarks and profile on the right. `active` is the
 * tab of the page under it. On phones it is the app's narrow bar: menu, logo,
 * profile.
 */
defineProps<{ active: string, initials: string }>()

const TABS = [
  { icon: 'lucide:house', label: 'Reception' },
  { icon: 'lucide:newspaper', label: 'Event Feed' },
  { icon: 'lucide:calendar-days', label: 'Sessions' },
  { icon: 'lucide:mic', label: 'Speakers' },
  { icon: 'lucide:users-round', label: 'Delegates' },
  { icon: 'lucide:calendar-check', label: 'Meetings' },
  { icon: 'lucide:armchair', label: 'Lounge' },
  { icon: 'lucide:store', label: 'Exhibitors' },
]
</script>

<template>
  <header class="eh">
    <Icon name="lucide:menu" class="ico menu" />
    <span class="logo"><i>E</i><b>Event name</b></span>
    <nav class="tabs">
      <span v-for="t in TABS" :key="t.label" class="tab" :class="{ on: t.label === active }">
        <Icon :name="t.icon" class="ico" />{{ t.label }}
      </span>
    </nav>
    <div class="utils">
      <Icon name="lucide:bell" class="ico" />
      <Icon name="lucide:bookmark" class="ico" />
      <Icon name="lucide:briefcase" class="ico" />
      <span class="avatar">{{ initials }}</span>
    </div>
  </header>
</template>

<style scoped>
/* Sizes and colours from EventHeader.vue, with the event's brand as --brand-primary. */
/* Sticky in the app: kept above the page when a screen shows it scrolled. */
.eh { position: relative; z-index: 2; display: flex; align-items: center; gap: 10px; padding: 0 16px; background: #fff; border-bottom: 1px solid #e6e8ec; box-shadow: 0 1px 2px rgba(15, 23, 42, .03); }
.ico { flex: none; }
.menu { display: none; width: 24px; height: 24px; color: #334155; }

.logo { display: flex; align-items: center; gap: 10px; flex: none; max-width: 220px; }
.logo i { width: 36px; height: 36px; flex: none; display: grid; place-items: center; font-size: 14px; font-style: normal; font-weight: 800; color: #fff; background: linear-gradient(135deg, #8b7cf6, #3b2fb0); border-radius: 6px; }
.logo b { overflow: hidden; font-size: 13px; font-weight: 700; line-height: 1.25; color: #334155; text-overflow: ellipsis; white-space: nowrap; }

.tabs { flex: 1; display: flex; justify-content: center; gap: 2px; }
.tab { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 66px; padding: 14px 12px 12px; font-size: 10.5px; font-weight: 600; letter-spacing: .2px; color: #94a3b8; white-space: nowrap; border-bottom: 2px solid transparent; }
.tab .ico { width: 20px; height: 20px; }
.tab.on { color: var(--brand-primary, #6452E7 ); border-bottom-color: var(--brand-primary, #6452E7 ); }

.utils { display: flex; align-items: center; gap: 22px; flex: none; }
.utils .ico { width: 22px; height: 22px; color: var(--brand-primary, #6452E7 ); }
.avatar { width: 36px; height: 36px; display: grid; place-items: center; font-size: 13.5px; font-weight: 600; color: #fff; background: var(--brand-primary, #6452E7 ); border-radius: 8px; }

@media (max-width: 640px) {
  .eh { height: 60px; gap: 12px; }
  .menu { display: block; }
  .tabs, .utils .ico { display: none; }
  .logo { flex: 1; max-width: none; }
  .utils { margin-left: auto; }
}
</style>
