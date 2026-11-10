<!-- @format -->

<script setup lang="ts">
import ProductFormModal from "./ProductFormModal.vue";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "created", product: any): void;
}>();
</script>

<template>
  <ProductFormModal
    :is-open="isOpen"
    mode="create"
    @close="emit('close')"
    @saved="(p) => emit('created', p)"
  />
</template>
