// app/api/videos/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        const video = await prisma.video.create({
            data: {
                ...data,
                authorId: session.user.id,
                status: 'PROCESSING',
            },
        });

        // Indexar no Meilisearch
        await fetch(`${process.env.MEILISEARCH_URL}/indexes/videos/documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MEILISEARCH_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([{
                id: video.id,
                title: video.title,
                description: video.description,
                category: video.category,
                tags: video.tags,
                isShort: video.isShort,
                duration: video.duration,
                authorName: session.user.name,
                createdAt: video.createdAt,
            }]),
        });

        return NextResponse.json(video);
    } catch (error) {
        console.error('Error creating video:', error);
        return NextResponse.json(
            { error: 'Failed to create video' },
            { status: 500 }
        );
    }
}