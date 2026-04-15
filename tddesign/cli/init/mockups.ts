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
  headingScale: number;
  bodySize: number;
  gap: number;
  alignment: "centered" | "left" | "split";
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
    headingScale: 28,
    bodySize: 14,
    gap: 24,
    alignment: "centered",
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
    headingScale: 32,
    bodySize: 14,
    gap: 20,
    alignment: "left",
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
    headingScale: 26,
    bodySize: 13,
    gap: 16,
    alignment: "centered",
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
    headingScale: 44,
    bodySize: 14,
    gap: 8,
    alignment: "left",
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
    headingScale: 22,
    bodySize: 13,
    gap: 16,
    alignment: "left",
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
    headingScale: 36,
    bodySize: 13,
    gap: 20,
    alignment: "centered",
  },
};

export const OVERALL_STYLE_MOCKUPS: Record<string, Record<string, string>> = {
  landing: {
    "minimal-precise": [
      '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:{{paddingMin}}px {{paddingMax}}px;box-sizing:border-box;font-family:{{fontFamily}}">',
      '<h1 style="font-size:28px;font-weight:400;letter-spacing:-0.01em;margin:0;text-align:center">Write less. Ship more.</h1>',
      '<div style="width:40px;height:1px;background:rgba(255,255,255,0.15);margin:24px 0"></div>',
      '<p style="font-size:14px;opacity:0.6;margin:0;text-align:center">A distraction-free editor for deep work, built by people who ship every day.</p>',
      '<div data-role="figure" style="width:100%;height:60px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:{{radius}}px;margin:16px 0"></div>',
      '<button onmouseover="this.style.transform=\'scale(1.04)\'" onmouseout="this.style.transform=\'scale(1)\'" style="margin-top:32px;background:{{accent}};color:#fff;border:{{border}};border-radius:{{radius}}px;padding:10px 20px;font-size:13px;font-family:inherit;cursor:pointer;box-shadow:{{shadow}};transition:{{buttonTransition}}">Get started {{iconRow}}</button>',
      "</div>",
    ].join(""),

    "editorial-serif": [
      '<div style="width:100%;height:100%;background:{{background}};color:{{text}};padding:{{paddingMin}}px {{paddingMax}}px {{paddingMin}}px 25%;box-sizing:border-box;font-family:{{fontFamily}}">',
      '<div style="font-family:Inter,system-ui,sans-serif;font-size:11px;letter-spacing:0.18em;color:{{accent}};margin-bottom:24px;text-transform:uppercase">ISSUE 14 &middot; APRIL</div>',
      '<h1 style="font-family:{{fontFamily}};font-size:32px;font-style:italic;font-weight:400;line-height:1.15;margin:0 0 20px">The quiet renaissance of slow software.</h1>',
      '<p style="font-family:{{fontFamily}};font-size:14px;font-style:italic;opacity:0.6;line-height:1.5;margin:0 0 24px">Craft, rhythm, and the things we lose when everything is optimized for speed.</p>',
      '<figure style="width:100%;height:70px;background:rgba(0,87,255,0.06);border-left:3px solid {{accent}};margin:0 0 20px;display:flex;align-items:center;padding:0 16px;font-size:11px;font-style:italic;opacity:0.5">[ pull quote ]</figure>',
      '<button onmouseover="this.style.transform=\'scale(1.04)\'" onmouseout="this.style.transform=\'scale(1)\'" style="background:transparent;color:{{accent}};border:1px solid {{accent}};border-radius:{{radius}}px;padding:8px 14px;font-family:Inter,system-ui,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;box-shadow:{{shadow}};transition:{{buttonTransition}}">Read the essay {{iconRow}}</button>',
      "</div>",
    ].join(""),

    "playful-rounded": [
      '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:{{paddingMin}}px {{paddingMax}}px;box-sizing:border-box;position:relative;font-family:{{fontFamily}}">',
      '<h1 style="font-size:26px;font-weight:700;margin:0 0 12px;transform:rotate(-1.5deg);text-align:center">Make something people will hug.</h1>',
      '<p style="font-size:13px;opacity:0.7;margin:0 0 24px;text-align:center">The fastest, friendliest way to ship a product your users will actually love every day.</p>',
      '<div data-role="figure" style="width:120px;height:60px;background:linear-gradient(135deg,#F472B6,#A855F7);border-radius:{{radius}}px;margin:12px 0"></div>',
      '<div style="display:flex;gap:8px">',
      '<button onmouseover="this.style.transform=\'scale(1.04)\'" onmouseout="this.style.transform=\'scale(1)\'" style="background:{{accent}};color:#fff;border:{{border}};border-radius:{{radius}}px;padding:10px 18px;font-size:13px;font-family:inherit;cursor:pointer;box-shadow:{{shadow}};transition:{{buttonTransition}}">Try it free {{iconRow}}</button>',
      '<button onmouseover="this.style.transform=\'scale(1.04)\'" onmouseout="this.style.transform=\'scale(1)\'" style="background:transparent;color:{{accent}};border:1px solid {{accent}};border-radius:{{radius}}px;padding:10px 18px;font-size:13px;font-family:inherit;cursor:pointer;transition:{{buttonTransition}}">See examples</button>',
      "</div>",
      '<div style="position:absolute;top:16px;right:16px;width:56px;height:56px;background:#F472B6;color:#fff;font-size:12px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center;transform:rotate(8deg)">new!</div>',
      "</div>",
    ].join(""),

    "brutalist-raw": [
      '<div style="width:100%;height:100%;background:{{background}};color:{{text}};position:relative;box-sizing:border-box;border-right:1px solid {{text}};border-bottom:1px solid {{text}};overflow:hidden;font-family:{{fontFamily}};padding:{{paddingMin}}px {{paddingMax}}px">',
      '<h1 style="font-family:{{fontFamily}};font-size:44px;text-transform:uppercase;line-height:0.95;letter-spacing:-0.02em;margin:0;margin-left:-8px;border-bottom:4px solid {{accent}};display:inline-block;padding-bottom:4px">BUILT. NOT RENDERED.</h1>',
      '<p style="font-family:{{fontFamily}};font-size:13px;margin:16px 0 0;max-width:70%;line-height:1.3">Raw concrete interfaces for operators who would rather ship than perform. No varnish, no apology.</p>',
      '<div data-role="figure" style="position:absolute;right:{{paddingMin}}px;top:{{paddingMin}}px;width:80px;height:80px;background:{{text}};opacity:0.1"></div>',
      '<button onmouseover="this.style.transform=\'scale(1.04)\'" onmouseout="this.style.transform=\'scale(1)\'" style="position:absolute;left:{{paddingMin}}px;bottom:{{paddingMin}}px;background:{{text}};color:#fff;border:{{border}};border-radius:{{radius}}px;padding:11px 22px;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;cursor:pointer;box-shadow:{{shadow}};transition:{{buttonTransition}}">ENTER {{iconRow}}</button>',
      '<div style="position:absolute;top:0;right:0;width:1px;height:100%;background:{{text}}"></div>',
      '<div style="position:absolute;left:0;bottom:0;width:100%;height:1px;background:{{text}}"></div>',
      "</div>",
    ].join(""),

    "warm-technical": [
      '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:{{paddingMin}}px {{paddingMax}}px;box-sizing:border-box;font-family:{{fontFamily}}">',
      '<div style="display:flex;flex-direction:column;justify-content:center">',
      '<h1 style="font-size:22px;font-weight:600;line-height:1.2;margin:0 0 12px">Developer tools, built with warmth.</h1>',
      '<p style="font-size:13px;opacity:0.7;line-height:1.5;margin:0 0 20px">APIs that feel hand-held and SDKs that read like prose, shaped by engineers who actually use them.</p>',
      '<button onmouseover="this.style.transform=\'scale(1.04)\'" onmouseout="this.style.transform=\'scale(1)\'" style="background:{{accent}};color:#fff;border:{{border}};border-radius:{{radius}}px;padding:10px 18px;font-size:13px;font-family:inherit;cursor:pointer;width:max-content;box-shadow:{{shadow}};transition:{{buttonTransition}}">Read the docs {{iconRow}}</button>',
      "</div>",
      '<div data-role="figure" style="background:#1A1A1A;color:#F7F3EC;border-radius:{{radius}}px;padding:14px;font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:11px;line-height:1.6;white-space:pre;align-self:center">',
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
      '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:{{paddingMin}}px {{paddingMax}}px;box-sizing:border-box;position:relative;font-family:{{fontFamily}}">',
      '<h1 style="font-size:36px;font-weight:700;line-height:1.0;margin:0 0 14px;background:linear-gradient(90deg,{{accent}},#F472B6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-align:center">The future, early.</h1>',
      '<p style="font-size:13px;opacity:0.8;margin:0 0 28px;text-align:center">Compute, rendered at the speed of thought — pipelines that feel like a conversation with your future product.</p>',
      '<div data-role="figure" style="width:140px;height:4px;background:linear-gradient(90deg,transparent,{{accent}},transparent);margin:14px auto"></div>',
      '<button onmouseover="this.style.transform=\'scale(1.04)\'" onmouseout="this.style.transform=\'scale(1)\'" style="background:rgba(255,255,255,0.12);border:{{border}};backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:{{radius}}px;padding:11px 22px;font-size:13px;color:#fff;font-weight:500;font-family:inherit;cursor:pointer;box-shadow:{{shadow}};transition:{{buttonTransition}}">Join the waitlist {{iconRow}}</button>',
      '<div style="position:absolute;left:10%;right:10%;bottom:16px;height:2px;background:linear-gradient(90deg,transparent,{{accent}},transparent)"></div>',
      "</div>",
    ].join(""),
  },
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

function deriveContainerAlign(a: StyleBundle["alignment"]): string {
  if (a === "centered") return "center";
  if (a === "split") return "space-between";
  return "flex-start";
}

export function deriveSlots(
  bundle: StyleBundle,
): Record<string, string | number> {
  return {
    ...bundle,
    buttonTransition: `transform ${bundle.motionDurationMs}ms ${bundle.motionEasing}`,
    iconRow: renderIconRow(bundle.iconStyle),
    containerAlign: deriveContainerAlign(bundle.alignment),
  };
}

export const NEUTRAL_BUNDLE: StyleBundle = {
  background: "#F7F7F8",
  text: "#1A1A1A",
  accent: "#3B82F6",
  fontFamily: "Inter, system-ui, sans-serif",
  radius: 6,
  shadow: "0 1px 2px rgba(0,0,0,0.06)",
  border: "none",
  paddingMin: 32,
  paddingMax: 48,
  iconStyle: "line",
  motionDurationMs: 150,
  motionEasing: "ease-out",
  mood: "neutral",
  headingScale: 24,
  bodySize: 13,
  gap: 20,
  alignment: "left",
};

export const PAGE_TYPE_PREVIEWS: Record<string, string> = {
  landing: [
    '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;padding:{{paddingMin}}px {{paddingMax}}px;box-sizing:border-box;font-family:{{fontFamily}};gap:{{gap}}px">',
    '<div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.5">LANDING PAGE</div>',
    '<h1 style="font-size:{{headingScale}}px;font-weight:600;margin:0;line-height:1.1">A marketing hero that sells the product.</h1>',
    '<p style="font-size:{{bodySize}}px;opacity:0.7;margin:0;max-width:60%">Headline, subheadline, a primary call-to-action, a product figure, and a row of feature callouts underneath.</p>',
    '<div style="display:flex;gap:12px;align-items:center">',
    '<button style="background:{{accent}};color:#fff;border:none;border-radius:{{radius}}px;padding:8px 16px;font-size:12px;font-family:inherit;cursor:pointer">Get started →</button>',
    '<span style="font-size:11px;opacity:0.6">or see examples</span>',
    "</div>",
    '<div data-role="figure" style="flex:1;min-height:60px;background:rgba(0,0,0,0.05);border-radius:{{radius}}px;display:flex;align-items:center;justify-content:center;font-size:10px;opacity:0.4">[ product figure ]</div>',
    "</div>",
  ].join(""),

  dashboard: [
    '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;box-sizing:border-box;font-family:{{fontFamily}}">',
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid rgba(0,0,0,0.08)">',
    '<div style="font-size:13px;font-weight:600">◆ Dashboard</div>',
    '<div style="font-size:11px;opacity:0.6">houyuxin@local</div>',
    "</div>",
    '<div style="padding:16px 20px;display:flex;flex-direction:column;gap:{{gap}}px;flex:1">',
    '<h1 style="font-size:{{headingScale}}px;font-weight:600;margin:0">Q2 performance overview</h1>',
    '<p style="font-size:{{bodySize}}px;opacity:0.7;margin:0">Top-line metrics, a trend chart, and a transaction table below for daily review.</p>',
    '<div data-role="kpi" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">',
    '<div style="border:1px solid rgba(0,0,0,0.1);border-radius:{{radius}}px;padding:10px"><div style="font-size:10px;opacity:0.6">Revenue</div><div style="font-size:18px;font-weight:600">$48.2k</div></div>',
    '<div style="border:1px solid rgba(0,0,0,0.1);border-radius:{{radius}}px;padding:10px"><div style="font-size:10px;opacity:0.6">Active</div><div style="font-size:18px;font-weight:600">1,204</div></div>',
    '<div style="border:1px solid rgba(0,0,0,0.1);border-radius:{{radius}}px;padding:10px"><div style="font-size:10px;opacity:0.6">Churn</div><div style="font-size:18px;font-weight:600">2.3%</div></div>',
    "</div>",
    '<div style="flex:1;background:rgba(0,0,0,0.04);border-radius:{{radius}}px;min-height:40px;display:flex;align-items:center;justify-content:center;font-size:10px;opacity:0.4">[ chart area ]</div>',
    "</div>",
    "</div>",
  ].join(""),
};
