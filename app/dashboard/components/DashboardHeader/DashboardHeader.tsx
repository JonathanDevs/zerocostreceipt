'use client';

export default function DashboardHeader() {
    const handleFilterClick = (filterName: string) => {
        console.log(`Filtro clicado: ${filterName}`);
    };

    const handleExportClick = (format: string) => {
        console.log(`Exportar clicado: ${format}`);
        alert(`Generando reporte en ${format}...`);
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Dashboard Principal</h2>
                <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-1 w-full">
                    <button
                        onClick={() => handleFilterClick('Semana')}
                        className="flex-1 py-2 text-sm font-medium rounded-lg bg-background-light dark:bg-background-dark shadow-sm text-primary"
                    >
                        Semana
                    </button>
                    <button
                        onClick={() => handleFilterClick('Mes')}
                        className="flex-1 py-2 text-sm font-medium rounded-lg text-slate-500 dark:text-slate-400"
                    >
                        Mes
                    </button>
                    <button
                        onClick={() => handleFilterClick('Personalizado')}
                        className="flex-1 py-2 text-sm font-medium rounded-lg text-slate-500 dark:text-slate-400"
                    >
                        Personalizado
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleExportClick('Excel')}
                        className="flex items-center justify-center gap-2 bg-emerald-600/20 text-emerald-500 border border-emerald-600/30 py-2.5 rounded-xl text-sm font-bold"
                    >
                        <span className="material-symbols-outlined text-sm">description</span>
                        Excel
                    </button>
                    <button
                        onClick={() => handleExportClick('PDF')}
                        className="flex items-center justify-center gap-2 bg-rose-600/20 text-rose-500 border border-rose-600/30 py-2.5 rounded-xl text-sm font-bold"
                    >
                        <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                        PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
