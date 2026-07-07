// app/videos/upload/page.tsx
import { VideoUploader } from '@/components/video/VideoUploader';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Upload de Vídeo | Bike Marketplace',
    description: 'Compartilhe seus vídeos de bike com a comunidade',
};

export default function UploadPage() {
    return (
        <div className="container mx-auto py-8">
            <VideoUploader />
        </div>
    );
}