<!-- @format -->

<script setup lang="ts">
import { ref, computed, watch, defineAsyncComponent } from "vue";
import { Plus, Search, Edit3, Power, ExternalLink, X } from "lucide-vue-next";
import type { Product } from "~/types/catalog";
import { useCatalog } from "~/composables/useCatalog";
import { useAdminAuth } from "~/composables/useAdminAuth";
import { useActionModal } from "~/composables/useActionModal";
import { useProgressiveList } from "~/composables/useProgressiveList";
import { useQuickSearchShortcut } from "~/composables/useKeyboardShortcuts";
import { getAvailabilityBadge } from "~/utils/availability";
import ActionMenuPopover, { type ActionMenuItem } from "~/components/admin/ActionMenuPopover.vue";

const LazyProductFormModal = defineAsyncComponent(() => import("~/components/admin/ProductFormModal.vue"));

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const { isSuperAdmin } = useAdminAuth();
const { refreshCatalog } = useCatalog();
const { showSuccess, showConfirm, showAlert } = useActionModal();

useSeoMeta({
  title: () => `Daftar Produk`,
});

const isProductModalOpen = ref(false);
const hasOpenedModal = ref(false);
const productModalMode = ref<"create" | "edit">("create");
const selectedProduct = ref<any | null>(null);

const openCreateModal = () => {
  productModalMode.value = "create";
  selectedProduct.value = null;
  hasOpenedModal.value = true;
  isProductModalOpen.value = true;
};

const openEditModal = (product: any) => {
  productModalMode.value = "edit";
  selectedProduct.value = product;
  hasOpenedModal.value = true;
  isProductModalOpen.value = true;
};

const closeProductModal = () => {
  isProductModalOpen.value = false;
  selectedProduct.value = null;
  if (route.query.newProduct || route.query.editId) {
    const q = { ...route.query };
    delete q.newProduct;
    delete q.editId;
    router.replace({ query: q });
  }
};

const searchQuery = ref("");
const searchInputRef = ref<HTMLInputElement | null>(null);
const selectedCategory = ref("all");
const statusFilter = ref<"all" | "active" | "inactive">("all");

useQuickSearchShortcut(searchInputRef);

const { data: productsData, refresh: refreshProducts } = await useFetch<Product[]>("/api/products?includeInactive=true");
const { data: categoriesData } = await useFetch<any[]>("/api/categories?includeInactive=true");

const products = computed(() => productsData.value || []);
const categories = computed(() => categoriesData.value || []);

const checkUrlQuery = () => {
  if (route.query.newProduct) {
    openCreateModal();
  } else if (route.query.editId && typeof route.query.editId === "string") {
    const found = products.value.find((p) => p.id === route.query.editId);
    if (found) {
      openEditModal(found);
    }
  }
};

watch(
  () => [route.query.newProduct, route.query.editId, products.value],
  () => {
    checkUrlQuery();
  },
  { immediate: true },
);

const filteredProducts = computed(() => {
  let list = products.value;
  if (selectedCategory.value !== "all") {
    list = list.filter((p) => p.categorySlug === selectedCategory.value);
  }
  if (statusFilter.value === "active") {
    list = list.filter((p) => p.isActive !== false);
  } else if (statusFilter.value === "inactive") {
    list = list.filter((p) => p.isActive === false);
  }
  if (searchQuery.value && searchQuery.value.trim() !== "") {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q)));
  }
  return list;
});

const { visibleItems: visibleProducts, totalCount: totalProducts, hasMore, sentinelRef, loadMore } = useProgressiveList(filteredProducts, 10, 10);

const handleProductSaved = async () => {
  await refreshProducts();
  await refreshCatalog();
  closeProductModal();
};

const handleToggleProductStatus = (product: Product) => {
  if (!isSuperAdmin.value) {
    showAlert("Akses Ditolak", "Hanya Super Admin yang dapat mengubah status aktif produk.");
    return;
  }

  const nextActive = product.isActive === false;
  const actionLabel = nextActive ? "Aktifkan" : "Nonaktifkan";

  showConfirm({
    title: `${actionLabel} Produk?`,
    message: nextActive ? `Produk "${product.name}" akan ditampilkan kembali di katalog publik.` : `Produk "${product.name}" akan disembunyikan dari katalog publik (Soft Delete). Data tetap tersimpan aman.`,
    confirmText: actionLabel,
    cancelText: "Batal",
    isDanger: !nextActive,
    onConfirm: async () => {
      await $fetch(`/api/products/${product.id}`, {
        method: "PUT",
        body: { isActive: nextActive },
      });
      await refreshProducts();
      await refreshCatalog();
      showSuccess(nextActive ? "Produk Diaktifkan" : "Produk Dinonaktifkan", `Status "${product.name}" berhasil diubah.`);
    },
  });
};

const buildProductActions = (product: Product): ActionMenuItem[] => {
  const items: ActionMenuItem[] = [
    {
      id: "view",
      label: "Lihat Detail",
      icon: ExternalLink,
      href: `/products/${product.slug}`,
      target: "_blank",
    },
    {
      id: "edit",
      label: "Edit",
      icon: Edit3,
      onClick: () => openEditModal(product),
    },
  ];

  if (isSuperAdmin.value) {
    const isActive = product.isActive !== false;
    items.push({
      id: "toggle",
      label: isActive ? "Nonaktifkan" : "Aktifkan",
      icon: Power,
      variant: isActive ? "warning" : "success",
      onClick: () => handleToggleProductStatus(product),
    });
  }

  return items;
};
</script>

<template>
  <div class="space-y-5 animate-fade-up">
    <!-- Top Header -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="font-manrope font-extrabold text-xl sm:text-2xl text-[#0D2235]">Daftar Produk</h1>
        <p class="text-xs text-[#486581] mt-0.5">Kelola katalog reagen &amp; instrumen ({{ totalProducts }} item)</p>
      </div>
      <button type="button" class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-xs sm:text-[13px] transition-all shadow-xs cursor-pointer" @click="openCreateModal">
        <Plus class="w-4 h-4" />
        <span>Tambah</span>
      </button>
    </div>

    <!-- Search, Status & Category Filter Controls -->
    <div class="bg-white rounded-xl p-4 space-y-3 shadow-sm shadow-slate-200/50">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div class="relative flex-1 max-w-md">
          <Search class="w-4 h-4 text-[#89CBDD] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input ref="searchInputRef" v-model="searchQuery" type="text" placeholder="Cari nama produk, SKU, brand..." class="w-full pl-9 pr-12 py-2 rounded-xl bg-[#F4FBFE] focus:bg-white text-xs sm:text-[13px] text-[#0D2235] placeholder-[#486581]/70 focus:ring-2 focus:ring-[#89CBDD]/50 outline-none transition-all font-sans" />
          <span v-if="!searchQuery" class="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-[#486581]/75 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none select-none" title="Pintasan: tekan / atau Ctrl+K"> / </span>
          <button v-else type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#486581] hover:text-[#0D2235] p-0.5 cursor-pointer" title="Bersihkan pencarian" @click="searchQuery = ''">
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <button
            v-for="st in [
              { k: 'all', l: 'Semua' },
              { k: 'active', l: 'Aktif' },
              { k: 'inactive', l: 'Nonaktif' },
            ]"
            :key="st.k"
            type="button"
            class="px-3 py-1.5 rounded-xl text-[11px] font-manrope font-bold cursor-pointer transition-colors"
            :class="statusFilter === st.k ? 'bg-[#082838] text-white' : 'bg-[#F4FBFE] text-[#486581] hover:bg-[#E9F8FF]'"
            @click="statusFilter = st.k as any"
          >
            {{ st.l }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        <button type="button" class="px-3 py-1.5 rounded-xl text-[11.5px] font-manrope font-bold whitespace-nowrap transition-all cursor-pointer shrink-0" :class="selectedCategory === 'all' ? 'bg-[#89CBDD] text-[#082838]' : 'bg-[#F4FBFE] text-[#486581] hover:bg-[#E9F8FF]'" @click="selectedCategory = 'all'">Semua ({{ products.length }})</button>
        <button v-for="cat in categories" :key="cat.slug" type="button" class="px-3 py-1.5 rounded-xl text-[11.5px] font-manrope font-bold whitespace-nowrap transition-all cursor-pointer shrink-0" :class="selectedCategory === cat.slug ? 'bg-[#89CBDD] text-[#082838]' : 'bg-[#F4FBFE] text-[#486581] hover:bg-[#E9F8FF]'" @click="selectedCategory = cat.slug">
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- Clean Soft Zebra Table Container (Horizontal scroll on mobile) -->
    <div class="bg-white rounded-xl overflow-hidden shadow-sm shadow-slate-200/50">
      <div class="sm:hidden px-3.5 py-2 bg-[#F4FBFE] border-b border-slate-100 text-[11px] font-manrope font-semibold text-[#1B7E98] flex items-center justify-between">
        <span>Geser tabel ke kanan/kiri</span>
        <span>&larr; &rarr;</span>
      </div>

      <div class="overflow-x-auto touch-pan-x">
        <table class="w-full min-w-[820px] text-left text-xs border-collapse">
          <thead class="bg-[#E9F8FF] text-[#0D253A] text-[11px] font-manrope font-bold uppercase tracking-wider border-b border-slate-100">
            <tr class="divide-x divide-slate-200/60">
              <th class="py-3 px-4 w-[280px] whitespace-nowrap">Produk</th>
              <th class="py-3 px-4 w-[140px] whitespace-nowrap">Kategori</th>
              <th class="py-3 px-4 w-[195px] whitespace-nowrap">Kemasan &amp; Mutu</th>
              <th class="py-3 px-4 w-[115px] whitespace-nowrap">Status</th>
              <th class="py-3 px-4 w-[100px] text-right whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(p, idx) in visibleProducts" :key="p.id" class="divide-x divide-slate-100/90 transition-colors" :class="[idx % 2 === 0 ? 'bg-white hover:bg-[#E9F8FF]/60' : 'bg-[#F4FBFE] hover:bg-[#E9F8FF]', p.isActive === false ? 'opacity-65' : '']">
              <!-- Produk -->
              <td class="py-3 px-4 align-middle">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img :src="p.imageUrl" :alt="p.name" loading="lazy" decoding="async" class="w-full h-full object-contain" />
                  </div>
                  <div class="min-w-0 max-w-[210px]">
                    <div class="font-manrope font-bold text-[#0D2235] hover:text-[#1B7E98] cursor-pointer leading-snug line-clamp-2" @click="openEditModal(p)">
                      {{ p.name }}
                    </div>
                    <div class="text-[11px] text-[#486581] font-mono truncate mt-0.5">{{ p.sku }} &bull; {{ p.brand }}</div>
                  </div>
                </div>
              </td>

              <!-- Kategori -->
              <td class="py-3 px-4 align-middle whitespace-nowrap">
                <span class="inline-block px-2.5 py-1 rounded-md text-[11px] font-manrope font-bold bg-[#ADDFF1]/40 text-[#082838]">
                  {{ p.categoryName }}
                </span>
              </td>

              <!-- Kemasan & Mutu -->
              <td class="py-3 px-4 align-middle text-[#486581]">
                <div v-if="p.packaging && p.packaging[0]" class="font-semibold text-[#0D2235] leading-snug">{{ p.packaging[0].size }} {{ p.packaging[0].unit }}</div>
                <div v-else class="text-[#486581]">-</div>
                <div class="text-[11px] text-[#486581] mt-0.5 leading-snug">
                  {{ p.grade || "-" }}
                </div>
              </td>

              <!-- Status & Dokumen -->
              <td class="py-3 px-4 align-middle whitespace-nowrap">
                <div class="flex flex-col gap-1 items-start">
                  <span class="px-2.5 py-0.5 rounded-md text-[10.5px] font-manrope font-bold" :class="p.isActive !== false ? 'bg-emerald-100/80 text-emerald-800' : 'bg-red-100/80 text-red-700'">
                    {{ p.isActive !== false ? "Aktif" : "Nonaktif" }}
                  </span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-manrope font-bold" :class="getAvailabilityBadge(p.availabilityStatus, p.leadTime).badgeClass">
                    <!-- <span class="w-1.5 h-1.5 rounded-sm" :class="getAvailabilityBadge(p.availabilityStatus, p.leadTime).dotClass" /> -->
                    <span>{{ getAvailabilityBadge(p.availabilityStatus, p.leadTime).shortLabel }}</span>
                  </span>
                  <span v-if="p.isFeatured" class="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-800 text-[10px] font-manrope font-bold">Unggulan</span>
                  <span v-if="p.documents && p.documents.length > 0" class="text-[10.5px] font-mono text-[#1B7E98]"> {{ p.documents.length }} Dok </span>
                </div>
              </td>

              <!-- Satu Tombol Aksi dengan Popover Dinamis -->
              <td class="py-3 px-4 align-middle text-right whitespace-nowrap">
                <ActionMenuPopover :items="buildProductActions(p)" />
              </td>
            </tr>

            <tr v-if="visibleProducts.length === 0">
              <td colspan="5" class="py-10 text-center text-[#486581] text-xs bg-white">Tidak ada produk yang cocok dengan pencarian atau filter.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Lazy Loading Sentinel & Footer -->
      <div class="px-4 py-3.5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
        <div class="text-[#486581]">
          Menampilkan <strong class="text-[#0D2235]">{{ visibleProducts.length }}</strong> dari <strong class="text-[#0D2235]">{{ totalProducts }}</strong> produk
        </div>
        <button v-if="hasMore" type="button" class="px-3 py-1.5 rounded-md bg-[#F4FBFE] hover:bg-[#E9F8FF] text-[#082838] font-manrope font-bold text-xs cursor-pointer" @click="loadMore">Muat Lainnya</button>
      </div>
      <div ref="sentinelRef" class="h-1 w-full" aria-hidden="true" />
    </div>

    <!-- Lazy Loaded Modal -->
    <LazyProductFormModal v-if="hasOpenedModal" :is-open="isProductModalOpen" :mode="productModalMode" :product="selectedProduct" @close="closeProductModal" @saved="handleProductSaved" />
  </div>
</template>
