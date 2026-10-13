export type VideoSource = { kind: "youtube" | "vimeo"; embed: string } | { kind: "file"; src: string };

/** Turn a YouTube / Vimeo / direct file URL into something we can safely embed. */
export function parseVideoUrl(url: string): VideoSource | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com") {
      const id =
        host === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v") ?? u.pathname.match(/\/(embed|shorts)\/([\w-]{11})/)?.[2];
      return id && /^[\w-]{11}$/.test(id) ? { kind: "youtube", embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` } : null;
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = u.pathname.match(/(\d{6,})/)?.[1];
      return id ? { kind: "vimeo", embed: `https://player.vimeo.com/video/${id}?autoplay=1` } : null;
    }
    if (/\.(mp4|webm|mov)$/i.test(u.pathname)) return { kind: "file", src: u.toString() };
    return null;
  } catch {
    return null;
  }
}
