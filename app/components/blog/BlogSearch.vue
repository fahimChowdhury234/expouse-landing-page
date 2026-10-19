<script setup lang="ts">
/** The /blog search box: filters articles as you type; Escape or the × clears it. */
const query = defineModel<string>({ required: true })
</script>

<template>
  <div class="search" role="search">
    <Icon name="lucide:search" class="ico" />
    <input
      v-model="query"
      type="search"
      class="input"
      placeholder="Search articles"
      aria-label="Search articles"
      autocomplete="off"
      @keydown.esc="query = ''"
    >
    <button v-if="query" type="button" class="clear" aria-label="Clear search" @click="query = ''">
      <Icon name="lucide:x" class="x" />
    </button>
  </div>
</template>

<style scoped>
.search {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.ico {
  position: absolute;
  left: 18px;
  width: 18px;
  height: 18px;
  color: var(--color-muted, #6b7280);
  pointer-events: none;
}

.input {
  width: 100%;
  height: 46px;
  padding: 0 44px 0 48px;
  font: inherit;
  font-size: 15px;
  color: var(--color-ink, #1f2430);
  background: #fff;
  border: 1px solid #e3e5ea;
  border-radius: 8px;
  transition: border-color .2s, box-shadow .2s;
}

/* The browser's own clear button doubles ours. */
.input::-webkit-search-cancel-button {
  appearance: none;
}

.input::placeholder {
  color: #8b919d;
}

.input:hover {
  border-color: #cfd2da;
}

.input:focus-visible {
  outline: none;
  border-color: var(--color-brand, #6452e7);
  box-shadow: 0 0 0 3px var(--color-brand-soft, #6452e712);
}

.clear {
  position: absolute;
  right: 10px;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  color: var(--color-muted, #6b7280);
  background: none;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.clear:hover {
  color: var(--color-ink, #1f2430);
  background: #f3f4f6;
}

.clear:focus-visible {
  outline: 2px solid var(--color-brand, #6452e7);
}

.x {
  width: 16px;
  height: 16px;
}
</style>
