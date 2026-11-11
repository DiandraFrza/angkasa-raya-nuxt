/** @format */

import { defineEventHandler, readBody, createError } from "h3";
import { useDb } from "../../utils/db";
import { verifyPassword, hashPassword } from "../../utils/crypto";
import { createSession } from "../../utils/auth";
import { isSupabaseConfigured, supabaseGetUserByUsername, supabaseGetUsers, supabaseCreateUser } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username dan kata sandi wajib diisi.",
    });
  }

  let user: any = null;

  if (isSupabaseConfigured()) {
    user = await supabaseGetUserByUsername(username);

    // Auto-seed initial admin if Supabase users table is empty
    if (!user) {
      const allUsers = await supabaseGetUsers();
      if (allUsers.length === 0 && username.toLowerCase() === "superadmin") {
        const superPass = hashPassword("Password123!");
        user = {
          id: "usr-superadmin",
          username: "superadmin",
          name: "Administrator Utama",
          password_hash: superPass.hash,
          salt: superPass.salt,
          role: "superadmin",
        };
        await supabaseCreateUser(user);
      }
    }
  } else {
    const db = useDb();
    user = db.prepare("SELECT id, username, name, password_hash, salt, role, is_active FROM users WHERE LOWER(username) = LOWER(?)").get(username) as any;
  }

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Kredensial login tidak cocok. Periksa kembali username dan kata sandi.",
    });
  }

  if (user.is_active === 0 || user.is_active === false) {
    throw createError({
      statusCode: 403,
      statusMessage: "Akun Anda berstatus Nonaktif. Hubungi Super Admin untuk mengaktifkan kembali akses.",
    });
  }

  const isValid = verifyPassword(password, user.password_hash, user.salt);
  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Kredensial login tidak cocok. Periksa kembali username dan kata sandi.",
    });
  }

  await createSession(event, user.id);

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    },
  };
});
