/** @format */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { hashPassword } from "./crypto";

let dbInstance: Database.Database | null = null;

export const useDb = () => {
  if (dbInstance) return dbInstance;

  // Persistent SQL data directory
  const dataDir = path.resolve(process.cwd(), "server", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "angkasa_raya.db");
  const db = new Database(dbPath);

  // Enable WAL mode for high performance concurrent reads
  db.pragma("journal_mode = WAL");

  // Initialize Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      is_instrument INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      category_name TEXT NOT NULL,
      sku TEXT NOT NULL,
      brand TEXT,
      grade TEXT,
      cas_number TEXT,
      chemical_formula TEXT,
      short_description TEXT,
      description TEXT,
      packaging_json TEXT,
      specifications_json TEXT,
      documents_json TEXT,
      image_url TEXT,
      is_featured INTEGER DEFAULT 0,
      is_verified INTEGER DEFAULT 1,
      lead_time TEXT,
      min_order_quantity TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_slug) REFERENCES categories (slug)
    );

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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // Check if users need initial seeding
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    const superPass = hashPassword("Password123!");
    const adminPass = hashPassword("Password123!");

    const insertUser = db.prepare("INSERT INTO users (id, username, name, password_hash, salt, role) VALUES (?, ?, ?, ?, ?, ?)");

    insertUser.run("usr-superadmin", "superadmin", "Administrator Utama", superPass.hash, superPass.salt, "superadmin");

    insertUser.run("usr-admin", "admin", "Staf Admin Operasional", adminPass.hash, adminPass.salt, "admin");
  }

  // Check if site_settings need initial seeding
  const settingsCount = db.prepare("SELECT COUNT(*) as count FROM site_settings").get() as { count: number };
  if (settingsCount.count === 0) {
    const defaultSettings: Record<string, string> = {
      company_name: "Angkasa Raya Medika",
      company_legal_name: "PT Angkasa Raya Medika",
      tagline: "Distribusi Reagen & Alat Laboratorium B2B",
      hero_headline: "Katalog Reagen dan Bahan Laboratorium dengan Informasi yang Jelas.",
      hero_subheadline: "Membantu analis dan tim pengadaan menemukan spesifikasi reagen yang tepat sebelum mengajukan penawaran harga resmi.",
      logo_url: "/brand/logo_akm.jpg",
      phone: "021 89086234",
      whatsapp: "6281289086234",
      email: "angkasakaryamedika@gmail.com",
      address: "Perumahan Sentul Indah Residence Blok A No. 1, Cikeas, Sukaraja, Bogor, Jawa Barat, 16710",
      operating_hours: "Senin - Jumat, 08.30 - 17.00 WIB",
      distribution_focus: "Prioritas Wilayah Jabodetabek & Pasokan Nasional",
      stat_product_count: "250+",
      stat_hospital_partners: "85+",
      stat_sla: "99.2%",
    };

    const insertSetting = db.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?)");
    const insertMany = db.transaction((settings: Record<string, string>) => {
      for (const [key, value] of Object.entries(settings)) {
        insertSetting.run(key, value);
      }
    });
    insertMany(defaultSettings);
  }

  dbInstance = db;
  return dbInstance;
};
