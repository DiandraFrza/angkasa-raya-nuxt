<!-- @format -->

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from "vue";
import { Package, Layers, Inbox, Users, Settings, ShieldCheck, MessageSquare, Building2 } from "lucide-vue-next";
import type { Product } from "~/types/catalog";
import { useCatalog } from "~/composables/useCatalog";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { useAdminAuth } from "~/composables/useAdminAuth";

const LazyProductCreateModal = defineAsyncComponent(() => import("~/components/admin/ProductCreateModal.vue"));

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const { settings } = useSiteSettings();
const { isSuperAdmin } = useAdminAuth();
const { refreshCatalog } = useCatalog();

useSeoMeta({
  title: () => `Dashboard Administrator`,
});

if (route.query.tab) {
  const tab = route.query.tab as string;
  if (tab === "products") navigateTo("/admin/products", { replace: true });
  else if (tab === "categories") navigateTo("/admin/categories", { replace: true });
  else if (tab === "inquiries") navigateTo("/admin/inquiries", { replace: true });
  else if (tab === "users") navigateTo("/admin/users", { replace: true });
}

const { data: productsData, refresh: refreshProducts } = await useFetch<Product[]>("/api/products");
const { data: inquiriesData } = await useFetch<any[]>("/api/inquiries");
const { data: categoriesData } = await useFetch<any[]>("/api/categories");
const { data: usersData } = await useFetch<any[]>("/api/users", {
  immediate: isSuperAdmin.value,
  watch: [isSuperAdmin],
});

const products = computed(() => productsData.value || []);
const inquiries = computed(() => inquiriesData.value || []);
const categories = computed(() => categoriesData.value || []);
const usersList = computed(() => usersData.value || []);

const isProductModalOpen = ref(false);
const hasOpenedCreateModal = ref(false);
const openProductModal = () => {
  hasOpenedCreateModal.value = true;
  isProductModalOpen.value = true;
};
const closeProductModal = () => {
  isProductModalOpen.value = false;
};

const handleProductCreated = async () => {
  await refreshProducts();
  await refreshCatalog();
};

const instrumentProductsCount = computed(() => {
  return products.value.filter((p) => {
    const cat = categories.value.find((c) => c.slug === p.categorySlug);
    return cat?.isInstrument || false;
  }).length;
});
const reagentProductsCount = computed(() => Math.max(0, products.value.length - instrumentProductsCount.value));

const verifiedProductsCount = computed(() => products.value.filter((p) => p.isVerified).length);
const featuredProductsCount = computed(() => products.value.filter((p) => p.isFeatured).length);

const categoryStats = computed(() => {
  const total = products.value.length || 1;
  return categories.value.map((cat) => {
    const count = products.value.filter((p) => p.categorySlug === cat.slug).length;
    const percentage = Math.round((count / total) * 100);
    return {
      ...cat,
      count,
      percentage,
    };
  });
});
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <!-- METRICS CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <NuxtLink to="/admin/products" class="bg-white rounded-md p-5 space-y-2 shadow-xs hover:shadow-md transition-all block group border border-[#D0F2F9]/70">
        <div class="flex items-center justify-between">
          <span class="text-[11.5px] font-manrope font-bold uppercase tracking-wider text-[#486581]">Total Produk</span>
          <div class="w-9 h-9 rounded-md bg-[#89CBDD]/20 text-[#1B7E98] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Package class="w-4 h-4" />
          </div>
        </div>
        <div class="text-2xl sm:text-3xl font-manrope font-extrabold text-[#0D2235]">
          {{ products.length }}
        </div>
        <p class="text-xs text-[#1B7E98] font-semibold group-hover:underline">Buka produk &rarr;</p>
      </NuxtLink>

      <NuxtLink to="/admin/categories" class="bg-white rounded-md p-5 space-y-2 shadow-xs hover:shadow-md transition-all block group border border-[#D0F2F9]/70">
        <div class="flex items-center justify-between">
          <span class="text-[11.5px] font-manrope font-bold uppercase tracking-wider text-[#486581]">Kategori</span>
          <div class="w-9 h-9 rounded-md bg-[#ADDFF1]/30 text-[#0D253A] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Layers class="w-4 h-4" />
          </div>
        </div>
        <div class="text-2xl sm:text-3xl font-manrope font-extrabold text-[#0D2235]">
          {{ categories.length }}
        </div>
        <p class="text-xs text-[#1B7E98] font-semibold group-hover:underline">Kelola kategori &rarr;</p>
      </NuxtLink>

      <NuxtLink to="/admin/inquiries" class="bg-white rounded-md p-5 space-y-2 shadow-xs hover:shadow-md transition-all block group border border-[#D0F2F9]/70">
        <div class="flex items-center justify-between">
          <span class="text-[11.5px] font-manrope font-bold uppercase tracking-wider text-[#486581]">Penawaran</span>
          <div class="w-9 h-9 rounded-md bg-amber-500/10 text-[#F2A23A] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Inbox class="w-4 h-4" />
          </div>
        </div>
        <div class="text-2xl sm:text-3xl font-manrope font-extrabold text-[#0D2235]">
          {{ inquiries.length }}
        </div>
        <p class="text-xs text-[#1B7E98] font-semibold group-hover:underline">Tinjau RFQ &rarr;</p>
      </NuxtLink>

      <NuxtLink v-if="isSuperAdmin" to="/admin/users" class="bg-white rounded-md p-5 space-y-2 hover:bg-[#E9F8FF]/80 transition-all group shadow-xs hover:shadow-md block border border-[#D0F2F9]/70">
        <div class="flex items-center justify-between">
          <span class="text-[11.5px] font-manrope font-bold uppercase tracking-wider text-[#486581]">Akun Admin</span>
          <div class="w-9 h-9 rounded-md bg-[#A3EEEC]/40 text-[#054E4C] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users class="w-4 h-4" />
          </div>
        </div>
        <div class="text-2xl sm:text-3xl font-manrope font-extrabold text-[#0D2235]">
          {{ usersList.length }}
        </div>
        <p class="text-xs text-[#1B7E98] font-bold group-hover:underline">Kelola akses &rarr;</p>
      </NuxtLink>

      <NuxtLink v-else to="/admin/settings" class="bg-white rounded-md p-5 space-y-2 hover:bg-[#E9F8FF]/80 transition-all group shadow-xs hover:shadow-md block border border-[#D0F2F9]/70">
        <div class="flex items-center justify-between">
          <span class="text-[11.5px] font-manrope font-bold uppercase tracking-wider text-[#486581]">Identitas Brand</span>
          <div class="w-9 h-9 rounded-md bg-[#A3EEEC]/40 text-[#054E4C] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Settings class="w-4 h-4" />
          </div>
        </div>
        <div class="text-[15px] font-manrope font-bold text-[#0D2235] truncate leading-tight pt-1">
          {{ settings.company_name }}
        </div>
        <p class="text-xs text-[#1B7E98] font-bold group-hover:underline">Lihat profil &rarr;</p>
      </NuxtLink>
    </div>

    <!-- MAIN CONTENT -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-7 bg-white rounded-md overflow-hidden shadow-xs border border-[#D0F2F9]/70">
        <div class="p-4 sm:p-5 bg-gradient-to-r from-[#D0F2F9]/80 to-[#E9F8FF]/60 border-b border-[#D0F2F9] flex items-center justify-between gap-2">
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <Inbox class="w-4 h-4 text-[#1B7E98]" />
              <h3 class="font-manrope font-bold text-[15px] text-[#0D2235]">Penawaran Terbaru</h3>
            </div>
            <p class="text-xs text-[#486581]">Prospek kebutuhan reagen dan alat</p>
          </div>
          <NuxtLink to="/admin/inquiries" class="text-xs font-manrope font-bold text-[#1B7E98] hover:text-[#082838] shrink-0"> Semua ({{ inquiries.length }}) &rarr; </NuxtLink>
        </div>

        <div v-if="inquiries.length > 0" class="divide-y divide-[#D0F2F9]/40">
          <div v-for="inq in inquiries.slice(0, 4)" :key="inq.id" class="p-4 sm:p-5 hover:bg-[#E9F8FF]/30 transition-colors space-y-2">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="font-manrope font-bold text-[13.5px] text-[#0D2235] truncate">
                  {{ inq.companyOrInstitution }}
                </span>
                <span class="px-2 py-0.5 rounded-xl bg-[#E9F8FF] text-[#082838] text-[10.5px] font-mono font-bold shrink-0">
                  {{ inq.id }}
                </span>
              </div>
              <span class="text-[11px] text-[#486581] shrink-0">
                {{ new Date(inq.createdAt).toLocaleDateString("id-ID") }}
              </span>
            </div>

            <div class="text-xs text-[#486581]">
              <strong class="text-[#0D253A]">{{ inq.fullName }}</strong> &bull; {{ inq.workEmail }}
              <span v-if="inq.productName">
                &bull; Minat: <span class="font-semibold text-[#0D2235]">{{ inq.productName }}</span>
              </span>
            </div>

            <p class="text-xs text-[#0D2235] bg-[#E9F8FF]/50 p-2.5 rounded-md font-sans line-clamp-2">"{{ inq.message }}"</p>

            <div class="flex items-center justify-end gap-2 pt-1">
              <a v-if="inq.phoneNumber" :href="`https://wa.me/${inq.phoneNumber.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(inq.fullName)},%20kami%20dari%20Angkasa%20Raya%20Medika%20terkait%20permintaan%20penawaran%20harga%20Anda.`" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[11.5px] transition-all shadow-2xs">
                <MessageSquare class="w-3 h-3 text-[#082838]" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div v-else class="p-8 text-center text-[#486581] text-xs">Belum ada permintaan penawaran masuk dari form publik.</div>
      </div>

      <!-- RIGHT -->
      <div class="lg:col-span-5 space-y-5">
        <div class="bg-white rounded-md p-5 shadow-xs border border-[#D0F2F9]/70 space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-[#D0F2F9]/50">
            <div class="flex items-center gap-2">
              <Layers class="w-4 h-4 text-[#1B7E98]" />
              <h3 class="font-manrope font-bold text-[14.5px] text-[#0D2235]">Komposisi Kategori</h3>
            </div>
            <NuxtLink to="/admin/categories" class="text-xs font-manrope font-bold text-[#1B7E98] hover:underline"> Kelola &rarr; </NuxtLink>
          </div>

          <div class="space-y-3">
            <div v-for="cat in categoryStats" :key="cat.slug" class="space-y-1">
              <div class="flex items-center justify-between text-xs gap-2">
                <span class="font-manrope font-semibold text-[#0D2235] truncate">{{ cat.name }}</span>
                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="text-[10px] font-manrope font-bold uppercase px-1.5 py-0.5 rounded-xl" :class="cat.isInstrument ? 'bg-[#ADDFF1]/40 text-[#082838]' : 'bg-[#A3EEEC]/50 text-[#054E4C]'">
                    {{ cat.isInstrument ? "Alat" : "Reagen" }}
                  </span>
                  <span class="font-mono text-[#486581] font-bold">{{ cat.count }} ({{ cat.percentage }}%)</span>
                </div>
              </div>
              <div class="w-full bg-[#E9F8FF] rounded-xl h-2 overflow-hidden">
                <div class="bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] h-2 rounded-xl transition-all duration-500" :style="{ width: `${cat.percentage}%` }" />
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-[#D0F2F9]/40 flex items-center justify-between text-xs text-[#486581]">
            <span>
              Rasio: <strong class="text-[#0D253A]">{{ reagentProductsCount }} Reagen</strong> &bull; <strong class="text-[#0D253A]">{{ instrumentProductsCount }} Alat</strong>
            </span>
            <span class="font-bold text-[#1B7E98]">Total {{ products.length }}</span>
          </div>
        </div>

        <div class="bg-gradient-to-br from-white via-[#E9F8FF]/50 to-[#D0F2F9]/30 rounded-md p-5 shadow-xs border border-[#ADDFF1]/50 space-y-3.5">
          <div class="flex items-center gap-2 text-[#054E4C]">
            <ShieldCheck class="w-4 h-4 text-[#054E4C]" />
            <h4 class="font-manrope font-bold text-[14px] text-[#0D2235]">Kepatuhan & Sertifikasi</h4>
          </div>

          <div class="space-y-2 text-xs text-[#486581]">
            <div class="flex items-center justify-between py-1.5 border-b border-[#D0F2F9]/50">
              <span>Izin Edar Kemenkes RI:</span>
              <span class="font-manrope font-bold text-[#054E4C] bg-[#A3EEEC]/60 px-2 py-0.5 rounded-xl text-[11px]">Resmi AKD / AKL</span>
            </div>
            <div class="flex items-center justify-between py-1.5 border-b border-[#D0F2F9]/50">
              <span>Produk Terverifikasi:</span>
              <span class="font-manrope font-bold text-[#0D2235]">{{ verifiedProductsCount }} dari {{ products.length }}</span>
            </div>
            <div class="flex items-center justify-between py-1.5 border-b border-[#D0F2F9]/50">
              <span>Produk Unggulan:</span>
              <span class="font-manrope font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-xl text-[11px]">★ {{ featuredProductsCount }} Item</span>
            </div>
            <div class="flex items-center justify-between py-1.5">
              <span>Distribusi Prioritas:</span>
              <span class="font-medium text-[#0D2235]">Jabodetabek & Nasional</span>
            </div>
          </div>

          <div class="pt-1">
            <NuxtLink to="/admin/settings" class="w-full py-2 px-4 rounded-md bg-white hover:bg-[#D0F2F9] text-[#082838] font-manrope font-bold text-xs transition-all flex items-center justify-center gap-2 border border-[#ADDFF1]/60 shadow-2xs">
              <Settings class="w-3.5 h-3.5 text-[#1B7E98]" />
              <span>Pengaturan &rarr;</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Logistics Banner -->
    <div class="bg-white rounded-md p-5 shadow-xs border border-[#D0F2F9] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-md bg-[#E9F8FF] text-[#054E4C] flex items-center justify-center shrink-0 border border-[#ADDFF1]/50">
          <Building2 class="w-5 h-5 text-[#1B7E98]" />
        </div>
        <div>
          <h4 class="font-manrope font-bold text-sm text-[#0D2235]">Layanan Distribusi B2B - {{ settings.company_name }}</h4>
          <p class="text-xs text-[#486581]">Penyedia reagen diagnostik klinis, larutan buffer, dan instrumen laboratorium terpercaya.</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 shrink-0">
        <NuxtLink to="/admin/products" class="px-3.5 py-2 rounded-md bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#082838] font-manrope font-bold text-xs transition-colors">Semua ({{ products.length }})</NuxtLink>
        <button type="button" class="px-3.5 py-2 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-xs transition-all cursor-pointer shadow-xs" @click="openProductModal">+ Tambah Produk</button>
      </div>
    </div>

    <!-- LAZY LOADED MODAL -->
    <LazyProductCreateModal v-if="hasOpenedCreateModal" :is-open="isProductModalOpen" @close="closeProductModal" @created="handleProductCreated" />
  </div>
</template>
