<!-- @format -->

<script setup lang="ts">
import { ref } from "vue";
import { useIntersectionObserver } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    minHeight?: string;
    eager?: boolean;
  }>(),
  {
    minHeight: "180px",
    eager: false,
  },
);

const containerRef = ref<HTMLElement | null>(null);
const isVisible = ref(props.eager);

if (!props.eager) {
  const { stop } = useIntersectionObserver(
    containerRef,
    (entries) => {
      if (entries[0]?.isIntersecting) {
        isVisible.value = true;
        stop();
      }
    },
    { rootMargin: "150px" },
  );
}
</script>

<template>
  <div ref="containerRef" :style="!isVisible ? { minHeight } : undefined" class="w-full h-full">
    <slot v-if="isVisible" />
    <div v-else class="w-full h-full rounded-md bg-white/80 border border-slate-100 p-4 animate-pulse flex flex-col justify-between">
      <div class="w-full aspect-[4/3] bg-[#E9F8FF] rounded-xl" />
      <div class="space-y-2 pt-3">
        <div class="h-3 bg-slate-100 rounded-xl w-1/3" />
        <div class="h-4 bg-slate-100 rounded-xl w-3/4" />
        <div class="h-3 bg-slate-100 rounded-xl w-full" />
      </div>
    </div>
  </div>
</template>
