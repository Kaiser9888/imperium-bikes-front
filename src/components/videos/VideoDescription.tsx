import Link from "next/link";
import type { ReactNode } from "react";

interface VideoDescriptionProps {
  description?: string;
  hashtags?: string[];
}

const HASHTAG_REGEX = /#([\p{L}0-9_]+)/gu;

export function VideoDescription({ description, hashtags }: VideoDescriptionProps) {
  if (!description) return null;

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(HASHTAG_REGEX);
  let key = 0;

  while ((match = regex.exec(description)) !== null) {
    if (match.index > lastIndex) {
      parts.push(description.slice(lastIndex, match.index));
    }
    const tag = match[1]!;
    parts.push(
      <Link
        key={`tag-${key++}`}
        href={`/videos/hashtag/${encodeURIComponent(tag.toLowerCase())}`}
        className="font-medium text-primary hover:underline"
      >
        #{tag}
      </Link>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < description.length) {
    parts.push(description.slice(lastIndex));
  }

  // Hashtags que vieram num campo separado do backend e não estão no texto da descrição.
  const extraTags = (hashtags ?? []).filter(
    (t) => !description.toLowerCase().includes(`#${t.toLowerCase()}`)
  );

  return (
    <div className="space-y-3">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
        {parts}
      </p>
      {extraTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {extraTags.map((tag) => (
            <Link
              key={tag}
              href={`/videos/hashtag/${encodeURIComponent(tag.toLowerCase())}`}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}