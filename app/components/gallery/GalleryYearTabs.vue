<script setup lang="ts">
/** The /gallery year switch: a segmented control with "All" plus one tab per year. */
defineProps<{
  years: number[]
}>()

const model = defineModel<number | 'All'>({ required: true })
</script>

<template>
  <div class="tabs" role="tablist" aria-label="Show events from">
    <button
      v-for="y in ['All' as const, ...years]"
      :key="y"
      type="button"
      role="tab"
      class="tab"
      :class="{ on: model === y }"
      :aria-selected="model === y"
      @click="model = y"
    >
      {{ y }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 5px;
  background: #fff;
  border: 1px solid #e6e5f2;
  border-radius: 10px;
}

.tab {
  height: 38px;
  padding: 0 18px;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  color: #4b5160;
  background: transparent;
  border: 0;
  border-radius: 7px;
  cursor: pointer;
  transition: background-color .2s, color .2s;
}

.tab:hover:not(.on) {
  color: var(--color-ink, #1f2430);
  background: #f4f3fb;
}

.tab.on {
  color: #fff;
  background: var(--color-brand, #6452e7);
}

.tab:focus-visible {
  outline: 2px solid var(--color-brand, #6452e7);
  outline-offset: 2px;
}
</style>
