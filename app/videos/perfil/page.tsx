"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";

import { fetchMyVideos } from "@/lib/videos/api";
import type { VideoItem } from "@/lib/videos/types";
import { VideoCard } from "@/components/videos/VideoCard";
import { VideoGridSkeleton } from "@/components/videos/VideoGridSkeleton";
import { ProfileHeader } from "@/components/videos/ProfileHeader";
import { ErrorState } from "@/components/videos/FeedStates";

/** Perfil de quem está logado: os próprios vídeos publicados (antes mostrava os 4 primeiros do feed de todo mundo). */
export default function PerfilPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [videos, setVideos] = useState<VideoItem[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("sem sessão");
        const page = await fetchMyVideos(token, 0);
        if (!cancelled) {
          setVideos(page.content.filter((v) => v.status === "PUBLISHED"));
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken, attempt]);

  if (isLoaded && !isSignedIn) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Entre para ver seu perfil de criador.</p>
        <Link href="/sign-in" className="mt-4 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-5">
        <ProfileHeader
          videoCount={videos?.length ?? 0}
          name={user?.fullName || user?.username || "Você"}
          avatarUrl={user?.imageUrl}
        />
        <div className="flex gap-2">
          <Link href="/videos/meus-videos" className="rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary">
            Central
          </Link>
          <Link
            href="/videos/upload"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Publicar
          </Link>
        </div>
      </header>

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Publicações
      </h2>
      <div className="mt-4">
        {error ? (
          <ErrorState onRetry={() => { setError(false); setVideos(null); setAttempt((n) => n + 1); }} />
        ) : videos === null ? (
          <VideoGridSkeleton count={4} />
        ) : videos.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Você ainda não publicou nenhum vídeo.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((v) => (
              <li key={v.id}>
                <VideoCard video={v} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
