/** @format */

import { defineEventHandler } from "h3";
import { useDb } from "../../utils/db";
import { requireSuperAdmin } from "../../utils/auth";
import { isSupabaseConfigured, supabaseGetUsers } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event);

  if (isSupabaseConfigured()) {
    return await supabaseGetUsers();
  }

  const db = useDb();
  const users = db
    .prepare("SELECT id, username, name, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC")
    .all() as any[];

  return users.map((u) => ({
    ...u,
    is_active: u.is_active !== 0,
  }));
});
