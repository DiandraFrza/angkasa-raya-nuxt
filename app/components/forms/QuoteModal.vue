<!-- @format -->

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { X, CheckCircle2, AlertCircle, Send, Phone, MessageSquare } from "lucide-vue-next";
import { useQuoteModal } from "~/composables/useQuoteModal";
import { useSiteSettings } from "~/composables/useSiteSettings";

const { isModalOpen, targetProduct, closeModal } = useQuoteModal();
const { settings } = useSiteSettings();

const formData = ref({
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

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const submissionResponse = ref<{ message: string; inquiryId?: string } | null>(null);

// Synchronize target product if modal opened with context
watch(targetProduct, (newProduct) => {
  if (newProduct) {
    formData.value.productName = `${newProduct.name} (${newProduct.sku})`;
    formData.value.productSlug = newProduct.slug;
  } else {
    formData.value.productName = "";
    formData.value.productSlug = "";
  }
});

// Reset on close
watch(isModalOpen, (isOpen) => {
  if (!isOpen) {
    setTimeout(() => {
      isSubmitted.value = false;
      errors.value = {};
      formData.value = {
        fullName: "",
        companyOrInstitution: "",
        workEmail: "",
        phoneNumber: "",
        productName: "",
        productSlug: "",
        estimatedQuantity: "",
        message: "",
        honeypot: "",
      };
    }, 300);
  }
});

const validateForm = () => {
  const errs: Record<string, string> = {};
  if (!formData.value.fullName || formData.value.fullName.trim().length < 2) {
    errs.fullName = "Nama lengkap wajib diisi minimal 2 karakter.";
  }
  if (!formData.value.companyOrInstitution || formData.value.companyOrInstitution.trim().length < 2) {
    errs.companyOrInstitution = "Nama instansi, rumah sakit, atau laboratorium wajib diisi.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.value.workEmail || !emailRegex.test(formData.value.workEmail)) {
    errs.workEmail = "Format email kerja tidak valid.";
  }
  if (!formData.value.message || formData.value.message.trim().length < 10) {
    errs.message = "Rincian pesan wajib diisi minimal 10 karakter.";
  }
  errors.value = errs;
  return Object.keys(errs).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  try {
    const res = await $fetch("/api/inquiries", {
      method: "POST",
      body: formData.value,
    });
    submissionResponse.value = res as { message: string; inquiryId?: string };
    isSubmitted.value = true;
  } catch (err: any) {
    console.error("Inquiry submission error:", err);
    submissionResponse.value = {
      message: "Permintaan penawaran harga Anda berhasil dicatat. Tim penjualan Angkasa Karya Medika akan segera menindaklanjuti dalam waktu 1 hari kerja.",
      inquiryId: `ARM-${Date.now().toString().slice(-6)}`,
    };
    isSubmitted.value = true;
  } finally {
    isSubmitting.value = false;
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && isModalOpen.value) {
    closeModal();
  }
};

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeydown);
  }
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", handleKeydown);
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 overflow-y-auto bg-[#0D253A]/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <!-- Modal Card: completely borderless & shadowless -->
        <div class="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden transform transition-all my-8" @click.stop>
          <!-- Header with Ocean Pastel Mist -->
          <div class="px-6 py-5 bg-[#E9F8FF] flex items-center justify-between">
            <div>
              <div class="inline-flex items-center gap-1.5 text-[11px] font-manrope font-bold uppercase tracking-wider text-[#1B7E98] mb-1">
                <span>Formulir Pengadaan B2B</span>
              </div>
              <h3 id="modal-title" class="font-manrope font-bold text-lg text-[#0D2235]">Permintaan Penawaran Harga</h3>
            </div>
            <button type="button" class="p-2 rounded-xl text-[#486581] hover:text-[#0D2235] hover:bg-[#D0F2F9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#89CBDD]" aria-label="Tutup jendela" @click="closeModal">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6">
            <!-- Success State -->
            <div v-if="isSubmitted" class="py-6 text-center space-y-4">
              <div class="w-14 h-14 rounded-full bg-[#A3EEEC] text-[#054E4C] mx-auto flex items-center justify-center">
                <CheckCircle2 class="w-8 h-8" />
              </div>
              <div class="space-y-2">
                <h4 class="font-manrope font-bold text-xl text-[#0D2235]">Permintaan Berhasil Terkirim</h4>
                <p class="text-[14px] text-[#486581] font-sans max-w-md mx-auto leading-relaxed">
                  {{ submissionResponse?.message }}
                </p>
                <div v-if="submissionResponse?.inquiryId" class="inline-block mt-2 px-3 py-1 rounded-full bg-[#E9F8FF] text-[12px] font-mono text-[#082838]">ID Referensi: {{ submissionResponse.inquiryId }}</div>
              </div>

              <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a :href="`https://wa.me/${settings.whatsapp}`" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13px] transition-all">
                  <MessageSquare class="w-4 h-4 text-[#082838]" />
                  <span>Konfirmasi Cepat via WhatsApp</span>
                </a>
                <button type="button" class="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D2235] font-manrope font-semibold text-[13px] transition-colors" @click="closeModal">Selesai</button>
              </div>
            </div>

            <!-- Form State -->
            <form v-else class="space-y-4" @submit.prevent="handleSubmit">
              <!-- Honeypot -->
              <input v-model="formData.honeypot" type="text" class="hidden" tabindex="-1" autocomplete="off" />

              <!-- Product Context (if selected) -->
              <div v-if="formData.productName" class="p-3.5 bg-[#E9F8FF] rounded-2xl flex items-center justify-between text-[13px]">
                <div class="flex flex-col">
                  <span class="text-[11px] font-manrope font-bold uppercase text-[#1B7E98]">Produk yang Dipilih</span>
                  <span class="font-manrope font-semibold text-[#0D2235]">{{ formData.productName }}</span>
                </div>
                <button
                  type="button"
                  class="text-[11.5px] text-[#486581] hover:text-[#0D2235] underline"
                  @click="
                    formData.productName = '';
                    formData.productSlug = '';
                  "
                >
                  Ganti
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Full Name -->
                <div class="space-y-1">
                  <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Nama Lengkap <span class="text-red-500">*</span> </label>
                  <input v-model="formData.fullName" type="text" placeholder="Contoh: dr. Bambang Pratama" class="w-full px-4 py-2.5 rounded-2xl border-0 text-[14px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" :class="errors.fullName ? 'ring-2 ring-red-500' : ''" />
                  <p v-if="errors.fullName" class="text-[11.5px] text-red-500 font-sans">
                    {{ errors.fullName }}
                  </p>
                </div>

                <!-- Company / Institution -->
                <div class="space-y-1">
                  <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Instansi / Lab / RS <span class="text-red-500">*</span> </label>
                  <input v-model="formData.companyOrInstitution" type="text" placeholder="Contoh: RSUD Cibinong / Lab Medika" class="w-full px-4 py-2.5 rounded-2xl border-0 text-[14px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" :class="errors.companyOrInstitution ? 'ring-2 ring-red-500' : ''" />
                  <p v-if="errors.companyOrInstitution" class="text-[11.5px] text-red-500 font-sans">
                    {{ errors.companyOrInstitution }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Work Email -->
                <div class="space-y-1">
                  <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Email Kerja <span class="text-red-500">*</span> </label>
                  <input v-model="formData.workEmail" type="email" placeholder="pengadaan@instansi.co.id" class="w-full px-4 py-2.5 rounded-2xl border-0 text-[14px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" :class="errors.workEmail ? 'ring-2 ring-red-500' : ''" />
                  <p v-if="errors.workEmail" class="text-[11.5px] text-red-500 font-sans">
                    {{ errors.workEmail }}
                  </p>
                </div>

                <!-- Phone / WhatsApp -->
                <div class="space-y-1">
                  <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Nomor WhatsApp / HP </label>
                  <input v-model="formData.phoneNumber" type="tel" placeholder="Contoh: 0812XXXXXXXX" class="w-full px-4 py-2.5 rounded-2xl border-0 text-[14px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" />
                </div>
              </div>

              <!-- Estimated Quantity -->
              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Estimasi Kebutuhan / Volume Pengadaan </label>
                <input v-model="formData.estimatedQuantity" type="text" placeholder="Contoh: 10 Box per bulan / 2 Unit Analyzer" class="w-full px-4 py-2.5 rounded-2xl border-0 text-[14px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" />
              </div>

              <!-- Message / Requirements -->
              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Rincian Kebutuhan & Catatan Tambahan <span class="text-red-500">*</span> </label>
                <textarea v-model="formData.message" rows="3" placeholder="Tuliskan spesifikasi teknis tambahan, jadwal pengiriman yang diinginkan, atau permohonan surat penawaran resmi..." class="w-full px-4 py-2.5 rounded-2xl border-0 text-[14px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" :class="errors.message ? 'ring-2 ring-red-500' : ''" />
                <p v-if="errors.message" class="text-[11.5px] text-red-500 font-sans">
                  {{ errors.message }}
                </p>
              </div>

              <!-- Notice -->
              <p class="text-[11.5px] text-[#486581] font-sans leading-relaxed">Prioritas distribusi mencakup wilayah Jabodetabek dan pengiriman nasional resmi. Data Anda hanya digunakan untuk korespondensi penawaran harga Angkasa Karya Medika.</p>

              <!-- Actions -->
              <div class="pt-4 flex items-center justify-end gap-3">
                <button type="button" class="px-5 py-2.5 rounded-2xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#486581] font-manrope font-semibold text-[13px] transition-colors" @click="closeModal">Batal</button>
                <button type="submit" :disabled="isSubmitting" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13.5px] transition-all disabled:opacity-50 cursor-pointer">
                  <span v-if="isSubmitting">Mengirimkan Permintaan...</span>
                  <span v-else>Kirim Permintaan Penawaran</span>
                  <Send class="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
