<script setup lang="ts">
/**
 * The speaker's screen for the One platform section: a live session in the
 * attendee web app as its host sees it (eventos-event pages/session/[id].vue).
 * The stage with the host's controls (Mute, Stop video, Leave stage), then the
 * engagement panel on Q&A, where a host can approve a waiting question, sees
 * the pinned and answered ones, and replies as the speaker.
 *
 * The speaker is the badge designer's sample speaker; everyone here is fictional.
 */
const QUESTIONS = [
  { votes: 0, text: 'Do the new blocks hold up in coastal humidity?', who: 'Faisal Karim', flag: 'warn', pending: true },
  { votes: 24, text: 'What does certification cost for a small contractor?', who: 'Dana Yousef', flag: 'pinned', voted: true },
  {
    votes: 18,
    text: 'Which suppliers in Oman stock them today?',
    who: 'Lina Mansour',
    flag: 'answered',
    reply: 'Three in Muscat already - I\'ll share the list after the talk.',
  },
  { votes: 9, text: 'Will the slides be shared after the session?', who: 'Tariq Hamdan' },
]
const FLAG: Record<string, { label: string, cls: string }> = {
  warn: { label: 'Awaiting host', cls: 'warn' },
  pinned: { label: 'Pinned', cls: 'brand' },
  answered: { label: 'Answered', cls: 'ok' },
}
</script>

<template>
  <div class="app">
    <AudienceEventHeader active="Sessions" initials="HY" />

    <div class="page">
      <span class="back"><Icon name="lucide:chevron-left" class="ico" />All Sessions</span>

      <div class="wrap">
        <main class="main">
          <div class="screen">
            <span class="live"><i />LIVE</span>
            <div class="cam">
              <span class="face">HY</span>
            </div>
            <span class="tag-name">Dr. Hana Yousef</span>
            <div class="stagebar">
              <span class="sbtn">Mute</span>
              <span class="sbtn">Stop video</span>
              <span class="sbtn danger">Leave stage</span>
            </div>
          </div>
          <h3 class="title">Building with low-carbon concrete in the Gulf</h3>
          <div class="tags">
            <span class="tag">Main Stage</span>
            <span class="tag">5 Oct · 10:30 – 11:15 AM</span>
            <span class="tag">Sustainability</span>
          </div>
        </main>

        <aside class="panel">
          <div class="ptabs">
            <span class="ptab">Chat</span>
            <span class="ptab on">Q&amp;A<span class="tbadge">1</span></span>
            <span class="ptab">Polls</span>
            <span class="ptab">Attendees<span class="tcount">842</span></span>
          </div>

          <div class="pinput">
            <span class="input">Ask a question…</span>
            <span class="ask">Ask</span>
          </div>

          <div class="qlist">
            <div v-for="q in QUESTIONS" :key="q.text" class="qrow" :class="{ pending: q.pending, answered: q.flag === 'answered' }">
              <span class="qvote" :class="{ on: q.voted }">
                <Icon name="lucide:arrow-up" class="ico" />{{ q.votes }}
              </span>
              <div class="qbody">
                <span class="qtext">{{ q.text }}</span>
                <span class="qwho">
                  {{ q.who }}<span v-if="q.flag" class="flag" :class="FLAG[q.flag]!.cls">{{ FLAG[q.flag]!.label }}</span>
                </span>
                <div v-if="q.pending" class="mtools">
                  <span class="mbtn ok">Approve</span>
                  <span class="mbtn danger">Reject</span>
                </div>
                <div v-if="q.reply" class="rrow">
                  <span class="rav">HY</span>
                  <span class="rbody">
                    <span class="rwho">Dr. Hana Yousef<span class="flag brand">Speaker</span></span>
                    <span class="rtext">{{ q.reply }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Sizes and colours from the session page, with the event's brand as --brand-primary. */
.app { --brand-primary: var(--color-brand, #6452E7 ); width: 100%; height: 100%; overflow: hidden; background: #f7f7fb; color: #212529; font-size: 14px; line-height: 1.5; }
.ico { flex: none; }

.page { max-width: 1200px; margin: 0 auto; padding: 28px 18px 0; }
.back { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 18px; font-size: 14px; font-weight: 600; color: var(--brand-primary); }
.back .ico { width: 18px; height: 18px; }

.wrap { display: grid; grid-template-columns: minmax(0, 1fr) 370px; gap: 40px; align-items: start; }
.main { min-width: 0; }

/* ---------- Stage: the host on camera, with the host's controls ---------- */
.screen { position: relative; aspect-ratio: 16 / 6; max-height: 300px; overflow: hidden; background: #0b1020; border-radius: 12px; }
.cam { position: absolute; inset: 0; display: grid; place-items: center; background: radial-gradient(60% 90% at 50% 40%, #2a2f55, #0b1020 75%); }
.face { width: 116px; height: 116px; display: grid; place-items: center; font-size: 38px; font-weight: 800; color: #fff; background: linear-gradient(135deg, #fb7185, #be123c); border-radius: 50%; box-shadow: 0 0 0 6px rgba(255, 255, 255, .08); }
.live { position: absolute; z-index: 2; left: 16px; top: 14px; display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 800; letter-spacing: .06em; color: #fff; background: #ef4444; border-radius: 6px; }
.live i { width: 7px; height: 7px; background: #fff; border-radius: 50%; animation: au-pulse 1.6s ease-in-out infinite; }
.tag-name { position: absolute; z-index: 2; left: 16px; bottom: 16px; padding: 4px 10px; font-size: 12px; font-weight: 600; color: #fff; background: rgba(11, 16, 32, .6); border-radius: 6px; }
.stagebar { position: absolute; z-index: 3; left: 50%; bottom: 14px; display: flex; gap: 8px; padding: 7px; background: rgba(11, 16, 32, .78); border-radius: 999px; transform: translateX(-50%); }
.sbtn { padding: 7px 14px; font-size: 12.5px; font-weight: 700; color: #fff; white-space: nowrap; border: 1px solid rgba(255, 255, 255, .22); border-radius: 999px; }
.sbtn.danger { background: #ef4444; border-color: #ef4444; }

.title { margin: 16px 0 0; font-size: 20px; font-weight: 700; line-height: 1.25; color: #212529; }
.tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 12px; }
.tag { padding: 4px 10px; font-size: 11.8px; color: #64748b; background: #fff; border-radius: 6px; }

/* ---------- Engagement panel, on Q&A ---------- */
.panel { display: flex; flex-direction: column; min-width: 0; background: #fff; border-radius: 12px; box-shadow: 0 1px 2px rgba(15, 23, 42, .05); }
.ptabs { display: flex; justify-content: space-between; padding: 3px 6px 0; border-bottom: 2px solid #0000000e; }
.ptab { display: inline-flex; align-items: center; padding: 13px 8px; margin-bottom: -2px; font-size: 12.5px; font-weight: 500; color: #64676a; text-transform: uppercase; border-bottom: 2px solid transparent; }
.ptab.on { font-weight: 700; color: var(--brand-primary); border-bottom-color: var(--brand-primary); }
.tcount { display: inline-grid; place-items: center; min-width: 17px; height: 17px; margin-left: 6px; padding: 0 5px; font-size: 10.5px; font-weight: 600; color: #64748b; background: #eceef4; border-radius: 999px; }
.tbadge { min-width: 15px; margin-left: 4px; padding: 0 4px; font-size: 10px; font-weight: 800; line-height: 15px; text-align: center; color: #fff; background: #ef4444; border-radius: 999px; }

.pinput { display: flex; align-items: center; gap: 14px; padding: 14px; }
.input { flex: 1; min-width: 0; height: 44px; display: flex; align-items: center; padding: 0 16px; font-size: 14px; color: #9aa1ad; border: 1px solid #e3e1f0; border-radius: 10px; }
.ask { height: 42px; display: flex; align-items: center; padding: 0 18px; font-size: 14px; font-weight: 600; color: #fff; background: var(--brand-primary); border-radius: 10px; }

.qlist { display: flex; flex-direction: column; gap: 10px; padding: 0 14px 14px; }
.qrow { display: flex; align-items: flex-start; gap: 10px; }
.qrow.pending { margin: 0 -8px; padding: 8px; background: #fffbeb; border-radius: 10px; }
.qrow.answered .qtext { opacity: .65; }
.qvote { flex: none; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 9px; font-size: 12.5px; font-weight: 800; color: #64748b; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; }
.qvote .ico { width: 15px; height: 15px; }
.qvote.on { color: var(--brand-primary); background: color-mix(in srgb, var(--brand-primary) 8%, #fff); border-color: var(--brand-primary); }
.qbody { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.qtext { font-size: 13.6px; line-height: 1.4; color: #1e293b; }
.qwho { font-size: 11.5px; color: #94a3b8; }
.flag { display: inline-block; margin-left: 5px; padding: 2px 5px; font-size: 9.6px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; color: #475569; background: #e2e8f0; border-radius: 4px; }
.flag.warn { color: #b45309; background: #fef3c7; }
.flag.ok { color: #15803d; background: #dcfce7; }
.flag.brand { color: var(--brand-primary); background: color-mix(in srgb, var(--brand-primary) 12%, #fff); }
.mtools { display: flex; gap: 5px; margin-top: 5px; }
.mbtn { padding: 3px 8px; font-size: 10.9px; font-weight: 700; color: #64748b; background: #fff; border: 1px solid #e2e8f0; border-radius: 7px; }
.mbtn.ok { color: #15803d; border-color: #bbf7d0; }
.mbtn.danger { color: #b91c1c; border-color: #fecaca; }

/* The speaker's answer, under the question. */
.rrow { display: flex; gap: 8px; margin-top: 6px; padding: 8px 10px; background: #f8fafc; border-radius: 10px; }
.rav { width: 24px; height: 24px; flex: none; display: grid; place-items: center; font-size: 9.5px; font-weight: 800; color: #fff; background: linear-gradient(135deg, #fb7185, #be123c); border-radius: 50%; }
.rbody { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.rwho { font-size: 11.5px; font-weight: 600; color: #334155; }
.rtext { font-size: 12.8px; line-height: 1.4; color: #1e293b; }

@keyframes au-pulse { 50% { opacity: .35; } }

@media (max-width: 640px) {
  .page { padding: 16px 16px 0; }
  .wrap { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .title, .tags, .tag-name { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .live i { animation: none; }
}
</style>
