<script setup lang="ts">
/** Full-viewport event-film hero. The video is decorative; all the message is
 * present as real HTML, so it remains available with video or motion disabled. */
const video = ref<HTMLVideoElement | null>(null)
const paused = ref(false)
const HEADLINE = [
  ['Plan,', 'run', 'and', 'grow', 'your'],
  ['events', 'in', 'one', 'place'],
]

const wordDelay = (index: number) => ({ animationDelay: `${0.05 + index * 0.05}s` })

function toggleVideo() {
  if (!video.value) return
  if (video.value.paused) video.value.play().then(() => { paused.value = false }).catch(() => { })
  else {
    video.value.pause()
    paused.value = true
  }
}

function scrollToNext() {
  document.querySelector('#platform')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section id="top" class="hero" aria-labelledby="hero-title">
    <div class="media" aria-hidden="true">
      <video ref="video" class="film" autoplay muted loop playsinline preload="metadata">
        <source src="/images/hero-bg-video.mp4" type="video/mp4">
      </video>
      <div class="wash" />
      <div class="shade" />
    </div>

    <div class="hero-content">
      <div class="copy">
        <h1 id="hero-title">
          <template v-for="(line, lineIndex) in HEADLINE" :key="lineIndex">
            <template v-for="(word, wordIndex) in line" :key="word">
              <span class="word"><span :style="wordDelay(lineIndex * HEADLINE[0].length + wordIndex)">{{ word }}</span></span>{{ wordIndex < line.length - 1 ? ' ' : '' }}
            </template>
            <br v-if="lineIndex === 0" class="wide-break">
          </template>
        </h1>
        <p class="fade-in" style="animation-delay: .45s">Registration, self check-in, floor plans, meetings and live insights on one connected platform, ready in days.</p>

        <div class="actions fade-in" style="animation-delay: .55s">
          <NuxtLink to="/#book-demo" class="primary-action">Book a demo</NuxtLink>
          <NuxtLink to="/#platform" class="text-action">
            Explore the platform
            <Icon name="lucide:arrow-right" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <button class="scroll-next" type="button" aria-label="Explore the platform" @click="scrollToNext">
      <Icon name="lucide:chevron-down" aria-hidden="true" />
    </button>
    <button class="video-toggle" type="button" :aria-label="paused ? 'Play background video' : 'Pause background video'"
      :aria-pressed="paused" @click="toggleVideo">
      <Icon :name="paused ? 'lucide:play' : 'lucide:pause'" aria-hidden="true" />
    </button>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: calc(100svh - 68px);
  overflow: hidden;
  color: #fff;
  background: #101331;
}

.media,
.film,
.wash,
.shade {
  position: absolute;
  inset: 0;
}

.media {
  z-index: -1;
}

.film {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Indigo treatment preserves the warmth and movement of the event film while keeping copy legible. */
.wash {
  background:
    linear-gradient(90deg, rgba(12, 14, 63, .91) 0%, rgba(18, 20, 73, .76) 30%, rgba(23, 19, 62, .29) 67%, rgba(31, 12, 37, .31) 100%),
    linear-gradient(0deg, rgba(8, 9, 38, .79) 0%, rgba(8, 10, 42, .08) 44%, rgba(15, 19, 83, .28) 100%);
}

.shade {
  background: radial-gradient(ellipse 75% 60% at 52% 48%, transparent 20%, rgba(9, 10, 39, .18) 100%);
}

.hero-content {
  display: flex;
  align-items: flex-end;
  width: min(100% - 48px, 1160px);
  margin: 0 auto;
  padding: clamp(120px, 20vh, 260px) 0 clamp(124px, 14vh, 180px);
}

.copy {
  max-width: 700px;
}

h1 {
  margin: 0;
  font-size: clamp(2.25rem, 3.2vw, 48px);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -.025em;
  text-wrap: balance;
}

/* Matches the original landing hero: each word rises out of its own clip, then
   the supporting copy and actions fade up in sequence. */
.word { display: inline-block; overflow: hidden; vertical-align: bottom; padding-bottom: .06em; }
.word > span { display: inline-block; transform: translateY(105%); animation: rise .9s cubic-bezier(.22, .8, .24, 1) forwards; }
.fade-in { opacity: 0; transform: translateY(14px); animation: fade-up .9s cubic-bezier(.22, .8, .24, 1) forwards; }
@keyframes rise { to { transform: none; } }
@keyframes fade-up { to { opacity: 1; transform: none; } }

p {
  max-width: 685px;
  margin: 24px 0 0;
  color: rgba(255, 255, 255, .86);
  font-size: clamp(1rem, 1.28vw, 18px);
  font-weight: 500;
  line-height: 1.55;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 32px;
  margin-top: 34px;
}

.primary-action,
.text-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
}

.primary-action {
  min-width: 150px;
  padding: 0 25px;
  border-radius: 8px;
  background: #6550e8;
  box-shadow: 0 16px 34px -16px rgba(100,82,231,.9) !important;
  transition: background .2s, transform .2s;
}

.primary-action:hover {
  background: #735ff4;
  transform: translateY(-2px);
}

.text-action {
  gap: 10px;
  min-height: auto;
  padding: 7px 0 8px;
  border-bottom: 1px solid rgba(255, 255, 255, .52);
}

.text-action :deep(svg) {
  width: 19px;
  height: 19px;
  transition: transform .2s;
}

.text-action:hover :deep(svg) {
  transform: translateX(4px);
}

.scroll-next,
.video-toggle {
  position: absolute;
  bottom: 36px;
  display: grid;
  width: 50px;
  height: 50px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, .58);
  border-radius: 50%;
  color: #fff;
  background: rgba(12, 13, 48, .12);
  cursor: pointer;
  transition: background .2s, transform .2s;
}

.scroll-next {
  left: 50%;
  transform: translateX(-50%);
}

.video-toggle {
  right: clamp(24px, 3.7vw, 72px);
}

.scroll-next:hover,
.video-toggle:hover {
  background: rgba(255, 255, 255, .16);
}

.scroll-next:hover {
  transform: translateX(-50%) translateY(3px);
}

.scroll-next :deep(svg) {
  width: 22px;
  height: 22px;
}

.video-toggle :deep(svg) {
  width: 19px;
  height: 19px;
}

.primary-action:focus-visible,
.text-action:focus-visible,
.scroll-next:focus-visible,
.video-toggle:focus-visible {
  outline: 3px solid #c4b5fd;
  outline-offset: 4px;
}

@media (max-width: 700px) {
  .hero {
    min-height: max(680px, calc(100svh - 68px));
  }

  .film {
    object-position: 58% center;
  }

  .wash {
    background: linear-gradient(90deg, rgba(10, 12, 54, .86), rgba(14, 12, 50, .48)), linear-gradient(0deg, rgba(7, 8, 35, .85), transparent 65%);
  }

  .hero-content {
    width: min(100% - 40px, 1340px);
    padding-bottom: 120px;
  }

  .wide-break {
    display: none;
  }

  h1 {
    font-size: clamp(2.2rem, 10vw, 3.15rem);
  }

  p {
    margin-top: 18px;
    line-height: 1.6;
  }

  .actions {
    gap: 22px;
    margin-top: 28px;
  }

  .primary-action {
    min-height: 56px;
  }

  .video-toggle {
    right: 20px;
  }

  .scroll-next,
  .video-toggle {
    bottom: 26px;
    width: 44px;
    height: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .film {
    display: none;
  }

  .word > span,
  .fade-in { animation: none; opacity: 1; transform: none; }

  .primary-action,
  .text-action :deep(svg),
  .scroll-next,
  .video-toggle {
    transition: none;
  }
}
</style>
