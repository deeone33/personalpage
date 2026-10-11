var VERSION = 77;

// ---- Twitch login return (runs first, before Supabase reads the URL) ----
// The state must match the random one we saved when the login started, so another site can't plant its own token here.
(function () {
  var h = location.hash || "", m = h.match(/access_token=([^&]+)/), s = h.match(/state=([^&]+)/);
  if (!m || !s || decodeURIComponent(s[1]).indexOf("twitch") !== 0) return;
  var want = null;
  try { want = sessionStorage.getItem("sp_tw_state"); sessionStorage.removeItem("sp_tw_state"); } catch (e) {}
  if (want && decodeURIComponent(s[1]) === want) { try { localStorage.setItem("sp_twitch", m[1]); } catch (e) {} }
  history.replaceState(null, "", location.pathname + location.search);
})();

// ---- Sample data (real accounts are connected in later versions) ----
var DATA = {
  weather: { temp: 9, note: "Light rain until 14:00" },
  inbox: [{ id: "gmail1", name: "Gmail 1", n: 12 }, { id: "gmail2", name: "Gmail 2", n: 4 }],
  news: [
    { t: "Estonia defence budget proposal", n: 4 },
    { t: "Riksbank holds rate steady", n: 3 },
    { t: "WoW TBC patch date confirmed", n: 5 },
    { t: "New Baltic ferry route announced", n: 2 }
  ],
  twitch: [
    { id: "nocturne_tv", sub: "World of Warcraft", v: 21400, live: 1 },
    { id: "kaizen", sub: "Path of Exile", v: 8400, live: 1 },
    { id: "sweden_speedrun", sub: "Speedruns", v: 5200, live: 1 },
    { id: "pixelchef", sub: "Just Chatting", v: 3100, live: 1 },
    { id: "tavern_bard", sub: "Music", v: 1900, live: 1 },
    { id: "gridline", sub: "Grand Theft Auto V", v: 1200, live: 1 },
    { id: "northwind", sub: "Hearthstone", v: 640, live: 1 },
    { id: "raidleader_x", sub: "Offline", v: 0, live: 0 }
  ],
  youtube: [
    { ch: "WoW Academy", t: "Raid guide: Black Temple", age: "2h" },
    { ch: "Synthwave Radio", t: "Night drive mix vol. 9", age: "5h" },
    { ch: "Nordic Markets", t: "Weekly market recap", age: "8h" },
    { ch: "Speedrun Weekly", t: "New world record run", age: "1d" }
  ],
  stocks: [
    { id: "NVDA", name: "NVIDIA", p: 142.3, c: 4.2 },
    { id: "AAPL", name: "Apple", p: 231.1, c: -0.4 },
    { id: "TSLA", name: "Tesla", p: 248.9, c: -3.1 },
    { id: "MSFT", name: "Microsoft", p: 428.5, c: 0.9 },
    { id: "EQNR", name: "Equinor", p: 26.7, c: 1.7 },
    { id: "AMZN", name: "Amazon", p: 262.4, c: 3.3 },
    { id: "BTCUSD", name: "Bitcoin", p: 98450, c: 2.1 },
    { id: "ETHUSD", name: "Ethereum", p: 3420, c: -1.4 },
    { id: "NFLX", name: "Netflix", p: 70.3, c: -1.8 },
    { id: "XAUUSD", name: "Gold", p: 4220.3, c: 1.5 }
  ]
};

// ---- Preview for visitors who are not signed in: made-up content shown through the real boxes ----
// (The sources and headlines are invented, so nothing false is attributed to a real publisher.)
var PREVIEW = false;
function loadSamples() {
  if (USER) return;
  PREVIEW = true;
  var ago = function (m) { return Date.now() - m * 60000; }, note = "This is a made-up headline for the preview. With a free account this box shows real news from the sites you choose.";
  var n = function (s, t, m, nw) { return { s: s, t: t, u: "#news-" + m, ts: ago(m), d: note, img: "", nw: nw }; };
  NEWS = [
    n("World Wire", "Riksbank holds interest rate steady and signals cuts next year", 9, 1), n("Daily Ledger", "Sweden's Riksbank holds interest rate steady", 14), n("Metro Post", "Analysts: Riksbank keeps interest rate steady as inflation cools", 21),
    n("Metro Post", "New Baltic ferry route links Tallinn and Stockholm in six hours", 27, 1), n("World Wire", "Storm warning issued for the west coast ahead of the weekend", 48),
    n("Daily Ledger", "Study finds four-day week lifts productivity at pilot companies", 95), n("World Wire", "Championship final goes to extra time after late equaliser", 130),
    n("Metro Post", "City council approves new tram line through the old town", 190), n("Daily Ledger", "Game studio confirms expansion release date after long delay", 260), n("Daily Ledger", "Tech firm unveils foldable tablet with week-long battery", 250),
    n("World Wire", "Record number of visitors at this year's book fair", 420), n("Metro Post", "Local bakery wins national award for rye bread", 700)
  ];
  var g = function (t, m, nw) { return { s: "SampleChannel", t: t, tx: t, u: "#tg-" + m, ts: ago(m), img: "", th: "", vid: "", nw: nw }; };
  TGP = [
    g("Central bank decision: interest rate unchanged. The governor says cuts are possible next year if inflation keeps falling.", 6, 1),
    g("Ferry operator confirms the new Baltic route starts in spring, with two departures a day in each direction.", 24, 1),
    g("Weather service upgrades the west coast warning to orange. Gusts up to 28 m/s expected from Friday evening.", 51),
    g("Pilot programme results are in: most companies that tried a four-day week plan to keep it.", 90),
    g("Extra time in the final after a 94th-minute equaliser. Still level at the break.", 128),
    g("Council vote passes 31 to 20: the tram line through the old town goes ahead.", 185),
    g("The studio confirms it: the expansion ships next month. Pre-load opens a week before release.", 255),
    g("First hands-on with the foldable tablet. The hinge feels solid, and the battery claim is being tested.", 300),
    g("Book fair closes with a record: more than 140,000 visitors over four days.", 415),
    g("Morning briefing: markets open flat, rain in the north, and three things to watch today.", 560)
  ];
  var r = function (s, t, m, d) { return { s: s, t: t, u: "#rd-" + m, x: "", ts: ago(m), by: "/u/sample_user", d: d || "A made-up post for the preview.", img: "" }; };
  RD = [
    r("worldnews", "Riksbank holds rate steady, hints at cuts in the new year", 15), r("technology", "Foldable tablet claims a week of battery life. Too good to be true?", 70),
    r("classicwow", "After years of waiting we finally have a release date", 140), r("worldnews", "New ferry route will connect two Baltic capitals", 200),
    r("technology", "I tracked my screen time for a year, here is what changed", 330), r("classicwow", "Guild first clear last night, screenshots inside", 480)
  ];
  var v = function (c, t, m) { return { id: "sample" + m, t: t, n: c, ts: ago(m) }; };
  YTV = [
    v("WoW Academy", "Raid guide: every boss in under 20 minutes", 55), v("Nordic Markets", "Rate decision explained: what it means for your mortgage", 120),
    v("Synthwave Radio", "Night drive mix vol. 9", 300), v("Speedrun Weekly", "New world record by 0.4 seconds", 420), v("Kitchen Lab", "Rye bread at home, the slow way", 540),
    v("Build Things", "I made a desk that hides every cable", 800), v("Trail Notes", "Three days alone on the coastal path", 1300), v("WoW Academy", "Ten addons you should be using", 1700)
  ];
  NEWSV++;
  render();
}
// The small note at the bottom of a details window in the preview
function previewNote() { return '<p class="pvnote">This is sample content. <button class="lnk2" data-a="pvup">Create a free account</button> to fill this box with your own.</p>'; }

// ---- Storage (safe if the browser blocks it) ----
function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
var DEFAULT_ACCENT = "#f5b942";
var P = load("sp_prefs", { theme: "dark", accent: DEFAULT_ACCENT, fs: 0.95, fav: {}, hidden: {} });
var EDIT = false;
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
// Leftover HTML codes in feed text ("&#33;", "&amp;", "&hellip;") -> the real character
var ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“" };
function unent(s) {
  if (!s || String(s).indexOf("&") < 0) return s;
  var once = function (x) {
    return x.replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z]{2,8});/gi, function (m, c) {
      if (c.charAt(0) !== "#") return ENT[c.toLowerCase()] || m;
      var n = c.charAt(1).toLowerCase() === "x" ? parseInt(c.slice(2), 16) : parseInt(c.slice(1), 10);
      return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
    });
  };
  return once(once(String(s)));
}
function unentAll(list, keys) { (list || []).forEach(function (x) { keys.forEach(function (k) { if (x[k]) x[k] = unent(x[k]); }); }); return list || []; }
// Links and images that come from feeds must be plain web addresses (never javascript: or data:)
function safeUrl(u) { u = String(u || "").trim(); return /^https?:\/\//i.test(u) ? u : ""; }
function linkBtn(u, label) { u = safeUrl(u); return u ? '<a class="btn" target="_blank" rel="noopener noreferrer" href="' + esc(u) + '">' + label + "</a>" : ""; }
// Broken logos remove themselves (instead of an inline onerror, which the security policy blocks)
// A logo that failed to load is remembered for a week, so it is not put back (and flashed white) on every redraw.
var BADIMG = load("sp_badimg", {});
Object.keys(BADIMG).forEach(function (u) { if (Date.now() - BADIMG[u] > 604800000) delete BADIMG[u]; });
document.addEventListener("error", function (e) {
  var t = e.target;
  if (!t || t.tagName !== "IMG" || t.getAttribute("data-rm") !== "1") return;
  if (t.closest(".ic") || t.classList.contains("tl")) { BADIMG[t.getAttribute("src")] = Date.now(); save("sp_badimg", BADIMG); }
  t.remove();
}, true);

// ---- Theme, accent, wallpaper ----
var DEFC = { dark: { bg: "#10131a", card: "#181c26", fg: "#e9ecf2", mut: "#8c93a3", a: 84 }, light: { bg: "#eceff4", card: "#ffffff", fg: "#161a22", mut: "#5d6575", a: 86 } };
function cols() {
  var d = DEFC[P.theme] || DEFC.dark, o = (P.colors && P.colors[P.theme]) || {};
  return { bg: o.bg || d.bg, card: o.card || d.card, fg: o.fg || d.fg, mut: o.mut || d.mut, a: o.a != null ? o.a : d.a };
}
function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")"; }
function setCol(k, v) {
  P.colors = P.colors || {}; P.colors[P.theme] = P.colors[P.theme] || {};
  P.colors[P.theme][k] = v; persist(); applyTheme();
}
// ---- Signal colors per box (Settings > Appearance): the green and red in Stocks, the live dot in Twitch, the live
// red and the sport icons in Sports, each with a strength (how see-through the color is). Nothing saved = today's look.
var BC = [
  ["stocks", "Stocks", [["up", "Up", "#2fd17f"], ["down", "Down", "#ff5c6c"]]],
  ["twitch", "Twitch", [["live", "Live dot", "#ff4655"]]],
  ["sports", "Sports", [["live", "Live", "#ff4655"], ["icon", "Sport icons", "#3fbf7f"]]]
];
function bcGet(box, k) { var v = P.bc && P.bc[box] && P.bc[box][k]; return k === "op" ? (v >= 15 && v <= 100 ? +v : 100) : /^#[0-9a-f]{6}$/i.test(v || "") ? v : ""; }
function applyBoxCols() {
  var css = BC.map(function (b) {
    var box = b[0], op = bcGet(box, "op"), sel = '#grid [data-id="' + box + '"]', out = "";
    var mix = function (hex) { return op < 100 ? "color-mix(in srgb," + hex + " " + op + "%,transparent)" : hex; };
    var vars = b[2].filter(function (c) { return c[0] !== "icon" && (bcGet(box, c[0]) || op < 100); }).map(function (c) { return "--" + c[0] + ":" + mix(bcGet(box, c[0]) || c[2]); });
    if (vars.length) out += sel + "{" + vars.join(";") + "}";
    // the sport icons each have their own color until you pick one for all of them
    if (box === "sports" && (bcGet(box, "icon") || op < 100)) out += sel + " .spi{" + (bcGet(box, "icon") ? "color:" + bcGet(box, "icon") + ";" : "") + (op < 100 ? "opacity:" + op / 100 : "") + "}";
    return out;
  }).join("\n");
  var st = $("boxCols");
  if (!st) { st = document.createElement("style"); st.id = "boxCols"; document.head.appendChild(st); }
  st.textContent = css;
  if ($("bcList") && !$("bcList").contains(document.activeElement)) $("bcList").innerHTML = BC.map(function (b) {
    return '<div class="bcrow"><b>' + b[1] + "</b>" + b[2].map(function (c) {
      return "<label>" + c[1] + ' <input type="color" data-bc="' + b[0] + ":" + c[0] + '" value="' + (bcGet(b[0], c[0]) || c[2]) + '"></label>';
    }).join("") + '<label title="How strong the colors are: lower is more see-through">Strength <input type="range" min="15" max="100" step="5" data-bc="' + b[0] + ':op" value="' + bcGet(b[0], "op") + '"></label></div>';
  }).join("");
}
document.addEventListener("input", function (e) {
  var k = e.target.dataset && e.target.dataset.bc;
  if (!k) return;
  var p = k.split(":");
  P.bc = P.bc || {}; P.bc[p[0]] = P.bc[p[0]] || {};
  P.bc[p[0]][p[1]] = p[1] === "op" ? +e.target.value : e.target.value;
  persist(); applyBoxCols();
});
function applyTheme() {
  var r = document.documentElement;
  if (P.theme !== "light") P.theme = "dark";
  if (!/^#[0-9a-f]{6}$/i.test(P.accent || "")) P.accent = DEFAULT_ACCENT;
  r.dataset.theme = P.theme;
  r.style.setProperty("--ac", P.accent);
  var h = P.accent.replace("#", ""), n = parseInt(h, 16);
  var lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  r.style.setProperty("--acfg", lum > 0.6 ? "#111" : "#fff");
  $("themeBtn").textContent = P.theme === "dark" ? "Switch to light" : "Switch to dark";
  $("accent").value = P.accent;
  if (P.dockW) r.style.setProperty("--dock-w", P.dockW + "px");
  r.style.setProperty("--gfs", P.fs || 1); $("fsAll").value = Math.round((P.fs || 1) * 100);
  var c = cols();
  r.style.setProperty("--bg", c.bg); r.style.setProperty("--fg", c.fg); r.style.setProperty("--mut", c.mut);
  r.style.setProperty("--card", rgba(c.card, c.a / 100)); r.style.setProperty("--solid", c.card);
  r.style.setProperty("--line", rgba(c.fg, 0.14));
  r.style.setProperty("--acsoft", rgba(P.accent, 0.16)); r.style.setProperty("--acglow", rgba(P.accent, 0.35));
  document.body.classList.toggle("noaurora", P.aurora === false);
  $("auroraOn").checked = P.aurora !== false;
  document.body.classList.toggle("noshadow", P.shadow === false);
  $("shadowOn").checked = P.shadow !== false;
  $("srcNamesOn").checked = !P.hideSrc;
  $("cBg").value = c.bg; $("cCard").value = c.card; $("cFg").value = c.fg; $("cMut").value = c.mut; $("cAlpha").value = c.a;
  $("volSlider").value = P.vol == null ? 70 : P.vol;
  applyBoxCols();
}
function applyWall() {
  var w = null;
  try { w = localStorage.getItem("sp_wall"); } catch (e) {}
  w = w && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+\/=]+$/.test(w) ? w : null;
  $("wall").style.backgroundImage = w ? 'url("' + w + '")' : "none";
  document.body.classList.toggle("haswall", !!w);
  var pos = wallPos(), fit = P.wallFit === "contain" ? "contain" : P.wallFit === "auto" ? "auto" : "cover";
  $("wall").style.backgroundSize = fit;
  $("wall").style.backgroundPosition = pos.x + "% " + pos.y + "%";
  var sel = $("wallFit"); if (sel) sel.value = fit;
}
function wallPos() { return (P.wallPos && typeof P.wallPos.x === "number") ? P.wallPos : { x: 50, y: 50 }; }
var REPOS = false, reposStart = null;
function toggleRepos() {
  REPOS = !REPOS;
  $("wallDragOverlay").hidden = !REPOS;
  $("wallReposBtn").textContent = REPOS ? "Done" : "Reposition";
}
(function () {
  var ov = $("wallDragOverlay");
  ov.addEventListener("pointerdown", function (e) {
    if (e.target.closest && e.target.closest("#wallDoneBtn")) return;
    reposStart = { x: e.clientX, y: e.clientY, pos: wallPos() };
    try { ov.setPointerCapture(e.pointerId); } catch (ex) {}
  });
  ov.addEventListener("pointermove", function (e) {
    if (!reposStart) return;
    var dx = ((e.clientX - reposStart.x) / window.innerWidth) * 100, dy = ((e.clientY - reposStart.y) / window.innerHeight) * 100;
    P.wallPos = { x: Math.max(0, Math.min(100, reposStart.pos.x + dx)), y: Math.max(0, Math.min(100, reposStart.pos.y + dy)) };
    $("wall").style.backgroundPosition = P.wallPos.x + "% " + P.wallPos.y + "%";
  });
  function endDrag() { if (!reposStart) return; reposStart = null; persist(); syncWall(false); }
  ov.addEventListener("pointerup", endDrag); ov.addEventListener("pointercancel", endDrag);
})();
$("wallReposBtn").onclick = toggleRepos;
$("wallDoneBtn").onclick = function (e) { e.stopPropagation(); if (REPOS) toggleRepos(); };
$("pwSave").onclick = function () {
  if (!sb || !USER) return;
  var v = $("pwNew").value;
  if (v.length < 8) { $("pwMsg").textContent = "Use at least 8 characters."; return; }
  if ($("pwNew2").value !== v) { $("pwMsg").textContent = "The two passwords are not the same. Type the new password again in both boxes."; return; }
  $("pwMsg").textContent = "Working...";
  sb.auth.updateUser({ password: v }).then(function (r) {
    $("pwMsg").textContent = r.error ? r.error.message : "Password updated.";
    if (!r.error) { $("pwNew").value = ""; $("pwNew2").value = ""; }
  });
};
$("wallFit").onchange = function (e) { P.wallFit = e.target.value; persist(); applyWall(); };
$("wallReset").onclick = function () { P.wallPos = { x: 50, y: 50 }; persist(); applyWall(); };
$("volSlider").oninput = function (e) { P.vol = +e.target.value; persist(); };
function setWall(file) {
  var fr = new FileReader();
  fr.onload = function () {
    var im = new Image();
    im.onload = function () {
      var s = Math.min(1, 1600 / im.width), c = document.createElement("canvas");
      c.width = im.width * s; c.height = im.height * s;
      var ctx = c.getContext("2d");
      ctx.drawImage(im, 0, 0, c.width, c.height);
      var hasAlpha = /\.(png|gif|webp)$/i.test(file.name || "") || file.type === "image/png" || file.type === "image/webp" || file.type === "image/gif";
      if (hasAlpha) {
        // Only keep it transparent (as PNG) if it actually has any see-through pixels; a JPEG-style photo saved as
        // .png would otherwise always end up larger than it needs to be for no visual benefit.
        try {
          var d = ctx.getImageData(0, 0, c.width, c.height).data;
          hasAlpha = false;
          for (var i = 3; i < d.length; i += 4 * 37) { if (d[i] < 255) { hasAlpha = true; break; } }
        } catch (e) { /* keep the extension-based guess if this fails */ }
      }
      var data = hasAlpha ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.75);
      try { localStorage.setItem("sp_wall", data); } catch (e) {
        if (hasAlpha) { try { localStorage.setItem("sp_wall", c.toDataURL("image/jpeg", 0.75)); alert("That image was too large to keep its transparency, so it was saved as a solid background instead."); } catch (e2) { alert("That image is too large to save. Try a smaller one."); return; } }
        else { alert("That image is too large to save. Try a smaller one."); return; }
      }
      P.wallPos = { x: 50, y: 50 };
      applyWall(); syncWall(false);
    };
    im.src = fr.result;
  };
  fr.readAsDataURL(file);
}

// ---- Date and day (Tallinn time) ----
function tick() {
  var d = new Date(), tz = { timeZone: TZ };
  $("day").textContent = d.toLocaleDateString("en-GB", Object.assign({ weekday: "long" }, tz));
  $("date").textContent = d.toLocaleDateString("en-GB", Object.assign({ day: "numeric", month: "long", year: "numeric" }, tz)) +
    " · " + d.toLocaleTimeString("en-GB", Object.assign({ hour: "2-digit", minute: "2-digit" }, tz)) + " · " + LOCNAME;
}

// ---- Rows with favorite / hide controls in edit mode ----
function row(key, main, sub, right, op, cls, attr) {
  var f = P.fav[key];
  var ed = EDIT ? '<button data-a="fav" data-k="' + esc(key) + '" aria-label="Favorite">' + (f ? "★" : "☆") + '</button><button data-a="hide" data-k="' + esc(key) + '" aria-label="Hide">✕</button>' : "";
  // The favorite star normally leads the row. With " favr" in cls it sits on the right instead (before the number),
  // so starred and unstarred rows start at the same place.
  var starR = !!cls && cls.indexOf(" favr") >= 0, star = f ? '<i class="fv">★</i>' : "";
  if (starR) right = star + right;
  return '<div class="row' + (cls || "") + '"' + (attr || "") + '><span>' + (starR ? "" : star) + (op ? '<button class="lnk" data-a="open" data-k="' + esc(typeof op === "string" ? op : key) + '">' + main + "</button>" : main) + (sub ? " <small>" + esc(sub) + "</small>" : "") +
    '</span><span class="r">' + right + ed + "</span></div>";
}
function shown(key) { return !P.hidden[key]; }
function favFirst(a, b) { return (P.fav[b.key] ? 1 : 0) - (P.fav[a.key] ? 1 : 0); }
function card(cls, title, body) { return '<div class="card ' + cls + '"><h3>' + title + "</h3>" + body + "</div>"; }

var ALL_IDS = ["weather", "mail", "live", "menu", "news", "telegram", "twitch", "youtube", "stocks", "reddit", "sports"];
var DEF_C = { weather: 3, mail: 3, live: 4, menu: 2, news: 6, telegram: 6, twitch: 4, youtube: 4, stocks: 4, reddit: 6, sports: 6 };
// The layout a new visitor or a new account starts with: sizes, text sizes, list lengths and order.
// Top row of small boxes, News and Telegram side by side, then Stocks, Twitch, YouTube and (stacked) Reddit over Sports.
var DEF_LAYOUT = {
  v: 2, pairPct: 54,
  order: ["weather", "mail", "live", "menu", "news", "telegram", "stocks", "twitch", "youtube", "reddit", "sports"],
  c: { weather: 3, mail: 3, live: 4, menu: 2, news: 6, telegram: 6, stocks: 3, twitch: 3, youtube: 3, reddit: 3, sports: 3 },
  fs: { weather: 0.9, mail: 0.9, live: 0.9, news: 0.9, telegram: 0.9, stocks: 0.9, twitch: 0.9, youtube: 0.9, reddit: 0.8, sports: 0.8 },
  rows: { news: 10, telegram: 10, stocks: 10, twitch: 10, youtube: 10, reddit: 4, sports: 3 }
};
var COMPACT = ["weather", "mail", "live", "menu"];
var LISTS = ["news", "telegram", "twitch", "youtube", "stocks", "reddit", "sports"];
function LAY() {
  if (!P.layout) P.layout = JSON.parse(JSON.stringify(DEF_LAYOUT));
  var L = P.layout;
  if (!L.fs) L.fs = {};
  if (!L.c) { L.c = {}; Object.keys(L.w || {}).forEach(function (k) { L.c[k] = L.w[k] * 3; }); }
  return L;
}
function orderIds() {
  var L = LAY(), raw = L.order.slice(), TOP = ["weather", "mail", "live", "menu"];
  if (L.v !== 2) {
    raw = TOP.concat(raw.filter(function (x) { return TOP.indexOf(x) < 0 && x !== "gmail1" && x !== "gmail2"; }));
    L.order = raw; L.v = 2; persist();
  }
  var o = raw.filter(function (x, i) { return ALL_IDS.indexOf(x) >= 0 && raw.indexOf(x) === i; });
  ALL_IDS.forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); });
  return o;
}
function adjust(a, id, d) {
  var L = LAY();
  if (a === "mv") { var o = orderIds(), i = o.indexOf(id), j = i + d; if (j < 0 || j >= o.length) return; o.splice(i, 1); o.splice(j, 0, id); L.order = o; }
  else if (a === "w") L.c[id] = Math.max(2, Math.min(12, (L.c[id] || DEF_C[id] || 3) + d));
  else if (a === "f") L.fs[id] = Math.round(Math.max(0.7, Math.min(1.6, (L.fs[id] || 1) + d * 0.1)) * 100) / 100;
  else L.rows[id] = Math.max(3, Math.min(20, (L.rows[id] || (id === "news" || id === "telegram" || id === "reddit" || id === "sports" ? 6 : 10)) + d));
  persist(); render();
}
// Every list box gets a small reload button in its top-right corner. To give a new box one, add its id and loader here.
var REFRESH = {
  news: function () { fetchNews(); }, telegram: function () { fetchTG(); }, twitch: function () { fetchTwitch(); },
  youtube: function () { fetchYT(); }, stocks: function () { fetchQuotes(true); }, reddit: function () { fetchReddit(); },
  sports: function () { fetchSports(true); }
};
var SPIN = {};
function boxBusy(id) { return (SPIN[id] && Date.now() - SPIN[id] < 1200) || (id === "news" && nBusy) || (id === "reddit" && rBusy); }
function refreshBox(id) {
  if (!REFRESH[id]) return;
  SPIN[id] = Date.now();
  REFRESH[id](); render();
  setTimeout(render, 1300);
}
function tile(id, title, body, click, hx) {
  var c = LAY().c[id] || DEF_C[id] || 3, t = "", at = "", cp = COMPACT.indexOf(id) >= 0;
  if (click) {
    var pr = typeof click === "string" ? click.split(":") : ["weather"];
    at = ' data-a="' + pr[0] + '"' + (pr[1] != null ? ' data-k="' + pr[1] + '"' : "") + ' tabindex="0" role="button"';
  }
  if (EDIT) {
    var bt = function (act, d, glyph, ttl) { return '<button data-a="' + act + '" data-k="' + id + ":" + d + '" title="' + ttl + '" aria-label="' + ttl + '">' + glyph + "</button>"; };
    var noW = id === "live" || id === "menu";
    t = '<div class="tools">' + bt("mv", -1, "◀", "Move earlier") + bt("mv", 1, "▶", "Move later") +
      (noW ? "" : bt("w", -1, "W−", "Narrower") + bt("w", 1, "W+", "Wider")) +
      bt("f", -1, "T−", "Smaller text") + bt("f", 1, "T+", "Larger text") +
      (LISTS.indexOf(id) >= 0 ? bt("h", -1, "H−", "Shorter list") + bt("h", 1, "H+", "Taller list") : "") +
      (id === "menu" ? "" : '<button data-a="boxoff" data-k="' + id + '" title="Hide this whole box. Bring it back in Settings, Layout.">Hide</button>') + "</div>";
  }
  var h3 = "<h3" + (EDIT ? ' class="grab" draggable="true" title="Drag to move"' : "") + ">" + title + "</h3>";
  var rb = REFRESH[id] ? '<button class="ib sm rf" data-a="refresh" data-k="' + id + '" title="Reload this box" aria-label="Reload ' + id + '">' + (boxBusy(id) ? '<span class="spin">↻</span>' : "↻") + "</button>" : "";
  var head = cp ? (EDIT ? '<span class="grab dh" draggable="true" title="Drag to move">⠿</span>' : "") : '<div class="th">' + h3 + (hx || rb ? '<div class="hc">' + (hx || "") + rb + "</div>" : "") + "</div>";
  return '<div class="card c' + c + (cp ? " compact" : "") + (id === "menu" && MENU_OPEN ? " menuopen" : "") + (click ? " click" : "") + '" data-id="' + id + '" style="--fs:' + fsOf(id).toFixed(2) + '"' + at + ">" + head + t + body + "</div>";
}
function opts(list, cur) { return list.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === cur ? " selected" : "") + ">" + o[1] + "</option>"; }).join(""); }
function ico(id, logo) {
  var t = tk(id), h = 0;
  for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 360;
  var cr = /^[A-Z0-9]{2,10}USDT?$/.test(t) ? t.replace(/USDT?$/, "").toLowerCase() : "";
  var src = logo || (cr ? "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color/" + cr + ".png" : "");
  src = safeUrl(src);
  if (BADIMG[src]) src = "";
  return '<span class="ic" style="--h:' + h + '"><i>' + esc(t.replace(/[^A-Za-z0-9]/g, "").slice(0, 2)) + "</i>" + (src ? '<img alt="" loading="lazy" referrerpolicy="no-referrer" data-rm="1" src="' + esc(src) + '">' : "") + "</span>";
}
function hd(t, n) { return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, "") + "…" : t; }
function fsOf(id) { return (P.fs || 1) * (LAY().fs[id] || 1); }
function pairPct() { var p = P.layout && P.layout.pairPct; return p == null ? 65 : p; }
// List height: one H step is the same number of pixels in every box (it follows the overall text size, not the box's
// own T size), so boxes with different text sizes can be made exactly the same height. 32.4 = one row at the usual 0.9 text.
function lst(id, html, def) { var r = LAY().rows[id] || def || 10; return '<div class="list" data-list="' + id + '" style="max-height:' + Math.round(r * 32.4 * (P.fs || 1)) + 'px">' + html + "</div>"; }
function ago(ts) { var m = Math.max(1, Math.round((Date.now() - ts) / 60000)); return m < 60 ? m + "m" : m < 1440 ? Math.round(m / 60) + "h" : Math.round(m / 1440) + "d"; }

function render() {
  var D = DATA, T = {};
  var t = WX ? Math.round(WX.current.temperature_2m) : D.weather.temp;
  var note = WX ? wxText(WX.current.weather_code) + " · feels " + Math.round(WX.current.apparent_temperature) + "°" : D.weather.note;
  var wWarn = WX ? wxWarn(WX) : [];
  T.weather = tile("weather", "", '<div class="mrow"><span class="mrn">' + esc(homeCity().name) + "</span>" + (WX ? '<span class="wi">' + wxIcon(WX.current.weather_code, WX.current.is_day, 22) + "</span>" : "") + '<b class="big">' + t + "°</b>" + (wWarn.length ? '<span class="warn" title="' + esc(wxWarnText(wWarn)) + '" aria-label="Weather warning">!</span>' : "") + '<span class="mut">' + esc(note) + "</span></div>", 1);
  T.mail = tile("mail", "", '<div class="mailgrid">' + [0, 1].map(function (i) {
    var cfg = P.mail && P.mail[i], m = MAIL[i], nm = (cfg && cfg.name) || D.inbox[i].name, val, click = false;
    if (!cfg || !cfg.url) val = PREVIEW ? "<b>" + D.inbox[i].n + '</b><span class="mut">new</span>' : '<span class="mut">Not connected</span>';
    else if (!m) val = '<span class="mut">Loading...</span>';
    else if (m.error) val = '<span class="mut" title="' + esc(m.error) + '">Error</span>';
    else { var n = mailN(i); val = "<b>" + n.txt + '</b><span class="mut">' + n.lab + "</span>" + (n.n > 0 ? '<button data-a="mailread" data-k="' + i + '" title="Mark read (only on this site)" aria-label="Mark read">✓</button>' : ""); click = true; }
    return '<div class="mailcell"' + (click ? ' data-a="mail" data-k="' + i + '" tabindex="0" role="button"' : "") + '><span class="mrn">' + esc(nm) + "</span>" + val + "</div>";
  }).join("") + "</div>");


  var tw = (TWC ? TW : D.twitch).filter(function (x) { return x.live && shown("t:" + x.id); })
    .map(function (x) { x.key = "t:" + x.id; return x; })
    .sort(function (a, b) { return favFirst(a, b) || b.v - a.v; });
  T.live = tile("live", "", radioHtml(), "radinfo");   // a click on the box itself (not on its controls) shows what is playing
  var allSrc = newsSrc().map(function (x) { return x.name; });
  var nb, nNew = 0;
  var errNote = NERRK.length ? '<div class="empty sn">' + NERRK.length + " source" + (NERRK.length > 1 ? "s" : "") + ' unavailable right now (<button class="lnk2" data-a="setpanel" title="' + esc(NERR) + '">details</button>)</div>' : "";
  if (NEWS.length) {
    var nowN = Date.now();
    NG = newsGroups();
    // A story (one or several sources merged into a row) is new only while you have seen and opened NONE of its
    // articles. Another source reporting a story that is already in your list does not mark it as new again.
    var gNew = function (g) { return g.every(function (x) { return isNewItem(x, "news") && !READ[x.u]; }); };
    nNew = NG.filter(gNew).length;
    var vis = NQ ? NG.filter(function (g) { return g.some(function (n) { return (n.t + " " + n.s).toLowerCase().indexOf(NQ) >= 0; }); }) : NG, lastB = "";
    nb = errNote + (NFILT || NQ ? '<input type="search" id="newsQ" class="flt" placeholder="Filter headlines…" aria-label="Filter headlines">' : "") + (vis.length ? lst("news", vis.slice(0, cntOf("news")).map(function (g) {
      // n = the story's latest headline; t0 = when it was first reported, which is where it stays in the list
      var n = g[0], srcs = g.src || g.map(function (x) { return x.s; }), t0 = g.t0 || n.ts, b = g.fav ? "★ Favorite sources" : bucket(t0);
      // The time label sits on the divider line above the first headline of each period, so it takes no extra row
      var bk = b !== lastB ? ' data-b="' + b + '"' : ""; lastB = b;
      var hot = srcs.length >= 3 && nowN - n.ts < 10800000, nw = gNew(g), rd = !nw && g.some(function (x) { return READ[x.u]; });
      var cls = (nw ? " new" : "") + (rd ? " rd" : "") + (g.hi ? " hi" : "") + (bk ? " bk" : "");
      return row("n:" + n.s, esc(n.t), P.hideSrc ? "" : srcs.join(" · "), (hot ? '<span class="pill hot" title="Many sources in the last 3 hours">hot</span>' : "") + (srcs.length > 1 ? '<span class="pill ac" title="' + esc(srcs.join(", ")) + '">' + srcs.length + "</span>" : "") + '<span class="mut">' + ago(t0) + "</span>", "a:" + n.u, cls, bk);   // the time is always the last thing on the row
    }).join("") + (vis.length > cntOf("news") ? moreBtn("news", "Show 20 more") : ""), 6) : '<div class="empty">' + (NQ ? "No headline matches that filter." : "All news sources hidden or muted. Use Sources to bring one back.") + "</div>");
  } else {
    nb = lst("news", D.news.map(function (x) {
      return '<div class="row"><span>' + esc(x.t) + '</span><span class="pill ' + (x.n > 3 ? "ac" : "") + '">×' + x.n + "</span></div>";
    }).join(""), 6) + '<div class="empty">' + (NERR ? "News unavailable: " + esc(NERR) : "Sample headlines. Sign in to load your sources.") + "</div>";
  }
  var newBtn = function (n, box) { return n ? '<button class="pill ac newp" data-a="nseen" data-k="' + box + '" title="Mark everything in this box as seen">' + n + " new</button>" : ""; };
  var ctlN = allSrc.length > 1 ? '<div class="dd"><button data-a="filtmenu" data-k="news" class="ib sm">Sources</button><div class="menu" id="filtNews" hidden>' +
    allSrc.map(function (nm) { return '<label><input type="checkbox" data-a="filttoggle" data-k="n:' + esc(nm) + '"' + (shown("n:" + nm) ? " checked" : "") + "> " + esc(nm) + "</label>"; }).join("") + "</div></div>" : "";
  var fltBtn = NEWS.length ? '<button class="ib sm' + (NFILT || NQ ? " on" : "") + '" data-a="nfilt" title="Filter headlines" aria-label="Filter headlines">⌕</button>' : "";
  T.news = tile("news", "News", nb, 0, newBtn(nNew, "news") + fltBtn + ctlN);

  var allTg = tgSrc(), tmute = wordList(NW().mute), thi = wordList(NW().hi);
  var tp = TGP.filter(function (g) { return shown("g:" + g.s) && !(tmute.length && hasWord(g.tx || g.t, tmute)); });
  var tgMulti = allTg.filter(function (nm) { return shown("g:" + nm); }).length > 1;
  var tNew = tp.filter(function (g) { return isNewItem(g, "tg") && !READ[g.u]; }).length;
  var ctlG = allTg.length > 1 ? '<div class="dd"><button data-a="filtmenu" data-k="tg" class="ib sm">Sources</button><div class="menu" id="filttg" hidden>' +
    allTg.map(function (nm) { return '<label><input type="checkbox" data-a="filttoggle" data-k="g:' + esc(nm) + '"' + (shown("g:" + nm) ? " checked" : "") + "> " + esc(nm) + "</label>"; }).join("") + "</div></div>" : "";
  T.telegram = tile("telegram", "Telegram", tp.length ? lst("telegram", tp.slice(0, cntOf("tg")).map(function (g) {
    var cls = (isNewItem(g, "tg") && !READ[g.u] ? " new" : "") + (READ[g.u] ? " rd" : "") + (thi.length && hasWord(g.tx || g.t, thi) ? " hi" : "");
    // Two full lines of the post, cut by the browser where the space ends; the channel name is shown inline, and only when there are several
    return row("g:" + g.s, '<span class="clamp">' + (tgMulti ? "<small>" + esc(g.s) + "</small> " : "") + esc(String(g.t).slice(0, 400)) + "</span>", "", '<span class="mut">' + ago(g.ts) + "</span>", "m:" + g.u, cls + " tg");
  }).join("") + (PREVIEW ? "" : tgOldBusy ? '<div class="more mut">Loading older posts…</div>' : tp.length > cntOf("tg") ? moreBtn("tg", "Show 20 more") : tgCanOlder() ? moreBtn("tg", "Load 20 older posts") : ""), 6) : '<div class="empty">' + (NERR ? "Unavailable: " + esc(NERR) : "Sign in to load your Telegram channels (Clash Report).") + "</div>", 0, newBtn(tNew, "tg") + ctlG);

  var TS = (P.sort && P.sort.twitch) || "viewers", cats = {};
  tw.forEach(function (x) { cats[x.sub || "?"] = (cats[x.sub || "?"] || 0) + 1; });
  var tcat = P.tcat && cats[P.tcat] ? P.tcat : "";
  var twv = (tcat ? tw.filter(function (x) { return (x.sub || "?") === tcat; }) : tw.slice()).sort(function (a, b) {
    return favFirst(a, b) || (TS === "name" ? String(a.name || a.id).toLowerCase().localeCompare(String(b.name || b.id).toLowerCase()) : TS === "cat" ? String(a.sub || "").localeCompare(String(b.sub || "")) || b.v - a.v : b.v - a.v);
  });
  var ctlT = '<select data-s="sort:twitch" aria-label="Sort streams">' + opts([["viewers", "Views"], ["name", "Name"], ["cat", "Cat."]], TS) + '</select><select data-s="tcat" aria-label="Filter by category"><option value="">All categories</option>' +
    Object.keys(cats).sort(function (a, b) { return cats[b] - cats[a] || a.localeCompare(b); }).map(function (c) { return '<option value="' + esc(c) + '"' + (c === tcat ? " selected" : "") + ">" + esc(c) + " (" + cats[c] + ")</option>"; }).join("") + "</select>";
  // ★ streamers who are offline come after the live ones, dimmed, most recently live first
  var liveIds = {}; tw.forEach(function (x) { liveIds[x.id] = 1; });
  var offRows = TWC && twOffOn() && !tcat ? twFavs().filter(function (l) { return !liveIds[l]; }).sort(function (a, b) { return ((TWOFF[b] || {}).last || 0) - ((TWOFF[a] || {}).last || 0); }).map(function (l) {
    var o = TWOFF[l] || {};
    return row("t:" + l, '<span class="dot off"></span>' + esc(o.n || l), o.last ? "last live " + ago(o.last) + " ago" : "offline", "", 1, " favr twoff");
  }).join("") : "";
  T.twitch = tile("twitch", "Twitch", (twv.length || offRows ? lst("twitch", twv.map(function (x) {
    var vv = x.v >= 1000 ? (x.v / 1000).toFixed(1) + "k" : x.v;
    return row(x.key, '<span class="dot"></span>' + esc(x.name || x.id), x.sub, '<span class="mut">' + vv + "</span>", TWC ? 1 : 0, " favr");
  }).join("") + offRows) : '<div class="empty">Nobody you follow is live.</div>') +
    (TWC || !window.TWITCH_CLIENT_ID ? "" : '<button data-a="twConnect">Connect Twitch to show your real follows</button>'), 0, ctlT);

  var yb;
  if ((P.yt && P.yt.ch && P.yt.ch.length) || PREVIEW) {
    var now = Date.now();
    var vids = YTV.map(function (v) { return { id: v.id, t: v.t, n: v.n, ts: v.ts, key: "y:" + v.n, isNew: now - v.ts < 172800000 }; })
      .filter(function (v) { return shown(v.key) && now - v.ts < 2592000000; })
      .sort(function (a, b) { return b.ts - a.ts; });
    var per = {};
    vids = vids.filter(function (v) { per[v.n] = (per[v.n] || 0) + 1; return per[v.n] <= 2; });
    vids.sort(function (a, b) { return ((P.fav[b.key] && b.isNew) ? 1 : 0) - ((P.fav[a.key] && a.isNew) ? 1 : 0) || b.ts - a.ts; });
    yb = (YTERR ? '<div class="empty">Videos unavailable: ' + esc(YTERR) + "</div>" : "") +
      (YTDOWN && vids.length ? '<div class="empty sn" title="YouTube\'s upload feed is not answering. This is on YouTube\'s side and comes back by itself.">YouTube\'s feed is down right now · showing the last loaded videos</div>' : "") + (vids.length ? lst("youtube", vids.map(function (v) {
      return row(v.key, esc(v.t), v.n, '<span class="mut">' + ago(v.ts) + "</span>" + (P.fav[v.key] && v.isNew ? '<span class="pill ac">new</span>' : ""), PREVIEW ? 0 : "v:" + v.id);
    }).join("")) : '<div class="empty">' + (YTV.length ? "All channels hidden. Restore them in Settings." : YTDOWN ? "YouTube's upload feed is not answering right now. This is on YouTube's side; the videos come back by themselves when it does." : USER ? "Loading videos…" : "Sign in to load your videos.") + "</div>");
  } else {
    var yt = D.youtube.map(function (v) { v.key = "y:" + v.ch; return v; }).filter(function (v) { return shown(v.key); }).sort(favFirst);
    yb = lst("youtube", yt.map(function (v) { return row(v.key, esc(v.t), v.ch, '<span class="mut">' + v.age + "</span>"); }).join("")) +
      '<div class="empty">Sample videos. Sign in, then import your subscriptions.csv from Google Takeout in Settings.</div>';
  }
  T.youtube = tile("youtube", "YouTube", yb);

  var rSubs = rdSrc(), RS = rdSort();
  var rp = RD.filter(function (x) { return shown("r:" + x.s.toLowerCase()); });
  if (RS === "new") rp = rp.slice().sort(function (a, b) { return b.ts - a.ts; });
  var rNew = RS === "new" ? rp.filter(function (x) { return isNewItem(x, "rd") && !READ[x.u]; }).length : 0;
  var ctlR = '<select data-s="rdsort" aria-label="Sort posts">' + opts(RD_SORTS.map(function (s) { return [s, s.charAt(0).toUpperCase() + s.slice(1)]; }), RS) + "</select>" +
    (rSubs.length > 1 ? '<div class="dd"><button data-a="filtmenu" data-k="rd" class="ib sm">Sources</button><div class="menu" id="filtRd" hidden>' +
      rSubs.map(function (nm) { return '<label><input type="checkbox" data-a="filttoggle" data-k="r:' + esc(nm.toLowerCase()) + '"' + (shown("r:" + nm.toLowerCase()) ? " checked" : "") + "> r/" + esc(nm) + "</label>"; }).join("") + "</div></div>" : "");
  T.reddit = tile("reddit", "Reddit", (RDERR && !rp.length ? '<div class="empty">Reddit unavailable: ' + esc(RDERR) + "</div>" : "") + (rp.length ? lst("reddit", rp.slice(0, 60).map(function (x) {
    var cls = (RS === "new" && isNewItem(x, "rd") && !READ[x.u] ? " new" : "") + (READ[x.u] ? " rd" : "");
    return row("r:" + x.s.toLowerCase(), esc(x.t), P.hideSrc ? "" : "r/" + x.s, '<span class="mut">' + ago(x.ts) + "</span>", "r:" + x.u, cls);
  }).join(""), 6) : RDERR ? "" : '<div class="empty">' + (!rSubs.length ? "No subreddits. Add some in Settings." : USER ? "Loading Reddit…" : "Sign in to load Reddit.") + "</div>"), 0, newBtn(rNew, "rd") + ctlR);

  T.sports = tile("sports", "Sports", sportsBody(), 0, '<select data-s="spsport" aria-label="Sport">' + opts(spSports(), spSport()) + '</select><select data-s="spview" aria-label="Which games">' + opts(spViews(), spView()) + "</select>");

  var SL = P.stocks || D.stocks;
  var st = SL.map(function (x) { var q = QUOTES[tk(x.id)]; return { id: x.id, name: x.name, c: q ? q.c : (QLOADED ? null : x.c), p: q ? q.p : null, logo: q ? q.logo : "", key: "s:" + x.id }; }).filter(function (x) { return shown(x.key); })
    .sort(function (x, y) {
      var SS = (P.sort && P.sort.stocks) || "move", a = x.c, b = y.c;
      if (favFirst(x, y)) return favFirst(x, y);
      if (SS === "name") return x.id.localeCompare(y.id);
      if (a == null || b == null) return (a == null ? 1 : 0) - (b == null ? 1 : 0);
      return SS === "up" ? b - a : SS === "down" ? a - b : Math.abs(b) - Math.abs(a);
    });
  var ctlS = '<select data-s="sort:stocks" aria-label="Sort stocks">' + opts([["move", "Biggest mover"], ["up", "Most up"], ["down", "Most down"], ["name", "Name"]], (P.sort && P.sort.stocks) || "move") + "</select>";
  var IC = 'viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  T.menu = tile("menu", "", '<div class="mrow menurow">' +
    '<div class="dd"><button data-a="clockmenu2" class="ib" aria-label="Timer, countdown, stopwatch" aria-haspopup="menu" aria-expanded="' + (MENU_OPEN === "clock") + '"><svg ' + IC + '><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></button>' +
      (MENU_OPEN === "clock" ? '<div class="menu" role="menu"><button role="menuitem" data-a="clockmenu" data-k="t">Timer</button><button role="menuitem" data-a="clockmenu" data-k="c">Countdown</button><button role="menuitem" data-a="clockmenu" data-k="s">Stopwatch</button></div>' : "") + "</div>" +
    '<button data-a="opennotes" class="ib" aria-label="Notes"><svg ' + IC + '><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>' + (openTodos() ? "<span>" + openTodos() + "</span>" : "") + "</button>" +
    '<button data-a="opencal" class="ib" aria-label="Calendar" title="Calendar"><svg ' + IC + '><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/></svg>' + (evsOn(ymd(new Date())).length ? "<span>" + evsOn(ymd(new Date())).length + "</span>" : "") + "</button>" +
    '<div class="dd"><button data-a="bellmenu" class="ib" aria-label="Notifications" title="Notifications" aria-haspopup="menu" aria-expanded="' + (MENU_OPEN === "bell") + '"><svg ' + IC + '><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7 2.5 7h-17S6 15 6 9zM10 20a2 2 0 0 0 4 0"/></svg>' + (missed() ? "<span>" + missed() + "</span>" : "") + "</button>" +
      (MENU_OPEN === "bell" ? bellHtml() : "") + "</div>" +
    '<div class="dd"><button data-a="cogmenu2" class="ib' + (EDIT ? " on" : "") + '" aria-label="Edit and settings" aria-haspopup="menu" aria-expanded="' + (MENU_OPEN === "cog") + '"><svg ' + IC + '><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>' +
      (MENU_OPEN === "cog" ? '<div class="menu" role="menu"><button role="menuitem" data-a="editmode">' + (EDIT ? "Done" : "Edit") + '</button><button role="menuitem" data-a="openbrief">Summary</button><button role="menuitem" data-a="setpanel">Settings</button><button role="menuitem" data-a="openhelp">Help</button></div>' : "") + "</div>" +
    '<div class="dd"><button data-a="acctmenu2" class="ib" aria-label="Account" aria-haspopup="menu" aria-expanded="' + (MENU_OPEN === "acct") + '" title="' + (USER ? esc(USER.email) : "Account") + '"><svg ' + IC + '><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg></button>' +
      (MENU_OPEN === "acct" ? acctHtml() : "") + "</div>" +
    "</div>");
  T.stocks = tile("stocks", "Stocks", (QERR ? '<div class="empty">Prices unavailable: ' + esc(QERR) + "</div>" : "") + (st.length ? lst("stocks", st.map(function (x) {
    var c = x.c, up = c >= 0, pts = PREVIEW ? sparkFake(x.id, c) : SPARK[tk(x.id)];
    // the day chart takes its color from today's change (the number next to it); a week or month chart from its own direction
    var rise = pts && pts.length > 1 ? pts[pts.length - 1] >= pts[0] : up;
    var spk = sparkOn() ? sparkSvg(pts, SPARKR === "d" && c != null && !PREVIEW ? up : rise) : "";
    return row(x.key, ico(x.id, x.logo) + "<b>" + esc(x.id) + "</b>", (x.p != null ? x.p.toFixed(2) : x.name), spk + (c == null ? '<span class="mut" title="No free price data for this one. Click it for the chart.">n/a</span>' : '<span class="' + (up ? "up" : "down") + '">' + (up ? "▲ +" : "▼ ") + c.toFixed(1) + "%</span>"), 1);
  }).join("")) : '<div class="empty">No stocks. Restore them in Settings.</div>'), 0, ctlS);

  var pp = pairPct();
  var liveBox = T.live.replace('style="--fs:', 'style="flex:' + pp + ' 1 0%;--fs:');
  var menuBox = T.menu.replace('style="--fs:', 'style="flex:' + (100 - pp) + ' 1 0%;--fs:');
  // The converter and the menu share one grid cell. With the converter hidden, the menu has the cell to itself.
  T.live = '<div class="pairwrap">' + (boxOff("live") ? "" : liveBox +
    (EDIT ? '<button class="paird" data-a="paird" title="Drag to resize" aria-label="Resize Convert and Menu" role="separator" aria-orientation="vertical" tabindex="0">⋮</button>' : "")) +
    menuBox + "</div>";
  T.menu = "";

  // A background refresh must not wipe what you are typing (sign-in form, converter, filter) or steal focus
  var scrolls = {}, typed = {}, act = document.activeElement, actId = act && act.id && $("grid").contains(act) ? act.id : "", sel = null;
  $("grid").querySelectorAll(".list[data-list]").forEach(function (n) { scrolls[n.dataset.list] = n.scrollTop; });
  $("grid").querySelectorAll("input[id]").forEach(function (n) { if (n.type !== "checkbox") typed[n.id] = n.value; });
  if (actId) { try { sel = [act.selectionStart, act.selectionEnd]; } catch (e) {} }
  $("grid").innerHTML = orderIds().map(function (id) { return id !== "live" && boxOff(id) ? "" : T[id] || ""; }).join("");
  $("grid").querySelectorAll(".list[data-list]").forEach(function (n) { if (scrolls[n.dataset.list]) n.scrollTop = scrolls[n.dataset.list]; });
  Object.keys(typed).forEach(function (id) { var n = $(id); if (n && n.value !== typed[id]) n.value = typed[id]; });
  if (actId) { var fn = $(actId); if (fn) { try { fn.focus({ preventScroll: true }); if (sel && sel[0] != null) fn.setSelectionRange(sel[0], sel[1]); } catch (e) {} } }
  renderHidden();
  refreshBrief();
  $("pv").hidden = !PREVIEW;
  if (!$("peek").hidden) hidePeek();   // the row it pointed at has just been redrawn
  packGrid();
}
// Each box covers as many of the grid's 1px rows as its own height needs, plus the 14px gap under it.
// That lets boxes of different heights pack together (a short Reddit box with Sports under it, beside a tall one).
// The small stock charts sit in their own column, right before the percentage, the same width and the same place on
// every row. The ticker always stays whole; in a narrow box it is the price that gets cut short to make room. The
// percentages share the width of the widest one, so the charts line up exactly. Only when there is no room for even a
// small chart next to the longest ticker are the charts left out. Runs on every redraw and when the page is resized.
function fitSparks() {
  var list = document.querySelector('#grid .list[data-list="stocks"]');
  if (!list || !list.querySelector(".spk")) return;
  var rows = Array.prototype.slice.call(list.querySelectorAll(".row")), max = parseFloat(getComputedStyle(list).fontSize) * 3.1;
  list.classList.remove("spk0", "spkon"); list.classList.add("spkm");   // measure with the charts taken out
  list.style.removeProperty("--pillw");
  var pill = 0, tick = 0, right = 0;
  rows.forEach(function (r) { var s = r.querySelector(".spk"); if (s && s.nextElementSibling) pill = Math.max(pill, s.nextElementSibling.getBoundingClientRect().width); });
  list.style.setProperty("--pillw", Math.ceil(pill) + "px");
  rows.forEach(function (r) {
    var b = r.firstElementChild.querySelector(".lnk");
    if (b) tick = Math.max(tick, b.getBoundingClientRect().right - r.getBoundingClientRect().left);
    right = Math.max(right, r.lastElementChild.getBoundingClientRect().width);
  });
  var w = Math.floor(Math.min(max, rows[0].clientWidth - tick - right - 8 - 6));   // 8px row gap, 6px between chart and percentage
  list.classList.remove("spkm");
  if (w < 16) list.classList.add("spk0"); else { list.classList.add("spkon"); list.style.setProperty("--spkw", w + "px"); }
}
function packGrid() {
  fitSparks();
  var kids = Array.prototype.slice.call($("grid").children);
  // start from each list's natural height (undo any earlier snapping)
  Array.prototype.forEach.call($("grid").querySelectorAll(".list[data-snap]"), function (l) { l.style.minHeight = ""; l.style.maxHeight = l.dataset.mh; l.removeAttribute("data-snap"); });
  var span = function () {
    var hs = kids.map(function (k) { return k.offsetHeight; });
    kids.forEach(function (k, i) { k.style.gridRowEnd = "span " + (hs[i] + 14); });
  };
  span();
  if (window.innerWidth <= 820) return;   // one column on phones: nothing to line up
  // Snap: a stack of boxes (two headers and a gap) can never add up to exactly one tall box using H steps alone.
  // So when a box ends within 24px of the bottom edge of a clearly taller box beside it, it is stretched or trimmed
  // those few pixels and the two bottom edges line up exactly.
  var R = kids.map(function (k) { var r = k.getBoundingClientRect(); return { el: k, l: r.left, r: r.right, t: r.top, b: r.bottom, h: r.height }; });
  var mark = function (l) { if (!l.dataset.snap) { l.dataset.mh = l.style.maxHeight; l.dataset.snap = "1"; } }, changed = false;
  R.forEach(function (x) {
    var ref = null;
    R.forEach(function (y) {
      if (y === x || y.h < x.h + 24 || (y.l < x.r - 1 && y.r > x.l + 1)) return;   // must be clearly taller, and beside (not above or below)
      var d = y.b - x.b;
      if (Math.abs(d) >= 0.5 && Math.abs(d) <= 24 && (!ref || Math.abs(d) < Math.abs(ref.b - x.b))) ref = y;
    });
    if (!ref) return;
    var d = Math.round(ref.b - x.b), list = x.el.querySelector(".list");
    if (d > 0) {
      if (!list) return;
      mark(list); list.style.minHeight = (list.offsetHeight + d) + "px"; changed = true;
      return;
    }
    // too long: the lowest box in this stack whose list is scrolling gives up the extra pixels
    var cur = x;
    while (cur) {
      var cl = cur.el.querySelector(".list");
      if (cl && cl.scrollHeight > cl.clientHeight && cl.clientHeight + d > 40) { mark(cl); cl.style.maxHeight = (cl.clientHeight + d) + "px"; changed = true; return; }
      var above = R.filter(function (y) { return y !== cur && Math.abs(y.l - cur.l) < 2 && Math.abs(y.r - cur.r) < 2 && Math.abs(y.b + 14 - cur.t) < 3; })[0];
      cur = above || null;
    }
  });
  if (changed) span();
}
var packT = 0;
window.addEventListener("resize", function () { clearTimeout(packT); packT = setTimeout(packGrid, 80); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { packGrid(); });

// Drag to rearrange: grab a box by its title in Edit mode
var DRAG = null;
$("grid").addEventListener("dragstart", function (e) {
  var c = e.target.closest && e.target.closest("[data-id]");
  if (!EDIT || !c) return;
  DRAG = c.dataset.id; e.dataTransfer.effectAllowed = "move";
  try { e.dataTransfer.setData("text/plain", DRAG); } catch (x) {}
});
$("grid").addEventListener("dragover", function (e) { if (DRAG) e.preventDefault(); });
$("grid").addEventListener("dragend", function () { DRAG = null; });
$("grid").addEventListener("drop", function (e) {
  var c = e.target.closest("[data-id]");
  if (!DRAG || !c) return;
  e.preventDefault();
  var o = orderIds(), from = DRAG, to = c.dataset.id;
  DRAG = null;
  var i = o.indexOf(from), j = o.indexOf(to);
  if (i < 0 || j < 0 || i === j) return;
  o.splice(i, 1); o.splice(j, 0, from);
  LAY().order = o; persist(); render();
});

function renderHidden() {
  var keys = Object.keys(P.hidden).filter(function (k) { return P.hidden[k]; });
  $("hiddenList").innerHTML = keys.length ? keys.map(function (k) {
    return '<div class="row"><span>' + esc(k.slice(2)) + '</span><button data-a="show" data-k="' + esc(k) + '">Restore</button></div>';
  }).join("") : "Nothing hidden.";
  renderSpList();
  // Settings > Layout: one switch per box
  $("boxList").innerHTML = ALL_IDS.filter(function (id) { return id !== "menu"; }).map(function (id) {
    return "<label>" + BOX_NAMES[id] + ' <input type="checkbox" data-a="boxtoggle" data-k="' + id + '"' + (boxOff(id) ? "" : " checked") + "></label>";
  }).join("");
}
// ---- Whole boxes can be switched off (Edit mode: Hide; Settings > Layout brings them back) ----
var BOX_NAMES = { weather: "Weather", mail: "Mail", live: "Radio", menu: "Menu", news: "News", telegram: "Telegram", twitch: "Twitch", youtube: "YouTube", stocks: "Stocks", reddit: "Reddit", sports: "Sports" };
function boxOff(id) { var L = P.layout; return id !== "menu" && !!(L && L.off && L.off[id]); }
function setBoxOff(id, off) {
  var L = LAY();
  L.off = L.off || {};
  if (off) L.off[id] = 1; else delete L.off[id];
  persist(); render();
  if (!off && REFRESH[id]) REFRESH[id]();
}

// ---- Details window ----
function openModal(title, html) { $("mTitle").textContent = title; $("mBody").innerHTML = html; $("modal").hidden = false; }
function closeModal() { $("modal").hidden = true; $("mBody").innerHTML = ""; }
$("mClose").onclick = closeModal;
$("modal").onclick = function (e) { if (e.target.id === "modal") closeModal(); };
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") { if (!$("modal").hidden) closeModal(); else $("panel").hidden = true; closeMenus(); }
  if ((e.key === "Enter" || e.key === " ") && e.target.getAttribute && e.target.getAttribute("role") === "button" && e.target.tagName !== "BUTTON") { e.preventDefault(); e.target.click(); }
});

// ---- Twitch (browser login, needs only the Client ID) ----
var TW = null, TWC = false;
function twToken() { try { var t = localStorage.getItem("sp_twitch"); if (t) return t; } catch (e) {} return P.tw || null; }
function twBtn() { $("twBtn").textContent = twToken() ? "Disconnect" : "Connect"; }
function twConnect() {
  var st = "twitch";
  try {
    var b = new Uint8Array(16); crypto.getRandomValues(b);
    st = "twitch" + Array.prototype.map.call(b, function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
    sessionStorage.setItem("sp_tw_state", st);
  } catch (e) {}
  location.href = "https://id.twitch.tv/oauth2/authorize?client_id=" + encodeURIComponent(TWITCH_CLIENT_ID) + "&redirect_uri=" + encodeURIComponent(TWITCH_REDIRECT) + "&response_type=token&scope=user:read:follows&state=" + encodeURIComponent(st);
}
function twDisconnect() { try { localStorage.removeItem("sp_twitch"); } catch (e) {} delete P.tw; persist(); TW = null; TWC = false; LIVEPREV = null; twBtn(); render(); }
function twGet(path, tok) {
  return fetch("https://api.twitch.tv/helix/" + path, { headers: { Authorization: "Bearer " + tok, "Client-Id": TWITCH_CLIENT_ID } })
    .then(function (r) { if (r.status === 401) throw new Error("expired"); return r.json(); });
}
// Twitch asks apps to check their token about once an hour
var twChecked = 0, TWUID = null, LIVEPREV = null;
function twValidate(tok) {
  if (Date.now() - twChecked < 3600000) return;
  twChecked = Date.now();
  fetch("https://id.twitch.tv/oauth2/validate", { headers: { Authorization: "OAuth " + tok } })
    .then(function (r) { if (r.status === 401) twDisconnect(); }).catch(function () {});
}
function fetchTwitch() {
  var tok = twToken(); twBtn();
  if (!tok || !window.TWITCH_CLIENT_ID) return;
  if (P.tw !== tok) { P.tw = tok; persist(); }
  twValidate(tok);
  (TWUID ? Promise.resolve(TWUID) : twGet("users", tok).then(function (u) { TWUID = u.data[0].id; return TWUID; }))
    .then(function (uid) { return twGet("streams/followed?first=100&user_id=" + uid, tok); })
    .then(function (j) {
      TWC = true;
      TW = (j.data || []).map(function (x) { return { id: x.user_login, name: x.user_name, sub: x.game_name, v: x.viewer_count, live: 1, title: x.title, th: x.thumbnail_url, st: Date.parse(x.started_at) }; });
      if (LIVEPREV) TW.forEach(function (x) {
        if (!LIVEPREV[x.id] && P.fav["t:" + x.id]) toast("live", (x.name || x.id) + " is live", (x.sub ? x.sub + " · " : "") + (x.title || ""), { a: "tw", k: x.id });
      });
      LIVEPREV = {}; TW.forEach(function (x) { LIVEPREV[x.id] = 1; });
      render(); fetchTwOffline(tok);
    }).catch(function (e) { if (e.message === "expired") twDisconnect(); });
}
// ---- ★ streamers who are offline, with when they were last live (Settings > Twitch switches the rows off) ----
// "Last live" is the later of: the last time this page saw them live, and the end of their newest past broadcast on
// Twitch (looked up at most every 30 minutes; a channel that does not keep past broadcasts has none).
var TWOFF = load("sp_twoff", {});
function twOffOn() { return P.twOff !== false; }
function twFavs() { return Object.keys(P.fav).filter(function (k) { return k.indexOf("t:") === 0 && P.fav[k] && !P.hidden[k] && /^t:[a-z0-9_]{2,25}$/i.test(k); }).map(function (k) { return k.slice(2); }).slice(0, 30); }
function twDur(s) { var m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(s || ""); return m ? ((+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0)) * 1000 : 0; }
function fetchTwOffline(tok) {
  if (!twOffOn() || !TW) return;
  var now = Date.now(), live = {}, favs = twFavs();
  TW.forEach(function (x) { live[x.id] = 1; if (P.fav["t:" + x.id]) { var o = TWOFF[x.id] = TWOFF[x.id] || {}; o.n = x.name || x.id; o.last = now; } });
  var need = favs.filter(function (l) { return !live[l] && !(TWOFF[l] && now - (TWOFF[l].chk || 0) < 1800000); });
  save("sp_twoff", TWOFF);
  if (!need.length) return;
  need.forEach(function (l) { (TWOFF[l] = TWOFF[l] || {}).chk = now; });
  twGet("users?" + need.map(function (l) { return "login=" + encodeURIComponent(l); }).join("&"), tok).then(function (u) {
    return Promise.all((u.data || []).map(function (usr) {
      var o = TWOFF[usr.login] = TWOFF[usr.login] || {};
      o.n = usr.display_name || usr.login;
      return twGet("videos?type=archive&first=1&user_id=" + encodeURIComponent(usr.id), tok).then(function (v) {
        var d = (v.data || [])[0], end = d ? Date.parse(d.created_at) + twDur(d.duration) : 0;
        if (end > (o.last || 0)) o.last = end;
      }).catch(function () {});
    }));
  }).then(function () { save("sp_twoff", TWOFF); render(); }).catch(function () {});
}
// Hover card for a stream: preview picture, title, game, how long it has been live. For an offline ★ row: when it was last live.
function showTwPeek(el, login) {
  if (EDIT || !TWC) return;
  var s = (TW || []).filter(function (x) { return x.id === login; })[0], h;
  if (s) {
    var mins = s.st ? Math.max(0, Math.round((Date.now() - s.st) / 60000)) : -1, up = mins < 0 ? "" : "live for " + (mins >= 60 ? Math.floor(mins / 60) + "h " + (mins % 60) + "m" : mins + "m");
    var img = safeUrl(String(s.th || "").replace("{width}", "440").replace("{height}", "248"));
    h = (img ? '<img alt="" referrerpolicy="no-referrer" data-rm="1" src="' + esc(img) + '">' : "") + '<div class="pk"><b>' + esc(s.title || s.name || login) + "</b><small>" + esc(s.name || login) + (s.sub ? " · " + esc(s.sub) : "") + (up ? " · " + up : "") + " · " + (+s.v || 0).toLocaleString("en-GB") + " watching</small></div>";
  } else {
    var o = TWOFF[login] || {};
    h = '<div class="pk"><b>' + esc(o.n || login) + "</b><small>Offline" + (o.last ? " · last live " + ago(o.last) + " ago (" + when(o.last) + ")" : " · no past broadcast found") + "</small></div>";
  }
  $("peek").innerHTML = h;
  placePeek(el);
}
// A pop-out window is twitch.tv itself (first-party), so your login cookie is sent and Turbo / subs count: no ads.
// Embedded players are third-party, and browsers that block third-party cookies make Twitch think you're logged out.
function twPop(login) {
  var w = Math.round(Math.min(1280, (screen.availWidth || 1280) * 0.6)), h = Math.round(w * 9 / 16);
  window.open("https://player.twitch.tv/?channel=" + encodeURIComponent(login) + "&parent=twitch.tv&player=popout&muted=false", "tw_" + login, "popup,width=" + w + ",height=" + h);
}
function twChat(login) { window.open("https://www.twitch.tv/popout/" + encodeURIComponent(login) + "/chat?popout=", "twc_" + login, "popup,width=380,height=680"); }
function twEmbedSrc(login) { return "https://player.twitch.tv/?channel=" + encodeURIComponent(login) + "&parent=" + location.hostname + "&muted=true"; }
function watchTwitch(login) { if (P.twPop) twPop(login); else openTwitch(login); }
function openTwitch(login) {
  var s = (TW || []).filter(function (x) { return x.id === login; })[0];
  openModal((s && s.name) || login, (s && s.title ? '<p class="mut sn">' + esc(s.title) + (s.sub ? " · " + esc(s.sub) : "") + "</p>" : "") +
    '<div class="tw"><iframe allow="autoplay; fullscreen; storage-access" allowfullscreen src="' + esc(twEmbedSrc(login)) + '"></iframe></div>' +
    '<p class="tools"><button class="pri" data-a="twpop" data-k="' + esc(login) + '" title="Opens on twitch.tv, so Turbo / your sub is recognised">Pop out (no ads with Turbo/sub)</button><button data-a="twchat" data-k="' + esc(login) + '">Pop out chat</button><button data-a="dock" data-k="t:' + esc(login) + '">Dock on the left</button>' + linkBtn("https://www.twitch.tv/" + encodeURIComponent(login), "Open on Twitch") + "</p>" +
    '<p class="mut sn">Seeing ads in this embedded player even with Turbo or a sub? Your browser is hiding your Twitch login from embeds. Use Pop out, or allow third-party cookies for <code>[*.]twitch.tv</code> (Help → Twitch).</p>');
}

// ---- Stock prices (Finnhub via a Supabase function, so the key stays private) ----
var QUOTES = {}, QLOADED = false, QERR = "";
function tk(id) { return id.indexOf(":") >= 0 ? id.split(":").pop() : id; }
var qBusy = false, qLast = 0;
function fetchQuotes(force) {
  if (!sb || !USER || qBusy) return;
  if (!force && Date.now() - qLast < 45000) return;
  qBusy = true; qLast = Date.now();
  var list = (P.stocks || DATA.stocks).map(function (x) { return tk(x.id); });
  sb.functions.invoke("quotes", { body: { symbols: list } }).then(function (r) {
    qBusy = false;
    if (r.error) QERR = r.error.message;
    else if (!r.data || r.data._err) QERR = (r.data && r.data._err) || "no data";
    else { QERR = ""; Object.assign(QUOTES, r.data); QLOADED = Object.keys(QUOTES).length > 0; stockAlerts(r.data); }
    render(); fetchSparks(force);
  }).catch(function (e) { qBusy = false; QERR = String((e && e.message) || e); render(); });
}
// ---- Small chart on each stock row: the day, the week or the month (Settings > Stocks, also switches it off). Fetched every 10 minutes. ----
var SPARK = {}, SPARKR = "", spkBusy = false, spkLast = 0;
(function () { var c = load("sp_spark", null); if (c && c.r && c.d) { SPARK = c.d; SPARKR = c.r; } })();
function sparkOn() { return P.spark !== false; }
function sparkRange() { return P.sparkR === "w" || P.sparkR === "m" ? P.sparkR : "d"; }
function fetchSparks(force) {
  if (!sb || !USER || spkBusy || !sparkOn() || boxOff("stocks")) return;
  var range = sparkRange();
  if (!force && range === SPARKR && Date.now() - spkLast < 540000) return;
  spkBusy = true; spkLast = Date.now();
  var list = (P.stocks || DATA.stocks).map(function (x) { return tk(x.id); });
  sb.functions.invoke("quotes", { body: { spark: list, range: range } }).then(function (r) {
    spkBusy = false;
    // an older "quotes" function does not know this request and answers without "spark": then there are simply no charts
    // (a "quotes" function from before the week and month choice always answers with the day, and says no range)
    if (r.data && r.data.spark && typeof r.data.spark === "object") { SPARK = r.data.spark; SPARKR = r.data.range || "d"; save("sp_spark", { r: SPARKR, d: SPARK }); render(); }
  }).catch(function () { spkBusy = false; });
}
// The line is drawn in a fixed 44 x 14 box and stretched to the size the stylesheet gives it, so it can never push a row wider.
// A row without data gets an empty box of the same size, which keeps the percentages in one column.
function sparkSvg(pts, up) {
  if (!Array.isArray(pts) || pts.length < 2) return '<i class="spk"></i>';
  var mn = Math.min.apply(null, pts), mx = Math.max.apply(null, pts), span = mx - mn || 1, n = pts.length - 1;
  var d = pts.map(function (v, i) { return (i ? "L" : "M") + (i / n * 44).toFixed(1) + " " + (13 - (v - mn) / span * 12).toFixed(1); }).join("");
  return '<svg class="spk ' + (up ? "u" : "d") + '" viewBox="0 0 44 14" preserveAspectRatio="none" aria-hidden="true"><path d="' + d + '"/></svg>';
}
// The preview (not signed in) draws a made-up line for each sample stock, always the same one for the same name
function sparkFake(id, c) {
  var seed = 7, out = [], v = 100, i;
  for (i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 2147483647;
  for (i = 0; i < 24; i++) { seed = (seed * 48271) % 2147483647; v += (seed / 2147483647 - 0.5) * 2 + (c || 0) / 24; out.push(v); }
  return out;
}
var SAMPLE_IDS = DATA.stocks.map(function (x) { return x.id; });
function importSymbols(list) {
  P.stocks = (P.stocks || []).filter(function (x) { return SAMPLE_IDS.indexOf(x.id) < 0 || list.indexOf(x.id) >= 0; });
  list.forEach(function (v) {
    if (!P.stocks.some(function (x) { return x.id === v; })) P.stocks.push({ id: v, name: "", p: null, c: null });
    delete P.hidden["s:" + v];
  });
  persist(); render(); fetchQuotes(true);
}
document.addEventListener("submit", function (e) {
  if (e.target.id === "impStock") {
    e.preventDefault();
    var list = $("impIn").value.split(/[,\n;]+/).map(function (x) { return x.trim().toUpperCase(); })
      .filter(function (x) { return x && x.indexOf("###") !== 0 && x.indexOf(" ") < 0; });
    if (list.length) importSymbols(list);
  }
  if (e.target.id === "linkStock") {
    e.preventDefault();
    if (!sb || !USER) { alert("Sign in first (Settings, then Account)."); return; }
    sb.functions.invoke("quotes", { body: { url: $("linkIn").value.trim() } }).then(function (r) {
      if (r.error || !r.data || r.data._err || !r.data.symbols) { alert("Could not read that watchlist: " + ((r.data && r.data._err) || (r.error && r.error.message) || "no data")); return; }
      importSymbols(r.data.symbols.map(function (x) { return x.toUpperCase(); }));
    });
  }
});

// ---- YouTube (Takeout subscriptions.csv + channel feeds through a Supabase function) ----
// The last videos are kept on this device, so a YouTube feed outage (it happens) doesn't empty the box
var YTV = load("sp_ytv", []), YTERR = "", YTDOWN = false, ytBusy = false;
function fetchYT() {
  if (!sb || !USER || !P.yt || !P.yt.ch || !P.yt.ch.length || ytBusy) return;
  var chs = P.yt.ch.filter(function (c) { return shown("y:" + c.t); })
    .sort(function (a, b) { return (P.fav["y:" + b.t] ? 1 : 0) - (P.fav["y:" + a.t] ? 1 : 0); }).slice(0, 60);
  ytBusy = true;
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { yt: chs.map(function (c) { return c.id; }) } }).then(function (r) {
    ytBusy = false;
    if (r.error || !r.data || r.data._err) YTERR = (r.error && r.error.message) || (r.data && r.data._err) || "no data";
    else {
      var vids = r.data.videos || [], failed = r.data.yt_failed || 0;
      YTERR = "";
      // nothing came back, or most channels failed: YouTube's feed is down, so keep what we had
      YTDOWN = !vids.length || failed > chs.length / 2;
      if (vids.length && (!YTDOWN || !YTV.length)) { YTV = vids; save("sp_ytv", vids); }
    }
    render();
  }).catch(function (e) { ytBusy = false; YTERR = String((e && e.message) || e); render(); });
}
function openYT(id) {
  openModal("YouTube", '<div class="tw"><iframe allow="autoplay; fullscreen; encrypted-media" allowfullscreen src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1"></iframe></div><p><a class="btn" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=' + encodeURIComponent(id) + '">Open on YouTube</a> <button data-a="dock" data-k="v:' + esc(id) + '">Dock on the left</button></p>');
}
document.addEventListener("change", function (e) {
  var ds = e.target.dataset && e.target.dataset.s;
  if (ds) {
    P.sort = P.sort || {};
    var q = ds.split(":");
    if (q[0] === "sort") P.sort[q[1]] = e.target.value; else if (q[0] === "tcat") P.tcat = e.target.value;
    else if (q[0] === "spsport" || q[0] === "spview") { P[q[0] === "spsport" ? "spSport" : "spView"] = e.target.value; persist(); render(); fetchSports(); return; }
    else if (q[0] === "rdsort") { P.rdSort = e.target.value; RD = []; persist(); render(); fetchReddit(true); return; }
    persist(); render(); return;
  }
  if (e.target.id !== "ytFile" || !e.target.files[0]) return;
  var fr = new FileReader();
  fr.onload = function () {
    var ch = [];
    String(fr.result).split(/\r?\n/).forEach(function (line) {
      var c = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
      if (c.length >= 3 && /^UC[\w-]{20,}$/.test(c[0].trim())) ch.push({ id: c[0].trim(), t: c.slice(2).join(",").trim().replace(/^"|"$/g, "").replace(/""/g, '"') });
    });
    if (!ch.length) { alert("No channels found. Use the subscriptions.csv file from Google Takeout."); return; }
    P.yt = { ch: ch }; persist(); render(); fetchYT();
    if (WIZ && $("wzPage")) wizRender();
  };
  fr.readAsText(e.target.files[0]);
});

// ---- Wallpaper follows your account ----
function syncWall(clear) {
  if (!sb || !USER) return;
  var w = null; try { w = localStorage.getItem("sp_wall"); } catch (e) {}
  if (clear || !w) sb.from("user_wallpaper").delete().eq("user_id", USER.id).then(function () {});
  else sb.from("user_wallpaper").upsert({ user_id: USER.id, data: w, updated_at: new Date().toISOString() }).then(function () {});
}
function loadWall(u) {
  sb.from("user_wallpaper").select("data").eq("user_id", u.id).maybeSingle().then(function (r) {
    if (r.data && r.data.data) { try { localStorage.setItem("sp_wall", r.data.data); } catch (e) {} applyWall(); }
    else { var w = null; try { w = localStorage.getItem("sp_wall"); } catch (e) {} if (w) syncWall(false); }
  });
}

// ---- News and Telegram (headlines through the Supabase "feeds" function) ----
var GN = "https://news.google.com/rss/search?hl=en-US&gl=US&ceid=US:en&q=site:";
function siteUrls(d) {
  return [GN + d + "+when:1d", "https://www.bing.com/news/search?format=rss&qft=sortbydate%3D%221%22&q=site%3A" + d, "https://news.search.yahoo.com/rss?p=site%3A" + d];
}
var NEWS_SRC = [
  { name: "Aftonbladet", urls: ["https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/", "https://news.google.com/rss/search?q=site:aftonbladet.se+when:1d&hl=sv&gl=SE&ceid=SE:sv"] },
  { name: "AP", urls: siteUrls("apnews.com") },
  { name: "Reuters", urls: siteUrls("reuters.com") }
];
var TG_SRC = ["ClashReport"];
var NEWS = [], TGP = [], NERR = "", NERRK = [], nBusy = false, NVIA = {}, NWHY = {}, FNVER = 0, NEWSV = 0, NLAST = 0;
// How many headlines and Telegram posts the boxes show (Settings > News, Telegram & Reddit). The button at the end of a
// list shows 20 more for now; for Telegram it also fetches older posts from the channels when the loaded ones run out.
var CNT_DEF = { news: 80, tg: 40 }, MORE = { news: 0, tg: 0 };
function cntOf(box) { var v = P.cnt && +P.cnt[box]; return (v >= 10 && v <= 200 ? v : CNT_DEF[box]) + MORE[box]; }
function moreBtn(box, label) { return '<button class="more" data-a="more" data-k="' + box + '">' + label + "</button>"; }
var TGX = [], TGEND = {}, tgOldBusy = false;   // older posts fetched so far; channels that have no older posts left
function tgPostId(u) { var m = /\/(\d+)$/.exec(u || ""); return m ? +m[1] : 0; }
// a refresh brings the newest posts; the older ones fetched earlier are kept under them
function tgMerge(fresh) {
  var have = {}, src = tgSrc();
  fresh.forEach(function (x) { have[x.u] = 1; });
  return fresh.concat(TGX.filter(function (x) { return !have[x.u] && src.indexOf(x.s) >= 0; })).sort(function (a, b) { return b.ts - a.ts; });
}
function tgVisible() { var mute = wordList(NW().mute); return TGP.filter(function (g) { return shown("g:" + g.s) && !(mute.length && hasWord(g.tx || g.t, mute)); }); }
function tgCanOlder() { return tgSrc().some(function (n) { return !TGEND[n] && shown("g:" + n) && TGP.some(function (x) { return x.s === n; }); }); }
function loadOlderTG() {
  if (!sb || !USER || tgOldBusy) return;
  var ask = tgSrc().filter(function (n) { return !TGEND[n] && shown("g:" + n); }).map(function (n) {
    var ids = TGP.filter(function (x) { return x.s === n; }).map(function (x) { return tgPostId(x.u); }).filter(Boolean);
    return ids.length ? { n: n, before: Math.min.apply(null, ids) } : null;
  }).filter(Boolean);
  if (!ask.length) return;
  tgOldBusy = true; render();
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { tgOld: ask } }).then(function (r) {
    tgOldBusy = false;
    var got = r.data && r.data.tgOld, have = {};
    TGP.forEach(function (x) { have[x.u] = 1; });
    var add = unentAll(Array.isArray(got) ? got : [], ["t", "tx"]).filter(function (x) { return x.u && !have[x.u]; });
    ask.forEach(function (a) { if (!add.some(function (x) { return x.s === a.n; })) TGEND[a.n] = 1; });   // nothing older came back for this channel
    TGX = TGX.concat(add).slice(-600);
    TGP = TGP.concat(add).sort(function (a, b) { return b.ts - a.ts; });
    render(); tgTopUp();
  }).catch(function () { tgOldBusy = false; render(); });
}
// fetch older posts until the box has as many as it is set to show (or the channels have no more)
function tgTopUp() { if (!tgOldBusy && tgVisible().length < cntOf("tg") && tgCanOlder()) loadOlderTG(); }
// Telegram on its own, every minute: it is one light request, so posts show up quickly between the full news refreshes
var tgBusy = false;
function fetchTG() {
  if (!sb || !USER || tgBusy || nBusy || !tgSrc().length) return;
  tgBusy = true;
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { tg: tgSrc() } }).then(function (r) {
    tgBusy = false;
    if (r.error || !r.data || !r.data.tg || nBusy) return;
    TGP = unentAll(r.data.tg, ["t", "tx"]); stampFirst(TGP, "tg"); TGP = tgMerge(TGP);
    newsAlerts(); render(); tgTopUp();
  }).catch(function () { tgBusy = false; });
}
function fetchNews() {
  if (!sb || !USER || nBusy) return;
  nBusy = true; render();
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { news: newsSrc().map(function (x) { return { id: x.name, urls: x.urls }; }), tg: tgSrc() } }).then(function (r) {
    nBusy = false;
    if (r.error || !r.data || r.data._err) { NERR = (r.error && r.error.message) || (r.data && r.data._err) || "no data"; NERRK = []; }
    else {
      NEWSALL = unentAll(r.data.news, ["t", "d"]); NEWS = langFilter(NEWSALL.slice()); TGP = unentAll(r.data.tg, ["t", "tx"]); NEWSV++; NLAST = Date.now();
      stampFirst(NEWS, "news"); stampFirst(TGP, "tg"); TGP = tgMerge(TGP);
      setTimeout(tgTopUp, 0);
      var ne = r.data.news_err || {};
      NVIA = r.data.news_via || {}; NWHY = r.data.news_why || {}; FNVER = r.data.ver || 0;
      NERRK = Object.keys(ne);
      NERR = NERRK.map(function (k) { return k + " (" + ne[k] + ")"; }).join(" | ");
      newsAlerts(); bigNews();
      setTimeout(maybeBrief, 2500);
    }
    renderSources(); renderLangs(); render();
  }).catch(function (e) { nBusy = false; NERR = String((e && e.message) || e); render(); });
}

// ---- What's new since you last looked, what you've opened, and word filters ----
// Each box (news, tg, rd) has its own "seen up to here" time, so clearing one does not clear the others
var NSEEN = load("sp_nseen", 0), READ = load("sp_nread", {}), NQ = "", NFILT = false;
if (!NSEEN || typeof NSEEN !== "object") { var ns0 = +NSEEN || Date.now(); NSEEN = { news: ns0, tg: ns0, rd: ns0 }; save("sp_nseen", NSEEN); }
function isNewTs(ts, box) { return ts > (NSEEN[box] || 0); }
// "New" goes by when this page first SAW an item, not when it was published: a story that shows up late
// (published before you last looked, but only now in the feed) still counts as new.
var FIRST = load("sp_first", { _i: {} });
if (!FIRST._i) FIRST._i = {};
function stampFirst(list, box) {
  var now = Date.now(), init = !FIRST._i[box], changed = init;
  FIRST._i[box] = 1;
  (list || []).forEach(function (x) { if (x.u && !FIRST[x.u]) { FIRST[x.u] = init ? x.ts : now; changed = true; } });
  if (!changed) return;
  var k = Object.keys(FIRST);
  if (k.length > 2500) k.filter(function (u) { return u !== "_i"; }).sort(function (a, b) { return FIRST[a] - FIRST[b]; }).slice(0, k.length - 2000).forEach(function (u) { delete FIRST[u]; });
  save("sp_first", FIRST);
}
function isNewItem(x, box) { return PREVIEW ? !!x.nw : isNewTs(FIRST[x.u] || x.ts, box); }
function markSeen(box, t) {
  (box ? [box] : ["news", "tg", "rd"]).forEach(function (b) { NSEEN[b] = t || Date.now(); });
  save("sp_nseen", NSEEN);
}
function markReadUrl(u) {
  if (!u) return;
  READ[u] = Date.now();
  var k = Object.keys(READ);
  if (k.length > 400) k.sort(function (a, b) { return READ[a] - READ[b]; }).slice(0, k.length - 400).forEach(function (x) { delete READ[x]; });
  save("sp_nread", READ);
}
function NW() { return P.nwords || {}; }
function wordList(s) { return String(s || "").toLowerCase().split(",").map(function (x) { return x.trim(); }).filter(Boolean); }
function hasWord(t, list) { t = String(t || "").toLowerCase(); return list.some(function (w) { return t.indexOf(w) >= 0; }); }
function bucket(ts) {
  var d = Date.now() - ts;
  if (d < 3600000) return "Last hour";
  if (d < 21600000) return "Last 6 hours";
  var day = function (t) { return new Date(t).toLocaleDateString("en-CA", { timeZone: TZ }); };
  return day(ts) === day(Date.now()) ? "Earlier today" : day(ts) === day(Date.now() - 86400000) ? "Yesterday" : "Older";
}
// Grouping compares every headline with every other one, so only redo it when the news or the filters change
var NGKEY = "", NGMEMO = [];
function newsGroups() {
  var mute = wordList(NW().mute), hi = wordList(NW().hi);
  var key = NEWSV + "|" + newsSrc().map(function (x) { return (P.hidden["n:" + x.name] ? "h" : "") + (P.fav["n:" + x.name] ? "f" : ""); }).join(",") + "|" + mute.join(",") + "|" + hi.join(",") + "|" + Math.floor(Date.now() / 600000);
  if (key === NGKEY) return NGMEMO;
  var now = Date.now();
  var gs = groupNews(NEWS.filter(function (n) { return shown("n:" + n.s) && !(mute.length && hasWord(n.t, mute)); }));
  gs.forEach(function (g) {
    g.fav = g.some(function (n) { return P.fav["n:" + n.s] && now - n.ts < 21600000; });
    g.hi = hi.length > 0 && g.some(function (n) { return hasWord(n.t, hi); });
  });
  // newest story first, by when each story was FIRST reported: a later article about a story you already have joins
  // its row where it is, and does not push the story back to the top
  gs.sort(function (a, b) { return (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || (b.t0 || b[0].ts) - (a.t0 || a[0].ts); });
  NGKEY = key; NGMEMO = gs;
  return gs;
}
function newsAlerts() {
  var w = NW(), hi = wordList(w.hi);
  if (!hi.length) return;
  var last = load("sp_nalert", 0), top = last, sent = {}, n = 0;
  if (!last) { save("sp_nalert", Date.now()); return; }
  NEWS.concat(TGP).sort(function (a, b) { return b.ts - a.ts; }).forEach(function (x) {
    if (x.ts <= last || !hasWord(x.tx || x.t, hi)) return;
    if (x.ts > top) top = x.ts;
    var k = String(x.t).toLowerCase().slice(0, 60);
    if (sent[k] || n >= 3) return;
    sent[k] = 1; n++;
    var isTg = TGP.indexOf(x) >= 0;
    toast("words", x.s, hd(x.t, 140), { a: isTg ? "tg" : "news", k: x.u });
  });
  save("sp_nalert", top);
}
function notifyTxt(title, body, onclick) {
  try {
    if (!window.Notification || Notification.permission !== "granted") return;
    var n = new Notification(title, { body: body, icon: "favicon.png", tag: title + "|" + body });
    n.onclick = function () { window.focus(); n.close(); if (onclick) onclick(); };
  } catch (e) {}
}
function askNotify() { try { if (window.Notification && Notification.permission === "default") Notification.requestPermission(); } catch (e) {} }

// ---- Which language a headline is in (plain word lists, no AI) ----
// Used for "Languages shown" in Settings and to match the same story across Swedish and English.
// Other alphabets are told apart by their letters. For the Latin-alphabet languages each one has a list of its small
// everyday words; a word that several languages share counts less. Too little to go on = "" (unknown).
var LANGS = [["en", "English"], ["sv", "Swedish"], ["nb", "Norwegian / Danish"], ["fi", "Finnish"], ["et", "Estonian"], ["de", "German"], ["fr", "French"], ["es", "Spanish"], ["it", "Italian"], ["pt", "Portuguese"], ["nl", "Dutch"], ["pl", "Polish"], ["tr", "Turkish"], ["ru", "Russian / Cyrillic"], ["ar", "Arabic / Hebrew"], ["zh", "Chinese / Japanese / Korean"], ["el", "Greek"]];
var LANG_W = {
  en: "the of and to in for on with at from by as is are was were after over says say said new not his her their has have had will be been it its that this more than who what how why amid into out up about against before between could would should while where which when they them our your but can may if all one two first year years people court killed dead dies government talks leader world says does face stars",
  sv: "och i att det som en på är av för med till den har de inte om ett han hon efter vid från mot under kan ska blir blev nu här där sig sin sitt sina också över mellan utan när hur varför fler än säger ny nya nytt år döda död polisen kriget regeringen så var vill får fick ska kommer många flera inför trots enligt mer igen",
  nb: "og i å at det som en på er av af for med til den har de ikke om et han hun etter efter ved fra mot mod under kan skal blir ble blev nå nu her der seg sig sin også over mellom mellem uten uden når hvordan hvorfor flere enn end sier siger ny nye år døde død politiet krigen regjeringen regeringen så var vil får fikk",
  fi: "ja on ei että se oli hän mutta kun niin kuin myös tai sekä jo vain ovat olla mukaan jälkeen kanssa tämä ovat sen sitä hänen nyt vuoden uusi kertoo poliisi",
  et: "ja on ei et see oli ta aga kui nii ka või ning juba ainult olid olla järgi pärast koos mis kes selle tema nüüd aasta uus ütles politsei eesti",
  de: "der die das und in zu den von mit für auf ist im dem nicht ein eine einen als auch nach bei über wird sich aus noch wie vor zum zur hat sind des dass oder mehr gegen neue neuer warum unter kommt wurde werden ohne durch seit wegen",
  fr: "le la les de des du et à en un une pour dans sur au aux est que qui par plus avec ce se son sa ses ne pas après contre sont ont été cette ces leur mais ou où comment pourquoi",
  es: "el la los las de del y en un una para por con que se su al es más tras sobre como entre sin ya fue ha han son sus pero qué cómo contra desde hasta",
  it: "il lo la i gli le di del della dei e in un una per con che non si da al è più dopo sono ha nel alla dal delle degli ma come perché contro",
  pt: "o a os as de do da e em um uma para por com que não se na no é mais após dos das ao foi são tem mas como contra entre sobre",
  nl: "de het een en van in op te voor met is dat die niet aan zijn bij ook als uit naar om door over na wordt heeft maar meer tegen nieuwe",
  pl: "w i z na do nie się że to jest po o za od jak ale przez dla co są był tym tego oraz już czy",
  tr: "ve bir bu için ile de da ne gibi daha çok en olarak sonra kadar oldu dedi yeni"
};
var LANG_IX = {};
Object.keys(LANG_W).forEach(function (l) { LANG_W[l].split(" ").forEach(function (w) { if (w.length > 1) (LANG_IX[w] = LANG_IX[w] || []).push(l); }); });   // one-letter words say nothing
var LANG_CH = [[/[åÅ]/, ["sv", "nb"]], [/[äöÄÖ]/, ["sv", "fi", "et", "de"]], [/[æøÆØ]/, ["nb"]], [/ß/, ["de"]], [/[ñ¿¡]/, ["es"]], [/[ãÃ]/, ["pt"]], [/[õÕ]/, ["et", "pt"]], [/[łżśćńęąŁŻŚ]/, ["pl"]], [/[ğşıİĞŞ]/, ["tr"]], [/[èêùûœ]/, ["fr"]], [/[ìò]/, ["it"]]];
var LANGSURE = 0;   // how sure the last langOf() was: under 1.6 = a guess from one or two small words
function langOf(t) {
  t = String(t || ""); LANGSURE = 9;
  var all = (t.match(/\p{L}/gu) || []).length || 1;
  var cnt = function (re) { return (t.match(re) || []).length / all; };
  if (cnt(/[Ѐ-ӿ]/g) > 0.3) return "ru";
  if (cnt(/[؀-ۿ֐-׿]/g) > 0.3) return "ar";
  if (cnt(/[぀-ヿ一-鿿가-힯]/g) > 0.2) return "zh";
  if (cnt(/[Ͱ-Ͽ]/g) > 0.3) return "el";
  var sc = {}, add = function (l, v) { sc[l] = (sc[l] || 0) + v; };
  t.toLowerCase().split(/[^\p{L}]+/u).forEach(function (w) { var ls = LANG_IX[w]; if (ls) ls.forEach(function (l) { add(l, 1 / ls.length); }); });
  LANG_CH.forEach(function (c) { if (c[0].test(t)) c[1].forEach(function (l) { add(l, 0.6 / c[1].length); }); });
  var top = Object.keys(sc).sort(function (a, b) { return sc[b] - sc[a]; });
  LANGSURE = top.length ? sc[top[0]] : 0;
  if (!top.length || sc[top[0]] < 0.9) return "";
  return top.length > 1 && sc[top[0]] < sc[top[1]] * 1.25 ? "" : top[0];
}
// Every headline gets its language once. A headline too short to tell takes the language most of its source writes in.
function tagLangs(items) {
  var per = {};
  items.forEach(function (x) { if (x.lg == null) { x.lg = langOf(x.t); x.lgs = LANGSURE; } if (x.lg) { per[x.s] = per[x.s] || {}; per[x.s][x.lg] = (per[x.s][x.lg] || 0) + 1; } });
  // A source that writes (nearly) everything in one language: its short headlines, and the ones that were only a
  // guess, take that language. A headline that is clearly in another language keeps it (a mostly-English source
  // that now and then carries a Spanish or German headline).
  items.forEach(function (x) {
    if (!per[x.s]) return;
    var k = Object.keys(per[x.s]).sort(function (a, b) { return per[x.s][b] - per[x.s][a]; }), tot = k.reduce(function (n, l) { return n + per[x.s][l]; }, 0), share = per[x.s][k[0]] / tot;
    if ((!x.lg && share >= 0.7) || (tot >= 8 && share >= 0.85 && x.lgs < 1.6)) x.lg = k[0];
  });
  return items;
}
// "Languages shown": nothing chosen = everything. A headline whose language cannot be told is kept.
var NEWSALL = [], LANGCUT = 0;
function langList() { return Array.isArray(P.langs) ? P.langs.filter(function (l) { return LANGS.some(function (x) { return x[0] === l; }); }) : []; }
function langFilter(items) {
  var ok = langList();
  tagLangs(items);
  LANGCUT = 0;
  if (!ok.length) return items;
  return items.filter(function (x) { var keep = !x.lg || ok.indexOf(x.lg) >= 0; if (!keep) LANGCUT++; return keep; });
}
function renderLangs() {
  var ok = langList();
  $("langList").innerHTML = LANGS.map(function (l) { return '<label class="chip"><input type="checkbox" data-a="langtoggle" data-k="' + l[0] + '"' + (ok.indexOf(l[0]) >= 0 ? " checked" : "") + "> " + l[1] + "</label>"; }).join("");
  $("langNote").textContent = !ok.length ? "Nothing ticked: every language is shown." : LANGCUT ? LANGCUT + " headline" + (LANGCUT > 1 ? "s" : "") + " in other languages hidden right now." : "No headlines in other languages right now.";
}
function setLang(code, on) {
  var ok = langList().filter(function (l) { return l !== code; });
  if (on) ok.push(code);
  if (ok.length) P.langs = ok; else delete P.langs;
  persist();
  NEWS = langFilter(NEWSALL.slice()); NEWSV++;
  renderLangs(); render();
}

// ---- Same story from different sources (plain word matching, no AI) ----
var NG = [];
var STOP = {};
("that this with from have will been were about after their there which would could says said into over more than what when they your also just amid " +
 "watch live video update updates latest breaking news analysis explained " +
 "och att som det för med har inte den till att ett var sig från vid men han hon eller kan ska efter under över mot mellan sedan blir blev finns fick " +
 "just nu senaste uppgifter här därför detta dessa denna flera minst källor uppger enligt många sources least several").split(" ").forEach(function (w) { STOP[w] = 1; });
// Countries, and people who are in the news every day: they are words two headlines can share, but they do not
// say WHICH story it is, so they never count as a story's "name" (two different stories about Taiwan and China stay apart).
var WEAK = {};
("russia china ukraine germany france britain sweden norway denmark finland estonia latvia lithuania poland spain italy greece turkey india pakistan japan korea taiwan israel iran iraq syria egypt saudi " +
 "usa europe africa asia canada mexico brazil australia netherlands belgium hungary austria switzerland ireland scotland england wales lebanon yemen qatar gaza palest afghan " +
 "trump biden putin zelensk musk netanyahu macron starmer merz xi modi erdogan kreml kremlin white house nato un eu us uk ").split(" ").forEach(function (w) { if (w) WEAK[w] = 1; });
// Swedish words (and number words in both languages) written the English way, so "Tolv döda i attack mot flygplats"
// and "Twelve killed in airport attack" share words. Names and numbers match across languages by themselves.
var XL = { sv: {}, en: {} };
[["sv", "ryssland:russia rysk:russia ryska:russia ryske:russia tyskland:germany tysk:germany tyska:germany frankrike:france fransk:france franska:france kina:china kinesisk:china kinesiska:china " +
  "storbritannien:britain brittisk:britain brittiska:britain sverige:sweden svensk:sweden svenska:sweden norge:norway norsk:norway danmark:denmark dansk:denmark finsk:finland " +
  "estland:estonia estnisk:estonia polen:poland polsk:poland spanien:spain spansk:spain italien:italy italiensk:italy grekland:greece turkiet:turkey turkisk:turkey indien:india indisk:india " +
  "irak:iraq syrien:syria egypten:egypt etiopien:ethiopia ukraina:ukraine ukrainsk:ukraine ukrainska:ukraine israelisk:israel israeliska:israel iransk:iran iranska:iran " +
  "saudiarabien:saudi nordkorea:korea sydkorea:korea europa:europe europeisk:europe europeiska:europe amerikansk:usa amerikanska:usa usa:usa fn:un " +
  "död:kill döda:kill dödad:kill dödade:kill dödats:kill dödas:kill dör:kill avled:kill skadad:injure skadade:injure skadats:injure skadas:injure " +
  "attack:attack attacken:attack anfall:attack angrepp:attack flygplats:airport flygplatsen:airport valet:election nyval:election president:president presidenten:president " +
  "krig:war kriget:war jordbävning:earthquake jordskalv:earthquake orkan:hurricane orkanen:hurricane storm:storm stormen:storm översvämning:flood översvämningar:flood " +
  "brand:fire branden:fire skogsbrand:wildfire explosion:explosion explosionen:explosion skjutning:shooting skjutningen:shooting gripen:arrest gripna:arrest grips:arrest greps:arrest " +
  "protest:protest protester:protest demonstration:protest demonstranter:protest eldupphör:ceasefire vapenvila:ceasefire sanktioner:sanctions regering:government regeringen:government minister:minister ministern:minister " +
  "sjukhus:hospital sjukhuset:hospital skola:school skolan:school skoldåd:school avrättning:execution avrättningen:execution mord:murder mordet:murder polis:police polisen:police domstol:court domstolen:court domen:verdict åtal:charge åtalas:charge fängelse:prison gisslan:hostage " +
  "fredsavtal:peace avtal:deal avtalet:deal toppmöte:summit toppmötet:summit flyktingar:refugee soldater:soldier trupper:soldier " +
  "drönare:drone robotar:missile kärnvapen:nuclear olja:oil tullar:tariff ränta:rate räntan:rate inflation:inflation " +
  "två:2 tre:3 fyra:4 fem:5 sju:7 åtta:8 nio:9 tio:10 elva:11 tolv:12 tjugo:20 hundra:100 hundratals:100 tusen:1000 tusentals:1000"],
 ["en", "british:britain swedish:sweden estonian:estonia ukrainian:ukraine russian:russia german:germany french:france chinese:china israeli:israel iranian:iran european:europe american:usa america:usa " +
  "dead:kill dies:kill died:kill death:kill deaths:kill killing:kill killed:kill kills:kill injured:injure wounded:injure hurt:injure " +
  "attack:attack attacks:attack elections:election election:election vote:election president:president quake:earthquake floods:flood flooding:flood blast:explosion " +
  "arrested:arrest arrests:arrest detained:arrest detains:arrest protest:protest protests:protest protesters:protest truce:ceasefire jail:prison jailed:prison hostages:hostage " +
  "agreement:deal refugees:refugee soldiers:soldier troops:soldier drones:drone missiles:missile tariffs:tariff " +
  "two:2 three:3 four:4 five:5 seven:7 eight:8 nine:9 ten:10 eleven:11 twelve:12 twenty:20 hundred:100 hundreds:100 thousand:1000 thousands:1000"]
].forEach(function (d) { d[1].split(" ").forEach(function (p) { var kv = p.split(":"); XL[d[0]][kv[0]] = kv[1]; }); });
function fold(w) { return w.normalize("NFD").replace(/[̀-ͯ]/g, ""); }
// Words that say what KIND of thing happened. Sharing one of these counts for more than sharing an ordinary word.
var EVW = {};
"kill injure attack earthquake hurricane storm flood fire wildfire explosion shooting arrest protest ceasefire election verdict charge hostage summit sanctions".split(" ").forEach(function (w) { EVW[w] = 1; });
var XLSV = Object.keys(XL.sv).filter(function (k) { return k.length >= 5; });
// One headline as a list of words to compare: lower case, small words dropped, endings cut ("attacks" / "attacken" -> "attack"),
// Swedish written the English way where the list above knows the word, Swedish compounds split ("flygplatsattack" ->
// airport + attack). Each word has a kind: n = a name, p = a country or an everyday name, e = an event word, d = a number, "" = ordinary.
function tokz(t, lg) {
  var s = String(t).replace(/\s[-|–—]\s[^-|–—]{2,40}$/, "").replace(/[’']s\b/g, ""), words = s.split(/[^\p{L}\p{N}]+/u).filter(Boolean), out = [], seen = {};
  var caps = words.filter(function (w, i) { return i > 0 && /^\p{Lu}/u.test(w); }).length, titleCase = words.length >= 5 && caps / (words.length - 1) > 0.65;
  var dict = XL[lg === "sv" ? "sv" : "en"];
  var push = function (st, kind) { if (st && !seen[st]) { seen[st] = 1; out.push({ w: st, k: kind }); } };
  words.forEach(function (w, i) {
    var lw = w.toLowerCase(), num = /^\d+$/.test(w), acr = /^\p{Lu}{2,5}$/u.test(w), x = dict[lw];
    if (!x && !num && !acr && (lw.length < 4 || STOP[lw])) return;
    if (num) { if (w.length <= 4 && !/^(19|20)\d\d$/.test(w)) push(w, "d"); return; }
    if (x) { push(x, /^\d+$/.test(x) ? "d" : EVW[x] ? "e" : WEAK[x] ? "p" : ""); return; }
    // a capital letter makes a name, except on the first word, which always has one: that one is a name when the
    // second word has a capital too ("Christa Pike ..."); otherwise it is marked "?" and settled later (see groupNews)
    var first = i === 0 && !titleCase && /^\p{Lu}/u.test(w), name = acr || (!titleCase && i > 0 && /^\p{Lu}/u.test(w)) || (first && words.length > 1 && /^\p{Lu}\p{Ll}/u.test(words[1]) && !STOP[words[1].toLowerCase()]), st = fold(lw);
    if (lg === "sv" && !name && lw.length >= 9) {
      // a compound: take the parts the word list knows, and what is left of it
      var parts = XLSV.filter(function (k) { return k.length < lw.length && (lw.indexOf(k) === 0 || lw.slice(-k.length) === k); });
      if (parts.length) {
        var rest = lw;
        parts.forEach(function (k) { var m = XL.sv[k]; push(m, EVW[m] ? "e" : WEAK[m] ? "p" : ""); rest = rest.replace(k, ""); });
        if (rest.length >= 4) push(fold(rest), "");
        return;
      }
    }
    if (lg === "sv") st = st.replace(/(arna|erna|orna|ande|ade|ar|er|or|en|et|na|s)$/, function (m) { return st.length - m.length >= 4 ? "" : m; });
    else st = st.replace(/(ing|ed|es|s)$/, function (m) { return st.length - m.length >= 4 ? "" : m; });
    push(st, name ? (WEAK[st] || WEAK[st.slice(0, 7)] || WEAK[st.slice(0, 6)] ? "p" : "n") : first ? "?" : "");
  });
  return out;
}
// "zelensky" / "zelenskyy", "postpone" / "postpon", "ukraine" / "ukraina": the same word with another ending
function tokSame(a, b) {
  if (a === b) return true;
  var n = Math.min(a.length, b.length);
  if (n < 5) return false;
  var i = 0; while (i < n && a.charCodeAt(i) === b.charCodeAt(i)) i++;
  return i >= Math.max(5, n - 1);
}
function outlet(name) { return String(name).toLowerCase().replace(/^the\s+/, "").split(/\s+/)[0]; }   // "BBC" and "BBC World" are one outlet
function artKey(x) { return String(x.u || "").replace(/[?#].*$/, "").replace(/\/+$/, "").replace(/^https?:\/\/(www\.)?/, ""); }
// How alike two headlines are, in points: a shared name that belongs to one story (Riyadh, Isaias) 3, a shared
// event word (killed, earthquake) 2, a shared country, everyday name (Trump) or number 1.5, any other shared word 1.
// Two headlines that both give numbers but share none lose 1.5 ("12 killed" against "20 killed").
// The same story = at least 4.5 points from at least two shared words, one of them more than an ordinary word,
// covering at least a third of the shorter headline.
var KPTS = { n: 3, e: 2, p: 1.5, d: 1.5, "": 1, "?": 1 };
function likeness(A, B) {
  var sh = 0, pts = 0, special = 0, numA = 0, numB = 0, numSh = 0, used = {};
  for (var j0 = 0; j0 < B.length; j0++) if (B[j0].k === "d") numB++;
  for (var i = 0; i < A.length; i++) {
    if (A[i].k === "d") numA++;
    for (var j = 0; j < B.length; j++) {
      if (used[j] || !tokSame(A[i].w, B[j].w)) continue;
      used[j] = 1; sh++;
      var k = A[i].k === "n" || B[j].k === "n" ? (A[i].k === "p" || B[j].k === "p" ? "p" : "n") : A[i].k || B[j].k;
      pts += KPTS[k]; if (k) special++;
      if (k === "d") numSh++;
      break;
    }
  }
  if (numA && numB && !numSh) pts -= 1.5;
  var cov = sh / (Math.min(A.length, B.length) || 1);
  // ...or, for short headlines: three shared words that are three quarters of the shorter one ("Nytt skoldåd i Polen")
  return { sh: sh, pts: pts, cov: cov, ok: sh >= 2 && special >= 1 && ((pts >= 4.5 && cov >= 0.34) || (sh >= 3 && cov >= 0.75 && pts >= 3.5)) };
}
function groupNews(items) {
  // 1) the very same article from two feeds (same address, or word for word the same headline) is one article
  var seenU = {}, seenT = {};
  items = items.filter(function (n) {
    var ku = artKey(n), kt = String(n.t).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    if ((ku && seenU[ku]) || (kt.length > 20 && seenT[kt])) return false;
    seenU[ku] = 1; seenT[kt] = 1;
    return true;
  }).sort(function (a, b) { return a.ts - b.ts; });
  var tk = items.map(function (n) { return tokz(n.t, n.lg); });
  // 2) a first word is a name when some other headline has the same word with a capital in mid-sentence
  var known = {};
  tk.forEach(function (list) { list.forEach(function (t) { if (t.k === "n" || t.k === "p") known[t.w] = t.k; }); });
  tk.forEach(function (list) { list.forEach(function (t) { if (t.k === "?") t.k = known[t.w] || ""; }); });
  //    names one source uses again and again are not story names
  var use = {};
  items.forEach(function (n, i) { tk[i].forEach(function (t) { if (t.k !== "n") return; var k = t.w.slice(0, 6); use[k] = use[k] || {}; use[k][n.s] = (use[k][n.s] || 0) + 1; }); });
  tk.forEach(function (list) {
    list.forEach(function (t) {
      if (t.k !== "n") return;
      var u = use[t.w.slice(0, 6)], ks = Object.keys(u);
      if (ks.some(function (s) { return u[s] >= 4; }) || ks.filter(function (s) { return u[s] >= 2; }).length >= 3) t.k = "p";
    });
  });
  // 3) oldest first, each headline joins the story it fits best, or starts a new one. A story stays open for 18 hours
  //    after its first report. To join a story that already has three or more articles it must fit at least two of
  //    them, and at least 40% of them (otherwise one loosely related headline could chain unrelated stories together).
  var cl = [];
  items.forEach(function (n, i) {
    var best = null, bestScore = 0;
    for (var c = cl.length - 1; c >= 0; c--) {
      var g = cl[c];
      if (n.ts - g.t0 > 64800000) continue;
      var hits = 0, top = 0;
      for (var m = 0; m < g.ix.length; m++) {
        var k = g.ix[m], L = likeness(tk[i], tk[k]);
        // the same outlet again: only when it is clearly the same story retold
        if (L.ok && (outlet(items[k].s) !== outlet(n.s) || (L.sh >= 3 && L.cov >= 0.6))) { hits++; if (L.pts > top) top = L.pts; }
      }
      if (hits >= (g.ix.length <= 2 ? 1 : Math.max(2, Math.ceil(g.ix.length * 0.4))) && top > bestScore) { best = g; bestScore = top; }
    }
    if (best) best.ix.push(i); else cl.push({ t0: n.ts, ix: [i] });
  });
  // 4) two stories that turn out to be one (each grew from a different first report): joined when at least two
  //    articles, and at least half, of the smaller one fit an article of the other
  for (var a = 0; a < cl.length; a++) for (var b = a + 1; b < cl.length; b++) {
    var A = cl[a], B = cl[b];
    if (!A.ix.length || !B.ix.length || Math.abs(A.t0 - B.t0) > 64800000) continue;
    if (A.ix.length < 2 || B.ix.length < 2) continue;
    var S = A.ix.length <= B.ix.length ? A : B, G = S === A ? B : A, fit = 0;
    for (var x = 0; x < S.ix.length; x++) for (var y = 0; y < G.ix.length; y++) {
      var p = S.ix[x], q = G.ix[y], L2 = likeness(tk[p], tk[q]);
      if (L2.ok && (outlet(items[p].s) !== outlet(items[q].s) || (L2.sh >= 3 && L2.cov >= 0.6))) { fit++; break; }
    }
    if (fit >= Math.max(2, Math.ceil(S.ix.length / 2))) { A.ix = A.ix.concat(B.ix); A.t0 = Math.min(A.t0, B.t0); B.ix = []; }
  }
  cl = cl.filter(function (g) { return g.ix.length; });
  return cl.map(function (g) {
    var list = g.ix.map(function (k) { return items[k]; }).sort(function (a, b) { return b.ts - a.ts; }), seen = {};
    list.t0 = g.t0;
    list.src = list.map(function (x) { return x.s; }).filter(function (s) { var o = outlet(s); if (seen[o]) return false; seen[o] = 1; return true; });   // each outlet once
    return list;
  });
}

// ---- Your own sources (Settings) ----
function newsSrc() { return P.news || NEWS_SRC; }
function tgSrc() { return P.tg || TG_SRC; }
function ownSrc() {
  if (!P.news) P.news = JSON.parse(JSON.stringify(NEWS_SRC));
  if (!P.tg) P.tg = TG_SRC.slice();
}
function srcMsg(t) { $("srcMsg").textContent = t || ""; WIZMSG = t || ""; }
function feedUrls(u) {
  if (/^https?:\/\//i.test(u)) {
    try { var h = new URL(u); return h.pathname.length > 1 || h.search ? [u] : siteUrls(h.hostname.replace(/^www\./, "")); } catch (e) { return null; }
  }
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(u) ? siteUrls(u.toLowerCase().replace(/^www\./, "")) : null;
}
function addNewsSrc(name, addr) {
  var urls = feedUrls(addr);
  if (!urls) { srcMsg("Could not use that address. Enter a feed address (starting with http:// or https://) or a website like reuters.com"); return false; }
  ownSrc();
  if (P.news.length >= 15) { srcMsg("That is the maximum (15 news sources)."); return false; }
  var nm = name || addr.replace(/^https?:\/\//i, "").replace(/^www\./, "").split("/")[0];
  if (P.news.some(function (x) { return x.name.toLowerCase() === nm.toLowerCase(); })) { srcMsg("You already have a source called " + nm + "."); return false; }
  P.news.push({ name: nm, urls: urls });
  srcMsg("Added " + nm + "."); return true;
}
function addTgSrc(v) {
  var m = v.trim().match(/(?:t\.me\/(?:s\/)?)?@?([A-Za-z0-9_]{4,32})\/?$/);
  if (!m) { srcMsg("Enter a channel name like ClashReport, or a t.me link."); return false; }
  ownSrc();
  if (P.tg.length >= 8) { srcMsg("That is the maximum (8 channels)."); return false; }
  if (P.tg.some(function (x) { return x.toLowerCase() === m[1].toLowerCase(); })) { srcMsg("Already added."); return false; }
  P.tg.push(m[1]); srcMsg("Added " + m[1] + "."); return true;
}
function delSrc(k) {
  var p = k.split(":"), i = +p[1];
  ownSrc();
  if (p[0] === "r") { P.rd = rdSrc().slice(); P.rd.splice(i, 1); rdChanged(); return; }
  if (p[0] === "n") P.news.splice(i, 1); else P.tg.splice(i, 1);
  srcChanged();
}

// ---- Reddit (through the feeds function: Reddit does not let a web page read it directly) ----
var RD_SRC = ["worldnews", "technology"], RD = [], RDERR = "", rBusy = false;
function rdSrc() { return P.rd || RD_SRC; }
// The same sort orders as on reddit.com ("top" = top of the last 24 hours)
var RD_SORTS = ["best", "hot", "new", "top", "rising"];
function rdSort() { return RD_SORTS.indexOf(P.rdSort) >= 0 ? P.rdSort : "hot"; }
function rdChanged() { persist(); RD = []; RDERR = ""; renderSources(); render(); fetchReddit(true); }
function addRdSrc(v) {
  var m = v.trim().match(/(?:^|\/)(?:r\/)?([A-Za-z0-9_]{2,21})\/?$/);
  if (!m) { srcMsg("Enter a subreddit name like worldnews, or a reddit.com/r/… link."); return false; }
  P.rd = rdSrc().slice();
  if (P.rd.length >= 12) { srcMsg("That is the maximum (12 subreddits)."); return false; }
  if (P.rd.some(function (x) { return x.toLowerCase() === m[1].toLowerCase(); })) { srcMsg("Already added."); return false; }
  P.rd.push(m[1]); srcMsg("Added r/" + m[1] + "."); return true;
}
function fetchReddit() {
  if (!sb || !USER || rBusy || boxOff("reddit")) return;
  var subs = rdSrc();
  if (!subs.length) { RD = []; return; }
  rBusy = true;
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { reddit: { subs: subs, sort: rdSort() } } }).then(function (r) {
    rBusy = false;
    var v = r.data && r.data.reddit;
    if (r.error) RDERR = r.error.message;
    else if (!v) RDERR = "it needs the updated feeds function (redeploy super-function in Supabase)";
    else { RDERR = v.err || ""; if (v.items && (v.items.length || !v.err)) { RD = unentAll(v.items, ["t", "d"]); stampFirst(RD, "rd"); } }
    render();
  }).catch(function (e) { rBusy = false; RDERR = String((e && e.message) || e); render(); });
}
function openReddit(u) {
  var x = RD.filter(function (p) { return p.u === u; })[0];
  if (!x) return;
  markReadUrl(u);
  var img = safeUrl(x.img);
  openModal("r/" + x.s, '<h2 class="mh">' + esc(x.t) + '</h2><div class="mut">r/' + esc(x.s) + (x.by ? " · " + esc(x.by) : "") + " · " + when(x.ts) + "</div>" +
    (img ? '<img class="mimg rdimg" referrerpolicy="no-referrer" alt="" data-rm="1" src="' + esc(img) + '">' : "") + (x.d ? '<p class="nt">' + esc(x.d) + "</p>" : "") +
    '<p class="tools">' + linkBtn(x.u, "Open comments on Reddit") + (x.x ? linkBtn(x.x, "Open the link") : "") + "</p>" + (PREVIEW ? previewNote() : rdComN() ? '<div id="rdCom"><p class="mut sn">Loading comments…</p></div>' : ""));
  render();
  if (!PREVIEW && rdComN()) loadRdComments(u);
}
// Top comments under the post (through the feeds function, kept here for 5 minutes). Reddit's feed gives a flat list:
// no vote counts and no reply threads, so the button above still opens the full discussion.
var RDC = {};
function rdComN() { var n = P.rdCom; return n === 0 ? 0 : [3, 5, 10, 20].indexOf(+n) >= 0 ? +n : 10; }   // how many comments a post's window shows (0 = none)
function loadRdComments(u) {
  var show = function (v) {
    var box = $("rdCom");
    if (!box || box.dataset.u !== u) return;
    box.innerHTML = v.items.length ? "<h3>Top comments</h3>" + v.items.slice(0, rdComN()).map(function (c) {
      return '<div class="rdc"><div class="mut"><b>' + esc(c.by) + "</b> · " + ago(c.ts) + ' ago</div><p class="nt">' + esc(unent(c.t)) + "</p></div>";
    }).join("") : '<p class="mut sn">' + (v.err ? "Comments unavailable: " + esc(v.err) : "No comments yet.") + "</p>";
  };
  if ($("rdCom")) $("rdCom").dataset.u = u;
  var c = RDC[u];
  if (c && Date.now() - c.at < 300000) { show(c); return; }
  if (!sb || !USER) { show({ items: [], err: "sign in first" }); return; }
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { rdc: u } }).then(function (r) {
    var v = r.data && r.data.rdc;
    if (r.error) v = { items: [], err: r.error.message };
    else if (!v) v = { items: [], err: "it needs the updated feeds function (redeploy super-function in Supabase)" };
    if (v.items && v.items.length) RDC[u] = { at: Date.now(), items: v.items, err: "" };
    show({ items: v.items || [], err: v.err || "" });
  }).catch(function (e) { show({ items: [], err: String((e && e.message) || e) }); });
}
function srcChanged() { persist(); NEWS = []; TGP = []; TGX = []; TGEND = {}; NEWSV++; NERR = ""; renderSources(); render(); fetchNews(); }
function lastAge(name) {
  var t = 0; NEWS.forEach(function (n) { if (n.s === name && n.ts > t) t = n.ts; });
  return t ? "latest " + ago(t) + " ago" + (NVIA[name] ? " · via " + NVIA[name].replace(/api\.|www\./g, "") : "") : "";
}
function renderSources() {
  $("srcNews").innerHTML = newsSrc().map(function (x, i) {
    return '<div class="row"><span>' + esc(x.name) + ' <small class="mut">' + esc(lastAge(x.name)) + '</small>' + (NWHY[x.name] ? '<div class="mut sn">Skipped: ' + esc(NWHY[x.name].slice(0, 300)) + "</div>" : "") + '</span><button data-a="srcdel" data-k="n:' + i + '" aria-label="Remove ' + esc(x.name) + '">✕</button></div>';
  }).join("") + (NEWS.length ? '<div class="mut sn">Feeds function: ' + (FNVER ? "version " + FNVER : "old version, redeploy it") + "</div>" : "") || '<div class="mut">No news sources.</div>';
  $("srcTg").innerHTML = tgSrc().map(function (x, i) {
    return '<div class="row"><span>' + esc(x) + '</span><button data-a="srcdel" data-k="g:' + i + '" aria-label="Remove ' + esc(x) + '">✕</button></div>';
  }).join("") || '<div class="mut">No Telegram channels.</div>';
  $("srcRd").innerHTML = rdSrc().map(function (x, i) {
    return '<div class="row"><span>r/' + esc(x) + '</span><button data-a="srcdel" data-k="r:' + i + '" aria-label="Remove ' + esc(x) + '">✕</button></div>';
  }).join("") || '<div class="mut">No subreddits.</div>';
}
document.addEventListener("submit", function (e) {
  if (e.target.id === "addRd") { e.preventDefault(); if (addRdSrc($("rdIn").value)) { $("rdIn").value = ""; rdChanged(); } }
  if (e.target.id === "addNews") { e.preventDefault(); if (addNewsSrc($("newsName").value.trim(), $("newsUrl").value.trim())) { $("newsName").value = ""; $("newsUrl").value = ""; srcChanged(); } }
  if (e.target.id === "addTg") { e.preventDefault(); if (addTgSrc($("tgIn").value)) { $("tgIn").value = ""; srcChanged(); } }
});
$("srcReset").onclick = function () { delete P.news; delete P.tg; delete P.rd; srcMsg("Back to the default sources."); srcChanged(); rdChanged(); };

// ---- Details windows for news, Telegram and Gmail ----
function when(ts) { return new Date(ts).toLocaleString("en-GB", { timeZone: TZ, dateStyle: "medium", timeStyle: "short" }); }
function openNews(u) {
  var g = NG.filter(function (x) { return x.some(function (n) { return n.u === u; }); })[0];
  var n = g ? g.filter(function (x) { return x.u === u; })[0] : NEWS.filter(function (x) { return x.u === u; })[0];
  if (!n) return;
  g = g || [n];
  g.forEach(function (x) { markReadUrl(x.u); });
  var more = g.length > 1 ? "<h3>" + g.length + " sources report this</h3>" + g.map(function (x) {
    var xu = safeUrl(x.u);
    return '<div class="mi">' + (xu ? '<a target="_blank" rel="noopener noreferrer" href="' + esc(xu) + '">' + esc(x.t) + "</a>" : esc(x.t)) + '<small class="mut">' + esc(x.s) + " · " + when(x.ts) + "</small></div>";
  }).join("") : "";
  var img = safeUrl(n.img);
  openModal(n.s, '<h2 class="mh">' + esc(n.t) + '</h2><div class="mut">' + esc(n.s) + " · " + when(n.ts) + "</div>" +
    (img ? '<img class="mimg" referrerpolicy="no-referrer" alt="" data-rm="1" src="' + esc(img) + '">' : "") + (n.d ? "<p>" + esc(n.d) + "</p>" : "") +
    (PREVIEW ? previewNote() : '<p class="tools">' + linkBtn(n.u, "Read the full article") + '<button data-a="nsearch" data-k="' + esc(n.t) + '">Search other coverage</button></p>') + more);
  render();
}
function openTG(u) {
  var g = TGP.filter(function (x) { return x.u === u; })[0];
  if (!g) return;
  markReadUrl(g.u);
  var vid = safeUrl(g.vid), th = safeUrl(g.th), img = safeUrl(g.img) || th;
  var media = vid ? '<video class="mvid" controls playsinline preload="metadata"' + (th ? ' poster="' + esc(th) + '"' : "") + ' src="' + esc(vid) + '"></video>'
    : img ? '<img class="mimg" referrerpolicy="no-referrer" alt="" data-rm="1" src="' + esc(img) + '">' : "";
  openModal(g.s, '<div class="mut">' + esc(g.s) + " · " + when(g.ts) + "</div>" + media + '<p class="nt">' + esc(g.tx || g.t) + "</p><p>" + linkBtn(g.u, "Open on Telegram") + "</p>" + (PREVIEW ? previewNote() : ""));
  render();
}
var MAIL = [], mBusy = false;
function fetchMail() {
  if (!sb || !USER || !P.mail || mBusy) return;
  var list = P.mail.map(function (c, i) { return c && c.url && c.t ? { i: i, url: c.url, t: c.t, since: c.seen || 0 } : null; }).filter(Boolean);
  if (!list.length) return;
  mBusy = true;
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { mail: list } }).then(function (r) {
    mBusy = false;
    if (r.error || !r.data || !r.data.mail) list.forEach(function (c) { MAIL[c.i] = { error: (r.error && r.error.message) || "no data" }; });
    else r.data.mail.forEach(function (m, k) {
      var i = list[k].i, old = MAIL[i];
      // one failed check (a slow Gmail script, usually) keeps the last good numbers instead of showing "Error"
      if (m && m.error && old && !old.error && (old.fails || 0) < 3) { old.fails = (old.fails || 0) + 1; return; }
      MAIL[i] = m; mailAlerts(i, m);
    });
    render();
  }).catch(function () { mBusy = false; });
}
// A card for each new email since the last check (the first check only notes where you are, so old mail is not announced)
function mailAlerts(i, m) {
  if (!m || m.error || !m.items) return;
  var key = "sp_mailts" + i, last = load(key, 0), top = last, fresh = [];
  m.items.forEach(function (x) { if (x.ts > last) fresh.push(x); if (x.ts > top) top = x.ts; });
  if (!last) { save(key, top || Date.now()); return; }
  if (!fresh.length) return;
  save(key, top);
  var nm = (P.mail[i] && P.mail[i].name) || "Mail", who = function (x) { return (x.from || "").replace(/<.*>/, "").replace(/"/g, "").trim() || x.from || "?"; };
  fresh.sort(function (a, b) { return b.ts - a.ts; });
  toast("mail", nm + " · " + who(fresh[0]), fresh[0].subject || "(no subject)", { a: "mail", k: i });
  if (fresh.length > 1) toast("mail", nm + " · " + (fresh.length - 1) + " more new email" + (fresh.length > 2 ? "s" : ""), fresh.slice(1, 4).map(who).join(", "), { a: "mail", k: i });
}
function mailN(i) {
  var m = MAIL[i], seen = P.mail[i] && P.mail[i].seen, n = seen && m.fresh != null ? m.fresh : m.unread;
  return { n: n, txt: seen && n >= 30 ? "30+" : n, lab: seen ? "new" : "unread" };
}
function markRead(i) {
  var c = P.mail && P.mail[i];
  if (!c) return;
  c.seen = Math.floor(Date.now() / 1000);
  if (MAIL[i]) MAIL[i].fresh = 0;
  persist(); closeModal(); render(); fetchMail();
}
function showAllMail(i) { var c = P.mail && P.mail[i]; if (!c) return; delete c.seen; persist(); closeModal(); MAIL[i] = null; render(); fetchMail(); }
function openMail(i) {
  var m = MAIL[i];
  if (!m || m.error) return;
  var nm = (P.mail[i] && P.mail[i].name) || "Gmail", n = mailN(i), seen = P.mail[i] && P.mail[i].seen;
  var items = (m.items || []).slice().sort(function (a, b) { return b.ts - a.ts; }).slice(0, 20);
  var rows = items.map(function (x) {
    var isNew = seen && x.ts > seen * 1000;
    return '<div class="mi"><div class="r2"><b>' + esc((x.from || "").replace(/<.*>/, "").trim() || x.from) + (isNew ? ' <span class="pill ac">new</span>' : "") + '</b><small class="mut">' + ago(x.ts) + "</small></div><div>" + esc(x.subject || "(no subject)") +
      '</div><div class="mut sn">' + esc(x.snippet || "") + "</div>" + linkBtn(x.link, "Open in Gmail") + "</div>";
  }).join("");
  var ctl = '<div class="tools">' + (n.n > 0 ? '<button data-a="mailread" data-k="' + i + '">Mark read (on this site only)</button>' : "") + (seen ? '<button data-a="mailall" data-k="' + i + '">Show all unread again</button>' : "") + "</div>";
  var note = seen && n.n === 0 ? '<p class="mut">Nothing new since you pressed Mark read. Your latest unread mail:</p>' : "";
  openModal(nm + " · " + n.txt + " " + n.lab, ctl + note + (rows || '<p class="mut">No unread mail.</p>'));
}
function loadMailForm() {
  var M = P.mail || [];
  [0, 1].forEach(function (i) { var c = M[i] || {}; $("mn" + i).value = c.name || ""; $("mu" + i).value = c.url || ""; $("mt" + i).value = c.t || ""; });
}
$("mailSave").onclick = function () {
  P.mail = [0, 1].map(function (i) { return { name: $("mn" + i).value.trim(), url: $("mu" + i).value.trim(), t: $("mt" + i).value.trim(), seen: (P.mail && P.mail[i] && P.mail[i].seen) || undefined }; });
  persist(); MAIL = []; render(); fetchMail(); $("mailMsg").textContent = "Saved.";
};

// ---- Timer, countdown and notes ----
var AC = null;
function audio() {
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); } catch (e) {}
  return AC;
}
document.addEventListener("click", function () { audio(); }, { once: true });
function beep(freq, t0, dur, type) {
  var ac = audio(); if (!ac) return;
  var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + t0, peak = 0.25 * vol();
  o.type = type || "sine"; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
}
function vol() { return (P.vol == null ? 70 : P.vol) / 100; }
function ring(kind) {
  if (kind === "chime") [660, 880, 1320].forEach(function (f, i) { beep(f, i * 0.28, 0.6, "sine"); });
  else if (kind === "alarm") for (var i = 0; i < 6; i++) beep(i % 2 ? 880 : 1046, i * 0.22, 0.2, "square");
  else for (var j = 0; j < 3; j++) beep(880, j * 0.3, 0.18, "sine");
}
var RINGING = {};
function startRinging(a) { ring(a.snd); stopRinging(a.id); RINGING[a.id] = setInterval(function () { ring(a.snd); }, 2600); }
function stopRinging(id) { if (RINGING[id]) { clearInterval(RINGING[id]); delete RINGING[id]; } }
function notify(a) {
  try { if (window.Notification && Notification.permission === "granted") new Notification((a.label || (a.k === "t" ? "Timer" : "Countdown")) + " is done"); } catch (e) {}
}
function alarms() { if (!P.alarms) P.alarms = []; return P.alarms; }
function fmt(ms) {
  var s = Math.max(0, Math.ceil(ms / 1000)), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), p = function (n) { return n < 10 ? "0" + n : n; };
  s = s % 60;
  return (d ? d + "d " : "") + (d || h ? p(h) + ":" : "") + p(m) + ":" + p(s);
}
function elapsed(a) { return a.acc + (a.st ? Date.now() - a.st : 0); }
function clockText(a) {
  if (a.done) return a.k === "t" ? "Done " + fmt(a.dur) : "Time's up";
  return a.k === "s" ? fmt(elapsed(a)) : a.k === "t" ? fmt(elapsed(a)) + " / " + fmt(a.dur) : fmt(a.at - Date.now());
}
var KIND = { t: "Timer", c: "Countdown", s: "Stopwatch" };
function renderClocks() {
  $("clocks").innerHTML = alarms().map(function (a) {
    return '<div class="clk' + (a.done ? " done" : "") + '"><span class="mut">' + esc(a.label || KIND[a.k]) + '</span><b id="ct' + a.id + '">' + clockText(a) + "</b>" +
      (a.done && RINGING[a.id] ? '<button data-a="clstop" data-k="' + a.id + '">Stop</button>' : "") +
      (a.k !== "c" && !a.done ? '<button data-a="clplay" data-k="' + a.id + '" aria-label="Start or pause">' + (a.st ? "⏸\uFE0E" : "▶\uFE0E") + '</button><button data-a="clreset" data-k="' + a.id + '" aria-label="Reset">↺</button>' : "") +
      '<button data-a="clrm" data-k="' + a.id + '" aria-label="Remove">✕</button></div>';
  }).join("");
  positionClocks();
}
function positionClocks() {
  var box = $("clocks");
  box.hidden = !alarms().length;
  var mail = document.querySelector('[data-id="mail"]'), dateEl = $("date");
  box.style.left = (mail ? Math.round(mail.getBoundingClientRect().left) : 16) + "px";
  box.style.top = (dateEl ? Math.round(dateEl.getBoundingClientRect().top) : 14) + "px";
}
function startStopwatch() {
  if (alarms().length >= 8) { alert("You can have at most 8 timers, countdowns and stopwatches. Remove one first."); return; }
  alarms().push({ id: "a" + Date.now().toString(36), k: "s", label: "", acc: 0, st: Date.now(), done: false });
  persist(); renderClocks();
}
function tickClocks() {
  var changed = false;
  positionClocks();
  alarms().forEach(function (a) {
    if (!a.done && a.k !== "s" && (a.k === "t" ? a.st && elapsed(a) >= a.dur : Date.now() >= a.at)) {
      a.done = true; if (a.k === "t") { a.acc = a.dur; a.st = 0; }
      changed = true; startRinging(a); notify(a);
    }
    var n = $("ct" + a.id); if (n) n.textContent = clockText(a);
  });
  if (changed) { persist(); renderClocks(); }
}
setInterval(tickClocks, 1000);
window.addEventListener("resize", positionClocks);
function clockAct(a, k) {
  var list = alarms(), t = list.filter(function (x) { return x.id === k; })[0];
  if (a === "clplay" && t && !t.done) { audio(); if (t.st) { t.acc += Date.now() - t.st; t.st = 0; } else t.st = Date.now(); }
  else if (a === "clreset" && t) { t.acc = 0; t.st = 0; t.done = false; }
  else if (a === "clstop") { stopRinging(k); }
  else if (a === "clrm") { stopRinging(k); P.alarms = list.filter(function (x) { return x.id !== k; }); }
  persist(); renderClocks();
}
function openClock(kind) {
  var t = kind === "t";
  openModal(t ? "Timer" : "Countdown", '<p class="mut">' + (t ? "Counts up and rings when it reaches the time you set. It keeps ringing every few seconds until you press Stop or remove it." : "Counts down to a date and time and rings when it gets there. It keeps ringing every few seconds until you press Stop or remove it.") + '</p><div class="add"><input type="text" id="clLabel" placeholder="Name (optional)"></div>' +
    (t ? '<div class="add"><label>Hours <input type="number" id="clH" min="0" max="99" value="0"></label><label>Minutes <input type="number" id="clM" min="0" max="999" value="25"></label><label>Seconds <input type="number" id="clS" min="0" max="59" value="0"></label></div>'
       : '<div class="add"><label>Ends at <input type="datetime-local" id="clAt"></label></div>') +
    '<div class="add"><label>Sound <select id="clSnd"><option value="beep">Beep</option><option value="chime">Chime</option><option value="alarm">Alarm</option></select></label><button data-a="cltest">Test sound</button></div><p><button class="pri" data-a="clstart" data-k="' + kind + '">Start</button></p>');
}
function startClock(kind) {
  var a = { id: "a" + Date.now().toString(36), k: kind, label: $("clLabel").value.trim(), snd: $("clSnd").value, done: false };
  if (kind === "t") {
    var ms = ((+$("clH").value || 0) * 3600 + (+$("clM").value || 0) * 60 + (+$("clS").value || 0)) * 1000;
    if (ms < 1000) { alert("Set a time of at least 1 second."); return; }
    a.dur = ms; a.acc = 0; a.st = Date.now();
  } else {
    var at = Date.parse($("clAt").value);
    if (!at || at <= Date.now()) { alert("Pick a date and time in the future."); return; }
    a.at = at;
  }
  if (alarms().length >= 8) { alert("You can have at most 8 timers and countdowns. Remove one first."); return; }
  alarms().push(a); persist(); audio();
  try { if (window.Notification && Notification.permission === "default") Notification.requestPermission(); } catch (e) {}
  closeModal(); renderClocks();
}
// ---- Notes and to-dos: two tabs in one small window. Click any text to edit it in place. ----
var DONE_OPEN = false;
var CE = (function () { try { var d = document.createElement("div"); d.setAttribute("contenteditable", "plaintext-only"); return d.contentEditable === "plaintext-only" ? "plaintext-only" : "true"; } catch (e) { return "true"; } })();
function openTodos() { return (P.notes || []).filter(function (n) { return n.todo && !n.done; }).length; }
function noteTab() { return P.noteTab === "note" ? "note" : "todo"; }
function openNotes(focus) {
  var draft = $("noteIn") ? $("noteIn").value : "";
  putWidget("notes");
  if ($("noteIn")) { $("noteIn").value = draft; if (focus !== false) $("noteIn").focus(); }
}
function notesHtml() {
  var L = P.notes || [], tab = noteTab(), byNew = function (a, b) { return (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || b.ts - a.ts; };
  var open = L.filter(function (n) { return n.todo && !n.done; }).sort(byNew), done = L.filter(function (n) { return n.todo && n.done; }).sort(byNew), notes = L.filter(function (n) { return !n.todo; }).sort(byNew);
  var acts = function (n, pin) {
    return '<span class="nact">' + (pin ? '<button data-a="notepin" data-k="' + n.id + '" title="' + (n.pin ? "Unpin" : "Pin to the top") + '" aria-label="Pin">' + (n.pin ? "★" : "☆") + "</button>" : "") +
      '<button data-a="notedel" data-k="' + n.id + '" title="Delete" aria-label="Delete">✕</button></span>';
  };
  var text = function (n) { return '<div class="ntx" contenteditable="' + CE + '" spellcheck="false" data-note="' + n.id + '">' + esc(n.t) + "</div>"; };
  var trow = function (n) {
    return '<div class="trow' + (n.done ? " done" : "") + (n.pin ? " pin" : "") + '"><button class="chk' + (n.done ? " on" : "") + '" role="checkbox" aria-checked="' + !!n.done + '" data-a="notedone" data-k="' + n.id + '" aria-label="' + (n.done ? "Mark as not done" : "Mark as done") + '"></button>' + text(n) + acts(n, !n.done) + "</div>";
  };
  var seg = function (k, label, n) { return '<button data-a="notetab" data-k="' + k + '"' + (tab === k ? ' class="on"' : "") + ">" + label + (n ? " <i>" + n + "</i>" : "") + "</button>"; };
  var body;
  if (tab === "todo") {
    body = '<div class="tadd"><i>+</i><input type="text" id="noteIn" placeholder="Add a task and press Enter" maxlength="300" autocomplete="off"></div>' +
      (open.map(trow).join("") || '<p class="nempty">' + (done.length ? "All done. Nice." : "Nothing to do yet. Add your first task above.") + "</p>") +
      (done.length ? '<div class="tdh"><button class="lnk2" data-a="notedonetoggle">' + (DONE_OPEN ? "▾" : "▸") + " Completed (" + done.length + ")</button>" + (DONE_OPEN ? '<button class="lnk2" data-a="notecleardone">Clear</button>' : "") + "</div>" + (DONE_OPEN ? done.map(trow).join("") : "") : "");
  } else {
    body = '<div class="ngrid"><div class="ncard new"><textarea id="noteIn" rows="2" placeholder="Write a note…"></textarea><div class="nfoot"><small>Ctrl+Enter to save</small><button class="pri" data-a="noteadd">Save</button></div></div>' +
      notes.map(function (n) {
        return '<div class="ncard' + (n.pin ? " pin" : "") + '">' + text(n) + '<div class="nfoot"><small>' + new Date(n.ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + "</small>" + acts(n, true) + "</div></div>";
      }).join("") + "</div>";
  }
  return '<div class="nt2"><div class="seg">' + seg("todo", "To-do", open.length) + seg("note", "Notes", notes.length) + "</div>" + body + "</div>";
}

// ---- Notes and the calendar can live in a window, or stay docked on the left or right side of the page ----
var WIDGETS = { notes: { t: "Notes", html: function () { return notesHtml(); } }, cal: { t: "Calendar", html: function () { return calHtml(); } } };
function sideOf(w) { var s = P.side && P.side[w]; return s === "left" || s === "right" ? s : ""; }
function putWidget(w) {
  var W = WIDGETS[w];
  if (!sideOf(w)) {
    openModal(W.t, W.html() + '<div class="dockbtns"><button data-a="sidedock" data-k="' + w + ':left" title="Keep this open on the left side of the page">◧ Dock left</button><button data-a="sidedock" data-k="' + w + ':right" title="Keep this open on the right side of the page">Dock right ◨</button></div>');
    return;
  }
  var b = document.querySelector('.sw[data-sw="' + w + '"] .swb');
  if (b) b.innerHTML = W.html(); else renderSide();
}
function renderSide() {
  ["left", "right"].forEach(function (side) {
    $(side === "left" ? "sideL" : "sideR").innerHTML = Object.keys(WIDGETS).filter(function (w) { return sideOf(w) === side; }).map(function (w) {
      return '<div class="sw" data-sw="' + w + '"><div class="swh"><b>' + WIDGETS[w].t + '</b><span><button data-a="sidedock" data-k="' + w + ":" + (side === "left" ? "right" : "left") + '" title="Move to the other side" aria-label="Move to the other side">⇄</button>' +
        '<button data-a="sidedock" data-k="' + w + ':" title="Undock (it opens as a window again)" aria-label="Undock">✕</button></span></div><div class="swb">' + WIDGETS[w].html() + "</div></div>";
    }).join("");
  });
  syncDock();
}
function sideDock(w, side) {
  P.side = P.side || {};
  if (side) P.side[w] = side; else delete P.side[w];
  persist();
  if (!$("modal").hidden && $("mTitle").textContent === WIDGETS[w].t) closeModal();
  renderSide(); render();
}
function noteAct(a, k) {
  var L = P.notes = P.notes || [], n = L.filter(function (x) { return x.id === k; })[0];
  if (a === "noteadd") {
    var v = $("noteIn").value.trim();
    if (!v) return;
    L.push({ id: "n" + Date.now().toString(36), t: v, ts: Date.now(), todo: noteTab() === "todo" });
    $("noteIn").value = "";
  }
  else if (a === "notetab") { P.noteTab = k; if ($("noteIn")) $("noteIn").value = ""; }
  else if (a === "notedonetoggle") DONE_OPEN = !DONE_OPEN;
  else if (a === "notecleardone") P.notes = L.filter(function (x) { return !x.done; });
  else if (a === "notedel") P.notes = L.filter(function (x) { return x.id !== k; });
  else if (n && a === "notedone") { n.done = !n.done; if (n.done) n.pin = false; }
  else if (n && a === "notepin") n.pin = !n.pin;
  persist(); render(); openNotes(a === "noteadd" || a === "notetab");
}
document.addEventListener("keydown", function (e) {
  var t = e.target, isNote = t.getAttribute && t.getAttribute("data-note");
  if (isNote && e.key === "Escape") { e.stopPropagation(); t.blur(); return; }
  if (e.key !== "Enter") return;
  if (t.id === "noteIn" && (t.tagName === "INPUT" || e.ctrlKey || e.metaKey)) { e.preventDefault(); noteAct("noteadd"); }
  else if (isNote && !e.shiftKey && t.closest(".trow")) { e.preventDefault(); t.blur(); }
}, true);
document.addEventListener("focusout", function (e) {
  var id = e.target.getAttribute && e.target.getAttribute("data-note");
  if (!id) return;
  var n = (P.notes || []).filter(function (x) { return x.id === id; })[0], v = (e.target.innerText || "").replace(/ /g, " ").trim();
  if (!n || v === n.t) return;
  if (!v) { P.notes = P.notes.filter(function (x) { return x.id !== id; }); var r = e.target.closest(".trow, .ncard"); if (r) r.remove(); } else n.t = v;
  persist(); render();
});
var MENU_OPEN = "";
function closeMenus() { if (MENU_OPEN) { MENU_OPEN = ""; render(); } ["filtNews", "filttg", "filtRd"].forEach(function (id) { var f = $(id); if (f) f.hidden = true; }); }
document.addEventListener("click", function (e) { if (!e.target.closest || !e.target.closest(".dd")) closeMenus(); });

// ---- Weather icons ----
function wxIcon(code, day, size) {
  var sun = '<circle cx="16" cy="16" r="5"/><path d="M16 4v3M16 25v3M4 16h3M25 16h3M7.5 7.5l2 2M22.5 22.5l2 2M7.5 24.5l2-2M22.5 9.5l2-2"/>';
  var moon = '<path d="M24 20a9 9 0 1 1-11-13 7 7 0 0 0 11 13z"/>';
  var cloud = '<path d="M9 22a5 5 0 0 1 0-10 7 7 0 0 1 13.5-1.5A5 5 0 0 1 23 22z"/>';
  var g;
  if (code === 0) g = day ? sun : moon;
  else if (code <= 2) g = '<g transform="translate(-5 -6) scale(.65)">' + (day ? sun : moon) + "</g>" + '<g transform="translate(3 3) scale(.85)">' + cloud + "</g>";
  else if (code === 3) g = cloud;
  else if (code === 45 || code === 48) g = cloud + '<path d="M8 26h16M11 29h10"/>';
  else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) g = cloud + '<path d="M11 25l-1.5 4M16 25l-1.5 4M21 25l-1.5 4"/>';
  else if ((code >= 71 && code <= 77) || code === 85 || code === 86) g = cloud + '<path d="M11 26h.01M16 28h.01M21 26h.01M13.5 29h.01M18.5 26h.01"/>';
  else g = cloud + '<path d="M17 21l-4 5h4l-2 5"/>';
  return '<svg viewBox="0 0 32 32" width="' + (size || 24) + '" height="' + (size || 24) + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + g + "</svg>";
}

// ---- Tells you when a new version of the site has been uploaded ----
function checkUpdate() {
  fetch("app.js?ts=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.text(); }).then(function (t) {
    var m = t.match(/var VERSION = ([^;]+);/);
    if (m && m[1].replace(/"/g, "") !== String(VERSION)) $("upd").hidden = false;
  }).catch(function () {});
}
$("updBtn").onclick = function () { location.reload(); };

// ---- Docked players: keep watching on the left while you use the rest of the site ----
var DOCK = [], dockUid = 0;
function setDockW(w) { document.documentElement.style.setProperty("--dock-w", w + "px"); }
(function () {
  var grip = $("dockGrip");
  grip.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    try { grip.setPointerCapture(e.pointerId); } catch (x) {}
    document.body.classList.add("resizing");
    var w = 0;
    function mv(ev) { w = Math.round(Math.max(240, Math.min(ev.clientX, window.innerWidth * 0.75))); setDockW(w); }
    function up() {
      grip.removeEventListener("pointermove", mv); grip.removeEventListener("pointerup", up);
      document.body.classList.remove("resizing");
      if (w) { P.dockW = w; persist(); packGrid(); }
    }
    grip.addEventListener("pointermove", mv); grip.addEventListener("pointerup", up);
  });
})();
function syncDock() {
  var l = DOCK.length > 0 || $("sideL").children.length > 0, r = $("sideR").children.length > 0;
  $("dock").hidden = !l; $("dockR").hidden = !r;
  document.body.classList.toggle("docked", l); document.body.classList.toggle("dockedr", r);
  document.body.classList.toggle("dockslim", l && !DOCK.length);
  setTimeout(packGrid, 0);   // the page just got wider or narrower
}
function dockAdd(k) {
  var kind = k.charAt(0), id = k.slice(2);
  if (DOCK.some(function (d) { return d.kind === kind && d.id === id; })) { closeModal(); return; }
  if (DOCK.length >= 3) { alert("The dock is full (3 players). Close one first."); return; }
  var d = { kind: kind, id: id, uid: ++dockUid };
  DOCK.push(d);
  var src = kind === "t" ? twEmbedSrc(id)
    : "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&mute=1";
  var w = document.createElement("div");
  w.className = "dk"; w.id = "dk" + d.uid;
  // Just the player. Chat and close buttons appear in its top-right corner when the mouse is over it.
  w.innerHTML = '<div class="tw"><iframe allow="autoplay; fullscreen; encrypted-media" allowfullscreen src="' + src + '"></iframe></div><div class="dkc">' +
    (kind === "t" ? '<button data-a="dockchat" data-k="' + d.uid + '" title="Show or hide chat">Chat</button>' : "") +
    '<button data-a="undock" data-k="' + d.uid + '" title="Close" aria-label="Close player">✕</button></div>';
  $("dockP").appendChild(w);
  if (kind === "t" && P.dockChat) dockChat(d.uid);
  syncDock(); closeModal();
}
function dockChat(uid) {
  var w = $("dk" + uid), d = DOCK.filter(function (x) { return x.uid === +uid; })[0];
  if (!w || !d) return;
  var c = w.querySelector(".dkchat");
  if (c) c.remove();
  else {
    c = document.createElement("div"); c.className = "dkchat";
    c.innerHTML = '<iframe title="Chat" src="https://www.twitch.tv/embed/' + encodeURIComponent(d.id) + "/chat?parent=" + location.hostname + (P.theme === "dark" ? "&darkpopout" : "") + '"></iframe>' +
      '<div class="cgrip cgh" data-g="h" title="Drag to change the chat height. Double-click to fill the space again."></div><div class="cgrip cgw" data-g="w" title="Drag to change the chat width. Double-click for full width again."></div>';
    w.appendChild(c);
    chatSize(c);
  }
  w.classList.toggle("haschat", !!w.querySelector(".dkchat"));
}
// The docked chat fills the space under the video unless you drag its bottom or right edge; that size is remembered.
function chatSize(c) {
  c.style.height = P.chatH ? P.chatH + "px" : "";
  c.style.width = P.chatW ? P.chatW + "px" : "";
  c.classList.toggle("fixedh", !!P.chatH);
}
document.addEventListener("pointerdown", function (e) {
  var g = e.target.closest && e.target.closest(".cgrip");
  if (!g) return;
  e.preventDefault();
  var c = g.parentNode, isH = g.dataset.g === "h", r = c.getBoundingClientRect(), v = 0;
  try { g.setPointerCapture(e.pointerId); } catch (x) {}
  document.body.classList.add("resizing");   // lets the mouse pass over the video and chat frames while dragging
  function mv(ev) {
    v = Math.round(isH ? Math.max(160, Math.min(ev.clientY - r.top, window.innerHeight - 40)) : Math.max(220, Math.min(ev.clientX - r.left, c.parentNode.clientWidth)));
    if (isH) { c.style.height = v + "px"; c.classList.add("fixedh"); } else c.style.width = v + "px";
  }
  function up() {
    g.removeEventListener("pointermove", mv); g.removeEventListener("pointerup", up); g.removeEventListener("pointercancel", up);
    document.body.classList.remove("resizing");
    if (v) { if (isH) P.chatH = v; else P.chatW = v; persist(); Array.prototype.forEach.call(document.querySelectorAll(".dkchat"), chatSize); }
  }
  g.addEventListener("pointermove", mv); g.addEventListener("pointerup", up); g.addEventListener("pointercancel", up);
});
document.addEventListener("dblclick", function (e) {
  var g = e.target.closest && e.target.closest(".cgrip");
  if (!g) return;
  if (g.dataset.g === "h") delete P.chatH; else delete P.chatW;
  persist(); Array.prototype.forEach.call(document.querySelectorAll(".dkchat"), chatSize);
});
function undock(uid) {
  DOCK = DOCK.filter(function (d) { return d.uid !== +uid; });
  var n = $("dk" + uid); if (n) n.remove();
  syncDock();
}

// ---- Currency and crypto converter (no key: exchangerate.host mirror + CoinGecko, both called straight from the browser) ----
var CONV_LIST = [
  { c: "USD", n: "US Dollar" }, { c: "EUR", n: "Euro" }, { c: "SEK", n: "Swedish krona" }, { c: "RUB", n: "Russian ruble" },
  { c: "GBP", n: "British pound" }, { c: "BTC", n: "Bitcoin", g: "bitcoin" }, { c: "ETH", n: "Ethereum", g: "ethereum" }, { c: "SOL", n: "Solana", g: "solana" }
];
var RATES = {}, RATESerr = "", ratesBusy = false;   // USD value of 1 unit of each currency
function fetchRates() {
  if (ratesBusy) return; ratesBusy = true;
  var crypto = CONV_LIST.filter(function (x) { return x.g; });
  Promise.all([
    fetch("https://open.er-api.com/v6/latest/USD").then(function (r) { return r.json(); }).catch(function () { return null; }),
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=" + crypto.map(function (x) { return x.g; }).join(",") + "&vs_currencies=usd").then(function (r) { return r.json(); }).catch(function () { return null; }),
  ]).then(function (r) {
    ratesBusy = false;
    var fx = r[0], cg = r[1];
    if (fx && fx.rates) { FXALL = fx.rates; RATES.USD = 1; CONV_LIST.forEach(function (x) { if (!x.g && fx.rates[x.c]) RATES[x.c] = 1 / fx.rates[x.c]; }); }
    if (cg) crypto.forEach(function (x) { if (cg[x.g] && cg[x.g].usd) RATES[x.c] = cg[x.g].usd; });
    RATESerr = (fx && fx.rates) || Object.keys(RATES).length ? "" : "Rates unavailable right now.";
    render();
  }).catch(function () { ratesBusy = false; });
}
function fmtNum(n) {
  var d = Math.abs(n) >= 100 ? 0 : Math.abs(n) >= 1 ? 2 : 6;
  return n.toLocaleString("en-GB", { maximumFractionDigits: d });
}

// ---- Radio (the small box next to the menu; it used to hold the currency converter, which the search bar now does) ----
// Internet radio, played by the browser straight from each station's own stream.
// [id, name, genre, stream address, language the presenters speak]. Listed by genre; that is also the order in
// Settings > Radio (where you choose which stations are in the box's list) and in the box's own list.
var RADIOS = [
  // Pop & hits
  ["skyplus", "Sky Plus", "Pop & hits", "https://stream.skymedia.ee/live/SKYPLUS", "Estonian"],
  ["nrj", "NRJ Estonia", "Pop & hits", "https://stream.skymedia.ee/live/NRJ", "Estonian"],
  ["power", "Power Hit Radio", "Pop & hits", "https://ice.leviracloud.eu/phr96-aac", "Estonian"],
  ["starfm", "Star FM", "Pop & hits", "https://ice.leviracloud.eu/star320-mp3", "Estonian"],
  ["p3", "Sveriges Radio P3", "Pop & hits", "https://live1.sr.se/p3-mp3-96", "Swedish"],
  ["mixmegapol", "Mix Megapol", "Pop & hits", "https://live-bauerse-fm.sharp-stream.com/mixmegapol_instream_se_mp3", "Swedish"],
  ["nrjse", "NRJ Sweden", "Pop & hits", "https://live-bauerse-fm.sharp-stream.com/nrj_instreamtest_se_mp3", "Swedish"],
  ["svenskpop", "Svensk Pop", "Pop & hits", "https://live-bauerse-fm.sharp-stream.com/svenskpop_se_mp3", "Swedish"],
  ["capital", "Capital UK", "Pop & hits", "https://media-ssl.musicradio.com/CapitalUK", "English"],
  ["heart", "Heart UK", "Pop & hits", "https://media-ssl.musicradio.com/HeartUK", "English"],
  ["kiss", "KISS UK", "Pop & hits", "https://live-kiss.sharp-stream.com/kiss100.mp3", "English"],
  ["virgin", "Virgin Radio UK", "Pop & hits", "https://radio.virginradio.co.uk/stream", "English"],
  ["top181", "181.fm Power (Top 40)", "Pop & hits", "https://listen.181fm.com/181-power_128k.mp3", "English"],
  // Rock
  ["rockfm", "Rock FM", "Rock", "https://edge02.cdn.bitflip.ee:8888/rck", "Estonian"],
  ["rockmetal", "Rock FM Metal", "Rock", "https://edge04.cdn.bitflip.ee:8888/rckmetal", "Estonian"],
  ["rockklassiker", "Rockklassiker", "Rock", "https://live-bauerse-fm.sharp-stream.com/rockklassiker_instream_se_mp3", "Swedish"],
  ["radiox", "Radio X", "Rock", "https://media-ssl.musicradio.com/RadioXUK", "English"],
  ["radioxcr", "Radio X Classic Rock", "Rock", "https://media-ice.musicradio.com/RadioXClassicRockMP3", "English"],
  ["rprock", "Radio Paradise Rock", "Rock", "https://stream.radioparadise.com/rock-320", "English"],
  ["q1043", "Q104.3 Classic Rock", "Rock", "https://stream.revma.ihrhls.com/zc1465", "English"],
  ["eagle181", "181.fm The Eagle", "Rock", "https://listen.181fm.com/181-eagle_128k.mp3", "English"],
  ["bob", "Radio Bob", "Rock", "https://streams.radiobob.de/bob-national/mp3-192/", "German"],
  // Hip-hop & R&B
  ["hot97", "Hot 97 (New York)", "Hip-hop & R&B", "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFMAAC.aac", "English"],
  ["xtra", "Capital XTRA", "Hip-hop & R&B", "https://media-ssl.musicradio.com/CapitalXTRANational", "English"],
  ["hh100", "100 Hip Hop & RnB", "Hip-hop & R&B", "https://streaming.shoutcast.com/100-hip-hop-and-rnb-fm", "English"],
  ["hhwork", "Hip Hop Workout", "Hip-hop & R&B", "https://stream.revma.ihrhls.com/zc7785", "English"],
  ["old181", "181.fm Old School", "Hip-hop & R&B", "https://listen.181fm.com/181-oldschool_128k.mp3", "English"],
  ["beat181", "181.fm The Beat", "Hip-hop & R&B", "https://listen.181fm.com/181-beat_128k.mp3", "English"],
  ["dingata", "Sveriges Radio P3 Din Gata", "Hip-hop & R&B", "https://live1.sr.se/dingata-mp3-96", "Swedish"],
  ["rpr1", "RPR1 Old School Hip Hop", "Hip-hop & R&B", "https://streams.rpr1.de/rpr-hiphop-128-mp3", "German"],
  ["bigrap", "bigFM Deutschrap", "Hip-hop & R&B", "https://stream.bigfm.de/rapfeature/mp3-128/", "German"],
  // Dance
  ["capdance", "Capital Dance", "Dance", "https://media-ssl.musicradio.com/CapitalDance", "English"],
  ["heartdance", "Heart Dance", "Dance", "https://media-ssl.musicradio.com/HeartDanceMP3", "English"],
  ["dance", "Dance Wave", "Dance", "https://dancewave.online/dance.mp3", "Music only"],
  // 80s, 90s & oldies
  ["retro", "Retro FM", "80s, 90s & oldies", "https://stream.skymedia.ee/live/RETRO", "Estonian"],
  ["retrose", "Retro FM Sweden", "80s, 90s & oldies", "https://live-bauerse-fm.sharp-stream.com/retrofm_aacp", "Swedish"],
  ["nostalgi", "Radio Nostalgi", "80s, 90s & oldies", "https://live-bauerse-fm.sharp-stream.com/nostalgi_mp3", "Swedish"],
  ["vinyl", "Vinyl FM", "80s, 90s & oldies", "https://live-bauerse-fm.sharp-stream.com/vinylfm_instream_se_mp3", "Swedish"],
  ["heart80", "Heart 80s", "80s, 90s & oldies", "https://media-ssl.musicradio.com/Heart80sMP3", "English"],
  ["heart90", "Heart 90s", "80s, 90s & oldies", "https://media-ssl.musicradio.com/Heart90sMP3", "English"],
  ["gold", "Gold", "80s, 90s & oldies", "https://media-ssl.musicradio.com/GoldMP3", "English"],
  ["a80s", "181.fm Awesome 80s", "80s, 90s & oldies", "https://listen.181fm.com/181-awesome80s_128k.mp3", "English"],
  ["s90s", "181.fm Star 90s", "80s, 90s & oldies", "https://listen.181fm.com/181-star90s_128k.mp3", "English"],
  // Mixed & alternative
  ["r2", "Raadio 2", "Mixed & alternative", "https://icecast.err.ee/raadio2.mp3", "Estonian"],
  ["rpmain", "Radio Paradise", "Mixed & alternative", "https://stream.radioparadise.com/mp3-192", "English"],
  ["kexp", "KEXP Seattle", "Mixed & alternative", "https://kexp-mp3-128.streamguys1.com/kexp128.mp3", "English"],
  ["country181", "181.fm Kickin' Country", "Mixed & alternative", "https://listen.181fm.com/181-kickincountry_128k.mp3", "English"],
  // Chill & classical
  ["smoothchill", "Smooth Chill", "Chill & classical", "https://media-ssl.musicradio.com/ChillMP3", "English"],
  ["chill181", "181.fm Chilled", "Chill & classical", "https://listen.181fm.com/181-chilled_128k.mp3", "English"],
  ["lofi", "Lofi (laut.fm)", "Chill & classical", "https://stream.laut.fm/lofi", "Music only"],
  ["classicfm", "Classic FM", "Chill & classical", "https://media-ssl.musicradio.com/ClassicFMMP3", "English"],
  ["p2", "Sveriges Radio P2", "Chill & classical", "https://live1.sr.se/p2-mp3-96", "Swedish"],
  // News & talk
  ["viker", "Vikerraadio", "News & talk", "https://icecast.err.ee/vikerraadio.mp3", "Estonian"],
  ["p1", "Sveriges Radio P1", "News & talk", "https://live1.sr.se/p1-mp3-96", "Swedish"],
  ["p4sth", "Sveriges Radio P4 Stockholm", "News & talk", "https://live1.sr.se/p4sth-mp3-96", "Swedish"],
  ["bbcws", "BBC World Service", "News & talk", "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service", "English"],
  ["lbc", "LBC", "News & talk", "https://media-ssl.musicradio.com/LBCUK", "English"],
  ["lbcnews", "LBC News", "News & talk", "https://media-ssl.musicradio.com/LBCNewsUK", "English"],
  ["times", "Times Radio", "News & talk", "https://timesradio.wireless.radio/stream", "English"],
  ["talksport", "talkSPORT", "News & talk", "https://radio.talksport.com/stream", "English"],
  ["npr", "NPR", "News & talk", "https://npr-ice.streamguys1.com/live.mp3", "English"],
  ["wnyc", "WNYC New York", "News & talk", "https://fm939.wnyc.org/wnycfm", "English"]
];
var RADIO_DEF = ["retro", "rockfm", "hot97", "hh100", "old181", "rprock", "rpmain"];
function radioIds() { var on = P.radio && Array.isArray(P.radio.on) ? P.radio.on : RADIO_DEF; return RADIOS.filter(function (r) { return on.indexOf(r[0]) >= 0; }); }
function radioCur() { var list = radioIds(), id = P.radio && P.radio.cur; return list.filter(function (r) { return r[0] === id; })[0] || list[0] || null; }
function radioVol() { var v = P.radio && P.radio.vol; return v >= 0 && v <= 100 ? +v : 60; }
function radioSet(k, v) { P.radio = P.radio || {}; P.radio[k] = v; persist(); }
var RAD = { a: null, id: "", state: "" };   // state: "" stopped, "load" connecting, "play" playing, "err" could not play
function radioPlay() {
  var s = radioCur();
  if (!s) return;
  if (!RAD.a) {
    RAD.a = new Audio(); RAD.a.preload = "none";
    var set = function (st) { return function () { if (RAD.state && RAD.state !== st) { RAD.state = st; render(); } }; };
    RAD.a.addEventListener("playing", set("play")); RAD.a.addEventListener("waiting", set("load")); RAD.a.addEventListener("error", set("err"));
  }
  RAD.id = s[0]; RAD.state = "load";
  RAD.a.src = s[3]; RAD.a.volume = radioVol() / 100;
  var p = RAD.a.play();
  if (p && p.catch) p.catch(function () { if (RAD.id === s[0] && RAD.state === "load") { RAD.state = "err"; render(); } });
  try { if (navigator.mediaSession && window.MediaMetadata) navigator.mediaSession.metadata = new MediaMetadata({ title: s[1], artist: "OmniRama radio" }); } catch (e) {}
  render();
  radioNow(true);
}
function radioStop() {
  if (RAD.a) { RAD.state = ""; RAD.a.pause(); RAD.a.removeAttribute("src"); RAD.a.load(); }   // dropping the address really ends the stream
  RAD.state = ""; render();
}
function radioHtml() {
  var list = radioIds(), cur = radioCur(), RI = 'viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"', v = radioVol();
  if (!list.length) return '<div class="mrow radio"><span class="mut">No stations chosen. Pick some in Settings, Radio.</span></div>';
  var st = RAD.state, tip = st === "play" ? "Playing " + cur[1] : st === "load" ? "Connecting…" : st === "err" ? "Could not play this station right now" : "Play";
  return '<div class="mrow radio">' +
    // a plain list, in the same genre order as the settings (the browser draws group headings too heavily to use them here)
    '<select id="radSel" aria-label="Radio station" title="' + esc(cur[1] + " · " + cur[2] + " · " + cur[4]) + '">' + list.map(function (r) { return '<option value="' + r[0] + '"' + (r[0] === cur[0] ? " selected" : "") + ">" + esc(r[1]) + "</option>"; }).join("") + "</select>" +
    '<button data-a="radplay" class="ib' + (st === "play" ? " on" : st === "load" ? " on busy" : st === "err" ? " bad" : "") + '" aria-label="Play" title="' + tip + '"><svg ' + RI + '><path d="M8 5.500v13l10.500-6.500z"/></svg></button>' +
    '<button data-a="radstop" class="ib" aria-label="Stop" title="Stop"><svg ' + RI + '><rect x="6.500" y="6.500" width="11" height="11" rx="1.500"/></svg></button>' +
    '<div class="dd"><button data-a="radvol" class="ib" aria-label="Volume" title="Volume ' + v + '%" aria-haspopup="true" aria-expanded="' + (MENU_OPEN === "vol") + '"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.500v5h3.500l4.500 4v-13l-4.500 4z" fill="currentColor"/>' + (v ? '<path d="M15.500 9a4 4 0 0 1 0 6"/>' + (v > 50 ? '<path d="M18 6.500a7.500 7.500 0 0 1 0 11"/>' : "") : '<path d="M16 9.500l5 5M21 9.500l-5 5"/>') + "</svg></button>" +
    (MENU_OPEN === "vol" ? '<div class="menu volpop"><input type="range" id="radVol" min="0" max="100" step="1" value="' + v + '" aria-label="Radio volume"><span id="radVolN">' + v + "</span></div>" : "") + "</div></div>";
}
document.addEventListener("change", function (e) {
  if (e.target.id !== "radSel") return;
  radioSet("cur", e.target.value);
  if (RAD.state) radioPlay(); else { render(); radioRefresh(); }   // switching while it plays tunes straight to the new station
});
document.addEventListener("input", function (e) {
  if (e.target.id !== "radVol") return;
  var v = +e.target.value;
  if (RAD.a) RAD.a.volume = v / 100;
  if ($("radVolN")) $("radVolN").textContent = v;
  P.radio = P.radio || {}; P.radio.vol = v; debounced("radVol", function () { persist(); });
});
// ---- What the radio is playing: hover the Radio box for the song, click it for everything about it ----
// The song comes from the station's own stream (read by the feeds function, as a page cannot read it itself). The cover,
// album, year and length are looked up at Apple's public music search, the writers at MusicBrainz; both straight from the browser.
var RNP = { id: "", raw: null, at: 0, err: "" }, RADH = load("sp_radh", {}), SONGC = {}, WRITC = {};
var RAD_REV = { mixmegapol: 1, rockklassiker: 1, nrjse: 1, svenskpop: 1, retrose: 1, nostalgi: 1, vinyl: 1 };   // these send "Title - Artist"
// the stream's text -> { a: artist, s: song } when it names a song, otherwise { show: the text } (a programme name, or nothing)
function radParse(st, raw) {
  var t = String(raw || "").replace(/`/g, "'").replace(/\s+/g, " ").trim();
  if (/^(p1|p2|p3|p4sth|dingata)$/.test(st[0])) { var sr = /spelar nu (.+)$/.exec(t); if (!sr) return { show: t }; t = sr[1]; }   // "Programme, spelar nu Artist - Song"
  var ih = /^(.*?) - text="([^"]*)"(.*)$/.exec(t);                                                                                 // iHeart's format
  if (ih) return /song_spot="[TF]"/.test(ih[3]) || !ih[2] ? { show: "" } : { a: ih[1].trim(), s: ih[2].trim() };
  if (!t || /^[-_\s]*$/.test(t) || /adbreak|tracklist:|https?:\/\//i.test(t)) return { show: "" };
  var p = t.split(" - ");
  if (st[2] === "News & talk" || p.length < 2) return { show: t };
  var a = RAD_REV[st[0]] ? p[p.length - 1] : p[0], s = RAD_REV[st[0]] ? p.slice(0, -1).join(" - ") : p.slice(1).join(" - ");
  var flat = function (x) { return x.toLowerCase().replace(/[^a-z0-9]/g, ""); };
  if (!a.trim() || !s.trim() || flat(st[1]).indexOf(flat(a)) === 0 || flat(a).indexOf(flat(st[1]).slice(0, 6)) === 0) return { show: t };   // the station naming itself
  return { a: a.trim(), s: s.trim() };
}
function radSong() { var st = radioCur(); return st && RNP.id === st[0] && RNP.raw != null ? radParse(st, RNP.raw) : null; }
function radHist(id) { return Array.isArray(RADH[id]) ? RADH[id] : []; }
// asks what the chosen station is playing (at most every 20 seconds) and notes each new song, newest first, six per station
function radioNow(force) {
  var st = radioCur();
  if (!st || !sb || !USER) return Promise.resolve();
  if (!force && RNP.id === st[0] && Date.now() - RNP.at < 20000) return Promise.resolve();
  if (RNP.id !== st[0]) { RNP.raw = null; RNP.err = ""; }
  RNP.id = st[0]; RNP.at = Date.now();
  return sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { np: st[3] } }).then(function (r) {
    if (RNP.id !== st[0]) return;
    var v = r.data && r.data.np;
    if (!v) { RNP.raw = ""; RNP.err = "This needs the updated feeds function (redeploy super-function)."; }
    else {
      RNP.raw = unent(String(v.t || "")); RNP.err = "";
      var x = radParse(st, RNP.raw), h = radHist(st[0]);
      if (x.a && !(h[0] && h[0].a === x.a && h[0].s === x.s)) { h.unshift({ a: x.a, s: x.s, ts: Date.now() }); RADH[st[0]] = h.slice(0, 6); save("sp_radh", RADH); }
    }
    radioRefresh();
  }).catch(function () {});
}
setInterval(function () { if (RAD.state === "play") radioNow(); }, 25000);
// "Song (feat. X) [Clean]" -> "Song": the plain name finds the song more reliably
function songPlain(s) { return String(s).replace(/\s*[\[(][^\])]*[\])]/g, "").replace(/\s+(feat\.?|ft\.?|f\/|featuring)\s.*$/i, "").trim(); }
function songInfo(a, s) {
  var key = (a + "|" + s).toLowerCase();
  if (SONGC[key]) return SONGC[key];
  return (SONGC[key] = fetch("https://itunes.apple.com/search?entity=song&limit=6&term=" + encodeURIComponent(songPlain(a).replace(/\s*[&,]\s.*$/, "") + " " + songPlain(s))).then(function (r) { return r.json(); }).then(function (j) {
    var flat = function (x) { return String(x || "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""); }, fa = flat(songPlain(a)).slice(0, 8), fs = flat(songPlain(s)).slice(0, 8);
    var list = (j && j.results) || [], hit = list.filter(function (x) { return flat(x.artistName).indexOf(fa.slice(0, 5)) >= 0 && flat(x.trackName).indexOf(fs.slice(0, 5)) >= 0; })[0] || list.filter(function (x) { return flat(x.trackName).indexOf(fs.slice(0, 5)) >= 0; })[0];
    if (!hit) return {};
    return { art: safeUrl(String(hit.artworkUrl100 || "").replace("100x100bb", "300x300bb")), sm: safeUrl(hit.artworkUrl100), album: hit.collectionName || "", year: (hit.releaseDate || "").slice(0, 4), date: hit.releaseDate || "", genre: hit.primaryGenreName || "",
      ms: +hit.trackTimeMillis || 0, url: safeUrl(hit.trackViewUrl), artist: hit.artistName || "", track: hit.trackName || "", no: hit.trackNumber && hit.trackCount ? hit.trackNumber + " of " + hit.trackCount : "" };
  }).catch(function () { delete SONGC[key]; return {}; }));
}
// who wrote it: MusicBrainz knows the recording, the work it is a recording of, and the work's composers and lyricists
function songWriters(a, s) {
  var key = (a + "|" + s).toLowerCase(), MB = "https://musicbrainz.org/ws/2/", q = function (x) { return songPlain(x).replace(/["\\]/g, " "); };
  if (WRITC[key]) return WRITC[key];
  return (WRITC[key] = fetch(MB + "recording?fmt=json&limit=5&query=" + encodeURIComponent('recording:"' + q(s) + '" AND artist:"' + q(a).replace(/\s*[&,]\s.*$/, "") + '"')).then(function (r) { return r.json(); }).then(function (j) {
    var rec = ((j && j.recordings) || []).filter(function (x) { return x.score >= 85; })[0];
    if (!rec) return [];
    return fetch(MB + "recording/" + rec.id + "?fmt=json&inc=work-rels").then(function (r) { return r.json(); }).then(function (d) {
      var w = ((d && d.relations) || []).filter(function (x) { return x.work; })[0];
      if (!w) return [];
      return fetch(MB + "work/" + w.work.id + "?fmt=json&inc=artist-rels").then(function (r) { return r.json(); }).then(function (wk) {
        var seen = {}, out = [];
        ((wk && wk.relations) || []).forEach(function (x) { if (x.artist && /composer|lyricist|writer/.test(x.type || "") && !seen[x.artist.name]) { seen[x.artist.name] = 1; out.push(x.artist.name); } });
        return out.slice(0, 6);
      });
    });
  }).catch(function () { delete WRITC[key]; return []; }));
}
function msText(ms) { var s = Math.round(ms / 1000); return Math.floor(s / 60) + ":" + pad2(s % 60); }
var RAD_T = "Radio";
function radioInfoHtml(info, writers) {
  var st = radioCur(), x = radSong(), h = st ? radHist(st[0]) : [];
  if (!st) return '<p class="mut">No station chosen.</p>';
  var head;
  if (!USER) head = '<p class="mut">Sign in to see what the station is playing.</p>';
  else if (RNP.id !== st[0] || RNP.raw == null) head = '<p class="mut">Asking the station what it is playing…</p>';
  else if (RNP.err) head = '<p class="mut">' + esc(RNP.err) + "</p>";
  else if (!x || !x.a) head = '<p class="mut">' + (x && x.show ? "On now: <b>" + esc(x.show) + "</b>" : esc(st[1]) + " is not saying which song is on right now (talk, adverts, or a station that does not send it).") + "</p>";
  else {
    info = info || {};
    var facts = [info.album, info.year, info.genre, info.ms ? msText(info.ms) : ""].filter(Boolean).join(" · "), find = encodeURIComponent(x.a + " " + songPlain(x.s));
    head = '<div class="rnp">' + (info.art ? '<img alt="" referrerpolicy="no-referrer" data-rm="1" src="' + esc(info.art) + '">' : '<div class="rnpx">♪</div>') + '<div><h2 class="mh">' + esc(x.s) + "</h2><div class=\"rnpa\">" + esc(x.a) + "</div>" +
      (facts ? '<div class="mut sn">' + esc(facts) + "</div>" : "") + (info.no ? '<div class="mut sn">Track ' + esc(info.no) + (info.date ? " · released " + esc(new Date(info.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })) : "") + "</div>" : "") +
      '<div class="mut sn" id="rnpW">' + (writers == null ? "" : writers.length ? "Written by " + esc(writers.join(", ")) : "") + "</div>" +
      '<p class="tools">' + (info.url ? linkBtn(info.url, "Apple Music") : "") + linkBtn("https://www.youtube.com/results?search_query=" + find, "YouTube") + linkBtn("https://genius.com/search?q=" + find, "Lyrics") + "</p></div></div>";
  }
  var before = h.filter(function (o, i) { return !(i === 0 && x && x.a === o.a && x.s === o.s); }).slice(0, 5);
  return head + (before.length ? "<h3>Played before</h3>" + before.map(function (o) {
    return '<div class="row rnph"><span><b>' + esc(o.s) + '</b> <span class="mut">' + esc(o.a) + '</span></span><span class="r mut">' + new Date(o.ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + "</span></div>";
  }).join("") : "") +
    '<p class="mut sn rnpf">' + esc(st[1]) + " · " + esc(st[2]) + " · " + esc(st[4]) + (USER ? " · Earlier songs are noted while the radio plays on this page." : "") + "</p>";
}
function openRadioInfo() {
  openModal(RAD_T, radioInfoHtml());
  radioNow(RNP.raw == null).then(radioRefresh);
  radioRefresh();
}
// redraws the open window (and fills in cover and writers once they arrive)
function radioRefresh() {
  var st = radioCur(), x = radSong();
  if ($("modal").hidden || $("mTitle").textContent !== RAD_T || !st) return;
  if (!x || !x.a) { $("mBody").innerHTML = radioInfoHtml(); return; }
  var key = x.a + "|" + x.s, same = function () { var y = radSong(); return !$("modal").hidden && $("mTitle").textContent === RAD_T && y && y.a + "|" + y.s === key; };
  songInfo(x.a, x.s).then(function (info) {
    if (!same()) return;
    $("mBody").innerHTML = radioInfoHtml(info, null);
    songWriters(x.a, x.s).then(function (w) { if (same() && $("rnpW")) $("rnpW").textContent = w.length ? "Written by " + w.join(", ") : ""; });
  });
}
// hover card: small cover, song, artist, album
function showRadioPeek(el) {
  var st = radioCur();
  if (!st || EDIT || !USER) return;
  var draw = function (info) {
    var x = radSong();
    if (peekKey !== "radio" || !document.contains(el)) return;
    info = info || {};
    $("peek").innerHTML = '<div class="pk rpk">' + (info.sm ? '<img alt="" referrerpolicy="no-referrer" data-rm="1" src="' + esc(info.sm) + '">' : "") + "<div>" +
      (x && x.a ? "<b>" + esc(x.s) + "</b><span>" + esc(x.a) + "</span>" + (info.album ? "<small>" + esc(info.album) + (info.year ? " · " + esc(info.year) : "") + "</small>" : "") : "<span>" + esc(x && x.show ? x.show : RNP.raw == null ? "Asking the station…" : "No song information right now") + "</span>") +
      "<small>" + esc(st[1]) + (RAD.state === "play" ? " · playing" : "") + " · click for more</small></div></div>";
    $("peek").classList.add("fpk");
    placePeek(el, true);
  };
  draw();
  radioNow().then(function () { var x = radSong(); draw(); if (x && x.a) songInfo(x.a, x.s).then(draw); });
}

// Settings > Radio: one tick box per station, grouped by kind
function renderRadioList() {
  var on = {}, groups = {}, order = [];
  radioIds().forEach(function (r) { on[r[0]] = 1; });
  RADIOS.forEach(function (r) { if (!groups[r[2]]) { groups[r[2]] = []; order.push(r[2]); } groups[r[2]].push(r); });
  $("radList").innerHTML = order.map(function (g) {
    return '<div class="sub"><b>' + esc(g) + "</b>" + groups[g].map(function (r) { return '<label><span>' + esc(r[1]) + ' <small class="rlang">' + esc(r[4]) + '</small></span> <input type="checkbox" data-a="radtoggle" data-k="' + r[0] + '"' + (on[r[0]] ? " checked" : "") + "></label>"; }).join("") + "</div>";
  }).join("");
}
function radioToggle(id, isOn) {
  var cur = radioIds().map(function (r) { return r[0]; }).filter(function (x) { return x !== id; });
  if (isOn) cur.push(id);
  radioSet("on", RADIOS.map(function (r) { return r[0]; }).filter(function (x) { return cur.indexOf(x) >= 0; }));
  render();
}

// ---- Weather (Open-Meteo, no key needed) ----
var WX = null;
var WC = { 0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers", 81: "Rain showers", 82: "Heavy showers", 85: "Snow showers", 86: "Snow showers", 95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm" };
function wxText(c) { return WC[c] || "Unknown"; }
var WXM = null, CITYRES = [];
function homeCity() { return P.home || { name: "Tallinn", lat: 59.437, lon: 24.7536 }; }
var LOCNAME = "Tallinn", TZ = "Europe/Tallinn";
function clockCity() { return P.loc || { name: "Tallinn", lat: 59.437, lon: 24.7536 }; }
function fetchClockTz() {
  var c = clockCity();
  LOCNAME = c.name;
  fetch("https://api.open-meteo.com/v1/forecast?latitude=" + c.lat + "&longitude=" + c.lon + "&current=temperature_2m&timezone=auto&forecast_days=1")
    .then(function (r) { return r.json(); })
    .then(function (j) { if (j && j.timezone) { TZ = j.timezone; tick(); } })
    .catch(function () {});
}
var LOCRES = [];
function openLocationPicker() {
  openModal("Location", '<p class="mut">Sets the place shown next to the date and time, and the clock\'s timezone. The weather tile has its own location, set separately by clicking it.</p><div class="add"><input type="text" id="locIn" placeholder="Search a city, e.g. Stockholm"><button data-a="locgo">Search</button></div><div id="locRes"></div>');
}
function locGo() {
  var q = $("locIn").value.trim();
  if (!q) return;
  $("locRes").innerHTML = '<p class="mut">Searching...</p>';
  fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(q) + "&count=6&language=en&format=json").then(function (r) { return r.json(); }).then(function (j) {
    LOCRES = (j.results || []).map(function (x) { return { name: x.name, lat: x.latitude, lon: x.longitude, label: [x.admin1, x.country].filter(Boolean).join(", ") }; });
    $("locRes").innerHTML = LOCRES.length ? LOCRES.map(function (c, i) {
      return '<div class="row"><span>' + esc(c.name) + ' <small class="mut">' + esc(c.label) + '</small></span><button data-a="locpick" data-k="' + i + '">Use</button></div>';
    }).join("") : '<p class="mut">No city found.</p>';
  }).catch(function () { $("locRes").innerHTML = '<p class="mut">Search failed. Try again.</p>'; });
}
function locPick(i) {
  var c = LOCRES[i];
  if (!c) return;
  P.loc = { name: c.name, lat: c.lat, lon: c.lon };
  persist(); fetchClockTz(); closeModal();
}
function wxUrl(c) {
  return "https://api.open-meteo.com/v1/forecast?latitude=" + c.lat + "&longitude=" + c.lon + "&current=temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m,relative_humidity_2m&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,uv_index_max,snowfall_sum,wind_gusts_10m_max&wind_speed_unit=ms&timezone=auto&forecast_days=7";
}
function loadWx(c) { return fetch(wxUrl(c)).then(function (r) { return r.json(); }); }
function fetchWeather() {
  loadWx(homeCity()).then(function (j) {
    if (j && j.current) { WX = j; render(); }
  }).catch(function () {});
}
// Weather warnings for today and tomorrow, worked out from the forecast numbers (no extra service needed)
function wxWarn(j) {
  var d = j && j.daily, out = [];
  if (!d || !d.time) return out;
  [0, 1].forEach(function (k) {
    if (!d.time[k]) return;
    var code = d.weather_code[k], rain = d.precipitation_sum[k] || 0, snow = (d.snowfall_sum && d.snowfall_sum[k]) || 0,
      gust = (d.wind_gusts_10m_max && d.wind_gusts_10m_max[k]) || 0, hi = d.temperature_2m_max[k], lo = d.temperature_2m_min[k], uv = d.uv_index_max[k] || 0;
    var add = function (t, x) { out.push({ day: k ? "Tomorrow" : "Today", t: t, x: x }); };
    if (code >= 95) add("Thunderstorm", code > 95 ? "hail possible" : "");
    if (snow >= 5 && gust >= 15) add("Snow storm", Math.round(snow) + " cm of snow, gusts " + Math.round(gust) + " m/s");
    else if (snow >= 10 || code === 75 || code === 86) add("Heavy snow", Math.round(snow) + " cm");
    if (code === 56 || code === 57 || code === 66 || code === 67) add("Freezing rain", "icy roads");
    if (snow < 5 && (rain >= 15 || code === 65 || code === 82)) add("Heavy rain", Math.round(rain) + " mm");
    if (gust >= 25) add("Storm", "gusts " + Math.round(gust) + " m/s");
    else if (gust >= 17 && !(snow >= 5)) add("Strong wind", "gusts " + Math.round(gust) + " m/s");
    if (hi >= 30) add("Heat", "up to " + Math.round(hi) + "°");
    if (lo <= -20) add("Severe cold", "down to " + Math.round(lo) + "°");
    if (uv >= 8) add("Very high UV", "index " + Math.round(uv));
  });
  return out;
}
function wxWarnText(w) { return w.map(function (x) { return x.day + ": " + x.t + (x.x ? " (" + x.x + ")" : ""); }).join("\n"); }
function wxHtml(j) {
  var c = j.current, h = j.hourly, d = j.daily, now = c.time.slice(0, 13);
  var warn = wxWarn(j), warnBox = warn.length ? '<div class="warnbox">' + warn.map(function (x) { return "<div><b>! " + x.t + "</b> " + x.day.toLowerCase() + (x.x ? " · " + esc(x.x) : "") + "</div>"; }).join("") + "</div>" : "";
  var i = h.time.findIndex(function (t) { return t.slice(0, 13) >= now; }); if (i < 0) i = 0;
  var hrs = "";
  for (var n = i; n < i + 12 && n < h.time.length; n++) hrs += '<div class="hr"><b>' + h.time[n].slice(11, 16) + "</b><span>" + Math.round(h.temperature_2m[n]) + "°</span><small>" + h.precipitation_probability[n] + "%</small></div>";
  var days = d.time.map(function (t, k) {
    var nm = new Date(t + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" });
    return '<div class="row"><span>' + wxIcon(d.weather_code[k], 1, 20) + " " + nm + " <small>" + wxText(d.weather_code[k]) + '</small></span><span class="r">' + d.precipitation_sum[k].toFixed(1) + " mm · " + Math.round(d.temperature_2m_min[k]) + "° / <b>" + Math.round(d.temperature_2m_max[k]) + "°</b></span></div>";
  }).join("");
  return warnBox + '<div class="mrow"><span class="wi">' + wxIcon(c.weather_code, c.is_day, 34) + '</span><b class="big">' + Math.round(c.temperature_2m) + "°</b><span>" + wxText(c.weather_code) + '</span></div><div class="mut">Feels like ' + Math.round(c.apparent_temperature) + "° · wind " + c.wind_speed_10m + " m/s · humidity " + c.relative_humidity_2m + "%</div>" +
    '<h3>Next 12 hours (temperature, chance of rain)</h3><div class="hrs">' + hrs + "</div><h3>7 days</h3>" + days +
    '<p class="mut">Sunrise ' + d.sunrise[0].slice(11, 16) + " · Sunset " + d.sunset[0].slice(11, 16) + " · UV max " + d.uv_index_max[0] + "</p>";
}
function sameCity(a, b) { return a && b && a.name === b.name && Math.abs(a.lat - b.lat) < 0.01 && Math.abs(a.lon - b.lon) < 0.01; }
function cityList() { return [homeCity()].concat(P.cities || []); }
function cityChips() {
  return cityList().map(function (c, i) {
    return '<button data-a="cityview" data-k="' + i + '"' + (WXM && sameCity(WXM.c, c) ? ' class="on"' : "") + ">" + esc(c.name) + (i === 0 ? " ★" : "") + "</button>";
  }).join("");
}
function cityTools(c) {
  if (sameCity(c, homeCity())) return "";
  var saved = (P.cities || []).some(function (x) { return sameCity(x, c); });
  return '<div class="tools"><button data-a="cityhome">Use for the tile</button>' + (saved ? '<button data-a="cityrm">Remove from my cities</button>' : '<button data-a="citysave">Save to my cities</button>') + "</div>";
}
function showCity(c, j) {
  WXM = { c: c, j: j || null };
  $("cityChips").innerHTML = cityChips();
  if (j) { $("cityBody").innerHTML = cityTools(c) + wxHtml(j); return; }
  $("cityBody").innerHTML = '<p class="mut">Loading ' + esc(c.name) + "...</p>";
  loadWx(c).then(function (x) {
    if (!WXM || WXM.c !== c) return;
    WXM.j = x; $("cityBody").innerHTML = x && x.current ? cityTools(c) + wxHtml(x) : '<p class="mut">Could not load the weather.</p>';
  }).catch(function () { $("cityBody").innerHTML = '<p class="mut">Could not load the weather.</p>'; });
}
function openWeather() {
  openModal("Weather", '<div class="add"><input type="text" id="cityIn" placeholder="Search a city, e.g. Stockholm"><button data-a="citygo">Search</button></div><div id="cityRes"></div><div id="cityChips" class="tools"></div><div id="cityBody"></div>');
  CITYRES = [];
  if (WX) showCity(homeCity(), WX); else showCity(homeCity());
}
function cityGo() {
  var q = $("cityIn").value.trim();
  if (!q) return;
  $("cityRes").innerHTML = '<p class="mut">Searching...</p>';
  fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(q) + "&count=6&language=en&format=json").then(function (r) { return r.json(); }).then(function (j) {
    CITYRES = (j.results || []).map(function (x) { return { name: x.name, lat: x.latitude, lon: x.longitude, label: [x.admin1, x.country].filter(Boolean).join(", ") }; });
    $("cityRes").innerHTML = CITYRES.length ? CITYRES.map(function (c, i) {
      return '<div class="row"><span>' + esc(c.name) + ' <small class="mut">' + esc(c.label) + '</small></span><button data-a="cityres" data-k="' + i + '">View</button></div>';
    }).join("") : '<p class="mut">No city found.</p>';
  }).catch(function () { $("cityRes").innerHTML = '<p class="mut">Search failed. Try again.</p>'; });
}
var searchTimers = {};
function debounced(id, fn) { clearTimeout(searchTimers[id]); searchTimers[id] = setTimeout(fn, 300); }
document.addEventListener("input", function (e) {
  if (e.target.id === "cityIn" && e.target.value.trim().length >= 2) debounced("cityIn", cityGo);
  else if (e.target.id === "locIn" && e.target.value.trim().length >= 2) debounced("locIn", locGo);
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    if (e.target.id === "cityIn") cityGo();
    else if (e.target.id === "locIn") locGo();
    else if (e.target.id === "wzIn") { var wb = document.querySelector('[data-a="wizadd"]'); if (wb) wb.click(); }
    else if (/^acct(Email|Pass|Pass2)$/.test(e.target.id)) auth(AUTHTAB === "up" ? "signUp" : "signInWithPassword");
    return;
  }
  if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && e.target.closest && e.target.closest('[data-a="paird"]')) {
    e.preventDefault();
    P.layout = P.layout || {};
    P.layout.pairPct = Math.max(20, Math.min(80, pairPct() + (e.key === "ArrowLeft" ? -2 : 2)));
    persist(); render();
  }
});
function cityAct(a, k) {
  var cur = WXM && WXM.c;
  if (a === "citygo") cityGo();
  else if (a === "cityview") showCity(cityList()[+k]);
  else if (a === "cityres") { showCity(CITYRES[+k]); $("cityRes").innerHTML = ""; }
  else if (a === "citysave" && cur) { P.cities = P.cities || []; if (P.cities.length < 8) P.cities.push({ name: cur.name, lat: cur.lat, lon: cur.lon }); persist(); showCity(cur, WXM.j); }
  else if (a === "cityrm" && cur) { P.cities = (P.cities || []).filter(function (x) { return !sameCity(x, cur); }); persist(); showCity(homeCity(), WX); }
  else if (a === "cityhome" && cur) {
    var oldHome = homeCity();
    P.home = { name: cur.name, lat: cur.lat, lon: cur.lon };
    P.cities = (P.cities || []).filter(function (x) { return !sameCity(x, cur); });
    if (!sameCity(oldHome, cur) && !P.cities.some(function (x) { return sameCity(x, oldHome); }) && P.cities.length < 8) P.cities.unshift({ name: oldHome.name, lat: oldHome.lat, lon: oldHome.lon });
    persist(); WX = null; render(); fetchWeather(); showCity(cur, WXM.j);
  }
}

// ---- Stocks: details window with TradingView chart, and adding symbols ----
function openStock(id) {
  var s = tk(id), q = QUOTES[s], se = encodeURIComponent(s.replace(/_/g, "-"));
  var lk = function (u, l) { return '<a class="lnk2" target="_blank" rel="noopener noreferrer" href="' + u + '">' + l + "</a>"; };
  openModal(id, (q ? '<div class="mrow sthead"><b class="big">' + q.p.toFixed(2) + "</b>" + (q.c != null ? '<span class="' + (q.c >= 0 ? "up" : "down") + '">' + (q.c >= 0 ? "▲ +" : "▼ ") + q.c.toFixed(2) + "% today</span>" : "") + "</div>" : "") +
    '<div id="tv" class="tv"></div><div id="stInfo"><p class="mut sn">Loading news…</p></div>' +
    '<p class="stlinks">' + lk("https://www.tradingview.com/chart/?symbol=" + encodeURIComponent(id), "TradingView") + lk("https://finance.yahoo.com/quote/" + se, "Yahoo Finance") + lk("https://stocktwits.com/symbol/" + se, "StockTwits") + lk("https://www.reddit.com/search/?q=" + se + "&sort=new", "Reddit") + lk("https://news.google.com/search?q=" + se + "%20stock", "Google News") + "</p>");
  loadStockNews(id);
  var box = document.createElement("div"); box.className = "tradingview-widget-container"; box.style.height = "100%";
  var inner = document.createElement("div"); inner.className = "tradingview-widget-container__widget"; inner.style.height = "100%";
  box.appendChild(inner);
  var sc = document.createElement("script"); sc.async = true;
  sc.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
  sc.text = JSON.stringify({ autosize: true, symbol: id, interval: "D", timezone: "Europe/Tallinn", theme: P.theme, style: "1", locale: "en", allow_symbol_change: false, hide_side_toolbar: true });
  box.appendChild(sc);
  $("tv").appendChild(box);
}
document.addEventListener("submit", function (e) {
  if (e.target.id !== "addStock") return;
  e.preventDefault();
  var v = $("stockIn").value.trim().toUpperCase();
  if (!v) return;
  if (!P.stocks) P.stocks = DATA.stocks.map(function (x) { return { id: x.id, name: x.name, p: x.p, c: x.c }; });
  if (!P.stocks.some(function (x) { return x.id === v; })) P.stocks.push({ id: v, name: "", p: null, c: null });
  delete P.hidden["s:" + v];
  persist(); render(); fetchQuotes(true);
});

document.addEventListener("pointerdown", function (e) {
  var g = e.target.closest && e.target.closest('[data-a="paird"]');
  if (!g) return;
  e.preventDefault();
  var wrap = g.closest(".pairwrap");
  if (!wrap) return;
  var cards = wrap.querySelectorAll(":scope > .card");
  if (cards.length < 2) return;
  var r = wrap.getBoundingClientRect(), pct = pairPct();
  document.body.classList.add("resizing");
  function mv(ev) {
    var x = ev.clientX - r.left;
    pct = Math.max(20, Math.min(80, Math.round((x / r.width) * 100)));
    cards[0].style.flex = pct + " 1 0%";
    cards[1].style.flex = (100 - pct) + " 1 0%";
  }
  function up() {
    window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up);
    document.body.classList.remove("resizing");
    P.layout = P.layout || {}; P.layout.pairPct = pct; persist(); render();
  }
  window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
});

// ---- Events ----
document.addEventListener("click", function (e) {
  if (e.target.closest && e.target.closest("#filtNews, #filttg, #filtRd")) { e.stopPropagation(); }
  var b = e.target.closest("[data-a]");
  if (!b) return;
  var a = b.dataset.a, k = b.dataset.k;
  trackClick(a === "open" ? "open-" + String(k).charAt(0) : a, b);
  if (a === "filttoggle") { if (b.checked) delete P.hidden[k]; else P.hidden[k] = true; persist(); render(); return; }
  if (a === "clockmenu2") { e.stopPropagation(); audio(); MENU_OPEN = MENU_OPEN === "clock" ? "" : "clock"; render(); return; }
  if (a === "cogmenu2") { e.stopPropagation(); MENU_OPEN = MENU_OPEN === "cog" ? "" : "cog"; render(); return; }
  if (a === "opennotes") { openNotes(); return; }
  if (a === "acctmenu2") { e.stopPropagation(); if (!USER) { MENU_OPEN = ""; ACCTMSG = ""; render(); openAuth(); return; } MENU_OPEN = MENU_OPEN === "acct" ? "" : "acct"; render(); return; }
  if (a === "authtab") { ACCTMSG = ""; openAuth(k); return; }
  if (/^wiz/.test(a)) { wizAct(a, k); return; }
  if (a === "signin") { auth("signInWithPassword"); return; }
  if (a === "signup") { auth("signUp"); return; }
  if (a === "forgotpw") {
    if (!sb) { setMsg("Supabase did not load. Check config.js and your connection."); return; }
    var email = $("acctEmail").value.trim();
    if (!email) { setMsg("Enter your email above, then press Forgot password again."); return; }
    setMsg("Sending reset email...");
    sb.auth.resetPasswordForEmail(email, { redirectTo: location.href.split("#")[0] }).then(function (r) {
      setMsg(r.error ? r.error.message : "Check your email for a reset link.");
    });
    return;
  }
  if (a === "pvup" || a === "pvin") { ACCTMSG = ""; openAuth(a === "pvup" ? "up" : "in"); return; }
  if (a === "delacct") { deleteAccount(); return; }
  if (a === "signout") { signOut(); return; }
  if (a === "editmode") { EDIT = !EDIT; document.body.classList.toggle("editing", EDIT); MENU_OPEN = ""; render(); return; }
  if (a === "opensettingsloc") { $("panel").hidden = true; openLocationPicker(); return; }
  if (a === "locgo") { locGo(); return; }
  if (a === "locpick") { locPick(+k); return; }
  if (a === "setpanel") { MENU_OPEN = ""; render(); $("panel").hidden = false; setSec(SETSEC); return; }
  if (a === "openhelp") { MENU_OPEN = ""; render(); openHelp(); return; }
  if (a === "helpjump") { var sec = $("help-" + k); if (sec) sec.scrollIntoView({ block: "start" }); return; }
  if (a === "copycode") {
    var code = $("gsCode").textContent;
    (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(function () {
      b.textContent = "Copied!"; setTimeout(function () { b.textContent = "Copy the code"; }, 2000);
    }).catch(function () { alert("Could not copy automatically. Select the text below and copy it manually (Ctrl+C or Cmd+C)."); });
    return;
  }
  if (a === "radinfo") { if (!e.target.closest("select, button, input, .dd, .tools")) openRadioInfo(); return; }
  if (a === "radplay") { radioPlay(); return; }
  if (a === "radstop") { radioStop(); return; }
  if (a === "radvol") { e.stopPropagation(); MENU_OPEN = MENU_OPEN === "vol" ? "" : "vol"; render(); return; }
  if (a === "radtoggle") { radioToggle(k, b.checked); return; }
  if (a === "radreset") { if (P.radio) delete P.radio.on; persist(); renderRadioList(); render(); return; }
  if (a === "filtmenu") { e.stopPropagation(); var m = $(k === "news" ? "filtNews" : k === "rd" ? "filtRd" : "filttg"); var open = m.hidden; closeMenus(); if (open) m.hidden = false; return; }
  if (a === "weather") { openWeather(); return; }
  if (a === "twConnect") { twConnect(); return; }
  if (a === "mv" || a === "w" || a === "h" || a === "f") { var pp = k.split(":"); adjust(a, pp[0], +pp[1]); return; }
  if (/^city/.test(a)) { cityAct(a, k); return; }
  if (a === "clockmenu") { audio(); MENU_OPEN = ""; if (k === "s") startStopwatch(); else openClock(k); return; }
  if (a === "cltest") { audio(); ring($("clSnd").value); return; }
  if (a === "clstart") { startClock(k); return; }
  if (/^cl(play|reset|rm|stop)$/.test(a)) { clockAct(a, k); return; }
  if (/^note(add|del|tab|cleardone|done|donetoggle|pin)$/.test(a)) { noteAct(a, k); return; }
  if (a === "opencal") { CALV = null; openCal(); return; }
  if (/^cal(day|nav|del|jump)$/.test(a)) { calAct(a, k); return; }
  if (a === "openbrief") { MENU_OPEN = ""; render(); openBrief(); return; }
  if (a === "toastx" || a === "toastgo") { toastAct(a, k); return; }
  if (a === "nftest") { toast("news", "Test notification", "This is what a notification looks like. Click it or press ✕.", { a: "settings" }, false, true); return; }
  if (a === "sidedock") { var sd = k.split(":"); sideDock(sd[0], sd[1]); return; }
  if (a === "boxoff") { setBoxOff(k, true); return; }
  if (a === "boxtoggle") { setBoxOff(k, !b.checked); return; }
  if (a === "spfav") { spToggleFav(k, SP_OPEN); return; }
  if (a === "fighter") { openFighter(k); return; }
  if (a === "sptoggle") { spToggleLeague(k, b.checked); return; }
  if (a === "spreset") { delete P.spLeagues; persist(); render(); fetchSports(true); return; }
  if (a === "setsec") { setSec(+k); return; }
  if (a === "setfind") { setFind(+k); return; }
  if (a === "langtoggle") { setLang(k, b.checked); return; }
  if (a === "bcreset") { delete P.bc; persist(); if (document.activeElement) document.activeElement.blur(); applyBoxCols(); return; }
  if (a === "pastesave") { pasteSave(k); return; }
  if (a === "keyset") { e.preventDefault(); KEYCAP = KEYCAP === k ? "" : k; renderKeys(); return; }
  if (a === "keyreset") { delete P.keys; KEYCAP = ""; persist(); renderKeys(); return; }
  if (a === "srchans") { srchTake(); return; }
  if (a === "nfmailtest") {
    $("nfMailMsg").textContent = "Sending…";
    sendNtfMail([{ t: "Test email", b: "If you can read this in your inbox, email notifications work.", ts: Date.now() }]).then(function (err) {
      $("nfMailMsg").textContent = err ? "That did not work: " + err : "Sent. Check the inbox of your connected Gmail account.";
    });
    return;
  }
  if (a === "bellmenu") { e.stopPropagation(); MENU_OPEN = MENU_OPEN === "bell" ? "" : "bell"; if (MENU_OPEN) { NLOG.forEach(function (x) { x.seen = 1; }); save("sp_nlog", NLOG); } render(); return; }
  if (a === "bellgo") { var be = NLOG[+k]; MENU_OPEN = ""; render(); if (be) runAct(be.act); return; }
  if (a === "bellclear") { NLOG = []; save("sp_nlog", NLOG); MENU_OPEN = ""; render(); return; }
  if (a === "rdrefresh") { fetchReddit(true); return; }
  if (a === "srcdel") { delSrc(k); return; }
  if (a === "dock") { dockAdd(k); return; }
  if (a === "undock") { undock(k); return; }
  if (a === "dockchat") { dockChat(k); return; }
  if (a === "mailread") { markRead(+k); return; }
  if (a === "mailall") { showAllMail(+k); return; }
  if (a === "mail") { openMail(+k); return; }
  if (a === "nfilt") { NFILT = !(NFILT || NQ); if (!NFILT) NQ = ""; render(); var q = $("newsQ"); if (q) { q.value = ""; q.focus(); } return; }
  if (a === "twpop") { twPop(k); return; }
  if (a === "twchat") { twChat(k); return; }
  if (a === "nseen") { markSeen(k); render(); return; }
  if (a === "refresh") { refreshBox(k); return; }
  if (a === "more") { if (k === "tg" || k === "news") { MORE[k] += 20; render(); if (k === "tg") tgTopUp(); } return; }
  if (a === "actload") { loadActivity(); return; }
  if (a === "actout") { if (sb && USER && confirm("Sign out every other device and browser that is signed in to this account? This one stays signed in.")) sb.auth.signOut({ scope: "others" }).then(loadActivity); return; }
  if (a === "nsearch") { window.open("https://news.google.com/search?q=" + encodeURIComponent(k), "_blank", "noopener"); return; }
  if (a === "open") { var ch = k.charAt(0); if (ch === "t") watchTwitch(k.slice(2)); else if (ch === "v") openYT(k.slice(2)); else if (ch === "a") openNews(k.slice(2)); else if (ch === "m") openTG(k.slice(2)); else if (ch === "r") openReddit(k.slice(2)); else if (ch === "p") openSport(k.slice(2)); else openStock(k.slice(2)); return; }
  if (a === "fav") P.fav[k] = !P.fav[k];
  if (a === "hide") P.hidden[k] = true;
  if (a === "show") delete P.hidden[k];
  persist();
  render();
});
$("closeBtn").onclick = function () { $("panel").hidden = true; };
// ---- Settings window: sections listed on the left, one section shown at a time ----
var SETSEC = 0;
function isAdmin() { return !!USER && (window.ADMIN_EMAILS || []).some(function (e) { return String(e).toLowerCase() === String(USER.email || "").toLowerCase(); }); }
function buildSetNav() {
  var cat = "", gs = document.querySelectorAll("#panel .setgrp");
  if (gs[SETSEC] && gs[SETSEC].dataset.admin && !isAdmin()) SETSEC = 0;
  var q = $("setQ") ? $("setQ").value : "";
  $("setNav").innerHTML = '<div class="navtitle">Settings</div><input type="search" id="setQ" placeholder="Search settings…" aria-label="Search settings" autocomplete="off"><div id="setRes" hidden></div><div id="setNavL">' + Array.prototype.map.call(gs, function (g, i) {
    if (g.dataset.admin && !isAdmin()) return "";   // the Admin entry is only listed for the site owner
    var h = g.dataset.cat !== cat ? '<div class="navcat">' + esc(g.dataset.cat) + "</div>" : "";
    cat = g.dataset.cat;
    return h + '<button data-a="setsec" data-k="' + i + '">' + esc(g.dataset.sec) + "</button>";
  }).join("") + "</div>";
  if (q) { $("setQ").value = q; setSearch(); }
  setSec(SETSEC);
}
function setSec(i) {
  var gs = document.querySelectorAll("#panel .setgrp"), bs = document.querySelectorAll("#setNavL button");
  SETSEC = Math.max(0, Math.min(gs.length - 1, i || 0));
  Array.prototype.forEach.call(gs, function (g, k) { g.classList.toggle("on", k === SETSEC); });
  Array.prototype.forEach.call(bs, function (b) { b.classList.toggle("on", +b.dataset.k === SETSEC); });
  $("setTitle").textContent = gs[SETSEC].dataset.sec;
  if (gs[SETSEC].id === "actSec" && !$("panel").hidden) loadActivity();
  document.querySelector("#panel .setbody").scrollTop = 0;
}
$("panel").addEventListener("mousedown", function (e) { if (e.target.id === "panel") $("panel").hidden = true; });
$("themeBtn").onclick = function () { P.theme = P.theme === "dark" ? "light" : "dark"; persist(); applyTheme(); };
$("accent").oninput = function (e) { P.accent = e.target.value; persist(); applyTheme(); };
$("cBg").oninput = function (e) { setCol("bg", e.target.value); };
$("cCard").oninput = function (e) { setCol("card", e.target.value); };
$("cFg").oninput = function (e) { setCol("fg", e.target.value); };
$("cMut").oninput = function (e) { setCol("mut", e.target.value); };
$("cAlpha").oninput = function (e) { setCol("a", +e.target.value); };
$("fsAll").oninput = function (e) { P.fs = e.target.value / 100; persist(); applyTheme(); render(); };
$("cReset").onclick = function () { if (P.colors) delete P.colors[P.theme]; persist(); applyTheme(); };
$("accentReset").onclick = function () { P.accent = DEFAULT_ACCENT; persist(); applyTheme(); };
$("wallFile").onchange = function (e) { if (e.target.files[0]) setWall(e.target.files[0]); };
$("wallClear").onclick = function () { try { localStorage.removeItem("sp_wall"); } catch (e) {} applyWall(); syncWall(true); };

// ---- Account and cloud sync (Supabase) ----
var sb = null, USER = null, saveTimer;
try { if (window.supabase && window.SUPABASE_URL) sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (e) {}
var ACCTMSG = "";
function setMsg(t) { ACCTMSG = t || ""; if ($("acctMsg")) $("acctMsg").textContent = ACCTMSG; else render(); }
// ---- Sign in / Create account window ----
var AUTHTAB = "in";
function openAuth(tab) {
  var keep = $("acctEmail") ? $("acctEmail").value : "";
  if (tab) AUTHTAB = tab;
  var up = AUTHTAB === "up", seg = function (k, l) { return '<button data-a="authtab" data-k="' + k + '"' + (AUTHTAB === k ? ' class="on"' : "") + ">" + l + "</button>"; };
  openModal("Account", '<div class="auth"><div class="seg">' + seg("in", "Sign in") + seg("up", "Create account") + "</div>" +
    '<p class="mut sn">' + (up ? "A free account saves your boxes, sources, notes and layout, and brings them to any device." : "Sign in to load your own setup.") + "</p>" +
    '<label>Email<input type="email" id="acctEmail" autocomplete="email" placeholder="you@example.com"></label>' +
    '<label>Password<input type="password" id="acctPass" autocomplete="' + (up ? "new-password" : "current-password") + '"' + (up ? ' placeholder="At least 8 characters"' : "") + "></label>" +
    (up ? '<label>Repeat password<input type="password" id="acctPass2" autocomplete="new-password"></label>' : "") +
    '<div id="acctMsg" class="sn" role="status">' + esc(ACCTMSG) + "</div>" +
    '<button class="pri" data-a="' + (up ? "signup" : "signin") + '">' + (up ? "Create account" : "Sign in") + "</button>" +
    (up ? '<p class="mut sn">You then get an email with a confirmation link. Click it, come back and sign in. A short guide helps you pick your boxes and set them up.</p>'
        : '<button class="lnk2" data-a="forgotpw">Forgot password?</button>') + "</div>");
  $("acctEmail").value = keep;
  (keep ? $("acctPass") : $("acctEmail")).focus();
}
function persist() {
  save("sp_prefs", P);
  if (!sb || !USER) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(function () {
    sb.from("user_prefs").upsert({ user_id: USER.id, prefs: P, updated_at: new Date().toISOString() })
      .then(function (r) { if (r.error) setMsg("Could not save to your account: " + r.error.message); });
  }, 600);
}
function renderAccount() {
  $("who").textContent = USER ? "signed in as " + USER.email : "not signed in";
  $("pwSignedIn").hidden = !USER;
  $("pwSignedOut").hidden = !!USER;
  $("delSignedIn").hidden = !USER; $("delSignedOut").hidden = !!USER;
  buildSetNav();
}
function onUser(u) {
  USER = u;
  if (u && PREVIEW) { PREVIEW = false; NEWS = []; TGP = []; RD = []; YTV = load("sp_ytv", []); NEWSV++; }
  renderAccount(); render();
  if (!u) return;
  loadWall(u);
  sb.from("user_prefs").select("prefs").eq("user_id", u.id).maybeSingle().then(function (r) {
    var isNew = false;
    if (r.error) { setMsg("Could not load your settings: " + r.error.message); return; }
    if (r.data && r.data.prefs && r.data.prefs.theme) {
      P = Object.assign({ theme: "dark", accent: DEFAULT_ACCENT, fav: {}, hidden: {} }, r.data.prefs);
      save("sp_prefs", P); applyTheme(); render();
    } else { persist(); isNew = true; }   // no saved settings yet: a brand-new account
    if (!$("modal").hidden && $("mTitle").textContent === "Account") closeModal();
    var resume = null; try { resume = JSON.parse(sessionStorage.getItem("sp_wiz") || "null"); sessionStorage.removeItem("sp_wiz"); } catch (e) {}
    if (resume) setTimeout(function () { openWizard(resume); }, 300);
    else if (isNew && !P.onboarded) setTimeout(function () { openWizard(); }, 600);
    checkDevice();
    fetchQuotes(); fetchTwitch(); fetchYT(); fetchNews(); fetchMail(); fetchReddit(); fetchSports(); loadMailForm(); loadExtraForm(); renderSources(); renderClocks(); renderSide(); fetchWeather(); fetchClockTz();
  });
}
function auth(fn) {
  if (!sb) { setMsg("Supabase did not load. Check config.js and your connection."); return; }
  var c = { email: $("acctEmail").value.trim(), password: $("acctPass").value };
  if (!c.email || !c.password) { setMsg("Enter your email and password."); return; }
  if (fn === "signUp" && c.password.length < 8) { setMsg("Use a password of at least 8 characters."); return; }
  if (fn === "signUp" && $("acctPass2") && $("acctPass2").value !== c.password) { setMsg("The two passwords are not the same."); return; }
  if (fn === "signUp") c.options = { emailRedirectTo: location.href.split("#")[0] };
  setMsg("Working...");
  sb.auth[fn](c).then(function (r) {
    if (r.error) setMsg(r.error.message);
    else if (fn === "signUp" && !r.data.session) { ACCTMSG = "Account created. Check your email for the confirmation link, click it, then sign in here."; openAuth("in"); }
    else setMsg("");
  });
}
function signOut() {
  if (sb) sb.auth.signOut();
  try { ["sp_prefs", "sp_wall", "sp_twitch", "sp_nread", "sp_nalert", "sp_notified", "sp_brief", "sp_nlog", "sp_mailts0", "sp_mailts1", "sp_ytv", "sp_first"].forEach(function (x) { localStorage.removeItem(x); }); } catch (ex) {}
  P = { theme: P.theme, accent: P.accent, colors: P.colors, fs: P.fs, dockW: P.dockW, home: P.home, cities: P.cities, aurora: P.aurora, shadow: P.shadow, fav: {}, hidden: {} };
  TW = []; TWC = false; TWUID = null; LIVEPREV = null; MAIL = []; NEWS = []; NEWSALL = []; TGP = []; RD = []; NLOG = []; NEWSV++; READ = {}; YTV = []; QUOTES = {}; QLOADED = false; NG = []; USER = null;
  FIRST = { _i: {} };
  loadMailForm(); loadExtraForm(); renderSide(); renderAccount();
  applyWall(); MENU_OPEN = ""; render();
  loadSamples();
}
// Deletes the account for good: the sign-in itself plus everything stored for it. The feeds function does the deleting
// (only it holds the key that may remove a user), and only ever for the account whose own sign-in asks.
function deleteAccount() {
  if (!sb || !USER) return;
  var msg = $("delMsg"), typed = prompt("This permanently deletes the account " + USER.email + " and everything saved in it: settings, sources, notes, calendar and wallpaper. It cannot be undone.\n\nYou can create a new account with the same email afterwards.\n\nType DELETE to confirm.");
  if (typed !== "DELETE") { msg.textContent = typed == null ? "" : "Nothing was deleted. To delete, type DELETE in capital letters."; return; }
  msg.textContent = "Deleting…";
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { deleteAccount: true } }).then(function (r) {
    if (r.error || !r.data || !r.data.deleted) {
      msg.textContent = "Could not delete the account: " + ((r.data && r.data._err) || (r.error && r.error.message) || "the feeds function needs updating (redeploy super-function).");
      return;
    }
    msg.textContent = "";
    $("panel").hidden = true;
    signOut();
    openModal("Account deleted", "<p>Your account and everything saved in it have been deleted.</p><p class=\"mut sn\">You can create a new one any time with the person icon.</p>");
  }).catch(function (e) { msg.textContent = "Could not delete the account: " + String((e && e.message) || e); });
}
function initAuth() {
  renderAccount();
  if (!sb) { loadSamples(); return; }
  setTimeout(function () { if (!USER && !PREVIEW) loadSamples(); }, 1500);
  sb.auth.onAuthStateChange(function (ev, session) {
    var u = session ? session.user : null;
    if (!u && !USER && !PREVIEW) loadSamples();   // nobody is signed in: show the preview
    if ((u && u.id) !== (USER && USER.id)) setTimeout(function () { onUser(u); }, 0);
  });
}
// The Apps Script for the Gmail box (shown in Help and in the setup guide). It is HTML-escaped because it goes into a <pre>.
var GS_CODE = '// Paste this whole file into your Apps Script project (replace what is there), then\n// Deploy &gt; Manage deployments &gt; pencil &gt; Version: New version &gt; Deploy.\nfunction out(text) {\n  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);\n}\n\nfunction doGet(e) {\n  try {\n    return handle(e);\n  } catch (err) {\n    return out(JSON.stringify({ error: String(err &amp;&amp; err.message ? err.message : err) }));\n  }\n}\n\nfunction handle(e) {\n  var p = PropertiesService.getScriptProperties();\n  var token = p.getProperty(&quot;T&quot;);\n  var given = e &amp;&amp; e.parameter ? e.parameter.t : &quot;&quot;;\n  if (!token) {\n    if (given) return out(JSON.stringify({ error: &quot;Open this address in your browser with nothing after /exec to get your token.&quot; }));\n    token = Utilities.getUuid();\n    p.setProperty(&quot;T&quot;, token);\n    return out(JSON.stringify({ setup: &quot;Copy this token into the site (Settings, Gmail accounts). It is shown only once.&quot;, token: token }));\n  }\n  if (given !== token) return out(JSON.stringify({ error: &quot;Wrong token&quot; }));\n\n  var since = parseInt(e.parameter.since, 10) || 0;   // seconds; the moment you pressed &quot;Mark read&quot; on the site\n  var cache = CacheService.getScriptCache();\n  var key = &quot;m&quot; + since;\n  var hit = cache.get(key);\n  if (hit) return out(hit);\n\n  var email = Session.getEffectiveUser().getEmail();\n  var items = GmailApp.search(&quot;in:inbox is:unread&quot;, 0, 20).map(function (t) {\n    var msgs = t.getMessages();\n    var m = msgs[msgs.length - 1];\n    return {\n      from: m.getFrom(),\n      subject: m.getSubject(),\n      snippet: m.getPlainBody().replace(/\\s+/g, &quot; &quot;).slice(0, 200),\n      ts: m.getDate().getTime(),\n      link: &quot;https://mail.google.com/mail/?authuser=&quot; + encodeURIComponent(email) + &quot;#inbox/&quot; + t.getId()\n    };\n  }).sort(function (a, b) { return b.ts - a.ts; });\n  var fresh = since ? GmailApp.search(&quot;in:inbox is:unread after:&quot; + since, 0, 30).length : null;\n  var text = JSON.stringify({ email: email, unread: GmailApp.getInboxUnreadCount(), fresh: fresh, items: items });\n  cache.put(key, text, 120);\n  return out(text);\n}\n\n// Lets the site email you its notifications. It can only write to this same Gmail address, and needs the token.\nfunction doPost(e) {\n  try {\n    var p = PropertiesService.getScriptProperties();\n    var token = p.getProperty(&quot;T&quot;);\n    var d = JSON.parse(e.postData.contents);\n    if (!token || d.t !== token) return out(JSON.stringify({ error: &quot;Wrong token&quot; }));\n    MailApp.sendEmail(Session.getEffectiveUser().getEmail(), String(d.subject || &quot;OmniRama&quot;).slice(0, 200), String(d.body || &quot;&quot;).slice(0, 8000));\n    return out(JSON.stringify({ sent: true }));\n  } catch (err) {\n    return out(JSON.stringify({ error: String(err &amp;&amp; err.message ? err.message : err) }));\n  }\n}\n\n// Run this once from the editor only if you lose the token and need a new one.\nfunction resetToken() {\n  PropertiesService.getScriptProperties().deleteProperty(&quot;T&quot;);\n}\n';
function openHelp() {
  var toc = [
    ["signin", "Signing in"], ["weather", "Weather &amp; Location"], ["mail", "Mail (Gmail)"], ["stocks", "Stocks"],
    ["news", "News &amp; Telegram"], ["twitch", "Twitch"], ["youtube", "YouTube"], ["radio", "Radio"],
    ["timers", "Timers, countdowns &amp; stopwatch"], ["notes", "Notes"], ["wallpaper", "Wallpaper"],
    ["edit", "Colors, text size &amp; layout"], ["dock", "Watching while you browse"], ["reddit", "Reddit"], ["sports", "Sports"], ["boxes", "Hiding boxes &amp; docking"],["cal", "Calendar"],["ntf", "Notifications &amp; summary"], ["keys", "Search &amp; shortcuts"],["account", "Account &amp; privacy"]
  ];
  var html = '<p class="mut">Jump to a section:</p><div class="helptoc">' +
    toc.map(function (t) { return '<button data-a="helpjump" data-k="' + t[0] + '">' + t[1] + "</button>"; }).join("") + "</div>";

  html += '<p class="mut sn">Looking for one setting? Open Settings and type in the search field at the top of its menu. For everything the search bar can do, type <code>help</code> in it.</p>';

  html += '<h3 id="help-signin">Signing in</h3><p>Click the person icon in the row of small icons. Choose <b>Create account</b>, enter an email and a password (twice), then click the link in the confirmation email and sign in. The first time you sign in, a short setup guide walks you through the boxes you want; you can run it again from <b>Settings &rarr; Layout &amp; boxes</b>. Everything you set up is saved to your account and is there on any device. Before you sign in, the page shows sample content so you can see what it looks like.</p>';

  html += '<h3 id="help-weather">Weather &amp; Location</h3><p>There are two separate places to set a city:</p><ol><li><b>The weather tile</b> shows the forecast for one city. Click the tile, type a city name, click a result, then press <b>Use for the tile</b>.</li><li><b>The date and time at the top of the page</b> uses a different city. Open the cogwheel icon &rarr; <b>Settings</b> &rarr; <b>Clock &amp; alarms</b> &rarr; <b>Change</b>, type a city, and click <b>Use</b> next to it.</li></ol><p>Changing one does not change the other. A <b>!</b> on the weather tile means a weather warning for the coming days (strong wind, heavy rain or snow, frost, heat); hover it or open the tile to read it. In the weather window you can also save more cities and switch between them.</p>';

  html += '<h3 id="help-mail">Mail (Gmail)</h3><p>This shows how many unread emails you have, without giving the site your Google password. It needs a small piece of free code pasted into your own Google account, once per inbox. It looks technical, but it is entirely copy and paste &mdash; follow every step below in order.</p>' +
    '<ol>' +
    '<li>Go to <a href="https://script.google.com" target="_blank" rel="noopener">script.google.com</a> and make sure you are signed in as the Gmail account you want to show (top right corner of the page).</li>' +
    '<li>Click <b>New project</b> (top left).</li>' +
    '<li>You will see some sample code already in the box. Click inside that box, press Ctrl+A (or Cmd+A on a Mac) to select everything, then press Delete.</li>' +
    '<li>Click the button below to copy the correct code, then click inside the empty box and paste it (Ctrl+V or Cmd+V).</li>' +
    '</ol>' +
    '<div class="codebox"><button class="lnk2 copybtn" data-a="copycode">Copy the code</button><pre id="gsCode">' + GS_CODE + '</pre></div>' +
    '<ol start="5">' +
    '<li>Near the top of the script.google.com page, click the untitled project name and rename it to something like "Mail for my start page", then press Enter.</li>' +
    '<li>Press Ctrl+S (or Cmd+S) to save.</li>' +
    '<li>Click the blue <b>Deploy</b> button (top right), then <b>New deployment</b>.</li>' +
    '<li>Click the small gear/pencil icon next to "Select type" and choose <b>Web app</b>.</li>' +
    '<li>Set <b>Execute as</b> to <b>Me</b>, and <b>Who has access</b> to <b>Anyone</b>. This must say Anyone, not "Anyone with a Google account".</li>' +
    '<li>Click <b>Deploy</b>.</li>' +
    '<li>Google will ask you to authorize the script. Click <b>Authorize access</b>, choose your account. If you see a warning that says the app isn\'t verified, click <b>Advanced</b>, then <b>Go to (unsafe)</b>, then <b>Allow</b>. This warning is normal &mdash; it is your own private script, seen only by you.</li>' +
    '<li>You will now see a <b>Web app URL</b> ending in <code>/exec</code>. Click <b>Copy</b> next to it.</li>' +
    '<li>Paste that address into a new browser tab and press Enter. The page will show some text containing a <b>token</b> &mdash; a long code in quotes. Copy that token now; it is only shown this one time. If you ever lose it, there are reset instructions inside the code itself.</li>' +
    '<li>Go back to this site, open <b>Settings</b> (cogwheel icon) &rarr; <b>Mail</b>. Paste in a name (e.g. "Personal"), the web app address, and the token, then press <b>Save Gmail accounts</b>.</li>' +
    '<li>Wait about a minute and your unread count will appear on the site.</li>' +
    '</ol><p class="mut">To add a second inbox, repeat all of the steps above while signed in to that other Gmail account.</p>' +
    '<p><b>Using it:</b> hover the mail tile for the latest unread subjects, click it for the list, and press <b>Mark read</b> to count only mail that arrives from now on.</p>' +
    '<p><b>Emails from this page</b> (notifications by email, and the &ldquo;new device signed in&rdquo; warning) are sent by this same script to its own address. If you set the script up a while ago, replace its code with the code above and deploy it again (<b>Deploy &rarr; Manage deployments &rarr; pencil &rarr; Version: New version &rarr; Deploy</b>); the address and the token stay the same.</p>';

  html += '<h3 id="help-stocks">Stocks</h3><p>Open <b>Settings</b> &rarr; <b>Stocks</b>. There are three ways to add stocks or crypto:</p><ol>' +
    '<li><b>Add one at a time:</b> type a symbol like <code>NASDAQ:NVDA</code> and press Add.</li>' +
    '<li><b>Import a list:</b> paste a comma-separated list of symbols and press Import.</li>' +
    '<li><b>Import your TradingView watchlist:</b><ol type="a">' +
    '<li>Go to <a href="https://www.tradingview.com" target="_blank" rel="noopener">tradingview.com</a> and open any chart while signed in.</li>' +
    '<li>Your watchlist is the panel on the right side of the screen.</li>' +
    '<li>Click the <b>•••</b> (three dots) at the top of that watchlist panel.</li>' +
    '<li>Choose <b>Advanced view</b> (or <b>Share</b>), then turn on link sharing if it is not already on.</li>' +
    '<li>Copy the link it gives you &mdash; it looks like <code>https://www.tradingview.com/watchlists/12345678/</code>.</li>' +
    '<li>Paste that link into the "shared TradingView watchlist link" box on this site and press Import.</li>' +
    '</ol></li></ol>' +
    '<p><b>In the box:</b> each row has the price, a small chart and the day\'s change. Choose what the chart covers (today, the week, the month, or off) in <b>Settings &rarr; Stocks</b>; in a narrow box the price is cut short to make room for it. Sort with the dropdown, and click a stock for the full chart with recent news and chatter about it. Star or hide a stock in Edit mode.</p>' +
    '<p><b>Alerts:</b> a notification when a stock moves fast (within about half an hour) or far on the day. Set the percentages in <b>Settings &rarr; Notifications</b>.</p>';

  html += '<h3 id="help-news">News &amp; Telegram</h3><p>Open <b>Settings</b> &rarr; <b>News, Telegram &amp; Reddit</b>.</p><ul><li><b>To add a news source:</b> give it a name and either a feed address (for example <code>https://feeds.bbci.co.uk/news/world/rss.xml</code>) or just a website like <code>reuters.com</code>, and press Add. A feed address is the most reliable; with only a website the page looks the news up through search services. Up to 15 sources. Start the name with the outlet (&ldquo;SVT Utrikes&rdquo;, &ldquo;BBC World&rdquo;): two feeds whose names start the same count as one outlet.</li><li><b>To add a Telegram channel:</b> type its name (for example <code>ClashReport</code>) or paste a t.me link, and press Add.</li><li>Click the ✕ next to any source to remove it, or <b>Back to default sources</b> to start over. The list also shows when each source last delivered, and why one was skipped.</li><li>Each of the News and Telegram tiles has its own <b>Sources</b> button, to temporarily hide one source without deleting it.</li></ul>' +
    '<p><b>Reading the news:</b> a story you have not seen gets an accent bar, and the header counts them (click the count to mark everything seen; being away for 2+ minutes does that automatically). Stories you opened are dimmed. The same story from several sources is one row with a source count before the time, also when one report is in Swedish and another in English; three or more outlets within 3 hours makes it <b>hot</b>. A story stays where it was first reported: another source picking it up joins the row and does not mark it new again. Hover a row for the picture and summary, click it for all sources. The ⌕ button filters the list.</p>' +
    '<p><b>Languages:</b> under <i>Languages shown in News</i> tick the languages you read; headlines in other languages are left out (nothing is translated). <b>How many:</b> <i>Headlines shown</i> and <i>Telegram posts shown</i> set the length of the lists; the button at the end of a list shows 20 more, and for Telegram it also loads older posts.</p>' +
    '<p><b>Filters &amp; alerts:</b> <i>Mute words</i> hide every headline containing them; <i>Highlight words</i> mark matching headlines and notify you when a new one appears.</p>';

  html += '<h3 id="help-twitch">Twitch</h3><p>Open <b>Settings</b> &rarr; <b>Twitch</b> &rarr; press <b>Connect</b>, log in if asked, and approve access. The box then shows who you follow that is live, with game and viewers; sort it or pick one category with the dropdowns. Hover a channel for a preview picture, the stream title and how long it has been live. Click a name to watch inside the page. Streamers you starred (Edit mode) who are offline are listed dimmed under the live ones with when they were last live; switch that off in Settings &rarr; Twitch.</p>' +
    '<p><b>Ads even though you have Turbo or a sub?</b> The player inside this page is a Twitch &ldquo;embed&rdquo;. Your browser treats it as a third-party site and hides your twitch.tv login cookie from it, so Twitch thinks you are logged out and plays ads. Two fixes:</p><ol>' +
    '<li><b>Pop out</b> (works everywhere): press <b>Pop out</b> on a stream, or turn on <b>Settings &rarr; Twitch &rarr; Open streams in a pop-out window</b>. The pop-out is twitch.tv itself, so your login, Turbo and subs work. Allow pop-ups for this site if the browser asks.</li>' +
    '<li><b>Let the embed see your login</b>: allow third-party cookies for Twitch only.<ul>' +
    '<li>Chrome: Settings &rarr; Privacy and security &rarr; Third-party cookies &rarr; <i>Sites allowed to use third-party cookies</i> &rarr; Add &rarr; <code>[*.]twitch.tv</code>.</li>' +
    '<li>Edge: Settings &rarr; Cookies and site permissions &rarr; Manage and delete cookies &rarr; <i>Allow</i> &rarr; Add <code>[*.]twitch.tv</code> (and set Tracking prevention to Balanced, not Strict).</li>' +
    '<li>Firefox: Settings &rarr; Privacy &amp; Security &rarr; Cookies and Site Data &rarr; Manage Exceptions &rarr; add <code>https://www.twitch.tv</code> and <code>https://player.twitch.tv</code> as <i>Allow</i>.</li>' +
    '<li>Brave: click the lion icon on this site &rarr; Advanced &rarr; Cookies: <i>Allow all</i>.</li>' +
    '<li>Safari: cross-site tracking prevention cannot be relaxed per site, so use Pop out.</li></ul>Then make sure you are logged in at twitch.tv in the same browser and reload this page.</li></ol>' +
    '<p>Tip: mark streamers with ★ (Edit mode) to get a notification when they go live.</p>';

  html += '<h3 id="help-keys">Search &amp; keyboard shortcuts</h3>' + searchHelpHtml() +
    '<p>Shortcuts (when you are not typing in a box): ' + (keysOn() ? KEY_ACTS.filter(function (x) { return keyOf(x[0]); }).map(function (x) { return "<code>" + esc(keyLabel(keyOf(x[0]))) + "</code> " + x[2].toLowerCase(); }).join(" · ") + " · <code>Esc</code> close." : "switched off.") + ' Change any key, or switch them off, in Settings &rarr; Keyboard shortcuts.</p>';

  html += '<h3 id="help-youtube">YouTube</h3><p>This shows new uploads from channels you subscribe to (YouTube does not allow websites to read your personal recommended feed, so this is the closest available option).</p><ol>' +
    '<li>Go to <a href="https://takeout.google.com" target="_blank" rel="noopener">takeout.google.com</a> while signed in to your YouTube account.</li>' +
    '<li>Click <b>Deselect all</b> (near the top).</li>' +
    '<li>Scroll down, find <b>YouTube and YouTube Music</b>, and tick its checkbox.</li>' +
    '<li>Click the button on that same row that says <b>All YouTube data included</b>. Untick everything, then tick only <b>subscriptions</b>.</li>' +
    '<li>Click <b>Next step</b>, then <b>Create export</b>.</li>' +
    '<li>Wait for an email from Google (usually a few minutes) and click the download link inside it.</li>' +
    '<li>Open the downloaded file. Inside it, find a file named <code>subscriptions.csv</code> (it will be inside a "YouTube and YouTube Music" folder).</li>' +
    '<li>On this site, open <b>Settings</b> &rarr; <b>YouTube</b>, click <b>Choose subscriptions.csv</b>, and select that file.</li>' +
    '</ol>';

  html += '<h3 id="help-radio">Radio</h3><p>The small box next to the menu icons is an internet radio: pick a station from its list, press ▶ to play and ■ to stop; the speaker button opens a volume slider. It keeps playing while you use the rest of the page, and choosing another station while it plays switches straight to it. Tick which stations are in the list in <b>Settings &rarr; Radio</b>. A red play button means that station could not be reached just now. (The currency converter that used to be here is now in the search bar: type <code>100 usd in eur</code>.)</p>';

  html += '<h3 id="help-timers">Timers, countdowns &amp; stopwatch</h3><p>Click the clock icon and choose Timer, Countdown or Stopwatch. A finished timer or countdown keeps ringing every few seconds until you press <b>Stop</b> or remove it, so it is hard to miss. You can set how loud it rings in <b>Settings</b> &rarr; <b>Clock &amp; alarms</b> &rarr; <b>Alarm volume</b>.</p>';

  html += '<h3 id="help-notes">Notes &amp; to-dos</h3><p>Click the notepad icon (or use its shortcut). There are two tabs. <b>To-do:</b> type a task and press Enter; click the circle to tick it off (finished tasks move under <i>Completed</i>, which you can open or clear). <b>Notes:</b> write in the first card and press Save (or Ctrl+Enter). In both, click any text to edit it in place, and hover for pin ★ and delete ✕. The number on the icon is how many to-dos are open.</p>' +
    '<p><b>Quick ways to add one:</b> type <code>note buy milk</code> or <code>todo call the bank</code> in the search bar and press Enter; or press Ctrl+V anywhere on the page (not in a text box) and choose <i>As a note</i> or <i>As a to-do</i> on the small card that appears (switch that off in Settings &rarr; Layout &amp; boxes).</p>';
  html += '<h3 id="help-reddit">Reddit</h3><p>The Reddit box shows posts from your subreddits. Add or remove them in <b>Settings &rarr; News, Telegram &amp; Reddit</b>. In the box, choose <b>Best, Hot, New, Top</b> or <b>Rising</b>, and use <b>Sources</b> to hide a subreddit without removing it. Hover a post for a preview; click it for the text, the links and the top comments. How many comments are shown (3, 5, 10, 20 or none) is set in the same Settings section. Reddit only gives a flat list without votes, so the button in the window opens the full discussion.</p>';
  html += '<h3 id="help-sports">Sports</h3><p>Live scores and fixtures. Choose your leagues in <b>Settings &rarr; Sports</b>: football leagues and cups, NBA, NHL, NFL, MLB, tennis, Formula 1, golf and UFC come from ESPN; SHL (Swedish hockey) comes from shl.se and Counter-Strike 2, League of Legends and Dota 2 from bo3.gg (those four need you to be signed in).</p>' +
    '<p><b>In the box:</b> pick a sport and a view: <b>Live &amp; today</b>, <b>Upcoming</b>, <b>Favorites</b>, and <b>★ your favorite sport</b> if you set one in Settings (everything on now, today and coming up in that sport). Hover a game for the short story of it; click it for goals and cards with minute and scorer, period scores, match stats, top performers and the league table with both teams highlighted. An esports game has <b>Watch</b> buttons that dock the Twitch stream showing it.</p>' +
    '<p><b>Favorites:</b> press ☆ next to a team, fighter or player in a game\'s window. Favorites are marked ★ and listed first. You get a notification when their game starts, at every goal (football and ice hockey) and at the final score, and their games appear in the calendar (both can be switched off in Settings).</p>' +
    '<p><b>UFC:</b> an upcoming event is one row; click it for the fight card, where the number after each name is the odds to win. While a card is on, every fight is its own row: the one in the cage first with round and clock, then what is next, then the results. Click a fight for both fighters side by side, the numbers of the fight (strikes, takedowns, control time) and a tale of the tape. Hover a fighter\'s name for a small card; click it for the fighter\'s own window.</p>';
  html += '<h3 id="help-boxes">Hiding boxes &amp; docking</h3><p><b>Hide a whole box:</b> in Edit mode press <b>Hide</b> on it, or switch it off in <b>Settings &rarr; Layout &amp; boxes</b>, where you can also switch it back on. A hidden box is not loaded. <b>Dock notes or the calendar:</b> open one and press <b>Dock left</b> or <b>Dock right</b> at the bottom; it then stays at the side of the page. Use ⇄ on a docked panel to move it to the other side and ✕ to turn it back into a window.</p>';
  html += '<h3 id="help-cal">Calendar &amp; reminders</h3><p>Click the calendar icon (or press <code>c</code>). Pick a day, type an event, optionally set a time, a reminder and a repeat, and press Add. Days with events have a dot, and the number on the icon is today\'s events. A reminder shows as a notification in the bottom-right corner and stays until you dismiss it (all-day events count as 09:00). Reminders only fire while this page is open in a tab. Games of your ★ sports favorites appear on their day by themselves (click one to open the game); they are not saved with your own events.</p>';
  html += '<h3 id="help-ntf">Notifications &amp; summary</h3><p>Small cards appear in the bottom-right corner for: the same story from several of your sources within two hours, a headline with one of your highlight words, a stock on your list moving fast or far, a ★ streamer going live, a ★ team\'s game starting, scoring and ending, new mail, and calendar reminders. Click a card to open it, ✕ to dismiss. The <b>bell</b> in the menu box keeps the last 30, and its number is how many you have not looked at; opening it clears the number. Hover the mail tile to see your latest unread subjects. Everything can be turned on or off and tuned in <b>Settings &rarr; Notifications</b>, including the ping sound and whether to also send desktop notifications (which also keeps news, stocks, sports and Twitch updating while the tab is in the background).</p>' +
    '<p><b>By email:</b> tick <i>Also send them to my email</i> to get the same notifications in your connected Gmail inbox, everything from a five-minute stretch in one email. It is off until you switch it on, needs an inbox set up under Mail, and only works while this page is open in a tab.</p>' +
    '<p><b>Summary:</b> on your first visit each day a small "Since yesterday" window shows weather warnings, today\'s events, top stories, biggest movers, mail and who is live. Open it any time from the cogwheel menu or with <code>b</code>.</p>' +
    '<p><b>Hover previews:</b> rest the mouse on a news headline or Telegram post to see its picture and text without opening it. <b>Stocks:</b> click a stock to see its chart plus recent news and comments about it.</p>';

  html += '<h3 id="help-wallpaper">Wallpaper</h3><p>Open <b>Settings</b> &rarr; <b>Wallpaper</b>. Click <b>Choose image</b> to pick a picture, then choose how it should fit the screen: Fill, Fit, or Original size. Press <b>Reposition</b> to drag the image where you want it, then press <b>Done</b>.</p>';

  html += '<h3 id="help-edit">Colors, text size &amp; layout</h3><p><b>Settings</b> &rarr; <b>Appearance</b> covers the theme, every color, overall text size, the glow background and the shadows. At the bottom, <b>Signal colors per box</b> changes the green and red in Stocks, the live dot in Twitch and the live red and icons in Sports, each with a strength slider to tone it down.</p><p>To move or resize the boxes themselves, click the cogwheel icon and choose <b>Edit</b>. Each box then shows small buttons: ◀ / ▶ move it earlier or later, W&minus; / W+ make it narrower or wider, T&minus; / T+ change that box\'s own text size, and (on lists) H&minus; / H+ show fewer or more rows. You can also drag a box by its title. Click <b>Done</b> in the same menu to finish.</p>';

  html += '<h3 id="help-dock">Watching while you browse</h3><p>Open a Twitch stream or a YouTube video and press <b>Dock on the left</b>. It keeps playing in a strip on the left side while you use the rest of the site. You can dock up to 3 at once, and drag the edge of that strip to resize it. Hover a docked player for its <b>Chat</b> and close buttons; drag the bottom or right edge of the chat to resize it (double-click an edge to reset). To have chat open by itself when you dock a stream, tick it in Settings &rarr; Twitch.</p>';

  html += '<h3 id="help-account">Account &amp; privacy</h3><p>Under <b>Settings</b>, the Account sections are:</p><ul>' +
    '<li><b>Password:</b> set a new one (typed twice). If you forget it, click the person icon, then <b>Forgot password?</b>, and a reset link is emailed to you.</li>' +
    '<li><b>Sign-in activity:</b> every device and browser signed in to your account right now and the latest sign-ins, with a button to sign out everywhere else. You can also be emailed the first time a new browser signs in (needs an inbox under Mail).</li>' +
    '<li><b>Delete account:</b> removes the account and everything saved in it, for good.</li>' +
    '<li><b>Backup:</b> downloads all settings, sources, notes and layout as a file you can restore later.</li></ul>' +
    '<p>Everything you set up is private to your own account &mdash; nobody else using this site can see it. To run the site, it counts how long the page is open and how often each kind of button is used per account; never what you read, type, search or save. Text you translate in the search bar goes to the MyMemory translation service, and radio stations are played straight from the stations\' own servers.</p>';

  openModal("Help", html);
}
function acctHtml() {
  if (USER) return '<div class="menu acctpop" role="menu"><div class="mut sn">' + esc(USER.email) + '</div><button role="menuitem" data-a="signout">Sign out</button></div>';
  return '<div class="menu acctpop" role="menu"><input type="text" id="acctEmail" placeholder="Email" autocomplete="email"><input type="password" id="acctPass" placeholder="Password (8+ characters)" autocomplete="current-password"><div class="acts"><button data-a="signin">Sign in</button><button data-a="signup">Create</button></div><button class="lnk2" data-a="forgotpw">Forgot password?</button>' + (ACCTMSG ? '<div class="mut sn">' + esc(ACCTMSG) + "</div>" : "") + "</div>";
}

// ---- Notifications: small cards in the bottom-right corner ----
function NTF() { return Object.assign({ news: true, words: true, stock: true, live: true, cal: true, mail: true, sport: true, sound: true, desktop: false, email: false, srcN: 2, pct: 3, day: 5 }, P.ntf || {}); }
var NOTIFIED = load("sp_notified", {});
// true the first time a key is seen, so the same thing is never announced twice (also after a reload)
function once(key) {
  if (NOTIFIED[key]) return false;
  NOTIFIED[key] = Date.now();
  var k = Object.keys(NOTIFIED);
  if (k.length > 300) k.sort(function (a, b) { return NOTIFIED[a] - NOTIFIED[b]; }).slice(0, k.length - 300).forEach(function (x) { delete NOTIFIED[x]; });
  save("sp_notified", NOTIFIED);
  return true;
}
var TOASTS = {}, toastN = 0, TICON = { news: "●", words: "★", stock: "↕", live: "▶", cal: "◷", mail: "✉", sport: "⚑" };
// What clicking a notification does. Kept as plain data (not a function) so the history still works after a reload.
function runAct(act) {
  if (!act) return;
  var a = act.a, k = act.k;
  if (a === "news") { if (NEWS.some(function (n) { return n.u === k; })) openNews(k); else if (safeUrl(k)) window.open(k, "_blank", "noopener"); }
  else if (a === "tg") { if (TGP.some(function (g) { return g.u === k; })) openTG(k); else if (safeUrl(k)) window.open(k, "_blank", "noopener"); }
  else if (a === "stock") openStock(k);
  else if (a === "tw") watchTwitch(k);
  else if (a === "cal") { CALV = { y: +k.slice(0, 4), m: +k.slice(5, 7) - 1, sel: k }; openCal(); }
  else if (a === "mail") { if (MAIL[+k] && !MAIL[+k].error) openMail(+k); }
  else if (a === "sport") openSport(k);
  else if (a === "settings") $("panel").hidden = false;
}
// History of the last 30 notifications (on this device). "seen" = you clicked or dismissed it, or opened the bell.
var NLOG = load("sp_nlog", []);
function missed() { return NLOG.filter(function (e) { return !e.seen; }).length; }
function toast(kind, title, body, act, sticky, force) {
  var n = NTF();
  if (!force && n[kind] === false) return;
  var id = ++toastN, box = $("toasts"), el = document.createElement("div"), entry = { k: kind, t: String(title).slice(0, 160), b: String(body || "").slice(0, 200), ts: Date.now(), act: act || null };
  TOASTS[id] = entry;
  NLOG.push(entry); if (NLOG.length > 30) NLOG = NLOG.slice(-30);
  save("sp_nlog", NLOG);
  el.className = "toast k-" + kind; el.id = "to" + id;
  el.innerHTML = '<div class="tb" data-a="toastgo" data-k="' + id + '" role="button" tabindex="0"><b><i>' + (TICON[kind] || "●") + "</i>" + esc(title) + "</b>" + (body ? "<span>" + esc(body) + "</span>" : "") + '</div><button class="tx" data-a="toastx" data-k="' + id + '" aria-label="Dismiss">✕</button>';
  box.appendChild(el);
  while (box.children.length > 4) toastAct("toastout", box.firstChild.id.slice(2));
  if (!sticky) setTimeout(function () { toastAct("toastout", id); }, 20000);
  if (n.sound) { if (kind === "cal") ring("chime"); else beep(1175, 0, 0.22, "sine"); }
  if (n.desktop && document.hidden) notifyTxt(title, body, function () { runAct(act); });
  if (n.email && !force) MAILQ.push(entry);
  render();
}
// ---- Notifications by email (off unless you switch it on) ----
// They go through your own Gmail script, which can only ever write to its own address, so nothing can be sent to anyone else.
// To keep it calm (and inside Gmail's daily limit) everything from a five-minute stretch goes out as ONE email.
var MAILQ = [], mailQLast = 0;
function mailCfg() { return (P.mail || []).filter(function (c) { return c && c.url && c.t; })[0] || null; }
function sendNtfMail(items) {
  var c = mailCfg();
  if (!sb || !USER) return Promise.resolve("Sign in first.");
  if (!c) return Promise.resolve("Connect a Gmail inbox first (Settings, Mail). The emails are sent by that inbox's script, to itself.");
  var when = function (t) { return new Date(t).toLocaleTimeString("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }); };
  var subject = items.length === 1 ? "OmniRama: " + items[0].t : "OmniRama: " + items.length + " notifications";
  var text = items.map(function (x) { return when(x.ts) + "  " + x.t + (x.b ? "\n       " + x.b : ""); }).join("\n\n") + "\n\n(Sent by your OmniRama page. Switch this off in Settings, Notifications.)";
  return sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { mailNotify: { url: c.url, t: c.t, subject: subject, text: text } } }).then(function (r) {
    if (r.error) return r.error.message || "The function did not answer.";
    if (r.data && r.data.sent) return "";
    return (r.data && r.data._err) || "The feeds function needs updating (redeploy super-function).";
  }).catch(function (e) { return String((e && e.message) || e); });
}
function flushMailQ() {
  if (!MAILQ.length || Date.now() - mailQLast < 300000) return;
  mailQLast = Date.now();
  sendNtfMail(MAILQ.splice(0, 30));
}
setInterval(flushMailQ, 30000);
// toastgo = clicked, toastx = dismissed (both count as seen), toastout = it timed out unread (stays "missed")
function toastAct(a, id) {
  var el = $("to" + id), entry = TOASTS[id];
  delete TOASTS[id];
  if (el) el.remove();
  if (entry && a !== "toastout") { entry.seen = 1; save("sp_nlog", NLOG); render(); }
  if (a === "toastgo" && entry) runAct(entry.act);
}
function bellHtml() {
  return '<div class="menu bell" role="menu">' + (NLOG.length ? NLOG.slice().reverse().map(function (e, i) {
    return '<button role="menuitem" data-a="bellgo" data-k="' + (NLOG.length - 1 - i) + '" class="k-' + esc(e.k) + '"><b><i>' + (TICON[e.k] || "●") + "</i>" + esc(e.t) + "</b>" + (e.b ? "<span>" + esc(e.b) + "</span>" : "") + "<small>" + ago(e.ts) + " ago</small></button>";
  }).join("") + '<button class="lnk2" data-a="bellclear">Clear history</button>' : '<div class="mut sn">No notifications yet.</div>') + "</div>";
}
// Big news: the same story from several of your sources within two hours
function bigNews() {
  var n = NTF(), now = Date.now(), sent = 0;
  if (n.news === false || !NEWS.length) return;
  newsGroups().forEach(function (g) {
    var newest = g[0].ts;
    if (now - newest > 7200000) return;
    var seenO = {}, close = g.filter(function (x) { var o = outlet(x.s); if (newest - x.ts >= 7200000 || seenO[o]) return false; seenO[o] = 1; return true; });   // each outlet counts once
    if (close.length < Math.max(2, n.srcN) || sent >= 2 || !once("bn:" + g[g.length - 1].u)) return;
    sent++;
    toast("news", g[0].t, close.length + " sources · " + close.map(function (x) { return x.s; }).join(", "), { a: "news", k: g[0].u });
  });
}
// Stocks: a fast move (compared with the price up to 35 minutes ago) or a big move on the day
var QH = {}, STOCKN = load("sp_stockn", {});
function stockAlerts(data) {
  var n = NTF(), now = Date.now(), sent = 0;
  if (n.stock === false || !P.stocks) return;
  P.stocks.forEach(function (x) {
    var s = tk(x.id), q = data[s];
    if (!q || !q.p || P.hidden["s:" + x.id]) return;
    var h = QH[s] = (QH[s] || []).filter(function (o) { return now - o.t < 2100000; });
    var today = q.c != null ? (q.c >= 0 ? "+" : "") + q.c.toFixed(1) + "% today" : "", go = { a: "stock", k: x.id }, fast = false;
    if (h.length) {
      var pc = (q.p - h[0].p) / h[0].p * 100;
      if (Math.abs(pc) >= n.pct && sent < 3 && once("sf:" + s + (pc > 0 ? "u" : "d") + Math.floor(now / 1800000))) {
        sent++; fast = true;
        // this card already says where the stock stands today, so the "up X% today" card is not sent as well
        if (q.c != null && Math.abs(q.c) >= n.day) { STOCKN[s] = { c: q.c, p: q.p, t: now }; save("sp_stockn", STOCKN); }
        toast("stock", s + (pc > 0 ? " ▲ +" : " ▼ ") + pc.toFixed(1) + "% in " + Math.max(1, Math.round((now - h[0].t) / 60000)) + " min", "Now " + q.p.toFixed(2) + (today ? " · " + today : ""), go);
      }
    }
    h.push({ t: now, p: q.p });
    // A big move on the day is announced once. It is announced again only if the price has changed since AND the move
    // flipped direction, grew a lot more, or it is a new trading day. A closed market (same price for hours) stays quiet.
    var rec = STOCKN[s], moved = !rec || rec.p !== q.p;
    if (!fast && q.c != null && Math.abs(q.c) >= n.day && sent < 3 && (!rec || (moved && ((rec.c > 0) !== (q.c > 0) || Math.abs(q.c) >= Math.abs(rec.c) + Math.max(2, n.day / 2) || now - rec.t > 72000000)))) {
      sent++;
      STOCKN[s] = { c: q.c, p: q.p, t: now }; save("sp_stockn", STOCKN);
      toast("stock", s + " is " + (q.c > 0 ? "up " : "down ") + Math.abs(q.c).toFixed(1) + "% today", "Now " + q.p.toFixed(2) + " · click for the news", go);
    }
  });
}

// ---- Calendar: your own events with optional reminders and repeats (saved with your settings) ----
function pad2(n) { return n < 10 ? "0" + n : "" + n; }
function ymd(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
function evOn(e, ds) {
  if (ds < e.d) return false;
  if (ds === e.d || e.rep === "d") return true;
  if (!e.rep) return false;
  var a = new Date(e.d + "T12:00:00"), b = new Date(ds + "T12:00:00");
  return e.rep === "w" ? a.getDay() === b.getDay() : e.rep === "m" ? a.getDate() === b.getDate() : e.rep === "y" ? a.getDate() === b.getDate() && a.getMonth() === b.getMonth() : false;
}
function evsOn(ds) { return (P.cal || []).filter(function (e) { return evOn(e, ds); }).concat(spCalMap()[ds] || []).sort(function (a, b) { return (a.tm || "").localeCompare(b.tm || ""); }); }
var CALV = null, REPS = { "": "Once", d: "Daily", w: "Weekly", m: "Monthly", y: "Yearly" }, REMS = [["", "No reminder"], ["0", "At the time"], ["5", "5 min before"], ["15", "15 min before"], ["30", "30 min before"], ["60", "1 hour before"], ["1440", "1 day before"]];
function dayLabel(ds) { return new Date(ds + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }
function openCal() {
  var draft = $("calT") ? $("calT").value : "";
  putWidget("cal");
  if ($("calT")) $("calT").value = draft;
}
function calHtml() {
  var now = new Date(), today = ymd(now);
  if (!CALV) CALV = { y: now.getFullYear(), m: now.getMonth(), sel: today };
  if (!SPCALWANT && spCalOn()) { SPCALWANT = true; setTimeout(fetchSports, 0); }
  var start = (new Date(CALV.y, CALV.m, 1).getDay() + 6) % 7, days = new Date(CALV.y, CALV.m + 1, 0).getDate(), cells = "";
  ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].forEach(function (d) { cells += "<i>" + d + "</i>"; });
  for (var i = 0; i < start; i++) cells += "<span></span>";
  for (var d = 1; d <= days; d++) {
    var ds = CALV.y + "-" + pad2(CALV.m + 1) + "-" + pad2(d);
    cells += '<button data-a="calday" data-k="' + ds + '" class="' + (ds === today ? "td " : "") + (ds === CALV.sel ? "on" : "") + '">' + d + (evsOn(ds).length ? "<u></u>" : "") + "</button>";
  }
  var evRow = function (e, ds, withDay) {
    return '<div class="row"><span>' + (withDay ? '<button class="lnk" data-a="caljump" data-k="' + ds + '"><b class="ctm">' + dayLabel(ds) + "</b></button> " : "") + '<b class="ctm">' + (e.tm || "all day") + "</b> " + (e.sp ? '<button class="lnk calsp" data-a="open" data-k="' + esc("p:" + e.sp) + '" title="A favorite\'s game. Click for the details.">' + spIcon(e.spo) + esc(e.t) + "</button>" : esc(e.t)) +
      (e.rep ? " <small>↻ " + REPS[e.rep].toLowerCase() + "</small>" : "") + (e.rem != null ? ' <small title="Reminder">◷ ' + (e.rem ? (e.rem >= 1440 ? "1d" : e.rem >= 60 ? "1h" : e.rem + "m") : "on time") + "</small>" : "") +
      "</span>" + (withDay || e.sp ? "" : '<button data-a="caldel" data-k="' + e.id + '" aria-label="Delete event">✕</button>') + "</div>";
  };
  var up = [];
  for (var k = 1; k <= 90 && up.length < 5; k++) {
    var uds = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + k));
    evsOn(uds).forEach(function (e) { if (up.length < 5) up.push(evRow(e, uds, true)); });
  }
  return '<div class="calwrap"><div><div class="calh"><button data-a="calnav" data-k="-1" aria-label="Previous month">◀</button><b>' +
    new Date(CALV.y, CALV.m, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) + '</b><button data-a="calnav" data-k="1" aria-label="Next month">▶</button><button data-a="calnav" data-k="0">Today</button></div><div class="calg">' + cells + "</div></div>" +
    '<div class="calr"><h3>' + (CALV.sel === today ? "Today · " : "") + dayLabel(CALV.sel) + "</h3>" + (evsOn(CALV.sel).map(function (e) { return evRow(e, CALV.sel); }).join("") || '<p class="mut sn">Nothing planned.</p>') +
    '<form id="calAdd" class="cadd"><input type="text" id="calT" placeholder="Add an event…" maxlength="120"><input type="time" id="calTm" aria-label="Time (empty = all day)" title="Time (leave empty for all day)">' +
    '<select id="calRem" aria-label="Reminder">' + opts(REMS, "") + '</select><select id="calRep" aria-label="Repeat">' + opts(Object.keys(REPS).map(function (r) { return [r, REPS[r]]; }), "") + '</select><button class="pri">Add</button></form>' +
    (up.length ? "<h3>Coming up</h3>" + up.join("") : "") + "</div></div>";
}
function calAct(a, k) {
  if (a === "calday" || a === "caljump") { CALV.sel = k; CALV.y = +k.slice(0, 4); CALV.m = +k.slice(5, 7) - 1; }
  else if (a === "calnav") {
    if (k === "0") CALV = null;
    else { var d = new Date(CALV.y, CALV.m + (+k), 1); CALV.y = d.getFullYear(); CALV.m = d.getMonth(); }
  }
  else if (a === "caldel") { P.cal = (P.cal || []).filter(function (e) { return e.id !== k; }); persist(); render(); }
  openCal();
}
document.addEventListener("submit", function (e) {
  if (e.target.id !== "calAdd") return;
  e.preventDefault();
  var t = $("calT").value.trim();
  if (!t) return;
  if ((P.cal = P.cal || []).length >= 300) { alert("The calendar is full (300 events). Delete some old ones first."); return; }
  var ev = { id: "e" + Date.now().toString(36), t: t, d: CALV.sel };
  if ($("calTm").value) ev.tm = $("calTm").value;
  if ($("calRem").value !== "") { ev.rem = +$("calRem").value; if (NTF().desktop) askNotify(); }
  if ($("calRep").value) ev.rep = $("calRep").value;
  P.cal.push(ev); $("calT").value = "";
  persist(); render(); openCal(); $("calT").focus();
});
// Reminders: all-day events count as starting at 09:00
function calCheck() {
  if (NTF().cal === false || !P.cal || !P.cal.length) return;
  var now = Date.now();
  [0, 1].forEach(function (off) {
    var t = new Date(), ds = ymd(new Date(t.getFullYear(), t.getMonth(), t.getDate() + off));
    evsOn(ds).forEach(function (e) {
      if (e.rem == null) return;
      var start = new Date(ds + "T" + (e.tm || "09:00") + ":00").getTime();
      if (now < start - e.rem * 60000 || now > start + 3600000 || !once("cal:" + e.id + ds)) return;
      var m = Math.round((start - now) / 60000);
      toast("cal", e.t, (off ? "Tomorrow" : "Today") + (e.tm ? " " + e.tm : "") + (m > 90 ? "" : m > 1 ? " · in " + m + " min" : m > -2 ? " · now" : " · started " + (-m) + " min ago"),
        { a: "cal", k: ds }, true);
    });
  });
}
setInterval(calCheck, 20000);

// ---- Hover preview: rest the mouse on a headline or Telegram post to see the picture and text without opening it ----
var PEEK = {}, peekT = 0, peekKey = "";
function peekData(k) {
  var u = k.slice(2);
  if (k.charAt(0) === "r") {
    var rp = RD.filter(function (x) { return x.u === u; })[0];
    return rp ? { title: rp.t, text: rp.d, img: safeUrl(rp.img), meta: "r/" + rp.s + (rp.by ? " · " + rp.by : "") + " · " + when(rp.ts) } : null;
  }
  if (k.charAt(0) === "m") {
    var p = TGP.filter(function (x) { return x.u === u; })[0];
    return p ? { title: "", text: p.tx || p.t, img: safeUrl(p.img) || safeUrl(p.th), meta: p.s + " · " + when(p.ts) + (p.vid ? " · video" : "") } : null;
  }
  var g = NG.filter(function (x) { return x.some(function (n) { return n.u === u; }); })[0], n = g && g.filter(function (x) { return x.u === u; })[0];
  if (!n) return null;
  var ex = PEEK[u] || {}, best = g.filter(function (x) { return x.d; })[0];
  return { title: n.t, text: n.d || (best && best.d) || ex.d || "", img: safeUrl(n.img) || safeUrl(ex.img), need: !n.d && !PEEK[u], u: u,
    meta: g.map(function (x) { return x.s; }).join(" · ") + " · " + when(n.ts) };
}
function showPeek(el, k) {
  var d = peekData(k), p = $("peek");
  if (!d || EDIT) return;
  p.innerHTML = (d.img ? '<img alt="" referrerpolicy="no-referrer" data-rm="1" src="' + esc(d.img) + '">' : "") + '<div class="pk">' + (d.title ? "<b>" + esc(d.title) + "</b>" : "") +
    (d.text ? "<p>" + esc(d.text.slice(0, 700)) + (d.text.length > 700 ? "…" : "") + "</p>" : d.need ? '<p class="mut">Loading summary…</p>' : "") + "<small>" + esc(d.meta) + "</small></div>";
  placePeek(el);
  if (!d.need) return;
  if (!sb || !USER || /(^|\.)(google|bing|yahoo)\.com$/.test((d.u.match(/^https?:\/\/([^\/]+)/) || [])[1] || "")) { PEEK[d.u] = {}; showPeek(el, k); return; }
  PEEK[d.u] = {};
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { peek: d.u } }).then(function (res) {
    PEEK[d.u] = (res.data && res.data.peek) || {};
    if (peekKey === k && !p.hidden && document.contains(el)) showPeek(el, k);
  }).catch(function () {});
}
// Beside the box the mouse is in (or under it, for the small boxes in the top row), kept inside the window
function placePeek(el, below) {
  var p = $("peek");
  p.hidden = false;
  var r = el.getBoundingClientRect(), c = (el.closest(".card") || el).getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight, x = c.right + 8, y = r.top - 12;
  if (x + w > innerWidth - 8) x = c.left - w - 8;
  if (below || x < 8) { x = Math.max(8, Math.min(r.left, innerWidth - w - 8)); y = (below ? c.bottom : r.bottom) + 6; if (y + h > innerHeight - 8) y = r.top - h - 6; }
  p.style.left = Math.round(x) + "px"; p.style.top = Math.round(Math.max(8, Math.min(y, innerHeight - h - 8))) + "px";
}
// Mail tile: the latest unread subjects
function showMailPeek(el, i) {
  var m = MAIL[i], c = P.mail && P.mail[i];
  if (!m || m.error || !c || EDIT) return;
  var seen = c.seen, items = (m.items || []).slice().sort(function (a, b) { return b.ts - a.ts; }).slice(0, 6), n = mailN(i);
  $("peek").innerHTML = '<div class="pk"><b>' + esc(c.name || "Mail") + " · " + n.txt + " " + n.lab + "</b>" + (items.map(function (x) {
    return '<div class="pm' + (seen && x.ts > seen * 1000 ? " nw" : "") + '"><span><b>' + esc((x.from || "").replace(/<.*>/, "").replace(/"/g, "").trim() || x.from || "") + "</b> " + esc(x.subject || "(no subject)") + "</span><small>" + ago(x.ts) + "</small></div>";
  }).join("") || '<p class="mut">No unread mail.</p>') + "</div>";
  placePeek(el, true);
}
function hidePeek() { clearTimeout(peekT); peekKey = ""; $("peek").hidden = true; $("peek").classList.remove("fpk"); }
var PEEKSEL = '#grid [data-a="open"], #grid .mailcell[data-a="mail"], [data-a="fighter"], #grid [data-a="radinfo"]';
document.addEventListener("mouseover", function (e) {
  var b = e.target.closest && e.target.closest(PEEKSEL), mail = b && b.dataset.a === "mail", ftr = b && b.dataset.a === "fighter", rad = b && b.dataset.a === "radinfo", k = b && (mail ? "mail:" + b.dataset.k : ftr ? "f:" + b.dataset.k : rad ? "radio" : b.dataset.k);
  // the Radio box: the song card shows while the mouse is on the box itself, not on its list and buttons
  if (rad && (e.target.closest("select, button, input, .dd") || MENU_OPEN)) { if (peekKey === "radio") hidePeek(); return; }
  if (rad) { if (peekKey === "radio") return; clearTimeout(peekT); peekKey = "radio"; peekT = setTimeout(function () { if (peekKey === "radio" && document.contains(b) && $("modal").hidden) showRadioPeek(b); }, 350); return; }
  if (!b || !(mail || ftr || /^[amrpt]:/.test(k))) return;
  if (k === peekKey) return;
  clearTimeout(peekT); peekKey = k;
  peekT = setTimeout(function () {
    if (peekKey !== k || !document.contains(b)) return;
    if (ftr) { showFighterPeek(b, b.dataset.k); return; }   // a fighter's name in a card or fight window
    if (!$("modal").hidden) return;
    if (mail) showMailPeek(b, +b.dataset.k); else if (k.charAt(0) === "p") showSportPeek(b, k.slice(2)); else if (k.charAt(0) === "t") showTwPeek(b, k.slice(2)); else showPeek(b, k);
  }, 350);
});
document.addEventListener("mouseout", function (e) {
  var b = e.target.closest && e.target.closest(PEEKSEL);
  if (b && !(e.relatedTarget && b.contains(e.relatedTarget))) hidePeek();
});
document.addEventListener("scroll", hidePeek, true);
document.addEventListener("click", hidePeek, true);

// ---- Stock window: recent news and chatter, to see why it is moving ----
function loadStockNews(id) {
  var box = $("stInfo"), s = tk(id);
  if (!box) return;
  if (!sb || !USER) { box.innerHTML = '<p class="mut sn">Sign in to load news for this stock.</p>'; return; }
  sb.functions.invoke("quotes", { body: { news: s } }).then(function (r) {
    if ($("stInfo") !== box) return;
    var v = r.data;
    if (r.error || !v || v._err || !v.news) { box.innerHTML = '<p class="mut sn">' + (v && !v._err && !v.news ? "Stock news needs the updated <b>quotes</b> function. Redeploy it in Supabase." : "Could not load news right now.") + "</p>"; return; }
    var item = function (x, sub) { var u = safeUrl(x.u); return '<div class="si">' + (u ? '<a target="_blank" rel="noopener noreferrer" href="' + esc(u) + '">' + esc(x.t) + "</a>" : "<span>" + esc(x.t) + "</span>") + " <small>" + sub + "</small></div>"; };
    box.innerHTML = "<h3>Why is it moving? Latest news" + (v.via ? " · " + esc(v.via) : "") + "</h3>" +
      (v.news.map(function (x) { return item(x, esc(x.s) + " · " + ago(x.ts)); }).join("") || '<p class="mut sn">No recent news found for ' + esc(s) + ".</p>") +
      (v.chat && v.chat.length ? "<h3>What people are saying</h3>" + v.chat.map(function (x) {
        return item(x, esc(x.by) + " · " + ago(x.ts) + (x.mood ? ' · <span class="' + (/bull/i.test(x.mood) ? "up" : "down") + '">' + esc(x.mood) + "</span>" : ""));
      }).join("") : "");
  }).catch(function () { if ($("stInfo") === box) box.innerHTML = '<p class="mut sn">Could not load news right now.</p>'; });
}

// ---- Morning summary: what happened in the last 24 hours, in one small window ----
var BRIEF_T = "Since yesterday";
// "Top" = what most of your feeds are talking about. Every headline, Telegram post and Reddit title from the last 24 hours
// is broken into words; a story scores by how often its words turn up elsewhere (names and numbers count extra), plus a
// bonus for several sources reporting it and for your highlight words. Near-duplicates and a fourth story on the same
// name are skipped, so the list covers different topics.
// a headline's words as a plain list, and which of them are names or numbers
function tokSet(t, lg) {
  var o = { set: [], strong: {} };
  tokz(t, lg).forEach(function (x) { o.set.push(x.w); if (x.k === "n" || x.k === "p" || x.k === "d") o.strong[x.w] = 1; });
  return o;
}
function topStories(n) {
  var now = Date.now(), cut = now - 86400000, df = {};
  NEWS.concat(TGP, RD).forEach(function (x) {
    if (x.ts < cut) return;
    var seen = {};
    tokSet(x.t, x.lg).set.forEach(function (w) { if (!seen[w]) { seen[w] = 1; df[w] = (df[w] || 0) + 1; } });
  });
  var pool = newsGroups().filter(function (g) { return g[0].ts > cut; }).map(function (g) {
    var tk = tokSet(g[0].t, g[0].lg), uniq = {}, heat = 0;
    tk.set.forEach(function (w) {
      if (uniq[w]) return;
      uniq[w] = 1;
      var extra = (df[w] || 1) - g.length;
      if (extra > 0) heat += Math.min(extra, 12) * (tk.strong[w] ? 1.5 : 1);
    });
    var words = Object.keys(uniq);
    return { g: g, words: words, strong: words.filter(function (w) { return tk.strong[w]; }), score: ((g.src ? g.src.length : g.length) - 1) * 4 + heat / Math.sqrt(Math.max(4, words.length)) + (g.hi ? 3 : 0) - (now - g[0].ts) / 3600000 * 0.08 };
  }).sort(function (a, b) { return b.score - a.score; });
  var out = [], used = {};
  pool.forEach(function (p) {
    if (out.length >= n) return;
    var dup = out.some(function (o) { var sh = p.words.filter(function (w) { return o.words.indexOf(w) >= 0; }).length; return sh >= 3 || sh / Math.min(p.words.length, o.words.length) >= 0.5; });
    if (dup || p.strong.some(function (w) { return used[w] >= 2; })) return;
    p.strong.forEach(function (w) { used[w] = (used[w] || 0) + 1; });
    out.push(p);
  });
  return out.map(function (o) { return o.g; });
}
function briefHtml() {
  var now = Date.now(), cut = now - 86400000, h = "", sec = function (t, body) { return body ? "<h3>" + t + "</h3>" + body : ""; };
  var warn = WX ? wxWarn(WX) : [];
  if (warn.length) h += '<div class="warnbox">' + warn.map(function (x) { return "<div><b>! " + x.t + "</b> " + x.day.toLowerCase() + (x.x ? " · " + esc(x.x) : "") + "</div>"; }).join("") + "</div>";
  var todayEv = evsOn(ymd(new Date()));
  h += sec("Today in your calendar", todayEv.map(function (e) { return '<div class="row"><span><b class="ctm">' + (e.tm || "all day") + "</b> " + esc(e.t) + "</span></div>"; }).join(""));
  var top = NEWS.length ? topStories(6) : [];
  h += sec("Top stories", top.map(function (g) {
    return '<div class="row' + (g.some(function (x) { return READ[x.u]; }) ? " rd" : "") + '"><span><button class="lnk" data-a="open" data-k="' + esc("a:" + g[0].u) + '">' + esc(g[0].t) + "</button> <small>" + esc(g.map(function (x) { return x.s; }).join(" · ")) + '</small></span><span class="r"><span class="mut">' + ago(g[0].ts) + "</span>" + (g.length > 1 ? '<span class="pill ac">' + g.length + "</span>" : "") + "</span></div>";
  }).join(""));
  var mv = (P.stocks || []).map(function (x) { var q = QUOTES[tk(x.id)]; return q && q.c != null && !P.hidden["s:" + x.id] ? { id: x.id, c: q.c } : null; }).filter(Boolean).sort(function (a, b) { return Math.abs(b.c) - Math.abs(a.c); }).slice(0, 6);
  h += sec("Biggest movers", mv.length ? '<div class="chips">' + mv.map(function (x) { return '<button data-a="open" data-k="' + esc("s:" + x.id) + '"><b>' + esc(tk(x.id)) + '</b> <span class="' + (x.c >= 0 ? "up" : "down") + '">' + (x.c >= 0 ? "+" : "") + x.c.toFixed(1) + "%</span></button>"; }).join("") + "</div>" : "");
  var mail = [0, 1].map(function (i) { var c = P.mail && P.mail[i], m = MAIL[i]; if (!c || !c.url || !m || m.error) return ""; var n = mailN(i); return '<button data-a="mail" data-k="' + i + '"><b>' + esc(c.name || "Mail") + "</b> " + n.txt + " " + n.lab + "</button>"; }).join("");
  h += sec("Mail", mail ? '<div class="chips">' + mail + "</div>" : "");
  var live = (TWC && TW ? TW : []).filter(function (x) { return !P.hidden["t:" + x.id]; }).sort(function (a, b) { return (P.fav["t:" + b.id] ? 1 : 0) - (P.fav["t:" + a.id] ? 1 : 0) || b.v - a.v; }).slice(0, 8);
  h += sec("Live now", live.length ? '<div class="chips">' + live.map(function (x) { return '<button data-a="open" data-k="' + esc("t:" + x.id) + '" title="' + esc(x.title || "") + '"><span class="dot"></span><b>' + esc(x.name || x.id) + "</b> <small>" + esc(x.sub || "") + "</small></button>"; }).join("") + "</div>" : "");
  return h || '<p class="mut">Nothing to show yet. Sign in and let the page load first.</p>';
}
function openBrief() { openModal(BRIEF_T, '<div class="brief">' + briefHtml() + "</div>"); }
// Keeps an open summary up to date while the rest of the data is still arriving
function refreshBrief() { if (!$("modal").hidden && $("mTitle").textContent === BRIEF_T) $("mBody").innerHTML = '<div class="brief">' + briefHtml() + "</div>"; }
function maybeBrief() {
  var today = ymd(new Date());
  if (P.brief === false || !USER || !NEWS.length || !$("modal").hidden || load("sp_brief", "") === today) return;
  save("sp_brief", today);
  openBrief();
}

// ---- Sports: live scores and fixtures from ESPN's public scoreboard (read straight from the browser, no key) ----
// The catalog of leagues you can switch on in Settings > Sports. Order = importance: with several games on at once,
// earlier leagues are listed first. `on` = part of the starting set.
// kind: (none) two teams and a score · card = UFC fight card · tour = tennis tournament with many matches · race = F1 weekend / golf tournament
var SP_CATALOG = [
  { id: "soccer/uefa.champions", sp: "football", n: "Champions League", on: 1 }, { id: "soccer/eng.1", sp: "football", n: "Premier League", on: 1 },
  { id: "soccer/esp.1", sp: "football", n: "La Liga", on: 1 }, { id: "soccer/ita.1", sp: "football", n: "Serie A", on: 1 },
  { id: "soccer/ger.1", sp: "football", n: "Bundesliga", on: 1 }, { id: "soccer/fra.1", sp: "football", n: "Ligue 1", on: 1 },
  { id: "soccer/uefa.europa", sp: "football", n: "Europa League", on: 1 }, { id: "soccer/uefa.europa.conf", sp: "football", n: "Conference League" },
  { id: "soccer/eng.2", sp: "football", n: "Championship (England)" }, { id: "soccer/ned.1", sp: "football", n: "Eredivisie" },
  { id: "soccer/por.1", sp: "football", n: "Primeira Liga" }, { id: "soccer/swe.1", sp: "football", n: "Allsvenskan" }, { id: "soccer/usa.1", sp: "football", n: "MLS" },
  { id: "basketball/nba", sp: "basketball", n: "NBA", on: 1 }, { id: "basketball/wnba", sp: "basketball", n: "WNBA" },
  { id: "mma/ufc", sp: "ufc", n: "UFC", kind: "card", on: 1 },
  { id: "hockey/nhl", sp: "hockey", n: "NHL" },
  { id: "football/nfl", sp: "amfootball", n: "NFL" },
  { id: "baseball/mlb", sp: "baseball", n: "MLB" },
  { id: "tennis/atp", sp: "tennis", n: "ATP tennis", kind: "tour" }, { id: "tennis/wta", sp: "tennis", n: "WTA tennis", kind: "tour" },
  { id: "racing/f1", sp: "racing", n: "Formula 1", kind: "race" },
  { id: "golf/pga", sp: "golf", n: "PGA Tour", kind: "race" },
  // Not on ESPN: these come through the feeds function (x = its name for the source), so they need you to be signed in.
  // SHL from shl.se; esports from bo3.gg (the two top tiers of tournaments).
  { id: "x/shl", sp: "hockey", n: "SHL (Sweden)", x: "shl" },
  { id: "x/cs2", sp: "esports", n: "Counter-Strike 2", x: "cs2" }, { id: "x/lol", sp: "esports", n: "League of Legends", x: "lol" }, { id: "x/dota2", sp: "esports", n: "Dota 2", x: "dota2" }
];
var SP_NAME = { football: "Football", basketball: "Basketball", ufc: "UFC", hockey: "Ice hockey", amfootball: "American football", baseball: "Baseball", tennis: "Tennis", racing: "Formula 1", golf: "Golf", esports: "Esports" };
function spLeagues() { var on = P.spLeagues; return SP_CATALOG.filter(function (l) { return on ? on.indexOf(l.id) >= 0 : l.on; }); }
function spSports() {
  var seen = {}, out = [["", "All sports"]];
  spLeagues().forEach(function (l) { if (!seen[l.sp]) { seen[l.sp] = 1; out.push([l.sp, SP_NAME[l.sp] || l.sp]); } });
  return out;
}
var SP_NOW = {}, SP_UP = {}, SPERR = "", SP_OPEN = "", SP_VIEWS = [["now", "Live & today"], ["up", "Upcoming"], ["fav", "Favorites"]];
// Your favorite sport (Settings > Sports) gets a view of its own in the box: everything on now, today and coming up
function spFavSport() { var s = P.spFavSport || ""; return s && spLeagues().some(function (l) { return l.sp === s; }) ? s : ""; }
function spViews() { var f = spFavSport(); return SP_VIEWS.concat(f ? [["sport", "★ " + (SP_NAME[f] || f)]] : []); }
function spView() { return P.spView === "up" || P.spView === "fav" || (P.spView === "sport" && spFavSport()) ? P.spView : "now"; }
function spSport() { if (spView() === "sport") return spFavSport(); var s = P.spSport || ""; return s && spLeagues().some(function (l) { return l.sp === s; }) ? s : ""; }
function spFavs() { return P.spFav || []; }
function spIsFav(name) { return spFavs().indexOf(name) >= 0; }
function spParse(lg, j, pri) {
  var now = Date.now();
  return ((j && j.events) || []).map(function (e) {
    var st = (e.status && e.status.type) || {}, link = safeUrl(((e.links || [])[0] || {}).href);
    var o = { id: lg.id + ":" + e.id, lg: lg.n, sp: lg.sp, kind: lg.kind || "team", pri: pri, ts: Date.parse(e.date), state: st.state || "pre", detail: st.shortDetail || "", link: link, names: [] };
    var pair = function (c, label, detail) {
      var a = (c.competitors || [])[0] || {}, b = (c.competitors || [])[1] || {}, cs = (c.status && c.status.type) || {};
      var rec = function (x) { return (((x.records || [])[0]) || {}).summary || ""; }, st = c.status || {};
      return { a: (a.athlete || {}).displayName || "?", b: (b.athlete || {}).displayName || "?", aw: !!a.winner, bw: !!b.winner, state: cs.state || "pre", detail: detail != null ? detail : cs.shortDetail || "", wc: label, ts: Date.parse(c.date),
        // for the fight window: ESPN's numbers for the fight and the two fighters, their records, the round and the clock
        cid: String(c.id || ""), aid: String(a.id || ""), bid: String(b.id || ""), ar: rec(a), br: rec(b), per: +st.period || 0, clk: st.displayClock || "", rounds: +(((c.format || {}).regulation || {}).periods) || 0 };
    };
    if (o.kind === "card") {
      o.title = String(e.name || e.shortName || "UFC").replace(/^UFC Fight Night:/, "UFC FN:");
      o.cardTitle = "Fight card (main event first)";
      o.eid = String(e.id || "");
      // the main event is the last fight on the card
      o.fights = (e.competitions || []).map(function (c) { return pair(c, (c.type || {}).abbreviation || ""); }).reverse();
      if (o.fights.some(function (f) { return f.state === "in"; })) o.state = "in";
      if (o.state === "in") o.detail = "LIVE";
    } else if (o.kind === "tour") {
      // a tournament: keep the singles matches that are live or within a day and a half, live ones first
      var ms = [];
      (e.groupings || []).forEach(function (g) {
        var gname = (g.grouping || {}).displayName || "";
        if (!/singles/i.test(gname)) return;
        (g.competitions || []).forEach(function (c) {
          var cs = (c.status && c.status.type) || {}, ts = Date.parse(c.date);
          if (cs.state !== "in" && Math.abs(ts - now) > 129600000) return;
          var sets = function (x) { return ((x || {}).linescores || []).map(function (l) { return Math.round(l.value); }).join(" "); };
          ms.push(pair(c, (c.round || {}).displayName || gname, cs.state === "pre" ? "" : sets(c.competitors[0]) + " / " + sets(c.competitors[1])));
        });
      });
      var rank = function (m) { return m.state === "in" ? 0 : m.state === "pre" ? 1 : 2; };
      o.fights = ms.sort(function (a, b) { return rank(a) - rank(b) || (a.state === "post" ? b.ts - a.ts : a.ts - b.ts); }).slice(0, 40);
      o.title = e.name || e.shortName || lg.n;
      o.cardTitle = "Matches (live first, then the nearest)";
      var liveN = ms.filter(function (m) { return m.state === "in"; }).length;
      var nextM = ms.filter(function (m) { return m.state === "pre"; }).sort(function (a, b) { return a.ts - b.ts; })[0];
      if (liveN) { o.state = "in"; o.detail = liveN + " live"; }
      else if (nextM) { o.state = "pre"; o.ts = nextM.ts; }   // nothing on court right now: show when the next match starts
      else if (o.state === "in") o.detail = "On now";
    } else if (o.kind === "race") {
      // a race weekend (practice, qualifying, race) or a golf tournament
      o.title = e.name || e.shortName || lg.n;
      o.sessions = (e.competitions || []).map(function (c) { var cs = (c.status && c.status.type) || {}; return { n: (c.type || {}).abbreviation || (c.type || {}).text || "", state: cs.state || "pre", ts: Date.parse(c.date), detail: cs.shortDetail || "" }; }).filter(function (s) { return s.n; });
      var lead = ((e.competitions || [])[(e.competitions || []).length - 1] || {}).competitors || [];
      o.top = lead.slice().sort(function (a, b) { return (a.order || 99) - (b.order || 99); }).slice(0, 5).map(function (c) { return { n: (c.athlete || {}).displayName || "?", s: c.score != null && typeof c.score !== "object" ? String(c.score) : "" }; });
      var liveS = o.sessions.filter(function (s) { return s.state === "in"; })[0], nextS = o.sessions.filter(function (s) { return s.state === "pre"; })[0];
      if (liveS) { o.state = "in"; o.detail = liveS.n; }
      else if (o.sessions.length && nextS) { o.state = "pre"; o.ts = nextS.ts; }
      else if (o.state === "in") o.detail = o.detail || "On now";
    } else {
      var comp = (e.competitions || [])[0] || {}, cs2 = comp.competitors || [];
      var side = function (ha) {
        var c = cs2.filter(function (x) { return x.homeAway === ha; })[0] || {}, t = c.team || {}, st = {};
        (c.statistics || []).forEach(function (x) { st[x.name] = x.displayValue; });
        return {
          n: t.shortDisplayName || t.displayName || "?", ab: String(t.abbreviation || t.shortDisplayName || t.displayName || "?").slice(0, 4).toUpperCase(), s: c.score, logo: safeUrl(t.logo), win: !!c.winner, id: String(t.id || ""),
          lines: (c.linescores || []).map(function (l) { return Math.round(l.value); }), st: st,
          // top performers (points, goals, assists...), one per category
          lead: (c.leaders || []).slice(0, 3).map(function (l) { var x = (l.leaders || [])[0] || {}; return { cat: l.shortDisplayName || l.displayName || "", who: (x.athlete || {}).displayName || "", val: x.displayValue || "" }; }).filter(function (l) { return l.who; })
        };
      };
      o.home = side("home"); o.away = side("away");
      o.names = [o.home.n, o.away.n];
      // what happened: goals and cards with minute and player (football), venue, crowd, and ESPN's one-line recap
      o.ev = (comp.details || []).map(function (d) {
        var kind = d.redCard ? "red" : d.yellowCard ? "yel" : d.scoringPlay ? "goal" : "";
        return kind ? { k: kind, min: (d.clock || {}).displayValue || "", who: ((d.athletesInvolved || [])[0] || {}).displayName || "", side: String((d.team || {}).id) === o.home.id ? "h" : "a", pen: !!d.penaltyKick, og: !!d.ownGoal } : null;
      }).filter(Boolean);
      o.venue = (comp.venue || {}).fullName || ""; o.att = +comp.attendance || 0;
      o.recap = ((comp.headlines || [])[0] || {}).shortLinkText || "";
    }
    if (o.fights) o.names = o.fights.reduce(function (acc, f) { acc.push(f.a, f.b); return acc; }, []);
    return o;
  }).filter(function (o) { return !isNaN(o.ts); });
}
function spGet(lg, pri, month) {
  var store = month ? SP_UP : SP_NOW, key = lg.id + (month || "");
  store[key] = store[key] || { t: 0, ev: [] };
  store[key].t = Date.now();
  return fetch("https://site.api.espn.com/apis/site/v2/sports/" + lg.id + "/scoreboard" + (month ? "?dates=" + month + "&limit=200" : ""))
    .then(function (r) { if (!r.ok) throw new Error("ESPN answered " + r.status); return r.json(); })
    .then(function (j) { store[key].ev = spParse(lg, j, pri); store[key].ok = 1; SPERR = ""; SPV++; })
    .catch(function (e) { if (!store[key].ok) SPERR = String((e && e.message) || e); });
}
// Today's scoreboards: every minute for a league with a game in play (tennis every three: its file is large), otherwise
// every 5 minutes. Upcoming / Favorites also need the month's fixtures: fetched when you open that view, then every 30 minutes.
// With favorite alerts on, every league you follow keeps loading (also with the box filtered to one sport, or hidden),
// and a league whose game is about to start is checked every minute so the kick-off is noticed on time.
function spAlertsOn() { return NTF().sport !== false && spFavs().length > 0; }
function fetchSports(force) {
  var alerts = spAlertsOn();
  if (boxOff("sports") && !alerts) return;
  var now = Date.now(), jobs = [], xs = [], sport = spSport();
  spLeagues().forEach(function (lg) {
    if (sport && lg.sp !== sport && !alerts) return;
    var pri = SP_CATALOG.indexOf(lg), c = SP_NOW[lg.id], live = c && c.ev.some(function (e) { return e.state === "in" || (e.state === "pre" && e.ts - now < 90000 && now - e.ts < 1200000); });
    var due = force || !c || now - c.t > (live ? (lg.kind === "tour" ? 175000 : 55000) : 290000);
    if (lg.x) { if (due && sb && USER) xs.push(lg); return; }
    if (due) jobs.push(spGet(lg, pri));
    if ((spView() !== "now" || SPCALWANT) && lg.kind !== "tour" && !lg.x) {
      var d = new Date(), months = [d.getFullYear() + pad2(d.getMonth() + 1)];
      if (d.getDate() > 20) { var n = new Date(d.getFullYear(), d.getMonth() + 1, 1); months.push(n.getFullYear() + pad2(n.getMonth() + 1)); }
      months.forEach(function (m) { var u = SP_UP[lg.id + m]; if (!u || now - u.t > 1800000) jobs.push(spGet(lg, pri, m)); });
    }
  });
  if (xs.length) jobs.push(spGetX(xs));
  if (jobs.length) Promise.all(jobs).then(function () { spAlerts(); render(); refreshCal(); });
}
// Leagues that are not on ESPN, all in one request to the feeds function, which answers every game in one simple shape
function spGetX(list) {
  list.forEach(function (lg) { SP_NOW[lg.id] = SP_NOW[lg.id] || { t: 0, ev: [] }; SP_NOW[lg.id].t = Date.now(); });
  return sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { sportsx: list.map(function (lg) { return lg.x; }) } }).then(function (r) {
    var d = r.data && r.data.sportsx;
    if (!d) return;   // an older feeds function: these leagues stay empty until it is redeployed
    list.forEach(function (lg) {
      if (!Array.isArray(d[lg.x])) return;
      var pri = SP_CATALOG.indexOf(lg), side = function (s) {
        s = s || {};
        return { n: String(s.n || "?"), ab: String(s.ab || s.n || "?").slice(0, 4).toUpperCase(), s: s.s == null ? null : s.s, logo: safeUrl(s.logo), win: !!s.win, id: String(s.ab || "").slice(0, 4).toUpperCase(), lines: [], st: {}, lead: [] };
      };
      SP_NOW[lg.id].ev = d[lg.x].map(function (g) {
        var o = { id: lg.id + ":" + g.id, lg: lg.n, sp: lg.sp, kind: "team", pri: pri, ts: +g.ts, state: g.state === "in" || g.state === "post" ? g.state : "pre", detail: String(g.detail || ""), link: safeUrl(g.link),
          home: side(g.home), away: side(g.away), ev: [], venue: String(g.venue || ""), att: 0, recap: String(g.note || ""),
          tw: (Array.isArray(g.tw) ? g.tw : []).map(String).filter(function (l) { return /^[a-z0-9_]{2,25}$/i.test(l); }).slice(0, 3) };
        o.names = [o.home.n, o.away.n];
        return o;
      }).filter(function (o) { return !isNaN(o.ts); });
      SP_NOW[lg.id].ok = 1; SPV++;
    });
  }).catch(function () {});
}
// ---- Favorites: a notification when a ★ team's game starts, when a goal is scored (football and ice hockey; in other
// sports the score changes all the time) and when it ends. Also when a ★ fighter or tennis player goes on and finishes.
var SPPREV = {}, SPV = 0;
function spAlerts() {
  if (!spAlertsOn()) return;
  Object.keys(SP_NOW).forEach(function (key) {
    SP_NOW[key].ev.forEach(function (e) {
      var go = { a: "sport", k: e.id };
      if (e.kind === "team") {
        if (!e.names.some(spIsFav)) return;
        var cur = { st: e.state, h: +e.home.s || 0, a: +e.away.s || 0 }, p = SPPREV[e.id], foot = e.sp === "football";
        SPPREV[e.id] = cur;
        if (!p) return;   // first look at this game: nothing to compare with yet
        var score = e.home.n + " " + cur.h + "–" + cur.a + " " + e.away.n;
        if (p.st === "pre" && cur.st === "in" && once("spk:" + e.id)) toast("sport", (foot ? "Kick-off: " : "Started: ") + e.home.n + " – " + e.away.n, e.lg, go);
        if (cur.st !== "pre" && (foot || e.sp === "hockey") && cur.h + cur.a > p.h + p.a && once("spg:" + e.id + ":" + cur.h + "-" + cur.a)) {
          var side = cur.h > p.h ? "h" : "a", g = (e.ev || []).filter(function (x) { return x.k === "goal" && x.side === side; }).pop();
          toast("sport", "Goal! " + score, (g && g.who ? g.who + (g.min ? " " + g.min : "") + (g.pen ? " (pen)" : "") + (g.og ? " (own goal)" : "") + " · " : "") + e.lg, go);
        }
        if (p.st === "in" && cur.st === "post" && once("spf:" + e.id)) toast("sport", (foot ? "Full time: " : "Final: ") + score, e.lg, go);
      } else if (e.fights) {
        e.fights.forEach(function (f) {
          if (!spIsFav(f.a) && !spIsFav(f.b)) return;
          var id = e.id + ":" + f.a + ":" + f.b, p = SPPREV[id];
          SPPREV[id] = f.state;
          if (!p) return;
          if (p === "pre" && f.state === "in" && once("spk:" + id)) toast("sport", "On now: " + f.a + " vs " + f.b, e.title, go);
          if (p === "in" && f.state === "post" && once("spf:" + id)) toast("sport", f.aw ? f.a + " beat " + f.b : f.bw ? f.b + " beat " + f.a : "Finished: " + f.a + " vs " + f.b, (f.detail ? f.detail + " · " : "") + e.title, go);
        });
      }
    });
  });
}
// ---- Favorites in the calendar: their games appear on the right day by themselves (they are not saved with your events).
// The month's fixtures are only loaded once the calendar has been opened; today's games are always there.
var SPCALWANT = false, spCalKey = "", spCalMemo = {};
function spCalOn() { return P.spCal !== false && spFavs().length > 0; }
function spCalMap() {
  if (!spCalOn()) return {};
  var key = SPV + "|" + spFavs().join("|") + "|" + (P.spLeagues || []).join("|");
  if (key === spCalKey) return spCalMemo;
  var by = {}, on = {}, m = {};
  spLeagues().forEach(function (l) { on[l.n] = 1; });
  [SP_UP, SP_NOW].forEach(function (store) { Object.keys(store).forEach(function (k) { store[k].ev.forEach(function (e) { by[e.id] = e; }); }); });
  Object.keys(by).forEach(function (k) {
    var e = by[k];
    if (!on[e.lg] || !e.names.some(spIsFav)) return;
    var d = new Date(e.ts), ds = ymd(d);
    (m[ds] = m[ds] || []).push({ id: "sp:" + e.id, sp: e.id, spo: e.sp, d: ds, tm: pad2(d.getHours()) + ":" + pad2(d.getMinutes()),
      t: e.kind === "team" ? e.home.n + " – " + e.away.n + (e.state === "pre" ? "" : " " + (+e.home.s || 0) + "–" + (+e.away.s || 0)) : e.title });
  });
  spCalKey = key; spCalMemo = m;
  return m;
}
// the open calendar (window or docked at the side) is redrawn when new fixtures arrive, keeping what you were typing
function refreshCal() {
  if (!spCalOn()) return;
  if (sideOf("cal") || (!$("modal").hidden && $("mTitle").textContent === WIDGETS.cal.t)) {
    if (document.activeElement && document.activeElement.closest && document.activeElement.closest("#calAdd")) return;
    openCal();
  }
}
function spEvents() {
  var by = {}, view = spView(), sport = spSport(), now = Date.now(), on = {};
  spLeagues().forEach(function (l) { on[l.n] = 1; });
  Object.keys(SP_UP).forEach(function (k) { SP_UP[k].ev.forEach(function (e) { by[e.id] = e; }); });
  Object.keys(SP_NOW).forEach(function (k) { SP_NOW[k].ev.forEach(function (e) { by[e.id] = e; }); });   // today's data is fresher, so it wins
  var all = Object.keys(by).map(function (k) { return by[k]; }).filter(function (e) { return on[e.lg] && (!sport || e.sp === sport); });
  all.forEach(function (e) { e.fav = e.names.some(spIsFav); });
  var live = function (e) { return e.state === "in" ? 1 : 0; }, day = function (t) { return new Date(t).toLocaleDateString("en-CA", { timeZone: TZ }); };
  if (view === "up") return all.filter(function (e) { return e.state === "pre" && e.ts > now - 3600000; }).sort(function (a, b) { return a.ts - b.ts || a.pri - b.pri; }).slice(0, 60);
  if (view === "fav") return all.filter(function (e) { return e.fav && (e.state !== "post" || now - e.ts < 86400000); }).sort(function (a, b) { return live(b) - live(a) || a.ts - b.ts; }).slice(0, 60);
  // your favorite sport: what is on now, then everything today and coming up (soonest first), then today's results
  if (view === "sport") return all.filter(function (e) { return e.state === "in" || (e.state === "pre" && e.ts > now - 10800000) || (e.state === "post" && (day(e.ts) === day(now) || now - e.ts < 43200000)); })
    .sort(function (a, b) { return live(b) - live(a) || (a.state === "post" ? 1 : 0) - (b.state === "post" ? 1 : 0) || (a.state === "post" ? b.ts - a.ts : a.ts - b.ts); }).slice(0, 60);
  return all.filter(function (e) { return e.state === "in" || day(e.ts) === day(now) || (e.state === "post" && now - e.ts < 43200000 && e.kind === "team") || (e.kind !== "team" && e.state === "pre" && e.ts - now < 172800000); })
    .sort(function (a, b) { return live(b) - live(a) || (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || (a.state === "post" ? 1 : 0) - (b.state === "post" ? 1 : 0) || a.pri - b.pri || a.ts - b.ts; }).slice(0, 60);
}
function spWhen(e) {
  if (e.state === "in") return '<span class="pill live">' + esc(String(e.detail || "LIVE").replace("'+", "+")) + "</span>";   // 45'+2' -> 45+2'
  if (e.state === "post") return '<span class="mut">' + esc(e.kind === "team" ? (e.detail || "FT") : "Finished") + "</span>";
  var d = new Date(e.ts), today = d.toLocaleDateString("en-CA", { timeZone: TZ }) === new Date().toLocaleDateString("en-CA", { timeZone: TZ });
  // today: the time. This week: weekday and time. Later: the date. (Short, so the column stays narrow.)
  var hm = d.toLocaleTimeString("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
  return '<span class="mut">' + (today ? hm : e.ts - Date.now() < 6 * 86400000 ? d.toLocaleDateString("en-GB", { timeZone: TZ, weekday: "short" }) + " " + hm : d.toLocaleDateString("en-GB", { timeZone: TZ, day: "numeric", month: "short" })) + "</span>";
}
// One game as fixed columns, so every row lines up: home crest, home short name, score, away short name, away crest.
// (The sport icon comes first and the time or minute sits in its own column on the right; full names are in the tooltip.)
function spTitle(e) {
  if (e.kind !== "team") return '<span class="spn">' + esc(e.title) + "</span>";
  var sc = e.state === "pre" ? '<span class="sc mut">–</span>' : '<b class="sc">' + esc(e.home.s != null ? e.home.s : "") + "–" + esc(e.away.s != null ? e.away.s : "") + "</b>";
  var ab = function (t, side) { return '<span class="ab ' + side + (spIsFav(t.n) ? " fvn" : "") + '">' + esc(t.ab) + "</span>"; };
  return '<span class="tlc">' + spCrest(e.home) + "</span>" + ab(e.home, "hm") + sc + ab(e.away, "aw") + '<span class="tlc">' + spCrest(e.away) + "</span>";
}
// Small sport symbols and 40px team crests (ESPN resizes them for us: 3 KB instead of 36 KB)
var SP_SVG = 'viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
var SP_ICON = {
  football: '<circle cx="12" cy="12" r="9"/><path d="M12 8l3.8 2.8-1.5 4.4H9.7l-1.5-4.4zM12 3v5M3.5 9.6l4.7 1.2M20.5 9.6l-4.7 1.2M6.6 19.2l3.1-4M17.4 19.2l-3.1-4"/>',
  basketball: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.7 5.7c3 2.8 3 9.8 0 12.6M18.3 5.7c-3 2.8-3 9.8 0 12.6"/>',
  ufc: '<path d="M8.3 3h7.4L21 8.3v7.4L15.7 21H8.3L3 15.7V8.3z"/><path d="M9 9.5l6 5M15 9.5l-6 5"/>',
  hockey: '<path d="M6 3l5 12h7a2 2 0 0 1 0 4h-8.5L4 5z"/><ellipse cx="18.5" cy="6" rx="2.5" ry="1.3"/>',
  amfootball: '<path d="M4 20C3 12 12 3 20 4c1 8-8 17-16 16z"/><path d="M9 15l6-6M10.5 10.5l3 3M12.5 8.5l3 3M8.5 12.5l3 3"/>',
  baseball: '<circle cx="12" cy="12" r="9"/><path d="M6.2 5.2c2.6 3.6 2.6 10 0 13.6M17.8 5.2c-2.6 3.6-2.6 10 0 13.6"/>',
  tennis: '<circle cx="12" cy="12" r="9"/><path d="M3.6 8.5c5.5 1 9 5.5 8.9 12.4M20.4 15.5c-5.500-1-9-5.500-8.900-12.400"/>',
  racing: '<path d="M5 21V4M5 4h13l-2.500 4L18 12H5"/><path d="M9.300 4v8M13.600 4v8M5 8h10.500"/>',
  golf: '<path d="M11 21V3l7 3.500-7 3.500"/><path d="M6 21c0-1.700 2.700-3 5-3s5 1.300 5 3z"/>',
  esports: '<rect x="2.500" y="7.500" width="19" height="10" rx="5"/><path d="M7.500 10.500v4M5.500 12.500h4M15.500 11.300h.01M18 13.700h.01"/>'
};
function spIcon(sp) { return '<i class="spi sp-' + sp + '" title="' + (SP_NAME[sp] || "") + '"><svg ' + SP_SVG + ">" + (SP_ICON[sp] || SP_ICON.baseball) + "</svg></i>"; }
function spCrest(t) {
  var u = safeUrl(t.logo);
  if (u.indexOf("https://a.espncdn.com/i/") === 0) u = "https://a.espncdn.com/combiner/i?img=/i/" + u.slice(24) + "&w=40&h=40";
  return u && !BADIMG[u] ? '<img class="tl" alt="" loading="lazy" referrerpolicy="no-referrer" data-rm="1" src="' + esc(u) + '">' : "";
}
function sportsBody() {
  var ev = spEvents(), view = spView();
  if (!spLeagues().length) return '<div class="empty">No leagues switched on. Choose some in Settings, Sports.</div>';
  if (!ev.length) return '<div class="empty">' + (SPERR ? "Scores unavailable: " + esc(SPERR) : !Object.keys(SP_NOW).length ? "Loading scores…" : view === "fav" ? (spFavs().length ? "No games soon for your favorites." : "No favorites yet. Open a game and press ☆ next to a team or player.") : view === "up" ? "No upcoming games found." : view === "sport" ? "Nothing on or coming up in " + esc(SP_NAME[spFavSport()] || "your sport") + " right now." : "No games today in these leagues. Try Upcoming.") + "</div>";
  // The score and time columns are sized PER SPORT, for that sport's longest entry on screen: all football rows share
  // one set of columns, all basketball rows another. (One width for the whole list would let a "104–98" or a long
  // badge steal the room the team names need on every football row.) The names get all the width that is left.
  var W = {};
  ev.forEach(function (e) {
    if (e.kind !== "team") return;
    var w = W[e.sp] = W[e.sp] || { sc: 1, st: 1.6 }, len = spWhen(e).replace(/<[^>]+>/g, "").length;
    if (e.state !== "pre") w.sc = Math.max(w.sc, (String(e.home.s != null ? e.home.s : "") + "–" + String(e.away.s != null ? e.away.s : "")).length);
    w.st = Math.max(w.st, e.state === "in" ? len * 0.55 + 0.75 : len * 0.5 + 0.1);   // a live badge has padding, plain text does not
  });
  return lst("sports", '<div class="spl">' + ev.map(function (e) {
    // a UFC card that is on: one row per fight (in the cage first, then what is next, then the results)
    if (e.kind === "card" && e.state === "in" && e.fights && e.fights.length) return fightsLive(e).map(function (f) { return fightRow(e, f); }).join("");
    var w = W[e.sp], vars = e.kind === "team" ? ' style="--scw:' + (w.sc * 0.6 + 0.2).toFixed(2) + "em;--stw:" + Math.min(w.st, 4).toFixed(2) + 'em"' : "";
    return '<div class="row sprow' + (e.kind === "team" ? "" : " spx") + (e.state === "in" ? " splive" : "") + (e.state === "post" ? " rd" : "") + '"' + vars + '><span><button class="lnk ' + (e.kind === "team" ? "spg" : "spt") + '" data-a="open" data-k="' + esc("p:" + e.id) + '">' + spIcon(e.sp) + spTitle(e) + "</button>" +
      '</span><span class="r">' + (e.fav && e.kind !== "team" ? '<i class="fv">★</i>' : "") + spWhen(e) + "</span></div>";
  }).join("") + "</div>", 6);
}
// ---- The story of a game: who scored and when, cards, period scores, stats and top performers ----
function spEvIcon(x) { return x.k === "goal" ? '<i class="evg" title="Goal">⚽</i>' : '<i class="evc ' + x.k + '" title="' + (x.k === "red" ? "Red card" : "Yellow card") + '"></i>'; }
// Home events on the left, away on the right, in time order. `short` = goals and red cards only (for the hover card).
function spEventsHtml(e, short) {
  var ev = (e.ev || []).filter(function (x) { return !short || x.k !== "yel"; });
  if (!ev.length) return "";
  return (short ? "" : "<h3>Goals and cards</h3>") + '<div class="evs">' + ev.map(function (x) {
    var txt = esc(x.who || (x.k === "goal" ? "Goal" : "Card")) + (x.pen ? " (pen)" : "") + (x.og ? " (own goal)" : "");
    return '<div class="ev ' + x.side + '"><span class="evm">' + esc(x.min) + "</span>" + spEvIcon(x) + "<span>" + txt + "</span></div>";
  }).join("") + "</div>";
}
// Period / quarter / inning scores for sports that have them (not football)
function spLinesHtml(e) {
  var h = e.home.lines || [], a = e.away.lines || [];
  if (e.sp === "football" || h.length < 2 || e.state === "pre") return "";
  var n = Math.max(h.length, a.length), head = "", r1 = "", r2 = "";
  for (var i = 0; i < n; i++) { head += "<th>" + (i + 1) + "</th>"; r1 += "<td>" + (h[i] != null ? h[i] : "") + "</td>"; r2 += "<td>" + (a[i] != null ? a[i] : "") + "</td>"; }
  return '<table class="lines"><tr><th></th>' + head + "<th>T</th></tr><tr><td>" + esc(e.home.ab) + "</td>" + r1 + "<td><b>" + esc(e.home.s) + "</b></td></tr><tr><td>" + esc(e.away.ab) + "</td>" + r2 + "<td><b>" + esc(e.away.s) + "</b></td></tr></table>";
}
var SP_STATS = [["possessionPct", "Possession %"], ["totalShots", "Shots"], ["shotsOnTarget", "Shots on target"], ["wonCorners", "Corners"], ["foulsCommitted", "Fouls"], ["saves", "Saves"], ["hits", "Hits"], ["rebounds", "Rebounds"], ["assists", "Assists"]];
function spStatsHtml(e) {
  if (e.state === "pre") return "";
  var rows = SP_STATS.filter(function (s) { return e.home.st[s[0]] != null && e.away.st[s[0]] != null; }).slice(0, 6).map(function (s) {
    var hv = parseFloat(e.home.st[s[0]]) || 0, av = parseFloat(e.away.st[s[0]]) || 0, tot = hv + av || 1;
    return '<div class="stat"><b>' + esc(e.home.st[s[0]]) + '</b><span><em><u style="width:' + Math.round(hv / tot * 100) + '%"></u></em>' + s[1] + "</span><b>" + esc(e.away.st[s[0]]) + "</b></div>";
  });
  return rows.length ? "<h3>Match stats</h3>" + rows.join("") : "";
}
function spLeadersHtml(e) {
  var one = function (t) { return (t.lead || []).map(function (l) { return "<div><small>" + esc(l.cat) + "</small> " + esc(l.who) + ' <span class="mut">' + esc(l.val) + "</span></div>"; }).join(""); };
  var h = one(e.home), a = one(e.away);
  return h || a ? '<h3>Top performers</h3><div class="leads"><div>' + h + "</div><div>" + a + "</div></div>" : "";
}
// ---- League table in the game window (ESPN's standings, kept for 10 minutes). The two teams playing are highlighted. ----
var SP_TAB = {};
function spTabGet(lgId) {
  var c = SP_TAB[lgId];
  if (c && Date.now() - c.t < 600000) return Promise.resolve(c.g);
  // the SHL table comes from shl.se through the feeds function, already in the shape used below
  if (lgId === "x/shl") {
    if (!sb || !USER) return Promise.reject(new Error("sign in"));
    return sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { sptable: "shl" } }).then(function (r) {
      var g = (r.data && r.data.sptable) || [];
      g.forEach(function (x) { (x.rows || []).forEach(function (row, i) { row.pos = i + 1; row.logo = safeUrl(row.logo); row.s = row.s || {}; }); });
      if (g.length) SP_TAB[lgId] = { t: Date.now(), g: g };
      return g;
    });
  }
  return fetch("https://site.api.espn.com/apis/v2/sports/" + lgId + "/standings")
    .then(function (r) { if (!r.ok) throw new Error("no table"); return r.json(); })
    .then(function (j) {
      var groups = [], walk = function (n) {
        var en = n && n.standings && n.standings.entries;
        if (en && en.length) groups.push({
          n: n.name || "", rows: en.map(function (x) {
            var t = x.team || {}, s = {}, v = {};
            (x.stats || []).forEach(function (q) { s[q.name] = q.displayValue != null ? String(q.displayValue) : ""; v[q.name] = +q.value; });
            var col = String((x.note || {}).color || "");
            return { id: String(t.id || ""), n: t.shortDisplayName || t.displayName || "?", logo: safeUrl(((t.logos || [])[0] || {}).href), s: s,
              rank: v.rank || v.playoffSeed || 0, pct: v.winPercent || 0, note: (x.note || {}).description || "", col: /^#[0-9a-f]{6}$/i.test(col) ? col : "" };
          })
        });
        (n && n.children || []).forEach(walk);
      };
      walk(j);
      groups.forEach(function (g) {
        g.rows.sort(function (a, b) { return (a.rank || 999) - (b.rank || 999) || b.pct - a.pct; });
        g.rows.forEach(function (r, i) { r.pos = i + 1; });
      });
      SP_TAB[lgId] = { t: Date.now(), g: groups };
      return groups;
    });
}
function spTabHtml(groups, e) {
  var ids = [e.home.id, e.away.id];
  var mine = groups.filter(function (g) { return g.rows.some(function (r) { return ids.indexOf(r.id) >= 0; }); });
  if (!mine.length) mine = groups.length === 1 ? groups : [];
  if (!mine.length) return "";
  // football: played, won, drawn, lost, goal difference, points. Other sports: won, lost, win share, games behind.
  var foot = mine[0].rows[0].s.points != null && mine[0].rows[0].s.ties != null && mine[0].rows[0].s.gamesBehind == null;
  var own = Array.isArray(mine[0].cols) && mine[0].cols.length;   // a source that names its own columns (SHL); the last one is the points
  var cols = own ? mine[0].cols.map(function (c) { return [String(c[0]), esc(String(c[1]))]; }) : foot ? [["gamesPlayed", "P"], ["wins", "W"], ["ties", "D"], ["losses", "L"], ["pointDifferential", "+/-"], ["points", "Pts"]] : [["wins", "W"], ["losses", "L"], ["winPercent", "Pct"], ["gamesBehind", "GB"], ["streak", "Strk"]];
  cols = cols.filter(function (c) { return mine[0].rows.some(function (r) { return r.s[c[0]] != null && r.s[c[0]] !== ""; }); });
  return mine.map(function (g) {
    return "<h3>" + esc(mine.length > 1 || !(foot || own) ? g.n || "Table" : "Table") + '</h3><div class="sptabw"><table class="sptab"><tr><th></th><th></th>' + cols.map(function (c) { return "<th>" + c[1] + "</th>"; }).join("") + "</tr>" +
      g.rows.map(function (r) {
        return '<tr class="' + (ids.indexOf(r.id) >= 0 ? "me" : "") + '"' + (r.note ? ' title="' + esc(r.note) + '"' : "") + '><td class="ps"' + (r.col ? ' style="box-shadow:inset 3px 0 0 ' + r.col + '"' : "") + ">" + r.pos + '</td><td class="tn">' + spCrest({ logo: r.logo }) + esc(r.n) + (spIsFav(r.n) ? ' <i class="fv">★</i>' : "") + "</td>" +
          cols.map(function (c, i) { return "<td" + (i === cols.length - 1 && (foot || own) ? ' class="pt"' : "") + ">" + esc(r.s[c[0]] != null ? r.s[c[0]] : "") + "</td>"; }).join("") + "</tr>";
      }).join("") + "</table></div>";
  }).join("");
}
function spTabLoad(e) {
  var box = $("spTab"), lgId = e.id.slice(0, e.id.lastIndexOf(":"));
  if (!box || (lgId.indexOf("x/") === 0 && lgId !== "x/shl")) return;   // no table for esports
  spTabGet(lgId).then(function (g) {
    box = $("spTab");
    if (!box || SP_OPEN !== e.id) return;
    box.innerHTML = spTabHtml(g, e);
    // bring the first of the two teams into view inside the table's own scroll area
    var me = box.querySelector("tr.me"), w = me && me.closest(".sptabw");
    if (w) w.scrollTop = Math.max(0, me.offsetTop - w.clientHeight / 2 + me.offsetHeight);
  }).catch(function () {});
}
// Hover card for a game: the score line, then the short story of it
function showSportPeek(el, id) {
  if (EDIT) return;
  // one fight of a card: both fighters with their records and the odds, the weight class and where the fight stands
  if (id.indexOf("#") > 0) {
    var x = fightFind(id);
    if (!x) return;
    var side = function (s) { return "<span>" + esc(x.f[s]) + "<br><small>" + esc(x.f[s + "r"] || "") + ' <b class="od" data-od="' + esc(x.e.eid + ":" + x.f.cid + ":" + x.f[s + "id"]) + '"></b></small></span>'; };
    $("peek").innerHTML = '<div class="pk sppk"><div class="pkscore fpkh">' + side("a") + '<b class="mut">v</b>' + side("b") + "</div><small>" + esc(x.f.wc || "") + (x.f.rounds ? " · " + x.f.rounds + " rounds" : "") +
      " · " + (x.f.state === "in" ? "LIVE" + (x.f.per ? ", round " + x.f.per + (x.f.clk && x.f.clk !== "-" ? " " + esc(x.f.clk) : "") : "") : x.f.state === "post" ? (x.f.aw ? esc(lastName(x.f.a)) + " won" : x.f.bw ? esc(lastName(x.f.b)) + " won" : "no winner") + (x.f.per ? ", round " + x.f.per : "") : "not started") + "</small><small>" + esc(x.e.title) + "</small></div>";
    placePeek(el);
    if (x.f.state !== "post") fillOdds($("peek"));
    return;
  }
  var e = spEvents().filter(function (x) { return x.id === id; })[0];
  if (!e) return;
  var h;
  if (e.kind === "team") {
    h = '<div class="pkscore"><span>' + esc(e.home.n) + "</span><b>" + (e.state === "pre" ? "–" : esc(e.home.s) + " – " + esc(e.away.s)) + "</b><span>" + esc(e.away.n) + "</span></div>" +
      spEventsHtml(e, true) + spLinesHtml(e) +
      (e.sp === "football" && e.state !== "pre" && e.home.st.possessionPct != null ? '<div class="pm"><span>Possession ' + esc(e.home.st.possessionPct) + "% – " + esc(e.away.st.possessionPct) + "%</span>" + (e.home.st.shotsOnTarget != null ? "<small>on target " + esc(e.home.st.shotsOnTarget) + "–" + esc(e.away.st.shotsOnTarget) + "</small>" : "") + "</div>" : "") +
      (e.recap ? "<p>" + esc(e.recap) + "</p>" : "");
  } else {
    h = "<b>" + esc(e.title) + "</b>" + (e.fights ? e.fights.slice(0, 5).map(function (f) {
      return '<div class="pm"><span>' + esc(f.a) + ' <span class="mut">vs</span> ' + esc(f.b) + "</span><small>" + (f.state === "in" ? "LIVE" : f.state === "post" ? (f.aw ? "1st won" : f.bw ? "2nd won" : "done") : "") + "</small></div>";
    }).join("") : "") + (e.sessions ? e.sessions.map(function (s) { return '<div class="pm"><span>' + esc(s.n) + "</span><small>" + (s.state === "in" ? "LIVE" : s.state === "post" ? "done" : new Date(s.ts).toLocaleString("en-GB", { timeZone: TZ, weekday: "short", hour: "2-digit", minute: "2-digit" })) + "</small></div>"; }).join("") : "") +
      (e.top && e.top.length ? "<p>" + e.top.slice(0, 3).map(function (t, i) { return (i + 1) + ". " + esc(t.n) + (t.s ? " " + esc(t.s) : ""); }).join(" · ") + "</p>" : "");
  }
  $("peek").innerHTML = '<div class="pk sppk">' + h + "<small>" + esc(e.lg) + " · " + (e.state === "in" ? esc(e.detail || "live") : e.state === "post" ? "finished" : new Date(e.ts).toLocaleString("en-GB", { timeZone: TZ, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })) + (e.venue ? " · " + esc(e.venue) : "") + "</small></div>";
  placePeek(el);
}
function openSport(id) {
  if (String(id).indexOf("#") > 0) { openFight(id); return; }
  var e = spEvents().filter(function (x) { return x.id === id; })[0];
  if (!e) { Object.keys(SP_NOW).concat(Object.keys(SP_UP)).forEach(function (k) { ((SP_NOW[k] || SP_UP[k]).ev || []).forEach(function (x) { if (x.id === id) e = x; }); }); }
  if (!e) return;
  SP_OPEN = id;
  var favBtn = function (n) { return '<button class="ib sm' + (spIsFav(n) ? " on" : "") + '" data-a="spfav" data-k="' + esc(n) + '" title="' + (spIsFav(n) ? "Remove from favorites" : "Add to favorites") + '">' + (spIsFav(n) ? "★" : "☆") + "</button>"; };
  var body, head = '<h2 class="mh">' + esc(e.title || "") + '</h2><div class="mut">' + spWhen(e) + "</div>";
  if (e.fights) {
    body = head + "<h3>" + e.cardTitle + "</h3>" + (e.fights.map(function (f) {
      // UFC: each name opens the fighter (hover for a small card), the number after it is the odds to win,
      // and the right-hand side opens the fight itself
      if (e.kind === "card" && f.cid) {
        var who = function (s) { return '<button class="lnk fname' + (f[s + "w"] ? " win" : "") + '" data-a="fighter" data-k="' + esc(f[s + "id"]) + '"><b>' + esc(f[s]) + "</b></button>" + (f.state === "post" ? "" : ' <small class="od" data-od="' + esc(e.eid + ":" + f.cid + ":" + f[s + "id"]) + '"></small>'); };
        return '<div class="row frow' + (f.state === "post" ? " rd" : "") + '"><span>' + favBtn(f.a) + " " + who("a") + ' <span class="mut">v</span> ' + who("b") + " " + favBtn(f.b) + (f.wc ? " <small>" + esc(f.wc) + "</small>" : "") +
          '</span><span class="r"><button class="lnk" data-a="open" data-k="' + esc("p:" + fightKey(e, f)) + '" title="Open this fight">' + (fightWhen(e, f).replace(/<span class="mut"><\/span>/, "") || "") + " ›</button></span></div>";
      }
      var res = f.state === "post" ? (f.aw ? esc(f.a) + " won" : f.bw ? esc(f.b) + " won" : "No result") + (f.detail ? " · " + esc(f.detail) : "") : f.state === "in" ? '<span class="pill live">LIVE</span>' + (e.kind === "tour" && f.detail ? " " + esc(f.detail) : "") : "";
      return '<div class="row"><span>' + favBtn(f.a) + " <b" + (f.aw ? ' class="win"' : "") + ">" + esc(f.a) + '</b> <span class="mut">vs</span> <b' + (f.bw ? ' class="win"' : "") + ">" + esc(f.b) + "</b> " + favBtn(f.b) + (f.wc ? " <small>" + esc(f.wc) + "</small>" : "") + '</span><span class="r mut">' + res + "</span></div>";
    }).join("") || '<p class="mut sn">No matches in the next day and a half.</p>');
  } else if (e.kind === "race") {
    body = head + (e.sessions.length ? "<h3>Sessions</h3>" + e.sessions.map(function (s) {
      return '<div class="row"><span><b>' + esc(s.n) + '</b></span><span class="r">' + spWhen({ state: s.state, ts: s.ts, kind: "race", detail: "LIVE" }) + "</span></div>";
    }).join("") : "") + (e.top.length ? "<h3>" + (e.state === "pre" ? "Field" : "Leaders") + "</h3>" + e.top.map(function (t, i) { return '<div class="row"><span>' + (i + 1) + ". <b>" + esc(t.n) + '</b></span><span class="r mut">' + esc(t.s) + "</span></div>"; }).join("") : "");
  } else {
    var team = function (t) { return '<div class="spteam">' + (t.logo ? '<img alt="" referrerpolicy="no-referrer" data-rm="1" src="' + esc(t.logo) + '">' : "") + "<b" + (t.win ? ' class="win"' : "") + ">" + esc(t.n) + "</b>" + favBtn(t.n) + "</div>"; };
    body = '<div class="spscore">' + team(e.home) + '<div class="spmid"><b class="big">' + (e.state === "pre" ? "–" : esc(e.home.s) + " – " + esc(e.away.s)) + "</b>" + spWhen(e) + "</div>" + team(e.away) + "</div>" +
      (e.recap ? '<p class="mut sn sprecap">' + esc(e.recap) + "</p>" : "") +
      // esports: the Twitch channels showing this match; a click docks the stream at the side of the page
      (e.tw && e.tw.length && e.state !== "post" ? '<p class="tools spwatch">' + e.tw.map(function (l, i) { return '<button class="' + (i ? "" : "pri") + '" data-a="dock" data-k="t:' + esc(l) + '" title="Dock this Twitch stream at the side of the page">▶ ' + (i ? "" : "Watch · ") + esc(l) + "</button>"; }).join("") + "</p>" : "") + spEventsHtml(e, false) + spLinesHtml(e) + spStatsHtml(e) + spLeadersHtml(e) +
      (e.venue ? '<p class="mut sn">' + esc(e.venue) + (e.att ? " · " + e.att.toLocaleString("en-GB") + " spectators" : "") + "</p>" : "") + '<div id="spTab"></div>';
  }
  openModal(e.lg, '<div class="spwin">' + body + (e.link ? '<p class="tools">' + linkBtn(e.link, e.id.indexOf("x/shl") === 0 ? "Schedule on shl.se" : e.id.indexOf("x/") === 0 ? "Details on bo3.gg" : "Details on ESPN") + "</p>" : "") + "</div>");
  if (e.kind === "team") spTabLoad(e);
  if (e.kind === "card") fillOdds($("mBody"));
}
// Settings > Sports: one switch per league, grouped by sport
function renderSpList() {
  var on = {}, groups = {}, order = [];
  spLeagues().forEach(function (l) { on[l.id] = 1; });
  SP_CATALOG.forEach(function (l) { if (!groups[l.sp]) { groups[l.sp] = []; order.push(l.sp); } groups[l.sp].push(l); });
  $("spList").innerHTML = order.map(function (sp) {
    return '<div class="sub"><b>' + spIcon(sp) + SP_NAME[sp] + "</b>" + groups[sp].map(function (l) {
      return "<label>" + esc(l.n) + ' <input type="checkbox" data-a="sptoggle" data-k="' + l.id + '"' + (on[l.id] ? " checked" : "") + "></label>";
    }).join("") + "</div>";
  }).join("");
  // favorite sport: one of the sports you follow a league of
  var mine = spSports().slice(1);
  $("spFavSel").innerHTML = '<option value="">None</option>' + mine.map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === spFavSport() ? " selected" : "") + ">" + s[1] + "</option>"; }).join("");
}
$("spFavSel").onchange = function () {
  if (this.value) { P.spFavSport = this.value; P.spView = "sport"; } else { delete P.spFavSport; if (P.spView === "sport") delete P.spView; }
  persist(); render(); fetchSports(true);
};
function spToggleLeague(id, onNow) {
  var cur = spLeagues().map(function (l) { return l.id; }).filter(function (x) { return x !== id; });
  if (onNow) cur.push(id);
  P.spLeagues = SP_CATALOG.map(function (l) { return l.id; }).filter(function (x) { return cur.indexOf(x) >= 0; });
  persist(); render(); fetchSports(true);
}
function spToggleFav(name, openId) {
  P.spFav = spFavs().slice();
  var i = P.spFav.indexOf(name);
  if (i >= 0) P.spFav.splice(i, 1); else if (P.spFav.length < 60) P.spFav.push(name);
  persist(); render();
  if (openId) openSport(openId);
}

// ---- UFC: every fight of a live card as its own row, a window per fight, fighter cards, and the odds ----
// Everything comes from ESPN's public data, read straight from the browser: the scoreboard (already loaded for the
// box) has the card; fighter details, the odds and the numbers of a fight are fetched when you open or hover them.
var CORE = "https://sports.core.api.espn.com/v2/sports/mma/", UFCC = {};
function coreGet(path, ttl) {
  var c = UFCC[path];
  if (c && Date.now() - c.t < ttl) return c.p;
  var p = fetch(CORE + path).then(function (r) { if (!r.ok) throw new Error("ESPN answered " + r.status); return r.json(); });
  UFCC[path] = { t: Date.now(), p: p };
  p.catch(function () { delete UFCC[path]; });
  return p;
}
function lastName(n) { var p = String(n || "").trim().split(/\s+/); while (p.length > 1 && /^(jr\.?|sr\.?|ii|iii|iv)$/i.test(p[p.length - 1])) p.pop(); return p.length > 1 ? p.slice(1).join(" ").length > 14 ? p[p.length - 1] : p.slice(1).join(" ") : p[0] || "?"; }
function fightKey(e, f) { return e.id + "#" + f.cid; }
// "LIVE R2 3:14", "A won" or the start time of the card
function fightWhen(e, f) {
  if (f.state === "in") return '<span class="pill live">' + (f.per > 0 ? "R" + f.per + (f.clk && f.clk !== "-" ? " " + esc(f.clk) : "") : "LIVE") + "</span>";
  if (f.state === "post") return '<span class="mut">' + (f.aw || f.bw ? "R" + (f.per || "") + (f.clk && f.clk !== "-" ? " " + esc(f.clk) : "") : "Draw") + "</span>";
  return '<span class="mut">' + (e.state === "in" ? "next" : "") + "</span>";
}
// the fights of a card in the order that matters while it is on: the one in the cage, then what is next, then the results
function fightsLive(e) {
  var chron = e.fights.slice().reverse();   // e.fights has the main event first; this is the order they happen
  return chron.filter(function (f) { return f.state === "in"; }).concat(chron.filter(function (f) { return f.state === "pre"; }), chron.filter(function (f) { return f.state === "post"; }).reverse());
}
function fightRow(e, f) {
  var fav = spIsFav(f.a) || spIsFav(f.b), nm = function (n, w) { return "<b" + (w ? ' class="win"' : "") + ">" + esc(lastName(n)) + "</b>"; };
  return '<div class="row sprow spx' + (f.state === "in" ? " splive" : "") + (f.state === "post" ? " rd" : "") + '"><span><button class="lnk spt" data-a="open" data-k="' + esc("p:" + fightKey(e, f)) + '">' + spIcon(e.sp) +
    '<span class="spn">' + nm(f.a, f.aw) + ' <i class="vs">v</i> ' + nm(f.b, f.bw) + (f.wc ? " <small>" + esc(f.wc.replace(/weight$/i, "")) + "</small>" : "") + "</span></button></span>" +
    '<span class="r">' + (fav ? '<i class="fv">★</i>' : "") + fightWhen(e, f) + "</span></div>";
}
function spFind(id) {
  var e = null;
  Object.keys(SP_UP).concat(Object.keys(SP_NOW)).forEach(function (k) { ((SP_NOW[k] || SP_UP[k]).ev || []).forEach(function (x) { if (x.id === id) e = x; }); });
  Object.keys(SP_NOW).forEach(function (k) { (SP_NOW[k].ev || []).forEach(function (x) { if (x.id === id) e = x; }); });   // today's data is fresher
  return e;
}
function fightFind(key) {
  var p = key.split("#"), e = spFind(p[0]), f = e && e.fights ? e.fights.filter(function (x) { return String(x.cid) === p[1]; })[0] : null;
  return f ? { e: e, f: f } : null;
}
// ---- A fighter: record, measurements and career numbers (kept for six hours) ----
var FTR = {};
function fighterGet(aid) {
  if (!/^\d{3,12}$/.test(String(aid))) return Promise.reject(new Error("no fighter"));
  if (FTR[aid] && Date.now() - FTR[aid].t < 21600000) return Promise.resolve(FTR[aid]);
  return Promise.all([coreGet("athletes/" + aid, 21600000), coreGet("athletes/" + aid + "/records", 21600000).catch(function () { return null; }), coreGet("athletes/" + aid + "/statistics", 21600000).catch(function () { return null; })]).then(function (r) {
    var a = r[0] || {}, rec = {}, st = {};
    (((r[1] && r[1].items) || [])[0] || { stats: [] }).stats.forEach(function (s) { rec[s.name] = +s.value || 0; });
    ((((r[2] || {}).splits || {}).categories) || []).forEach(function (c) { (c.stats || []).forEach(function (s) { st[s.name] = s.displayValue; }); });
    var link = ((a.links || []).filter(function (l) { return (l.rel || []).indexOf("playercard") >= 0; })[0] || {}).href;
    return (FTR[aid] = {
      t: Date.now(), id: String(aid), n: a.displayName || a.fullName || "?", nick: a.nickname || "", age: a.age || 0,
      // ESPN gives inches and pounds: shown as centimetres and kilos
      ht: a.height ? Math.round(a.height * 2.54) + " cm" : "", wt: a.weight ? Math.round(a.weight * 0.4536) + " kg" : "", reach: a.reach ? Math.round(a.reach * 2.54) + " cm" : "",
      stance: (a.stance || {}).text || "", country: a.citizenship || "", gym: (a.association || {}).name || "", wc: (a.weightClass || {}).text || "", img: safeUrl((a.headshot || {}).href), flag: safeUrl((a.flag || {}).href),
      rec: rec, st: st, link: safeUrl(link)
    });
  });
}
function recText(r) { return r && (r.wins || r.losses) ? r.wins + "-" + r.losses + "-" + (r.draws || 0) + (r.noContests ? " (" + r.noContests + " NC)" : "") : ""; }
// ---- The odds of a fight (decimal, from ESPN's listed bookmaker; kept for ten minutes) ----
function oddsGet(eid, cid) {
  return coreGet("leagues/ufc/events/" + eid + "/competitions/" + cid + "/odds", 600000).then(function (j) {
    var it = ((j && j.items) || [])[0], out = { by: {}, prov: "" };
    if (!it) return out;
    out.prov = (it.provider || {}).name || "";
    [it.homeAthleteOdds, it.awayAthleteOdds].forEach(function (o) {
      if (!o) return;
      var id = ((String((o.athlete || {}).$ref || "").match(/athletes\/(\d+)/)) || [])[1], dec = ((o.current || {}).moneyLine || {}).decimal || ((o.open || {}).moneyLine || {}).decimal;
      if (!dec && o.moneyLine) dec = o.moneyLine > 0 ? 1 + o.moneyLine / 100 : 1 + 100 / Math.abs(o.moneyLine);   // from the American figure
      if (id && dec) out.by[id] = { dec: +dec, fav: !!o.favorite };
    });
    return out;
  });
}
function oddsTxt(o) { return o ? o.dec.toFixed(2) : ""; }
// fills every <small data-od="eventId:fightId:fighterId"> that is on screen with its odds
function fillOdds(root) {
  var want = {};
  Array.prototype.forEach.call((root || document).querySelectorAll("[data-od]"), function (el) { var p = el.dataset.od.split(":"); (want[p[0] + ":" + p[1]] = want[p[0] + ":" + p[1]] || []).push(el); });
  Object.keys(want).forEach(function (k, i) {
    var p = k.split(":");
    setTimeout(function () {
      oddsGet(p[0], p[1]).then(function (o) {
        want[k].forEach(function (el) { var x = o.by[el.dataset.od.split(":")[2]]; if (x && document.contains(el)) { el.textContent = oddsTxt(x); el.title = "Odds to win" + (o.prov ? " (" + o.prov + ")" : "") + (x.fav ? " · favorite" : ""); el.classList.toggle("odf", x.fav); } });
      }).catch(function () {});
    }, i * 120);   // a card has a dozen fights: ask for them one after another, not all at once
  });
}
// ---- Window for one fight ----
var FIGHT_ROWS = [["knockDowns", "Knockdowns"], ["sig", "Sig. strikes"], ["tot", "Total strikes"], ["td", "Takedowns"], ["submissions", "Sub. attempts"], ["timeInControl", "Control time"]];
var TAPE_ROWS = [["rec", "Record"], ["age", "Age"], ["ht", "Height"], ["wt", "Weight"], ["reach", "Reach"], ["stance", "Stance"], ["country", "Country"], ["gym", "Gym"], ["ko", "Wins by KO / TKO"], ["sub", "Wins by submission"],
  ["strikeLPM", "Sig. strikes per min"], ["strikeAccuracy", "Strike accuracy %"], ["takedownAvg", "Takedowns per 15 min"], ["takedownAccuracy", "Takedown accuracy %"], ["submissionAvg", "Sub. attempts per 15 min"]];
function tapeVal(x, k) { return k === "rec" ? recText(x.rec) : k === "ko" ? (x.rec.tkos != null ? String(x.rec.tkos) : "") : k === "sub" ? (x.rec.submissions != null ? String(x.rec.submissions) : "") : x[k] != null && typeof x[k] !== "object" ? String(x[k] || "") : x.st[k] || ""; }
function cmpTable(rows, get) {
  var h = rows.map(function (r) { var a = get(0, r[0]), b = get(1, r[0]); return a || b ? "<tr><td>" + esc(a || "–") + "</td><th>" + r[1] + "</th><td>" + esc(b || "–") + "</td></tr>" : ""; }).join("");
  return h ? '<table class="tape">' + h + "</table>" : "";
}
function fighterHead(f, side, e) {
  var n = f[side], id = f[side + "id"], w = f[side + "w"], fav = spIsFav(n);
  return '<div class="spteam fgt">' + (id ? '<img alt="" referrerpolicy="no-referrer" data-rm="1" src="https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/' + esc(id) + '.png&w=160&h=116">' : "") +
    '<button class="lnk' + (w ? " win" : "") + '" data-a="fighter" data-k="' + esc(id) + '"><b>' + esc(n) + "</b></button>" +
    '<span class="mut sn">' + esc(f[side + "r"] || "") + '</span><span class="odl">odds <b class="od" data-od="' + esc(e.eid + ":" + f.cid + ":" + id) + '"></b></span>' +
    '<button class="ib sm' + (fav ? " on" : "") + '" data-a="spfav" data-k="' + esc(n) + '" title="' + (fav ? "Remove from favorites" : "Add to favorites") + '">' + (fav ? "★" : "☆") + "</button></div>";
}
function openFight(key) {
  var x = fightFind(key);
  if (!x) return;
  var e = x.e, f = x.f;
  SP_OPEN = key;
  // Kept tight so the whole fight fits without scrolling: the two buttons sit in the middle of the header, between the fighters
  openModal(e.title, '<div class="spwin fwf"><div class="spscore">' + fighterHead(f, "a", e) + '<div class="spmid"><span class="mut sn">' + esc(f.wc || "") + (f.rounds ? " · " + f.rounds + " rounds" : "") + "</span>" + fightWhen(e, f) + '<span id="fgRes" class="sn"></span>' +
    '<span class="fgbtn"><button class="ib sm" data-a="open" data-k="' + esc("p:" + e.id) + '">‹ Whole card</button>' + (e.link ? '<a class="btn ib sm" target="_blank" rel="noopener noreferrer" href="' + esc(e.link) + '">ESPN</a>' : "") + "</span></div>" + fighterHead(f, "b", e) + "</div>" +
    '<div id="fgStats"></div><div id="fgTape"><p class="mut sn">Loading the fighters…</p></div></div>');
  fillOdds($("mBody"));
  var live = function () { return SP_OPEN === key && !$("modal").hidden; };
  // how it ended
  if (f.state === "post") coreGet("leagues/ufc/events/" + e.eid + "/competitions/" + f.cid + "/status", 3600000).then(function (s) {
    var r = s && s.result;
    if (live() && r && $("fgRes")) $("fgRes").textContent = (f.aw ? lastName(f.a) + " by " : f.bw ? lastName(f.b) + " by " : "") + (r.displayName || r.name || "") + (r.displayDescription ? " (" + r.displayDescription + ")" : "");
  }).catch(function () {});
  // the numbers of this fight (while it is on, and afterwards)
  if (f.state !== "pre" && f.aid && f.bid) Promise.all([f.aid, f.bid].map(function (id) {
    return coreGet("leagues/ufc/events/" + e.eid + "/competitions/" + f.cid + "/competitors/" + id + "/statistics", f.state === "in" ? 25000 : 3600000).then(function (j) {
      var s = {}; ((((j || {}).splits || {}).categories) || []).forEach(function (c) { (c.stats || []).forEach(function (q) { s[q.name] = q.displayValue; }); });
      s.sig = s.sigStrikesLanded != null ? s.sigStrikesLanded + " of " + s.sigStrikesAttempted : ""; s.tot = s.totalStrikesLanded != null ? s.totalStrikesLanded + " of " + s.totalStrikesAttempted : ""; s.td = s.takedownsLanded != null ? s.takedownsLanded + " of " + s.takedownsAttempted : "";
      return s;
    }).catch(function () { return {}; });
  })).then(function (st) {
    if (!live() || !$("fgStats")) return;
    var t = cmpTable(FIGHT_ROWS, function (i, k) { return st[i][k] != null ? String(st[i][k]) : ""; });
    $("fgStats").innerHTML = t ? "<h3>This fight" + (f.state === "in" ? " so far" : "") + "</h3>" + t : "";
  });
  // tale of the tape
  Promise.all([fighterGet(f.aid).catch(function () { return null; }), fighterGet(f.bid).catch(function () { return null; })]).then(function (p) {
    if (!live() || !$("fgTape")) return;
    var t = p[0] || p[1] ? cmpTable(TAPE_ROWS, function (i, k) { return p[i] ? tapeVal(p[i], k) : ""; }) : "";
    $("fgTape").innerHTML = t ? "<h3>Tale of the tape</h3>" + t : '<p class="mut sn">No fighter details available.</p>';
  });
}
// ---- Window and hover card for one fighter ----
function fighterCard(x, od) {
  var bits = [x.age ? x.age + " yrs" : "", x.ht, x.wt, x.reach ? "reach " + x.reach : "", x.stance].filter(Boolean).join(" · ");
  return (x.img ? '<img class="fhead" alt="" referrerpolicy="no-referrer" data-rm="1" src="' + esc(x.img.replace("https://a.espncdn.com/i/", "https://a.espncdn.com/combiner/i?img=/i/") + (x.img.indexOf("espncdn.com/i/") > 0 ? "&w=300&h=218" : "")) + '">' : "") +
    '<div class="pk"><b>' + esc(x.n) + (x.nick ? ' <span class="mut">“' + esc(x.nick) + "”</span>" : "") + "</b><span>" + esc(recText(x.rec) || "No record") + (x.wc ? " · " + esc(x.wc) : "") + (od ? ' · odds <b class="od' + (od.fav ? " odf" : "") + '">' + oddsTxt(od) + "</b>" : "") + "</span>" +
    (bits ? "<small>" + esc(bits) + "</small>" : "") + (x.country || x.gym ? "<small>" + esc([x.country, x.gym].filter(Boolean).join(" · ")) + "</small>" : "") + "</div>";
}
// the odds for a fighter in the fight or card that is open (if there is one, and it has not been fought yet)
function fighterOdds(aid) {
  var e = spFind(String(SP_OPEN).split("#")[0]), f = e && e.fights ? e.fights.filter(function (x) { return String(x.aid) === String(aid) || String(x.bid) === String(aid); })[0] : null;
  return f && f.state !== "post" ? oddsGet(e.eid, f.cid).then(function (o) { return o.by[aid] || null; }).catch(function () { return null; }) : Promise.resolve(null);
}
function showFighterPeek(el, aid) {
  Promise.all([fighterGet(aid), fighterOdds(aid)]).then(function (r) {
    if (peekKey !== "f:" + aid || !document.contains(el)) return;
    $("peek").innerHTML = fighterCard(r[0], r[1]);
    $("peek").classList.add("fpk");
    placePeek(el, true);
  }).catch(function () {});
}
function openFighter(aid) {
  var back = SP_OPEN;
  fighterGet(aid).then(function (x) {
    return fighterOdds(aid).then(function (od) {
      // the career numbers (age, height and so on are already in the lines above)
      var t = TAPE_ROWS.slice(8).map(function (r) { var v = tapeVal(x, r[0]); return v ? "<tr><th>" + r[1] + "</th><td>" + esc(v) + "</td></tr>" : ""; }).join("");
      t = t ? '<table class="tape">' + t + "</table>" : "";
      var fav = spIsFav(x.n);
      openModal(x.n, '<div class="spwin fwin">' + fighterCard(x, od) + (t ? "<h3>Career numbers</h3>" + t : "") +
        '<p class="tools">' + (back ? '<button data-a="open" data-k="' + esc("p:" + back) + '">‹ Back</button>' : "") + '<button data-a="spfav" data-k="' + esc(x.n) + '">' + (fav ? "★ Favorite" : "☆ Add to favorites") + "</button>" + (x.link ? linkBtn(x.link, "Full profile on ESPN") : "") + "</p></div>");
      SP_OPEN = back;
    });
  }).catch(function () { openModal("Fighter", '<p class="mut">No details available for this fighter.</p>'); });
}

// ---- First-time setup guide: pick your boxes, then one page per box that needs setting up ----
var WIZ = null, WIZMSG = "";
var WIZ_BOXES = [
  ["weather", "Weather", "Forecast and weather warnings for your city."],
  ["news", "News", "Headlines from the sites you choose. The same story from several sites is merged."],
  ["telegram", "Telegram", "The latest posts from public Telegram channels."],
  ["reddit", "Reddit", "Posts from the subreddits you follow."],
  ["stocks", "Stocks", "Prices, moves and news for your stocks and crypto."],
  ["twitch", "Twitch", "Who you follow that is live right now."],
  ["youtube", "YouTube", "New uploads from your subscriptions."],
  ["sports", "Sports", "Live football, NBA and UFC scores and fixtures."],
  ["mail", "Mail", "Unread counts for up to two Gmail inboxes."],
  ["live", "Radio", "Internet radio: pick a station and press play."]
];
var WIZ_SETUP = ["news", "telegram", "reddit", "stocks", "twitch", "youtube", "mail"];
function wizPages() { return ["pick"].concat(WIZ_SETUP.filter(function (id) { return WIZ.sel[id]; }), ["done"]); }
function openWizard(resume) {
  WIZMSG = "";
  if (resume && resume.sel) WIZ = { step: resume.step || 0, sel: resume.sel };
  else { WIZ = { step: 0, sel: {} }; WIZ_BOXES.forEach(function (b) { WIZ.sel[b[0]] = !boxOff(b[0]); }); }
  wizRender();
}
// Small drawn pictures of the screens you will see (simplified, so they stay correct when the real sites restyle)
function mock(title, body) { return '<div class="mock"><div class="mockbar"><i></i><i></i><i></i><span>' + title + '</span></div><div class="mockbody">' + body + "</div></div>"; }
function mkb(t, hl) { return '<span class="mkb' + (hl ? " hl" : "") + '">' + t + "</span>"; }
function mkl(w) { return '<span class="mkl" style="width:' + w + '%"></span>'; }
function wizChips(list) { return list.length ? '<div class="chips wizchips">' + list.slice(0, 14).map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("") + (list.length > 14 ? "<span>+" + (list.length - 14) + " more</span>" : "") + "</div>" : ""; }
function wizAddRow(kind, ph, btn) { return '<div class="add"><input type="text" id="wzIn" placeholder="' + ph + '" autocomplete="off"><button class="pri" data-a="wizadd" data-k="' + kind + '">' + (btn || "Add") + '</button></div><div id="wzMsg" class="sn" role="status">' + esc(WIZMSG) + "</div>"; }
function wizPage(id) {
  if (id === "pick") return '<p>Choose what you want on your page. Nothing is final: you can switch boxes on and off later in <b>Settings → Layout &amp; boxes</b>.</p><div class="wizgrid">' + WIZ_BOXES.map(function (b) {
    return '<button class="wizbox' + (WIZ.sel[b[0]] ? " on" : "") + '" data-a="wizpick" data-k="' + b[0] + '" role="checkbox" aria-checked="' + !!WIZ.sel[b[0]] + '"><span class="chk' + (WIZ.sel[b[0]] ? " on" : "") + '"></span><span><b>' + b[1] + "</b><small>" + b[2] + "</small></span></button>";
  }).join("") + "</div>";
  if (id === "news") return "<p>News starts with these sources. Add any news site by its address (for example <code>bbc.com</code>) or a feed address.</p>" + wizChips(newsSrc().map(function (x) { return x.name; })) + wizAddRow("news", "A website or feed, e.g. bbc.com") +
    '<p class="mut sn">Later, in Settings → News, Telegram &amp; Reddit, you can remove sources, mute words you do not want to see, and highlight words you care about.</p>';
  if (id === "telegram") return "<p>Add public Telegram channels by name or link. Only public channels work (the ones you can open at <code>t.me/s/name</code> without logging in).</p>" +
    mock("t.me/s/ClashReport", mkl(70) + mkl(90) + mkl(55) + '<span class="mknote">a public channel preview: this is what the box reads</span>') + wizChips(tgSrc()) + wizAddRow("tg", "Channel name or t.me link, e.g. ClashReport");
  if (id === "reddit") return "<p>Add the subreddits you want to follow. In the box you can switch between Best, Hot, New, Top and Rising.</p>" + wizChips(rdSrc().map(function (x) { return "r/" + x; })) + wizAddRow("reddit", "Subreddit, e.g. worldnews");
  if (id === "stocks") return "<p>Type the symbols you want to follow, separated by commas. Stocks, indices, gold and crypto all work.</p>" + wizChips((P.stocks || []).map(function (x) { return tk(x.id); })) + wizAddRow("stocks", "e.g. NVDA, AAPL, TSLA, BTCUSD, ETHUSD") +
    '<p class="mut sn">Use TradingView? In Settings → Stocks you can paste a shared watchlist link and import the whole list at once.</p>';
  if (id === "twitch") return "<p>Connect your Twitch account so the box can show which of the channels you follow are live. The page only asks to <b>see who you follow</b>; it cannot chat, follow or change anything.</p>" +
    mock("id.twitch.tv", "<b>OmniRama wants to access your account</b>" + mkl(60) + '<span class="mknote">View your list of followed channels</span><span class="mkrow">' + mkb("Cancel") + mkb("Authorize", 1) + "</span>") +
    "<ol><li>Press the button below. Twitch opens and asks you to log in if you are not already.</li><li>Press <b>Authorize</b>. You come straight back here.</li></ol>" +
    (twToken() ? '<p><span class="pill ac">✓ Twitch is connected</span></p>' : '<p><button class="pri" data-a="wiztw">Connect Twitch</button></p>') +
    '<p class="mut sn">Tip: with Twitch Turbo or a sub, use <b>Pop out</b> on a stream to watch without ads.</p>';
  if (id === "youtube") {
    var nch = P.yt && P.yt.ch ? P.yt.ch.length : 0;
    return "<p>YouTube does not let a website read your subscriptions directly, so you hand the page a small file with the list. It takes about five minutes, once.</p><ol>" +
      '<li>Open <a href="https://takeout.google.com" target="_blank" rel="noopener">takeout.google.com</a> and press <b>Deselect all</b>.' + mock("takeout.google.com", '<span class="mkrow"><b>Select data to include</b>' + mkb("Deselect all", 1) + "</span>" + mkl(80) + mkl(65)) + "</li>" +
      "<li>Scroll down to <b>YouTube and YouTube Music</b> and tick it. Press <b>All YouTube data included</b>, untick everything, and tick only <b>subscriptions</b>." + mock("YouTube and YouTube Music", '<span class="mkrow"><span class="mkchk on"></span> YouTube and YouTube Music</span><span class="mkrow">' + mkb("All YouTube data included", 1) + '</span><span class="mkrow"><span class="mkchk"></span> history &nbsp; <span class="mkchk"></span> playlists &nbsp; <span class="mkchk on"></span> <b>subscriptions</b></span>') + "</li>" +
      "<li>Press <b>Next step</b>, then <b>Create export</b>. Google emails you a download link a few minutes later.</li>" +
      "<li>Open the downloaded zip. Inside the YouTube folder is <code>subscriptions.csv</code>. Choose that file here:</li></ol>" +
      '<p><label class="filebtn" for="ytFile">Choose subscriptions.csv</label> ' + (nch ? '<span class="pill ac">✓ ' + nch + " channels loaded</span>" : '<span class="mut sn">no file chosen yet</span>') + "</p>";
  }
  if (id === "mail") {
    var m0 = (P.mail && P.mail[0]) || {};
    return "<p>The Mail box shows your unread count without giving this site your Google password. You paste a small script into <b>your own</b> Google account, and it answers only to a secret token. It is all copy and paste; allow about ten minutes.</p><ol>" +
      '<li>Open <a href="https://script.google.com" target="_blank" rel="noopener">script.google.com</a> (signed in as the Gmail account you want) and press <b>New project</b>.' + mock("script.google.com", '<span class="mkrow">' + mkb("+ New project", 1) + "</span>" + mkl(50) + mkl(70)) + "</li>" +
      '<li>Select all the sample code in the editor and delete it. Then copy our script and paste it in. <div class="codebox"><button class="copybtn" data-a="copycode">Copy the code</button><pre id="gsCode" hidden>' + GS_CODE + "</pre></div>" + mock("Code.gs", '<span class="mkcode">function doGet(e) {<br>&nbsp;&nbsp;…the pasted script…<br>}</span>') + "</li>" +
      "<li>Press <b>Deploy</b> (top right) → <b>New deployment</b>. Click the gear next to “Select type” and choose <b>Web app</b>. Set the two boxes exactly like this, then press Deploy:" + mock("New deployment", '<span class="mkrow">Execute as ' + mkb("Me", 1) + '</span><span class="mkrow">Who has access ' + mkb("Anyone", 1) + '</span><span class="mkrow">' + mkb("Deploy", 1) + "</span>") + "</li>" +
      "<li>Google asks for permission. Press <b>Authorize access</b>, pick your account, then <b>Advanced</b> → <b>Go to … (unsafe)</b> → <b>Allow</b>. The warning is normal: it is your own private script." + mock("Google hasn’t verified this app", mkl(75) + '<span class="mkrow">' + mkb("Advanced", 1) + mkb("Back to safety") + '</span><span class="mknote">then: Go to your project (unsafe) → Allow</span>') + "</li>" +
      "<li>Copy the <b>Web app URL</b> (it ends in <code>/exec</code>). Open it once in a new tab: the page shows a <b>token</b>. Copy the token too; it is shown only this one time.</li>" +
      "<li>Fill in the three fields and press Save:</li></ol>" +
      '<div class="wizmail"><input type="text" id="wzN" placeholder="Name, e.g. Personal" value="' + esc(m0.name || "") + '"><input type="text" id="wzU" placeholder="Web app URL (ends in /exec)" value="' + esc(m0.url || "") + '"><input type="password" id="wzT" placeholder="Token" autocomplete="off" value="' + esc(m0.t || "") + '"><button class="pri" data-a="wizmail">Save</button></div>' +
      '<div id="wzMsg" class="sn" role="status">' + esc(WIZMSG) + '</div><p class="mut sn">A second inbox can be added the same way later, in Settings → Mail. The full written steps are in Help → Mail.</p>';
  }
  return "<p><b>You are set.</b> A few things worth knowing:</p><ul><li><b>Move and resize boxes:</b> cogwheel → Edit. Drag a box by its title; W / T / H change width, text size and list length.</li>" +
    "<li><b>Everything else</b> is in the cogwheel → Settings. Run this guide again from Settings → Layout &amp; boxes.</li>" +
    "<li><b>Notes, to-dos and calendar</b> are the icons in the menu box, and can be docked at the side of the page.</li>" +
    "<li><b>Weather:</b> click the weather box to pick your city.</li><li><b>Shortcuts:</b> press <code>?</code> for the full help.</li></ul>";
}
var WIZ_TITLES = { pick: "Welcome to OmniRama", news: "News", telegram: "Telegram", reddit: "Reddit", stocks: "Stocks", twitch: "Twitch", youtube: "YouTube", mail: "Mail (Gmail)", done: "All done" };
function wizRender() {
  var pages = wizPages();
  WIZ.step = Math.max(0, Math.min(pages.length - 1, WIZ.step));
  var id = pages[WIZ.step], last = WIZ.step === pages.length - 1, keepScroll = $("wzPage") && $("wzPage").dataset.p === id ? document.querySelector("#modal .mbox").scrollTop : 0;
  openModal(WIZ_TITLES[id] + (id !== "pick" && id !== "done" ? " · step " + WIZ.step + " of " + (pages.length - 2) : ""),
    '<div class="wiz" id="wzPage" data-p="' + id + '">' + wizPage(id) + '</div><div class="wiznav"><button data-a="wizback"' + (WIZ.step ? "" : " disabled") + ">Back</button>" +
    '<span class="wizdots">' + pages.map(function (_, i) { return "<i" + (i === WIZ.step ? ' class="on"' : "") + "></i>"; }).join("") + "</span>" +
    (last ? "" : '<button class="lnk2" data-a="wizskip">Skip the guide</button>') + '<button class="pri" data-a="wiznext">' + (last ? "Finish" : id === "pick" ? "Continue" : "Next") + "</button></div>");
  document.querySelector("#modal .mbox").scrollTop = keepScroll;
}
function wizAct(a, k) {
  if (a === "wizopen") { $("panel").hidden = true; openWizard(); return; }
  if (!WIZ) return;
  var pages = wizPages(), id = pages[WIZ.step], v = $("wzIn") ? $("wzIn").value.trim() : "", ok = false;
  if (a === "wizpick") WIZ.sel[k] = !WIZ.sel[k];
  else if (a === "wizback") { WIZ.step--; WIZMSG = ""; }
  else if (a === "wiznext" && WIZ.step < pages.length - 1) {
    if (id === "pick") {
      var L = LAY(); L.off = L.off || {};
      WIZ_BOXES.forEach(function (b) { if (WIZ.sel[b[0]]) delete L.off[b[0]]; else L.off[b[0]] = 1; });
      persist(); render();
    }
    WIZ.step++; WIZMSG = "";
  }
  else if (a === "wiznext" || a === "wizskip") { P.onboarded = true; persist(); WIZ = null; closeModal(); refreshAll(true); return; }
  else if (a === "wiztw") { try { sessionStorage.setItem("sp_wiz", JSON.stringify(WIZ)); } catch (e) {} twConnect(); return; }
  else if (a === "wizadd") {
    if (!v) return;
    if (k === "news") { ok = addNewsSrc("", v); if (ok) srcChanged(); }
    else if (k === "tg") { ok = addTgSrc(v); if (ok) srcChanged(); }
    else if (k === "reddit") { ok = addRdSrc(v); if (ok) rdChanged(); }
    else if (k === "stocks") {
      var list = v.split(/[,\s;]+/).map(function (x) { return x.trim().toUpperCase(); }).filter(function (x) { return /^[A-Z0-9._:=^!&-]{1,24}$/.test(x); });
      ok = list.length > 0;
      if (ok) { importSymbols(list); WIZMSG = "Added " + list.join(", ") + "."; } else WIZMSG = "Type one or more symbols, like NVDA, AAPL.";
    }
  }
  else if (a === "wizmail") {
    var u = $("wzU").value.trim(), t = $("wzT").value.trim();
    if (!/^https:\/\/script\.google\.com\/.+\/exec$/.test(u)) WIZMSG = "That does not look like a Web app URL. It starts with https://script.google.com/ and ends in /exec.";
    else if (!t) WIZMSG = "Paste the token too (the long code the Web app URL showed you).";
    else {
      P.mail = [0, 1].map(function (i) { return (P.mail && P.mail[i]) || {}; });
      P.mail[0] = { name: $("wzN").value.trim() || "Mail", url: u, t: t };
      persist(); MAIL = []; render(); fetchMail(); loadMailForm();
      WIZMSG = "Saved. Your unread count appears in the Mail box within a minute.";
    }
  }
  wizRender();
}

// ---- Usage counters for the site owner's admin overview ----
// Only two things are counted, and only while signed in: seconds the page was open and visible, and how many times
// each kind of button was pressed (for example "news: open headline"). Never what you read, type, search or save.
var TRK = { secs: 0, clicks: {} };
setInterval(function () { if (USER && !document.hidden) TRK.secs += 15; }, 15000);
function trackClick(a, el) {
  if (!USER || !a) return;
  var box = el.closest("[data-id]"), where = box ? box.dataset.id : el.closest("#panel") ? "settings" : el.closest("#modal") ? "window" : el.closest(".sw") ? "side" : "page";
  var k = (where + ":" + a).replace(/[^\w:.-]/g, "").slice(0, 48);
  TRK.clicks[k] = (TRK.clicks[k] || 0) + 1;
}
function trackFlush() {
  if (!sb || !USER || (!TRK.secs && !Object.keys(TRK.clicks).length)) return;
  var t = TRK;
  TRK = { secs: 0, clicks: {} };
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { track: t } }).catch(function () {});
}
setInterval(trackFlush, 120000);
document.addEventListener("visibilitychange", function () { if (document.hidden) trackFlush(); });

// ---- Search bar: plain words go to your search engine, a site name opens the site, !bangs pick a site to search ----
var ENGINES = { google: "https://www.google.com/search?q=", ddg: "https://duckduckgo.com/?q=", brave: "https://search.brave.com/search?q=", bing: "https://www.bing.com/search?q=", kagi: "https://kagi.com/search?q=" };
var BANGS = {
  g: ENGINES.google, ddg: ENGINES.ddg, yt: "https://www.youtube.com/results?search_query=", tw: "https://www.twitch.tv/search?term=",
  r: "https://www.reddit.com/search/?q=", w: "https://en.wikipedia.org/w/index.php?search=", gh: "https://github.com/search?q=",
  maps: "https://www.google.com/maps/search/", news: "https://news.google.com/search?q=", tv: "https://www.tradingview.com/symbols/", a: "https://www.amazon.com/s?k="
};
function searchUrl(q) {
  q = q.trim();
  if (!q) return "";
  var m = q.match(/^!(\w+)\s*(.*)$/) || q.match(/^(.*?)\s+!(\w+)$/);
  if (m) {
    var bang = /^!/.test(q) ? m[1] : m[2], rest = /^!/.test(q) ? m[2] : m[1];
    if (BANGS[bang.toLowerCase()]) return BANGS[bang.toLowerCase()] + encodeURIComponent(rest);
  }
  if (/^https?:\/\/\S+$/i.test(q)) return q;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}(:\d+)?(\/\S*)?$/i.test(q)) return "https://" + q;
  return (ENGINES[P.engine] || ENGINES.google) + encodeURIComponent(q);
}
function openSearch() { $("srchIn").focus(); $("srchIn").select(); }

// ---- The search bar answers sums and conversions while you type: "12*45", "15% of 240", "100 usd in eur", "10 km in miles" ----
// Sums are worked out by a small parser of our own (numbers, + - * / ^, brackets, a few functions); nothing typed is ever run as code.
function calcMath(src) {
  var s = src.toLowerCase().replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/(\d)x(?=[\d(])/g, "$1*")
    .replace(/(\d),(\d{3})(?!\d)/g, "$1$2").replace(/(\d),(\d)/g, "$1.$2").replace(/%of/g, "%*");
  if (!/\d/.test(s) || !/[-+*\/^%(]|[a-z]/.test(s.slice(1)) && !/^[a-z]/.test(s)) return null;   // a plain number is not a sum
  if (/^\d+(-\d+){2,}$/.test(s) || /^\d+(\/\d+){2}$/.test(s)) return null;                          // a date or a phone number
  var i = 0, FN = { sqrt: Math.sqrt, abs: Math.abs, round: Math.round, floor: Math.floor, ceil: Math.ceil, ln: Math.log, log: function (x) { return Math.log(x) / Math.LN10; }, sin: Math.sin, cos: Math.cos, tan: Math.tan };
  function fail() { throw new Error("no"); }
  function expr() { var v = term(); while (s[i] === "+" || s[i] === "-") { var o = s[i++], r = term(); v = o === "+" ? v + r : v - r; } return v; }
  function term() { var v = pow(); while (s[i] === "*" || s[i] === "/") { var o = s[i++], r = pow(); v = o === "*" ? v * r : v / r; } return v; }
  function pow() { var v = unary(); if (s[i] === "^") { i++; return Math.pow(v, pow()); } return v; }
  function unary() { if (s[i] === "-") { i++; return -unary(); } if (s[i] === "+") { i++; return unary(); } return pct(); }
  function pct() { var v = atom(); while (s[i] === "%") { i++; v /= 100; } return v; }
  function atom() {
    if (s[i] === "(") { i++; var v = expr(); if (s[i++] !== ")") fail(); return v; }
    var m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
    if (m) { i += m[0].length; return parseFloat(m[0]); }
    m = /^[a-z]+/.exec(s.slice(i));
    if (!m) fail();
    i += m[0].length;
    if (m[0] === "pi") return Math.PI;
    if (!FN[m[0]] || s[i++] !== "(") fail();
    var a = expr(); if (s[i++] !== ")") fail();
    return FN[m[0]](a);
  }
  try { var out = expr(); return i === s.length && isFinite(out) ? out : null; } catch (e) { return null; }
}
// Units, as [what it measures, size in the base unit]. Temperatures are handled on their own.
var UNITS = {};
[["len", 0.001, "mm"], ["len", 0.01, "cm"], ["len", 1, "m meter meters metre metres"], ["len", 1000, "km"], ["len", 0.0254, "in inch inches"], ["len", 0.3048, "ft foot feet"], ["len", 0.9144, "yd yard yards"], ["len", 1609.344, "mi mile miles"],
  ["mass", 0.001, "g gram grams"], ["mass", 1, "kg kilo kilos"], ["mass", 0.0283495, "oz ounce ounces"], ["mass", 0.453592, "lb lbs pound pounds"], ["mass", 6.35029, "st stone"], ["mass", 1000, "t tonne tonnes"],
  ["vol", 0.001, "ml"], ["vol", 0.1, "dl"], ["vol", 1, "l liter liters litre litres"], ["vol", 3.78541, "gal gallon gallons"], ["vol", 0.236588, "cup cups"], ["vol", 0.473176, "pint pints"], ["vol", 0.0295735, "floz"],
  ["spd", 1, "m/s"], ["spd", 1 / 3.6, "km/h kmh kph"], ["spd", 0.44704, "mph"], ["spd", 0.514444, "kn knot knots"],
  ["time", 1, "s sec second seconds"], ["time", 60, "min minute minutes"], ["time", 3600, "h hr hour hours"], ["time", 86400, "day days"], ["time", 604800, "week weeks"], ["time", 31557600, "year years"],
  ["data", 1, "kb"], ["data", 1024, "mb"], ["data", 1048576, "gb"], ["data", 1073741824, "tb"],
  ["temp", 0, "c celsius °c"], ["temp", 1, "f fahrenheit °f"], ["temp", 2, "k kelvin"]
].forEach(function (u) { u[2].split(" ").forEach(function (n) { UNITS[n] = { k: u[0], f: u[1], n: u[2].split(" ")[0] }; }); });
var CUR_ALIAS = { "$": "USD", "€": "EUR", "£": "GBP", dollar: "USD", dollars: "USD", euro: "EUR", euros: "EUR", pound: "GBP", pounds: "GBP", bitcoin: "BTC", bitcoins: "BTC", ether: "ETH", sol: "SOL" };
var FXALL = {};   // every currency of the rates service: how many of it one US dollar buys
function usdOf(code) { code = CUR_ALIAS[code.toLowerCase()] || code.toUpperCase(); return RATES[code] ? { c: code, v: RATES[code] } : FXALL[code] ? { c: code, v: 1 / FXALL[code] } : null; }
function ansNum(n) {
  var a = Math.abs(n);
  if (a && (a >= 1e15 || a < 1e-7)) return n.toExponential(4);
  return String(+n.toPrecision(a >= 1 ? 12 : 8));
}
// returns { show: what the bar shows, raw: the bare number that Enter puts in the box } or null when it is just a search
function calcAnswer(q) {
  q = q.trim();
  if (!q || q.length > 80 || q.charAt(0) === "!" || /^https?:/i.test(q)) return null;
  var m = /^(.*?)\s*([a-z$€£°][a-z\/°]*)\s+(?:in|to|as)\s+([a-z$€£°][a-z\/°]*)$/i.exec(q) || /^(.*?)\s*([a-z$€£°][a-z\/°]*)\s*(?:=|->|→)\s*([a-z$€£°][a-z\/°]*)$/i.exec(q) || /^([$€£])\s*(.+?)\s+(?:in|to|as)\s+([a-z$€£]+)$/i.exec(q);
  if (m) {
    if (/^[$€£]$/.test(m[1])) m = [0, m[2], m[1], m[3]];
    var amt = m[1] === "" ? 1 : /^[\d.,\s]+$/.test(m[1]) ? parseFloat(m[1].replace(/\s/g, "").replace(/(\d),(\d{3})(?!\d)/g, "$1$2").replace(",", ".")) : calcMath(m[1]);
    if (amt == null || isNaN(amt)) return null;
    var a = UNITS[m[2].toLowerCase()], b = UNITS[m[3].toLowerCase()], ca = usdOf(m[2]), cb = usdOf(m[3]), out;
    if (ca && cb && !(a && b && a.k === b.k)) {
      out = amt * ca.v / cb.v;
      return { show: fmtNum(amt) + " " + ca.c + " = " + fmtNum(out) + " " + cb.c, raw: String(+out.toPrecision(8)) };
    }
    if (a && b && a.k === b.k) {
      if (a.k === "temp") { var kel = a.f === 0 ? amt + 273.15 : a.f === 1 ? (amt - 32) * 5 / 9 + 273.15 : amt; out = b.f === 0 ? kel - 273.15 : b.f === 1 ? (kel - 273.15) * 9 / 5 + 32 : kel; }
      else out = amt * a.f / b.f;
      out = +out.toPrecision(6);
      return { show: ansNum(amt) + " " + a.n + " = " + ansNum(out) + " " + b.n, raw: ansNum(out) };
    }
    return null;
  }
  var v = calcMath(q);
  // "24/7" or "9-5" may just as well be something to search for: the answer is shown, but Enter still searches
  return v == null ? null : { show: "= " + ansNum(v), raw: ansNum(v), soft: /^\d+[-\/]\d+$/.test(q.replace(/\s/g, "")) };
}
var SRCHANS = null;
// "note buy milk" or "todo call the bank": Enter saves it straight into Notes (Ctrl+Enter still searches the web for it)
function scratch(q) {
  var m = /^(note|todo)[:\s]\s*(\S.*)$/i.exec(q.trim());
  return m ? { save: { todo: m[1].toLowerCase() === "todo", t: m[2].trim().slice(0, 2000) }, show: (m[1].toLowerCase() === "todo" ? "New to-do: " : "New note: ") + m[2].trim() } : null;
}
// ---- Dates in the search bar: "days until 24 dec", "90 days from today", "week number", "what day is 1 may 2027" ----
var MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
var DAYNAMES = { christmas: [25, 11], "christmas eve": [24, 11], "christmas day": [25, 11], "new year": [1, 0], "new years": [1, 0], "new year's": [1, 0], "new years eve": [31, 11], "new year's eve": [31, 11], halloween: [31, 9], "valentines day": [14, 1], "valentine's day": [14, 1] };
// a date as you would type it; with no year it is the next time that date comes round (or the last time, for "since")
function parseDay(s, past) {
  s = String(s || "").trim().toLowerCase().replace(/(\d)(st|nd|rd|th)\b/g, "$1").replace(/,/g, " ").replace(/\s+/g, " ").replace(/^the /, "");
  var now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate()), d = null, m, hasYear = true;
  if (s === "today" || s === "now") return today;
  if (s === "tomorrow") return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  if (s === "yesterday") return new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  var mk = function (y, mo, da) { var x = new Date(y, mo, da); return x.getMonth() === mo && x.getDate() === da ? x : null; };
  if (DAYNAMES[s]) { d = mk(today.getFullYear(), DAYNAMES[s][1], DAYNAMES[s][0]); hasYear = false; }
  else if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s))) d = mk(+m[1], +m[2] - 1, +m[3]);
  else if ((m = /^(\d{1,2})[.\/](\d{1,2})(?:[.\/](\d{2,4}))?\.?$/.exec(s))) { hasYear = !!m[3]; d = mk(m[3] ? (+m[3] < 100 ? 2000 + +m[3] : +m[3]) : today.getFullYear(), +m[2] - 1, +m[1]); }
  else if ((m = /^(\d{1,2}) ([a-z]{3,9})\.?(?: (\d{4}))?$/.exec(s)) || (m = /^([a-z]{3,9})\.? (\d{1,2})(?: (\d{4}))?$/.exec(s))) {
    var dayFirst = /^\d/.test(m[1]), mo = MONTHS.indexOf((dayFirst ? m[2] : m[1]).slice(0, 3));
    if (mo < 0) return null;
    hasYear = !!m[3]; d = mk(m[3] ? +m[3] : today.getFullYear(), mo, +(dayFirst ? m[1] : m[2]));
  }
  if (!d) return null;
  if (!hasYear && past !== "same") { if (!past && d < today) d = mk(d.getFullYear() + 1, d.getMonth(), d.getDate()); if (past && d > today) d = mk(d.getFullYear() - 1, d.getMonth(), d.getDate()); }
  return d;
}
function isoWeek(d) { var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7); }
function dayText(d) { return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }
function dateAnswer(q) {
  q = q.trim().toLowerCase().replace(/\?+$/, "").replace(/\s+/g, " ");
  var now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate()), m, d, n;
  var span = function (days) { days = Math.abs(days); return days + " day" + (days === 1 ? "" : "s") + (days >= 14 ? " (" + Math.floor(days / 7) + " weeks" + (days % 7 ? " " + days % 7 + " d" : "") + ")" : ""); };
  var diff = function (a, b) { return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000); };
  if ((m = /^(?:how many )?days? (?:until|till|til|to|before|left to|left until) (.+)$/.exec(q)) && (d = parseDay(m[1]))) { n = diff(today, d); return { show: (n < 0 ? span(n) + " ago" : n === 0 ? "That is today" : span(n)) + " · " + dayText(d), raw: String(n) }; }
  if ((m = /^(?:how many )?days? (?:since|after) (.+)$/.exec(q)) && (d = parseDay(m[1], true))) { n = diff(d, today); return { show: span(n) + " since " + dayText(d), raw: String(n) }; }
  // two dates without a year are both taken in this year
  if ((m = /^(?:days? )?between (.+?) and (.+)$/.exec(q)) && (d = parseDay(m[1], "same")) && parseDay(m[2], "same")) { n = diff(d, parseDay(m[2], "same")); return { show: span(n) + " between them", raw: String(Math.abs(n)) }; }
  if ((m = /^(?:in )?(\d{1,5}) (day|week|month|year)s?(?: (from|after|before|ago))?(?: (.+))?$/.exec(q)) && (/^in /.test(q) || m[3])) {
    var base = m[4] && m[3] !== "ago" ? parseDay(m[4]) : today, sign = m[3] === "before" || m[3] === "ago" ? -1 : 1, k = +m[1] * sign;
    if (!base) return null;
    d = m[2] === "day" ? new Date(base.getFullYear(), base.getMonth(), base.getDate() + k) : m[2] === "week" ? new Date(base.getFullYear(), base.getMonth(), base.getDate() + 7 * k) : m[2] === "month" ? new Date(base.getFullYear(), base.getMonth() + k, base.getDate()) : new Date(base.getFullYear() + k, base.getMonth(), base.getDate());
    return { show: dayText(d) + " · week " + isoWeek(d), raw: ymd(d) };
  }
  if ((m = /^week(?: ?number| ?no\.?| ?nr\.?)?(?: (?:of|for|on) (.+)| (.+))?$/.exec(q))) { d = m[1] || m[2] ? parseDay(m[1] || m[2]) : today; return d ? { show: "Week " + isoWeek(d) + (m[1] || m[2] ? " · " + dayText(d) : " · today is " + dayText(d)), raw: String(isoWeek(d)) } : null; }
  if ((m = /^(?:what |which )?(?:week)?day (?:is|was|of|on) (.+)$/.exec(q)) && (d = parseDay(m[1]))) return { show: dayText(d) + " · week " + isoWeek(d), raw: dayText(d) };
  if (q === "today" || q === "date" || q === "todays date" || q === "today's date") return { show: dayText(today) + " · week " + isoWeek(today), raw: ymd(today) };
  return null;
}
// ---- Translate in the search bar: "tr hello to swedish", "translate tere hommikust" (to English when no language is given) ----
// Sent to the free MyMemory translation service, which works out the language it is written in. Only what you type after "tr".
var TR_LANG = { english: "en", swedish: "sv", estonian: "et", russian: "ru", finnish: "fi", german: "de", french: "fr", spanish: "es", italian: "it", portuguese: "pt", dutch: "nl", polish: "pl", norwegian: "no", danish: "da",
  latvian: "lv", lithuanian: "lt", ukrainian: "uk", turkish: "tr", greek: "el", czech: "cs", hungarian: "hu", romanian: "ro", japanese: "ja", chinese: "zh-CN", korean: "ko", arabic: "ar", hindi: "hi" };
var trTimer = 0, TRC = {};
function trAsk(q) {
  var m = /^(?:tr|translate)\s+(.+)$/i.exec(q.trim());
  if (!m) return null;
  var text = m[1].trim(), to = "en", toName = "English", t = /^(.*\S)\s+(?:to|into|in)\s+([a-zA-Z-]{2,12})$/.exec(text);
  if (t) {
    var w = t[2].toLowerCase(), code = TR_LANG[w] || (Object.keys(TR_LANG).filter(function (k) { return TR_LANG[k].toLowerCase() === w; })[0] ? w : "");
    if (code) { to = TR_LANG[w] || code; toName = TR_LANG[w] ? w.charAt(0).toUpperCase() + w.slice(1) : code.toUpperCase(); text = t[1].trim(); }
  }
  return text ? { text: text.slice(0, 400), to: to, toName: toName } : null;
}
function trRun(a) {
  var key = a.to + "|" + a.text, inp = $("srchIn"), typed = inp.value;
  var done = function (out) {
    TRC[key] = out;
    if (inp.value !== typed) return;   // you typed on in the meantime
    SRCHANS = out.err ? null : { show: out.t, raw: out.t };
    $("srchAns").hidden = false;
    $("srchAns").innerHTML = "<b>" + esc(out.err || out.t) + "</b><small>" + (out.err ? "" : (out.from ? out.from + " → " : "→ ") + esc(a.toName) + " · Enter to copy") + "</small>";
  };
  if (TRC[key]) { done(TRC[key]); return; }
  fetch("https://api.mymemory.translated.net/get?q=" + encodeURIComponent(a.text) + "&langpair=autodetect|" + encodeURIComponent(a.to)).then(function (r) { return r.json(); }).then(function (j) {
    var t = j && j.responseData && j.responseData.translatedText, from = j && j.responseData && j.responseData.detectedLanguage;
    done(t && +j.responseStatus === 200 ? { t: unent(String(t)), from: from ? String(from).slice(0, 5) : "" } : { err: /limit|quota/i.test(String((j && j.responseDetails) || "")) ? "The free translation limit for today is used up." : "No translation found." });
  }).catch(function () { done({ err: "The translation service did not answer." }); });
}
function srchShow() {
  var q = $("srchIn").value, box = $("srchAns"), tr = trAsk(q);
  clearTimeout(trTimer);
  var a = SRCHANS = scratch(q) || (/^\s*(help|\?)\s*$/i.test(q) ? { show: "What the search bar can do", help: 1 } : null) || (tr ? { show: "Translating to " + tr.toName + "…", wait: 1 } : null) || dateAnswer(q) || calcAnswer(q);
  box.hidden = !a;
  if (a) box.innerHTML = "<b>" + esc(a.show) + "</b><small>" + (a.save ? "Enter to save" : a.help ? "Enter to open" : a.wait ? "" : a.soft ? "click to copy" : "Enter to copy") + "</small>";
  if (tr) trTimer = setTimeout(function () { trRun(tr); }, 500);   // wait until you stop typing
}
// "help" in the search bar: everything the bar can do, in one small window
function searchHelpHtml() {
  var sk = keysOn() && keyOf("search") ? keyLabel(keyOf("search")) : "";
  var row = function (a, b) { return "<tr><td><code>" + a + "</code></td><td>" + b + "</td></tr>"; };
  return '<p class="mut sn">Type in the bar at the top' + (sk ? " (press <code>" + esc(sk) + "</code> to jump to it)" : "") + '. Answers appear under the bar while you type.</p><table class="shelp">' +
    "<tr><th colspan=\"2\">Search and open</th></tr>" +
    row("any words", "Search with your search engine (Settings → Search bar). Enter opens it, Ctrl+Enter opens it in a new tab.") +
    row("reuters.com", "A site name opens the site.") +
    row("!yt lofi", "Search one site: <code>!yt</code> YouTube, <code>!tw</code> Twitch, <code>!r</code> Reddit, <code>!w</code> Wikipedia, <code>!gh</code> GitHub, <code>!maps</code> Maps, <code>!news</code> Google News, <code>!tv</code> TradingView, <code>!a</code> Amazon, <code>!g</code> Google, <code>!ddg</code> DuckDuckGo. The <code>!</code> word can also go last.") +
    "<tr><th colspan=\"2\">Answers (Enter copies the answer)</th></tr>" +
    row("12*45", "Sums: <code>+ - * / ^</code>, brackets, <code>15% of 240</code>, <code>sqrt(2)</code>, <code>pi</code>, also abs, round, floor, ceil, ln, log, sin, cos, tan.") +
    row("100 usd in eur", "Currencies (every one the rates service lists) and BTC, ETH, SOL: <code>0.5 btc to usd</code>, <code>$100 in sek</code>.") +
    row("10 km in miles", "Units: length, weight, volume, speed, time, data and temperature (<code>72 f in c</code>).") +
    row("days until 24 dec", "Dates: <code>days since 1 jan 2020</code>, <code>90 days from today</code>, <code>in 3 weeks</code>, <code>2 months before 1 may</code>, <code>between 1 mar and 24 dec</code>, <code>week number</code>, <code>what day is 1 may 2027</code>, <code>today</code>.") +
    row("tr hello to swedish", "Translate. The language it is written in is worked out for you; without <code>to …</code> it goes to English: <code>tr tere hommikust</code>. Sent to the free MyMemory service.") +
    "<tr><th colspan=\"2\">Save</th></tr>" +
    row("note buy milk", "Saves a note without opening Notes.") +
    row("todo call the bank", "Saves a to-do.") +
    "<tr><th colspan=\"2\">Keys</th></tr>" +
    row("Enter", "Search, or take the answer shown under the bar (copy it, save it). After an answer, Enter again searches for it.") +
    row("Ctrl+Enter", "Always search the web, in a new tab, whatever is typed.") +
    row("Esc", "Leave the bar.") +
    row("help", "This window.") + "</table>";
}
function openSearchHelp() { openModal("Search bar", searchHelpHtml()); }
// Enter (or a click on the answer): the answer goes into the box, selected, and onto the clipboard
function srchTake() {
  if (!SRCHANS || SRCHANS.wait) return;
  if (SRCHANS.help) { SRCHANS = null; $("srchAns").hidden = true; $("srchIn").value = ""; $("srchIn").blur(); openSearchHelp(); return; }
  if (SRCHANS.save) {
    var s = SRCHANS.save;
    SRCHANS = null;
    (P.notes = P.notes || []).push({ id: "n" + Date.now().toString(36), t: s.t, ts: Date.now(), todo: s.todo });
    persist(); render();
    if (sideOf("notes")) putWidget("notes");
    $("srchAns").innerHTML = "<b>" + (s.todo ? "Saved to your to-dos" : "Saved to your notes") + "</b><small>✓</small>";
    $("srchIn").value = ""; $("srchIn").focus();
    setTimeout(function () { if (!SRCHANS) $("srchAns").hidden = true; }, 1800);
    return;
  }
  var raw = SRCHANS.raw, box = $("srchAns"), inp = $("srchIn");
  box.innerHTML = "<b>" + esc(SRCHANS.show) + "</b><small>copied</small>";
  SRCHANS = null;
  inp.value = raw; inp.focus(); inp.select();
  try { if (navigator.clipboard) navigator.clipboard.writeText(raw).catch(function () { box.lastChild.textContent = ""; }); } catch (e) {}
}
$("srchIn").addEventListener("input", srchShow);
$("srchIn").addEventListener("focus", srchShow);
$("srchIn").addEventListener("blur", function () { setTimeout(function () { if (document.activeElement !== $("srchIn")) $("srchAns").hidden = true; }, 200); });
$("srch").addEventListener("submit", function (e) {
  e.preventDefault();
  if (SRCHANS && !SRCHANS.soft) { srchTake(); return; }
  SRCHANS = null; $("srchAns").hidden = true;
  var u = safeUrl(searchUrl($("srchIn").value));
  if (!u) return;
  $("srchIn").value = ""; $("srchIn").blur();
  if (P.srchNew) window.open(u, "_blank", "noopener"); else location.href = u;
});
$("srchIn").addEventListener("keydown", function (e) {
  if (e.key === "Escape") { e.target.blur(); return; }
  if (e.key !== "Enter" || !(e.ctrlKey || e.metaKey)) return;
  e.preventDefault();
  var u = safeUrl(searchUrl(e.target.value));
  if (u) { e.target.value = ""; window.open(u, "_blank", "noopener"); }
});

// ---- Settings that are not part of the colors ----
function loadExtraForm() {
  var w = NW();
  $("nwMute").value = w.mute || ""; $("nwHi").value = w.hi || "";
  $("twPopOn").checked = !!P.twPop; $("dockChatOn").checked = !!P.dockChat;
  $("engineSel").value = ENGINES[P.engine] ? P.engine : "google"; $("srchNewTab").checked = !!P.srchNew;
  var n = NTF();
  NF_BOX.forEach(function (x) { $(x[0]).checked = n[x[1]] !== false && !!n[x[1]]; });
  NF_NUM.forEach(function (x) { $(x[0]).value = n[x[1]]; });
  $("briefOn").checked = P.brief !== false;
  renderLangs(); renderRadioList();
  $("cntNews").value = String(cntOf("news") - MORE.news); $("cntTg").value = String(cntOf("tg") - MORE.tg);
  $("rdComSel").value = String(rdComN()); $("twOffOn").checked = twOffOn(); $("devMailOn").checked = P.devMail !== false; $("pasteOn").checked = P.pasteNote !== false;
  $("sparkSel").value = sparkOn() ? sparkRange() : "off"; $("spCalOn").checked = P.spCal !== false;
  renderKeys();
}
function setWords() { P.nwords = { mute: $("nwMute").value.trim(), hi: $("nwHi").value.trim() }; persist(); render(); }
$("nwMute").onchange = setWords; $("nwHi").onchange = setWords;
$("twPopOn").onchange = function () { P.twPop = this.checked; persist(); };
// Notification settings: [input id, name in P.ntf, (for numbers) lowest, highest]
var NF_BOX = [["nfNews", "news"], ["nfWords", "words"], ["nfStock", "stock"], ["nfLive", "live"], ["nfCal", "cal"], ["nfMail", "mail"], ["nfSport", "sport"], ["nfSound", "sound"], ["nfDesktop", "desktop"], ["nfEmail", "email"]];
var NF_NUM = [["nfSrcN", "srcN", 2, 6], ["nfPct", "pct", 0.5, 50], ["nfDay", "day", 1, 90]];
function setNtf() {
  var n = {};
  NF_BOX.forEach(function (x) { n[x[1]] = $(x[0]).checked; });
  NF_NUM.forEach(function (x) { var v = parseFloat($(x[0]).value); n[x[1]] = isNaN(v) ? NTF()[x[1]] : Math.max(x[2], Math.min(x[3], v)); });
  P.ntf = n; persist();
  if (n.desktop) askNotify();
}
NF_BOX.concat(NF_NUM).forEach(function (x) { $(x[0]).onchange = setNtf; });
$("briefOn").onchange = function () { P.brief = this.checked; persist(); };
$("sparkSel").onchange = function () { P.spark = this.value !== "off"; if (P.spark) P.sparkR = this.value; persist(); if (sparkRange() !== SPARKR) SPARK = {}; render(); fetchSparks(true); };
$("spCalOn").onchange = function () { P.spCal = this.checked; persist(); render(); refreshCal(); };
$("keysOn").onchange = function () { P.keysOff = !this.checked; persist(); renderKeys(); };
$("cntNews").onchange = function () { P.cnt = P.cnt || {}; P.cnt.news = +this.value; MORE.news = 0; persist(); render(); };
$("cntTg").onchange = function () { P.cnt = P.cnt || {}; P.cnt.tg = +this.value; MORE.tg = 0; persist(); render(); tgTopUp(); };
$("rdComSel").onchange = function () { P.rdCom = +this.value; persist(); };
$("devMailOn").onchange = function () { P.devMail = this.checked; persist(); };
$("pasteOn").onchange = function () { P.pasteNote = this.checked; persist(); };
$("twOffOn").onchange = function () { P.twOff = this.checked; persist(); render(); if (this.checked && twToken()) fetchTwOffline(twToken()); };
// a click anywhere else cancels "Press a key…"
document.addEventListener("click", function (e) { if (KEYCAP && !(e.target.closest && e.target.closest(".kbd"))) { KEYCAP = ""; renderKeys(); } }, true);
$("engineSel").onchange = function () { P.engine = this.value; persist(); };
$("srchNewTab").onchange = function () { P.srchNew = this.checked; persist(); };
$("auroraOn").onchange = function () { P.aurora = this.checked; persist(); applyTheme(); };
$("shadowOn").onchange = function () { P.shadow = this.checked; persist(); applyTheme(); };
$("srcNamesOn").onchange = function () { P.hideSrc = !this.checked; persist(); render(); };
$("dockChatOn").onchange = function () { P.dockChat = this.checked; persist(); };
document.addEventListener("input", function (e) {
  if (e.target.id !== "newsQ") return;
  debounced("newsQ", function () { NQ = $("newsQ") ? $("newsQ").value.trim().toLowerCase() : ""; render(); });
});

// ---- Sign-in activity (Settings > Account): where this account is signed in, and its recent sign-ins ----
// Read from Supabase's own sign-in records by a small database function that only ever answers for the caller's account.
function devName(ua) {
  ua = String(ua || "");
  if (!ua) return "Unknown device";
  var br = /Edg\//.test(ua) ? "Edge" : /OPR\/|Opera/.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Browser";
  var os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad|iPod/.test(ua) ? "iPhone / iPad" : /Mac OS X/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "";
  return br + (os ? " on " + os : "");
}
var ACT_WHAT = { login: "Signed in", logout: "Signed out", user_recovery_requested: "Password reset requested", user_modified: "Account changed (password or email)", user_signedup: "Account created" };
function loadActivity() {
  var box = $("actList");
  if (!sb || !USER) { box.innerHTML = '<p class="mut sn">Sign in first.</p>'; return; }
  box.innerHTML = '<p class="mut sn">Loading…</p>';
  Promise.all([sb.rpc("my_activity"), sb.auth.getSession()]).then(function (r) {
    var a = r[0], sid = "";
    try { var p = r[1].data.session.access_token.split(".")[1]; sid = JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/"))).session_id || ""; } catch (e) {}
    if (a.error || !a.data) {
      box.innerHTML = '<p class="mut sn">' + (a.error && !/my_activity|schema cache|PGRST202|404/i.test((a.error.message || "") + (a.error.code || "")) ? "Could not load it: " + esc(a.error.message) : "This needs a one-time setup: open the Supabase dashboard, SQL Editor, New query, paste the contents of <code>activity-setup.sql</code> and press Run.") + "</p>";
      return;
    }
    var ses = a.data.sessions || [], log = a.data.logins || [];
    box.innerHTML = '<div class="sub"><b>Signed in right now</b>' + (ses.map(function (s) {
      return '<div class="row"><span>' + esc(devName(s.ua)) + (s.id === sid ? ' <span class="pill ac">this one</span>' : "") + (s.ip ? " <small>" + esc(s.ip) + "</small>" : "") + '</span><span class="r mut" title="Signed in ' + esc(when(Date.parse(s.at))) + '">active ' + ago(Date.parse(s.last)) + " ago</span></div>";
    }).join("") || '<p class="mut sn">Nothing found.</p>') + "</div>" +
      '<div class="sub"><b>Recent activity</b>' + (log.map(function (l) {
        return '<div class="row"><span>' + esc(ACT_WHAT[l.what] || l.what) + (l.ip ? " <small>" + esc(l.ip) + "</small>" : "") + '</span><span class="r mut">' + esc(when(Date.parse(l.at))) + "</span></div>";
      }).join("") || '<p class="mut sn">No history available (Supabase may not be keeping its sign-in log).</p>') + "</div>";
  }).catch(function (e) { box.innerHTML = '<p class="mut sn">Could not load it: ' + esc(String((e && e.message) || e)) + "</p>"; });
}

// ---- Paste to note: Ctrl+V on the page itself (not in a text box) offers to keep the clipboard text as a note or to-do ----
document.addEventListener("paste", function (e) {
  var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  if (typing || P.pasteNote === false) return;
  var txt = "";
  try { txt = (e.clipboardData || window.clipboardData).getData("text"); } catch (x) {}
  txt = String(txt || "").trim().slice(0, 2000);
  if (!txt) return;
  e.preventDefault();
  var old = $("pasteAsk"); if (old) old.remove();
  var el = document.createElement("div");
  el.className = "toast pasteask"; el.id = "pasteAsk";
  el.innerHTML = '<div class="tb"><b>Save what you pasted?</b><span></span><p class="acts"><button class="pri" data-a="pastesave" data-k="note">As a note</button><button data-a="pastesave" data-k="todo">As a to-do</button></p></div><button class="tx" data-a="pastesave" data-k="" aria-label="Dismiss">✕</button>';
  el.querySelector("span").textContent = txt.length > 160 ? txt.slice(0, 160) + "…" : txt;
  el.dataset.txt = txt;
  $("toasts").appendChild(el);
  setTimeout(function () { if (document.contains(el)) el.remove(); }, 15000);
});
function pasteSave(kind) {
  var el = $("pasteAsk");
  if (!el) return;
  var txt = el.dataset.txt;
  el.remove();
  if (!kind || !txt) return;
  (P.notes = P.notes || []).push({ id: "n" + Date.now().toString(36), t: txt, ts: Date.now(), todo: kind === "todo" });
  persist(); render();
  if (sideOf("notes")) putWidget("notes");
}

// ---- New device: the first time this account is opened in a browser it has not been seen in, it emails you ----
// Each browser gets a random name of its own, kept on that device; the account remembers which ones it has seen.
// The email goes through your own Gmail script (Settings > Mail), so it only works when an inbox is connected.
function checkDevice() {
  if (!USER) return;
  var id = "";
  try { id = localStorage.getItem("sp_dev") || ""; if (!/^[a-z0-9]{8,20}$/.test(id)) { id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); localStorage.setItem("sp_dev", id); } } catch (e) { return; }
  var devs = P.devs && typeof P.devs === "object" ? P.devs : {}, known = Object.keys(devs);
  if (devs[id]) return;
  var name = devName(navigator.userAgent), first = !known.length;
  devs[id] = { n: name, t: Date.now() };
  if (known.length >= 30) known.sort(function (a, b) { return (devs[a].t || 0) - (devs[b].t || 0); }).slice(0, known.length - 29).forEach(function (k) { delete devs[k]; });
  P.devs = devs; persist();
  // the very first device of an account is not news; after that every new one is
  if (first || P.devMail === false || !mailCfg()) return;
  sendNtfMail([{ ts: Date.now(), t: "New sign-in to your OmniRama account", b: name + ", " + when(Date.now()) + ". If this was you, nothing needs doing. If not: change your password, then Settings > Account > Sign-in activity > Sign out everywhere else." }]);
}

// ---- Settings search: type a word, get every setting that mentions it, click to jump there ----
var SETRES = [];
function setSearch() {
  var q = ($("setQ") ? $("setQ").value : "").trim().toLowerCase(), res = $("setRes"), list = $("setNavL");
  if (!res) return;
  SETRES = [];
  if (q.length < 2) { res.hidden = true; list.hidden = false; return; }
  Array.prototype.forEach.call(document.querySelectorAll("#panel .setgrp"), function (g, i) {
    if (g.dataset.admin && !isAdmin()) return;
    var seen = {};
    if (g.dataset.sec.toLowerCase().indexOf(q) >= 0) SETRES.push({ i: i, el: null, t: g.dataset.sec, sec: g.dataset.sec });
    Array.prototype.forEach.call(g.querySelectorAll("label, .sn, button, .sub > b, option"), function (el) {
      // shown: the setting's own words. Searched as well: the choices of its dropdown and extra search words (data-kw).
      var txt = (el.tagName === "LABEL" ? Array.prototype.map.call(el.childNodes, function (n) { return n.nodeType === 3 ? n.textContent : ""; }).join(" ") : el.textContent).replace(/\s+/g, " ").trim();
      var at = el.tagName === "OPTION" ? el.closest("label") || el.parentNode : el, hay = (txt + " " + (el.tagName === "LABEL" ? el.textContent : "") + " " + (el.dataset.kw || "")).toLowerCase();
      if (el.tagName === "OPTION") txt = (at.tagName === "LABEL" ? Array.prototype.map.call(at.childNodes, function (n) { return n.nodeType === 3 ? n.textContent : ""; }).join(" ").replace(/\s+/g, " ").trim() + ": " : "") + txt;
      if (!txt || hay.indexOf(q) < 0 || seen[txt] || SETRES.some(function (r) { return r.el === at; })) return;
      seen[txt] = 1;
      SETRES.push({ i: i, el: at, t: txt.length > 64 ? txt.slice(0, 62) + "…" : txt, sec: g.dataset.sec });
    });
  });
  SETRES = SETRES.slice(0, 14);
  list.hidden = true; res.hidden = false;
  res.innerHTML = SETRES.length ? SETRES.map(function (r, n) { return '<button data-a="setfind" data-k="' + n + '"><small>' + esc(r.sec) + "</small>" + esc(r.t) + "</button>"; }).join("") : '<div class="mut sn">Nothing found.</div>';
}
function setFind(n) {
  var r = SETRES[n];
  if (!r) return;
  setSec(r.i);
  if (!r.el || !document.contains(r.el)) return;
  r.el.scrollIntoView({ block: "center" });
  r.el.classList.add("found");
  setTimeout(function () { r.el.classList.remove("found"); }, 1800);
}
document.addEventListener("input", function (e) { if (e.target.id === "setQ") setSearch(); });
document.addEventListener("keydown", function (e) { if (e.target.id === "setQ" && e.key === "Enter") { e.preventDefault(); setFind(0); } });

// ---- Backup and restore ----
$("bkExport").onclick = function () {
  var data = JSON.stringify({ app: "OmniRama", v: VERSION, at: new Date().toISOString(), prefs: Object.assign({}, P, { tw: undefined }) }, null, 2);
  var a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data], { type: "application/json" }));
  a.download = "omnirama-backup-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  $("bkMsg").textContent = "Backup downloaded.";
};
$("bkFile").onchange = function (e) {
  var f = e.target.files[0];
  if (!f) return;
  var fr = new FileReader();
  fr.onload = function () {
    var p = null;
    try { var j = JSON.parse(fr.result); p = j && j.app === "OmniRama" ? j.prefs : null; } catch (x) {}
    e.target.value = "";
    if (!p || typeof p !== "object" || Array.isArray(p)) { $("bkMsg").textContent = "That file is not an OmniRama backup."; return; }
    if (!confirm("Replace your current settings, sources, notes and layout with this backup?")) return;
    var tw = P.tw;
    P = Object.assign({ theme: "dark", accent: DEFAULT_ACCENT, fav: {}, hidden: {} }, p);
    if (!P.fav || typeof P.fav !== "object") P.fav = {};
    if (!P.hidden || typeof P.hidden !== "object") P.hidden = {};
    if (tw) P.tw = tw;
    persist(); applyTheme(); applyWall(); loadMailForm(); loadExtraForm(); renderSources(); renderClocks(); renderSide();
    NEWS = []; TGP = []; NEWSV++; MAIL = [];
    render(); refreshAll(true);
    $("bkMsg").textContent = "Restored.";
  };
  fr.readAsText(f);
};

// ---- Keyboard shortcuts (when you are not typing in a box) ----
function refreshAll(force) { fetchNews(); fetchQuotes(force); fetchTwitch(); fetchYT(); fetchMail(); fetchReddit(); fetchSports(force); fetchWeather(); fetchRates(); }
// Every shortcut: [name, standard key, what it does, the action]. Your own keys are in P.keys (name -> key, "" = no key);
// change them in Settings > Keyboard shortcuts.
var KEY_ACTS = [
  ["search", "/", "Jump to the search bar", function () { openSearch(); }],
  ["refresh", "r", "Refresh everything", function () { refreshAll(true); }],
  ["edit", "e", "Edit the layout", function () { EDIT = !EDIT; document.body.classList.toggle("editing", EDIT); render(); }],
  ["notes", "n", "Notes and to-dos", function () { openNotes(); }],
  ["cal", "c", "Calendar", function () { CALV = null; openCal(); }],
  ["brief", "b", "Summary", function () { openBrief(); }],
  ["weather", "w", "Weather", function () { openWeather(); }],
  ["bell", "a", "Notification history", function () { MENU_OPEN = MENU_OPEN === "bell" ? "" : "bell"; if (MENU_OPEN) { NLOG.forEach(function (x) { x.seen = 1; }); save("sp_nlog", NLOG); } render(); }],
  ["seen", "x", "Mark everything as seen", function () { markSeen(""); render(); }],
  ["filter", "f", "Filter the news", function () { NFILT = !(NFILT || NQ); if (!NFILT) NQ = ""; render(); var q = $("newsQ"); if (q) { q.value = ""; q.focus(); } }],
  ["timer", "i", "New timer", function () { audio(); openClock("t"); }],
  ["stopwatch", "o", "Start a stopwatch", function () { audio(); startStopwatch(); }],
  ["undock", "u", "Close the docked players", function () { DOCK.slice().forEach(function (d) { undock(d.uid); }); }],
  ["settings", "s", "Settings", function () { $("panel").hidden = !$("panel").hidden; }],
  ["keys", "k", "Change these shortcuts", function () { openKeys(); }],
  ["theme", "t", "Light / dark", function () { P.theme = P.theme === "dark" ? "light" : "dark"; persist(); applyTheme(); }],
  ["help", "?", "Help", function () { openHelp(); }]
];
function keyOf(name) {
  var own = P.keys && P.keys[name];
  if (typeof own === "string") return own;
  var d = KEY_ACTS.filter(function (x) { return x[0] === name; })[0];
  // a standard key that you gave to another action is no longer this action's key
  return d && !Object.keys(P.keys || {}).some(function (n) { return n !== name && P.keys[n] === d[1]; }) ? d[1] : "";
}
function keyLabel(k) { return !k ? "none" : k === " " ? "Space" : k.length === 1 ? k.toUpperCase() : k.replace(/^Arrow/, ""); }
function keysOn() { return P.keysOff !== true; }
var KEYCAP = "";   // the action that is waiting for its new key
function renderKeys() {
  $("keysOn").checked = keysOn();
  $("keyList").innerHTML = KEY_ACTS.map(function (x) {
    var k = keyOf(x[0]), cap = KEYCAP === x[0];
    return "<label>" + x[2] + ' <button class="kbd' + (cap ? " cap" : "") + (k || cap ? "" : " none") + '" data-a="keyset" data-k="' + x[0] + '">' + (cap ? "Press a key…" : esc(keyLabel(k))) + "</button></label>";
  }).join("");
  var sk = keyOf("search");
  $("srchIn").placeholder = "Search…" + (sk && keysOn() ? "  ( " + keyLabel(sk) + " )" : "");
}
function openKeys() {
  var i = -1;
  Array.prototype.forEach.call(document.querySelectorAll("#panel .setgrp"), function (g, n) { if (g.id === "keysSec") i = n; });
  $("panel").hidden = false;
  if (i >= 0) setSec(i);
}
function setKey(name, key) {
  P.keys = P.keys || {};
  // one key, one action: the action that had this key loses it
  if (key) KEY_ACTS.forEach(function (x) { if (x[0] !== name && keyOf(x[0]) === key) P.keys[x[0]] = ""; });
  P.keys[name] = key;
  persist();
}
// While an action waits for its new key, the next key press belongs to it: Esc cancels, Backspace or Delete removes the key.
document.addEventListener("keydown", function (e) {
  if (!KEYCAP) return;
  if (/^(Shift|Control|Alt|Meta|AltGraph|CapsLock)$/.test(e.key)) return;
  e.preventDefault(); e.stopPropagation();
  var name = KEYCAP, k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  KEYCAP = "";
  if (k === "Backspace" || k === "Delete") setKey(name, "");
  else if (k !== "Escape" && k !== "Tab" && k !== "Enter" && !e.ctrlKey && !e.metaKey && !e.altKey) setKey(name, k);
  renderKeys();
}, true);
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented || !keysOn()) return;
  var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  if (typing || !$("modal").hidden) return;
  var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  var act = KEY_ACTS.filter(function (x) { return keyOf(x[0]) === k; })[0];
  if (!act) return;
  e.preventDefault();
  act[3]();
});

// ---- Only poll while the page is visible (saves your Supabase / API quotas); catch up when you come back ----
var HIDDEN_AT = 0;
function every(ms, fn, inBackground) { setInterval(function () { if (!document.hidden || (inBackground && inBackground())) fn(); }, ms); }
document.addEventListener("visibilitychange", function () {
  if (document.hidden) { HIDDEN_AT = Date.now(); return; }
  tick(); tickClocks();
  // Away for more than 2 minutes: what was on screen when you left counts as seen, so only newer items are marked new
  if (HIDDEN_AT && Date.now() - HIDDEN_AT > 120000) { markSeen("", HIDDEN_AT); refreshAll(); }
  else render();
  HIDDEN_AT = 0;
});

$("ver").textContent = VERSION;
applyTheme(); applyWall(); tick(); render(); initAuth(); fetchWeather(); fetchClockTz(); fetchRates();
$("twBtn").onclick = function () { if (twToken()) twDisconnect(); else if (window.TWITCH_CLIENT_ID) twConnect(); };
fetchTwitch(); fetchSports(); loadMailForm(); loadExtraForm(); renderSources(); renderClocks(); renderSide(); buildSetNav();
every(900000, fetchWeather); every(300000, fetchRates);
// With desktop notifications on, the things that can notify keep updating while the tab is in the background
function bg(kind) { return function () { var n = NTF(); return !!(n.desktop || n.email) && n[kind] !== false; }; }
every(60000, fetchTwitch, bg("live"));
every(120000, fetchNews, function () { return bg("news")() || bg("words")(); });
every(60000, fetchTG, bg("words"));
every(300000, fetchQuotes, bg("stock")); every(600000, fetchYT); every(300000, fetchMail, bg("mail")); every(300000, fetchReddit); every(60000, fetchSports, bg("sport")); every(300000, checkUpdate);
setInterval(tick, 1000);
