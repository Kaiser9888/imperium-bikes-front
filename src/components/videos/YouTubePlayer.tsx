/** Player do YouTube embutido (lives e vídeos do YouTube). `embedUrl` vem pronto do backend. */
export function YouTubePlayer({ embedUrl, title, autoplay = false }: { embedUrl: string; title: string; autoplay?: boolean }) {
  // Autoplay só funciona mudo no celular; a pessoa liga o som no player
  const params = new URLSearchParams({ rel: "0", playsinline: "1", ...(autoplay ? { autoplay: "1", mute: "1" } : {}) });
  return (
    <div className="aspect-video w-full bg-black">
      <iframe
        src={`${embedUrl}?${params}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="size-full border-0"
      />
    </div>
  );
}
