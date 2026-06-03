/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, PieChart, Info, ShieldAlert } from 'lucide-react';
import { Receipt } from '../types';

interface GraphsProps {
  receipts: Receipt[];
}

const CATEGORY_COLORS: Record<string, { bg: string, border: string, text: string }> = {
  Alimentación: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500' },
  Servicios: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500' },
  Transporte: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500' },
  Tecnología: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-500' },
  Salud: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-500' },
  Entretenimiento: { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-500' },
  Hogar: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-500' },
  Educación: { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-500' },
  Otros: { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-500' },
};

export default function Graphs({ receipts }: GraphsProps) {
  // Extract unique currencies from the database
  const currencies = useMemo(
    () => Array.from(new Set(receipts.map((r) => r.moneda.toUpperCase()))).filter(Boolean),
    [receipts],
  );
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0] || 'USD');

  useEffect(() => {
    if (currencies.length === 0) {
      setSelectedCurrency('USD');
      return;
    }

    if (!currencies.includes(selectedCurrency)) {
      setSelectedCurrency(currencies[0]);
    }
  }, [currencies, selectedCurrency]);

  // Filter calculations purely based on currency context to avoid distorted maths
  const currencyReceipts = useMemo(
    () => receipts.filter((r) => r.moneda.toUpperCase() === selectedCurrency),
    [receipts, selectedCurrency],
  );

  // 1. Calculate spending by category
  const { categorySorted, totalWithCurrency } = useMemo(() => {
    const categorySplit: Record<string, number> = {};
    let total = 0;

    currencyReceipts.forEach((r) => {
      categorySplit[r.categoria_sugerida] = (categorySplit[r.categoria_sugerida] || 0) + r.total;
      total += r.total;
    });

    const sorted = Object.entries(categorySplit)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      categorySorted: sorted,
      totalWithCurrency: total,
    };
  }, [currencyReceipts]);

  // 2. Generate Daily Trend data over the last 10 days
  const trendData = useMemo(() => {
    const last10Days = Array.from({ length: 10 })
      .map((_, idx) => {
        const d = new Date();
        d.setDate(d.getDate() - idx);
        return d.toISOString().split('T')[0];
      })
      .reverse();

    return last10Days.map((dateStr) => {
      const dayTotal = currencyReceipts
        .filter((r) => r.fecha_emision === dateStr)
        .reduce((acc, curr) => acc + curr.total, 0);

      // Format label as readable DD/MM
      const [, month, day] = dateStr.split('-');
      return {
        date: `${day}/${month}`,
        amount: dayTotal,
        rawDate: dateStr,
      };
    });
  }, [currencyReceipts]);

  // Calculate high peak value in trend list to scale the SVG chart heights proportionally
  const maxTrendAmount = useMemo(() => Math.max(...trendData.map((d) => d.amount), 10), [trendData]);

  const chartPaths = useMemo(() => {
    const gap = 500 / (trendData.length - 1);
    const coords = trendData.map((d, idx) => {
      const x = idx * gap;
      // Scale padding: top 20px, total height bounds = 180px
      const y = 200 - ((d.amount / maxTrendAmount) * 170);
      return { x, y };
    });

    const pathStr = coords.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    const areaStr = `${pathStr} L ${coords[coords.length - 1].x} 200 L ${coords[0].x} 200 Z`;

    return {
      coords,
      pathStr,
      areaStr,
    };
  }, [trendData, maxTrendAmount]);

  return (
    <div id="graphs-wrapper" className="space-y-6">
      
      {/* Target Currency Filter panel */}
      <div className="bg-white p-5 border border-[#E5E7EB] rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#F3F4F6] rounded-xl text-black border border-[#E5E7EB]">
            <PieChart className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="font-bold text-[#111827] text-sm">Distribución de Informes Financieros</h3>
            <p className="text-xs text-[#6B7280] mt-0.5 font-semibold">Filtra la moneda actual de las gráficas para evitar inconsistencias de cambio</p>
          </div>
        </div>

        {/* Currency selector chips */}
        <div className="flex gap-1.5" aria-label="Selector de Moneda de Gráficas">
          {currencies.length === 0 ? (
            <span className="text-xs font-semibold text-[#6B7280] bg-[#F3F4F6] px-3.5 py-2 rounded-xl border border-[#E5E7EB]">
              No hay monedas detectadas
            </span>
          ) : (
            currencies.map(curr => (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCurrency === curr
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                }`}
              >
                {curr}
              </button>
            ))
          )}
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center text-[#6B7280] space-y-3 shadow-xs">
          <ShieldAlert className="w-8 h-8 text-[#9CA3AF] mx-auto" />
          <p className="text-sm font-bold text-slate-800">Carga recibos primero para calcular métricas e informes visuales.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Category Distribution Bar Chart */}
          <div id="category-distribution-card" className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#111827] text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-neutral-800" /> Distribución por Categorías
                </h4>
                <p className="text-xs text-[#6B7280] mt-0.5 font-semibold">Gastos ponderados en ({selectedCurrency})</p>
              </div>
              <span className="text-xs font-bold text-[#111827] font-mono">
                Total: {selectedCurrency} {totalWithCurrency.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {categorySorted.length === 0 ? (
              <div className="py-20 text-center text-xs text-[#6B7280] font-semibold">
                Sin registros para la moneda {selectedCurrency}
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {categorySorted.map(({ category, amount, percentage }) => {
                  const colorPair = CATEGORY_COLORS[category] || { bg: 'bg-[#F3F4F6]', border: 'border-[#E5E7EB]', text: 'text-[#6B7280]' };
                  return (
                    <div key={category} id={`category-meter-${category}`} className="space-y-1.5 group">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${colorPair.text.replace('text', 'bg')}`} />
                          {category}
                        </span>
                        <span className="font-mono font-semibold text-neutral-800">
                          {selectedCurrency} {amount.toFixed(2)} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      
                      {/* Meter Slider */}
                      <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${colorPair.text.replace('text', 'bg')}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Custom Line/Area Trend Chart */}
          <div id="spending-trend-card" className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <h4 className="font-bold text-[#111827] text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-650" /> Tendencia de Gasto (Últimos 10 Días)
              </h4>
              <p className="text-xs text-[#6B7280] mt-0.5 font-semibold">Línea de tiempo monetaria en ({selectedCurrency})</p>
            </div>

            {/* Custom Interactive SVG Graph canvas */}
            <div className="w-full pt-4 relative">
              <svg className="w-full h-[220px]" viewBox="0 0 500 220" preserveAspectRatio="none">
                <defs>
                  {/* Under-line translucent gradient */}
                  <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#111827" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#111827" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="160" x2="500" y2="160" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="200" x2="500" y2="200" stroke="#E5E7EB" strokeWidth="1.5" />

                {/* Ground area */}
                {totalWithCurrency > 0 && <path d={chartPaths.areaStr} fill="url(#area-gradient)" />}

                {/* Smooth stroke line */}
                {totalWithCurrency > 0 && (
                  <path
                    d={chartPaths.pathStr}
                    fill="none"
                    stroke="#111827"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                )}

                {/* Interactive node indicator dots with tooltips */}
                {chartPaths.coords.map((c, idx) => {
                  const originalPoint = trendData[idx];
                  if (originalPoint.amount === 0) return null;
                  return (
                    <g key={idx} className="group/node cursor-pointer">
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r="4.5"
                        fill="#FFFFFF"
                        stroke="#111827"
                        strokeWidth="2.5"
                      />
                      {/* Hover larger node shadow effect */}
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r="9"
                        fill="#111827"
                        fillOpacity="0.10"
                        className="opacity-0 group-hover/node:opacity-100 transition-opacity"
                      />
                      
                      {/* Custom SVG Tooltip */}
                      <g className="opacity-0 group-hover/node:opacity-100 transition-all duration-200 pointer-events-none">
                        <rect
                          x={Math.max(c.x - 55, 5)}
                          y={c.y - 45}
                          width="110"
                          height="32"
                          rx="6"
                          fill="#0F172A"
                        />
                        <text
                          x={Math.max(c.x, 60)}
                          y={c.y - 25}
                          fill="#FFFFFF"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {originalPoint.date}: {selectedCurrency} {originalPoint.amount.toFixed(1)}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>

              {/* X Axis Marks */}
              <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1 border-t border-slate-100 pt-1.5">
                {trendData.map((d, idx) => (
                  <span key={idx} className="text-center">{d.date}</span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 font-medium flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <span>
                Coloca el cursor sobre los nodos activos para ver el monto exacto desembolsado ese día. Los días en blanco indican que no hubo consumos.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
