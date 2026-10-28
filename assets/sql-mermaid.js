(function exposeSqlMermaid(global) {
  "используйте строгий";

  var SQL_KEYWORDS = new Set((
    'SELECT FROM WHERE JOIN INNER LEFT RIGHT FULL OUTER CROSS NATURAL ON USING AS DISTINCT ALL UNION INTERSECT EXCEPT MINUS WITH RECURSIVE ' +
    'UPDATE INSERT INTO VALUES DELETE SET RETURNING GROUP BY HAVING ORDER LIMIT OFFSET FETCH FIRST ONLY ASC DESC NULLS LAST ' +
    'CASE WHEN THEN ELSE END CAST TRY_CAST COLLATE LIKE ILIKE ESCAPE IN NOT BETWEEN IS NULL TRUE FALSE UNKNOWN EXISTS ANY OVER ' +
    'PARTITION ROWS RANGE PRECEDING FOLLOWING UNBOUNDED CURRENT ROW QUALIFY WINDOW FILTER WITHIN AND OR XOR DIV MOD REGEXP RLIKE ' +
    'TOP PERCENT TIES DATABASE SCHEMA TABLE TEMP TEMPORARY CREATE ALTER DROP INDEX PRIMARY KEY FOREIGN REFERENCES CHECK UNIQUE ' +
    'INTEGER INT BIGINT SMALLINT TINYINT DECIMAL NUMERIC FLOAT DOUBLE REAL BOOLEAN BOOL TEXT VARCHAR CHAR DATE DATETIME TIMESTAMP ' +
    'INTERVAL JSON UUID ASOF APPLY LATERAL PIVOT UNPIVOT OFFSET ROWID WITHOUT'
  ).split(/\s+/));

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function cleanSql(value) {
    return String(value || '')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/'(?:''|[^'])*'/g, ' ')
      .replace(/--[^\n]*/g, ' ');
  }

  function unquoteIdentifier(value) {
    return String(value || '').split('.').pop().replace(/^["\x60\[]|["\x60\]]$/g, '');
  }

  function safeIdentifier(value) {
    var clean = String(value || '').replace(/[^A-Za-z0-9_$]/g, '_');
    if (!clean || !/^[A-Za-z_]/.test(clean)) clean = 'field_' + clean;
    return clean.slice(0, 36);
  }

  function collectVizTables(lesson) {
    var viz = lesson && lesson.viz;
    if (!viz || !Array.isArray(viz.columns) || !Array.isArray(viz.rows)) return [];
    var tableColumn = viz.columns.findIndex(function (column) {
      return /^(table_name|table)$/i.test(String(column || '').trim());
    });
    if (tableColumn < 0) return [];
    var fieldsColumn = viz.columns.findIndex(function (column) {
      return /^(example_columns|columns|fields)$/i.test(String(column || '').trim());
    });
    return viz.rows.slice(0, 5).map(function (row, index) {
      var name = safeIdentifier(row && row[tableColumn] || ('table_' + (index + 1)));
      var rawFields = fieldsColumn >= 0 && row ? row[fieldsColumn] : '';
      var columns = String(rawFields || '').split(/[,;\n]/)
        .map(function (field) { return safeIdentifier(field.trim()); })
        .filter(function (field) { return field && !/^field_$/.test(field); })
        .slice(0, 6);
      return { id: 'T' + (index + 1), name: name, alias: name, columns: new Set(columns) };
    });
  }

  function diagramSource(lesson) {
    var rawSql = lesson && lesson.ral && lesson.ral.sql || lesson && lesson.sql || '';
    var sql = cleanSql(rawSql);
    if (!sql.trim() && !collectVizTables(lesson).length) return '';
    var cteNames = new Set();
    var ctePattern = /(?:\bWITH\b|,)\s*(?:RECURSIVE\s+)?([A-Za-z_][\w$]*)\s+AS\s*\(/gi;
    var cteMatch;
    while ((cteMatch = ctePattern.exec(sql))) cteNames.add(cteMatch[1].toLowerCase());

    var sources = [];
    var aliasToSource = new Map();
    var sourcePattern = /\b(?:FROM|JOIN)\s+((?:"[^"]+"|\x60[^\x60]+\x60|\[[^\]]+\]|[A-Za-z_][\w$]*(?:\.[A-Za-z_][\w$]*)*))(?:\s+(?:AS\s+)?([A-Za-z_][\w$]*))?/gi;
    var sourceMatch;
    while ((sourceMatch = sourcePattern.exec(sql))) {
      var rawName = sourceMatch[1];
      var tableName = unquoteIdentifier(rawName);
      var bareLower = tableName.toLowerCase();
      if (!tableName || SQL_KEYWORDS.has(bareLower.toUpperCase()) || cteNames.has(bareLower)) continue;
      var rawAlias = sourceMatch[2] || tableName;
      var alias = SQL_KEYWORDS.has(rawAlias.toUpperCase()) ? tableName : unquoteIdentifier(rawAlias);
      var aliasLower = alias.toLowerCase();
      var source = sources.find(function (item) {
        return item.name.toLowerCase() === bareLower && item.alias.toLowerCase() === aliasLower;
      });
      if (!source) {
        if (sources.length >= 5) continue;
        source = { id: 'T' + (sources.length + 1), name: safeIdentifier(tableName), alias: alias, columns: new Set() };
        sources.push(source);
      }
      aliasToSource.set(aliasLower, source);
      if (sources.filter(function (item) { return item.name.toLowerCase() === bareLower; }).length === 1) {
        aliasToSource.set(bareLower, source);
      }
    }

    // Use authored table names for the introductory lesson rather than inventing a schema.
    if (!sources.length) sources = collectVizTables(lesson);
    sources.forEach(function (source) {
      aliasToSource.set(source.alias.toLowerCase(), source);
      aliasToSource.set(source.name.toLowerCase(), source);
    });

    var qualifiedPattern = /\b([A-Za-z_][\w$]*)\.([A-Za-z_][\w$]*)\b/g;
    var qualifiedMatch;
    while ((qualifiedMatch = qualifiedPattern.exec(sql))) {
      var target = aliasToSource.get(qualifiedMatch[1].toLowerCase());
      if (target) target.columns.add(safeIdentifier(qualifiedMatch[2]));
    }

    if (sources.length === 1 && /\b(SELECT|WITH|UPDATE|INSERT|DELETE)\b/i.test(sql)) {
      var flat = sql
        .replace(/\bAS\s+[A-Za-z_][\w$]*/gi, ' ')
        .replace(/\b[A-Za-z_][\w$]*\s*\(/g, ' ')
        .replace(/\b([A-Za-z_][\w$]*)\s*\./g, ' ')
        .replace(/\b\d+(?:\.\d+)?\b/g, ' ');
      var tableAndAlias = new Set();
      sources.forEach(function (source) {
        tableAndAlias.add(source.name.toLowerCase());
        tableAndAlias.add(source.alias.toLowerCase());
      });
      var fieldMatch;
      var fieldPattern = /\b[A-Za-z_][\w$]*\b/g;
      while ((fieldMatch = fieldPattern.exec(flat))) {
        var candidate = fieldMatch[0];
        var lower = candidate.toLowerCase();
        if (SQL_KEYWORDS.has(candidate.toUpperCase()) || tableAndAlias.has(lower) ||
            cteNames.has(lower) || /^\d/.test(candidate)) continue;
        if (!sources[0].columns.has(safeIdentifier(candidate))) {
          sources[0].columns.add(safeIdentifier(candidate));
        }
      }
    }

    if (!sources.length) {
      if (!String(rawSql || '').trim()) return '';
      sources = [{ id: 'T1', name: 'Выражение SQL', alias: 'expression', columns: new Set(['без таблицы']) }];
    }
    sources = sources.slice(0, 5);

    var isRealSql = /\b(SELECT|WITH|UPDATE|INSERT|DELETE)\b/i.test(sql);
    var operations = [];
    function addOperation(condition, label, detail) {
      if (condition) operations.push({ label: label, detail: detail });
    }

    if (!isRealSql && collectVizTables(lesson).length) {
      operations.push({ label: 'БАЗА ДАННЫХ', detail: 'набор отдельных таблиц' });
    } else {
      addOperation(/\bWITH\b/i.test(sql), 'WITH', 'подготовить набор');
      addOperation(/\bJOIN\b/i.test(sql) && sources.length > 1, 'JOIN', 'связать таблицы');
      addOperation(/\bUNION\b/i.test(sql), 'UNION', 'объединить наборы');
      addOperation(/\bWHERE\b/i.test(sql), 'WHERE', 'отфильтровать строки');
      addOperation(/\bGROUP\s+BY\b/i.test(sql), 'GROUP BY', 'собрать группы');
      addOperation(/\bHAVING\b/i.test(sql), 'HAVING', 'отфильтровать группы');
      addOperation(/\bSELECT\b/i.test(sql), 'SELECT', 'выбрать столбцы');
      addOperation(/\b(CASE|COALESCE|NULLIF)\b/i.test(sql), 'CASE / COALESCE', 'вычислить поле');
      addOperation(/\bOVER\s*\(/i.test(sql), 'OVER', 'оконный расчёт');
      addOperation(/\bDISTINCT\b/i.test(sql), 'DISTINCT', 'убрать повторы');
      addOperation(/\bORDER\s+BY\b/i.test(sql), 'ORDER BY', 'отсортировать');
      addOperation(/\b(LIMIT\b|TOP\s+\d|FETCH\s+FIRST\b)/i.test(sql), 'LIMIT', 'ограничить строки');
      if (!operations.length) operations.push({ label: 'SQL', detail: 'посмотреть на структуру данных' });
    }

    var lines = [
      "блок-схема LR",
      '  classDef sqlTable fill:#ecfeff,stroke:#0891b2,stroke-width:1.5px,color:#164e63;',
      "  classDef sqlStep fill: # fff7ed, обводка: # d97706, ширина обводки: 1,4 пикселя, цвет: # 7c2d12;",
      "  classDef sqlOutput fill:#ecfdf5,stroke:#059669,ширина штриха:1,5 пикселей,цвет:#065f46;"
    ];
    sources.forEach(function (source) {
      var fields = Array.from(source.columns).filter(Boolean).slice(0, 6);
      var label = source.name + '<br/>' + (fields.length ? fields.join('<br/>') : 'поля см. в примере SQL');
      lines.push('  ' + source.id + '["' + label + '"]:::sqlTable');
    });
    operations.forEach(function (operation, index) {
      operation.id = 'S' + (index + 1);
      lines.push('  ' + operation.id + '["' + operation.label + '<br/>' + operation.detail + '"]:::sqlStep');
    });
    lines.push('  OUT["Результат запроса<br/>таблица ниже"]:::sqlOutput');

    var firstOperation = operations.length ? operations[0].id : 'OUT';
    sources.forEach(function (source) { lines.push('  ' + source.id + ' --> ' + firstOperation); });
    for (var i = 0; i < operations.length - 1; i++) {
      lines.push('  ' + operations[i].id + ' --> ' + operations[i + 1].id);
    }
    if (operations.length) lines.push('  ' + operations[operations.length - 1].id + ' --> OUT');
    return lines.join('\n');
  }

  function panelHTML(lesson) {
    var source = diagramSource(lesson);
    if (!source) return '';
    var safeId = String(lesson && lesson.id || 'sql').replace(/[^A-Za-z0-9_-]/g, '');
    var title = lesson && lesson.title || 'SQL';
    return '<section class="card sql-mermaid-panel" aria-labelledby="sql-mermaid-title-' + safeId + '">' +
      "<div class=\"lesson-eyebrow\"><i data-lucide=\"git-merge\" aria-hidden=\"true\"></i> Схема данных · Русалка.js</div>" +
      '<h3 class="sql-mermaid-title" id="sql-mermaid-title-' + safeId + '">Как запрос работает с таблицами</h3>' +
      '<p class="sql-mermaid-intro">Блоки показывают таблицы и поля, которые можно определить по примеру SQL. Ниже приведена таблица с результатом запроса.</p>' +
      '<div class="sql-mermaid-canvas"><pre class="mermaid sql-mermaid-source" role="img" aria-label="' + escapeHtml('Схема таблиц для урока «' + title + '»') + '">' + escapeHtml(source).replace(/&lt;br\/&gt;/g, '<br/>') + '</pre></div>' +
      '<details class="sql-mermaid-details"><summary>Показать текст схемы</summary><pre class="sql-mermaid-code"><code>' + escapeHtml(source) + '</code></pre></details>' +
      '</section>';
  }

  var initialized = false;
  var mermaidLoadPromise = null;
  var MERMAID_SRC = 'https://cdn.jsdelivr.net/npm/mermaid@11.17.2/dist/mermaid.min.js';

  function removeLoading(root) {
    root = root || global.document;
    if (!root || !root.querySelectorAll) return;
    Array.prototype.forEach.call(root.querySelectorAll('.sql-mermaid-loading'), function (notice) {
      if (notice.parentNode) notice.parentNode.removeChild(notice);
    });
    Array.prototype.forEach.call(root.querySelectorAll('.sql-mermaid-source'), function (node) {
      node.style.display = '';
      if (node.removeAttribute) node.removeAttribute('data-sql-mermaid-pending');
    });
  }

  function showFallback(root, message) {
    root = root || global.document;
    if (!root || !root.querySelectorAll) return;
    Array.prototype.forEach.call(root.querySelectorAll('.sql-mermaid-source'), function (node) {
      var canvas = node.closest('.sql-mermaid-canvas');
      if (canvas) canvas.innerHTML = '<p class="sql-mermaid-fallback">' + message + '</p>';
    });
  }

  function loadMermaid() {
    if (global.mermaid && typeof global.mermaid.run === 'function') return Promise.resolve(global.mermaid);
    if (!global.document || !global.document.createElement || !global.document.head) {
      return Promise.reject(new Error("Заголовок документа недоступен."));
    }
    return new Promise(function (resolve, reject) {
      var script = global.document.createElement('script');
      script.src = MERMAID_SRC;
      script.async = true;
      script.setAttribute('data-sql-mermaid-loader', 'true');
      script.onload = function () {
        if (global.mermaid && typeof global.mermaid.run === 'function') resolve(global.mermaid);
        else reject(new Error("Русалка загружена без API браузера"));
      };
      script.onerror = function () { reject(new Error("Запрос Mermaid CDN не выполнен")); };
      global.document.head.appendChild(script);
    });
  }

  function render(root) {
    root = root || global.document;
    if (!root || !root.querySelectorAll) return Promise.resolve();
    var nodes = Array.prototype.slice.call(root.querySelectorAll('.sql-mermaid-source'));
    if (!nodes.length) return Promise.resolve();

    if (!global.mermaid || typeof global.mermaid.run !== 'function') {
      nodes.forEach(function (node) {
        if (node.getAttribute('data-sql-mermaid-pending') === 'true') return;
        node.setAttribute('data-sql-mermaid-pending', 'true');
        node.style.display = 'none';
        var canvas = node.closest('.sql-mermaid-canvas');
        if (canvas) {
          var notice = global.document.createElement('p');
          notice.className = 'sql-mermaid-loading';
          notice.textContent = 'Подготавливаем схему таблиц…';
          canvas.insertBefore(notice, node);
        }
      });
      if (!mermaidLoadPromise) {
        mermaidLoadPromise = loadMermaid()
          .then(function () {
            removeLoading(global.document);
            return render(global.document);
          })
          .catch(function () {
            showFallback(global.document, 'Не удалось загрузить схему. Пример SQL и таблица результата остаются доступными ниже.');
          })
          .finally(function () { mermaidLoadPromise = null; });
      }
      return mermaidLoadPromise;
    }

    removeLoading(root);
    if (!initialized) {
      global.mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        themeVariables: {
          primaryColor: '#ecfeff',
          primaryTextColor: '#164e63',
          primaryBorderColor: '#0891b2',
          lineColor: '#64748b',
          secondaryColor: '#fff7ed',
          tertiaryColor: '#ecfdf5',
          fontFamily: "Интер, системный интерфейс, без засечек",
          fontSize: '14px'
        },
        flowchart: { htmlLabels: true, curve: 'linear', nodeSpacing: 26, rankSpacing: 36, useMaxWidth: true }
      });
      initialized = true;
    }
    return global.mermaid.run({ nodes: nodes }).catch(function () {
      showFallback(root, 'Эту схему не удалось отобразить. Посмотри текст схемы ниже и таблицу результата.');
    });
  }

  var api = { diagramSource: diagramSource, panelHTML: panelHTML, render: render };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (global) global.SqlMermaid = api;
})(typeof window !== 'undefined' ? window : globalThis);
