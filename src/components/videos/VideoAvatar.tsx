interface VideoAvatarProps {
    name: string;
    url?: string | undefined;
    className?: string;
}

export function VideoAvatar({ name, url, className = "size-6" }: VideoAvatarProps) {
    const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";
    return (
        <span
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary ${className}`}
        >
      {url ? (
          <img src={url} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
      ) : (
          <span className="text-[0.65rem] font-semibold text-primary">{initial}</span>
      )}
    </span>
    );
}