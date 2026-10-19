/**
 * A small cancellable timeline for scripted UI animations.
 *
 *   const tl = useTimeline()
 *   tl.run(async (wait) => { step.value = 1; await wait(400); step.value = 2 })
 *
 * `run` cancels whatever was playing before. Cancelling clears every pending
 * timer, so a cancelled script simply never continues past its current `wait`.
 * Everything is cleared when the component unmounts.
 */
export function useTimeline() {
  const timers = new Set<ReturnType<typeof setTimeout>>()
  const playing = ref(false)
  let generation = 0

  function wait(ms: number) {
    return new Promise<void>((resolve) => {
      const t = setTimeout(() => {
        timers.delete(t)
        resolve()
      }, ms)
      timers.add(t)
    })
  }

  /** Resolves on the next painted frame (handy before starting a CSS transition). */
  function frame() {
    return new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }

  function cancel() {
    generation++
    timers.forEach(clearTimeout)
    timers.clear()
    playing.value = false
  }

  async function run(script: (wait: (ms: number) => Promise<void>, frame: () => Promise<void>) => Promise<void>) {
    cancel()
    const mine = generation
    playing.value = true
    await script(wait, frame)
    if (mine === generation) playing.value = false
  }

  onBeforeUnmount(cancel)

  return { run, cancel, wait, frame, playing }
}
