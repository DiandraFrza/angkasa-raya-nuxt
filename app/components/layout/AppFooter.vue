<!-- @format -->

<script setup lang="ts">
import { Mail, Phone, MapPin, ArrowUpRight, ShieldCheck } from "lucide-vue-next";
import { useCatalog } from "~/composables/useCatalog";
import { useQuoteModal } from "~/composables/useQuoteModal";
import { useSiteSettings } from "~/composables/useSiteSettings";

const currentYear = new Date().getFullYear();
const { openModal } = useQuoteModal();
const { settings } = useSiteSettings();
const { categories } = useCatalog();
</script>

<template>
  <footer class="bg-[#0D253A] text-white pt-16 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-14">
        <!-- Brand & Description (5 cols) -->
        <div class="lg:col-span-5 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-md bg-white p-1 flex items-center justify-center overflow-hidden">
              <img :src="settings.logo_url || '/brand/logo_akm.jpg'" :alt="`Logo ${settings.company_name}`" loading="lazy" decoding="async" class="w-full h-full object-contain" />
            </div>
            <div>
              <span class="font-manrope font-extrabold text-[18px] tracking-tight block text-white leading-tight">
                {{ settings.company_name }}
              </span>
              <span class="text-[11px] font-manrope font-semibold tracking-wider uppercase text-[#89CBDD]">
                {{ settings.tagline }}
              </span>
            </div>
          </div>

          <p class="text-[14px] text-white/75 leading-relaxed font-sans max-w-md">Penyedia reagen diagnostik, bahan standar laboratorium, dan instrumen analisis ilmiah dengan fokus pada kejelasan spesifikasi teknis dan keterbukaan informasi untuk fasilitas kesehatan, riset, dan industri.</p>

          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-[12px] text-white/80">
            <ShieldCheck class="w-4 h-4 text-[#A3EEEC]" />
            <span>Fokus Wilayah Pengadaan: {{ settings.distribution_focus }}</span>
          </div>
        </div>

        <!-- Working Categories (3 cols) -->
        <div class="lg:col-span-3 space-y-3.5">
          <h3 class="font-manrope font-bold text-[14px] tracking-wide uppercase text-white/90">Kategori Produk</h3>
          <ul class="space-y-2 text-[13.5px] text-white/70">
            <li v-for="cat in categories" :key="cat.id">
              <NuxtLink :to="`/products?category=${cat.slug}`" class="hover:text-[#89CBDD] transition-colors inline-flex items-center gap-1.5 group">
                <span>{{ cat.name }}</span>
                <span v-if="cat.isInstrument" class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-xl bg-[#A3EEEC]/20 text-[#A3EEEC]">Alat</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Verified Contacts (4 cols) -->
        <div class="lg:col-span-4 space-y-3.5">
          <h3 class="font-manrope font-bold text-[14px] tracking-wide uppercase text-white/90">Kontak Resmi</h3>
          <ul class="space-y-3 text-[13.5px] text-white/75">
            <li class="flex items-start gap-2.5">
              <MapPin class="w-4 h-4 text-[#89CBDD] shrink-0 mt-0.5" />
              <span class="leading-relaxed">
                {{ settings.address }}
              </span>
            </li>
            <li class="flex items-center gap-2.5">
              <Mail class="w-4 h-4 text-[#89CBDD] shrink-0" />
              <a :href="`mailto:${settings.email}`" class="hover:text-[#89CBDD] transition-colors underline-offset-2 hover:underline">
                {{ settings.email }}
              </a>
            </li>
            <li class="flex items-center gap-2.5">
              <Phone class="w-4 h-4 text-[#89CBDD] shrink-0" />
              <a :href="`tel:${settings.phone.replace(/[^0-9]/g, '')}`" class="hover:text-[#89CBDD] transition-colors">
                {{ settings.phone }}
              </a>
            </li>
          </ul>

          <div class="pt-3">
            <button type="button" class="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13.5px] transition-all cursor-pointer w-full sm:w-auto" @click="openModal()">
              <span>Penawaran</span>
              <ArrowUpRight class="w-4 h-4 text-[#082838] transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      <!-- Copyright & Bottom Note -->
      <div class="pt-8 gap-4 text-[12.5px] text-white/50">
        <p class="text-right">&lt;/&gt; Craft by ❤️ AvenBytes.</p>
      </div>
    </div>
  </footer>
</template>
