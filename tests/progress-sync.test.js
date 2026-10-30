/* Unit tests for local-first progress persistence and import safety. */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const progress = require('../assets/progress-state.js');

function makeStorage(backing = new Map()) {
  return {
    get length() { return backing.size; },
    key(index) { return Array.from(backing.keys())[index] ?? null; },
    getItem(key) { return backing.has(String(key)) ? backing.get(String(key)) : null; },
    setItem(key, value) { backing.set(String(key), String(value)); },
    removeItem(key) { backing.delete(String(key)); },
    clear() { backing.clear(); },
    backing
  };
}

function loadBackupApi(storage) {
  const window = { APKProgress: progress };
  const document = {
    readyState: 'complete',
    getElementById() { return null; },
    addEventListener() {}
  };
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, '../assets/apk-sync.js'), 'utf8'),
    { window, localStorage: storage, document, setTimeout, console, location: { reload() {} } },
    { filename: 'assets/apk-sync.js' }
  );
  return window.apkSync;
}

test('SQL 2 has an isolated key that participates in cloud progress sync', () => {
  assert.equal(progress.getKitIdForKey('sql2kit-v2'), 'sql2-v2');
  assert.equal(progress.getKitIdForKey('sql2-last-visit-v2'), 'sql2-v2');
  assert.equal(progress.isAllowedKey('sql2kit-v2'), true);
  assert.equal(progress.getKitIdForKey('sqlkit-v1'), 'sqlkit-v1');
});

test('cloud restore merges lesson completion rather than replacing local progress', () => {
  const local = JSON.stringify({ doneLessons: [1, 3], doneFills: [5], theme: 'light' });
  const cloud = JSON.stringify({ doneLessons: [2, 3], doneFills: [6], badgeMarks: { early: true } });
  const resolution = progress.resolveSnapshotEntry(
    local,
    { updatedAt: 100, deleted: false },
    { value: cloud, updatedAt: 200, deleted: false },
    'sqlkit-v1'
  );

  assert.equal(resolution.action, 'set');
  const merged = JSON.parse(resolution.value);
  assert.deepEqual(merged.doneLessons, [1, 3, 2]);
  assert.deepEqual(merged.doneFills, [5, 6]);
  assert.deepEqual(merged.badgeMarks, { early: true });
  assert.equal(merged.theme, 'light');
});

test('cloud restore loads a remote save when the local browser is empty', () => {
  const remote = JSON.stringify({ doneLessons: [10], doneBugs: [2] });
  const resolution = progress.resolveSnapshotEntry(
    null,
    {},
    { value: remote, updatedAt: 500, deleted: false },
    'sqlkit-v1'
  );
  assert.equal(resolution.action, 'set');
  assert.deepEqual(JSON.parse(resolution.value), { doneLessons: [10], doneBugs: [2] });
});

test('cloud wallet restores over a fresh local starter wallet when the cloud copy is newer', () => {
  const local = JSON.stringify({ version: 1, balance: 10, totalEarned: 0, totalSpent: 0 });
  const cloud = JSON.stringify({ version: 1, balance: 84, totalEarned: 120, totalSpent: 36 });
  const resolution = progress.resolveSnapshotEntry(
    local,
    { updatedAt: 0, deleted: false },
    { value: cloud, updatedAt: 500, deleted: false },
    'datacraft-wallet-v1'
  );
  assert.equal(resolution.action, 'set');
  assert.deepEqual(JSON.parse(resolution.value), JSON.parse(cloud));
});

test('cloud writes wait until the signed-in account has restored its snapshot', () => {
  assert.equal(progress.canSyncCloud('user-a', null, false), false);
  assert.equal(progress.canSyncCloud('user-a', 'user-b', false), false);
  assert.equal(progress.canSyncCloud('user-a', 'user-a', false), true);
  assert.equal(progress.canSyncCloud('user-a', null, true), true);
  assert.equal(progress.canSyncCloud(null, null, true), false);
});

test('a newer local deletion is not undone by an older cloud snapshot', () => {
  const resolution = progress.resolveSnapshotEntry(
    null,
    { updatedAt: 900, deleted: true },
    { value: JSON.stringify({ doneLessons: [1] }), updatedAt: 800, deleted: false },
    'sqlkit-v1'
  );
  assert.equal(resolution.action, 'keep');
  assert.equal(resolution.deleted, true);
});

test('DataCraft position is restored and clamped to map bounds', () => {
  assert.deepEqual(progress.normalizePosition({ x: 12, y: 9 }, 30, 18, { x: 5, y: 7 }), { x: 12, y: 9 });
  assert.deepEqual(progress.normalizePosition({ x: 999, y: -4 }, 30, 18, { x: 5, y: 7 }), { x: 29, y: 0 });
  assert.deepEqual(progress.normalizePosition(null, 30, 18, { x: 5, y: 7 }), { x: 5, y: 7 });
});

test('offline retry queue keeps only the newest snapshot per account and course', () => {
  let queue = [];
  queue = progress.mergeSyncQueue(queue, {
    kind: 'snapshot', userId: 'u1', kitId: 'sqlkit-v1', state: { version: 2, entries: { old: true } }
  });
  queue = progress.mergeSyncQueue(queue, {
    kind: 'snapshot', userId: 'u1', kitId: 'sqlkit-v1', state: { version: 2, entries: { newest: true } }
  });
  queue = progress.mergeSyncQueue(queue, {
    kind: 'snapshot', userId: 'u2', kitId: 'sqlkit-v1', state: { version: 2, entries: { other: true } }
  });
  assert.equal(queue.length, 2);
  assert.deepEqual(queue[0].state.entries, { newest: true });
  assert.equal(queue[1].userId, 'u2');
});

test('invalid import does not overwrite an existing healthy save', () => {
  const storage = makeStorage();
  storage.setItem('sqlkit-v1', JSON.stringify({ doneLessons: [1, 2] }));
  const before = storage.getItem('sqlkit-v1');
  const backup = loadBackupApi(storage);

  const malformedInnerValue = progress.encodeExport({ 'sqlkit-v1': null });
  const result = backup.importData(malformedInnerValue);
  assert.equal(result.ok, false);
  assert.equal(storage.getItem('sqlkit-v1'), before);

  const malformedCode = backup.importData('APK2:not-valid-base64-or-json');
  assert.equal(malformedCode.ok, false);
  assert.equal(storage.getItem('sqlkit-v1'), before);
});

test('valid import transfers DataCraft world and wallet, but not credentials', () => {
  const shared = new Map();
  const storage = makeStorage(shared);
  storage.setItem('sim2-apikey', 'keep-this-local');
  storage.setItem('apk-session', 'keep-auth-local');
  storage.setItem('sqlkit-v1', JSON.stringify({ doneLessons: [1] }));
  const backup = loadBackupApi(storage);
  const code = progress.encodeExport({
    'sqlkit-v1': JSON.stringify({ doneLessons: [1, 2] }),
    'datacraft-save-v1': JSON.stringify({ buildings: { lab: true }, playerPosition: { x: 8, y: 5 } }),
    'datacraft-wallet-v1': JSON.stringify({ version: 1, balance: 15, totalEarned: 5, totalSpent: 0, claimed: {} }),
    'sim2-apikey': 'must-not-import',
    'apk-session': 'must-not-import'
  });

  const result = backup.importData(code);
  assert.equal(result.ok, true);
  assert.deepEqual(JSON.parse(storage.getItem('sqlkit-v1')).doneLessons, [1, 2]);
  assert.deepEqual(JSON.parse(storage.getItem('datacraft-save-v1')).playerPosition, { x: 8, y: 5 });
  assert.equal(JSON.parse(storage.getItem('datacraft-wallet-v1')).balance, 15);
  assert.equal(storage.getItem('sim2-apikey'), 'keep-this-local');
  assert.equal(storage.getItem('apk-session'), 'keep-auth-local');

  // A newly opened page uses the same browser storage and sees imported state.
  const reloadedStorage = makeStorage(shared);
  assert.deepEqual(JSON.parse(reloadedStorage.getItem('datacraft-save-v1')).buildings, { lab: true });
});

test('wallet import cannot replace an existing wallet balance', () => {
  const storage = makeStorage();
  storage.setItem('datacraft-wallet-v1', JSON.stringify({ balance: 4, totalEarned: 10, totalSpent: 6 }));
  const backup = loadBackupApi(storage);
  const code = progress.encodeExport({
    'datacraft-wallet-v1': JSON.stringify({ balance: 999, totalEarned: 999, totalSpent: 0 })
  });
  const result = backup.importData(code);
  assert.equal(result.ok, true);
  assert.equal(storage.getItem('datacraft-wallet-v1'), JSON.stringify({ balance: 4, totalEarned: 10, totalSpent: 6 }));
});

test('DataCraft does not award the same coin reward twice', () => {
  const storage = makeStorage();
  const window = {
    addEventListener() {},
    dispatchEvent() {},
    setInterval() {}
  };
  class MockCustomEvent { constructor(type, options) { this.type = type; this.detail = options && options.detail; } }
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, '../assets/datacraft-economy.js'), 'utf8'),
    { window, localStorage: storage, CustomEvent: MockCustomEvent, console },
    { filename: 'assets/datacraft-economy.js' }
  );

  const wallet = window.DataCraftEconomy;
  // A fresh default must not be timestamped as user progress before cloud restore.
  assert.equal(storage.getItem('datacraft-wallet-v1'), null);
  const before = wallet.getBalance();
  assert.equal(wallet.earn('test:one-time-reward', 3, 'test reward'), true);
  assert.equal(wallet.earn('test:one-time-reward', 3, 'test reward'), false);
  assert.equal(wallet.getBalance(), before + 3);
  assert.equal(wallet.getTotalEarned(), 3);
});
