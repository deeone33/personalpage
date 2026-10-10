var VERSION = 48;

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
    { id: "nocturne_tv", sub: "WoW", v: 2100, live: 1 },
    { id: "kaizen", sub: "Path of Exile", v: 840, live: 1 },
    { id: "sweden_speedrun", sub: "Speedruns", v: 1200, live: 1 },
    { id: "tavern_bard", sub: "Music", v: 310, live: 1 },
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
    { id: "EQNR", name: "Equinor", p: 26.7, c: 1.7 }
  ]
};

// ---- Storage (safe if the browser blocks it) ----
function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
var DEFAULT_ACCENT = "#f5b942";
var P = load("sp_prefs", { theme: "dark", accent: DEFAULT_ACCENT, fav: {}, hidden: {} });
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
document.addEventListener("error", function (e) { var t = e.target; if (t && t.tagName === "IMG" && t.getAttribute("data-rm") === "1") t.remove(); }, true);

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
  $("pwMsg").textContent = "Working...";
  sb.auth.updateUser({ password: v }).then(function (r) {
    $("pwMsg").textContent = r.error ? r.error.message : "Password updated.";
    if (!r.error) $("pwNew").value = "";
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
  return '<div class="row' + (cls || "") + '"' + (attr || "") + '><span>' + (f ? '<i class="fv">★</i>' : "") + (op ? '<button class="lnk" data-a="open" data-k="' + esc(typeof op === "string" ? op : key) + '">' + main + "</button>" : main) + (sub ? " <small>" + esc(sub) + "</small>" : "") +
    '</span><span class="r">' + right + ed + "</span></div>";
}
function shown(key) { return !P.hidden[key]; }
function favFirst(a, b) { return (P.fav[b.key] ? 1 : 0) - (P.fav[a.key] ? 1 : 0); }
function card(cls, title, body) { return '<div class="card ' + cls + '"><h3>' + title + "</h3>" + body + "</div>"; }

var ALL_IDS = ["weather", "mail", "live", "menu", "news", "telegram", "twitch", "youtube", "stocks", "reddit"];
var DEF_C = { weather: 3, mail: 3, live: 4, menu: 2, news: 6, telegram: 6, twitch: 4, youtube: 4, stocks: 4, reddit: 6 };
var COMPACT = ["weather", "mail", "live", "menu"];
var LISTS = ["news", "telegram", "twitch", "youtube", "stocks", "reddit"];
function LAY() {
  if (!P.layout) P.layout = { order: [], w: {}, rows: {} };
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
  else L.rows[id] = Math.max(3, Math.min(20, (L.rows[id] || (id === "news" || id === "telegram" || id === "reddit" ? 6 : 10)) + d));
  persist(); render();
}
// Every list box gets a small reload button in its top-right corner. To give a new box one, add its id and loader here.
var REFRESH = {
  news: function () { fetchNews(); }, telegram: function () { fetchTG(); }, twitch: function () { fetchTwitch(); },
  youtube: function () { fetchYT(); }, stocks: function () { fetchQuotes(true); }, reddit: function () { fetchReddit(); }
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
      (LISTS.indexOf(id) >= 0 ? bt("h", -1, "H−", "Shorter list") + bt("h", 1, "H+", "Taller list") : "") + "</div>";
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
  return '<span class="ic" style="--h:' + h + '"><i>' + esc(t.replace(/[^A-Za-z0-9]/g, "").slice(0, 2)) + "</i>" + (src ? '<img alt="" loading="lazy" referrerpolicy="no-referrer" data-rm="1" src="' + esc(src) + '">' : "") + "</span>";
}
function hd(t, n) { return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, "") + "…" : t; }
function fsOf(id) { return (P.fs || 1) * (LAY().fs[id] || 1); }
function pairPct() { var p = P.layout && P.layout.pairPct; return p == null ? 65 : p; }
function lst(id, html, def) { var r = LAY().rows[id] || def || 10; return '<div class="list" data-list="' + id + '" style="max-height:' + Math.round(r * 36 * fsOf(id)) + 'px">' + html + "</div>"; }
function ago(ts) { var m = Math.max(1, Math.round((Date.now() - ts) / 60000)); return m < 60 ? m + "m" : m < 1440 ? Math.round(m / 60) + "h" : Math.round(m / 1440) + "d"; }

function render() {
  var D = DATA, T = {};
  var t = WX ? Math.round(WX.current.temperature_2m) : D.weather.temp;
  var note = WX ? wxText(WX.current.weather_code) + " · feels " + Math.round(WX.current.apparent_temperature) + "°" : D.weather.note;
  var wWarn = WX ? wxWarn(WX) : [];
  T.weather = tile("weather", "", '<div class="mrow"><span class="mrn">' + esc(homeCity().name) + "</span>" + (WX ? '<span class="wi">' + wxIcon(WX.current.weather_code, WX.current.is_day, 22) + "</span>" : "") + '<b class="big">' + t + "°</b>" + (wWarn.length ? '<span class="warn" title="' + esc(wxWarnText(wWarn)) + '" aria-label="Weather warning">!</span>' : "") + '<span class="mut">' + esc(note) + "</span></div>", 1);
  T.mail = tile("mail", "", '<div class="mailgrid">' + [0, 1].map(function (i) {
    var cfg = P.mail && P.mail[i], m = MAIL[i], nm = (cfg && cfg.name) || D.inbox[i].name, val, click = false;
    if (!cfg || !cfg.url) val = '<span class="mut">Not connected</span>';
    else if (!m) val = '<span class="mut">Loading...</span>';
    else if (m.error) val = '<span class="mut" title="' + esc(m.error) + '">Error</span>';
    else { var n = mailN(i); val = "<b>" + n.txt + '</b><span class="mut">' + n.lab + "</span>" + (n.n > 0 ? '<button data-a="mailread" data-k="' + i + '" title="Mark read (only on this site)" aria-label="Mark read">✓</button>' : ""); click = true; }
    return '<div class="mailcell"' + (click ? ' data-a="mail" data-k="' + i + '" tabindex="0" role="button"' : "") + '><span class="mrn">' + esc(nm) + "</span>" + val + "</div>";
  }).join("") + "</div>");


  var tw = (TWC ? TW : D.twitch).filter(function (x) { return x.live && shown("t:" + x.id); })
    .map(function (x) { x.key = "t:" + x.id; return x; })
    .sort(function (a, b) { return favFirst(a, b) || b.v - a.v; });
  T.live = tile("live", "", convHtml());
  var allSrc = newsSrc().map(function (x) { return x.name; });
  var nb, nNew = 0;
  var errNote = NERRK.length ? '<div class="empty sn">' + NERRK.length + " source" + (NERRK.length > 1 ? "s" : "") + ' unavailable right now (<button class="lnk2" data-a="setpanel" title="' + esc(NERR) + '">details</button>)</div>' : "";
  if (NEWS.length) {
    var nowN = Date.now();
    NG = newsGroups();
    var gRead = function (g) { return g.some(function (x) { return READ[x.u]; }); };
    nNew = NG.filter(function (g) { return isNewTs(g[0].ts) && !gRead(g); }).length;
    var vis = NQ ? NG.filter(function (g) { return g.some(function (n) { return (n.t + " " + n.s).toLowerCase().indexOf(NQ) >= 0; }); }) : NG, lastB = "";
    nb = errNote + (NFILT || NQ ? '<input type="search" id="newsQ" class="flt" placeholder="Filter headlines…" aria-label="Filter headlines">' : "") + (vis.length ? lst("news", vis.slice(0, 80).map(function (g) {
      var n = g[0], srcs = g.map(function (x) { return x.s; }), b = g.fav ? "★ Favorite sources" : bucket(n.ts);
      // The time label sits on the divider line above the first headline of each period, so it takes no extra row
      var bk = b !== lastB ? ' data-b="' + b + '"' : ""; lastB = b;
      var hot = srcs.length >= 3 && nowN - n.ts < 10800000, rd = g.some(function (x) { return READ[x.u]; });
      var cls = (isNewTs(n.ts) && !rd ? " new" : "") + (rd ? " rd" : "") + (g.hi ? " hi" : "") + (bk ? " bk" : "");
      return row("n:" + n.s, esc(n.t), P.hideSrc ? "" : srcs.join(" · "), (hot ? '<span class="pill hot" title="Many sources in the last 3 hours">hot</span>' : "") + '<span class="mut">' + ago(n.ts) + "</span>" + (srcs.length > 1 ? '<span class="pill ac" title="' + esc(srcs.join(", ")) + '">' + srcs.length + "</span>" : ""), "a:" + n.u, cls, bk);
    }).join(""), 6) : '<div class="empty">' + (NQ ? "No headline matches that filter." : "All news sources hidden or muted. Use Sources to bring one back.") + "</div>");
  } else {
    nb = lst("news", D.news.map(function (x) {
      return '<div class="row"><span>' + esc(x.t) + '</span><span class="pill ' + (x.n > 3 ? "ac" : "") + '">×' + x.n + "</span></div>";
    }).join(""), 6) + '<div class="empty">' + (NERR ? "News unavailable: " + esc(NERR) : "Sample headlines. Sign in to load your sources.") + "</div>";
  }
  var newBtn = function (n) { return n ? '<button class="pill ac newp" data-a="nseen" title="Mark everything as seen">' + n + " new</button>" : ""; };
  var ctlN = allSrc.length > 1 ? '<div class="dd"><button data-a="filtmenu" data-k="news" class="ib sm">Sources</button><div class="menu" id="filtNews" hidden>' +
    allSrc.map(function (nm) { return '<label><input type="checkbox" data-a="filttoggle" data-k="n:' + esc(nm) + '"' + (shown("n:" + nm) ? " checked" : "") + "> " + esc(nm) + "</label>"; }).join("") + "</div></div>" : "";
  var fltBtn = NEWS.length ? '<button class="ib sm' + (NFILT || NQ ? " on" : "") + '" data-a="nfilt" title="Filter headlines" aria-label="Filter headlines">⌕</button>' : "";
  T.news = tile("news", "News", nb, 0, newBtn(nNew) + fltBtn + ctlN);

  var allTg = tgSrc(), tmute = wordList(NW().mute), thi = wordList(NW().hi);
  var tp = TGP.filter(function (g) { return shown("g:" + g.s) && !(tmute.length && hasWord(g.tx || g.t, tmute)); });
  var tgMulti = allTg.filter(function (nm) { return shown("g:" + nm); }).length > 1;
  var tNew = tp.filter(function (g) { return isNewTs(g.ts) && !READ[g.u]; }).length;
  var ctlG = allTg.length > 1 ? '<div class="dd"><button data-a="filtmenu" data-k="tg" class="ib sm">Sources</button><div class="menu" id="filttg" hidden>' +
    allTg.map(function (nm) { return '<label><input type="checkbox" data-a="filttoggle" data-k="g:' + esc(nm) + '"' + (shown("g:" + nm) ? " checked" : "") + "> " + esc(nm) + "</label>"; }).join("") + "</div></div>" : "";
  T.telegram = tile("telegram", "Telegram", tp.length ? lst("telegram", tp.map(function (g) {
    var cls = (isNewTs(g.ts) && !READ[g.u] ? " new" : "") + (READ[g.u] ? " rd" : "") + (thi.length && hasWord(g.tx || g.t, thi) ? " hi" : "");
    // Two full lines of the post, cut by the browser where the space ends; the channel name is shown inline, and only when there are several
    return row("g:" + g.s, '<span class="clamp">' + (tgMulti ? "<small>" + esc(g.s) + "</small> " : "") + esc(String(g.t).slice(0, 400)) + "</span>", "", '<span class="mut">' + ago(g.ts) + "</span>", "m:" + g.u, cls + " tg");
  }).join(""), 6) : '<div class="empty">' + (NERR ? "Unavailable: " + esc(NERR) : "Sign in to load your Telegram channels (Clash Report).") + "</div>", 0, newBtn(tNew) + ctlG);

  var TS = (P.sort && P.sort.twitch) || "viewers", cats = {};
  tw.forEach(function (x) { cats[x.sub || "?"] = (cats[x.sub || "?"] || 0) + 1; });
  var tcat = P.tcat && cats[P.tcat] ? P.tcat : "";
  var twv = (tcat ? tw.filter(function (x) { return (x.sub || "?") === tcat; }) : tw.slice()).sort(function (a, b) {
    return favFirst(a, b) || (TS === "name" ? String(a.name || a.id).toLowerCase().localeCompare(String(b.name || b.id).toLowerCase()) : TS === "cat" ? String(a.sub || "").localeCompare(String(b.sub || "")) || b.v - a.v : b.v - a.v);
  });
  var ctlT = '<select data-s="sort:twitch" aria-label="Sort streams">' + opts([["viewers", "Views"], ["name", "Name"], ["cat", "Cat."]], TS) + '</select><select data-s="tcat" aria-label="Filter by category"><option value="">All categories</option>' +
    Object.keys(cats).sort(function (a, b) { return cats[b] - cats[a] || a.localeCompare(b); }).map(function (c) { return '<option value="' + esc(c) + '"' + (c === tcat ? " selected" : "") + ">" + esc(c) + " (" + cats[c] + ")</option>"; }).join("") + "</select>";
  T.twitch = tile("twitch", "Twitch", (twv.length ? lst("twitch", twv.map(function (x) {
    var vv = x.v >= 1000 ? (x.v / 1000).toFixed(1) + "k" : x.v;
    return row(x.key, '<span class="dot"></span>' + esc(x.name || x.id), x.sub, '<span class="mut">' + vv + "</span>", TWC ? 1 : 0);
  }).join("")) : '<div class="empty">Nobody you follow is live.</div>') +
    (TWC || !window.TWITCH_CLIENT_ID ? "" : '<button data-a="twConnect">Connect Twitch to show your real follows</button>'), 0, ctlT);

  var yb;
  if (P.yt && P.yt.ch && P.yt.ch.length) {
    var now = Date.now();
    var vids = YTV.map(function (v) { return { id: v.id, t: v.t, n: v.n, ts: v.ts, key: "y:" + v.n, isNew: now - v.ts < 172800000 }; })
      .filter(function (v) { return shown(v.key) && now - v.ts < 2592000000; })
      .sort(function (a, b) { return b.ts - a.ts; });
    var per = {};
    vids = vids.filter(function (v) { per[v.n] = (per[v.n] || 0) + 1; return per[v.n] <= 2; });
    vids.sort(function (a, b) { return ((P.fav[b.key] && b.isNew) ? 1 : 0) - ((P.fav[a.key] && a.isNew) ? 1 : 0) || b.ts - a.ts; });
    yb = (YTERR ? '<div class="empty">Videos unavailable: ' + esc(YTERR) + "</div>" : "") +
      (YTDOWN && vids.length ? '<div class="empty sn" title="YouTube\'s upload feed is not answering. This is on YouTube\'s side and comes back by itself.">YouTube\'s feed is down right now · showing the last loaded videos</div>' : "") + (vids.length ? lst("youtube", vids.map(function (v) {
      return row(v.key, esc(v.t), v.n, '<span class="mut">' + ago(v.ts) + "</span>" + (P.fav[v.key] && v.isNew ? '<span class="pill ac">new</span>' : ""), "v:" + v.id);
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
  var rNew = RS === "new" ? rp.filter(function (x) { return isNewTs(x.ts) && !READ[x.u]; }).length : 0;
  var ctlR = '<select data-s="rdsort" aria-label="Sort posts">' + opts(RD_SORTS.map(function (s) { return [s, s.charAt(0).toUpperCase() + s.slice(1)]; }), RS) + "</select>" +
    (rSubs.length > 1 ? '<div class="dd"><button data-a="filtmenu" data-k="rd" class="ib sm">Sources</button><div class="menu" id="filtRd" hidden>' +
      rSubs.map(function (nm) { return '<label><input type="checkbox" data-a="filttoggle" data-k="r:' + esc(nm.toLowerCase()) + '"' + (shown("r:" + nm.toLowerCase()) ? " checked" : "") + "> r/" + esc(nm) + "</label>"; }).join("") + "</div></div>" : "");
  T.reddit = tile("reddit", "Reddit", (RDERR && !rp.length ? '<div class="empty">Reddit unavailable: ' + esc(RDERR) + "</div>" : "") + (rp.length ? lst("reddit", rp.slice(0, 60).map(function (x) {
    var cls = (RS === "new" && isNewTs(x.ts) && !READ[x.u] ? " new" : "") + (READ[x.u] ? " rd" : "");
    return row("r:" + x.s.toLowerCase(), esc(x.t), P.hideSrc ? "" : "r/" + x.s, '<span class="mut">' + ago(x.ts) + "</span>", "r:" + x.u, cls);
  }).join(""), 6) : RDERR ? "" : '<div class="empty">' + (!rSubs.length ? "No subreddits. Add some in Settings." : USER ? "Loading Reddit…" : "Sign in to load Reddit.") + "</div>"), 0, newBtn(rNew) + ctlR);

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
    var c = x.c, up = c >= 0;
    return row(x.key, ico(x.id, x.logo) + "<b>" + esc(x.id) + "</b>", (x.p != null ? x.p.toFixed(2) : x.name), c == null ? '<span class="mut" title="No free price data for this one. Click it for the chart.">n/a</span>' : '<span class="' + (up ? "up" : "down") + '">' + (up ? "▲ +" : "▼ ") + c.toFixed(1) + "%</span>", 1);
  }).join("")) : '<div class="empty">No stocks. Restore them in Settings.</div>'), 0, ctlS);

  var pp = pairPct();
  var liveBox = T.live.replace('style="--fs:', 'style="flex:' + pp + ' 1 0%;--fs:');
  var menuBox = T.menu.replace('style="--fs:', 'style="flex:' + (100 - pp) + ' 1 0%;--fs:');
  T.live = '<div class="pairwrap">' + liveBox +
    (EDIT ? '<button class="paird" data-a="paird" title="Drag to resize" aria-label="Resize Convert and Menu" role="separator" aria-orientation="vertical" tabindex="0">⋮</button>' : "") +
    menuBox + "</div>";
  T.menu = "";

  // A background refresh must not wipe what you are typing (sign-in form, converter, filter) or steal focus
  var scrolls = {}, typed = {}, act = document.activeElement, actId = act && act.id && $("grid").contains(act) ? act.id : "", sel = null;
  $("grid").querySelectorAll(".list[data-list]").forEach(function (n) { scrolls[n.dataset.list] = n.scrollTop; });
  $("grid").querySelectorAll("input[id]").forEach(function (n) { if (n.type !== "checkbox") typed[n.id] = n.value; });
  if (actId) { try { sel = [act.selectionStart, act.selectionEnd]; } catch (e) {} }
  $("grid").innerHTML = orderIds().map(function (id) { return T[id] || ""; }).join("");
  $("grid").querySelectorAll(".list[data-list]").forEach(function (n) { if (scrolls[n.dataset.list]) n.scrollTop = scrolls[n.dataset.list]; });
  Object.keys(typed).forEach(function (id) { var n = $(id); if (n && n.value !== typed[id]) n.value = typed[id]; });
  if (actId) { var fn = $(actId); if (fn) { try { fn.focus({ preventScroll: true }); if (sel && sel[0] != null) fn.setSelectionRange(sel[0], sel[1]); } catch (e) {} } }
  renderHidden();
  refreshBrief();
  if (!$("peek").hidden) hidePeek();   // the row it pointed at has just been redrawn
}

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
}

// ---- Details window ----
function openModal(title, html) { $("mTitle").textContent = title; $("mBody").innerHTML = html; $("modal").hidden = false; }
function closeModal() { $("modal").hidden = true; $("mBody").innerHTML = ""; }
$("mClose").onclick = closeModal;
$("modal").onclick = function (e) { if (e.target.id === "modal") closeModal(); };
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") { closeModal(); closeMenus(); }
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
      TW = (j.data || []).map(function (x) { return { id: x.user_login, name: x.user_name, sub: x.game_name, v: x.viewer_count, live: 1, title: x.title }; });
      if (LIVEPREV) TW.forEach(function (x) {
        if (!LIVEPREV[x.id] && P.fav["t:" + x.id]) toast("live", (x.name || x.id) + " is live", (x.sub ? x.sub + " · " : "") + (x.title || ""), { a: "tw", k: x.id });
      });
      LIVEPREV = {}; TW.forEach(function (x) { LIVEPREV[x.id] = 1; });
      render();
    }).catch(function (e) { if (e.message === "expired") twDisconnect(); });
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
    render();
  }).catch(function (e) { qBusy = false; QERR = String((e && e.message) || e); render(); });
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
// Telegram on its own, every minute: it is one light request, so posts show up quickly between the full news refreshes
var tgBusy = false;
function fetchTG() {
  if (!sb || !USER || tgBusy || nBusy || !tgSrc().length) return;
  tgBusy = true;
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { tg: tgSrc() } }).then(function (r) {
    tgBusy = false;
    if (r.error || !r.data || !r.data.tg || nBusy) return;
    TGP = unentAll(r.data.tg, ["t", "tx"]);
    newsAlerts(); render();
  }).catch(function () { tgBusy = false; });
}
function fetchNews() {
  if (!sb || !USER || nBusy) return;
  nBusy = true; render();
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { news: newsSrc().map(function (x) { return { id: x.name, urls: x.urls }; }), tg: tgSrc() } }).then(function (r) {
    nBusy = false;
    if (r.error || !r.data || r.data._err) { NERR = (r.error && r.error.message) || (r.data && r.data._err) || "no data"; NERRK = []; }
    else {
      NEWS = unentAll(r.data.news, ["t", "d"]); TGP = unentAll(r.data.tg, ["t", "tx"]); NEWSV++; NLAST = Date.now();
      var ne = r.data.news_err || {};
      NVIA = r.data.news_via || {}; NWHY = r.data.news_why || {}; FNVER = r.data.ver || 0;
      NERRK = Object.keys(ne);
      NERR = NERRK.map(function (k) { return k + " (" + ne[k] + ")"; }).join(" | ");
      newsAlerts(); bigNews();
      setTimeout(maybeBrief, 2500);
    }
    renderSources(); render();
  }).catch(function (e) { nBusy = false; NERR = String((e && e.message) || e); render(); });
}

// ---- What's new since you last looked, what you've opened, and word filters ----
var NSEEN = load("sp_nseen", 0), READ = load("sp_nread", {}), NQ = "", NFILT = false;
if (!NSEEN) { NSEEN = Date.now(); save("sp_nseen", NSEEN); }
function isNewTs(ts) { return ts > NSEEN; }
function markSeen(t) { NSEEN = t || Date.now(); save("sp_nseen", NSEEN); }
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
  gs.sort(function (a, b) { return (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || b[0].ts - a[0].ts; });
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

// ---- Same story from different sources (plain word matching, no AI) ----
var NG = [];
var STOP = {};
("that this with from have will been were about after their there which would could says said into over more than what when they your also just amid " +
 "och att som det för med har inte den till att ett var sig från vid men han hon eller kan ska efter under över mot mellan sedan blir blev finns fick").split(" ").forEach(function (w) { STOP[w] = 1; });
function tokz(t) {
  var s = t.replace(/\s[-|–—]\s[^-|–—]{2,40}$/, ""), set = [], strong = {};
  s.split(/[^\p{L}\p{N}]+/u).forEach(function (w, i) {
    if (!w) return;
    var lw = w.toLowerCase();
    if ((lw.length < 4 && !/^\d{2,}$/.test(lw)) || STOP[lw]) return;
    set.push(lw);
    if (/\d/.test(w) || (i > 0 && w.charAt(0) !== lw.charAt(0))) strong[lw] = 1;
  });
  return { set: set, strong: strong };
}
function groupNews(items) {
  var tk = items.map(function (n) { return tokz(n.t); }), par = items.map(function (_, i) { return i; }), gs = items.map(function (n) { var o = {}; o[n.s] = 1; return o; });
  function find(x) { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; }
  for (var i = 0; i < items.length; i++) for (var j = i + 1; j < items.length; j++) {
    if (items[i].s === items[j].s || Math.abs(items[i].ts - items[j].ts) > 64800000) continue;
    var A = tk[i], B = tk[j], sh = 0, strongSh = 0;
    A.set.forEach(function (w) { if (B.set.indexOf(w) >= 0) { sh++; if (A.strong[w] || B.strong[w]) strongSh++; } });
    if (sh < 3 || strongSh < 1 || sh / Math.min(A.set.length, B.set.length) < 0.5) continue;
    var ra = find(i), rb = find(j);
    if (ra === rb || Object.keys(gs[ra]).some(function (k) { return gs[rb][k]; })) continue;   // never two headlines from one source in a group
    par[ra] = rb; Object.keys(gs[ra]).forEach(function (k) { gs[rb][k] = 1; });
  }
  var by = {};
  items.forEach(function (n, i) { var r = find(i); (by[r] = by[r] || []).push(n); });
  return Object.keys(by).map(function (k) { return by[k].sort(function (a, b) { return b.ts - a.ts; }); });
}

// ---- Your own sources (Settings) ----
function newsSrc() { return P.news || NEWS_SRC; }
function tgSrc() { return P.tg || TG_SRC; }
function ownSrc() {
  if (!P.news) P.news = JSON.parse(JSON.stringify(NEWS_SRC));
  if (!P.tg) P.tg = TG_SRC.slice();
}
function srcMsg(t) { $("srcMsg").textContent = t || ""; }
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
  if (P.news.length >= 12) { srcMsg("That is the maximum (12 news sources)."); return false; }
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
  if (!sb || !USER || rBusy) return;
  var subs = rdSrc();
  if (!subs.length) { RD = []; return; }
  rBusy = true;
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { reddit: { subs: subs, sort: rdSort() } } }).then(function (r) {
    rBusy = false;
    var v = r.data && r.data.reddit;
    if (r.error) RDERR = r.error.message;
    else if (!v) RDERR = "it needs the updated feeds function (redeploy super-function in Supabase)";
    else { RDERR = v.err || ""; if (v.items && (v.items.length || !v.err)) RD = unentAll(v.items, ["t", "d"]); }
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
    '<p class="tools">' + linkBtn(x.u, "Open comments on Reddit") + (x.x ? linkBtn(x.x, "Open the link") : "") + "</p>");
  render();
}
function srcChanged() { persist(); NEWS = []; TGP = []; NEWSV++; NERR = ""; renderSources(); render(); fetchNews(); }
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
    '<p class="tools">' + linkBtn(n.u, "Read the full article") + '<button data-a="nsearch" data-k="' + esc(n.t) + '">Search other coverage</button></p>' + more);
  render();
}
function openTG(u) {
  var g = TGP.filter(function (x) { return x.u === u; })[0];
  if (!g) return;
  markReadUrl(g.u);
  var vid = safeUrl(g.vid), th = safeUrl(g.th), img = safeUrl(g.img) || th;
  var media = vid ? '<video class="mvid" controls playsinline preload="metadata"' + (th ? ' poster="' + esc(th) + '"' : "") + ' src="' + esc(vid) + '"></video>'
    : img ? '<img class="mimg" referrerpolicy="no-referrer" alt="" data-rm="1" src="' + esc(img) + '">' : "";
  openModal(g.s, '<div class="mut">' + esc(g.s) + " · " + when(g.ts) + "</div>" + media + '<p class="nt">' + esc(g.tx || g.t) + "</p><p>" + linkBtn(g.u, "Open on Telegram") + "</p>");
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
  var L = P.notes || [], tab = noteTab(), byNew = function (a, b) { return (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || b.ts - a.ts; };
  var open = L.filter(function (n) { return n.todo && !n.done; }).sort(byNew), done = L.filter(function (n) { return n.todo && n.done; }).sort(byNew), notes = L.filter(function (n) { return !n.todo; }).sort(byNew);
  var draft = $("noteIn") ? $("noteIn").value : "";
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
  openModal("Notes", '<div class="nt2"><div class="seg">' + seg("todo", "To-do", open.length) + seg("note", "Notes", notes.length) + "</div>" + body + "</div>");
  if ($("noteIn")) { $("noteIn").value = draft; if (focus !== false) $("noteIn").focus(); }
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
      if (w) { P.dockW = w; persist(); }
    }
    grip.addEventListener("pointermove", mv); grip.addEventListener("pointerup", up);
  });
})();
function syncDock() { $("dock").hidden = !DOCK.length; document.body.classList.toggle("docked", DOCK.length > 0); }
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
  $("dock").appendChild(w);
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
    c.innerHTML = '<iframe title="Chat" src="https://www.twitch.tv/embed/' + encodeURIComponent(d.id) + "/chat?parent=" + location.hostname + (P.theme === "dark" ? "&darkpopout" : "") + '"></iframe>';
    w.appendChild(c);
  }
  w.classList.toggle("haschat", !!w.querySelector(".dkchat"));
}
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
    if (fx && fx.rates) { RATES.USD = 1; CONV_LIST.forEach(function (x) { if (!x.g && fx.rates[x.c]) RATES[x.c] = 1 / fx.rates[x.c]; }); }
    if (cg) crypto.forEach(function (x) { if (cg[x.g] && cg[x.g].usd) RATES[x.c] = cg[x.g].usd; });
    RATESerr = (fx && fx.rates) || Object.keys(RATES).length ? "" : "Rates unavailable right now.";
    render();
  }).catch(function () { ratesBusy = false; });
}
function conv() { if (!P.conv) P.conv = { amt: 100, from: "USD", to: "EUR" }; return P.conv; }
function convOpts(cur) { return CONV_LIST.map(function (x) { return '<option value="' + x.c + '"' + (x.c === cur ? " selected" : "") + ">" + x.c + "</option>"; }).join(""); }
function convHtml() {
  var c = conv(), out = "—";
  if (RATES[c.from] && RATES[c.to]) out = fmtNum((c.amt * RATES[c.from]) / RATES[c.to]);
  return '<div class="mrow conv">' +
    '<input type="number" id="convAmt" inputmode="decimal" step="any" min="0" value="' + esc(String(c.amt)) + '" aria-label="Amount">' +
    '<select id="convFrom" aria-label="From currency">' + convOpts(c.from) + "</select>" +
    '<button data-a="convswap" aria-label="Swap currencies">⇄</button>' +
    '<select id="convTo" aria-label="To currency">' + convOpts(c.to) + "</select>" +
    '<b id="convOut" title="' + (RATESerr ? esc(RATESerr) : "") + '">' + out + "</b></div>";
}
function fmtNum(n) {
  var d = Math.abs(n) >= 100 ? 0 : Math.abs(n) >= 1 ? 2 : 6;
  return n.toLocaleString("en-GB", { maximumFractionDigits: d });
}
document.addEventListener("input", function (e) {
  if (e.target.id !== "convAmt") return;
  conv().amt = parseFloat(String(e.target.value).replace(",", ".")) || 0; persist();
  var n = $("convOut"); if (n) n.textContent = RATES[conv().from] && RATES[conv().to] ? fmtNum((conv().amt * RATES[conv().from]) / RATES[conv().to]) : "—";
});
document.addEventListener("change", function (e) {
  if (e.target.id === "convFrom") { conv().from = e.target.value; persist(); render(); }
  else if (e.target.id === "convTo") { conv().to = e.target.value; persist(); render(); }
});

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
    else if (e.target.id === "acctEmail" || e.target.id === "acctPass") auth("signInWithPassword");
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
  if (a === "filttoggle") { if (b.checked) delete P.hidden[k]; else P.hidden[k] = true; persist(); render(); return; }
  if (a === "clockmenu2") { e.stopPropagation(); audio(); MENU_OPEN = MENU_OPEN === "clock" ? "" : "clock"; render(); return; }
  if (a === "cogmenu2") { e.stopPropagation(); MENU_OPEN = MENU_OPEN === "cog" ? "" : "cog"; render(); return; }
  if (a === "opennotes") { openNotes(); return; }
  if (a === "acctmenu2") { e.stopPropagation(); MENU_OPEN = MENU_OPEN === "acct" ? "" : "acct"; render(); return; }
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
  if (a === "signout") {
    if (sb) sb.auth.signOut();
    try { ["sp_prefs", "sp_wall", "sp_twitch", "sp_nread", "sp_nalert", "sp_notified", "sp_brief", "sp_nlog", "sp_mailts0", "sp_mailts1", "sp_ytv"].forEach(function (x) { localStorage.removeItem(x); }); } catch (ex) {}
    P = { theme: P.theme, accent: P.accent, colors: P.colors, fs: P.fs, dockW: P.dockW, home: P.home, cities: P.cities, aurora: P.aurora, fav: {}, hidden: {} };
    TW = []; TWC = false; TWUID = null; LIVEPREV = null; MAIL = []; NEWS = []; TGP = []; RD = []; NLOG = []; NEWSV++; READ = {}; YTV = []; QUOTES = {}; NG = []; USER = null;
    loadMailForm(); loadExtraForm();
    applyWall(); MENU_OPEN = ""; render();
    return;
  }
  if (a === "editmode") { EDIT = !EDIT; document.body.classList.toggle("editing", EDIT); MENU_OPEN = ""; render(); return; }
  if (a === "opensettingsloc") { $("panel").hidden = true; openLocationPicker(); return; }
  if (a === "locgo") { locGo(); return; }
  if (a === "locpick") { locPick(+k); return; }
  if (a === "setpanel") { MENU_OPEN = ""; render(); $("panel").hidden = false; return; }
  if (a === "openhelp") { MENU_OPEN = ""; render(); openHelp(); return; }
  if (a === "helpjump") { var sec = $("help-" + k); if (sec) sec.scrollIntoView({ block: "start" }); return; }
  if (a === "copycode") {
    var code = $("gsCode").textContent;
    (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(function () {
      b.textContent = "Copied!"; setTimeout(function () { b.textContent = "Copy the code"; }, 2000);
    }).catch(function () { alert("Could not copy automatically. Select the text below and copy it manually (Ctrl+C or Cmd+C)."); });
    return;
  }
  if (a === "convswap") { var c = conv(), t = c.from; c.from = c.to; c.to = t; persist(); render(); return; }
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
  if (a === "nseen") { markSeen(); render(); return; }
  if (a === "refresh") { refreshBox(k); return; }
  if (a === "nsearch") { window.open("https://news.google.com/search?q=" + encodeURIComponent(k), "_blank", "noopener"); return; }
  if (a === "open") { var ch = k.charAt(0); if (ch === "t") watchTwitch(k.slice(2)); else if (ch === "v") openYT(k.slice(2)); else if (ch === "a") openNews(k.slice(2)); else if (ch === "m") openTG(k.slice(2)); else if (ch === "r") openReddit(k.slice(2)); else openStock(k.slice(2)); return; }
  if (a === "fav") P.fav[k] = !P.fav[k];
  if (a === "hide") P.hidden[k] = true;
  if (a === "show") delete P.hidden[k];
  persist();
  render();
});
$("closeBtn").onclick = function () { $("panel").hidden = true; };
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
function setMsg(t) { ACCTMSG = t || ""; render(); }
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
}
function onUser(u) {
  USER = u; renderAccount(); render();
  if (!u) return;
  loadWall(u);
  sb.from("user_prefs").select("prefs").eq("user_id", u.id).maybeSingle().then(function (r) {
    if (r.error) { setMsg("Could not load your settings: " + r.error.message); return; }
    if (r.data && r.data.prefs && r.data.prefs.theme) {
      P = Object.assign({ theme: "dark", accent: DEFAULT_ACCENT, fav: {}, hidden: {} }, r.data.prefs);
      save("sp_prefs", P); applyTheme(); render();
    } else { persist(); }
    fetchQuotes(); fetchTwitch(); fetchYT(); fetchNews(); fetchMail(); fetchReddit(); loadMailForm(); loadExtraForm(); renderSources(); renderClocks(); fetchWeather(); fetchClockTz();
  });
}
function auth(fn) {
  if (!sb) { setMsg("Supabase did not load. Check config.js and your connection."); return; }
  var c = { email: $("acctEmail").value.trim(), password: $("acctPass").value };
  if (!c.email || !c.password) { setMsg("Enter your email and password."); return; }
  if (fn === "signUp" && c.password.length < 8) { setMsg("Use a password of at least 8 characters."); return; }
  if (fn === "signUp") c.options = { emailRedirectTo: location.href.split("#")[0] };
  setMsg("Working...");
  sb.auth[fn](c).then(function (r) {
    if (r.error) setMsg(r.error.message);
    else if (fn === "signUp" && !r.data.session) setMsg("Check your email to confirm your account, then sign in.");
    else setMsg("");
  });
}
function initAuth() {
  renderAccount();
  if (!sb) return;
  sb.auth.onAuthStateChange(function (ev, session) {
    var u = session ? session.user : null;
    if ((u && u.id) !== (USER && USER.id)) setTimeout(function () { onUser(u); }, 0);
  });
}
function openHelp() {
  var toc = [
    ["signin", "Signing in"], ["weather", "Weather &amp; Location"], ["mail", "Mail (Gmail)"], ["stocks", "Stocks"],
    ["news", "News &amp; Telegram"], ["twitch", "Twitch"], ["youtube", "YouTube"], ["convert", "Currency converter"],
    ["timers", "Timers, countdowns &amp; stopwatch"], ["notes", "Notes"], ["wallpaper", "Wallpaper"],
    ["edit", "Colors, text size &amp; layout"], ["dock", "Watching while you browse"], ["reddit", "Reddit"], ["cal", "Calendar"],["ntf", "Notifications &amp; summary"], ["keys", "Search &amp; shortcuts"],["account", "Account &amp; privacy"]
  ];
  var html = '<p class="mut">Jump to a section:</p><div class="helptoc">' +
    toc.map(function (t) { return '<button data-a="helpjump" data-k="' + t[0] + '">' + t[1] + "</button>"; }).join("") + "</div>";

  html += '<h3 id="help-signin">Signing in</h3><p>Click the person icon (top right area of the site, in the row of small icons). Enter an email and password and press <b>Create account</b>. Once you\'re signed in, everything you set up is saved and will still be there next time, on any device.</p>';

  html += '<h3 id="help-weather">Weather &amp; Location</h3><p>There are two separate places to set a city:</p><ol><li><b>The weather tile</b> shows the forecast for one city. Click the tile, type a city name, click a result, then press <b>Use for the tile</b>.</li><li><b>The date and time at the top of the page</b> uses a different city. Open the cogwheel icon &rarr; <b>Settings</b> &rarr; <b>Location &amp; alarms</b> &rarr; <b>Change</b>, type a city, and click <b>Use</b> next to it.</li></ol><p>Changing one does not change the other.</p>';

  html += '<h3 id="help-mail">Mail (Gmail)</h3><p>This shows how many unread emails you have, without giving the site your Google password. It needs a small piece of free code pasted into your own Google account, once per inbox. It looks technical, but it is entirely copy and paste &mdash; follow every step below in order.</p>' +
    '<ol>' +
    '<li>Go to <a href="https://script.google.com" target="_blank" rel="noopener">script.google.com</a> and make sure you are signed in as the Gmail account you want to show (top right corner of the page).</li>' +
    '<li>Click <b>New project</b> (top left).</li>' +
    '<li>You will see some sample code already in the box. Click inside that box, press Ctrl+A (or Cmd+A on a Mac) to select everything, then press Delete.</li>' +
    '<li>Click the button below to copy the correct code, then click inside the empty box and paste it (Ctrl+V or Cmd+V).</li>' +
    '</ol>' +
    '<div class="codebox"><button class="lnk2 copybtn" data-a="copycode">Copy the code</button><pre id="gsCode">' + '// Paste this whole file into your Apps Script project (replace what is there), then\n// Deploy &gt; Manage deployments &gt; pencil &gt; Version: New version &gt; Deploy.\nfunction out(text) {\n  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);\n}\n\nfunction doGet(e) {\n  try {\n    return handle(e);\n  } catch (err) {\n    return out(JSON.stringify({ error: String(err &amp;&amp; err.message ? err.message : err) }));\n  }\n}\n\nfunction handle(e) {\n  var p = PropertiesService.getScriptProperties();\n  var token = p.getProperty(&quot;T&quot;);\n  var given = e &amp;&amp; e.parameter ? e.parameter.t : &quot;&quot;;\n  if (!token) {\n    if (given) return out(JSON.stringify({ error: &quot;Open this address in your browser with nothing after /exec to get your token.&quot; }));\n    token = Utilities.getUuid();\n    p.setProperty(&quot;T&quot;, token);\n    return out(JSON.stringify({ setup: &quot;Copy this token into the site (Settings, Gmail accounts). It is shown only once.&quot;, token: token }));\n  }\n  if (given !== token) return out(JSON.stringify({ error: &quot;Wrong token&quot; }));\n\n  var since = parseInt(e.parameter.since, 10) || 0;   // seconds; the moment you pressed &quot;Mark read&quot; on the site\n  var cache = CacheService.getScriptCache();\n  var key = &quot;m&quot; + since;\n  var hit = cache.get(key);\n  if (hit) return out(hit);\n\n  var email = Session.getEffectiveUser().getEmail();\n  var items = GmailApp.search(&quot;in:inbox is:unread&quot;, 0, 20).map(function (t) {\n    var msgs = t.getMessages();\n    var m = msgs[msgs.length - 1];\n    return {\n      from: m.getFrom(),\n      subject: m.getSubject(),\n      snippet: m.getPlainBody().replace(/\\s+/g, &quot; &quot;).slice(0, 200),\n      ts: m.getDate().getTime(),\n      link: &quot;https://mail.google.com/mail/?authuser=&quot; + encodeURIComponent(email) + &quot;#inbox/&quot; + t.getId()\n    };\n  }).sort(function (a, b) { return b.ts - a.ts; });\n  var fresh = since ? GmailApp.search(&quot;in:inbox is:unread after:&quot; + since, 0, 30).length : null;\n  var text = JSON.stringify({ email: email, unread: GmailApp.getInboxUnreadCount(), fresh: fresh, items: items });\n  cache.put(key, text, 120);\n  return out(text);\n}\n\n// Run this once from the editor only if you lose the token and need a new one.\nfunction resetToken() {\n  PropertiesService.getScriptProperties().deleteProperty(&quot;T&quot;);\n}\n' + '</pre></div>' +
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
    '<li>Go back to this site, open <b>Settings</b> (cogwheel icon) &rarr; <b>Connections</b> &rarr; <b>Gmail accounts</b>. Paste in a name (e.g. "Personal"), the web app address, and the token, then press <b>Save Gmail accounts</b>.</li>' +
    '<li>Wait about a minute and your unread count will appear on the site.</li>' +
    '</ol><p class="mut">To add a second inbox, repeat all of the steps above while signed in to that other Gmail account.</p>';

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
    '</ol></li></ol>';

  html += '<h3 id="help-news">News &amp; Telegram</h3><p>Open <b>Settings</b> &rarr; <b>News &amp; Telegram sources</b>.</p><ul><li><b>To add a news source:</b> type a website like <code>reuters.com</code> in the box (a name is optional) and press Add.</li><li><b>To add a Telegram channel:</b> type its name (for example <code>ClashReport</code>) or paste a t.me link, and press Add.</li><li>Click the ✕ next to any source to remove it, or <b>Back to default sources</b> to start over.</li><li>Each of the News and Telegram tiles has its own <b>Sources</b> button, to temporarily hide one source without deleting it.</li></ul>' +
    '<p><b>Reading the news:</b> headlines that arrived since you last looked get an accent bar and a <b>new</b> counter in the tile header (click it to mark everything seen; being away for 2+ minutes does that automatically). Headlines you already opened are dimmed. The same story from several sources is merged into one line with a source count, and stories many sources picked up in the last 3 hours are marked <b>hot</b>. Use the filter box above the list to find a topic.</p>' +
    '<p><b>Filters &amp; alerts</b> (Settings &rarr; News &amp; Telegram sources): <i>Mute words</i> hide every headline containing them; <i>Highlight words</i> mark matching headlines and notify you when a new one appears.</p>';

  html += '<h3 id="help-twitch">Twitch</h3><p>Open <b>Settings</b> &rarr; <b>Connections</b> &rarr; press <b>Connect</b> next to Twitch, log in if asked, and approve access. The tile will then show who you follow that is currently live. Click a name to watch inside the page.</p>' +
    '<p><b>Ads even though you have Turbo or a sub?</b> The player inside this page is a Twitch &ldquo;embed&rdquo;. Your browser treats it as a third-party site and hides your twitch.tv login cookie from it, so Twitch thinks you are logged out and plays ads. Two fixes:</p><ol>' +
    '<li><b>Pop out</b> (works everywhere): press <b>Pop out</b> on a stream, or turn on <b>Settings &rarr; Connections &rarr; Open streams in a pop-out window</b>. The pop-out is twitch.tv itself, so your login, Turbo and subs work. Allow pop-ups for this site if the browser asks.</li>' +
    '<li><b>Let the embed see your login</b>: allow third-party cookies for Twitch only.<ul>' +
    '<li>Chrome: Settings &rarr; Privacy and security &rarr; Third-party cookies &rarr; <i>Sites allowed to use third-party cookies</i> &rarr; Add &rarr; <code>[*.]twitch.tv</code>.</li>' +
    '<li>Edge: Settings &rarr; Cookies and site permissions &rarr; Manage and delete cookies &rarr; <i>Allow</i> &rarr; Add <code>[*.]twitch.tv</code> (and set Tracking prevention to Balanced, not Strict).</li>' +
    '<li>Firefox: Settings &rarr; Privacy &amp; Security &rarr; Cookies and Site Data &rarr; Manage Exceptions &rarr; add <code>https://www.twitch.tv</code> and <code>https://player.twitch.tv</code> as <i>Allow</i>.</li>' +
    '<li>Brave: click the lion icon on this site &rarr; Advanced &rarr; Cookies: <i>Allow all</i>.</li>' +
    '<li>Safari: cross-site tracking prevention cannot be relaxed per site, so use Pop out.</li></ul>Then make sure you are logged in at twitch.tv in the same browser and reload this page.</li></ol>' +
    '<p>Tip: mark streamers with ★ (Edit mode) to get a notification when they go live.</p>';

  html += '<h3 id="help-keys">Search &amp; keyboard shortcuts</h3><p>Type in the small search box at the top (press <code>/</code> to jump to it) and press Enter. A site name like <code>reuters.com</code> opens the site; anything else goes to your search engine (choose it in Settings). Start or end with a &ldquo;bang&rdquo; to search a specific site: <code>!yt</code> YouTube, <code>!tw</code> Twitch, <code>!r</code> Reddit, <code>!w</code> Wikipedia, <code>!gh</code> GitHub, <code>!maps</code> Google Maps, <code>!news</code> Google News, <code>!tv</code> TradingView symbol, <code>!a</code> Amazon, <code>!g</code> Google, <code>!ddg</code> DuckDuckGo. Ctrl+Enter opens in a new tab.</p>' +
    '<p>Shortcuts (when you are not typing in a box): <code>/</code> search · <code>r</code> refresh everything · <code>e</code> edit layout · <code>n</code> notes · <code>c</code> calendar · <code>b</code> summary · <code>s</code> settings · <code>t</code> light/dark · <code>?</code> this help · <code>Esc</code> close.</p>';

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

  html += '<h3 id="help-convert">Currency converter</h3><p>Type an amount, choose the two currencies (a few major cryptocurrencies are included), and use the ⇄ button to swap them. This works even if you are not signed in.</p>';

  html += '<h3 id="help-timers">Timers, countdowns &amp; stopwatch</h3><p>Click the clock icon and choose Timer, Countdown or Stopwatch. A finished timer or countdown keeps ringing every few seconds until you press <b>Stop</b> or remove it, so it is hard to miss. You can set how loud it rings in <b>Settings</b> &rarr; <b>Location &amp; alarms</b> &rarr; <b>Alarm volume</b>.</p>';

  html += '<h3 id="help-notes">Notes &amp; to-dos</h3><p>Click the notepad icon (or press <code>n</code>). There are two tabs. <b>To-do:</b> type a task and press Enter; click the circle to tick it off (finished tasks move under <i>Completed</i>, which you can open or clear). <b>Notes:</b> write in the first card and press Save (or Ctrl+Enter). In both, click any text to edit it in place, and hover for pin ★ and delete ✕. The number on the icon is how many to-dos are open.</p>';
  html += '<h3 id="help-reddit">Reddit</h3><p>The Reddit box shows posts from your subreddits. Add or remove them in <b>Settings &rarr; News, Telegram &amp; Reddit sources</b>. In the box, choose <b>Hot</b> or <b>New</b>, and use <b>Sources</b> to hide a subreddit without removing it. Hover a post for a preview, click for the text and links. Move and resize the box in Edit mode like the others.</p>';
  html += '<h3 id="help-cal">Calendar &amp; reminders</h3><p>Click the calendar icon (or press <code>c</code>). Pick a day, type an event, optionally set a time, a reminder and a repeat, and press Add. Days with events have a dot, and the number on the icon is today\'s events. A reminder shows as a notification in the bottom-right corner and stays until you dismiss it (all-day events count as 09:00). Reminders only fire while this page is open in a tab.</p>';
  html += '<h3 id="help-ntf">Notifications &amp; summary</h3><p>Small cards appear in the bottom-right corner for: the same story from several of your sources within two hours, a headline with one of your highlight words, a stock on your list moving fast or far, a ★ streamer going live, new mail, and calendar reminders. Click a card to open it, ✕ to dismiss. The <b>bell</b> in the menu box keeps the last 30, and its number is how many you have not looked at; opening it clears the number. Hover the mail tile to see your latest unread subjects. Everything can be turned on or off and tuned in <b>Settings &rarr; Notifications</b>, including the ping sound and whether to also send desktop notifications (which also keeps news, stocks and Twitch updating while the tab is in the background).</p>' +
    '<p><b>Summary:</b> on your first visit each day a small "Since yesterday" window shows weather warnings, today\'s events, top stories, biggest movers, mail and who is live. Open it any time from the cogwheel menu or with <code>b</code>.</p>' +
    '<p><b>Hover previews:</b> rest the mouse on a news headline or Telegram post to see its picture and text without opening it. <b>Stocks:</b> click a stock to see its chart plus recent news and comments about it.</p>';

  html += '<h3 id="help-wallpaper">Wallpaper</h3><p>Open <b>Settings</b> &rarr; <b>Wallpaper</b>. Click <b>Choose image</b> to pick a picture, then choose how it should fit the screen: Fill, Fit, or Original size. Press <b>Reposition</b> to drag the image where you want it, then press <b>Done</b>.</p>';

  html += '<h3 id="help-edit">Colors, text size &amp; layout</h3><p><b>Settings</b> &rarr; <b>Appearance</b> covers the theme, every color, and overall text size.</p><p>To move or resize the boxes themselves, click the cogwheel icon and choose <b>Edit</b>. Each box then shows small buttons: ◀ / ▶ move it earlier or later, W&minus; / W+ make it narrower or wider, T&minus; / T+ change that box\'s own text size, and (on lists) H&minus; / H+ show fewer or more rows. You can also drag a box by its title. Click <b>Done</b> in the same menu to finish.</p>';

  html += '<h3 id="help-dock">Watching while you browse</h3><p>Open a Twitch stream or a YouTube video and press <b>Dock on the left</b>. It keeps playing in a strip on the left side while you use the rest of the site. You can dock up to 3 at once, and drag the edge of that strip to resize it.</p>';

  html += '<h3 id="help-account">Account &amp; privacy</h3><p>Open <b>Settings</b> &rarr; <b>Account</b> to set a new password once you are signed in. If you forget your password, click the person icon, then <b>Forgot password?</b>, and a reset link will be emailed to you. Everything you set up is private to your own account &mdash; nobody else using this site can see it. <b>Settings &rarr; Backup</b> downloads everything as a file you can restore later.</p>';

  openModal("Help", html);
}
function acctHtml() {
  if (USER) return '<div class="menu acctpop" role="menu"><div class="mut sn">' + esc(USER.email) + '</div><button role="menuitem" data-a="signout">Sign out</button></div>';
  return '<div class="menu acctpop" role="menu"><input type="text" id="acctEmail" placeholder="Email" autocomplete="email"><input type="password" id="acctPass" placeholder="Password (8+ characters)" autocomplete="current-password"><div class="acts"><button data-a="signin">Sign in</button><button data-a="signup">Create</button></div><button class="lnk2" data-a="forgotpw">Forgot password?</button>' + (ACCTMSG ? '<div class="mut sn">' + esc(ACCTMSG) + "</div>" : "") + "</div>";
}

// ---- Notifications: small cards in the bottom-right corner ----
function NTF() { return Object.assign({ news: true, words: true, stock: true, live: true, cal: true, mail: true, sound: true, desktop: false, srcN: 2, pct: 3, day: 5 }, P.ntf || {}); }
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
var TOASTS = {}, toastN = 0, TICON = { news: "●", words: "★", stock: "↕", live: "▶", cal: "◷", mail: "✉" };
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
  render();
}
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
    var close = g.filter(function (x) { return newest - x.ts < 7200000; });
    if (close.length < Math.max(2, n.srcN) || sent >= 2 || !once("bn:" + g[g.length - 1].u)) return;
    sent++;
    toast("news", g[0].t, close.length + " sources · " + close.map(function (x) { return x.s; }).join(", "), { a: "news", k: g[0].u });
  });
}
// Stocks: a fast move (compared with the price up to 35 minutes ago) or a big move on the day
var QH = {};
function stockAlerts(data) {
  var n = NTF(), now = Date.now(), sent = 0;
  if (n.stock === false || !P.stocks) return;
  P.stocks.forEach(function (x) {
    var s = tk(x.id), q = data[s];
    if (!q || !q.p || P.hidden["s:" + x.id]) return;
    var h = QH[s] = (QH[s] || []).filter(function (o) { return now - o.t < 2100000; });
    var today = q.c != null ? (q.c >= 0 ? "+" : "") + q.c.toFixed(1) + "% today" : "", go = { a: "stock", k: x.id };
    if (h.length) {
      var pc = (q.p - h[0].p) / h[0].p * 100;
      if (Math.abs(pc) >= n.pct && sent < 3 && once("sf:" + s + (pc > 0 ? "u" : "d") + Math.floor(now / 1800000))) {
        sent++;
        toast("stock", s + (pc > 0 ? " ▲ +" : " ▼ ") + pc.toFixed(1) + "% in " + Math.max(1, Math.round((now - h[0].t) / 60000)) + " min", "Now " + q.p.toFixed(2) + (today ? " · " + today : ""), go);
      }
    }
    h.push({ t: now, p: q.p });
    if (q.c != null && Math.abs(q.c) >= n.day && sent < 3 && once("sd:" + s + (q.c > 0 ? "u" : "d") + ymd(new Date()))) {
      sent++;
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
function evsOn(ds) { return (P.cal || []).filter(function (e) { return evOn(e, ds); }).sort(function (a, b) { return (a.tm || "").localeCompare(b.tm || ""); }); }
var CALV = null, REPS = { "": "Once", d: "Daily", w: "Weekly", m: "Monthly", y: "Yearly" }, REMS = [["", "No reminder"], ["0", "At the time"], ["5", "5 min before"], ["15", "15 min before"], ["30", "30 min before"], ["60", "1 hour before"], ["1440", "1 day before"]];
function dayLabel(ds) { return new Date(ds + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }
function openCal() {
  var now = new Date(), today = ymd(now);
  if (!CALV) CALV = { y: now.getFullYear(), m: now.getMonth(), sel: today };
  var start = (new Date(CALV.y, CALV.m, 1).getDay() + 6) % 7, days = new Date(CALV.y, CALV.m + 1, 0).getDate(), cells = "";
  ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].forEach(function (d) { cells += "<i>" + d + "</i>"; });
  for (var i = 0; i < start; i++) cells += "<span></span>";
  for (var d = 1; d <= days; d++) {
    var ds = CALV.y + "-" + pad2(CALV.m + 1) + "-" + pad2(d);
    cells += '<button data-a="calday" data-k="' + ds + '" class="' + (ds === today ? "td " : "") + (ds === CALV.sel ? "on" : "") + '">' + d + (evsOn(ds).length ? "<u></u>" : "") + "</button>";
  }
  var evRow = function (e, ds, withDay) {
    return '<div class="row"><span>' + (withDay ? '<button class="lnk" data-a="caljump" data-k="' + ds + '"><b class="ctm">' + dayLabel(ds) + "</b></button> " : "") + '<b class="ctm">' + (e.tm || "all day") + "</b> " + esc(e.t) +
      (e.rep ? " <small>↻ " + REPS[e.rep].toLowerCase() + "</small>" : "") + (e.rem != null ? ' <small title="Reminder">◷ ' + (e.rem ? (e.rem >= 1440 ? "1d" : e.rem >= 60 ? "1h" : e.rem + "m") : "on time") + "</small>" : "") +
      "</span>" + (withDay ? "" : '<button data-a="caldel" data-k="' + e.id + '" aria-label="Delete event">✕</button>') + "</div>";
  };
  var up = [];
  for (var k = 1; k <= 90 && up.length < 5; k++) {
    var uds = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + k));
    evsOn(uds).forEach(function (e) { if (up.length < 5) up.push(evRow(e, uds, true)); });
  }
  var draft = $("calT") ? $("calT").value : "";
  openModal("Calendar", '<div class="calwrap"><div><div class="calh"><button data-a="calnav" data-k="-1" aria-label="Previous month">◀</button><b>' +
    new Date(CALV.y, CALV.m, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) + '</b><button data-a="calnav" data-k="1" aria-label="Next month">▶</button><button data-a="calnav" data-k="0">Today</button></div><div class="calg">' + cells + "</div></div>" +
    '<div class="calr"><h3>' + (CALV.sel === today ? "Today · " : "") + dayLabel(CALV.sel) + "</h3>" + (evsOn(CALV.sel).map(function (e) { return evRow(e, CALV.sel); }).join("") || '<p class="mut sn">Nothing planned.</p>') +
    '<form id="calAdd" class="cadd"><input type="text" id="calT" placeholder="Add an event…" maxlength="120"><input type="time" id="calTm" aria-label="Time (empty = all day)" title="Time (leave empty for all day)">' +
    '<select id="calRem" aria-label="Reminder">' + opts(REMS, "") + '</select><select id="calRep" aria-label="Repeat">' + opts(Object.keys(REPS).map(function (r) { return [r, REPS[r]]; }), "") + '</select><button class="pri">Add</button></form>' +
    (up.length ? "<h3>Coming up</h3>" + up.join("") : "") + "</div></div>");
  if ($("calT")) $("calT").value = draft;
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
function hidePeek() { clearTimeout(peekT); peekKey = ""; $("peek").hidden = true; }
var PEEKSEL = '#grid [data-a="open"], #grid .mailcell[data-a="mail"]';
document.addEventListener("mouseover", function (e) {
  var b = e.target.closest && e.target.closest(PEEKSEL), mail = b && b.dataset.a === "mail", k = b && (mail ? "mail:" + b.dataset.k : b.dataset.k);
  if (!b || !(mail || /^[amr]:/.test(k))) return;
  if (k === peekKey) return;
  clearTimeout(peekT); peekKey = k;
  peekT = setTimeout(function () {
    if (peekKey !== k || !document.contains(b) || !$("modal").hidden) return;
    if (mail) showMailPeek(b, +b.dataset.k); else showPeek(b, k);
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
function briefHtml() {
  var now = Date.now(), cut = now - 86400000, h = "", sec = function (t, body) { return body ? "<h3>" + t + "</h3>" + body : ""; };
  var warn = WX ? wxWarn(WX) : [];
  if (warn.length) h += '<div class="warnbox">' + warn.map(function (x) { return "<div><b>! " + x.t + "</b> " + x.day.toLowerCase() + (x.x ? " · " + esc(x.x) : "") + "</div>"; }).join("") + "</div>";
  var todayEv = evsOn(ymd(new Date()));
  h += sec("Today in your calendar", todayEv.map(function (e) { return '<div class="row"><span><b class="ctm">' + (e.tm || "all day") + "</b> " + esc(e.t) + "</span></div>"; }).join(""));
  var top = NEWS.length ? newsGroups().filter(function (g) { return g[0].ts > cut; }).sort(function (a, b) { return b.length - a.length || (b.hi ? 1 : 0) - (a.hi ? 1 : 0) || b[0].ts - a[0].ts; }).slice(0, 6) : [];
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
$("srch").addEventListener("submit", function (e) {
  e.preventDefault();
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
}
function setWords() { P.nwords = { mute: $("nwMute").value.trim(), hi: $("nwHi").value.trim() }; persist(); render(); }
$("nwMute").onchange = setWords; $("nwHi").onchange = setWords;
$("twPopOn").onchange = function () { P.twPop = this.checked; persist(); };
// Notification settings: [input id, name in P.ntf, (for numbers) lowest, highest]
var NF_BOX = [["nfNews", "news"], ["nfWords", "words"], ["nfStock", "stock"], ["nfLive", "live"], ["nfCal", "cal"], ["nfMail", "mail"], ["nfSound", "sound"], ["nfDesktop", "desktop"]];
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
    persist(); applyTheme(); applyWall(); loadMailForm(); loadExtraForm(); renderSources(); renderClocks();
    NEWS = []; TGP = []; NEWSV++; MAIL = [];
    render(); refreshAll(true);
    $("bkMsg").textContent = "Restored.";
  };
  fr.readAsText(f);
};

// ---- Keyboard shortcuts (when you are not typing in a box) ----
function refreshAll(force) { fetchNews(); fetchQuotes(force); fetchTwitch(); fetchYT(); fetchMail(); fetchReddit(); fetchWeather(); fetchRates(); }
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
  var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  if (typing || !$("modal").hidden) return;
  var k = e.key;
  if (k === "/") { e.preventDefault(); openSearch(); }
  else if (k === "e") { EDIT = !EDIT; document.body.classList.toggle("editing", EDIT); render(); }
  else if (k === "n") openNotes();
  else if (k === "c") { CALV = null; openCal(); }
  else if (k === "b") openBrief();
  else if (k === "s") $("panel").hidden = !$("panel").hidden;
  else if (k === "r") refreshAll(true);
  else if (k === "t") { P.theme = P.theme === "dark" ? "light" : "dark"; persist(); applyTheme(); }
  else if (k === "?") openHelp();
});

// ---- Only poll while the page is visible (saves your Supabase / API quotas); catch up when you come back ----
var HIDDEN_AT = 0;
function every(ms, fn, inBackground) { setInterval(function () { if (!document.hidden || (inBackground && inBackground())) fn(); }, ms); }
document.addEventListener("visibilitychange", function () {
  if (document.hidden) { HIDDEN_AT = Date.now(); return; }
  tick(); tickClocks();
  // Away for more than 2 minutes: what was on screen when you left counts as seen, so only newer items are marked new
  if (HIDDEN_AT && Date.now() - HIDDEN_AT > 120000) { markSeen(HIDDEN_AT); refreshAll(); }
  else render();
  HIDDEN_AT = 0;
});

$("ver").textContent = VERSION;
applyTheme(); applyWall(); tick(); render(); initAuth(); fetchWeather(); fetchClockTz(); fetchRates();
$("twBtn").onclick = function () { if (twToken()) twDisconnect(); else if (window.TWITCH_CLIENT_ID) twConnect(); };
fetchTwitch(); loadMailForm(); loadExtraForm(); renderSources(); renderClocks();
every(900000, fetchWeather); every(300000, fetchRates);
// With desktop notifications on, the things that can notify keep updating while the tab is in the background
function bg(kind) { return function () { var n = NTF(); return !!n.desktop && n[kind] !== false; }; }
every(60000, fetchTwitch, bg("live"));
every(120000, fetchNews, function () { return bg("news")() || bg("words")(); });
every(60000, fetchTG, bg("words"));
every(300000, fetchQuotes, bg("stock")); every(600000, fetchYT); every(300000, fetchMail, bg("mail")); every(300000, fetchReddit); every(300000, checkUpdate);
setInterval(tick, 1000);
