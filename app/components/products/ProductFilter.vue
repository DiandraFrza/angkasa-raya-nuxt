<!-- @format -->

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useCatalog } from "~/composables/useCatalog";
import { ChevronRight, ChevronLeft } from "lucide-vue-next";

const props = defineProps<{
  activeCategory: string;
}>();

const emit = defineEmits<{
  (e: "select", slug: string): void;
}>();

const { categories } = useCatalog();
const scrollContainer = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const updateScrollButtons = () => {
  if (!scrollContainer.value) return;
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
  canScrollLeft.value = scrollLeft > 10;
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 10;
};

const scroll = (direction: "left" | "right") => {
  if (!scrollContainer.value) return;
  const offset = direction === "left" ? -200 : 200;
  scrollContainer.value.scrollBy({ left: offset, behavior: "smooth" });
};

onMounted(() => {
  updateScrollButtons();
  window.addEventListener("resize", updateScrollButtons);
});
</script>

<template>
  <div class="relative w-full group">
    <!-- Left Scroll Button (Mobile & Desktop) -->
    <button
      v-if="canScrollLeft"
      type="button"
      class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 text-[#082838] shadow-md flex items-center justify-center border border-[#89CBDD]/40 backdrop-blur-xs transition-opacity hover:bg-[#E9F8FF] cursor-pointer"
      aria-label="Geser kategori ke kiri"
      @click="scroll('left')"
    >
      <ChevronLeft class="w-4 h-4" />
    </button>

    <!-- Scrollable Pills Row -->
    <div
      ref="scrollContainer"
      class="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1.5 px-4 sm:px-1 -mx-4 sm:mx-0 scrollbar-none no-scrollbar touch-pan-x overscroll-x-contain select-none"
      role="tablist"
      aria-label="Filter Kategori Produk"
      @scroll="updateScrollButtons"
    >
      <!-- All Categories Pill -->
      <button
        type="button"
        role="tab"
        :aria-selected="activeCategory === 'all'"
        class="shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-[12.5px] sm:text-[14px] font-manrope whitespace-nowrap transition-all cursor-pointer shadow-xs border"
        :class="[
          activeCategory === 'all'
            ? 'bg-[#89CBDD] text-[#082838] font-bold border-[#76BED2]'
            : 'bg-white/90 hover:bg-white text-[#486581] hover:text-[#082838] font-semibold border-slate-200/60',
        ]"
        @click="emit('select', 'all')"
      >
        Semua Kategori
      </button>

      <!-- Category Pills -->
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        role="tab"
        :aria-selected="activeCategory === cat.slug"
        class="shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-[12.5px] sm:text-[14px] font-manrope whitespace-nowrap transition-all cursor-pointer inline-flex items-center shadow-xs border"
        :class="[
          activeCategory === cat.slug
            ? 'bg-[#89CBDD] text-[#082838] font-bold border-[#76BED2]'
            : 'bg-white/90 hover:bg-white text-[#486581] hover:text-[#082838] font-semibold border-slate-200/60',
        ]"
        @click="emit('select', cat.slug)"
      >
        <span>{{ cat.name }}</span>
        <span
          v-if="cat.isInstrument"
          class="ml-2 text-[10px] sm:text-[10.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-flex items-center"
          :class="activeCategory === cat.slug ? 'bg-[#082838]/15 text-[#082838]' : 'bg-[#A3EEEC] text-[#054E4C]'"
        >
          Alat
        </span>
      </button>
    </div>

    <!-- Right Scroll Button -->
    <button
      v-if="canScrollRight"
      type="button"
      class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 text-[#082838] shadow-md flex items-center justify-center border border-[#89CBDD]/40 backdrop-blur-xs transition-opacity hover:bg-[#E9F8FF] cursor-pointer"
      aria-label="Geser kategori ke kanan"
      @click="scroll('right')"
    >
      <ChevronRight class="w-4 h-4" />
    </button>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
