<!-- @format -->

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { Check, ChevronDown, Search, Plus, Layers, X, Loader2, AlertCircle, RotateCcw } from "lucide-vue-next";
import { useEscapeDismiss, useModalAutoFocus } from "~/composables/useKeyboardShortcuts";

interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
  isInstrument?: boolean;
  isActive?: boolean;
}

const props = defineProps<{
  modelValue: string;
  label?: string;
  required?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", item: CategoryItem): void;
}>();

const categories = ref<CategoryItem[]>([]);
const isLoading = ref(false);
const isOpen = ref(false);
const searchQuery = ref("");
const comboboxRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

// Modal Tambah Kategori Baru State (Retained across accidental closes)
const showAddModal = ref(false);
const addModalRef = ref<HTMLElement | null>(null);
const newCatName = ref("");
const newCatDescription = ref("");
const newCatIsInstrument = ref(false);
const isSavingCategory = ref(false);
const addCategoryError = ref<string | null>(null);

const closeAddModal = () => {
  if (isSavingCategory.value) return;
  showAddModal.value = false;
};

watch(isOpen, async (open) => {
  if (open) {
    await nextTick();
    searchInputRef.value?.focus();
  }
});

useEscapeDismiss(
  () => isOpen.value,
  () => {
    isOpen.value = false;
  },
);
useEscapeDismiss(() => showAddModal.value, closeAddModal);
useModalAutoFocus(() => showAddModal.value, addModalRef);

const fetchCategories = async () => {
  isLoading.value = true;
  try {
    const res = await $fetch<CategoryItem[]>("/api/categories?includeInactive=true");
    if (res && Array.isArray(res)) {
      categories.value = res;
    }
  } catch (err) {
    console.error("Gagal memuat daftar kategori:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const handleClickOutside = (event: MouseEvent) => {
  if (comboboxRef.value && !comboboxRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

const selectedCategory = computed(() => {
  return categories.value.find((c) => c.slug === props.modelValue) || null;
});

const filteredCategories = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return categories.value;
  const tokens = q.split(/\s+/).filter(Boolean);
  return categories.value.filter((cat) => {
    const haystack = `${cat.name} ${cat.slug} ${cat.description || ""}`.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
});

const selectCategory = (cat: CategoryItem) => {
  emit("update:modelValue", cat.slug);
  emit("change", cat);
  isOpen.value = false;
  searchQuery.value = "";
};

const openAddModalWithQuery = () => {
  // Retain draft input if user accidentally closed the modal earlier
  if (!newCatName.value.trim() && searchQuery.value.trim()) {
    newCatName.value = searchQuery.value.trim();
  }
  addCategoryError.value = null;
  isOpen.value = false;
  showAddModal.value = true;
};

const resetCategoryDraft = () => {
  newCatName.value = "";
  newCatDescription.value = "";
  newCatIsInstrument.value = false;
  addCategoryError.value = null;
};

const handleCreateCategory = async () => {
  if (isSavingCategory.value) return;
  if (!newCatName.value.trim()) {
    addCategoryError.value = "Nama kategori wajib diisi.";
    return;
  }

  isSavingCategory.value = true;
  addCategoryError.value = null;

  try {
    const res = await $fetch<{ success: boolean; category: CategoryItem }>("/api/categories", {
      method: "POST",
      body: {
        name: newCatName.value.trim(),
        description: newCatDescription.value.trim(),
        isInstrument: newCatIsInstrument.value,
      },
    });

    if (res && res.category) {
      categories.value.push(res.category);
      selectCategory(res.category);
      showAddModal.value = false;
      resetCategoryDraft();
    }
  } catch (err: any) {
    addCategoryError.value = err.data?.statusMessage || "Gagal menambahkan kategori baru.";
  } finally {
    isSavingCategory.value = false;
  }
};
</script>

<template>
  <div ref="comboboxRef" class="space-y-1 relative">
    <label v-if="label" class="block text-[12.5px] sm:text-[13px] font-manrope font-semibold text-[#0D2235]"> {{ label }} <span v-if="required" class="text-red-500">*</span> </label>

    <!-- Trigger Selector Button -->
    <div role="combobox" :aria-expanded="isOpen" tabindex="0" class="w-full px-3.5 py-2.5 rounded-xl bg-[#E9F8FF]/60 hover:bg-[#E9F8FF] text-[13.5px] text-[#0D2235] focus:ring-2 focus:ring-[#89CBDD]/40 transition-all cursor-pointer flex items-center justify-between gap-2 select-none" @click="isOpen = !isOpen" @keydown.enter.prevent="isOpen = !isOpen" @keydown.space.prevent="isOpen = !isOpen" @keydown.esc="isOpen = false">
      <div class="flex items-center gap-2 truncate min-w-0">
        <Layers class="w-4 h-4 text-[#89CBDD] shrink-0" />
        <span v-if="selectedCategory" class="font-medium text-[#0D2235] truncate">
          {{ selectedCategory.name }}
        </span>
        <span v-else class="text-[#486581]/70 font-sans">Pilih kategori produk...</span>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <span v-if="selectedCategory?.isInstrument" class="text-[10px] font-manrope font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#ADDFF1]/40 text-[#082838]">Alat</span>
        <span v-else-if="selectedCategory" class="text-[10px] font-manrope font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#A3EEEC]/50 text-[#054E4C]">Reagen</span>
        <ChevronDown class="w-4 h-4 text-[#486581] transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
      </div>
    </div>

    <!-- Dropdown Menu Popover -->
    <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="transform scale-95 opacity-0 -translate-y-1" enter-to-class="transform scale-100 opacity-100 translate-y-0" leave-active-class="transition duration-100 ease-in" leave-from-class="transform scale-100 opacity-100 translate-y-0" leave-to-class="transform scale-95 opacity-0 -translate-y-1">
      <div v-if="isOpen" class="absolute left-0 right-0 z-50 mt-1.5 bg-white rounded-md shadow-lg shadow-slate-200/60 overflow-hidden text-[#0D2235] text-[13.5px] font-sans antialiased">
        <!-- Search Input Bar -->
        <div class="p-2.5 bg-slate-50/70 border-b border-slate-100 relative flex items-center gap-2">
          <Search class="w-4 h-4 text-[#89CBDD] shrink-0" />
          <input ref="searchInputRef" v-model="searchQuery" type="text" placeholder="Cari kategori..." class="w-full min-w-0 bg-transparent text-[13px] text-[#0D2235] placeholder-[#486581]/70 outline-none font-sans" @click.stop />
          <button v-if="searchQuery" type="button" class="text-[#486581] hover:text-[#0D2235] p-1 cursor-pointer" @click="searchQuery = ''">
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Category Options List -->
        <div class="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
          <button v-for="cat in filteredCategories" :key="cat.slug" type="button" class="w-full px-3 py-2 rounded-md flex items-center justify-between text-left transition-colors cursor-pointer group" :class="cat.slug === modelValue ? 'bg-[#E9F8FF] text-[#082838] font-bold' : 'hover:bg-slate-50 text-[#0D253A]'" @click="selectCategory(cat)">
            <div class="min-w-0 pr-2">
              <div class="font-manrope font-semibold text-[13px] truncate flex items-center gap-1.5">
                <span>{{ cat.name }}</span>
                <span v-if="cat.isActive === false" class="text-[9.5px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold uppercase">Nonaktif</span>
              </div>
              <div v-if="cat.description" class="text-[11px] text-[#486581] truncate">
                {{ cat.description }}
              </div>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
              <span v-if="cat.isInstrument" class="text-[10px] font-manrope font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#ADDFF1]/40 text-[#082838]">Alat</span>
              <Check v-if="cat.slug === modelValue" class="w-4 h-4 text-[#054E4C] shrink-0" />
            </div>
          </button>

          <div v-if="filteredCategories.length === 0" class="py-5 px-4 text-center text-[#486581] text-[12.5px]">
            <p>
              Kategori "<span class="font-bold text-[#0D2235]">{{ searchQuery }}</span
              >" tidak ditemukan.
            </p>
          </div>
        </div>

        <!-- Bottom Action -->
        <div class="p-2 bg-slate-50/70 border-t border-slate-100">
          <button type="button" class="w-full py-2 px-3 rounded-md bg-[#E9F8FF]/70 hover:bg-[#D0F2F9] text-[#082838] font-manrope font-bold text-[12.5px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer" @click="openAddModalWithQuery">
            <Plus class="w-3.5 h-3.5 text-[#1B7E98]" />
            <span v-if="searchQuery">Tambah "{{ searchQuery }}"</span>
            <span v-else>Tambah Kategori</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Modal Dialog: Tambah Kategori Baru -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="combobox-add-cat-title">
        <div class="fixed inset-0 bg-[#0D253A]/40 backdrop-blur-xs transition-opacity" @click="closeAddModal" />

        <div ref="addModalRef" class="relative bg-white rounded-xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up z-10 text-[#0D2235] font-sans" @click.stop>
          <!-- Header -->
          <div class="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-[#A3EEEC]/50 text-[#054E4C] flex items-center justify-center">
                <Layers class="w-4 h-4" />
              </div>
              <h3 id="combobox-add-cat-title" class="font-manrope font-bold text-[15.5px] text-[#0D2235]">Tambah Kategori Baru</h3>
            </div>
            <button type="button" :disabled="isSavingCategory" class="p-1.5 rounded-xl text-[#486581] hover:text-[#0D2235] hover:bg-[#E9F8FF] cursor-pointer disabled:opacity-50" title="Tutup (Esc)" @click="closeAddModal">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Error Alert -->
          <div v-if="addCategoryError" class="p-3 rounded-xl bg-red-50 text-red-800 text-[12.5px] flex items-center gap-2 border border-red-200">
            <AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
            <span>{{ addCategoryError }}</span>
          </div>

          <!-- Form Fields -->
          <form class="space-y-4" @submit.prevent="handleCreateCategory">
            <fieldset :disabled="isSavingCategory" class="space-y-4 min-w-0">
              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-bold text-[#0D253A]">Nama Kategori <span class="text-red-500">*</span></label>
                <input v-model="newCatName" type="text" placeholder="Contoh: Rapid Test Kit, Kimia Klinik" class="w-full px-3.5 py-2 rounded-xl bg-[#E9F8FF]/60 focus:bg-white text-[13.5px] text-[#0D2235] outline-none ring-1 ring-transparent focus:ring-[#89CBDD] transition-all" />
              </div>

              <!-- Jenis Sediaan Produk (Checkbox UI) -->
              <div class="space-y-1.5">
                <label class="block text-[13px] font-manrope font-bold text-[#0D253A]">Jenis Sediaan <span class="text-red-500">*</span></label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label class="p-3 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 ring-1" :class="!newCatIsInstrument ? 'bg-[#A3EEEC]/25 ring-[#054E4C]/30 text-[#054E4C]' : 'bg-[#E9F8FF]/40 ring-black/5 text-[#486581]'">
                    <input type="checkbox" :checked="!newCatIsInstrument" class="mt-0.5 w-4 h-4 rounded accent-[#054E4C] shrink-0 cursor-pointer" @change="newCatIsInstrument = false" />
                    <div class="min-w-0">
                      <span class="block text-[13px] font-manrope font-bold">Reagen / Bahan</span>
                      <span class="block text-[10.5px] opacity-80">Bahan uji & konsumabel</span>
                    </div>
                  </label>

                  <label class="p-3 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 ring-1" :class="newCatIsInstrument ? 'bg-[#ADDFF1]/35 ring-[#082838]/30 text-[#082838]' : 'bg-[#E9F8FF]/40 ring-black/5 text-[#486581]'">
                    <input type="checkbox" :checked="newCatIsInstrument" class="mt-0.5 w-4 h-4 rounded accent-[#082838] shrink-0 cursor-pointer" @change="newCatIsInstrument = true" />
                    <div class="min-w-0">
                      <span class="block text-[13px] font-manrope font-bold">Alat / Mesin</span>
                      <span class="block text-[10.5px] opacity-80">Instrumen & analyzer</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Deskripsi Singkat (*jika ada) -->
              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-semibold text-[#0D253A]">
                  Deskripsi Singkat
                  <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span>
                </label>
                <textarea v-model="newCatDescription" rows="2" placeholder="Penjelasan fungsi lini kategori produk... (Ctrl+Enter untuk simpan)" class="w-full px-3.5 py-2 rounded-xl bg-[#E9F8FF]/60 focus:bg-white text-[13.5px] text-[#0D2235] outline-none ring-1 ring-transparent focus:ring-[#89CBDD] transition-all resize-none" @keydown.ctrl.enter.prevent="handleCreateCategory" @keydown.meta.enter.prevent="handleCreateCategory" />
              </div>
            </fieldset>

            <!-- Actions -->
            <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button type="button" :disabled="isSavingCategory" class="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[#486581] hover:bg-slate-100 text-[12.5px] font-manrope font-semibold cursor-pointer disabled:opacity-50" @click="resetCategoryDraft">
                <RotateCcw class="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <div class="flex items-center gap-2">
                <button type="button" :disabled="isSavingCategory" class="px-4 py-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13px] transition-colors cursor-pointer disabled:opacity-50" @click="closeAddModal">Batal</button>
                <button type="submit" :disabled="isSavingCategory" class="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13px] transition-all shadow-xs disabled:opacity-50 cursor-pointer">
                  <Loader2 v-if="isSavingCategory" class="w-3.5 h-3.5 animate-spin" />
                  <Plus v-else class="w-3.5 h-3.5" />
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
