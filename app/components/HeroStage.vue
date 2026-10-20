<script setup lang="ts">
/**
 * 02 · Hero stage.
 *
 * The admin's event Overview page in a browser window, right under the hero
 * (expouse-landing/index.html, `.stage`). The screen is drawn at its design
 * size (1180 × 700) and scaled to the window, so it stays true at every width;
 * on phones it reflows into a narrow version of the same page instead. The
 * window starts tilted back and settles flat over the first 520px of scroll.
 * Two floating cards (a new lead, today's registrations) sit around it on
 * wide screens. With reduced motion the window is shown flat and nothing moves.
 */
const SCREEN_W = 1180
/** Scroll distance over which the window settles flat. */
const SETTLE = 520

/** The sidebar is drawn collapsed (icons only), so the full menu isn't on show. */
const NAV = [
  { icon: 'lucide:house', label: 'Overview', on: true },
  { icon: 'lucide:file-text', label: 'Event Details' },
  { icon: 'lucide:settings', label: 'Event Settings' },
  { icon: 'lucide:store', label: 'Showcase Area' },
  { icon: 'lucide:layout-grid', label: 'Engagements' },
  { icon: 'lucide:map-pin', label: 'Onsite' },
  { icon: 'lucide:mail', label: 'Mail & Notification' },
  { icon: 'lucide:megaphone', label: 'ADs-Management' },
  { icon: 'lucide:users', label: 'Users' },
  { icon: 'lucide:scan-line', label: 'ExpoLens' },
  { icon: 'lucide:book-open', label: 'Website' },
  { icon: 'lucide:map', label: 'Floor Plan' },
  { icon: 'lucide:chart-pie', label: 'Analytics' },
  { icon: 'lucide:smartphone', label: 'Mobile App' },
]
const SETUP = [
  'Event Basic Information',
  'Branding & Theme Setup',
  'Exhibitors & Booth Details',
  'Badge & QR Setup',
  'Team Member Access Setup',
  'Email Template Configuration',
  'Review & Publish Event',
]
const QUICK = [
  { icon: 'lucide:users', title: 'Users', text: 'Invite attendees, exhibitors and staff' },
  { icon: 'lucide:calendar', title: 'Sessions', text: 'Build the agenda and speakers' },
  { icon: 'lucide:message-square', title: 'Meetings', text: 'Let attendees book 1:1 meetings' },
  { icon: 'lucide:store', title: 'Booths', text: 'Add exhibitors and booth details' },
  { icon: 'lucide:video', title: 'Lounge', text: 'Open a networking lounge' },
  { icon: 'lucide:trophy', title: 'Leaderboard', text: 'Reward attendees for taking part' },
]
/** Registrations per day for the sparkline, as % of the best day. */
const SPARK = [30, 36, 34, 42, 48, 45, 52, 58, 55, 64, 72, 70, 82, 100]

const windowEl = ref<HTMLElement | null>(null)
const fitEl = ref<HTMLElement | null>(null)
const scale = ref(1)
let resizeObserver: ResizeObserver | null = null
let ticking = false

function fit() {
  const cw = fitEl.value?.clientWidth
  if (cw) scale.value = Math.min(1, cw / SCREEN_W)
}

function tilt() {
  ticking = false
  const p = Math.min(1, window.scrollY / SETTLE)
  if (windowEl.value) windowEl.value.style.transform = `rotateX(${(1 - p) * 14}deg) scale(${0.94 + 0.06 * p}) translateY(${(1 - p) * -10}px)`
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(tilt)
}

onMounted(() => {
  fit()
  if ('ResizeObserver' in window && fitEl.value) {
    resizeObserver = new ResizeObserver(fit)
    resizeObserver.observe(fitEl.value)
  }
  else {
    window.addEventListener('resize', fit)
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  tilt()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', fit)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <section class="hs" aria-label="Product preview">
    <div class="hs-rail">
      <div class="stage">
        <div class="float f2" aria-hidden="true">
          <span class="dot"><Icon name="lucide:funnel" class="ico" /></span>
          <div>
            <b>New lead · Omar Saleh</b>
            <small>Booth B-214 · <span class="tag t-hot">HOT 92</span></small>
          </div>
        </div>
        <div class="float f3" aria-hidden="true">
          <div class="f3-h"><small>Registrations</small><small class="up">+642 today</small></div>
          <b class="f3-n">18,204</b>
          <div class="spark">
            <i v-for="(v, i) in SPARK" :key="i" :style="{ height: `${v}%`, '--i': i }" />
          </div>
        </div>

        <div
          ref="windowEl"
          class="window"
          role="img"
          aria-label="The EXPOUSE event admin Overview page with sample data: navigation, setup checklist completed, scanner credentials and quick actions"
        >
          <div class="chrome">
            <i /><i /><i />
            <span class="url"><Icon name="lucide:lock" class="ico" />expouse.com</span>
          </div>

          <div ref="fitEl" class="fit" :style="{ '--s': scale }">
            <div class="screen shell">
              <aside class="sb">
                <div class="sb-head"><span class="sb-mark"><AppLogo class="sb-logo" /></span></div>
                <div class="sb-back"><Icon name="lucide:arrow-left" class="ico" /></div>
                <div class="sb-nav">
                  <span v-for="n in NAV" :key="n.label" :class="{ on: n.on }"><Icon :name="n.icon" class="ico" /></span>
                </div>
              </aside>

              <div class="main">
                <div class="tb">
                  <span class="cover">E</span>
                  <div class="tb-name"><b>Event name</b><small>Mon, Oct 5, 2026</small></div>
                  <div class="tb-r">
                    <span class="goto">Go to Event</span>
                    <span class="pubd">Published</span>
                    <span class="me"><span class="av">SA</span>Sara Ahmed</span>
                  </div>
                </div>

                <div class="content">
                  <div class="hey">
                    <b>Hey Sara!</b>
                    <small>Welcome Event name, Let's Power Your Event.</small>
                  </div>

                  <div class="ov-cols">
                    <div class="card">
                      <div class="card-h">
                        <b>Setup your event</b>
                        <span class="prog"><small>7/7 completed</small><span class="pbar"><i /></span></span>
                      </div>
                      <div class="chk">
                        <div v-for="s in SETUP" :key="s">
                          <Icon name="lucide:circle-check" class="ico" />{{ s }}<Icon name="lucide:arrow-right" class="ico chev" />
                        </div>
                      </div>
                    </div>

                    <div class="card cred">
                      <div class="card-h flush"><b>Credentials</b><small>Scanner app</small></div>
                      <div><span class="lbl">User Name</span><div class="fld">********<Icon name="lucide:copy" class="ico" /></div></div>
                      <div><span class="lbl">Access Code</span><div class="fld">********<Icon name="lucide:copy" class="ico" /></div></div>
                      <div class="tgl">Test mode<i /></div>
                      <div class="card-h split"><b>Setup your mobile access</b><span class="soft-b">Open</span></div>
                    </div>
                  </div>

                  <div class="qa">
                    <div v-for="q in QUICK" :key="q.title">
                      <span class="t"><Icon :name="q.icon" class="ico" /></span>
                      <b>{{ q.title }}</b>
                      <small>{{ q.text }}</small>
                      <span class="add">Add</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tokens: the app's theme where it has one (main.css), otherwise the values from the design. */
.hs {
  --hs-brand: var(--color-brand, #6452E7 );
  --hs-brand-dark: var(--color-brand-dark, #4f46e5);
  --hs-brand-soft: var(--color-brand-soft, #eef2ff);
  --hs-brand-100: #e0e7ff;
  --hs-brand-200: #c7d2fe;
  --hs-ink: var(--color-ink, #1f2430);
  --hs-muted: var(--color-muted, #6b7280);
  --hs-faint: var(--color-faint, #9aa1ad);
  --hs-line: var(--color-line, #e8e9ee);
  --hs-line-2: #f0f1f5;
  --hs-bg: var(--color-page, #f7f8fa);
  --hs-sunk: #f5f6f8;
  --hs-sunk-2: #f8f9fb;
  --hs-nav-ink: #64676a;
  --hs-ok: #15803d;
  --hs-check: #4cbb3e;
  --hs-hot: #b91c1c;
  --hs-hot-soft: #fee2e2;
  --hs-shadow: 0 1px 2px rgba(20, 23, 40, .04), 0 12px 32px -14px rgba(20, 23, 40, .16);
  --hs-shadow-lg: 0 2px 6px rgba(20, 23, 40, .04), 0 40px 80px -32px rgba(49, 40, 140, .32);
  --hs-ease: cubic-bezier(.22, .8, .24, 1);
  position: relative;
  /* The fade below reaches past the stage's sides; never let it widen the page. */
  overflow-x: clip;
  padding-bottom: clamp(40px, 6vw, 72px);
  color: var(--hs-ink);
  line-height: 1.6;
}

.hs-rail { max-width: 1240px; margin-inline: auto; }

/* ---------- Stage: glow behind, fade to the page at the bottom ---------- */
/* Clipped at the bottom edge only (the reference's hero does this with overflow: hidden), so the
   window's ring and shadow end under the fade instead of showing below it; glow and cards still overflow. */
.stage { position: relative; padding: 0 clamp(12px, 3vw, 40px); perspective: 1800px; clip-path: inset(-200px -200px 0 -200px); }
.stage::before {
  content: ""; position: absolute; left: 12%; right: 12%; top: -30px; height: 340px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(139, 124, 246, .38), rgba(99, 102, 241, .12) 60%, transparent);
  filter: blur(30px); pointer-events: none;
}
/* As wide as the clip, so the window's shadow fades out across its full spread, not just the stage's width. */
.stage::after {
  content: ""; position: absolute; left: -200px; right: -200px; bottom: 0; height: 120px; z-index: 4;
  background: linear-gradient(transparent, var(--hs-bg)); pointer-events: none;
}

.window {
  position: relative; overflow: hidden; transform-origin: 50% 0;
  transform: rotateX(14deg) scale(.94) translateY(-10px);
  background: #fff; border: 1px solid var(--hs-line); border-bottom: 0; border-radius: 16px 16px 0 0;
  box-shadow: 0 0 0 7px rgba(255, 255, 255, .55), 0 0 0 8px rgba(99, 102, 241, .10), var(--hs-shadow-lg);
}

.chrome { display: flex; align-items: center; gap: 7px; height: 40px; padding: 0 14px; border-bottom: 1px solid var(--hs-line); background: #fbfbfd; }
.chrome i { width: 11px; height: 11px; border-radius: 50%; }
.chrome i:nth-child(1) { background: #ff6159; }
.chrome i:nth-child(2) { background: #ffbd2e; }
.chrome i:nth-child(3) { background: #28c941; }
.chrome .url {
  margin-left: 14px; display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 7px;
  font-size: 12px; color: var(--hs-faint); background: var(--hs-sunk); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.chrome .url .ico { width: 12px; height: 12px; flex: none; }

/* The screen is drawn at its design size and scaled to fit (--s is set from the script). */
.fit { position: relative; overflow: hidden; height: calc(700px * var(--s, 1)); }
.fit > .screen { position: absolute; left: 0; top: 0; transform-origin: 0 0; transform: scale(var(--s, 1)); }

/* ---------- Admin shell ---------- */
.ico { flex: none; }
.shell { display: grid; grid-template-columns: 68px 1fr; width: 1180px; height: 700px; background: #f5f6f8; font-size: 14px; }

.sb { display: flex; flex-direction: column; min-height: 0; background: #fff; border-right: 1px solid #e8e8ef; }
.sb-head { height: 60px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #f0f0f4; }
/* Only the logo's mark (the left 27 of its 132 units) shows in the collapsed rail. */
.sb-mark { width: 20px; overflow: hidden; }
.sb-logo { display: block; height: 22px; width: auto; }
.sb-back { display: flex; justify-content: center; padding: 12px 0 10px; color: var(--hs-nav-ink); }
.sb-back .ico { width: 16px; height: 16px; }
.sb-nav {
  display: grid; gap: 1px; padding: 2px 10px; overflow: hidden;
  mask-image: linear-gradient(#000 85%, transparent); -webkit-mask-image: linear-gradient(#000 85%, transparent);
}
.sb-nav span { height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 9px; color: var(--hs-nav-ink); }
.sb-nav .ico { width: 20px; height: 20px; color: var(--hs-nav-ink); }
.sb-nav span.on { background: #f7f7fb; color: var(--hs-brand); }
.sb-nav span.on .ico { color: var(--hs-brand); }

.main { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.tb { height: 62px; display: flex; align-items: center; gap: 12px; padding: 0 22px; background: #fff; border-bottom: 1px solid #ececf1; }
.cover { width: 40px; height: 40px; border-radius: 9px; display: grid; place-items: center; flex: none; background: linear-gradient(135deg, #8b7cf6, #3b2fb0); color: #fff; font-weight: 800; font-size: 15px; }
.tb-name b { display: block; font-size: 15px; line-height: 1.2; }
.tb-name small { font-size: 11px; color: #9aa0ab; }
.tb-r { margin-left: auto; display: flex; align-items: center; gap: 12px; }
.goto { font-size: 12.5px; font-weight: 700; color: var(--hs-brand); background: #fff; border: 1px solid var(--hs-brand-200); border-radius: 8px; padding: 7px 12px; }
.pubd { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: var(--hs-ok); }
.pubd::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
.me { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; }
.av { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; flex: none; background: var(--hs-brand-soft); color: var(--hs-brand-dark); font-size: 12px; font-weight: 800; }

.content { display: grid; gap: 18px; align-content: start; padding: 22px 26px; overflow: hidden; }
.hey b { display: block; font-size: 25px; font-weight: 800; letter-spacing: -.02em; line-height: 1.12; }
.hey small { font-size: 13.5px; color: var(--hs-muted); }
.ov-cols { display: grid; grid-template-columns: 1.25fr 1fr; gap: 16px; }

.card { background: #fff; border: 1px solid var(--hs-line); border-radius: 12px; padding: 18px; }
.card-h { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.card-h b { font-size: 15px; }
.card-h small { font-size: 12px; font-weight: 600; color: var(--hs-muted); }
.card-h.flush { margin: 0; }
.card-h.split { margin: 8px 0 0; padding-top: 14px; border-top: 1px solid var(--hs-line-2); }
.prog { display: flex; align-items: center; gap: 10px; }
.pbar { width: 144px; height: 6px; border-radius: 3px; background: #eef0f4; overflow: hidden; }
.pbar i { display: block; height: 100%; width: 100%; border-radius: 3px; background: var(--hs-check); transform-origin: 0 50%; animation: hs-grow-x 1.1s var(--hs-ease) .35s both; }

.chk { display: grid; gap: 6px; }
.chk div { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 9px; background: var(--hs-sunk-2); font-size: 13px; font-weight: 600; }
.chk .ico { width: 20px; height: 20px; color: var(--hs-check); }
.chk .ico.chev { width: 14px; height: 14px; margin-left: auto; color: var(--hs-faint); }

.cred { display: grid; gap: 10px; }
.cred .lbl { display: block; margin-bottom: 5px; font-size: 12px; font-weight: 700; color: var(--hs-muted); }
.cred .fld { display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; border-radius: 9px; background: var(--hs-sunk-2); font-size: 13.5px; font-weight: 700; letter-spacing: .02em; }
.cred .fld .ico { width: 15px; height: 15px; color: var(--hs-faint); }
.tgl { display: flex; align-items: center; justify-content: space-between; padding-top: 4px; font-size: 13px; font-weight: 600; }
.tgl i { position: relative; width: 34px; height: 20px; border-radius: 999px; background: var(--hs-brand); }
.tgl i::after { content: ""; position: absolute; right: 3px; top: 3px; width: 14px; height: 14px; border-radius: 50%; background: #fff; }
.soft-b { font-size: 12.5px; font-weight: 700; color: var(--hs-brand); background: var(--hs-brand-soft); border-radius: 8px; padding: 7px 12px; }

.qa { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.qa > div { display: grid; grid-template-columns: 40px 1fr; gap: 4px 12px; align-items: start; padding: 14px; background: #fff; border: 1px solid var(--hs-line); border-radius: 12px; }
.qa .t { grid-row: 1 / 3; width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center; background: #f3f4f7; color: #4b5160; }
.qa .t .ico { width: 19px; height: 19px; }
.qa b { font-size: 13.5px; }
.qa small { font-size: 12px; line-height: 1.35; color: var(--hs-muted); }
.qa .add { grid-column: 2; justify-self: end; margin-top: 4px; padding: 4px 12px; border-radius: 7px; font-size: 12px; font-weight: 700; color: var(--hs-brand); background: var(--hs-brand-soft); }

/* ---------- Floating cards around the window ---------- */
.float {
  position: absolute; z-index: 3; display: flex; align-items: center; gap: 11px; padding: 12px 14px;
  background: rgba(255, 255, 255, .92); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--hs-line); border-radius: 14px; box-shadow: var(--hs-shadow);
  font-size: 13px; line-height: 1.3; animation: hs-bob 6s ease-in-out infinite;
}
.float b { display: block; font-size: 13.5px; }
.float small { font-size: 11.5px; color: var(--hs-faint); }
.float .dot { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; flex: none; background: var(--hs-hot-soft); color: var(--hs-hot); }
.float .dot .ico { width: 17px; height: 17px; }
.tag { display: inline-flex; align-items: center; padding: 1px 7px; border-radius: 999px; font-size: 10.5px; font-weight: 700; white-space: nowrap; }
.t-hot { background: var(--hs-hot-soft); color: var(--hs-hot); }

.f2 { right: -14px; top: 230px; animation-delay: -2s; }
.f3 { right: 60px; bottom: 40px; width: 220px; flex-direction: column; align-items: stretch; gap: 8px; animation-delay: -4s; }
.f3-h { display: flex; justify-content: space-between; align-items: baseline; }
.f3-h small { font-weight: 700; color: var(--hs-muted); }
.f3-h small.up { font-weight: 800; color: var(--hs-ok); }
.f3 .f3-n { font-size: 22px; letter-spacing: -.02em; }
.spark { display: flex; align-items: flex-end; gap: 3px; height: 40px; }
.spark i {
  flex: 1; border-radius: 2px 2px 0 0; background: var(--hs-brand-100); transform-origin: 50% 100%;
  animation: hs-grow-y 1s var(--hs-ease) both; animation-delay: calc(.35s + var(--i, 0) * 35ms);
}
.spark i:last-child { background: var(--hs-brand); }

@keyframes hs-bob { 50% { transform: translateY(-8px); } }
@keyframes hs-grow-y { from { transform: scaleY(0); } }
@keyframes hs-grow-x { from { transform: scaleX(0); } }

@media (max-width: 1040px) {
  .f2, .f3 { display: none; }
}

/* Phones: the same page, reflowed to the width instead of scaled down to a thumbnail. */
@media (max-width: 700px) {
  .fit { height: auto; }
  .fit > .screen { position: static; transform: none; }
  .shell { grid-template-columns: 1fr; width: auto; height: auto; }
  .sb, .goto, .me, .card.cred, .qa small, .qa > div:nth-child(n+5) { display: none; }
  .tb { height: 58px; padding: 0 14px; }
  .tb-name b { font-size: 14px; }
  .content { gap: 14px; padding: 16px 14px 40px; }
  .hey b { font-size: 22px; }
  .ov-cols { grid-template-columns: 1fr; }
  .card-h { flex-wrap: wrap; }
  .pbar { width: 90px; }
  .qa { grid-template-columns: 1fr 1fr; gap: 10px; }
  .qa > div { grid-template-columns: 34px 1fr; padding: 12px; }
  .qa .t { grid-row: 1; width: 34px; height: 34px; }
  .qa .add { grid-column: 1 / -1; }
}

@media (prefers-reduced-motion: reduce) {
  .window { transform: none; }
  .float, .spark i, .pbar i { animation: none; }
}
</style>
