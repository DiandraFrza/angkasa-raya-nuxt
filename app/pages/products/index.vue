<!-- @format -->

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Search, RefreshCcw, ArrowDown } from "lucide-vue-next";
import { motion } from "motion-v";
import { useCatalog } from "~/composables/useCatalog";
import { useQuoteModal } from "~/composables/useQuoteModal";
import { useProgressiveList } from "~/composables/useProgressiveList";
import AppBreadcrumb from "~/components/common/AppBreadcrumb.vue";
import LazyCardWrapper from "~/components/common/LazyCardWrapper.vue";
import ProductCard from "~/components/products/ProductCard.vue";
import ProductFilter from "~/components/products/ProductFilter.vue";
import ProductSearch from "~/components/products/ProductSearch.vue";

useSeoMeta({
  title: () => `Katalog Produk Reagen & Alat Laboratorium`,
  description: "Telusuri katalog reagen diagnostik, bahan acuan standar, dan alat laboratorium otomatis dengan spesifikasi terverifikasi.",
});

const route = useRoute();
const router = useRouter();
const { searchProducts, getCategoryBySlug } = useCatalog();
const { openModal } = useQuoteModal();

const activeCategory = ref<string>((route.query.category as string) || "all");
const searchQuery = ref<string>((route.query.q as string) || "");

watch([activeCategory, searchQuery], ([newCat, newQ]) => {
  const query: Record<string, string> = {};
  if (newCat && newCat !== "all") query.category = newCat;
  if (newQ && newQ.trim() !== "") query.q = newQ;
  router.replace({ query });
});

watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.category && typeof newQuery.category === "string") {
      activeCategory.value = newQuery.category;
    } else if (!newQuery.category) {
      activeCategory.value = "all";
    }
    if (typeof newQuery.q === "string") {
      searchQuery.value = newQuery.q;
    }
  },
);

const filteredProducts = computed(() => {
  return searchProducts(searchQuery.value, activeCategory.value);
});

// Load bertahap: 8 produk awal, muat 12 berikutnya via tombol tanpa reload
const { visibleItems: visibleProducts, totalCount: totalCatalogProducts, hasMore, loadMore, reset: resetProgressiveList } = useProgressiveList(filteredProducts, 8, 12, { autoLoad: false });

watch([activeCategory, searchQuery], () => {
  resetProgressiveList();
});

const currentCategoryInfo = computed(() => {
  if (activeCategory.value === "all") {
    return {
      name: "Seluruh Katalog Produk",
      description: "Menampilkan seluruh sediaan reagen standar, reagen uji rutin, dan lini alat laboratorium dari Angkasa Karya Medika.",
    };
  }
  const cat = getCategoryBySlug(activeCategory.value);
  return {
    name: cat ? cat.name : "Katalog Produk",
    description: cat ? cat.description : "",
  };
});

const handleCategorySelect = (slug: string) => {
  activeCategory.value = slug;
};

const resetFilters = () => {
  activeCategory.value = "all";
  searchQuery.value = "";
};
</script>

<template>
  <div class="py-8 pb-24 bg-[#E9F8FF]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <!-- Breadcrumb -->
      <AppBreadcrumb :items="[{ label: 'Katalog Produk' }]" />

      <!-- Page Header -->
      <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut' }" :viewport="{ once: true, amount: 0.2 }" class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div class="space-y-3">
          <div class="inline-flex items-center gap-2 text-[11px] font-manrope font-bold uppercase tracking-wider text-[#054E4C] bg-[#A3EEEC]/60 px-3 py-1 rounded-sm">
            <span>Katalog & Inventaris Pengadaan</span>
          </div>
          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-manrope tracking-tight leading-[1.02]">
            <span class="block font-black text-[#0D2235]">Katalog Reagen Lab.</span>
            <span class="block font-light text-[#486581] mt-1.5">Standar Resmi RS.</span>
          </h1>
          <p class="text-[14.5px] sm:text-lg text-[#486581] font-sans font-light max-w-2xl leading-relaxed"><strong class="text-[#0D253A] font-semibold">Spesifikasi jelas. Dokumen lengkap.</strong> {{ currentCategoryInfo.description }}</p>
        </div>

        <div class="text-[13px] text-[#486581] font-manrope font-semibold shrink-0 bg-white px-4 py-2 rounded-md shadow-xs border border-slate-200/70">
          Menampilkan <span class="text-[#0D2235] font-bold">{{ visibleProducts.length }}</span> / {{ totalCatalogProducts }} produk
        </div>
      </motion.div>

      <!-- Filter & Search Controls Bar -->
      <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut', delay: 0.1 }" :viewport="{ once: true, amount: 0.2 }" class="space-y-4 max-w-full overflow-hidden">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <ProductSearch v-model="searchQuery" />
          <div class="flex items-center gap-2">
            <button v-if="activeCategory !== 'all' || searchQuery" type="button" class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md text-[13px] font-manrope font-semibold text-[#486581] hover:text-[#0D2235] bg-white hover:bg-[#D0F2F9] transition-colors cursor-pointer shadow-xs border border-slate-200/70" @click="resetFilters">
              <RefreshCcw class="w-3.5 h-3.5 text-[#89CBDD]" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <ProductFilter :active-category="activeCategory" @select="handleCategorySelect" />
      </motion.div>

      <!-- Product Card Grid with Lazy Loading -->
      <div v-if="filteredProducts.length > 0" class="space-y-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-2">
          <LazyCardWrapper v-for="(product, idx) in visibleProducts" :key="product.id" :eager="idx < 4">
            <ProductCard :product="product" />
          </LazyCardWrapper>
        </div>

        <!-- Info Jumlah & Tombol Tampilkan Lebih Banyak (8 awal, +12 tiap klik) -->
        <div class="flex flex-col items-center justify-center gap-3 py-4">
          <p class="text-[13px] font-manrope font-semibold text-[#486581]">
            Menampilkan <strong class="text-[#0D2235]">{{ visibleProducts.length }}</strong> dari <strong class="text-[#0D2235]">{{ totalCatalogProducts }}</strong> produk
          </p>

          <button v-if="hasMore" type="button" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-bold text-[13px] shadow-xs transition-colors cursor-pointer" @click="loadMore">
            <span>Tampilkan Lebih Banyak</span>
            <ArrowDown class="w-4 h-4 text-[#1B7E98]" />
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <motion.div v-else :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut' }" :viewport="{ once: true, amount: 0.2 }" class="bg-white rounded-md p-10 sm:p-12 text-center space-y-5 max-w-xl mx-auto my-12 border border-slate-200/70 shadow-sm">
        <div class="w-14 h-14 rounded-md bg-[#89CBDD]/20 text-[#1B7E98] mx-auto flex items-center justify-center">
          <Search class="w-7 h-7" />
        </div>
        <div class="space-y-2">
          <h3 class="font-manrope font-bold text-xl text-[#0D2235]">Produk Tidak Ditemukan</h3>
          <p class="text-[14px] text-[#486581] font-sans font-light leading-relaxed">
            Tidak ada produk yang cocok dengan kata kunci <span class="font-semibold text-[#0D2235]">"{{ searchQuery }}"</span> pada kategori ini.
          </p>
        </div>

        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button type="button" class="w-full sm:w-auto px-5 py-2.5 rounded-md bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D2235] font-manrope font-semibold text-[13px] transition-colors cursor-pointer border border-slate-200/70" @click="resetFilters">Reset</button>
          <button type="button" class="w-full sm:w-auto px-5 py-2.5 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13px] transition-all cursor-pointer shadow-xs" @click="openModal()">Penawaran</button>
        </div>
      </motion.div>
    </div>
  </div>
</template>
