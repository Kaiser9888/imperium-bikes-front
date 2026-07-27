import { StreamChat } from "stream-chat";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export const streamClient = StreamChat.getInstance(apiKey);

export async function connectUser(userId: string, userName: string, userImage: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/stream-token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
    });

    const data = await res.json();

    await streamClient.connectUser(
        {
            id: userId,
            name: userName,
            image: userImage,
        },
        data.token
    );
}

export async function disconnectUser() {
    await streamClient.disconnectUser();
}