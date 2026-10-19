<script setup lang="ts">
/** A pull quote on a brand-purple panel, with who said it. */
defineProps<{
  text: string
  cite: string
}>()
</script>

<template>
  <blockquote class="quote">
    <i class="orb" aria-hidden="true" />
    <p class="text">“{{ text }}”</p>
    <footer class="cite">{{ cite }}</footer>
  </blockquote>
</template>

<style scoped>
.quote {
  position: relative;
  overflow: hidden;
  padding: 28px 28px 30px;
  color: #fff;
  background: linear-gradient(135deg, #6a5aea 0%, #6150e5 50%, #5141dd 100%);
  border-radius: 12px;
}

/* A soft circle in the top-right corner. (Not ".ring" - that's a Tailwind utility.) */
.orb {
  position: absolute;
  right: -101px;
  top: -101px;
  width: 246px;
  height: 246px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .07);
  pointer-events: none;
}

.text {
  position: relative;
  max-width: 620px;
  margin: 0;
  font-size: clamp(19px, 2.4vw, 23px);
  font-weight: 700;
  line-height: 1.42;
}

.cite {
  position: relative;
  margin-top: 14px;
  font-size: 15px;
  color: rgba(255, 255, 255, .8);
}
</style>
