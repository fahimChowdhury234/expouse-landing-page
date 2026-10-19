<script setup lang="ts">
/**
 * /news's sidebar: an email subscribe card and the media enquiries card.
 *
 * The form posts to NUXT_PUBLIC_NEWSLETTER_ENDPOINT as JSON when that is set;
 * without one (the default, static-site case) it just confirms locally - the
 * address isn't lost, there's simply nowhere configured to send it yet.
 */
const config = useRuntimeConfig().public

const email = ref('')
const tried = ref(false)
const state = ref<'idle' | 'sending' | 'done' | 'failed'>('idle')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const error = computed(() => {
  if (!email.value.trim()) return 'Enter your email address.'
  if (!EMAIL_RE.test(email.value.trim())) return 'Enter a valid email, like you@company.com.'
  return undefined
})

async function submit() {
  tried.value = true
  if (error.value) return

  if (config.newsletterEndpoint) {
    state.value = 'sending'
    try {
      await $fetch(config.newsletterEndpoint, {
        method: 'POST',
        body: { email: email.value.trim(), source: 'expouse.com/news' },
      })
    }
    catch {
      state.value = 'failed'
      return
    }
  }

  state.value = 'done'
}
</script>

<template>
  <div class="side">
    <div class="card subscribe">
      <i class="orb a" aria-hidden="true" />
      <i class="orb b" aria-hidden="true" />
      <h2 class="title">Get news by email</h2>

      <template v-if="state === 'done'">
        <p class="done" role="status">
          <Icon name="lucide:check-circle" class="ico" />
          You're subscribed with {{ email }}.
        </p>
      </template>
      <template v-else>
        <p class="text">One email a month with releases and event stories.</p>
        <form class="form" novalidate @submit.prevent="submit">
          <input
            v-model="email"
            type="email"
            name="email"
            placeholder="you@company.com"
            autocomplete="email"
            class="input"
            :aria-invalid="tried && !!error"
            @blur="tried = true"
          >
          <p v-if="tried && error" class="error">{{ error }}</p>
          <p v-if="state === 'failed'" class="error">Something went wrong - please try again.</p>
          <button type="submit" class="submit" :disabled="state === 'sending'">
            {{ state === 'sending' ? 'Subscribing…' : 'Subscribe' }}
          </button>
        </form>
      </template>
    </div>

    <div class="card enquiries">
      <h2 class="title">Media enquiries</h2>
      <p class="text">For interviews, logos and product images.</p>
      <a :href="`mailto:${config.pressEmail}`" class="mail">{{ config.pressEmail }}</a>
    </div>
  </div>
</template>

<style scoped>
.side {
  --side-brand: var(--color-brand, #6452e7);
  --side-brand-dark: var(--color-brand-dark, #4f46e5);
  display: grid;
  gap: 18px;
  align-content: start;
}

.card {
  position: relative;
  overflow: hidden;
  padding: 26px;
  border-radius: 12px;
}

.subscribe {
  background: #f4f3fd;
  border: 1px solid #e7e4f8;
}

/* Two soft circles centred on the top-right corner. (Not ".ring" - that's a Tailwind utility.) */
.orb {
  position: absolute;
  border-radius: 50%;
  background: rgba(100, 82, 231, .035);
  pointer-events: none;
}

.orb.a {
  right: -130px;
  top: -130px;
  width: 260px;
  height: 260px;
}

.orb.b {
  right: -104px;
  top: -104px;
  width: 208px;
  height: 208px;
}

.enquiries {
  background: #fff;
  border: 1px solid var(--color-line, #e8e9ee);
}


.title {
  position: relative;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-ink, #1f2430);
}

.text {
  position: relative;
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.45;
  color: var(--color-muted, #6b7280);
}

.form {
  position: relative;
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.input {
  height: 46px;
  padding: 0 16px;
  font: inherit;
  font-size: 14px;
  color: var(--color-ink, #1f2430);
  background: #fff;
  border: 1px solid #e3e5ea;
  border-radius: 8px;
  transition: border-color .2s, box-shadow .2s;
}

.input::placeholder {
  color: #9aa1ad;
}

.input:focus-visible {
  outline: none;
  border-color: var(--side-brand);
  box-shadow: 0 0 0 3px var(--color-brand-soft, #6452e712);
}

.input[aria-invalid="true"] {
  border-color: #dc2626;
}

.error {
  margin: 0;
  font-size: 13px;
  color: #dc2626;
}

.submit {
  height: 46px;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: var(--side-brand);
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color .2s;
}

.submit:hover:not(:disabled) {
  background: var(--side-brand-dark);
}

.submit:disabled {
  opacity: .7;
  cursor: progress;
}

.submit:focus-visible,
.mail:focus-visible {
  outline: 2px solid var(--side-brand);
  outline-offset: 2px;
}

.done {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 14px 0 0;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--color-ink, #1f2430);
}

.done .ico {
  flex: none;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  color: #10b981;
}

.mail {
  position: relative;
  display: inline-block;
  margin-top: 14px;
  font-size: 15px;
  font-weight: 700;
  color: var(--side-brand);
  text-decoration: none;
}

.mail:hover {
  text-decoration: underline;
}
.enquiries .title {
  margin-top: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-ink, #1f2430);
}
</style>
