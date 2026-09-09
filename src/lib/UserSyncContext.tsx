"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";
import api from "@/lib/api";

interface UserSyncContextValue {
  /**
   * true assim que o POST /api/users/sync terminou (com sucesso OU falha).
   * Outras páginas devem esperar isSynced === true antes de disparar suas
   * próprias chamadas autenticadas — isso garante que exista no máximo UMA
   * tentativa de criar o usuário no banco por login, eliminando a corrida
   * que antes acontecia entre /users/sync, /carteira, /carteira/extrato e
   * /conta-conectada/status disparando juntos.
   */
  isSynced: boolean;
  isSyncing: boolean;
  syncError: boolean;
}

const UserSyncContext = createContext<UserSyncContextValue>({
  isSynced: false,
  isSyncing: false,
  syncError: false,
});

export function UserSyncProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  const [isSynced, setIsSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);

  // Garante que o sync só rode UMA vez por sessão de login, mesmo que o
  // componente re-renderize várias vezes.
  const jaSincronizouRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      // Usuário deslogou (ou ainda não logou): reseta para a próxima sessão.
      jaSincronizouRef.current = false;
      setIsSynced(false);
      setIsSyncing(false);
      setSyncError(false);
      return;
    }

    if (jaSincronizouRef.current) return;
    jaSincronizouRef.current = true;

    setIsSyncing(true);
    api
      .post("/api/users/sync")
      .then((res) => {
        console.log("[AutoSync] Usuário sincronizado:", res.data?.id);
        setIsSynced(true);
      })
      .catch((err) => {
        console.error("[AutoSync] Erro:", err);
        // Mesmo se o /sync falhar (rede, servidor acordando, etc.), liberamos
        // as outras páginas: o filtro do backend (ClerkUserSyncFilter) já
        // sabe criar o usuário sozinho na primeira requisição autenticada
        // que chegar, então não faz sentido travar a UI inteira por causa
        // de uma falha isolada nesse endpoint específico.
        setSyncError(true);
        setIsSynced(true);
      })
      .finally(() => setIsSyncing(false));
  }, [isLoaded, isSignedIn]);

  return (
    <UserSyncContext.Provider value={{ isSynced, isSyncing, syncError }}>
      {children}
    </UserSyncContext.Provider>
  );
}

/**
 * Hook para páginas que fazem chamadas autenticadas ao backend.
 *
 * Uso:
 *   const { isSynced } = useUserSync();
 *   useEffect(() => {
 *     if (!isSynced) return; // espera o sync inicial terminar
 *     // ... dispara suas chamadas normalmente
 *   }, [isSynced, ...]);
 */
export function useUserSync() {
  return useContext(UserSyncContext);
}