<script setup lang="ts">
/**
 * 04 · Exhibitors.
 *
 * A logo wall that moves: rows of logo tiles drift sideways (alternate rows in
 * opposite directions) and fade out at the edges. Logos are grey until
 * hovered; hovering a row also pauses it, so the logo stays put while it turns
 * to colour. The Pause button stops every row for keyboard and screen-reader
 * users. On touch screens (no hover) the logos are in colour from the start,
 * and with reduced motion they are shown once each as a still grid.
 *
 * Each row is two identical groups side by side; the track slides by half its
 * width and starts over, so the loop has no seam. A group must stay wider than
 * the rail, so a row with few logos repeats them until it has MIN_TILES.
 *
 * Adding a logo: put the PNG in public/images and add a line to LOGOS. With
 * twelve or more the wall splits into two rows and nothing repeats.
 */
type Logo = { name: string, src: string }

/** Transparent PNGs, all the same canvas with the logo centred in it. */
const LOGOS: Logo[] = [
  { name: 'Northwind', src: '/images/northwind.png' },
  { name: 'Halcyon', src: '/images/halcyon.png' },
  { name: 'atlas&co', src: '/images/atlasco.png' },
  { name: 'Vertex', src: '/images/vertex.png' },
]
const LOGO_W = 186
const LOGO_H = 69

/** Tiles a group needs to stay wider than the 1240px rail (6 × 228px ≈ 1370px). */
const MIN_TILES = 6
/** Drift speed: every row moves at the same pace, however many tiles it has. */
const SECONDS_PER_TILE = 6.5

/** Repeats a row's logos in whole rounds (so the order stays even) until the row is long enough to loop. */
function fill(logos: Logo[]) {
  const out: Logo[] = []
  while (logos.length && out.length < MIN_TILES) out.push(...logos)
  return out
}

/* Two rows once both can be filled without repeats, otherwise one. */
const half = Math.ceil(LOGOS.length / 2)
const ROWS = (LOGOS.length >= MIN_TILES * 2 ? [LOGOS.slice(0, half), LOGOS.slice(half)] : [LOGOS])
  .map((logos, r) => {
    const tiles = fill(logos)
    // The second row runs a touch slower, so the two never line up.
    return { tiles, count: logos.length, seconds: tiles.length * SECONDS_PER_TILE * (r ? 1.15 : 1) }
  })

const paused = ref(false)
</script>

<template>
  <section v-if="LOGOS.length" id="exhibitors" class="ex" aria-labelledby="ex-title">
    <div class="ex-rail">
      <header class="ex-head">
        <p class="ex-eyebrow">Exhibitors</p>
        <h2 id="ex-title" class="ex-title">Exhibitors at events running on EXPOUSE</h2>
        <p class="ex-sub">Hover a logo to see it in color.</p>
      </header>

      <div class="ex-rows" :class="{ paused }">
        <div v-for="(row, r) in ROWS" :key="r" class="row" :class="{ reverse: r % 2 === 1 }">
          <div class="track" :style="{ '--dur': `${row.seconds}s` }">
            <ul v-for="copy in 2" :key="copy" class="group" :aria-hidden="copy === 2 ? 'true' : undefined">
              <li
                v-for="(l, i) in row.tiles"
                :key="i"
                class="tile"
                :class="{ repeat: i >= row.count }"
                :aria-hidden="i >= row.count ? 'true' : undefined"
              >
                <img class="logo" :src="l.src" :alt="l.name" :width="LOGO_W" :height="LOGO_H" decoding="async" draggable="false">
              </li>
            </ul>
          </div>
        </div>

        <button type="button" class="ex-toggle" @click="paused = !paused">
          <Icon :name="paused ? 'lucide:play' : 'lucide:pause'" class="ico" />
          {{ paused ? 'Play logos' : 'Pause logos' }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.ex {
  --ex-brand: var(--color-brand, #6452E7 );
  --ex-brand-200: #c7d2fe;
  --ex-ink: var(--color-ink, #1f2430);
  --ex-muted: var(--color-muted, #6b7280);
  --ex-line: var(--color-line, #e8e9ee);
  --ex-ease: cubic-bezier(.22, .8, .24, 1);
  /* Logo tiles: fixed size so every logo gets the same frame. */
  --ex-tile-w: 212px;
  --ex-tile-h: 80px;
  --ex-gap: 16px;
  overflow-x: clip;
  color: var(--ex-ink);
}

/* Same rail and gutter as the stats card above. */
.ex-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: 0 clamp(12px, 3vw, 40px) clamp(56px, 7vw, 88px);
}

/* ---------- Heading ---------- */
.ex-head {
  max-width: 720px;
  margin: 0 auto clamp(28px, 4vw, 44px);
  text-align: center;
}

.ex-eyebrow {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ex-brand);
}

.ex-title {
  margin: 8px 0 0;
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.03em;
  text-wrap: balance;
}

.ex-sub {
  margin: 12px 0 0;
  font-size: 17px;
  color: var(--ex-muted);
}

/* ---------- Rows ---------- */
.ex-rows {
  display: grid;
}

/* The padding leaves room for a lifted tile's shadow (and spaces the rows like the tiles); the mask fades both edges. */
.row {
  overflow: hidden;
  padding-block: calc(var(--ex-gap) / 2);
  mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
}

.track {
  display: flex;
  width: max-content;
  animation: ex-slide var(--dur, 40s) linear infinite;
}

.row.reverse .track {
  animation-direction: reverse;
}

.row:hover .track,
.paused .track {
  animation-play-state: paused;
}

/* The trailing padding equals the gap, so two groups are exactly twice one: -50% lands on the seam. */
.group {
  display: flex;
  gap: var(--ex-gap);
  margin: 0;
  padding: 0 var(--ex-gap) 0 0;
  list-style: none;
}

.tile {
  flex: none;
  width: var(--ex-tile-w);
  height: var(--ex-tile-h);
  display: grid;
  place-items: center;
  padding: 0 8px;
  background: #fff;
  /* border: 1px solid var(--ex-line); */
  border-radius: 10px;
  transition: border-color .25s, box-shadow .25s, transform .3s var(--ex-ease);
}

.tile:hover {
  border-color: var(--ex-brand-200);
  box-shadow: 0 12px 28px -16px rgba(99, 102, 241, .45);
  transform: translateY(-2px);
}

/* ---------- Logo: grey until hovered ---------- */
.logo {
  display: block;
  max-width: 100%;
  height: auto;
  filter: grayscale(1);
  opacity: .65;
  transition: filter .3s, opacity .3s;
  user-select: none;
}

.tile:hover .logo {
  filter: none;
  opacity: 1;
}

/* ---------- Pause / play ---------- */
.ex-toggle {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 12px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--ex-muted);
  background: #fff;
  border: 1px solid var(--ex-line);
  border-radius: 999px;
  cursor: pointer;
  transition: border-color .2s, color .2s;
}

.ex-toggle:hover {
  border-color: #cfd2db;
  color: var(--ex-brand);
}

.ex-toggle:focus-visible {
  outline: 2px solid var(--ex-brand);
  outline-offset: 3px;
}

.ex-toggle .ico {
  width: 14px;
  height: 14px;
}

@keyframes ex-slide {
  to {
    transform: translateX(-50%);
  }
}

@media (max-width: 640px) {
  .ex {
    --ex-tile-w: 168px;
    --ex-tile-h: 68px;
    --ex-gap: 12px;
  }
}

/* Touch screens can't hover: show the logos in colour and drop the hover hint. */
@media (hover: none) {
  .logo {
    filter: none;
    opacity: 1;
  }

  .ex-sub {
    display: none;
  }
}

/* Reduced motion: each logo once, in a still grid that fills the row. */
@media (prefers-reduced-motion: reduce) {
  .row {
    mask-image: none;
    -webkit-mask-image: none;
  }

  .track {
    width: auto;
    animation: none;
  }

  .group {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    padding: 0;
  }

  .tile {
    width: auto;
    transition: none;
  }

  .group[aria-hidden="true"],
  .tile.repeat,
  .ex-toggle {
    display: none;
  }

  .logo {
    transition: none;
  }
}
</style>
