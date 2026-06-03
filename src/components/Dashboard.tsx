/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { CreditCard, Receipt as ReceiptIcon, Scale, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';
import { Receipt, TimeFilter, DateRange } from '../types';

interface DashboardProps {
  receipts: Receipt[];
  activeFilter: TimeFilter;
  setActiveFilter: (filter: TimeFilter) => void;
  customDateRange: DateRange;
  setCustomDateRange: (range: DateRange) => void;
  onNavigateToUpload: () => void;
}

export default function Dashboard({
  receipts,
  activeFilter,
  setActiveFilter,
  customDateRange,
  setCustomDateRange,
  onNavigateToUpload,
}: DashboardProps) {

  // Function to filter receipts by the active time filter
  const filtered = useMemo(() => {
    const now = new Date();
    
    return receipts.filter((receipt) => {
      const emisionDate = new Date(receipt.fecha_emision + 'T00:00:00');
      if (isNaN(emisionDate.getTime())) return true; // fallback for unparseable dates

      if (activeFilter === 'weekly') {
        const diffTime = Math.abs(now.getTime() - emisionDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      
      if (activeFilter === 'monthly') {
        const diffTime = Math.abs(now.getTime() - emisionDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }

      if (activeFilter === 'custom') {
        if (!customDateRange.start && !customDateRange.end) return true;
        
        const receiptTime = emisionDate.getTime();
        
        let inStart = true;
        if (customDateRange.start) {
          const startTime = new Date(customDateRange.start + 'T00:00:00').getTime();
          inStart = receiptTime >= startTime;
        }

        let inEnd = true;
        if (customDateRange.end) {
          const endTime = new Date(customDateRange.end + 'T00:00:00').getTime();
          inEnd = receiptTime <= endTime;
        }

        return inStart && inEnd;
      }

      return true;
    });
  }, [receipts, activeFilter, customDateRange]);

  // Aggregate sums by currency to avoid mixing currencies
  const { currencyTotals, currencyTaxes, categorySummary } = useMemo(() => {
    const totals: Record<string, number> = {};
    const taxes: Record<string, number> = {};
    const categories: Record<string, number> = {};

    filtered.forEach((r) => {
      const cur = r.moneda.toUpperCase();
      totals[cur] = (totals[cur] || 0) + r.total;
      taxes[cur] = (taxes[cur] || 0) + r.impuestos;
      categories[r.categoria_sugerida] = (categories[r.categoria_sugerida] || 0) + 1;
    });

    return {
      currencyTotals: totals,
      currencyTaxes: taxes,
      categorySummary: categories,
    };
  }, [filtered]);

  const categorySummaryEntries = useMemo(
    () => Object.entries(categorySummary) as Array<[string, number]>,
    [categorySummary],
  );

  const currencyTotalsEntries = useMemo(
    () => Object.entries(currencyTotals) as Array<[string, number]>,
    [currencyTotals],
  );

  const currencyTaxesEntries = useMemo(
    () => Object.entries(currencyTaxes) as Array<[string, number]>,
    [currencyTaxes],
  );

  // Determine top spending category based on count
  const topCategoryEntry = useMemo(
    () => categorySummaryEntries.sort((a, b) => b[1] - a[1])[0],
    [categorySummaryEntries],
  );
  const topCategoryName = topCategoryEntry ? topCategoryEntry[0] : 'Ninguna';

  return (
    <div id="dashboard-wrapper" className="space-y-6">
      
      {/* Dynamic Date Filtering Controls Header */}
      <div id="dashboard-timebar" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-800 p-5 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-[#111827] dark:text-gray-100 uppercase tracking-wider font-mono">Seguimiento del Gasto</h2>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5">Filtros dinámicos de tiempo en lote</p>
        </div>

        {/* Filters Group tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="bg-[#F3F4F6] dark:bg-gray-700 p-1 rounded-xl flex gap-1 border border-[#E5E7EB] dark:border-gray-700">
            <button
              onClick={() => setActiveFilter('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeFilter === 'weekly' ? 'bg-white dark:bg-gray-800 text-black dark:text-white font-bold shadow-xs' : 'text-[#6B7280] dark:text-gray-400 hover:text-black'
              }`}
            >
              Semanal (7d)
            </button>
            <button
              onClick={() => setActiveFilter('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeFilter === 'monthly' ? 'bg-white dark:bg-gray-800 text-black dark:text-white font-bold shadow-xs' : 'text-[#6B7280] dark:text-gray-400 hover:text-black'
              }`}
            >
              Mensual (30d)
            </button>
            <button
              onClick={() => setActiveFilter('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeFilter === 'custom' ? 'bg-white dark:bg-gray-800 text-black dark:text-white font-bold shadow-xs' : 'text-[#6B7280] dark:text-gray-400 hover:text-black'
              }`}
            >
              Rango Personalizado
            </button>
          </div>

          {/* Custom Dates Input panel */}
          {activeFilter === 'custom' && (
            <div id="custom-date-inputs" className="flex items-center gap-1.5 bg-[#F9FAFB] dark:bg-gray-700 border border-[#E5E7EB] dark:border-gray-700 rounded-xl px-2.5 py-1.5">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                className="text-xs bg-transparent focus:outline-none text-neutral-800 dark:text-gray-200 font-medium cursor-pointer"
              />
              <span className="text-[10px] uppercase font-mono text-[#9CA3AF] dark:text-gray-500">al</span>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                className="text-xs bg-transparent focus:outline-none text-neutral-800 dark:text-gray-200 font-medium cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI CARDS GRID */}
      <div id="kpi-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Gasto Total */}
        <div id="kpi-card-total-spent" className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-neutral-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#6B7280] dark:text-gray-400 uppercase tracking-widest font-mono">Total Mes</span>
            <div className="p-1.5 bg-[#F3F4F6] dark:bg-gray-700 text-neutral-800 dark:text-gray-200 rounded-lg group-hover:scale-105 transition-transform">
              <CreditCard className="w-3.5 h-3.5 stroke-[1.8]" />
            </div>
          </div>
          <div className="space-y-2">
            {currencyTotalsEntries.length === 0 ? (
              <span className="text-3xl font-light tracking-tighter text-[#111827] dark:text-gray-100 block">$0.00</span>
            ) : (
              currencyTotalsEntries.map(([currency, total]) => (
                <span key={currency} className="text-3xl font-light tracking-tighter text-[#111827] dark:text-gray-100 block leading-none">
                  {currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              ))
            )}
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded w-fit uppercase tracking-wider">
              <span>Suma acumulada</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Impuestos (IVA) */}
        <div id="kpi-card-taxes" className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-neutral-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#6B7280] dark:text-gray-400 uppercase tracking-widest font-mono">Tasas & IVA</span>
            <div className="p-1.5 bg-[#F3F4F6] dark:bg-gray-700 text-neutral-800 dark:text-gray-200 rounded-lg group-hover:scale-105 transition-transform">
              <Scale className="w-3.5 h-3.5 stroke-[1.8]" />
            </div>
          </div>
          <div className="space-y-2">
            {currencyTaxesEntries.length === 0 ? (
              <span className="text-3xl font-light tracking-tighter text-[#111827] dark:text-gray-100 block">$0.00</span>
            ) : (
              currencyTaxesEntries.map(([currency, taxValue]) => (
                <span key={currency} className="text-3xl font-light tracking-tighter text-[#111827] dark:text-gray-100 block leading-none">
                  {currency} {taxValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              ))
            )}
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-[#6B7280] dark:text-gray-400 bg-[#F3F4F6] dark:bg-gray-700 px-2 py-0.5 rounded w-fit uppercase tracking-wider">
              <span>Impuestos estimados</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Recibos procesados */}
        <div id="kpi-card-processed" className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-neutral-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#6B7280] dark:text-gray-400 uppercase tracking-widest font-mono">Facturas Listas</span>
            <div className="p-1.5 bg-[#F3F4F6] dark:bg-gray-700 text-neutral-800 dark:text-gray-200 rounded-lg group-hover:scale-105 transition-transform">
              <ReceiptIcon className="w-3.5 h-3.5 stroke-[1.8]" />
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-3xl font-light tracking-tighter text-[#111827] dark:text-gray-100 block leading-none">
              {filtered.length} <sub className="text-xs text-[#6B7280] dark:text-gray-400 font-normal tracking-normal lowercase">recibos</sub>
            </span>
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-[#6B7280] dark:text-gray-400 bg-[#F3F4F6] dark:bg-gray-700 px-2 py-0.5 rounded w-fit uppercase tracking-wider">
              <span>{receipts.length - filtered.length === 0 ? 'Sin filtros activos' : `${receipts.length - filtered.length} filtrados`}</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Top Category */}
        <div id="kpi-card-top-category" className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-neutral-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#6B7280] dark:text-gray-400 uppercase tracking-widest font-mono">Gasto Principal</span>
            <div className="p-1.5 bg-[#F3F4F6] dark:bg-gray-700 text-neutral-800 dark:text-gray-200 rounded-lg group-hover:scale-105 transition-transform">
              <TrendingUp className="w-3.5 h-3.5 stroke-[1.8]" />
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-2xl font-light tracking-tight text-[#111827] dark:text-gray-100 block truncate leading-none pt-0.5" title={topCategoryName}>
              {topCategoryName}
            </span>
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-neutral-700 dark:text-gray-300 bg-neutral-100 dark:bg-gray-700 px-2 py-0.5 rounded w-fit uppercase tracking-wider">
              <span>{topCategoryEntry ? `${topCategoryEntry[1]} transacciones` : 'Sin registros'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-SECTION SHIFTING IN CASE DATABASE IS COMPLETELY EMPTY */}
      {receipts.length === 0 && (
        <div id="empty-state-card" className="bg-white dark:bg-gray-800 border-2 border-dashed border-[#D1D5DB] rounded-3xl p-12 text-center space-y-6 max-w-2xl mx-auto my-10 shadow-xs">
          <div className="p-5 bg-[#F3F4F6] dark:bg-gray-700 text-neutral-700 dark:text-gray-300 rounded-full w-fit mx-auto">
            <Sparkles className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-[#111827] dark:text-gray-100">¿Listo para digitalizar recibos de forma masiva?</h3>
            <p className="text-xs text-[#6B7280] dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              Descubre el potencial de Gemini 3.5 Flash para extraer subtotales, identificar RIF y desglosar artículos 
              en un pestañear de ojos con nuestra infraestructura costo cero.
            </p>
          </div>
          <button
            onClick={onNavigateToUpload}
            className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-medium cursor-pointer transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2 mx-auto"
          >
            Subir Recibos Ahora <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
