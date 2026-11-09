<!-- @format -->

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Save, Building2, Phone, Mail, MapPin, Upload, Image as ImageIcon, CheckCircle2, Sparkles, ShieldCheck, Clock, ArrowRight, ExternalLink } from "lucide-vue-next";
import { useSiteSettings, type SiteSettings, defaultSettings } from "~/composables/useSiteSettings";
import { useAdminAuth } from "~/composables/useAdminAuth";

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: "Pengaturan Identitas Website — Admin Panel",
});

const { settings, updateLocalSettings, refresh } = useSiteSettings();
const { isSuperAdmin } = useAdminAuth();

const form = ref<SiteSettings>({ ...defaultSettings });
const isSaving = ref(false);
const saveSuccess = ref(false);
const saveError = ref("");
const isUploadingLogo = ref(false);

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

const handleLogoUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const uploadData = new FormData();
  uploadData.append("file", file);

  isUploadingLogo.value = true;
  saveError.value = "";

  try {
    const res = await $fetch<{ success: boolean; url: string }>("/api/upload", {
      method: "POST",
      body: uploadData,
    });

    if (res && res.url) {
      form.value.logo_url = res.url;
      saveSuccess.value = true;
      setTimeout(() => {
        saveSuccess.value = false;
      }, 3000);
    }
  } catch (err: any) {
    saveError.value = err.data?.statusMessage || "Gagal mengunggah file logo.";
  } finally {
    isUploadingLogo.value = false;
  }
};

const handleSave = async () => {
  if (!isSuperAdmin.value) {
    saveError.value = "Akses ditolak: Hanya Super Admin yang berwenang memperbarui konfigurasi resmi perusahaan.";
    return;
  }

  isSaving.value = true;
  saveSuccess.value = false;
  saveError.value = "";

  try {
    const res = await $fetch<{ success: boolean; message: string; settings: Record<string, string> }>("/api/settings", {
      method: "PUT",
      body: form.value,
    });

    if (res.success) {
      updateLocalSettings(res.settings);
      saveSuccess.value = true;
      setTimeout(() => {
        saveSuccess.value = false;
      }, 4000);
    }
  } catch (err: any) {
    saveError.value = err.data?.statusMessage || "Terjadi kesalahan saat menyimpan pengaturan.";
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="space-y-8 pb-16 animate-fade-up">
    <!-- Header Page: Giant Typography with Extreme Contrast -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 text-[11px] font-manrope font-bold uppercase tracking-wider text-[#054E4C] bg-[#A3EEEC] px-4 py-1.5 rounded-full">
          <span>Konfigurasi & Identitas Sistem</span>
          <span v-if="isSuperAdmin" class="bg-[#054E4C] text-white px-1.5 py-0.2 text-[9.5px] rounded-sm">Super Admin</span>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-manrope tracking-tight leading-tight">
          <span class="block font-black text-[#0D2235]">Konfigurasi Identitas.</span>
          <span class="block font-light text-[#486581]">Profil & Kontak Resmi Perusahaan.</span>
        </h1>
        <p class="text-[14.5px] text-[#486581] font-sans max-w-2xl leading-relaxed">
          <strong class="text-[#0D253A] font-semibold">Spesifikasi jelas. Dokumen lengkap.</strong> Perbarui nama brand, kontak WhatsApp, alamat, dan copywriting landing page secara langsung.
        </p>
      </div>

      <!-- Top Actions -->
      <div class="flex flex-wrap items-center gap-3 shrink-0 self-start sm:self-auto">
        <NuxtLink to="/" target="_blank" class="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13.5px] transition-colors shadow-xs">
          <ExternalLink class="w-4 h-4 text-[#89CBDD]" />
          <span>Lihat Website</span>
        </NuxtLink>

        <button
          v-if="isSuperAdmin"
          type="button"
          :disabled="isSaving"
          class="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[14px] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-xs hover:shadow-md disabled:opacity-50 cursor-pointer"
          @click="handleSave"
        >
          <Save class="w-4 h-4" />
          <span>{{ isSaving ? "Menyimpan..." : "Simpan Perubahan" }}</span>
        </button>
      </div>
    </div>

    <!-- Super Admin vs Admin Restriction Banner -->
    <div
      v-if="!isSuperAdmin"
      class="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[13.5px] flex items-center gap-3 font-medium shadow-xs"
    >
      <ShieldCheck class="w-5 h-5 text-amber-600 shrink-0" />
      <span>
        <strong>Mode Pratinjau (Admin Biasa):</strong> Pengubahan profil hukum dan kontak resmi perusahaan dibatasi khusus untuk Super Admin guna mencegah kesalahan input data publik.
      </span>
    </div>

    <!-- Alert Notifications -->
    <div v-if="saveSuccess" class="p-4 rounded-2xl bg-[#A3EEEC]/50 text-[#054E4C] flex items-center justify-between transition-all font-medium text-[13.5px] shadow-xs">
      <div class="flex items-center gap-3">
        <CheckCircle2 class="w-5 h-5 text-[#054E4C] shrink-0" />
        <span>Pengaturan berhasil disimpan! Header, Footer, dan konten website telah diperbarui secara langsung.</span>
      </div>
      <button type="button" class="text-xs font-bold text-[#054E4C] underline" @click="saveSuccess = false">Tutup</button>
    </div>

    <div v-if="saveError" class="p-4 rounded-2xl bg-red-100 text-red-800 flex items-center justify-between transition-all font-medium text-[13.5px] shadow-xs">
      <span class="text-[13.5px]">{{ saveError }}</span>
      <button type="button" class="text-xs font-bold text-red-700 underline" @click="saveError = ''">Tutup</button>
    </div>

    <form class="space-y-8" @submit.prevent="handleSave">
      <!-- SECTION 1: IDENTITAS & LOGO -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div class="flex items-center gap-3 pb-2 border-b border-[#D0F2F9]/40">
          <div class="w-10 h-10 rounded-2xl bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center">
            <Building2 class="w-5 h-5" />
          </div>
          <div>
            <h2 class="font-manrope font-bold text-lg text-[#0D2235]">1. Identitas Perusahaan & Logo</h2>
            <p class="text-[13px] text-[#486581]">Nama brand yang tampil di navigasi atas, footer, dan dokumen legalitas.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2">
          <!-- Logo Uploader (4 cols) -->
          <div class="md:col-span-4 bg-[#E9F8FF] p-6 rounded-3xl space-y-4 text-center">
            <span class="block text-[12px] font-manrope font-bold uppercase tracking-wider text-[#0D253A]"> Logo Perusahaan </span>

            <div class="w-24 h-24 mx-auto rounded-2xl bg-white p-2 flex items-center justify-center overflow-hidden shadow-xs">
              <img :src="form.logo_url || '/brand/logo_akm.jpg'" alt="Logo Preview" class="w-full h-full object-contain" />
            </div>

            <div class="space-y-2">
              <label class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] text-[12.5px] font-manrope font-bold cursor-pointer transition-all w-full shadow-xs">
                <Upload class="w-3.5 h-3.5" />
                <span>{{ isUploadingLogo ? "Mengunggah..." : "Unggah Logo Baru" }}</span>
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" class="hidden" @change="handleLogoUpload" />
              </label>

              <p class="text-[11px] text-[#486581]">Format PNG, JPG, atau WebP. Disarankan proporsi 1:1.</p>
            </div>

            <div class="pt-2 text-left">
              <label class="block text-[11px] font-manrope font-semibold text-[#486581] mb-1"> Atau Path / URL Gambar: </label>
              <input v-model="form.logo_url" type="text" class="w-full px-3 py-2 rounded-xl bg-white text-[12px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30" placeholder="/brand/logo_akm.jpg" />
            </div>
          </div>

          <!-- Fields (8 cols) -->
          <div class="md:col-span-8 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Nama Merek Dagang <span class="text-red-500">*</span> </label>
                <input v-model="form.company_name" type="text" placeholder="Contoh: Angkasa Raya Medika" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" required />
              </div>

              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Nama Legal Perusahaan (PT / CV) </label>
                <input v-model="form.company_legal_name" type="text" placeholder="Contoh: PT Angkasa Raya Medika" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" />
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Tagline / Sub-Identitas </label>
              <input v-model="form.tagline" type="text" placeholder="Contoh: Distribusi Reagen & Alat Laboratorium B2B" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" />
              <p class="text-[11.5px] text-[#486581]">Tampil tepat di bawah nama perusahaan pada Header dan Footer.</p>
            </div>

            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Informasi Regulasi & Izin Edar </label>
              <input v-model="form.regulation_info" type="text" placeholder="Contoh: Kementerian Kesehatan RI (Izin Edar Resmi AKD)" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" />
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 2: KONTAK & WHATSAPP -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div class="flex items-center gap-3 pb-2 border-b border-[#D0F2F9]/40">
          <div class="w-10 h-10 rounded-2xl bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center">
            <Phone class="w-5 h-5" />
          </div>
          <div>
            <h2 class="font-manrope font-bold text-lg text-[#0D2235]">2. Saluran Kontak & Komunikasi Resmi</h2>
            <p class="text-[13px] text-[#486581]">Nomor telepon, integrasi WhatsApp, dan email resmi untuk konfirmasi RFQ.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          <div class="space-y-1">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Nomor Telepon Kantor </label>
            <input v-model="form.phone" type="text" placeholder="Contoh: 021 89086234" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" />
          </div>

          <div class="space-y-1">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> WhatsApp Resmi (Format: 62812...) </label>
            <input v-model="form.whatsapp" type="text" placeholder="Contoh: 6281289086234" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" />
            <p class="text-[11px] text-[#486581]">Gunakan angka tanpa spasi untuk integrasi tombol WhatsApp.</p>
          </div>

          <div class="space-y-1">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Email Resmi Penjualan / RFQ </label>
            <input v-model="form.email" type="email" placeholder="angkasakaryamedika@gmail.com" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" />
          </div>
        </div>

        <div class="space-y-1">
          <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Jam Layanan Operasional </label>
          <input v-model="form.operating_hours" type="text" placeholder="Contoh: Senin – Jumat, 08.30 – 17.00 WIB" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" />
        </div>
      </div>

      <!-- SECTION 3: ALAMAT & WILAYAH DISTRIBUSI -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div class="flex items-center gap-3 pb-2 border-b border-[#D0F2F9]/40">
          <div class="w-10 h-10 rounded-2xl bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center">
            <MapPin class="w-5 h-5" />
          </div>
          <div>
            <h2 class="font-manrope font-bold text-lg text-[#0D2235]">3. Alamat Operasional & Wilayah Pasokan</h2>
            <p class="text-[13px] text-[#486581]">Lokasi kantor logistik dan cakupan distribusi fasilitas kesehatan.</p>
          </div>
        </div>

        <div class="space-y-4 pt-2">
          <div class="space-y-1">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Alamat Lengkap Kantor / Gudang </label>
            <textarea v-model="form.address" rows="2" placeholder="Tuliskan nama perumahan/gedung, jalan, kecamatan, kota, provinsi, dan kode pos..." class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" />
          </div>

          <div class="space-y-1">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Fokus Wilayah Pengadaan / Distribusi </label>
            <input v-model="form.distribution_focus" type="text" placeholder="Contoh: Prioritas Wilayah Jabodetabek & Pasokan Nasional" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" />
          </div>
        </div>
      </div>

      <!-- SECTION 4: HERO LANDING PAGE COPYWRITING -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div class="flex items-center gap-3 pb-2 border-b border-[#D0F2F9]/40">
          <div class="w-10 h-10 rounded-2xl bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center">
            <Sparkles class="w-5 h-5" />
          </div>
          <div>
            <h2 class="font-manrope font-bold text-lg text-[#0D2235]">4. Headline & Pesan Utama Hero</h2>
            <p class="text-[13px] text-[#486581]">Konfigurasi teks cadangan atau headline utama yang terhubung ke sistem.</p>
          </div>
        </div>

        <div class="space-y-4 pt-2">
          <div class="space-y-1">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Judul Utama Hero (Headline) </label>
            <input v-model="form.hero_headline" type="text" placeholder="Suplai Reagen Lab. Standar Resmi RS." class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[15px] font-medium text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" />
          </div>

          <div class="space-y-1">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Deskripsi Sub-Judul (Subheadline) </label>
            <textarea v-model="form.hero_subheadline" rows="2" placeholder="Spesifikasi jelas. Dokumen lengkap. Membantu analis dan tim pengadaan menemukan spesifikasi reagen yang tepat sebelum mengajukan penawaran harga resmi." class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" />
          </div>
        </div>
      </div>

      <!-- Bottom Save Action Button -->
      <div class="flex items-center justify-end gap-4 pt-4">
        <NuxtLink to="/admin" class="px-6 py-3 rounded-2xl bg-white hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13.5px] transition-colors shadow-xs"> Kembali ke Dashboard </NuxtLink>

        <button type="submit" :disabled="isSaving" class="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[14px] transition-all disabled:opacity-50 cursor-pointer shadow-xs hover:shadow-md">
          <Save class="w-4 h-4" />
          <span>{{ isSaving ? "Menyimpan Pengaturan..." : "Simpan Seluruh Pengaturan" }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
