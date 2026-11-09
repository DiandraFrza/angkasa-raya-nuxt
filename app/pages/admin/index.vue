<!-- @format -->

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import {
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Package,
  Layers,
  Inbox,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  Users,
  Plus,
  Lock,
  X,
  Bell,
  Volume2,
} from "lucide-vue-next";
import type { Product } from "~/types/catalog";
import { useCatalog } from "~/composables/useCatalog";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { useAdminAuth } from "~/composables/useAdminAuth";
import { useCafeNotification } from "~/composables/useCafeNotification";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const { settings } = useSiteSettings();
const { user, isSuperAdmin } = useAdminAuth();
const { playCafeChime, isSoundEnabled, toggleSound } = useCafeNotification();

useSeoMeta({
  title: () => `Panel Kendali Administrator — ${settings.value.company_name}`,
});

const { refreshCatalog } = useCatalog();

type AdminTab = "products" | "categories" | "inquiries" | "users";
const activeTab = ref<AdminTab>("products");

// Sync tab with query param
if (route.query.tab && ["products", "categories", "inquiries", "users"].includes(route.query.tab as string)) {
  activeTab.value = route.query.tab as AdminTab;
}

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && ["products", "categories", "inquiries", "users"].includes(newTab as string)) {
      activeTab.value = newTab as AdminTab;
    }
  }
);

const switchTab = (tab: AdminTab) => {
  activeTab.value = tab;
  router.replace({ query: { ...route.query, tab: tab === "products" ? undefined : tab } });
};

const searchQuery = ref("");
const selectedCategory = ref("all");
const isDeleting = ref(false);
const deleteError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Page Size Options
const pageSizeOptions = [10, 20, 50, 100];

// Pagination for Products
const productsPage = ref(1);
const productsPageSize = ref(10);

// Pagination for Inquiries
const inquiriesPage = ref(1);
const inquiriesPageSize = ref(10);

// Fetch products
const { data: productsData, refresh: refreshProducts } = await useFetch<Product[]>("/api/products");
// Fetch inquiries
const { data: inquiriesData, refresh: refreshInquiries } = await useFetch<any[]>("/api/inquiries");
// Fetch categories
const { data: categoriesData, refresh: refreshCategories } = await useFetch<any[]>("/api/categories");
// Fetch users (only available to Super Admin)
const { data: usersData, refresh: refreshUsers } = await useFetch<any[]>("/api/users", {
  immediate: isSuperAdmin.value,
  watch: [isSuperAdmin],
});

const products = computed(() => productsData.value || []);
const inquiries = computed(() => inquiriesData.value || []);
const categories = computed(() => categoriesData.value || []);
const usersList = computed(() => usersData.value || []);

// Filter products
const filteredProducts = computed(() => {
  let list = products.value;
  if (selectedCategory.value !== "all") {
    list = list.filter((p) => p.categorySlug === selectedCategory.value);
  }
  if (searchQuery.value && searchQuery.value.trim() !== "") {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q))
    );
  }
  return list;
});

// Reset page when filter or search changes
watch([selectedCategory, searchQuery, productsPageSize], () => {
  productsPage.value = 1;
});
watch(inquiriesPageSize, () => {
  inquiriesPage.value = 1;
});

// Products Pagination Calculations
const totalProducts = computed(() => filteredProducts.value.length);
const totalProductsPages = computed(() => Math.max(1, Math.ceil(totalProducts.value / productsPageSize.value)));
const paginatedProducts = computed(() => {
  const start = (productsPage.value - 1) * productsPageSize.value;
  return filteredProducts.value.slice(start, start + productsPageSize.value);
});
const productsStartRange = computed(() => {
  if (totalProducts.value === 0) return 0;
  return (productsPage.value - 1) * productsPageSize.value + 1;
});
const productsEndRange = computed(() => {
  return Math.min(productsPage.value * productsPageSize.value, totalProducts.value);
});

// Inquiries Pagination Calculations
const totalInquiries = computed(() => inquiries.value.length);
const totalInquiriesPages = computed(() => Math.max(1, Math.ceil(totalInquiries.value / inquiriesPageSize.value)));
const paginatedInquiries = computed(() => {
  const start = (inquiriesPage.value - 1) * inquiriesPageSize.value;
  return inquiries.value.slice(start, start + inquiriesPageSize.value);
});
const inquiriesStartRange = computed(() => {
  if (totalInquiries.value === 0) return 0;
  return (inquiriesPage.value - 1) * inquiriesPageSize.value + 1;
});
const inquiriesEndRange = computed(() => {
  return Math.min(inquiriesPage.value * inquiriesPageSize.value, totalInquiries.value);
});

// Delete Product Handler (Super Admin Only)
const handleDeleteProduct = async (id: string, name: string) => {
  if (!isSuperAdmin.value) {
    alert("Hanya Super Admin yang diizinkan untuk menghapus produk dari katalog.");
    return;
  }

  if (!confirm(`Apakah Anda yakin ingin menghapus produk "${name}" dari katalog? Tindakan ini tidak dapat dibatalkan.`)) {
    return;
  }

  isDeleting.value = true;
  deleteError.value = null;
  try {
    await $fetch(`/api/products/${id}`, { method: "DELETE" });
    successMessage.value = `Produk "${name}" berhasil dihapus dari katalog.`;
    await refreshProducts();
    await refreshCatalog();
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  } catch (err: any) {
    deleteError.value = err.data?.statusMessage || "Gagal menghapus produk.";
  } finally {
    isDeleting.value = false;
  }
};

// ------------------------------------
// Kategori Management
// ------------------------------------
const showCategoryModal = ref(false);
const newCatName = ref("");
const newCatDescription = ref("");
const newCatIsInstrument = ref(false);
const isSavingCategory = ref(false);
const categoryActionError = ref<string | null>(null);

const handleAddCategory = async () => {
  if (!newCatName.value.trim()) {
    categoryActionError.value = "Nama kategori wajib diisi.";
    return;
  }
  isSavingCategory.value = true;
  categoryActionError.value = null;
  try {
    const res = await $fetch<{ success: boolean; message: string }>("/api/categories", {
      method: "POST",
      body: {
        name: newCatName.value.trim(),
        description: newCatDescription.value.trim(),
        isInstrument: newCatIsInstrument.value,
      },
    });
    successMessage.value = res.message || "Kategori baru berhasil ditambahkan.";
    newCatName.value = "";
    newCatDescription.value = "";
    newCatIsInstrument.value = false;
    showCategoryModal.value = false;
    await refreshCategories();
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  } catch (err: any) {
    categoryActionError.value = err.data?.statusMessage || "Gagal menambahkan kategori.";
  } finally {
    isSavingCategory.value = false;
  }
};

const handleDeleteCategory = async (cat: any) => {
  if (!isSuperAdmin.value) {
    alert("Hanya Super Admin yang diizinkan untuk menghapus kategori.");
    return;
  }

  if (!confirm(`Hapus kategori "${cat.name}"? Pastikan tidak ada produk yang terkait.`)) {
    return;
  }

  deleteError.value = null;
  try {
    await $fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
    successMessage.value = `Kategori "${cat.name}" berhasil dihapus.`;
    await refreshCategories();
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  } catch (err: any) {
    deleteError.value = err.data?.statusMessage || "Gagal menghapus kategori.";
  }
};

// ------------------------------------
// User Management (Super Admin Only)
// ------------------------------------
const showUserModal = ref(false);
const newUserUsername = ref("");
const newUserName = ref("");
const newUserPassword = ref("");
const newUserRole = ref<"superadmin" | "admin">("admin");
const isSavingUser = ref(false);
const userActionError = ref<string | null>(null);

const handleCreateUser = async () => {
  if (!newUserUsername.value.trim() || !newUserName.value.trim() || !newUserPassword.value) {
    userActionError.value = "Semua kolom pengguna wajib diisi.";
    return;
  }

  if (newUserPassword.value.length < 6) {
    userActionError.value = "Kata sandi minimal 6 karakter.";
    return;
  }

  isSavingUser.value = true;
  userActionError.value = null;

  try {
    const res = await $fetch<{ success: boolean; message: string }>("/api/users", {
      method: "POST",
      body: {
        username: newUserUsername.value.trim().toLowerCase(),
        name: newUserName.value.trim(),
        password: newUserPassword.value,
        role: newUserRole.value,
      },
    });

    successMessage.value = res.message || "Pengguna admin baru berhasil ditambahkan.";
    newUserUsername.value = "";
    newUserName.value = "";
    newUserPassword.value = "";
    newUserRole.value = "admin";
    showUserModal.value = false;
    await refreshUsers();
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  } catch (err: any) {
    userActionError.value = err.data?.statusMessage || "Gagal membuat pengguna.";
  } finally {
    isSavingUser.value = false;
  }
};

const handleDeleteUser = async (u: any) => {
  if (u.id === user.value?.id) {
    alert("Anda tidak dapat menghapus akun Anda sendiri.");
    return;
  }

  if (!confirm(`Hapus akun admin @${u.username} (${u.name})? Akses masuk akan segera diblokir.`)) {
    return;
  }

  deleteError.value = null;
  try {
    await $fetch(`/api/users/${u.id}`, { method: "DELETE" });
    successMessage.value = `Akun @${u.username} berhasil dihapus.`;
    await refreshUsers();
    setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  } catch (err: any) {
    deleteError.value = err.data?.statusMessage || "Gagal menghapus pengguna.";
  }
};
</script>

<template>
  <div class="space-y-8 animate-fade-up">
    <!-- Success / Error Alert -->
    <div
      v-if="successMessage"
      class="p-4 rounded-2xl bg-[#A3EEEC]/50 text-[#054E4C] text-[14px] flex items-center justify-between font-medium shadow-xs"
    >
      <div class="flex items-center gap-2.5">
        <CheckCircle2 class="w-5 h-5 text-[#054E4C] shrink-0" />
        <span>{{ successMessage }}</span>
      </div>
      <button type="button" class="text-[#054E4C] font-bold" @click="successMessage = null">✕</button>
    </div>

    <div
      v-if="deleteError"
      class="p-4 rounded-2xl bg-red-100 text-red-800 text-[14px] flex items-center justify-between font-medium shadow-xs"
    >
      <div class="flex items-center gap-2.5">
        <AlertCircle class="w-5 h-5 text-red-600 shrink-0" />
        <span>{{ deleteError }}</span>
      </div>
      <button type="button" class="text-red-700 font-bold" @click="deleteError = null">✕</button>
    </div>

    <!-- Top Action & Overview -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 text-[11px] font-manrope font-bold uppercase tracking-wider text-[#054E4C] bg-[#A3EEEC] px-4 py-1.5 rounded-full">
          <span>Pusat Kendali Operasional</span>
          <span v-if="isSuperAdmin" class="bg-[#054E4C] text-white px-1.5 py-0.2 text-[9.5px] rounded-sm">Super Admin</span>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-manrope tracking-tight leading-tight">
          <span class="block font-black text-[#0D2235]">Pusat Kendali Produk.</span>
          <span class="block font-light text-[#486581]">Katalog Reagen & Permintaan B2B.</span>
        </h1>
        <p class="text-[14.5px] text-[#486581] font-sans max-w-2xl">
          <strong class="text-[#0D253A] font-semibold">Spesifikasi jelas. Dokumen lengkap.</strong> Kelola ketersediaan inventaris reagen diagnostik serta tindak lanjuti permintaan penawaran harga resmi dari rumah sakit dan laboratorium.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3 shrink-0">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13px] transition-colors shadow-xs cursor-pointer"
          title="Tes Bunyi Cafe Chime Notifikasi RFQ"
          @click="playCafeChime"
        >
          <Bell class="w-4 h-4 text-[#1B7E98]" />
          <span>Tes Bunyi Cafe</span>
        </button>

        <NuxtLink
          to="/products"
          target="_blank"
          class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13.5px] transition-colors shadow-xs"
        >
          <ExternalLink class="w-4 h-4 text-[#89CBDD]" />
          <span>Lihat Katalog</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/products/create"
          class="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[14px] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-xs hover:shadow-md"
        >
          <PlusCircle class="w-4 h-4 transform group-hover:rotate-90 transition-transform duration-300" />
          <span>Tambah Produk Baru</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Metrics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <!-- Card 1: Produk -->
      <div
        class="bg-white rounded-3xl p-6 space-y-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
        :class="{ 'ring-2 ring-[#89CBDD]': activeTab === 'products' }"
        @click="switchTab('products')"
      >
        <div class="flex items-center justify-between">
          <span class="text-[12px] font-manrope font-bold uppercase tracking-wider text-[#486581]">Total Produk</span>
          <div class="w-9 h-9 rounded-xl bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center">
            <Package class="w-5 h-5" />
          </div>
        </div>
        <div class="text-3xl font-manrope font-extrabold text-[#0D2235]">
          {{ products.length }}
        </div>
        <p class="text-[12px] text-[#486581]">Produk aktif dalam katalog</p>
      </div>

      <!-- Card 2: Kategori -->
      <div
        class="bg-white rounded-3xl p-6 space-y-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
        :class="{ 'ring-2 ring-[#89CBDD]': activeTab === 'categories' }"
        @click="switchTab('categories')"
      >
        <div class="flex items-center justify-between">
          <span class="text-[12px] font-manrope font-bold uppercase tracking-wider text-[#486581]">Kategori Produk</span>
          <div class="w-9 h-9 rounded-xl bg-[#ADDFF1]/30 text-[#0D253A] flex items-center justify-center">
            <Layers class="w-5 h-5" />
          </div>
        </div>
        <div class="text-3xl font-manrope font-extrabold text-[#0D2235]">{{ categories.length }}</div>
        <p class="text-[12px] text-[#1B7E98] font-semibold hover:underline">Kelola & tambah kategori &rarr;</p>
      </div>

      <!-- Card 3: RFQ -->
      <div
        class="bg-white rounded-3xl p-6 space-y-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
        :class="{ 'ring-2 ring-amber-400': activeTab === 'inquiries' }"
        @click="switchTab('inquiries')"
      >
        <div class="flex items-center justify-between">
          <span class="text-[12px] font-manrope font-bold uppercase tracking-wider text-[#486581]">Penawaran (RFQ)</span>
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-[#F2A23A] flex items-center justify-center">
            <Inbox class="w-5 h-5" />
          </div>
        </div>
        <div class="text-3xl font-manrope font-extrabold text-[#0D2235]">
          {{ inquiries.length }}
        </div>
        <p class="text-[12px] text-[#486581]">Pengadaan dari rumah sakit & lab</p>
      </div>

      <!-- Card 4: Identitas / User Management -->
      <div
        v-if="isSuperAdmin"
        class="bg-white rounded-3xl p-6 space-y-2 hover:bg-[#E9F8FF]/80 transition-all group shadow-xs hover:shadow-md cursor-pointer block"
        :class="{ 'ring-2 ring-[#A3EEEC]': activeTab === 'users' }"
        @click="switchTab('users')"
      >
        <div class="flex items-center justify-between">
          <span class="text-[12px] font-manrope font-bold uppercase tracking-wider text-[#486581]">Kelola Admin</span>
          <div class="w-9 h-9 rounded-xl bg-[#A3EEEC]/40 text-[#054E4C] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users class="w-5 h-5" />
          </div>
        </div>
        <div class="text-3xl font-manrope font-extrabold text-[#0D2235]">
          {{ usersList.length }}
        </div>
        <p class="text-[12px] text-[#1B7E98] font-bold group-hover:underline">Tambah & atur hak akses &rarr;</p>
      </div>

      <NuxtLink
        v-else
        to="/admin/settings"
        class="bg-white rounded-3xl p-6 space-y-2 hover:bg-[#E9F8FF]/80 transition-all group shadow-xs hover:shadow-md block"
      >
        <div class="flex items-center justify-between">
          <span class="text-[12px] font-manrope font-bold uppercase tracking-wider text-[#486581]">Identitas Brand</span>
          <div class="w-9 h-9 rounded-xl bg-[#A3EEEC]/40 text-[#054E4C] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Settings class="w-5 h-5" />
          </div>
        </div>
        <div class="text-[15px] font-manrope font-bold text-[#0D2235] truncate leading-tight pt-1">
          {{ settings.company_name }}
        </div>
        <p class="text-[12px] text-[#1B7E98] font-bold group-hover:underline">Lihat profil perusahaan &rarr;</p>
      </NuxtLink>
    </div>

    <!-- Navigation Tabs Bar -->
    <div class="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#D0F2F9]/60 w-fit">
      <button
        type="button"
        class="px-5 py-2.5 rounded-xl font-manrope font-bold text-[13.5px] transition-all cursor-pointer flex items-center gap-2"
        :class="activeTab === 'products' ? 'bg-white text-[#082838] shadow-xs' : 'text-[#486581] hover:text-[#082838]'"
        @click="switchTab('products')"
      >
        <Package class="w-4 h-4" />
        <span>Daftar Produk ({{ products.length }})</span>
      </button>

      <button
        type="button"
        class="px-5 py-2.5 rounded-xl font-manrope font-bold text-[13.5px] transition-all cursor-pointer flex items-center gap-2"
        :class="activeTab === 'categories' ? 'bg-white text-[#082838] shadow-xs' : 'text-[#486581] hover:text-[#082838]'"
        @click="switchTab('categories')"
      >
        <Layers class="w-4 h-4" />
        <span>Kategori Produk ({{ categories.length }})</span>
      </button>

      <button
        type="button"
        class="px-5 py-2.5 rounded-xl font-manrope font-bold text-[13.5px] transition-all cursor-pointer flex items-center gap-2"
        :class="activeTab === 'inquiries' ? 'bg-white text-[#082838] shadow-xs' : 'text-[#486581] hover:text-[#082838]'"
        @click="switchTab('inquiries')"
      >
        <Inbox class="w-4 h-4" />
        <span>Permintaan Penawaran (RFQ)</span>
        <span v-if="inquiries.length > 0" class="px-2 py-0.5 rounded-full bg-[#89CBDD] text-[#082838] text-[11px] font-bold">
          {{ inquiries.length }}
        </span>
      </button>

      <button
        v-if="isSuperAdmin"
        type="button"
        class="px-5 py-2.5 rounded-xl font-manrope font-bold text-[13.5px] transition-all cursor-pointer flex items-center gap-2"
        :class="activeTab === 'users' ? 'bg-white text-[#082838] shadow-xs' : 'text-[#486581] hover:text-[#082838]'"
        @click="switchTab('users')"
      >
        <Users class="w-4 h-4 text-[#1B7E98]" />
        <span>Kelola Admin ({{ usersList.length }})</span>
        <span class="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#A3EEEC] text-[#054E4C]">Super</span>
      </button>
    </div>

    <!-- ============================================== -->
    <!-- TAB 1: DAFTAR PRODUK                          -->
    <!-- ============================================== -->
    <div v-if="activeTab === 'products'" class="space-y-4">
      <!-- Search, Filter & Per Page Controls -->
      <div class="bg-white rounded-3xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <Search class="w-4 h-4 text-[#89CBDD] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama produk, SKU, brand..."
            class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#E9F8FF]/80 text-[13.5px] text-[#0D2235] placeholder-[#486581]/70 focus:bg-white focus:ring-2 focus:ring-[#89CBDD]/40 outline-none transition-all font-sans"
          />
        </div>

        <!-- Category Filter Pills (Dynamically loaded from categories) -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            type="button"
            class="px-4 py-2 rounded-2xl text-[12.5px] font-manrope font-bold whitespace-nowrap transition-all cursor-pointer"
            :class="selectedCategory === 'all' ? 'bg-[#89CBDD] text-[#082838]' : 'bg-[#E9F8FF] text-[#486581] hover:bg-[#D0F2F9]'"
            @click="selectedCategory = 'all'"
          >
            Semua ({{ products.length }})
          </button>
          <button
            v-for="cat in categories"
            :key="cat.slug"
            type="button"
            class="px-4 py-2 rounded-2xl text-[12.5px] font-manrope font-bold whitespace-nowrap transition-all cursor-pointer"
            :class="selectedCategory === cat.slug ? 'bg-[#89CBDD] text-[#082838]' : 'bg-[#E9F8FF] text-[#486581] hover:bg-[#D0F2F9]'"
            @click="selectedCategory = cat.slug"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Table Container -->
      <div class="bg-white rounded-3xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-[13.5px]">
            <thead class="bg-[#D0F2F9]/70 text-[#0D253A] text-[12px] font-manrope font-bold uppercase tracking-wider">
              <tr>
                <th class="py-4 px-6">Produk</th>
                <th class="py-4 px-4">Kategori</th>
                <th class="py-4 px-4">Kemasan & Mutu</th>
                <th class="py-4 px-4">Status</th>
                <th class="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#D0F2F9]/40">
              <tr
                v-for="(p, idx) in paginatedProducts"
                :key="p.id"
                class="transition-colors"
                :class="idx % 2 === 0 ? 'bg-white hover:bg-[#E9F8FF]/50' : 'bg-[#E9F8FF]/20 hover:bg-[#E9F8FF]/50'"
              >
                <!-- Thumbnail & Name -->
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3.5">
                    <div class="w-12 h-12 rounded-2xl bg-[#E9F8FF] p-1 flex items-center justify-center shrink-0 overflow-hidden border border-[#ADDFF1]/40">
                      <img :src="p.imageUrl" :alt="p.name" class="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div class="font-manrope font-bold text-[#0D2235] hover:text-[#1B7E98]">
                        {{ p.name }}
                      </div>
                      <div class="text-[12px] text-[#486581] font-mono">{{ p.sku }} &bull; {{ p.brand }}</div>
                    </div>
                  </div>
                </td>

                <!-- Category -->
                <td class="py-4 px-4">
                  <span class="inline-block px-3 py-1 rounded-full text-[11.5px] font-manrope font-bold bg-[#ADDFF1]/40 text-[#082838]">
                    {{ p.categoryName }}
                  </span>
                </td>

                <!-- Packaging & Grade -->
                <td class="py-4 px-4 text-[#486581]">
                  <div v-if="p.packaging && p.packaging[0]" class="font-medium text-[#0D2235]">
                    {{ p.packaging[0].size }} {{ p.packaging[0].unit }}
                  </div>
                  <div class="text-[11.5px] text-[#486581]">
                    {{ p.grade || "-" }}
                  </div>
                </td>

                <!-- Status Tags -->
                <td class="py-4 px-4">
                  <div class="flex flex-col gap-1 items-start">
                    <span v-if="p.isFeatured" class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10.5px] font-manrope font-bold">
                      ★ Unggulan
                    </span>
                    <span v-if="p.isVerified" class="px-2.5 py-0.5 rounded-full bg-[#A3EEEC]/50 text-[#054E4C] text-[10.5px] font-manrope font-bold">
                      Terverifikasi
                    </span>
                  </div>
                </td>

                <!-- Actions -->
                <td class="py-4 px-6 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <NuxtLink :to="`/products/${p.slug}`" target="_blank" class="p-2 rounded-xl text-[#486581] hover:text-[#0D2235] hover:bg-[#D0F2F9] transition-colors" title="Lihat di Website Publik">
                      <ExternalLink class="w-4 h-4 text-[#89CBDD]" />
                    </NuxtLink>

                    <NuxtLink :to="`/admin/products/${p.id}`" class="p-2 rounded-xl text-[#0D253A] hover:bg-[#D0F2F9] transition-colors" title="Edit Produk">
                      <Edit3 class="w-4 h-4 text-[#082838]" />
                    </NuxtLink>

                    <!-- Delete Button: Only active for Super Admin -->
                    <button
                      v-if="isSuperAdmin"
                      type="button"
                      class="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus Produk (Super Admin)"
                      @click="handleDeleteProduct(p.id, p.name)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                    <span
                      v-else
                      class="p-2 text-gray-300 cursor-not-allowed"
                      title="Hapus produk dibatasi hanya untuk Super Admin"
                    >
                      <Trash2 class="w-4 h-4" />
                    </span>
                  </div>
                </td>
              </tr>

              <tr v-if="paginatedProducts.length === 0">
                <td colspan="5" class="py-12 text-center text-[#486581]">
                  Tidak ada produk yang cocok dengan pencarian atau filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAGINATION CONTROLS BAR -->
        <div class="p-4 sm:p-5 bg-white border-t border-[#D0F2F9]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] font-sans">
          <div class="flex items-center gap-2">
            <span class="text-[#486581] font-medium">Tampilkan:</span>
            <div class="flex items-center gap-1 bg-[#E9F8FF] p-1 rounded-xl">
              <button
                v-for="size in pageSizeOptions"
                :key="size"
                type="button"
                class="px-2.5 py-1 rounded-lg font-manrope font-bold text-[12px] transition-all cursor-pointer"
                :class="productsPageSize === size ? 'bg-[#89CBDD] text-[#082838]' : 'text-[#486581] hover:text-[#082838]'"
                @click="productsPageSize = size"
              >
                {{ size }}
              </button>
            </div>
            <span class="text-[#486581] hidden sm:inline">data per halaman</span>
          </div>

          <div class="text-[#486581] font-medium">
            Menampilkan <strong class="text-[#0D2235]">{{ productsStartRange }}–{{ productsEndRange }}</strong> dari <strong class="text-[#0D2235]">{{ totalProducts }}</strong> produk
          </div>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="p-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              :disabled="productsPage <= 1"
              title="Halaman Sebelumnya"
              @click="productsPage--"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>

            <div class="px-3.5 py-1.5 rounded-xl bg-[#D0F2F9]/70 text-[#082838] font-manrope font-bold text-[12.5px]">
              Hal {{ productsPage }} / {{ totalProductsPages }}
            </div>

            <button
              type="button"
              class="p-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              :disabled="productsPage >= totalProductsPages"
              title="Halaman Selanjutnya"
              @click="productsPage++"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- TAB 2: KATEGORI PRODUK                        -->
    <!-- ============================================== -->
    <div v-if="activeTab === 'categories'" class="space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-manrope font-bold text-lg text-[#0D2235]">Daftar Kategori Produk</h3>
          <p class="text-[13px] text-[#486581]">Kelola klasifikasi produk reagen dan instrumen diagnostik.</p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13px] transition-all cursor-pointer shadow-xs"
          @click="showCategoryModal = true"
        >
          <Plus class="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="cat in categories"
          :key="cat.slug"
          class="bg-white rounded-3xl p-5 border border-[#D0F2F9]/80 shadow-xs flex flex-col justify-between space-y-3"
        >
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span
                class="text-[10.5px] font-manrope font-extrabold uppercase px-2.5 py-0.5 rounded-full"
                :class="cat.isInstrument ? 'bg-[#ADDFF1]/40 text-[#082838]' : 'bg-[#A3EEEC]/50 text-[#054E4C]'"
              >
                {{ cat.isInstrument ? 'Alat / Instrumen' : 'Reagen & Bahan' }}
              </span>
              <span class="text-[11px] font-mono text-[#486581]">{{ cat.slug }}</span>
            </div>

            <h4 class="font-manrope font-bold text-[16px] text-[#0D2235]">
              {{ cat.name }}
            </h4>
            <p class="text-[12.5px] text-[#486581] leading-relaxed">
              {{ cat.description || "Tidak ada deskripsi tambahan." }}
            </p>
          </div>

          <div class="pt-3 border-t border-[#D0F2F9]/40 flex items-center justify-between text-[12px]">
            <span class="text-[#486581]">
              {{ products.filter(p => p.categorySlug === cat.slug).length }} produk aktif
            </span>

            <button
              v-if="isSuperAdmin"
              type="button"
              class="text-red-600 hover:text-red-800 font-manrope font-bold text-[12px] flex items-center gap-1 cursor-pointer"
              title="Hapus Kategori (Super Admin)"
              @click="handleDeleteCategory(cat)"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- TAB 3: PERMINTAAN PENAWARAN (RFQ)             -->
    <!-- ============================================== -->
    <div v-if="activeTab === 'inquiries'" class="space-y-4">
      <div class="bg-white rounded-3xl overflow-hidden shadow-xs">
        <div class="p-5 bg-[#D0F2F9]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="font-manrope font-bold text-[15px] text-[#0D2235]">Daftar Permintaan Penawaran Harga Masuk (RFQ)</h3>
            <span class="text-[12px] text-[#486581]">Total: {{ inquiries.length }} permintaan penawaran</span>
          </div>

          <!-- Cafe Chime Sound Preview Button -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#E9F8FF] text-[#082838] font-manrope font-bold text-[12px] transition-all shadow-xs cursor-pointer border border-[#ADDFF1]/60"
              @click="playCafeChime"
            >
              <Bell class="w-3.5 h-3.5 text-[#1B7E98]" />
              <span>Bunyikan Chime Cafe</span>
            </button>
          </div>
        </div>

        <div v-if="paginatedInquiries.length > 0" class="divide-y divide-[#D0F2F9]/40">
          <div
            v-for="(inq, i) in paginatedInquiries"
            :key="inq.id"
            class="p-6 transition-colors"
            :class="i % 2 === 0 ? 'bg-white' : 'bg-[#E9F8FF]/30'"
          >
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div class="space-y-2">
                <div class="flex items-center gap-3">
                  <span class="font-manrope font-bold text-[16px] text-[#0D2235]">
                    {{ inq.fullName }}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full bg-[#E9F8FF] text-[#082838] text-[11px] font-bold">
                    {{ inq.id }}
                  </span>
                </div>

                <div class="text-[13px] text-[#486581] space-y-1">
                  <div><strong>Instansi / Lab:</strong> {{ inq.companyOrInstitution }}</div>
                  <div><strong>Email:</strong> {{ inq.workEmail }} &bull; <strong>Telp:</strong> {{ inq.phoneNumber || "-" }}</div>
                  <div v-if="inq.productName">
                    <strong>Produk Diminati:</strong> <span class="text-[#0D253A] font-semibold">{{ inq.productName }}</span>
                    <span v-if="inq.estimatedQuantity"> (Est: {{ inq.estimatedQuantity }})</span>
                  </div>
                </div>

                <div class="mt-3 p-3 rounded-2xl bg-[#E9F8FF]/60 text-[13.5px] text-[#0D2235] font-sans">
                  "{{ inq.message }}"
                </div>
              </div>

              <!-- Quick Action -->
              <div class="flex flex-col items-end gap-2 shrink-0">
                <span class="text-[11.5px] text-[#486581]">
                  {{ new Date(inq.createdAt).toLocaleString("id-ID") }}
                </span>
                <a
                  v-if="inq.phoneNumber"
                  :href="`https://wa.me/${inq.phoneNumber.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(inq.fullName)},%20kami%20dari%20Angkasa%20Raya%20Medika%20terkait%20permintaan%20penawaran%20harga%20Anda.`"
                  target="_blank"
                  class="group inline-flex items-center gap-2 px-4.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] text-[12.5px] font-manrope font-bold transition-all shadow-xs"
                >
                  <MessageSquare class="w-3.5 h-3.5 text-[#082838]" />
                  <span>Respon via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="p-12 text-center text-[#486581]">
          Belum ada permintaan penawaran masuk dari form website.
        </div>

        <!-- Inquiries Pagination Footer -->
        <div v-if="inquiries.length > 0" class="p-4 sm:p-5 bg-white border-t border-[#D0F2F9]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] font-sans">
          <div class="flex items-center gap-2">
            <span class="text-[#486581] font-medium">Tampilkan:</span>
            <div class="flex items-center gap-1 bg-[#E9F8FF] p-1 rounded-xl">
              <button
                v-for="size in pageSizeOptions"
                :key="size"
                type="button"
                class="px-2.5 py-1 rounded-lg font-manrope font-bold text-[12px] transition-all cursor-pointer"
                :class="inquiriesPageSize === size ? 'bg-[#89CBDD] text-[#082838]' : 'text-[#486581] hover:text-[#082838]'"
                @click="inquiriesPageSize = size"
              >
                {{ size }}
              </button>
            </div>
          </div>

          <div class="text-[#486581] font-medium">
            Menampilkan <strong class="text-[#0D2235]">{{ inquiriesStartRange }}–{{ inquiriesEndRange }}</strong> dari <strong class="text-[#0D2235]">{{ totalInquiries }}</strong> RFQ
          </div>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="p-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              :disabled="inquiriesPage <= 1"
              @click="inquiriesPage--"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>

            <div class="px-3.5 py-1.5 rounded-xl bg-[#D0F2F9]/70 text-[#082838] font-manrope font-bold text-[12.5px]">
              Hal {{ inquiriesPage }} / {{ totalInquiriesPages }}
            </div>

            <button
              type="button"
              class="p-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              :disabled="inquiriesPage >= totalInquiriesPages"
              @click="inquiriesPage++"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- TAB 4: KELOLA AKUN ADMIN (SUPER ADMIN ONLY)    -->
    <!-- ============================================== -->
    <div v-if="activeTab === 'users' && isSuperAdmin" class="space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-manrope font-bold text-lg text-[#0D2235]">Manajemen Akun Administrator & Hak Akses</h3>
          <p class="text-[13px] text-[#486581]">Buat akun administrator baru serta kendalikan kewenangan akses tim.</p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13px] transition-all cursor-pointer shadow-xs"
          @click="showUserModal = true"
        >
          <Plus class="w-4 h-4" />
          <span>Tambah Akun Admin Baru</span>
        </button>
      </div>

      <div class="bg-white rounded-3xl overflow-hidden shadow-xs">
        <table class="w-full text-left text-[13.5px]">
          <thead class="bg-[#D0F2F9]/70 text-[#0D253A] text-[12px] font-manrope font-bold uppercase tracking-wider">
            <tr>
              <th class="py-4 px-6">Pengguna</th>
              <th class="py-4 px-4">Username</th>
              <th class="py-4 px-4">Peran & Hak Akses</th>
              <th class="py-4 px-4">Terdaftar</th>
              <th class="py-4 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#D0F2F9]/40">
            <tr v-for="u in usersList" :key="u.id" class="hover:bg-[#E9F8FF]/40 transition-colors">
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-2xl bg-[#E9F8FF] text-[#082838] flex items-center justify-center font-manrope font-bold text-xs uppercase border border-[#ADDFF1]/40">
                    {{ u.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="font-manrope font-bold text-[#0D2235]">{{ u.name }}</div>
                    <div v-if="u.id === user?.id" class="text-[11px] text-[#054E4C] font-semibold">(Akun Anda Saat Ini)</div>
                  </div>
                </div>
              </td>
              <td class="py-4 px-4 font-mono text-[13px] text-[#486581]">
                @{{ u.username }}
              </td>
              <td class="py-4 px-4">
                <span
                  class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-manrope font-extrabold uppercase tracking-wide"
                  :class="u.role === 'superadmin' ? 'bg-[#A3EEEC]/60 text-[#054E4C]' : 'bg-[#ADDFF1]/40 text-[#082838]'"
                >
                  <ShieldCheck v-if="u.role === 'superadmin'" class="w-3.5 h-3.5" />
                  <User v-else class="w-3.5 h-3.5" />
                  <span>{{ u.role === 'superadmin' ? 'Super Admin' : 'Admin Biasa' }}</span>
                </span>
              </td>
              <td class="py-4 px-4 text-[#486581] text-[12.5px]">
                {{ new Date(u.created_at).toLocaleDateString('id-ID') }}
              </td>
              <td class="py-4 px-6 text-right">
                <button
                  v-if="u.id !== user?.id"
                  type="button"
                  class="text-red-600 hover:text-red-800 p-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                  title="Hapus Akun Pengguna"
                  @click="handleDeleteUser(u)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- MODAL: TAMBAH KATEGORI BARU                    -->
    <!-- ============================================== -->
    <Teleport to="body">
      <div v-if="showCategoryModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-[#0D253A]/40 backdrop-blur-xs" @click="showCategoryModal = false" />
        <div class="relative bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#ADDFF1]/50 space-y-5 animate-scale-up z-10 text-[#0D2235]">
          <div class="flex items-center justify-between pb-2 border-b border-[#D0F2F9]/60">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-2xl bg-[#A3EEEC]/50 text-[#054E4C] flex items-center justify-center">
                <Layers class="w-4 h-4" />
              </div>
              <h3 class="font-manrope font-bold text-[16px]">Tambah Kategori Produk</h3>
            </div>
            <button type="button" class="p-1 rounded-xl text-[#486581] hover:text-[#0D2235]" @click="showCategoryModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div v-if="categoryActionError" class="p-3 rounded-2xl bg-red-50 text-red-800 text-[12.5px] flex items-center gap-2">
            <AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
            <span>{{ categoryActionError }}</span>
          </div>

          <div class="space-y-4">
            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-bold text-[#0D253A]">
                Nama Kategori <span class="text-red-500">*</span>
              </label>
              <input
                v-model="newCatName"
                type="text"
                placeholder="Contoh: Rapid Test Kit, Kimia Klinik, dll"
                class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[13.5px] text-[#0D2235] outline-none focus:ring-2 focus:ring-[#89CBDD]/40 border border-transparent focus:border-[#89CBDD] transition-all"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-bold text-[#0D253A]">Jenis Sediaan</label>
              <div class="grid grid-cols-2 gap-2 pt-1">
                <label
                  class="p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center gap-1"
                  :class="!newCatIsInstrument ? 'bg-[#A3EEEC]/30 border-[#054E4C] text-[#054E4C] font-bold' : 'bg-[#E9F8FF]/30 border-transparent text-[#486581]'"
                >
                  <input v-model="newCatIsInstrument" type="radio" :value="false" class="sr-only" />
                  <span class="text-[13px] font-manrope">Reagen / Bahan</span>
                  <span class="text-[10px] font-normal opacity-75">Bahan uji & konsumabel</span>
                </label>

                <label
                  class="p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center gap-1"
                  :class="newCatIsInstrument ? 'bg-[#ADDFF1]/40 border-[#082838] text-[#082838] font-bold' : 'bg-[#E9F8FF]/30 border-transparent text-[#486581]'"
                >
                  <input v-model="newCatIsInstrument" type="radio" :value="true" class="sr-only" />
                  <span class="text-[13px] font-manrope">Alat / Mesin</span>
                  <span class="text-[10px] font-normal opacity-75">Instrumen & analyzer</span>
                </label>
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-semibold text-[#0D253A]">Deskripsi Singkat (Opsional)</label>
              <textarea
                v-model="newCatDescription"
                rows="2"
                placeholder="Penjelasan fungsi lini kategori..."
                class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[13.5px] text-[#0D2235] outline-none focus:ring-2 focus:ring-[#89CBDD]/40 border border-transparent focus:border-[#89CBDD] transition-all resize-none"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              class="px-5 py-2.5 rounded-2xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13px]"
              @click="showCategoryModal = false"
            >
              Batal
            </button>
            <button
              type="button"
              :disabled="isSavingCategory"
              class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13px] transition-all shadow-xs disabled:opacity-50"
              @click="handleAddCategory"
            >
              <span>{{ isSavingCategory ? "Menyimpan..." : "Simpan Kategori" }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ============================================== -->
    <!-- MODAL: TAMBAH USER ADMIN BARU                  -->
    <!-- ============================================== -->
    <Teleport to="body">
      <div v-if="showUserModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-[#0D253A]/40 backdrop-blur-xs" @click="showUserModal = false" />
        <div class="relative bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#ADDFF1]/50 space-y-5 animate-scale-up z-10 text-[#0D2235]">
          <div class="flex items-center justify-between pb-2 border-b border-[#D0F2F9]/60">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-2xl bg-[#A3EEEC]/50 text-[#054E4C] flex items-center justify-center">
                <Users class="w-4 h-4" />
              </div>
              <h3 class="font-manrope font-bold text-[16px]">Tambah Akun Admin Baru</h3>
            </div>
            <button type="button" class="p-1 rounded-xl text-[#486581] hover:text-[#0D2235]" @click="showUserModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div v-if="userActionError" class="p-3 rounded-2xl bg-red-50 text-red-800 text-[12.5px] flex items-center gap-2">
            <AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
            <span>{{ userActionError }}</span>
          </div>

          <div class="space-y-4">
            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-bold text-[#0D253A]">
                Nama Lengkap <span class="text-red-500">*</span>
              </label>
              <input
                v-model="newUserName"
                type="text"
                placeholder="Contoh: Budi Santoso, S.Si"
                class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[13.5px] text-[#0D2235] outline-none focus:ring-2 focus:ring-[#89CBDD]/40 border border-transparent focus:border-[#89CBDD] transition-all"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-bold text-[#0D253A]">
                Username Login <span class="text-red-500">*</span>
              </label>
              <input
                v-model="newUserUsername"
                type="text"
                placeholder="Contoh: budi_arm"
                class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[13.5px] text-[#0D2235] font-mono outline-none focus:ring-2 focus:ring-[#89CBDD]/40 border border-transparent focus:border-[#89CBDD] transition-all"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-bold text-[#0D253A]">
                Kata Sandi Baru <span class="text-red-500">*</span>
              </label>
              <input
                v-model="newUserPassword"
                type="password"
                placeholder="Minimal 6 karakter"
                class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[13.5px] text-[#0D2235] outline-none focus:ring-2 focus:ring-[#89CBDD]/40 border border-transparent focus:border-[#89CBDD] transition-all"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-[13px] font-manrope font-bold text-[#0D253A]">Tingkat Hak Akses</label>
              <div class="grid grid-cols-2 gap-2 pt-1">
                <label
                  class="p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center gap-1"
                  :class="newUserRole === 'admin' ? 'bg-[#ADDFF1]/40 border-[#082838] text-[#082838] font-bold' : 'bg-[#E9F8FF]/30 border-transparent text-[#486581]'"
                >
                  <input v-model="newUserRole" type="radio" value="admin" class="sr-only" />
                  <span class="text-[13px] font-manrope flex items-center gap-1">
                    <User class="w-3.5 h-3.5" />
                    Admin Biasa
                  </span>
                  <span class="text-[10px] font-normal opacity-75">Kelola produk & lihat RFQ</span>
                </label>

                <label
                  class="p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center gap-1"
                  :class="newUserRole === 'superadmin' ? 'bg-[#A3EEEC]/40 border-[#054E4C] text-[#054E4C] font-bold' : 'bg-[#E9F8FF]/30 border-transparent text-[#486581]'"
                >
                  <input v-model="newUserRole" type="radio" value="superadmin" class="sr-only" />
                  <span class="text-[13px] font-manrope flex items-center gap-1">
                    <ShieldCheck class="w-3.5 h-3.5" />
                    Super Admin
                  </span>
                  <span class="text-[10px] font-normal opacity-75">Akses penuh & kelola user</span>
                </label>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              class="px-5 py-2.5 rounded-2xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13px]"
              @click="showUserModal = false"
            >
              Batal
            </button>
            <button
              type="button"
              :disabled="isSavingUser"
              class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13px] transition-all shadow-xs disabled:opacity-50"
              @click="handleCreateUser"
            >
              <span>{{ isSavingUser ? "Menyimpan..." : "Buat Akun" }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
