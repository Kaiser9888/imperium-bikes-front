// app/perfil/page.tsx
'use client';

import { useUser } from '@clerk/nextjs';

export default function PerfilPage() {
    const { user, isLoaded } = useUser();

    if (!isLoaded) return <div>Carregando...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <p>Nome: {user?.fullName}</p>
                <p>Email: {user?.primaryEmailAddress?.emailAddress}</p>
                <p className="text-gray-500 mt-4">Página em construção...</p>
            </div>
        </div>
    );
}