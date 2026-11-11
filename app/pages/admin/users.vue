<!-- @format -->

<script setup lang="ts">
import { ref, computed } from "vue";
import { Plus, Power, Edit3, ShieldCheck, User, Users, AlertCircle, X, Lock, RotateCcw } from "lucide-vue-next";
import { useAdminAuth } from "~/composables/useAdminAuth";
import { useActionModal } from "~/composables/useActionModal";
import { useTablePagination } from "~/composables/useTablePagination";
import { useEscapeDismiss, useModalAutoFocus } from "~/composables/useKeyboardShortcuts";
import { isValidTextOnly, onTextOnlyInput } from "~/utils/validation";
import TableControlBar from "~/components/admin/TableControlBar.vue";
import TablePaginationFooter from "~/components/admin/TablePaginationFooter.vue";
import ActionMenuPopover, { type ActionMenuItem } from "~/components/admin/ActionMenuPopover.vue";

definePageMeta({
  layout: "admin",
});

const { user, isSuperAdmin } = useAdminAuth();
const { showSuccess, showConfirm, showAlert } = useActionModal();

useSeoMeta({
  title: () => `Kelola Akun Admin`,
});

const { data: usersData, refresh: refreshUsers } = await useFetch<any[]>("/api/users", {
  immediate: isSuperAdmin.value,
  watch: [isSuperAdmin],
});
const usersList = computed(() => usersData.value || []);

const searchQuery = ref("");

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return usersList.value;
  return usersList.value.filter(
    (u) =>
      String(u.name || "")
        .toLowerCase()
        .includes(q) ||
      String(u.username || "")
        .toLowerCase()
        .includes(q) ||
      String(u.role || "")
        .toLowerCase()
        .includes(q),
  );
});

const { pageSizeOptions, pageSize, currentPage, totalItems, totalPages, paginatedItems: paginatedUsers, startRange, endRange, goToPage, prevPage, nextPage } = useTablePagination(filteredUsers, { defaultPageSize: 10 });

interface UserDraft {
  username: string;
  name: string;
  password: string;
  role: "superadmin" | "admin";
}

const draftsCache = ref<Record<string, UserDraft>>({});
const showUserModal = ref(false);
const userModalRef = ref<HTMLElement | null>(null);
const modalMode = ref<"create" | "edit">("create");
const selectedUserId = ref("");
const selectedUserOriginal = ref<any | null>(null);
const formUsername = ref("");
const formName = ref("");
const formPassword = ref("");
const formRole = ref<"superadmin" | "admin">("admin");
const isSavingUser = ref(false);
const userActionError = ref<string | null>(null);

const activeDraftKey = computed(() => (modalMode.value === "edit" && selectedUserId.value ? `edit:${selectedUserId.value}` : "create"));

const syncDraft = () => {
  draftsCache.value[activeDraftKey.value] = {
    username: formUsername.value,
    name: formName.value,
    password: formPassword.value,
    role: formRole.value,
  };
};

const handleNameInput = (e: Event) => {
  onTextOnlyInput(e, (val) => {
    formName.value = val;
    syncDraft();
  });
};

const openCreateUserModal = () => {
  modalMode.value = "create";
  selectedUserId.value = "";
  selectedUserOriginal.value = null;
  userActionError.value = null;

  const saved = draftsCache.value.create;
  if (saved) {
    formUsername.value = saved.username;
    formName.value = saved.name;
    formPassword.value = saved.password;
    formRole.value = saved.role;
  } else {
    formUsername.value = "";
    formName.value = "";
    formPassword.value = "";
    formRole.value = "admin";
  }
  showUserModal.value = true;
};

const openEditUserModal = (u: any) => {
  modalMode.value = "edit";
  selectedUserId.value = u.id;
  selectedUserOriginal.value = u;
  userActionError.value = null;

  const key = `edit:${u.id}`;
  const saved = draftsCache.value[key];
  if (saved) {
    formUsername.value = saved.username;
    formName.value = saved.name;
    formPassword.value = saved.password;
    formRole.value = saved.role;
  } else {
    formUsername.value = u.username;
    formName.value = u.name;
    formPassword.value = "";
    formRole.value = u.role || "admin";
  }
  showUserModal.value = true;
};

const closeUserModal = () => {
  if (isSavingUser.value) return;
  syncDraft();
  showUserModal.value = false;
};

useModalAutoFocus(() => showUserModal.value, userModalRef);
useEscapeDismiss(() => showUserModal.value, closeUserModal);

const handleResetUserModal = () => {
  if (isSavingUser.value) return;
  if (modalMode.value === "edit" && selectedUserOriginal.value) {
    formUsername.value = selectedUserOriginal.value.username || "";
    formName.value = selectedUserOriginal.value.name || "";
    formPassword.value = "";
    formRole.value = selectedUserOriginal.value.role || "admin";
  } else {
    formUsername.value = "";
    formName.value = "";
    formPassword.value = "";
    formRole.value = "admin";
  }
  delete draftsCache.value[activeDraftKey.value];
  userActionError.value = null;
};

const handleSaveUser = async () => {
  if (isSavingUser.value) return;
  if (!isValidTextOnly(formName.value.trim())) {
    userActionError.value = "Nama lengkap hanya boleh berisi huruf tanpa angka.";
    return;
  }

  if (modalMode.value === "create") {
    if (!formUsername.value.trim() || !formName.value.trim() || !formPassword.value) {
      userActionError.value = "Semua kolom wajib diisi.";
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(formUsername.value.trim())) {
      userActionError.value = "Username hanya boleh berisi huruf, angka, titik, underscore, atau strip.";
      return;
    }
    if (formPassword.value.length < 6) {
      userActionError.value = "Kata sandi minimal 6 karakter.";
      return;
    }
  } else {
    if (!formName.value.trim()) {
      userActionError.value = "Nama lengkap wajib diisi.";
      return;
    }
    if (formPassword.value && formPassword.value.length < 6) {
      userActionError.value = "Kata sandi baru minimal 6 karakter.";
      return;
    }
  }

  isSavingUser.value = true;
  userActionError.value = null;

  try {
    if (modalMode.value === "edit") {
      const payload: any = {
        name: formName.value.trim(),
        role: formRole.value,
      };
      if (formPassword.value) {
        payload.password = formPassword.value;
      }

      await $fetch(`/api/users/${selectedUserId.value}`, {
        method: "PUT",
        body: payload,
      });

      delete draftsCache.value[activeDraftKey.value];
      showUserModal.value = false;
      showSuccess("Data Berhasil Diedit", `Akun @${formUsername.value} telah diperbarui.`);
    } else {
      await $fetch("/api/users", {
        method: "POST",
        body: {
          username: formUsername.value.trim().toLowerCase(),
          name: formName.value.trim(),
          password: formPassword.value,
          role: formRole.value,
        },
      });

      delete draftsCache.value.create;
      formUsername.value = "";
      formName.value = "";
      formPassword.value = "";
      formRole.value = "admin";
      showUserModal.value = false;
      showSuccess("Data Berhasil Disimpan", "Akun admin baru berhasil ditambahkan.");
    }

    await refreshUsers();
  } catch (err: any) {
    userActionError.value = err.data?.statusMessage || "Gagal menyimpan akun pengguna.";
  } finally {
    isSavingUser.value = false;
  }
};

const handleToggleUserStatus = (u: any) => {
  if (u.id === user.value?.id) {
    showAlert("Perhatian", "Anda tidak dapat menonaktifkan akun Anda sendiri.");
    return;
  }

  const nextActive = u.is_active === false || u.is_active === 0;
  const actionLabel = nextActive ? "Aktifkan" : "Nonaktifkan";

  showConfirm({
    title: `${actionLabel} Akun Admin?`,
    message: nextActive ? `Aktifkan kembali akun @${u.username} (${u.name}) agar dapat masuk ke panel admin?` : `Nonaktifkan akun @${u.username} (${u.name})? Sesi login aktif akan dihentikan sementara tanpa menghapus data.`,
    confirmText: actionLabel,
    cancelText: "Batal",
    isDanger: !nextActive,
    onConfirm: async () => {
      await $fetch(`/api/users/${u.id}`, {
        method: "PUT",
        body: { isActive: nextActive },
      });
      await refreshUsers();
      showSuccess(nextActive ? "Akun Diaktifkan" : "Akun Dinonaktifkan", `Status akun @${u.username} telah diubah.`);
    },
  });
};

const buildUserActions = (u: any): ActionMenuItem[] => {
  const items: ActionMenuItem[] = [
    {
      id: "edit",
      label: "Edit",
      icon: Edit3,
      onClick: () => openEditUserModal(u),
    },
  ];

  if (u.id !== user.value?.id) {
    const isInactive = u.is_active === false || u.is_active === 0;
    items.push({
      id: "toggle",
      label: isInactive ? "Aktifkan" : "Nonaktifkan",
      icon: Power,
      variant: isInactive ? "success" : "warning",
      onClick: () => handleToggleUserStatus(u),
    });
  }

  return items;
};
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <!-- Non Super Admin Guard -->
    <div v-if="!isSuperAdmin" class="bg-white rounded-xl p-8 text-center space-y-4 shadow-sm shadow-slate-200/50">
      <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
        <Lock class="w-6 h-6" />
      </div>
      <h2 class="text-lg font-manrope font-bold text-[#0D2235]">Akses Khusus Super Admin</h2>
      <p class="text-[#486581] text-xs sm:text-sm max-w-md mx-auto">Halaman manajemen akun dan hak akses hanya dapat dibuka oleh akun dengan level Super Administrator.</p>
      <div>
        <NuxtLink to="/admin" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#082838] font-manrope font-bold text-xs transition-colors"> Kembali </NuxtLink>
      </div>
    </div>

    <!-- Super Admin Content -->
    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="font-manrope font-extrabold text-xl sm:text-2xl text-[#0D2235]">Kelola Akun Admin</h1>
          <p class="text-xs text-[#486581] mt-0.5">Manajemen hak akses &amp; status aktif operator ({{ usersList.length }} akun)</p>
        </div>

        <button type="button" class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-xs sm:text-[13px] transition-all shadow-xs cursor-pointer" @click="openCreateUserModal">
          <Plus class="w-4 h-4" />
          <span>Tambah</span>
        </button>
      </div>

      <!-- Structured Table Card with Top Control Bar & Pagination Footer -->
      <div class="bg-white rounded-xl overflow-hidden shadow-sm shadow-slate-200/50">
        <TableControlBar v-model:page-size="pageSize" v-model:search-query="searchQuery" :page-size-options="pageSizeOptions" search-placeholder="Cari nama atau username..." />

        <div class="sm:hidden px-3.5 py-2 bg-[#F4FBFE] border-b border-slate-100 text-[11px] font-manrope font-semibold text-[#1B7E98] flex items-center justify-between">
          <span>Geser tabel ke kanan/kiri</span>
          <span>&larr; &rarr;</span>
        </div>

        <div class="overflow-x-auto touch-pan-x">
          <table class="w-full min-w-[700px] text-left text-xs border-collapse">
            <thead class="bg-[#E9F8FF] text-[#0D253A] text-[11px] font-manrope font-bold uppercase tracking-wider border-b border-slate-100">
              <tr class="divide-x divide-slate-200/60">
                <th class="py-3 px-4 whitespace-nowrap">Pengguna</th>
                <th class="py-3 px-4 whitespace-nowrap">Username</th>
                <th class="py-3 px-4 whitespace-nowrap">Akses &amp; Status</th>
                <th class="py-3 px-4 whitespace-nowrap">Terdaftar</th>
                <th class="py-3 px-4 text-right whitespace-nowrap w-[100px]">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(u, idx) in paginatedUsers" :key="u.id" class="divide-x divide-slate-100/90 transition-colors" :class="[idx % 2 === 0 ? 'bg-white hover:bg-[#E9F8FF]/60' : 'bg-[#F4FBFE] hover:bg-[#E9F8FF]', u.is_active === false || u.is_active === 0 ? 'opacity-65' : '']">
                <td class="py-3 px-4 align-middle whitespace-nowrap">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-[#E9F8FF] text-[#082838] flex items-center justify-center font-manrope font-bold text-xs uppercase shrink-0">
                      {{ u.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="font-manrope font-bold text-[#0D2235]">{{ u.name }}</div>
                      <div v-if="u.id === user?.id" class="text-[10.5px] text-[#054E4C] font-semibold">(Anda)</div>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4 align-middle font-mono text-xs text-[#486581] whitespace-nowrap">@{{ u.username }}</td>
                <td class="py-3 px-4 align-middle whitespace-nowrap">
                  <div class="flex items-center gap-1.5">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-manrope font-extrabold uppercase" :class="u.role === 'superadmin' ? 'bg-[#A3EEEC]/70 text-[#054E4C]' : 'bg-[#ADDFF1]/50 text-[#082838]'">
                      <ShieldCheck v-if="u.role === 'superadmin'" class="w-3 h-3" />
                      <User v-else class="w-3 h-3" />
                      <span>{{ u.role === "superadmin" ? "Super Admin" : "Admin Biasa" }}</span>
                    </span>
                    <span class="px-2 py-0.5 rounded-md text-[10.5px] font-manrope font-bold" :class="u.is_active === false || u.is_active === 0 ? 'bg-red-100/80 text-red-700' : 'bg-emerald-100/80 text-emerald-800'">
                      {{ u.is_active === false || u.is_active === 0 ? "Nonaktif" : "Aktif" }}
                    </span>
                  </div>
                </td>
                <td class="py-3 px-4 align-middle text-[#486581] text-xs whitespace-nowrap">
                  {{ new Date(u.created_at).toLocaleDateString("id-ID") }}
                </td>
                <td class="py-3 px-4 align-middle text-right whitespace-nowrap">
                  <ActionMenuPopover :items="buildUserActions(u)" />
                </td>
              </tr>

              <tr v-if="paginatedUsers.length === 0">
                <td colspan="5" class="py-10 text-center text-[#486581] text-xs bg-white">
                  {{ searchQuery ? "Tidak ada akun yang cocok dengan kata kunci." : "Belum ada data akun administrator." }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <TablePaginationFooter :current-page="currentPage" :total-pages="totalPages" :total-items="totalItems" :start-range="startRange" :end-range="endRange" @prev="prevPage" @next="nextPage" @go="goToPage" />
      </div>

      <!-- MODAL: TAMBAH / EDIT AKUN ADMIN (Checkbox UI + State Retention + Text-Only Validation + Keyboard UX) -->
      <Teleport to="body">
        <div v-if="showUserModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
          <div class="fixed inset-0 bg-[#0D253A]/40 backdrop-blur-xs" @click="closeUserModal" />
          <div ref="userModalRef" class="relative bg-white rounded-xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up z-10 text-[#0D2235]" @click.stop>
            <div class="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-[#A3EEEC]/50 text-[#054E4C] flex items-center justify-center">
                  <Users class="w-4 h-4" />
                </div>
                <h3 id="user-modal-title" class="font-manrope font-bold text-[15px]">
                  {{ modalMode === "edit" ? `Edit @${formUsername}` : "Tambah Akun Admin" }}
                </h3>
              </div>
              <button type="button" :disabled="isSavingUser" class="p-1.5 rounded-xl text-[#486581] hover:text-[#0D2235] hover:bg-[#E9F8FF] cursor-pointer disabled:opacity-50" title="Tutup (Esc)" @click="closeUserModal">
                <X class="w-4 h-4" />
              </button>
            </div>

            <div v-if="userActionError" class="p-3 rounded-xl bg-red-50 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
              <span>{{ userActionError }}</span>
            </div>

            <form class="space-y-4" @submit.prevent="handleSaveUser">
              <fieldset :disabled="isSavingUser" class="space-y-3.5 min-w-0">
                <!-- Username -->
                <div class="space-y-1">
                  <label class="block text-xs font-manrope font-bold text-[#0D253A]"> Username (Untuk Login) <span v-if="modalMode === 'create'" class="text-red-500">*</span> </label>
                  <input v-model="formUsername" type="text" placeholder="Contoh: admin_medika" :disabled="modalMode === 'edit'" class="w-full px-3.5 py-2 rounded-xl bg-[#F4FBFE] focus:bg-white text-[13px] text-[#0D2235] outline-none focus:ring-2 focus:ring-[#89CBDD]/50 font-mono transition-all disabled:opacity-60 disabled:cursor-not-allowed" @input="syncDraft" />
                </div>

                <!-- Nama Lengkap (Text-Only Validation) -->
                <div class="space-y-1">
                  <label class="block text-xs font-manrope font-bold text-[#0D253A]"> Nama Lengkap Admin <span class="text-red-500">*</span> </label>
                  <input :value="formName" type="text" placeholder="Contoh: Sarah Farida" class="w-full px-3.5 py-2 rounded-xl bg-[#F4FBFE] focus:bg-white text-[13px] text-[#0D2235] outline-none focus:ring-2 focus:ring-[#89CBDD]/50 transition-all" @input="handleNameInput" />
                </div>

                <!-- Password -->
                <div class="space-y-1">
                  <label class="block text-xs font-manrope font-bold text-[#0D253A]">
                    <template v-if="modalMode === 'edit'"> Kata Sandi Baru <span class="text-red-500 text-xs font-normal ml-1">*jika ada</span> </template>
                    <template v-else> Kata Sandi Masuk <span class="text-red-500">*</span> </template>
                  </label>
                  <input v-model="formPassword" type="password" :placeholder="modalMode === 'edit' ? 'Minimal 6 karakter baru' : 'Minimal 6 karakter'" class="w-full px-3.5 py-2 rounded-xl bg-[#F4FBFE] focus:bg-white text-[13px] text-[#0D2235] outline-none focus:ring-2 focus:ring-[#89CBDD]/50 transition-all" @input="syncDraft" />
                </div>

                <!-- Hak Akses (Checkbox UI, soft styling) -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-manrope font-bold text-[#0D253A]">Hak Akses</label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                    <label class="p-3 rounded-xl cursor-pointer transition-all flex items-start gap-2.5" :class="formRole === 'admin' ? 'bg-[#ADDFF1]/35 text-[#082838]' : 'bg-[#F4FBFE] text-[#486581] hover:bg-[#E9F8FF]/60'">
                      <input
                        type="checkbox"
                        :checked="formRole === 'admin'"
                        class="w-4 h-4 mt-0.5 accent-[#082838] rounded-sm shrink-0 cursor-pointer"
                        @change="
                          formRole = 'admin';
                          syncDraft();
                        "
                      />
                      <div>
                        <span class="block text-xs font-manrope font-bold">Admin Biasa</span>
                        <span class="block text-[10.5px] opacity-75">Katalog &amp; Penawaran</span>
                      </div>
                    </label>

                    <label class="p-3 rounded-xl cursor-pointer transition-all flex items-start gap-2.5" :class="formRole === 'superadmin' ? 'bg-[#A3EEEC]/30 text-[#054E4C]' : 'bg-[#F4FBFE] text-[#486581] hover:bg-[#E9F8FF]/60'">
                      <input
                        type="checkbox"
                        :checked="formRole === 'superadmin'"
                        class="w-4 h-4 mt-0.5 accent-[#054E4C] rounded-sm shrink-0 cursor-pointer"
                        @change="
                          formRole = 'superadmin';
                          syncDraft();
                        "
                      />
                      <div>
                        <span class="block text-xs font-manrope font-bold">Super Admin</span>
                        <span class="block text-[10.5px] opacity-75">Akses Penuh Sistem</span>
                      </div>
                    </label>
                  </div>
                </div>
              </fieldset>

              <div class="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button type="button" :disabled="isSavingUser" class="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-[#486581] font-manrope font-semibold text-xs cursor-pointer disabled:opacity-50" @click="handleResetUserModal">
                  <RotateCcw class="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <div class="flex items-center gap-2">
                  <button type="button" :disabled="isSavingUser" class="px-4 py-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-xs cursor-pointer disabled:opacity-50" @click="closeUserModal">Batal</button>
                  <button type="submit" :disabled="isSavingUser" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer">
                    <span>{{ isSavingUser ? "Menyimpan..." : "Simpan" }}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Teleport>
    </template>
  </div>
</template>
