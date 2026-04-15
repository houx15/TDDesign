// Hand-crafted mini-mockups for overall_style cards.
// Each fragment is a self-contained HTML string (inline styles only)
// sized to fit a 480x320 card preview. Keep literals stable — tests
// assert canonical headline copy.

export interface StyleBundle {
  background: string;
  text: string;
  accent: string;
  fontFamily: string;
  radius: number;
  shadow: string;
  border: string;
  paddingMin: number;
  paddingMax: number;
  iconStyle: "line" | "filled" | "emoji" | "duotone";
  motionDurationMs: number;
  motionEasing: string;
  mood: string;
}

export const MOOD_DEFAULTS: Record<string, StyleBundle> = {
  "minimal-precise": {
    background: "#0F0F10",
    text: "#FAFAFA",
    accent: "#5B6EE1",
    fontFamily: "Inter, system-ui, sans-serif",
    radius: 6,
    shadow: "0 1px 2px rgba(0,0,0,0.06)",
    border: "none",
    paddingMin: 48,
    paddingMax: 96,
    iconStyle: "line",
    motionDurationMs: 150,
    motionEasing: "ease-out",
    mood: "minimal-precise",
  },
  "editorial-serif": {
    background: "#FDFCF8",
    text: "#1A1A1A",
    accent: "#0057FF",
    fontFamily: "Georgia, 'Times New Roman', serif",
    radius: 4,
    shadow: "none",
    border: "none",
    paddingMin: 64,
    paddingMax: 128,
    iconStyle: "duotone",
    motionDurationMs: 400,
    motionEasing: "ease-in-out",
    mood: "editorial-serif",
  },
  "playful-rounded": {
    background: "#FDE8F4",
    text: "#1A1033",
    accent: "#A855F7",
    fontFamily: "Inter, system-ui, sans-serif",
    radius: 16,
    shadow: "0 8px 24px rgba(168,85,247,0.2)",
    border: "none",
    paddingMin: 32,
    paddingMax: 64,
    iconStyle: "emoji",
    motionDurationMs: 220,
    motionEasing: "cubic-bezier(0.34,1.56,0.64,1)",
    mood: "playful-rounded",
  },
  "brutalist-raw": {
    background: "#D4D4D4",
    text: "#0A0A0A",
    accent: "#DC2626",
    fontFamily: "'Arial Black', Arial, sans-serif",
    radius: 0,
    shadow: "none",
    border: "4px solid #0A0A0A",
    paddingMin: 16,
    paddingMax: 32,
    iconStyle: "filled",
    motionDurationMs: 0,
    motionEasing: "linear",
    mood: "brutalist-raw",
  },
  "warm-technical": {
    background: "#F7F3EC",
    text: "#1A1A1A",
    accent: "#C2410C",
    fontFamily: "Inter, system-ui, sans-serif",
    radius: 6,
    shadow: "0 1px 2px rgba(0,0,0,0.06)",
    border: "none",
    paddingMin: 32,
    paddingMax: 64,
    iconStyle: "line",
    motionDurationMs: 150,
    motionEasing: "ease-out",
    mood: "warm-technical",
  },
  "vivid-modern": {
    background: "#1B1033",
    text: "#F3E8FF",
    accent: "#A855F7",
    fontFamily: "Inter, system-ui, sans-serif",
    radius: 12,
    shadow: "0 8px 32px rgba(168,85,247,0.3)",
    border: "1px solid rgba(255,255,255,0.3)",
    paddingMin: 40,
    paddingMax: 80,
    iconStyle: "duotone",
    motionDurationMs: 220,
    motionEasing: "cubic-bezier(0.34,1.56,0.64,1)",
    mood: "vivid-modern",
  },
};

export const OVERALL_STYLE_MOCKUPS: Record<string, string> = {
  "minimal-precise": [
    '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 32px;box-sizing:border-box;font-family:{{fontFamily}}">',
    '<h1 style="font-size:28px;font-weight:400;letter-spacing:-0.01em;margin:0;text-align:center">Write less. Ship more.</h1>',
    '<div style="width:40px;height:1px;background:rgba(255,255,255,0.15);margin:24px 0"></div>',
    '<p style="font-size:14px;opacity:0.6;margin:0;text-align:center">A distraction-free editor for deep work.</p>',
    '<button style="margin-top:32px;background:{{accent}};color:#fff;border:{{border}};border-radius:{{radius}}px;padding:10px 20px;font-size:13px;font-family:inherit;cursor:pointer;box-shadow:{{shadow}};transition:{{buttonTransition}}">Get started {{iconRow}}</button>',
    "</div>",
  ].join(""),

  "editorial-serif": [
    '<div style="width:100%;height:100%;background:{{background}};color:{{text}};padding:48px 32px 32px 25%;box-sizing:border-box;font-family:{{fontFamily}}">',
    '<div style="font-family:Inter,system-ui,sans-serif;font-size:11px;letter-spacing:0.18em;color:{{accent}};margin-bottom:24px;text-transform:uppercase">ISSUE 14 &middot; APRIL</div>',
    '<h1 style="font-family:{{fontFamily}};font-size:32px;font-style:italic;font-weight:400;line-height:1.15;margin:0 0 20px">The quiet renaissance of slow software.</h1>',
    '<p style="font-family:{{fontFamily}};font-size:14px;font-style:italic;opacity:0.6;line-height:1.5;margin:0 0 24px">Craft, rhythm, and the things we lose when everything is optimized for speed.</p>',
    '<button style="background:transparent;color:{{accent}};border:1px solid {{accent}};border-radius:{{radius}}px;padding:8px 14px;font-family:Inter,system-ui,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;box-shadow:{{shadow}};transition:{{buttonTransition}}">Read the essay {{iconRow}}</button>',
    "</div>",
  ].join(""),

  "playful-rounded": [
    '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;box-sizing:border-box;position:relative;font-family:{{fontFamily}}">',
    '<h1 style="font-size:26px;font-weight:700;margin:0 0 12px;transform:rotate(-1.5deg);text-align:center">Make something people will hug.</h1>',
    '<p style="font-size:13px;opacity:0.7;margin:0 0 24px;text-align:center">The fastest way to ship a product users actually love.</p>',
    '<div style="display:flex;gap:8px">',
    '<button style="background:{{accent}};color:#fff;border:{{border}};border-radius:{{radius}}px;padding:10px 18px;font-size:13px;font-family:inherit;cursor:pointer;box-shadow:{{shadow}};transition:{{buttonTransition}}">Try it free {{iconRow}}</button>',
    '<button style="background:transparent;color:{{accent}};border:1px solid {{accent}};border-radius:{{radius}}px;padding:10px 18px;font-size:13px;font-family:inherit;cursor:pointer">See examples</button>',
    "</div>",
    '<div style="position:absolute;top:16px;right:16px;width:56px;height:56px;background:#F472B6;color:#fff;font-size:12px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center;transform:rotate(8deg)">new!</div>',
    "</div>",
  ].join(""),

  "brutalist-raw": [
    '<div style="width:100%;height:100%;background:{{background}};color:{{text}};position:relative;box-sizing:border-box;border-right:1px solid {{text}};border-bottom:1px solid {{text}};overflow:hidden;font-family:{{fontFamily}}">',
    '<h1 style="font-family:{{fontFamily}};font-size:44px;text-transform:uppercase;line-height:0.95;letter-spacing:-0.02em;margin:24px;margin-left:-8px">BUILT. NOT RENDERED.</h1>',
    '<button style="position:absolute;left:24px;bottom:24px;background:{{text}};color:#fff;border:{{border}};border-radius:{{radius}}px;padding:11px 22px;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;cursor:pointer;box-shadow:{{shadow}};transition:{{buttonTransition}}">ENTER {{iconRow}}</button>',
    '<div style="position:absolute;top:0;right:0;width:1px;height:100%;background:{{text}}"></div>',
    '<div style="position:absolute;left:0;bottom:0;width:100%;height:1px;background:{{text}}"></div>',
    "</div>",
  ].join(""),

  "warm-technical": [
    '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:32px;box-sizing:border-box;font-family:{{fontFamily}}">',
    '<div style="display:flex;flex-direction:column;justify-content:center">',
    '<h1 style="font-size:22px;font-weight:600;line-height:1.2;margin:0 0 12px">Developer tools, built with warmth.</h1>',
    '<p style="font-size:13px;opacity:0.7;line-height:1.5;margin:0 0 20px">APIs that feel hand-held. SDKs that read like prose.</p>',
    '<button style="background:{{accent}};color:#fff;border:{{border}};border-radius:{{radius}}px;padding:10px 18px;font-size:13px;font-family:inherit;cursor:pointer;width:max-content;box-shadow:{{shadow}};transition:{{buttonTransition}}">Read the docs {{iconRow}}</button>',
    "</div>",
    '<div style="background:#1A1A1A;color:#F7F3EC;border-radius:{{radius}}px;padding:14px;font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:11px;line-height:1.6;white-space:pre;align-self:center">',
    '<span style="color:rgba(247,243,236,0.4)">// one tidy export</span>\n',
    '<span style="color:{{accent}}">export async function</span> warm(\n',
    "  request: Request,\n",
    ") {\n",
    '  <span style="color:{{accent}}">return</span> <span style="color:#84CC16">"hello"</span>;\n',
    "}",
    "</div>",
    "</div>",
  ].join(""),

  "vivid-modern": [
    '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;box-sizing:border-box;position:relative;font-family:{{fontFamily}}">',
    '<h1 style="font-size:36px;font-weight:700;line-height:1.0;margin:0 0 14px;background:linear-gradient(90deg,{{accent}},#F472B6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-align:center">The future, early.</h1>',
    '<p style="font-size:13px;opacity:0.8;margin:0 0 28px;text-align:center">Compute, rendered at the speed of thought.</p>',
    '<button style="background:rgba(255,255,255,0.12);border:{{border}};backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:{{radius}}px;padding:11px 22px;font-size:13px;color:#fff;font-weight:500;font-family:inherit;cursor:pointer;box-shadow:{{shadow}};transition:{{buttonTransition}}">Join the waitlist {{iconRow}}</button>',
    '<div style="position:absolute;left:10%;right:10%;bottom:16px;height:2px;background:linear-gradient(90deg,transparent,{{accent}},transparent)"></div>',
    "</div>",
  ].join(""),
};

export function interpolate(
  template: string,
  slots: Record<string, string | number>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    slots[key] !== undefined ? String(slots[key]) : "",
  );
}

function renderIconRow(iconStyle: StyleBundle["iconStyle"]): string {
  if (iconStyle === "line") return "→";
  if (iconStyle === "filled") return "▶";
  if (iconStyle === "emoji") return "🚀";
  return "◆"; // duotone fallback
}

export function deriveSlots(
  bundle: StyleBundle,
): Record<string, string | number> {
  return {
    ...bundle,
    buttonTransition: `transform ${bundle.motionDurationMs}ms ${bundle.motionEasing}`,
    iconRow: renderIconRow(bundle.iconStyle),
  };
}
