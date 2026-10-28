/* ============================================================
   Analyst Prep Kit — shared support footer.
   Injects a Grain-styled footer (GitHub · Buy Me a Coffee · All kits)
   into every kit page and fires a GA4 `support_click` event so we can
   see which kit drives donations. One line to include per kit:
     <script src="../assets/apk-footer.js" defer></script>
   Uses each kit's own theme vars (--border/--muted/--accent), so it
   adapts to dark + light automatically.
   ============================================================ */
(function () {
  if (document.querySelector('.apk-eco-footer')) return;

  // Derive the kit name from the path for the GA4 event label.
  var seg = location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '').split('/');
  var kit = seg.pop() || 'hub';

  var css = document.createElement('style');
  css.textContent =
    '.apk-eco-footer{text-align:center;padding:30px 18px;margin-top:44px;' +
    'border-top:1px solid var(--border,var(--bord,var(--line,#e0d9d2)));color:var(--muted,var(--dim,var(--txt2,#6B7280)));' +
    "размер шрифта: 13 пикселей; семейство шрифтов: наследовать; высота строки: 1,6}" +
    '.apk-eco-footer a{color:var(--muted,var(--dim,var(--txt2,#6B7280)));text-decoration:none;transition:color .15s}' +
    '.apk-eco-footer a:hover{color:var(--accent,#C5511F)}' +
    ".apk-эко-сентябрь{маржа:0 10пикселей;непрозрачность:.7}" +
    '.apk-eco-tm{display:block;margin-top:10px;font-size:11px;opacity:.7;max-width:560px;' +
    "поле слева: авто; поле справа: авто}";
  document.head.appendChild(css);

  /* ----------------------------------------------------------
     Paid cross-sells in the footer line. Both are opt-in by kit
     rather than sitewide: a product only appears on the surfaces
     where a reader is already doing that product's work.

       The SQL Comment System ($29) -> the SQL surfaces.
       The Data Analyst OS ($49)    -> SQL and Excel, the two kits
                                       whose readers are doing the
                                       job the OS runs workflows for.

     Each fires its own GA4 event so the two funnels stay separable.
     ---------------------------------------------------------- */
  /* Each kit maps to a Gumroad UTM link code, not to 1. gumroad.com/u/<code>
     redirects to the product carrying that link's utm tags, and Gumroad counts
     the click and any sale against a NAMED row in
     gumroad.com/dashboard/utm_links. Raw utm params on the product URL only
     ever produce an "(auto-generated)" row, which is why footer traffic was
     unreadable. The Analyst OS gets its own code per surface, so SQL readers
     and Excel readers do not land in the same campaign.
     ---------------------------------------------------------- */
  var CROSS = [
    { kits: { sql: 'tp54avpj', 'sql-dry-run': 'tp54avpj' },
      cls: 'apk-eco-pack', ev: 'comment_system_click',
      label: "Система комментариев SQL" },
    { kits: { sql: 'uhy9o948', 'sql-dry-run': 'uhy9o948', excel: '1ifxmp5y' },
      cls: 'apk-eco-os', ev: 'analyst_os_click',
      label: "Аналитик данных ОС" }
  ];

  var packLink = CROSS.filter(function (c) { return c.kits[kit]; }).map(function (c) {
    return "<класс=\"" + c.cls + '" href="https://gumroad.com/u/' + c.kits[kit] + '" ' +
      'target="_blank" rel="noopener">' + c.label + ' ↗</a>' +
      '<span class="apk-eco-sep">·</span>';
  }).join('');

  var f = document.createElement('footer');
  f.className = 'apk-eco-footer';
  f.innerHTML =
    packLink +
    '<a href="https://github.com/michaelnocito/analyst-prep-kit" target="_blank" rel="noopener">GitHub</a>' +
    '<span class="apk-eco-sep">·</span>' +
    "<a class=\"apk-eco-coffee\" href=\"https://buymeacoffee.com/michaelnocito\" target=\"_blank\" rel=\"noopener\">Купи мне кофе ☕</a>" +
    '<span class="apk-eco-sep">·</span>' +
    "<a href=\"../\">← Все комплекты</a>" +
    "<span class=\"apk-eco-tm\">Power BI и Excel являются товарными знаками Майкрософт; Tableau является торговой маркой Сейлфорс. " +
    "Используется только для идентификации. Подготовительный комплект для аналитика является независимым и не связан с этими компаниями и не одобрен ими.</span>";
  document.body.appendChild(f);

  f.querySelector('.apk-eco-coffee').addEventListener('click', function () {
    if (window.gtag) {
      gtag('event', 'support_click', { kit: kit, method: 'buymeacoffee' });
    }
  });

  CROSS.forEach(function (c) {
    var a = f.querySelector('.' + c.cls);
    if (!a) return;
    a.addEventListener('click', function () {
      if (window.gtag) {
        gtag('event', c.ev, { kit: kit });
      }
    });
  });

  /* ----------------------------------------------------------
     Book card. Sits directly above the footer on the kit hubs.
     Opt-in by path segment: a kit with no entry here gets no
     card, which is why the app shells (drill, final, simulator)
     stay clean. Prices verified against the live Gumroad
     listings 2026-08-09; page counts are the 2026-08-09 rebuild.
     ---------------------------------------------------------- */
  var BOOKS = {
    excel: {
      slug: 'excel-for-analysts', title: "Excel для аналитиков", price: '$19', pages: 378,
      hook: "Вы можете построить опору. Задержка возникает, когда общий итог не соответствует исходному столбцу, и на экране ничего не указано, почему.",
      what: "каждая формула читается аргумент за аргументом простыми словами, с практическими вопросами, которые печатают ответ и причину, по которой она правильна."
    },
    sql: {
      slug: 'sql-for-analysts', title: "SQL для аналитиков", price: '$19', pages: 458,
      hook: "Вы можете написать SELECT. Прилавок возникает, когда кто-то говорит: «Присоединяйтесь к ним и скажите мне, почему итоговые суммы изменились».",
      what: "каждый запрос читается построчно простыми словами, с практическими вопросами, в которых печатается ответ и причина, по которой он правильный."
    },
    tableau: {
      slug: 'tableau-for-analysts', title: "Таблица для аналитиков", price: '$19', pages: 128,
      hook: "Диаграмма рисуется сама собой. Застой возникает, когда на двух листах одних и тех же данных отображаются два разных итоговых значения.",
      what: "отношения, уровень детализации и табличные расчеты обрабатывались по одному решению за раз"
    },
    python: {
      slug: 'python-for-analysts', title: "Python для аналитиков", price: '$19', pages: 203,
      hook: "Ноутбук работает чисто. Застой наступает, когда слияние незаметно удваивает количество строк, а код никогда не жалуется.",
      what: "панды читают построчно простыми словами, используя проверки, которые обнаруживают плохое соединение до того, как оно достигнет диаграммы."
    },
    powerbi: {
      slug: 'power-bi-for-analysts', title: "Power BI для аналитиков", price: '$19', pages: 187,
      hook: "Визуальная нагрузка. Застой наступает, когда мера и столбец дают два разных числа для одного и того же предмета.",
      what: "DAX, звездообразная схема и контекст фильтра, объясненные в том порядке, в котором вопросы фактически поступают."
    },
    stats: {
      slug: 'statistics-for-analysts', title: "Статистика для аналитиков", price: '$19', pages: 123,
      hook: "У вас есть два средних значения. Застой возникает, когда кто-то спрашивает, реальна ли разница между ними.",
      what: "разброс, значения п, доверительные интервалы и А/Б-тесты, написанные для людей, которым нужно дать ответ."
    },
    forecasting: {
      slug: 'forecasting-for-analysts', title: "Прогнозирование для аналитиков", price: '$12', pages: 43,
      hook: "Линия идет вверх. Задержка возникает, когда кто-то спрашивает, насколько далеко вы готовы сказать это вслух.",
      what: "скользящие средние, сезонность и точность прогнозов, в том числе как указать то, о чем цифры не могут вам сказать"
    },
    'chart-literacy': {
      slug: 'charts-and-visualization', title: "Диаграммы и визуализация", price: '$12', pages: 42,
      hook: "Таблица точна и по-прежнему неправильно воспринимается комнатой.",
      what: "выбор отметки, упорядочивание стержней и обрезка оси, при этом ошибки отображаются рядом"
    },
    viz: {
      slug: 'charts-and-visualization', title: "Диаграммы и визуализация", price: '$12', pages: 42,
      hook: "Таблица точна и по-прежнему неправильно воспринимается комнатой.",
      what: "выбор отметки, упорядочивание стержней и обрезка оси, при этом ошибки отображаются рядом"
    },
    interview: {
      slug: 'thinking-like-an-analyst', title: "Думать как аналитик", price: '$19', pages: 64,
      hook: "Вы знаете эту работу. В интервью вас просят произнести это вслух за девяносто секунд.",
      what: "обоснование ответа, чтобы вы могли обсудить проблему, а не повторять формулу"
    },
    projects: {
      slug: 'thinking-like-an-analyst', title: "Думать как аналитик", price: '$19', pages: 64,
      hook: "Готовый проект — это не то же самое, что проект, который вы можете объяснить.",
      what: "как аналитик формулирует вопрос, проверяет свою работу и записывает то, что не решают цифры"
    },
    path: {
      slug: 'thinking-like-an-analyst', title: "Думать как аналитик", price: '$19', pages: 64,
      hook: "Инструменты — это легкая половина дела. Другая половина — это знать, на какой вопрос вы отвечаете.",
      what: "как аналитик формулирует вопрос, проверяет свою работу и записывает то, что не решают цифры"
    },
    guides: {
      slug: 'thinking-like-an-analyst', title: "Думать как аналитик", price: '$19', pages: 64,
      hook: "Каждое руководство здесь отвечает на один вопрос. Под ними лежит одна и та же привычка.",
      what: "как аналитик формулирует вопрос, проверяет свою работу и записывает то, что не решают цифры"
    }
  };

  /* ----------------------------------------------------------
     One page out of the book, keyed by slug. This is the graphic
     on the card, and the shape of it is deliberate.

     Mike asked for "a fun graphic" here. The obvious move is a
     cover image or a banner, and that is the one move the
     evidence says not to make: readers systematically look past
     anything sitting in an ad-shaped slot, even when it holds
     the exact thing they were hunting for (Benway 1998, Proc.
     Human Factors & Ergonomics Society 42(5):463-467). Making
     this MORE advertisement-shaped would make it less read.

     So the graphic is a sample instead: a torn-out page showing
     the book actually doing the thing the copy claims it does.
     It is content-shaped rather than banner-shaped, it is fun
     because it reads as a physical page, and it argues the case
     rather than asserting it. Every sample below is real: a line
     the book covers, plus the plain-words read-out that IS the
     format being sold.
     ---------------------------------------------------------- */
  var PAGES = {
    'sql-for-analysts': { p: 'p. 212', code: [
        "ВЫБЕРИТЕ в.имя, СУММА(о.сумма)", "ОТ клиентов с",
        "ПРИСОЕДИНЯЙТЕСЬ к заказам о ВКЛ o.customer_id = c.id", "ГРУППИРОВАТЬ ПО в.имя;"],
      say: "Одна строка на каждого клиента. JOIN может повторить клиента, а GROUP BY складывает эти копии обратно в одну." },
    'excel-for-analysts': { p: 'p. 104', code: ["=СУММИФ(D:D, A:A, \"Запад\", B:B, \">=\"&E2)"],
      say: "Сложите столбец D, но только в тех строках, где столбец A соответствует западу, а дата в столбце B совпадает с E2 или после нее." },
    'tableau-for-analysts': { p: 'p. 61', code: ["{ ИСПРАВЛЕНО [Клиент] : СУММА([Продажи]) }"],
      say: "Итого на каждого клиента, рассчитанное до того, как к нему прикоснется какой-либо фильтр на листе." },
    'python-for-analysts': { p: 'p. 88', code: ["df.merge(orders, on='customer_id', How='left')"],
      say: "Удерживайте каждого клиента. Левое слияние не может удалить строку, но может незаметно дублировать ее." },
    'power-bi-for-analysts': { p: 'p. 73', code: ["Выручка = SUMX(Продажи, Продажи[Кол-во] * Продажи[Цена])"],
      say: "Умножьте строку за строкой, затем сложите строки вверх. Вычисляемый столбец умножил бы один раз и сохранил бы его." },
    'statistics-for-analysts': { p: 'p. 46', code: ['p = 0.03'],
      say: "Если бы на самом деле ничего не происходило, вы бы все равно увидели такой большой разрыв примерно в трех случаях из ста." },
    'forecasting-for-analysts': { p: 'p. 29', code: ["МАРЕ = 8,4%"],
      say: "В среднем прогноз составлял 8,4%. Проверьте, несет ли один неудачный месяц такое число." },
    'charts-and-visualization': { p: 'p. 18', code: ["Сортируйте столбцы по значению, а не по имени."],
      say: "Читатель все равно их ранжирует. Алфавитный порядок просто заставляет их сначала делать это в уме." },
    'thinking-like-an-analyst': { p: 'p. 31', code: ["Что изменится, если это число неверно?"],
      say: "Спрашивайте до анализа, а не после. Ответ расскажет вам, сколько стоит проверка номера." }
  };

  var book = BOOKS[kit];
  if (!book) return;
  var pg = PAGES[book.slug];

  var bcss = document.createElement('style');
  bcss.textContent =
    '.apk-book{max-width:760px;margin:44px auto 0;padding:18px 22px;' +
    'border:1px solid var(--border,var(--bord,var(--line,#e0d9d2)));border-left:4px solid var(--accent,#C5511F);' +
    "граница-радиус: 12 пикселей; семейство шрифтов: наследовать; размер шрифта: 15 пикселей; высота строки: 1,6; выравнивание текста: по левому краю;" +
    "дисплей: сетка; сетка-шаблон-столбцы: 1fr; разрыв: 16 пикселей}" +
    ".apk-book-body Strong{display:block;margin-bottom:8px}" +
    '.apk-book-body p{margin:0;color:var(--muted,var(--dim,var(--txt2,#6B7280)));font-size:14px}' +
    '.apk-book a{display:inline-block;margin-top:12px;font-weight:600;' +
    'color:var(--accent,#C5511F);text-decoration:none}' +
    '.apk-book a:hover{text-decoration:underline}' +
    /* The page. A folded top-right corner, a page number, and a hairline rule
       under the code, so it reads as paper rather than as a callout box. */
    '.apk-book-pg{position:relative;padding:13px 14px 22px;border:1px solid var(--border,var(--bord,var(--line,#e0d9d2)));' +
    'border-radius:3px;background:var(--surf,var(--panel,var(--surface,#fff)));overflow:hidden}' +
    '.apk-book-pg:after{content:"";position:absolute;top:0;right:0;border-width:0 15px 15px 0;' +
    'border-style:solid;border-color:transparent var(--bg,#f5f0e9) transparent transparent}' +
    '.apk-book-pg code{display:block;font-family:var(--mono,ui-monospace,SFMono-Regular,Menlo,monospace);' +
    'font-size:11.5px;line-height:1.55;color:var(--text,var(--txt,var(--ink,#222)));white-space:pre-wrap;word-break:break-word}' +
    '.apk-book-pg .sy{display:block;margin-top:9px;padding-top:8px;border-top:1px solid var(--border,var(--bord,var(--line,#e0d9d2)));' +
    'font-size:12px;line-height:1.5;color:var(--muted,var(--dim,var(--txt2,#6B7280)));font-style:italic}' +
    ".apk-book-pg .пн{позиция:абсолютный;нижний:5пикселей;верно:10пикселей;размер шрифта:10пикселей;интервал между буквами:.05Эм;" +
    'color:var(--muted,var(--dim,var(--txt2,#6B7280)));opacity:.7}' +
    '@media(min-width:660px){.apk-book.has-pg{grid-template-columns:minmax(0,1fr) 250px;align-items:start}' +
    '.apk-book.has-pg .apk-book-pg{order:2}}';
  document.head.appendChild(bcss);

  var b = document.createElement('aside');
  b.className = 'apk-book' + (pg ? ' has-pg' : '');
  var esc = function (t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  b.innerHTML =
    (pg ? '<div class="apk-book-pg"><code>' + pg.code.map(esc).join('\n') + '</code>' +
          '<span class="sy">' + esc(pg.say) + '</span>' +
          '<span class="pn">' + esc(pg.p) + '</span></div>' : '') +
    '<div class="apk-book-body">' +
    '<strong>' + book.hook + '</strong>' +
    '<p><em>' + book.title + '</em> is ' + book.pages + " страницы, " + book.what + '.</p>' +
    '<a class="apk-book-link" href="https://michaelnocito.gumroad.com/l/' + book.slug +
    '?utm_source=analyst-prep-kit&utm_medium=kit-hub&utm_campaign=' + book.slug + '" ' +
    'target="_blank" rel="noopener">' + book.title + ', ' + book.price + " →</a>" +
    '</div>';
  document.body.insertBefore(b, f);

  b.querySelector('.apk-book-link').addEventListener('click', function () {
    if (window.gtag) {
      gtag('event', 'hub_book_click', { kit: kit, book: book.slug });
    }
  });
})();
