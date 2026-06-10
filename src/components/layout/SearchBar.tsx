'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

export function SearchBar() {
    const [query, setQuery] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            window.location.href = `/buscar?q=${encodeURIComponent(query.trim())}`
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
            <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
            }}>
                <Search
                    size={20}
                    color="#999"
                    style={{
                        position: 'absolute',
                        left: '14px',
                        pointerEvents: 'none'
                    }}
                />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar no marketplace..."
                    style={{
                        width: '100%',
                        padding: '14px 16px 14px 44px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e5e5',
                        borderRadius: '12px',
                        fontSize: '16px',
                        color: '#333',
                        outline: 'none',
                        transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = '#DC2626'
                        e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)'
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#e5e5e5'
                        e.target.style.boxShadow = 'none'
                    }}
                />
            </div>
        </form>
    )
}