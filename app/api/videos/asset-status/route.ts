// app/api/videos/asset-status/route.ts
import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const muxClient = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('uploadId');

    if (!uploadId) {
        return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 });
    }

    try {
        const upload = await muxClient.video.uploads.retrieve(uploadId);

        if (upload.asset_id) {
            const asset = await muxClient.video.assets.retrieve(upload.asset_id);
            return NextResponse.json({
                status: asset.status,
                assetId: asset.id,
                playbackId: asset.playback_ids?.[0]?.id,
            });
        }

        return NextResponse.json({ status: 'waiting' });
    } catch (error) {
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}