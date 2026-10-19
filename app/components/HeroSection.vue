<script setup lang="ts">
/**
 * 01 · Hero.
 *
 * Headline, sub-line, the two CTAs and the three proof points, centred over a
 * full-bleed event photo. The photo is washed out with a white veil and fades
 * into the page colour at the bottom, so the text stays readable and the next
 * section joins without a seam. If the photo is missing, the brand gradient
 * underneath still gives the section its colour.
 *
 * Entrance (expouse-landing/index.html): the headline words rise out of a clip
 * one after another, a swoosh draws itself under "chaos at the door", and the rest
 * fades up in turn. CSS only, so it plays from the first paint; with reduced
 * motion everything is simply shown.
 */
const HERO_IMAGE = '/images/hero-crowd.webp';
/** A lighter copy for phones and small laptops (the photo is washed out, so 960px is plenty there). */
const HERO_IMAGE_SM = '/images/hero-crowd-960.webp';

const PROOF = [
  'Handles 50,000+ attendees',
  'English & Arabic',
  'Web, iOS & Android',
];

/* Headline words, numbered in one sequence so each rises just after the last. */
const LINE_1 = ['Big', 'events.'];
const LINE_2 = ['No'];
const HIGHLIGHT = ['chaos', 'at', 'the', 'door.'];
const STAGGER = 0.05;
/** A short beat between the two lines. */
const LINE_GAP = 0.05;

const rise = (i: number) => ({
  animationDelay: `${(STAGGER + i * STAGGER + (i >= LINE_1.length ? LINE_GAP : 0)).toFixed(2)}s`,
});
const after = (s: number) => ({ animationDelay: `${s}s` });
</script>

<template>
  <section id="top" class="relative isolate overflow-hidden bg-white">
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <div
        class="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_0%,#eef2ff_0%,transparent_70%),radial-gradient(50%_40%_at_90%_10%,#ede9fe_0%,transparent_70%)]"
      />
      <!-- A real <img>, not a CSS background: the browser finds it in the HTML and
           fetches it first (it is the page's largest paint), at the size it needs. -->
      <img
        :src="HERO_IMAGE"
        :srcset="`${HERO_IMAGE_SM} 960w, ${HERO_IMAGE} 1440w`"
        sizes="100vw"
        alt=""
        width="1440"
        height="810"
        fetchpriority="high"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover object-center"
      />
      <!-- <div class="absolute inset-0 bg-white/70" /> -->
      <div
        class="absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_45%,rgb(255_255_255/0.55)_0%,transparent_75%)]"
      />
      <div
        class="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-b from-transparent to-page"
      />
    </div>

    <div
      class="container-x flex flex-col items-center pt-20 pb-20 text-center sm:pt-28 sm:pb-24"
    >
      <p class="fade-in m-0 text-base font-semibold text-brand sm:text-lg">
        Event software for exhibitions and conferences
      </p>

      <h1
        class="mt-5 mb-0 text-[2.5rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl md:text-6xl lg:text-7xl"
      >
        <template v-for="(word, i) in LINE_1" :key="word">
          <span class="w"
            ><span :style="rise(i)">{{ word }}</span></span
          >{{ ' ' }}
        </template>
        <br />
        <template v-for="(word, i) in LINE_2" :key="word">
          <span class="w"
            ><span :style="rise(LINE_1.length + i)">{{ word }}</span></span
          >{{ ' ' }}
        </template>
        <span class="hl text-brand">
          <template v-for="(word, i) in HIGHLIGHT" :key="word">
            <span class="w"
              ><span :style="rise(LINE_1.length + LINE_2.length + i)">{{
                word
              }}</span></span
            >{{ i < HIGHLIGHT.length - 1 ? ' ' : '' }}
          </template>
          <!-- <svg class="swoosh" viewBox="0 0 400 20" preserveAspectRatio="none" aria-hidden="true"><path d="M4 14 C 90 4, 220 2, 396 10" /></svg> -->
        </span>
      </h1>

      <p
        class="fade-in mx-auto mt-6 mb-0 max-w-2xl text-lg leading-relaxed text-ink/75 sm:text-xl"
        :style="after(0.6)"
      >
        Badges print in seconds, gates keep scanning when the Wi-Fi drops, and
        every exhibitor leaves with scored leads.
      </p>

      <div
        class="fade-in mt-9 flex flex-wrap justify-center gap-3"
        :style="after(0.7)"
      >
        <NuxtLink
          to="/#book-demo"
          class="inline-flex items-center gap-2.5 rounded-lg bg-brand px-7 py-3.5 text-base font-semibold text-white no-underline shadow-sm transition-colors hover:bg-brand-dark"
        >
          Book a demo
          <Icon name="lucide:arrow-right" class="w-5 h-5" />
        </NuxtLink>
        <NuxtLink
          to="/#platform"
          class="inline-flex items-center rounded-lg border border-line bg-white px-7 py-3.5 text-base font-semibold text-ink no-underline shadow-sm transition-colors hover:border-faint"
        >
          See how it works
        </NuxtLink>
      </div>

      <ul
        class="fade-in m-0 mt-8 flex list-none flex-wrap justify-center gap-x-8 gap-y-2 p-0 text-[15px] font-medium text-ink/70"
        :style="after(0.8)"
      >
        <li v-for="p in PROOF" :key="p" class="inline-flex items-center gap-2">
          <Icon name="lucide:check" class="w-4 h-4 text-ok" />
          {{ p }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* Each word sits in a clip and rises into it; the padding keeps descenders (g, y, p) inside the clip. */
.w {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
  padding-bottom: 0.06em;
}
.w > span {
  display: inline-block;
  transform: translateY(105%);
  animation: rise 0.9s cubic-bezier(0.22, 0.8, 0.24, 1) forwards;
}

.hl {
  position: relative;
  display: inline-block;
  padding-bottom: 0.08em;
}
.swoosh {
  position: absolute;
  left: 2%;
  bottom: -0.08em;
  width: 96%;
  height: 0.22em;
  overflow: visible;
  color: #8b7cf6;
  opacity: 0.55;
}
.swoosh path {
  fill: none;
  stroke: currentColor;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 420;
  stroke-dashoffset: 420;
  animation: draw 1.1s 0.85s cubic-bezier(0.22, 0.8, 0.24, 1) forwards;
}

.fade-in {
  opacity: 0;
  transform: translateY(14px);
  animation: fade-up 0.9s cubic-bezier(0.22, 0.8, 0.24, 1) forwards;
}

@keyframes rise {
  to {
    transform: none;
  }
}
@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes fade-up {
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .w > span,
  .fade-in {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .swoosh path {
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
