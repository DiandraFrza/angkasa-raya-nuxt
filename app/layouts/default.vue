<!-- @format -->

<script setup lang="ts">
import AppHeader from "~/components/layout/AppHeader.vue";
import AppFooter from "~/components/layout/AppFooter.vue";
import QuoteModal from "~/components/forms/QuoteModal.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#E9F8FF] text-[#0D2235]">
    <AppHeader />
    <main class="flex-grow pt-20">
      <slot />
    </main>
    <AppFooter />
    <QuoteModal />
  </div>
</template>
