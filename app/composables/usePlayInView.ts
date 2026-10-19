/**
 * Runs a looping animation only while its element is on screen.
 *
 *   const el = ref<HTMLElement | null>(null)
 *   usePlayInView(el, { play: () => tl.run(loop), pause: () => tl.cancel() })
 *
 * `play` is called each time the element comes into view, `pause` each time it
 * leaves. Nothing plays with reduced motion or without IntersectionObserver, so
 * the element keeps its static (designed) state.
 */
export function usePlayInView(
  el: Ref<HTMLElement | null>,
  { play, pause }: { play: () => void, pause: () => void },
) {
  let observer: IntersectionObserver | null = null
  let on = false

  onMounted(() => {
    if (!el.value || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    observer = new IntersectionObserver(([e]) => {
      const visible = !!e?.isIntersecting
      if (visible === on) return
      on = visible
      if (visible) play()
      else pause()
    }, { threshold: 0.35 })
    observer.observe(el.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    if (on) pause()
  })
}
