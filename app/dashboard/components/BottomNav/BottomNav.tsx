'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
    const pathname = usePathname();

    const handleNavClick = (route: string) => {
        console.log(`BottomNav: Navegando a ${route}`);
    };

    return (
        <nav className="fixed bottom-0 w-full bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pb-safe">
            <div className="flex items-center justify-around h-16">
                <Link
                    href="/dashboard"
                    onClick={() => handleNavClick('/dashboard')}
                    className={`flex flex-col items-center gap-1 ${pathname === '/dashboard' ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
                >
                    <span className={`material-symbols-outlined ${pathname === '/dashboard' ? 'fill-1' : ''}`}>home</span>
                    <span className="text-[10px] font-medium">Inicio</span>
                </Link>
                <Link
                    href="/dashboard/history"
                    onClick={() => handleNavClick('/dashboard/history')}
                    className={`flex flex-col items-center gap-1 ${pathname === '/dashboard/history' ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
                >
                    <span className="material-symbols-outlined">history</span>
                    <span className="text-[10px] font-medium">Historial</span>
                </Link>
                <Link
                    href="/dashboard/reports"
                    onClick={() => handleNavClick('/dashboard/reports')}
                    className={`flex flex-col items-center gap-1 ${pathname === '/dashboard/reports' ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
                >
                    <span className="material-symbols-outlined">analytics</span>
                    <span className="text-[10px] font-medium">Reportes</span>
                </Link>
                <Link
                    href="/dashboard/settings"
                    onClick={() => handleNavClick('/dashboard/settings')}
                    className={`flex flex-col items-center gap-1 ${pathname === '/dashboard/settings' ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
                >
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-[10px] font-medium">Ajustes</span>
                </Link>
            </div>
        </nav>
    );
}
