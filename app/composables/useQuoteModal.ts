import { ref } from 'vue'

export interface QuoteTarget {
  name: string
  sku: string
  slug: string
  categoryName?: string
}

const isModalOpen = ref(false)
const targetProduct = ref<QuoteTarget | null>(null)

export const useQuoteModal = () => {
  const openModal = (product?: QuoteTarget) => {
    if (product) {
      targetProduct.value = product
    } else {
      targetProduct.value = null
    }
    isModalOpen.value = true
  }

  const closeModal = () => {
    isModalOpen.value = false
    targetProduct.value = null
  }

  return {
    isModalOpen,
    targetProduct,
    openModal,
    closeModal,
  }
}
