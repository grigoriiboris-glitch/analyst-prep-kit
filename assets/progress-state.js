/* Shared, dependency-free progress helpers for Analyst Prep Kit. */
(function (root, factory) {
  "используйте строгий";
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.APKProgress = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  "используйте строгий";

  var KITS = {
    foundations: { id: 'foundations-v1', keys: ['apk-foundations-progress-v1', 'apk-foundations-state-v1'] },
    businessAnalysis: { id: 'business-analysis-v1', keys: ['apk-business-analysis-progress-v1', 'apk-business-analysis-answers-v1', 'apk-business-analysis-case-v1', 'apk-business-analysis-state-v1'] },
    quality: { id: 'quality-v1', keys: ['apk-quality-solution', 'apk-quality-score', 'apk-quality-passed-v1'] },
    sql: { id: 'sqlkit-v1', keys: ['sqlkit-v1', 'sqlkit-recalls', 'sqlkit-recall-wins', 'sqlkit-last-visit', 'sqlkit-streak'], prefixes: ['sqlkit-'] },
    sql2: { id: 'sql2-v1', keys: ['sql2kit-v1', 'sql2-last-visit', 'sql2-streak'], prefixes: ['sql2-'] },
    postgresql: { id: 'postgresql-v1', keys: ['apk-postgresql-progress-v1'] },
    excel: { id: 'excel-v1', keys: ['epk', 'epk-recalls', 'epk-recall-wins', 'epk-last-visit', 'epk-streak'], prefixes: ['epk-'] },
    python: { id: 'python-v1', keys: ['ppk', 'ppk-recalls', 'ppk-recall-wins', 'ppk-last-visit', 'ppk-streak'], prefixes: ['ppk-'] },
    powerbi: { id: 'powerbi-v1', keys: ['pbikt-v1', 'pbikt-recalls', 'pbikt-recall-wins', 'pbikt-last-visit', 'pbikt-streak'], prefixes: ['pbikt-'] },
    tableau: { id: 'tableau-v1', keys: ['tpk', 'tpk-recalls', 'tpk-recall-wins', 'tpk-last-visit', 'tpk-streak'], prefixes: ['tpk-'] },
    statistics: { id: 'stats-v1', keys: ['spk', 'spk-recalls', 'spk-recall-wins', 'spk-last-visit', 'spk-streak'], prefixes: ['spk-'] },
    charts: { id: 'charts-v1', keys: ['clk-v1'] },
    forecasting: { id: 'forecasting-v1', keys: ['fmk-v1'] },
    decision: { id: 'decision-v1', keys: ['apk-decision-thinking-progress-v1', 'apk-decision-thinking-answer-v1', 'apk-decision-thinking-checklist-v1', 'apk-decision-thinking-state-v1'] },
    interview: { id: 'interview-v1', keys: ['ipk', 'ipk-recalls', 'ipk-recall-wins', 'ipk-last-visit', 'ipk-streak'], prefixes: ['ipk-'] },
    simulator: { id: 'simulator-v1', keys: ['sim2'], prefixes: ['sim2-'] },
    final: { id: 'final-v1', keys: ['apk-final'] },
    projects: { id: 'projects-v1', keys: ['apk-project-studio-v1', 'apk-projects-v1'] },
    portfolio: { id: 'portfolio-v1', keys: ['apk-portfolio-v1', 'apk-portfolio-projects-v1'] },
    plan: { id: 'plan-v1', keys: ['apk-plan-v1'] },
    learningPath: { id: 'learning-path-v1', keys: ['apk-path-trial-u1', 'apk-path-scores-u1', 'apk-path-intro-u1'] },
    datacraft: { id: 'datacraft-v1', keys: ['datacraft-save-v1'] },
    wallet: { id: 'shared-wallet-v1', keys: ['datacraft-wallet-v1'] },
    certificates: { id: 'certificates-v1', keys: [
      'apk-excelcert', 'apk-pbicert', 'apk-tabcert', 'apk-dscert',
      'apk-dsclmcert', 'apk-dsclmwfcert', 'apk-dsclmimplcert', 'apk-dsorgcert',
      'apk-dp900cert', 'apk-alteryxcert', 'apk-ga4cert', 'apk-dbxcert',
      'apk-excelexpertcert'
    ] }
  };

  var BLOCKED_KEY = /(?:api[-_]?key|coach[-_]?key|password|secret|token|session|sync|theme|gaOptOut|optout)/i;
  var KEY_TO_KIT = Object.create(null);
  Object.keys(KITS).forEach(function (name) {
    var kit = KITS[name];
    kit.keys.forEach(function (key) { KEY_TO_KIT[key] = kit.id; });
  });

  function getKitIdForKey(key) {
    key = String(key || '');
    if (!key || BLOCKED_KEY.test(key)) return null;
    if (KEY_TO_KIT[key]) return KEY_TO_KIT[key];
    for (var name in KITS) {
      var prefixes = KITS[name].prefixes || [];
      if (prefixes.some(function (prefix) { return key.indexOf(prefix) === 0; })) return KITS[name].id;
    }
    return null;
  }

  function isAllowedKey(key) {
    return !!getKitIdForKey(key);
  }

  function safeParse(value) {
    try { return JSON.parse(value); } catch (e) { return null; }
  }

  function stableValue(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(stableValue).join(',') + ']';
    return '{' + Object.keys(value).sort().map(function (key) {
      return JSON.stringify(key) + ':' + stableValue(value[key]);
    }).join(',') + '}';
  }

  function mergeValues(localValue, cloudValue) {
    if (localValue === undefined || localValue === null) return cloudValue;
    if (cloudValue === undefined || cloudValue === null) return localValue;
    if (Array.isArray(localValue) && Array.isArray(cloudValue)) {
      var seen = Object.create(null), merged = [];
      localValue.concat(cloudValue).forEach(function (item) {
        var signature = stableValue(item);
        if (!seen[signature]) { seen[signature] = true; merged.push(item); }
      });
      return merged;
    }
    if (typeof localValue === 'object' && typeof cloudValue === 'object' &&
        !Array.isArray(localValue) && !Array.isArray(cloudValue)) {
      var result = {}, keys = Object.keys(localValue).concat(Object.keys(cloudValue));
      keys.forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(result, key)) return;
        if (Object.prototype.hasOwnProperty.call(localValue, key) &&
            Object.prototype.hasOwnProperty.call(cloudValue, key)) {
          result[key] = mergeValues(localValue[key], cloudValue[key]);
        } else if (Object.prototype.hasOwnProperty.call(localValue, key)) {
          result[key] = localValue[key];
        } else {
          result[key] = cloudValue[key];
        }
      });
      return result;
    }
    if (typeof localValue === 'boolean' && typeof cloudValue === 'boolean') {
      return localValue || cloudValue;
    }
    if (typeof localValue === 'number' && typeof cloudValue === 'number') {
      return Math.max(localValue, cloudValue);
    }
    return localValue;
  }

  function mergeRaw(localRaw, cloudRaw, key) {
    if (key === 'datacraft-wallet-v1') return localRaw == null ? cloudRaw : localRaw;
    if (localRaw == null) return cloudRaw;
    if (cloudRaw == null) return localRaw;
    var localValue = safeParse(localRaw), cloudValue = safeParse(cloudRaw);
    if (localValue === null || cloudValue === null) return localRaw;
    return JSON.stringify(mergeValues(localValue, cloudValue));
  }

  function resolveSnapshotEntry(localRaw, localMeta, cloudEntry, key) {
    localMeta = localMeta || {};
    if (!cloudEntry || typeof cloudEntry !== 'object' ||
        (cloudEntry.deleted !== true && typeof cloudEntry.value !== 'string')) {
      return { action: 'keep', value: localRaw, updatedAt: Number(localMeta.updatedAt) || 0, deleted: !!localMeta.deleted };
    }
    var localStamp = Number(localMeta.updatedAt) || 0;
    var cloudStamp = Number(cloudEntry.updatedAt) || 0;
    if (localMeta.deleted && localStamp >= cloudStamp) {
      return { action: 'keep', value: localRaw, updatedAt: localStamp, deleted: true };
    }
    if (cloudEntry.deleted) {
      return {
        action: cloudStamp > localStamp && localRaw !== null ? 'delete' : 'keep',
        value: null,
        updatedAt: cloudStamp > localStamp ? cloudStamp : localStamp,
        deleted: cloudStamp > localStamp ? true : !!localMeta.deleted
      };
    }
    var nextRaw;
    if (key === 'datacraft-wallet-v1' || /(?:-last-visit|apk-quality-score)$/.test(key)) {
      nextRaw = localRaw === null || cloudStamp > localStamp ? cloudEntry.value : localRaw;
    } else {
      nextRaw = mergeRaw(localRaw, cloudEntry.value, key);
    }
    return {
      action: nextRaw === localRaw ? 'keep' : 'set',
      value: nextRaw,
      updatedAt: Math.max(localStamp, cloudStamp),
      deleted: false
    };
  }

  // Cloud writes are blocked until this account's snapshot restore has succeeded.
  // The post-restore bootstrap is the only intentional bypass.
  function canSyncCloud(userId, readyUserId, afterRestore) {
    return !!userId && (afterRestore === true || userId === readyUserId);
  }

  function mergeSyncQueue(queue, item) {
    var items = Array.isArray(queue) ? queue : [];
    function same(a, b) {
      if (a.kind !== b.kind || a.userId !== b.userId) return false;
      if (a.kind === 'snapshot') return a.kitId === b.kitId;
      var ar = a.row || a, br = b.row || b;
      return ar.user_id === br.user_id && ar.kit_id === br.kit_id &&
        ar.lesson_id === br.lesson_id && ar.drill_id === br.drill_id;
    }
    return items.filter(function (candidate) { return !same(candidate, item); }).concat([item]);
  }

  function normalizePosition(position, cols, rows, fallback) {
    var maxX = Math.max(1, Number(cols) || 30) - 1;
    var maxY = Math.max(1, Number(rows) || 18) - 1;
    var defaultPosition = fallback || { x: 5, y: 7 };
    if (!position || typeof position !== 'object' ||
        !Number.isFinite(Number(position.x)) || !Number.isFinite(Number(position.y))) {
      return { x: defaultPosition.x, y: defaultPosition.y };
    }
    return {
      x: Math.max(0, Math.min(maxX, Number(position.x))),
      y: Math.max(0, Math.min(maxY, Number(position.y)))
    };
  }

  function encodeExport(data) {
    var json = JSON.stringify(data);
    if (typeof btoa === 'function') return 'APK2:' + btoa(unescape(encodeURIComponent(json)));
    if (typeof Buffer !== 'undefined') return 'APK2:' + Buffer.from(json, 'utf8').toString('base64');
    throw new Error("Кодировка База64 недоступна.");
  }

  function decodeBase64(value) {
    if (typeof atob === 'function') return decodeURIComponent(escape(atob(value)));
    if (typeof Buffer !== 'undefined') return Buffer.from(value, 'base64').toString('utf8');
    throw new Error("Декодирование База64 недоступно");
  }

  function parseImport(code) {
    var raw = String(code || '').trim();
    if (raw.indexOf('APK1:') === 0 || raw.indexOf('APK2:') === 0) raw = raw.slice(5);
    if (!raw || raw.length > 8 * 1024 * 1024) {
      return { ok: false, error: 'Пустой код или слишком большой файл сохранения.' };
    }
    var parsed;
    try { parsed = JSON.parse(decodeBase64(raw)); }
    catch (e) { return { ok: false, error: 'Код сохранения повреждён или скопирован не полностью.' }; }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: 'Формат сохранения не поддерживается.' };
    }
    var source = parsed.data && typeof parsed.data === 'object' && !Array.isArray(parsed.data)
      ? parsed.data : parsed;
    var result = {};
    var keys = Object.keys(source);
    if (!keys.length) return { ok: false, error: 'В сохранении нет данных прогресса.' };
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i], value = source[key];
      if (!isAllowedKey(key)) continue;
      if (typeof value !== 'string' || value.length > 2 * 1024 * 1024) {
        return { ok: false, error: 'Сохранение содержит некорректные данные. Ничего не изменено.' };
      }
      if (!/(?:-last-visit|apk-quality-score)$/.test(key) && safeParse(value) === null) {
        return { ok: false, error: 'Одно из сохранений повреждено. Ничего не изменено.' };
      }
      result[key] = value;
    }
    if (!Object.keys(result).length) {
      return { ok: false, error: 'В коде нет поддерживаемых данных прогресса.' };
    }
    return { ok: true, data: result, count: Object.keys(result).length };
  }

  return {
    KITS: KITS,
    getKitIdForKey: getKitIdForKey,
    isAllowedKey: isAllowedKey,
    mergeValues: mergeValues,
    mergeRaw: mergeRaw,
    resolveSnapshotEntry: resolveSnapshotEntry,
    mergeSyncQueue: mergeSyncQueue,
    canSyncCloud: canSyncCloud,
    normalizePosition: normalizePosition,
    encodeExport: encodeExport,
    parseImport: parseImport
  };
});
