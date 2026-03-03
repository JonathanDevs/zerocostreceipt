'use client';

export default function UploadZone() {
    const handleUploadClick = () => {
        console.log('UploadZone: Se abrió el selector de archivos');
        alert('Simulando apertura de selector de archivos...');
    };

    return (
        <div className="mt-6 px-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900/50">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                </div>
                <div className="text-center">
                    <p className="font-bold text-slate-900 dark:text-white">Sube tus comprobantes</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Soporta PDF, JPG, PNG</p>
                </div>
                <button
                    onClick={handleUploadClick}
                    className="mt-2 bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20"
                >
                    Seleccionar Archivos
                </button>
            </div>
        </div>
    );
}
