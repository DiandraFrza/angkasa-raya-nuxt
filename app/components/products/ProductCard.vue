<!-- @format -->

<script setup lang="ts">
import { computed } from "vue";
import { ArrowRight, FileCheck, Layers, Sparkles } from "lucide-vue-next";
import type { Product } from "~/types/catalog";
import { useQuoteModal } from "~/composables/useQuoteModal";

const props = defineProps<{
  product: Product;
}>();

const { openModal } = useQuoteModal();

// Human-friendly short delivery status for compact card display
const formattedLeadTime = computed(() => {
  if (!props.product.leadTime) return "Hubungi Kami";
  const lt = props.product.leadTime.toLowerCase();
  if (lt.includes("ready stock")) return "Ready Stock";
  if (lt.includes("1 - 2 minggu") || lt.includes("1-2 minggu")) return "PO 1-2 Mgg";
  if (lt.includes("3 - 5 hari") || lt.includes("3-5 hari")) return "Ready 3-5 Hari";
  return props.product.leadTime;
});
</script>

<template>
  <div class="group bg-white rounded-3xl p-4 transition-all duration-300 flex flex-col h-full shadow-xs hover:shadow-xl hover:shadow-[#0D253A]/7 hover:-translate-y-1 border border-slate-100">
    <!-- Image Stage -->
    <NuxtLink :to="`/products/${product.slug}`" class="relative aspect-[4/3] bg-[#E9F8FF] rounded-2xl overflow-hidden flex items-center justify-center p-5">
      <img :src="product.imageUrl" :alt="product.name" class="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500 ease-out" loading="lazy" />
      <!-- Verified Badge using Seafoam Mint -->
      <div v-if="product.isVerified" class="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#A3EEEC] text-[10.5px] font-manrope font-bold text-[#054E4C] border border-slate-200/40">
        <FileCheck class="w-3 h-3 text-[#054E4C]" />
        <span>Terverifikasi</span>
      </div>

      <!-- Featured Star if featured -->
      <div v-if="product.isFeatured" class="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-[10px] font-manrope font-bold text-amber-800">
        <Sparkles class="w-2.5 h-2.5" />
        <span>Unggulan</span>
      </div>
    </NuxtLink>

    <!-- Content Body -->
    <div class="p-3 flex-grow flex flex-col justify-between space-y-3.5">
      <div class="space-y-2">
        <!-- Category & SKU -->
        <div class="flex items-center justify-between text-[11px] font-manrope font-semibold">
          <span class="text-[#1B7E98] tracking-wider uppercase font-bold truncate max-w-[65%]">{{ product.categoryName }}</span>
          <span class="text-[#486581] font-mono text-[10.5px] truncate">{{ product.sku }}</span>
        </div>

        <!-- Title -->
        <h3 class="font-manrope font-bold text-[15.5px] text-[#0D2235] group-hover:text-[#1B7E98] transition-colors leading-snug line-clamp-2">
          <NuxtLink :to="`/products/${product.slug}`" :title="product.name">
            {{ product.name }}
          </NuxtLink>
        </h3>

        <!-- Description -->
        <p class="text-[12.5px] text-[#486581] font-sans line-clamp-2 leading-relaxed">
          {{ product.shortDescription }}
        </p>

        <!-- Preview Specs (Neat Two Badges) -->
        <div class="pt-2 flex items-center justify-between gap-2 text-[11.5px]">
          <div v-if="product.packaging && product.packaging[0]" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#E9F8FF] text-[#0D253A] font-medium truncate max-w-[55%]" :title="`${product.packaging[0].size} ${product.packaging[0].unit}`">
            <Layers class="w-3 h-3 text-[#89CBDD] shrink-0" />
            <span class="truncate">{{ product.packaging[0].size }} {{ product.packaging[0].unit }}</span>
          </div>

          <div v-if="product.leadTime" class="inline-flex items-center px-2.5 py-1 rounded-xl bg-[#A3EEEC]/35 text-[#054E4C] font-manrope font-bold text-[11px] shrink-0 ml-auto" :title="product.leadTime">
            {{ formattedLeadTime }}
          </div>
        </div>
      </div>

      <!-- Action Buttons: Slim, Minimalis, Eye-catching & Animated -->
      <div class="pt-2 flex items-center justify-between gap-2">
        <NuxtLink :to="`/products/${product.slug}`" class="px-3 py-1.5 rounded-full text-[12px] font-manrope font-semibold text-[#486581] hover:text-[#082838] hover:bg-[#E9F8FF] transition-all"> Cek Spesifikasi </NuxtLink>

        <button type="button" class="group/btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[12px] transition-all cursor-pointer active:scale-95 shrink-0" @click="openModal({ name: product.name, sku: product.sku, slug: product.slug, categoryName: product.categoryName })">
          <span>Minta Penawaran</span>
          <ArrowRight class="w-3 h-3 text-[#082838] transform group-hover/btn:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  </div>
</template>
