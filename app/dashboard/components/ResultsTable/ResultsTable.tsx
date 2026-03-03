// Componente Servidor
export default function ResultsTable() {
    // Simulando que provienen de una base de datos o API. Si estuviera vacío, podríamos renderizar un estado vacío.
    const transactions = [
        { id: 1, date: '12/10/23', bank: 'Santander', concept: 'Pago Internet', amount: '$599.00', type: 'expense' },
        { id: 2, date: '11/10/23', bank: 'BBVA', concept: 'Transferencia Recibida', amount: '$2,500.00', type: 'income' },
        { id: 3, date: '10/10/23', bank: 'HSBC', concept: 'Súper Xpress', amount: '$1,234.10', type: 'expense' },
    ];

    return (
        <div className="mt-8 space-y-4 px-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Resultados de la Extracción</h3>

            {transactions.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    No hay resultados aún de extracciones. Sube un documento para comenzar.
                </div>
            ) : (
                <div className="overflow-x-auto -mx-4 px-4">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                <th className="pb-2">FECHA</th>
                                <th className="pb-2">BANCO</th>
                                <th className="pb-2">CONCEPTO</th>
                                <th className="pb-2 text-right">MONTO</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="text-xs">
                                    <td className="py-3 text-slate-500">{tx.date}</td>
                                    <td className="py-3 font-medium">{tx.bank}</td>
                                    <td className="py-3">{tx.concept}</td>
                                    <td className={`py-3 text-right font-bold ${tx.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {tx.amount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
