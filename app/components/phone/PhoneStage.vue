<script setup lang="ts">
/**
 * A fixed-size drawing (phones laid out in design pixels) scaled to fit the
 * width it is given, so the screens keep their exact layout at every size,
 * the way a screenshot would. Never scales up. Centred when there is room.
 */
const props = defineProps<{
  /** Design size of the drawing, in px. */
  width: number
  height: number
}>()

const box = ref<HTMLElement | null>(null)
const scale = ref(1)
let resizeObserver: ResizeObserver | null = null

function fit() {
  const cw = box.value?.clientWidth
  if (cw) scale.value = Math.min(1, cw / props.width)
}

onMounted(() => {
  fit()
  if ('ResizeObserver' in window && box.value) {
    resizeObserver = new ResizeObserver(fit)
    resizeObserver.observe(box.value)
  }
  else {
    window.addEventListener('resize', fit)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', fit)
})
</script>

<template>
  <div ref="box" class="ps" :style="{ height: `${height * scale}px` }">
    <div class="ps-canvas" :style="{ width: `${width}px`, height: `${height}px`, '--s': scale }">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ps {
  position: relative;
  width: 100%;
}

.ps-canvas {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%) scale(var(--s, 1));
  transform-origin: 50% 0;
}
</style>
