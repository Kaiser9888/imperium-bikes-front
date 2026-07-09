"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const API_URL = "https://imperium-bikes.onrender.com";

export default function UploadPage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) return;

        setUploading(true);
        try {
            const token = await getToken();

            // 1. Obter URL de upload do backend
            const uploadUrlRes = await fetch(`${API_URL}/api/videos/upload-url`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    description,
                    fileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                }),
            });

            const { uploadUrl, videoId } = await uploadUrlRes.json();

            // 2. Upload do arquivo para Mux
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", uploadUrl);
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    setProgress(Math.round((event.loaded / event.total) * 100));
                }
            };
            xhr.send(file);

            await new Promise((resolve) => {
                xhr.onload = resolve;
            });

            router.push(`/videos/watch/${videoId}`);
        } catch (error) {
            console.error("Erro no upload:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <div className="max-w-2xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-8">Publicar Video</h1>

                <form onSubmit={handleUpload} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Titulo</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                            placeholder="Digite o titulo do video"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Descricao</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 resize-none"
                            placeholder="Descreva seu video"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Video</label>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            required
                            className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-700 file:cursor-pointer"
                        />
                    </div>

                    {uploading && (
                        <div>
                            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-600 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-sm text-neutral-400 mt-2">
                                Enviando... {progress}%
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={uploading || !file || !title}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                    >
                        {uploading ? "Enviando..." : "Publicar Video"}
                    </button>
                </form>
            </div>
        </div>
    );
}