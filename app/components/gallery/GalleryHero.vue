<script setup lang="ts">
/** The /gallery banner: a full-width brand-purple band with the title and headline numbers. */
defineProps<{
  stats: { value: string, label: string }[]
}>()
</script>

<template>
  <header class="hero">
    <i class="orb a" aria-hidden="true" />
    <i class="orb b" aria-hidden="true" />

    <div class="rail">
      <p class="eyebrow">Media gallery</p>
      <h1 class="h1">Moments from events we've powered</h1>
      <p class="sub">Photos from the expos, conferences and summits run on EXPOUSE, sorted by event.</p>

      <ul class="stats" aria-label="EXPOUSE in numbers">
        <li v-for="s in stats" :key="s.label" class="stat">
          <b class="value">{{ s.value }}</b>
          <span class="label">{{ s.label }}</span>
        </li>
      </ul>
    </div>
  </header>
</template>

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding-block: clamp(56px, 7vw, 88px) clamp(64px, 8vw, 100px);
  color: #fff;
  text-align: center;
  background: linear-gradient(160deg, #7a6cf0 0%, #6452e7 48%, #4f3fd8 100%);
}

/* Two soft circles: one off the top-left corner, one off the right edge. (Not ".ring" - that's a Tailwind utility.) */
.orb {
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  background: rgba(255, 255, 255, .07);
  pointer-events: none;
}

.orb.a {
  left: -160px;
  top: -220px;
  width: 480px;
  height: 480px;
}

.orb.b {
  right: -200px;
  top: 80px;
  width: 420px;
  height: 420px;
  background: rgba(255, 255, 255, .05);
}

.rail {
  max-width: 1240px;
  margin-inline: auto;
  padding-inline: clamp(16px, 3vw, 40px);
}

.eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
}

.h1 {
  margin: 10px 0 0;
  font-size: clamp(34px, 5vw, 56px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.01em;
  text-wrap: balance;
}

.sub {
  max-width: 34em;
  margin: 16px auto 0;
  font-size: 18px;
  line-height: 1.65;
  color: rgba(255, 255, 255, .9);
  text-wrap: pretty;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.stat {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 22px;
  border: 1px solid rgba(255, 255, 255, .7);
  border-radius: 10px;
}

.value {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.3;
}

.label {
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, .92);
}
</style>
