import { VideoAvatar } from "./VideoAvatar";

interface ProfileHeaderProps {
  videoCount: number;
  name?: string;
  avatarUrl?: string;
}

export function ProfileHeader({
                                videoCount,
                                name = "Você",
                                avatarUrl,
                              }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <VideoAvatar name={name} url={avatarUrl} className="size-14" />
      <div>
        <p className="text-base font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">
          {videoCount} vídeo{videoCount !== 1 ? "s" : ""} publicado{videoCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}