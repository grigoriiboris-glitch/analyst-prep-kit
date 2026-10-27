/* Prevent English text from flashing before the Russian localization pass finishes. */
(function () {
  "use strict";
  var language = "ru";
  try { language = localStorage.getItem("apk-language-v2") || "ru"; } catch (_) {}
  if (language === "en") return;

  var root = document.documentElement;
  root.classList.add("apk-ru-pending");
  var style = document.createElement("style");
  style.setAttribute("data-apk-ru-boot", "true");
  style.textContent =
    "html.apk-ru-pending body{opacity:0!important;pointer-events:none!important}" +
    "html.apk-ru-pending:before{content:'Подготавливаем русскую версию…';position:fixed;inset:0;z-index:2147483646;" +
    "display:flex;align-items:center;justify-content:center;padding:24px;background:#f8fafc;color:#17212b;" +
    "font:600 16px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif;text-align:center}";
  (document.head || root).appendChild(style);
})();