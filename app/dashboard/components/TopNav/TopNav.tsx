'use client';

export default function TopNav() {
    const handleAlertClick = () => {
        console.log("TopNav: Click en botón de notificaciones");
        alert("TopNav: Click en botón de notificaciones");
    };

    const handleProfileClick = () => {
        console.log("TopNav: Click en foto de perfil");
        alert("TopNav: Click en foto de perfil");
    };

    return (
        <header className="sticky top-0 z-50 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">receipt_long</span>
                <h1 className="text-xl font-bold tracking-tight">ZeroCostReceipt</h1>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleAlertClick}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Notificaciones"
                >
                    <span className="material-symbols-outlined">notifications</span>
                </button>
                <button
                    onClick={handleProfileClick}
                    className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30"
                    aria-label="Perfil"
                >
                    <span className="material-symbols-outlined text-primary text-sm">person</span>
                </button>
            </div>
        </header>
    );
}
