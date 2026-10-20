<script setup lang="ts">
/**
 * A list of questions as an accordion, used by the homepage FAQ and /faq: one
 * answer open at a time. The answers slide open and shut (a grid row from 0fr
 * to 1fr, so no heights are measured) and the chevron turns. Each question is
 * a real button wired to its answer (aria-expanded, aria-controls), and every
 * answer is in the page for search engines and readers without JS.
 *
 * `animate` hides the questions and `revealed` lets them rise in one after
 * another; the parent decides when (it watches the list scroll into view).
 */
import type { Faq } from '~/utils/faqs'

const props = withDefaults(defineProps<{
  items: Faq[]
  /** Prefix for the question / answer ids, unique on the page. */
  idPrefix: string
  /** The answer open to start with, or null for none. */
  initialOpen?: number | null
  animate?: boolean
  revealed?: boolean
}>(), {
  initialOpen: 0,
  animate: false,
  revealed: false,
})

const open = ref<number | null>(props.initialOpen)

function toggle(i: number) {
  open.value = open.value === i ? null : i
}
</script>

<template>
  <ul class="list" :class="{ 'fa--animate': animate, in: revealed }">
    <li v-for="(f, i) in items" :key="f.q" class="item" :class="{ open: open === i }" :style="{ '--i': i }">
      <h3 class="q">
        <button
          :id="`${idPrefix}-q${i}`"
          type="button"
          class="q-btn"
          :aria-expanded="open === i"
          :aria-controls="`${idPrefix}-a${i}`"
          @click="toggle(i)"
        >
          <span>{{ f.q }}</span>
          <Icon name="lucide:chevron-down" class="chev" />
        </button>
      </h3>
      <div :id="`${idPrefix}-a${i}`" class="a" role="region" :aria-labelledby="`${idPrefix}-q${i}`" :aria-hidden="open !== i">
        <div class="a-in">
          <p>{{ f.a }}</p>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.list {
  --fa-brand: var(--color-brand, #6366f1);
  --fa-ink: var(--color-ink, #1f2430);
  --fa-muted: var(--color-muted, #6b7280);
  --fa-line: #e6e4f2;
  --fa-ease: cubic-bezier(.22, .8, .24, 1);
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  background: #fff;
  border: 1px solid var(--fa-line);
  border-radius: 10px;
  transition: border-color .25s, box-shadow .3s;
}

.item:hover,
.item.open {
  border-color: #dad7f3;
}

.item.open {
  box-shadow: 0 18px 40px -32px rgba(99, 102, 241, .45);
}

.q {
  margin: 0;
}

.q-btn {
  width: 100%;
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 26px 18px 24px;
  font: inherit;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
  text-align: start;
  color: var(--fa-ink);
  background: none;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  transition: color .2s;
}

.q-btn:hover {
  color: var(--fa-brand);
}

.q-btn:focus-visible {
  outline: 2px solid var(--fa-brand);
  outline-offset: 2px;
}

.chev {
  width: 21px;
  height: 21px;
  flex: none;
  color: #4b5160;
  transition: transform .35s var(--fa-ease), color .2s;
}

.q-btn:hover .chev {
  color: var(--fa-brand);
}

.open .chev {
  transform: rotate(180deg);
}

/* The answer slides open: its row grows from nothing to its own height. */
.a {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows .4s var(--fa-ease);
}

.open .a {
  grid-template-rows: 1fr;
}

.a-in {
  min-height: 0;
  overflow: hidden;
}

.a p {
  margin: 0;
  padding: 0 64px 24px 24px;
  font-size: 15.5px;
  line-height: 1.75;
  color: var(--fa-muted);
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity .25s ease, transform .35s var(--fa-ease);
}

.open .a p {
  margin-top: -6px;
  opacity: 1;
  transform: none;
  transition-delay: .08s;
}

/* ---------- Reveal: questions rise in one after another ---------- */
.fa--animate .item {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity .7s var(--fa-ease), transform .7s var(--fa-ease), border-color .25s, box-shadow .3s;
  transition-delay: calc(var(--i, 0) * 70ms), calc(var(--i, 0) * 70ms), 0s, 0s;
}

.fa--animate.in .item {
  opacity: 1;
  transform: none;
}

@media (max-width: 560px) {
  .q-btn {
    min-height: 62px;
    padding: 16px 18px;
    font-size: 16px;
  }

  .a p {
    padding: 0 18px 20px;
    font-size: 15px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .a,
  .a p,
  .chev {
    transition: none;
  }
}
</style>
