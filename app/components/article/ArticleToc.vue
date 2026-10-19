<script setup lang="ts">
/**
 * "In this article": the article's section headings, sticky beside the text.
 * The section being read is marked once its heading has scrolled up under the
 * site header; nothing is marked above the first heading.
 */
const props = defineProps<{
  headings: { id: string, text: string }[]
}>()

const current = ref<string | null>(null)
let ticking = false

function update() {
  ticking = false
  let id: string | null = null
  for (const h of props.headings) {
    const el = document.getElementById(h.id)
    if (el && el.getBoundingClientRect().top <= 140) id = h.id
  }
  current.value = id
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(update)
}

onMounted(() => {
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <nav class="toc" aria-labelledby="toc-label">
    <p id="toc-label" class="label">In this article</p>
    <ul class="list">
      <li v-for="h in headings" :key="h.id">
        <a :href="`#${h.id}`" class="link" :class="{ on: current === h.id }" :aria-current="current === h.id ? 'true' : undefined">{{ h.text }}</a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.toc {
  position: sticky;
  top: 100px;
}

.label {
  margin: 0 0 14px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--color-ink, #1f2430);
}

.list {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.link {
  display: block;
  padding: 6px 0 6px 14px;
  font-size: 15px;
  line-height: 1.4;
  color: var(--color-muted, #6b7280);
  text-decoration: none;
  border-left: 3px solid #ececf3;
  transition: color .2s, border-color .2s;
}

.link:hover {
  color: var(--color-ink, #1f2430);
}

.link.on {
  color: var(--color-brand, #6452e7);
  border-left-color: var(--color-brand, #6452e7);
}

.link:focus-visible {
  outline: 2px solid var(--color-brand, #6452e7);
  outline-offset: 2px;
  border-radius: 2px;
}
</style>
