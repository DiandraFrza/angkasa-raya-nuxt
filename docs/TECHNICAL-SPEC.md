<!-- @format -->

# Spesifikasi Teknis — Angkasa Raya Medika (Nuxt 4)

**Status Dokumen:** Arsitektur yang Disetujui untuk Migrasi Nuxt 4 (v2.0)
**Framework:** Nuxt 4 + Vue 3 (Composition API)
**Bahasa:** TypeScript (Strict)
**Strategi Rendering:** Static Site Generation (SSG) dengan Nitro Prerendering
**Gaya & Gerakan:** Tailwind CSS + Motion for Vue (`motion-v`)
**Arsitektur Data:** Pola Repositori Lokal dengan Pengetikan Kuat (Strongly Typed)

---

## 1. Gambaran Umum Stack Teknologi

| Lapisan            | Teknologi                               | Alasan Pemilihan & Peran                                                                                                                                  |
| ------------------ | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**      | **Nuxt 4** (Vue 3)                      | Framework Vue full-stack modern yang mencakup perutean berbasis file, impor otomatis, mesin SSR/SSG berkinerja tinggi, dan server Nitro terpadu.          |
| **Bahasa**         | **TypeScript 5.x**                      | Keamanan tipe (type safety) menyeluruh di seluruh data katalog, payload permintaan (inquiry), props komponen, dan endpoint API.                           |
| **Gaya (Styling)** | **Tailwind CSS 3.x / 4.x**              | CSS berbasis utilitas (utility-first) yang dikonfigurasi dengan token merek khusus (Scientific Turquoise, Deep Navy, Soft Ivory, Warm Amber).             |
| **Mesin Animasi**  | **Motion for Vue (`motion-v`)**         | Pustaka animasi untuk Vue 3 yang mendukung efek paralaks deklaratif, elemen yang muncul saat digulir (scroll-triggered), dan interaksi gestur yang halus. |
| **Ikon**           | **Lucide Vue Next** (`lucide-vue-next`) | Pustaka ikon SVG yang bersih dan mendukung _tree-shaking_, dengan ketebalan garis (stroke weight) konsisten sebesar 2px.                                  |
| **Tipografi**      | **Manrope + DM Sans**                   | Manrope untuk judul (headings), DM Sans untuk isi teks dan spesifikasi; dimuat melalui `@nuxtjs/google-fonts` atau `@nuxt/fonts`.                         |
| **Mesin Server**   | **Nitro**                               | Server Nuxt bawaan yang menangani pra-render statis, pembuatan rute, dan endpoint _serverless_ untuk permintaan informasi (`/api/inquiries`).             |
| **Validasi**       | **Zod** (atau Valibot)                  | Validasi skema saat _runtime_ untuk _payload_ permintaan (_inquiry_) dan integritas data katalog.                                                         |
| **Kontrol Versi**  | **Git + GitHub**                        | Kontrol sumber terdistribusi dengan standar _commit_ konvensional.                                                                                        |

---

## 2. Arsitektur Proyek & Struktur Direktori Nuxt 4

Proyek ini ditempatkan dalam direktori yang sepenuhnya independen: `angkasa-raya-nuxtscientific-nuxt`. Struktur ini memanfaatkan konvensi direktori Nuxt 4 yang modern:

```text
angkasa-raya-nuxtscientific-nuxt/
├── docs/                                  # Dokumentasi & panduan proyek
│   ├── PRD.md
│   ├── DESIGN-SYSTEM.md
│   ├── TECHNICAL-SPEC.md
│   ├── USER-FLOW.md
│   └── IMPLEMENTATION-PLAN.md
├── public/                                # Aset publik statis (tidak diproses oleh bundler)
│   ├── brand/
│   │   ├── logo-akm.jpg                   # Identitas merek perusahaan yang terverifikasi
│   │   └── favicon.ico
│   ├── documents/                         # Berkas PDF SDS / TDS yang terverifikasi
│   └── images/
│       ├── categories/                    # Visual & banner kategori
│       └── products/                      # Foto produk & gambar pengganti (placeholder) yang terverifikasi
├── src/                                   # Akar sumber aplikasi (kompatibel dengan Nuxt 4)
│   ├── assets/
│   │   └── css/
│   │       └── tailwind.css               # Arahan Tailwind & token CSS kustom
│   ├── components/                        # Komponen Vue yang diimpor secara otomatis
│   │   ├── common/
│   │   │   ├── AppBreadcrumb.vue          # Navigasi remah roti (breadcrumb) untuk tampilan katalog
│   │   │   ├── PlaceholderBadge.vue       # Penanda khusus untuk atribut yang belum terverifikasi
│   │   │   └── SectionHeading.vue         # Judul editorial dengan aksen warna pirus (turquoise)
│   │   ├── forms/
│   │   │   ├── InquiryForm.vue            # Formulir permintaan informasi (inquiry) B2B yang reaktif
│   │   │   └── QuoteModal.vue             # Modal kontekstual yang muncul dari halaman produk
│   │   ├── layout/
│   │   │   ├── AppHeader.vue              # Navigasi tetap (sticky) dengan efek blur ala kaca (glassmorphic) saat digulir
│   │   │   ├── AppFooter.vue              # Footer perusahaan dengan informasi kontak terverifikasi
│   │   │   └── MobileNav.vue              # Panel navigasi seluler yang dapat diakses (slide-out drawer)
│   │   └── products/
│   │       ├── ProductCard.vue            # Kartu dengan bingkai 1px, efek perbesar saat kursor diarahkan (hover), & tombol penawaran (CTA)
│   │       ├── ProductFilter.vue          # Pemilih kategori berbasis pill yang reaktif
│   │       ├── ProductGrid.vue            # Kontainer grid 12-kolom yang responsif
│   │       ├── ProductSearch.vue          # Pencarian kata kunci waktu nyata dengan teknik debounce
│   │       └── ProductSpecsTable.vue      # Tampilan spesifikasi teknis terstruktur
│   ├── composables/                       # Fungsi Vue Composition API yang diimpor secara otomatis
│   │   ├── useCatalog.ts                  # Lapisan abstraksi untuk kueri produk/kategori
│   │   ├── useParallax.ts                 # Komposabel untuk perhitungan efek paralaks
│   │   ├── useQuoteModal.ts               # State reaktif global untuk modal permintaan penawaran (RFQ)
│   │   └── useReducedMotion.ts            # Deteksi preferensi aksesibilitas terkait gerakan (motion)
│   ├── data/                              # Lapisan data lokal dengan pengetikan ketat (strongly typed)
│   │   ├── categories.ts                  # Kategori yang telah dikonfirmasi (berjumlah 4)
│   │   └── products.ts                    # Katalog produk terverifikasi dengan penanda placeholder
│   ├── layouts/
│   │   └── default.vue                    # Tata letak utama yang membungkus AppHeader, slot, dan AppFooter
│   ├── pages/# Tampilan rute berbasis file Nuxt
│   │   ├── index.vue                      # Beranda: proposisi nilai editorial & efek paralaks hero
│   │   ├── about.vue                      # Profil perusahaan & standar
│   │   ├── contact.vue                    # Detail kontak langsung & formulir permintaan penawaran (RFQ)
│   │   └── products/
│   │       ├── index.vue                  # Daftar katalog, filter reaktif & pencarian
│   │       └── [slug].vue                 # Tampilan detail produk dinamis & spesifikasi
│   ├── types/                             # Antarmuka (interface) & tipe TypeScript
│   │   ├── catalog.ts                     # Antarmuka untuk Kategori, Produk, dan Spesifikasi
│   │   └── inquiry.ts                     # Antarmuka untuk payload RFQ dan respons API
│   └── app.vue                            # Titik masuk (entrypoint) utama Vue (kontainer NuxtPage)
├── server/                                # Mesin server Nitro
│   └── api/
│       └── inquiries.post.ts              # Validasi & pengiriman permintaan (inquiry) di sisi server
├── .env.example                           # Templat variabel lingkungan (environment variables)
├── nuxt.config.ts                         # File konfigurasi Nuxt 4
├── package.json                           # Dependensi & skrip
├── tailwind.config.ts                     # Pemetaan token warna & tipografi Tailwind
└── tsconfig.json                          # Konfigurasi TypeScript ketat (strict)
```

---

## 3. Arsitektur Data Lokal dengan Pengetikan Kuat (Strongly Typed)

Untuk menjaga kecepatan pengembangan maksimal tanpa beban basis data, katalog ini menggunakan penyimpanan data lokal dengan pengetikan kuat yang diabstraksi di balik _composable_ `useCatalog()`. Desain repositori ini menjamin bahwa integrasi dengan _headless CMS_ atau basis data pada Fase 2 tidak akan memerlukan perubahan apa pun pada komponen antarmuka pengguna (UI).

### 3.1 Definisi Tipe (`types/catalog.ts`)

```typescript
export type CategorySlug = "new-standard-reagent" | "standard-reagent" | "reagents" | "esight";

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  description: string;
  isConfirmed: boolean; // bernilai false untuk 'esight' yang menunggu konfirmasi pemilik bisnis
}

export interface ProductSpecification {
  label: string;
  value: string;
  isVerified: boolean;
}

export interface ProductPackaging {
  size: string;
  unit: string;
  container?: string;
}

export interface ProductDocument {
  title: string;
  type: "SDS" | "TDS" | "COA" | "Specification Sheet";
  fileUrl: string;
  fileSize?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categorySlug: CategorySlug;
  sku?: string;
  casNumber?: string;
  chemicalFormula?: string;
  grade?: string;
  shortDescription: string;
  description?: string;
  packaging?: ProductPackaging[];
  specifications?: ProductSpecification[];
  documents?: ProductDocument[];
  imageUrl: string;
  isFeatured?: boolean;
  isVerified: boolean; // false jika menggunakan placeholder templat
}
```

### 3.2 Model Data Permintaan (`types/inquiry.ts`)

```typescript
export interface InquiryPayload {
  fullName: string;
  companyOrInstitution: string;
  workEmail: string;
  phoneNumber?: string;
  productSlug?: string;
  productName?: string;
  estimatedQuantity?: string;
  message: string;
  honeypot?: string; // Jebakan tersembunyi untuk bot spam
}

export interface InquiryResponse {
  success: boolean;
  message: string;
  inquiryId?: string;
}
```

### 3.3 Composable Layanan Akses Data (`composables/useCatalog.ts`)

```typescript
import { categories } from "~/data/categories";
import { products } from "~/data/products";
import type { Category, Product, CategorySlug } from "~/types/catalog";

export const useCatalog = () => {
  const getCategories = (): Category[] => categories;

  const getCategoryBySlug = (slug: CategorySlug): Category | undefined => categories.find((c) => c.slug === slug);

  const getProducts = (): Product[] => products;

  const getProductBySlug = (slug: string): Product | undefined => products.find((p) => p.slug === slug);

  const getFeaturedProducts = (): Product[] => products.filter((p) => p.isFeatured);

  const getProductsByCategory = (categorySlug?: CategorySlug | "all"): Product[] => {
    if (!categorySlug || categorySlug === "all") return products;
    return products.filter((p) => p.categorySlug === categorySlug);
  };

  return {
    getCategories,
    getCategoryBySlug,
    getProducts,
    getProductBySlug,
    getFeaturedProducts,
    getProductsByCategory,
  };
};
```

---

## 4. Routing & Static Site Generation (SSG)

Nuxt 4 secara otomatis memetakan struktur direktori ke dalam rute. Semua halaman publik dirender sebelumnya secara statis (pre-rendered) pada saat proses _build_ menggunakan konfigurasi _prerendering_ Nitro di dalam `nuxt.config.ts`:

- `/` — Beranda (proposisi nilai perusahaan, tampilan kategori, _hero parallax_)
- `/about` — Profil perusahaan, standar, dan fokus institusional
- `/products` — Katalog produk dengan fitur penyaringan kategori reaktif dan pencarian langsung (_live search_)
- `/products/[slug]` — Tampilan detail produk dinamis yang dirender sebelumnya (_pre-rendered_)
- `/contact` — Informasi kontak dan formulir permintaan penawaran (RFQ) lengkap

### `nuxt.config.ts`Konfigurasi Prerender `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  future: {
    compatibilityVersion: 4,
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/", "/about", "/products", "/contact"],
    },
  },
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/google-fonts"],
  googleFonts: {
    families: {
      Manrope: [400, 600, 700, 800],
      "DM+Sans": [400, 500, 700],
    },
    display: "swap",
  },
});
```

---

## 5. Spesifikasi Endpoint Permintaan (`server/api/inquiries.post.ts`)

Endpoint permintaan ini memproses permohonan penawaran B2B dengan validasi ketat di sisi server:

````typescript
import { defineEventHandler, readBody, createError } from 'h3';
import { z } from 'zod';

const inquirySchema = z.object({
fullName: z.string().min(2, 'Nama wajib diisi').max(100),
companyOrInstitution: z.string().min(2, 'Perusahaan atau institusi wajib diisi').max(150),
workEmail: z.string().email('Alamat email kantor yang valid wajib diisi'),
phoneNumber: z.string().optional(),
productSlug: z.string().optional(),
productName: z.string().optional(),
estimatedQuantity: z.string().optional(),
message: z.string().min(10, 'Pesan harus terdiri dari minimal 10 karakter').max(2000),
honeypot: z.string().max(0, 'Spam terdeteksi').optional(),
});
``` export default defineEventHandler(async (event) => {
const body = await readBody(event);
const result = inquirySchema.safeParse(body);

if (!result.success) {
throw createError({
statusCode: 400,
statusMessage: 'Validasi Gagal',
data: result.error.flatten(),
});
}

// Perlindungan bot (honeypot)
if (body.honeypot && body.honeypot.length > 0) {
return { success: true, message: 'Permintaan berhasil diterima.' };
}

// Fase 1: Pencatatan log internal terstruktur & simulasi pengiriman yang terkonfirmasi
console.info('[PERMINTAAN B2B DITERIMA]', {
timestamp: new Date().toISOString(),
inquiry: result.data,
});

return {
success: true,
message: 'Terima kasih atas permintaan penawaran Anda. Tim penjualan kami akan meninjau kebutuhan Anda dan segera memberikan tanggapan.',
inquiryId: `INQ-${Date.now()}`,
};
});
````

---

## 6. Arsitektur Motion & Parallax (`motion-v`)

- **Library:** `motion-v` (Motion untuk Vue 3).
- **Direktif & Komponen:** Komponen pembungkus `<Motion>` yang bersifat deklaratif serta _listener_ gulir (_scroll_) yang reaktif.
- **Implementasi Parallax:** _Offset_ parallax dihitung melalui _composable_ `useParallax()` yang melacak posisi gulir jendela (_window scroll offset_) dan memetakan koordinat tersebut ke properti kustom CSS (`--parallax-y`) atau langsung ke `transform: translateY(...)`.
- **Integrasi Aksesibilitas:**

````typescript
// composables/useReducedMotion.ts
import { ref, onMounted } from 'vue';

export const useReducedMotion = () => {
const prefersReducedMotion = ref(false);

onMounted(() => {
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
prefersReducedMotion.value = mediaQuery.matches;
mediaQuery.addEventListener('change', (e) => {
prefersReducedMotion.value = e.matches;
});
});

return { prefersReducedMotion };
}; ```

---

## 7. Standar Performa, SEO, & Aksesibilitas

- **Core Web Vitals:** *Shell* HTML yang dirender sebelumnya (*pre-rendered*) dan aset lokal yang dioptimalkan menghasilkan skor Performa Lighthouse $>95$, dengan *Largest Contentful Paint* (LCP) di bawah $1,2\text{s}$ dan *Cumulative Layout Shift* (CLS) sebesar $0,00$.
- **SEO melalui `useSeoMeta()`:**
- Pembuatan otomatis untuk *title*, *description*, *image*, dan URL kanonik OpenGraph.
- Skema data terstruktur JSON-LD untuk tipe `Organization` dan `Product` pada tampilan detail.
- **Aksesibilitas (WCAG 2.1 AA):**
- Dukungan penuh untuk navigasi papan ketik (*keyboard focus*) dengan indikator fokus berwarna *Turquoise* yang terlihat jelas (`focus-visible:ring-2 focus-visible:ring-[#08AEB3]`).
- Rasio kontras warna yang ketat ($>4,5:1$ untuk teks isi, $>3:1$ untuk judul berukuran besar).
- Label yang ramah bagi pembaca layar (*screen reader*)—seperti `aria-label`, `aria-expanded`, dan `aria-haspopup`—pada elemen interaktif seperti *drawer*, bilah pencarian, dan dialog.

---

## 8. Daftar Periksa Verifikasi Migrasi

1. [x] Struktur direktori Nuxt 4 telah diisolasi dalam `angkasa-raya-nuxtscientific-nuxt`.
2. [x] Tidak ada sisa kode React, Next.js, atau JSX.
3. [x] *Token* visual berwarna *Turquoise* (`#08AEB3`) telah dikonfigurasi di Tailwind.
4. [x] 4 kategori yang telah dikonfirmasi tetap dipertahankan tanpa perubahan.
5. [x] Prinsip "tanpa rekayasa data" (*zero-fabrication*) diterapkan secara ketat pada seluruh data katalog.
6. [x] Pembuatan SSG (*Static Site Generation*) berhasil tanpa *error* saat *runtime*.
7. [x] Modal RFQ (*Request for Quotation*) terisi secara otomatis dengan tepat berdasarkan *slug* produk.
8. [x] *Drawer* dan modal pada perangkat seluler mampu mengunci fokus papan ketik (*keyboard focus*) dengan baik.
````
