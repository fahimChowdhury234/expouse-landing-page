<script setup lang="ts">
/**
 * 12 · Book a demo.
 *
 * A wide brand banner before the FAQ: a headline, a line on what the demo
 * covers, one button to the contact page (/contact-us) and a short note on
 * what to expect. Four event photos from the gallery (public/images/gallery)
 * are pinned at the sides like prints, with two small product cards floating
 * over them (a check-in, a new lead); the middle stays clear for the copy.
 *
 * Motion, all of it gentle: on the way in the copy rises line by line, the
 * prints swing in from the sides and the cards pop up last; after that the
 * prints and cards drift on their own, a soft light moves slowly across the
 * banner, and the whole scene leans a little toward the pointer (each layer
 * by its own depth). With reduced motion nothing moves; without JS, or when
 * the banner is already on screen at load, it is simply shown.
 */
const PHOTOS = [
  { src: '/images/gallery/event-4.webp', cls: 'l1', depth: 10 },
  { src: '/images/gallery/event-5.webp', cls: 'l2', depth: 16 },
  { src: '/images/gallery/event-6.webp', cls: 'r1', depth: 12 },
  { src: '/images/gallery/event-1.webp', cls: 'r2', depth: 18 },
]

const banner = ref<HTMLElement | null>(null)
const animate = ref(false)
const revealed = ref(false)
let observer: IntersectionObserver | null = null

/* ---------- Pointer parallax: --mx / --my run from -1 to 1 across the banner ---------- */
let frame = 0
let px = 0
let py = 0

function onMove(e: PointerEvent) {
  const el = banner.value
  if (!el || e.pointerType !== 'mouse') return
  const r = el.getBoundingClientRect()
  px = ((e.clientX - r.left) / r.width) * 2 - 1
  py = ((e.clientY - r.top) / r.height) * 2 - 1
  if (!frame) frame = requestAnimationFrame(apply)
}

function onLeave() {
  px = 0
  py = 0
  if (!frame) frame = requestAnimationFrame(apply)
}

function apply() {
  frame = 0
  banner.value?.style.setProperty('--mx', px.toFixed(3))
  banner.value?.style.setProperty('--my', py.toFixed(3))
}

const still = ref(true)

onMounted(() => {
  const el = banner.value
  if (!el) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  still.value = false
  if (!('IntersectionObserver' in window)) return
  // Already on screen (a tall window, a restored scroll): leave it be rather than hide it.
  if (el.getBoundingClientRect().top < window.innerHeight) return

  animate.value = true
  observer = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting) return
    observer?.disconnect()
    revealed.value = true
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0 })
  observer.observe(el)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <section id="book-demo" class="dc" aria-labelledby="dc-title">
    <div class="dc-rail">
      <div
        ref="banner"
        class="banner"
        :class="{ 'dc--animate': animate, in: revealed, still }"
        @pointermove="still ? undefined : onMove($event)"
        @pointerleave="still ? undefined : onLeave()"
      >
        <i class="glow" aria-hidden="true" />
        <i class="dots" aria-hidden="true" />

        <div class="scene" aria-hidden="true">
          <figure
            v-for="(p, i) in PHOTOS"
            :key="p.cls"
            class="photo"
            :class="p.cls"
            :style="{ '--i': i, '--d': p.depth }"
          >
            <span class="print">
              <img :src="p.src" alt="" loading="lazy" decoding="async">
            </span>
          </figure>

          <div class="chip c-in" style="--i: 0; --d: 22">
            <span class="dot ok"><Icon name="lucide:check" class="ico" /></span>
            <span class="txt"><b>Checked in</b><small>Gate A · 09:41</small></span>
          </div>
          <div class="chip c-lead" style="--i: 1; --d: 26">
            <span class="dot hot"><Icon name="lucide:funnel" class="ico" /></span>
            <span class="txt"><b>New lead · Omar Saleh</b><small>Booth B-214 · <em>HOT 92</em></small></span>
          </div>
        </div>

        <div class="copy">
          <span class="mark rise" style="--k: 0"><AppLogo class="logo" /></span>
          <h2 id="dc-title" class="title rise" style="--k: 1">See your event running on EXPOUSE in 30&nbsp;minutes</h2>
          <p class="sub rise" style="--k: 2">Tell us what you're planning. We'll walk you through it live, from the registration form to the report your exhibitors get afterwards.</p>
          <div class="rise" style="--k: 3">
            <NuxtLink to="/contact-us" class="cta">
              <span>Book a call</span>
              <Icon name="lucide:arrow-right" class="ico" />
            </NuxtLink>
          </div>
          <ul class="notes rise" style="--k: 4">
            <li><Icon name="lucide:clock" class="ico" />30-minute call</li>
            <li><Icon name="lucide:calendar-check" class="ico" />We reply within a working day</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.dc {
  --dc-brand: var(--color-brand, #6366f1);
  --dc-brand-dark: var(--color-brand-dark, #4f46e5);
  --dc-ink: var(--color-ink, #1f2430);
  --dc-ease: cubic-bezier(.22, .8, .24, 1);
  background: #fff;
}

.dc-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(40px, 6vw, 72px) clamp(12px, 3vw, 40px) 0;
}

/* ---------- Banner ---------- */
.banner {
  --mx: 0;
  --my: 0;
  position: relative;
  isolation: isolate;
  min-height: 470px;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 60px 24px;
  border: 1px solid #e7e3fb;
  border-radius: 24px;
  background: linear-gradient(135deg, #efecfe 0%, #f8f7ff 46%, #e8e4fd 100%);
}

/* A soft light that wanders slowly behind everything. */
.glow {
  position: absolute;
  z-index: -1;
  left: 50%;
  top: 50%;
  width: 760px;
  height: 520px;
  margin: -260px 0 0 -380px;
  border-radius: 50%;
  background:
    radial-gradient(closest-side at 30% 40%, rgba(167, 139, 250, .42), transparent),
    radial-gradient(closest-side at 72% 62%, rgba(99, 102, 241, .28), transparent);
  filter: blur(20px);
  animation: dc-wander 16s ease-in-out infinite alternate;
}

/* A faint dot grid, strongest in the middle. */
.dots {
  position: absolute;
  z-index: -1;
  inset: 0;
  background-image: radial-gradient(rgba(99, 102, 241, .16) 1px, transparent 1.4px);
  background-size: 22px 22px;
  mask-image: radial-gradient(60% 70% at 50% 50%, #000, transparent);
  -webkit-mask-image: radial-gradient(60% 70% at 50% 50%, #000, transparent);
}

/* ---------- Copy ---------- */
.copy {
  position: relative;
  z-index: 2;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.mark {
  display: grid;
  place-items: center;
  padding: 10px 16px;
  background: rgba(255, 255, 255, .78);
  border: 1px solid #fff;
  border-radius: 12px;
  box-shadow: 0 10px 24px -16px rgba(76, 61, 190, .45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.logo {
  height: 22px;
  width: auto;
}

.title {
  margin: 24px 0 0;
  font-size: clamp(28px, 3.4vw, 42px);
  font-weight: 800;
  line-height: 1.14;
  letter-spacing: -.03em;
  color: var(--dc-ink);
  text-wrap: balance;
}

.sub {
  margin: 14px 0 0;
  max-width: 500px;
  font-size: 16.5px;
  line-height: 1.65;
  color: #4b5160;
}

/* The button, with a light that sweeps across it on hover. */
.cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 28px;
  padding: 15px 28px;
  overflow: hidden;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  background: var(--dc-brand);
  border-radius: 999px;
  box-shadow: 0 18px 34px -16px rgba(79, 70, 229, .7);
  transition: background-color .2s, box-shadow .25s, transform .25s var(--dc-ease);
}

.cta::after {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 40%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, .35), transparent);
  transform: translateX(-160%) skewX(-18deg);
}

.cta:hover {
  background: var(--dc-brand-dark);
  box-shadow: 0 22px 38px -16px rgba(79, 70, 229, .8);
  transform: translateY(-2px);
}

.cta:hover::after {
  transform: translateX(320%) skewX(-18deg);
  transition: transform .8s var(--dc-ease);
}

.cta .ico {
  width: 18px;
  height: 18px;
  transition: transform .25s var(--dc-ease);
}

.cta:hover .ico {
  transform: translateX(3px);
}

.cta:focus-visible {
  outline: 3px solid var(--dc-brand);
  outline-offset: 3px;
}

.notes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 20px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
  font-size: 13.5px;
  font-weight: 500;
  color: #5b6070;
}

.notes li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.notes .ico {
  width: 15px;
  height: 15px;
  color: var(--dc-brand);
}

/* ---------- Scene: prints at the sides, cards over them ---------- */
.scene {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

/* Each layer leans toward the pointer by its own depth (--d, in px at the banner's edge). */
.photo,
.chip {
  position: absolute;
  transform: translate3d(calc(var(--mx) * var(--d) * 1px), calc(var(--my) * var(--d) * .6px), 0);
  transition: transform .6s var(--dc-ease);
}

.photo {
  --rot: 0deg;
  margin: 0;
}

.print {
  display: block;
  padding: 8px 8px 24px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(31, 36, 48, .06), 0 26px 44px -24px rgba(49, 40, 140, .5);
  rotate: var(--rot);
  animation: dc-drift 8s ease-in-out infinite;
  animation-delay: calc(var(--i, 0) * -2s);
  transition: rotate .7s var(--dc-ease);
}

.print img {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1.05;
  object-fit: cover;
  border-radius: 2px;
  background: #e4e0fb;
}

/* Hovering the banner straightens the prints a little. */
.banner:hover .print {
  rotate: calc(var(--rot) * .4);
}

.l1 { --rot: -7deg; left: 3.5%; top: 10%; width: 150px; }
.l2 { --rot: 6deg; left: 12.5%; top: 47%; width: 142px; }
.r1 { --rot: 6deg; right: 13%; top: 8%; width: 138px; }
.r2 { --rot: -6deg; right: 3.5%; top: 41%; width: 156px; }

/* Small product cards floating over the prints. */
.chip {
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px 10px 10px;
  white-space: nowrap;
  background: rgba(255, 255, 255, .94);
  border: 1px solid #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(31, 36, 48, .05), 0 16px 32px -16px rgba(31, 36, 48, .28);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.chip > * {
  animation: dc-bob 6s ease-in-out infinite;
  animation-delay: calc(var(--i, 0) * -3s);
}

.c-in { left: 1.5%; bottom: 9%; }
.c-lead { right: 2%; top: 5%; }

.dot {
  width: 30px;
  height: 30px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 9px;
}

.dot .ico {
  width: 15px;
  height: 15px;
}

.dot.ok { color: #16a34a; background: #e7f8ee; }
.dot.hot { color: #dc2626; background: #fdecec; }

.txt {
  display: grid;
  line-height: 1.3;
}

.txt b {
  font-size: 13px;
  font-weight: 700;
  color: var(--dc-ink);
}

.txt small {
  font-size: 11.5px;
  color: #6b7280;
}

.txt em {
  padding: 0 6px;
  font-size: 10.5px;
  font-style: normal;
  font-weight: 700;
  color: #dc2626;
  background: #fdecec;
  border-radius: 999px;
}

@keyframes dc-drift {
  50% { translate: 0 -7px; }
}

@keyframes dc-bob {
  50% { transform: translateY(-5px); }
}

@keyframes dc-wander {
  0% { transform: translate(-60px, -20px) scale(1); }
  100% { transform: translate(60px, 24px) scale(1.12); }
}

/* ---------- Entrance: copy rises line by line, prints swing in, cards pop up ----------
 * The hidden state applies at once; only the reveal (.in) is animated. */
.dc--animate .rise {
  opacity: 0;
  transform: translateY(18px);
}

.dc--animate .print {
  opacity: 0;
  transform: translateY(30px) scale(.86);
  rotate: calc(var(--rot) * 2.4);
}

.dc--animate .chip {
  opacity: 0;
  scale: .85;
}

.dc--animate.in .rise,
.dc--animate.in .print,
.dc--animate.in .chip {
  opacity: 1;
  transform: none;
  scale: 1;
}

.dc--animate.in .rise {
  transition: opacity .7s var(--dc-ease), transform .7s var(--dc-ease);
  transition-delay: calc(.05s + var(--k, 0) * 90ms);
}

.dc--animate.in .print {
  rotate: var(--rot);
  transition: opacity .7s var(--dc-ease), transform .9s var(--dc-ease), rotate .9s var(--dc-ease);
  transition-delay: calc(.2s + var(--i, 0) * 110ms);
}

.dc--animate.in .chip {
  transition: opacity .5s var(--dc-ease), scale .6s var(--dc-ease), transform .6s var(--dc-ease);
  transition-delay: calc(.8s + var(--i, 0) * 160ms), calc(.8s + var(--i, 0) * 160ms), 0s;
}

/* After the entrance, hovering still straightens the prints, without waiting. */
.dc--animate.in.banner:hover .print {
  rotate: calc(var(--rot) * .4);
  transition-delay: 0s;
}

/* The pointer lean on the cards keeps working after the entrance. */
.dc--animate.in .chip {
  transform: translate3d(calc(var(--mx) * var(--d) * 1px), calc(var(--my) * var(--d) * .6px), 0);
}

/* Narrower: smaller prints, the cards tucked in. */
@media (max-width: 1100px) {
  .l1, .r2 { width: 124px; }
  .l2, .r1 { width: 116px; }
  .l2 { left: 8%; }
  .r1 { right: 10%; }
  .c-lead { display: none; }
}

/* Tablets and phones: three prints in a row above the copy; the cards put away. */
@media (max-width: 860px) {
  .banner {
    min-height: 0;
    padding: 36px 20px 40px;
    gap: 26px;
  }

  .scene {
    position: static;
    display: flex;
    justify-content: center;
  }

  .photo {
    position: static;
    width: 108px;
    transform: none;
  }

  .photo + .photo {
    margin-left: -14px;
  }

  .r2,
  .chip {
    display: none;
  }

  .l2 {
    --rot: 2deg;
    z-index: 1;
  }

  .print {
    padding: 6px 6px 18px;
  }
}

@media (max-width: 420px) {
  .photo {
    width: 92px;
  }

  .sub {
    font-size: 15.5px;
  }

  .cta {
    width: 100%;
    justify-content: center;
  }
}

/* Reduced motion: everything holds still. */
.still .glow,
.still .print,
.still .chip > * {
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  .glow,
  .print,
  .chip > * {
    animation: none;
  }

  .print,
  .photo,
  .chip,
  .cta,
  .cta .ico,
  .cta::after {
    transition: none;
  }

  .banner:hover .print {
    rotate: var(--rot);
  }
}
</style>
