<script setup lang="ts">
/**
 * One feature row (Figma: Registration & ticketing - Form builder): an
 * eyebrow, the headline, a line of text and three checked points beside a
 * product screen on a lilac panel. `flip` puts the screen on the left; the
 * page alternates them. Below 960px the text sits above its screen.
 *
 * The row rises in the first time it scrolls into view (useReveal).
 */
import type { FeatureRow } from '~/utils/features'

defineProps<{
  row: FeatureRow
  flip?: boolean
}>()

const el = ref<HTMLElement | null>(null)
const { animate, revealed } = useReveal(el)
</script>

<template>
  <article
    :id="row.id"
    ref="el"
    class="row"
    :class="{ flip, 'fr--animate': animate, in: revealed }"
    :aria-labelledby="`${row.id}-title`"
  >
    <div class="copy">
      <p class="eyebrow">{{ row.eyebrow }}</p>
      <h2 :id="`${row.id}-title`" class="title">{{ row.title }}</h2>
      <p class="text">{{ row.text }}</p>
      <ul class="points">
        <li v-for="p in row.points" :key="p">
          <span class="chk"><Icon name="lucide:check" class="ico" /></span>
          {{ p }}
        </li>
      </ul>
    </div>

    <!-- The lilac panel with a soft shape in two corners, and the screen on a white card. -->
    <figure class="shot">
      <div class="card">
        <img :src="row.image.src" :alt="row.image.alt" width="960" height="600" loading="lazy" decoding="async">
      </div>
    </figure>
  </article>
</template>

<style scoped>
.row {
  --fr-brand: var(--color-brand, #6452e7);
  --fr-ease: cubic-bezier(.22, .8, .24, 1);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(32px, 5vw, 80px);
  /* In-page links (the hero's "See how it works") land a little above the row. */
  scroll-margin-top: 110px;
}

.flip .copy {
  order: 2;
}

/* ---------- Copy ---------- */
.eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--fr-brand);
}

.title {
  max-width: 13em;
  margin: 14px 0 0;
  font-size: clamp(28px, 3.3vw, 38px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -.02em;
  text-wrap: balance;
}

.text {
  max-width: 34em;
  margin: 20px 0 0;
  font-size: 16px;
  line-height: 1.75;
  color: var(--color-muted, #6b7280);
  text-wrap: pretty;
}

.points {
  display: grid;
  gap: 12px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

/* Top-aligned, so a line that wraps keeps its check beside the first line. */
.points li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  font-size: 16px;
  line-height: 24px;
}

.chk {
  width: 22px;
  height: 22px;
  flex: none;
  display: grid;
  place-items: center;
  color: #fff;
  background: var(--fr-brand);
  border-radius: 50%;
}

.chk .ico {
  width: 12px;
  height: 12px;
}

/* ---------- The screen on its panel ---------- */
.shot {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  margin: 0;
  padding: clamp(18px, 2.6vw, 26px);
  background: #f4f2fd;
  border: 1px solid #E6E5F2;
  border-radius: 12px;
}

/* A quarter circle in the top-right and bottom-left corners. */
.shot::before,
.shot::after {
  content: "";
  position: absolute;
  z-index: -1;
  width: 38%;
  aspect-ratio: 1;
  background: #ebe7fc;
  border-radius: 50%;
}

.shot::before {
  right: -14%;
  top: -24%;
}

.shot::after {
  left: -18%;
  bottom: -30%;
  width: 30%;
}

.card {
  overflow: hidden;
  background: #fff;
  border: 1px solid #ebe8f6;
  border-radius: 12px;
  box-shadow: 0 24px 48px -36px rgba(26, 26, 46, .35);
}

.card img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

/* ---------- Reveal: the text rises in, then the screen ---------- */
.fr--animate .copy,
.fr--animate .shot {
  opacity: 0;
  transform: translateY(26px);
  transition: opacity .8s var(--fr-ease), transform .8s var(--fr-ease);
}

.fr--animate .shot {
  transition-delay: .12s;
}

.fr--animate.in .copy,
.fr--animate.in .shot {
  opacity: 1;
  transform: none;
}

/* Tablets and phones: the text above its screen, on every row. */
@media (max-width: 960px) {
  .row {
    grid-template-columns: minmax(0, 1fr);
  }

  .flip .copy {
    order: 0;
  }

  .title {
    max-width: 18em;
  }
}

@media (max-width: 560px) {
  .text,
  .points li {
    font-size: 16px;
  }
}
</style>
