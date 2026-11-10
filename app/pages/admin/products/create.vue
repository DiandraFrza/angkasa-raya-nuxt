<!-- @format -->

<script setup lang="ts">
// Forward separate create page directly to the dedicated admin products table with modal open
await navigateTo("/admin/products?newProduct=1", { replace: true });
</script>

<template>
  <div class="p-8 text-center text-[#486581]">
    <span>Mengalihkan ke panel tabel produk...</span>
  </div>
</template>
