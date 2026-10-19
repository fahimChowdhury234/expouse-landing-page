<script setup lang="ts">
/**
 * A full-size photo viewer for one event's photos, in a modal <dialog>.
 * Previous / next (buttons or arrow keys) wrap around; Esc, the × or a click
 * on the backdrop closes it, and focus goes back to the photo that opened it.
 *
 * The parent passes the photos and caption, then calls `show(index, opener)`.
 */
import type { GalleryPhoto } from '~/utils/gallery'

const props = defineProps<{
  photos: GalleryPhoto[]
  title: string
  meta: string
}>()

const dialog = ref<HTMLDialogElement | null>(null)
const index = ref(0)
const shown = computed(() => props.photos[index.value])
let opener: HTMLElement | null = null

function show(i: number, from?: HTMLElement) {
  opener = from ?? null
  index.value = i
  dialog.value?.showModal()
}

function step(by: number) {
  const n = props.photos.length
  if (n) index.value = (index.value + by + n) % n
}

function close() {
  dialog.value?.close()
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'ArrowLeft') step(-1)
}

/** A click on the dimmed backdrop (the dialog itself, outside its content) closes it. */
function onBackdrop(e: MouseEvent) {
  if (e.target === dialog.value) close()
}

defineExpose({ show })
</script>

<template>
  <dialog ref="dialog" class="lb" :aria-label="`Photos from ${title}`" @close="opener?.focus()" @keydown="onKey" @click="onBackdrop">
    <div v-if="shown" class="box">
      <figure class="fig">
        <img :src="shown.src" :alt="shown.alt" class="img">
        <figcaption class="cap">
          <b>{{ title }}</b>
          <small>{{ meta }}</small>
          <span class="n">{{ index + 1 }} / {{ photos.length }}</span>
        </figcaption>
      </figure>
      <button type="button" class="btn prev" aria-label="Previous photo" @click="step(-1)"><Icon name="lucide:chevron-left" class="ico" /></button>
      <button type="button" class="btn next" aria-label="Next photo" @click="step(1)"><Icon name="lucide:chevron-right" class="ico" /></button>
      <button type="button" class="btn close" aria-label="Close" @click="close"><Icon name="lucide:x" class="ico" /></button>
    </div>
  </dialog>
</template>

<style scoped>
.lb {
  width: min(1100px, calc(100vw - 32px));
  max-width: none;
  /* The site's CSS reset zeroes margins; auto is what centres a modal dialog. */
  margin: auto;
  max-height: calc(100vh - 32px);
  padding: 0;
  overflow: visible;
  background: transparent;
  border: 0;
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
  animation: lb-in .3s cubic-bezier(.22, .8, .24, 1);
}

@keyframes lb-in {
  from {
    opacity: 0;
    transform: scale(.97);
  }
}

.box {
  position: relative;
}

.fig {
  position: relative;
  max-height: calc(100vh - 32px);
  margin: 0;
  overflow: hidden;
  aspect-ratio: 3 / 2;
  background: #0f1020;
  border-radius: 14px;
}

.img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* The whole photo, uncropped. */
  object-fit: contain;
}

.cap {
  position: absolute;
  left: 20px;
  bottom: 20px;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 10px;
  max-width: calc(100% - 40px);
  padding: 10px 16px;
  color: var(--color-ink, #1f2430);
  background: rgba(255, 255, 255, .96);
  border-radius: 10px;
}

.cap b {
  font-size: 15px;
}

.cap small {
  font-size: 13.5px;
  color: var(--color-muted, #6b7280);
}

.n {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-brand, #6452e7);
}

.btn {
  position: absolute;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  color: var(--color-ink, #1f2430);
  background: rgba(255, 255, 255, .95);
  border: 0;
  border-radius: 50%;
  box-shadow: 0 8px 20px -8px rgba(0, 0, 0, .4);
  cursor: pointer;
  transition: transform .2s cubic-bezier(.22, .8, .24, 1), color .2s;
}

.btn:hover {
  color: var(--color-brand, #6452e7);
  transform: scale(1.06);
}

.btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

.btn .ico {
  width: 20px;
  height: 20px;
}

.prev,
.next {
  top: 50%;
  margin-top: -22px;
}

.prev {
  left: 14px;
}

.next {
  right: 14px;
}

.close {
  top: 14px;
  right: 14px;
}

@media (max-width: 640px) {
  .cap {
    left: 10px;
    bottom: 10px;
    max-width: calc(100% - 20px);
    padding: 7px 10px;
  }

  .btn {
    width: 38px;
    height: 38px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
  }

  .lb[open] {
    animation: none;
  }
}
</style>
