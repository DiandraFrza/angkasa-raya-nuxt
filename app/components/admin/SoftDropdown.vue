<!-- @format -->

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import { ChevronDown, Check } from "lucide-vue-next";
import { useEscapeDismiss } from "~/composables/useKeyboardShortcuts";

export interface SoftDropdownOption {
  label: string;
  value: string | number;
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number;
    options: (SoftDropdownOption | string | number)[];
    placeholder?: string;
    fullWidth?: boolean;
    buttonClass?: string;
  }>(),
  {
    placeholder: "Pilih",
    fullWidth: false,
    buttonClass: "",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number): void;
}>();

const triggerRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const menuStyle = ref<Record<string, string>>({});

const normalizedOptions = computed<SoftDropdownOption[]>(() => props.options.map((opt) => (typeof opt === "object" ? opt : { label: String(opt), value: opt })));

const selectedLabel = computed(() => {
  const found = normalizedOptions.value.find((o) => o.value === props.modelValue);
  return found ? found.label : props.placeholder;
});

const updatePosition = () => {
  if (!triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const estimatedHeight = Math.min(normalizedOptions.value.length * 36 + 12, 220);
  const openUpward = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

  menuStyle.value = {
    position: "fixed",
    left: `${rect.left}px`,
    minWidth: `${Math.max(rect.width, 84)}px`,
    top: openUpward ? "auto" : `${rect.bottom + 6}px`,
    bottom: openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto",
  };
};

const toggle = async () => {
  if (isOpen.value) {
    isOpen.value = false;
    return;
  }
  isOpen.value = true;
  await nextTick();
  updatePosition();
};

const selectOption = (opt: SoftDropdownOption) => {
  emit("update:modelValue", opt.value);
  isOpen.value = false;
};

const handleOutside = (e: MouseEvent) => {
  const target = e.target as Node;
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

const handleViewportChange = () => {
  if (isOpen.value) updatePosition();
};

onMounted(() => {
  document.addEventListener("click", handleOutside, true);
  window.addEventListener("scroll", handleViewportChange, true);
  window.addEventListener("resize", handleViewportChange);
});

onUnmounted(() => {
  document.removeEventListener("click", handleOutside, true);
  window.removeEventListener("scroll", handleViewportChange, true);
  window.removeEventListener("resize", handleViewportChange);
});
</script>

<template>
  <div class="relative inline-block" :class="fullWidth ? 'w-full' : ''">
    <button ref="triggerRef" type="button" class="inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-md bg-[#F4FBFE] hover:bg-[#E9F8FF] text-xs font-manrope font-semibold text-[#082838] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#89CBDD]/50" :class="[fullWidth ? 'w-full' : '', buttonClass]" :aria-expanded="isOpen" @click="toggle">
      <span class="truncate">{{ selectedLabel }}</span>
      <ChevronDown class="w-3.5 h-3.5 text-[#486581] shrink-0 transition-transform duration-150" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Teleport to="body">
      <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95 -translate-y-1" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="isOpen" ref="menuRef" :style="menuStyle" class="z-[80] bg-white rounded-md shadow-lg shadow-slate-200/60 py-1 text-xs font-sans text-[#0D2235] max-h-56 overflow-y-auto" role="listbox">
          <button v-for="opt in normalizedOptions" :key="String(opt.value)" type="button" class="w-full px-3 py-2 text-left flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors cursor-pointer" :class="opt.value === modelValue ? 'font-bold text-[#1B7E98] bg-slate-50/70' : 'text-[#0D2235] font-medium'" @click="selectOption(opt)">
            <span class="truncate">{{ opt.label }}</span>
            <Check v-if="opt.value === modelValue" class="w-3.5 h-3.5 text-[#1B7E98] shrink-0" />
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
