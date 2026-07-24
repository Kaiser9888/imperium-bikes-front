import { StreamChat } from "stream-chat";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export const streamClient = StreamChat.getInstance(apiKey);

export async function connectUser(userId: string, userName: string, userImage: string) {
    const token = await fetch("/api/stream-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
    }).then((res) => res.json());

    await streamClient.connectUser(
        {
            id: userId,
            name: userName,
            image: userImage,
        },
        token.token
    );
}

export async function disconnectUser() {
    await streamClient.disconnectUser();
}