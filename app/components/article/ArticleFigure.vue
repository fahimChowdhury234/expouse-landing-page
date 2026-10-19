<script setup lang="ts">
/** A rounded photo with a caption under it: the article's cover (2:1) or one in the body (16:9). */
withDefaults(defineProps<{
  src: string
  caption?: string
  ratio?: string
  /** The cover is above the fold: load it straight away. */
  eager?: boolean
}>(), {
  caption: undefined,
  ratio: '16 / 9',
})
</script>

<template>
  <figure class="fig">
    <img
      :src="src"
      alt=""
      class="img"
      :style="{ aspectRatio: ratio }"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : undefined"
    >
    <figcaption v-if="caption" class="cap">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  background: #eceaf6;
  border-radius: 12px;
}

.cap {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-muted, #6b7280);
}
</style>
