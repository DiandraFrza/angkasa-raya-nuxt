<!-- @format -->

<script setup lang="ts">
import { ArrowRight, ShieldCheck, CheckCircle2, Award, Clock, FileCheck } from "lucide-vue-next";
import { motion } from "motion-v";
import { useQuoteModal } from "~/composables/useQuoteModal";

const { openModal } = useQuoteModal();
</script>

<template>
  <section class="relative overflow-hidden pt-10 pb-18 lg:pt-16 lg:pb-28 bg-[#E9F8FF]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        <!-- LEFT: Giant Typography & Value Proposition (7 cols) -->
        <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut' }" :viewport="{ once: true, amount: 0.2 }" class="lg:col-span-7 space-y-7">
          <!-- Eyebrow Badge: Soft Ocean Mint -->
          <!-- <div>
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A3EEEC]/60 text-[12px] font-manrope font-bold text-[#054E4C] border border-slate-200/40">
              <span class="w-2 h-2 rounded-full bg-[#89CBDD] animate-pulse" />
              <span>Mitra Resmi Fasilitas Diagnostik & Rumah Sakit</span>
            </div>
          </div> -->

          <!-- Giant Typography with Extreme Font Weight Contrast -->
          <div class="space-y-1">
            <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] leading-[0.98] tracking-tight">
              <!-- Heavy ExtraBold/Black modern sans-serif -->
              <span class="block font-black font-manrope text-[#0D2235]"> Suplai Reagen Lab. </span>
              <!-- Sleek Light weight sans-serif -->
              <span class="block font-light font-sans text-[#486581] mt-2"> Standar Resmi RS. </span>
            </h1>
          </div>

          <!-- Small Sub-headline with Clinical Clarity (Punchy & Direct) -->
          <div class="space-y-2">
            <p class="text-base sm:text-lg font-bold font-manrope text-[#0D253A] tracking-tight">Spesifikasi jelas. Dokumen lengkap.</p>
            <p class="text-[15px] sm:text-base text-[#486581] font-sans font-normal leading-relaxed max-w-xl">Penyedia reagen diagnostik, standar acuan analitis, dan instrumen laboratorium terverifikasi izin Kemenkes RI untuk fasilitas kesehatan dan riset.</p>
          </div>

          <!-- Key Proof Points (Clean Neobrutalist Grid) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[13.5px] text-[#0D253A] font-medium font-sans">
            <div class="flex items-center gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-[#89CBDD] shrink-0" />
              <span>Spesifikasi teknis & kemasan terverifikasi</span>
            </div>
            <div class="flex items-center gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-[#89CBDD] shrink-0" />
              <span>Prioritas pasokan wilayah Jabodetabek</span>
            </div>
            <div class="flex items-center gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-[#89CBDD] shrink-0" />
              <span>Format RFQ langsung ke distributor resmi</span>
            </div>
            <div class="flex items-center gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-[#89CBDD] shrink-0" />
              <span>Dokumen mutu & sertifikat analisis (COA)</span>
            </div>
          </div>

          <!-- Primary CTAs matching Client Brand Palette -->
          <div class="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <NuxtLink to="/products" class="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-extrabold text-[15px] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-xs hover:shadow-md">
              <span>Jelajahi Katalog Produk</span>
              <ArrowRight class="w-4 h-4 text-[#082838] transform group-hover:translate-x-1.5 transition-transform duration-300" />
            </NuxtLink>

            <button type="button" class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-bold text-[15px] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-xs border border-slate-200/60" @click="openModal()">
              <span>Minta Penawaran Harga</span>
            </button>
          </div>
        </motion.div>

        <!-- RIGHT: Clean Showcase Stage (5 cols) -->
        <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut', delay: 0.2 }" :viewport="{ once: true, amount: 0.2 }" class="lg:col-span-5 relative">
          <div class="relative mx-auto max-w-md lg:max-w-none">
            <!-- Clean Natural White Card Container (Max 1px subtle neutral border) -->
            <div class="relative rounded-3xl bg-white p-6 shadow-xl shadow-[#0D253A]/5 border border-slate-100 overflow-hidden">
              <!-- Card Header -->
              <div class="flex items-center justify-between pb-4 mb-3 text-[12px] font-manrope border-b border-slate-100/80">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-[#89CBDD]" />
                  <span class="font-bold text-[#0D253A] uppercase tracking-wide">Produk Unggulan Resmi</span>
                </div>
                <span class="text-[#1B7E98] font-bold">Izin Edar Kemenkes RI</span>
              </div>

              <!-- Product Image Showcase -->
              <div class="relative aspect-[4/3] rounded-2xl bg-[#E9F8FF] overflow-hidden flex items-center justify-center p-5 group">
                <!-- Floating Certification Badges -->
                <div class="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                  <div class="px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[11px] font-manrope font-bold text-[#054E4C] shadow-xs flex items-center gap-1.5 border border-slate-100">
                    <ShieldCheck class="w-3.5 h-3.5 text-emerald-600" />
                    <span>ISO Certified</span>
                  </div>
                  <div class="px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[11px] font-manrope font-bold text-[#0D253A] shadow-xs flex items-center gap-1.5 border border-slate-100">
                    <Award class="w-3.5 h-3.5 text-[#1B7E98]" />
                    <span>CE Marked</span>
                  </div>
                </div>

                <img src="/images/products/ecotest-hbsag-flyer.png" alt="ECOTEST HBsAg Diagnostic Reagent" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" loading="eager" />

                <!-- Telemetry Card -->
                <div class="absolute bottom-3 right-3 z-20 bg-white/95 backdrop-blur-sm rounded-xl p-2.5 text-left shadow-md w-32 border border-slate-100">
                  <div class="flex items-center justify-between text-[10px] text-[#486581] pb-1 border-b border-slate-100">
                    <span class="font-bold text-[#0D2235]">Spesifikasi</span>
                    <span class="text-[9px] font-mono text-emerald-600 font-bold">READY</span>
                  </div>
                  <div class="grid grid-cols-2 gap-1 pt-1.5 text-[10px]">
                    <div>
                      <span class="block text-[#486581] text-[8.5px]">AKURASI</span>
                      <span class="font-bold text-[#0D2235]">>99%</span>
                    </div>
                    <div>
                      <span class="block text-[#486581] text-[8.5px]">WAKTU</span>
                      <span class="font-bold text-[#0D2235]">15 Mnt</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Product Summary & Action (Punchy Copy) -->
              <div class="pt-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-manrope font-bold text-[#1B7E98] uppercase tracking-wider">Rapid Infectious Disease</span>
                  <span class="text-[11px] font-mono text-[#486581]">50 Cassette/Box</span>
                </div>
                <h3 class="font-manrope font-bold text-[16px] text-[#0D2235] leading-snug">HBSAG Test ECOTEST Rapid Cassette</h3>
                <p class="text-[12.5px] text-[#486581] font-sans font-light leading-relaxed">Deteksi cepat antigen HBsAg dalam darah/serum/plasma dengan hasil 15 menit untuk faskes dan lab rujukan.</p>
                <div class="pt-2 flex items-center justify-between text-[12.5px] border-t border-slate-100 pt-2.5">
                  <span class="text-[#0D253A] font-semibold text-[12px]">Ready Stock Jabodetabek</span>
                  <button type="button" class="text-[#1B7E98] hover:text-[#0D253A] font-manrope font-bold inline-flex items-center gap-1 cursor-pointer transition-colors" @click="openModal({ name: 'HBSAG Test ECOTEST Rapid Cassette', sku: 'ARM-RDT-HBSAG50', slug: 'hbsag-test-ecotest-rapid' })">
                    <span>Minta Penawaran</span>
                    <ArrowRight class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
</template>
