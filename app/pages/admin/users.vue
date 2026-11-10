<!-- @format -->

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Plus, Trash2, ShieldCheck, User, Users, CheckCircle2, AlertCircle, X, Lock, ChevronLeft, ChevronRight } from "lucide-vue-next";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { useAdminAuth } from "~/composables/useAdminAuth";

definePageMeta({
  layout: "admin",
});

const { settings } = useSiteSettings();
const { user, isSuperAdmin } = useAdminAuth();

useSeoMeta({
  title: () => `Kelola Akun Admin`,
});

const successMessage = ref<string | null>(null);
const deleteError = ref<string | null>(null);

// Pagination State
const pageSizeOptions = [10, 20, 50, 100];
const usersPage = ref(1);
const usersPageSize = ref(10);

// Fetch users list (Only super admin)
const { data: usersData, refresh: refreshUsers } = await useFetch<any[]>("/api/users", {
  immediate: isSuperAdmin.value,
  watch: [isSuperAdmin],
});
const usersList = computed(() => usersData.value || []);

watch(usersPageSize, () => {
  usersPage.value = 1;
});

// Users Pagination Calculations
const totalUsers = computed(() => usersList.value.length);
const totalUsersPages = computed(() => Math.max(1, Math.ceil(totalUsers.value / usersPageSize.value)));
const paginatedUsers = computed(() => {
  const start = (usersPage.value - 1) * usersPageSize.value;
  return usersList.value.slice(start, start + usersPageSize.value);
});
const usersStartRange = computed(() => {
  if (totalUsers.value === 0) return 0;
  return (usersPage.value - 1) * usersPageSize.value + 1;
});
const usersEndRange = computed(() => {
  return Math.min(usersPage.value * usersPageSize.value, totalUsers.value);
});

// Modal State
const showUserModal = ref(false);
const newUserUsername = ref("");
const newUserName = ref("");
const newUserPassword = ref("");
const newUserRole = ref<"superadmin" | "admin">("admin");
const isSavingUser = ref(false);
const userActionError = ref<string | null>(null);

const openUserModal = () => {
  newUserUsername.value = "";
  newUserName.value = "";
  newUserPassword.value = "";
  newUserRole.value = "admin";
  userActionError.value = null;
  showUserModal.value = true;
};

const closeUserModal = () => {
  showUserModal.value = false;
};

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
    <!-- Non Super Admin Guard -->
    <div v-if="!isSuperAdmin" class="bg-white rounded-3xl p-10 text-center space-y-4 border border-[#D0F2F9]">
      <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
        <Lock class="w-7 h-7" />
      </div>
      <h2 class="text-xl font-manrope font-bold text-[#0D2235]">Akses Khusus Super Admin</h2>
      <p class="text-[#486581] text-[14px] max-w-md mx-auto">Halaman manajemen akun dan hak akses hanya dapat dibuka oleh akun dengan level Super Administrator.</p>
      <div>
        <NuxtLink to="/admin" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#082838] font-manrope font-bold text-[13px] transition-colors"> Kembali ke Dashboard </NuxtLink>
      </div>
    </div>

    <!-- Super Admin Content -->
    <template v-else>
      <!-- Header Page: Clean, Static & Semantic -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
        <div class="space-y-2">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-manrope tracking-tight leading-tight">
            <span class="block font-black text-[#0D2235]">Kelola Akun Admin.</span>
          </h1>
        </div>

        <!-- Top Action Buttons -->
        <div class="flex flex-wrap items-center gap-3 shrink-0 self-start sm:self-auto">
          <button type="button" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13.5px] transition-all shadow-xs hover:shadow-md cursor-pointer" @click="openUserModal">
            <Plus class="w-4 h-4" />
            <span>Tambah Akun Admin Baru</span>
          </button>
        </div>
      </div>

      <!-- Success / Error Alert -->
      <div v-if="successMessage" class="p-4 rounded-2xl bg-[#A3EEEC]/50 text-[#054E4C] text-[14px] flex items-center justify-between font-medium shadow-xs">
        <div class="flex items-center gap-2.5">
          <CheckCircle2 class="w-5 h-5 text-[#054E4C] shrink-0" />
          <span>{{ successMessage }}</span>
        </div>
        <button type="button" class="text-[#054E4C] font-bold cursor-pointer" @click="successMessage = null">✕</button>
      </div>

      <div v-if="deleteError" class="p-4 rounded-2xl bg-red-100 text-red-800 text-[14px] flex items-center justify-between font-medium shadow-xs">
        <div class="flex items-center gap-2.5">
          <AlertCircle class="w-5 h-5 text-red-600 shrink-0" />
          <span>{{ deleteError }}</span>
        </div>
        <button type="button" class="text-red-700 font-bold cursor-pointer" @click="deleteError = null">✕</button>
      </div>

      <!-- Users Table Container -->
      <div class="bg-white rounded-3xl overflow-hidden shadow-xs border border-[#D0F2F9]/70">
        <div class="overflow-x-auto">
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
              <tr v-for="u in paginatedUsers" :key="u.id" class="hover:bg-[#E9F8FF]/40 transition-colors">
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
                <td class="py-4 px-4 font-mono text-[13px] text-[#486581]">@{{ u.username }}</td>
                <td class="py-4 px-4">
                  <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-manrope font-extrabold uppercase tracking-wide" :class="u.role === 'superadmin' ? 'bg-[#A3EEEC]/60 text-[#054E4C]' : 'bg-[#ADDFF1]/40 text-[#082838]'">
                    <ShieldCheck v-if="u.role === 'superadmin'" class="w-3.5 h-3.5" />
                    <User v-else class="w-3.5 h-3.5" />
                    <span>{{ u.role === "superadmin" ? "Super Admin" : "Admin Biasa" }}</span>
                  </span>
                </td>
                <td class="py-4 px-4 text-[#486581] text-[12.5px]">
                  {{ new Date(u.created_at).toLocaleDateString("id-ID") }}
                </td>
                <td class="py-4 px-6 text-right">
                  <button v-if="u.id !== user?.id" type="button" class="text-red-600 hover:text-red-800 p-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer" title="Hapus Akun Pengguna" @click="handleDeleteUser(u)">
                    <Trash2 class="w-4 h-4" />
                  </button>
                  <span v-else class="text-xs text-[#486581]/50 italic pr-2">Aktif</span>
                </td>
              </tr>

              <tr v-if="paginatedUsers.length === 0">
                <td colspan="5" class="py-12 text-center text-[#486581]">Belum ada data akun administrator.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Users Pagination Footer -->
        <div v-if="usersList.length > 0" class="p-4 sm:p-5 bg-white border-t border-[#D0F2F9]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] font-sans">
          <div class="flex items-center gap-2">
            <span class="text-[#486581] font-medium">Tampilkan:</span>
            <div class="flex items-center gap-1 bg-[#E9F8FF] p-1 rounded-xl">
              <button v-for="size in pageSizeOptions" :key="size" type="button" class="px-2.5 py-1 rounded-lg font-manrope font-bold text-[12px] transition-all cursor-pointer" :class="usersPageSize === size ? 'bg-[#89CBDD] text-[#082838]' : 'text-[#486581] hover:text-[#082838]'" @click="usersPageSize = size">
                {{ size }}
              </button>
            </div>
            <span class="text-[#486581] hidden sm:inline">data per halaman</span>
          </div>

          <div class="text-[#486581] font-medium">
            Menampilkan <strong class="text-[#0D2235]">{{ usersStartRange }}-{{ usersEndRange }}</strong> dari <strong class="text-[#0D2235]">{{ totalUsers }}</strong> akun admin
          </div>

          <div class="flex items-center gap-1.5">
            <button type="button" class="p-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer" :disabled="usersPage <= 1" title="Halaman Sebelumnya" @click="usersPage--">
              <ChevronLeft class="w-4 h-4" />
            </button>

            <div class="px-3.5 py-1.5 rounded-xl bg-[#D0F2F9]/70 text-[#082838] font-manrope font-bold text-[12.5px]">Hal {{ usersPage }} / {{ totalUsersPages }}</div>

            <button type="button" class="p-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer" :disabled="usersPage >= totalUsersPages" title="Halaman Selanjutnya" @click="usersPage++">
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL: TAMBAH USER ADMIN BARU -->
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
              <button type="button" class="p-1 rounded-xl text-[#486581] hover:text-[#0D2235] cursor-pointer" @click="closeUserModal">
                <X class="w-4 h-4" />
              </button>
            </div>

            <div v-if="userActionError" class="p-3 rounded-2xl bg-red-50 text-red-800 text-[12.5px] flex items-center gap-2">
              <AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
              <span>{{ userActionError }}</span>
            </div>

            <div class="space-y-4">
              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-bold text-[#0D253A]"> Nama Lengkap <span class="text-red-500">*</span> </label>
                <input v-model="newUserName" type="text" placeholder="Contoh: Budi Santoso, S.Si" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[13.5px] text-[#0D2235] outline-none focus:ring-2 focus:ring-[#89CBDD]/40 border border-transparent focus:border-[#89CBDD] transition-all" />
              </div>

              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-bold text-[#0D253A]"> Username Login <span class="text-red-500">*</span> </label>
                <input v-model="newUserUsername" type="text" placeholder="Contoh: budi_arm" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[13.5px] text-[#0D2235] font-mono outline-none focus:ring-2 focus:ring-[#89CBDD]/40 border border-transparent focus:border-[#89CBDD] transition-all" />
              </div>

              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-bold text-[#0D253A]"> Kata Sandi Baru <span class="text-red-500">*</span> </label>
                <input v-model="newUserPassword" type="password" placeholder="Minimal 6 karakter" class="w-full px-4 py-2.5 rounded-2xl bg-[#E9F8FF]/50 focus:bg-white text-[13.5px] text-[#0D2235] outline-none focus:ring-2 focus:ring-[#89CBDD]/40 border border-transparent focus:border-[#89CBDD] transition-all" />
              </div>

              <div class="space-y-1">
                <label class="block text-[13px] font-manrope font-bold text-[#0D253A]">Tingkat Hak Akses</label>
                <div class="grid grid-cols-2 gap-2 pt-1">
                  <label class="p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center gap-1" :class="newUserRole === 'admin' ? 'bg-[#ADDFF1]/40 border-[#082838] text-[#082838] font-bold' : 'bg-[#E9F8FF]/30 border-transparent text-[#486581]'">
                    <input v-model="newUserRole" type="radio" value="admin" class="sr-only" />
                    <span class="text-[13px] font-manrope flex items-center gap-1">
                      <User class="w-3.5 h-3.5" />
                      Admin Biasa
                    </span>
                    <span class="text-[10px] font-normal opacity-75">Kelola produk & lihat RFQ</span>
                  </label>

                  <label class="p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center gap-1" :class="newUserRole === 'superadmin' ? 'bg-[#A3EEEC]/40 border-[#054E4C] text-[#054E4C] font-bold' : 'bg-[#E9F8FF]/30 border-transparent text-[#486581]'">
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
              <button type="button" class="px-5 py-2.5 rounded-2xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-[13px] cursor-pointer" @click="closeUserModal">Batal</button>
              <button type="button" :disabled="isSavingUser" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-[13px] transition-all shadow-xs disabled:opacity-50 cursor-pointer" @click="handleCreateUser">
                <span>{{ isSavingUser ? "Menyimpan..." : "Buat Akun" }}</span>
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </template>
  </div>
</template>
