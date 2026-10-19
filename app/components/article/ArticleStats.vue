<script setup lang="ts">
/** A row of key numbers in an article, each with a short label. */
defineProps<{
  items: { value: string, label: string }[]
}>()
</script>

<template>
  <ul class="stats">
    <li v-for="s in items" :key="s.label" class="stat">
      <b class="value">{{ s.value }}</b>
      <span class="label">{{ s.label }}</span>
    </li>
  </ul>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 0;
  list-style: none;
}

@media (max-width: 560px) {
  .stats {
    grid-template-columns: minmax(0, 1fr);
  }
}

.stat {
  display: grid;
  gap: 4px;
  padding: 20px;
  background: #f4f3fd;
  border: 1px solid #e7e4f8;
  border-radius: 12px;
}

.value {
  font-size: 30px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--color-brand, #6452e7);
}

.label {
  font-size: 15px;
  line-height: 1.4;
  color: var(--color-muted, #6b7280);
}
</style>
