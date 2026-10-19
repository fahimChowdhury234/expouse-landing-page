<script setup lang="ts">
/**
 * The attendee's screen for the One platform section: the web app's Reception
 * page (eventos-event pages/reception.vue, the main column and the rail),
 * scrolled a little so the event banner gives way to the live sessions. The
 * header stays put and the rail is sticky, as they are in the app: their
 * meetings (one live now) and the leaderboard.
 *
 * The attendee is the badge designer's sample visitor; everyone here is fictional.
 */
import { SAMPLE_EVENTS } from '~/utils/events'

const event = SAMPLE_EVENTS[0]!

const LIVE = [
  { time: '10:30 AM - 11:15 AM', title: 'Building with low-carbon concrete in the Gulf', place: 'Main Stage', tone: 0, progress: 46 },
  { time: '10:45 AM - 11:30 AM', title: 'Smart homes on a budget', place: 'Hall B', tone: 1, progress: 28 },
  { time: '11:00 AM - 11:45 AM', title: 'Designing for desert light', place: 'Design Theatre', tone: 2, progress: 9 },
]

const BOARD = [
  { rank: 1, name: 'Sara Ali', initials: 'SA', role: 'Visitor', points: '2,140' },
  { rank: 2, name: 'Omar Saleh', initials: 'OS', role: 'Buyer', points: '1,880' },
  { rank: 3, name: 'Mariam Al Balushi', initials: 'MA', role: 'Visitor', points: '1,250', me: true },
]
</script>

<template>
  <div class="app">
    <AudienceEventHeader active="Reception" initials="MA" />

    <div class="cols">
      <div class="main">
        <div class="hero">
          <i class="orb a" /><i class="orb b" />
          <small>{{ event.kicker }}</small>
          <b>{{ event.headline }}</b>
          <span>{{ event.place }}</span>
        </div>

        <section class="featured">
          <h2>Live Sessions ({{ LIVE.length }})</h2>
          <div class="grid">
            <article v-for="s in LIVE" :key="s.title" class="scard">
              <div class="top">
                <span class="time"><i class="dot" />{{ s.time }}</span>
                <Icon name="lucide:bookmark" class="act" />
                <Icon name="lucide:calendar-plus" class="act" />
                <span class="joinbtn">Join</span>
              </div>
              <div class="banner" :class="`tone-${s.tone}`"><Icon name="lucide:presentation" class="ico" /></div>
              <h3>{{ s.title }}</h3>
              <span class="place"><Icon name="lucide:map-pin" class="ico" />{{ s.place }}</span>
              <div class="progress"><i :style="{ width: `${s.progress}%` }" /></div>
            </article>
          </div>
        </section>
      </div>

      <aside class="rail">
        <div class="mw">
          <header class="mw-head">
            <h2>Meetings</h2>
            <span class="viewall">View all<Icon name="lucide:chevron-right" class="ico" /></span>
          </header>
          <div class="counters">
            <div class="counter">
              <span class="ic today"><Icon name="lucide:calendar" class="ico" /></span>
              <div><strong>2</strong><small>Today</small></div>
            </div>
            <div class="counter">
              <span class="ic up"><Icon name="lucide:calendar-check" class="ico" /></span>
              <div><strong>5</strong><small>Upcoming</small></div>
            </div>
          </div>
          <div class="current">
            <span class="cav">OS</span>
            <div class="cmeta"><strong>Omar Saleh</strong><small>Meeting is live now</small></div>
            <span class="join">Join</span>
          </div>
        </div>

        <section class="lb">
          <h2>Leaderboard</h2>
          <div class="lb-list">
            <div v-for="e in BOARD" :key="e.rank" class="lb-item" :class="{ winner: e.rank === 1 }">
              <div class="lb-left">
                <span class="lb-img">{{ e.initials }}</span>
                <div class="lb-info">
                  <h6>{{ e.name }}<span v-if="e.me" class="you">You</span></h6>
                  <span>{{ e.role }}</span>
                </div>
              </div>
              <div class="lb-pt"><h5>{{ e.rank }}</h5><span>{{ e.points }}pt</span></div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* Sizes and colours from reception.vue and its cards, with the event's brand as --brand-primary. */
.app { --brand-primary: var(--color-brand, #6452E7 ); width: 100%; height: 100%; overflow: hidden; background: #f7f7fb; color: #212529; font-size: 14px; line-height: 1.5; }
.ico { flex: none; }

.cols { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 18px; align-items: start; padding: 30px 18px 0; }
/* Scrolled down a little: the banner runs up under the (sticky) header. */
.main { display: flex; flex-direction: column; gap: 18px; min-width: 0; margin-top: -236px; }
.rail { display: flex; flex-direction: column; gap: 18px; min-width: 0; }

/* ---------- Event banner (the organizer's artwork) ---------- */
.hero {
  position: relative; height: 350px; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; gap: 6px; padding: 0 40px 30px;
  color: #fff; border-radius: 8px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 70%, #fff), var(--brand-primary) 55%, color-mix(in srgb, var(--brand-primary) 60%, #000));
}
.hero small { position: relative; font-size: 13px; font-weight: 800; letter-spacing: .08em; opacity: .85; }
.hero b { position: relative; max-width: 520px; font-size: 38px; font-weight: 800; line-height: 1.1; letter-spacing: -.02em; }
.hero span { position: relative; font-size: 14px; opacity: .85; }
.orb { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, .14); }
.orb.a { right: -60px; top: -80px; width: 340px; height: 340px; }
.orb.b { right: 180px; bottom: -120px; width: 240px; height: 240px; background: rgba(255, 255, 255, .08); }

/* ---------- Live sessions ---------- */
.featured { display: flex; flex-direction: column; gap: 20px; }
.featured h2 { margin: 0; font-size: 18px; font-weight: 700; line-height: 1.4; color: #4d5154; }
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.scard { position: relative; display: flex; flex-direction: column; min-width: 0; padding: 16px 16px 30px; overflow: hidden; background: #fff; border: 1px solid #e8e8ee; border-radius: 12px; }
.top { display: flex; align-items: center; gap: 8px; }
.time { flex: 1; min-width: 0; display: inline-flex; align-items: center; gap: 6px; overflow: hidden; font-size: 14px; font-weight: 700; color: var(--brand-primary); text-overflow: ellipsis; white-space: nowrap; }
.dot { width: 8px; height: 8px; flex: none; background: var(--brand-primary); border-radius: 50%; }
.act { width: 19px; height: 19px; color: var(--brand-primary); }
.joinbtn { padding: 5px 14px; font-size: 12.5px; font-weight: 700; color: #fff; background: var(--brand-primary); border-radius: 6px; }
.banner { height: 128px; margin-top: 12px; display: grid; place-items: center; color: rgba(255, 255, 255, .85); border-radius: 8px; }
.banner .ico { width: 34px; height: 34px; }
.tone-0 { background: linear-gradient(135deg, #8b7cf6, #3b2fb0); }
.tone-1 { background: linear-gradient(135deg, #2dd4bf, #0f766e); }
.tone-2 { background: linear-gradient(135deg, #fbbf24, #c2410c); }
.scard h3 { margin: 12px 0 0; font-size: 16px; font-weight: 700; line-height: 1.35; color: #212529; }
.place { display: flex; align-items: center; gap: 6px; margin-top: 8px; font-size: 13px; color: #64676a; }
.place .ico { width: 15px; height: 15px; color: var(--brand-primary); }
.progress { position: absolute; left: 0; right: 0; bottom: 0; height: 5px; background: #eef0f4; }
.progress i { display: block; height: 100%; background: var(--brand-primary); }

/* ---------- Rail: meetings ---------- */
.mw { padding: 16px 16px 20px; background: #fff; border-radius: 16px; box-shadow: 0 1px 2px rgba(15, 23, 42, .05); }
.mw-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.mw-head h2 { margin: 0; font-size: 13px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: #334155; }
.viewall { display: inline-flex; align-items: center; gap: 2px; font-size: 12px; font-weight: 600; color: var(--brand-primary); }
.viewall .ico { width: 13px; height: 13px; }
.counters { display: flex; gap: 10px; }
.counter { flex: 1; display: flex; align-items: center; gap: 10px; }
.ic { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; }
.ic .ico { width: 20px; height: 20px; }
.ic.today { color: #f59e0b; background: #fff3e0; }
.ic.up { color: #10b981; background: #e6f9f0; }
.counter strong { display: block; font-size: 20.8px; font-weight: 800; line-height: 1; color: #1e293b; }
.counter small { font-size: 12.5px; color: #94a3b8; }
.current { display: flex; align-items: center; gap: 10px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #eef0f3; }
.cav { width: 38px; height: 38px; flex: none; display: grid; place-items: center; font-size: 13px; font-weight: 700; color: var(--color-brand-dark, #4f46e5); background: #eef2ff; border-radius: 50%; }
.cmeta { flex: 1; min-width: 0; }
.cmeta strong { display: block; font-size: 13.8px; font-weight: 700; color: #1e293b; }
.cmeta small { font-size: 11.8px; font-weight: 600; color: #16a34a; }
.join { padding: 8px 14px; font-size: 13px; font-weight: 700; color: #fff; background: var(--brand-primary); border-radius: 9px; }

/* ---------- Rail: leaderboard ---------- */
.lb { display: flex; flex-direction: column; gap: 16px; padding: 20px; background: var(--brand-primary); border-radius: 10px; }
.lb h2 { margin: 0; font-size: 16px; font-weight: 700; color: #fff; }
.lb-list { display: flex; flex-direction: column; gap: 8px; }
.lb-item { display: flex; align-items: flex-end; justify-content: space-between; padding: 5px 10px; background: #ececec; border-radius: 5px; box-shadow: 0 0 10px 0 rgba(0, 0, 0, .25); }
.lb-item.winner { background: #fff; border: .25px solid #666a73; }
.lb-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.lb-img { width: 44px; height: 44px; flex: none; display: grid; place-items: center; font-size: 13px; font-weight: 700; color: var(--color-brand-dark, #4f46e5); background: #eef2ff; border: 3px solid rgba(148, 144, 144, .3); border-radius: 50%; }
.winner .lb-img { border-color: var(--brand-primary); }
.lb-info { min-width: 0; }
.lb-info h6 { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 12px; font-weight: 600; line-height: 18px; color: var(--brand-primary); white-space: nowrap; }
.lb-info span { display: block; font-size: 10px; font-weight: 500; line-height: 11px; color: #666a73; text-transform: uppercase; }
.you { padding: 2px 8px; font-size: 9px; font-weight: 700; letter-spacing: .5px; line-height: 1; color: #fff; text-transform: uppercase; background: var(--brand-primary); border-radius: 999px; }
.lb-pt { text-align: center; }
.lb-pt h5 { margin: 0; font-size: 26px; font-weight: 700; line-height: 22px; color: var(--brand-primary); }
.lb-pt span { font-size: 13px; line-height: 18px; color: var(--brand-primary); }

/* Phones: the app's single column, from the top of the page. */
@media (max-width: 640px) {
  .cols { grid-template-columns: minmax(0, 1fr); padding: 16px 16px 0; }
  .main { margin-top: 0; }
  .rail { display: none; }
  .hero { height: 300px; padding: 0 24px 28px; }
  .hero b { font-size: 30px; }
  .grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
