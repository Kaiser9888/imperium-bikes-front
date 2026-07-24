import { NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

export async function POST(request: Request) {
    const { userId } = await request.json();

    const serverClient = StreamChat.getInstance(
        process.env.NEXT_PUBLIC_STREAM_API_KEY!,
        process.env.STREAM_SECRET!
    );

    const token = serverClient.createToken(userId);

    return NextResponse.json({ token });
}