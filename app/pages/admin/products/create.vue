<!-- @format -->

<script setup lang="ts">
import { ref } from "vue";
import { ArrowLeft, Save, Plus, Trash2, Upload, CheckCircle2, AlertCircle, Package } from "lucide-vue-next";
import { useCatalog } from "~/composables/useCatalog";

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: "Tambah Produk Baru — Admin Panel",
});

const router = useRouter();
const { refreshCatalog } = useCatalog();

const isSubmitting = ref(false);
const isUploading = ref(false);
const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

// Form state
const form = ref({
  sku: "",
  name: "",
  brand: "ARM Diagnostics",
  categorySlug: "reagents",
  categoryName: "Reagents",
  description: "",
  targetAnalytes: "",
  sampleTypes: "Serum, Plasma, Whole Blood",
  intendedUse: "",
  storageTemp: "2°C - 8°C",
  leadTime: "Ready Stock Jabodetabek",
  regulationStatus: "Kemenkes RI AKD / AKL",
  imageUrl: "/images/products/ecotest-hbsag-flyer.png",
  isFeatured: true,
  isVerified: true,
  packaging: [{ size: 50, unit: "Test/Kit", packageType: "Cassette" }],
  specifications: [
    { label: "Metode Pengujian", value: "Rapid Immunochromatographic Assay" },
    { label: "Waktu Pembacaan", value: "15 Menit" },
  ],
});

// Add/remove packaging row
const addPackagingRow = () => {
  form.value.packaging.push({ size: 1, unit: "Kit", packageType: "Box" });
};
const removePackagingRow = (index: number) => {
  form.value.packaging.splice(index, 1);
};

// Add/remove specification row
const addSpecRow = () => {
  form.value.specifications.push({ label: "", value: "" });
};
const removeSpecRow = (index: number) => {
  form.value.specifications.splice(index, 1);
};

// Upload thumbnail
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const uploadData = new FormData();
  uploadData.append("file", file);

  isUploading.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<{ success: boolean; url: string }>("/api/upload", {
      method: "POST",
      body: uploadData,
    });
    if (res && res.url) {
      form.value.imageUrl = res.url;
    }
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || "Gagal mengunggah gambar produk.";
  } finally {
    isUploading.value = false;
  }
};

// Submit handler
const handleSubmit = async () => {
  if (!form.value.name.trim() || !form.value.sku.trim()) {
    errorMessage.value = "Nama produk dan SKU wajib diisi.";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = null;
  try {
    await $fetch("/api/products", {
      method: "POST",
      body: form.value,
    });
    successMessage.value = "Produk baru berhasil ditambahkan ke katalog!";
    await refreshCatalog();
    setTimeout(() => {
      router.push("/admin");
    }, 1200);
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || "Gagal menyimpan produk.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-16 animate-fade-up">
    <!-- Top Nav Back -->
    <div class="flex items-center justify-between pb-2">
      <NuxtLink to="/admin" class="inline-flex items-center gap-2 text-[13.5px] font-manrope font-bold text-[#486581] hover:text-[#0D253A] transition-colors">
        <ArrowLeft class="w-4 h-4 text-[#89CBDD]" />
        <span>Kembali ke Daftar Produk</span>
      </NuxtLink>

      <span class="text-[12px] font-manrope font-semibold text-[#486581]">Manajemen Katalog</span>
    </div>

    <!-- Header Page: Giant Typography with Extreme Contrast & Top Actions -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 text-[11px] font-manrope font-bold uppercase tracking-wider text-[#054E4C] bg-[#A3EEEC] px-4 py-1.5 rounded-full">
          <span>Formulir Produk Baru</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-manrope tracking-tight leading-tight">
          <span class="block font-black text-[#0D2235]">Entri Produk Baru.</span>
          <span class="block font-light text-[#486581]">Spesifikasi & Mutu Reagen.</span>
        </h1>
        <p class="text-[14px] text-[#486581] font-sans">Lengkapi parameter teknis, dokumen izin edar Kemenkes RI, dan spesifikasi kemasan resmi.</p>
      </div>

      <!-- Top Actions -->
      <div class="flex items-center gap-3 shrink-0 self-start sm:self-auto">
        <NuxtLink to="/admin" class="px-5 py-3 rounded-2xl bg-white hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13.5px] transition-colors shadow-xs"> Batal </NuxtLink>
        <button type="button" :disabled="isSubmitting" class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13.5px] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-xs hover:shadow-md disabled:opacity-50 cursor-pointer" @click="handleSubmit">
          <Save class="w-4 h-4" />
          <span>{{ isSubmitting ? "Menyimpan..." : "Simpan Produk" }}</span>
        </button>
      </div>
    </div>

    <!-- Feedback Alerts -->
    <div v-if="successMessage" class="p-4 rounded-2xl bg-[#A3EEEC]/50 text-[#054E4C] text-[13.5px] flex items-center gap-2.5 font-medium shadow-xs">
      <CheckCircle2 class="w-5 h-5 text-[#054E4C] shrink-0" />
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="p-4 rounded-2xl bg-red-100 text-red-800 text-[13.5px] flex items-center gap-2.5 font-medium shadow-xs">
      <AlertCircle class="w-5 h-5 text-red-600 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Main Form Card -->
    <form class="space-y-6" @submit.prevent="handleSubmit">
      <!-- Section 1: Informasi Utama -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
        <h3 class="font-manrope font-bold text-lg text-[#0D2235]">1. Informasi Utama Produk</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Nama Produk -->
          <div class="space-y-1 sm:col-span-2">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Nama Produk <span class="text-red-500">*</span> </label>
            <input v-model="form.name" type="text" placeholder="Contoh: HBSAG Test ECOTEST Rapid Cassette" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" required />
          </div>

          <!-- Kategori with Minimalist Searchable Combobox -->
          <CategoryCombobox
            v-model="form.categorySlug"
            label="Kategori Produk"
            :required="true"
            @change="
              (cat) => {
                form.categoryName = cat.name;
              }
            "
          />

          <!-- SKU / Kode Katalog -->
          <div class="space-y-1">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Nomor SKU / Katalog <span class="text-red-500">*</span> </label>
            <input v-model="form.sku" type="text" placeholder="Contoh: ARM-RDT-HBSAG50" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] font-mono focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" required />
          </div>

          <!-- Merek / Brand -->
          <div class="space-y-1">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Merek / Prinsipal </label>
            <input v-model="form.brand" type="text" placeholder="Contoh: ECOTEST / ARM Diagnostics" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" />
          </div>

          <!-- Regulasi / Izin Edar -->
          <div class="space-y-1">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Status Izin Edar Kemenkes RI </label>
            <input v-model="form.regulationStatus" type="text" placeholder="Contoh: Kemenkes RI AKD 20305020123" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" />
          </div>

          <!-- Deskripsi Singkat -->
          <div class="space-y-1 sm:col-span-2">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Deskripsi Teknis Singkat </label>
            <textarea v-model="form.description" rows="3" placeholder="Jelaskan peruntukan, prinsip uji, atau karakteristik utama reagen..." class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all font-sans" />
          </div>
        </div>
      </div>

      <!-- Section 2: Upload Gambar & Kemasan -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
        <h3 class="font-manrope font-bold text-lg text-[#0D2235]">2. Gambar Produk & Pilihan Kemasan</h3>

        <div class="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          <!-- Gambar Uploader -->
          <div class="sm:col-span-4 bg-[#E9F8FF] p-4 rounded-3xl text-center space-y-3">
            <span class="block text-[12px] font-manrope font-bold uppercase tracking-wider text-[#0D253A]"> Foto Produk </span>

            <div class="w-28 h-28 mx-auto rounded-2xl bg-white p-2 flex items-center justify-center overflow-hidden shadow-xs">
              <img :src="form.imageUrl" alt="Product Preview" class="w-full h-full object-contain" />
            </div>

            <label class="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] text-[12px] font-manrope font-bold cursor-pointer transition-all w-full shadow-xs">
              <Upload class="w-3.5 h-3.5" />
              <span>{{ isUploading ? "Mengunggah..." : "Unggah Foto" }}</span>
              <input type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
            </label>

            <input v-model="form.imageUrl" type="text" class="w-full px-2.5 py-1.5 rounded-xl bg-white text-[11px] font-mono text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30" placeholder="/images/products/..." />
          </div>

          <!-- Kemasan Rows -->
          <div class="sm:col-span-8 space-y-3">
            <div class="flex items-center justify-between">
              <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Pilihan Kemasan & Satuan </label>
              <button type="button" class="inline-flex items-center gap-1.5 text-[12px] font-manrope font-bold text-[#1B7E98] hover:text-[#0D253A] cursor-pointer" @click="addPackagingRow">
                <Plus class="w-3.5 h-3.5" />
                <span>Tambah Kemasan</span>
              </button>
            </div>

            <div v-for="(pack, i) in form.packaging" :key="i" class="flex items-center gap-2 p-2.5 rounded-2xl bg-[#E9F8FF]/50">
              <input v-model.number="pack.size" type="number" placeholder="Ukuran" class="w-20 px-3 py-2 rounded-xl bg-white text-[13px] font-mono outline-none focus:ring-2 focus:ring-[#89CBDD]/30" />
              <input v-model="pack.unit" type="text" placeholder="Satuan (mis: Test, mL)" class="flex-1 px-3 py-2 rounded-xl bg-white text-[13px] outline-none focus:ring-2 focus:ring-[#89CBDD]/30" />
              <input v-model="pack.packageType" type="text" placeholder="Tipe (mis: Box, Kit)" class="flex-1 px-3 py-2 rounded-xl bg-white text-[13px] outline-none focus:ring-2 focus:ring-[#89CBDD]/30" />
              <button type="button" class="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer" @click="removePackagingRow(i)">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Parameter Teknis -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
        <h3 class="font-manrope font-bold text-lg text-[#0D2235]">3. Parameter Teknis & Penyimpanan</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Suhu Penyimpanan </label>
            <input v-model="form.storageTemp" type="text" placeholder="Contoh: 2°C - 8°C" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all font-mono" />
          </div>

          <div class="space-y-1">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Estimasi Pengiriman (Lead Time) </label>
            <input v-model="form.leadTime" type="text" placeholder="Contoh: Ready Stock Jabodetabek" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" />
          </div>

          <div class="space-y-1">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Jenis Spesimen / Sampel </label>
            <input v-model="form.sampleTypes" type="text" placeholder="Contoh: Serum, Plasma, Whole Blood" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" />
          </div>

          <div class="space-y-1">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Analit Target / Parameter Uji </label>
            <input v-model="form.targetAnalytes" type="text" placeholder="Contoh: Hepatitis B Surface Antigen (HBsAg)" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 transition-all" />
          </div>
        </div>

        <!-- Dynamic Spec Rows -->
        <div class="pt-2 space-y-3">
          <div class="flex items-center justify-between">
            <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Spesifikasi Tambahan (Key-Value) </label>
            <button type="button" class="inline-flex items-center gap-1.5 text-[12px] font-manrope font-bold text-[#1B7E98] hover:text-[#0D253A] cursor-pointer" @click="addSpecRow">
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Parameter</span>
            </button>
          </div>

          <div class="space-y-2">
            <div v-for="(spec, i) in form.specifications" :key="i" class="flex items-center gap-2 p-2.5 rounded-2xl bg-[#E9F8FF]/50">
              <input v-model="spec.label" type="text" placeholder="Parameter (mis: Sensitivitas)" class="w-1/3 px-3 py-2 rounded-xl bg-white text-[13px] outline-none focus:ring-2 focus:ring-[#89CBDD]/30 font-mono" />
              <input v-model="spec.value" type="text" placeholder="Nilai (mis: 99.8%)" class="flex-1 px-3 py-2 rounded-xl bg-white text-[13px] outline-none focus:ring-2 focus:ring-[#89CBDD]/30" />
              <button type="button" class="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer" @click="removeSpecRow(i)">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Toggles -->
        <div class="pt-4 flex flex-col sm:flex-row gap-6">
          <label class="flex items-center gap-3 cursor-pointer">
            <input v-model="form.isFeatured" type="checkbox" class="w-4 h-4 rounded text-[#89CBDD] focus:ring-[#89CBDD]" />
            <span class="text-[13.5px] font-manrope font-semibold text-[#0D2235]"> Tampilkan di Produk Unggulan Beranda </span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input v-model="form.isVerified" type="checkbox" class="w-4 h-4 rounded text-[#89CBDD] focus:ring-[#89CBDD]" />
            <span class="text-[13.5px] font-manrope font-semibold text-[#0D2235]"> Tandai Spesifikasi Terverifikasi Resmi </span>
          </label>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 pt-4">
        <NuxtLink to="/admin" class="px-6 py-3 rounded-2xl bg-white hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13.5px] transition-colors shadow-xs"> Batal </NuxtLink>
        <button type="submit" :disabled="isSubmitting" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[14px] transition-all disabled:opacity-50 cursor-pointer shadow-xs hover:shadow-md">
          <Save class="w-4 h-4" />
          <span>{{ isSubmitting ? "Menyimpan..." : "Simpan Produk Baru" }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
