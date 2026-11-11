<!-- @format -->

<script setup lang="ts">
import { ref, computed } from "vue";
import { Plus, Power, Edit3, Layers, AlertCircle, X, RotateCcw } from "lucide-vue-next";
import TableControlBar from "~/components/admin/TableControlBar.vue";
import TablePaginationFooter from "~/components/admin/TablePaginationFooter.vue";
import ActionMenuPopover, { type ActionMenuItem } from "~/components/admin/ActionMenuPopover.vue";
import type { Product } from "~/types/catalog";
import { useCatalog } from "~/composables/useCatalog";
import { useAdminAuth } from "~/composables/useAdminAuth";
import { useActionModal } from "~/composables/useActionModal";
import { useTablePagination } from "~/composables/useTablePagination";
import { useEscapeDismiss, useModalAutoFocus } from "~/composables/useKeyboardShortcuts";

definePageMeta({
  layout: "admin",
});

const { isSuperAdmin } = useAdminAuth();
const { refreshCatalog } = useCatalog();
const { showSuccess, showConfirm, showAlert } = useActionModal();

useSeoMeta({
  title: () => `Kategori Produk`,
});

const { data: categoriesData, refresh: refreshCategories } = await useFetch<any[]>("/api/categories?includeInactive=true");
const { data: productsData } = await useFetch<Product[]>("/api/products?includeInactive=true");

const categories = computed(() => categoriesData.value || []);
const products = computed(() => productsData.value || []);

const searchQuery = ref("");
const statusFilter = ref<"all" | "active" | "inactive">("all");

const filteredCategories = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return categories.value.filter((cat: any) => {
    if (statusFilter.value === "active" && cat.isActive === false) return false;
    if (statusFilter.value === "inactive" && cat.isActive !== false) return false;
    if (!q) return true;
    const typeText = cat.isInstrument ? "alat mesin instrumen" : "reagen bahan";
    const haystack = [cat.name, cat.slug, cat.description || "", typeText].join(" ").toLowerCase();
    return haystack.includes(q);
  });
});

const { pageSizeOptions, pageSize, currentPage, totalItems: totalFilteredCategories, totalPages, paginatedItems: paginatedCategories, startRange, endRange, goToPage, prevPage, nextPage } = useTablePagination(filteredCategories, { defaultPageSize: 10 });

const getActiveProductCount = (slug: string) => {
  return products.value.filter((p) => p.categorySlug === slug && p.isActive !== false).length;
};

interface CategoryDraft {
  name: string;
  description: string;
  isInstrument: boolean;
}

const draftsCache = ref<Record<string, CategoryDraft>>({});
const showCategoryModal = ref(false);
const categoryModalRef = ref<HTMLElement | null>(null);
const modalMode = ref<"create" | "edit">("create");
const selectedCatId = ref<string>("");
const selectedCatOriginal = ref<any | null>(null);
const catName = ref("");
const catDescription = ref("");
const catIsInstrument = ref(false);
const isSavingCategory = ref(false);
const categoryActionError = ref<string | null>(null);

const activeDraftKey = computed(() => (modalMode.value === "edit" && selectedCatId.value ? `edit:${selectedCatId.value}` : "create"));

const syncDraft = () => {
  draftsCache.value[activeDraftKey.value] = {
    name: catName.value,
    description: catDescription.value,
    isInstrument: catIsInstrument.value,
  };
};

const openCreateCategoryModal = () => {
  modalMode.value = "create";
  selectedCatId.value = "";
  selectedCatOriginal.value = null;
  categoryActionError.value = null;

  const saved = draftsCache.value.create;
  if (saved) {
    catName.value = saved.name;
    catDescription.value = saved.description;
    catIsInstrument.value = saved.isInstrument;
  } else {
    catName.value = "";
    catDescription.value = "";
    catIsInstrument.value = false;
  }
  showCategoryModal.value = true;
};

const openEditCategoryModal = (cat: any) => {
  modalMode.value = "edit";
  selectedCatId.value = cat.id;
  selectedCatOriginal.value = cat;
  categoryActionError.value = null;

  const key = `edit:${cat.id}`;
  const saved = draftsCache.value[key];
  if (saved) {
    catName.value = saved.name;
    catDescription.value = saved.description;
    catIsInstrument.value = saved.isInstrument;
  } else {
    catName.value = cat.name;
    catDescription.value = cat.description || "";
    catIsInstrument.value = Boolean(cat.isInstrument);
  }
  showCategoryModal.value = true;
};

const closeCategoryModal = () => {
  if (isSavingCategory.value) return;
  syncDraft();
  showCategoryModal.value = false;
};

useModalAutoFocus(() => showCategoryModal.value, categoryModalRef);
useEscapeDismiss(() => showCategoryModal.value, closeCategoryModal);

const handleResetCategoryModal = () => {
  if (isSavingCategory.value) return;
  if (modalMode.value === "edit" && selectedCatOriginal.value) {
    catName.value = selectedCatOriginal.value.name || "";
    catDescription.value = selectedCatOriginal.value.description || "";
    catIsInstrument.value = Boolean(selectedCatOriginal.value.isInstrument);
  } else {
    catName.value = "";
    catDescription.value = "";
    catIsInstrument.value = false;
  }
  delete draftsCache.value[activeDraftKey.value];
  categoryActionError.value = null;
};

const handleSaveCategory = async () => {
  if (isSavingCategory.value) return;
  if (!catName.value.trim()) {
    categoryActionError.value = "Nama kategori wajib diisi.";
    return;
  }
  isSavingCategory.value = true;
  categoryActionError.value = null;
  try {
    if (modalMode.value === "edit") {
      await $fetch(`/api/categories/${selectedCatId.value}`, {
        method: "PUT",
        body: {
          name: catName.value.trim(),
          description: catDescription.value.trim(),
          isInstrument: catIsInstrument.value,
        },
      });
      delete draftsCache.value[activeDraftKey.value];
      showCategoryModal.value = false;
      showSuccess("Data Berhasil Diedit", `Kategori "${catName.value}" telah diperbarui.`);
    } else {
      await $fetch("/api/categories", {
        method: "POST",
        body: {
          name: catName.value.trim(),
          description: catDescription.value.trim(),
          isInstrument: catIsInstrument.value,
        },
      });
      delete draftsCache.value.create;
      catName.value = "";
      catDescription.value = "";
      catIsInstrument.value = false;
      showCategoryModal.value = false;
      showSuccess("Data Berhasil Disimpan", "Kategori baru berhasil ditambahkan.");
    }

    await refreshCategories();
    await refreshCatalog();
  } catch (err: any) {
    categoryActionError.value = err.data?.statusMessage || "Gagal menyimpan kategori.";
  } finally {
    isSavingCategory.value = false;
  }
};

const handleToggleCategoryStatus = (cat: any) => {
  if (!isSuperAdmin.value) {
    showAlert("Akses Ditolak", "Hanya Super Admin yang dapat mengubah status aktif kategori.");
    return;
  }

  const nextActive = cat.isActive === false;
  const actionLabel = nextActive ? "Aktifkan" : "Nonaktifkan";

  showConfirm({
    title: `${actionLabel} Kategori?`,
    message: nextActive ? `Kategori "${cat.name}" akan ditampilkan kembali di katalog publik.` : `Kategori "${cat.name}" akan disembunyikan sementara (Soft Delete). Data tetap aman tersimpan.`,
    confirmText: actionLabel,
    cancelText: "Batal",
    isDanger: !nextActive,
    onConfirm: async () => {
      await $fetch(`/api/categories/${cat.id}`, {
        method: "PUT",
        body: { isActive: nextActive },
      });
      await refreshCategories();
      await refreshCatalog();
      showSuccess(nextActive ? "Kategori Diaktifkan" : "Kategori Dinonaktifkan", `Status "${cat.name}" berhasil diperbarui.`);
    },
  });
};

const getRowActions = (cat: any): ActionMenuItem[] => {
  const actions: ActionMenuItem[] = [
    {
      id: "edit",
      label: "Edit",
      icon: Edit3,
      variant: "default",
      onClick: () => openEditCategoryModal(cat),
    },
  ];

  if (isSuperAdmin.value) {
    const isActive = cat.isActive !== false;
    actions.push({
      id: "toggle-status",
      label: isActive ? "Nonaktifkan" : "Aktifkan",
      icon: Power,
      variant: isActive ? "warning" : "success",
      onClick: () => handleToggleCategoryStatus(cat),
    });
  }

  return actions;
};
</script>

<template>
  <div class="space-y-5 animate-fade-up">
    <!-- Header Page -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="font-manrope font-extrabold text-xl sm:text-2xl text-[#0D2235]">Kategori Produk</h1>
        <p class="text-xs text-[#486581] mt-0.5">Kelola pengelompokan sediaan reagen & alat ({{ categories.length }} kategori)</p>
      </div>

      <button type="button" class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-xs sm:text-[13px] transition-all shadow-xs cursor-pointer" @click="openCreateCategoryModal">
        <Plus class="w-4 h-4" />
        <span>Tambah</span>
      </button>
    </div>

    <!-- Table Card (Excel-like striped, responsive horizontal scroll, unified controls & pagination) -->
    <div class="bg-white rounded-xl shadow-xs overflow-hidden">
      <TableControlBar v-model:page-size="pageSize" v-model:search-query="searchQuery" :page-size-options="pageSizeOptions" search-placeholder="Cari kategori, slug, deskripsi...">
        <template #filters>
          <div class="inline-flex items-center gap-1 p-1 rounded-xl bg-[#E9F8FF]/70">
            <button
              v-for="tab in [
                { id: 'all', label: 'Semua' },
                { id: 'active', label: 'Aktif' },
                { id: 'inactive', label: 'Nonaktif' },
              ]"
              :key="tab.id"
              type="button"
              class="px-2.5 py-1 rounded-lg text-[11.5px] font-manrope font-bold transition-colors cursor-pointer whitespace-nowrap"
              :class="statusFilter === tab.id ? 'bg-white text-[#082838] shadow-xs' : 'text-[#486581] hover:text-[#082838]'"
              @click="statusFilter = tab.id as any"
            >
              {{ tab.label }}
            </button>
          </div>
        </template>
      </TableControlBar>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[780px] text-left border-collapse">
          <thead>
            <tr class="bg-[#D0F2F9]/60 border-b border-[#89CBDD]/25 divide-x divide-[#89CBDD]/20 text-[11px] font-manrope font-extrabold uppercase tracking-wider text-[#082838]">
              <th class="px-4 py-3 whitespace-nowrap">Kategori</th>
              <th class="px-4 py-3 whitespace-nowrap">Jenis Sediaan</th>
              <th class="px-4 py-3 whitespace-nowrap">Slug</th>
              <th class="px-4 py-3 whitespace-nowrap text-center">Produk Aktif</th>
              <th class="px-4 py-3 whitespace-nowrap">Status</th>
              <th class="px-4 py-3 whitespace-nowrap text-right">Aksi</th>
            </tr>
          </thead>

          <tbody v-if="paginatedCategories.length > 0" class="divide-y divide-slate-100 text-[13px]">
            <tr v-for="(cat, idx) in paginatedCategories" :key="cat.id || cat.slug" class="transition-colors divide-x divide-slate-100/90 hover:bg-[#E9F8FF]/60" :class="[idx % 2 === 0 ? 'bg-white' : 'bg-[#F4FBFE]', cat.isActive === false ? 'opacity-65' : '']">
              <!-- Kategori & Deskripsi -->
              <td class="px-4 py-3 max-w-[290px]">
                <div class="font-manrope font-bold text-[#0D2235] leading-snug">
                  {{ cat.name }}
                </div>
                <p class="text-[11.5px] text-[#486581] line-clamp-2 mt-0.5 leading-relaxed">
                  {{ cat.description || "Tidak ada deskripsi tambahan." }}
                </p>
              </td>

              <!-- Jenis Sediaan -->
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-manrope font-bold" :class="cat.isInstrument ? 'bg-[#ADDFF1]/35 text-[#082838]' : 'bg-[#A3EEEC]/40 text-[#054E4C]'">
                  {{ cat.isInstrument ? "Alat / Instrumen" : "Reagen & Bahan" }}
                </span>
              </td>

              <!-- Slug -->
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="px-2 py-1 rounded-md bg-slate-100/80 text-[#486581] font-mono text-[11.5px]">
                  {{ cat.slug }}
                </span>
              </td>

              <!-- Jumlah Produk Aktif -->
              <td class="px-4 py-3 whitespace-nowrap text-center">
                <span class="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-md bg-[#E9F8FF] text-[#082838] font-manrope font-bold text-xs">
                  {{ getActiveProductCount(cat.slug) }}
                </span>
              </td>

              <!-- Status -->
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-manrope font-bold" :class="cat.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">
                  {{ cat.isActive !== false ? "Aktif" : "Nonaktif" }}
                </span>
              </td>

              <!-- Single Aksi Popover Button -->
              <td class="px-4 py-3 whitespace-nowrap text-right">
                <ActionMenuPopover :items="getRowActions(cat)" />
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr>
              <td colspan="6" class="px-4 py-12 text-center text-xs text-[#486581]">Tidak ada kategori yang sesuai dengan filter atau pencarian saat ini.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <TablePaginationFooter :current-page="currentPage" :total-pages="totalPages" :total-items="totalFilteredCategories" :start-range="startRange" :end-range="endRange" @prev="prevPage" @next="nextPage" @go="goToPage" />
    </div>

    <!-- MODAL: TAMBAH / EDIT KATEGORI (State Retention + Checkbox UI + Keyboard UX) -->
    <Teleport to="body">
      <div v-if="showCategoryModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
        <div class="fixed inset-0 bg-[#0D253A]/40 backdrop-blur-xs" @click="closeCategoryModal" />
        <div ref="categoryModalRef" class="relative bg-white rounded-xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up z-10 text-[#0D2235]" @click.stop>
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-[#A3EEEC]/50 text-[#054E4C] flex items-center justify-center">
                <Layers class="w-4 h-4" />
              </div>
              <h3 id="category-modal-title" class="font-manrope font-bold text-[15px]">
                {{ modalMode === "edit" ? "Edit Kategori" : "Tambah Kategori" }}
              </h3>
            </div>
            <button type="button" :disabled="isSavingCategory" class="p-1.5 rounded-xl text-[#486581] hover:text-[#0D2235] hover:bg-[#E9F8FF] cursor-pointer disabled:opacity-50" title="Tutup (Esc)" @click="closeCategoryModal">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div v-if="categoryActionError" class="p-3 rounded-xl bg-red-50 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
            <span>{{ categoryActionError }}</span>
          </div>

          <form class="space-y-4" @submit.prevent="handleSaveCategory">
            <fieldset :disabled="isSavingCategory" class="space-y-4 min-w-0">
              <div class="space-y-1">
                <label class="block text-xs font-manrope font-bold text-[#0D253A]"> Nama Kategori <span class="text-red-500">*</span> </label>
                <input v-model="catName" type="text" placeholder="Contoh: Rapid Test Kit, Kimia Klinik" class="w-full px-3.5 py-2.5 rounded-xl bg-[#E9F8FF]/60 focus:bg-white text-[13px] text-[#0D2235] outline-none ring-1 ring-transparent focus:ring-[#89CBDD] transition-all" @input="syncDraft" />
              </div>

              <!-- Checkbox UI: Jenis Sediaan -->
              <div class="space-y-1.5">
                <label class="block text-xs font-manrope font-bold text-[#0D253A]">Jenis Sediaan</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                  <label class="p-3 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 ring-1" :class="!catIsInstrument ? 'bg-[#A3EEEC]/25 ring-[#054E4C]/30 text-[#054E4C]' : 'bg-[#E9F8FF]/40 ring-black/5 text-[#486581] hover:bg-[#E9F8FF]/70'">
                    <input
                      type="checkbox"
                      :checked="!catIsInstrument"
                      class="w-4 h-4 mt-0.5 accent-[#054E4C] rounded shrink-0 cursor-pointer"
                      @change="
                        catIsInstrument = false;
                        syncDraft();
                      "
                    />
                    <div>
                      <span class="block text-xs font-manrope font-bold">Reagen / Bahan</span>
                      <span class="block text-[10.5px] opacity-75">Bahan uji & konsumabel</span>
                    </div>
                  </label>

                  <label class="p-3 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 ring-1" :class="catIsInstrument ? 'bg-[#ADDFF1]/35 ring-[#082838]/30 text-[#082838]' : 'bg-[#E9F8FF]/40 ring-black/5 text-[#486581] hover:bg-[#E9F8FF]/70'">
                    <input
                      type="checkbox"
                      :checked="catIsInstrument"
                      class="w-4 h-4 mt-0.5 accent-[#082838] rounded shrink-0 cursor-pointer"
                      @change="
                        catIsInstrument = true;
                        syncDraft();
                      "
                    />
                    <div>
                      <span class="block text-xs font-manrope font-bold">Alat / Mesin</span>
                      <span class="block text-[10.5px] opacity-75">Instrumen & analyzer</span>
                    </div>
                  </label>
                </div>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-manrope font-semibold text-[#0D253A]"> Deskripsi Singkat <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span> </label>
                <textarea v-model="catDescription" rows="2" placeholder="Penjelasan fungsi lini kategori... (Ctrl+Enter untuk simpan)" class="w-full px-3.5 py-2.5 rounded-xl bg-[#E9F8FF]/60 focus:bg-white text-[13px] text-[#0D2235] outline-none ring-1 ring-transparent focus:ring-[#89CBDD] transition-all resize-none" @input="syncDraft" @keydown.ctrl.enter.prevent="handleSaveCategory" @keydown.meta.enter.prevent="handleSaveCategory" />
              </div>
            </fieldset>

            <div class="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <button type="button" :disabled="isSavingCategory" class="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-[#486581] font-manrope font-semibold text-xs cursor-pointer transition-colors disabled:opacity-50" @click="handleResetCategoryModal">
                <RotateCcw class="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <div class="flex items-center gap-2">
                <button type="button" :disabled="isSavingCategory" class="px-4 py-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-xs cursor-pointer transition-colors disabled:opacity-50" @click="closeCategoryModal">Batal</button>
                <button type="submit" :disabled="isSavingCategory" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer">
                  <span>{{ isSavingCategory ? "Menyimpan..." : "Simpan" }}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
