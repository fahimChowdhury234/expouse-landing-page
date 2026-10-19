<script setup lang="ts">
/**
 * The site header, used by layouts/default.vue (after expouse-landing/index.html's nav).
 *
 * - A full-width bar docked to the top. Once the page scrolls it firms up (more
 *   solid, a soft shadow, a slightly smaller logo; same height, so nothing
 *   moves) and a thin brand line along its bottom edge shows how far down the
 *   page you are.
 * - "Platform" opens a menu of the feature pages (/features/...) plus a card
 *   to try the badge designer. It opens on hover (with a short grace period on the way
 *   out) or on click, and closes on Escape, an outside click or a link.
 * - The active link (the section in view on the home page, or a page such as
 *   News and its stories) sits on a soft pill; the pill slides to whichever
 *   link the pointer is on and back again when it leaves.
 * - Below 1040px the links move into a full-screen menu (Escape closes it,
 *   the page behind does not scroll while it is open).
 *
 * With reduced motion nothing animates; the bar and menus just switch state.
 */
import { FEATURE_PAGES } from '~/utils/features'

const config = useRuntimeConfig().public
const route = useRoute()

const MENU = [
  { label: 'Features', to: '/#features', spy: ['features'] },
  { label: 'Onsite', to: '/#onsite', spy: ['onsite', 'badges'] },
  { label: 'Apps', to: '/#apps', spy: ['apps', 'branded'] },
  { label: 'Pricing', to: '/#pricing', spy: ['pricing'] },
  { label: 'FAQ', to: '/#faq', spy: ['faq'] },
  { label: 'News', to: '/news', spy: [], page: '/news' },
  { label: 'Blog', to: '/blog', spy: [], page: '/blog' },
  { label: 'Gallery', to: '/gallery', spy: [], page: '/gallery' },
]

/** The Platform menu: one tile per feature page (utils/features.ts), in two columns. */
const PLATFORM = FEATURE_PAGES.map(f => ({ icon: f.icon, title: f.menuName ?? f.name, text: f.menuText, to: `/features/${f.slug}` }))

const SHEET = [
  { icon: 'lucide:layout-grid', label: 'Platform', to: '/#platform' },
  { icon: 'lucide:sparkles', label: 'Features', to: '/#features' },
  { icon: 'lucide:scan-line', label: 'Onsite & check-in', to: '/#onsite' },
  { icon: 'lucide:id-card', label: 'Badge designer', to: '/#badges' },
  { icon: 'lucide:smartphone', label: 'Apps', to: '/#apps' },
  { icon: 'lucide:tag', label: 'Pricing', to: '/#pricing' },
  { icon: 'lucide:circle-help', label: 'FAQ', to: '/#faq' },
  { icon: 'lucide:newspaper', label: 'News', to: '/news', page: '/news' },
  { icon: 'lucide:book-open', label: 'Blog', to: '/blog', page: '/blog' },
  { icon: 'lucide:images', label: 'Media gallery', to: '/gallery', page: '/gallery' },
  { icon: 'lucide:mail', label: 'Contact', to: '/contact-us' },
]

/* ---------- Floating bar + scroll progress ---------- */
const scrolled = ref(false)
const bar = ref<HTMLElement | null>(null)
let ticking = false

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    ticking = false
    scrolled.value = window.scrollY > 24
    const max = document.documentElement.scrollHeight - window.innerHeight
    bar.value?.style.setProperty('--progress', String(max > 0 ? Math.min(1, window.scrollY / max) : 0))
  })
}

/* ---------- Platform menu ---------- */
const megaOpen = ref(false)
const megaBtn = ref<HTMLButtonElement | null>(null)
const megaEl = ref<HTMLElement | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | null = null
let finePointer = false

function openMega() {
  if (closeTimer) clearTimeout(closeTimer)
  megaOpen.value = true
}

/** Hover out: a short grace period, so moving the pointer down into the menu doesn't close it. */
function leaveMega() {
  if (!finePointer) return
  if (closeTimer) clearTimeout(closeTimer)
  closeTimer = setTimeout(() => { megaOpen.value = false }, 160)
}

function onDocClick(e: MouseEvent) {
  if (!megaOpen.value) return
  const t = e.target as Node
  if (megaEl.value?.contains(t) || megaBtn.value?.contains(t)) return
  megaOpen.value = false
}

/* ---------- Mobile menu ---------- */
const sheetOpen = ref(false)
const menuBtn = ref<HTMLButtonElement | null>(null)

watch(sheetOpen, (open) => {
  if (import.meta.client) document.documentElement.style.overflow = open ? 'hidden' : ''
})

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  if (sheetOpen.value) {
    sheetOpen.value = false
    menuBtn.value?.focus()
  }
  if (megaOpen.value) {
    megaOpen.value = false
    megaBtn.value?.focus()
  }
}

// Any navigation closes both menus.
watch(() => route.fullPath, () => {
  megaOpen.value = false
  sheetOpen.value = false
})

/* ---------- Section in view (home page only) ---------- */
const current = ref<string | null>(null)
let spy: IntersectionObserver | null = null

function watchSections() {
  spy?.disconnect()
  current.value = null
  if (route.path !== '/' || !('IntersectionObserver' in window)) return
  // Every section is watched, so one the menu doesn't link to (the gallery, say) clears the mark.
  spy = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) current.value = e.target.id
    }
  }, { rootMargin: '-40% 0px -55% 0px' })
  document.querySelectorAll('main section[id], main article[id]').forEach(el => spy?.observe(el))
}

watch(() => route.path, () => nextTick(watchSections))

const isCurrent = (spyIds: string[]) => !!current.value && spyIds.includes(current.value)

/** A link to a page of its own (not a home section) is marked on that page and everything under it. */
const onPage = (path?: string) => !!path && (route.path === path || route.path.startsWith(`${path}/`))
const platformCurrent = computed(() => onPage('/features') || current.value === 'platform' || current.value === 'region' || current.value === 'security')

/* ---------- The pill: rests behind the active link, slides to the hovered one ---------- */
const menuWrap = ref<HTMLElement | null>(null)
const pill = reactive({ x: 0, w: 0, on: false, jump: false })
let pointerIn = false

/** Moves the pill under a menu item (positions are relative to .menu-wrap). `jump` skips the slide. */
function placePill(li: HTMLElement, jump = false) {
  pill.jump = jump
  pill.x = li.offsetLeft
  pill.w = li.offsetWidth
  pill.on = true
  if (jump) requestAnimationFrame(() => requestAnimationFrame(() => { pill.jump = false }))
}

function hover(e: Event) {
  pointerIn = true
  placePill(e.currentTarget as HTMLElement)
}

/** Back behind the active link - appearing in place if it was hidden - or away when nothing is active. */
function restPill() {
  if (pointerIn) return
  const li = menuWrap.value?.querySelector('.item.current')?.closest('li')
  if (li && li.offsetWidth) placePill(li, !pill.on)
  else pill.on = false
}

function leaveMenu() {
  pointerIn = false
  restPill()
}

// The active link changes with the page, and on the home page with the section in view.
watch([() => route.path, current], () => nextTick(restPill))

function enterPlatform(e: Event) {
  hover(e)
  if (finePointer) openMega()
}

onMounted(() => {
  finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
  window.addEventListener('resize', restPill, { passive: true })
  watchSections()
  restPill()
  // Cairo may still be loading; the links change width when it arrives.
  document.fonts?.ready.then(restPill)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  window.removeEventListener('resize', restPill)
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
  spy?.disconnect()
  if (closeTimer) clearTimeout(closeTimer)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <header class="hd" :class="{ scrolled, 'sheet-open': sheetOpen }">
    <div ref="bar" class="bar">
      <NuxtLink to="/" class="logo-link" aria-label="EXPOUSE home">
        <AppLogo class="logo" />
      </NuxtLink>

      <!-- ---------- Desktop menu ---------- -->
      <nav class="nav" aria-label="Main">
        <div ref="menuWrap" class="menu-wrap" @mouseleave="leaveMenu">
          <i class="pill" :class="{ on: pill.on, jump: pill.jump }" :style="{ '--x': `${pill.x}px`, '--w': `${pill.w}px` }" aria-hidden="true" />
          <ul class="menu">
            <li class="has-mega" @mouseenter="enterPlatform" @mouseleave="leaveMega">
              <button
                ref="megaBtn"
                type="button"
                class="item"
                :class="{ current: platformCurrent }"
                :aria-expanded="megaOpen"
                aria-controls="hd-mega"
                @click="megaOpen = !megaOpen"
              >
                Platform
                <Icon name="lucide:chevron-down" class="chev" />
              </button>

              <div id="hd-mega" ref="megaEl" class="mega" :class="{ open: megaOpen }" @mouseenter="openMega" @mouseleave="leaveMega">
                <div class="mega-main">
                  <p class="mega-label">Explore the platform</p>
                  <ul class="mega-list">
                    <li v-for="(p, i) in PLATFORM" :key="p.title" :style="{ '--i': i }">
                      <NuxtLink :to="p.to" class="mega-link" @click="megaOpen = false">
                        <span class="mi"><Icon :name="p.icon" class="ico" /></span>
                        <span class="mt"><b>{{ p.title }}</b><small>{{ p.text }}</small></span>
                        <Icon name="lucide:arrow-right" class="ml-go" />
                      </NuxtLink>
                    </li>
                  </ul>
                  <div class="mega-foot">
                    <NuxtLink to="/#features" class="mega-all" @click="megaOpen = false">
                      See all features
                      <Icon name="lucide:arrow-right" class="ico" />
                    </NuxtLink>
                    <span>Organizers, exhibitors, speakers &amp; attendees</span>
                  </div>
                </div>

                <NuxtLink to="/#badges" class="mega-feature" @click="megaOpen = false">
                  <span class="mf-copy">
                    <small>Try it</small>
                    <b>Design a badge for every role, right on this page.</b>
                  </span>
                  <!-- A small badge, floating. -->
                  <span class="mf-badge" aria-hidden="true">
                    <i class="mb-head" />
                    <i class="mb-line w1" />
                    <i class="mb-line w2" />
                    <i class="mb-qr" />
                  </span>
                  <span class="mf-go">Open the badge designer <Icon name="lucide:arrow-right" class="ico" /></span>
                </NuxtLink>
              </div>
            </li>

            <li v-for="m in MENU" :key="m.to" @mouseenter="hover">
              <NuxtLink :to="m.to" class="item" :class="{ current: isCurrent(m.spy) || onPage(m.page) }">{{ m.label }}</NuxtLink>
            </li>
          </ul>
        </div>
      </nav>

      <!-- ---------- Actions ---------- -->
      <div class="actions">
        <a :href="config.appUrl" class="signin">Sign in</a>
        <NuxtLink to="/contact-us" class="cta">
          Book a demo
          <Icon name="lucide:arrow-right" class="ico" />
        </NuxtLink>
        <button
          ref="menuBtn"
          type="button"
          class="menu-btn"
          :aria-expanded="sheetOpen"
          aria-controls="hd-sheet"
          :aria-label="sheetOpen ? 'Close menu' : 'Open menu'"
          @click="sheetOpen = !sheetOpen"
        >
          <span class="burger" aria-hidden="true"><i /><i /><i /></span>
        </button>
      </div>

      <!-- How far down the page you are. -->
      <i class="progress" aria-hidden="true" />
    </div>

    <!-- ---------- Mobile menu ---------- -->
    <Transition name="hd-sheet">
      <nav v-if="sheetOpen" id="hd-sheet" class="sheet" aria-label="Main">
        <ul>
          <li v-for="(s, i) in SHEET" :key="s.to + s.label" :style="{ '--i': i }">
            <NuxtLink :to="s.to" class="row" :class="{ current: onPage(s.page) }" @click="sheetOpen = false">
              <span class="mi"><Icon :name="s.icon" class="ico" /></span>
              {{ s.label }}
              <Icon name="lucide:chevron-right" class="go" />
            </NuxtLink>
          </li>
        </ul>
        <div class="sheet-btns" :style="{ '--i': SHEET.length }">
          <a :href="config.appUrl" class="sheet-signin">Sign in</a>
          <NuxtLink to="/contact-us" class="sheet-cta" @click="sheetOpen = false">Book a demo</NuxtLink>
        </div>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.hd {
  --hd-brand: var(--color-brand, #6366f1);
  --hd-brand-dark: var(--color-brand-dark, #4f46e5);
  --hd-ink: var(--color-ink, #1f2430);
  --hd-muted: var(--color-muted, #6b7280);
  --hd-line: #e8e9ee;
  --hd-tint: #f3f2fc;
  --hd-ease: cubic-bezier(.22, .8, .24, 1);
  position: sticky;
  top: 0;
  z-index: 50;
  height: 68px;
  color: var(--hd-ink);
}

.ico {
  flex: none;
}

/* ---------- The bar: docked to the top. Scrolling only firms it up (more solid, a soft
   shadow, a slightly smaller logo) - no gap above it and no change in height, so
   nothing on the page moves. ---------- */
.bar {
  --progress: 0;
  position: relative;
  height: 68px;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 max(clamp(16px, 3vw, 40px), calc((100% - 1160px) / 2));
  background: rgba(255, 255, 255, .72);
  border-bottom: 1px solid transparent;
  backdrop-filter: saturate(1.6) blur(14px);
  -webkit-backdrop-filter: saturate(1.6) blur(14px);
  transition: background-color .35s, border-color .35s, box-shadow .35s;
}

.scrolled .bar {
  background: rgba(255, 255, 255, .92);
  border-bottom-color: var(--hd-line);
  box-shadow: 0 10px 30px -22px rgba(26, 26, 46, .35);
}

/* While the mobile menu is open the bar is plain white, joined to the menu below. */
.sheet-open .bar {
  background: #fff;
  border-bottom-color: var(--hd-line);
  box-shadow: none;
}

.progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  border-radius: 0 2px 2px 0;
  background: linear-gradient(90deg, #a78bfa, var(--hd-brand));
  transform: scaleX(var(--progress));
  transform-origin: 0 50%;
  opacity: 0;
  transition: opacity .3s;
}

.scrolled .progress {
  opacity: 1;
}

.sheet-open .progress {
  opacity: 0;
}

.logo-link {
  display: inline-flex;
  flex: none;
}

.logo {
  height: 27px;
  width: auto;
  transform-origin: 0 50%;
  transition: transform .35s var(--hd-ease);
}

.scrolled .logo {
  transform: scale(.94);
}

/* ---------- Menu ---------- */
.nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.menu-wrap {
  position: relative;
}

.menu {
  display: flex;
  align-items: center;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* The soft pill: rests behind the active link and slides to the hovered one. */
.pill {
  position: absolute;
  left: 0;
  top: 50%;
  width: var(--w, 0);
  height: 38px;
  margin-top: -19px;
  background: var(--hd-tint);
  border-radius: 10px;
  opacity: 0;
  transform: translateX(var(--x, 0));
  transition: transform .35s var(--hd-ease), width .35s var(--hd-ease), opacity .2s;
  pointer-events: none;
}

.pill.on {
  opacity: 1;
}

.pill.jump {
  transition: opacity .2s;
}

/* The Platform menu centres on the whole menu (not its button), so it never runs off the page. */
.has-mega {
  position: static;
}

.item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  color: #4b5160;
  text-decoration: none;
  background: none;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  transition: color .2s;
}

.item:hover,
.item[aria-expanded="true"] {
  color: var(--hd-ink);
}

/* The active link (this page, or the home section in view): brand text, with the pill behind it. */
.item.current {
  color: var(--hd-brand);
}

.item:focus-visible {
  outline: 2px solid var(--hd-brand);
  outline-offset: 2px;
}

.chev {
  width: 15px;
  height: 15px;
  transition: transform .3s var(--hd-ease);
}

.item[aria-expanded="true"] .chev {
  transform: rotate(180deg);
}

/* ---------- Platform menu ---------- */
.mega {
  position: absolute;
  left: 50%;
  top: calc(100% + 14px);
  width: min(820px, calc(100vw - 32px));
  display: grid;
  grid-template-columns: minmax(0, 1fr) 248px;
  gap: 8px;
  padding: 8px;
  background: #fff;
  border: 1px solid var(--hd-line);
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(26, 26, 46, .04), 0 32px 64px -26px rgba(26, 26, 46, .38);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate(-50%, 8px) scale(.98);
  transform-origin: 50% 0;
  transition: opacity .22s, transform .3s var(--hd-ease), visibility .22s;
}

/* Bridges the gap between the button and the menu, so hovering across it keeps it open. */
.mega::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -16px;
  height: 16px;
}

.mega.open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translate(-50%, 0);
}

.mega-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 10px 6px 6px;
}

.mega-label {
  margin: 0 0 6px;
  padding: 0 10px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #9aa1ad;
}

.mega-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Items arrive one after another as the menu opens. */
.mega.open .mega-list li {
  animation: hd-in .4s var(--hd-ease) both;
  animation-delay: calc(.04s + var(--i, 0) * 30ms);
}

/* Icon tile on the left, title and line below it wrapping freely beside it. */
.mega-link {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 12px;
  color: var(--hd-ink);
  text-decoration: none;
  border-radius: 12px;
  transition: background-color .18s;
}

.mega-link:hover,
.mega-link:focus-visible {
  background: #f6f5fd;
  outline: none;
}

.mi {
  width: 40px;
  height: 40px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--hd-brand);
  background: var(--hd-tint);
  border-radius: 11px;
  transition: color .2s, background-color .2s, box-shadow .25s;
}

.mega-link .mi {
  width: 42px;
  height: 42px;
  color: var(--hd-ink);
  border-radius: 12px;
}

.mega-link:hover .mi,
.mega-link:focus-visible .mi {
  color: #fff;
  background: var(--hd-brand);
  box-shadow: 0 8px 16px -8px rgba(79, 70, 229, .7);
}

.mi .ico {
  width: 19px;
  height: 19px;
}

.mt {
  flex: 1;
  min-width: 0;
  display: grid;
}

.mt b {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
  text-wrap: balance;
}

.mt small {
  margin-top: 3px;
  font-size: 13.5px;
  line-height: 1.4;
  color: var(--hd-muted);
}

/* A small arrow slides in on the item under the pointer. */
.ml-go {
  width: 15px;
  height: 15px;
  flex: none;
  margin-top: 3px;
  color: var(--hd-brand);
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity .2s, transform .25s var(--hd-ease);
}

.mega-link:hover .ml-go,
.mega-link:focus-visible .ml-go {
  opacity: 1;
  transform: none;
}

.mega-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 8px 4px 0;
  padding: 12px 6px 4px;
  border-top: 1px solid #efeff4;
}

.mega-foot span {
  overflow: hidden;
  font-size: 12.5px;
  color: #9aa1ad;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mega-all {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: none;
  font-size: 14px;
  font-weight: 700;
  color: var(--hd-brand);
  text-decoration: none;
}

.mega-all .ico {
  width: 15px;
  height: 15px;
  transition: transform .25s var(--hd-ease);
}

.mega-all:hover .ico {
  transform: translateX(3px);
}

.mega-all:focus-visible {
  outline: 2px solid var(--hd-brand);
  outline-offset: 3px;
  border-radius: 6px;
}

/* The "try it" card: a fine grid fading across it and a small badge floating in it. */
.mega-feature {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  overflow: hidden;
  padding: 20px;
  color: #fff;
  text-decoration: none;
  background: radial-gradient(120% 90% at 100% 0%, #8b7cf6 0%, var(--hd-brand) 45%, #3b2fb0 100%);
  border-radius: 14px;
}

.mega-feature::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, .08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, .08) 1px, transparent 1px);
  background-size: 22px 22px;
  mask-image: linear-gradient(200deg, #000, transparent 70%);
  -webkit-mask-image: linear-gradient(200deg, #000, transparent 70%);
}

.mega-feature > * {
  position: relative;
  z-index: 1;
}

.mf-copy small {
  display: block;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
  opacity: .8;
}

.mf-copy b {
  display: block;
  margin-top: 6px;
  font-size: 17px;
  line-height: 1.3;
}

.mf-badge {
  position: absolute;
  right: 18px;
  bottom: 52px;
  width: 64px;
  height: 88px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  overflow: hidden;
  background: #fff;
  border-radius: 7px;
  box-shadow: 0 14px 26px -10px rgba(20, 16, 70, .55);
  rotate: 8deg;
  transition: rotate .45s var(--hd-ease), translate .45s var(--hd-ease);
}

.mega.open .mf-badge {
  animation: hd-float 5s ease-in-out infinite;
}

.mega-feature:hover .mf-badge {
  rotate: 2deg;
}

.mb-head {
  width: 100%;
  height: 20px;
  flex: none;
  margin-bottom: 4px;
  background: linear-gradient(135deg, #8b7cf6, var(--hd-brand));
}

.mb-line {
  height: 4px;
  border-radius: 2px;
  background: #d9dbe6;
}

.mb-line.w1 { width: 38px; background: #1f2430; }
.mb-line.w2 { width: 28px; }

.mb-qr {
  width: 26px;
  height: 26px;
  margin-top: 3px;
  border-radius: 3px;
  background:
    linear-gradient(90deg, #1f2430 50%, transparent 0) 0 0 / 6px 6px,
    linear-gradient(#1f2430 50%, transparent 0) 0 0 / 6px 6px;
  opacity: .85;
}

.mf-go {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
}

.mf-go .ico {
  width: 16px;
  height: 16px;
  transition: transform .25s var(--hd-ease);
}

.mega-feature:hover .mf-go .ico {
  transform: translateX(4px);
}

.mega-feature:focus-visible {
  outline: 2px solid var(--hd-brand);
  outline-offset: 2px;
}

@keyframes hd-in {
  from { opacity: 0; transform: translateY(6px); }
}

@keyframes hd-float {
  50% { translate: 0 -5px; }
}

/* ---------- Actions ---------- */
.actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
}

.signin {
  padding: 10px 14px;
  font-size: 15px;
  font-weight: 700;
  color: var(--hd-ink);
  text-decoration: none;
  border-radius: 10px;
  transition: background-color .2s;
}

.signin:hover {
  background: var(--hd-tint);
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 18px;
  font-size: 14.5px;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  background: var(--hd-brand);
  border-radius: 11px;
  box-shadow: 0 10px 22px -12px rgba(79, 70, 229, .7);
  transition: background-color .2s, box-shadow .25s, transform .25s var(--hd-ease);
}

.cta .ico {
  width: 16px;
  height: 16px;
  transition: transform .25s var(--hd-ease);
}

.cta:hover {
  background: var(--hd-brand-dark);
  transform: translateY(-1px);
}

.cta:hover .ico {
  transform: translateX(3px);
}

.signin:focus-visible,
.cta:focus-visible,
.menu-btn:focus-visible {
  outline: 2px solid var(--hd-brand);
  outline-offset: 2px;
}

/* The menu button: three bars that fold into an X. */
.menu-btn {
  display: none;
  width: 44px;
  height: 44px;
  place-items: center;
  padding: 0;
  background: #fff;
  border: 1px solid var(--hd-line);
  border-radius: 12px;
  cursor: pointer;
}

.burger {
  position: relative;
  width: 18px;
  height: 14px;
}

.burger i {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--hd-ink);
  border-radius: 2px;
  transition: transform .35s var(--hd-ease), opacity .2s, top .35s var(--hd-ease);
}

.burger i:nth-child(1) { top: 0; }
.burger i:nth-child(2) { top: 6px; }
.burger i:nth-child(3) { top: 12px; }

.menu-btn[aria-expanded="true"] .burger i:nth-child(1) { top: 6px; transform: rotate(45deg); }
.menu-btn[aria-expanded="true"] .burger i:nth-child(2) { opacity: 0; }
.menu-btn[aria-expanded="true"] .burger i:nth-child(3) { top: 6px; transform: rotate(-45deg); }

/* ---------- Mobile menu ---------- */
.sheet {
  position: fixed;
  inset: 68px 0 0;
  z-index: 49;
  overflow: auto;
  padding: 8px clamp(16px, 4vw, 40px) 28px;
  background: #fff;
}

.sheet ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 2px;
  font-size: 17px;
  font-weight: 700;
  color: var(--hd-ink);
  text-decoration: none;
  border-bottom: 1px solid var(--hd-line);
}

.row .mi {
  width: 38px;
  height: 38px;
  border-radius: 11px;
}

.row.current {
  color: var(--hd-brand);
}

.row.current .mi {
  color: #fff;
  background: var(--hd-brand);
}

.go {
  width: 18px;
  height: 18px;
  margin-left: auto;
  color: #a3a8b5;
}

.sheet-btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 22px;
}

.sheet-signin,
.sheet-cta {
  height: 48px;
  display: grid;
  place-items: center;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  border-radius: 12px;
}

.sheet-signin {
  color: var(--hd-ink);
  border: 1px solid var(--hd-line);
}

.sheet-cta {
  color: #fff;
  background: var(--hd-brand);
}

/* The sheet fades in and its rows rise one after another. */
.hd-sheet-enter-active,
.hd-sheet-leave-active {
  transition: opacity .25s ease;
}

.hd-sheet-enter-from,
.hd-sheet-leave-to {
  opacity: 0;
}

.hd-sheet-enter-active li,
.hd-sheet-enter-active .sheet-btns {
  animation: hd-row .45s var(--hd-ease) both;
  animation-delay: calc(var(--i, 0) * 35ms);
}

@keyframes hd-row {
  from { opacity: 0; transform: translateY(10px); }
}

/* ---------- Responsive ---------- */
/* Small laptops: the links sit a little closer, so the whole bar still fits. */
@media (max-width: 1200px) {
  .bar {
    gap: 16px;
  }

  .item {
    padding-inline: 10px;
  }
}

@media (max-width: 1040px) {
  .nav,
  .signin {
    display: none;
  }

  .actions {
    margin-left: auto;
  }

  .menu-btn {
    display: grid;
  }
}

@media (max-width: 480px) {
  .cta {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bar,
  .pill,
  .mega,
  .chev,
  .burger i,
  .cta,
  .cta .ico,
  .mf-go .ico {
    transition: none;
  }

  .hd-sheet-enter-active li,
  .hd-sheet-enter-active .sheet-btns,
  .mega.open .mega-list li,
  .mega.open .mf-badge {
    animation: none;
  }

  .logo,
  .ml-go,
  .mf-badge {
    transition: none;
  }
}
</style>
