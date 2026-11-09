<!-- @format -->

# Alur Pengguna (User Flows) — Fangkasa-raya-nuxt (Nuxt 4)

**Status Dokumen:** Disetujui untuk Arsitektur Nuxt 4 (v2.0)
**Model Bisnis:** Profil Perusahaan B2B Murni & Katalog Produk Ilmiah
**Tindakan Komersial Utama:** Permintaan Penawaran (RFQ) & Pertanyaan Langsung dari Institusi
**Nuansa Pengalaman:** Presisi Ilmiah yang Tegas, Kedalaman Paralaks Berlapis, Tanpa Hambatan (Zero Friction)

---

## 1. Alur Penemuan & Permintaan Penawaran B2B Utama

Perjalanan konversi utama memandu petugas pengadaan (procurement), manajer laboratorium, dan peneliti mulai dari tahap penemuan awal hingga pengajuan permintaan penawaran resmi:

````mermaid
sequenceDiagram
autonumber
actor Buyer as Pembeli B2B (Bagian Pengadaan / Direktur Lab)
participant Home as Beranda (Nuxt 4 SSG)
participant Catalog as Katalog Produk (/products)
participant Detail as Detail Produk (/products/[slug])
participant Modal as Modal Permintaan Penawaran (RFQ)
participant Nitro as Server Nitro (/api/inquiries)

Buyer->>Home: Tiba di Beranda (Menampilkan elemen *hero* berwarna pirus tegas & efek paralaks)
Home->>Buyer: Menyampaikan kapabilitas ilmiah & kategori produk terverifikasi
Buyer->>Catalog: Mengeklik "Jelajahi Katalog" atau memilih kategori tertentu
Catalog->>Buyer: Menampilkan kisi 12-kolom dengan filter kategori aktif & pencarian langsung
Buyer->>Detail: Memilih kartu produk spesifik
Detail->>Buyer: Menampilkan tabel spesifikasi terverifikasi & pilihan ukuran kemasan
Buyer->>Modal: Mengeklik "Minta Penawaran" (Request a Quote)
Modal->>Buyer: Menampilkan formulir dengan Nama Produk & SKU yang sudah terisi otomatis
Buyer->>Modal: Memasukkan data Perusahaan, Email Kantor, Kuantitas, dan Persyaratan
Buyer->>Nitro: Mengirimkan permintaan penawaran
Nitro-->>Modal: Memvalidasi skema, memeriksa *honeypot* (keamanan), dan mencatat pengajuan
Modal-->>Buyer: Menampilkan konfirmasi resmi serta estimasi waktu respons

---

### Langkah-langkah Detail:
1. **Kedatangan & Orientasi:** Pengguna tiba di halaman `/`. Aksen warna pirus yang tegas serta efek paralaks halus pada bagian *hero* mencerminkan ketelitian ilmiah dan keandalan modern. 2. **Eksplorasi Katalog:** Pembeli menuju ke `/products` melalui tautan di header atau tombol ajakan bertindak (CTA) utama.
3. **Penyaringan & Pencarian:** Pembeli melakukan penyaringan berdasarkan 4 kategori yang telah ditetapkan (`New Standard Reagent`, `Standard Reagent`, `Reagents`, `Esight`) atau menggunakan fitur pencarian instan dengan mekanisme *debounce*.
4. **Evaluasi Spesifikasi:** Pembeli membuka halaman detail produk (`/products/[slug]`) untuk meninjau tingkat kualitas kimia (*chemical grade*) yang terverifikasi, konfigurasi kemasan, serta tautan ke lembar data keselamatan bahan (*Safety Data Sheet* atau SDS).
5. **Pemicu Penawaran Kontekstual:** Pembeli mengeklik "Request a Quote" (Minta Penawaran). Jendela *modal* RFQ akan langsung muncul tanpa perlu berpindah halaman.
6. **Pengisian Formulir Otomatis:** Jendela *modal* secara otomatis memuat nama produk dan SKU yang sedang dilihat. Pembeli kemudian melengkapi data institusi, perkiraan jumlah pesanan, dan pertanyaan spesifik lainnya.
7. **Konfirmasi Pengiriman:** Setelah divalidasi oleh server melalui `/api/inquiries`, pembeli akan menerima konfirmasi instan yang menyertakan ID referensi permintaan, serta opsi untuk menghubungi melalui WhatsApp jika terdapat kebutuhan mendesak.

---

## 2. Alur Riset Perusahaan untuk Institusi

Bagi evaluator institusi dan komite pengadaan rumah sakit yang sedang menilai kredibilitas pemasok:

```mermaid
flowchart TD
Start["Pembeli Tiba di Beranda"] --> NavAbout["Memilih Navigasi 'About' (Tentang Kami)"]
NavAbout --> AboutPage["Halaman 'About' (/about)\n• Gambaran Umum & Misi Perusahaan\n• Fokus pada Standar Diagnostik & Laboratorium\n• Posisi Operasional yang Terverifikasi"]
AboutPage --> CredCheck{"Evaluasi Kapabilitas"}
CredCheck --> DirectContact["Mengeklik CTA 'Contact Us' (Hubungi Kami)"]
CredCheck --> CatalogBrowse["Menuju ke Katalog Produk"]
DirectContact --> ContactPage["Halaman Kontak (/contact)\n• Email Resmi\n• WhatsApp Langsung\n• Koordinat Lokasi Fasilitas"]
````

### Langkah-langkah Detail:

1. Evaluator tiba di halaman `/` dan memilih menu "About" (Tentang Kami).
2. Pada halaman `/about`, evaluator meninjau misi operasional Fangkasa-raya-nuxt, komitmen terhadap presisi analitis, serta sektor industri yang dilayani (pusat diagnostik, rumah sakit, dan lembaga penelitian).
3. Sertifikasi atau perjanjian distribusi yang belum terverifikasi akan ditandai dengan label khusus, guna menjaga transparansi penuh bagi pihak institusi. 4. Evaluator dapat langsung beralih ke `/contact` untuk memulai korespondensi resmi dengan vendor, atau ke `/products` untuk meninjau reagen tertentu.

---

## 3. Alur Kontak Langsung & Permintaan Informasi melalui Berbagai Saluran

Dirancang untuk klien lama atau permintaan pasokan B2B mendesak yang memerlukan interaksi langsung secara cepat:

```mermaid
flowchart LR
Visitor["Pengunjung B2B"] --> ContactPage["Halaman Kontak (/contact)"]
ContactPage --> Choice{"Saluran yang Dipilih"}

Choice -->|Formulir Digital| FormSubmit["Formulir Permintaan B2B Umum\n• Nama & Perusahaan\n• Email Kantor & Telepon\n• Ringkasan Kebutuhan"]
Choice -->|Pesan Instan| WhatsApp["Tautan WhatsApp Langsung\n(Pesan permintaan B2B yang telah disiapkan)"]
Choice -->|Email Langsung| EmailSales["Tautan Email Penjualan Resmi\n(placeholder: sales@...)"]

FormSubmit --> API["Validasi Server Nitro"]
API --> Success["Pemberitahuan Pengiriman Berhasil"]
```

### Detail Saluran:

- **Formulir Permintaan Umum:** Mengumpulkan kebutuhan proyek secara terstruktur
