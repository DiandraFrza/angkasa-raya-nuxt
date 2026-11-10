/** @format */

import { defineEventHandler, getRouterParam, readBody, createError } from "h3";
import { useDb } from "../../utils/db";
import { requireUser } from "../../utils/auth";
import { isSupabaseConfigured, supabaseUpdateCategory } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  await requireUser(event);
  const targetId = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!targetId) {
    throw createError({ statusCode: 400, statusMessage: "ID kategori tidak valid." });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: "Nama kategori wajib diisi." });
  }

  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const isInstrument = Boolean(body?.isInstrument);

  if (isSupabaseConfigured()) {
    return await supabaseUpdateCategory(targetId, {
      name,
      description,
      isInstrument,
    });
  }

  const db = useDb();
  const existing = db.prepare("SELECT * FROM categories WHERE id = ?").get(targetId) as any;
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Kategori tidak ditemukan." });
  }

  db.prepare("UPDATE categories SET name = ?, description = ?, is_instrument = ? WHERE id = ?").run(
    name,
    description,
    isInstrument ? 1 : 0,
    targetId
  );

  // Update category_name in products if name changed
  try {
    db.prepare("UPDATE products SET category_name = ? WHERE category_slug = ?").run(name, existing.slug);
  } catch {}

  return {
    success: true,
    message: `Kategori "${name}" berhasil diperbarui.`,
  };
});
