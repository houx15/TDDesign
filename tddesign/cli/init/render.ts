import { CHOICES, MOODS } from "./choices.js";
import { OVERALL_STYLE_MOCKUPS, MOOD_DEFAULTS } from "./mockups.js";

export function buildIndexHtml(): string {
  const dimensionsJson = JSON.stringify(
    CHOICES.map((d) => ({ dimension: d.dimension, question: d.question }))
  );
  const moodsJson = JSON.stringify(MOODS);
  const mockupsJson = JSON.stringify(OVERALL_STYLE_MOCKUPS);
  const moodDefaultsJson = JSON.stringify(MOOD_DEFAULTS);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>taste init</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 15px/1.5 system-ui, sans-serif; margin: 0; background: #0F0F10; color: #FAFAFA; }
  main { max-width: 960px; margin: 0 auto; padding: 48px 24px; }
  h1 { font-size: 28px; margin: 0 0 8px; }
  p.lead { opacity: 0.7; margin: 0 0 32px; }
  .progress { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-bottom: 32px; }
  .progress-fill { height: 100%; background: #5B6EE1; border-radius: 2px; transition: width 200ms; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(440px, 1fr)); gap: 16px; }
  .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; cursor: pointer; transition: border-color 150ms; }
  .card:hover { border-color: #5B6EE1; }
  .card.selected { border-color: #5B6EE1; background: rgba(91,110,225,0.12); }
  .card-preview { height: 320px; border-radius: 6px; margin-bottom: 12px; overflow: hidden; }
  .card-label { font-weight: 600; }
  .card-tags { opacity: 0.6; font-size: 12px; margin-top: 4px; }
  .group-heading { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.5; margin: 24px 0 8px; }
  button.primary { background: #5B6EE1; color: white; border: 0; padding: 12px 20px; border-radius: 6px; font: inherit; cursor: pointer; }
  button.ghost { background: transparent; color: inherit; border: 1px solid rgba(255,255,255,0.2); padding: 12px 20px; border-radius: 6px; font: inherit; cursor: pointer; margin-right: 8px; }
  .notice { background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.3); padding: 12px; border-radius: 6px; margin: 16px 0; font-size: 14px; }
  .review-row { display: grid; grid-template-columns: 160px 1fr auto; gap: 16px; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
  a.edit { color: #5B6EE1; text-decoration: none; font-size: 13px; }
  .swatch-row { display: flex; gap: 8px; }
  .swatch { width: 40px; height: 40px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); }
</style>
</head>
<body>
<main id="app">loading…</main>
<script>
(function () {
  var DIMENSIONS = ${dimensionsJson};
  var MOODS = ${moodsJson};
  var OVERALL_STYLE_MOCKUPS = ${mockupsJson};
  var MOOD_DEFAULTS = ${moodDefaultsJson};
  var DIM_ORDER = ["color_direction","typography","component_style","layout_spacing","detail_elements","motion"];
  var state = { choices: null, step: 0, mood: null, picks: {}, currentStyle: null };

  function interpolate(tpl, slots) {
    return tpl.replace(/\\{\\{(\\w+)\\}\\}/g, function (_, k) {
      return slots[k] !== undefined ? String(slots[k]) : '';
    });
  }
  function renderIconRow(iconStyle) {
    if (iconStyle === 'line') return '\u2192';
    if (iconStyle === 'filled') return '\u25B6';
    if (iconStyle === 'emoji') return '\uD83D\uDE80';
    return '\u25C6';
  }
  function deriveSlots(b) {
    var s = {};
    for (var k in b) s[k] = b[k];
    s.buttonTransition = 'transform ' + b.motionDurationMs + 'ms ' + b.motionEasing;
    s.iconRow = renderIconRow(b.iconStyle);
    return s;
  }
  function findOption(dimName, id) {
    for (var i = 0; i < state.choices.length; i++) {
      var d = state.choices[i];
      if (d.dimension !== dimName) continue;
      for (var j = 0; j < d.options.length; j++) {
        if (d.options[j].id === id) return d.options[j];
      }
    }
    return null;
  }
  function recomputeStyle() {
    if (!state.mood) { state.currentStyle = null; return; }
    var bundle = {};
    var defaults = MOOD_DEFAULTS[state.mood];
    for (var k in defaults) bundle[k] = defaults[k];
    for (var i = 0; i < DIM_ORDER.length; i++) {
      var dim = DIM_ORDER[i];
      var pickId = state.picks[dim];
      if (!pickId) continue;
      var option = findOption(dim, pickId);
      if (option && option.tokens) {
        for (var k2 in option.tokens) bundle[k2] = option.tokens[k2];
      }
    }
    state.currentStyle = bundle;
  }
  var app = document.getElementById('app');

  fetch('/choices.json').then(function (r) { return r.json(); }).then(function (data) {
    state.choices = data.dimensions;
    render();
  });

  function render() {
    if (!state.choices) { app.textContent = 'loading…'; return; }
    var totalSteps = 1 + state.choices.length + 1;
    if (state.step === 0) return renderWelcome(totalSteps);
    if (state.step <= state.choices.length) return renderDimension(state.step - 1, totalSteps);
    return renderReview(totalSteps);
  }

  function progressBar(step, total) {
    var pct = Math.round((step / (total - 1)) * 100);
    return '<div class="progress"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
  }

  function renderWelcome(total) {
    app.innerHTML =
      progressBar(0, total) +
      '<h1>taste init</h1>' +
      '<p class="lead">Pick one option per dimension. We write preference_vector.json when you are done.</p>' +
      '<button class="primary" id="start">Start</button>';
    document.getElementById('start').onclick = function () { state.step = 1; render(); };
  }

  function renderDimension(idx, total) {
    var dim = state.choices[idx];
    var selected = state.picks[dim.dimension];
    var recommended = [];
    var others = [];
    for (var i = 0; i < dim.options.length; i++) {
      var opt = dim.options[i];
      (state.mood && opt.moodTags.indexOf(state.mood) >= 0 ? recommended : others).push(opt);
    }
    var html =
      progressBar(idx + 1, total) +
      '<h1>' + dim.question + '</h1>' +
      '<p class="lead">Step ' + (idx + 1) + ' of ' + state.choices.length + '</p>';
    if (state.mood && recommended.length) {
      html += '<div class="group-heading">Recommended for ' + state.mood + '</div>';
      html += '<div class="grid">' + recommended.map(cardHtml).join('') + '</div>';
      html += '<div class="group-heading">Other options</div>';
      html += '<div class="grid">' + others.map(cardHtml).join('') + '</div>';
    } else {
      html += '<div class="grid">' + dim.options.map(cardHtml).join('') + '</div>';
    }
    html += '<div style="margin-top:32px"><button class="ghost" id="back">Back</button><button class="primary" id="next">Next</button></div>';
    app.innerHTML = html;
    bindCards(dim);
    document.getElementById('back').onclick = function () { if (state.step > 0) { state.step--; render(); } };
    document.getElementById('next').onclick = function () {
      if (!state.picks[dim.dimension]) return;
      if (dim.dimension === 'overall_style') {
        state.mood = state.picks[dim.dimension];
      }
      recomputeStyle();
      state.step++;
      render();
    };
    function cardHtml(opt) {
      var sel = state.picks[dim.dimension] === opt.id ? ' selected' : '';
      return '<div class="card' + sel + '" data-id="' + opt.id + '">' +
        '<div class="card-preview">' + previewHtml(dim.dimension, opt) + '</div>' +
        '<div class="card-label">' + opt.label + '</div>' +
        '<div class="card-tags">' + opt.moodTags.join(', ') + '</div>' +
        '</div>';
    }
    function bindCards(d) {
      var cards = app.querySelectorAll('.card');
      cards.forEach(function (c) {
        c.onclick = function () {
          state.picks[d.dimension] = c.getAttribute('data-id');
          if (d.dimension === 'overall_style') state.mood = c.getAttribute('data-id');
          recomputeStyle();
          render();
        };
      });
    }
  }

  function previewHtml(dimension, opt) {
    if (dimension === 'overall_style') {
      var bundle = MOOD_DEFAULTS[opt.id];
      return interpolate(OVERALL_STYLE_MOCKUPS[opt.id], deriveSlots(bundle));
    }
    if (!state.mood) {
      return '<div style="padding:20px;font-size:13px;opacity:0.7">' + opt.label + '</div>';
    }
    var base = {};
    var defaults = MOOD_DEFAULTS[state.mood];
    for (var k in defaults) base[k] = defaults[k];
    if (state.currentStyle) for (var k2 in state.currentStyle) base[k2] = state.currentStyle[k2];
    if (opt.tokens) for (var k3 in opt.tokens) base[k3] = opt.tokens[k3];
    var tpl = OVERALL_STYLE_MOCKUPS[state.mood];
    return interpolate(tpl, deriveSlots(base));
  }

  function renderReview(total) {
    var rows = state.choices.map(function (d) {
      var pickId = state.picks[d.dimension];
      var opt = d.options.find(function (o) { return o.id === pickId; });
      var drift = state.mood && opt.moodTags.indexOf(state.mood) < 0;
      return '<div class="review-row">' +
        '<div>' + d.dimension + '</div>' +
        '<div>' + opt.label + (drift ? ' <span style="opacity:0.6">(off-mood)</span>' : '') + '</div>' +
        '<a class="edit" href="#" data-step="' + (state.choices.indexOf(d) + 1) + '">Edit</a>' +
        '</div>';
    }).join('');
    app.innerHTML =
      progressBar(total - 1, total) +
      '<h1>Review</h1>' +
      '<p class="lead">Confirm your 7 picks, then write the file.</p>' +
      finalMockup() +
      rows +
      '<div style="margin-top:24px"><button class="ghost" id="back">Back</button><button class="primary" id="submit">Write preference_vector.json</button></div>' +
      '<div id="msg"></div>';
    var edits = app.querySelectorAll('a.edit');
    edits.forEach(function (a) {
      a.onclick = function (e) { e.preventDefault(); state.step = parseInt(a.getAttribute('data-step'), 10); render(); };
    });
    document.getElementById('back').onclick = function () { state.step--; render(); };
    document.getElementById('submit').onclick = submit;
  }

  function finalMockup() {
    if (!state.mood || !state.currentStyle) return '';
    var html = interpolate(OVERALL_STYLE_MOCKUPS[state.mood], deriveSlots(state.currentStyle));
    return '<div style="margin-bottom:24px;max-width:480px;height:320px;border-radius:8px;overflow:hidden">' + html + '</div>';
  }

  function submit() {
    fetch('/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mood: state.mood, picks: state.picks })
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) { document.getElementById('msg').innerHTML = '<div class="notice">' + (res.j.error || 'error') + '</div>'; return; }
        app.innerHTML = '<h1>Done.</h1><p class="lead">Wrote ' + res.j.path + '. You can close this tab.</p>';
        fetch('/shutdown', { method: 'POST' });
      });
  }
})();
</script>
</body>
</html>`;
}
