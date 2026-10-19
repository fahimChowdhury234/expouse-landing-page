<script setup lang="ts">
/** An article's text, block by block (utils/news.ts ArticleBlock). Headings get ids for the table of contents. */
import { headingId, type ArticleBlock } from '~/utils/news'

defineProps<{
  blocks: ArticleBlock[]
}>()
</script>

<template>
  <div class="ab">
    <template v-for="(b, i) in blocks" :key="i">
      <p v-if="b.type === 'p'" class="p">{{ b.text }}</p>
      <h2 v-else-if="b.type === 'h2'" :id="headingId(b.text)" class="h2">{{ b.text }}</h2>
      <ArticleStats v-else-if="b.type === 'stats'" :items="b.items" class="wide" />
      <ArticleQuote v-else-if="b.type === 'quote'" :text="b.text" :cite="b.cite" class="quote" />
      <ArticleFigure v-else-if="b.type === 'figure'" :src="b.src" :caption="b.caption" class="wide" />
      <ArticleSteps v-else-if="b.type === 'steps'" :items="b.items" class="steps" />
    </template>
  </div>
</template>

<style scoped>
.ab > :first-child {
  margin-top: 0;
}

.ab > :last-child {
  margin-bottom: 0;
}

.p {
  margin: 0 0 20px;
  font-size: 18px;
  line-height: 1.72;
  color: #2b303b;
}

.h2 {
  margin: 42px 0 20px;
  font-size: clamp(24px, 3vw, 30px);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -.015em;
  color: var(--color-ink, #1f2430);
}

.wide {
  margin: 36px 0;
}

.quote {
  margin: 32px 0;
}

.steps {
  margin: 20px 0 36px;
}
</style>
