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

/**
 * Mantém exatamente o fluxo original: upload-url -> PUT direto -> polling do asset -> mux-callback.
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
    if (!res.ok) throw new Error("Erro ao criar upload");
    const data = (await res.json()) as { uploadUrl: string; uploadId: string };

    await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", data.uploadUrl);
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Falha")));
        xhr.onerror = () => reject(new Error("Rede"));
        xhr.send(file);
    });

    onProcessing?.();

    for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise((r) => setTimeout(r, 3000));
        const assetRes = await fetch(`${API_URL}/api/videos/asset-status?uploadId=${data.uploadId}`, {
            headers: authHeaders,
        });
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
        return (await callbackRes.json()) as { id: string };
    }

    throw new Error("Processamento demorou. O vídeo ficará disponível em breve.");
}
