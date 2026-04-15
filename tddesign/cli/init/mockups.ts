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

  dashboard: {
    "minimal-precise": [
      '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;box-sizing:border-box;font-family:{{fontFamily}}">',
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.08)">',
      '<div style="font-size:12px;font-weight:500;letter-spacing:-0.01em">— dashboard</div>',
      '<div style="font-size:10px;opacity:0.5">2026 Q2</div>',
      "</div>",
      '<div style="flex:1;display:flex;flex-direction:column;gap:{{gap}}px;padding:{{paddingMin}}px {{paddingMax}}px">',
      '<h1 style="font-size:{{headingScale}}px;font-weight:400;letter-spacing:-0.01em;margin:0;line-height:1.15">Quarterly numbers, at a glance.</h1>',
      '<p style="font-size:{{bodySize}}px;opacity:0.55;margin:0;max-width:80%;line-height:1.5">A clean dashboard for revenue, activation, and retention — just the numbers you check every morning.</p>',
      '<div data-role="kpi" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:4px">',
      '<div style="border:1px solid rgba(255,255,255,0.08);padding:10px 12px"><div style="font-size:9px;letter-spacing:0.08em;opacity:0.5;text-transform:uppercase">REVENUE</div><div style="font-size:20px;font-weight:500;color:{{accent}};margin-top:2px">$48.2k</div></div>',
      '<div style="border:1px solid rgba(255,255,255,0.08);padding:10px 12px"><div style="font-size:9px;letter-spacing:0.08em;opacity:0.5;text-transform:uppercase">ACTIVE</div><div style="font-size:20px;font-weight:500;margin-top:2px">1,204</div></div>',
      '<div style="border:1px solid rgba(255,255,255,0.08);padding:10px 12px"><div style="font-size:9px;letter-spacing:0.08em;opacity:0.5;text-transform:uppercase">CHURN</div><div style="font-size:20px;font-weight:500;margin-top:2px">2.3%</div></div>',
      "</div>",
      '<div style="flex:1;min-height:40px;border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;font-size:10px;opacity:0.35">[ chart ]</div>',
      "</div>",
      "</div>",
    ].join(""),

    "editorial-serif": [
      '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;box-sizing:border-box;font-family:{{fontFamily}}">',
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid rgba(0,0,0,0.12)">',
      '<div style="font-family:Inter,system-ui,sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:{{accent}}">The Quarterly</div>',
      '<div style="font-family:Inter,system-ui,sans-serif;font-size:10px;opacity:0.5;letter-spacing:0.08em">VOL. 14 &middot; Q2</div>',
      "</div>",
      '<div style="flex:1;display:flex;flex-direction:column;gap:{{gap}}px;padding:{{paddingMin}}px {{paddingMax}}px;text-align:left">',
      '<h1 style="font-family:{{fontFamily}};font-size:{{headingScale}}px;font-style:italic;font-weight:400;margin:0;line-height:1.15">The state of the business, in prose.</h1>',
      '<p style="font-family:{{fontFamily}};font-size:{{bodySize}}px;font-style:italic;opacity:0.65;margin:0;max-width:82%;line-height:1.55">A considered view of the quarter\'s performance, arranged like a magazine spread for thoughtful Monday-morning reading.</p>',
      '<div data-role="kpi" style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;border-top:1px solid rgba(0,0,0,0.15);padding-top:12px">',
      '<div style="border-bottom:1px solid rgba(0,0,0,0.15);padding-bottom:8px"><div style="font-family:Inter,system-ui,sans-serif;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.5">Revenue</div><div style="font-size:22px;font-weight:400;color:{{accent}};margin-top:4px">$48.2k</div></div>',
      '<div style="border-bottom:1px solid rgba(0,0,0,0.15);padding-bottom:8px"><div style="font-family:Inter,system-ui,sans-serif;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.5">Active</div><div style="font-size:22px;font-weight:400;margin-top:4px">1,204</div></div>',
      '<div style="border-bottom:1px solid rgba(0,0,0,0.15);padding-bottom:8px"><div style="font-family:Inter,system-ui,sans-serif;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.5">Churn</div><div style="font-size:22px;font-weight:400;margin-top:4px">2.3%</div></div>',
      "</div>",
      '<div style="flex:1;min-height:40px;background:rgba(0,87,255,0.04);border-left:3px solid {{accent}};display:flex;align-items:center;padding:0 16px;font-family:Inter,system-ui,sans-serif;font-size:10px;font-style:italic;opacity:0.5">[ trend essay ]</div>',
      "</div>",
      "</div>",
    ].join(""),

    "playful-rounded": [
      '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;box-sizing:border-box;font-family:{{fontFamily}}">',
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 18px">',
      '<div style="font-size:13px;font-weight:700">🎯 Hello, friend</div>',
      '<div style="font-size:10px;background:#F472B6;color:#fff;border-radius:999px;padding:4px 10px;font-weight:600">✨ Q2</div>',
      "</div>",
      '<div style="flex:1;display:flex;flex-direction:column;gap:{{gap}}px;padding:{{paddingMin}}px {{paddingMax}}px">',
      '<h1 style="font-size:{{headingScale}}px;font-weight:700;margin:0;line-height:1.15;text-align:center;transform:rotate(-0.5deg)">Everything you need, none of the noise.</h1>',
      '<p style="font-size:{{bodySize}}px;opacity:0.7;margin:0;text-align:center;line-height:1.5">Warm, rounded panels that make the morning metrics feel like good news instead of a job description.</p>',
      '<div data-role="kpi" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;box-shadow:{{shadow}};border-radius:{{radius}}px;padding:4px">',
      '<div style="background:#fff;border-radius:{{radius}}px;padding:12px 14px;text-align:center"><div style="font-size:10px;opacity:0.6;font-weight:600">REVENUE</div><div style="font-size:20px;font-weight:800;color:{{accent}};margin-top:2px">$48.2k</div></div>',
      '<div style="background:#fff;border-radius:{{radius}}px;padding:12px 14px;text-align:center"><div style="font-size:10px;opacity:0.6;font-weight:600">ACTIVE</div><div style="font-size:20px;font-weight:800;margin-top:2px">1,204</div></div>',
      '<div style="background:#fff;border-radius:{{radius}}px;padding:12px 14px;text-align:center"><div style="font-size:10px;opacity:0.6;font-weight:600">CHURN</div><div style="font-size:20px;font-weight:800;margin-top:2px">2.3%</div></div>',
      "</div>",
      '<div style="flex:1;min-height:40px;background:linear-gradient(135deg,#FBCFE8,#DDD6FE);border-radius:{{radius}}px;display:flex;align-items:center;justify-content:center;font-size:10px;opacity:0.6">[ happy chart ]</div>',
      "</div>",
      "</div>",
    ].join(""),

    "brutalist-raw": [
      '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;box-sizing:border-box;font-family:{{fontFamily}};border-right:1px solid {{text}};border-bottom:1px solid {{text}}">',
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:4px solid {{text}}">',
      '<div style="font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:0.02em">DASHBOARD //</div>',
      '<div style="font-size:10px;font-weight:700;text-transform:uppercase">Q2 / 2026</div>',
      "</div>",
      '<div style="flex:1;display:flex;flex-direction:column;gap:{{gap}}px;padding:{{paddingMin}}px {{paddingMax}}px">',
      '<h1 style="font-family:\'Arial Black\',Arial,sans-serif;font-size:{{headingScale}}px;text-transform:uppercase;line-height:0.95;letter-spacing:-0.02em;margin:0;border-bottom:4px solid {{accent}};display:inline-block;padding-bottom:4px">NUMBERS. NO FLUFF.</h1>',
      '<p style="font-size:{{bodySize}}px;margin:0;max-width:80%;line-height:1.3;text-transform:uppercase;font-weight:700">Raw data in a raw grid — revenue, active users, and churn rate on a single unapologetic screen.</p>',
      '<div data-role="kpi" style="display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:4px solid {{text}}">',
      '<div style="border-right:4px solid {{text}};padding:10px 12px"><div style="font-size:10px;font-weight:900;text-transform:uppercase">REVENUE</div><div style="font-size:22px;font-weight:900;color:{{accent}}">$48.2K</div></div>',
      '<div style="border-right:4px solid {{text}};padding:10px 12px"><div style="font-size:10px;font-weight:900;text-transform:uppercase">ACTIVE</div><div style="font-size:22px;font-weight:900">1,204</div></div>',
      '<div style="padding:10px 12px"><div style="font-size:10px;font-weight:900;text-transform:uppercase">CHURN</div><div style="font-size:22px;font-weight:900">2.3%</div></div>',
      "</div>",
      '<div style="flex:1;min-height:40px;border:4px solid {{text}};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;text-transform:uppercase">[ GRID ]</div>',
      "</div>",
      "</div>",
    ].join(""),

    "warm-technical": [
      '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;box-sizing:border-box;font-family:{{fontFamily}}">',
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid rgba(0,0,0,0.12)">',
      '<div style="font-size:12px;font-weight:600">◆ operator</div>',
      '<div style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:10px;opacity:0.6">q2.2026 · on-call</div>',
      "</div>",
      '<div style="flex:1;display:flex;flex-direction:column;gap:{{gap}}px;padding:{{paddingMin}}px {{paddingMax}}px;text-align:left">',
      '<h1 style="font-size:{{headingScale}}px;font-weight:600;margin:0;line-height:1.2">Operator dashboard.</h1>',
      '<p style="font-size:{{bodySize}}px;opacity:0.7;margin:0;max-width:82%;line-height:1.5">Dense telemetry with room to breathe: throughput, error rate, and latency arranged for the on-call engineer.</p>',
      '<div data-role="kpi" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">',
      '<div style="border:1px solid rgba(0,0,0,0.15);border-radius:{{radius}}px;padding:10px 12px"><div style="font-size:10px;opacity:0.6;letter-spacing:0.06em;text-transform:uppercase">Revenue</div><div style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:18px;font-weight:600;color:{{accent}};margin-top:2px">$48.2k</div></div>',
      '<div style="border:1px solid rgba(0,0,0,0.15);border-radius:{{radius}}px;padding:10px 12px"><div style="font-size:10px;opacity:0.6;letter-spacing:0.06em;text-transform:uppercase">Active</div><div style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:18px;font-weight:600;margin-top:2px">1,204</div></div>',
      '<div style="border:1px solid rgba(0,0,0,0.15);border-radius:{{radius}}px;padding:10px 12px"><div style="font-size:10px;opacity:0.6;letter-spacing:0.06em;text-transform:uppercase">Churn</div><div style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:18px;font-weight:600;margin-top:2px">2.3%</div></div>',
      "</div>",
      '<div style="flex:1;min-height:40px;background:rgba(194,65,12,0.06);border:1px solid rgba(194,65,12,0.25);border-radius:{{radius}}px;display:flex;align-items:center;padding:0 12px;font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:10px;opacity:0.7">p50=42ms p95=108ms err=0.02%</div>',
      "</div>",
      "</div>",
    ].join(""),

    "vivid-modern": [
      '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;box-sizing:border-box;font-family:{{fontFamily}};position:relative;overflow:hidden">',
      '<div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 0%,rgba(168,85,247,0.35),transparent 55%),radial-gradient(circle at 90% 10%,rgba(244,114,182,0.25),transparent 50%);pointer-events:none"></div>',
      '<div style="position:relative;display:flex;align-items:center;justify-content:space-between;padding:10px 16px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);background:rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.12)">',
      '<div style="font-size:12px;font-weight:600">◆ pulse</div>',
      '<div style="font-size:10px;opacity:0.75">Q2 · live</div>',
      "</div>",
      '<div style="position:relative;flex:1;display:flex;flex-direction:column;gap:{{gap}}px;padding:{{paddingMin}}px {{paddingMax}}px">',
      '<h1 style="font-size:{{headingScale}}px;font-weight:700;margin:0;line-height:1.05;background:linear-gradient(90deg,{{accent}},#F472B6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Pulse of the product.</h1>',
      '<p style="font-size:{{bodySize}}px;opacity:0.8;margin:0;max-width:82%;line-height:1.5">A vivid, glassy panel set against a gradient backdrop — the metrics you\'d check between meetings.</p>',
      '<div data-role="kpi" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">',
      '<div style="background:rgba(255,255,255,0.08);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.18);border-radius:12px;padding:10px 12px"><div style="font-size:10px;opacity:0.7;letter-spacing:0.06em;text-transform:uppercase">Revenue</div><div style="font-size:20px;font-weight:700;color:{{accent}};margin-top:2px">$48.2k</div></div>',
      '<div style="background:rgba(255,255,255,0.08);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.18);border-radius:12px;padding:10px 12px"><div style="font-size:10px;opacity:0.7;letter-spacing:0.06em;text-transform:uppercase">Active</div><div style="font-size:20px;font-weight:700;margin-top:2px">1,204</div></div>',
      '<div style="background:rgba(255,255,255,0.08);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.18);border-radius:12px;padding:10px 12px"><div style="font-size:10px;opacity:0.7;letter-spacing:0.06em;text-transform:uppercase">Churn</div><div style="font-size:20px;font-weight:700;margin-top:2px">2.3%</div></div>',
      "</div>",
      '<div style="flex:1;min-height:40px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.14);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:10px;opacity:0.6">[ live chart ]</div>',
      "</div>",
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
