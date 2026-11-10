/** @format */

import type { Category } from "~/types/catalog";

export const categories: Category[] = [
  {
    id: "cat-1",
    slug: "new-standard-reagent",
    name: "New Standard Reagent",
    description: "Bahan standar formulasi terbaru dengan sertifikasi kemurnian tinggi untuk kalibrasi dan validasi hasil pengujian.",
    isInstrument: false,
  },
  {
    id: "cat-2",
    slug: "standard-reagent",
    name: "Standard Reagent",
    description: "Reagen acuan analitis untuk prosedur kontrol kualitas (QC) berkala di laboratorium diagnostik dan riset.",
    isInstrument: false,
  },
  {
    id: "cat-3",
    slug: "reagents",
    name: "Reagents",
    description: "Reagen diagnostik cepat (RDT), larutan buffer, dan bahan kimia esensial untuk pemeriksaan laboratorium harian.",
    isInstrument: false,
  },
  {
    id: "cat-4",
    slug: "esight",
    name: "Esight",
    description: "Lini instrumen dan alat diagnostik laboratorium otomatis untuk mendukung akurasi dan kecepatan pemeriksaan.",
    isInstrument: true,
  },
];
