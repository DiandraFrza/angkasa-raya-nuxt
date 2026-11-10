<!-- @format -->

<script setup lang="ts">
import { ArrowLeft, Search, Layers, Home, PhoneCall } from "lucide-vue-next";
import { useSiteSettings } from "~/composables/useSiteSettings";

const props = defineProps<{
  error: {
    url?: string;
    statusCode?: number;
    statusMessage?: string;
    message?: string;
    description?: string;
  };
}>();

const { settings } = useSiteSettings();

const handleError = () => {
  clearError({ redirect: "/products" });
};
</script>

<template>
  <div class="min-h-screen bg-[#E9F8FF] text-[#0D2235] font-sans antialiased flex flex-col justify-between">
    <!-- Header Mini -->
    <header class="py-6 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center overflow-hidden">
          <img :src="settings.logo_url || '/brand/logo_akm.jpg'" :alt="settings.company_name" class="w-full h-full object-contain" />
        </div>
        <span class="font-manrope font-extrabold text-[17px] text-[#0D2235]">{{ settings.company_name }}</span>
      </NuxtLink>

      <NuxtLink to="/products" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white text-[#0D253A] font-manrope font-bold text-[13px] hover:bg-[#D0F2F9] transition-colors">
        <Layers class="w-4 h-4 text-[#89CBDD]" />
        <span>Katalog Produk</span>
      </NuxtLink>
    </header>

    <!-- Center Error Content -->
    <main class="max-w-xl mx-auto px-4 py-12 text-center space-y-6">
      <!-- Error Code Pill -->
      <div class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#D0F2F9] text-[#1B7E98] font-manrope font-extrabold text-3xl sm:text-4xl tracking-tight">
        <span>{{ error.statusCode || 404 }}</span>
      </div>

      <div class="space-y-3">
        <h1 class="font-manrope font-extrabold text-2xl sm:text-3xl text-[#0D2235] tracking-tight">Halaman atau Produk Tidak Ditemukan</h1>

        <p class="text-[14.5px] text-[#486581] font-sans leading-relaxed max-w-md mx-auto">
          {{ error.statusMessage || "Halaman atau spesifikasi produk yang Anda cari mungkin telah diperbarui, dipindahkan, atau belum terdaftar pada katalog resmi." }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button type="button" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[14px] transition-all cursor-pointer" @click="handleError">
          <Search class="w-4 h-4" />
          <span>Cari di Katalog Produk</span>
        </button>

        <NuxtLink to="/" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-bold text-[14px] transition-colors cursor-pointer">
          <Home class="w-4 h-4 text-[#89CBDD]" />
          <span>Kembali ke Beranda</span>
        </NuxtLink>
      </div>
    </main>

    <!-- Footer Mini -->
    <footer class="py-6 px-4 text-center text-[12px] text-[#486581]">
      <p>&copy; {{ new Date().getFullYear() }} {{ settings.company_name }}. Seluruh hak cipta dilindungi.</p>
    </footer>
  </div>
</template>
