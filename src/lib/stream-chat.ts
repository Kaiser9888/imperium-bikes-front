import { StreamChat } from "stream-chat";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export const streamClient = StreamChat.getInstance(apiKey);

type GetTokenFn = () => Promise<string | null>;

/**
 * Conecta o usuário atual ao Stream Chat.
 *
 * O userId NÃO é passado pelo cliente: o backend resolve o usuário a partir
 * do token do Clerk (enviado no header Authorization) e devolve o token do
 * Stream já vinculado ao usuário correto. Isso evita que alguém force a
 * conexão como um userId arbitrário.
 */
export async function connectUser(
    userName: string,
    userImage: string,
    getToken: GetTokenFn
) {
    const clerkToken = await getToken();

    if (!clerkToken) {
        throw new Error("Usuário não autenticado");
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/stream-token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${clerkToken}`,
        },
    });

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || `Falha ao obter token do chat (status ${res.status})`);
    }

    const data = await res.json();

    if (!data.token || !data.userId) {
        throw new Error("Resposta inválida do servidor de chat");
    }

    await streamClient.connectUser(
        { id: data.userId, name: userName, image: userImage },
        data.token
    );

    return data.userId as string;
}

export async function disconnectUser() {
    await streamClient.disconnectUser();
}