<script setup lang="ts">
/**
 * A phone, drawn in design pixels (250 × 530): white bezel, the brand status
 * bar, the screen (default slot) and an optional tab bar along the bottom.
 * Decorative by default: the stage around it carries the description. With
 * `interactive` it is a live screen: exposed to assistive tech, and the tab bar
 * items are buttons that emit `tab` with their index.
 */
withDefaults(defineProps<{
  /** Clock in the status bar. */
  time?: string
  /** Tab bar items, left to right. */
  nav?: { icon: string, label: string }[]
  /** Index of the selected tab. */
  active?: number
  interactive?: boolean
}>(), { time: '12:30', active: 0, interactive: false })

defineEmits<{ tab: [index: number] }>()
</script>

<template>
  <div class="phone" :aria-hidden="interactive ? undefined : 'true'">
    <div class="screen">
      <div class="status">
        <span>{{ time }}</span>
        <span class="sys">
          <Icon name="lucide:signal" class="ico" />
          <Icon name="lucide:wifi" class="ico" />
          <Icon name="lucide:battery-full" class="ico bat" />
        </span>
      </div>

      <div class="content">
        <slot />
      </div>

      <div v-if="nav" class="tabs">
        <template v-if="interactive">
          <button v-for="(n, i) in nav" :key="n.label" type="button" :class="{ on: i === active }" :aria-current="i === active ? 'page' : undefined" @click="$emit('tab', i)">
            <Icon :name="n.icon" class="ico" />
            {{ n.label }}
          </button>
        </template>
        <template v-else>
          <span v-for="(n, i) in nav" :key="n.label" :class="{ on: i === active }">
            <Icon :name="n.icon" class="ico" />
            {{ n.label }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.phone {
  width: 250px;
  height: 530px;
  padding: 6px;
  background: #fff;
  border-radius: 36px;
  box-shadow: 0 0 0 1px rgba(20, 23, 40, .06), 0 2px 6px rgba(20, 23, 40, .05), 0 34px 64px -30px rgba(49, 40, 140, .38);
}

.screen {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-radius: 30px;
  background: #f6f6fb;
  font-size: 10px;
  line-height: 1.35;
  color: var(--color-ink, #1f2430);
}

.status {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 26px;
  padding: 2px 18px 0;
  background: var(--color-brand, #6452E7 );
  color: #fff;
  font-size: 10px;
  font-weight: 700;
}

.sys {
  display: flex;
  align-items: center;
  gap: 3px;
}

.sys .ico {
  width: 10px;
  height: 10px;
}

.sys .ico.bat {
  width: 14px;
  height: 14px;
}

.content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabs {
  flex: none;
  display: flex;
  justify-content: space-around;
  height: 50px;
  padding: 7px 6px 0;
  background: #fff;
  border-top: 1px solid #ececf3;
}

.tabs > * {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  font-size: 8px;
  font-weight: 600;
  color: #9aa1ad;
}

.tabs .ico {
  width: 15px;
  height: 15px;
}

/* Live tab bar: plain buttons that look the same. */
.tabs button {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: 8px;
  font-weight: 600;
  cursor: pointer;
}

.tabs > .on {
  color: var(--color-brand, #6452E7 );
}
</style>
