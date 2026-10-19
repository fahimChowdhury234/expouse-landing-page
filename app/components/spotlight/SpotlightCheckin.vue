<script setup lang="ts">
/**
 * The Onsite row's picture (Figma: Check-in without the queues): an exhibitor
 * badge with its QR code, a "Checked in" card at the top right and a "Badge
 * printed" card at the bottom left.
 *
 * While it is on screen it plays the event-day loop (after expouse-landing's
 * hero journey): the next attendee's badge prints at a kiosk (it feeds in from
 * the top while the kiosk card counts it through), the gate scans the QR (a
 * laser sweeps it) and the "Checked in" card pops up with the gate and time.
 * Off screen, with reduced motion or without JS it is the Figma frame.
 *
 * Every person and company here is fictional sample data.
 */
const PEOPLE = [
  { name: 'Layla Haddad', company: 'Gulf Logistics Co.', role: 'Exhibitor', seed: 523, gate: 'Gate A', time: '09:41', kiosk: 'Kiosk 3', secs: 4 },
  { name: 'Sara Ali', company: 'Fleetly', role: 'Visitor', seed: 411, gate: 'Gate B', time: '09:42', kiosk: 'Kiosk 1', secs: 3 },
  { name: 'James Park', company: 'Maersk', role: 'VIP', seed: 789, gate: 'Gate A', time: '09:44', kiosk: 'Kiosk 2', secs: 4 },
  { name: 'Noura Khalid', company: 'Shipwise', role: 'Speaker', seed: 903, gate: 'Gate C', time: '09:45', kiosk: 'Kiosk 3', secs: 5 },
]

const idx = ref(0)
const person = computed(() => PEOPLE[idx.value]!)
/** The kiosk card: printing (with a progress bar), printed, or hidden between attendees. */
const print = ref<'printing' | 'printed' | 'off'>('printed')
const checked = ref(true)
/** Bumped to restart the laser sweep. */
const scan = ref(0)
const scanning = ref(false)

const tl = useTimeline()

function loop() {
  tl.run(async (wait) => {
    // Coming back into view mid-loop: settle on a finished attendee first.
    print.value = 'printed'
    checked.value = true
    scanning.value = false
    await wait(2600)

    while (true) {
      // Clear the cards, then the next badge prints (its enter animation).
      checked.value = false
      print.value = 'off'
      await wait(380)
      idx.value = (idx.value + 1) % PEOPLE.length
      await wait(260)
      print.value = 'printing'
      await wait(1500)
      print.value = 'printed'
      await wait(650)

      // The gate scans it.
      scan.value++
      scanning.value = true
      await wait(950)
      scanning.value = false
      checked.value = true
      await wait(3200)
    }
  })
}

const root = ref<HTMLElement | null>(null)
usePlayInView(root, { play: loop, pause: tl.cancel })
</script>

<template>
  <div ref="root" class="stage" role="img" :aria-label="`Sample: ${person.name}'s exhibitor badge, printed at a kiosk and checked in at the gate`">
    <Transition name="sc-badge" mode="out-in">
      <div :key="idx" class="badge" aria-hidden="true">
        <div class="bh">
          <small>Gulf Logistics Expo 2026</small>
          <b>{{ person.role }}</b>
        </div>
        <div class="bb">
          <b class="name">{{ person.name }}</b>
          <span class="co">{{ person.company }}</span>
          <div class="qr">
            <SpotlightQr :seed="person.seed" />
            <i v-if="scanning" :key="scan" class="laser" />
          </div>
        </div>
      </div>
    </Transition>

    <div class="chip checked" :class="{ on: checked }" aria-hidden="true">
      <span class="dot ok"><Icon name="lucide:check" class="ico" /></span>
      <span class="txt"><b>Checked in</b><small>{{ person.gate }} · {{ person.time }}</small></span>
    </div>

    <div class="chip printed" :class="{ on: print !== 'off' }" aria-hidden="true">
      <span class="dot pr" :class="{ busy: print === 'printing' }"><Icon name="lucide:printer" class="ico" /></span>
      <span v-if="print === 'printing'" class="txt">
        <b>Printing…</b>
        <small>{{ person.kiosk }}</small>
        <i class="bar"><i /></i>
      </span>
      <span v-else class="txt"><b>Badge printed</b><small>{{ person.kiosk }} · {{ person.secs }} sec</small></span>
    </div>
  </div>
</template>

<style scoped>
.stage {
  --ok: #16a34a;
  --ok-soft: #e7f8ee;
  --ease: cubic-bezier(.22, .8, .24, 1);
  position: relative;
  height: 100%;
  min-height: 415px;
  display: grid;
  place-items: center;
}

/* ---------- Badge ---------- */
.badge {
  position: relative;
  width: 259px;
  overflow: hidden;
  background: #fff;
  border-radius: 4px 4px 14px 14px;
  box-shadow: 0 2px 6px rgba(31, 36, 48, .04), 0 34px 60px -30px rgba(76, 61, 190, .4);
}

.bh {
  height: 81px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #fff;
  background: var(--color-brand, #6366f1);
}

.bh small {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
  opacity: .88;
}

.bh b {
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: .24em;
  text-transform: uppercase;
}

.bb {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 20px 22px;
}

.name {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -.01em;
  color: var(--color-ink, #1f2430);
}

.co {
  margin-top: 6px;
  font-size: 14px;
  color: var(--color-muted, #6b7280);
}

.qr {
  position: relative;
  width: 123px;
  height: 123px;
  margin-top: 18px;
}

/* The gate's scan: a green line sweeps down the code. */
.laser {
  position: absolute;
  left: -10px;
  right: -10px;
  top: 0;
  height: 3px;
  border-radius: 2px;
  background: #22c55e;
  box-shadow: 0 0 14px 3px rgba(34, 197, 94, .7);
  animation: sc-laser .9s ease-in-out both;
}

/* A new badge feeds out of the printer from the top; the old one fades away. */
.sc-badge-enter-active {
  animation: sc-print 1.4s cubic-bezier(.45, .05, .35, 1) both;
}

.sc-badge-leave-active {
  transition: opacity .25s, transform .25s var(--ease);
}

.sc-badge-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(.98);
}

/* ---------- Floating cards ---------- */
.chip {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px 12px 13px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(31, 36, 48, .05), 0 16px 34px -16px rgba(31, 36, 48, .22);
  opacity: 0;
  transform: translateY(8px) scale(.94);
  transition: opacity .35s var(--ease), transform .45s var(--ease);
}

.chip.on {
  opacity: 1;
  transform: none;
}

/* Top right, over the badge's corner. */
.checked {
  left: calc(50% + 129.5px - 8px);
  top: calc(50% - 161px - 5px);
}

/* Bottom left, under the badge's edge. */
.printed {
  right: calc(50% + 129.5px - 20px);
  top: calc(50% + 161px - 54px);
  min-width: 156px;
}

.dot {
  position: relative;
  width: 31px;
  height: 31px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 50%;
}

.dot .ico {
  width: 16px;
  height: 16px;
}

.dot.ok {
  color: var(--ok);
  background: var(--ok-soft);
}

/* A ring ripples out when someone is checked in. */
.checked.on .dot.ok::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  animation: sc-ripple 1s var(--ease) .15s both;
}

.dot.pr {
  color: var(--color-brand, #6366f1);
  background: #efedfc;
}

.dot.pr.busy .ico {
  animation: sc-nudge .5s ease-in-out infinite alternate;
}

.txt {
  display: grid;
  min-width: 0;
  line-height: 1.3;
}

.txt b {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-ink, #1f2430);
  white-space: nowrap;
}

.txt small {
  font-size: 12.5px;
  color: var(--color-muted, #6b7280);
  white-space: nowrap;
}

.bar {
  display: block;
  height: 3px;
  margin-top: 5px;
  overflow: hidden;
  background: #efedfc;
  border-radius: 3px;
}

.bar i {
  display: block;
  height: 100%;
  background: var(--color-brand, #6366f1);
  border-radius: 3px;
  animation: sc-fill 1.4s cubic-bezier(.45, .05, .35, 1) both;
}

@keyframes sc-print {
  from { clip-path: inset(0 0 100% 0); transform: translateY(-14px); }
  to { clip-path: inset(0 0 0 0); transform: none; }
}

@keyframes sc-laser {
  0% { top: 0; opacity: 0; }
  15%, 85% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

@keyframes sc-ripple {
  from { box-shadow: 0 0 0 0 rgba(34, 197, 94, .45); }
  to { box-shadow: 0 0 0 12px rgba(34, 197, 94, 0); }
}

@keyframes sc-nudge {
  to { transform: translateY(-2px); }
}

@keyframes sc-fill {
  from { width: 0; }
  to { width: 100%; }
}

/* Narrow panels: the cards tuck in at the panel's edges instead of hanging off the badge. */
@media (max-width: 560px) {
  .stage { min-height: 450px; }
  .checked { left: auto; right: 8px; top: 8px; }
  .printed { right: auto; left: 8px; top: auto; bottom: 8px; min-width: 0; }
}
</style>
