<!-- @format -->

<script setup lang="ts">
import { ref, watch } from "vue";
import { X, Plus, Upload, Save, Package, Loader2, FileText, FileImage, AlertCircle, ExternalLink, RotateCcw, Power, Trash2 } from "lucide-vue-next";
import CategoryCombobox from "~/components/admin/CategoryCombobox.vue";
import SoftDropdown from "~/components/admin/SoftDropdown.vue";
import { useActionModal } from "~/composables/useActionModal";
import { useAdminAuth } from "~/composables/useAdminAuth";
import { useEscapeDismiss, useModalAutoFocus } from "~/composables/useKeyboardShortcuts";
import { MAX_IMAGE_MB, MAX_DOC_MB, validateImageUpload, validatePdfUpload, onNumericInput } from "~/utils/validation";
import { AVAILABILITY_OPTIONS, deriveAvailabilityStatus } from "~/utils/availability";
import type { ProductDocument, ProductAvailabilityStatus } from "~/types/catalog";

interface FormProductDocument extends ProductDocument {
  _isNew?: boolean;
}

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    mode?: "create" | "edit";
    product?: any | null;
  }>(),
  {
    mode: "create",
    product: null,
  },
);

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved", product: any): void;
}>();

const { showSuccess } = useActionModal();
const { isSuperAdmin } = useAdminAuth();

const modalCardRef = ref<HTMLElement | null>(null);
const isSubmitting = ref(false);
const isUploadingImage = ref(false);
const uploadingDocIndex = ref<number | null>(null);
const uploadedImageName = ref("");
const errorMessage = ref<string | null>(null);
const activeDraftKey = ref<string | null>(null);

const documentTypes: ProductDocument["type"][] = ["Brosur Teknis", "COA", "SDS", "TDS", "Izin Edar Kemenkes"];

const getFilenameFromUrl = (url?: string): string => {
  if (!url || url === "#") return "";
  const clean = url.split("?")[0] || "";
  return clean.split("/").pop() || "";
};

const getDocFilename = (doc: FormProductDocument): string => {
  if (doc.fileName) return doc.fileName;
  return getFilenameFromUrl(doc.fileUrl) || "dokumen.pdf";
};

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
  availabilityStatus: "ready" as ProductAvailabilityStatus,
  leadTime: "Tersedia Jabodetabek",
  minOrderQuantity: "1 Box",
  imageUrl: "/images/products/ecotest-hbsag-flyer.png",
  isFeatured: false,
  isVerified: true,
  packaging: [{ size: "50", unit: "Test/Kit", container: "Cassette" }],
  specifications: [
    { label: "Metode Pengujian", value: "Rapid Immunochromatographic Assay", isVerified: true },
    { label: "Waktu Pembacaan", value: "15 Menit", isVerified: true },
  ],
  documents: [] as FormProductDocument[],
});

const form = ref(initialForm());

const populateForm = () => {
  uploadedImageName.value = "";
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
      availabilityStatus: deriveAvailabilityStatus(p.availabilityStatus, p.leadTime),
      leadTime: p.leadTime || "Tersedia Jabodetabek",
      minOrderQuantity: p.minOrderQuantity || "1 Box",
      imageUrl: p.imageUrl || "/images/products/ecotest-hbsag-flyer.png",
      isFeatured: Boolean(p.isFeatured),
      isVerified: p.isVerified !== undefined ? Boolean(p.isVerified) : true,
      packaging:
        Array.isArray(p.packaging) && p.packaging.length > 0
          ? p.packaging.map((item: any) => ({
              size: String(item.size ?? ""),
              unit: String(item.unit ?? ""),
              container: String(item.container ?? item.packageType ?? ""),
            }))
          : [{ size: "1", unit: "Kit", container: "Box" }],
      specifications:
        Array.isArray(p.specifications) && p.specifications.length > 0
          ? p.specifications.map((s: any) => ({
              label: String(s.label ?? ""),
              value: String(s.value ?? ""),
              isVerified: s.isVerified !== undefined ? Boolean(s.isVerified) : true,
            }))
          : [{ label: "Metode Pengujian", value: "Rapid Assay", isVerified: true }],
      documents:
        Array.isArray(p.documents) && p.documents.length > 0
          ? p.documents.map((d: any) => ({
              ...d,
              fileName: d?.fileName || getFilenameFromUrl(d?.fileUrl),
              isActive: d?.isActive !== false,
              _isNew: false,
            }))
          : [],
    };
  } else {
    form.value = initialForm();
  }
};

// Modal State Retention: only repopulate when opening a DIFFERENT draft/product key
watch(
  () => [props.isOpen, props.mode, props.product?.id],
  ([isOpen]) => {
    if (isOpen) {
      errorMessage.value = null;
      const nextKey = props.mode === "edit" && props.product?.id ? `edit:${props.product.id}` : "create";
      if (activeDraftKey.value !== nextKey) {
        populateForm();
        activeDraftKey.value = nextKey;
      }
    }
  },
  { immediate: true },
);

const handleReset = () => {
  if (isSubmitting.value || isUploadingImage.value || uploadingDocIndex.value !== null) return;
  errorMessage.value = null;
  populateForm();
};

const handleClose = () => {
  if (isSubmitting.value) return;
  errorMessage.value = null;
  emit("close");
};

useModalAutoFocus(() => props.isOpen, modalCardRef);
useEscapeDismiss(() => props.isOpen, handleClose);

const addPackagingRow = () => {
  form.value.packaging.push({ size: "1", unit: "Kit", container: "Box" });
};

const addSpecRow = () => {
  form.value.specifications.push({ label: "", value: "", isVerified: true });
};

const addDocRow = () => {
  form.value.documents.push({
    title: "",
    type: "Brosur Teknis",
    fileUrl: "",
    fileName: "",
    fileSize: "",
    isActive: true,
    _isNew: true,
  });
};

const removeDocRow = (index: number) => {
  const doc = form.value.documents[index];
  if (!doc || !doc._isNew) return;
  form.value.documents.splice(index, 1);
};

const toggleDocStatus = (index: number) => {
  if (!isSuperAdmin.value) return;
  const doc = form.value.documents[index];
  if (!doc || doc._isNew) return;
  doc.isActive = doc.isActive === false;
};

// Upload Photo with strict format (.jpg/.jpeg/.png/.webp) and size validation (2 MB)
const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  target.value = "";
  if (!file) return;

  const check = validateImageUpload(file);
  if (!check.valid) {
    errorMessage.value = check.message;
    return;
  }

  const uploadData = new FormData();
  uploadData.append("image", file);

  isUploadingImage.value = true;
  errorMessage.value = null;
  try {
    const res = await $fetch<{ success: boolean; url: string; originalName?: string }>("/api/upload", {
      method: "POST",
      body: uploadData,
    });
    if (res && res.url) {
      form.value.imageUrl = res.url;
      uploadedImageName.value = res.originalName || file.name;
    }
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || "Gagal mengunggah foto produk.";
  } finally {
    isUploadingImage.value = false;
  }
};

// Per-row PDF upload with strict .pdf format & 5 MB limit
const handleRowDocumentUpload = async (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  target.value = "";
  if (!file) return;

  const check = validatePdfUpload(file);
  if (!check.valid) {
    errorMessage.value = check.message;
    return;
  }

  const docRow = form.value.documents[index];
  if (!docRow) return;

  const uploadData = new FormData();
  uploadData.append("document", file);

  uploadingDocIndex.value = index;
  errorMessage.value = null;
  try {
    const res = await $fetch<{
      success: boolean;
      url: string;
      originalName?: string;
      fileSize?: string;
    }>("/api/upload", {
      method: "POST",
      body: uploadData,
    });

    if (res && res.url) {
      const displayFileName = res.originalName || file.name;
      if (!docRow.title.trim()) {
        docRow.title = displayFileName.replace(/\.pdf$/i, "");
        const lower = displayFileName.toLowerCase();
        if (lower.includes("coa") || lower.includes("analisis")) docRow.type = "COA";
        else if (lower.includes("sds") || lower.includes("msds") || lower.includes("keselamatan")) docRow.type = "SDS";
        else if (lower.includes("tds") || lower.includes("teknis") || lower.includes("spesifikasi")) docRow.type = "TDS";
        else if (lower.includes("izin") || lower.includes("kemenkes") || lower.includes("akd") || lower.includes("akl")) {
          docRow.type = "Izin Edar Kemenkes";
        }
      }

      docRow.fileUrl = res.url;
      docRow.fileName = displayFileName;
      docRow.fileSize = res.fileSize || "PDF";
    }
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || "Gagal mengunggah dokumen PDF.";
  } finally {
    uploadingDocIndex.value = null;
  }
};

// Submit handler
const handleSubmit = async () => {
  if (isSubmitting.value || isUploadingImage.value || uploadingDocIndex.value !== null) return;
  if (!form.value.name.trim() || !form.value.sku.trim()) {
    errorMessage.value = "Nama produk dan nomor SKU wajib diisi.";
    return;
  }

  for (const doc of form.value.documents) {
    if (!doc.title.trim()) {
      errorMessage.value = "Setiap baris dokumen teknis wajib diisi Judul Berkas.";
      return;
    }
    if (!doc.fileUrl || (doc._isNew && doc.fileUrl.trim() === "")) {
      errorMessage.value = `Dokumen "${doc.title}" belum memiliki file PDF terunggah. Silakan pilih file PDF atau hapus baris yang tidak diperlukan.`;
      return;
    }
  }

  isSubmitting.value = true;
  errorMessage.value = null;

  const payload = {
    ...form.value,
    documents: form.value.documents.map(({ _isNew, ...rest }) => rest),
  };

  try {
    if (props.mode === "edit" && form.value.id) {
      await $fetch(`/api/products/${form.value.id}`, {
        method: "PUT",
        body: payload,
      });
      activeDraftKey.value = null;
      const savedName = form.value.name;
      const savedSnapshot = { ...payload };
      form.value = initialForm();
      emit("close");
      showSuccess("Data Berhasil Diedit", `Perubahan produk "${savedName}" telah disimpan.`);
      emit("saved", savedSnapshot);
    } else {
      const res = await $fetch<{ success: boolean; product: any }>("/api/products", {
        method: "POST",
        body: payload,
      });
      activeDraftKey.value = null;
      const savedName = form.value.name;
      const savedSnapshot = res?.product || { ...payload };
      form.value = initialForm();
      emit("close");
      showSuccess("Data Berhasil Disimpan", `Produk "${savedName}" berhasil ditambahkan.`);
      emit("saved", savedSnapshot);
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
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto" role="dialog" aria-modal="true">
      <!-- Backdrop Overlay -->
      <div class="fixed inset-0 bg-[#0D253A]/50 backdrop-blur-xs transition-opacity duration-200" @click="handleClose" />

      <!-- Modal Card Box -->
      <div ref="modalCardRef" class="relative bg-white rounded-md max-w-3xl w-full shadow-2xl border border-[#ADDFF1]/60 flex flex-col max-h-[92dvh] sm:max-h-[90vh] my-auto text-[#0D2235] font-sans z-10 animate-scale-up overflow-hidden" @click.stop>
        <!-- Modal Sticky Top Header -->
        <div class="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-white via-[#E9F8FF]/60 to-white border-b border-[#D0F2F9] flex items-center justify-between shrink-0 gap-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-9 h-9 rounded-md bg-gradient-to-br from-[#ADDFF1]/40 to-[#A3EEEC]/60 text-[#054E4C] flex items-center justify-center shrink-0 border border-[#89CBDD]/30">
              <Package class="w-4.5 h-4.5 text-[#082838]" />
            </div>
            <div class="min-w-0">
              <div class="inline-flex items-center gap-1.5 text-[10px] font-manrope font-extrabold uppercase tracking-wider text-[#054E4C] bg-[#A3EEEC] px-2 py-0.5 rounded-sm mb-0.5">
                <span>{{ mode === "edit" ? "Edit Data Katalog" : "Entri Produk" }}</span>
              </div>
              <h2 class="font-manrope font-extrabold text-[15px] sm:text-lg text-[#0D2235] leading-tight truncate">
                {{ mode === "edit" ? `Edit: ${form.name || form.sku}` : "Tambah Produk" }}
              </h2>
            </div>
          </div>

          <button type="button" :disabled="isSubmitting" class="p-1.5 rounded-md text-[#486581] hover:text-[#0D2235] hover:bg-[#E9F8FF] transition-colors cursor-pointer shrink-0 disabled:opacity-50" title="Tutup (Esc)" @click="handleClose">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Scrollable Modal Body Form -->
        <form id="product-form-modal" class="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 space-y-5 overscroll-contain" @submit.prevent="handleSubmit">
          <fieldset :disabled="isSubmitting" class="space-y-5 min-w-0">
            <!-- Error Alert inside modal -->
            <div v-if="errorMessage" class="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-800 text-[13px] flex items-center gap-2 font-medium">
              <AlertCircle class="w-4.5 h-4.5 text-red-600 shrink-0" />
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Section 1: Informasi Utama -->
            <div class="bg-[#E9F8FF]/40 rounded-md p-3.5 sm:p-5 space-y-4">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-sm bg-[#89CBDD] text-[#082838] font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <h3 class="font-manrope font-bold text-[14px] text-[#0D2235]">Informasi Utama Produk</h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <!-- Nama Produk -->
                <div class="space-y-1 sm:col-span-2 min-w-0">
                  <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]"> Nama Produk <span class="text-red-500">*</span> </label>
                  <input v-model="form.name" type="text" placeholder="Contoh: HBSAG Test ECOTEST Rapid Cassette" class="w-full min-w-0 px-3.5 py-2 rounded-md bg-white text-[13.5px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all font-sans" required />
                </div>

                <!-- Kategori Combobox -->
                <div class="sm:col-span-2 min-w-0">
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

                <!-- SKU -->
                <div class="space-y-1 min-w-0">
                  <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]"> Nomor SKU / Katalog <span class="text-red-500">*</span> </label>
                  <input v-model="form.sku" type="text" placeholder="Contoh: ARM-RDT-HBSAG50" class="w-full min-w-0 px-3.5 py-2 rounded-md bg-white text-[13.5px] text-[#0D2235] font-mono border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all" required />
                </div>

                <!-- Merek / Prinsipal (*jika ada) -->
                <div class="space-y-1 min-w-0">
                  <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]">
                    Merek / Prinsipal
                    <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span>
                  </label>
                  <input v-model="form.brand" type="text" placeholder="Contoh: ECOTEST / Angkasa Karya Medika" class="w-full min-w-0 px-3.5 py-2 rounded-md bg-white text-[13.5px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all" />
                </div>

                <!-- Standar Mutu (*jika ada) -->
                <div class="space-y-1 min-w-0">
                  <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]">
                    Standar Mutu / Grade
                    <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span>
                  </label>
                  <input v-model="form.grade" type="text" placeholder="Contoh: Kemenkes RI AKD / USP" class="w-full min-w-0 px-3.5 py-2 rounded-md bg-white text-[13.5px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all" />
                </div>

                <!-- Status Ketersediaan -->
                <div class="space-y-1 min-w-0">
                  <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]"> Status Ketersediaan <span class="text-red-500">*</span> </label>
                  <SoftDropdown v-model="form.availabilityStatus" :options="AVAILABILITY_OPTIONS" full-width />
                </div>

                <!-- Lead Time (*jika ada) -->
                <div class="space-y-1 min-w-0">
                  <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]">
                    Estimasi Pengiriman
                    <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span>
                  </label>
                  <input v-model="form.leadTime" type="text" placeholder="Contoh: Tersedia Jabodetabek" class="w-full min-w-0 px-3.5 py-2 rounded-md bg-white text-[13.5px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all" />
                </div>

                <!-- CAS (*jika ada) -->
                <div class="space-y-1 min-w-0">
                  <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]">
                    Nomor CAS
                    <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span>
                  </label>
                  <input v-model="form.casNumber" type="text" placeholder="Contoh: 9048-46-8" class="w-full min-w-0 px-3.5 py-2 rounded-md bg-white text-[13.5px] text-[#0D2235] font-mono border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all" />
                </div>

                <!-- Rumus Kimia (*jika ada) -->
                <div class="space-y-1 sm:col-span-2 min-w-0">
                  <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]">
                    Rumus Kimia
                    <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span>
                  </label>
                  <input v-model="form.chemicalFormula" type="text" placeholder="Contoh: C6H12O6" class="w-full min-w-0 px-3.5 py-2 rounded-md bg-white text-[13.5px] text-[#0D2235] font-mono border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all" />
                </div>

                <!-- Deskripsi Singkat (*jika ada) -->
                <div class="space-y-1 sm:col-span-2 min-w-0">
                  <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]">
                    Deskripsi Ringkas
                    <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span>
                  </label>
                  <textarea v-model="form.shortDescription" rows="2" placeholder="Ringkasan fungsi utama produk untuk tampilan kartu katalog... (Ctrl+Enter untuk simpan)" class="w-full min-w-0 px-3.5 py-2 rounded-md bg-white text-[13.5px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all font-sans resize-none" @keydown.ctrl.enter.prevent="handleSubmit" @keydown.meta.enter.prevent="handleSubmit" />
                </div>

                <!-- Deskripsi Lengkap (*jika ada) -->
                <div class="space-y-1 sm:col-span-2 min-w-0">
                  <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]">
                    Deskripsi Lengkap & Peruntukan
                    <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span>
                  </label>
                  <textarea v-model="form.description" rows="3" placeholder="Jelaskan spesifikasi, prinsip kerja atau tujuan pengujian... (Ctrl+Enter untuk simpan)" class="w-full min-w-0 px-3.5 py-2 rounded-md bg-white text-[13.5px] text-[#0D2235] border border-[#D0F2F9] focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/40 transition-all font-sans resize-none" @keydown.ctrl.enter.prevent="handleSubmit" @keydown.meta.enter.prevent="handleSubmit" />
                </div>
              </div>
            </div>

            <!-- Section 2: Foto Produk & Pilihan Kemasan (Murni File Upload Tanpa URL Manual) -->
            <div class="bg-[#E9F8FF]/40 rounded-md p-3.5 sm:p-5 space-y-4">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-sm bg-[#89CBDD] text-[#082838] font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <h3 class="font-manrope font-bold text-[14px] text-[#0D2235]">Foto Produk & Pilihan Kemasan</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <!-- Upload Photo Box -->
                <div class="md:col-span-4 bg-white p-3.5 rounded-md text-center space-y-2.5 shadow-2xs min-w-0">
                  <span class="block text-[11px] font-manrope font-bold uppercase tracking-wider text-[#486581]">
                    Foto Produk
                    <span class="text-red-500 text-[10px] font-normal lowercase block mt-0.5">Hanya .jpg, .png, .webp &bull; Maks. {{ MAX_IMAGE_MB }} MB</span>
                  </span>

                  <div class="w-24 h-24 mx-auto rounded-md bg-[#E9F8FF] p-2 flex items-center justify-center overflow-hidden">
                    <img :src="form.imageUrl || '/brand/logo_akm.jpg'" alt="Preview" class="w-full h-full object-contain" />
                  </div>

                  <label class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] text-[12px] font-manrope font-bold cursor-pointer transition-all w-full shadow-xs">
                    <Loader2 v-if="isUploadingImage" class="w-3.5 h-3.5 animate-spin" />
                    <Upload v-else class="w-3.5 h-3.5" />
                    <span>{{ isUploadingImage ? "Mengunggah..." : "Ganti / Unggah Foto" }}</span>
                    <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" class="hidden" @change="handleImageUpload" />
                  </label>

                  <div class="inline-flex items-center justify-center gap-1.5 max-w-full px-2.5 py-1 rounded-sm bg-[#F4FBFE] text-[11px] font-mono text-[#486581]">
                    <FileImage class="w-3 h-3 text-[#1B7E98] shrink-0" />
                    <span class="truncate">{{ uploadedImageName || getFilenameFromUrl(form.imageUrl) || "logo_akm.jpg" }}</span>
                  </div>
                </div>

                <!-- Dynamic Packaging Rows (Mobile Responsive Grid) -->
                <div class="md:col-span-8 space-y-2.5 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]"> Pilihan Kemasan </label>
                    <button type="button" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#ADDFF1] text-[11.5px] font-manrope font-bold text-[#1B7E98] hover:bg-[#E9F8FF] cursor-pointer shrink-0" @click="addPackagingRow">
                      <Plus class="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  </div>

                  <div v-for="(pack, i) in form.packaging" :key="i" class="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-md bg-white">
                    <div class="sm:col-span-3 min-w-0 space-y-0.5">
                      <span class="block sm:hidden text-[10px] font-bold uppercase text-[#486581]">Ukuran (Angka)</span>
                      <input :value="pack.size" type="text" inputmode="numeric" placeholder="Ukuran (50)" class="w-full min-w-0 px-2.5 py-1.5 rounded-sm bg-[#E9F8FF]/50 border border-slate-200/70 text-[12.5px] font-mono outline-none focus:ring-2 focus:ring-[#89CBDD]/40" @input="onNumericInput($event, (v) => (pack.size = v))" />
                    </div>
                    <div class="sm:col-span-4 min-w-0 space-y-0.5">
                      <span class="block sm:hidden text-[10px] font-bold uppercase text-[#486581]">Satuan</span>
                      <input v-model="pack.unit" type="text" placeholder="Satuan (Test/mL)" class="w-full min-w-0 px-2.5 py-1.5 rounded-sm bg-[#E9F8FF]/50 border border-slate-200/70 text-[12.5px] outline-none focus:ring-2 focus:ring-[#89CBDD]/40" />
                    </div>
                    <div class="sm:col-span-5 min-w-0 space-y-0.5">
                      <span class="block sm:hidden text-[10px] font-bold uppercase text-[#486581]">Kemasan</span>
                      <input v-model="pack.container" type="text" placeholder="Kemasan (Box/Botol)" class="w-full min-w-0 px-2.5 py-1.5 rounded-sm bg-[#E9F8FF]/50 border border-slate-200/70 text-[12.5px] outline-none focus:ring-2 focus:ring-[#89CBDD]/40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 3: Dokumen & Lembar Teknis (Upload PDF Per Baris, Tanpa Input URL Manual) -->
            <div class="bg-[#E9F8FF]/40 rounded-md p-3.5 sm:p-5 space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div class="flex items-start gap-2 min-w-0">
                  <span class="w-6 h-6 rounded-sm bg-[#89CBDD] text-[#082838] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div class="min-w-0">
                    <h3 class="font-manrope font-bold text-[14px] text-[#0D2235]">
                      Dokumen & Lembar Teknis
                      <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span>
                    </h3>
                    <p class="text-[11px] text-[#486581]">Unggah langsung file PDF (Maks. {{ MAX_DOC_MB }} MB) per baris dokumen untuk unduhan pengunjung.</p>
                  </div>
                </div>

                <!-- Single + Tambah Dokumen Button -->
                <button type="button" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] text-[12px] font-manrope font-bold cursor-pointer transition-all shadow-xs shrink-0 self-start sm:self-auto" @click="addDocRow">
                  <Plus class="w-3.5 h-3.5" />
                  <span>Tambah Dokumen</span>
                </button>
              </div>

              <!-- Documents List (Per-Row Direct PDF Upload) -->
              <div v-if="form.documents.length > 0" class="space-y-2.5 pt-1">
                <div v-for="(doc, idx) in form.documents" :key="idx" class="p-3 bg-white rounded-md space-y-2.5 shadow-2xs transition-opacity" :class="doc.isActive === false ? 'opacity-65 bg-slate-50/80' : ''">
                  <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div class="sm:col-span-6 min-w-0">
                      <label class="block text-[10.5px] font-manrope font-semibold text-[#486581] mb-1">Judul Berkas</label>
                      <input v-model="doc.title" type="text" placeholder="Contoh: SDS PBS 10X" class="w-full min-w-0 px-2.5 py-1.5 rounded-sm bg-[#F4FBFE] focus:bg-white text-[12.5px] font-medium outline-none focus:ring-[#89CBDD] transition-all" />
                    </div>

                    <div class="sm:col-span-3 min-w-0">
                      <label class="block text-[10.5px] font-manrope font-semibold text-[#486581] mb-1">Tipe Dokumen</label>
                      <SoftDropdown v-model="doc.type" :options="documentTypes" full-width />
                    </div>

                    <!-- Row Action: Hapus baris (jika baru & belum disimpan) atau Toggle Aktif/Nonaktif (jika tersimpan) -->
                    <div class="sm:col-span-3 flex items-end sm:justify-end gap-1.5 pt-1 sm:pt-4">
                      <button v-if="doc._isNew" type="button" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-manrope font-bold cursor-pointer transition-colors" title="Hapus baris dokumen yang belum disimpan" @click="removeDocRow(idx)">
                        <Trash2 class="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>

                      <template v-else>
                        <button v-if="isSuperAdmin" type="button" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-[11px] font-manrope font-bold cursor-pointer transition-colors" :class="doc.isActive !== false ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" :title="doc.isActive !== false ? 'Nonaktifkan dokumen' : 'Aktifkan dokumen'" @click="toggleDocStatus(idx)">
                          <Power class="w-3 h-3" />
                          <span>{{ doc.isActive !== false ? "Aktif" : "Nonaktif" }}</span>
                        </button>
                        <span v-else class="px-2.5 py-1 rounded-sm text-[11px] font-manrope font-bold" :class="doc.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                          {{ doc.isActive !== false ? "Aktif" : "Nonaktif" }}
                        </span>
                      </template>
                    </div>
                  </div>

                  <!-- Per-Row PDF File Uploader Control -->
                  <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                      <template v-if="uploadingDocIndex === idx">
                        <span class="inline-flex items-center gap-1.5 text-[11.5px] font-manrope font-semibold text-[#1B7E98]">
                          <Loader2 class="w-3.5 h-3.5 animate-spin" />
                          <span>Mengunggah file PDF...</span>
                        </span>
                      </template>

                      <template v-else-if="doc.fileUrl && doc.fileUrl !== '#'">
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#F4FBFE] text-[11.5px] font-mono text-[#0D253A] min-w-0 max-w-full">
                          <FileText class="w-3.5 h-3.5 text-[#1B7E98] shrink-0" />
                          <span class="truncate">{{ getDocFilename(doc) }}</span>
                          <span v-if="doc.fileSize" class="text-[10px] text-[#486581] shrink-0">({{ doc.fileSize }})</span>
                        </div>
                        <a :href="doc.fileUrl" target="_blank" rel="noopener noreferrer" class="p-1.5 rounded-sm text-[#1B7E98] hover:bg-[#E9F8FF] transition-colors shrink-0" title="Pratinjau PDF">
                          <ExternalLink class="w-3.5 h-3.5" />
                        </a>
                      </template>

                      <template v-else>
                        <span class="text-[11px] text-[#486581]"
                          >Belum ada file PDF dipilih <span class="text-red-500">*maks. {{ MAX_DOC_MB }} MB (.pdf)</span></span
                        >
                      </template>
                    </div>

                    <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[11.5px] font-manrope font-bold cursor-pointer transition-colors shrink-0" :class="[uploadingDocIndex === idx ? 'opacity-60 pointer-events-none' : '', doc.fileUrl && doc.fileUrl !== '#' ? 'bg-[#F4FBFE] hover:bg-[#E9F8FF] text-[#0D253A] ' : 'bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#082838]']">
                      <Loader2 v-if="uploadingDocIndex === idx" class="w-3.5 h-3.5 animate-spin" />
                      <Upload v-else class="w-3.5 h-3.5 text-[#1B7E98]" />
                      <span>{{ doc.fileUrl && doc.fileUrl !== "#" ? "Ganti File" : "Pilih File PDF" }}</span>
                      <input type="file" accept=".pdf,application/pdf" class="hidden" @change="handleRowDocumentUpload($event, idx)" />
                    </label>
                  </div>
                </div>
              </div>

              <div v-else class="p-5 text-center bg-white rounded-md border border-dashed border-[#ADDFF1] text-[#486581] text-[12.5px] space-y-1">
                <FileText class="w-6 h-6 mx-auto text-[#89CBDD]" />
                <p>Belum ada dokumen atau lembar teknis terlampir.</p>
                <p class="text-[11px] text-[#486581]/75">Klik "+ Tambah Dokumen" di atas lalu pilih file PDF (maks. {{ MAX_DOC_MB }} MB).</p>
              </div>
            </div>

            <!-- Section 4: Spesifikasi Teknis & Toggles -->
            <div class="bg-[#E9F8FF]/40 rounded-md p-3.5 sm:p-5 space-y-4">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-sm bg-[#89CBDD] text-[#082838] font-bold text-xs flex items-center justify-center shrink-0">4</span>
                <h3 class="font-manrope font-bold text-[14px] text-[#0D2235]">Spesifikasi Teknis & Status</h3>
              </div>

              <!-- Dynamic Spec Rows (Responsive Grid) -->
              <div class="space-y-2.5">
                <div class="flex items-center justify-between gap-2">
                  <label class="block text-[12.5px] font-manrope font-semibold text-[#0D2235]">
                    Parameter Uji Tambahan
                    <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span>
                  </label>
                  <button type="button" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#ADDFF1] text-[11.5px] font-manrope font-bold text-[#1B7E98] hover:bg-[#E9F8FF] cursor-pointer shrink-0" @click="addSpecRow">
                    <Plus class="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>

                <div v-for="(spec, i) in form.specifications" :key="i" class="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-md bg-white">
                  <div class="sm:col-span-5 min-w-0">
                    <input v-model="spec.label" type="text" placeholder="Parameter (mis: Akurasi)" class="w-full min-w-0 px-2.5 py-1.5 rounded-sm bg-[#E9F8FF]/50 border border-slate-200/70 text-[12.5px] outline-none focus:ring-2 focus:ring-[#89CBDD]/40 font-mono" />
                  </div>
                  <div class="sm:col-span-7 min-w-0">
                    <input v-model="spec.value" type="text" placeholder="Nilai (mis: 99.8%)" class="w-full min-w-0 px-2.5 py-1.5 rounded-sm bg-[#E9F8FF]/50 border border-slate-200/70 text-[12.5px] outline-none focus:ring-2 focus:ring-[#89CBDD]/40" />
                  </div>
                </div>
              </div>

              <!-- Toggles -->
              <div class="pt-3 flex flex-col sm:flex-row gap-3 sm:gap-5 border-t border-slate-200/60">
                <label class="flex items-center gap-2.5 cursor-pointer">
                  <input v-model="form.isFeatured" type="checkbox" class="w-4 h-4 rounded-sm accent-[#082838]" />
                  <span class="text-[12.5px] font-manrope font-semibold text-[#0D2235]"> Tampilkan di Produk Unggulan </span>
                </label>

                <label class="flex items-center gap-2.5 cursor-pointer">
                  <input v-model="form.isVerified" type="checkbox" class="w-4 h-4 rounded-sm accent-[#054E4C]" />
                  <span class="text-[12.5px] font-manrope font-semibold text-[#0D2235]"> Spesifikasi Terverifikasi Resmi </span>
                </label>
              </div>
            </div>
          </fieldset>
        </form>

        <!-- Modal Sticky Bottom Footer -->
        <div class="px-4 sm:px-6 py-3 bg-[#E9F8FF]/70 border-t border-[#D0F2F9] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button type="button" :disabled="isSubmitting || isUploadingImage || uploadingDocIndex !== null" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[#486581] hover:text-[#0D2235] hover:bg-white text-[12.5px] font-manrope font-semibold transition-colors cursor-pointer disabled:opacity-50" @click="handleReset">
            <RotateCcw class="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <div class="flex items-center gap-2 ml-auto">
            <button type="button" :disabled="isSubmitting" class="px-4 py-2 rounded-md bg-white hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13px] transition-colors border border-[#ADDFF1]/60 shadow-xs cursor-pointer disabled:opacity-50" @click="handleClose">Batal</button>

            <button type="submit" form="product-form-modal" :disabled="isSubmitting || isUploadingImage || uploadingDocIndex !== null" class="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13px] transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50">
              <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
              <Save v-else class="w-4 h-4" />
              <span>{{ isSubmitting ? "Menyimpan..." : isUploadingImage || uploadingDocIndex !== null ? "Mengunggah..." : "Simpan" }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
