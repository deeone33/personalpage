var VERSION = 4;

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
      applyWall();
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
  return '<div class="row"><span>' + (f ? '<i class="fv">★</i>' : "") + (op ? '<button class="lnk" data-a="open" data-k="' + esc(key) + '">' + main + "</button>" : main) + (sub ? " <small>" + esc(sub) + "</small>" : "") +
    '</span><span class="r">' + right + ed + "</span></div>";
}
function shown(key) { return !P.hidden[key]; }
function favFirst(a, b) { return (P.fav[b.key] ? 1 : 0) - (P.fav[a.key] ? 1 : 0); }
function card(cls, title, body) { return '<div class="card ' + cls + '"><h3>' + title + "</h3>" + body + "</div>"; }

function render() {
  var D = DATA, html = "";
  var t = WX ? Math.round(WX.current.temperature_2m) : D.weather.temp;
  var note = WX ? wxText(WX.current.weather_code) + " · feels " + Math.round(WX.current.apparent_temperature) + "°" : D.weather.note;
  html += '<div class="card click" data-a="weather" tabindex="0" role="button" aria-label="Open Tallinn details"><h3>Tallinn</h3><div class="big">' + t + '°</div><span class="mut">' + esc(note) + "</span></div>";
  D.inbox.forEach(function (m) {
    html += card("", m.name, '<div class="big">' + m.n + '</div><span class="mut">unread</span>');
  });
  var tw = (TWC ? TW : D.twitch).filter(function (s) { return s.live && shown("t:" + s.id); })
    .map(function (s) { s.key = "t:" + s.id; return s; })
    .sort(function (a, b) { return favFirst(a, b) || b.v - a.v; });
  html += card("", "Live now", '<div class="big">' + tw.length + '</div><span class="mut">of your follows</span>');

  html += card("w2 h2", "Top stories · merged from many sources",
    D.news.map(function (s) { return '<div class="row"><span>' + esc(s.t) + '</span><span class="pill ' + (s.n > 3 ? "ac" : "") + '">×' + s.n + "</span></div>"; }).join(""));

  html += card("w2", "Live on Twitch", (tw.length ? tw.map(function (x) {
    var vv = x.v >= 1000 ? (x.v / 1000).toFixed(1) + "k" : x.v;
    return row(x.key, '<span class="dot"></span>' + esc(x.name || x.id), x.sub, '<span class="mut">' + vv + "</span>", TWC ? 1 : 0);
  }).join("") : '<div class="empty">Nobody you follow is live.</div>') +
    (TWC || !window.TWITCH_CLIENT_ID ? "" : '<button data-a="twConnect">Connect Twitch to show your real follows</button>'));

  var yt = D.youtube.map(function (v) { v.key = "y:" + v.ch; return v; }).filter(function (v) { return shown(v.key); }).sort(favFirst);
  html += card("w2", "YouTube", yt.length ? yt.map(function (v) {
    return row(v.key, esc(v.t), v.ch, '<span class="mut">' + v.age + "</span>" + (P.fav[v.key] ? '<span class="pill ac">new</span>' : ""));
  }).join("") : '<div class="empty">No videos. Restore channels in Settings.</div>');

  var SL = P.stocks || D.stocks;
  var st = SL.map(function (x) { var q = QUOTES[tk(x.id)]; return { id: x.id, name: x.name, c: q ? q.c : (QLOADED ? null : x.c), p: q ? q.p : null, key: "s:" + x.id }; }).filter(function (x) { return shown(x.key); })
    .sort(function (x, y) { return favFirst(x, y) || Math.abs(y.c || 0) - Math.abs(x.c || 0); });
  var add = EDIT ? '<form id="addStock" class="add"><input id="stockIn" placeholder="Add symbol, e.g. NASDAQ:NVDA" aria-label="Stock symbol"><button>Add</button></form><form id="impStock" class="add imp"><textarea id="impIn" rows="2" placeholder="Import: paste your TradingView export, e.g. NASDAQ:NVDA,NASDAQ:AAPL" aria-label="Import watchlist"></textarea><button>Import</button></form>' : "";
  html += card("w2", "Stocks · biggest moves first", (st.length ? st.map(function (x) {
    var c = x.c, up = c >= 0;
    return row(x.key, "<b>" + esc(x.id) + "</b>", (x.p != null ? x.p.toFixed(2) : x.name), c == null ? '<span class="mut">—</span>' : '<span class="' + (up ? "up" : "down") + '">' + (up ? "▲ +" : "▼ ") + c.toFixed(1) + "%</span>", 1);
  }).join("") : '<div class="empty">No stocks. Restore them in Settings.</div>') + add);

  $("grid").innerHTML = html;
  renderHidden();
}

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
function twToken() { try { return localStorage.getItem("sp_twitch"); } catch (e) { return null; } }
function twBtn() { $("twBtn").textContent = twToken() ? "Disconnect" : "Connect"; }
function twConnect() {
  location.href = "https://id.twitch.tv/oauth2/authorize?client_id=" + TWITCH_CLIENT_ID + "&redirect_uri=" + encodeURIComponent(TWITCH_REDIRECT) + "&response_type=token&scope=user:read:follows&state=twitch";
}
function twDisconnect() { try { localStorage.removeItem("sp_twitch"); } catch (e) {} TW = null; TWC = false; twBtn(); render(); }
function twGet(path, tok) {
  return fetch("https://api.twitch.tv/helix/" + path, { headers: { Authorization: "Bearer " + tok, "Client-Id": TWITCH_CLIENT_ID } })
    .then(function (r) { if (r.status === 401) throw new Error("expired"); return r.json(); });
}
function fetchTwitch() {
  var tok = twToken(); twBtn();
  if (!tok || !window.TWITCH_CLIENT_ID) return;
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
var QUOTES = {}, QLOADED = false;
function tk(id) { return id.indexOf(":") >= 0 ? id.split(":").pop() : id; }
function fetchQuotes() {
  if (!sb || !USER) return;
  var list = (P.stocks || DATA.stocks).map(function (x) { return tk(x.id); });
  sb.functions.invoke("quotes", { body: { symbols: list } }).then(function (r) {
    if (r.error || !r.data) { setMsg("Prices unavailable: " + (r.error ? r.error.message : "no data")); return; }
    QUOTES = r.data; QLOADED = true; render();
  });
}
document.addEventListener("submit", function (e) {
  if (e.target.id !== "impStock") return;
  e.preventDefault();
  var list = $("impIn").value.split(/[,\n;]+/).map(function (x) { return x.trim().toUpperCase(); })
    .filter(function (x) { return x && x.indexOf("###") !== 0 && x.indexOf(" ") < 0; });
  if (!list.length) return;
  if (!P.stocks) P.stocks = [];
  list.forEach(function (v) {
    if (!P.stocks.some(function (x) { return x.id === v; })) P.stocks.push({ id: v, name: "", p: null, c: null });
    delete P.hidden["s:" + v];
  });
  persist(); render(); fetchQuotes();
});

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
  persist(); render(); fetchQuotes();
});

// ---- Events ----
document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-a]");
  if (!b) return;
  var a = b.dataset.a, k = b.dataset.k;
  if (a === "weather") { openWeather(); return; }
  if (a === "twConnect") { twConnect(); return; }
  if (a === "open") { if (k.charAt(0) === "t") openTwitch(k.slice(2)); else openStock(k.slice(2)); return; }
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
$("wallClear").onclick = function () { try { localStorage.removeItem("sp_wall"); } catch (e) {} applyWall(); };

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
  sb.from("user_prefs").select("prefs").eq("user_id", u.id).maybeSingle().then(function (r) {
    if (r.error) { setMsg("Could not load your settings: " + r.error.message); return; }
    if (r.data && r.data.prefs && r.data.prefs.theme) {
      P = Object.assign({ theme: "dark", accent: DEFAULT_ACCENT, fav: {}, hidden: {} }, r.data.prefs);
      save("sp_prefs", P); applyTheme(); render();
    } else { persist(); }
    fetchQuotes();
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
fetchTwitch(); setInterval(fetchTwitch, 60000); setInterval(fetchQuotes, 120000);
setInterval(tick, 30000);
