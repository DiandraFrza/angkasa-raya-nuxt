<!-- @format -->

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { X, Plus, Trash2, Upload, Save, CheckCircle2, AlertCircle, Package, Layers, Sparkles, Loader2 } from "lucide-vue-next";
import CategoryCombobox from "~/components/admin/CategoryCombobox.vue";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "created", product: any): void;
}>();

const isSubmitting = ref(false);
const isUploading = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const initialForm = () => ({
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

const form = ref(initialForm());

// Reset form when modal opens
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      form.value = initialForm();
      errorMessage.value = null;
      successMessage.value = null;
    }
  },
);

// Close on ESC key
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.isOpen) {
    handleClose();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

const handleClose = () => {
  if (isSubmitting.value) return;
  errorMessage.value = null;
  successMessage.value = null;
  emit("close");
};

// Add/remove packaging row
const addPackagingRow = () => {
  form.value.packaging.push({ size: 1, unit: "Kit", packageType: "Box" });
};
const removePackagingRow = (index: number) => {
  if (form.value.packaging.length > 1) {
    form.value.packaging.splice(index, 1);
  }
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
    errorMessage.value = "Nama produk dan nomor SKU wajib diisi.";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<{ success: boolean; message: string; product: any }>("/api/products", {
      method: "POST",
      body: form.value,
    });

    successMessage.value = res.message || "Produk baru berhasil ditambahkan ke katalog!";
    emit("created", res.product || form.value);

    setTimeout(() => {
      handleClose();
    }, 900);
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || "Gagal menyimpan produk baru.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-product-create-title">
      <!-- Backdrop Overlay (Black transparent with subtle blur) -->
      <div class="fixed inset-0 bg-[#0D253A]/50 backdrop-blur-xs transition-opacity duration-200" @click="handleClose" />

      <!-- Modal Card Box -->
      <div class="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-[#ADDFF1]/60 flex flex-col max-h-[92vh] text-[#0D2235] font-sans z-10 animate-scale-up overflow-hidden">
        <!-- Modal Sticky Top Header -->
        <div class="px-6 sm:px-8 py-5 bg-gradient-to-r from-white via-[#E9F8FF]/50 to-white border-b border-[#D0F2F9]/80 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ADDFF1]/40 to-[#A3EEEC]/60 text-[#054E4C] flex items-center justify-center shadow-xs border border-[#89CBDD]/30">
              <Package class="w-5 h-5 text-[#082838]" />
            </div>
            <div>
              <div class="inline-flex items-center gap-1.5 text-[10.5px] font-manrope font-extrabold uppercase tracking-wider text-[#054E4C] bg-[#A3EEEC] px-2.5 py-0.5 rounded-full mb-0.5">
                <span>Formulir Entri Produk</span>
              </div>
              <h2 id="modal-product-create-title" class="font-manrope font-extrabold text-lg sm:text-xl text-[#0D2235] leading-tight">Tambah Produk Baru</h2>
            </div>
          </div>

          <button type="button" class="p-2 rounded-2xl text-[#486581] hover:text-[#0D2235] hover:bg-[#E9F8FF] transition-colors cursor-pointer" title="Tutup (Esc)" @click="handleClose">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Scrollable Modal Body Form -->
        <form id="product-create-form" class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6" @submit.prevent="handleSubmit">
          <!-- Alerts -->
          <div v-if="successMessage" class="p-4 rounded-2xl bg-[#A3EEEC]/60 text-[#054E4C] text-[13.5px] flex items-center gap-2.5 font-medium shadow-xs">
            <CheckCircle2 class="w-5 h-5 text-[#054E4C] shrink-0" />
            <span>{{ successMessage }}</span>
          </div>

          <div v-if="errorMessage" class="p-4 rounded-2xl bg-red-100 text-red-800 text-[13.5px] flex items-center gap-2.5 font-medium shadow-xs">
            <AlertCircle class="w-5 h-5 text-red-600 shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Section 1: Informasi Utama -->
          <div class="bg-[#E9F8FF]/40 rounded-3xl p-5 sm:p-6 space-y-4 border border-[#D0F2F9]/70">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-[#89CBDD] text-[#082838] font-bold text-xs flex items-center justify-center">1</span>
              <h3 class="font-manrope font-bold text-[15px] text-[#0D2235]">Informasi Utama Produk</h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Nama Produk -->
              <div class="space-y-1 sm:col-span-2">
                <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Nama Produk <span class="text-red-500">*</span> </label>
                <input v-model="form.name" type="text" placeholder="Contoh: HBSAG Test ECOTEST Rapid Cassette" class="w-full px-4 py-2.5 rounded-2xl bg-white text-[14px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all font-sans" required />
              </div>

              <!-- Kategori Combobox -->
              <div class="sm:col-span-2">
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
              </div>

              <!-- SKU / Kode Katalog -->
              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Nomor SKU / Katalog <span class="text-red-500">*</span> </label>
                <input v-model="form.sku" type="text" placeholder="Contoh: ARM-RDT-HBSAG50" class="w-full px-4 py-2.5 rounded-2xl bg-white text-[14px] text-[#0D2235] font-mono border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all" required />
              </div>

              <!-- Merek / Prinsipal -->
              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Merek / Prinsipal </label>
                <input v-model="form.brand" type="text" placeholder="Contoh: ECOTEST / ARM Diagnostics" class="w-full px-4 py-2.5 rounded-2xl bg-white text-[14px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all" />
              </div>

              <!-- Regulasi / Izin Edar -->
              <div class="space-y-1 sm:col-span-2">
                <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Status Izin Edar Kemenkes RI </label>
                <input v-model="form.regulationStatus" type="text" placeholder="Contoh: Kemenkes RI AKD 20305020123" class="w-full px-4 py-2.5 rounded-2xl bg-white text-[14px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all" />
              </div>

              <!-- Deskripsi Singkat -->
              <div class="space-y-1 sm:col-span-2">
                <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Deskripsi Teknis Singkat </label>
                <textarea v-model="form.description" rows="3" placeholder="Jelaskan peruntukan, prinsip uji, atau karakteristik utama reagen..." class="w-full px-4 py-2.5 rounded-2xl bg-white text-[14px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all font-sans resize-none" />
              </div>
            </div>
          </div>

          <!-- Section 2: Upload Gambar & Kemasan -->
          <div class="bg-[#E9F8FF]/40 rounded-3xl p-5 sm:p-6 space-y-4 border border-[#D0F2F9]/70">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-[#89CBDD] text-[#082838] font-bold text-xs flex items-center justify-center">2</span>
              <h3 class="font-manrope font-bold text-[15px] text-[#0D2235]">Gambar Produk & Pilihan Kemasan</h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
              <!-- Upload Box -->
              <div class="sm:col-span-4 bg-white p-4 rounded-3xl border border-[#D0F2F9] text-center space-y-3 shadow-2xs">
                <span class="block text-[11.5px] font-manrope font-bold uppercase tracking-wider text-[#486581]"> Foto Produk </span>

                <div class="w-24 h-24 mx-auto rounded-2xl bg-[#E9F8FF] p-2 flex items-center justify-center overflow-hidden border border-[#ADDFF1]/40">
                  <img :src="form.imageUrl" alt="Product Preview" class="w-full h-full object-contain" />
                </div>

                <label class="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] text-[12px] font-manrope font-bold cursor-pointer transition-all w-full shadow-xs">
                  <Upload class="w-3.5 h-3.5" />
                  <span>{{ isUploading ? "Mengunggah..." : "Unggah Foto" }}</span>
                  <input type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
                </label>

                <input v-model="form.imageUrl" type="text" class="w-full px-2.5 py-1.5 rounded-xl bg-[#E9F8FF]/60 text-[11px] font-mono text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 border border-transparent" placeholder="/images/products/..." />
              </div>

              <!-- Dynamic Packaging Rows -->
              <div class="sm:col-span-8 space-y-2.5">
                <div class="flex items-center justify-between">
                  <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Pilihan Kemasan & Satuan </label>
                  <button type="button" class="inline-flex items-center gap-1.5 text-[12px] font-manrope font-bold text-[#1B7E98] hover:text-[#0D253A] cursor-pointer" @click="addPackagingRow">
                    <Plus class="w-3.5 h-3.5" />
                    <span>Tambah Kemasan</span>
                  </button>
                </div>

                <div v-for="(pack, i) in form.packaging" :key="i" class="flex items-center gap-2 p-2 rounded-2xl bg-white border border-[#D0F2F9]">
                  <input v-model.number="pack.size" type="number" placeholder="Ukuran" class="w-20 px-3 py-1.5 rounded-xl bg-[#E9F8FF]/50 text-[13px] font-mono outline-none focus:ring-2 focus:ring-[#89CBDD]/30" />
                  <input v-model="pack.unit" type="text" placeholder="Satuan (Test/mL)" class="flex-1 px-3 py-1.5 rounded-xl bg-[#E9F8FF]/50 text-[13px] outline-none focus:ring-2 focus:ring-[#89CBDD]/30" />
                  <input v-model="pack.packageType" type="text" placeholder="Tipe (Box/Kit)" class="flex-1 px-3 py-1.5 rounded-xl bg-[#E9F8FF]/50 text-[13px] outline-none focus:ring-2 focus:ring-[#89CBDD]/30" />
                  <button v-if="form.packaging.length > 1" type="button" class="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer" title="Hapus baris" @click="removePackagingRow(i)">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Parameter Teknis -->
          <div class="bg-[#E9F8FF]/40 rounded-3xl p-5 sm:p-6 space-y-4 border border-[#D0F2F9]/70">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-[#89CBDD] text-[#082838] font-bold text-xs flex items-center justify-center">3</span>
              <h3 class="font-manrope font-bold text-[15px] text-[#0D2235]">Parameter Teknis & Penyimpanan</h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Suhu Penyimpanan </label>
                <input v-model="form.storageTemp" type="text" placeholder="Contoh: 2°C - 8°C" class="w-full px-4 py-2 rounded-2xl bg-white text-[13.5px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 font-mono" />
              </div>

              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Estimasi Pengiriman (Lead Time) </label>
                <input v-model="form.leadTime" type="text" placeholder="Contoh: Ready Stock Jabodetabek" class="w-full px-4 py-2 rounded-2xl bg-white text-[13.5px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30" />
              </div>

              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Jenis Spesimen / Sampel </label>
                <input v-model="form.sampleTypes" type="text" placeholder="Contoh: Serum, Plasma, Whole Blood" class="w-full px-4 py-2 rounded-2xl bg-white text-[13.5px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30" />
              </div>

              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Analit Target / Parameter Uji </label>
                <input v-model="form.targetAnalytes" type="text" placeholder="Contoh: Hepatitis B Surface Antigen (HBsAg)" class="w-full px-4 py-2 rounded-2xl bg-white text-[13.5px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30" />
              </div>
            </div>

            <!-- Dynamic Spec Rows -->
            <div class="pt-2 space-y-2.5">
              <div class="flex items-center justify-between">
                <label class="block text-[13px] font-manrope font-semibold text-[#0D2235]"> Spesifikasi Tambahan (Key-Value) </label>
                <button type="button" class="inline-flex items-center gap-1.5 text-[12px] font-manrope font-bold text-[#1B7E98] hover:text-[#0D253A] cursor-pointer" @click="addSpecRow">
                  <Plus class="w-3.5 h-3.5" />
                  <span>Tambah Parameter</span>
                </button>
              </div>

              <div v-for="(spec, i) in form.specifications" :key="i" class="flex items-center gap-2 p-2 rounded-2xl bg-white border border-[#D0F2F9]">
                <input v-model="spec.label" type="text" placeholder="Parameter (mis: Sensitivitas)" class="w-1/3 px-3 py-1.5 rounded-xl bg-[#E9F8FF]/50 text-[13px] outline-none focus:ring-2 focus:ring-[#89CBDD]/30 font-mono" />
                <input v-model="spec.value" type="text" placeholder="Nilai (mis: 99.8%)" class="flex-1 px-3 py-1.5 rounded-xl bg-[#E9F8FF]/50 text-[13px] outline-none focus:ring-2 focus:ring-[#89CBDD]/30" />
                <button type="button" class="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer" title="Hapus baris" @click="removeSpecRow(i)">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Toggles -->
            <div class="pt-3 flex flex-col sm:flex-row gap-5">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input v-model="form.isFeatured" type="checkbox" class="w-4 h-4 rounded text-[#89CBDD] focus:ring-[#89CBDD]" />
                <span class="text-[13px] font-manrope font-semibold text-[#0D2235]"> Tampilkan di Produk Unggulan Beranda </span>
              </label>

              <label class="flex items-center gap-2.5 cursor-pointer">
                <input v-model="form.isVerified" type="checkbox" class="w-4 h-4 rounded text-[#89CBDD] focus:ring-[#89CBDD]" />
                <span class="text-[13px] font-manrope font-semibold text-[#0D2235]"> Tandai Spesifikasi Terverifikasi Resmi </span>
              </label>
            </div>
          </div>
        </form>

        <!-- Modal Sticky Bottom Footer -->
        <div class="px-6 sm:px-8 py-4 bg-[#E9F8FF]/70 border-t border-[#D0F2F9] flex items-center justify-end gap-3 shrink-0">
          <button type="button" :disabled="isSubmitting" class="px-5 py-2.5 rounded-2xl bg-white hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13.5px] transition-colors border border-[#ADDFF1]/60 shadow-xs cursor-pointer disabled:opacity-50" @click="handleClose">Batal</button>

          <button type="submit" form="product-create-form" :disabled="isSubmitting" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13.5px] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50">
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            <span>{{ isSubmitting ? "Menyimpan Produk..." : "Simpan Produk Baru" }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
