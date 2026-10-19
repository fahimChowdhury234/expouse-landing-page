<script setup lang="ts">
/**
 * The lead story on /news: an image beside a brand-purple panel with the
 * category, date, headline and excerpt (Figma: Newsroom hero card).
 */
import { FEATURED_POST, longDate } from '~/utils/news'

defineProps<{
  post: typeof FEATURED_POST
}>()
</script>

<template>
  <article class="feat">
    <div class="feat-media">
      <img :src="post.image" alt="" class="feat-img" width="982" height="655" fetchpriority="high">
    </div>

    <div class="feat-panel">
      <i class="orb a" aria-hidden="true" />
      <i class="orb b" aria-hidden="true" />

      <div class="feat-meta">
        <span class="feat-cat">{{ post.category }}</span>
        <span class="feat-when">{{ longDate(post.date) }} · {{ post.readMinutes }} min read</span>
      </div>

      <h2 class="feat-title">{{ post.title }}</h2>
      <p class="feat-excerpt">{{ post.excerpt }}</p>

      <NuxtLink :to="`/news/${post.slug}`" class="feat-link">
        Read the story
        <svg class="ico" xmlns="http://www.w3.org/2000/svg" width="11" height="10" viewBox="0 0 11 10" fill="none">
          <path d="M0.733398 4.73334H10.0667M6.06673 8.73334L10.0667 4.73334L6.06673 0.733337" stroke="white"
            stroke-width="1.46667" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </NuxtLink>
    </div>
  </article>
</template>

<style scoped>
.feat {
  --feat-brand: var(--color-brand, #6452e7);
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 4fr);
  max-height: 428px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 0 0 1px rgba(26, 26, 46, .07), 0 1px 3px rgba(26, 26, 46, .06);
}

/* The image is absolutely placed so it always fills the row, however tall the panel gets. */
.feat-media {
  position: relative;
  background: #e9e8f3;
}

.feat-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feat-panel {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  padding: 48px 36px;
  color: #fff;
  background: linear-gradient(135deg, #6a5aea 0%, #6150e5 50%, #5141dd 100%);
}

/* Two soft concentric circles in the top-right corner. (Not ".ring" - that's a Tailwind utility.) */
.orb {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, .06);
  pointer-events: none;
}

.orb.a {
  right: -177px;
  top: -178px;
  width: 410px;
  height: 410px;
}

.orb.b {
  right: -140px;
  top: -141px;
  width: 336px;
  height: 336px;
}

.feat-meta,
.feat-title,
.feat-excerpt,
.feat-link {
  position: relative;
}

.feat-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.feat-cat {
  padding: 5px 10px;
  font-size: 13px;
  font-weight: 700;
  line-height: 20px;
  color: var(--feat-brand);
  background: #fff;
  border-radius: 5px;
}

.feat-when {
  font-size: 14px;
  color: #FFFFFF;
}

.feat-title {
  max-width: 11em;
  margin: 0;
  font-size: clamp(26px, 2.7vw, 32px);
  font-weight: 800;
  line-height: 1.21;
  text-wrap: balance;
}

.feat-excerpt {
  margin: 0;
  font-size: 16px;
  line-height: 1.65;
  color: #FFFFFF;
}

.feat-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  margin-top: 6px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
}

.feat-link .ico {
  /* width: 17px;
  height: 17px; */
  transition: transform .25s cubic-bezier(.22, .8, .24, 1);
}

.feat-link:hover .ico {
  transform: translateX(4px);
}

.feat-link:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
  border-radius: 6px;
}

@media (max-width: 960px) {
  .feat {
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;
  }

  .feat-media {
    aspect-ratio: 3 / 2;
  }

  .feat-panel {
    padding: 32px 24px;
  }

  .feat-title {
    max-width: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .feat-link .ico {
    transition: none;
  }
}
</style>
