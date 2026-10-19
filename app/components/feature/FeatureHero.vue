<script setup lang="ts">
/**
 * A feature page's banner (Figma: Registration & ticketing - hero): the brand
 * band with a "Features · <name>" trail, the headline, a line on what it does,
 * two buttons (a demo, and a jump down to the first feature row), short facts
 * in a row, and the product screen in a browser frame beside it all. Below
 * 960px the screen moves under the copy.
 *
 * On load the copy rises in line by line and the screen follows; with reduced
 * motion it is simply shown.
 */
import type { FeaturePage } from '~/utils/features'

const props = defineProps<{
  page: FeaturePage
}>()

/** "See how it works" lands on the first feature row. */
const howTo = computed(() => `#${props.page.rows[0]?.id ?? ''}`)
</script>

<template>
  <header class="hero">
    <i class="orb a" aria-hidden="true" />
    <i class="orb b" aria-hidden="true" />

    <div class="rail">
      <div class="copy">
        <p class="trail rise" style="--k: 0">
          <span class="trail-ico"><Icon :name="page.icon" class="ico" /></span>
          <NuxtLink to="/#features" class="trail-link">Features</NuxtLink>
          <span aria-hidden="true">·</span>
          <span>{{ page.name }}</span>
        </p>

        <h1 class="h1 rise" style="--k: 1">{{ page.hero.title }}</h1>
        <p class="sub rise" style="--k: 2">{{ page.hero.text }}</p>

        <div class="btns rise" style="--k: 3">
          <NuxtLink to="/contact-us" class="btn-solid">Book a demo</NuxtLink>
          <a :href="howTo" class="btn-line">See how it works</a>
        </div>

        <ul class="facts rise" style="--k: 4">
          <li v-for="h in page.hero.highlights" :key="h">{{ h }}</li>
        </ul>
      </div>

      <figure class="browser">
        <div class="chrome" aria-hidden="true">
          <i /><i /><i />
          <span class="url">{{ page.hero.url }}</span>
        </div>
        <div class="screen">
          <img :src="page.hero.image.src" :alt="page.hero.image.alt" width="960" height="600" fetchpriority="high" decoding="async">
        </div>
      </figure>
    </div>
  </header>
</template>

<style scoped>
.hero {
  --fh-ease: cubic-bezier(.22, .8, .24, 1);
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding-block: clamp(48px, 7vw, 100px) clamp(56px, 8vw, 110px);
  color: #fff;
  background: linear-gradient(160deg, #7a6cf0 0%, #6452e7 48%, #4f3fd8 100%);
}

/* Two soft circles: one rising from the bottom-left corner, one off the top-right. (Not ".ring" - that's a Tailwind utility.) */
.orb {
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  background: rgba(255, 255, 255, .06);
  pointer-events: none;
}

.orb.a {
  left: -120px;
  bottom: -260px;
  width: 440px;
  height: 440px;
}

.orb.b {
  right: -140px;
  top: -200px;
  width: 560px;
  height: 560px;
  background: rgba(255, 255, 255, .05);
}

.rail {
  max-width: 1240px;
  margin-inline: auto;
  padding-inline: clamp(16px, 3vw, 40px);
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(32px, 4.5vw, 64px);
}

/* ---------- Copy ---------- */
.trail {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, .92);
}

.trail-ico {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  margin-right: 8px;
  background: #FFFFFF29;
  border-radius: 10px;
}

.trail-ico .ico {
  width: 20px;
  height: 20px;
}

.trail-link {
  color: inherit;
  text-decoration: none;
}

.trail-link:hover {
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.h1 {
  margin: 22px 0 0;
  font-size: clamp(34px, 3.9vw, 56px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1.12px;
  text-wrap: balance;
}

.sub {
  max-width: 36em;
  margin: 20px 0 0;
  font-size: clamp(16px, 1.4vw, 18px);
  line-height: 1.7;
  color: rgba(255, 255, 255, .9);
  text-wrap: pretty;
}

.btns {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.btn-solid,
.btn-line {
  min-height: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 30px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  border-radius: 8px;
  transition: background-color .2s, border-color .2s, transform .25s var(--fh-ease), box-shadow .25s;
}

.btn-solid {
  color: var(--color-brand, #6452e7);
  background: #fff;
  box-shadow: 0 14px 30px -16px rgba(20, 16, 70, .6);
}

.btn-solid:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px -16px rgba(20, 16, 70, .7);
}

.btn-line {
  font-weight: 600;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, .55);
}

.btn-line:hover {
  background: rgba(255, 255, 255, .1);
  border-color: #fff;
}

.btn-solid:focus-visible,
.btn-line:focus-visible,
.trail-link:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

.facts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  margin: 34px 0 0;
  padding: 0;
  list-style: none;
}

.facts li {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, .95);
}

.facts li::before {
  content: "";
  width: 6px;
  height: 6px;
  flex: none;
  background: #fff;
  border-radius: 50%;
}

/* ---------- The product screen, in a browser frame ---------- */
.browser {
  margin: 0;
  padding: 0 10px 10px;
  background: #fff;
  border-radius: 12px;
  /* box-shadow: 0 40px 80px -40px rgba(20, 16, 70, .65); */
}

.chrome {
  height: 52px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 12px;
}

.chrome i {
  width: 11px;
  height: 11px;
  flex: none;
  background: #e3e4ea;
  border-radius: 50%;
}

.url {
  overflow: hidden;
  margin-left: 16px;
  font-size: 14px;
  color: var(--color-muted, #6b7280);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.screen {
  overflow: hidden;
  background: #f4f2fd;
  border-radius: 10px;
}

.screen img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

/* ---------- On load: the copy rises line by line, then the screen ---------- */
@media (prefers-reduced-motion: no-preference) {
  .rise {
    animation: fh-rise .8s var(--fh-ease) both;
    animation-delay: calc(var(--k, 0) * 70ms);
  }

  .browser {
    animation: fh-screen 1s var(--fh-ease) .25s both;
  }
}

@keyframes fh-rise {
  from { opacity: 0; transform: translateY(18px); }
}

@keyframes fh-screen {
  from { opacity: 0; transform: translateY(28px) scale(.98); }
}

/* Tablets and phones: the screen under the copy. */
@media (max-width: 960px) {
  .rail {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 480px) {
  .btns > * {
    flex: 1 1 100%;
  }

  .chrome {
    height: 40px;
  }

  .url {
    font-size: 12.5px;
  }
}
</style>
