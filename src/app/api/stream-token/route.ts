import { NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

export async function POST() {
    const serverClient = StreamChat.getInstance(
        process.env.NEXT_PUBLIC_STREAM_API_KEY!,
        process.env.STREAM_SECRET!
    );
    const token = serverClient.createToken("anonymous");
    return NextResponse.json({ token });
}