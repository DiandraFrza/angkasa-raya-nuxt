/** @format */

export type CategorySlug = "new-standard-reagent" | "standard-reagent" | "reagents" | "esight";

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  description: string;
  isInstrument?: boolean;
}

export interface ProductSpecification {
  label: string;
  value: string;
  isVerified: boolean;
}

export interface ProductPackaging {
  size: string;
  unit: string;
  container?: string;
}

export interface ProductDocument {
  title: string;
  type: "SDS" | "TDS" | "COA" | "Izin Edar Kemenkes" | "Brosur Teknis";
  fileUrl: string;
  fileSize?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categorySlug: CategorySlug;
  categoryName: string;
  sku: string;
  brand: string;
  casNumber?: string;
  chemicalFormula?: string;
  grade?: string;
  shortDescription: string;
  description: string;
  packaging: ProductPackaging[];
  specifications: ProductSpecification[];
  documents?: ProductDocument[];
  imageUrl: string;
  isFeatured?: boolean;
  isVerified: boolean;
  leadTime?: string;
  minOrderQuantity?: string;
}
