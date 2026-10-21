<script setup lang="ts">
const NAV = ['Dashboard', 'Attendees', 'Sessions', 'Exhibitors', 'Badges', 'Insights']
const BARS = [35, 55, 78, 62, 72, 88, 67, 44, 31, 25, 38]
const PEOPLE = ['Mariam Al Balushi', 'Layla Haddad', 'Omar Saleh', 'Sara Ali', 'Khalid Nasser']
</script>

<template>
  <section id="book-demo" class="dc" aria-labelledby="dc-title">
    <div class="dc-rail">
      <div class="banner">
        <div class="copy">
          <p class="eyebrow">Book a call</p>
          <h2 id="dc-title">See your event<br>running on EXPOUSE<br>in 30 minutes</h2>
          <p class="sub">Tell us what you're planning. We'll walk you through it live, from the registration form to the
            report your exhibitors get afterwards.</p>
          <div class="contact">
            <NuxtLink to="/contact-us" class="cta">Book a call
              <Icon name="lucide:arrow-right" />
            </NuxtLink>
            <span>or email <a href="mailto:hello@expouse.com">hello@expouse.com</a></span>
          </div>
          <ul class="notes">
            <li>
              <Icon name="lucide:clock-3" />30-minute call
            </li>
            <li>
              <Icon name="lucide:calendar-days" />We reply within a working day
            </li>
          </ul>
        </div>

        <div class="product-scene" aria-hidden="true">
          <div class="mini-window">
            <div class="browser-bar"><span /><span /><span /><b>dashboard.expouse.com/leads</b></div>
            <div class="mini-content">
              <aside><strong>EXPOUSE</strong><i v-for="n in 5" :key="n" /></aside>
              <main><b>Booth B-14 · Leads</b>
                <div class="mini-stats"><em>86<small>Leads today</small></em><em class="purple">24<small>Hot
                      leads</small></em><em>12<small>Meetings booked</small></em></div>
                <div class="search">Search leads by name or company</div>
              </main>
            </div>
          </div>

          <div class="dashboard">
            <div class="browser-bar"><span /><span /><span /><b>dashboard.expouse.com</b></div>
            <div class="dashboard-body">
              <aside class="side"><strong>EXPOUSE</strong><span v-for="(item, i) in NAV" :key="item"
                  :class="{ active: i === 0 }"><i />{{ item }}</span></aside>
              <main class="panel">
                <div class="panel-head"><b>Event dashboard</b><small>Search</small></div>
                <div class="metrics">
                  <div class="metric chosen"><small>Registered</small><b>4,812</b></div>
                  <div class="metric"><small>Checked in</small><b>3,206</b></div>
                  <div class="metric"><small>Exhibitors</small><b>148</b></div>
                  <div class="metric"><small>Meetings</small><b>926</b></div>
                </div>
                <div class="data-row">
                  <div class="chart"><b>Check-ins today</b>
                    <div class="bars"><i v-for="(height, i) in BARS" :key="i" :class="{ selected: i === 5 }"
                        :style="{ height: `${height}%` }" /></div>
                  </div>
                  <div class="registrations"><b>Latest registrations</b><span v-for="(person, i) in PEOPLE"
                      :key="person"><i>{{ person[0] }}</i>{{ person }}<small>{{ i === 2 ? 'VIP' : i === 1 ? 'Exhibitor'
                        : 'Visitor' }}</small></span></div>
                </div>
              </main>
            </div>
          </div>

          <div class="toast lead"><i>
              <Icon name="lucide:funnel" />
            </i><span><b>New lead · Omar Saleh</b><small>Booth B-214 · <em>HOT 92</em></small></span></div>
          <div class="toast checked"><i>
              <Icon name="lucide:check" />
            </i><span><b>Checked in</b><small>Gate A · 09:41</small></span></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dc {
  --purple: #6550e8;
  --ink: #212529;
  background: #fff;
}

.dc-rail {
  max-width: 1240px;
  margin-inline: auto;
  padding: clamp(40px, 6vw, 72px) clamp(12px, 3vw, 40px) 0;
}

.banner {
  position: relative;
  min-height: 460px;
  overflow: hidden;
  border: 1px solid #e5e3f4;
  border-radius: 16px;
  background: linear-gradient(135deg, #f7f6ff 0%, #f1effd 100%);
  box-shadow: 0 22px 50px -42px rgba(59, 44, 143, .42);
}

.banner::before {
  content: "";
  position: absolute;
  right: -10%;
  bottom: -42%;
  width: 67%;
  height: 105%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(153, 139, 255, .17), transparent 66%);
  filter: blur(5px);
}

.copy {
  position: relative;
  z-index: 2;
  width: 48%;
  max-width: 510px;
  padding: 56px clamp(24px,4.4vw,56px);
}

.eyebrow {
  margin: 0;
  color: var(--purple);
  font-size: clamp(1rem, 1.25vw, 18px);
  font-weight: 600;
}

h2 {
  margin: 18px 0 0;
  color: var(--ink);
  font-size: clamp(2.2rem, 3.35vw, 42px);
  font-weight: 800;
  line-height: 1.14;
  letter-spacing: -.055em;
}

.sub {
  max-width: 470px;
  margin: 20px 0 0;
  color: #6b6e78;
  font-size: clamp(1rem, 1.12vw, 16px);
  line-height: 1.75;
}

.contact {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
  color: #747681;
  font-size: .98rem;
}

.contact a {
  color: #fff;
  font-weight: 600;
  text-decoration: none;
}
.contact span a {
  color: var(--purple);
  font-size: 15px;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 13px 24px;
  border-radius: 6px;
  color: #fff;
  background: var(--purple);
  font-size: clamp(1rem, 1.15vw, 16px);
  font-weight: 700;
  text-decoration: none;
  /* box-shadow: 0 15px 24px -17px #3622aa; */
  transition: transform .2s, background .2s;
}

.cta:hover {
  background: #553ee0;
  transform: translateY(-2px);
}

.cta :deep(svg) {
  width: 23px;
  height: 23px;
}

.notes {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  margin: 34px 0 0;
  padding: 24px 0 0;
  border-top: 1px solid #dfddec;
  list-style: none;
  color: #777985;
  font-size: .89rem;
}

.notes li {
  display: flex;
  align-items: center;
  gap: 9px;
}

.notes :deep(svg) {
  width: 20px;
  height: 20px;
  color: var(--purple);
}

/* Layered, intentionally illustrative product dashboard. */
.product-scene {
  position: absolute;
  inset: 0 0 0 45%;
  overflow: hidden;
  pointer-events: none;
}

.dashboard,
.mini-window {
  position: absolute;
  overflow: hidden;
  border: 1px solid #e1e1ed;
  border-radius: 13px 13px 0 0;
  background: #fff;
  box-shadow: 0 3px 8px rgba(31, 27, 71, .04), 0 30px 60px -30px rgba(43, 36, 98, .34);
}

.dashboard {
  z-index: 2;
  right: -12%;
  bottom: 0;
  width: 94%;
  height: 62%;
}

.mini-window {
  z-index: 1;
  right: -3%;
  top: 10%;
  width: 79%;
  height: 33%;
  opacity: .99;
}

.browser-bar {
  display: flex;
  align-items: center;
  height: 39px;
  gap: 6px;
  padding: 0 14px;
  border-bottom: 1px solid #ececf3;
  color: #787983;
  background: #fdfdff;
}

.browser-bar span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #e5e5f5;
}

.browser-bar b {
  margin: 0 auto;
  font-size: 11px;
  font-weight: 500;
}

.mini-window .browser-bar b {
  font-size: 10px;
}

.dashboard-body,
.mini-content {
  display: flex;
  height: calc(100% - 39px);
}

.side,
.mini-content aside {
  display: flex;
  flex-direction: column;
  flex: 0 0 17%;
  padding: 12px 10px;
  border-right: 1px solid #ececf3;
  background: #fbfbfe;
  gap: 6px;
}

.side strong,
.mini-content aside strong {
  padding: 5px;
  border-radius: 4px;
  color: #fff;
  background: var(--purple);
  font-size: 8px;
  text-align: center;
}

.side span {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 5px;
  border-radius: 5px;
  color: #83848d;
  font-size: 8px;
}

.side span.active {
  color: #3d3e47;
  background: #fff;
  font-weight: 700;
  box-shadow: 0 0 0 1px #ecebf5;
}

.side i,
.mini-content aside i {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 3px;
  background: #dcd9fa;
}

.side .active i {
  background: var(--purple);
}

.mini-content aside {
  gap: 11px;
}

.mini-content main {
  flex: 1;
  padding: 11px;
}

.mini-content main>b {
  color: #4b4c55;
  font-size: 9px;
}

.mini-stats {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.mini-stats em {
  display: grid;
  flex: 1;
  padding: 7px;
  border: 1px solid #e9e8f2;
  border-radius: 6px;
  color: #272832;
  font-size: 15px;
  font-style: normal;
  font-weight: 800;
}

.mini-stats small {
  order: -1;
  font-size: 6px;
  font-weight: 600;
}

.mini-stats .purple {
  color: #fff;
  background: var(--purple);
}

.search {
  margin-top: 8px;
  padding: 8px;
  color: #9a9aa5;
  background: #f6f5fb;
  font-size: 7px;
}

.panel {
  flex: 1;
  padding: 15px 16px;
  min-width: 0;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #454650;
  font-size: 12px;
}

.panel-head small {
  padding: 5px 12px;
  border: 1px solid #e5e5ef;
  border-radius: 6px;
  color: #8b8b96;
  font-size: 8px;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 9px;
  margin-top: 18px;
}

.metric {
  display: grid;
  gap: 4px;
  min-height: 59px;
  padding: 10px;
  border: 1px solid #e8e7f0;
  border-radius: 7px;
}

.metric small {
  color: #767782;
  font-size: 8px;
  font-weight: 600;
}

.metric b {
  color: #252631;
  font-size: clamp(15px, 1.45vw, 26px);
  line-height: 1;
}

.metric.chosen {
  color: #fff;
  border-color: var(--purple);
  background: var(--purple);
}

.metric.chosen small,
.metric.chosen b {
  color: #fff;
}

.data-row {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(150px, .85fr);
  gap: 10px;
  margin-top: 12px;
}

.chart,
.registrations {
  min-height: 208px;
  padding: 12px;
  border: 1px solid #e8e7f0;
  border-radius: 7px;
  color: #41424b;
  font-size: 10px;
}

.bars {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 164px;
  padding-top: 15px;
}

.bars i {
  width: min(8%, 22px);
  border-radius: 4px 4px 2px 2px;
  background: #e2dffa;
}

.bars i.selected {
  background: var(--purple);
}

.registrations {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.registrations>b {
  margin-bottom: 7px;
}

.registrations span {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 27px;
  border-top: 1px solid #f0eff5;
  font-size: 8px;
  font-weight: 600;
}

.registrations i {
  display: grid;
  width: 14px;
  height: 14px;
  place-items: center;
  border-radius: 50%;
  color: var(--purple);
  background: #f0efff;
  font-size: 7px;
  font-style: normal;
}

.registrations small {
  margin-left: auto;
  color: #9899a3;
  font-size: 7px;
  font-weight: 400;
}

.toast {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 14px 20px 14px 14px;
  border: 1px solid #e5e4ee;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 16px 30px -20px rgba(24, 24, 55, .42);
  color: #30313a;
}

.toast>i {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 10px;
  color: var(--purple);
  background: #f2f0ff;
}

.toast :deep(svg) {
  width: 20px;
  height: 20px;
}

.toast span {
  display: grid;
  line-height: 1.32;
}

.toast b {
  font-size: clamp(11px, 1vw, 16px);
}

.toast small {
  color: #73747e;
  font-size: clamp(9px, .85vw, 13px);
}

.toast em {
  margin-left: 6px;
  color: #e63c3c;
  font-size: .85em;
  font-style: normal;
  font-weight: 800;
}

.lead {
  top: 4%;
  right: 5%;
}

.checked {
  bottom: 6%;
  left: 4%;
}

.checked>i {
  color: #10a56b;
  background: #edf9f3;
}

@media (max-width: 1050px) {
  .banner {
    min-height: 570px;
  }

  .copy {
    width: 50%;
    padding-left: 42px;
  }

  .product-scene {
    left: 43%;
  }

  .contact {
    gap: 18px;
  }

  .mini-window {
    top: 11%;
  }

  .metrics {
    gap: 5px;
  }

  .data-row {
    grid-template-columns: 1fr;
  }

  .registrations {
    display: none;
  }
}

@media (max-width: 720px) {
  .banner {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .copy {
    width: auto;
    padding: 48px 28px 38px;
  }

  .eyebrow {
    font-size: 1.1rem;
  }

  h2 {
    margin-top: 20px;
    font-size: clamp(2.25rem, 10vw, 3.3rem);
  }

  .sub {
    margin-top: 24px;
    font-size: 1rem;
  }

  .contact {
    margin-top: 27px;
  }

  .cta {
    padding: 17px 25px;
  }

  .notes {
    gap: 15px;
    margin-top: 30px;
    padding-top: 22px;
    font-size: .9rem;
  }

  .product-scene {
    position: relative;
    inset: auto;
    width: 100%;
    height: 360px;
    overflow: hidden;
  }

  .dashboard {
    right: -22%;
    width: 96%;
    height: 72%;
  }

  .mini-window {
    top: 1%;
    right: -10%;
    width: 84%;
    height: 31%;
  }

  .lead {
    display: none;
  }

  .checked {
    bottom: 4%;
    left: 7%;
  }

  .panel {
    padding: 11px;
  }

  .side {
    padding: 10px 7px;
  }

  .side span {
    font-size: 7px;
  }

  .side strong {
    font-size: 7px;
  }

  .metrics {
    margin-top: 9px;
  }

  .metric {
    min-height: 43px;
    padding: 6px;
  }

  .metric b {
    font-size: 14px;
  }

  .chart {
    min-height: 135px;
  }

  .bars {
    height: 95px;
  }

  .data-row {
    margin-top: 6px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cta {
    transition: none;
  }
}
</style>
