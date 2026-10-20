<script setup lang="ts">
/**
 * The site footer (Figma: Footer), used by layouts/default.vue.
 *
 * Top: the logo, a line on what EXPOUSE is, the contact email and the app
 * store buttons, then four columns of links. Bottom: the copyright, the
 * English / Arabic switch and the social links. Under it all, a giant
 * EXPOUSE wordmark: when it scrolls into view its letters rise in one after
 * another, then a soft light passes along them every few seconds, and a
 * letter lifts when the pointer is over it. With reduced motion it is still.
 *
 * Destinations this site has no page for yet (about, privacy, terms, stores,
 * socials, the Arabic site) come from runtimeConfig.public and link to "#"
 * until set - see nuxt.config.ts.
 */
import { LINKEDIN_PATH, X_PATH } from '~/utils/brandIcons'

const config = useRuntimeConfig().public
const year = new Date().getFullYear()

/** A configured URL, or "#" until there is one. */
const url = (v?: string) => v || '#'

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'For organizers', to: '/#platform' },
      { label: 'For exhibitors', to: '/#platform' },
      { label: 'For attendees', to: '/#platform' },
      { label: 'Features', to: '/#features' },
    ],
  },
  {
    title: 'Onsite & apps',
    links: [
      { label: 'Check-in', to: '/#onsite' },
      { label: 'Badge designer', to: '/#badges' },
      { label: 'Mobile apps', to: '/#apps' },
      { label: 'Branded app', to: '/#branded' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', href: url(config.aboutUrl) },
      { label: 'Pricing', to: '/#pricing' },
      { label: 'FAQ', to: '/faq' },
      { label: 'News', to: '/news' },
      { label: 'Blog', to: '/blog' },
      { label: 'Media gallery', to: '/gallery' },
      { label: 'Contact', to: '/contact-us' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: url(config.privacyUrl) },
      { label: 'Terms of service', href: url(config.termsUrl) },
    ],
  },
]

const SOCIAL = [
  { key: 'linkedin', label: 'EXPOUSE on LinkedIn', href: url(config.social?.linkedin), path: LINKEDIN_PATH },
  { key: 'x', label: 'EXPOUSE on X', href: url(config.social?.x), path: X_PATH },
  { key: 'instagram', label: 'EXPOUSE on Instagram', href: url(config.social?.instagram) },
]

const APPLE = 'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701'

/** Off-site links open in a new tab; placeholders ("#") stay put. */
const ext = (href: string) => href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {}

const LETTERS = 'EXPOUSE'.split('')

const mark = ref<HTMLElement | null>(null)
const animate = ref(false)
const revealed = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const el = mark.value
  if (!el || !('IntersectionObserver' in window)) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // Already on screen (a short page, a restored scroll): leave it be rather than hide it.
  if (el.getBoundingClientRect().top < window.innerHeight) return

  animate.value = true
  observer = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting) return
    observer?.disconnect()
    revealed.value = true
  }, { threshold: .25 })
  observer.observe(el)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <footer class="ft">
    <div class="ft-rail">
      <!-- ---------- Top: about + link columns ---------- -->
      <div class="top">
        <div class="about">
          <NuxtLink to="/" class="logo-link" aria-label="EXPOUSE home">
            <AppLogo class="logo" />
          </NuxtLink>
          <p class="tagline">The all-in-one platform for expos, conferences and trade shows.</p>
          <a :href="`mailto:${config.contactEmail}`" class="mail">{{ config.contactEmail }}</a>
          <div class="stores">
            <a :href="url(config.stores?.appStore)" class="store" v-bind="ext(url(config.stores?.appStore))">
              <svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path :d="APPLE" /></svg>
              App Store
            </a>
            <a :href="url(config.stores?.googlePlay)" class="store" v-bind="ext(url(config.stores?.googlePlay))">
              <svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M6 3.6v16.8c0 .8.9 1.3 1.6.9l13.4-8.4c.6-.4.6-1.4 0-1.8L7.6 2.7C6.9 2.3 6 2.8 6 3.6z" /></svg>
              Google Play
            </a>
          </div>
        </div>

        <nav v-for="c in COLUMNS" :key="c.title" class="col" :aria-label="c.title">
          <h2 class="col-title">{{ c.title }}</h2>
          <ul>
            <li v-for="l in c.links" :key="l.label">
              <NuxtLink v-if="l.to" :to="l.to" class="link">{{ l.label }}</NuxtLink>
              <a v-else :href="l.href" class="link" v-bind="ext(l.href!)">{{ l.label }}</a>
            </li>
          </ul>
        </nav>
      </div>

      <!-- ---------- Bottom: copyright, language, socials ---------- -->
      <div class="bottom">
        <p class="copy">© {{ year }} EXPOUSE. All rights reserved.</p>

        <!-- <nav class="lang" aria-label="Language">
          <span class="lang-btn on" aria-current="true">English</span>
          <a :href="url(config.arabicUrl)" class="lang-btn" lang="ar" hreflang="ar">العربية</a>
        </nav> -->

        <ul class="social">
          <li v-for="s in SOCIAL" :key="s.key">
            <a :href="s.href" :aria-label="s.label" class="soc" v-bind="ext(s.href)">
              <svg v-if="s.path" viewBox="0 0 24 24" class="ico" aria-hidden="true"><path :d="s.path" /></svg>
              <svg v-else viewBox="0 0 24 24" class="ico ig" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4.2" class="hole" />
                <circle cx="17.3" cy="6.7" r="1.25" class="hole-dot" />
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- ---------- The giant wordmark ---------- -->
    <div ref="mark" class="mark" :class="{ 'ft--animate': animate, in: revealed }" aria-hidden="true">
      <span v-for="(ch, i) in LETTERS" :key="i" class="ch" :style="{ '--i': i }">{{ ch }}</span>
    </div>
  </footer>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.ft {
  --ft-brand: var(--color-brand, #6366f1);
  --ft-ink: var(--color-ink, #1f2430);
  --ft-muted: var(--color-muted, #6b7280);
  --ft-line: #e4e1f4;
  --ft-ease: cubic-bezier(.22, .8, .24, 1);
  overflow: hidden;
  color: var(--ft-ink);
  background: #f3f2fc;
}

.ft-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(48px, 6vw, 72px) clamp(16px, 3vw, 40px) 0;
}

.ico {
  flex: none;
}

/* ---------- Top ---------- */
.top {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) repeat(4, minmax(0, 1fr));
  gap: 40px 32px;
}

.logo {
  height: 28px;
  width: auto;
}

.logo-link {
  display: inline-flex;
}

.tagline {
  margin: 20px 0 0;
  max-width: 300px;
  font-size: 16px;
  line-height: 1.6;
  color: var(--ft-muted);
}

.mail {
  display: inline-block;
  margin-top: 18px;
  font-size: 16px;
  font-weight: 500;
  color: var(--ft-brand);
  text-decoration: none;
}

.mail:hover {
  text-decoration: underline;
}

.stores {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 26px;
}

.store {
  height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 0 14px;
  font-size: 15px;
  font-weight: 500;
  color: var(--ft-ink);
  text-decoration: none;
  background: #fff;
  border: 1px solid var(--ft-line);
  border-radius: 10px;
  transition: border-color .2s, box-shadow .25s, transform .25s var(--ft-ease);
}

.store .ico {
  width: 17px;
  height: 17px;
  fill: currentColor;
}

.store:hover {
  border-color: #cfccf0;
  box-shadow: 0 12px 24px -16px rgba(76, 61, 190, .45);
  transform: translateY(-1px);
}

.col-title {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.col ul {
  display: grid;
  gap: 14px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.link {
  position: relative;
  font-size: 15.5px;
  color: var(--ft-muted);
  text-decoration: none;
  transition: color .2s;
}

/* A brand underline that draws in from the left on hover. */
.link::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -3px;
  height: 1.5px;
  background: var(--ft-brand);
  border-radius: 2px;
  transform: scaleX(0);
  transform-origin: 0 50%;
  transition: transform .3s var(--ft-ease);
}

.link:hover {
  color: var(--ft-brand);
}

.link:hover::after {
  transform: scaleX(1);
}

.link:focus-visible,
.store:focus-visible,
.soc:focus-visible,
.lang-btn:focus-visible,
.mail:focus-visible {
  outline: 2px solid var(--ft-brand);
  outline-offset: 3px;
  border-radius: 6px;
}

/* ---------- Bottom ---------- */
.bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-top: 48px;
  padding: 24px 0;
  border-top: 1px solid var(--ft-line);
}

.copy {
  margin: 0;
  font-size: 15px;
  color: var(--ft-muted);
}

.lang {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #fff;
  border: 1px solid var(--ft-line);
  border-radius: 11px;
}

.lang-btn {
  padding: 6px 16px;
  font-size: 15px;
  font-weight: 500;
  color: var(--ft-muted);
  text-decoration: none;
  border-radius: 7px;
  transition: color .2s, background-color .2s;
}

.lang-btn:hover:not(.on) {
  color: var(--ft-ink);
  background: #f3f2fc;
}

.lang-btn.on {
  color: #fff;
  background: var(--ft-brand);
}

.social {
  justify-self: end;
  display: flex;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.soc {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  color: var(--ft-ink);
  background: #fff;
  border: 1px solid var(--ft-line);
  border-radius: 9px;
  transition: color .2s, background-color .2s, border-color .2s, transform .25s var(--ft-ease);
}

.soc .ico {
  width: 17px;
  height: 17px;
  fill: currentColor;
}

/* Instagram: a filled rounded square with the lens cut out (in the button's colour). */
.soc .ig .hole,
.soc .ig .hole-dot {
  fill: #fff;
  transition: fill .2s;
}

.soc:hover {
  color: #fff;
  background: var(--ft-brand);
  border-color: var(--ft-brand);
  transform: translateY(-2px);
}

.soc:hover .ig .hole,
.soc:hover .ig .hole-dot {
  fill: var(--ft-brand);
}

/* ---------- The giant wordmark ---------- */
.mark {
  display: flex;
  justify-content: center;
  margin-top: clamp(12px, 3vw, 36px);
  padding: 0 16px clamp(10px, 2vw, 24px);
  font-size: clamp(72px, 17vw, 220px);
  font-weight: 800;
  line-height: .82;
  letter-spacing: -.01em;
  user-select: none;
}

/* Each letter carries its own light, so the light can run along the word letter by letter. */
.ch {
  display: inline-block;
  padding-bottom: .06em;
  color: transparent;
  background: linear-gradient(105deg, #e8e6f8 42%, #d5cffa 50%, #e8e6f8 58%) 100% 0 / 260% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  animation: ft-shine 7s ease-in-out infinite;
  animation-delay: calc(1.2s + var(--i, 0) * .11s);
  transition: transform .45s var(--ft-ease), filter .45s;
}

.ch:hover {
  transform: translateY(-.06em);
  filter: drop-shadow(0 18px 24px rgba(99, 102, 241, .18));
}

@keyframes ft-shine {
  0% { background-position: 100% 0; }
  22%, 100% { background-position: 0% 0; }
}

/* Entrance: the letters rise in one after another. */
.ft--animate .ch {
  opacity: 0;
  transform: translateY(45%);
}

.ft--animate.in .ch {
  opacity: 1;
  transform: none;
  transition: opacity .8s var(--ft-ease), transform .9s var(--ft-ease), filter .45s;
  transition-delay: calc(var(--i, 0) * 70ms), calc(var(--i, 0) * 70ms), 0s;
}

.ft--animate.in .ch:hover {
  transform: translateY(-.06em);
  transition-delay: 0s;
}

/* ---------- Responsive ---------- */
@media (max-width: 1023px) {
  .top {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .about {
    grid-column: 1 / -1;
  }
}

@media (max-width: 700px) {
  .top {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 36px 24px;
  }

  .bottom {
    grid-template-columns: minmax(0, 1fr);
    justify-items: center;
    text-align: center;
    gap: 18px;
  }

  .social {
    justify-self: center;
  }

  .copy {
    order: 3;
    font-size: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ch {
    animation: none;
    transition: none;
  }

  .ch:hover {
    transform: none;
  }

  .link::after,
  .store,
  .soc {
    transition: none;
  }
}
</style>
