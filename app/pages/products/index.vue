<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ArrowRight, Search, SlidersHorizontal, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { motion } from 'motion-v'
import { useCatalog } from '~/composables/useCatalog'
import { useQuoteModal } from '~/composables/useQuoteModal'
import { useSiteSettings } from '~/composables/useSiteSettings'
import SectionHeading from '~/components/common/SectionHeading.vue'
import AppBreadcrumb from '~/components/common/AppBreadcrumb.vue'
import ProductCard from '~/components/products/ProductCard.vue'
import ProductFilter from '~/components/products/ProductFilter.vue'
import ProductSearch from '~/components/products/ProductSearch.vue'

const { settings } = useSiteSettings()

useSeoMeta({
  title: () => `Katalog Produk Reagen & Alat Laboratorium — ${settings.value.company_name}`,
  description: 'Telusuri katalog reagen diagnostik, bahan acuan standar, dan alat laboratorium otomatis dengan spesifikasi terverifikasi.',
})

const route = useRoute()
const router = useRouter()
const { getCategories, searchProducts, getCategoryBySlug } = useCatalog()
const { openModal } = useQuoteModal()

const categories = getCategories()
const activeCategory = ref<string>((route.query.category as string) || 'all')
const searchQuery = ref<string>((route.query.q as string) || '')

// Catalog Pagination
const catalogPageSizeOptions = [12, 24, 48, 96]
const catalogPage = ref(1)
const catalogPageSize = ref(12)

// Synchronize URL query params
watch([activeCategory, searchQuery], ([newCat, newQ]) => {
  const query: Record<string, string> = {}
  if (newCat && newCat !== 'all') query.category = newCat
  if (newQ && newQ.trim() !== '') query.q = newQ
  router.replace({ query })
  catalogPage.value = 1
})

watch(catalogPageSize, () => {
  catalogPage.value = 1
})

// Update local state if URL changes externally
watch(() => route.query, (newQuery) => {
  if (newQuery.category && typeof newQuery.category === 'string') {
    activeCategory.value = newQuery.category
  } else if (!newQuery.category) {
    activeCategory.value = 'all'
  }
  if (typeof newQuery.q === 'string') {
    searchQuery.value = newQuery.q
  }
})

const filteredProducts = computed(() => {
  return searchProducts(searchQuery.value, activeCategory.value)
})

const totalCatalogProducts = computed(() => filteredProducts.value.length)
const totalCatalogPages = computed(() => Math.max(1, Math.ceil(totalCatalogProducts.value / catalogPageSize.value)))

const paginatedProducts = computed(() => {
  const start = (catalogPage.value - 1) * catalogPageSize.value
  return filteredProducts.value.slice(start, start + catalogPageSize.value)
})

const catalogStartRange = computed(() => {
  if (totalCatalogProducts.value === 0) return 0
  return (catalogPage.value - 1) * catalogPageSize.value + 1
})

const catalogEndRange = computed(() => {
  return Math.min(catalogPage.value * catalogPageSize.value, totalCatalogProducts.value)
})

const currentCategoryInfo = computed(() => {
  if (activeCategory.value === 'all') {
    return {
      name: 'Seluruh Katalog Produk',
      description: 'Menampilkan seluruh sediaan reagen standar, reagen uji rutin, dan lini alat laboratorium dari Angkasa Raya Medika.',
    }
  }
  const cat = getCategoryBySlug(activeCategory.value)
  return {
    name: cat ? cat.name : 'Katalog Produk',
    description: cat ? cat.description : '',
  }
})

const handleCategorySelect = (slug: string) => {
  activeCategory.value = slug
}

const resetFilters = () => {
  activeCategory.value = 'all'
  searchQuery.value = ''
  catalogPage.value = 1
}
</script>

<template>
  <div class="py-8 pb-24 bg-[#E9F8FF]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <!-- Breadcrumb -->
      <AppBreadcrumb :items="[{ label: 'Katalog Produk' }]" />

      <!-- Page Header: Giant Typography with Extreme Contrast + Framer Motion -->
      <motion.div
        :initial="{ opacity: 0, y: 40 }"
        :whileInView="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.8, ease: 'easeOut' }"
        :viewport="{ once: true, amount: 0.2 }"
        class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2"
      >
        <div class="space-y-3">
          <div class="inline-flex items-center gap-2 text-[11px] font-manrope font-bold uppercase tracking-wider text-[#054E4C] bg-[#A3EEEC]/60 px-4 py-1.5 rounded-full border border-slate-200/40">
            <span>Katalog & Inventaris Pengadaan</span>
          </div>
          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-manrope tracking-tight leading-[0.98]">
            <span class="block font-black text-[#0D2235]">Katalog Reagen Lab.</span>
            <span class="block font-light text-[#486581] mt-2">Standar Resmi RS.</span>
          </h1>
          <p class="text-base sm:text-lg text-[#486581] font-sans font-light max-w-2xl leading-relaxed">
            <strong class="text-[#0D253A] font-semibold">Spesifikasi jelas. Dokumen lengkap.</strong> {{ currentCategoryInfo.description }}
          </p>
        </div>

        <div class="text-[13px] text-[#486581] font-manrope font-semibold shrink-0 bg-white px-4 py-2.5 rounded-2xl shadow-xs border border-slate-100">
          Menampilkan <span class="text-[#0D2235] font-bold">{{ filteredProducts.length }}</span> produk
        </div>
      </motion.div>

      <!-- Filter & Search Controls Bar -->
      <motion.div
        :initial="{ opacity: 0, y: 40 }"
        :whileInView="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.8, ease: 'easeOut', delay: 0.1 }"
        :viewport="{ once: true, amount: 0.2 }"
        class="space-y-4"
      >
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <ProductSearch v-model="searchQuery" />
          <div class="flex items-center gap-2">
            <button
              v-if="activeCategory !== 'all' || searchQuery"
              type="button"
              class="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl text-[13px] font-manrope font-semibold text-[#486581] hover:text-[#0D2235] bg-white hover:bg-[#D0F2F9] transition-colors cursor-pointer shadow-xs border border-slate-100"
              @click="resetFilters"
            >
              <RefreshCcw class="w-3.5 h-3.5 text-[#89CBDD]" />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>

        <!-- Cleaned & Polished Category Pill Navigation -->
        <ProductFilter
          :active-category="activeCategory"
          @select="handleCategorySelect"
        />
      </motion.div>

      <!-- Product Card Grid with Staggered Framer Motion Entrance Animation -->
      <div v-if="filteredProducts.length > 0" class="space-y-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          <motion.div
            v-for="(product, idx) in paginatedProducts"
            :key="product.id"
            :initial="{ opacity: 0, y: 40 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.6, ease: 'easeOut', delay: (idx % 12) * 0.06 }"
            :viewport="{ once: true, amount: 0.1 }"
            class="h-full"
          >
            <ProductCard :product="product" />
          </motion.div>
        </div>

        <!-- Catalog Pagination Controls Bar -->
        <motion.div
          :initial="{ opacity: 0, y: 40 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, ease: 'easeOut' }"
          :viewport="{ once: true, amount: 0.2 }"
          class="bg-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] font-sans border border-slate-100 shadow-xs"
        >
          <!-- Page Size Selector -->
          <div class="flex items-center gap-2">
            <span class="text-[#486581] font-medium">Tampilkan:</span>
            <div class="flex items-center gap-1 bg-[#E9F8FF] p-1 rounded-xl">
              <button
                v-for="size in catalogPageSizeOptions"
                :key="size"
                type="button"
                class="px-2.5 py-1 rounded-lg font-manrope font-bold text-[12px] transition-all cursor-pointer"
                :class="catalogPageSize === size ? 'bg-[#89CBDD] text-[#082838]' : 'text-[#486581] hover:text-[#082838]'"
                @click="catalogPageSize = size"
              >
                {{ size }}
              </button>
            </div>
            <span class="text-[#486581] hidden sm:inline">produk</span>
          </div>

          <!-- Range Info -->
          <div class="text-[#486581] font-medium">
            Menampilkan <strong class="text-[#0D2235]">{{ catalogStartRange }}–{{ catalogEndRange }}</strong> dari <strong class="text-[#0D2235]">{{ totalCatalogProducts }}</strong> produk
          </div>

          <!-- Prev / Next Navigation -->
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="p-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              :disabled="catalogPage <= 1"
              title="Halaman Sebelumnya"
              @click="catalogPage--"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>

            <div class="px-3.5 py-1.5 rounded-xl bg-[#D0F2F9]/70 text-[#082838] font-manrope font-bold text-[12.5px]">
              Hal {{ catalogPage }} / {{ totalCatalogPages }}
            </div>

            <button
              type="button"
              class="p-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              :disabled="catalogPage >= totalCatalogPages"
              title="Halaman Selanjutnya"
              @click="catalogPage++"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      <!-- Empty State -->
      <motion.div
        v-else
        :initial="{ opacity: 0, y: 40 }"
        :whileInView="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.8, ease: 'easeOut' }"
        :viewport="{ once: true, amount: 0.2 }"
        class="bg-white rounded-3xl p-12 text-center space-y-5 max-w-xl mx-auto my-12 border border-slate-100 shadow-sm"
      >
        <div class="w-14 h-14 rounded-full bg-[#89CBDD]/20 text-[#1B7E98] mx-auto flex items-center justify-center">
          <Search class="w-7 h-7" />
        </div>
        <div class="space-y-2">
          <h3 class="font-manrope font-bold text-xl text-[#0D2235]">
            Produk Tidak Ditemukan
          </h3>
          <p class="text-[14px] text-[#486581] font-sans font-light leading-relaxed">
            Tidak ada produk yang cocok dengan kata kunci <span class="font-semibold text-[#0D2235]">"{{ searchQuery }}"</span> pada kategori ini.
          </p>
        </div>

        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            class="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D2235] font-manrope font-semibold text-[13px] transition-colors cursor-pointer border border-slate-200/50"
            @click="resetFilters"
          >
            Bersihkan Filter & Pencarian
          </button>
          <button
            type="button"
            class="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13px] transition-all cursor-pointer shadow-xs"
            @click="openModal()"
          >
            Ajukan Kebutuhan Khusus
          </button>
        </div>
      </motion.div>
    </div>
  </div>
</template>
