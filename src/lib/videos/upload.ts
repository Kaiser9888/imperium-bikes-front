import { API_URL } from "./api";

export interface UploadPayload {
    file: File;
    title: string;
    description: string;
    hashtags: string;
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
        xhr.timeout = 30 * 60 * 1000; // 30min — vídeo longo pode demorar bem mais que 5min pra subir

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

        xhr.onerror = () => reject(new Error("Falha de conexão no envio. Verifique sua internet e tente de novo."));
        xhr.ontimeout = () => reject(new Error("O envio demorou demais e foi cancelado."));
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
            if (attempt < MAX_PUT_RETRIES) await new Promise((r) => setTimeout(r, 2000 * attempt));
        }
    }
    throw new Error(`Falha após ${MAX_PUT_RETRIES} tentativas. Último erro: ${lastError?.message ?? "desconhecido"}`);
}

/**
 * Fluxo novo:
 * 1. upload-url -> já cria o vídeo no banco (status PROCESSING) e devolve videoId + uploadUrl
 * 2. PUT direto pro Mux
 * 3. Pronto. O Mux processa em background e chama nosso webhook quando termina,
 *    que marca o vídeo como PUBLISHED. Não dependemos mais do navegador ficar
 *    aberto até o fim — por isso não existe mais o polling com timeout aqui,
 *    que era a causa dos vídeos longos sumirem.
 */
export async function uploadVideo(
  { file, title, description, hashtags, isShort, token }: UploadPayload,
  { onProgress, onProcessing }: UploadCallbacks = {},
): Promise<{ id: string }> {
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${API_URL}/api/videos/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
            title,
            description: `${description} ${hashtags}`.trim(),
            isShort,
        }),
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Erro ao criar upload (HTTP ${res.status}): ${body.slice(0, 300)}`);
    }

    const data = (await res.json()) as { uploadUrl: string; uploadId: string; videoId: string };

    await putFileWithRetry(data.uploadUrl, file, onProgress);

    onProcessing?.();

    return { id: data.videoId };
}