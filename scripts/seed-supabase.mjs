/**
 * Script Migrasi / Seeding Otomatis ke Supabase
 * Jalankan:
 *   $env:SUPABASE_URL="https://xxx.supabase.co"; $env:SUPABASE_KEY="service_role_key"; node scripts/seed-supabase.mjs
 *
 * @format
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Harap isi SUPABASE_URL dan SUPABASE_KEY terlebih dahulu.");
  console.log("Contoh cara pakai:");
  console.log('  $env:SUPABASE_URL="https://xxx.supabase.co"');
  console.log('  $env:SUPABASE_KEY="eyJhbGciOi..."');
  console.log("  node scripts/seed-supabase.mjs");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log("🚀 Memulai migrasi data ke Supabase:", supabaseUrl);

  const dbPath = path.resolve(process.cwd(), "server", "data", "angkasa_raya.db");
  if (!fs.existsSync(dbPath)) {
    console.error("❌ File SQLite lokal tidak ditemukan di:", dbPath);
    process.exit(1);
  }

  const db = new DatabaseSync(dbPath);

  // 1. Migrasi Kategori
  console.log("📦 Memindahkan kategori...");
  const categories = db.prepare("SELECT * FROM categories").all();
  for (const cat of categories) {
    const { error } = await supabase.from("categories").upsert(
      {
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        is_instrument: Boolean(cat.is_instrument),
      },
      { onConflict: "slug" },
    );
    if (error) console.error("  ⚠️ Gagal kategori:", cat.name, error.message);
    else console.log("  ✓ Kategori:", cat.name);
  }

  // 2. Migrasi Produk
  console.log("\n🧪 Memindahkan produk...");
  const products = db.prepare("SELECT * FROM products").all();
  for (const p of products) {
    let pkg = [];
    let specs = [];
    let docs = [];
    try {
      pkg = JSON.parse(p.packaging_json || "[]");
    } catch {}
    try {
      specs = JSON.parse(p.specifications_json || "[]");
    } catch {}
    try {
      docs = JSON.parse(p.documents_json || "[]");
    } catch {}

    const { error } = await supabase.from("products").upsert(
      {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category_slug: p.category_slug,
        category_name: p.category_name,
        sku: p.sku,
        brand: p.brand,
        grade: p.grade,
        cas_number: p.cas_number,
        chemical_formula: p.chemical_formula,
        short_description: p.short_description,
        description: p.description,
        packaging_json: pkg,
        specifications_json: specs,
        documents_json: docs,
        image_url: p.image_url,
        is_featured: Boolean(p.is_featured),
        is_verified: Boolean(p.is_verified),
        lead_time: p.lead_time,
        min_order_quantity: p.min_order_quantity,
      },
      { onConflict: "slug" },
    );
    if (error) console.error("  ⚠️ Gagal produk:", p.name, error.message);
    else console.log("  ✓ Produk:", p.name, `(${p.sku})`);
  }

  // 3. Migrasi Pengaturan Website
  console.log("\n⚙️ Memindahkan pengaturan website...");
  const settings = db.prepare("SELECT * FROM site_settings").all();
  for (const s of settings) {
    const { error } = await supabase.from("site_settings").upsert(
      {
        key: s.key,
        value: s.value,
      },
      { onConflict: "key" },
    );
    if (error) console.error("  ⚠️ Gagal setting:", s.key, error.message);
    else console.log("  ✓ Setting:", s.key);
  }

  // 4. Migrasi Akun Admin
  console.log("\n👤 Memindahkan akun admin...");
  const users = db.prepare("SELECT * FROM users").all();
  for (const u of users) {
    const { error } = await supabase.from("users").upsert(
      {
        id: u.id,
        username: u.username,
        name: u.name,
        password_hash: u.password_hash,
        salt: u.salt,
        role: u.role,
      },
      { onConflict: "username" },
    );
    if (error) console.error("  ⚠️ Gagal user:", u.username, error.message);
    else console.log("  ✓ User Admin:", `@${u.username}`, `(${u.name})`);
  }

  console.log("\n🎉 Selesai! Semua data dari SQLite telah berhasil dimigrasikan ke Supabase.");
}

main().catch(console.error);
