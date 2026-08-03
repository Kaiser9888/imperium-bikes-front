import { Eye, Clock } from "lucide-react";
import { formatViews, timeAgo } from "@/lib/videos/format";

interface VideoStatsProps {
    viewCount: number;
    createdAt: string;
}

export function VideoStats({ viewCount, createdAt }: VideoStatsProps) {
    return (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <Eye className="size-3.5" aria-hidden="true" />
          {formatViews(viewCount)} visualizações
      </span>
            <span className="flex items-center gap-1.5">
        <Clock className="size-3.5" aria-hidden="true" />
        <time dateTime={createdAt}>{timeAgo(createdAt)}</time>
      </span>
        </div>
    );
}
