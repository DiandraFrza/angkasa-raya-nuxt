<!-- @format -->

<script setup lang="ts">
import { ref } from "vue";
import { AlertTriangle, Info, Loader2 } from "lucide-vue-next";
import { useActionModal } from "~/composables/useActionModal";
import { useEscapeDismiss, useModalAutoFocus } from "~/composables/useKeyboardShortcuts";

const { successState, confirmState, alertState, closeSuccess, closeConfirm, executeConfirm, closeAlert } = useActionModal();

const confirmModalRef = ref<HTMLElement | null>(null);
const alertModalRef = ref<HTMLElement | null>(null);

useEscapeDismiss(() => successState.value.isOpen, closeSuccess);
useEscapeDismiss(() => confirmState.value.isOpen, closeConfirm);
useEscapeDismiss(() => alertState.value.isOpen, closeAlert);

useModalAutoFocus(() => confirmState.value.isOpen, confirmModalRef);
useModalAutoFocus(() => alertState.value.isOpen, alertModalRef);
</script>

<template>
  <Teleport to="body">
    <!-- 1. MODAL SUKSES DENGAN ANIMASI CEKLIS (OTOMATIS 2 DETIK HILANG) -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="successState.isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0D253A]/40 backdrop-blur-xs select-none" role="alertdialog" aria-live="assertive">
        <div class="relative bg-white rounded-md p-7 max-w-sm w-full text-center shadow-2xl border border-[#ADDFF1]/60 flex flex-col items-center space-y-4 animate-scale-up" @click.stop>
          <!-- Animated Checkmark Icon Wrapper -->
          <div class="relative w-16 h-16 flex items-center justify-center">
            <div class="absolute inset-0 rounded-md bg-[#A3EEEC]/50 animate-ping opacity-40" />
            <div class="w-16 h-16 rounded-md bg-gradient-to-tr from-[#A3EEEC] to-[#89CBDD] flex items-center justify-center shadow-md">
              <svg class="w-9 h-9 text-[#054E4C] checkmark-svg" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="46" height="46" rx="6" stroke="currentColor" stroke-width="3.5" class="opacity-25" />
                <path d="M14 27 L22 35 L38 18" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" class="checkmark-check" />
              </svg>
            </div>
          </div>

          <!-- Message Text -->
          <div class="space-y-1.5">
            <h3 class="font-manrope font-extrabold text-[17px] text-[#0D2235] tracking-tight">
              {{ successState.title }}
            </h3>
            <p v-if="successState.message" class="text-[13px] text-[#486581] font-sans">
              {{ successState.message }}
            </p>
          </div>

          <!-- 2-Second Progress Indicator Bar -->
          <div class="w-28 h-1 bg-[#E9F8FF] rounded-xl overflow-hidden mt-1">
            <div class="h-full bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] animate-shrink-width" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- 2. MODAL KONFIRMASI -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="confirmState.isOpen" class="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-[#0D253A]/50 backdrop-blur-xs select-none" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" @click="closeConfirm">
        <div ref="confirmModalRef" class="relative bg-white rounded-md p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-up text-[#0D2235]" @click.stop>
          <!-- Header Icon & Title -->
          <div class="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div class="w-10 h-10 rounded-md flex items-center justify-center shrink-0" :class="confirmState.isDanger ? 'bg-red-50 text-red-600' : 'bg-[#E9F8FF] text-[#082838]'">
              <AlertTriangle v-if="confirmState.isDanger" class="w-5 h-5" />
              <Info v-else class="w-5 h-5" />
            </div>
            <div>
              <h3 id="confirm-modal-title" class="font-manrope font-bold text-[16px] text-[#0D2235]">
                {{ confirmState.title }}
              </h3>
              <p class="text-[11.5px] text-[#486581] font-sans">Konfirmasi persetujuan tindakan</p>
            </div>
          </div>

          <!-- Body Text -->
          <p class="text-[13.5px] text-[#486581] leading-relaxed font-sans">
            {{ confirmState.message }}
          </p>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-2.5 pt-1">
            <button type="button" :disabled="confirmState.isLoading" class="px-4 py-2 rounded-md bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D2235] font-manrope font-semibold text-[13px] transition-colors cursor-pointer disabled:opacity-50" @click="closeConfirm">
              {{ confirmState.cancelText }}
            </button>

            <button type="button" :disabled="confirmState.isLoading" class="inline-flex items-center gap-2 px-5 py-2 rounded-md font-manrope font-bold text-[13px] transition-all shadow-xs cursor-pointer disabled:opacity-50" :class="confirmState.isDanger ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] text-[#082838]'" @click="executeConfirm">
              <Loader2 v-if="confirmState.isLoading" class="w-4 h-4 animate-spin" />
              <span>{{ confirmState.isLoading ? "Memproses..." : confirmState.confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 3. MODAL PERINGATAN / ALERT -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="alertState.isOpen" class="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-[#0D253A]/40 backdrop-blur-xs select-none" role="alertdialog" aria-modal="true" @click="closeAlert">
        <div ref="alertModalRef" class="relative bg-white rounded-md p-6 max-w-sm w-full shadow-2xl border border-amber-200 space-y-4 animate-scale-up text-[#0D2235]" @click.stop>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle class="w-5 h-5" />
            </div>
            <h3 class="font-manrope font-bold text-[16px] text-[#0D2235]">
              {{ alertState.title }}
            </h3>
          </div>

          <p class="text-[13.5px] text-[#486581] font-sans leading-relaxed">
            {{ alertState.message }}
          </p>

          <div class="flex justify-end pt-1">
            <button type="button" class="px-4 py-2 rounded-md bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#082838] font-manrope font-bold text-[13px] transition-colors cursor-pointer" @click="closeAlert">Oke</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@keyframes drawCheckmark {
  0% {
    stroke-dashoffset: 50;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

.checkmark-check {
  stroke-dasharray: 50;
  stroke-dashoffset: 0;
  animation: drawCheckmark 0.45s ease-out forwards;
}

@keyframes shrinkWidth {
  0% {
    width: 100%;
  }
  100% {
    width: 0%;
  }
}

.animate-shrink-width {
  animation: shrinkWidth 2s linear forwards;
}
</style>
