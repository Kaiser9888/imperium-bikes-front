'use client';
import { useUser } from '@clerk/nextjs';

export default function PerfilPage() {
    const { user, isLoaded } = useUser();
    if (!isLoaded) return <div className="p-6">Carregando...</div>;
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Meu Perfil</h1>
            {user && (
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-lg">Nome: {user.fullName}</p>
                    <p className="text-gray-600">Email: {user.primaryEmailAddress?.emailAddress}</p>
                </div>
            )}
        </div>
    );
}
