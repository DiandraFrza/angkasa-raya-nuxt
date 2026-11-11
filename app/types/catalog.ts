/** @format */

export type CategorySlug =
  | "new-standard-reagent"
  | "standard-reagent"
  | "reagents"
  | "esight"
  | (string & {});

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  description: string;
  isInstrument?: boolean;
  isActive?: boolean;
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
  fileName?: string;
  fileSize?: string;
  isActive?: boolean;
}

export type ProductAvailabilityStatus = "ready" | "indent" | "out_of_stock";

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
  isActive?: boolean;
  availabilityStatus?: ProductAvailabilityStatus;
  leadTime?: string;
  minOrderQuantity?: string;
}
