/** @format */

import { defineEventHandler, getRouterParam, readBody, createError } from "h3";
import { useDb } from "../../utils/db";
import { requireUser, requireSuperAdmin } from "../../utils/auth";
import { isSupabaseConfigured, supabaseUpdateCategory, useSupabase } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  await requireUser(event);
  const targetId = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!targetId) {
    throw createError({ statusCode: 400, statusMessage: "ID kategori tidak valid." });
  }

  const isStatusChange = body?.isActive !== undefined;
  if (isStatusChange) {
    await requireSuperAdmin(event);
  }

  if (isSupabaseConfigured()) {
    const sb = useSupabase();
    const { data: existing } = await sb.from("categories").select("*").eq("id", targetId).maybeSingle();
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: "Kategori tidak ditemukan." });
    }

    const name = typeof body?.name === "string" ? body.name.trim() : existing.name;
    if (!name) {
      throw createError({ statusCode: 400, statusMessage: "Nama kategori wajib diisi." });
    }

    const description = body?.description !== undefined
      ? (typeof body.description === "string" ? body.description.trim() : "")
      : (existing.description || "");
    const isInstrument = body?.isInstrument !== undefined ? Boolean(body.isInstrument) : Boolean(existing.is_instrument);
    const isActive = body?.isActive !== undefined ? Boolean(body.isActive) : (existing.is_active !== false);

    await supabaseUpdateCategory(targetId, {
      name,
      description,
      isInstrument,
      isActive,
    });

    return {
      success: true,
      message: isStatusChange && body?.name === undefined
        ? `Kategori "${name}" berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}.`
        : `Kategori "${name}" berhasil diperbarui.`,
    };
  }

  const db = useDb();
  const existing = db.prepare("SELECT * FROM categories WHERE id = ?").get(targetId) as any;
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Kategori tidak ditemukan." });
  }

  const name = body?.name !== undefined
    ? (typeof body.name === "string" ? body.name.trim() : "")
    : existing.name;

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: "Nama kategori wajib diisi." });
  }

  const description = body?.description !== undefined
    ? (typeof body.description === "string" ? body.description.trim() : "")
    : (existing.description || "");
  const isInstrument = body?.isInstrument !== undefined ? Boolean(body.isInstrument) : Boolean(existing.is_instrument);
  const isActive = body?.isActive !== undefined ? Boolean(body.isActive) : (existing.is_active !== 0);

  db.prepare("UPDATE categories SET name = ?, description = ?, is_instrument = ?, is_active = ? WHERE id = ?").run(
    name,
    description,
    isInstrument ? 1 : 0,
    isActive ? 1 : 0,
    targetId,
  );

  // Update category_name in products if name changed
  if (name !== existing.name) {
    try {
      db.prepare("UPDATE products SET category_name = ? WHERE category_slug = ?").run(name, existing.slug);
    } catch {}
  }

  return {
    success: true,
    message: isStatusChange && body?.name === undefined
      ? `Kategori "${name}" berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}.`
      : `Kategori "${name}" berhasil diperbarui.`,
  };
});
