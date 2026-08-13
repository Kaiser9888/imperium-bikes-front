import { API_URL } from "./api";

export interface UploadPayload {
    file: File;
    title: string;
    description: string;
    hashtags: string;
    durationSeconds: number;
    isShort: boolean;
    token?: string | null;
}

export interface UploadCallbacks {
    onProgress?: (percent: number) => void;
    onProcessing?: () => void;
}

const MAX_PUT_RETRIES = 3;

function putFile(url: string, file: File, onProgress?: (percent: number) => void): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.timeout = 5 * 60 * 1000; // 5min — evita ficar pendurado indefinidamente numa rede ruim

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
            } else {
                reject(new Error(`Upload falhou (HTTP ${xhr.status}): ${xhr.statusText || "sem detalhes"}`));
            }
        };

        xhr.onerror = () => reject(new Error("Falha de conexão durante o envio. Verifique sua internet."));
        xhr.ontimeout = () => reject(new Error("O envio demorou demais e foi cancelado. Tente uma conexão mais estável."));
        xhr.onabort = () => reject(new Error("Envio cancelado."));

        xhr.send(file);
    });
}

async function putFileWithRetry(url: string, file: File, onProgress?: (percent: number) => void): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_PUT_RETRIES; attempt++) {
        try {
            await putFile(url, file, onProgress);
            return;
        } catch (e) {
            lastError = e instanceof Error ? e : new Error("Erro desconhecido no envio");
            if (attempt < MAX_PUT_RETRIES) {
                // espera um pouco antes de tentar de novo (dá tempo da rede se recuperar)
                await new Promise((r) => setTimeout(r, 2000 * attempt));
            }
        }
    }

    throw lastError ?? new Error("Falha no envio do arquivo");
}

/**
 * Mantém exatamente o fluxo original: upload-url -> PUT direto -> polling do asset -> mux-callback.
 * Agora com retry no PUT e mensagens de erro reais (não mais "Rede" genérico).
 */
export async function uploadVideo(
  { file, title, description, hashtags, durationSeconds, isShort, token }: UploadPayload,
  { onProgress, onProcessing }: UploadCallbacks = {},
): Promise<{ id: string }> {
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${API_URL}/api/videos/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
    });
    if (!res.ok) throw new Error(`Erro ao criar upload (HTTP ${res.status})`);
    const data = (await res.json()) as { uploadUrl: string; uploadId: string };

    await putFileWithRetry(data.uploadUrl, file, onProgress);

    onProcessing?.();

    for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise((r) => setTimeout(r, 3000));

        let assetRes: Response;
        try {
            assetRes = await fetch(`${API_URL}/api/videos/asset-status?uploadId=${data.uploadId}`, {
                headers: authHeaders,
            });
        } catch {
            continue; // instabilidade momentânea no polling, tenta de novo
        }

        if (!assetRes.ok) continue;

        const assetData = (await assetRes.json()) as { status: string; assetId: string; playbackId: string };
        if (assetData.status !== "ready") continue;

        const callbackRes = await fetch(`${API_URL}/api/videos/mux-callback`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders },
            body: JSON.stringify({
                muxAssetId: assetData.assetId,
                muxPlaybackId: assetData.playbackId,
                title,
                description: `${description} ${hashtags}`.trim(),
                durationSeconds: Math.round(durationSeconds),
                thumbnailUrl: `https://image.mux.com/${assetData.playbackId}/thumbnail.jpg`,
                isShort,
                originalFilename: file.name,
                fileSize: file.size,
                mimeType: file.type,
            }),
        });
        if (!callbackRes.ok) throw new Error(`Erro ao finalizar publicação (HTTP ${callbackRes.status})`);
        return (await callbackRes.json()) as { id: string };
    }

    throw new Error("Processamento demorou. O vídeo ficará disponível em breve.");
}