/** @format */

import { ref, computed, watch, type Ref } from "vue";

export interface TablePaginationOptions {
  defaultPageSize?: number;
  pageSizeOptions?: number[];
}

export function useTablePagination<T>(
  source: Ref<readonly T[]> | (() => readonly T[]),
  options: TablePaginationOptions = {},
) {
  const pageSizeOptions = options.pageSizeOptions || [10, 20, 50, 100];
  const pageSize = ref(options.defaultPageSize || 10);
  const currentPage = ref(1);

  const itemsList = computed<readonly T[]>(() =>
    typeof source === "function" ? source() : source.value || [],
  );

  const totalItems = computed(() => itemsList.value.length);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)));

  watch(pageSize, () => {
    currentPage.value = 1;
  });

  watch(totalPages, (maxPage) => {
    if (currentPage.value > maxPage) {
      currentPage.value = maxPage;
    }
  });

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return itemsList.value.slice(start, start + pageSize.value);
  });

  const startRange = computed(() => {
    if (totalItems.value === 0) return 0;
    return (currentPage.value - 1) * pageSize.value + 1;
  });

  const endRange = computed(() => {
    return Math.min(currentPage.value * pageSize.value, totalItems.value);
  });

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value -= 1;
    }
  };

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value += 1;
    }
  };

  return {
    pageSizeOptions,
    pageSize,
    currentPage,
    totalItems,
    totalPages,
    paginatedItems,
    startRange,
    endRange,
    goToPage,
    prevPage,
    nextPage,
  };
}
