'use client';

export default function ProcessingQueue() {
    const handleViewReceipt = (receiptName: string) => {
        console.log(`ProcessingQueue: Viendo detalle de ${receiptName}`);
    };

    return (
        <div className="space-y-3 mt-8 px-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Cola de Procesamiento</h3>
                <span className="text-xs font-medium text-primary">2 pendientes</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
                <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="animate-spin size-5 border-2 border-primary border-t-transparent rounded-full"></div>
                        <div>
                            <p className="text-sm font-medium">factura_servicio_04.pdf</p>
                            <p className="text-[10px] text-slate-500">Extrayendo datos...</p>
                        </div>
                    </div>
                    <span className="text-xs font-semibold text-primary">45%</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                        <div>
                            <p className="text-sm font-medium">recibo_nomina_jan.png</p>
                            <p className="text-[10px] text-emerald-500">Completado</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleViewReceipt('recibo_nomina_jan.png')}
                        className="text-slate-400 hover:text-primary transition-colors"
                        aria-label="Ver documento"
                    >
                        <span className="material-symbols-outlined">visibility</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
