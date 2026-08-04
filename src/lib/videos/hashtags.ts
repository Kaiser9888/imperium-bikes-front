const HASHTAG_REGEX = /#([\p{L}0-9_]+)/gu;

/** Extrai hashtags únicas de um texto (ex: description), sem o "#", em minúsculo. */
export function extractHashtags(text?: string): string[] {
  if (!text) return [];
  const found = text.match(HASHTAG_REGEX) ?? [];
  const unique = new Set(found.map((h) => h.slice(1).toLowerCase()));
  return Array.from(unique);
}

/** Normaliza uma hashtag vinda da URL (decode + remove "#" + minúsculo). */
export function normalizeHashtag(raw: string): string {
  return decodeURIComponent(raw).replace(/^#/, "").toLowerCase();
}