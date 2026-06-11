// src/components/home/BikeFeed.tsx
'use client';

import { useEffect, useState } from 'react';
import { productService } from '@/services/productService';

// Definir tipos adequados
interface Product {
    id: number;
    title: string;
    nome?: string;
    description: string;
    price: number;
    imageUrl?: string;
}

interface ApiResponse {
    content: Product[];
    totalElements: number;
    totalPages: number;
}

export default function BikeFeed() {
    const [bikes, setBikes] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadBikes = async () => {
            try {
                setLoading(true);
                const data: ApiResponse = await productService.getAll();

                // A API retorna { content: [], pageable: {...}, ... }
                const products = data.content || [];

                setBikes(products);
                console.log('✅ Bikes carregadas:', products.length);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error
                    ? err.message
                    : 'Erro desconhecido ao carregar produtos';

                console.error('Erro ao carregar bikes:', errorMessage);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadBikes();
    }, []);

    if (loading) {
        return (
            <div className="p-4 text-center">
                <p className="text-gray-500">Carregando produtos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center">
                <p className="text-red-500">Erro: {error}</p>
            </div>
        );
    }

    if (bikes.length === 0) {
        return (
            <div className="p-4 text-center">
                <p className="text-gray-500">Nenhum produto cadastrado ainda.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {bikes.map((bike: Product) => (
                <div
                    key={bike.id}
                    className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                    <h3 className="font-bold text-lg">
                        {bike.title || bike.nome || 'Sem título'}
                    </h3>
                    <p className="text-gray-600 mt-2">
                        {bike.description || 'Sem descrição'}
                    </p>
                    <p className="text-xl font-bold mt-4 text-green-600">
                        R$ {bike.price?.toFixed(2) || '0.00'}
                    </p>
                </div>
            ))}
        </div>
    );
}