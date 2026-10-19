<script setup lang="ts">
/**
 * Error page (a missing page, mostly) in the site's own layout, so a lost
 * visitor still has the nav and a way home. Marked noindex: an error page must
 * never land in search results (the .htaccess also sends X-Robots-Tag for the
 * static 404.html it serves).
 */
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const notFound = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: () => (notFound.value ? 'Page not found | EXPOUSE' : 'Something went wrong | EXPOUSE'),
  robots: 'noindex, follow',
})
</script>

<template>
  <NuxtLayout>
    <section class="container-x flex flex-col items-center py-24 text-center sm:py-32">
      <p class="m-0 text-base font-semibold text-brand">{{ error.statusCode }}</p>
      <h1 class="mt-3 mb-0 text-4xl font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">
        {{ notFound ? 'Page not found' : 'Something went wrong' }}
      </h1>
      <p class="mx-auto mt-4 mb-0 max-w-md text-lg text-muted">
        {{ notFound ? 'We couldn\'t find that page. It may have moved, or the link has a typo.' : 'Please try again in a moment.' }}
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" class="btn" @click="clearError({ redirect: '/' })">Back to home</button>
        <button type="button" class="btn-ghost" @click="clearError({ redirect: '/contact-us' })">Book a demo</button>
      </div>
    </section>
  </NuxtLayout>
</template>
