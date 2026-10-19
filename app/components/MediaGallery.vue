<script setup lang="ts">
/**
 * 11 · Media gallery.
 *
 * Photos from events run on EXPOUSE, in the Figma frame's mosaic: one large
 * tile, two small and a wide one beside it, then two small and a wide one
 * below. Each tile carries a caption chip (event, city, year). Hovering a tile
 * slowly zooms the photo; clicking opens it full size in a lightbox with
 * previous / next (arrow keys) and Esc to close. The tiles rise in one after
 * another when they scroll into view.
 *
 * Photos live in public/images/gallery/. A missing photo shows a soft brand
 * placeholder instead of a broken image, so the layout holds while photos are
 * being added.
 *
 * PLACEHOLDER CAPTIONS: "Event name" / "City" - replace with the real events.
 */
type Photo = {
  src: string
  alt: string
  event: string
  city: string
  year: number
  /** Grid area in the mosaic (see .grid). */
  area: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'
}

const PHOTOS: Photo[] = [
  { src: '/images/gallery/event-1.webp', alt: 'Performers on stage in front of a giant LED screen at an opening ceremony', event: 'Event name', city: 'City', year: 2026, area: 'a' },
  { src: '/images/gallery/event-2.webp', alt: 'Speakers on a stage in front of a panoramic LED wall', event: 'Event name', city: 'City', year: 2026, area: 'b' },
  { src: '/images/gallery/event-3.webp', alt: 'A choir performing in front of an LED screen', event: 'Event name', city: 'City', year: 2025, area: 'c' },
  { src: '/images/gallery/event-4.webp', alt: 'Guests seated at a conference session', event: 'Event name', city: 'City', year: 2025, area: 'd' },
  { src: '/images/gallery/event-5.webp', alt: 'A packed audience in an exhibition hall', event: 'Event name', city: 'City', year: 2025, area: 'e' },
  { src: '/images/gallery/event-6.webp', alt: 'A speaker on stage before a large audience under bright lights', event: 'Event name', city: 'City', year: 2024, area: 'f' },
  { src: '/images/gallery/event-7.webp', alt: 'An exhibition hall with a curved LED wall', event: 'Event name', city: 'City', year: 2024, area: 'g' },
]

/* ---------------- Missing photos ---------------- */
const failed = ref<boolean[]>(PHOTOS.map(() => false))
const imgEls: HTMLImageElement[] = []
const setImg = (i: number) => (el: unknown) => {
  if (el) imgEls[i] = el as HTMLImageElement
}

/* ---------------- Reveal ---------------- */
const grid = ref<HTMLElement | null>(null)
const animate = ref(false)
const revealed = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  // A photo that failed before the page was interactive never fired our error handler.
  imgEls.forEach((img, i) => {
    if (img?.complete && img.naturalWidth === 0) failed.value[i] = true
  })

  const el = grid.value
  if (!el || !('IntersectionObserver' in window)) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // Already on screen (a tall window, a restored scroll): leave the tiles be rather than hide them.
  if (el.getBoundingClientRect().top < window.innerHeight) return

  animate.value = true
  observer = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting) return
    observer?.disconnect()
    revealed.value = true
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 })
  observer.observe(el)
})

/* ---------------- Lightbox ---------------- */
const dialog = ref<HTMLDialogElement | null>(null)
const open = ref<number | null>(null)
const shown = computed(() => (open.value === null ? null : PHOTOS[open.value]!))
let opener: HTMLElement | null = null

function show(i: number, e: MouseEvent) {
  opener = e.currentTarget as HTMLElement
  open.value = i
  dialog.value?.showModal()
}

function step(by: number) {
  if (open.value === null) return
  open.value = (open.value + by + PHOTOS.length) % PHOTOS.length
}

function close() {
  dialog.value?.close()
}

function onClosed() {
  open.value = null
  opener?.focus()
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'ArrowLeft') step(-1)
}

/** A click on the dimmed backdrop (the dialog itself, outside its content) closes it. */
function onBackdrop(e: MouseEvent) {
  if (e.target === dialog.value) close()
}

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <section id="gallery" class="mg" aria-labelledby="mg-title">
    <div class="mg-rail">
      <header class="mg-head">
        <p class="mg-eyebrow">Media gallery</p>
        <h2 id="mg-title" class="mg-title">Photos from <br>events we've worked on</h2>
        <p class="mg-sub">A few shots from expos and conferences that ran on EXPOUSE.</p>
      </header>

      <ul ref="grid" class="grid" :class="{ 'mg--animate': animate, in: revealed }">
        <li v-for="(p, i) in PHOTOS" :key="p.src" class="tile" :style="{ gridArea: p.area, '--i': i }">
          <button type="button" class="shot" :aria-label="`View photo: ${p.alt}`" @click="show(i, $event)">
            <span class="ph" aria-hidden="true"><Icon name="lucide:image" class="ico" /></span>
            <img
              v-if="!failed[i]"
              :ref="setImg(i)"
              :src="p.src"
              :alt="p.alt"
              loading="lazy"
              decoding="async"
              @error="failed[i] = true"
            >
          </button>
          <span class="cap">
            <b>{{ p.event }}</b>
            <small><i />{{ p.city }} · {{ p.year }}</small>
          </span>
        </li>
      </ul>

      <div class="more">
        <NuxtLink to="/#platform" class="btn-more">See how it works</NuxtLink>
      </div>
    </div>

    <dialog ref="dialog" class="lb" aria-label="Photo" @close="onClosed" @keydown="onKey" @click="onBackdrop">
      <div v-if="shown && open !== null" class="lb-box">
        <figure class="lb-fig">
          <span class="ph" aria-hidden="true"><Icon name="lucide:image" class="ico" /></span>
          <img v-if="!failed[open]" :src="shown.src" :alt="shown.alt">
          <figcaption>
            <b>{{ shown.event }}</b>
            <small>{{ shown.city }} · {{ shown.year }}</small>
            <span class="count">{{ open + 1 }} / {{ PHOTOS.length }}</span>
          </figcaption>
        </figure>
        <button type="button" class="lb-btn prev" aria-label="Previous photo" @click="step(-1)"><Icon name="lucide:chevron-left" class="ico" /></button>
        <button type="button" class="lb-btn next" aria-label="Next photo" @click="step(1)"><Icon name="lucide:chevron-right" class="ico" /></button>
        <button type="button" class="lb-btn close" aria-label="Close" @click="close"><Icon name="lucide:x" class="ico" /></button>
      </div>
    </dialog>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.mg {
  --mg-brand: var(--color-brand, #6452E7 );
  --mg-ink: var(--color-ink, #1f2430);
  --mg-muted: var(--color-muted, #6b7280);
  --mg-line: var(--color-line, #e8e9ee);
  --mg-ease: cubic-bezier(.22, .8, .24, 1);
  color: var(--mg-ink);
  background: #fff;
}

.mg-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(12px, 3vw, 40px) clamp(56px, 7vw, 88px);
}

/* ---------- Heading ---------- */
.mg-head {
  max-width: 720px;
  margin: 0 auto clamp(32px, 4.5vw, 56px);
  text-align: center;
}

.mg-eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--mg-brand);
}

.mg-title {
  margin: 8px 0 0;
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.03em;
  text-wrap: balance;
}

.mg-sub {
  margin: 12px auto 0;
  max-width: 640px;
  font-size: 17px;
  line-height: 1.6;
  color: var(--mg-muted);
}

/* ---------- Mosaic ---------- */
.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: clamp(170px, 19vw, 228px);
  grid-template-areas:
    "a a b c"
    "a a d d"
    "e f g g";
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tile {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--mg-line);
  background: #fff;
}

.shot {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: zoom-in;
}

.shot:focus-visible {
  outline: 3px solid var(--mg-brand);
  outline-offset: -3px;
}

.shot img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s var(--mg-ease);
}

.tile:hover .shot img {
  transform: scale(1.05);
}

/* Shown under the photo, and in its place while the photo is missing. */
.ph {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background:
    radial-gradient(70% 70% at 30% 20%, color-mix(in srgb, var(--mg-brand) 18%, #fff), transparent 70%),
    color-mix(in srgb, var(--mg-brand) 8%, #fff);
  color: color-mix(in srgb, var(--mg-brand) 45%, #fff);
}

.ph .ico {
  width: 32px;
  height: 32px;
}

/* Caption chip, bottom left, as in the Figma frame. */
.cap {
  position: absolute;
  left: 16px;
  bottom: 16px;
  display: grid;
  gap: 2px;
  max-width: calc(100% - 32px);
  padding: 10px 16px 11px;
  border-radius: 10px;
  background: rgba(255, 255, 255, .96);
  box-shadow: 0 10px 24px -14px rgba(20, 23, 40, .45);
  pointer-events: none;
  transition: transform .4s var(--mg-ease);
}

.tile:hover .cap {
  transform: translateY(-3px);
}

.cap b {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cap small {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13.5px;
  color: var(--mg-muted);
  white-space: nowrap;
}

.cap i {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--mg-brand);
}

.more {
  display: flex;
  justify-content: center;
  margin-top: clamp(28px, 4vw, 40px);
}

.btn-more {
  display: inline-flex;
  align-items: center;
  padding: 13px 32px;
  border: 1px solid var(--mg-line);
  border-radius: 10px;
  background: #fff;
  color: var(--mg-ink);
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 1px 2px rgba(20, 23, 40, .05);
  transition: border-color .2s, color .2s;
}

.btn-more:hover {
  border-color: color-mix(in srgb, var(--mg-brand) 35%, #fff);
  color: var(--mg-brand);
}

/* ---------- Reveal: tiles rise in one after another ---------- */
.mg--animate .tile {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity .8s var(--mg-ease), transform .8s var(--mg-ease);
  transition-delay: calc(var(--i, 0) * 70ms);
}

.mg--animate.in .tile {
  opacity: 1;
  transform: none;
}

/* ---------- Lightbox ---------- */
.lb {
  width: min(1100px, calc(100vw - 32px));
  max-width: none;
  /* The site's CSS reset zeroes margins; auto is what centres a modal dialog. */
  margin: auto;
  max-height: calc(100vh - 32px);
  padding: 0;
  border: 0;
  background: transparent;
  overflow: visible;
}

/* Focus goes to the buttons inside; the dialog box itself needs no ring. */
.lb:focus,
.lb:focus-visible {
  outline: none;
}

.lb::backdrop {
  background: rgba(15, 16, 32, .82);
  backdrop-filter: blur(4px);
}

.lb[open] {
  animation: mg-in .3s var(--mg-ease);
}

@keyframes mg-in {
  from {
    opacity: 0;
    transform: scale(.97);
  }
}

.lb-box {
  position: relative;
}

.lb-fig {
  position: relative;
  margin: 0;
  overflow: hidden;
  border-radius: 14px;
  background: #0f1020;
  aspect-ratio: 3 / 2;
  max-height: calc(100vh - 32px);
}

.lb-fig img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* The whole photo, uncropped. */
  object-fit: contain;
}

.lb-fig figcaption {
  position: absolute;
  left: 20px;
  bottom: 20px;
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, .96);
  color: var(--mg-ink);
}

.lb-fig figcaption b {
  font-size: 15px;
}

.lb-fig figcaption small {
  font-size: 13.5px;
  color: var(--mg-muted);
}

.lb-fig .count {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--mg-brand);
}

.lb-btn {
  position: absolute;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, .95);
  color: var(--mg-ink);
  box-shadow: 0 8px 20px -8px rgba(0, 0, 0, .4);
  cursor: pointer;
  transition: transform .2s var(--mg-ease), color .2s;
}

.lb-btn:hover {
  color: var(--mg-brand);
  transform: scale(1.06);
}

.lb-btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

.lb-btn .ico {
  width: 20px;
  height: 20px;
}

.lb-btn.prev,
.lb-btn.next {
  top: 50%;
  margin-top: -22px;
}

.lb-btn.prev {
  left: 14px;
}

.lb-btn.next {
  right: 14px;
}

.lb-btn.close {
  top: 14px;
  right: 14px;
}

/* Tablets: two columns, the large tile on top. */
@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: clamp(150px, 30vw, 220px);
    grid-template-areas:
      "a a"
      "a a"
      "b c"
      "d d"
      "e f"
      "g g";
  }
}

/* Phones: smaller chips so they don't cover the small tiles. */
@media (max-width: 560px) {
  .grid {
    gap: 10px;
  }

  .cap {
    left: 10px;
    bottom: 10px;
    max-width: calc(100% - 20px);
    padding: 7px 10px 8px;
  }

  .cap b {
    font-size: 13px;
  }

  .cap small {
    font-size: 11.5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shot img,
  .cap,
  .lb-btn {
    transition: none;
  }

  .lb[open] {
    animation: none;
  }
}
</style>
