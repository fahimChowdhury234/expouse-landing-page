<script setup lang="ts">
/**
 * A feature page's questions (Figma: Registration & ticketing - FAQ): an
 * accordion between hairlines, one answer open at a time, the first open to
 * start with. The round button beside each question shows a plus, and turns
 * into a filled brand circle with a cross when its answer is open. Answers
 * slide open (a grid row from 0fr to 1fr) and are always in the page for
 * search engines and readers without JS - the page's FAQPage structured data
 * reads the same list.
 */
const props = defineProps<{
  title: string
  faqs: { q: string, a: string }[]
}>()

const open = ref<number | null>(props.faqs.length ? 0 : null)

function toggle(i: number) {
  open.value = open.value === i ? null : i
}

const uid = useId()
</script>

<template>
  <section class="ff" :aria-labelledby="`${uid}-title`">
    <div class="ff-rail">
      <h2 :id="`${uid}-title`" class="ff-title">{{ title }}</h2>

      <ul class="list">
        <li v-for="(f, i) in faqs" :key="f.q" class="item" :class="{ open: open === i }">
          <h3 class="q">
            <button
              :id="`${uid}-q${i}`"
              type="button"
              class="q-btn"
              :aria-expanded="open === i"
              :aria-controls="`${uid}-a${i}`"
              @click="toggle(i)"
            >
              <span>{{ f.q }}</span>
              <span class="sign" aria-hidden="true"><Icon name="lucide:plus" class="ico" /></span>
            </button>
          </h3>
          <div :id="`${uid}-a${i}`" class="a" role="region" :aria-labelledby="`${uid}-q${i}`" :aria-hidden="open !== i">
            <div class="a-in">
              <p>{{ f.a }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.ff {
  --ff-brand: var(--color-brand, #6452e7);
  --ff-line: #e8e9ee;
  --ff-ease: cubic-bezier(.22, .8, .24, 1);
  color: var(--color-ink, #1f2430);
  background: #fff;
}

.ff-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(56px, 7vw, 96px) clamp(16px, 3vw, 40px) clamp(40px, 5vw, 64px);
}

.ff-title {
  margin: 0 auto clamp(28px, 4vw, 52px);
  font-size: clamp(28px, 3.4vw, 42px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -.02em;
  text-align: center;
  text-wrap: balance;
}

.list {
  max-width: 820px;
  margin: 0 auto;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--ff-line);
}

.item {
  border-bottom: 1px solid var(--ff-line);
}

.q {
  margin: 0;
}

.q-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 26px 0;
  font: inherit;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  text-align: start;
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
  transition: color .2s;
}

.q-btn:hover {
  color: var(--ff-brand);
}

.q-btn:focus-visible {
  outline: 2px solid var(--ff-brand);
  outline-offset: 4px;
  border-radius: 6px;
}

/* A plus on a soft circle; open, a cross on a filled one. */
.sign {
  width: 32px;
  height: 32px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--ff-brand);
  background: #f1effd;
  border-radius: 50%;
  transition: color .25s, background-color .25s;
}

.sign .ico {
  width: 16px;
  height: 16px;
  transition: transform .35s var(--ff-ease);
}

/* .q-btn:hover .sign {
  background: #e8e6fc;
} */

.open .sign {
  color: #fff;
  background: var(--ff-brand);
}

.open .sign .ico {
  transform: rotate(45deg);
}

/* The answer slides open: its row grows from nothing to its own height. */
.a {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows .4s var(--ff-ease);
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
  padding: 0 64px 28px 0;
  font-size: 16px;
  line-height: 1.75;
  color: var(--color-muted, #6b7280);
  opacity: 0;
  transition: opacity .25s ease;
}

.open .a p {
  opacity: 1;
  transition-delay: .08s;
}

@media (max-width: 560px) {
  .q-btn {
    padding: 20px 0;
    font-size: 16.5px;
  }

  .sign {
    width: 36px;
    height: 36px;
  }

  .a p {
    padding-right: 0;
    font-size: 15px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .a,
  .a p,
  .sign,
  .sign .ico {
    transition: none;
  }
}
</style>
