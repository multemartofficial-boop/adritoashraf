import type { CardTheme } from "@/types/database";

/** Public portfolio card backgrounds (from the reference) and matching text tone. */
export const CARD_THEMES: Record<CardTheme, { bg: string; dark: boolean }> = {
  sky: { bg: "bg-[linear-gradient(135deg,#ffffff_0%,#e6f1ff_45%,#9cc9ff_100%)]", dark: false },
  holo: { bg: "bg-holo", dark: false },
  aurum: { bg: "bg-[linear-gradient(135deg,#5b2bd9_0%,#9b5cf0_45%,#f4c56a_100%)]", dark: true },
  peach: { bg: "bg-[linear-gradient(135deg,#fff3ec_0%,#f7b6a0_55%,#f4a6c8_100%)]", dark: false },
  violet: { bg: "bg-[linear-gradient(135deg,#1c1240_0%,#3d1f8f_50%,#7b4fff_100%)]", dark: true },
};
