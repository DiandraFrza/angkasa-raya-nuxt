<!-- @format -->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Check, ChevronDown, Search, Plus, Layers, X, Sparkles, Loader2, AlertCircle } from "lucide-vue-next";

interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
  isInstrument?: boolean;
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

// Modal Tambah Kategori Baru State
const showAddModal = ref(false);
const newCatName = ref("");
const newCatDescription = ref("");
const newCatIsInstrument = ref(false);
const isSavingCategory = ref(false);
const addCategoryError = ref<string | null>(null);

const fetchCategories = async () => {
  isLoading.value = true;
  try {
    const res = await $fetch<CategoryItem[]>("/api/categories");
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

// Selected Category Details
const selectedCategory = computed(() => {
  return categories.value.find((c) => c.slug === props.modelValue) || null;
});

// Filtered Categories based on search query (search by every letter, word, or number)
const filteredCategories = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return categories.value;

  // Split query into tokens for multi-word search
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
  newCatName.value = searchQuery.value.trim();
  newCatDescription.value = "";
  newCatIsInstrument.value = false;
  addCategoryError.value = null;
  isOpen.value = false;
  showAddModal.value = true;
};

const handleCreateCategory = async () => {
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
      newCatName.value = "";
      newCatDescription.value = "";
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
    <label v-if="label" class="block text-[13px] font-manrope font-semibold text-[#0D2235]">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Trigger Selector Button -->
    <div
      role="combobox"
      :aria-expanded="isOpen"
      tabindex="0"
      class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 hover:bg-[#E9F8FF] focus:bg-white text-[14px] text-[#0D2235] border border-transparent focus:border-[#89CBDD] focus:ring-2 focus:ring-[#89CBDD]/30 transition-all cursor-pointer flex items-center justify-between gap-2 select-none"
      @click="isOpen = !isOpen"
      @keydown.enter.prevent="isOpen = !isOpen"
      @keydown.space.prevent="isOpen = !isOpen"
      @keydown.esc="isOpen = false"
    >
      <div class="flex items-center gap-2.5 truncate">
        <Layers class="w-4 h-4 text-[#89CBDD] shrink-0" />
        <span v-if="selectedCategory" class="font-medium text-[#0D2235] truncate">
          {{ selectedCategory.name }}
        </span>
        <span v-else class="text-[#486581]/70 font-sans">Pilih kategori produk...</span>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <span v-if="selectedCategory?.isInstrument" class="text-[10px] font-manrope font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#ADDFF1]/40 text-[#082838]">
          Alat
        </span>
        <span v-else-if="selectedCategory" class="text-[10px] font-manrope font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#A3EEEC]/50 text-[#054E4C]">
          Reagen
        </span>
        <ChevronDown class="w-4 h-4 text-[#486581] transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
      </div>
    </div>

    <!-- Dropdown Menu Popover -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-1"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 right-0 z-50 mt-1.5 bg-white rounded-3xl shadow-xl border border-[#D0F2F9] overflow-hidden text-[#0D2235] text-[13.5px] font-sans antialiased"
      >
        <!-- Search Input Bar -->
        <div class="p-3 bg-[#E9F8FF]/50 border-b border-[#D0F2F9]/70 relative flex items-center gap-2">
          <Search class="w-4 h-4 text-[#89CBDD] shrink-0" />
          <input
            v-model="searchQuery"
            type="text"
            autofocus
            placeholder="Cari kategori (ketik kata, huruf, atau angka)..."
            class="w-full bg-transparent text-[13px] text-[#0D2235] placeholder-[#486581]/70 outline-none font-sans"
            @keydown.esc="isOpen = false"
            @click.stop
          />
          <button
            v-if="searchQuery"
            type="button"
            class="text-[#486581] hover:text-[#0D2235] p-1"
            @click="searchQuery = ''"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Category Options List -->
        <div class="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
          <button
            v-for="cat in filteredCategories"
            :key="cat.slug"
            type="button"
            class="w-full px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer group"
            :class="cat.slug === modelValue ? 'bg-gradient-to-r from-[#89CBDD]/30 to-[#A3EEEC]/40 text-[#082838] font-bold' : 'hover:bg-[#E9F8FF]/80 text-[#0D253A]'"
            @click="selectCategory(cat)"
          >
            <div class="min-w-0 pr-2">
              <div class="font-manrope font-semibold text-[13.5px] truncate">
                {{ cat.name }}
              </div>
              <div v-if="cat.description" class="text-[11px] text-[#486581] truncate">
                {{ cat.description }}
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <span v-if="cat.isInstrument" class="text-[10px] font-manrope font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#ADDFF1]/40 text-[#082838]">
                Alat
              </span>
              <Check v-if="cat.slug === modelValue" class="w-4 h-4 text-[#054E4C] shrink-0" />
            </div>
          </button>

          <!-- Empty State -->
          <div v-if="filteredCategories.length === 0" class="py-6 px-4 text-center text-[#486581] text-[12.5px]">
            <p>Kategori "<span class="font-bold text-[#0D2235]">{{ searchQuery }}</span>" tidak ditemukan.</p>
          </div>
        </div>

        <!-- Bottom Action: Tambah Kategori Baru -->
        <div class="p-2.5 bg-[#E9F8FF]/40 border-t border-[#D0F2F9]/70">
          <button
            type="button"
            class="w-full py-2 px-3 rounded-2xl bg-white hover:bg-[#D0F2F9] text-[#082838] font-manrope font-bold text-[12.5px] transition-all flex items-center justify-center gap-2 border border-[#89CBDD]/40 shadow-xs cursor-pointer"
            @click="openAddModalWithQuery"
          >
            <Plus class="w-3.5 h-3.5 text-[#1B7E98]" />
            <span v-if="searchQuery">Tambah "{{ searchQuery }}" Sebagai Kategori Baru</span>
            <span v-else>Tambah Kategori Baru</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Modal Dialog: Tambah Kategori Baru -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-[#0D253A]/40 backdrop-blur-xs transition-opacity" @click="showAddModal = false" />

        <!-- Modal Card -->
        <div class="relative bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#ADDFF1]/50 space-y-5 animate-scale-up z-10 text-[#0D2235] font-sans">
          <!-- Header -->
          <div class="flex items-center justify-between pb-2 border-b border-[#D0F2F9]/60">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-2xl bg-[#A3EEEC]/50 text-[#054E4C] flex items-center justify-center">
                <Layers class="w-4 h-4" />
              </div>
              <h3 class="font-manrope font-bold text-[16px] text-[#0D2235]">Tambah Kategori Produk Baru</h3>
            </div>
            <button type="button" class="p-1 rounded-xl text-[#486581] hover:text-[#0D2235] hover:bg-[#E9F8FF]" @click="showAddModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Error Alert -->
          <div v-if="addCategoryError" class="p-3 rounded-2xl bg-red-50 text-red-800 text-[12.5px] flex items-center gap-2">
            <AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
            <span>{{ addCategoryError }}</span>
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <!-- Nama Kategori -->
            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-bold text-[#0D253A]">
                Nama Kategori <span class="text-red-500">*</span>
              </label>
              <input
                v-model="newCatName"
                type="text"
                placeholder="Contoh: Rapid Test Kit, Kimia Klinik, dll"
                class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[13.5px] text-[#0D2235] outline-none focus:ring-2 focus:ring-[#89CBDD]/40 border border-transparent focus:border-[#89CBDD] transition-all"
              />
            </div>

            <!-- Tipe Klasifikasi -->
            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-bold text-[#0D253A]">
                Jenis Sediaan Produk
              </label>
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

            <!-- Deskripsi Singkat -->
            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-semibold text-[#0D253A]">
                Deskripsi Singkat (Opsional)
              </label>
              <textarea
                v-model="newCatDescription"
                rows="2"
                placeholder="Penjelasan fungsi lini kategori produk..."
                class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[13.5px] text-[#0D2235] outline-none focus:ring-2 focus:ring-[#89CBDD]/40 border border-transparent focus:border-[#89CBDD] transition-all resize-none"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              class="px-5 py-2.5 rounded-2xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13px] transition-colors cursor-pointer"
              @click="showAddModal = false"
            >
              Batal
            </button>
            <button
              type="button"
              :disabled="isSavingCategory"
              class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13px] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              @click="handleCreateCategory"
            >
              <Loader2 v-if="isSavingCategory" class="w-3.5 h-3.5 animate-spin" />
              <Plus v-else class="w-3.5 h-3.5" />
              <span>{{ isSavingCategory ? 'Menyimpan...' : 'Simpan Kategori' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
