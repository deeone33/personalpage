// OmniTree admin overview.
// This page holds no data of its own. Everything comes from the feeds function, which first asks Supabase who is
// signed in and only answers when that is the site owner's confirmed email. Anyone else who opens this page gets "Not allowed".
// Five tabs: Visitors (everyone who opened the front page, by IP address), Accounts, What is used, Server use (the calls
// to the super-function against Supabase's monthly allowance, by account and by purpose), and Feedback.
(function () {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var sb = null, FN = window.FEEDS_FN || "feeds", D = null, Q = "", OPEN = {}, SORT = "seen", SORTDIR = -1, TAB = "visitors", VF = "all", VOPEN = {}, LATESTN = 25, FF = "todo", FK = "all", FOPEN = {}, COPEN = {};
  try { sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (e) {}
  // use the accent colour chosen on the main page, if there is one
  try {
    var ac = (JSON.parse(localStorage.getItem("sp_prefs") || "{}").accent || "");
    if (/^#[0-9a-f]{6}$/i.test(ac)) {
      var n = parseInt(ac.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, st = document.documentElement.style;
      st.setProperty("--ac", ac); st.setProperty("--acfg", (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#111" : "#fff");
      st.setProperty("--acsoft", "rgba(" + r + "," + g + "," + b + ",.16)"); st.setProperty("--acglow", "rgba(" + r + "," + g + "," + b + ",.35)");
    }
  } catch (e) {}

  function call(body) {
    return sb.functions.invoke(FN, { body: { admin: body } }).then(function (r) {
      if (r.error) throw new Error(r.error.message || "The function did not answer");
      if (!r.data || r.data._err) throw new Error((r.data && r.data._err) || "The function needs updating (redeploy super-function)");
      return r.data;
    });
  }
  function msg(t) { $("aMsg").textContent = t || ""; }
  function gate(title, text) {
    $("aWho").textContent = "";
    $("aBody").innerHTML = '<div class="agate"><h2>' + esc(title) + '</h2><p class="mut">' + esc(text) + '</p><p><a class="btn" href="./">Go to the site</a></p></div>';
  }
  function load() {
    if (!sb) { gate("Could not start", "Supabase did not load. Check your connection and config.js."); return; }
    msg("");
    $("aWho").textContent = "Loading…";
    sb.auth.getSession().then(function (s) {
      if (!s.data || !s.data.session) { gate("Sign in first", "Sign in on the main page, then open this page again."); return; }
      return call({ op: "overview" }).then(function (d) { D = d; render(); });
    }).catch(function (e) {
      if (/not allowed/i.test(e.message)) gate("Not allowed", "This page is only for the site owner. Your account cannot see it.");
      else gate("Could not load the overview", e.message);
    });
  }

  // ---- small helpers ----
  function dur(s) { s = Math.round(s || 0); if (s < 60) return s ? "<1m" : "0"; var m = Math.round(s / 60); return m < 60 ? m + "m" : Math.floor(m / 60) + "h " + (m % 60) + "m"; }
  function ago(t) { if (!t) return "never"; var m = Math.max(0, Math.round((Date.now() - t) / 60000)); return m < 2 ? "just now" : m < 60 ? m + " min ago" : m < 1440 ? Math.round(m / 60) + " h ago" : Math.round(m / 1440) + " d ago"; }
  function date(t) { return t ? new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "–"; }
  function stamp(t) { return t ? new Date(t).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "–"; }
  function dayKey(t) { var d = new Date(t); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }   // your own (local) day
  function isUuid(x) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(x || "")); }
  // the timeline: what happened, in words
  var EVW = { first: "Opened the page, first time", open: "Opened the page", login: "Signed in", logout: "Signed out", user_signedup: "Created an account", user_recovery_requested: "Asked for a password reset", user_modified: "Changed password or email", user_deleted: "Account deleted" };
  // one line: when (and until when it was in use), what, who or from where, the device, where they came from
  function evRow(e, byId, side) {
    var hm = function (t) { return new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); };
    var when = stamp(e.t);
    var u = e.u && byId[e.u], who = u ? u.email : e.u ? "a deleted account" : "not signed in";
    var what = (EVW[e.kind] || e.kind) + (e.until ? ", in use until " + (dayKey(e.until) === dayKey(e.t) ? hm(e.until) : stamp(e.until)) : "");
    var auth = e.kind !== "first" && e.kind !== "open";
    return '<div class="' + (auth ? "evauth" : e.kind === "first" ? "evfirst" : "") + '"><b>' + esc(when) + "</b><span>" + esc(what) + "</span><span>" + esc(side === "ip" ? e.ip || "–" : side === "both" ? who + " · " + (e.ip || "–") : who) + "</span><span>" + esc(auth ? "" : device(e.ua)) + '</span><span class="mut">' + esc(auth ? "" : [e.ref || "Direct", e.lang].filter(Boolean).join(" · ")) + "</span></div>";
  }
  function lastDays(n) { var out = []; for (var i = n - 1; i >= 0; i--) out.push(dayKey(Date.now() - i * 86400000)); return out; }
  function bars(vals, days, unit) {
    var max = Math.max.apply(null, vals.concat([1]));
    return '<div class="bars">' + vals.map(function (v, i) { return "<i" + (v ? "" : ' class="z"') + ' style="height:' + Math.max(1, Math.round(v / max * 100)) + '%" title="' + esc(days[i] + ": " + (unit === "time" ? dur(v) : v)) + '"></i>'; }).join("") +
      '</div><div class="baxis"><span>' + esc(days[0].slice(5)) + "</span><span>highest day: " + (unit === "time" ? dur(max) : max) + "</span><span>today</span></div>";
  }
  function hbars(rows, unit) {
    var max = Math.max.apply(null, rows.map(function (r) { return r[1]; }).concat([1]));
    return rows.length ? rows.map(function (r) { return '<div class="hb"><span title="' + esc(r[0]) + '">' + esc(r[0]) + '</span><em><u style="width:' + Math.round(r[1] / max * 100) + '%"></u></em><b>' + (unit === "time" ? dur(r[1]) : (+r[1]).toLocaleString("en-GB")) + "</b></div>"; }).join("") : '<p class="mut sn">Nothing yet.</p>';
  }
  // "Mozilla/5.0 (Windows NT 10.0 ...) Chrome/141 ..." -> "Chrome on Windows"
  function device(ua) {
    ua = String(ua || "");
    if (!ua) return "Unknown";
    if (/bot|crawl|spider|slurp|preview|headless|monitor|curl|python|wget/i.test(ua)) return "Automated (a bot)";
    var br = /Edg\//.test(ua) ? "Edge" : /OPR\/|Opera/.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Browser";
    var os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad|iPod/.test(ua) ? "iPhone / iPad" : /Mac OS X/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "";
    return br + (os ? " on " + os : "");
  }
  // ---- Person or bot? A best guess per visitor from what the visit log holds. It is a guess, never certain:
  // the reasons are shown when you hover the label. ----
  // networks that crawlers and scanners run from, by the start of the IP address: [prefix, whose it is, 1 = a known crawler]
  var NETS = [["66.249.", "Google's crawler", 1], ["192.178.", "Google", 1], ["74.125.", "Google", 1], ["64.233.", "Google", 1], ["72.14.", "Google", 1], ["209.85.", "Google", 1], ["216.239.", "Google", 1], ["142.250.", "Google", 1],
    ["40.77.", "Microsoft's Bing crawler", 1], ["157.55.", "Microsoft's Bing crawler", 1], ["207.46.", "Microsoft's Bing crawler", 1], ["17.", "Apple's own network"],["31.13.", "Meta (link previews)", 1], ["66.220.", "Meta (link previews)", 1], ["69.171.", "Meta (link previews)", 1], ["173.252.", "Meta (link previews)", 1],
    ["149.154.", "Telegram (link previews)", 1], ["91.108.", "Telegram (link previews)", 1], ["162.158.", "Cloudflare"], ["172.64.", "Cloudflare"], ["172.71.", "Cloudflare"], ["104.16.", "Cloudflare"],
    ["3.", "an Amazon data centre"], ["13.", "a data centre (Amazon or Microsoft)"], ["18.", "an Amazon data centre"], ["34.", "a data centre (Amazon or Google)"], ["35.", "a data centre (Amazon or Google)"],["52.", "a data centre (Amazon or Microsoft)"], ["54.", "an Amazon data centre"],
    ["20.", "a Microsoft data centre"], ["40.", "a Microsoft data centre"], ["104.196.", "a Google data centre"], ["104.154.", "a Google data centre"], ["159.203.", "a DigitalOcean data centre"], ["167.99.", "a DigitalOcean data centre"], ["138.68.", "a DigitalOcean data centre"], ["165.22.", "a DigitalOcean data centre"],
    ["5.161.", "a Hetzner data centre"], ["65.108.", "a Hetzner data centre"], ["65.109.", "a Hetzner data centre"], ["95.216.", "a Hetzner data centre"], ["135.181.", "a Hetzner data centre"], ["51.15.", "a Scaleway data centre"], ["51.158.", "a Scaleway data centre"], ["45.33.", "a Linode data centre"], ["172.104.", "a Linode data centre"], ["139.162.", "a Linode data centre"]];
  // which part of the world a country's time zones belong to, to spot a visitor whose clock is on another continent than its IP address
  var ZONE_OF = {};
  [["Europe", "AD AL AT AX BA BE BG BY CH CZ DE DK EE ES FI FO FR GB GG GI GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS SE SI SK SM UA VA XK"],
    ["America", "US CA MX BR AR CL CO PE VE EC BO PY UY GT CU DO HN NI SV CR PA PR JM TT HT BS BB"],
    ["Asia", "CN JP KR IN ID TH VN PH MY SG HK TW PK BD LK NP UZ AE SA IL IQ IR QA KW OM JO LB"],
    ["Africa", "ZA NG EG KE MA DZ TN GH ET TZ UG SN CI CM AO"], ["Australia", "AU"], ["Pacific", "NZ"]].forEach(function (g) { g[1].split(" ").forEach(function (c) { ZONE_OF[c] = g[0]; }); });
  var MYCHROME = +((navigator.userAgent.match(/Chrome\/(\d+)/) || [])[1] || 0);
  // -> { k: "acct" | "bot" | "likely" | "unsure" | "person", l: label, why: [reasons] }
  function kindOf(o, signedIn) {
    var ua = String(o.ua || ""), tz = String(o.tz || ""), cc = String(o.cc || "").toUpperCase(), why = [], score = 0, sure = false;
    if (signedIn) return { k: "acct", l: "Account", why: ["Signed in, so a real user."] };
    if (!ua) { score += 2; why.push("the browser did not say what it is"); }
    if (/bot|crawl|spider|slurp|preview|headless|monitor|curl|python|wget|lighthouse|pagespeed|scan|fetch|http-client|go-http|axios|node/i.test(ua)) { sure = true; why.push("it calls itself an automated program"); }
    var net = NETS.filter(function (n) { return o.ip.indexOf(n[0]) === 0; })[0];
    if (net) { if (net[2]) sure = true; else score += 3; why.push("the address belongs to " + net[1] + ", not a home or mobile connection"); }
    if (/^(UTC|Etc\/)/.test(tz)) { score += 2; why.push("its clock is set to UTC, which servers use and people rarely do"); }
    else if (!tz) { score += 1; why.push("it gave no time zone"); }
    else if (ZONE_OF[cc] && /^(Europe|America|Asia|Africa|Australia)\//.test(tz) && tz.split("/")[0] !== ZONE_OF[cc]) { score += 2; why.push("its clock (" + tz + ") is on another continent than its address (" + country(cc) + "): a server, or a person on a VPN"); }
    if (!o.lang) { score += 1; why.push("it gave no language"); }
    var cv = +((ua.match(/Chrome\/(\d+)/) || [])[1] || 0);
    if (cv && MYCHROME && MYCHROME - cv > 15) { score += 1; why.push("a very old browser version (Chrome " + cv + ")"); }
    if (/Linux x86_64/.test(ua) && !/Android/.test(ua) && o.n <= 2 && !o.ref) { score += 1; why.push("desktop Linux with a single direct visit, typical of servers"); }
    if (sure) return { k: "bot", l: "Bot", why: why };
    if (score >= 3) return { k: "likely", l: "Likely a bot", why: why };
    if (score >= 1) return { k: "unsure", l: "Unsure", why: why };
    return { k: "person", l: "Looks like a person", why: ["Nothing about this visit looks automated" + (o.n > 1 ? ", and it came back " + o.n + " times." : ".")] };
  }
  var CN = null; try { CN = new Intl.DisplayNames(["en"], { type: "region" }); } catch (e) {}
  function country(cc) { cc = String(cc || "").toUpperCase(); if (!/^[A-Z]{2}$/.test(cc) || cc === "XX" || cc === "T1") return "Unknown"; try { return (CN && CN.of(cc)) || cc; } catch (e) { return cc; } }
  var BOXES = { weather: "Weather", mail: "Mail", live: "Radio", news: "News", telegram: "Telegram", twitch: "Twitch", youtube: "YouTube", stocks: "Stocks", reddit: "Reddit", sports: "Sports" };
  var WHERE = { page: "Page", settings: "Settings", window: "A window", side: "Docked panel", menu: "Menu icons", live: "Radio" };
  var ACT = {
    "open-a": "opened a headline", "open-m": "opened a Telegram post", "open-r": "opened a Reddit post", "open-t": "opened a stream", "open-v": "opened a video", "open-p": "opened a game", "open-s": "opened a stock",
    refresh: "pressed reload", nseen: "cleared “new”", nfilt: "filtered headlines", filtmenu: "opened Sources", filttoggle: "showed / hid a source", opennotes: "opened notes", opencal: "opened the calendar", bellmenu: "opened the bell",
    cogmenu2: "opened the cogwheel menu", clockmenu2: "opened the timer menu", acctmenu2: "opened the account menu", setpanel: "opened Settings", setsec: "changed Settings section", editmode: "edited the layout", openhelp: "opened Help", openfb: "opened Feedback", fbsend: "sent feedback", openbrief: "opened the summary",
    noteadd: "added a note / task", notedone: "ticked a task", notetab: "switched notes tab", notedel: "deleted a note", notepin: "pinned a note", calday: "picked a day", calnav: "changed month", dock: "docked a player", undock: "closed a docked player",
    dockchat: "toggled docked chat", twpop: "popped out a stream", twchat: "popped out chat", sidedock: "docked a panel", toastgo: "opened a notification", toastx: "dismissed a notification", bellgo: "opened from history",
    weather: "opened weather", mail: "opened mail", mailread: "marked mail read", spfav: "starred a team", fav: "starred something", hide: "hid an item", boxoff: "hid a box", boxtoggle: "switched a box", signout: "signed out",
    radplay: "played the radio", radstop: "stopped the radio", radvol: "opened the volume", radinfo: "looked at the song", more: "pressed “show more”", fighter: "opened a fighter", nextday: "opened the next event", boxerr: "opened a problem"
  };
  function clickLabel(k) { var p = k.split(":"), w = BOXES[p[0]] || WHERE[p[0]] || p[0]; return w + ": " + (ACT[p[1]] || p[1]); }
  // feedback types: name in the list, then the questions the sender answered (same order as in the Feedback window)
  var FBK = { bug: ["Bug", "What went wrong", "How to make it happen again", "What was expected"], improve: ["Improvement", "What should be better", "How it should work", ""], idea: ["New idea", "What it should do", "When it would be used", ""], other: ["Other", "Message", "", ""], privacy: ["Privacy request", "Request", "", ""] };
  function fbWho(f, byId) { var u = f.user_id && byId[f.user_id]; return u ? u.email : f.contact || (f.user_id ? "a deleted account" : ""); }
  function fbAct(kind, id) {
    var f = D && (D.feedback || []).filter(function (x) { return String(x.id) === String(id); })[0];
    if (!f) return;
    if (kind === "copy") {
      var k = FBK[f.kind] || FBK.other, byId = {}; (D.users || []).forEach(function (u) { byId[u.id] = u; });
      var txt = ["[" + k[0] + "] " + f.title, "About: " + (f.area || "–") + (f.freq ? " · " + f.freq : ""), "From: " + (fbWho(f, byId) || "no name") + " · " + stamp(Date.parse(f.at))];
      [[k[1], f.a], [k[2], f.b], [k[3], f.c]].forEach(function (p) { if (p[0] && p[1]) txt.push("", p[0] + ":", p[1]); });
      if (f.info) txt.push("", "Version " + f.info.v + " · " + device(f.info.ua) + " · window " + f.info.win + " · " + f.info.theme + " theme");
      try { navigator.clipboard.writeText(txt.join("\n")).then(function () { msg("Copied."); }, function () { msg("Could not copy."); }); } catch (e) { msg("Could not copy."); }
      return;
    }
    if (kind === "del" && !confirm("Delete this feedback?\n\n" + f.title)) return;
    msg("Working…");
    call(kind === "del" ? { op: "fbdel", id: f.id } : { op: "fbset", id: f.id, status: kind }).then(function () {
      if (kind === "del") D.feedback = D.feedback.filter(function (x) { return x !== f; }); else f.status = kind;
      msg(""); render();
    }).catch(function (e) { msg("That did not work: " + e.message); });
  }
  // ---- Server use: the calls to the super-function (Supabase's free plan: 500,000 a month) ----
  var CALL_LIMIT = 500000;
  var CALLK = { news: "News headlines", tg: "Telegram posts", tgOld: "Older Telegram posts", yt: "YouTube box (your channels)", mail: "Gmail (saved the old way)",
    "mailx:fetch": "Gmail unread count", "mailx:save": "Gmail setup", "mailx:remove": "Gmail setup", "mailx:send": "Email notifications", mailNotify: "Email notifications",
    "ytd:top": "YouTube Discover", "ytd:week": "YouTube Discover", "ytd:live": "YouTube Discover", "ytd:topic": "YouTube Discover", "ytd:q": "YouTube search", "ytd:ch": "YouTube channels",
    "ytd:chpl": "YouTube playlists", "ytd:pl": "YouTube playlists", "ytd:next": "YouTube autoplay (next video)", sportsx: "Sports (SHL and esports)", gamex: "Esports match details",
    teamx: "Esports team pages", playerx: "Esports player pages", shlteam: "SHL team pages", sptable: "SHL table", np: "Radio: what is playing", reddit: "Reddit",
    rdc: "Reddit comments", "nd:q": "News Discover (search)", "nd:try": "News Discover (preview)", article: "Full news articles (reader)", find: "Searching further back", peek: "Link previews", ics: "Followed calendars",
    frameok: "Web page box check", admin: "Owner panel", track: "Usage counting", deleteAccount: "Account deletion", precheck: "Browser pre-checks", other: "Other" };
  function callLabel(k) { return String(k).split("+").map(function (p) { return CALLK[p] || p; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(" + "); }
  function nf(n) { return Math.round(n).toLocaleString("en-GB"); }
  function callsHtml(byId) {
    // days in UTC here, as Supabase counts them
    var rows = D.calls || [], now = new Date(), d30 = [], today = now.toISOString().slice(0, 10), month = today.slice(0, 8);
    for (var i = 29; i >= 0; i--) d30.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
    var dim = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0).getDate(), dayNo = now.getUTCDate();
    var tot = 0, todayN = 0, perDay = {}, kinds = {}, who = {}, W = {};
    rows.forEach(function (r) {
      var n = +r.n || 0, k = callLabel(r.kind), w = r.who === "anon" ? (r.kind === "precheck" ? "Browser pre-checks" : "Not signed in (preview)") : (byId[r.who] ? byId[r.who].email : "a deleted account");
      perDay[r.day] = (perDay[r.day] || 0) + n;
      if (String(r.day).slice(0, 8) !== month) return;   // the rest only counts this month (what Supabase bills)
      tot += n; if (r.day === today) todayN += n;
      kinds[k] = (kinds[k] || 0) + n; who[w] = (who[w] || 0) + n;
      var o = W[w] = W[w] || { n: 0, t: 0, k: {}, days: {} }; o.n += n; if (r.day === today) o.t += n; o.k[k] = (o.k[k] || 0) + n; o.days[r.day] = (o.days[r.day] || 0) + n;
    });
    var pct = tot / CALL_LIMIT * 100, pace = dayNo ? tot / dayNo * dim : 0, pacePct = pace / CALL_LIMIT * 100;
    var lvl = function (p) { return p >= 85 ? "bad" : p >= 60 ? "warn" : "ok"; };
    var sorted = function (o) { return Object.keys(o).sort(function (a, b) { return o[b] - o[a]; }).map(function (k) { return [k, o[k]]; }); };
    var h = "";
    if (D.callsErr) h += '<div class="apanel w12 awarn"><b>Calls are not being counted yet.</b> <span class="mut">' + esc(D.callsErr) + "</span></div>";
    h += '<div class="apanel w12"><h2>Calls to the server this month</h2>' +
      '<p class="ahint">Supabase&rsquo;s free plan allows ' + nf(CALL_LIMIT) + ' calls to the Edge Functions each calendar month (counted in UTC). Every box that updates, every search and every login check is one call. These counts can be up to a minute behind.</p>' +
      '<div class="ameter ' + lvl(Math.max(pct, pacePct)) + '"><div class="amtop"><b>' + nf(tot) + "</b><span>of " + nf(CALL_LIMIT) + " · " + pct.toFixed(1) + "% used</span></div>" +
      '<div class="ambar"><u style="width:' + Math.min(100, pct).toFixed(2) + '%"></u><i style="left:' + Math.min(100, pacePct).toFixed(2) + '%" title="Where this month ends at today&rsquo;s pace"></i></div>' +
      '<div class="amsub"><span>Today: <b>' + nf(todayN) + "</b></span><span>Average a day: <b>" + nf(dayNo ? tot / dayNo : 0) + "</b></span><span>At this pace: <b>" + nf(pace) + "</b> by the end of the month (" + pacePct.toFixed(0) + "% of the limit)</span></div></div>" +
      '<p class="ahint">Not in these numbers: the stock-price function (quotes), which Supabase counts separately, and calls made before this counting started. Supabase&rsquo;s own total is in its dashboard under Reports.</p></div>';
    h += '<div class="agrid">' +
      panel("Calls per day", "All calls together, last 30 days.", bars(d30.map(function (d) { return perDay[d] || 0; }), d30), "w6") +
      panel("What the calls are for", "This month, by the part of the site that made them.", hbars(sorted(kinds).slice(0, 12)), "w6") +
      panel("Who makes them", "This month. &ldquo;Browser pre-checks&rdquo; are the browser asking the server whether the site may call it; it remembers the answer for 2 hours.", hbars(sorted(who).slice(0, 10)), "w12") + "</div>";
    var accts = sorted(who).map(function (x) { return x[0]; });
    h += '<div class="apanel w12"><h2>Per account</h2><p class="ahint">This month. Click a line for what that account&rsquo;s calls were for, and its last 14 days.</p>' +
      '<div class="tablewrap"><table class="atable"><thead><tr><th>Account</th><th>This month</th><th>Today</th><th>Share</th><th>Mostly for</th></tr></thead><tbody>' +
      (accts.map(function (w) {
        var o = W[w], top = sorted(o.k).slice(0, 2).map(function (x) { return x[0]; }).join(", ");
        var out = '<tr class="crow" data-c="' + esc(w) + '"><td class="mail">' + esc(w) + '</td><td class="num">' + nf(o.n) + '</td><td class="num">' + nf(o.t) + '</td><td class="num">' + (tot ? (o.n / tot * 100).toFixed(1) : "0") + "%</td><td>" + esc(top) + "</td></tr>";
        if (COPEN[w]) { var d14 = d30.slice(-14); out += '<tr class="udetail"><td colspan="5"><div class="ud"><div><h3>Calls per day, last 14 days</h3>' + bars(d14.map(function (d) { return o.days[d] || 0; }), d14) + "</div><div><h3>What they were for, this month</h3>" + hbars(sorted(o.k).slice(0, 12)) + "</div></div></td></tr>"; }
        return out;
      }).join("") || '<tr><td colspan="5" class="mut">No calls counted yet.</td></tr>') + "</tbody></table></div></div>";
    return h;
  }
  function panel(title, hint, body, cls) { return '<div class="apanel ' + (cls || "") + '"><h2>' + title + "</h2>" + (hint ? '<p class="ahint">' + hint + "</p>" : "") + body + "</div>"; }

  // ---- the page ----
  function render() {
    var users = D.users || [], usage = D.usage || [], prefs = D.prefs || {}, visits = D.visits || [], now = D.now || Date.now(), d30 = lastDays(30), d7 = d30.slice(-7), today = d30[29];
    var byId = {}; users.forEach(function (u) { byId[u.id] = u; });
    // signed-in use, per account and per day
    var U = {}, DAY = {}, CLK = {};
    d30.forEach(function (d) { DAY[d] = { secs: 0, users: 0, ips: {}, anon: {} }; });
    usage.forEach(function (r) {
      var u = U[r.user_id] = U[r.user_id] || { days: {}, s7: 0, s30: 0, seen: 0, clk: {} }, ck = r.clicks || {};
      Object.keys(ck).forEach(function (k) { var v = +ck[k] || 0; u.clk[k] = (u.clk[k] || 0) + v; CLK[k] = (CLK[k] || 0) + v; });
      u.days[r.day] = r.secs; u.s30 += r.secs;
      if (d7.indexOf(r.day) >= 0) u.s7 += r.secs;
      var ls = Date.parse(r.last_seen); if (ls > u.seen) u.seen = ls;
      if (DAY[r.day]) { DAY[r.day].secs += r.secs; DAY[r.day].users++; }
    });
    // visitors: one entry per IP address, with all its visits (the list from the function is newest first)
    var IP = {}, ipList = [];
    // "active": the last moment the page was in use there (it says "still here" every 5 minutes while open and in view);
    // a visit that was only opened counts from when it was opened
    var lastIp = {};   // the address each account was last on
    visits.forEach(function (v) {
      var t = Date.parse(v.at), la = Date.parse(v.last_at) || 0, act = Math.max(t, la), k = v.ip || "unknown";
      var o = IP[k]; if (!o) { o = IP[k] = { ip: k, n: 0, last: t, act: act, first: t, cc: v.cc, ua: v.ua, ref: "", tz: v.tz, lang: v.lang, who: {}, rows: [] }; ipList.push(o); }
      o.n++; o.first = Math.min(o.first, t); o.act = Math.max(o.act, act); o.rows.push(v);
      if (v.ref && !o.ref) o.ref = v.ref;
      if (v.user_id) { o.who[v.user_id] = 1; if (!lastIp[v.user_id] || t > lastIp[v.user_id].t) lastIp[v.user_id] = { ip: k, t: t }; }
      // a day counts every address that opened or used the page that day
      [dayKey(t), la ? dayKey(la) : ""].forEach(function (d) { if (DAY[d]) { DAY[d].ips[k] = 1; if (!v.user_id) DAY[d].anon[k] = 1; } });
    });
    // signed-in use from before "still here" existed: an account's own last activity, on the address it was last on
    Object.keys(lastIp).forEach(function (id) { var s = U[id] && U[id].seen, o = IP[lastIp[id].ip]; if (o && s > o.act) o.act = s; });
    // ---- one timeline of everything: page opened (the first time from an address, or again), in use until, and the
    // account events from Supabase's sign-in log (signed up, signed in, signed out, password reset, account changed) ----
    var EV = [], firstAt = {};
    visits.forEach(function (v) { var t = Date.parse(v.at), k = v.ip || "unknown"; if (!firstAt[k] || t < firstAt[k]) firstAt[k] = t; });
    visits.forEach(function (v) {
      var t = Date.parse(v.at), la = Date.parse(v.last_at) || 0, k = v.ip || "unknown";
      EV.push({ t: t, until: la - t >= 60000 ? la : 0, kind: firstAt[k] === t ? "first" : "open", ip: k, u: v.user_id || "", ua: v.ua, ref: v.ref, lang: v.lang, tz: v.tz });
    });
    (D.auth || []).forEach(function (a) {
      var t = Date.parse(a.at); if (!t) return;
      EV.push({ t: t, kind: a.what, ip: a.ip || "", u: a.who || "" });
      if (a.ip && IP[a.ip]) { IP[a.ip].act = Math.max(IP[a.ip].act, t); if (isUuid(a.who)) IP[a.ip].who[a.who] = 1; }
    });
    EV.sort(function (a, b) { return b.t - a.t; });   // by when it started, so the times read in order
    ipList.sort(function (a, b) { return b.act - a.act; });
    var count = function (o) { return Object.keys(o).length; };
    var ips7 = {}; d7.forEach(function (d) { Object.keys(DAY[d].ips).forEach(function (k) { ips7[k] = 1; }); });
    var new7 = users.filter(function (u) { return u.created && now - Date.parse(u.created) < 7 * 86400000; }).length;
    $("aWho").textContent = "Signed in as " + D.me + " · updated " + new Date(now).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    var tile = function (v, l, s) { return '<div class="atile"><b>' + v + "</b><span>" + l + "</span>" + (s ? "<small>" + s + "</small>" : "") + "</div>"; };
    var h = '<div class="atiles">' +
      tile(count(DAY[today].ips), "visitors today", count(DAY[today].anon) + " of them not signed in") +
      tile(count(ips7), "visitors, last 7 days", "different IP addresses") +
      tile(users.length, "accounts", new7 ? new7 + " new in the last 7 days" : "none new this week") +
      tile(DAY[today].users, "accounts used today", dur(DAY[today].secs) + " on the site in total") + "</div>";
    var fbs = D.feedback || [], fbNew = fbs.filter(function (f) { return f.status === "new"; }).length;
    var tabs = [["visitors", "Visitors"], ["accounts", "Accounts"], ["usage", "What is used"], ["server", "Server use"], ["feedback", "Feedback" + (fbNew ? ' <i class="tabn">' + fbNew + " new</i>" : "")]];
    h += '<div class="atabs">' + tabs.map(function (t) { return '<button data-tab="' + t[0] + '"' + (TAB === t[0] ? ' class="on"' : "") + ">" + t[1] + "</button>"; }).join("") + "</div>";

    if (TAB === "visitors") {
      if (D.visitsErr) h += '<div class="apanel w12 awarn"><b>Visits are not being recorded yet.</b> <span class="mut">' + esc(D.visitsErr) + "</span></div>";
      var top = function (get, n) { var m = {}; ipList.forEach(function (o) { var k = get(o); m[k] = (m[k] || 0) + 1; }); return Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).slice(0, n).map(function (k) { return [k, m[k]]; }); };
      var list = ipList.filter(function (o) {
        var names = Object.keys(o.who).map(function (id) { return (byId[id] || {}).email || ""; }).join(" ").toLowerCase();
        if (VF === "anon" && count(o.who)) return false;
        if (VF === "user" && !count(o.who)) return false;
        return !Q || o.ip.toLowerCase().indexOf(Q) >= 0 || names.indexOf(Q) >= 0 || country(o.cc).toLowerCase().indexOf(Q) >= 0;
      });
      h += '<div class="agrid">' +
        panel("Visitors per day", "How many different IP addresses opened or used the front page each day, last 30 days. A visitor does not need an account.", bars(d30.map(function (d) { return count(DAY[d].ips); }), d30), "w6") +
        panel("Where they are", "By the country of the IP address, last 30 days.", hbars(top(function (o) { return country(o.cc); }, 6)), "w3") +
        panel("How they got here", "The site they clicked from. “Direct” means they typed the address or used a bookmark.", hbars(top(function (o) { return o.ref || "Direct"; }, 6)), "w3") + "</div>";
      // everyone's latest activity in one list
      if (D.authErr) h += '<div class="apanel w12 awarn"><b>Sign-ins are not in the timeline yet.</b> <span class="mut">' + esc(D.authErr) + "</span></div>";
      h += '<div class="apanel w12"><h2>Latest activity</h2><p class="ahint">Everything on the front page, newest first: the page opened (the first time from an address, or again) and until when it was in use, and sign-ups, sign-ins, sign-outs and password resets. Click an address below for all of its activity, or an account under Accounts for its own.</p><div class="vlist evall">' +
        (EV.slice(0, LATESTN).map(function (e) { return evRow(e, byId, "both"); }).join("") || '<div class="mut">Nothing yet.</div>') +
        (EV.length > LATESTN ? '<button class="amore" data-more="1">Show 50 more</button>' : "") + "</div></div>";
      h += '<div class="apanel w12"><h2>Visitors by IP address <span class="achips">' + [["all", "Everyone"], ["anon", "Not signed in"], ["user", "Signed in"]].map(function (f) { return '<button data-vf="' + f[0] + '"' + (VF === f[0] ? ' class="on"' : "") + ">" + f[1] + "</button>"; }).join("") + "</span></h2>" +
        '<p class="ahint">One line per IP address, last used first, for the last 30 days (visits are kept for 90). <b>Last active</b> is when the page was last open and in view there (it checks in every 5 minutes); point at it for when it was last opened. A visit is the page being opened or reloaded (within 30 minutes counts once); click a line to see each visit and how long it was in use. <b>Person or bot</b> is a best guess from the address, the browser and its clock; hover the label for the reasons.</p>' +
        '<div class="tablewrap"><table class="atable"><thead><tr><th>IP address</th><th>Country</th><th title="When the page was last open and in view from this address">Last active</th><th title="Visits from this address in the last 30 days, signed in or not">Visits</th><th>Person or bot</th><th>Who</th><th>Device</th><th>Came from</th></tr></thead><tbody>' +
        (list.slice(0, 300).map(function (o) {
          var who = Object.keys(o.who).map(function (id) { var u = byId[id]; return u ? esc(u.email) + (u.admin ? ' <span class="tag y">you</span>' : "") : "a deleted account"; });
          var kd = kindOf(o, who.length > 0);
          var out = '<tr class="vrow" data-ip="' + esc(o.ip) + '"><td class="mail">' + esc(o.ip) + "</td><td>" + esc(country(o.cc)) + '</td><td class="num" title="' + esc("Active " + stamp(o.act) + " · last opened " + stamp(o.last)) + '">' + ago(o.act) + '</td><td class="num">' + o.n + '</td><td><span class="tag kd-' + kd.k + '" title="' + esc(kd.why.join("; ")) + '">' + kd.l + "</span></td><td>" + (who.length ? who.join(", ") : '<span class="mut">not signed in</span>') + "</td><td>" + esc(device(o.ua)) + "</td><td>" + esc(o.ref || "Direct") + "</td></tr>";
          // everything from this address, newest first: opened (first time / again, and until when it was in use), and sign-ins
          if (VOPEN[o.ip]) { var evs = EV.filter(function (e) { return e.ip === o.ip; });
            out += '<tr class="udetail"><td colspan="8"><p class="ahint kdwhy"><b>' + kd.l + ":</b> " + esc(kd.why.join("; ")) + '</p><div class="vlist">' + evs.slice(0, 60).map(function (e) { return evRow(e, byId, "who"); }).join("") +
              (evs.length > 60 ? '<div class="mut">… and ' + (evs.length - 60) + " earlier</div>" : "") + "</div></td></tr>"; }
          return out;
        }).join("") || '<tr><td colspan="8" class="mut">' + (visits.length ? "Nobody matches." : "No visits recorded yet.") + "</td></tr>") +
        "</tbody></table></div>" + (list.length > 300 ? '<p class="ahint">Showing the 300 most recent of ' + list.length + ".</p>" : "") + "</div>";
    }

    if (TAB === "accounts") {
      var rows = users.map(function (u) { var x = U[u.id] || { s7: 0, s30: 0, seen: 0, days: {}, clk: {} }; return { u: u, x: x, p: prefs[u.id], created: Date.parse(u.created) || 0, seen: Math.max(x.seen, Date.parse(u.last) || 0), s7: x.s7, s30: x.s30, email: String(u.email || "").toLowerCase() }; })
        .filter(function (r) { return !Q || r.email.indexOf(Q) >= 0; })
        .sort(function (a, b) { return (a[SORT] > b[SORT] ? 1 : a[SORT] < b[SORT] ? -1 : 0) * SORTDIR || b.created - a.created; });
      var th = function (k, l) { return '<th data-sort="' + k + '" class="srt' + (SORT === k ? " on" : "") + '">' + l + (SORT === k ? (SORTDIR < 0 ? " ▾" : " ▴") : "") + "</th>"; };
      h += '<div class="agrid">' + panel("New accounts per day", "Last 30 days.", bars(d30.map(function (d) { return users.filter(function (u) { return u.created && dayKey(Date.parse(u.created)) === d; }).length; }), d30), "w6") +
        panel("Accounts used per day", "How many accounts had the page open each day, last 30 days.", bars(d30.map(function (d) { return DAY[d].users; }), d30), "w6") + "</div>";
      h += '<div class="apanel w12"><h2>Accounts</h2><p class="ahint">' + rows.length + " shown. Click a line for details and for the actions: send a password reset, block or delete. Click a column name to sort.</p>" +
        '<div class="tablewrap"><table class="atable"><thead><tr>' + th("email", "Email") + th("created", "Joined") + th("seen", "Last active") + th("s7", "Time, 7 days") + th("s30", "Time, 30 days") + "<th>Status</th></tr></thead><tbody>" +
        rows.map(function (r) {
          var u = r.u, p = r.p, tags = [];
          if (u.admin) tags.push('<span class="tag y">you (owner)</span>');
          if (!u.confirmed) tags.push('<span class="tag bad">email not confirmed</span>');
          if (u.banned) tags.push('<span class="tag bad">blocked</span>');
          if (!p) tags.push('<span class="tag">has not set anything up</span>');
          var out = '<tr class="urow" data-u="' + esc(u.id) + '"><td class="mail">' + esc(u.email) + '</td><td class="num">' + date(r.created) + '</td><td class="num">' + ago(r.seen) + '</td><td class="num">' + dur(r.s7) + '</td><td class="num">' + dur(r.s30) + "</td><td>" + (tags.join(" ") || '<span class="mut">fine</span>') + "</td></tr>";
          if (OPEN[u.id]) {
            var d14 = d30.slice(-14), set = p ? [p.twitch ? "Twitch connected" : "", p.yt ? "YouTube: " + p.yt + " channels" : "", p.mail ? "Gmail: " + p.mail + " inbox" + (p.mail > 1 ? "es" : "") : "", p.stocks ? p.stocks + " stocks" : "",
              p.notes + p.todos ? (p.notes + p.todos) + " notes and to-dos" : "", p.cal ? p.cal + " calendar events" : "", p.off.length ? "switched off: " + p.off.map(function (k) { return BOXES[k] || k; }).join(", ") : "all boxes on", p.theme + " theme"].filter(Boolean) : [];
            out += '<tr class="udetail"><td colspan="6"><div class="ud"><div><h3>Time on the site per day, last 14 days</h3>' + bars(d14.map(function (d) { return r.x.days[d] || 0; }), d14, "time") +
              (set.length ? '<h3 style="margin-top:12px">What this account has set up</h3><div class="tags">' + set.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</div>" : "") +
              "</div><div><h3>What this account uses most, last 30 days</h3>" + hbars(Object.keys(r.x.clk).sort(function (a, b) { return r.x.clk[b] - r.x.clk[a]; }).slice(0, 8).map(function (k) { return [clickLabel(k), r.x.clk[k]]; })) +
              '<div class="uacts"><button data-act="reset" data-id="' + esc(u.id) + '">Send password reset email</button>' +
              (u.confirmed ? "" : '<button data-act="confirm" data-id="' + esc(u.id) + '">Mark email as confirmed</button>') +
              (u.admin ? "" : '<button data-act="' + (u.banned ? "unblock" : "block") + '" data-id="' + esc(u.id) + '">' + (u.banned ? "Unblock" : "Block sign-in") + '</button><button class="danger" data-act="delete" data-id="' + esc(u.id) + '">Delete account…</button>') +
              "</div></div></div>" + (function () {
                // this account's whole story, newest first: every visit (from which address, and until when it was in use) and its sign-ins
                var mine = EV.filter(function (e) { return e.u === u.id; });
                return '<h3 style="margin-top:12px">Activity, last 30 days</h3><div class="vlist">' + (mine.slice(0, 60).map(function (e) { return evRow(e, byId, "ip"); }).join("") || '<div class="mut">Nothing in the last 30 days.</div>') +
                  (mine.length > 60 ? '<div class="mut">… and ' + (mine.length - 60) + " earlier</div>" : "") + "</div>";
              })() + "</td></tr>";
          }
          return out;
        }).join("") + "</tbody></table></div></div>";
    }

    if (TAB === "usage") {
      if (D.usageErr) h += '<div class="apanel w12 awarn"><b>Usage is not being collected yet.</b> <span class="mut">' + esc(D.usageErr) + "</span></div>";
      var withPrefs = users.filter(function (u) { return prefs[u.id]; });
      h += '<div class="agrid">' +
        panel("Time on the site per day", "All signed-in accounts together, last 30 days. Only counted while the page is open and visible.", bars(d30.map(function (d) { return DAY[d].secs; }), d30, "time"), "w6") +
        panel("Who spends the most time", "Last 7 days.", hbars(users.filter(function (u) { return U[u.id] && U[u.id].s7; }).sort(function (a, b) { return U[b.id].s7 - U[a.id].s7; }).slice(0, 8).map(function (u) { return [u.email, U[u.id].s7]; }), "time"), "w6") +
        panel("What people do most", "Button presses by signed-in accounts, last 30 days: which box, and what was pressed.", hbars(Object.keys(CLK).sort(function (a, b) { return CLK[b] - CLK[a]; }).slice(0, 14).map(function (k) { return [clickLabel(k), CLK[k]]; })), "w6") +
        panel("Boxes people keep switched on", "Out of " + withPrefs.length + " account" + (withPrefs.length === 1 ? "" : "s") + " that have saved settings.", hbars(Object.keys(BOXES).map(function (k) { return [BOXES[k], withPrefs.filter(function (u) { return prefs[u.id].off.indexOf(k) < 0; }).length]; }).sort(function (a, b) { return b[1] - a[1]; })), "w6") + "</div>";
    }
    if (TAB === "server") h += callsHtml(byId);
    if (TAB === "feedback") {
      if (D.feedbackErr) h += '<div class="apanel w12 awarn"><b>Feedback cannot be received yet.</b> <span class="mut">' + esc(D.feedbackErr) + "</span></div>";
      var cnt = function (fn) { return fbs.filter(fn).length; }, chip = function (attr, cur, k, l, n) { return "<button " + attr + '="' + k + '"' + (cur === k ? ' class="on"' : "") + ">" + l + (n == null ? "" : " " + n) + "</button>"; };
      var flist = fbs.filter(function (f) {
        if (FF === "todo" ? f.status === "done" : FF !== "all" && f.status !== FF) return false;
        if (FK !== "all" && f.kind !== FK) return false;
        return !Q || [f.title, f.a, f.b, f.c, f.area, f.contact, fbWho(f, byId)].join(" ").toLowerCase().indexOf(Q) >= 0;
      });
      h += '<div class="apanel w12"><h2>Feedback <span class="achips">' +
        chip("data-ff", FF, "todo", "To do", cnt(function (f) { return f.status !== "done"; })) + chip("data-ff", FF, "new", "New", fbNew) + chip("data-ff", FF, "doing", "Working on", cnt(function (f) { return f.status === "doing"; })) + chip("data-ff", FF, "done", "Done", cnt(function (f) { return f.status === "done"; })) + chip("data-ff", FF, "all", "Everything") +
        '<b class="asep"></b>' + chip("data-fk", FK, "all", "All types") + Object.keys(FBK).map(function (k) { return chip("data-fk", FK, k, FBK[k][0], cnt(function (f) { return f.kind === k; })); }).join("") + "</span></h2>" +
        '<p class="ahint">What people sent from the cogwheel → Feedback, newest first. Click a line to read it and to mark it as being worked on or done.</p>' +
        '<div class="tablewrap"><table class="atable"><thead><tr><th>Type</th><th>In one line</th><th>About</th><th>From</th><th>Sent</th><th>Status</th></tr></thead><tbody>' +
        (flist.map(function (f) {
          var k = FBK[f.kind] || FBK.other, t = Date.parse(f.at), who = fbWho(f, byId), info = f.info || null;
          var out = '<tr class="frow' + (f.status === "new" ? " isnew" : "") + '" data-f="' + f.id + '"><td><span class="tag k-' + esc(f.kind) + '">' + k[0] + '</span></td><td class="mail">' + esc(f.title) + "</td><td>" + esc(f.area || "–") + "</td><td>" + (who ? esc(who) : '<span class="mut">no name</span>') + '</td><td class="num" title="' + esc(stamp(t)) + '">' + ago(t) + "</td><td>" + (f.status === "done" ? '<span class="mut">done</span>' : f.status === "doing" ? '<span class="tag y">working on</span>' : '<span class="tag bad">new</span>') + "</td></tr>";
          if (FOPEN[f.id]) {
            var parts = [[k[1], f.a], [k[2], f.b], [k[3], f.c]].filter(function (p) { return p[0] && p[1]; });
            if (f.freq) parts.push(["How often", f.freq]);
            var tech = info ? [["Site version", info.v], ["Device", device(info.ua)], ["Window", info.win], ["Screen", info.scr], ["Theme", info.theme], ["Language", info.lang], ["Time zone", info.tz], ["Boxes switched off", (info.off || []).map(function (b) { return BOXES[b] || b; }).join(", ") || "none"]].filter(function (p) { return p[1] != null && p[1] !== ""; }) : [];
            var mail = /^[^\s@]+@[^\s@]+$/.test(who) ? who : "";
            out += '<tr class="udetail"><td colspan="6"><div class="fd"><div>' + parts.map(function (p) { return "<h3>" + esc(p[0]) + '</h3><p class="ftxt">' + esc(p[1]) + "</p>"; }).join("") + "</div><div>" +
              (tech.length ? "<h3>Technical details</h3><div class=\"fkv\">" + tech.map(function (p) { return "<span>" + esc(p[0]) + "</span><b>" + esc(p[1]) + "</b>"; }).join("") + "</div>" : '<h3>Technical details</h3><p class="mut sn">Not attached.</p>') +
              (info && info.errs && info.errs.length ? "<h3>Was failing to load at that moment</h3>" + info.errs.map(function (x) { return '<p class="ftxt sn">' + esc(x) + "</p>"; }).join("") : "") +
              '<p class="mut sn">Sent ' + esc(stamp(t)) + " from " + esc(f.ip || "unknown") + (f.user_id ? "" : " · not signed in") + "</p>" +
              '<div class="uacts">' + (f.status !== "doing" ? '<button data-fb="doing" data-id="' + f.id + '">Working on it</button>' : "") + (f.status !== "done" ? '<button data-fb="done" data-id="' + f.id + '">Done</button>' : "") + (f.status !== "new" ? '<button data-fb="new" data-id="' + f.id + '">Back to new</button>' : "") +
              (mail ? '<a class="btn" href="mailto:' + esc(mail) + "?subject=" + encodeURIComponent("OmniTree feedback: " + f.title) + '">Answer by email</a>' : "") +
              '<button data-fb="copy" data-id="' + f.id + '">Copy as text</button><button class="danger" data-fb="del" data-id="' + f.id + '">Delete</button></div></div></div></td></tr>';
          }
          return out;
        }).join("") || '<tr><td colspan="6" class="mut">' + (fbs.length ? "Nothing here. Try another filter." : "No feedback yet.") + "</td></tr>") + "</tbody></table></div></div>";
    }
    $("aQ").placeholder = TAB === "visitors" ? "Find an IP, country or email…" : TAB === "feedback" ? "Find in feedback…" : "Find an account…";
    $("aQ").style.visibility = TAB === "usage" || TAB === "server" ? "hidden" : "";
    $("aBody").innerHTML = h;
  }

  function act(kind, id) {
    var u = D && (D.users || []).filter(function (x) { return x.id === id; })[0];
    if (!u) return;
    var body = { op: kind, id: id };
    if (kind === "reset") { if (!confirm("Send a password reset email to " + u.email + "?")) return; body.email = u.email; body.redirect = location.origin + location.pathname.replace(/admin\.html$/, ""); }
    else if (kind === "delete") { if (prompt("This permanently deletes " + u.email + " and everything saved in it. It cannot be undone.\n\nType the email address to confirm.") !== u.email) { msg("Nothing was deleted."); return; } }
    else if (kind === "block") { if (!confirm("Block " + u.email + " from signing in?")) return; }
    msg("Working…");
    call(body).then(function (r) { msg((r.msg || "Done") + " (" + u.email + ")."); return call({ op: "overview" }); }).then(function (d) { D = d; render(); }).catch(function (e) { msg("That did not work: " + e.message); });
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (b) { e.stopPropagation(); act(b.dataset.act, b.dataset.id); return; }
    if (!D) return;
    var fb = e.target.closest("[data-fb]");
    if (fb) { fbAct(fb.dataset.fb, fb.dataset.id); return; }
    var ff = e.target.closest("[data-ff]");
    if (ff) { FF = ff.dataset.ff; render(); return; }
    var fk = e.target.closest("[data-fk]");
    if (fk) { FK = fk.dataset.fk; render(); return; }
    var frow = e.target.closest("tr.frow");
    if (frow) { FOPEN[frow.dataset.f] = !FOPEN[frow.dataset.f]; render(); return; }
    var tab = e.target.closest("[data-tab]");
    if (tab) { TAB = tab.dataset.tab; render(); return; }
    var vf = e.target.closest("[data-vf]");
    if (vf) { VF = vf.dataset.vf; render(); return; }
    if (e.target.closest("[data-more]")) { LATESTN += 50; render(); return; }
    var th = e.target.closest("th[data-sort]");
    if (th) { if (SORT === th.dataset.sort) SORTDIR = -SORTDIR; else { SORT = th.dataset.sort; SORTDIR = SORT === "email" ? 1 : -1; } render(); return; }
    var row = e.target.closest("tr.urow");
    if (row) { OPEN[row.dataset.u] = !OPEN[row.dataset.u]; render(); return; }
    var crow = e.target.closest("tr.crow");
    if (crow) { COPEN[crow.dataset.c] = !COPEN[crow.dataset.c]; render(); return; }
    var vrow = e.target.closest("tr.vrow");
    if (vrow) { VOPEN[vrow.dataset.ip] = !VOPEN[vrow.dataset.ip]; render(); }
  });
  $("aQ").addEventListener("input", function (e) { Q = e.target.value.trim().toLowerCase(); if (D) render(); });
  $("aRefresh").onclick = load;
  load();
})();
