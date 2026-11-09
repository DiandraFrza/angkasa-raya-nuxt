<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}>()
</script>

<template>
  <div :class="[align === 'center' ? 'text-center mx-auto max-w-2xl' : 'max-w-2xl']" class="space-y-2.5">
    <div
      v-if="eyebrow"
      class="inline-flex items-center gap-1.5 text-[11px] font-manrope font-bold uppercase tracking-wider text-[#064E4D] bg-[#A3EEEC] px-3.5 py-1 rounded-full"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-[#89CBDD]" />
      <span>{{ eyebrow }}</span>
    </div>

    <h2 class="text-2xl sm:text-3xl lg:text-[34px] font-manrope font-bold text-[#0D2235] tracking-tight leading-tight">
      {{ title }}
    </h2>

    <p v-if="description" class="text-[15px] sm:text-[16px] text-[#486581] font-sans leading-relaxed">
      {{ description }}
    </p>
  </div>
</template>
