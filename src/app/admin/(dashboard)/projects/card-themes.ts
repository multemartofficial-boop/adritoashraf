import type { CardTheme } from "@/types/database";

/** Admin preview swatches for the public portfolio card gradients. */
export const CARD_THEME_META: Record<CardTheme, { label: string; swatch: string }> = {
  sky: { label: "Sky (white to blue)", swatch: "bg-gradient-to-br from-white to-sky-300" },
  holo: { label: "Holographic (lavender / pink)", swatch: "bg-gradient-to-br from-violet-200 via-pink-200 to-sky-200" },
  aurum: { label: "Aurum (purple to gold)", swatch: "bg-gradient-to-br from-violet-600 to-amber-300" },
  peach: { label: "Peach (peach to pink)", swatch: "bg-gradient-to-br from-orange-200 to-pink-300" },
  violet: { label: "Violet (deep purple)", swatch: "bg-gradient-to-br from-indigo-900 to-violet-500" },
};
