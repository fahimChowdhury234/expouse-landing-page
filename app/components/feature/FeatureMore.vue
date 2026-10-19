<script setup lang="ts">
/**
 * "Explore other features" (Figma: Registration & ticketing - Explore): a
 * card for every other feature page, four to a row on wide screens, each
 * with its icon, its name and an arrow that nudges forward on hover.
 */
import type { FeaturePage } from '~/utils/features'

defineProps<{
  features: FeaturePage[]
}>()

const uid = useId()
</script>

<template>
  <section class="fm" :aria-labelledby="`${uid}-title`">
    <div class="fm-rail">
      <h2 :id="`${uid}-title`" class="fm-title">Explore other features</h2>

      <ul class="grid">
        <li v-for="f in features" :key="f.slug">
          <NuxtLink :to="`/features/${f.slug}`" class="card">
            <span class="mi"><Icon :name="f.icon" class="ico" /></span>
            <span class="name">{{ f.name }}</span>
            <Icon name="lucide:arrow-right" class="go" />
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.fm {
  --fm-brand: var(--color-brand, #6452e7);
  --fm-ease: cubic-bezier(.22, .8, .24, 1);
  color: var(--color-ink, #1f2430);
  background: #fff;
}

.fm-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(40px, 5vw, 64px) clamp(16px, 3vw, 40px);
}

.fm-title {
  margin: 0 0 clamp(20px, 2.6vw, 32px);
  font-size: clamp(24px, 2.6vw, 28px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -.02em;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.card {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  color: inherit;
  text-decoration: none;
  background: #fff;
  border: 1px solid var(--color-line, #e8e9ee);
  border-radius: 12px;
  transition: border-color .2s, box-shadow .3s, transform .3s var(--fm-ease);
}

.card:hover {
  border-color: #d9d5f6;
  box-shadow: 0 18px 36px -28px rgba(79, 70, 229, .45);
  transform: translateY(-2px);
}

.card:focus-visible {
  outline: 2px solid var(--fm-brand);
  outline-offset: 2px;
}

.mi {
  width: 40px;
  height: 40px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--fm-brand);
  background: #6452E712;
  border-radius: 10px;
  transition: color .2s, background-color .2s;
}

.card:hover .mi {
  color: #fff;
  background: var(--fm-brand);
}

.mi .ico {
  width: 20px;
  height: 20px;
}

.name {
  flex: 1;
  min-width: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.45;
  text-wrap: balance;
}

.go {
  width: 18px;
  height: 18px;
  flex: none;
  color: var(--fm-brand);
  transition: transform .25s var(--fm-ease);
}

.card:hover .go {
  transform: translateX(3px);
}

@media (max-width: 1040px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }

  .card {
    padding: 16px 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card,
  .go {
    transition: none;
  }
}
</style>
