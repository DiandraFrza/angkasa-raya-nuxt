<!-- @format -->

# Angkasa Karya Media - Rencana Implementasi Strategis (Migrasi ke Nuxt 4)

**Status Dokumen:** Cetak Biru Arsitektur & Implementasi yang Disetujui (v2.0)
**Direktori Proyek:** `angkasa-raya-nuxt` (Proyek Nuxt 4 Terisolasi)
**Model Bisnis:** Profil Perusahaan B2B & Katalog Produk Ilmiah
**Aksi Komersial Utama:** Permintaan Penawaran & Pertanyaan Langsung dari Institusi
**Arahan Visual:** _Bold Turquoise_ (Turkis Tegas) + _Medium Parallax_ (Paralaks Menengah)
**Tumpukan Teknologi Utama:** Nuxt 4, Vue 3, TypeScript, Tailwind CSS, Motion for Vue (`motion-v`), Lucide Icons, Manrope + DM Sans, Nitro SSG

---

## 1. Ringkasan Eksekutif & Dasar Pemikiran Migrasi

Cetak biru ini mendefinisikan migrasi teknis menyeluruh untuk Angkasa Karya Media **Nuxt 4**.

### Pilar Strategis:

1. **Struktur Proyek Nuxt 4 Terisolasi:** Aplikasi baru dibangun dalam direktori independen (`angkasa-raya-nuxt`)
2. **Identitas Visual _Bold Turquoise_:** Implementasi bahasa desain **Bold Turquoise + Medium Parallax** yang telah disetujui:

- _Scientific Turquoise_ (`#08AEB3`) sebagai jangkar utama merek.
- _Deep Navy_ (`#123B5D`) untuk struktur dan tipografi yang memberikan kesan otoritatif.
- _Soft Ivory_ (`#F7F7F2`) sebagai latar belakang yang menyerupai kertas ilmiah.
- _Warm Amber_ (`#F2A23A`) sebagai aksen penanda yang mencolok namun tetap terkendali.

3. **Animasi _Medium Parallax_ yang Terarah:** Menggunakan **Motion for Vue (`motion-v`)**, kami mengintegrasikan kedalaman spasial berlapis, efek paralaks pada gambar utama (_hero image_), elemen yang muncul saat digulir (_scroll-triggered reveals_), serta interaksi mikro yang halus-dengan tetap menghormati preferensi pengguna yang membatasi animasi (`prefers-reduced-motion`) dan menghindari manipulasi paksa pada fungsi gulir (_scroll hijacking_).
4. **Fokus Murni pada B2B:** Penghapusan seluruh mekanisme _e-commerce_ untuk konsumen (tidak ada keranjang belanja, proses _checkout_, ataupun sistem akun pengguna). Kepatuhan ketat terhadap data produk yang telah diverifikasi di keempat kategori kerja (`New Standard Reagent`, `Standard Reagent`, `Reagents`, `Esight`), dengan penanda (placeholder) transparan untuk atribut yang belum diverifikasi.
5. **Static Site Generation (SSG) & Arsitektur Nitro:** Pemuatan halaman yang sangat cepat, LCP (Largest Contentful Paint) di bawah satu detik, indeksabilitas SEO yang sempurna, serta _endpoint_ permintaan _serverless_ yang ringan (`/api/inquiries`). ---

## 2. Arsitektur Teknis Target

````mermaid
graph TD
subgraph Client["Lapisan Klien Nuxt 4 (Vue 3)"]
Pages["Halaman yang Dirender Sebelumnya secara Statis\n(Beranda, Tentang, Katalog, Detail, Kontak)"]
Reactive["Komponen Vue Interaktif\n(Filter Kategori, Pencarian dengan Debounce, Modal RFQ)"]
MotionEngine["Motion for Vue (motion-v)\n(Paralaks Hero, Guliran Berlapis, Tampilan Bertahap)"]
end

subgraph Composables["Lapisan Komposisi Vue 3"]
useCatalog["useCatalog()\n(Akses Data Produk & Kategori)"]
useParallax["useParallax()\n(Kalkulator Posisi Guliran & Offset Lapisan)"]
useQuoteModal["useQuoteModal()\n(State Global untuk RFQ Kontekstual)"]
useReducedMotion["useReducedMotion()\n(Deteksi Aksesibilitas untuk Animasi)"]
end

subgraph Data["Penyimpanan Data Lokal dengan Tipe yang Ketat"]
CategoriesData["data/categories.ts\n(4 Kategori yang Ditetapkan)"]
ProductsData["data/products.ts\n(Spesifikasi Terverifikasi & Placeholder Eksplisit)"]
end

subgraph Server["Mesin Server Nitro"]
InquiryEndpoint["POST /api/inquiries\n• Validasi Skema Zod\n• Penyaringan Anti-Spam (Honeypot)\n• Pencatatan Permintaan / Pengiriman Email"]
PrerenderEngine["Nitro Prerender\n(Pembuatan HTML/JSON melalui SSG)"]
end

Pages --> useCatalog
Pages --> useParallax
Reactive --> useQuoteModal
Reactive --> useReducedMotion
useCatalog --> CategoriesData
useCatalog --> ProductsData
Reactive -->|Kirim Permintaan Penawaran| InquiryEndpoint
PrerenderEngine -.->|Pra-render saat build|
``` Halaman
````

---

## 3. Peta Direktori Proyek (`angkasa-raya-nuxt`)

```text
angkasa-raya-nuxt/
├── docs/                                  # Dokumentasi proyek
│   ├── PRD.md
│   ├── DESIGN-SYSTEM.md
│   ├── TECHNICAL-SPEC.md
│   ├── USER-FLOW.md
│   └── IMPLEMENTATION-PLAN.md
├── public/                                # Media & dokumen statis
│   ├── brand/
│   │   ├── logo-akm.jpg                   # Tanda merek perusahaan resmi
│   │   └── favicon.ico
│   ├── documents/                         # Berkas PDF SDS / TDS yang terverifikasi
│   └── images/
│       ├── categories/                    # Visual & spanduk kategori
│       └── products/                      # Foto produk terverifikasi & gambar pengganti (placeholder)
├── src/                                   # Kode sumber aplikasi
│   ├── assets/
│   │   └── css/
│   │       └── tailwind.css               # Arahan Tailwind & token warna merek
│   ├── components/                        # Komponen UI Vue 3 yang diimpor secara otomatis
│   │   ├── common/
│   │   │   ├── AppBreadcrumb.vue          # Navigasi breadcrumb
│   │   │   ├── PlaceholderBadge.vue       # Label untuk spesifikasi yang belum terverifikasi
│   │   │   └── SectionHeading.vue         # Judul editorial dengan aksen warna pirus (turquoise)
│   │   ├── forms/
│   │   │   ├── InquiryForm.vue            # Formulir permintaan informasi (inquiry) B2Bm dengan validasi
│   │   │   └── QuoteModal.vue             # Modal penawaran kontekstual
│   │   ├── layout/
│   │   │   ├── AppHeader.vue              # Navigasi tetap (sticky) dengan transisi blur
│   │   │   ├── AppFooter.vue              # Footer perusahaan dengan kontak terverifikasi
│   │   │   └── MobileNav.vue              # Panel geser (sliding drawer) yang aksesibel
│   │   └── products/
│   │       ├── ProductCard.vue            # Kartu produk dengan efek zoom saat kursor diarahkan & pemicu RFQ
│   │       ├── ProductFilter.vue          # Pemilih kategori berbentuk pill
│   │       ├── ProductGrid.vue            # Tata letak responsif 12 kolom
│   │       ├── ProductSearch.vue          # Pencarian langsung dengan fitur debounce
│   │       └── ProductSpecsTable.vue      # Tabel spesifikasi terverifikasi
│   ├── composables/                       # Komposabel Vue Composition API
│   │   ├── useCatalog.ts                  # Repositori akses katalog yang diabstraksi
│   │   ├── useParallax.ts                 # Perhitungan offset gulir untuk lapisan paralaks
│   │   ├── useQuoteModal.ts               # Status reaktif untuk membuka/menutup modal
│   │   └── useReducedMotion.ts            # Preferensi aksesibilitas pengguna terkait gerakan
│   ├── data/                              # Berkas data dengan pengetikan ketat (strongly typed)
│   │   ├── categories.ts                  # 4 kategori aktif
│   │   └── products.ts                    # Catatan produk dengan penanda placeholder
│   ├── layouts/
│   │   └── default.vue                    # Struktur tata letak global
│   ├── pages/                             # Tampilan rute Nuxt
│   │   ├── index.vue                      # Beranda dengan efek paralaks pada bagian hero
│   │   ├── about.vue                      # Profil perusahaan & standar
│   │   ├── contact.vue                    # Detail kontak & formulir permintaan informasi
│   │   └── products/
│   │       ├── index.vue                  # Daftar katalog & fitur pencarian/penyaringan
│   │       └── [slug].vue                 # Detail produk & spesifikasi
│   ├── types/                             # Definisi TypeScript
│   │   ├── catalog.ts                     # Antarmuka untuk Kategori, Produk, dan Kemasan
│   │   └── inquiry.ts                     # Skema data untuk permintaan penawaran
│   └── app.vue                            # Titik masuk (entrypoint) utama Vue
├── server/                                # Rute server Nitro
│   └── api/
│       └── inquiries.post.ts              # Penangan permintaan (inquiry) serverless
├── nuxt.config.ts                         # Konfigurasi Nuxt 4
├── package.json                           # Dependensi NPM
├── tailwind.config.ts                     # Tema merek & font Tailwind
└── tsconfig.json                          # Konfigurasi TypeScript ketat (strict)
```

---

## 4. Spesifikasi Dependensi

```json
{
  "name": "angkasa-raya-nuxt",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
  "dependencies": {
    "lucide-vue-next": "^0.460.0",
    "motion-v": "^0.0.10",
    "vue": "^3.5.0",
    "vue-router": "^4.4.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@nuxtjs/google-fonts": "^3.2.0",
    "@nuxtjs/tailwindcss": "^6.12.2",
    "@types/node": "^22.0.0",
    "autoprefixer": "^10.4.20",
    "nuxt": "^4.0.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "typescript": "^5.6.3"
  }
}
```

---

## 5. Tahapan Implementasi (Milestones)

### Tahap 1: Penyusunan Struktur (Scaffolding) & Konfigurasi Inti Nuxt 4

- **Pengaturan Direktori:** Inisialisasi folder proyek terisolasi `angkasa-raya-nuxt`.
- **Instalasi Dependensi:** Memasang Nuxt 4, Vue 3, TypeScript, Tailwind CSS, `@nuxtjs/google-fonts`, `motion-v`, `lucide-vue-next`, dan `zod`. - **Konfigurasi Nuxt (`nuxt.config.ts`):** Mengonfigurasi tanggal kompatibilitas, mode masa depan Nuxt 4, Google Fonts untuk `Manrope` (400, 600, 700, 800) dan `DM Sans` (400, 500, 700), serta rute _prerendering_ statis untuk Nitro.
- **Pengaturan Tailwind (`tailwind.config.ts`):** Menetapkan _design token_ Bold Turquoise yang telah disetujui (`#08AEB3`, `#123B5D`, `#F7F7F2`, `#FFFFFF`, `#F2A23A`).
- **Gaya Dasar (`assets/css/tailwind.css`):** Mengonfigurasi pemetaan jenis huruf (_font family_) dan kelas utilitas kustom.

### Milestone 2: Design System Token, Tata Letak & Komponen Dasar (_Primitives_)

- **Tata Letak Utama (`layouts/default.vue`):** Menyusun kerangka halaman standar yang mencakup _header_ global, _slot_ konten, dan _footer_.
- **Header Navigasi (`components/layout/AppHeader.vue`):** Bilah navigasi _sticky_ dengan efek _backdrop blur_ halus saat digulir, indikator rute aktif, logo merek, serta tombol CTA "Request a Quote" yang menonjol.
- **Navigasi Seluler (`components/layout/MobileNav.vue`):** Panel geser (_sliding drawer_) yang dapat diakses melalui papan ketik, dilengkapi animasi halus dan fitur _focus trap_.
- **Footer Perusahaan (`components/layout/AppFooter.vue`):** Dengan latar belakang _Deep Navy_, memuat informasi kontak resmi, navigasi kategori layanan, serta pernyataan hukum (_legal disclaimers_).
- **Komponen Dasar (_Primitives_):** Membangun `SectionHeading.vue` (dengan elemen _eyebrow_ berwarna Bold Turquoise) dan `PlaceholderBadge.vue` (untuk menampilkan atribut yang belum terverifikasi secara transparan).

### Milestone 3: Tipografi LokalKomposabel Data Engine & Repositori

- **Definisi TypeScript (`types/catalog.ts` & `types/inquiry.ts`):** Antarmuka ketat untuk Kategori, Produk, Spesifikasi, Kemasan, dan `InquiryPayload`.
- **Data Kategori (`data/categories.ts`):** Memuat 4 kategori yang telah dikonfirmasi:

1. `New Standard Reagent`
2. `Standard Reagent`
3. `Reagents`
4. `Esight` _(ditandai dengan catatan khusus karena masih menunggu verifikasi bisnis)_.

- **Data Produk (`data/products.ts`):** Memuat produk-produk awal yang telah diverifikasi dengan penanda `isVerified` yang ketat; tidak ada data CAS/kimia yang dibuat-buat.
- **Komposabel Repositori (`composables/useCatalog.ts`):** Mengimplementasikan metode kueri data (`getProducts`, `getProductBySlug`, `getProductsByCategory`, `getFeaturedProducts`, `getCategories`).

### Milestone 4: Integrasi Parallax Menengah & Mesin Gerak (Motion Engine)

- **Komposabel Gerak Aksesibilitas (`composables/useReducedMotion.ts`):** Mendeteksi pengaturan `prefers-reduced-motion` pada sistem operasi pengguna dan menonaktifkan transformasi secara dinamis.
- **Komposabel Matematika Parallax (`composables/useParallax.ts`):** Menghitung _offset_ gulir (_scroll offset_) reaktif dan nilai translasi untuk menciptakan kedalaman multi-bidang.
- **Animasi Berbasis Gulir (_Scroll-Triggered Reveals_):** Mengonfigurasi animasi deklaratif `motion-v` berupa efek _fade-up_ dan kemunculan bertahap (_staggered entry_) untuk judul, kartu, dan pemisah struktural.
- **Transisi _Hover_:** Mengimplementasikan interaksi mikro pada tombol, pergeseran panah ($+4\text{px}$), dan gambar produk (perbesaran halus sebesar $1,02\times$).

### Milestone 5: Konstruksi Halaman

- **Beranda (`pages/index.vue`):**
- Bagian _Hero_ yang menampilkan tipografi Manrope bergaya editorial yang tegas, dua tombol ajakan bertindak (_CTA_), dan lapisan gambar dengan efek _parallax_ menengah.
- Tampilan Kategori Interaktif yang menyoroti 4 kategori yang telah dikonfirmasi.
- Pratinjau Produk Unggulan dengan tautan langsung untuk permintaan penawaran (_quotation_).
- Gambaran umum perusahaan yang memuat pernyataan kualitas terverifikasi serta lencana (_badge_) penanda di bagian yang diperlukan.
- _Banner_ ajakan permintaan penawaran (_quotation_) dengan lebar penuh (_full-width_). - **Halaman Tentang (`pages/about.vue`):**
- Misi perusahaan, fokus kelembagaan (rumah sakit, laboratorium diagnostik, universitas riset).
- Pernyataan transparansi yang jelas mengenai kredensial vendor dan perjanjian distribusi.
- **Halaman Katalog (`pages/products/index.vue`):**
- Filter kategori berbentuk _pill_ dengan sinkronisasi _query_ URL yang reaktif (`?category=...`).
- Pencarian kata kunci _real-time_ dengan teknik _debouncing_ (`ProductSearch.vue`).
- _Grid_ kartu produk responsif 12 kolom (`ProductGrid.vue` & `ProductCard.vue`).
- Tampilan saat pencarian kosong yang informatif, disertai opsi untuk mengajukan permintaan penawaran (_quote request_).
- **Halaman Detail Produk (`pages/products/[slug].vue`):**
- _Route_ dinamis yang dirender sebelumnya (_pre-rendered_) menggunakan `getProductBySlug`.
- _Breadcrumb_ hierarkis (`AppBreadcrumb.vue`).
- Tabel spesifikasi teknis yang terverifikasi (`ProductSpecsTable.vue`).
- Tautan untuk mengunduh SDS (_Safety Data Sheet_) atau lembar data teknis.
- Tombol _Call-to-Action_ (CTA) "Minta Penawaran" yang kontekstual.

### Milestone 6: Sistem Penawaran B2B & Penangan Server Nitro

- **Status Modal Penawaran (`composables/useQuoteModal.ts`):** Status reaktif global untuk membuka modal permintaan penawaran dan mengaitkan konteks produk.
- **Modal Penawaran (`components/forms/QuoteModal.vue`):** Dialog modal yang aksesibel, dilengkapi dengan efek _blur_ pada latar belakang, fitur penutupan menggunakan tombol ESC, dan fokus otomatis (_autofocus_).
- **Formulir Permintaan Informasi (`components/forms/InquiryForm.vue`):** _Input_ reaktif dengan validasi di sisi klien (_client-side_), penanganan status kesalahan, serta perlindungan _spam_ menggunakan metode _honeypot_.
- **Halaman Kontak (`pages/contact.vue`):** Halaman kontak lengkap yang memuat formulir permintaan informasi, tautan WhatsApp terverifikasi, alamat surel, dan koordinat lokasi fasilitas.
- **Rute API _Serverless_ (`server/api/inquiries.post.ts`):** Penangan (_handler_) POST Nitro yang mencakup validasi skema Zod, penyaringan _bot_ melalui _honeypot_, pencatatan log terstruktur, serta pengiriman respons yang akurat. ### Tonggak Pencapaian 7: Pembuatan Situs Statis (SSG), Audit & Pengiriman
- **Pra-render SSG Penuh:** Jalankan `nuxt generate` untuk menghasilkan HTML statis yang telah dipra-render sepenuhnya beserta bundel JSON demi performa instan.
- **SEO & OpenGraph:** Konfigurasikan `useSeoMeta()` di seluruh tampilan dengan judul, deskripsi, dan tautan kanonis (canonical links) yang disesuaikan.
- **Audit Aksesibilitas WCAG 2.1 AA:** Verifikasi kontras warna, navigasi papan ketik, indikator fokus (focus rings), dan tag untuk pembaca layar (screen reader).
- **Pemeriksaan Kualitas (Tanpa Data Rekayasa):** Pastikan tidak ada nomor CAS, harga, atau kredensial palsu yang dibuat-buat di dalam basis kode.
- **Verifikasi Lintas Peramban:** Lakukan pengujian pada Chromium, WebKit (Safari), dan Gecko (Firefox) di perangkat seluler maupun desktop.

---

## 6. Kriteria Verifikasi & Penerimaan

1. **Arsitektur:** Seluruh proyek berjalan menggunakan Nuxt 4 dalam direktori mandiri `angkasa-raya-nuxt`, tanpa ketergantungan (dependencies) pada Next.js atau React.
2. **Bahasa Desain:** Menerapkan konsep **Bold Turquoise + Medium Parallax** secara akurat, dengan menggunakan palet warna `#08AEB3`, `#123B5D`, `#F7F7F2`, `#FFFFFF`, dan `#F2A23A`.
3. **Pengalaman Gerak (Motion):** Menggunakan efek paralaks tingkat menengah (_medium parallax_) pada bagian _hero_ dan elemen yang berlapis; sepenuhnya menghormati pengaturan `prefers-reduced-motion` pengguna dan tidak melakukan manipulasi paksa terhadap perilaku gulir (_scroll hijacking_).
4. **Penyelarasan B2B:** Katalog khusus untuk institusi B2B; tidak menyertakan elemen _e-commerce_ untuk konsumen (tidak ada keranjang belanja, proses _checkout_, atau akun pengguna).
5. **Integritas Data:** Hanya mencakup 4 kategori yang telah dikonfirmasi.
