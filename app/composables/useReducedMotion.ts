import { ref, onMounted } from 'vue'

export const useReducedMotion = () => {
  const prefersReducedMotion = ref(false)

  onMounted(() => {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefersReducedMotion.value = mediaQuery.matches

      const listener = (event: MediaQueryListEvent) => {
        prefersReducedMotion.value = event.matches
      }

      mediaQuery.addEventListener('change', listener)
    }
  })

  return {
    prefersReducedMotion,
  }
}
