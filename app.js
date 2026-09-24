var VERSION = 2;

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
function row(key, main, sub, right) {
  var f = P.fav[key];
  var ed = EDIT ? '<button data-a="fav" data-k="' + esc(key) + '" aria-label="Favorite">' + (f ? "★" : "☆") + '</button><button data-a="hide" data-k="' + esc(key) + '" aria-label="Hide">✕</button>' : "";
  return '<div class="row"><span>' + (f ? '<i class="fv">★</i>' : "") + main + (sub ? " <small>" + esc(sub) + "</small>" : "") +
    '</span><span class="r">' + right + ed + "</span></div>";
}
function shown(key) { return !P.hidden[key]; }
function favFirst(a, b) { return (P.fav[b.key] ? 1 : 0) - (P.fav[a.key] ? 1 : 0); }
function card(cls, title, body) { return '<div class="card ' + cls + '"><h3>' + title + "</h3>" + body + "</div>"; }

function render() {
  var D = DATA, html = "";
  html += card("", "Tallinn", '<div class="big">' + D.weather.temp + '°</div><span class="mut">' + esc(D.weather.note) + "</span>");
  D.inbox.forEach(function (m) {
    html += card("", m.name, '<div class="big">' + m.n + '</div><span class="mut">unread</span>');
  });
  var tw = D.twitch.filter(function (s) { return s.live && shown("t:" + s.id); })
    .map(function (s) { s.key = "t:" + s.id; return s; })
    .sort(function (a, b) { return favFirst(a, b) || b.v - a.v; });
  html += card("", "Live now", '<div class="big">' + tw.length + '</div><span class="mut">of your follows</span>');

  html += card("w2 h2", "Top stories · merged from many sources",
    D.news.map(function (s) { return '<div class="row"><span>' + esc(s.t) + '</span><span class="pill ' + (s.n > 3 ? "ac" : "") + '">×' + s.n + "</span></div>"; }).join(""));

  html += card("w2", "Live on Twitch", tw.length ? tw.map(function (s) {
    return row(s.key, '<span class="dot"></span>' + esc(s.id), s.sub, '<span class="mut">' + (s.v / 1000).toFixed(1) + "k</span>");
  }).join("") : '<div class="empty">Nobody you follow is live.</div>');

  var yt = D.youtube.map(function (v) { v.key = "y:" + v.ch; return v; }).filter(function (v) { return shown(v.key); }).sort(favFirst);
  html += card("w2", "YouTube", yt.length ? yt.map(function (v) {
    return row(v.key, esc(v.t), v.ch, '<span class="mut">' + v.age + "</span>" + (P.fav[v.key] ? '<span class="pill ac">new</span>' : ""));
  }).join("") : '<div class="empty">No videos. Restore channels in Settings.</div>');

  var st = D.stocks.map(function (s) { s.key = "s:" + s.id; return s; }).filter(function (s) { return shown(s.key); })
    .sort(function (a, b) { return favFirst(a, b) || Math.abs(b.c) - Math.abs(a.c); });
  html += card("w2", "Stocks · biggest moves first", st.length ? st.map(function (s) {
    var up = s.c >= 0;
    return row(s.key, "<b>" + s.id + "</b>", s.name, '<span class="' + (up ? "up" : "down") + '">' + (up ? "▲ +" : "▼ ") + s.c.toFixed(1) + "%</span>");
  }).join("") : '<div class="empty">No stocks. Restore them in Settings.</div>');

  $("grid").innerHTML = html;
  renderHidden();
}

function renderHidden() {
  var keys = Object.keys(P.hidden).filter(function (k) { return P.hidden[k]; });
  $("hiddenList").innerHTML = keys.length ? keys.map(function (k) {
    return '<div class="row"><span>' + esc(k.slice(2)) + '</span><button data-a="show" data-k="' + esc(k) + '">Restore</button></div>';
  }).join("") : "Nothing hidden.";
}

// ---- Events ----
document.addEventListener("click", function (e) {
  var b = e.target.closest("button[data-a]");
  if (!b) return;
  var a = b.dataset.a, k = b.dataset.k;
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
applyTheme(); applyWall(); tick(); render(); initAuth();
setInterval(tick, 30000);
