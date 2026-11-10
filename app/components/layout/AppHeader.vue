<!-- @format -->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Menu, X, ArrowRight, Phone } from "lucide-vue-next";
import { useQuoteModal } from "~/composables/useQuoteModal";
import { useSiteSettings } from "~/composables/useSiteSettings";

const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const { openModal } = useQuoteModal();
const { settings } = useSiteSettings();

const handleScroll = () => {
  if (typeof window !== "undefined") {
    isScrolled.value = window.scrollY > 20;
  }
};

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("scroll", handleScroll);
  }
});

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-40 transition-all duration-300" :class="[isScrolled ? 'bg-white/95 backdrop-blur-md py-3 shadow-sm' : 'bg-[#E9F8FF]/90 backdrop-blur-sm py-4']">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <!-- Logo & Brand Identity -->
        <NuxtLink to="/" class="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#89CBDD] rounded-2xl p-1" @click="closeMobileMenu">
          <div class="relative w-10 h-10 rounded-2xl overflow-hidden bg-white flex items-center justify-center p-1">
            <img :src="settings.logo_url || '/brand/logo_akm.jpg'" :alt="`Logo ${settings.company_name}`" class="w-full h-full object-contain" loading="eager" />
          </div>
          <div class="flex flex-col">
            <span class="font-manrope font-extrabold text-[17px] tracking-tight text-[#0D2235] group-hover:text-[#1B7E98] transition-colors leading-tight">
              {{ settings.company_name }}
            </span>
            <span class="text-[11px] font-manrope font-semibold tracking-wider uppercase text-[#486581]">
              {{ settings.tagline }}
            </span>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-8 text-[14.5px] font-medium" aria-label="Navigasi Utama">
          <NuxtLink to="/products" class="text-[#486581] hover:text-[#1B7E98] transition-colors py-1 relative font-manrope" active-class="text-[#082838] font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#89CBDD] after:rounded-full"> Katalog Produk </NuxtLink>
          <NuxtLink to="/about" class="text-[#486581] hover:text-[#1B7E98] transition-colors py-1 relative font-manrope" active-class="text-[#082838] font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#89CBDD] after:rounded-full"> Tentang Kami </NuxtLink>
          <NuxtLink to="/contact" class="text-[#486581] hover:text-[#1B7E98] transition-colors py-1 relative font-manrope" active-class="text-[#082838] font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#89CBDD] after:rounded-full"> Kontak </NuxtLink>
        </nav>

        <!-- Action Buttons -->
        <div class="hidden sm:flex items-center gap-3.5">
          <a :href="`https://wa.me/${settings.whatsapp}`" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-3.5 py-2 text-[13.5px] font-manrope font-semibold text-[#0D253A] hover:text-[#082838] hover:bg-[#D0F2F9] transition-colors rounded-2xl">
            <Phone class="w-4 h-4 text-[#89CBDD]" />
            <span>{{ settings.phone }}</span>
          </a>

          <button type="button" class="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13.5px] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-xs" @click="openModal()">
            <span>Minta Penawaran</span>
            <ArrowRight class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-[#082838]" />
          </button>
        </div>

        <!-- Mobile Menu Toggle Button -->
        <div class="flex items-center md:hidden">
          <button type="button" class="p-2 rounded-xl text-[#0D2235] hover:bg-[#D0F2F9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#89CBDD]" :aria-label="isMobileMenuOpen ? 'Tutup Menu' : 'Buka Menu'" :aria-expanded="isMobileMenuOpen" @click="isMobileMenuOpen = !isMobileMenuOpen">
            <X v-if="isMobileMenuOpen" class="w-6 h-6" />
            <Menu v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Slide-Down Menu -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-3" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-3">
      <div v-if="isMobileMenuOpen" class="md:hidden bg-white px-4 pt-3 pb-6 space-y-3">
        <NuxtLink to="/products" class="block py-2.5 px-3 rounded-2xl font-manrope font-medium text-[15px] text-[#0D2235] hover:bg-[#E9F8FF] hover:text-[#1B7E98]" active-class="bg-[#D0F2F9] text-[#082838] font-bold" @click="closeMobileMenu"> Katalog Produk </NuxtLink>
        <NuxtLink to="/about" class="block py-2.5 px-3 rounded-2xl font-manrope font-medium text-[15px] text-[#0D2235] hover:bg-[#E9F8FF] hover:text-[#1B7E98]" active-class="bg-[#D0F2F9] text-[#082838] font-bold" @click="closeMobileMenu"> Tentang Kami </NuxtLink>
        <NuxtLink to="/contact" class="block py-2.5 px-3 rounded-2xl font-manrope font-medium text-[15px] text-[#0D2235] hover:bg-[#E9F8FF] hover:text-[#1B7E98]" active-class="bg-[#D0F2F9] text-[#082838] font-bold" @click="closeMobileMenu"> Kontak </NuxtLink>

        <div class="pt-3 space-y-2.5">
          <button
            type="button"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] text-[#082838] font-manrope font-bold text-[14px]"
            @click="
              openModal();
              closeMobileMenu();
            "
          >
            <span>Minta Penawaran Harga</span>
            <ArrowRight class="w-4 h-4" />
          </button>
          <a :href="`https://wa.me/${settings.whatsapp}`" target="_blank" rel="noopener noreferrer" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[14px]">
            <Phone class="w-4 h-4 text-[#89CBDD]" />
            <span>{{ settings.phone }} (WhatsApp)</span>
          </a>
        </div>
      </div>
    </Transition>
  </header>
</template>
