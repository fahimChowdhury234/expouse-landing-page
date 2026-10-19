<script setup lang="ts" generic="T extends string">
/** Category tabs above a list: "All" plus one per category. Used by /news and /blog. */
withDefaults(defineProps<{
  categories: T[]
  modelValue: T | 'All'
  label?: string
}>(), {
  label: 'Filter news by category',
})

defineEmits<{
  'update:modelValue': [value: T | 'All']
}>()
</script>

<template>
  <div class="filters" role="tablist" :aria-label="label">
    <button
      type="button"
      role="tab"
      class="tab"
      :class="{ on: modelValue === 'All' }"
      :aria-selected="modelValue === 'All'"
      @click="$emit('update:modelValue', 'All')"
    >
      All
    </button>
    <button
      v-for="c in categories"
      :key="c"
      type="button"
      role="tab"
      class="tab"
      :class="{ on: modelValue === c }"
      :aria-selected="modelValue === c"
      @click="$emit('update:modelValue', c)"
    >
      {{ c }}
    </button>
  </div>
</template>

<style scoped>
.filters {
  --tab-brand: var(--color-brand, #6452e7);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-line, #e8e9ee);
}

.tab {
  flex: none;
  height: 40px;
  padding: 0 16px;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  color: #4b5160;
  background: #fff;
  border: 1px solid #E6E5F2;
  border-radius: 7px;
  cursor: pointer;
  transition: background-color .2s, border-color .2s, color .2s;
}

.tab:hover:not(.on) {
  color: var(--color-ink, #1f2430);
  border-color: #cfd2da;
}

.tab.on {
  color: #fff;
  background: var(--tab-brand);
  border-color: var(--tab-brand);
}

.tab:focus-visible {
  outline: 2px solid var(--tab-brand);
  outline-offset: 2px;
}
</style>
