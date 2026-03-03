export default function KpiCards() {
    return (
        <div className="grid grid-cols-2 gap-4 mt-8 px-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Total Ingresos</p>
                <p className="text-xl font-bold mt-1 text-emerald-700 dark:text-emerald-500">$12,450.00</p>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl">
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Total Egresos</p>
                <p className="text-xl font-bold mt-1 text-rose-700 dark:text-rose-500">$8,210.50</p>
            </div>
        </div>
    );
}
