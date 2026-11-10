<!-- @format -->

<script setup lang="ts">
import { ShieldCheck, FileSpreadsheet, CheckCircle2 } from "lucide-vue-next";
import type { ProductSpecification } from "~/types/catalog";
import PlaceholderBadge from "~/components/common/PlaceholderBadge.vue";

defineProps<{
  specifications: ProductSpecification[];
}>();
</script>

<template>
  <div class="overflow-hidden rounded-3xl bg-white">
    <!-- Header with Icon & Quality Badge -->
    <div class="px-6 py-4.5 bg-gradient-to-r from-[#D0F2F9] to-[#E9F8FF] flex items-center justify-between gap-4">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-[#89CBDD]/30 text-[#082838] flex items-center justify-center shrink-0">
          <FileSpreadsheet class="w-4 h-4" />
        </div>
        <div>
          <h4 class="font-manrope font-extrabold text-[14px] text-[#0D2235] tracking-wide uppercase">Spesifikasi & Lembar Parameter Teknis</h4>
          <span class="text-[11.5px] text-[#486581] font-sans"> Data acuan pengujian laboratorium terverifikasi </span>
        </div>
      </div>

      <div class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A3EEEC] text-[#054E4C] text-[11px] font-manrope font-bold shrink-0">
        <ShieldCheck class="w-3.5 h-3.5 text-[#054E4C]" />
        <span>Tervalidasi</span>
      </div>
    </div>

    <!-- Specifications Table Rows -->
    <div v-if="specifications && specifications.length > 0" class="divide-y divide-[#D0F2F9]/40">
      <div v-for="(spec, index) in specifications" :key="index" class="p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13.5px] transition-colors" :class="index % 2 === 0 ? 'bg-white' : 'bg-[#E9F8FF]/30'">
        <!-- Parameter Label Pill -->
        <div class="sm:w-1/3 shrink-0">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#E9F8FF] text-[#082838] font-manrope font-semibold text-[12.5px]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#89CBDD]" />
            <span>{{ spec.label }}</span>
          </div>
        </div>

        <!-- Parameter Value -->
        <div class="sm:w-2/3 flex items-center justify-between gap-3">
          <span class="font-sans text-[#0D253A] font-normal leading-relaxed text-[13.5px]">
            {{ spec.value }}
          </span>
          <PlaceholderBadge v-if="!spec.isVerified" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="p-8 text-center text-[#486581] text-[13.5px]">Lembar spesifikasi teknis lengkap untuk sediaan ini dapat diminta melalui permohonan penawaran resmi.</div>
  </div>
</template>
