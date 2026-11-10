/** @format */

import { defineEventHandler, getRouterParam, createError } from "h3";
import { useDb } from "../../utils/db";
import { requireSuperAdmin } from "../../utils/auth";
import { isSupabaseConfigured, supabaseDeleteUser, useSupabase } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const currentUser = await requireSuperAdmin(event);
  const targetId = getRouterParam(event, "id");

  if (!targetId) {
    throw createError({ statusCode: 400, statusMessage: "ID pengguna tidak valid." });
  }

  if (currentUser.id === targetId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Anda tidak dapat menghapus akun Anda sendiri saat sedang login.",
    });
  }

  if (isSupabaseConfigured()) {
    const sb = useSupabase();
    const { data: targetUser } = await sb.from("users").select("id, role, username").eq("id", targetId).maybeSingle();

    if (!targetUser) {
      throw createError({ statusCode: 404, statusMessage: "Pengguna tidak ditemukan." });
    }

    if (targetUser.role === "superadmin") {
      const { count } = await sb.from("users").select("id", { count: "exact", head: true }).eq("role", "superadmin");
      if (count && count <= 1) {
        throw createError({
          statusCode: 400,
          statusMessage: "Tidak dapat menghapus satu-satunya Super Admin dalam sistem.",
        });
      }
    }

    await supabaseDeleteUser(targetId);

    return {
      success: true,
      message: `Pengguna @${targetUser.username} berhasil dihapus.`,
    };
  }

  const db = useDb();
  const targetUser = db.prepare("SELECT id, role, username FROM users WHERE id = ?").get(targetId) as any;

  if (!targetUser) {
    throw createError({ statusCode: 404, statusMessage: "Pengguna tidak ditemukan." });
  }

  if (targetUser.role === "superadmin") {
    const superAdminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'").get() as { count: number };

    if (superAdminCount.count <= 1) {
      throw createError({
        statusCode: 400,
        statusMessage: "Tidak dapat menghapus satu-satunya Super Admin dalam sistem.",
      });
    }
  }

  // Delete sessions first, then user
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(targetId);
  db.prepare("DELETE FROM users WHERE id = ?").run(targetId);

  return {
    success: true,
    message: `Pengguna @${targetUser.username} berhasil dihapus.`,
  };
});
