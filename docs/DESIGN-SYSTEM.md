<!-- @format -->

# Sistem Desain — Angkasa Raya Medika

**Arah:** _Turquoise_ yang Tegas + Efek Paralaks Menengah
**Kata Kunci:** Ilmiah yang tegas, otoritatif, kedalaman yang dinamis, presisi, bergaya editorial, kejelasan tinggi
**Prinsip Desain:** Mengekspresikan presisi ilmiah yang otoritatif melalui energi warna _turquoise_ yang mencolok, ruang kosong (_whitespace_) bergaya editorial, kedalaman berlapis, serta pengendalian ketat untuk menghindari elemen dekoratif yang tidak perlu.

---

## 1. Arah Visual & Filosofi Merek

Angkasa Raya Medika meninggalkan estetika warna biru korporat yang steril dan generik untuk menghadirkan **identitas ilmiah yang tegas dan distingtif**. Antarmukanya terasa seperti perpaduan antara publikasi ilmiah bergengsi dan produsen instrumen berpresisi tinggi.

### Pilar Utama

1. **Dominasi _Turquoise_ yang Tegas:** _Scientific Turquoise_ (`#08AEB3`) berfungsi sebagai jangkar visual utama—menarik perhatian pada elemen _hero_, titik navigasi aktif, tombol _call-to-action_ (CTA) utama, dan status interaktif. Warna ini jauh lebih tegas dan menonjol dibandingkan iterasi sebelumnya.
2. **Warna _Deep Navy_ yang Otoritatif:** _Deep Navy_ (`#123B5D`) menyeimbangkan energi warna _turquoise_, memberikan kesan institusional yang kokoh pada judul, bagian struktural yang gelap, serta CTA sekunder.
3. **Latar _Soft Ivory_:** _Soft Ivory_ (`#F7F7F2`) menggantikan warna abu-abu klinis atau putih murni yang terlalu tajam sebagai latar utama, memberikan kesan hangat, tekstur yang terasa nyata, serta keterbacaan yang tinggi. Warna putih murni (_Pure White_ — `#FFFFFF`) hanya digunakan untuk permukaan konten yang membutuhkan ketajaman visual.
4. **Aksen _Warm Amber_ yang Terukur:** _Warm Amber_ (`#F2A23A`) digunakan dengan sangat disiplin—khusus untuk peringatan prioritas tinggi, kutipan penting, dan penanda (_badge_) mikro yang krusial.
5. **Tipografi Editorial & Ruang Kosong Asimetris:** Kontras kuat antara tipografi _Manrope_ yang geometris dan tegas untuk judul, dengan tipografi _DM Sans_ yang fungsional untuk teks teknis; dipadukan dengan ruang kosong yang luas dan terukur, serta tata letak kisi (_grid_) yang asimetris.
6. **Minimalisme Tanpa Elemen Dekoratif Berlebih:** Menghilangkan elemen yang tidak perlu seperti bingkai kartu (_card wrapper_), bayangan (_drop shadow_) yang tebal, kontainer berbentuk kapsul (_pill-shaped_), serta lencana dekoratif yang tidak bermakna. Tata letak mengandalkan garis pemisah (_divider_) setebal 1px, skala tipografi, dan penyelarasan elemen yang disengaja.

---

## 2. Palet Warna & _Token_ (Blue Ocean Pastels Scheme)

Sistem warna mengadopsi palet **Blue Ocean Pastels** yang menghadirkan nuansa bersih, modern, dan bernuansa maritim/laboratorium berpresisi tinggi:

| Nama _Token_ | Kode Hex | Peran & Deskripsi Penggunaan |
| :--- | :--- | :--- |
| **Ocean Blue (Primer)** | `#89CBDD` | Tombol CTA utama, status navigasi aktif, ikon utama, focus ring, filter pill aktif, dan hover aksen. |
| **Pastel Cyan (Sekunder)** | `#ADDFF1` | Border kartu & input, tombol sekunder hover, divider halus, scrollbar thumb, dan aksen pelengkap. |
| **Ice Aqua (Permukaan)** | `#D0F2F9` | Latar belakang tabel spesifikasi, hover container, background toggle tab admin, dan badge sekunder. |
| **Pastel Mist (Latar Belakang)** | `#E9F8FF` | Latar belakang utama seluruh halaman web, background input form, dan track scrollbar. |
| **Seafoam Mint (Aksen Unggulan)** | `#A3EEEC` | Tombol penawaran cepat (RFQ/WhatsApp), lencana terverifikasi resmi, badge instrumen/alat, dan highlight prioritas. |
| **Deep Ocean Navy (Teks Kontras)** | `#0D253A` / `#0D2235` | Teks judul utama (H1–H3), teks tombol di atas pastel (kontras WCAG AAA), dan latar belakang footer/banner. |
| **Ocean Slate (Teks Sekunder)** | `#486581` | Deskripsi produk, label input, metadata, dan breadcrumb. |
| **Pure White** | `#FFFFFF` | Permukaan kartu produk, formulir modal, dan container utama. |

### Panduan Penggunaan Warna

- **Hierarki Tombol (Buttons):**
  - **Tombol Utama (Primary CTA):** Menggunakan gradien halus `from-[#89CBDD] to-[#A3EEEC]` dengan teks `#082838` (tebal) untuk kontras optimal dan kesan visual segar.
  - **Tombol Sekunder:** Menggunakan `bg-[#E9F8FF]` dengan hover `bg-[#D0F2F9]`, border `#ADDFF1`, dan teks `#0D253A`.
  - **Tombol Khusus / RFQ:** Menggunakan `bg-[#A3EEEC]` dengan hover `bg-[#8EE2E0]` dan teks `#053B3A`.
- **Latar Belakang & Permukaan:** Seluruh halaman menggunakan `bg-[#E9F8FF]` dipadukan kartu putih `bg-white` berbingkai halus `border-[#D0F2F9]`.
- **Aksesibilitas Kontras:** Warna teks di atas tombol atau badge pastel selalu menggunakan Deep Navy (`#082838` / `#0D2235`) untuk memastikan rasio kontras melebihi standar WCAG AA (rasio kontras > 7:1).

---

## 3. Sistem Tipografi

Sistem desain ini secara ketat menggunakan **dua keluarga fon**:

- **Manrope:** Fon _sans-serif_ yang geometris, modern, dan sangat mudah dibaca; digunakan untuk judul (_headings_), identitas merek, label navigasi, dan tombol ajakan bertindak (_CTA_).
- **DM Sans:** Fon _sans-serif_ yang dirancang dengan presisi dan tampilan bersih; digunakan untuk isi teks (_body copy_), deskripsi produk, tabel spesifikasi teknis, kolom formulir, dan metadata.

### Skala Tipografi (Desktop & Responsif)

| Tingkat                      | Keluarga Fon | Ukuran (Desktop) | Ketebalan (_Weight_) | Tinggi Baris | Spasi Huruf (_Tracking_) |
| ---------------------------- | ------------ | ---------------- | -------------------- | ------------ | ------------------------ | --- | ---- | ------- |
| **Hero Display**             | Manrope      | 56–68px          | 800 (ExtraBold)      | 1,08         | -0,03em                  |
| **H1 (Judul Halaman)**       | Manrope      | 42–50px          | 700 (Bold)           | 1,15         | -0,02em                  |
| **H2 (Judul Bagian)**        | Manrope      | 30–38px          | 700 (Bold)           | 1,20         | -0,015em                 |
| **H3 (Sub-judul / Kartu)**   | Manrope      | 20–24px          | 600 (SemiBold)       | 1,30         | -0,01em                  |
| **Paragraf Pembuka**         | DM Sans      | 18–20px          | 400 (Regular)        | 1,60         | normal                   |
| **Teks ​​Isi (_Body Text_)** | DM Sans      | 15–16px          | 400 (Regular)        | 1,65         | normal                   |
| **Teknis / Spesifikasi**     | DM Sans      | 13–14px          | 500 (Medium)         | —            | —                        |     | 1.50 | +0.01em |
| **Micro / Eyebrow**          | Manrope      | 11–12px          | 700 (Bold)           | 1.40         | +0.08em (Huruf Kapital)  |

---

## 4. Tata Letak, Grid & Asimetri

- **Lebar Kontainer:** Lebar maksimum responsif standar sebesar `1280px` (`max-w-7xl`) dengan _gutter_ horizontal `px-4 sm:px-6 lg:px-8`.
- **Grid 12-Kolom:** Bagian untuk desktop menggunakan grid 12-kolom fleksibel yang memungkinkan ketegangan visual asimetris (contoh: teks editorial selebar 5 kolom disandingkan dengan area gambar selebar 7 kolom).
- **Ritme Spasial 8px:** Semua pengaturan jarak wajib mengikuti kelipatan 8px (`space-y-4`, `py-16`, `gap-8`, `py-24`).
- **Ruang Vertikal yang Luas:** Bagian-bagian besar menggunakan margin vertikal `py-20` hingga `py-28`, sehingga tipografi yang tegas dan elemen visual dapat menempati ruang tanpa terlihat penuh sesak.
- **Struktur Minimalis & Tanpa Border:** Tidak menggunakan garis tepi atau bingkai kontainer yang berat. Batasan visual diciptakan melalui kontras tonal latar belakang, ritme spasial, dan elevasi halus.

### 4.1 Skala Geometris & Proporsi Border-Radius (Nested Radius Scale)

Untuk menciptakan estetika modern tanpa garis tepi (*borderless*), sistem menggunakan hierarki kelengkungan sudut yang proporsional secara bersarang (*nested radius rule*):

| Kelas Tailwind | Ukuran Pixel | Peruntukan Komponen | Karakter Visual |
| :--- | :--- | :--- | :--- |
| **`rounded-md`** | `6px` | Tag teknis, indikator kecil | Rapi, tajam, ringkas |
| **`rounded-lg`** | `8px` | Kolom input formulir, tombol aksi di dalam kartu/modal | Profesional, fungsional |
| **`rounded-xl`** | `12px` | Image stage produk (di dalam card), baris tabel dinamis, dropdown | Transisi proporsional |
| **`rounded-2xl`** | `16px` | Kartu produk (`ProductCard`), kartu kategori, metrik dashboard | Ramah (*friendly*), modern |
| **`rounded-3xl`** | `24px` | Jendela modal utama (`QuoteModal`), banner CTA besar, overview card | Lembut, lapang, berkelas |
| **`rounded-full`**| `9999px`| Badge status verifikasi, pill filter kategori, tombol floating | Bersih, tegas, dinamis |

> **Prinsip Proporsi Bersarang (*Nested Rule*):**  
> Ketika kontainer luar menggunakan kelengkungan besar (misal `rounded-2xl` dengan padding), elemen gambar atau sub-kontainer di dalamnya menggunakan satu tingkat lebih kecil (`rounded-xl`) sehingga lengkungan konsentris tampak harmonis dan presisi ($R_{\text{inner}} \approx R_{\text{outer}} - \text{padding}$).

---

## 5. Animasi & Arah Paralaks (Intensitas Menengah)

Animasi dijalankan menggunakan **Motion for Vue (`motion-v`)**. Tingkat intensitas yang ditetapkan adalah **MENENGAH (MEDIUM)**: terarah, terasa nyata, dan spasial—menciptakan kesan kedalaman yang presisi tanpa efek yang berlebihan layaknya permainan atau pertunjukan sirkus.

### 5.1 Paralaks & Pergerakan Berlapis

- **Paralaks Gambar Utama (Hero):** Saat pengguna menggulir halaman ke bawah, gambar utama dan lapisan grafis akan bergerak dengan kecepatan yang berbeda (faktor kecepatan $0,15\times$ hingga $0,3\times$) dibandingkan dengan teks di latar depan.
- **Pergerakan Gulir Berlapis:** Aksen geometris di latar belakang dan kartu produk di latar depan menampilkan pergeseran kedalaman yang halus di berbagai bidang (multi-plane). - **Pergeseran Gambar Halus (Subtle Image Drift):** Gambar produk di area unggulan merespons keberadaan kursor atau guliran (scroll) yang mulus dengan pergeseran 2D yang terkendali ($\le 6\text{px}$).

### 5.2 Kemunculan Berdasarkan Guliran (Scroll-Triggered Reveals)

- **Kemunculan Judul Bagian:** Pergeseran vertikal yang luwes ($y: 24\text{px} \rightarrow 0$) disertai dengan perubahan opasitas ($0 \rightarrow 1$) selama 500ms, menggunakan kurva percepatan kustom (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Kemunculan Kartu Secara Bertahap (Staggered Entries):** Pada kisi produk atau tampilan kategori, elemen-elemen di dalamnya muncul secara berurutan dengan jeda waktu (`stagger delay`) sebesar `50ms–80ms`.
- **Perluasan Garis Pemisah (Hairline Divider Expansion):** Garis pemisah struktural mengalami perubahan skala horizontal secara halus ($scaleX: 0 \rightarrow 1$) saat memasuki area pandang (_viewport_).

### 5.3 Interaksi Mikro & Status Kursor (Hover States)

- **Interaksi Tombol:**
- Tombol Utama (Warna Pirus/Turquoise): Saat kursor diarahkan (_hover_), tombol akan sedikit terangkat dengan efek cahaya (`translateY(-2px)`) dan bayangan yang lebih pekat (`0 8px 20px -4px rgba(8, 174, 179, 0.35)`).
- Ikon Panah pada Tombol: Bergeser $+4\text{px}$ secara horizontal saat kursor diarahkan, dengan efek pegas (_spring physics_) yang tajam dan responsif.
- **Interaksi Kartu Produk (_Hover_):** Gambar produk mengalami perubahan skala secara halus ($1,02\times$ hingga $1,03\times$) selama 350ms, sementara kontainer kartu sedikit terangkat atau warna garis tepinya (_border_) berubah menjadi warna Pirus.
- **Transisi _Header_ Saat Digulir:** Setelah digulir lebih dari 20px, latar belakang _header_ akan berubah secara mulus dari transparan/padat menjadi efek buram ala kaca (_glassmorphic blur_ — `backdrop-blur-md bg-white/90 border-b border-[#DDE6ED]`).

### 5.4 Pembatasan Gerakan & Aksesibilitas

- **Tidak Ada Pengambilalihan Guliran (_No Scroll Hijacking_):** Kecepatan dan momentum guliran bawaan peramban (_browser_) tidak boleh diubah atau diganggu.
- **Tidak Ada Efek Memantul atau Bergetar (_No Bouncing or Jitter_):** Hindari osilasi pegas dengan faktor pantulan yang berlebihan. - **Penerapan `prefers-reduced-motion`:** Saat `prefers-reduced-motion: reduce` aktif, semua pergeseran paralaks, translasi, dan transisi bertahap (staggered transitions) akan langsung ditiadakan; elemen akan ditampilkan dalam kondisi akhir (posisi diam) dengan transisi opasitas instan saja.

---

## 6. Spesifikasi Komponen

### 6.1 Header Navigasi Global

- **Struktur:** Logo di sisi kiri, tautan navigasi di tengah (Katalog, Tentang, Kontak), dan tombol ajakan bertindak (CTA) "Minta Penawaran" yang ditempatkan di sisi kanan.
- **Gaya:** Dasar berwarna _Soft Ivory_ (gading lembut) atau putih; berubah menjadi `bg-white/90 backdrop-blur-md border-b border-[#DDE6ED]` saat halaman digulir (_scroll_).
- **Status Tautan Aktif:** Ditandai dengan garis bawah berwarna _Scientific Turquoise_ (`#08AEB3`) yang disertai animasi tata letak yang halus.
- **Menu Seluler:** Berupa tampilan layar penuh atau panel geser (_sliding drawer_) yang dilengkapi dengan fitur aksesibilitas _keyboard-trap_ dan indikator fokus yang jelas.

### 6.4 Komponen Tombol Dasar

- **Tombol Utama (_Primary Button_):**
- Latar belakang: _Scientific Turquoise_ (`#08AEB3`)
- Teks: Putih (`#FFFFFF`), jenis huruf Manrope _SemiBold_ (ketebalan 600)
- Saat diarahkan kursor (_hover_): Warna _Turquoise_ yang lebih gelap (`#07989C`) dengan efek cahaya _cyan_ yang lembut.
- Sudut: Membulat halus (`rounded-lg`, sekitar 6px).
- **Tombol Sekunder (_Secondary Button_):**
- Latar belakang: Transparan atau _Soft Ivory_.
- Garis tepi (_border_): 1,5px solid dengan warna _Deep Navy_ (`#123B5D`).
- Teks: _Deep Navy_ (`#123B5D`), jenis huruf Manrope _SemiBold_.
  ​​ - Saat diarahkan kursor (_hover_): Latar belakang berubah menjadi _Deep Navy_ dengan teks berwarna putih.
- **Tautan Teks / _Ghost Button_:**
- Teks: Berwarna _Deep Navy_ dengan ikon panah berwarna _Turquoise_; saat diarahkan kursor (_hover_), panah akan bergeser sejauh $+4\text{px}$.

### 6.3 Katalog Produk & Komponen Kartu (_Card_)

- **Wadah (_Container_):** Permukaan berwarna putih bersih yang dibingkai dengan garis tepi tipis 1px (`border-[#DDE6ED]`). Tidak menggunakan bayangan (_drop shadow_) yang mencolok. - **Bingkai Gambar:** Rasio aspek tetap ($4:3$ atau $1:1$) dengan latar belakang warna abu-abu muda netral/gading (`bg-[#F0F4F8]`).
- **Label Kategori (Eyebrow):** Teks berukuran kecil dalam huruf kapital dengan warna _Scientific Turquoise_ (`#08AEB3`).
- **Judul Produk:** Font Manrope 18px _SemiBold_, dengan warna _Deep Navy_ yang kontras tinggi.
- **Pratinjau Spesifikasi:** 2–3 poin fitur utama....atribut (misalnya, Tingkat Kemurnian/Grade, Ukuran Kemasan) dalam format tabel yang ringkas.
- **CTA:** Tautan atau tombol "Minta Penawaran" (Request Quote) yang memicu munculnya modal penawaran kontekstual.

### 6.4 Tabel Spesifikasi (Detail Produk)

- **Struktur:** Menggunakan pola selang-seling (_zebra striping_) yang halus atau garis pembatas horizontal tipis (1px).
- **Label:** Font DM Sans Medium, warna teks redup (`#5C7184`).
- **Nilai:** Font DM Sans Regular, warna teks gelap (`#0D2235`).
- **Gaya _Placeholder_:** Atribut yang belum diverifikasi akan ditampilkan dengan penanda (_badge_) bergaris putus-putus yang tampak redup:
  `[PLACEHOLDER: Menunggu Verifikasi]`.

### 6.5 Formulir & Modal Permintaan Informasi

- **Gaya Kolom Input:** Latar belakang putih bersih, garis tepi 1px (`border-[#DDE6ED]`), teks DM Sans ukuran 15px.
- **Status Fokus (_Focus State_):** Bingkai (_ring_) setebal 2px dengan warna _Scientific Turquoise_ (`ring-2 ring-[#08AEB3]/40 border-[#08AEB3]`).
- **Pesan Validasi:** Teks berwarna merah (`#E53E3E`) yang jelas di bawah kolom input; kolom yang mengalami kesalahan (_error_) akan menampilkan garis tepi berwarna merah.
- **Latar Belakang Modal (_Backdrop_):** Warna _Deep Navy_ dengan efek buram (_blur_) yang kuat (`bg-[#123B5D]/60 backdrop-blur-sm`).

---

## 7. Standar Citra & Aset Ilmiah

- **Mengutamakan Keaslian:** Prioritaskan penggunaan foto asli dari botol reagen, peralatan laboratorium, dan kemasan resmi yang disediakan oleh pemilik produk.
- **Standar _Placeholder_:** Jika aset resmi belum tersedia, gunakan grafis _placeholder_ yang elegan dan minimalis, menampilkan garis geometris yang bersih, kisi-kisi ilmiah yang halus, serta tipografi kategori.
- **Hindari Klise Stok Murahan:** Dilarang keras menggunakan gambar stok generik seperti orang yang berpura-pura menjadi tenaga medis sambil tersenyum, ilustrasi kartun gelas kimia, animasi untaian DNA 3D yang tidak relevan, atau lencana/label palsu.
- **Optimasi Gambar:** Semua aset harus disajikan menggunakan format web modern (WebP/AVIF) dengan atribut `width` dan `height` yang ditentukan secara eksplisit untuk mencegah pergeseran tata letak (_Cumulative Layout Shift_ atau CLS). ## 8. Standar Kualitas & Eksekusi

Implementasi harus memancarkan **kepercayaan diri yang tenang, otoritas teknis, dan presisi ilmiah modern**. Antarmuka ini menghadirkan kesan premium bukan melalui ornamen yang tidak perlu, melainkan lewat ritme tipografi yang sempurna, penyelarasan yang sangat presisi, aksen warna pirus (turquoise) yang tegas, serta gerakan paralaks yang halus dengan intensitas sedang.
