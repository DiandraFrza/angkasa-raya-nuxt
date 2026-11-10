/** @format */

import { ref } from "vue";

export interface ConfirmModalOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => Promise<void> | void;
}

export interface AlertModalOptions {
  title?: string;
  message: string;
}

const successState = ref({
  isOpen: false,
  title: "Data Berhasil Disimpan",
  message: "",
});

const confirmState = ref({
  isOpen: false,
  title: "Konfirmasi Tindakan",
  message: "",
  confirmText: "Ya, Hapus",
  cancelText: "Tidak",
  isDanger: true,
  isLoading: false,
  onConfirm: (() => {}) as () => Promise<void> | void,
});

const alertState = ref({
  isOpen: false,
  title: "Perhatian",
  message: "",
});

let successTimer: any = null;

export const useActionModal = () => {
  /**
   * Tampilkan modal sukses dengan animasi ceklis yang otomatis hilang setelah 2 detik.
   */
  const showSuccess = (title = "Data Berhasil Disimpan", message = "") => {
    if (successTimer) clearTimeout(successTimer);

    successState.value = {
      isOpen: true,
      title,
      message,
    };

    successTimer = setTimeout(() => {
      successState.value.isOpen = false;
    }, 2000);
  };

  const closeSuccess = () => {
    if (successTimer) clearTimeout(successTimer);
    successState.value.isOpen = false;
  };

  /**
   * Tampilkan modal konfirmasi (misalnya: "Yakin ingin menghapus? Ya - Tidak").
   */
  const showConfirm = (options: ConfirmModalOptions) => {
    confirmState.value = {
      isOpen: true,
      title: options.title || "Konfirmasi Hapus",
      message: options.message,
      confirmText: options.confirmText || "Ya, Hapus",
      cancelText: options.cancelText || "Tidak",
      isDanger: options.isDanger !== undefined ? options.isDanger : true,
      isLoading: false,
      onConfirm: options.onConfirm,
    };
  };

  const closeConfirm = () => {
    if (!confirmState.value.isLoading) {
      confirmState.value.isOpen = false;
    }
  };

  const executeConfirm = async () => {
    if (!confirmState.value.onConfirm) return;
    confirmState.value.isLoading = true;
    try {
      await confirmState.value.onConfirm();
      confirmState.value.isOpen = false;
    } catch (err) {
      console.error("[useActionModal] Confirm action error:", err);
    } finally {
      confirmState.value.isLoading = false;
    }
  };

  /**
   * Tampilkan modal peringatan / alert pengganti window.alert.
   */
  const showAlert = (options: AlertModalOptions) => {
    alertState.value = {
      isOpen: true,
      title: options.title || "Perhatian",
      message: options.message,
    };
  };

  const closeAlert = () => {
    alertState.value.isOpen = false;
  };

  return {
    successState,
    confirmState,
    alertState,
    showSuccess,
    closeSuccess,
    showConfirm,
    closeConfirm,
    executeConfirm,
    showAlert,
    closeAlert,
  };
};
