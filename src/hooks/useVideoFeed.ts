// hooks/useVideoFeed.ts
'use client'

import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

interface VideoFilters {
    category?: string;
    type?: 'SHORT' | 'LONG' | 'ALL';
    sortBy?: 'recent' | 'popular' | 'trending';
    tags?: string[];
    search?: string;
    duration?: 'under10min' | '10to30min' | 'over30min';
}

interface VideoFeedState {
    videos: Video[];
    shorts: Video[];
    page: number;
    hasMore: boolean;
    isLoading: boolean;
    activeFilters: VideoFilters;
}

export function useVideoFeed() {
    const [state, setState] = useState<VideoFeedState>({
        videos: [],
        shorts: [],
        page: 1,
        hasMore: true,
        isLoading: false,
        activeFilters: {
            type: 'ALL',
            sortBy: 'trending',
        },
    });

    // Intersection Observer para infinite scroll
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: '100px',
    });

    // Carregar vídeos
    const fetchVideos = useCallback(async (page: number, filters: VideoFilters) => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                ...(filters.category && { category: filters.category }),
                ...(filters.sortBy && { sortBy: filters.sortBy }),
                ...(filters.search && { search: filters.search }),
                ...(filters.duration && { duration: filters.duration }),
            });

            if (filters.tags?.length) {
                params.append('tags', filters.tags.join(','));
            }

            const response = await fetch(`/api/videos/feed?${params}`);
            const data = await response.json();

            setState(prev => ({
                ...prev,
                videos: page === 1 ? data.videos : [...prev.videos, ...data.videos],
                shorts: page === 1 ? data.shorts : prev.shorts,
                hasMore: data.hasMore,
                isLoading: false,
                page,
            }));
        } catch (error) {
            console.error('Error fetching videos:', error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    // Carregar mais quando scroll chegar no fim
    useEffect(() => {
        if (inView && state.hasMore && !state.isLoading) {
            fetchVideos(state.page + 1, state.activeFilters);
        }
    }, [inView, state.hasMore, state.isLoading]);

    // Aplicar filtros
    const applyFilters = useCallback((filters: Partial<VideoFilters>) => {
        const newFilters = { ...state.activeFilters, ...filters };
        setState(prev => ({ ...prev, activeFilters: newFilters }));
        fetchVideos(1, newFilters);
    }, [state.activeFilters, fetchVideos]);

    // Busca com debounce
    const searchVideos = useCallback((query: string) => {
        applyFilters({ search: query });
    }, [applyFilters]);

    // Carregamento inicial
    useEffect(() => {
        fetchVideos(1, state.activeFilters);
    }, []);

    return {
        ...state,
        applyFilters,
        searchVideos,
        loadMoreRef,
    };
}