<!-- @format -->

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-vue-next";
import { useAdminAuth } from "~/composables/useAdminAuth";
import { useSiteSettings } from "~/composables/useSiteSettings";

definePageMeta({
  layout: false, // Independent clean login stage
});

useSeoMeta({
  title: "Login Administrator - PT Angkasa Karya Medika",
});

const route = useRoute();
const router = useRouter();
const { login, isLoading } = useAdminAuth();
const { settings } = useSiteSettings();

const usernameInputRef = ref<HTMLInputElement | null>(null);
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMessage = ref<string | null>(null);

onMounted(() => {
  usernameInputRef.value?.focus();
});

const handleLogin = async () => {
  if (isLoading.value) return;
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
      <div class="flex items-center justify-center gap-3">
        <!-- Kotak Logo (Kiri) -->
        <div class="flex-shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-md bg-white p-2">
          <img :src="settings.logo_url || '/brand/logo_akm.jpg'" :alt="settings.company_name" class="w-full h-full object-contain" />
        </div>

        <!-- Teks Judul (Kanan) -->
        <h1 class="text-xl sm:text-2xl font-manrope font-black tracking-tight text-[#0D2235] text-left">Angkasa Karya Medika</h1>
      </div>

      <!-- Main Login Card -->
      <div class="mt-7 bg-white/90 backdrop-blur-md py-7 px-5 sm:px-8 shadow-lg rounded-md border space-y-5">
        <!-- Error Alert -->
        <div v-if="errorMessage" class="p-3 rounded-md bg-red-50 border border-red-200/70 text-red-800 text-xs flex items-start gap-2 animate-fade-in">
          <AlertCircle class="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span class="leading-relaxed">{{ errorMessage }}</span>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <fieldset :disabled="isLoading" class="space-y-4 min-w-0">
            <!-- Username -->
            <div class="space-y-1.5">
              <label class="block text-xs font-manrope font-bold text-[#0D253A]"> Username </label>
              <div class="relative">
                <User class="w-4 h-4 text-[#89CBDD] absolute left-3 top-1/2 -translate-y-1/2" />
                <input ref="usernameInputRef" v-model="username" type="text" autocomplete="username" placeholder="Masukkan username" required class="w-full pl-9 pr-3.5 py-2.5 rounded-md bg-[#E9F8FF]/50 focus:bg-white text-sm text-[#0D2235] placeholder-[#486581]/60 focus:outline-none focus:ring-1 focus:ring-[#89CBDD] border border-[#D0F2F9] focus:border-[#89CBDD] transition-all font-sans" />
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <label class="block text-xs font-manrope font-bold text-[#0D253A]"> Password </label>
              <div class="relative">
                <Lock class="w-4 h-4 text-[#89CBDD] absolute left-3 top-1/2 -translate-y-1/2" />
                <input v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="Masukkan password" required class="w-full pl-9 pr-10 py-2.5 rounded-md bg-[#E9F8FF]/50 focus:bg-white text-sm text-[#0D2235] placeholder-[#486581]/60 focus:outline-none focus:ring-1 focus:ring-[#89CBDD] border border-[#D0F2F9] focus:border-[#89CBDD] transition-all font-sans" />
                <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#486581] hover:text-[#0D253A] cursor-pointer" @click="showPassword = !showPassword">
                  <EyeOff v-if="showPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
          </fieldset>

          <!-- Submit Button -->
          <div class="pt-1">
            <button type="submit" :disabled="isLoading" class="w-full py-2.5 px-5 rounded-md bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-sm transition-all shadow-xs hover:shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
              <ShieldCheck class="w-4 h-4" />
              <span>{{ isLoading ? "Memverifikasi..." : "Masuk" }}</span>
            </button>
          </div>
        </form>

        <!-- Quick Credentials Box -->
        <div class="pt-4 border-t">
          <div class="text-[11px] font-manrope font-extrabold uppercase tracking-wider text-[#486581]/70 mb-2 text-center">Pintasan Kredensial</div>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" class="p-2.5 rounded-md bg-[#E9F8FF] hover:bg-[#D0F2F9] text-left transition-colors cursor-pointer group" @click="fillQuickCreds('superadmin')">
              <div class="text-xs font-manrope font-bold text-[#0D253A] group-hover:text-[#1B7E98]">Super Admin</div>
              <div class="text-[10.5px] text-[#486581] font-mono">superadmin</div>
            </button>
            <button type="button" class="p-2.5 rounded-md bg-[#E9F8FF] hover:bg-[#D0F2F9] text-left transition-colors cursor-pointer group" @click="fillQuickCreds('admin')">
              <div class="text-xs font-manrope font-bold text-[#0D253A] group-hover:text-[#1B7E98]">Admin Biasa</div>
              <div class="text-[10.5px] text-[#486581] font-mono">admin</div>
            </button>
          </div>
          <p class="text-[10.5px] text-[#486581] text-center mt-2">Kata sandi default: <code class="font-mono bg-[#E9F8FF] px-1.5 py-0.5 rounded-xl text-[#0D253A]">Password123!</code></p>
        </div>
      </div>
    </div>
  </div>
</template>
