<!-- @format -->

<script setup lang="ts">
import { computed } from "vue";
import { ArrowRight, FileCheck, Layers, Sparkles } from "lucide-vue-next";
import type { Product } from "~/types/catalog";
import { useQuoteModal } from "~/composables/useQuoteModal";
import { getAvailabilityBadge } from "~/utils/availability";

const props = defineProps<{
  product: Product;
}>();

const { openModal } = useQuoteModal();

const availability = computed(() => getAvailabilityBadge(props.product.availabilityStatus, props.product.leadTime));
</script>

<template>
  <div class="group bg-white rounded-md p-3.5 transition-all duration-300 flex flex-col h-full shadow-xs hover:shadow-lg hover:shadow-[#0D253A]/8 hover:-translate-y-0.5">
    <!-- Image Stage -->
    <NuxtLink :to="`/products/${product.slug}`" class="relative aspect-[4/3] bg-[#E9F8FF] rounded-md overflow-hidden flex items-center justify-center p-4">
      <img :src="product.imageUrl" :alt="product.name" class="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500 ease-out" loading="lazy" decoding="async" />
      <!-- Verified Badge using Seafoam Mint -->
      <div v-if="product.isVerified" class="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#A3EEEC] text-[10.5px] font-manrope font-bold text-[#054E4C]">
        <FileCheck class="w-3 h-3 text-[#054E4C]" />
        <span>Terverifikasi</span>
      </div>

      <!-- Featured Star if featured -->
      <div v-if="product.isFeatured" class="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-100 text-[10px] font-manrope font-bold text-amber-800">
        <Sparkles class="w-2.5 h-2.5" />
        <span>Unggulan</span>
      </div>

      <!-- B2B Availability Status Badge (Pojok Kanan Bawah Gambar) -->
      <div class="absolute bottom-2.5 right-2.5 z-10 bg-white/95 backdrop-blur-xl px-1.5 py-1 rounded-sm shadow-sm flex items-center gap-1.5 text-[8px] font-manrope font-semibold" :class="availability.badgeClass" :title="availability.label">
        <!-- <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="availability.dotClass" /> -->
        <span>{{ availability.shortLabel }}</span>
      </div>
    </NuxtLink>

    <!-- Content Body -->
    <div class="p-2.5 flex-grow flex flex-col justify-between space-y-3">
      <div class="space-y-2">
        <!-- Category & SKU -->
        <div class="flex items-center justify-between text-[11px] font-manrope font-semibold gap-2">
          <span class="text-[#1B7E98] tracking-wider uppercase font-bold truncate max-w-[65%]">{{ product.categoryName }}</span>
          <span class="text-[#486581] font-mono text-[10.5px] truncate">{{ product.sku }}</span>
        </div>

        <!-- Title -->
        <h3 class="font-manrope font-bold text-[15px] text-[#0D2235] group-hover:text-[#1B7E98] transition-colors leading-snug line-clamp-2">
          <NuxtLink :to="`/products/${product.slug}`" :title="product.name">
            {{ product.name }}
          </NuxtLink>
        </h3>

        <!-- Description -->
        <p class="text-[12.5px] text-[#486581] font-sans line-clamp-2 leading-relaxed">
          {{ product.shortDescription }}
        </p>

        <!-- Kemasan (Berdiri sendiri rapi dalam 1 baris seragam) -->
        <div v-if="product.packaging && product.packaging[0]" class="pt-1.5">
          <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm bg-[#E9F8FF] text-[#0D253A] text-[11px] font-medium w-fit max-w-full truncate" :title="`Kemasan: ${product.packaging[0].size} ${product.packaging[0].unit}`">
            <Layers class="w-3 h-3 text-[#1B7E98] shrink-0" />
            <span class="truncate">Kemasan: {{ product.packaging[0].size }} {{ product.packaging[0].unit }}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="pt-2 flex items-center justify-between gap-2">
        <NuxtLink :to="`/products/${product.slug}`" class="px-2.5 py-1.5 rounded-md text-[12px] font-manrope font-semibold text-[#486581] hover:text-[#082838] hover:bg-[#E9F8FF] transition-all"> Spesifikasi </NuxtLink>

        <button type="button" class="group/btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[12px] transition-all cursor-pointer active:scale-95 shrink-0" @click="openModal({ name: product.name, sku: product.sku, slug: product.slug, categoryName: product.categoryName })">
          <span>Penawaran</span>
          <ArrowRight class="w-3 h-3 text-[#082838] transform group-hover/btn:translate-x-0.5 transition-transform duration-300" />
        </button>
      </div>
    </div>
  </div>
</template>
