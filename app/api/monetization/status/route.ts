// app/api/monetization/status/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const monetization = await prisma.creatorMonetization.findUnique({
            where: { userId: session.user.id },
        });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                _count: {
                    select: {
                        followers: true,
                        videos: true,
                    },
                },
                videos: {
                    select: {
                        views: true,
                        duration: true,
                    },
                },
            },
        });

        const stats = {
            followers: user?._count.followers || 0,
            totalViews: user?.videos.reduce((sum, v) => sum + v.views, 0) || 0,
            totalVideos: user?._count.videos || 0,
            watchHours: Math.floor(
                user?.videos.reduce((sum, v) => sum + (v.duration * v.views), 0) || 0 / 3600
            ),
            daysActive: user?.createdAt
                ? Math.floor(
                    (Date.now() - new Date(user.createdAt).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
                : 0,
        };

        // Calcular tier
        let currentTier = 'STARTER';
        let nextTierRequirement = '';
        let nextTierProgress = 0;

        if (stats.followers >= 10000 && stats.totalVideos >= 100 && stats.watchHours >= 1000) {
            currentTier = 'PROFESSIONAL';
            nextTierProgress = 100;
        } else if (stats.followers >= 2000 && stats.totalVideos >= 50 && stats.watchHours >= 200) {
            currentTier = 'ESTABLISHED';
            nextTierProgress = (stats.followers / 10000) * 100;
            nextTierRequirement = '10.000 seguidores para Profissional';
        } else if (stats.followers >= 500 && stats.totalVideos >= 10 && stats.watchHours >= 50) {
            currentTier = 'GROWING';
            nextTierProgress = (stats.followers / 2000) * 100;
            nextTierRequirement = '2.000 seguidores para Estabelecido';
        } else {
            nextTierProgress = (stats.followers / 500) * 100;
            nextTierRequirement = '500 seguidores para começar a monetizar';
        }

        const isEligible = currentTier !== 'STARTER';

        // Calcular earnings (mock - integrar com sistema real de ads)
        const earnings = {
            total: monetization?.totalEarnings || 0,
            available: monetization?.availableBalance || 0,
            pending: monetization?.pendingBalance || 0,
            thisMonth: 245.50,
            lastMonth: 180.30,
            adRevenue: 150.00,
            superChat: 45.50,
            subscriptions: 50.00,
            productSales: 0,
        };

        return NextResponse.json({
            isEligible,
            currentTier,
            stats: {
                ...stats,
                nextTierProgress: Math.min(100, nextTierProgress),
                nextTierRequirement,
            },
            earnings,
            isEnabled: monetization?.isEnabled || false,
        });
    } catch (error) {
        console.error('Error fetching monetization status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch monetization status' },
            { status: 500 }
        );
    }
}