/**
 * Lets an element rise in the first time it scrolls into view, the way the
 * homepage sections do.
 *
 *   const el = ref<HTMLElement | null>(null)
 *   const { animate, revealed } = useReveal(el)
 *   <div ref="el" :class="{ 'x--animate': animate, in: revealed }">
 *
 * `animate` turns on the hidden start state, `revealed` plays it in. Without
 * IntersectionObserver, with reduced motion, or when the element is already
 * on screen at load (a tall window, a restored scroll), neither turns on and
 * the element is simply shown.
 */
export function useReveal(el: Ref<HTMLElement | null>, rootMargin = '0px 0px -10% 0px') {
  const animate = ref(false)
  const revealed = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!el.value || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (el.value.getBoundingClientRect().top < window.innerHeight) return

    animate.value = true
    observer = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return
      observer?.disconnect()
      revealed.value = true
    }, { rootMargin, threshold: 0 })
    observer.observe(el.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return { animate, revealed }
}
