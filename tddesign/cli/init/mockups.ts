// Hand-crafted mini-mockups for overall_style cards.
// Each fragment is a self-contained HTML string (inline styles only)
// sized to fit a 480x320 card preview. Keep literals stable — tests
// assert canonical headline copy.

export const OVERALL_STYLE_MOCKUPS: Record<string, string> = {
  "minimal-precise": [
    '<div style="width:100%;height:100%;background:#0F0F10;color:#FAFAFA;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 32px;box-sizing:border-box;font-family:Inter,system-ui,sans-serif">',
    '<h1 style="font-size:28px;font-weight:400;letter-spacing:-0.01em;margin:0;text-align:center">Write less. Ship more.</h1>',
    '<div style="width:40px;height:1px;background:rgba(255,255,255,0.15);margin:24px 0"></div>',
    '<p style="font-size:14px;opacity:0.6;margin:0;text-align:center">A distraction-free editor for deep work.</p>',
    '<button style="margin-top:32px;background:#5B6EE1;color:#fff;border:0;border-radius:6px;padding:10px 20px;font-size:13px;font-family:inherit;cursor:pointer">Get started</button>',
    "</div>",
  ].join(""),

  "editorial-serif": [
    '<div style="width:100%;height:100%;background:#FDFCF8;color:#1A1A1A;padding:48px 32px 32px 25%;box-sizing:border-box;font-family:Georgia,serif">',
    '<div style="font-family:Inter,system-ui,sans-serif;font-size:11px;letter-spacing:0.18em;color:#0057FF;margin-bottom:24px;text-transform:uppercase">ISSUE 14 &middot; APRIL</div>',
    '<h1 style="font-family:Georgia,serif;font-size:32px;font-style:italic;font-weight:400;line-height:1.15;margin:0 0 20px">The quiet renaissance of slow software.</h1>',
    '<p style="font-family:Georgia,serif;font-size:14px;font-style:italic;opacity:0.6;line-height:1.5;margin:0">Craft, rhythm, and the things we lose when everything is optimized for speed.</p>',
    "</div>",
  ].join(""),

  "playful-rounded": [
    '<div style="width:100%;height:100%;background:linear-gradient(135deg,#FDE8F4,#EDE4FF);color:#1A1033;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;box-sizing:border-box;position:relative;font-family:Inter,system-ui,sans-serif">',
    '<h1 style="font-size:26px;font-weight:700;margin:0 0 12px;transform:rotate(-1.5deg);text-align:center">Make something people will hug.</h1>',
    '<p style="font-size:13px;opacity:0.7;margin:0 0 24px;text-align:center">The fastest way to ship a product users actually love.</p>',
    '<div style="display:flex;gap:8px">',
    '<button style="background:#A855F7;color:#fff;border:0;border-radius:16px;padding:10px 18px;font-size:13px;font-family:inherit;cursor:pointer">Try it free &#8599;</button>',
    '<button style="background:transparent;color:#A855F7;border:1px solid #A855F7;border-radius:16px;padding:10px 18px;font-size:13px;font-family:inherit;cursor:pointer">See examples</button>',
    "</div>",
    '<div style="position:absolute;top:16px;right:16px;width:56px;height:56px;background:#F472B6;color:#fff;font-size:12px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center;transform:rotate(8deg)">new!</div>',
    "</div>",
  ].join(""),

  "brutalist-raw": [
    '<div style="width:100%;height:100%;background:#D4D4D4;color:#0A0A0A;position:relative;box-sizing:border-box;border-right:1px solid #0A0A0A;border-bottom:1px solid #0A0A0A;overflow:hidden">',
    '<h1 style="font-family:\'Arial Black\',Arial,sans-serif;font-size:44px;text-transform:uppercase;line-height:0.95;letter-spacing:-0.02em;margin:24px;margin-left:-8px">BUILT. NOT RENDERED.</h1>',
    '<button style="position:absolute;left:24px;bottom:24px;background:#0A0A0A;color:#fff;border:4px solid #0A0A0A;border-radius:0;padding:11px 22px;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;cursor:pointer">ENTER &rarr;</button>',
    '<div style="position:absolute;top:0;right:0;width:1px;height:100%;background:#0A0A0A"></div>',
    '<div style="position:absolute;left:0;bottom:0;width:100%;height:1px;background:#0A0A0A"></div>',
    "</div>",
  ].join(""),

  "warm-technical": [
    '<div style="width:100%;height:100%;background:#F7F3EC;color:#1A1A1A;display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:32px;box-sizing:border-box;font-family:Inter,system-ui,sans-serif">',
    '<div style="display:flex;flex-direction:column;justify-content:center">',
    '<h1 style="font-size:22px;font-weight:600;line-height:1.2;margin:0 0 12px">Developer tools, built with warmth.</h1>',
    '<p style="font-size:13px;opacity:0.7;line-height:1.5;margin:0 0 20px">APIs that feel hand-held. SDKs that read like prose.</p>',
    '<button style="background:#C2410C;color:#fff;border:0;border-radius:6px;padding:10px 18px;font-size:13px;font-family:inherit;cursor:pointer;width:max-content">Read the docs</button>',
    "</div>",
    '<div style="background:#1A1A1A;color:#F7F3EC;border-radius:6px;padding:14px;font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:11px;line-height:1.6;white-space:pre;align-self:center">',
    '<span style="color:rgba(247,243,236,0.4)">// one tidy export</span>\n',
    '<span style="color:#C2410C">export async function</span> warm(\n',
    "  request: Request,\n",
    ") {\n",
    '  <span style="color:#C2410C">return</span> <span style="color:#84CC16">"hello"</span>;\n',
    "}",
    "</div>",
    "</div>",
  ].join(""),

  "vivid-modern": [
    '<div style="width:100%;height:100%;background:linear-gradient(140deg,#1B1033,#6D28D9,#F472B6);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;box-sizing:border-box;position:relative;font-family:Inter,system-ui,sans-serif">',
    '<h1 style="font-size:36px;font-weight:700;line-height:1.0;margin:0 0 14px;background:linear-gradient(90deg,#A855F7,#F472B6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-align:center">The future, early.</h1>',
    '<p style="font-size:13px;opacity:0.8;margin:0 0 28px;text-align:center">Compute, rendered at the speed of thought.</p>',
    '<button style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.3);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:12px;padding:11px 22px;font-size:13px;color:#fff;font-weight:500;font-family:inherit;cursor:pointer">Join the waitlist</button>',
    '<div style="position:absolute;left:10%;right:10%;bottom:16px;height:2px;background:linear-gradient(90deg,transparent,#A855F7,transparent)"></div>',
    "</div>",
  ].join(""),
};
