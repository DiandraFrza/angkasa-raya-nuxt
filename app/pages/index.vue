<!-- @format -->

<script setup lang="ts">
import { ref } from "vue";
import { ArrowRight, ShieldCheck, CheckCircle2, FileCheck, MapPin, Clock, PhoneCall } from "lucide-vue-next";
import { motion } from "motion-v";
import { useCatalog } from "~/composables/useCatalog";
import { useQuoteModal } from "~/composables/useQuoteModal";
import { useSiteSettings } from "~/composables/useSiteSettings";
import SectionHeading from "~/components/common/SectionHeading.vue";
import ProductCard from "~/components/products/ProductCard.vue";
import DribbbleHeroSection from "~/components/home/DribbbleHeroSection.vue";

const { settings } = useSiteSettings();

useSeoMeta({
  title: () => `${settings.value.company_name} - Katalog Reagen & Bahan Laboratorium`,
  description: () => settings.value.hero_subheadline,
  ogTitle: () => `${settings.value.company_name} - Katalog Reagen & Bahan Laboratorium`,
  ogDescription: () => settings.value.hero_subheadline,
});

const { getCategories, getFeaturedProducts } = useCatalog();
const categories = getCategories();
const featuredProducts = getFeaturedProducts();
const { openModal } = useQuoteModal();
</script>

<template>
  <div class="space-y-0">
    <!-- HERO SECTION: Clean Minimalist + Giant Typography Contrast + Framer Motion -->
    <DribbbleHeroSection />

    <!-- SECTION 2: 4 KATEGORI PRODUK -->
    <section class="py-20 lg:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <!-- Section Header with Extreme Typography Contrast -->
        <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut' }" :viewport="{ once: true, amount: 0.2 }" class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="space-y-3">
            <div class="inline-flex items-center gap-2 text-[11px] font-manrope font-bold uppercase tracking-wider text-[#054E4C] bg-[#A3EEEC]/60 px-3.5 py-1.5 rounded-full border border-slate-200/40">
              <span>Struktur Pasokan Laboratorium</span>
            </div>
            <h2 class="text-4xl sm:text-5xl lg:text-6xl font-manrope tracking-tight leading-tight">
              <span class="block font-black text-[#0D2235]">Empat Kategori Kerja.</span>
              <span class="block font-light text-[#486581]">Sediaan Reagen & Alat.</span>
            </h2>
            <p class="text-[15px] sm:text-base text-[#486581] font-sans font-light max-w-xl"><strong class="text-[#0D253A] font-semibold">Spesifikasi jelas. Dokumen lengkap.</strong> Klasifikasi terstruktur untuk kemudahan pengadaan faskes dan riset.</p>
          </div>

          <NuxtLink to="/products" class="inline-flex items-center gap-2 text-[14px] font-manrope font-bold text-[#1B7E98] hover:text-[#0D253A] transition-colors shrink-0">
            <span>Buka Seluruh Katalog</span>
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </motion.div>

        <!-- Category Grid with Staggered Entrance Animation -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div v-for="(cat, idx) in categories" :key="cat.id" :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut', delay: idx * 0.08 }" :viewport="{ once: true, amount: 0.2 }" class="h-full">
            <NuxtLink :to="`/products?category=${cat.slug}`" class="group p-7 rounded-3xl bg-[#E9F8FF]/50 hover:bg-white hover:shadow-xl hover:shadow-[#0D253A]/6 border border-slate-100 hover:border-slate-200/80 transition-all duration-300 flex flex-col justify-between h-full">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-manrope font-bold tracking-wider uppercase text-[#1B7E98]"> Kategori 0{{ idx + 1 }} </span>
                  <span v-if="cat.isInstrument" class="text-[10px] font-manrope font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#A3EEEC] text-[#054E4C]"> Alat Lab </span>
                </div>
                <h3 class="font-manrope font-extrabold text-[19px] text-[#0D2235] group-hover:text-[#1B7E98] transition-colors">
                  {{ cat.name }}
                </h3>
                <p class="text-[13px] text-[#486581] font-sans font-light leading-relaxed">
                  {{ cat.description }}
                </p>
              </div>

              <div class="pt-6 mt-4 flex items-center justify-between text-[12.5px] font-manrope font-bold text-[#0D253A] group-hover:text-[#1B7E98] border-t border-slate-100/60 pt-3">
                <span>Telusuri Produk</span>
                <ArrowRight class="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>
            </NuxtLink>
          </motion.div>
        </div>
      </div>
    </section>

    <!-- SECTION 3: PRODUK SOROTAN -->
    <section class="py-20 lg:py-24 bg-[#E9F8FF]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut' }" :viewport="{ once: true, amount: 0.2 }" class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="space-y-3">
            <div class="inline-flex items-center gap-2 text-[11px] font-manrope font-bold uppercase tracking-wider text-[#054E4C] bg-[#A3EEEC]/60 px-3.5 py-1.5 rounded-full border border-slate-200/40">
              <span>Inventaris Terverifikasi</span>
            </div>
            <h2 class="text-4xl sm:text-5xl lg:text-6xl font-manrope tracking-tight leading-tight">
              <span class="block font-black text-[#0D2235]">Produk Pilihan.</span>
              <span class="block font-light text-[#486581]">Siap Penawaran Resmi.</span>
            </h2>
            <p class="text-[15px] sm:text-base text-[#486581] font-sans font-light max-w-xl"><strong class="text-[#0D253A] font-semibold">Spesifikasi jelas. Dokumen lengkap.</strong> Sediaan diagnostik dan acuan analitis terverifikasi izin Kemenkes RI.</p>
          </div>

          <button type="button" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-bold text-[13.5px] transition-all cursor-pointer shadow-xs hover:shadow-md border border-slate-200/60 shrink-0" @click="openModal()">
            <span>Kirim Daftar Kebutuhan</span>
            <ArrowRight class="w-4 h-4 text-[#89CBDD]" />
          </button>
        </motion.div>

        <!-- Product Cards Staggered Animation -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div v-for="(product, idx) in featuredProducts" :key="product.id" :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut', delay: idx * 0.08 }" :viewport="{ once: true, amount: 0.2 }" class="h-full">
            <ProductCard :product="product" />
          </motion.div>
        </div>
      </div>
    </section>

    <!-- SECTION 4: STANDAR INFORMASI & TRANSPARANSI -->
    <section class="py-20 lg:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut' }" :viewport="{ once: true, amount: 0.2 }" class="lg:col-span-5 space-y-5">
            <div class="inline-flex items-center gap-2 text-[11px] font-manrope font-bold uppercase tracking-wider text-[#054E4C] bg-[#A3EEEC]/60 px-3.5 py-1.5 rounded-full border border-slate-200/40">
              <span>Transparansi Teknis</span>
            </div>
            <h2 class="text-4xl sm:text-5xl lg:text-6xl font-manrope tracking-tight leading-tight">
              <span class="block font-black text-[#0D2235]">Integritas Data.</span>
              <span class="block font-light text-[#486581]">Standar Mutu Klinis.</span>
            </h2>
            <p class="text-[15px] sm:text-base text-[#486581] font-sans font-light leading-relaxed"><strong class="text-[#0D253A] font-semibold">Spesifikasi jelas. Dokumen lengkap.</strong> Setiap nomor katalog, grade analitis, dan izin edar resmi dicantumkan terbuka untuk kepastian procurement.</p>
            <div class="pt-2">
              <NuxtLink to="/about" class="inline-flex items-center gap-2 text-[14px] font-manrope font-bold text-[#1B7E98] hover:text-[#0D253A] transition-colors">
                <span>Pelajari Profil & Standar Operasional</span>
                <ArrowRight class="w-4 h-4" />
              </NuxtLink>
            </div>
          </motion.div>

          <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut', delay: 0.1 }" :viewport="{ once: true, amount: 0.2 }" class="p-6 rounded-3xl bg-[#E9F8FF]/50 hover:bg-white space-y-3.5 transition-all duration-300 shadow-xs hover:shadow-md border border-slate-100">
              <div class="w-11 h-11 rounded-2xl bg-[#89CBDD]/25 text-[#1B7E98] flex items-center justify-center">
                <FileCheck class="w-5 h-5" />
              </div>
              <h4 class="font-manrope font-bold text-[16px] text-[#0D2235]">Spesifikasi Bertahap & Jelas</h4>
              <p class="text-[13px] text-[#486581] font-sans font-light leading-relaxed">Tiap produk mencantumkan parameter teknis, nomor SKU, tipe spesimen, dan peruntukan uji secara akurat.</p>
            </motion.div>

            <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut', delay: 0.2 }" :viewport="{ once: true, amount: 0.2 }" class="p-6 rounded-3xl bg-[#E9F8FF]/50 hover:bg-white space-y-3.5 transition-all duration-300 shadow-xs hover:shadow-md border border-slate-100">
              <div class="w-11 h-11 rounded-2xl bg-[#ADDFF1]/40 text-[#0D253A] flex items-center justify-center">
                <MapPin class="w-5 h-5" />
              </div>
              <h4 class="font-manrope font-bold text-[16px] text-[#0D2235]">Fokus Pasokan Jabodetabek</h4>
              <p class="text-[13px] text-[#486581] font-sans font-light leading-relaxed">Kemudahan koordinasi pengiriman dan kepastian lead time logistik dengan prioritas area Jabodetabek.</p>
            </motion.div>

            <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut', delay: 0.3 }" :viewport="{ once: true, amount: 0.2 }" class="p-6 rounded-3xl bg-[#E9F8FF]/50 hover:bg-white space-y-3.5 transition-all duration-300 shadow-xs hover:shadow-md border border-slate-100">
              <div class="w-11 h-11 rounded-2xl bg-[#A3EEEC] text-[#054E4C] flex items-center justify-center">
                <ShieldCheck class="w-5 h-5" />
              </div>
              <h4 class="font-manrope font-bold text-[16px] text-[#0D2235]">Regulasi Izin Edar Kemenkes</h4>
              <p class="text-[13px] text-[#486581] font-sans font-light leading-relaxed">Produk diagnostik dilengkapi izin edar resmi Kementerian Kesehatan RI untuk keamanan pengadaan fasilitas medis.</p>
            </motion.div>

            <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut', delay: 0.4 }" :viewport="{ once: true, amount: 0.2 }" class="p-6 rounded-3xl bg-[#E9F8FF]/50 hover:bg-white space-y-3.5 transition-all duration-300 shadow-xs hover:shadow-md border border-slate-100">
              <div class="w-11 h-11 rounded-2xl bg-amber-500/15 text-[#D97706] flex items-center justify-center">
                <Clock class="w-5 h-5" />
              </div>
              <h4 class="font-manrope font-bold text-[16px] text-[#0D2235]">Respon Cepat Penawaran</h4>
              <p class="text-[13px] text-[#486581] font-sans font-light leading-relaxed">Surat Penawaran Harga (SPH) resmi diproses dalam waktu 1 hari kerja untuk mendukung kelancaran administrasi Anda.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 5: CALL TO ACTION BANNER (Consistent Brand Navy & Sky Blue) -->
    <section class="py-20 bg-[#0D253A] text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut' }" :viewport="{ once: true, amount: 0.2 }" class="bg-gradient-to-r from-[#0D253A] via-[#133854] to-[#89CBDD]/30 rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/10">
          <div class="space-y-4 max-w-2xl text-left">
            <span class="inline-block text-[11px] font-manrope font-bold uppercase tracking-wider text-[#A3EEEC] bg-white/10 px-3.5 py-1 rounded-full"> Layanan Penawaran Institusi </span>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-manrope font-bold tracking-tight text-white leading-tight">Membutuhkan Penawaran Harga Resmi?</h2>
            <p class="text-[15px] sm:text-[16px] text-white/80 font-sans font-light leading-relaxed">Kirimkan rincian reagen atau instrumen lab Anda. Tim teknis penjualan kami siap memberikan penawaran harga, ketersediaan stok, dan lead time dalam 1 hari kerja.</p>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-3.5 shrink-0 w-full lg:w-auto">
            <button type="button" class="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[14.5px] transition-all cursor-pointer text-center shadow-md" @click="openModal()">Minta Penawaran Harga</button>
            <a :href="`https://wa.me/${settings.whatsapp}`" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-manrope font-semibold text-[14.5px] transition-all text-center border border-white/15">
              <PhoneCall class="w-4 h-4 text-[#A3EEEC]" />
              <span>Konsultasi via WhatsApp</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  </div>
</template>
