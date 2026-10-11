// OmniTree help page: the "Copy the code" button of the Gmail script
(function () {
  var b = document.getElementById("hpCopy");
  if (!b) return;
  b.addEventListener("click", function () {
    var box = document.querySelector(".codebox"), code = box && (box.querySelector("pre, code, textarea") || box), txt = code ? code.value || code.textContent : "";
    var done = function (ok) { b.textContent = ok ? "Copied" : "Select the code and copy it by hand"; setTimeout(function () { b.textContent = "Copy the code"; }, 2500); };
    try { navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); }); } catch (e) { done(false); }
  });
})();
