// components/video/VideoUploader.tsx
'use client'

import { useState, useRef, useCallback } from 'react';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import {
    Upload,
    X,
    Video,
    Smartphone,
    Monitor,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Bike
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

const CATEGORIES = [
    { value: 'TUTORIAL', label: '🔧 Tutorial', description: 'Ensine manutenção e reparos' },
    { value: 'REVIEW', label: '⭐ Review', description: 'Avalie bikes e equipamentos' },
    { value: 'TRAIL', label: '🏔️ Trilha', description: 'Mostre trilhas e rotas' },
    { value: 'COMPETITION', label: '🏆 Competição', description: 'Corridas e eventos' },
    { value: 'VLOG', label: '📱 Vlog', description: 'Dia a dia no mundo bike' },
    { value: 'UNBOXING', label: '📦 Unboxing', description: 'Apresente produtos novos' },
    { value: 'MAINTENANCE', label: '🛠️ Manutenção', description: 'Dicas de cuidados' },
] as const;

const TAGS_SUGESTOES = [
    'MTB', 'Speed', 'Gravel', 'BMX', 'Downhill',
    'Shimano', 'SRAM', 'Carbon', 'Alumínio',
    'Iniciante', 'Avançado', 'Profissional',
    'Manutenção', 'Limpeza', 'Montagem'
];

export function VideoUploader() {
    const { uploadVideo, uploadProgress, videoFile, previewUrl, handleFileSelect } = useVideoUpload();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [customTag, setCustomTag] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    // Drag and drop handlers
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('video/')) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const addTag = (tag: string) => {
        if (tags.length < 10 && !tags.includes(tag)) {
            setTags([...tags, tag]);
            setCustomTag('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleSubmit = async () => {
        if (!videoFile || !title || !category) {
            toast.error('Preencha todos os campos obrigatórios');
            return;
        }

        await uploadVideo(videoFile, {
            title,
            description,
            category: category as any,
            tags,
        });
    };

    const isUploading = uploadProgress.status === 'uploading';
    const isProcessing = uploadProgress.status === 'processing';
    const isReady = uploadProgress.status === 'ready';

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <Bike className="w-8 h-8" />
                    Upload de Vídeo
                </h1>
                <p className="text-muted-foreground">
                    Compartilhe sua paixão por bikes com a comunidade
                </p>
            </div>

            {/* Área de Upload */}
            <Card className="p-8">
                {!videoFile ? (
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`
              border-2 border-dashed rounded-lg p-12
              flex flex-col items-center justify-center
              transition-colors cursor-pointer
              ${dragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-300 hover:border-primary/50'
                        }
            `}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg font-semibold mb-2">
                            Arraste seu vídeo aqui ou clique para selecionar
                        </p>
                        <p className="text-sm text-muted-foreground">
                            MP4, MOV ou WebM • Máximo 2GB • Vertical ou Horizontal
                        </p>

                        <div className="flex gap-4 mt-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Smartphone className="w-4 h-4" />
                                Shorts (vertical, até 60s)
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Monitor className="w-4 h-4" />
                                Vídeo Longo (até 2h)
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Preview */}
                        <div className="relative">
                            <video
                                src={previewUrl}
                                controls
                                className="w-full rounded-lg max-h-96 object-contain bg-black"
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                    setVideoFile(null);
                                    setPreviewUrl('');
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>

                            {uploadProgress.isShort && (
                                <Badge className="absolute top-2 left-2 bg-purple-500">
                                    <Smartphone className="w-3 h-3 mr-1" />
                                    Short Detectado
                                </Badge>
                            )}
                        </div>

                        {/* Progresso do Upload */}
                        {(isUploading || isProcessing || isReady) && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {isUploading && `Enviando... ${uploadProgress.percent}%`}
                      {isProcessing && 'Processando vídeo...'}
                      {isReady && 'Vídeo pronto!'}
                  </span>
                                    {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isReady && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                </div>
                                <Progress value={uploadProgress.percent} />
                            </div>
                        )}
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </Card>

            {/* Formulário de Metadata */}
            {videoFile && (
                <Card className="p-6 space-y-6">
                    <h2 className="text-xl font-semibold">Informações do Vídeo</h2>

                    {/* Título */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Título <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="Ex: Como ajustar o câmbio Shimano Deore"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                        />
                        <p className="text-xs text-muted-foreground">
                            {title.length}/100 caracteres
                        </p>
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Descrição</label>
                        <Textarea
                            placeholder="Descreva seu vídeo, inclua links úteis e hashtags..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            maxLength={5000}
                        />
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Categoria <span className="text-red-500">*</span>
                        </label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        <div>
                                            <span>{cat.label}</span>
                                            <p className="text-xs text-muted-foreground">
                                                {cat.description}
                                            </p>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Tags (até 10)
                        </label>

                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map(tag => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={() => removeTag(tag)}
                                >
                                    {tag} ×
                                </Badge>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Adicionar tag personalizada"
                                value={customTag}
                                onChange={(e) => setCustomTag(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && customTag) {
                                        e.preventDefault();
                                        addTag(customTag);
                                    }
                                }}
                            />
                            <Button
                                variant="outline"
                                onClick={() => customTag && addTag(customTag)}
                                disabled={!customTag || tags.length >= 10}
                            >
                                Adicionar
                            </Button>
                        </div>

                        {/* Sugestões */}
                        <div className="flex flex-wrap gap-1 mt-2">
                            {TAGS_SUGESTOES.filter(t => !tags.includes(t)).slice(0, 5).map(tag => (
                                <Badge
                                    key={tag}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-primary/10"
                                    onClick={() => addTag(tag)}
                                >
                                    + {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Alertas */}
                    {uploadProgress.isShort && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
                            <Smartphone className="w-5 h-5 text-purple-500 mt-0.5" />
                            <div>
                                <p className="font-medium text-purple-900">
                                    Vídeo Short Detectado
                                </p>
                                <p className="text-sm text-purple-700">
                                    Seu vídeo é vertical e tem menos de 60s. Ele será publicado na seção Shorts.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-700">
                            📹 Ao publicar, você concorda com nossos Termos de Uso e Política de Conteúdo.
                            Conteúdo impróprio será removido.
                        </p>
                    </div>

                    {/* Botão de Publicar */}
                    <Button
                        onClick={handleSubmit}
                        disabled={!title || !category || isUploading || isProcessing}
                        className="w-full"
                        size="lg"
                    >
                        {isUploading || isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {isUploading ? 'Enviando...' : 'Processando...'}
                            </>
                        ) : (
                            <>
                                <Video className="w-4 h-4 mr-2" />
                                Publicar Vídeo
                            </>
                        )}
                    </Button>
                </Card>
            )}
        </div>
    );
}