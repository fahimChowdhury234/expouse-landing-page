<script setup lang="ts">
/**
 * /contact-us: book a demo (Figma: See EXPOUSE in action).
 *
 * A brand panel with the heading, what the demo covers and the contact email,
 * and the request form on a white card inside it (components/contact). The
 * landing page's "Schedule live demo" banner and the pricing buttons link
 * here; a pricing button passes its plan (?plan=organizer), which the page
 * shows and the request carries.
 */
import { PLAN_NAMES } from '~/utils/contact'

const config = useRuntimeConfig().public
const route = useRoute()

const plan = computed(() => {
  const key = String(route.query.plan ?? '').toLowerCase()
  return PLAN_NAMES[key]
})

useSeoMeta({
  title: 'Book a demo | EXPOUSE',
  ogTitle: 'Book a demo | EXPOUSE',
  description: 'Book a 30-minute call with the EXPOUSE team and see how your event would run, from the registration form to the final report.',
  ogDescription: 'Book a 30-minute call with the EXPOUSE team and see how your event would run, from the registration form to the final report.',
})
</script>

<template>
  <section class="cu" aria-labelledby="cu-title">
    <div class="cu-rail">
      <div class="panel">
        <i class="glow a" aria-hidden="true" />
        <i class="glow b" aria-hidden="true" />

        <header class="head">
          <h1 id="cu-title" class="title">Let's talk about your event</h1>
          <p class="sub">Book a 30-minute call. We'll show you how your event would run on EXPOUSE and answer whatever you want to ask.</p>
          <p class="mail">Or email us at <a :href="`mailto:${config.contactEmail}`">{{ config.contactEmail }}</a></p>
          <p v-if="plan" class="plan">
            <Icon name="lucide:sparkles" class="ico" />
            Interested in the {{ plan }} plan
          </p>
        </header>

        <ContactForm :plan="plan" class="form-card" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.cu {
  --cu-brand: var(--color-brand, #6366f1);
  background: #fff;
}

.cu-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(20px, 3vw, 32px) clamp(12px, 3vw, 40px) clamp(48px, 6vw, 80px);
}

/* ---------- Brand panel ---------- */
.panel {
  position: relative;
  overflow: hidden;
  padding: clamp(40px, 6vw, 64px) clamp(16px, 4.5vw, 56px) clamp(32px, 5vw, 56px);
  background: var(--cu-brand);
  border-radius: 22px;
}

/* Two soft lights in the corners, so the panel isn't flat. */
.glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(10px);
}

.glow.a {
  left: -120px;
  top: -160px;
  width: 420px;
  height: 420px;
  background: radial-gradient(closest-side, rgba(255, 255, 255, .2), transparent);
}

.glow.b {
  right: -140px;
  top: 120px;
  width: 460px;
  height: 460px;
  background: radial-gradient(closest-side, rgba(139, 124, 246, .55), transparent);
}

.head {
  position: relative;
  max-width: 760px;
  margin: 0 auto clamp(28px, 4vw, 40px);
  text-align: center;
  color: #fff;
}

.title {
  margin: 0;
  font-size: clamp(30px, 4vw, 44px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.03em;
}

.sub {
  margin: 16px auto 0;
  max-width: 680px;
  font-size: 17.5px;
  line-height: 1.65;
  color: rgba(255, 255, 255, .9);
}

.mail {
  margin: 18px 0 0;
  font-size: 16px;
  color: rgba(255, 255, 255, .88);
}

.mail a {
  font-weight: 700;
  color: #fff;
  text-decoration: none;
}

.mail a:hover {
  text-decoration: underline;
}

.plan {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 18px 0 0;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: rgba(255, 255, 255, .16);
  border: 1px solid rgba(255, 255, 255, .28);
  border-radius: 999px;
}

.plan .ico {
  width: 15px;
  height: 15px;
}

.form-card {
  position: relative;
}
</style>
