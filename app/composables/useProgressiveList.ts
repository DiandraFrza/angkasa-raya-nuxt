/** @format */

import { ref, computed, watch, type Ref } from "vue";
import { useIntersectionObserver } from "@vueuse/core";

export interface ProgressiveListOptions {
  autoLoad?: boolean;
}

/**
 * Composable untuk memuat daftar item/baris tabel secara bertahap.
 * Mendukung mode tombol "Tampilkan Lebih Banyak" manual (autoLoad: false)
 * atau lazy scroll otomatis via IntersectionObserver (autoLoad: true).
 */
export function useProgressiveList<T>(
  source: Ref<readonly T[]> | (() => readonly T[]),
  initialCount = 8,
  step = 12,
  options: ProgressiveListOptions = {},
) {
  const autoLoad = options.autoLoad ?? true;

  const sourceList = computed<readonly T[]>(() =>
    typeof source === "function" ? source() : source.value || [],
  );

  const visibleCount = ref(initialCount);
  const sentinelRef = ref<HTMLElement | null>(null);

  const visibleItems = computed(() => sourceList.value.slice(0, visibleCount.value));
  const totalCount = computed(() => sourceList.value.length);
  const hasMore = computed(() => visibleCount.value < totalCount.value);

  watch(
    () => sourceList.value.length,
    (newLen) => {
      if (newLen <= initialCount) {
        visibleCount.value = initialCount;
      }
    },
  );

  const reset = () => {
    visibleCount.value = initialCount;
  };

  const loadMore = () => {
    if (hasMore.value) {
      visibleCount.value = Math.min(visibleCount.value + step, totalCount.value);
    }
  };

  if (autoLoad) {
    useIntersectionObserver(
      sentinelRef,
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore.value) {
          loadMore();
        }
      },
      { rootMargin: "160px" },
    );
  }

  return {
    visibleItems,
    visibleCount,
    totalCount,
    hasMore,
    sentinelRef,
    loadMore,
    reset,
  };
}
