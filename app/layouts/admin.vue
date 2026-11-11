<!-- @format -->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { LayoutDashboard, Package, Inbox, Settings, ExternalLink, Menu, X, Layers, ChevronLeft, ChevronRight, Users, LogOut, Volume2, VolumeX } from "lucide-vue-next";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { useAdminAuth } from "~/composables/useAdminAuth";
import { useCafeNotification } from "~/composables/useCafeNotification";
import { useActionModal } from "~/composables/useActionModal";
import CafeNotification from "~/components/admin/CafeNotification.vue";

const route = useRoute();
const router = useRouter();
const { settings } = useSiteSettings();
const { user, isSuperAdmin, logout } = useAdminAuth();
const { isSoundEnabled, toggleSound, notifyNewInquiry } = useCafeNotification();
const { showConfirm } = useActionModal();

const isSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

const toggleSidebarCollapse = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const handleLogout = () => {
  showConfirm({
    title: "Konfirmasi Keluar",
    message: "Apakah Anda yakin ingin keluar dari panel administrator?",
    confirmText: "Ya, Keluar",
    cancelText: "Batal",
    onConfirm: async () => {
      await logout();
    },
  });
};

const handleOpenInquiry = (inquiryId: string) => {
  router.push({ path: "/admin/inquiries", query: { focus: inquiryId } });
};

// RFQ Real-time Watcher with Cafe Shop Chime
let pollTimer: any = null;
const lastInquiryCount = ref<number | null>(null);

const checkNewInquiries = async () => {
  try {
    const res = await $fetch<any[]>("/api/inquiries");
    if (res && Array.isArray(res)) {
      if (lastInquiryCount.value !== null && res.length > lastInquiryCount.value) {
        const newInq = res[0];
        if (newInq) {
          notifyNewInquiry(newInq);
        }
      }
      lastInquiryCount.value = res.length;
    }
  } catch {
    // Silent fail on polling error
  }
};

onMounted(() => {
  checkNewInquiries();
  pollTimer = setInterval(checkNewInquiries, 12000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<template>
  <div class="min-h-screen bg-[#E9F8FF] text-[#0D2235] font-sans antialiased flex flex-col md:flex-row">
    <!-- MOBILE TOP BAR -->
    <header class="md:hidden bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-[#E9F8FF] p-1 flex items-center justify-center overflow-hidden shrink-0">
          <img :src="settings.logo_url || '/brand/logo_akm.jpg'" :alt="settings.company_name" class="w-full h-full object-contain" />
        </div>
        <div class="min-w-0">
          <span class="font-manrope font-bold text-[13.5px] text-[#0D2235] block leading-tight truncate">{{ settings.company_name }}</span>
          <span class="text-[10px] font-manrope font-bold text-[#1B7E98] uppercase">
            {{ isSuperAdmin ? "Super Admin" : "Admin Biasa" }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <button type="button" :title="isSoundEnabled ? 'Suara Aktif' : 'Suara Nonaktif'" class="p-2 rounded-xl bg-[#E9F8FF] text-[#0D253A] cursor-pointer" @click="toggleSound">
          <Volume2 v-if="isSoundEnabled" class="w-4 h-4 text-emerald-600" />
          <VolumeX v-else class="w-4 h-4 text-gray-400" />
        </button>
        <button type="button" class="p-2 rounded-xl bg-[#E9F8FF] text-[#0D253A] cursor-pointer" @click="isSidebarOpen = !isSidebarOpen">
          <Menu v-if="!isSidebarOpen" class="w-5 h-5" />
          <X v-else class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- MOBILE OVERLAY BACKDROP -->
    <div v-if="isSidebarOpen" class="fixed inset-0 bg-[#0D253A]/40 backdrop-blur-xs z-40 md:hidden transition-opacity" @click="closeSidebar" />

    <!-- LEFT COLLAPSIBLE SIDEBAR -->
    <aside class="fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col justify-between transition-all duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:sticky md:top-0 shrink-0 shadow-sm shadow-slate-200/60" :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0', isSidebarCollapsed ? 'md:w-20' : 'md:w-72']">
      <div class="p-4 space-y-6 overflow-y-auto overflow-x-hidden" :class="isSidebarCollapsed ? 'md:px-3' : 'sm:p-5'">
        <!-- Header Sidebar: Brand Identity + Circular Collapse Toggle -->
        <div class="flex items-center gap-2 transition-all" :class="isSidebarCollapsed ? 'md:flex-col md:items-center md:gap-2.5 justify-between' : 'justify-between'">
          <NuxtLink to="/admin" class="flex items-center gap-3 group min-w-0" @click="closeSidebar">
            <div class="w-10 h-10 rounded-xl bg-[#E9F8FF] p-1.5 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
              <img :src="settings.logo_url || '/brand/logo_akm.jpg'" :alt="`Logo ${settings.company_name}`" class="w-full h-full object-contain" />
            </div>
            <div class="min-w-0" :class="isSidebarCollapsed ? 'md:hidden' : ''">
              <span class="font-manrope font-extrabold text-[14.5px] text-[#0D2235] block leading-tight truncate">
                {{ settings.company_name }}
              </span>
              <span class="text-[10.5px] font-manrope font-bold uppercase tracking-wider text-[#1B7E98] block mt-0.5 truncate"> Panel Admin </span>
            </div>
          </NuxtLink>

          <!-- Circular Toggle Button (Desktop) -->
          <button type="button" class="hidden md:flex w-7 h-7 rounded-full bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#082838] items-center justify-center transition-all duration-200 shrink-0 cursor-pointer" :title="isSidebarCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'" :aria-label="isSidebarCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'" @click="toggleSidebarCollapse">
            <ChevronRight v-if="isSidebarCollapsed" class="w-3.5 h-3.5" />
            <ChevronLeft v-else class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Navigation Section -->
        <nav class="space-y-1.5" aria-label="Navigasi Admin">
          <div class="text-[11px] font-manrope font-extrabold uppercase tracking-wider text-[#486581]/70 px-3 pt-2 pb-1 truncate" :class="isSidebarCollapsed ? 'md:hidden' : ''">Menu Operasional</div>

          <!-- 1. Dashboard -->
          <NuxtLink to="/admin" title="Dashboard" class="flex items-center px-3 py-2.5 rounded-xl text-[13.5px] font-manrope font-bold transition-all cursor-pointer" :class="[route.path === '/admin' ? 'bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] text-[#082838] shadow-xs' : 'text-[#486581] hover:text-[#082838] hover:bg-[#E9F8FF]', isSidebarCollapsed ? 'md:justify-center md:px-0 justify-between' : 'justify-between']" @click="closeSidebar">
            <div class="flex items-center gap-3 min-w-0">
              <LayoutDashboard class="w-4 h-4 shrink-0" />
              <span :class="isSidebarCollapsed ? 'md:hidden' : ''" class="truncate">Dashboard</span>
            </div>
            <ChevronRight v-if="route.path === '/admin'" class="w-3.5 h-3.5 text-[#082838] shrink-0" :class="isSidebarCollapsed ? 'md:hidden' : ''" />
          </NuxtLink>

          <!-- 2. Daftar Produk -->
          <NuxtLink to="/admin/products" title="Produk" class="flex items-center px-3 py-2.5 rounded-xl text-[13.5px] font-manrope font-bold transition-all cursor-pointer" :class="[route.path.startsWith('/admin/products') ? 'bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] text-[#082838] shadow-xs' : 'text-[#486581] hover:text-[#082838] hover:bg-[#E9F8FF]', isSidebarCollapsed ? 'md:justify-center md:px-0 justify-between' : 'justify-between']" @click="closeSidebar">
            <div class="flex items-center gap-3 min-w-0">
              <Package class="w-4 h-4 shrink-0" />
              <span :class="isSidebarCollapsed ? 'md:hidden' : ''" class="truncate">Produk</span>
            </div>
            <ChevronRight v-if="route.path.startsWith('/admin/products')" class="w-3.5 h-3.5 text-[#082838] shrink-0" :class="isSidebarCollapsed ? 'md:hidden' : ''" />
          </NuxtLink>

          <!-- 3. Kategori Produk -->
          <NuxtLink to="/admin/categories" title="Kategori" class="flex items-center px-3 py-2.5 rounded-xl text-[13.5px] font-manrope font-bold transition-all cursor-pointer" :class="[route.path.startsWith('/admin/categories') ? 'bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] text-[#082838] shadow-xs' : 'text-[#486581] hover:text-[#082838] hover:bg-[#E9F8FF]', isSidebarCollapsed ? 'md:justify-center md:px-0 justify-between' : 'justify-between']" @click="closeSidebar">
            <div class="flex items-center gap-3 min-w-0">
              <Layers class="w-4 h-4 shrink-0" />
              <span :class="isSidebarCollapsed ? 'md:hidden' : ''" class="truncate">Kategori</span>
            </div>
            <ChevronRight v-if="route.path.startsWith('/admin/categories')" class="w-3.5 h-3.5 text-[#082838] shrink-0" :class="isSidebarCollapsed ? 'md:hidden' : ''" />
          </NuxtLink>

          <!-- 4. Permintaan Penawaran -->
          <NuxtLink to="/admin/inquiries" title="Penawaran" class="relative flex items-center px-3 py-2.5 rounded-xl text-[13.5px] font-manrope font-bold transition-all cursor-pointer" :class="[route.path.startsWith('/admin/inquiries') ? 'bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] text-[#082838] shadow-xs' : 'text-[#486581] hover:text-[#082838] hover:bg-[#E9F8FF]', isSidebarCollapsed ? 'md:justify-center md:px-0 justify-between' : 'justify-between']" @click="closeSidebar">
            <div class="flex items-center gap-3 min-w-0">
              <Inbox class="w-4 h-4 shrink-0" />
              <span :class="isSidebarCollapsed ? 'md:hidden' : ''" class="truncate">Penawaran</span>
            </div>
            <span v-if="lastInquiryCount && lastInquiryCount > 0" class="px-2 py-0.5 rounded-md bg-[#89CBDD]/40 text-[#082838] text-[11px] font-bold shrink-0" :class="isSidebarCollapsed ? 'md:hidden' : ''">
              {{ lastInquiryCount }}
            </span>
          </NuxtLink>

          <!-- 5. Kelola Akun Admin -->
          <NuxtLink v-if="isSuperAdmin" to="/admin/users" title="Akun" class="flex items-center px-3 py-2.5 rounded-xl text-[13.5px] font-manrope font-bold transition-all cursor-pointer" :class="[route.path.startsWith('/admin/users') ? 'bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] text-[#082838] shadow-xs' : 'text-[#486581] hover:text-[#082838] hover:bg-[#E9F8FF]', isSidebarCollapsed ? 'md:justify-center md:px-0 justify-between' : 'justify-between']" @click="closeSidebar">
            <div class="flex items-center gap-3 min-w-0">
              <Users class="w-4 h-4 shrink-0 text-[#1B7E98]" />
              <span :class="isSidebarCollapsed ? 'md:hidden' : ''" class="truncate">Akun</span>
            </div>
            <ChevronRight v-if="route.path.startsWith('/admin/users')" class="w-3.5 h-3.5 text-[#082838] shrink-0" :class="isSidebarCollapsed ? 'md:hidden' : ''" />
          </NuxtLink>

          <!-- 6. Pengaturan Website -->
          <NuxtLink v-if="isSuperAdmin" to="/admin/settings" title="Pengaturan" class="flex items-center px-3 py-2.5 rounded-xl text-[13.5px] font-manrope font-bold transition-all cursor-pointer" :class="[route.path.startsWith('/admin/settings') ? 'bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] text-[#082838] shadow-xs' : 'text-[#486581] hover:text-[#082838] hover:bg-[#E9F8FF]', isSidebarCollapsed ? 'md:justify-center md:px-0 justify-between' : 'justify-between']" @click="closeSidebar">
            <div class="flex items-center gap-3 min-w-0">
              <Settings class="w-4 h-4 shrink-0" />
              <span :class="isSidebarCollapsed ? 'md:hidden' : ''" class="truncate">Pengaturan</span>
            </div>
            <ChevronRight v-if="route.path.startsWith('/admin/settings')" class="w-3.5 h-3.5 text-[#082838] shrink-0" :class="isSidebarCollapsed ? 'md:hidden' : ''" />
          </NuxtLink>

          <div class="text-[11px] font-manrope font-extrabold uppercase tracking-wider text-[#486581]/70 px-3 pt-5 pb-1 truncate" :class="isSidebarCollapsed ? 'md:hidden' : ''">Pintasan Cepat</div>

          <NuxtLink to="/" target="_blank" title="Website Publik" class="flex items-center px-3 py-2.5 rounded-xl text-[13.5px] font-manrope font-semibold text-[#0D253A] hover:bg-[#E9F8FF] transition-all cursor-pointer" :class="isSidebarCollapsed ? 'md:justify-center md:px-0' : 'justify-between'">
            <div class="flex items-center gap-3 min-w-0">
              <ExternalLink class="w-4 h-4 text-[#89CBDD] shrink-0" />
              <span :class="isSidebarCollapsed ? 'md:hidden' : ''" class="truncate">Website Publik</span>
            </div>
          </NuxtLink>

          <NuxtLink to="/products" target="_blank" title="Katalog Publik" class="flex items-center px-3 py-2.5 rounded-xl text-[13.5px] font-manrope font-semibold text-[#0D253A] hover:bg-[#E9F8FF] transition-all cursor-pointer" :class="isSidebarCollapsed ? 'md:justify-center md:px-0' : 'justify-between'">
            <div class="flex items-center gap-3 min-w-0">
              <Layers class="w-4 h-4 text-[#89CBDD] shrink-0" />
              <span :class="isSidebarCollapsed ? 'md:hidden' : ''" class="truncate">Katalog Publik</span>
            </div>
          </NuxtLink>
        </nav>
      </div>

      <!-- Sidebar Bottom: User Status & Logout -->
      <div class="p-4 bg-[#E9F8FF]/70 space-y-3 rounded-t-xl" :class="isSidebarCollapsed ? 'md:px-2 md:flex md:flex-col md:items-center' : ''">
        <div class="flex items-center gap-2 text-[11.5px] text-[#486581]" :class="isSidebarCollapsed ? 'md:justify-center' : ''">
          <div class="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#082838] shadow-xs shrink-0 font-manrope font-bold text-xs uppercase" :title="user?.name || 'Administrator'">
            {{ user?.name ? user.name.charAt(0) : "A" }}
          </div>
          <div class="min-w-0" :class="isSidebarCollapsed ? 'md:hidden' : ''">
            <div class="font-manrope font-bold text-[13px] text-[#0D2235] truncate leading-tight">
              {{ user?.name || "Administrator" }}
            </div>
            <div class="text-[10.5px] text-[#486581] font-mono truncate">@{{ user?.username || "admin" }}</div>
          </div>
        </div>

        <div class="flex items-center pt-1 text-[11px] text-[#486581]" :class="isSidebarCollapsed ? 'md:justify-center' : 'justify-between'">
          <button type="button" class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[#486581] hover:text-red-600 hover:bg-white/80 transition-colors cursor-pointer" title="Keluar Sesi" @click="handleLogout">
            <LogOut class="w-4 h-4 shrink-0" />
            <span class="text-[11px] font-semibold" :class="isSidebarCollapsed ? 'md:hidden' : ''">Keluar</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- RIGHT MAIN CONTENT STAGE + PINNED BOTTOM FOOTER -->
    <div class="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300">
      <main class="flex-1 px-4 sm:px-8 lg:px-10 pt-5 sm:pt-8 lg:pt-10 pb-6 max-w-7xl w-full mx-auto">
        <slot />
      </main>

      <footer class="mt-auto px-4 sm:px-8 lg:px-10 pb-6 pt-3 max-w-7xl w-full mx-auto">
        <div class="pt-4 border-t border-[#D0F2F9]/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-sans text-[#486581]">
          <span>&copy; {{ new Date().getFullYear() }} {{ settings.company_name || "Angkasa Karya Medika" }}</span>
          <span>&lt;/&gt; Craft by ❤️ AvenBytes</span>
        </div>
      </footer>
    </div>

    <!-- Cafe-Style Gentle Floating Toast for New RFQs -->
    <CafeNotification @open-inquiry="handleOpenInquiry" />
  </div>
</template>
