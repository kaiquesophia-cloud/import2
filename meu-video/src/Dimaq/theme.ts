export const display = "Oswald";
export const body = "Public Sans";

export const DARK = "#1F1F1F";
export const LIGHT = "#F4F2EE";
export const ACCENT = "#F5A500";
export const EYEBROW_ON_LIGHT = "#8A5A00";
export const MUTED_ON_DARK = "#C9C4BC";
export const MUTED_ON_LIGHT = "#4A4744";
export const DANGER = "#D64535";
export const OK = "#2E9E5B";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
