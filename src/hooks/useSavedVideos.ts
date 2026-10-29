"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { fetchSavedIds, saveVideo } from "@/lib/videos/api";

// Logado: salvos ficam na conta (aparecem na Central em qualquer aparelho).
// Sem login: ficam no navegador e sobem para a conta no primeiro login.
const STORAGE_KEY = "imperium:saved-videos";
const listeners = new Set<() => void>();
const EMPTY: string[] = [];
let cache: string[] | null = null;
/** Dono dos ids em `cache` quando vieram do servidor (null = ids do navegador). */
let contaCarregada: string | null = null;
let carregando: Promise<void> | null = null;

function readLocal(): string[] {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
        return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
    } catch {
        return [];
    }
}

function writeLocal(ids: string[]) {
    try {
        if (ids.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        else localStorage.removeItem(STORAGE_KEY);
    } catch {
        // modo privado / armazenamento bloqueado: fica só na memória
    }
}

function read(): string[] {
    if (!cache) cache = readLocal();
    return cache;
}

function set(ids: string[]) {
    cache = ids;
    if (!contaCarregada) writeLocal(ids);
    listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
    listeners.add(notify);
    const onStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY && !contaCarregada) {
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

/** Carrega os salvos da conta uma vez (todos os botões da tela dividem a mesma busca). */
function carregarDaConta(userId: string, getToken: () => Promise<string | null>): Promise<void> {
    if (contaCarregada === userId) return Promise.resolve();
    if (carregando) return carregando;
    carregando = (async () => {
        const token = await getToken();
        if (!token) return;
        const doServidor = await fetchSavedIds(token);
        // O que foi salvo antes do login sobe para a conta
        const locais = readLocal().filter((id) => !doServidor.includes(id));
        await Promise.allSettled(locais.map((id) => saveVideo(token, id, true)));
        writeLocal([]);
        contaCarregada = userId;
        set([...locais, ...doServidor]);
    })()
        .catch(() => {
            // backend dormindo/fora: segue com o que tem e tenta de novo na próxima tela
        })
        .finally(() => {
            carregando = null;
        });
    return carregando;
}

export function useSavedVideos() {
    const { isSignedIn, userId, getToken } = useAuth();
    const saved = useSyncExternalStore(subscribe, read, () => EMPTY);

    useEffect(() => {
        if (isSignedIn && userId) {
            void carregarDaConta(userId, getToken);
        } else if (isSignedIn === false && contaCarregada) {
            // saiu da conta: volta para os salvos do navegador
            contaCarregada = null;
            cache = null;
            listeners.forEach((notify) => notify());
        }
    }, [isSignedIn, userId, getToken]);

    const toggle = useCallback(
        async (id: string) => {
            const antes = read();
            const salvar = !antes.includes(id);
            set(salvar ? [id, ...antes] : antes.filter((v) => v !== id));
            if (!isSignedIn) return;
            try {
                const token = await getToken();
                if (!token) throw new Error("Sessão expirada");
                await saveVideo(token, id, salvar);
                if (salvar) {
                    toast("Vídeo salvo", {
                        action: { label: "Ver salvos", onClick: () => window.location.assign("/videos/meus-videos?aba=salvos") },
                    });
                }
            } catch {
                set(read().filter((v) => v !== id).concat(salvar ? [] : [id]));
                toast.error(salvar ? "Não foi possível salvar o vídeo." : "Não foi possível tirar dos salvos.");
            }
        },
        [isSignedIn, getToken]
    );

    const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

    return { saved, isSaved, toggle };
}
