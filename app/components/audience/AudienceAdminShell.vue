<script lang="ts">
export interface AdminNavItem {
  icon: string
  label: string
  /** The page being shown. */
  on?: boolean
  /** A collapsed group (draws the chevron). */
  sub?: boolean
  /** An open group, with its pages listed under it. */
  children?: { label: string, on?: boolean }[]
}
</script>

<script setup lang="ts">
/**
 * The admin console's frame (eventos-admin: layouts/event.vue for an event,
 * core/layouts/default.vue for the exhibitor portal): the white sidebar with
 * its open group, the top bar, and the grey canvas the page goes in.
 *
 * Drawn at the One platform screen's design size; PlatformAudiences scales it.
 * With `cover` the top bar is the event's (cover, name, date, Published);
 * without it, the page's own title and subtitle. With `event` the sidebar head
 * shows the event's logo and name, as an exhibitor's does, instead of EXPOUSE.
 */
defineProps<{
  nav: AdminNavItem[]
  title: string
  subtitle: string
  user: { initials: string, name: string }
  /** Letter on the event cover; switches the top bar to the event's. */
  cover?: string
  /** The event's logo letter and name, for the exhibitor portal's sidebar head. */
  event?: { initial: string, name: string }
  /** The exhibitor portal's language switcher. */
  lang?: boolean
  /** Leave the sidebar out, so the page fills the frame and the menu isn't on show. */
  noSidebar?: boolean
}>()
</script>

<template>
  <div class="shell" :class="{ bare: noSidebar }">
    <aside v-if="!noSidebar" class="sb">
      <div class="sb-head">
        <span v-if="event" class="sb-event"><i>{{ event.initial }}</i><span>{{ event.name.length > 20 ? `${event.name.slice(0, 20)}...` : event.name }}</span></span>
        <AppLogo v-else class="sb-logo" />
        <Icon name="lucide:chevrons-left" class="col" />
      </div>
      <nav class="sb-nav">
        <template v-for="n in nav" :key="n.label">
          <div v-if="n.children" class="grp">
            <span class="it"><Icon :name="n.icon" class="ico" />{{ n.label }}<Icon name="lucide:chevron-up" class="ico chev" /></span>
            <span v-for="c in n.children" :key="c.label" class="kid" :class="{ on: c.on }">{{ c.label }}</span>
          </div>
          <span v-else class="it" :class="{ on: n.on }">
            <Icon :name="n.icon" class="ico" />{{ n.label }}<Icon v-if="n.sub" name="lucide:chevron-down" class="ico chev" />
          </span>
        </template>
      </nav>
    </aside>

    <div class="main">
      <div class="tb">
        <span v-if="cover" class="cover">{{ cover }}</span>
        <div class="tb-name"><b>{{ title }}</b><small>{{ subtitle }}</small></div>
        <div class="tb-r">
          <span v-if="lang" class="lang"><Icon name="lucide:globe" class="ico" />EN<Icon name="lucide:chevron-down" class="ico" /></span>
          <span class="goto">Go to Event</span>
          <span v-if="cover" class="pubd">Published</span>
          <span class="me"><span class="av">{{ user.initials }}</span>{{ user.name }}</span>
        </div>
      </div>

      <div class="content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ico { flex: none; }

.shell {
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr);
  width: 100%;
  height: 100%;
  background: #f5f6f8;
  color: var(--color-ink, #1f2430);
  font-size: 14px;
  line-height: 1.5;
}
.shell.bare { grid-template-columns: minmax(0, 1fr); }

/* ---------- Sidebar ---------- */
.sb { display: flex; flex-direction: column; min-height: 0; overflow: hidden; background: #fff; border-right: 1px solid #e8e8ef; }
.sb-head { height: 60px; flex: none; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 0 16px 0 18px; border-bottom: 1px solid #ebebf0; }
.sb-logo { height: 24px; width: auto; }
.sb-event { display: flex; align-items: center; gap: 9px; min-width: 0; font-size: 16px; font-weight: 800; letter-spacing: -.02em; color: #1a1a2e; white-space: nowrap; overflow: hidden; }
.sb-event span { overflow: hidden; text-overflow: ellipsis; }
.sb-event i { width: 34px; height: 34px; flex: none; display: grid; place-items: center; border-radius: 5px; font-style: normal; font-size: 14px; color: #fff; background: linear-gradient(135deg, #8b7cf6, #3b2fb0); }
.col { width: 20px; height: 20px; color: #64676a; }

/* Full-bleed rows, as in the console; the list runs off the bottom of the crop. */
.sb-nav {
  display: grid; align-content: start; gap: 1px; padding-top: 12px; overflow: hidden;
  mask-image: linear-gradient(#000 82%, transparent); -webkit-mask-image: linear-gradient(#000 82%, transparent);
}
.it { height: 46px; display: flex; align-items: center; gap: 12px; padding: 0 20px; font-size: 14px; font-weight: 600; color: #64676a; white-space: nowrap; }
.it .ico { width: 18px; height: 18px; margin: 0 3px; }
.it .chev { width: 13px; height: 13px; margin: 0 0 0 auto; opacity: .7; }
.it.on { background: #f7f7fb; color: #6452e7; }

/* The open group: tinted, its pages indented under it. */
.grp { display: grid; margin: 4px 0; padding-bottom: 6px; background: #f7f7fb; }
.grp .it { color: #6352e7; }
.kid { padding: 8px 15px 8px 42px; font-size: 14px; font-weight: 600; color: #7a8390; white-space: nowrap; }
.kid.on { color: #6352e7; }

/* ---------- Top bar ---------- */
.main { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.tb { height: 62px; flex: none; display: flex; align-items: center; gap: 12px; padding: 0 24px; background: #fff; border-bottom: 1px solid #e8e8ef; }
.cover { width: 40px; height: 40px; flex: none; display: grid; place-items: center; border-radius: 9px; font-size: 15px; font-weight: 800; color: #fff; background: linear-gradient(135deg, #8b7cf6, #3b2fb0); }
.tb-name { min-width: 0; }
.tb-name b { display: block; font-size: 15px; line-height: 1.3; color: #1a1a2e; }
.tb-name small { display: block; font-size: 11px; line-height: 1.3; color: #9aa0ab; }
.tb-r { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.lang { display: flex; align-items: center; gap: 5px; padding: 6px 9px; font-size: 12.5px; font-weight: 700; color: #4b5160; border: 1px solid var(--color-line, #e8e9ee); border-radius: 8px; }
.lang .ico { width: 14px; height: 14px; color: #9aa0ab; }
.goto { padding: 7px 16px; font-size: 13px; font-weight: 600; color: var(--color-brand, #6452E7 ); background: #fff; border: 1.5px solid #d0caff; border-radius: 8px; }
.pubd { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: #15803d; }
.pubd::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
.me { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; white-space: nowrap; }
.av { width: 34px; height: 34px; flex: none; display: grid; place-items: center; border-radius: 50%; font-size: 12px; font-weight: 800; color: var(--color-brand-dark, #4f46e5); background: #eef2ff; }

.content { flex: 1; min-height: 0; overflow: hidden; padding: 22px 28px; }

/* Phones: the page without the sidebar, as the console shows it on a narrow screen. */
@media (max-width: 640px) {
  .shell { grid-template-columns: minmax(0, 1fr); }
  .sb, .goto, .lang, .me { display: none; }
  .tb { padding: 0 18px; }
  .content { padding: 18px; }
}
</style>
