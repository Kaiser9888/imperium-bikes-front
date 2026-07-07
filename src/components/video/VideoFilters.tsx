// components/video/VideoFilters.tsx
'use client'

import { useState, useCallback } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CATEGORIES = [
    { value: 'TUTORIAL', label: ' Tutoriais' },
    { value: 'REVIEW', label: ' Reviews' },
    { value: 'TRAIL', label: '️ Trilhas' },
    { value: 'COMPETITION', label: ' Competições' },
    { value: 'VLOG', label: ' Vlogs' },
    { value: 'UNBOXING', label: ' Unboxings' },
    { value: 'MAINTENANCE', label: ' Manutenção' },
];

const SORT_OPTIONS = [
    { value: 'trending', label: ' Em Alta' },
    { value: 'recent', label: ' Mais Recentes' },
    { value: 'popular', label: ' Mais Vistos' },
    { value: 'liked', label: ' Mais Curtidos' },
];

const DURATION_FILTERS = [
    { value: 'all', label: 'Qualquer Duração' },
    { value: 'under10min', label: '< 10 min' },
    { value: '10to30min', label: '10-30 min' },
    { value: 'over30min', label: '> 30 min' },
];

interface VideoFiltersProps {
    onFilterChange: (filters: any) => void;
    onSearch: (query: string) => void;
    activeFilters: any;
}

export function VideoFilters({ onFilterChange, onSearch, activeFilters }: VideoFiltersProps) {
    const [searchQuery, setSearchQuery] = useState(activeFilters.search || '');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value);
        const timeoutId = setTimeout(() => {
            onSearch(value);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [onSearch]);

    const hasActiveFilters = activeFilters.category ||
        activeFilters.duration !== 'all' ||
        activeFilters.search;

    return (
        <div className="space-y-4">
            {/* Barra de Busca + Filtros */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar vídeos de bike..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 pr-10"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                            onClick={() => {
                                setSearchQuery('');
                                onSearch('');
                            }}
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    )}
                </div>

                {/* Filtros Mobile */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="lg:hidden">
                            <SlidersHorizontal className="w-4 h-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <SheetHeader>
                            <SheetTitle>Filtros</SheetTitle>
                        </SheetHeader>
                        <div className="space-y-6 mt-6">
                            <FilterSection
                                title="Categoria"
                                options={CATEGORIES}
                                value={activeFilters.category}
                                onChange={(value) => onFilterChange({ category: value })}
                            />
                            <FilterSection
                                title="Ordenar por"
                                options={SORT_OPTIONS}
                                value={activeFilters.sortBy}
                                onChange={(value) => onFilterChange({ sortBy: value })}
                            />
                            <FilterSection
                                title="Duração"
                                options={DURATION_FILTERS}
                                value={activeFilters.duration}
                                onChange={(value) => onFilterChange({ duration: value })}
                            />

                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => onFilterChange({
                                        category: undefined,
                                        sortBy: 'trending',
                                        duration: 'all',
                                    })}
                                >
                                    Limpar Filtros
                                </Button>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Tabs de Categorias */}
            <div className="hidden lg:flex items-center gap-2 flex-wrap">
                <Button
                    variant={!activeFilters.category ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFilterChange({ category: undefined })}
                >
                    Todos
                </Button>
                {CATEGORIES.map((cat) => (
                    <Button
                        key={cat.value}
                        variant={activeFilters.category === cat.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => onFilterChange({ category: cat.value })}
                    >
                        {cat.label}
                    </Button>
                ))}
            </div>

            {/* Ordenação e Duração Desktop */}
            <div className="hidden lg:flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onFilterChange({
                                category: undefined,
                                sortBy: 'trending',
                                duration: 'all',
                            })}
                            className="text-muted-foreground"
                        >
                            <X className="w-3 h-3 mr-1" />
                            Limpar filtros
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Select
                        value={activeFilters.sortBy || 'trending'}
                        onValueChange={(value) => onFilterChange({ sortBy: value })}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={activeFilters.duration || 'all'}
                        onValueChange={(value) => onFilterChange({ duration: value })}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {DURATION_FILTERS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Tags Ativas */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                    {activeFilters.category && (
                        <Badge variant="secondary" className="gap-1">
                            {CATEGORIES.find(c => c.value === activeFilters.category)?.label}
                            <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => onFilterChange({ category: undefined })}
                            />
                        </Badge>
                    )}
                    {activeFilters.duration !== 'all' && (
                        <Badge variant="secondary" className="gap-1">
                            {DURATION_FILTERS.find(d => d.value === activeFilters.duration)?.label}
                            <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => onFilterChange({ duration: 'all' })}
                            />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}

// Componente auxiliar para seções de filtro
function FilterSection({ title, options, value, onChange }: any) {
    return (
        <div className="space-y-3">
            <h3 className="font-semibold">{title}</h3>
            <div className="space-y-2">
                {options.map((option: any) => (
                    <Button
                        key={option.value}
                        variant={value === option.value ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => onChange(option.value)}
                    >
                        {option.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}