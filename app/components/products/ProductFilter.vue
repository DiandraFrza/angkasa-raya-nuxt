<script setup lang="ts">
import { useCatalog } from '~/composables/useCatalog'
import type { CategorySlug } from '~/types/catalog'

const props = defineProps<{
  activeCategory: string
}>()

const emit = defineEmits<{
  (e: 'select', slug: string): void
}>()

const { categories } = useCatalog()
</script>

<template>
  <div class="flex items-center gap-2.5 sm:gap-3 overflow-x-auto py-1 scrollbar-none" role="tablist" aria-label="Filter Kategori Produk">
    <button
      type="button"
      role="tab"
      :aria-selected="activeCategory === 'all'"
      class="px-5 py-2.5 rounded-2xl text-[14px] font-manrope whitespace-nowrap transition-all cursor-pointer select-none"
      :class="[
        activeCategory === 'all'
          ? 'bg-[#89CBDD] text-[#082838] font-bold'
          : 'bg-white/85 hover:bg-white text-[#486581] hover:text-[#082838] font-semibold',
      ]"
      @click="emit('select', 'all')"
    >
      Semua Kategori
    </button>

    <button
      v-for="cat in categories"
      :key="cat.id"
      type="button"
      role="tab"
      :aria-selected="activeCategory === cat.slug"
      class="px-5 py-2.5 rounded-2xl text-[14px] font-manrope whitespace-nowrap transition-all cursor-pointer select-none inline-flex items-center"
      :class="[
        activeCategory === cat.slug
          ? 'bg-[#89CBDD] text-[#082838] font-bold'
          : 'bg-white/85 hover:bg-white text-[#486581] hover:text-[#082838] font-semibold',
      ]"
      @click="emit('select', cat.slug)"
    >
      <span>{{ cat.name }}</span>
      <span
        v-if="cat.isInstrument"
        class="ml-2 text-[10.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-flex items-center"
        :class="activeCategory === cat.slug ? 'bg-[#082838]/15 text-[#082838]' : 'bg-[#A3EEEC] text-[#054E4C]'"
      >
        Alat
      </span>
    </button>
  </div>
</template>
