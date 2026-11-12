<!-- @format -->

<script setup lang="ts">
import { computed } from "vue";
import { ArrowRight, FileCheck, Download, FileText, Layers, Clock, CheckCircle2, XCircle, PhoneCall, PackageCheck } from "lucide-vue-next";
import { motion } from "motion-v";
import { useCatalog } from "~/composables/useCatalog";
import { useQuoteModal } from "~/composables/useQuoteModal";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { getAvailabilityBadge } from "~/utils/availability";
import AppBreadcrumb from "~/components/common/AppBreadcrumb.vue";
import ProductSpecsTable from "~/components/products/ProductSpecsTable.vue";
import type { Product } from "~/types/catalog";

const route = useRoute();
const slug = route.params.slug as string;
const { getProductBySlug } = useCatalog();
const { openModal } = useQuoteModal();
const { settings } = useSiteSettings();

// Fetch product dynamically from SQL backend API
const { data: fetchedProduct } = await useFetch<Product>(`/api/products/${slug}`);

const product = fetchedProduct.value || getProductBySlug(slug);

if (!product) {
  throw createError({
    statusCode: 404,
    statusMessage: `Produk tidak ditemukan di dalam katalog ${settings.value.company_name}.`,
    fatal: true,
  });
}

useSeoMeta({
  title: () => `${product.name}`,
  description: () => product.shortDescription,
  ogTitle: () => `${product.name}`,
  ogDescription: () => product.shortDescription,
});

const activeDocuments = computed(() => (product.documents || []).filter((doc) => doc?.isActive !== false));

const availability = computed(() => getAvailabilityBadge(product.availabilityStatus, product.leadTime));

const availabilityIcon = computed(() => {
  if (availability.value.status === "indent") return Clock;
  if (availability.value.status === "out_of_stock") return XCircle;
  return CheckCircle2;
});

const waInquiryUrl = computed(() => {
  const text = encodeURIComponent(`Halo ${settings.value.company_name}, saya ingin meminta informasi penawaran harga resmi untuk produk: ${product.name} (SKU: ${product.sku}).`);
  return `https://wa.me/${settings.value.whatsapp}?text=${text}`;
});
</script>

<template>
  <div class="py-8 pb-24 bg-[#E9F8FF]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <!-- Breadcrumb -->
      <AppBreadcrumb :items="[{ label: 'Katalog Produk', to: '/products' }, { label: product.categoryName, to: `/products?category=${product.categorySlug}` }, { label: product.name }]" />

      <!-- Main Product Stage (2 Columns) with Framer Motion -->
      <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut' }" :viewport="{ once: true, amount: 0.1 }" class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <!-- Media Column (5 cols) -->
        <div class="lg:col-span-5 space-y-5">
          <div class="bg-white rounded-md p-6 overflow-hidden flex items-center justify-center relative aspect-[4/3] border border-slate-200/70 shadow-sm">
            <img :src="product.imageUrl" :alt="product.name" loading="lazy" decoding="async" class="w-full h-full object-contain hover:scale-105 transition-transform duration-500" />
            <div v-if="product.isVerified" class="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#A3EEEC] text-[11.5px] font-manrope font-bold text-[#054E4C]">
              <FileCheck class="w-3.5 h-3.5 text-[#054E4C]" />
              <span>Spesifikasi Terverifikasi</span>
            </div>
          </div>

          <!-- Documentation / Direct PDF Downloads Card -->
          <div class="bg-white rounded-md p-5 sm:p-6 space-y-4 border border-slate-200/70 shadow-sm">
            <div class="flex items-center justify-between gap-2">
              <h4 class="font-manrope font-bold text-[14px] text-[#0D2235] flex items-center gap-2">
                <FileText class="w-4 h-4 text-[#89CBDD] shrink-0" />
                <span>Dokumen & Lembar Teknis</span>
              </h4>
              <span v-if="activeDocuments.length > 0" class="text-[11px] font-manrope font-bold px-2 py-0.5 rounded-sm bg-[#E9F8FF] text-[#1B7E98] shrink-0"> {{ activeDocuments.length }} Berkas </span>
            </div>

            <div v-if="activeDocuments.length > 0" class="space-y-2.5">
              <a v-for="(doc, idx) in activeDocuments" :key="idx" :href="`/api/products/${product.slug}/document/${idx}`" :download="`${product.slug}-${doc.type || 'dokumen'}.pdf`" class="group flex items-center justify-between p-3 rounded-md bg-[#E9F8FF]/80 hover:bg-[#D0F2F9] transition-all text-[12.5px] sm:text-[13px] shadow-2xs" :title="'Unduh langsung ' + doc.title">
                <div class="flex items-center gap-2.5 min-w-0 pr-2">
                  <div class="w-8 h-8 rounded-md bg-white flex items-center justify-center shrink-0 text-[#1B7E98] group-hover:bg-[#89CBDD] group-hover:text-[#082838] transition-colors shadow-2xs">
                    <Download class="w-4 h-4" />
                  </div>
                  <div class="min-w-0">
                    <div class="font-manrope font-bold text-[#0D2235] truncate group-hover:text-[#082838]">
                      {{ doc.title }}
                    </div>
                    <div class="text-[11px] text-[#486581] flex items-center gap-2 mt-0.5 font-mono">
                      <span class="px-1.5 py-0.5 rounded-sm bg-white text-[10px] font-bold uppercase tracking-wider text-[#054E4C]">
                        {{ doc.type || "PDF" }}
                      </span>
                      <span>{{ doc.fileSize && doc.fileSize !== "Atas Permintaan" && doc.fileSize !== "Tersedia atas Permintaan" ? doc.fileSize : "PDF Siap Unduh" }}</span>
                    </div>
                  </div>
                </div>
                <div class="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-white text-[11.5px] font-manrope font-bold text-[#1B7E98] group-hover:bg-[#89CBDD] group-hover:text-[#082838] transition-colors">
                  <span>Unduh</span>
                  <Download class="w-3.5 h-3.5" />
                </div>
              </a>
            </div>
            <p v-else class="text-[12.5px] text-[#486581] font-sans font-light">Dokumen lembar teknis sediaan ini belum tersedia untuk diunduh.</p>
          </div>
        </div>

        <!-- Details Column (7 cols) -->
        <div class="lg:col-span-7 space-y-6">
          <div class="bg-white rounded-md p-5 sm:p-8 space-y-6 border border-slate-200/70 shadow-sm">
            <!-- Eyebrow & Codes -->
            <div class="flex flex-wrap items-center justify-between gap-3 text-[12px] font-manrope">
              <NuxtLink :to="`/products?category=${product.categorySlug}`" class="font-bold text-[#1B7E98] tracking-wide uppercase hover:underline">
                {{ product.categoryName }}
              </NuxtLink>
              <div class="flex items-center gap-3 text-[#486581] font-mono">
                <span
                  >SKU: <strong class="text-[#0D2235]">{{ product.sku }}</strong></span
                >
                <span v-if="product.casNumber" class="hidden sm:inline">| CAS: {{ product.casNumber }}</span>
              </div>
            </div>

            <!-- Title & Grade -->
            <div class="space-y-2">
              <h1 class="text-2xl sm:text-4xl lg:text-5xl font-manrope font-black text-[#0D2235] tracking-tight leading-tight">
                {{ product.name }}
              </h1>
              <p v-if="product.grade" class="text-[13.5px] sm:text-[14px] font-medium text-[#0D253A]">
                Standar Mutu: <span class="text-[#054E4C] font-semibold bg-[#A3EEEC]/60 px-2 py-0.5 rounded-sm">{{ product.grade }}</span>
              </p>
            </div>

            <!-- Short Description -->
            <p class="text-[14.5px] sm:text-[16px] text-[#486581] font-sans font-light leading-relaxed">
              {{ product.shortDescription }}
            </p>

            <!-- Packaging & B2B Stock Status Banner -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 rounded-md bg-[#E9F8FF]/80 text-[13px]">
              <div class="flex items-start gap-2.5">
                <Layers class="w-4 h-4 text-[#1B7E98] shrink-0 mt-0.5" />
                <div>
                  <span class="block font-manrope font-bold text-[#0D2235]">Kemasan:</span>
                  <span class="text-[#486581]">
                    <span v-for="(pack, i) in product.packaging" :key="i"> {{ pack.size }} {{ pack.unit }}<span v-if="i < product.packaging.length - 1">, </span> </span>
                  </span>
                </div>
              </div>

              <div class="flex items-start gap-2.5">
                <PackageCheck class="w-4 h-4 text-[#1B7E98] shrink-0 mt-0.5" />
                <div class="space-y-1.5">
                  <span class="block font-manrope font-bold text-[#0D2235]">Status Ketersediaan:</span>
                  <div class="flex flex-wrap items-center gap-2">
                    <!-- Status Utama dengan Ikon Lucide Dinamis -->
                    <span class="inline-flex items-center gap-1.5 text-[11.5px] font-manrope font-bold" :class="availability.badgeClass">
                      <component :is="availabilityIcon" class="w-3.5 h-3.5 shrink-0" :class="availability.iconClass" />
                      <span>{{ availability.label }}</span>
                    </span>
                  </div>

                  <!-- Keterangan Pengiriman / Lead Time Dinamis -->
                  <span v-if="availability.subText" class="inline-flex items-center gap-1.5 text-[11.5px] text-[#486581]">
                    <Clock class="w-3.5 h-3.5 text-[#89CBDD] shrink-0" />
                    <span>{{ availability.subText }}</span>
                  </span>
                </div>
              </div>

              <p class="sm:col-span-2 text-[11.5px] text-[#486581] italic pt-2.5 border-t border-slate-200/70 leading-relaxed">*Ketersediaan stok untuk pemesanan jumlah besar dapat dikonfirmasi langsung melalui tim marketing kami.</p>
            </div>

            <!-- Primary CTAs -->
            <div class="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button type="button" class="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[14px] transition-all cursor-pointer shadow-xs" @click="openModal({ name: product.name, sku: product.sku, slug: product.slug, categoryName: product.categoryName })">
                <span>Penawaran</span>
                <ArrowRight class="w-4 h-4 text-[#082838]" />
              </button>

              <a :href="waInquiryUrl" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-bold text-[14px] transition-colors border border-slate-200/60">
                <PhoneCall class="w-4 h-4 text-[#89CBDD]" />
                <span>WhatsApp</span>
              </a>
            </div>

            <!-- Description Body -->
            <div class="pt-4 space-y-3 border-t border-slate-100">
              <h3 class="font-manrope font-bold text-[16px] text-[#0D2235]">Deskripsi & Peruntukan Pengujian</h3>
              <p class="text-[14px] text-[#486581] font-sans font-light leading-relaxed">
                {{ product.description }}
              </p>
            </div>
          </div>

          <!-- Specifications Table Component -->
          <ProductSpecsTable :specifications="product.specifications" />
        </div>
      </motion.div>
    </div>
  </div>
</template>
