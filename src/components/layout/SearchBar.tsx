'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';

export function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (query.trim()) router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
    };

    return (
        <form onSubmit={handleSearch}>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B0000]" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar no reino..."
                    className="w-full pl-11 pr-4 py-3 bg-[#2F2F2F] text-[#D4C5A9] placeholder-[#8B0000] rounded border border-[#8B0000]/30 focus:border-[#DC143C] focus:outline-none text-sm"
                />
            </div>
        </form>
    );
}