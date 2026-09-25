var VERSION = 22;

// ---- Twitch login return (runs first, before Supabase reads the URL) ----
(function () {
  var h = location.hash || "", m = h.match(/access_token=([^&]+)/);
  if (h.indexOf("state=twitch") < 0 || !m) return;
  try { localStorage.setItem("sp_twitch", m[1]); } catch (e) {}
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
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

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
  $("cBg").value = c.bg; $("cCard").value = c.card; $("cFg").value = c.fg; $("cMut").value = c.mut; $("cAlpha").value = c.a;
}
function applyWall() {
  var w = null;
  try { w = localStorage.getItem("sp_wall"); } catch (e) {}
  $("wall").style.backgroundImage = w ? "url(" + w + ")" : "none";
}
function setWall(file) {
  var fr = new FileReader();
  fr.onload = function () {
    var im = new Image();
    im.onload = function () {
      var s = Math.min(1, 1600 / im.width), c = document.createElement("canvas");
      c.width = im.width * s; c.height = im.height * s;
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      try { localStorage.setItem("sp_wall", c.toDataURL("image/jpeg", 0.75)); } catch (e) { alert("That image is too large to save. Try a smaller one."); }
      applyWall(); syncWall(false);
    };
    im.src = fr.result;
  };
  fr.readAsDataURL(file);
}

// ---- Date and day (Tallinn time) ----
function tick() {
  var d = new Date(), tz = { timeZone: "Europe/Tallinn" };
  $("day").textContent = d.toLocaleDateString("en-GB", Object.assign({ weekday: "long" }, tz));
  $("date").textContent = d.toLocaleDateString("en-GB", Object.assign({ day: "numeric", month: "long", year: "numeric" }, tz)) +
    " · " + d.toLocaleTimeString("en-GB", Object.assign({ hour: "2-digit", minute: "2-digit" }, tz)) + " · Tallinn";
}

// ---- Rows with favorite / hide controls in edit mode ----
function row(key, main, sub, right, op) {
  var f = P.fav[key];
  var ed = EDIT ? '<button data-a="fav" data-k="' + esc(key) + '" aria-label="Favorite">' + (f ? "★" : "☆") + '</button><button data-a="hide" data-k="' + esc(key) + '" aria-label="Hide">✕</button>' : "";
  return '<div class="row"><span>' + (f ? '<i class="fv">★</i>' : "") + (op ? '<button class="lnk" data-a="open" data-k="' + esc(typeof op === "string" ? op : key) + '">' + main + "</button>" : main) + (sub ? " <small>" + esc(sub) + "</small>" : "") +
    '</span><span class="r">' + right + ed + "</span></div>";
}
function shown(key) { return !P.hidden[key]; }
function favFirst(a, b) { return (P.fav[b.key] ? 1 : 0) - (P.fav[a.key] ? 1 : 0); }
function card(cls, title, body) { return '<div class="card ' + cls + '"><h3>' + title + "</h3>" + body + "</div>"; }

var ALL_IDS = ["weather", "mail", "live", "menu", "news", "telegram", "twitch", "youtube", "stocks"];
var DEF_C = { weather: 3, mail: 3, live: 4, menu: 2, news: 6, telegram: 6, twitch: 4, youtube: 4, stocks: 4 };
var COMPACT = ["weather", "mail", "live", "menu"];
var LISTS = ["news", "telegram", "twitch", "youtube", "stocks"];
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
  else L.rows[id] = Math.max(3, Math.min(20, (L.rows[id] || (id === "news" || id === "telegram" ? 6 : 10)) + d));
  persist(); render();
}
function tile(id, title, body, click, hx) {
  var c = LAY().c[id] || DEF_C[id] || 3, t = "", at = "", cp = COMPACT.indexOf(id) >= 0;
  if (click) {
    var pr = typeof click === "string" ? click.split(":") : ["weather"];
    at = ' data-a="' + pr[0] + '"' + (pr[1] != null ? ' data-k="' + pr[1] + '"' : "") + ' tabindex="0" role="button"';
  }
  if (EDIT) {
    var bt = function (act, d, label) { return '<button data-a="' + act + '" data-k="' + id + ":" + d + '">' + label + "</button>"; };
    t = '<div class="tools">' + bt("mv", -1, "◀ Earlier") + bt("mv", 1, "Later ▶") + bt("w", -1, "Narrower") + bt("w", 1, "Wider") + bt("f", -1, "Text −") + bt("f", 1, "Text +") + (LISTS.indexOf(id) >= 0 ? bt("h", -1, "Shorter") + bt("h", 1, "Taller") : "") + "</div>";
  }
  var h3 = "<h3" + (EDIT ? ' class="grab" draggable="true" title="Drag to move"' : "") + ">" + title + "</h3>";
  var head = cp ? (EDIT ? '<span class="grab dh" draggable="true" title="Drag to move">⠿</span>' : "") : '<div class="th">' + h3 + (hx ? '<div class="hc">' + hx + "</div>" : "") + "</div>";
  return '<div class="card c' + c + (cp ? " compact" : "") + (id === "menu" && MENU_OPEN ? " menuopen" : "") + (click ? " click" : "") + '" data-id="' + id + '" style="--fs:' + fsOf(id).toFixed(2) + '"' + at + ">" + head + t + body + "</div>";
}
function opts(list, cur) { return list.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === cur ? " selected" : "") + ">" + o[1] + "</option>"; }).join(""); }
function ico(id, logo) {
  var t = tk(id), h = 0;
  for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 360;
  var cr = /^[A-Z0-9]{2,10}USDT?$/.test(t) ? t.replace(/USDT?$/, "").toLowerCase() : "";
  var src = logo || (cr ? "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color/" + cr + ".png" : "");
  return '<span class="ic" style="--h:' + h + '"><i>' + esc(t.replace(/[^A-Za-z0-9]/g, "").slice(0, 2)) + "</i>" + (src ? '<img alt="" loading="lazy" referrerpolicy="no-referrer" src="' + esc(src) + '" onerror="this.remove()">' : "") + "</span>";
}
function hd(t, n) { return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, "") + "…" : t; }
function fsOf(id) { return (P.fs || 1) * (LAY().fs[id] || 1); }
function lst(id, html, def) { var r = LAY().rows[id] || def || 10; return '<div class="list" style="max-height:' + Math.round(r * 36 * fsOf(id)) + 'px">' + html + "</div>"; }
function ago(ts) { var m = Math.max(1, Math.round((Date.now() - ts) / 60000)); return m < 60 ? m + "m" : m < 1440 ? Math.round(m / 60) + "h" : Math.round(m / 1440) + "d"; }

function render() {
  var D = DATA, T = {};
  var t = WX ? Math.round(WX.current.temperature_2m) : D.weather.temp;
  var note = WX ? wxText(WX.current.weather_code) + " · feels " + Math.round(WX.current.apparent_temperature) + "°" : D.weather.note;
  T.weather = tile("weather", "", '<div class="mrow"><span class="mrn">' + esc(homeCity().name) + "</span>" + (WX ? '<span class="wi">' + wxIcon(WX.current.weather_code, WX.current.is_day, 22) + "</span>" : "") + '<b class="big">' + t + '°</b><span class="mut">' + esc(note) + "</span></div>", 1);
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
  var nb;
  if (NEWS.length) {
    var nowN = Date.now();
    var nn = NEWS.filter(function (n) { return shown("n:" + n.s); });
    NG = groupNews(nn);
    var favG = function (g) { return g.some(function (n) { return P.fav["n:" + n.s] && nowN - n.ts < 21600000; }) ? 1 : 0; };
    NG.sort(function (a, b) { return favG(b) - favG(a) || b[0].ts - a[0].ts; });
    nb = (NERR ? '<div class="empty">Some sources unavailable: ' + esc(NERR) + "</div>" : "") + (NG.length ? lst("news", NG.slice(0, 80).map(function (g) {
      var n = g[0], srcs = g.map(function (x) { return x.s; });
      return row("n:" + n.s, esc(n.t), srcs.join(" · "), '<span class="mut">' + ago(n.ts) + "</span>" + (srcs.length > 1 ? '<span class="pill ac">' + srcs.length + " sources</span>" : ""), "a:" + n.u);
    }).join(""), 6) : '<div class="empty">All news sources hidden. Use Sources below to bring one back.</div>');
  } else {
    nb = lst("news", D.news.map(function (x) {
      return '<div class="row"><span>' + esc(x.t) + '</span><span class="pill ' + (x.n > 3 ? "ac" : "") + '">×' + x.n + "</span></div>";
    }).join(""), 6) + '<div class="empty">' + (NERR ? "News unavailable: " + esc(NERR) : "Sample headlines. Sign in to load your sources.") + "</div>";
  }
  var ctlN = allSrc.length > 1 ? '<div class="dd"><button data-a="filtmenu" data-k="news" class="ib sm">Sources</button><div class="menu" id="filtNews" hidden>' +
    allSrc.map(function (nm) { return '<label><input type="checkbox" data-a="filttoggle" data-k="n:' + esc(nm) + '"' + (shown("n:" + nm) ? " checked" : "") + "> " + esc(nm) + "</label>"; }).join("") + "</div></div>" : "";
  T.news = tile("news", "News", nb, 0, ctlN);

  var tp = TGP.filter(function (g) { return shown("g:" + g.s); });
  T.telegram = tile("telegram", "Telegram", tp.length ? lst("telegram", tp.map(function (g) {
    return row("g:" + g.s, esc(hd(g.t, 90)), g.s, '<span class="mut">' + ago(g.ts) + "</span>", "m:" + g.u);
  }).join(""), 6) : '<div class="empty">' + (NERR ? "Unavailable: " + esc(NERR) : "Sign in to load your Telegram channels (Clash Report).") + "</div>");

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
    yb = (YTERR ? '<div class="empty">Videos unavailable: ' + esc(YTERR) + "</div>" : "") + (vids.length ? lst("youtube", vids.map(function (v) {
      return row(v.key, esc(v.t), v.n, '<span class="mut">' + ago(v.ts) + "</span>" + (P.fav[v.key] && v.isNew ? '<span class="pill ac">new</span>' : ""), "v:" + v.id);
    }).join("")) : '<div class="empty">' + (YTV.length ? "All channels hidden. Restore them in Settings." : "Loading videos (you need to be signed in)...") + "</div>");
  } else {
    var yt = D.youtube.map(function (v) { v.key = "y:" + v.ch; return v; }).filter(function (v) { return shown(v.key); }).sort(favFirst);
    yb = lst("youtube", yt.map(function (v) { return row(v.key, esc(v.t), v.ch, '<span class="mut">' + v.age + "</span>"); }).join("")) +
      '<div class="empty">Sample videos. In Edit mode, import your subscriptions.csv from Google Takeout.</div>';
  }
  if (EDIT) yb += '<label class="add">Import subscriptions.csv <input type="file" id="ytFile" accept=".csv,text/csv"></label>';
  T.youtube = tile("youtube", "YouTube", yb);

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
  var add = EDIT ? '<form id="addStock" class="add"><input id="stockIn" placeholder="Add symbol, e.g. NASDAQ:NVDA" aria-label="Stock symbol"><button>Add</button></form><form id="impStock" class="add imp"><textarea id="impIn" rows="2" placeholder="Import: paste your TradingView export, e.g. NASDAQ:NVDA,NASDAQ:AAPL" aria-label="Import watchlist"></textarea><button>Import</button></form><form id="linkStock" class="add"><input id="linkIn" placeholder="Or paste a shared TradingView watchlist link" aria-label="TradingView watchlist link"><button>Import</button></form>' : "";
  var IC = 'viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  T.menu = tile("menu", "", '<div class="mrow menurow">' +
    '<div class="dd"><button data-a="clockmenu2" class="ib" aria-label="Timer, countdown, stopwatch" aria-haspopup="menu" aria-expanded="' + (MENU_OPEN === "clock") + '"><svg ' + IC + '><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></button>' +
      (MENU_OPEN === "clock" ? '<div class="menu" role="menu"><button role="menuitem" data-a="clockmenu" data-k="t">Timer</button><button role="menuitem" data-a="clockmenu" data-k="c">Countdown</button><button role="menuitem" data-a="clockmenu" data-k="s">Stopwatch</button></div>' : "") + "</div>" +
    '<button data-a="opennotes" class="ib" aria-label="Notes"><svg ' + IC + '><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>' + (P.notes && P.notes.length ? "<span>" + P.notes.length + "</span>" : "") + "</button>" +
    '<div class="dd"><button data-a="cogmenu2" class="ib' + (EDIT ? " on" : "") + '" aria-label="Edit and settings" aria-haspopup="menu" aria-expanded="' + (MENU_OPEN === "cog") + '"><svg ' + IC + '><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>' +
      (MENU_OPEN === "cog" ? '<div class="menu" role="menu"><button role="menuitem" data-a="editmode">' + (EDIT ? "Done" : "Edit") + '</button><button role="menuitem" data-a="setpanel">Settings</button></div>' : "") + "</div>" +
    '<div class="dd"><button data-a="acctmenu2" class="ib" aria-label="Account" aria-haspopup="menu" aria-expanded="' + (MENU_OPEN === "acct") + '" title="' + (USER ? esc(USER.email) : "Account") + '"><svg ' + IC + '><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg></button>' +
      (MENU_OPEN === "acct" ? acctHtml() : "") + "</div>" +
    "</div>");
  T.stocks = tile("stocks", "Stocks", (QERR ? '<div class="empty">Prices unavailable: ' + esc(QERR) + "</div>" : "") + (st.length ? lst("stocks", st.map(function (x) {
    var c = x.c, up = c >= 0;
    return row(x.key, ico(x.id, x.logo) + "<b>" + esc(x.id) + "</b>", (x.p != null ? x.p.toFixed(2) : x.name), c == null ? '<span class="mut" title="No free price data for this one. Click it for the chart.">n/a</span>' : '<span class="' + (up ? "up" : "down") + '">' + (up ? "▲ +" : "▼ ") + c.toFixed(1) + "%</span>", 1);
  }).join("")) : '<div class="empty">No stocks. Restore them in Settings.</div>') + add, 0, ctlS);

  $("grid").innerHTML = orderIds().map(function (id) { return T[id] || ""; }).join("");
  renderHidden();
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
  if (e.key === "Enter" && e.target.classList && e.target.classList.contains("click")) e.target.click();
});

// ---- Twitch (browser login, needs only the Client ID) ----
var TW = null, TWC = false;
function twToken() { try { var t = localStorage.getItem("sp_twitch"); if (t) return t; } catch (e) {} return P.tw || null; }
function twBtn() { $("twBtn").textContent = twToken() ? "Disconnect" : "Connect"; }
function twConnect() {
  location.href = "https://id.twitch.tv/oauth2/authorize?client_id=" + TWITCH_CLIENT_ID + "&redirect_uri=" + encodeURIComponent(TWITCH_REDIRECT) + "&response_type=token&scope=user:read:follows&state=twitch";
}
function twDisconnect() { try { localStorage.removeItem("sp_twitch"); } catch (e) {} delete P.tw; persist(); TW = null; TWC = false; twBtn(); render(); }
function twGet(path, tok) {
  return fetch("https://api.twitch.tv/helix/" + path, { headers: { Authorization: "Bearer " + tok, "Client-Id": TWITCH_CLIENT_ID } })
    .then(function (r) { if (r.status === 401) throw new Error("expired"); return r.json(); });
}
function fetchTwitch() {
  var tok = twToken(); twBtn();
  if (!tok || !window.TWITCH_CLIENT_ID) return;
  if (P.tw !== tok) { P.tw = tok; persist(); }
  twGet("users", tok).then(function (u) { return twGet("streams/followed?first=100&user_id=" + u.data[0].id, tok); })
    .then(function (j) {
      TWC = true;
      TW = (j.data || []).map(function (x) { return { id: x.user_login, name: x.user_name, sub: x.game_name, v: x.viewer_count, live: 1 }; });
      render();
    }).catch(function (e) { if (e.message === "expired") twDisconnect(); });
}
function openTwitch(login) {
  openModal(login, '<div class="tw"><iframe allow="autoplay; fullscreen" allowfullscreen src="https://player.twitch.tv/?channel=' + encodeURIComponent(login) + "&parent=" + location.hostname + '&muted=true"></iframe></div><p><a class="btn" target="_blank" rel="noopener" href="https://www.twitch.tv/' + encodeURIComponent(login) + '">Open on Twitch</a> <button data-a="dock" data-k="t:' + esc(login) + '">Dock on the left</button></p>');
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
    else { QERR = ""; Object.assign(QUOTES, r.data); QLOADED = Object.keys(QUOTES).length > 0; }
    render();
  });
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
var YTV = [], YTERR = "", ytBusy = false;
function fetchYT() {
  if (!sb || !USER || !P.yt || !P.yt.ch || !P.yt.ch.length || ytBusy) return;
  var chs = P.yt.ch.filter(function (c) { return shown("y:" + c.t); })
    .sort(function (a, b) { return (P.fav["y:" + b.t] ? 1 : 0) - (P.fav["y:" + a.t] ? 1 : 0); }).slice(0, 60);
  ytBusy = true;
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { yt: chs.map(function (c) { return c.id; }) } }).then(function (r) {
    ytBusy = false;
    if (r.error || !r.data || r.data._err) YTERR = (r.error && r.error.message) || (r.data && r.data._err) || "no data";
    else { YTERR = ""; YTV = r.data.videos || []; }
    render();
  });
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
var NEWS = [], TGP = [], NERR = "", nBusy = false, NVIA = {}, NWHY = {}, FNVER = 0;
function fetchNews() {
  if (!sb || !USER || nBusy) return;
  nBusy = true;
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { news: newsSrc().map(function (x) { return { id: x.name, urls: x.urls }; }), tg: tgSrc() } }).then(function (r) {
    nBusy = false;
    if (r.error || !r.data || r.data._err) NERR = (r.error && r.error.message) || (r.data && r.data._err) || "no data";
    else {
      NEWS = r.data.news || []; TGP = r.data.tg || [];
      var ne = r.data.news_err || {};
      NVIA = r.data.news_via || {}; NWHY = r.data.news_why || {}; FNVER = r.data.ver || 0;
      NERR = Object.keys(ne).map(function (k) { return k + " (" + ne[k] + ")"; }).join(" | ");
    }
    renderSources(); render();
  });
}

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
  if (/^https:\/\//i.test(u)) {
    try { var h = new URL(u); return h.pathname.length > 1 || h.search ? [u] : siteUrls(h.hostname.replace(/^www\./, "")); } catch (e) { return null; }
  }
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(u) ? siteUrls(u.toLowerCase().replace(/^www\./, "")) : null;
}
function addNewsSrc(name, addr) {
  var urls = feedUrls(addr);
  if (!urls) { srcMsg("Enter a feed address starting with https:// or a website like reuters.com"); return false; }
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
  if (p[0] === "n") P.news.splice(i, 1); else P.tg.splice(i, 1);
  srcChanged();
}
function srcChanged() { persist(); NEWS = []; TGP = []; NERR = ""; renderSources(); render(); fetchNews(); }
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
}
document.addEventListener("submit", function (e) {
  if (e.target.id === "addNews") { e.preventDefault(); if (addNewsSrc($("newsName").value.trim(), $("newsUrl").value.trim())) { $("newsName").value = ""; $("newsUrl").value = ""; srcChanged(); } }
  if (e.target.id === "addTg") { e.preventDefault(); if (addTgSrc($("tgIn").value)) { $("tgIn").value = ""; srcChanged(); } }
});
$("srcReset").onclick = function () { delete P.news; delete P.tg; srcMsg("Back to the default sources."); srcChanged(); };

// ---- Details windows for news, Telegram and Gmail ----
function when(ts) { return new Date(ts).toLocaleString("en-GB", { timeZone: "Europe/Tallinn", dateStyle: "medium", timeStyle: "short" }); }
function openNews(u) {
  var g = NG.filter(function (x) { return x.some(function (n) { return n.u === u; }); })[0];
  var n = g ? g.filter(function (x) { return x.u === u; })[0] : NEWS.filter(function (x) { return x.u === u; })[0];
  if (!n) return;
  var more = g && g.length > 1 ? "<h3>" + g.length + " sources report this</h3>" + g.map(function (x) {
    return '<div class="mi"><a target="_blank" rel="noopener" href="' + esc(x.u) + '">' + esc(x.t) + '</a><small class="mut">' + esc(x.s) + " · " + when(x.ts) + "</small></div>";
  }).join("") : "";
  openModal(n.s, '<h2 class="mh">' + esc(n.t) + '</h2><div class="mut">' + esc(n.s) + " · " + when(n.ts) + "</div>" +
    (n.img ? '<img class="mimg" referrerpolicy="no-referrer" alt="" src="' + esc(n.img) + '">' : "") + (n.d ? "<p>" + esc(n.d) + "</p>" : "") +
    '<p><a class="btn" target="_blank" rel="noopener" href="' + esc(n.u) + '">Read the full article</a></p>' + more);
}
function openTG(u) {
  var g = TGP.filter(function (x) { return x.u === u; })[0];
  if (!g) return;
  var media = g.vid ? '<video class="mvid" controls playsinline preload="metadata"' + (g.th ? ' poster="' + esc(g.th) + '"' : "") + ' src="' + esc(g.vid) + '"></video>'
    : (g.img || g.th) ? '<img class="mimg" referrerpolicy="no-referrer" alt="" src="' + esc(g.img || g.th) + '">' : "";
  openModal(g.s, '<div class="mut">' + esc(g.s) + " · " + when(g.ts) + "</div>" + media + "<p>" + esc(g.tx || g.t).replace(/\n/g, "<br>") + '</p><p><a class="btn" target="_blank" rel="noopener" href="' + esc(g.u) + '">Open on Telegram</a></p>');
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
    else r.data.mail.forEach(function (m, k) { MAIL[list[k].i] = m; });
    render();
  });
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
      '</div><div class="mut sn">' + esc(x.snippet) + '</div><a class="btn" target="_blank" rel="noopener" href="' + esc(x.link) + '">Open in Gmail</a></div>';
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
  var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + t0;
  o.type = type || "sine"; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
}
function ring(kind) {
  if (kind === "chime") [660, 880, 1320].forEach(function (f, i) { beep(f, i * 0.28, 0.6, "sine"); });
  else if (kind === "alarm") for (var i = 0; i < 6; i++) beep(i % 2 ? 880 : 1046, i * 0.22, 0.2, "square");
  else for (var j = 0; j < 3; j++) beep(880, j * 0.3, 0.18, "sine");
}
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
      (a.k !== "c" && !a.done ? '<button data-a="clplay" data-k="' + a.id + '" aria-label="Start or pause">' + (a.st ? "⏸\uFE0E" : "▶\uFE0E") + '</button><button data-a="clreset" data-k="' + a.id + '" aria-label="Reset">↺</button>' : "") +
      '<button data-a="clrm" data-k="' + a.id + '" aria-label="Remove">✕</button></div>';
  }).join("");
  positionClocks();
}
function positionClocks() {
  var box = $("clocks"), chips = box.children, slots = ["mail", "live", "menu"].map(function (id) { return document.querySelector('[data-id="' + id + '"]'); }).filter(Boolean);
  box.hidden = !chips.length;
  if (!slots.length) return;
  for (var i = 0; i < chips.length; i++) {
    var slot = slots[i % slots.length], row = Math.floor(i / slots.length), chip = chips[i];
    if (!slot) continue;
    var r = slot.getBoundingClientRect(), h = chip.offsetHeight || 34;
    chip.style.position = "fixed";
    chip.style.left = Math.round(r.left) + "px"; chip.style.width = Math.round(r.width) + "px";
    chip.style.top = Math.round(r.top - (row + 1) * (h + 6)) + "px";
  }
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
      changed = true; ring(a.snd); notify(a);
    }
    var n = $("ct" + a.id); if (n) n.textContent = clockText(a);
  });
  if (changed) { persist(); renderClocks(); }
}
setInterval(tickClocks, 1000);
window.addEventListener("resize", positionClocks); window.addEventListener("scroll", positionClocks, true);
function clockAct(a, k) {
  var list = alarms(), t = list.filter(function (x) { return x.id === k; })[0];
  if (a === "clplay" && t && !t.done) { audio(); if (t.st) { t.acc += Date.now() - t.st; t.st = 0; } else t.st = Date.now(); }
  else if (a === "clreset" && t) { t.acc = 0; t.st = 0; t.done = false; }
  else if (a === "clrm") P.alarms = list.filter(function (x) { return x.id !== k; });
  persist(); renderClocks();
}
function openClock(kind) {
  var t = kind === "t";
  openModal(t ? "Timer" : "Countdown", '<p class="mut">' + (t ? "Counts up and rings when it reaches the time you set." : "Counts down to a date and time and rings when it gets there.") + '</p><div class="add"><input type="text" id="clLabel" placeholder="Name (optional)"></div>' +
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
function openNotes() {
  var N = (P.notes || []).slice().sort(function (a, b) { return b.ts - a.ts; });
  openModal("Notes (" + N.length + ")", '<textarea id="noteIn" rows="3" placeholder="Write a note..."></textarea><p><button class="pri" data-a="noteadd">Add note</button></p>' +
    (N.map(function (n) { return '<div class="mi"><div class="r2"><small class="mut">' + when(n.ts) + '</small><button data-a="notedel" data-k="' + n.id + '" aria-label="Delete note">✕</button></div><div class="nt">' + esc(n.t).replace(/\n/g, "<br>") + "</div></div>"; }).join("") || '<p class="mut">No notes yet.</p>'));
}
function noteAct(a, k) {
  if (a === "noteadd") {
    var v = $("noteIn").value.trim(); if (!v) return;
    (P.notes = P.notes || []).push({ id: "n" + Date.now().toString(36), t: v, ts: Date.now() });
  } else P.notes = (P.notes || []).filter(function (n) { return n.id !== k; });
  persist(); render(); openNotes();
}
var MENU_OPEN = "";
function closeMenus() { if (MENU_OPEN) { MENU_OPEN = ""; render(); } var f = $("filtNews"); if (f) f.hidden = true; }
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
  var title = id;
  if (kind === "v") { var v = YTV.filter(function (x) { return x.id === id; })[0]; if (v) title = v.t; }
  var d = { kind: kind, id: id, uid: ++dockUid };
  DOCK.push(d);
  var src = kind === "t" ? "https://player.twitch.tv/?channel=" + encodeURIComponent(id) + "&parent=" + location.hostname + "&muted=true"
    : "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&mute=1";
  var w = document.createElement("div");
  w.className = "dk"; w.id = "dk" + d.uid;
  w.innerHTML = '<div class="dkh"><b>' + esc(hd(title, 40)) + '</b><button data-a="undock" data-k="' + d.uid + '" aria-label="Close player">✕</button></div><div class="tw"><iframe allow="autoplay; fullscreen; encrypted-media" allowfullscreen src="' + src + '"></iframe></div>';
  $("dock").appendChild(w);
  syncDock(); closeModal();
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
function wxUrl(c) {
  return "https://api.open-meteo.com/v1/forecast?latitude=" + c.lat + "&longitude=" + c.lon + "&current=temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m,relative_humidity_2m&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,uv_index_max&wind_speed_unit=ms&timezone=auto&forecast_days=7";
}
function loadWx(c) { return fetch(wxUrl(c)).then(function (r) { return r.json(); }); }
function fetchWeather() { loadWx(homeCity()).then(function (j) { if (j && j.current) { WX = j; render(); } }).catch(function () {}); }
function wxHtml(j) {
  var c = j.current, h = j.hourly, d = j.daily, now = c.time.slice(0, 13);
  var i = h.time.findIndex(function (t) { return t.slice(0, 13) >= now; }); if (i < 0) i = 0;
  var hrs = "";
  for (var n = i; n < i + 12 && n < h.time.length; n++) hrs += '<div class="hr"><b>' + h.time[n].slice(11, 16) + "</b><span>" + Math.round(h.temperature_2m[n]) + "°</span><small>" + h.precipitation_probability[n] + "%</small></div>";
  var days = d.time.map(function (t, k) {
    var nm = new Date(t + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" });
    return '<div class="row"><span>' + wxIcon(d.weather_code[k], 1, 20) + " " + nm + " <small>" + wxText(d.weather_code[k]) + '</small></span><span class="r">' + d.precipitation_sum[k].toFixed(1) + " mm · " + Math.round(d.temperature_2m_min[k]) + "° / <b>" + Math.round(d.temperature_2m_max[k]) + "°</b></span></div>";
  }).join("");
  return '<div class="mrow"><span class="wi">' + wxIcon(c.weather_code, c.is_day, 34) + '</span><b class="big">' + Math.round(c.temperature_2m) + "°</b><span>" + wxText(c.weather_code) + '</span></div><div class="mut">Feels like ' + Math.round(c.apparent_temperature) + "° · wind " + c.wind_speed_10m + " m/s · humidity " + c.relative_humidity_2m + "%</div>" +
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
document.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.id === "cityIn") cityGo(); });
function cityAct(a, k) {
  var cur = WXM && WXM.c;
  if (a === "citygo") cityGo();
  else if (a === "cityview") showCity(cityList()[+k]);
  else if (a === "cityres") { showCity(CITYRES[+k]); $("cityRes").innerHTML = ""; }
  else if (a === "citysave" && cur) { P.cities = P.cities || []; if (P.cities.length < 8) P.cities.push({ name: cur.name, lat: cur.lat, lon: cur.lon }); persist(); showCity(cur, WXM.j); }
  else if (a === "cityrm" && cur) { P.cities = (P.cities || []).filter(function (x) { return !sameCity(x, cur); }); persist(); showCity(homeCity(), WX); }
  else if (a === "cityhome" && cur) { P.home = { name: cur.name, lat: cur.lat, lon: cur.lon }; P.cities = (P.cities || []).filter(function (x) { return !sameCity(x, cur); }); persist(); WX = null; render(); fetchWeather(); showCity(cur, WXM.j); }
}

// ---- Stocks: details window with TradingView chart, and adding symbols ----
function openStock(id) {
  openModal(id, '<div id="tv" class="tv"></div><p><a class="btn" target="_blank" rel="noopener" href="https://www.tradingview.com/chart/?symbol=' + encodeURIComponent(id) + '">Open in TradingView</a></p>');
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

// ---- Events ----
document.addEventListener("click", function (e) {
  if (e.target.closest && e.target.closest("#filtNews")) { e.stopPropagation(); }
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
  if (a === "signout") { sb.auth.signOut(); MENU_OPEN = ""; return; }
  if (a === "editmode") { EDIT = !EDIT; document.body.classList.toggle("editing", EDIT); MENU_OPEN = ""; render(); return; }
  if (a === "setpanel") { MENU_OPEN = ""; render(); $("panel").hidden = false; return; }
  if (a === "convswap") { var c = conv(), t = c.from; c.from = c.to; c.to = t; persist(); render(); return; }
  if (a === "filtmenu") { e.stopPropagation(); var m = $("filtNews"); var open = m.hidden; closeMenus(); if (open) m.hidden = false; return; }
  if (a === "weather") { openWeather(); return; }
  if (a === "twConnect") { twConnect(); return; }
  if (a === "mv" || a === "w" || a === "h" || a === "f") { var pp = k.split(":"); adjust(a, pp[0], +pp[1]); return; }
  if (/^city/.test(a)) { cityAct(a, k); return; }
  if (a === "clockmenu") { audio(); MENU_OPEN = ""; if (k === "s") startStopwatch(); else openClock(k); return; }
  if (a === "cltest") { audio(); ring($("clSnd").value); return; }
  if (a === "clstart") { startClock(k); return; }
  if (/^cl(play|reset|rm)$/.test(a)) { clockAct(a, k); return; }
  if (a === "noteadd" || a === "notedel") { noteAct(a, k); return; }
  if (a === "srcdel") { delSrc(k); return; }
  if (a === "dock") { dockAdd(k); return; }
  if (a === "undock") { undock(k); return; }
  if (a === "mailread") { markRead(+k); return; }
  if (a === "mailall") { showAllMail(+k); return; }
  if (a === "mail") { openMail(+k); return; }
  if (a === "open") { var ch = k.charAt(0); if (ch === "t") openTwitch(k.slice(2)); else if (ch === "v") openYT(k.slice(2)); else if (ch === "a") openNews(k.slice(2)); else if (ch === "m") openTG(k.slice(2)); else openStock(k.slice(2)); return; }
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
  $("who").textContent = USER ? " · signed in as " + USER.email : " · not signed in";
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
    fetchQuotes(); fetchTwitch(); fetchYT(); fetchNews(); fetchMail(); loadMailForm(); renderSources(); renderClocks(); fetchWeather();
  });
}
function auth(fn) {
  if (!sb) { setMsg("Supabase did not load. Check config.js and your connection."); return; }
  var c = { email: $("acctEmail").value.trim(), password: $("acctPass").value };
  if (!c.email || !c.password) { setMsg("Enter your email and password."); return; }
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
function acctHtml() {
  if (USER) return '<div class="menu acctpop" role="menu"><div class="mut sn">' + esc(USER.email) + '</div><button role="menuitem" data-a="signout">Sign out</button></div>';
  return '<div class="menu acctpop" role="menu"><input type="text" id="acctEmail" placeholder="Email" autocomplete="email"><input type="password" id="acctPass" placeholder="Password (6+ characters)" autocomplete="current-password"><div class="acts"><button data-a="signin">Sign in</button><button data-a="signup">Create account</button></div>' + (ACCTMSG ? '<div class="mut sn">' + esc(ACCTMSG) + "</div>" : "") + "</div>";
}

$("ver").textContent = VERSION;
applyTheme(); applyWall(); tick(); render(); initAuth(); fetchWeather(); setInterval(fetchWeather, 900000); fetchRates(); setInterval(fetchRates, 300000);
$("twBtn").onclick = function () { if (twToken()) twDisconnect(); else if (window.TWITCH_CLIENT_ID) twConnect(); };
fetchTwitch(); setInterval(fetchTwitch, 60000); setInterval(fetchQuotes, 300000); setInterval(fetchYT, 600000); setInterval(fetchNews, 300000); setInterval(fetchMail, 300000); setInterval(checkUpdate, 300000); loadMailForm(); renderSources(); renderClocks();
setInterval(tick, 30000);
