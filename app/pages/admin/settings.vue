<!-- @format -->

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Save, Building2, Phone, MapPin, Upload, Sparkles, ShieldCheck, Loader2, FileImage } from "lucide-vue-next";
import { useSiteSettings, type SiteSettings, defaultSettings } from "~/composables/useSiteSettings";
import { useAdminAuth } from "~/composables/useAdminAuth";
import { useActionModal } from "~/composables/useActionModal";
import { MAX_IMAGE_MB, isValidEmail, isValidNumeric, onNumericInput, validateImageUpload } from "~/utils/validation";

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: "Pengaturan Identitas Website - Admin Panel",
});

const { updateLocalSettings } = useSiteSettings();
const { isSuperAdmin } = useAdminAuth();
const { showSuccess, showAlert } = useActionModal();

const form = ref<SiteSettings>({ ...defaultSettings });
const isSaving = ref(false);
const isUploadingLogo = ref(false);
const uploadedLogoName = ref("");

const currentLogoName = computed(() => {
  if (uploadedLogoName.value) return uploadedLogoName.value;
  const raw = (form.value.logo_url || "/brand/logo_akm.jpg").split("?")[0] || "";
  return raw.split("/").pop() || "logo_akm.jpg";
});

onMounted(async () => {
  try {
    const res = await $fetch<Record<string, string>>("/api/settings");
    if (res) {
      form.value = { ...defaultSettings, ...res };
    }
  } catch (err) {
    console.error("Failed to load settings:", err);
  }
});

const handlePhoneInput = (e: Event) => {
  onNumericInput(e, (val) => {
    form.value.phone = val;
  });
};

const handleWhatsappInput = (e: Event) => {
  onNumericInput(e, (val) => {
    form.value.whatsapp = val;
  });
};

const handleLogoUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  target.value = "";
  if (!file) return;

  const validation = validateImageUpload(file);
  if (!validation.valid) {
    showAlert("Format / Ukuran File Tidak Valid", validation.message);
    return;
  }

  const uploadData = new FormData();
  uploadData.append("logo", file);

  isUploadingLogo.value = true;

  try {
    const res = await $fetch<{ success: boolean; url: string; originalName?: string }>("/api/upload", {
      method: "POST",
      body: uploadData,
    });

    if (res && res.url) {
      form.value.logo_url = res.url;
      uploadedLogoName.value = res.originalName || file.name;
      showSuccess("Logo Diunggah", "Logo baru berhasil diunggah. Jangan lupa klik Simpan.");
    }
  } catch (err: any) {
    showAlert("Gagal Unggah", err.data?.statusMessage || "Gagal mengunggah file logo.");
  } finally {
    isUploadingLogo.value = false;
  }
};

const handleSave = async () => {
  if (isSaving.value) return;
  if (!isSuperAdmin.value) {
    showAlert("Akses Ditolak", "Hanya Super Admin yang berwenang memperbarui konfigurasi resmi perusahaan.");
    return;
  }

  if (!form.value.company_name.trim()) {
    showAlert("Validasi Form", "Nama merek dagang wajib diisi.");
    return;
  }
  if (form.value.phone && !isValidNumeric(form.value.phone)) {
    showAlert("Validasi Form", "Nomor telepon kantor hanya boleh berisi angka.");
    return;
  }
  if (form.value.whatsapp && !isValidNumeric(form.value.whatsapp)) {
    showAlert("Validasi Form", "Nomor WhatsApp resmi hanya boleh berisi angka (tanpa spasi/simbol).");
    return;
  }
  if (form.value.email && !isValidEmail(form.value.email)) {
    showAlert("Validasi Form", "Format alamat email resmi tidak valid.");
    return;
  }

  isSaving.value = true;

  try {
    const res = await $fetch<{ success: boolean; message: string; settings: Record<string, string> }>("/api/settings", {
      method: "PUT",
      body: form.value,
    });

    if (res.success) {
      updateLocalSettings(res.settings);
      showSuccess("Data Berhasil Disimpan", "Pengaturan website berhasil diperbarui.");
    }
  } catch (err: any) {
    showAlert("Gagal Menyimpan", err.data?.statusMessage || "Terjadi kesalahan saat menyimpan pengaturan.");
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="space-y-6 pb-12 animate-fade-up">
    <div v-if="!isSuperAdmin" class="p-4 rounded-md bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-[13px] flex items-center gap-2.5 font-medium shadow-xs">
      <ShieldCheck class="w-5 h-5 text-amber-600 shrink-0" />
      <span><strong>Mode Pratinjau (Admin Biasa):</strong> Pengubahan profil resmi perusahaan dibatasi khusus untuk Super Admin.</span>
    </div>

    <form class="space-y-6" @submit.prevent="handleSave">
      <fieldset :disabled="isSaving" class="space-y-6 min-w-0">
        <!-- SECTION 1: IDENTITAS & LOGO -->
        <div class="bg-white rounded-md p-5 sm:p-6 space-y-5 shadow-xs border border-[#D0F2F9]/70">
          <div class="flex items-center gap-3 pb-2 border-b border-[#D0F2F9]/40">
            <div class="w-9 h-9 rounded-md bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center shrink-0">
              <Building2 class="w-4 h-4" />
            </div>
            <div>
              <h2 class="font-manrope font-bold text-base sm:text-lg text-[#0D2235]">1. Identitas & Logo</h2>
              <p class="text-xs text-[#486581]">Nama brand yang tampil di navigasi, footer, dan dokumen.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-start pt-1">
            <!-- Logo Uploader (Murni File Upload Tanpa Input Path Manual) -->
            <div class="md:col-span-4 bg-[#E9F8FF]/70 p-5 rounded-md space-y-3.5 text-center">
              <span class="block text-[11.5px] font-manrope font-bold uppercase tracking-wider text-[#0D253A]">Logo Perusahaan</span>

              <div class="w-24 h-24 mx-auto rounded-md bg-white p-2 flex items-center justify-center overflow-hidden">
                <img :src="form.logo_url || '/brand/logo_akm.jpg'" alt="Logo Preview" loading="lazy" class="w-full h-full object-contain" />
              </div>

              <div class="space-y-2">
                <label class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] text-xs font-manrope font-bold cursor-pointer transition-all w-full shadow-xs">
                  <Loader2 v-if="isUploadingLogo" class="w-3.5 h-3.5 animate-spin" />
                  <Upload v-else class="w-3.5 h-3.5" />
                  <span>{{ isUploadingLogo ? "Mengunggah..." : "Ganti / Unggah Logo" }}</span>
                  <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" class="hidden" @change="handleLogoUpload" />
                </label>

                <div class="inline-flex items-center justify-center gap-1.5 max-w-full px-2.5 py-1 rounded-sm bg-white text-[11px] font-mono text-[#0D253A]">
                  <FileImage class="w-3 h-3 text-[#1B7E98] shrink-0" />
                  <span class="truncate">{{ currentLogoName }}</span>
                </div>

                <p class="text-[11px] text-[#486581]">
                  Hanya JPG, JPEG, PNG, atau WebP &bull; Maks. <strong>{{ MAX_IMAGE_MB }} MB</strong>.
                </p>
              </div>
            </div>

            <!-- Fields -->
            <div class="md:col-span-8 space-y-3.5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div class="space-y-1">
                  <label class="block text-xs font-manrope font-semibold text-[#0D2235]">Nama Merek Dagang <span class="text-red-500">*</span></label>
                  <input v-model="form.company_name" type="text" placeholder="Contoh: Angkasa Karya Medika" class="w-full px-3.5 py-2 rounded-md bg-[#E9F8FF]/50 focus:bg-white text-[13px] text-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#89CBDD] border border-[#D0F2F9]" required />
                </div>

                <div class="space-y-1">
                  <label class="block text-xs font-manrope font-semibold text-[#0D2235]"> Nama Legal (PT/CV) <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span> </label>
                  <input v-model="form.company_legal_name" type="text" placeholder="Contoh: PT Angkasa Karya Medika" class="w-full px-3.5 py-2 rounded-md bg-[#E9F8FF]/50 focus:bg-white text-[13px] text-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#89CBDD] border border-[#D0F2F9]" />
                </div>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-manrope font-semibold text-[#0D2235]"> Tagline / Sub-Identitas <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span> </label>
                <input v-model="form.tagline" type="text" placeholder="Contoh: Distribusi Reagen & Alat Laboratorium" class="w-full px-3.5 py-2 rounded-md bg-[#E9F8FF]/50 focus:bg-white text-[13px] text-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#89CBDD] border border-[#D0F2F9]" />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-manrope font-semibold text-[#0D2235]"> Informasi Regulasi & Izin Edar <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span> </label>
                <input v-model="form.regulation_info" type="text" placeholder="Contoh: Kementerian Kesehatan RI (Izin Edar Resmi AKD)" class="w-full px-3.5 py-2 rounded-md bg-[#E9F8FF]/50 focus:bg-white text-[13px] text-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#89CBDD] border border-[#D0F2F9]" />
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 2: KONTAK & WHATSAPP -->
        <div class="bg-white rounded-md p-5 sm:p-6 space-y-5 shadow-xs border border-[#D0F2F9]/70">
          <div class="flex items-center gap-3 pb-2 border-b border-[#D0F2F9]/40">
            <div class="w-9 h-9 rounded-md bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center shrink-0">
              <Phone class="w-4 h-4" />
            </div>
            <div>
              <h2 class="font-manrope font-bold text-base sm:text-lg text-[#0D2235]">2. Kontak & WhatsApp Resmi</h2>
              <p class="text-xs text-[#486581]">Nomor telepon, WhatsApp (hanya angka), dan email resmi RFQ.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            <div class="space-y-1">
              <label class="block text-xs font-manrope font-semibold text-[#0D2235]"> Telepon Kantor <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span> </label>
              <input :value="form.phone" type="tel" inputmode="numeric" placeholder="02189086234" class="w-full px-3.5 py-2 rounded-md bg-[#E9F8FF]/50 focus:bg-white text-[13px] text-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#89CBDD] border border-[#D0F2F9] font-mono" @input="handlePhoneInput" />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-manrope font-semibold text-[#0D2235]"> WhatsApp Resmi (Angka) <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span> </label>
              <input :value="form.whatsapp" type="tel" inputmode="numeric" placeholder="6281289086234" class="w-full px-3.5 py-2 rounded-md bg-[#E9F8FF]/50 focus:bg-white text-[13px] text-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#89CBDD] border border-[#D0F2F9] font-mono" @input="handleWhatsappInput" />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-manrope font-semibold text-[#0D2235]"> Email Resmi Penjualan <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span> </label>
              <input v-model="form.email" type="email" placeholder="angkasakaryamedika@gmail.com" class="w-full px-3.5 py-2 rounded-md bg-[#E9F8FF]/50 focus:bg-white text-[13px] text-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#89CBDD] border border-[#D0F2F9]" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-manrope font-semibold text-[#0D2235]"> Jam Operasional <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span> </label>
            <input v-model="form.operating_hours" type="text" placeholder="Senin - Jumat, 08.30 - 17.00 WIB" class="w-full px-3.5 py-2 rounded-md bg-[#E9F8FF]/50 focus:bg-white text-[13px] text-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#89CBDD] border border-[#D0F2F9]" />
          </div>
        </div>

        <!-- SECTION 3: ALAMAT & DISTRIBUSI -->
        <div class="bg-white rounded-md p-5 sm:p-6 space-y-4 shadow-xs border border-[#D0F2F9]/70">
          <div class="flex items-center gap-3 pb-2 border-b border-[#D0F2F9]/40">
            <div class="w-9 h-9 rounded-md bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center shrink-0">
              <MapPin class="w-4 h-4" />
            </div>
            <div>
              <h2 class="font-manrope font-bold text-base sm:text-lg text-[#0D2235]">3. Alamat & Wilayah Pasokan</h2>
              <p class="text-xs text-[#486581]">Lokasi kantor logistik dan cakupan distribusi.</p>
            </div>
          </div>

          <div class="space-y-3.5 pt-1">
            <div class="space-y-1">
              <label class="block text-xs font-manrope font-semibold text-[#0D2235]"> Alamat Lengkap Kantor / Gudang <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span> </label>
              <textarea v-model="form.address" rows="2" placeholder="Tuliskan nama gedung, jalan, kota, kode pos... (Ctrl+Enter untuk simpan)" class="w-full px-3.5 py-2 rounded-md bg-[#E9F8FF]/50 focus:bg-white text-[13px] text-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#89CBDD] border border-[#D0F2F9]" @keydown.ctrl.enter.prevent="handleSave" @keydown.meta.enter.prevent="handleSave" />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-manrope font-semibold text-[#0D2235]"> Fokus Wilayah Distribusi <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span> </label>
              <input v-model="form.distribution_focus" type="text" placeholder="Contoh: Jabodetabek & Nasional" class="w-full px-3.5 py-2 rounded-md bg-[#E9F8FF]/50 focus:bg-white text-[13px] text-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#89CBDD] border border-[#D0F2F9]" />
            </div>
          </div>
        </div>

        <!-- SECTION 4: HERO LANDING PAGE COPYWRITING -->
        <div class="bg-white rounded-md p-5 sm:p-6 space-y-4 shadow-xs border border-[#D0F2F9]/70">
          <div class="flex items-center gap-3 pb-2 border-b border-[#D0F2F9]/40">
            <div class="w-9 h-9 rounded-md bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center shrink-0">
              <Sparkles class="w-4 h-4" />
            </div>
            <div>
              <h2 class="font-manrope font-bold text-base sm:text-lg text-[#0D2235]">4. Headline Utama Hero</h2>
              <p class="text-xs text-[#486581]">Teks utama yang ditampilkan pada halaman depan.</p>
            </div>
          </div>

          <div class="space-y-3.5 pt-1">
            <div class="space-y-1">
              <label class="block text-xs font-manrope font-semibold text-[#0D2235]"> Judul Utama Hero <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span> </label>
              <input v-model="form.hero_headline" type="text" placeholder="Suplai Reagen Lab. Standar Resmi RS." class="w-full px-3.5 py-2 rounded-md bg-[#E9F8FF]/50 focus:bg-white text-sm font-medium text-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#89CBDD] border border-[#D0F2F9]" />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-manrope font-semibold text-[#0D2235]"> Deskripsi Sub-Judul <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span> </label>
              <textarea v-model="form.hero_subheadline" rows="2" placeholder="Spesifikasi jelas. Dokumen lengkap... (Ctrl+Enter untuk simpan)" class="w-full px-3.5 py-2 rounded-md bg-[#E9F8FF]/50 focus:bg-white text-[13px] text-[#0D2235] focus:outline-none focus:ring-1 focus:ring-[#89CBDD] border border-[#D0F2F9]" @keydown.ctrl.enter.prevent="handleSave" @keydown.meta.enter.prevent="handleSave" />
            </div>
          </div>
        </div>
      </fieldset>

      <!-- Bottom Save Action Button -->
      <div class="flex items-center justify-end gap-3 pt-2">
        <NuxtLink to="/admin" class="px-4 py-2.5 rounded-md bg-white border border-[#D0F2F9] hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-xs transition-colors shadow-xs">Dashboard</NuxtLink>

        <button type="submit" :disabled="isSaving" class="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-xs sm:text-[13px] transition-all disabled:opacity-50 cursor-pointer shadow-xs hover:shadow-md">
          <Save class="w-4 h-4" />
          <span>{{ isSaving ? "Menyimpan..." : "Simpan" }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
