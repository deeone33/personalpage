var VERSION = 7;

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
function applyTheme() {
  var r = document.documentElement;
  r.dataset.theme = P.theme;
  r.style.setProperty("--ac", P.accent);
  var h = P.accent.replace("#", ""), n = parseInt(h, 16);
  var lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  r.style.setProperty("--acfg", lum > 0.6 ? "#111" : "#fff");
  $("themeBtn").textContent = P.theme === "dark" ? "Switch to light" : "Switch to dark";
  $("accent").value = P.accent;
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
var DEF_W = { news: 2, telegram: 2, twitch: 2, youtube: 2, stocks: 2 };
var LISTS = ["news", "telegram", "twitch", "youtube", "stocks"];
function LAY() { if (!P.layout) P.layout = { order: [], w: {}, rows: {} }; return P.layout; }
function orderIds() {
  var o = LAY().order.filter(function (x) { return ALL_IDS.indexOf(x) >= 0; });
  ALL_IDS.forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); });
  return o;
}
function adjust(a, id, d) {
  var L = LAY();
  if (a === "mv") { var o = orderIds(), i = o.indexOf(id), j = i + d; if (j < 0 || j >= o.length) return; o.splice(i, 1); o.splice(j, 0, id); L.order = o; }
  else if (a === "w") L.w[id] = Math.max(1, Math.min(4, (L.w[id] || DEF_W[id] || 1) + d));
  else L.rows[id] = Math.max(3, Math.min(20, (L.rows[id] || (id === "news" || id === "telegram" ? 6 : 10)) + d));
  persist(); render();
}
function tile(id, title, body, click) {
  var w = LAY().w[id] || DEF_W[id] || 1, t = "";
  if (EDIT) {
    var bt = function (act, d, label) { return '<button data-a="' + act + '" data-k="' + id + ":" + d + '">' + label + "</button>"; };
    t = '<div class="tools">' + bt("mv", -1, "◀ Earlier") + bt("mv", 1, "Later ▶") + bt("w", -1, "Narrower") + bt("w", 1, "Wider") + (LISTS.indexOf(id) >= 0 ? bt("h", -1, "Shorter") + bt("h", 1, "Taller") : "") + "</div>";
  }
  return '<div class="card w' + w + (click ? " click" : "") + '" data-id="' + id + '"' + (click ? ' data-a="weather" tabindex="0" role="button" aria-label="Open Tallinn details"' : "") +
    "><h3" + (EDIT ? ' class="grab" draggable="true" title="Drag to move"' : "") + ">" + title + "</h3>" + t + body + "</div>";
}
function lst(id, html, def) { var r = LAY().rows[id] || def || 10; return '<div class="list" style="max-height:' + r * 36 + 'px">' + html + "</div>"; }
function ago(ts) { var m = Math.max(1, Math.round((Date.now() - ts) / 60000)); return m < 60 ? m + "m" : m < 1440 ? Math.round(m / 60) + "h" : Math.round(m / 1440) + "d"; }

function render() {
  var D = DATA, T = {};
  var t = WX ? Math.round(WX.current.temperature_2m) : D.weather.temp;
  var note = WX ? wxText(WX.current.weather_code) + " · feels " + Math.round(WX.current.apparent_temperature) + "°" : D.weather.note;
  T.weather = tile("weather", "Tallinn", '<div class="big">' + t + '°</div><span class="mut">' + esc(note) + "</span>", 1);
  D.inbox.forEach(function (m) { T[m.id] = tile(m.id, m.name, '<div class="big">' + m.n + '</div><span class="mut">unread</span>'); });

  var tw = (TWC ? TW : D.twitch).filter(function (x) { return x.live && shown("t:" + x.id); })
    .map(function (x) { x.key = "t:" + x.id; return x; })
    .sort(function (a, b) { return favFirst(a, b) || b.v - a.v; });
  T.live = tile("live", "Live now", '<div class="big">' + tw.length + '</div><span class="mut">of your follows</span>');
  var nb;
  if (NEWS.length) {
    var nowN = Date.now();
    var nn = NEWS.filter(function (n) { return shown("n:" + n.s); });
    nn.sort(function (a, b) { return ((P.fav["n:" + b.s] && nowN - b.ts < 21600000) ? 1 : 0) - ((P.fav["n:" + a.s] && nowN - a.ts < 21600000) ? 1 : 0) || b.ts - a.ts; });
    nb = (NERR ? '<div class="empty">Some sources unavailable: ' + esc(NERR) + "</div>" : "") + (nn.length ? lst("news", nn.slice(0, 80).map(function (n) {
      return row("n:" + n.s, '<a class="lnk" href="' + esc(n.u) + '" target="_blank" rel="noopener">' + esc(n.t) + "</a>", n.s, '<span class="mut">' + ago(n.ts) + "</span>");
    }).join(""), 6) : '<div class="empty">All news sources hidden. Restore them in Settings.</div>');
  } else {
    nb = lst("news", D.news.map(function (x) {
      return '<div class="row"><span>' + esc(x.t) + '</span><span class="pill ' + (x.n > 3 ? "ac" : "") + '">×' + x.n + "</span></div>";
    }).join(""), 6) + '<div class="empty">' + (NERR ? "News unavailable: " + esc(NERR) : "Sample headlines. Sign in to load Aftonbladet, AP and Reuters.") + "</div>";
  }
  T.news = tile("news", "News · Aftonbladet, AP, Reuters", nb);

  var tp = TGP.filter(function (g) { return shown("g:" + g.s); });
  T.telegram = tile("telegram", "Telegram", tp.length ? lst("telegram", tp.map(function (g) {
    return row("g:" + g.s, '<a class="lnk" href="' + esc(g.u) + '" target="_blank" rel="noopener">' + esc(g.t.length > 140 ? g.t.slice(0, 140) + "…" : g.t) + "</a>", g.s, '<span class="mut">' + ago(g.ts) + "</span>");
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
      .filter(function (v) { return shown(v.key); });
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
  sb.functions.invoke("feeds", { body: { yt: chs.map(function (c) { return c.id; }) } }).then(function (r) {
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
var NEWS_SRC = [
  { name: "Aftonbladet", urls: ["https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/", "https://news.google.com/rss/search?q=site:aftonbladet.se&hl=sv&gl=SE&ceid=SE:sv"] },
  { name: "AP", urls: ["https://news.google.com/rss/search?q=site:apnews.com&hl=en-US&gl=US&ceid=US:en"] },
  { name: "Reuters", urls: ["https://news.google.com/rss/search?q=site:reuters.com&hl=en-US&gl=US&ceid=US:en"] }
];
var TG_SRC = ["ClashReport"];
var NEWS = [], TGP = [], NERR = "", nBusy = false;
function fetchNews() {
  if (!sb || !USER || nBusy) return;
  nBusy = true;
  sb.functions.invoke("feeds", { body: { news: NEWS_SRC.map(function (x) { return { id: x.name, urls: x.urls }; }), tg: TG_SRC } }).then(function (r) {
    nBusy = false;
    if (r.error || !r.data || r.data._err) NERR = (r.error && r.error.message) || (r.data && r.data._err) || "no data";
    else {
      NEWS = r.data.news || []; TGP = r.data.tg || [];
      var got = {}; NEWS.forEach(function (n) { got[n.s] = 1; });
      var miss = NEWS_SRC.filter(function (x) { return !got[x.name]; }).map(function (x) { return x.name; });
      NERR = miss.length ? "no headlines from " + miss.join(", ") : "";
    }
    render();
  });
}

// ---- Weather (Open-Meteo, no key needed) ----
var WX = null;
var WC = { 0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers", 81: "Rain showers", 82: "Heavy showers", 85: "Snow showers", 86: "Snow showers", 95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm" };
function wxText(c) { return WC[c] || "Unknown"; }
function fetchWeather() {
  fetch("https://api.open-meteo.com/v1/forecast?latitude=59.437&longitude=24.7536&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,uv_index_max&wind_speed_unit=ms&timezone=Europe%2FTallinn&forecast_days=7")
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
    return '<div class="row"><span>' + nm + " <small>" + wxText(d.weather_code[k]) + '</small></span><span class="r">' + d.precipitation_sum[k].toFixed(1) + " mm · " + Math.round(d.temperature_2m_min[k]) + "° / <b>" + Math.round(d.temperature_2m_max[k]) + "°</b></span></div>";
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
  if (a === "open") { var ch = k.charAt(0); if (ch === "t") openTwitch(k.slice(2)); else if (ch === "v") openYT(k.slice(2)); else openStock(k.slice(2)); return; }
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
    fetchQuotes(); fetchTwitch(); fetchYT(); fetchNews();
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
fetchTwitch(); setInterval(fetchTwitch, 60000); setInterval(fetchQuotes, 300000); setInterval(fetchYT, 600000); setInterval(fetchNews, 300000);
setInterval(tick, 30000);
