import BackButton from "@/app/components/BackButton";

export default async function UserDetails({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    console.log('Estoy renderizando desde el servidor', id)
    return (
        <div className="p-4">
            <BackButton />
            <h1 className="text-2xl font-bold mb-4">Detalles del Usuario {id}</h1>
        </div>
    )
}
