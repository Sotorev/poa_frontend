// src/types/PurchaseType.ts

export interface PurchaseType {
  purchaseTypeId: number;
  name: string;
  isDeleted?: boolean;
}

export interface CreatePurchaseTypeInput {
  name: string;
  isDeleted?: boolean;
}

export interface UpdatePurchaseTypeInput {
  purchaseTypeId: number;
  name?: string;
  isDeleted?: boolean;
}

export interface PurchaseTypeWithColor extends PurchaseType {
  color: string;
}