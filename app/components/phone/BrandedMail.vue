<script setup lang="ts">
/**
 * The phone's Mail app, showing the event's registration email: the attendee's
 * badge QR, Download My Badge, the date and venue, and the app-store links, all
 * in the event's brand (--color-brand) and name. Opens on the inbox with the
 * event's email on top and, a moment later, opens it, the way someone would;
 * `play` restarts that (the parent bumps it each time Mail opens). Back returns
 * to the inbox; tapping the email opens it again.
 *
 * The event, people and messages are fictional sample data.
 */
import type { SampleEvent } from '~/utils/events'
import { QR_FINDERS, QR_SIZE, badgeQrCells } from '~/utils/badges'

const props = withDefaults(defineProps<{
  event: SampleEvent
  time?: string
  play?: number
}>(), { time: '9:41', play: 0 })

const OTHER_MAIL = [
  { from: 'Travel desk', subject: 'Hotel booking confirmed', preview: 'Check-in from 2 PM. Your room is on the 4th floor…', time: 'Yesterday' },
  { from: 'Sales team', subject: 'Expo prep notes', preview: 'Here are the accounts to meet at the show…', time: 'Mon' },
  { from: 'Calendar', subject: 'Reminder: flights on Sunday', preview: 'Departure 07:40, terminal 1…', time: 'Sun' },
]

const cells = badgeQrCells('VISITOR')
const open = ref(false)
const saved = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

function replay() {
  if (timer) clearTimeout(timer)
  open.value = false
  saved.value = false
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  timer = setTimeout(() => { open.value = true }, reduced ? 0 : 900)
}

function download() {
  saved.value = true
}

watch(() => props.play, p => p && replay())
onMounted(() => {
  if (props.play) replay()
})
onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <PhoneFrame :time="time" interactive>
    <div class="mail">
      <!-- Inbox -->
      <div class="inbox">
        <header class="bar">
          <b>Inbox</b>
          <Icon name="lucide:square-pen" class="ico" />
        </header>
        <button type="button" class="row unread" @click="open = true">
          <span class="tile">{{ event.initial }}</span>
          <span class="txt">
            <span class="top"><b>{{ event.app }}</b><small>9:41</small></span>
            <span class="subj">You're registered: {{ event.name }}</span>
            <small>Your badge is ready. Show the QR at the gate…</small>
          </span>
        </button>
        <div v-for="m in OTHER_MAIL" :key="m.subject" class="row">
          <span class="tile grey">{{ m.from[0] }}</span>
          <span class="txt">
            <span class="top"><b>{{ m.from }}</b><small>{{ m.time }}</small></span>
            <span class="subj">{{ m.subject }}</span>
            <small>{{ m.preview }}</small>
          </span>
        </div>
      </div>

      <!-- The event's email, sliding over the inbox -->
      <Transition name="slide">
        <div v-if="open" class="msg">
          <header class="bar">
            <button type="button" class="back" @click="open = false"><Icon name="lucide:chevron-left" class="ico" />Inbox</button>
            <span class="tools"><Icon name="lucide:archive" class="ico" /><Icon name="lucide:trash-2" class="ico" /></span>
          </header>
          <div class="scroll">
            <b class="msg-subj">You're registered: {{ event.name }}</b>
            <div class="from">
              <span class="tile">{{ event.initial }}</span>
              <p><b>{{ event.app }}</b><small>to me · 9:41</small></p>
            </div>

            <div class="card">
              <div class="band">
                <span class="tile light">{{ event.initial }}</span>
                <p><small>{{ event.kicker }}</small><b>{{ event.name }}</b></p>
              </div>
              <div class="inner">
                <b class="hi">You're registered! 🎉</b>
                <p>Hi there, thanks for registering. Your badge is below: show the QR code at the gate to get in.</p>

                <div class="ticket">
                  <svg :viewBox="`0 0 ${QR_SIZE} ${QR_SIZE}`" class="qr" aria-hidden="true">
                    <rect v-for="([x, y], i) in cells" :key="i" :x="x" :y="y" width="1.04" height="1.04" />
                    <g v-for="([fx, fy], i) in QR_FINDERS" :key="`f${i}`">
                      <path :d="`M${fx + 0.5} ${fy + 0.5}h6v6h-6z`" fill="none" stroke="#1a1a2e" stroke-width="1" />
                      <rect :x="fx + 2" :y="fy + 2" width="3" height="3" />
                    </g>
                  </svg>
                  <span class="t-txt">
                    <b>Full Name</b>
                    <small>Visitor · Badge EX-20418</small>
                    <span class="t-tag">Valid all 3 days</span>
                  </span>
                </div>

                <button type="button" class="dl" :class="{ done: saved }" @click="download">
                  <Icon :name="saved ? 'lucide:circle-check' : 'lucide:download'" class="ico" />{{ saved ? 'Badge saved to Photos' : 'Download My Badge' }}
                </button>

                <div class="info">
                  <span><Icon name="lucide:calendar-days" class="ico" />{{ event.dates }}</span>
                  <span><Icon name="lucide:map-pin" class="ico" />{{ event.place }}</span>
                </div>

                <b class="get">Get the {{ event.app }} app</b>
                <div class="stores">
                  <span><Icon name="lucide:smartphone" class="ico" />App Store</span>
                  <span><Icon name="lucide:play" class="ico" />Google Play</span>
                </div>
              </div>
              <small class="foot">Powered by EXPOUSE</small>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </PhoneFrame>
</template>

<style scoped>
.mail {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #fff;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 38px;
  padding: 0 12px;
  border-bottom: 1px solid #f0f1f5;
}

.bar b {
  font-size: 15px;
}

.bar .ico {
  width: 14px;
  height: 14px;
  color: #2563eb;
}

/* ---------- Inbox ---------- */
.inbox {
  height: 100%;
}

.row {
  display: flex;
  gap: 8px;
  width: 100%;
  padding: 9px 12px;
  border: 0;
  border-bottom: 1px solid #f3f3f7;
  background: none;
  font: inherit;
  text-align: left;
  color: inherit;
}

button.row {
  cursor: pointer;
}

.row.unread {
  background: color-mix(in srgb, var(--color-brand, #6452E7) 6%, #fff);
}

.tile {
  flex: none;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--color-brand, #6452E7);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
}

.tile.grey {
  background: #d7dae3;
  color: #fff;
}

.txt {
  flex: 1;
  min-width: 0;
  display: grid;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.top b {
  font-size: 9.5px;
}

.unread .top b::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 4px;
  border-radius: 50%;
  background: #2563eb;
  vertical-align: 1px;
}

.top small {
  font-size: 7.5px;
  color: #9aa1ad;
}

.subj {
  font-size: 8.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.txt > small {
  font-size: 8px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------- The email ---------- */
.msg {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.back {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: 10.5px;
  color: #2563eb;
  cursor: pointer;
}

.tools {
  display: flex;
  gap: 12px;
}

.scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 10px 12px 14px;
}

.scroll::-webkit-scrollbar {
  display: none;
}

.msg-subj {
  display: block;
  font-size: 12px;
  line-height: 1.25;
}

.from {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 8px 0 10px;
}

.from p {
  margin: 0;
  display: grid;
}

.from b {
  font-size: 9.5px;
}

.from small {
  font-size: 7.5px;
  color: #9aa1ad;
}

.card {
  overflow: hidden;
  border: 1px solid #ececf3;
  border-radius: 10px;
  background: #fafafd;
}

.band {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: linear-gradient(135deg, var(--color-brand, #6452E7), color-mix(in srgb, var(--color-brand, #6452E7) 65%, #000));
  color: #fff;
}

.tile.light {
  border-radius: 7px;
  background: #fff;
  color: var(--color-brand, #6452E7);
}

.band p {
  margin: 0;
  display: grid;
}

.band small {
  font-size: 6.5px;
  font-weight: 800;
  letter-spacing: .06em;
  opacity: .85;
}

.band b {
  font-size: 10px;
}

.inner {
  display: grid;
  gap: 8px;
  padding: 10px;
  background: #fff;
}

.hi {
  font-size: 11.5px;
}

.inner > p {
  margin: -2px 0 0;
  font-size: 8.5px;
  line-height: 1.45;
  color: #4b5160;
}

.ticket {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 1px dashed #d7dae3;
  border-radius: 9px;
}

.qr {
  flex: none;
  width: 58px;
  height: 58px;
  fill: #1a1a2e;
}

.t-txt {
  display: grid;
  gap: 1px;
}

.t-txt b {
  font-size: 10.5px;
}

.t-txt small {
  font-size: 7.5px;
  color: #6b7280;
}

.t-tag {
  justify-self: start;
  margin-top: 3px;
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-brand, #6452E7) 12%, #fff);
  color: var(--color-brand, #6452E7);
  font-size: 7px;
  font-weight: 700;
}

.dl {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: var(--color-brand, #6452E7);
  font: inherit;
  font-size: 9.5px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  transition: background .3s ease;
}

.dl.done {
  background: #16a34a;
}

.dl .ico {
  width: 11px;
  height: 11px;
}

.info {
  display: grid;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px solid #f0f1f5;
}

.info > span {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 8px;
  color: #3a3d52;
}

.info .ico {
  flex: none;
  width: 10px;
  height: 10px;
  color: #6b7280;
}

.get {
  font-size: 9px;
}

.stores {
  display: flex;
  gap: 6px;
  margin-top: -3px;
}

.stores > span {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 9px;
  border-radius: 7px;
  background: #111;
  color: #fff;
  font-size: 7.5px;
  font-weight: 700;
}

.stores .ico {
  width: 9px;
  height: 9px;
}

.foot {
  display: block;
  padding: 7px;
  font-size: 7px;
  color: #9aa1ad;
  text-align: center;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform .4s cubic-bezier(.22, .8, .24, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

@media (prefers-reduced-motion: reduce) {
  .slide-enter-active, .slide-leave-active { transition: none; }
}
</style>
