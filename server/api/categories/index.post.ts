/** @format */

import { defineEventHandler, readBody, createError } from "h3";
import crypto from "node:crypto";
import { useDb } from "../../utils/db";
import { requireUser } from "../../utils/auth";
import { isSupabaseConfigured, supabaseCreateCategory, useSupabase } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  await requireUser(event);
  const body = await readBody(event);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  let slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const isInstrument = Boolean(body?.isInstrument);

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Nama kategori wajib diisi.",
    });
  }

  // Generate slug from name if not provided
  if (!slug) {
    slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  if (!slug) {
    slug = `kategori-${Date.now()}`;
  }

  const id = `cat-${crypto.randomUUID().slice(0, 8)}`;

  if (isSupabaseConfigured()) {
    const sb = useSupabase();
    const { data: existing } = await sb.from("categories").select("id").eq("slug", slug).maybeSingle();
    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    await supabaseCreateCategory({
      id,
      slug,
      name,
      description,
      isInstrument,
    });
  } else {
    const db = useDb();

    // Check unique slug
    const existing = db.prepare("SELECT id FROM categories WHERE slug = ?").get(slug);
    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    db.prepare("INSERT INTO categories (id, slug, name, description, is_instrument) VALUES (?, ?, ?, ?, ?)").run(id, slug, name, description, isInstrument ? 1 : 0);
  }

  return {
    success: true,
    message: `Kategori "${name}" berhasil ditambahkan!`,
    category: {
      id,
      slug,
      name,
      description,
      isInstrument,
    },
  };
});
