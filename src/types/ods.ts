// src/types/ods.ts

export interface ODS {
  odsId: number;
  name: string;
  description?: string | null;
  isDeleted?: boolean;
  colorHex?: string | null;
  sortNo?: number | null;
}
