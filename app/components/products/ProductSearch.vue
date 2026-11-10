<!-- @format -->

<script setup lang="ts">
import { ref, watch } from "vue";
import { Search, X } from "lucide-vue-next";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: string): void;
}>();

const localQuery = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newVal) => {
    localQuery.value = newVal;
  },
);

let debounceTimeout: NodeJS.Timeout | null = null;

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  localQuery.value = target.value;

  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    emit("update:modelValue", localQuery.value);
  }, 250);
};

const clearSearch = () => {
  localQuery.value = "";
  emit("update:modelValue", "");
};
</script>

<template>
  <div class="relative w-full max-w-md">
    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#89CBDD]">
      <Search class="w-4 h-4" />
    </div>

    <input type="text" :value="localQuery" placeholder="Cari nama produk, SKU, atau parameter..." class="w-full pl-10 pr-10 py-3 rounded-2xl bg-white text-[14px] text-[#0D2235] placeholder-[#486581]/70 focus:outline-none focus:ring-2 focus:ring-[#89CBDD] transition-all" @input="handleInput" />

    <button v-if="localQuery" type="button" class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#486581] hover:text-[#0D2235]" aria-label="Bersihkan pencarian" @click="clearSearch">
      <X class="w-4 h-4" />
    </button>
  </div>
</template>
