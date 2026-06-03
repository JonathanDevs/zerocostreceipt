/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, BarChart3, UploadCloud, Settings, Receipt as ReceiptIcon, FileDown } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  receiptCount: number;
  mobileSidebarOpen: boolean;
}

export default function Sidebar({ activeTab, setActiveTab, receiptCount, mobileSidebarOpen }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'reports', label: 'Reportes y Gráficas', icon: BarChart3 },
    { id: 'upload', label: 'Cargar Recibos', icon: UploadCloud, badge: receiptCount > 0 ? receiptCount : undefined },
    { id: 'export', label: 'Exportar Reportes', icon: FileDown },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside
      id="sidebar-container"
      className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform bg-white dark:bg-gray-800 text-neutral-800 dark:text-gray-200 flex flex-col justify-between border-r border-[#E5E7EB] dark:border-gray-700 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      <div className="px-5 py-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white flex-shrink-0">
            <ReceiptIcon className="w-4.5 h-4.5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[#111827] dark:text-gray-100 leading-tight">ZeroCost</h1>
            <span className="text-[11px] font-semibold text-[#6B7280] dark:text-gray-400">Procesador IA $0 Cost</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1" aria-label="Sidebar Navigation">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#F3F4F6] dark:bg-gray-700 text-black dark:text-white font-semibold'
                    : 'text-[#6B7280] dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-[#F9FAFB] dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-4 h-4 transition-transform duration-150 ${isActive ? 'text-black dark:text-white' : 'text-[#6B7280] dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-black dark:bg-gray-600 text-white' : 'bg-[#E5E7EB] dark:bg-gray-600 text-[#4B5563] dark:text-gray-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-5 mt-auto">
        <div className="bg-[#F3F4F6] dark:bg-gray-700 p-4 rounded-xl space-y-2.5">
          <p className="text-[10px] text-[#6B7280] dark:text-gray-400 uppercase font-bold tracking-wider leading-none">Estado API</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-[#111827] dark:text-gray-100">Gemini Free Tier</span>
          </div>
          <div className="text-[10px] text-[#9CA3AF] dark:text-gray-500 font-mono leading-none border-t border-[#E5E7EB] dark:border-gray-600 pt-2.5 flex justify-between">
            <span>DB: LocalStorage</span>
            <span className="text-emerald-600 font-bold">● En Línea</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
