// OmniTree privacy page: the request form. It is stored like feedback (type "privacy") and read in the admin page.
// (Inside another site's frame the page hides itself and opens as itself, so the form cannot be laid under someone else's page.)
if (window.top !== window.self) { document.documentElement.style.display = "none"; try { window.top.location.replace(window.self.location.href); } catch (e) {} }
(function () {
  function $(id) { return document.getElementById(id); }
  var sb = null, busy = false;
  try { sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (e) {}
  function say(t) { $("prMsg").textContent = t; }
  $("prForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy) return;
    var kind = $("prKind").value, mail = $("prMail").value.trim(), text = $("prText").value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { say("Enter the email address you want the answer sent to."); $("prMail").focus(); return; }
    if (text.length < 10) { say("Describe your request in a sentence or two."); $("prText").focus(); return; }
    if (!sb) { say("The form could not connect. Check your connection and reload the page."); return; }
    busy = true; say("Sending…");
    sb.rpc("send_feedback", { p: { kind: "privacy", area: "Privacy", title: kind, a: text, contact: mail } }).then(function (r) {
      busy = false;
      if (r.error) {
        var m = String(r.error.message || "");
        say(/email/i.test(m) ? "That email address does not look right. Check it and try again." : /limit/i.test(m) ?"You have sent several requests in a short time. Try again in an hour." : /could not find|does not exist|schema cache/i.test(m) ? "The form is not switched on yet. Please try again later." : "Could not send: " + m);
        return;
      }
      $("prForm").reset();
      say("Your request was sent. You will get an answer at " + mail + " within one month.");
    }, function () { busy = false; say("Could not send. Check your connection and try again."); });
  });
})();
