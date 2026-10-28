/* ============================================================
   Analyst Prep Kit — shared subscribe block.

   One snippet, every property. Copy changes are one edit here, not
   twenty. Include after the content, in the closing area:
     <script src="../assets/apk-subscribe.js" defer></script>

   Or place it yourself:
     <div data-apk-subscribe></div>

   Inherits each host page's tokens (--card/--line/--border/--accent/
   --muted), so it matches light and dark without per-page CSS.

   Fires GA4 `email_capture` with a `from` label, matching the existing
   `book_click` / `support_click` pattern, so capture rate per property
   is readable in GA4.

   ---- PROVIDER --------------------------------------------------
   MODE 'link'  — sends people to the Gumroad subscribe page. Gumroad
                  stores the address and owns unsubscribe + compliance.
                  Verified live 2026-07-31. Needs no setup. Current default.
   MODE 'form'  — inline email field posting to a provider endpoint
                  (Buttondown / MailerLite / Kit). Set ENDPOINT below.
                  Turn this on only once the provider account exists and
                  double opt-in is switched on in that provider.
   ============================================================ */
(function () {
  var MODE = 'link';                                    // 'link' | 'form'
  var LINK = 'https://michaelnocito.gumroad.com/subscribe';
  var ENDPOINT = '';                                    // required when MODE = 'form'
  var FIELD = 'email';                                  // provider's field name

  if (document.querySelector('.apk-sub')) return;

  // Label the property for GA4, same derivation as apk-footer.js.
  var seg = location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '').split('/');
  var from = seg.pop() || 'hub';

  function track(action) {
    if (window.gtag) gtag('event', 'email_capture', { from: from, action: action });
  }

  var css = document.createElement('style');
  css.textContent =
    '.apk-sub{background:var(--card,#fff);border:1px solid var(--line,var(--border,#e0d9d2));' +
    'border-left:4px solid var(--accent,#C5511F);border-radius:12px;padding:16px 20px;' +
    "поле: 26 пикселей 0; размер шрифта: 15 пикселей; семейство шрифтов: наследовать; высота строки: 1,6}" +
    ".apk-sub Strong{display:block;margin-bottom:6px}" +
    '.apk-sub p{margin:6px 0 0}' +
    '.apk-sub form{margin:12px 0 0;display:flex;flex-wrap:wrap;gap:8px}' +
    '.apk-sub input[type=email]{flex:1 1 220px;min-width:0;padding:9px 11px;font:inherit;' +
    'font-size:14px;color:inherit;background:var(--bg,transparent);' +
    'border:1px solid var(--line,var(--border,#e0d9d2));border-radius:8px}' +
    '.apk-sub button{padding:9px 16px;font:inherit;font-size:14px;font-weight:600;' +
    'cursor:pointer;color:#fff;background:var(--accent,#C5511F);border:0;border-radius:8px}' +
    "Кнопка .апк суб: отключено {непрозрачность: .55; курсор: по умолчанию}" +
    '.apk-sub .apk-sub-consent{flex:1 1 100%;display:flex;gap:8px;align-items:flex-start;' +
    'font-size:13px;color:var(--muted,#888)}' +
    '.apk-sub .apk-sub-consent input{margin-top:3px;flex:0 0 auto}' +
    '.apk-sub a.apk-sub-link{display:inline-block;margin-top:10px;font-weight:600;' +
    "цвет:наш(--акцент,#C5511F)}" +
    '.apk-sub .apk-sub-note{margin-top:10px;font-size:13px;color:var(--muted,#888)}' +
    ".апк суб .apk-под-ошибка{цвет:#б3261е;размер шрифта:13пикселей;маржа-верх:8пикселей}";
  document.head.appendChild(css);

  var box = document.createElement('div');
  box.className = 'apk-sub';

  // Copy rule: say what the thing does, never lead on price
  // (feedback_no_free_framing). Promise a cadence that survives
  // (handoff §8) — "every few weeks" is honest, "weekly" is a debt.
  var PITCH =
    "<strong>Одна привычка аналитика, отработанная от начала до конца, каждые несколько недель.</strong>" +
    "<p>У каждого из них есть одна идея — определение метрики, чтобы две команды не могли ее прочитать. " +
    "иначе, читая распределение, прежде чем доверять среднему значению, — и проходите его " +
    "от вопроса к вопросу и к тому, что вы на самом деле скажете на встрече.</p>";

  if (MODE === 'link') {
    box.innerHTML = PITCH +
      '<a class="apk-sub-link" href="' + LINK + '" target="_blank" rel="noopener">' +
      "Получите их по электронной почте →</a>" +
      "<p class=\"apk-sub-note\">Отпишитесь от любого из них в один клик.</p>";
    box.querySelector('a').addEventListener('click', function () { track('link'); });
  } else {
    box.innerHTML = PITCH +
      '<form novalidate>' +
      "<тип ввода=\"электронная почта\" имя=\"" + FIELD + "\" требуется автозаполнение=\"электронная почта\" " +
      "Заполнитель=\"ты@example.com\" ария-метка=\"Адрес электронной почты\">" +
      '<button type="submit">Subscribe</button>' +
      // Unticked, explicit, its own sentence. Consent for progress sync is
      // not consent for this (handoff §2).
      '<label class="apk-sub-consent"><input type="checkbox" required>' +
      "<span>Да, каждые несколько недель присылайте мне по электронной почте отчеты о привычках аналитиков. " +
      "Я могу в один клик отписаться от любого из них.</span></label>" +
      '</form>' +
      '<div class="apk-sub-err" hidden></div>';

    var form = box.querySelector('form');
    var err = box.querySelector('.apk-sub-err');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.hidden = true;
      var email = form.querySelector('input[type=email]').value.trim();
      var consent = form.querySelector('input[type=checkbox]').checked;

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        err.textContent = "Это не похоже на адрес электронной почты.";
        err.hidden = false;
        return;
      }
      if (!consent) {
        err.textContent = "Установите флажок, чтобы мы зафиксировали ваше разрешение.";
        err.hidden = false;
        return;
      }
      if (!ENDPOINT) {
        err.textContent = "Подписки еще не включены.";
        err.hidden = false;
        return;
      }

      var btn = form.querySelector('button');
      btn.disabled = true;
      btn.textContent = "Отправка…";

      var body = new FormData();
      body.append(FIELD, email);
      fetch(ENDPOINT, { method: 'POST', body: body })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          track('form');
          // A real confirmation state, not an alert (handoff §6.4).
          box.innerHTML =
            "<strong>Проверьте свой почтовый ящик.</strong>" +
            "<p>В пути находится письмо с подтверждением. Нажмите на ссылку в нем и " +
            "вы в списке — пока вы этого не сделаете, ничего не будет отправлено. Первая запись " +
            "прибудет в течение нескольких недель.</p>";
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = 'Subscribe';
          err.textContent = "Это не прошло. Повторите попытку через минуту.";
          err.hidden = false;
        });
    });
  }

  var slot = document.querySelector('[data-apk-subscribe]');
  if (slot) {
    slot.appendChild(box);
  } else {
    var footer = document.querySelector('.apk-eco-footer');
    if (footer) footer.parentNode.insertBefore(box, footer);
    else (document.querySelector('main') || document.body).appendChild(box);
  }
})();
