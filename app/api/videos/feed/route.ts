// app/api/videos/feed/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MeiliSearch } from 'meilisearch';

const meiliClient = new MeiliSearch({
    host: process.env.MEILISEARCH_URL!,
    apiKey: process.env.MEILISEARCH_API_KEY!,
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'trending';
    const search = searchParams.get('search');
    const duration = searchParams.get('duration');
    const tags = searchParams.get('tags')?.split(',');

    try {
        let videos;
        let shorts;

        if (search) {
            // Busca com Meilisearch
            const searchResults = await meiliClient.index('videos').search(search, {
                filter: buildFilterString({ category, duration, tags }),
                sort: [getSortOption(sortBy)],
                limit: limit,
                offset: (page - 1) * limit,
            });

            videos = await prisma.video.findMany({
                where: {
                    id: { in: searchResults.hits.map((h: any) => h.id) },
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            avatar: true,
                            isVerified: true,
                        },
                    },
                },
            });
        } else {
            // Query normal do Prisma
            videos = await prisma.video.findMany({
                where: {
                    isShort: false,
                    ...(category && { category }),
                    ...(duration && { duration: getDurationFilter(duration) }),
                    ...(tags && { tags: { hasSome: tags } }),
                },
                orderBy: getPrismaOrderBy(sortBy),
                take: limit,
                skip: (page - 1) * limit,
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            avatar: true,
                            isVerified: true,
                        },
                    },
                },
            });
        }

        // Buscar Shorts separadamente (sempre mostra alguns)
        shorts = await prisma.video.findMany({
            where: {
                isShort: true,
                status: 'READY',
            },
            orderBy: {
                views: 'desc',
            },
            take: 10,
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

        const hasMore = videos.length === limit;

        return NextResponse.json({
            videos,
            shorts,
            hasMore,
            page,
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json(
            { error: 'Failed to fetch videos' },
            { status: 500 }
        );
    }
}

// Helpers
function buildFilterString(filters: any): string {
    const conditions = [];

    if (filters.category) {
        conditions.push(`category = "${filters.category}"`);
    }

    if (filters.tags?.length) {
        conditions.push(`tags IN [${filters.tags.map((t: string) => `"${t}"`).join(',')}]`);
    }

    return conditions.join(' AND ');
}

function getSortOption(sortBy: string): string {
    const options: Record<string, string> = {
        trending: 'views:desc',
        recent: 'createdAt:desc',
        popular: 'views:desc',
        liked: 'likesCount:desc',
    };
    return options[sortBy] || 'views:desc';
}

function getPrismaOrderBy(sortBy: string) {
    const options: Record<string, any> = {
        trending: { views: 'desc' },
        recent: { createdAt: 'desc' },
        popular: { views: 'desc' },
    };
    return options[sortBy] || { views: 'desc' };
}

function getDurationFilter(duration: string) {
    const filters: Record<string, any> = {
        under10min: { lte: 600 },
        '10to30min': { gte: 600, lte: 1800 },
        over30min: { gte: 1800 },
    };
    return filters[duration];
}