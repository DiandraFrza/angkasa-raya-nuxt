<!-- @format -->

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { MessageSquare, Bell, ChevronLeft, ChevronRight, ExternalLink } from "lucide-vue-next";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { useAdminAuth } from "~/composables/useAdminAuth";
import { useCafeNotification } from "~/composables/useCafeNotification";

definePageMeta({
  layout: "admin",
});

const { settings } = useSiteSettings();
const { isSuperAdmin } = useAdminAuth();
const { playCafeChime } = useCafeNotification();

useSeoMeta({
  title: () => `Permintaan Penawaran `,
});

// Pagination for Inquiries
const pageSizeOptions = [10, 20, 50, 100];
const inquiriesPage = ref(1);
const inquiriesPageSize = ref(10);

// Fetch inquiries
const { data: inquiriesData, refresh: refreshInquiries } = await useFetch<any[]>("/api/inquiries");
const inquiries = computed(() => inquiriesData.value || []);

watch(inquiriesPageSize, () => {
  inquiriesPage.value = 1;
});

// Pagination Calculations
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
</script>

<template>
  <div class="space-y-8 animate-fade-up">
    <!-- RFQ Feed Container -->
    <div class="bg-white rounded-3xl overflow-hidden shadow-xs border border-[#D0F2F9]/70">
      <div class="p-5 bg-[#D0F2F9]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D0F2F9]">
        <div>
          <h3 class="font-manrope font-bold text-[16px] text-[#0D2235]">Daftar Permintaan Penawaran Masuk</h3>
          <span class="text-[12.5px] text-[#486581]">Total: {{ inquiries.length }} permintaan penawaran tercatat</span>
        </div>

        <button type="button" class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#E9F8FF] text-[#082838] font-manrope font-bold text-[12px] transition-all shadow-xs cursor-pointer border border-[#ADDFF1]/60 self-start sm:self-auto" @click="refreshInquiries">
          <span>Muat Ulang Data</span>
        </button>
      </div>

      <!-- Inquiries List -->
      <div v-if="paginatedInquiries.length > 0" class="divide-y divide-[#D0F2F9]/40">
        <div v-for="(inq, i) in paginatedInquiries" :key="inq.id" class="p-6 transition-colors" :class="i % 2 === 0 ? 'bg-white' : 'bg-[#E9F8FF]/30'">
          <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <span class="font-manrope font-bold text-[16px] text-[#0D2235]">
                  {{ inq.fullName }}
                </span>
                <span class="px-2.5 py-0.5 rounded-full bg-[#E9F8FF] text-[#082838] text-[11px] font-mono font-bold">
                  {{ inq.id }}
                </span>
              </div>

              <div class="text-[13px] text-[#486581] space-y-1">
                <div><strong class="text-[#0D253A]">Instansi / Lab:</strong> {{ inq.companyOrInstitution }}</div>
                <div><strong class="text-[#0D253A]">Email:</strong> {{ inq.workEmail }} &bull; <strong class="text-[#0D253A]">Telp:</strong> {{ inq.phoneNumber || "-" }}</div>
                <div v-if="inq.productName">
                  <strong class="text-[#0D253A]">Produk Diminati:</strong> <span class="text-[#0D253A] font-semibold">{{ inq.productName }}</span>
                  <span v-if="inq.estimatedQuantity"> (Est: {{ inq.estimatedQuantity }})</span>
                </div>
              </div>

              <div class="mt-3 p-3.5 rounded-2xl bg-[#E9F8FF]/60 text-[13.5px] text-[#0D2235] font-sans leading-relaxed">"{{ inq.message }}"</div>
            </div>

            <!-- Quick Action: Direct WhatsApp -->
            <div class="flex flex-col items-end gap-2 shrink-0">
              <span class="text-[11.5px] text-[#486581]">
                {{ new Date(inq.createdAt).toLocaleString("id-ID") }}
              </span>
              <a v-if="inq.phoneNumber" :href="`https://wa.me/${inq.phoneNumber.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(inq.fullName)},%20kami%20dari%20Angkasa%20Raya%20Medika%20terkait%20permintaan%20penawaran%20harga%20Anda.`" target="_blank" class="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#89CBDD] to-[#A3EEEC] hover:from-[#76BED2] hover:to-[#8EE2E0] text-[#082838] text-[12.5px] font-manrope font-bold transition-all shadow-xs cursor-pointer">
                <MessageSquare class="w-3.5 h-3.5 text-[#082838]" />
                <span class="text-[12.5px]">Respon via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="p-12 text-center text-[#486581]">Belum ada permintaan penawaran masuk dari form website.</div>

      <!-- Inquiries Pagination Footer -->
      <div v-if="inquiries.length > 0" class="p-4 sm:p-5 bg-white border-t border-[#D0F2F9]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] font-sans">
        <div class="flex items-center gap-2">
          <span class="text-[#486581] font-medium">Tampilkan:</span>
          <div class="flex items-center gap-1 bg-[#E9F8FF] p-1 rounded-xl">
            <button v-for="size in pageSizeOptions" :key="size" type="button" class="px-2.5 py-1 rounded-lg font-manrope font-bold text-[12px] transition-all cursor-pointer" :class="inquiriesPageSize === size ? 'bg-[#89CBDD] text-[#082838]' : 'text-[#486581] hover:text-[#082838]'" @click="inquiriesPageSize = size">
              {{ size }}
            </button>
          </div>
          <span class="text-[#486581] hidden sm:inline">data per halaman</span>
        </div>

        <div class="text-[#486581] font-medium">
          Menampilkan <strong class="text-[#0D2235]">{{ inquiriesStartRange }}-{{ inquiriesEndRange }}</strong> dari <strong class="text-[#0D2235]">{{ totalInquiries }}</strong> RFQ
        </div>

        <div class="flex items-center gap-1.5">
          <button type="button" class="p-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer" :disabled="inquiriesPage <= 1" title="Halaman Sebelumnya" @click="inquiriesPage--">
            <ChevronLeft class="w-4 h-4" />
          </button>

          <div class="px-3.5 py-1.5 rounded-xl bg-[#D0F2F9]/70 text-[#082838] font-manrope font-bold text-[12.5px]">Hal {{ inquiriesPage }} / {{ totalInquiriesPages }}</div>

          <button type="button" class="p-2 rounded-xl bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#0D253A] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer" :disabled="inquiriesPage >= totalInquiriesPages" title="Halaman Selanjutnya" @click="inquiriesPage++">
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
