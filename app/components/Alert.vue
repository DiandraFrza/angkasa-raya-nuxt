<template>
  <div class="alert">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const { color } = defineProps({
  color: {
    type: String,
    default: 'orange'
  }
})
</script>

<style scoped>
.alert {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 1rem;
  background-color: #fff;
  transition: transform 0.2s ease;
}

.alert:hover {
  transform: translateY(-2px);
}
</style>
