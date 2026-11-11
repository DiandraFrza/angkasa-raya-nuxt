<!-- @format -->

<script setup lang="ts">
import { ref } from "vue";
import { Search, X } from "lucide-vue-next";
import SoftDropdown from "./SoftDropdown.vue";
import { useQuickSearchShortcut } from "~/composables/useKeyboardShortcuts";

const props = withDefaults(
  defineProps<{
    pageSize: number;
    pageSizeOptions?: number[];
    searchQuery: string;
    searchPlaceholder?: string;
  }>(),
  {
    pageSizeOptions: () => [10, 20, 50, 100],
    searchPlaceholder: "Cari data...",
  },
);

const emit = defineEmits<{
  (e: "update:pageSize", value: number): void;
  (e: "update:searchQuery", value: string): void;
}>();

const searchInputRef = ref<HTMLInputElement | null>(null);
useQuickSearchShortcut(searchInputRef);
</script>

<template>
  <div class="px-4 py-3.5 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <!-- Left: Minimalist Show Entries -->
    <div class="flex items-center gap-2 text-xs text-[#486581] font-sans">
      <span>Tampilkan</span>
      <SoftDropdown :model-value="pageSize" :options="pageSizeOptions" @update:model-value="(val) => emit('update:pageSize', Number(val))" />
      <span>data</span>
    </div>

    <!-- Right: Clean Search + Optional Extra Slot -->
    <div class="flex flex-wrap items-center gap-2.5 sm:justify-end">
      <slot name="filters" />

      <div class="relative w-full sm:w-64">
        <Search class="w-3.5 h-3.5 text-[#89CBDD] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input ref="searchInputRef" :value="searchQuery" type="text" :placeholder="searchPlaceholder" class="w-full pl-9 pr-12 py-2 rounded-xl bg-[#F4FBFE] focus:bg-white text-xs text-[#0D2235] placeholder-[#486581]/70 focus:ring-2 focus:ring-[#89CBDD]/50 outline-none transition-all font-sans" @input="(e) => emit('update:searchQuery', (e.target as HTMLInputElement).value)" />
        <span v-if="!searchQuery" class="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-[#486581]/75 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none select-none" title="Pintasan: tekan / atau Ctrl+K"> / </span>
        <button v-else type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#486581] hover:text-[#0D2235] p-0.5 cursor-pointer" title="Bersihkan pencarian" @click="emit('update:searchQuery', '')">
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
