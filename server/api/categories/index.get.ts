/** @format */

import { defineEventHandler, getQuery } from "h3";
import { useDb } from "../../utils/db";
import { getUserFromSession } from "../../utils/auth";
import { isSupabaseConfigured, supabaseGetCategories } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const wantInactive = query.includeInactive === "true" || query.includeInactive === "1";
  const session = wantInactive ? await getUserFromSession(event) : null;
  const includeInactive = Boolean(wantInactive && session);

  if (isSupabaseConfigured()) {
    return await supabaseGetCategories(includeInactive);
  }

  const db = useDb();
  const sql = includeInactive
    ? "SELECT * FROM categories ORDER BY id ASC"
    : "SELECT * FROM categories WHERE is_active = 1 ORDER BY id ASC";
  const rows = db.prepare(sql).all() as any[];

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    isInstrument: Boolean(r.is_instrument),
    isActive: r.is_active !== 0,
  }));
});
