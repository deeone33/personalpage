// OmniTree admin overview.
// This page holds no data of its own. Everything comes from the feeds function, which first asks Supabase who is
// signed in and only answers when that is the site owner's confirmed email. Anyone else who opens this page gets "Not allowed".
(function () {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var sb = null, FN = window.FEEDS_FN || "feeds", D = null, Q = "", OPEN = {}, SORT = "seen", SORTDIR = -1;
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
      if (!s.data || !s.data.session) { gate("Sign in first", "Sign in on the main page with the owner account, then open this page again."); return; }
      return call({ op: "overview" }).then(function (d) { D = d; render(); });
    }).catch(function (e) {
      if (/not allowed/i.test(e.message)) gate("Not allowed", "This page is only for the site owner. Your account cannot see it.");
      else gate("Could not load the overview", e.message);
    });
  }

  // ---- small helpers ----
  function dur(s) { s = Math.round(s || 0); if (s < 60) return s ? "<1m" : "0"; var m = Math.round(s / 60); return m < 60 ? m + "m" : Math.floor(m / 60) + "h " + (m % 60) + "m"; }
  function ago(t) { if (!t) return "never"; var m = Math.max(0, Math.round((Date.now() - t) / 60000)); return m < 2 ? "just now" : m < 60 ? m + "m ago" : m < 1440 ? Math.round(m / 60) + "h ago" : Math.round(m / 1440) + "d ago"; }
  function date(t) { return t ? new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "–"; }
  function dayKey(t) { return new Date(t).toISOString().slice(0, 10); }
  function lastDays(n) { var out = []; for (var i = n - 1; i >= 0; i--) out.push(dayKey(Date.now() - i * 86400000)); return out; }
  function bars(vals, days, unit) {
    var max = Math.max.apply(null, vals.concat([1]));
    return '<div class="bars">' + vals.map(function (v, i) { return "<i" + (v ? "" : ' class="z"') + ' style="height:' + Math.max(1, Math.round(v / max * 100)) + '%" title="' + esc(days[i] + ": " + (unit === "time" ? dur(v) : v)) + '"></i>'; }).join("") +
      '</div><div class="baxis"><span>' + esc(days[0].slice(5)) + "</span><span>peak " + (unit === "time" ? dur(max) : max) + "</span><span>" + esc(days[days.length - 1].slice(5)) + "</span></div>";
  }
  function hbars(rows, unit) {
    var max = Math.max.apply(null, rows.map(function (r) { return r[1]; }).concat([1]));
    return rows.length ? rows.map(function (r) { return '<div class="hb"><span title="' + esc(r[0]) + '">' + esc(r[0]) + '</span><em><u style="width:' + Math.round(r[1] / max * 100) + '%"></u></em><b>' + (unit === "time" ? dur(r[1]) : r[1]) + "</b></div>"; }).join("") : '<p class="mut sn">Nothing yet.</p>';
  }
  var BOXES = { weather: "Weather", mail: "Mail", live: "Converter", news: "News", telegram: "Telegram", twitch: "Twitch", youtube: "YouTube", stocks: "Stocks", reddit: "Reddit", sports: "Sports" };
  var WHERE = { page: "Page", settings: "Settings", window: "Pop-up window", side: "Docked panel", menu: "Menu box", live: "Converter" };
  var ACT = {
    "open-a": "open a headline", "open-m": "open a Telegram post", "open-r": "open a Reddit post", "open-t": "open a stream", "open-v": "open a video", "open-p": "open a game", "open-s": "open a stock",
    refresh: "reload the box", nseen: "clear “new”", nfilt: "filter headlines", filtmenu: "Sources menu", filttoggle: "show/hide a source", opennotes: "open notes", opencal: "open calendar", bellmenu: "notifications bell",
    cogmenu2: "cogwheel menu", clockmenu2: "timer menu", acctmenu2: "account menu", setpanel: "open settings", setsec: "switch settings section", editmode: "edit layout", openhelp: "open help", openbrief: "open summary",
    noteadd: "add a note / task", notedone: "tick a task", notetab: "switch notes tab", notedel: "delete a note", notepin: "pin a note", calday: "pick a day", calnav: "change month", dock: "dock a player", undock: "close a docked player",
    dockchat: "toggle docked chat", twpop: "pop out a stream", twchat: "pop out chat", sidedock: "dock / undock a panel", toastgo: "open a notification", toastx: "dismiss a notification", bellgo: "open from history",
    convswap: "swap currencies", weather: "open weather", mail: "open mail", mailread: "mark mail read", spfav: "favorite a team", fav: "favorite", hide: "hide an item", boxoff: "hide a box", boxtoggle: "switch a box", signout: "sign out"
  };
  function clickLabel(k) { var p = k.split(":"), w = BOXES[p[0]] || WHERE[p[0]] || p[0]; return w + " · " + (ACT[p[1]] || p[1]); }

  // ---- the page ----
  function render() {
    var users = D.users || [], usage = D.usage || [], prefs = D.prefs || {}, now = D.now || Date.now(), d30 = lastDays(30), d7 = d30.slice(-7), today = d30[29];
    var U = {}, DAY = {}, CLK = {}, BOXCLK = {};
    d30.forEach(function (d) { DAY[d] = { secs: 0, users: 0, clicks: 0 }; });
    usage.forEach(function (r) {
      var u = U[r.user_id] = U[r.user_id] || { days: {}, s7: 0, s30: 0, c30: 0, seen: 0, clk: {} }, ck = r.clicks || {}, n = 0;
      Object.keys(ck).forEach(function (k) { var v = +ck[k] || 0; n += v; u.clk[k] = (u.clk[k] || 0) + v; CLK[k] = (CLK[k] || 0) + v; var bx = k.split(":")[0]; BOXCLK[bx] = (BOXCLK[bx] || 0) + v; });
      u.days[r.day] = r.secs; u.s30 += r.secs; u.c30 += n;
      if (d7.indexOf(r.day) >= 0) u.s7 += r.secs;
      var ls = Date.parse(r.last_seen); if (ls > u.seen) u.seen = ls;
      if (DAY[r.day]) { DAY[r.day].secs += r.secs; DAY[r.day].users++; DAY[r.day].clicks += n; }
    });
    var signups = d30.map(function (d) { return users.filter(function (u) { return u.created && dayKey(Date.parse(u.created)) === d; }).length; });
    var active7 = Object.keys(U).filter(function (id) { return U[id].s7 > 0; }).length, secs7 = d7.reduce(function (a, d) { return a + DAY[d].secs; }, 0);
    var new7 = users.filter(function (u) { return u.created && now - Date.parse(u.created) < 7 * 86400000; }).length;
    var withPrefs = users.filter(function (u) { return prefs[u.id]; });
    $("aWho").textContent = "Signed in as " + D.me + " · function version " + D.fn + " · updated " + new Date(now).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    var tile = function (v, l) { return '<div class="atile"><b>' + v + "</b><span>" + l + "</span></div>"; };
    var h = '<div class="atiles">' + tile(users.length, "accounts") + tile(new7, "new in the last 7 days") + tile(users.filter(function (u) { return !u.confirmed; }).length, "email not confirmed") +
      tile(DAY[today].users, "active today") + tile(active7, "active in the last 7 days") + tile(dur(DAY[today].secs), "time on site today") + tile(dur(secs7), "time on site, 7 days") +
      tile(active7 ? dur(secs7 / active7 / 7) : "0", "per active user per day") + "</div>";
    if (D.usageErr) h += '<div id="aMsg2" class="apanel w12" style="margin-bottom:12px"><b>Usage is not being collected yet.</b> <span class="mut">' + esc(D.usageErr) + "</span></div>";
    h += '<div class="agrid">' +
      '<div class="apanel"><h2>Active accounts per day <small>last 30 days</small></h2>' + bars(d30.map(function (d) { return DAY[d].users; }), d30) + "</div>" +
      '<div class="apanel"><h2>Time on site per day <small>all accounts</small></h2>' + bars(d30.map(function (d) { return DAY[d].secs; }), d30, "time") + "</div>" +
      '<div class="apanel"><h2>New accounts per day <small>last 30 days</small></h2>' + bars(signups, d30) + "</div>" +
      '<div class="apanel"><h2>Clicks per day <small>all accounts</small></h2>' + bars(d30.map(function (d) { return DAY[d].clicks; }), d30) + "</div>" +
      '<div class="apanel w4"><h2>Most used <small>clicks, 30 days</small></h2>' + hbars(Object.keys(CLK).sort(function (a, b) { return CLK[b] - CLK[a]; }).slice(0, 14).map(function (k) { return [clickLabel(k), CLK[k]]; })) + "</div>" +
      '<div class="apanel w4"><h2>Clicks by area <small>30 days</small></h2>' + hbars(Object.keys(BOXCLK).sort(function (a, b) { return BOXCLK[b] - BOXCLK[a]; }).slice(0, 14).map(function (k) { return [BOXES[k] || WHERE[k] || k, BOXCLK[k]]; })) + "</div>" +
      '<div class="apanel w4"><h2>Boxes switched on <small>of ' + withPrefs.length + " accounts with settings</small></h2>" + hbars(Object.keys(BOXES).map(function (k) { return [BOXES[k], withPrefs.filter(function (u) { return prefs[u.id].off.indexOf(k) < 0; }).length]; }).sort(function (a, b) { return b[1] - a[1]; })) + "</div>" +
      '<div class="apanel w4"><h2>Features set up <small>accounts</small></h2>' + hbars([
        ["Finished the setup guide", function (p) { return p.onboarded; }], ["Own news sources", function (p) { return p.news >= 0; }], ["Own Telegram channels", function (p) { return p.tg >= 0; }], ["Own subreddits", function (p) { return p.rd >= 0; }],
        ["Own stock list", function (p) { return p.stocks > 0; }], ["Twitch connected", function (p) { return p.twitch; }], ["YouTube imported", function (p) { return p.yt > 0; }], ["Gmail connected", function (p) { return p.mail > 0; }],
        ["Uses notes or to-dos", function (p) { return p.notes + p.todos > 0; }], ["Uses the calendar", function (p) { return p.cal > 0; }], ["Docked a panel", function (p) { return p.docked.length > 0; }], ["Sports favorites", function (p) { return p.favs > 0; }],
        ["Desktop notifications", function (p) { return p.desktopNtf; }], ["Light theme", function (p) { return p.theme === "light"; }]
      ].map(function (f) { return [f[0], withPrefs.filter(function (u) { return f[1](prefs[u.id]); }).length]; }).sort(function (a, b) { return b[1] - a[1]; })) + "</div>" +
      '<div class="apanel w4"><h2>Most time on site <small>7 days</small></h2>' + hbars(users.filter(function (u) { return U[u.id] && U[u.id].s7; }).sort(function (a, b) { return U[b.id].s7 - U[a.id].s7; }).slice(0, 10).map(function (u) { return [u.email, U[u.id].s7]; }), "time") + "</div>" +
      '<div class="apanel w4"><h2>Latest settings changes</h2>' + (withPrefs.slice().sort(function (a, b) { return Date.parse(prefs[b.id].updated) - Date.parse(prefs[a.id].updated); }).slice(0, 10).map(function (u) {
        return '<div class="hb" style="grid-template-columns:1fr auto"><span>' + esc(u.email) + '</span><b class="mut" style="font-weight:400">' + ago(Date.parse(prefs[u.id].updated)) + "</b></div>";
      }).join("") || '<p class="mut sn">Nothing yet.</p>') + "</div></div>";

    // accounts table
    var rows = users.map(function (u) { var x = U[u.id] || { s7: 0, s30: 0, c30: 0, seen: 0, days: {}, clk: {} }; return { u: u, x: x, p: prefs[u.id], created: Date.parse(u.created) || 0, last: Date.parse(u.last) || 0, seen: x.seen, s7: x.s7, s30: x.s30, c30: x.c30, email: String(u.email || "").toLowerCase() }; })
      .filter(function (r) { return !Q || r.email.indexOf(Q) >= 0; })
      .sort(function (a, b) { return (a[SORT] > b[SORT] ? 1 : a[SORT] < b[SORT] ? -1 : 0) * SORTDIR || b.created - a.created; });
    var th = function (k, l) { return '<th data-sort="' + k + '"' + (SORT === k ? ' class="on"' : "") + ">" + l + (SORT === k ? (SORTDIR < 0 ? " ▾" : " ▴") : "") + "</th>"; };
    h += '<div class="apanel w12"><h2>Accounts <small>' + rows.length + " shown · click a row for details and actions</small></h2><div class=\"tablewrap\"><table class=\"atable\"><thead><tr>" +
      th("email", "Email") + th("created", "Created") + th("last", "Last sign-in") + th("seen", "Last active") + th("s7", "Time 7d") + th("s30", "Time 30d") + th("c30", "Clicks 30d") + "<th>Setup</th></tr></thead><tbody>" +
      rows.map(function (r) {
        var u = r.u, p = r.p, tags = [];
        if (u.admin) tags.push('<span class="y">owner</span>');
        if (!u.confirmed) tags.push('<span class="bad">email not confirmed</span>');
        if (u.banned) tags.push('<span class="bad">blocked</span>');
        if (!p) tags.push("<span>no settings saved</span>");
        else {
          if (p.twitch) tags.push('<span class="y">Twitch</span>');
          if (p.yt) tags.push('<span class="y">YouTube ' + p.yt + "</span>");
          if (p.mail) tags.push('<span class="y">Gmail ' + p.mail + "</span>");
          if (p.stocks) tags.push("<span>stocks " + p.stocks + "</span>");
          if (p.notes + p.todos) tags.push("<span>notes " + (p.notes + p.todos) + "</span>");
          if (p.cal) tags.push("<span>events " + p.cal + "</span>");
          if (p.off.length) tags.push("<span>" + p.off.length + " box" + (p.off.length > 1 ? "es" : "") + " off</span>");
        }
        var out = '<tr class="urow" data-u="' + esc(u.id) + '"><td class="mail">' + esc(u.email) + '</td><td class="num">' + date(r.created) + '</td><td class="num">' + ago(r.last) + '</td><td class="num">' + ago(r.seen) + '</td><td class="num">' + dur(r.s7) + '</td><td class="num">' + dur(r.s30) + '</td><td class="num">' + r.c30 + '</td><td><div class="tags">' + tags.join("") + "</div></td></tr>";
        if (OPEN[u.id]) {
          var d14 = d30.slice(-14);
          out += '<tr class="udetail"><td colspan="8"><div class="ud"><div><h3>Time per day, last 14 days</h3>' + bars(d14.map(function (d) { return r.x.days[d] || 0; }), d14, "time") +
            (p ? '<h3 style="margin-top:12px">Setup</h3><div class="tags">' + ["theme " + p.theme, "news sources " + (p.news < 0 ? "default" : p.news), "Telegram " + (p.tg < 0 ? "default" : p.tg), "subreddits " + (p.rd < 0 ? "default" : p.rd), "leagues " + (p.leagues < 0 ? "default" : p.leagues),
              "notes " + p.notes, "to-dos " + p.todos, "events " + p.cal, p.off.length ? "off: " + p.off.join(", ") : "all boxes on", p.docked.length ? "docked: " + p.docked.join(", ") : "nothing docked", "settings changed " + ago(Date.parse(p.updated))].map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div>" : "") +
            "</div><div><h3>Most used by this account, 30 days</h3>" + hbars(Object.keys(r.x.clk).sort(function (a, b) { return r.x.clk[b] - r.x.clk[a]; }).slice(0, 8).map(function (k) { return [clickLabel(k), r.x.clk[k]]; })) +
            '<div class="uacts"><button data-act="reset" data-id="' + esc(u.id) + '">Send password reset email</button>' +
            (u.confirmed ? "" : '<button data-act="confirm" data-id="' + esc(u.id) + '">Mark email as confirmed</button>') +
            (u.admin ? "" : '<button data-act="' + (u.banned ? "unblock" : "block") + '" data-id="' + esc(u.id) + '">' + (u.banned ? "Unblock" : "Block sign-in") + '</button><button class="danger" data-act="delete" data-id="' + esc(u.id) + '">Delete account…</button>') +
            "</div></div></div></td></tr>";
        }
        return out;
      }).join("") + "</tbody></table></div></div>";
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
    var th = e.target.closest("th[data-sort]");
    if (th && D) { if (SORT === th.dataset.sort) SORTDIR = -SORTDIR; else { SORT = th.dataset.sort; SORTDIR = SORT === "email" ? 1 : -1; } render(); return; }
    var row = e.target.closest("tr.urow");
    if (row && D) { OPEN[row.dataset.u] = !OPEN[row.dataset.u]; render(); }
  });
  $("aQ").addEventListener("input", function (e) { Q = e.target.value.trim().toLowerCase(); if (D) render(); });
  $("aRefresh").onclick = load;
  load();
})();
