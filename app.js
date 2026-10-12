var VERSION = 141;

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
  var fav = t.classList.contains("bmfav");
  if (t.closest(".ic") || t.classList.contains("tl") || fav) { BADIMG[t.getAttribute("src")] = Date.now(); save("sp_badimg", BADIMG); }
  t.remove();
  if (fav) { renderBm(); renderBmSet(); }   // a site without an icon of its own gets the globe instead
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
    // (the Stocks colors also hold in the windows that belong to that box: market hours, its hover box and price alerts)
    var box = b[0], op = bcGet(box, "op"), sel = '#grid [data-id="' + box + '"]' + (box === "stocks" ? ", .mkwin, .mkpop, .pawin" : ""), out = "";
    var mix = function (hex) { return op < 100 ? "color-mix(in srgb," + hex + " " + op + "%,transparent)" : hex; };
    var vars = b[2].filter(function (c) { return c[0] !== "icon" && (bcGet(box, c[0]) || op < 100); }).map(function (c) { return "--" + c[0] + ":" + mix(bcGet(box, c[0]) || c[2]); });
    if (vars.length) out += sel + "{" + vars.join(";") + "}";
    // the sport icons each have their own color until you pick one for all of them
    if (box === "sports" && (bcGet(box, "icon") || op < 100)) out += '#grid [data-id="sports"] .spi{' + (bcGet(box, "icon") ? "color:" + bcGet(box, "icon") + ";" : "") + (op < 100 ? "opacity:" + op / 100 : "") + "}";
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
  // the "next in your calendar" line under the date: your own color, or the accent color
  var nc = /^#[0-9a-f]{6}$/i.test(P.nextCol || "") ? P.nextCol : "";
  if (nc) r.style.setProperty("--nextc", nc); else r.style.removeProperty("--nextc");
  $("cNext").value = nc || P.accent;
  applyClk();
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
// ---- The day, date and time at the top of the page, and the world clocks (Settings > Clock & alarms) ----
// P.clk holds only what you changed: day / date / year / time / loc / wd / sec (what is shown), fmt ("eu" | "us"),
// style ("long" | "short" | "num"), h ("" follows fmt, "24", "12"), font / size / col (the day name),
// wc (your cities: [{ n, tz }]), wcMode ("off" | "hover" | "line"), wcN (how many on the page).
var CK_FONTS = {
  logo: ["Montserrat · spaced capitals", '"Montserrat","Bricolage Grotesque",system-ui,sans-serif', 500, "uppercase", ".22em", 18],
  classic: ["Bricolage Grotesque · extra bold, large", "inherit", 800, "none", "-1px", 40],
  page: ["Bricolage Grotesque · semi-bold", "inherit", 600, "none", "0", 20],
  serif: ["Georgia · serif", 'Georgia,"Times New Roman",serif', 600, "none", "0", 22],
  mono: ["Monospace", 'ui-monospace,Consolas,"Courier New",monospace', 600, "none", "0", 20]
};
var CK_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function clk() {
  var c = P.clk && typeof P.clk === "object" ? P.clk : {};
  return { day: c.day !== false, date: c.date !== false, year: c.year !== false, time: c.time !== false, loc: c.loc !== false, wd: !!c.wd, sec: !!c.sec,
    fmt: c.fmt === "us" ? "us" : "eu", style: c.style === "num" || c.style === "short" ? c.style : "long", h: c.h === "12" || c.h === "24" ? c.h : "",
    font: CK_FONTS[c.font] ? c.font : "logo", size: +c.size >= 12 && +c.size <= 56 ? +c.size : 0, col: /^#[0-9a-f]{6}$/i.test(c.col || "") ? c.col : "",
    wc: (Array.isArray(c.wc) ? c.wc : []).filter(function (w) { return w && w.n && w.tz; }).slice(0, 5), wcMode: c.wcMode === "hover" || c.wcMode === "line" ? c.wcMode : "off", wcN: Math.min(5, Math.max(1, +c.wcN || 3)) };
}
var CK_DTF = {};
// the pieces of a moment in one time zone: weekday, day, month (name and number), year, hour, minute, second
function clkParts(d, tz) {
  var f = CK_DTF[tz];
  if (!f) {
    var opt = { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" };
    try { f = new Intl.DateTimeFormat("en-GB", Object.assign({ timeZone: tz }, opt)); } catch (e) { f = new Intl.DateTimeFormat("en-GB", opt); }   // an unknown zone: this computer's own
    CK_DTF[tz] = f;
  }
  var o = {};
  f.formatToParts(d).forEach(function (p) { o[p.type] = p.value; });
  return { wd: o.weekday || "", d: +o.day || 1, mon: o.month || "", m: CK_MONTHS.indexOf(o.month) + 1, y: +o.year || 0, H: (+o.hour || 0) % 24, M: o.minute || "00", S: o.second || "00" };
}
function clkP2(n) { return n < 10 ? "0" + n : "" + n; }
function clkTime(p, c, noSec) {
  var h12 = c.h ? c.h === "12" : c.fmt === "us", s = c.sec && !noSec ? ":" + p.S : "";
  return h12 ? (p.H % 12 || 12) + ":" + p.M + s + (p.H < 12 ? " AM" : " PM") : clkP2(p.H) + ":" + p.M + s;
}
function clkDate(p, c, wd, year) {
  var us = c.fmt === "us", s;
  if (c.style === "num") { var yy = clkP2(p.y % 100); s = us ? p.m + "/" + p.d + (year ? "/" + yy : "") : clkP2(p.d) + "." + clkP2(p.m) + (year ? "." + yy : ""); }
  else { var mo = c.style === "short" ? p.mon.slice(0, 3) : p.mon; s = us ? mo + " " + p.d + (year ? ", " + p.y : "") : p.d + " " + mo + (year ? " " + p.y : ""); }
  return wd ? (c.style === "long" ? p.wd : p.wd.slice(0, 3)) + (c.style === "num" ? " " : ", ") + s : s;
}
function clkLine(d, tz, loc, c) {
  var p = clkParts(d, tz), out = [];
  if (c.date) out.push(clkDate(p, c, c.wd, c.year)); else if (c.wd) out.push(c.style === "long" ? p.wd : p.wd.slice(0, 3));
  if (c.time) out.push(clkTime(p, c));
  if (c.loc && loc) out.push(loc);
  return out.join(" · ");
}
function setTxt(el, t) { if (el.textContent !== t) el.textContent = t; }
function tick() {
  var d = new Date(), c = clk(), line = clkLine(d, TZ, LOCNAME, c);
  setTxt($("day"), clkParts(d, TZ).wd); $("day").hidden = !c.day;
  setTxt($("date"), line); $("date").hidden = !line;
  renderWc(d, c);
  if ($("ckPrev") && !$("panel").hidden) ckPreview(d, c);
}
function applyClk() {
  var c = clk(), f = CK_FONTS[c.font], el = $("day"), s = el.style;
  s.fontFamily = f[1]; s.fontWeight = f[2]; s.textTransform = f[3]; s.letterSpacing = f[4];
  s.setProperty("--dayfs", (c.size || f[5]) + "px");
  if (c.col) s.setProperty("--dayc", c.col); else s.removeProperty("--dayc");
  el.classList.toggle("grad", c.font === "classic" && !c.col);   // the old look had its color fade into the accent color
}
// ---- World clocks ----
// one city at this moment: its time, its date, and how far ahead of or behind your own clock it is
function wcNow(d, w, c, here) {
  var p = clkParts(d, w.tz), mins = Math.round((Date.UTC(p.y, p.m - 1, p.d, p.H, +p.M) - Date.UTC(here.y, here.m - 1, here.d, here.H, +here.M)) / 60000);
  var dd = Math.round((Date.UTC(p.y, p.m - 1, p.d) - Date.UTC(here.y, here.m - 1, here.d)) / 86400000), ah = Math.abs(mins) / 60;
  return { n: w.n, t: clkTime(p, c, true), date: clkDate(p, Object.assign({}, c, { style: c.style === "num" ? "num" : "short" }), true, false), dd: dd,
    off: !mins ? "same time" : (mins > 0 ? "+" : "−") + (ah % 1 ? ah.toFixed(1) : ah) + " h" };
}
function renderWc(d, c) {
  var el = $("wclk"), here = clkParts(d, TZ), line = c.wcMode === "line" ? c.wc.slice(0, c.wcN) : [];
  el.hidden = !line.length;
  var h = line.map(function (w) { var x = wcNow(d, w, c, here); return "<span>" + esc(x.n) + " <b>" + x.t + "</b>" + (x.dd ? "<sup>" + (x.dd > 0 ? "+" : "−") + Math.abs(x.dd) + "</sup>" : "") + "</span>"; }).join("<i>·</i><wbr>");   // <wbr>: where the line may break on a narrow screen
  if (el.getAttribute("data-h") !== h) { el.innerHTML = h; el.setAttribute("data-h", h); }
  $("hdl").classList.toggle("haswc", c.wcMode === "hover" && c.wc.length > 0);
  if (!$("wcPop").hidden) { if (c.wcMode === "hover" && c.wc.length) wcPopFill(d, c); else $("wcPop").hidden = true; }
}
function wcPopFill(d, c) {
  var here = clkParts(d || new Date(), TZ);
  c = c || clk();
  var h = '<div class="wcr me"><span>' + esc(LOCNAME) + "</span><b>" + clkTime(here, c, true) + "</b><small>" + clkDate(here, Object.assign({}, c, { style: c.style === "num" ? "num" : "short" }), true, false) + "</small><small>here</small></div>" +
    c.wc.map(function (w) { var x = wcNow(d || new Date(), w, c, here); return '<div class="wcr"><span>' + esc(x.n) + "</span><b>" + x.t + "</b><small>" + x.date + "</small><small>" + x.off + "</small></div>"; }).join("");
  var pop = $("wcPop");
  if (pop.getAttribute("data-h") !== h) { pop.innerHTML = h; pop.setAttribute("data-h", h); }
}
function wcPopShow(on) {
  var c = clk(), pop = $("wcPop");
  if (!on || c.wcMode !== "hover" || !c.wc.length) { pop.hidden = true; return; }   // the box belongs to the "point at the date" choice only
  wcPopFill(new Date(), c);
  var under = !$("wclk").hidden ? $("wclk") : $("date").hidden ? $("day") : $("date");
  pop.style.top = (under.offsetTop + under.offsetHeight + 5) + "px";
  pop.hidden = false;
}
$("hdl").addEventListener("mouseover", function (e) { if (e.target.closest("#date,#wclk,#day,#wcPop")) wcPopShow(true); });
$("hdl").addEventListener("mouseleave", function () { wcPopShow(false); });
// on a phone there is no pointing: a tap on the date opens the box, a tap anywhere else closes it
document.addEventListener("click", function (e) {
  var on = e.target.closest && e.target.closest("#date,#wclk,#day");
  if (on && $("wcPop").hidden) wcPopShow(true); else if (!e.target.closest || !e.target.closest("#wcPop")) wcPopShow(false);
});
// ---- Settings > Clock & alarms ----
var WCRES = [];
function ckPreview(d, c) {
  var p = clkParts(d, TZ), f = CK_FONTS[c.font], line = clkLine(d, TZ, LOCNAME, c);
  var h = (c.day ? '<div class="ckd" style="font-family:' + esc(f[1]) + ";font-weight:" + f[2] + ";text-transform:" + f[3] + ";letter-spacing:" + f[4] + ";font-size:" + Math.min(c.size || f[5], 30) + "px" + (c.col ? ";color:" + c.col : "") + '">' + esc(p.wd) + "</div>" : "") +
    (line ? '<div class="mut">' + esc(line) + "</div>" : "") + (!c.day && !line ? '<div class="mut">Nothing is ticked, so nothing is shown.</div>' : "");
  var el = $("ckPrev");
  if (el.getAttribute("data-h") !== h) { el.innerHTML = h; el.setAttribute("data-h", h); }
}
function renderClkSet() {
  if (!$("ckFmt")) return;
  var c = clk(), d = new Date(), p = clkParts(d, TZ), ex = function (o) { var x = Object.assign({}, c, o); return clkDate(p, x, false, true) + ", " + clkTime(p, x, true); };
  $("ckDay").checked = c.day; $("ckDate").checked = c.date; $("ckYear").checked = c.year; $("ckTime").checked = c.time; $("ckLoc").checked = c.loc; $("ckWd").checked = c.wd; $("ckSec").checked = c.sec;
  var opts = function (id, list, cur) { $(id).innerHTML = list.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === cur ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join(""); };
  opts("ckFmt", [["eu", "Europe: " + ex({ fmt: "eu", h: "" })], ["us", "United States: " + ex({ fmt: "us", h: "" })]], c.fmt);
  opts("ckStyle", [["long", "Month in full: " + clkDate(p, Object.assign({}, c, { style: "long" }), false, true)], ["short", "Short month: " + clkDate(p, Object.assign({}, c, { style: "short" }), false, true)], ["num", "Numbers only: " + clkDate(p, Object.assign({}, c, { style: "num" }), false, true)]], c.style);
  $("ckH").value = c.h;
  opts("ckFont", Object.keys(CK_FONTS).map(function (k) { return [k, CK_FONTS[k][0]]; }), c.font);
  $("ckSize").value = c.size || CK_FONTS[c.font][5];
  $("ckCol").value = c.col || cols().fg;
  $("ckWcMode").value = c.wcMode; $("ckWcN").value = String(c.wcN); $("ckWcNRow").hidden = c.wcMode !== "line";
  $("wcList").innerHTML = c.wc.length ? c.wc.map(function (w, i) {
    return '<div class="row"><span><b>' + esc(w.n) + '</b> <small class="mut">' + clkTime(clkParts(d, w.tz), c, true) + " · " + esc(String(w.tz).replace(/_/g, " ")) + '</small></span><span class="r"><button data-a="wcmv" data-k="' + i + '|-1" title="Move up" aria-label="Move up">▲</button><button data-a="wcmv" data-k="' + i + '|1" title="Move down" aria-label="Move down">▼</button><button data-a="wcdel" data-k="' + i + '" title="Remove" aria-label="Remove">✕</button></span></div>';
  }).join("") : '<div class="mut sn">No cities yet. Search for one above.</div>';
  ckPreview(d, c);
}
function clkSave(k, v) {
  if (!P.clk || typeof P.clk !== "object") P.clk = {};
  if (v === undefined) delete P.clk[k]; else P.clk[k] = v;
  persist(); applyClk(); tick(); renderClkSet(); positionClocks();
}
function clkAct(a, k) {
  var c = clk(), wc = c.wc.slice(), p = String(k || "").split("|");
  if (a === "ckreset") { clkSave(k === "col" ? "col" : "size", undefined); return; }
  if (a === "wcgo") {
    var q = $("wcIn").value.trim();
    if (!q) return;
    $("wcRes").innerHTML = '<p class="mut sn">Searching…</p>';
    fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(q) + "&count=6&language=en&format=json").then(function (r) { return r.json(); }).then(function (j) {
      WCRES = (j.results || []).filter(function (x) { return x.timezone; }).map(function (x) { return { n: String(x.name).slice(0, 40), tz: String(x.timezone).slice(0, 60), label: [x.admin1, x.country].filter(Boolean).join(", ") }; });
      $("wcRes").innerHTML = WCRES.length ? WCRES.map(function (x, i) { return '<div class="row"><span>' + esc(x.n) + ' <small class="mut">' + esc(x.label) + '</small></span><button data-a="wcadd" data-k="' + i + '">Add</button></div>'; }).join("") : '<p class="mut sn">No city found.</p>';
    }).catch(function () { $("wcRes").innerHTML = '<p class="mut sn">The search did not work. Try again.</p>'; });
    return;
  }
  if (a === "wcadd") {
    var x = WCRES[+k];
    if (!x) return;
    if (wc.length >= 5) { $("wcRes").innerHTML = '<p class="mut sn">You already have 5 cities. Remove one first.</p>'; return; }
    if (!wc.some(function (w) { return w.n === x.n && w.tz === x.tz; })) wc.push({ n: x.n, tz: x.tz });
    $("wcRes").innerHTML = ""; $("wcIn").value = ""; WCRES = [];
    if (c.wcMode === "off") { if (!P.clk || typeof P.clk !== "object") P.clk = {}; P.clk.wcMode = "hover"; }   // adding the first city switches them on
    clkSave("wc", wc); return;
  }
  if (a === "wcdel") { wc.splice(+k, 1); clkSave("wc", wc); return; }
  if (a === "wcmv") { var i = +p[0], j = i + (+p[1] || 0); if (j < 0 || j >= wc.length) return; var it = wc.splice(i, 1)[0]; wc.splice(j, 0, it); clkSave("wc", wc); return; }
}
document.addEventListener("change", function (e) {
  var t = e.target, map = { ckDay: "day", ckDate: "date", ckYear: "year", ckTime: "time", ckLoc: "loc", ckWd: "wd", ckSec: "sec" };
  if (!t || !t.id || t.id.indexOf("ck") !== 0) return;
  if (map[t.id]) clkSave(map[t.id], t.checked);
  else if (t.id === "ckFmt") clkSave("fmt", t.value);
  else if (t.id === "ckStyle") clkSave("style", t.value);
  else if (t.id === "ckH") clkSave("h", t.value);
  else if (t.id === "ckFont") { if (P.clk) delete P.clk.size; clkSave("font", t.value); }   // each font starts at its own natural size
  else if (t.id === "ckCol") clkSave("col", t.value);
  else if (t.id === "ckWcMode") clkSave("wcMode", t.value);
  else if (t.id === "ckWcN") clkSave("wcN", +t.value);
});
document.addEventListener("input", function (e) { if (e.target && e.target.id === "ckSize") { if (!P.clk || typeof P.clk !== "object") P.clk = {}; P.clk.size = +e.target.value; persist(); applyClk(); ckPreview(new Date(), clk()); positionClocks(); } });
document.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target && e.target.id === "wcIn") { e.preventDefault(); clkAct("wcgo"); } });

// ---- Rows with favorite / hide controls in edit mode ----
function row(key, main, sub, right, op, cls, attr) {
  var f = P.fav[key];
  var ed = EDIT ? '<button data-a="fav" data-k="' + esc(key) + '" aria-label="Favorite">' + (f ? "★" : "☆") + '</button><button data-a="hide" data-k="' + esc(key) + '" aria-label="Hide">✕</button>' : "";
  // The favorite star normally leads the row. With " favr" in cls it sits on the right instead (before the number),
  // so starred and unstarred rows start at the same place.
  var starR = !!cls && cls.indexOf(" favr") >= 0, star = f ? '<i class="fv">★</i>' : "";
  if (starR) right = star + right;
  // Read later: news, Telegram, Reddit and videos. A saved row keeps a small mark; with the mouse on the row a button
  // takes the place of the time (it lies over it, so the row needs no extra room).
  if (typeof op === "string" && /^[amrv]:/.test(op) && !EDIT) {
    var sv = isLater(op);
    right = (sv ? '<i class="rlm" title="Saved to read later">' + laterSvg(true) + "</i>" : "") + right +
      '<button class="rl' + (sv ? " on" : "") + '" data-a="later" data-k="' + esc(op) + '" title="' + (sv ? "Saved. Click to remove it from Read later" : "Read later") + '" aria-label="' + (sv ? "Remove from Read later" : "Read later") + '">' + laterSvg(sv) + "</button>";
  }
  return '<div class="row' + (cls || "") + '"' + (attr || "") + '><span>' + (starR ? "" : star) + (op ? '<button class="lnk" data-a="open" data-k="' + esc(typeof op === "string" ? op : key) + '">' + main + "</button>" : main) + (sub ? " <small>" + esc(sub) + "</small>" : "") +
    '</span><span class="r">' + right + ed + "</span></div>";
}
function shown(key) { return !P.hidden[key]; }
function favFirst(a, b) { return (P.fav[b.key] ? 1 : 0) - (P.fav[a.key] ? 1 : 0); }
function card(cls, title, body) { return '<div class="card ' + cls + '"><h3>' + title + "</h3>" + body + "</div>"; }

// embed1-3 are the web page boxes: off until you give one an address (Settings > Web page boxes)
var EMB_IDS = ["embed1", "embed2", "embed3"];
var ALL_IDS = ["weather", "mail", "live", "menu", "news", "telegram", "twitch", "youtube", "stocks", "reddit", "sports", "tv"].concat(EMB_IDS);
var DEF_C = { weather: 3, mail: 3, live: 4, menu: 2, news: 6, telegram: 6, twitch: 4, youtube: 4, stocks: 4, reddit: 6, sports: 6, tv: 4, embed1: 6, embed2: 6, embed3: 6 };
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
var LISTS = ["news", "telegram", "twitch", "youtube", "stocks", "reddit", "sports", "tv"];
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
  else if (isEmb(id)) { L.rows = L.rows || {}; L.rows[id] = Math.max(4, Math.min(30, (L.rows[id] || 10) + d * 2)); }
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
// ---- Problems in a box: a small "!" among the box's buttons, only while something is wrong. A click opens a window
// that says what failed, why, since when, and what you can do. The box itself keeps showing what it has.
var ERRSINCE = {};
function boxErrs(id) {
  var out = [], add = function (what, why, fix) { out.push({ what: what, why: why || "", fix: fix || "" }); };
  var later = "This usually clears by itself at the next refresh. The ↻ button tries again now.";
  if (PREVIEW) return out;
  if (id === "news") {
    NERRK.forEach(function (name) {
      var why = String(NWHY[name] || "no reason given");
      add("The source “" + name + "” delivered no headlines", errPlain(why),
        "The other sources are not affected. If it stays like this for hours, the feed address may have changed: remove the source in Settings and add it again with its current feed address.");
    });
    if (NERR && !NERRK.length) add("The news could not be loaded", errPlain(NERR), later);
  }
  if (id === "telegram" && NERR && !NERRK.length && !TGP.length) add("The Telegram posts could not be loaded", errPlain(NERR), later);
  if (id === "stocks" && QERR) add("The prices could not be loaded", errPlain(QERR), "The list shows the last prices it had. " + later);
  if (id === "youtube") {
    if (YTERR) add("The videos could not be loaded", errPlain(YTERR), later);
    else if (YTDOWN) add("YouTube's upload feed is not answering", "YouTube's own feed service returned nothing for most of your channels. This is on YouTube's side.", "The box shows the last videos it loaded. It comes back by itself when YouTube's feed does.");
  }
  if (id === "reddit" && RDERR) add("Reddit could not be loaded", errPlain(RDERR), (RD.length ? "The box shows the last posts it had. " : "") + "Reddit limits how often it can be asked; it usually works again within a few minutes.");
  if (id === "sports" && SPERR) add("The scores could not be loaded", errPlain(SPERR), later);
  var now = Date.now(), seen = {};
  out.forEach(function (e) { var k = id + "|" + e.what; seen[k] = 1; e.since = ERRSINCE[k] = ERRSINCE[k] || now; });
  Object.keys(ERRSINCE).forEach(function (k) { if (k.indexOf(id + "|") === 0 && !seen[k]) delete ERRSINCE[k]; });   // gone again: forget when it started
  return out;
}
// the short technical reason, with the usual ones put into plain words
function errPlain(why) {
  why = String(why || "").trim();
  var hint = /\b40[136]\b/.test(why) ? "The site refused the request." : /\b429\b|rate limit/i.test(why) ? "The site says it is being asked too often." : /\b50\d\b/.test(why) ? "The site itself is having trouble." :
    /timed out|timeout/i.test(why) ? "The site took too long to answer." : /unreachable|failed to fetch|network/i.test(why) ? "The site could not be reached." : /0 items/.test(why) ? "The site answered, but with no headlines in it." :
    /non-2xx|edge function|functions?\b.*(error|fail)/i.test(why) ? "Your Supabase function did not answer properly." : "";
  return (hint ? hint + " " : "") + "(Technical: " + why.slice(0, 400) + ")";
}
function openBoxErr(id) {
  var list = boxErrs(id);
  openModal("Problem in " + (BOX_NAMES[id] || id), list.length ? list.map(function (e) {
    return '<div class="berr"><b>' + esc(e.what) + "</b><p>" + esc(e.why) + '</p><p class="mut sn">Since ' + esc(when(e.since)) + (Date.now() - e.since > 90000 ? " (" + ago(e.since) + " ago)" : "") + ". " + esc(e.fix) + "</p></div>";
  }).join("") + '<p class="tools"><button data-a="refresh" data-k="' + id + '">↻ Try again now</button>' + (id === "news" || id === "telegram" || id === "reddit" ? '<button data-a="setgo" data-k="News">Open the sources in Settings</button>' : "") + "</p>"
    : '<p class="mut">Everything in this box is working again.</p>');
}
// opens Settings on the section whose name starts with the given word
function openSettingsAt(name) {
  var ix = -1;
  Array.prototype.forEach.call(document.querySelectorAll("#panel .setgrp"), function (g, n) { if (ix < 0 && g.dataset.sec.indexOf(name) === 0) ix = n; });
  closeModal(); $("panel").hidden = false;
  renderNfLog(); renderBmSet(); renderClkSet(); renderIcsSet(); renderEmbSet(); renderTvSet();
  if (ix >= 0) setSec(ix);
}
function tile(id, title, body, click, hx) {
  var c = LAY().c[id] || DEF_C[id] || 3, t = "", at = "", cp = COMPACT.indexOf(id) >= 0;
  if (click) {
    var pr = typeof click === "string" ? click.split(":") : ["weather"];
    at = ' data-a="' + pr[0] + '"' + (pr[1] != null ? ' data-k="' + pr[1] + '"' : "") + ' tabindex="0" role="button"';
  }
  if (EDIT) {
    var bt = function (act, d, glyph, ttl, cls) { return '<button data-a="' + act + '" data-k="' + id + ":" + d + '" title="' + ttl + '" aria-label="' + ttl + '"' + (cls ? ' class="' + cls + '"' : "") + ">" + glyph + "</button>"; };
    var noW = id === "live" || id === "menu";
    // on a phone the boxes sit in one column: the arrows point up and down there, and the width buttons are left out (style.css)
    var arw = function (a, b) { return '<span class="ad">' + a + '</span><span class="ap">' + b + "</span>"; };
    t = '<div class="tools">' + bt("mv", -1, arw("◀", "▲"), "Move earlier") + bt("mv", 1, arw("▶", "▼"), "Move later") +
      (noW ? "" : bt("w", -1, "W−", "Narrower", "wbt") + bt("w", 1, "W+", "Wider", "wbt")) +
      (isEmb(id) ? "" : bt("f", -1, "T−", "Smaller text") + bt("f", 1, "T+", "Larger text")) +
      (LISTS.indexOf(id) >= 0 ? bt("h", -1, "H−", "Shorter list") + bt("h", 1, "H+", "Taller list") : isEmb(id) ? bt("h", -1, "H−", "Lower box") + bt("h", 1, "H+", "Taller box") : "") +
      (id === "menu" ? "" : '<button data-a="boxoff" data-k="' + id + '" title="Hide this whole box. Bring it back in Settings, Layout.">Hide</button>') + "</div>";
  }
  var h3 = "<h3" + (EDIT ? ' class="grab" draggable="true" title="Drag to move"' : "") + ">" + title + "</h3>";
  var rb = REFRESH[id] ? '<button class="ib sm rf" data-a="refresh" data-k="' + id + '" title="Reload this box" aria-label="Reload ' + id + '">' + (boxBusy(id) ? '<span class="spin">↻</span>' : "↻") + "</button>" : "";
  var errs = cp ? [] : boxErrs(id), eb = errs.length ? '<button class="ib sm errb" data-a="boxerr" data-k="' + id + '" title="' + esc(errs.length > 1 ? errs.length + " problems. Click for the details." : errs[0].what + ". Click for the details.") + '" aria-label="Problem in this box">!</button>' : "";
  var head = cp ? (EDIT ? '<span class="grab dh" draggable="true" title="Drag to move">⠿</span>' : "") : '<div class="th">' + h3 + (hx || rb || eb ? '<div class="hc">' + eb + (hx || "") + rb + "</div>" : "") + "</div>";
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
  if (NEWS.length) {
    var nowN = Date.now();
    NG = newsGroups();
    // A story (one or several sources merged into a row) is new only while you have seen and opened NONE of its
    // articles. Another source reporting a story that is already in your list does not mark it as new again.
    var gNew = function (g) { return g.every(function (x) { return isNewItem(x, "news") && !isRead(x.u); }); };
    nNew = NG.filter(gNew).length;
    var vis = newsShown(), lastB = "", nNote = foundNote("news");
    nb = (NFILT || NQ ? '<input type="search" id="newsQ" class="flt" placeholder="Search headlines…" aria-label="Search headlines">' : "") + (vis.length || nNote ? lst("news", vis.slice(0, cntOf("news")).map(function (g) {
      // n = the story's latest headline; t0 = when it was first reported, which is where it stays in the list
      var n = g[0], srcs = g.src || g.map(function (x) { return x.s; }), t0 = g.t0 || n.ts, b = g.fav ? "★ Favorite sources" : bucket(t0);
      // The time label sits on the divider line above the first headline of each period, so it takes no extra row
      var bk = b !== lastB ? ' data-b="' + b + '"' : ""; lastB = b;
      var hot = srcs.length >= 3 && nowN - n.ts < 10800000, nw = gNew(g), rd = !nw && g.some(function (x) { return isRead(x.u); });
      var cls = (nw ? " new" : "") + (rd ? " rd" : "") + (g.hi ? " hi" : "") + (bk ? " bk" : "");
      return row("n:" + n.s, esc(n.t), P.hideSrc ? "" : srcs.join(" · "), (hot ? '<span class="pill hot" title="Many sources in the last 3 hours">hot</span>' : "") + (srcs.length > 1 ? '<span class="pill ac" title="' + esc(srcs.join(", ")) + '">' + srcs.length + "</span>" : "") + '<span class="mut">' + ago(t0) + "</span>", "a:" + n.u, cls, bk);   // the time is always the last thing on the row
    }).join("") + (vis.length > cntOf("news") ? moreBtn("news", "Show 20 more") : "") + nNote, 6) : '<div class="empty">' + (NQ ? "No headline matches that search." : "All news sources hidden or muted. Use Sources to bring one back.") + "</div>");
  } else {
    nb = lst("news", D.news.map(function (x) {
      return '<div class="row"><span>' + esc(x.t) + '</span><span class="pill ' + (x.n > 3 ? "ac" : "") + '">×' + x.n + "</span></div>";
    }).join(""), 6) + '<div class="empty">' + (NERR ? "The news could not be loaded. Press ! above for the details." : "Sample headlines. Sign in to load your sources.") + "</div>";
  }
  // the button pops in only when it appears or its number goes up, not on every redraw of the page
  var newBtn = function (n, box) { var pop = n > (NEWPN[box] || 0); NEWPN[box] = n; return n ? '<button class="pill ac' + (pop ? " newp" : "") + '" data-a="nseen" data-k="' + box + '" title="Mark everything in this box as seen">' + n + '<span class="nwl"> new</span></button>' : ""; };
  var ctlN = allSrc.length > 1 ? '<div class="dd"><button data-a="filtmenu" data-k="news" class="ib sm">Sources</button><div class="menu" id="filtNews" hidden>' +
    allSrc.map(function (nm) { return '<label><input type="checkbox" data-a="filttoggle" data-k="n:' + esc(nm) + '"' + (shown("n:" + nm) ? " checked" : "") + "> " + esc(nm) + "</label>"; }).join("") + "</div></div>" : "";
  var fltBtn = NEWS.length ? '<button class="ib sm' + (NFILT || NQ ? " on" : "") + '" data-a="nfilt" title="Search headlines" aria-label="Search headlines">⌕</button>' : "";
  T.news = tile("news", "News", nb, 0, newBtn(nNew, "news") + (NEWS.length ? rdrBtn("news") : "") + fltBtn + ctlN);

  var allTg = tgSrc(), tmute = wordList(NW().mute), thi = wordList(NW().hi);
  var tp = TGP.filter(function (g) { return shown("g:" + g.s) && !(tmute.length && hasWord(g.tx || g.t, tmute)); });
  var tgMulti = allTg.filter(function (nm) { return shown("g:" + nm); }).length > 1;
  var tNew = tp.filter(function (g) { return isNewItem(g, "tg") && !isRead(g.u); }).length;
  var ctlG = allTg.length > 1 ? '<div class="dd"><button data-a="filtmenu" data-k="tg" class="ib sm">Sources</button><div class="menu" id="filttg" hidden>' +
    allTg.map(function (nm) { return '<label><input type="checkbox" data-a="filttoggle" data-k="g:' + esc(nm) + '"' + (shown("g:" + nm) ? " checked" : "") + "> " + esc(nm) + "</label>"; }).join("") + "</div></div>" : "";
  var tq = tgShown(), tNote = foundNote("tg"), tIn = FON.tg || FQ.tg ? '<input type="search" id="tgQ" class="flt" placeholder="Search posts…" aria-label="Search the Telegram posts">' : "";
  T.telegram = tile("telegram", "Telegram", tIn + (tq.length || tNote ? lst("telegram", tq.slice(0, cntOf("tg")).map(function (g) {
    var cls = (isNewItem(g, "tg") && !isRead(g.u) ? " new" : "") + (isRead(g.u) ? " rd" : "") + (thi.length && hasWord(g.tx || g.t, thi) ? " hi" : "");
    // Two full lines of the post, cut by the browser where the space ends; the channel name is shown inline, and only when there are several
    return row("g:" + g.s, '<span class="clamp">' + (tgMulti ? "<small>" + esc(g.s) + "</small> " : "") + esc(String(g.t).slice(0, 400)) + "</span>", "", '<span class="mut">' + ago(g.ts) + "</span>", "m:" + g.u, cls + " tg");
  }).join("") + (FQ.tg ? (tq.length > cntOf("tg") ? moreBtn("tg", "Show 20 more") : "") + tNote : PREVIEW ? "" : tgOldBusy ? '<div class="more mut">Loading older posts…</div>' : tp.length > cntOf("tg") ? moreBtn("tg", "Show 20 more") : tgCanOlder() ? moreBtn("tg", "Load 20 older posts") : ""), 6) : '<div class="empty">' + (FQ.tg ? "No post matches that search." : NERR ? "The posts could not be loaded. Press ! above for the details." : "Sign in to load your Telegram channels (Clash Report).") + "</div>"), 0, newBtn(tNew, "tg") + (tp.length ? rdrBtn("tg") + fBtn("tg") : "") + ctlG);

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
  }).join("") + offRows) : '<div class="empty">Nobody you follow is live.' + (TWC ? ' <button class="lnk2" data-a="twdopen">Discover streams</button>' : "") + "</div>") +
    (TWC || !window.TWITCH_CLIENT_ID ? "" : '<button data-a="twConnect">Connect Twitch to show your real follows</button>'), 0, twdBtn() + ctlT);

  var yb;
  if ((P.yt && P.yt.ch && P.yt.ch.length) || PREVIEW) {
    var now = Date.now();
    var vids = YTV.map(function (v) { return { id: v.id, t: v.t, n: v.n, ts: v.ts, key: "y:" + v.n, isNew: now - v.ts < 172800000 }; })
      .filter(function (v) { return shown(v.key) && now - v.ts < 2592000000; })
      .sort(function (a, b) { return b.ts - a.ts; });
    var per = {};
    vids = vids.filter(function (v) { per[v.n] = (per[v.n] || 0) + 1; return per[v.n] <= 2; });
    vids.sort(function (a, b) { return ((P.fav[b.key] && b.isNew) ? 1 : 0) - ((P.fav[a.key] && a.isNew) ? 1 : 0) || b.ts - a.ts; });
    yb = (vids.length ? lst("youtube", vids.map(function (v) {
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
  var rq = rdShown(), rNote = foundNote("rd");
  var rNew = RS === "new" ? rp.filter(function (x) { return isNewItem(x, "rd") && !isRead(x.u); }).length : 0;
  var ctlR = '<select data-s="rdsort" aria-label="Sort posts">' + opts(RD_SORTS.map(function (s) { return [s, s.charAt(0).toUpperCase() + s.slice(1)]; }), RS) + "</select>" +
    (rSubs.length > 1 ? '<div class="dd"><button data-a="filtmenu" data-k="rd" class="ib sm">Sources</button><div class="menu" id="filtRd" hidden>' +
      rSubs.map(function (nm) { return '<label><input type="checkbox" data-a="filttoggle" data-k="r:' + esc(nm.toLowerCase()) + '"' + (shown("r:" + nm.toLowerCase()) ? " checked" : "") + "> r/" + esc(nm) + "</label>"; }).join("") + "</div></div>" : "");
  T.reddit = tile("reddit", "Reddit", (RDERR && !rp.length ? '<div class="empty">Reddit could not be loaded. Press ! above for the details.</div>' : "") + (FON.rd || FQ.rd ? '<input type="search" id="rdQ" class="flt" placeholder="Search posts…" aria-label="Search the Reddit posts">' : "") + (rq.length || rNote ? lst("reddit", rq.slice(0, 60).map(function (x) {
    var cls = (RS === "new" && isNewItem(x, "rd") && !isRead(x.u) ? " new" : "") + (isRead(x.u) ? " rd" : "");
    return row("r:" + x.s.toLowerCase(), esc(x.t), P.hideSrc ? "" : "r/" + x.s, '<span class="mut">' + ago(x.ts) + "</span>", "r:" + x.u, cls);
  }).join("") + rNote, 6) : RDERR && !FQ.rd ? "" : '<div class="empty">' + (FQ.rd ? "No post matches that search." : !rSubs.length ? "No subreddits. Add some in Settings." : USER ? "Loading Reddit…" : "Sign in to load Reddit.") + "</div>"), 0, newBtn(rNew, "rd") + (rp.length ? rdrBtn("rd") + fBtn("rd") : "") + ctlR);

  T.sports = tile("sports", "Sports", sportsBody(), 0, '<select data-s="spsport" aria-label="Sport">' + opts(spSports(), spSport()) + '</select><select data-s="spview" aria-label="Which games">' + opts(spViews(), spView()) + '</select><button class="ib sm' + (SPFIND || SPQ ? " on" : "") + '" data-a="spfilt" title="Search the sports box" aria-label="Search the sports box">⌕</button>');

  var SL = P.stocks || D.stocks;
  var st = SL.map(function (x) { var q = QUOTES[tk(x.id)]; return { id: x.id, name: x.name, c: q ? q.c : (QLOADED ? null : x.c), p: q ? q.p : null, logo: q ? q.logo : "", key: "s:" + x.id }; }).filter(function (x) { return shown(x.key); })
    .sort(function (x, y) {
      var SS = (P.sort && P.sort.stocks) || "move", a = x.c, b = y.c;
      if (favFirst(x, y)) return favFirst(x, y);
      if (SS === "name") return x.id.localeCompare(y.id);
      if (a == null || b == null) return (a == null ? 1 : 0) - (b == null ? 1 : 0);
      return SS === "up" ? b - a : SS === "down" ? a - b : Math.abs(b) - Math.abs(a);
    });
  var ctlS = '<select data-s="sort:stocks" aria-label="Sort stocks">' + opts([["move", "Biggest mover"], ["up", "Most up"], ["down", "Most down"], ["name", "Name"]], (P.sort && P.sort.stocks) || "move") + "</select>" + mkBtn() + paBtn();
  var IC = 'viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  T.menu = tile("menu", "", '<div class="mrow menurow">' +
    '<div class="dd"><button data-a="clockmenu2" class="ib" aria-label="Timer, countdown, stopwatch" aria-haspopup="menu" aria-expanded="' + (MENU_OPEN === "clock") + '"><svg ' + IC + '><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></button>' +
      (MENU_OPEN === "clock" ? '<div class="menu" role="menu"><button role="menuitem" data-a="clockmenu" data-k="t">Timer</button><button role="menuitem" data-a="clockmenu" data-k="c">Countdown</button><button role="menuitem" data-a="clockmenu" data-k="s">Stopwatch</button></div>' : "") + "</div>" +
    '<button data-a="opennotes" class="ib" aria-label="Notes"><svg ' + IC + '><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>' + (openTodos() ? "<span>" + openTodos() + "</span>" : "") + "</button>" +
    '<button data-a="opencal" class="ib" aria-label="Calendar" title="Calendar"><svg ' + IC + '><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/></svg>' + (evsOn(ymd(new Date())).length ? "<span>" + evsOn(ymd(new Date())).length + "</span>" : "") + "</button>" +
    '<div class="dd"><button data-a="bellmenu" class="ib" aria-label="Notifications" title="Notifications" aria-haspopup="menu" aria-expanded="' + (MENU_OPEN === "bell") + '"><svg ' + IC + '><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7 2.5 7h-17S6 15 6 9zM10 20a2 2 0 0 0 4 0"/></svg>' + (missed() ? "<span>" + missed() + "</span>" : "") + "</button>" +
      (MENU_OPEN === "bell" ? bellHtml() : "") + "</div>" +
    '<div class="dd"><button data-a="cogmenu2" class="ib' + (EDIT ? " on" : "") + '" aria-label="Edit and settings" aria-haspopup="menu" aria-expanded="' + (MENU_OPEN === "cog") + '"><svg ' + IC + '><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>' +
      (MENU_OPEN === "cog" ? '<div class="menu" role="menu"><button role="menuitem" data-a="editmode">' + (EDIT ? "Done" : "Edit") + '</button><button role="menuitem" data-a="openbrief">Summary</button><button role="menuitem" data-a="setpanel">Settings</button><button role="menuitem" data-a="openfb">Feedback</button><button role="menuitem" data-a="openhelp">Help</button></div>' : "") + "</div>" +
    '<div class="dd"><button data-a="acctmenu2" class="ib" aria-label="Account" aria-haspopup="menu" aria-expanded="' + (MENU_OPEN === "acct") + '" title="' + (USER ? esc(USER.email) : "Account") + '"><svg ' + IC + '><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg></button>' +
      (MENU_OPEN === "acct" ? acctHtml() : "") + "</div>" +
    "</div>");
  T.stocks = tile("stocks", "Stocks", (st.length ? lst("stocks", st.map(function (x) {
    var c = x.c, up = c >= 0, pts = PREVIEW ? sparkFake(x.id, c) : SPARK[tk(x.id)];
    // the day chart takes its color from today's change (the number next to it); a week or month chart from its own direction
    var rise = pts && pts.length > 1 ? pts[pts.length - 1] >= pts[0] : up;
    var spk = sparkOn() ? sparkSvg(pts, SPARKR === "d" && c != null && !PREVIEW ? up : rise) : "";
    return row(x.key, ico(x.id, x.logo) + "<b" + (x.name ? ' title="' + esc(x.name) + '"' : "") + ">" + esc(x.id) + "</b>", (x.p != null ? x.p.toFixed(2) : x.name), spk + (c == null ? '<span class="mut" title="No free price data for this one. Click it for the chart.">n/a</span>' : '<span class="' + (up ? "up" : "down") + '">' + (up ? "▲ +" : "▼ ") + c.toFixed(1) + "%</span>"), 1);
  }).join("")) : '<div class="empty">No stocks. Restore them in Settings.</div>'), 0, ctlS);

  EMB_IDS.forEach(function (id) { T[id] = embOn(id) ? embTile(id) : ""; });
  T.tv = boxOff("tv") ? "" : tvTile();
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
  // Redrawing must never move the page (it matters on a phone, where the page is long): remember the box at the top of
  // the screen and exactly where it sits, keep the grid's height while its content is swapped (otherwise the page is
  // for a moment too short to stay scrolled, and jumps to the top), and afterwards put that box back where it was.
  var grid0 = $("grid"), sy0 = window.scrollY || 0, anchor = null;
  if (sy0 > 0) Array.prototype.some.call(grid0.children, function (k, i) {
    var r = k.getBoundingClientRect();
    if (r.bottom <= 0) return false;
    anchor = { id: k.dataset.id || "", i: i, top: r.top };
    return true;
  });
  grid0.style.minHeight = grid0.offsetHeight + "px";
  // an open Sources list stays open (and scrolled where it was) through a redraw, so several sources can be ticked in one go
  var openFilt = {};
  ["filtNews", "filtRd", "filttg"].forEach(function (id) { var m = $(id); if (m && !m.hidden) openFilt[id] = m.scrollTop; });
  $("grid").querySelectorAll(".list[data-list]").forEach(function (n) { scrolls[n.dataset.list] = n.scrollTop; });
  fltNote();
  $("grid").querySelectorAll("input[id]").forEach(function (n) { if (n.type !== "checkbox") typed[n.id] = n.value; });
  if (actId) { try { sel = [act.selectionStart, act.selectionEnd]; } catch (e) {} }
  $("grid").innerHTML = orderIds().map(function (id) { return id !== "live" && boxOff(id) ? "" : T[id] || ""; }).join("");
  $("grid").querySelectorAll(".list[data-list]").forEach(function (n) { if (scrolls[n.dataset.list]) n.scrollTop = scrolls[n.dataset.list]; });
  Object.keys(typed).forEach(function (id) { var n = $(id); if (n && n.value !== typed[id]) n.value = typed[id]; });
  if (actId) { var fn = $(actId); if (fn) { try { fn.focus({ preventScroll: true }); if (sel && sel[0] != null) fn.setSelectionRange(sel[0], sel[1]); } catch (e) {} } }
  renderHidden();
  renderBm();
  renderNextUp();
  refreshBrief();
  $("pv").hidden = !PREVIEW;
  if (!$("peek").hidden) hidePeek();   // the row it pointed at has just been redrawn
  fltFit();
  packGrid();
  placeEmbeds();
  rdrSync();
  siteSync();
  Object.keys(openFilt).forEach(function (id) { var m = $(id); if (m) { m.hidden = false; m.scrollTop = openFilt[id]; } });
  grid0.style.minHeight = "";
  if (sy0 > 0) {
    var ael = anchor ? (anchor.id ? grid0.querySelector('[data-id="' + anchor.id + '"]') : null) || grid0.children[anchor.i] : null;
    var dy = ael ? ael.getBoundingClientRect().top - anchor.top : sy0 - (window.scrollY || 0);
    if (Math.abs(dy) >= 1) window.scrollBy({ top: dy, left: 0, behavior: "instant" });
  }
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

// ---- Bookmarks: import from the file a browser exports (Chrome, Edge, Brave, Firefox, Safari and Opera all write the same kind) ----
// The file is read here in the browser. Its folders are listed with tick boxes; nothing is added before you press Import.
var BMIMP = null;
function bmParseFile(text) {
  var doc = new DOMParser().parseFromString(String(text).slice(0, 6000000), "text/html"), out = [], loose = { n: "Not in a folder", path: "", bar: false, links: [] };
  var kids = function (el, tag) { return Array.prototype.filter.call(el.children, function (c) { return c.tagName === tag; }); };
  var walk = function (dl, path, into) {
    var dts = kids(dl, "DT");
    kids(dl, "P").forEach(function (p) { dts = dts.concat(kids(p, "DT")); });
    dts.forEach(function (dt) {
      var a = kids(dt, "A")[0], h = kids(dt, "H3")[0];
      if (a) {
        var u = safeUrl(a.getAttribute("href"));
        if (u && into.links.length < 500) into.links.push({ t: (a.textContent || "").trim().slice(0, 40), u: u.slice(0, 500) });
      } else if (h) {
        var name = (h.textContent || "").trim().slice(0, 40) || "Folder", sub = kids(dt, "DL")[0] || (dt.nextElementSibling && dt.nextElementSibling.tagName === "DL" ? dt.nextElementSibling : null);
        var f = { n: name, path: path, bar: h.hasAttribute("personal_toolbar_folder"), links: [] };
        out.push(f);
        if (sub && out.length < 300) walk(sub, (path ? path + " › " : "") + name, f);
      }
    });
  };
  var top = doc.querySelector("dl");
  if (!top) return null;
  walk(top, "", loose);
  if (loose.links.length) out.unshift(loose);
  return out.filter(function (f) { return f.links.length; });
}
function bmImpDraw() {
  var el = $("bmImp");
  if (!el) return;
  if (!BMIMP) { el.innerHTML = ""; return; }
  el.innerHTML = '<div class="stimp"><b>Found ' + BMIMP.reduce(function (n, f) { return n + f.links.length; }, 0) + " bookmarks in " + BMIMP.length + (BMIMP.length === 1 ? " folder" : " folders") + '</b><span class="mut sn"> Tick the folders you want. Bookmarks you already have are skipped.</span><div class="bmimpl">' +
    BMIMP.map(function (f, i) {
      return '<div class="bmimpr"><label><input type="checkbox" data-bmi="' + i + '"' + (f.on ? " checked" : "") + '> <span class="bnm">' + esc(f.n) + '</span> <small class="mut">' + (f.path ? esc(f.path) + " · " : "") + f.links.length + (f.links.length === 1 ? " link" : " links") + "</small></label>" +
        '<select data-bmis="' + i + '" aria-label="How to add ' + esc(f.n) + '"><option value="f"' + (f.as === "f" ? " selected" : "") + '>As a folder</option><option value="l"' + (f.as === "l" ? " selected" : "") + ">As links on the bar</option></select></div>";
    }).join("") + '</div><div class="tools"><button class="pri" data-a="bmimpgo">Import the ticked ones</button><button data-a="bmimpno">Cancel</button></div></div>';
}
function bmImpMsg(t) { if ($("bmImpMsg")) $("bmImpMsg").textContent = t || ""; }
function bmImpRead(text) {
  var fs = bmParseFile(text);
  BMIMP = null;
  if (!fs) { bmImpDraw(); bmImpMsg("That is not a bookmarks file. In your browser, use “Export bookmarks” and choose the .html file it saves."); return; }
  if (!fs.length) { bmImpDraw(); bmImpMsg("No bookmarks found in that file."); return; }
  // ticked from the start: the browser's own bookmarks bar (its loose links go straight onto the bar) and the folders on it
  var bar = fs.filter(function (f) { return f.bar; })[0];
  fs.forEach(function (f) { f.on = bar ? f === bar || f.path === bar.n : fs.length <= 3; f.as = f === bar || f.path === "" && f.n === "Not in a folder" ? "l" : "f"; });
  BMIMP = fs; bmImpMsg(""); bmImpDraw();
}
function bmImpGo() {
  if (!BMIMP) return;
  var B = bm(), have = {}, added = 0, skipped = 0, cut = 0;
  B.items.forEach(function (x) { if (x.u) have[x.u] = 1; (x.kids || []).forEach(function (k) { have[k.u] = 1; }); });
  Array.prototype.forEach.call(document.querySelectorAll("#bmImp [data-bmi]"), function (b) {
    var f = BMIMP[+b.dataset.bmi], sel = document.querySelector('#bmImp [data-bmis="' + b.dataset.bmi + '"]'), asLinks = sel && sel.value === "l";
    if (!b.checked || !f) return;
    var fresh = f.links.filter(function (l) { if (have[l.u]) { skipped++; return false; } have[l.u] = 1; return true; });
    var max = asLinks ? 30 : 60;
    if (fresh.length > max) { cut += fresh.length - max; fresh = fresh.slice(0, max); }
    if (!fresh.length) return;
    var items = fresh.map(function (l, n) { return { id: bmId() + n.toString(36), t: l.t || bmHost(l.u), u: l.u }; });
    if (asLinks) B.items = B.items.concat(items); else B.items.push({ id: bmId() + "f", t: f.n, kids: items });
    added += items.length;
  });
  BMIMP = null; bmImpDraw();
  if (added && !B.on) B.on = true;
  bmImpMsg(added ? "Imported " + added + " bookmark" + (added === 1 ? "" : "s") + "." + (skipped ? " " + skipped + " you already had were skipped." : "") + (cut ? " " + cut + " were left out: a folder holds 60 links at most, the bar 30 per import." : "") : skipped ? "Nothing new: you already have all of those." : "Nothing was ticked.");
  if (added) bmChanged();
}
document.addEventListener("change", function (e) {
  if (e.target.id !== "bmFile" || !e.target.files[0]) return;
  var f = e.target.files[0], fr = new FileReader();
  e.target.value = "";
  if (f.size > 20000000) { bmImpMsg("That file is too large."); return; }
  fr.onload = function () { bmImpRead(String(fr.result || "")); };
  fr.onerror = function () { bmImpMsg("Could not read that file."); };
  fr.readAsText(f);
});

// ---- Calendars from elsewhere: an .ics file copied in once, or a calendar address that is read again every half hour ----
function icsLines(text) { return String(text).replace(/\r\n?/g, "\n").replace(/\n[ \t]/g, "").split("\n"); }
function icsTxt(v) { return String(v).replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1").replace(/\s+/g, " ").trim(); }
// a clock time in a named time zone -> the moment it means
function icsZoned(y, mo, d, h, mi, tz) {
  var guess = Date.UTC(y, mo - 1, d, h, mi);
  try {
    var f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    var at = function (ms) { var p = {}; f.formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = +x.value; }); return Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute); };
    var t = guess - (at(guess) - guess);
    return new Date(guess - (at(t) - t));   // the second pass settles the hours around a clock change
  } catch (e) { return new Date(y, mo - 1, d, h, mi); }   // a zone name this browser does not know: taken as your own time
}
// DTSTART and friends -> { ds: "2026-10-12", tm: "14:00" } in this device's time; a date without a time is an all-day event
function icsWhen(val, prm) {
  var m = /^(\d{4})(\d\d)(\d\d)(?:T(\d\d)(\d\d)(\d\d)?(Z)?)?/.exec(String(val).trim());
  if (!m) return null;
  var y = +m[1], mo = +m[2], d = +m[3];
  if (!m[4]) return { ds: m[1] + "-" + m[2] + "-" + m[3], tm: "" };
  var dt = m[7] ? new Date(Date.UTC(y, mo - 1, d, +m[4], +m[5])) : prm && prm.TZID ? icsZoned(y, mo, d, +m[4], +m[5], prm.TZID) : new Date(y, mo - 1, d, +m[4], +m[5]);
  return isNaN(dt) ? null : { ds: ymd(dt), tm: pad2(dt.getHours()) + ":" + pad2(dt.getMinutes()) };
}
function dsAdd(ds, days) { var d = new Date(ds + "T12:00:00"); d.setDate(d.getDate() + days); return ymd(d); }
var ICS_DAYS = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
// Returns { name, ev: [{ t, d, tm, rep, iv, u, x }] }: `rep` as the calendar's own repeats (d w m y), `iv` every how many,
// `u` the last day it repeats, `x` days it skips. One-time events older than 30 days and repeats that have ended are left out.
function icsParse(text) {
  var name = "", raw = [], cur = null, deep = 0;
  if (!/BEGIN:VCALENDAR/i.test(String(text).slice(0, 3000))) return null;
  icsLines(text).forEach(function (ln) {
    var c = ln.indexOf(":");
    if (c < 0) return;
    var parts = ln.slice(0, c).split(";"), key = parts[0].toUpperCase(), val = ln.slice(c + 1), prm = {};
    parts.slice(1).forEach(function (p) { var i = p.indexOf("="); if (i > 0) prm[p.slice(0, i).toUpperCase()] = p.slice(i + 1).replace(/^"|"$/g, ""); });
    if (key === "BEGIN") { if (val.toUpperCase() === "VEVENT" && !cur) { cur = { x: [] }; deep = 0; } else if (cur) deep++; return; }
    if (key === "END") {
      if (cur && deep) { deep--; return; }
      if (cur && val.toUpperCase() === "VEVENT") { if (raw.length < 4000) raw.push(cur); cur = null; }
      return;
    }
    if (!cur) { if (key === "X-WR-CALNAME") name = icsTxt(val).slice(0, 40); return; }
    if (deep) return;
    if (key === "SUMMARY") cur.t = icsTxt(val).slice(0, 120);
    else if (key === "DTSTART") cur.s = icsWhen(val, prm);
    else if (key === "DTEND") cur.e = icsWhen(val, prm);
    else if (key === "RRULE") cur.rr = val;
    else if (key === "UID") cur.uid = val.trim();
    else if (key === "STATUS") cur.st = val.trim().toUpperCase();
    else if (key === "RECURRENCE-ID") cur.rid = icsWhen(val, prm);
    else if (key === "EXDATE") val.split(",").forEach(function (v) { var w = icsWhen(v, prm); if (w && cur.x.length < 60) cur.x.push(w.ds); });
  });
  var today = ymd(new Date()), old = dsAdd(today, -30), out = [], master = {};
  raw.forEach(function (r) { if (r.uid && r.rr && !r.rid) master[r.uid] = r; });
  // an occurrence that was moved or changed comes as its own event: the series skips that day
  raw.forEach(function (r) { if (r.rid && r.uid && master[r.uid] && master[r.uid].x.length < 60) master[r.uid].x.push(r.rid.ds); });
  raw.forEach(function (r) {
    if (!r.s || r.st === "CANCELLED") return;
    var t = r.t || "(no title)", base = { t: t, d: r.s.ds };
    if (r.s.tm) base.tm = r.s.tm;
    // several days: shown on the first day, with the last day in the name (an all-day event ends the day after its last day)
    if (r.e) { var last = r.s.tm ? r.e.ds : dsAdd(r.e.ds, -1); if (last > r.s.ds) base.t = (t + " (until " + dayLabel(last) + ")").slice(0, 120); }
    if (!r.rr || r.rid) { if (base.d >= old) out.push(base); return; }
    var rule = {};
    r.rr.split(";").forEach(function (p) { var i = p.indexOf("="); if (i > 0) rule[p.slice(0, i).toUpperCase()] = p.slice(i + 1).toUpperCase(); });
    var rep = { DAILY: "d", WEEKLY: "w", MONTHLY: "m", YEARLY: "y" }[rule.FREQ], iv = Math.max(1, Math.min(99, +rule.INTERVAL || 1)), days = (rule.BYDAY || "").split(",").filter(Boolean);
    if (!rep) { if (base.d >= old) out.push(base); return; }
    var until = "", uw = rule.UNTIL ? icsWhen(rule.UNTIL) : null, cnt = +rule.COUNT || 0;
    if (uw) until = uw.ds;
    else if (cnt) {
      // "N times": worked out as a last day (close enough for a rule with several weekdays)
      var per = rep === "w" && days.length > 1 ? Math.ceil(cnt / days.length) : cnt, n = (per - 1) * iv, a = new Date(base.d + "T12:00:00");
      if (rep === "d") a.setDate(a.getDate() + n); else if (rep === "w") a.setDate(a.getDate() + n * 7 + 6); else if (rep === "m") a.setMonth(a.getMonth() + n); else a.setFullYear(a.getFullYear() + n);
      until = ymd(a);
    }
    if (until && until < old) return;
    var x = r.x.length ? r.x.slice(0, 60) : null, make = function (d) { var e = { t: base.t, d: d, rep: rep }; if (base.tm) e.tm = base.tm; if (iv > 1) e.iv = iv; if (until) e.u = until; if (x) e.x = x; return e; };
    // "the second Tuesday of the month" and the like: not something this calendar can repeat, so the next eight are written out
    if (rep === "m" && days.length && /^-?\d/.test(days[0])) {
      var nth = parseInt(days[0], 10), wd = ICS_DAYS[days[0].replace(/^[-+]?\d+/, "")], st = new Date(base.d + "T12:00:00"), now = new Date();
      if (wd == null) { out.push(make(base.d)); return; }
      for (var k = 0, made = 0; k < 14 && made < 8; k++) {
        var M = Math.max(st.getFullYear() * 12 + st.getMonth(), now.getFullYear() * 12 + now.getMonth() - 1) + k;
        var Y = Math.floor(M / 12), Mo = M % 12, dim = new Date(Y, Mo + 1, 0).getDate(), hits = [];
        for (var dd = 1; dd <= dim; dd++) if (new Date(Y, Mo, dd).getDay() === wd) hits.push(dd);
        var pick = nth > 0 ? hits[nth - 1] : hits[hits.length + nth];
        if (!pick) continue;
        var ds = Y + "-" + pad2(Mo + 1) + "-" + pad2(pick);
        if (ds < base.d || (until && ds > until) || (x && x.indexOf(ds) >= 0) || ((M - (st.getFullYear() * 12 + st.getMonth())) % iv)) continue;
        var one = { t: base.t, d: ds }; if (base.tm) one.tm = base.tm;
        out.push(one); made++;
      }
      return;
    }
    // weekly on several weekdays: one repeating event per weekday, each starting in the week the series starts
    if (rep === "w" && days.length) {
      var s0 = new Date(base.d + "T12:00:00"), mon = (s0.getDay() + 6) % 7, done = {};
      days.forEach(function (dn) {
        var w = ICS_DAYS[dn.replace(/^[-+]?\d+/, "")];
        if (w == null || done[w]) return;
        done[w] = 1;
        var off = (w + 6) % 7 - mon, d2 = dsAdd(base.d, off < 0 ? off + 7 * iv : off);
        out.push(make(d2));
      });
      if (!Object.keys(done).length) out.push(make(base.d));
      return;
    }
    out.push(make(base.d));
  });
  return { name: name, ev: out.slice(0, 600) };
}
// ---- an .ics file: its events are copied into your own calendar (after a look at what was found) ----
var ICSIMP = null;
function icsMsg(t) { if ($("icsMsg")) $("icsMsg").textContent = t || ""; }
function icsImpDraw() {
  var el = $("icsImp");
  if (!el) return;
  if (!ICSIMP) { el.innerHTML = ""; return; }
  var rep = ICSIMP.ev.filter(function (e) { return e.rep; }).length, room = Math.max(0, 300 - (P.cal || []).length), n = Math.min(ICSIMP.ev.length, room);
  el.innerHTML = '<div class="stimp"><b>Found ' + ICSIMP.ev.length + " event" + (ICSIMP.ev.length === 1 ? "" : "s") + (ICSIMP.name ? " in " + esc(ICSIMP.name) : "") + '</b><span class="mut sn"> ' + (rep ? rep + " of them repeat. " : "") + "One-time events older than a month are left out." + (ICSIMP.dup ? " " + ICSIMP.dup + " you already have were skipped." : "") + "</span>" +
    '<div class="stimpl icsl">' + ICSIMP.ev.slice(0, 12).map(function (e) { return '<label><span class="bnm">' + esc(dayLabel(e.d)) + "</span> <small class=\"mut\">" + esc((e.tm ? e.tm + " " : "") + e.t) + (e.rep ? " ↻" : "") + "</small></label>"; }).join("") + (ICSIMP.ev.length > 12 ? '<label><small class="mut">…and ' + (ICSIMP.ev.length - 12) + " more</small></label>" : "") + "</div>" +
    (n < ICSIMP.ev.length ? '<p class="mut sn">The calendar holds 300 events of your own; there is room for ' + n + " of these (the nearest ones are taken first).</p>" : "") +
    '<div class="tools">' + (n ? '<button class="pri" data-a="icsimpgo">Add ' + n + " to my calendar</button>" : "") + '<button data-a="icsimpno">Cancel</button></div></div>';
}
function icsImpRead(text) {
  var p = icsParse(text);
  ICSIMP = null;
  if (!p) { icsImpDraw(); icsMsg("That is not a calendar file. Export the calendar as .ics (iCalendar) and choose that file."); return; }
  var have = {}, dup = 0;
  (P.cal || []).forEach(function (e) { have[e.t + "|" + e.d + "|" + (e.tm || "")] = 1; });
  var ev = p.ev.filter(function (e) { var k = e.t + "|" + e.d + "|" + (e.tm || ""); if (have[k]) { dup++; return false; } have[k] = 1; return true; });
  if (!ev.length) { icsImpDraw(); icsMsg(dup ? "Nothing new: you already have all " + dup + " events of that file." : "No current events found in that file."); return; }
  // repeating ones first, then the nearest dates: if there is not room for all, the far future is what is left out
  ev.sort(function (a, b) { return (a.rep ? 0 : 1) - (b.rep ? 0 : 1) || a.d.localeCompare(b.d); });
  ICSIMP = { name: p.name, ev: ev, dup: dup }; icsMsg(""); icsImpDraw();
}
function icsImpGo() {
  if (!ICSIMP) return;
  P.cal = P.cal || [];
  var room = Math.max(0, 300 - P.cal.length), take = ICSIMP.ev.slice(0, room), stamp = Date.now().toString(36);
  take.forEach(function (e, i) { var o = { id: "e" + stamp + i.toString(36), t: e.t, d: e.d }; ["tm", "rep", "iv", "u", "x"].forEach(function (k) { if (e[k] != null) o[k] = e[k]; }); P.cal.push(o); });
  ICSIMP = null; icsImpDraw();
  icsMsg("Added " + take.length + " event" + (take.length === 1 ? "" : "s") + " to your calendar.");
  persist(); render(); refreshCalAny();
}
function refreshCalAny() { if (sideOf("cal") || (!$("modal").hidden && $("mTitle").textContent === WIDGETS.cal.t)) { if (!(document.activeElement && document.activeElement.closest && document.activeElement.closest("#calAdd"))) openCal(); } }
document.addEventListener("change", function (e) {
  if (e.target.id !== "icsFile" || !e.target.files[0]) return;
  var f = e.target.files[0], fr = new FileReader();
  e.target.value = "";
  if (f.size > 5000000) { icsMsg("That file is too large (5 MB at most)."); return; }
  fr.onload = function () { icsImpRead(String(fr.result || "")); };
  fr.onerror = function () { icsMsg("Could not read that file."); };
  fr.readAsText(f);
});
// ---- a calendar address: P.ics = [{ id, n, u, rem }]. The events are kept on this device only and read again every 30 minutes ----
var ICSC = load("sp_icsc", {}), icsBusy = {}, ICSERR = {}, icsMemoKey = "", icsMemo = [];
function icsSubs() { return Array.isArray(P.ics) ? P.ics.filter(function (s) { return s && s.id && safeUrl(s.u); }).slice(0, 4) : []; }
// every subscribed event, ready for the calendar: read-only, with the calendar's name and (if you chose one) its reminder
function icsEvs() {
  var subs = icsSubs(), key = subs.map(function (s) { return s.id + ":" + ((ICSC[s.id] || {}).t || 0) + ":" + (s.rem == null ? "" : s.rem) + ":" + (s.n || ""); }).join("|");
  if (key === icsMemoKey) return icsMemo;
  var out = [];
  subs.forEach(function (s) {
    ((ICSC[s.id] || {}).ev || []).forEach(function (e) {
      var o = { id: "ic:" + s.id + ":" + hs(e.t + e.d + (e.tm || "")), t: e.t, d: e.d, ro: 1, cn: s.n || "Calendar" };
      ["tm", "rep", "iv", "u", "x"].forEach(function (k) { if (e[k] != null) o[k] = e[k]; });
      if (s.rem != null && s.rem !== "") o.rem = +s.rem;
      out.push(o);
    });
  });
  icsMemoKey = key; icsMemo = out;
  return out;
}
function fetchIcs(force) {
  if (!sb || !USER) return;
  icsSubs().forEach(function (s) {
    var c = ICSC[s.id];
    if (icsBusy[s.id] || (!force && c && Date.now() - c.t < 1800000)) return;
    icsBusy[s.id] = 1;
    sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { ics: s.u } }).then(function (r) {
      delete icsBusy[s.id];
      var d = r.data && r.data.ics, p = d && typeof d.text === "string" ? icsParse(d.text) : null;
      if (!p) { ICSERR[s.id] = (d && d.err) || (d ? "That address did not give a calendar." : "Calendar addresses need the newest server function."); if (ICSC[s.id]) ICSC[s.id].t = Date.now() - 1500000; renderIcsSet(); return; }   // try again in five minutes
      delete ICSERR[s.id];
      ICSC[s.id] = { t: Date.now(), ev: p.ev };
      if (!s.n && p.name) { s.n = p.name; persist(); }
      save("sp_icsc", ICSC);
      render(); renderIcsSet(); refreshCalAny();
    }).catch(function () { delete icsBusy[s.id]; ICSERR[s.id] = "Could not reach the server."; renderIcsSet(); });
  });
}
setInterval(function () { if (!document.hidden) fetchIcs(); }, 300000);
function renderIcsSet() {
  var el = $("icsList");
  if (!el) return;
  var subs = icsSubs();
  el.innerHTML = subs.map(function (s) {
    var c = ICSC[s.id], st = ICSERR[s.id] ? '<span class="down">' + esc(ICSERR[s.id]) + "</span>" : icsBusy[s.id] && !c ? "Reading…" : c ? c.ev.length + " event" + (c.ev.length === 1 ? "" : "s") + " · read " + ago(c.t) + " ago" : USER ? "Not read yet" : "Sign in to read it";
    return '<div class="icsrow"><input type="text" data-ics="n" data-id="' + esc(s.id) + '" value="' + esc(s.n || "") + '" placeholder="Name" aria-label="Name of this calendar" maxlength="40">' +
      '<select data-ics="rem" data-id="' + esc(s.id) + '" aria-label="Reminder for its events" title="Reminder for its events">' + opts(REMS, s.rem == null ? "" : String(s.rem)) + "</select>" +
      '<button data-a="icsreload" data-k="' + esc(s.id) + '" title="Read it again now" aria-label="Read it again now">↻</button><button data-a="icsdel" data-k="' + esc(s.id) + '" title="Stop following this calendar" aria-label="Remove">✕</button>' +
      '<span class="mut sn icsst">' + st + "</span></div>";
  }).join("");
}
function icsAct(a, k) {
  if (a === "icsimpgo") { icsImpGo(); return; }
  if (a === "icsimpno") { ICSIMP = null; icsImpDraw(); icsMsg(""); return; }
  if (a === "icsreload") { delete ICSERR[k]; fetchIcs(true); renderIcsSet(); return; }
  if (a === "icsdel") {
    P.ics = icsSubs().filter(function (s) { return s.id !== k; });
    delete ICSC[k]; delete ICSERR[k]; save("sp_icsc", ICSC);
    persist(); render(); renderIcsSet(); refreshCalAny();
  }
}
document.addEventListener("submit", function (e) {
  if (e.target.id !== "icsAdd") return;
  e.preventDefault();
  var u = $("icsUrl").value.trim().replace(/^webcals?:\/\//i, "https://");
  if (!/^https:\/\/\S+$/i.test(u)) { icsMsg("Paste the address of the calendar. It starts with https:// or webcal:// and usually ends in .ics."); return; }
  if (!sb || !USER) { icsMsg("Sign in first: a calendar address is read through your account. An .ics file can be imported without one."); return; }
  var subs = icsSubs();
  if (subs.some(function (s) { return s.u === u; })) { icsMsg("You already follow that calendar."); return; }
  if (subs.length >= 4) { icsMsg("Four calendars at most. Remove one first."); return; }
  subs.push({ id: "c" + Date.now().toString(36), n: "", u: u.slice(0, 1000) });
  P.ics = subs; $("icsUrl").value = ""; icsMsg("");
  persist(); renderIcsSet(); fetchIcs(true);
});
document.addEventListener("change", function (e) {
  var t = e.target;
  if (!t || !t.dataset || !t.dataset.ics) return;
  var s = icsSubs().filter(function (x) { return x.id === t.dataset.id; })[0];
  if (!s) return;
  if (t.dataset.ics === "n") s.n = t.value.trim().slice(0, 40);
  else if (t.dataset.ics === "rem") { if (t.value === "") delete s.rem; else { s.rem = +t.value; if (NTF().desktop) askNotify(); } }
  P.ics = icsSubs(); persist(); render(); refreshCalAny();
});

// ---- Web page boxes: any web page shown inside a box (Settings > Web page boxes; all three are off until you fill one in) ----
// The page itself lives in a layer on top of the grid, exactly over its box. The grid is rebuilt on every redraw, and a
// page that sat inside it would be thrown away and loaded again each time; this way it loads once and only moves.
function isEmb(id) { return EMB_IDS.indexOf(id) >= 0; }
function emb(id) { var E = P.emb && typeof P.emb === "object" ? P.emb : {}; return E[id] && typeof E[id] === "object" ? E[id] : {}; }
function embUrl(id) { var u = safeUrl(emb(id).u); return /^https:\/\//i.test(u) ? u : ""; }
function embOn(id) { return !!emb(id).on && !!embUrl(id); }
function embName(id) { return emb(id).t || bmHost(embUrl(id)) || "Web page"; }
function embH(id) { return Math.round(((LAY().rows || {})[id] || 10) * 32.4); }
function embTile(id) {
  var u = embUrl(id);
  return tile(id, esc(embName(id)), '<div class="embph" data-emb="' + id + '" style="height:' + embH(id) + 'px"></div>', 0,
    '<a class="ib sm" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer" title="Open this page in its own tab" aria-label="Open this page in its own tab"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5H5v14h14v-4M13 5h6v6M19 5l-8 8"/></svg></a>');
}
// puts each page exactly over its box (or removes it when its box is off)
function placeEmbeds() {
  var layer = $("embeds"), wrap = $("gridw");
  if (!layer || !wrap) return;
  var wr = wrap.getBoundingClientRect();
  EMB_IDS.forEach(function (id) {
    var ph = document.querySelector('#grid .embph[data-emb="' + id + '"]'), fr = layer.querySelector('iframe[data-emb="' + id + '"]'), u = embUrl(id);
    if (!ph || !u) { if (fr) fr.remove(); return; }
    if (!fr) {
      fr = document.createElement("iframe");
      fr.setAttribute("data-emb", id);
      // the page can run and open links in new tabs, but it cannot take over this tab or see anything of OmniTree
      fr.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox");
      fr.setAttribute("referrerpolicy", "no-referrer");
      fr.setAttribute("loading", "lazy");
      fr.setAttribute("allow", "fullscreen");
      layer.appendChild(fr);
    }
    fr.title = embName(id);
    if (fr.getAttribute("data-u") !== u) { fr.setAttribute("data-u", u); fr.src = u; fr.setAttribute("data-t", String(Date.now())); }
    var r = ph.getBoundingClientRect();
    fr.style.left = (r.left - wr.left).toFixed(2) + "px"; fr.style.top = (r.top - wr.top).toFixed(2) + "px";
    fr.style.width = r.width.toFixed(2) + "px"; fr.style.height = r.height.toFixed(2) + "px";
    fr.classList.toggle("edit", !!EDIT);   // while editing, the page lets clicks and drags through to the box
  });
}
function embReload(id) { var fr = $("embeds") && $("embeds").querySelector('iframe[data-emb="' + id + '"]'); if (fr && embUrl(id)) { fr.src = embUrl(id); fr.setAttribute("data-t", String(Date.now())); } }
EMB_IDS.forEach(function (id) { REFRESH[id] = function () { embReload(id); }; });
// "Reload every ...": only while the tab is in view
setInterval(function () {
  if (document.hidden) return;
  EMB_IDS.forEach(function (id) {
    var min = +emb(id).r || 0, fr = $("embeds") && $("embeds").querySelector('iframe[data-emb="' + id + '"]');
    if (min && fr && Date.now() - (+fr.getAttribute("data-t") || 0) > min * 60000) embReload(id);
  });
}, 30000);
if (window.ResizeObserver && $("grid")) new ResizeObserver(function () { placeEmbeds(); }).observe($("grid"));
var EMBMSG = {};
function renderEmbSet() {
  var el = $("embSet");
  if (!el) return;
  el.innerHTML = EMB_IDS.map(function (id, i) {
    var e = emb(id), m = EMBMSG[id];
    return '<div class="sub embrow"><b>Web page ' + (i + 1) + '</b><label>Show this box <input type="checkbox" data-emb="on" data-id="' + id + '"' + (embOn(id) ? " checked" : "") + "></label>" +
      '<div class="add"><input type="text" data-emb="u" data-id="' + id + '" value="' + esc(e.u || "") + '" placeholder="Address of the page, e.g. https://example.com/page" aria-label="Address of the page" maxlength="600" autocomplete="off"><input type="text" class="embn" data-emb="t" data-id="' + id + '" value="' + esc(e.t || "") + '" placeholder="Name (optional)" aria-label="Name of the box" maxlength="30" autocomplete="off"></div>' +
      '<label>Reload the page by itself <select data-emb="r" data-id="' + id + '">' + opts([["0", "Never"], ["1", "Every minute"], ["5", "Every 5 minutes"], ["15", "Every 15 minutes"], ["60", "Every hour"]], String(+e.r || 0)) + "</select></label>" +
      (m ? '<div class="sn ' + (m.ok === false ? "down" : m.ok ? "up" : "mut") + '" role="status">' + esc(m.t) + "</div>" : "") + "</div>";
  }).join("");
}
// asks the server whether the site lets other pages show it (most large sites do not); the answer is only advice
function embCheck(id) {
  var u = embUrl(id);
  if (!u) return;
  var note = "If the box stays empty, that site does not allow being shown inside other pages.";
  if (!sb || !USER) { EMBMSG[id] = { t: note }; renderEmbSet(); return; }
  EMBMSG[id] = { t: "Checking whether " + bmHost(u) + " can be shown in a box…" }; renderEmbSet();
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { frameok: u } }).then(function (r) {
    if (embUrl(id) !== u) return;
    var d = r.data && r.data.frameok;
    EMBMSG[id] = !d ? { t: note } : d.ok ? { ok: true, t: "✓ " + bmHost(u) + " can be shown in a box." }
      : d.why === "err" ? { t: "Could not reach " + bmHost(u) + " to check it. " + note }
      : { ok: false, t: "✗ " + bmHost(u) + " does not allow other sites to show it in a box, so this box will stay empty. Most large sites do this. Many have a special “embed” or “share” address that does work; look for Share → Embed on that site." };
    renderEmbSet();
  }).catch(function () { EMBMSG[id] = { t: note }; renderEmbSet(); });
}
document.addEventListener("change", function (e) {
  var t = e.target;
  if (!t || !t.dataset || !t.dataset.emb || !t.dataset.id || !isEmb(t.dataset.id)) return;
  var id = t.dataset.id, k = t.dataset.emb;
  P.emb = P.emb && typeof P.emb === "object" ? P.emb : {};
  var E = P.emb[id] = Object.assign({}, emb(id));
  if (k === "u") {
    var raw = t.value.trim(), u = raw ? bmUrl(raw.replace(/^http:\/\//i, "https://")) : "", host = bmHost(u);
    if (raw && (!u || !/^https:\/\//i.test(u) || !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(host))) { EMBMSG[id] = { ok: false, t: "That is not a web address. It should look like https://example.com/page." }; renderEmbSet(); return; }
    if (u && (host === location.hostname.replace(/^www\./, "") || /(^|\.)omnitr\.ee$/.test(host))) { EMBMSG[id] = { ok: false, t: "OmniTree cannot be shown inside itself." }; renderEmbSet(); return; }
    E.u = u.slice(0, 600);
    if (u) { E.on = true; delete EMBMSG[id]; } else { delete E.on; delete EMBMSG[id]; }
    persist(); render(); renderEmbSet();
    if (u) embCheck(id);
    return;
  }
  if (k === "on") { if (t.checked && !embUrl(id)) { EMBMSG[id] = { t: "Type the address of the page first." }; renderEmbSet(); return; } E.on = t.checked; }
  else if (k === "t") E.t = t.value.trim().slice(0, 30);
  else if (k === "r") E.r = +t.value || 0;
  persist(); render(); renderEmbSet();
});

// ---- TV shows: new episodes of the shows you follow, and what is on today (data from TVmaze, read straight from the browser) ----
// P.tv = { on, shows: [{ id, n }], view, cc }. The box is off until you switch it on (Settings > Layout & boxes, or TV shows).
// Per followed show one small request every six hours (its next and its latest episode), kept on this device in between.
var TVAPI = "https://api.tvmaze.com/", TVC = load("sp_tvc", {}), TVSCH = { t: 0, key: "", ev: [] }, TVQ = "", TVFIND = false, TVRES = null, TVRESQ = "", tvBusy = 0, TVERR = "", TVSHOW = {};
var TV_VIEWS = [["mine", "My shows: coming up"], ["recent", "My shows: just aired"], ["today", "On today"]];
var TV_CC = [["US", "United States"], ["GB", "United Kingdom"], ["SE", "Sweden"], ["NO", "Norway"], ["DK", "Denmark"], ["FI", "Finland"], ["DE", "Germany"], ["NL", "Netherlands"], ["FR", "France"], ["ES", "Spain"], ["IT", "Italy"], ["CA", "Canada"], ["AU", "Australia"], ["JP", "Japan"], ["KR", "South Korea"]];
function tvp() { if (!P.tv || typeof P.tv !== "object") P.tv = {}; if (!Array.isArray(P.tv.shows)) P.tv.shows = []; return P.tv; }
function tvShows() { return (P.tv && Array.isArray(P.tv.shows) ? P.tv.shows : []).filter(function (s) { return s && /^\d{1,9}$/.test(String(s.id)); }).slice(0, 60); }
function tvHas(id) { return tvShows().some(function (s) { return String(s.id) === String(id); }); }
function tvView() { var v = P.tv && P.tv.view; return TV_VIEWS.some(function (o) { return o[0] === v; }) ? v : "mine"; }
function tvCc() { var c = P.tv && P.tv.cc; return TV_CC.some(function (o) { return o[0] === c; }) ? c : "US"; }
function tvGet(path) { return fetch(TVAPI + path).then(function (r) { if (!r.ok) throw new Error("TVmaze answered " + r.status); return r.json(); }); }
function tvEp(e) { return e && e.airstamp ? { s: +e.season || 0, e: +e.number || 0, n: String(e.name || "").slice(0, 80), ts: Date.parse(e.airstamp) } : null; }
function tvNet(s) { return String((s.network && s.network.name) || (s.webChannel && s.webChannel.name) || "").slice(0, 40); }
function tvImg(s) { return safeUrl(((s.image || {}).medium || "").replace(/^http:/, "https:")); }
function tvCode(e) { return e && e.s >= 1900 ? (e.e ? "Ep " + e.e : "") : e && e.s ? "S" + pad2(e.s) + (e.e ? "E" + pad2(e.e) : "") : e && e.e ? "Ep " + e.e : ""; }
function fetchTv(force) {
  if (boxOff("tv")) return;
  var now = Date.now(), todo = tvShows().filter(function (s) { var c = TVC[s.id]; return force || !c || now - c.t > 21600000 || (c.next && c.next.ts < now && now - c.t > 1800000); });   // also when its next episode has aired: what comes after it?
  // four at a time, so a long list stays well inside what the service allows
  var next = function () {
    var s = todo.shift();
    if (!s) { if (!--tvBusy) { save("sp_tvc", TVC); render(); } return; }
    tvGet("shows/" + s.id + "?embed[]=nextepisode&embed[]=previousepisode").then(function (j) {
      var em = j._embedded || {};
      TVC[s.id] = { t: Date.now(), n: String(j.name || s.n || "").slice(0, 80), img: tvImg(j), net: tvNet(j), st: String(j.status || ""), next: tvEp(em.nextepisode), prev: tvEp(em.previousepisode) };
      TVERR = "";
    }).catch(function (e) { TVERR = String((e && e.message) || e); if (TVC[s.id]) TVC[s.id].t = Date.now() - 20700000; }).then(next);   // a failed one is tried again in five minutes
  };
  if (todo.length && !tvBusy) { for (var i = 0; i < 4; i++) { tvBusy++; next(); } }
  if (tvView() === "today" || force) fetchTvToday(force);
}
// "On today": everything that airs today in the chosen country, on television and on streaming services
function fetchTvToday(force) {
  var day = new Date().toLocaleDateString("en-CA", { timeZone: TZ }), key = tvCc() + day;
  if (!force && TVSCH.key === key && Date.now() - TVSCH.t < 3600000) return;
  TVSCH.key = key; TVSCH.t = Date.now();
  var one = function (path) { return tvGet(path).catch(function () { return []; }); };
  Promise.all([one("schedule?country=" + tvCc() + "&date=" + day), one("schedule/web?country=" + tvCc() + "&date=" + day)]).then(function (r) {
    if (TVSCH.key !== key) return;
    var seen = {}, ev = [];
    r[0].concat(r[1]).forEach(function (e) {
      var s = e.show || (e._embedded && e._embedded.show), ep = tvEp(e);
      if (!s || !ep || seen[s.id + ":" + ep.s + ":" + ep.e]) return;
      seen[s.id + ":" + ep.s + ":" + ep.e] = 1;
      // daily programmes (news, talk and game shows, soaps numbered by the year) would bury everything else; yours are always kept
      if ((/^(News|Talk Show|Game Show|Sports)$/.test(String(s.type)) || ep.s >= 1900) && !tvHas(s.id)) return;
      ev.push({ id: s.id, n: String(s.name || "").slice(0, 80), net: tvNet(s), w: +s.weight || 0, ep: ep });
    });
    // the 60 best-known shows of the day (and all of yours), in the order they air
    ev.sort(function (a, b) { return (tvHas(b.id) ? 1 : 0) - (tvHas(a.id) ? 1 : 0) || b.w - a.w; });
    TVSCH.ev = ev.slice(0, 60).sort(function (a, b) { return a.ep.ts - b.ep.ts || b.w - a.w; });
    render();
  });
}
function tvDayName(ts) {
  var k = function (t) { return new Date(t).toLocaleDateString("en-CA", { timeZone: TZ }); }, d = k(ts), now = Date.now();
  // another year than this one is said so ("Thu 7 Jan 2027")
  var o = { timeZone: TZ, weekday: "short", day: "numeric", month: "short" };
  if (d.slice(0, 4) !== k(now).slice(0, 4)) o.year = "numeric";
  return d === k(now) ? "Today" : d === k(now + 86400000) ? "Tomorrow" : d === k(now - 86400000) ? "Yesterday" : new Date(ts).toLocaleDateString("en-GB", o);
}
function tvTime(ts) { return new Date(ts).toLocaleTimeString("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }); }
function tvRow(id, name, ep, net, star) {
  // one line per show: its name and the episode number. The episode's title and the channel are in the tooltip and in the
  // show's window, so the box stays easy to scan.
  var more = [ep && ep.n && !/^(Episode \d+|TBA)$/.test(ep.n) ? ep.n : "", net].filter(Boolean).join(" · ");
  return '<div class="row tvrow"><span><button class="lnk tv1" data-a="tvopen" data-k="' + esc(String(id)) + '" title="' + esc(name + (more ? " · " + more : "")) + '"><b>' + esc(name) + "</b>" + (tvCode(ep) ? " <small>" + esc(tvCode(ep)) + "</small>" : "") + "</button></span>" +
    '<span class="r">' + (star ? '<i class="fv">★</i>' : "") + '<span class="mut">' + (ep ? tvTime(ep.ts) : "") + "</span></span></div>";
}
function tvBody() {
  var find = TVFIND || TVQ ? '<input type="search" id="tvQ" class="flt" placeholder="Search a show to follow, e.g. Severance" aria-label="Search TV shows">' : "", view = tvView(), mine = tvShows(), now = Date.now();
  if (TVQ) {
    if (TVRESQ !== TVQ || !TVRES) return find + '<div class="empty">Searching…</div>';
    return find + (TVRES.length ? lst("tv", TVRES.map(function (s) {
      return '<div class="row tvrow"><span><button class="lnk" data-a="tvopen" data-k="' + s.id + '"><b>' + esc(s.n) + "</b> <small>" + esc([s.y, s.net, s.st === "Ended" ? "ended" : ""].filter(Boolean).join(" · ")) + "</small></button></span>" +
        '<span class="r"><button class="ib sm' + (tvHas(s.id) ? " on" : "") + '" data-a="tvfav" data-k="' + s.id + "|" + esc(s.n) + '" title="' + (tvHas(s.id) ? "Stop following" : "Follow this show") + '" aria-label="' + (tvHas(s.id) ? "Stop following " : "Follow ") + esc(s.n) + '">' + (tvHas(s.id) ? "★" : "☆") + "</button></span></div>";
    }).join(""), 8) : '<div class="empty">No show found for “' + esc(TVQ) + "”.</div>");
  }
  var rows = [], head = "", html = "";
  if (view === "today") {
    if (!TVSCH.ev.length) return find + '<div class="empty">' + (Date.now() - TVSCH.t < 8000 ? "Loading today’s shows…" : "Nothing found for today in " + esc((TV_CC.filter(function (o) { return o[0] === tvCc(); })[0] || ["", ""])[1]) + ". Choose another country in Settings, TV shows.") + "</div>";
    rows = TVSCH.ev.map(function (e) { return { id: e.id, n: e.n, ep: e.ep, net: e.net, star: tvHas(e.id), hd: e.ep.ts < now - 3600000 ? "Earlier today" : "Coming up today" }; });
  } else {
    if (!mine.length) return find + '<div class="empty">No shows yet. Press ⌕ above and type the name of a show to follow it.<br><button data-a="tvfilt">Find a show</button></div>';
    var got = mine.map(function (s) { return { s: s, c: TVC[s.id] }; }).filter(function (x) { return x.c; });
    if (view === "mine") rows = got.filter(function (x) { return x.c.next && x.c.next.ts > now - 10800000; }).sort(function (a, b) { return a.c.next.ts - b.c.next.ts; }).map(function (x) { return { id: x.s.id, n: x.c.n || x.s.n, ep: x.c.next, net: x.c.net, hd: tvDayName(x.c.next.ts) }; });
    else rows = got.filter(function (x) { return x.c.prev && now - x.c.prev.ts < 45 * 86400000; }).sort(function (a, b) { return b.c.prev.ts - a.c.prev.ts; }).map(function (x) { return { id: x.s.id, n: x.c.n || x.s.n, ep: x.c.prev, net: x.c.net, hd: tvDayName(x.c.prev.ts) }; });
    if (!rows.length) return find + '<div class="empty">' + (got.length < mine.length && tvBusy ? "Loading your shows…" : TVERR && !got.length ? "TV shows unavailable: " + esc(TVERR) : view === "mine" ? "None of your " + mine.length + " shows has a new episode announced. Try “just aired”." : "None of your shows aired an episode in the last weeks.") + "</div>";
  }
  rows.forEach(function (r) { if (r.hd !== head) { head = r.hd; html += '<div class="spday">' + r.hd + "</div>"; } html += tvRow(r.id, r.n, r.ep, r.net, r.star); });
  return find + lst("tv", html, 8);
}
function tvTile() {
  return tile("tv", "TV shows", tvBody(), 0, '<select data-s="tvview" aria-label="Which shows">' + opts(TV_VIEWS, tvView()) + '</select><button class="ib sm' + (TVFIND || TVQ ? " on" : "") + '" data-a="tvfilt" title="Search a show to follow" aria-label="Search a show to follow">⌕</button>');
}
function tvSearch() {
  var q = TVQ;
  if (!q) { TVRES = null; render(); return; }
  tvGet("search/shows?q=" + encodeURIComponent(q)).then(function (j) {
    if (TVQ !== q) return;
    TVRES = (Array.isArray(j) ? j : []).map(function (x) { var s = x.show || {}; return { id: +s.id, n: String(s.name || "").slice(0, 80), y: String(s.premiered || "").slice(0, 4), net: tvNet(s), st: String(s.status || "") }; }).filter(function (s) { return s.id && s.n; }).slice(0, 10);
    TVRESQ = q; render();
  }).catch(function () { if (TVQ === q) { TVRES = []; TVRESQ = q; render(); } });
}
function tvFollow(id, name) {
  var T = tvp(), i = -1;
  T.shows.forEach(function (s, n) { if (String(s.id) === String(id)) i = n; });
  if (i >= 0) { T.shows.splice(i, 1); delete TVC[id]; save("sp_tvc", TVC); }
  else if (T.shows.length < 60) T.shows.push({ id: +id, n: String(name || "").slice(0, 80) });
  else { alert("You follow 60 shows, which is the most the box takes. Remove one first."); return; }
  persist(); render(); renderTvSet(); fetchTv();
}
// the window of one show: what it is, what is coming and what has just been on
function tvStrip(h) { var d = document.createElement("div"); d.innerHTML = String(h || "").replace(/<[^>]+>/g, " "); return (d.textContent || "").replace(/\s+/g, " ").trim(); }
function tvShowHtml(j) {
  var eps = ((j._embedded || {}).episodes || []).map(function (e) { var x = tvEp(e); if (x) x.sum = tvStrip(e.summary).slice(0, 220); return x; }).filter(Boolean), now = Date.now();
  var up = eps.filter(function (e) { return e.ts > now - 3600000; }).slice(0, 8), past = eps.filter(function (e) { return e.ts <= now - 3600000; }).slice(-6).reverse();
  var epRow = function (e) { return '<div class="row"><span><b class="ctm">' + tvCode(e) + "</b> " + esc(e.n) + (e.sum ? ' <small class="mut">' + esc(e.sum) + "</small>" : "") + '</span><span class="r mut">' + tvDayName(e.ts) + " " + tvTime(e.ts) + "</span></div>"; };
  var facts = [String(j.premiered || "").slice(0, 4) + (j.ended ? "–" + String(j.ended).slice(0, 4) : j.premiered ? "–" : ""), tvNet(j), (j.genres || []).slice(0, 3).join(", "), j.status === "Running" ? "" : j.status, j.rating && j.rating.average ? "★ " + j.rating.average : "", j.averageRuntime ? j.averageRuntime + " min" : ""].filter(Boolean);
  var img = tvImg(j), fav = tvHas(j.id);
  return '<div class="tvwin">' + (img ? '<img class="tvposter" alt="" referrerpolicy="no-referrer" data-rm="1" src="' + esc(img) + '">' : "") + '<div class="tvinfo"><h2 class="mh">' + esc(j.name || "") + '</h2><div class="mut sn">' + esc(facts.join(" · ")) + "</div><p>" + esc(tvStrip(j.summary).slice(0, 600)) + "</p>" +
    '<p class="tools"><button class="' + (fav ? "" : "pri") + '" data-a="tvfav" data-k="' + (+j.id) + "|" + esc(j.name || "") + '">' + (fav ? "★ Following · stop" : "☆ Follow this show") + "</button>" + linkBtn(String(j.url || "").replace(/^http:/, "https:"), "More on TVmaze") + (j.officialSite ? linkBtn(String(j.officialSite).replace(/^http:/, "https:"), "Official site") : "") + "</p></div></div>" +
    (up.length ? "<h3>Coming up</h3>" + up.map(epRow).join("") : '<p class="mut sn">' + (j.status === "Ended" ? "This show has ended." : "No new episode has been announced yet.") + "</p>") +
    (past.length ? "<h3>Latest episodes</h3>" + past.map(epRow).join("") : "") + '<p class="mut sn">Show information from TVmaze.com.</p>';
}
var TVOPEN = "";
function openTv(id) {
  id = String(id);
  if (!/^\d{1,9}$/.test(id)) return;
  TVOPEN = id;
  var c = TVSHOW[id], name = (TVC[id] && TVC[id].n) || "TV show";
  if (c && Date.now() - c.t < 3600000) { openModal("TV shows", tvShowHtml(c.j)); return; }
  openModal("TV shows", '<p class="mut">Loading ' + esc(name) + "…</p>");
  tvGet("shows/" + id + "?embed=episodes").then(function (j) {
    TVSHOW[id] = { t: Date.now(), j: j };
    if (TVOPEN === id && !$("modal").hidden && $("mTitle").textContent === "TV shows") $("mBody").innerHTML = tvShowHtml(j);
  }).catch(function () { if (TVOPEN === id && !$("modal").hidden && $("mTitle").textContent === "TV shows") $("mBody").innerHTML = '<p class="mut">Could not load this show right now.</p>'; });
}
function tvAct(a, k) {
  if (a === "tvopen") { openTv(k); return; }
  if (a === "tvfilt") { TVFIND = !(TVFIND || TVQ); if (!TVFIND) { TVQ = ""; TVRES = null; } render(); var q = $("tvQ"); if (q) { q.value = ""; q.focus(); } return; }
  if (a === "tvfav") {
    var p = String(k).split("|");
    tvFollow(p[0], p.slice(1).join("|"));
    if (WIZ && $("wzPage") && $("wzPage").dataset.p === "tv") { WIZMSG = "Following " + p.slice(1).join("|") + "."; wizRender(); return; }
    if (!$("modal").hidden && $("mTitle").textContent === "TV shows" && TVSHOW[TVOPEN]) $("mBody").innerHTML = tvShowHtml(TVSHOW[TVOPEN].j);
    return;
  }
  if (a === "tvdel") { tvFollow(k, ""); }
}
document.addEventListener("input", function (e) {
  if (e.target.id !== "tvQ") return;
  debounced("tvQ", function () { TVQ = $("tvQ") ? $("tvQ").value.trim().slice(0, 60) : ""; render(); tvSearch(); });
});
document.addEventListener("change", function (e) {
  var t = e.target;
  if (t && t.dataset && t.dataset.s === "tvview") { tvp().view = t.value; persist(); render(); fetchTv(); }
  else if (t && t.id === "tvCalOn") { tvp().cal = t.checked; tvCalKey = ""; persist(); render(); refreshCalAny(); }
  else if (t && t.id === "tvCc") { tvp().cc = t.value; TVSCH = { t: 0, key: "", ev: [] }; persist(); render(); fetchTv(); }
});
REFRESH.tv = function () { fetchTv(true); };
setInterval(function () { if (!document.hidden) fetchTv(); }, 900000);
// Settings > TV shows
function renderTvSet() {
  var el = $("tvSet");
  if (!el) return;
  $("tvOn").checked = !boxOff("tv");
  $("tvCc").innerHTML = opts(TV_CC, tvCc());
  $("tvCalOn").checked = !(P.tv && P.tv.cal === false);
  var mine = tvShows();
  el.innerHTML = mine.length ? mine.map(function (s) {
    var c = TVC[s.id];
    return '<div class="row"><span><button class="lnk" data-a="tvopen" data-k="' + s.id + '"><span class="bnm">' + esc((c && c.n) || s.n || "Show") + "</span></button> <small class=\"mut\">" + esc(c ? [c.net, c.next ? "next " + tvDayName(c.next.ts) : c.st === "Ended" ? "ended" : "no date yet"].filter(Boolean).join(" · ") : "") + '</small></span><button data-a="tvdel" data-k="' + s.id + '" title="Stop following" aria-label="Stop following ' + esc(s.n || "") + '">✕</button></div>';
  }).join("") : '<div class="mut sn">You follow no shows yet. Switch the box on, press ⌕ in it and type a name.</div>';
}

// ---- Radio: your own stations, found by name or genre in the Radio Browser catalogue (a free, public list of stations) ----
// P.radio.mine = [[id, name, "My stations", stream address, country]], the same shape as the built-in list.
var RB_HOSTS = ["de1", "nl1", "at1", "de2", "fi1"], RBRES = [], RBQ = "";
function radMine() { var m = P.radio && Array.isArray(P.radio.mine) ? P.radio.mine : []; return m.filter(function (r) { return Array.isArray(r) && /^u_[\w-]{1,40}$/.test(String(r[0])) && /^https:\/\//i.test(String(r[3])); }).slice(0, 25); }
function radAll() { return radMine().concat(RADIOS); }
function radMsg(t) { if ($("radMsg")) $("radMsg").textContent = t || ""; }
function rbGet(path, n) {
  n = n || 0;
  return fetch("https://" + RB_HOSTS[n] + ".api.radio-browser.info/json/" + path).then(function (r) { if (!r.ok) throw new Error("status " + r.status); return r.json(); })
    .catch(function (e) { if (n + 1 < RB_HOSTS.length) return rbGet(path, n + 1); throw e; });   // the catalogue has several servers; the next one is tried if one is down
}
function radFind() {
  var q = $("radQ") ? $("radQ").value.trim() : "", box = $("radRes");
  if (!box) return;
  RBQ = q;
  if (q.length < 2) { box.innerHTML = ""; return; }
  // a stream address typed in directly is added as it is
  if (/^https?:\/\//i.test(q)) { box.innerHTML = /^https:\/\//i.test(q) ? '<div class="row"><span class="mut sn">Add this address as a station of your own</span><button data-a="radaddurl">Add</button></div>' : '<p class="mut sn">The address has to start with https://.</p>'; return; }
  box.innerHTML = '<p class="mut sn">Searching…</p>';
  var base = "stations/search?hidebroken=true&is_https=true&order=clickcount&reverse=true&limit=30&";
  Promise.all([rbGet(base + "name=" + encodeURIComponent(q)).catch(function () { return null; }), rbGet(base + "tag=" + encodeURIComponent(q.toLowerCase())).catch(function () { return null; })]).then(function (r) {
    if (RBQ !== q || !$("radRes")) return;
    if (!r[0] && !r[1]) { box.innerHTML = '<p class="mut sn">The station catalogue is not answering right now. Try again in a moment.</p>'; return; }
    var seen = {};
    RBRES = (r[0] || []).concat(r[1] || []).filter(function (s) {
      var u = String(s.url_resolved || s.url || "");
      // what a browser can play: a plain https stream (not a playlist that needs a player of its own)
      if (!s.stationuuid || seen[s.stationuuid] || !/^https:\/\//i.test(u) || +s.hls === 1 || /\.(m3u8?|pls)(\?|$)/i.test(u) || !String(s.name || "").trim()) return false;
      seen[s.stationuuid] = 1;
      return true;
    }).sort(function (a, b) { return (+b.clickcount || 0) - (+a.clickcount || 0); }).slice(0, 15).map(function (s) {
      return { id: "u_" + String(s.stationuuid).replace(/[^\w-]/g, "").slice(0, 36), n: String(s.name).trim().slice(0, 60), u: String(s.url_resolved || s.url), c: radCountry(s.country || s.countrycode), tags: String(s.tags || "").split(",").filter(Boolean).slice(0, 3).join(", ").slice(0, 60), kb: +s.bitrate || 0 };
    });
    box.innerHTML = RBRES.length ? RBRES.map(function (s, i) {
      return '<div class="row"><span><span class="bnm rbn">' + esc(s.n) + '</span> <small class="mut">' + esc([s.c, s.tags, s.kb ? s.kb + " kbit" : ""].filter(Boolean).join(" · ")) + "</small></span>" + radHaveHtml(s, i) + "</div>";
    }).join("") : '<p class="mut sn">No station found for “' + esc(q) + "”. Try a shorter name, a city or a genre such as jazz.</p>";
  });
}
// Is this station already in the list (yours or the built-in one)? The same stream address is; so is the same station sent
// from another of its servers: the same stream name at the end of the address, a name that starts the same, and the same
// country ("Retro FM Estonia" on a second server is Retro FM; "Retro FM Moldova" is not).
function radKey(u) { try { var p = new URL(u); return p.hostname.toLowerCase() + p.pathname.toLowerCase().replace(/\/+$/, ""); } catch (e) { return String(u).toLowerCase(); } }
function radSeg(u) { try { return (new URL(u).pathname.split("/").filter(Boolean).pop() || "").toLowerCase().replace(/\.(mp3|aac|ogg|m4a)$/, ""); } catch (e) { return ""; } }
function radFlat(n) { return String(n || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
var RAD_LANGC = { french: "fra", danish: "den", dutch: "net", english: "" };
function radTwin(u, name, country, id) {
  var key = radKey(u), seg = radSeg(u), nm = radFlat(name), c = String(country || "").toLowerCase();
  return radAll().filter(function (r) {
    if (r[0] === id || radKey(r[3]) === key) return true;
    var rn = radFlat(r[1]), lang = String(r[4] || "").toLowerCase().replace(/[^a-z ]/g, ""), root = RAD_LANGC[lang] != null ? RAD_LANGC[lang] : lang.slice(0, 3);
    return !!rn && !!nm && seg.length >= 3 && radSeg(r[3]) === seg && (nm.indexOf(rn) === 0 || rn.indexOf(nm) === 0) && (!c || !root || c.indexOf(root) >= 0);
  })[0] || null;
}
// what stands at the end of a search result: listen and add, or that you have it already
function radHaveHtml(s, i) {
  var tw = radTwin(s.u, s.n, s.c, s.id);
  if (!tw) return '<span class="radb"><button data-a="radtry" data-k="' + i + '" title="Listen to it first">▶</button><button data-a="radadd" data-k="' + i + '">Add</button></span>';
  if (radioIds().some(function (r) { return r[0] === tw[0]; })) return '<span class="mut sn">✓ in your list' + (tw[1] !== s.n ? " as " + esc(tw[1]) : "") + "</span>";
  return '<span class="radb"><span class="mut sn">already listed as ' + esc(tw[1]) + '</span><button data-a="radtick" data-k="' + esc(tw[0]) + '">Tick it</button></span>';
}
function radAddMine(st) {
  P.radio = P.radio || {};
  var mine = radMine();
  if (mine.length >= 25) { radMsg("You have 25 stations of your own, which is the most. Remove one first."); return false; }
  // the same station is never listed twice: not a second time among your own, and not next to its twin in the built-in list
  var tw = radTwin(st[3], st[1], st[4], st[0]);
  if (tw) {
    if (radioIds().some(function (r) { return r[0] === tw[0]; })) { radMsg("You already have that station" + (tw[1] !== st[1] ? " (it is in your list as " + tw[1] + ")" : "") + "."); return false; }
    radioToggle(tw[0], true); renderRadioList();
    radMsg(tw[1] + " was already in the list of stations; it is ticked now and in the Radio box.");
    return true;
  }
  mine.push(st);
  P.radio.mine = mine;
  // a station you add is ticked straight away
  P.radio.on = radioIds().map(function (r) { return r[0]; }).concat([st[0]]);
  persist(); renderRadioList(); render();
  radMsg("Added " + st[1] + ". It is in the Radio box’s list now.");
  return true;
}
var RADTRY = null;
function radAct(a, k) {
  if (a === "radgo") { radFind(); return; }
  if (a === "radtick") { var tk1 = radAll().filter(function (r) { return r[0] === k; })[0]; if (tk1) { radioToggle(k, true); renderRadioList(); radMsg(tk1[1] + " is ticked now and in the Radio box."); radFind(); } return; }
  if (a === "radadd") { var s = RBRES[+k]; if (s && radAddMine([s.id, s.n, "My stations", s.u, s.c || "—"])) radFind(); return; }
  if (a === "radaddurl") {
    var u = safeUrl(RBQ);
    if (!/^https:\/\//i.test(u)) return;
    if (radAddMine(["u_" + hs(u), bmHost(u) || "My station", "My stations", u.slice(0, 500), "—"])) { $("radQ").value = ""; $("radRes").innerHTML = ""; }
    return;
  }
  // a short listen before adding: plays in a player of its own, so the Radio box is left alone
  if (a === "radtry") {
    var t = RBRES[+k];
    if (!t) return;
    if (RADTRY) { RADTRY.pause(); RADTRY.removeAttribute("src"); RADTRY.load(); }
    if (RADTRY && RADTRY.getAttribute("data-id") === t.id) { RADTRY = null; radMsg(""); return; }   // the same ▶ again stops it
    RADTRY = new Audio(); RADTRY.setAttribute("data-id", t.id); RADTRY.volume = radioVol() / 100; RADTRY.src = t.u;
    radMsg("Playing " + t.n + "… press ▶ again to stop.");
    var p = RADTRY.play(), bad = function () { if (RADTRY && RADTRY.getAttribute("data-id") === t.id) { radMsg(t.n + " could not be played in the browser. Try another one."); RADTRY = null; } };
    RADTRY.addEventListener("error", bad);
    if (p && p.catch) p.catch(bad);
    return;
  }
  if (a === "raddel") {
    P.radio = P.radio || {};
    P.radio.mine = radMine().filter(function (m) { return m[0] !== k; });
    if (Array.isArray(P.radio.on)) P.radio.on = P.radio.on.filter(function (x) { return x !== k; });
    if (RAD.id === k) radioStop();
    persist(); renderRadioList(); render(); radMsg("");
  }
}
function radTryStop() { if (RADTRY) { RADTRY.pause(); RADTRY.removeAttribute("src"); RADTRY.load(); RADTRY = null; } }

// ---- Telling the browser which fields are NOT a login ----
// A browser guesses what every text field is for. With password fields on the same page it takes ordinary fields (a search,
// a city, a station name) for a username or an email address and offers to save a password or make an email alias in each.
// So: every field that is not part of signing in is marked "do not fill in", for the browser and for the common password
// managers; the sign-in and new-password fields sit in forms of their own; and codes that are not passwords (the Gmail
// token) are ordinary fields that only look masked. Fields come and go as the page redraws, so new ones are marked as they appear.
var NF_SKIP = { acctEmail: 1, acctPass: 1, acctPass2: 1, pwNew: 1, pwNew2: 1, pwUser: 1 }, nfWait = 0;
function noFill() {
  nfWait = 0;
  Array.prototype.forEach.call(document.querySelectorAll("input:not([data-nf]), textarea:not([data-nf])"), function (el) {
    el.setAttribute("data-nf", "1");
    var t = (el.getAttribute("type") || "text").toLowerCase();
    if (NF_SKIP[el.id] || /^(checkbox|radio|file|color|range|hidden|button|submit|password|email)$/.test(t)) return;   // an email field (feedback, sign-in) may be filled in
    el.setAttribute("autocomplete", "off");
    el.setAttribute("data-1p-ignore", ""); el.setAttribute("data-lpignore", "true"); el.setAttribute("data-bwignore", ""); el.setAttribute("data-form-type", "other");
  });
}
noFill();
if (window.MutationObserver) new MutationObserver(function () { if (!nfWait) nfWait = setTimeout(noFill, 0); }).observe(document.body, { childList: true, subtree: true });
// the forms around the sign-in fields are never sent anywhere: signing in is done by the buttons
document.addEventListener("submit", function (e) { if (e.target && e.target.classList && e.target.classList.contains("nosub")) e.preventDefault(); });
// the change-password form names the account it is for, so a password manager updates the right entry
document.addEventListener("focusin", function (e) { if ((e.target.id === "pwNew" || e.target.id === "pwNew2") && $("pwUser")) $("pwUser").value = USER ? USER.email : ""; });
// ---- Market hours (the small clock button in the Stocks box) ----
// Which exchanges your stocks trade on, whether each is open right now, and how long until it closes or opens.
// Each market: its name, time zone and trading hours as minutes after midnight there (a second pair = it shuts for lunch).
// `w` instead of `s` = hours that differ per weekday (0 = Sunday): currencies and futures trade around the clock from
// Sunday evening to Friday evening, New York time. `h` = which public holidays it keeps (mkHols).
var MK = {
  us: { n: "US markets", x: "NYSE, Nasdaq", tz: "America/New_York", s: [[570, 960]], h: "us" },
  de: { n: "Germany", x: "Xetra, Frankfurt", tz: "Europe/Berlin", s: [[540, 1050]], h: "de" },
  se: { n: "Stockholm", x: "Nasdaq Stockholm", tz: "Europe/Stockholm", s: [[540, 1050]], h: "se" },
  fi: { n: "Helsinki", x: "Nasdaq Helsinki", tz: "Europe/Helsinki", s: [[600, 1110]], h: "fi" },
  dk: { n: "Copenhagen", x: "Nasdaq Copenhagen", tz: "Europe/Copenhagen", s: [[540, 1020]], h: "dk" },
  no: { n: "Oslo", x: "Oslo Børs", tz: "Europe/Oslo", s: [[540, 985]], h: "no" },
  bt: { n: "Baltic", x: "Tallinn, Riga, Vilnius", tz: "Europe/Tallinn", s: [[600, 960]], h: "eu" },
  is: { n: "Iceland", x: "Nasdaq Iceland", tz: "Atlantic/Reykjavik", s: [[570, 930]], h: "eu" },
  uk: { n: "London", x: "London Stock Exchange", tz: "Europe/London", s: [[480, 990]], h: "uk" },
  eu: { n: "Euronext", x: "Paris, Amsterdam, Brussels, Lisbon, Dublin", tz: "Europe/Paris", s: [[540, 1050]], h: "eu" },
  it: { n: "Milan", x: "Borsa Italiana", tz: "Europe/Rome", s: [[540, 1050]], h: "de" },
  es: { n: "Madrid", x: "BME", tz: "Europe/Madrid", s: [[540, 1050]], h: "eu" },
  ch: { n: "Zurich", x: "SIX Swiss Exchange", tz: "Europe/Zurich", s: [[540, 1040]], h: "de" },
  at: { n: "Vienna", x: "Wiener Börse", tz: "Europe/Vienna", s: [[540, 1050]], h: "de" },
  pl: { n: "Warsaw", x: "GPW", tz: "Europe/Warsaw", s: [[540, 1025]], h: "eu" },
  ca: { n: "Toronto", x: "TSX", tz: "America/Toronto", s: [[570, 960]], h: "ca" },
  au: { n: "Sydney", x: "ASX", tz: "Australia/Sydney", s: [[600, 960]], h: "" },
  hk: { n: "Hong Kong", x: "HKEX", tz: "Asia/Hong_Kong", s: [[570, 720], [780, 960]], h: "" },
  jp: { n: "Tokyo", x: "Tokyo Stock Exchange", tz: "Asia/Tokyo", s: [[540, 690], [750, 930]], h: "" },
  kr: { n: "Seoul", x: "Korea Exchange", tz: "Asia/Seoul", s: [[540, 930]], h: "" },
  "in": { n: "India", x: "NSE, BSE", tz: "Asia/Kolkata", s: [[555, 930]], h: "" },
  cn: { n: "China", x: "Shanghai, Shenzhen", tz: "Asia/Shanghai", s: [[570, 690], [780, 900]], h: "" },
  br: { n: "São Paulo", x: "B3", tz: "America/Sao_Paulo", s: [[600, 1020]], h: "" },
  mx: { n: "Mexico", x: "BMV", tz: "America/Mexico_City", s: [[510, 900]], h: "" },
  fut: { n: "Commodities", x: "trade almost around the clock, Sunday evening to Friday evening", tz: "America/New_York", w: [[[1080, 1440]], [[0, 1020], [1080, 1440]], [[0, 1020], [1080, 1440]], [[0, 1020], [1080, 1440]], [[0, 1020], [1080, 1440]], [[0, 1020]], []] },
  fx: { n: "Currencies", x: "trade around the clock, Sunday evening to Friday evening", tz: "America/New_York", w: [[[1020, 1440]], [[0, 1440]], [[0, 1440]], [[0, 1440]], [[0, 1440]], [[0, 1020]], []] },
  crypto: { n: "Crypto", x: "never closes", always: 1 }
};
// the exchange in front of a symbol (NASDAQ:NVDA), as TradingView names them -> market
var MK_PRE = { NASDAQ: "us", NYSE: "us", AMEX: "us", ARCA: "us", BATS: "us", CBOE: "us", OTC: "us", SP: "us", DJ: "us", XETR: "de", FWB: "de", SWB: "de", TRADEGATE: "de", GETTEX: "de", OMXSTO: "se", OMXHEX: "fi", OMXCOP: "dk", OSL: "no",
  OMXTSE: "bt", OMXRSE: "bt", OMXVSE: "bt", OMXICE: "is", LSE: "uk", LSIN: "uk", AQUIS: "uk", EURONEXT: "eu", MIL: "it", BME: "es", SIX: "ch", VIE: "at", GPW: "pl", TSX: "ca", TSXV: "ca", NEO: "ca", CSE: "ca", ASX: "au", HKEX: "hk", TSE: "jp",
  KRX: "kr", NSE: "in", BSE: "in", SSE: "cn", SZSE: "cn", BMFBOVESPA: "br", BMV: "mx", BINANCE: "crypto", COINBASE: "crypto", KRAKEN: "crypto", BITSTAMP: "crypto", BYBIT: "crypto", OKX: "crypto", KUCOIN: "crypto", CRYPTO: "crypto", CRYPTOCAP: "crypto",
  NYMEX: "fut", COMEX: "fut", CME: "fut", CBOT: "fut", ICEEUR: "fut", ICEUS: "fut", FX: "fx", FX_IDC: "fx", OANDA: "fx", FOREXCOM: "fx", SAXO: "fx" };
// symbols without an exchange that the price service knows by name
var MK_SYM = { SAAB_B: "se", RHM: "de", VOW3: "de", P911: "de", "4HO": "de", LDO: "it", SPX: "us", DJI: "us", NASDAQ: "us" };
var MK_FIAT = /^(USD|EUR|GBP|JPY|CHF|SEK|NOK|DKK|PLN|CZK|HUF|RUB|TRY|CAD|AUD|NZD|CNY|CNH|HKD|SGD|INR|KRW|MXN|BRL|ZAR|ILS|AED|SAR|THB|UAH)$/;
var MK_METAL = /^(XAU|XAG|XPT|XPD|BCO|WTI|UKOIL|USOIL|GOLD|SILVER|BRENT|NATGAS|COPPER)/;
function stMarket(id) {
  id = String(id || "").toUpperCase();
  var pre = id.indexOf(":") > 0 ? id.split(":")[0] : "", s = tk(id);
  if (MK_METAL.test(s) || /=F$/.test(s)) return "fut";
  if (/=X$/.test(s)) return "fx";
  if (pre && MK_PRE[pre] && MK_PRE[pre] !== "fx") return MK_PRE[pre] === "us" && /^(GOLD|SILVER|USOIL|UKOIL)$/.test(s) ? "fut" : MK_PRE[pre];
  var pair = /^([A-Z0-9]{2,7}?)[-/]?(USDT?|USDC|EUR|GBP)$/.exec(s);
  if (/^[A-Z]{6}$/.test(s) && MK_FIAT.test(s.slice(0, 3)) && MK_FIAT.test(s.slice(3))) return "fx";
  if (pre && MK_PRE[pre] === "fx") return "fx";
  if (MK_SYM[s]) return MK_SYM[s];
  var suf = /\.([A-Z]{1,2})$/.exec(s);
  if (suf && TV_EX[suf[1]] && MK_PRE[TV_EX[suf[1]]]) return MK_PRE[TV_EX[suf[1]]];
  if (suf && /^(HM|MU|BE|DU|SG)$/.test(suf[1])) return "de";
  if (suf && suf[1] === "NE") return "ca";
  if (/-USD$/.test(s) || (pair && !suf && !/^\^/.test(s) && (pre || /USDT?$|USDC$/.test(s)) && !MK_FIAT.test(pair[1]))) return "crypto";
  return "us";   // a plain symbol (AAPL, NVDA, ^GSPC): the US markets
}
// the main public holidays a market is closed on, per year: { "2026-12-25": 1 }. Shortened days are not in here.
var MKH = {};
function mkHols(g, y) {
  if (!g) return {};
  if (MKH[g + y]) return MKH[g + y];
  var o = {}, add = function (d) { o[ymd(d)] = 1; }, fix = function (m, d) { add(sdDate(y, m, d)); }, e = easter(y);
  // a US holiday on a Saturday is kept on the Friday before, one on a Sunday on the Monday after (not New Year on a Saturday)
  var us = function (m, d, noFri) { var x = sdDate(y, m, d), wd = x.getDay(); add(wd === 6 ? (noFri ? x : plus(x, -1)) : wd === 0 ? plus(x, 1) : x); };
  if (g === "us") { us(0, 1, true); add(nthDow(y, 0, 1, 3)); add(nthDow(y, 1, 1, 3)); add(plus(e, -2)); add(lastDow(y, 4, 1)); us(5, 19); us(6, 4); add(nthDow(y, 8, 1, 1)); add(nthDow(y, 10, 4, 4)); us(11, 25); }
  else if (g === "ca") { fix(0, 1); add(nthDow(y, 1, 1, 3)); add(plus(e, -2)); add(plus(dowOnAfter(y, 4, 18, 1), 0)); fix(6, 1); add(nthDow(y, 7, 1, 1)); add(nthDow(y, 8, 1, 1)); add(nthDow(y, 9, 1, 2)); fix(11, 25); fix(11, 26); }
  else {
    fix(0, 1); add(plus(e, -2)); add(plus(e, 1)); fix(11, 25); fix(11, 26);
    if (g === "uk") { add(nthDow(y, 4, 1, 1)); add(lastDow(y, 4, 1)); add(lastDow(y, 7, 1)); }
    else if (g !== "dk") fix(4, 1);
    if (g === "de" || g === "se" || g === "fi" || g === "dk" || g === "no") { fix(11, 24); fix(11, 31); }
    if (g === "se") { fix(0, 6); add(plus(e, 39)); fix(5, 6); add(dowOnAfter(y, 5, 19, 5)); }
    if (g === "fi") { fix(0, 6); add(plus(e, 39)); add(dowOnAfter(y, 5, 19, 5)); fix(11, 6); }
    if (g === "no") { add(plus(e, -3)); add(plus(e, 39)); fix(4, 17); add(plus(e, 50)); }
    if (g === "dk") { add(plus(e, -3)); add(plus(e, 39)); add(plus(e, 40)); add(plus(e, 50)); fix(5, 5); }
  }
  return (MKH[g + y] = o);
}
// the date and weekday it is in a time zone right now
function mkDay(ts, tz) {
  var p = {};
  new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(ts)).forEach(function (x) { p[x.type] = +x.value; });
  return p;
}
// Open or closed, and until when: { open, until (ms; 0 = never changes), brk (closed for a lunch break) }. Kept for half a minute.
var MKC = {};
function mkState(key, now) {
  now = now || Date.now();
  var m = MK[key], c = MKC[key];
  if (!m) return { open: false, until: 0 };
  if (m.always) return { open: true, until: 0 };
  if (c && Math.abs(now - c.t) < 30000) return c.v;
  var d0 = mkDay(now, m.tz), iv = [];
  for (var off = -1; off <= 9; off++) {
    var day = new Date(Date.UTC(d0.year, d0.month - 1, d0.day + off)), y = day.getUTCFullYear(), mo = day.getUTCMonth() + 1, dd = day.getUTCDate(), dow = day.getUTCDay();
    var ses = m.w ? m.w[dow] : dow >= 1 && dow <= 5 && !mkHols(m.h, y)[y + "-" + pad2(mo) + "-" + pad2(dd)] ? m.s : [];
    ses.forEach(function (s) {
      var a = icsZoned(y, mo, dd, Math.floor(s[0] / 60), s[0] % 60, m.tz).getTime(), b = icsZoned(y, mo, dd, Math.floor(s[1] / 60), s[1] % 60, m.tz).getTime(), last = iv[iv.length - 1];
      if (last && a <= last[1] + 60000) last[1] = b; else iv.push([a, b, off]);   // midnight to midnight runs on as one stretch
    });
  }
  var v = { open: false, until: 0 };
  for (var i = 0; i < iv.length; i++) {
    if (now >= iv[i][0] && now < iv[i][1]) { v = { open: true, until: iv[i][1] }; break; }
    if (iv[i][0] > now) { v = { open: false, until: iv[i][0], brk: i > 0 && iv[i - 1][2] === iv[i][2] && !m.w }; break; }
  }
  MKC[key] = { t: now, v: v };
  return v;
}
function mkLeft(ms) {
  var min = Math.max(1, Math.round(ms / 60000)), d = Math.floor(min / 1440), h = Math.floor(min % 1440 / 60), mi = min % 60;
  return d ? d + "d " + h + "h" : h ? h + "h " + (mi < 10 ? "0" : "") + mi + "m" : mi + "m";
}
// when it changes, in your own time: "23:00", or "Mon 16:30" if that is not today
function mkAt(ts) {
  var k = function (t) { return new Date(t).toLocaleDateString("en-CA", { timeZone: TZ }); }, hm = new Date(ts).toLocaleTimeString("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
  return k(ts) === k(Date.now()) ? hm : new Date(ts).toLocaleDateString("en-GB", { timeZone: TZ, weekday: "short" }) + " " + hm;
}
function mkText(key, st) {
  if (MK[key].always) return "always open";
  if (!st.until) return st.open ? "open" : "closed";
  return (st.open ? "closes in " : st.brk ? "lunch break, back in " : "opens in ") + mkLeft(st.until - Date.now());
}
// your markets, the one with most of your stocks first: [{ key, ids: [stock ids], st }]
function mkMine() {
  var by = {}, out = [];
  (P.stocks || DATA.stocks).forEach(function (x) { if (!shown("s:" + x.id)) return; var k = stMarket(x.id); (by[k] = by[k] || []).push(x.id); });
  Object.keys(by).forEach(function (k) { out.push({ key: k, ids: by[k], st: mkState(k) }); });
  return out.sort(function (a, b) { return b.ids.length - a.ids.length || (a.key < b.key ? -1 : 1); });
}
// A market that never closes (crypto) is left out everywhere: there is nothing to tell about it.
function mkListed() { return mkMine().filter(function (m) { return !MK[m.key].always; }); }
function mkTotal() { return mkMine().reduce(function (n, m) { return n + m.ids.length; }, 0); }
// "main" = every market with at least a fifth of your stocks; at least the biggest one, at most three
function mkMain() { var all = mkListed(), total = mkTotal(); return all.filter(function (m, i) { return i === 0 || m.ids.length / total >= 0.2; }).slice(0, 3); }
// the words next to Open / Closed, and how long: ["closes in", "2h 10m"]
function mkWhen(st) { return !st.until ? ["", ""] : [st.open ? "closes in" : st.brk ? "lunch, back in" : "opens in", mkLeft(st.until - Date.now())]; }
// The button in the head of the Stocks box: a clock in the box's own "up" color while the market most of your stocks are
// on is open, in its "down" color while it is closed (Settings > Appearance > Signal colors per box). Point at it for your
// main markets, click it for all of them.
function mkBtn() {
  var main = mkMain();
  if (!main.length) return "";
  var say = main.map(function (m) { return MK[m.key].n + " " + (m.st.open ? "open" : "closed") + ", " + mkWhen(m.st).join(" "); }).join(". ");
  return '<button class="ib sm mkclk ' + (main[0].st.open ? "up" : "dn") + '" data-a="mkopen" aria-label="Market hours. ' + esc(say) + '"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></button>';
}
// one market as the cells of a row; every row has the same cells, so they line up in columns
function mkCells(m, full) {
  var M = MK[m.key], st = m.st, w = mkWhen(st);
  return '<i class="mkd ' + (st.open ? "on" : "off") + '"></i><b class="mkn">' + esc(M.n) + "</b>" +
    (full ? '<span class="mkc1">' + m.ids.length + (m.ids.length === 1 ? " stock" : " stocks") + '</span><span class="mkc2">' + Math.round(m.ids.length / mkTotal() * 100) + "%</span>" : "") +
    '<b class="mks ' + (st.open ? "on" : "off") + '">' + (st.open ? "Open" : "Closed") + '</b><span class="mkl">' + w[0] + '</span><span class="mkdur">' + w[1] + '</span><span class="mkt">' + (st.until ? mkAt(st.until) : "") + "</span>";
}
// the small box under the mouse: your main markets, in the same columns as the window
function mkPeek(el) {
  var main = mkMain(), rest = mkListed().length - main.length;
  if (!main.length || EDIT || !$("modal").hidden) return;
  $("peek").innerHTML = '<div class="mkpop"><div class="mkgrid">' + main.map(function (m) { return '<div class="mkline">' + mkCells(m, false) + "</div>"; }).join("") + '</div><small class="mkhint">' + (rest > 0 ? "+" + rest + " more · " : "") + "click for all</small></div>";
  // right under the button (above it when there is no room below), kept inside the window
  var p = $("peek");
  p.hidden = false;
  var r = el.getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight, y = r.bottom + 6;
  if (y + h > innerHeight - 8) y = r.top - h - 6;
  p.style.left = Math.round(Math.max(8, Math.min(r.left, innerWidth - w - 8))) + "px"; p.style.top = Math.round(Math.max(8, y)) + "px";
}
document.addEventListener("mouseover", function (e) {
  var b = e.target.closest && e.target.closest("#grid .mkclk");
  if (!b || peekKey === "mk") return;
  clearTimeout(peekT); peekKey = "mk";
  peekT = setTimeout(function () { if (peekKey === "mk" && document.contains(b)) mkPeek(b); }, 250);
});
document.addEventListener("mouseout", function (e) {
  var b = e.target.closest && e.target.closest("#grid .mkclk");
  if (b && !(e.relatedTarget && b.contains(e.relatedTarget)) && peekKey === "mk") hidePeek();
});
var MK_T = "Market hours", MK_SEL = "";
function mkHtml() {
  var list = mkListed(), hidden = mkMine().filter(function (m) { return MK[m.key].always; });
  if (!mkMine().length) return '<p class="mut">No stocks on your list yet.</p>';
  if (!list.length) return '<p class="mut">Everything on your list trades around the clock, so there are no opening hours to show.</p>';
  return '<div class="mkwin"><div class="mkgrid">' + list.map(function (m) {
    var M = MK[m.key], open = MK_SEL === m.key;
    return '<button class="mkline mkhead' + (open ? " sel" : "") + '" data-a="mkrow" data-k="' + m.key + '" aria-expanded="' + open + '" title="Show the stocks on this market">' + mkCells(m, true) + "</button>" +
      (open ? '<div class="mkmore"><div class="mut sn">' + esc(M.x) + (M.s ? " · " + M.s.map(function (s) { return pad2(Math.floor(s[0] / 60)) + ":" + pad2(s[0] % 60) + "–" + pad2(Math.floor(s[1] / 60)) + ":" + pad2(s[1] % 60); }).join(" and ") + " " + esc(M.tz.split("/").pop().replace(/_/g, " ")) + " time, Monday to Friday" : "") + '</div><div class="mkchips">' +
        // the stocks of this market in equal cells: the symbol on the left, today's change on the right
        m.ids.map(function (id) { var q = QUOTES[tk(id)], c = q && q.c != null ? q.c : null; return '<button data-a="open" data-k="' + esc("s:" + id) + '" title="' + esc(tk(id)) + '"><b>' + esc(tk(id)) + '</b><span class="' + (c == null ? "mut" : c >= 0 ? "up" : "down") + '">' + (c == null ? "–" : (c >= 0 ? "+" : "") + c.toFixed(1) + "%") + "</span></button>"; }).join("") + "</div></div>" : "");
  }).join("") + '</div><p class="mut sn mkfoot">Times are on your own clock (' + esc(LOCNAME) + "). Click a market for its stocks." + (hidden.length ? " " + hidden.map(function (m) { return MK[m.key].n; }).join(", ") + " (" + hidden.reduce(function (n, m) { return n + m.ids.length; }, 0) + " on your list) is not shown: it never closes." : "") +
    " The main public holidays are counted; shortened trading days and some local holidays are not. A symbol without an exchange in its name is taken as a US stock.</p></div>";
}
function openMarkets() { openModal(MK_T, mkHtml()); }
function mkAct(a, k) {
  if (a === "mkopen") { MK_SEL = ""; openMarkets(); return; }
  if (a === "mkrow") { MK_SEL = MK_SEL === k ? "" : k; if ($("mTitle").textContent === MK_T) $("mBody").innerHTML = mkHtml(); }
}
// the open window counts down by itself
setInterval(function () { if (!$("modal").hidden && $("mTitle").textContent === MK_T && !document.hidden) $("mBody").innerHTML = mkHtml(); }, 30000);

var CALEDIT = "";   // the event being changed in the calendar's form (its id), or nothing
// ---- TV episodes in the calendar, and a notification when one airs ----
// The next and the latest episode of every show you follow sit on their day in the calendar (like your ★ teams' games);
// they are not saved with your own events. Off with Settings > TV shows.
var tvCalKey = "", tvCalMemo = {};
function tvCalOn() { return !boxOff("tv") && !(P.tv && P.tv.cal === false) && tvShows().length > 0; }
function tvCalMap() {
  if (!tvCalOn()) return {};
  var key = tvShows().map(function (s) { return s.id + ":" + ((TVC[s.id] || {}).t || 0); }).join("|");
  if (key === tvCalKey) return tvCalMemo;
  var m = {};
  tvShows().forEach(function (s) {
    var c = TVC[s.id];
    if (!c) return;
    [c.prev, c.next].forEach(function (ep) {
      if (!ep || !ep.ts) return;
      var d = new Date(ep.ts), ds = ymd(d);
      (m[ds] = m[ds] || []).push({ id: "tv:" + s.id + ":" + ep.s + ":" + ep.e, tv: s.id, ro: 1, d: ds, tm: pad2(d.getHours()) + ":" + pad2(d.getMinutes()), t: (c.n || s.n) + (tvCode(ep) ? " " + tvCode(ep) : "") });
    });
  });
  tvCalKey = key; tvCalMemo = m;
  return m;
}
// a card when a new episode of a show you follow goes on air (checked every minute; told once, on all your devices together)
function tvAlerts() {
  if (boxOff("tv") || NTF().tv === false) return;
  var now = Date.now(), stale = false;
  tvShows().forEach(function (s) {
    var c = TVC[s.id], ep = c && c.next;
    if (!ep || ep.ts > now) return;
    stale = true;
    if (now - ep.ts > 21600000 || !once("tv:" + s.id + ":" + ep.s + ":" + ep.e + ":" + ep.ts)) return;
    toast("tv", (c.n || s.n) + (tvCode(ep) ? " " + tvCode(ep) : ""), "New episode" + (ep.n && !/^(Episode \d+|TBA)$/.test(ep.n) ? ": " + ep.n : "") + (now - ep.ts < 180000 ? " · on now" : " · aired " + ago(ep.ts) + " ago"), { a: "tv", k: String(s.id) });
  });
  if (stale) fetchTv();   // an episode has aired: ask what the next one is
}
setInterval(tvAlerts, 60000);

// ---- Price alerts: "tell me when NVDA is more than 200" (the bell in the Stocks box) ----
// P.pa = [{ id, s: stock id, op: ">" | "<" | "=", v: price, on, hit: when it last told you, n: how often it was set again }]
// An alert tells you once and switches itself off; ticking it (or changing it) sets it again.
var PA_OPS = [[">", "more than"], ["<", "less than"], ["=", "reaches"]], PA_LAST = {}, PA_T = "Price alerts", PA_PICK = "";
function PA() { return (Array.isArray(P.pa) ? P.pa : []).filter(function (a) { return a && a.id && a.s && isFinite(a.v) && a.v > 0; }).slice(0, 30); }
function paPrice(s) { var q = QUOTES[tk(s)]; return q && q.p ? +q.p : null; }
function paNum(v) { v = +v; return v.toLocaleString("en-GB", { minimumFractionDigits: v < 10 ? 2 : 0, maximumFractionDigits: v < 1 ? 6 : 2 }); }
function priceAlerts() {
  var list = PA(), changed = false, now = Date.now();
  list.forEach(function (a) {
    var p = paPrice(a.s), last = PA_LAST[a.id];
    if (p == null) return;
    PA_LAST[a.id] = p;
    if (a.on === false) return;
    // "reaches" = the price gets to that level from either side (it was on one side at the last look and is on the other, or exactly on it, now)
    var hit = a.op === ">" ? p > a.v : a.op === "<" ? p < a.v : p === a.v || (last != null && (last - a.v) * (p - a.v) < 0);
    if (!hit) return;
    a.on = false; a.hit = now; changed = true;
    if (once("pa:" + a.id + ":" + (a.n || 0))) toast("stock", tk(a.s) + " is " + (a.op === ">" ? "above " : a.op === "<" ? "below " : "at ") + paNum(a.v), "Now " + paNum(p) + ". Your price alert.", { a: "stock", k: a.s }, true, true);
  });
  if (changed) { P.pa = list; persist(); render(); paRedraw(); }
}
function paBtn() {
  var n = PA().filter(function (a) { return a.on !== false; }).length;
  return '<button class="ib sm pab' + (n ? " on" : "") + '" data-a="paopen" title="Price alerts' + (n ? " (" + n + " set)" : ": get told when a stock passes a price you choose") + '" aria-label="Price alerts"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 6 2.500 7 2.500 7h-17S6 15 6 9zM10 20a2 2 0 0 0 4 0"/></svg></button>';
}
function paStocks() { return (P.stocks || DATA.stocks).filter(function (x) { return shown("s:" + x.id); }).map(function (x) { return x.id; }); }
function paHtml() {
  var ids = paStocks(), list = PA(), pick = ids.indexOf(PA_PICK) >= 0 ? PA_PICK : ids[0] || "", now = pick ? paPrice(pick) : null;
  if (!ids.length) return '<p class="mut">Add a stock first; then you can set an alert on its price.</p>';
  return '<div class="pawin"><form id="paAdd" class="paform"><span>Alert me when</span><select id="paS" aria-label="Stock">' + ids.map(function (id) { return '<option value="' + esc(id) + '"' + (id === pick ? " selected" : "") + ">" + esc(tk(id)) + "</option>"; }).join("") + "</select><span>is</span>" +
    '<select id="paOp" aria-label="Higher or lower">' + opts(PA_OPS, ">") + '</select><input type="number" id="paV" step="any" min="0" inputmode="decimal" placeholder="price" aria-label="Price"' + (now != null ? ' value="' + now + '"' : "") + '><button class="pri">Add</button></form>' +
    '<div class="mut sn" id="paNow">' + (now != null ? esc(tk(pick)) + " is " + paNum(now) + " now." : "No price for " + esc(tk(pick)) + " yet.") + '</div><div id="paMsg" class="sn" role="status"></div>' +
    (list.length ? '<h3>Your alerts</h3><div class="palist">' + list.map(function (a) {
      var p = paPrice(a.s);
      return '<div class="parow' + (a.on === false ? " off" : "") + '"><input type="checkbox" data-pa="on" data-id="' + esc(a.id) + '"' + (a.on === false ? "" : " checked") + ' title="' + (a.on === false ? "Switched off. Tick to set it again." : "Set. Untick to pause it.") + '" aria-label="Alert on or off"><b>' + esc(tk(a.s)) + "</b>" +
        '<select data-pa="op" data-id="' + esc(a.id) + '" aria-label="Higher or lower">' + opts(PA_OPS, a.op) + '</select><input type="number" data-pa="v" data-id="' + esc(a.id) + '" step="any" min="0" inputmode="decimal" value="' + (+a.v) + '" aria-label="Price">' +
        '<small class="mut">' + (p != null ? "now " + paNum(p) : "") + (a.hit ? (p != null ? " · " : "") + "told you " + ago(a.hit) + " ago" : "") + '</small><button data-a="padel" data-k="' + esc(a.id) + '" title="Remove this alert" aria-label="Remove this alert">✕</button></div>';
    }).join("") + "</div>" : "") +
    '<p class="mut sn">An alert tells you once and then switches itself off; tick it to set it again. “Reaches” means the price gets to that level from above or from below. Prices are looked at about once a minute while this page is open in a tab, so a very short spike can be missed.</p></div>';
}
function paOpen(id) { if (id) PA_PICK = id; openModal(PA_T, paHtml()); }
function paRedraw() { if (!$("modal").hidden && $("mTitle").textContent === PA_T) { var act = document.activeElement; if (act && act.closest && act.closest(".pawin") && /^(INPUT|SELECT)$/.test(act.tagName)) return; $("mBody").innerHTML = paHtml(); } }
function paSave(list) { P.pa = list; persist(); render(); }
document.addEventListener("submit", function (e) {
  if (e.target.id !== "paAdd") return;
  e.preventDefault();
  var s = $("paS").value, op = $("paOp").value, v = parseFloat(String($("paV").value).replace(",", ".")), list = PA(), msg = $("paMsg");
  if (!(v > 0)) { msg.textContent = "Type the price to watch for."; $("paV").focus(); return; }
  if (list.length >= 30) { msg.textContent = "Thirty alerts at most. Remove one first."; return; }
  if (list.some(function (a) { return a.s === s && a.op === op && +a.v === v; })) { msg.textContent = "You already have that alert."; return; }
  list.push({ id: "p" + Date.now().toString(36), s: s, op: op, v: v, on: true });
  PA_PICK = s;
  paSave(list);
  $("mBody").innerHTML = paHtml();
  $("paMsg").textContent = "Added: " + tk(s) + " " + (op === ">" ? "more than" : op === "<" ? "less than" : "reaches") + " " + paNum(v) + ".";
  if (NTF().desktop) askNotify();
  priceAlerts();
});
document.addEventListener("change", function (e) {
  var t = e.target;
  if (!t) return;
  if (t.id === "paS") { PA_PICK = t.value; var p = paPrice(t.value); if ($("paV") && p != null) $("paV").value = p; if ($("paNow")) $("paNow").textContent = p != null ? tk(t.value) + " is " + paNum(p) + " now." : "No price for " + tk(t.value) + " yet."; return; }
  if (!t.dataset || !t.dataset.pa) return;
  var list = PA(), a = list.filter(function (x) { return x.id === t.dataset.id; })[0];
  if (!a) return;
  if (t.dataset.pa === "on") a.on = t.checked;
  else if (t.dataset.pa === "op") a.op = t.value === "<" || t.value === "=" ? t.value : ">";
  else if (t.dataset.pa === "v") { var v = parseFloat(String(t.value).replace(",", ".")); if (!(v > 0)) { t.value = a.v; return; } a.v = v; }
  // setting it again, or changing it, makes it a fresh alert: it may tell you once more
  if (t.dataset.pa !== "on" || t.checked) { a.on = true; a.n = (a.n || 0) + 1; delete a.hit; delete PA_LAST[a.id]; }
  paSave(list);
  $("mBody").innerHTML = paHtml();
  priceAlerts();
});
function paAct(a, k) {
  if (a === "paopen") { paOpen(k || ""); return; }
  if (a === "padel") { paSave(PA().filter(function (x) { return x.id !== k; })); $("mBody").innerHTML = paHtml(); }
}

// ---- Your own events as an .ics file (Settings > Calendar), for Google Calendar, Outlook, Apple Calendar and the like ----
function icsEsc(t) { return String(t || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
function icsMake(list) {
  var z = function (ds) { return ds.replace(/-/g, ""); }, stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  var out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//OmniTree//Calendar//EN", "CALSCALE:GREGORIAN", "X-WR-CALNAME:OmniTree"];
  list.forEach(function (e) {
    if (!e || !/^\d{4}-\d\d-\d\d$/.test(String(e.d))) return;
    var tm = /^\d\d:\d\d$/.test(String(e.tm || "")) ? e.tm.replace(":", "") + "00" : "";
    out.push("BEGIN:VEVENT", "UID:" + String(e.id).replace(/[^\w-]/g, "") + "@omnitree", "DTSTAMP:" + stamp, "SUMMARY:" + icsEsc(e.t));
    // a time without a zone = "this time, wherever the calendar is", the way the event was typed in here
    if (tm) out.push("DTSTART:" + z(e.d) + "T" + tm, "DURATION:PT1H"); else out.push("DTSTART;VALUE=DATE:" + z(e.d));
    var freq = { d: "DAILY", w: "WEEKLY", m: "MONTHLY", y: "YEARLY", b: "YEARLY" }[e.rep];
    if (freq) out.push("RRULE:FREQ=" + freq + (e.iv > 1 ? ";INTERVAL=" + Math.floor(e.iv) : "") + (/^\d{4}-\d\d-\d\d$/.test(String(e.u || "")) ? ";UNTIL=" + z(e.u) + (tm ? "T235959" : "") : ""));
    if (freq && Array.isArray(e.x) && e.x.length) out.push("EXDATE" + (tm ? "" : ";VALUE=DATE") + ":" + e.x.filter(function (x) { return /^\d{4}-\d\d-\d\d$/.test(x); }).map(function (x) { return z(x) + (tm ? "T" + tm : ""); }).join(","));
    if (e.rem != null && isFinite(e.rem)) out.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + icsEsc(e.t), "TRIGGER:-PT" + Math.max(0, Math.round(e.rem)) + "M", "END:VALARM");
    out.push("END:VEVENT");
  });
  out.push("END:VCALENDAR");
  return out.join("\r\n") + "\r\n";
}
function icsExport() {
  var list = P.cal || [];
  if (!list.length) { icsMsg("You have no events of your own to export yet."); return; }
  var a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([icsMake(list)], { type: "text/calendar" }));
  a.download = "omnitree-calendar-" + new Date().toISOString().slice(0, 10) + ".ics";
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  icsMsg("Downloaded " + list.length + " event" + (list.length === 1 ? "" : "s") + ". Import the file in your other calendar.");
}

// ---- A box keeps its size while its search field is open ----
// The boxes are packed by their heights, so a box that grows by the height of a search field can send the boxes under it
// to other places. While the field of News, Telegram, Reddit, Sports or TV shows is open, the list under it is therefore made shorter by
// exactly the field's height (and held at that height, also when a search finds little or nothing).
var FLT_BOX = [["news", "newsQ"], ["telegram", "tgQ"], ["reddit", "rdQ"], ["sports", "spQ"], ["tv", "tvQ"]], FLT_H = {};
// before a redraw: how tall each of these lists is while its field is closed
function fltNote() {
  FLT_BOX.forEach(function (p) {
    if ($(p[1])) return;
    var l = document.querySelector('#grid .list[data-list="' + p[0] + '"]');
    FLT_H[p[0]] = l ? l.offsetHeight : 0;
  });
}
// after a redraw: with the field open, the list (or the "nothing found" line in its place) takes what is left of that height
function fltFit() {
  FLT_BOX.forEach(function (p) {
    var inp = $(p[1]), H = FLT_H[p[0]];
    if (!inp || !H) return;
    var card = inp.closest(".card"), l = card && card.querySelector(".list[data-list]"), em = card && card.querySelector(".empty");
    var h = Math.max(48, H - inp.offsetHeight - (parseFloat(getComputedStyle(inp).marginBottom) || 0));
    if (l) { l.style.height = h + "px"; l.style.maxHeight = h + "px"; }
    else if (em) { em.style.boxSizing = "border-box"; em.style.height = h + "px"; em.style.margin = "0"; em.style.overflow = "hidden"; }
  });
}
// ---- Reader: the posts of News, Telegram or Reddit one under another, each one in full, to scroll through ----
// Two ways in: a click on a post opens it at that post, and the button at the top of the box opens it at the oldest post
// you have not seen. P.reader = { click, cdir, bdir }: what a click on a post opens ("reader" or "one" = the single post),
// and which way scrolling DOWN goes after a click (cdir) and from the button (bdir): "old" = to older posts, "new" = to newer.
var RDR = null, RDR_T = { news: "News", tg: "Telegram", rd: "Reddit" };
function RDS() { var r = P.reader || {}; return { click: r.click === "one" ? "one" : "reader", cdir: r.cdir === "new" ? "new" : "old", bdir: r.bdir === "old" ? "old" : "new" }; }
function rdrBtn(box) {
  return '<button class="ib sm rdrb" data-a="rdropen" data-k="' + box + '" title="Read the posts one after another, from the oldest one you have not seen" aria-label="Read the posts one after another">' +
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h9M4 18h9M18 11v8M15 16l3 3 3-3"/></svg></button>';
}
// the posts of a box in the order the box lists them (all = also what a search in the box leaves out)
function rdrItems(box, all) {
  if (box === "news") {
    var gs = all ? newsGroups() : newsShown();
    return gs.slice(0, 300).map(function (g) { return { k: g[0].u, us: g.map(function (x) { return x.u; }), ts: g.t0 || g[0].ts, nw: g.every(function (x) { return isNewItem(x, "news") && !isRead(x.u); }), x: g }; });
  }
  var l = box === "tg" ? (all ? tgVisible() : tgShown()) : rdShown(all);
  return l.slice(0, 300).map(function (x) { return { k: x.u, us: [x.u], ts: x.ts, nw: isNewItem(x, box) && !isRead(x.u), x: x }; });
}
// Pictures load as you get near them, and a video loads nothing until it is in view or you press play
function rdrMedia(vid, img, th, cls) {
  vid = safeUrl(vid); th = safeUrl(th); img = safeUrl(img) || th;
  return vid ? '<video class="mvid" controls playsinline preload="none"' + (th ? ' poster="' + esc(th) + '"' : "") + ' src="' + esc(vid) + '"></video>'
    : img ? '<img class="mimg' + (cls || "") + '" loading="lazy" referrerpolicy="no-referrer" alt="" data-rm="1" src="' + esc(img) + '">' : "";
}
function rdrPost(box, it) {
  var x = it.x, h;
  if (box === "news") {
    var n = x[0];
    h = '<h2 class="mh">' + esc(n.t) + '</h2><div class="mut">' + esc(n.s) + " · " + when(n.ts) + "</div>" + rdrMedia("", n.img) + (n.d ? "<p>" + esc(n.d) + "</p>" : "") +
      (PREVIEW ? "" : '<p class="tools">' + linkBtn(n.u, "Read the full article") + '<button data-a="nsearch" data-k="' + esc(n.t) + '">Search other coverage</button>' + laterBtn("a:" + n.u) + "</p>") +
      (x.length > 1 ? '<details class="rdrsrc"><summary>' + x.length + " sources report this</summary>" + x.map(function (a) {
        var au = safeUrl(a.u);
        return '<div class="mi">' + (au ? '<a target="_blank" rel="noopener noreferrer" href="' + esc(au) + '">' + esc(a.t) + "</a>" : esc(a.t)) + '<small class="mut">' + esc(a.s) + " · " + when(a.ts) + "</small></div>";
      }).join("") + "</details>" : "");
  } else if (box === "tg") {
    h = '<div class="mut">' + esc(x.s) + " · " + when(x.ts) + "</div>" + rdrMedia(x.vid, x.img, x.th) + '<p class="nt">' + esc(x.tx || x.t) + '</p><p class="tools">' + linkBtn(x.u, "Open on Telegram") + laterBtn("m:" + x.u) + "</p>";
  } else {
    var com = !PREVIEW && rdComN();
    h = '<h2 class="mh">' + esc(x.t) + '</h2><div class="mut">r/' + esc(x.s) + (x.by ? " · " + esc(x.by) : "") + " · " + when(x.ts) + "</div>" + rdrMedia("", x.img, "", " rdimg") + (x.d ? '<p class="nt">' + esc(x.d) + "</p>" : "") +
      '<p class="tools">' + linkBtn(x.u, "Open comments on Reddit") + (x.x ? linkBtn(x.x, "Open the link") : "") + laterBtn("r:" + x.u) + (com && !RDR.com[x.u] ? '<button data-a="rdrcom" data-k="' + esc(x.u) + '">Top comments</button>' : "") + "</p>" +
      (com ? '<div class="rdcw" data-u="' + esc(x.u) + '">' + (RDR.com[x.u] ? '<p class="mut sn">Loading comments…</p>' : "") + "</div>" : "");
  }
  return '<article class="rdp' + (RDR.nw[it.k] ? " nw" : "") + '" data-u="' + esc(it.k) + '">' + h + "</article>";
}
// What stands at the two ends of the list: at the newest end that you are up to date, at the oldest end (Telegram) the
// button for older posts
function rdrEdge(top) {
  var R = RDR, oldEnd = top ? R.dir === "new" : R.dir === "old", h = "";
  if (!oldEnd) h = top ? "" : "You’re up to date.";
  else if (R.box === "tg" && !PREVIEW && USER && tgOldBusy) h = "Loading older posts…";
  else if (R.box === "tg" && !PREVIEW && USER && tgCanOlder()) h = '<button data-a="rdrolder">Load older posts</button>';
  else h = top ? "" : R.box === "tg" ? "No older posts." : "That is everything in this box.";
  return h + (PREVIEW && !top ? previewNote() : "");
}
function rdrHtml() {
  var R = RDR, L = R.list, cut = -1, i;
  // one line between what you have seen and what you have not
  if (R.dir === "new") { for (i = 0; i < L.length; i++) if (R.nw[L[i].k]) { cut = i; break; } }
  else for (i = L.length - 1; i >= 0; i--) if (R.nw[L[i].k]) { cut = i + 1; break; }
  var line = '<div class="rdrnew" id="rdrNew">' + (R.dir === "new" ? "New" : "Seen before") + "</div>";
  return '<div class="rdredge" id="rdrTop">' + rdrEdge(true) + "</div>" + L.map(function (it, j) { return (j === cut && j > 0 ? line : "") + rdrPost(R.box, it); }).join("") + '<div class="rdredge" id="rdrEnd">' + rdrEdge(false) + "</div>";
}
function rdrEl(key) {
  var ps = document.querySelectorAll("#rdrL .rdp");
  for (var i = 0; i < ps.length; i++) if (ps[i].dataset.u === key) return ps[i];
  return null;
}
// the button beside Close that says which way the list runs, and turns it around
function rdrSwitch() {
  var b = $("rdrSw");
  if (!RDR) { if (b) b.remove(); return; }
  if (!b) { b = document.createElement("button"); b.id = "rdrSw"; b.setAttribute("data-a", "rdrflip"); $("mClose").parentNode.insertBefore(b, $("mClose")); }
  var nw = RDR.dir === "new", say = "Scrolling down goes to " + (nw ? "newer" : "older") + " posts. Press to turn the list around.";
  b.textContent = nw ? "↓ Newer" : "↓ Older"; b.title = say; b.setAttribute("aria-label", say);
}
function rdrDraw(key, exact) {
  var R = RDR;
  if (R.ro) { R.ro.disconnect(); R.ro = null; }
  $("mBody").innerHTML = '<div class="rdr" id="rdrL" tabindex="-1">' + rdrHtml() + "</div>";
  rdrSwitch();
  var L = $("rdrL"), el = rdrEl(key), ln = $("rdrNew");
  if (el && !exact && ln && ln.nextElementSibling === el) el = ln;   // the "New" line stays in view above the first new post
  L.scrollTop = el && el.previousElementSibling && el.previousElementSibling.id !== "rdrTop" ? el.offsetTop : 0;
  R.last = L.scrollTop;
  L.addEventListener("scroll", rdrOnScroll, { passive: true });
  rdrWatch();
  Object.keys(R.com).forEach(function (u) { loadRdComments(u); });
  try { L.focus({ preventScroll: true }); } catch (e) {}
  rdrScan();
}
function openReader(box, u, btn) {
  var S = RDS(), all = false, base = rdrItems(box), at = -1;
  var find = function () { at = -1; base.forEach(function (x, i) { if (x.us.indexOf(u) >= 0) at = i; }); };
  if (!btn) { find(); if (at < 0 && boxQ(box)) { all = true; base = rdrItems(box, true); find(); } }
  if (!base.length || (!btn && at < 0)) return false;
  var dir = btn ? S.bdir : S.cdir, key = btn ? "" : base[at].k, nw = {}, have = {};
  if (btn) base = base.slice().sort(function (a, b) { return b.ts - a.ts; });
  if (dir === "new") base = base.slice().reverse();
  base.forEach(function (x) { if (x.nw) nw[x.k] = 1; x.us.forEach(function (q) { have[q] = 1; }); });
  if (btn) {
    // towards newer posts: start at the oldest one not seen (at the newest when all are seen). Towards older: at the newest.
    var un = base.filter(function (x) { return x.nw; });
    key = dir === "new" ? (un.length ? un[0] : base[base.length - 1]).k : base[0].k;
  }
  openModal(RDR_T[box], "");
  RDR = { box: box, dir: dir, all: all, list: base, nw: nw, have: have, last: 0, q: {}, com: {}, ro: null, raf: 0, t: 0 };
  if (!btn && box === "rd" && !PREVIEW && rdComN()) RDR.com[key] = 1;   // the post you clicked shows its comments at once, as its own window does
  rdrDraw(key);
  rdrRead([key]);
  return true;
}
function rdrFlip() {
  var R = RDR, L = $("rdrL");
  if (!R || !L) return;
  var cur = "", ps = L.querySelectorAll(".rdp");
  for (var i = 0; i < ps.length; i++) if (ps[i].offsetTop + ps[i].offsetHeight > L.scrollTop + 1) { cur = ps[i].dataset.u; break; }
  R.dir = R.dir === "new" ? "old" : "new"; R.list.reverse();
  rdrDraw(cur, true);
}
// Posts above the one you are reading change height when their pictures arrive. The list is moved by the same amount, so
// what you are reading stays where it is.
function rdrWatch() {
  var R = RDR, L = $("rdrL");
  if (!R || !L || !window.ResizeObserver) return;
  if (!R.ro) R.ro = new ResizeObserver(function (es) {
    var L2 = $("rdrL"), d = 0;
    if (!RDR || !L2) return;
    es.forEach(function (e) { var p = e.target, h = p.offsetHeight, was = p._h; p._h = h; if (was != null && was !== h && p.offsetTop + was <= L2.scrollTop + d + 1) d += h - was; });
    if (d) { L2.scrollTop += d; RDR.last += d; }
  });
  Array.prototype.forEach.call(L.querySelectorAll(".rdp"), function (p) { if (p._h == null) { p._h = p.offsetHeight; R.ro.observe(p); } });
}
function rdrOnScroll() { if (RDR && !RDR.raf) RDR.raf = setTimeout(function () { if (RDR) { RDR.raf = 0; rdrScan(); } }, 80); }
// A post counts as read once it has come into the upper half of the window (or the list has reached its end). A jump of
// several screens at once (End, the scroll bar) reads only where it lands, not everything it passed.
function rdrScan() {
  var R = RDR, L = $("rdrL");
  if (!R || !L) return;
  var top = L.scrollTop, ch = L.clientHeight, far = Math.abs(top - R.last) > ch * 3, lo = far ? top : Math.min(top, R.last), hi = (far ? top : Math.max(top, R.last)) + ch / 2, got = [];
  if (top + ch >= L.scrollHeight - 4) hi = top + ch;
  R.last = top;
  var ps = L.querySelectorAll(".rdp");
  for (var i = 0; i < ps.length; i++) {
    var p = ps[i], y = p.offsetTop, b = y + p.offsetHeight, v = p.querySelector("video");
    if (y < hi && b > lo && !p._rd) { p._rd = 1; got.push(p.dataset.u); }
    if (!v) continue;
    if (b > top && y < top + ch) { if (v.preload === "none" && !v.getAttribute("poster")) { v.preload = "metadata"; try { v.load(); } catch (e) {} } }
    else if (!v.paused) v.pause();   // a video you scrolled away from stops playing
  }
  if (got.length) rdrRead(got);
}
function rdrRead(keys) {
  var R = RDR;
  if (!R) return;
  keys.forEach(function (k) { var it = R.list.filter(function (x) { return x.k === k; })[0]; (it ? it.us : [k]).forEach(function (u) { if (!isRead(u)) R.q[u] = 1; }); });
  clearTimeout(R.t);
  R.t = setTimeout(rdrFlush, 500);
}
// what was read is written down in one go once the scrolling pauses, not post by post
function rdrFlush() {
  var R = RDR;
  if (!R) return;
  clearTimeout(R.t);
  var us = Object.keys(R.q), now = Date.now(), sr = sy().read;
  R.q = {};
  if (!us.length) return;
  us.forEach(function (u) { READ[u] = now; sr[hs(u)] = now; });
  syCap(sr, 300);
  var k = Object.keys(READ);
  if (k.length > 400) k.sort(function (a, b) { return READ[a] - READ[b]; }).slice(0, k.length - 400).forEach(function (x) { delete READ[x]; });
  save("sp_nread", READ);
  rdrSeenLine(R.box);
  persist(); render();
}
// Only the last few hundred opened posts are remembered one by one. So that a long read does not push older ones out of
// that memory (and make them count as new again), "seen up to here" of the box moves along: up to the oldest post that is
// still new, or to now when none is left.
function rdrSeenLine(box) {
  if (PREVIEW) return;
  var f = function (x) { return FIRST[x.u] || x.ts || 0; }, un = [], rd = [];
  if (box === "news") newsGroups().forEach(function (g) { var nw = g.every(function (x) { return isNewItem(x, "news") && !isRead(x.u); }); g.forEach(function (x) { (nw ? un : rd).push(x); }); });
  else (box === "tg" ? tgVisible() : RD.filter(function (x) { return shown("r:" + x.s.toLowerCase()); })).forEach(function (x) { (isNewItem(x, box) && !isRead(x.u) ? un : rd).push(x); });
  if (!un.length) { if (rd.some(function (x) { return isNewItem(x, box); })) markSeen(box); return; }
  var first = Math.min.apply(null, un.map(f)), t = 0;
  rd.forEach(function (x) { var v = f(x); if (v < first && v > t) t = v; });
  if (t > (NSEEN[box] || 0)) markSeen(box, t);
}
// Called at every redraw of the page: posts that arrived (or older ones that were loaded) while the reader is open join
// the list at the end they belong to, without moving what you are reading.
function rdrSync() {
  var R = RDR, L = $("rdrL");
  if (!R || !L) return;
  var fresh = rdrItems(R.box, R.all).filter(function (x) { return !x.us.some(function (u) { return R.have[u]; }); });
  if (fresh.length && R.list.length) {
    var minT = Math.min.apply(null, R.list.map(function (x) { return x.ts; })), up = R.dir === "new" ? 1 : -1;
    fresh.sort(function (a, b) { return (a.ts - b.ts) * up; });
    var older = fresh.filter(function (x) { return x.ts < minT; }), newer = fresh.filter(function (x) { return x.ts >= minT; });
    fresh.forEach(function (x) { if (x.nw) R.nw[x.k] = 1; x.us.forEach(function (q) { R.have[q] = 1; }); });
    var html = function (l) { return l.map(function (it) { return rdrPost(R.box, it); }).join(""); };
    var atTop = R.dir === "new" ? older : newer, atEnd = R.dir === "new" ? newer : older;
    if (atEnd.length) { $("rdrEnd").insertAdjacentHTML("beforebegin", html(atEnd)); R.list = R.list.concat(atEnd); }
    if (atTop.length) {
      var h0 = L.scrollHeight;
      $("rdrTop").insertAdjacentHTML("afterend", html(atTop)); R.list = atTop.concat(R.list);
      var d = L.scrollHeight - h0; L.scrollTop += d; R.last += d;
    }
    rdrWatch();
  }
  var set = function (id, h) { var el = $(id); if (el && el.getAttribute("data-h") !== h) { el.innerHTML = h; el.setAttribute("data-h", h); } };
  set("rdrTop", rdrEdge(true)); set("rdrEnd", rdrEdge(false));
}
// Reddit comments under a post in the reader, when you ask for them
function rdrCom(u) {
  if (!RDR) return;
  RDR.com[u] = 1;
  Array.prototype.forEach.call(document.querySelectorAll('#rdrL [data-a="rdrcom"]'), function (b) { if (b.dataset.k === u) b.remove(); });
  Array.prototype.forEach.call(document.querySelectorAll("#rdrL .rdcw"), function (b) { if (b.dataset.u === u && !b.innerHTML) b.innerHTML = '<p class="mut sn">Loading comments…</p>'; });
  loadRdComments(u);
}
// ↓ and ↑ (or J and K) go one post on or back. A post taller than the window is read in steps first.
function rdrStep(d) {
  var L = $("rdrL");
  if (!L) return;
  var ps = L.querySelectorAll(".rdp"), top = L.scrollTop, st = L.clientHeight * 0.85, i, y;
  if (d > 0) {
    for (i = 0; i < ps.length; i++) { y = ps[i].offsetTop; if (y > top + 40) { L.scrollTop = y > top + st ? top + st : y; return; } }
    L.scrollTop = L.scrollHeight;
  } else {
    for (i = ps.length - 1; i >= 0; i--) { y = ps[i].offsetTop; if (y < top - 40) { L.scrollTop = y < top - st ? top - st : y; return; } }
    L.scrollTop = 0;
  }
}
document.addEventListener("keydown", function (e) {
  if (!RDR || $("modal").hidden || e.ctrlKey || e.metaKey || e.altKey) return;
  var t = e.target, k = e.key, dn = k === "ArrowDown" || k === "j" || k === "J", up = k === "ArrowUp" || k === "k" || k === "K";
  if ((!dn && !up) || (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|VIDEO)$/.test(t.tagName)))) return;
  e.preventDefault(); rdrStep(dn ? 1 : -1);
});
function rdrOff() {
  if (RDR) { rdrFlush(); if (RDR.ro) RDR.ro.disconnect(); clearTimeout(RDR.raf); clearTimeout(RDR.t); }
  RDR = null; SITE = null; rdrSwitch();
}
// Settings > News, Telegram & Reddit > Reading posts
function setReader() { P.reader = { click: $("rdrClick").value, cdir: $("rdrCdir").value, bdir: $("rdrBdir").value }; persist(); }
["rdrClick", "rdrCdir", "rdrBdir"].forEach(function (id) { $(id).onchange = setReader; });
// ---- Search in News, Telegram and Reddit (the ⌕ button at the top of each box) ----
// Two steps. At once: everything the box has loaded (not only the rows it shows), in the headline or post text and the
// source name; every word you type must be there, in any order, and accents and capitals do not matter. A moment later the
// feeds function looks further back than the box reaches (News: the last 30 days on your own news sites; Telegram: the
// whole history of your channels; Reddit: the last year of your subreddits) and what it finds joins the list, newest first.
var FQ = { tg: "", rd: "" }, FON = { tg: false, rd: false }, FQT = {};
var FOUND = { news: { q: "", items: [], busy: false, err: "" }, tg: { q: "", items: [], busy: false, err: "" }, rd: { q: "", items: [], busy: false, err: "" } };
function sFold(s) { s = String(s || "").toLowerCase(); try { s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); } catch (e) {} return s; }
function sWords(q) { return sFold(q).split(/\s+/).filter(Boolean); }
function sHit(w, text) { var t = sFold(text); return w.every(function (x) { return t.indexOf(x) >= 0; }); }
function boxQ(box) { return box === "news" ? NQ : FQ[box] || ""; }
function foundFor(box) { var f = FOUND[box]; return f.q && f.q === boxQ(box) ? f.items : []; }
function tgAll() { return TGP.concat(FOUND.tg.items); }
function rdAll() { return RD.concat(FOUND.rd.items); }
function fBtn(box) { return '<button class="ib sm' + (FON[box] || FQ[box] ? " on" : "") + '" data-a="bfilt" data-k="' + box + '" title="Search the posts" aria-label="Search the posts">⌕</button>'; }
// the line at the end of a list while the search further back is running, or when it could not be done
function foundNote(box) {
  var q = boxQ(box), f = FOUND[box];
  if (!q || q.length < 3 || PREVIEW || !sb || !USER) return "";
  if (f.q !== q || f.busy) return '<div class="more mut">Searching further back…</div>';
  return f.err ? '<div class="more mut">Could not search further back: ' + esc(String(f.err).slice(0, 140)) + "</div>" : "";
}
// what each box lists: as usual, or (with a search typed) the matches among what is loaded plus what was found further back
function newsShown() {
  var gs = newsGroups();
  if (!NQ) return gs;
  var w = sWords(NQ), haveU = {}, haveT = {}, mute = wordList(NW().mute);
  gs = gs.filter(function (g) { return g.some(function (n) { return sHit(w, n.t + " " + n.s + " " + (n.d || "")); }); });
  gs.forEach(function (g) { g.forEach(function (n) { haveU[n.u] = 1; haveT[sFold(n.t)] = 1; }); });
  var more = foundFor("news").filter(function (n) { var t = sFold(n.t); if (haveU[n.u] || haveT[t] || (mute.length && hasWord(n.t, mute))) return false; haveT[t] = 1; return true; }).map(function (n) { return [n]; });
  return gs.concat(more).sort(function (a, b) { return (b.t0 || b[0].ts) - (a.t0 || a[0].ts); });
}
function tgShown() {
  var l = tgVisible(), q = FQ.tg;
  if (!q) return l;
  var w = sWords(q), have = {}, mute = wordList(NW().mute);
  l = l.filter(function (g) { return sHit(w, g.s + " " + (g.tx || g.t)); });
  l.forEach(function (g) { have[g.u] = 1; });
  return l.concat(foundFor("tg").filter(function (g) { if (have[g.u] || !shown("g:" + g.s) || (mute.length && hasWord(g.tx || g.t, mute))) return false; have[g.u] = 1; return true; })).sort(function (a, b) { return b.ts - a.ts; });
}
function rdShown(all) {
  var l = RD.filter(function (x) { return shown("r:" + x.s.toLowerCase()); }), q = all ? "" : FQ.rd;
  if (!q) return rdSort() === "new" ? l.slice().sort(function (a, b) { return b.ts - a.ts; }) : l;
  var w = sWords(q), have = {};
  l = l.filter(function (x) { return sHit(w, x.t + " " + x.s + " " + (x.d || "")); });
  l.forEach(function (x) { have[x.u] = 1; });
  return l.concat(foundFor("rd").filter(function (x) { if (have[x.u] || !shown("r:" + String(x.s).toLowerCase())) return false; have[x.u] = 1; return true; })).sort(function (a, b) { return b.ts - a.ts; });
}
// the websites of your news sources, for the search further back (a source set up as a site search names its site itself)
function newsSites() {
  var out = [];
  newsSrc().forEach(function (x) {
    if (!shown("n:" + x.name)) return;
    var d = "", us = x.urls || [];
    us.forEach(function (u) { var m = /site(?::|%3A)([a-z0-9.-]+\.[a-z]{2,})/i.exec(u); if (m && !d) d = m[1]; });
    if (!d) us.some(function (u) { try { var h = new URL(u).hostname; if (!/(google|bing|yahoo|gdeltproject)\./.test(h)) d = h.replace(/^(www|rss|feeds?|rssfeeds|api|news)\./i, ""); } catch (e) {} return !!d; });
    d = d.toLowerCase();
    if (d === "bbci.co.uk") d = "bbc.com";
    if (d && out.indexOf(d) < 0) out.push(d);
  });
  return out.slice(0, 15);
}
function findOlder(box) {
  var q = boxQ(box), f = FOUND[box];
  clearTimeout(FQT[box]);
  if (!q || q.length < 3 || PREVIEW || !sb || !USER) return;
  if (f.q === q && (f.busy || f.done)) return;
  f.q = q; f.items = []; f.busy = true; f.done = false; f.err = "";
  render();
  var ask = { box: box, q: q };
  if (box === "news") { ask.sites = newsSites(); ask.langs = langList().slice(0, 2); }
  else if (box === "tg") ask.src = tgSrc().filter(function (n) { return shown("g:" + n); });
  else ask.src = rdSrc().filter(function (n) { return shown("r:" + n.toLowerCase()); });
  var end = function (items, err) {
    if (f.q !== q) return;   // you typed on in the meantime: that search has its own answer coming
    f.busy = false; f.done = true; f.err = err || ""; f.items = items || [];
    render();
  };
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { find: ask } }).then(function (r) {
    var v = r.data && r.data.find;
    if (r.error) end([], r.error.message);
    else if (!v) end([], "it needs the updated feeds function (redeploy super-function in Supabase)");
    else end(cleanLinks(unentAll((v.items || []).filter(function (x) { return x && x.u && x.t && x.ts; }), ["t", "tx", "d"])), v.err);
  }).catch(function (e) { end([], String((e && e.message) || e)); });
}
function findSoon(box) { clearTimeout(FQT[box]); FQT[box] = setTimeout(function () { findOlder(box); }, 500); }
// Enter searches further back at once, without waiting for the typing to pause
document.addEventListener("keydown", function (e) {
  var id = e.target && e.target.id, box = id === "newsQ" ? "news" : id === "tgQ" ? "tg" : id === "rdQ" ? "rd" : "";
  if (!box || e.key !== "Enter") return;
  e.preventDefault();
  var v = e.target.value.trim().slice(0, 80);
  if (box === "news") NQ = v.toLowerCase(); else FQ[box] = v;
  clearTimeout(searchTimers[id]);
  render(); findOlder(box);
});
// ---- Command words of the search bar (Settings > Search bar): the word a line starts with to search all boxes, save a
// note or a to-do, translate, or open the bar's own help. P.cmd = { ss, note, todo, tr, help }, each letters and digits.
// P.ssKey: the key that, held with Enter, searches all boxes without the word ("shift", "alt" or "off"). ----
var CMD_DEF = { ss: "ss", note: "note", todo: "todo", tr: "tr", help: "help" };
var CMD_IDS = [["cmdSs", "ss"], ["cmdNote", "note"], ["cmdTodo", "todo"], ["cmdTr", "tr"], ["cmdHelp", "help"]];
function cmdW(k) { var v = P.cmd && P.cmd[k]; return typeof v === "string" && /^[a-z0-9]{1,12}$/.test(v) ? v : CMD_DEF[k]; }
function ssKey() { return P.ssKey === "alt" || P.ssKey === "off" ? P.ssKey : "shift"; }
function ssKeyName() { return ssKey() === "alt" ? "Alt+Enter" : ssKey() === "off" ? "" : "Shift+Enter"; }
function siteAsk(q) { var m = new RegExp("^" + cmdW("ss") + "\\s+(\\S.*)$", "i").exec(String(q || "").trim()); return m ? m[1].trim().slice(0, 80) : ""; }
function renderCmd() {
  if (!$("cmdSs")) return;
  CMD_IDS.forEach(function (c) { $(c[0]).value = cmdW(c[1]); });
  $("ssKeySel").value = ssKey();
}
function cmdSet(id, key) {
  var v = $(id).value.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) || CMD_DEF[key], clash = "";
  CMD_IDS.forEach(function (c) { if (c[1] !== key && cmdW(c[1]) === v) clash = c[1]; });
  if (v === "translate" && key !== "tr") clash = "tr";
  if (clash) { $("cmdMsg").textContent = "“" + v + "” is already the word for another command. Choose a different one."; renderCmd(); return; }
  P.cmd = Object.assign({}, P.cmd || {}); P.cmd[key] = v;
  if (v === CMD_DEF[key]) delete P.cmd[key];
  persist(); renderCmd(); renderKeys();
  $("cmdMsg").textContent = "Saved. Type “" + v + (key === "help" ? "”" : " …”") + " in the search bar.";
}
CMD_IDS.forEach(function (c) { $(c[0]).onchange = function () { cmdSet(c[0], c[1]); }; });
$("ssKeySel").onchange = function () { P.ssKey = this.value; persist(); $("cmdMsg").textContent = "Saved."; };
$("cmdReset").onclick = function () { delete P.cmd; delete P.ssKey; persist(); renderCmd(); renderKeys(); $("cmdMsg").textContent = "Back to the standard words."; };

// ---- Search all boxes: one question, asked of everything on the page ----
// "ss <words>" in the search bar (or Shift+Enter on what is typed). A window lists what was found, box by box, and the
// boxes that have a search of their own (News, Telegram, Reddit, Sports) show the same search at the same time. News,
// Telegram and Reddit are also searched further back than they have loaded, exactly as their own search does.
var SITE = null, SITE_T = "Search all boxes", SITE_N = 5;
function sRow(act, key, main, sub, right, href, nw) {
  var m = href ? '<a class="lnk" ' + (nw === false ? "" : 'target="_blank" rel="noopener noreferrer" ') + 'href="' + esc(href) + '">' + main + "</a>" : '<button class="lnk" data-a="' + act + '" data-k="' + esc(key) + '">' + main + "</button>";
  return '<div class="row"><span>' + m + (sub ? " <small>" + esc(sub) + "</small>" : "") + '</span><span class="r mut">' + (right || "") + "</span></div>";
}
function siteGroups(q) {
  var w = sWords(q), G = [], hit = function (t) { return sHit(w, t); }, cut = function (t, n) { t = String(t || "").replace(/\s+/g, " ").trim(); return esc(t.length > n ? t.slice(0, n - 1) + "…" : t); };
  var add = function (id, name, rows, note) { if (rows.length || note) G.push({ id: id, name: name, rows: rows, note: note || "" }); };
  if (!w.length) return G;
  if (!boxOff("news")) add("news", "News", newsShown().map(function (g) { var n = g[0]; return sRow("open", "a:" + n.u, cut(n.t, 160), (g.src || g.map(function (x) { return x.s; })).slice(0, 2).join(" · "), ago(g.t0 || n.ts)); }), foundNote("news"));
  if (!boxOff("telegram")) add("tg", "Telegram", tgShown().map(function (g) { return sRow("open", "m:" + g.u, cut(g.tx || g.t, 160), g.s, ago(g.ts)); }), foundNote("tg"));
  if (!boxOff("reddit")) add("rd", "Reddit", rdShown().map(function (x) { return sRow("open", "r:" + x.u, cut(x.t, 160), "r/" + x.s, ago(x.ts)); }), foundNote("rd"));
  if (!boxOff("sports")) add("sports", "Sports", (SPQ ? spEvents() : []).map(function (e) {
    var t = e.kind === "team" && e.home && e.away ? e.home.n + (e.state === "pre" ? " – " : " " + (e.home.s != null ? e.home.s : "") + "–" + (e.away.s != null ? e.away.s : "") + " ") + e.away.n : e.title;
    return sRow("open", "p:" + e.id, cut(t, 120), e.lg, spWhen(e, true).replace(/<[^>]+>/g, ""));
  }));
  if (!boxOff("stocks")) add("stocks", "Stocks", (P.stocks || DATA.stocks).filter(function (x) { return shown("s:" + x.id) && hit(x.id + " " + tk(x.id) + " " + (x.name || "")); }).map(function (x) {
    var qt = QUOTES[tk(x.id)];
    return sRow("open", "s:" + x.id, esc(tk(x.id)), x.name || "", qt && qt.c != null ? (qt.c >= 0 ? "+" : "") + qt.c.toFixed(2) + "%" : "");
  }));
  if (!boxOff("tv")) add("tv", "TV shows", tvShows().filter(function (s) { return hit(s.n); }).map(function (s) { return sRow("tvopen", String(s.id), cut(s.n, 120), "", ""); }));
  if (!boxOff("youtube")) add("yt", "YouTube", (YTV || []).filter(function (v) { return shown("y:" + v.n) && hit(v.t + " " + v.n); }).map(function (v) { return sRow("open", "v:" + v.id, cut(v.t, 140), v.n, ago(v.ts)); }));
  if (!boxOff("twitch")) add("tw", "Twitch", (TWC ? TW || [] : []).filter(function (x) { return hit((x.name || "") + " " + x.id + " " + (x.sub || "") + " " + (x.title || "")); }).map(function (x) { return sRow("open", "t:" + x.id, cut(x.name || x.id, 60), x.sub || "", (+x.v || 0).toLocaleString("en-GB") + " watching"); }));
  add("notes", "Notes and to-dos", (P.notes || []).filter(function (n) { return hit(n.t); }).map(function (n) { return sRow("opennotes", "", cut(n.t, 160), n.todo ? (n.done ? "to-do, done" : "to-do") : "note", ""); }));
  var seenEv = {};
  add("cal", "Calendar", (P.cal || []).concat(icsEvs()).filter(function (e) { var k = e.t + "|" + e.d; if (!e.t || !e.d || seenEv[k] || !hit(e.t)) return false; seenEv[k] = 1; return true; }).sort(function (a, b) { return String(b.d).localeCompare(String(a.d)); })
    .map(function (e) { return sRow("sitecal", e.d, cut(e.t, 140), e.rep ? REPS[e.rep] || "" : "", dayLabel(e.d) + " " + String(e.d).slice(0, 4)); }));
  var links = [];
  bm().items.forEach(function (x) { if (x.kids) x.kids.forEach(function (k) { links.push({ t: k.t, u: k.u, f: x.t }); }); else links.push({ t: x.t, u: x.u, f: "" }); });
  add("bm", "Bookmarks", links.filter(function (x) { return safeUrl(x.u) && hit((x.t || "") + " " + x.u); }).map(function (x) { return sRow("", "", cut(x.t || x.u, 100), x.f, "", safeUrl(x.u), bm().nw); }));
  add("later", "Read later", laterList().filter(function (x) { return hit((x.t || "") + " " + (x.s || "")); }).map(function (x) { return sRow("lateropen", x.id, cut(x.t, 160), x.s, ""); }));
  var mails = [];
  (MAIL || []).forEach(function (m, i) { if (m && !m.error) (m.items || []).forEach(function (x) { if (hit((x.from || "") + " " + (x.subject || "") + " " + (x.snippet || ""))) mails.push(sRow("mail", String(i), cut(x.subject || "(no subject)", 120), String(x.from || "").replace(/<.*>/, "").replace(/"/g, "").trim(), ago(x.ts))); }); });
  add("mail", "Mail", mails);
  var secs = [];
  Array.prototype.forEach.call(document.querySelectorAll("#panel .setgrp"), function (g, i) {
    if (g.dataset.admin && !isAdmin()) return;
    var kw = Array.prototype.map.call(g.querySelectorAll("[data-kw]"), function (el) { return el.dataset.kw; }).join(" ");
    var words = Array.prototype.map.call(g.querySelectorAll("label, .sub > b"), function (el) { return el.textContent; }).join(" ");
    if (secs.length < 8 && hit(g.dataset.sec + " " + words + " " + kw)) secs.push(sRow("sitesec", String(i), esc(g.dataset.sec), hit(g.dataset.sec) ? "" : "mentions it", ""));
  });
  add("set", "Settings", secs);
  return G;
}
function siteHtml() {
  var S = SITE, G = siteGroups(S.q), n = 0, web = safeUrl(searchUrl(S.q));
  G.forEach(function (g) { n += g.rows.length; });
  var inBox = NQ || FQ.tg || FQ.rd || SPQ;
  return '<p class="mut sn sitesum">' + (n ? n + (n === 1 ? " hit in " : " hits in ") + G.filter(function (g) { return g.rows.length; }).length + (G.filter(function (g) { return g.rows.length; }).length === 1 ? " place" : " places") + "." : "Nothing on the page matches.") +
    (inBox ? ' <button class="lnk2" data-a="siteclear">Clear the search in the boxes</button>' : "") + (web ? ' <a class="lnk2" target="_blank" rel="noopener noreferrer" href="' + esc(web) + '">Search the web instead</a>' : "") + "</p>" +
    G.map(function (g) {
      var all = S.open[g.id], rows = all ? g.rows.slice(0, 80) : g.rows.slice(0, SITE_N);
      return "<h3>" + g.name + (g.rows.length ? ' <span class="mut">' + g.rows.length + "</span>" : "") + "</h3>" + rows.join("") +
        (g.rows.length > SITE_N ? '<button class="sitemore" data-a="sitemore" data-k="' + g.id + '">' + (all ? "Show fewer" : "Show all " + g.rows.length) + "</button>" : "") + g.note.replace('class="more mut"', 'class="mut sn"');
    }).join("");
}
// the boxes that have a search of their own run the same search, and their fields show it
function siteApply() {
  var q = SITE.q, lo = q.toLowerCase();
  NQ = lo; NFILT = true; FQ.tg = q; FON.tg = true; FQ.rd = q; FON.rd = true; SPQ = lo; SPFIND = true;
  render();
  [["newsQ", lo], ["tgQ", q], ["rdQ", q], ["spQ", lo]].forEach(function (p) { if ($(p[0])) $(p[0]).value = p[1]; });
  ["news", "tg", "rd"].forEach(findOlder);
  fetchSports();
}
function openSite(q) {
  q = String(q || "").replace(/\s+/g, " ").trim().slice(0, 80);
  if (!q) return;
  openModal(SITE_T, "");
  SITE = { q: q, open: {} };
  $("mBody").innerHTML = '<div class="site"><input type="search" id="siteQ" value="' + esc(q) + '" placeholder="Search all boxes…" aria-label="Search all boxes"><div id="siteRes"></div></div>';
  siteApply();
  siteSync();
}
function siteSync() {
  var el = $("siteRes");
  if (!SITE || !el) return;
  var h = siteHtml();
  if (el.getAttribute("data-h") !== h) { el.innerHTML = h; el.setAttribute("data-h", h); }
}
function siteClear() { NQ = ""; NFILT = false; FQ.tg = ""; FON.tg = false; FQ.rd = ""; FON.rd = false; SPQ = ""; SPFIND = false; render(); siteSync(); }
function siteAct(a, k) {
  if (a === "sitemore") { if (SITE) { SITE.open[k] = !SITE.open[k]; siteSync(); } return; }
  if (a === "siteclear") { siteClear(); return; }
  if (a === "sitecal") { CALV = { y: +k.slice(0, 4), m: +k.slice(5, 7) - 1, sel: k }; openCal(); return; }
  if (a === "sitesec") { closeModal(); $("panel").hidden = false; setSec(+k); return; }
}
document.addEventListener("input", function (e) {
  if (e.target.id !== "siteQ") return;
  debounced("siteQ", function () { if (!SITE || !$("siteQ")) return; var v = $("siteQ").value.replace(/\s+/g, " ").trim().slice(0, 80); if (!v) { siteClear(); SITE.q = ""; siteSync(); return; } SITE.q = v; SITE.open = {}; siteApply(); siteSync(); });
});

// ---- Twitch Discover: live streams and channels you do not follow (the compass button at the top of the Twitch box) ----
// Read straight from Twitch with the connection the box already has: the biggest streams right now, the biggest
// categories, the streams of one category ten at a time, and a search for a channel or a game. Every answer is kept for a
// minute, and nothing is asked before the window is opened. ☆ puts a channel on your own list: it then shows in the box
// when it is live (and among your ★ streamers when it is not), without following it on Twitch.
var TWD_T = "Discover on Twitch", TWDC = {}, TWDS = {};
var TWD = { cat: "", catName: "", q: "", list: [], cur: "", more: false, busy: false, err: "", cats: [], catCur: "", fcats: [], n: 0 };
var TWD_LANGS = [["", "Any language"], ["en", "English"], ["sv", "Swedish"], ["no", "Norwegian"], ["da", "Danish"], ["fi", "Finnish"], ["et", "Estonian"], ["de", "German"], ["fr", "French"], ["es", "Spanish"], ["it", "Italian"], ["pt", "Portuguese"], ["nl", "Dutch"], ["pl", "Polish"], ["tr", "Turkish"], ["ru", "Russian"], ["uk", "Ukrainian"], ["ja", "Japanese"], ["ko", "Korean"], ["zh", "Chinese"], ["ar", "Arabic"]];
function twdLang() { var l = P.twd && P.twd.lang; return TWD_LANGS.some(function (x) { return x[0] === l; }) ? l : ""; }
function twdBtn() {
  return '<button class="ib sm twdb" data-a="twdopen" title="Discover: live streams and channels you do not follow" aria-label="Discover on Twitch"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg></button>';
}
function twdGet(path) {
  var c = TWDC[path];
  if (c && Date.now() - c.t < 60000) return Promise.resolve(c.v);
  return twGet(path, twToken()).then(function (j) {
    TWDC[path] = { t: Date.now(), v: j };
    var ks = Object.keys(TWDC);
    if (ks.length > 80) ks.sort(function (a, b) { return TWDC[a].t - TWDC[b].t; }).slice(0, ks.length - 80).forEach(function (k) { delete TWDC[k]; });
    return j;
  });
}
function twdStream(x) { return { id: x.user_login, name: x.user_name, sub: x.game_name, v: x.viewer_count, title: x.title, th: x.thumbnail_url, st: Date.parse(x.started_at), live: 1 }; }
function twdOpen() { return !$("modal").hidden && $("mTitle").textContent === TWD_T; }
function twdRow(x) {
  var fav = !!P.fav["t:" + x.id], off = x.live === false, vv = x.v == null ? "" : x.v >= 1000 ? (x.v / 1000).toFixed(1) + "k" : String(x.v);
  return '<div class="row twdr' + (off ? " twoff" : "") + '"><span><button class="lnk" data-a="twdwatch" data-k="' + esc(x.id) + '"><span class="dot' + (off ? " off" : "") + '"></span>' + esc(x.name || x.id) + (x.sub && !(TWD.cat && !TWD.q) ? " <small>" + esc(x.sub) + "</small>" : "") +
    (x.title ? '<small class="twdt">' + esc(x.title) + "</small>" : "") + '</button></span><span class="r"><span class="mut">' + (off ? "offline" : vv) + '</span><button class="twdf' + (fav ? " on" : "") + '" data-a="twdfav" data-k="' + esc(x.id) + '" title="' + (fav ? "On your list. Click to take it off" : "Put this channel on your list: it shows in the Twitch box when it is live") + '" aria-label="' + (fav ? "Take off your list" : "Put on your list") + '">' + (fav ? "★" : "☆") + "</button></span></div>";
}
function twdCatsHtml() {
  var chip = function (id, name, on) { return '<button class="twdc' + (on ? " on" : "") + '" data-a="twdcat" data-k="' + esc(id) + '">' + esc(name) + "</button>"; };
  if (TWD.q) return TWD.fcats.map(function (c) { return chip(c.id, c.name, false); }).join("");
  var cats = TWD.cats.slice();
  if (TWD.cat && !cats.some(function (c) { return c.id === TWD.cat; })) cats.unshift({ id: TWD.cat, name: TWD.catName });
  return chip("", "Top live", !TWD.cat) + cats.map(function (c) { return chip(c.id, c.name, c.id === TWD.cat); }).join("") + (TWD.catCur && TWD.cats.length < 100 ? '<button class="twdc mut" data-a="twdmorecat">More categories…</button>' : "");
}
function twdListHtml() {
  var head = TWD.q ? "Channels matching “" + esc(TWD.q) + "”" : TWD.cat ? esc(TWD.catName) : "Top live now";
  return "<h3>" + head + "</h3>" + TWD.list.map(twdRow).join("") +
    (TWD.busy ? '<p class="mut sn">Loading…</p>' : TWD.err ? '<p class="mut sn">Twitch did not answer: ' + esc(TWD.err) + "</p>" : !TWD.list.length ? '<p class="mut sn">' + (TWD.q ? "No channel found." : "Nobody is live here" + (twdLang() ? " in this language" : "") + " right now.") + "</p>" : TWD.more ? '<button class="sitemore" data-a="twdmore">Show 10 more</button>' : "");
}
function twdHtml() {
  if (!window.TWITCH_CLIENT_ID || !twToken()) return '<div class="twd"><p>Discover shows the biggest live streams and lets you search for any channel or game, also ones you do not follow. It reads them from Twitch with your own Twitch connection, so connect your Twitch account first.</p>' + (window.TWITCH_CLIENT_ID && !PREVIEW ? '<p class="tools"><button class="pri" data-a="twConnect">Connect Twitch</button></p>' : PREVIEW ? previewNote() : "") + "</div>";
  return '<div class="twd"><div class="twdtop"><input type="search" id="twdQ" placeholder="Search a channel or a game…" aria-label="Search a channel or a game" value="' + esc(TWD.q) + '"><select id="twdLang" aria-label="Language of the streams">' + opts(TWD_LANGS, twdLang()) + '</select></div><div id="twdCats" class="twdcats' + (TWD.all ? " all" : "") + '">' + twdCatsHtml() + '</div><button class="lnk2 twdall" id="twdAll" data-a="twdall">' + twdAllTxt() + '</button><div id="twdList">' + twdListHtml() + "</div></div>";
}
// the categories take two lines until you ask for all of them
function twdAllTxt() { return TWD.all ? "Fewer categories ▴" : "All categories ▾"; }
function twdDraw() {
  if (!twdOpen() || !$("twdList")) return;
  $("twdCats").innerHTML = twdCatsHtml(); $("twdCats").classList.toggle("all", !!TWD.all); $("twdList").innerHTML = twdListHtml();
  $("twdAll").textContent = twdAllTxt(); $("twdAll").hidden = !!TWD.q;
}
function twdFail(e) { if (e && e.message === "expired") { twDisconnect(); if (twdOpen()) $("mBody").innerHTML = twdHtml(); return; } TWD.busy = false; TWD.err = String((e && e.message) || e || "no answer").slice(0, 120); twdDraw(); }
function twdCats() {
  twdGet("games/top?first=20" + (TWD.catCur ? "&after=" + encodeURIComponent(TWD.catCur) : "")).then(function (j) {
    var have = {};
    TWD.cats.forEach(function (c) { have[c.id] = 1; });
    (j.data || []).forEach(function (g) { if (!have[g.id]) { have[g.id] = 1; TWD.cats.push({ id: String(g.id), name: String(g.name) }); } });
    TWD.catCur = (j.pagination && j.pagination.cursor) || "";
    twdDraw();
  }).catch(function () {});
}
function twdLoad(reset) {
  var n = ++TWD.n, q = TWD.q, lang = twdLang();
  if (reset) { TWD.list = []; TWD.cur = ""; TWD.more = false; }
  TWD.busy = true; TWD.err = ""; twdDraw();
  var late = function () { return n !== TWD.n; }, done = function () { TWD.busy = false; TWD.list.forEach(function (x) { TWDS[x.id] = x; }); twdDraw(); };
  if (q) {
    var eq = encodeURIComponent(q);
    Promise.all([twdGet("search/channels?first=12&query=" + eq), twdGet("search/categories?first=6&query=" + eq).catch(function () { return { data: [] }; })]).then(function (r) {
      if (late()) return;
      TWD.fcats = (r[1].data || []).map(function (g) { return { id: String(g.id), name: String(g.name) }; });
      TWD.list = (r[0].data || []).map(function (c) { return { id: c.broadcaster_login, name: c.display_name, sub: c.game_name, title: c.is_live ? c.title : "", live: !!c.is_live, st: Date.parse(c.started_at) || 0 }; })
        .sort(function (a, b) { return (b.live ? 1 : 0) - (a.live ? 1 : 0); });
      var on = TWD.list.filter(function (x) { return x.live; });
      if (!on.length) { done(); return; }
      // the search does not say how many are watching: one more question for the channels that are live
      return twdGet("streams?first=100&" + on.map(function (x) { return "user_login=" + encodeURIComponent(x.id); }).join("&")).then(function (s) {
        if (late()) return;
        var by = {};
        (s.data || []).forEach(function (x) { by[x.user_login] = x; });
        TWD.list.forEach(function (x) { if (by[x.id]) { x.v = by[x.id].viewer_count; x.th = by[x.id].thumbnail_url; } });
        TWD.list.sort(function (a, b) { return (b.live ? 1 : 0) - (a.live ? 1 : 0) || (b.v || 0) - (a.v || 0); });
        done();
      }).catch(function () { if (!late()) done(); });
    }).catch(function (e) { if (!late()) twdFail(e); });
    return;
  }
  twdGet("streams?first=10" + (TWD.cat ? "&game_id=" + encodeURIComponent(TWD.cat) : "") + (lang ? "&language=" + lang : "") + (TWD.cur ? "&after=" + encodeURIComponent(TWD.cur) : "")).then(function (j) {
    if (late()) return;
    var have = {}, rows = (j.data || []).map(twdStream);
    TWD.list.forEach(function (x) { have[x.id] = 1; });
    TWD.list = TWD.list.concat(rows.filter(function (x) { return !have[x.id]; }));
    TWD.cur = (j.pagination && j.pagination.cursor) || "";
    TWD.more = !!TWD.cur && rows.length >= 10 && TWD.list.length < 100;
    done();
  }).catch(function (e) { if (!late()) twdFail(e); });
}
function openDiscover() {
  openModal(TWD_T, twdHtml());
  if (!window.TWITCH_CLIENT_ID || !twToken()) return;
  if (!TWD.cats.length) twdCats();
  twdLoad(true);
}
function twdAct(a, k) {
  if (a === "twdopen") { openDiscover(); return; }
  if (a === "twdmore") { twdLoad(false); return; }
  if (a === "twdmorecat") { twdCats(); return; }
  if (a === "twdall") { TWD.all = !TWD.all; twdDraw(); return; }
  if (a === "twdcat") {
    var c = TWD.cats.concat(TWD.fcats).filter(function (x) { return x.id === k; })[0];
    TWD.cat = k || ""; TWD.catName = c ? c.name : ""; TWD.q = ""; TWD.fcats = [];
    if ($("twdQ")) $("twdQ").value = "";
    twdLoad(true); return;
  }
  if (a === "twdwatch") { watchTwitch(k); return; }
  if (a === "twdfav") {
    if (P.fav["t:" + k]) delete P.fav["t:" + k]; else { P.fav["t:" + k] = true; delete P.hidden["t:" + k]; var s = TWDS[k]; if (s) { var o = TWOFF[k] = TWOFF[k] || {}; o.n = s.name || k; save("sp_twoff", TWOFF); } }
    persist(); twdDraw(); render(); fetchTwitch();
  }
}
document.addEventListener("input", function (e) {
  if (e.target.id !== "twdQ") return;
  debounced("twdQ", function () { if (!$("twdQ")) return; var v = $("twdQ").value.replace(/\s+/g, " ").trim().slice(0, 60); if (v === TWD.q) return; TWD.q = v.length >= 2 ? v : ""; TWD.fcats = []; twdLoad(true); });
});
document.addEventListener("change", function (e) {
  if (e.target.id !== "twdLang") return;
  P.twd = { lang: e.target.value }; persist(); twdLoad(true);
});
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
  $("boxList").innerHTML = ALL_IDS.filter(function (id) { return id !== "menu" && !isEmb(id); }).map(function (id) {
    return "<label>" + BOX_NAMES[id] + ' <input type="checkbox" data-a="boxtoggle" data-k="' + id + '"' + (boxOff(id) ? "" : " checked") + "></label>";
  }).join("");
}
// ---- Whole boxes can be switched off (Edit mode: Hide; Settings > Layout brings them back) ----
var BOX_NAMES = { weather: "Weather", mail: "Mail", live: "Radio", menu: "Menu", news: "News", telegram: "Telegram", twitch: "Twitch", youtube: "YouTube", stocks: "Stocks", reddit: "Reddit", sports: "Sports", tv: "TV shows" };
function boxOff(id) { if (isEmb(id)) return !embOn(id); if (id === "tv") return !(P.tv && P.tv.on); var L = P.layout; return id !== "menu" && !!(L && L.off && L.off[id]); }
function setBoxOff(id, off) {
  if (id === "tv") { tvp().on = !off; if (!off && !LAY().fs.tv) LAY().fs.tv = 0.9;   // the same starting text size as the other list boxes
    persist(); render(); renderTvSet(); if (!off) fetchTv(true); return; }
  if (isEmb(id)) { P.emb = P.emb && typeof P.emb === "object" ? P.emb : {}; P.emb[id] = Object.assign({}, emb(id), { on: !off }); persist(); render(); renderEmbSet(); return; }
  var L = LAY();
  L.off = L.off || {};
  if (off) L.off[id] = 1; else delete L.off[id];
  persist(); render();
  if (!off && REFRESH[id]) REFRESH[id]();
}

// ---- Details window ----
// What opened a window decides what happens to the focus when it closes:
//  - opened with the mouse or a tap: the row lets go of the focus, so no outline is left around it (also not after Esc);
//  - opened with the keyboard (Tab to a row, then Enter): the focus goes back to that row, so you carry on where you were.
// The page is redrawn while a window is open, so the row is remembered by what it opens, not as the element itself.
var KEYNAV = false, MOPEN = null;
document.addEventListener("keydown", function (e) { if (e.key === "Tab" || e.key === "Enter" || e.key === " " || /^Arrow/.test(e.key)) KEYNAV = true; }, true);
document.addEventListener("pointerdown", function () { KEYNAV = false; }, true);
function openModal(title, html) {
  rdrOff();   // a reader that was open notes what was read, and gives up its button beside Close
  if ($("modal").hidden) {
    var el = document.activeElement, inWin = el && el.closest && (el.closest("#modal") || el.closest("#panel"));
    MOPEN = el && el !== document.body && !inWin ? { key: KEYNAV, el: el, a: el.getAttribute("data-a"), k: el.getAttribute("data-k") } : null;
  }
  $("mTitle").textContent = title; $("mBody").innerHTML = html; $("modal").hidden = false;
}
function closeModal() {
  var was = !$("modal").hidden, o = MOPEN;
  rdrOff();
  $("modal").hidden = true; $("mBody").innerHTML = "";
  MOPEN = null;
  if (!was || !$("panel").hidden) return;
  var act = document.activeElement, typing = act && /^(INPUT|TEXTAREA|SELECT)$/.test(act.tagName);
  if (o && o.key) {
    var back = o.el && document.contains(o.el) ? o.el : null;
    if (!back && o.a) { var all = document.querySelectorAll('#app [data-a="' + o.a + '"]'); for (var i = 0; i < all.length; i++) if (all[i].getAttribute("data-k") === o.k) { back = all[i]; break; } }
    if (back) { try { back.focus({ preventScroll: true }); } catch (e) {} }
  } else if (act && act !== document.body && !typing && act.blur) act.blur();
}
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
      // the channels on your own list (★, also ones you do not follow on Twitch) that are live join the followed ones
      var tw = (j.data || []).map(twdStream), have = {};
      tw.forEach(function (x) { have[x.id] = 1; });
      var extra = twFavs().filter(function (l) { return !have[l]; });
      if (!extra.length) return tw;
      return twGet("streams?first=100&" + extra.map(function (l) { return "user_login=" + encodeURIComponent(l); }).join("&"), tok).then(function (s) { (s.data || []).forEach(function (x) { if (!have[x.user_login]) { have[x.user_login] = 1; tw.push(twdStream(x)); } }); return tw; }).catch(function (e) { if (e && e.message === "expired") throw e; return tw; });
    })
    .then(function (tw) {
      TWC = true;
      TW = tw;
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
  var s = (TW || []).filter(function (x) { return x.id === login; })[0] || TWDS[login];
  openModal((s && s.name) || login, (s && s.title ? '<p class="mut sn">' + esc(s.title) + (s.sub ? " · " + esc(s.sub) : "") + "</p>" : "") +
    '<div class="tw"><iframe allow="autoplay; fullscreen; storage-access" allowfullscreen src="' + esc(twEmbedSrc(login)) + '"></iframe></div>' +
    '<p class="tools"><button class="pri" data-a="twpop" data-k="' + esc(login) + '" title="Opens on twitch.tv, so Turbo / your sub is recognised">Pop out (no ads with Turbo/sub)</button><button data-a="twchat" data-k="' + esc(login) + '">Pop out chat</button><button data-a="dock" data-k="t:' + esc(login) + '">Dock on the left</button>' + linkBtn("https://www.twitch.tv/" + encodeURIComponent(login), "Open on Twitch") + '<button data-a="twdopen">Discover</button></p>' +
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
    else { QERR = ""; Object.assign(QUOTES, r.data); QLOADED = Object.keys(QUOTES).length > 0; stockAlerts(r.data); priceAlerts(); }
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
function importSymbols(list, names) {
  // the sample stocks make way for your own, but only while the list is still nothing but samples
  var onlySamples = (P.stocks || []).every(function (x) { return SAMPLE_IDS.indexOf(x.id) >= 0; });
  P.stocks = (P.stocks || []).filter(function (x) { return !onlySamples || list.indexOf(x.id) >= 0; });
  list.forEach(function (v) {
    if (!P.stocks.some(function (x) { return x.id === v; })) P.stocks.push({ id: v, name: (names && names[v]) || "", p: null, c: null });
    delete P.hidden["s:" + v];
  });
  persist(); render(); fetchQuotes(true);
}
function hasStock(id) { return (P.stocks || []).some(function (x) { return x.id === id; }); }
function stMsg(t) { if ($("stMsg")) $("stMsg").textContent = t || ""; }

// ---- Finding a stock by company name (Settings > Stocks and the setup guide): type a name, pick from the list ----
var STFOUND = [], STFOR = "";
function stFoundHtml() {
  return STFOUND.map(function (f, i) {
    return '<div class="row"><span><b>' + esc(f.s) + "</b> " + esc(f.n) + ' <small class="mut">' + esc([f.x, f.t].filter(Boolean).join(" · ")) + "</small></span>" +
      (hasStock(f.s) ? '<span class="mut sn">✓ added</span>' : '<button data-a="stpick" data-k="' + i + '">Add</button>') + "</div>";
  }).join("") + stRawRow();
}
// What was typed can itself be a symbol that the search does not list (SAAB_B, RHM, XAUUSDG...): it can always be added as it is
function stRaw() { var v = STFOR.trim().toUpperCase(); return /^[A-Z0-9^][A-Z0-9._:=^!&-]{0,39}$/.test(v) ? v : ""; }
function stRawRow() {
  var v = stRaw();
  if (!v || hasStock(v) || STFOUND.some(function (x) { return x.s === v; })) return "";
  return '<div class="row"><span class="mut sn">Not in the list? Add <b>' + esc(v) + '</b> exactly as typed</span><button data-a="stpick" data-k="raw">Add</button></div>';
}
function stFind(inId) {
  var el = $(inId), box = $(inId === "stockIn" ? "stockRes" : "wzRes"), q = el ? el.value.trim() : "";
  if (!box) return;
  STFOR = q; STFOUND = [];
  // a list of symbols (commas), or a full name like NASDAQ:NVDA, is not a search
  if (q.length < 2 || /[,;:]/.test(q) || !sb || !USER) { box.innerHTML = ""; return; }
  sb.functions.invoke("quotes", { body: { find: q } }).then(function (r) {
    if (STFOR !== q || !box.isConnected) return;
    var f = r.data && Array.isArray(r.data.found) ? r.data.found : null;
    if (!f) { box.innerHTML = ""; return; }   // an older "quotes" function does not know this request: then there is simply no list
    STFOUND = f.filter(function (x) { return x && typeof x.s === "string" && /^[A-Z0-9._=^-]{1,24}$/.test(x.s); }).slice(0, 8)
      .map(function (x) { return { s: x.s, n: String(x.n || "").slice(0, 80), x: String(x.x || "").slice(0, 30), t: String(x.t || "").slice(0, 12) }; });
    box.dataset.f = inId;
    box.innerHTML = STFOUND.length ? stFoundHtml() : '<p class="mut sn">No company found with that name.</p>' + stRawRow();
  }).catch(function () {});
}
function stPick(i) {
  var f = i === "raw" ? (stRaw() ? { s: stRaw(), n: "" } : null) : STFOUND[+i];
  if (!f) return;
  if (!P.stocks) P.stocks = DATA.stocks.map(function (x) { return { id: x.id, name: x.name, p: x.p, c: x.c }; });
  if (!hasStock(f.s)) P.stocks.push({ id: f.s, name: f.n, p: null, c: null });
  delete P.hidden["s:" + f.s];
  persist(); render(); fetchQuotes(true);
  if (WIZ && $("wzPage")) { WIZMSG = "Added " + f.s + (f.n ? " (" + f.n + ")" : "") + "."; wizRender(); return; }
  if ($("stockRes")) $("stockRes").innerHTML = stFoundHtml();
}

// ---- Importing stocks from a file or a Google Sheet ----
// Reads rows of text separated by commas, semicolons or tabs (whichever the file uses), with "quoted" cells.
function csvRows(text) {
  text = String(text).replace(/^﻿/, "").slice(0, 2000000);
  var head = text.slice(0, 6000), d = [",", ";", "\t", "|"].map(function (c) { return [c, head.split(c).length]; }).sort(function (a, b) { return b[1] - a[1]; })[0][0];
  var rows = [], row = [], cell = "", q = false, i, ch;
  for (i = 0; i < text.length && rows.length < 20000; i++) {
    ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
    else if (ch === '"' && !cell) q = true;
    else if (ch === d) { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (ch !== "\r") cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
var ST_SYM = /^(symbols?|tickers?|ticker symbol|tickersymbol|stock symbol|instrument symbol|underlying symbol|kortnamn|code)$/,
  ST_ISIN = /^(isin([ -]?(code|kod|kode|koodi))?|security id)$/,
  ST_NAME = /^(name|namn|navn|nimi|company|company name|security|security name|description|instrument|holding|stock|värdepapper|värdepapper\/beskrivning|verdipapir|værdipapir|arvopaperi)$/;
function stOkSym(v) { return /^[A-Z0-9^][A-Z0-9._:=^!&-]{0,23}$/.test(v) && !/^[\d.,-]+$/.test(v); }
function stOkIsin(v) { return /^[A-Z]{2}[A-Z0-9]{9}\d$/.test(v); }
// Finds the Symbol / Ticker / ISIN column (wherever its heading row is; some exports have several tables in one file)
// and returns one entry per instrument: { s: symbol, i: ISIN, n: name }. Returns null when the file has no such column.
function stParse(text) {
  var rows = csvRows(text), si = -1, ii = -1, ni = -1, head = false, out = [], seen = {};
  rows.forEach(function (r) {
    var c = r.map(function (x) { return String(x).trim(); }), low = c.map(function (x) { return x.toLowerCase(); });
    var s2 = -1, i2 = -1;
    low.forEach(function (x, n) { if (s2 < 0 && ST_SYM.test(x)) s2 = n; if (i2 < 0 && ST_ISIN.test(x)) i2 = n; });
    if (s2 >= 0 || i2 >= 0) {
      head = true; si = s2; ii = i2; ni = -1;
      low.forEach(function (x, n) { if (ni < 0 && ST_NAME.test(x)) ni = n; });
      return;
    }
    if (low[1] === "header") { si = ii = ni = -1; return; }   // the next table of a multi-table export, without such a column
    if (!head || (si < 0 && ii < 0)) return;
    var s = si >= 0 ? (c[si] || "").toUpperCase() : "", isin = ii >= 0 ? (c[ii] || "").toUpperCase() : "";
    if (!stOkSym(s)) s = "";
    if (!stOkIsin(isin)) isin = "";
    if (!s && !isin) return;
    var key = isin || s;
    if (seen[key]) return;
    seen[key] = 1;
    out.push({ s: s, i: isin, n: ni >= 0 ? (c[ni] || "").slice(0, 80) : "" });
  });
  if (head) return out;
  // no heading at all: accept the file only if it is nothing but symbols (a plain list, or a TradingView export)
  var cells = [];
  rows.forEach(function (r) { r.forEach(function (y) { String(y).replace(/###[^,;|]*/g, "").split(/[\s,;|]+/).forEach(function (x) { x = x.trim().toUpperCase(); if (x) cells.push(x); }); }); });
  if (!cells.length || cells.length > 500 || !cells.every(stOkSym)) return null;
  cells.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push({ s: x, i: "", n: "" }); } });
  return out;
}
var STIMP = null;
function stImpDraw() {
  var el = $("stImp");
  if (!el) return;
  if (!STIMP) { el.innerHTML = ""; return; }
  el.innerHTML = '<div class="stimp"><b>Found ' + STIMP.ok.length + " in " + esc(STIMP.from) + "</b>" +
    (STIMP.ok.length ? '<span class="mut sn"> Untick what you do not want.</span><div class="stimpl">' + STIMP.ok.map(function (x, i) {
      return '<label><input type="checkbox" data-sti="' + i + '" checked> <b>' + esc(x.s) + "</b> <small class=\"mut\">" + esc(x.n) + "</small></label>";
    }).join("") + "</div>" : "") +
    (STIMP.miss.length ? '<p class="mut sn">Not found (' + STIMP.miss.length + "): " + esc(STIMP.miss.slice(0, 30).join(", ")) + (STIMP.miss.length > 30 ? "…" : "") + ". Add these by name in the search field above.</p>" : "") +
    (STIMP.cut ? '<p class="mut sn">The file has more than 100; only the first 100 are listed.</p>' : "") +
    '<div class="tools">' + (STIMP.ok.length ? '<button class="pri" data-a="stimpgo">Add to my stocks</button>' : "") + '<button data-a="stimpno">Cancel</button></div></div>';
}
function stImport(text, from) {
  var items = stParse(text);
  STIMP = null; stImpDraw();
  if (!items) { stMsg("Could not find a column called Symbol, Ticker or ISIN in " + from + ". Check that the first row has the column names."); return; }
  if (!items.length) { stMsg("No symbols found in " + from + "."); return; }
  var cut = items.length > 100;
  items = items.slice(0, 100);
  // A US ISIN next to a symbol: the symbol is right as it is. Otherwise the ISIN says more exactly which listing is meant.
  var need = items.filter(function (x) { return x.i && !(x.s && /^US/.test(x.i)); }).map(function (x) { return x.i; });
  var finish = function (map) {
    var ok = [], miss = [], seen = {};
    items.forEach(function (x) {
      var hit = x.i && map[x.i], s = hit && typeof hit.s === "string" && stOkSym(hit.s) ? hit.s : x.s;
      if (!s) { miss.push(x.n || x.i); return; }
      if (seen[s]) return;
      seen[s] = 1;
      ok.push({ s: s, n: x.n || (hit && String(hit.n || "").slice(0, 80)) || "" });
    });
    STIMP = { ok: ok, miss: miss, from: from, cut: cut };
    stMsg(""); stImpDraw();
  };
  if (!need.length) { finish({}); return; }
  if (!sb || !USER) { stMsg("Sign in first (the person icon in the menu box)."); return; }
  stMsg("Looking up " + need.length + " ISIN code" + (need.length === 1 ? "" : "s") + "…");
  Promise.all([need.slice(0, 50), need.slice(50)].filter(function (a) { return a.length; }).map(function (a) {
    return sb.functions.invoke("quotes", { body: { isins: a } }).then(function (r) { return (r.data && r.data.isin) || {}; }).catch(function () { return {}; });
  })).then(function (parts) { finish(Object.assign.apply(null, [{}].concat(parts))); });
}
function stImpGo() {
  if (!STIMP) return;
  var list = [], names = {};
  Array.prototype.forEach.call(document.querySelectorAll("#stImp [data-sti]"), function (b) {
    var x = STIMP.ok[+b.dataset.sti];
    if (b.checked && x) { list.push(x.s); names[x.s] = x.n; }
  });
  STIMP = null; stImpDraw();
  if (!list.length) return;
  importSymbols(list, names);
  stMsg("Added " + list.length + " stock" + (list.length === 1 ? "" : "s") + ".");
}
// A file can be UTF-8, UTF-16 (some Nordic brokers) or an older Western encoding; an Excel file has to be saved as CSV first
function stFileText(buf) {
  var b = new Uint8Array(buf), dec = function (enc) { return new TextDecoder(enc).decode(b); };
  if (b[0] === 0x50 && b[1] === 0x4B) return null;
  if (b[0] === 0xFF && b[1] === 0xFE) return dec("utf-16le");
  if (b[0] === 0xFE && b[1] === 0xFF) return dec("utf-16be");
  if (b.length > 3 && b[1] === 0 && b[3] === 0) return dec("utf-16le");
  var t = dec("utf-8");
  return t.indexOf("�") >= 0 ? dec("windows-1252") : t;
}
document.addEventListener("change", function (e) {
  if (e.target.id !== "stFile" || !e.target.files[0]) return;
  var f = e.target.files[0], fr = new FileReader();
  e.target.value = "";
  if (f.size > 5000000) { stMsg("That file is too large (5 MB at most)."); return; }
  fr.onload = function () {
    var t = null;
    try { t = stFileText(fr.result); } catch (err) { t = ""; }
    if (t === null) { stMsg("That is an Excel file. Open it, choose Save as and pick CSV, then import the CSV file."); return; }
    stImport(t, "the file");
  };
  fr.onerror = function () { stMsg("Could not read that file."); };
  fr.readAsArrayBuffer(f);
});
document.addEventListener("submit", function (e) {
  if (e.target.id === "impStock") {
    e.preventDefault();
    var list = $("impIn").value.split(/[,\n;]+/).map(function (x) { return x.trim().toUpperCase(); })
      .filter(function (x) { return x && x.indexOf("###") !== 0 && x.indexOf(" ") < 0; });
    if (list.length) importSymbols(list);
  }
  if (e.target.id === "linkStock") {
    e.preventDefault();
    if (!sb || !USER) { alert("Sign in first (the person icon in the menu box)."); return; }
    var lk = $("linkIn").value.trim();
    if (/^https:\/\/docs\.google\.com\/spreadsheets\//.test(lk)) {
      stMsg("Reading the sheet…");
      sb.functions.invoke("quotes", { body: { sheet: lk } }).then(function (r) {
        if (r.data && typeof r.data.csv === "string") stImport(r.data.csv, "the sheet");
        else stMsg((r.data && r.data._err) || "Could not read that sheet.");
      }).catch(function () { stMsg("Could not read that sheet."); });
      return;
    }
    sb.functions.invoke("quotes", { body: { url: lk } }).then(function (r) {
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
  openModal("YouTube", '<div class="tw"><iframe allow="autoplay; fullscreen; encrypted-media" allowfullscreen src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1"></iframe></div><p><a class="btn" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=' + encodeURIComponent(id) + '">Open on YouTube</a> <button data-a="dock" data-k="v:' + esc(id) + '">Dock on the left</button> ' + laterBtn("v:" + id) + "</p>");
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
      NEWSALL = cleanLinks(unentAll(r.data.news, ["t", "d"])); NEWS = langFilter(NEWSALL.slice()); TGP = unentAll(r.data.tg, ["t", "tx"]); NEWSV++; NLAST = Date.now();
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
var FIRST = load("sp_first", { _i: {} }), NEWPN = {};
if (!FIRST._i) FIRST._i = {};
// A post is recognised by its link. Tracking tags that some sites add to a link (and change between fetches) are
// taken off, so the same post is not seen as a different one. Real parts of an address are left alone.
var TRACK_Q = /^(utm_\w+|fbclid|gclid|dclid|msclkid|mc_cid|mc_eid|igshid|at_medium|at_campaign|at_custom\d|at_format|at_link\w*|ns_mchannel|ns_source|ns_campaign|ns_linkname|ns_fee|ocid|cmpid|cmp|xtor|ito|smid|ncid)$/i;
function cleanLink(u) {
  u = String(u || "");
  if (u.indexOf("?") < 0 && u.indexOf("#") < 0) return u;
  var hash = "", hi = u.indexOf("#");
  if (hi >= 0) { hash = u.slice(hi); u = u.slice(0, hi); if (/^#(xtor|echobox|utm_|ref=|at_|cmp|ocid)/i.test(hash)) hash = ""; }
  var qi = u.indexOf("?");
  if (qi >= 0) {
    var keep = u.slice(qi + 1).split("&").filter(function (p) { return p && !TRACK_Q.test(p.split("=")[0]); });
    u = u.slice(0, qi) + (keep.length ? "?" + keep.join("&") : "");
  }
  return u + hash;
}
function cleanLinks(list) { (list || []).forEach(function (x) { if (x && x.u) x.u = cleanLink(x.u); }); return list || []; }
// ---- What you have seen, opened and been told about follows your account to every device ----
// It lives in P.sy, which is saved and merged with the rest of your settings:
//   seen   per box, the time up to which everything counts as seen ("x new" pressed, or you came back to the page)
//   read   the posts you opened            once   what has already been announced (so no device announces it again)
//   nclear / nseen   when the notification history was cleared / last looked at
//   nalert / mail    up to where highlight-word and new-mail notifications have been given
// Links and announcement keys are stored as short fingerprints, to keep this small.
var SEENREMOTE = {}, LASTSTAMP = load("sp_stamp", {});
function hs(s) { s = String(s); var a = 5381, b = 52711; for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); a = ((a * 33) ^ c) | 0; b = ((b * 33) ^ c) | 0; } return ((a >>> 0) * 4096 + ((b >>> 0) % 4096)).toString(36); }
function sy() {
  if (!P.sy || typeof P.sy !== "object") P.sy = {};
  ["seen", "read", "once", "mail"].forEach(function (k) { if (!P.sy[k] || typeof P.sy[k] !== "object") P.sy[k] = {}; });
  return P.sy;
}
function syCap(o, n) { var k = Object.keys(o); if (k.length > n) k.sort(function (a, b) { return o[a] - o[b]; }).slice(0, k.length - n).forEach(function (x) { delete o[x]; }); }
function isRead(u) { return !!(READ[u] || (P.sy && P.sy.read && P.sy.read[hs(u)])); }
// Take in what another device did (called when your settings arrive from the account, at sign-in and whenever they change)
function adoptSync() {
  var s = P.sy;
  if (!s || typeof s !== "object") return;
  var ch = false;
  var lists = { news: NEWSALL, tg: TGP, rd: RD }, fch = false;
  ["news", "tg", "rd"].forEach(function (b) {
    var t = +(s.seen && s.seen[b]) || 0;
    if (t <= (NSEEN[b] || 0)) return;
    NSEEN[b] = t; SEENREMOTE[b] = 1; ch = true;
    // posts this device happened to load after that moment, but which are from before it, are not new either
    (lists[b] || []).forEach(function (x) { if (x.u && x.ts && x.ts <= t && FIRST[x.u] > t) { FIRST[x.u] = x.ts; fch = true; } });
  });
  if (ch) save("sp_nseen", NSEEN);
  if (fch) save("sp_first", FIRST);
  if ((+s.nalert || 0) > load("sp_nalert", 0)) save("sp_nalert", +s.nalert);
  [0, 1].forEach(function (i) { var t = +(s.mail && s.mail[i]) || 0; if (t > load("sp_mailts" + i, 0)) save("sp_mailts" + i, t); });
  var nc = +s.nclear || 0, nsn = +s.nseen || 0, n0 = NLOG.length, dirty = false;
  if (nc) NLOG = NLOG.filter(function (e) { return e.ts > nc; });
  NLOG.forEach(function (e) { if (!e.seen && e.ts <= nsn) { e.seen = 1; dirty = true; } });
  if (dirty || NLOG.length !== n0) save("sp_nlog", NLOG);
}
function stampFirst(list, box) {
  var now = Date.now(), init = !FIRST._i[box], changed = init;
  // Everything was marked as seen on another device since this one last looked: posts from before that moment are
  // not new here either, even though this device meets them for the first time now.
  var away = !!SEENREMOTE[box] && (LASTSTAMP[box] || 0) < (NSEEN[box] || 0);
  FIRST._i[box] = 1;
  (list || []).forEach(function (x) { if (x.u && !FIRST[x.u]) { FIRST[x.u] = init ? x.ts : away ? Math.min(now, x.ts || now) : now; changed = true; } });
  LASTSTAMP[box] = now; save("sp_stamp", LASTSTAMP); SEENREMOTE[box] = 0;
  if (!changed) return;
  var k = Object.keys(FIRST);
  if (k.length > 3000) {
    // Too many remembered: forget the oldest, but never a post that is still in one of the boxes. Forgetting one of
    // those would make it count as never seen, and it would be marked new again at the next refresh.
    var live = {};
    [list, NEWSALL, NEWS, TGP, TGX, RD].forEach(function (l) { (l || []).forEach(function (x) { if (x && x.u) live[x.u] = 1; }); });
    var old = k.filter(function (u) { return u !== "_i" && !live[u]; }).sort(function (a, b) { return FIRST[a] - FIRST[b]; });
    old.slice(0, Math.max(0, k.length - 2400)).forEach(function (u) { delete FIRST[u]; });
  }
  save("sp_first", FIRST);
}
function isNewItem(x, box) { return PREVIEW ? !!x.nw : isNewTs(FIRST[x.u] || x.ts, box); }
function markSeen(box, t) {
  var s = sy();
  (box ? [box] : ["news", "tg", "rd"]).forEach(function (b) { NSEEN[b] = Math.max(NSEEN[b] || 0, t || Date.now()); if (!t) SEENREMOTE[b] = 0; s.seen[b] = Math.max(+s.seen[b] || 0, NSEEN[b]); });
  save("sp_nseen", NSEEN);
  persist();
}
function markReadUrl(u) {
  if (!u) return;
  READ[u] = Date.now();
  var sr = sy().read; sr[hs(u)] = READ[u]; syCap(sr, 300); persist();
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
  var last0 = last;
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
  if (top > last0) { sy().nalert = Math.max(+sy().nalert || 0, top); persist(); }
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
function fold(w) { return w.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
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
    else { RDERR = v.err || ""; if (v.items && (v.items.length || !v.err)) { RD = cleanLinks(unentAll(v.items, ["t", "d"])); stampFirst(RD, "rd"); } }
    render();
  }).catch(function (e) { rBusy = false; RDERR = String((e && e.message) || e); render(); });
}
function openReddit(u, one) {
  if (!one && RDS().click === "reader" && openReader("rd", u)) return;
  var x = rdAll().filter(function (p) { return p.u === u; })[0];
  if (!x) return;
  markReadUrl(u);
  var img = safeUrl(x.img);
  openModal("r/" + x.s, '<h2 class="mh">' + esc(x.t) + '</h2><div class="mut">r/' + esc(x.s) + (x.by ? " · " + esc(x.by) : "") + " · " + when(x.ts) + "</div>" +
    (img ? '<img class="mimg rdimg" referrerpolicy="no-referrer" alt="" data-rm="1" src="' + esc(img) + '">' : "") + (x.d ? '<p class="nt">' + esc(x.d) + "</p>" : "") +
    '<p class="tools">' + linkBtn(x.u, "Open comments on Reddit") + (x.x ? linkBtn(x.x, "Open the link") : "") + laterBtn("r:" + x.u) + "</p>" + (PREVIEW ? previewNote() : rdComN() ? '<div id="rdCom"><p class="mut sn">Loading comments…</p></div>' : ""));
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
    // in the reader the comments go under their own post
    if (!box || box.dataset.u !== u) { box = null; Array.prototype.forEach.call(document.querySelectorAll("#rdrL .rdcw"), function (b) { if (b.dataset.u === u) box = b; }); }
    if (!box) return;
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
function openNews(u, one) {
  if (!one && RDS().click === "reader" && openReader("news", u)) return;
  var g = NG.filter(function (x) { return x.some(function (n) { return n.u === u; }); })[0];
  var n = g ? g.filter(function (x) { return x.u === u; })[0] : NEWS.concat(FOUND.news.items).filter(function (x) { return x.u === u; })[0];
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
    (PREVIEW ? previewNote() : '<p class="tools">' + linkBtn(n.u, "Read the full article") + '<button data-a="nsearch" data-k="' + esc(n.t) + '">Search other coverage</button>' + laterBtn("a:" + n.u) + "</p>") + more);
  render();
}
function openTG(u, one) {
  if (!one && RDS().click === "reader" && openReader("tg", u)) return;
  var g = tgAll().filter(function (x) { return x.u === u; })[0];
  if (!g) return;
  markReadUrl(g.u);
  var vid = safeUrl(g.vid), th = safeUrl(g.th), img = safeUrl(g.img) || th;
  var media = vid ? '<video class="mvid" controls playsinline preload="metadata"' + (th ? ' poster="' + esc(th) + '"' : "") + ' src="' + esc(vid) + '"></video>'
    : img ? '<img class="mimg" referrerpolicy="no-referrer" alt="" data-rm="1" src="' + esc(img) + '">' : "";
  openModal(g.s, '<div class="mut">' + esc(g.s) + " · " + when(g.ts) + "</div>" + media + '<p class="nt">' + esc(g.tx || g.t) + '</p><p class="tools">' + linkBtn(g.u, "Open on Telegram") + laterBtn("m:" + g.u) + "</p>" + (PREVIEW ? previewNote() : ""));
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
  sy().mail[i] = Math.max(+sy().mail[i] || 0, top); persist();
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

// ---- Bookmarks bar: your own links in one slim row at the very top of the page (Settings > Bookmarks) ----
// P.bm = { on, nw (open in a new tab), col (color for all), items: [ { id, t, u, ic, c } or a folder { id, t, ic, c, kids: [..] } ] }
// ic: "" = no icon, "site" = the site's own icon, otherwise one of BM_ICONS. c: the item's own color ("" = the color for all).
var BM_SVG = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
var BM_ICONS = {
  home: ["Home", '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>'], globe: ["Web", '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>'],
  star: ["Star", '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'], heart: ["Heart", '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'],
  mail: ["Mail", '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'], chat: ["Chat", '<path d="M4 5h16v11H9l-5 4z"/>'],
  video: ["Video", '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>'], music: ["Music", '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'],
  news: ["News", '<rect x="3" y="4" width="15" height="16" rx="1.5"/><path d="M18 8h3v10a2 2 0 0 1-2 2M7 8h7M7 12h7M7 16h4"/>'], book: ["Book", '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M9 7h6"/>'],
  code: ["Code", '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>'], terminal: ["Terminal", '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/>'],
  cart: ["Shopping cart", '<path d="M3 4h2l2.5 11h10L20 7H6.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>'], bag: ["Shop", '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'],
  card: ["Payment card", '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/>'], bank: ["Bank", '<path d="M3 9l9-5 9 5M5 9v8M9.5 9v8M14.5 9v8M19 9v8M3 20h18"/>'],
  money: ["Money", '<path d="M12 3v18M16.5 7.5C16 6 14.5 5 12 5S7.5 6 7.5 8.500 10 11.500 12 12s4.5 1 4.5 3.500S14.5 19 12 19s-4-1-4.500-2.500"/>'], chart: ["Chart", '<path d="M4 4v16h16"/><path d="M7 15l4-4 3 3 5-6"/>'],
  work: ["Work", '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18"/>'], calendar: ["Calendar", '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'],
  clock: ["Clock", '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'], cloud: ["Cloud", '<path d="M7 18a4 4 0 0 1 0-8 5.500 5.500 0 0 1 10.600 1.500A3.500 3.500 0 0 1 17 18z"/>'],
  folder: ["Folder", '<path d="M3 6h6l2 2h10v11H3z"/>'], file: ["Document", '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>'],
  image: ["Pictures", '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>'], camera: ["Camera", '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.2"/>'],
  game: ["Games", '<rect x="2.5" y="7" width="19" height="10" rx="5"/><path d="M7 10.500v3M5.500 12h3M15.500 11h.01M18 13h.01"/>'], tv: ["TV", '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>'],
  phone: ["Phone", '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18h2"/>'], pin: ["Map", '<path d="M12 21s-6-5.600-6-10.500a6 6 0 0 1 12 0C18 15.400 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.2"/>'],
  plane: ["Travel", '<path d="M3 13l18-8-6 16-3.500-6.500z"/><path d="M11.500 14.500L21 5"/>'], car: ["Car", '<path d="M4 16v-4l2-5h12l2 5v4z"/><path d="M4 12h16"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/>'],
  food: ["Food", '<path d="M6 3v8M4 3v5a2 2 0 0 0 4 0V3M6 11v10M17 3c-2 1-3 4-3 7h3M17 3v18"/>'], coffee: ["Coffee", '<path d="M5 9h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M17 10h1.500a2.500 2.500 0 0 1 0 5H17M8 3v3M12 3v3"/>'],
  tool: ["Tools", '<path d="M15 4a4.500 4.500 0 0 0-4.300 5.900L4 16.600V20h3.400l6.700-6.700A4.500 4.500 0 0 0 20 9l-3 3-3-1-1-3z"/>'], lock: ["Lock", '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'],
  user: ["Person", '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'], users: ["People", '<circle cx="9" cy="8" r="3.5"/><path d="M2.500 20a6.500 6.500 0 0 1 13 0M16 4.800a3.500 3.500 0 0 1 0 6.400M17.500 14a6.500 6.500 0 0 1 4 6"/>'],
  school: ["School", '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.500V16c2 2 10 2 12 0v-4.500M22 9v6"/>'], search: ["Search", '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>'],
  link: ["Link", '<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3A4 4 0 0 0 11 18.700l1-1"/>'], bolt: ["Lightning", '<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>'],
  bell: ["Bell", '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21h4"/>'], flag: ["Flag", '<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>'],
  gift: ["Gift", '<rect x="3" y="9" width="18" height="4"/><path d="M5 13v8h14v-8M12 9v12M12 9c-2-4-7-3-5 0M12 9c2-4 7-3 5 0"/>'], trophy: ["Trophy", '<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8M9 18h6"/>'],
  sun: ["Sun", '<circle cx="12" cy="12" r="3.5"/><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M5.600 18.400l1.800-1.800M16.600 7.400l1.800-1.800"/>'], moon: ["Moon", '<path d="M20 14.500A8 8 0 0 1 9.500 4a8 8 0 1 0 10.500 10.500z"/>']
};
var BM_OPEN = "", BM_PICK = "";
function bm() {
  if (!P.bm || typeof P.bm !== "object") P.bm = {};
  if (!Array.isArray(P.bm.items)) P.bm.items = [];
  if (P.bm.nw == null) P.bm.nw = true;
  return P.bm;
}
function bmId() { return "b" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36); }
function bmUrl(u) { u = String(u || "").trim(); if (!u) return ""; if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = "https://" + u; return safeUrl(u); }
function bmHost(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } }
function bmCol(c) { return /^#[0-9a-f]{6}$/i.test(String(c || "")) ? c : ""; }
// where an item lives: { list, i, it, parent } (parent = its folder, or null on the bar itself)
function bmFind(id) {
  var out = null, B = bm();
  B.items.forEach(function (x, i) {
    if (x.id === id) out = { list: B.items, i: i, it: x, parent: null };
    (x.kids || []).forEach(function (k, j) { if (k.id === id) out = { list: x.kids, i: j, it: k, parent: x }; });
  });
  return out;
}
function bmIcon(x) {
  var ic = x.ic == null ? (x.kids ? "folder" : "site") : x.ic;
  if (!ic) return "";
  if (ic === "site") {
    var src = x.u ? "https://" + bmHost(x.u) + "/favicon.ico" : "";
    if (src && bmHost(x.u) && !BADIMG[src]) return '<img class="bmfav" alt="" referrerpolicy="no-referrer" data-rm="1" loading="lazy" src="' + esc(src) + '">';
    ic = "globe";
  }
  return BM_ICONS[ic] ? '<svg class="bmsvg" ' + BM_SVG + ">" + BM_ICONS[ic][1] + "</svg>" : "";
}
function bmStyle(x) { var c = bmCol(x.c) || bmCol(bm().col); return c ? ' style="--bmc:' + c + '"' : ""; }
function bmLink(x, cls) {
  var u = safeUrl(x.u);
  return '<a class="' + cls + (bmCol(x.c) || bmCol(bm().col) ? " col" : "") + '"' + bmStyle(x) + ' href="' + esc(u || "#") + '"' + (bm().nw ? ' target="_blank"' : "") + ' rel="noopener noreferrer" title="' + esc(bmHost(u) || u) + '">' + bmIcon(x) + "<span>" + esc(x.t || bmHost(u) || "Link") + "</span></a>";
}
function renderBm() {
  var el = $("bm"), B = bm();
  if (!el) return;
  el.hidden = !B.on;
  el.setAttribute("data-al", B.al === "c" || B.al === "r" ? B.al : "l");
  if (!B.on) { el.innerHTML = ""; return; }
  el.innerHTML = B.items.map(function (x) {
    if (!x.kids) return bmLink(x, "bmi");
    var open = BM_OPEN === x.id;
    return '<div class="bmf">' + '<button class="bmi' + (bmCol(x.c) || bmCol(B.col) ? " col" : "") + (open ? " on" : "") + '"' + bmStyle(x) + ' data-a="bmfolder" data-k="' + esc(x.id) + '" aria-expanded="' + open + '">' + bmIcon(x) + "<span>" + esc(x.t || "Folder") + '</span><i class="bmcar">▾</i></button>' +
      (open ? '<div class="menu bmmenu" role="menu">' + (x.kids.length ? x.kids.map(function (k) { return bmLink(k, "bmk"); }).join("") : '<div class="mut sn">Empty. Add links to it in Settings → Bookmarks.</div>') + "</div>" : "") + "</div>";
  }).join("") || '<button class="bmi" data-a="setgo" data-k="Bookmarks">+ Add your first bookmark</button>';
  // an open folder's list never runs off the right edge of the screen (a folder near the right end opens leftwards)
  var m = el.querySelector(".bmmenu");
  if (m && m.getBoundingClientRect().right > document.documentElement.clientWidth - 6) { m.style.left = "auto"; m.style.right = "0"; }
}
// a click anywhere else closes an open folder; a click on a link inside it closes it too
document.addEventListener("click", function (e) {
  if (!BM_OPEN) return;
  var t = e.target.closest ? e.target.closest(".bmf") : null;
  if (!t || e.target.closest(".bmk")) { BM_OPEN = ""; setTimeout(renderBm, 0); }
});
// ---- Settings > Bookmarks ----
function bmRow(x, inFolder) {
  var B = bm(), folders = B.items.filter(function (f) { return f.kids; }), pick = BM_PICK === x.id, cur = x.ic == null ? (x.kids ? "folder" : "site") : x.ic, own = bmCol(x.c);
  var place = x.kids ? "" : '<select data-bm="to" data-id="' + esc(x.id) + '" title="Where this link sits" aria-label="Where this link sits"><option value="">On the bar</option>' + folders.map(function (f) { return '<option value="' + esc(f.id) + '"' + (inFolder && inFolder.id === f.id ? " selected" : "") + ">In: " + esc(f.t || "Folder") + "</option>"; }).join("") + "</select>";
  return '<div class="bmrow' + (inFolder ? " in" : "") + (x.kids ? " isf" : "") + '">' +
    '<button class="bmicb" data-a="bmpick" data-k="' + esc(x.id) + '" title="Choose an icon" aria-label="Choose an icon">' + (bmIcon(x) || '<span class="mut">–</span>') + "</button>" +
    '<input type="text" data-bm="t" data-id="' + esc(x.id) + '" value="' + esc(x.t || "") + '" placeholder="' + (x.kids ? "Folder name" : "Name") + '" aria-label="Name" maxlength="40">' +
    (x.kids ? '<span class="mut sn bmfn">Folder · ' + x.kids.length + (x.kids.length === 1 ? " link" : " links") + "</span>" : '<input type="text" data-bm="u" data-id="' + esc(x.id) + '" value="' + esc(x.u || "") + '" placeholder="Address" aria-label="Address" maxlength="500">') +
    '<span class="bmcw"><input type="color" data-bm="c" data-id="' + esc(x.id) + '" value="' + (own || bmCol(B.col) || "#8c93a3") + '" title="Color of this one' + (own ? "" : " (now: the color for all)") + '" aria-label="Color">' + (own ? '<button class="bmx" data-a="bmcolclr" data-k="' + esc(x.id) + '" title="Back to the color for all" aria-label="Remove this color">×</button>' : "") + "</span>" +
    '<button data-a="bmmv" data-k="' + esc(x.id) + '|-1" title="Move left" aria-label="Move left">◀</button><button data-a="bmmv" data-k="' + esc(x.id) + '|1" title="Move right" aria-label="Move right">▶</button>' +
    place + '<button data-a="bmdel" data-k="' + esc(x.id) + '" title="Remove" aria-label="Remove">✕</button>' +
    (pick ? '<div class="bmpick">' + [["", "No icon", '<span class="mut">–</span>']].concat(x.kids ? [] : [["site", "The site's own icon", bmIcon({ u: x.u, ic: "site" })]]).concat(Object.keys(BM_ICONS).map(function (k) { return [k, BM_ICONS[k][0], '<svg class="bmsvg" ' + BM_SVG + ">" + BM_ICONS[k][1] + "</svg>"]; })).map(function (o) {
      return '<button data-a="bmicon" data-k="' + esc(x.id + "|" + o[0]) + '" title="' + esc(o[1]) + '" aria-label="' + esc(o[1]) + '"' + (cur === o[0] ? ' class="on"' : "") + ">" + o[2] + "</button>";
    }).join("") + "</div>" : "") + "</div>";
}
function renderBmSet() {
  var el = $("bmSet"), B = bm();
  if (!el) return;
  $("bmOn").checked = !!B.on; $("bmNw").checked = !!B.nw; $("bmAl").value = B.al === "c" || B.al === "r" ? B.al : "l";
  $("bmColAll").value = bmCol(B.col) || "#8c93a3";
  var act = document.activeElement, keep = act && act.dataset && act.dataset.bm && el.contains(act) ? [act.dataset.bm, act.dataset.id] : null;
  el.innerHTML = B.items.length ? B.items.map(function (x) { return bmRow(x, null) + (x.kids || []).map(function (k) { return bmRow(k, x); }).join(""); }).join("") : '<div class="mut sn">No bookmarks yet. Add one above.</div>';
  var fs = B.items.filter(function (f) { return f.kids; });
  $("bmNewF").innerHTML = '<option value="">On the bar</option>' + fs.map(function (f) { return '<option value="' + esc(f.id) + '">In: ' + esc(f.t || "Folder") + "</option>"; }).join("");
  if (keep) { var again = el.querySelector('[data-bm="' + keep[0] + '"][data-id="' + keep[1] + '"]'); if (again) again.focus(); }
}
function bmChanged() { persist(); renderBm(); renderBmSet(); positionClocks(); }
function bmAct(a, k) {
  var B = bm(), p = String(k || "").split("|"), f = bmFind(p[0]);
  if (a === "bmfolder") { BM_OPEN = BM_OPEN === k ? "" : k; renderBm(); return; }
  if (a === "bmadd") {
    var u = bmUrl($("bmNewU").value), t = $("bmNewT").value.trim().slice(0, 40), to = $("bmNewF").value, msg = $("bmMsg");
    if (!u) { msg.textContent = "Type the address of the site, for example youtube.com."; $("bmNewU").focus(); return; }
    var item = { id: bmId(), t: t || bmHost(u), u: u }, folder = to ? bmFind(to) : null;
    (folder && folder.it.kids ? folder.it.kids : B.items).push(item);
    if (!B.on) B.on = true;   // adding the first one switches the bar on
    $("bmNewU").value = ""; $("bmNewT").value = ""; msg.textContent = "Added.";
    bmChanged(); $("bmNewU").focus(); return;
  }
  if (a === "bmaddf") { B.items.push({ id: bmId(), t: "Folder", kids: [] }); if (!B.on) B.on = true; bmChanged(); return; }
  if (a === "bmcolreset") { B.col = ""; B.items.forEach(function (x) { delete x.c; (x.kids || []).forEach(function (y) { delete y.c; }); }); bmChanged(); return; }
  if (!f) return;
  if (a === "bmmv") { var j = f.i + (+p[1] || 0); if (j < 0 || j >= f.list.length) return; f.list.splice(f.i, 1); f.list.splice(j, 0, f.it); bmChanged(); return; }
  if (a === "bmdel") {
    if (f.it.kids && f.it.kids.length && !confirm('Remove the folder "' + (f.it.t || "Folder") + '" and the ' + f.it.kids.length + " link" + (f.it.kids.length === 1 ? "" : "s") + " in it?")) return;
    f.list.splice(f.i, 1); bmChanged(); return;
  }
  if (a === "bmpick") { BM_PICK = BM_PICK === p[0] ? "" : p[0]; renderBmSet(); return; }
  if (a === "bmicon") { f.it.ic = p[1] || ""; BM_PICK = ""; bmChanged(); return; }
  if (a === "bmcolclr") { delete f.it.c; bmChanged(); return; }
}
// typing a name or address, picking a color, moving a link into or out of a folder
document.addEventListener("change", function (e) {
  var t = e.target, B = bm();
  if (!t || !t.id && !(t.dataset && t.dataset.bm)) return;
  if (t.id === "bmOn") { B.on = t.checked; bmChanged(); return; }
  if (t.id === "bmNw") { B.nw = t.checked; bmChanged(); return; }
  if (t.id === "bmAl") { B.al = t.value === "c" || t.value === "r" ? t.value : "l"; bmChanged(); return; }
  if (t.id === "bmColAll") { B.col = bmCol(t.value); bmChanged(); return; }
  if (!t.dataset || !t.dataset.bm) return;
  var f = bmFind(t.dataset.id);
  if (!f) return;
  if (t.dataset.bm === "t") f.it.t = t.value.trim().slice(0, 40);
  else if (t.dataset.bm === "u") { var u = bmUrl(t.value); if (!u) { t.value = f.it.u || ""; return; } f.it.u = u; }
  else if (t.dataset.bm === "c") f.it.c = bmCol(t.value);
  else if (t.dataset.bm === "to") {
    var dest = t.value ? bmFind(t.value) : null, list = dest && dest.it.kids ? dest.it.kids : B.items;
    if (list === f.list) return;
    f.list.splice(f.i, 1); list.push(f.it);
  }
  bmChanged();
});
document.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target && (e.target.id === "bmNewU" || e.target.id === "bmNewT")) { e.preventDefault(); bmAct("bmadd"); } });

// ---- Timer, countdown and notes ----
var AC = null;
function audio() {
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); } catch (e) {}
  return AC;
}
document.addEventListener("click", function () { audio(); }, { once: true });
// Why a sound was made: the last 15 notifications and alarms on this device, with the reason for each and whether it
// could be heard. Shown under Settings > Notifications, so a sound without a visible card can be traced.
var SNDLOG = load("sp_sndlog", []);
var SND_WHY = { news: "Big news: several of your sources reported the same story", words: "A headline or post contained one of your highlight words", stock: "A stock on your list moved more than your limit", live: "A streamer you starred went live",
  cal: "A calendar reminder or a special day you asked to be reminded of", mail: "New email arrived", sport: "A team, fighter or player you starred: start, goal or result" };
function sndLog(title, why, heard) {
  SNDLOG.push({ ts: Date.now(), t: String(title || "").slice(0, 120), why: String(why || ""), snd: heard, bg: !!document.hidden });
  if (SNDLOG.length > 15) SNDLOG = SNDLOG.slice(-15);
  save("sp_sndlog", SNDLOG);
  renderNfLog();
}
function renderNfLog() {
  var el = $("nfLog");
  if (!el) return;
  el.innerHTML = SNDLOG.length ? SNDLOG.slice(-5).reverse().map(function (e) {
    var snd = e.snd === "on" ? "sound played" : e.snd === "blocked" ? "no sound (the browser had not allowed sound on this tab yet)" : e.snd === "off" ? "no sound (ping sound is switched off)" : "sound played";
    return '<div class="nflog"><b>' + esc(e.t) + '</b><span class="mut">' + new Date(e.ts).toLocaleString("en-GB", { timeZone: TZ, weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " · " + snd + (e.bg ? " · the tab was in the background" : "") + "</span><span>" + esc(e.why) + "</span></div>";
  }).join("") : '<div class="mut sn">Nothing yet on this device.</div>';
}
function canSound() { var ac = audio(); return !!ac && ac.state === "running"; }
function beep(freq, t0, dur, type) {
  var ac = audio(); if (!ac) return;
  // Before you have clicked anywhere on the page, the browser keeps sound switched off. A sound asked for then must be
  // dropped: it would otherwise wait and play, out of nowhere, at your first click (possibly hours later).
  // (A sound you ask for with your very first click still plays: the browser switches sound on within a moment.)
  if (ac.state !== "running") {
    var asked = Date.now();
    try { ac.resume().then(function () { if (Date.now() - asked < 1500 && ac.state === "running") beep(freq, t0, dur, type); }, function () {}); } catch (e) {}
    return;
  }
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
function startRinging(a) {
  sndLog((a.label || (a.k === "t" ? "Timer" : "Countdown")) + " finished", "A timer or countdown reached its end. It keeps ringing until you press Stop on it.", canSound() ? "on" : "blocked");
  ring(a.snd); stopRinging(a.id); RINGING[a.id] = setInterval(function () { ring(a.snd); }, 2600);
}
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
  // phones: the timers are a row of their own above the boxes (see the stylesheet), nothing to line up
  if (window.innerWidth <= 820) { box.style.left = box.style.top = ""; var f0 = box.querySelector(".clk"); if (f0) f0.style.marginRight = ""; return; }
  var mail = document.querySelector('[data-id="mail"]'), dateEl = $("date");
  // Level with the mail box. When the "next in your calendar" line is too long for that, the timers line up with the
  // boxes further right instead: the first above the Radio box, the second above the menu box.
  // where the text of the "next up" line ends (the line itself may be wider than its text)
  var nu = $("nextUp"), clear = 0;
  if (nu && !nu.hidden) {
    var nr = nu.getBoundingClientRect(), tr = nr;
    try { var rg = document.createRange(); rg.selectNodeContents(nu); tr = rg.getBoundingClientRect(); } catch (e) {}
    clear = Math.round(Math.min(nr.right, tr.width ? tr.right : nr.right)) + 14;
  }
  var left = function (id) { var el = document.querySelector('#grid [data-id="' + id + '"]'); return el ? Math.round(el.getBoundingClientRect().left) : 0; };
  var mailL = mail ? Math.round(mail.getBoundingClientRect().left) : 16, liveL = left("live"), menuL = left("menu"), first = box.querySelector(".clk");
  var shift = clear > mailL && (liveL || menuL) >= clear, startL = shift ? (liveL || menuL) : Math.max(mailL, clear);
  box.style.left = startL + "px";
  if (first) first.style.marginRight = shift && liveL && menuL > liveL ? Math.max(0, menuL - liveL - first.offsetWidth - 6) + "px" : "";   // the gap that puts the second one above the menu box
  // just above the row of small boxes (about level with the "next in your calendar" line), not up by the date
  var rowEl = mail || document.querySelector('#grid [data-id="live"]') || document.querySelector('#grid [data-id="weather"]'), one = box.querySelector(".clk");
  box.style.top = Math.max(8, rowEl && one ? Math.round(rowEl.getBoundingClientRect().top - one.offsetHeight - 5) : dateEl ? Math.round(dateEl.getBoundingClientRect().top) : 14) + "px";   // scrolled down: they stay at the top of the window
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
function noteTab() { return P.noteTab === "note" || P.noteTab === "later" ? P.noteTab : "todo"; }
// ---- Read later: a headline, Telegram post, Reddit post or video put aside, kept in the third tab of Notes ----
// P.later = [{ id (what opens it: "a:<link>" news, "m:<link>" Telegram, "r:<link>" Reddit, "v:<video id>"), t, s, u, ts }],
// newest first when shown, at most 100. Saved with your account like notes, so it is the same list on every device.
function laterList() { return Array.isArray(P.later) ? P.later : []; }
function isLater(id) { return laterList().some(function (x) { return x.id === id; }); }
function laterSvg(on) { return '<svg viewBox="0 0 24 24" fill="' + (on ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4z"/></svg>'; }
function laterBtn(id) { var on = isLater(id); return '<button class="laterb' + (on ? " on" : "") + '" data-a="later" data-k="' + esc(id) + '">' + laterSvg(on) + (on ? "Saved for later" : "Read later") + "</button>"; }
// what is known about an item right now, from the box it is in
function laterInfo(id) {
  var k = id.charAt(0), v = id.slice(2), x;
  if (k === "a") { x = NEWS.concat(NEWSALL, FOUND.news.items).filter(function (n) { return n.u === v; })[0]; return x ? { t: x.t, s: x.s, u: x.u } : null; }
  if (k === "m") { x = tgAll().filter(function (g) { return g.u === v; })[0]; return x ? { t: String(x.tx || x.t || ""), s: x.s, u: x.u } : null; }
  if (k === "r") { x = rdAll().filter(function (p) { return p.u === v; })[0]; return x ? { t: x.t, s: "r/" + x.s, u: x.u } : null; }
  if (k === "v") { x = (YTV || []).filter(function (y) { return y.id === v; })[0]; return { t: x ? x.t : "Video", s: x ? x.n || "YouTube" : "YouTube", u: "https://www.youtube.com/watch?v=" + encodeURIComponent(v) }; }
  return null;
}
function laterAct(a, k) {
  var L = laterList().slice(), i = -1;
  L.forEach(function (x, j) { if (x.id === k) i = j; });
  if (a === "lateropen") {
    var it = L[i];
    if (!it) return;
    var kind = it.id.charAt(0), v = it.id.slice(2);
    // still in its box: open it the usual way; otherwise go to where it lives
    if (kind === "v") openYT(v);
    else if (kind === "a" && NEWS.some(function (n) { return n.u === v; })) openNews(v);
    else if (kind === "m" && TGP.some(function (g) { return g.u === v; })) openTG(v);
    else if (kind === "r" && RD.some(function (p) { return p.u === v; })) openReddit(v);
    else if (safeUrl(it.u)) window.open(safeUrl(it.u), "_blank", "noopener");
    return;
  }
  if (a === "later" && i < 0) {
    var info = laterInfo(k);
    if (!info) return;
    L.push({ id: k, t: String(info.t || "").replace(/\s+/g, " ").trim().slice(0, 200), s: String(info.s || "").slice(0, 60), u: safeUrl(info.u), ts: Date.now() });
    if (L.length > 100) L = L.sort(function (x, y) { return x.ts - y.ts; }).slice(L.length - 100);
  } else if (i >= 0) L.splice(i, 1);   // "later" on a saved one, or "laterdone": off the list for good
  else return;
  P.later = L;
  persist(); render(); laterRefresh();
}
// after a change: the buttons in an open window, and the Notes window or side panel if it is showing
function laterRefresh() {
  Array.prototype.forEach.call(document.querySelectorAll("#mBody .laterb"), function (b) { var on = isLater(b.dataset.k); b.classList.toggle("on", on); b.innerHTML = laterSvg(on) + (on ? "Saved for later" : "Read later"); });
  if (sideOf("notes")) putWidget("notes");
  else if (!$("modal").hidden && $("mTitle").textContent === "Notes") openNotes(false);
}
function laterHtml() {
  var ico = { a: "news", m: "plane", r: "chat", v: "video" }, kindName = { a: "News", m: "Telegram", r: "Reddit", v: "Video" };
  var L = laterList().slice().sort(function (x, y) { return y.ts - x.ts; });
  return L.length ? L.map(function (x) {
    var k = x.id.charAt(0);
    return '<div class="lrow"><i class="lic" title="' + (kindName[k] || "") + '"><svg ' + BM_SVG + ">" + (BM_ICONS[ico[k]] || BM_ICONS.link)[1] + "</svg></i>" +
      '<button class="lnk ltx" data-a="lateropen" data-k="' + esc(x.id) + '"><span>' + esc(x.t || x.u) + "</span><small>" + esc(x.s) + " · saved " + ago(x.ts) + " ago</small></button>" +
      '<button class="ldone" data-a="laterdone" data-k="' + esc(x.id) + '" title="Done: take it off the list" aria-label="Done: take it off the list">✓</button></div>';
  }).join("") : '<p class="nempty">Nothing put aside yet. Point at a headline, post or video and press the small bookmark that appears, or press <b>Read later</b> in the window that opens when you click one.</p>';
}
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
  if (tab === "later") body = laterHtml();
  else if (tab === "todo") {
    body = '<div class="tadd"><i>+</i><input type="text" id="noteIn" placeholder="Add a task and press Enter" maxlength="300" autocomplete="off"></div>' +
      (open.map(trow).join("") || '<p class="nempty">' + (done.length ? "All done. Nice." : "Nothing to do yet. Add your first task above.") + "</p>") +
      (done.length ? '<div class="tdh"><button class="lnk2" data-a="notedonetoggle">' + (DONE_OPEN ? "▾" : "▸") + " Completed (" + done.length + ")</button>" + (DONE_OPEN ? '<button class="lnk2" data-a="notecleardone">Clear</button>' : "") + "</div>" + (DONE_OPEN ? done.map(trow).join("") : "") : "");
  } else {
    body = '<div class="ngrid"><div class="ncard new"><textarea id="noteIn" rows="2" placeholder="Write a note…"></textarea><div class="nfoot"><small>Ctrl+Enter to save</small><button class="pri" data-a="noteadd">Save</button></div></div>' +
      notes.map(function (n) {
        return '<div class="ncard' + (n.pin ? " pin" : "") + '">' + text(n) + '<div class="nfoot"><small>' + new Date(n.ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + "</small>" + acts(n, true) + "</div></div>";
      }).join("") + "</div>";
  }
  return '<div class="nt2"><div class="seg">' + seg("todo", "To-do", open.length) + seg("note", "Notes", notes.length) + seg("later", "Read later", laterList().length) + "</div>" + body + "</div>";
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
  // Reggae
  ["irie", "Irie FM (Jamaica)", "Reggae", "https://stream.iriefm.net:8008/stream", "English"],
  ["zip", "Zip FM 103 (Jamaica)", "Reggae", "https://stream.zeno.fm/c0ytcn43vxquv", "English"],
  ["stylz", "Stylz FM (Jamaica)", "Reggae", "https://stream.zeno.fm/0d1hpcmqqy5tv", "English"],
  ["reg181", "181.fm Reggae Roots", "Reggae", "https://listen.181fm.com/181-reggae_128k.mp3", "English"],
  ["fm1reg", "1.FM Reggae Trade", "Reggae", "https://strm112.1.fm/reggae_mobile_mp3", "Music only"],
  ["chillcafe", "Reggae Chill Cafe", "Reggae", "https://maggie.torontocast.com:2020/stream/reggaechillcafe", "Music only"],
  ["lautreg", "Reggae (laut.fm)", "Reggae", "https://stream.laut.fm/reggae", "Music only"],
  ["lautdub", "Dub (laut.fm)", "Reggae", "https://stream.laut.fm/dub", "Music only"],
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
function radioIds() { var on = P.radio && Array.isArray(P.radio.on) ? P.radio.on : RADIO_DEF; return radAll().filter(function (r) { return on.indexOf(r[0]) >= 0; }); }
function radioCur() { var list = radioIds(), id = P.radio && P.radio.cur; return list.filter(function (r) { return r[0] === id; })[0] || list[0] || null; }
function radioVol() { var v = P.radio && P.radio.vol; return v >= 0 && v <= 100 ? +v : 60; }
function radioSet(k, v) { P.radio = P.radio || {}; P.radio[k] = v; persist(); }
var RAD = { a: null, id: "", state: "" };   // state: "" stopped, "load" connecting, "play" playing, "err" could not play
function radioPlay() {
  var s = radioCur();
  if (!s) return;
  radTryStop();
  if (!RAD.a) {
    RAD.a = new Audio(); RAD.a.preload = "none";
    var set = function (st) { return function () { if (RAD.state && RAD.state !== st) { RAD.state = st; render(); } }; };
    RAD.a.addEventListener("playing", set("play")); RAD.a.addEventListener("waiting", set("load")); RAD.a.addEventListener("error", set("err"));
  }
  RAD.id = s[0]; RAD.state = "load";
  RAD.a.src = s[3]; RAD.a.volume = radioVol() / 100;
  var p = RAD.a.play();
  if (p && p.catch) p.catch(function () { if (RAD.id === s[0] && RAD.state === "load") { RAD.state = "err"; render(); } });
  try { if (navigator.mediaSession && window.MediaMetadata) navigator.mediaSession.metadata = new MediaMetadata({ title: s[1], artist: "OmniTree radio" }); } catch (e) {}
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
    (MENU_OPEN === "vol" ? '<div class="menu volpop"><input type="range" id="radVol" min="0" max="100" step="1" value="' + v + '" aria-label="Radio volume"><span id="radVolN">' + v + "</span></div>" : "") + "</div>" +
    // the same window a click on the box opens, as a button of its own (the box is small to hit, on a phone above all)
    '<button data-a="radinfob" class="ib" aria-label="What is playing, and about this station" title="What is playing, and about this station"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.500h.01"/></svg></button></div>';
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
    (before.length && USER ? '<p class="mut sn rnpf">Earlier songs are noted while the radio plays on this page.</p>' : "") +
    '<h3>The station</h3><div id="rnpSt">' + radStHtml(st, (RSTC[st[0]] || {}).v) + "</div>";
}
// ---- About the station itself: what we know (name, genre, language) plus, looked up once a week in the Radio Browser
// catalogue, its country, website, sound quality and a few of its own tags. One compact block under the songs. ----
var RSTC = load("sp_rst", {});
// the catalogue's formal country names, said the short way
function radCountry(c) { c = String(c || "").replace(/^The /, ""); return (/^United Kingdom/i.test(c) ? "United Kingdom" : /^United States/i.test(c) ? "United States" : /^Russian Fed/i.test(c) ? "Russia" : /^Republic Of Moldova|^Moldova/i.test(c) ? "Moldova" : /^Korea, Republic|^Republic Of Korea/i.test(c) ? "South Korea" : c).slice(0, 30); }
function radStHtml(st, v) {
  v = v || {};
  var own = /^u_/.test(st[0]), l1 = [own ? "" : st[2], st[4] && st[4] !== "—" && st[4] !== v.c ? st[4] : "", v.c].filter(Boolean).join(" · "), l2 = [v.kb ? v.kb + " kbit" + (v.codec ? " " + v.codec : "") : "", v.tags].filter(Boolean).join(" · ");
  return '<div class="rst">' + (v.logo ? '<img alt="" referrerpolicy="no-referrer" data-rm="1" loading="lazy" src="' + esc(v.logo) + '">' : "") + '<div class="rstt"><b>' + esc(st[1]) + "</b>" + (l1 ? "<small>" + esc(l1) + "</small>" : "") + (l2 ? "<small>" + esc(l2) + "</small>" : "") + "</div>" + (v.home ? linkBtn(v.home, "Website") : "") + "</div>";
}
function radStInfo(st) {
  var c = RSTC[st[0]];
  if (c && Date.now() - c.t < 604800000) return Promise.resolve(c.v);
  var uuid = /^u_[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(st[0]) ? st[0].slice(2) : "";
  return (uuid ? rbGet("stations/byuuid/" + uuid) : rbGet("stations/search?hidebroken=true&order=clickcount&reverse=true&limit=15&name=" + encodeURIComponent(st[1]))).then(function (list) {
    list = Array.isArray(list) ? list : [];
    // the same station, not just one of the same name: the same stream address, or the same stream name and a name that starts
    // the same, or exactly the same name in the country its language belongs to
    var key = radKey(st[3]), seg = radSeg(st[3]), nm = radFlat(st[1]), lang = String(st[4] || "").toLowerCase().replace(/[^a-z ]/g, ""), root = RAD_LANGC[lang] != null ? RAD_LANGC[lang] : lang.slice(0, 3);
    var u = function (s) { return String(s.url_resolved || s.url || ""); }, inC = function (s) { return !!root && String(s.country || "").toLowerCase().indexOf(root) >= 0; };
    var hit = uuid ? list[0] : list.filter(function (s) { return radKey(u(s)) === key; })[0] || list.filter(function (s) { return seg.length >= 3 && radSeg(u(s)) === seg && radFlat(s.name).indexOf(nm) === 0; })[0] || list.filter(function (s) { return radFlat(s.name) === nm && inC(s); })[0];
    var v = hit ? { c: radCountry(hit.country), home: /^https?:\/\/[^\s]+\.[^\s]+/.test(String(hit.homepage || "")) ? safeUrl(String(hit.homepage).slice(0, 300)) : "", kb: +hit.bitrate > 0 ? +hit.bitrate : 0, codec: String(hit.codec || "").replace(/[^A-Za-z0-9+]/g, "").slice(0, 8),
      tags: String(hit.tags || "").split(",").map(function (t) { return t.trim(); }).filter(function (t) { return t && t.length < 22; }).slice(0, 3).join(", "), logo: /^https:\/\//.test(String(hit.favicon || "")) ? String(hit.favicon).slice(0, 300) : "" } : {};
    RSTC[st[0]] = { t: Date.now(), v: v };
    var ks = Object.keys(RSTC);
    if (ks.length > 80) ks.sort(function (a, b) { return RSTC[a].t - RSTC[b].t; }).slice(0, ks.length - 80).forEach(function (k) { delete RSTC[k]; });
    save("sp_rst", RSTC);
    return v;
  }).catch(function () { return {}; });
}
function openRadioInfo() {
  openModal(RAD_T, radioInfoHtml());
  var st0 = radioCur();
  if (st0) radStInfo(st0).then(function (v) { var now = radioCur(); if (now && now[0] === st0[0] && !$("modal").hidden && $("mTitle").textContent === RAD_T && $("rnpSt")) $("rnpSt").innerHTML = radStHtml(st0, v); });
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
  radAll().forEach(function (r) { if (!groups[r[2]]) { groups[r[2]] = []; order.push(r[2]); } groups[r[2]].push(r); });
  $("radList").innerHTML = order.map(function (g) {
    return '<div class="sub"><b>' + esc(g) + "</b>" + groups[g].map(function (r) { return '<label><span>' + esc(r[1]) + (r[4] && r[4] !== "—" ? ' <small class="rlang">' + esc(r[4]) + "</small>" : "") + (/^u_/.test(r[0]) ? ' <button class="radx" data-a="raddel" data-k="' + esc(r[0]) + '" title="Remove this station" aria-label="Remove ' + esc(r[1]) + '">✕</button>' : "") + '</span> <input type="checkbox" data-a="radtoggle" data-k="' + r[0] + '"' + (on[r[0]] ? " checked" : "") + "></label>"; }).join("") + "</div>";
  }).join("");
}
function radioToggle(id, isOn) {
  var cur = radioIds().map(function (r) { return r[0]; }).filter(function (x) { return x !== id; });
  if (isOn) cur.push(id);
  radioSet("on", radAll().map(function (r) { return r[0]; }).filter(function (x) { return cur.indexOf(x) >= 0; }));
  render();
}

// ---- Weather (Open-Meteo, no key needed) ----
var WX = null;
var WC = { 0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers", 81: "Rain showers", 82: "Heavy showers", 85: "Snow showers", 86: "Snow showers", 95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm" };
function wxText(c) { return WC[c] || "Unknown"; }
var WXM = null, CITYRES = [];
// Until you choose a city yourself, the page guesses one from the time zone your device is set to (for example
// Europe/Stockholm gives Stockholm). The browser hands that over without asking, and no position or IP lookup is involved.
var BTZ = (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { return ""; } })();
var TZ_NAMES = { Kiev: "Kyiv", Calcutta: "Kolkata", Saigon: "Ho Chi Minh City", Rangoon: "Yangon", Katmandu: "Kathmandu", Godthab: "Nuuk", Faeroe: "Torshavn" };
function tzCityName() {
  if (!/^(Europe|America|Asia|Africa|Australia|Pacific|Atlantic|Indian)\/./.test(BTZ)) return "";
  var n = BTZ.split("/").pop().replace(/_/g, " ");
  return TZ_NAMES[n] || n;
}
var FALLCITY = { name: "Tallinn", lat: 59.437, lon: 24.7536 };
var AUTOCITY = (function () { var c = load("sp_tzcity", null); return c && c.tz === BTZ && c.name && isFinite(c.lat) && isFinite(c.lon) ? c : null; })();
// AUTOWAIT: the guessed city's position is still being looked up (first visit only), so the weather waits a moment for it
var AUTOWAIT = !AUTOCITY && !!tzCityName();
function guessCity() { return AUTOCITY || (AUTOWAIT ? { name: tzCityName(), lat: FALLCITY.lat, lon: FALLCITY.lon } : FALLCITY); }
function findAutoCity() {
  if (!AUTOWAIT) return;
  var done = function () { AUTOWAIT = false; if (!P.home) fetchWeather(); if (!P.loc) fetchClockTz(); render(); if (WIZ && $("wzPage") && $("wzPage").dataset.p === "city") wizRender(); };
  fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(tzCityName()) + "&count=10&language=en&format=json").then(function (r) { return r.json(); }).then(function (j) {
    var all = (j && j.results) || [], x = all.filter(function (y) { return y.timezone === BTZ; })[0] || all[0];
    if (x && isFinite(x.latitude) && isFinite(x.longitude)) {
      AUTOCITY = { tz: BTZ, name: String(x.name).slice(0, 60), lat: x.latitude, lon: x.longitude };
      save("sp_tzcity", AUTOCITY);
    }
    done();
  }).catch(done);
}
function homeCity() { return P.home || guessCity(); }
var LOCNAME = tzCityName() || "Tallinn", TZ = tzCityName() ? BTZ : "Europe/Tallinn";
function clockCity() { return P.loc || guessCity(); }
function fetchClockTz() {
  var c = clockCity();
  LOCNAME = c.name;
  // no city chosen: the clock simply follows the device, and the name is the guessed city
  if (!P.loc && tzCityName()) { LOCNAME = (AUTOCITY && AUTOCITY.name) || tzCityName(); TZ = BTZ; tick(); return; }
  fetch("https://api.open-meteo.com/v1/forecast?latitude=" + c.lat + "&longitude=" + c.lon + "&current=temperature_2m&timezone=auto&forecast_days=1")
    .then(function (r) { return r.json(); })
    .then(function (j) { if (j && j.timezone) { TZ = j.timezone; tick(); } })
    .catch(function () {});
}
var LOCRES = [];
function openLocationPicker() {
  openModal("Location", '<p class="mut">Sets the place shown next to the date and time, and the clock\'s timezone. The weather tile has its own location, set separately by clicking it.' + (P.loc ? "" : " Until you choose one, the place is a guess from the time zone of your device.") + '</p><div class="add"><input type="text" id="locIn" placeholder="Search a city, e.g. Stockholm"><button data-a="locgo">Search</button></div><div id="locRes"></div>');
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
  if (!P.home && AUTOWAIT) return;
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
    if (!WXM || WXM.c !== c || !$("cityBody")) return;   // the window was closed, or another city picked, in the meantime
    WXM.j = x; $("cityBody").innerHTML = x && x.current ? cityTools(c) + wxHtml(x) : '<p class="mut">Could not load the weather.</p>';
  }).catch(function () { if ($("cityBody")) $("cityBody").innerHTML = '<p class="mut">Could not load the weather.</p>'; });
}
function openWeather() {
  openModal("Weather", '<div class="add"><input type="text" id="cityIn" placeholder="Search a city, e.g. Stockholm"><button data-a="citygo">Search</button></div><div id="cityRes"></div>' + (P.home ? "" : '<p class="mut sn">' + esc(homeCity().name) + " is a guess from the time zone of your device. Not your city? Search for it above, open it, and press <b>Use for the tile</b>.</p>") + '<div id="cityChips" class="tools"></div><div id="cityBody"></div>');
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
  else if (e.target.id === "wzCity" && e.target.value.trim().length >= 2) debounced("wzCity", wizCityGo);
  else if (e.target.id === "radQ") debounced("radQ", radFind);
  else if (e.target.id === "stockIn" || (e.target.id === "wzIn" && $("wzPage") && $("wzPage").dataset.p === "stocks")) debounced("stFind", function () { stFind(e.target.id); });
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    if (e.target.id === "cityIn") cityGo();
    else if (e.target.id === "locIn") locGo();
    else if (e.target.id === "wzCity") wizCityGo();
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
    var oldHome = homeCity(), wasMine = !!P.home;   // a guessed city that turned out wrong is not kept in your list
    P.home = { name: cur.name, lat: cur.lat, lon: cur.lon };
    P.cities = (P.cities || []).filter(function (x) { return !sameCity(x, cur); });
    if (wasMine && !sameCity(oldHome, cur) &&!P.cities.some(function (x) { return sameCity(x, oldHome); }) && P.cities.length < 8) P.cities.unshift({ name: oldHome.name, lat: oldHome.lat, lon: oldHome.lon });
    persist(); WX = null; render(); fetchWeather(); showCity(cur, WXM.j);
  }
}

// ---- Stocks: details window with TradingView chart, and adding symbols ----
// A symbol picked from the search has the exchange as an ending (SAAB-B.ST); the chart wants it in front (OMXSTO:SAAB_B)
var TV_EX = { ST: "OMXSTO", HE: "OMXHEX", CO: "OMXCOP", IC: "OMXICE", TL: "OMXTSE", RG: "OMXRSE", VS: "OMXVSE", OL: "OSL", DE: "XETR", F: "FWB", L: "LSE", PA: "EURONEXT", AS: "EURONEXT", BR: "EURONEXT", LS: "EURONEXT", IR: "EURONEXT", MI: "MIL", MC: "BME", SW: "SIX", VI: "VIE", WA: "GPW", TO: "TSX", V: "TSXV", AX: "ASX", HK: "HKEX", T: "TSE", KS: "KRX", NS: "NSE", BO: "BSE", SS: "SSE", SZ: "SZSE", SA: "BMFBOVESPA", MX: "BMV" };
function tvSym(id) {
  if (id.indexOf(":") >= 0) return id;
  var m = /^([A-Z0-9-]+)\.([A-Z]{1,2})$/.exec(id), c = /^([A-Z0-9]{2,10})-USD$/.exec(id);
  if (m && TV_EX[m[2]]) return TV_EX[m[2]] + ":" + (m[2] === "HK" ? m[1].replace(/^0+/, "") : m[1].replace(/-/g, "_"));
  return c ? c[1] + "USD" : id.replace(/-/g, ".");
}
function openStock(id) {
  var s = tk(id), q = QUOTES[s], se = encodeURIComponent(s.replace(/_/g, "-"));
  var lk = function (u, l) { return '<a class="lnk2" target="_blank" rel="noopener noreferrer" href="' + u + '">' + l + "</a>"; };
  openModal(id, (q ? '<div class="mrow sthead"><b class="big">' + q.p.toFixed(2) + "</b>" + (q.c != null ? '<span class="' + (q.c >= 0 ? "up" : "down") + '">' + (q.c >= 0 ? "▲ +" : "▼ ") + q.c.toFixed(2) + "% today</span>" : "") + "</div>" : "") +
    '<div id="tv" class="tv"></div><div id="stInfo"><p class="mut sn">Loading news…</p></div>' +
    '<p class="stlinks">' + lk("https://www.tradingview.com/chart/?symbol=" + encodeURIComponent(tvSym(id)), "TradingView") + lk("https://finance.yahoo.com/quote/" + se, "Yahoo Finance") + lk("https://stocktwits.com/symbol/" + se, "StockTwits") + lk("https://www.reddit.com/search/?q=" + se + "&sort=new", "Reddit") + lk("https://news.google.com/search?q=" + se + "%20stock", "Google News") + '<button class="lnk2" data-a="paopen" data-k="' + esc(id) + '">Set a price alert</button></p>');
  loadStockNews(id);
  var box = document.createElement("div"); box.className = "tradingview-widget-container"; box.style.height = "100%";
  var inner = document.createElement("div"); inner.className = "tradingview-widget-container__widget"; inner.style.height = "100%";
  box.appendChild(inner);
  var sc = document.createElement("script"); sc.async = true;
  sc.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
  sc.text = JSON.stringify({ autosize: true, symbol: tvSym(id), interval: "D", timezone: "Europe/Tallinn", theme: P.theme, style: "1", locale: "en", allow_symbol_change: false, hide_side_toolbar: true });
  box.appendChild(sc);
  $("tv").appendChild(box);
}
document.addEventListener("submit", function (e) {
  if (e.target.id !== "addStock") return;
  e.preventDefault();
  var v = $("stockIn").value.trim().toUpperCase();
  if (!v) return;
  if (!P.stocks) P.stocks = DATA.stocks.map(function (x) { return { id: x.id, name: x.name, p: x.p, c: x.c }; });
  // a name with spaces (or anything else that cannot be a symbol) is a search, not a symbol: point at the list instead
  var okSym = /^[A-Z0-9^][A-Z0-9._:=^!&-]{0,39}$/.test(v), pick = "Pick the company from the list under the field, or type its exact symbol (like NVDA).";
  var add = function (nm) {
    if (!P.stocks.some(function (x) { return x.id === v; })) P.stocks.push({ id: v, name: nm || "", p: null, c: null });
    delete P.hidden["s:" + v];
    $("stockIn").value = ""; STFOR = ""; if ($("stockRes")) $("stockRes").innerHTML = ""; stMsg("Added " + v + ".");
    persist(); render(); fetchQuotes(true);
  };
  // A full name (NASDAQ:NVDA) or a currency pair (BTCUSD) is added as it is. Anything else is checked against the search first,
  // so that typing "Tesla" and pressing Enter shows the list instead of adding a symbol called TESLA.
  if (okSym && (v.indexOf(":") >= 0 || /^[A-Z0-9]{2,10}USDT?$/.test(v) || !sb || !USER)) { add(); return; }
  if (!sb || !USER) { stMsg(pick); return; }
  sb.functions.invoke("quotes", { body: { find: v } }).then(function (r) {
    var f = r.data && Array.isArray(r.data.found) ? r.data.found : [], same = f.filter(function (x) { return x && x.s === v; })[0];
    if (same || (okSym && !f.length)) { add(same && String(same.n || "").slice(0, 80)); return; }
    stMsg(f.length ? pick : "No company or symbol found for that.");
    if (f.length && $("stockIn").value.trim().toUpperCase() === v) stFind("stockIn");
  }).catch(function () { if (okSym) add(); else stMsg(pick); });
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
  if (a === "sumshow" || a === "sumpick" || a === "summv") { sumAct(a, k); return; }
  if (/^tv(open|filt|fav|del)$/.test(a)) { tvAct(a, k); return; }
  if (/^rad(go|add|addurl|try|del|tick)$/.test(a)) { radAct(a, k); return; }
  if (a === "mkopen" || a === "mkrow") { mkAct(a, k); return; }
  if (a === "bmimpgo") { bmImpGo(); return; }
  if (a === "bmimpno") { BMIMP = null; bmImpDraw(); bmImpMsg(""); return; }
  if (/^ics(impgo|impno|reload|del)$/.test(a)) { icsAct(a, k); return; }
  if (a === "stpick") { stPick(k); return; }
  if (a === "stimpgo") { stImpGo(); return; }
  if (a === "stimpno") { STIMP = null; stImpDraw(); stMsg(""); return; }
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
  if (a === "setpanel") { MENU_OPEN = ""; render(); $("panel").hidden = false; setSec(SETSEC); renderNfLog(); renderBmSet(); renderClkSet(); renderIcsSet(); renderEmbSet(); renderTvSet(); return; }
  if (/^(ckreset|wcgo|wcadd|wcdel|wcmv)$/.test(a)) { clkAct(a, k); return; }
  if (a.indexOf("bm") === 0 && /^bm(folder|add|addf|colreset|mv|del|pick|icon|colclr)$/.test(a)) { if (a === "bmfolder") e.stopPropagation(); bmAct(a, k); return; }
  if (a === "openhelp") { MENU_OPEN = ""; render(); openHelp(); return; }
  if (a === "openfb") { MENU_OPEN = ""; render(); $("panel").hidden = true; FBMSG = ""; openFeedback(); return; }
  if (a === "fbkind") { fbKeep(); FB.kind = k; FBMSG = ""; openFeedback(); return; }
  if (a === "fbsend") { fbSend(); return; }
  if (a === "helpjump") { var sec = $("help-" + k); if (sec) sec.scrollIntoView({ block: "start" }); return; }
  if (a === "copycode") {
    var code = $("gsCode").textContent;
    (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(function () {
      b.textContent = "Copied!"; setTimeout(function () { b.textContent = "Copy the code"; }, 2000);
    }).catch(function () { alert("Could not copy automatically. Select the text below and copy it manually (Ctrl+C or Cmd+C)."); });
    return;
  }
  if (a === "radinfob") { openRadioInfo(); return; }
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
  if (/^cal(day|nav|del|jump|rep|edit|cancel)$/.test(a)) { calAct(a, k); return; }
  if (a === "paopen" || a === "padel") { paAct(a, k); return; }
  if (a === "icsexport") { icsExport(); return; }
  if (a === "openbrief") { MENU_OPEN = ""; render(); openBrief(); return; }
  if (a === "toastx" || a === "toastgo") { toastAct(a, k); return; }
  if (a === "nftest") { toast("news", "Test notification", "This is what a notification looks like. Click it or press ✕.", { a: "settings" }, false, true); return; }
  if (a === "sidedock") { var sd = k.split(":"); sideDock(sd[0], sd[1]); return; }
  if (a === "boxoff") { setBoxOff(k, true); return; }
  if (a === "boxtoggle") { setBoxOff(k, !b.checked); return; }
  if (a === "spfav") { if (ES_CUR && !$("modal").hidden) { spToggleFav(k); esOpen(ES_CUR); } else spToggleFav(k, SP_OPEN); return; }
  if (a === "fighter") { openFighter(k); return; }
  if (a === "spside") { SP_SIDE = k === "a" ? "a" : "h"; var se = spFind(SP_OPEN), sd = se && SP_SUM[se.id]; if (sd) spSumDraw(se, sd.d); return; }
  if (a === "spses") { SP_SES = k; openSport(SP_OPEN); return; }
  if (a === "spgame") { var ge = spFind(SP_OPEN), gd = ge && SP_SUM[ge.id]; if (gd) { SP_GAME[ge.id] = +k; spSumDraw(ge, gd.d); } return; }
  if (a === "esteam" || a === "esplayer") { if (ES_CUR) ES_BACK.push(ES_CUR); else ES_BACK = SP_OPEN ? [SP_OPEN] : []; esOpen((a === "esteam" ? "team|" : "player|") + k); return; }
  if (a === "esback") { var eb = ES_BACK.pop(); ES_CUR = ""; if (!eb) closeModal(); else if (/^(team|player)\|/.test(eb)) esOpen(eb); else openSport(eb); return; }
  if (a === "sptoggle") { spToggleLeague(k, b.checked); return; }
  if (a === "spreset") { delete P.spLeagues; persist(); render(); fetchSports(true); return; }
  if (a === "setsec") { setSec(+k); return; }
  if (a === "setfind") { setFind(+k); return; }
  if (a === "boxerr") { openBoxErr(k); return; }
  if (a === "setgo") { openSettingsAt(k); return; }
  if (a === "sdset") { sdSet(k, b.checked); return; }
  if (a === "nextday") { if (/^\d{4}-\d\d-\d\d$/.test(k || "")) { CALV = { y: +k.slice(0, 4), m: +k.slice(5, 7) - 1, sel: k }; openCal(); } return; }
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
  if (a === "bellmenu") { e.stopPropagation(); MENU_OPEN = MENU_OPEN === "bell" ? "" : "bell"; if (MENU_OPEN) { NLOG.forEach(function (x) { x.seen = 1; }); save("sp_nlog", NLOG); sy().nseen = Date.now(); persist(); } render(); return; }
  if (a === "bellgo") { var be = NLOG[+k]; MENU_OPEN = ""; render(); if (be) runAct(be.act); return; }
  if (a === "bellclear") { NLOG = []; save("sp_nlog", NLOG); sy().nclear = Date.now(); sy().nseen = Date.now(); persist(); MENU_OPEN = ""; render(); return; }
  if (a === "rdrefresh") { fetchReddit(true); return; }
  if (a === "srcdel") { delSrc(k); return; }
  if (a === "dock") { dockAdd(k); return; }
  if (a === "undock") { undock(k); return; }
  if (a === "dockchat") { dockChat(k); return; }
  if (a === "mailread") { markRead(+k); return; }
  if (a === "mailall") { showAllMail(+k); return; }
  if (a === "mail") { openMail(+k); return; }
  if (a === "spfilt") { SPFIND = !(SPFIND || SPQ); if (!SPFIND) SPQ = ""; render(); var sq = $("spQ"); if (sq) { sq.value = ""; sq.focus(); } return; }
  if (a === "bfilt") { FON[k] = !(FON[k] || FQ[k]); if (!FON[k]) FQ[k] = ""; render(); var bq = $(k === "tg" ? "tgQ" : "rdQ"); if (bq) { bq.value = ""; bq.focus(); } return; }
  if (a === "nfilt") { NFILT = !(NFILT || NQ); if (!NFILT) NQ = ""; render(); var q = $("newsQ"); if (q) { q.value = ""; q.focus(); } return; }
  if (a === "twpop") { twPop(k); return; }
  if (a === "twchat") { twChat(k); return; }
  if (a === "nseen") { markSeen(k); render(); return; }
  if (/^twd/.test(a)) { twdAct(a, k); return; }
  if (/^site(more|clear|cal|sec)$/.test(a)) { siteAct(a, k); return; }
  if (a === "rdropen") { openReader(k, "", true); return; }
  if (a === "rdrflip") { rdrFlip(); return; }
  if (a === "rdrolder") { loadOlderTG(); return; }
  if (a === "rdrcom") { rdrCom(k); return; }
  if (a === "refresh") { refreshBox(k); return; }
  if (a === "more") { if (k === "tg" || k === "news") { MORE[k] += 20; render(); if (k === "tg") tgTopUp(); } return; }
  if (a === "actload") { loadActivity(); return; }
  if (a === "actout") { if (sb && USER && confirm("Sign out every other device and browser that is signed in to this account? This one stays signed in.")) sb.auth.signOut({ scope: "others" }).then(loadActivity); return; }
  if (a === "nsearch") { window.open("https://news.google.com/search?q=" + encodeURIComponent(k), "_blank", "noopener"); return; }
  if (a === "later" || a === "laterdone" || a === "lateropen") { e.stopPropagation(); laterAct(a, k); return; }
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
// Whether to list the Admin entry in Settings. The page does not know who the owner is: after you sign in it asks the
// feeds function, which checks your sign-in against its own private list. (Showing the entry gives nobody access;
// the admin page asks the function again for everything it shows.) The answer is remembered for 12 hours.
var IS_ADMIN = false;
function isAdmin() { return !!USER && IS_ADMIN; }
function checkAdmin() {
  IS_ADMIN = false;
  if (!sb || !USER) return;
  var uid = USER.id, c = load("sp_adm", null);
  if (c && c.u === uid && Date.now() - c.t < 43200000) { IS_ADMIN = !!c.a; buildSetNav(); return; }
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { admin: { op: "am" } } }).then(function (r) {
    if (!USER || USER.id !== uid) return;
    IS_ADMIN = !!(r.data && r.data.ok === true && r.data.admin === true);
    save("sp_adm", { u: uid, a: IS_ADMIN ? 1 : 0, t: Date.now() });
    buildSetNav();
  }).catch(function () {});
}
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
$("cNext").oninput = function (e) { P.nextCol = e.target.value; persist(); applyTheme(); };
$("cNextReset").onclick = function () { delete P.nextCol; persist(); applyTheme(); };
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
    '<p class="mut sn">' + (up ? "A free account saves your boxes, sources, notes and layout, and brings them to any device. All it needs is an email address and a password you choose here; the email is only used to sign you in and to send the confirmation and password-reset emails." : "Sign in to load your own setup.") + "</p>" +
    // a real form around the sign-in fields tells the browser exactly which fields are the login (and that the others on the page are not)
    '<form class="nosub"><label>Email<input type="email" id="acctEmail" name="email" autocomplete="' + (up ? "email" : "username") + '" placeholder="you@example.com"></label>' +
    '<label>Password<input type="password" id="acctPass" name="password" autocomplete="' + (up ? "new-password" : "current-password") + '"' + (up ? ' placeholder="At least 8 characters"' : "") + "></label>" +
    (up ? '<label>Repeat password<input type="password" id="acctPass2" autocomplete="new-password"></label>' : "") +
    '<div id="acctMsg" class="sn" role="status">' + esc(ACCTMSG) + "</div>" +
    '<button type="button" class="pri" data-a="' + (up ? "signup" : "signin") + '">' + (up ? "Create account" : "Sign in") + "</button></form>" +
    (up ? '<p class="mut sn"><b>What happens next:</b> 1) you get an email with a confirmation link (look in spam if it is not there within a minute), 2) click the link, 3) come back here and sign in. A short guide then helps you pick your boxes and set them up; every step in it can be skipped.</p>'
        : '<button class="lnk2" data-a="forgotpw">Forgot password?</button>') + "</div>");
  $("acctEmail").value = keep;
  (keep ? $("acctPass") : $("acctEmail")).focus();
}
// ---- Saving to your account, and keeping several devices in step ----
// Everything you set up is one object (P) saved as a whole. So that a page left open on one device does not overwrite
// what you did on another: (1) before saving, the page looks whether the account's copy changed since it last saw it, and
// if so merges the two instead of overwriting; (2) when you come back to the page, and once a minute, it fetches a newer copy.
// BASE is the account's copy as this page last saw it; SYNC_AT is when that copy was saved.
var BASE = null, SYNC_AT = 0, PREFS_READY = false, SAVE_WANTED = false, syncBusy = false;
function cloneP(o) { return JSON.parse(JSON.stringify(o)); }
function sameP(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function isPlain(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
function isIdList(x) { return Array.isArray(x) && x.every(function (i) { return isPlain(i) && i.id != null; }); }
// Three-way merge: what changed here since BASE, and what changed on the other device since BASE, are both kept.
// Lists of things with an id (notes, to-dos, events, timers, stocks...) are merged item by item, so an item added on
// one device and an item deleted on the other both come out right. If the very same thing was changed on both, this device wins.
function merge3(base, mine, theirs) {
  if (sameP(mine, theirs) || sameP(theirs, base)) return mine;
  if (sameP(mine, base)) return theirs;
  if (isIdList(mine) && isIdList(theirs)) {
    var b = {}, t = {}, m = {}, out = [];
    (Array.isArray(base) ? base : []).forEach(function (i) { if (isPlain(i) && i.id != null) b[i.id] = i; });
    theirs.forEach(function (i) { t[i.id] = i; });
    mine.forEach(function (i) { m[i.id] = i; });
    mine.forEach(function (i) {
      if (i.id in t) out.push(merge3(b[i.id], i, t[i.id]));
      else if (!(i.id in b) || !sameP(i, b[i.id])) out.push(i);   // added or changed here; otherwise it was deleted there
    });
    theirs.forEach(function (i) { if (!(i.id in m) && !(i.id in b)) out.push(i); });   // added there
    return out;
  }
  if (isPlain(mine) && isPlain(theirs)) {
    var o = {}, bb = isPlain(base) ? base : {};
    Object.keys(mine).concat(Object.keys(theirs)).forEach(function (k) {
      if (k in o) return;
      var v = merge3(bb[k], mine[k], theirs[k]);
      if (v !== undefined) o[k] = v;
    });
    return o;
  }
  return mine;
}
// merge3, and then for the "seen up to here" times the later of the two devices always wins
function mergeP(base, mine, theirs) {
  var m = merge3(base, mine, theirs), a = m && m.sy, b = theirs && theirs.sy;
  if (isPlain(a) && isPlain(b)) {
    ["nalert", "nclear", "nseen"].forEach(function (k) { if ((+b[k] || 0) > (+a[k] || 0)) a[k] = b[k]; });
    ["seen", "mail"].forEach(function (g) { if (isPlain(b[g])) { if (!isPlain(a[g])) a[g] = {}; Object.keys(b[g]).forEach(function (k) { if ((+b[g][k] || 0) > (+a[g][k] || 0)) a[g][k] = b[g][k]; }); } });
  }
  return m;
}
function syncApply(prefs) {
  P = Object.assign({ theme: "dark", accent: DEFAULT_ACCENT, fav: {}, hidden: {} }, prefs);
  adoptSync();
  save("sp_prefs", P); applyTheme(); render(); renderClocks();
}
function syncRow(uid, cols) { return sb.from("user_prefs").select(cols).eq("user_id", uid).maybeSingle(); }
function persist() {
  save("sp_prefs", P);
  if (!sb || !USER) return;
  if (!PREFS_READY) { SAVE_WANTED = true; return; }   // the account's copy has not arrived yet: never overwrite it unseen
  clearTimeout(saveTimer);
  SAVE_WANTED = true;
  saveTimer = setTimeout(syncSave, 600);
}
function syncSave() {
  if (!sb || !USER) return;
  if (syncBusy) { clearTimeout(saveTimer); saveTimer = setTimeout(syncSave, 400); return; }
  var uid = USER.id, end = function () { syncBusy = false; };
  syncBusy = true; SAVE_WANTED = false;
  syncRow(uid, "updated_at").then(function (r) {
    var at = r.data && r.data.updated_at ? Date.parse(r.data.updated_at) : 0;
    if (r.error || !at || !BASE || at === SYNC_AT) return;
    // another device saved in the meantime: take its changes in before saving
    return syncRow(uid, "prefs,updated_at").then(function (q) {
      if (!USER || USER.id !== uid || q.error || !q.data || !q.data.prefs || !q.data.prefs.theme) return;
      var merged = mergeP(BASE, P, q.data.prefs);
      BASE = cloneP(q.data.prefs); SYNC_AT = Date.parse(q.data.updated_at) || 0;
      if (!sameP(merged, P)) syncApply(merged);
    });
  }).then(function () {
    if (!USER || USER.id !== uid) return;
    var snap = cloneP(P), at = new Date().toISOString();
    return sb.from("user_prefs").upsert({ user_id: uid, prefs: snap, updated_at: at }).select("updated_at").maybeSingle().then(function (r) {
      if (r.error) { setMsg("Could not save to your account: " + r.error.message); SAVE_WANTED = true; return; }
      BASE = snap; SYNC_AT = Date.parse((r.data && r.data.updated_at) || at) || 0;
    });
  }).then(end, end);
}
// A newer copy on the account (saved by another device or tab)? Fetch it. Anything changed here and not saved yet is merged in.
function syncPull() {
  if (!sb || !USER || !PREFS_READY || syncBusy || SAVE_WANTED || document.hidden) return;
  var uid = USER.id, end = function () { syncBusy = false; };
  syncBusy = true;
  syncRow(uid, "updated_at").then(function (r) {
    var at = r.data && r.data.updated_at ? Date.parse(r.data.updated_at) : 0;
    if (r.error || !at || at === SYNC_AT) return;
    return syncRow(uid, "prefs,updated_at").then(function (q) {
      if (!USER || USER.id !== uid || q.error || !q.data || !q.data.prefs || !q.data.prefs.theme) return;
      var merged = BASE ? mergeP(BASE, P, q.data.prefs) : q.data.prefs, mineToo = !sameP(merged, q.data.prefs);
      BASE = cloneP(q.data.prefs); SYNC_AT = Date.parse(q.data.updated_at) || 0;
      if (!sameP(merged, P)) syncApply(merged);
      if (mineToo) persist();
    });
  }).then(end, end);
}
window.addEventListener("focus", function () { setTimeout(syncPull, 200); });
setInterval(syncPull, 60000);
var TITLE0 = document.title;
// a saved sign-in in this browser: hide the visitor parts at once, so they do not flash by before the account has loaded
try { for (var ti = 0; ti < localStorage.length; ti++) if (/^sb-.+-auth-token$/.test(localStorage.key(ti) || "")) { $("intro").hidden = true; $("ftLinks").hidden = true; document.title = "OmniTree"; break; } } catch (e) {}
function renderAccount() {
  $("who").textContent = USER ? "signed in as " + USER.email : "not signed in";
  $("pwSignedIn").hidden = !USER;
  $("pwSignedOut").hidden = !!USER;
  $("delSignedIn").hidden = !USER; $("delSignedOut").hidden = !!USER;
  // the introduction, the links to the plain pages and the long title are for visitors; signed in, the page is just yours
  $("intro").hidden = !!USER; $("ftLinks").hidden = !!USER;
  document.title = USER ? "OmniTree" : TITLE0;
  buildSetNav();
}
function onUser(u) {
  USER = u;
  if (u && PREVIEW) { PREVIEW = false; NEWS = []; TGP = []; RD = []; YTV = load("sp_ytv", []); NEWSV++; }
  renderAccount(); render();
  if (!u) return;
  loadWall(u);
  PREFS_READY = false; BASE = null; SYNC_AT = 0; SAVE_WANTED = false;
  sb.from("user_prefs").select("prefs,updated_at").eq("user_id", u.id).maybeSingle().then(function (r) {
    var isNew = false;
    if (r.error) { setMsg("Could not load your settings: " + r.error.message); return; }
    PREFS_READY = true; SAVE_WANTED = false;
    if (r.data && r.data.prefs && r.data.prefs.theme) {
      P = Object.assign({ theme: "dark", accent: DEFAULT_ACCENT, fav: {}, hidden: {} }, r.data.prefs);
      BASE = cloneP(r.data.prefs); SYNC_AT = Date.parse(r.data.updated_at) || 0;
      adoptSync();
      save("sp_prefs", P); applyTheme(); render();
    } else { persist(); isNew = true; }   // no saved settings yet: a brand-new account
    if (!$("modal").hidden && $("mTitle").textContent === "Account") closeModal();
    var resume = null; try { resume = JSON.parse(sessionStorage.getItem("sp_wiz") || "null"); sessionStorage.removeItem("sp_wiz"); } catch (e) {}
    if (resume) setTimeout(function () { openWizard(resume); }, 300);
    else if (isNew && !P.onboarded) setTimeout(function () { openWizard(); }, 600);
    checkDevice(); checkAdmin();
    fetchQuotes(); fetchTwitch(); fetchYT(); fetchNews(); fetchMail(); fetchReddit(); fetchSports(); loadMailForm(); loadExtraForm(); renderSources(); renderClocks(); renderSide(); fetchWeather(); fetchClockTz(); fetchIcs();
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
  try { ["sp_prefs", "sp_wall", "sp_twitch", "sp_nread", "sp_nalert", "sp_notified", "sp_brief", "sp_nlog", "sp_mailts0", "sp_mailts1", "sp_ytv", "sp_first", "sp_adm"].forEach(function (x) { localStorage.removeItem(x); }); } catch (ex) {}
  P = { theme: P.theme, accent: P.accent, colors: P.colors, fs: P.fs, dockW: P.dockW, home: P.home, cities: P.cities, aurora: P.aurora, shadow: P.shadow, fav: {}, hidden: {} };
  TW = []; TWC = false; TWUID = null; LIVEPREV = null; MAIL = []; NEWS = []; NEWSALL = []; TGP = []; RD = []; NLOG = []; NEWSV++; READ = {}; YTV = []; QUOTES = {}; QLOADED = false; NG = []; USER = null; IS_ADMIN = false;
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
// ---- Visitor log for the site owner: one line per visit to the front page, signed in or not ----
// The database itself notes the IP address and country the request came from; the page only adds where the visitor
// came from (the site's name, not the full address), their language and their time zone. Once per page load.
// ---- Feedback (cogwheel → Feedback): a bug, an improvement or an idea, sent to the site owner ----
// What is typed is kept in FB while the page is open, so switching type or closing the window by mistake loses nothing.
var FB = { kind: "bug", area: "", freq: "", title: "", a: "", b: "", c: "", contact: "", tech: true }, FBMSG = "", FBBUSY = false;
var FB_KINDS = [["bug", "Something is broken"], ["improve", "Make it better"], ["idea", "Something new"], ["other", "Other"]];
var FB_AREAS = ["The whole page", "News", "Telegram", "Reddit", "Twitch", "YouTube", "Stocks", "Sports", "Mail", "Weather", "Radio", "Calendar", "Notes & to-dos", "Timers & alarms", "Search bar", "Settings", "Account & sign-in", "Setup guide", "Layout & looks", "Notifications", "Phone / small screen", "Something else"];
var FB_FREQ = ["Every time", "Often", "Sometimes", "It happened once"];
// per type: the one-line placeholder, then the questions [field, label, placeholder, rows]
var FB_Q = {
  bug: ["e.g. Sports box shows the wrong score", [["a", "What went wrong?", "What you saw, and any message that was on the screen.", 3], ["b", "How can it be made to happen again?", "1. I opened …\n2. I clicked …\n3. Then …", 3], ["c", "What did you expect to happen? (optional)", "", 2]]],
  improve: ["e.g. Make the stock chart bigger", [["a", "What should be better?", "What it is like today and what bothers you about it.", 3], ["b", "How would you like it to work? (optional)", "", 3]]],
  idea: ["e.g. A box for podcasts", [["a", "What should it do?", "Describe it as if it already existed.", 3], ["b", "When would you use it? (optional)", "", 2]]],
  other: ["What is it about?", [["a", "Your message", "", 5]]]
};
function fbKeep() {
  var v = function (id, key) { if ($(id)) FB[key] = $(id).value; };
  v("fbArea", "area"); v("fbFreq", "freq"); v("fbTitle", "title"); v("fbA", "a"); v("fbB", "b"); v("fbC", "c"); v("fbContact", "contact");
  if ($("fbTech")) FB.tech = $("fbTech").checked;
}
// what is attached when "technical details" is ticked: enough to find a bug, nothing the person has saved
function fbInfo() {
  var off = [], errs = [], tz = "";
  ["weather", "mail", "live", "news", "telegram", "twitch", "youtube", "stocks", "reddit", "sports"].forEach(function (id) {
    try { if (boxOff(id)) off.push(id); else boxErrs(id).forEach(function (x) { errs.push((id + ": " + x.what + " – " + x.why).slice(0, 160)); }); } catch (e) {}
  });
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
  return { v: VERSION, ua: String(navigator.userAgent || "").slice(0, 300), win: innerWidth + "x" + innerHeight, scr: screen.width + "x" + screen.height, theme: document.documentElement.getAttribute("data-theme") || "", lang: navigator.language || "", tz: tz, off: off, errs: errs.slice(0, 8) };
}
function openFeedback() {
  var q = FB_Q[FB.kind] || FB_Q.other, opt = function (list, cur, first) { return '<option value="">' + first + "</option>" + list.map(function (x) { return "<option" + (x === cur ? " selected" : "") + ">" + esc(x) + "</option>"; }).join(""); };
  openModal("Feedback", '<div class="auth fb"><div class="seg">' + FB_KINDS.map(function (x) { return '<button data-a="fbkind" data-k="' + x[0] + '"' + (FB.kind === x[0] ? ' class="on"' : "") + ">" + x[1] + "</button>"; }).join("") + "</div>" +
    '<div class="fbrow"><label>What is it about?<select id="fbArea">' + opt(FB_AREAS, FB.area, "Choose…") + "</select></label>" +
    (FB.kind === "bug" ? '<label>How often does it happen?<select id="fbFreq">' + opt(FB_FREQ, FB.freq, "Choose…") + "</select></label>" : "") + "</div>" +
    '<label>In one line<input type="text" id="fbTitle" maxlength="120" autocomplete="off" placeholder="' + esc(q[0]) + '"></label>' +
    q[1].map(function (f) { return "<label>" + f[1] + '<textarea id="fb' + f[0].toUpperCase() + '" rows="' + f[3] + '" maxlength="3000" placeholder="' + esc(f[2]) + '"></textarea></label>'; }).join("") +
    (USER ? "" : '<label>Your email (optional, only if you want an answer)<input type="email" id="fbContact" maxlength="150" autocomplete="email" placeholder="you@example.com"></label>') +
    '<label class="fbchk"><input type="checkbox" id="fbTech"' + (FB.tech ? " checked" : "") + '><span>Attach technical details <span class="mut">(site version, browser, window size, theme, which boxes are switched off and what is failing to load right now; nothing you have saved)</span></span></label>' +
    '<div id="fbMsg" class="sn" role="status">' + esc(FBMSG) + "</div>" +
    '<button class="pri" data-a="fbsend">Send feedback</button>' +
    '<p class="mut sn">' + (USER ? "Sent with your account email, so you can get an answer." : "You do not need an account to send this.") + " The more detail, the easier it is to fix or build.</p></div>");
  $("fbTitle").value = FB.title;
  q[1].forEach(function (f) { $("fb" + f[0].toUpperCase()).value = FB[f[0]] || ""; });
  if ($("fbContact")) $("fbContact").value = FB.contact;
  $("fbTitle").focus();
}
function fbSend() {
  if (FBBUSY) return;
  fbKeep();
  var say = function (t, id) { FBMSG = t; if ($("fbMsg")) $("fbMsg").textContent = t; if (id && $(id)) $(id).focus(); };
  if (!sb) { say("Feedback cannot be sent right now: the page has no connection to the server."); return; }
  if (FB.title.trim().length < 4) { say("Sum it up in one line first.", "fbTitle"); return; }
  if (FB.a.trim().length < 10) { say("Describe it in a sentence or two.", "fbA"); return; }
  if (FB.kind === "bug" && FB.b.trim().length < 5) { say("Say how to make it happen again, even roughly. That is what makes a bug fixable.", "fbB"); return; }
  var q = FB_Q[FB.kind][1], has = function (f) { return q.some(function (x) { return x[0] === f; }); };
  FBBUSY = true; say("Sending…");
  sb.rpc("send_feedback", { p: { kind: FB.kind, area: FB.area, freq: FB.kind === "bug" ? FB.freq : "", title: FB.title.trim(), a: FB.a.trim(), b: has("b") ? FB.b.trim() : "", c: has("c") ? FB.c.trim() : "", contact: USER ? "" : FB.contact.trim(), info: FB.tech ? fbInfo() : null } }).then(function (r) {
    FBBUSY = false;
    if (r.error) {
      var m = String(r.error.message || "");
      say(/limit/i.test(m) ? "You have sent several in a short time. Try again in an hour." : /could not find|does not exist|schema cache/i.test(m) ? "Feedback is not switched on yet. Please try again later." : "Could not send: " + m);
      return;
    }
    FB.title = FB.a = FB.b = FB.c = ""; FBMSG = "";
    openModal("Feedback", '<div class="auth fb"><p><b>Thank you, it was sent.</b></p><p class="mut sn">It is read by a person.' + (USER || FB.contact.trim() ? " If a question comes up you will get an email." : "") + '</p><button class="pri" data-a="openfb">Send another</button></div>');
  }, function () { FBBUSY = false; say("Could not send. Check your connection and try again."); });
}

function logVisit() {
  if (!sb) return;
  var ref = "";
  try { ref = document.referrer ? new URL(document.referrer).hostname : ""; if (ref === location.hostname) ref = ""; } catch (e) {}
  var tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
  try { sb.rpc("log_visit", { p_ref: ref, p_lang: navigator.language || "", p_tz: tz }).then(function () {}, function () {}); } catch (e) {}
}
function initAuth() {
  setTimeout(logVisit, 3000);   // after the sign-in state is known, so a signed-in visit carries its account
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
var GS_CODE = '// Paste this whole file into your Apps Script project (replace what is there), then\n// Deploy &gt; Manage deployments &gt; pencil &gt; Version: New version &gt; Deploy.\nfunction out(text) {\n  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);\n}\n\nfunction doGet(e) {\n  try {\n    return handle(e);\n  } catch (err) {\n    return out(JSON.stringify({ error: String(err &amp;&amp; err.message ? err.message : err) }));\n  }\n}\n\nfunction handle(e) {\n  var p = PropertiesService.getScriptProperties();\n  var token = p.getProperty(&quot;T&quot;);\n  var given = e &amp;&amp; e.parameter ? e.parameter.t : &quot;&quot;;\n  if (!token) {\n    if (given) return out(JSON.stringify({ error: &quot;Open this address in your browser with nothing after /exec to get your token.&quot; }));\n    token = Utilities.getUuid();\n    p.setProperty(&quot;T&quot;, token);\n    return out(JSON.stringify({ setup: &quot;Copy this token into the site (Settings, Gmail accounts). It is shown only once.&quot;, token: token }));\n  }\n  if (given !== token) return out(JSON.stringify({ error: &quot;Wrong token&quot; }));\n\n  var since = parseInt(e.parameter.since, 10) || 0;   // seconds; the moment you pressed &quot;Mark read&quot; on the site\n  var cache = CacheService.getScriptCache();\n  var key = &quot;m&quot; + since;\n  var hit = cache.get(key);\n  if (hit) return out(hit);\n\n  var email = Session.getEffectiveUser().getEmail();\n  var items = GmailApp.search(&quot;in:inbox is:unread&quot;, 0, 20).map(function (t) {\n    var msgs = t.getMessages();\n    var m = msgs[msgs.length - 1];\n    return {\n      from: m.getFrom(),\n      subject: m.getSubject(),\n      snippet: m.getPlainBody().replace(/\\s+/g, &quot; &quot;).slice(0, 200),\n      ts: m.getDate().getTime(),\n      link: &quot;https://mail.google.com/mail/?authuser=&quot; + encodeURIComponent(email) + &quot;#inbox/&quot; + t.getId()\n    };\n  }).sort(function (a, b) { return b.ts - a.ts; });\n  var fresh = since ? GmailApp.search(&quot;in:inbox is:unread after:&quot; + since, 0, 30).length : null;\n  var text = JSON.stringify({ email: email, unread: GmailApp.getInboxUnreadCount(), fresh: fresh, items: items });\n  cache.put(key, text, 120);\n  return out(text);\n}\n\n// Lets the site email you its notifications. It can only write to this same Gmail address, and needs the token.\nfunction doPost(e) {\n  try {\n    var p = PropertiesService.getScriptProperties();\n    var token = p.getProperty(&quot;T&quot;);\n    var d = JSON.parse(e.postData.contents);\n    if (!token || d.t !== token) return out(JSON.stringify({ error: &quot;Wrong token&quot; }));\n    MailApp.sendEmail(Session.getEffectiveUser().getEmail(), String(d.subject || &quot;OmniTree&quot;).slice(0, 200), String(d.body || &quot;&quot;).slice(0, 8000));\n    return out(JSON.stringify({ sent: true }));\n  } catch (err) {\n    return out(JSON.stringify({ error: String(err &amp;&amp; err.message ? err.message : err) }));\n  }\n}\n\n// Run this once from the editor only if you lose the token and need a new one.\nfunction resetToken() {\n  PropertiesService.getScriptProperties().deleteProperty(&quot;T&quot;);\n}\n';
function openHelp() {
  var toc = [
    ["signin", "Signing in"], ["weather", "Weather &amp; Location"], ["mail", "Mail (Gmail)"], ["stocks", "Stocks"],
    ["news", "News &amp; Telegram"], ["twitch", "Twitch"], ["youtube", "YouTube"], ["radio", "Radio"],
    ["timers", "Timers, countdowns &amp; stopwatch"], ["notes", "Notes"], ["wallpaper", "Wallpaper"],
    ["edit", "Colors, text size &amp; layout"], ["dock", "Watching while you browse"], ["reddit", "Reddit"], ["sports", "Sports"], ["tv", "TV shows"], ["boxes", "Hiding boxes &amp; docking"],["cal", "Calendar"],["ntf", "Notifications &amp; summary"], ["keys", "Search &amp; shortcuts"],["account", "Account &amp; privacy"]
  ];
  var html = '<p class="mut">Jump to a section:</p><div class="helptoc">' +
    toc.map(function (t) { return '<button data-a="helpjump" data-k="' + t[0] + '">' + t[1] + "</button>"; }).join("") + "</div>";

  html += '<p class="mut sn">Looking for one setting? Open Settings and type in the search field at the top of its menu. For everything the search bar can do, type <code>help</code> in it.</p>';

  html += '<h3 id="help-signin">Signing in</h3><p>Click the person icon in the row of small icons. Choose <b>Create account</b>, enter an email and a password (twice), then click the link in the confirmation email and sign in. The first time you sign in, a short setup guide walks you through the boxes you want; you can run it again from <b>Settings &rarr; Layout &amp; boxes</b>. Everything you set up is saved to your account and is there on any device. Before you sign in, the page shows sample content so you can see what it looks like.</p>';

  html += '<h3 id="help-weather">Weather &amp; Location</h3><p><b>The city you start with is a guess.</b> Until you choose one, the page takes the city from the time zone your device is set to: a device on Swedish time gets Stockholm, one on Estonian time gets Tallinn. Your browser hands that over by itself, so there is no permission question, and your position and IP address are not used for it. It can therefore be the wrong city in the right country. The setup guide asks you to confirm or change it, and you can change it at any time:</p><p>There are two separate places to set a city:</p><ol><li><b>The weather tile</b> shows the forecast for one city. Click the tile, type a city name, click a result, then press <b>Use for the tile</b>.</li><li><b>The date and time at the top of the page</b> uses a different city. Open the cogwheel icon &rarr; <b>Settings</b> &rarr; <b>Date &amp; time</b> &rarr; <b>Change</b>, type a city, and click <b>Use</b> next to it.</li></ol><p>Changing one does not change the other. A <b>!</b> on the weather tile means a weather warning for the coming days (strong wind, heavy rain or snow, frost, heat); hover it or open the tile to read it. In the weather window you can also save more cities and switch between them.</p>';

  html += '<h3 id="help-mail">Mail (Gmail)</h3><p>This shows how many unread emails you have, without giving the site your Google password. It needs a small piece of free code pasted into your own Google account, once per inbox. It looks technical, but it is entirely copy and paste &mdash; follow every step below in order.</p>' +
    '<div class="safe"><b>Is this safe, and is it allowed?</b> Yes to both. The script is made with Google Apps Script, Google\'s own tool for this, and runs inside your Google account under your name. This site never gets your Google password and cannot sign in as you; it can only ask your script, and the script only answers when shown its secret token. The script counts your unread mail, lists sender, subject and first line of the latest unread ones, and can send an email to your own address if you switch on email notifications. It cannot delete or move mail, or write to anyone else. To stop it at any time, delete the project at <a href="https://script.google.com" target="_blank" rel="noopener">script.google.com</a> or remove its access at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener">myaccount.google.com/permissions</a>.</div>' +
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

  html += '<h3 id="help-stocks">Stocks</h3><p>Open <b>Settings</b> &rarr; <b>Stocks</b>. There are five ways to add stocks, funds, indexes or crypto:</p><ol>' +
    '<li><b>Search by name:</b> type a company name such as <code>Tesla</code> in the first field. A list appears under it with the symbol, the full name and the exchange; press <b>Add</b> on the right one. The same company is often listed on several exchanges, so pick the one you actually hold. If you know the symbol (<code>NVDA</code>, or <code>NASDAQ:NVDA</code>), type it and press Add.</li>' +
    '<li><b>Paste a list:</b> paste a comma-separated list of symbols and press Import.</li>' +
    '<li><b>Import a file:</b> press <b>Import a file</b> and choose the CSV file you exported from your broker or portfolio site. The page looks for a column called <b>Symbol</b>, <b>Ticker</b> or <b>ISIN</b>, wherever it is in the file, and shows what it found so you can untick what you do not want before anything is added. Files that only have ISIN codes (common with Nordic brokers) work too: the codes are looked up and turned into symbols, and any that could not be found are listed so you can add them by name. Only the symbols are taken; amounts, prices and account numbers in the file are not read into the page and the file is not uploaded anywhere. An Excel file has to be saved as CSV first (File &rarr; Save as &rarr; CSV).</li>' +
    '<li><b>Import a Google Sheet:</b> in Google Sheets press <b>Share</b>, set it to <b>Anyone with the link</b> (Viewer), copy the link and paste it in the link field. The sheet needs the same kind of column as a file: Symbol, Ticker or ISIN, with the column names in the first row. To import another tab of the sheet, open that tab before you copy the link. This reads the sheet once; it does not keep following it.</li>' +
    '<li><b>Import your TradingView watchlist:</b><ol type="a">' +
    '<li>Go to <a href="https://www.tradingview.com" target="_blank" rel="noopener">tradingview.com</a> and open any chart while signed in.</li>' +
    '<li>Your watchlist is the panel on the right side of the screen.</li>' +
    '<li>Click the <b>•••</b> (three dots) at the top of that watchlist panel.</li>' +
    '<li>Choose <b>Advanced view</b> (or <b>Share</b>), then turn on link sharing if it is not already on.</li>' +
    '<li>Copy the link it gives you &mdash; it looks like <code>https://www.tradingview.com/watchlists/12345678/</code>.</li>' +
    '<li>Paste that link into the link field (the same one as for a Google Sheet) and press Import.</li>' +
    '</ol></li></ol>' +
    '<p><b>In the box:</b> each row has the price, a small chart and the day\'s change. Choose what the chart covers (today, the week, the month, or off) in <b>Settings &rarr; Stocks</b>; in a narrow box the price is cut short to make room for it. Sort with the dropdown, and click a stock for the full chart with recent news and chatter about it. <b>Market hours:</b> the small clock button at the top of the box shows whether the markets your stocks trade on are open. The clock has the box&rsquo;s &ldquo;up&rdquo; color while the market most of your stocks are on is open and its &ldquo;down&rdquo; color while it is closed (the same colors and strength as the rest of the box, set under Settings &rarr; Appearance &rarr; Signal colors per box). Point at it for a small box with your main markets, or click it for all of them, lined up in columns: the market, how many of your stocks are on it, open or closed, how long until it closes or opens, and at what time on your own clock. Click a market there to see which of your stocks belong to it. Crypto is left out because it never closes; currencies and commodities (oil, gold) trade almost around the clock from Sunday evening to Friday evening. The page works out the market from the symbol (<code>NASDAQ:NVDA</code>, <code>SAAB-B.ST</code>); a symbol without an exchange is taken as a US stock. The main public holidays are counted, shortened trading days are not. <b>Price alerts:</b> the bell button next to the clock opens a small window where you fill in one sentence: Alert me when [stock] is [more than / less than / reaches] [price]. The price field starts at what the stock costs now. You get one notification when it happens and the alert then switches itself off; tick it to set it again, change its price or condition right in the list, or remove it with ✕. <b>Set a price alert</b> in the window of a stock opens the same thing for that stock. Up to 30 alerts; prices are looked at about once a minute while the page is open in a tab. Star or hide a stock in Edit mode.</p>' +
    '<p><b>Alerts:</b> a notification when a stock moves fast (within about half an hour) or far on the day. Set the percentages in <b>Settings &rarr; Notifications</b>.</p>';

  html += '<h3 id="help-news">News &amp; Telegram</h3><p>Open <b>Settings</b> &rarr; <b>News, Telegram &amp; Reddit</b>.</p><ul><li><b>To add a news source:</b> give it a name and either a feed address (for example <code>https://feeds.bbci.co.uk/news/world/rss.xml</code>) or just a website like <code>reuters.com</code>, and press Add. A feed address is the most reliable; with only a website the page looks the news up through search services. Up to 15 sources. Start the name with the outlet (&ldquo;SVT Utrikes&rdquo;, &ldquo;BBC World&rdquo;): two feeds whose names start the same count as one outlet.</li><li><b>To add a Telegram channel:</b> type its name (for example <code>ClashReport</code>) or paste a t.me link, and press Add.</li><li>Click the ✕ next to any source to remove it, or <b>Back to default sources</b> to start over. The list also shows when each source last delivered, and why one was skipped.</li><li>Each of the News and Telegram tiles has its own <b>Sources</b> button, to temporarily hide one source without deleting it.</li></ul>' +
    '<p><b>Reading the news:</b> a story you have not seen gets an accent bar, and the header counts them (click the count to mark everything seen; being away for 2+ minutes does that automatically). Stories you opened are dimmed. The same story from several sources is one row with a source count before the time, also when one report is in Swedish and another in English; three or more outlets within 3 hours makes it <b>hot</b>. A story stays where it was first reported: another source picking it up joins the row and does not mark it new again. Hover a row for the picture and summary, click it for all sources. <b>Search:</b> the ⌕ button at the top of News, Telegram and Reddit opens a search field. It looks through everything the box has loaded (not only the rows on screen), in the headline or post text and the source name; every word you type has to be there, in any order, and capitals and accents do not matter. A moment later (or at once with Enter) it also looks further back than the box reaches: the last 30 days on your own news sites, the whole history of your Telegram channels, and the last year of your subreddits. What it finds joins the list, newest first. Press ⌕ again to close the search.</p>' +
    '<p><b>The reader:</b> click a headline or post and it opens in a window with the other posts of that box above and below it, each one in full with its picture or video, so you scroll from one to the next instead of opening them one by one. The small list button at the top of the box (before ⌕) is for catching up: it opens the same window at the oldest post you have not seen, with a <b>New</b> line above it, and you scroll down to the newest, where it says you are up to date. A post counts as read once you have scrolled to it, so the count of new posts goes down as you read. On a phone the reader fills the screen and you scroll with your thumb; with a keyboard, <code>↓</code> and <code>↑</code> (or <code>J</code> and <code>K</code>) go one post on or back, and Esc closes it. The button beside Close shows which way the list runs (<b>↓ Newer</b> or <b>↓ Older</b>) and turns it around. Videos do not start by themselves, and stop when you scroll away. In Telegram, <b>Load older posts</b> at the old end fetches more; in Reddit, <b>Top comments</b> shows the comments under a post. Under <b>Settings &rarr; News, Telegram &amp; Reddit &rarr; Reading posts</b> you choose whether a click opens the reader or the single post, and which way scrolling down goes after a click and from the catch-up button.</p>' +
    '<p><b>Languages:</b> under <i>Languages shown in News</i> tick the languages you read; headlines in other languages are left out (nothing is translated). <b>How many:</b> <i>Headlines shown</i> and <i>Telegram posts shown</i> set the length of the lists; the button at the end of a list shows 20 more, and for Telegram it also loads older posts.</p>' +
    '<p><b>Filters &amp; alerts:</b> <i>Mute words</i> hide every headline containing them; <i>Highlight words</i> mark matching headlines and notify you when a new one appears.</p>';

  html += '<h3 id="help-twitch">Twitch</h3><p>Open <b>Settings</b> &rarr; <b>Twitch</b> &rarr; press <b>Connect</b>, log in if asked, and approve access. The box then shows who you follow that is live, with game and viewers; sort it or pick one category with the dropdowns. Hover a channel for a preview picture, the stream title and how long it has been live. Click a name to watch inside the page. Streamers you starred (Edit mode) who are offline are listed dimmed under the live ones with when they were last live; switch that off in Settings &rarr; Twitch.</p>' +
    '<p><b>Discover:</b> the compass button at the top of the box (always there, also while people you follow are live) opens a window for everything you do not follow. It starts with the biggest live streams right now. Pick a category from the chips to see its ten biggest streams, with <b>Show 10 more</b> for the next ten; <b>All categories</b> unfolds the list and <b>More categories</b> loads further ones. Type in the field to search for a channel or a game by name, and choose a language to see only streams in it. Click a stream to watch it the usual way; the player has a <b>Discover</b> button to go back. ☆ puts a channel on your own list without following it on Twitch: it then shows in the Twitch box when it is live, among your ★ streamers when it is not, and you are told when it goes live. Nothing is asked of Twitch until you open the window, and each answer is kept for a minute. Discover needs your Twitch account to be connected.</p>' +
    '<p><b>Chat says &ldquo;log in&rdquo;, or ads even though you have Turbo or a sub?</b> The player and chat inside this page are a Twitch &ldquo;embed&rdquo;. Your browser treats it as a third-party site and hides your twitch.tv login cookie from it, so Twitch thinks you are logged out: you cannot write in chat (the login window opens and closes again by itself) and you get ads. This is a browser setting, not a fault, and <b>Connect</b> in Settings does not change it. Two fixes:</p><ol>' +
    '<li><b>Pop out</b> (works everywhere): press <b>Pop out</b> on a stream, or turn on <b>Settings &rarr; Twitch &rarr; Open streams in a pop-out window</b>. The pop-out is twitch.tv itself, so your login, Turbo and subs work. Allow pop-ups for this site if the browser asks.</li>' +
    '<li><b>Let the embed see your login</b>: allow third-party cookies for Twitch only. Quickest in Chrome and Edge: click the icon at the left end of the address bar while on this page and allow third-party cookies for this site. Or through the settings:<ul>' +
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

  html += '<h3 id="help-radio">Radio</h3><p>The small box next to the menu icons is an internet radio: pick a station from its list, press ▶ to play and ■ to stop; the speaker button opens a volume slider. It keeps playing while you use the rest of the page, and choosing another station while it plays switches straight to it. Tick which stations are in the list in <b>Settings &rarr; Radio</b>. <b>Your own stations:</b> in the same place, under <b>Add a station of your own</b>, type a station name, a city or a genre (<code>BBC Radio 1</code>, <code>Stockholm</code>, <code>jazz</code>). The list that appears comes from Radio Browser, a free public catalogue of tens of thousands of stations; ▶ lets you listen before you decide and <b>Add</b> puts the station in your list under &ldquo;My stations&rdquo;, ticked and ready in the box. You can also paste a stream address that starts with https://. Up to 25 of your own; ✕ next to one removes it. A station that is already in the list, also when the catalogue has it under another address, is not added a second time: it is ticked instead. The song that is playing shows for your own stations too, whenever the station sends it along with the music (most do; some only send their own name or nothing). A red play button means that station could not be reached just now. <b>What is playing:</b> press the ⓘ button after the volume button (or click the box itself; hovering it shows the song, artist and album cover) for the song with album, year, length, who wrote it, links to the song and lyrics, and the last five songs. Under them is a short note about the station: its genre, language and country, its sound quality, a few of its own tags and a link to its website, as far as the public station catalogue knows them. Not every station sends its song, and the earlier songs are the ones noted while the radio played on this page. (The currency converter that used to be here is now in the search bar: type <code>100 usd in eur</code>.)</p>';

  html += '<h3 id="help-timers">Timers, countdowns &amp; stopwatch</h3><p>Click the clock icon and choose Timer, Countdown or Stopwatch. A finished timer or countdown keeps ringing every few seconds until you press <b>Stop</b> or remove it, so it is hard to miss. You can set how loud it rings in <b>Settings</b> &rarr; <b>Notifications</b> &rarr; <b>Alarm volume</b>.</p>';

  html += '<h3 id="help-notes">Notes &amp; to-dos</h3><p>Click the notepad icon (or use its shortcut). There are two tabs. <b>To-do:</b> type a task and press Enter; click the circle to tick it off (finished tasks move under <i>Completed</i>, which you can open or clear). <b>Notes:</b> write in the first card and press Save (or Ctrl+Enter). In both, click any text to edit it in place, and hover for pin ★ and delete ✕. The number on the icon is how many to-dos are open.</p>' +
    '<p><b>Quick ways to add one:</b> type <code>note buy milk</code> or <code>todo call the bank</code> in the search bar and press Enter; or press Ctrl+V anywhere on the page (not in a text box) and choose <i>As a note</i> or <i>As a to-do</i> on the small card that appears (switch that off in Settings &rarr; Layout &amp; boxes).</p>';
  html += '<h3 id="help-reddit">Reddit</h3><p>The Reddit box shows posts from your subreddits. Add or remove them in <b>Settings &rarr; News, Telegram &amp; Reddit</b>. In the box, choose <b>Best, Hot, New, Top</b> or <b>Rising</b>, and use <b>Sources</b> to hide a subreddit without removing it. Hover a post for a preview; click it for the text, the links and the top comments. How many comments are shown (3, 5, 10, 20 or none) is set in the same Settings section. Reddit only gives a flat list without votes, so the button in the window opens the full discussion.</p>';
  html += '<h3 id="help-sports">Sports</h3><p>Live scores and fixtures. Choose your leagues in <b>Settings &rarr; Sports</b>: football leagues and cups from more than twenty countries plus the World Cup, the European Championship and the Nations League, NBA, college basketball and football, NHL, NFL, MLB, rugby, cricket, Australian football, tennis, Formula 1, IndyCar, NASCAR, golf and UFC come from ESPN; SHL (Swedish hockey) comes from shl.se and Counter-Strike 2, League of Legends and Dota 2 from bo3.gg (those four need you to be signed in).</p>' +
    '<p><b>In the box:</b> pick a sport and a view: <b>Live &amp; today</b>, <b>Upcoming</b>, <b>Results</b>, <b>Favorites</b>, and <b>★ your favorite sport</b> if you set one in Settings (everything on now, today and coming up in that sport). Hover a game for the short story of it; click it for goals and cards with minute and scorer, period scores, match stats, top performers and the league table with both teams highlighted. Every team sport also gets, where the source has it: who scored and when, the full team stats, the best player lines of each team (switch team with the two small buttons), football line-ups and the last five results of both sides, and before the game the odds and who is unavailable. A Formula 1 weekend shows the order of every session that has run (click a session) with the driver and team standings; golf shows the whole leaderboard round by round; tennis shows the world ranking under the matches. Rugby shows every try, conversion and penalty with the minute and the scorer (T, C, P, DG), the cards, both line-ups, the last five results and the table with bonus points; rugby league adds team stats. Cricket shows the result, the batting and bowling figures, the teams and the table with net run rate. Australian football shows the goals, the score of each quarter, team stats, the players with the most disposals and the ladder. IndyCar and NASCAR show the order of the race and the driver standings. SHL games show the goals with assists, the score of each period, team stats, the best skaters and the goalies. Esports matches show the last five results of both teams, their world ranking and recent meetings, and every map or game with its score: Counter-Strike 2 adds the players&rsquo; kills, deaths, assists and rating, Dota 2 a scoreboard for each game with heroes and net worth. Click a team&rsquo;s name for the team: roster, career numbers, next matches, last results and titles; click a player in the roster for the player. An esports game has<b>Watch</b> buttons that dock the Twitch stream showing it.</p>' +
    '<p><b>Results:</b> choose <b>Results</b> in the view list to go back in time: finished games, fight cards, races and tournaments, newest first, with a small heading for each day. Click one for the same full details as a live game (a finished UFC card opens with every fight, and each fight with its numbers). Team leagues go back to the start of the month (in the first week of a month, the month before as well); UFC cards, Formula 1 weekends and golf tournaments four weeks; tennis, SHL and esports about a week. The list shows the 120 newest; pick one sport in the first list to see further back in that sport.</p>' +
    '<p><b>Search:</b> press ⌕ at the top of the box and type a team, player, fighter, league or event. It looks through everything that is loaded for the leagues you follow, whatever the view: what is live, what is coming up this month and the recent results, in that order. Several words narrow it down (for example <code>ufc allen</code>). Press ⌕ again to close the search.</p>' +
    '<p><b>Favorites:</b> press ☆ next to a team, fighter or player in a game\'s window. Favorites are marked ★ and listed first. You get a notification when their game starts, at every goal (football and ice hockey) and at the final score, and their games appear in the calendar (both can be switched off in Settings).</p>' +
    '<p><b>UFC:</b> an upcoming event is one row; click it for the fight card, where the number after each name is the odds to win. While a card is on, every fight is its own row: the one in the cage first with round and clock, then what is next, then the results. Click a fight for both fighters side by side, the numbers of the fight (strikes, takedowns, control time) and a tale of the tape. Hover a fighter\'s name for a small card; click it for the fighter\'s own window.</p>';
  html += '<h3 id="help-tv">TV shows</h3><p>A box for the series you watch. It is off at first: switch it on under <b>Settings &rarr; TV shows</b> (or Layout &amp; boxes).</p>' +
    '<p><b>Follow a show:</b> press ⌕ at the top of the box, type its name and press ☆ on the right one. Up to 60 shows. <b>The views:</b> <b>My shows: coming up</b> lists the next episode of each show you follow, soonest first, under a heading for each day. Each row is kept to the show, the episode number and the time; point at a row for the episode&rsquo;s title and the channel, or click it for everything; <b>My shows: just aired</b> lists the latest episode of each, newest first; <b>On today</b> shows the best-known shows airing today in one country, on television and on streaming services, with yours marked ★ (choose the country in Settings &rarr; TV shows).</p>' +
    '<p><b>Click a row</b> for the show: what it is about, where it runs, its rating, the coming episodes with their dates and the latest ones with a short description, and a button to follow it or stop. The next and the latest episode of each show also sit on their day in the calendar, and you get a notification when a new episode goes on air; the first is switched off under Settings, TV shows and the second under Settings, Notifications. Times are in your own time zone. The list of shows you follow, with a button to remove each, is also under Settings &rarr; TV shows. Show information comes from TVmaze.com; films are not included.</p>';
  html += '<h3 id="help-boxes">Hiding boxes &amp; docking</h3><p><b>Hide a whole box:</b> in Edit mode press <b>Hide</b> on it, or switch it off in <b>Settings &rarr; Layout &amp; boxes</b>, where you can also switch it back on. A hidden box is not loaded. <b>Dock notes or the calendar:</b> open one and press <b>Dock left</b> or <b>Dock right</b> at the bottom; it then stays at the side of the page. Use ⇄ on a docked panel to move it to the other side and ✕ to turn it back into a window. <b>Reload and problems:</b> every list box has a ↻ button to reload it. When something in a box could not be loaded, a small <b>!</b> appears next to it; click it to read what failed, why, since when, and what you can do. <b>Read later:</b> put a headline, Telegram post, Reddit post or video aside for later. With the mouse on its row, a small bookmark button takes the place of the time; or press <b>Read later</b> in the window that opens when you click the item (on a phone, that is the way). Saved rows keep a small bookmark mark. The list is the third tab of <b>Notes</b>: click an item to open it, press ✓ when you are done to take it off the list. It holds up to 100 items and is the same on all your devices. <b>Bookmarks bar:</b> a slim row of your own links at the very top of the page. Switch it on and add links under Settings &rarr; Bookmarks; group links in a folder (it opens as a small list), choose an icon and a color for each, and move them left and right with ◀ ▶. <b>Bring your browser&rsquo;s bookmarks along:</b> first save them to a file in your browser (Chrome, Edge, Brave and Opera: Bookmark manager → ⋮ → Export bookmarks; Firefox: Bookmarks → Manage bookmarks → Import and Backup → Export Bookmarks to HTML; Safari: File → Export → Bookmarks). Then, under Settings → Bookmarks → Import from your browser, choose that file. Every folder in it is listed with a tick box and the number of links; tick the ones you want and choose for each whether it becomes a folder or separate links on the bar. The browser&rsquo;s own bookmarks bar is ticked from the start. Links you already have are skipped, a folder takes 60 links at most, and the file is read on your device, not uploaded. <b>Web page boxes:</b> under Settings → Web page boxes you can show up to three web pages in boxes of their own, for example a dashboard, a live map, a webcam or a shared document. Paste the address and the box appears; move it with Edit like any other box, and change its height with H&minus; and H+. The small arrow in its corner opens the page in its own tab, ↻ loads it again, and it can reload by itself every 1, 5, 15 or 60 minutes. Many large sites (Google, Facebook, banks, most news sites) do not allow being shown inside another page; then the box stays empty, and when you are signed in the settings tell you so as soon as you paste the address. Look for an &ldquo;embed&rdquo; address on such a site (usually under Share → Embed); those work. The page in the box cannot read anything from OmniTree and cannot take over the tab. <b>Date, time and world clocks:</b> under Settings &rarr; Date &amp; time you tick what the top of the page shows (day name, date, year, time, location), choose the European or the American way of writing it, and set the font, size and color of the day name. Add up to five cities there as world clocks: either in a small box when you point at the date, or on the page under it. <b>Found a bug or have an idea?</b> Cogwheel icon &rarr; <b>Feedback</b>. Pick what kind it is, answer the short questions and press Send; it works without an account too.</p>';
  html += '<h3 id="help-cal">Calendar &amp; reminders</h3><p>Click the calendar icon (or press <code>c</code>). Pick a day, type an event, optionally set a time, a reminder and a repeat, and press Add. To change an event afterwards, press ✎ on it: the same form then holds its name, day, time, reminder and repeat; press Save, or Cancel to leave it as it was. Days with events have a dot, and the number on the icon is today\'s events. A reminder shows as a notification in the bottom-right corner and stays until you dismiss it (all-day events count as 09:00). Reminders only fire while this page is open in a tab. Games of your ★ sports favorites appear on their day by themselves (click one to open the game); they are not saved with your own events.</p>' +
    '<p><b>Repeating events and birthdays:</b> choose a repeat when you add an event, or press ↻ on an existing one to step through Once, Birthday, Yearly, Monthly, Weekly, Daily. A birthday comes back every year; put the birth year in its name (&ldquo;Anna 1990&rdquo;) and it also shows the age.</p>' +
    '<p><b>Calendars from elsewhere</b> (Settings → Calendar → Calendars from elsewhere). There are two ways, and you can use both:</p><ul>' +
    '<li><b>Import an .ics file:</b> copies the events into your own calendar, once. You first see what was found and how many there is room for (the calendar holds 300 events of your own). Repeating events keep repeating, one-time events older than a month are left out, and events you already have are skipped. Afterwards they are yours: change the repeat or delete them like any other event. Good for a school term, a sports schedule or moving over from another calendar.</li>' +
    '<li><b>Follow a calendar by its address:</b> paste the calendar&rsquo;s .ics address and press Follow. Its events show next to yours with the calendar&rsquo;s name after them, and are read again every half hour, so changes made in the other calendar turn up here by themselves. They are not copied and cannot be changed here. You can give each followed calendar a name and a reminder for all its events, and follow up to four. This needs you to be signed in.</li></ul>' +
    '<p><b>Where to find the address:</b> <b>Google Calendar:</b> Settings → click the calendar under &ldquo;Settings for my calendars&rdquo; → Integrate calendar → <b>Secret address in iCal format</b>. <b>Outlook.com:</b> Settings → Calendar → Shared calendars → Publish a calendar → the <b>ICS</b> link. <b>Apple iCloud:</b> share the calendar as a Public Calendar and copy the link. The file for a one-time import is in the same places (Google: Settings → Import &amp; export → Export). A secret address lets anyone who has it read that calendar, so treat it like a password; it is saved with your settings and used only to read the calendar.</p>' +
    '<p><b>Taking your events elsewhere:</b> in the same place in Settings, <b>Download my events as an .ics file</b> saves your own events, with their repeats and reminders, as a file that Google Calendar, Outlook and Apple Calendar can import. Calendars you follow and the special days are not in it.</p><p><b>Good to know:</b> times are shown in your own time zone. An event that lasts several days is shown on its first day with the last day in its name. &ldquo;Every second week&rdquo;, an end date and skipped days are followed; rarer rules (such as &ldquo;the last Friday of every third month&rdquo;) are simplified.</p>' +
    '<p><b>Special days</b> (Settings &rarr; Calendar): have the calendar mark big days (Christmas, Easter&hellip;), smaller days (Valentine\'s, Mother\'s and Father\'s Day, Halloween&hellip;), the public holidays of the countries you tick (red dates), seasons and clock changes, full moons, week numbers and your payday. They are worked out for every year by themselves. Hover or click a day to read them, and tick the ones you want a reminder for.</p>' +
    '<p><b>Next up:</b> the small line under the date at the top of the page is the next thing in your calendar; click it to open that day. Its color is under Settings &rarr; Appearance.</p>';
  html += '<h3 id="help-ntf">Notifications &amp; summary</h3><p>Small cards appear in the bottom-right corner for: the same story from several of your sources within two hours, a headline with one of your highlight words, a stock on your list moving fast or far, a ★ streamer going live, a ★ team\'s game starting, scoring and ending, new mail, and calendar reminders. Click a card to open it, ✕ to dismiss. The <b>bell</b> in the menu box keeps the last 30, and its number is how many you have not looked at; opening it clears the number. Hover the mail tile to see your latest unread subjects. Everything can be turned on or off and tuned in <b>Settings &rarr; Notifications</b>, including the ping sound and whether to also send desktop notifications (which also keeps news, stocks, sports and Twitch updating while the tab is in the background).</p>' +
    '<p><b>Good to know:</b> a card goes away by itself after 20 seconds, counted only while you are looking at the page, so one that arrived while the tab was in the background is still there when you come back. The ping can only play once you have clicked somewhere on the page; that is a rule of the browser. Heard something and saw nothing? <b>Settings &rarr; Notifications</b> ends with the last 5 notifications and alarms on this device, each with its reason and whether it made a sound.</p>' +
    '<p><b>On all your devices:</b> pressing &ldquo;x new&rdquo;, opening a post, opening the bell and clearing its history are saved to your account. Do it on the computer and the phone shows the same within a minute, and nothing is announced twice.</p>' +
    '<p><b>By email:</b> tick <i>Also send them to my email</i> to get the same notifications in your connected Gmail inbox, everything from a five-minute stretch in one email. It is off until you switch it on, needs an inbox set up under Mail, and only works while this page is open in a tab.</p>' +
    '<p><b>Summary:</b> one small window with what happened lately. Open it any time from the cogwheel menu or with <code>b</code>. Everything about it is set under <b>Settings → Summary</b>:</p><ul>' +
    '<li><b>When it opens by itself:</b> never, on the first visit of the day, when you come back after being away, or both. You choose how long &ldquo;away&rdquo; is (30 minutes to 8 hours); away means the page was closed or its tab was in the background for that long.</li>' +
    '<li><b>How far back it looks:</b> the last 6, 12 or 24 hours, or the last 2 days.</li>' +
    '<li><b>What is in it:</b> weather and warnings, today in your calendar, top stories, Telegram, Reddit, biggest stock movers, mail, who is live on Twitch, ★ streamers who were live while you were away, TV episodes of your shows, sports results and sports coming up. Tick the parts you want and put them in your own order with ▲ ▼. A part with nothing to show is left out by itself.</li>' +
    '<li><b>Narrowing a part down:</b> press <b>Choose…</b> on a part to pick which news sources, Telegram channels, subreddits or sports it uses, or to keep it to your ★ channels and ★ teams only. New sources you add later are included by themselves.</li>' +
    '<li><b>How it looks:</b> a list, cards side by side, or a compact version, and how many items each part shows at most (3 to 15).</li></ul>' +
    '<p><b>Hover previews:</b> rest the mouse on a news headline or Telegram post to see its picture and text without opening it. <b>Stocks:</b> click a stock to see its chart plus recent news and comments about it.</p>';

  html += '<h3 id="help-wallpaper">Wallpaper</h3><p>Open <b>Settings</b> &rarr; <b>Wallpaper</b>. Click <b>Choose image</b> to pick a picture, then choose how it should fit the screen: Fill, Fit, or Original size. Press <b>Reposition</b> to drag the image where you want it, then press <b>Done</b>.</p>';

  html += '<h3 id="help-edit">Colors, text size &amp; layout</h3><p><b>Settings</b> &rarr; <b>Appearance</b> covers the theme, every color, overall text size, the glow background and the shadows. At the bottom, <b>Signal colors per box</b> changes the green and red in Stocks, the live dot in Twitch and the live red and icons in Sports, each with a strength slider to tone it down.</p><p>To move or resize the boxes themselves, click the cogwheel icon and choose <b>Edit</b>. Each box then shows small buttons: ◀ / ▶ move it earlier or later, W&minus; / W+ make it narrower or wider, T&minus; / T+ change that box\'s own text size, and (on lists) H&minus; / H+ show fewer or more rows. You can also drag a box by its title. Click <b>Done</b> in the same menu to finish. On a phone the boxes sit in one column, so the arrows point up and down (▲ / ▼) and the width buttons are left out.</p>';

  html += '<h3 id="help-dock">Watching while you browse</h3><p>Open a Twitch stream or a YouTube video and press <b>Dock on the left</b>. It keeps playing in a strip on the left side while you use the rest of the site. You can dock up to 3 at once, and drag the edge of that strip to resize it. Hover a docked player for its <b>Chat</b> and close buttons; drag the bottom or right edge of the chat to resize it (double-click an edge to reset). To have chat open by itself when you dock a stream, tick it in Settings &rarr; Twitch.</p>';

  html += '<h3 id="help-account">Account &amp; privacy</h3><p>Under <b>Settings</b>, the Account sections are:</p><ul>' +
    '<li><b>Password:</b> set a new one (typed twice). If you forget it, click the person icon, then <b>Forgot password?</b>, and a reset link is emailed to you.</li>' +
    '<li><b>Sign-in activity:</b> every device and browser signed in to your account right now and the latest sign-ins, with a button to sign out everywhere else. You can also be emailed the first time a new browser signs in (needs an inbox under Mail).</li>' +
    '<li><b>Delete account:</b> removes the account and everything saved in it, for good.</li>' +
    '<li><b>Backup:</b> downloads all settings, sources, notes and layout as a file you can restore later.</li></ul>' +
    '<p>Everything you set up is private to your own account &mdash; nobody else using this site can see it. It is saved to the account and follows you to every device: settings, sources, bookmarks, notes, calendar, timers, world clocks, and what you have already seen and opened. Changes made on one device reach the others within a minute, and two devices changing different things never overwrite each other. The full <a href="privacy" target="_blank" rel="noopener">privacy policy</a> says what is stored and why. To run the site, it counts how long the page is open and how often each kind of button is used per account; never what you read, type, search or save. Each visit to the page, signed in or not, is also noted with its IP address, country and browser; that log is kept for 90 days and only the site owner can see it. Text you translate in the search bar goes to the MyMemory translation service, and radio stations are played straight from the stations\' own servers. A bookmark set to show &ldquo;the site\'s own icon&rdquo; fetches that icon from the site itself.</p>';

  openModal("Help", html);
}
function acctHtml() {
  if (USER) return '<div class="menu acctpop" role="menu"><div class="mut sn">' + esc(USER.email) + '</div><button role="menuitem" data-a="signout">Sign out</button></div>';
  return '<div class="menu acctpop" role="menu"><form class="nosub"><input type="text" id="acctEmail" name="email" placeholder="Email" autocomplete="username"><input type="password" id="acctPass" name="password" placeholder="Password (8+ characters)" autocomplete="current-password"><div class="acts"><button type="button" data-a="signin">Sign in</button><button type="button" data-a="signup">Create</button></div></form><button class="lnk2" data-a="forgotpw">Forgot password?</button>' + (ACCTMSG ? '<div class="mut sn">' + esc(ACCTMSG) + "</div>" : "") + "</div>";
}

// ---- Notifications: small cards in the bottom-right corner ----
function NTF() { return Object.assign({ news: true, words: true, stock: true, live: true, cal: true, mail: true, sport: true, tv: true, sound: true, desktop: false, email: false, srcN: 2, pct: 3, day: 5 }, P.ntf || {}); }
var NOTIFIED = load("sp_notified", {});
// true the first time a key is seen, so the same thing is never announced twice (also after a reload)
function once(key) {
  var so = sy().once, h = hs(key);
  if (NOTIFIED[key] || so[h]) return false;   // announced before, here or on another of your devices
  NOTIFIED[key] = Date.now();
  so[h] = NOTIFIED[key]; syCap(so, 200); persist();
  var k = Object.keys(NOTIFIED);
  if (k.length > 300) k.sort(function (a, b) { return NOTIFIED[a] - NOTIFIED[b]; }).slice(0, k.length - 300).forEach(function (x) { delete NOTIFIED[x]; });
  save("sp_notified", NOTIFIED);
  return true;
}
var TOASTS = {}, toastN = 0, TICON = { news: "●", words: "★", stock: "↕", live: "▶", cal: "◷", mail: "✉", sport: "⚑", tv: "▣" };
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
  else if (a === "tv") openTv(k);
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
  // The card goes away by itself after 20 seconds, but only counted while you can see the page: one that arrives while
  // the tab is in the background (you hear it) is still there when you come back.
  if (!sticky) {
    var arm = function () { setTimeout(function () { toastAct("toastout", id); }, 20000); };
    if (!document.hidden) arm();
    else { var onBack = function () { if (document.hidden) return; document.removeEventListener("visibilitychange", onBack); if (TOASTS[id]) arm(); }; document.addEventListener("visibilitychange", onBack); }
  }
  sndLog(title, force ? "A test button was pressed" : SND_WHY[kind] || "Notification", !n.sound ? "off" : canSound() ? "on" : "blocked");
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
  var subject = items.length === 1 ? "OmniTree: " + items[0].t : "OmniTree: " + items.length + " notifications";
  var text = items.map(function (x) { return when(x.ts) + "  " + x.t + (x.b ? "\n       " + x.b : ""); }).join("\n\n") + "\n\n(Sent by your OmniTree page. Switch this off in Settings, Notifications.)";
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
// An imported event can also repeat every second (third...) time (iv), stop on a day (u) and skip days (x).
function evOn(e, ds) {
  if (ds < e.d || (e.u && ds > e.u) || (e.x && e.x.indexOf(ds) >= 0)) return false;
  if (ds === e.d) return true;
  if (!e.rep) return false;
  var a = new Date(e.d + "T12:00:00"), b = new Date(ds + "T12:00:00"), iv = e.iv > 1 ? e.iv : 0;
  if (e.rep === "d") return !iv || Math.round((b - a) / 86400000) % iv === 0;
  if (e.rep === "w") return a.getDay() === b.getDay() && (!iv || Math.round((b - a) / 604800000) % iv === 0);
  if (e.rep === "m") return a.getDate() === b.getDate() && (!iv || ((b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth()) % iv === 0);
  if (e.rep === "y" || e.rep === "b") return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && (!iv || (b.getFullYear() - a.getFullYear()) % iv === 0);   // b = a birthday: every year, like y
  return false;
}
function evsOn(ds) { return (P.cal || []).filter(function (e) { return evOn(e, ds); }).concat(icsEvs().filter(function (e) { return evOn(e, ds); }), spCalMap()[ds] || [], tvCalMap()[ds] || []).sort(function (a, b) { return (a.tm || "").localeCompare(b.tm || ""); }); }
var CALV = null, REPS = { "": "Once", b: "Birthday (every year)", y: "Yearly", m: "Monthly", w: "Weekly", d: "Daily" }, REMS = [["", "No reminder"], ["0", "At the time"], ["5", "5 min before"], ["15", "15 min before"], ["30", "30 min before"], ["60", "1 hour before"], ["1440", "1 day before"]];
function dayLabel(ds) { return new Date(ds + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }
function openCal() {
  // what you were typing survives a redraw: a new event's name, or everything in the form while an event is being changed
  var f = $("calAdd"), FLD = ["calT", "calTm", "calRem", "calRep", "calD"], same = !!f && (f.dataset.ed || "") === CALEDIT;
  var keep = same && CALEDIT ? FLD.map(function (id) { return $(id) ? $(id).value : null; }) : null, draft = same && !CALEDIT && $("calT") ? $("calT").value : "";
  putWidget("cal");
  if (keep) FLD.forEach(function (id, i) { if ($(id) && keep[i] != null) $(id).value = keep[i]; });
  else if ($("calT") && !CALEDIT) $("calT").value = draft;
}
// ---- Special days in the calendar (Settings > Calendar): big days, smaller days, public holidays per country, the
// seasons and clock changes, full moons, payday. All worked out here from the rules for each day (nothing is fetched).
// They mark the day in the calendar and show when you click it; they are not listed under "Coming up".
function SD() { return P.sd && typeof P.sd === "object" ? P.sd : {}; }
function sdDate(y, m, d) { return new Date(y, m, d); }                                   // m: 0 = January
function easter(y) {                                                                    // Easter Sunday (Western churches)
  var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = (h + l - 7 * m + 114) % 31 + 1;
  return sdDate(y, mo - 1, da);
}
function plus(d, n) { return sdDate(d.getFullYear(), d.getMonth(), d.getDate() + n); }
function nthDow(y, m, dow, n) { var d = sdDate(y, m, 1); return sdDate(y, m, 1 + (dow - d.getDay() + 7) % 7 + (n - 1) * 7); }   // n-th Monday (dow 1) of a month
function lastDow(y, m, dow) { var d = sdDate(y, m + 1, 0); return sdDate(y, m, d.getDate() - (d.getDay() - dow + 7) % 7); }
function dowOnAfter(y, m, day, dow) { var d = sdDate(y, m, day); return plus(d, (dow - d.getDay() + 7) % 7); }                   // first Saturday (6) on or after 20 June
// Mother's and Father's Day fall on different days in different countries
var SD_MF = [["EE", "Estonia"], ["SE", "Sweden"], ["UK", "United Kingdom"], ["US", "United States"]];
function sdMF() { var c = SD().mf; return SD_MF.some(function (x) { return x[0] === c; }) ? c : "EE"; }
// [id, name, group, date for a year]
var SD_DAYS = [
  ["newyear", "New Year's Day", "big", function (y) { return sdDate(y, 0, 1); }],
  ["goodfri", "Good Friday", "big", function (y) { return plus(easter(y), -2); }],
  ["easter", "Easter Sunday", "big", function (y) { return easter(y); }],
  ["midsummer", "Midsummer Eve", "big", function (y) { return sdMF() === "SE" ? plus(dowOnAfter(y, 5, 20, 6), -1) : sdDate(y, 5, 23); }],
  ["xmaseve", "Christmas Eve", "big", function (y) { return sdDate(y, 11, 24); }],
  ["xmas", "Christmas Day", "big", function (y) { return sdDate(y, 11, 25); }],
  ["nye", "New Year's Eve", "big", function (y) { return sdDate(y, 11, 31); }],
  ["valentine", "Valentine's Day", "small", function (y) { return sdDate(y, 1, 14); }],
  ["shrove", "Shrove Tuesday", "small", function (y) { return plus(easter(y), -47); }],
  ["women", "International Women's Day", "small", function (y) { return sdDate(y, 2, 8); }],
  ["stpat", "St Patrick's Day", "small", function (y) { return sdDate(y, 2, 17); }],
  ["aprilfool", "April Fools' Day", "small", function (y) { return sdDate(y, 3, 1); }],
  ["walpurgis", "Walpurgis Night", "small", function (y) { return sdDate(y, 3, 30); }],
  ["mother", "Mother's Day", "small", function (y) { var c = sdMF(); return c === "SE" ? lastDow(y, 4, 0) : c === "UK" ? plus(easter(y), -21) : nthDow(y, 4, 0, 2); }],
  ["father", "Father's Day", "small", function (y) { var c = sdMF(); return c === "UK" || c === "US" ? nthDow(y, 5, 0, 3) : nthDow(y, 10, 0, 2); }],
  ["halloween", "Halloween", "small", function (y) { return sdDate(y, 9, 31); }],
  ["blackfri", "Black Friday", "small", function (y) { return plus(nthDow(y, 10, 4, 4), 1); }],
  ["advent", "First Sunday of Advent", "small", function (y) { return dowOnAfter(y, 10, 27, 0); }],
  ["lucia", "St Lucia's Day", "small", function (y) { return sdDate(y, 11, 13); }]
];
var SD_GROUPS = [["big", "Big days", "New Year, Easter, Midsummer, Christmas"], ["small", "Smaller days", "Valentine's, Mother's and Father's Day, Halloween and more"],
  ["season", "Seasons and clock changes", "equinoxes, solstices, summer and winter time"], ["moon", "Full moons", "about one a month"]];
// Public holidays: [country code, name, list for a year]. Fixed dates are [month, day, name]; the rest are worked out.
function fx(y, list) { return list.map(function (x) { return [sdDate(y, x[0] - 1, x[1]), x[2]]; }); }
function eas(y, list) { var e = easter(y); return list.map(function (x) { return [plus(e, x[0]), x[1]]; }); }
var XMAS3 = [[12, 24, "Christmas Eve"], [12, 25, "Christmas Day"], [12, 26, "Boxing Day"]], XMAS2 = XMAS3.slice(1), NY = [1, 1, "New Year's Day"], MAY1 = [5, 1, "May Day"];
var GF = [-2, "Good Friday"], ES = [0, "Easter Sunday"], EM = [1, "Easter Monday"], ASC = [39, "Ascension Day"], WS = [49, "Whit Sunday"], WM = [50, "Whit Monday"], MT = [-3, "Maundy Thursday"];
// a holiday on a Saturday or Sunday that is moved to a weekday (US: Friday / Monday; UK: the next free weekday)
function usObs(d, n) { var w = d.getDay(); return [w === 6 ? plus(d, -1) : w === 0 ? plus(d, 1) : d, n + (w === 6 || w === 0 ? " (observed)" : "")]; }
var SD_HOL = [
  ["EE", "Estonia", function (y) { return fx(y, [NY, [2, 24, "Independence Day"], MAY1, [6, 23, "Victory Day"], [6, 24, "Midsummer Day"], [8, 20, "Day of Restoration of Independence"]].concat(XMAS3)).concat(eas(y, [GF, ES, WS])); }],
  ["SE", "Sweden", function (y) { var ms = dowOnAfter(y, 5, 20, 6); return fx(y, [NY, [1, 6, "Epiphany"], MAY1, [6, 6, "National Day"], [12, 31, "New Year's Eve"]].concat(XMAS3)).concat(eas(y, [GF, ES, EM, ASC, WS]), [[plus(ms, -1), "Midsummer Eve"], [ms, "Midsummer Day"], [dowOnAfter(y, 9, 31, 6), "All Saints' Day"]]); }],
  ["FI", "Finland", function (y) { var ms = dowOnAfter(y, 5, 20, 6); return fx(y, [NY, [1, 6, "Epiphany"], MAY1, [12, 6, "Independence Day"]].concat(XMAS3)).concat(eas(y, [GF, ES, EM, ASC, WS]), [[plus(ms, -1), "Midsummer Eve"], [ms, "Midsummer Day"], [dowOnAfter(y, 9, 31, 6), "All Saints' Day"]]); }],
  ["NO", "Norway", function (y) { return fx(y, [NY, MAY1, [5, 17, "Constitution Day"]].concat(XMAS2)).concat(eas(y, [MT, GF, ES, EM, ASC, WS, WM])); }],
  ["DK", "Denmark", function (y) { return fx(y, [NY].concat(XMAS2)).concat(eas(y, [MT, GF, ES, EM, ASC, WS, WM])); }],
  ["LV", "Latvia", function (y) { return fx(y, [NY, MAY1, [5, 4, "Restoration of Independence"], [6, 23, "Midsummer Eve (Līgo)"], [6, 24, "Midsummer Day (Jāņi)"], [11, 18, "Proclamation Day"], [12, 31, "New Year's Eve"]].concat(XMAS3)).concat(eas(y, [GF, ES, EM])); }],
  ["LT", "Lithuania", function (y) { return fx(y, [NY, [2, 16, "State Restoration Day"], [3, 11, "Independence Restoration Day"], MAY1, [6, 24, "St John's Day"], [7, 6, "Statehood Day"], [8, 15, "Assumption Day"], [11, 1, "All Saints' Day"], [11, 2, "All Souls' Day"]].concat(XMAS3)).concat(eas(y, [ES, EM]), [[nthDow(y, 4, 0, 1), "Mother's Day"], [nthDow(y, 5, 0, 1), "Father's Day"]]); }],
  ["PL", "Poland", function (y) { return fx(y, [NY, [1, 6, "Epiphany"], MAY1, [5, 3, "Constitution Day"], [8, 15, "Assumption Day"], [11, 1, "All Saints' Day"], [11, 11, "Independence Day"]].concat(XMAS3)).concat(eas(y, [ES, EM, WS, [60, "Corpus Christi"]])); }],
  ["DE", "Germany", function (y) { return fx(y, [NY, MAY1, [10, 3, "German Unity Day"]].concat(XMAS2)).concat(eas(y, [GF, EM, ASC, WM])); }],
  ["NL", "Netherlands", function (y) { var k = sdDate(y, 3, 27); return fx(y, [NY].concat(XMAS2)).concat(eas(y, [ES, EM, ASC, WS, WM]), [[k.getDay() === 0 ? plus(k, -1) : k, "King's Day"]]); }],
  ["FR", "France", function (y) { return fx(y, [NY, MAY1, [5, 8, "Victory in Europe Day"], [7, 14, "Bastille Day"], [8, 15, "Assumption Day"], [11, 1, "All Saints' Day"], [11, 11, "Armistice Day"], [12, 25, "Christmas Day"]]).concat(eas(y, [EM, ASC, WM])); }],
  ["ES", "Spain", function (y) { return fx(y, [NY, [1, 6, "Epiphany"], MAY1, [8, 15, "Assumption Day"], [10, 12, "National Day"], [11, 1, "All Saints' Day"], [12, 6, "Constitution Day"], [12, 8, "Immaculate Conception"], [12, 25, "Christmas Day"]]).concat(eas(y, [GF])); }],
  ["IT", "Italy", function (y) { return fx(y, [NY, [1, 6, "Epiphany"], [4, 25, "Liberation Day"], MAY1, [6, 2, "Republic Day"], [8, 15, "Ferragosto"], [11, 1, "All Saints' Day"], [12, 8, "Immaculate Conception"]].concat(XMAS2)).concat(eas(y, [ES, EM])); }],
  ["UK", "United Kingdom (England)", function (y) {
    var ny = sdDate(y, 0, 1), x = sdDate(y, 11, 25).getDay();   // the weekday of Christmas Day decides where the two days off land
    return eas(y, [GF, EM]).concat([[ny.getDay() === 6 ? plus(ny, 2) : ny.getDay() === 0 ? plus(ny, 1) : ny, "New Year's Day" + (ny.getDay() % 6 ? "" : " (substitute)")],
      [nthDow(y, 4, 1, 1), "Early May bank holiday"], [lastDow(y, 4, 1), "Spring bank holiday"], [lastDow(y, 7, 1), "Summer bank holiday"],
      [sdDate(y, 11, x === 6 ? 27 : x === 0 ? 27 : 25), "Christmas Day" + (x === 6 || x === 0 ? " (substitute)" : "")], [sdDate(y, 11, x === 5 ? 28 : x === 6 ? 28 : 26), "Boxing Day" + (x === 5 || x === 6 ? " (substitute)" : "")]]);
  }],
  ["US", "United States", function (y) {
    return [usObs(sdDate(y, 0, 1), "New Year's Day"), [nthDow(y, 0, 1, 3), "Martin Luther King Jr. Day"], [nthDow(y, 1, 1, 3), "Presidents' Day"], [lastDow(y, 4, 1), "Memorial Day"], usObs(sdDate(y, 5, 19), "Juneteenth"),
      usObs(sdDate(y, 6, 4), "Independence Day"), [nthDow(y, 8, 1, 1), "Labor Day"], [nthDow(y, 9, 1, 2), "Columbus Day"], usObs(sdDate(y, 10, 11), "Veterans Day"), [nthDow(y, 10, 4, 4), "Thanksgiving"], usObs(sdDate(y, 11, 25), "Christmas Day")];
  }]
];
function sdHolOn() { var h = SD().hol; return Array.isArray(h) ? h.filter(function (c) { return SD_HOL.some(function (x) { return x[0] === c; }); }) : []; }
// every marked day of one year, as { "2026-12-24": [{ id, n: name, g: group, c: country }] }
function sdYear(y) {
  var s = SD(), map = {}, add = function (d, o) { if (!d || isNaN(d)) return; var ds = ymd(d); (map[ds] = map[ds] || []).push(o); };
  SD_DAYS.forEach(function (x) { if (s[x[2]]) add(x[3](y), { id: x[0], n: x[1], g: x[2] }); });
  sdHolOn().forEach(function (cc) { var c = SD_HOL.filter(function (x) { return x[0] === cc; })[0]; c[2](y).forEach(function (h) {
    // the same holiday in two of your countries is one line naming both
    var same = (map[ymd(h[0])] || []).filter(function (x) { return x.g === "hol" && x.n === h[1]; })[0];
    if (same) same.c += ", " + c[1]; else add(h[0], { id: "hol", n: h[1], g: "hol", c: c[1] });
  }); });
  // a day that is both a marked day and a public holiday (Good Friday, Christmas Day) is one line, not two;
  // it keeps the marked day's name for its reminder
  Object.keys(map).forEach(function (ds) {
    map[ds] = map[ds].filter(function (x) {
      if (x.g === "hol") return true;
      var h = map[ds].filter(function (o) { return o.g === "hol" && o.n === x.n; })[0];
      if (h) h.also = x.id;
      return !h;
    });
  });
  if (s.season) {
    // the equinoxes and solstices move by a day between years; these are the usual dates
    [[2, 20, "Spring equinox"], [5, 21, "Summer solstice (longest day)"], [8, 22, "Autumn equinox"], [11, 21, "Winter solstice (shortest day)"]].forEach(function (x) { add(sdDate(y, x[0], x[1]), { id: "season", n: x[2], g: "season" }); });
    add(lastDow(y, 2, 0), { id: "season", n: "Clocks go forward one hour (summer time)", g: "season" });
    add(lastDow(y, 9, 0), { id: "season", n: "Clocks go back one hour (winter time)", g: "season" });
  }
  if (s.moon) {
    // one full moon every 29.53 days, counted from a known one (21 January 2000, 04:40 UTC); right to within a few hours
    var syn = 29.530588853 * 86400000, t = Date.UTC(2000, 0, 21, 4, 40), from = Date.UTC(y, 0, 1), to = Date.UTC(y + 1, 0, 1);
    for (t += Math.ceil((from - t) / syn) * syn; t < to; t += syn) add(new Date(t), { id: "moon", n: "Full moon", g: "moon" });
  }
  if (+s.pay >= 1 && +s.pay <= 31) {
    for (var m = 0; m < 12; m++) { var d = sdDate(y, m, Math.min(+s.pay, sdDate(y, m + 1, 0).getDate())); if (d.getDay() === 6) d = plus(d, -1); else if (d.getDay() === 0) d = plus(d, -2); add(d, { id: "pay", n: "Payday", g: "pay" }); }
  }
  return map;
}
var SDY = {};   // a year's map is rebuilt only when the settings change; two years (around New Year) are kept
function specialsOn(ds) {
  var y = +ds.slice(0, 4), key = JSON.stringify(SD());
  if (!SDY[y] || SDY[y].key !== key) {
    SDY[y] = { key: key, map: sdYear(y) };
    // a New Year's Day that is observed on 31 December belongs to the next year's list: bring it over
    var next = sdYear(y + 1), last = y + "-12-31";
    if (next[last]) SDY[y].map[last] = (SDY[y].map[last] || []).concat(next[last]);
  }
  return SDY[y].map[ds] || [];
}
var SD_GLYPH = { big: "★", small: "♥", hol: "●", season: "☼", moon: "○", pay: "€" };
function sdRow(x) { return '<div class="row sdrow sd-' + x.g + '"><span><b class="ctm">' + SD_GLYPH[x.g] + "</b> " + esc(x.n) + (x.g === "hol" ? " <small>public holiday · " + esc(x.c) + "</small>" : "") + "</span></div>"; }
// Reminders for the days you ticked in Settings > Calendar: on the day or a chosen number of days before, from 08:00
function sdCheck() {
  var s = SD(), rem = s.rem && typeof s.rem === "object" ? s.rem : {}, off = [0, 1, 3, 7].indexOf(+s.remDays) >= 0 ? +s.remDays : 1, now = new Date();
  if (NTF().cal === false || now.getHours() < 8 || !Object.keys(rem).some(function (k) { return rem[k]; })) return;
  var target = plus(sdDate(now.getFullYear(), now.getMonth(), now.getDate()), off), ds = ymd(target);
  specialsOn(ds).forEach(function (x) {
    if (!(rem[x.id] || (x.also && rem[x.also])) || !once("sd:" + x.id + ":" + x.n + ":" + ds)) return;
    toast("cal", x.n + (off === 0 ? " is today" : off === 1 ? " is tomorrow" : " is in " + off + " days"), dayLabel(ds) + (x.g === "hol" ? " · public holiday in " + x.c : ""), { a: "cal", k: ds }, true);
  });
}
setInterval(sdCheck, 60000);
// Settings > Calendar
function renderSdForm() {
  var s = SD(), hol = sdHolOn(), rem = s.rem || {};
  $("sdGroups").innerHTML = SD_GROUPS.map(function (g) { return "<label><span>" + g[1] + ' <small class="rlang">' + g[2] + '</small></span> <input type="checkbox" data-a="sdset" data-k="g:' + g[0] + '"' + (s[g[0]] ? " checked" : "") + "></label>"; }).join("") +
    "<label>Week numbers in the calendar <input type=\"checkbox\" data-a=\"sdset\" data-k=\"g:weeks\"" + (s.weeks ? " checked" : "") + "></label>";
  $("sdHol").innerHTML = SD_HOL.map(function (c) { return '<label class="chip"><input type="checkbox" data-a="sdset" data-k="h:' + c[0] + '"' + (hol.indexOf(c[0]) >= 0 ? " checked" : "") + "> " + esc(c[1]) + "</label>"; }).join("");
  $("sdMf").innerHTML = SD_MF.map(function (c) { return '<option value="' + c[0] + '"' + (c[0] === sdMF() ? " selected" : "") + ">" + c[1] + "</option>"; }).join("");
  $("sdPay").value = +s.pay >= 1 && +s.pay <= 31 ? s.pay : "";
  $("sdRemDays").value = String([0, 1, 3, 7].indexOf(+s.remDays) >= 0 ? +s.remDays : 1);
  $("sdRem").innerHTML = SD_DAYS.map(function (d) { return [d[0], d[1]]; }).concat([["hol", "Public holidays"], ["pay", "Payday"], ["season", "Clock changes and seasons"], ["moon", "Full moons"]]).map(function (d) {
    return '<label class="chip"><input type="checkbox" data-a="sdset" data-k="r:' + d[0] + '"' + (rem[d[0]] ? " checked" : "") + "> " + esc(d[1]) + "</label>";
  }).join("");
}
function sdSet(k, on) {
  var s = P.sd = Object.assign({}, SD()), p = k.split(":");
  if (p[0] === "g") s[p[1]] = on;
  else if (p[0] === "h") { var h = sdHolOn().filter(function (c) { return c !== p[1]; }); if (on) h.push(p[1]); s.hol = h; }
  else if (p[0] === "r") { s.rem = Object.assign({}, s.rem || {}); if (on) s.rem[p[1]] = 1; else delete s.rem[p[1]]; if (on && NTF().desktop) askNotify(); }
  persist(); render(); refreshSdCal();
}
function refreshSdCal() { if (sideOf("cal") || (!$("modal").hidden && $("mTitle").textContent === WIDGETS.cal.t)) openCal(); }

// ---- One small line under the date: the next thing in your calendar, however far off (an event, a birthday, a
// favorite's game, a marked day, a public holiday, payday). Only the closest day, and only its first entry.
function nextUp() {
  var now = new Date(), hm = pad2(now.getHours()) + ":" + pad2(now.getMinutes());
  for (var k = 0; k <= 366; k++) {   // whatever comes next, up to a year ahead
    var ds = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + k));
    var list = evsOn(ds).filter(function (e) { return k > 0 || !e.tm || e.tm >= hm; }).map(function (e) { return { t: e.t, tm: e.tm || "", b: e.rep === "b" }; })   // what is already over today is skipped
      .concat(specialsOn(ds).map(function (x) { return { t: x.n, tm: "" }; }));
    if (list.length) return { ds: ds, k: k, first: list[0], more: list.length - 1 };
  }
  return null;
}
function renderNextUp() {
  var el = $("nextUp"), n = nextUp();
  el.hidden = !n;
  document.querySelector("header").classList.toggle("hasnext", !!n);
  setTimeout(positionClocks, 0);   // the timers make room for the line
  if (!n) return;
  el.dataset.k = n.ds;
  el.textContent = (n.k === 0 ? "Today" : n.k === 1 ? "Tomorrow" : dayLabel(n.ds) + (n.k > 7 ? ", in " + n.k + " days" : "")) + (n.first.tm ? " " + n.first.tm : "") + " · " + (n.first.b ? "🎂 " : "") + n.first.t + (n.more ? "  +" + n.more : "");
}
function calHtml() {
  var now = new Date(), today = ymd(now);
  if (!CALV) CALV = { y: now.getFullYear(), m: now.getMonth(), sel: today };
  if (!SPCALWANT && spCalOn()) { SPCALWANT = true; setTimeout(fetchSports, 0); }
  var start = (new Date(CALV.y, CALV.m, 1).getDay() + 6) % 7, days = new Date(CALV.y, CALV.m + 1, 0).getDate(), cells = "";
  // With week numbers on, every row starts with its week. A public holiday is a red date; any other marked day has a
  // small ring under the number (your own events keep their dot).
  var wk = !!SD().weeks, wkCell = function (day) { return wk ? '<em class="wkn">' + isoWeek(new Date(CALV.y, CALV.m, day)) + "</em>" : ""; };
  cells += wk ? "<i></i>" : "";
  ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].forEach(function (d) { cells += "<i>" + d + "</i>"; });
  cells += wkCell(1);
  for (var i = 0; i < start; i++) cells += "<span></span>";
  for (var d = 1; d <= days; d++) {
    var ds = CALV.y + "-" + pad2(CALV.m + 1) + "-" + pad2(d), sp = specialsOn(ds), hol = sp.some(function (x) { return x.g === "hol"; });
    if (d > 1 && (start + d - 1) % 7 === 0) cells += wkCell(d);
    cells += '<button data-a="calday" data-k="' + ds + '" class="' + (ds === today ? "td " : "") + (ds === CALV.sel ? "on " : "") + (hol ? "hol" : "") + '"' + (sp.length ? ' title="' + esc(sp.map(function (x) { return x.n; }).join(" · ")) + '"' : "") + ">" + d +
      (evsOn(ds).length ? "<u></u>" : "") + (sp.some(function (x) { return x.g !== "hol"; }) ? "<s></s>" : "") + "</button>";
  }
  var evRow = function (e, ds, withDay) {
    return '<div class="row"><span>' + (withDay ? '<button class="lnk" data-a="caljump" data-k="' + ds + '"><b class="ctm">' + dayLabel(ds) + "</b></button> " : "") + '<b class="ctm">' + (e.tm || "all day") + "</b> " + (e.sp ? '<button class="lnk calsp" data-a="open" data-k="' + esc("p:" + e.sp) + '" title="A favorite\'s game. Click for the details.">' + spIcon(e.spo) + esc(e.t) + "</button>" : e.tv ? '<button class="lnk calsp" data-a="tvopen" data-k="' + esc(String(e.tv)) + '" title="An episode of a show you follow. Click for the show.">' + esc(e.t) + "</button>" : esc(e.t)) +
      // a birthday with the birth year in its name ("Anna 1990") also says which birthday it is
      (e.rep === "b" ? " <small>🎂" + (function () { var by = /\b(19|20)\d\d\b/.exec(e.t), n = by ? +ds.slice(0, 4) - +by[0] : 0; return n > 0 && n < 130 ? " turns " + n : ""; })() + "</small>" : e.rep ? " <small>↻ " + REPS[e.rep].toLowerCase() + "</small>" : "") + (e.cn ? ' <small class="calcn" title="From a calendar you follow">' + esc(e.cn) + "</small>" : "") + (e.rem != null ? ' <small title="Reminder">◷ ' + (e.rem ? (e.rem >= 1440 ? "1d" : e.rem >= 60 ? "1h" : e.rem + "m") : "on time") + "</small>" : "") +
      "</span>" + (withDay || e.sp || e.ro ? "" : '<span class="r"><button data-a="caledit" data-k="' + e.id + '" title="Change this event: its name, day, time, reminder and repeat" aria-label="Change this event">✎</button><button data-a="calrep" data-k="' + e.id + '" title="Repeat: ' + esc(REPS[e.rep || ""]) + '. Press to change (Once, Birthday, Yearly, Monthly, Weekly, Daily)." aria-label="Change how this event repeats">↻</button><button data-a="caldel" data-k="' + e.id + '" aria-label="Delete event">✕</button></span>') + "</div>";
  };
  var ed = CALEDIT ? (P.cal || []).filter(function (x) { return x.id === CALEDIT; })[0] : null;
  if (!ed) CALEDIT = "";
  var up = [];
  for (var k = 1; k <= 90 && up.length < 5; k++) {
    var uds = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + k));
    evsOn(uds).forEach(function (e) { if (up.length < 5) up.push(evRow(e, uds, true)); });
  }
  return '<div class="calwrap"><div><div class="calh"><button data-a="calnav" data-k="-1" aria-label="Previous month">◀</button><b>' +
    new Date(CALV.y, CALV.m, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) + '</b><button data-a="calnav" data-k="1" aria-label="Next month">▶</button><button data-a="calnav" data-k="0">Today</button></div><div class="calg' + (wk ? " wk" : "") + '">' + cells + "</div></div>" +
    '<div class="calr"><h3>' + (CALV.sel === today ? "Today · " : "") + dayLabel(CALV.sel) + "</h3>" + specialsOn(CALV.sel).map(sdRow).join("") + (evsOn(CALV.sel).map(function (e) { return evRow(e, CALV.sel); }).join("") || (specialsOn(CALV.sel).length ? "" : '<p class="mut sn">Nothing planned.</p>')) +
    // the same form adds a new event or, after ✎ on an event, changes that one (then it also has a field for the day)
    '<form id="calAdd" class="cadd' + (ed ? " ed" : "") + '" data-ed="' + (ed ? esc(ed.id) : "") + '">' + (ed ? '<div class="caled">Changing “' + esc(String(ed.t).slice(0, 40)) + '”</div><input type="date" id="calD" value="' + esc(ed.d) + '" aria-label="Day" title="Day">' : "") +
    '<input type="text" id="calT" placeholder="Add an event…" maxlength="120"' + (ed ? ' value="' + esc(ed.t) + '"' : "") + '><input type="time" id="calTm" aria-label="Time (empty = all day)" title="Time (leave empty for all day)"' + (ed && ed.tm ? ' value="' + esc(ed.tm) + '"' : "") + ">" +
    '<select id="calRem" aria-label="Reminder">' + opts(REMS, ed && ed.rem != null ? String(ed.rem) : "") + '</select><select id="calRep" aria-label="Repeat">' + opts(Object.keys(REPS).map(function (r) { return [r, REPS[r]]; }), ed ? ed.rep || "" : "") + '</select><button class="pri">' + (ed ? "Save" : "Add") + "</button>" + (ed ? '<button type="button" data-a="calcancel">Cancel</button>' : "") + "</form>" +
    (up.length ? "<h3>Coming up</h3>" + up.join("") : "") + "</div></div>";
}
function calAct(a, k) {
  if (a === "caledit") CALEDIT = CALEDIT === k ? "" : k;
  else if (a === "calcancel" || (a === "caldel" && k === CALEDIT)) CALEDIT = "";
  if (a === "calday" || a === "caljump") { CALV.sel = k; CALV.y = +k.slice(0, 4); CALV.m = +k.slice(5, 7) - 1; }
  else if (a === "calnav") {
    if (k === "0") CALV = null;
    else { var d = new Date(CALV.y, CALV.m + (+k), 1); CALV.y = d.getFullYear(); CALV.m = d.getMonth(); }
  }
  else if (a === "caldel") { P.cal = (P.cal || []).filter(function (e) { return e.id !== k; }); persist(); render(); }
  else if (a === "calrep") {
    // the ↻ button on an event: steps through Once, Birthday, Yearly, Monthly, Weekly, Daily
    var ev = (P.cal || []).filter(function (e) { return e.id === k; })[0], order = Object.keys(REPS);
    if (ev) { var nx = order[(order.indexOf(ev.rep || "") + 1) % order.length]; if (nx) ev.rep = nx; else delete ev.rep; persist(); render(); }
  }
  openCal();
}
document.addEventListener("submit", function (e) {
  if (e.target.id !== "calAdd") return;
  e.preventDefault();
  var t = $("calT").value.trim();
  if (!t) return;
  if (CALEDIT) {
    var ce = (P.cal || []).filter(function (x) { return x.id === CALEDIT; })[0];
    if (ce) {
      ce.t = t;
      if ($("calD") && /^\d{4}-\d\d-\d\d$/.test($("calD").value)) ce.d = $("calD").value;
      if ($("calTm").value) ce.tm = $("calTm").value; else delete ce.tm;
      if ($("calRem").value !== "") { ce.rem = +$("calRem").value; if (NTF().desktop) askNotify(); } else delete ce.rem;
      var nr = $("calRep").value;
      if (nr !== (ce.rep || "")) { delete ce.iv; delete ce.u; delete ce.x; }   // another kind of repeat: the imported fine print no longer fits
      if (nr) ce.rep = nr; else delete ce.rep;
      CALV.sel = ce.d; CALV.y = +ce.d.slice(0, 4); CALV.m = +ce.d.slice(5, 7) - 1;
    }
    CALEDIT = ""; persist(); render(); openCal(); return;
  }
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
var BRIEF_T = "Summary";
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
function topStories(n, hours, skip) {
  var now = Date.now(), cut = now - (hours || 24) * 3600000, df = {};
  NEWS.concat(TGP, RD).forEach(function (x) {
    if (x.ts < cut) return;
    var seen = {};
    tokSet(x.t, x.lg).set.forEach(function (w) { if (!seen[w]) { seen[w] = 1; df[w] = (df[w] || 0) + 1; } });
  });
  var pool = newsGroups().filter(function (g) { return g[0].ts > cut && (!skip || g.some(function (x) { return !skip(x.s); })); }).map(function (g) {
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
// What the summary can show, in the order it starts with: [id, name, what it is, on from the start]
var SUM_PARTS = [
  ["wx", "Weather", "The weather now, today's low and high, and any warnings", 1],
  ["cal", "Today in your calendar", "Your events of today, also from calendars you follow", 1],
  ["top", "Top stories", "What most of your news sources are writing about", 1],
  ["tg", "Telegram", "The newest posts of your channels", 0],
  ["rd", "Reddit", "The posts at the top of your subreddits", 0],
  ["movers", "Biggest stock movers", "The stocks on your list that moved most today", 1],
  ["mail", "Mail", "Unread mail in your inboxes", 1],
  ["live", "Live now on Twitch", "Channels you follow that are live right now", 1],
  ["waslive", "Streamers you missed", "Your ★ streamers who were live while you were away and are offline now", 1],
  ["tv", "TV episodes", "Episodes of your shows that just aired or air within a day", 1],
  ["spres", "Sports results", "Games, fights and races that finished", 1],
  ["spnext", "Sports coming up", "What is on now and in the next 24 hours", 1]
];
var SUM_AUTO = [["off", "Never (only when I open it)"], ["day", "On the first visit of the day"], ["away", "When I come back after being away"], ["both", "Both: first visit of the day and after being away"]];
var SUM_AWAY = [["30", "30 minutes"], ["60", "1 hour"], ["120", "2 hours"], ["240", "4 hours"], ["480", "8 hours"]];
var SUM_SPAN = [["6", "The last 6 hours"], ["12", "The last 12 hours"], ["24", "The last 24 hours"], ["48", "The last 2 days"]];
var SUM_LOOK = [["list", "List: one part under the other"], ["cards", "Cards: parts side by side in boxes"], ["compact", "Compact: small and tight"]];
var SUM_N = [["3", "3"], ["6", "6"], ["10", "10"], ["15", "15"]];
// The summary settings with every gap filled in. P.sum = { auto, away, span, look, n, order, off, x, twFav, spFav };
// `x` holds what is left OUT of a part ("n:BBC", "g:channel", "r:subreddit", "p:football"), so new sources are in by themselves.
function SUM() {
  var s = P.sum && typeof P.sum === "object" ? P.sum : {}, ids = SUM_PARTS.map(function (p) { return p[0]; }), has = function (list, v, d) { return list.some(function (o) { return o[0] === String(v); }) ? String(v) : d; };
  var order = (Array.isArray(s.order) ? s.order : []).filter(function (x, i, a) { return ids.indexOf(x) >= 0 && a.indexOf(x) === i; }), off = {};
  ids.forEach(function (x) { if (order.indexOf(x) < 0) order.push(x); });
  SUM_PARTS.forEach(function (p) { var v = s.off && typeof s.off === "object" ? s.off[p[0]] : null; if (v == null ? !p[3] : v) off[p[0]] = 1; });
  return { auto: P.brief === false ? "off" : has(SUM_AUTO, s.auto, "day"), away: +has(SUM_AWAY, s.away, "120"), span: +has(SUM_SPAN, s.span, "24"), look: has(SUM_LOOK, s.look, "list"), n: +has(SUM_N, s.n, "6"),
    order: order, off: off, x: s.x && typeof s.x === "object" ? s.x : {}, twFav: !!s.twFav, spFav: !!s.spFav };
}
function sumSet(k, v) { P.sum = Object.assign({}, P.sum && typeof P.sum === "object" ? P.sum : {}); P.sum[k] = v; persist(); renderSumSet(); refreshBrief(); }
// every game, fight and race that is loaded for the leagues you follow (minus the sports left out of the summary)
function sumSports(S) {
  var by = {}, on = {};
  spLeagues().forEach(function (l) { on[l.n] = 1; });
  [SP_PAST, SP_UP, SP_NOW].forEach(function (st) { Object.keys(st).forEach(function (k) { st[k].ev.forEach(function (e) { by[e.id] = e; }); }); });
  return Object.keys(by).map(function (k) { return by[k]; }).filter(function (e) { return on[e.lg] && e.id.slice(-2) !== "~r" && !S.x["p:" + e.sp] && (!S.spFav || e.names.some(spIsFav)); });
}
function sumSpRow(e) {
  var txt = e.kind === "team" ? esc(e.home.n) + (e.state === "pre" ? ' <span class="mut">–</span> ' : " <b>" + esc(e.home.s != null ? e.home.s : "") + "–" + esc(e.away.s != null ? e.away.s : "") + "</b> ") + esc(e.away.n) : esc(e.title || "");
  return '<div class="row"><span><button class="lnk bsp" data-a="open" data-k="' + esc("p:" + e.id) + '">' + spIcon(e.sp) + "<span>" + txt + '</span></button></span><span class="r">' + (e.names.some(spIsFav) ? '<i class="fv">★</i>' : "") + (e.state === "post" ? '<span class="mut">' + esc(e.lg) + "</span>" : spWhen(e)) + "</span></div>";
}
// the parts of the summary that have something to show: { id: html }
function sumParts(S) {
  var now = Date.now(), cut = now - S.span * 3600000, N = S.n, out = {};
  if (WX && WX.current) {
    var warn = wxWarn(WX), d = WX.daily || {};
    out.wx = (warn.length ? '<div class="warnbox">' + warn.map(function (x) { return "<div><b>! " + x.t + "</b> " + x.day.toLowerCase() + (x.x ? " · " + esc(x.x) : "") + "</div>"; }).join("") + "</div>" : "") +
      '<div class="row"><span><button class="lnk bsp" data-a="weather">' + wxIcon(WX.current.weather_code, WX.current.is_day, 18) + "<span><b>" + esc(homeCity().name) + " " + Math.round(WX.current.temperature_2m) + "°</b> " + esc(wxText(WX.current.weather_code)) + '</span></button></span><span class="r mut">' +
      (d.temperature_2m_min && d.temperature_2m_max ? Math.round(d.temperature_2m_min[0]) + "° / " + Math.round(d.temperature_2m_max[0]) + "°" : "") + "</span></div>";
  }
  out.cal = evsOn(ymd(new Date())).slice(0, Math.max(N, 6)).map(function (e) { return '<div class="row"><span><b class="ctm">' + (e.tm || "all day") + "</b> " + esc(e.t) + "</span></div>"; }).join("");
  out.top = (NEWS.length ? topStories(N, S.span, function (src) { return !!S.x["n:" + src]; }) : []).map(function (g) {
    return '<div class="row' + (g.some(function (x) { return isRead(x.u); }) ? " rd" : "") + '"><span><button class="lnk" data-a="open" data-k="' + esc("a:" + g[0].u) + '">' + esc(g[0].t) + "</button> <small>" + esc(g.map(function (x) { return x.s; }).join(" · ")) + '</small></span><span class="r"><span class="mut">' + ago(g[0].ts) + "</span>" + (g.length > 1 ? '<span class="pill ac">' + g.length + "</span>" : "") + "</span></div>";
  }).join("");
  out.tg = TGP.filter(function (g) { return g.ts > cut && shown("g:" + g.s) && !S.x["g:" + g.s]; }).sort(function (a, b) { return b.ts - a.ts; }).slice(0, N).map(function (g) {
    return '<div class="row' + (isRead(g.u) ? " rd" : "") + '"><span><button class="lnk" data-a="open" data-k="' + esc("m:" + g.u) + '">' + esc(String(g.t).slice(0, 140)) + "</button> <small>" + esc(g.s) + '</small></span><span class="r mut">' + ago(g.ts) + "</span></div>";
  }).join("");
  out.rd = RD.filter(function (x) { return x.ts > cut && !S.x["r:" + x.s]; }).slice(0, N).map(function (x) {
    return '<div class="row' + (isRead(x.u) ? " rd" : "") + '"><span><button class="lnk" data-a="open" data-k="' + esc("r:" + x.u) + '">' + esc(String(x.t).slice(0, 140)) + "</button> <small>r/" + esc(x.s) + '</small></span><span class="r mut">' + ago(x.ts) + "</span></div>";
  }).join("");
  var mv = (P.stocks || []).map(function (x) { var q = QUOTES[tk(x.id)]; return q && q.c != null && !P.hidden["s:" + x.id] ? { id: x.id, c: q.c } : null; }).filter(Boolean).sort(function (a, b) { return Math.abs(b.c) - Math.abs(a.c); }).slice(0, N);
  out.movers = mv.length ? '<div class="chips">' + mv.map(function (x) { return '<button data-a="open" data-k="' + esc("s:" + x.id) + '"><b>' + esc(tk(x.id)) + '</b> <span class="' + (x.c >= 0 ? "up" : "down") + '">' + (x.c >= 0 ? "+" : "") + x.c.toFixed(1) + "%</span></button>"; }).join("") + "</div>" : "";
  var mail = [0, 1].map(function (i) { var c = P.mail && P.mail[i], m = MAIL[i]; if (!c || !c.url || !m || m.error) return ""; var n = mailN(i); return '<button data-a="mail" data-k="' + i + '"><b>' + esc(c.name || "Mail") + "</b> " + n.txt + " " + n.lab + "</button>"; }).join("");
  out.mail = mail ? '<div class="chips">' + mail + "</div>" : "";
  var liveAll = (TWC && TW ? TW : []).filter(function (x) { return !P.hidden["t:" + x.id] && (!S.twFav || P.fav["t:" + x.id]); }), liveIds = {};
  (TWC && TW ? TW : []).forEach(function (x) { liveIds[x.id] = 1; });
  var live = liveAll.sort(function (a, b) { return (P.fav["t:" + b.id] ? 1 : 0) - (P.fav["t:" + a.id] ? 1 : 0) || b.v - a.v; }).slice(0, Math.max(N, 4));
  out.live = live.length ? '<div class="chips">' + live.map(function (x) { return '<button data-a="open" data-k="' + esc("t:" + x.id) + '" title="' + esc(x.title || "") + '"><span class="dot"></span><b>' + esc(x.name || x.id) + "</b> <small>" + esc(x.sub || "") + "</small></button>"; }).join("") + "</div>" : "";
  var was = (TWC ? twFavs() : []).filter(function (l) { var o = TWOFF[l]; return !liveIds[l] && o && o.last > cut; }).sort(function (a, b) { return TWOFF[b].last - TWOFF[a].last; }).slice(0, Math.max(N, 4));
  out.waslive = was.length ? '<div class="chips">' + was.map(function (l) { return '<button data-a="open" data-k="' + esc("t:" + l) + '"><b>' + esc(TWOFF[l].n || l) + '</b> <small>was live ' + ago(TWOFF[l].last) + " ago</small></button>"; }).join("") + "</div>" : "";
  var sp = S.off.spres && S.off.spnext ? [] : sumSports(S), end = function (e) { return e.te || e.ts; };
  out.spres = sp.filter(function (e) { return e.state === "post" && end(e) > cut; }).sort(function (a, b) { return (b.names.some(spIsFav) ? 1 : 0) - (a.names.some(spIsFav) ? 1 : 0) || end(b) - end(a); }).slice(0, N).map(sumSpRow).join("");
  out.spnext = sp.filter(function (e) { return e.state === "in" || (e.state === "pre" && e.ts > now - 3600000 && e.ts < now + 86400000); }).sort(function (a, b) { return (b.state === "in" ? 1 : 0) - (a.state === "in" ? 1 : 0) || (b.names.some(spIsFav) ? 1 : 0) - (a.names.some(spIsFav) ? 1 : 0) || a.ts - b.ts; }).slice(0, N).map(sumSpRow).join("");
  var tvr = [];
  if (!boxOff("tv")) tvShows().forEach(function (s) {
    var c = TVC[s.id];
    if (!c) return;
    if (c.prev && c.prev.ts > cut) tvr.push({ id: s.id, n: c.n || s.n, ep: c.prev, past: 1 });
    if (c.next && c.next.ts < now + 86400000) tvr.push({ id: s.id, n: c.n || s.n, ep: c.next, past: c.next.ts <= now ? 1 : 0 });
  });
  out.tv = tvr.sort(function (a, b) { return a.ep.ts - b.ep.ts; }).slice(0, N).map(function (r) {
    return '<div class="row"><span><button class="lnk" data-a="tvopen" data-k="' + r.id + '"><b>' + esc(r.n) + "</b>" + (tvCode(r.ep) ? " <small>" + esc(tvCode(r.ep)) + "</small>" : "") + '</button></span><span class="r mut">' + (r.past ? "aired " + ago(r.ep.ts) + " ago" : tvDayName(r.ep.ts) + " " + tvTime(r.ep.ts)) + "</span></div>";
  }).join("");
  return out;
}
function briefHtml() {
  var S = SUM(), parts = sumParts(S), name = {};
  SUM_PARTS.forEach(function (p) { name[p[0]] = p[1]; });
  var h = S.order.filter(function (id) { return !S.off[id] && parts[id]; }).map(function (id) { return '<section class="bsec"><h3>' + name[id] + "</h3>" + parts[id] + "</section>"; }).join("");
  return '<div class="bhead mut sn">' + esc(SUM_SPAN.filter(function (o) { return +o[0] === S.span; })[0][1]) + "</div>" + (h || '<p class="mut bnone">Nothing to show yet. ' + (USER ? "Let the page load first, or switch more parts on." : "Sign in and let the page load first.") + "</p>") +
    '<div class="bfoot"><button class="lnk2" data-a="setgo" data-k="Summary">Choose what the summary shows</button></div>';
}
function briefWrap() { return '<div class="brief ' + SUM().look + '">' + briefHtml() + "</div>"; }
function openBrief() {
  // results need the finished games of the last days: read once, when the summary asks for them
  var S = SUM();
  if (!S.off.spres && !boxOff("sports") && !SUMSP) { SUMSP = true; spLeagues().forEach(function (lg) { if (lg.kind && !lg.x && !SP_PAST[lg.id]) spGet(lg, SP_CATALOG.indexOf(lg), spPastDates(lg), true).then(refreshBrief); }); }
  openModal(BRIEF_T, briefWrap());
}
var SUMSP = false;
// Keeps an open summary up to date while the rest of the data is still arriving
function refreshBrief() { if (!$("modal").hidden && $("mTitle").textContent === BRIEF_T) $("mBody").innerHTML = briefWrap(); }
// Opens by itself: on the first visit of the day, and/or when you come back after being away for a while (Settings > Summary).
// "Away" = the page was closed, or its tab was in the background, for at least the time you chose.
var SUM_SEEN = +load("sp_sumseen", 0) || 0, SUM_READY = false;
function sumTouch() { SUM_SEEN = Date.now(); save("sp_sumseen", SUM_SEEN); }
function maybeBrief() {
  var S = SUM(), today = ymd(new Date()), now = Date.now();
  if (document.hidden || !USER || !NEWS.length) return;
  SUM_READY = true;
  var day = (S.auto === "day" || S.auto === "both") && load("sp_brief", "") !== today;
  var away = (S.auto === "away" || S.auto === "both") && SUM_SEEN > 0 && now - SUM_SEEN >= S.away * 60000;
  sumTouch();
  if ((!day && !away) || !$("modal").hidden || !$("panel").hidden) return;
  save("sp_brief", today);
  openBrief();
}
setInterval(function () { if (!document.hidden && SUM_READY) sumTouch(); }, 60000);
document.addEventListener("visibilitychange", function () { if (!document.hidden && SUM_READY) setTimeout(maybeBrief, 3000); });
// ---- Settings > Summary ----
var SUM_PICK = "";
function sumChoices(id) {
  if (id === "top") return newsSrc().map(function (x) { return ["n:" + x.name, x.name]; });
  if (id === "tg") return tgSrc().map(function (x) { return ["g:" + x, x]; });
  if (id === "rd") return rdSrc().map(function (x) { return ["r:" + x, "r/" + x]; });
  if (id === "spres" || id === "spnext") return spSports().slice(1).map(function (x) { return ["p:" + x[0], x[1]]; });
  return [];
}
function renderSumSet() {
  var el = $("sumParts");
  if (!el) return;
  var S = SUM(), info = {};
  SUM_PARTS.forEach(function (p) { info[p[0]] = p; });
  $("sumAuto").innerHTML = opts(SUM_AUTO, S.auto); $("sumAway").innerHTML = opts(SUM_AWAY, String(S.away)); $("sumSpan").innerHTML = opts(SUM_SPAN, String(S.span));
  $("sumLook").innerHTML = opts(SUM_LOOK, S.look); $("sumN").innerHTML = opts(SUM_N, String(S.n));
  $("sumAwayRow").hidden = S.auto !== "away" && S.auto !== "both";
  el.innerHTML = S.order.map(function (id, i) {
    var p = info[id], ch = sumChoices(id), fav = id === "live" || id === "waslive" ? "twFav" : id === "spres" || id === "spnext" ? "spFav" : "", can = ch.length > 1 || (fav && id !== "waslive"), open = SUM_PICK === id && can;
    var left = ch.filter(function (c) { return S.x[c[0]]; }).length, note = left ? (ch.length - left) + " of " + ch.length : fav && S[fav] && id !== "waslive" ? "★ only" : "";
    return '<div class="sumrow' + (S.off[id] ? " off" : "") + '"><label><input type="checkbox" data-sum="on" data-id="' + id + '"' + (S.off[id] ? "" : " checked") + '> <span class="bnm">' + p[1] + '</span></label><span class="mut sn sumd">' + p[2] + "</span>" +
      '<span class="sumb">' + (can ? '<button data-a="sumpick" data-k="' + id + '"' + (open ? ' class="on"' : "") + ' title="Choose what this part includes">' + (note ? esc(note) : "Choose…") + "</button>" : "") +
      '<button data-a="summv" data-k="' + id + '|-1" title="Move up" aria-label="Move ' + p[1] + ' up"' + (i ? "" : " disabled") + '>▲</button><button data-a="summv" data-k="' + id + '|1" title="Move down" aria-label="Move ' + p[1] + ' down"' + (i < S.order.length - 1 ? "" : " disabled") + ">▼</button></span>" +
      (open ? '<div class="sumpick">' + (fav && id !== "waslive" ? '<label class="sumfav"><input type="checkbox" data-sum="' + fav + '"' + (S[fav] ? " checked" : "") + "> " + (fav === "twFav" ? "Only my ★ channels" : "Only games of my ★ teams, fighters and players") + "</label>" : "") +
        (ch.length > 1 ? '<div class="chipwrap">' + ch.map(function (c) { return '<label><input type="checkbox" data-sum="x" data-id="' + esc(c[0]) + '"' + (S.x[c[0]] ? "" : " checked") + "> " + esc(c[1]) + "</label>"; }).join("") + "</div>" : "") + "</div>" : "") + "</div>";
  }).join("");
}
function sumAct(a, k) {
  if (a === "sumshow") { $("panel").hidden = true; openBrief(); return; }
  if (a === "sumpick") { SUM_PICK = SUM_PICK === k ? "" : k; renderSumSet(); return; }
  if (a === "summv") {
    var p = String(k).split("|"), o = SUM().order.slice(), i = o.indexOf(p[0]), j = i + (+p[1] || 0);
    if (i < 0 || j < 0 || j >= o.length) return;
    o.splice(i, 1); o.splice(j, 0, p[0]); sumSet("order", o);
  }
}
document.addEventListener("change", function (e) {
  var t = e.target, S = SUM();
  if (!t) return;
  if (t.id === "sumAuto") { P.brief = t.value !== "off"; sumSet("auto", t.value); return; }
  if (t.id === "sumAway") { sumSet("away", +t.value); return; }
  if (t.id === "sumSpan") { sumSet("span", +t.value); return; }
  if (t.id === "sumLook") { sumSet("look", t.value); return; }
  if (t.id === "sumN") { sumSet("n", +t.value); return; }
  if (!t.dataset || !t.dataset.sum) return;
  if (t.dataset.sum === "on") { var off = {}; SUM_PARTS.forEach(function (p) { off[p[0]] = S.off[p[0]] ? 1 : 0; }); off[t.dataset.id] = t.checked ? 0 : 1; sumSet("off", off); }
  else if (t.dataset.sum === "x") { var x = Object.assign({}, S.x); if (t.checked) delete x[t.dataset.id]; else x[t.dataset.id] = 1; sumSet("x", x); }
  else if (t.dataset.sum === "twFav" || t.dataset.sum === "spFav") sumSet(t.dataset.sum, t.checked);
});

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
  { id: "soccer/nor.1", sp: "football", n: "Eliteserien (Norway)" }, { id: "soccer/den.1", sp: "football", n: "Superliga (Denmark)" }, { id: "soccer/fin.1", sp: "football", n: "Veikkausliiga (Finland)" },
  { id: "soccer/sco.1", sp: "football", n: "Scottish Premiership" }, { id: "soccer/bel.1", sp: "football", n: "Pro League (Belgium)" }, { id: "soccer/tur.1", sp: "football", n: "Süper Lig (Turkey)" },
  { id: "soccer/gre.1", sp: "football", n: "Super League (Greece)" }, { id: "soccer/sui.1", sp: "football", n: "Super League (Switzerland)" }, { id: "soccer/aut.1", sp: "football", n: "Bundesliga (Austria)" },
  { id: "soccer/rus.1", sp: "football", n: "Premier League (Russia)" }, { id: "soccer/ksa.1", sp: "football", n: "Saudi Pro League" }, { id: "soccer/bra.1", sp: "football", n: "Série A (Brazil)" },
  { id: "soccer/arg.1", sp: "football", n: "Liga Profesional (Argentina)" }, { id: "soccer/mex.1", sp: "football", n: "Liga MX (Mexico)" },
  { id: "soccer/eng.fa", sp: "football", n: "FA Cup" }, { id: "soccer/eng.league_cup", sp: "football", n: "Carabao Cup" }, { id: "soccer/esp.copa_del_rey", sp: "football", n: "Copa del Rey" },
  { id: "soccer/ger.dfb_pokal", sp: "football", n: "DFB-Pokal" }, { id: "soccer/ita.coppa_italia", sp: "football", n: "Coppa Italia" },
  { id: "soccer/fifa.world", sp: "football", n: "World Cup" }, { id: "soccer/uefa.euro", sp: "football", n: "European Championship" }, { id: "soccer/uefa.nations", sp: "football", n: "Nations League" },
  { id: "soccer/fifa.worldq.uefa", sp: "football", n: "World Cup qualifying (Europe)" }, { id: "soccer/eng.w.1", sp: "football", n: "Women's Super League" }, { id: "soccer/uefa.wchampions", sp: "football", n: "Women's Champions League" },
  { id: "basketball/nba", sp: "basketball", n: "NBA", on: 1 }, { id: "basketball/wnba", sp: "basketball", n: "WNBA" },
  { id: "basketball/mens-college-basketball", sp: "basketball", n: "College basketball (NCAA)" },
  { id: "mma/ufc", sp: "ufc", n: "UFC", kind: "card", on: 1 },
  { id: "hockey/nhl", sp: "hockey", n: "NHL" },
  { id: "football/nfl", sp: "amfootball", n: "NFL" }, { id: "football/college-football", sp: "amfootball", n: "College football (NCAA)" },
  { id: "baseball/mlb", sp: "baseball", n: "MLB" },
  { id: "tennis/atp", sp: "tennis", n: "ATP tennis", kind: "tour" }, { id: "tennis/wta", sp: "tennis", n: "WTA tennis", kind: "tour" },
  { id: "racing/f1", sp: "racing", n: "Formula 1", kind: "race" }, { id: "racing/irl", sp: "racing", n: "IndyCar", kind: "race" }, { id: "racing/nascar-premier", sp: "racing", n: "NASCAR Cup Series", kind: "race" },
  { id: "golf/pga", sp: "golf", n: "PGA Tour", kind: "race" }, { id: "golf/eur", sp: "golf", n: "DP World Tour", kind: "race" }, { id: "golf/lpga", sp: "golf", n: "LPGA Tour", kind: "race" },
  { id: "rugby/180659", sp: "rugby", n: "Six Nations" }, { id: "rugby/164205", sp: "rugby", n: "Rugby World Cup" }, { id: "rugby/271937", sp: "rugby", n: "Champions Cup" }, { id: "rugby/267979", sp: "rugby", n: "Premiership (England)" },
  { id: "rugby/270557", sp: "rugby", n: "United Rugby Championship" }, { id: "rugby/270559", sp: "rugby", n: "Top 14 (France)" }, { id: "rugby/242041", sp: "rugby", n: "Super Rugby Pacific" }, { id: "rugby-league/3", sp: "rugby", n: "NRL (rugby league)" },
  { id: "cricket/8048", sp: "cricket", n: "Indian Premier League" }, { id: "cricket/8039", sp: "cricket", n: "Cricket World Cup" },
  { id: "australian-football/afl", sp: "afl", n: "AFL" },
  // Not on ESPN: these come through the feeds function (x = its name for the source), so they need you to be signed in.
  // SHL from shl.se; esports from bo3.gg (the two top tiers of tournaments).
  { id: "x/shl", sp: "hockey", n: "SHL (Sweden)", x: "shl" },
  { id: "x/cs2", sp: "esports", n: "Counter-Strike 2", x: "cs2" }, { id: "x/lol", sp: "esports", n: "League of Legends", x: "lol" }, { id: "x/dota2", sp: "esports", n: "Dota 2", x: "dota2" }
];
var SP_NAME = { football: "Football", basketball: "Basketball", ufc: "UFC", hockey: "Ice hockey", amfootball: "American football", baseball: "Baseball", tennis: "Tennis", racing: "Motorsport", golf: "Golf", esports: "Esports", rugby: "Rugby", cricket: "Cricket", afl: "Australian football" };
function spLeagues() { var on = P.spLeagues; return SP_CATALOG.filter(function (l) { return on ? on.indexOf(l.id) >= 0 : l.on; }); }
function spSports() {
  var seen = {}, out = [["", "All sports"]];
  spLeagues().forEach(function (l) { if (!seen[l.sp]) { seen[l.sp] = 1; out.push([l.sp, SP_NAME[l.sp] || l.sp]); } });
  return out;
}
var SP_NOW = {}, SP_UP = {}, SPERR = "", SP_OPEN = "", SP_VIEWS = [["now", "Live & today"], ["up", "Upcoming"], ["past", "Results"], ["fav", "Favorites"]];
// Your favorite sport (Settings > Sports) gets a view of its own in the box: everything on now, today and coming up
function spFavSport() { var s = P.spFavSport || ""; return s && spLeagues().some(function (l) { return l.sp === s; }) ? s : ""; }
function spViews() { var f = spFavSport(); return SP_VIEWS.concat(f ? [["sport", "★ " + (SP_NAME[f] || f)]] : []); }
function spView() { return P.spView === "up" || P.spView === "fav" || P.spView === "past" || (P.spView === "sport" && spFavSport()) ? P.spView : "now"; }
function spSport() { if (spView() === "sport") return spFavSport(); var s = P.spSport || ""; return s && spLeagues().some(function (l) { return l.sp === s; }) ? s : ""; }
function spFavs() { return P.spFav || []; }
function spIsFav(name) { return spFavs().indexOf(name) >= 0; }
function spParse(lg, j, pri, past) {
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
          if (past ? cs.state !== "post" || now - ts > SP_PASTD.tour * 86400000 : cs.state !== "in" && Math.abs(ts - now) > 129600000) return;
          var sets = function (x) { return ((x || {}).linescores || []).map(function (l) { return Math.round(l.value); }).join(" "); };
          ms.push(pair(c, (c.round || {}).displayName || gname, cs.state === "pre" ? "" : sets(c.competitors[0]) + " / " + sets(c.competitors[1])));
        });
      });
      var rank = function (m) { return m.state === "in" ? 0 : m.state === "pre" ? 1 : 2; };
      o.fights = ms.sort(function (a, b) { return rank(a) - rank(b) || (a.state === "post" ? b.ts - a.ts : a.ts - b.ts); }).slice(0, 40);
      o.title = e.name || e.shortName || lg.n;
      o.cardTitle = past ? "Results (latest first)" : "Matches (live first, then the nearest)";
      // the Results view keeps its own copy of a tournament (finished matches of the last days), next to the live one
      if (past) { o.id += "~r"; o.te = ms.reduce(function (m, x) { return Math.max(m, x.ts || 0); }, 0); o.state = "post"; o.fights = o.fights.slice().sort(function (a, b) { return b.ts - a.ts; }); o.names = []; return o.fights.length ? (o.names = o.fights.reduce(function (acc, f) { acc.push(f.a, f.b); return acc; }, []), o) : null; }
      var liveN = ms.filter(function (m) { return m.state === "in"; }).length;
      var nextM = ms.filter(function (m) { return m.state === "pre"; }).sort(function (a, b) { return a.ts - b.ts; })[0];
      if (liveN) { o.state = "in"; o.detail = liveN + " live"; }
      else if (nextM) { o.state = "pre"; o.ts = nextM.ts; }   // nothing on court right now: show when the next match starts
      else if (o.state === "in") o.detail = "On now";
    } else if (o.kind === "race") {
      // a race weekend (practice, qualifying, race) or a golf tournament
      o.title = e.name || e.shortName || lg.n;
      // each session keeps its running order (Formula 1: the classification of practice, qualifying and the race)
      var byOrder = function (list) { return (list || []).slice().sort(function (a, b) { return (a.order || 999) - (b.order || 999); }); };
      o.sessions = (e.competitions || []).map(function (c) {
        var cs = (c.status && c.status.type) || {};
        return { n: (c.type || {}).abbreviation || (c.type || {}).text || "", state: cs.state || "pre", ts: Date.parse(c.date), detail: cs.shortDetail || "",
          res: (cs.state || "pre") === "pre" ? [] : byOrder(c.competitors).filter(function (x) { return x.order; }).slice(0, 30).map(function (x) { return (x.athlete || {}).displayName || "?"; }) };
      }).filter(function (s) { return s.n; });
      o.te = o.sessions.reduce(function (m, s) { return s.state === "post" ? Math.max(m, s.ts || 0) : m; }, 0);
      var lead = ((e.competitions || [])[(e.competitions || []).length - 1] || {}).competitors || [];
      // golf: the leaderboard with the score to par and each round
      if (lg.sp === "golf") o.field = byOrder(lead).slice(0, 80).map(function (c) {
        return { n: (c.athlete || {}).displayName || "?", s: c.score != null && typeof c.score !== "object" ? String(c.score) : "", r: (c.linescores || []).map(function (l) { return l.value >= 55 ? Math.round(l.value) : ""; }).slice(0, 4) };   // under 55 strokes = a round still being played
      });
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
          n: t.shortDisplayName || t.displayName || "?", ab: String(t.abbreviation || t.shortDisplayName || t.displayName || "?").slice(0, 4).toUpperCase(), s: lg.sp === "cricket" ? String(c.score == null ? "" : c.score).split(" ")[0] : c.score, logo: safeUrl(t.logo), win: c.winner === true || c.winner === "true", id: String(t.id || ""),
          lines: lg.sp === "rugby" || lg.sp === "cricket" ? [] : (c.linescores || []).map(function (l) { return Math.round(l.value); }), st: st,   // (the source's period scores for rugby and cricket do not add up)
          // top performers (points, goals, assists...), one per category
          lead: (Array.isArray(c.leaders) ? c.leaders : []).slice(0, 3).map(function (l) { var x = (l.leaders || [])[0] || {}; return { cat: l.shortDisplayName || l.displayName || "", who: (x.athlete || {}).displayName || "", val: x.displayValue || "" }; }).filter(function (l, i, arr) { return l.who && !arr.slice(0, i).some(function (o) { return o.cat === l.cat && o.who === l.who; }); })
        };
      };
      o.home = side("home"); o.away = side("away");
      o.names = [o.home.n, o.away.n];
      // what happened: goals and cards with minute and player (football), venue, crowd, and ESPN's one-line recap
      o.ev = (comp.details || []).map(function (d) {
        // rugby names each event (try, conversion, penalty goal, drop goal, cards) instead of flagging it
        var tt = String((d.type || {}).text || "").toLowerCase(), rug = lg.sp === "rugby" && !/miss/.test(tt);
        var kind = d.redCard || (rug && /red card/.test(tt)) ? "red" : d.yellowCard || (rug && /yellow card/.test(tt)) ? "yel" : d.scoringPlay || (rug && /try|conversion|penalty goal|drop goal/.test(tt)) ? "goal" : "";
        var lab = lg.sp !== "rugby" || kind !== "goal" ? "" : /penalty try/.test(tt) ? "PT" : /try/.test(tt) ? "T" : /conversion/.test(tt) ? "C" : /drop/.test(tt) ? "DG" : "P";
        return kind ? { k: kind, min: (d.clock || {}).displayValue || "", who: ((d.athletesInvolved || [])[0] || {}).displayName || "", side: String((d.team || {}).id) === o.home.id ? "h" : "a", pen: !!d.penaltyKick, og: !!d.ownGoal, lab: lab } : null;
      }).filter(Boolean);
      o.venue = (comp.venue || {}).fullName || ""; o.att = +comp.attendance || 0;
      o.recap = ((comp.headlines || [])[0] || {}).shortLinkText || "";
      // cricket: the row has room for runs and wickets only; the overs and the target are said here
      if (lg.sp === "cricket") o.recap = [String((comp.status || {}).summary || "")].concat(cs2.map(function (x) { return ((x.team || {}).abbreviation || "") + " " + (x.score == null ? "" : x.score); }).filter(function (x) { return x.trim().length > 4; })).filter(Boolean).join(" · ") || o.recap;
    }
    if (o.fights) o.names = o.fights.reduce(function (acc, f) { acc.push(f.a, f.b); return acc; }, []);
    return o;
  }).filter(function (o) { return o && !isNaN(o.ts); });
}
// Results. Team leagues: the finished games are already in the month's fixtures (the same file Upcoming reads; early in a
// month the month before is read too). Fight cards, race weekends, golf and tennis are asked for by date: four weeks back
// for the rare ones, eight days for tennis (a tournament has hundreds of matches).
var SP_PASTD = { tour: 8, card: 28, race: 28 }, SP_PAST = {}, SPQ = "", SPFIND = false;
function spPastDates(lg) {
  var d = function (ms) { return new Date(ms).toISOString().slice(0, 10).replace(/-/g, ""); };
  return d(Date.now() - (SP_PASTD[lg.kind || "team"] || 7) * 86400000) + "-" + d(Date.now() + 86400000);
}
function spGet(lg, pri, month, past) {
  var store = past ? SP_PAST : month ? SP_UP : SP_NOW, key = past ? lg.id : lg.id + (month || "");
  store[key] = store[key] || { t: 0, ev: [] };
  store[key].t = Date.now();
  return fetch("https://site.api.espn.com/apis/site/v2/sports/" + lg.id + "/scoreboard" + (month ? "?dates=" + month + "&limit=200" : ""))
    .then(function (r) { if (!r.ok) throw new Error("ESPN answered " + r.status); return r.json(); })
    .then(function (j) { store[key].ev = spParse(lg, j, pri, past); store[key].ok = 1; SPERR = ""; SPV++; })
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
    // Results and the search also read the finished games of the last days: when that view is opened, then every 30 minutes
    var wantPast = spView() === "past" || !!SPQ;
    if (wantPast && lg.kind && !lg.x) { var pc = SP_PAST[lg.id]; if (!pc || now - pc.t > 1800000) jobs.push(spGet(lg, pri, spPastDates(lg), true)); }
    if ((spView() !== "now" || SPCALWANT || SPQ) && lg.kind !== "tour" && !lg.x) {
      var d = new Date(), months = [d.getFullYear() + pad2(d.getMonth() + 1)];
      if (d.getDate() > 20) { var n = new Date(d.getFullYear(), d.getMonth() + 1, 1); months.push(n.getFullYear() + pad2(n.getMonth() + 1)); }
      if (wantPast && !lg.kind && d.getDate() <= 7) { var pm = new Date(d.getFullYear(), d.getMonth() - 1, 1); months.push(pm.getFullYear() + pad2(pm.getMonth() + 1)); }
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
        return { n: String(s.n || "?"), ab: String(s.ab || s.n || "?").slice(0, 4).toUpperCase(), s: s.s == null ? null : s.s, logo: safeUrl(s.logo), win: !!s.win, id: String(s.ab || "").slice(0, 4).toUpperCase(), lines: [], st: {}, lead: [], slug: /^[\w-]{2,80}$/.test(String(s.slug || "")) ? String(s.slug) : "" };
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
  Object.keys(SP_PAST).forEach(function (k) { SP_PAST[k].ev.forEach(function (e) { by[e.id] = e; }); });
  Object.keys(SP_UP).forEach(function (k) { SP_UP[k].ev.forEach(function (e) { by[e.id] = e; }); });
  Object.keys(SP_NOW).forEach(function (k) { SP_NOW[k].ev.forEach(function (e) { by[e.id] = e; }); });   // today's data is fresher, so it wins
  var all = Object.keys(by).map(function (k) { return by[k]; }).filter(function (e) { return on[e.lg] && (!sport || e.sp === sport); });
  all.forEach(function (e) { e.fav = e.names.some(spIsFav); });
  var live = function (e) { return e.state === "in" ? 1 : 0; }, day = function (t) { return new Date(t).toLocaleDateString("en-CA", { timeZone: TZ }); };
  var isR = function (e) { return e.id.slice(-2) === "~r"; }, end = function (e) { return e.te || e.ts; }, rank = function (e) { return e.state === "in" ? 0 : e.state === "pre" ? 1 : 2; };
  // Searching looks through everything that is loaded, whatever the view: live first, then what is coming, then results (newest first)
  if (SPQ) {
    var words = SPQ.split(/\s+/).filter(Boolean);
    return all.filter(function (e) {
      if (e.kind === "tour" && by[e.id + "~r"] && e.state === "post") return false;   // the Results copy of the same tournament says more
      var txt = (e.lg + " " + (SP_NAME[e.sp] || "") + " " + (e.title || "") + " " + e.names.join(" ") + " " + (e.recap || "")).toLowerCase();
      return words.every(function (w) { return txt.indexOf(w) >= 0; });
    }).sort(function (a, b) { return rank(a) - rank(b) || (a.state === "post" ? end(b) - end(a) : a.ts - b.ts); }).slice(0, 80);
  }
  // Results: finished games, fights, races and matches, newest first
  if (view === "past") return all.filter(function (e) { return e.state === "post" && (e.kind !== "tour" || isR(e)) && now - end(e) < 29 * 86400000; }).sort(function (a, b) { return end(b) - end(a) || a.pri - b.pri; }).slice(0, SP_PASTN);
  all = all.filter(function (e) { return !isR(e); });
  if (view === "up") return all.filter(function (e) { return e.state === "pre" && e.ts > now - 3600000; }).sort(function (a, b) { return a.ts - b.ts || a.pri - b.pri; }).slice(0, 60);
  if (view === "fav") return all.filter(function (e) { return e.fav && (e.state !== "post" || now - e.ts < 86400000); }).sort(function (a, b) { return live(b) - live(a) || a.ts - b.ts; }).slice(0, 60);
  // your favorite sport: what is on now, then everything today and coming up (soonest first), then today's results
  if (view === "sport") return all.filter(function (e) { return e.state === "in" || (e.state === "pre" && e.ts > now - 10800000) || (e.state === "post" && (day(e.ts) === day(now) || now - e.ts < 43200000)); })
    .sort(function (a, b) { return live(b) - live(a) || (a.state === "post" ? 1 : 0) - (b.state === "post" ? 1 : 0) || (a.state === "post" ? b.ts - a.ts : a.ts - b.ts); }).slice(0, 60);
  return all.filter(function (e) { return e.state === "in" || day(e.ts) === day(now) || (e.state === "post" && now - e.ts < 43200000 && e.kind === "team") || (e.kind !== "team" && e.state === "pre" && e.ts - now < 172800000); })
    .sort(function (a, b) { return live(b) - live(a) || (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || (a.state === "post" ? 1 : 0) - (b.state === "post" ? 1 : 0) || a.pri - b.pri || a.ts - b.ts; }).slice(0, 60);
}
// `dated`: a finished game shows its date instead of "FT" (used where results of several days are mixed)
var SP_PASTN = 120;
function spDayName(ts) {
  var k = function (t) { return new Date(t).toLocaleDateString("en-CA", { timeZone: TZ }); }, d = k(ts);
  return d === k(Date.now()) ? "Today" : d === k(Date.now() - 86400000) ? "Yesterday" : new Date(ts).toLocaleDateString("en-GB", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" });
}
function spWhen(e, dated) {
  if (dated && e.state === "post") return '<span class="mut">' + new Date(e.te || e.ts).toLocaleDateString("en-GB", { timeZone: TZ, day: "numeric", month: "short" }) + "</span>";
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
  esports: '<rect x="2.500" y="7.500" width="19" height="10" rx="5"/><path d="M7.500 10.500v4M5.500 12.500h4M15.500 11.300h.01M18 13.700h.01"/>',
  rugby: '<ellipse cx="12" cy="12" rx="9.500" ry="5.500" transform="rotate(-45 12 12)"/><path d="M9 15l6-6M10 11.500l2.500 2.500M11.500 10l2.500 2.500"/>',
  cricket: '<path d="M14.500 3.500l6 6-9 9-3.500.500.500-3.500z"/><path d="M8.500 15.500L4 20"/><circle cx="18" cy="18" r="2.200"/>',
  afl: '<ellipse cx="12" cy="12" rx="9.500" ry="6"/><path d="M12 6v12M9.500 9h5M9.500 15h5"/>'
};
function spIcon(sp) { return '<i class="spi sp-' + sp + '" title="' + (SP_NAME[sp] || "") + '"><svg ' + SP_SVG + ">" + (SP_ICON[sp] || SP_ICON.baseball) + "</svg></i>"; }
function spCrest(t) {
  var u = safeUrl(t.logo);
  if (u.indexOf("https://a.espncdn.com/i/") === 0) u = "https://a.espncdn.com/combiner/i?img=/i/" + u.slice(24) + "&w=40&h=40";
  return u && !BADIMG[u] ? '<img class="tl" alt="" loading="lazy" referrerpolicy="no-referrer" data-rm="1" src="' + esc(u) + '">' : "";
}
function sportsBody() {
  var ev = spEvents(), view = spView(), past = view === "past" && !SPQ;
  var find = SPFIND || SPQ ? '<input type="search" id="spQ" class="flt" placeholder="Search a team, player, league or event…" aria-label="Search the sports box">' : "";
  if (!spLeagues().length) return '<div class="empty">No leagues switched on. Choose some in Settings, Sports.</div>';
  var ym = new Date().getFullYear() + pad2(new Date().getMonth() + 1), sportNow = spSport();
  var pastWait = spLeagues().some(function (l) { if (l.x || (sportNow && l.sp !== sportNow)) return false; var c = l.kind ? SP_PAST[l.id] : SP_UP[l.id + ym]; return !(c && (c.ok || Date.now() - c.t > 20000)); });
  if (!ev.length && (SPQ || past)) return find + '<div class="empty">' + (SPERR ? "Scores unavailable: " + esc(SPERR) : pastWait ? "Loading results…" : SPQ ? "Nothing found for “" + esc(SPQ) + "” in the leagues you follow (recent results, today and this month’s fixtures)." : "No results in the last days for these leagues.") + "</div>";
  if (!ev.length) return find + '<div class="empty">' + (SPERR ? "Scores unavailable: " + esc(SPERR) : !Object.keys(SP_NOW).length ? "Loading scores…" : view === "fav" ? (spFavs().length ? "No games soon for your favorites." : "No favorites yet. Open a game and press ☆ next to a team or player.") : view === "up" ? "No upcoming games found." : view === "sport" ? "Nothing on or coming up in " + esc(SP_NAME[spFavSport()] || "your sport") + " right now." : "No games today in these leagues. Try Upcoming.") + "</div>";
  // The score and time columns are sized PER SPORT, for that sport's longest entry on screen: all football rows share
  // one set of columns, all basketball rows another. (One width for the whole list would let a "104–98" or a long
  // badge steal the room the team names need on every football row.) The names get all the width that is left.
  var W = {};
  ev.forEach(function (e) {
    if (e.kind !== "team") return;
    var w = W[e.sp] = W[e.sp] || { sc: 1, st: 1.6 }, len = spWhen(e, !!SPQ).replace(/<[^>]+>/g, "").length;
    if (e.state !== "pre") w.sc = Math.max(w.sc, (String(e.home.s != null ? e.home.s : "") + "–" + String(e.away.s != null ? e.away.s : "")).length);
    w.st = Math.max(w.st, e.state === "in" ? len * 0.55 + 0.75 : len * 0.5 + 0.1);   // a live badge has padding, plain text does not
  });
  var lastHead = "";
  return find + lst("sports", '<div class="spl">' + ev.map(function (e) {
    // Results: a small heading per day. Search: one per part (live, coming up, results).
    var hd = past ? spDayName(e.te || e.ts) : SPQ ? (e.state === "in" ? "Live" : e.state === "pre" ? "Coming up" : "Results") : "", head = "";
    if (hd && hd !== lastHead) { lastHead = hd; head = '<div class="spday">' + hd + "</div>"; }
    return head + spRowHtml(e, W, past);
  }).join("") + "</div>", 6);
}
function spRowHtml(e, W, plain) {
  return [e].map(function (e) {
    // a UFC card that is on: one row per fight (in the cage first, then what is next, then the results)
    if (e.kind === "card" && e.state === "in" && e.fights && e.fights.length) return fightsLive(e).map(function (f) { return fightRow(e, f); }).join("");
    var w = W[e.sp], vars = e.kind === "team" ? ' style="--scw:' + (w.sc * 0.6 + 0.2).toFixed(2) + "em;--stw:" + Math.min(w.st, 4).toFixed(2) + 'em"' : "";
    return '<div class="row sprow' + (e.kind === "team" ? "" : " spx") + (e.state === "in" ? " splive" : "") + (e.state === "post" && !plain ? " rd" : "") + '"' + vars + '><span><button class="lnk ' + (e.kind === "team" ? "spg" : "spt") + '" data-a="open" data-k="' + esc("p:" + e.id) + '">' + spIcon(e.sp) + spTitle(e) + "</button>" +
      '</span><span class="r">' + (e.fav && e.kind !== "team" ? '<i class="fv">★</i>' : "") + spWhen(e, !!SPQ) + "</span></div>";
  }).join("");
}
// ---- The story of a game: who scored and when, cards, period scores, stats and top performers ----
var EV_LAB = { T: "Try", C: "Conversion", P: "Penalty goal", DG: "Drop goal", PT: "Penalty try" };
function spEvIcon(x) { return x.k === "goal" ? x.lab ? '<i class="evl" title="' + (EV_LAB[x.lab] || "") + '">' + x.lab + "</i>" : '<i class="evg" title="Goal">⚽</i>' : '<i class="evc ' + x.k + '" title="' + (x.k === "red" ? "Red card" : "Yellow card") + '"></i>'; }
// Home events on the left, away on the right, in time order. `short` = goals and red cards only (for the hover card).
function spEventsHtml(e, short) {
  var ev = (e.ev || []).filter(function (x) { return !short || x.k !== "yel"; });
  if (!ev.length) return "";
  // rugby has many scores: the hover card keeps to the tries
  if (short && e.sp === "rugby") ev = ev.filter(function (x) { return x.lab === "T" || x.lab === "PT" || x.k === "red"; }).slice(-8);
  return (short ? "" : "<h3>" + (e.sp === "rugby" ? "Scoring and cards" : "Goals and cards") + "</h3>") + '<div class="evs' + (!short && ev.length > 16 ? " sptabw" : "") + '">' + ev.map(function (x) {
    var txt = esc(x.who || (x.k === "goal" ? EV_LAB[x.lab] || "Goal" : "Card")) + (x.pen ? " (pen)" : "") + (x.og ? " (own goal)" : "");
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
  var hoc = !own && e.sp === "hockey";   // NHL: points decide, so they go last like in football
  var cols = own ? mine[0].cols.map(function (c) { return [String(c[0]), esc(String(c[1]))]; }) : e.sp === "rugby" ? [["gamesPlayed", "P"], ["gamesWon", "W"], ["gamesDrawn", "D"], ["gamesLost", "L"], ["pointsDifference", "+/-"], ["bonusPoints", "BP"], ["points", "Pts"]]
    : e.sp === "cricket" ? [["matchesPlayed", "P"], ["matchesWon", "W"], ["matchesLost", "L"], ["noresult", "NR"], ["netrr", "NRR"], ["matchPoints", "Pts"]]
    : e.sp === "afl" ? [["gamesPlayed", "P"], ["wins", "W"], ["ties", "D"], ["losses", "L"], ["percentage", "%"], ["points", "Pts"]]
    : foot ? [["gamesPlayed", "P"], ["wins", "W"], ["ties", "D"], ["losses", "L"], ["pointDifferential", "+/-"], ["points", "Pts"]]
    : hoc ? [["gamesPlayed", "GP"], ["wins", "W"], ["losses", "L"], ["otLosses", "OTL"], ["pointDifferential", "+/-"], ["streak", "Strk"], ["points", "Pts"]]
    : e.sp === "amfootball" ? [["wins", "W"], ["losses", "L"], ["ties", "T"], ["winPercent", "Pct"], ["pointsFor", "PF"], ["pointsAgainst", "PA"], ["streak", "Strk"]]
    : e.sp === "baseball" ? [["wins", "W"], ["losses", "L"], ["winPercent", "Pct"], ["gamesBehind", "GB"], ["pointDifferential", "+/-"], ["streak", "Strk"]]
    : [["wins", "W"], ["losses", "L"], ["winPercent", "Pct"], ["gamesBehind", "GB"], ["Home", "Home"], ["Road", "Away"], ["streak", "Strk"]];
  if (hoc || e.sp === "rugby" || e.sp === "cricket" || e.sp === "afl") foot = true;   // points decide, so they are the last (bold) column
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
// ---- More about a game, from ESPN's game summary (loaded when the window opens, again every minute while it is live):
// who scored, the full team stats, the best player lines, line-ups, recent form, odds and who is unavailable. ----
var SP_SUM = {}, SP_SIDE = "h", SP_SES = "", SP_GAME = {}, spSumT = 0;
// team stats per sport, in the order shown: [ESPN's name, label, 1 = a share (0.9) to show as a percentage]
var SP_STATX = {
  football: [["possessionPct", "Possession %"], ["totalShots", "Shots"], ["shotsOnTarget", "Shots on target"], ["wonCorners", "Corners"], ["foulsCommitted", "Fouls"], ["offsides", "Offsides"], ["saves", "Saves"], ["totalPasses", "Passes"], ["passPct", "Pass accuracy %", 1], ["totalTackles", "Tackles"], ["yellowCards", "Yellow cards"], ["redCards", "Red cards"]],
  basketball: [["fieldGoalsMade-fieldGoalsAttempted", "Field goals"], ["fieldGoalPct", "Field goal %"], ["threePointFieldGoalsMade-threePointFieldGoalsAttempted", "3-pointers"], ["threePointFieldGoalPct", "3-point %"], ["freeThrowsMade-freeThrowsAttempted", "Free throws"], ["totalRebounds", "Rebounds"], ["assists", "Assists"], ["steals", "Steals"], ["blocks", "Blocks"], ["turnovers", "Turnovers"], ["pointsInPaint", "Points in the paint"], ["fastBreakPoints", "Fast-break points"], ["largestLead", "Largest lead"]],
  hockey: [["shotsTotal", "Shots"], ["saves", "Saves"], ["hits", "Hits"], ["blockedShots", "Blocked shots"], ["faceoffPercent", "Face-offs won %"], ["powerPlayGoals", "Power-play goals"], ["powerPlayOpportunities", "Power plays"], ["penaltyMinutes", "Penalty minutes"], ["takeaways", "Takeaways"], ["giveaways", "Giveaways"]],
  amfootball: [["totalYards", "Total yards"], ["netPassingYards", "Passing yards"], ["rushingYards", "Rushing yards"], ["firstDowns", "First downs"], ["thirdDownEff", "3rd downs made"], ["turnovers", "Turnovers"], ["sacksYardsLost", "Sacks – yards lost"], ["totalPenaltiesYards", "Penalties – yards"], ["redZoneAttempts", "Red zone made"], ["possessionTime", "Time of possession"]],
  afl: [["disposals", "Disposals"], ["kicks", "Kicks"], ["handballs", "Handballs"], ["marks", "Marks"], ["tackles", "Tackles"], ["inside50s", "Inside 50s"], ["totalClearances", "Clearances"], ["hitouts", "Hit-outs"], ["contestedPossessions", "Contested possessions"], ["goals", "Goals"], ["behinds", "Behinds"], ["goalAccuracy", "Goal accuracy %"]],
  rugby: [["general.tries", "Tries"], ["general.metres", "Metres run"], ["general.runs", "Runs"], ["general.cleanBreaks", "Clean breaks"], ["general.passes", "Passes"], ["general.offload", "Offloads"], ["general.tackles", "Tackles"], ["general.missedTackles", "Missed tackles"], ["general.kicks", "Kicks"], ["general.penaltiesConceded", "Penalties conceded"], ["general.scrumsWon", "Scrums won"], ["general.lineoutsWon", "Line-outs won"], ["general.yellowCards", "Yellow cards"], ["general.redCards", "Red cards"]],
  baseball: [["batting.hits", "Hits"], ["batting.homeRuns", "Home runs"], ["batting.walks", "Walks"], ["batting.strikeouts", "Struck out"], ["batting.runnersLeftOnBase", "Left on base"], ["batting.avg", "Batting average"], ["pitching.strikeouts", "Strikeouts pitched"], ["fielding.errors", "Errors"]]
};
// player lines per sport: which of ESPN's groups, the heading, the columns (ESPN's labels), what to sort on, how many
var SP_BOX = {
  basketball: [{ g: [0], t: "Players", cols: ["MIN", "PTS", "REB", "AST", "FG", "3PT"], sort: ["PTS", "REB", "AST"], n: 6 }],
  hockey: [{ g: ["forwards", "defenses"], t: "Skaters", cols: ["G", "A", "S", "+/-", "TOI"], sort: ["G", "A", "S"], n: 6 }, { g: ["goalies"], t: "Goalies", cols: ["SA", "SV", "SV%", "TOI"], n: 2 }],
  amfootball: [{ g: ["passing"], t: "Passing", cols: ["C/ATT", "YDS", "TD", "INT"], n: 1 }, { g: ["rushing"], t: "Rushing", cols: ["CAR", "YDS", "TD"], n: 2 }, { g: ["receiving"], t: "Receiving", cols: ["REC", "YDS", "TD"], n: 3 }],
  afl: [{ g: [0], t: "Players", cols: ["D", "K", "H", "M", "T", "G"], sort: ["D", "G"], n: 8 }],
  baseball: [{ g: ["pitching"], t: "Pitchers", cols: ["IP", "H", "ER", "BB", "K"], n: 5 }, { g: ["batting"], t: "Batters", cols: ["AB", "R", "H", "RBI", "HR"], sort: ["H", "RBI", "R"], n: 5 }]
};
function spNum(v) { v = String(v == null ? "" : v); var m = v.match(/^(\d+):(\d\d)$/); return m ? +m[1] * 60 + +m[2] : parseFloat(v) || 0; }
function spDec(ml) { ml = +ml; return ml ? (ml > 0 ? 1 + ml / 100 : 1 + 100 / Math.abs(ml)).toFixed(2) : ""; }   // American odds -> decimal, like the UFC odds
function spSumParse(e, j) {
  var side = function (id) { return String(id) === e.home.id ? "h" : String(id) === e.away.id ? "a" : ""; };
  var d = { sc: [], st: { h: {}, a: {} }, pl: { h: [], a: [] }, lu: {}, form: {}, inj: {}, series: "", odds: null, prob: null, refs: "" }, bx = j.boxscore || {};
  (bx.teams || []).forEach(function (t) {
    var s = side((t.team || {}).id);
    if (!s) return;
    (t.statistics || []).forEach(function (x) {
      if (Array.isArray(x.stats)) x.stats.forEach(function (y) { if (y.displayValue != null) d.st[s][x.name + "." + y.name] = String(y.displayValue); });
      else if (x.displayValue != null && d.st[s][x.name] == null) d.st[s][x.name] = String(x.displayValue);
    });
  });
  (bx.players || []).forEach(function (t) {
    var s = side((t.team || {}).id);
    if (!s) return;
    (SP_BOX[e.sp] || []).forEach(function (c) {
      var rows = [];
      (t.statistics || []).forEach(function (g, gi) {
        if (c.g.indexOf(g.name || g.type || gi) < 0) return;
        var L = g.labels || [], ix = c.cols.map(function (l) { return L.indexOf(l); });
        (g.athletes || []).forEach(function (a) {
          if (!a.stats || !a.stats.length) return;
          rows.push({ n: (a.athlete || {}).shortName || (a.athlete || {}).displayName || "?", v: ix.map(function (i) { return i < 0 || a.stats[i] == null ? "" : String(a.stats[i]); }) });
        });
      });
      if (c.sort) {
        var si = c.sort.map(function (l) { return c.cols.indexOf(l); });
        rows.sort(function (x, y) { for (var k = 0; k < si.length; k++) { var dl = spNum(y.v[si[k]]) - spNum(x.v[si[k]]); if (dl) return dl; } return 0; });
      }
      if (rows.length) d.pl[s].push({ t: c.t, cols: c.cols, rows: rows.slice(0, c.n) });
    });
  });
  // who scored (ice hockey, American football, baseball; football has its goals and cards already, basketball scores all the time)
  if (e.sp === "hockey" || e.sp === "amfootball" || e.sp === "baseball" || e.sp === "afl") {
    var plays = e.sp === "afl" ? (j.plays || []).filter(function (p) { return (p.type || {}).type === "goal"; }) : j.scoringPlays || (j.plays || []).filter(function (p) { return p.scoringPlay && (e.sp !== "baseball" || (p.type || {}).type === "play-result"); });
    d.sc = plays.slice(-40).map(function (p) {
      var per = p.period || {}, n = per.number || "";
      return { s: side((p.team || {}).id), per: e.sp === "baseball" ? String(per.type || "").slice(0, 1) + n : e.sp === "amfootball" || e.sp === "afl" ? (n > 4 ? "OT" : "Q" + n) : per.displayValue || (n ? "P" + n : ""),
        clk: (p.clock || {}).displayValue || "", txt: String(p.text || "").slice(0, 150), hs: p.homeScore, as: p.awayScore };
    }).filter(function (p) { return p.txt; });
  }
  // football line-ups: formation, the eleven that started (↓ = taken off) and who came on
  (e.sp === "football" || e.sp === "rugby" || e.sp === "cricket" ? j.rosters || [] : []).forEach(function (t) {
    var s = side((t.team || {}).id), yes = function (v) { return v === true || !!(v && v.didSub); };
    if (!s || !Array.isArray(t.roster)) return;
    // rugby does not mark who started: shirts 1 to 15 do (1 to 13 in rugby league), the higher numbers are the bench
    var lim = e.id.indexOf("rugby-league") === 0 ? 13 : 15, isSt = function (r) { return !!r.starter || (e.sp === "rugby" && +r.jersey >= 1 && +r.jersey <= lim); };
    var st = t.roster.filter(isSt);
    if (e.sp === "rugby") st.sort(function (a, b) { return +a.jersey - +b.jersey; });
    if (st.length) d.lu[s] = { f: String(t.formation || ""), st: st.map(function (r) { return { j: String(r.jersey || ""), n: ((r.athlete || {}).displayName || "?") + (r.captain && e.sp !== "football" ? " (c)" : ""), out: yes(r.subbedOut) }; }),
      on: t.roster.filter(function (r) { return !isSt(r) && yes(r.subbedIn); }).map(function (r) { return (r.athlete || {}).displayName || "?"; }),
      bench: t.roster.filter(function (r) { return !isSt(r) && !yes(r.subbedIn); }).map(function (r) { return lastName((r.athlete || {}).displayName || "?"); }) };
  });
  // cricket: the batting and bowling figures of the innings the source gives, and what kind of match it was
  if (e.sp === "cricket") {
    var cell = function (x) { return x == null ? "" : String(x); };
    (j.matchcards || []).forEach(function (m) {
      var ab = String(m.teamName || "").toUpperCase().slice(0, 4), s = ab === e.home.ab ? "h" : ab === e.away.ab ? "a" : "", pd = Array.isArray(m.playerDetails) ? m.playerDetails : [];
      if (!s || !pd.length) return;
      if (m.headline === "Batting") d.pl[s].push({ t: "Batting", cols: ["R", "B", "4s", "6s"], rows: pd.filter(function (p) { return p.runs != null && p.runs !== ""; }).slice(0, 11).map(function (p) { return { n: cell(p.playerName || "?") + (p.dismissal === "not out" ? "*" : ""), v: [p.runs, p.ballsFaced, p.fours, p.sixes].map(cell) }; }) });
      else if (m.headline === "Bowling") d.pl[s].push({ t: "Bowling", cols: ["O", "M", "R", "W", "Econ"], rows: pd.slice(0, 8).map(function (p) { return { n: cell(p.playerName || "?"), v: [p.overs, p.maidens, p.conceded, p.wickets, p.economyRate].map(cell) }; }) });
    });
    d.tour = (j.notes || []).filter(function (n) { return n && (n.type === "seriesnote" || n.type === "matchdays"); }).map(function (n) { return String(n.text || ""); }).filter(Boolean).join(" · ").slice(0, 200);
  }
  (j.lastFiveGames || []).forEach(function (t) {
    var s = side((t.team || {}).id);
    if (s) d.form[s] = (t.events || []).slice(0, 5).map(function (g) { return { r: String(g.gameResult || "").slice(0, 1).toUpperCase(), t: [g.score, g.atVs, (g.opponent || {}).displayName].filter(Boolean).join(" ") }; }).filter(function (x) { return /^[WDL]$/.test(x.r); });
  });
  d.series = String(((j.seasonseries || [])[0] || {}).summary || "");
  var pc = (j.pickcenter || [])[0];
  if (pc) d.odds = { h: spDec((pc.homeTeamOdds || {}).moneyLine), a: spDec((pc.awayTeamOdds || {}).moneyLine), x: spDec((pc.drawOdds || {}).moneyLine), ou: pc.overUnder != null ? String(pc.overUnder) : "" };
  var pr = j.predictor;
  if (pr && pr.homeTeam && pr.awayTeam && +pr.homeTeam.gameProjection) d.prob = { h: Math.round(+pr.homeTeam.gameProjection), a: Math.round(+pr.awayTeam.gameProjection) };
  (j.injuries || []).forEach(function (t) {
    var s = side((t.team || {}).id);
    if (s) d.inj[s] = (t.injuries || []).map(function (i) { return { n: (i.athlete || {}).displayName || "", st: String(i.status || (i.type || {}).description || "") }; }).filter(function (i) { return i.n; });
  });
  d.refs = (((j.gameInfo || {}).officials) || []).slice(0, 2).map(function (o) { return o.displayName || o.fullName || ""; }).filter(Boolean).join(", ");
  return d;
}
function spSumGet(e) {
  var cut = e.id.lastIndexOf(":"), lg = e.id.slice(0, cut), eid = e.id.slice(cut + 1), c = SP_SUM[e.id];
  if (c && Date.now() - c.t < (e.state === "in" ? 45000 : 600000)) return Promise.resolve(c.d);
  // SHL and esports: the feeds function reads shl.se / bo3.gg and answers in the same shape (so you need to be signed in)
  if (lg.indexOf("x/") === 0) {
    if (!sb || !USER) return Promise.reject(new Error("sign in"));
    return sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { gamex: { src: lg.slice(2), id: eid } } }).then(function (r) {
      var g = r.data && r.data.gamex;
      if (!g || typeof g !== "object") throw new Error("no details");
      var arr = function (x) { return Array.isArray(x) ? x : []; }, two = function (x, f) { x = x || {}; return { h: f(x.h), a: f(x.a) }; }, str = function (x) { return x == null ? "" : String(x); };
      var d = {
        sc: arr(g.sc).slice(0, 40).map(function (p) { return { s: p.s === "h" || p.s === "a" ? p.s : "", per: str(p.per), clk: str(p.clk), txt: str(p.txt), hs: p.hs == null ? null : +p.hs, as: p.as == null ? null : +p.as }; }),
        st: two(g.st, function (o) { var out = {}; Object.keys(o || {}).forEach(function (k) { out[k] = str(o[k]); }); return out; }),
        pl: two(g.pl, function (l) { return arr(l).slice(0, 4).map(function (t) { return { t: str(t.t), cols: arr(t.cols).map(str), rows: arr(t.rows).slice(0, 8).map(function (r) { return { n: str(r.n), v: arr(r.v).map(str) }; }) }; }); }),
        form: two(g.form, function (l) { return arr(l).slice(0, 5).map(function (x) { return { r: /^[WDL]$/.test(x.r) ? x.r : "", t: str(x.t) }; }).filter(function (x) { return x.r; }); }),
        lines: two(g.lines, function (l) { return arr(l).slice(0, 8).map(function (n) { return n == null ? 0 : +n || 0; }); }),
        maps: arr(g.maps).slice(0, 7).map(function (m) { return { n: str(m.n), h: +m.h || 0, a: +m.a || 0, w: m.w === "h" || m.w === "a" ? m.w : "", live: !!m.live, dur: str(m.dur), kills: !!m.kills }; }),
        // Dota 2: one scoreboard per game of the match
        pg: arr(g.pg).slice(0, 7).map(function (b) { return two(b, function (l) { return arr(l).slice(0, 2).map(function (t) { return { t: str(t.t), cols: arr(t.cols).map(str), rows: arr(t.rows).slice(0, 6).map(function (r) { return { n: str(r.n), v: arr(r.v).map(str) }; }) }; }); }); }),
        slug: two(g.slug, function (s) { return /^[\w-]{2,80}$/.test(str(s)) ? str(s) : ""; }),
        rank: two(g.rank, function (n) { return +n || 0; }), tour: str(g.tour), series: str(g.series), seriesT: str(g.seriesT), att: +g.att || 0,
        lu: {}, inj: {}, odds: null, prob: null, refs: ""
      };
      if (Object.keys(SP_SUM).length > 40) SP_SUM = {};
      SP_SUM[e.id] = { t: Date.now(), d: d };
      return d;
    });
  }
  if (!/^\d+$/.test(eid)) return Promise.reject(new Error("no summary"));
  return fetch("https://site.api.espn.com/apis/site/v2/sports/" + lg + "/summary?event=" + eid)
    .then(function (r) { if (!r.ok) throw new Error("ESPN answered " + r.status); return r.json(); })
    .then(function (j) {
      if (Object.keys(SP_SUM).length > 40) SP_SUM = {};
      var d = spSumParse(e, j);
      SP_SUM[e.id] = { t: Date.now(), d: d };
      return d;
    });
}
function spStatxHtml(e, d) {
  var rows = (SP_STATX[e.sp] || []).filter(function (s) { return d.st.h[s[0]] != null && d.st.a[s[0]] != null; }).map(function (s) {
    var show = function (v) { return s[2] && spNum(v) <= 1 ? String(Math.round(spNum(v) * 100)) : v; };
    var hv = spNum(d.st.h[s[0]]), av = spNum(d.st.a[s[0]]), tot = hv + av || 1;
    return '<div class="stat"><b>' + esc(show(d.st.h[s[0]])) + '</b><span><em><u style="width:' + Math.round(hv / tot * 100) + '%"></u></em>' + s[1] + "</span><b>" + esc(show(d.st.a[s[0]])) + "</b></div>";
  });
  return rows.length ? "<h3>" + (e.sp === "football" ? "Match stats" : "Team stats") + "</h3>" + rows.join("") : "";
}
function spSumDraw(e, d) {
  var two = function (h, a) { return '<div class="leads"><div>' + h + "</div><div>" + a + "</div></div>"; };
  // who scored
  if ($("spSc")) $("spSc").innerHTML = d.sc.length ? "<h3>Scoring</h3>" + '<div class="spsc' + (d.sc.length > 8 ? " sptabw" : "") + '">' + d.sc.map(function (p) {
    return '<div><span class="mut">' + esc(p.per) + (p.clk ? " " + esc(p.clk) : "") + "</span><b>" + esc(p.s === "h" ? e.home.ab : p.s === "a" ? e.away.ab : "") + "</b><span>" + esc(p.txt) + "</span>" + (p.hs != null && p.as != null ? "<b>" + esc(p.hs) + "–" + esc(p.as) + "</b>" : "<b></b>") + "</div>";
  }).join("") + "</div>" : "";
  // esports: the maps of the match, each with its score
  if ($("spSc") && d.maps && d.maps.length) $("spSc").innerHTML = "<h3>" + (d.maps[0].kills ? "Games · kills" : "Maps") + "</h3>" + '<div class="spsc spmaps">' + d.maps.map(function (m, i) {
    return "<div>" + (m.kills ? "<b>" + esc(m.n) + '</b><span class="mut">' + esc(m.dur) + "</span>" : '<span class="mut">Map ' + (i + 1) + "</span><b>" + esc(m.n.charAt(0).toUpperCase() + m.n.slice(1)) + "</b>") + "<span>" + (m.live ? '<span class="pill live">LIVE</span>' : m.w ? esc((m.w === "h" ? e.home : e.away).n) + " won" : "") + "</span><b>" + (m.w || m.live ? m.h + "–" + m.a : "") + "</b></div>";
  }).join("") + "</div>";
  // SHL: the score of each period comes with the details
  if ($("spLn") && d.lines && d.lines.h.length > 1) { e.home.lines = d.lines.h; e.away.lines = d.lines.a; $("spLn").innerHTML = spLinesHtml(e); }
  // the fuller stats replace the short list from the scoreboard (never with less than it had)
  var sx = e.state === "pre" ? "" : spStatxHtml(e, d);
  if ($("spStats") && sx && sx.split('class="stat"').length >= $("spStats").innerHTML.split('class="stat"').length) $("spStats").innerHTML = sx;
  var h = "";
  // before and during the game: odds and the chance to win
  if (e.state !== "post") {
    var od = d.odds, parts = od ? [od.h ? esc(e.home.ab) + " <b>" + od.h + "</b>" : "", od.x ? "draw <b>" + od.x + "</b>" : "", od.a ? esc(e.away.ab) + " <b>" + od.a + "</b>" : "", od.ou ? "over/under <b>" + esc(od.ou) + "</b>" : ""].filter(Boolean) : [];
    if (parts.length) h += '<h3>Odds</h3><p class="spod">' + parts.join(" · ") + "</p>";
    if (d.prob) h += '<div class="stat"><b>' + d.prob.h + '%</b><span><em><u style="width:' + d.prob.h + '%"></u></em>Chance to win</span><b>' + d.prob.a + "%</b></div>";
  }
  // form: the last five, latest first; other sports: how the season series stands
  var chips = function (s) { return (d.form[s] || []).map(function (g) { return '<i class="fm fm' + g.r + '" title="' + esc(g.t) + '">' + g.r + "</i>"; }).join(""); };
  var rk = d.rank && (d.rank.h || d.rank.a) ? function (s) { return d.rank[s] ? '<small class="mut">World no. ' + d.rank[s] + "</small> " : ""; } : function () { return ""; };
  if (chips("h") || chips("a")) h += "<h3>Last five</h3>" + two(chips("h") + (rk("h") ? " " + rk("h") : ""), rk("a") + chips("a"));
  else if (rk("h") || rk("a")) h += "<h3>Ranking</h3>" + two(rk("h"), rk("a"));
  if (d.series && (d.seriesT || !(chips("h") || chips("a")))) h += "<h3>" + esc(d.seriesT || "This season") + '</h3><p class="spod">' + esc(d.series) + "</p>";
  if (d.tour) h += '<p class="mut sn">' + esc(d.tour) + "</p>";
  // player lines, one team at a time
  // Dota 2 has a scoreboard per game: small buttons pick the game (the last one first)
  var pgs = d.pg && d.pg.length ? d.pg : null, gi = pgs ? (SP_GAME[e.id] != null && pgs[SP_GAME[e.id]] ? SP_GAME[e.id] : pgs.length - 1) : 0;
  if (pgs) d.pl = pgs[gi];
  var s = d.pl[SP_SIDE] && d.pl[SP_SIDE].length ? SP_SIDE : d.pl.h.length ? "h" : "a";
  if (d.pl[s].length) {
    if ($("spLead")) $("spLead").innerHTML = "";   // the player lines say more than the three "top performers" from the scoreboard
    h += '<h3 class="sph">Players <span class="chips">' + (pgs && pgs.length > 1 ? pgs.map(function (b, i) { return '<button data-a="spgame" data-k="' + i + '"' + (i === gi ? ' class="on"' : "") + ' title="Game ' + (i + 1) + '">G' + (i + 1) + "</button>"; }).join("") + '<i class="chsep"></i>' : "") +[["h", e.home], ["a", e.away]].filter(function (x) { return d.pl[x[0]].length; }).map(function (x) { return '<button data-a="spside" data-k="' + x[0] + '"' + (s === x[0] ? ' class="on"' : "") + ">" + esc(x[1].ab) + "</button>"; }).join("") + "</span></h3>" +
      '<div class="sptabw sppl"><table class="sptab">' + d.pl[s].map(function (g) {
        return "<tr><th></th>" + g.cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr>" + g.rows.map(function (r) { return '<tr><td class="tn">' + esc(r.n) + (spIsFav(r.n) ? ' <i class="fv">★</i>' : "") + "</td>" + r.v.map(function (v) { return "<td>" + esc(v) + "</td>"; }).join("") + "</tr>"; }).join("");
      }).join("") + "</table></div>";
  }
  // football line-ups
  var lu = function (s) { var x = d.lu[s]; return x ? (x.f ? '<small class="mut">' + esc(x.f) + "</small>" : "") + x.st.map(function (p) { return "<div><small>" + esc(p.j) + "</small> " + esc(p.n) + (p.out ? ' <span class="mut" title="Taken off">↓</span>' : "") + "</div>"; }).join("") + (x.on.length ? '<div class="mut sn" title="Substitutes who came on during the game">↑ Came on: ' + esc(x.on.join(", ")) + "</div>" : "") + (x.bench && x.bench.length ? '<div class="mut sn" title="Substitutes who stayed on the bench">Bench: ' + esc(x.bench.join(", ")) + "</div>" : "") : ""; };
  if (lu("h") || lu("a")) h += "<h3>Line-ups</h3>" + '<div class="splu">' + two(lu("h"), lu("a")) + "</div>";
  // who is unavailable (only worth showing before the end)
  var inj = function (s) { var l = d.inj[s] || []; return l.slice(0, 6).map(function (i) { return "<div>" + esc(i.n) + (i.st ? ' <small class="mut">' + esc(i.st) + "</small>" : "") + "</div>"; }).join("") + (l.length > 6 ? '<div class="mut sn">+' + (l.length - 6) + " more</div>" : ""); };
  if (e.state !== "post" && (inj("h") || inj("a"))) h += "<h3>Unavailable</h3>" + two(inj("h"), inj("a"));
  if (d.refs) h += '<p class="mut sn">' + (e.sp === "football" ? "Referee: " : "Officials: ") + esc(d.refs) + "</p>";
  if (d.att && !e.att) h += '<p class="mut sn">' + d.att.toLocaleString("en-GB") + " spectators</p>";
  if ($("spSum")) $("spSum").innerHTML = h;
}
function spSumLoad(e) {
  clearTimeout(spSumT);
  if (!$("spSum")) return;
  spSumGet(e).then(function (d) {
    if (SP_OPEN !== e.id || !$("spSum") || $("modal").hidden) return;
    spSumDraw(e, d);
    if (e.state === "in") spSumT = setTimeout(function () { if (SP_OPEN === e.id && $("spSum") && !$("modal").hidden) spSumLoad(spFind(e.id) || e); }, 60000);
  }).catch(function () {});
}
// ---- Season standings under a race or tournament: Formula 1 drivers and teams, tennis world ranking (kept for an hour) ----
var SP_RANK = {};
function spRankGet(lgId) {
  var c = SP_RANK[lgId];
  if (c && Date.now() - c.t < 3600000) return Promise.resolve(c.g);
  var done = function (g) { if (g.length) SP_RANK[lgId] = { t: Date.now(), g: g }; return g; }, json = function (r) { if (!r.ok) throw new Error("none"); return r.json(); };
  if (lgId.indexOf("tennis/") === 0) return fetch("https://site.api.espn.com/apis/site/v2/sports/" + lgId + "/rankings").then(json).then(function (j) {
    var rk = (j.rankings || [])[0] || {};
    return done([{ n: "World ranking", pts: "Points", rows: (rk.ranks || []).slice(0, 50).map(function (r) { return { pos: r.current, n: (r.athlete || {}).displayName || "?", p: r.points != null ? Math.round(r.points).toLocaleString("en-GB") : "", mv: r.previous && r.current ? r.previous - r.current : 0 }; }) }]);
  });
  // Formula 1 (drivers and teams), IndyCar and NASCAR (drivers)
  if (lgId.indexOf("racing/") === 0) return fetch("https://site.api.espn.com/apis/v2/sports/" + lgId + "/standings").then(json).then(function (j) {
    return done((j.children && j.children.length ? j.children : [j]).map(function (c) {
      return { n: /constructor/i.test(c.name || "") ? "Teams" : "Drivers", pts: "Pts", rows: (((c.standings || {}).entries) || []).map(function (x) {
        var v = {}; (x.stats || []).forEach(function (q) { v[q.name] = q.displayValue; });
        return { pos: +v.rank || 0, n: (x.athlete || x.team || {}).displayName || "?", p: v.championshipPts != null ? v.championshipPts : v.points != null ? v.points : "", mv: 0 };
      }).sort(function (a, b) { return (a.pos || 999) - (b.pos || 999); }) };
    }).filter(function (g) { return g.rows.length; }));
  });
  return Promise.reject(new Error("none"));
}
function spRankLoad(e) {
  var lgId = e.id.slice(0, e.id.lastIndexOf(":"));
  if (!$("spTab")) return;
  spRankGet(lgId).then(function (groups) {
    var box = $("spTab");
    if (!box || SP_OPEN !== e.id) return;
    box.innerHTML = '<div class="sprk' + (groups.length > 1 ? " two" : "") + '">' + groups.map(function (g) {
      return "<div><h3>" + esc(g.n) + '</h3><div class="sptabw"><table class="sptab"><tr><th></th><th></th><th>' + esc(g.pts) + "</th></tr>" + g.rows.map(function (r, i) {
        var mine = (e.names || []).indexOf(r.n) >= 0;
        return '<tr class="' + (mine ? "me" : "") + '"><td class="ps">' + (r.pos || i + 1) + '</td><td class="tn">' + esc(r.n) + (spIsFav(r.n) ? ' <i class="fv">★</i>' : "") + (r.mv ? ' <small class="' + (r.mv > 0 ? "up" : "dn") + '">' + (r.mv > 0 ? "▲" : "▼") + Math.abs(r.mv) + "</small>" : "") + '</td><td class="pt">' + esc(r.p) + "</td></tr>";
      }).join("") + "</table></div></div>";
    }).join("") + "</div>";
  }).catch(function () {});
}
// ---- An esports team or player (bo3.gg, through the feeds function). Opens from a match: click a team's name, then a
// player in its roster. "Back" walks the same way back. what = "team|cs2|mouz-cs2" or "player|cs2|spinx". ----
var ES_C = {}, ES_BACK = [], ES_CUR = "";
function esMoney(n) { n = +n || 0; return n >= 1e6 ? "$" + (n / 1e6).toFixed(1) + "M" : n >= 1000 ? "$" + Math.round(n / 1000) + "k" : n ? "$" + n : ""; }
function esGet(what) {
  var p = what.split("|"), c = ES_C[what];
  if (c && Date.now() - c.t < 600000) return Promise.resolve(c.d);
  if (!sb || !USER) return Promise.reject(new Error("Sign in to see this."));
  var body = {}; body[p[0] === "team" ? "teamx" : "playerx"] = { src: p[1], slug: p[2] };
  return sb.functions.invoke(window.FEEDS_FN || "feeds", { body: body }).then(function (r) {
    var d = r.data && r.data[p[0] === "team" ? "teamx" : "playerx"];
    if (!d || typeof d !== "object") throw new Error(r.data && !("teamx" in r.data) && !("playerx" in r.data) ? "This needs the newest feeds function (redeploy super-function)." : "No details for this one right now.");
    if (Object.keys(ES_C).length > 60) ES_C = {};
    ES_C[what] = { t: Date.now(), d: d };
    return d;
  });
}
function esNums(list) { list = list.filter(function (x) { return x[0] !== "" && x[0] != null; }); return list.length ? '<div class="esnums">' + list.map(function (x) { return "<div><b>" + esc(x[0]) + "</b><span>" + x[1] + "</span></div>"; }).join("") + "</div>" : ""; }
function esOpen(what) {
  var p = what.split("|"), isTeam = p[0] === "team", game = { cs2: "Counter-Strike 2", lol: "League of Legends", dota2: "Dota 2" }[p[1]] || "Esports";
  var back = '<p class="tools esbk"><button class="lnk" data-a="esback">‹ Back</button></p>';
  ES_CUR = what;
  openModal(game, '<div class="spwin eswin">' + back + '<p class="mut sn">Loading…</p></div>');
  esGet(what).then(function (d) {
    if (ES_CUR !== what || $("modal").hidden) return;
    var str = function (x) { return x == null ? "" : String(x); }, arr = function (x) { return Array.isArray(x) ? x : []; }, st = d.stats || null, img = safeUrl(isTeam ? d.logo : d.img);
    var head = function (sub, fav) { return '<div class="eshead">' + (img ? '<img alt="" referrerpolicy="no-referrer" data-rm="1" src="' + esc(img) + '">' : "") + '<div><h2 class="mh">' + esc(str(d.n)) + '</h2><div class="mut sn">' + sub.filter(Boolean).join(" · ") + "</div></div>" + (fav || "") + "</div>"; };
    var titles = arr(d.ach).length ? "<h3>Titles</h3>" + arr(d.ach).map(function (a) { return '<div class="row"><span><span class="mut">' + esc(str(a.y)) + "</span> " + esc(str(a.t)) + "</span></div>"; }).join("") : "";
    var pct = function (w, l) { return w + l ? Math.round(w / (w + l) * 100) + "%" : ""; }, h;
    if (isTeam) {
      var fav = '<button class="ib sm' + (spIsFav(d.n) ? " on" : "") + '" data-a="spfav" data-k="' + esc(str(d.n)) + '" title="' + (spIsFav(d.n) ? "Remove from favorites" : "Add to favorites") + '">' + (spIsFav(d.n) ? "★" : "☆") + "</button>";
      h = head([d.rank ? "World no. " + (+d.rank) : "", esc([d.cc, d.region].filter(Boolean).join(", ")), d.est ? "since " + esc(str(d.est)) : ""], fav) +
        esNums([[st && st.mw + st.ml ? st.mw + "–" + st.ml : "", "matches won–lost"], [st ? pct(st.gw, st.gl) : "", "maps won"], [st && st.ev ? st.ew + " / " + st.ev : "", "titles / events"], [st ? st.kd : "", "kills per death"], [esMoney(d.earned), "won, last 6 months"]]) +
        (arr(d.roster).length ? "<h3>Roster</h3>" + '<div class="sptabw sppl"><table class="sptab"><tr><th></th><th>From</th><th>Age</th><th>Rating</th><th>Won</th></tr>' + arr(d.roster).map(function (r) {
          var nm = esc(str(r.n)) + (r.coach ? ' <small class="mut">coach</small>' : "") + (r.name ? ' <small class="mut">' + esc(str(r.name)) + "</small>" : "");
          return '<tr><td class="tn">' + (r.slug ? '<button class="lnk" data-a="esplayer" data-k="' + esc(p[1] + "|" + r.slug) + '">' + nm + "</button>" : nm) + "</td><td>" + esc(str(r.cc)) + "</td><td>" + (+r.age || "") + "</td><td>" + esc(str(r.rating)) + "</td><td>" + esMoney(r.prize) + "</td></tr>";
        }).join("") + "</table></div>" : "") +
        (arr(d.next).length ? "<h3>Next</h3>" + arr(d.next).map(function (m) { return '<div class="row"><span>vs <b>' + esc(str(m.opp)) + '</b> <small class="mut">' + esc(str(m.tour)) + '</small></span><span class="r mut">' + (m.live ? '<span class="pill live">LIVE</span>' : new Date(+m.ts).toLocaleString("en-GB", { timeZone: TZ, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })) + "</span></div>"; }).join("") : "") +
        (arr(d.recent).length ? "<h3>Last results</h3>" + arr(d.recent).map(function (m) { return '<div class="row"><span><i class="fm fm' + (m.r === "W" ? "W" : "L") + '">' + (m.r === "W" ? "W" : "L") + "</i> " + esc(str(m.t)) + ' <small class="mut">' + esc(str(m.tour)) + '</small></span><span class="r mut">' + new Date(+m.ts).toLocaleDateString("en-GB", { timeZone: TZ, day: "numeric", month: "short" }) + "</span></div>"; }).join("") : "") + titles;
    } else {
      var tm = d.team ? (d.teamSlug ? '<button class="lnk" data-a="esteam" data-k="' + esc(p[1] + "|" + d.teamSlug) + '">' + esc(str(d.team)) + " ›</button>" : esc(str(d.team))) + (d.joined ? " since " + esc(str(d.joined)) : "") : "";
      h = head([esc(str(d.name)), esc(str(d.cc)), d.age ? +d.age + " years" : "", d.coach ? "coach" : esc(str(d.role)), tm]) +
        esNums([[st && st.gw + st.gl ? st.gw + "–" + st.gl : "", "maps won–lost"], [st ? pct(st.mw, st.ml) : "", "matches won"], [st ? st.kd : "", "kills per death"], [st ? st.adr : "", "damage per round"], [st ? st.kpr : "", "kills per round"], [str(d.rating), "rating, 6 months"], [st && st.ev ? st.ew + " / " + st.ev : "", "titles / events"], [esMoney(d.prize), "prize money"]]) + titles;
    }
    var site = "https://bo3.gg/" + ({ lol: "lol/", dota2: "dota2/" }[p[1]] || "") + (isTeam ? "teams/" : "players/") + p[2];
    $("mBody").innerHTML = '<div class="spwin eswin">' + back + h + '<p class="tools">' + linkBtn(site, "More on bo3.gg") + "</p></div>";
  }).catch(function (err) {
    if (ES_CUR === what && !$("modal").hidden) $("mBody").innerHTML = '<div class="spwin eswin">' + back + '<p class="mut sn">' + esc(String((err && err.message) || "Could not load this.")) + "</p></div>";
  });
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
  if (!e) e = spFind(id);
  if (!e) return;
  SP_OPEN = id; ES_CUR = "";
  var favBtn =function (n) { return '<button class="ib sm' + (spIsFav(n) ? " on" : "") + '" data-a="spfav" data-k="' + esc(n) + '" title="' + (spIsFav(n) ? "Remove from favorites" : "Add to favorites") + '">' + (spIsFav(n) ? "★" : "☆") + "</button>"; };
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
    }).join("") || '<p class="mut sn">No matches in the next day and a half.</p>') + (e.kind === "tour" ? '<div id="spTab"></div>' : "");
  } else if (e.kind === "race") {
    // Formula 1: a session that has run can be clicked to see its order; golf: the whole leaderboard. Season standings load below.
    var done = e.sessions.filter(function (s) { return s.res && s.res.length; }), ses = done.filter(function (s) { return s.n === SP_SES; })[0] || done[done.length - 1];
    body = head + (e.sessions.length ? "<h3>Sessions</h3>" + e.sessions.map(function (s) {
      var can = s.res && s.res.length;
      return '<div class="row' + (ses === s ? " sel" : "") + '"><span>' + (can ? '<button class="lnk" data-a="spses" data-k="' + esc(s.n) + '" title="Show the order of this session"><b>' + esc(s.n) + "</b> ›</button>" : "<b>" + esc(s.n) + "</b>") + '</span><span class="r">' + spWhen({ state: s.state, ts: s.ts, kind: "race", detail: "LIVE" }) + "</span></div>";
    }).join("") : "") +
      (ses ? "<h3>" + esc(ses.n) + (ses.state === "in" ? " · running order" : " · result") + '</h3><div class="sptabw sp2c">' + ses.res.map(function (n, i) { return "<div><i>" + (i + 1) + "</i>" + esc(n) + (spIsFav(n) ? ' <i class="fv">★</i>' : "") + "</div>"; }).join("") + "</div>"
        : e.field && e.field.length ? "<h3>Leaderboard</h3>" + '<div class="sptabw"><table class="sptab"><tr><th></th><th></th><th>Par</th>' + [1, 2, 3, 4].map(function (r) { return "<th>R" + r + "</th>"; }).join("") + "</tr>" + e.field.map(function (p, i) {
          return '<tr><td class="ps">' + (i + 1) + '</td><td class="tn">' + esc(p.n) + (spIsFav(p.n) ? ' <i class="fv">★</i>' : "") + '</td><td class="pt">' + esc(p.s) + "</td>" + [0, 1, 2, 3].map(function (r) { return "<td>" + (p.r[r] != null ? p.r[r] : "") + "</td>"; }).join("") + "</tr>";
        }).join("") + "</table></div>"
        : e.top.length ? "<h3>" + (e.state === "pre" ? "Field" : "Leaders") + "</h3>" + e.top.map(function (t, i) { return '<div class="row"><span>' + (i + 1) + ". <b>" + esc(t.n) + '</b></span><span class="r mut">' + esc(t.s) + "</span></div>"; }).join("") : "") + '<div id="spTab"></div>';
  } else {
    // an esports team's name opens the team: roster, results, what is next, titles
    var esKey = e.sp === "esports" ? e.id.slice(2, e.id.lastIndexOf(":")) : "";
    var team = function (t) { return '<div class="spteam">' + (t.logo ? '<img alt="" referrerpolicy="no-referrer" data-rm="1" src="' + esc(t.logo) + '">' : "") + (esKey && t.slug ? '<button class="lnk" data-a="esteam" data-k="' + esc(esKey + "|" + t.slug) + '" title="About this team"><b' + (t.win ? ' class="win"' : "") + ">" + esc(t.n) + " ›</b></button>" : "<b" + (t.win ? ' class="win"' : "") + ">" + esc(t.n) + "</b>") + favBtn(t.n) + "</div>"; };
    body = '<div class="spscore">' + team(e.home) + '<div class="spmid"><b class="big' + (e.state !== "pre" && (String(e.home.s) + String(e.away.s)).length > 6 ? " long" : "") + '">' + (e.state === "pre" ? "–" : esc(e.home.s) + " – " + esc(e.away.s)) + "</b>" + spWhen(e) + "</div>" + team(e.away) + "</div>" +
      (e.recap ? '<p class="mut sn sprecap">' + esc(e.recap) + "</p>" : "") +
      // esports: the Twitch channels showing this match; a click docks the stream at the side of the page
      (e.tw && e.tw.length && e.state !== "post" ? '<p class="tools spwatch">' + e.tw.map(function (l, i) { return '<button class="' + (i ? "" : "pri") + '" data-a="dock" data-k="t:' + esc(l) + '" title="Dock this Twitch stream at the side of the page">▶ ' + (i ? "" : "Watch · ") + esc(l) + "</button>"; }).join("") + "</p>" : "") + spEventsHtml(e, false) + '<div id="spLn">' + spLinesHtml(e) + '</div><div id="spSc"></div><div id="spStats">' + spStatsHtml(e) + '</div><div id="spLead">' + spLeadersHtml(e) + '</div><div id="spSum"></div>' +
      (e.venue ? '<p class="mut sn">' + esc(e.venue) + (e.att ? " · " + e.att.toLocaleString("en-GB") + " spectators" : "") + "</p>" : "") + '<div id="spTab"></div>';
  }
  openModal(e.lg, '<div class="spwin">' + body + (e.link ? '<p class="tools">' + linkBtn(e.link, e.id.indexOf("x/shl") === 0 ? "Schedule on shl.se" : e.id.indexOf("x/") === 0 ? "Details on bo3.gg" : "Details on ESPN") + "</p>" : "") + "</div>");
  if (e.kind === "team") { spTabLoad(e); spSumLoad(e); }
  if (e.kind === "race" || e.kind === "tour") spRankLoad(e);
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
  Object.keys(SP_PAST).forEach(function (k) { (SP_PAST[k].ev || []).forEach(function (x) { if (x.id === id) e = x; }); });
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
  ["live", "Radio", "Internet radio: pick a station and press play."],
  ["tv", "TV shows", "New episodes of the shows you follow, and what is on today."]
];
var WIZ_SETUP = ["news", "telegram", "reddit", "stocks", "tv", "twitch", "youtube", "mail"];
var WIZCITY = [];
function wizCityGo() {
  var q = $("wzCity") ? $("wzCity").value.trim() : "";
  if (!q) return;
  $("wzCityRes").innerHTML = '<p class="mut">Searching...</p>';
  fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(q) + "&count=6&language=en&format=json").then(function (r) { return r.json(); }).then(function (j) {
    if (!$("wzCityRes")) return;
    WIZCITY = (j.results || []).map(function (x) { return { name: x.name, lat: x.latitude, lon: x.longitude, label: [x.admin1, x.country].filter(Boolean).join(", ") }; });
    $("wzCityRes").innerHTML = WIZCITY.length ? WIZCITY.map(function (c, i) {
      return '<div class="row"><span>' + esc(c.name) + ' <small class="mut">' + esc(c.label) + '</small></span><button data-a="wizcity" data-k="' + i + '">Use</button></div>';
    }).join("") : '<p class="mut">No city found.</p>';
  }).catch(function () { if ($("wzCityRes")) $("wzCityRes").innerHTML = '<p class="mut">Search failed. Try again.</p>'; });
}
function wizPages() { return ["pick", "city"].concat(WIZ_SETUP.filter(function (id) { return WIZ.sel[id]; }), ["done"]); }
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
  if (id === "city") {
    var hc = homeCity(), lc = clockCity(), both = sameCity(hc, lc);
    return "<p>The weather box and the date and time at the top of the page use your city.</p>" +
      '<p class="wizcity"><b>' + esc(hc.name) + "</b>" + (both ? "" : " <small>weather</small> · <b>" + esc(lc.name) + "</b> <small>clock</small>") + "</p>" +
      '<p class="mut sn">' + (P.home ? "This is the city you chose." : "This is a guess from the time zone your device is set to. No permission was asked for and your position was not looked up, so it can be the wrong city in the right country.") + "</p>" +
      "<p>Is that right? Press <b>Next</b>. If not, search for your city and press <b>Use</b>:</p>" +
      '<div class="add"><input type="text" id="wzCity" placeholder="Search a city, e.g. Stockholm" autocomplete="off"><button data-a="wizcitygo">Search</button></div><div id="wzCityRes"></div><div id="wzMsg" class="sn" role="status">' + esc(WIZMSG) + "</div>" +
      '<p class="mut sn">You can change it later: click the weather box for the weather city, and Settings → Date &amp; time for the clock.</p>';
  }
  if (id === "news") return "<p>News starts with these sources. Add any news site by its address (for example <code>bbc.com</code>) or a feed address.</p>" + wizChips(newsSrc().map(function (x) { return x.name; })) + wizAddRow("news", "A website or feed, e.g. bbc.com") +
    '<p class="mut sn">Later, in Settings → News, Telegram &amp; Reddit, you can remove sources, mute words you do not want to see, and highlight words you care about.</p>';
  if (id === "telegram") return "<p>Add public Telegram channels by name or link. Only public channels work (the ones you can open at <code>t.me/s/name</code> without logging in).</p>" +
    mock("t.me/s/ClashReport", mkl(70) + mkl(90) + mkl(55) + '<span class="mknote">a public channel preview: this is what the box reads</span>') + wizChips(tgSrc()) + wizAddRow("tg", "Channel name or t.me link, e.g. ClashReport");
  if (id === "tv") return "<p>Follow the series you watch. The box then shows the next episode of each show, the ones that just aired, and what is on today. Type a name, press Search and then Follow on the right one.</p>" + wizChips(tvShows().map(function (s) { return s.n; })) + wizAddRow("tv", "Name of a show, e.g. Severance", "Search") + '<div id="wzRes"></div>' +
    '<p class="mut sn">Later you add more with ⌕ in the TV shows box itself. Click a show there for its episodes. New episodes also show in your calendar, and you get a notification when one airs.</p>';
  if (id === "reddit") return "<p>Add the subreddits you want to follow. In the box you can switch between Best, Hot, New, Top and Rising.</p>" + wizChips(rdSrc().map(function (x) { return "r/" + x; })) + wizAddRow("reddit", "Subreddit, e.g. worldnews");
  if (id === "stocks") return "<p>Type a company name and pick it from the list, or type symbols separated by commas. Stocks, indices, gold and crypto all work.</p>" + wizChips((P.stocks || []).map(function (x) { return tk(x.id); })) + wizAddRow("stocks", "e.g. Tesla, or NVDA, AAPL, BTCUSD") + '<div id="wzRes"></div>' +
    '<p class="mut sn">Have a portfolio somewhere else? In Settings → Stocks you can import a file from your broker, a Google Sheet or a shared TradingView watchlist in one go. The small clock button in the Stocks box shows whether the markets your stocks trade on are open, and when they open or close; the bell next to it sets an alert for a price you choose.</p>';
  if (id === "twitch") return "<p>Connect your Twitch account so the box can show which of the channels you follow are live. The page only asks to <b>see who you follow</b>; it cannot chat, follow or change anything.</p>" +
    mock("id.twitch.tv", "<b>OmniTree wants to access your account</b>" + mkl(60) + '<span class="mknote">View your list of followed channels</span><span class="mkrow">' + mkb("Cancel") + mkb("Authorize", 1) + "</span>") +
    "<ol><li>Press the button below. Twitch opens and asks you to log in if you are not already.</li><li>Press <b>Authorize</b>. You come straight back here.</li></ol>" +
    (twToken() ? '<p><span class="pill ac">✓ Twitch is connected</span></p>' : '<p><button class="pri" data-a="wiztw">Connect Twitch</button></p>') +
    '<div class="safe"><b>Is this safe?</b> Yes. You log in on Twitch\'s own page, so this site never sees your Twitch password. The only permission asked for is to read the list of channels you follow. You can take it back at any time on twitch.tv under Settings → Connections, or here in Settings → Twitch → Disconnect.</div>' +
    '<p class="mut sn">Good to know: if the chat inside this page asks you to log in, or you get ads despite Turbo or a sub, your browser is hiding your Twitch login from the player. Use <b>Pop out</b> on the stream, or see <b>Help &rarr; Twitch</b> for the one-time browser setting that fixes it.</p>';
  if (id === "youtube") {
    var nch = P.yt && P.yt.ch ? P.yt.ch.length : 0;
    return "<p>YouTube does not let a website read your subscriptions directly, so you hand the page a small file with the list. It takes about five minutes, once. The file only contains the names of the channels you subscribe to; no password, no watch history.</p><ol>" +
      '<li>Open <a href="https://takeout.google.com" target="_blank" rel="noopener">takeout.google.com</a> and press <b>Deselect all</b>.' + mock("takeout.google.com", '<span class="mkrow"><b>Select data to include</b>' + mkb("Deselect all", 1) + "</span>" + mkl(80) + mkl(65)) + "</li>" +
      "<li>Scroll down to <b>YouTube and YouTube Music</b> and tick it. Press <b>All YouTube data included</b>, untick everything, and tick only <b>subscriptions</b>." + mock("YouTube and YouTube Music", '<span class="mkrow"><span class="mkchk on"></span> YouTube and YouTube Music</span><span class="mkrow">' + mkb("All YouTube data included", 1) + '</span><span class="mkrow"><span class="mkchk"></span> history &nbsp; <span class="mkchk"></span> playlists &nbsp; <span class="mkchk on"></span> <b>subscriptions</b></span>') + "</li>" +
      "<li>Press <b>Next step</b>, then <b>Create export</b>. Google emails you a download link a few minutes later.</li>" +
      "<li>Open the downloaded zip. Inside the YouTube folder is <code>subscriptions.csv</code>. Choose that file here:</li></ol>" +
      '<p><label class="filebtn" for="ytFile">Choose subscriptions.csv</label> ' + (nch ? '<span class="pill ac">✓ ' + nch + " channels loaded</span>" : '<span class="mut sn">no file chosen yet</span>') + "</p>";
  }
  if (id === "mail") {
    var m0 = (P.mail && P.mail[0]) || {};
    return "<p>The Mail box shows your unread count without giving this site your Google password. You paste a small script into <b>your own</b> Google account, and it answers only to a secret token. It is all copy and paste; allow about ten minutes. This is the one longer step, and you can skip it and do it later from Settings → Mail.</p>" +
      '<div class="safe"><b>Is this safe, and is it allowed?</b> Yes to both.<ul>' +
      "<li>The script is made with Google Apps Script, Google's own tool for exactly this. It runs inside your Google account, under your name. Nothing is installed on your computer.</li>" +
      "<li>This site never gets your Google password and cannot sign in as you. It can only ask your script a question, and the script only answers when it is shown the secret token.</li>" +
      "<li>What the script does: counts your unread mail, lists sender, subject and the first line of the latest unread ones, and (only if you switch on email notifications) sends an email to your own address. It cannot delete, move or send mail to anyone else. You can read every line of it before you paste it.</li>" +
      '<li>You stay in control: delete the project at <a href="https://script.google.com" target="_blank" rel="noopener">script.google.com</a>, or remove its access at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener">myaccount.google.com/permissions</a>, and it stops at once.</li></ul></div><ol>' +
      '<li>Open <a href="https://script.google.com" target="_blank" rel="noopener">script.google.com</a> (signed in as the Gmail account you want) and press <b>New project</b>.' + mock("script.google.com", '<span class="mkrow">' + mkb("+ New project", 1) + "</span>" + mkl(50) + mkl(70)) + "</li>" +
      '<li>Select all the sample code in the editor and delete it. Then copy our script and paste it in. <div class="codebox"><button class="copybtn" data-a="copycode">Copy the code</button><pre id="gsCode" hidden>' + GS_CODE + "</pre></div>" + mock("Code.gs", '<span class="mkcode">function doGet(e) {<br>&nbsp;&nbsp;…the pasted script…<br>}</span>') + "</li>" +
      "<li>Press <b>Deploy</b> (top right) → <b>New deployment</b>. Click the gear next to “Select type” and choose <b>Web app</b>. Set the two boxes exactly like this, then press Deploy:" + mock("New deployment", '<span class="mkrow">Execute as ' + mkb("Me", 1) + '</span><span class="mkrow">Who has access ' + mkb("Anyone", 1) + '</span><span class="mkrow">' + mkb("Deploy", 1) + "</span>") + "</li>" +
      "<li>Google asks for permission. Press <b>Authorize access</b>, pick your account, then <b>Advanced</b> → <b>Go to … (unsafe)</b> → <b>Allow</b>. Google shows this warning for every script that has not been through its review for public apps. Yours is private: you wrote (pasted) it, and you are the only one using it, so the warning is expected." + mock("Google hasn’t verified this app", mkl(75) + '<span class="mkrow">' + mkb("Advanced", 1) + mkb("Back to safety") + '</span><span class="mknote">then: Go to your project (unsafe) → Allow</span>') + "</li>" +
      "<li>Copy the <b>Web app URL</b> (it ends in <code>/exec</code>). Open it once in a new tab: the page shows a <b>token</b>, a long code between quotation marks. Copy the token too (without the quotation marks); it is shown only this one time. Treat it like a password.</li>" +
      "<li>Fill in the three fields and press Save:</li></ol>" +
      '<div class="wizmail"><input type="text" id="wzN" placeholder="Name, e.g. Personal" value="' + esc(m0.name || "") + '"><input type="text" id="wzU" placeholder="Web app URL (ends in /exec)" value="' + esc(m0.url || "") + '"><input type="text" class="secret" id="wzT" placeholder="Token" autocomplete="off" spellcheck="false" value="' + esc(m0.t || "") + '"><button class="pri" data-a="wizmail">Save</button></div>' +
      '<div id="wzMsg" class="sn" role="status">' + esc(WIZMSG) + '</div><p class="mut sn">A second inbox can be added the same way later, in Settings → Mail. The full written steps are in Help → Mail.</p>';
  }
  return "<p><b>You are set.</b> A few things worth knowing:</p><ul><li><b>Move and resize boxes:</b> cogwheel → Edit. Drag a box by its title; W / T / H change width, text size and list length.</li>" +
    "<li><b>Everything else</b> is in the cogwheel → Settings. Run this guide again from Settings → Layout &amp; boxes.</li>" +
    "<li><b>Notes, to-dos and calendar</b> are the icons in the menu box, and can be docked at the side of the page.</li>" +
    "<li><b>Weather:</b> click the weather box to change the city or save more cities.</li>" +
    "<li><b>Search bar:</b> it also does sums, currency and unit conversions, dates and translations. Start with <code>ss</code> to search every box on the page at once. Type <code>help</code> in it to see everything.</li>" +
    "<li><b>Twitch:</b> the compass button at the top of the box finds live streams and channels you do not follow.</li>" +
    "<li><b>Sports:</b> the box also has Results for finished games and a search (⌕) for a team, player or event.</li>" +
    "<li><b>News, Telegram and Reddit:</b> click a post to scroll through all of them in one window. The small list button at the top of the box starts at the oldest post you have not seen, and ⌕ searches further back than the box shows.</li>" +
    "<li><b>Radio:</b> pick your stations in Settings → Radio, or search for your own station there and add it.</li>" +
    "<li><b>Bring your things along:</b> the bookmarks of your browser (Settings → Bookmarks), a Google, Outlook or Apple calendar (Settings → Calendar) and a portfolio file from your broker (Settings → Stocks) can all be imported.</li>" +
    "<li><b>Summary:</b> a small window with what happened while you were away. Choose what is in it and when it opens in Settings → Summary.</li>" +
    "<li><b>Web page boxes:</b> up to three web pages of your choice can get a box of their own (Settings → Web page boxes).</li><li><b>Help:</b> press <code>?</code>, or use the link at the bottom of the page, for the full guide.</li></ul>";
}
var WIZ_TITLES = { pick: "Welcome to OmniTree", city: "Your city", news: "News", telegram: "Telegram", reddit: "Reddit", stocks: "Stocks", tv: "TV shows", twitch: "Twitch", youtube: "YouTube", mail: "Mail (Gmail)", done: "All done" };
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
      tvp().on = !!WIZ.sel.tv; delete L.off.tv;
      persist(); render();
    }
    // pressing Next on the city page confirms the guessed city, so it stays even if the device's time zone changes later
    if (id === "city" && AUTOCITY && (!P.home || !P.loc)) {
      if (!P.home) P.home = { name: AUTOCITY.name, lat: AUTOCITY.lat, lon: AUTOCITY.lon };
      if (!P.loc) P.loc = { name: AUTOCITY.name, lat: AUTOCITY.lat, lon: AUTOCITY.lon };
      persist();
    }
    WIZ.step++; WIZMSG = "";
  }
  else if (a === "wizcitygo") { wizCityGo(); return; }
  else if (a === "wizcity") {
    var wc = WIZCITY[+k];
    if (!wc) return;
    P.home = { name: wc.name, lat: wc.lat, lon: wc.lon }; P.loc = { name: wc.name, lat: wc.lat, lon: wc.lon };
    persist(); WX = null; render(); fetchWeather(); fetchClockTz();
    WIZMSG = "Your city is now " + wc.name + ".";
  }
  else if (a === "wiznext" || a === "wizskip") { P.onboarded = true; persist(); WIZ = null; closeModal(); refreshAll(true); return; }
  else if (a === "wiztw") { try { sessionStorage.setItem("sp_wiz", JSON.stringify(WIZ)); } catch (e) {} twConnect(); return; }
  else if (a === "wizadd") {
    if (!v) return;
    // TV shows: the search answers with a short list, each with a Follow button (the page is not redrawn, so the list stays)
    if (k === "tv") {
      $("wzRes").innerHTML = '<p class="mut sn">Searching…</p>';
      tvGet("search/shows?q=" + encodeURIComponent(v)).then(function (j) {
        if (!$("wzRes")) return;
        var res = (Array.isArray(j) ? j : []).map(function (x) { return x.show || {}; }).filter(function (s) { return s.id && s.name; }).slice(0, 6);
        $("wzRes").innerHTML = res.length ? res.map(function (s) {
          return '<div class="row"><span><span class="bnm rbn">' + esc(s.name) + '</span> <small class="mut">' + esc([String(s.premiered || "").slice(0, 4), tvNet(s)].filter(Boolean).join(" · ")) + "</small></span>" + (tvHas(s.id) ? '<span class="mut sn">✓ following</span>' : '<button data-a="tvfav" data-k="' + (+s.id) + "|" + esc(String(s.name).slice(0, 80)) + '">Follow</button>') + "</div>";
        }).join("") : '<p class="mut sn">No show found with that name.</p>';
      }).catch(function () { if ($("wzRes")) $("wzRes").innerHTML = '<p class="mut sn">Could not search right now. You can add shows later in the box.</p>'; });
      return;
    }
    if (k === "news") { ok = addNewsSrc("", v); if (ok) srcChanged(); }
    else if (k === "tg") { ok = addTgSrc(v); if (ok) srcChanged(); }
    else if (k === "reddit") { ok = addRdSrc(v); if (ok) rdChanged(); }
    else if (k === "stocks") {
      var list = v.split(/[,\s;]+/).map(function (x) { return x.trim().toUpperCase(); }).filter(function (x) { return /^[A-Z0-9._:=^!&-]{1,24}$/.test(x); });
      // a company name was typed and the list under the field has matches: pick there, instead of adding a symbol called TESLA
      if (!/[,;:]/.test(v) && STFOR === v && STFOUND.length && !(list.length === 1 && STFOUND.some(function (x) { return x.s === list[0]; }))) {
        if ($("wzMsg")) $("wzMsg").textContent = "Pick the company from the list below, or type its exact symbol (like NVDA).";
        return;
      }
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
  var m = new RegExp("^(" + cmdW("note") + "|" + cmdW("todo") + ")[:\\s]\\s*(\\S.*)$", "i").exec(q.trim()), td = !!m && m[1].toLowerCase() === cmdW("todo");
  return m ? { save: { todo: td, t: m[2].trim().slice(0, 2000) }, show: (td ? "New to-do: " : "New note: ") + m[2].trim() } : null;
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
  var m = new RegExp("^(?:" + cmdW("tr") + "|translate)\\s+(.+)$", "i").exec(q.trim());
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
  var sq = siteAsk(q);
  var a = SRCHANS = (sq ? { show: "Search all boxes for “" + sq + "”", site: sq } : null) || scratch(q) || (new RegExp("^\\s*(" + cmdW("help") + "|\\?)\\s*$", "i").test(q) ? { show: "What the search bar can do", help: 1 } : null) || (tr ? { show: "Translating to " + tr.toName + "…", wait: 1 } : null) || dateAnswer(q) || calcAnswer(q);
  box.hidden = !a;
  if (a) box.innerHTML = "<b>" + esc(a.show) + "</b><small>" + (a.save ? "Enter to save" : a.site ? "Enter to search" : a.help ? "Enter to open" : a.wait ? "" : a.soft ? "click to copy" : "Enter to copy") + "</small>";
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
    "<tr><th colspan=\"2\">Search this page</th></tr>" +
    row(cmdW("ss") + " ferry", "Search all boxes at once: news, Telegram, Reddit, sports, stocks, TV shows, videos, streams, notes, calendar, bookmarks, read later, mail and settings. A window lists what was found, and News, Telegram, Reddit and Sports show the same search in their own box." + (ssKeyName() ? " <code>" + ssKeyName() + "</code> does the same with whatever is typed, without the word." : "")) +
    "<tr><th colspan=\"2\">Answers (Enter copies the answer)</th></tr>" +
    row("12*45", "Sums: <code>+ - * / ^</code>, brackets, <code>15% of 240</code>, <code>sqrt(2)</code>, <code>pi</code>, also abs, round, floor, ceil, ln, log, sin, cos, tan.") +
    row("100 usd in eur", "Currencies (every one the rates service lists) and BTC, ETH, SOL: <code>0.5 btc to usd</code>, <code>$100 in sek</code>.") +
    row("10 km in miles", "Units: length, weight, volume, speed, time, data and temperature (<code>72 f in c</code>).") +
    row("days until 24 dec", "Dates: <code>days since 1 jan 2020</code>, <code>90 days from today</code>, <code>in 3 weeks</code>, <code>2 months before 1 may</code>, <code>between 1 mar and 24 dec</code>, <code>week number</code>, <code>what day is 1 may 2027</code>, <code>today</code>.") +
    row(cmdW("tr") + " hello to swedish", "Translate. The language it is written in is worked out for you; without <code>to …</code> it goes to English: <code>" + cmdW("tr") + " tere hommikust</code>. Sent to the free MyMemory service.") +
    "<tr><th colspan=\"2\">Save</th></tr>" +
    row(cmdW("note") + " buy milk", "Saves a note without opening Notes.") +
    row(cmdW("todo") + " call the bank", "Saves a to-do.") +
    "<tr><th colspan=\"2\">Keys</th></tr>" +
    row("Enter", "Search, or take the answer shown under the bar (copy it, save it). After an answer, Enter again searches for it.") +
    row("Ctrl+Enter", "Always search the web, in a new tab, whatever is typed.") +
    (ssKeyName() ? row(ssKeyName(), "Search all boxes for what is typed.") : "") +
    row("Esc", "Leave the bar.") +
    row(cmdW("help"), "This window.") + '</table><p class="mut sn">The words that start a command (' + ["ss", "note", "todo", "tr", "help"].map(function (k) { return "<code>" + cmdW(k) + "</code>"; }).join(", ") + ") and the key for searching all boxes can be changed in Settings → Search bar.</p>";
}
function openSearchHelp() { openModal("Search bar", searchHelpHtml()); }
// Enter (or a click on the answer): the answer goes into the box, selected, and onto the clipboard
function srchTake() {
  if (!SRCHANS || SRCHANS.wait) return;
  if (SRCHANS.site) { var sq = SRCHANS.site; SRCHANS = null; $("srchAns").hidden = true; $("srchIn").value = ""; $("srchIn").blur(); openSite(sq); return; }
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
  // Shift+Enter (or Alt+Enter, Settings > Search bar): search all boxes for what is typed, without the command word
  if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && ((ssKey() === "shift" && e.shiftKey && !e.altKey) || (ssKey() === "alt" && e.altKey && !e.shiftKey))) {
    e.preventDefault();
    var sv = siteAsk(e.target.value) || e.target.value;
    SRCHANS = null; $("srchAns").hidden = true; e.target.value = ""; e.target.blur();
    openSite(sv); return;
  }
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
  renderCmd();
  var n = NTF();
  NF_BOX.forEach(function (x) { $(x[0]).checked = n[x[1]] !== false && !!n[x[1]]; });
  NF_NUM.forEach(function (x) { $(x[0]).value = n[x[1]]; });
  renderSumSet();
  renderLangs(); renderRadioList(); renderSdForm();
  var rds = RDS(); $("rdrClick").value = rds.click; $("rdrCdir").value = rds.cdir; $("rdrBdir").value = rds.bdir;
  $("cntNews").value = String(cntOf("news") - MORE.news); $("cntTg").value = String(cntOf("tg") - MORE.tg);
  $("rdComSel").value = String(rdComN()); $("twOffOn").checked = twOffOn(); $("devMailOn").checked = P.devMail !== false; $("pasteOn").checked = P.pasteNote !== false;
  $("sparkSel").value = sparkOn() ? sparkRange() : "off"; $("spCalOn").checked = P.spCal !== false;
  renderKeys();
}
function setWords() { P.nwords = { mute: $("nwMute").value.trim(), hi: $("nwHi").value.trim() }; persist(); render(); }
$("nwMute").onchange = setWords; $("nwHi").onchange = setWords;
$("twPopOn").onchange = function () { P.twPop = this.checked; persist(); };
// Notification settings: [input id, name in P.ntf, (for numbers) lowest, highest]
var NF_BOX = [["nfNews", "news"], ["nfWords", "words"], ["nfStock", "stock"], ["nfLive", "live"], ["nfCal", "cal"], ["nfMail", "mail"], ["nfSport", "sport"], ["nfTv", "tv"], ["nfSound", "sound"], ["nfDesktop", "desktop"], ["nfEmail", "email"]];
var NF_NUM = [["nfSrcN", "srcN", 2, 6], ["nfPct", "pct", 0.5, 50], ["nfDay", "day", 1, 90]];
function setNtf() {
  var n = {};
  NF_BOX.forEach(function (x) { n[x[1]] = $(x[0]).checked; });
  NF_NUM.forEach(function (x) { var v = parseFloat($(x[0]).value); n[x[1]] = isNaN(v) ? NTF()[x[1]] : Math.max(x[2], Math.min(x[3], v)); });
  P.ntf = n; persist();
  if (n.desktop) askNotify();
}
NF_BOX.concat(NF_NUM).forEach(function (x) { $(x[0]).onchange = setNtf; });

$("sparkSel").onchange = function () { P.spark = this.value !== "off"; if (P.spark) P.sparkR = this.value; persist(); if (sparkRange() !== SPARKR) SPARK = {}; render(); fetchSparks(true); };
$("spCalOn").onchange = function () { P.spCal = this.checked; persist(); render(); refreshCal(); };
$("keysOn").onchange = function () { P.keysOff = !this.checked; persist(); renderKeys(); };
$("cntNews").onchange = function () { P.cnt = P.cnt || {}; P.cnt.news = +this.value; MORE.news = 0; persist(); render(); };
$("cntTg").onchange = function () { P.cnt = P.cnt || {}; P.cnt.tg = +this.value; MORE.tg = 0; persist(); render(); tgTopUp(); };
$("rdComSel").onchange = function () { P.rdCom = +this.value; persist(); };
$("devMailOn").onchange = function () { P.devMail = this.checked; persist(); };
// Settings > Calendar: the three settings that are not tick boxes
$("sdMf").onchange = function () { P.sd = Object.assign({}, SD(), { mf: this.value }); persist(); render(); refreshSdCal(); };
$("sdPay").onchange = function () { var v = Math.round(+this.value); P.sd = Object.assign({}, SD(), { pay: v >= 1 && v <= 31 ? v : 0 }); persist(); renderSdForm(); render(); refreshSdCal(); };
$("sdRemDays").onchange = function () { P.sd = Object.assign({}, SD(), { remDays: +this.value }); persist(); };
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
  if (e.target.id === "spQ") { debounced("spQ", function () { SPQ = $("spQ") ? $("spQ").value.trim().toLowerCase().slice(0, 60) : ""; render(); fetchSports(); }); return; }
  if (e.target.id === "tgQ" || e.target.id === "rdQ") { var fid = e.target.id, fb = fid === "tgQ" ? "tg" : "rd"; debounced(fid, function () { FQ[fb] = $(fid) ? $(fid).value.trim().slice(0, 80) : ""; render(); findSoon(fb); }); return; }
  if (e.target.id !== "newsQ") return;
  debounced("newsQ", function () { NQ = $("newsQ") ? $("newsQ").value.trim().toLowerCase().slice(0, 80) : ""; render(); findSoon("news"); });
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
  sendNtfMail([{ ts: Date.now(), t: "New sign-in to your OmniTree account", b: name + ", " + when(Date.now()) + ". If this was you, nothing needs doing. If not: change your password, then Settings > Account > Sign-in activity > Sign out everywhere else." }]);
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
  var data = JSON.stringify({ app: "OmniTree", v: VERSION, at: new Date().toISOString(), prefs: Object.assign({}, P, { tw: undefined }) }, null, 2);
  var a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data], { type: "application/json" }));
  a.download = "omnitree-backup-" + new Date().toISOString().slice(0, 10) + ".json";
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
    try { var j = JSON.parse(fr.result); p = j && (j.app === "OmniTree" || j.app === "Omni" + "Rama") ? j.prefs : null; } catch (x) {}   // also backups made under the site's earlier name
    e.target.value = "";
    if (!p || typeof p !== "object" || Array.isArray(p)) { $("bkMsg").textContent = "That file is not an OmniTree backup."; return; }
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
  ["bell", "a", "Notification history", function () { MENU_OPEN = MENU_OPEN === "bell" ? "" : "bell"; if (MENU_OPEN) { NLOG.forEach(function (x) { x.seen = 1; }); save("sp_nlog", NLOG); sy().nseen = Date.now(); persist(); } render(); }],
  ["seen", "x", "Mark everything as seen", function () { markSeen(""); render(); }],
  ["filter", "f", "Search the news", function () { NFILT = !(NFILT || NQ); if (!NFILT) NQ = ""; render(); var q = $("newsQ"); if (q) { q.value = ""; q.focus(); } }],
  ["site", "q", "Search all boxes", function () { openSearch(); $("srchIn").value = cmdW("ss") + " "; srchShow(); }],
  ["discover", "d", "Discover on Twitch", function () { openDiscover(); }],
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
  $("srchIn").placeholder = "Search… (type " + cmdW("help") + " for info)";
  $("srchIn").title = "Type " + cmdW("help") + " and press Enter to see everything the search bar can do" + (sk && keysOn() ? ". Shortcut to jump here: " + keyLabel(sk) : "");
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
  tick(); tickClocks(); syncPull();
  // Away for more than 2 minutes: what was on screen when you left counts as seen, so only newer items are marked new
  if (HIDDEN_AT && Date.now() - HIDDEN_AT > 120000) { markSeen("", HIDDEN_AT); refreshAll(); }
  else render();
  HIDDEN_AT = 0;
});

$("ver").textContent = VERSION;
applyTheme(); applyWall(); tick(); render(); initAuth(); fetchWeather(); fetchClockTz(); findAutoCity(); fetchRates(); fetchIcs(); fetchTv();
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
