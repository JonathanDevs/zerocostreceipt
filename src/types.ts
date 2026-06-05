/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ReceiptItem {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Receipt {
  id: string;
  fecha_emision: string; // YYYY-MM-DD
  comercio: string;
  rif_o_identificacion_fiscal: string | null;
  subtotal: number;
  impuestos: number;
  total: number;
  moneda: string; // USD, VES, EUR, etc.
  categoria_sugerida: string; // Alimentación, Servicios, Transporte, etc.
  isTaxable: boolean;
  taxRate: number; // 0.16 = 16%
  items: ReceiptItem[];
  imageUrl?: string; // local storage data URL or image path if stored
  notes?: string;
  createdAt: string; // ISO string
}

export type TimeFilter = 'weekly' | 'monthly' | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

export interface DashboardStats {
  totalSpent: number;
  currencySplit: Record<string, number>;
  categorySplit: Record<string, number>;
  receiptCount: number;
}
