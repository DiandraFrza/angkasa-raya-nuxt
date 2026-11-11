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
  <div class="overflow-hidden rounded-md bg-white border shadow-xs">
    <!-- Header with Icon & Quality Badge -->
    <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-[#D0F2F9] to-[#E9F8FF] border-b flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-sm bg-[#89CBDD]/30 text-[#082838] flex items-center justify-center shrink-0">
          <FileSpreadsheet class="w-4 h-4" />
        </div>
        <div class="min-w-0">
          <h4 class="font-manrope font-extrabold text-[12.5px] sm:text-[14px] text-[#0D2235] tracking-wide uppercase truncate">Spesifikasi &amp; Parameter Teknis</h4>
          <span class="text-[11px] sm:text-[11.5px] text-[#486581] font-sans block truncate">Data acuan pengujian laboratorium terverifikasi</span>
        </div>
      </div>

      <div class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#A3EEEC] text-[#054E4C] text-[11px] font-manrope font-bold shrink-0">
        <ShieldCheck class="w-3.5 h-3.5 text-[#054E4C]" />
        <span>Tervalidasi</span>
      </div>
    </div>

    <!-- Specifications Excel-style Table Rows (Horizontal scroll on mobile) -->
    <div v-if="specifications && specifications.length > 0" class="overflow-x-auto touch-pan-x">
      <table class="w-full min-w-[440px] sm:min-w-full text-left border-collapse">
        <thead>
          <tr class="bg-[#CBEBF5] border-b divide-x divide-[#9FD7E8]/80 text-[10.5px] sm:text-[11px] font-manrope font-bold uppercase tracking-wider text-[#0D253A]">
            <th class="px-3.5 sm:px-5 py-2.5 w-[42%] sm:w-[38%] whitespace-nowrap">Parameter</th>
            <th class="px-3.5 sm:px-5 py-2.5 whitespace-nowrap">Nilai / Keterangan</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#BEE6F3] text-xs sm:text-[13px]">
          <tr v-for="(spec, index) in specifications" :key="index" class="divide-x divide-[#D0F2F9]" :class="index % 2 === 0 ? 'bg-white' : 'bg-[#E9F8FF]'">
            <td class="px-3.5 sm:px-5 py-2.5 sm:py-3 align-top font-manrope font-semibold text-[#082838]">
              <div class="inline-flex items-start gap-1.5">
                <span class="w-1.5 h-1.5 rounded-sm bg-[#89CBDD] mt-1.5 shrink-0" />
                <span class="break-words">{{ spec.label }}</span>
              </div>
            </td>
            <td class="px-3.5 sm:px-5 py-2.5 sm:py-3 align-top text-[#0D253A]">
              <div class="flex items-center justify-between gap-2">
                <span class="font-sans leading-relaxed break-words">{{ spec.value }}</span>
                <PlaceholderBadge v-if="!spec.isVerified" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="p-6 text-center text-[#486581] text-xs sm:text-[13px]">Lembar spesifikasi teknis lengkap untuk sediaan ini tersedia pada dokumen unduhan di samping.</div>
  </div>
</template>
