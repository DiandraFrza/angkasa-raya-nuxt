<!-- @format -->

<script setup lang="ts">
import { ArrowRight, FileCheck, Download, FileText, Layers, MapPin, Clock, PhoneCall, ShieldCheck, CheckCircle2 } from "lucide-vue-next";
import { motion } from "motion-v";
import { useCatalog } from "~/composables/useCatalog";
import { useQuoteModal } from "~/composables/useQuoteModal";
import { useSiteSettings } from "~/composables/useSiteSettings";
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
      <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut' }" :viewport="{ once: true, amount: 0.1 }" class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <!-- Media Column (5 cols) -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-white rounded-3xl p-6 overflow-hidden flex items-center justify-center relative aspect-[4/3] border border-slate-100 shadow-sm">
            <img :src="product.imageUrl" :alt="product.name" class="w-full h-full object-contain hover:scale-105 transition-transform duration-500" />
            <div v-if="product.isVerified" class="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A3EEEC] text-[12px] font-manrope font-bold text-[#054E4C] border border-slate-200/40">
              <FileCheck class="w-3.5 h-3.5 text-[#054E4C]" />
              <span>Spesifikasi Terverifikasi</span>
            </div>
          </div>

          <!-- Documentation / Downloads Card -->
          <div class="bg-white rounded-3xl p-6 space-y-3.5 border border-slate-100 shadow-sm">
            <h4 class="font-manrope font-bold text-[14px] text-[#0D2235] flex items-center gap-2">
              <FileText class="w-4 h-4 text-[#89CBDD]" />
              <span>Dokumen & Lembar Data Teknis</span>
            </h4>
            <div v-if="product.documents && product.documents.length > 0" class="space-y-2">
              <div v-for="(doc, idx) in product.documents" :key="idx" class="flex items-center justify-between p-3.5 rounded-2xl bg-[#E9F8FF] hover:bg-[#D0F2F9] transition-colors text-[13px] border border-slate-100">
                <div class="flex items-center gap-2.5 truncate">
                  <Download class="w-4 h-4 text-[#89CBDD] shrink-0" />
                  <span class="font-medium text-[#0D2235] truncate">{{ doc.title }}</span>
                </div>
                <span class="text-[11px] text-[#486581] font-mono shrink-0 ml-2">
                  {{ doc.fileSize }}
                </span>
              </div>
            </div>
            <p v-else class="text-[12.5px] text-[#486581] font-sans font-light">Dokumen COA/SDS sediaan ini tersedia atas permohonan resmi tim pengadaan.</p>
          </div>
        </div>

        <!-- Details Column (7 cols) -->
        <div class="lg:col-span-7 space-y-6">
          <div class="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-100 shadow-sm">
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

            <!-- Title & Grade with Extreme Typography Contrast -->
            <div class="space-y-2">
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-manrope font-black text-[#0D2235] tracking-tight leading-tight">
                {{ product.name }}
              </h1>
              <p v-if="product.grade" class="text-[14px] font-medium text-[#0D253A]">
                Standar Mutu: <span class="text-[#054E4C] font-semibold bg-[#A3EEEC]/60 px-2.5 py-0.5 rounded-full border border-slate-200/40">{{ product.grade }}</span>
              </p>
            </div>

            <!-- Short Description (Punchy & Direct) -->
            <p class="text-[15px] sm:text-[16px] text-[#486581] font-sans font-light leading-relaxed">
              {{ product.shortDescription }}
            </p>

            <!-- Packaging & Lead Time Banner -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-3xl bg-[#E9F8FF] text-[13px] border border-slate-100">
              <div class="flex items-start gap-2.5">
                <Layers class="w-4 h-4 text-[#89CBDD] shrink-0 mt-0.5" />
                <div>
                  <span class="block font-manrope font-bold text-[#0D2235]">Kemasan Tersedia:</span>
                  <span class="text-[#486581]">
                    <span v-for="(pack, i) in product.packaging" :key="i"> {{ pack.size }} {{ pack.unit }}<span v-if="i < product.packaging.length - 1">, </span> </span>
                  </span>
                </div>
              </div>
              <div class="flex items-start gap-2.5">
                <Clock class="w-4 h-4 text-[#89CBDD] shrink-0 mt-0.5" />
                <div>
                  <span class="block font-manrope font-bold text-[#0D2235]">Estimasi Pengiriman:</span>
                  <span class="text-[#486581] font-light">{{ product.leadTime || "Hubungi Tim Penjualan" }}</span>
                </div>
              </div>
            </div>

            <!-- Primary CTAs -->
            <div class="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button type="button" class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[14.5px] transition-all cursor-pointer shadow-xs" @click="openModal({ name: product.name, sku: product.sku, slug: product.slug, categoryName: product.categoryName })">
                <span>Minta Penawaran Harga </span>
                <ArrowRight class="w-4 h-4 text-[#082838]" />
              </button>

              <a :href="waInquiryUrl" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-bold text-[14px] transition-colors border border-slate-200/50">
                <PhoneCall class="w-4 h-4 text-[#89CBDD]" />
                <span>Tanya via WhatsApp</span>
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
