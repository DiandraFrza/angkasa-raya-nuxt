-- ========================================================
-- Angkasa Karya Medika - MySQL Database Schema & Seed
-- Laragon MySQL / MariaDB compatible
-- Database: angkasa_raya_medika
-- Total Products: 9
-- ========================================================

CREATE DATABASE IF NOT EXISTS `angkasa_raya_medika` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `angkasa_raya_medika`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `site_settings`;
DROP TABLE IF EXISTS `inquiries`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `categories` (
  `id` varchar(64) NOT NULL,
  `slug` varchar(128) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `is_instrument` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `products` (
  `id` varchar(64) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category_slug` varchar(128) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `sku` varchar(64) NOT NULL,
  `brand` varchar(128) DEFAULT 'Angkasa Karya Medika',
  `grade` varchar(128) DEFAULT '',
  `cas_number` varchar(64) DEFAULT '',
  `chemical_formula` varchar(128) DEFAULT '',
  `short_description` text DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `packaging_json` longtext DEFAULT NULL,
  `specifications_json` longtext DEFAULT NULL,
  `documents_json` longtext DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_verified` tinyint(1) NOT NULL DEFAULT 1,
  `lead_time` varchar(128) DEFAULT 'Ready Stock Jabodetabek',
  `min_order_quantity` varchar(128) DEFAULT '1 Box',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_products_slug` (`slug`),
  KEY `idx_products_category` (`category_slug`),
  KEY `idx_products_sku` (`sku`),
  KEY `idx_products_featured` (`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `inquiries` (
  `id` varchar(64) NOT NULL,
  `full_name` varchar(128) NOT NULL,
  `company_or_institution` varchar(255) NOT NULL,
  `work_email` varchar(191) NOT NULL,
  `phone_number` varchar(64) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `product_slug` varchar(191) DEFAULT NULL,
  `estimated_quantity` varchar(128) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `site_settings` (
  `key` varchar(128) NOT NULL,
  `value` longtext NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`, `slug`, `name`, `description`, `is_instrument`) VALUES ('cat-1', 'new-standard-reagent', 'New Standard Reagent', 'Bahan standar formulasi terbaru dengan sertifikasi kemurnian tinggi untuk kalibrasi dan validasi hasil pengujian.', 0);
INSERT INTO `categories` (`id`, `slug`, `name`, `description`, `is_instrument`) VALUES ('cat-2', 'standard-reagent', 'Standard Reagent', 'Reagen acuan analitis untuk prosedur kontrol kualitas (QC) berkala di laboratorium diagnostik dan riset.', 0);
INSERT INTO `categories` (`id`, `slug`, `name`, `description`, `is_instrument`) VALUES ('cat-3', 'reagents', 'Reagents', 'Reagen diagnostik cepat (RDT), larutan buffer, dan bahan kimia esensial untuk pemeriksaan laboratorium harian.', 0);
INSERT INTO `categories` (`id`, `slug`, `name`, `description`, `is_instrument`) VALUES ('cat-4', 'esight', 'Esight', 'Lini instrumen dan alat diagnostik laboratorium otomatis untuk mendukung akurasi dan kecepatan pemeriksaan.', 1);

INSERT INTO `products` (`id`, `slug`, `name`, `category_slug`, `category_name`, `sku`, `brand`, `grade`, `cas_number`, `chemical_formula`, `short_description`, `description`, `packaging_json`, `specifications_json`, `documents_json`, `image_url`, `is_featured`, `is_verified`, `lead_time`, `min_order_quantity`) VALUES ('prod-hbsag-ecotest', 'hbsag-test-ecotest-rapid', 'HBSAG Test ECOTEST Rapid Cassette', 'reagents', 'Reagents', 'ARM-RDT-HBSAG50', 'ECOTEST', 'Clinical Diagnostic Grade', '', '', 'Uji diagnostik cepat kualitatif untuk deteksi Hepatitis B Surface Antigen (HBsAg) pada spesimen darah, serum, atau plasma.', 'ECOTEST HBsAg Rapid Diagnostic Test adalah perangkat uji imunokromatografi membran untuk deteksi kualitatif Hepatitis B Surface Antigen (HBsAg) dalam darah utuh, serum, atau plasma. Diformulasikan khusus untuk skrining cepat fasilitas kesehatan, laboratorium klinis, dan rumah sakit dengan batas deteksi sensitif dan visualisasi hasil yang jelas dalam 15 menit. Terdaftar resmi di Kementerian Kesehatan Republik Indonesia.', '[{"size":"50","unit":"Strip/Test per Box","container":"Box Karton Segel Pabrik"}]', '[{"label":"Tipe Spesimen","value":"Blood / Serum / Plasma","isVerified":true},{"label":"Parameter Deteksi","value":"Hepatitis B Diagnostic (HBsAg)","isVerified":true},{"label":"Format Pengujian","value":"Rapid Diagnostic Test (Cassette)","isVerified":true},{"label":"Waktu Pembacaan","value":"15 - 20 Menit","isVerified":true},{"label":"Regulasi","value":"Kementerian Kesehatan RI (Izin Edar AKD)","isVerified":true},{"label":"Suhu Penyimpanan","value":"2°C - 30°C (Jangan Dibekukan)","isVerified":true},{"label":"Sensitivitas Relatif","value":"> 99.0% [Terverifikasi]","isVerified":true},{"label":"Spesifisitas Relatif","value":"> 99.0% [Terverifikasi]","isVerified":true}]', '[{"title":"Brosur Teknis ECOTEST HBsAg","type":"Brosur Teknis","fileUrl":"/images/products/ecotest-hbsag-flyer.png","fileSize":"Format Brosur Resmi"},{"title":"Izin Edar Kemenkes RI","type":"Izin Edar Kemenkes","fileUrl":"#","fileSize":"Tersedia atas Permintaan"}]', '/images/products/ecotest-hbsag-flyer.png', 1, 1, 'Ready Stock Jabodetabek', '1 Box (50 Test)');
INSERT INTO `products` (`id`, `slug`, `name`, `category_slug`, `category_name`, `sku`, `brand`, `grade`, `cas_number`, `chemical_formula`, `short_description`, `description`, `packaging_json`, `specifications_json`, `documents_json`, `image_url`, `is_featured`, `is_verified`, `lead_time`, `min_order_quantity`) VALUES ('prod-esight-clia-800', 'esight-auto-clia-analyzer-800', 'Esight CLIA-800 Auto-Immunoassay Analyzer', 'esight', 'Esight', 'ARM-INS-ES800', 'Esight', 'Automated Diagnostic Instrument', '', '', 'Alat analyzer imunologi chemiluminescence otomatis untuk throughput menengah dengan akurasi dan reproduktifitas tinggi.', 'Esight CLIA-800 adalah sistem analyzer imunologi berbasis kemiluminesens otomatis penuh yang dirancang untuk laboratorium sentral dan rumah sakit. Menawarkan penanganan sampel otomatis, pemindaian barcode reagen terintegrasi, dan presisi tinggi untuk deteksi penanda tumor, fungsi tiroid, hormon reproduksi, dan infeksi menular.', '[{"size":"1","unit":"Unit Instrumen Utama + Starter Kit Reagen","container":"Peti Kayu Ekspor Standar"}]', '[{"label":"Throughput Uji","value":"Hingga 120 uji/jam","isVerified":true},{"label":"Kapasitas Sampel","value":"60 posisi tabung primer dengan identifikasi barcode","isVerified":true},{"label":"Posisi Reagen","value":"20 posisi dengan sistem pendingin 24 jam","isVerified":true},{"label":"Metode Pengukuran","value":"Chemiluminescence Immunoassay (CLIA)","isVerified":true},{"label":"Konektivitas","value":"Dukungan LIS / HIS dua arah via TCP/IP","isVerified":true},{"label":"Catu Daya","value":"220V AC, 50/60 Hz","isVerified":true}]', '[{"title":"Spesifikasi Teknis Alat Esight CLIA-800","type":"TDS","fileUrl":"#","fileSize":"PDF (Atas Permintaan)"}]', '/brand/logo_akm.jpg', 1, 1, '1 - 2 Minggu Pengiriman & Instalasi Jabodetabek', '1 Unit');
INSERT INTO `products` (`id`, `slug`, `name`, `category_slug`, `category_name`, `sku`, `brand`, `grade`, `cas_number`, `chemical_formula`, `short_description`, `description`, `packaging_json`, `specifications_json`, `documents_json`, `image_url`, `is_featured`, `is_verified`, `lead_time`, `min_order_quantity`) VALUES ('prod-esight-rtr-200', 'esight-rapid-reader-200', 'Esight RTR-200 Portable Rapid Test Reader', 'esight', 'Esight', 'ARM-INS-ES200', 'Esight', 'Digital Point-of-Care Instrument', '', '', 'Alat pembaca digital strip rapid test portabel untuk standardisasi hasil uji dan eliminasi variabilitas pembacaan mata manusia.', 'Esight RTR-200 merupakan alat pembaca portabel berbobot ringan yang menggunakan sensor optik CMOS untuk menganalisis intensitas garis kaset rapid test secara kuantitatif dan semi-kuantitatif. Menghasilkan pencatatan data otomatis dan dapat langsung diekspor ke printer lab atau sistem rekam medis.', '[{"size":"1","unit":"Unit Portabel Reader + Power Adapter + Kaset Kalibrasi","container":"Koper Hardcase Pelindung"}]', '[{"label":"Metode Pembacaan","value":"Reflectance Photometry Optik CMOS","isVerified":true},{"label":"Waktu Analisis","value":"Kurang dari 10 detik per strip","isVerified":true},{"label":"Layar Tampilan","value":"Layar Sentuh LCD 5 inci Berwarna","isVerified":true},{"label":"Kapasitas Memori","value":"Menyimpan hingga 10.000 riwayat hasil pengujian","isVerified":true},{"label":"Port Antarmuka","value":"USB 2.0, RS232, dan Bluetooth","isVerified":true}]', '[{"title":"Manual Ringkas Penggunaan RTR-200","type":"Brosur Teknis","fileUrl":"#","fileSize":"Tersedia"}]', '/brand/logo_akm.jpg', 0, 1, 'Ready Stock Jabodetabek', '1 Unit');
INSERT INTO `products` (`id`, `slug`, `name`, `category_slug`, `category_name`, `sku`, `brand`, `grade`, `cas_number`, `chemical_formula`, `short_description`, `description`, `packaging_json`, `specifications_json`, `documents_json`, `image_url`, `is_featured`, `is_verified`, `lead_time`, `min_order_quantity`) VALUES ('prod-bsa-ultra-pure', 'bovine-serum-albumin-standard-grade', 'Albumin Bovine Serum Standard (BSA Ultra Pure 99%)', 'new-standard-reagent', 'New Standard Reagent', 'ARM-NSR-BSA100', 'Angkasa Karya Medika', 'Ultra Pure Analytical Grade (≥ 98.5%)', '9048-46-8', 'N/A (Bovine Protein)', 'Bahan standar albumin fraksi V dengan kemurnian tinggi untuk kalibrasi kurva baku protein spektrofotometri dan ELISA.', 'Albumin Serum Sapi (BSA) Ultra Pure dari Angkasa Karya Medika diproduksi melalui proses fraksinasi panas terkontrol yang menghasilkan sediaan bebas protease dan nuklease. Ideal digunakan sebagai standar kalibrasi kuantisasi protein total, agen pemblokir imunohistokimia, serta stabilizer larutan enzim reagen.', '[{"size":"100","unit":"gram","container":"Botol Kaca Amber Kedap Udara"},{"size":"500","unit":"gram","container":"Botol Kaca Amber Kedap Udara"}]', '[{"label":"Kemurnian (Elektroforesis)","value":"≥ 98.5%","isVerified":true},{"label":"Kadar Air","value":"< 5.0%","isVerified":true},{"label":"pH (Larutan 1% dalam H2O)","value":"6.8 - 7.2","isVerified":true},{"label":"Aktivitas Nuklease / Protease","value":"Tidak Terdeteksi","isVerified":true},{"label":"Penyimpanan","value":"2°C - 8°C (Simpan di Tempat Kering)","isVerified":true}]', '[{"title":"Certificate of Analysis (COA) BSA","type":"COA","fileUrl":"#","fileSize":"Spesifikasi Batch"},{"title":"Safety Data Sheet (SDS) BSA","type":"SDS","fileUrl":"#","fileSize":"PDF"}]', '/brand/logo_akm.jpg', 1, 1, '3 - 5 Hari Kerja Jabodetabek', '1 Botol (100 gram)');
INSERT INTO `products` (`id`, `slug`, `name`, `category_slug`, `category_name`, `sku`, `brand`, `grade`, `cas_number`, `chemical_formula`, `short_description`, `description`, `packaging_json`, `specifications_json`, `documents_json`, `image_url`, `is_featured`, `is_verified`, `lead_time`, `min_order_quantity`) VALUES ('prod-multi-calibrator', 'multi-calibrator-clinical-chemistry-set', 'Multi-Calibrator Clinical Chemistry Standard Set', 'new-standard-reagent', 'New Standard Reagent', 'ARM-NSR-MCC05', 'Angkasa Karya Medika', 'Certified Reference Material', '', '', 'Satu set standar multi-analit liofilisasi untuk kalibrasi instrumen kimia klinik otomatis pada lebih dari 25 parameter darah rutin.', 'Set kalibrator multi-analit berbasis serum manusia yang telah dititrasi nilai konsentrasinya terhadap metode rujukan internasional IFCC. Dirancang untuk kalibrasi rutin pemeriksaan enzim, substrat metabolik, lipid, dan elektrolit pada berbagai sistem analyzer kimia terbuka.', '[{"size":"6 x 5","unit":"mL Vials","container":"Kit Box dengan Cold Pack"}]', '[{"label":"Bentuk Sediaan","value":"Serum Liofilisasi (Rekonstitusi dengan Aquabidest)","isVerified":true},{"label":"Parameter Terkalibrasi","value":"Glukosa, Kolesterol, Asam Urat, SGOT, SGPT, Ureum, Kreatinin, Bilirubin, dll.","isVerified":true},{"label":"Stabilitas Rekonstitusi","value":"7 hari pada 2°C - 8°C atau 30 hari pada -20°C","isVerified":true},{"label":"Keterlacakan (Traceability)","value":"Tertaut ke Standar Internasional NIST / IFCC","isVerified":true}]', '[{"title":"Tabel Nilai Target Kalibrasi Lot","type":"TDS","fileUrl":"#","fileSize":"Lembar Nilai Lot"}]', '/brand/logo_akm.jpg', 0, 1, 'Ready Stock Jabodetabek', '1 Kit (6 x 5 mL)');
INSERT INTO `products` (`id`, `slug`, `name`, `category_slug`, `category_name`, `sku`, `brand`, `grade`, `cas_number`, `chemical_formula`, `short_description`, `description`, `packaging_json`, `specifications_json`, `documents_json`, `image_url`, `is_featured`, `is_verified`, `lead_time`, `min_order_quantity`) VALUES ('prod-kcl-3m-std', 'potassium-chloride-3m-standard-solution', 'Potassium Chloride 3M Electrolyte Standard Solution', 'standard-reagent', 'Standard Reagent', 'ARM-SR-KCL3M', 'Angkasa Karya Medika', 'Volumetric Analytic Standard', '7447-40-7', 'KCl in H2O', 'Larutan standar elektrolit KCl 3 Molar tersertifikasi untuk pengisian dan kalibrasi elektroda referensi pH dan ion selektif (ISE).', 'Larutan kalibrasi Potassium Chloride 3.0 M disiapkan menggunakan garam analitis ultra-murni dan air deionisasi konduktivitas rendah (< 1 µS/cm). Menghasilkan potensial difusi junction yang stabil dan konsisten untuk elektroda pH kombinasi dan sensor elektrolit otomatis.', '[{"size":"500","unit":"mL","container":"Botol Polietilena Kedap Rembes"},{"size":"1000","unit":"mL","container":"Botol Polietilena Kedap Rembes"}]', '[{"label":"Konsentrasi","value":"3.00 ± 0.02 M pada 20°C","isVerified":true},{"label":"Konduktivitas Spesifik","value":"Tersertifikasi Lot-to-Lot","isVerified":true},{"label":"Bebas Kontaminan Logam Berat","value":"< 5 ppm","isVerified":true},{"label":"Masa Simpan","value":"24 Bulan dalam Kemasan Asli","isVerified":true}]', '[{"title":"COA KCl 3M Solution","type":"COA","fileUrl":"#","fileSize":"Tersedia"}]', '/brand/logo_akm.jpg', 1, 1, 'Ready Stock Jabodetabek', '1 Botol (500 mL)');
INSERT INTO `products` (`id`, `slug`, `name`, `category_slug`, `category_name`, `sku`, `brand`, `grade`, `cas_number`, `chemical_formula`, `short_description`, `description`, `packaging_json`, `specifications_json`, `documents_json`, `image_url`, `is_featured`, `is_verified`, `lead_time`, `min_order_quantity`) VALUES ('prod-glucose-std', 'glucose-reference-standard-solution', 'Glucose Standard Reference Solution (100 mg/dL)', 'standard-reagent', 'Standard Reagent', 'ARM-SR-GLU100', 'Angkasa Karya Medika', 'Certified Reference Material', '50-99-7', 'C6H12O6 in Aqueous Matrix', 'Larutan standar acuan glukosa 100 mg/dL stabil dengan pengawet benzoat untuk kontrol harian metode GOD-PAP dan Hexokinase.', 'Sediaan standar acuan glukosa dengan konsentrasi tepat 100 mg/dL (5.55 mmol/L) yang disiapkan secara gravimetri untuk kalibrasi verifikasi harian fotometer kimia klinik. Mengandung matriks penstabil yang mencegah dekomposisi enzimatik dan pertumbuhan bakteri.', '[{"size":"5 x 10","unit":"mL Ampul Kaca","container":"Tray Karton"}]', '[{"label":"Konsentrasi Terukur","value":"100.0 ± 0.5 mg/dL","isVerified":true},{"label":"Metode Pengukuran","value":"GOD-PAP / Hexokinase Compatible","isVerified":true},{"label":"Penyimpanan","value":"15°C - 25°C Terlindung dari Cahaya","isVerified":true}]', '[{"title":"Sertifikat Analisis Glukosa 100 mg/dL","type":"COA","fileUrl":"#","fileSize":"PDF"}]', '/brand/logo_akm.jpg', 0, 1, 'Ready Stock Jabodetabek', '1 Pack (5 Ampul)');
INSERT INTO `products` (`id`, `slug`, `name`, `category_slug`, `category_name`, `sku`, `brand`, `grade`, `cas_number`, `chemical_formula`, `short_description`, `description`, `packaging_json`, `specifications_json`, `documents_json`, `image_url`, `is_featured`, `is_verified`, `lead_time`, `min_order_quantity`) VALUES ('prod-pbs-10x', 'phosphate-buffered-saline-10x-solution', 'Phosphate Buffered Saline (PBS) 10X Solution pH 7.4', 'reagents', 'Reagents', 'ARM-REA-PBS10X', 'Angkasa Karya Medika', 'Cell Culture & Immunoassay Grade', '', '', 'Larutan konsentrat penyangga PBS 10X steril tersaring 0.2 µm bebas endotoksin untuk pencucian ELISA dan suspensi seluler.', 'Phosphate Buffered Saline 10X adalah larutan garam seimbang berbasis fosfat yang diformulasikan untuk menjaga osmolaritas dan pH stabil (7.4 pada pengenceran 1X). Diproduksi dengan filtrasi membran 0.22 mikron untuk menjamin sterilitas optimal pada pengujian laboratorium imunologi dan kultur sel.', '[{"size":"1000","unit":"mL","container":"Botol HDPE Graduasi"}]', '[{"label":"pH (Pengenceran 1X pada 25°C)","value":"7.4 ± 0.1","isVerified":true},{"label":"Komposisi (1X)","value":"137 mM NaCl, 2.7 mM KCl, 10 mM Na2HPO4, 1.8 mM KH2PO4","isVerified":true},{"label":"Kondisi Sterilitas","value":"Filtered 0.22 µm Sterile","isVerified":true},{"label":"Penyimpanan","value":"Suhu Ruang (15°C - 30°C)","isVerified":true}]', '[{"title":"Lembar Data Keselamatan (SDS) PBS 10X","type":"SDS","fileUrl":"#","fileSize":"Tersedia"}]', '/brand/logo_akm.jpg', 0, 1, 'Ready Stock Jabodetabek', '1 Botol (1 L)');
INSERT INTO `products` (`id`, `slug`, `name`, `category_slug`, `category_name`, `sku`, `brand`, `grade`, `cas_number`, `chemical_formula`, `short_description`, `description`, `packaging_json`, `specifications_json`, `documents_json`, `image_url`, `is_featured`, `is_verified`, `lead_time`, `min_order_quantity`) VALUES ('prod-giemsa-stain', 'giemsa-stain-solution-reagent', 'Giemsa Stain Solution Reagent Ready-to-Use', 'reagents', 'Reagents', 'ARM-REA-GMS500', 'Angkasa Karya Medika', 'Microscopy Diagnostic Staining Grade', '', 'Giemsa in Glycerol-Methanol', 'Reagen larutan pewarna Giemsa siap pakai untuk diferensiasi morfologi sel darah, apusan sumsum tulang, dan deteksi parasit malaria.', 'Reagen pewarna Giemsa dari Angkasa Karya Medika diformulasikan dengan proporsi tepat Azure II-Eosin dan Methylene Blue dalam pelarut metanol-gliserol murni. Memberikan diferensiasi warna kromatin nukleus yang tajam dan kontras sitoplasma optimal pada sediaan apus darah tepi.', '[{"size":"500","unit":"mL","container":"Botol Amber Pelindung Cahaya"}]', '[{"label":"Aplikasi","value":"Pewarnaan Hematologi & Parasitologi (Malaria)","isVerified":true},{"label":"Kelarutan","value":"Dapat Diencerkan dengan Buffer Fosfat pH 6.8 - 7.2","isVerified":true},{"label":"Absorbansi Maksimum (λ1)","value":"645 - 655 nm","isVerified":true},{"label":"Penyimpanan","value":"15°C - 25°C Terlindung dari Sinar Matahari Langsung","isVerified":true}]', '[{"title":"Petunjuk Pewarnaan Giemsa Standar","type":"Brosur Teknis","fileUrl":"#","fileSize":"Lembar Prosedur"}]', '/brand/logo_akm.jpg', 0, 1, 'Ready Stock Jabodetabek', '1 Botol (500 mL)');

INSERT INTO `site_settings` (`key`, `value`) VALUES ('company_name', 'Angkasa Karya Medika');
INSERT INTO `site_settings` (`key`, `value`) VALUES ('company_legal_name', 'PT Angkasa Karya Medika');
INSERT INTO `site_settings` (`key`, `value`) VALUES ('tagline', 'Distribusi Reagen & Alat Laboratorium');
INSERT INTO `site_settings` (`key`, `value`) VALUES ('hero_headline', 'Katalog Reagen dan Bahan Laboratorium dengan Informasi yang Jelas.');
INSERT INTO `site_settings` (`key`, `value`) VALUES ('hero_subheadline', 'Membantu analis dan tim pengadaan menemukan spesifikasi reagen yang tepat sebelum mengajukan penawaran harga resmi.');
INSERT INTO `site_settings` (`key`, `value`) VALUES ('logo_url', '/brand/logo_akm.jpg');
INSERT INTO `site_settings` (`key`, `value`) VALUES ('phone', '021 89086234');
INSERT INTO `site_settings` (`key`, `value`) VALUES ('whatsapp', '6281289086234');
INSERT INTO `site_settings` (`key`, `value`) VALUES ('email', 'angkasakaryamedika@gmail.com');
INSERT INTO `site_settings` (`key`, `value`) VALUES ('address', 'Perumahan Sentul Indah Residence Blok A No. 1, Cikeas, Sukaraja, Bogor, Jawa Barat, 16710');
INSERT INTO `site_settings` (`key`, `value`) VALUES ('operating_hours', 'Senin - Jumat, 08.30 - 17.00 WIB');
INSERT INTO `site_settings` (`key`, `value`) VALUES ('distribution_focus', 'Prioritas Wilayah Jabodetabek & Pasokan Nasional');
INSERT INTO `site_settings` (`key`, `value`) VALUES ('regulation_info', 'Kementerian Kesehatan RI (Izin Edar Resmi AKD)');

INSERT INTO `inquiries` (`id`, `full_name`, `company_or_institution`, `work_email`, `phone_number`, `product_name`, `product_slug`, `estimated_quantity`, `message`, `created_at`) VALUES ('ARM-768831', 'dr. Rian Hidayat', 'RS Sentra Medika', 'rian.hidayat@rs-sentra.co.id', '081234567890', 'HBSAG Test ECOTEST Rapid Cassette', 'hbsag-test-ecotest-rapid', '20 Box', 'Mohon penawaran harga resmi dan jadwal pengiriman untuk wilayah Bogor.', '2026-11-06 19:02:48');

-- ========================================================
-- Users & Sessions (Admin RBAC Authentication)
-- ========================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(64) NOT NULL,
  `username` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `salt` varchar(64) NOT NULL,
  `role` varchar(32) NOT NULL DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `expires_at` bigint NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sessions_user` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `username`, `name`, `password_hash`, `salt`, `role`) VALUES
('usr-superadmin', 'superadmin', 'Administrator Utama', '51887d05290599058b8ab514d91a9d77a2216b13af37dbc8f2842873496c06f5966516977bf851a43e02c5f5b67f45bdb9362562348c63cbf01a94024a5bf605', '99a9b53e3bcf34c92b7f373615b2efee', 'superadmin'),
('usr-admin', 'admin', 'Staf Admin Operasional', '20aa5278c4c3a139fee6faccec6f583e8c1f2606d0c29159ac97f2f76ee0a3228b3504badbe9a6598fe59eeaea81f921fd28cbd38c74d599e1d007e1f869aa94', '088b86c445bec7b37d31d84f181e7859', 'admin');

