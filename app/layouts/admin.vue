<!-- @format -->

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import {
  LayoutDashboard,
  Package,
  Inbox,
  PlusCircle,
  Settings,
  ExternalLink,
  Menu,
  X,
  Layers,
  ChevronRight,
  ShieldCheck,
  User,
  Users,
  LogOut,
  Bell,
  Volume2,
  VolumeX,
} from "lucide-vue-next";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { useAdminAuth } from "~/composables/useAdminAuth";
import { useCafeNotification } from "~/composables/useCafeNotification";
import CafeNotification from "~/components/admin/CafeNotification.vue";

const route = useRoute();
const router = useRouter();
const { settings } = useSiteSettings();
const { user, isSuperAdmin, logout } = useAdminAuth();
const { isSoundEnabled, toggleSound, playCafeChime, notifyNewInquiry } = useCafeNotification();

const isSidebarOpen = ref(false);
const closeSidebar = () => {
  isSidebarOpen.value = false;
};

const handleLogout = async () => {
  if (confirm("Apakah Anda yakin ingin keluar dari panel administrator?")) {
    await logout();
  }
};

const handleOpenInquiry = (inquiryId: string) => {
  router.push({ path: "/admin", query: { tab: "inquiries", focus: inquiryId } });
};

// RFQ Real-time Watcher with Cafe Shop Chime
let pollTimer: any = null;
const lastInquiryCount = ref<number | null>(null);

const checkNewInquiries = async () => {
  try {
    const res = await $fetch<any[]>("/api/inquiries");
    if (res && Array.isArray(res)) {
      if (lastInquiryCount.value !== null && res.length > lastInquiryCount.value) {
        // Find newly added inquiries
        const newInq = res[0];
        if (newInq) {
          notifyNewInquiry(newInq);
        }
      }
      lastInquiryCount.value = res.length;
    }
  } catch (err) {
    // Silent fail on polling error
  }
};

onMounted(() => {
  checkNewInquiries();
  // Poll every 12 seconds for new RFQs
  pollTimer = setInterval(checkNewInquiries, 12000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<template>
  <div class="min-h-screen bg-[#E9F8FF] text-[#0D2235] font-sans antialiased flex flex-col md:flex-row">
    <!-- MOBILE TOP BAR -->
    <header class="md:hidden bg-white px-5 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs border-b border-[#D0F2F9]/50">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-[#E9F8FF] p-1 flex items-center justify-center overflow-hidden">
          <img :src="settings.logo_url || '/brand/logo_akm.jpg'" :alt="settings.company_name" class="w-full h-full object-contain" />
        </div>
        <div>
          <span class="font-manrope font-bold text-[14px] text-[#0D2235] block leading-tight">{{ settings.company_name }}</span>
          <span class="text-[10.5px] font-manrope font-bold text-[#1B7E98] uppercase">
            {{ isSuperAdmin ? 'Super Admin' : 'Admin Biasa' }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          :title="isSoundEnabled ? 'Suara Cafe Chime Aktif' : 'Suara Nonaktif'"
          class="p-2 rounded-xl bg-[#E9F8FF] text-[#0D253A]"
          @click="toggleSound"
        >
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

    <!-- LEFT SIDEBAR -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:sticky md:top-0 shrink-0 shadow-sm border-r border-[#D0F2F9]/60"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <div class="p-6 space-y-6 overflow-y-auto">
        <!-- Brand & Identity -->
        <NuxtLink to="/admin" class="flex items-center gap-3.5 group" @click="closeSidebar">
          <div class="w-11 h-11 rounded-2xl bg-[#E9F8FF] p-1.5 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform border border-[#ADDFF1]/40">
            <img :src="settings.logo_url || '/brand/logo_akm.jpg'" :alt="`Logo ${settings.company_name}`" class="w-full h-full object-contain" />
          </div>
          <div class="min-w-0">
            <span class="font-manrope font-extrabold text-[15px] text-[#0D2235] block leading-tight truncate">
              {{ settings.company_name }}
            </span>
            <span class="text-[11px] font-manrope font-bold uppercase tracking-wider text-[#1B7E98] block mt-0.5">
              Panel Administrator
            </span>
          </div>
        </NuxtLink>

        <!-- Logged-in User Profile Badge -->
        <div class="p-3.5 rounded-2xl bg-gradient-to-r from-[#E9F8FF] to-[#D0F2F9]/50 border border-[#ADDFF1]/40 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#082838] shadow-xs shrink-0 font-manrope font-bold text-xs uppercase">
                {{ user?.name ? user.name.charAt(0) : 'A' }}
              </div>
              <div class="min-w-0">
                <div class="font-manrope font-bold text-[13px] text-[#0D2235] truncate leading-tight">
                  {{ user?.name || 'Administrator' }}
                </div>
                <div class="text-[10.5px] text-[#486581] font-mono truncate">
                  @{{ user?.username || 'admin' }}
                </div>
              </div>
            </div>

            <button
              type="button"
              class="p-1.5 rounded-xl text-[#486581] hover:text-red-600 hover:bg-white/80 transition-colors cursor-pointer shrink-0"
              title="Keluar Sesi"
              @click="handleLogout"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </div>

          <div class="flex items-center justify-between pt-1 border-t border-[#ADDFF1]/30 text-[10.5px]">
            <span class="font-manrope font-bold">Hak Akses:</span>
            <span
              v-if="isSuperAdmin"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#A3EEEC] text-[#054E4C] font-manrope font-extrabold uppercase tracking-wide"
            >
              <ShieldCheck class="w-3 h-3" />
              Super Admin
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ADDFF1]/60 text-[#082838] font-manrope font-bold uppercase tracking-wide"
            >
              <User class="w-3 h-3" />
              Admin Biasa
            </span>
          </div>
        </div>

        <!-- Navigation Section -->
        <nav class="space-y-1.5" aria-label="Navigasi Admin">
          <div class="text-[11px] font-manrope font-extrabold uppercase tracking-wider text-[#486581]/70 px-3 pt-2 pb-1">
            Menu Operasional
          </div>

          <!-- 1. Ringkasan & Katalog Produk -->
          <NuxtLink
            to="/admin"
            class="flex items-center justify-between px-3.5 py-3 rounded-2xl text-[13.5px] font-manrope font-bold transition-all cursor-pointer"
            :class="route.path === '/admin' && !route.query.tab ? 'bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] text-[#082838] shadow-xs' : 'text-[#486581] hover:text-[#082838] hover:bg-[#E9F8FF]'"
            @click="closeSidebar"
          >
            <div class="flex items-center gap-3">
              <LayoutDashboard class="w-4 h-4 shrink-0" />
              <span>Kelola Produk & RFQ</span>
            </div>
            <ChevronRight v-if="route.path === '/admin' && !route.query.tab" class="w-3.5 h-3.5 text-[#082838]" />
          </NuxtLink>

          <!-- 2. Tambah Produk Baru -->
          <NuxtLink
            to="/admin/products/create"
            class="flex items-center justify-between px-3.5 py-3 rounded-2xl text-[13.5px] font-manrope font-bold transition-all cursor-pointer"
            :class="route.path === '/admin/products/create' ? 'bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] text-[#082838] shadow-xs' : 'text-[#486581] hover:text-[#082838] hover:bg-[#E9F8FF]'"
            @click="closeSidebar"
          >
            <div class="flex items-center gap-3">
              <PlusCircle class="w-4 h-4 shrink-0" />
              <span>Tambah Produk Baru</span>
            </div>
            <ChevronRight v-if="route.path === '/admin/products/create'" class="w-3.5 h-3.5 text-[#082838]" />
          </NuxtLink>

          <!-- 3. Kategori Produk -->
          <NuxtLink
            to="/admin?tab=categories"
            class="flex items-center justify-between px-3.5 py-3 rounded-2xl text-[13.5px] font-manrope font-bold transition-all cursor-pointer"
            :class="route.query.tab === 'categories' ? 'bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] text-[#082838] shadow-xs' : 'text-[#486581] hover:text-[#082838] hover:bg-[#E9F8FF]'"
            @click="closeSidebar"
          >
            <div class="flex items-center gap-3">
              <Layers class="w-4 h-4 shrink-0" />
              <span>Kategori Produk</span>
            </div>
            <ChevronRight v-if="route.query.tab === 'categories'" class="w-3.5 h-3.5 text-[#082838]" />
          </NuxtLink>

          <!-- 4. Manajemen Akun Admin (Super Admin Only) -->
          <NuxtLink
            v-if="isSuperAdmin"
            to="/admin?tab=users"
            class="flex items-center justify-between px-3.5 py-3 rounded-2xl text-[13.5px] font-manrope font-bold transition-all cursor-pointer"
            :class="route.query.tab === 'users' ? 'bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] text-[#082838] shadow-xs' : 'text-[#486581] hover:text-[#082838] hover:bg-[#E9F8FF]'"
            @click="closeSidebar"
          >
            <div class="flex items-center gap-3">
              <Users class="w-4 h-4 shrink-0 text-[#1B7E98]" />
              <span>Kelola Akun Admin</span>
            </div>
            <span class="text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#A3EEEC] text-[#054E4C]">Full</span>
          </NuxtLink>

          <!-- 5. Pengaturan Website (Super Admin Only / High Level) -->
          <NuxtLink
            v-if="isSuperAdmin"
            to="/admin/settings"
            class="flex items-center justify-between px-3.5 py-3 rounded-2xl text-[13.5px] font-manrope font-bold transition-all cursor-pointer"
            :class="route.path === '/admin/settings' ? 'bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] text-[#082838] shadow-xs' : 'text-[#486581] hover:text-[#082838] hover:bg-[#E9F8FF]'"
            @click="closeSidebar"
          >
            <div class="flex items-center gap-3">
              <Settings class="w-4 h-4 shrink-0" />
              <span>Pengaturan Website</span>
            </div>
            <ChevronRight v-if="route.path === '/admin/settings'" class="w-3.5 h-3.5 text-[#082838]" />
          </NuxtLink>

          <div class="text-[11px] font-manrope font-extrabold uppercase tracking-wider text-[#486581]/70 px-3 pt-5 pb-1">
            Pintasan Cepat
          </div>

          <!-- Lihat Website Publik -->
          <NuxtLink
            to="/"
            target="_blank"
            class="flex items-center justify-between px-3.5 py-3 rounded-2xl text-[13.5px] font-manrope font-semibold text-[#0D253A] hover:bg-[#E9F8FF] transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <ExternalLink class="w-4 h-4 text-[#89CBDD] shrink-0" />
              <span>Lihat Website Publik</span>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/products"
            target="_blank"
            class="flex items-center justify-between px-3.5 py-3 rounded-2xl text-[13.5px] font-manrope font-semibold text-[#0D253A] hover:bg-[#E9F8FF] transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <Layers class="w-4 h-4 text-[#89CBDD] shrink-0" />
              <span>Katalog Publik</span>
            </div>
          </NuxtLink>
        </nav>
      </div>

      <!-- Sidebar Bottom: System Status & Cafe Chime Tester -->
      <div class="p-5 bg-[#E9F8FF]/70 space-y-3 rounded-t-3xl border-t border-[#D0F2F9]/60">
        <div class="flex items-center justify-between text-[11.5px] text-[#486581]">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span class="font-manrope font-bold text-[#0D253A]">Status Sistem</span>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#A3EEEC] text-[#054E4C] font-bold">Online</span>
        </div>

        <!-- Cafe Chime Sound Control -->
        <div class="flex items-center justify-between pt-1 text-[11px] text-[#486581]">
          <div class="flex items-center gap-1.5">
            <Bell class="w-3.5 h-3.5 text-[#1B7E98]" />
            <span>Notif RFQ (Cafe Chime)</span>
          </div>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="px-2 py-0.5 rounded-lg bg-white hover:bg-[#D0F2F9] text-[#082838] font-bold text-[10px] cursor-pointer shadow-2xs border border-[#ADDFF1]/60"
              title="Uji bunyi lonceng cafe"
              @click="playCafeChime"
            >
              Tes Bunyi
            </button>
            <button
              type="button"
              class="p-1 rounded-lg text-[#082838] hover:bg-white cursor-pointer"
              :title="isSoundEnabled ? 'Nonaktifkan bunyi' : 'Aktifkan bunyi'"
              @click="toggleSound"
            >
              <Volume2 v-if="isSoundEnabled" class="w-3.5 h-3.5 text-emerald-600" />
              <VolumeX v-else class="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- RIGHT MAIN CONTENT STAGE -->
    <div class="flex-1 flex flex-col min-w-0">
      <main class="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
        <slot />
        <div class="pt-8 mt-12 flex items-center justify-between text-[11.5px] font-sans text-[#486581] border-t border-[#D0F2F9]/40">
          <span>Panel Manajemen &bull; PT Angkasa Raya Medika</span>
          <span>&lt;/&gt; Craft by ❤️ AvenBytes</span>
        </div>
      </main>
    </div>

    <!-- Cafe-Style Gentle Floating Toast for New RFQs -->
    <CafeNotification @open-inquiry="handleOpenInquiry" />
  </div>
</template>
