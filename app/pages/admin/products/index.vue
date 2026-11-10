<!-- @format -->

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Plus, Search, Edit3, Trash2, ExternalLink, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Package } from "lucide-vue-next";
import type { Product } from "~/types/catalog";
import { useCatalog } from "~/composables/useCatalog";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { useAdminAuth } from "~/composables/useAdminAuth";
import ProductCreateModal from "~/components/admin/ProductCreateModal.vue";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const { settings } = useSiteSettings();
const { isSuperAdmin } = useAdminAuth();
const { refreshCatalog } = useCatalog();

useSeoMeta({
  title: () => `Daftar Produk`,
});

// Modal Tambah Produk Baru State
const isProductModalOpen = ref(false);
const openProductModal = () => {
  isProductModalOpen.value = true;
};
const closeProductModal = () => {
  isProductModalOpen.value = false;
  if (route.query.newProduct) {
    const q = { ...route.query };
    delete q.newProduct;
    router.replace({ query: q });
  }
};

// Check if route has newProduct query param (e.g. from create redirect)
if (route.query.newProduct) {
  isProductModalOpen.value = true;
}
watch(
  () => route.query.newProduct,
  (val) => {
    if (val) isProductModalOpen.value = true;
  },
);

const searchQuery = ref("");
const selectedCategory = ref("all");
const isDeleting = ref(false);
const deleteError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Pagination
const pageSizeOptions = [10, 20, 50, 100];
const productsPage = ref(1);
const productsPageSize = ref(10);

// Fetch products & categories
const { data: productsData, refresh: refreshProducts } = await useFetch<Product[]>("/api/products");
const { data: categoriesData } = await useFetch<any[]>("/api/categories");

const products = computed(() => productsData.value || []);
const categories = computed(() => categoriesData.value || []);

// Filter products
const filteredProducts = computed(() => {
  let list = products.value;
  if (selectedCategory.value !== "all") {
    list = list.filter((p) => p.categorySlug === selectedCategory.value);
  }
  if (searchQuery.value && searchQuery.value.trim() !== "") {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q)));
  }
  return list;
});

// Reset page when filter or search changes
watch([selectedCategory, searchQuery, productsPageSize], () => {
  productsPage.value = 1;
});

// Pagination Calculations
const totalProducts = computed(() => filteredProducts.value.length);
const totalProductsPages = computed(() => Math.max(1, Math.ceil(totalProducts.value / productsPageSize.value)));
const paginatedProducts = computed(() => {
  const start = (productsPage.value - 1) * productsPageSize.value;
  return filteredProducts.value.slice(start, start + productsPageSize.value);
});
const productsStartRange = computed(() => {
  if (totalProducts.value === 0) return 0;
  return (productsPage.value - 1) * productsPageSize.value + 1;
});
const productsEndRange = computed(() => {
  return Math.min(productsPage.value * productsPageSize.value, totalProducts.value);
});

// Handle Product Created
const handleProductCreated = async (newProduct: any) => {
  await refreshProducts();
  await refreshCatalog();
  successMessage.value = `Produk "${newProduct?.name || "baru"}" berhasil ditambahkan ke katalog!`;
  setTimeout(() => {
    successMessage.value = null;
  }, 4000);
};

// Delete Product Handler (Super Admin Only)
const handleDeleteProduct = async (id: string, name: string) => {
  if (!isSuperAdmin.value) {
    alert("Hanya Super Admin yang diizinkan untuk menghapus produk dari katalog.");
    return;
  }

  if (!confirm(`Apakah Anda yakin ingin menghapus produk "${name}" dari katalog? Tindakan ini tidak dapat dibatalkan.`)) {
    return;
  }

  isDeleting.value = true;
  deleteError.value = null;
  try {
    await $fetch(`/api/products/${id}`, { method: "DELETE" });
    successMessage.value = `Produk "${name}" berhasil dihapus dari katalog.`;
    await refreshProducts();
    await refreshCatalog();
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  } catch (err: any) {
    deleteError.value = err.data?.statusMessage || "Gagal menghapus produk.";
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <div class="space-y-8 animate-fade-up">
    <!-- Header Page: Clean, Static & Semantic -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
      <!-- Top Action Buttons -->
      <div class="flex flex-wrap items-center gap-3 shrink-0 self-start sm:self-auto">
        <button type="button" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13.5px] transition-all shadow-xs hover:shadow-md cursor-pointer" @click="openProductModal">
          <Plus class="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>
    </div>

    <!-- Success / Error Alert -->
    <div v-if="successMessage" class="p-4 rounded-2xl bg-[#A3EEEC]/50 text-[#054E4C] text-[14px] flex items-center justify-between font-medium shadow-xs">
      <div class="flex items-center gap-2.5">
        <CheckCircle2 class="w-5 h-5 text-[#054E4C] shrink-0" />
        <span>{{ successMessage }}</span>
      </div>
      <button type="button" class="text-[#054E4C] font-bold cursor-pointer" @click="successMessage = null">✕</button>
    </div>

    <div v-if="deleteError" class="p-4 rounded-2xl bg-red-100 text-red-800 text-[14px] flex items-center justify-between font-medium shadow-xs">
      <div class="flex items-center gap-2.5">
        <AlertCircle class="w-5 h-5 text-red-600 shrink-0" />
        <span>{{ deleteError }}</span>
      </div>
      <button type="button" class="text-red-700 font-bold cursor-pointer" @click="deleteError = null">✕</button>
    </div>

    <!-- Search, Filter & Per Page Controls -->
    <div class="bg-white rounded-3xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs border border-[#D0F2F9]/70">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <Search class="w-4 h-4 text-[#89CBDD] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input v-model="searchQuery" type="text" placeholder="Cari nama produk, SKU, brand..." class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#E9F8FF]/80 text-[13.5px] text-[#0D2235] placeholder-[#486581]/70 focus:bg-white focus:ring-2 focus:ring-[#89CBDD]/40 outline-none transition-all font-sans" />
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
        <button type="button" class="px-4 py-2 rounded-2xl text-[12.5px] font-manrope font-bold whitespace-nowrap transition-all cursor-pointer" :class="selectedCategory === 'all' ? 'bg-[#89CBDD] text-[#082838]' : 'bg-[#E9F8FF] text-[#486581] hover:bg-[#D0F2F9]'" @click="selectedCategory = 'all'">Semua ({{ products.length }})</button>
        <button v-for="cat in categories" :key="cat.slug" type="button" class="px-4 py-2 rounded-2xl text-[12.5px] font-manrope font-bold whitespace-nowrap transition-all cursor-pointer" :class="selectedCategory === cat.slug ? 'bg-[#89CBDD] text-[#082838]' : 'bg-[#E9F8FF] text-[#486581] hover:bg-[#D0F2F9]'" @click="selectedCategory = cat.slug">
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div class="bg-white rounded-3xl overflow-hidden shadow-xs border border-[#D0F2F9]/70">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-[13.5px]">
          <thead class="bg-[#D0F2F9]/70 text-[#0D253A] text-[12px] font-manrope font-bold uppercase tracking-wider">
            <tr>
              <th class="py-4 px-6">Produk</th>
              <th class="py-4 px-4">Kategori</th>
              <th class="py-4 px-4">Kemasan & Mutu</th>
              <th class="py-4 px-4">Status</th>
              <th class="py-4 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#D0F2F9]/40">
            <tr v-for="(p, idx) in paginatedProducts" :key="p.id" class="transition-colors" :class="idx % 2 === 0 ? 'bg-white hover:bg-[#E9F8FF]/50' : 'bg-[#E9F8FF]/20 hover:bg-[#E9F8FF]/50'">
              <!-- Thumbnail & Name -->
              <td class="py-4 px-6">
                <div class="flex items-center gap-3.5">
                  <div class="w-12 h-12 rounded-2xl bg-[#E9F8FF] p-1 flex items-center justify-center shrink-0 overflow-hidden border border-[#ADDFF1]/40">
                    <img :src="p.imageUrl" :alt="p.name" class="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div class="font-manrope font-bold text-[#0D2235] hover:text-[#1B7E98]">
                      {{ p.name }}
                    </div>
                    <div class="text-[12px] text-[#486581] font-mono">{{ p.sku }} &bull; {{ p.brand }}</div>
                  </div>
                </div>
              </td>

              <!-- Category -->
              <td class="py-4 px-4">
                <span class="inline-block px-3 py-1 rounded-full text-[11.5px] font-manrope font-bold bg-[#ADDFF1]/40 text-[#082838]">
                  {{ p.categoryName }}
                </span>
              </td>

              <!-- Packaging & Grade -->
              <td class="py-4 px-4 text-[#486581]">
                <div v-if="p.packaging && p.packaging[0]" class="font-medium text-[#0D2235]">{{ p.packaging[0].size }} {{ p.packaging[0].unit }}</div>
                <div class="text-[11.5px] text-[#486581]">
                  {{ p.grade || "-" }}
                </div>
              </td>

              <!-- Status Tags -->
              <td class="py-4 px-4">
                <div class="flex flex-col gap-1 items-start">
                  <span v-if="p.isFeatured" class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10.5px] font-manrope font-bold"> ★ Unggulan </span>
                  <span v-if="p.isVerified" class="px-2.5 py-0.5 rounded-full bg-[#A3EEEC]/50 text-[#054E4C] text-[10.5px] font-manrope font-bold"> Terverifikasi </span>
                </div>
              </td>

              <!-- Actions -->
              <td class="py-4 px-6 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink :to="`/products/${p.slug}`" target="_blank" class="p-2 rounded-xl text-[#486581] hover:text-[#0D2235] hover:bg-[#D0F2F9] transition-colors" title="Lihat di Website Publik">
                    <ExternalLink class="w-4 h-4 text-[#89CBDD]" />
                  </NuxtLink>

                  <NuxtLink :to="`/admin/products/${p.id}`" class="p-2 rounded-xl text-[#0D253A] hover:bg-[#D0F2F9] transition-colors" title="Edit Produk">
                    <Edit3 class="w-4 h-4 text-[#082838]" />
                  </NuxtLink>

                  <!-- Delete Button: Only active for Super Admin -->
                  <button v-if="isSuperAdmin" type="button" class="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer" title="Hapus Produk (Super Admin)" @click="handleDeleteProduct(p.id, p.name)">
                    <Trash2 class="w-4 h-4" />
                  </button>
                  <span v-else class="p-2 text-gray-300 cursor-not-allowed" title="Hapus produk dibatasi hanya untuk Super Admin">
                    <Trash2 class="w-4 h-4" />
                  </span>
                </div>
              </td>
            </tr>

            <tr v-if="paginatedProducts.length === 0">
              <td colspan="5" class="py-12 text-center text-[#486581]">Tidak ada produk yang cocok dengan pencarian atau filter.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION CONTROLS BAR -->
      <div class="p-4 sm:p-5 bg-white border-t border-[#D0F2F9]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] font-sans">
        <div class="flex items-center gap-2">
          <span class="text-[#486581] font-medium">Tampilkan:</span>
          <div class="flex items-center gap-1 bg-[#E9F8FF] p-1 rounded-xl">
            <button v-for="size in pageSizeOptions" :key="size" type="button" class="px-2.5 py-1 rounded-lg font-manrope font-bold text-[12px] transition-all cursor-pointer" :class="productsPageSize === size ? 'bg-[#89CBDD] text-[#082838]' : 'text-[#486581] hover:text-[#082838]'" @click="productsPageSize = size">
              {{ size }}
            </button>
          </div>
          <span class="text-[#486581] hidden sm:inline">data per halaman</span>
        </div>

        <div class="text-[#486581] font-medium">
          Menampilkan <strong class="text-[#0D2235]">{{ productsStartRange }}-{{ productsEndRange }}</strong> dari <strong class="text-[#0D2235]">{{ totalProducts }}</strong> produk
        </div>

        <div class="flex items-center gap-1.5">
          <button type="button" class="p-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer" :disabled="productsPage <= 1" title="Halaman Sebelumnya" @click="productsPage--">
            <ChevronLeft class="w-4 h-4" />
          </button>

          <div class="px-3.5 py-1.5 rounded-xl bg-[#D0F2F9]/70 text-[#082838] font-manrope font-bold text-[12.5px]">Hal {{ productsPage }} / {{ totalProductsPages }}</div>

          <button type="button" class="p-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer" :disabled="productsPage >= totalProductsPages" title="Halaman Selanjutnya" @click="productsPage++">
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: TAMBAH PRODUK BARU -->
    <ProductCreateModal :is-open="isProductModalOpen" @close="closeProductModal" @created="handleProductCreated" />
  </div>
</template>
