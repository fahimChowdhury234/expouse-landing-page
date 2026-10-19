<script setup lang="ts">
/**
 * The demo request form on /contact-us (Figma: See EXPOUSE in action).
 *
 * Fields, choices, checks and the email fallback live in utils/contact.ts.
 * A field shows its error once it has been left (blur) or the form has been
 * sent once; on send, focus goes to the first field that needs fixing. A
 * hidden "website" field catches bots: when it is filled the request is
 * quietly dropped. After sending, the card turns into a thank-you note that
 * takes focus, so screen readers hear it.
 */
import {
  ATTENDEE_RANGES, EVENT_TYPES, LOCATIONS, ORG_TYPES, REQUIRED,
  demoMailto, validateDemo, type DemoField, type DemoRequest,
} from '~/utils/contact'

const props = defineProps<{
  /** The plan picked on the pricing section, if they came from there. */
  plan?: string
}>()

const config = useRuntimeConfig().public

const form = reactive<DemoRequest>({
  email: '',
  firstName: '',
  lastName: '',
  company: '',
  location: '',
  orgType: '',
  attendees: '',
  eventType: '',
  heardFrom: '',
  details: '',
})
const honeypot = ref('')

const errors = computed(() => validateDemo(form))
const touched = reactive<Partial<Record<DemoField, boolean>>>({})
const tried = ref(false)

/** The message to show under a field, if it should show one yet. */
function err(f: DemoField) {
  return (tried.value || touched[f]) ? errors.value[f] : undefined
}

const isRequired = (f: DemoField) => REQUIRED.includes(f)

type State = 'idle' | 'sending' | 'sent' | 'mailed' | 'failed'
const state = ref<State>('idle')
const mailto = ref('')
const doneHeading = ref<HTMLElement | null>(null)

async function submit() {
  tried.value = true
  const bad = (Object.keys(errors.value) as DemoField[])
  if (bad.length) {
    // The first field in the form's own order.
    const first = (['email', 'firstName', 'lastName', 'company', 'location', 'orgType', 'attendees', 'eventType', 'heardFrom'] as DemoField[]).find(f => bad.includes(f))
    document.getElementById(`cf-${first}`)?.focus()
    return
  }

  const request: DemoRequest = { ...form, plan: props.plan }
  if (honeypot.value) {
    state.value = 'sent'
    return
  }

  if (config.contactEndpoint) {
    state.value = 'sending'
    try {
      await $fetch(config.contactEndpoint, {
        method: 'POST',
        body: { ...request, source: 'expouse.com/contact-us' },
      })
      state.value = 'sent'
    }
    catch {
      state.value = 'failed'
      return
    }
  }
  else {
    // No endpoint: hand the request to the visitor's email app.
    mailto.value = demoMailto(config.contactEmail, request)
    window.location.href = mailto.value
    state.value = 'mailed'
  }

  await nextTick()
  doneHeading.value?.focus()
}

const SELECTS: { key: DemoField, label: string, options: string[] }[] = [
  { key: 'location', label: 'Your location', options: LOCATIONS },
  { key: 'orgType', label: 'Organization type', options: ORG_TYPES },
]
</script>

<template>
  <div class="card">
    <!-- ---------- Thank you ---------- -->
    <div v-if="state === 'sent' || state === 'mailed'" class="done" role="status">
      <span class="done-ico"><Icon name="lucide:check" class="ico" /></span>
      <h2 ref="doneHeading" class="done-title" tabindex="-1">Thanks, {{ form.firstName || 'there' }}!</h2>
      <p v-if="state === 'sent'" class="done-text">
        We've got your request. Someone from our team will email you at <b>{{ form.email }}</b> within one business day to set up your demo.
      </p>
      <template v-else>
        <p class="done-text">
          Your email app should open with your request ready to send. If it didn't, email us at
          <a :href="`mailto:${config.contactEmail}`">{{ config.contactEmail }}</a>.
        </p>
        <a :href="mailto" class="done-again">
          <Icon name="lucide:mail" class="ico" />
          Open the email again
        </a>
      </template>
      <NuxtLink to="/" class="done-home">
        <Icon name="lucide:arrow-left" class="ico" />
        Back to the home page
      </NuxtLink>
    </div>

    <!-- ---------- Form ---------- -->
    <form v-else class="form" novalidate aria-label="Request a demo" @submit.prevent="submit">
      <div class="grid">
        <!-- Business email -->
        <div class="field">
          <label for="cf-email">Business email<i v-if="isRequired('email')" aria-hidden="true">*</i></label>
          <input
            id="cf-email" v-model.trim="form.email" type="email" inputmode="email" autocomplete="email"
            placeholder="you@company.com" required
            :aria-invalid="!!err('email')" :aria-describedby="err('email') ? 'cf-email-err' : undefined"
            @blur="touched.email = true"
          >
          <p v-if="err('email')" id="cf-email-err" class="err">{{ err('email') }}</p>
        </div>

        <div class="field">
          <label for="cf-firstName">First name<i aria-hidden="true">*</i></label>
          <input
            id="cf-firstName" v-model.trim="form.firstName" type="text" autocomplete="given-name"
            placeholder="First name" required
            :aria-invalid="!!err('firstName')" :aria-describedby="err('firstName') ? 'cf-firstName-err' : undefined"
            @blur="touched.firstName = true"
          >
          <p v-if="err('firstName')" id="cf-firstName-err" class="err">{{ err('firstName') }}</p>
        </div>

        <div class="field">
          <label for="cf-lastName">Last name<i aria-hidden="true">*</i></label>
          <input
            id="cf-lastName" v-model.trim="form.lastName" type="text" autocomplete="family-name"
            placeholder="Last name" required
            :aria-invalid="!!err('lastName')" :aria-describedby="err('lastName') ? 'cf-lastName-err' : undefined"
            @blur="touched.lastName = true"
          >
          <p v-if="err('lastName')" id="cf-lastName-err" class="err">{{ err('lastName') }}</p>
        </div>

        <!-- Company, location, organization type -->
        <div class="field">
          <label for="cf-company">Company name<i aria-hidden="true">*</i></label>
          <input
            id="cf-company" v-model.trim="form.company" type="text" autocomplete="organization"
            placeholder="Company or event name" required
            :aria-invalid="!!err('company')" :aria-describedby="err('company') ? 'cf-company-err' : undefined"
            @blur="touched.company = true"
          >
          <p v-if="err('company')" id="cf-company-err" class="err">{{ err('company') }}</p>
        </div>

        <div v-for="s in SELECTS" :key="s.key" class="field">
          <label :for="`cf-${s.key}`">{{ s.label }}<i aria-hidden="true">*</i></label>
          <span class="select">
            <select
              :id="`cf-${s.key}`" v-model="form[s.key]" required :class="{ empty: !form[s.key] }"
              :aria-invalid="!!err(s.key)" :aria-describedby="err(s.key) ? `cf-${s.key}-err` : undefined"
              @blur="touched[s.key] = true"
            >
              <option value="" disabled>Please select</option>
              <option v-for="o in s.options" :key="o" :value="o">{{ o }}</option>
            </select>
            <Icon name="lucide:chevron-down" class="chev" />
          </span>
          <p v-if="err(s.key)" :id="`cf-${s.key}-err`" class="err">{{ err(s.key) }}</p>
        </div>

        <!-- Attendees, event type -->
        <div class="field">
          <label for="cf-attendees">Expected attendees<i aria-hidden="true">*</i></label>
          <span class="select">
            <select
              id="cf-attendees" v-model="form.attendees" required :class="{ empty: !form.attendees }"
              :aria-invalid="!!err('attendees')" :aria-describedby="err('attendees') ? 'cf-attendees-err' : undefined"
              @blur="touched.attendees = true"
            >
              <option value="" disabled>Please select</option>
              <option v-for="o in ATTENDEE_RANGES" :key="o" :value="o">{{ o }}</option>
            </select>
            <Icon name="lucide:chevron-down" class="chev" />
          </span>
          <p v-if="err('attendees')" id="cf-attendees-err" class="err">{{ err('attendees') }}</p>
        </div>

        <div class="field span-2">
          <label for="cf-eventType">Event type<i aria-hidden="true">*</i></label>
          <span class="select">
            <select
              id="cf-eventType" v-model="form.eventType" required :class="{ empty: !form.eventType }"
              :aria-invalid="!!err('eventType')" :aria-describedby="err('eventType') ? 'cf-eventType-err' : undefined"
              @blur="touched.eventType = true"
            >
              <option value="" disabled>Please select</option>
              <option v-for="o in EVENT_TYPES" :key="o" :value="o">{{ o }}</option>
            </select>
            <Icon name="lucide:chevron-down" class="chev" />
          </span>
          <p v-if="err('eventType')" id="cf-eventType-err" class="err">{{ err('eventType') }}</p>
        </div>

        <!-- The two free-text fields -->
        <div class="field">
          <label for="cf-heardFrom">How did you hear about us?<i aria-hidden="true">*</i></label>
          <textarea
            id="cf-heardFrom" v-model.trim="form.heardFrom" rows="4" maxlength="500"
            placeholder="e.g. LinkedIn, an event, a colleague" required
            :aria-invalid="!!err('heardFrom')" :aria-describedby="err('heardFrom') ? 'cf-heardFrom-err' : undefined"
            @blur="touched.heardFrom = true"
          />
          <p v-if="err('heardFrom')" id="cf-heardFrom-err" class="err">{{ err('heardFrom') }}</p>
        </div>

        <div class="field span-2">
          <label for="cf-details">Tell us about your event</label>
          <textarea
            id="cf-details" v-model.trim="form.details" rows="4" maxlength="2000"
            placeholder="Dates, halls, number of exhibitors, anything else"
          />
        </div>
      </div>

      <!-- Bots fill every field; people never see this one. -->
      <div class="hp" aria-hidden="true">
        <label for="cf-website">Website</label>
        <input id="cf-website" v-model="honeypot" type="text" tabindex="-1" autocomplete="off">
      </div>

      <p v-if="state === 'failed'" class="failed" role="alert">
        <Icon name="lucide:circle-alert" class="ico" />
        <span>We couldn't send your request just now. Please try again, or email us at <a :href="`mailto:${config.contactEmail}`">{{ config.contactEmail }}</a>.</span>
      </p>

      <button type="submit" class="submit" :disabled="state === 'sending'">
        <span v-if="state === 'sending'" class="spin" aria-hidden="true" />
        {{ state === 'sending' ? 'Sending…' : 'Schedule my demo' }}
      </button>

      <p class="consent">
        By submitting this form, you agree to receive occasional emails about events and our product, in line with our
        <a v-if="config.privacyUrl" :href="config.privacyUrl">Privacy Policy</a><template v-else>Privacy Policy</template>.
        You can unsubscribe at any time.
      </p>
    </form>
  </div>
</template>

<style scoped>
.card {
  --cf-brand: var(--color-brand, #6366f1);
  --cf-brand-dark: var(--color-brand-dark, #4f46e5);
  --cf-ink: var(--color-ink, #1f2430);
  --cf-muted: var(--color-muted, #6b7280);
  --cf-line: #e3e1ef;
  --cf-error: #dc2626;
  --cf-ease: cubic-bezier(.22, .8, .24, 1);
  position: relative;
  padding: 36px 40px 34px;
  color: var(--cf-ink);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(20, 16, 70, .06), 0 40px 70px -36px rgba(20, 16, 70, .55);
}

.ico {
  flex: none;
}

/* ---------- Fields: wide | narrow | narrow ---------- */
.grid {
  display: grid;
  grid-template-columns: minmax(0, 2.08fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 22px 28px;
}

.span-2 {
  grid-column: span 2;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
}

.field label {
  font-size: 15px;
  font-weight: 500;
  color: #4b5160;
}

.field label i {
  margin-left: 3px;
  font-style: normal;
  color: var(--cf-brand);
}

.field input,
.field select,
.field textarea {
  width: 100%;
  margin: 0;
  font: inherit;
  font-size: 16px;
  color: var(--cf-ink);
  background: #fff;
  border: 1px solid var(--cf-line);
  border-radius: 10px;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}

.field input,
.field select {
  height: 52px;
  padding: 0 16px;
}

.field textarea {
  min-height: 124px;
  padding: 13px 16px;
  line-height: 1.5;
  resize: vertical;
}

.field ::placeholder {
  color: #8a8f9c;
}

.field input:hover,
.field select:hover,
.field textarea:hover {
  border-color: #cfccea;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--cf-brand);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, .14);
}

.field [aria-invalid="true"] {
  border-color: var(--cf-error);
}

.field [aria-invalid="true"]:focus {
  box-shadow: 0 0 0 4px rgba(220, 38, 38, .12);
}

/* Selects: our own chevron, and the placeholder in the placeholder's colour. */
.select {
  position: relative;
  display: block;
}

.field select {
  padding-right: 42px;
  appearance: none;
  cursor: pointer;
}

.field select.empty {
  color: #8a8f9c;
}

.field select option {
  color: var(--cf-ink);
}

.chev {
  position: absolute;
  right: 15px;
  top: 50%;
  width: 18px;
  height: 18px;
  color: #8a8f9c;
  transform: translateY(-50%);
  pointer-events: none;
}

.err {
  margin: -2px 0 0;
  font-size: 13px;
  color: var(--cf-error);
}

/* The honeypot: off screen, not display:none (some bots skip hidden fields). */
.hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* ---------- Send ---------- */
.failed {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 640px;
  margin: 26px auto 0;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.5;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
}

.failed .ico {
  width: 18px;
  height: 18px;
  margin-top: 1px;
}

.failed a {
  font-weight: 700;
  color: inherit;
}

.submit {
  width: min(100%, 470px);
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 28px auto 0;
  font: inherit;
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  background: var(--cf-brand);
  border: 0;
  border-radius: 9px;
  cursor: pointer;
  box-shadow: 0 14px 28px -16px rgba(79, 70, 229, .8);
  transition: background-color .2s, box-shadow .2s, transform .2s var(--cf-ease);
}

.submit:hover:not(:disabled) {
  background: var(--cf-brand-dark);
  transform: translateY(-1px);
}

.submit:focus-visible {
  outline: 3px solid rgba(99, 102, 241, .45);
  outline-offset: 3px;
}

.submit:disabled {
  cursor: progress;
  opacity: .85;
}

.spin {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, .45);
  border-top-color: #fff;
  border-radius: 50%;
  animation: cf-spin .7s linear infinite;
}

.consent {
  max-width: 640px;
  margin: 18px auto 0;
  font-size: 13.5px;
  line-height: 1.6;
  text-align: center;
  color: var(--cf-muted);
}

.consent a {
  color: var(--cf-brand);
  text-decoration: none;
}

.consent a:hover {
  text-decoration: underline;
}

/* ---------- Thank you ---------- */
.done {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 560px;
  margin: 0 auto;
  padding: 28px 0 18px;
  text-align: center;
  animation: cf-in .5s var(--cf-ease) both;
}

.done-ico {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #16a34a;
  background: #e7f8ee;
  box-shadow: 0 0 0 10px #f3fbf6;
}

.done-ico .ico {
  width: 30px;
  height: 30px;
}

.done-title {
  margin: 26px 0 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -.02em;
  outline: none;
}

.done-text {
  margin: 12px 0 0;
  font-size: 16px;
  line-height: 1.65;
  color: var(--cf-muted);
}

.done-text a,
.done-text b {
  font-weight: 700;
  color: var(--cf-ink);
}

.done-again,
.done-home {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
}

.done-again {
  margin-top: 18px;
  padding: 11px 18px;
  color: var(--cf-brand);
  background: #f1effd;
  border-radius: 10px;
}

.done-home {
  margin-top: 18px;
  color: var(--cf-muted);
}

.done-home:hover {
  color: var(--cf-ink);
}

.done-again .ico,
.done-home .ico {
  width: 16px;
  height: 16px;
}

@keyframes cf-spin {
  to { transform: rotate(360deg); }
}

@keyframes cf-in {
  from { opacity: 0; transform: translateY(10px); }
}

/* Tablets: two columns, the wide fields across both. */
@media (max-width: 900px) {
  .card {
    padding: 30px 26px 28px;
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  /* Email, company and the two text boxes across; the rest in pairs. */
  .span-2 {
    grid-column: auto;
  }

  .grid > .field:nth-child(1),
  .grid > .field:nth-child(4),
  .grid > .field:nth-child(9),
  .grid > .field:nth-child(10) {
    grid-column: 1 / -1;
  }
}

/* Phones: one column. */
@media (max-width: 560px) {
  .card {
    padding: 24px 18px 22px;
  }

  .grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;
  }

  .grid > .field:nth-child(n) {
    grid-column: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .done,
  .spin {
    animation: none;
  }

  .submit {
    transition: none;
  }
}
</style>
