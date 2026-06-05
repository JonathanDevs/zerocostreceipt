/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Menu, Zap, Sun, Moon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ReceiptTable from './components/ReceiptTable';
import UploadZone from './components/UploadZone';
import Graphs from './components/Graphs';
import SettingsView from './components/Settings';
import Reports from './components/Reports';
import { DEMO_RECEIPTS } from './demoData';
import { Receipt, TimeFilter, DateRange } from './types';
import {
  loadReceipts,
  saveReceipts as persistReceipts,
  loadCustomApiKey,
  saveCustomApiKey,
  clearCustomApiKey,
} from './storage';

export default function App() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('zerocostreceipt:darkmode');
    return saved === 'true';
  });
  const [defaultTaxRate, setDefaultTaxRate] = useState(() => {
    const saved = localStorage.getItem('zerocostreceipt:defaultTaxRate');
    return saved ? parseFloat(saved) : 0.16;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('zerocostreceipt:darkmode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('zerocostreceipt:defaultTaxRate', String(defaultTaxRate));
  }, [defaultTaxRate]);

  // Time Filters for Dashboard KPIs
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('monthly');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({ start: '', end: '' });

  // Initial State Hydration with local storage persistence
  useEffect(() => {
    const storedReceipts = loadReceipts();
    if (storedReceipts && storedReceipts.length > 0) {
      setReceipts(storedReceipts);
    } else {
      // Warm welcome with gorgeous preloaded data
      setReceipts(DEMO_RECEIPTS);
      persistReceipts(DEMO_RECEIPTS);
    }

    setCustomApiKey(loadCustomApiKey());
  }, []);

  // Save changes to LocalStorage on updates
  const saveReceipts = useCallback((updatedList: Receipt[]) => {
    setReceipts(updatedList);
    persistReceipts(updatedList);
  }, []);

  const handleReceiptAdded = useCallback((newReceipt: Receipt) => {
    setReceipts((prev) => {
      const newList = [newReceipt, ...prev];
      persistReceipts(newList);
      return newList;
    });
  }, []);

  const handleReceiptUpdated = useCallback((modifiedReceipt: Receipt) => {
    setReceipts((prev) => {
      const newList = prev.map((r) => (r.id === modifiedReceipt.id ? modifiedReceipt : r));
      persistReceipts(newList);
      return newList;
    });
  }, []);

  const handleReceiptDeleted = useCallback((id: string) => {
    if (confirm('¿Estás seguro de eliminar este recibo?')) {
      setReceipts((prev) => {
        const newList = prev.filter((r) => r.id !== id);
        persistReceipts(newList);
        return newList;
      });
    }
  }, []);

  // Re-load demo dataset in case user wipes database
  const handleResetToDemo = () => {
    saveReceipts(DEMO_RECEIPTS);
  };

  // Completely wipe local database
  const handleClearDatabase = () => {
    saveReceipts([]);
  };

  // Handle custom API key persistence
  const handleSetCustomApiKey = useCallback((key: string) => {
    setCustomApiKey(key);
    saveCustomApiKey(key);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 font-sans text-[#111827] dark:text-gray-100 selection:bg-black/10 dark:selection:bg-white/10 antialiased flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileSidebarOpen(false);
        }}
        receiptCount={receipts.length}
        mobileSidebarOpen={mobileSidebarOpen}
      />

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* Main Container Core Layout */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-25 bg-white dark:bg-gray-800 border-b border-[#E5E7EB] dark:border-gray-700 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Trigger button */}
            <button
              onClick={() => setMobileSidebarOpen((prev) => !prev)}
              className="p-1.5 hover:bg-[#F3F4F6] rounded-lg text-[#6B7280] md:hidden cursor-pointer"
              aria-label="Abrir barra lateral"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>

            {/* Current Context Heading depending on activeTab */}
            <div>
              <h2 className="text-base font-bold text-[#111827] dark:text-gray-100 leading-snug">
                {activeTab === 'dashboard' && 'Panel de Control Principal'}
                {activeTab === 'reports' && 'Métricas e Informes Analíticos'}
                {activeTab === 'upload' && 'Historial e Importación Masiva'}
                {activeTab === 'export' && 'Exportar Reportes'}
                {activeTab === 'settings' && 'Mantenimiento del Sistema'}
              </h2>
              <span className="text-xs text-[#6B7280] dark:text-gray-400 font-semibold">
                {activeTab === 'dashboard' && 'Visión general de gastos y digitalizaciones'}
                {activeTab === 'reports' && 'Distribución categórica y flujos de tendencia'}
                {activeTab === 'upload' && 'Arrastra tus facturas para análisis instantáneo por IA'}
                {activeTab === 'export' && 'Genera reportes en Excel y PDF filtrados por categorías'}
                {activeTab === 'settings' && 'Personalizar API de Gemini y restablecer bases de datos'}
              </span>
            </div>
          </div>

          {/* User Profile Widget Area */}
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button onClick={() => setDarkMode(prev => !prev)}
              className="p-2 rounded-full hover:bg-[#F3F4F6] dark:hover:bg-gray-700 text-[#6B7280] dark:text-gray-300 transition-all cursor-pointer"
              aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}>
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Status indicators */}
            <div className="hidden lg:flex items-center gap-2.5 bg-[#F3F4F6] border border-[#E5E7EB] px-3.5 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider font-mono">
                IA: {customApiKey ? 'Key Propia' : 'AI Studio Free Tier'}
              </span>
            </div>

            {/* User credentials */}
            <div className="flex items-center gap-2 border-l border-[#E5E7EB] pl-4">
              <div className="hidden sm:block text-right">
                <span className="text-xs font-bold text-[#111827] block">Usuario Local</span>
                <span className="text-[9px] font-mono text-[#6B7280] block truncate max-w-[150px]">
                  development.ven@gmail.com
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs border border-white shadow-xs">
                DV
              </div>
            </div>
          </div>
        </header>

        {/* Global Banner for Custom Key if active */}
        {customApiKey && (
          <div className="bg-[#F3F4F6] dark:bg-gray-800 border-b border-[#E5E7EB] dark:border-gray-700 px-8 py-2 md:py-2.5 flex items-center justify-between text-xs text-[#4B5563] dark:text-gray-300">
            <span className="font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-neutral-800" /> Clave de API personalizada activa. Las consultas a Gemini se resolverán con tu cuota de desarrollador.
            </span>
            <button
              onClick={() => {
                clearCustomApiKey();
                setCustomApiKey('');
              }}
              className="text-[10px] font-bold text-neutral-800 dark:text-gray-200 hover:text-black dark:hover:text-white bg-white dark:bg-gray-700 border border-[#E5E7EB] dark:border-gray-600 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              Desactivar Override
            </button>
          </div>
        )}

        {/* Content Dynamic Container */}
        <main className="p-8 flex-1 max-w-7xl w-full mx-auto space-y-8">
          
          {/* Renders Tab: Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <Dashboard
                receipts={receipts}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                customDateRange={customDateRange}
                setCustomDateRange={setCustomDateRange}
                onNavigateToUpload={() => setActiveTab('upload')}
              />
              <div className="border-t border-[#E5E7EB] dark:border-gray-700 pt-6">
                <h3 className="text-sm font-bold text-[#111827] dark:text-gray-100 mb-3 font-mono uppercase tracking-wider">Historial de Transacciones Recientes</h3>
                <ReceiptTable
                  receipts={receipts}
                  onReceiptUpdated={handleReceiptUpdated}
                  onReceiptDeleted={handleReceiptDeleted}
                  defaultTaxRate={defaultTaxRate}
                />
              </div>
            </div>
          )}

          {/* Renders Tab: Reports */}
          {activeTab === 'reports' && (
            <Graphs receipts={receipts} />
          )}

          {/* Renders Tab: Upload (Cargar Recibos) */}
          {activeTab === 'upload' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left column: Upload interaction */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-800 dark:text-gray-100 text-sm">Nueva Carga de Recibos</h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                    Al arrastrar múltiples imágenes simultáneamente, el sistema inicializará cargas en cola paralela 
                    procesando cada archivo mediante visión artificial y entregándolos directamente al historial local.
                  </p>
                </div>
                <UploadZone
                  onReceiptAdded={handleReceiptAdded}
                  customApiKey={customApiKey}
                />
              </div>

              {/* Right column: Dynamic queue list */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-gray-100 font-mono uppercase tracking-wider">Lista de Cargas Registradas</h3>
                  <span className="text-xs text-slate-400 dark:text-gray-500 font-medium">Total: {receipts.length} recibos procesados</span>
                </div>
                <ReceiptTable
                  receipts={receipts}
                  onReceiptUpdated={handleReceiptUpdated}
                  onReceiptDeleted={handleReceiptDeleted}
                  defaultTaxRate={defaultTaxRate}
                />
              </div>
            </div>
          )}

          {/* Renders Tab: Export */}
          {activeTab === 'export' && (
            <Reports receipts={receipts} />
          )}

          {/* Renders Tab: Settings */}
          {activeTab === 'settings' && (
            <SettingsView
              receipts={receipts}
              onResetToDemo={handleResetToDemo}
              onClearDatabase={handleClearDatabase}
              customApiKey={customApiKey}
              setCustomApiKey={handleSetCustomApiKey}
              defaultTaxRate={defaultTaxRate}
              onDefaultTaxRateChange={setDefaultTaxRate}
            />
          )}

        </main>
      </div>
    </div>
  );
}
