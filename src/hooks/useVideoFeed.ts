"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://imperium-bikes.onrender.com";

interface VideoItem {
    id: string;
    title: string;
    thumbnailUrl: string;
    durationSeconds: number;
    formattedDuration: string;
    viewCount: number;
    likesCount: number;
    commentsCount: number;
    userName: string;
    userAvatarUrl: string;
    createdAt: string;
    isShort: boolean;
}

interface VideoPage {
    content: VideoItem[];
    last: boolean;
}

export function useVideoFeed(isShort: boolean) {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(0);

    const fetchPage = useCallback(async (pageNum: number) => {
        const res = await fetch(
          `${API_URL}/api/videos?page=${pageNum}&size=12&isShort=${isShort}`
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json() as Promise<VideoPage>;
    }, [isShort]);

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const data = await fetchPage(page + 1);
            setVideos((prev) => [...prev, ...data.content]);
            setHasMore(!data.last);
            setPage((p) => p + 1);
        } catch {
            // silencioso
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, hasMore, page, fetchPage]);

    const reload = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const data = await fetchPage(0);
            setVideos(data.content);
            setHasMore(!data.last);
            setPage(0);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [fetchPage]);

    useEffect(() => {
        reload();
    }, [reload]);

    return { videos, loading, loadingMore, hasMore, error, loadMore, reload };
}