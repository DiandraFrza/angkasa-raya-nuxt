<!-- @format -->

<script setup lang="ts">
import { ref, computed } from "vue";
import { MessageSquare, RefreshCw, Eye, X, Building2, Mail, Phone, Package } from "lucide-vue-next";
import TableControlBar from "~/components/admin/TableControlBar.vue";
import TablePaginationFooter from "~/components/admin/TablePaginationFooter.vue";
import ActionMenuPopover, { type ActionMenuItem } from "~/components/admin/ActionMenuPopover.vue";
import { useTablePagination } from "~/composables/useTablePagination";
import { useEscapeDismiss, useModalAutoFocus } from "~/composables/useKeyboardShortcuts";

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: () => `Permintaan Penawaran`,
});

const { data: inquiriesData, refresh: refreshInquiries } = await useFetch<any[]>("/api/inquiries");
const inquiries = computed(() => inquiriesData.value || []);

const searchQuery = ref("");
const isRefreshing = ref(false);
const selectedInquiry = ref<any | null>(null);
const detailModalRef = ref<HTMLElement | null>(null);

useModalAutoFocus(() => Boolean(selectedInquiry.value), detailModalRef);
useEscapeDismiss(
  () => Boolean(selectedInquiry.value),
  () => {
    selectedInquiry.value = null;
  },
);

const handleRefresh = async () => {
  isRefreshing.value = true;
  try {
    await refreshInquiries();
  } finally {
    isRefreshing.value = false;
  }
};

const filteredInquiries = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return inquiries.value;
  return inquiries.value.filter((inq: any) => {
    const haystack = [inq.id, inq.fullName, inq.companyOrInstitution, inq.workEmail, inq.phoneNumber || "", inq.productName || "", inq.estimatedQuantity || "", inq.message || ""].join(" ").toLowerCase();
    return haystack.includes(q);
  });
});

const { pageSizeOptions, pageSize, currentPage, totalItems: totalFilteredInquiries, totalPages, paginatedItems: paginatedInquiries, startRange, endRange, goToPage, prevPage, nextPage } = useTablePagination(filteredInquiries, { defaultPageSize: 10 });

const getWhatsappUrl = (inq: any) => {
  if (!inq.phoneNumber) return "";
  const sanitizedPhone = String(inq.phoneNumber).replace(/[^0-9]/g, "");
  return `https://wa.me/${sanitizedPhone}?text=Halo%20${encodeURIComponent(inq.fullName)},%20kami%20dari%20Angkasa%20Raya%20Medika%20terkait%20permintaan%20penawaran%20harga%20Anda.`;
};

const getRowActions = (inq: any): ActionMenuItem[] => {
  const actions: ActionMenuItem[] = [
    {
      id: "detail",
      label: "Lihat Detail",
      icon: Eye,
      variant: "default",
      onClick: () => {
        selectedInquiry.value = inq;
      },
    },
  ];

  const waUrl = getWhatsappUrl(inq);
  if (waUrl) {
    actions.push({
      id: "whatsapp",
      label: "Respon WhatsApp",
      icon: MessageSquare,
      href: waUrl,
      target: "_blank",
      variant: "success",
    });
  }

  return actions;
};
</script>

<template>
  <div class="space-y-5 animate-fade-up">
    <!-- Page Header -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="font-manrope font-extrabold text-xl sm:text-2xl text-[#0D2235]">Permintaan Penawaran Masuk</h1>
        <p class="text-xs text-[#486581] mt-0.5">Total {{ inquiries.length }} permintaan tercatat dari form RFQ website</p>
      </div>

      <button type="button" class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#D0F2F9]/60 text-[#082838] font-manrope font-bold text-xs transition-all shadow-xs cursor-pointer" @click="handleRefresh">
        <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isRefreshing }" />
        <span>Segarkan</span>
      </button>
    </div>

    <!-- Table Card (Excel-like striped, responsive horizontal scroll, unified controls & pagination) -->
    <div class="bg-white rounded-xl shadow-xs overflow-hidden">
      <TableControlBar v-model:page-size="pageSize" v-model:search-query="searchQuery" :page-size-options="pageSizeOptions" search-placeholder="Cari pemohon, instansi, produk, catatan..." />

      <div class="overflow-x-auto">
        <table class="w-full min-w-[880px] text-left border-collapse">
          <thead>
            <tr class="bg-[#D0F2F9]/60 border-b border-[#89CBDD]/25 divide-x divide-[#89CBDD]/20 text-[11px] font-manrope font-extrabold uppercase tracking-wider text-[#082838]">
              <th class="px-4 py-3 whitespace-nowrap">ID & Tanggal</th>
              <th class="px-4 py-3 whitespace-nowrap">Pemohon & Instansi</th>
              <th class="px-4 py-3 whitespace-nowrap">Kontak</th>
              <th class="px-4 py-3 whitespace-nowrap">Produk & Catatan</th>
              <th class="px-4 py-3 whitespace-nowrap text-right">Aksi</th>
            </tr>
          </thead>

          <tbody v-if="paginatedInquiries.length > 0" class="divide-y divide-slate-100 text-[13px]">
            <tr v-for="(inq, idx) in paginatedInquiries" :key="inq.id" class="transition-colors divide-x divide-slate-100/90 hover:bg-[#E9F8FF]/60" :class="idx % 2 === 0 ? 'bg-white' : 'bg-[#F4FBFE]'">
              <!-- ID & Tanggal -->
              <td class="px-4 py-3 whitespace-nowrap align-top">
                <span class="inline-block px-2 py-0.5 rounded-md bg-[#E9F8FF] text-[#082838] text-[10.5px] font-mono font-bold">
                  {{ inq.id }}
                </span>
                <div class="text-[11px] text-[#486581] mt-1">
                  {{ new Date(inq.createdAt).toLocaleString("id-ID") }}
                </div>
              </td>

              <!-- Pemohon & Instansi -->
              <td class="px-4 py-3 align-top max-w-[230px]">
                <div class="font-manrope font-bold text-[#0D2235] truncate">
                  {{ inq.fullName }}
                </div>
                <div class="text-[12px] text-[#486581] truncate mt-0.5">
                  {{ inq.companyOrInstitution }}
                </div>
              </td>

              <!-- Kontak -->
              <td class="px-4 py-3 align-top whitespace-nowrap">
                <div class="text-[12px] text-[#0D2235] font-medium">
                  {{ inq.workEmail }}
                </div>
                <div class="text-[11.5px] text-[#486581] mt-0.5 font-mono">
                  {{ inq.phoneNumber || "-" }}
                </div>
              </td>

              <!-- Produk & Catatan -->
              <td class="px-4 py-3 align-top max-w-[340px]">
                <div v-if="inq.productName" class="text-[12px] font-manrope font-bold text-[#082838] truncate">
                  {{ inq.productName }}
                  <span v-if="inq.estimatedQuantity" class="font-normal text-[#486581]"> ({{ inq.estimatedQuantity }}) </span>
                </div>
                <p class="text-[12px] text-[#486581] line-clamp-2 mt-0.5 leading-relaxed">"{{ inq.message }}"</p>
              </td>

              <!-- Single Aksi Popover Button -->
              <td class="px-4 py-3 whitespace-nowrap text-right align-top">
                <ActionMenuPopover :items="getRowActions(inq)" />
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr>
              <td colspan="5" class="px-4 py-12 text-center text-xs text-[#486581]">
                {{ inquiries.length === 0 ? "Belum ada permintaan penawaran masuk dari form website." : "Tidak ada permintaan penawaran yang cocok dengan pencarian." }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <TablePaginationFooter :current-page="currentPage" :total-pages="totalPages" :total-items="totalFilteredInquiries" :start-range="startRange" :end-range="endRange" @prev="prevPage" @next="nextPage" @go="goToPage" />
    </div>

    <!-- MODAL: DETAIL RFQ -->
    <Teleport to="body">
      <div v-if="selectedInquiry" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="inquiry-modal-title">
        <div class="fixed inset-0 bg-[#0D253A]/40 backdrop-blur-xs" @click="selectedInquiry = null" />
        <div ref="detailModalRef" class="relative bg-white rounded-xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 animate-scale-up z-10 text-[#0D2235]" @click.stop>
          <div class="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span class="inline-block px-2 py-0.5 rounded-md bg-[#E9F8FF] text-[#082838] text-[10.5px] font-mono font-bold">
                {{ selectedInquiry.id }}
              </span>
              <h3 id="inquiry-modal-title" class="font-manrope font-bold text-base text-[#0D2235] mt-1">
                {{ selectedInquiry.fullName }}
              </h3>
              <p class="text-[11.5px] text-[#486581]">Diterima {{ new Date(selectedInquiry.createdAt).toLocaleString("id-ID") }}</p>
            </div>
            <button type="button" class="p-1.5 rounded-xl text-[#486581] hover:text-[#0D2235] hover:bg-[#E9F8FF] cursor-pointer" title="Tutup (Esc)" @click="selectedInquiry = null">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="space-y-2.5 text-xs">
            <div class="flex items-start gap-2.5">
              <Building2 class="w-4 h-4 text-[#1B7E98] shrink-0 mt-0.5" />
              <div>
                <div class="text-[#486581]">Instansi / Lab / RS</div>
                <div class="font-semibold text-[#0D2235]">{{ selectedInquiry.companyOrInstitution }}</div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div class="flex items-start gap-2.5">
                <Mail class="w-4 h-4 text-[#1B7E98] shrink-0 mt-0.5" />
                <div class="min-w-0">
                  <div class="text-[#486581]">Email Kerja</div>
                  <div class="font-semibold text-[#0D2235] break-all">{{ selectedInquiry.workEmail }}</div>
                </div>
              </div>

              <div class="flex items-start gap-2.5">
                <Phone class="w-4 h-4 text-[#1B7E98] shrink-0 mt-0.5" />
                <div>
                  <div class="text-[#486581]">Telepon / WhatsApp</div>
                  <div class="font-semibold text-[#0D2235] font-mono">{{ selectedInquiry.phoneNumber || "-" }}</div>
                </div>
              </div>
            </div>

            <div v-if="selectedInquiry.productName" class="flex items-start gap-2.5">
              <Package class="w-4 h-4 text-[#1B7E98] shrink-0 mt-0.5" />
              <div>
                <div class="text-[#486581]">Produk & Estimasi Kebutuhan</div>
                <div class="font-semibold text-[#0D2235]">
                  {{ selectedInquiry.productName }}
                  <span v-if="selectedInquiry.estimatedQuantity" class="text-[#486581] font-normal"> — {{ selectedInquiry.estimatedQuantity }} </span>
                </div>
              </div>
            </div>

            <div class="pt-1">
              <div class="text-[#486581] mb-1">Pesan / Catatan Pemohon</div>
              <div class="p-3.5 rounded-xl bg-[#E9F8FF]/60 text-[13px] text-[#0D2235] leading-relaxed whitespace-pre-wrap break-words">
                {{ selectedInquiry.message }}
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" class="px-4 py-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] font-manrope font-semibold text-xs cursor-pointer transition-colors" @click="selectedInquiry = null">Tutup</button>
            <a v-if="getWhatsappUrl(selectedInquiry)" :href="getWhatsappUrl(selectedInquiry)" target="_blank" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] font-manrope font-bold text-xs transition-all shadow-xs">
              <MessageSquare class="w-3.5 h-3.5" />
              <span>Respon WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
