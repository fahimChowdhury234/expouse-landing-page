<script setup lang="ts">
/** "Share" buttons on an article: LinkedIn, X and copy link (it says "Copied" for a moment). */
import { LINKEDIN_PATH, X_PATH } from '~/utils/brandIcons'

const props = defineProps<{
  url: string
  title: string
}>()

const linkedin = computed(() => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(props.url)}`)
const x = computed(() => `https://x.com/intent/post?url=${encodeURIComponent(props.url)}&text=${encodeURIComponent(props.title)}`)

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(props.url)
  }
  catch {
    window.prompt('Copy this link:', props.url)
    return
  }
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => { copied.value = false }, 2000)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="share">
    <span class="label">Share</span>
    <a :href="linkedin" class="btn sq" target="_blank" rel="noopener" aria-label="Share on LinkedIn">
      <svg viewBox="0 0 24 24" class="brand" aria-hidden="true"><path :d="LINKEDIN_PATH" /></svg>
    </a>
    <a :href="x" class="btn sq" target="_blank" rel="noopener" aria-label="Share on X">
      <svg viewBox="0 0 24 24" class="brand x" aria-hidden="true"><path :d="X_PATH" /></svg>
    </a>
    <button type="button" class="btn" @click="copy">
      <Icon :name="copied ? 'lucide:check' : 'lucide:link'" class="ico" />
      <span aria-live="polite">{{ copied ? 'Copied' : 'Copy link' }}</span>
    </button>
  </div>
</template>

<style scoped>
.share {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.label {
  margin-right: 4px;
  font-size: 15px;
  color: var(--color-muted, #6b7280);
}

.btn {
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 12px;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-ink, #1f2430);
  text-decoration: none;
  background: #fff;
  border: 1px solid #e3e5ea;
  border-radius: 7px;
  cursor: pointer;
  transition: border-color .2s, color .2s;
}

.btn.sq {
  width: 36px;
  padding: 0;
}

.btn:hover {
  color: var(--color-brand, #6452e7);
  border-color: #cfccf0;
}

.btn:focus-visible {
  outline: 2px solid var(--color-brand, #6452e7);
  outline-offset: 2px;
}

.brand {
  width: 15px;
  height: 15px;
  fill: currentColor;
}

.brand.x {
  width: 14px;
  height: 14px;
}

.ico {
  width: 15px;
  height: 15px;
}
</style>
