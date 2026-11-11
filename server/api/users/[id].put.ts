/** @format */

import { defineEventHandler, getRouterParam, readBody, createError } from "h3";
import { useDb } from "../../utils/db";
import { requireSuperAdmin } from "../../utils/auth";
import { hashPassword } from "../../utils/crypto";
import { isSupabaseConfigured, supabaseDestroyUserSessions, useSupabase } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const currentUser = await requireSuperAdmin(event);
  const targetId = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!targetId) {
    throw createError({ statusCode: 400, statusMessage: "ID pengguna tidak valid." });
  }

  const password = typeof body?.password === "string" ? body.password.trim() : "";
  if (password && password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: "Kata sandi baru minimal 6 karakter.",
    });
  }

  const isStatusChange = body?.isActive !== undefined;

  if (isStatusChange && body.isActive === false && targetId === currentUser.id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Anda tidak dapat menonaktifkan akun Anda sendiri saat sedang login.",
    });
  }

  if (isSupabaseConfigured()) {
    const sb = useSupabase();
    const { data: user } = await sb.from("users").select("*").eq("id", targetId).maybeSingle();
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "Pengguna tidak ditemukan." });
    }

    const name = typeof body?.name === "string" ? body.name.trim() : user.name;
    const role = body?.role === "superadmin" ? "superadmin" : body?.role === "admin" ? "admin" : user.role;
    const isActive = isStatusChange ? Boolean(body.isActive) : user.is_active !== false;

    if (user.role === "superadmin" && (!isActive || role !== "superadmin")) {
      const { data: allSupers } = await sb.from("users").select("id, is_active").eq("role", "superadmin");
      const activeSupers = (allSupers || []).filter((u: any) => u.id !== targetId && u.is_active !== false);
      if (activeSupers.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: "Sistem wajib memiliki minimal satu akun Super Admin yang aktif.",
        });
      }
    }

    const updateFields: any = {
      name,
      role,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    if (password) {
      const { hash, salt } = hashPassword(password);
      updateFields.password_hash = hash;
      updateFields.salt = salt;
    }

    const { error } = await sb.from("users").update(updateFields).eq("id", targetId);
    if (error) throw createError({ statusCode: 500, statusMessage: error.message });

    if (!isActive) {
      await supabaseDestroyUserSessions(targetId);
    }

    return {
      success: true,
      message: isStatusChange && body?.name === undefined
        ? `Akun @${user.username} berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}.`
        : `Data pengguna @${user.username} berhasil diperbarui.`,
    };
  }

  const db = useDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(targetId) as any;

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "Pengguna tidak ditemukan." });
  }

  const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : user.name;
  const role = body?.role === "superadmin" ? "superadmin" : body?.role === "admin" ? "admin" : user.role;
  const isActive = isStatusChange ? Boolean(body.isActive) : user.is_active !== 0;

  if (user.role === "superadmin" && (!isActive || role !== "superadmin")) {
    const activeSuperAdmins = db
      .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'superadmin' AND is_active = 1 AND id != ?")
      .get(targetId) as { count: number };

    if (activeSuperAdmins.count === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Sistem wajib memiliki minimal satu akun Super Admin yang aktif.",
      });
    }
  }

  if (password) {
    const { hash, salt } = hashPassword(password);
    db.prepare(
      "UPDATE users SET name = ?, role = ?, is_active = ?, password_hash = ?, salt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(name, role, isActive ? 1 : 0, hash, salt, targetId);
  } else {
    db.prepare(
      "UPDATE users SET name = ?, role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(name, role, isActive ? 1 : 0, targetId);
  }

  if (!isActive) {
    try {
      db.prepare("DELETE FROM sessions WHERE user_id = ?").run(targetId);
    } catch {}
  }

  return {
    success: true,
    message: isStatusChange && body?.name === undefined
      ? `Akun @${user.username} berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}.`
      : `Data pengguna @${user.username} berhasil diperbarui.`,
  };
});
