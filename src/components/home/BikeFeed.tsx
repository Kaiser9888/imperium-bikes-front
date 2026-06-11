// src/components/home/BikeFeed.tsx
'use client';

import { useEffect, useState } from 'react';
import { productService } from '@/services/productService';

export default function BikeFeed() {
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadBikes();
    }, []);

    async function loadBikes() {
        try {
            setLoading(true);
            const data = await productService.getAll();

            // A API retorna { content: [], pageable: {...}, ... }
            // Extrair o array de produtos
            const products = data.content || data || [];

            setBikes(products);
            console.log('✅ Bikes carregadas:', products.length);
        } catch (err: any) {
            console.error('Erro ao carregar bikes:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-4">Carregando produtos...</div>;
    if (error) return <div className="p-4 text-red-500">Erro: {error}</div>;
    if (bikes.length === 0) return <div className="p-4">Nenhum produto cadastrado ainda.</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {bikes.map((bike: any) => (
                <div key={bike.id} className="border rounded-lg p-4">
                    <h3 className="font-bold">{bike.title || bike.nome}</h3>
                    <p className="text-gray-600">{bike.description}</p>
                    <p className="text-lg font-bold mt-2">
                        R$ {bike.price?.toFixed(2)}
                    </p>
                </div>
            ))}
        </div>
    );
}