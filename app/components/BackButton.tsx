'use client';

import { useRouter } from "next/navigation";

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white transition hover:bg-blue-700"
        >
            Regresar
        </button>
    );
}
