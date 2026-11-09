<script setup lang="ts">
import { ChevronRight, Home } from 'lucide-vue-next'

interface BreadcrumbItem {
  label: string
  to?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <nav class="flex items-center text-[12.5px] font-manrope text-[#486581] py-3 overflow-x-auto whitespace-nowrap" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1.5 md:space-x-2">
      <li class="inline-flex items-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1 hover:text-[#1B7E98] transition-colors"
        >
          <Home class="w-3.5 h-3.5 text-[#89CBDD]" />
          <span>Beranda</span>
        </NuxtLink>
      </li>

      <li v-for="(item, index) in items" :key="index" class="inline-flex items-center">
        <ChevronRight class="w-3.5 h-3.5 text-[#ADDFF1] shrink-0" />
        <NuxtLink
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          class="ml-1.5 md:ml-2 hover:text-[#1B7E98] transition-colors"
        >
          {{ item.label }}
        </NuxtLink>
        <span
          v-else
          class="ml-1.5 md:ml-2 text-[#0D2235] font-semibold truncate max-w-[200px] sm:max-w-none"
          aria-current="page"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
