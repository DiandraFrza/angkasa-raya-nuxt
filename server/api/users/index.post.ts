/** @format */

import { defineEventHandler, readBody, createError } from "h3";
import crypto from "node:crypto";
import { useDb } from "../../utils/db";
import { requireSuperAdmin } from "../../utils/auth";
import { hashPassword } from "../../utils/crypto";
import { isSupabaseConfigured, supabaseCreateUser, supabaseGetUserByUsername } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event);
  const body = await readBody(event);

  const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = body?.role === "superadmin" ? "superadmin" : "admin";

  if (!username || !name || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username, nama lengkap, dan kata sandi wajib diisi.",
    });
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: "Kata sandi minimal 6 karakter.",
    });
  }

  const { hash, salt } = hashPassword(password);
  const id = `usr-${crypto.randomUUID().slice(0, 8)}`;

  if (isSupabaseConfigured()) {
    const existing = await supabaseGetUserByUsername(username);
    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: `Username "${username}" sudah digunakan. Silakan pilih username lain.`,
      });
    }

    await supabaseCreateUser({
      id,
      username,
      name,
      password_hash: hash,
      salt,
      role,
    });
  } else {
    const db = useDb();

    // Check unique username
    const existing = db.prepare("SELECT id FROM users WHERE LOWER(username) = LOWER(?)").get(username);
    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: `Username "${username}" sudah digunakan. Silakan pilih username lain.`,
      });
    }

    db.prepare("INSERT INTO users (id, username, name, password_hash, salt, role) VALUES (?, ?, ?, ?, ?, ?)").run(id, username, name, hash, salt, role);
  }

  return {
    success: true,
    message: `Pengguna admin "${name}" (@${username}) berhasil ditambahkan.`,
    user: {
      id,
      username,
      name,
      role,
    },
  };
});
