// app/api/videos/upload-url/route.ts
import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const muxClient = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST() {
    try {
        const upload = await muxClient.video.uploads.create({
            cors_origin: process.env.NEXT_PUBLIC_APP_URL!,
            new_asset_settings: {
                playback_policy: ['public'],
                mp4_support: 'standard',
                max_resolution_tier: '2160p', // 4K support
            },
        });

        return NextResponse.json({
            url: upload.url,
            uploadId: upload.id,
        });
    } catch (error) {
        console.error('Error creating upload:', error);
        return NextResponse.json(
            { error: 'Failed to create upload' },
            { status: 500 }
        );
    }
}