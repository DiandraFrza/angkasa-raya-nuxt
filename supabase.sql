-- ========================================================
-- PT Angkasa Karya Medika - Supabase (PostgreSQL) Schema & Seed
-- Jalankan script ini langsung di Supabase SQL Editor
-- ========================================================

-- 1. TABEL KATEGORI PRODUK
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_instrument BOOLEAN DEFAULT FALSE
);

-- 2. TABEL KATALOG PRODUK
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_slug TEXT REFERENCES categories(slug) ON UPDATE CASCADE ON DELETE RESTRICT,
  category_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  brand TEXT DEFAULT 'Angkasa Karya Medika',
  grade TEXT DEFAULT '',
  cas_number TEXT DEFAULT '',
  chemical_formula TEXT DEFAULT '',
  short_description TEXT,
  description TEXT,
  packaging_json JSONB DEFAULT '[]'::jsonb,
  specifications_json JSONB DEFAULT '[]'::jsonb,
  documents_json JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT TRUE,
  lead_time TEXT DEFAULT 'Ready Stock Jabodetabek',
  min_order_quantity TEXT DEFAULT '1 Box',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL PERMINTAAN PENAWARAN (RFQ)
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  company_or_institution TEXT NOT NULL,
  work_email TEXT NOT NULL,
  phone_number TEXT,
  product_name TEXT,
  product_slug TEXT,
  estimated_quantity TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL PENGATURAN WEBSITE
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 5. TABEL PENGGUNA / ADMINISTRATOR
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL SESI LOGIN
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEX UNTUK PERFORMA
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

-- NONAKTIFKAN ROW LEVEL SECURITY (RLS) & IZINKAN AKSES PENUH
-- Diperlukan agar backend Nuxt Serverless di Vercel dapat mengelola data secara penuh
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sessions DISABLE ROW LEVEL SECURITY;

-- Berikan izin akses penuh ke role anon, authenticated, dan service_role
GRANT ALL ON TABLE categories TO anon, authenticated, service_role;
GRANT ALL ON TABLE products TO anon, authenticated, service_role;
GRANT ALL ON TABLE inquiries TO anon, authenticated, service_role;
GRANT ALL ON TABLE site_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE users TO anon, authenticated, service_role;
GRANT ALL ON TABLE sessions TO anon, authenticated, service_role;

-- Kebijakan RLS (Policy) terbuka penuh seandainya Supabase tetap memaksakan RLS
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow all for categories" ON categories;
  CREATE POLICY "Allow all for categories" ON categories FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow all for products" ON products;
  CREATE POLICY "Allow all for products" ON products FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow all for inquiries" ON inquiries;
  CREATE POLICY "Allow all for inquiries" ON inquiries FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow all for site_settings" ON site_settings;
  CREATE POLICY "Allow all for site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow all for users" ON users;
  CREATE POLICY "Allow all for users" ON users FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow all for sessions" ON sessions;
  CREATE POLICY "Allow all for sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ========================================================
-- DATA AWAL (SEED DATA)
-- ========================================================

-- Kategori
INSERT INTO categories (id, slug, name, description, is_instrument) VALUES
  ('cat-1', 'new-standard-reagent', 'New Standard Reagent', 'Bahan standar formulasi terbaru dengan sertifikasi kemurnian tinggi untuk kalibrasi dan validasi hasil pengujian.', FALSE),
  ('cat-2', 'standard-reagent', 'Standard Reagent', 'Reagen acuan analitis untuk prosedur kontrol kualitas (QC) berkala di laboratorium diagnostik dan riset.', FALSE),
  ('cat-3', 'reagents', 'Reagents', 'Reagen diagnostik cepat (RDT), larutan buffer, dan bahan kimia esensial untuk pemeriksaan laboratorium harian.', FALSE),
  ('cat-4', 'esight', 'Esight', 'Lini instrumen dan alat diagnostik laboratorium otomatis untuk mendukung akurasi dan kecepatan pemeriksaan.', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Akun Administrator (Password awal: Password123!)
INSERT INTO users (id, username, name, password_hash, salt, role) VALUES
  ('usr-superadmin', 'superadmin', 'Administrator Utama', '440d66f1e9f1737333b7354d74257987c520149cf6ae1add9be8da6e26bc853f8a09093a0c51ce24b89ee78d434930f0c9df968bbff2a0ee5295571fa323079c', '8e38025480493ef393dbb702e89a7665', 'superadmin'),
  ('usr-admin', 'admin', 'Staf Admin Operasional', '440d66f1e9f1737333b7354d74257987c520149cf6ae1add9be8da6e26bc853f8a09093a0c51ce24b89ee78d434930f0c9df968bbff2a0ee5295571fa323079c', '8e38025480493ef393dbb702e89a7665', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Pengaturan Website
INSERT INTO site_settings (key, value) VALUES
  ('company_name', 'Angkasa Karya Medika'),
  ('company_legal_name', 'PT Angkasa Karya Medika'),
  ('tagline', 'Distribusi Reagen & Alat Laboratorium'),
  ('hero_headline', 'Katalog Reagen dan Bahan Laboratorium dengan Informasi yang Jelas.'),
  ('hero_subheadline', 'Membantu analis dan tim pengadaan menemukan spesifikasi reagen yang tepat sebelum mengajukan penawaran harga resmi.'),
  ('logo_url', '/brand/logo_akm.jpg'),
  ('phone', '021 89086234'),
  ('whatsapp', '6281289086234'),
  ('email', 'angkasakaryamedika@gmail.com'),
  ('address', 'Perumahan Sentul Indah Residence Blok A No. 1, Cikeas, Sukaraja, Bogor, Jawa Barat, 16710'),
  ('operating_hours', 'Senin - Jumat, 08.30 - 17.00 WIB'),
  ('distribution_focus', 'Prioritas Wilayah Jabodetabek & Pasokan Nasional'),
  ('regulation_info', 'Kementerian Kesehatan RI (Izin Edar Resmi AKD)')
ON CONFLICT (key) DO NOTHING;

-- Produk Katalog
INSERT INTO products (id, slug, name, category_slug, category_name, sku, brand, grade, cas_number, chemical_formula, short_description, description, packaging_json, specifications_json, documents_json, image_url, is_featured, is_verified, lead_time, min_order_quantity) VALUES
(
  'prod-hbsag-ecotest',
  'hbsag-test-ecotest-rapid',
  'HBSAG Test ECOTEST Rapid Cassette',
  'reagents',
  'Reagents',
  'ARM-RDT-HBSAG50',
  'ECOTEST',
  'Clinical Diagnostic Grade',
  '',
  '',
  'Uji diagnostik cepat kualitatif untuk deteksi Hepatitis B Surface Antigen (HBsAg) pada spesimen darah, serum, atau plasma.',
  'ECOTEST HBsAg Rapid Diagnostic Test adalah perangkat uji imunokromatografi membran untuk deteksi kualitatif Hepatitis B Surface Antigen (HBsAg) dalam darah utuh, serum, atau plasma. Diformulasikan khusus untuk skrining cepat fasilitas kesehatan, laboratorium klinis, dan rumah sakit dengan batas deteksi sensitif dan visualisasi hasil yang jelas dalam 15 menit. Terdaftar resmi di Kementerian Kesehatan Republik Indonesia.',
  '[{"size":"50","unit":"Strip/Test per Box","container":"Box Karton Segel Pabrik"}]'::jsonb,
  '[{"label":"Tipe Spesimen","value":"Blood / Serum / Plasma","isVerified":true},{"label":"Parameter Deteksi","value":"Hepatitis B Diagnostic (HBsAg)","isVerified":true},{"label":"Format Pengujian","value":"Rapid Diagnostic Test (Cassette)","isVerified":true},{"label":"Waktu Pembacaan","value":"15 - 20 Menit","isVerified":true},{"label":"Regulasi","value":"Kementerian Kesehatan RI (Izin Edar AKD)","isVerified":true},{"label":"Suhu Penyimpanan","value":"2°C - 30°C (Jangan Dibekukan)","isVerified":true},{"label":"Sensitivitas Relatif","value":"> 99.0% [Terverifikasi]","isVerified":true},{"label":"Spesifisitas Relatif","value":"> 99.0% [Terverifikasi]","isVerified":true}]'::jsonb,
  '[{"title":"Brosur Teknis ECOTEST HBsAg","type":"Brosur Teknis","fileUrl":"/images/products/ecotest-hbsag-flyer.png","fileSize":"Format Brosur Resmi"},{"title":"Izin Edar Kemenkes RI","type":"Izin Edar Kemenkes","fileUrl":"#","fileSize":"Tersedia atas Permintaan"}]'::jsonb,
  '/images/products/ecotest-hbsag-flyer.png',
  TRUE,
  TRUE,
  'Ready Stock Jabodetabek',
  '1 Box (50 Test)'
),
(
  'prod-esight-clia-800',
  'esight-auto-clia-analyzer-800',
  'Esight CLIA-800 Auto-Immunoassay Analyzer',
  'esight',
  'Esight',
  'ARM-INS-ES800',
  'Esight',
  'Automated Diagnostic Instrument',
  '',
  '',
  'Alat analyzer imunologi chemiluminescence otomatis untuk throughput menengah dengan akurasi dan reproduktifitas tinggi.',
  'Esight CLIA-800 adalah sistem analyzer imunologi berbasis kemiluminesens otomatis penuh yang dirancang untuk laboratorium sentral dan rumah sakit. Menawarkan penanganan sampel otomatis, pemindaian barcode reagen terintegrasi, dan presisi tinggi untuk deteksi penanda tumor, fungsi tiroid, hormon reproduksi, dan infeksi menular.',
  '[{"size":"1","unit":"Unit Instrumen Utama + Starter Kit Reagen","container":"Peti Kayu Ekspor Standar"}]'::jsonb,
  '[{"label":"Throughput Uji","value":"Hingga 120 uji/jam","isVerified":true},{"label":"Kapasitas Sampel","value":"60 posisi tabung primer dengan identifikasi barcode","isVerified":true},{"label":"Posisi Reagen","value":"20 posisi dengan sistem pendingin 24 jam","isVerified":true},{"label":"Metode Pengukuran","value":"Chemiluminescence Immunoassay (CLIA)","isVerified":true},{"label":"Konektivitas","value":"Dukungan LIS / HIS dua arah via TCP/IP","isVerified":true},{"label":"Catu Daya","value":"220V AC, 50/60 Hz","isVerified":true}]'::jsonb,
  '[{"title":"Spesifikasi Teknis Alat Esight CLIA-800","type":"TDS","fileUrl":"#","fileSize":"PDF (Atas Permintaan)"}]'::jsonb,
  '/brand/logo_akm.jpg',
  TRUE,
  TRUE,
  '1 - 2 Minggu Pengiriman & Instalasi Jabodetabek',
  '1 Unit'
),
(
  'prod-esight-rtr-200',
  'esight-rapid-reader-200',
  'Esight RTR-200 Portable Rapid Test Reader',
  'esight',
  'Esight',
  'ARM-INS-ES200',
  'Esight',
  'Digital Point-of-Care Instrument',
  '',
  '',
  'Alat pembaca digital strip rapid test portabel untuk standardisasi hasil uji dan eliminasi variabilitas pembacaan mata manusia.',
  'Esight RTR-200 merupakan alat pembaca portabel berbobot ringan yang menggunakan sensor optik CMOS untuk menganalisis intensitas garis kaset rapid test secara kuantitatif dan semi-kuantitatif. Menghasilkan pencatatan data otomatis dan dapat langsung diekspor ke printer lab atau sistem rekam medis.',
  '[{"size":"1","unit":"Unit Portabel Reader + Power Adapter + Kaset Kalibrasi","container":"Koper Hardcase Pelindung"}]'::jsonb,
  '[{"label":"Metode Pembacaan","value":"Reflectance Photometry Optik CMOS","isVerified":true},{"label":"Waktu Analisis","value":"Kurang dari 10 detik per strip","isVerified":true},{"label":"Layar Tampilan","value":"Layar Sentuh LCD 5 inci Berwarna","isVerified":true},{"label":"Kapasitas Memori","value":"Menyimpan hingga 10.000 riwayat hasil pengujian","isVerified":true},{"label":"Port Antarmuka","value":"USB 2.0, RS232, dan Bluetooth","isVerified":true}]'::jsonb,
  '[{"title":"Manual Ringkas Penggunaan RTR-200","type":"Brosur Teknis","fileUrl":"#","fileSize":"Tersedia"}]'::jsonb,
  '/brand/logo_akm.jpg',
  FALSE,
  TRUE,
  'Ready Stock Jabodetabek',
  '1 Unit'
),
(
  'prod-bsa-ultra-pure',
  'bovine-serum-albumin-standard-grade',
  'Albumin Bovine Serum Standard (BSA Ultra Pure 99%)',
  'new-standard-reagent',
  'New Standard Reagent',
  'ARM-NSR-BSA100',
  'Angkasa Karya Medika',
  'Ultra Pure Analytical Grade (≥ 98.5%)',
  '9048-46-8',
  'N/A (Bovine Protein)',
  'Bahan standar albumin fraksi V dengan kemurnian tinggi untuk kalibrasi kurva baku protein spektrofotometri dan ELISA.',
  'Albumin Serum Sapi (BSA) Ultra Pure dari Angkasa Karya Medika diproduksi melalui proses fraksinasi panas terkontrol yang menghasilkan sediaan bebas protease dan nuklease. Ideal digunakan sebagai standar kalibrasi kuantisasi protein total, agen pemblokir imunohistokimia, serta stabilizer larutan enzim reagen.',
  '[{"size":"100","unit":"gram","container":"Botol Kaca Amber Kedap Udara"},{"size":"500","unit":"gram","container":"Botol Kaca Amber Kedap Udara"}]'::jsonb,
  '[{"label":"Kemurnian (Elektroforesis)","value":"≥ 98.5%","isVerified":true},{"label":"Kadar Air","value":"< 5.0%","isVerified":true},{"label":"pH (Larutan 1% dalam H2O)","value":"6.8 - 7.2","isVerified":true},{"label":"Aktivitas Nuklease / Protease","value":"Tidak Terdeteksi","isVerified":true},{"label":"Penyimpanan","value":"2°C - 8°C (Simpan di Tempat Kering)","isVerified":true}]'::jsonb,
  '[{"title":"Certificate of Analysis (COA) BSA","type":"COA","fileUrl":"#","fileSize":"Spesifikasi Batch"},{"title":"Safety Data Sheet (SDS) BSA","type":"SDS","fileUrl":"#","fileSize":"PDF"}]'::jsonb,
  '/brand/logo_akm.jpg',
  TRUE,
  TRUE,
  '3 - 5 Hari Kerja Jabodetabek',
  '1 Botol (100 gram)'
),
(
  'prod-multi-calibrator',
  'multi-calibrator-clinical-chemistry-set',
  'Multi-Calibrator Clinical Chemistry Standard Set',
  'new-standard-reagent',
  'New Standard Reagent',
  'ARM-NSR-MCC05',
  'Angkasa Karya Medika',
  'Certified Reference Material',
  '',
  '',
  'Satu set standar multi-analit liofilisasi untuk kalibrasi instrumen kimia klinik otomatis pada lebih dari 25 parameter darah rutin.',
  'Set kalibrator multi-analit berbasis serum manusia yang telah dititrasi nilai konsentrasinya terhadap metode rujukan internasional IFCC. Dirancang untuk kalibrasi rutin pemeriksaan enzim, substrat metabolik, lipid, dan elektrolit pada berbagai sistem analyzer kimia terbuka.',
  '[{"size":"6 x 5","unit":"mL Vials","container":"Kit Box dengan Cold Pack"}]'::jsonb,
  '[{"label":"Bentuk Sediaan","value":"Serum Liofilisasi (Rekonstitusi dengan Aquabidest)","isVerified":true},{"label":"Parameter Terkalibrasi","value":"Glukosa, Kolesterol, Asam Urat, SGOT, SGPT, Ureum, Kreatinin, Bilirubin, dll.","isVerified":true},{"label":"Stabilitas Rekonstitusi","value":"7 hari pada 2°C - 8°C atau 30 hari pada -20°C","isVerified":true},{"label":"Keterlacakan (Traceability)","value":"Tertaut ke Standar Internasional NIST / IFCC","isVerified":true}]'::jsonb,
  '[{"title":"Tabel Nilai Target Kalibrasi Lot","type":"TDS","fileUrl":"#","fileSize":"Lembar Nilai Lot"}]'::jsonb,
  '/brand/logo_akm.jpg',
  FALSE,
  TRUE,
  'Ready Stock Jabodetabek',
  '1 Kit (6 x 5 mL)'
),
(
  'prod-kcl-3m-std',
  'potassium-chloride-3m-standard-solution',
  'Potassium Chloride 3M Electrolyte Standard Solution',
  'standard-reagent',
  'Standard Reagent',
  'ARM-SR-KCL3M',
  'Angkasa Karya Medika',
  'Volumetric Analytic Standard',
  '7447-40-7',
  'KCl in H2O',
  'Larutan standar elektrolit KCl 3 Molar tersertifikasi untuk pengisian dan kalibrasi elektroda referensi pH dan ion selektif (ISE).',
  'Larutan kalibrasi Potassium Chloride 3.0 M disiapkan menggunakan garam analitis ultra-murni dan air deionisasi konduktivitas rendah (< 1 µS/cm). Menghasilkan potensial difusi junction yang stabil dan konsisten untuk elektroda pH kombinasi dan sensor elektrolit otomatis.',
  '[{"size":"500","unit":"mL","container":"Botol Polietilena Kedap Rembes"},{"size":"1000","unit":"mL","container":"Botol Polietilena Kedap Rembes"}]'::jsonb,
  '[{"label":"Konsentrasi","value":"3.00 ± 0.02 M pada 20°C","isVerified":true},{"label":"Konduktivitas Spesifik","value":"Tersertifikasi Lot-to-Lot","isVerified":true},{"label":"Bebas Kontaminan Logam Berat","value":"< 5 ppm","isVerified":true},{"label":"Masa Simpan","value":"24 Bulan dalam Kemasan Asli","isVerified":true}]'::jsonb,
  '[{"title":"COA KCl 3M Solution","type":"COA","fileUrl":"#","fileSize":"Tersedia"}]'::jsonb,
  '/brand/logo_akm.jpg',
  TRUE,
  TRUE,
  'Ready Stock Jabodetabek',
  '1 Botol (500 mL)'
),
(
  'prod-glucose-std',
  'glucose-reference-standard-solution',
  'Glucose Standard Reference Solution (100 mg/dL)',
  'standard-reagent',
  'Standard Reagent',
  'ARM-SR-GLU100',
  'Angkasa Karya Medika',
  'Certified Reference Material',
  '50-99-7',
  'C6H12O6 in Aqueous Matrix',
  'Larutan standar acuan glukosa 100 mg/dL stabil dengan pengawet benzoat untuk kontrol harian metode GOD-PAP dan Hexokinase.',
  'Sediaan standar acuan glukosa dengan konsentrasi tepat 100 mg/dL (5.55 mmol/L) yang disiapkan secara gravimetri untuk kalibrasi verifikasi harian fotometer kimia klinik. Mengandung matriks penstabil yang mencegah dekomposisi enzimatik dan pertumbuhan bakteri.',
  '[{"size":"5 x 10","unit":"mL Ampul Kaca","container":"Tray Karton"}]'::jsonb,
  '[{"label":"Konsentrasi Terukur","value":"100.0 ± 0.5 mg/dL","isVerified":true},{"label":"Metode Pengukuran","value":"GOD-PAP / Hexokinase Compatible","isVerified":true},{"label":"Penyimpanan","value":"15°C - 25°C Terlindung dari Cahaya","isVerified":true}]'::jsonb,
  '[{"title":"Sertifikat Analisis Glukosa 100 mg/dL","type":"COA","fileUrl":"#","fileSize":"PDF"}]'::jsonb,
  '/brand/logo_akm.jpg',
  FALSE,
  TRUE,
  'Ready Stock Jabodetabek',
  '1 Pack (5 Ampul)'
),
(
  'prod-pbs-10x',
  'phosphate-buffered-saline-10x-solution',
  'Phosphate Buffered Saline (PBS) 10X Solution pH 7.4',
  'reagents',
  'Reagents',
  'ARM-REA-PBS10X',
  'Angkasa Karya Medika',
  'Cell Culture & Immunoassay Grade',
  '',
  '',
  'Larutan konsentrat penyangga PBS 10X steril tersaring 0.2 µm bebas endotoksin untuk pencucian ELISA dan suspensi seluler.',
  'Phosphate Buffered Saline 10X adalah larutan garam seimbang berbasis fosfat yang diformulasikan untuk menjaga osmolaritas dan pH stabil (7.4 pada pengenceran 1X). Diproduksi dengan filtrasi membran 0.22 mikron untuk menjamin sterilitas optimal pada pengujian laboratorium imunologi dan kultur sel.',
  '[{"size":"1000","unit":"mL","container":"Botol HDPE Graduasi"}]'::jsonb,
  '[{"label":"pH (Pengenceran 1X pada 25°C)","value":"7.4 ± 0.1","isVerified":true},{"label":"Komposisi (1X)","value":"137 mM NaCl, 2.7 mM KCl, 10 mM Na2HPO4, 1.8 mM KH2PO4","isVerified":true},{"label":"Kondisi Sterilitas","value":"Filtered 0.22 µm Sterile","isVerified":true},{"label":"Penyimpanan","value":"Suhu Ruang (15°C - 30°C)","isVerified":true}]'::jsonb,
  '[{"title":"Lembar Data Keselamatan (SDS) PBS 10X","type":"SDS","fileUrl":"#","fileSize":"Tersedia"}]'::jsonb,
  '/brand/logo_akm.jpg',
  FALSE,
  TRUE,
  'Ready Stock Jabodetabek',
  '1 Botol (1 L)'
),
(
  'prod-giemsa-stain',
  'giemsa-stain-solution-reagent',
  'Giemsa Stain Solution Reagent Ready-to-Use',
  'reagents',
  'Reagents',
  'ARM-REA-GMS500',
  'Angkasa Karya Medika',
  'Microscopy Diagnostic Staining Grade',
  '',
  'Giemsa in Glycerol-Methanol',
  'Reagen larutan pewarna Giemsa siap pakai untuk diferensiasi morfologi sel darah, apusan sumsum tulang, dan deteksi parasit malaria.',
  'Reagen pewarna Giemsa dari Angkasa Karya Medika diformulasikan dengan proporsi tepat Azure II-Eosin dan Methylene Blue dalam pelarut metanol-gliserol murni. Memberikan diferensiasi warna kromatin nukleus yang tajam dan kontras sitoplasma optimal pada sediaan apus darah tepi.',
  '[{"size":"500","unit":"mL","container":"Botol Amber Pelindung Cahaya"}]'::jsonb,
  '[{"label":"Aplikasi","value":"Pewarnaan Hematologi & Parasitologi (Malaria)","isVerified":true},{"label":"Kelarutan","value":"Dapat Diencerkan dengan Buffer Fosfat pH 6.8 - 7.2","isVerified":true},{"label":"Absorbansi Maksimum (λ1)","value":"645 - 655 nm","isVerified":true},{"label":"Penyimpanan","value":"15°C - 25°C Terlindung dari Sinar Matahari Langsung","isVerified":true}]'::jsonb,
  '[{"title":"Petunjuk Pewarnaan Giemsa Standar","type":"Brosur Teknis","fileUrl":"#","fileSize":"Lembar Prosedur"}]'::jsonb,
  '/brand/logo_akm.jpg',
  FALSE,
  TRUE,
  'Ready Stock Jabodetabek',
  '1 Botol (500 mL)'
)
ON CONFLICT (slug) DO NOTHING;

-- Permintaan Penawaran Sampel
INSERT INTO inquiries (id, full_name, company_or_institution, work_email, phone_number, product_name, product_slug, estimated_quantity, message, created_at) VALUES
(
  'ARM-768831',
  'dr. Rian Hidayat',
  'RS Sentra Medika',
  'rian.hidayat@rs-sentra.co.id',
  '081234567890',
  'HBSAG Test ECOTEST Rapid Cassette',
  'hbsag-test-ecotest-rapid',
  '20 Box',
  'Mohon penawaran harga resmi dan jadwal pengiriman untuk wilayah Bogor.',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Pengguna Administrator Default (Password default: Password123!)
INSERT INTO users (id, username, name, password_hash, salt, role) VALUES
(
  'usr-superadmin',
  'superadmin',
  'Administrator Utama',
  '327fc8a0f67d288ec4124b8a92b8ed917e2c9ec2588926679c2ebd29651fffdab93e67bdad314ec8aa0f89a42ebf53fa2261f37484edad1880c20498cdb10b54',
  '8e38025480493ef393dbb702e89a7665',
  'superadmin'
),
(
  'usr-admin',
  'admin',
  'Staff Operasional Lab',
  '112381f61d1e97203eaf443ec4670e46fd6f705038425cd0ea2eff8ab810260de6e8f05dafc1bdce4fd41ad2c8abcfde7ec653787e12bd22e5081aff2b71ccef',
  '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
  'admin'
)
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  salt = EXCLUDED.salt,
  name = EXCLUDED.name,
  role = EXCLUDED.role;
