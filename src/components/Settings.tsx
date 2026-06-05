/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Settings, RefreshCw, Trash2, Key, Database, HelpCircle, Check, Sparkles } from 'lucide-react';
import { Receipt } from '../types';

interface SettingsProps {
  receipts: Receipt[];
  onResetToDemo: () => void;
  onClearDatabase: () => void;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
  defaultTaxRate: number;
  onDefaultTaxRateChange: (rate: number) => void;
}

export default function SettingsView({ receipts, onResetToDemo, onClearDatabase, customApiKey, setCustomApiKey, defaultTaxRate, onDefaultTaxRateChange }: SettingsProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [showOverride, setShowOverride] = useState(false);

  const stats = {
    totalRecords: receipts.length,
    dbSizeEstimate: receipts.length > 0 ? (JSON.stringify(receipts).length / 1024).toFixed(2) : '0',
    lastUpdated: receipts.length > 0 ? new Date(Math.max(...receipts.map(r => new Date(r.createdAt).getTime()))).toLocaleString() : 'N/A'
  };

  const copyPromptText = () => {
    const text = 'Extract receipt metadata structured in JSON';
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div id="settings-view-wrapper" className="space-y-6">
      
      {/* 1. API Information & Compliance Card */}
      <div id="api-key-config-card" className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#F3F4F6] dark:bg-gray-700 rounded-xl text-black border border-[#E5E7EB] dark:border-gray-700">
            <Key className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="font-bold text-[#111827] dark:text-gray-100 text-sm">Configuraciones de la API Key</h3>
            <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5 font-semibold">Cómo se gestionan las credenciales inteligentes de Gemini</p>
          </div>
        </div>

        <div className="text-xs text-[#6B7280] dark:text-gray-400 leading-relaxed space-y-3 p-4 bg-[#F9FAFB] dark:bg-gray-700 rounded-xl border border-[#E5E7EB] dark:border-gray-700">
          <p>
            <strong className="text-slate-800 dark:text-gray-100 font-semibold block mb-1">Manejo Automático Integrado:</strong>
            Las llamadas a la API de Gemini se resuelven de forma 100% segura en nuestro servidor Node de procesamiento masivo. La clave 
            <code className="bg-slate-200/60 dark:bg-gray-700 px-1.5 py-0.5 rounded mx-1 text-slate-700 dark:text-gray-300 font-mono font-semibold">GEMINI_API_KEY</code> es inyectada automáticamente 
            por la plataforma desde tus secretos confidenciales en **Settings &gt; Secrets**. No necesitas codificarla manualmente en el navegador.
          </p>
        </div>

        {/* Custom Override Settings */}
        <div className="border-t border-[#E5E7EB] dark:border-gray-700 pt-4 space-y-2">
          <button
            type="button"
            onClick={() => setShowOverride(!showOverride)}
            className="text-xs font-bold text-neutral-600 dark:text-gray-400 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
          >
            {showOverride ? 'Ocultar' : 'Mostrar'} configuraciones de clave personalizadas (avanzado)
          </button>

          {showOverride && (
            <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-3.5 max-w-xl transition-all">
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300 block">Sustituir Clave de Gemini (Opcional):</label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="Inserta tu GEMINI_API_KEY personalizada..."
                className="w-full text-xs px-3.5 py-2.5 border border-[#E5E7EB] dark:border-gray-700 rounded-xl focus:outline-none focus:border-black bg-white dark:bg-gray-800"
              />
              <p className="text-[10px] text-slate-400 dark:text-gray-500">
                Deja este campo en blanco si deseas utilizar la clave gratuita predeterminada de la plataforma en la nube.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Database & Storage Management */}
      <div id="storage-config-card" className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#F3F4F6] dark:bg-gray-700 rounded-xl text-black border border-[#E5E7EB] dark:border-gray-700">
            <Database className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="font-bold text-[#111827] dark:text-gray-100 text-sm">Persistencia Local del Sistema</h3>
            <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5 font-semibold">Controla y monitorea el espacio utilizado por las facturas procesadas ($0 Infraestructura)</p>
          </div>
        </div>

        {/* Local database parameters summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#F9FAFB] dark:bg-gray-700 border border-[#E5E7EB] dark:border-gray-700 rounded-xl space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#6B7280] dark:text-gray-400 uppercase">Facturas Guardadas</span>
            <span className="text-lg font-bold text-neutral-800 dark:text-gray-200 block">{stats.totalRecords}</span>
          </div>
          <div className="p-4 bg-[#F9FAFB] dark:bg-gray-700 border border-[#E5E7EB] dark:border-gray-700 rounded-xl space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#6B7280] dark:text-gray-400 uppercase">Espacio Estimado</span>
            <span className="text-lg font-bold text-neutral-800 dark:text-gray-200 block">{stats.dbSizeEstimate} KB</span>
          </div>
          <div className="p-4 bg-[#F9FAFB] dark:bg-gray-700 border border-[#E5E7EB] dark:border-gray-700 rounded-xl space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#6B7280] dark:text-gray-400 uppercase">Última Operación</span>
            <span className="text-xs font-bold text-neutral-700 dark:text-gray-300 block truncate" title={stats.lastUpdated}>{stats.lastUpdated}</span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-3 border-t border-[#E5E7EB] dark:border-gray-700 pt-5">
          <button
            onClick={() => {
              if (confirm('¿Deseas restaurar la base de datos local con los recibos de demostración precargados?')) {
                onResetToDemo();
              }
            }}
            className="px-6 py-2.5 bg-black hover:opacity-90 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restaurar Demos
          </button>
          
          <button
            onClick={() => {
              if (confirm('¿Estás seguro de vaciar todos los registros importados? Esta acción es irreversible.')) {
                onClearDatabase();
              }
            }}
            className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-red-200 text-red-600 rounded-full font-semibold text-xs hover:bg-red-50 hover:border-red-300 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" /> Borrar Todo
          </button>
        </div>
      </div>

      {/* 3. IVA / Tax Configuration */}
      <div id="tax-config-card" className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#F3F4F6] dark:bg-gray-700 rounded-xl text-black border border-[#E5E7EB] dark:border-gray-700">
            <Sparkles className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="font-bold text-[#111827] dark:text-gray-100 text-sm">Configuración de IVA</h3>
            <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5 font-semibold">Tasa de impuesto predeterminada para cálculos automáticos</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-xs font-bold text-[#6B7280] dark:text-gray-400">Tasa de IVA por defecto:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.5"
              min="0"
              max="100"
              value={defaultTaxRate * 100}
              onChange={(e) => onDefaultTaxRateChange((parseFloat(e.target.value) || 0) / 100)}
              className="w-24 text-xs px-3 py-2 border border-[#E5E7EB] dark:border-gray-700 rounded-xl bg-[#F9FAFB] dark:bg-gray-700 text-center font-mono font-bold focus:outline-none focus:border-black"
            />
            <span className="text-xs font-bold text-[#6B7280] dark:text-gray-400">%</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-gray-500">
            Se aplicará esta tasa a las categorías gravables (Alimentación, Transporte, Tecnología, Hogar, Entretenimiento). 
            Servicios, Educación y Salud se marcan como exentos automáticamente.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { cat: 'Alimentación', rate: defaultTaxRate },
            { cat: 'Servicios', rate: 0 },
            { cat: 'Transporte', rate: defaultTaxRate },
            { cat: 'Tecnología', rate: defaultTaxRate },
            { cat: 'Salud', rate: 0 },
            { cat: 'Hogar', rate: defaultTaxRate },
            { cat: 'Entretenimiento', rate: defaultTaxRate },
            { cat: 'Educación', rate: 0 },
          ].map(({ cat, rate }) => (
            <span key={cat} className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${rate > 0 ? 'bg-black text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400'}`}>
              {cat} {rate > 0 ? `${(rate * 100).toFixed(1)}%` : 'Exento'}
            </span>
          ))}
        </div>
      </div>

      {/* 4. Help Guides for Gemini Integration */}
      <div id="api-integration-help-card" className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#F3F4F6] dark:bg-gray-700 rounded-xl text-black border border-[#E5E7EB] dark:border-gray-700">
            <HelpCircle className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="font-bold text-[#111827] dark:text-gray-100 text-sm">Estructura Tecnológica de Gemini</h3>
            <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5 font-semibold">Qué hace posible la extracción de metadatos e ítems</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-[#6B7280] dark:text-gray-400 leading-relaxed bg-[#F9FAFB] dark:bg-gray-700 p-5 rounded-xl border border-[#E5E7EB] dark:border-gray-700">
          <p>
            Al arrastrar una imagen en la **Zona de Carga Masiva**, nuestro backend Express procesa la imagen leyéndola como un buffer binario 
            codificado en Base64. Éste se envía directamente al modelo con visión <strong>gemini-3.5-flash</strong>.
          </p>
          <p>
            El sistema utiliza el parámetro <code className="bg-slate-200/60 dark:bg-gray-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-gray-300 font-mono font-semibold">responseSchema</code> del SDK para 
            establecer un contrato estricto de schema de salida en JSON. Esto garantiza que todos los cálculos matemáticos (Subtotal, 
            Tasas, Moneda, Ítems individuales) entren limpios al dashboard local.
          </p>

          <button
            onClick={copyPromptText}
            className="mt-2 text-[10px] font-bold text-neutral-700 dark:text-gray-300 hover:text-black flex items-center gap-1 bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 px-3.5 py-2 rounded-full shadow-xs cursor-pointer"
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" /> ¡Copiado!
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Copiar prompt optimizado para extracción
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
