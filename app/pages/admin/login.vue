<!-- @format -->

<script setup lang="ts">
import { ref } from "vue";
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-vue-next";
import { useAdminAuth } from "~/composables/useAdminAuth";
import { useSiteSettings } from "~/composables/useSiteSettings";

definePageMeta({
  layout: false, // Independent clean login stage
});

useSeoMeta({
  title: "Login Administrator - PT Angkasa Karya Media",
});

const route = useRoute();
const router = useRouter();
const { login, isLoading } = useAdminAuth();
const { settings } = useSiteSettings();

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMessage = ref<string | null>(null);

const handleLogin = async () => {
  if (!username.value.trim() || !password.value) {
    errorMessage.value = "Username dan kata sandi wajib diisi.";
    return;
  }

  errorMessage.value = null;
  const res = await login(username.value.trim(), password.value);

  if (res.success) {
    const redirectUrl = (route.query.redirect as string) || "/admin";
    router.push(redirectUrl);
  } else {
    errorMessage.value = res.message || "Gagal masuk. Periksa kembali kredensial Anda.";
  }
};

const fillQuickCreds = (userType: "superadmin" | "admin") => {
  if (userType === "superadmin") {
    username.value = "superadmin";
    password.value = "Password123!";
  } else {
    username.value = "admin";
    password.value = "Password123!";
  }
  errorMessage.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#E9F8FF] via-white to-[#D0F2F9]/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased text-[#0D2235]">
    <div class="sm:mx-auto sm:w-full sm:max-w-md px-4">
      <!-- Back to site link -->
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-[13px] font-manrope font-semibold text-[#486581] hover:text-[#0D253A] mb-8 transition-colors">
        <ArrowLeft class="w-4 h-4 text-[#89CBDD]" />
        <span>Kembali ke Beranda Publik</span>
      </NuxtLink>

      <!-- Brand Logo & Header -->
      <div class="space-y-3 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white shadow-sm border border-[#ADDFF1]/40 p-2.5 mx-auto">
          <img :src="settings.logo_url || '/brand/logo_akm.jpg'" :alt="settings.company_name" class="w-full h-full object-contain" />
        </div>
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A3EEEC]/60 text-[#054E4C] text-[11px] font-manrope font-extrabold uppercase tracking-wider mb-2">
            <ShieldCheck class="w-3.5 h-3.5" />
            <span>Portal Akses Administrator</span>
          </span>
          <h1 class="text-2xl sm:text-3xl font-manrope font-black tracking-tight text-[#0D2235]">Masuk ke Panel Kendali</h1>
          <p class="text-[13.5px] text-[#486581] mt-1">{{ settings.company_name }} &bull; Manajemen Reagen & Pengadaan</p>
        </div>
      </div>

      <!-- Main Login Card -->
      <div class="mt-8 bg-white/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-lg rounded-3xl border border-[#D0F2F9]/80 space-y-6">
        <!-- Error Alert -->
        <div v-if="errorMessage" class="p-3.5 rounded-2xl bg-red-50 border border-red-200/70 text-red-800 text-[13px] flex items-start gap-2.5 animate-fade-in">
          <AlertCircle class="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span class="leading-relaxed">{{ errorMessage }}</span>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <!-- Username -->
          <div class="space-y-1.5">
            <label class="block text-[13px] font-manrope font-bold text-[#0D253A]"> Username Admin </label>
            <div class="relative">
              <User class="w-4 h-4 text-[#89CBDD] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input v-model="username" type="text" autocomplete="username" placeholder="Masukkan username" required class="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] placeholder-[#486581]/60 focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/50 border border-transparent focus:border-[#89CBDD] transition-all font-sans" />
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-1.5">
            <label class="block text-[13px] font-manrope font-bold text-[#0D253A]"> Kata Sandi </label>
            <div class="relative">
              <Lock class="w-4 h-4 text-[#89CBDD] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="••••••••" required class="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[14px] text-[#0D2235] placeholder-[#486581]/60 focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/50 border border-transparent focus:border-[#89CBDD] transition-all font-sans" />
              <button type="button" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#486581] hover:text-[#0D253A] cursor-pointer" @click="showPassword = !showPassword">
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <button type="submit" :disabled="isLoading" class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[14px] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-xs hover:shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
              <ShieldCheck class="w-4 h-4" />
              <span>{{ isLoading ? "Memverifikasi..." : "Masuk ke Panel" }}</span>
            </button>
          </div>
        </form>

        <!-- Quick Credentials Box for Easy Developer / Admin Access -->
        <div class="pt-4 border-t border-[#D0F2F9]/60">
          <div class="text-[11px] font-manrope font-extrabold uppercase tracking-wider text-[#486581]/70 mb-2.5 text-center">Pintasan Kredensial Cepat</div>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" class="p-2.5 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-left transition-colors cursor-pointer group" @click="fillQuickCreds('superadmin')">
              <div class="text-[11.5px] font-manrope font-bold text-[#0D253A] group-hover:text-[#1B7E98]">Super Admin</div>
              <div class="text-[10px] text-[#486581] font-mono">superadmin</div>
            </button>
            <button type="button" class="p-2.5 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-left transition-colors cursor-pointer group" @click="fillQuickCreds('admin')">
              <div class="text-[11.5px] font-manrope font-bold text-[#0D253A] group-hover:text-[#1B7E98]">Admin Biasa</div>
              <div class="text-[10px] text-[#486581] font-mono">admin</div>
            </button>
          </div>
          <p class="text-[10.5px] text-[#486581] text-center mt-2.5">Kata sandi default: <code class="font-mono bg-[#E9F8FF] px-1.5 py-0.5 rounded text-[#0D253A]">Password123!</code></p>
        </div>
      </div>
    </div>
  </div>
</template>
