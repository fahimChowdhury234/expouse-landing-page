<script setup lang="ts">
/**
 * A feature page's closing banner (Figma: Registration & ticketing - Demo):
 * a rounded brand band with a headline and a line on the left, and a white
 * "Book a demo" button to /contact-us on the right. Below 760px the button
 * moves under the text.
 */
defineProps<{
  title: string
  text: string
}>()

const uid = useId()
</script>

<template>
  <section class="fc" :aria-labelledby="`${uid}-title`">
    <div class="fc-rail">
      <div class="band">
        <i class="orb" aria-hidden="true" />
        <div class="copy">
          <h2 :id="`${uid}-title`" class="title">{{ title }}</h2>
          <p class="text">{{ text }}</p>
        </div>
        <NuxtLink to="/contact-us" class="btn">Book a demo</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fc {
  background: #fff;
}

.fc-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(32px, 5vw, 56px) clamp(16px, 3vw, 40px) clamp(64px, 8vw, 110px);
}

.band {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: clamp(32px, 5vw, 56px);
  color: #fff;
  background: linear-gradient(135deg, #7564EC 14.64%, #6452E7 46.46%, #4E3DD8 85.36%);
  border-radius: 12px;
}

/* A soft circle off the top-right corner, behind the button. */
.orb {
  position: absolute;
  z-index: -1;
  right: -60px;
  top: -120px;
  width: 340px;
  height: 340px;
  background: rgba(255, 255, 255, .07);
  border-radius: 50%;
  pointer-events: none;
}

.copy {
  max-width: 720px;
}

.title {
  margin: 0;
  font-size: clamp(26px, 3.3vw, 38px);
  font-weight: 800;
  line-height: 1.18;
  text-wrap: balance;
}

.text {
  margin: 16px 0 0;
  font-size: 18px;
  line-height: 1.6;
  color: rgba(255, 255, 255, .9);
}

.btn {
  min-height: 54px;
  flex: none;
  display: inline-flex;
  align-items: center;
  padding: 0 34px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-brand, #6452e7);
  text-decoration: none;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 14px 30px -16px rgba(20, 16, 70, .6);
  transition: transform .25s cubic-bezier(.22, .8, .24, 1), box-shadow .25s;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px -16px rgba(20, 16, 70, .7);
}

.btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

@media (max-width: 760px) {
  .band {
    flex-direction: column;
    align-items: flex-start;
  }

  .text {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .btn {
    align-self: stretch;
    justify-content: center;
  }
}
</style>
