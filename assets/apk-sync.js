/* Analyst Prep Kit — validated backup/restore for all progress modules. */
(function () {
  'use strict';
  var api = window.APKProgress;
  var MAX_VALUE = 2 * 1024 * 1024;

  function fail(message) { return { ok: false, error: message }; }

  function collect() {
    var result = {};
    if (!api) return result;
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (!key || !api.isAllowedKey(key)) continue;
      var value = localStorage.getItem(key);
      if (typeof value === 'string' && value.length <= MAX_VALUE) result[key] = value;
    }
    return result;
  }

  var syncApi = {
    exportData: function () {
      if (!api) throw new Error('Модуль проверки сохранений не загружен.');
      return api.encodeExport(collect());
    },
    importData: function (code) {
      if (!api) return fail('Модуль проверки сохранений не загружен. Обнови страницу и попробуй снова.');
      // Parse and validate the ENTIRE file before touching localStorage.
      var parsed = api.parseImport(code);
      if (!parsed.ok) return parsed;
      var restored = 0;
      var skipped = 0;
      var failed = 0;
      var meta = {};
      try {
        meta = JSON.parse(localStorage.getItem('apk-sync-meta-v1') || '{}') || {};
      } catch (_) { meta = {}; }

      Object.keys(parsed.data).forEach(function (key) {
        try {
          var incoming = parsed.data[key];
          var current = localStorage.getItem(key);
          // Never let an old/offline wallet import increase an existing balance.
          if (key === 'datacraft-wallet-v1' && current !== null) {
            skipped++;
            return;
          }
          var next = current === null ? incoming : api.mergeRaw(current, incoming, key);
          if (next !== current) {
            localStorage.setItem(key, next);
            restored++;
          }
          meta[key] = { updatedAt: Date.now(), deleted: false };
        } catch (_) {
          // Storage quota failures do not invalidate the source code, but are
          // surfaced as a partial restore rather than claiming full success.
          failed++;
        }
      });
      try { localStorage.setItem('apk-sync-meta-v1', JSON.stringify(meta)); } catch (_) {}
      if (!restored && failed) return fail('Браузер не разрешил восстановление. Освободи место и попробуй снова.');
      return { ok: true, count: restored, skipped: skipped };
    }
  };
  window.apkSync = syncApi;

  function wire() {
    var ex = document.getElementById('apk-sync-export');
    var im = document.getElementById('apk-sync-import');
    var box = document.getElementById('apk-sync-box');
    var msg = document.getElementById('apk-sync-msg');
    if (ex && box && msg) ex.addEventListener('click', function () {
      try {
        box.value = syncApi.exportData();
        box.select();
        try { document.execCommand('copy'); } catch (_) {}
        msg.textContent = 'Код сохранения готов. Скопируй его и импортируй на другом устройстве.';
      } catch (error) {
        msg.textContent = error.message || 'Не удалось экспортировать сохранение.';
      }
    });
    if (im && box && msg) im.addEventListener('click', function () {
      if (!box.value.trim()) { msg.textContent = 'Сначала вставь код сохранения.'; return; }
      var result = syncApi.importData(box.value);
      if (!result.ok) { msg.textContent = result.error; return; }
      msg.textContent = 'Восстановлено записей: ' + result.count +
        (result.skipped ? ' · пропущено: ' + result.skipped : '') + '. Перезагрузка…';
      setTimeout(function () { location.reload(); }, 900);
    });
  }

  if (document.readyState !== 'loading') wire();
  else document.addEventListener('DOMContentLoaded', wire);
})();
