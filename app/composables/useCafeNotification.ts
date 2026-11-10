/** @format */

import { ref } from "vue";

export interface CafeNotificationPayload {
  id: string;
  fullName: string;
  companyOrInstitution: string;
  productName?: string;
  estimatedQuantity?: string;
  time: string;
}

const isSoundEnabled = ref(true);
const activeNotification = ref<CafeNotificationPayload | null>(null);
let audioCtx: AudioContext | null = null;

export const useCafeNotification = () => {
  // Web Audio API: Acoustic Warm Cafe-style Concierge Chime
  const playCafeChime = () => {
    if (!isSoundEnabled.value) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtx || audioCtx.state === "suspended") {
        audioCtx = new AudioContextClass();
      }

      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;

      // Master Gain
      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.28, now);

      // Warm lowpass filter to produce an organic bell tone
      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2800, now);

      filter.connect(masterGain);
      masterGain.connect(audioCtx.destination);

      // Chime Note 1: E5 (659.25 Hz)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.7, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc1.connect(gain1);
      gain1.connect(filter);

      osc1.start(now);
      osc1.stop(now + 0.9);

      // Chime Note 2: A5 (880.00 Hz) - 100ms later (major harmonic progression)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.0, now + 0.11);

      gain2.gain.setValueAtTime(0, now + 0.11);
      gain2.gain.linearRampToValueAtTime(0.85, now + 0.13);
      gain2.gain.exponentialRampToValueAtTime(0.0008, now + 1.4);

      osc2.connect(gain2);
      gain2.connect(filter);

      osc2.start(now + 0.11);
      osc2.stop(now + 1.45);

      // Subtle metallic sparkle overtone (A6: 1760 Hz) for boutique cafe aesthetic
      const oscSparkle = audioCtx.createOscillator();
      const gainSparkle = audioCtx.createGain();
      oscSparkle.type = "sine";
      oscSparkle.frequency.setValueAtTime(1760.0, now + 0.12);

      gainSparkle.gain.setValueAtTime(0, now + 0.12);
      gainSparkle.gain.linearRampToValueAtTime(0.18, now + 0.14);
      gainSparkle.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      oscSparkle.connect(gainSparkle);
      gainSparkle.connect(filter);

      oscSparkle.start(now + 0.12);
      oscSparkle.stop(now + 0.65);
    } catch (e) {
      console.warn("[CafeNotification] Audio playback skipped:", e);
    }
  };

  const notifyNewInquiry = (inquiry: any) => {
    activeNotification.value = {
      id: inquiry.id,
      fullName: inquiry.fullName,
      companyOrInstitution: inquiry.companyOrInstitution,
      productName: inquiry.productName,
      estimatedQuantity: inquiry.estimatedQuantity,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    playCafeChime();

    // Auto-dismiss after 9 seconds
    setTimeout(() => {
      if (activeNotification.value?.id === inquiry.id) {
        activeNotification.value = null;
      }
    }, 9000);
  };

  const dismissNotification = () => {
    activeNotification.value = null;
  };

  const toggleSound = () => {
    isSoundEnabled.value = !isSoundEnabled.value;
    if (isSoundEnabled.value) {
      playCafeChime();
    }
  };

  return {
    isSoundEnabled,
    activeNotification,
    playCafeChime,
    notifyNewInquiry,
    dismissNotification,
    toggleSound,
  };
};
