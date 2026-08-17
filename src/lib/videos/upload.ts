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
        // DEBUG: loga a URL de destino real do PUT (Mux/GCS). Remover depois de identificar o problema.
        console.log("[DEBUG UPLOAD] Iniciando PUT", {
            url,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            userAgent: navigator.userAgent,
            online: navigator.onLine,
        });

        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.timeout = 5 * 60 * 1000; // 5min — evita ficar pendurado indefinidamente numa rede ruim

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => {
            console.log("[DEBUG UPLOAD] onload", { status: xhr.status, statusText: xhr.statusText });
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
            } else {
                reject(
                  new Error(
                    `Upload falhou (HTTP ${xhr.status}): ${xhr.statusText || "sem detalhes"} | resposta: ${xhr.responseText?.slice(0, 300) || "vazia"}`,
                  ),
                );
            }
        };

        xhr.onerror = () => {
            // DEBUG: erro de rede real (CORS, bloqueio, DNS, conexão recusada, mixed content, etc).
            // xhr.status normalmente vem 0 nesses casos, mas o resto ajuda a identificar a causa.
            const details = {
                status: xhr.status,
                readyState: xhr.readyState,
                responseURL: xhr.responseURL || url,
                online: navigator.onLine,
            };
            console.error("[DEBUG UPLOAD] onerror", details);
            reject(
              new Error(
                `Falha de conexão no envio (PUT). status=${details.status} readyState=${details.readyState} ` +
                `destino=${details.responseURL} onLine=${details.online}. ` +
                `Se o navegador estiver marcando "online", não é sua internet — é bloqueio de conexão com o servidor de armazenamento.`,
              ),
            );
        };

        xhr.ontimeout = () => {
            console.error("[DEBUG UPLOAD] ontimeout", { url });
            reject(new Error("O envio demorou demais e foi cancelado (timeout de 5min). Tente uma conexão mais estável."));
        };

        xhr.onabort = () => {
            console.error("[DEBUG UPLOAD] onabort", { url });
            reject(new Error("Envio cancelado (onabort) — verifique se o app/aba não foi pra segundo plano durante o envio."));
        };

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
            console.warn(`[DEBUG UPLOAD] Tentativa ${attempt}/${MAX_PUT_RETRIES} falhou:`, lastError.message);
            if (attempt < MAX_PUT_RETRIES) {
                // espera um pouco antes de tentar de novo (dá tempo da rede se recuperar)
                await new Promise((r) => setTimeout(r, 2000 * attempt));
            }
        }
    }

    // Anexa quantas tentativas falharam na mensagem final, pra aparecer no card de erro da tela
    throw new Error(`Falha após ${MAX_PUT_RETRIES} tentativas. Último erro: ${lastError?.message ?? "desconhecido"}`);
}

/**
 * Mantém exatamente o fluxo original: upload-url -> PUT direto -> polling do asset -> mux-callback.
 * Agora com retry no PUT, mensagens de erro detalhadas (aparecem no card de erro da UI) e
 * logs de debug no console (visíveis via chrome://inspect ou Eruda no celular).
 */
export async function uploadVideo(
  { file, title, description, hashtags, durationSeconds, isShort, token }: UploadPayload,
  { onProgress, onProcessing }: UploadCallbacks = {},
): Promise<{ id: string }> {
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    console.log("[DEBUG UPLOAD] Solicitando upload-url", { API_URL, isShort, fileSize: file.size });

    let res: Response;
    try {
        res = await fetch(`${API_URL}/api/videos/upload-url`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders },
        });
    } catch (e) {
        console.error("[DEBUG UPLOAD] Falha ao chamar upload-url", e);
        throw new Error(
          `Não foi possível contatar o servidor para iniciar o upload (${e instanceof Error ? e.message : "erro desconhecido"}). ` +
          `Verifique se ${API_URL} está acessível.`,
        );
    }

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Erro ao criar upload (HTTP ${res.status}): ${body.slice(0, 300)}`);
    }
    const data = (await res.json()) as { uploadUrl: string; uploadId: string };
    console.log("[DEBUG UPLOAD] upload-url recebida", { uploadId: data.uploadId, uploadUrl: data.uploadUrl });

    await putFileWithRetry(data.uploadUrl, file, onProgress);

    onProcessing?.();

    for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise((r) => setTimeout(r, 3000));

        let assetRes: Response;
        try {
            assetRes = await fetch(`${API_URL}/api/videos/asset-status?uploadId=${data.uploadId}`, {
                headers: authHeaders,
            });
        } catch (e) {
            console.warn("[DEBUG UPLOAD] Falha momentânea no polling", e);
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
        if (!callbackRes.ok) {
            const body = await callbackRes.text().catch(() => "");
            throw new Error(`Erro ao finalizar publicação (HTTP ${callbackRes.status}): ${body.slice(0, 300)}`);
        }
        return (await callbackRes.json()) as { id: string };
    }

    throw new Error("Processamento demorou. O vídeo ficará disponível em breve.");
}