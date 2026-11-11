/** @format */

import { defineEventHandler, createError } from "h3";

export default defineEventHandler(() => {
  throw createError({
    statusCode: 403,
    statusMessage: "Fitur hapus permanen telah dinonaktifkan. Gunakan toggle status Aktif/Nonaktif (Super Admin).",
  });
});
