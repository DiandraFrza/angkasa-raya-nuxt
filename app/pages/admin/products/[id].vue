<!-- @format -->

<script setup lang="ts">
// Redirect to /admin/products with modal edit opened
const route = useRoute();
const productId = route.params.id as string;
await navigateTo(`/admin/products?editId=${productId}`, { replace: true });
</script>

<template>
  <div class="p-8 text-center text-[#486581]">
    <span>Membuka modal edit produk...</span>
  </div>
</template>
