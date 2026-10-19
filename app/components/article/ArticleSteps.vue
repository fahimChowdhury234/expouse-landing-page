<script setup lang="ts">
/** Numbered how-to steps in an article, one bordered row each. */
defineProps<{
  items: string[]
}>()
</script>

<template>
  <ol class="steps">
    <li v-for="(s, i) in items" :key="i" class="step">
      <span class="num" aria-hidden="true">{{ i + 1 }}</span>
      <span class="text">{{ s }}</span>
    </li>
  </ol>
</template>

<style scoped>
.steps {
  display: grid;
  gap: 12px;
  padding: 0;
  list-style: none;
}

.step {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: #fff;
  border: 1px solid var(--color-line, #e8e9ee);
  border-radius: 10px;
}

.num {
  width: 28px;
  height: 28px;
  flex: none;
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: var(--color-brand, #6452e7);
  border-radius: 50%;
}

.text {
  font-size: 17px;
  line-height: 1.5;
  color: #2b303b;
}
</style>
