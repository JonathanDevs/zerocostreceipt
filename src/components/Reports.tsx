import { useState, useMemo } from 'react';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Receipt } from '../types';

interface ReportsProps {
  receipts: Receipt[];
}

export default function Reports({ receipts }: ReportsProps) {
  const categories = useMemo(() => Array.from(new Set(receipts.map(r => r.categoria_sugerida))).sort(), [receipts]);
  const currencies = useMemo(() => Array.from(new Set(receipts.map(r => r.moneda))).sort(), [receipts]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => receipts.filter(r => {
    if (selectedCategories.length && !selectedCategories.includes(r.categoria_sugerida)) return false;
    if (selectedCurrencies.length && !selectedCurrencies.includes(r.moneda)) return false;
    const rf = r.fecha_emision;
    if (dateFrom && dateTo) {
      if (rf < dateFrom || rf > dateTo) return false;
    } else {
      if (dateFrom && rf < dateFrom) return false;
      if (dateTo && rf > dateTo) return false;
    }
    return true;
  }), [receipts, selectedCategories, selectedCurrencies, dateFrom, dateTo]);

  type TotalsByCurrency = Record<string, { total: number; count: number }>;
  const totals: TotalsByCurrency = useMemo(() => {
    const acc: TotalsByCurrency = {};
    for (const r of filtered) {
      if (!acc[r.moneda]) acc[r.moneda] = { total: 0, count: 0 };
      acc[r.moneda].total += r.total;
      acc[r.moneda].count += 1;
    }
    return acc;
  }, [filtered]);

  const totalsEntries = Object.entries(totals) as [string, { total: number; count: number }][];

  const toggle = (item: string, set: typeof setSelectedCategories, list: string[]) =>
    set(list.includes(item) ? list.filter(c => c !== item) : [...list, item]);

  const selectAll = (all: string[], set: typeof setSelectedCategories, current: string[]) =>
    set(current.length === all.length ? [] : [...all]);

  const minDate = useMemo(() => {
    if (!receipts.length) return '';
    return receipts.reduce((min, r) => r.fecha_emision < min ? r.fecha_emision : min, receipts[0].fecha_emision);
  }, [receipts]);

  const maxDate = useMemo(() => {
    if (!receipts.length) return '';
    return receipts.reduce((max, r) => r.fecha_emision > max ? r.fecha_emision : max, receipts[0].fecha_emision);
  }, [receipts]);

  const tableData = useMemo(() => filtered.map(r => ({
    Fecha: r.fecha_emision,
    Comercio: r.comercio,
    RIF: r.rif_o_identificacion_fiscal || '',
    Categoría: r.categoria_sugerida,
    Moneda: r.moneda,
    Subtotal: r.subtotal,
    'Impuestos': r.impuestos,
    Total: r.total,
    Notas: r.notes || '',
  })), [filtered]);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(tableData);
    const colWidths = [
      { wch: 12 }, { wch: 30 }, { wch: 18 },
      { wch: 16 }, { wch: 8 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 40 },
    ];
    ws['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Gastos');

    const summaryData = totalsEntries.map(([moneda, info]) => ({
      Moneda: moneda,
      'Total Gastado': info.total,
      'Cantidad Recibos': info.count,
    }));
    if (summaryData.length) {
      const ws2 = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Resumen');
    }

    XLSX.writeFile(wb, `ZeroCost_Reporte_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text('ZeroCostReceipt - Reporte de Gastos', 14, 20);
    doc.setFontSize(9);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}  |  Registros: ${filtered.length}`, 14, 28);

    const headers = [['Fecha', 'Comercio', 'RIF', 'Categoría', 'Moneda', 'Subtotal', 'Impuestos', 'Total']];
    const rows = filtered.map(r => [
      r.fecha_emision, r.comercio, r.rif_o_identificacion_fiscal || '',
      r.categoria_sugerida, r.moneda, r.subtotal, r.impuestos, r.total,
    ]);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 34,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [16, 185, 129] as any, textColor: [255, 255, 255] as any, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] as any },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    let yOffset = finalY;
    doc.setFontSize(11);
    doc.text('Resumen por Moneda', 14, yOffset);
    yOffset += 6;
    doc.setFontSize(9);
    for (const [moneda, info] of totalsEntries) {
      doc.text(`${moneda}: Total ${info.total.toFixed(2)}  (${info.count} recibos)`, 14, yOffset);
      yOffset += 5;
    }

    doc.save(`ZeroCost_Reporte_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-gray-100 text-sm">Filtros del Reporte</h3>
          <span className="text-xs text-slate-400 dark:text-gray-500">{receipts.length} recibos en total</span>
        </div>

        {categories.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Categorías</label>
              <button onClick={() => selectAll(categories, setSelectedCategories, selectedCategories)}
                className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer">
                {selectedCategories.length === categories.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button key={cat} onClick={() => toggle(cat, setSelectedCategories, selectedCategories)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedCategories.includes(cat)
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {currencies.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Monedas</label>
              <button onClick={() => selectAll(currencies, setSelectedCurrencies, selectedCurrencies)}
                className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer">
                {selectedCurrencies.length === currencies.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currencies.map(curr => (
                <button key={curr} onClick={() => toggle(curr, setSelectedCurrencies, selectedCurrencies)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedCurrencies.includes(curr)
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600'
                  }`}>
                  {curr}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 block mb-1">Desde</label>
            <input type="date" value={dateFrom}
              min={minDate} max={maxDate || undefined}
              onChange={e => setDateFrom(e.target.value)}
              className="border border-slate-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 cursor-pointer w-full min-w-[140px]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 block mb-1">Hasta</label>
            <input type="date" value={dateTo}
              min={dateFrom || minDate} max={maxDate || undefined}
              onChange={e => setDateTo(e.target.value)}
              className="border border-slate-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 cursor-pointer w-full min-w-[140px]" />
          </div>
          {(dateFrom || dateTo || selectedCategories.length || selectedCurrencies.length) && (
            <button onClick={() => { setSelectedCategories([]); setSelectedCurrencies([]); setDateFrom(''); setDateTo(''); }}
              className="text-xs text-slate-500 dark:text-gray-400 hover:text-black underline cursor-pointer">
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button onClick={exportExcel} disabled={!filtered.length}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
          <FileSpreadsheet className="w-4 h-4" /> Exportar a Excel
        </button>
        <button onClick={exportPDF} disabled={!filtered.length}
          className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
          <FileText className="w-4 h-4" /> Exportar a PDF
        </button>
        {!!filtered.length && (
          <span className="text-xs text-slate-400 dark:text-gray-500 flex items-center">
            <Download className="w-3 h-3 mr-1" /> {filtered.length} recibos listos para exportar
          </span>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-gray-100 text-sm mb-4">
          Vista Previa {filtered.length > 0 && <span className="font-mono text-slate-400 dark:text-gray-500">({filtered.length} recibos)</span>}
        </h3>
        {!filtered.length ? (
          <div className="text-center py-12">
            <p className="text-sm text-slate-400 dark:text-gray-500">No hay recibos que coincidan con los filtros seleccionados.</p>
            <p className="text-xs text-slate-300 mt-1">Ajusta los filtros o agrega recibos desde la sección Cargar Recibos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-gray-700 text-left text-xs text-slate-500 dark:text-gray-400">
                  <th className="pb-2.5 pr-3 font-semibold">Fecha</th>
                  <th className="pb-2.5 pr-3 font-semibold">Comercio</th>
                  <th className="pb-2.5 pr-3 font-semibold">Categoría</th>
                  <th className="pb-2.5 pr-3 font-semibold">Moneda</th>
                  <th className="pb-2.5 pr-3 font-semibold text-right">Subtotal</th>
                  <th className="pb-2.5 pr-3 font-semibold text-right">Impuestos</th>
                  <th className="pb-2.5 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 dark:border-gray-700 last:border-0 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-2.5 pr-3 text-slate-600 dark:text-gray-400">{r.fecha_emision}</td>
                    <td className="py-2.5 pr-3 font-medium">{r.comercio}</td>
                    <td className="py-2.5 pr-3">
                      <span className="bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 px-2 py-0.5 rounded text-[10px] font-semibold">{r.categoria_sugerida}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-slate-500 dark:text-gray-400">{r.moneda}</td>
                    <td className="py-2.5 pr-3 text-right font-mono text-slate-600 dark:text-gray-400">{r.subtotal.toFixed(2)}</td>
                    <td className="py-2.5 pr-3 text-right font-mono text-slate-600 dark:text-gray-400">{r.impuestos.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-mono font-bold">{r.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 dark:border-gray-700 font-bold text-sm">
                  <td colSpan={6} className="pt-3 pr-3 text-right">Totales:</td>
                  <td className="pt-3 text-right font-mono">
                    {totalsEntries.map(([m, t]) => (
                      <div key={m}>{m} {t.total.toFixed(2)}</div>
                    ))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
