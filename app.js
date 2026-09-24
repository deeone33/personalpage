var VERSION = 9;

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

var ALL_IDS = ["weather", "gmail1", "gmail2", "live", "news", "telegram", "twitch", "youtube", "stocks"];
var DEF_C = { weather: 3, gmail1: 3, gmail2: 3, live: 3, news: 6, telegram: 6, twitch: 4, youtube: 4, stocks: 4 };
var COMPACT = ["weather", "gmail1", "gmail2", "live"];
var LISTS = ["news", "telegram", "twitch", "youtube", "stocks"];
function LAY() {
  if (!P.layout) P.layout = { order: [], w: {}, rows: {} };
  var L = P.layout;
  if (!L.c) { L.c = {}; Object.keys(L.w || {}).forEach(function (k) { L.c[k] = L.w[k] * 3; }); }
  return L;
}
function orderIds() {
  var o = LAY().order.filter(function (x) { return ALL_IDS.indexOf(x) >= 0; });
  ALL_IDS.forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); });
  return o;
}
function adjust(a, id, d) {
  var L = LAY();
  if (a === "mv") { var o = orderIds(), i = o.indexOf(id), j = i + d; if (j < 0 || j >= o.length) return; o.splice(i, 1); o.splice(j, 0, id); L.order = o; }
  else if (a === "w") L.c[id] = Math.max(2, Math.min(12, (L.c[id] || DEF_C[id] || 3) + d));
  else L.rows[id] = Math.max(3, Math.min(20, (L.rows[id] || (id === "news" || id === "telegram" ? 6 : 10)) + d));
  persist(); render();
}
function tile(id, title, body, click) {
  var c = LAY().c[id] || DEF_C[id] || 3, t = "", at = "", cp = COMPACT.indexOf(id) >= 0;
  if (click) {
    var pr = typeof click === "string" ? click.split(":") : ["weather"];
    at = ' data-a="' + pr[0] + '"' + (pr[1] != null ? ' data-k="' + pr[1] + '"' : "") + ' tabindex="0" role="button"';
  }
  if (EDIT) {
    var bt = function (act, d, label) { return '<button data-a="' + act + '" data-k="' + id + ":" + d + '">' + label + "</button>"; };
    t = '<div class="tools">' + bt("mv", -1, "◀ Earlier") + bt("mv", 1, "Later ▶") + bt("w", -1, "Narrower") + bt("w", 1, "Wider") + (LISTS.indexOf(id) >= 0 ? bt("h", -1, "Shorter") + bt("h", 1, "Taller") : "") + "</div>";
  }
  return '<div class="card c' + c + (cp ? " compact" : "") + (click ? " click" : "") + '" data-id="' + id + '"' + at +
    "><h3" + (EDIT ? ' class="grab" draggable="true" title="Drag to move"' : "") + ">" + title + "</h3>" + t + body + "</div>";
}
function hd(t, n) { return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, "") + "…" : t; }
function lst(id, html, def) { var r = LAY().rows[id] || def || 10; return '<div class="list" style="max-height:' + r * 36 + 'px">' + html + "</div>"; }
function ago(ts) { var m = Math.max(1, Math.round((Date.now() - ts) / 60000)); return m < 60 ? m + "m" : m < 1440 ? Math.round(m / 60) + "h" : Math.round(m / 1440) + "d"; }

function render() {
  var D = DATA, T = {};
  var t = WX ? Math.round(WX.current.temperature_2m) : D.weather.temp;
  var note = WX ? wxText(WX.current.weather_code) + " · feels " + Math.round(WX.current.apparent_temperature) + "°" : D.weather.note;
  T.weather = tile("weather", "Tallinn", '<div class="mrow">' + (WX ? '<span class="wi">' + wxIcon(WX.current.weather_code, WX.current.is_day, 30) + "</span>" : "") + '<b class="big">' + t + '°</b><span class="mut">' + esc(note) + "</span></div>", 1);
  [0, 1].forEach(function (i) {
    var cfg = P.mail && P.mail[i], m = MAIL[i], id = "gmail" + (i + 1), nm = (cfg && cfg.name) || D.inbox[i].name, body, click = 0;
    if (!cfg || !cfg.url) body = '<div class="mrow"><span class="mut">Not connected. See Settings, Gmail accounts.</span></div>';
    else if (!m) body = '<div class="mrow"><span class="mut">Loading (you need to be signed in)...</span></div>';
    else if (m.error) body = '<div class="mrow"><span class="mut" title="' + esc(m.error) + '">' + esc(m.error.slice(0, 90)) + "</span></div>";
    else {
      var n = mailN(i);
      body = '<div class="mrow"><b class="big">' + n.txt + '</b><span class="mut">' + n.lab + "</span>" + (n.n > 0 ? '<button data-a="mailread" data-k="' + i + '">Mark read</button>' : "") + "</div>";
      click = "mail:" + i;
    }
    T[id] = tile(id, esc(nm), body, click);
  });

  var tw = (TWC ? TW : D.twitch).filter(function (x) { return x.live && shown("t:" + x.id); })
    .map(function (x) { x.key = "t:" + x.id; return x; })
    .sort(function (a, b) { return favFirst(a, b) || b.v - a.v; });
  T.live = tile("live", "Live now", '<div class="mrow"><b class="big">' + tw.length + '</b><span class="mut">of your follows</span></div>');
  var nb;
  if (NEWS.length) {
    var nowN = Date.now();
    var nn = NEWS.filter(function (n) { return shown("n:" + n.s); });
    nn.sort(function (a, b) { return ((P.fav["n:" + b.s] && nowN - b.ts < 21600000) ? 1 : 0) - ((P.fav["n:" + a.s] && nowN - a.ts < 21600000) ? 1 : 0) || b.ts - a.ts; });
    nb = (NERR ? '<div class="empty">Some sources unavailable: ' + esc(NERR) + "</div>" : "") + (nn.length ? lst("news", nn.slice(0, 80).map(function (n) {
      return row("n:" + n.s, esc(n.t), n.s, '<span class="mut">' + ago(n.ts) + "</span>", "a:" + n.u);
    }).join(""), 6) : '<div class="empty">All news sources hidden. Restore them in Settings.</div>');
  } else {
    nb = lst("news", D.news.map(function (x) {
      return '<div class="row"><span>' + esc(x.t) + '</span><span class="pill ' + (x.n > 3 ? "ac" : "") + '">×' + x.n + "</span></div>";
    }).join(""), 6) + '<div class="empty">' + (NERR ? "News unavailable: " + esc(NERR) : "Sample headlines. Sign in to load Aftonbladet, AP and Reuters.") + "</div>";
  }
  T.news = tile("news", "News · Aftonbladet, AP, Reuters", nb);

  var tp = TGP.filter(function (g) { return shown("g:" + g.s); });
  T.telegram = tile("telegram", "Telegram", tp.length ? lst("telegram", tp.map(function (g) {
    return row("g:" + g.s, esc(hd(g.t, 90)), g.s, '<span class="mut">' + ago(g.ts) + "</span>", "m:" + g.u);
  }).join(""), 6) : '<div class="empty">' + (NERR ? "Unavailable: " + esc(NERR) : "Sign in to load your Telegram channels (Clash Report).") + "</div>");

  T.twitch = tile("twitch", "Live on Twitch", (tw.length ? lst("twitch", tw.map(function (x) {
    var vv = x.v >= 1000 ? (x.v / 1000).toFixed(1) + "k" : x.v;
    return row(x.key, '<span class="dot"></span>' + esc(x.name || x.id), x.sub, '<span class="mut">' + vv + "</span>", TWC ? 1 : 0);
  }).join("")) : '<div class="empty">Nobody you follow is live.</div>') +
    (TWC || !window.TWITCH_CLIENT_ID ? "" : '<button data-a="twConnect">Connect Twitch to show your real follows</button>'));

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
  var st = SL.map(function (x) { var q = QUOTES[tk(x.id)]; return { id: x.id, name: x.name, c: q ? q.c : (QLOADED ? null : x.c), p: q ? q.p : null, key: "s:" + x.id }; }).filter(function (x) { return shown(x.key); })
    .sort(function (x, y) { return favFirst(x, y) || Math.abs(y.c || 0) - Math.abs(x.c || 0); });
  var add = EDIT ? '<form id="addStock" class="add"><input id="stockIn" placeholder="Add symbol, e.g. NASDAQ:NVDA" aria-label="Stock symbol"><button>Add</button></form><form id="impStock" class="add imp"><textarea id="impIn" rows="2" placeholder="Import: paste your TradingView export, e.g. NASDAQ:NVDA,NASDAQ:AAPL" aria-label="Import watchlist"></textarea><button>Import</button></form><form id="linkStock" class="add"><input id="linkIn" placeholder="Or paste a shared TradingView watchlist link" aria-label="TradingView watchlist link"><button>Import</button></form>' : "";
  T.stocks = tile("stocks", "Stocks · biggest moves first", (QERR ? '<div class="empty">Prices unavailable: ' + esc(QERR) + "</div>" : "") + (st.length ? lst("stocks", st.map(function (x) {
    var c = x.c, up = c >= 0;
    return row(x.key, "<b>" + esc(x.id) + "</b>", (x.p != null ? x.p.toFixed(2) : x.name), c == null ? '<span class="mut" title="No free price data for this one. Click it for the chart.">n/a</span>' : '<span class="' + (up ? "up" : "down") + '">' + (up ? "▲ +" : "▼ ") + c.toFixed(1) + "%</span>", 1);
  }).join("")) : '<div class="empty">No stocks. Restore them in Settings.</div>') + add);

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
  if (e.key === "Escape") closeModal();
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
  openModal(login, '<div class="tw"><iframe allow="autoplay; fullscreen" allowfullscreen src="https://player.twitch.tv/?channel=' + encodeURIComponent(login) + "&parent=" + location.hostname + '&muted=true"></iframe></div><p><a class="btn" target="_blank" rel="noopener" href="https://www.twitch.tv/' + encodeURIComponent(login) + '">Open on Twitch</a></p>');
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
  openModal("YouTube", '<div class="tw"><iframe allow="autoplay; fullscreen; encrypted-media" allowfullscreen src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1"></iframe></div><p><a class="btn" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=' + encodeURIComponent(id) + '">Open on YouTube</a></p>');
}
document.addEventListener("change", function (e) {
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
var NEWS_SRC = [
  { name: "Aftonbladet", urls: ["https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/", "https://news.google.com/rss/search?q=site:aftonbladet.se&hl=sv&gl=SE&ceid=SE:sv"] },
  { name: "AP", urls: [GN + "apnews.com", "https://www.bing.com/news/search?format=rss&q=site%3Aapnews.com", "https://news.search.yahoo.com/rss?p=site%3Aapnews.com"] },
  { name: "Reuters", urls: [GN + "reuters.com", "https://www.bing.com/news/search?format=rss&q=site%3Areuters.com", "https://news.search.yahoo.com/rss?p=site%3Areuters.com"] }
];
var TG_SRC = ["ClashReport"];
var NEWS = [], TGP = [], NERR = "", nBusy = false;
function fetchNews() {
  if (!sb || !USER || nBusy) return;
  nBusy = true;
  sb.functions.invoke(window.FEEDS_FN || "feeds", { body: { news: NEWS_SRC.map(function (x) { return { id: x.name, urls: x.urls }; }), tg: TG_SRC } }).then(function (r) {
    nBusy = false;
    if (r.error || !r.data || r.data._err) NERR = (r.error && r.error.message) || (r.data && r.data._err) || "no data";
    else {
      NEWS = r.data.news || []; TGP = r.data.tg || [];
      var ne = r.data.news_err || {};
      NERR = Object.keys(ne).map(function (k) { return k + " (" + ne[k] + ")"; }).join(" | ");
    }
    render();
  });
}

// ---- Details windows for news, Telegram and Gmail ----
function when(ts) { return new Date(ts).toLocaleString("en-GB", { timeZone: "Europe/Tallinn", dateStyle: "medium", timeStyle: "short" }); }
function openNews(u) {
  var n = NEWS.filter(function (x) { return x.u === u; })[0];
  if (!n) return;
  openModal(n.s, '<h2 class="mh">' + esc(n.t) + '</h2><div class="mut">' + esc(n.s) + " · " + when(n.ts) + "</div>" +
    (n.img ? '<img class="mimg" referrerpolicy="no-referrer" alt="" src="' + esc(n.img) + '">' : "") + (n.d ? "<p>" + esc(n.d) + "</p>" : "") +
    '<p><a class="btn" target="_blank" rel="noopener" href="' + esc(n.u) + '">Read the full article</a></p>');
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
  if (MAIL[i]) { MAIL[i].fresh = 0; MAIL[i].items = []; }
  persist(); closeModal(); render(); fetchMail();
}
function showAllMail(i) { var c = P.mail && P.mail[i]; if (!c) return; delete c.seen; persist(); closeModal(); MAIL[i] = null; render(); fetchMail(); }
function openMail(i) {
  var m = MAIL[i];
  if (!m || m.error) return;
  var nm = (P.mail[i] && P.mail[i].name) || "Gmail", n = mailN(i), seen = P.mail[i] && P.mail[i].seen;
  var rows = (m.items || []).map(function (x) {
    return '<div class="mi"><div class="r2"><b>' + esc((x.from || "").replace(/<.*>/, "").trim() || x.from) + '</b><small class="mut">' + ago(x.ts) + "</small></div><div>" + esc(x.subject || "(no subject)") +
      '</div><div class="mut sn">' + esc(x.snippet) + '</div><a class="btn" target="_blank" rel="noopener" href="' + esc(x.link) + '">Open in Gmail</a></div>';
  }).join("");
  var ctl = '<div class="tools">' + (n.n > 0 ? '<button data-a="mailread" data-k="' + i + '">Mark read (on this site only)</button>' : "") + (seen ? '<button data-a="mailall" data-k="' + i + '">Show all unread again</button>' : "") + "</div>";
  openModal(nm + " · " + n.txt + " " + n.lab, ctl + (rows || '<p class="mut">Nothing new.</p>'));
}
function loadMailForm() {
  var M = P.mail || [];
  [0, 1].forEach(function (i) { var c = M[i] || {}; $("mn" + i).value = c.name || ""; $("mu" + i).value = c.url || ""; $("mt" + i).value = c.t || ""; });
}
$("mailSave").onclick = function () {
  P.mail = [0, 1].map(function (i) { return { name: $("mn" + i).value.trim(), url: $("mu" + i).value.trim(), t: $("mt" + i).value.trim(), seen: (P.mail && P.mail[i] && P.mail[i].seen) || undefined }; });
  persist(); MAIL = []; render(); fetchMail(); $("mailMsg").textContent = "Saved.";
};

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

// ---- Weather (Open-Meteo, no key needed) ----
var WX = null;
var WC = { 0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers", 81: "Rain showers", 82: "Heavy showers", 85: "Snow showers", 86: "Snow showers", 95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm" };
function wxText(c) { return WC[c] || "Unknown"; }
function fetchWeather() {
  fetch("https://api.open-meteo.com/v1/forecast?latitude=59.437&longitude=24.7536&current=temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m,relative_humidity_2m&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,uv_index_max&wind_speed_unit=ms&timezone=Europe%2FTallinn&forecast_days=7")
    .then(function (r) { return r.json(); })
    .then(function (j) { if (j && j.current) { WX = j; render(); } })
    .catch(function () {});
}
function openWeather() {
  if (!WX) { openModal("Tallinn", '<p class="mut">Weather could not be loaded. Check your connection and reload.</p>'); return; }
  var c = WX.current, h = WX.hourly, d = WX.daily, now = c.time.slice(0, 13);
  var i = h.time.findIndex(function (t) { return t.slice(0, 13) >= now; }); if (i < 0) i = 0;
  var hrs = "";
  for (var n = i; n < i + 12 && n < h.time.length; n++) hrs += '<div class="hr"><b>' + h.time[n].slice(11, 16) + "</b><span>" + Math.round(h.temperature_2m[n]) + "°</span><small>" + h.precipitation_probability[n] + "%</small></div>";
  var days = d.time.map(function (t, k) {
    var nm = new Date(t + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" });
    return '<div class="row"><span>' + wxIcon(d.weather_code[k], 1, 20) + " " + nm + " <small>" + wxText(d.weather_code[k]) + '</small></span><span class="r">' + d.precipitation_sum[k].toFixed(1) + " mm · " + Math.round(d.temperature_2m_min[k]) + "° / <b>" + Math.round(d.temperature_2m_max[k]) + "°</b></span></div>";
  }).join("");
  openModal("Tallinn · " + wxText(c.weather_code),
    '<div class="big">' + Math.round(c.temperature_2m) + '°</div><div class="mut">Feels like ' + Math.round(c.apparent_temperature) + "° · wind " + c.wind_speed_10m + " m/s · humidity " + c.relative_humidity_2m + "%</div>" +
    "<h3>Next 12 hours (temperature, chance of rain)</h3><div class=\"hrs\">" + hrs + "</div><h3>7 days</h3>" + days +
    '<p class="mut">Sunrise ' + d.sunrise[0].slice(11, 16) + " · Sunset " + d.sunset[0].slice(11, 16) + " · UV max " + d.uv_index_max[0] + "</p>");
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
  var b = e.target.closest("[data-a]");
  if (!b) return;
  var a = b.dataset.a, k = b.dataset.k;
  if (a === "weather") { openWeather(); return; }
  if (a === "twConnect") { twConnect(); return; }
  if (a === "mv" || a === "w" || a === "h") { var pp = k.split(":"); adjust(a, pp[0], +pp[1]); return; }
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
$("editBtn").onclick = function () { EDIT = !EDIT; document.body.classList.toggle("editing", EDIT); $("editBtn").textContent = EDIT ? "Done" : "Edit"; render(); };
$("setBtn").onclick = function () { $("panel").hidden = false; };
$("closeBtn").onclick = function () { $("panel").hidden = true; };
$("themeBtn").onclick = function () { P.theme = P.theme === "dark" ? "light" : "dark"; persist(); applyTheme(); };
$("accent").oninput = function (e) { P.accent = e.target.value; persist(); applyTheme(); };
$("cBg").oninput = function (e) { setCol("bg", e.target.value); };
$("cCard").oninput = function (e) { setCol("card", e.target.value); };
$("cFg").oninput = function (e) { setCol("fg", e.target.value); };
$("cMut").oninput = function (e) { setCol("mut", e.target.value); };
$("cAlpha").oninput = function (e) { setCol("a", +e.target.value); };
$("cReset").onclick = function () { if (P.colors) delete P.colors[P.theme]; persist(); applyTheme(); };
$("accentReset").onclick = function () { P.accent = DEFAULT_ACCENT; persist(); applyTheme(); };
$("wallFile").onchange = function (e) { if (e.target.files[0]) setWall(e.target.files[0]); };
$("wallClear").onclick = function () { try { localStorage.removeItem("sp_wall"); } catch (e) {} applyWall(); syncWall(true); };

// ---- Account and cloud sync (Supabase) ----
var sb = null, USER = null, saveTimer;
try { if (window.supabase && window.SUPABASE_URL) sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (e) {}
function setMsg(t) { $("acctMsg").textContent = t || ""; }
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
  $("acctOut").hidden = !!USER; $("acctIn").hidden = !USER;
  $("acctMail").textContent = USER ? USER.email : "";
  $("who").textContent = USER ? " · signed in as " + USER.email : " · not signed in";
}
function onUser(u) {
  USER = u; renderAccount();
  if (!u) return;
  loadWall(u);
  sb.from("user_prefs").select("prefs").eq("user_id", u.id).maybeSingle().then(function (r) {
    if (r.error) { setMsg("Could not load your settings: " + r.error.message); return; }
    if (r.data && r.data.prefs && r.data.prefs.theme) {
      P = Object.assign({ theme: "dark", accent: DEFAULT_ACCENT, fav: {}, hidden: {} }, r.data.prefs);
      save("sp_prefs", P); applyTheme(); render();
    } else { persist(); }
    fetchQuotes(); fetchTwitch(); fetchYT(); fetchNews(); fetchMail(); loadMailForm();
  });
}
function auth(fn) {
  if (!sb) { setMsg("Supabase did not load. Check config.js and your connection."); return; }
  var c = { email: $("email").value.trim(), password: $("pass").value };
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
  $("signIn").onclick = function () { auth("signInWithPassword"); };
  $("signUp").onclick = function () { auth("signUp"); };
  $("signOut").onclick = function () { sb.auth.signOut(); };
  sb.auth.onAuthStateChange(function (ev, session) {
    var u = session ? session.user : null;
    if ((u && u.id) !== (USER && USER.id)) setTimeout(function () { onUser(u); }, 0);
  });
}

$("ver").textContent = VERSION;
applyTheme(); applyWall(); tick(); render(); initAuth(); fetchWeather(); setInterval(fetchWeather, 900000);
$("twBtn").onclick = function () { if (twToken()) twDisconnect(); else if (window.TWITCH_CLIENT_ID) twConnect(); };
fetchTwitch(); setInterval(fetchTwitch, 60000); setInterval(fetchQuotes, 300000); setInterval(fetchYT, 600000); setInterval(fetchNews, 300000); setInterval(fetchMail, 300000); setInterval(checkUpdate, 300000); loadMailForm();
setInterval(tick, 30000);
