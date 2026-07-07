// app/api/videos/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();

        const video = await prisma.video.findUnique({
            where: { id: params.id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        isVerified: true,
                        followersCount: true,
                    },
                },
                monetization: true,
            },
        });

        if (!video) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        // Buscar vídeos relacionados
        const relatedVideos = await prisma.video.findMany({
            where: {
                id: { not: params.id },
                OR: [
                    { category: video.category },
                    { tags: { hasSome: video.tags } },
                ],
                status: 'READY',
            },
            take: 10,
            orderBy: { views: 'desc' },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });

        // Verificar se usuário curtiu/salvou
        let isLiked = false;
        let isSaved = false;
        let progress = null;

        if (session?.user) {
            const [like, save, watchProgress] = await Promise.all([
                prisma.like.findUnique({
                    where: {
                        userId_videoId: {
                            userId: session.user.id,
                            videoId: params.id,
                        },
                    },
                }),
                prisma.savedVideo.findUnique({
                    where: {
                        userId_videoId: {
                            userId: session.user.id,
                            videoId: params.id,
                        },
                    },
                }),
                prisma.watchProgress.findUnique({
                    where: {
                        userId_videoId: {
                            userId: session.user.id,
                            videoId: params.id,
                        },
                    },
                }),
            ]);

            isLiked = !!like;
            isSaved = !!save;
            progress = watchProgress;
        }

        return NextResponse.json({
            video,
            relatedVideos,
            isLiked,
            isSaved,
            progress,
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        return NextResponse.json(
            { error: 'Failed to fetch video' },
            { status: 500 }
        );
    }
}