import defaultTheme from "tailwindcss/defaultTheme.js";

const spacing = (defaultTheme as { spacing: Record<string, string> }).spacing;
const borderRadius = (defaultTheme as { borderRadius: Record<string, string> })
  .borderRadius;

export interface ResolvedStyle {
  property: string;
  value: string;
}

export function resolveTailwindClass(token: string): ResolvedStyle | null {
  const arbBg = token.match(/^bg-\[(#[0-9a-fA-F]{3,8})\]$/);
  if (arbBg) return { property: "background-color", value: arbBg[1] };

  const arbText = token.match(/^text-\[(#[0-9a-fA-F]{3,8})\]$/);
  if (arbText) return { property: "color", value: arbText[1] };

  const pad = token.match(/^p([xytblr]?)-(\d+(?:\.\d+)?)$/);
  if (pad) {
    const sideKey = pad[1];
    const v = spacing[pad[2]];
    if (!v) return null;
    const px = remToPx(v);
    const property =
      sideKey === "x"
        ? "padding-inline"
        : sideKey === "y"
        ? "padding-block"
        : sideKey === "t"
        ? "padding-top"
        : sideKey === "b"
        ? "padding-bottom"
        : sideKey === "l"
        ? "padding-left"
        : sideKey === "r"
        ? "padding-right"
        : "padding";
    return { property, value: px };
  }

  const rad = token.match(/^rounded(?:-(.+))?$/);
  if (rad) {
    const key = rad[1] ?? "DEFAULT";
    const v = borderRadius[key];
    if (!v) return null;
    return { property: "border-radius", value: v };
  }

  return null;
}

function remToPx(rem: string): string {
  const n = parseFloat(rem);
  if (isNaN(n)) return rem;
  return `${n * 16}px`;
}
