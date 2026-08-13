// app/videos/watch/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ChevronDown } from "lucide-react";
import { fetchRelated, fetchVideo, playbackIdFrom, likeVideo, dislikeVideo } from "@/lib/videos/api";
import type { VideoItem } from "@/lib/videos/types";
import { VideoPlayer } from "@/components/videos/VideoPlayer";
import { VideoActions } from "@/components/videos/VideoActions";
import { VideoStats } from "@/components/videos/VideoStats";
import { VideoComments } from "@/components/videos/VideoComments";
import { VideoSidebar } from "@/components/videos/VideoSidebar";
import { VideoAvatar } from "@/components/videos/VideoAvatar";
import { VideoDescription } from "@/components/videos/VideoDescription";

export default function WatchPage() {
    const { id } = useParams<{ id: string }>();
    const { getToken } = useAuth();

    const [video, setVideo] = useState<VideoItem | null>(null);
    const [related, setRelated] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMore, setShowMore] = useState(false);

    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [dislikesCount, setDislikesCount] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        (async () => {
            const data = await fetchVideo(id);
            if (cancelled) return;
            setVideo(data);
            setLikesCount(data?.likesCount ?? 0);
            setDislikesCount(data?.dislikesCount ?? 0);
            setLiked(data?.liked ?? false);
            setDisliked(data?.disliked ?? false);
            setLoading(false);
        })();
        fetchRelated(id).then((r) => !cancelled && setRelated(r));
        return () => {
            cancelled = true;
        };
    }, [id]);

    async function handleToggleLike() {
        if (!video) return;
        const prevLiked = liked;
        const prevDisliked = disliked;
        const prevLikesCount = likesCount;
        const prevDislikesCount = dislikesCount;

        setLiked(!prevLiked);
        setLikesCount((c) => c + (prevLiked ? -1 : 1));
        if (prevDisliked) {
            setDisliked(false);
            setDislikesCount((c) => Math.max(0, c - 1));
        }

        const token = await getToken();
        if (!token) {
            setLiked(prevLiked);
            setDisliked(prevDisliked);
            setLikesCount(prevLikesCount);
            setDislikesCount(prevDislikesCount);
            return;
        }

        const result = await likeVideo(video.id, token);
        if (!result) {
            setLiked(prevLiked);
            setDisliked(prevDisliked);
            setLikesCount(prevLikesCount);
            setDislikesCount(prevDislikesCount);
            return;
        }
        setLiked(result.liked);
        setDisliked(result.disliked);
        setLikesCount(result.likesCount);
        setDislikesCount(result.dislikesCount);
    }

    async function handleToggleDislike() {
        if (!video) return;
        const prevLiked = liked;
        const prevDisliked = disliked;
        const prevLikesCount = likesCount;
        const prevDislikesCount = dislikesCount;

        setDisliked(!prevDisliked);
        setDislikesCount((c) => c + (prevDisliked ? -1 : 1));
        if (prevLiked) {
            setLiked(false);
            setLikesCount((c) => Math.max(0, c - 1));
        }

        const token = await getToken();
        if (!token) {
            setLiked(prevLiked);
            setDisliked(prevDisliked);
            setLikesCount(prevLikesCount);
            setDislikesCount(prevDislikesCount);
            return;
        }

        const result = await dislikeVideo(video.id, token);
        if (!result) {
            setLiked(prevLiked);
            setDisliked(prevDisliked);
            setLikesCount(prevLikesCount);
            setDislikesCount(prevDislikesCount);
            return;
        }
        setLiked(result.liked);
        setDisliked(result.disliked);
        setLikesCount(result.likesCount);
        setDislikesCount(result.dislikesCount);
    }

    if (loading) {
        return (
          <div className="mx-auto max-w-7xl animate-pulse px-4 py-6 sm:px-6 lg:px-8">
              <div className="aspect-video w-full rounded-lg bg-card" />
              <div className="mt-4 h-6 w-2/3 rounded bg-card" />
          </div>
        );
    }

    if (!video) {
        return <p className="px-6 py-20 text-center text-muted-foreground">Vídeo não encontrado</p>;
    }

    return (
      <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4 lg:space-y-5">
                  <div className="lg:rounded-lg overflow-hidden">
                      <VideoPlayer playbackId={playbackIdFrom(video.videoUrl)} title={video.title} />
                  </div>

                  <div className="px-4 sm:px-0">
                      <h1 className="text-lg font-semibold leading-snug text-foreground lg:text-xl">
                          {video.title}
                      </h1>
                      <div className="mt-2">
                          <VideoStats viewCount={video.viewCount} createdAt={video.createdAt} />
                      </div>
                  </div>

                  <div className="px-4 sm:px-0 lg:hidden">
                      <VideoActions
                        liked={liked}
                        disliked={disliked}
                        likesCount={likesCount}
                        dislikesCount={dislikesCount}
                        onToggleLike={handleToggleLike}
                        onToggleDislike={handleToggleDislike}
                      />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4 px-4 sm:px-0">
                      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4 px-4 sm:px-0">
                          <div className="flex items-center gap-3">
                              <VideoAvatar name={video.userName} url={video.userAvatarUrl} className="size-10" />
                              <div>
                                  <p className="text-sm font-medium text-foreground">{video.userName}</p>
                                  <p className="text-xs text-muted-foreground">Criador Imperium</p>
                              </div>
                          </div>
                          <div className="hidden lg:block">
                              <VideoActions
                                liked={liked}
                                disliked={disliked}
                                likesCount={likesCount}
                                dislikesCount={dislikesCount}
                                onToggleLike={handleToggleLike}
                                onToggleDislike={handleToggleDislike}
                              />
                          </div>
                      </div>
                      <div className="hidden lg:block">
                          <VideoActions
                            liked={liked}
                            disliked={disliked}
                            likesCount={likesCount}
                            dislikesCount={dislikesCount}
                            onToggleLike={handleToggleLike}
                            onToggleDislike={handleToggleDislike}
                          />
                      </div>
                  </div>

                  <div className="flex items-center gap-3 px-4 sm:px-0 lg:hidden">
                      <VideoAvatar name={video.userName} url={video.userAvatarUrl} className="size-9" />
                      <div>
                          <p className="text-sm font-medium text-foreground">{video.userName}</p>
                          <p className="text-xs text-muted-foreground">Criador Imperium</p>
                      </div>
                  </div>

                  {video.description && (
                    <div className="mx-4 sm:mx-0 rounded-lg border border-border bg-card">
                        <button
                          type="button"
                          onClick={() => setShowMore((v) => !v)}
                          aria-expanded={showMore}
                          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
                        >
                            Descrição
                            <ChevronDown
                              className={`size-4 transition-transform ${showMore ? "rotate-180" : ""}`}
                            />
                        </button>
                        {showMore && (
                          <div className="border-t border-border px-4 py-4">
                              <VideoDescription description={video.description} hashtags={video.hashtags} />
                          </div>
                        )}
                    </div>
                  )}

                  <div className="px-4 sm:px-0">
                      <VideoComments videoId={video.id} />
                  </div>
              </div>

              <div className="hidden lg:block">
                  <VideoSidebar videos={related} />
              </div>
          </div>

          <div className="mt-8 lg:hidden px-4 sm:px-0">
              <h2 className="text-lg font-semibold mb-4">Vídeos relacionados</h2>
              <VideoSidebar videos={related} />
          </div>
      </div>
    );
}

