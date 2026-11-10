<!-- @format -->

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Save,
  Package,
  Layers,
  Sparkles,
  Loader2,
  FileText,
  Download,
  AlertCircle,
  ExternalLink,
} from "lucide-vue-next";
import CategoryCombobox from "~/components/admin/CategoryCombobox.vue";
import { useActionModal } from "~/composables/useActionModal";
import type { ProductDocument } from "~/types/catalog";

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    mode?: "create" | "edit";
    product?: any | null;
  }>(),
  {
    mode: "create",
    product: null,
  }
);

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved", product: any): void;
}>();

const { showSuccess } = useActionModal();

const isSubmitting = ref(false);
const isUploadingImage = ref(false);
const isUploadingDoc = ref(false);
const errorMessage = ref<string | null>(null);

const documentTypes = [
  "Brosur Teknis",
  "COA",
  "SDS",
  "TDS",
  "Izin Edar Kemenkes",
];

const initialForm = () => ({
  id: "",
  sku: "",
  name: "",
  brand: "Angkasa Karya Medika",
  categorySlug: "reagents",
  categoryName: "Reagents",
  grade: "",
  casNumber: "",
  chemicalFormula: "",
  shortDescription: "",
  description: "",
  leadTime: "Ready Stock Jabodetabek",
  minOrderQuantity: "1 Box",
  imageUrl: "/images/products/ecotest-hbsag-flyer.png",
  isFeatured: false,
  isVerified: true,
  packaging: [{ size: 50, unit: "Test/Kit", packageType: "Cassette" }],
  specifications: [
    { label: "Metode Pengujian", value: "Rapid Immunochromatographic Assay" },
    { label: "Waktu Pembacaan", value: "15 Menit" },
  ],
  documents: [] as ProductDocument[],
});

const form = ref(initialForm());

const populateForm = () => {
  if (props.mode === "edit" && props.product) {
    const p = props.product;
    form.value = {
      id: p.id || "",
      sku: p.sku || "",
      name: p.name || "",
      brand: p.brand || "Angkasa Karya Medika",
      categorySlug: p.categorySlug || "reagents",
      categoryName: p.categoryName || "Reagents",
      grade: p.grade || "",
      casNumber: p.casNumber || "",
      chemicalFormula: p.chemicalFormula || "",
      shortDescription: p.shortDescription || "",
      description: p.description || "",
      leadTime: p.leadTime || "Ready Stock Jabodetabek",
      minOrderQuantity: p.minOrderQuantity || "1 Box",
      imageUrl: p.imageUrl || "/images/products/ecotest-hbsag-flyer.png",
      isFeatured: Boolean(p.isFeatured),
      isVerified: p.isVerified !== undefined ? Boolean(p.isVerified) : true,
      packaging:
        Array.isArray(p.packaging) && p.packaging.length > 0
          ? JSON.parse(JSON.stringify(p.packaging))
          : [{ size: 1, unit: "Kit", packageType: "Box" }],
      specifications:
        Array.isArray(p.specifications) && p.specifications.length > 0
          ? JSON.parse(JSON.stringify(p.specifications))
          : [{ label: "Metode Pengujian", value: "Rapid Assay" }],
      documents:
        Array.isArray(p.documents) && p.documents.length > 0
          ? JSON.parse(JSON.stringify(p.documents))
          : [],
    };
  } else {
    form.value = initialForm();
  }
};

watch(
  () => [props.isOpen, props.product],
  ([isOpen]) => {
    if (isOpen) {
      errorMessage.value = null;
      populateForm();
    }
  },
  { immediate: true }
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
  emit("close");
};

// Packaging rows
const addPackagingRow = () => {
  form.value.packaging.push({ size: 1, unit: "Kit", packageType: "Box" });
};
const removePackagingRow = (index: number) => {
  if (form.value.packaging.length > 1) {
    form.value.packaging.splice(index, 1);
  }
};

// Specification rows
const addSpecRow = () => {
  form.value.specifications.push({ label: "", value: "" });
};
const removeSpecRow = (index: number) => {
  if (form.value.specifications.length > 1) {
    form.value.specifications.splice(index, 1);
  }
};

// Document rows
const addDocRow = () => {
  form.value.documents.push({
    title: "",
    type: "Brosur Teknis",
    fileUrl: "",
    fileSize: "PDF",
  });
};
const removeDocRow = (index: number) => {
  form.value.documents.splice(index, 1);
};

// Upload Photo
const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const uploadData = new FormData();
  uploadData.append("image", file);

  isUploadingImage.value = true;
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
    errorMessage.value = err.data?.statusMessage || "Gagal mengunggah foto produk.";
  } finally {
    isUploadingImage.value = false;
    target.value = "";
  }
};

// Upload Document
const handleDocumentUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const uploadData = new FormData();
  uploadData.append("document", file);

  isUploadingDoc.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<{
      success: boolean;
      url: string;
      originalName: string;
      fileSize: string;
    }>("/api/upload", {
      method: "POST",
      body: uploadData,
    });

    if (res && res.url) {
      const lower = (res.originalName || "").toLowerCase();
      let docType = "Brosur Teknis";
      if (lower.includes("coa") || lower.includes("analisis")) docType = "COA";
      else if (lower.includes("sds") || lower.includes("msds") || lower.includes("keselamatan")) docType = "SDS";
      else if (lower.includes("tds") || lower.includes("teknis") || lower.includes("spesifikasi")) docType = "TDS";
      else if (lower.includes("izin") || lower.includes("kemenkes") || lower.includes("akd") || lower.includes("akl")) docType = "Izin Edar Kemenkes";

      form.value.documents.push({
        title: res.originalName.replace(/\.[^/.]+$/, ""),
        type: docType,
        fileUrl: res.url,
        fileSize: res.fileSize || "Dokumen",
      });
    }
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || "Gagal mengunggah dokumen teknis.";
  } finally {
    isUploadingDoc.value = false;
    target.value = "";
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
    if (props.mode === "edit" && form.value.id) {
      await $fetch(`/api/products/${form.value.id}`, {
        method: "PUT",
        body: form.value,
      });
      handleClose();
      showSuccess("Data Berhasil Diedit", `Perubahan produk "${form.value.name}" telah disimpan.`);
      emit("saved", form.value);
    } else {
      const res = await $fetch<{ success: boolean; product: any }>("/api/products", {
        method: "POST",
        body: form.value,
      });
      handleClose();
      showSuccess("Data Berhasil Disimpan", `Produk "${form.value.name}" berhasil ditambahkan.`);
      emit("saved", res?.product || form.value);
    }
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || "Gagal menyimpan data produk.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop Overlay -->
      <div
        class="fixed inset-0 bg-[#0D253A]/50 backdrop-blur-xs transition-opacity duration-200"
        @click="handleClose"
      />

      <!-- Modal Card Box -->
      <div
        class="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-[#ADDFF1]/60 flex flex-col max-h-[92dvh] sm:max-h-[90vh] my-auto text-[#0D2235] font-sans z-10 animate-scale-up overflow-hidden"
        @click.stop
      >
        <!-- Modal Sticky Top Header -->
        <div class="px-5 sm:px-7 py-4 bg-gradient-to-r from-white via-[#E9F8FF]/60 to-white border-b border-[#D0F2F9] flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ADDFF1]/40 to-[#A3EEEC]/60 text-[#054E4C] flex items-center justify-center shadow-xs border border-[#89CBDD]/30">
              <Package class="w-5 h-5 text-[#082838]" />
            </div>
            <div>
              <div class="inline-flex items-center gap-1.5 text-[10.5px] font-manrope font-extrabold uppercase tracking-wider text-[#054E4C] bg-[#A3EEEC] px-2.5 py-0.5 rounded-full mb-0.5">
                <span>{{ mode === "edit" ? "Edit Data Katalog" : "Formulir Entri Produk" }}</span>
              </div>
              <h2 class="font-manrope font-extrabold text-base sm:text-lg text-[#0D2235] leading-tight">
                {{ mode === "edit" ? `Edit Produk: ${form.name || form.sku}` : "Tambah Produk Baru" }}
              </h2>
            </div>
          </div>

          <button
            type="button"
            class="p-2 rounded-2xl text-[#486581] hover:text-[#0D2235] hover:bg-[#E9F8FF] transition-colors cursor-pointer"
            title="Tutup (Esc)"
            @click="handleClose"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Scrollable Modal Body Form -->
        <form
          id="product-form-modal"
          class="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 overscroll-contain"
          @submit.prevent="handleSubmit"
        >
          <!-- Error Alert inside modal -->
          <div
            v-if="errorMessage"
            class="p-4 rounded-2xl bg-red-100 text-red-800 text-[13.5px] flex items-center gap-2.5 font-medium shadow-xs"
          >
            <AlertCircle class="w-5 h-5 text-red-600 shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Section 1: Informasi Utama -->
          <div class="bg-[#E9F8FF]/40 rounded-3xl p-4 sm:p-5 space-y-4 border border-[#D0F2F9]/70">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-[#89CBDD] text-[#082838] font-bold text-xs flex items-center justify-center">1</span>
              <h3 class="font-manrope font-bold text-[14.5px] text-[#0D2235]">Informasi Utama Produk</h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Nama Produk -->
              <div class="space-y-1 sm:col-span-2">
                <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]">
                  Nama Produk <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Contoh: HBSAG Test ECOTEST Rapid Cassette"
                  class="w-full px-3.5 py-2.5 rounded-2xl bg-white text-[13.5px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all font-sans"
                  required
                />
              </div>

              <!-- Kategori Combobox -->
              <div class="sm:col-span-2">
                <CategoryCombobox
                  v-model="form.categorySlug"
                  label="Kategori Produk"
                  :required="true"
                  @change="(cat) => { form.categoryName = cat.name; }"
                />
              </div>

              <!-- SKU / Kode Katalog -->
              <div class="space-y-1">
                <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]">
                  Nomor SKU / Katalog <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.sku"
                  type="text"
                  placeholder="Contoh: ARM-RDT-HBSAG50"
                  class="w-full px-3.5 py-2.5 rounded-2xl bg-white text-[13.5px] text-[#0D2235] font-mono border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all"
                  required
                />
              </div>

              <!-- Merek / Prinsipal -->
              <div class="space-y-1">
                <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]"> Merek / Prinsipal </label>
                <input
                  v-model="form.brand"
                  type="text"
                  placeholder="Contoh: ARM Diagnostics / Angkasa Karya Medika"
                  class="w-full px-3.5 py-2.5 rounded-2xl bg-white text-[13.5px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all"
                />
              </div>

              <!-- Standar Mutu / Grade -->
              <div class="space-y-1">
                <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]"> Standar Mutu / Grade </label>
                <input
                  v-model="form.grade"
                  type="text"
                  placeholder="Contoh: Kemenkes RI AKD / USP / ACS Grade"
                  class="w-full px-3.5 py-2.5 rounded-2xl bg-white text-[13.5px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all"
                />
              </div>

              <!-- Lead Time -->
              <div class="space-y-1">
                <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]"> Estimasi Pengiriman </label>
                <input
                  v-model="form.leadTime"
                  type="text"
                  placeholder="Contoh: Ready Stock Jabodetabek"
                  class="w-full px-3.5 py-2.5 rounded-2xl bg-white text-[13.5px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all"
                />
              </div>

              <!-- CAS & Formula (Opsional) -->
              <div class="space-y-1">
                <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]"> Nomor CAS (Jika Ada) </label>
                <input
                  v-model="form.casNumber"
                  type="text"
                  placeholder="Contoh: 9048-46-8"
                  class="w-full px-3.5 py-2.5 rounded-2xl bg-white text-[13.5px] text-[#0D2235] font-mono border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]"> Rumus Kimia (Jika Ada) </label>
                <input
                  v-model="form.chemicalFormula"
                  type="text"
                  placeholder="Contoh: C6H12O6"
                  class="w-full px-3.5 py-2.5 rounded-2xl bg-white text-[13.5px] text-[#0D2235] font-mono border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all"
                />
              </div>

              <!-- Deskripsi Singkat -->
              <div class="space-y-1 sm:col-span-2">
                <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]"> Deskripsi Ringkas </label>
                <textarea
                  v-model="form.shortDescription"
                  rows="2"
                  placeholder="Ringkasan fungsi utama produk untuk tampilan kartu katalog..."
                  class="w-full px-3.5 py-2 rounded-2xl bg-white text-[13.5px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all font-sans resize-none"
                />
              </div>

              <!-- Deskripsi Lengkap -->
              <div class="space-y-1 sm:col-span-2">
                <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]"> Deskripsi Lengkap & Peruntukan </label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  placeholder="Jelaskan spesifikasi, prinsip kerja atau tujuan pengujian..."
                  class="w-full px-3.5 py-2.5 rounded-2xl bg-white text-[13.5px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all font-sans resize-none"
                />
              </div>
            </div>
          </div>

          <!-- Section 2: Foto Produk & Kemasan -->
          <div class="bg-[#E9F8FF]/40 rounded-3xl p-4 sm:p-5 space-y-4 border border-[#D0F2F9]/70">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-[#89CBDD] text-[#082838] font-bold text-xs flex items-center justify-center">2</span>
              <h3 class="font-manrope font-bold text-[14.5px] text-[#0D2235]">Foto Produk & Pilihan Kemasan</h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
              <!-- Upload Box -->
              <div class="sm:col-span-4 bg-white p-3.5 rounded-3xl border border-[#D0F2F9] text-center space-y-2.5 shadow-2xs">
                <span class="block text-[11px] font-manrope font-bold uppercase tracking-wider text-[#486581]"> Foto Produk </span>

                <div class="w-24 h-24 mx-auto rounded-2xl bg-[#E9F8FF] p-2 flex items-center justify-center overflow-hidden border border-[#ADDFF1]/40">
                  <img :src="form.imageUrl" alt="Preview" class="w-full h-full object-contain" />
                </div>

                <label class="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] text-[12px] font-manrope font-bold cursor-pointer transition-all w-full shadow-xs">
                  <Loader2 v-if="isUploadingImage" class="w-3.5 h-3.5 animate-spin" />
                  <Upload v-else class="w-3.5 h-3.5" />
                  <span>{{ isUploadingImage ? "Mengunggah..." : "Ganti / Unggah Foto" }}</span>
                  <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
                </label>

                <input
                  v-model="form.imageUrl"
                  type="text"
                  class="w-full px-2.5 py-1.5 rounded-xl bg-[#E9F8FF]/60 text-[11px] font-mono text-[#0D2235] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/30 border border-transparent"
                  placeholder="/images/products/..."
                />
              </div>

              <!-- Dynamic Packaging Rows -->
              <div class="sm:col-span-8 space-y-2">
                <div class="flex items-center justify-between">
                  <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]"> Pilihan Kemasan </label>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-[11.5px] font-manrope font-bold text-[#1B7E98] hover:text-[#0D253A] cursor-pointer"
                    @click="addPackagingRow"
                  >
                    <Plus class="w-3.5 h-3.5" />
                    <span>Tambah Kemasan</span>
                  </button>
                </div>

                <div
                  v-for="(pack, i) in form.packaging"
                  :key="i"
                  class="flex items-center gap-2 p-2 rounded-2xl bg-white border border-[#D0F2F9]"
                >
                  <input
                    v-model="pack.size"
                    type="text"
                    placeholder="Ukuran"
                    class="w-20 px-3 py-1.5 rounded-xl bg-[#E9F8FF]/50 text-[12.5px] font-mono outline-none focus:ring-2 focus:ring-[#89CBDD]/30"
                  />
                  <input
                    v-model="pack.unit"
                    type="text"
                    placeholder="Satuan (Test/mL)"
                    class="flex-1 px-3 py-1.5 rounded-xl bg-[#E9F8FF]/50 text-[12.5px] outline-none focus:ring-2 focus:ring-[#89CBDD]/30"
                  />
                  <input
                    v-model="pack.packageType"
                    type="text"
                    placeholder="Kemasan (Box/Kit)"
                    class="flex-1 px-3 py-1.5 rounded-xl bg-[#E9F8FF]/50 text-[12.5px] outline-none focus:ring-2 focus:ring-[#89CBDD]/30"
                  />
                  <button
                    v-if="form.packaging.length > 1"
                    type="button"
                    class="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Hapus baris"
                    @click="removePackagingRow(i)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Dokumen & Lembar Data Teknis (UPLOAD, EDIT & HAPUS) -->
          <div class="bg-[#E9F8FF]/40 rounded-3xl p-4 sm:p-5 space-y-4 border border-[#D0F2F9]/70">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-[#89CBDD] text-[#082838] font-bold text-xs flex items-center justify-center">3</span>
                <div>
                  <h3 class="font-manrope font-bold text-[14.5px] text-[#0D2235]">Dokumen & Lembar Teknis (COA, SDS, Brosur)</h3>
                  <p class="text-[11.5px] text-[#486581]">File PDF/Dokumen yang dapat diunduh langsung oleh calon pembeli</p>
                </div>
              </div>

              <!-- Upload Document CTA -->
              <div class="flex items-center gap-2 self-start sm:self-auto">
                <label class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] text-[12px] font-manrope font-bold cursor-pointer transition-all shadow-xs">
                  <Loader2 v-if="isUploadingDoc" class="w-3.5 h-3.5 animate-spin" />
                  <Upload v-else class="w-3.5 h-3.5" />
                  <span>{{ isUploadingDoc ? "Mengunggah Dokumen..." : "Unggah Berkas (PDF/DOC)" }}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    class="hidden"
                    @change="handleDocumentUpload"
                  />
                </label>

                <button
                  type="button"
                  class="px-3 py-1.5 rounded-2xl bg-white hover:bg-[#D0F2F9] text-[#1B7E98] text-[12px] font-manrope font-bold border border-[#ADDFF1]/60 cursor-pointer transition-colors"
                  @click="addDocRow"
                >
                  <Plus class="w-3 h-3 inline mr-1" />
                  <span>Manual</span>
                </button>
              </div>
            </div>

            <!-- Documents Table / Rows -->
            <div v-if="form.documents.length > 0" class="space-y-2.5 pt-1">
              <div
                v-for="(doc, idx) in form.documents"
                :key="idx"
                class="p-3 bg-white rounded-2xl border border-[#D0F2F9] space-y-2 shadow-2xs"
              >
                <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <!-- Title Input -->
                  <div class="sm:col-span-5">
                    <input
                      v-model="doc.title"
                      type="text"
                      placeholder="Judul Berkas (mis: COA Lot 2026, Brosur Teknis)"
                      class="w-full px-3 py-1.5 rounded-xl bg-[#E9F8FF]/50 text-[12.5px] font-medium outline-none focus:ring-2 focus:ring-[#89CBDD]/30"
                    />
                  </div>

                  <!-- Type Selector -->
                  <div class="sm:col-span-3">
                    <select
                      v-model="doc.type"
                      class="w-full px-3 py-1.5 rounded-xl bg-[#E9F8FF]/50 text-[12px] font-semibold outline-none focus:ring-2 focus:ring-[#89CBDD]/30"
                    >
                      <option v-for="t in documentTypes" :key="t" :value="t">{{ t }}</option>
                    </select>
                  </div>

                  <!-- File Size -->
                  <div class="sm:col-span-2">
                    <input
                      v-model="doc.fileSize"
                      type="text"
                      placeholder="Ukuran (mis: 1.2 MB)"
                      class="w-full px-2.5 py-1.5 rounded-xl bg-[#E9F8FF]/50 text-[11.5px] font-mono outline-none focus:ring-2 focus:ring-[#89CBDD]/30 text-center"
                    />
                  </div>

                  <!-- Action / Delete -->
                  <div class="sm:col-span-2 flex items-center justify-end gap-1.5">
                    <a
                      v-if="doc.fileUrl && doc.fileUrl !== '#'"
                      :href="doc.fileUrl"
                      target="_blank"
                      class="p-1.5 rounded-xl text-[#1B7E98] hover:bg-[#E9F8FF]"
                      title="Lihat Berkas"
                    >
                      <ExternalLink class="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      class="p-1.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus Dokumen"
                      @click="removeDocRow(idx)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- URL link input -->
                <div class="flex items-center gap-2">
                  <span class="text-[10.5px] font-mono text-[#486581] shrink-0">URL:</span>
                  <input
                    v-model="doc.fileUrl"
                    type="text"
                    placeholder="/documents/products/..."
                    class="w-full px-2.5 py-1 rounded-lg bg-[#E9F8FF]/30 text-[11px] font-mono text-[#0D2235] outline-none focus:ring-1 focus:ring-[#89CBDD]/40"
                  />
                </div>
              </div>
            </div>

            <div
              v-else
              class="p-5 text-center bg-white rounded-2xl border border-dashed border-[#ADDFF1] text-[#486581] text-[12.5px] space-y-1"
            >
              <FileText class="w-6 h-6 mx-auto text-[#89CBDD]" />
              <p>Belum ada dokumen atau lembar teknis terlampir.</p>
              <p class="text-[11px] text-[#486581]/70">Klik tombol di atas untuk mengunggah file PDF Brosur/COA/SDS.</p>
            </div>
          </div>

          <!-- Section 4: Spesifikasi Teknis & Toggles -->
          <div class="bg-[#E9F8FF]/40 rounded-3xl p-4 sm:p-5 space-y-4 border border-[#D0F2F9]/70">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-[#89CBDD] text-[#082838] font-bold text-xs flex items-center justify-center">4</span>
              <h3 class="font-manrope font-bold text-[14.5px] text-[#0D2235]">Spesifikasi Teknis & Status</h3>
            </div>

            <!-- Dynamic Spec Rows -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]"> Parameter Uji Tambahan </label>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-[11.5px] font-manrope font-bold text-[#1B7E98] hover:text-[#0D253A] cursor-pointer"
                  @click="addSpecRow"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Tambah Baris</span>
                </button>
              </div>

              <div
                v-for="(spec, i) in form.specifications"
                :key="i"
                class="flex items-center gap-2 p-2 rounded-2xl bg-white border border-[#D0F2F9]"
              >
                <input
                  v-model="spec.label"
                  type="text"
                  placeholder="Parameter (mis: Akurasi)"
                  class="w-1/3 px-3 py-1.5 rounded-xl bg-[#E9F8FF]/50 text-[12.5px] outline-none focus:ring-2 focus:ring-[#89CBDD]/30 font-mono"
                />
                <input
                  v-model="spec.value"
                  type="text"
                  placeholder="Nilai (mis: 99.8%)"
                  class="flex-1 px-3 py-1.5 rounded-xl bg-[#E9F8FF]/50 text-[12.5px] outline-none focus:ring-2 focus:ring-[#89CBDD]/30"
                />
                <button
                  v-if="form.specifications.length > 1"
                  type="button"
                  class="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Hapus baris"
                  @click="removeSpecRow(i)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Toggles -->
            <div class="pt-3 flex flex-col sm:flex-row gap-4 border-t border-[#D0F2F9]/60">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input
                  v-model="form.isFeatured"
                  type="checkbox"
                  class="w-4 h-4 rounded text-[#89CBDD] focus:ring-[#89CBDD]"
                />
                <span class="text-[12.5px] font-manrope font-semibold text-[#0D2235]">
                  Tampilkan di Produk Unggulan Beranda
                </span>
              </label>

              <label class="flex items-center gap-2.5 cursor-pointer">
                <input
                  v-model="form.isVerified"
                  type="checkbox"
                  class="w-4 h-4 rounded text-[#89CBDD] focus:ring-[#89CBDD]"
                />
                <span class="text-[12.5px] font-manrope font-semibold text-[#0D2235]">
                  Tandai Spesifikasi Terverifikasi Resmi
                </span>
              </label>
            </div>
          </div>
        </form>

        <!-- Modal Sticky Bottom Footer -->
        <div class="px-5 sm:px-7 py-3.5 bg-[#E9F8FF]/70 border-t border-[#D0F2F9] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            :disabled="isSubmitting"
            class="px-5 py-2.5 rounded-2xl bg-white hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13px] transition-colors border border-[#ADDFF1]/60 shadow-xs cursor-pointer disabled:opacity-50"
            @click="handleClose"
          >
            Batal
          </button>

          <button
            type="submit"
            form="product-form-modal"
            :disabled="isSubmitting"
            class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13.5px] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            <span>{{ isSubmitting ? "Menyimpan Data..." : mode === "edit" ? "Simpan Perubahan" : "Simpan Produk Baru" }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
