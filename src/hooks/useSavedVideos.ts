"use client";

import { useCallback, useSyncExternalStore } from "react";

// Ainda não existe endpoint de "salvos" no backend: guarda no navegador até ele existir.
const STORAGE_KEY = "imperium:saved-videos";
const listeners = new Set<() => void>();
let cache: string[] | null = null;
const EMPTY: string[] = [];

function read(): string[] {
    if (cache) return cache;
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
        cache = Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
    } catch {
        cache = [];
    }
    return cache;
}

function write(ids: string[]) {
    cache = ids;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
        // modo privado / armazenamento bloqueado: fica só na memória
    }
    listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
    listeners.add(notify);
    const onStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY) {
            cache = null;
            notify();
        }
    };
    window.addEventListener("storage", onStorage);
    return () => {
        listeners.delete(notify);
        window.removeEventListener("storage", onStorage);
    };
}

export function useSavedVideos() {
    const saved = useSyncExternalStore(subscribe, read, () => EMPTY);

    const toggle = useCallback((id: string) => {
        const current = read();
        write(current.includes(id) ? current.filter((v) => v !== id) : [id, ...current]);
    }, []);

    const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

    return { saved, isSaved, toggle };
}
