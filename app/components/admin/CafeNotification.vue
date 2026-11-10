<!-- @format -->

<script setup lang="ts">
import { Bell, Coffee, X, ArrowRight, Volume2, VolumeX } from "lucide-vue-next";
import { useCafeNotification } from "~/composables/useCafeNotification";

const emit = defineEmits<{
  (e: "openInquiry", inquiryId: string): void;
}>();

const { activeNotification, isSoundEnabled, toggleSound, dismissNotification } = useCafeNotification();

const handleOpen = () => {
  if (activeNotification.value) {
    emit("openInquiry", activeNotification.value.id);
    dismissNotification();
  }
};
</script>

<template>
  <Transition enter-active-class="transform transition-all duration-400 ease-out" enter-from-class="opacity-0 translate-y-3 sm:translate-y-0 sm:translate-x-6 scale-95" enter-to-class="opacity-100 translate-y-0 sm:translate-x-0 scale-100" leave-active-class="transform transition-all duration-300 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 translate-y-2 scale-95">
    <div v-if="activeNotification" class="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-50 max-w-sm w-full bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-[#ADDFF1]/60 text-[#0D2235] font-sans antialiased overflow-hidden" role="alert">
      <!-- Top Subtle Indicator Line -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#89CBDD] via-[#A3EEEC] to-[#76BED2]" />

      <div class="flex items-start gap-3.5">
        <!-- Cafe Bell / Coffee Icon with gentle pulse -->
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#89CBDD]/30 to-[#A3EEEC]/50 text-[#054E4C] flex items-center justify-center shrink-0 shadow-inner">
          <Bell class="w-5 h-5 text-[#054E4C] animate-pulse" />
        </div>

        <div class="flex-1 min-w-0 space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[10.5px] font-manrope font-extrabold uppercase tracking-wider text-[#1B7E98] flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              RFQ Masuk Baru
            </span>
            <span class="text-[11px] font-mono text-[#486581]">{{ activeNotification.time }}</span>
          </div>

          <h4 class="font-manrope font-bold text-[14px] text-[#0D2235] truncate leading-snug">
            {{ activeNotification.fullName }}
          </h4>

          <p class="text-[12px] text-[#486581] truncate">
            {{ activeNotification.companyOrInstitution }}
          </p>

          <p v-if="activeNotification.productName" class="text-[11.5px] text-[#054E4C] bg-[#A3EEEC]/30 px-2.5 py-1 rounded-xl truncate font-medium mt-1">Minat: {{ activeNotification.productName }}</p>

          <!-- Action buttons -->
          <div class="pt-2.5 flex items-center justify-between gap-2">
            <button type="button" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#082838] hover:bg-[#0D253A] text-white text-[12px] font-manrope font-bold transition-all cursor-pointer shadow-xs" @click="handleOpen">
              <span>Tinjau Penawaran</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>

            <div class="flex items-center gap-1">
              <button type="button" :title="isSoundEnabled ? 'Suara notifikasi aktif' : 'Suara notifikasi nonaktif'" class="p-1.5 rounded-xl text-[#486581] hover:text-[#0D2235] hover:bg-[#E9F8FF] transition-colors cursor-pointer" @click="toggleSound">
                <Volume2 v-if="isSoundEnabled" class="w-4 h-4 text-emerald-600" />
                <VolumeX v-else class="w-4 h-4 text-gray-400" />
              </button>
              <button type="button" class="p-1.5 rounded-xl text-[#486581] hover:text-red-600 hover:bg-[#E9F8FF] transition-colors cursor-pointer" title="Tutup notifikasi" @click="dismissNotification">
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
