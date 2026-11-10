<!-- @format -->

<script setup lang="ts">
import { ref, computed } from "vue";
import { Plus, Trash2, Edit3, Layers, AlertCircle, X } from "lucide-vue-next";
import type { Product } from "~/types/catalog";
import { useCatalog } from "~/composables/useCatalog";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { useAdminAuth } from "~/composables/useAdminAuth";
import { useActionModal } from "~/composables/useActionModal";

definePageMeta({
  layout: "admin",
});

const { settings } = useSiteSettings();
const { isSuperAdmin } = useAdminAuth();
const { refreshCatalog } = useCatalog();
const { showSuccess, showConfirm, showAlert } = useActionModal();

useSeoMeta({
  title: () => `Kategori Produk`,
});

// Fetch categories & products for counting
const { data: categoriesData, refresh: refreshCategories } = await useFetch<any[]>("/api/categories");
const { data: productsData } = await useFetch<Product[]>("/api/products");

const categories = computed(() => categoriesData.value || []);
const products = computed(() => productsData.value || []);

// Modal State (Create & Edit)
const showCategoryModal = ref(false);
const modalMode = ref<"create" | "edit">("create");
const selectedCatId = ref<string>("");
const catName = ref("");
const catDescription = ref("");
const catIsInstrument = ref(false);
const isSavingCategory = ref(false);
const categoryActionError = ref<string | null>(null);

const openCreateCategoryModal = () => {
  modalMode.value = "create";
  selectedCatId.value = "";
  catName.value = "";
  catDescription.value = "";
  catIsInstrument.value = false;
  categoryActionError.value = null;
  showCategoryModal.value = true;
};

const openEditCategoryModal = (cat: any) => {
  modalMode.value = "edit";
  selectedCatId.value = cat.id;
  catName.value = cat.name;
  catDescription.value = cat.description || "";
  catIsInstrument.value = Boolean(cat.isInstrument);
  categoryActionError.value = null;
  showCategoryModal.value = true;
};

const closeCategoryModal = () => {
  showCategoryModal.value = false;
};

const handleSaveCategory = async () => {
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
      showCategoryModal.value = false;
      showSuccess("Data Berhasil Disimpan", `Kategori "${catName.value}" telah ditambahkan.`);
    }

    await refreshCategories();
    await refreshCatalog();
  } catch (err: any) {
    categoryActionError.value = err.data?.statusMessage || "Gagal menyimpan kategori.";
  } finally {
    isSavingCategory.value = false;
  }
};

const handleDeleteCategory = (cat: any) => {
  if (!isSuperAdmin.value) {
    showAlert({
      title: "Akses Ditolak",
      message: "Hanya Super Admin yang diizinkan untuk menghapus kategori.",
    });
    return;
  }

  const linkedCount = products.value.filter((p) => p.categorySlug === cat.slug).length;
  if (linkedCount > 0) {
    showAlert({
      title: "Kategori Masih Digunakan",
      message: `Tidak dapat menghapus kategori "${cat.name}" karena masih memiliki ${linkedCount} produk aktif. Harap ubah kategori produk terkait terlebih dahulu.`,
    });
    return;
  }

  showConfirm({
    title: "Konfirmasi Hapus Kategori",
    message: `Apakah Anda yakin ingin menghapus kategori "${cat.name}"? Tindakan ini tidak dapat dibatalkan.`,
    confirmText: "Ya, Hapus",
    cancelText: "Batal",
    onConfirm: async () => {
      await $fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
      await refreshCategories();
      await refreshCatalog();
      showSuccess("Data Berhasil Dihapus", `Kategori "${cat.name}" telah dihapus.`);
    },
  });
};
</script>

<template>
  <div class="space-y-8 animate-fade-up">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
      <!-- Top Action Buttons -->
      <div class="flex flex-wrap items-center gap-3 shrink-0 self-start sm:self-auto">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13.5px] transition-all shadow-xs hover:shadow-md cursor-pointer"
          @click="openCreateCategoryModal"
        >
          <Plus class="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>
    </div>

    <!-- Categories Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="cat in categories"
        :key="cat.slug"
        class="bg-white rounded-3xl p-6 border border-[#D0F2F9]/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
      >
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span
              class="text-[10.5px] font-manrope font-extrabold uppercase px-2.5 py-0.5 rounded-full"
              :class="cat.isInstrument ? 'bg-[#ADDFF1]/40 text-[#082838]' : 'bg-[#A3EEEC]/50 text-[#054E4C]'"
            >
              {{ cat.isInstrument ? "Alat / Instrumen" : "Reagen & Bahan" }}
            </span>
            <span class="text-[11px] font-mono text-[#486581]">{{ cat.slug }}</span>
          </div>

          <h4 class="font-manrope font-bold text-[17px] text-[#0D2235]">
            {{ cat.name }}
          </h4>
          <p class="text-[13px] text-[#486581] leading-relaxed">
            {{ cat.description || "Tidak ada deskripsi tambahan." }}
          </p>
        </div>

        <div class="pt-4 border-t border-[#D0F2F9]/40 flex items-center justify-between text-[12.5px]">
          <span class="font-medium text-[#486581]">
            <strong class="text-[#0D2235]">{{ products.filter((p) => p.categorySlug === cat.slug).length }}</strong> produk aktif
          </span>

          <div class="flex items-center gap-2">
            <!-- Edit Button via Modal -->
            <button
              type="button"
              class="text-[#082838] hover:text-[#1B7E98] font-manrope font-bold text-[12px] flex items-center gap-1 cursor-pointer transition-colors p-1.5 rounded-xl hover:bg-[#E9F8FF]"
              title="Edit Kategori"
              @click="openEditCategoryModal(cat)"
            >
              <Edit3 class="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <!-- Delete Button via Modal Confirm -->
            <button
              v-if="isSuperAdmin"
              type="button"
              class="text-red-600 hover:text-red-800 font-manrope font-bold text-[12px] flex items-center gap-1 cursor-pointer transition-colors p-1.5 rounded-xl hover:bg-red-50"
              title="Hapus Kategori (Super Admin)"
              @click="handleDeleteCategory(cat)"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: TAMBAH / EDIT KATEGORI -->
    <Teleport to="body">
      <div v-if="showCategoryModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-[#0D253A]/40 backdrop-blur-xs" @click="closeCategoryModal" />
        <div class="relative bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#ADDFF1]/50 space-y-5 animate-scale-up z-10 text-[#0D2235]">
          <div class="flex items-center justify-between pb-2 border-b border-[#D0F2F9]/60">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-2xl bg-[#A3EEEC]/50 text-[#054E4C] flex items-center justify-center">
                <Layers class="w-4 h-4" />
              </div>
              <h3 class="font-manrope font-bold text-[16px]">
                {{ modalMode === "edit" ? "Edit Kategori Produk" : "Tambah Kategori Baru" }}
              </h3>
            </div>
            <button type="button" class="p-1 rounded-xl text-[#486581] hover:text-[#0D2235] cursor-pointer" @click="closeCategoryModal">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div v-if="categoryActionError" class="p-3 rounded-2xl bg-red-50 text-red-800 text-[12.5px] flex items-center gap-2">
            <AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
            <span>{{ categoryActionError }}</span>
          </div>

          <div class="space-y-4">
            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-bold text-[#0D253A]">
                Nama Kategori <span class="text-red-500">*</span>
              </label>
              <input
                v-model="catName"
                type="text"
                placeholder="Contoh: Rapid Test Kit, Kimia Klinik, dll"
                class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[13.5px] text-[#0D2235] outline-none focus:ring-2 focus:ring-[#89CBDD]/40 border border-transparent focus:border-[#89CBDD] transition-all"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-bold text-[#0D253A]">Jenis Sediaan</label>
              <div class="grid grid-cols-2 gap-2 pt-1">
                <label
                  class="p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center gap-1"
                  :class="!catIsInstrument ? 'bg-[#A3EEEC]/30 border-[#054E4C] text-[#054E4C] font-bold' : 'bg-[#E9F8FF]/30 border-transparent text-[#486581]'"
                >
                  <input v-model="catIsInstrument" type="radio" :value="false" class="sr-only" />
                  <span class="text-[13px] font-manrope">Reagen / Bahan</span>
                  <span class="text-[10px] font-normal opacity-75">Bahan uji & konsumabel</span>
                </label>

                <label
                  class="p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center gap-1"
                  :class="catIsInstrument ? 'bg-[#ADDFF1]/40 border-[#082838] text-[#082838] font-bold' : 'bg-[#E9F8FF]/30 border-transparent text-[#486581]'"
                >
                  <input v-model="catIsInstrument" type="radio" :value="true" class="sr-only" />
                  <span class="text-[13px] font-manrope">Alat / Mesin</span>
                  <span class="text-[10px] font-normal opacity-75">Instrumen & analyzer</span>
                </label>
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-semibold text-[#0D253A]">Deskripsi Singkat (Opsional)</label>
              <textarea
                v-model="catDescription"
                rows="2"
                placeholder="Penjelasan fungsi lini kategori..."
                class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[13.5px] text-[#0D2235] outline-none focus:ring-2 focus:ring-[#89CBDD]/40 border border-transparent focus:border-[#89CBDD] transition-all resize-none"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              class="px-5 py-2.5 rounded-2xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13px] cursor-pointer"
              @click="closeCategoryModal"
            >
              Batal
            </button>
            <button
              type="button"
              :disabled="isSavingCategory"
              class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13px] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              @click="handleSaveCategory"
            >
              <span>{{ isSavingCategory ? "Menyimpan..." : modalMode === "edit" ? "Simpan Perubahan" : "Simpan Kategori" }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
