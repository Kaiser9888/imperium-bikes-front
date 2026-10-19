"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import { fetchVideoPage, searchVideos } from "@/lib/videos/api";
import type { FeedOrder, VideoItem } from "@/lib/videos/types";

interface FeedOptions {
    isShort?: boolean;
    order?: FeedOrder;
    /** Com texto, busca no servidor (título, descrição, criador) em vez do feed. */
    query?: string;
    /** false: não busca nada (ex.: busca com a caixa vazia). */
    enabled?: boolean;
}

interface FeedState {
    /** De qual combinação de filtros são estes dados: trocar o filtro vira "carregando" sem setState no efeito. */
    key: string;
    videos: VideoItem[];
    page: number;
    hasMore: boolean;
    error: boolean;
}

const EMPTY: FeedState = { key: "", videos: [], page: 0, hasMore: false, error: false };

/** Feed paginado vindo do servidor: ordenação, busca e reações (liked) já resolvidas lá. */
export function useVideoFeed({ isShort = false, order = "recent", query = "", enabled = true }: FeedOptions = {}) {
    const { getToken, isLoaded } = useAuth();
    const key = `${isShort}|${order}|${query.trim()}`;

    const [state, setState] = useState<FeedState>(EMPTY);
    const [loadingMore, setLoadingMore] = useState(false);
    const [reloadTick, setReloadTick] = useState(0);

    const fetchPage = useCallback(
        async (page: number) => {
            const token = await getToken().catch(() => null);
            return query.trim()
                ? searchVideos(query, page, token)
                : fetchVideoPage(page, isShort, { order, token });
        },
        [getToken, isShort, order, query]
    );

    useEffect(() => {
        if (!isLoaded || !enabled) return;
        let cancelled = false;
        fetchPage(0)
            .then((data) => {
                if (!cancelled) setState({ key, videos: data.content, page: 0, hasMore: !data.last, error: false });
            })
            .catch(() => {
                if (!cancelled) setState({ ...EMPTY, key, error: true });
            });
        return () => {
            cancelled = true;
        };
    }, [fetchPage, key, isLoaded, enabled, reloadTick]);

    const loadMore = useCallback(async () => {
        if (loadingMore || !state.hasMore || state.key !== key) return;
        setLoadingMore(true);
        try {
            const next = state.page + 1;
            const data = await fetchPage(next);
            setState((current) => {
                if (current.key !== key) return current;
                const seen = new Set(current.videos.map((v) => v.id));
                return {
                    ...current,
                    videos: [...current.videos, ...data.content.filter((v) => !seen.has(v.id))],
                    page: next,
                    hasMore: !data.last,
                };
            });
        } catch {
            // mantém o que já está na tela; o botão "Ver mais" continua disponível
        } finally {
            setLoadingMore(false);
        }
    }, [fetchPage, key, loadingMore, state.hasMore, state.key, state.page]);

    const reload = useCallback(() => {
        setState(EMPTY);
        setReloadTick((t) => t + 1);
    }, []);

    const current = state.key === key;
    return {
        videos: current ? state.videos : [],
        loading: !current,
        loadingMore,
        hasMore: current && state.hasMore,
        error: current && state.error,
        loadMore,
        reload,
    };
}
