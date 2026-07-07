// hooks/useVideoUpload.ts
'use client'

import { useState, useCallback } from 'react';
import MuxUploader from '@mux/mux-uploader-react';
import { toast } from 'sonner';

interface UploadConfig {
    title: string;
    description: string;
    category: VideoCategory;
    tags: string[];
}

interface UploadProgress {
    percent: number;
    status: 'idle' | 'uploading' | 'processing' | 'ready' | 'error';
    muxAssetId?: string;
    playbackId?: string;
    duration?: number;
    isShort?: boolean;
}

export function useVideoUpload() {
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
        percent: 0,
        status: 'idle',
    });
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // Detectar se o vídeo é Short (vertical + curto)
    const detectIfShort = useCallback(async (file: File): Promise<{
        isShort: boolean;
        aspectRatio: string;
        duration: number;
    }> => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);

                const duration = video.duration;
                const width = video.videoWidth;
                const height = video.videoHeight;

                // Short = vertical (9:16) + menos de 60 segundos
                const isVertical = height > width;
                const isShortDuration = duration <= 60;
                const aspectRatio = isVertical ? '9:16' : '16:9';
                const isShort = isVertical && isShortDuration;

                resolve({ isShort, aspectRatio, duration });
            };

            video.src = URL.createObjectURL(file);
        });
    }, []);

    // Criar upload URL no backend
    const createDirectUpload = useCallback(async () => {
        try {
            const response = await fetch('/api/videos/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error('Failed to create upload');

            const data = await response.json();
            return { url: data.url, uploadId: data.uploadId };
        } catch (error) {
            toast.error('Erro ao preparar upload');
            throw error;
        }
    }, []);

    // Salvar metadata do vídeo no backend
    const saveVideoMetadata = useCallback(async (
        muxAssetId: string,
        playbackId: string,
        config: UploadConfig,
        videoInfo: { isShort: boolean; aspectRatio: string; duration: number }
    ) => {
        try {
            const response = await fetch('/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...config,
                    muxAssetId,
                    muxPlaybackId: playbackId,
                    isShort: videoInfo.isShort,
                    aspectRatio: videoInfo.aspectRatio,
                    duration: videoInfo.duration,
                }),
            });

            if (!response.ok) throw new Error('Failed to save video');

            const video = await response.json();
            toast.success('Vídeo publicado com sucesso!');
            return video;
        } catch (error) {
            toast.error('Erro ao salvar vídeo');
            throw error;
        }
    }, []);

    // Upload principal
    const uploadVideo = useCallback(async (
        file: File,
        config: UploadConfig
    ) => {
        try {
            setUploadProgress({ percent: 0, status: 'uploading' });

            // 1. Detectar se é Short
            const videoInfo = await detectIfShort(file);

            // 2. Criar upload URL
            const { url, uploadId } = await createDirectUpload();

            // 3. Upload do arquivo
            const formData = new FormData();
            formData.append('file', file);

            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress({ percent, status: 'uploading' });
                }
            };

            xhr.onload = async () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    setUploadProgress({ percent: 100, status: 'processing' });

                    // 4. Aguardar processamento do Mux
                    const assetId = await pollMuxAsset(uploadId);

                    setUploadProgress({
                        percent: 100,
                        status: 'ready',
                        muxAssetId: assetId,
                        playbackId: assetId,
                        duration: videoInfo.duration,
                        isShort: videoInfo.isShort,
                    });

                    // 5. Salvar no backend
                    await saveVideoMetadata(assetId, assetId, config, videoInfo);
                } else {
                    throw new Error('Upload failed');
                }
            };

            xhr.onerror = () => {
                setUploadProgress({ percent: 0, status: 'error' });
                toast.error('Erro no upload');
            };

            xhr.open('PUT', url);
            xhr.send(formData);

        } catch (error) {
            setUploadProgress({ percent: 0, status: 'error' });
            toast.error('Falha no upload');
        }
    }, [createDirectUpload, detectIfShort, saveVideoMetadata]);

    // Polling para verificar processamento
    const pollMuxAsset = async (uploadId: string): Promise<string> => {
        let attempts = 0;
        const maxAttempts = 60; // 5 minutos máximo

        while (attempts < maxAttempts) {
            const response = await fetch(`/api/videos/asset-status?uploadId=${uploadId}`);
            const data = await response.json();

            if (data.status === 'ready') {
                return data.assetId;
            }

            if (data.status === 'errored') {
                throw new Error('Processing failed');
            }

            await new Promise(resolve => setTimeout(resolve, 5000));
            attempts++;
        }

        throw new Error('Processing timeout');
    };

    // Preview do vídeo
    const handleFileSelect = useCallback((file: File) => {
        setVideoFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    }, []);

    return {
        uploadVideo,
        uploadProgress,
        videoFile,
        previewUrl,
        handleFileSelect,
    };
}