<script setup lang="ts">
/**
 * The /blog bento grid: each post renders as the card its `card.kind` names,
 * and takes that card's footprint on a four-column grid.
 *
 *   feature 2×2 · tall 1×2 · wide 2×1 · quote 2×1 · promo, stat, compact 1×1
 *
 * `grid-auto-flow: dense` back-fills gaps, so the layout holds together in
 * listed order and still packs neatly when a filter or search leaves only a
 * few posts. Two columns below 1100px, one below 640px.
 */
import type { BlogPost } from '~/utils/blog'

defineProps<{
  posts: BlogPost[]
}>()
</script>

<template>
  <div class="grid">
    <template v-for="p in posts" :key="p.slug">
      <BlogCardFeature v-if="p.card.kind === 'feature'" :post="p" class="cell feature" />
      <BlogCardWide v-else-if="p.card.kind === 'wide'" :post="p" class="cell wide" />
      <BlogCardPromo v-else-if="p.card.kind === 'promo'" :post="p" :cta="p.card.cta" class="cell" />
      <BlogCardStat v-else-if="p.card.kind === 'stat'" :post="p" :value="p.card.value" :text="p.card.text" class="cell" />
      <BlogCardQuote v-else-if="p.card.kind === 'quote'" :post="p" :text="p.card.text" :name="p.card.name" :role="p.card.role" class="cell wide" />
      <BlogCard v-else :post="p" :tall="p.card.kind === 'tall'" class="cell" :class="{ tall: p.card.kind === 'tall' }" />
    </template>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-flow: dense;
  gap: 20px;
}

.cell {
  min-width: 0;
}

.feature {
  grid-column: span 2;
  grid-row: span 2;
}

.tall {
  grid-row: span 2;
}

.wide {
  grid-column: span 2;
}

@media (max-width: 1100px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .feature {
    grid-row: span 1;
  }
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }

  .feature,
  .wide {
    grid-column: span 1;
  }

  .tall {
    grid-row: span 1;
  }
}
</style>
