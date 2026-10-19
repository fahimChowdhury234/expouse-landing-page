<script setup lang="ts">
/**
 * One screen of the attendee app, in a phone frame (Figma: Mobile apps).
 *
 * - delegates: search and the people grid; a card with no photo shows the product's
 *   letter avatar (utils/letterAvatar); hover (or tap) a card for Add Note / Connect
 * - home: the app's home feed, top to bottom: greeting, photo banners, the event,
 *   featured sessions / speakers / exhibitors (swipe sideways), a video, meetings,
 *   the leaderboard and a sponsor banner
 * - badge: the attendee's digital badge, the same card the badge designer makes
 *
 * `event` swaps in another sample event; `branded` shows the event's own logo in
 * the header instead of EXPOUSE (a white-label app). Colours follow
 * --color-brand / --color-brand-soft, so a parent can re-theme the whole screen.
 *
 * With `interactive` it is a live screen: the body scrolls, the banners swipe,
 * search filters the delegates, bookmarks toggle, "More details" opens, Download
 * confirms, and the tab bar emits `navigate` for the screens drawn here (taps
 * with nowhere to go show a short toast, as the app would open them). Add Note
 * opens a note sheet; Connect goes Pending, then Connected with a push banner;
 * the bell opens the notifications list.
 * `autoScroll` (on a live screen) shows that it scrolls: the body glides down to
 * its end and back up, once each time it turns true (Delegates first plays a
 * connect on one card, Home first gets a session reminder push); any wheel,
 * touch or click in the body stops it.
 *
 * Every person and event here is fictional sample data, shared with the rest of the page.
 */
import { BADGE_ROLES } from '~/utils/badges'
import { SAMPLE_EVENTS, type SampleEvent } from '~/utils/events'
import { letterAvatar } from '~/utils/letterAvatar'

type Screen = 'delegates' | 'home' | 'badge'

const props = withDefaults(defineProps<{
  screen: Screen
  time?: string
  event?: SampleEvent
  branded?: boolean
  interactive?: boolean
  autoScroll?: boolean
}>(), { time: '12:30', event: () => SAMPLE_EVENTS[0]!, branded: false, interactive: false, autoScroll: false })

const emit = defineEmits<{ navigate: [screen: Screen] }>()

const NAV = [
  { icon: 'lucide:house', label: 'Reception' },
  { icon: 'lucide:newspaper', label: 'Feed' },
  { icon: 'lucide:calendar-days', label: 'Sessions' },
  { icon: 'lucide:users-round', label: 'Delegates' },
  { icon: 'lucide:ellipsis', label: 'More' },
]
const ACTIVE_TAB = { delegates: 3, home: 0, badge: 4 } as const
/** Where each tab goes; null = not drawn here, so it shows a toast. */
const TAB_TO: (Screen | null)[] = ['home', null, null, 'delegates', 'badge']

const STRIP_ICONS = [
  { icon: 'lucide:trophy', label: 'Leaderboard' },
]

/** Nobody here has a photo, so every card shows its letter avatar, as the app does. */
const DELEGATES = [
  { name: 'Omar Saleh', company: 'Northwind Group', online: true },
  { name: 'Sara Ali', company: 'Fleetly', online: true },
  { name: 'Fatma Al Sawafi', company: 'Al Noor Interiors', online: false },
  { name: 'Hassan Al Busaidi', company: 'Vertex Solutions', online: false },
  { name: 'سالم الحارثي', company: 'Atlas Holdings', online: true },
  { name: 'Mariam Al Hinai', company: 'Halcyon Institute', online: false },
  { name: 'Nadia Rahman', company: 'Meridian Studio', online: true },
  { name: 'Daniel Carter', company: 'Crestline Homes', online: false },
].map(d => ({ ...d, letter: letterAvatar(d.name) }))

type Delegate = (typeof DELEGATES)[number]

const IMG = (n: number) => `/images/gallery/event-${n}.webp`

/** Photo banners after the event's own banner. */
const BANNERS = [
  { img: IMG(7), kicker: '3 HALLS · 300+ BOOTHS', title: 'Meet the exhibitors' },
  { img: IMG(5), kicker: 'DAILY · 10 AM – 6 PM', title: 'Talks on three stages' },
]

const SESSIONS = [
  { time: '10:00 – 11:00 AM', status: 'Live', img: IMG(1), title: 'Opening Ceremony', text: 'Welcome address and the official opening of the expo.', room: 'Main Hall · Stage A', speakers: [0, 1] },
  { time: '11:30 AM – 12:30 PM', status: 'Upcoming', img: IMG(2), title: 'Panel: Building smarter homes', text: 'How connected design is changing new housing.', room: 'Hall B · Forum', speakers: [2, 3, 1] },
  { time: '2:00 – 3:00 PM', status: 'Upcoming', img: IMG(6), title: 'Workshop: Sustainable materials', text: 'Hands-on look at low-carbon materials for homes.', room: 'Room 3', speakers: [3] },
]

const SPEAKERS = [
  { name: 'Dr. Sarah Mitchell', role: 'Head of Research', org: 'Halcyon Institute', tone: 1 },
  { name: 'James Whitmore', role: 'Chief Executive', org: 'Atlas Holdings', tone: 0 },
  { name: 'Ahmed Nasser', role: 'Chief Architect', org: 'Vertex Solutions', tone: 3 },
  { name: 'Emily Clarke', role: 'Director', org: 'Northwind Group', tone: 2 },
  { name: 'Omar Haddad', role: 'Urban Planner', org: 'Meridian Studio', tone: 0 },
]

const EXHIBITORS = [
  { name: 'Northwind Group', logo: '/images/northwind.png', booth: 'A-12' },
  { name: 'Vertex Solutions', logo: '/images/vertex.png', booth: 'B-04' },
  { name: 'Atlas & Co', logo: '/images/atlasco.png', booth: 'B-21' },
  { name: 'Halcyon', logo: '/images/halcyon.png', booth: 'C-08' },
]

const LEADERS = [
  { rank: 2, name: 'Daniel Carter', pts: 560, tone: 2 },
  { rank: 1, name: 'Sara Ali', pts: 633, tone: 1 },
  { rank: 3, name: 'Priya Sharma', pts: 485, tone: 3 },
]

/** The visitor badge from the badge designer. */
const visitor = BADGE_ROLES[0]!

/* ---------------- Live screen state ---------------- */
const query = ref('')
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? DELEGATES.filter(d => `${d.name} ${d.company}`.toLowerCase().includes(q)) : DELEGATES
})
const saved = ref(new Set<string>())
function toggleSave(key: string) {
  const next = new Set(saved.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  saved.value = next
}
/* ---------------- Delegate cards: Add Note / Connect ---------------- */
/** The card showing its actions: hovered on a desktop, tapped on a phone, or opened by the demo. */
const openCard = ref<string | null>(null)
const conn = ref<Record<string, 'pending' | 'connected'>>({})
const notes = ref<Record<string, string>>({})
const noteFor = ref<string | null>(null)
const noteDraft = ref('')
const NOTE_CHIPS = ['Interested in a demo', 'Follow up after the show', 'Send the price list']

function tapCard(d: Delegate) {
  openCard.value = openCard.value === d.name ? null : d.name
}
function openNote(d: Delegate) {
  noteFor.value = d.name
  noteDraft.value = notes.value[d.name] ?? ''
}
function addChip(text: string) {
  noteDraft.value = noteDraft.value.trim() ? `${noteDraft.value.trim()}. ${text}` : text
}
function saveNote() {
  if (!noteFor.value) return
  notes.value = { ...notes.value, [noteFor.value]: noteDraft.value.trim() }
  noteFor.value = null
  say('Note saved · only you can see it')
}
function connect(d: Delegate) {
  const state = conn.value[d.name]
  if (state === 'connected') return say(`Chat with ${first(d.name)} opened`)
  if (state === 'pending') return say('Request already sent')
  conn.value = { ...conn.value, [d.name]: 'pending' }
  say(`Request sent to ${first(d.name)}`)
  setTimeout(() => {
    conn.value = { ...conn.value, [d.name]: 'connected' }
    push({ icon: 'lucide:user-check', title: 'Connection accepted', text: `${d.name} accepted your request. Say hello!` })
  }, 1800)
}

/* ---------------- Notifications: the bell's list, and push banners ---------------- */
interface Note { id: number, icon: string, title: string, text: string, time: string, unread: boolean }
let noteId = 0
const notifs = ref<Note[]>([
  { id: ++noteId, icon: 'lucide:message-circle', title: 'New message', text: 'Sara Ali: See you at the Vertex booth at 3?', time: '5m', unread: true },
  { id: ++noteId, icon: 'lucide:calendar-clock', title: 'Saved session', text: 'Opening Ceremony is live in Main Hall', time: '12m', unread: true },
  { id: ++noteId, icon: 'lucide:trophy', title: 'You earned 20 points', text: 'For visiting 3 booths. You\'re #24 now.', time: '1h', unread: false },
  { id: ++noteId, icon: 'lucide:calendar-check', title: 'Meeting confirmed', text: 'Daniel Carter · 11:30 AM · Table 12', time: '2h', unread: false },
])
const unread = computed(() => notifs.value.filter(n => n.unread).length)
const panelOpen = ref(false)
const banner = ref<Note | null>(null)
let bannerTimer: ReturnType<typeof setTimeout> | null = null

function push(n: { icon: string, title: string, text: string }) {
  const note = { ...n, id: ++noteId, time: 'now', unread: true }
  notifs.value = [note, ...notifs.value]
  banner.value = note
  if (bannerTimer) clearTimeout(bannerTimer)
  bannerTimer = setTimeout(() => { banner.value = null }, 3200)
}
function openBanner() {
  banner.value = null
  onBell()
}
const lang = ref<'EN' | 'AR'>('EN')
function onLang() {
  lang.value = lang.value === 'EN' ? 'AR' : 'EN'
  say(lang.value === 'AR' ? 'Language: العربية' : 'Language: English')
}
const playing = ref(false)
const moreOpen = ref(false)
const downloaded = ref(false)

const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null
function say(text: string) {
  toast.value = text
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 1800)
}
onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer)
  if (bannerTimer) clearTimeout(bannerTimer)
})

function onTab(i: number) {
  const to = TAB_TO[i]
  if (to) emit('navigate', to)
  else say(`${NAV[i]!.label} opens in the app`)
}
function onBell() {
  panelOpen.value = !panelOpen.value
  if (panelOpen.value) notifs.value = notifs.value.map(n => ({ ...n, unread: false }))
}
function onDownload() {
  downloaded.value = true
  say('Badge saved to Photos')
  setTimeout(() => { downloaded.value = false }, 2500)
}
const first = (name: string) => name.split(' ')[0]

/* ---------------- Auto-scroll: show that the screen scrolls ---------------- */
const bodyEl = ref<HTMLElement | null>(null)
/** Bumped to cancel a running glide. */
let run = 0
let frame = 0

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

function glide(el: HTMLElement, to: number, ms: number, id: number) {
  return new Promise<void>((done) => {
    const from = el.scrollTop
    const start = performance.now()
    const step = (now: number) => {
      if (id !== run) return done()
      const t = Math.min(1, (now - start) / ms)
      el.scrollTop = from + (to - from) * ease(t)
      if (t < 1) frame = requestAnimationFrame(step)
      else done()
    }
    frame = requestAnimationFrame(step)
  })
}

/** The card the demo opened, folded again if the demo is cut short. */
let demoCard: string | null = null

async function tour() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const id = ++run
  await wait(900) // let the phone settle in front first
  if (id !== run) return

  // A short scene first: Delegates connects with someone; Home gets a session reminder.
  if (props.screen === 'delegates') {
    const d = DELEGATES.find(x => !conn.value[x.name])
    if (d) {
      openCard.value = demoCard = d.name
      await wait(1000)
      if (id !== run) return
      connect(d)
      await wait(2600)
      if (id !== run) return
      openCard.value = demoCard = null
    }
  }
  else if (props.screen === 'home') {
    setTimeout(() => {
      if (id === run) push({ icon: 'lucide:calendar-clock', title: 'Starting in 15 min', text: 'Panel: Building smarter homes · Hall B' })
    }, 500)
  }

  const el = bodyEl.value
  if (id !== run || !el) return
  const end = el.scrollHeight - el.clientHeight
  if (end <= 0) return
  // Same reading pace whatever the length: about 0.28px a millisecond down, quicker back up.
  await glide(el, end, Math.min(5200, Math.max(1500, end * 3.6)), id)
  await wait(700)
  if (id === run) await glide(el, 0, 1400, id)
}

function stopTour() {
  run++
  cancelAnimationFrame(frame)
  if (demoCard && openCard.value === demoCard) openCard.value = null
  demoCard = null
}

watch(() => props.interactive && props.autoScroll, on => (on ? tour() : stopTour()))
// Leaving the front: fold everything away, so a side phone is only the picture.
watch(() => props.interactive, (on) => {
  if (on) return
  panelOpen.value = false
  noteFor.value = null
  openCard.value = null
  banner.value = null
})
onMounted(() => {
  if (props.interactive && props.autoScroll) tour()
})
onBeforeUnmount(stopTour)
</script>

<template>
  <PhoneFrame :time="time" :nav="NAV" :active="ACTIVE_TAB[props.screen]" :interactive="interactive" @tab="onTab">
    <!-- App header: menu, event app logo, profile; then the section strip -->
    <header class="ah">
      <div class="ah-top">
        <Icon name="lucide:menu" class="ico menu" />
        <span v-if="branded" class="brandmark"><i>{{ event.initial }}</i>{{ event.app }}</span>
        <AppLogo v-else light class="logo" />
        <PhoneAvatar :tone="3" round class="me" />
      </div>
      <div class="ah-strip">
        <template v-if="screen === 'badge'">
          <component :is="interactive ? 'button' : 'span'" :type="interactive ? 'button' : undefined" class="back" @click="interactive && emit('navigate', 'home')">
            <Icon name="lucide:arrow-left" class="ico" />My Badge
          </component>
        </template>
        <template v-else>
          <span>{{ screen === 'delegates' ? 'Delegates' : 'Home' }}</span>
          <span v-if="interactive" class="icons">
            <button v-for="ic in STRIP_ICONS" :key="ic.icon" type="button" class="ib" :aria-label="ic.label" @click="say(`${ic.label} opens in the app`)">
              <Icon :name="ic.icon" class="ico" />
            </button>
            <button type="button" class="ib bell" :aria-label="`Notifications, ${unread} new`" @click="onBell">
              <Icon name="lucide:bell" class="ico" /><i v-if="unread">{{ unread }}</i>
            </button>
            <button type="button" class="ib" aria-label="Messages" @click="say('Messages open in the app')">
              <Icon name="lucide:message-circle" class="ico" />
            </button>
            <button type="button" class="ib lang" :aria-label="`Language, ${lang === 'EN' ? 'English' : 'Arabic'}`" @click="onLang">
              <Icon name="lucide:globe" class="ico" />{{ lang }}<Icon name="lucide:chevron-down" class="ico chev" />
            </button>
          </span>
          <span v-else class="icons">
            <Icon v-for="ic in STRIP_ICONS" :key="ic.icon" :name="ic.icon" class="ico" />
            <span class="bell"><Icon name="lucide:bell" class="ico" /><i>2</i></span>
            <Icon name="lucide:message-circle" class="ico" />
            <span class="lang"><Icon name="lucide:globe" class="ico" />EN<Icon name="lucide:chevron-down" class="ico chev" /></span>
          </span>
        </template>
      </div>
    </header>

    <!-- Delegates -->
    <div v-if="screen === 'delegates'" ref="bodyEl" class="body" :class="{ live: interactive }" @wheel.passive="stopTour" @touchstart.passive="stopTour" @pointerdown="stopTour">
      <div class="search-row">
        <label v-if="interactive" class="search">
          <Icon name="lucide:search" class="ico" />
          <input v-model="query" type="search" placeholder="Search..." aria-label="Search delegates">
        </label>
        <span v-else class="search"><Icon name="lucide:search" class="ico" />Search...</span>
        <span class="filter"><Icon name="lucide:sliders-horizontal" class="ico" /></span>
      </div>
      <div class="dgrid">
        <div
          v-for="d in shown"
          :key="d.name"
          class="dcard"
          :class="{ open: openCard === d.name }"
          @click="interactive && tapCard(d)"
        >
          <div class="dphoto">
            <img v-if="d.letter" :src="d.letter" alt="" class="letter" loading="lazy" decoding="async">
            <i class="dot" :class="{ on: d.online }" :title="d.online ? 'Online' : 'Offline'" />
            <button v-if="interactive" type="button" class="save" :class="{ on: saved.has(d.name) }" :aria-pressed="saved.has(d.name)" :aria-label="`Bookmark ${d.name}`" @click.stop="toggleSave(d.name)">
              <Icon :name="saved.has(d.name) ? 'lucide:bookmark-check' : 'lucide:bookmark'" class="ico" />
            </button>
            <span v-else class="save"><Icon name="lucide:bookmark" class="ico" /></span>
            <span v-if="notes[d.name]" class="has-note" title="You have a note"><Icon name="lucide:notebook-pen" class="ico" /></span>
          </div>
          <div class="dinfo">
            <b>{{ d.name }}</b>
            <small>{{ d.company }}</small>
          </div>
          <div v-if="interactive" class="dact">
            <div>
              <button type="button" :aria-label="`Add a note about ${d.name}`" @click.stop="openNote(d)">
                <Icon name="lucide:notebook-pen" class="ico" />{{ notes[d.name] ? 'Note' : 'Add Note' }}
              </button>
              <button type="button" :class="conn[d.name]" :aria-label="`Connect with ${d.name}`" @click.stop="connect(d)">
                <Icon :name="conn[d.name] === 'connected' ? 'lucide:message-circle' : conn[d.name] === 'pending' ? 'lucide:clock' : 'lucide:user-plus'" class="ico" />
                {{ conn[d.name] === 'connected' ? 'Chat' : conn[d.name] === 'pending' ? 'Pending' : 'Connect' }}
              </button>
            </div>
          </div>
        </div>
        <p v-if="!shown.length" class="none">No delegates match "{{ query }}"</p>
      </div>
    </div>

    <!-- Home -->
    <div v-else-if="screen === 'home'" ref="bodyEl" class="body home" :class="{ live: interactive }" @wheel.passive="stopTour" @touchstart.passive="stopTour" @pointerdown="stopTour">
      <div class="greet">
        <PhoneAvatar :tone="1" round class="greet-av" />
        <div>
          <b>Hello there 👋</b>
          <small>Good morning &amp; welcome to the event</small>
        </div>
      </div>

      <div class="banners">
        <div class="banner">
          <small>{{ event.kicker }}</small>
          <b>{{ event.headline }}</b>
          <i class="orb a" /><i class="orb b" />
        </div>
        <div v-for="bn in BANNERS" :key="bn.img" class="banner photo" :style="{ backgroundImage: `url(${bn.img})` }">
          <small>{{ bn.kicker }}</small>
          <b>{{ bn.title }}</b>
        </div>
      </div>

      <div class="ev">
        <b class="ev-title">{{ event.name }}</b>
        <span class="ev-row"><Icon name="lucide:calendar-days" class="ico" />{{ event.dates }}</span>
        <span class="ev-row"><Icon name="lucide:map-pin" class="ico" />{{ event.place }}</span>
        <p>{{ event.about }}</p>
        <p v-if="moreOpen" class="extra">Doors open at 10:00 AM each day. Parking is free at the venue, and the app has your badge, the floor plan and every session's room.</p>
        <component :is="interactive ? 'button' : 'span'" :type="interactive ? 'button' : undefined" class="more" :class="{ open: moreOpen }" :aria-expanded="interactive ? moreOpen : undefined" @click="interactive && (moreOpen = !moreOpen)">
          {{ moreOpen ? 'Less details' : 'More details' }}<Icon name="lucide:chevron-down" class="ico" />
        </component>
      </div>

      <!-- Featured sessions -->
      <section class="sec">
        <b class="sec-h">Featured Sessions ({{ SESSIONS.length }})</b>
        <div class="rail">
          <article v-for="x in SESSIONS" :key="x.title" class="scard">
            <div class="scard-top">
              <span class="stime">{{ x.time }}</span>
              <button v-if="interactive" type="button" class="save mini" :class="{ on: saved.has(x.title) }" :aria-pressed="saved.has(x.title)" :aria-label="`Save ${x.title}`" @click="toggleSave(x.title); say(saved.has(x.title) ? 'Added to your agenda' : 'Removed from your agenda')">
                <Icon :name="saved.has(x.title) ? 'lucide:bookmark-check' : 'lucide:bookmark'" class="ico" />
              </button>
              <span v-else class="save mini"><Icon name="lucide:bookmark" class="ico" /></span>
              <span class="status" :class="x.status === 'Live' ? 'live-s' : 'soon'">{{ x.status }}</span>
            </div>
            <img :src="x.img" alt="" class="simg" loading="lazy" decoding="async">
            <b class="stitle">{{ x.title }}</b>
            <small class="stext">{{ x.text }}</small>
            <span class="sroom"><Icon name="lucide:map-pin" class="ico" />{{ x.room }}</span>
            <span class="sspk">
              <small>Speakers ({{ x.speakers.length }})</small>
              <span class="stack"><PhoneAvatar v-for="k in x.speakers" :key="k" :tone="SPEAKERS[k]!.tone" round class="sav" /></span>
            </span>
          </article>
        </div>
      </section>

      <!-- Featured speakers -->
      <section class="sec">
        <b class="sec-h">Featured Speakers ({{ SPEAKERS.length }})</b>
        <div class="rail">
          <article v-for="sp in SPEAKERS" :key="sp.name" class="pcard">
            <div class="pphoto">
              <PhoneAvatar :tone="sp.tone" class="photo" />
              <button v-if="interactive" type="button" class="save" :class="{ on: saved.has(sp.name) }" :aria-pressed="saved.has(sp.name)" :aria-label="`Bookmark ${sp.name}`" @click="toggleSave(sp.name)">
                <Icon :name="saved.has(sp.name) ? 'lucide:bookmark-check' : 'lucide:bookmark'" class="ico" />
              </button>
              <span v-else class="save"><Icon name="lucide:bookmark" class="ico" /></span>
            </div>
            <b>{{ sp.name }}</b>
            <small>{{ sp.role }}</small>
            <small class="org">{{ sp.org }}</small>
          </article>
        </div>
        <component :is="interactive ? 'button' : 'span'" :type="interactive ? 'button' : undefined" class="all" @click="interactive && say('All speakers open in the app')">View all speakers</component>
      </section>

      <!-- Featured exhibitors -->
      <section class="sec">
        <b class="sec-h">Featured Exhibitors ({{ EXHIBITORS.length }})</b>
        <div class="rail">
          <article v-for="x in EXHIBITORS" :key="x.name" class="xcard">
            <span class="xlogo"><img :src="x.logo" alt="" loading="lazy" decoding="async"></span>
            <b>{{ x.name }}</b>
            <small>Exhibitor · Booth {{ x.booth }}</small>
          </article>
        </div>
        <component :is="interactive ? 'button' : 'span'" :type="interactive ? 'button' : undefined" class="all" @click="interactive && say('All exhibitors open in the app')">View all exhibitors</component>
      </section>

      <!-- Event video -->
      <section class="sec">
        <component :is="interactive ? 'button' : 'div'" :type="interactive ? 'button' : undefined" class="video" :class="{ playing }" :style="{ backgroundImage: `url(${IMG(3)})` }" :aria-label="interactive ? (playing ? 'Pause the event video' : 'Play the event video') : undefined" @click="interactive && (playing = !playing)">
          <span class="play"><Icon :name="playing ? 'lucide:pause' : 'lucide:play'" class="ico" /></span>
          <span class="vbar"><i /></span>
        </component>
      </section>

      <!-- Meetings -->
      <section class="sec">
        <div class="meet">
          <div class="meet-h">
            <b>MEETINGS</b>
            <component :is="interactive ? 'button' : 'span'" :type="interactive ? 'button' : undefined" class="va" @click="interactive && say('Meetings open in the app')">View all<Icon name="lucide:chevron-right" class="ico" /></component>
          </div>
          <div class="meet-n">
            <span><i class="mi today"><Icon name="lucide:clock" class="ico" /></i><b>2</b><small>Today</small></span>
            <span><i class="mi up"><Icon name="lucide:calendar-check" class="ico" /></i><b>5</b><small>Upcoming</small></span>
          </div>
          <div class="meet-next">
            <PhoneAvatar :tone="2" round class="mav" />
            <p><b>Daniel Carter</b><small>11:30 AM · Table 12, Hall B</small></p>
            <span class="tag-ok">Confirmed</span>
          </div>
        </div>
      </section>

      <!-- Leaderboard -->
      <section class="sec">
        <div class="lb">
          <b class="lb-h">Leaderboard</b>
          <div v-for="l in LEADERS" :key="l.rank" class="lb-row" :class="{ top: l.rank === 1 }">
            <PhoneAvatar :tone="l.tone" round class="lav" />
            <span class="lb-name">{{ l.name }}</span>
            <span class="lb-r"><b>{{ l.rank }}</b><small>{{ l.pts }}pt</small></span>
          </div>
          <div class="lb-you"><span class="you-r">24</span>You<span class="you-p">160pt</span></div>
        </div>
      </section>

      <!-- Sponsor banner -->
      <section class="sec last">
        <div class="ad" :style="{ backgroundImage: `url(${IMG(4)})` }">
          <small>SPONSORED</small>
          <b>Gold sponsor · Northwind Group</b>
        </div>
      </section>
    </div>

    <!-- My badge -->
    <div v-else class="body my-badge" :class="{ live: interactive }">
      <BadgeCard :role="visitor" class="card" />
      <component :is="interactive ? 'button' : 'span'" :type="interactive ? 'button' : undefined" class="download" :class="{ done: downloaded }" @click="interactive && onDownload()">
        <Icon :name="downloaded ? 'lucide:check' : 'lucide:download'" class="ico" />{{ downloaded ? 'Saved' : 'Download' }}
      </component>
    </div>

    <!-- Push banner, sliding down from the top as the phone shows it -->
    <Transition name="push">
      <button v-if="banner && interactive" type="button" class="push" @click="openBanner">
        <span class="push-ic"><Icon :name="banner.icon" class="ico" /></span>
        <span class="push-t"><b>{{ banner.title }}</b><small>{{ banner.text }}</small></span>
        <span class="push-now">now</span>
      </button>
    </Transition>

    <!-- Notifications list, under the header strip -->
    <Transition name="drop">
      <div v-if="panelOpen && interactive" class="panel" role="dialog" aria-label="Notifications">
        <div class="panel-h">
          <b>Notifications</b>
          <button type="button" class="ib" aria-label="Close notifications" @click="panelOpen = false"><Icon name="lucide:x" class="ico" /></button>
        </div>
        <div class="panel-list">
          <div v-for="n in notifs" :key="n.id" class="nrow">
            <span class="nic"><Icon :name="n.icon" class="ico" /></span>
            <p><b>{{ n.title }}</b><small>{{ n.text }}</small></p>
            <span class="ntime">{{ n.time }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Add Note sheet -->
    <Transition name="sheet">
      <div v-if="noteFor && interactive" class="sheet-wrap" @click.self="noteFor = null">
        <div class="sheet" role="dialog" :aria-label="`Note about ${noteFor}`">
          <i class="grab" />
          <b class="sheet-h">Add note</b>
          <small class="sheet-sub"><Icon name="lucide:lock" class="ico" />About {{ noteFor }} · only you can see it</small>
          <label class="note-box">
            <textarea v-model="noteDraft" rows="3" placeholder="What did you talk about?" aria-label="Note" />
          </label>
          <div class="note-chips">
            <button v-for="c in NOTE_CHIPS" :key="c" type="button" @click="addChip(c)">+ {{ c }}</button>
          </div>
          <div class="sheet-btns">
            <button type="button" class="ghost" @click="noteFor = null">Cancel</button>
            <button type="button" class="solid" @click="saveNote">Save note</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="toast" class="toast" role="status">{{ toast }}</div>
    </Transition>
  </PhoneFrame>
</template>

<style scoped>
/* ---------- Header ---------- */
.ah {
  flex: none;
  padding: 0 12px;
  background: var(--color-brand, #6452E7 );
  color: #fff;
}

.ah-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
}

.menu {
  width: 16px;
  height: 16px;
}

.logo {
  height: 15px;
  width: auto;
}

/* White-label header: the event's own logo tile and app name. */
.brandmark {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 140px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: -.01em;
  white-space: nowrap;
}

.brandmark i {
  flex: none;
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: #fff;
  color: var(--color-brand, #6452E7 );
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
}

.me {
  width: 24px;
  height: 24px;
  box-shadow: 0 0 0 1.5px rgba(255, 255, 255, .85);
}

.ah-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  border-top: 1px solid rgba(255, 255, 255, .16);
  font-size: 10.5px;
  font-weight: 600;
}

.icons {
  display: flex;
  align-items: center;
  gap: 9px;
}

.icons .ico,
.back .ico {
  width: 13px;
  height: 13px;
}

.back {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bell {
  position: relative;
  display: flex;
}

.bell i {
  position: absolute;
  top: -4px;
  right: -5px;
  min-width: 10px;
  height: 10px;
  padding: 0 2px;
  border-radius: 999px;
  background: #ef4444;
  font-size: 7px;
  font-style: normal;
  font-weight: 800;
  line-height: 10px;
  text-align: center;
}

.body {
  flex: 1;
  min-height: 0;
  padding: 10px;
}

/* ---------- Delegates ---------- */
.search-row {
  display: flex;
  gap: 6px;
}

.search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 9px;
  border: 1px solid #e6e6ef;
  border-radius: 8px;
  background: #fff;
  color: #9aa1ad;
  font-size: 9.5px;
}

.search .ico {
  width: 11px;
  height: 11px;
}

.filter {
  flex: none;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--color-brand, #6452E7 );
  color: #fff;
}

.filter .ico {
  width: 13px;
  height: 13px;
}

.dgrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}

.dcard {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border: 1px solid #ececf3;
  border-radius: 10px;
  background: #fff;
  transition: border-color .25s ease, box-shadow .25s ease;
}

.live .dcard {
  cursor: pointer;
}

.dphoto {
  position: relative;
  height: 74px;
  background: #eef0f7;
}

/* The product's letter avatar, for a person with no photo. */
.letter {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo {
  width: 100%;
  height: 100%;
  border-radius: 7px;
}

.dot {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #9ca3af;
}

.dot.on {
  background: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, .25);
}

.save {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  border-radius: 5px;
  background: #fff;
  color: var(--color-brand, #6452E7 );
  box-shadow: 0 1px 3px rgba(20, 23, 40, .12);
}

.save .ico {
  width: 10px;
  height: 10px;
}

.has-note {
  position: absolute;
  right: 5px;
  bottom: 5px;
  width: 16px;
  height: 16px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--color-brand, #6452E7 );
  color: #fff;
}

.has-note .ico {
  width: 9px;
  height: 9px;
}

.dinfo {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 6px 7px 7px;
}

.dinfo b {
  font-size: 10px;
  color: color-mix(in srgb, var(--color-brand, #6452E7 ) 55%, #000);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dinfo small {
  font-size: 8px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Add Note / Connect: folded away, opened by hover (pointer devices) or a tap. */
.dact {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows .3s cubic-bezier(.22, .8, .24, 1);
}

.dact > div {
  min-height: 0;
  overflow: hidden;
  display: flex;
  gap: 4px;
  padding: 0 6px;
}

.dcard.open .dact {
  grid-template-rows: 1fr;
}

.dcard.open .dact > div {
  padding-bottom: 7px;
}

.dcard.open {
  border-color: color-mix(in srgb, var(--color-brand, #6452E7 ) 55%, #000);
  box-shadow: 0 6px 16px -8px rgba(49, 40, 140, .4);
}

@media (hover: hover) {
  .live .dcard:hover {
    border-color: color-mix(in srgb, var(--color-brand, #6452E7 ) 55%, #000);
    box-shadow: 0 6px 16px -8px rgba(49, 40, 140, .4);
  }

  .live .dcard:hover .dact {
    grid-template-rows: 1fr;
  }

  .live .dcard:hover .dact > div {
    padding-bottom: 7px;
  }
}

.dact button {
  flex: 1;
  min-width: 0;
  height: 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 0 2px;
  border: 1px solid #dcdeea;
  border-radius: 6px;
  background: #f1f2f8;
  font: inherit;
  font-size: 7.5px;
  font-weight: 700;
  white-space: nowrap;
  color: color-mix(in srgb, var(--color-brand, #6452E7 ) 55%, #000);
  cursor: pointer;
  transition: background .25s ease, color .25s ease, border-color .25s ease, transform .2s ease;
}

.dact button:active {
  transform: scale(.94);
}

.dact .ico {
  width: 9px;
  height: 9px;
}

.dact button.pending {
  border-color: transparent;
  background: #fef3c7;
  color: #b45309;
}

.dact button.connected {
  border-color: transparent;
  background: var(--color-brand, #6452E7 );
  color: #fff;
}

/* ---------- Home ---------- */
.body.home {
  padding: 0;
  background: #fff;
}

.greet {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--color-brand, #6452E7 ) 8%, #fff);
}

.greet-av {
  flex: none;
  width: 30px;
  height: 30px;
}

.greet b {
  display: block;
  font-size: 13px;
  line-height: 1.2;
}

.greet small {
  font-size: 8.5px;
  color: #6b7280;
}

.banners {
  display: flex;
  gap: 6px;
  padding: 10px 0 0 10px;
}

.banner {
  position: relative;
  flex: none;
  width: 196px;
  height: 92px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  overflow: hidden;
  padding: 0 12px;
  border-radius: 10px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-brand, #6452E7 ) 70%, #fff), var(--color-brand, #6452E7 ) 55%, color-mix(in srgb, var(--color-brand, #6452E7 ) 65%, #000));
  color: #fff;
}

.banner small {
  position: relative;
  z-index: 1;
  font-size: 7.5px;
  font-weight: 800;
  letter-spacing: .06em;
  opacity: .85;
}

.banner b {
  position: relative;
  z-index: 1;
  max-width: 120px;
  font-size: 12.5px;
  line-height: 1.2;
}

.orb {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, .16);
}

.orb.a {
  right: -18px;
  top: -22px;
  width: 92px;
  height: 92px;
}

.orb.b {
  right: 26px;
  bottom: -30px;
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, .1);
}

/* The next banner peeks in from the right; on a live screen the row swipes. */
.banners {
  overflow: hidden;
}

.live .banners {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 10px;
  padding-right: 10px;
  scrollbar-width: none;
}

.live .banners::-webkit-scrollbar {
  display: none;
}

.live .banner {
  scroll-snap-align: start;
}

.ev {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px 12px;
}

.ev-title {
  font-size: 13.5px;
  line-height: 1.25;
}

.ev-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 8.5px;
  color: #3a3d52;
}

.ev-row .ico {
  flex: none;
  width: 11px;
  height: 11px;
  color: #6b7280;
}


.ev p {
  margin: 2px 0 0;
  font-size: 8.5px;
  line-height: 1.5;
  color: #6b7280;
}

.more {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: 700;
  color: var(--color-brand, #6452E7 );
}

.more .ico {
  width: 10px;
  height: 10px;
}

/* ---------- My badge ---------- */
.body.my-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
}

.my-badge .card {
  width: 182px;
  filter: drop-shadow(0 10px 18px rgba(49, 40, 140, .18));
}

.download {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  align-self: stretch;
  height: 32px;
  border-radius: 8px;
  background: var(--color-brand, #6452E7 );
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
}

.download .ico {
  width: 12px;
  height: 12px;
}

/* ---------- Home sections (below the fold) ---------- */
.sec {
  display: grid;
  gap: 7px;
  padding: 6px 0 8px 12px;
}

.sec.last {
  padding-bottom: 14px;
}

.sec-h {
  font-size: 11px;
}

/* A row of cards that swipes sideways (on a live screen). */
.rail {
  display: flex;
  gap: 7px;
  overflow: hidden;
  padding-right: 12px;
}

.live .rail {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 12px;
  scrollbar-width: none;
}

.live .rail::-webkit-scrollbar {
  display: none;
}

.rail > * {
  flex: none;
  scroll-snap-align: start;
  min-width: 0;
  border: 1px solid #ececf3;
  border-radius: 10px;
  background: #fff;
}

/* Session card */
.scard {
  width: 150px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 7px;
}

.scard-top {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stime {
  flex: 1;
  min-width: 0;
  font-size: 7.5px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status {
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 7px;
  font-weight: 700;
}

.status.live-s {
  background: #fee2e2;
  color: #dc2626;
}

.status.soon {
  background: var(--color-brand-soft, #eef2ff);
  color: var(--color-brand, #6452E7 );
}

.simg {
  display: block;
  width: 100%;
  height: 66px;
  object-fit: cover;
  border-radius: 7px;
  background: #e8e8f1;
}

.stitle {
  font-size: 9.5px;
  line-height: 1.25;
}

.stext {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 7.5px;
  color: #6b7280;
}

.sroom {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 7.5px;
  color: #3a3d52;
}

.sroom .ico {
  width: 9px;
  height: 9px;
  color: #6b7280;
}

.sspk {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
  border-top: 1px solid #f0f1f5;
}

.sspk small {
  font-size: 7.5px;
  color: #6b7280;
}

.stack {
  display: flex;
}

.sav {
  width: 16px;
  height: 16px;
  box-shadow: 0 0 0 1.5px #fff;
}

.sav + .sav {
  margin-left: -5px;
}

.save.mini {
  position: static;
  flex: none;
  width: 16px;
  height: 16px;
  background: var(--color-brand-soft, #eef2ff);
}

.save.mini .ico {
  width: 9px;
  height: 9px;
}

/* Speaker card */
.pcard {
  width: 100px;
  display: flex;
  flex-direction: column;
  padding: 5px 5px 7px;
}

.pphoto {
  position: relative;
  height: 80px;
}

.pcard b {
  margin-top: 5px;
  font-size: 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pcard small {
  font-size: 7.5px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pcard small.org {
  color: #9aa1ad;
}

/* Exhibitor card */
.xcard {
  width: 112px;
  display: flex;
  flex-direction: column;
  padding: 6px 6px 8px;
}

.xlogo {
  height: 52px;
  display: grid;
  place-items: center;
  border: 1px solid #f0f1f5;
  border-radius: 7px;
  background: #fff;
}

.xlogo img {
  max-width: 78%;
  max-height: 26px;
}

.xcard b {
  margin-top: 6px;
  font-size: 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.xcard small {
  font-size: 7.5px;
  color: #6b7280;
}

/* "View all" button under a rail */
.all {
  margin-right: 12px;
  padding: 6px 0;
  border: 1px solid color-mix(in srgb, var(--color-brand, #6452E7 ) 35%, #fff);
  border-radius: 7px;
  background: #fff;
  font: inherit;
  font-size: 8.5px;
  font-weight: 700;
  color: var(--color-brand, #6452E7 );
  text-align: center;
}

button.all {
  cursor: pointer;
}

/* Event video */
.video {
  position: relative;
  height: 112px;
  margin-right: 12px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

button.video {
  cursor: pointer;
}

.video::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 40%, rgba(15, 12, 40, .55));
}

.play {
  position: relative;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, .92);
  color: var(--color-brand, #6452E7 );
  box-shadow: 0 4px 12px rgba(0, 0, 0, .25);
}

.play .ico {
  width: 13px;
  height: 13px;
}

.vbar {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 7px;
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, .35);
  overflow: hidden;
}

.vbar i {
  display: block;
  width: 18%;
  height: 100%;
  background: #fff;
}

.video.playing .vbar i {
  animation: vplay 12s linear forwards;
}

@keyframes vplay {
  to { width: 100%; }
}

/* Meetings */
.meet {
  margin-right: 12px;
  padding: 9px 10px;
  border: 1px solid #ececf3;
  border-radius: 10px;
  background: #fff;
}

.meet-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meet-h b {
  font-size: 8.5px;
  letter-spacing: .06em;
  color: #3a3d52;
}

.va {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: 8px;
  font-weight: 700;
  color: var(--color-brand, #6452E7 );
}

button.va {
  cursor: pointer;
}

.va .ico {
  width: 9px;
  height: 9px;
}

.meet-n {
  display: flex;
  gap: 18px;
  margin-top: 8px;
}

.meet-n span {
  display: grid;
  grid-template-columns: auto auto;
  column-gap: 6px;
  align-items: center;
}

.mi {
  grid-row: span 2;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
}

.mi .ico {
  width: 11px;
  height: 11px;
}

.mi.today {
  background: #fef3c7;
  color: #d97706;
}

.mi.up {
  background: #dcfce7;
  color: #16a34a;
}

.meet-n b {
  font-size: 12px;
  line-height: 1;
}

.meet-n small {
  font-size: 7.5px;
  color: #6b7280;
}

.meet-next {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 9px;
  padding-top: 8px;
  border-top: 1px solid #f0f1f5;
}

.mav {
  flex: none;
  width: 22px;
  height: 22px;
}

.meet-next p {
  flex: 1;
  min-width: 0;
  margin: 0;
}

.meet-next p b {
  display: block;
  font-size: 9px;
}

.meet-next p small {
  font-size: 7.5px;
  color: #6b7280;
}

.tag-ok {
  padding: 2px 6px;
  border-radius: 999px;
  background: #dcfce7;
  color: #15803d;
  font-size: 7px;
  font-weight: 700;
}

/* Leaderboard: a brand card, the leader's row lifted */
.lb {
  display: grid;
  gap: 5px;
  margin-right: 12px;
  padding: 10px;
  border-radius: 12px;
  background: linear-gradient(160deg, var(--color-brand, #6452E7 ), color-mix(in srgb, var(--color-brand, #6452E7 ) 60%, #000));
  color: #fff;
}

.lb-h {
  margin-bottom: 2px;
  font-size: 10.5px;
}

.lb-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 7px;
  border-radius: 8px;
  background: rgba(255, 255, 255, .12);
}

.lb-row.top {
  margin: 0 -3px;
  padding-block: 7px;
  background: #fff;
  color: var(--color-ink, #1f2430);
}

.lav {
  flex: none;
  width: 20px;
  height: 20px;
}

.lb-name {
  flex: 1;
  min-width: 0;
  font-size: 8.5px;
  font-weight: 600;
}

.lb-r {
  display: grid;
  justify-items: end;
  line-height: 1.1;
}

.lb-r b {
  font-size: 11px;
}

.lb-r small {
  font-size: 7px;
  opacity: .8;
}

.lb-you {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 2px;
  padding: 5px 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, .18);
  font-size: 8.5px;
  font-weight: 600;
}

.you-r {
  padding: 1px 7px;
  border-radius: 999px;
  background: #fff;
  color: var(--color-brand, #6452E7 );
  font-size: 8px;
  font-weight: 800;
}

.you-p {
  margin-left: auto;
  font-size: 8px;
}

/* Sponsor banner */
.ad {
  position: relative;
  height: 84px;
  margin-right: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 2px;
  padding: 9px 10px;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
  color: #fff;
  overflow: hidden;
}

.ad::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 20%, rgba(15, 12, 40, .7));
}

.ad small,
.ad b {
  position: relative;
}

.ad small {
  font-size: 6.5px;
  font-weight: 800;
  letter-spacing: .08em;
  opacity: .85;
}

.ad b {
  font-size: 10px;
}

/* Photo banner: the photo under a brand wash, the text on top. */
.banner.photo {
  background-size: cover;
  background-position: center;
}

.banner.photo::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, color-mix(in srgb, var(--color-brand, #6452E7 ) 85%, transparent), transparent 85%);
}

/* Language pill in the header strip */
.lang {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 5px;
  border: 1px solid rgba(255, 255, 255, .45);
  border-radius: 999px;
  font-size: 8px;
  font-weight: 700;
}

.icons .lang .ico {
  width: 9px;
  height: 9px;
}

.icons .lang .ico.chev {
  width: 8px;
  height: 8px;
}

/* ---------- Live screen ---------- */
.body.live {
  overflow-y: auto;
  scrollbar-width: none;
}

.body.live::-webkit-scrollbar {
  display: none;
}

/* Controls on a live screen: buttons that look like the drawing. */
.ib,
button.save,
button.more,
button.download,
button.back {
  padding: 0;
  border: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.ib {
  display: flex;
  background: none;
}

button.save {
  color: var(--color-brand, #6452E7 );
  transition: background .2s ease, color .2s ease, transform .2s ease;
}

button.save {
  background: #fff;
}

button.save.on {
  background: var(--color-brand, #6452E7 );
  color: #fff;
}

button.save:active,
.ib:active {
  transform: scale(.88);
}

button.more {
  background: none;
  font-size: 9px;
  font-weight: 700;
  color: var(--color-brand, #6452E7 );
}

.more .ico {
  transition: transform .25s ease;
}

.more.open .ico {
  transform: rotate(180deg);
}

.ev p.extra {
  margin: 0;
}

button.back {
  background: none;
  font-size: 10.5px;
  font-weight: 600;
}

button.download {
  border-radius: 8px;
  background: var(--color-brand, #6452E7 );
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  transition: background .25s ease;
}

.download.done {
  background: #16a34a;
}

/* Search: typed at 16px (so phones don't zoom in on focus), drawn at the screen's size. */
label.search {
  overflow: hidden;
  cursor: text;
}

.search input {
  flex: none;
  width: 166%;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: none;
  font: inherit;
  font-size: 16px;
  color: var(--color-ink, #1f2430);
  transform: scale(.6);
  transform-origin: 0 50%;
}

.search input::placeholder {
  color: #9aa1ad;
}

.search input::-webkit-search-cancel-button {
  display: none;
}

.none {
  grid-column: 1 / -1;
  margin: 16px 0;
  font-size: 9.5px;
  color: #6b7280;
  text-align: center;
}

.ib:focus-visible,
button.save:focus-visible,
.dact button:focus-visible,
button.more:focus-visible,
button.download:focus-visible,
button.back:focus-visible,
label.search:focus-within {
  outline: 2px solid var(--color-brand, #6452E7 );
  outline-offset: 1px;
}

/* A short message over the tab bar, as the app shows it. */
.toast {
  position: absolute;
  left: 50%;
  bottom: 60px;
  z-index: 5;
  max-width: 200px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(26, 26, 46, .9);
  color: #fff;
  font-size: 9px;
  font-weight: 600;
  white-space: nowrap;
  translate: -50% 0;
  pointer-events: none;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity .25s ease, transform .25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* ---------- Push banner ---------- */
.push {
  position: absolute;
  top: 30px;
  left: 7px;
  right: 7px;
  z-index: 7;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 8px;
  border: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, .97);
  box-shadow: 0 8px 22px -6px rgba(20, 23, 40, .35);
  font: inherit;
  text-align: left;
  color: var(--color-ink, #1f2430);
  cursor: pointer;
}

.push-ic {
  flex: none;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 7px;
  background: var(--color-brand, #6452E7 );
  color: #fff;
}

.push-ic .ico {
  width: 12px;
  height: 12px;
}

.push-t {
  flex: 1;
  min-width: 0;
  display: grid;
}

.push-t b {
  font-size: 9px;
}

.push-t small {
  font-size: 8px;
  color: #4b5160;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.push-now {
  align-self: flex-start;
  font-size: 7px;
  color: #9aa1ad;
}

.push-enter-active,
.push-leave-active {
  transition: transform .45s cubic-bezier(.22, .8, .24, 1), opacity .3s ease;
}

.push-enter-from,
.push-leave-to {
  opacity: 0;
  transform: translateY(-120%);
}

/* ---------- Notifications list ---------- */
.panel {
  position: absolute;
  top: 98px;
  left: 6px;
  right: 6px;
  z-index: 6;
  max-height: 300px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 14px 34px -10px rgba(20, 23, 40, .4);
  overflow: hidden;
}

.panel-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 10px 7px;
  border-bottom: 1px solid #f0f1f5;
}

.panel-h b {
  font-size: 10.5px;
}

.panel-h .ib {
  color: #6b7280;
}

.panel-h .ico {
  width: 12px;
  height: 12px;
}

.panel-list {
  overflow-y: auto;
  scrollbar-width: none;
}

.nrow {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 7px 10px;
}

.nrow + .nrow {
  border-top: 1px solid #f5f5f9;
}

.nic {
  flex: none;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--color-brand-soft, #eef2ff);
  color: var(--color-brand, #6452E7 );
}

.nic .ico {
  width: 11px;
  height: 11px;
}

.nrow p {
  flex: 1;
  min-width: 0;
  margin: 0;
  display: grid;
}

.nrow p b {
  font-size: 8.5px;
}

.nrow p small {
  font-size: 7.5px;
  line-height: 1.35;
  color: #6b7280;
}

.ntime {
  flex: none;
  font-size: 7px;
  color: #9aa1ad;
}

.drop-enter-active,
.drop-leave-active {
  transition: opacity .2s ease, transform .25s cubic-bezier(.22, .8, .24, 1);
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ---------- Add Note sheet ---------- */
.sheet-wrap {
  position: absolute;
  inset: 0;
  z-index: 8;
  display: flex;
  align-items: flex-end;
  background: rgba(15, 12, 40, .35);
}

.sheet {
  width: 100%;
  display: grid;
  gap: 6px;
  padding: 7px 12px 14px;
  border-radius: 16px 16px 0 0;
  background: #fff;
}

.grab {
  justify-self: center;
  width: 30px;
  height: 3px;
  border-radius: 2px;
  background: #dcdeea;
}

.sheet-h {
  font-size: 12px;
}

.sheet-sub {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: -3px;
  font-size: 8px;
  color: #6b7280;
}

.sheet-sub .ico {
  width: 9px;
  height: 9px;
}

/* Typed at 16px (so phones don't zoom in on focus), drawn at the screen's size. */
.note-box {
  position: relative;
  height: 52px;
  overflow: hidden;
  border: 1px solid #e3e4ee;
  border-radius: 8px;
  background: #fafafd;
}

.note-box textarea {
  position: absolute;
  left: 0;
  top: 0;
  width: 166.6%;
  height: 166.6%;
  padding: 10px 12px;
  border: 0;
  outline: 0;
  resize: none;
  background: none;
  font: inherit;
  font-size: 16px;
  line-height: 1.4;
  color: var(--color-ink, #1f2430);
  transform: scale(.6);
  transform-origin: 0 0;
}

.note-box:focus-within {
  border-color: var(--color-brand, #6452E7 );
}

.note-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.note-chips button {
  padding: 3px 7px;
  border: 1px solid #e3e4ee;
  border-radius: 999px;
  background: #fff;
  font: inherit;
  font-size: 7.5px;
  font-weight: 600;
  color: #4b5160;
  cursor: pointer;
}

.sheet-btns {
  display: flex;
  gap: 6px;
  margin-top: 2px;
}

.sheet-btns button {
  flex: 1;
  height: 28px;
  border-radius: 8px;
  font: inherit;
  font-size: 9.5px;
  font-weight: 700;
  cursor: pointer;
}

.sheet-btns .ghost {
  border: 1px solid #e3e4ee;
  background: #fff;
  color: #4b5160;
}

.sheet-btns .solid {
  border: 0;
  background: var(--color-brand, #6452E7 );
  color: #fff;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity .25s ease;
}

.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform .35s cubic-bezier(.22, .8, .24, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .push-enter-active, .push-leave-active, .drop-enter-active, .drop-leave-active,
  .sheet-enter-active, .sheet-leave-active, .sheet-enter-active .sheet, .sheet-leave-active .sheet,
  .dact, .dcard { transition: none; }
}
</style>
