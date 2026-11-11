<!-- @format -->

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, type Component } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { useEscapeDismiss } from "~/composables/useKeyboardShortcuts";

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: Component;
  href?: string;
  target?: string;
  variant?: "default" | "warning" | "success";
  onClick?: () => void;
}

const props = withDefaults(
  defineProps<{
    items: ActionMenuItem[];
    label?: string;
  }>(),
  {
    label: "Aksi",
  },
);

const triggerRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const menuStyle = ref<Record<string, string>>({});

const updatePosition = () => {
  if (!triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const menuWidth = 176;
  const estimatedHeight = props.items.length * 36 + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

  const rightAlignedLeft = Math.max(12, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12));

  menuStyle.value = {
    position: "fixed",
    left: `${rightAlignedLeft}px`,
    width: `${menuWidth}px`,
    top: openUpward ? "auto" : `${rect.bottom + 6}px`,
    bottom: openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto",
  };
};

const toggleMenu = async () => {
  if (isOpen.value) {
    isOpen.value = false;
    return;
  }
  isOpen.value = true;
  await nextTick();
  updatePosition();
};

const handleItemClick = (item: ActionMenuItem) => {
  isOpen.value = false;
  if (item.onClick) {
    item.onClick();
  }
};

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as Node;
  if (triggerRef.value?.contains(target) || menuRef.value?.contains(target)) {
    return;
  }
  isOpen.value = false;
};

useEscapeDismiss(
  () => isOpen.value,
  () => {
    isOpen.value = false;
  },
);

const handleScrollOrResize = () => {
  if (isOpen.value) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleOutsideClick, true);
  window.addEventListener("scroll", handleScrollOrResize, true);
  window.addEventListener("resize", handleScrollOrResize);
});

onUnmounted(() => {
  document.removeEventListener("click", handleOutsideClick, true);
  window.removeEventListener("scroll", handleScrollOrResize, true);
  window.removeEventListener("resize", handleScrollOrResize);
});

const itemClasses = (variant?: "default" | "warning" | "success") => {
  if (variant === "warning") {
    return "text-[#0D2235] hover:bg-amber-50 hover:text-amber-700";
  }
  if (variant === "success") {
    return "text-[#0D2235] hover:bg-emerald-50 hover:text-emerald-700";
  }
  return "text-[#0D2235] hover:bg-slate-50";
};

const iconClasses = (variant?: "default" | "warning" | "success") => {
  if (variant === "warning") {
    return "text-[#486581] group-hover:text-amber-600";
  }
  if (variant === "success") {
    return "text-[#486581] group-hover:text-emerald-600";
  }
  return "text-[#486581] group-hover:text-[#082838]";
};
</script>

<template>
  <div class="inline-block text-left">
    <button ref="triggerRef" type="button" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#E9F8FF] hover:bg-[#D0F2F9] text-[#082838] text-xs font-manrope font-semibold transition-colors cursor-pointer select-none" :aria-expanded="isOpen" aria-haspopup="menu" @click.stop="toggleMenu">
      <span>{{ label }}</span>
      <ChevronDown class="w-3.5 h-3.5 text-[#486581] transition-transform duration-150" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Teleport to="body">
      <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-1" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="isOpen" ref="menuRef" :style="menuStyle" class="z-[80] bg-white rounded-md shadow-lg shadow-slate-200/60 py-1 text-xs font-sans antialiased overflow-hidden" role="menu">
          <template v-for="item in items" :key="item.id">
            <a v-if="item.href" :href="item.href" :target="item.target || '_self'" rel="noopener noreferrer" class="group w-full px-3 py-2 flex items-center gap-2.5 text-left transition-colors cursor-pointer font-medium" :class="itemClasses(item.variant)" role="menuitem" @click="isOpen = false">
              <component :is="item.icon" v-if="item.icon" class="w-3.5 h-3.5 shrink-0 transition-colors" :class="iconClasses(item.variant)" />
              <span class="truncate">{{ item.label }}</span>
            </a>

            <button v-else type="button" class="group w-full px-3 py-2 flex items-center gap-2.5 text-left transition-colors cursor-pointer font-medium" :class="itemClasses(item.variant)" role="menuitem" @click="handleItemClick(item)">
              <component :is="item.icon" v-if="item.icon" class="w-3.5 h-3.5 shrink-0 transition-colors" :class="iconClasses(item.variant)" />
              <span class="truncate">{{ item.label }}</span>
            </button>
          </template>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
