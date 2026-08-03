import { useCallback, useEffect, useRef, useState } from "react";
import { fetchVideoPage } from "@/lib/videos/api";
import type { VideoItem } from "@/lib/videos/types";

export function useVideoFeed(isShort = false) {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(false);
    const pageRef = useRef(0);

    const load = useCallback(async () => {
        setLoading(true);
        setError(false);
        pageRef.current = 0;
        try {
            const data = await fetchVideoPage(0, isShort);
            setVideos(data.content);
            setHasMore(!data.last);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [isShort]);

    useEffect(() => {
        void load();
    }, [load]);

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const next = pageRef.current + 1;
            const data = await fetchVideoPage(next, isShort);
            pageRef.current = next;
            setVideos((prev) => [...prev, ...data.content]);
            setHasMore(!data.last);
        } catch {
            /* silencioso */
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, isShort, loadingMore]);

    return { videos, loading, loadingMore, hasMore, error, loadMore, reload: load };
}
