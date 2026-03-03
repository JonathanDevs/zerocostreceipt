import TopNav from "./components/TopNav/TopNav";
import BottomNav from "./components/BottomNav/BottomNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <TopNav />
            {/* 
        El main se encarga del scroll vertical de la aplicación.
        Tiene padding-bottom para que el BottomNav no tape el contenido,
        centrado opcional en pantallas más grandes con mx-auto max-w-md
      */}
            <main className="flex-1 overflow-y-auto pb-24 w-full md:max-w-md lg:max-w-xl mx-auto sm:border-x border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark shadow-sm">
                {children}
            </main>
            <BottomNav />
        </>
    );
}
