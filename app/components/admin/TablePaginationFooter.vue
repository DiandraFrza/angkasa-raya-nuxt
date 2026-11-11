<!-- @format -->

<script setup lang="ts">
import { computed } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startRange: number;
  endRange: number;
}>();

const emit = defineEmits<{
  (e: "prev"): void;
  (e: "next"): void;
  (e: "go", page: number): void;
}>();

const visiblePageNumbers = computed<(number | "ellipsis-left" | "ellipsis-right")[]>(() => {
  const total = props.totalPages;
  const current = props.currentPage;

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis-left" | "ellipsis-right")[] = [1];

  if (current > 3) {
    pages.push("ellipsis-left");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("ellipsis-right");
  }

  pages.push(total);
  return pages;
});
</script>

<template>
  <div class="px-4 py-3.5 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans">
    <!-- Left: Summary Count -->
    <div class="text-[#486581]">
      Menampilkan
      <strong class="text-[#0D2235]">{{ startRange }} - {{ endRange }}</strong>
      dari
      <strong class="text-[#0D2235]">{{ totalItems }}</strong>
      data
    </div>

    <!-- Right: Clean Page Controls -->
    <div class="flex flex-wrap items-center justify-center gap-1">
      <button
        type="button"
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#F4FBFE] hover:bg-[#E9F8FF] text-[#082838] font-manrope font-semibold text-xs transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        :disabled="currentPage <= 1"
        @click="emit('prev')"
      >
        <ChevronLeft class="w-3.5 h-3.5" />
        <span>Sebelumnya</span>
      </button>

      <template v-for="item in visiblePageNumbers" :key="String(item)">
        <span v-if="item === 'ellipsis-left' || item === 'ellipsis-right'" class="px-1.5 text-[#486581] select-none">&hellip;</span>

        <button
          v-else
          type="button"
          class="min-w-[30px] h-[30px] px-2 rounded-md font-manrope text-xs transition-colors cursor-pointer"
          :class="item === currentPage ? 'bg-[#89CBDD]/40 text-[#082838] font-extrabold' : 'text-[#486581] hover:bg-slate-100 hover:text-[#0D2235] font-semibold'"
          @click="emit('go', item)"
        >
          {{ item }}
        </button>
      </template>

      <button
        type="button"
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#F4FBFE] hover:bg-[#E9F8FF] text-[#082838] font-manrope font-semibold text-xs transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        :disabled="currentPage >= totalPages"
        @click="emit('next')"
      >
        <span>Selanjutnya</span>
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>
