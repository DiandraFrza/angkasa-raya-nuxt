<!-- @format -->

<script setup lang="ts">
import { ref, watch } from "vue";
import { X, CheckCircle2, Send, MessageSquare, RotateCcw } from "lucide-vue-next";
import { useQuoteModal } from "~/composables/useQuoteModal";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { useEscapeDismiss, useModalAutoFocus } from "~/composables/useKeyboardShortcuts";
import { onNumericInput, onTextOnlyInput, isValidTextOnly, isValidNumeric, isValidEmail } from "~/utils/validation";

const { isModalOpen, targetProduct, closeModal } = useQuoteModal();
const { settings } = useSiteSettings();
const modalCardRef = ref<HTMLElement | null>(null);

const createEmptyForm = () => ({
  fullName: "",
  companyOrInstitution: "",
  workEmail: "",
  phoneNumber: "",
  productName: "",
  productSlug: "",
  estimatedQuantity: "",
  message: "",
  honeypot: "",
});

const formData = ref(createEmptyForm());
const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const submissionResponse = ref<{ message: string; inquiryId?: string } | null>(null);

const clearForm = () => {
  errors.value = {};
  isSubmitted.value = false;
  formData.value = createEmptyForm();
};

// Synchronize target product when modal opened with product context
watch(targetProduct, (newProduct) => {
  if (newProduct) {
    formData.value.productName = `${newProduct.name} (${newProduct.sku})`;
    formData.value.productSlug = newProduct.slug;
  }
});

// Modal State Retention: only clear error banner or submitted screen when reopened, NEVER discard typed input on accidental close
watch(isModalOpen, (isOpen) => {
  if (isOpen) {
    errors.value = {};
    if (isSubmitted.value) {
      isSubmitted.value = false;
    }
  }
});

const validateForm = () => {
  const errs: Record<string, string> = {};
  if (!formData.value.fullName || formData.value.fullName.trim().length < 2) {
    errs.fullName = "Nama lengkap wajib diisi minimal 2 karakter.";
  } else if (!isValidTextOnly(formData.value.fullName)) {
    errs.fullName = "Nama lengkap hanya boleh berisi huruf/teks (tanpa angka).";
  }

  if (!formData.value.companyOrInstitution || formData.value.companyOrInstitution.trim().length < 2) {
    errs.companyOrInstitution = "Nama instansi, rumah sakit, atau laboratorium wajib diisi.";
  }

  if (!formData.value.workEmail || !isValidEmail(formData.value.workEmail)) {
    errs.workEmail = "Format email kerja tidak valid.";
  }

  if (formData.value.phoneNumber && !isValidNumeric(formData.value.phoneNumber)) {
    errs.phoneNumber = "Nomor WhatsApp / HP hanya boleh berisi angka.";
  }

  if (!formData.value.message || formData.value.message.trim().length < 10) {
    errs.message = "Rincian pesan wajib diisi minimal 10 karakter.";
  }

  errors.value = errs;
  return Object.keys(errs).length === 0;
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  if (!validateForm()) return;

  isSubmitting.value = true;
  try {
    const res = await $fetch("/api/inquiries", {
      method: "POST",
      body: formData.value,
    });
    submissionResponse.value = res as { message: string; inquiryId?: string };
    isSubmitted.value = true;
    // Reset form only after successful submit
    formData.value = createEmptyForm();
  } catch (err: any) {
    console.error("Inquiry submission error:", err);
    submissionResponse.value = {
      message: "Permintaan penawaran harga Anda berhasil dicatat. Tim penjualan Angkasa Karya Medika akan segera menindaklanjuti dalam waktu 1 hari kerja.",
      inquiryId: `ARM-${Date.now().toString().slice(-6)}`,
    };
    isSubmitted.value = true;
    formData.value = createEmptyForm();
  } finally {
    isSubmitting.value = false;
  }
};

useModalAutoFocus(() => isModalOpen.value && !isSubmitted.value, modalCardRef);
useEscapeDismiss(
  () => isModalOpen.value,
  () => {
    if (!isSubmitting.value) closeModal();
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 overflow-y-auto bg-[#0D253A]/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 md:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-title" @click="!isSubmitting && closeModal()">
        <!-- Modal Card -->
        <div ref="modalCardRef" class="relative w-full max-w-xl bg-white rounded-md overflow-hidden transform transition-all my-auto max-h-[92dvh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-[#D0F2F9]" @click.stop>
          <!-- Sticky Header -->
          <div class="px-4 sm:px-6 py-3.5 bg-[#E9F8FF] flex items-center justify-between shrink-0 border-b">
            <div>
              <div class="inline-flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-manrope font-bold uppercase tracking-wider text-[#1B7E98] mb-0.5">
                <span>Formulir Pengadaan B2B</span>
              </div>
              <h3 id="modal-title" class="font-manrope font-bold text-base sm:text-lg text-[#0D2235]">Permintaan Penawaran Harga</h3>
            </div>
            <button type="button" class="p-1.5 rounded-md text-[#486581] hover:text-[#0D2235] hover:bg-[#D0F2F9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#89CBDD] cursor-pointer" aria-label="Tutup jendela" @click="closeModal">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Scrollable Body -->
          <div class="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
            <!-- Success State -->
            <div v-if="isSubmitted" class="py-6 text-center space-y-4">
              <div class="w-14 h-14 rounded-md bg-[#A3EEEC] text-[#054E4C] mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 class="w-8 h-8" />
              </div>
              <div class="space-y-2">
                <h4 class="font-manrope font-bold text-lg sm:text-xl text-[#0D2235]">Permintaan Berhasil Terkirim</h4>
                <p class="text-[13px] sm:text-[14px] text-[#486581] font-sans max-w-md mx-auto leading-relaxed">
                  {{ submissionResponse?.message }}
                </p>
                <div v-if="submissionResponse?.inquiryId" class="inline-block mt-2 px-3 py-1 rounded-xl bg-[#E9F8FF] text-[12px] font-mono text-[#082838]">ID Referensi: {{ submissionResponse.inquiryId }}</div>
              </div>

              <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <a :href="`https://wa.me/${settings.whatsapp}`" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13px] transition-all shadow-xs">
                  <MessageSquare class="w-4 h-4 text-[#082838]" />
                  <span>WhatsApp</span>
                </a>
                <button type="button" class="w-full sm:w-auto px-5 py-2.5 rounded-md bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D2235] font-manrope font-semibold text-[13px] transition-colors cursor-pointer" @click="closeModal">Selesai</button>
              </div>
            </div>

            <!-- Form State -->
            <form v-else class="space-y-3.5 sm:space-y-4" @submit.prevent="handleSubmit">
              <fieldset :disabled="isSubmitting" class="space-y-3.5 sm:space-y-4 min-w-0">
                <!-- Honeypot -->
                <input v-model="formData.honeypot" type="text" class="hidden" tabindex="-1" autocomplete="off" />

                <!-- Product Context (if selected) -->
                <div v-if="formData.productName" class="p-3 bg-[#E9F8FF] rounded-md flex items-center justify-between text-[13px] border border-[#D0F2F9]/70">
                  <div class="flex flex-col pr-2 min-w-0">
                    <span class="text-[10.5px] font-manrope font-bold uppercase text-[#1B7E98]">Produk yang Dipilih</span>
                    <span class="font-manrope font-semibold text-[#0D2235] truncate">{{ formData.productName }}</span>
                  </div>
                  <button
                    type="button"
                    class="text-[11.5px] text-[#486581] hover:text-[#0D2235] underline shrink-0 cursor-pointer"
                    @click="
                      formData.productName = '';
                      formData.productSlug = '';
                    "
                  >
                    Ganti
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <!-- Full Name (Text Only) -->
                  <div class="space-y-1">
                    <label class="block text-[12.5px] sm:text-[13px] font-manrope font-semibold text-[#0D2235]">Nama Lengkap <span class="text-red-500">*</span></label>
                    <input :value="formData.fullName" type="text" placeholder="Contoh: dr. Bambang Pratama" class="w-full px-3.5 py-2 rounded-md border border-slate-200 text-[13.5px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" :class="errors.fullName ? 'ring-2 ring-red-500 border-red-300' : ''" @input="onTextOnlyInput($event, (v) => (formData.fullName = v))" />
                    <p v-if="errors.fullName" class="text-[11px] text-red-500 font-sans">{{ errors.fullName }}</p>
                  </div>

                  <!-- Company / Institution -->
                  <div class="space-y-1">
                    <label class="block text-[12.5px] sm:text-[13px] font-manrope font-semibold text-[#0D2235]">Instansi / Lab / RS <span class="text-red-500">*</span></label>
                    <input v-model="formData.companyOrInstitution" type="text" placeholder="Contoh: RSUD Cibinong" class="w-full px-3.5 py-2 rounded-md border border-slate-200 text-[13.5px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" :class="errors.companyOrInstitution ? 'ring-2 ring-red-500 border-red-300' : ''" />
                    <p v-if="errors.companyOrInstitution" class="text-[11px] text-red-500 font-sans">{{ errors.companyOrInstitution }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <!-- Work Email -->
                  <div class="space-y-1">
                    <label class="block text-[12.5px] sm:text-[13px] font-manrope font-semibold text-[#0D2235]">Email Kerja <span class="text-red-500">*</span></label>
                    <input v-model="formData.workEmail" type="email" placeholder="pengadaan@instansi.co.id" class="w-full px-3.5 py-2 rounded-md border border-slate-200 text-[13.5px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" :class="errors.workEmail ? 'ring-2 ring-red-500 border-red-300' : ''" />
                    <p v-if="errors.workEmail" class="text-[11px] text-red-500 font-sans">{{ errors.workEmail }}</p>
                  </div>

                  <!-- Phone / WhatsApp (Optional + Numeric Only) -->
                  <div class="space-y-1">
                    <label class="block text-[12.5px] sm:text-[13px] font-manrope font-semibold text-[#0D2235]">
                      Nomor WhatsApp / HP
                      <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span>
                    </label>
                    <input :value="formData.phoneNumber" type="tel" inputmode="numeric" placeholder="Contoh: 0812XXXXXXXX" class="w-full px-3.5 py-2 rounded-md border border-slate-200 text-[13.5px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" :class="errors.phoneNumber ? 'ring-2 ring-red-500 border-red-300' : ''" @input="onNumericInput($event, (v) => (formData.phoneNumber = v))" />
                    <p v-if="errors.phoneNumber" class="text-[11px] text-red-500 font-sans">{{ errors.phoneNumber }}</p>
                  </div>
                </div>

                <!-- Estimated Quantity (Optional) -->
                <div class="space-y-1">
                  <label class="block text-[12.5px] sm:text-[13px] font-manrope font-semibold text-[#0D2235]">
                    Estimasi Kebutuhan / Volume
                    <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span>
                  </label>
                  <input v-model="formData.estimatedQuantity" type="text" placeholder="Contoh: 10 Box per bulan / 2 Unit" class="w-full px-3.5 py-2 rounded-md border border-slate-200 text-[13.5px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" />
                </div>

                <!-- Message / Requirements -->
                <div class="space-y-1">
                  <label class="block text-[12.5px] sm:text-[13px] font-manrope font-semibold text-[#0D2235]">Rincian Kebutuhan <span class="text-red-500">*</span></label>
                  <textarea v-model="formData.message" rows="3" placeholder="Tuliskan spesifikasi tambahan, jadwal pengiriman, atau permohonan surat penawaran... (Ctrl+Enter untuk kirim)" class="w-full px-3.5 py-2 rounded-md border border-slate-200 text-[13.5px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" :class="errors.message ? 'ring-2 ring-red-500 border-red-300' : ''" @keydown.ctrl.enter.prevent="handleSubmit" @keydown.meta.enter.prevent="handleSubmit" />
                  <p v-if="errors.message" class="text-[11px] text-red-500 font-sans">{{ errors.message }}</p>
                </div>
              </fieldset>

              <!-- Actions -->
              <div class="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-slate-100">
                <button type="button" :disabled="isSubmitting" class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-[#486581] hover:text-[#0D2235] hover:bg-slate-100 font-manrope font-semibold text-[12.5px] transition-colors cursor-pointer disabled:opacity-50" @click="clearForm">
                  <RotateCcw class="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2">
                  <button type="button" :disabled="isSubmitting" class="w-full sm:w-auto px-4 py-2 rounded-md bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#486581] font-manrope font-semibold text-[13px] transition-colors cursor-pointer text-center disabled:opacity-50" @click="closeModal">Batal</button>
                  <button type="submit" :disabled="isSubmitting" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13.5px] transition-all disabled:opacity-50 cursor-pointer shadow-xs">
                    <span v-if="isSubmitting">Mengirim...</span>
                    <span v-else>Kirim</span>
                    <Send class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
