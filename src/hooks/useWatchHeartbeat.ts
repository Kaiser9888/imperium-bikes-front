"use client";

import { useEffect, type RefObject } from "react";
import { useAuth } from "@clerk/nextjs";

import { sendWatchTime } from "@/lib/videos/api";

/** Envia a cada 15s assistidos (o backend aceita até 120 por envio). */
const FLUSH_EVERY_SECONDS = 15;
/** Saltos maiores que isso entre dois timeupdate são seek, não tempo assistido. */
const MAX_TICK_SECONDS = 2;

type MediaLike = Pick<HTMLMediaElement, "currentTime" | "paused" | "addEventListener" | "removeEventListener">;

/**
 * Mede o tempo realmente assistido do player e manda para o backend, que decide quando
 * conta a view (≈30s, uma vez por pessoa a cada 24h) e soma as horas da monetização.
 */
export function useWatchHeartbeat(playerRef: RefObject<MediaLike | null>, videoId: string | undefined) {
    const { getToken } = useAuth();

    useEffect(() => {
        const player = playerRef.current;
        if (!player || !videoId) return;

        let lastTime = player.currentTime;
        let pending = 0;

        const flush = () => {
            if (pending < 1) return;
            const seconds = pending;
            pending = 0;
            getToken()
                .catch(() => null)
                .then((token) => sendWatchTime(videoId, seconds, token));
        };

        const onTime = () => {
            const now = player.currentTime;
            const delta = now - lastTime;
            lastTime = now;
            if (player.paused || delta <= 0 || delta > MAX_TICK_SECONDS) return;
            pending += delta;
            if (pending >= FLUSH_EVERY_SECONDS) flush();
        };
        const onSeek = () => {
            lastTime = player.currentTime;
        };
        const onHide = () => {
            if (document.visibilityState === "hidden") flush();
        };

        player.addEventListener("timeupdate", onTime);
        player.addEventListener("seeked", onSeek);
        player.addEventListener("pause", flush);
        document.addEventListener("visibilitychange", onHide);
        window.addEventListener("pagehide", flush);

        return () => {
            flush();
            player.removeEventListener("timeupdate", onTime);
            player.removeEventListener("seeked", onSeek);
            player.removeEventListener("pause", flush);
            document.removeEventListener("visibilitychange", onHide);
            window.removeEventListener("pagehide", flush);
        };
    }, [playerRef, videoId, getToken]);
}
