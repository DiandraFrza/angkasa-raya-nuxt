import type { Category, Product, CategorySlug } from '~/types/catalog'

export const useCatalog = () => {
  const productsState = useState<Product[]>('catalog_products', () => [])
  const categoriesState = useState<Category[]>('catalog_categories', () => [])
  const isLoadedState = useState<boolean>('catalog_loaded', () => false)

  const refreshCatalog = async () => {
    try {
      const [prods, cats] = await Promise.all([
        $fetch<Product[]>('/api/products'),
        $fetch<Category[]>('/api/categories'),
      ])
      if (prods && Array.isArray(prods)) {
        productsState.value = prods
      }
      if (cats && Array.isArray(cats)) {
        categoriesState.value = cats
      }
      isLoadedState.value = true
    } catch (err) {
      console.warn('[useCatalog] Gagal memuat data dari API SQL:', err)
    }
  }

  // Initial fetch if empty
  if (!isLoadedState.value && productsState.value.length === 0) {
    if (import.meta.server) {
      // In server SSR
      useAsyncData('catalog_ssr_init', async () => {
        await refreshCatalog()
        return true
      })
    } else {
      // In client
      refreshCatalog()
    }
  }

  const getCategories = (): Category[] => categoriesState.value

  const getCategoryBySlug = (slug: CategorySlug | string): Category | undefined =>
    categoriesState.value.find(c => c.slug === slug)

  const getProducts = (): Product[] => productsState.value

  const getProductBySlug = (slug: string): Product | undefined =>
    productsState.value.find(p => p.slug === slug)

  const getFeaturedProducts = (): Product[] =>
    productsState.value.filter(p => p.isFeatured)

  const getProductsByCategory = (categorySlug?: CategorySlug | 'all' | string): Product[] => {
    if (!categorySlug || categorySlug === 'all') return productsState.value
    return productsState.value.filter(p => p.categorySlug === categorySlug)
  }

  const searchProducts = (query: string, categorySlug?: CategorySlug | 'all' | string): Product[] => {
    const base = getProductsByCategory(categorySlug)
    if (!query || query.trim() === '') return base

    const q = query.toLowerCase().trim()
    return base.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q)
    )
  }

  return {
    products: productsState,
    categories: categoriesState,
    refreshCatalog,
    getCategories,
    getCategoryBySlug,
    getProducts,
    getProductBySlug,
    getFeaturedProducts,
    getProductsByCategory,
    searchProducts,
  }
}
