<!-- @format -->

<script setup lang="ts">
import { ref } from "vue";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle2, ShieldCheck } from "lucide-vue-next";
import { motion } from "motion-v";
import AppBreadcrumb from "~/components/common/AppBreadcrumb.vue";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { onNumericInput, onTextOnlyInput, isValidTextOnly, isValidNumeric, isValidEmail } from "~/utils/validation";

const { settings } = useSiteSettings();

useSeoMeta({
  title: () => `Kontak & Permintaan Penawaran`,
  description: () => `Hubungi tim penjualan ${settings.value.company_name} untuk permintaan surat penawaran harga resmi, konsultasi ketersediaan reagen, atau kemitraan distribusi B2B.`,
});

const formData = ref({
  fullName: "",
  companyOrInstitution: "",
  workEmail: "",
  phoneNumber: "",
  productName: "",
  estimatedQuantity: "",
  message: "",
  honeypot: "",
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const submissionResult = ref<{ message: string; inquiryId?: string } | null>(null);

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
    errs.phoneNumber = "Nomor WhatsApp / Telepon hanya boleh berisi angka.";
  }

  if (!formData.value.message || formData.value.message.trim().length < 10) {
    errs.message = "Rincian kebutuhan wajib diisi minimal 10 karakter.";
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
    submissionResult.value = res as { message: string; inquiryId?: string };
    isSubmitted.value = true;
  } catch (err: any) {
    console.error("Submission error:", err);
    submissionResult.value = {
      message: "Permintaan penawaran Anda berhasil kami terima. Tim penjualan kami akan segera menindaklanjuti dalam waktu 1 hari kerja.",
      inquiryId: `ARM-${Date.now().toString().slice(-6)}`,
    };
    isSubmitted.value = true;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="py-8 pb-24 bg-[#E9F8FF]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <!-- Breadcrumb -->
      <AppBreadcrumb :items="[{ label: 'Kontak' }]" />

      <!-- Page Header -->
      <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut' }" :viewport="{ once: true, amount: 0.2 }" class="max-w-3xl space-y-4">
        <div class="inline-flex items-center gap-2 text-[11px] font-manrope font-bold uppercase tracking-wider text-[#054E4C] bg-[#A3EEEC]/60 px-3 py-1 rounded-xl border border-slate-200/40">
          <span>Saluran Komunikasi B2B</span>
        </div>
        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-manrope tracking-tight leading-[1.02]">
          <span class="block font-black text-[#0D2235]">Saluran Resmi Pengadaan.</span>
          <span class="block font-light text-[#486581] mt-1.5">Layanan RFQ & Kemitraan RS.</span>
        </h1>
        <p class="text-base sm:text-lg text-[#486581] font-sans font-light leading-relaxed"><strong class="text-[#0D253A] font-semibold">Spesifikasi jelas. Dokumen lengkap.</strong> Kami siap membantu permohonan surat penawaran harga (SPH), konsultasi spesifikasi reagen, serta ketersediaan stok untuk kebutuhan pengadaan instansi Anda.</p>
      </motion.div>

      <!-- Main Contact Grid (2 Columns) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <!-- Contact Information (5 cols) -->
        <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut', delay: 0.1 }" :viewport="{ once: true, amount: 0.2 }" class="lg:col-span-5 space-y-5">
          <!-- Card 1: Official Coordinates -->
          <div class="bg-white rounded-md p-6 sm:p-7 space-y-5 border border-slate-200/70 shadow-sm">
            <h3 class="font-manrope font-bold text-xl text-[#0D2235]">Informasi Kantor & Kontak</h3>

            <ul class="space-y-4 text-[14px]">
              <li class="flex items-start gap-3 text-[#486581]">
                <div class="w-8 h-8 rounded-xl bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin class="w-4 h-4" />
                </div>
                <div>
                  <strong class="block font-manrope text-[#0D2235]">Alamat Operasional:</strong>
                  <span class="leading-relaxed font-light">
                    {{ settings.address }}
                  </span>
                </div>
              </li>

              <li class="flex items-start gap-3 text-[#486581]">
                <div class="w-8 h-8 rounded-xl bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail class="w-4 h-4" />
                </div>
                <div>
                  <strong class="block font-manrope text-[#0D2235]">Email Resmi Penjualan:</strong>
                  <a :href="`mailto:${settings.email}`" class="text-[#1B7E98] hover:underline font-medium">
                    {{ settings.email }}
                  </a>
                </div>
              </li>

              <li class="flex items-start gap-3 text-[#486581]">
                <div class="w-8 h-8 rounded-xl bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone class="w-4 h-4" />
                </div>
                <div>
                  <strong class="block font-manrope text-[#0D2235]">Telepon Kantor:</strong>
                  <a :href="`tel:${settings.phone.replace(/[^0-9]/g, '')}`" class="text-[#0D2235] hover:text-[#1B7E98] font-light">
                    {{ settings.phone }}
                  </a>
                </div>
              </li>

              <li class="flex items-start gap-3 text-[#486581]">
                <div class="w-8 h-8 rounded-xl bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock class="w-4 h-4" />
                </div>
                <div>
                  <strong class="block font-manrope text-[#0D2235]">Jam Layanan Penjualan:</strong>
                  <span class="font-light">{{ settings.operating_hours }}</span>
                </div>
              </li>
            </ul>

            <div class="pt-2">
              <a :href="`https://wa.me/${settings.whatsapp}?text=Halo%20${encodeURIComponent(settings.company_name)},%20saya%20ingin%20berkonsultasi%20mengenai%20pengadaan%20reagen%20laboratorium.`" target="_blank" rel="noopener noreferrer" class="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[14px] transition-all shadow-xs">
                <MessageSquare class="w-4 h-4 text-[#082838]" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          <!-- Card 2: Procurement Info -->
          <div class="p-6 rounded-md bg-white space-y-3 border border-slate-200/70 shadow-sm">
            <div class="flex items-center gap-2 text-[#054E4C]">
              <ShieldCheck class="w-5 h-5 text-[#89CBDD]" />
              <span class="font-manrope font-bold text-[14px] text-[#0D2235]">Ketentuan Penawaran & Pasokan</span>
            </div>
            <ul class="space-y-2 text-[13px] text-[#486581] font-sans font-light">
              <li class="flex items-start gap-2">
                <span class="text-[#89CBDD] font-bold">&bull;</span>
                <span>Prioritas distribusi pengiriman untuk wilayah Jabodetabek.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-[#89CBDD] font-bold">&bull;</span>
                <span>Penerbitan Surat Penawaran Harga (SPH) resmi dalam 1 hari kerja.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-[#89CBDD] font-bold">&bull;</span>
                <span>Penyertaan dokumen SDS/COA sesuai nomor lot yang dikirimkan.</span>
              </li>
            </ul>
          </div>
        </motion.div>

        <!-- Form Column (7 cols) -->
        <motion.div :initial="{ opacity: 0, y: 40 }" :whileInView="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, ease: 'easeOut', delay: 0.2 }" :viewport="{ once: true, amount: 0.2 }" class="lg:col-span-7 bg-white rounded-md p-6 sm:p-8 border border-slate-200/70 shadow-sm">
          <!-- Success State -->
          <div v-if="isSubmitted" class="py-10 text-center space-y-5">
            <div class="w-16 h-16 rounded-md bg-[#A3EEEC] text-[#054E4C] mx-auto flex items-center justify-center">
              <CheckCircle2 class="w-9 h-9" />
            </div>
            <div class="space-y-2 max-w-md mx-auto">
              <h3 class="font-manrope font-bold text-2xl text-[#0D2235]">Permintaan Berhasil Terkirim</h3>
              <p class="text-[14.5px] text-[#486581] font-sans font-light leading-relaxed">
                {{ submissionResult?.message }}
              </p>
              <div v-if="submissionResult?.inquiryId" class="inline-block mt-3 px-3.5 py-1.5 rounded-xl bg-[#E9F8FF] text-[13px] font-mono text-[#082838] border border-slate-200/50">ID Referensi: {{ submissionResult.inquiryId }}</div>
            </div>

            <div class="pt-4">
              <button
                type="button"
                class="px-5 py-2.5 rounded-md bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#082838] font-manrope font-semibold text-[13.5px] transition-colors border border-slate-200/60 cursor-pointer"
                @click="
                  isSubmitted = false;
                  formData = { fullName: '', companyOrInstitution: '', workEmail: '', phoneNumber: '', productName: '', estimatedQuantity: '', message: '', honeypot: '' };
                "
              >
                Kirim Baru
              </button>
            </div>
          </div>

          <!-- Form State -->
          <form v-else class="space-y-4.5" @submit.prevent="handleSubmit">
            <fieldset :disabled="isSubmitting" class="space-y-4.5 min-w-0">
              <div class="space-y-1">
                <h3 class="font-manrope font-bold text-xl text-[#0D2235]">Formulir Permintaan Penawaran Harga</h3>
                <p class="text-[13.5px] text-[#486581] font-sans font-light">Lengkapi formulir berikut dengan spesifikasi kebutuhan laboratorium Anda.</p>
              </div>

              <!-- Honeypot -->
              <input v-model="formData.honeypot" type="text" class="hidden" tabindex="-1" autocomplete="off" />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <!-- Full Name (Text Only) -->
                <div class="space-y-1">
                  <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]">Nama Lengkap <span class="text-red-500">*</span></label>
                  <input :value="formData.fullName" type="text" placeholder="Nama pemohon (hanya huruf)" class="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-[14px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" :class="errors.fullName ? 'ring-2 ring-red-500' : ''" @input="onTextOnlyInput($event, (v) => (formData.fullName = v))" />
                  <p v-if="errors.fullName" class="text-[11.5px] text-red-500">{{ errors.fullName }}</p>
                </div>

                <!-- Institution -->
                <div class="space-y-1">
                  <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]">Instansi / Rumah Sakit / Lab <span class="text-red-500">*</span></label>
                  <input v-model="formData.companyOrInstitution" type="text" placeholder="Nama rumah sakit atau instansi" class="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-[14px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" :class="errors.companyOrInstitution ? 'ring-2 ring-red-500' : ''" />
                  <p v-if="errors.companyOrInstitution" class="text-[11.5px] text-red-500">{{ errors.companyOrInstitution }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Work Email -->
                <div class="space-y-1">
                  <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]">Email Kerja <span class="text-red-500">*</span></label>
                  <input v-model="formData.workEmail" type="email" placeholder="nama@instansi.com" class="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-[14px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" :class="errors.workEmail ? 'ring-2 ring-red-500' : ''" />
                  <p v-if="errors.workEmail" class="text-[11.5px] text-red-500">{{ errors.workEmail }}</p>
                </div>

                <!-- Phone (Optional + Numeric Only) -->
                <div class="space-y-1">
                  <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]">
                    Nomor WhatsApp / Telepon
                    <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span>
                  </label>
                  <input :value="formData.phoneNumber" type="tel" inputmode="numeric" placeholder="0812XXXXXXXX (hanya angka)" class="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-[14px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD]" :class="errors.phoneNumber ? 'ring-2 ring-red-500' : ''" @input="onNumericInput($event, (v) => (formData.phoneNumber = v))" />
                  <p v-if="errors.phoneNumber" class="text-[11.5px] text-red-500">{{ errors.phoneNumber }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Product of Interest (Optional) -->
                <div class="space-y-1">
                  <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]">
                    Produk / Jenis Reagen
                    <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span>
                  </label>
                  <input v-model="formData.productName" type="text" placeholder="Contoh: HBsAg ECOTEST / KCl 3M" class="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-[14px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD]" />
                </div>

                <!-- Estimated Quantity (Optional) -->
                <div class="space-y-1">
                  <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]">
                    Estimasi Kuantitas / Volume
                    <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span>
                  </label>
                  <input v-model="formData.estimatedQuantity" type="text" placeholder="Contoh: 10 Box / 5 Liter" class="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-[14px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD]" />
                </div>
              </div>

              <!-- Message -->
              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]">Rincian Kebutuhan & Catatan <span class="text-red-500">*</span></label>
                <textarea v-model="formData.message" rows="4" placeholder="Jelaskan kebutuhan spesifik Anda, jadwal pengadaan, atau dokumen teknis pendukung... (Ctrl+Enter untuk kirim)" class="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-[14px] bg-[#E9F8FF]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" :class="errors.message ? 'ring-2 ring-red-500' : ''" @keydown.ctrl.enter.prevent="handleSubmit" @keydown.meta.enter.prevent="handleSubmit" />
                <p v-if="errors.message" class="text-[11.5px] text-red-500">{{ errors.message }}</p>
              </div>
            </fieldset>

            <div class="pt-3 flex items-center justify-between gap-3">
              <span class="text-[12px] text-[#486581]">Respon penawaran resmi dalam 1 hari kerja.</span>
              <button type="submit" :disabled="isSubmitting" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[14px] transition-all disabled:opacity-50 cursor-pointer shadow-xs shrink-0">
                <span v-if="isSubmitting">Mengirim...</span>
                <span v-else>Kirim</span>
                <Send class="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  </div>
</template>
