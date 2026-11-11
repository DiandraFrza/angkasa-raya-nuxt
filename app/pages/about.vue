<!-- @format -->

<script setup lang="ts">
import { ShieldCheck, Building2, CheckCircle2, MapPin, ArrowRight, FileCheck, Clock, Phone } from "lucide-vue-next";
import { motion } from "motion-v";
import AppBreadcrumb from "~/components/common/AppBreadcrumb.vue";
import SectionHeading from "~/components/common/SectionHeading.vue";
import { useQuoteModal } from "~/composables/useQuoteModal";
import { useSiteSettings } from "~/composables/useSiteSettings";

const { settings } = useSiteSettings();

useSeoMeta({
  title: () => `Tentang Kami`,
  description: () => `Profil perusahaan ${settings.value.company_legal_name} sebagai penyedia reagen diagnostik, bahan acuan laboratorium, dan alat analisis B2B.`,
});

const { openModal } = useQuoteModal();
</script>

<template>
  <div class="py-8 pb-24 bg-[#E9F8FF]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <!-- Breadcrumb -->
      <AppBreadcrumb :items="[{ label: 'Tentang Kami' }]" />

      <!-- Hero Header -->
      <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut' }" :viewport="{ once: true, amount: 0.2 }" class="max-w-3xl space-y-4">
        <div class="inline-flex items-center gap-2 text-[11px] font-manrope font-bold uppercase tracking-wider text-[#054E4C] bg-[#A3EEEC]/60 px-3 py-1 rounded-xl border border-slate-200/40">
          <span>Profil & Komitmen Operasional</span>
        </div>
        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-manrope tracking-tight leading-[1.02]">
          <span class="block font-black text-[#0D2235]">Integritas Pasokan Lab.</span>
          <span class="block font-light text-[#486581] mt-1.5">Mitra Fasilitas Kesehatan & RS.</span>
        </h1>
        <p class="text-base sm:text-lg text-[#486581] font-sans font-light leading-relaxed"><strong class="text-[#0D253A] font-semibold">Spesifikasi jelas. Dokumen lengkap.</strong> Angkasa Karya Medika hadir sebagai mitra pengadaan B2B yang menjembatani kebutuhan fasilitas kesehatan, laboratorium klinis, dan lembaga riset terhadap reagen berkualitas serta instrumen diagnostik yang andal.</p>
      </motion.div>

      <!-- Main Overview Card -->
      <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut', delay: 0.1 }" :viewport="{ once: true, amount: 0.2 }" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-md p-6 sm:p-10 shadow-sm border border-slate-200/70">
        <div class="lg:col-span-7 space-y-5">
          <SectionHeading eyebrow="Fondasi Perusahaan" title="Transparansi Teknis, Ketepatan Mutu, dan Respon Cepat" />
          <p class="text-[14.5px] text-[#486581] font-sans font-light leading-relaxed">Dalam dunia analisis laboratorium dan medis, akurasi data tidak dapat dikompromikan. Kami membangun proses distribusi yang mengutamakan kejelasan spesifikasi: setiap nomor katalog, grade analitis, dan izin edar resmi dicantumkan secara terbuka untuk memudahkan tim procurement dan analis mengevaluasi kesesuaian produk sebelum pembelian.</p>
          <p class="text-[14.5px] text-[#486581] font-sans font-light leading-relaxed">Beroperasi dengan basis operasional strategis di wilayah Bogor, Jawa Barat, kami memprioritaskan pemenuhan kebutuhan cepat di kawasan <strong>Jabodetabek</strong> serta menjangkau jaringan fasilitas kesehatan secara nasional.</p>

          <div class="pt-2 flex flex-wrap gap-4 text-[13px] font-manrope font-semibold text-[#0D253A]">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-[#89CBDD]" />
              <span>Prioritas Pasokan Jabodetabek</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-[#89CBDD]" />
              <span>Produk Berizin Edar Resmi</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-[#89CBDD]" />
              <span>Dukungan Dokumen SDS/COA</span>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5 bg-[#E9F8FF] rounded-md p-6 space-y-4 border border-slate-200/60">
          <div class="flex items-center gap-3 pb-3 border-b border-slate-200/50">
            <div class="w-12 h-12 rounded-md bg-white p-1 flex items-center justify-center border border-slate-200/60">
              <img :src="settings.logo_url || '/brand/logo_akm.jpg'" :alt="`Logo ${settings.company_name}`" loading="lazy" decoding="async" class="w-full h-full object-contain" />
            </div>
            <div>
              <span class="font-manrope font-bold text-[16px] text-[#0D2235] block">{{ settings.company_legal_name || settings.company_name }}</span>
              <span class="text-[12px] text-[#486581]">Legalitas & Distribusi Resmi</span>
            </div>
          </div>

          <div class="space-y-3 text-[13px] text-[#486581]">
            <div class="flex items-start gap-2.5">
              <MapPin class="w-4 h-4 text-[#89CBDD] shrink-0 mt-0.5" />
              <span>{{ settings.address }}</span>
            </div>
            <div class="flex items-center gap-2.5">
              <Phone class="w-4 h-4 text-[#89CBDD] shrink-0" />
              <span>{{ settings.phone }}</span>
            </div>
            <div class="flex items-center gap-2.5">
              <ShieldCheck class="w-4 h-4 text-[#89CBDD] shrink-0" />
              <span>{{ settings.regulation_info }}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <!-- Segmen Layanan -->
      <div class="space-y-6">
        <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut' }" :viewport="{ once: true, amount: 0.2 }">
          <SectionHeading eyebrow="Segmen Layanan" title="Fasilitas yang Kami Layani" description="Format penawaran dan tata kelola logistik berdasarkan kebutuhan spesifik masing-masing institusi." />
        </motion.div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut', delay: 0.08 }" :viewport="{ once: true, amount: 0.2 }" class="p-6 rounded-md bg-white space-y-3 shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-200/70">
            <div class="w-10 h-10 rounded-xl bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center">
              <Building2 class="w-5 h-5" />
            </div>
            <h4 class="font-manrope font-bold text-[16px] text-[#0D2235]">Rumah Sakit & Klinik</h4>
            <p class="text-[13px] text-[#486581] font-sans font-light leading-relaxed">Pasokan reagen uji diagnostik cepat dan instrumen laboratorium untuk mendukung pelayanan pasien harian.</p>
          </motion.div>

          <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut', delay: 0.16 }" :viewport="{ once: true, amount: 0.2 }" class="p-6 rounded-md bg-white space-y-3 shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-200/70">
            <div class="w-10 h-10 rounded-xl bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center">
              <FileCheck class="w-5 h-5" />
            </div>
            <h4 class="font-manrope font-bold text-[16px] text-[#0D2235]">Laboratorium Klinis Mandiri</h4>
            <p class="text-[13px] text-[#486581] font-sans font-light leading-relaxed">Ketersediaan bahan acuan kontrol kualitas (QC) berkala dan kit pengujian dengan lot terstandarisasi.</p>
          </motion.div>

          <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut', delay: 0.24 }" :viewport="{ once: true, amount: 0.2 }" class="p-6 rounded-md bg-white space-y-3 shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-200/70">
            <div class="w-10 h-10 rounded-xl bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <h4 class="font-manrope font-bold text-[16px] text-[#0D2235]">Universitas & Riset</h4>
            <p class="text-[13px] text-[#486581] font-sans font-light leading-relaxed">Dukungan pengadaan reagen analitis kemurnian tinggi dan larutan buffer untuk proyek penelitian ilmiah.</p>
          </motion.div>

          <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut', delay: 0.32 }" :viewport="{ once: true, amount: 0.2 }" class="p-6 rounded-md bg-white space-y-3 shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-200/70">
            <div class="w-10 h-10 rounded-xl bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center">
              <Clock class="w-5 h-5" />
            </div>
            <h4 class="font-manrope font-bold text-[16px] text-[#0D2235]">Distributor Regional</h4>
            <p class="text-[13px] text-[#486581] font-sans font-light leading-relaxed">Kemitraan pasokan grosir B2B untuk penyalur alat kesehatan dan reagen di berbagai daerah.</p>
          </motion.div>
        </div>
      </div>

      <!-- Action Banner -->
      <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut' }" :viewport="{ once: true, amount: 0.2 }" class="relative overflow-hidden p-8 sm:p-12 rounded-md bg-[#0D253A] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border border-white/10">
        <div class="space-y-3 relative z-10 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 text-[#A3EEEC] text-[11.5px] font-manrope font-bold uppercase tracking-wider">
            <span class="w-2 h-2 rounded-xl bg-[#A3EEEC] animate-pulse" />
            <span>Kemitraan Pasokan Medis & Laboratorium</span>
          </div>

          <h3 class="font-manrope font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-snug">Rencanakan Pasokan Reagen Berkala Tanpa Gangguan Operasional</h3>

          <p class="text-[14.5px] text-[#D0F2F9]/85 font-sans font-light leading-relaxed">Diskusikan estimasi kebutuhan rutin fasilitas kesehatan Anda, jadwal buffer stock, serta dokumen perizinan resmi bersama tim distribusi kami.</p>
        </div>

        <button type="button" class="group relative z-10 px-6 py-3 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-extrabold text-[14px] transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-md" @click="openModal()">
          <span>Penawaran</span>
          <ArrowRight class="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300 text-[#082838]" />
        </button>
      </motion.div>
    </div>
  </div>
</template>
