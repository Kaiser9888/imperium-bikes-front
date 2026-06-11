// src/components/layout/SearchBar.tsx
'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';

export function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSearch}>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="O que você procura?"
                    className="w-full pl-11 pr-4 py-3.5 bg-white text-gray-800 placeholder-gray-400 rounded-2xl border border-gray-200 focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/10 focus:outline-none transition-all text-sm shadow-sm"
                />
            </div>
        </form>
    );
}