import { Globe, MessageCircle } from "lucide-react";

// Brand glyphs (Simple Icons, CC0). lucide-react no longer ships brand icons.
const PATHS: Record<string, string> = {
  github:
    "M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3",
  linkedin:
    "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z",
  facebook:
    "M9.1 23.69v-7.98H6.63v-3.67H9.1v-1.58c0-4.09 1.85-5.98 5.86-5.98.76 0 2.07.15 2.61.3v3.32c-.28-.03-.78-.04-1.39-.04-1.97 0-2.73.75-2.73 2.69v1.3h3.92l-.67 3.66h-3.25v8.25A12 12 0 1 0 9.1 23.69Z",
  x: "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z",
  youtube:
    "M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z",
};

export const SOCIAL_LABEL: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  x: "X (Twitter)",
  instagram: "Instagram",
  youtube: "YouTube",
  dribbble: "Dribbble",
  behance: "Behance",
  whatsapp: "WhatsApp",
  website: "Website",
};

export function SocialIcon({ platform, className = "size-4" }: { platform: string; className?: string }) {
  if (PATHS[platform]) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
        <path d={PATHS[platform]} />
      </svg>
    );
  }
  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
        <circle cx="12" cy="12" r="4.25" />
        <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (platform === "whatsapp") return <MessageCircle className={className} aria-hidden />;
  return <Globe className={className} aria-hidden />;
}
