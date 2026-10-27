// ============================================================================
// SUPABASE AUTH + SHARED PROGRESS SYNC
// Local-first persistence, cloud restore/merge, and durable retry queue.
// Depends on assets/progress-state.js (loads first on every participating page).
// ============================================================================
const SUPABASE_CONFIG = {
  url: 'https://liiivtbyyawueboeavmw.supabase.co',
  anonKey: 'sb_publishable_O-6hDpC3l1KdDtHpcv6JVw_O5dSJQor',
};

let supabaseClient = null;
let supabaseInitPromise = null;
const APK_SYNC_META_KEY = 'apk-sync-meta-v1';
const APK_SYNC_QUEUE_KEY = 'apk-sync-queue-v2';
const APK_LEGACY_QUEUE_KEY = 'apk-sync-queue';
const APK_SNAPSHOT_DRILL = '__snapshot__';
let apkSuppressSyncTracking = false;
let apkRestorePromise = null;
const apkPendingSyncTimers = Object.create(null);

function apkProgressApi() {
  if (!window.APKProgress) throw new Error('progress-state.js was not loaded before supabase_auth_sync.js');
  return window.APKProgress;
}

async function initSupabase() {
  if (supabaseClient) return supabaseClient;
  if (supabaseInitPromise) return supabaseInitPromise;

  supabaseInitPromise = (async () => {
    if (!window.supabase) {
      await new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-apk-supabase-sdk]');
        if (existing) {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.dataset.apkSupabaseSdk = 'true';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Не удалось загрузить Supabase SDK'));
        document.head.appendChild(script);
      });
    }
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      throw new Error('Supabase SDK недоступен');
    }
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    return supabaseClient;
  })().catch(error => {
    supabaseInitPromise = null;
    throw error;
  });
  return supabaseInitPromise;
}

// ============================================================================
// AUTH
// ============================================================================
async function signUpWithEmail(email, password) {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message || 'Не удалось создать аккаунт.' };
  }
}

async function signInWithEmail(email, password) {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    await bootstrapProgressSync({ user: data.user });
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message || 'Не удалось войти.' };
  }
}

async function signInWithGoogle() {
  try {
    const sb = await initSupabase();
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { success: false, error: error.message || 'Не удалось войти через Google.' };
  }
}

async function signOut() {
  const sb = await initSupabase();
  const { error } = await sb.auth.signOut();
  if (error) throw error;
  localStorage.removeItem('apk-session');
  return true;
}

// Return the cached session user first. This also lets the retry queue retain
// the correct account identifier while the browser is temporarily offline.
async function getCurrentUser() {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb.auth.getSession();
    if (!error && data && data.session && data.session.user) return data.session.user;
    const result = await sb.auth.getUser();
    return result && result.data ? result.data.user : null;
  } catch (error) {
    console.warn('Auth temporarily unavailable:', error.message || error);
    return null;
  }
}

async function isAuthenticated() {
  return !!(await getCurrentUser());
}

// ============================================================================
// LOCAL-STATE TRACKING
// ============================================================================
function apkReadMeta() {
  try {
    const meta = JSON.parse(localStorage.getItem(APK_SYNC_META_KEY) || '{}');
    return meta && typeof meta === 'object' && !Array.isArray(meta) ? meta : {};
  } catch (_) {
    return {};
  }
}

function apkWriteMeta(meta) {
  try { Storage.prototype.setItem.call(localStorage, APK_SYNC_META_KEY, JSON.stringify(meta)); }
  catch (error) { console.warn('Progress metadata could not be saved:', error); }
}

function apkMarkKeyChanged(key, deleted) {
  if (apkSuppressSyncTracking) return;
  let kitId;
  try { kitId = apkProgressApi().getKitIdForKey(key); } catch (_) { return; }
  if (!kitId) return;
  const meta = apkReadMeta();
  meta[key] = { updatedAt: Date.now(), deleted: !!deleted };
  apkWriteMeta(meta);
  apkScheduleKitSync(kitId);
}

(function installProgressStorageHooks() {
  try {
    if (Storage.prototype.__apkProgressHooksInstalled) return;
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.setItem = function (key, value) {
      originalSetItem.call(this, key, value);
      if (this === window.localStorage) apkMarkKeyChanged(String(key), false);
    };
    Storage.prototype.removeItem = function (key) {
      originalRemoveItem.call(this, key);
      if (this === window.localStorage) apkMarkKeyChanged(String(key), true);
    };
    Object.defineProperty(Storage.prototype, '__apkProgressHooksInstalled', { value: true });
  } catch (error) {
    console.warn('Progress storage hooks are unavailable:', error);
  }
})();

function apkCollectKitSnapshot(kitId) {
  const api = apkProgressApi();
  const meta = apkReadMeta();
  const entries = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || api.getKitIdForKey(key) !== kitId) continue;
    const stamp = meta[key] || {};
    entries[key] = {
      value: localStorage.getItem(key),
      updatedAt: Number(stamp.updatedAt) || 0,
      deleted: false,
    };
  }
  Object.keys(meta).forEach(key => {
    if (api.getKitIdForKey(key) !== kitId || !meta[key] || !meta[key].deleted) return;
    if (!Object.prototype.hasOwnProperty.call(entries, key)) {
      entries[key] = { value: null, updatedAt: Number(meta[key].updatedAt) || 0, deleted: true };
    }
  });
  return { version: 2, entries };
}

function apkScheduleKitSync(kitId) {
  if (!kitId || apkSuppressSyncTracking) return;
  clearTimeout(apkPendingSyncTimers[kitId]);
  apkPendingSyncTimers[kitId] = setTimeout(() => {
    delete apkPendingSyncTimers[kitId];
    syncKitSnapshot(kitId).catch(error => {
      console.warn('Progress sync deferred:', kitId, error.message || error);
    });
  }, 650);
}

class SyncQueue {
  constructor() {
    this.queue = [];
    try {
      const current = JSON.parse(localStorage.getItem(APK_SYNC_QUEUE_KEY) || '[]');
      if (Array.isArray(current)) this.queue = current;
      if (!this.queue.length) {
        const legacy = JSON.parse(localStorage.getItem(APK_LEGACY_QUEUE_KEY) || '[]');
        if (Array.isArray(legacy)) this.queue = legacy.map(row => ({ kind: 'row', userId: row.user_id, row }));
      }
    } catch (_) {
      this.queue = [];
    }
  }

  save() {
    try {
      Storage.prototype.setItem.call(localStorage, APK_SYNC_QUEUE_KEY, JSON.stringify(this.queue));
      Storage.prototype.removeItem.call(localStorage, APK_LEGACY_QUEUE_KEY);
    } catch (error) {
      console.warn('Sync queue could not be persisted:', error);
    }
  }

  addSnapshot(userId, kitId, state) {
    if (!userId || !kitId || !state) return;
    this.queue = this.queue.filter(item => !(item.kind === 'snapshot' && item.userId === userId && item.kitId === kitId));
    this.queue.push({ kind: 'snapshot', userId, kitId, state, queuedAt: Date.now() });
    this.save();
  }

  addRow(row) {
    if (!row || !row.user_id) return;
    this.queue = this.queue.filter(item => {
      const previous = item.row || item;
      return !(item.kind === 'row' && previous.user_id === row.user_id &&
        previous.kit_id === row.kit_id && previous.lesson_id === row.lesson_id &&
        previous.drill_id === row.drill_id);
    });
    this.queue.push({ kind: 'row', userId: row.user_id, row, queuedAt: Date.now() });
    this.save();
  }

  async flush(userOverride) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
    const user = userOverride || await getCurrentUser();
    if (!user || !this.queue.length) return false;
    const sb = await initSupabase();
    let changed = false;
    for (const item of this.queue.slice()) {
      if (item.userId && item.userId !== user.id) continue;
      const row = item.kind === 'snapshot'
        ? { user_id: user.id, kit_id: item.kitId, lesson_id: 0, drill_id: APK_SNAPSHOT_DRILL,
            state: item.state, last_updated: new Date().toISOString() }
        : (item.row || item);
      try {
        const { error } = await sb.from('user_progress').upsert(row, {
          onConflict: 'user_id,kit_id,lesson_id,drill_id',
        });
        if (!error) {
          this.queue = this.queue.filter(candidate => candidate !== item);
          changed = true;
        } else {
          console.warn('Queued progress remains pending:', error.message || error);
        }
      } catch (error) {
        console.warn('Queued progress remains pending:', error.message || error);
        break;
      }
    }
    if (changed) this.save();
    return changed;
  }
}

const syncQueue = new SyncQueue();

// ============================================================================
// CLOUD WRITE / READ
// ============================================================================
async function syncKitSnapshot(kitId) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const user = await getCurrentUser();
    if (user) syncQueue.addSnapshot(user.id, kitId, apkCollectKitSnapshot(kitId));
    return false;
  }
  const user = await getCurrentUser();
  if (!user) return false; // local-first; do not attach anonymous work to an account later
  const snapshot = apkCollectKitSnapshot(kitId);
  if (!Object.keys(snapshot.entries).length) return false;
  // Existing local saves acquire a timestamp on their first authenticated sync.
  const meta = apkReadMeta();
  let metaChanged = false;
  Object.keys(snapshot.entries).forEach(key => {
    const entry = snapshot.entries[key];
    if (!entry.deleted && !entry.updatedAt) {
      entry.updatedAt = Date.now();
      meta[key] = { updatedAt: entry.updatedAt, deleted: false };
      metaChanged = true;
    }
  });
  if (metaChanged) apkWriteMeta(meta);
  try {
    const sb = await initSupabase();
    const { error } = await sb.from('user_progress').upsert({
      user_id: user.id,
      kit_id: kitId,
      lesson_id: 0,
      drill_id: APK_SNAPSHOT_DRILL,
      state: snapshot,
      last_updated: new Date().toISOString(),
    }, { onConflict: 'user_id,kit_id,lesson_id,drill_id' });
    if (error) throw error;
    return true;
  } catch (error) {
    syncQueue.addSnapshot(user.id, kitId, snapshot);
    console.warn('Snapshot queued for retry:', kitId, error.message || error);
    return false;
  }
}

// Backwards-compatible granular write used by the SQL course's lesson handler.
async function syncProgress(kitId, lessonId, drillId, state) {
  const user = await getCurrentUser();
  if (!user) return false;
  const row = {
    user_id: user.id,
    kit_id: kitId,
    lesson_id: Number.isFinite(Number(lessonId)) ? Number(lessonId) : 0,
    drill_id: String(drillId || 'lesson'),
    state: state,
    last_updated: new Date().toISOString(),
  };
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    syncQueue.addRow(row);
    return false;
  }
  try {
    const sb = await initSupabase();
    const { error } = await sb.from('user_progress').upsert(row, {
      onConflict: 'user_id,kit_id,lesson_id,drill_id',
    });
    if (error) throw error;
    return true;
  } catch (error) {
    syncQueue.addRow(row);
    console.warn('Granular progress queued for retry:', error.message || error);
    return false;
  }
}

async function fetchKitProgress(kitId) {
  const sb = await initSupabase();
  const user = await getCurrentUser();
  if (!user) return {};
  try {
    const { data, error } = await sb.from('user_progress')
      .select('lesson_id,drill_id,state')
      .eq('user_id', user.id)
      .eq('kit_id', kitId);
    if (error) throw error;
    const progress = {};
    (data || []).filter(row => row.drill_id !== APK_SNAPSHOT_DRILL).forEach(row => {
      if (!progress[row.lesson_id]) progress[row.lesson_id] = {};
      progress[row.lesson_id][row.drill_id || 'lesson'] = row.state;
    });
    return progress;
  } catch (error) {
    console.error('Fetch progress error:', error);
    return {};
  }
}

async function restoreAllProgress(options) {
  if (apkRestorePromise) return apkRestorePromise;
  apkRestorePromise = (async () => {
    const user = options && options.user ? options.user : await getCurrentUser();
    if (!user) return { changed: false, restoredKeys: [] };
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return { changed: false, restoredKeys: [] };

    let data;
    try {
      const sb = await initSupabase();
      const result = await sb.from('user_progress')
        .select('kit_id,lesson_id,drill_id,state,last_updated')
        .eq('user_id', user.id);
      if (result.error) throw result.error;
      data = result.data || [];
    } catch (error) {
      console.warn('Cloud restore postponed:', error.message || error);
      return { changed: false, restoredKeys: [] };
    }

    const api = apkProgressApi();
    const snapshots = Object.create(null);
    data.forEach(row => {
      if (row.drill_id === APK_SNAPSHOT_DRILL && row.state && row.state.version === 2) {
        snapshots[row.kit_id] = row.state;
      }
    });
    const meta = apkReadMeta();
    const restoredKeys = [];
    let changed = false;
    apkSuppressSyncTracking = true;
    try {
      Object.keys(snapshots).forEach(kitId => {
        const entries = snapshots[kitId].entries || {};
        Object.keys(entries).forEach(key => {
          if (!api.isAllowedKey(key) || api.getKitIdForKey(key) !== kitId) return;
          const cloudEntry = entries[key];
          if (!cloudEntry || (cloudEntry.deleted !== true && typeof cloudEntry.value !== 'string')) return;
          const localStamp = Number((meta[key] || {}).updatedAt) || 0;
          const cloudStamp = Number(cloudEntry.updatedAt) || 0;
          const localDeleted = !!(meta[key] && meta[key].deleted);
          if (localDeleted && localStamp >= cloudStamp) return;

          if (cloudEntry.deleted) {
            if (cloudStamp > localStamp && localStorage.getItem(key) !== null) {
              Storage.prototype.removeItem.call(localStorage, key);
              meta[key] = { updatedAt: cloudStamp, deleted: true };
              restoredKeys.push(key);
              changed = true;
            }
            return;
          }

          const localRaw = localStorage.getItem(key);
          let nextRaw;
          if (key === 'datacraft-wallet-v1' || /(?:-last-visit|apk-quality-score)$/.test(key)) {
            nextRaw = localRaw === null || cloudStamp > localStamp ? cloudEntry.value : localRaw;
          } else {
            nextRaw = api.mergeRaw(localRaw, cloudEntry.value, key);
          }
          if (nextRaw !== localRaw) {
            Storage.prototype.setItem.call(localStorage, key, nextRaw);
            restoredKeys.push(key);
            changed = true;
          }
          meta[key] = {
            updatedAt: Math.max(localStamp, cloudStamp),
            deleted: false,
          };
        });
      });

      // Migrate progress written by the first SQL-only cloud integration.
      if (!snapshots['sqlkit-v1']) {
        const legacySqlRows = data.filter(row => row.kit_id === 'sqlkit-v1' &&
          row.drill_id !== APK_SNAPSHOT_DRILL && row.state && row.state.done === true);
        if (legacySqlRows.length) {
          let raw = localStorage.getItem('sqlkit-v1');
          let state = {};
          try { state = raw ? JSON.parse(raw) : {}; } catch (_) { state = {}; }
          legacySqlRows.forEach(row => {
            const field = String(row.drill_id || 'doneLessons');
            if (!Array.isArray(state[field])) state[field] = [];
            const id = Number(row.lesson_id);
            if (!state[field].some(value => String(value) === String(id))) state[field].push(id);
          });
          const next = JSON.stringify(state);
          if (next !== raw) {
            Storage.prototype.setItem.call(localStorage, 'sqlkit-v1', next);
            meta['sqlkit-v1'] = { updatedAt: Date.now(), deleted: false };
            restoredKeys.push('sqlkit-v1');
            changed = true;
          }
        }
      }
      apkWriteMeta(meta);
    } finally {
      apkSuppressSyncTracking = false;
    }
    return { changed, restoredKeys };
  })().finally(() => { apkRestorePromise = null; });
  return apkRestorePromise;
}

async function syncAllLocalProgress(user) {
  const currentUser = user || await getCurrentUser();
  if (!currentUser) return false;
  const api = apkProgressApi();
  const ids = Object.keys(api.KITS).map(name => api.KITS[name].id);
  let any = false;
  for (const kitId of ids) {
    const snapshot = apkCollectKitSnapshot(kitId);
    if (Object.keys(snapshot.entries).length) {
      const ok = await syncKitSnapshot(kitId);
      any = any || ok;
    }
  }
  return any;
}

async function bootstrapProgressSync(options) {
  try {
    const user = options && options.user ? options.user : await getCurrentUser();
    if (!user) return false;
    const result = await restoreAllProgress({ user });
    if (result.changed) {
      // App pages keep progress in memory. Reload once after restoring localStorage
      // so the currently open course renders the merged state, not its stale copy.
      setTimeout(() => {
        try { window.location.reload(); } catch (_) {}
      }, 50);
      return true;
    }
    await syncQueue.flush(user);
    await syncAllLocalProgress(user);
    await syncQueue.flush(user);
    return true;
  } catch (error) {
    console.warn('Progress bootstrap postponed:', error.message || error);
    return false;
  }
}

// ============================================================================
// PAID FEATURE GATE
// ============================================================================
async function hasInterviewPass() {
  const sb = await initSupabase();
  const user = await getCurrentUser();
  if (!user) return false;
  try {
    const { data, error } = await sb.from('user_entitlements')
      .select('has_interview_pass').eq('user_id', user.id).single();
    if (error) {
      if (error.code === 'PGRST116') return false;
      throw error;
    }
    return !!(data && data.has_interview_pass);
  } catch (error) {
    console.error('Entitlements check error:', error);
    return false;
  }
}

// This is a backend-only operation; client-side RLS intentionally does not
// grant users the ability to grant themselves paid access.
async function unlockInterviewPass(userId) {
  if (!userId) return false;
  try {
    const sb = await initSupabase();
    const { error } = await sb.from('user_entitlements').update({
      has_interview_pass: true,
      unlocked_at: new Date().toISOString(),
    }).eq('user_id', userId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Unlock error:', error);
    return false;
  }
}

async function onAuthStateChange(callback) {
  const sb = await initSupabase();
  return sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      callback('SIGNED_IN', session && session.user);
      setTimeout(() => bootstrapProgressSync({ user: session && session.user }), 0);
    } else if (event === 'SIGNED_OUT') {
      callback('SIGNED_OUT', null);
    }
  });
}

// Queue flushes after network recovery, tab return, and periodic retry while open.
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    const user = await getCurrentUser();
    if (user) {
      await syncQueue.flush(user);
      await bootstrapProgressSync({ user });
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncQueue.flush().catch(() => {});
  });
  setInterval(() => syncQueue.flush().catch(() => {}), 30000);
  setTimeout(() => bootstrapProgressSync().catch(() => {}), 1200);
}

// ============================================================================
// PREPLOOP SHELL: shell owns auth controls, but progress uses the same storage.
// ============================================================================
(function () {
  let framed = false;
  try { framed = window.top !== window.self; } catch (_) { framed = true; }
  if (!framed) return;
  document.documentElement.classList.add('apk-framed');
  const st = document.createElement('style');
  st.textContent = '.apk-framed #loginBtn,.apk-framed #logoutBtn,.apk-framed #userEmail,.apk-framed [title="Back to all kits"]{display:none !important}';
  document.head.appendChild(st);
})();

// Preserve old login callback contract.
onAuthStateChange(async (event) => {
  if (event === 'SIGNED_IN') await syncQueue.flush();
}).catch(error => console.warn('Auth listener unavailable:', error.message || error));
