import { ref, onMounted, onUnmounted } from 'vue'
import { useReducedMotion } from './useReducedMotion'

export const useParallax = (speed = 0.2) => {
  const offsetY = ref(0)
  const { prefersReducedMotion } = useReducedMotion()

  const handleScroll = () => {
    if (prefersReducedMotion.value || typeof window === 'undefined') {
      offsetY.value = 0
      return
    }
    const currentScroll = window.scrollY || window.pageYOffset
    offsetY.value = Math.round(currentScroll * speed)
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', handleScroll)
    }
  })

  return {
    offsetY,
    prefersReducedMotion,
  }
}
