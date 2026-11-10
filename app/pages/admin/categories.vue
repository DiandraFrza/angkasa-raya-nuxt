<!-- @format -->

<script setup lang="ts">
import { ref, computed } from "vue";
import { Plus, Trash2, ExternalLink, Layers, CheckCircle2, AlertCircle, X } from "lucide-vue-next";
import type { Product } from "~/types/catalog";
import { useCatalog } from "~/composables/useCatalog";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { useAdminAuth } from "~/composables/useAdminAuth";

definePageMeta({
  layout: "admin",
});

const { settings } = useSiteSettings();
const { isSuperAdmin } = useAdminAuth();
const { refreshCatalog } = useCatalog();

useSeoMeta({
  title: () => `Kategori Produk`,
});

const successMessage = ref<string | null>(null);
const deleteError = ref<string | null>(null);

// Fetch categories & products for counting
const { data: categoriesData, refresh: refreshCategories } = await useFetch<any[]>("/api/categories");
const { data: productsData } = await useFetch<Product[]>("/api/products");

const categories = computed(() => categoriesData.value || []);
const products = computed(() => productsData.value || []);

// Modal State
const showCategoryModal = ref(false);
const newCatName = ref("");
const newCatDescription = ref("");
const newCatIsInstrument = ref(false);
const isSavingCategory = ref(false);
const categoryActionError = ref<string | null>(null);

const openCategoryModal = () => {
  newCatName.value = "";
  newCatDescription.value = "";
  newCatIsInstrument.value = false;
  categoryActionError.value = null;
  showCategoryModal.value = true;
};

const closeCategoryModal = () => {
  showCategoryModal.value = false;
};

const handleAddCategory = async () => {
  if (!newCatName.value.trim()) {
    categoryActionError.value = "Nama kategori wajib diisi.";
    return;
  }
  isSavingCategory.value = true;
  categoryActionError.value = null;
  try {
    const res = await $fetch<{ success: boolean; message: string }>("/api/categories", {
      method: "POST",
      body: {
        name: newCatName.value.trim(),
        description: newCatDescription.value.trim(),
        isInstrument: newCatIsInstrument.value,
      },
    });
    successMessage.value = res.message || "Kategori baru berhasil ditambahkan.";
    newCatName.value = "";
    newCatDescription.value = "";
    newCatIsInstrument.value = false;
    showCategoryModal.value = false;
    await refreshCategories();
    await refreshCatalog();
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  } catch (err: any) {
    categoryActionError.value = err.data?.statusMessage || "Gagal menambahkan kategori.";
  } finally {
    isSavingCategory.value = false;
  }
};

const handleDeleteCategory = async (cat: any) => {
  if (!isSuperAdmin.value) {
    alert("Hanya Super Admin yang diizinkan untuk menghapus kategori.");
    return;
  }

  const linkedCount = products.value.filter((p) => p.categorySlug === cat.slug).length;
  if (linkedCount > 0) {
    alert(`Tidak dapat menghapus kategori "${cat.name}" karena masih memiliki ${linkedCount} produk aktif. Harap ubah kategori produk terkait terlebih dahulu.`);
    return;
  }

  if (!confirm(`Hapus kategori "${cat.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
    return;
  }

  deleteError.value = null;
  try {
    await $fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
    successMessage.value = `Kategori "${cat.name}" berhasil dihapus.`;
    await refreshCategories();
    await refreshCatalog();
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  } catch (err: any) {
    deleteError.value = err.data?.statusMessage || "Gagal menghapus kategori.";
  }
};
</script>

<template>
  <div class="space-y-8 animate-fade-up">
    <!-- Header Page: Clean, Static & Semantic -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
      <!-- Top Action Buttons -->
      <div class="flex flex-wrap items-center gap-3 shrink-0 self-start sm:self-auto">
        <!-- <NuxtLink to="/products" target="_blank" class="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13.5px] transition-colors shadow-xs">
          <ExternalLink class="w-4 h-4 text-[#89CBDD]" />
          <span>Lihat Katalog Publik</span>
        </NuxtLink> -->

        <button type="button" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13.5px] transition-all shadow-xs hover:shadow-md cursor-pointer" @click="openCategoryModal">
          <Plus class="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
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

    <!-- Categories Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="cat in categories" :key="cat.slug" class="bg-white rounded-3xl p-6 border border-[#D0F2F9]/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10.5px] font-manrope font-extrabold uppercase px-2.5 py-0.5 rounded-full" :class="cat.isInstrument ? 'bg-[#ADDFF1]/40 text-[#082838]' : 'bg-[#A3EEEC]/50 text-[#054E4C]'">
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

          <button v-if="isSuperAdmin" type="button" class="text-red-600 hover:text-red-800 font-manrope font-bold text-[12px] flex items-center gap-1 cursor-pointer transition-colors" title="Hapus Kategori (Super Admin)" @click="handleDeleteCategory(cat)">
            <Trash2 class="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: TAMBAH KATEGORI BARU -->
    <Teleport to="body">
      <div v-if="showCategoryModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-[#0D253A]/40 backdrop-blur-xs" @click="closeCategoryModal" />
        <div class="relative bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#ADDFF1]/50 space-y-5 animate-scale-up z-10 text-[#0D2235]">
          <div class="flex items-center justify-between pb-2 border-b border-[#D0F2F9]/60">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-2xl bg-[#A3EEEC]/50 text-[#054E4C] flex items-center justify-center">
                <Layers class="w-4 h-4" />
              </div>
              <h3 class="font-manrope font-bold text-[16px]">Tambah Kategori Produk</h3>
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
              <label class="block text-[13px] font-manrope font-bold text-[#0D253A]"> Nama Kategori <span class="text-red-500">*</span> </label>
              <input v-model="newCatName" type="text" placeholder="Contoh: Rapid Test Kit, Kimia Klinik, dll" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[13.5px] text-[#0D2235] outline-none focus:ring-2 focus:ring-[#89CBDD]/40 border border-transparent focus:border-[#89CBDD] transition-all" />
            </div>

            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-bold text-[#0D253A]">Jenis Sediaan</label>
              <div class="grid grid-cols-2 gap-2 pt-1">
                <label class="p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center gap-1" :class="!newCatIsInstrument ? 'bg-[#A3EEEC]/30 border-[#054E4C] text-[#054E4C] font-bold' : 'bg-[#E9F8FF]/30 border-transparent text-[#486581]'">
                  <input v-model="newCatIsInstrument" type="radio" :value="false" class="sr-only" />
                  <span class="text-[13px] font-manrope">Reagen / Bahan</span>
                  <span class="text-[10px] font-normal opacity-75">Bahan uji & konsumabel</span>
                </label>

                <label class="p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center gap-1" :class="newCatIsInstrument ? 'bg-[#ADDFF1]/40 border-[#082838] text-[#082838] font-bold' : 'bg-[#E9F8FF]/30 border-transparent text-[#486581]'">
                  <input v-model="newCatIsInstrument" type="radio" :value="true" class="sr-only" />
                  <span class="text-[13px] font-manrope">Alat / Mesin</span>
                  <span class="text-[10px] font-normal opacity-75">Instrumen & analyzer</span>
                </label>
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-semibold text-[#0D253A]">Deskripsi Singkat (Opsional)</label>
              <textarea v-model="newCatDescription" rows="2" placeholder="Penjelasan fungsi lini kategori..." class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[13.5px] text-[#0D2235] outline-none focus:ring-2 focus:ring-[#89CBDD]/40 border border-transparent focus:border-[#89CBDD] transition-all resize-none" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button type="button" class="px-5 py-2.5 rounded-2xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13px] cursor-pointer" @click="closeCategoryModal">Batal</button>
            <button type="button" :disabled="isSavingCategory" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13px] transition-all shadow-xs disabled:opacity-50 cursor-pointer" @click="handleAddCategory">
              <span>{{ isSavingCategory ? "Menyimpan..." : "Simpan Kategori" }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
